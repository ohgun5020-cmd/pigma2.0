;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_FIGMA_URL_SHORTENER_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_SETTINGS_KEY = "pigma:ai-settings:v1";
  const DUB_LINKS_API_URL = "https://api.dub.co/links";
  const DUB_SHORTENER_PROXY_URL = "";
  const BUNDLED_DUB_API_KEY = "dub_r1y6JZGJtEAGD5vqJ17gIOqU";
  const shortUrlCache = {};
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isShortenRequestMessage(message)) {
      if (isRunning) {
        postStatus("running", "Shorten Link is already running.");
        return;
      }

      await runShortenFigmaUrl();
      return;
    }

    if (isShortenReportErrorMessage(message)) {
      reportUiShortenerError(message.message);
      return;
    }

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

  globalScope.__PIGMA_FIGMA_URL_SHORTENER_PATCH__ = true;

  function isShortenRequestMessage(message) {
    return !!message && message.type === "run-shorten-figma-url";
  }

  function isShortenReportErrorMessage(message) {
    return !!message && message.type === "shorten-figma-url-report-error";
  }

  function isCopyPrototypeLinkMessage(message) {
    return !!message && message.type === "run-copy-prototype-link";
  }

  function reportUiShortenerError(rawMessage) {
    const message = normalizeErrorMessage(rawMessage, "Failed to shorten the link.");
    figma.ui.postMessage({
      type: "shorten-figma-url-error",
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2600 });
  }

  async function runShortenFigmaUrl() {
    isRunning = true;
    postStatus("running", "Shortening the prototype link for the selected frame or section.");

    try {
      await ensureCurrentPageLoaded();
      const target = collectTargetNode();
      const longUrl = buildPrototypeLink(target);
      const shortUrl = await getShortUrl(longUrl);
      figma.ui.postMessage({
        type: "shorten-figma-url-result",
        result: {
          selectionId: target.node.id,
          shareNodeId: target.shareNode.id,
          selectionLabel: safeName(target.node),
          selectionType: safeNodeType(target.node),
          longUrl: longUrl,
          shortUrl: shortUrl,
        },
      });
      figma.notify("Short link is ready.", { timeout: 1800 });
    } catch (error) {
      const message = normalizeErrorMessage(error, "Failed to shorten the link.");
      figma.ui.postMessage({
        type: "shorten-figma-url-error",
        message: message,
      });
      figma.notify(message, { error: true, timeout: 2600 });
    } finally {
      isRunning = false;
    }
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

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "shorten-figma-url-status",
      status: status,
      message: message,
    });
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

  async function getShortUrl(longUrl) {
    const normalizedLongUrl = String(longUrl || "").trim();
    if (!normalizedLongUrl) {
      throw new Error("Could not build a link to shorten.");
    }

    const dubApiKey = (await readDubApiKey()) || sanitizeApiKey(BUNDLED_DUB_API_KEY);
    const cacheKey = (dubApiKey ? "dub:" : "public:") + normalizedLongUrl;
    if (shortUrlCache[cacheKey]) {
      return shortUrlCache[cacheKey];
    }

    let lastError = "";

    if (DUB_SHORTENER_PROXY_URL) {
      const proxyCacheKey = "proxy:" + normalizedLongUrl;
      if (shortUrlCache[proxyCacheKey]) {
        return shortUrlCache[proxyCacheKey];
      }

      try {
        const proxyShortUrl = await requestProxyShortUrl(normalizedLongUrl);
        shortUrlCache[proxyCacheKey] = proxyShortUrl;
        return proxyShortUrl;
      } catch (error) {
        lastError = normalizeErrorMessage(error, "Could not shorten the link with the shortener server.");
      }
    }

    if (dubApiKey) {
      try {
        const dubShortUrl = await requestDubShortUrl(normalizedLongUrl, dubApiKey);
        shortUrlCache[cacheKey] = dubShortUrl;
        return dubShortUrl;
      } catch (error) {
        lastError = normalizeErrorMessage(error, "Could not shorten the link with Dub.");
      }
    }

    try {
      const isGdShortUrl = await requestIsGdShortUrl(normalizedLongUrl);
      shortUrlCache[cacheKey] = isGdShortUrl;
      return isGdShortUrl;
    } catch (error) {
      const isGdError = normalizeErrorMessage(error, "Could not shorten the link with is.gd.");
      lastError = lastError ? lastError + " / " + isGdError : isGdError;
    }

    try {
      const tinyUrlShortUrl = await requestTinyUrlShortUrl(normalizedLongUrl);
      shortUrlCache[cacheKey] = tinyUrlShortUrl;
      return tinyUrlShortUrl;
    } catch (error) {
      const tinyUrlError = normalizeErrorMessage(error, "Could not shorten the link with TinyURL.");
      throw new Error(lastError ? lastError + " / " + tinyUrlError : tinyUrlError);
    }
  }

  async function readDubApiKey() {
    try {
      const settings = await figma.clientStorage.getAsync(AI_SETTINGS_KEY);
      if (!settings || typeof settings !== "object") {
        return "";
      }

      return sanitizeApiKey(settings.dubApiKey);
    } catch (error) {
      return "";
    }
  }

  async function requestDubShortUrl(longUrl, apiKey) {
    let response;
    let text = "";
    try {
      response = await fetch(DUB_LINKS_API_URL, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: longUrl,
        }),
      });
      text = String(await response.text()).trim();
    } catch (error) {
      throw new Error("Could not connect to Dub.");
    }

    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (error) {
        payload = null;
      }
    }

    if (!response.ok) {
      throw new Error(normalizeDubError(payload, text, response.status));
    }

    const shortLink =
      payload && typeof payload.shortLink === "string" && payload.shortLink.trim()
        ? payload.shortLink.trim()
        : payload && typeof payload.shortUrl === "string" && payload.shortUrl.trim()
          ? payload.shortUrl.trim()
          : "";

    if (!shortLink) {
      throw new Error("Dub did not return a short link.");
    }

    if (!/^https?:\/\//i.test(shortLink)) {
      throw new Error("Could not read the Dub response format.");
    }

    return shortLink;
  }

  async function requestProxyShortUrl(longUrl) {
    let response;
    let text = "";
    try {
      response = await fetch(DUB_SHORTENER_PROXY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: longUrl,
        }),
      });
      text = String(await response.text()).trim();
    } catch (error) {
      throw new Error("Could not connect to the shortener server.");
    }

    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (error) {
        payload = null;
      }
    }

    if (!response.ok) {
      throw new Error(normalizeProxyError(payload, text, response.status));
    }

    const shortUrl =
      payload && typeof payload.shortUrl === "string" && payload.shortUrl.trim()
        ? payload.shortUrl.trim()
        : payload && typeof payload.shortLink === "string" && payload.shortLink.trim()
          ? payload.shortLink.trim()
          : "";

    if (!shortUrl) {
      throw new Error("The shortener server did not return a short link.");
    }

    if (!/^https?:\/\//i.test(shortUrl)) {
      throw new Error("Could not read the shortener server response format.");
    }

    return shortUrl;
  }

  function normalizeDubError(payload, text, statusCode) {
    const data = payload && typeof payload === "object" ? payload : {};
    const message =
      typeof data.message === "string" && data.message.trim()
        ? data.message.trim()
        : typeof data.error === "string" && data.error.trim()
          ? data.error.trim()
          : String(text || "").replace(/\s+/g, " ").trim();

    if (message) {
      return message;
    }

    if (statusCode === 401 || statusCode === 403) {
      return "Check the Dub API key permissions.";
    }

    if (statusCode === 429) {
      return "Dub usage or request limit was exceeded.";
    }

    return "Could not shorten the link with Dub.";
  }

  function normalizeProxyError(payload, text, statusCode) {
    const data = payload && typeof payload === "object" ? payload : {};
    const message =
      typeof data.message === "string" && data.message.trim()
        ? data.message.trim()
        : typeof data.error === "string" && data.error.trim()
          ? data.error.trim()
          : String(text || "").replace(/\s+/g, " ").trim();

    if (message) {
      return message;
    }

    if (statusCode === 429) {
      return "The shortener server usage or request limit was exceeded.";
    }

    return "Could not shorten the link with the shortener server.";
  }

  function sanitizeApiKey(value) {
    return String(value || "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, "")
      .replace(/^['"`]+|['"`]+$/g, "")
      .replace(/[^\x21-\x7E]/g, "")
      .trim();
  }

  async function requestIsGdShortUrl(longUrl) {
    let response;
    try {
      response = await fetch("https://is.gd/create.php?format=simple&url=" + encodeURIComponent(longUrl), {
        method: "GET",
      });
    } catch (error) {
      throw new Error("Could not connect to is.gd.");
    }

    const text = String(await response.text()).trim();
    if (!response.ok) {
      throw new Error(normalizeShortenerError("is.gd", text, response.status));
    }

    if (!text) {
      throw new Error("is.gd did not return a short link.");
    }

    if (/^Error:\s*/i.test(text)) {
      throw new Error(text.replace(/^Error:\s*/i, "").trim() || "is.gd could not process the short link request.");
    }

    if (!/^https?:\/\//i.test(text)) {
      throw new Error("Could not read the is.gd response format.");
    }

    return text;
  }

  async function requestTinyUrlShortUrl(longUrl) {
    let response;
    try {
      response = await fetch("https://tinyurl.com/api-create.php?url=" + encodeURIComponent(longUrl), {
        method: "GET",
      });
    } catch (error) {
      throw new Error("Could not connect to TinyURL.");
    }

    const text = String(await response.text()).trim();
    if (!response.ok) {
      throw new Error(normalizeShortenerError("TinyURL", text, response.status));
    }

    if (!text) {
      throw new Error("TinyURL did not return a short link.");
    }

    if (/^Error:\s*/i.test(text)) {
      throw new Error(text.replace(/^Error:\s*/i, "").trim() || "TinyURL could not process the short link request.");
    }

    if (!/^https?:\/\//i.test(text)) {
      throw new Error("Could not read the TinyURL response format.");
    }

    return text;
  }

  function normalizeShortenerError(providerLabel, text, statusCode) {
    const normalized = String(text || "").replace(/^Error:\s*/i, "").replace(/\s+/g, " ").trim();
    if (normalized) {
      return normalized;
    }

    if (statusCode === 502) {
      return providerLabel + " request limit was exceeded. Try again later.";
    }

    if (statusCode === 503) {
      return providerLabel + " service is unavailable right now. Try again later.";
    }

    return providerLabel + " could not shorten the link.";
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
