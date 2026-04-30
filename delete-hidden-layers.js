;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_DELETE_HIDDEN_LAYERS_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESULT_PREVIEW_LIMIT = 24;
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isDeleteHiddenLayersMessage(message)) {
      if (isRunning) {
        postStatus("running", "\uC228\uACA8\uC9C4 \uB808\uC774\uC5B4 \uC0AD\uC81C\uAC00 \uC774\uBBF8 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4.");
        return;
      }

      if (message.type === "request-delete-hidden-layers-preview") {
        await runDeleteHiddenLayersPreview();
      } else {
        await runDeleteHiddenLayers();
      }
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_DELETE_HIDDEN_LAYERS_PATCH__ = true;

  function isDeleteHiddenLayersMessage(message) {
    return (
      !!message &&
      (message.type === "request-delete-hidden-layers-preview" || message.type === "run-delete-hidden-layers")
    );
  }

  async function runDeleteHiddenLayersPreview() {
    isRunning = true;
    postStatus("running", "\uC0AD\uC81C\uD560 \uC228\uACA8\uC9C4 \uB808\uC774\uC5B4\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");

    try {
      const result = previewHiddenLayersInSelection();
      figma.ui.postMessage({
        type: "delete-hidden-layers-preview",
        result,
      });
    } catch (error) {
      const message = normalizeErrorMessage(
        error,
        "\uC228\uACA8\uC9C4 \uB808\uC774\uC5B4 \uD655\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4."
      );
      figma.ui.postMessage({
        type: "delete-hidden-layers-preview-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2200 });
    } finally {
      isRunning = false;
    }
  }

  async function runDeleteHiddenLayers() {
    isRunning = true;
    postStatus("running", "현재 선택 안의 숨겨진 레이어를 찾고 있습니다.");

    try {
      const result = deleteHiddenLayersInSelection();
      figma.ui.postMessage({
        type: "delete-hidden-layers-result",
        result,
      });
      notifyResult(result);
    } catch (error) {
      const message = normalizeErrorMessage(error, "숨겨진 레이어 삭제에 실패했습니다.");
      figma.ui.postMessage({
        type: "delete-hidden-layers-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2400 });
    } finally {
      isRunning = false;
    }
  }

  function deleteHiddenLayersInSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const candidates = collectHiddenDescendants(selection);
    if (!candidates.length) {
      return buildResult({
        selection,
        deleted: [],
        skipped: [],
        candidateCount: 0,
        removedNodeCount: 0,
      });
    }

    const deleted = [];
    const skipped = [];
    let removedNodeCount = 0;

    for (const entry of candidates) {
      const target = entry.node;
      if (!target || target.removed) {
        continue;
      }

      try {
        target.remove();
        removedNodeCount += entry.subtreeSize;
        deleted.push({
          nodeId: entry.nodeId,
          nodeName: entry.nodeName,
          nodeType: entry.nodeType,
          path: entry.path,
          removedLayerCount: entry.subtreeSize,
        });
      } catch (error) {
        skipped.push({
          nodeId: entry.nodeId,
          nodeName: entry.nodeName,
          nodeType: entry.nodeType,
          path: entry.path,
          reason: normalizeErrorMessage(error, "해당 레이어를 삭제할 수 없습니다."),
        });
      }
    }

    return buildResult({
      selection,
      deleted,
      skipped,
      candidateCount: candidates.length,
      removedNodeCount,
    });
  }

  function previewHiddenLayersInSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("\uD504\uB808\uC784, \uADF8\uB8F9, \uB808\uC774\uC5B4\uB97C \uBA3C\uC800 \uC120\uD0DD\uD558\uC138\uC694.");
    }

    const candidates = collectHiddenDescendants(selection);

    return buildResult({
      selection,
      deleted: [],
      skipped: [],
      candidates,
      candidateCount: candidates.length,
      removedNodeCount: sumCandidateSubtreeSize(candidates),
    });
  }

  function collectHiddenDescendants(selection) {
    const results = [];
    const stack = [];

    for (let rootIndex = selection.length - 1; rootIndex >= 0; rootIndex -= 1) {
      const root = selection[rootIndex];
      if (!hasChildren(root)) {
        continue;
      }

      for (let childIndex = root.children.length - 1; childIndex >= 0; childIndex -= 1) {
        const child = root.children[childIndex];
        stack.push({
          node: child,
          path: `${safeName(root)} / ${safeName(child)}`,
          hiddenByAncestor: root.visible === false,
        });
      }
    }

    while (stack.length > 0) {
      const current = stack.pop();
      const node = current && current.node;
      if (!node || node.removed) {
        continue;
      }

      if (current.hiddenByAncestor || !node.visible) {
        results.push({
          node,
          nodeId: node.id,
          nodeName: safeName(node),
          nodeType: String(node.type || "UNKNOWN"),
          path: current.path,
          subtreeSize: countSubtreeNodes(node),
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
          path: `${current.path} / ${safeName(child)}`,
          hiddenByAncestor: false,
        });
      }
    }

    return results;
  }

  function buildResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const deleted = Array.isArray(options.deleted) ? options.deleted : [];
    const skipped = Array.isArray(options.skipped) ? options.skipped : [];
    const candidates = Array.isArray(options.candidates) ? options.candidates : [];
    const candidateCount =
      typeof options.candidateCount === "number" && Number.isFinite(options.candidateCount) ? options.candidateCount : 0;
    const removedNodeCount =
      typeof options.removedNodeCount === "number" && Number.isFinite(options.removedNodeCount)
        ? options.removedNodeCount
        : 0;

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: formatSelectionLabel(selection),
        rootCount: selection.length,
        candidateCount,
        deletedCount: deleted.length,
        skippedCount: skipped.length,
        removedNodeCount,
      },
      candidates: candidates.slice(0, RESULT_PREVIEW_LIMIT).map((entry) => ({
        nodeId: entry.nodeId,
        nodeName: entry.nodeName,
        nodeType: entry.nodeType,
        path: entry.path,
        removedLayerCount: entry.subtreeSize,
      })),
      deleted: deleted.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function notifyResult(result) {
    const summary = result && result.summary ? result.summary : {};
    const deletedCount = summary.deletedCount || 0;
    const skippedCount = summary.skippedCount || 0;
    const removedNodeCount = summary.removedNodeCount || 0;

    if (deletedCount === 0) {
      figma.notify("삭제할 숨겨진 레이어가 없습니다.", { timeout: 1800 });
      return;
    }

    const baseMessage =
      removedNodeCount > deletedCount
        ? `숨겨진 레이어 정리 완료 (${removedNodeCount}개 레이어 제거)`
        : `숨겨진 레이어 정리 완료 (${deletedCount}개 삭제)`;

    const message = skippedCount > 0 ? `${baseMessage}, ${skippedCount}개 건너뜀` : baseMessage;
    figma.notify(message, { timeout: 2200 });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "delete-hidden-layers-status",
      status,
      message,
    });
  }

  function hasChildren(node) {
    return !!node && "children" in node && Array.isArray(node.children) && node.children.length > 0;
  }

  function countSubtreeNodes(node) {
    let count = 0;
    const stack = [node];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      count += 1;
      if (!hasChildren(current)) {
        continue;
      }

      for (let index = current.children.length - 1; index >= 0; index -= 1) {
        stack.push(current.children[index]);
      }
    }

    return count;
  }

  function sumCandidateSubtreeSize(candidates) {
    if (!Array.isArray(candidates) || !candidates.length) {
      return 0;
    }

    return candidates.reduce((total, entry) => {
      const subtreeSize =
        entry && typeof entry.subtreeSize === "number" && Number.isFinite(entry.subtreeSize) ? entry.subtreeSize : 0;
      return total + subtreeSize;
    }, 0);
  }

  function formatSelectionLabel(selection) {
    if (!selection.length) {
      return "선택 없음";
    }

    if (selection.length === 1) {
      return safeName(selection[0]);
    }

    return `${safeName(selection[0])} 외 ${selection.length - 1}개`;
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
