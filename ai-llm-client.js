;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_LLM_CLIENT_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_SETTINGS_KEY = "pigma:ai-settings:v1";
  const AI_LLM_RUN_LOG_KEY = "pigma:ai-llm-run-log:v1";
  const AI_LLM_RUN_LOG_LIMIT = 40;
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
    openai: "gpt-5.4",
    gemini: "gemini-2.5-flash",
  });
  const pendingUiRequests = new Map();

  globalScope.__PIGMA_AI_LLM__ = {
    getAiSettingsAsync,
    getAiRunLogAsync,
    getResolvedRunInfo,
    hasConfiguredAiAsync,
    requestJsonTask,
    normalizeErrorMessage,
    uniqueStrings,
  };

  if (typeof originalOnMessage === "function") {
    figma.ui.onmessage = async (message) => {
      if (isAiRunLogMessage(message)) {
        await postAiRunLog();
        return;
      }
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
    const runInfo = getResolvedRunInfo(settings, options);
    const provider = runInfo.provider;
    const model = runInfo.model;
    const requestMeta = buildRequestMeta(options, runInfo);
    const prompt = buildPrompt(options, requestMeta);
    const startedAt = Date.now();

    try {
      let result = null;
      result = await requestJsonTaskViaUiBridge({
        provider,
        model,
        apiKey: settings.apiKey,
        prompt,
        meta: requestMeta,
      });
      const durationMs = Math.max(0, Date.now() - startedAt);
      const quality = summarizeJsonResponseQuality(result, options && options.schema);

      if (result && typeof result === "object") {
        result._provider = provider;
        result._model = model;
        result._taskType = requestMeta.taskType;
        result._taskContext = requestMeta.taskContext;
        result._plannerVersion = requestMeta.plannerVersion;
        result._providerProfile = requestMeta.providerProfile;
        result._durationMs = durationMs;
        result._responseQualityScore = quality.score;
        result._responseQualityLabel = quality.label;
        result._responseQualityNotes = quality.notes.slice(0, 4);
      }

      await appendAiRunLogAsync({
        ok: true,
        provider: provider,
        model: model,
        taskType: requestMeta.taskType,
        taskContext: requestMeta.taskContext,
        plannerVersion: requestMeta.plannerVersion,
        providerProfile: requestMeta.providerProfile,
        durationMs: durationMs,
        qualityScore: quality.score,
        qualityLabel: quality.label,
        notes: quality.notes.slice(0, 4),
      });

      return result;
    } catch (error) {
      const durationMs = Math.max(0, Date.now() - startedAt);
      const failureType = classifyAiFailureType(error);
      const message = normalizeErrorMessage(error, "AI 응답을 받지 못했습니다.");
      await appendAiRunLogAsync({
        ok: false,
        provider: provider,
        model: model,
        taskType: requestMeta.taskType,
        taskContext: requestMeta.taskContext,
        plannerVersion: requestMeta.plannerVersion,
        providerProfile: requestMeta.providerProfile,
        durationMs: durationMs,
        failureType: failureType,
        message: message,
      });
      throw createAiClientError(error, message, requestMeta, runInfo, durationMs, failureType);
    }
  }

  async function getAiRunLogAsync() {
    try {
      const stored = await figma.clientStorage.getAsync(AI_LLM_RUN_LOG_KEY);
      return normalizeAiRunLog(stored);
    } catch (error) {
      return [];
    }
  }

  async function appendAiRunLogAsync(entry) {
    try {
      const current = await getAiRunLogAsync();
      current.unshift(normalizeAiRunLogEntry(entry));
      await figma.clientStorage.setAsync(AI_LLM_RUN_LOG_KEY, current.slice(0, AI_LLM_RUN_LOG_LIMIT));
    } catch (error) {}
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
      providerProfile: buildProviderProfile("", provider, model, "", ""),
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

  function buildPrompt(options, requestMeta) {
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

    if (requestMeta && typeof requestMeta === "object") {
      blocks.push("Task metadata:");
      blocks.push(
        JSON.stringify(
          {
            taskType: requestMeta.taskType,
            taskContext: requestMeta.taskContext,
            plannerVersion: requestMeta.plannerVersion,
            providerProfile: requestMeta.providerProfile,
          },
          null,
          2
        )
      );
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

  function isAiRunLogMessage(message) {
    return !!message && message.type === "request-ai-llm-run-log";
  }

  async function postAiRunLog() {
    figma.ui.postMessage({
      type: "ai-llm-run-log",
      logs: await getAiRunLogAsync(),
    });
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

  function buildRequestMeta(options, runInfo) {
    const taskType = normalizeTaskType(options && options.taskType);
    const taskContext = normalizeTaskContext(options && options.taskContext);
    const plannerVersion = normalizePlannerVersion(options && options.plannerVersion);
    const provider = runInfo && runInfo.provider === "gemini" ? "gemini" : "openai";
    const model = runInfo && typeof runInfo.model === "string" ? runInfo.model : DEFAULT_MODEL_BY_PROVIDER[provider];
    return {
      taskType: taskType,
      taskContext: taskContext,
      plannerVersion: plannerVersion,
      providerProfile: buildProviderProfile(options && options.providerProfile, provider, model, taskType, plannerVersion),
    };
  }

  function normalizeTaskType(value) {
    const normalized = String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9/_-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^[-/]+|[-/]+$/g, "")
      .trim();
    return normalized || "generic-json-task";
  }

  function normalizeTaskContext(value) {
    const normalized = String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9/_-]+/g, "-")
      .replace(/\/{2,}/g, "/")
      .replace(/-{2,}/g, "-")
      .replace(/^[-/]+|[-/]+$/g, "")
      .trim();
    return normalized;
  }

  function normalizePlannerVersion(value) {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    return normalized || "unspecified";
  }

  function buildProviderProfile(value, provider, model, taskType, plannerVersion) {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    if (normalized) {
      return normalized;
    }
    const safeProvider = provider === "gemini" ? "gemini" : "openai";
    const safeModel = String(model || DEFAULT_MODEL_BY_PROVIDER[safeProvider]).replace(/\s+/g, "-").trim();
    const safeTaskType = normalizeTaskType(taskType);
    const safePlannerVersion = normalizePlannerVersion(plannerVersion).replace(/\s+/g, "-");
    return `${safeProvider}/${safeModel}/${safeTaskType}/${safePlannerVersion}`;
  }

  function summarizeJsonResponseQuality(result, schema) {
    const required = schema && Array.isArray(schema.required) ? schema.required : [];
    if (!result || typeof result !== "object") {
      return {
        score: 0,
        label: "empty",
        notes: ["No JSON object returned"],
      };
    }
    if (required.length === 0) {
      return {
        score: 100,
        label: "high",
        notes: ["Schema does not define required fields"],
      };
    }

    let matched = 0;
    const missing = [];
    for (let index = 0; index < required.length; index += 1) {
      const key = required[index];
      if (Object.prototype.hasOwnProperty.call(result, key) && hasPresentJsonValue(result[key])) {
        matched += 1;
      } else {
        missing.push(String(key));
      }
    }

    const score = Math.max(0, Math.min(100, Math.round((matched / required.length) * 100)));
    const label = score >= 90 ? "high" : score >= 60 ? "medium" : score > 0 ? "low" : "empty";
    const notes = missing.length > 0 ? [`Missing required: ${missing.slice(0, 4).join(", ")}`] : ["Required fields complete"];
    return {
      score: score,
      label: label,
      notes: notes,
    };
  }

  function hasPresentJsonValue(value) {
    if (value === null || typeof value === "undefined") {
      return false;
    }
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === "object") {
      return Object.keys(value).length > 0;
    }
    return true;
  }

  function classifyAiFailureType(error) {
    const message = normalizeErrorMessage(error, "").toLowerCase();
    if (!message) {
      return "unknown";
    }
    if (message.indexOf("time") >= 0 || message.indexOf("timeout") >= 0 || message.indexOf("시간 내") >= 0) {
      return "timeout";
    }
    if (message.indexOf("api key") >= 0 || message.indexOf("missing an api key") >= 0) {
      return "configuration";
    }
    if (message.indexOf("401") >= 0 || message.indexOf("403") >= 0 || message.indexOf("unauthorized") >= 0) {
      return "auth";
    }
    if (message.indexOf("429") >= 0 || message.indexOf("rate") >= 0) {
      return "rate-limit";
    }
    if (message.indexOf("bridge") >= 0) {
      return "bridge";
    }
    if (message.indexOf("network") >= 0 || message.indexOf("fetch") >= 0) {
      return "network";
    }
    return "provider";
  }

  function createAiClientError(error, fallbackMessage, requestMeta, runInfo, durationMs, failureType) {
    const wrapped = new Error(normalizeErrorMessage(error, fallbackMessage));
    wrapped.pigmaAiFailureType = failureType || "unknown";
    wrapped.pigmaAiTaskType = requestMeta && requestMeta.taskType ? requestMeta.taskType : "generic-json-task";
    wrapped.pigmaAiTaskContext = requestMeta && requestMeta.taskContext ? requestMeta.taskContext : "";
    wrapped.pigmaAiPlannerVersion = requestMeta && requestMeta.plannerVersion ? requestMeta.plannerVersion : "unspecified";
    wrapped.pigmaAiProviderProfile = requestMeta && requestMeta.providerProfile ? requestMeta.providerProfile : "";
    wrapped.pigmaAiProvider = runInfo && runInfo.provider ? runInfo.provider : "openai";
    wrapped.pigmaAiModel = runInfo && runInfo.model ? runInfo.model : "";
    wrapped.pigmaAiDurationMs = Math.max(0, Math.round(Number(durationMs) || 0));
    return wrapped;
  }

  function normalizeAiRunLog(value) {
    const items = Array.isArray(value) ? value : [];
    const out = [];
    for (let index = 0; index < items.length && out.length < AI_LLM_RUN_LOG_LIMIT; index += 1) {
      const normalized = normalizeAiRunLogEntry(items[index]);
      if (normalized.createdAt) {
        out.push(normalized);
      }
    }
    return out;
  }

  function normalizeAiRunLogEntry(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      id: String(source.id || createRequestId()),
      createdAt: String(source.createdAt || new Date().toISOString()),
      ok: source.ok === true,
      provider: source.provider === "gemini" ? "gemini" : "openai",
      model: String(source.model || ""),
      taskType: normalizeTaskType(source.taskType),
      taskContext: normalizeTaskContext(source.taskContext),
      plannerVersion: normalizePlannerVersion(source.plannerVersion),
      providerProfile: String(source.providerProfile || "").trim(),
      durationMs: Math.max(0, Math.round(Number(source.durationMs) || 0)),
      qualityScore: Math.max(0, Math.min(100, Math.round(Number(source.qualityScore) || 0))),
      qualityLabel: String(source.qualityLabel || "").trim(),
      failureType: String(source.failureType || "").trim(),
      message: String(source.message || "").trim(),
      notes: Array.isArray(source.notes) ? uniqueStrings(source.notes, 4) : [],
    };
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
