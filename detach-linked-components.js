;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_DETACH_LINKED_COMPONENTS_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESULT_PREVIEW_LIMIT = 24;
  const MAX_DETACH_PASSES = 50;
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isDetachLinkedComponentsMessage(message)) {
      if (isRunning) {
        postStatus("running", "\uC5F0\uACB0\uB41C \uCEF4\uD3EC\uB10C\uD2B8 \uD574\uC81C\uAC00 \uC774\uBBF8 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4.");
        return;
      }

      await runDetachLinkedComponents();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_DETACH_LINKED_COMPONENTS_PATCH__ = true;

  function isDetachLinkedComponentsMessage(message) {
    return !!message && message.type === "run-detach-linked-components";
  }

  async function runDetachLinkedComponents() {
    isRunning = true;
    postStatus("running", "\uC120\uD0DD \uBC94\uC704\uC758 \uC5F0\uACB0\uB41C \uCEF4\uD3EC\uB10C\uD2B8\uB97C \uCC3E\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");

    try {
      const result = detachLinkedComponentsInSelection();
      figma.ui.postMessage({
        type: "detach-linked-components-result",
        result,
      });
      notifyResult(result);
    } catch (error) {
      const message = normalizeErrorMessage(error, "\uC5F0\uACB0\uB41C \uCEF4\uD3EC\uB10C\uD2B8\uB97C \uD574\uC81C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      figma.ui.postMessage({
        type: "detach-linked-components-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2600 });
    } finally {
      isRunning = false;
    }
  }

  function detachLinkedComponentsInSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("\uD504\uB808\uC784, \uADF8\uB8F9, \uB808\uC774\uC5B4\uB97C \uBA3C\uC800 \uC120\uD0DD\uD558\uC138\uC694.");
    }

    let roots = selection.slice();
    const processed = [];
    const skipped = [];
    const skippedNodeIds = {};
    let candidateCount = 0;
    let passCount = 0;

    for (let pass = 0; pass < MAX_DETACH_PASSES; pass += 1) {
      const candidates = collectTopLevelLinkedComponentCandidates(roots, skippedNodeIds);
      if (!candidates.length) {
        break;
      }

      let changedCount = 0;
      candidateCount += candidates.length;
      passCount += 1;

      for (let index = 0; index < candidates.length; index += 1) {
        const entry = candidates[index];
        const target = entry && entry.node;
        if (!target || target.removed) {
          continue;
        }

        try {
          const replacement =
            entry.action === "detach-instance" ? detachInstanceNode(target) : convertComponentNodeToFrame(target);
          if (replacement && replacement !== target) {
            roots = replaceRootReference(roots, target, replacement);
          }
          processed.push(buildProcessedEntry(entry, replacement));
          changedCount += 1;
        } catch (error) {
          skippedNodeIds[entry.nodeId] = true;
          skipped.push({
            nodeId: entry.nodeId,
            nodeName: entry.nodeName,
            nodeType: entry.nodeType,
            action: entry.action,
            path: entry.path,
            reason: normalizeErrorMessage(error, "\uC774 \uCEF4\uD3EC\uB10C\uD2B8\uB97C \uD574\uC81C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."),
          });
        }
      }

      if (changedCount === 0) {
        break;
      }
    }

    const remaining = collectTopLevelLinkedComponentCandidates(roots, skippedNodeIds);
    const nextSelection = roots.filter((node) => node && !node.removed && isSelectableSceneNode(node));
    if (nextSelection.length > 0) {
      figma.currentPage.selection = nextSelection;
    }

    return buildResult({
      selection: nextSelection.length > 0 ? nextSelection : selection,
      processed,
      skipped,
      candidateCount,
      passCount,
      remainingCount: remaining.length,
    });
  }

  function collectTopLevelLinkedComponentCandidates(roots, skippedNodeIds) {
    const results = [];
    const stack = [];

    for (let rootIndex = roots.length - 1; rootIndex >= 0; rootIndex -= 1) {
      const root = roots[rootIndex];
      if (!root || root.removed) {
        continue;
      }
      stack.push({
        node: root,
        path: safeName(root),
        depth: 0,
      });
    }

    while (stack.length > 0) {
      const current = stack.pop();
      const node = current && current.node;
      if (!node || node.removed) {
        continue;
      }

      const action = getLinkedComponentAction(node);
      if (action && !skippedNodeIds[node.id]) {
        results.push({
          node,
          nodeId: node.id,
          nodeName: safeName(node),
          nodeType: String(node.type || "UNKNOWN"),
          action,
          path: current.path,
          depth: current.depth,
        });
        continue;
      }

      if (!hasChildren(node)) {
        continue;
      }

      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        const child = node.children[index];
        stack.push({
          node: child,
          path: current.path + " / " + safeName(child),
          depth: current.depth + 1,
        });
      }
    }

    return results;
  }

  function getLinkedComponentAction(node) {
    const type = String((node && node.type) || "");
    if (type === "INSTANCE" && typeof node.detachInstance === "function") {
      return "detach-instance";
    }
    if (type === "COMPONENT" || type === "COMPONENT_SET") {
      return "convert-component";
    }
    return "";
  }

  function detachInstanceNode(node) {
    const wasLocked = readLocked(node);
    const unlocked = unlockNodeAndAncestors(node);
    let replacement = null;

    try {
      replacement = node.detachInstance();
      if (replacement && typeof replacement === "object") {
        setLocked(replacement, wasLocked);
      }
      return replacement || null;
    } finally {
      restoreUnlockedNodes(unlocked, replacement);
    }
  }

  function convertComponentNodeToFrame(node) {
    const parent = node.parent;
    if (!parent || typeof parent.insertChild !== "function" || !hasChildren(parent)) {
      throw new Error("\uCEF4\uD3EC\uB10C\uD2B8\uB97C \uBC14\uAFC0 \uC704\uCE58\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    const index = getChildIndex(parent, node);
    if (index < 0) {
      throw new Error("\uCEF4\uD3EC\uB10C\uD2B8 \uC21C\uC11C\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    const wasLocked = readLocked(node);
    const unlocked = unlockNodeAndAncestors(node);
    const frame = figma.createFrame();
    let movedChildCount = 0;

    try {
      frame.name = safeName(node);
      clearDefaultFrameAppearance(frame);
      resizeLike(node, frame);
      parent.insertChild(index, frame);
      copyFrameLikeProperties(node, frame);
      movedChildCount = moveChildren(node, frame);
      setLocked(frame, wasLocked);
      node.remove();
      return frame;
    } catch (error) {
      if (movedChildCount === 0 && frame && !frame.removed) {
        try {
          frame.remove();
        } catch (removeError) {}
      }
      throw error;
    } finally {
      restoreUnlockedNodes(unlocked, frame);
    }
  }

  function clearDefaultFrameAppearance(frame) {
    trySet(frame, "fills", []);
    trySet(frame, "strokes", []);
    trySet(frame, "effects", []);
  }

  function copyFrameLikeProperties(source, target) {
    const complexProperties = [
      "relativeTransform",
      "fills",
      "strokes",
      "effects",
      "exportSettings",
      "dashPattern",
      "constraints",
      "layoutGrids",
    ];
    const simpleProperties = [
      "x",
      "y",
      "rotation",
      "visible",
      "opacity",
      "blendMode",
      "isMask",
      "strokeWeight",
      "strokeAlign",
      "strokeCap",
      "strokeJoin",
      "strokeMiterLimit",
      "cornerRadius",
      "cornerSmoothing",
      "topLeftRadius",
      "topRightRadius",
      "bottomLeftRadius",
      "bottomRightRadius",
      "clipsContent",
      "layoutMode",
      "primaryAxisSizingMode",
      "counterAxisSizingMode",
      "primaryAxisAlignItems",
      "counterAxisAlignItems",
      "paddingLeft",
      "paddingRight",
      "paddingTop",
      "paddingBottom",
      "itemSpacing",
      "counterAxisSpacing",
      "layoutWrap",
      "strokesIncludedInLayout",
      "layoutAlign",
      "layoutGrow",
      "layoutPositioning",
      "minWidth",
      "maxWidth",
      "minHeight",
      "maxHeight",
      "itemReverseZIndex",
      "gridStyleId",
    ];

    for (let index = 0; index < simpleProperties.length; index += 1) {
      copyProperty(source, target, simpleProperties[index], false);
    }

    for (let index = 0; index < complexProperties.length; index += 1) {
      copyProperty(source, target, complexProperties[index], true);
    }
  }

  function copyProperty(source, target, property, cloneValue) {
    if (!source || !target || !(property in source) || !(property in target)) {
      return;
    }

    try {
      const value = source[property];
      target[property] = cloneValue ? clonePlainValue(value) : value;
    } catch (error) {}
  }

  function clonePlainValue(value) {
    if (!value || typeof value !== "object") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => clonePlainValue(item));
    }

    const clone = {};
    const keys = Object.keys(value);
    for (let index = 0; index < keys.length; index += 1) {
      const key = keys[index];
      clone[key] = clonePlainValue(value[key]);
    }
    return clone;
  }

  function resizeLike(source, target) {
    const width = typeof source.width === "number" && Number.isFinite(source.width) ? Math.max(0.01, source.width) : 1;
    const height = typeof source.height === "number" && Number.isFinite(source.height) ? Math.max(0.01, source.height) : 1;

    try {
      if (typeof target.resizeWithoutConstraints === "function") {
        target.resizeWithoutConstraints(width, height);
      } else if (typeof target.resize === "function") {
        target.resize(width, height);
      }
    } catch (error) {}
  }

  function moveChildren(source, target) {
    let moved = 0;
    while (hasChildren(source) && source.children.length > 0) {
      target.appendChild(source.children[0]);
      moved += 1;
    }
    return moved;
  }

  function replaceRootReference(roots, original, replacement) {
    return roots.map((root) => {
      if (root && original && root.id === original.id) {
        return replacement;
      }
      return root;
    });
  }

  function buildProcessedEntry(entry, replacement) {
    return {
      nodeId: entry.nodeId,
      nodeName: entry.nodeName,
      nodeType: entry.nodeType,
      action: entry.action,
      path: entry.path,
      replacementId: replacement && typeof replacement.id === "string" ? replacement.id : "",
      replacementType: replacement && typeof replacement.type === "string" ? replacement.type : "",
    };
  }

  function buildResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const processed = Array.isArray(options.processed) ? options.processed : [];
    const skipped = Array.isArray(options.skipped) ? options.skipped : [];
    const candidateCount =
      typeof options.candidateCount === "number" && Number.isFinite(options.candidateCount) ? options.candidateCount : 0;
    const passCount = typeof options.passCount === "number" && Number.isFinite(options.passCount) ? options.passCount : 0;
    const remainingCount =
      typeof options.remainingCount === "number" && Number.isFinite(options.remainingCount) ? options.remainingCount : 0;
    const detachedInstanceCount = countProcessedAction(processed, "detach-instance");
    const convertedComponentCount = processed.filter((entry) => entry.nodeType === "COMPONENT").length;
    const convertedComponentSetCount = processed.filter((entry) => entry.nodeType === "COMPONENT_SET").length;

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: formatSelectionLabel(selection),
        rootCount: selection.length,
        candidateCount,
        detachedInstanceCount,
        convertedComponentCount,
        convertedComponentSetCount,
        processedCount: processed.length,
        skippedCount: skipped.length,
        passCount,
        remainingCount,
      },
      processed: processed.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function countProcessedAction(processed, action) {
    let count = 0;
    for (let index = 0; index < processed.length; index += 1) {
      if (processed[index] && processed[index].action === action) {
        count += 1;
      }
    }
    return count;
  }

  function notifyResult(result) {
    const summary = result && result.summary ? result.summary : {};
    const processedCount = summary.processedCount || 0;
    const skippedCount = summary.skippedCount || 0;
    const remainingCount = summary.remainingCount || 0;

    if (processedCount === 0) {
      figma.notify("\uD574\uC81C\uD560 \uC5F0\uACB0\uB41C \uCEF4\uD3EC\uB10C\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.", { timeout: 1800 });
      return;
    }

    let message = "\uC5F0\uACB0\uB41C \uCEF4\uD3EC\uB10C\uD2B8 \uD574\uC81C \uC644\uB8CC (" + processedCount + "\uAC1C)";
    if (skippedCount > 0) {
      message += ", " + skippedCount + "\uAC1C \uAC74\uB108\uB700";
    }
    if (remainingCount > 0) {
      message += ", " + remainingCount + "\uAC1C \uB0A8\uC74C";
    }
    figma.notify(message, { timeout: 2400 });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "detach-linked-components-status",
      status,
      message,
    });
  }

  function unlockNodeAndAncestors(node) {
    const chain = [];
    let current = node;
    while (current && current.type !== "DOCUMENT") {
      chain.push(current);
      current = current.parent;
    }

    const unlocked = [];
    for (let index = chain.length - 1; index >= 0; index -= 1) {
      const candidate = chain[index];
      if (!candidate || !("locked" in candidate) || candidate.locked !== true) {
        continue;
      }

      try {
        candidate.locked = false;
        unlocked.push(candidate);
      } catch (error) {}
    }
    return unlocked;
  }

  function restoreUnlockedNodes(nodes, replacement) {
    if (!Array.isArray(nodes) || !nodes.length) {
      return;
    }

    const replacementId = replacement && typeof replacement.id === "string" ? replacement.id : "";
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      if (!node || node.removed) {
        continue;
      }
      if (replacementId && node.id === replacementId) {
        continue;
      }
      setLocked(node, true);
    }
  }

  function readLocked(node) {
    return !!(node && "locked" in node && node.locked === true);
  }

  function setLocked(node, locked) {
    if (!node || !("locked" in node) || node.removed) {
      return;
    }

    try {
      node.locked = locked === true;
    } catch (error) {}
  }

  function trySet(node, property, value) {
    if (!node || !(property in node)) {
      return;
    }

    try {
      node[property] = value;
    } catch (error) {}
  }

  function hasChildren(node) {
    return !!node && "children" in node && Array.isArray(node.children);
  }

  function getChildIndex(parent, child) {
    if (!hasChildren(parent) || !child) {
      return -1;
    }

    for (let index = 0; index < parent.children.length; index += 1) {
      if (parent.children[index] && parent.children[index].id === child.id) {
        return index;
      }
    }
    return -1;
  }

  function isSelectableSceneNode(node) {
    return !!node && typeof node.id === "string" && node.type !== "PAGE" && node.type !== "DOCUMENT";
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

  function safeName(node) {
    if (node && typeof node.name === "string" && node.name.trim()) {
      return node.name.trim();
    }

    if (node && typeof node.type === "string" && node.type.trim()) {
      return node.type.trim();
    }

    return "Unnamed";
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
