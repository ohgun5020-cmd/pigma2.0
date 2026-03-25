;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_LLM_CLIENT_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_SETTINGS_KEY = "pigma:ai-settings:v1";
  const AI_LLM_REQUEST_TIMEOUT_MS = 45000;
  const DEFAULT_AI_SETTINGS = Object.freeze({
    enabled: false,
    provider: "openai",
    apiKey: "",
    proofingLocale: "",
    userDictionary: [],
    protectedTerms: [],
  });
  const DEFAULT_MODEL_BY_PROVIDER = Object.freeze({
    openai: "gpt-4o-mini",
    gemini: "gemini-2.5-flash",
  });
  const pendingUiRequests = new Map();

  globalScope.__PIGMA_AI_LLM__ = {
    getAiSettingsAsync,
    getResolvedRunInfo,
    hasConfiguredAiAsync,
    requestJsonTask,
    normalizeErrorMessage,
    uniqueStrings,
  };

  if (typeof originalOnMessage === "function") {
    figma.ui.onmessage = async (message) => {
      if (isAiUiBridgeResponse(message)) {
        resolveUiBridgeResponse(message);
        return;
      }

      return originalOnMessage(message);
    };
  }

  globalScope.__PIGMA_AI_LLM_CLIENT_PATCH__ = true;

  async function getAiSettingsAsync() {
    try {
      return normalizeAiSettings(await figma.clientStorage.getAsync(AI_SETTINGS_KEY));
    } catch (error) {
      return normalizeAiSettings(null);
    }
  }

  async function hasConfiguredAiAsync() {
    const settings = await getAiSettingsAsync();
    return settings.enabled === true && settings.apiKey.length > 0;
  }

  async function requestJsonTask(options) {
    const settings = await getAiSettingsAsync();
    if (settings.enabled !== true || !settings.apiKey) {
      return null;
    }

    const prompt = buildPrompt(options);
    const runInfo = getResolvedRunInfo(settings, options);
    const provider = runInfo.provider;
    const model = runInfo.model;

    try {
      let result = null;
      result = await requestJsonTaskViaUiBridge({
        provider,
        model,
        apiKey: settings.apiKey,
        prompt,
      });

      if (result && typeof result === "object") {
        result._provider = provider;
        result._model = model;
      }

      return result;
    } catch (error) {
      throw new Error(normalizeErrorMessage(error, "AI 응답을 받지 못했습니다."));
    }
  }

  function getResolvedRunInfo(settingsOrOptions, maybeOptions) {
    const hasSettingsShape =
      settingsOrOptions &&
      typeof settingsOrOptions === "object" &&
      (Object.prototype.hasOwnProperty.call(settingsOrOptions, "provider") ||
        Object.prototype.hasOwnProperty.call(settingsOrOptions, "apiKey") ||
        Object.prototype.hasOwnProperty.call(settingsOrOptions, "enabled"));
    const settings = hasSettingsShape ? settingsOrOptions : normalizeAiSettings(null);
    const options = hasSettingsShape ? maybeOptions : settingsOrOptions;
    const provider = settings && settings.provider === "gemini" ? "gemini" : "openai";
    const model =
      options && typeof options.modelByProvider === "object" && options.modelByProvider && options.modelByProvider[provider]
        ? options.modelByProvider[provider]
        : DEFAULT_MODEL_BY_PROVIDER[provider];

    return {
      provider,
      model,
    };
  }

  function normalizeAiSettings(value) {
    const source = value && typeof value === "object" ? value : {};

    return {
      enabled: source.enabled === true,
      provider: source.provider === "gemini" ? "gemini" : DEFAULT_AI_SETTINGS.provider,
      apiKey: typeof source.apiKey === "string" ? sanitizeApiKey(source.apiKey) : DEFAULT_AI_SETTINGS.apiKey,
      proofingLocale: normalizeProofingLocale(source.proofingLocale),
      userDictionary: normalizeTermList(source.userDictionary),
      protectedTerms: normalizeTermList(source.protectedTerms),
    };
  }

  function buildPrompt(options) {
    const instructions = options && typeof options.instructions === "string" ? options.instructions.trim() : "";
    const payload = options && options.payload ? options.payload : {};
    const schema = options && options.schema ? options.schema : null;
    const blocks = [
      "Return exactly one JSON object.",
      "Do not wrap the JSON in markdown fences.",
      "Do not add any explanation outside the JSON.",
    ];

    if (instructions) {
      blocks.push(instructions);
    }

    if (schema) {
      blocks.push("Target JSON shape:");
      blocks.push(JSON.stringify(schema, null, 2));
    }

    blocks.push("Input payload:");
    blocks.push(JSON.stringify(payload, null, 2));
    return blocks.join("\n\n");
  }

  function isAiUiBridgeResponse(message) {
    return !!message && message.type === "ai-llm-ui-response" && typeof message.requestId === "string";
  }

  function resolveUiBridgeResponse(message) {
    const pending = pendingUiRequests.get(message.requestId);
    if (!pending) {
      return;
    }

    pendingUiRequests.delete(message.requestId);
    clearTimeout(pending.timeoutId);

    if (message.ok === true) {
      pending.resolve(message.result);
      return;
    }

    pending.reject(new Error(typeof message.error === "string" && message.error ? message.error : "AI UI bridge 요청에 실패했습니다."));
  }

  async function requestJsonTaskViaUiBridge(payload) {
    if (!figma.ui || typeof figma.ui.postMessage !== "function") {
      throw new Error("Figma UI bridge를 사용할 수 없습니다.");
    }

    const requestId = createRequestId();
    return await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        pendingUiRequests.delete(requestId);
        reject(new Error("AI UI bridge 응답이 시간 내에 오지 않았습니다."));
      }, AI_LLM_REQUEST_TIMEOUT_MS);

      pendingUiRequests.set(requestId, {
        resolve,
        reject,
        timeoutId,
      });

      figma.ui.postMessage({
        type: "ai-llm-ui-request",
        requestId,
        payload,
      });
    });
  }

  function createRequestId() {
    return "ai-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function sanitizeApiKey(value) {
    return normalizeApiKeyCharacters(value);
  }

  function normalizeProofingLocale(value) {
    const compact = String(value || "")
      .replace(/[^A-Za-z-]/g, "")
      .trim();
    if (!compact) {
      return "";
    }

    const parts = compact.split("-").filter(Boolean);
    if (parts.length === 1 && /^[A-Za-z]{2,3}$/.test(parts[0])) {
      return parts[0].toLowerCase();
    }

    if (parts.length === 2 && /^[A-Za-z]{2,3}$/.test(parts[0]) && /^[A-Za-z]{2,4}$/.test(parts[1])) {
      return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
    }

    return "";
  }

  function normalizeTermList(value) {
    const terms = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(/\r?\n|,/)
        : [];
    const normalized = [];
    const seen = new Set();

    for (const term of terms) {
      const next = String(term || "").replace(/\s+/g, " ").trim();
      if (!next) {
        continue;
      }

      const key = next.toLocaleLowerCase();
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      normalized.push(next);
    }

    return normalized.slice(0, 200);
  }

  function sanitizeHeaderValue(value) {
    return String(value || "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim();
  }

  function normalizeApiKeyCharacters(value) {
    return String(value || "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, "")
      .replace(/^['"`]+|['"`]+$/g, "")
      .replace(/[^\x21-\x7E]/g, "")
      .trim();
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

  function uniqueStrings(values, limit) {
    const result = [];
    const seen = new Set();
    const max = typeof limit === "number" && limit > 0 ? limit : Number.POSITIVE_INFINITY;
    const items = Array.isArray(values) ? values : [];

    for (const value of items) {
      const normalized = String(value || "").replace(/\s+/g, " ").trim();
      if (!normalized || seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      result.push(normalized);
      if (result.length >= max) {
        break;
      }
    }

    return result;
  }
})();
