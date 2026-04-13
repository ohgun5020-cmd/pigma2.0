;(()=>{
  // PIGMA_TEXT_IMPORT_GUARD::SOURCE_OF_TRUTH
  // Keep PSD import text guard rules in this file so rebuilds do not depend on
  // ad-hoc edits inside the generated runtime bundle.
  // PIGMA_TEXT_IMPORT_GUARD::BROAD_TEXT_UPDATES_DISABLED_IN_BUNDLE
  // PIGMA_TEXT_IMPORT_GUARD::SOURCE_ID_MATCHING
  // PIGMA_TEXT_IMPORT_GUARD::SOURCE_ID_TAGGING
  const originalOnMessage = figma.ui.onmessage;
  const DEFAULT_BATCH_FRAME_GAP = 10;
  const IMPORT_SOURCE_ID_KEY = "__pigmaImportSourceId";
  const IMPORT_SYNTHETIC_ROOT_KEY = "__pigmaSyntheticImportRoot";
  const IMPORT_POSTPROCESS_DEBUG = true;
  const SVG_IMPORT_BATCH_ROOT_NAME = "SVG Import";
  let availableFontsPromise = null;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async message => {
    if (isSvgImportMessage(message)) {
      return handleSvgImportMessage(message);
    }

    if (!isImportMessage(message)) {
      return originalOnMessage(message);
    }

    await prepareImportPayload(message);
    await originalOnMessage(message);

    try {
      await Promise.resolve();
      if (message.type === "request-import") {
        fixSingleImport(message.payload, getSelectedImportRoot());
      } else {
        fixBatchImport(message.batch, getSelectedImportRoot());
      }
    } catch (error) {
      console.warn("[pigma-import-text-fix]", error);
    }
  };

  function isImportMessage(message) {
    return !!message && (message.type === "request-import" || message.type === "request-import-batch");
  }

  function isSvgImportMessage(message) {
    return !!message && (message.type === "request-svg-import" || message.type === "request-svg-import-batch");
  }

  async function handleSvgImportMessage(message) {
    const batch = normalizeSvgImportBatch(message);
    if (!batch || batch.items.length === 0) {
      figma.notify("가져올 SVG 파일이 없습니다.", { error: true });
      return;
    }

    const targetPage = await resolveSvgImportPage(batch);
    if (targetPage !== figma.currentPage) {
      await figma.setCurrentPageAsync(targetPage);
    }

    try {
      const importedNodes = [];
      for (const item of batch.items) {
        importedNodes.push(await importSvgPayload(item));
      }

      layoutImportedSvgNodes(importedNodes, batch.gap, figma.viewport.center);
      figma.currentPage.selection = importedNodes;
      figma.viewport.scrollAndZoomIntoView(importedNodes);
      figma.notify(
        importedNodes.length > 1
          ? `SVG ${importedNodes.length}개를 가져왔습니다.`
          : "SVG를 가져왔습니다."
      );
    } catch (error) {
      console.warn("[pigma-svg-import]", error);
      figma.notify(getSvgImportErrorMessage(error), { error: true });
    }
  }

  function normalizeSvgImportBatch(message) {
    if (message && message.type === "request-svg-import" && message.payload) {
      return {
        placement: normalizeSvgPlacement(message.payload.placement),
        gap: DEFAULT_BATCH_FRAME_GAP,
        rootName: normalizeSvgName(message.payload.rootName || SVG_IMPORT_BATCH_ROOT_NAME),
        items: [message.payload],
      };
    }

    if (!message || message.type !== "request-svg-import-batch" || !message.batch) {
      return null;
    }

    return {
      placement: normalizeSvgPlacement(message.batch.placement),
      gap: normalizeSvgGap(message.batch.gap),
      rootName: normalizeSvgName(message.batch.rootName || SVG_IMPORT_BATCH_ROOT_NAME),
      items: Array.isArray(message.batch.items) ? message.batch.items.filter(Boolean) : [],
    };
  }

  function normalizeSvgPlacement(value) {
    return value === "new-page" ? "new-page" : "current-page";
  }

  function normalizeSvgGap(value) {
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : DEFAULT_BATCH_FRAME_GAP;
  }

  function normalizeSvgName(value) {
    const normalized = typeof value === "string" ? value.trim() : "";
    return normalized.length > 0 ? normalized : SVG_IMPORT_BATCH_ROOT_NAME;
  }

  async function resolveSvgImportPage(batch) {
    if (!batch || batch.placement !== "new-page") {
      return figma.currentPage;
    }

    const page = figma.createPage();
    page.name = batch.rootName;
    return page;
  }

  async function importSvgPayload(payload) {
    const svgText = payload && typeof payload.svgText === "string" ? payload.svgText.trim() : "";
    const svgTextFallback =
      payload && typeof payload.svgTextFallback === "string" ? payload.svgTextFallback.trim() : "";
    const hasBitmapBackground = getByteLength(payload && payload.backgroundPngBytes) > 0;
    if (!svgText && !hasBitmapBackground) {
      const fileLabel = payload && typeof payload.fileName === "string" && payload.fileName.trim().length > 0
        ? payload.fileName.trim()
        : "SVG";
      throw new Error(`${fileLabel} 파일 내용이 비어 있습니다.`);
    }

    const importedNode = hasBitmapBackground
      ? createBitmapSvgImportNode(payload)
      : figma.createNodeFromSvg(svgText);
    importedNode.name = normalizeSvgName(payload.rootName || payload.fileName || SVG_IMPORT_BATCH_ROOT_NAME);
    let textImportResult = null;
    try {
      textImportResult = await appendEditableTextRuns(importedNode, payload);
    } catch (error) {
      console.warn("[pigma-svg-import] failed to append editable text runs", error);
    }
    if (
      textImportResult &&
      textImportResult.requestedCount > 0 &&
      textImportResult.createdCount === 0 &&
      svgTextFallback &&
      svgTextFallback !== svgText
    ) {
      return replaceSvgImportWithFallback(importedNode, svgTextFallback);
    }
    return importedNode;
  }

  function createBitmapSvgImportNode(payload) {
    const frame = figma.createFrame();
    const width = Math.max(1, roundNumber(payload && payload.documentWidth));
    const height = Math.max(1, roundNumber(payload && payload.documentHeight));
    frame.name = normalizeSvgName(payload && (payload.rootName || payload.fileName) || SVG_IMPORT_BATCH_ROOT_NAME);
    frame.resize(width, height);
    frame.clipsContent = true;
    frame.strokes = [];
    frame.fills = [];

    const background = figma.createRectangle();
    background.name = "Background PNG";
    background.resize(width, height);
    background.x = 0;
    background.y = 0;
    background.strokes = [];
    background.fills = [createBitmapFillFromBytes(payload.backgroundPngBytes)];
    frame.appendChild(background);

    return frame;
  }

  function createBitmapFillFromBytes(bytes) {
    const normalizedBytes = normalizeImageBytes(bytes);
    const image = figma.createImage(normalizedBytes);
    return {
      type: "IMAGE",
      imageHash: image.hash,
      scaleMode: "FILL",
      visible: true,
      opacity: 1,
    };
  }

  function normalizeImageBytes(bytes) {
    if (bytes instanceof Uint8Array) {
      return bytes;
    }
    if (bytes instanceof ArrayBuffer) {
      return new Uint8Array(bytes);
    }
    if (ArrayBuffer.isView(bytes)) {
      return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    }
    throw new Error("The bitmap import payload did not include valid image bytes.");
  }

  async function appendEditableTextRuns(importedNode, payload) {
    const textRuns = getEditableTextRunsFromPayload(payload);
    if (textRuns.length === 0 || !importedNode || typeof importedNode.appendChild !== "function") {
      return {
        requestedCount: textRuns.length,
        createdCount: 0,
      };
    }

    const overlay = createEditableTextOverlay(importedNode);
    if (!overlay) {
      return {
        requestedCount: textRuns.length,
        createdCount: 0,
      };
    }

    const availableFonts = await getAvailableFontsSafely();
    let createdCount = 0;
    let visibleCount = 0;
    for (const run of textRuns) {
      let textNode = null;
      try {
        textNode = await createEditableTextNode(run, availableFonts);
      } catch (error) {
        console.warn("[pigma-svg-import] failed to create one editable text node", error, run);
        continue;
      }
      if (!textNode) {
        continue;
      }

      overlay.appendChild(textNode);
      textNode.x = normalizeEditableTextCoordinate(run.x);
      textNode.y = resolveEditableTextTopCoordinate(run, textNode);
      createdCount += 1;
      if (isRenderableEditableTextNode(textNode)) {
        visibleCount += 1;
      }
    }

    if (visibleCount === 0) {
      overlay.remove();
      return {
        requestedCount: textRuns.length,
        createdCount: visibleCount,
      };
    }

    overlay.name = `Editable Text (${visibleCount}/${textRuns.length})`;
    setSceneNodeExpanded(overlay, true);
    return {
      requestedCount: textRuns.length,
      createdCount: visibleCount,
    };
  }

  function replaceSvgImportWithFallback(importedNode, svgTextFallback) {
    if (!importedNode || typeof importedNode.remove !== "function") {
      return figma.createNodeFromSvg(svgTextFallback);
    }

    const parent = importedNode.parent;
    const index =
      parent && Array.isArray(parent.children) ? parent.children.indexOf(importedNode) : -1;
    const fallbackNode = figma.createNodeFromSvg(svgTextFallback);
    fallbackNode.name = importedNode.name;
    fallbackNode.x = importedNode.x;
    fallbackNode.y = importedNode.y;

    importedNode.remove();

    if (parent && typeof parent.insertChild === "function") {
      try {
        parent.insertChild(index >= 0 ? index : parent.children.length, fallbackNode);
      } catch (error) {
        console.warn("[pigma-svg-import] failed to preserve fallback node order", error);
      }
    }

    return fallbackNode;
  }

  function getEditableTextRunsFromPayload(payload) {
    if (!payload || !Array.isArray(payload.editableTextRuns)) {
      return [];
    }

    return payload.editableTextRuns.filter(run => {
      return !!run && typeof run.characters === "string" && run.characters.trim().length > 0;
    });
  }

  function createEditableTextOverlay(importedNode) {
    if (!importedNode || typeof importedNode.appendChild !== "function") {
      return null;
    }

    const overlay = figma.createFrame();
    overlay.name = "Editable Text";
    overlay.resize(
      Math.max(1, roundNumber(importedNode.width)),
      Math.max(1, roundNumber(importedNode.height))
    );
    overlay.x = 0;
    overlay.y = 0;
    overlay.clipsContent = false;
    overlay.fills = [];
    overlay.strokes = [];
    importedNode.appendChild(overlay);
    return overlay;
  }

  async function createEditableTextNode(run, availableFonts) {
    const characters = normalizeEditableTextCharacters(run && run.characters);
    if (!characters) {
      return null;
    }

    const fontName = await loadEditableTextFont(run, availableFonts);
    if (!fontName) {
      return null;
    }

    const textNode = figma.createText();
    textNode.fontName = fontName;
    textNode.fontSize = normalizeEditableTextFontSize(run);
    textNode.characters = characters;
    applyEditableTextLineHeight(textNode, run);
    applyEditableTextLetterSpacing(textNode, run);
    fitEditableTextFontSizeToRun(textNode, run, characters);
    applyEditableTextLineHeight(textNode, run);
    applyEditableTextSizing(textNode, run, characters);
    textNode.name = buildEditableTextLayerName(characters);

    const fillPaint = createEditableTextPaint(run);
    if (fillPaint) {
      textNode.fills = [fillPaint];
    } else {
      textNode.fills = [createSolidPaintFromColor("000000", 1)];
    }

    const rotation = normalizeEditableTextRotation(run && run.rotation);
    if (rotation !== 0) {
      textNode.rotation = rotation;
    }

    return textNode;
  }

  function applyEditableTextLetterSpacing(textNode, run) {
    if (!textNode || !("letterSpacing" in textNode)) {
      return 0;
    }

    const letterSpacing = Number(run && run.letterSpacing);
    if (!Number.isFinite(letterSpacing)) {
      return 0;
    }

    const normalizedLetterSpacing = Math.round(letterSpacing * 1000) / 1000;
    textNode.letterSpacing = {
      unit: "PIXELS",
      value: normalizedLetterSpacing,
    };
    return normalizedLetterSpacing;
  }

  function applyEditableTextLineHeight(textNode, run) {
    if (!textNode || !("lineHeight" in textNode)) {
      return;
    }

    const resolvedLineHeight = normalizeEditableTextLineHeight(run, textNode.fontSize);
    if (!Number.isFinite(resolvedLineHeight) || resolvedLineHeight <= 0) {
      return;
    }

    textNode.lineHeight = {
      unit: "PIXELS",
      value: resolvedLineHeight,
    };
  }

  function fitEditableTextFontSizeToRun(textNode, run, characters) {
    if (!textNode || typeof textNode.fontSize !== "number") {
      return;
    }

    const currentFontSize = Number(textNode.fontSize);
    const measuredWidth = Number(textNode.width) || 0;
    const measuredHeight = Number(textNode.height) || 0;
    const targetWidth = Number(run && run.width);
    const targetHeight = Number(run && run.height);
    if (!Number.isFinite(currentFontSize) || currentFontSize <= 0 || measuredWidth <= 0 || measuredHeight <= 0) {
      return;
    }

    const ratios = [];
    if (Number.isFinite(targetHeight) && targetHeight > 0.5) {
      ratios.push(clampEditableTextScale(targetHeight / measuredHeight, 0.82, 1.24));
    }

    const hasLineBreak = typeof characters === "string" && /[\r\n]/.test(characters);
    if (!hasLineBreak && Number.isFinite(targetWidth) && targetWidth > 0.5) {
      const widthRatio = targetWidth / measuredWidth;
      if (Math.abs(widthRatio - 1) >= 0.02) {
        ratios.push(clampEditableTextScale(widthRatio, 0.86, 1.16));
      }
    }

    if (ratios.length === 0) {
      return;
    }

    let selectedRatio = ratios[0];
    if (ratios.length > 1) {
      const smallestRatio = Math.min(...ratios);
      const averageRatio = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
      selectedRatio = smallestRatio < 1 ? smallestRatio : averageRatio;
    }

    if (!Number.isFinite(selectedRatio) || Math.abs(selectedRatio - 1) < 0.02) {
      return;
    }

    const adjustedFontSize = Math.max(1, roundNumber(currentFontSize * selectedRatio));
    if (Math.abs(adjustedFontSize - currentFontSize) < 0.1) {
      return;
    }

    textNode.fontSize = adjustedFontSize;
  }

  function applyEditableTextSizing(textNode, run, characters) {
    if (!textNode) {
      return;
    }

    const requestedFontSize = normalizeEditableTextFontSize(run);
    const measuredWidth = Number(textNode.width) || 0;
    const measuredHeight = Number(textNode.height) || 0;
    const fallbackWidth = requestedFontSize * Math.max(1, String(characters || "").length * 0.55);
    const targetWidth = Math.max(
      1,
      roundNumber(Number(run && run.width) || 0),
      roundNumber(measuredWidth),
      roundNumber(fallbackWidth)
    );
    const targetHeight = Math.max(
      1,
      roundNumber(Number(run && run.height) || 0),
      roundNumber(measuredHeight),
      roundNumber(requestedFontSize * 1.2)
    );

    try {
      if ("textAutoResize" in textNode) {
        textNode.textAutoResize = "NONE";
      }
      if (typeof textNode.resize === "function") {
        textNode.resize(targetWidth, targetHeight);
      }
    } catch (error) {
      console.warn("[pigma-svg-import] failed to apply explicit text sizing", error);
      if ("textAutoResize" in textNode) {
        textNode.textAutoResize = "WIDTH_AND_HEIGHT";
      }
    }
  }

  function isRenderableEditableTextNode(textNode) {
    if (!textNode) {
      return false;
    }

    return (
      Number.isFinite(textNode.width) &&
      Number.isFinite(textNode.height) &&
      Number(textNode.width) > 0.5 &&
      Number(textNode.height) > 0.5 &&
      typeof textNode.characters === "string" &&
      textNode.characters.trim().length > 0
    );
  }

  function normalizeEditableTextCharacters(value) {
    if (typeof value !== "string") {
      return "";
    }

    return value.replace(/\u0000/g, "").replace(/\r\n?/g, "\n");
  }

  function buildEditableTextLayerName(characters) {
    const normalized = String(characters).replace(/\s+/g, " ").trim();
    if (normalized.length === 0) {
      return "Editable Text";
    }

    return normalized.length > 48 ? normalized.slice(0, 48) : normalized;
  }

  function normalizeEditableTextCoordinate(value) {
    return Number.isFinite(value) ? Math.round(Number(value) * 1000) / 1000 : 0;
  }

  function resolveEditableTextTopCoordinate(run, textNode) {
    const requestedTop = normalizeEditableTextCoordinate(run && run.y);
    if (!textNode) {
      return requestedTop;
    }

    const requestedHeight = Number(run && run.height);
    const measuredHeight = Number(textNode.height);
    if (!Number.isFinite(requestedHeight) || requestedHeight <= 0 || !Number.isFinite(measuredHeight) || measuredHeight <= 0) {
      return requestedTop;
    }

    const topShare = resolveEditableTextTopShare(run);
    return normalizeEditableTextCoordinate(requestedTop + (requestedHeight - measuredHeight) * topShare);
  }

  function resolveEditableTextTopShare(run) {
    const ascentRatio = Number(run && run.ascentRatio);
    const descentRatio = Number(run && run.descentRatio);
    if (Number.isFinite(ascentRatio) && ascentRatio > 0 && Number.isFinite(descentRatio) && descentRatio >= 0) {
      const total = ascentRatio + descentRatio;
      if (total > 0.01) {
        return clampEditableTextScale(ascentRatio / total, 0.45, 0.92);
      }
    }

    return 0.8;
  }

  function normalizeEditableTextFontSize(run) {
    const primarySize = run && Number(run.fontSize);
    if (Number.isFinite(primarySize) && primarySize > 0.1) {
      return Math.max(1, Math.round(primarySize * 1000) / 1000);
    }

    const nominalSize = run && Number(run.nominalFontSize);
    if (Number.isFinite(nominalSize) && nominalSize > 0.1) {
      return Math.max(1, Math.round(nominalSize * 1000) / 1000);
    }

    const fallbackSize = run && Number(run.height);
    if (Number.isFinite(fallbackSize) && fallbackSize > 0.1) {
      return Math.max(1, Math.round(fallbackSize * 0.92 * 1000) / 1000);
    }

    return 12;
  }

  function normalizeEditableTextLineHeight(run, currentFontSize) {
    const explicitLineHeight = run && Number(run.lineHeight);
    if (Number.isFinite(explicitLineHeight) && explicitLineHeight > 0.1) {
      return Math.max(1, Math.round(explicitLineHeight * 1000) / 1000);
    }

    const lineHeightRatio = run && Number(run.lineHeightRatio);
    const fontSize = Number(currentFontSize);
    if (Number.isFinite(lineHeightRatio) && lineHeightRatio > 0.1 && Number.isFinite(fontSize) && fontSize > 0.1) {
      return Math.max(1, Math.round(fontSize * lineHeightRatio * 1000) / 1000);
    }

    return NaN;
  }

  function normalizeEditableTextRotation(value) {
    return Number.isFinite(value) ? Math.round(Number(value) * 1000) / 1000 : 0;
  }

  function clampEditableTextScale(value, min, max) {
    if (!Number.isFinite(value)) {
      return 1;
    }

    return Math.max(min, Math.min(max, Number(value)));
  }

  function createEditableTextPaint(run) {
    if (!run || typeof run.fillColor !== "string") {
      return null;
    }

    return createSolidPaintFromColor(run.fillColor, run.fillOpacity);
  }

  function createSolidPaintFromColor(value, opacityValue) {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (!normalized) {
      return null;
    }

    const hexMatch = normalized.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    let fullHex = "";
    if (hexMatch) {
      const compactHex = hexMatch[1];
      fullHex =
        compactHex.length === 3
          ? compactHex[0] + compactHex[0] + compactHex[1] + compactHex[1] + compactHex[2] + compactHex[2]
          : compactHex;
    } else {
      const rgbMatch = normalized.match(
        /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*[0-9.]+\s*)?\)$/i
      );
      if (!rgbMatch) {
        return null;
      }

      fullHex = rgbMatch
        .slice(1, 4)
        .map(channel => Math.max(0, Math.min(255, Math.round(Number(channel) || 0))).toString(16).padStart(2, "0"))
        .join("");
    }

    const red = Number.parseInt(fullHex.slice(0, 2), 16);
    const green = Number.parseInt(fullHex.slice(2, 4), 16);
    const blue = Number.parseInt(fullHex.slice(4, 6), 16);
    if (!Number.isFinite(red) || !Number.isFinite(green) || !Number.isFinite(blue)) {
      return null;
    }

    const paint = {
      type: "SOLID",
      color: {
        r: red / 255,
        g: green / 255,
        b: blue / 255
      }
    };
    if (Number.isFinite(opacityValue) && opacityValue >= 0 && opacityValue < 1) {
      paint.opacity = Math.max(0, Math.min(1, Number(opacityValue)));
    }
    return paint;
  }

  async function loadEditableTextFont(run, availableFonts) {
    const candidates = getEditableTextFontCandidates(run, availableFonts);
    for (const fontName of candidates) {
      try {
        await figma.loadFontAsync(fontName);
        return fontName;
      } catch (error) {
        console.warn("[pigma-svg-import] failed to load font", fontName, error);
      }
    }

    return null;
  }

  function getEditableTextFontCandidates(run, availableFonts) {
    const candidates = [];
    const requestedStyle = getRequestedEditableFontStyle(run);
    const requestedFamilies = getRequestedEditableFontFamilies(run);

    for (const requestedFamily of requestedFamilies) {
      const splitRequest = splitRequestedEditableFontFamily(requestedFamily);

      pushDirectFontNameCandidate(candidates, requestedFamily, requestedStyle);
      pushFontNameCandidate(candidates, findExactFontMatch({
        fontFamily: requestedFamily,
        fontStyle: requestedStyle
      }, availableFonts));

      if (splitRequest.family && splitRequest.family !== requestedFamily) {
        pushDirectFontNameCandidate(candidates, splitRequest.family, requestedStyle);
        pushFontNameCandidate(candidates, findExactFontMatch({
          fontFamily: splitRequest.family,
          fontStyle: requestedStyle
        }, availableFonts));
        if (splitRequest.style) {
          pushDirectFontNameCandidate(candidates, splitRequest.family, splitRequest.style);
          pushFontNameCandidate(candidates, findExactFontMatch({
            fontFamily: splitRequest.family,
            fontStyle: splitRequest.style
          }, availableFonts));
        }
      }

      pushFontNameCandidate(candidates, findFamilyFontMatch(requestedFamily, run, availableFonts));
      if (splitRequest.family && splitRequest.family !== requestedFamily) {
        pushFontNameCandidate(candidates, findFamilyFontMatch(splitRequest.family, run, availableFonts));
      }
    }

    pushKnownEditableFontFallbacks(candidates, run);
    pushFontNameCandidate(candidates, findFallbackFontName(availableFonts));
    return candidates;
  }

  function pushDirectFontNameCandidate(candidates, family, style) {
    const normalizedFamily = cleanupEditableFontFamily(family);
    if (!normalizedFamily) {
      return;
    }

    pushFontNameCandidate(candidates, {
      family: normalizedFamily,
      style: normalizeEditableFontStyle(style) || "Regular"
    });
  }

  function pushKnownEditableFontFallbacks(candidates, run) {
    const styleCandidates = buildEditableFontStyleCandidates(run);
    const families = [
      "LGEIText",
      "Malgun Gothic",
      "Apple SD Gothic Neo",
      "Noto Sans KR",
      "Noto Sans CJK KR",
      "Arial",
      "Inter",
      "Roboto"
    ];

    for (const family of families) {
      for (const style of styleCandidates) {
        pushDirectFontNameCandidate(candidates, family, style);
      }
    }
  }

  function getRequestedEditableFontFamily(run) {
    const preferred = cleanupEditableFontFamily(run && run.fontFamily);
    return preferred || "Arial";
  }

  function getRequestedEditableFontFamilies(run) {
    const families = [];
    pushRequestedEditableFontFamily(families, run && run.fontFamily);
    pushRequestedEditableFontFamily(families, run && run.fontFamilyRaw);
    if (families.length === 0) {
      families.push("Arial");
    }
    return families;
  }

  function pushRequestedEditableFontFamily(families, value) {
    const normalized = cleanupEditableFontFamily(value);
    if (!normalized || families.indexOf(normalized) !== -1) {
      return;
    }

    families.push(normalized);
  }

  function getRequestedEditableFontStyle(run) {
    const preferred = normalizeEditableFontStyle(run && run.fontStyle);
    return preferred || "Regular";
  }

  function cleanupEditableFontFamily(value) {
    if (typeof value !== "string") {
      return "";
    }

    return value
      .trim()
      .replace(/^["']+|["']+$/g, "")
      .replace(/(?:PS)?MT$/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeEditableFontStyle(value) {
    const normalized = typeof value === "string" ? value.replace(/[_-]+/g, " ").trim().toLowerCase() : "";
    if (!normalized) {
      return "";
    }

    if (
      (normalized.indexOf("bold") !== -1 && normalized.indexOf("italic") !== -1) ||
      (normalized.indexOf("bold") !== -1 && normalized.indexOf("oblique") !== -1)
    ) {
      return "Bold Italic";
    }
    if (
      (normalized.indexOf("semi") !== -1 || normalized.indexOf("demi") !== -1) &&
      normalized.indexOf("bold") !== -1
    ) {
      return "Semi Bold";
    }
    if (
      (normalized.indexOf("extra") !== -1 || normalized.indexOf("ultra") !== -1) &&
      normalized.indexOf("bold") !== -1
    ) {
      return "Extra Bold";
    }
    if (normalized.indexOf("bold") !== -1) {
      return "Bold";
    }
    if (normalized.indexOf("medium") !== -1) {
      return "Medium";
    }
    if (normalized.indexOf("light") !== -1) {
      return "Light";
    }
    if (normalized.indexOf("thin") !== -1) {
      return "Thin";
    }
    if (normalized.indexOf("black") !== -1 || normalized.indexOf("heavy") !== -1) {
      return "Black";
    }
    if (normalized.indexOf("italic") !== -1 || normalized.indexOf("oblique") !== -1) {
      return "Italic";
    }
    if (normalized.indexOf("book") !== -1) {
      return "Book";
    }
    if (normalized.indexOf("roman") !== -1 || normalized.indexOf("regular") !== -1) {
      return "Regular";
    }

    return "";
  }

  function splitRequestedEditableFontFamily(value) {
    const normalized = cleanupEditableFontFamily(value);
    if (!normalized) {
      return { family: "", style: "" };
    }

    const styleMatch = normalized.match(
      /(?:^|[-\s])(bold[\s-]*italic|italic[\s-]*bold|semi[\s-]*bold|demi[\s-]*bold|extra[\s-]*bold|ultra[\s-]*bold|bold|medium|light|thin|black|heavy|italic|oblique|regular|roman|book)$/i
    );
    const rawStyle = styleMatch ? styleMatch[1] : "";
    const family = cleanupEditableFontFamily(
      styleMatch ? normalized.slice(0, styleMatch.index).replace(/[-\s]+$/, "") : normalized
    );
    return {
      family: family || normalized,
      style: normalizeEditableFontStyle(rawStyle)
    };
  }

  function buildEditableFontStyleCandidates(run) {
    const candidates = [];
    const requestedStyle = getRequestedEditableFontStyle(run);
    const weight = Number(run && run.fontWeight);
    const normalizedWeight = Number.isFinite(weight) ? weight : 400;

    pushEditableFontStyleCandidate(candidates, requestedStyle);
    if (requestedStyle === "Bold Italic") {
      pushEditableFontStyleCandidate(candidates, "Italic");
      pushEditableFontStyleCandidate(candidates, "Bold");
    } else if (requestedStyle === "Italic") {
      pushEditableFontStyleCandidate(candidates, "Regular");
    }

    if (normalizedWeight >= 800) {
      pushEditableFontStyleCandidate(candidates, "Black");
      pushEditableFontStyleCandidate(candidates, "Extra Bold");
    }
    if (normalizedWeight >= 700) {
      pushEditableFontStyleCandidate(candidates, "Bold");
    } else if (normalizedWeight >= 600) {
      pushEditableFontStyleCandidate(candidates, "Semi Bold");
    } else if (normalizedWeight >= 500) {
      pushEditableFontStyleCandidate(candidates, "Medium");
    } else if (normalizedWeight <= 300) {
      pushEditableFontStyleCandidate(candidates, "Light");
    }

    pushEditableFontStyleCandidate(candidates, "Regular");
    pushEditableFontStyleCandidate(candidates, "Book");
    pushEditableFontStyleCandidate(candidates, "Roman");
    return candidates;
  }

  function pushEditableFontStyleCandidate(candidates, value) {
    const normalized = normalizeEditableFontStyle(value);
    if (!normalized) {
      return;
    }

    for (const existing of candidates) {
      if (normalizeFontToken(existing) === normalizeFontToken(normalized)) {
        return;
      }
    }

    candidates.push(normalized);
  }

  function getEditableFontFamilyTokens(value) {
    const tokens = [];
    const cleaned = cleanupEditableFontFamily(value);
    const split = splitRequestedEditableFontFamily(cleaned);
    pushEditableFontFamilyToken(tokens, cleaned);
    pushEditableFontFamilyToken(tokens, split.family);
    return tokens;
  }

  function pushEditableFontFamilyToken(tokens, value) {
    const normalized = normalizeFontToken(cleanupEditableFontFamily(value));
    if (!normalized || tokens.indexOf(normalized) !== -1) {
      return;
    }

    tokens.push(normalized);
  }

  function findFamilyFontMatch(family, run, availableFonts) {
    if (!Array.isArray(availableFonts) || availableFonts.length === 0) {
      return null;
    }

    const familyTokens = getEditableFontFamilyTokens(family);
    if (familyTokens.length === 0) {
      return null;
    }

    const exactMatches = [];
    const partialMatches = [];
    for (const entry of availableFonts) {
      if (!entry || !entry.fontName) {
        continue;
      }

      const entryFamily = normalizeFontToken(cleanupEditableFontFamily(entry.fontName.family));
      if (!entryFamily) {
        continue;
      }

      if (familyTokens.indexOf(entryFamily) !== -1) {
        exactMatches.push(entry);
        continue;
      }

      if (familyTokens.some(token => token.indexOf(entryFamily) !== -1 || entryFamily.indexOf(token) !== -1)) {
        partialMatches.push(entry);
      }
    }

    return selectFontEntryByStyle(exactMatches.length > 0 ? exactMatches : partialMatches, run);
  }

  function selectFontEntryByStyle(entries, run) {
    if (!Array.isArray(entries) || entries.length === 0) {
      return null;
    }

    const styleCandidates = buildEditableFontStyleCandidates(run);
    for (const styleName of styleCandidates) {
      const normalizedStyle = normalizeFontToken(styleName);
      for (const entry of entries) {
        if (!entry || !entry.fontName) {
          continue;
        }

        if (normalizeFontToken(entry.fontName.style) === normalizedStyle) {
          return entry.fontName;
        }
      }
    }

    for (const fallbackStyle of ["Regular", "Book", "Roman"]) {
      const normalizedFallbackStyle = normalizeFontToken(fallbackStyle);
      for (const entry of entries) {
        if (!entry || !entry.fontName) {
          continue;
        }

        if (normalizeFontToken(entry.fontName.style) === normalizedFallbackStyle) {
          return entry.fontName;
        }
      }
    }

    return entries[0] && entries[0].fontName ? entries[0].fontName : null;
  }

  function findFallbackFontName(availableFonts) {
    if (!Array.isArray(availableFonts) || availableFonts.length === 0) {
      return null;
    }

    let fallback = findFamilyFontMatch("Arial", { fontStyle: "Regular", fontWeight: 400 }, availableFonts);
    if (fallback) {
      return fallback;
    }

    fallback = findFamilyFontMatch("Inter", { fontStyle: "Regular", fontWeight: 400 }, availableFonts);
    if (fallback) {
      return fallback;
    }

    fallback = findFamilyFontMatch("Roboto", { fontStyle: "Regular", fontWeight: 400 }, availableFonts);
    if (fallback) {
      return fallback;
    }

    return selectFontEntryByStyle(availableFonts, { fontStyle: "Regular", fontWeight: 400 });
  }

  function pushFontNameCandidate(candidates, fontName) {
    if (!fontName || typeof fontName !== "object") {
      return;
    }

    const candidateKey = normalizeFontToken(fontName.family) + ":" + normalizeFontToken(fontName.style);
    for (const existing of candidates) {
      const existingKey = normalizeFontToken(existing.family) + ":" + normalizeFontToken(existing.style);
      if (existingKey === candidateKey) {
        return;
      }
    }

    candidates.push(fontName);
  }

  function layoutImportedSvgNodes(nodes, gap, center) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return;
    }

    const resolvedGap = normalizeSvgGap(gap);
    const totalHeight =
      nodes.reduce((sum, node) => sum + Math.max(1, roundNumber(node.height)), 0) +
      Math.max(0, nodes.length - 1) * resolvedGap;
    const maxWidth = nodes.reduce((max, node) => Math.max(max, Math.max(1, roundNumber(node.width))), 1);
    const centerX = center && Number.isFinite(center.x) ? center.x : 0;
    const centerY = center && Number.isFinite(center.y) ? center.y : 0;
    const startX = roundNumber(centerX - maxWidth / 2);
    let cursorY = roundNumber(centerY - totalHeight / 2);

    for (const node of nodes) {
      const nodeWidth = Math.max(1, roundNumber(node.width));
      node.x = roundNumber(startX + (maxWidth - nodeWidth) / 2);
      node.y = cursorY;
      cursorY += Math.max(1, roundNumber(node.height)) + resolvedGap;
    }
  }

  function getSvgImportErrorMessage(error) {
    if (error instanceof Error && typeof error.message === "string" && error.message.trim().length > 0) {
      return `SVG 가져오기에 실패했습니다. ${error.message.trim()}`;
    }

    return "SVG 가져오기에 실패했습니다.";
  }

  async function prepareImportPayload(message) {
    if (message.type === "request-import") {
      prepareImportPayloadItem(message.payload);
      return;
    }

    if (!message.batch || !Array.isArray(message.batch.items)) {
      return;
    }

    for (const item of message.batch.items) {
      prepareImportPayloadItem(item);
    }
  }

  function prepareImportPayloadItem(payload) {
    normalizeImportRoot(payload);
  }

  function getNormalizedPayloadNodes(payload) {
    if (!payload || payload.mode === "flatten-image" || !Array.isArray(payload.nodes)) {
      return null;
    }

    if (payload.nodes.length !== 1) {
      return payload.nodes;
    }

    return getCollapsedRootChildren(payload, payload.nodes[0]) || payload.nodes;
  }

  function getSelectedImportRoot() {
    return figma.currentPage.selection.length > 0 ? figma.currentPage.selection[0] : null;
  }

  function downgradeTextNodes(payload, availableFonts) {
    if (!payload || payload.mode === "flatten-image" || !Array.isArray(payload.nodes)) {
      return;
    }

    const warnings = Array.isArray(payload.warnings) ? payload.warnings : [];
    if (!Array.isArray(payload.warnings)) {
      payload.warnings = warnings;
    }

    const forceRasterizeAllTextPayload = shouldForceRasterizeAllTextPayload(payload);
    const forceRasterizeMultiTextPayload = !forceRasterizeAllTextPayload && shouldRasterizeMultiTextPayload(payload);

    if (forceRasterizeAllTextPayload) {
      warnings.push("This PSD was imported with bitmap text layers because editable text reconstruction is disabled to prevent cross-layer text updates.");
    } else if (forceRasterizeMultiTextPayload) {
      warnings.push("This PSD was imported with bitmap text layers because multi-text editable reconstruction is disabled to avoid cross-layer text updates.");
    }

    payload.nodes = payload.nodes.map(node =>
      downgradeNode(node, availableFonts, warnings, forceRasterizeAllTextPayload || forceRasterizeMultiTextPayload)
    );
  }

  function shouldForceRasterizeAllTextPayload(payload) {
    const payloadNodes = getNormalizedPayloadNodes(payload);
    return countImportedTextNodes(payloadNodes) > 0;
  }

  // Legacy bitmap fallback helper kept for emergency debugging only.
  function shouldRasterizeMultiTextPayload(payload) {
    const payloadNodes = getNormalizedPayloadNodes(payload);
    return countImportedTextNodes(payloadNodes) > 1;
  }

  function normalizeImportRoot(payload) {
    const normalizedNodes = getNormalizedPayloadNodes(payload);
    if (normalizedNodes) {
      payload.nodes = normalizedNodes;
    }
  }

  function getCollapsedRootChildren(payload, node) {
    if (!shouldCollapseRootGroup(payload, node)) {
      return null;
    }

    const children = node.children.slice();
    const documentWidth = normalizeDimension(payload.documentWidth, 0);
    const documentHeight = normalizeDimension(payload.documentHeight, 0);
    const rootMatchesDocumentSize =
      documentWidth > 0 &&
      documentHeight > 0 &&
      dimensionsMatch(node.width, documentWidth) &&
      dimensionsMatch(node.height, documentHeight) &&
      isNearOrigin(node.x) &&
      isNearOrigin(node.y);

    if (rootMatchesDocumentSize) {
      return children;
    }

    const preferredCanvasBounds = findPreferredCanvasBounds(children);
    const preferredMatchesDocumentSize =
      !!preferredCanvasBounds &&
      documentWidth > 0 &&
      documentHeight > 0 &&
      dimensionsMatch(preferredCanvasBounds.width, documentWidth) &&
      dimensionsMatch(preferredCanvasBounds.height, documentHeight);

    if (!preferredCanvasBounds || !preferredMatchesDocumentSize) {
      return null;
    }

    const deltaX = -preferredCanvasBounds.x;
    const deltaY = -preferredCanvasBounds.y;
    return children.map(child => offsetImportedNode(child, deltaX, deltaY));
  }

  function shouldCollapseRootGroup(payload, node) {
    if (!node || node.kind !== "group" || !Array.isArray(node.children) || node.children.length === 0) {
      return false;
    }

    const payloadName = normalizeLayerName(payload.rootName);
    const nodeName = normalizeLayerName(node.name);
    if (payloadName.length === 0 || payloadName !== nodeName) {
      return false;
    }

    if (!node.visible || !isNeutralOpacity(node.opacity) || !isNeutralBlendMode(node.blendMode)) {
      return false;
    }

    if (node.effects !== null || node.strokeEffect !== null) {
      return false;
    }

    if (!isPositiveDimension(node.width) || !isPositiveDimension(node.height)) {
      return false;
    }

    return true;
  }

  function dimensionsMatch(value, expected) {
    return isPositiveDimension(value) && isPositiveDimension(expected) && Math.abs(Number(value) - Number(expected)) <= 1;
  }

  function isNearOrigin(value) {
    return Math.abs(Number(value) || 0) <= 1;
  }

  function normalizeLayerName(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
  }

  function isNeutralOpacity(value) {
    const opacity = Number.isFinite(value) ? Number(value) : 1;
    return Math.abs(opacity - 1) <= 0.001;
  }

  function isNeutralBlendMode(value) {
    return value === "normal" || value === "pass through";
  }

  function isPositiveDimension(value) {
    return Number.isFinite(value) && Number(value) > 0;
  }

  function normalizeDimension(preferredValue, fallbackValue) {
    if (isPositiveDimension(preferredValue)) {
      return Math.max(1, Math.round(Number(preferredValue)));
    }

    if (isPositiveDimension(fallbackValue)) {
      return Math.max(1, Math.round(Number(fallbackValue)));
    }

    return 1;
  }

  function offsetImportedNode(node, deltaX, deltaY) {
    if (!node) {
      return node;
    }

    const shiftedNode = Object.assign({}, node, {
      x: roundNumber((Number(node.x) || 0) + deltaX),
      y: roundNumber((Number(node.y) || 0) + deltaY)
    });

    if (node.kind === "text" && node.text) {
      shiftedNode.text = offsetTextMetadata(node.text, deltaX, deltaY);
    }

    return shiftedNode;
  }

  function offsetTextMetadata(text, deltaX, deltaY) {
    const transform = Array.isArray(text.transform) ? text.transform.slice(0, 6) : null;
    return Object.assign({}, text, {
      transform: transform && transform.length >= 6
        ? [
            transform[0],
            transform[1],
            transform[2],
            transform[3],
            roundNumber((Number(transform[4]) || 0) + deltaX),
            roundNumber((Number(transform[5]) || 0) + deltaY)
          ]
        : text.transform,
      bounds: offsetBounds(text.bounds, deltaX, deltaY),
      boundingBox: offsetBounds(text.boundingBox, deltaX, deltaY)
    });
  }

  function offsetBounds(bounds, deltaX, deltaY) {
    if (!bounds) {
      return bounds;
    }

    return {
      left: roundNumber((Number(bounds.left) || 0) + deltaX),
      top: roundNumber((Number(bounds.top) || 0) + deltaY),
      right: roundNumber((Number(bounds.right) || 0) + deltaX),
      bottom: roundNumber((Number(bounds.bottom) || 0) + deltaY)
    };
  }

  function findPreferredCanvasBounds(nodes) {
    return collectPayloadVisibleBounds(nodes, 0, 0);
  }

  function collectPayloadVisibleBounds(nodes, offsetX, offsetY) {
    if (!Array.isArray(nodes)) {
      return null;
    }

    let bounds = null;
    for (const node of nodes) {
      if (!node || node.visible === false) {
        continue;
      }

      const absoluteX = roundNumber((Number(node.x) || 0) + offsetX);
      const absoluteY = roundNumber((Number(node.y) || 0) + offsetY);

      if (node.kind === "group" && Array.isArray(node.children)) {
        bounds = mergeRectBounds(bounds, collectPayloadVisibleBounds(node.children, absoluteX, absoluteY));
        continue;
      }

      if (!isPositiveDimension(node.width) || !isPositiveDimension(node.height)) {
        continue;
      }

      const width = Math.max(1, Math.round(Number(node.width)));
      const height = Math.max(1, Math.round(Number(node.height)));
      bounds = mergeRectBounds(bounds, {
        x: absoluteX,
        y: absoluteY,
        width,
        height
      });
    }

    return bounds;
  }

  function isBackgroundLikeName(value) {
    if (typeof value !== "string") {
      return false;
    }

    return /\b(background|bg|backdrop|canvas)\b/i.test(value.trim());
  }

  function roundNumber(value) {
    return Number.isFinite(value) ? Math.round(Number(value)) : 0;
  }

  function downgradeNode(node, availableFonts, warnings, forceRasterizeText) {
    if (!node) {
      return node;
    }

    if (node.kind === "group" && Array.isArray(node.children)) {
      node.children = node.children.map(child => downgradeNode(child, availableFonts, warnings, forceRasterizeText));
      return node;
    }

    if (node.kind !== "text") {
      return node;
    }

    if (forceRasterizeText && getByteLength(node.pngBytes) === 0) {
      return node;
    }

    if (!forceRasterizeText && !shouldRasterizeTextNode(node, availableFonts)) {
      return node;
    }

    if (!forceRasterizeText) {
      warnings.push(buildRasterizeWarning(node));
    }
    return {
      kind: "bitmap",
      name: node.name,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      opacity: node.opacity,
      visible: node.visible,
      blendMode: node.blendMode,
      effects: node.effects,
      strokeEffect: node.strokeEffect,
      pngBytes: node.pngBytes
    };
  }

  // Legacy bitmap fallback helper kept for emergency debugging only.
  function shouldRasterizeTextNode(node, availableFonts) {
    if (!node || node.kind !== "text" || getByteLength(node.pngBytes) === 0 || !node.text) {
      return false;
    }

    if (isLargeSingleGlyphText(node)) {
      return true;
    }

    const styleRuns = Array.isArray(node.text.styleRuns) ? node.text.styleRuns : [];
    if (styleRuns.length === 0) {
      return false;
    }

    return styleRuns.some(run => !findExactFontMatch(run.style, availableFonts));
  }

  function buildRasterizeWarning(node) {
    const quotedName = typeof node.name === "string" && node.name.trim().length > 0 ? `"${node.name}"` : "This text layer";
    if (isLargeSingleGlyphText(node)) {
      return `${quotedName} was imported as a bitmap to preserve a large single-glyph Photoshop text layer.`;
    }
    return `${quotedName} was imported as a bitmap because an exact Figma font match was not available.`;
  }

  function isLargeSingleGlyphText(node) {
    if (!node || node.kind !== "text" || !node.text || typeof node.text.value !== "string") {
      return false;
    }

    const glyphCount = node.text.value.replace(/\s+/g, "").length;
    if (glyphCount !== 1) {
      return false;
    }

    const baseStyle = node.text.baseStyle || {};
    const fontSize = Number.isFinite(baseStyle.fontSize) ? Number(baseStyle.fontSize) : 0;
    const width = Number.isFinite(node.width) ? Number(node.width) : 0;
    const height = Number.isFinite(node.height) ? Number(node.height) : 0;
    return fontSize >= 72 || width >= 160 || height >= 160;
  }

  function findExactFontMatch(style, availableFonts) {
    if (!style || !Array.isArray(availableFonts)) {
      return null;
    }

    const targetFamily = normalizeFontToken(style.fontFamily);
    const targetStyle = normalizeFontToken(style.fontStyle);
    if (targetFamily.length === 0 || targetStyle.length === 0) {
      return null;
    }

    for (const entry of availableFonts) {
      if (!entry || !entry.fontName) {
        continue;
      }

      const family = normalizeFontToken(entry.fontName.family);
      const fontStyle = normalizeFontToken(entry.fontName.style);
      if (family === targetFamily && fontStyle === targetStyle) {
        return entry.fontName;
      }
    }

    return null;
  }

  async function getAvailableFonts() {
    if (!availableFontsPromise) {
      availableFontsPromise = figma.listAvailableFontsAsync().catch(error => {
        availableFontsPromise = null;
        throw error;
      });
    }

    return availableFontsPromise;
  }

  async function getAvailableFontsSafely() {
    try {
      return await getAvailableFonts();
    } catch (error) {
      console.warn("[pigma-import-text-fix] failed to read available fonts", error);
      return [];
    }
  }

  function normalizeFontToken(value) {
    return typeof value === "string" ? value.trim().toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  }

  function fixSingleImport(payload, root) {
    if (!payload || !hasChildren(root)) {
      debugImportPostprocess("single-skip", "missing-root");
      return;
    }

    markSyntheticImportRoot(root);
    const importRoot = flattenImportedDuplicateRoot(root, payload) || root;
    debugImportPostprocess(
      "single-root",
      [
        `selected=${safeNodeName(root)}`,
        `removed=${!!root.removed}`,
        `result=${safeNodeName(importRoot)}`,
        `resultParent=${safeNodeName(importRoot && importRoot.parent)}`
      ].join(" | ")
    );

    const payloadNodes = getNormalizedPayloadNodes(payload);
    if (!payloadNodes || payload.mode === "flatten-image") {
      setExpandedRecursively(importRoot, true);
      selectImportedNodes([importRoot]);
      return;
    }

    if (shouldApplyScopedTextFixes(payloadNodes, importRoot)) {
      applyTextFixes(payloadNodes, importRoot);
    }
    setExpandedRecursively(importRoot, true);
    selectImportedNodes([importRoot]);
  }

  function fixBatchImport(batch, root) {
    if (!batch || !hasChildren(root) || !Array.isArray(batch.items)) {
      debugImportPostprocess("batch-skip", "missing-root");
      return;
    }

    const items = batch.items.filter(isBatchItemImportable);
    const sections = separateStitchedBatchSections(batch, root, items);
    const count = Math.min(items.length, sections.length);
    const normalizedSections = [];

    for (let index = 0; index < count; index += 1) {
      const item = items[index];
      const section = sections[index];
      if (!item || !hasChildren(section)) {
        continue;
      }

      markSyntheticImportRoot(section);
      const importSection = flattenImportedDuplicateRoot(section, item) || section;
      normalizedSections.push(importSection);

      const payloadNodes = getNormalizedPayloadNodes(item);
      if (!payloadNodes || item.mode === "flatten-image") {
        setExpandedRecursively(importSection, true);
        continue;
      }

      if (shouldApplyScopedTextFixes(payloadNodes, importSection)) {
        applyTextFixes(payloadNodes, importSection);
      }
      setExpandedRecursively(importSection, true);
    }

    if (!root.removed) {
      setExpandedRecursively(root, true);
    }

    selectImportedNodes(normalizedSections);
    debugImportPostprocess("batch-root", `sections=${normalizedSections.length} | rootRemoved=${!!root.removed}`);
  }

  function separateStitchedBatchSections(batch, root, items) {
    if (!shouldSeparateStitchedBatchRoot(batch, root, items)) {
      return Array.from(root.children);
    }

    const parentNode = root && root.parent && hasChildren(root.parent) ? root.parent : null;
    if (!parentNode) {
      return Array.from(root.children);
    }

    const rootBounds = getAbsoluteBounds(root, true);
    const sections = Array.from(root.children);
    const insertionIndex = Math.max(0, Array.from(parentNode.children).indexOf(root));

    for (let index = 0; index < sections.length; index += 1) {
      reparentSceneNode(sections[index], parentNode, insertionIndex + index, 0, 0);
    }

    arrangeBatchSectionsVertically(sections, rootBounds, getBatchFrameGap(batch));

    try {
      root.remove();
    } catch (error) {
      console.warn("[pigma-import-text-fix] failed to remove stitched batch root", error);
    }

    selectImportedBatchSections(sections);
    return sections;
  }

  function shouldSeparateStitchedBatchRoot(batch, root, items) {
    if (!batch || !hasChildren(root)) {
      return false;
    }

    const arrangement = typeof batch.arrangement === "string" ? batch.arrangement : "stitch-vertical";
    if (arrangement !== "stitch-vertical") {
      return false;
    }

    const rootName = normalizeLayerName(root.name);
    if (!rootName.endsWith("stitched")) {
      return false;
    }

    const sections = Array.from(root.children).filter(node => {
      return node && isPositiveDimension(node.width) && isPositiveDimension(node.height);
    });

    if (sections.length < 2) {
      return false;
    }

    if (Array.isArray(items) && items.length > 1 && sections.length < items.length) {
      return false;
    }

    return true;
  }

  function getBatchFrameGap(batch) {
    const gap = Number(batch == null ? void 0 : batch.gap);
    if (Number.isFinite(gap) && gap > 0) {
      return Math.max(0, Math.round(gap));
    }

    return DEFAULT_BATCH_FRAME_GAP;
  }

  function arrangeBatchSectionsVertically(sections, rootBounds, gap) {
    if (!Array.isArray(sections) || sections.length === 0) {
      return;
    }

    const anchorBounds = rootBounds || getAbsoluteBounds(sections[0], true);
    if (!anchorBounds) {
      return;
    }

    const targetX = roundNumber(anchorBounds.x);
    let targetY = roundNumber(anchorBounds.y);
    const itemGap = Math.max(0, Math.round(gap));

    for (const section of sections) {
      const bounds = getAbsoluteBounds(section, true);
      if (!bounds) {
        continue;
      }

      translateSceneNode(section, targetX - bounds.x, targetY - bounds.y);
      targetY += Math.max(1, roundNumber(bounds.height)) + itemGap;
    }
  }

  function selectImportedBatchSections(sections) {
    if (!Array.isArray(sections) || sections.length === 0) {
      return;
    }

    const selectable = sections.filter(node => node && node.parent === figma.currentPage);
    if (selectable.length === 0) {
      return;
    }

    try {
      figma.currentPage.selection = selectable;
    } catch (error) {
      // Ignore selection assignment failures in restricted contexts.
    }
  }

  function flattenImportedDuplicateRoot(root, payload) {
    if (!hasChildren(root)) {
      return root;
    }

    if (isSyntheticImportRoot(root)) {
      const releasedNodes = releaseSyntheticImportRoot(root);
      debugImportPostprocess(
        "synthetic-root",
        `root=${safeNodeName(root)} | released=${releasedNodes.length} | remaining=${hasChildren(root) ? root.children.length : 0}`
      );
      if (releasedNodes.length > 0) {
        return preferPrimaryImportedNode(releasedNodes, payload);
      }
      return root.removed ? null : root;
    }

    const payloadWrapper = getPayloadDuplicateRootWrapper(payload);
    const wrapper = findDuplicateImportedWrapper(root);
    if (!wrapper || !hasChildren(wrapper) || !canFlattenImportedDuplicateRoot(root, wrapper, payloadWrapper)) {
      return root;
    }

    const rootBounds = getAbsoluteBounds(root, true);
    const preferredCanvasBounds = findPreferredSceneCanvasBounds(Array.from(wrapper.children), root);
    const deltaX = rootBounds && preferredCanvasBounds ? roundNumber(rootBounds.x - preferredCanvasBounds.x) : 0;
    const deltaY = rootBounds && preferredCanvasBounds ? roundNumber(rootBounds.y - preferredCanvasBounds.y) : 0;
    const wrapperIndex = Array.from(root.children).indexOf(wrapper);
    const children = Array.from(wrapper.children);

    for (let index = 0; index < children.length; index += 1) {
      reparentSceneNode(children[index], root, Math.max(0, wrapperIndex) + index, deltaX, deltaY);
    }

    wrapper.remove();
    return root;
  }

  function releaseSyntheticImportRoot(root) {
    if (!isSyntheticImportRoot(root) || !hasChildren(root)) {
      return [];
    }

    const parentNode = root.parent && hasChildren(root.parent) ? root.parent : null;
    if (!parentNode) {
      return [];
    }

    const children = Array.from(root.children);
    if (children.length === 0) {
      return [];
    }

    const rootIndex = Math.max(0, Array.from(parentNode.children).indexOf(root));
    for (let index = 0; index < children.length; index += 1) {
      reparentSceneNode(children[index], parentNode, rootIndex + index, 0, 0);
    }

    root.remove();
    return children.filter(node => node && !node.removed);
  }

  function preferPrimaryImportedNode(nodes, payload) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return null;
    }

    const targetName = normalizeLayerName(payload && payload.rootName);
    if (targetName.length > 0) {
      const exactMatch = nodes.find(node => normalizeLayerName(node.name) === targetName);
      if (exactMatch) {
        return exactMatch;
      }
    }

    return nodes[0];
  }

  function debugImportPostprocess(label, detail) {
    if (!IMPORT_POSTPROCESS_DEBUG) {
      return;
    }

    try {
      figma.notify(`[pigma] ${label}: ${detail}`, { timeout: 2500 });
    } catch (error) {
      // Ignore notification failures in restricted contexts.
    }
  }

  function safeNodeName(node) {
    if (!node) {
      return "null";
    }

    if ("name" in node && typeof node.name === "string" && node.name.trim().length > 0) {
      return node.name;
    }

    return node.type || "node";
  }

  function selectImportedNodes(nodes) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return;
    }

    const selectable = nodes.filter(node => node && !node.removed);
    if (selectable.length === 0) {
      return;
    }

    try {
      figma.currentPage.selection = selectable;
    } catch (error) {
      // Ignore selection assignment failures in restricted contexts.
    }
  }

  function getPayloadDuplicateRootWrapper(payload) {
    if (!payload || payload.mode === "flatten-image" || !Array.isArray(payload.nodes) || payload.nodes.length !== 1) {
      return null;
    }

    const node = payload.nodes[0];
    return shouldCollapseRootGroup(payload, node) ? node : null;
  }

  function canFlattenImportedDuplicateRoot(root, wrapper, payloadWrapper) {
    if (!hasChildren(root) || !hasChildren(wrapper) || !isNeutralSceneWrapper(wrapper)) {
      return false;
    }

    if (payloadWrapper && isSyntheticImportRoot(root)) {
      return true;
    }

    const rootBounds = getAbsoluteBounds(root, true);
    const wrapperBounds = getAbsoluteBounds(wrapper, true);
    if (!rootBounds || !wrapperBounds) {
      return false;
    }

    const sameSize =
      dimensionsMatch(wrapperBounds.width, rootBounds.width) &&
      dimensionsMatch(wrapperBounds.height, rootBounds.height);
    const sameOrigin =
      Math.abs(wrapperBounds.x - rootBounds.x) <= 2 &&
      Math.abs(wrapperBounds.y - rootBounds.y) <= 2;

    if (sameSize && sameOrigin) {
      return true;
    }

    const preferredCanvasBounds = findPreferredSceneCanvasBounds(Array.from(wrapper.children), root);
    return !!preferredCanvasBounds &&
      dimensionsMatch(preferredCanvasBounds.width, rootBounds.width) &&
      dimensionsMatch(preferredCanvasBounds.height, rootBounds.height);
  }

  function findDuplicateImportedWrapper(root) {
    if (!hasChildren(root)) {
      return null;
    }

    const rootName = normalizeLayerName(root.name);
    if (rootName.length === 0) {
      return null;
    }

    const candidates = Array.from(root.children).filter(node => {
      return hasChildren(node) && normalizeLayerName(node.name) === rootName;
    });

    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((left, right) => {
      const leftArea = (Number(left.width) || 0) * (Number(left.height) || 0);
      const rightArea = (Number(right.width) || 0) * (Number(right.height) || 0);
      return rightArea - leftArea;
    });

    return candidates[0];
  }

  function isNeutralSceneWrapper(node) {
    if (!node || node.visible === false || node.clipsContent === true) {
      return false;
    }

    if ("opacity" in node && !isNeutralOpacity(node.opacity)) {
      return false;
    }

    if ("blendMode" in node && !isNeutralBlendMode(normalizeSceneBlendMode(node.blendMode))) {
      return false;
    }

    if ("effects" in node && Array.isArray(node.effects) && node.effects.some(isVisibleSceneStyle)) {
      return false;
    }

    if ("fills" in node && Array.isArray(node.fills) && node.fills.some(isVisibleSceneStyle)) {
      return false;
    }

    if ("strokes" in node && Array.isArray(node.strokes) && node.strokes.some(isVisibleSceneStyle)) {
      return false;
    }

    return true;
  }

  function normalizeSceneBlendMode(value) {
    return typeof value === "string" ? value.trim().toLowerCase().replace(/_/g, " ") : "";
  }

  function isVisibleSceneStyle(style) {
    if (!style || style.visible === false) {
      return false;
    }

    if ("opacity" in style && Number.isFinite(style.opacity) && Number(style.opacity) <= 0.001) {
      return false;
    }

    return true;
  }

  function markSyntheticImportRoot(node) {
    if (!node || typeof node.setPluginData !== "function") {
      return;
    }

    try {
      node.setPluginData(IMPORT_SYNTHETIC_ROOT_KEY, "1");
    } catch (error) {
      // Ignore plugin data failures in restricted contexts.
    }
  }

  function isSyntheticImportRoot(node) {
    if (!node || typeof node.getPluginData !== "function") {
      return false;
    }

    try {
      return node.getPluginData(IMPORT_SYNTHETIC_ROOT_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function reparentSceneNode(node, parentNode, index, deltaX, deltaY) {
    if (!node || !parentNode || !hasChildren(parentNode)) {
      return;
    }

    const beforeBounds = getAbsoluteBounds(node, true);
    parentNode.insertChild(index, node);

    const afterBounds = getAbsoluteBounds(node, true);
    const baseX = beforeBounds ? beforeBounds.x : afterBounds ? afterBounds.x : 0;
    const baseY = beforeBounds ? beforeBounds.y : afterBounds ? afterBounds.y : 0;
    const desiredX = roundNumber(baseX + deltaX);
    const desiredY = roundNumber(baseY + deltaY);

    if (!afterBounds) {
      return;
    }

    translateSceneNode(node, desiredX - afterBounds.x, desiredY - afterBounds.y);
  }

  function translateSceneNode(node, deltaX, deltaY) {
    if (!node || (deltaX === 0 && deltaY === 0)) {
      return;
    }

    if (Array.isArray(node.relativeTransform) && node.relativeTransform.length === 2) {
      const transform = node.relativeTransform;
      node.relativeTransform = [
        [transform[0][0], transform[0][1], roundNumber(transform[0][2] + deltaX)],
        [transform[1][0], transform[1][1], roundNumber(transform[1][2] + deltaY)]
      ];
      return;
    }

    if ("x" in node && "y" in node) {
      node.x = roundNumber((Number(node.x) || 0) + deltaX);
      node.y = roundNumber((Number(node.y) || 0) + deltaY);
    }
  }

  function findPreferredSceneCanvasBounds(nodes, root) {
    return collectSceneVisibleBounds(nodes);
  }

  function collectSceneVisibleBounds(nodes) {
    if (!Array.isArray(nodes)) {
      return null;
    }

    let bounds = null;
    for (const node of nodes) {
      if (!node || node.visible === false) {
        continue;
      }

      if (hasChildren(node)) {
        bounds = mergeRectBounds(bounds, collectSceneVisibleBounds(Array.from(node.children)));
      }

      const nodeBounds = getAbsoluteBounds(node, true);
      if (!nodeBounds || !isPositiveDimension(nodeBounds.width) || !isPositiveDimension(nodeBounds.height)) {
        continue;
      }

      bounds = mergeRectBounds(bounds, {
        x: roundNumber(nodeBounds.x),
        y: roundNumber(nodeBounds.y),
        width: Math.max(1, Math.round(Number(nodeBounds.width))),
        height: Math.max(1, Math.round(Number(nodeBounds.height)))
      });
    }

    return bounds;
  }

  function mergeRectBounds(currentBounds, nextBounds) {
    if (!nextBounds) {
      return currentBounds;
    }

    if (!currentBounds) {
      return {
        x: roundNumber(nextBounds.x),
        y: roundNumber(nextBounds.y),
        width: Math.max(1, Math.round(Number(nextBounds.width))),
        height: Math.max(1, Math.round(Number(nextBounds.height)))
      };
    }

    const left = Math.min(currentBounds.x, roundNumber(nextBounds.x));
    const top = Math.min(currentBounds.y, roundNumber(nextBounds.y));
    const right = Math.max(currentBounds.x + currentBounds.width, roundNumber(nextBounds.x) + Math.max(1, Math.round(Number(nextBounds.width))));
    const bottom = Math.max(currentBounds.y + currentBounds.height, roundNumber(nextBounds.y) + Math.max(1, Math.round(Number(nextBounds.height))));

    return {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top)
    };
  }

  // PIGMA_TEXT_IMPORT_GUARD::NO_BROAD_TEXT_UPDATES
  function shouldApplyScopedTextFixes(payloadNodes, parentNode) {
    if (!Array.isArray(payloadNodes) || !hasChildren(parentNode)) {
      return false;
    }

    return countImportedTextNodes(payloadNodes) > 0;
  }

  function countImportedTextNodes(nodes) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return 0;
    }

    let count = 0;
    for (const node of nodes) {
      if (!isSceneNodeImported(node)) {
        continue;
      }

      if (node.kind === "text") {
        count += 1;
        continue;
      }

      if (node.kind === "group" && Array.isArray(node.children)) {
        count += countImportedTextNodes(node.children);
      }
    }

    return count;
  }

  // PIGMA_TEXT_IMPORT_GUARD::TEXT_ALIGNMENT_SCOPE
  function applyTextFixes(payloadNodes, parentNode) {
    if (!Array.isArray(payloadNodes) || !hasChildren(parentNode)) {
      return;
    }

    const importedTextNodesBySourceId = collectImportedTextNodesBySourceId(parentNode);
    const orderedFallbackMatches =
      importedTextNodesBySourceId.size === 0 ? createOrderedTextFallbackMatches(payloadNodes, parentNode) : new Map();

    if (importedTextNodesBySourceId.size === 0 && orderedFallbackMatches.size === 0) {
      console.warn("[pigma-import-text-fix] skipped text alignment because imported source IDs were not tagged");
      return;
    }

    if (importedTextNodesBySourceId.size === 0 && orderedFallbackMatches.size > 0) {
      console.warn("[pigma-import-text-fix] aligned text using ordered fallback because imported source IDs were not tagged");
    }

    applyTextFixesBySourceId(payloadNodes, importedTextNodesBySourceId, orderedFallbackMatches);
  }

  function createOrderedTextFallbackMatches(payloadNodes, parentNode) {
    const payloadTextNodes = collectPayloadTextNodes(payloadNodes);
    const importedTextNodes = collectImportedTextNodes(parentNode);

    if (payloadTextNodes.length === 0 || importedTextNodes.length === 0) {
      return new Map();
    }

    if (payloadTextNodes.length !== importedTextNodes.length) {
      console.warn(
        `[pigma-import-text-fix] skipped ordered text fallback because payload text count (${payloadTextNodes.length}) did not match imported text count (${importedTextNodes.length})`
      );
      return new Map();
    }

    const orderedFallbackMatches = new Map();
    for (let index = 0; index < payloadTextNodes.length; index += 1) {
      orderedFallbackMatches.set(payloadTextNodes[index], importedTextNodes[index]);
    }

    return orderedFallbackMatches;
  }

  function collectPayloadTextNodes(nodes, collected = []) {
    if (!Array.isArray(nodes)) {
      return collected;
    }

    for (const node of nodes) {
      if (!isSceneNodeImported(node)) {
        continue;
      }

      if (node.kind === "text") {
        collected.push(node);
        continue;
      }

      if (node.kind === "group" && Array.isArray(node.children)) {
        collectPayloadTextNodes(node.children, collected);
      }
    }

    return collected;
  }

  function collectImportedTextNodes(parentNode) {
    const importedTextNodes = [];
    collectImportedTextNodesInto(parentNode, importedTextNodes);
    return importedTextNodes;
  }

  function collectImportedTextNodesInto(node, importedTextNodes) {
    if (!node) {
      return;
    }

    if (node.type === "TEXT") {
      importedTextNodes.push(node);
    }

    if (!hasChildren(node)) {
      return;
    }

    for (const child of node.children) {
      collectImportedTextNodesInto(child, importedTextNodes);
    }
  }

  function applyTextFixesBySourceId(payloadNodes, importedTextNodesBySourceId, orderedFallbackMatches) {
    if (!Array.isArray(payloadNodes)) {
      return;
    }

    for (const payloadNode of payloadNodes) {
      if (!isSceneNodeImported(payloadNode)) {
        continue;
      }

      if (payloadNode.kind === "text") {
        const sceneNode = findImportedTextNodeForPayload(payloadNode, importedTextNodesBySourceId, orderedFallbackMatches);
        const sceneParent = sceneNode && hasChildren(sceneNode.parent) ? sceneNode.parent : null;
        if (sceneNode && sceneParent) {
          alignImportedTextNode(sceneNode, payloadNode, sceneParent);
        }
        continue;
      }

      if (payloadNode.kind === "group" && Array.isArray(payloadNode.children)) {
        applyTextFixesBySourceId(payloadNode.children, importedTextNodesBySourceId, orderedFallbackMatches);
      }
    }
  }

  function collectImportedTextNodesBySourceId(parentNode) {
    const importedTextNodesBySourceId = new Map();
    collectImportedTextNodesBySourceIdInto(parentNode, importedTextNodesBySourceId);
    return importedTextNodesBySourceId;
  }

  function collectImportedTextNodesBySourceIdInto(node, importedTextNodesBySourceId) {
    if (!node) {
      return;
    }

    if (node.type === "TEXT") {
      const sourceId = getImportedSourceId(node);
      if (sourceId) {
        importedTextNodesBySourceId.set(sourceId, node);
      }
    }

    if (!hasChildren(node)) {
      return;
    }

    for (const child of node.children) {
      collectImportedTextNodesBySourceIdInto(child, importedTextNodesBySourceId);
    }
  }

  function findImportedTextNodeForPayload(payloadNode, importedTextNodesBySourceId, orderedFallbackMatches) {
    if (!payloadNode || payloadNode.kind !== "text" || !(importedTextNodesBySourceId instanceof Map)) {
      return null;
    }

    const sourceId = getPayloadSourceId(payloadNode);
    if (sourceId) {
      const matchedBySourceId = importedTextNodesBySourceId.get(sourceId);
      if (matchedBySourceId) {
        return matchedBySourceId;
      }
    }

    if (!(orderedFallbackMatches instanceof Map)) {
      return null;
    }

    return orderedFallbackMatches.get(payloadNode) || null;
  }

  function getPayloadSourceId(payloadNode) {
    if (!payloadNode || payloadNode.id == null) {
      return "";
    }

    return String(payloadNode.id);
  }

  function getImportedSourceId(node) {
    if (!node || typeof node.getPluginData !== "function") {
      return "";
    }

    try {
      return String(node.getPluginData(IMPORT_SOURCE_ID_KEY) || "");
    } catch (error) {
      return "";
    }
  }

  function alignImportedTextNode(node, payloadNode, parentNode) {
    const parentBounds = getAbsoluteBounds(parentNode, true);
    const nodeBounds = getAbsoluteBounds(node, true);
    const desiredPosition = getDesiredTextPosition(payloadNode);

    if (!parentBounds || !nodeBounds || !desiredPosition) {
      return;
    }

    const currentX = nodeBounds.x - parentBounds.x;
    const currentY = nodeBounds.y - parentBounds.y;
    const deltaX = roundNumber(desiredPosition.x - currentX);
    const deltaY = roundNumber(desiredPosition.y - currentY);

    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    const transform = node.relativeTransform;
    node.relativeTransform = [
      [transform[0][0], transform[0][1], roundNumber(transform[0][2] + deltaX)],
      [transform[1][0], transform[1][1], roundNumber(transform[1][2] + deltaY)]
    ];
  }

  function getDesiredTextPosition(payloadNode) {
    if (!payloadNode || payloadNode.kind !== "text") {
      return null;
    }

    return (
      getLayerTopLeft(payloadNode) ||
      getTransformTopLeft(payloadNode.text && payloadNode.text.transform) ||
      getRectTopLeft(payloadNode.text && payloadNode.text.boundingBox) ||
      getRectTopLeft(payloadNode.text && payloadNode.text.bounds)
    );
  }

  function getLayerTopLeft(payloadNode) {
    if (!Number.isFinite(payloadNode == null ? void 0 : payloadNode.x) || !Number.isFinite(payloadNode == null ? void 0 : payloadNode.y)) {
      return null;
    }

    return {
      x: roundNumber(payloadNode.x),
      y: roundNumber(payloadNode.y)
    };
  }

  function getRectTopLeft(rect) {
    if (!rect || !Number.isFinite(rect.left) || !Number.isFinite(rect.top)) {
      return null;
    }

    return {
      x: roundNumber(rect.left),
      y: roundNumber(rect.top)
    };
  }

  function getTransformTopLeft(transform) {
    if (!Array.isArray(transform) || transform.length < 6) {
      return null;
    }

    if (!Number.isFinite(transform[4]) || !Number.isFinite(transform[5])) {
      return null;
    }

    return {
      x: roundNumber(transform[4]),
      y: roundNumber(transform[5])
    };
  }

  function getAbsoluteBounds(node, preferBoundingBox) {
    if (!node) {
      return null;
    }

    const primary = preferBoundingBox ? node.absoluteBoundingBox : node.absoluteRenderBounds;
    const fallback = preferBoundingBox ? node.absoluteRenderBounds : node.absoluteBoundingBox;
    const bounds = primary || fallback;

    if (!bounds || !Number.isFinite(bounds.x) || !Number.isFinite(bounds.y)) {
      return null;
    }

    return bounds;
  }

  function hasChildren(node) {
    return !!node && "children" in node && Array.isArray(node.children);
  }

  function setExpandedRecursively(node, expanded) {
    if (!node) {
      return;
    }

    setSceneNodeExpanded(node, expanded);

    if (!hasChildren(node)) {
      return;
    }

    for (const child of node.children) {
      setExpandedRecursively(child, expanded);
    }
  }

  function setSceneNodeExpanded(node, expanded) {
    if (!node || !("expanded" in node)) {
      return;
    }

    try {
      node.expanded = !!expanded;
    } catch (error) {
      // Ignore nodes that expose the property as readonly in the current editor/runtime.
    }
  }

  function isSceneNodeImported(node) {
    if (!node) {
      return false;
    }

    if (node.kind === "group") {
      return node.width > 0 && node.height > 0;
    }

    if (node.kind === "text") {
      return (node.width > 0 && node.height > 0) || getByteLength(node.pngBytes) > 0;
    }

    if (node.kind === "shape") {
      return true;
    }

    return node.width > 0 && node.height > 0 && getByteLength(node.pngBytes) > 0;
  }

  function isBatchItemImportable(item) {
    return !!item && item.documentWidth > 0 && item.documentHeight > 0 && (item.mode === "flatten-image" || (Array.isArray(item.nodes) && item.nodes.length > 0) || getByteLength(item.compositePngBytes) > 0);
  }

  function getByteLength(value) {
    return value && typeof value.length === "number" ? value.length : 0;
  }

  function roundNumber(value) {
    return Number.isFinite(value) ? Math.round(value) : 0;
  }
})();
