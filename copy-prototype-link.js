;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_COPY_PROTOTYPE_LINK_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isCopyPrototypeLinkMessage(message)) {
      if (isRunning) {
        postPrototypeStatus("running", "Preparing the prototype link.");
        return;
      }

      await runCopyPrototypeLink();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_COPY_PROTOTYPE_LINK_PATCH__ = true;

  function isCopyPrototypeLinkMessage(message) {
    return !!message && message.type === "run-copy-prototype-link";
  }

  async function runCopyPrototypeLink() {
    isRunning = true;
    postPrototypeStatus("running", "Preparing the prototype link.");

    try {
      await ensureCurrentPageLoaded();
      const target = collectTargetNode();
      const prototypeUrl = buildPrototypeLink(target);
      figma.ui.postMessage({
        type: "copy-prototype-link-result",
        result: {
          selectionId: target.node.id,
          shareNodeId: target.shareNode.id,
          selectionLabel: safeName(target.node),
          selectionType: safeNodeType(target.node),
          prototypeUrl: prototypeUrl,
          longUrl: prototypeUrl,
        },
      });
      figma.notify("Prototype link is ready.", { timeout: 1800 });
    } catch (error) {
      const message = normalizeErrorMessage(error, "Failed to get the prototype link.");
      figma.ui.postMessage({
        type: "copy-prototype-link-error",
        message: message,
      });
      figma.notify(message, { error: true, timeout: 2600 });
    } finally {
      isRunning = false;
    }
  }

  function postPrototypeStatus(status, message) {
    figma.ui.postMessage({
      type: "copy-prototype-link-status",
      status: status,
      message: message,
    });
  }

  function collectTargetNode() {
    const selection = Array.from(figma.currentPage.selection || []).filter(Boolean);
    if (!selection.length) {
      throw new Error("Select one frame or section first.");
    }

    if (selection.length !== 1) {
      throw new Error("Select only one frame or section.");
    }

    const node = selection[0];
    if (!node || node.removed) {
      throw new Error("Could not find the selected item again. Select it again and retry.");
    }

    if (node.type !== "FRAME" && node.type !== "SECTION") {
      throw new Error("This only works when one frame or section is selected.");
    }

    const shareNode = resolvePrototypeShareNode(node);
    const page = getPageNode(shareNode);

    return {
      node: node,
      shareNode: shareNode,
      page: page,
    };
  }

  async function ensureCurrentPageLoaded() {
    if (figma.currentPage && typeof figma.currentPage.loadAsync === "function") {
      await figma.currentPage.loadAsync();
    }
  }

  function buildPrototypeLink(target) {
    const fileKey = getFileKey();
    const fileNameSegment = buildFileNameSegment();
    const shareNode = target && target.shareNode ? target.shareNode : null;
    const page = target && target.page ? target.page : getPageNode(shareNode);
    const nodeId = normalizeNodeIdForUrl(shareNode && shareNode.id);
    const pageId = normalizePageIdForUrl(page && page.id);
    return (
      "https://www.figma.com/proto/" +
      encodeURIComponent(fileKey) +
      "/" +
      fileNameSegment +
      "?node-id=" +
      nodeId +
      "&page-id=" +
      pageId +
      "&scaling=min-zoom&content-scaling=fixed"
    );
  }

  function getFileKey() {
    const fileKey = typeof figma.fileKey === "string" ? figma.fileKey.trim() : "";
    if (fileKey) {
      return fileKey;
    }

    throw new Error("This file cannot create a share link yet. Save the file, then try again.");
  }

  function buildFileNameSegment() {
    const rootName =
      figma.root && typeof figma.root.name === "string" && figma.root.name.trim()
        ? figma.root.name.trim()
        : "shared-frame";
    return encodeURIComponent(rootName).replace(/%20/g, "-");
  }

  function normalizeNodeIdForUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) {
      throw new Error("Could not read the selected item's node id.");
    }

    return encodeURIComponent(raw).replace(/%3A/gi, "-");
  }

  function normalizePageIdForUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) {
      throw new Error("Could not read the selected page id.");
    }

    return encodeURIComponent(raw);
  }

  function resolvePrototypeShareNode(node) {
    if (isPrototypePresentableNode(node)) {
      return node;
    }

    if (!node || node.type !== "SECTION") {
      throw new Error("Could not find a frame to share as a prototype.");
    }

    const candidates = collectSectionPrototypeCandidates(node);
    if (!candidates.length) {
      throw new Error("Could not find a prototype-ready frame inside the selected section.");
    }

    const candidateById = new Map();
    for (const candidate of candidates) {
      candidateById.set(candidate.id, candidate);
    }

    const page = getPageNode(node);
    if (page) {
      const flowStartingPoints = Array.isArray(page.flowStartingPoints) ? page.flowStartingPoints : [];
      for (const flow of flowStartingPoints) {
        const flowNodeId = flow && typeof flow.nodeId === "string" ? flow.nodeId : "";
        if (flowNodeId && candidateById.has(flowNodeId)) {
          return candidateById.get(flowNodeId);
        }
      }

      if (
        page.prototypeStartNode &&
        !page.prototypeStartNode.removed &&
        candidateById.has(page.prototypeStartNode.id)
      ) {
        return candidateById.get(page.prototypeStartNode.id);
      }
    }

    const reactionCandidate = candidates.find((candidate) => hasReactions(candidate));
    if (reactionCandidate) {
      return reactionCandidate;
    }

    return candidates[0];
  }

  function collectSectionPrototypeCandidates(section) {
    const visibleMatches = [];
    const hiddenMatches = [];
    const stack = Array.isArray(section && section.children) ? Array.from(section.children) : [];

    while (stack.length) {
      const current = stack.shift();
      if (!current || current.removed) {
        continue;
      }

      if (isPrototypePresentableNode(current)) {
        if (current.visible === false) {
          hiddenMatches.push(current);
        } else {
          visibleMatches.push(current);
        }
      }

      if (Array.isArray(current.children) && current.children.length) {
        for (const child of current.children) {
          stack.push(child);
        }
      }
    }

    return visibleMatches.length ? visibleMatches : hiddenMatches;
  }

  function isPrototypePresentableNode(node) {
    if (!node || node.removed || typeof node.type !== "string") {
      return false;
    }

    return node.type === "FRAME" || node.type === "GROUP" || node.type === "COMPONENT" || node.type === "INSTANCE";
  }

  function hasReactions(node) {
    return !!node && Array.isArray(node.reactions) && node.reactions.length > 0;
  }

  function getPageNode(node) {
    let current = node || null;
    while (current) {
      if (current.type === "PAGE") {
        return current;
      }
      current = current.parent || null;
    }

    throw new Error("Could not find the selected item's page.");
  }

  function safeName(node) {
    if (node && typeof node.name === "string" && node.name.trim()) {
      return node.name.trim();
    }

    return safeNodeType(node);
  }

  function safeNodeType(node) {
    return node && typeof node.type === "string" && node.type ? node.type : "NODE";
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
