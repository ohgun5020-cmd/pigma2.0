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
        postStatus("running", "주소 줄이기를 이미 진행 중입니다.");
        return;
      }

      await runShortenFigmaUrl();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_FIGMA_URL_SHORTENER_PATCH__ = true;

  function isShortenRequestMessage(message) {
    return !!message && message.type === "run-shorten-figma-url";
  }

  async function runShortenFigmaUrl() {
    isRunning = true;
    postStatus("running", "선택한 프레임 또는 섹션의 프로토타입 주소를 줄이는 중입니다.");

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
      figma.notify("단축 주소를 준비했습니다.", { timeout: 1800 });
    } catch (error) {
      const message = normalizeErrorMessage(error, "주소 줄이기에 실패했습니다.");
      figma.ui.postMessage({
        type: "shorten-figma-url-error",
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

  function collectTargetNode() {
    const selection = Array.from(figma.currentPage.selection || []).filter(Boolean);
    if (!selection.length) {
      throw new Error("프레임 또는 섹션 1개를 먼저 선택해 주세요.");
    }

    if (selection.length !== 1) {
      throw new Error("프레임 또는 섹션은 1개만 선택할 수 있습니다.");
    }

    const node = selection[0];
    if (!node || node.removed) {
      throw new Error("선택한 대상을 다시 찾지 못했습니다. 다시 선택해 주세요.");
    }

    if (node.type !== "FRAME" && node.type !== "SECTION") {
      throw new Error("프레임 또는 섹션 1개를 선택한 경우에만 주소 줄이기를 사용할 수 있습니다.");
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
      throw new Error("단축할 주소를 만들지 못했습니다.");
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
        lastError = normalizeErrorMessage(error, "주소 단축 서버로 주소를 줄이지 못했습니다.");
      }
    }

    if (dubApiKey) {
      try {
        const dubShortUrl = await requestDubShortUrl(normalizedLongUrl, dubApiKey);
        shortUrlCache[cacheKey] = dubShortUrl;
        return dubShortUrl;
      } catch (error) {
        lastError = normalizeErrorMessage(error, "Dub로 주소를 줄이지 못했습니다.");
      }
    }

    try {
      const isGdShortUrl = await requestIsGdShortUrl(normalizedLongUrl);
      shortUrlCache[cacheKey] = isGdShortUrl;
      return isGdShortUrl;
    } catch (error) {
      const isGdError = normalizeErrorMessage(error, "is.gd로 주소를 줄이지 못했습니다.");
      lastError = lastError ? lastError + " / " + isGdError : isGdError;
    }

    try {
      const tinyUrlShortUrl = await requestTinyUrlShortUrl(normalizedLongUrl);
      shortUrlCache[cacheKey] = tinyUrlShortUrl;
      return tinyUrlShortUrl;
    } catch (error) {
      const tinyUrlError = normalizeErrorMessage(error, "TinyURL로 주소를 줄이지 못했습니다.");
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
      throw new Error("Dub에 연결하지 못했습니다.");
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
      throw new Error("Dub에서 단축 주소를 받지 못했습니다.");
    }

    if (!/^https?:\/\//i.test(shortLink)) {
      throw new Error("Dub 응답 형식을 확인하지 못했습니다.");
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
      throw new Error("주소 단축 서버에 연결하지 못했습니다.");
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
      throw new Error("주소 단축 서버에서 단축 주소를 받지 못했습니다.");
    }

    if (!/^https?:\/\//i.test(shortUrl)) {
      throw new Error("주소 단축 서버 응답 형식을 확인하지 못했습니다.");
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
      return "Dub API 키 권한을 확인해 주세요.";
    }

    if (statusCode === 429) {
      return "Dub 사용량 또는 요청 제한을 초과했습니다.";
    }

    return "Dub로 주소를 줄이지 못했습니다.";
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
      return "주소 단축 서버 사용량 또는 요청 제한을 초과했습니다.";
    }

    return "주소 단축 서버로 주소를 줄이지 못했습니다.";
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
      throw new Error("is.gd에 연결하지 못했습니다.");
    }

    const text = String(await response.text()).trim();
    if (!response.ok) {
      throw new Error(normalizeShortenerError("is.gd", text, response.status));
    }

    if (!text) {
      throw new Error("is.gd에서 단축 주소를 받지 못했습니다.");
    }

    if (/^Error:\s*/i.test(text)) {
      throw new Error(text.replace(/^Error:\s*/i, "").trim() || "is.gd가 주소 단축 요청을 처리하지 못했습니다.");
    }

    if (!/^https?:\/\//i.test(text)) {
      throw new Error("is.gd 응답 형식을 확인하지 못했습니다.");
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
      throw new Error("TinyURL에 연결하지 못했습니다.");
    }

    const text = String(await response.text()).trim();
    if (!response.ok) {
      throw new Error(normalizeShortenerError("TinyURL", text, response.status));
    }

    if (!text) {
      throw new Error("TinyURL에서 단축 주소를 받지 못했습니다.");
    }

    if (/^Error:\s*/i.test(text)) {
      throw new Error(text.replace(/^Error:\s*/i, "").trim() || "TinyURL이 주소 단축 요청을 처리하지 못했습니다.");
    }

    if (!/^https?:\/\//i.test(text)) {
      throw new Error("TinyURL 응답 형식을 확인하지 못했습니다.");
    }

    return text;
  }

  function normalizeShortenerError(providerLabel, text, statusCode) {
    const normalized = String(text || "").replace(/^Error:\s*/i, "").replace(/\s+/g, " ").trim();
    if (normalized) {
      return normalized;
    }

    if (statusCode === 502) {
      return providerLabel + " 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.";
    }

    if (statusCode === 503) {
      return providerLabel + " 서비스를 지금 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
    }

    return providerLabel + "로 주소를 줄이지 못했습니다.";
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

    throw new Error("이 파일에서는 공유 주소를 만들 수 없습니다. 파일을 저장한 뒤 다시 시도해 주세요.");
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
      throw new Error("선택한 대상의 node id를 읽지 못했습니다.");
    }

    return encodeURIComponent(raw).replace(/%3A/gi, "-");
  }

  function normalizePageIdForUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) {
      throw new Error("선택한 페이지 id를 읽지 못했습니다.");
    }

    return encodeURIComponent(raw);
  }

  function resolvePrototypeShareNode(node) {
    if (isPrototypePresentableNode(node)) {
      return node;
    }

    if (!node || node.type !== "SECTION") {
      throw new Error("프로토타입 공유용 프레임을 찾지 못했습니다.");
    }

    const candidates = collectSectionPrototypeCandidates(node);
    if (!candidates.length) {
      throw new Error("선택한 섹션 안에서 프로토타입으로 공유할 프레임을 찾지 못했습니다.");
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

    throw new Error("선택한 대상의 페이지를 찾지 못했습니다.");
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
