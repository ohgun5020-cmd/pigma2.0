;(()=>{
  // PIGMA_AI_SETTINGS_STORAGE::SOURCE_OF_TRUTH
  // Keep AI settings persistence in plugin storage so the UI can survive
  // panel reloads and full Figma app restarts.
  const originalOnMessage = figma.ui.onmessage;
  const AI_SETTINGS_KEY = "pigma:ai-settings:v1";
  const DEFAULT_AI_SETTINGS = Object.freeze({
    enabled: false,
    provider: "openai",
    apiKey: "",
    openAiApiKey: "",
    geminiApiKey: "",
    openAiImageModel: "gpt-image-1.5",
    openAiImageModelPinned: false,
    geminiImageModel: "gemini-3.1-flash-image-preview",
    promptDraftTotalTimeoutSec: 45,
    promptDraftAttemptTimeoutSec: 22,
    proofingLocale: "",
    userDictionary: [],
    protectedTerms: []
  });

  let cachedAiSettings = DEFAULT_AI_SETTINGS;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async message => {
    if (isAiSettingsMessage(message)) {
      if (message.type === "request-ai-settings") {
        await postAiSettings();
        return;
      }

      await writeAiSettings(message.settings);
      await postAiSettings();
      return;
    }

    return originalOnMessage(message);
  };

  function isAiSettingsMessage(message) {
    return !!message && (message.type === "request-ai-settings" || message.type === "update-ai-settings");
  }

  async function postAiSettings() {
    figma.ui.postMessage({
      type: "ai-settings",
      settings: await readAiSettings()
    });
  }

  async function readAiSettings() {
    try {
      cachedAiSettings = normalizeAiSettings(await figma.clientStorage.getAsync(AI_SETTINGS_KEY));
    } catch (error) {
      cachedAiSettings = normalizeAiSettings(null);
    }

    return cachedAiSettings;
  }

  async function writeAiSettings(settings) {
    cachedAiSettings = normalizeAiSettings(settings);

    try {
      await figma.clientStorage.setAsync(AI_SETTINGS_KEY, cachedAiSettings);
    } catch (error) {}

    return cachedAiSettings;
  }

  function normalizeAiSettings(value) {
    const source = value && typeof value === "object" ? value : {};
    const legacyProvider = source.provider === "gemini" ? "gemini" : DEFAULT_AI_SETTINGS.provider;
    const legacyApiKey = typeof source.apiKey === "string" ? sanitizeApiKey(source.apiKey) : DEFAULT_AI_SETTINGS.apiKey;
    const openAiApiKey =
      typeof source.openAiApiKey === "string"
        ? sanitizeApiKey(source.openAiApiKey)
        : legacyProvider === "openai"
          ? legacyApiKey
          : DEFAULT_AI_SETTINGS.openAiApiKey;
    const geminiApiKey =
      typeof source.geminiApiKey === "string"
        ? sanitizeApiKey(source.geminiApiKey)
        : legacyProvider === "gemini"
          ? legacyApiKey
          : DEFAULT_AI_SETTINGS.geminiApiKey;
    const openAiImageModelPinned = source.openAiImageModelPinned === true;
    const rawOpenAiImageModel =
      typeof source.openAiImageModel === "string"
        ? normalizeModelId(source.openAiImageModel, DEFAULT_AI_SETTINGS.openAiImageModel)
        : DEFAULT_AI_SETTINGS.openAiImageModel;
    const openAiImageModel = rawOpenAiImageModel;
    const geminiImageModel =
      typeof source.geminiImageModel === "string"
        ? normalizeModelId(source.geminiImageModel, DEFAULT_AI_SETTINGS.geminiImageModel)
        : DEFAULT_AI_SETTINGS.geminiImageModel;
    const promptDraftTotalTimeoutSec = normalizePromptDraftTimeoutSec(
      source.promptDraftTotalTimeoutSec,
      DEFAULT_AI_SETTINGS.promptDraftTotalTimeoutSec,
      20,
      120
    );
    const promptDraftAttemptTimeoutSec = Math.min(
      normalizePromptDraftTimeoutSec(
        source.promptDraftAttemptTimeoutSec,
        DEFAULT_AI_SETTINGS.promptDraftAttemptTimeoutSec,
        8,
        60
      ),
      Math.max(8, promptDraftTotalTimeoutSec - 2)
    );
    const preferredProvider = legacyProvider === "gemini" ? "gemini" : "openai";
    const fallbackProvider = preferredProvider === "gemini" ? "openai" : "gemini";
    const provider =
      (preferredProvider === "gemini" ? geminiApiKey : openAiApiKey)
        ? preferredProvider
        : (fallbackProvider === "gemini" ? geminiApiKey : openAiApiKey)
          ? fallbackProvider
          : preferredProvider;
    const apiKey = provider === "gemini" ? geminiApiKey : openAiApiKey;

    return {
      enabled: source.enabled === true,
      provider,
      apiKey,
      openAiApiKey,
      geminiApiKey,
      openAiImageModel,
      openAiImageModelPinned,
      geminiImageModel,
      promptDraftTotalTimeoutSec,
      promptDraftAttemptTimeoutSec,
      proofingLocale: normalizeProofingLocale(source.proofingLocale),
      userDictionary: normalizeTermList(source.userDictionary),
      protectedTerms: normalizeTermList(source.protectedTerms)
    };
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

  function normalizePromptDraftTimeoutSec(value, fallback, min, max) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, Math.round(numeric)));
  }

  function normalizeModelId(value, fallback) {
    const next = String(value || "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim();
    return next || fallback;
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
})();
