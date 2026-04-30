;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_UNLOCK_LOCKED_LAYERS_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESULT_PREVIEW_LIMIT = 24;
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isUnlockLockedLayersMessage(message)) {
      if (isRunning) {
        postStatus("running", "잠긴 레이어 해제가 이미 진행 중입니다.");
        return;
      }

      await runUnlockLockedLayers();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_UNLOCK_LOCKED_LAYERS_PATCH__ = true;

  function isUnlockLockedLayersMessage(message) {
    return !!message && message.type === "run-unlock-locked-layers";
  }

  async function runUnlockLockedLayers() {
    isRunning = true;
    postStatus("running", "현재 선택 안의 잠긴 레이어를 찾고 있습니다.");

    try {
      const result = unlockLockedLayersInSelection();
      figma.ui.postMessage({
        type: "unlock-locked-layers-result",
        result,
      });
      notifyResult(result);
    } catch (error) {
      const message = normalizeErrorMessage(error, "잠긴 레이어 해제에 실패했습니다.");
      figma.ui.postMessage({
        type: "unlock-locked-layers-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2400 });
    } finally {
      isRunning = false;
    }
  }

  function unlockLockedLayersInSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const candidates = collectLockedNodes(selection);
    if (!candidates.length) {
      return buildResult({
        selection,
        unlocked: [],
        skipped: [],
        candidateCount: 0,
      });
    }

    const unlocked = [];
    const skipped = [];

    for (const entry of candidates) {
      const target = entry.node;
      if (!target || target.removed) {
        continue;
      }

      try {
        target.locked = false;
        unlocked.push({
          nodeId: entry.nodeId,
          nodeName: entry.nodeName,
          nodeType: entry.nodeType,
          path: entry.path,
        });
      } catch (error) {
        skipped.push({
          nodeId: entry.nodeId,
          nodeName: entry.nodeName,
          nodeType: entry.nodeType,
          path: entry.path,
          reason: normalizeErrorMessage(error, "해당 레이어의 잠금을 해제할 수 없습니다."),
        });
      }
    }

    return buildResult({
      selection,
      unlocked,
      skipped,
      candidateCount: candidates.length,
    });
  }

  function collectLockedNodes(selection) {
    const results = [];
    const stack = [];

    for (let rootIndex = selection.length - 1; rootIndex >= 0; rootIndex -= 1) {
      const root = selection[rootIndex];
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

      if ("locked" in node && node.locked === true) {
        results.push({
          node,
          nodeId: node.id,
          nodeName: safeName(node),
          nodeType: String(node.type || "UNKNOWN"),
          path: current.path,
        });
      }

      if (!hasChildren(node)) {
        continue;
      }

      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        const child = node.children[index];
        stack.push({
          node: child,
          path: current.path + " / " + safeName(child),
        });
      }
    }

    return results;
  }

  function buildResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const unlocked = Array.isArray(options.unlocked) ? options.unlocked : [];
    const skipped = Array.isArray(options.skipped) ? options.skipped : [];
    const candidateCount =
      typeof options.candidateCount === "number" && Number.isFinite(options.candidateCount) ? options.candidateCount : 0;

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: formatSelectionLabel(selection),
        rootCount: selection.length,
        candidateCount,
        unlockedCount: unlocked.length,
        skippedCount: skipped.length,
      },
      unlocked: unlocked.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function notifyResult(result) {
    const summary = result && result.summary ? result.summary : {};
    const unlockedCount = summary.unlockedCount || 0;
    const skippedCount = summary.skippedCount || 0;

    if (unlockedCount === 0) {
      figma.notify("해제할 잠긴 레이어가 없습니다.", { timeout: 1800 });
      return;
    }

    const baseMessage = "잠긴 레이어 해제 완료 (" + unlockedCount + "개)";
    const message = skippedCount > 0 ? baseMessage + ", " + skippedCount + "개 건너뜀" : baseMessage;
    figma.notify(message, { timeout: 2200 });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "unlock-locked-layers-status",
      status,
      message,
    });
  }

  function hasChildren(node) {
    return !!node && "children" in node && Array.isArray(node.children) && node.children.length > 0;
  }

  function formatSelectionLabel(selection) {
    if (!selection.length) {
      return "선택 없음";
    }

    if (selection.length === 1) {
      return safeName(selection[0]);
    }

    return safeName(selection[0]) + " 외 " + (selection.length - 1) + "개";
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
