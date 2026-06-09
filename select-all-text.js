;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_SELECT_ALL_TEXT_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESULT_PREVIEW_LIMIT = 24;
  const NODE_SCAN_YIELD_INTERVAL = 512;
  const VIEWPORT_FOCUS_LIMIT = 64;
  const BASE_SELECTION_SYNC_SUPPRESS_MS = 2500;
  const BASE_SELECTION_SYNC_REFRESH_DELAY_MS = 2600;
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isSelectAllTextMessage(message)) {
      if (isRunning) {
        postStatus("running", "\uD14D\uC2A4\uD2B8\uB97C \uC120\uD0DD\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");
        return;
      }

      await runSelectAllText();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_SELECT_ALL_TEXT_PATCH__ = true;

  function isSelectAllTextMessage(message) {
    return !!message && message.type === "run-select-all-text";
  }

  async function runSelectAllText() {
    isRunning = true;
    postStatus("running", "\uC120\uD0DD \uBC94\uC704\uC758 \uD14D\uC2A4\uD2B8\uB97C \uCC3E\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");

    try {
      const result = await selectAllTextInSelection();
      figma.ui.postMessage({
        type: "select-all-text-result",
        result,
      });
      notifyResult(result);
    } catch (error) {
      const message = normalizeErrorMessage(error, "\uD14D\uC2A4\uD2B8 \uC120\uD0DD\uC744 \uCC98\uB9AC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
      figma.ui.postMessage({
        type: "select-all-text-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2400 });
    } finally {
      isRunning = false;
    }
  }

  async function selectAllTextInSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("\uD504\uB808\uC784, \uADF8\uB8F9, \uB808\uC774\uC5B4\uB97C \uBA3C\uC800 \uC120\uD0DD\uD558\uC138\uC694.");
    }

    const textEntries = await collectTextEntries(selection);
    if (!textEntries.length) {
      return buildResult({
        selection,
        candidates: [],
        selected: [],
        skipped: [],
      });
    }

    const selectionResult = selectTextEntries(textEntries);
    if (selectionResult.selected.length > 0 && selectionResult.selected.length <= VIEWPORT_FOCUS_LIMIT) {
      try {
        figma.viewport.scrollAndZoomIntoView(selectionResult.selected.map((entry) => entry.node));
      } catch (error) {
        // Viewport changes are a convenience; selection should still succeed if zooming fails.
      }
    }

    return buildResult({
      selection,
      candidates: textEntries,
      selected: selectionResult.selected,
      skipped: selectionResult.skipped,
    });
  }

  async function collectTextEntries(selection) {
    const results = [];
    const seen = {};
    const stack = [];

    for (let rootIndex = selection.length - 1; rootIndex >= 0; rootIndex -= 1) {
      const root = selection[rootIndex];
      if (!root || root.removed) {
        continue;
      }
      stack.push({
        node: root,
      });
    }

    let scannedCount = 0;
    while (stack.length > 0) {
      await yieldSelectAllTextTurn(scannedCount, NODE_SCAN_YIELD_INTERVAL);
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

      if (node.type === "TEXT") {
        results.push({
          node,
          nodeId,
          nodeName: safeName(node),
          nodeType: String(node.type || "TEXT"),
          path: safeName(node),
        });
        continue;
      }

      const children = getChildren(node);
      for (let index = children.length - 1; index >= 0; index -= 1) {
        const child = children[index];
        stack.push({
          node: child,
        });
      }
    }

    return results;
  }

  function selectTextEntries(entries) {
    const aliveEntries = entries.filter((entry) => entry && entry.node && !entry.node.removed);
    const aliveNodes = aliveEntries.map((entry) => entry.node);

    try {
      suppressBaseSelectionSync();
      figma.currentPage.selection = aliveNodes;
      scheduleBaseSelectionSyncRefresh();
      return {
        selected: aliveEntries,
        skipped: [],
      };
    } catch (error) {
      return selectTextEntriesIndividually(aliveEntries);
    }
  }

  function selectTextEntriesIndividually(entries) {
    const selected = [];
    const skipped = [];

    selectTextEntryGroup(entries, selected, skipped);

    try {
      suppressBaseSelectionSync();
      figma.currentPage.selection = selected.map((entry) => entry.node);
    } catch (error) {
      // If Figma rejects the final batch too, keep the last successful subset selected.
    }

    scheduleBaseSelectionSyncRefresh();
    return {
      selected,
      skipped,
    };
  }

  function selectTextEntryGroup(entries, selected, skipped) {
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
          reason: normalizeErrorMessage(error, "\uC774 \uD14D\uC2A4\uD2B8 \uB808\uC774\uC5B4\uB97C \uC120\uD0DD\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."),
        });
        return;
      }
    }

    const midpoint = Math.ceil(aliveEntries.length / 2);
    selectTextEntryGroup(aliveEntries.slice(0, midpoint), selected, skipped);
    selectTextEntryGroup(aliveEntries.slice(midpoint), selected, skipped);
  }

  function suppressBaseSelectionSync() {
    try {
      globalScope.__PIGMA_SELECT_ALL_TEXT_SKIP_SELECTION_SYNC_UNTIL__ =
        Date.now() + BASE_SELECTION_SYNC_SUPPRESS_MS;
    } catch (error) {
      // Selection should still proceed if a host blocks global flag writes.
    }
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
      } catch (error) {
        // The visible selection is already applied; this only refreshes Pigma's summary card.
      }
    }, BASE_SELECTION_SYNC_REFRESH_DELAY_MS);
  }

  function buildResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const candidates = Array.isArray(options.candidates) ? options.candidates : [];
    const selected = Array.isArray(options.selected) ? options.selected : [];
    const skipped = Array.isArray(options.skipped) ? options.skipped : [];

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: formatSelectionLabel(selection),
        rootCount: selection.length,
        candidateCount: candidates.length,
        selectedCount: selected.length,
        skippedCount: skipped.length,
      },
      selected: selected.map(stripEntry).slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.map(stripEntry).slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function notifyResult(result) {
    const summary = result && result.summary ? result.summary : {};
    const selectedCount = summary.selectedCount || 0;
    const skippedCount = summary.skippedCount || 0;

    if (selectedCount <= 0) {
      figma.notify("\uC120\uD0DD \uBC94\uC704\uC5D0\uC11C \uD14D\uC2A4\uD2B8 \uB808\uC774\uC5B4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.", { timeout: 1900 });
      return;
    }

    const baseMessage = "\uD14D\uC2A4\uD2B8 \uB808\uC774\uC5B4 " + selectedCount + "\uAC1C \uC120\uD0DD";
    const message = skippedCount > 0 ? baseMessage + ", " + skippedCount + "\uAC1C \uC81C\uC678" : baseMessage;
    figma.notify(message, { timeout: 2200 });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "select-all-text-status",
      status,
      message,
    });
  }

  function waitForSelectAllTextTurn() {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  async function yieldSelectAllTextTurn(index, interval) {
    const step = Math.max(1, Math.floor(Number(interval) || 1));
    if (index > 0 && index % step === 0) {
      await waitForSelectAllTextTurn();
    }
  }

  function getChildren(node) {
    try {
      return !!node && "children" in node && Array.isArray(node.children) ? node.children.filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  function stripEntry(entry) {
    return {
      nodeId: entry && entry.nodeId ? entry.nodeId : "",
      nodeName: entry && entry.nodeName ? entry.nodeName : "Unnamed",
      nodeType: entry && entry.nodeType ? entry.nodeType : "TEXT",
      path: entry && entry.path ? entry.path : "",
      reason: entry && entry.reason ? entry.reason : undefined,
    };
  }

  function formatSelectionLabel(selection) {
    if (!selection.length) {
      return "No selection";
    }

    if (selection.length === 1) {
      return safeName(selection[0]);
    }

    return safeName(selection[0]) + " +" + (selection.length - 1);
  }

  function safeNodeId(node) {
    return node && typeof node.id === "string" ? node.id : "";
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
