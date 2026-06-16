;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_TEXT_STYLE_NORMALIZE_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESULT_PREVIEW_LIMIT = 32;
  const NODE_SCAN_YIELD_INTERVAL = 128;
  const CHARACTER_SCAN_YIELD_INTERVAL = 512;
  const APPLY_YIELD_INTERVAL = 8;
  const FONT_LOAD_YIELD_INTERVAL = 8;
  const VIEWPORT_FOCUS_LIMIT = 80;
  const FONT_SIZE_THRESHOLD = 0.12;
  const LINE_HEIGHT_PX_THRESHOLD = 0.35;
  const LINE_HEIGHT_PERCENT_THRESHOLD = 0.75;
  const COLOR_DELTA_E_THRESHOLD = 1.6;
  const COLOR_RGB_CHANNEL_THRESHOLD = 2;
  const COLOR_ALPHA_THRESHOLD = 0.015;
  const MAX_TEXT_RANGE_SCAN = 20000;
  let isRunning = false;
  const loadedFontPromiseCache = new Map();

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isTextStyleNormalizeMessage(message)) {
      if (isRunning) {
        postStatus("running", "\uD14D\uC2A4\uD2B8 \uC2A4\uD0C0\uC77C\uC744 \uC815\uB9AC\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");
        return;
      }

      await runTextStyleNormalize();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_TEXT_STYLE_NORMALIZE_PATCH__ = true;

  function isTextStyleNormalizeMessage(message) {
    return !!message && message.type === "run-text-style-normalize";
  }

  async function runTextStyleNormalize() {
    isRunning = true;
    postStatus(
      "running",
      "\uC120\uD0DD \uBC94\uC704\uC758 \uD14D\uC2A4\uD2B8 \uD06C\uAE30, \uD589\uAC04, \uC0C9\uC744 \uC2A4\uCE94\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4."
    );

    try {
      const result = await normalizeTextStyles();
      figma.ui.postMessage({
        type: "text-style-normalize-result",
        result,
      });
      figma.notify(buildResultToast(result), { timeout: 2600 });
    } catch (error) {
      const message = normalizeErrorMessage(error, "\uD14D\uC2A4\uD2B8 \uC2A4\uD0C0\uC77C\uC744 \uC815\uB9AC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      figma.ui.postMessage({
        type: "text-style-normalize-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 3000 });
    } finally {
      isRunning = false;
    }
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "text-style-normalize-status",
      status,
      message,
    });
  }

  async function normalizeTextStyles() {
    await ensureSelectionAccess();

    const selection = Array.from(figma.currentPage.selection || []).filter(Boolean);
    if (!selection.length) {
      throw new Error("\uC2A4\uD0C0\uC77C\uC744 \uC815\uB9AC\uD560 \uD14D\uC2A4\uD2B8\uB098 \uD504\uB808\uC784\uC744 \uC120\uD0DD\uD558\uC138\uC694.");
    }

    const context = buildScopeContext(selection);
    const textNodes = await collectTextNodes(context.scopes);
    if (!textNodes.length) {
      throw new Error("\uC120\uD0DD \uBC94\uC704\uC5D0\uC11C \uC815\uB9AC\uD560 \uD14D\uC2A4\uD2B8 \uB808\uC774\uC5B4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    const collection = await collectTextStyleOccurrences(textNodes);
    if (!collection.occurrences.length) {
      throw new Error("\uBE44\uC2B7\uD55C \uD14D\uC2A4\uD2B8 \uC2A4\uD0C0\uC77C\uC744 \uACC4\uC0B0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
    }

    const clusters = buildSimilarStyleClusters(collection.occurrences);
    const applied = await applyStyleClusters(clusters);
    selectChangedTextNodes(applied.changed);

    return buildResult({
      selection,
      scopes: context.scopes,
      textNodes,
      collection,
      clusters,
      applied,
    });
  }

  function buildScopeContext(selection) {
    const scopes = [];
    const seen = {};
    for (let index = 0; index < selection.length; index += 1) {
      const node = selection[index];
      if (isFrameLikeScopeNode(node)) {
        addUniqueNode(scopes, seen, node);
      }
    }
    if (!scopes.length) {
      for (let index = 0; index < selection.length; index += 1) {
        addUniqueNode(scopes, seen, selection[index]);
      }
    }
    return { scopes };
  }

  async function collectTextNodes(scopes) {
    const result = [];
    const seen = {};
    const stack = [];
    for (let index = scopes.length - 1; index >= 0; index -= 1) {
      const scope = scopes[index];
      if (scope && !scope.removed) {
        stack.push(scope);
      }
    }

    let scannedCount = 0;
    while (stack.length > 0) {
      await yieldStyleTurn(scannedCount, NODE_SCAN_YIELD_INTERVAL);
      scannedCount += 1;

      const node = stack.pop();
      if (!node || node.removed) {
        continue;
      }

      const nodeId = safeNodeId(node);
      if (nodeId && seen[nodeId]) {
        continue;
      }
      if (nodeId) {
        seen[nodeId] = true;
      }

      if (node.visible === false) {
        continue;
      }

      if (node.type === "TEXT") {
        result.push(node);
      }

      const children = getChildren(node);
      for (let childIndex = children.length - 1; childIndex >= 0; childIndex -= 1) {
        stack.push(children[childIndex]);
      }
    }

    return result;
  }

  async function collectTextStyleOccurrences(textNodes) {
    const occurrences = [];
    const skipped = [];
    let scannedCharacterCount = 0;
    let truncatedTextCount = 0;

    for (let index = 0; index < textNodes.length; index += 1) {
      await yieldStyleTurn(index, APPLY_YIELD_INTERVAL);
      if (index > 0 && index % Math.max(APPLY_YIELD_INTERVAL * 4, 1) === 0) {
        postStatus(
          "running",
          "\uD14D\uC2A4\uD2B8 \uC2A4\uD0C0\uC77C\uC744 \uC2A4\uCE94\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. (" + (index + 1) + "/" + textNodes.length + ")"
        );
      }
      const textNode = textNodes[index];
      try {
        const runs = await collectTextNodeStyleRuns(textNode);
        for (let runIndex = 0; runIndex < runs.length; runIndex += 1) {
          occurrences.push(runs[runIndex]);
          scannedCharacterCount += Math.max(0, runs[runIndex].end - runs[runIndex].start);
        }
        const characters = typeof textNode.characters === "string" ? textNode.characters : "";
        if (characters.length > MAX_TEXT_RANGE_SCAN) {
          truncatedTextCount += 1;
        }
      } catch (error) {
        skipped.push({
          nodeId: safeNodeId(textNode),
          nodeName: safeName(textNode),
          nodeType: safeNodeType(textNode),
          reason: normalizeErrorMessage(error, "\uC774 \uD14D\uC2A4\uD2B8\uB294 \uC2A4\uD0C0\uC77C\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."),
        });
      }
    }

    return {
      occurrences,
      skipped,
      scannedCharacterCount,
      truncatedTextCount,
    };
  }

  async function collectTextNodeStyleRuns(textNode) {
    if (!textNode || textNode.removed || textNode.type !== "TEXT") {
      throw new Error("\uD14D\uC2A4\uD2B8 \uB808\uC774\uC5B4\uAC00 \uC544\uB2D9\uB2C8\uB2E4.");
    }

    const characters = typeof textNode.characters === "string" ? textNode.characters : "";
    if (!characters.length || !characters.replace(/\s+/g, "").length) {
      return [];
    }

    const limit = Math.min(characters.length, MAX_TEXT_RANGE_SCAN);
    const runs = [];
    let active = null;

    for (let index = 0; index < limit; index += 1) {
      await yieldStyleTurn(index, CHARACTER_SCAN_YIELD_INTERVAL);
      const style = readTextStyleAt(textNode, index);
      if (!style) {
        if (active) {
          runs.push(active);
          active = null;
        }
        continue;
      }

      const key = textStyleExactKey(style);
      const isContent = /\S/.test(characters[index]);
      if (active && active.exactKey === key && active.end === index) {
        active.end = index + 1;
        if (isContent) {
          active.characterCount += 1;
        }
        continue;
      }

      if (active) {
        runs.push(active);
      }

      active = {
        node: textNode,
        nodeId: safeNodeId(textNode),
        nodeName: safeName(textNode),
        nodeType: safeNodeType(textNode),
        start: index,
        end: index + 1,
        characterCount: isContent ? 1 : 0,
        style,
        exactKey: key,
      };
    }

    if (active) {
      runs.push(active);
    }

    return runs.filter((run) => run.characterCount > 0);
  }

  function readTextStyleAt(textNode, index) {
    const fontName = readRangeFontName(textNode, index);
    const fontSize = readRangeFontSize(textNode, index);
    if (!Number.isFinite(fontSize)) {
      return null;
    }

    const lineHeight = normalizeLineHeight(readRangeLineHeight(textNode, index), fontSize);
    const fill = readRangeTextFill(textNode, index);
    return {
      fontName,
      fontKey: fontNameKey(fontName),
      fontSize,
      lineHeight,
      color: fill ? fill.color : null,
      colorEditable: !!(fill && fill.editable),
      colorPaintIndex: fill ? fill.index : -1,
    };
  }

  function readRangeFontName(textNode, index) {
    let fontName = null;
    try {
      if (typeof textNode.getRangeFontName === "function") {
        fontName = textNode.getRangeFontName(index, index + 1);
      }
    } catch (error) {
      fontName = null;
    }
    if (!fontName || isMixedValue(fontName)) {
      fontName = textNode.fontName;
    }
    if (!fontName || isMixedValue(fontName) || typeof fontName !== "object") {
      return null;
    }
    if (typeof fontName.family !== "string" || typeof fontName.style !== "string") {
      return null;
    }
    return { family: fontName.family, style: fontName.style };
  }

  function readRangeFontSize(textNode, index) {
    let value = null;
    try {
      if (typeof textNode.getRangeFontSize === "function") {
        value = textNode.getRangeFontSize(index, index + 1);
      }
    } catch (error) {
      value = null;
    }
    if (!Number.isFinite(Number(value))) {
      value = textNode.fontSize;
    }
    const size = Number(value);
    return Number.isFinite(size) && size > 0 ? size : null;
  }

  function readRangeLineHeight(textNode, index) {
    let lineHeight = null;
    try {
      if (typeof textNode.getRangeLineHeight === "function") {
        lineHeight = textNode.getRangeLineHeight(index, index + 1);
      }
    } catch (error) {
      lineHeight = null;
    }
    if (!lineHeight || isMixedValue(lineHeight)) {
      lineHeight = textNode.lineHeight;
    }
    return lineHeight;
  }

  function readRangeTextFill(textNode, index) {
    let fills = null;
    try {
      if (typeof textNode.getRangeFills === "function") {
        fills = textNode.getRangeFills(index, index + 1);
      }
    } catch (error) {
      fills = null;
    }
    if (!Array.isArray(fills)) {
      fills = Array.isArray(textNode.fills) ? textNode.fills : null;
    }
    return getFirstSolidPaintInfo(fills);
  }

  function buildSimilarStyleClusters(occurrences) {
    const stats = [];
    const byKey = {};

    for (let index = 0; index < occurrences.length; index += 1) {
      const occurrence = occurrences[index];
      const key = occurrence.exactKey;
      let stat = byKey[key];
      if (!stat) {
        stat = {
          key,
          style: occurrence.style,
          occurrences: [],
          firstIndex: index,
          characterCount: 0,
        };
        byKey[key] = stat;
        stats.push(stat);
      }
      stat.occurrences.push(occurrence);
      stat.characterCount += Math.max(1, occurrence.characterCount || 0);
    }

    stats.sort(compareStyleStats);

    const used = {};
    const clusters = [];
    for (let index = 0; index < stats.length; index += 1) {
      const representative = stats[index];
      if (!representative || used[representative.key]) {
        continue;
      }
      used[representative.key] = true;
      const members = [representative];

      for (let nextIndex = index + 1; nextIndex < stats.length; nextIndex += 1) {
        const candidate = stats[nextIndex];
        if (!candidate || used[candidate.key]) {
          continue;
        }
        if (matchesStyleCluster(representative.style, candidate.style)) {
          used[candidate.key] = true;
          members.push(candidate);
        }
      }

      if (members.length > 1) {
        clusters.push({ representative, members });
      }
    }

    return clusters;
  }

  function compareStyleStats(first, second) {
    const firstScore = styleCleanScore(first.style);
    const secondScore = styleCleanScore(second.style);
    if (secondScore !== firstScore) {
      return secondScore - firstScore;
    }
    if (second.characterCount !== first.characterCount) {
      return second.characterCount - first.characterCount;
    }
    if (second.occurrences.length !== first.occurrences.length) {
      return second.occurrences.length - first.occurrences.length;
    }
    return first.firstIndex - second.firstIndex;
  }

  function matchesStyleCluster(base, candidate) {
    if (!base || !candidate) {
      return false;
    }
    if (base.fontKey !== candidate.fontKey) {
      return false;
    }

    const baseFontTarget = resolveFontSizeSnapTarget(base.fontSize);
    const candidateFontTarget = resolveFontSizeSnapTarget(candidate.fontSize);
    if (!sameSnapTarget(baseFontTarget, candidateFontTarget)) {
      return false;
    }

    if (!matchesLineHeight(base.lineHeight, candidate.lineHeight)) {
      return false;
    }
    return matchesTextColor(base.color, candidate.color);
  }

  function matchesLineHeight(base, candidate) {
    if (!base || !candidate) {
      return false;
    }
    if (base.kind === "auto" || candidate.kind === "auto") {
      return base.kind === "auto" && candidate.kind === "auto";
    }

    const baseTarget = resolveLineHeightSnapTarget(base);
    const candidateTarget = resolveLineHeightSnapTarget(candidate);
    if (!sameSnapTarget(baseTarget, candidateTarget)) {
      return false;
    }

    if (Number.isFinite(base.px) && Number.isFinite(candidate.px)) {
      return Math.abs(base.px - candidate.px) <= LINE_HEIGHT_PX_THRESHOLD;
    }
    if (base.unit === "PERCENT" && candidate.unit === "PERCENT") {
      return Math.abs(base.value - candidate.value) <= LINE_HEIGHT_PERCENT_THRESHOLD;
    }
    return false;
  }

  function matchesTextColor(base, candidate) {
    if (!base && !candidate) {
      return true;
    }
    if (!base || !candidate) {
      return false;
    }
    return (
      maxRgbChannelDelta(base, candidate) <= COLOR_RGB_CHANNEL_THRESHOLD &&
      colorDistance(base, candidate) <= COLOR_DELTA_E_THRESHOLD &&
      Math.abs(base.a - candidate.a) <= COLOR_ALPHA_THRESHOLD
    );
  }

  function resolveFontSizeSnapTarget(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return null;
    }
    const integerTarget = Math.round(number);
    if (Math.abs(number - integerTarget) <= FONT_SIZE_THRESHOLD) {
      return {
        unit: "px",
        value: integerTarget,
      };
    }
    const halfTarget = Math.round(number * 2) / 2;
    if (Math.abs(number - halfTarget) <= FONT_SIZE_THRESHOLD) {
      return {
        unit: "px",
        value: halfTarget,
      };
    }
    return null;
  }

  function resolveLineHeightSnapTarget(lineHeight) {
    if (!lineHeight || lineHeight.kind !== "number") {
      return null;
    }
    if (lineHeight.unit === "PERCENT") {
      const percentTarget = Math.round(Number(lineHeight.value) / 5) * 5;
      if (Math.abs(Number(lineHeight.value) - percentTarget) <= LINE_HEIGHT_PERCENT_THRESHOLD) {
        return {
          unit: "PERCENT",
          value: percentTarget,
        };
      }
      return null;
    }

    const pxTarget = Math.round(Number(lineHeight.value));
    if (Math.abs(Number(lineHeight.value) - pxTarget) <= LINE_HEIGHT_PX_THRESHOLD) {
      return {
        unit: "PIXELS",
        value: pxTarget,
      };
    }
    return null;
  }

  function sameSnapTarget(first, second) {
    return (
      !!first &&
      !!second &&
      first.unit === second.unit &&
      Number.isFinite(Number(first.value)) &&
      Number.isFinite(Number(second.value)) &&
      Math.abs(Number(first.value) - Number(second.value)) <= 0.001
    );
  }

  async function applyStyleClusters(clusters) {
    const changed = [];
    const skipped = [];
    const changedNodeIds = {};
    let changedRunCount = 0;
    let mergedStyleCount = 0;

    for (let clusterIndex = 0; clusterIndex < clusters.length; clusterIndex += 1) {
      await yieldStyleTurn(clusterIndex, APPLY_YIELD_INTERVAL);
      const cluster = clusters[clusterIndex];
      const targetStyle = cluster.representative.style;
      for (let memberIndex = 1; memberIndex < cluster.members.length; memberIndex += 1) {
        const member = cluster.members[memberIndex];
        mergedStyleCount += 1;
        for (let occurrenceIndex = 0; occurrenceIndex < member.occurrences.length; occurrenceIndex += 1) {
          await yieldStyleTurn(occurrenceIndex, APPLY_YIELD_INTERVAL);
          const occurrence = member.occurrences[occurrenceIndex];
          try {
            if (await applyTextStyleOccurrence(occurrence, targetStyle)) {
              changedRunCount += 1;
              if (!changedNodeIds[occurrence.nodeId]) {
                changedNodeIds[occurrence.nodeId] = true;
                changed.push(occurrence);
              }
            }
          } catch (error) {
            skipped.push({
              nodeId: occurrence.nodeId,
              nodeName: occurrence.nodeName,
              nodeType: occurrence.nodeType,
              reason: normalizeErrorMessage(error, "\uC774 \uD14D\uC2A4\uD2B8 \uC2A4\uD0C0\uC77C\uC744 \uC815\uB9AC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."),
            });
          }
        }
      }
    }

    return {
      changed,
      skipped,
      changedRunCount,
      changedTextCount: changed.length,
      mergedStyleCount,
    };
  }

  async function applyTextStyleOccurrence(occurrence, targetStyle) {
    const textNode = occurrence && occurrence.node;
    if (!textNode || textNode.removed || textNode.type !== "TEXT") {
      return false;
    }

    await loadFontsForTextNode(textNode);
    let changed = false;

    if (Number.isFinite(targetStyle.fontSize) && differsNumber(occurrence.style.fontSize, targetStyle.fontSize, 0.001)) {
      if (typeof textNode.setRangeFontSize === "function") {
        textNode.setRangeFontSize(occurrence.start, occurrence.end, roundStyleNumber(targetStyle.fontSize));
      } else {
        textNode.fontSize = roundStyleNumber(targetStyle.fontSize);
      }
      changed = true;
    }

    if (differsLineHeight(occurrence.style.lineHeight, targetStyle.lineHeight)) {
      applyRangeLineHeight(textNode, occurrence.start, occurrence.end, targetStyle.lineHeight);
      changed = true;
    }

    if (targetStyle.color && occurrence.style.color && occurrence.style.colorEditable) {
      if (differsColor(occurrence.style.color, targetStyle.color)) {
        if (setRangeTextColor(textNode, occurrence, targetStyle.color)) {
          changed = true;
        }
      }
    }

    return changed;
  }

  function applyRangeLineHeight(textNode, start, end, lineHeight) {
    const value = toFigmaLineHeight(lineHeight);
    if (!value) {
      return;
    }
    if (typeof textNode.setRangeLineHeight === "function") {
      textNode.setRangeLineHeight(start, end, value);
      return;
    }
    textNode.lineHeight = value;
  }

  function setRangeTextColor(textNode, occurrence, color) {
    if (typeof textNode.setRangeFills !== "function") {
      return false;
    }

    let fills = null;
    try {
      fills = textNode.getRangeFills(occurrence.start, occurrence.end);
    } catch (error) {
      fills = null;
    }
    if (!Array.isArray(fills)) {
      return false;
    }

    const paints = cloneArray(fills);
    let paintIndex = occurrence.style.colorPaintIndex;
    if (!isEditableSolidPaint(paints[paintIndex])) {
      paintIndex = findFirstEditableSolidPaintIndex(paints);
    }
    if (paintIndex < 0) {
      return false;
    }

    const paint = clonePaint(paints[paintIndex]);
    paint.color = {
      r: clampUnit(color.r),
      g: clampUnit(color.g),
      b: clampUnit(color.b),
    };
    paint.opacity = normalizeAlpha(color.a);
    paints[paintIndex] = paint;
    textNode.setRangeFills(occurrence.start, occurrence.end, paints);
    return true;
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
      await yieldStyleTurn(index, FONT_LOAD_YIELD_INTERVAL);
      await loadFontWithCache(fonts[index]);
    }
  }

  async function loadFontWithCache(fontName) {
    const key = fontNameKey(fontName);
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
    const key = fontNameKey(fontName);
    for (let index = 0; index < list.length; index += 1) {
      if (fontNameKey(list[index]) === key) {
        return;
      }
    }
    list.push({ family: fontName.family, style: fontName.style });
  }

  function buildResult(data) {
    const applied = data.applied;
    const changed = applied.changed || [];
    const skipped = (data.collection.skipped || []).concat(applied.skipped || []);
    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionCount: data.selection.length,
        scopeCount: data.scopes.length,
        textCount: data.textNodes.length,
        styleRunCount: data.collection.occurrences.length,
        clusterCount: data.clusters.length,
        mergedStyleCount: applied.mergedStyleCount,
        changedTextCount: applied.changedTextCount,
        changedRunCount: applied.changedRunCount,
        skippedCount: skipped.length,
        truncatedTextCount: data.collection.truncatedTextCount,
      },
      clusters: summarizeClusters(data.clusters).slice(0, RESULT_PREVIEW_LIMIT),
      changed: changed.map(summarizeChangedOccurrence).slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function summarizeClusters(clusters) {
    const result = [];
    for (let index = 0; index < clusters.length; index += 1) {
      const cluster = clusters[index];
      const representative = cluster.representative;
      result.push({
        target: describeStyle(representative.style),
        memberCount: cluster.members.length,
        occurrenceCount: sumMemberOccurrences(cluster.members),
        characterCount: sumMemberCharacters(cluster.members),
      });
    }
    return result;
  }

  function summarizeChangedOccurrence(occurrence) {
    return {
      nodeId: occurrence.nodeId,
      nodeName: occurrence.nodeName,
      nodeType: occurrence.nodeType,
      range: occurrence.start + "-" + occurrence.end,
      before: describeStyle(occurrence.style),
    };
  }

  function sumMemberOccurrences(members) {
    let total = 0;
    for (let index = 0; index < members.length; index += 1) {
      total += members[index].occurrences.length;
    }
    return total;
  }

  function sumMemberCharacters(members) {
    let total = 0;
    for (let index = 0; index < members.length; index += 1) {
      total += members[index].characterCount;
    }
    return total;
  }

  function describeStyle(style) {
    const parts = [];
    parts.push(describeFontName(style.fontName));
    parts.push(roundNumber(style.fontSize, 2) + "px");
    parts.push(describeLineHeight(style.lineHeight));
    if (style.color) {
      parts.push(colorToHex(style.color));
    }
    return parts.join(" / ");
  }

  function describeFontName(fontName) {
    if (!fontName || typeof fontName !== "object") {
      return "font";
    }
    const family = typeof fontName.family === "string" && fontName.family.trim() ? fontName.family.trim() : "font";
    const style = typeof fontName.style === "string" && fontName.style.trim() ? fontName.style.trim() : "";
    return style ? family + " " + style : family;
  }

  function describeLineHeight(lineHeight) {
    if (!lineHeight) {
      return "line-height mixed";
    }
    if (lineHeight.kind === "auto") {
      return "auto";
    }
    if (lineHeight.unit === "PERCENT") {
      return roundNumber(lineHeight.value, 2) + "%";
    }
    return roundNumber(lineHeight.value, 2) + "px";
  }

  function buildResultToast(result) {
    const summary = result && result.summary ? result.summary : {};
    const changedTextCount = Number(summary.changedTextCount) || 0;
    const changedRunCount = Number(summary.changedRunCount) || 0;
    const skippedCount = Number(summary.skippedCount) || 0;
    if (changedTextCount <= 0) {
      return "\uC815\uB9AC\uD560 \uBE44\uC2B7\uD55C \uD14D\uC2A4\uD2B8 \uC2A4\uD0C0\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.";
    }
    if (skippedCount > 0) {
      return "\uD14D\uC2A4\uD2B8 " + changedTextCount + "\uAC1C, \uC2A4\uD0C0\uC77C " + changedRunCount + "\uAC74 \uC815\uB9AC / " + skippedCount + "\uAC74 \uAC74\uB108\uB700";
    }
    return "\uD14D\uC2A4\uD2B8 " + changedTextCount + "\uAC1C\uC758 \uC2A4\uD0C0\uC77C " + changedRunCount + "\uAC74\uC744 \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4.";
  }

  function selectChangedTextNodes(changed) {
    const nodes = [];
    const seen = {};
    for (let index = 0; index < changed.length; index += 1) {
      const node = changed[index] && changed[index].node;
      if (!node || node.removed) {
        continue;
      }
      const id = safeNodeId(node);
      if (id && seen[id]) {
        continue;
      }
      if (id) {
        seen[id] = true;
      }
      nodes.push(node);
    }
    if (!nodes.length) {
      return;
    }
    figma.currentPage.selection = nodes;
    if (nodes.length <= VIEWPORT_FOCUS_LIMIT) {
      try {
        figma.viewport.scrollAndZoomIntoView(nodes);
      } catch (error) {
        // Viewport focus is only a convenience.
      }
    }
  }

  function addUniqueNode(list, seen, node) {
    if (!node || node.removed) {
      return;
    }
    const id = safeNodeId(node);
    if (!id || seen[id]) {
      return;
    }
    seen[id] = true;
    list.push(node);
  }

  function isFrameLikeScopeNode(node) {
    if (!node || node.removed) {
      return false;
    }
    return (
      node.type === "FRAME" ||
      node.type === "SECTION" ||
      node.type === "COMPONENT" ||
      node.type === "COMPONENT_SET" ||
      node.type === "INSTANCE"
    );
  }

  function getChildren(node) {
    if (!node || !Array.isArray(node.children)) {
      return [];
    }
    return node.children;
  }

  function normalizeLineHeight(lineHeight, fontSize) {
    if (!lineHeight || isMixedValue(lineHeight)) {
      return {
        kind: "auto",
        unit: "AUTO",
        value: null,
        px: null,
      };
    }
    const unit = typeof lineHeight.unit === "string" ? lineHeight.unit : "AUTO";
    if (unit === "AUTO") {
      return {
        kind: "auto",
        unit: "AUTO",
        value: null,
        px: null,
      };
    }
    const value = Number(lineHeight.value);
    if (!Number.isFinite(value)) {
      return {
        kind: "auto",
        unit: "AUTO",
        value: null,
        px: null,
      };
    }
    const size = Number(fontSize);
    const px = unit === "PERCENT" && Number.isFinite(size) ? (size * value) / 100 : value;
    return {
      kind: "number",
      unit: unit === "PERCENT" ? "PERCENT" : "PIXELS",
      value,
      px,
    };
  }

  function toFigmaLineHeight(lineHeight) {
    if (!lineHeight) {
      return null;
    }
    if (lineHeight.kind === "auto" || lineHeight.unit === "AUTO") {
      return { unit: "AUTO" };
    }
    if (lineHeight.unit === "PERCENT") {
      return {
        unit: "PERCENT",
        value: roundStyleNumber(lineHeight.value),
      };
    }
    return {
      unit: "PIXELS",
      value: roundStyleNumber(lineHeight.value),
    };
  }

  function textStyleExactKey(style) {
    return [
      style.fontKey,
      roundNumber(style.fontSize, 3),
      lineHeightKey(style.lineHeight),
      style.color ? colorValueKey(style.color) : "no-color",
      style.colorEditable ? "editable" : "locked",
    ].join("|");
  }

  function lineHeightKey(lineHeight) {
    if (!lineHeight) {
      return "mixed";
    }
    if (lineHeight.kind === "auto") {
      return "auto";
    }
    return lineHeight.unit + ":" + roundNumber(lineHeight.value, 3);
  }

  function fontNameKey(fontName) {
    if (!fontName || typeof fontName !== "object") {
      return "";
    }
    if (typeof fontName.family !== "string" || typeof fontName.style !== "string") {
      return "";
    }
    return fontName.family + "\u0000" + fontName.style;
  }

  function styleCleanScore(style) {
    let score = 0;
    if (isNearInteger(style.fontSize, 0.02)) {
      score += 1000;
    } else if (isNearHalf(style.fontSize, 0.02)) {
      score += 350;
    }

    if (style.lineHeight && style.lineHeight.kind === "number") {
      if (style.lineHeight.unit === "PIXELS") {
        if (isNearInteger(style.lineHeight.value, 0.02)) {
          score += 500;
        } else if (isNearHalf(style.lineHeight.value, 0.02)) {
          score += 180;
        }
      } else if (style.lineHeight.unit === "PERCENT") {
        if (isNearMultiple(style.lineHeight.value, 5, 0.05)) {
          score += 360;
        }
      }
    } else {
      score += 60;
    }

    return score;
  }

  function getFirstSolidPaintInfo(paints) {
    if (!Array.isArray(paints)) {
      return null;
    }
    for (let index = 0; index < paints.length; index += 1) {
      const paint = paints[index];
      if (!paint || paint.type !== "SOLID" || paint.visible === false || !paint.color) {
        continue;
      }
      return {
        index,
        editable: !isVariableBoundColor(paint),
        color: paintToColor(paint),
      };
    }
    return null;
  }

  function findFirstEditableSolidPaintIndex(paints) {
    if (!Array.isArray(paints)) {
      return -1;
    }
    for (let index = 0; index < paints.length; index += 1) {
      if (isEditableSolidPaint(paints[index])) {
        return index;
      }
    }
    return -1;
  }

  function isEditableSolidPaint(paint) {
    return !!paint && paint.type === "SOLID" && paint.visible !== false && !!paint.color && !isVariableBoundColor(paint);
  }

  function isVariableBoundColor(item) {
    if (!item || !item.boundVariables || typeof item.boundVariables !== "object") {
      return false;
    }
    return !!item.boundVariables.color;
  }

  function paintToColor(paint) {
    const color = paint && paint.color ? paint.color : {};
    return {
      r: clampUnit(color.r),
      g: clampUnit(color.g),
      b: clampUnit(color.b),
      a: normalizeAlpha(paint && paint.opacity),
    };
  }

  function cloneArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function clonePaint(paint) {
    const clone = {};
    for (const key in paint) {
      if (Object.prototype.hasOwnProperty.call(paint, key)) {
        clone[key] = paint[key];
      }
    }
    if (paint && paint.color) {
      clone.color = {
        r: paint.color.r,
        g: paint.color.g,
        b: paint.color.b,
      };
    }
    return clone;
  }

  function differsNumber(first, second, tolerance) {
    return Math.abs(Number(first) - Number(second)) > tolerance;
  }

  function differsLineHeight(first, second) {
    if (!first || !second) {
      return !!first !== !!second;
    }
    if (first.kind !== second.kind) {
      return true;
    }
    if (first.kind === "auto") {
      return false;
    }
    if (first.unit !== second.unit) {
      return true;
    }
    return differsNumber(first.value, second.value, 0.001);
  }

  function differsColor(first, second) {
    if (!first || !second) {
      return !!first !== !!second;
    }
    return (
      Math.round(first.r * 255) !== Math.round(second.r * 255) ||
      Math.round(first.g * 255) !== Math.round(second.g * 255) ||
      Math.round(first.b * 255) !== Math.round(second.b * 255) ||
      Math.abs(first.a - second.a) > 0.001
    );
  }

  function colorValueKey(color) {
    return [
      Math.round(clampUnit(color.r) * 255),
      Math.round(clampUnit(color.g) * 255),
      Math.round(clampUnit(color.b) * 255),
      Math.round(normalizeAlpha(color.a) * 1000),
    ].join(",");
  }

  function colorToHex(color) {
    return (
      "#" +
      toHexByte(color.r) +
      toHexByte(color.g) +
      toHexByte(color.b) +
      (normalizeAlpha(color.a) < 0.999 ? " @" + Math.round(normalizeAlpha(color.a) * 100) + "%" : "")
    );
  }

  function toHexByte(value) {
    const byte = Math.round(clampUnit(value) * 255);
    return byte.toString(16).padStart(2, "0").toUpperCase();
  }

  function maxRgbChannelDelta(first, second) {
    return Math.max(
      Math.abs(Math.round(clampUnit(first.r) * 255) - Math.round(clampUnit(second.r) * 255)),
      Math.abs(Math.round(clampUnit(first.g) * 255) - Math.round(clampUnit(second.g) * 255)),
      Math.abs(Math.round(clampUnit(first.b) * 255) - Math.round(clampUnit(second.b) * 255))
    );
  }

  function colorDistance(first, second) {
    const firstLab = rgbToLab(first);
    const secondLab = rgbToLab(second);
    const dl = firstLab.l - secondLab.l;
    const da = firstLab.a - secondLab.a;
    const db = firstLab.b - secondLab.b;
    return Math.sqrt(dl * dl + da * da + db * db);
  }

  function rgbToLab(color) {
    const xyz = rgbToXyz(color);
    const xr = xyz.x / 0.95047;
    const yr = xyz.y / 1;
    const zr = xyz.z / 1.08883;
    const fx = labPivot(xr);
    const fy = labPivot(yr);
    const fz = labPivot(zr);
    return {
      l: 116 * fy - 16,
      a: 500 * (fx - fy),
      b: 200 * (fy - fz),
    };
  }

  function rgbToXyz(color) {
    const r = srgbToLinear(clampUnit(color.r));
    const g = srgbToLinear(clampUnit(color.g));
    const b = srgbToLinear(clampUnit(color.b));
    return {
      x: r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
      y: r * 0.2126729 + g * 0.7151522 + b * 0.072175,
      z: r * 0.0193339 + g * 0.119192 + b * 0.9503041,
    };
  }

  function srgbToLinear(value) {
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  }

  function labPivot(value) {
    return value > 0.008856 ? Math.pow(value, 1 / 3) : 7.787 * value + 16 / 116;
  }

  function isMixedValue(value) {
    return typeof figma !== "undefined" && value === figma.mixed;
  }

  function isNearInteger(value, tolerance) {
    const number = Number(value);
    return Number.isFinite(number) && Math.abs(number - Math.round(number)) <= tolerance;
  }

  function isNearHalf(value, tolerance) {
    const number = Number(value);
    return Number.isFinite(number) && Math.abs(number * 2 - Math.round(number * 2)) <= tolerance;
  }

  function isNearMultiple(value, step, tolerance) {
    const number = Number(value);
    const safeStep = Math.max(1, Number(step) || 1);
    return Number.isFinite(number) && Math.abs(number / safeStep - Math.round(number / safeStep)) * safeStep <= tolerance;
  }

  function roundStyleNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return 0;
    }
    if (isNearInteger(number, 0.02)) {
      return Math.round(number);
    }
    if (isNearHalf(number, 0.02)) {
      return Math.round(number * 2) / 2;
    }
    return Math.round(number * 1000) / 1000;
  }

  function roundNumber(value, decimals) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return 0;
    }
    const factor = Math.pow(10, Math.max(0, Number(decimals) || 0));
    return Math.round(number * factor) / factor;
  }

  function clampUnit(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return 0;
    }
    return Math.max(0, Math.min(1, number));
  }

  function normalizeAlpha(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return 1;
    }
    return Math.max(0, Math.min(1, number));
  }

  function waitForStyleTurn() {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  async function yieldStyleTurn(index, interval) {
    const step = Math.max(1, Math.floor(Number(interval) || 1));
    if (index > 0 && index % step === 0) {
      await waitForStyleTurn();
    }
  }

  async function ensureSelectionAccess() {
    if (typeof figma.loadAllPagesAsync !== "function") {
      return;
    }
    try {
      await figma.loadAllPagesAsync();
    } catch (error) {
      console.warn("[pigma] text style selection preload failed:", error);
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
