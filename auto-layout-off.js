;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AUTO_LAYOUT_OFF_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESULT_PREVIEW_LIMIT = 24;
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isAutoLayoutOffMessage(message)) {
      if (isRunning) {
        postStatus("running", "\uC624\uD1A0\uB808\uC774\uC544\uC6C3 \uD574\uC81C\uAC00 \uC774\uBBF8 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4.");
        return;
      }

      await runAutoLayoutOff();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AUTO_LAYOUT_OFF_PATCH__ = true;

  function isAutoLayoutOffMessage(message) {
    return !!message && message.type === "run-auto-layout-off";
  }

  async function runAutoLayoutOff() {
    isRunning = true;
    postStatus("running", "\uC120\uD0DD \uBC94\uC704\uC758 \uC624\uD1A0\uB808\uC774\uC544\uC6C3\uC744 \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");

    try {
      const result = disableAutoLayoutInSelection();
      figma.ui.postMessage({
        type: "auto-layout-off-result",
        result,
      });
      notifyResult(result);
    } catch (error) {
      const message = normalizeErrorMessage(error, "\uC624\uD1A0\uB808\uC774\uC544\uC6C3\uC744 \uD574\uC81C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      figma.ui.postMessage({
        type: "auto-layout-off-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2600 });
    } finally {
      isRunning = false;
    }
  }

  function disableAutoLayoutInSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("\uD504\uB808\uC784, \uADF8\uB8F9, \uB808\uC774\uC5B4\uB97C \uBA3C\uC800 \uC120\uD0DD\uD558\uC138\uC694.");
    }

    const candidates = collectAutoLayoutNodes(selection);
    const snapshots = new Map();
    for (const entry of candidates) {
      if (entry && entry.node && !entry.node.removed) {
        snapshots.set(entry.nodeId, captureLayoutSnapshot(entry.node));
      }
    }

    if (!candidates.length) {
      return buildResult({
        selection,
        disabled: [],
        skipped: [],
        candidateCount: 0,
      });
    }

    const disabled = [];
    const skipped = [];

    for (const entry of candidates) {
      const target = entry && entry.node;
      if (!target || target.removed) {
        continue;
      }

      try {
        target.layoutMode = "NONE";
        restoreLayoutSnapshot(target, snapshots.get(entry.nodeId));
        disabled.push({
          nodeId: entry.nodeId,
          nodeName: entry.nodeName,
          nodeType: entry.nodeType,
          path: entry.path,
          previousLayoutMode: entry.layoutMode,
          childCount: entry.childCount,
        });
      } catch (error) {
        skipped.push({
          nodeId: entry.nodeId,
          nodeName: entry.nodeName,
          nodeType: entry.nodeType,
          path: entry.path,
          previousLayoutMode: entry.layoutMode,
          reason: normalizeErrorMessage(error, "\uC774 \uB808\uC774\uC5B4\uC758 \uC624\uD1A0\uB808\uC774\uC544\uC6C3\uC744 \uD574\uC81C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."),
        });
      }
    }

    return buildResult({
      selection,
      disabled,
      skipped,
      candidateCount: candidates.length,
    });
  }

  function collectAutoLayoutNodes(selection) {
    const results = [];
    const stack = [];
    const seen = {};

    for (let rootIndex = selection.length - 1; rootIndex >= 0; rootIndex -= 1) {
      const root = selection[rootIndex];
      if (!root || root.removed) {
        continue;
      }
      stack.push({
        node: root,
        path: safeName(root),
      });
    }

    while (stack.length > 0) {
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

      const children = getChildren(node);
      if (isAutoLayoutNode(node)) {
        results.push({
          node,
          nodeId,
          nodeName: safeName(node),
          nodeType: String(node.type || "UNKNOWN"),
          path: current.path,
          layoutMode: node.layoutMode,
          childCount: children.length,
        });
      }

      for (let index = children.length - 1; index >= 0; index -= 1) {
        const child = children[index];
        stack.push({
          node: child,
          path: current.path + " / " + safeName(child),
        });
      }
    }

    return results;
  }

  function isAutoLayoutNode(node) {
    try {
      return !!node && "layoutMode" in node && typeof node.layoutMode === "string" && node.layoutMode !== "NONE";
    } catch (error) {
      return false;
    }
  }

  function captureLayoutSnapshot(node) {
    const snapshot = {
      width: readFiniteNumber(node, "width"),
      height: readFiniteNumber(node, "height"),
      x: readFiniteNumber(node, "x"),
      y: readFiniteNumber(node, "y"),
      relativeTransform: readTransform(node),
      children: [],
    };

    const children = getChildren(node);
    for (let index = 0; index < children.length; index += 1) {
      const child = children[index];
      if (!child || child.removed) {
        continue;
      }
      snapshot.children.push({
        node: child,
        width: readFiniteNumber(child, "width"),
        height: readFiniteNumber(child, "height"),
        x: readFiniteNumber(child, "x"),
        y: readFiniteNumber(child, "y"),
        relativeTransform: readTransform(child),
      });
    }

    return snapshot;
  }

  function restoreLayoutSnapshot(node, snapshot) {
    if (!node || node.removed || !snapshot) {
      return;
    }

    restoreTransform(node, snapshot);
    tryResizeNode(node, snapshot.width, snapshot.height);

    const children = Array.isArray(snapshot.children) ? snapshot.children : [];
    for (let index = 0; index < children.length; index += 1) {
      const entry = children[index];
      const child = entry && entry.node;
      if (!child || child.removed) {
        continue;
      }
      restoreTransform(child, entry);
      tryResizeNode(child, entry.width, entry.height);
    }
  }

  function restoreTransform(node, snapshot) {
    if (!node || node.removed || !snapshot) {
      return;
    }

    if (snapshot.relativeTransform && "relativeTransform" in node) {
      try {
        node.relativeTransform = cloneTransform(snapshot.relativeTransform);
        return;
      } catch (error) {
        // Fall back to x/y when transform cannot be overridden, such as in some instances.
      }
    }

    if (Number.isFinite(snapshot.x) && "x" in node) {
      try {
        node.x = snapshot.x;
      } catch (error) {
        // Ignore nodes that cannot accept position overrides.
      }
    }
    if (Number.isFinite(snapshot.y) && "y" in node) {
      try {
        node.y = snapshot.y;
      } catch (error) {
        // Ignore nodes that cannot accept position overrides.
      }
    }
  }

  function tryResizeNode(node, width, height) {
    if (!node || node.removed || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return false;
    }

    const currentWidth = readFiniteNumber(node, "width");
    const currentHeight = readFiniteNumber(node, "height");
    if (Math.abs(currentWidth - width) < 0.01 && Math.abs(currentHeight - height) < 0.01) {
      return true;
    }

    try {
      if (typeof node.resizeWithoutConstraints === "function") {
        node.resizeWithoutConstraints(width, height);
        return true;
      }
      if (typeof node.resize === "function") {
        node.resize(width, height);
        return true;
      }
    } catch (error) {
      return false;
    }

    return false;
  }

  function getChildren(node) {
    if (!node || !("children" in node)) {
      return [];
    }
    try {
      return Array.isArray(node.children) ? Array.from(node.children) : [];
    } catch (error) {
      return [];
    }
  }

  function readFiniteNumber(node, property) {
    try {
      const value = node && typeof node === "object" ? node[property] : NaN;
      return typeof value === "number" && Number.isFinite(value) ? value : NaN;
    } catch (error) {
      return NaN;
    }
  }

  function readTransform(node) {
    try {
      return cloneTransform(node && node.relativeTransform);
    } catch (error) {
      return null;
    }
  }

  function cloneTransform(transform) {
    if (!Array.isArray(transform) || transform.length < 2) {
      return null;
    }
    return [
      Array.isArray(transform[0]) ? transform[0].slice(0, 3) : [1, 0, 0],
      Array.isArray(transform[1]) ? transform[1].slice(0, 3) : [0, 1, 0],
    ];
  }

  function buildResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const disabled = Array.isArray(options.disabled) ? options.disabled : [];
    const skipped = Array.isArray(options.skipped) ? options.skipped : [];
    const candidateCount =
      typeof options.candidateCount === "number" && Number.isFinite(options.candidateCount) ? options.candidateCount : 0;

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: formatSelectionLabel(selection),
        rootCount: selection.length,
        candidateCount,
        disabledCount: disabled.length,
        skippedCount: skipped.length,
      },
      disabled: disabled.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function notifyResult(result) {
    const summary = result && result.summary ? result.summary : {};
    const disabledCount = summary.disabledCount || 0;
    const skippedCount = summary.skippedCount || 0;

    if (disabledCount === 0) {
      figma.notify("\uD574\uC81C\uD560 \uC624\uD1A0\uB808\uC774\uC544\uC6C3\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.", { timeout: 1800 });
      return;
    }

    const baseMessage = "\uC624\uD1A0\uB808\uC774\uC544\uC6C3 " + disabledCount + "\uAC1C\uB97C \uD574\uC81C\uD588\uC2B5\uB2C8\uB2E4.";
    const message = skippedCount > 0 ? baseMessage + " " + skippedCount + "\uAC1C \uAC74\uB108\uB700." : baseMessage;
    figma.notify(message, { timeout: 2200 });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "auto-layout-off-status",
      status,
      message,
    });
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
    try {
      if (node && typeof node.name === "string" && node.name.trim()) {
        return node.name.trim();
      }

      if (node && typeof node.type === "string" && node.type.trim()) {
        return node.type.trim();
      }
    } catch (error) {
      return "Unnamed";
    }

    return "Unnamed";
  }

  function safeNodeId(node) {
    try {
      return String((node && node.id) || "");
    } catch (error) {
      return "";
    }
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
