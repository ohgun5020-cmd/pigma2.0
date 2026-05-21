;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_TEXT_LINE_HEIGHT_ADJUST_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESULT_PREVIEW_LIMIT = 32;
  const NODE_SCAN_YIELD_INTERVAL = 128;
  const TEXT_NODE_APPLY_YIELD_INTERVAL = 8;
  const CHARACTER_SCAN_YIELD_INTERVAL = 512;
  const FONT_LOAD_YIELD_INTERVAL = 8;
  const HANGUL_SCRIPT = "ko";
  const CJK_SCRIPT = "cjk";
  const LATIN_SCRIPT = "latin";
  const EUROPEAN_SCRIPT = "european";
  const ARABIC_SCRIPT = "arabic";
  const HEBREW_SCRIPT = "hebrew";
  const THAI_SCRIPT = "thai";
  const INDIC_SCRIPT = "indic";
  // Line height uses script groups: CJK/Korean follows KRDS-like 130/140/150%,
  // Latin/European follows Material type-scale anchors, and complex scripts
  // keep at least readable paragraph spacing to avoid clipping marks.
  const MATERIAL_LATIN_LINE_HEIGHT_ANCHORS = [
    { size: 10, lineHeight: 16 },
    { size: 12, lineHeight: 16 },
    { size: 14, lineHeight: 20 },
    { size: 16, lineHeight: 24 },
    { size: 20, lineHeight: 32 },
    { size: 24, lineHeight: 32 },
    { size: 34, lineHeight: 40 },
    { size: 48, lineHeight: 56 },
    { size: 60, lineHeight: 72 },
    { size: 96, lineHeight: 112 },
  ];
  let isRunning = false;
  const loadedFontPromiseCache = new Map();

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isTextLineHeightMessage(message)) {
      await runTextLineHeightAdjust();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_TEXT_LINE_HEIGHT_ADJUST_PATCH__ = true;

  function isTextLineHeightMessage(message) {
    return !!message && message.type === "run-text-line-height-adjust";
  }

  async function runTextLineHeightAdjust() {
    if (isRunning) {
      postStatus("running", "\uD14D\uC2A4\uD2B8 \uD589\uAC04\uC744 \uC870\uC815\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");
      return;
    }

    isRunning = true;
    postStatus("running", "\uC120\uD0DD\uD55C \uD14D\uC2A4\uD2B8\uC758 \uC5B8\uC5B4\uC640 \uD06C\uAE30\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");

    try {
      const result = await applyTextLineHeightAdjust();
      figma.ui.postMessage({
        type: "text-line-height-adjust-result",
        result,
      });
      figma.notify(buildResultToast(result), { timeout: 2400 });
    } catch (error) {
      const message = normalizeErrorMessage(
        error,
        "\uD14D\uC2A4\uD2B8 \uD589\uAC04\uC744 \uC870\uC815\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."
      );
      figma.ui.postMessage({
        type: "text-line-height-adjust-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2600 });
    } finally {
      isRunning = false;
    }
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "text-line-height-adjust-status",
      status,
      message,
    });
  }

  function waitForLineHeightTurn() {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  async function yieldLineHeightTurn(index, interval) {
    const step = Math.max(1, Math.floor(Number(interval) || 1));
    if (index > 0 && index % step === 0) {
      await waitForLineHeightTurn();
    }
  }

  async function applyTextLineHeightAdjust() {
    await ensureSelectionAccess();

    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("\uD589\uAC04\uC744 \uC870\uC815\uD560 \uD14D\uC2A4\uD2B8\uB098 \uD504\uB808\uC784\uC744 \uBA3C\uC800 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.");
    }

    const textNodes = await collectTextNodes(selection);
    if (!textNodes.length) {
      throw new Error("\uC120\uD0DD\uC5D0\uC11C \uC870\uC815\uD560 \uD14D\uC2A4\uD2B8 \uB808\uC774\uC5B4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    const adjusted = [];
    const skipped = [];

    for (let index = 0; index < textNodes.length; index += 1) {
      await yieldLineHeightTurn(index, TEXT_NODE_APPLY_YIELD_INTERVAL);
      if (index > 0 && index % Math.max(TEXT_NODE_APPLY_YIELD_INTERVAL * 4, 1) === 0) {
        postStatus(
          "running",
          "\uD14D\uC2A4\uD2B8 \uD589\uAC04\uC744 \uC870\uC815\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. (" +
            (index + 1) +
            "/" +
            textNodes.length +
            ")"
        );
      }
      const textNode = textNodes[index];
      try {
        adjusted.push(await adjustSingleTextNode(textNode));
      } catch (error) {
        skipped.push({
          nodeId: safeNodeId(textNode),
          nodeName: safeName(textNode),
          nodeType: safeNodeType(textNode),
          reason: normalizeErrorMessage(error, "\uC774 \uD14D\uC2A4\uD2B8\uB294 \uD589\uAC04\uC744 \uC870\uC815\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."),
        });
      }
    }

    if (!adjusted.length) {
      const reason = skipped.length
        ? skipped[0].reason
        : "\uC801\uC6A9\uD560 \uD14D\uC2A4\uD2B8\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
      throw new Error(reason);
    }

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionCount: selection.length,
        textCount: textNodes.length,
        adjustedCount: adjusted.length,
        skippedCount: skipped.length,
      },
      adjusted: adjusted.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  async function adjustSingleTextNode(textNode) {
    if (!textNode || textNode.removed || textNode.type !== "TEXT") {
      throw new Error("\uD14D\uC2A4\uD2B8 \uB808\uC774\uC5B4\uAC00 \uC544\uB2D9\uB2C8\uB2E4.");
    }

    const characters = typeof textNode.characters === "string" ? textNode.characters : "";
    if (!characters.length || !characters.replace(/\s+/g, "").length) {
      throw new Error("\uBE48 \uD14D\uC2A4\uD2B8\uB294 \uAC74\uB108\uB701\uB2C8\uB2E4.");
    }

    await loadFontsForTextNode(textNode);

    const dominantScript = await detectDominantScript(characters);
    const runs = await buildTypographyRuns(textNode, characters, dominantScript);
    if (!runs.length) {
      throw new Error("\uD589\uAC04 \uAE30\uC900\uC744 \uACC4\uC0B0\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    const beforeLineHeight = describeLineHeight(textNode.lineHeight);
    for (let index = 0; index < runs.length; index += 1) {
      await yieldLineHeightTurn(index, TEXT_NODE_APPLY_YIELD_INTERVAL);
      const run = runs[index];
      applyLineHeightRange(textNode, run.start, run.end, run.lineHeight);
    }

    return {
      nodeId: safeNodeId(textNode),
      nodeName: safeName(textNode),
      language: describeScriptLanguage(dominantScript),
      beforeLineHeight,
      lineHeightTargets: summarizeTargets(runs, "lineHeight", "px"),
      characterCount: characters.length,
    };
  }

  async function buildTypographyRuns(textNode, characters, dominantScript) {
    const runs = [];
    let runStart = -1;
    let runEnd = -1;
    let runLineHeight = null;
    let lastScript = dominantScript;

    for (let index = 0; index < characters.length; index += 1) {
      await yieldLineHeightTurn(index, CHARACTER_SCAN_YIELD_INTERVAL);
      const rawScript = classifyCharacterScript(characters[index]);
      const script = rawScript || lastScript || dominantScript;
      if (rawScript) {
        lastScript = rawScript;
      }

      const fontSize = resolveFontSizeAt(textNode, index);
      const lineHeight = resolveTargetLineHeightPx(script, fontSize);
      if (!Number.isFinite(lineHeight)) {
        continue;
      }

      if (runStart < 0) {
        runStart = index;
        runEnd = index + 1;
        runLineHeight = lineHeight;
        continue;
      }

      if (lineHeight === runLineHeight && index === runEnd) {
        runEnd = index + 1;
        continue;
      }

      runs.push({ start: runStart, end: runEnd, lineHeight: runLineHeight });
      runStart = index;
      runEnd = index + 1;
      runLineHeight = lineHeight;
    }

    if (runStart >= 0 && runEnd > runStart) {
      runs.push({ start: runStart, end: runEnd, lineHeight: runLineHeight });
    }

    return runs;
  }

  function resolveTargetLineHeightPx(script, fontSize) {
    const size = Math.max(1, Number(fontSize) || 16);
    if (script === HANGUL_SCRIPT || script === CJK_SCRIPT) {
      const ratio = size >= 40 ? 1.3 : size >= 24 ? 1.4 : 1.5;
      return Math.max(1, Math.round(size * ratio));
    }

    const materialLineHeight = interpolateLatinMaterialLineHeight(size);
    if (isComplexScript(script)) {
      return Math.max(materialLineHeight, Math.round(size * 1.5));
    }
    return materialLineHeight;
  }

  function interpolateLatinMaterialLineHeight(size) {
    if (size <= MATERIAL_LATIN_LINE_HEIGHT_ANCHORS[0].size) {
      return MATERIAL_LATIN_LINE_HEIGHT_ANCHORS[0].lineHeight;
    }

    const last = MATERIAL_LATIN_LINE_HEIGHT_ANCHORS[MATERIAL_LATIN_LINE_HEIGHT_ANCHORS.length - 1];
    if (size >= last.size) {
      return last.lineHeight;
    }

    for (let index = 1; index < MATERIAL_LATIN_LINE_HEIGHT_ANCHORS.length; index += 1) {
      const right = MATERIAL_LATIN_LINE_HEIGHT_ANCHORS[index];
      const left = MATERIAL_LATIN_LINE_HEIGHT_ANCHORS[index - 1];
      if (size > right.size) {
        continue;
      }
      const progress = (size - left.size) / Math.max(1, right.size - left.size);
      return Math.max(1, Math.round(left.lineHeight + (right.lineHeight - left.lineHeight) * progress));
    }

    return Math.max(1, Math.round(size * 1.5));
  }

  function isComplexScript(script) {
    return script === ARABIC_SCRIPT || script === HEBREW_SCRIPT || script === THAI_SCRIPT || script === INDIC_SCRIPT;
  }

  function applyLineHeightRange(textNode, start, end, lineHeight) {
    const value = {
      unit: "PIXELS",
      value: lineHeight,
    };

    if (typeof textNode.setRangeLineHeight === "function") {
      textNode.setRangeLineHeight(start, end, value);
      return;
    }

    textNode.lineHeight = value;
  }

  async function collectTextNodes(nodes) {
    const result = [];
    const seen = {};
    const stack = Array.isArray(nodes) ? nodes.slice() : [];
    let scannedCount = 0;

    while (stack.length > 0) {
      await yieldLineHeightTurn(scannedCount, NODE_SCAN_YIELD_INTERVAL);
      scannedCount += 1;
      const node = stack.pop();
      if (!node || node.removed) {
        continue;
      }

      if (node.type === "TEXT") {
        const id = safeNodeId(node);
        if (!id || !seen[id]) {
          if (id) {
            seen[id] = true;
          }
          result.push(node);
        }
        continue;
      }

      if (Array.isArray(node.children)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return result;
  }

  async function loadFontsForTextNode(node) {
    const fonts = [];
    const characters = typeof node.characters === "string" ? node.characters : "";
    if (characters.length > 0 && typeof node.getRangeAllFontNames === "function") {
      const rangeFonts = node.getRangeAllFontNames(0, characters.length);
      for (let index = 0; index < rangeFonts.length; index += 1) {
        appendFontName(fonts, rangeFonts[index]);
      }
    } else {
      appendFontName(fonts, node.fontName);
    }

    for (let index = 0; index < fonts.length; index += 1) {
      await yieldLineHeightTurn(index, FONT_LOAD_YIELD_INTERVAL);
      await loadFontWithCache(fonts[index]);
    }
  }

  async function loadFontWithCache(fontName) {
    const key = getFontKey(fontName);
    if (!key) {
      return;
    }

    let pending = loadedFontPromiseCache.get(key);
    if (!pending) {
      pending = figma.loadFontAsync({
        family: fontName.family,
        style: fontName.style,
      });
      loadedFontPromiseCache.set(key, pending);
    }

    await pending;
  }

  function appendFontName(list, fontName) {
    if (!fontName || typeof fontName !== "object") {
      return;
    }
    if (typeof fontName.family !== "string" || typeof fontName.style !== "string") {
      return;
    }
    const key = fontName.family + "\u0000" + fontName.style;
    for (let index = 0; index < list.length; index += 1) {
      if (list[index].family + "\u0000" + list[index].style === key) {
        return;
      }
    }
    list.push({ family: fontName.family, style: fontName.style });
  }

  function getFontKey(fontName) {
    if (!fontName || typeof fontName !== "object") {
      return "";
    }
    if (typeof fontName.family !== "string" || typeof fontName.style !== "string") {
      return "";
    }
    return fontName.family + "\u0000" + fontName.style;
  }

  function resolveFontSizeAt(node, index) {
    if (typeof node.fontSize === "number" && Number.isFinite(node.fontSize)) {
      return node.fontSize;
    }
    if (typeof node.getRangeFontSize === "function") {
      const size = node.getRangeFontSize(index, index + 1);
      if (typeof size === "number" && Number.isFinite(size)) {
        return size;
      }
    }
    return 16;
  }

  async function detectDominantScript(value) {
    const counts = {
      ko: 0,
      cjk: 0,
      latin: 0,
      european: 0,
      arabic: 0,
      hebrew: 0,
      thai: 0,
      indic: 0,
    };
    const text = String(value || "");
    for (let index = 0; index < text.length; index += 1) {
      await yieldLineHeightTurn(index, CHARACTER_SCAN_YIELD_INTERVAL);
      const script = classifyCharacterScript(text[index]);
      if (script && Object.prototype.hasOwnProperty.call(counts, script)) {
        counts[script] += 1;
      }
    }

    let bestScript = LATIN_SCRIPT;
    let bestCount = 0;
    const scripts = [HANGUL_SCRIPT, CJK_SCRIPT, LATIN_SCRIPT, EUROPEAN_SCRIPT, ARABIC_SCRIPT, HEBREW_SCRIPT, THAI_SCRIPT, INDIC_SCRIPT];
    for (let index = 0; index < scripts.length; index += 1) {
      const script = scripts[index];
      const count = counts[script] || 0;
      if (count > bestCount) {
        bestScript = script;
        bestCount = count;
      }
    }
    return bestScript;
  }

  function classifyCharacterScript(character) {
    const code = character ? character.charCodeAt(0) : 0;
    if (
      (code >= 0xac00 && code <= 0xd7af) ||
      (code >= 0x1100 && code <= 0x11ff) ||
      (code >= 0x3130 && code <= 0x318f)
    ) {
      return HANGUL_SCRIPT;
    }
    if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3040 && code <= 0x30ff)) {
      return CJK_SCRIPT;
    }
    if (
      (code >= 0x0041 && code <= 0x005a) ||
      (code >= 0x0061 && code <= 0x007a) ||
      (code >= 0x0030 && code <= 0x0039) ||
      isLatinExtendedCode(code)
    ) {
      return LATIN_SCRIPT;
    }
    if (isEuropeanAlphabeticCode(code)) {
      return EUROPEAN_SCRIPT;
    }
    if (isArabicCode(code)) {
      return ARABIC_SCRIPT;
    }
    if (isHebrewCode(code)) {
      return HEBREW_SCRIPT;
    }
    if (isThaiCode(code)) {
      return THAI_SCRIPT;
    }
    if (isIndicCode(code)) {
      return INDIC_SCRIPT;
    }
    return "";
  }

  function isLatinExtendedCode(code) {
    return (
      (code >= 0x00c0 && code <= 0x024f) ||
      (code >= 0x1e00 && code <= 0x1eff) ||
      (code >= 0x2c60 && code <= 0x2c7f) ||
      (code >= 0xa720 && code <= 0xa7ff) ||
      (code >= 0xab30 && code <= 0xab6f)
    );
  }

  function isEuropeanAlphabeticCode(code) {
    return (
      (code >= 0x0370 && code <= 0x03ff) ||
      (code >= 0x0400 && code <= 0x052f) ||
      (code >= 0x1f00 && code <= 0x1fff)
    );
  }

  function isArabicCode(code) {
    return (
      (code >= 0x0600 && code <= 0x06ff) ||
      (code >= 0x0750 && code <= 0x077f) ||
      (code >= 0x08a0 && code <= 0x08ff) ||
      (code >= 0xfb50 && code <= 0xfdff) ||
      (code >= 0xfe70 && code <= 0xfeff)
    );
  }

  function isHebrewCode(code) {
    return code >= 0x0590 && code <= 0x05ff;
  }

  function isThaiCode(code) {
    return code >= 0x0e00 && code <= 0x0e7f;
  }

  function isIndicCode(code) {
    return (
      (code >= 0x0900 && code <= 0x097f) ||
      (code >= 0x0980 && code <= 0x09ff) ||
      (code >= 0x0a00 && code <= 0x0a7f) ||
      (code >= 0x0a80 && code <= 0x0aff) ||
      (code >= 0x0b00 && code <= 0x0b7f) ||
      (code >= 0x0b80 && code <= 0x0bff) ||
      (code >= 0x0c00 && code <= 0x0c7f) ||
      (code >= 0x0c80 && code <= 0x0cff) ||
      (code >= 0x0d00 && code <= 0x0d7f)
    );
  }

  function describeScriptLanguage(script) {
    if (script === HANGUL_SCRIPT) {
      return "ko";
    }
    if (script === CJK_SCRIPT) {
      return "cjk";
    }
    if (script === EUROPEAN_SCRIPT) {
      return "european";
    }
    if (script === ARABIC_SCRIPT) {
      return "arabic";
    }
    if (script === HEBREW_SCRIPT) {
      return "hebrew";
    }
    if (script === THAI_SCRIPT) {
      return "thai";
    }
    if (script === INDIC_SCRIPT) {
      return "indic";
    }
    return "latin";
  }

  function summarizeTargets(runs, key, suffix) {
    const values = [];
    const seen = {};
    for (let index = 0; index < runs.length; index += 1) {
      const value = runs[index] ? runs[index][key] : null;
      const seenKey = String(value);
      if (seen[seenKey]) {
        continue;
      }
      seen[seenKey] = true;
      values.push(value + suffix);
    }
    return values.join(", ");
  }

  function describeLineHeight(lineHeight) {
    if (lineHeight && typeof lineHeight === "object") {
      const unit = lineHeight.unit || "";
      const value = Number(lineHeight.value);
      if (unit === "AUTO") {
        return "auto";
      }
      if (Number.isFinite(value)) {
        return value + (unit === "PERCENT" ? "%" : "px");
      }
    }
    return "mixed";
  }

  function buildResultToast(result) {
    const summary = result && result.summary ? result.summary : {};
    const adjustedCount = Number(summary.adjustedCount) || 0;
    const skippedCount = Number(summary.skippedCount) || 0;
    if (skippedCount > 0) {
      return "\uD14D\uC2A4\uD2B8 \uD589\uAC04 " + adjustedCount + "\uAC1C \uC870\uC815, " + skippedCount + "\uAC1C \uAC74\uB108\uB700";
    }
    return "\uD14D\uC2A4\uD2B8 \uD589\uAC04 " + adjustedCount + "\uAC1C\uB97C \uC870\uC815\uD588\uC2B5\uB2C8\uB2E4.";
  }

  async function ensureSelectionAccess() {
    if (typeof figma.loadAllPagesAsync !== "function") {
      return;
    }
    try {
      await figma.loadAllPagesAsync();
    } catch (error) {
      console.warn("[pigma] text line height selection preload failed:", error);
    }
  }

  function safeNodeId(node) {
    return node && typeof node.id === "string" ? node.id : "";
  }

  function safeName(node) {
    return node && typeof node.name === "string" && node.name.trim() ? node.name.trim() : "\uC774\uB984 \uC5C6\uC74C";
  }

  function safeNodeType(node) {
    return node && typeof node.type === "string" ? node.type : "UNKNOWN";
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
