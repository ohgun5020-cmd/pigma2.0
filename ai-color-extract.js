;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_COLOR_EXTRACT_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const ADOBE_TREND_DATA_URL = "https://d2ulm998byv1ft.cloudfront.net/curaredData.json";
  const ADOBE_BEHANCE_GALLERIES_URL = "https://cc-api-behance.adobe.io/v2/galleries";
  const ADOBE_STOCK_SEARCH_URL = "https://stock.adobe.io/Rest/Media/1/Search/Files";
  const ADOBE_COLOR_WEB_KEY = "ColorWeb";
  const COLOR_HUNT_FEED_URL = "https://colorhunt.co/php/feed.php";
  const ADOBE_STOCK_TOPIC_QUERIES = [
    { key: "travel", label: "Travel", query: "travel", tags: ["travel", "journey", "beach", "sky"] },
    { key: "wild", label: "Wild", query: "wildlife", tags: ["wild", "nature", "animal", "forest"] },
    { key: "flavor", label: "Flavor", query: "food", tags: ["food", "flavor", "drink", "dessert"] },
  ];
  const COLOR_HUNT_TOPIC_QUERIES = [
    { key: "popular", label: "Popular", tag: "", aliases: ["popular", "trend", "general"] },
    { key: "neon", label: "Neon", tag: "neon", aliases: ["neon", "pop", "bold", "energetic"] },
    { key: "kids", label: "Kids", tag: "kids", aliases: ["kids", "cute", "playful", "happy"] },
    { key: "food", label: "Food", tag: "food", aliases: ["food", "flavor", "warm", "appetizing"] },
    { key: "sky", label: "Sky", tag: "sky", aliases: ["sky", "travel", "airy", "bright"] },
    { key: "sea", label: "Sea", tag: "sea", aliases: ["sea", "travel", "fresh", "cool"] },
    { key: "nature", label: "Nature", tag: "nature", aliases: ["nature", "wild", "fresh", "earth"] },
    { key: "earth", label: "Earth", tag: "earth", aliases: ["earth", "natural", "organic", "warm"] },
    { key: "pastel", label: "Pastel", tag: "pastel", aliases: ["pastel", "soft", "light", "gentle"] },
    { key: "gradient", label: "Gradient", tag: "gradient", aliases: ["gradient", "ui", "digital", "modern"] },
    { key: "space", label: "Space", tag: "space", aliases: ["space", "future", "night", "cyber"] },
    { key: "sunset", label: "Sunset", tag: "sunset", aliases: ["sunset", "warm", "glow", "travel"] },
    { key: "warm", label: "Warm", tag: "warm", aliases: ["warm", "cozy", "food", "lively"] },
    { key: "cold", label: "Cold", tag: "cold", aliases: ["cold", "cool", "tech", "clean"] },
    { key: "dark", label: "Dark", tag: "dark", aliases: ["dark", "premium", "night", "dramatic"] },
    { key: "light", label: "Light", tag: "light", aliases: ["light", "soft", "minimal", "clean"] },
    { key: "retro", label: "Retro", tag: "retro", aliases: ["retro", "playful", "graphic", "vintage"] },
    { key: "vintage", label: "Vintage", tag: "vintage", aliases: ["vintage", "editorial", "muted", "classic"] },
  ];
  let isPreparing = false;
  let isApplying = false;
  let pendingSession = null;
  let adobeTrendCache = null;
  let adobeTrendCacheExpiresAt = 0;
  let colorHuntCache = null;
  let colorHuntCacheExpiresAt = 0;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isColorExtractMessage(message)) {
      if (message.type === "request-ai-color-extract-source") {
        await prepareColorExtractSource(message);
        return;
      }

      if (message.type === "apply-ai-color-extract-palette") {
        await applyColorExtractPalette(message);
        return;
      }

      if (message.type === "ai-color-extract-report-error") {
        pendingSession = null;
        notifyUiReportedError(message);
        return;
      }
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_COLOR_EXTRACT_PATCH__ = true;

  function isColorExtractMessage(message) {
    return (
      !!message &&
      (message.type === "request-ai-color-extract-source" ||
        message.type === "apply-ai-color-extract-palette" ||
        message.type === "ai-color-extract-report-error")
    );
  }

  async function prepareColorExtractSource(message) {
    if (isPreparing || isApplying) {
      postPrepareError("색상 추출이 이미 진행 중입니다.", sanitizeClientRequestId(message && message.clientRequestId));
      return;
    }

    isPreparing = true;
    pendingSession = null;

    try {
      const target = collectColorExtractTargetFromSelection();
      const bounds = getNodeBounds(target.node);
      const summary = buildSelectionSummary(target.node, bounds);
      const [adobeTrends, colorHuntPalettes] = await Promise.all([loadAdobeTrendPaletteDataset(), loadColorHuntDataset()]);
      const constraint = buildColorExtractConstraint(bounds);
      const exportOptions = {
        format: "PNG",
        useAbsoluteBounds: false,
      };

      if (constraint) {
        exportOptions.constraint = constraint;
      }

      const bytes = await target.node.exportAsync(exportOptions);
      if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
        throw new Error("선택한 화면을 이미지로 준비하지 못했습니다.");
      }

      const sessionId = buildSessionId();
      pendingSession = {
        id: sessionId,
        clientRequestId: sanitizeClientRequestId(message && message.clientRequestId),
        targetNodeId: target.node.id,
        targetNodeName: safeName(target.node),
        selectionLabel: summary.selectionLabel,
        bounds: bounds,
        summary: summary,
        operationLabel: sanitizeOperationLabel(message && message.operationLabel),
      };

      figma.ui.postMessage({
        type: "ai-color-extract-source-ready",
        sessionId: sessionId,
        clientRequestId: pendingSession.clientRequestId,
        image: {
          bytes: bytes,
          mimeType: "image/png",
          fileName: sanitizeFileName(target.node.name || "color-source") + ".png",
        },
        summary: summary,
        adobeTrends: adobeTrends,
        colorHuntPalettes: colorHuntPalettes,
      });
    } catch (error) {
      pendingSession = null;
      postPrepareError(
        normalizeErrorMessage(error, "색상 추출용 선택 이미지를 준비하지 못했습니다."),
        sanitizeClientRequestId(message && message.clientRequestId)
      );
    } finally {
      isPreparing = false;
    }
  }

  async function applyColorExtractPalette(message) {
    if (isApplying) {
      postApplyError("색상 추출 팔레트를 이미 만들고 있습니다.", sanitizeClientRequestId(message && message.clientRequestId));
      return;
    }

    isApplying = true;

    try {
      if (!pendingSession || !message || message.sessionId !== pendingSession.id) {
        throw new Error("색상 추출 세션이 만료되었습니다. 다시 실행해 주세요.");
      }

      const palette = normalizePalette(message && message.palette);
      const analysis = normalizeAnalysis(message && message.analysis);
      const targetNode = await getFreshTargetNode(pendingSession.targetNodeId);
      const anchorBounds = targetNode ? getNodeBounds(targetNode) : pendingSession.bounds;
      const origin = resolvePaletteOrigin(anchorBounds);
      const created = createPaletteNodes(palette, origin, pendingSession.selectionLabel, analysis);
      const result = {
        summary: {
          selectionLabel: pendingSession.selectionLabel,
          paletteName: created.group.name,
          swatchCount: created.swatches.length,
          columnCount: 3,
          rowCount: 5,
          domain: analysis.domain,
          brand: analysis.brand,
          intent: analysis.intent,
          confidence: analysis.confidence,
        },
        colors: palette,
        analysis: analysis,
        groupId: created.group.id,
      };

      figma.currentPage.selection = [created.group];
      figma.viewport.scrollAndZoomIntoView([created.group]);

      figma.ui.postMessage({
        type: "ai-color-extract-apply-result",
        clientRequestId: pendingSession.clientRequestId,
        result: result,
      });
      notifyApplyResult(result, pendingSession.operationLabel);
      pendingSession = null;
    } catch (error) {
      const messageText = normalizeErrorMessage(error, "색상 팔레트를 만들지 못했습니다.");
      figma.ui.postMessage({
        type: "ai-color-extract-apply-error",
        clientRequestId:
          pendingSession && pendingSession.clientRequestId
            ? pendingSession.clientRequestId
            : sanitizeClientRequestId(message && message.clientRequestId),
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2600 });
    } finally {
      isApplying = false;
    }
  }

  function collectColorExtractTargetFromSelection() {
    const selection = Array.from(figma.currentPage.selection || []).filter(Boolean);
    if (!selection.length) {
      throw new Error("색상을 추출할 프레임, 그룹, 이미지, 텍스트 중 하나를 먼저 선택해 주세요.");
    }

    if (selection.length !== 1) {
      throw new Error("색상 추출은 현재 선택 1개 기준으로 팔레트를 만듭니다. 대상을 하나만 선택해 주세요.");
    }

    const node = selection[0];
    if (node.removed || typeof node.exportAsync !== "function") {
      throw new Error("선택한 레이어는 색상 추출용 미리보기를 만들 수 없습니다.");
    }

    return {
      node: node,
    };
  }

  function buildSelectionSummary(node, bounds) {
    const textInfo = collectTextInfo(node);
    return {
      selectionLabel: safeName(node),
      targetNodeName: safeName(node),
      width: Math.round(bounds && typeof bounds.width === "number" ? bounds.width : 0),
      height: Math.round(bounds && typeof bounds.height === "number" ? bounds.height : 0),
      nodeType: safeNodeType(node),
      sourceType: resolveSourceType(node, textInfo),
      textHint: textInfo.text,
      textColors: textInfo.colors,
      textNodeCount: textInfo.count,
      childCount: countChildren(node),
    };
  }

  function resolveSourceType(node, textInfo) {
    if (node && node.type === "TEXT") {
      return "text";
    }
    if (textInfo && textInfo.text) {
      return "mixed";
    }
    return "image";
  }

  function collectTextInfo(rootNode) {
    const snippets = [];
    const colorWeights = {};
    const queue = rootNode ? [rootNode] : [];
    let textCount = 0;
    let visited = 0;
    let totalChars = 0;

    while (queue.length && visited < 160 && totalChars < 320) {
      const current = queue.shift();
      visited += 1;
      if (!current || current.removed) {
        continue;
      }

      if (current.type === "TEXT" && typeof current.characters === "string") {
        const normalized = compactText(current.characters);
        if (normalized) {
          textCount += 1;
          mergeWeightedHexes(colorWeights, extractTextFillHexes(current), Math.max(1, Math.min(normalized.length, 140)));
          const remaining = Math.max(0, 320 - totalChars);
          if (!remaining) {
            break;
          }
          const snippet = normalized.slice(0, remaining);
          snippets.push(snippet);
          totalChars += snippet.length;
        }
      }

      if ("children" in current && Array.isArray(current.children) && current.children.length) {
        for (let index = 0; index < current.children.length; index += 1) {
          queue.push(current.children[index]);
          if (queue.length > 240) {
            break;
          }
        }
      }
    }

    return {
      text: snippets.join(" | "),
      count: textCount,
      colors: listWeightedHexes(colorWeights, 6),
    };
  }

  function extractTextFillHexes(node) {
    if (!node || !Array.isArray(node.fills)) {
      return [];
    }

    const hexes = [];
    const seen = {};
    for (let index = 0; index < node.fills.length; index += 1) {
      const paint = node.fills[index];
      if (!paint || paint.visible === false || paint.type !== "SOLID" || !paint.color) {
        continue;
      }
      const hex = rgbUnitToHex(paint.color);
      if (!hex || seen[hex]) {
        continue;
      }
      seen[hex] = true;
      hexes.push(hex);
      if (hexes.length >= 4) {
        break;
      }
    }

    return hexes;
  }

  function mergeWeightedHexes(store, hexes, weight) {
    if (!store || typeof store !== "object" || !Array.isArray(hexes) || !hexes.length) {
      return;
    }

    const safeWeight = Number.isFinite(Number(weight)) ? Number(weight) : 1;
    for (let index = 0; index < hexes.length; index += 1) {
      const hex = normalizeHexColor(hexes[index]);
      if (!hex) {
        continue;
      }
      store[hex] = (store[hex] || 0) + safeWeight;
    }
  }

  function listWeightedHexes(store, limit) {
    if (!store || typeof store !== "object") {
      return [];
    }

    return Object.keys(store)
      .sort((first, second) => {
        const weightGap = (store[second] || 0) - (store[first] || 0);
        if (weightGap !== 0) {
          return weightGap;
        }
        return first.localeCompare(second);
      })
      .slice(0, Math.max(0, Number(limit) || 0));
  }

  function countChildren(node) {
    if (node && "children" in node && Array.isArray(node.children)) {
      return node.children.length;
    }
    return 0;
  }

  function safeNodeType(node) {
    if (node && typeof node.type === "string" && node.type.trim()) {
      return node.type.trim();
    }
    return "UNKNOWN";
  }

  function buildColorExtractConstraint(bounds) {
    const width = bounds && typeof bounds.width === "number" && Number.isFinite(bounds.width) ? Math.max(1, bounds.width) : 0;
    const height =
      bounds && typeof bounds.height === "number" && Number.isFinite(bounds.height) ? Math.max(1, bounds.height) : 0;
    const longest = Math.max(width, height);
    if (!(longest > 1600)) {
      return null;
    }

    return width >= height
      ? {
          type: "WIDTH",
          value: 1600,
        }
      : {
          type: "HEIGHT",
          value: 1600,
        };
  }

  async function getFreshTargetNode(nodeId) {
    if (!(typeof nodeId === "string" && nodeId)) {
      return null;
    }

    if (typeof figma.getNodeByIdAsync === "function") {
      try {
        return await figma.getNodeByIdAsync(nodeId);
      } catch (error) {
        return null;
      }
    }

    try {
      return figma.getNodeById(nodeId);
    } catch (error) {
      return null;
    }
  }

  function getNodeBounds(node) {
    if (node && "absoluteRenderBounds" in node && node.absoluteRenderBounds) {
      return cloneBounds(node.absoluteRenderBounds);
    }

    if (node && "absoluteBoundingBox" in node && node.absoluteBoundingBox) {
      return cloneBounds(node.absoluteBoundingBox);
    }

    if (
      node &&
      typeof node.x === "number" &&
      typeof node.y === "number" &&
      typeof node.width === "number" &&
      typeof node.height === "number"
    ) {
      return {
        x: node.x,
        y: node.y,
        width: Math.max(1, node.width),
        height: Math.max(1, node.height),
      };
    }

    return {
      x: figma.viewport.center.x,
      y: figma.viewport.center.y,
      width: 1,
      height: 1,
    };
  }

  function cloneBounds(bounds) {
    return {
      x: typeof bounds.x === "number" ? bounds.x : 0,
      y: typeof bounds.y === "number" ? bounds.y : 0,
      width: typeof bounds.width === "number" ? Math.max(1, bounds.width) : 1,
      height: typeof bounds.height === "number" ? Math.max(1, bounds.height) : 1,
    };
  }

  function resolvePaletteOrigin(bounds) {
    const baseX = bounds && typeof bounds.x === "number" ? bounds.x : figma.viewport.center.x;
    const baseY = bounds && typeof bounds.y === "number" ? bounds.y : figma.viewport.center.y;
    const width = bounds && typeof bounds.width === "number" ? bounds.width : 0;

    return {
      x: Math.round(baseX + width + 80),
      y: Math.round(baseY),
    };
  }

  function createPaletteNodes(palette, origin, selectionLabel, analysis) {
    const cellSize = 92;
    const gap = 12;
    const rowLabels = [
      "\uB300\uD45C\uC0C9",
      "\uC5B4\uC6B8\uB9AC\uB294 \uC0C9",
      "\uD3EC\uC778\uD2B8 \uC0C9",
      "\uD14D\uC2A4\uD2B8 \uC5ED\uD560\uC0C9",
      "\uADF8\uB77C\uB370\uC774\uC158 \uC0C9",
    ];
    const accentLabels = [
      "\uD3EC\uC778\uD2B8 \uC0C9 1",
      "\uD3EC\uC778\uD2B8 \uC0C9 2",
      "\uD3EC\uC778\uD2B8 \uC0C9 3",
    ];
    const textRoleLabels = ["\uD14D\uC2A4\uD2B8 \uC8FC\uC870\uC0C9", "\uD14D\uC2A4\uD2B8 \uD558\uC774\uB77C\uC774\uD2B8", "\uD14D\uC2A4\uD2B8 \uC11C\uBE0C\uC0C9"];
    const gradientLabels = [
      "\uADF8\uB77C\uB370\uC774\uC158 \uC138\uD2B8 1",
      "\uADF8\uB77C\uB370\uC774\uC158 \uC138\uD2B8 2",
      "\uADF8\uB77C\uB370\uC774\uC158 \uC138\uD2B8 3",
    ];
    const swatches = [];
    const colors = [palette.representative, palette.companions, palette.accents, palette.text, palette.surfaces];

    for (let rowIndex = 0; rowIndex < colors.length; rowIndex += 1) {
      const row = colors[rowIndex];
      for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
        const hex = row[columnIndex];
        const rectangle = figma.createRectangle();
        rectangle.x = origin.x + columnIndex * (cellSize + gap);
        rectangle.y = origin.y + rowIndex * (cellSize + gap);
        rectangle.resize(cellSize, cellSize);
        rectangle.cornerRadius = 14;
        const swatchLabel = getPaletteSwatchLabel(rowIndex, columnIndex, rowLabels, accentLabels, textRoleLabels, gradientLabels);
        const swatchValue = getPaletteSwatchValue(rowIndex, columnIndex, palette);
        rectangle.name = swatchLabel + " \u00B7 " + swatchValue;
        rectangle.fills = rowIndex === 4 ? [buildGradientSwatchPaint(palette, columnIndex)] : [solidPaintFromHex(hex, 1)];
        rectangle.strokes = [solidPaintFromHex("#111827", 0.14)];
        rectangle.strokeWeight = 1;
        swatches.push(rectangle);
      }
    }

    const group = figma.group(swatches, figma.currentPage);
    group.name = buildPaletteName(selectionLabel);

    if (analysis && typeof group.setPluginData === "function") {
      try {
        group.setPluginData(
          "ai-color-extract-analysis",
          JSON.stringify({
            sourceType: analysis.sourceType,
            domain: analysis.domain,
            brand: analysis.brand,
            intent: analysis.intent,
            tone: analysis.tone,
            confidence: analysis.confidence,
            reason: analysis.reason,
          })
        );
      } catch (error) {}
    }

    return {
      group: group,
      swatches: swatches,
    };
  }

  function getPaletteSwatchLabel(rowIndex, columnIndex, rowLabels, accentLabels, textRoleLabels, gradientLabels) {
    if (rowIndex === 2) {
      return accentLabels[columnIndex] || rowLabels[rowIndex] + " " + (columnIndex + 1);
    }
    if (rowIndex === 3) {
      return textRoleLabels[columnIndex] || rowLabels[rowIndex] + " " + (columnIndex + 1);
    }
    if (rowIndex === 4) {
      return gradientLabels[columnIndex] || rowLabels[rowIndex] + " " + (columnIndex + 1);
    }
    return rowLabels[rowIndex] + " " + (columnIndex + 1);
  }

  function getPaletteSwatchValue(rowIndex, columnIndex, palette) {
    if (rowIndex === 4) {
      return buildGradientSwatchColorLabel(palette, columnIndex);
    }

    const rows = [palette.representative, palette.companions, palette.accents, palette.text, palette.surfaces];
    const row = Array.isArray(rows[rowIndex]) ? rows[rowIndex] : [];
    return row[columnIndex] || "#000000";
  }

  function buildPaletteName(selectionLabel) {
    const base = typeof selectionLabel === "string" && selectionLabel.trim() ? selectionLabel.trim() : "선택";
    return base + " 색상 추출 팔레트";
  }

  function solidPaintFromHex(hex, opacity) {
    const rgb = hexToRgb(hex);
    return {
      type: "SOLID",
      color: {
        r: rgb.r / 255,
        g: rgb.g / 255,
        b: rgb.b / 255,
      },
      opacity: typeof opacity === "number" ? Math.max(0, Math.min(1, opacity)) : 1,
    };
  }

  function buildGradientSwatchPaint(palette, index) {
    const colors = resolveGradientSwatchColors(palette, index);
    return {
      type: "GRADIENT_LINEAR",
      gradientTransform: [
        [1, 0, 0],
        [0, 1, 0],
      ],
      gradientStops: colors.map((hex, stopIndex) => ({
        position: stopIndex / (colors.length - 1),
        color: rgbaFromHex(hex, 1),
      })),
      opacity: 1,
    };
  }

  function buildGradientSwatchColorLabel(palette, index) {
    return resolveGradientSwatchColors(palette, index).join(" -> ");
  }

  function resolveGradientSwatchColors(palette, index) {
    const representative = palette && Array.isArray(palette.representative) ? palette.representative[index] : null;
    const companion = palette && Array.isArray(palette.companions) ? palette.companions[index] : null;
    const accent = palette && Array.isArray(palette.accents) ? palette.accents[index] : null;
    const surface = palette && Array.isArray(palette.surfaces) ? palette.surfaces[index] : null;
    const baseHex = normalizeHexColor(representative) || normalizeHexColor(companion) || "#2563EB";
    const supportHex = normalizeHexColor(companion) || mixHex(baseHex, "#FFFFFF", 0.32);
    const accentHex = normalizeHexColor(accent) || mixHex(supportHex, "#FFFFFF", 0.16);
    const softHex = normalizeHexColor(surface) || mixHex(baseHex, "#FFFFFF", 0.72);
    return [softHex, mixHex(baseHex, supportHex, 0.42), accentHex];
  }

  function rgbaFromHex(hex, opacity) {
    const rgb = hexToRgb(hex);
    return {
      r: rgb.r / 255,
      g: rgb.g / 255,
      b: rgb.b / 255,
      a: typeof opacity === "number" ? Math.max(0, Math.min(1, opacity)) : 1,
    };
  }

  function normalizePalette(value) {
    const source = value && typeof value === "object" ? value : {};
    const representative = normalizePaletteRow(source.representative, ["#2563EB", "#7C3AED", "#F97316"]);
    const companions = normalizePaletteRow(source.companions, ["#0EA5E9", "#EC4899", "#F59E0B"]);
    const accents = hasCompletePaletteRow(source.accents)
      ? normalizePaletteRow(source.accents, ["#EC4899", "#22C55E", "#FACC15"])
      : buildDerivedAccentRow(representative, companions);
    const text = normalizePaletteRow(source.text, ["#0F172A", "#2563EB", "#64748B"]);
    const surfaces = hasCompletePaletteRow(source.surfaces)
      ? normalizePaletteRow(source.surfaces, ["#E0F2FE", "#F5D0FE", "#FEF3C7"])
      : buildDerivedSurfaceRow(representative, companions, accents);
    return {
      representative: representative,
      companions: companions,
      accents: accents,
      text: text,
      surfaces: surfaces,
    };
  }

  function hasCompletePaletteRow(value) {
    return Array.isArray(value) && value.length >= 3 && value.slice(0, 3).every((item) => !!normalizeHexColor(item));
  }

  function normalizePaletteRow(value, fallback) {
    const list = Array.isArray(value) ? value : [];
    const normalized = [];

    for (let index = 0; index < 3; index += 1) {
      const hex = normalizeHexColor(list[index]);
      normalized.push(hex || fallback[index]);
    }

    return normalized;
  }

  function buildDerivedAccentRow(representative, companions) {
    const hueShifts = [138, -124, 72];
    const row = [];
    for (let index = 0; index < 3; index += 1) {
      const baseHex = companions[index] || representative[index] || "#4F46E5";
      const base = rgbBytesToHsl(hexToRgb(baseHex));
      row.push(
        hslByteToHex(
          normalizeHue(base.h + hueShifts[index % hueShifts.length]),
          clampNumber(base.s < 0.22 ? 0.62 : base.s * 0.82 + 0.12, 0.48, 0.88),
          clampNumber(base.l < 0.25 ? 0.52 : base.l > 0.72 ? 0.58 : base.l, 0.38, 0.68)
        )
      );
    }
    return row;
  }

  function buildDerivedSurfaceRow(representative, companions, accents) {
    const row = [];
    for (let index = 0; index < 3; index += 1) {
      const first = companions[index] || representative[index] || "#DCEBFF";
      const second = accents[index] || representative[index] || "#FFFFFF";
      row.push(mixHex(mixHex(first, "#FFFFFF", 0.78), second, 0.1));
    }
    return row;
  }

  function mixHex(firstHex, secondHex, amount) {
    const first = hexToRgb(firstHex);
    const second = hexToRgb(secondHex);
    const ratio = typeof amount === "number" ? Math.max(0, Math.min(1, amount)) : 0.5;
    return rgbByteToHex(
      first.r + (second.r - first.r) * ratio,
      first.g + (second.g - first.g) * ratio,
      first.b + (second.b - first.b) * ratio
    );
  }

  function clampNumber(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return min;
    }
    return Math.max(min, Math.min(max, number));
  }

  function normalizeHue(value) {
    const number = Number(value) || 0;
    return ((number % 360) + 360) % 360;
  }

  function normalizeAnalysis(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      sourceType: normalizeAnalysisField(source.sourceType, "image", 32),
      domain: normalizeAnalysisField(source.domain, "general", 48),
      brand: normalizeAnalysisField(source.brand, "none", 48),
      intent: normalizeAnalysisField(source.intent, "ui", 32),
      tone: normalizeToneList(source.tone),
      confidence: normalizeConfidence(source.confidence),
      reason: normalizeAnalysisField(source.reason, "", 220),
    };
  }

  function normalizeAnalysisField(value, fallback, maxLength) {
    const text = compactText(value);
    if (!text) {
      return fallback;
    }
    return text.slice(0, Math.max(1, maxLength || 48));
  }

  function normalizeToneList(value) {
    const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[|,]/) : [];
    const seen = {};
    const normalized = [];

    for (let index = 0; index < source.length; index += 1) {
      const entry = compactText(source[index]);
      if (!entry) {
        continue;
      }
      const key = entry.toLowerCase();
      if (seen[key]) {
        continue;
      }
      seen[key] = true;
      normalized.push(entry.slice(0, 32));
      if (normalized.length >= 3) {
        break;
      }
    }

    return normalized;
  }

  function normalizeConfidence(value) {
    const text = compactText(value).toLowerCase();
    if (text === "high" || text === "medium" || text === "low") {
      return text;
    }
    if (/높/.test(text)) {
      return "high";
    }
    if (/낮/.test(text)) {
      return "low";
    }
    return "medium";
  }

  function normalizeHexColor(value) {
    const text = typeof value === "string" ? value.replace(/\s+/g, "").trim().toUpperCase() : "";
    if (/^#[0-9A-F]{6}$/.test(text)) {
      return text;
    }
    return "";
  }

  async function loadAdobeTrendPaletteDataset() {
    if (Array.isArray(adobeTrendCache) && adobeTrendCache.length && adobeTrendCacheExpiresAt > Date.now()) {
      return adobeTrendCache;
    }

    try {
      const [curated, live] = await Promise.all([loadAdobeCuratedTrendDataset(), loadAdobeLiveTrendDataset()]);
      const normalized = mergeAdobeTrendRecords([].concat(curated, live));
      if (normalized.length) {
        adobeTrendCache = normalized;
        adobeTrendCacheExpiresAt = Date.now() + 1000 * 60 * 60 * 6;
      }
      return normalized;
    } catch (error) {
      console.warn("[pigma] adobe trend palette feed unavailable:", error);
      return Array.isArray(adobeTrendCache) ? adobeTrendCache : [];
    }
  }

  async function loadAdobeCuratedTrendDataset() {
    const response = await fetch(ADOBE_TREND_DATA_URL);
    if (!response || !response.ok) {
      throw new Error("Adobe trend palette feed was unavailable.");
    }
    const data = await response.json();
    return normalizeAdobeTrendPaletteDataset(data);
  }

  async function loadAdobeLiveTrendDataset() {
    const [behance, stock] = await Promise.all([
      loadAdobeBehanceTrendDataset().catch((error) => {
        console.warn("[pigma] adobe behance trend feed unavailable:", error);
        return [];
      }),
      loadAdobeStockTrendDataset().catch((error) => {
        console.warn("[pigma] adobe stock trend feed unavailable:", error);
        return [];
      }),
    ]);

    return mergeAdobeTrendRecords([].concat(behance, stock));
  }

  async function loadColorHuntDataset() {
    if (Array.isArray(colorHuntCache) && colorHuntCache.length && colorHuntCacheExpiresAt > Date.now()) {
      return colorHuntCache;
    }

    try {
      const batches = await Promise.all(
        COLOR_HUNT_TOPIC_QUERIES.map((topic) =>
          fetchColorHuntTopic(topic).catch((error) => {
            console.warn("[pigma] colorhunt topic unavailable:", topic && topic.key, error);
            return [];
          })
        )
      );
      const normalized = mergeAdobeTrendRecords(batches.flat());
      if (normalized.length) {
        colorHuntCache = normalized;
        colorHuntCacheExpiresAt = Date.now() + 1000 * 60 * 60 * 6;
      }
      return normalized;
    } catch (error) {
      console.warn("[pigma] colorhunt palette feed unavailable:", error);
      return Array.isArray(colorHuntCache) ? colorHuntCache : [];
    }
  }

  async function fetchColorHuntTopic(topic) {
    const body = new URLSearchParams();
    body.set("step", "0");
    body.set("sort", "popular");
    body.set("tags", topic && topic.tag ? topic.tag : "");
    body.set("timeframe", "365");

    const response = await fetch(COLOR_HUNT_FEED_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: body.toString(),
    });
    if (!response || !response.ok) {
      throw new Error(`ColorHunt topic ${topic && topic.key ? topic.key : "popular"} was unavailable.`);
    }

    const data = await response.json();
    return normalizeColorHuntFeedEntries(data, topic);
  }

  function normalizeColorHuntFeedEntries(entries, topic) {
    const source = Array.isArray(entries) ? entries : [];
    const normalized = [];

    for (let index = 0; index < Math.min(source.length, 18); index += 1) {
      const entry = source[index] && typeof source[index] === "object" ? source[index] : {};
      const code = compactText(entry.code).toUpperCase();
      const swatches = splitColorHuntCode(code);
      if (swatches.length < 4) {
        continue;
      }

      normalized.push({
        id: clipText(`${topic && topic.key ? topic.key : "popular"}-${code}`, 32),
        name: clipText(`${topic && topic.label ? topic.label : "Popular"} Palette ${index + 1}`, 96),
        source: "COLORHUNT",
        href: clipText(`https://colorhunt.co/palette/${code.toLowerCase()}`, 180),
        tags: []
          .concat(topic && Array.isArray(topic.aliases) ? topic.aliases : [])
          .concat([topic && topic.label, topic && topic.tag, entry.date])
          .map((tag) => clipText(tag, 48))
          .filter(Boolean)
          .slice(0, 18),
        swatches: swatches,
        categoryKey: clipText(topic && topic.key, 48).toLowerCase(),
        thumbnailUrl: "",
        likes: Number(entry.likes) || 0,
      });
    }

    return normalized;
  }

  function splitColorHuntCode(code) {
    const text = typeof code === "string" ? code.replace(/[^0-9A-F]/gi, "").toUpperCase() : "";
    const swatches = [];

    for (let index = 0; index + 6 <= text.length; index += 6) {
      const hex = normalizeHexColor("#" + text.slice(index, index + 6));
      if (!hex) {
        continue;
      }
      swatches.push(hex);
    }

    return swatches.slice(0, 4);
  }

  function normalizeAdobeTrendPaletteDataset(value) {
    const files = value && Array.isArray(value.files) ? value.files : [];
    const normalized = [];

    for (let index = 0; index < files.length; index += 1) {
      const entry = normalizeAdobeTrendPaletteEntry(files[index]);
      if (entry) {
        normalized.push(entry);
      }
    }

    return normalized.slice(0, 180);
  }

  function normalizeAdobeTrendPaletteEntry(value) {
    const source = value && typeof value === "object" ? value : {};
    const swatches = Array.isArray(source.swatches)
      ? source.swatches
          .map((swatch) => {
            const hex = normalizeHexColor("#" + compactText(swatch && swatch.hex));
            return hex || "";
          })
          .filter(Boolean)
          .slice(0, 5)
      : [];
    if (swatches.length < 3) {
      return null;
    }

    const tags = Array.isArray(source.tags)
      ? source.tags
          .map((tag) => clipText(tag && typeof tag === "object" ? tag.value : tag, 48))
          .filter(Boolean)
          .slice(0, 18)
      : [];

    return {
      id: clipText(source.id, 32),
      name: clipText(source.name, 96),
      source: clipText(source.source, 24).toUpperCase(),
      href: clipText(source.href, 180),
      tags: tags,
      swatches: swatches,
      categoryKey: "",
      thumbnailUrl: "",
    };
  }

  async function loadAdobeBehanceTrendDataset() {
    const response = await fetch(ADOBE_BEHANCE_GALLERIES_URL, {
      headers: {
        "x-api-key": ADOBE_COLOR_WEB_KEY,
      },
    });
    if (!response || !response.ok) {
      throw new Error("Adobe Behance galleries were unavailable.");
    }

    const data = await response.json();
    const categories = data && Array.isArray(data.categories) ? data.categories : [];
    const normalized = [];

    for (let index = 0; index < categories.length; index += 1) {
      const category = categories[index];
      const records = normalizeAdobeBehanceCategory(category);
      for (let recordIndex = 0; recordIndex < records.length; recordIndex += 1) {
        normalized.push(records[recordIndex]);
      }
    }

    return normalized.slice(0, 72);
  }

  function normalizeAdobeBehanceCategory(value) {
    const source = value && typeof value === "object" ? value : {};
    const projects = Array.isArray(source.latest_projects) ? source.latest_projects : [];
    const records = [];
    const categoryKey = clipText(source.slug, 48).toLowerCase();
    const categoryLabel = clipText(source.label || source.label_en, 48);

    for (let index = 0; index < Math.min(projects.length, 4); index += 1) {
      const project = projects[index] && typeof projects[index] === "object" ? projects[index] : {};
      const tags = [];
      appendAdobeTrendTag(tags, categoryLabel);
      appendAdobeTrendTag(tags, categoryKey);
      const fieldLinks = Array.isArray(project.field_links) ? project.field_links : [];
      for (let fieldIndex = 0; fieldIndex < fieldLinks.length; fieldIndex += 1) {
        appendAdobeTrendTag(tags, fieldLinks[fieldIndex] && fieldLinks[fieldIndex].name);
      }
      const fields = Array.isArray(project.fields) ? project.fields : [];
      for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex += 1) {
        appendAdobeTrendTag(tags, fields[fieldIndex] && fields[fieldIndex].name);
      }

      const colorHexes = Array.isArray(project.colors)
        ? project.colors
            .map((color) => rgbUnitToHex({
              r: Number(color && color.r) / 255,
              g: Number(color && color.g) / 255,
              b: Number(color && color.b) / 255,
            }))
            .filter(Boolean)
            .slice(0, 3)
        : [];

      records.push({
        id: clipText(project.id || `${categoryKey}-${index}`, 32),
        name: clipText(project.name, 96),
        source: "BEHANCE",
        href: clipText(project.url || source.url, 180),
        tags: tags.slice(0, 18),
        swatches: colorHexes,
        categoryKey: categoryKey,
        thumbnailUrl: clipText(resolveBehanceProjectThumbnailUrl(project), 240),
      });
    }

    return records.filter((record) => record.thumbnailUrl || record.swatches.length >= 1);
  }

  function resolveBehanceProjectThumbnailUrl(project) {
    const covers = project && typeof project === "object" && project.covers && typeof project.covers === "object" ? project.covers : {};
    return (
      covers["404_webp"] ||
      covers["404"] ||
      covers["202_webp"] ||
      covers["202"] ||
      covers["230_webp"] ||
      covers["230"] ||
      covers["original_webp"] ||
      covers["original"] ||
      ""
    );
  }

  async function loadAdobeStockTrendDataset() {
    const batches = await Promise.all(
      ADOBE_STOCK_TOPIC_QUERIES.map((topic) =>
        fetchAdobeStockTopic(topic).catch((error) => {
          console.warn("[pigma] adobe stock topic unavailable:", topic && topic.key, error);
          return [];
        })
      )
    );
    return mergeAdobeTrendRecords(batches.flat());
  }

  async function fetchAdobeStockTopic(topic) {
    const search = new URLSearchParams();
    search.append("search_parameters[words]", topic.query);
    search.append("search_parameters[limit]", "10");
    search.append("search_parameters[order]", "relevance");
    const response = await fetch(`${ADOBE_STOCK_SEARCH_URL}?${search.toString()}`, {
      headers: {
        "x-api-key": ADOBE_COLOR_WEB_KEY,
        "X-Product": "Color",
        "X-Product-Location": "Color Website",
      },
    });
    if (!response || !response.ok) {
      throw new Error(`Adobe Stock topic ${topic.key} was unavailable.`);
    }

    const data = await response.json();
    const files = data && Array.isArray(data.files) ? data.files : [];
    const normalized = [];

    for (let index = 0; index < Math.min(files.length, 8); index += 1) {
      const file = files[index] && typeof files[index] === "object" ? files[index] : {};
      const tags = []
        .concat(Array.isArray(topic.tags) ? topic.tags : [])
        .concat([
          topic.label,
          file.category && file.category.name,
          file.creator_name,
        ]);

      normalized.push({
        id: clipText(file.id || `${topic.key}-${index}`, 32),
        name: clipText(file.title, 96),
        source: "STOCK",
        href: "",
        tags: tags.map((tag) => clipText(tag, 48)).filter(Boolean).slice(0, 18),
        swatches: [],
        categoryKey: topic.key,
        thumbnailUrl: clipText(file.thumbnail_url, 240),
      });
    }

    return normalized.filter((record) => record.thumbnailUrl);
  }

  function mergeAdobeTrendRecords(records) {
    const source = Array.isArray(records) ? records : [];
    const merged = [];
    const seen = {};

    for (let index = 0; index < source.length; index += 1) {
      const record = normalizeAdobeTrendLiveEntry(source[index]);
      if (!record) {
        continue;
      }
      const key = [record.source, record.id, record.href, record.thumbnailUrl].filter(Boolean).join("::");
      if (!key || seen[key]) {
        continue;
      }
      seen[key] = true;
      merged.push(record);
    }

    return merged.slice(0, 220);
  }

  function normalizeAdobeTrendLiveEntry(value) {
    const source = value && typeof value === "object" ? value : {};
    const swatches = Array.isArray(source.swatches)
      ? source.swatches.map((swatch) => normalizeHexColor(swatch)).filter(Boolean).slice(0, 7)
      : [];
    const thumbnailUrl = clipText(source.thumbnailUrl, 240);
    if (swatches.length < 3 && !thumbnailUrl) {
      return null;
    }

    const tags = Array.isArray(source.tags)
      ? source.tags.map((tag) => clipText(tag, 48)).filter(Boolean).slice(0, 18)
      : [];

    return {
      id: clipText(source.id, 32),
      name: clipText(source.name, 96),
      source: clipText(source.source, 24).toUpperCase(),
      href: clipText(source.href, 180),
      tags: tags,
      swatches: swatches,
      categoryKey: clipText(source.categoryKey, 48).toLowerCase(),
      thumbnailUrl: thumbnailUrl,
    };
  }

  function appendAdobeTrendTag(tags, value) {
    const text = clipText(value, 48);
    if (!text) {
      return;
    }
    const list = Array.isArray(tags) ? tags : [];
    const key = text.toLowerCase();
    for (let index = 0; index < list.length; index += 1) {
      if (clipText(list[index], 48).toLowerCase() === key) {
        return;
      }
    }
    list.push(text);
  }

  function rgbUnitToHex(color) {
    if (!color || typeof color !== "object") {
      return "";
    }
    return rgbToHex(color.r, color.g, color.b);
  }

  function rgbToHex(red, green, blue) {
    const toHex = (value) => {
      const channel = Math.max(0, Math.min(255, Math.round(Number(value) * 255)));
      return channel.toString(16).padStart(2, "0").toUpperCase();
    };
    return "#" + toHex(red) + toHex(green) + toHex(blue);
  }

  function rgbByteToHex(red, green, blue) {
    const toHex = (value) => Math.max(0, Math.min(255, Math.round(Number(value) || 0))).toString(16).padStart(2, "0").toUpperCase();
    return "#" + toHex(red) + toHex(green) + toHex(blue);
  }

  function rgbBytesToHsl(rgb) {
    const red = clampNumber(rgb && rgb.r, 0, 255) / 255;
    const green = clampNumber(rgb && rgb.g, 0, 255) / 255;
    const blue = clampNumber(rgb && rgb.b, 0, 255) / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const lightness = (max + min) / 2;
    const delta = max - min;
    let hue = 0;
    let saturation = 0;

    if (delta > 0) {
      saturation = delta / (1 - Math.abs(2 * lightness - 1));
      switch (max) {
        case red:
          hue = ((green - blue) / delta) % 6;
          break;
        case green:
          hue = (blue - red) / delta + 2;
          break;
        default:
          hue = (red - green) / delta + 4;
          break;
      }
      hue *= 60;
    }

    return {
      h: normalizeHue(hue),
      s: clampNumber(saturation, 0, 1),
      l: clampNumber(lightness, 0, 1),
    };
  }

  function hslByteToHex(hue, saturation, lightness) {
    const normalizedHue = normalizeHue(hue);
    const normalizedSaturation = clampNumber(saturation, 0, 1);
    const normalizedLightness = clampNumber(lightness, 0, 1);
    const chroma = (1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation;
    const x = chroma * (1 - Math.abs(((normalizedHue / 60) % 2) - 1));
    const match = normalizedLightness - chroma / 2;
    let red = 0;
    let green = 0;
    let blue = 0;

    if (normalizedHue < 60) {
      red = chroma;
      green = x;
    } else if (normalizedHue < 120) {
      red = x;
      green = chroma;
    } else if (normalizedHue < 180) {
      green = chroma;
      blue = x;
    } else if (normalizedHue < 240) {
      green = x;
      blue = chroma;
    } else if (normalizedHue < 300) {
      red = x;
      blue = chroma;
    } else {
      red = chroma;
      blue = x;
    }

    return rgbByteToHex((red + match) * 255, (green + match) * 255, (blue + match) * 255);
  }

  function hexToRgb(hex) {
    const normalized = normalizeHexColor(hex) || "#000000";
    return {
      r: parseInt(normalized.slice(1, 3), 16),
      g: parseInt(normalized.slice(3, 5), 16),
      b: parseInt(normalized.slice(5, 7), 16),
    };
  }

  function notifyApplyResult(result, operationLabel) {
    const summary = result && result.summary ? result.summary : {};
    const swatchCount =
      typeof summary.swatchCount === "number" && Number.isFinite(summary.swatchCount) ? summary.swatchCount : 0;

    if (!swatchCount) {
      figma.notify("색상 추출 결과가 비어 있습니다.", { timeout: 2200 });
      return;
    }

    const note = buildAnalysisNote(summary);
    figma.notify((operationLabel || "색상 추출") + " 완료 (" + swatchCount + "칸 팔레트 생성" + note + ")", { timeout: 2600 });
  }

  function buildAnalysisNote(summary) {
    const parts = [];

    if (summary && typeof summary.domain === "string" && summary.domain && summary.domain !== "general") {
      parts.push(summary.domain);
    }
    if (summary && typeof summary.brand === "string" && summary.brand && summary.brand !== "none" && summary.brand !== "unknown") {
      parts.push(summary.brand);
    }
    if (summary && typeof summary.intent === "string" && summary.intent && summary.intent !== "ui") {
      parts.push(summary.intent);
    }

    if (!parts.length) {
      return "";
    }

    return ", 감지: " + parts.slice(0, 3).join(" / ");
  }

  function postPrepareError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "ai-color-extract-source-error",
      clientRequestId: clientRequestId,
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2400 });
  }

  function postApplyError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "ai-color-extract-apply-error",
      clientRequestId: clientRequestId,
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2400 });
  }

  function notifyUiReportedError(message) {
    const text = normalizeErrorMessage(
      message && message.message ? message.message : "",
      "색상 추출 중 브라우저 분석 단계에서 문제가 발생했습니다."
    );
    figma.notify(text, { error: true, timeout: 2400 });
  }

  function sanitizeClientRequestId(value) {
    const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    return text || "";
  }

  function sanitizeOperationLabel(value) {
    const label = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    return label || "색상 추출";
  }

  function sanitizeFileName(value) {
    const source = typeof value === "string" && value ? value : "color-source";
    const trimmed = source.replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim();
    return trimmed ? trimmed.slice(0, 80) : "color-source";
  }

  function buildSessionId() {
    return "ai-color-extract-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function safeName(node) {
    if (node && typeof node.name === "string" && node.name.trim()) {
      return node.name.trim();
    }

    if (node && typeof node.type === "string" && node.type.trim()) {
      return node.type.trim();
    }

    return "Unnamed";
  }

  function compactText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function clipText(value, maxLength) {
    const text = compactText(value);
    if (!text) {
      return "";
    }
    const limit = Number.isFinite(Number(maxLength)) ? Number(maxLength) : 0;
    if (!(limit > 0) || text.length <= limit) {
      return text;
    }
    return text.slice(0, Math.max(1, limit)).trim();
  }

  function normalizeErrorMessage(error, fallback) {
    if (error && typeof error === "object" && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }

    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }

    return fallback;
  }
})();
