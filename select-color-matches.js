;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGER_SELECT_COLOR_MATCHES_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESULT_PREVIEW_LIMIT = 24;
  const NODE_SCAN_YIELD_INTERVAL = 512;
  const VIEWPORT_FOCUS_LIMIT = 80;
  const BASE_SELECTION_SYNC_SUPPRESS_MS = 2500;
  const BASE_SELECTION_SYNC_REFRESH_DELAY_MS = 2600;
  const GROUP_DELTA_E_THRESHOLD = 4.5;
  const GROUP_ALPHA_THRESHOLD = 0.04;
  const SIMILAR_DELTA_E_THRESHOLD = 18;
  const SIMILAR_ALPHA_THRESHOLD = 0.28;
  const MAX_TEXT_RANGE_SCAN = 8000;
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isGroupSimilarColorsMessage(message)) {
      if (isRunning) {
        postGroupStatus("running", "\uBE44\uC2B7\uD55C \uC0C9\uC744 \uC815\uB9AC\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");
        return;
      }

      await runGroupSimilarColors();
      return;
    }

    if (isSelectColorMessage(message)) {
      const mode = resolveMode(message);
      if (isRunning) {
        postStatus(mode, "running", "\uC0C9\uC0C1 \uB9E4\uCE58 \uB808\uC774\uC5B4\uB97C \uCC3E\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");
        return;
      }

      await runSelectColorMatches(mode);
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGER_SELECT_COLOR_MATCHES_PATCH__ = true;

  function isGroupSimilarColorsMessage(message) {
    return !!message && message.type === "run-group-similar-colors";
  }

  function isSelectColorMessage(message) {
    return (
      !!message &&
      (message.type === "run-select-same-color" || message.type === "run-select-similar-color")
    );
  }

  function resolveMode(message) {
    return message && message.type === "run-select-similar-color" ? "similar" : "same";
  }

  function eventPrefix(mode) {
    return mode === "similar" ? "select-similar-color" : "select-same-color";
  }

  async function runGroupSimilarColors() {
    isRunning = true;
    postGroupStatus("running", "\uC120\uD0DD \uBC94\uC704\uC758 fill, stroke, \uD14D\uC2A4\uD2B8 \uC0C9\uC744 \uC2A4\uCE94\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");

    try {
      const result = await groupSimilarColors();
      figma.ui.postMessage({
        type: "group-similar-colors-result",
        result,
      });
      notifyGroupResult(result);
    } catch (error) {
      const message = normalizeErrorMessage(error, "\uBE44\uC2B7\uD55C \uC0C9\uC744 \uBB36\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      figma.ui.postMessage({
        type: "group-similar-colors-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 3000 });
    } finally {
      isRunning = false;
    }
  }

  async function runSelectColorMatches(mode) {
    isRunning = true;
    postStatus(mode, "running", "\uC120\uD0DD\uD55C \uAE30\uC900 \uC0C9\uACFC \uC77C\uCE58\uD558\uB294 \uB808\uC774\uC5B4\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");

    try {
      const result = await selectColorMatches(mode);
      figma.ui.postMessage({
        type: eventPrefix(mode) + "-result",
        result,
      });
      notifyResult(result, mode);
    } catch (error) {
      const message = normalizeErrorMessage(error, "\uAC19\uC740 \uC0C9 \uB808\uC774\uC5B4\uB97C \uC120\uD0DD\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      figma.ui.postMessage({
        type: eventPrefix(mode) + "-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 3000 });
    } finally {
      isRunning = false;
    }
  }

  async function groupSimilarColors() {
    const selection = Array.from(figma.currentPage.selection || []).filter(Boolean);
    if (!selection.length) {
      throw new Error("\uBE44\uC2B7\uD55C \uC0C9\uC744 \uBB36\uC744 \uD504\uB808\uC784\uC774\uB098 \uB808\uC774\uC5B4\uB97C \uC120\uD0DD\uD558\uC138\uC694.");
    }

    const context = buildGroupingContext(selection);
    const collection = await collectColorOccurrences(context.scopes);
    if (!collection.occurrences.length) {
      throw new Error("\uC120\uD0DD \uBC94\uC704\uC5D0\uC11C \uC815\uB9AC\uD560 SOLID fill, stroke, \uD14D\uC2A4\uD2B8 \uC0C9\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    const clusters = buildSimilarColorClusters(collection.occurrences);
    const applied = applySimilarColorClusters(clusters);
    selectChangedNodes(applied.changed);

    return buildGroupResult({
      selection,
      scopes: context.scopes,
      scannedNodeCount: collection.scannedNodeCount,
      occurrenceCount: collection.occurrences.length,
      exactColorCount: collection.exactColorCount,
      clusters,
      applied,
    });
  }

  async function selectColorMatches(mode) {
    const selection = Array.from(figma.currentPage.selection || []).filter(Boolean);
    if (!selection.length) {
      throw new Error("\uAE30\uC900\uC774 \uB420 \uC0C9\uC0C1 \uB808\uC774\uC5B4\uB97C \uC120\uD0DD\uD558\uC138\uC694.");
    }

    const context = buildSelectionContext(selection);
    if (!context.referenceColors.length) {
      throw new Error("\uC120\uD0DD\uD55C \uB808\uC774\uC5B4\uC5D0\uC11C SOLID fill, stroke, \uD14D\uC2A4\uD2B8 \uC0C9\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }
    if (!context.scopes.length) {
      throw new Error("\uC0C9\uC0C1\uC744 \uCC3E\uC744 \uD604\uC7AC \uD398\uC774\uC9C0\uB97C \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    const candidates = await collectColorMatchEntries(context.scopes, context.referenceColors, mode);
    const filteredCandidates = filterAncestorMatches(candidates);
    const selectionResult = selectEntries(filteredCandidates);

    if (selectionResult.selected.length > 0 && selectionResult.selected.length <= VIEWPORT_FOCUS_LIMIT) {
      try {
        figma.viewport.scrollAndZoomIntoView(selectionResult.selected.map((entry) => entry.node));
      } catch (error) {
        // Viewport focus is only a convenience.
      }
    }

    return buildResult({
      mode,
      selection,
      scopes: context.scopes,
      sampleNodes: context.sampleNodes,
      referenceColors: context.referenceColors,
      candidates: filteredCandidates,
      selected: selectionResult.selected,
      skipped: selectionResult.skipped,
    });
  }

  function buildSelectionContext(selection) {
    const scopes = [];
    const sampleNodes = [];
    const selectedScopeIds = {};
    const frameScopes = [];
    const frameScopeIds = {};

    for (let index = 0; index < selection.length; index += 1) {
      const node = selection[index];
      if (isFrameLikeScopeNode(node)) {
        addUniqueNode(frameScopes, frameScopeIds, node);
      }
    }

    for (let index = 0; index < frameScopes.length; index += 1) {
      addUniqueNode(scopes, selectedScopeIds, frameScopes[index]);
    }

    if (scopes.length) {
      for (let index = 0; index < selection.length; index += 1) {
        const node = selection[index];
        if (!node || node.removed || selectedScopeIds[safeNodeId(node)]) {
          continue;
        }
        sampleNodes.push(node);
      }
      if (!sampleNodes.length) {
        sampleNodes.push.apply(sampleNodes, scopes);
      }
    } else {
      sampleNodes.push.apply(sampleNodes, selection);
      addUniqueNode(scopes, {}, figma.currentPage);
    }

    return {
      scopes,
      sampleNodes,
      referenceColors: collectReferenceColors(sampleNodes),
    };
  }

  function buildGroupingContext(selection) {
    const scopes = [];
    const scopeIds = {};

    for (let index = 0; index < selection.length; index += 1) {
      const node = selection[index];
      if (isFrameLikeScopeNode(node)) {
        addUniqueNode(scopes, scopeIds, node);
      }
    }

    if (!scopes.length) {
      for (let index = 0; index < selection.length; index += 1) {
        addUniqueNode(scopes, scopeIds, selection[index]);
      }
    }

    return { scopes };
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

  function collectReferenceColors(nodes) {
    const colors = [];
    const seen = {};
    for (let index = 0; index < nodes.length; index += 1) {
      const nodeColors = collectNodeColors(nodes[index], true);
      for (let colorIndex = 0; colorIndex < nodeColors.length; colorIndex += 1) {
        pushUniqueColor(colors, seen, nodeColors[colorIndex]);
      }
    }
    return colors;
  }

  async function collectColorMatchEntries(scopes, referenceColors, mode) {
    const results = [];
    const seen = {};
    const stack = [];

    for (let index = scopes.length - 1; index >= 0; index -= 1) {
      const scope = scopes[index];
      if (!scope || scope.removed) {
        continue;
      }
      stack.push({
        node: scope,
        path: safeName(scope),
      });
    }

    let scannedCount = 0;
    while (stack.length > 0) {
      await yieldColorMatchTurn(scannedCount, NODE_SCAN_YIELD_INTERVAL);
      scannedCount += 1;

      const current = stack.pop();
      const node = current && current.node;
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

      if (node.visible !== false) {
        const match = findNodeColorMatch(node, referenceColors, mode);
        if (match) {
          results.push({
            node,
            nodeId,
            nodeName: safeName(node),
            nodeType: String(node.type || "UNKNOWN"),
            path: current.path,
            role: match.role,
            color: colorToHex(match.color),
            alpha: roundNumber(match.color.a, 3),
            referenceColor: colorToHex(match.referenceColor),
            delta: roundNumber(match.delta, 2),
          });
        }
      }

      const children = getChildren(node);
      for (let childIndex = children.length - 1; childIndex >= 0; childIndex -= 1) {
        const child = children[childIndex];
        stack.push({
          node: child,
          path: current.path + " / " + safeName(child),
        });
      }
    }

    return results;
  }

  function findNodeColorMatch(node, referenceColors, mode) {
    const nodeColors = collectNodeColors(node, false);
    for (let colorIndex = 0; colorIndex < nodeColors.length; colorIndex += 1) {
      const color = nodeColors[colorIndex];
      for (let refIndex = 0; refIndex < referenceColors.length; refIndex += 1) {
        const referenceColor = referenceColors[refIndex];
        const delta = colorDistance(color, referenceColor);
        if (matchesColor(color, referenceColor, delta, mode)) {
          return {
            role: color.role,
            color,
            referenceColor,
            delta,
          };
        }
      }
    }
    return null;
  }

  function matchesColor(color, referenceColor, delta, mode) {
    if (mode === "similar") {
      return delta <= SIMILAR_DELTA_E_THRESHOLD && Math.abs(color.a - referenceColor.a) <= SIMILAR_ALPHA_THRESHOLD;
    }
    return (
      Math.round(color.r * 255) === Math.round(referenceColor.r * 255) &&
      Math.round(color.g * 255) === Math.round(referenceColor.g * 255) &&
      Math.round(color.b * 255) === Math.round(referenceColor.b * 255) &&
      Math.abs(color.a - referenceColor.a) <= 0.01
    );
  }

  async function collectColorOccurrences(scopes) {
    const occurrences = [];
    const seenNodes = {};
    const exactColors = {};
    const stack = [];

    for (let index = scopes.length - 1; index >= 0; index -= 1) {
      const scope = scopes[index];
      if (scope && !scope.removed) {
        stack.push({ node: scope, path: safeName(scope) });
      }
    }

    let scannedNodeCount = 0;
    while (stack.length > 0) {
      await yieldColorMatchTurn(scannedNodeCount, NODE_SCAN_YIELD_INTERVAL);
      scannedNodeCount += 1;

      const current = stack.pop();
      const node = current && current.node;
      if (!node || node.removed) {
        continue;
      }

      const nodeId = safeNodeId(node);
      if (nodeId && seenNodes[nodeId]) {
        continue;
      }
      if (nodeId) {
        seenNodes[nodeId] = true;
      }

      if (node.visible !== false) {
        const nodeOccurrences = collectNodeColorOccurrences(node, current.path);
        for (let index = 0; index < nodeOccurrences.length; index += 1) {
          const occurrence = nodeOccurrences[index];
          occurrences.push(occurrence);
          exactColors[colorValueKey(occurrence.color)] = true;
        }
      }

      const children = getChildren(node);
      for (let childIndex = children.length - 1; childIndex >= 0; childIndex -= 1) {
        const child = children[childIndex];
        stack.push({
          node: child,
          path: current.path + " / " + safeName(child),
        });
      }
    }

    return {
      occurrences,
      scannedNodeCount,
      exactColorCount: Object.keys(exactColors).length,
    };
  }

  function collectNodeColorOccurrences(node, path) {
    const occurrences = [];
    if (!node || node.removed) {
      return occurrences;
    }

    if (node.type === "TEXT" && typeof node.getRangeFills === "function" && typeof node.setRangeFills === "function") {
      addTextRangeColorOccurrences(occurrences, node, path);
    } else {
      addPaintColorOccurrences(occurrences, node, path, node.fills, "fills", "fill");
    }

    addPaintColorOccurrences(occurrences, node, path, node.strokes, "strokes", "stroke");
    addPaintColorOccurrences(occurrences, node, path, node.backgrounds, "backgrounds", "background");
    addEffectColorOccurrences(occurrences, node, path, node.effects);
    return occurrences;
  }

  function addPaintColorOccurrences(occurrences, node, path, paints, propertyName, role) {
    if (!Array.isArray(paints)) {
      return;
    }

    for (let index = 0; index < paints.length; index += 1) {
      const paint = paints[index];
      if (!isEditableSolidPaint(paint)) {
        continue;
      }
      occurrences.push(createOccurrence(node, path, role, {
        propertyName,
        paintIndex: index,
        color: paintToColor(paint, role),
      }));
    }
  }

  function addEffectColorOccurrences(occurrences, node, path, effects) {
    if (!Array.isArray(effects)) {
      return;
    }

    for (let index = 0; index < effects.length; index += 1) {
      const effect = effects[index];
      if (!effect || effect.visible === false || !effect.color || isVariableBoundColor(effect)) {
        continue;
      }
      occurrences.push(createOccurrence(node, path, "effect", {
        propertyName: "effects",
        effectIndex: index,
        color: {
          r: clampUnit(effect.color.r),
          g: clampUnit(effect.color.g),
          b: clampUnit(effect.color.b),
          a: normalizeAlpha(effect.color.a),
          role: "effect",
        },
      }));
    }
  }

  function addTextRangeColorOccurrences(occurrences, node, path) {
    const characters = String(node.characters || "");
    const limit = Math.min(characters.length, MAX_TEXT_RANGE_SCAN);
    let active = null;

    for (let index = 0; index < limit; index += 1) {
      let paints = null;
      try {
        paints = node.getRangeFills(index, index + 1);
      } catch (error) {
        paints = null;
      }

      const match = getFirstEditableSolidPaint(paints);
      const key = match ? colorValueKey(paintToColor(match.paint, "text")) : "";
      if (active && active.key === key && match) {
        active.end = index + 1;
        continue;
      }

      if (active) {
        occurrences.push(createOccurrence(node, path, "text", active));
        active = null;
      }

      if (match) {
        active = {
          propertyName: "textRange",
          start: index,
          end: index + 1,
          paintIndex: match.index,
          color: paintToColor(match.paint, "text"),
          key,
        };
      }
    }

    if (active) {
      occurrences.push(createOccurrence(node, path, "text", active));
    }
  }

  function createOccurrence(node, path, role, options) {
    return {
      node,
      nodeId: safeNodeId(node),
      nodeName: safeName(node),
      nodeType: String(node && node.type ? node.type : "UNKNOWN"),
      path,
      role,
      propertyName: options.propertyName,
      paintIndex: typeof options.paintIndex === "number" ? options.paintIndex : -1,
      effectIndex: typeof options.effectIndex === "number" ? options.effectIndex : -1,
      start: typeof options.start === "number" ? options.start : -1,
      end: typeof options.end === "number" ? options.end : -1,
      color: options.color,
    };
  }

  function buildSimilarColorClusters(occurrences) {
    const statsByColor = {};
    const stats = [];
    for (let index = 0; index < occurrences.length; index += 1) {
      const occurrence = occurrences[index];
      const key = colorValueKey(occurrence.color);
      let stat = statsByColor[key];
      if (!stat) {
        stat = {
          key,
          color: occurrence.color,
          occurrences: [],
          firstIndex: index,
        };
        statsByColor[key] = stat;
        stats.push(stat);
      }
      stat.occurrences.push(occurrence);
    }

    stats.sort((first, second) => {
      if (second.occurrences.length !== first.occurrences.length) {
        return second.occurrences.length - first.occurrences.length;
      }
      return first.firstIndex - second.firstIndex;
    });

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
        const delta = colorDistance(representative.color, candidate.color);
        const alphaDelta = Math.abs(normalizeAlpha(representative.color.a) - normalizeAlpha(candidate.color.a));
        if (delta <= GROUP_DELTA_E_THRESHOLD && alphaDelta <= GROUP_ALPHA_THRESHOLD) {
          used[candidate.key] = true;
          candidate.delta = delta;
          members.push(candidate);
        }
      }

      if (members.length > 1) {
        clusters.push({ representative, members });
      }
    }

    return clusters;
  }

  function applySimilarColorClusters(clusters) {
    const changed = [];
    const skipped = [];
    const changedNodeIds = {};
    let changedOccurrenceCount = 0;
    let mergedColorCount = 0;

    for (let clusterIndex = 0; clusterIndex < clusters.length; clusterIndex += 1) {
      const cluster = clusters[clusterIndex];
      const representativeColor = cluster.representative.color;
      for (let memberIndex = 1; memberIndex < cluster.members.length; memberIndex += 1) {
        const member = cluster.members[memberIndex];
        mergedColorCount += 1;
        for (let occurrenceIndex = 0; occurrenceIndex < member.occurrences.length; occurrenceIndex += 1) {
          const occurrence = member.occurrences[occurrenceIndex];
          try {
            if (setOccurrenceColor(occurrence, representativeColor)) {
              changedOccurrenceCount += 1;
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
              path: occurrence.path,
              reason: normalizeErrorMessage(error, "\uC774 \uC0C9\uC744 \uB300\uD45C\uC0C9\uC73C\uB85C \uBC14\uAFB8\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."),
            });
          }
        }
      }
    }

    return {
      changed,
      skipped,
      changedOccurrenceCount,
      changedNodeCount: changed.length,
      mergedColorCount,
    };
  }

  function setOccurrenceColor(occurrence, color) {
    if (!occurrence || !occurrence.node || occurrence.node.removed) {
      return false;
    }

    if (occurrence.propertyName === "textRange") {
      return setTextRangeColor(occurrence, color);
    }
    if (occurrence.propertyName === "effects") {
      return setEffectColor(occurrence, color);
    }
    return setPaintPropertyColor(occurrence, color);
  }

  function setPaintPropertyColor(occurrence, color) {
    const node = occurrence.node;
    const propertyName = occurrence.propertyName;
    const source = node[propertyName];
    if (!Array.isArray(source)) {
      return false;
    }
    const paints = cloneArray(source);
    const paint = paints[occurrence.paintIndex];
    if (!isEditableSolidPaint(paint)) {
      return false;
    }
    applyColorToSolidPaint(paint, color);
    node[propertyName] = paints;
    return true;
  }

  function setEffectColor(occurrence, color) {
    const node = occurrence.node;
    if (!Array.isArray(node.effects)) {
      return false;
    }
    const effects = cloneArray(node.effects);
    const effect = effects[occurrence.effectIndex];
    if (!effect || !effect.color || isVariableBoundColor(effect)) {
      return false;
    }
    effect.color = {
      r: clampUnit(color.r),
      g: clampUnit(color.g),
      b: clampUnit(color.b),
      a: normalizeAlpha(color.a),
    };
    node.effects = effects;
    return true;
  }

  function setTextRangeColor(occurrence, color) {
    const node = occurrence.node;
    if (typeof node.getRangeFills !== "function" || typeof node.setRangeFills !== "function") {
      return false;
    }
    const start = Math.max(0, occurrence.start);
    const end = Math.max(start + 1, occurrence.end);
    const source = node.getRangeFills(start, end);
    if (!Array.isArray(source)) {
      return false;
    }
    const paints = cloneArray(source);
    const fallback = getFirstEditableSolidPaint(paints);
    const paint = paints[occurrence.paintIndex] || (fallback ? fallback.paint : null);
    if (!isEditableSolidPaint(paint)) {
      return false;
    }
    applyColorToSolidPaint(paint, color);
    node.setRangeFills(start, end, paints);
    return true;
  }

  function selectChangedNodes(entries) {
    const aliveEntries = entries.filter((entry) => entry && entry.node && !entry.node.removed);
    if (!aliveEntries.length) {
      return;
    }

    try {
      suppressBaseSelectionSync();
      figma.currentPage.selection = aliveEntries.map((entry) => entry.node);
      if (aliveEntries.length <= VIEWPORT_FOCUS_LIMIT) {
        figma.viewport.scrollAndZoomIntoView(aliveEntries.map((entry) => entry.node));
      }
    } catch (error) {
      // Selection feedback is best-effort; the color changes are the main operation.
    }
    scheduleBaseSelectionSyncRefresh();
  }

  function collectNodeColors(node, scanTextRanges) {
    const colors = [];
    const seen = {};
    if (!node || node.removed) {
      return colors;
    }

    addPaintColors(colors, seen, node.fills, "fill");
    addPaintColors(colors, seen, node.strokes, "stroke");
    addPaintColors(colors, seen, node.backgrounds, "background");
    addEffectColors(colors, seen, node.effects);

    if (node.type === "TEXT") {
      addTextRangeColors(colors, seen, node, scanTextRanges);
    }

    return colors;
  }

  function getFirstEditableSolidPaint(paints) {
    if (!Array.isArray(paints)) {
      return null;
    }
    for (let index = 0; index < paints.length; index += 1) {
      const paint = paints[index];
      if (isEditableSolidPaint(paint)) {
        return { paint, index };
      }
    }
    return null;
  }

  function isEditableSolidPaint(paint) {
    return !!paint && paint.visible !== false && paint.type === "SOLID" && !!paint.color && !isVariableBoundColor(paint);
  }

  function isVariableBoundColor(value) {
    return !!(value && value.boundVariables && value.boundVariables.color);
  }

  function paintToColor(paint, role) {
    return {
      r: clampUnit(paint.color.r),
      g: clampUnit(paint.color.g),
      b: clampUnit(paint.color.b),
      a: normalizeAlpha(paint.opacity),
      role,
    };
  }

  function applyColorToSolidPaint(paint, color) {
    paint.color = {
      r: clampUnit(color.r),
      g: clampUnit(color.g),
      b: clampUnit(color.b),
    };
    paint.opacity = normalizeAlpha(color.a);
  }

  function cloneArray(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function addPaintColors(colors, seen, paints, role) {
    if (!Array.isArray(paints)) {
      return;
    }

    for (let index = 0; index < paints.length; index += 1) {
      const paint = paints[index];
      if (!paint || paint.visible === false || paint.type !== "SOLID" || !paint.color) {
        continue;
      }
      pushUniqueColor(colors, seen, {
        r: clampUnit(paint.color.r),
        g: clampUnit(paint.color.g),
        b: clampUnit(paint.color.b),
        a: normalizeAlpha(paint.opacity),
        role,
      });
    }
  }

  function addEffectColors(colors, seen, effects) {
    if (!Array.isArray(effects)) {
      return;
    }

    for (let index = 0; index < effects.length; index += 1) {
      const effect = effects[index];
      if (!effect || effect.visible === false || !effect.color) {
        continue;
      }
      pushUniqueColor(colors, seen, {
        r: clampUnit(effect.color.r),
        g: clampUnit(effect.color.g),
        b: clampUnit(effect.color.b),
        a: normalizeAlpha(effect.color.a),
        role: "effect",
      });
    }
  }

  function addTextRangeColors(colors, seen, node, scanTextRanges) {
    if (!scanTextRanges && colors.length > 0) {
      return;
    }
    if (typeof node.getRangeFills !== "function") {
      return;
    }

    const characters = String(node.characters || "");
    const limit = Math.min(characters.length, MAX_TEXT_RANGE_SCAN);
    for (let index = 0; index < limit; index += 1) {
      let paints = null;
      try {
        paints = node.getRangeFills(index, index + 1);
      } catch (error) {
        paints = null;
      }
      addPaintColors(colors, seen, paints, "text");
    }
  }

  function pushUniqueColor(colors, seen, color) {
    if (!color) {
      return;
    }
    const key = colorKey(color);
    if (seen[key]) {
      return;
    }
    seen[key] = true;
    colors.push(color);
  }

  function colorKey(color) {
    return [
      Math.round(clampUnit(color.r) * 255),
      Math.round(clampUnit(color.g) * 255),
      Math.round(clampUnit(color.b) * 255),
      Math.round(normalizeAlpha(color.a) * 1000),
      color.role || "",
    ].join(":");
  }

  function colorValueKey(color) {
    return [
      Math.round(clampUnit(color.r) * 255),
      Math.round(clampUnit(color.g) * 255),
      Math.round(clampUnit(color.b) * 255),
      Math.round(normalizeAlpha(color.a) * 1000),
    ].join(":");
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
    const r = srgbToLinear(clampUnit(color.r));
    const g = srgbToLinear(clampUnit(color.g));
    const b = srgbToLinear(clampUnit(color.b));

    const x = pivotXyz((r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047);
    const y = pivotXyz((r * 0.2126729 + g * 0.7151522 + b * 0.072175) / 1);
    const z = pivotXyz((r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883);

    return {
      l: 116 * y - 16,
      a: 500 * (x - y),
      b: 200 * (y - z),
    };
  }

  function srgbToLinear(value) {
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  }

  function pivotXyz(value) {
    return value > 0.008856 ? Math.pow(value, 1 / 3) : 7.787 * value + 16 / 116;
  }

  function filterAncestorMatches(entries) {
    const source = Array.isArray(entries) ? entries : [];
    return source.filter((entry) => {
      if (!entry || !entry.node || entry.node.removed) {
        return false;
      }
      for (let index = 0; index < source.length; index += 1) {
        const other = source[index];
        if (!other || !other.node || other === entry) {
          continue;
        }
        if (isAncestorNode(entry.node, other.node)) {
          return false;
        }
      }
      return true;
    });
  }

  function isAncestorNode(ancestor, node) {
    let current = node && node.parent ? node.parent : null;
    while (current) {
      if (current === ancestor) {
        return true;
      }
      current = current.parent || null;
    }
    return false;
  }

  function selectEntries(entries) {
    const aliveEntries = entries.filter((entry) => entry && entry.node && !entry.node.removed);
    try {
      suppressBaseSelectionSync();
      figma.currentPage.selection = aliveEntries.map((entry) => entry.node);
      scheduleBaseSelectionSyncRefresh();
      return {
        selected: aliveEntries,
        skipped: [],
      };
    } catch (error) {
      return selectEntriesIndividually(aliveEntries);
    }
  }

  function selectEntriesIndividually(entries) {
    const selected = [];
    const skipped = [];

    selectEntryGroup(entries, selected, skipped);
    try {
      suppressBaseSelectionSync();
      figma.currentPage.selection = selected.map((entry) => entry.node);
    } catch (error) {}

    scheduleBaseSelectionSyncRefresh();
    return {
      selected,
      skipped,
    };
  }

  function selectEntryGroup(entries, selected, skipped) {
    const aliveEntries = entries.filter((entry) => entry && entry.node && !entry.node.removed);
    if (!aliveEntries.length) {
      return;
    }

    try {
      suppressBaseSelectionSync();
      figma.currentPage.selection = aliveEntries.map((entry) => entry.node);
      selected.push.apply(selected, aliveEntries);
      return;
    } catch (error) {
      if (aliveEntries.length === 1) {
        const entry = aliveEntries[0];
        skipped.push({
          nodeId: entry.nodeId,
          nodeName: entry.nodeName,
          nodeType: entry.nodeType,
          path: entry.path,
          reason: normalizeErrorMessage(error, "\uC774 \uB808\uC774\uC5B4\uB97C \uC120\uD0DD\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."),
        });
        return;
      }
    }

    const midpoint = Math.ceil(aliveEntries.length / 2);
    selectEntryGroup(aliveEntries.slice(0, midpoint), selected, skipped);
    selectEntryGroup(aliveEntries.slice(midpoint), selected, skipped);
  }

  function buildGroupResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const scopes = Array.isArray(options.scopes) ? options.scopes : [];
    const clusters = Array.isArray(options.clusters) ? options.clusters : [];
    const applied = options.applied || {};

    return {
      processedAt: new Date().toISOString(),
      mode: "group-similar",
      summary: {
        selectionLabel: formatSelectionLabel(selection),
        scopeCount: scopes.length,
        scannedNodeCount: Number(options.scannedNodeCount) || 0,
        occurrenceCount: Number(options.occurrenceCount) || 0,
        exactColorCount: Number(options.exactColorCount) || 0,
        clusterCount: clusters.length,
        mergedColorCount: Number(applied.mergedColorCount) || 0,
        changedOccurrenceCount: Number(applied.changedOccurrenceCount) || 0,
        changedNodeCount: Number(applied.changedNodeCount) || 0,
        skippedCount: Array.isArray(applied.skipped) ? applied.skipped.length : 0,
      },
      clusters: clusters.map(stripCluster).slice(0, RESULT_PREVIEW_LIMIT),
      changed: (Array.isArray(applied.changed) ? applied.changed : []).map(stripEntry).slice(0, RESULT_PREVIEW_LIMIT),
      skipped: (Array.isArray(applied.skipped) ? applied.skipped : []).slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function stripCluster(cluster) {
    const representative = cluster && cluster.representative ? cluster.representative : {};
    const members = Array.isArray(cluster && cluster.members) ? cluster.members : [];
    const occurrenceCount = members.reduce(
      (sum, member) => sum + (Array.isArray(member.occurrences) ? member.occurrences.length : 0),
      0
    );
    return {
      representativeColor: colorToHex(representative.color || {}),
      mergedColors: members.slice(1).map((member) => colorToHex(member.color)).slice(0, 8),
      occurrenceCount,
    };
  }

  function buildResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const scopes = Array.isArray(options.scopes) ? options.scopes : [];
    const sampleNodes = Array.isArray(options.sampleNodes) ? options.sampleNodes : [];
    const referenceColors = Array.isArray(options.referenceColors) ? options.referenceColors : [];
    const candidates = Array.isArray(options.candidates) ? options.candidates : [];
    const selected = Array.isArray(options.selected) ? options.selected : [];
    const skipped = Array.isArray(options.skipped) ? options.skipped : [];

    return {
      processedAt: new Date().toISOString(),
      mode: options.mode === "similar" ? "similar" : "same",
      summary: {
        selectionLabel: formatSelectionLabel(selection),
        scopeCount: scopes.length,
        sampleCount: sampleNodes.length,
        referenceColors: referenceColors.map(colorToHex).slice(0, 12),
        candidateCount: candidates.length,
        selectedCount: selected.length,
        skippedCount: skipped.length,
      },
      selected: selected.map(stripEntry).slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.map(stripEntry).slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function stripEntry(entry) {
    return {
      nodeId: entry.nodeId,
      nodeName: entry.nodeName,
      nodeType: entry.nodeType,
      path: entry.path,
      color: entry.color,
      referenceColor: entry.referenceColor,
      delta: entry.delta,
    };
  }

  function notifyResult(result, mode) {
    const summary = result && result.summary ? result.summary : {};
    const selectedCount = Number(summary.selectedCount) || 0;
    const candidateCount = Number(summary.candidateCount) || 0;
    const label = mode === "similar" ? "\uBE44\uC2B7\uD55C \uC0C9" : "\uAC19\uC740 \uC0C9";
    if (selectedCount > 0) {
      figma.notify(label + " \uB808\uC774\uC5B4 " + selectedCount + "\uAC1C\uB97C \uC120\uD0DD\uD588\uC2B5\uB2C8\uB2E4.", { timeout: 2200 });
      return;
    }
    if (candidateCount > 0) {
      figma.notify(label + " \uD6C4\uBCF4\uB97C \uCC3E\uC558\uC9C0\uB9CC \uC120\uD0DD\uD560 \uC218 \uC5C6\uC5C8\uC2B5\uB2C8\uB2E4.", { timeout: 2600 });
      return;
    }
    figma.notify(label + " \uB808\uC774\uC5B4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.", { timeout: 2200 });
  }

  function notifyGroupResult(result) {
    const summary = result && result.summary ? result.summary : {};
    const clusterCount = Number(summary.clusterCount) || 0;
    const changedOccurrenceCount = Number(summary.changedOccurrenceCount) || 0;
    if (changedOccurrenceCount > 0) {
      figma.notify(
        "\uBE44\uC2B7\uD55C \uC0C9 " +
          clusterCount +
          "\uADF8\uB8F9, \uC0C9\uC0C1 \uAC12 " +
          changedOccurrenceCount +
          "\uAC1C\uB97C \uB300\uD45C\uC0C9\uC73C\uB85C \uBB36\uC5C8\uC2B5\uB2C8\uB2E4.",
        { timeout: 2600 }
      );
      return;
    }
    if (clusterCount > 0) {
      figma.notify("\uBE44\uC2B7\uD55C \uC0C9 \uADF8\uB8F9\uC740 \uCC3E\uC558\uC9C0\uB9CC \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC5C8\uC2B5\uB2C8\uB2E4.", { timeout: 2600 });
      return;
    }
    figma.notify("\uBB36\uC744 \uB9CC\uD07C \uBE44\uC2B7\uD55C \uC0C9 \uADF8\uB8F9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.", { timeout: 2200 });
  }

  function postGroupStatus(status, message) {
    figma.ui.postMessage({
      type: "group-similar-colors-status",
      status,
      message,
    });
  }

  function postStatus(mode, status, message) {
    figma.ui.postMessage({
      type: eventPrefix(mode) + "-status",
      status,
      message,
    });
  }

  function suppressBaseSelectionSync() {
    try {
      globalScope.__PIGER_SELECT_ALL_TEXT_SKIP_SELECTION_SYNC_UNTIL__ =
        Date.now() + BASE_SELECTION_SYNC_SUPPRESS_MS;
    } catch (error) {}
  }

  function scheduleBaseSelectionSyncRefresh() {
    setTimeout(() => {
      try {
        if (typeof originalOnMessage === "function") {
          const syncResult = originalOnMessage({ type: "request-selection-sync" });
          if (syncResult && typeof syncResult.catch === "function") {
            syncResult.catch(() => {});
          }
        }
      } catch (error) {}
    }, BASE_SELECTION_SYNC_REFRESH_DELAY_MS);
  }

  function getChildren(node) {
    return node && Array.isArray(node.children) ? node.children : [];
  }

  function safeNodeId(node) {
    return node && typeof node.id === "string" ? node.id : "";
  }

  function safeName(node) {
    const name = node && typeof node.name === "string" ? node.name : "";
    return name.replace(/\s+/g, " ").trim() || String(node && node.type ? node.type : "Layer");
  }

  function formatSelectionLabel(selection) {
    if (!selection.length) {
      return "\uC120\uD0DD \uC5C6\uC74C";
    }
    if (selection.length === 1) {
      return safeName(selection[0]);
    }
    return safeName(selection[0]) + " +" + (selection.length - 1);
  }

  function colorToHex(color) {
    const r = toHexChannel(color.r);
    const g = toHexChannel(color.g);
    const b = toHexChannel(color.b);
    return "#" + r + g + b;
  }

  function toHexChannel(value) {
    const channel = Math.max(0, Math.min(255, Math.round(clampUnit(value) * 255)));
    return channel.toString(16).padStart(2, "0").toUpperCase();
  }

  function clampUnit(value) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      return 0;
    }
    return Math.max(0, Math.min(1, numberValue));
  }

  function normalizeAlpha(value) {
    if (value === undefined || value === null) {
      return 1;
    }
    return clampUnit(value);
  }

  function roundNumber(value, digits) {
    const factor = Math.pow(10, digits || 0);
    return Math.round((Number(value) || 0) * factor) / factor;
  }

  function normalizeErrorMessage(error, fallback) {
    if (error && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }
    return fallback;
  }

  function yieldColorMatchTurn(index, interval) {
    if (index > 0 && index % interval === 0) {
      return new Promise((resolve) => setTimeout(resolve, 0));
    }
    return Promise.resolve();
  }
})();
