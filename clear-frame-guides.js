;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_CLEAR_FRAME_GUIDES_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESULT_PREVIEW_LIMIT = 24;
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isClearFrameGuidesMessage(message)) {
      if (isRunning) {
        postStatus("running", "\uD504\uB808\uC784 \uAC00\uC774\uB4DC \uC9C0\uC6B0\uAE30\uAC00 \uC774\uBBF8 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4.");
        return;
      }

      await runClearFrameGuides();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_CLEAR_FRAME_GUIDES_PATCH__ = true;

  function isClearFrameGuidesMessage(message) {
    return !!message && message.type === "run-clear-frame-guides";
  }

  async function runClearFrameGuides() {
    isRunning = true;
    postStatus("running", "\uC120\uD0DD\uD55C \uD504\uB808\uC784\uC758 \uAC00\uC774\uB4DC\uB97C \uC9C0\uC6B0\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");

    try {
      const result = clearFrameGuidesInSelection();
      figma.ui.postMessage({
        type: "clear-frame-guides-result",
        result,
      });
      notifyResult(result);
    } catch (error) {
      const message = normalizeErrorMessage(error, "\uD504\uB808\uC784 \uAC00\uC774\uB4DC\uB97C \uC9C0\uC6B0\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      figma.ui.postMessage({
        type: "clear-frame-guides-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2400 });
    } finally {
      isRunning = false;
    }
  }

  function clearFrameGuidesInSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("\uAC00\uC774\uB4DC\uB97C \uC9C0\uC6B8 \uD504\uB808\uC784\uC744 \uBA3C\uC800 \uC120\uD0DD\uD558\uC138\uC694.");
    }

    const frames = collectSelectedGuideFrames(selection);
    if (!frames.length) {
      throw new Error("\uC120\uD0DD\uD55C \uB300\uC0C1 \uC911 \uAC00\uC774\uB4DC\uB97C \uC9C0\uC6B8 \uD504\uB808\uC784\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
    }

    const cleared = [];
    const skipped = [];
    let guideCount = 0;

    for (let index = 0; index < frames.length; index += 1) {
      const entry = frames[index];
      const frame = entry && entry.node;
      if (!frame || frame.removed) {
        continue;
      }

      const frameGuideCount = getFrameGuideCount(frame);
      if (frameGuideCount <= 0) {
        continue;
      }

      try {
        frame.guides = [];
        guideCount += frameGuideCount;
        cleared.push({
          nodeId: entry.nodeId,
          nodeName: entry.nodeName,
          nodeType: entry.nodeType,
          path: entry.path,
          guideCount: frameGuideCount,
        });
      } catch (error) {
        skipped.push({
          nodeId: entry.nodeId,
          nodeName: entry.nodeName,
          nodeType: entry.nodeType,
          path: entry.path,
          guideCount: frameGuideCount,
          reason: normalizeErrorMessage(error, "\uC774 \uD504\uB808\uC784\uC758 \uAC00\uC774\uB4DC\uB97C \uC9C0\uC6B0\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."),
        });
      }
    }

    return buildResult({
      selection,
      frameCount: frames.length,
      cleared,
      skipped,
      guideCount,
    });
  }

  function collectSelectedGuideFrames(selection) {
    const frames = [];

    for (let index = 0; index < selection.length; index += 1) {
      const node = selection[index];
      if (!isGuideFrame(node)) {
        continue;
      }

      frames.push({
        node,
        nodeId: node.id,
        nodeName: safeName(node),
        nodeType: String(node.type || "UNKNOWN"),
        path: safeName(node),
      });
    }

    return frames;
  }

  function isGuideFrame(node) {
    if (!node || node.removed || String(node.type || "") !== "FRAME") {
      return false;
    }

    return "guides" in node && Array.isArray(node.guides);
  }

  function getFrameGuideCount(frame) {
    if (!frame || !("guides" in frame) || !Array.isArray(frame.guides)) {
      return 0;
    }

    return frame.guides.length;
  }

  function buildResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const cleared = Array.isArray(options.cleared) ? options.cleared : [];
    const skipped = Array.isArray(options.skipped) ? options.skipped : [];
    const frameCount =
      typeof options.frameCount === "number" && Number.isFinite(options.frameCount) ? options.frameCount : 0;
    const guideCount =
      typeof options.guideCount === "number" && Number.isFinite(options.guideCount) ? options.guideCount : 0;

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: formatSelectionLabel(selection),
        rootCount: selection.length,
        frameCount,
        clearedFrameCount: cleared.length,
        skippedCount: skipped.length,
        guideCount,
      },
      cleared: cleared.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function notifyResult(result) {
    const summary = result && result.summary ? result.summary : {};
    const guideCount = summary.guideCount || 0;
    const skippedCount = summary.skippedCount || 0;

    if (guideCount === 0) {
      figma.notify("\uC120\uD0DD\uD55C \uD504\uB808\uC784\uC5D0 \uC9C0\uC6B8 \uAC00\uC774\uB4DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.", {
        timeout: 1800,
      });
      return;
    }

    const baseMessage = "\uD504\uB808\uC784 \uAC00\uC774\uB4DC " + guideCount + "\uAC1C\uB97C \uC9C0\uC6E0\uC2B5\uB2C8\uB2E4.";
    const message = skippedCount > 0 ? baseMessage + " " + skippedCount + "\uAC1C \uAC74\uB108\uB700." : baseMessage;
    figma.notify(message, { timeout: 2200 });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "clear-frame-guides-status",
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
