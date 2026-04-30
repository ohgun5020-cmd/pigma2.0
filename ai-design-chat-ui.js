(() => {
  if (window.__PIGMA_AI_DESIGN_CHAT_UI__) {
    return;
  }

  const shared = window.__PIGMA_AI_IMAGE_UPSCALE_SHARED__ || null;

  const STORAGE_KEY = "pigma:ai-design-chat:threads:v1";
  const MODEL_STORAGE_KEY = "pigma:ai-design-chat:model:v1";
  const AUTO_MODEL_KEY = "auto";
  const DEFAULT_OPENAI_MODEL = "gpt-5.4-mini";
  const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";
  const OPENAI_MODEL_PRESETS = [DEFAULT_OPENAI_MODEL, "gpt-5.2-pro"];
  const GEMINI_MODEL_PRESETS = [DEFAULT_GEMINI_MODEL, "gemini-2.5-pro"];
  const MAX_THREAD_COUNT = 18;
  const MAX_MESSAGES_PER_THREAD = 18;
  const MAX_HISTORY_MESSAGES = 6;
  const MAX_FOLLOWUPS = 2;
  const MAX_CHECKLIST_ITEMS = 5;
  const MAX_RECOMMENDED_QUESTIONS = 3;
  const AUTO_PRO_KEYWORDS = [
    "비교",
    "전략",
    "문제",
    "문제점",
    "개선",
    "구조",
    "우선순위",
    "흐름",
    "리뷰",
    "critique",
    "compare",
    "strategy",
    "audit",
    "system",
  ];
  const PROMPT_DRAFT_ACTION_KEYWORDS = [
    "프롬프트",
    "prompt",
    "이미지 생성",
    "생성 프롬프트",
    "이미지 프롬프트",
    "visual prompt",
    "비주얼 프롬프트",
    "midjourney",
    "미드저니",
    "stable diffusion",
    "dall-e",
    "달리",
  ];

  const ANNOTATION_ACTION_KEYWORDS = [
    "주석 달아줘",
    "주석 달아",
    "주석 남겨줘",
    "주석 남겨",
    "주석 추가해줘",
    "주석 추가",
    "주석 부탁",
    "피그마 주석",
    "코멘트 달아줘",
    "코멘트 달아",
    "코멘트 남겨줘",
    "코멘트 남겨",
    "코멘트 추가",
    "코멘트 부탁",
    "메모 남겨줘",
    "메모 남겨",
    "annotation",
    "annotate",
    "add comment",
    "leave comment",
  ];

  const elements = {
    group: document.getElementById("aiDesignChatGroup"),
    selectionPanel: document.getElementById("aiDesignChatSelectionPanel"),
    title: document.getElementById("aiDesignChatSelectionTitle"),
    selectionMeta: document.getElementById("aiDesignChatSelectionMeta"),
    statusPill: document.getElementById("aiDesignChatStatusPill"),
    statusText: document.getElementById("aiDesignChatStatusText"),
    selectionCountValue: document.getElementById("aiDesignChatSelectionCountValue"),
    captureModeValue: document.getElementById("aiDesignChatCaptureModeValue"),
    storageValue: document.getElementById("aiDesignChatStorageValue"),
    refreshButton: document.getElementById("aiDesignChatRefreshButton"),
    clearButton: document.getElementById("aiDesignChatClearButton"),
    restartButton: document.getElementById("aiDesignChatRestartButton"),
    modelSelect: document.getElementById("aiDesignChatModelSelect"),
    suggestionBlock: document.getElementById("aiDesignChatSuggestionBlock"),
    suggestionList: document.getElementById("aiDesignChatSuggestionList"),
    previewPanel: document.getElementById("aiDesignChatPreviewPanel"),
    quickPanel: document.getElementById("aiDesignChatQuickPanel"),
    previewMeta: document.getElementById("aiDesignChatPreviewMeta"),
    previewImage: document.getElementById("aiDesignChatPreviewImage"),
    previewEmpty: document.getElementById("aiDesignChatPreviewEmpty"),
    threadMeta: document.getElementById("aiDesignChatThreadMeta"),
    thread: document.getElementById("aiDesignChatThread"),
    input: document.getElementById("aiDesignChatInput"),
    sendButton: document.getElementById("aiDesignChatSendButton"),
    quickButtons: Array.from(document.querySelectorAll(".ai-design-chat-chip")),
  };

  const aiTab = document.getElementById("tabAi");

  function hasElement(value) {
    return !!value && typeof value === "object" && value.nodeType === 1;
  }

  function hasButton(value) {
    return hasElement(value) && typeof value.addEventListener === "function" && typeof value.disabled === "boolean";
  }

  function hasImage(value) {
    return hasElement(value) && typeof value.removeAttribute === "function";
  }

  function hasInput(value) {
    return hasElement(value) && typeof value.value === "string" && typeof value.focus === "function";
  }

  if (
    !hasElement(elements.group) ||
    !hasElement(elements.selectionPanel) ||
    !hasElement(elements.title) ||
    !hasElement(elements.selectionMeta) ||
    !hasElement(elements.statusPill) ||
    !hasElement(elements.statusText) ||
    !hasElement(elements.selectionCountValue) ||
    !hasElement(elements.captureModeValue) ||
    !hasElement(elements.storageValue) ||
    !hasButton(elements.refreshButton) ||
    !hasButton(elements.clearButton) ||
    !hasElement(elements.previewPanel) ||
    !hasElement(elements.quickPanel) ||
    !hasElement(elements.suggestionBlock) ||
    !hasElement(elements.suggestionList) ||
    !hasElement(elements.previewMeta) ||
    !hasImage(elements.previewImage) ||
    !hasElement(elements.previewEmpty) ||
    !hasElement(elements.threadMeta) ||
    !hasElement(elements.thread) ||
    !hasInput(elements.input) ||
    !hasButton(elements.sendButton)
  ) {
    window.__PIGMA_AI_DESIGN_CHAT_UI_BOOT__ = "missing-elements";
    console.error("[ai-design-chat-ui] required elements are missing or not ready");
    return;
  }

  window.__PIGMA_AI_DESIGN_CHAT_UI_BOOT__ = "started";

  let previewObjectUrl = "";
  const pendingAnnotationRequests = new Map();
  const state = {
    selection: buildEmptySelection(),
    threads: readThreadStore(),
    liveMessage: null,
    source: null,
    sourcePromise: null,
    pendingSource: null,
    activeRun: null,
    threadNotice: null,
    autoCaptureTimer: 0,
    selectionPollTimer: 0,
    debugModeEnabled: readDebugMode(),
    selectedModelKey: readSelectedModelKey(),
    statusTone: "idle",
    statusText: "현재 선택 상태를 확인하는 중입니다.",
  };

  function normalizeModelId(value, fallback) {
    const model = typeof value === "string" ? value.trim() : "";
    return model || fallback;
  }

  function isAutoModelKey(value) {
    return String(value || "")
      .trim()
      .toLowerCase() === AUTO_MODEL_KEY;
  }

  function parseModelKey(value) {
    const raw = typeof value === "string" ? value.trim() : "";
    if (!raw) {
      return null;
    }
    const separatorIndex = raw.indexOf(":");
    if (separatorIndex <= 0) {
      return null;
    }
    const provider = raw.slice(0, separatorIndex) === "gemini" ? "gemini" : raw.slice(0, separatorIndex) === "openai" ? "openai" : "";
    const model = raw.slice(separatorIndex + 1).trim();
    if (!provider || !model) {
      return null;
    }
    return {
      provider,
      model,
      key: `${provider}:${model}`,
    };
  }

  function getModelDisplayLabel(provider, model) {
    const knownLabels = {
      "gpt-5.4-mini": "GPT-5.4 mini",
      "gpt-5.2-pro": "GPT-5.2 Pro",
      "gemini-2.5-pro": "2.5 Pro",
      "gemini-2.5-flash-lite": "2.5 Flash Lite",
    };
    const label = provider === "gemini" ? "Gemini" : "OpenAI";
    return `${label} / ${knownLabels[model] || model}`;
  }

  function readCurrentAiSettings() {
    const source = window.__PIGMA_AI_SETTINGS__ && typeof window.__PIGMA_AI_SETTINGS__ === "object" ? window.__PIGMA_AI_SETTINGS__ : {};
    return {
      provider: source.provider === "gemini" ? "gemini" : "openai",
      openAiTextModel: normalizeModelId(source.openAiTextModel, DEFAULT_OPENAI_MODEL),
      geminiTextModel: normalizeModelId(source.geminiTextModel, DEFAULT_GEMINI_MODEL),
    };
  }

  function buildModelOptions() {
    const settings = readCurrentAiSettings();
    const selected = parseModelKey(state && state.selectedModelKey);
    const options = [
      {
        key: AUTO_MODEL_KEY,
        provider: "auto",
        label: "Auto",
        model: "",
        optionLabel: "Auto",
      },
    ];
    const seen = new Set();
    const append = (provider, model) => {
      const normalizedModel = normalizeModelId(model, provider === "gemini" ? DEFAULT_GEMINI_MODEL : DEFAULT_OPENAI_MODEL);
      const key = `${provider}:${normalizedModel}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      options.push({
        key,
        provider,
        label: provider === "gemini" ? "Gemini" : "OpenAI",
        model: normalizedModel,
        optionLabel: getModelDisplayLabel(provider, normalizedModel),
      });
    };

    if (selected) {
      append(selected.provider, selected.model);
    }
    append(settings.provider, settings.provider === "gemini" ? settings.geminiTextModel : settings.openAiTextModel);
    append("openai", settings.openAiTextModel);
    OPENAI_MODEL_PRESETS.forEach((model) => {
      append("openai", model);
    });
    append("gemini", settings.geminiTextModel);
    GEMINI_MODEL_PRESETS.forEach((model) => {
      append("gemini", model);
    });

    return options;
  }

  function getPreferredModelKeyFromSettings() {
    const settings = readCurrentAiSettings();
    const provider = settings.provider === "gemini" ? "gemini" : "openai";
    const model = provider === "gemini" ? settings.geminiTextModel : settings.openAiTextModel;
    return `${provider}:${normalizeModelId(model, provider === "gemini" ? DEFAULT_GEMINI_MODEL : DEFAULT_OPENAI_MODEL)}`;
  }

  function getAutoModelTitle() {
    return "Auto · 질문 길이와 현재 선택을 보고 Light 또는 Pro를 자동 선택합니다.";
  }

  function getPresetModelForTier(provider, tier) {
    if (provider === "gemini") {
      return tier === "pro" ? "gemini-2.5-pro" : DEFAULT_GEMINI_MODEL;
    }
    return tier === "pro" ? "gpt-5.2-pro" : DEFAULT_OPENAI_MODEL;
  }

  function hasProviderApiKey(settings, provider) {
    const next = settings && typeof settings === "object" ? settings : {};
    const raw =
      provider === "gemini"
        ? next.geminiApiKey || (next.provider === "gemini" ? next.apiKey : "")
        : next.openAiApiKey || (next.provider === "openai" ? next.apiKey : "");
    return !!compactText(raw, true);
  }

  function resolveAutoRoute(payload, settings) {
    const selection = payload && payload.selection ? payload.selection : state.selection;
    const question = compactText(payload && payload.question, false);
    const normalizedQuestion = question.toLowerCase();
    const roots = Array.isArray(selection && selection.roots) ? selection.roots : [];
    const selectedTextLength = compactText(selection && selection.textContent, false).length;
    const questionLineCount = question ? question.split(/\n+/).filter(Boolean).length : 0;
    const keywordHits = AUTO_PRO_KEYWORDS.reduce(
      (count, keyword) => count + (normalizedQuestion.includes(keyword) ? 1 : 0),
      0
    );
    const multiSelectionCount = Math.max(Number(selection && selection.selectionCount) || 0, roots.length);
    const visualSelection = !(selection && selection.sourceType === "text" && selection.textContent);
    const reasons = [];
    let provider = visualSelection ? "gemini" : "openai";
    reasons.push(visualSelection ? "시각 선택 중심" : "텍스트 선택 중심");

    const needsPro =
      question.length >= 120 ||
      questionLineCount >= 3 ||
      keywordHits > 0 ||
      selectedTextLength >= 400 ||
      multiSelectionCount >= 4 ||
      (visualSelection && question.length >= 80);
    const tier = needsPro ? "pro" : "light";
    reasons.push(needsPro ? "분석량이 커서 Pro 우선" : "짧고 가벼운 질문이라 Light 우선");

    if (!hasProviderApiKey(settings, provider)) {
      const fallbackProvider = provider === "gemini" ? "openai" : "gemini";
      if (hasProviderApiKey(settings, fallbackProvider)) {
        provider = fallbackProvider;
        reasons.push(`${provider === "gemini" ? "Gemini" : "OpenAI"} 키가 있는 쪽으로 전환`);
      }
    }

    const model = getPresetModelForTier(provider, tier);
    return {
      provider,
      model,
      tier,
      modelKey: `${provider}:${model}`,
      modelLabel: getModelDisplayLabel(provider, model),
      reason: reasons.join(" · "),
    };
  }

  function normalizeModelKey(value) {
    if (isAutoModelKey(value)) {
      return AUTO_MODEL_KEY;
    }
    const parsed = parseModelKey(value);
    return parsed ? parsed.key : AUTO_MODEL_KEY;
  }

  function getOrderedModelOptions() {
    const selectedKey = normalizeModelKey(state.selectedModelKey);
    return buildModelOptions().slice().sort((left, right) => {
      if (left.key === selectedKey) {
        return -1;
      }
      if (right.key === selectedKey) {
        return 1;
      }
      if (left.key === AUTO_MODEL_KEY) {
        return -1;
      }
      if (right.key === AUTO_MODEL_KEY) {
        return 1;
      }
      return 0;
    });
  }

  function readSelectedModelKey() {
    try {
      const cached = window.localStorage.getItem(MODEL_STORAGE_KEY);
      return normalizeModelKey(cached);
    } catch (error) {
      return AUTO_MODEL_KEY;
    }
  }

  function getRequestModelOptions(requestContext) {
    const context = requestContext && typeof requestContext === "object" ? requestContext : {};
    const settings = context.settings || readCurrentAiSettings();
    const allOptions = buildModelOptions().filter((option) => option.provider === "openai" || option.provider === "gemini");
    const ordered = [];
    const seen = new Set();
    const appendOption = (option) => {
      if (!option || seen.has(option.key)) {
        return;
      }
      seen.add(option.key);
      ordered.push(option);
    };

    let routeInfo = null;
    const preferredModel = parseModelKey(context.preferredModelKey);
    if (preferredModel) {
      appendOption(allOptions.find((option) => option.key === preferredModel.key));
      routeInfo = {
        modelKey: preferredModel.key,
        modelLabel: getModelDisplayLabel(preferredModel.provider, preferredModel.model),
        reason: compactText(context.preferredReason, true) || "이전 응답과 같은 모델을 먼저 사용합니다.",
        mode: "preferred",
      };
    } else {
      const selectedKey = normalizeModelKey(
        Object.prototype.hasOwnProperty.call(context, "selectedModelKey") ? context.selectedModelKey : state.selectedModelKey
      );
      if (selectedKey === AUTO_MODEL_KEY) {
        routeInfo = resolveAutoRoute(context.payload, settings);
        appendOption(allOptions.find((option) => option.key === routeInfo.modelKey));
      } else {
        const selectedOption = allOptions.find((option) => option.key === selectedKey);
        appendOption(selectedOption);
        if (selectedOption) {
          routeInfo = {
            modelKey: selectedOption.key,
            modelLabel: selectedOption.optionLabel,
            reason: "",
            mode: "manual",
          };
        }
      }
    }

    allOptions.forEach(appendOption);
    return {
      options: ordered,
      routeInfo,
    };
  }

  function writeSelectedModelKey(value) {
    state.selectedModelKey = normalizeModelKey(value);
    try {
      window.localStorage.setItem(MODEL_STORAGE_KEY, state.selectedModelKey);
    } catch (error) {}
  }

  function getSelectedModelKeyFromControl() {
    if (hasElement(elements.modelSelect) && typeof elements.modelSelect.value === "string") {
      return normalizeModelKey(elements.modelSelect.value);
    }
    return normalizeModelKey(state.selectedModelKey);
  }

  function syncSelectedModelKeyFromControl() {
    const selectedKey = getSelectedModelKeyFromControl();
    if (selectedKey !== state.selectedModelKey) {
      writeSelectedModelKey(selectedKey);
    }
    return selectedKey;
  }

  function postPluginMessage(message) {
    if (shared && typeof shared.postPluginMessage === "function") {
      shared.postPluginMessage(message);
      return;
    }
    parent.postMessage({ pluginMessage: message }, "*");
  }

  function normalizeBytes(value) {
    if (shared && typeof shared.normalizeBytes === "function") {
      return shared.normalizeBytes(value);
    }
    if (value instanceof Uint8Array) {
      return value;
    }
    if (value instanceof ArrayBuffer) {
      return new Uint8Array(value);
    }
    if (ArrayBuffer.isView(value) && value.buffer instanceof ArrayBuffer) {
      return new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
    }
    if (Array.isArray(value)) {
      return new Uint8Array(value);
    }
    return new Uint8Array(0);
  }

  function encodeBytesToBase64(bytes) {
    if (shared && typeof shared.encodeBytesToBase64 === "function") {
      return shared.encodeBytesToBase64(bytes);
    }
    const source = normalizeBytes(bytes);
    let binary = "";
    const chunkSize = 32768;
    for (let index = 0; index < source.length; index += chunkSize) {
      const chunk = source.subarray(index, Math.min(source.length, index + chunkSize));
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  }

  function normalizeErrorMessage(error, fallback) {
    if (shared && typeof shared.normalizeErrorMessage === "function") {
      return shared.normalizeErrorMessage(error, fallback);
    }
    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }
    if (error && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }
    return typeof fallback === "string" && fallback.trim() ? fallback.trim() : "오류가 발생했습니다.";
  }

  function isAbortError(error) {
    if (shared && typeof shared.isAbortError === "function") {
      return shared.isAbortError(error);
    }
    return !!(error && (error.name === "AbortError" || /abort/i.test(String(error.message || ""))));
  }

  function reportUiError(message) {
    if (shared && typeof shared.reportUiError === "function") {
      shared.reportUiError(message);
      return;
    }
    console.error("[ai-design-chat-ui]", message);
  }

  function requireReadySettings() {
    if (shared && typeof shared.requireReadySettings === "function") {
      return shared.requireReadySettings();
    }
    throw new Error("AI 공용 설정 모듈이 아직 준비되지 않았습니다. 플러그인을 다시 열어 주세요.");
  }

  async function prepareInputImage(imagePayload, options) {
    if (shared && typeof shared.prepareInputImage === "function") {
      return shared.prepareInputImage(imagePayload, options);
    }
    const mimeType =
      imagePayload && typeof imagePayload.mimeType === "string" && imagePayload.mimeType.trim()
        ? imagePayload.mimeType.trim()
        : "image/png";
    return {
      blob: new Blob([normalizeBytes(imagePayload && imagePayload.bytes)], {
        type: mimeType,
      }),
    };
  }

  function readDebugMode() {
    return window.__PIGMA_AI_CORRECTION_DEBUG_MODE__ === true || document.documentElement.dataset.aiCorrectionDebugMode === "true";
  }

  function isDetailsElement(element) {
    return hasElement(element) && String(element.tagName || "").toUpperCase() === "DETAILS";
  }

  function buildEmptySelection() {
    return {
      ready: false,
      selectionSignature: "",
      selectionLabel: "",
      selectionCount: 0,
      selectionTypeLabel: "",
      captureMode: "idle",
      captureModeLabel: "대기",
      width: 0,
      height: 0,
      textPreview: "",
      textContent: "",
      hint: "프레임, 이미지, 텍스트를 선택하면 대화를 시작할 수 있습니다.",
      roots: [],
      annotationTargetCount: 0,
      sourceType: "visual",
    };
  }

  function normalizeSelection(value) {
    const source = value && typeof value === "object" ? value : {};
    const ready = source.ready === true;
    return {
      ready,
      selectionSignature:
        typeof source.selectionSignature === "string" && source.selectionSignature.trim() ? source.selectionSignature.trim() : "",
      selectionLabel:
        typeof source.selectionLabel === "string" && source.selectionLabel.trim()
          ? abbreviateMiddleText(source.selectionLabel, 10)
          : "",
      selectionCount: ready ? Math.max(0, Number(source.selectionCount) || 0) : 0,
      selectionTypeLabel:
        typeof source.selectionTypeLabel === "string" && source.selectionTypeLabel.trim() ? source.selectionTypeLabel.trim() : "",
      captureMode:
        typeof source.captureMode === "string" && source.captureMode.trim() ? source.captureMode.trim().toLowerCase() : "idle",
      captureModeLabel:
        typeof source.captureModeLabel === "string" && source.captureModeLabel.trim() ? source.captureModeLabel.trim() : "대기",
      width: ready ? Math.max(0, Math.round(Number(source.width) || 0)) : 0,
      height: ready ? Math.max(0, Math.round(Number(source.height) || 0)) : 0,
      textPreview: abbreviateMiddleText(
        typeof source.textPreview === "string" && source.textPreview.trim() ? source.textPreview : source.textContent,
        10
      ),
      textContent: typeof source.textContent === "string" ? source.textContent.trim() : "",
      hint:
        typeof source.hint === "string" && source.hint.trim()
          ? source.hint.trim()
          : "프레임, 이미지, 텍스트를 선택하면 대화를 시작할 수 있습니다.",
      roots: Array.isArray(source.roots)
        ? source.roots
            .map((entry) => {
              const item = entry && typeof entry === "object" ? entry : {};
              return {
                id: typeof item.id === "string" ? item.id : "",
                name: typeof item.name === "string" ? item.name : "",
                type: typeof item.type === "string" ? item.type : "",
              };
            })
            .filter((entry) => entry.id)
        : [],
      annotationTargetCount: ready ? Math.max(0, Number(source.annotationTargetCount) || 0) : 0,
      sourceType:
        typeof source.sourceType === "string" && source.sourceType.trim() ? source.sourceType.trim().toLowerCase() : "visual",
    };
  }

  function readThreadStore() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      return sanitizeThreadStore(parsed);
    } catch (error) {
      return {};
    }
  }

  function sanitizeThreadStore(value) {
    if (!value || typeof value !== "object") {
      return {};
    }

    const sanitized = {};
    Object.keys(value).forEach((signature) => {
      if (!(typeof signature === "string" && signature.trim())) {
        return;
      }
      const entry = value[signature];
      if (!entry || typeof entry !== "object") {
        return;
      }
      const updatedAt = Number(entry.updatedAt) || 0;
      const selectionLabel = typeof entry.selectionLabel === "string" ? entry.selectionLabel : "";
      const messages = Array.isArray(entry.messages) ? entry.messages.map(sanitizeMessage).filter(Boolean) : [];
      if (!messages.length) {
        return;
      }
      sanitized[signature] = {
        updatedAt,
        selectionLabel,
        messages: messages.slice(-MAX_MESSAGES_PER_THREAD),
      };
    });
    return pruneThreadStore(sanitized);
  }

  function sanitizeMessage(value) {
    if (!value || typeof value !== "object") {
      return null;
    }
    const role = value.role === "assistant" ? "assistant" : value.role === "user" ? "user" : "";
    if (!role) {
      return null;
    }
    const streaming = value.streaming === true;
    const content = compactText(value.content, false);
    if (!content && !streaming) {
      return null;
    }
    const followups = Array.isArray(value.followups)
      ? value.followups
          .map((item) => compactText(item, true))
          .filter(Boolean)
          .slice(0, MAX_FOLLOWUPS)
      : [];
    const checklistItems = Array.isArray(value.checklistItems)
      ? value.checklistItems
          .map((item, index) => {
            const source = item && typeof item === "object" ? item : {};
            const title = compactText(source.title, true);
            const detail = compactText(source.detail, true);
            if (!title && !detail) {
              return null;
            }
            const priority = compactText(source.priority, true) || "중간";
            return {
              id: typeof source.id === "string" && source.id.trim() ? source.id.trim() : `checklist-${index + 1}`,
              priority,
              title: title || detail,
              detail,
            };
          })
          .filter(Boolean)
          .slice(0, MAX_CHECKLIST_ITEMS)
      : [];
    return {
      id: typeof value.id === "string" && value.id.trim() ? value.id.trim() : buildId("message"),
      role,
      summary: compactText(value.summary, true),
      content,
      createdAt: Number(value.createdAt) || Date.now(),
      modelKey: parseModelKey(value.modelKey)?.key || "",
      modelLabel: compactText(value.modelLabel, true),
      routeReason: compactText(value.routeReason, true),
      annotationRequested: value.annotationRequested === true,
      annotationText: compactText(value.annotationText, true),
      annotationState:
        value.annotationState === "applied" || value.annotationState === "applying" || value.annotationState === "error"
          ? value.annotationState
          : "idle",
      annotationNote: compactText(value.annotationNote, true),
      checklistItems,
      checklistState:
        value.checklistState === "ready" || value.checklistState === "generating" || value.checklistState === "error"
          ? value.checklistState
          : checklistItems.length
            ? "ready"
            : "idle",
      checklistNote: compactText(value.checklistNote, true),
      followups,
      streaming,
    };
  }

  function pruneThreadStore(store) {
    const entries = Object.entries(store || {})
      .filter((entry) => entry[1] && Array.isArray(entry[1].messages) && entry[1].messages.length > 0)
      .sort((left, right) => (right[1].updatedAt || 0) - (left[1].updatedAt || 0))
      .slice(0, MAX_THREAD_COUNT);
    const next = {};
    entries.forEach(([signature, entry]) => {
      next[signature] = {
        updatedAt: Number(entry.updatedAt) || Date.now(),
        selectionLabel: typeof entry.selectionLabel === "string" ? entry.selectionLabel : "",
        messages: entry.messages.slice(-MAX_MESSAGES_PER_THREAD),
      };
    });
    return next;
  }

  function writeThreadStore() {
    state.threads = pruneThreadStore(state.threads);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.threads));
    } catch (error) {}
  }

  function renderModelSelect() {
    const control = elements.modelSelect;
    if (!hasElement(control)) {
      return;
    }
    const options = buildModelOptions();
    const optionSignature = options.map((option) => option.key).join("|");
    if (control.dataset.optionsSignature !== optionSignature) {
      control.replaceChildren();
      options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.key;
        optionElement.textContent = option.optionLabel;
        control.appendChild(optionElement);
      });
      control.dataset.optionsSignature = optionSignature;
    }
    const selectedKey = normalizeModelKey(state.selectedModelKey);
    state.selectedModelKey = selectedKey;
    control.value = selectedKey;
    control.title =
      selectedKey === AUTO_MODEL_KEY
        ? getAutoModelTitle()
        : options.find((option) => option.key === selectedKey)?.optionLabel || getAutoModelTitle();
    if (typeof control.disabled === "boolean") {
      control.disabled = isBusy();
    }
  }

  function getCurrentThreadEntry() {
    const signature = state.selection.selectionSignature;
    if (!signature || !state.threads[signature]) {
      return null;
    }
    return state.threads[signature];
  }

  function getCurrentMessages() {
    const entry = getCurrentThreadEntry();
    return entry && Array.isArray(entry.messages) ? entry.messages : [];
  }

  function getRenderableMessages() {
    const messages = getCurrentMessages().slice();
    if (
      state.liveMessage &&
      state.liveMessage.selectionSignature === state.selection.selectionSignature &&
      state.liveMessage.message
    ) {
      messages.push(state.liveMessage.message);
    }
    return messages;
  }

  function setCurrentMessages(messages) {
    if (!(state.selection.ready && state.selection.selectionSignature)) {
      return;
    }
    const nextMessages = Array.isArray(messages) ? messages.map(sanitizeMessage).filter(Boolean).slice(-MAX_MESSAGES_PER_THREAD) : [];
    if (!nextMessages.length) {
      delete state.threads[state.selection.selectionSignature];
      writeThreadStore();
      return;
    }
    state.threads[state.selection.selectionSignature] = {
      updatedAt: Date.now(),
      selectionLabel: state.selection.selectionLabel,
      messages: nextMessages,
    };
    writeThreadStore();
  }

  function appendCurrentMessage(message) {
    const messages = getCurrentMessages().slice();
    const nextMessage = sanitizeMessage(message);
    if (!nextMessage) {
      return null;
    }
    messages.push(nextMessage);
    setCurrentMessages(messages);
    return nextMessage;
  }

  function updateMessage(messageId, updater) {
    if (!(state.selection.ready && state.selection.selectionSignature && typeof messageId === "string" && messageId)) {
      return;
    }
    const messages = getCurrentMessages().slice();
    const index = messages.findIndex((message) => message && message.id === messageId);
    if (index < 0) {
      return;
    }
    const current = messages[index];
    const next = typeof updater === "function" ? updater(current) : updater;
    const sanitized = sanitizeMessage(Object.assign({}, current, next));
    if (!sanitized) {
      return;
    }
    messages[index] = sanitized;
    setCurrentMessages(messages);
  }

  function setLiveAssistantMessage(message) {
    const sanitized = sanitizeMessage(
      Object.assign({}, message, {
        role: "assistant",
        streaming: true,
      })
    );
    if (!sanitized) {
      return;
    }
    state.liveMessage = {
      selectionSignature: state.selection.selectionSignature,
      message: sanitized,
    };
  }

  function updateLiveAssistantMessage(updater) {
    if (
      !state.liveMessage ||
      state.liveMessage.selectionSignature !== state.selection.selectionSignature ||
      !state.liveMessage.message
    ) {
      return;
    }
    const current = state.liveMessage.message;
    const next = typeof updater === "function" ? updater(current) : updater;
    const sanitized = sanitizeMessage(
      Object.assign({}, current, next, {
        streaming: true,
      })
    );
    if (!sanitized) {
      return;
    }
    state.liveMessage.message = sanitized;
  }

  function clearLiveAssistantMessage() {
    state.liveMessage = null;
  }

  function clearCurrentThread() {
    abortActiveRun("현재 질문 생성을 멈췄습니다.");
    cancelPendingSource("선택 캡처를 중단했습니다.");
    if (state.liveMessage && state.liveMessage.selectionSignature === state.selection.selectionSignature) {
      clearLiveAssistantMessage();
    }
    if (state.selection.selectionSignature) {
      delete state.threads[state.selection.selectionSignature];
      writeThreadStore();
    }
    render();
    if (state.selection.ready) {
      setStatus("ready", "현재 선택의 대화를 비웠습니다.");
    } else {
      setStatus("idle", "대화가 비워졌습니다.");
    }
  }

  function restartConversation() {
    clearCurrentThread();
    elements.input.value = "";
    elements.input.focus();
    syncControls();
  }

  function clearCurrentThread(options) {
    const nextOptions = options && typeof options === "object" ? options : {};
    abortActiveRun("현재 질문 생성을 중단합니다.");
    cancelPendingSource("선택 캡처를 중단했습니다.");
    if (state.liveMessage && state.liveMessage.selectionSignature === state.selection.selectionSignature) {
      clearLiveAssistantMessage();
    }
    if (nextOptions.preserveNotice !== true) {
      clearThreadNotice();
    }
    if (state.selection.selectionSignature) {
      delete state.threads[state.selection.selectionSignature];
      writeThreadStore();
    }
    render();
    if (state.selection.ready) {
      setStatus("ready", "현재 선택의 대화를 비웠습니다.");
    } else {
      setStatus("idle", "대화를 비워 두었습니다.");
    }
  }

  function restartConversation(options) {
    clearCurrentThread(options);
    elements.input.value = "";
    elements.input.focus();
    syncControls();
  }

  function setStatus(tone, message) {
    state.statusTone =
      tone === "ready" || tone === "running" || tone === "error" || tone === "stale" ? tone : "idle";
    state.statusText = compactText(message, true) || "대기 중입니다.";
    renderStatus();
  }

  function renderStatus() {
    const tone = state.statusTone;
    const labelMap = {
      idle: "대기",
      ready: "준비",
      running: "진행",
      error: "오류",
      stale: "변경됨",
    };
    elements.statusPill.dataset.tone = tone === "idle" ? "idle" : tone;
    elements.statusPill.textContent = labelMap[tone] || "대기";
    elements.statusText.textContent = state.statusText;
  }

  function isBusy() {
    return !!state.activeRun || !!state.pendingSource;
  }

  function isAiTabActive() {
    return !!aiTab && aiTab.getAttribute("aria-selected") === "true";
  }

  function isDesignChatPanelOpen() {
    return !isDetailsElement(elements.group) || elements.group.open === true;
  }

  function isDesignChatTrackingEnabled() {
    return isAiTabActive() && isDesignChatPanelOpen();
  }

  function buildId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function compactText(value, singleLine) {
    const text = typeof value === "string" ? value : "";
    if (!text) {
      return "";
    }
    return singleLine
      ? text.replace(/\s+/g, " ").trim()
      : text.replace(/\r\n/g, "\n").replace(/\u00A0/g, " ").trim();
  }

  function clipText(value, maxLength) {
    const text = compactText(value, true);
    if (!text) {
      return "";
    }
    const limit = Math.max(1, Number(maxLength) || 0);
    if (!limit || text.length <= limit) {
      return text;
    }
    return `${text.slice(0, Math.max(1, limit - 1)).trim()}...`;
  }

  function abbreviateMiddleText(value, edgeLength) {
    const text = compactText(value, true);
    if (!text) {
      return "";
    }
    const edge = Math.max(1, Number(edgeLength) || 10);
    if (text.length <= edge * 2 + 4) {
      return text;
    }
    return `${text.slice(0, edge).trim()}....${text.slice(-edge).trim()}`;
  }

  function buildSelectionMetrics(selection) {
    const next = selection && typeof selection === "object" ? selection : buildEmptySelection();
    const textContent = compactText(next.textContent, false);
    const roots = Array.isArray(next.roots) ? next.roots : [];
    const selectionCount = Math.max(Number(next.selectionCount) || 0, roots.length);
    const width = Math.max(0, Number(next.width) || 0);
    const height = Math.max(0, Number(next.height) || 0);
    const aspectRatio = width > 0 && height > 0 ? width / Math.max(height, 1) : 0;
    const longEdge = Math.max(width, height);
    return {
      ready: next.ready === true,
      textOnly: next.sourceType === "text",
      mixed: next.sourceType === "mixed",
      hasText: !!textContent,
      textLength: textContent.length,
      selectionCount,
      multiSelection: selectionCount > 1,
      width,
      height,
      longEdge,
      wideCanvas: aspectRatio >= 1.35,
      complexSelection: longEdge >= 1200 || selectionCount >= 4 || textContent.length >= 220,
    };
  }

  function appendRecommendedQuestion(list, question) {
    const nextQuestion = clipText(question, 72);
    if (!nextQuestion || list.includes(nextQuestion)) {
      return;
    }
    list.push(nextQuestion);
  }

  function buildRecommendedQuestions(selection) {
    const metrics = buildSelectionMetrics(selection);
    if (!metrics.ready) {
      return [];
    }
    const questions = [];

    if (metrics.textOnly) {
      appendRecommendedQuestion(
        questions,
        metrics.textLength >= 90 ? "핵심만 남기고 더 읽기 쉽게 다듬으려면?" : "이 문장을 더 자연스럽게 바꾸려면?"
      );
      appendRecommendedQuestion(questions, "오타나 어색한 표현이 있는지 봐줘");
      appendRecommendedQuestion(
        questions,
        metrics.multiSelection ? "여러 문구 톤이 서로 일관적인지 봐줘" : "브랜드 톤에 맞게 더 설득력 있게 바꾸려면?"
      );
    } else if (metrics.mixed) {
      appendRecommendedQuestion(questions, "가장 먼저 손봐야 할 3가지는?");
      appendRecommendedQuestion(questions, "텍스트와 시선 흐름 중 어디가 가장 막혀 보여?");
      appendRecommendedQuestion(
        questions,
        metrics.multiSelection
          ? "선택한 요소들 사이에 일관성 깨지는 부분은?"
          : metrics.complexSelection || metrics.wideCanvas
            ? "모바일로 줄면 먼저 깨질 부분은?"
            : "개발 전달 전에 정리할 부분은?"
      );
    } else {
      appendRecommendedQuestion(questions, "가장 먼저 손봐야 할 3가지는?");
      appendRecommendedQuestion(
        questions,
        metrics.multiSelection ? "선택한 요소들 사이에 어색한 간격이나 정렬은?" : "시선 흐름이 가장 어색한 곳은?"
      );
      appendRecommendedQuestion(
        questions,
        metrics.complexSelection || metrics.wideCanvas
          ? "모바일로 줄면 먼저 깨질 부분은?"
          : "색감과 강조를 더 정돈하려면 어디부터 볼까?"
      );
    }

    appendRecommendedQuestion(questions, "지금 선택에서 가장 아쉬운 부분은?");
    return questions.slice(0, MAX_RECOMMENDED_QUESTIONS);
  }

  function includesSuggestionKeyword(text, keywords) {
    const normalized = compactText(text, true).toLowerCase();
    if (!normalized) {
      return false;
    }
    return Array.isArray(keywords)
      ? keywords.some((keyword) => {
          const needle = compactText(keyword, true).toLowerCase();
          return needle ? normalized.includes(needle) : false;
        })
      : false;
  }

  function getSuggestionContext(messages) {
    const list = Array.isArray(messages) ? messages : [];
    let question = "";
    let answer = "";
    for (let index = list.length - 1; index >= 0; index -= 1) {
      const message = list[index];
      if (!question && message && message.role === "user" && message.content) {
        question = compactText(message.content, false);
      } else if (!answer && message && message.role === "assistant" && !message.streaming && message.content) {
        answer = compactText(message.content, false);
      }
      if (question && answer) {
        break;
      }
    }
    return {
      question,
      answer,
    };
  }

  function buildContextualRecommendedQuestions(selection, messages) {
    const context = getSuggestionContext(messages);
    if (!context.question) {
      return [];
    }
    const questions = [];

    if (includesSuggestionKeyword(context.question, ["오타", "맞춤법", "문장", "카피", "문구", "텍스트", "표현", "wording", "copy", "typo", "spell"])) {
      appendRecommendedQuestion(questions, "같은 뜻으로 더 자연스럽게 다듬으면?");
      appendRecommendedQuestion(questions, "제목이나 버튼 문구까지 같이 점검할까?");
      appendRecommendedQuestion(questions, "브랜드 톤에 맞게 다시 쓰면 어떻게 바뀔까?");
    } else if (includesSuggestionKeyword(context.question, ["색", "컬러", "배색", "톤", "대비", "contrast", "color", "palette"])) {
      appendRecommendedQuestion(questions, "브랜드 톤은 유지하고 덜 튀게 바꾸려면?");
      appendRecommendedQuestion(questions, "CTA만 더 살아나게 하려면 어디 색을 손볼까?");
      appendRecommendedQuestion(questions, "명도 대비 기준으로 위험한 곳도 같이 볼까?");
    } else if (includesSuggestionKeyword(context.question, ["모바일", "반응형", "responsive", "줄면", "좁아", "깨질", "깨져", "작아"])) {
      appendRecommendedQuestion(questions, "모바일에서 먼저 접거나 줄일 요소는?");
      appendRecommendedQuestion(questions, "줄바꿈이 가장 위험한 텍스트는 어디야?");
      appendRecommendedQuestion(questions, "우선순위만 남기면 어떤 순서가 좋아?");
    } else if (includesSuggestionKeyword(context.question, ["레이아웃", "정렬", "간격", "여백", "시선", "흐름", "배치", "구성", "layout", "spacing", "hierarchy"])) {
      appendRecommendedQuestion(questions, "가장 먼저 정리할 간격 3가지는?");
      appendRecommendedQuestion(questions, "시선 흐름을 막는 요소는 어디야?");
      appendRecommendedQuestion(questions, "정렬 기준을 하나로 맞추면 어디부터일까?");
    } else if (includesSuggestionKeyword(context.question, ["개발", "핸드오프", "네이밍", "구조", "컴포넌트", "토큰", "handoff", "developer", "dev"])) {
      appendRecommendedQuestion(questions, "개발 전달 전에 이름이나 구조에서 위험한 곳은?");
      appendRecommendedQuestion(questions, "컴포넌트로 묶을 수 있는 반복 요소는?");
      appendRecommendedQuestion(questions, "토큰으로 빼면 좋은 색이나 간격은?");
    } else if (includesSuggestionKeyword(context.question, ["이미지", "비주얼", "무드", "스타일", "프롬프트", "visual", "image", "prompt"])) {
      appendRecommendedQuestion(questions, "이 비주얼을 더 고급스럽게 만들려면?");
      appendRecommendedQuestion(questions, "프롬프트로 옮기면 어떤 키워드가 핵심일까?");
      appendRecommendedQuestion(questions, "배경과 피사체 중 어디를 먼저 손보는 게 좋을까?");
    } else if (includesSuggestionKeyword(context.question, ["문제", "개선", "어색", "우선", "리뷰", "전략", "compare", "critique", "strategy", "priority"])) {
      appendRecommendedQuestion(questions, "수정 효과가 가장 큰 한 군데만 꼽으면?");
      appendRecommendedQuestion(questions, "사용자가 가장 헷갈릴 지점은 어디야?");
      appendRecommendedQuestion(questions, "바로 손댈 수 있는 빠른 수정 3개는?");
    } else {
      buildRecommendedQuestions(selection).forEach((question) => {
        appendRecommendedQuestion(questions, question);
      });
    }

    if (!questions.length) {
      buildRecommendedQuestions(selection).forEach((question) => {
        appendRecommendedQuestion(questions, question);
      });
    }
    if (questions.length < MAX_RECOMMENDED_QUESTIONS && context.answer) {
      appendRecommendedQuestion(questions, "방금 답변 기준으로 바로 고칠 한 가지만 꼽으면?");
    }
    return questions.slice(0, MAX_RECOMMENDED_QUESTIONS);
  }

  function renderSuggestedQuestions() {
    const questions = buildContextualRecommendedQuestions(state.selection, getRenderableMessages());
    elements.suggestionList.replaceChildren();
    const hasQuestions = questions.length > 0;
    elements.suggestionBlock.hidden = !hasQuestions;
    if ("inert" in elements.suggestionBlock) {
      elements.suggestionBlock.inert = !hasQuestions;
    }
    if (!hasQuestions) {
      return;
    }
    questions.forEach((question) => {
      const button = document.createElement("button");
      button.className = "button-secondary ai-design-chat-suggestion-button";
      button.type = "button";
      button.textContent = question;
      button.title = question;
      button.addEventListener("click", () => {
        elements.input.value = question;
        elements.input.focus();
        syncControls();
      });
      elements.suggestionList.appendChild(button);
    });
  }

  function setThreadNotice(message, tone) {
    const text = compactText(message, false);
    if (!text) {
      state.threadNotice = null;
      return;
    }
    state.threadNotice = {
      selectionSignature: state.selection.selectionSignature,
      tone: tone === "stale" ? "stale" : tone === "ready" ? "ready" : "info",
      text,
      updatedAt: Date.now(),
    };
  }

  function clearThreadNotice() {
    state.threadNotice = null;
  }

  function getActiveThreadNotice() {
    if (!state.threadNotice) {
      return null;
    }
    if (state.threadNotice.selectionSignature && state.threadNotice.selectionSignature !== state.selection.selectionSignature) {
      return null;
    }
    return state.threadNotice;
  }

  function describeSelection(selection) {
    if (selection && selection.ready) {
      const textDisplay = abbreviateMiddleText(selection.textPreview || selection.textContent, 10);
      if (textDisplay) {
        return textDisplay;
      }
      const labelDisplay = abbreviateMiddleText(selection.selectionLabel || selection.selectionTypeLabel, 10);
      if (labelDisplay) {
        return labelDisplay;
      }
    }
    if (!selection || !selection.ready) {
      return "현재 선택";
    }
    return compactText(selection.selectionLabel || selection.selectionTypeLabel, true) || "현재 선택";
  }

  function classifySelectionChange(previousSelection, nextSelection) {
    if (
      !previousSelection ||
      !previousSelection.ready ||
      !nextSelection ||
      !nextSelection.ready ||
      previousSelection.selectionSignature === nextSelection.selectionSignature
    ) {
      return null;
    }
    const previousRoots = new Set(
      Array.isArray(previousSelection.roots) ? previousSelection.roots.map((entry) => entry && entry.id).filter(Boolean) : []
    );
    const nextRoots = Array.isArray(nextSelection.roots) ? nextSelection.roots.map((entry) => entry && entry.id).filter(Boolean) : [];
    const related = nextRoots.some((id) => previousRoots.has(id));
    if (related) {
      return {
        tone: "ready",
        text: `선택 대상이 ${describeSelection(previousSelection)}에서 ${describeSelection(nextSelection)}(으)로 바뀌었습니다. 같은 화면 흐름 안의 새 대상으로 이어서 봅니다.`,
      };
    }
    return {
      tone: "stale",
      text: `이전 대화는 ${describeSelection(previousSelection)} 기준이었고, 지금은 ${describeSelection(nextSelection)} 기준입니다. 현재 선택을 새 대상으로 보고 답합니다.`,
    };
  }

  function parseChecklistItems(text) {
    const lines = String(text || "")
      .replace(/\r\n/g, "\n")
      .split(/\n+/)
      .map((line) => compactText(line.replace(/^CHECKLIST:\s*/i, "").replace(/^[-*]\s*/, ""), true))
      .filter(Boolean)
      .slice(0, MAX_CHECKLIST_ITEMS);
    return lines.map((line, index) => {
      const parts = line.split("|").map((part) => compactText(part, true)).filter(Boolean);
      const priority = parts.length >= 3 ? parts[0] : "중간";
      const title = parts.length >= 3 ? parts[1] : parts[0] || `항목 ${index + 1}`;
      const detail = parts.length >= 3 ? parts.slice(2).join(" | ") : parts.slice(1).join(" | ");
      return {
        id: `checklist-${index + 1}`,
        priority,
        title,
        detail: clipText(detail, 180),
      };
    });
  }

  function buildChecklistInstruction(payload) {
    const selection = payload && payload.selection ? payload.selection : buildEmptySelection();
    const lines = [
      "You turn a design answer into a short action checklist for a Figma user.",
      "Write in Korean.",
      "Return plain text only.",
      "Return 3 to 5 lines.",
      "Each line must start with '- '.",
      "Use this exact format for every line:",
      "- <priority> | <task> | <reason>",
      "Priority must be one of: 높음, 중간, 낮음.",
      `Selection: ${describeSelection(selection)}`,
      selection.selectionTypeLabel ? `Selection types: ${selection.selectionTypeLabel}` : "",
      selection.selectionCount > 0 ? `Selection count: ${selection.selectionCount}` : "",
      payload.question ? `User question: ${payload.question}` : "",
      payload.answer ? `Answer to convert:\n${payload.answer}` : "",
      "Make every item directly actionable inside Figma.",
    ];
    return lines.filter(Boolean).join("\n");
  }

  function buildPromptSeedFromMessage(message, question) {
    const parts = [
      describeSelection(state.selection),
      compactText(question, true),
      compactText(message && message.summary, true),
      compactText(message && message.content, false),
    ].filter(Boolean);
    return clipText(parts.join("\n"), 700);
  }

  function getQuestionForAssistantMessage(messageId) {
    const messages = getCurrentMessages();
    const index = messages.findIndex((message) => message && message.id === messageId);
    if (index <= 0) {
      return "";
    }
    for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
      const candidate = messages[cursor];
      if (candidate && candidate.role === "user" && candidate.content) {
        return candidate.content;
      }
    }
    return "";
  }

  function shouldShowRouteReason(message) {
    const text = compactText(message && message.routeReason, true);
    return !!text && !/직접 선택한 모델/i.test(text);
  }

  function hasPromptDraftIntentText(value) {
    const normalized = compactText(value, false).toLowerCase();
    if (!normalized) {
      return false;
    }
    if (PROMPT_DRAFT_ACTION_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
      return true;
    }
    const visualIntent = /(이미지|사진|일러스트|배경|렌더|포스터|썸네일|비주얼|visual|asset)/i.test(normalized);
    const generationIntent = /(프롬프트|prompt|생성|만들|제작|묘사|그려|스타일|style)/i.test(normalized);
    return visualIntent && generationIntent;
  }

  function shouldOfferPromptDraft(message) {
    if (!message || message.role !== "assistant") {
      return false;
    }
    const question = getQuestionForAssistantMessage(message.id);
    return [question, message.summary, message.content, message.annotationText].some((value) => hasPromptDraftIntentText(value));
  }

  function hasAnnotationIntentText(value) {
    const normalized = compactText(value, false).toLowerCase();
    if (!normalized) {
      return false;
    }
    if (ANNOTATION_ACTION_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
      return true;
    }
    const annotationMention = /(주석|코멘트|comment|annotation|annotate|메모)/i.test(normalized);
    const actionIntent = /(달아줘|달아|남겨줘|남겨|추가해줘|추가|붙여줘|붙여|표시해줘|표시|작성해줘|작성|적어줘|적어|부탁|add|leave|attach|apply)/i.test(normalized);
    return annotationMention && actionIntent;
  }

  function normalizeAnnotationText(value) {
    const text = clipText(value, 120);
    if (!text) {
      return "";
    }
    if (/^(?:없음|없어요|없습니다|해당 없음|none|n\/a|-+)$/i.test(text)) {
      return "";
    }
    return text;
  }

  function shouldOfferAnnotationAction(message) {
    if (!message || message.role !== "assistant") {
      return false;
    }
    if (
      message.annotationRequested === true ||
      message.annotationState === "applied" ||
      message.annotationState === "applying" ||
      message.annotationState === "error"
    ) {
      return true;
    }
    return hasAnnotationIntentText(getQuestionForAssistantMessage(message.id));
  }

  function formatTime(timestamp) {
    try {
      return new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(timestamp));
    } catch (error) {
      return "";
    }
  }

  function setPreviewObjectUrl(url) {
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = "";
    }
    previewObjectUrl = typeof url === "string" ? url : "";
  }

  function clearSourceState() {
    setPreviewObjectUrl("");
    state.source = null;
    elements.previewImage.hidden = true;
    elements.previewImage.removeAttribute("src");
    elements.previewEmpty.hidden = false;
  }

  function cancelPendingSource(message) {
    if (state.autoCaptureTimer) {
      window.clearTimeout(state.autoCaptureTimer);
      state.autoCaptureTimer = 0;
    }
    if (state.pendingSource && typeof state.pendingSource.reject === "function") {
      state.pendingSource.reject(new Error(message || "선택 캡처가 취소되었습니다."));
    }
    state.pendingSource = null;
    state.sourcePromise = null;
  }

  function abortActiveRun(message) {
    if (state.activeRun && state.activeRun.controller) {
      try {
        state.activeRun.controller.abort();
      } catch (error) {}
    }
    state.activeRun = null;
    if (message) {
      setStatus("stale", message);
    }
  }

  function clearAutoCaptureTimer() {
    if (state.autoCaptureTimer) {
      window.clearTimeout(state.autoCaptureTimer);
      state.autoCaptureTimer = 0;
    }
  }

  function scheduleAutoCapture() {
    if (!isDesignChatTrackingEnabled() || !state.selection.ready) {
      clearAutoCaptureTimer();
      return;
    }
    if (state.source && state.source.selectionSignature === state.selection.selectionSignature) {
      clearAutoCaptureTimer();
      return;
    }
    clearAutoCaptureTimer();
    state.autoCaptureTimer = window.setTimeout(() => {
      state.autoCaptureTimer = 0;
      if (!isDesignChatTrackingEnabled() || !state.selection.ready) {
        return;
      }
      ensureSelectionSource(false).catch(() => {});
    }, 220);
  }

  function syncSelectionPolling() {
    if (state.selectionPollTimer) {
      window.clearInterval(state.selectionPollTimer);
      state.selectionPollTimer = 0;
    }
    if (!isDesignChatTrackingEnabled()) {
      clearAutoCaptureTimer();
      return;
    }
    state.selectionPollTimer = window.setInterval(() => {
      if (!isDesignChatTrackingEnabled()) {
        syncSelectionPolling();
        return;
      }
      requestSelectionSync();
    }, 1200);
  }

  async function ensureSelectionSource(forceRefresh) {
    if (!state.selection.ready) {
      state.selection = Object.assign({}, state.selection, {
        ready: true,
      });
    }
    if (!state.selection.ready) {
      throw new Error("프레임, 이미지, 텍스트를 먼저 선택해 주세요.");
    }

    const selectionSignature = forceRefresh ? "" : state.selection.selectionSignature;
    if (!forceRefresh && state.source && state.source.selectionSignature === selectionSignature) {
      return state.source;
    }

    if (!forceRefresh && state.sourcePromise) {
      return state.sourcePromise;
    }

    cancelPendingSource("새 캡처 요청으로 이전 캡처를 정리했습니다.");
    if (forceRefresh) {
      clearSourceState();
    }

    const requestId = buildId("design-chat-source");
    setStatus("running", forceRefresh ? "현재 선택을 다시 캡처하는 중입니다." : "현재 선택을 캡처하는 중입니다.");

    state.sourcePromise = new Promise((resolve, reject) => {
      state.pendingSource = {
        requestId,
        selectionSignature,
        resolve,
        reject,
      };
      postPluginMessage({
        type: "request-ai-design-chat-source",
        clientRequestId: requestId,
        selectionSignature,
      });
    });

    return state.sourcePromise;
  }

  function normalizeSourcePayload(payload) {
    const image = payload && payload.image && typeof payload.image === "object" ? payload.image : {};
    const bytes = normalizeBytes(image.bytes);
    const mimeType =
      typeof image.mimeType === "string" && image.mimeType.trim() ? image.mimeType.trim().toLowerCase() : "image/png";
    const fileName = typeof image.fileName === "string" && image.fileName.trim() ? image.fileName.trim() : "design-chat.png";
    const blob = new Blob([bytes], {
      type: mimeType,
    });
    const url = URL.createObjectURL(blob);
    return {
      selectionSignature: payload.selection.selectionSignature,
      selection: normalizeSelection(payload.selection),
      image: {
        bytes,
        mimeType,
        fileName,
      },
      capturedAt: Date.now(),
      previewUrl: url,
    };
  }

  function formatSelectionMeta() {
    if (!state.selection.ready) {
      return "선택 없음";
    }
    const parts = [];
    if (state.selection.selectionTypeLabel) {
      parts.push(state.selection.selectionTypeLabel);
    }
    if (state.selection.width > 0 && state.selection.height > 0) {
      parts.push(`${state.selection.width} x ${state.selection.height}`);
    }
    if (state.selection.annotationTargetCount > 0) {
      parts.push(`주석 가능 ${state.selection.annotationTargetCount}개`);
    }
    return parts.join(" · ") || "선택 준비됨";
  }

  function buildSelectionTitle() {
    if (!state.selection.ready) {
      return "프레임, 이미지, 텍스트를 선택하면 현재 선택 기준으로 바로 질문할 수 있습니다.";
    }
    const selectionName = state.selection.selectionLabel || "현재 선택";
    return `${selectionName}에 대해 바로 질문할 수 있습니다.`;
  }

  function buildThreadMeta() {
    if (!state.selection.ready) {
      return "현재 선택 단위로만 웹 저장소에 임시 보관합니다.";
    }
    const count = getCurrentMessages().length;
    if (!count) {
      return "현재 선택 기준 대화가 아직 없습니다.";
    }
    return `현재 선택 기준으로 ${count}개의 메시지를 임시 보관 중입니다.`;
  }

  function buildPreviewMeta() {
    if (!state.selection.ready) {
      return "선택하면 미리보기를 자동으로 준비합니다.";
    }
    if (!state.source || state.source.selectionSignature !== state.selection.selectionSignature) {
      return "질문하거나 다시 캡처하면 현재 선택의 스냅샷을 갱신합니다.";
    }
    return `마지막 캡처 ${formatTime(state.source.capturedAt)} · ${state.selection.captureModeLabel}`;
  }

  function applySelection(selectionPayload) {
    const nextSelection = normalizeSelection(selectionPayload);
    const previousSelection = state.selection;
    const previousSignature = previousSelection.selectionSignature;
    const signatureChanged = previousSignature !== nextSelection.selectionSignature;
    const changeNotice = classifySelectionChange(previousSelection, nextSelection);
    state.selection = nextSelection;

    if (signatureChanged) {
      clearLiveAssistantMessage();
      clearSourceState();
      cancelPendingSource("선택이 바뀌어 이전 캡처를 정리했습니다.");
      if (state.activeRun && state.activeRun.selectionSignature !== nextSelection.selectionSignature) {
        abortActiveRun("선택이 바뀌어 이전 응답 생성을 멈췄습니다.");
      }
      if (changeNotice) {
        setThreadNotice(changeNotice.text, changeNotice.tone);
      } else if (nextSelection.ready) {
        setThreadNotice(`현재 선택은 ${describeSelection(nextSelection)} 기준으로 새 대화를 시작합니다.`, "ready");
      } else {
        clearThreadNotice();
      }
    }

    if (!nextSelection.ready) {
      clearSourceState();
      clearThreadNotice();
      setStatus("idle", nextSelection.hint);
    } else if (signatureChanged) {
      const existingCount = getCurrentMessages().length;
      setStatus(
        "ready",
        existingCount ? `현재 선택의 이전 대화 ${existingCount}개를 다시 불러왔습니다.` : nextSelection.hint
      );
    } else if (!state.activeRun && !state.pendingSource && !state.source) {
      setStatus("ready", nextSelection.hint);
    }

    render();
    scheduleAutoCapture();
  }

  function buildThreadMeta() {
    if (!state.selection.ready) {
      return "현재 선택 단위로만 대화를 웹 저장소에 임시 보관합니다.";
    }
    const count = getCurrentMessages().length;
    const notice = getActiveThreadNotice();
    if (!count) {
      return notice ? "선택 변화가 감지되었습니다. 새 맥락으로 대화를 시작할 수 있습니다." : "현재 선택 기준 대화가 아직 없습니다.";
    }
    if (notice) {
      return `현재 선택 기준 대화 ${count}개와 함께 선택 변경 안내를 표시 중입니다.`;
    }
    return `현재 선택 기준으로 ${count}개의 메시지를 임시 보관 중입니다.`;
  }

  function renderChecklist(item, checklistItem) {
    const entry = document.createElement("div");
    entry.className = "ai-design-chat-checklist-item";

    const title = document.createElement("p");
    title.className = "ai-design-chat-message-summary";
    title.textContent = `${checklistItem.priority} · ${checklistItem.title}`;
    entry.appendChild(title);

    if (checklistItem.detail) {
      const detail = document.createElement("p");
      detail.className = "ai-design-chat-message-note";
      detail.textContent = checklistItem.detail;
      entry.appendChild(detail);
    }

    item.appendChild(entry);
  }

  function renderThread() {
    elements.thread.replaceChildren();
    const notice = getActiveThreadNotice();
    if (notice) {
      const banner = document.createElement("div");
      banner.className = "ai-design-chat-thread-notice";
      banner.dataset.tone = notice.tone || "info";
      banner.textContent = notice.text;
      elements.thread.appendChild(banner);
    }

    const messages = getRenderableMessages();
    messages.forEach((message) => {
      const item = document.createElement("article");
      item.className = "ai-design-chat-message";
      item.dataset.role = message.role;
      item.dataset.streaming = message.streaming ? "true" : "false";

      const head = document.createElement("div");
      head.className = "ai-design-chat-message-head";

      const role = document.createElement("p");
      role.className = "ai-design-chat-message-role";
      role.textContent = message.role === "assistant" ? `AI${message.modelLabel ? ` - ${message.modelLabel}` : ""}` : "사용자";
      head.appendChild(role);

      const time = document.createElement("p");
      time.className = "ai-design-chat-message-time";
      time.textContent = formatTime(message.createdAt);
      head.appendChild(time);

      item.appendChild(head);

      if (message.summary) {
        const summary = document.createElement("p");
        summary.className = "ai-design-chat-message-summary";
        summary.textContent = message.summary;
        item.appendChild(summary);
      }

      const body = document.createElement("p");
      body.className = "ai-design-chat-message-body";
      body.textContent = message.content || "응답을 정리하는 중입니다.";
      item.appendChild(body);

      if (message.role === "assistant" && shouldShowRouteReason(message)) {
        const routeNote = document.createElement("p");
        routeNote.className = "ai-design-chat-message-note";
        routeNote.textContent = message.routeReason;
        item.appendChild(routeNote);
      }

      if (message.role === "assistant" && message.checklistItems.length) {
        const checklist = document.createElement("div");
        checklist.className = "ai-design-chat-checklist";
        message.checklistItems.forEach((checklistItem) => {
          renderChecklist(checklist, checklistItem);
        });
        item.appendChild(checklist);
      }

      if (message.role === "assistant" && message.checklistNote) {
        const checklistNote = document.createElement("p");
        checklistNote.className = "ai-design-chat-message-note";
        checklistNote.textContent = message.checklistNote;
        item.appendChild(checklistNote);
      }

      if (message.role === "assistant" && message.annotationNote) {
        const note = document.createElement("p");
        note.className = "ai-design-chat-message-note";
        note.textContent = message.annotationNote;
        item.appendChild(note);
      }

      if (message.role === "assistant" && !message.streaming) {
        const actions = document.createElement("div");
        actions.className = "ai-design-chat-message-actions";

        const checklistButton = document.createElement("button");
        checklistButton.className = "button-secondary";
        checklistButton.type = "button";
        checklistButton.disabled = isBusy() || message.checklistState === "generating";
        checklistButton.textContent =
          message.checklistState === "ready"
            ? "체크리스트 다시 만들기"
            : message.checklistState === "generating"
              ? "체크리스트 생성 중..."
              : "수정 체크리스트";
        checklistButton.addEventListener("click", () => {
          requestChecklist(message.id);
        });
        actions.appendChild(checklistButton);

        if (shouldOfferPromptDraft(message)) {
          const promptButton = document.createElement("button");
          promptButton.className = "button-secondary";
          promptButton.type = "button";
          promptButton.textContent = "프롬프트로 보내기";
          promptButton.addEventListener("click", () => {
            openPromptDraft(message.id);
          });
          actions.appendChild(promptButton);
        }

        if (shouldOfferAnnotationAction(message)) {
          const annotationButton = document.createElement("button");
          annotationButton.className = "button-secondary";
          annotationButton.type = "button";
          annotationButton.disabled =
            !state.selection.ready || message.annotationState === "applying" || state.selection.annotationTargetCount <= 0;
          annotationButton.textContent =
            message.annotationState === "applied"
              ? "주석 반영됨"
              : message.annotationState === "applying"
                ? "주석 추가 중..."
                : "주석 추가";
          annotationButton.addEventListener("click", () => {
            requestAnnotation(message.id);
          });
          actions.appendChild(annotationButton);
        }

        if (message.followups.length) {
          const followups = document.createElement("div");
          followups.className = "ai-design-chat-followups";
          message.followups.forEach((followup) => {
            const button = document.createElement("button");
            button.className = "button-secondary ai-design-chat-followup";
            button.type = "button";
            button.textContent = followup;
            button.addEventListener("click", () => {
              elements.input.value = followup;
              elements.input.focus();
              syncControls();
            });
            followups.appendChild(button);
          });
          actions.appendChild(followups);
        }

        item.appendChild(actions);
      }

      elements.thread.appendChild(item);
    });

    elements.thread.setAttribute("aria-busy", state.activeRun ? "true" : "false");
    elements.thread.scrollTop = elements.thread.scrollHeight;
  }

  function renderPreview() {
    const hasPreview = !!(state.source && state.source.selectionSignature === state.selection.selectionSignature && previewObjectUrl);
    elements.previewMeta.textContent = buildPreviewMeta();
    if (!hasPreview) {
      elements.previewImage.hidden = true;
      elements.previewImage.removeAttribute("src");
      elements.previewEmpty.hidden = false;
      return;
    }
    elements.previewImage.src = previewObjectUrl;
    elements.previewImage.hidden = false;
    elements.previewEmpty.hidden = true;
  }

  function syncControls() {
    const canSend = !!compactText(elements.input.value, true) && !isBusy();
    const hasDraft = !!compactText(elements.input.value, true);
    const hasThreadContent =
      getCurrentMessages().length > 0 ||
      !!(state.liveMessage && state.liveMessage.selectionSignature === state.selection.selectionSignature);
    elements.sendButton.disabled = !canSend;
    elements.refreshButton.disabled = !!state.pendingSource;
    elements.clearButton.disabled = !state.selection.ready || !hasThreadContent;
    if (hasButton(elements.restartButton)) {
      elements.restartButton.disabled = !hasThreadContent && !hasDraft && !isBusy();
    }
    if (hasElement(elements.modelSelect) && typeof elements.modelSelect.disabled === "boolean") {
      elements.modelSelect.disabled = isBusy();
    }
    elements.storageValue.textContent = "웹 저장소";
  }

  function syncDebugModeVisibility() {
    state.debugModeEnabled = readDebugMode();
    const enabled = state.debugModeEnabled === true;
    elements.selectionPanel.hidden = !enabled;
    elements.threadMeta.hidden = !enabled;
    elements.previewPanel.hidden = !enabled;
    elements.quickPanel.hidden = true;
    if ("inert" in elements.selectionPanel) {
      elements.selectionPanel.inert = !enabled;
    }
    if ("inert" in elements.previewPanel) {
      elements.previewPanel.inert = !enabled;
    }
    if ("inert" in elements.quickPanel) {
      elements.quickPanel.inert = true;
    }
    if (!enabled && isDetailsElement(elements.selectionPanel)) {
      elements.selectionPanel.open = false;
    }
    if (!enabled && isDetailsElement(elements.previewPanel)) {
      elements.previewPanel.open = false;
    }
    if (isDetailsElement(elements.quickPanel)) {
      elements.quickPanel.open = false;
    }
  }

  function render() {
    elements.title.textContent = buildSelectionTitle();
    elements.selectionMeta.textContent = formatSelectionMeta();
    elements.selectionCountValue.textContent = `${state.selection.selectionCount || 0}개`;
    elements.captureModeValue.textContent = state.selection.captureModeLabel || "대기";
    elements.threadMeta.textContent = buildThreadMeta();
    renderModelSelect();
    renderSuggestedQuestions();
    syncDebugModeVisibility();
    renderStatus();
    renderPreview();
    renderThread();
    syncControls();
  }

  function requestSelectionSync() {
    postPluginMessage({
      type: "request-ai-design-chat-selection",
    });
  }

  async function prepareImageForAi(imagePayload) {
    const prepared = await prepareInputImage(imagePayload, {
      inputPreparation: {
        mode: "design-chat",
        maxLongEdge: 1536,
        maxPixelCount: 1800000,
        forceGemini2k: false,
      },
    });
    const bytes = normalizeBytes(await prepared.blob.arrayBuffer());
    return {
      base64: encodeBytesToBase64(bytes),
      mimeType: prepared.blob.type || "image/png",
    };
  }

  function buildProviderCandidates(settings, requestContext) {
    const candidates = [];
    const seen = new Set();
    const context = requestContext && typeof requestContext === "object" ? requestContext : {};
    const optionPlan = getRequestModelOptions({
      settings,
      payload: context.payload,
      preferredModelKey: context.preferredModelKey,
      preferredReason: context.preferredReason,
      selectedModelKey: context.selectedModelKey,
    });
    const append = (option, apiKey) => {
      const key = typeof apiKey === "string" ? apiKey.trim() : "";
      if (!key || !option) {
        return;
      }
      const candidateKey = `${option.provider}:${key}:${option.model}`;
      if (seen.has(candidateKey)) {
        return;
      }
      seen.add(candidateKey);
      candidates.push({
        provider: option.provider,
        apiKey: key,
        label: option.label,
        model: option.model,
        modelKey: option.key,
        displayLabel: option.optionLabel,
      });
    };

    const next = settings && typeof settings === "object" ? settings : {};
    const providerKeys = {
      openai: [next.openAiApiKey, next.provider === "openai" ? next.apiKey : ""],
      gemini: [next.geminiApiKey, next.provider === "openai" ? "" : next.apiKey],
    };
    optionPlan.options.forEach((option) => {
      const keys = providerKeys[option.provider] || [];
      keys.forEach((key) => {
        append(option, key);
      });
    });

    return {
      candidates,
      routeInfo: optionPlan.routeInfo,
    };
  }

  async function requestOpenAiTextTaskWithResponses(providerInfo, prompt, signal) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerInfo.apiKey}`,
        "Content-Type": "application/json",
      },
      signal,
      body: JSON.stringify({
        model: providerInfo.model,
        instructions: "You are a concise design collaboration assistant inside a Figma plugin. Return plain text only.",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(await buildProviderHttpError("OpenAI", response));
    }
    return getOpenAiResponsesText(await response.json());
  }

  async function requestOpenAiTextTask(providerInfo, prompt, signal) {
    if (isOpenAiResponsesOnlyModel(providerInfo.model)) {
      return requestOpenAiTextTaskWithResponses(providerInfo, prompt, signal);
    }

    const requestBody = {
      model: providerInfo.model,
      messages: [
        {
          role: "system",
          content: "You are a concise design collaboration assistant inside a Figma plugin. Return plain text only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    };
    if (canUseTemperatureWithOpenAiChatModel(providerInfo.model)) {
      requestBody.temperature = 0.4;
    }

    let response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${providerInfo.apiKey}`,
          "Content-Type": "application/json",
        },
        signal,
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error(await buildProviderHttpError("OpenAI", response));
      }
    } catch (error) {
      if (shouldRetryOpenAiWithResponsesApi(error)) {
        return requestOpenAiTextTaskWithResponses(providerInfo, prompt, signal);
      }
      throw error;
    }

    return getOpenAiText(await response.json());
  }

  async function requestGeminiTextTask(providerInfo, prompt, signal) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${providerInfo.model}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": providerInfo.apiKey,
          "Content-Type": "application/json",
        },
        signal,
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
          },
        }),
      }
    );
    if (!response.ok) {
      throw new Error(await buildProviderHttpError("Gemini", response));
    }
    return getGeminiText(await response.json());
  }

  async function requestTextTask(prompt, options, signal) {
    const settings = requireReadySettings();
    const requestOptions = options && typeof options === "object" ? options : {};
    const candidatePlan = buildProviderCandidates(settings, requestOptions);
    if (!candidatePlan.candidates.length) {
      throw new Error("AI 설정에서 Gemini 또는 OpenAI API 키를 먼저 입력해 주세요.");
    }

    let lastError = null;
    for (let index = 0; index < candidatePlan.candidates.length; index += 1) {
      const providerInfo = candidatePlan.candidates[index];
      try {
        const text =
          providerInfo.provider === "openai"
            ? await requestOpenAiTextTask(providerInfo, prompt, signal)
            : await requestGeminiTextTask(providerInfo, prompt, signal);
        return {
          text,
          modelKey: providerInfo.modelKey || `${providerInfo.provider}:${providerInfo.model}`,
          modelLabel: providerInfo.displayLabel || getModelDisplayLabel(providerInfo.provider, providerInfo.model),
          routeReason:
            index === 0
              ? compactText(candidatePlan.routeInfo && candidatePlan.routeInfo.reason, true)
              : `${providerInfo.displayLabel || getModelDisplayLabel(providerInfo.provider, providerInfo.model)} 모델로 다시 시도해 성공했습니다.`,
        };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("AI 작업을 완료하지 못했습니다.");
  }

  function buildHistoryForAi(messages) {
    return messages.slice(-MAX_HISTORY_MESSAGES).map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: clipText(message.content, 280),
    }));
  }

  function buildDesignChatInstruction(payload) {
    const selection = payload.selection || buildEmptySelection();
    const roots = Array.isArray(selection.roots) ? selection.roots : [];
    const history = Array.isArray(payload.history) ? payload.history : [];
    const historyLines = history.length
      ? history.map((entry) => `${entry.role === "assistant" ? "AI" : "USER"}: ${clipText(entry.content, 280)}`).join("\n")
      : "없음";
    const rootLine = roots.length
      ? roots
          .slice(0, 4)
          .map((entry) => `${entry.name || entry.type || "레이어"} (${entry.type || "UNKNOWN"})`)
          .join(", ")
      : "없음";

    const lines = [
      "You are an AI design chat assistant inside a Figma plugin.",
      "Write in Korean.",
      "Answer the user's actual question first.",
      "If selected text is provided, treat that text as the source of truth.",
      "When selected text is provided, do not invent or infer unrelated topics from the screenshot.",
      "If the user asks for a summary, translation, rewrite, shortening, or tone change, work directly from the selected text.",
      "Infer the likely design intent from the current selection, then explain how to strengthen that intent.",
      "Prefer specific design direction, priority, and change rationale over generic criticism.",
      "If the screenshot is ambiguous, say what you infer briefly and continue with a practical answer.",
      "Do not return JSON, code fences, or markdown tables.",
      "Return plain text in this exact order and keep the labels in English:",
      "ANSWER:",
      "<2 to 5 short Korean sentences>",
      "SUMMARY:",
      "<one short Korean line under 26 characters>",
      "ANNOTATION:",
      "<one short Korean line under 120 characters, or leave blank>",
      "FOLLOWUPS:",
      "- <short Korean follow-up question>",
      "- <short Korean follow-up question>",
      `Selection label: ${selection.selectionLabel || "현재 선택"}`,
      `Selection count: ${selection.selectionCount || 0}`,
      `Selection types: ${selection.selectionTypeLabel || "없음"}`,
      `Capture mode: ${selection.captureModeLabel || "없음"}`,
      selection.width > 0 && selection.height > 0 ? `Selection size: ${selection.width} x ${selection.height}px` : "",
      selection.sourceType === "text" ? "Important: the current selection is text-only. Use only the selected text itself, not surrounding context." : "",
      selection.captureMode === "combined" ? "Important: multiple selected items should be treated as one combined screen because the user intends to ask about the whole composition." : "",
      selection.hint ? `Selection note: ${selection.hint}` : "",
      selection.textContent ? `Selected text source of truth:\n${selection.textContent}` : "",
      selection.textPreview ? `Selected or visible text: ${selection.textPreview}` : "",
      roots.length ? `Selected roots: ${rootLine}` : "",
      `Recent conversation:\n${historyLines}`,
      `User question: ${payload.question}`,
      "Response constraints:",
      "- Put the actual answer immediately after ANSWER: so it can be streamed live.",
      "- Keep the tone direct, calm, and actionable.",
      "- If the user explicitly asks to add a Figma annotation or comment, write ANNOTATION as the exact short note to attach.",
      "- If the user did not ask for a Figma annotation or comment, leave ANNOTATION blank.",
      "- FOLLOWUPS must be short enough to fit on buttons.",
    ];

    return lines.filter(Boolean).join("\n");
  }

  function extractStructuredSection(text, label, nextLabels) {
    const source = typeof text === "string" ? text.replace(/\r\n/g, "\n") : "";
    const match = new RegExp(`(?:^|\\n)${label}:\\s*`, "i").exec(source);
    if (!match) {
      return "";
    }
    const startIndex = match.index + match[0].length;
    let endIndex = source.length;
    (Array.isArray(nextLabels) ? nextLabels : []).forEach((nextLabel) => {
      const nextMatch = new RegExp(`\\n${nextLabel}:\\s*`, "i").exec(source.slice(startIndex));
      if (nextMatch) {
        endIndex = Math.min(endIndex, startIndex + nextMatch.index);
      }
    });
    return source.slice(startIndex, endIndex).trim();
  }

  function parseFollowupSection(block) {
    if (!block) {
      return [];
    }
    return block
      .split(/\n+/)
      .map((line) => compactText(line.replace(/^[-*]\s*/, ""), true))
      .filter(Boolean)
      .slice(0, MAX_FOLLOWUPS);
  }

  function parseStructuredDesignChatText(text, question) {
    const raw = typeof text === "string" ? text.replace(/\r\n/g, "\n").trim() : "";
    if (!raw) {
      throw new Error("AI 응답이 비어 있습니다.");
    }
    const cleaned = raw.replace(/^```(?:text|markdown)?/i, "").replace(/```$/i, "").trim();
    const answer =
      extractStructuredSection(cleaned, "ANSWER", ["SUMMARY", "ANNOTATION", "FOLLOWUPS"]) ||
      cleaned.replace(/^ANSWER:\s*/i, "").trim();
    if (!answer) {
      throw new Error("AI 답변이 비어 있습니다.");
    }
    const summary = clipText(extractStructuredSection(cleaned, "SUMMARY", ["ANNOTATION", "FOLLOWUPS"]) || answer, 26);
    const annotationRequested = hasAnnotationIntentText(question);
    const annotation = normalizeAnnotationText(
      extractStructuredSection(cleaned, "ANNOTATION", ["FOLLOWUPS"]) || (annotationRequested ? summary || answer : "")
    );
    const followups = parseFollowupSection(extractStructuredSection(cleaned, "FOLLOWUPS", []));
    return {
      summary,
      answer,
      annotation,
      annotationRequested,
      followups,
      question: compactText(question, true),
    };
  }

  function extractStreamingAnswer(text) {
    const raw = typeof text === "string" ? text.replace(/\r\n/g, "\n") : "";
    const answer = extractStructuredSection(raw, "ANSWER", ["SUMMARY", "ANNOTATION", "FOLLOWUPS"]);
    if (answer) {
      return answer;
    }
    return raw.replace(/^ANSWER:\s*/i, "").trim();
  }

  function getOpenAiText(data) {
    const choices = Array.isArray(data && data.choices) ? data.choices : [];
    const firstMessage = choices[0] && choices[0].message ? choices[0].message : null;
    if (!firstMessage) {
      throw new Error("OpenAI 응답을 읽지 못했습니다.");
    }
    if (typeof firstMessage.content === "string" && firstMessage.content.trim()) {
      return firstMessage.content.trim();
    }
    if (Array.isArray(firstMessage.content)) {
      const texts = firstMessage.content
        .map((item) => (item && typeof item.text === "string" ? item.text.trim() : ""))
        .filter(Boolean);
      if (texts.length) {
        return texts.join("\n");
      }
    }
    throw new Error("OpenAI 응답에 텍스트가 없습니다.");
  }

  function getOpenAiDeltaText(data) {
    const choices = Array.isArray(data && data.choices) ? data.choices : [];
    const delta = choices[0] && choices[0].delta ? choices[0].delta : null;
    if (!delta) {
      return "";
    }
    if (typeof delta.content === "string") {
      return delta.content;
    }
    if (Array.isArray(delta.content)) {
      return delta.content
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }
          if (item && typeof item.text === "string") {
            return item.text;
          }
          return "";
        })
        .filter(Boolean)
        .join("");
    }
    return "";
  }

  function getGeminiText(data) {
    const candidates = Array.isArray(data && data.candidates) ? data.candidates : [];
    const first = candidates[0] && candidates[0].content ? candidates[0].content : null;
    const parts = first && Array.isArray(first.parts) ? first.parts : [];
    const texts = parts.map((item) => (item && typeof item.text === "string" ? item.text.trim() : "")).filter(Boolean);
    if (!texts.length) {
      throw new Error("Gemini 응답에 텍스트가 없습니다.");
    }
    return texts.join("\n");
  }

  function parseOpenAiSseEvent(rawEvent) {
    const lines = String(rawEvent || "").split(/\r?\n/);
    const dataLines = lines
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .filter(Boolean);
    if (!dataLines.length) {
      return {
        done: false,
        text: "",
      };
    }
    const payload = dataLines.join("\n");
    if (payload === "[DONE]") {
      return {
        done: true,
        text: "",
      };
    }
    try {
      return {
        done: false,
        text: getOpenAiDeltaText(JSON.parse(payload)),
      };
    } catch (error) {
      return {
        done: false,
        text: "",
      };
    }
  }

  async function readOpenAiTextStream(response, onProgress) {
    if (!response.body || typeof response.body.getReader !== "function") {
      return getOpenAiText(await response.json());
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let accumulated = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, {
        stream: true,
      });

      let separatorMatch = /\r?\n\r?\n/.exec(buffer);
      while (separatorMatch) {
        const rawEvent = buffer.slice(0, separatorMatch.index);
        buffer = buffer.slice(separatorMatch.index + separatorMatch[0].length);
        const event = parseOpenAiSseEvent(rawEvent);
        if (event.done) {
          if (typeof onProgress === "function") {
            onProgress(accumulated);
          }
          return accumulated;
        }
        if (event.text) {
          accumulated += event.text;
          if (typeof onProgress === "function") {
            onProgress(accumulated);
          }
        }
        separatorMatch = /\r?\n\r?\n/.exec(buffer);
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      const event = parseOpenAiSseEvent(buffer);
      if (event.text) {
        accumulated += event.text;
        if (typeof onProgress === "function") {
          onProgress(accumulated);
        }
      }
    }

    return accumulated;
  }

  async function buildProviderHttpError(label, response) {
    let detail = "";
    try {
      detail = compactText(await response.text(), true);
    } catch (error) {}
    return `${label} API 오류 (${response.status})${detail ? ` · ${clipText(detail, 140)}` : ""}`;
  }

  function canUseTemperatureWithOpenAiChatModel(model) {
    const normalized = String(model || "").trim().toLowerCase();
    if (!normalized) {
      return true;
    }
    return !(normalized.startsWith("gpt-5") && !normalized.startsWith("gpt-5.1"));
  }

  function shouldAttachSelectionImage(payload) {
    const selection = payload && payload.selection ? payload.selection : null;
    return !(selection && selection.sourceType === "text" && selection.textContent);
  }

  function isOpenAiResponsesOnlyModel(model) {
    const normalized = String(model || "").trim().toLowerCase();
    if (!normalized) {
      return false;
    }
    return (
      /^(?:gpt-\d+(?:\.\d+)?-pro|o\d+-pro)(?:-|$)/.test(normalized) ||
      /^gpt-5\.1-codex(?:-max)?(?:-|$)/.test(normalized) ||
      /^computer-use-preview(?:-|$)/.test(normalized)
    );
  }

  function shouldRetryOpenAiWithResponsesApi(error) {
    const message =
      error && typeof error.message === "string"
        ? error.message
        : typeof error === "string"
          ? error
          : "";
    const normalized = message.trim().toLowerCase();
    if (!normalized) {
      return false;
    }
    return (
      normalized.includes("/v1/responses") ||
      normalized.includes("responses api") ||
      normalized.includes("response api") ||
      normalized.includes("only available via the responses api") ||
      normalized.includes("only available in the responses api") ||
      normalized.includes("not supported in the chat completions api") ||
      normalized.includes("unsupported parameter") ||
      normalized.includes("response_format")
    );
  }

  function getOpenAiResponsesText(data) {
    if (!data || typeof data !== "object") {
      throw new Error("OpenAI Responses 응답 형식을 읽지 못했습니다.");
    }
    if (typeof data.output_text === "string" && data.output_text.trim()) {
      return data.output_text.trim();
    }
    const outputs = Array.isArray(data.output) ? data.output : [];
    const texts = [];
    outputs.forEach((item) => {
      if (!item || typeof item !== "object") {
        return;
      }
      if (typeof item.text === "string" && item.text.trim()) {
        texts.push(item.text.trim());
      }
      const content = Array.isArray(item.content) ? item.content : [];
      content.forEach((part) => {
        if (!part || typeof part !== "object") {
          return;
        }
        if (typeof part.text === "string" && part.text.trim()) {
          texts.push(part.text.trim());
        }
      });
    });
    if (texts.length) {
      return texts.join("\n");
    }
    throw new Error("OpenAI Responses 텍스트를 찾지 못했습니다.");
  }

  async function requestOpenAiDesignChatWithResponses(providerInfo, payload, signal, onProgress) {
    const preparedImage = payload.image && shouldAttachSelectionImage(payload) ? await prepareImageForAi(payload.image) : null;
    const input = [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: buildDesignChatInstruction(payload),
          },
          ...(preparedImage
            ? [
                {
                  type: "input_image",
                  image_url: `data:${preparedImage.mimeType};base64,${preparedImage.base64}`,
                },
              ]
            : []),
        ],
      },
    ];
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerInfo.apiKey}`,
        "Content-Type": "application/json",
      },
      signal,
      body: JSON.stringify({
        model: providerInfo.model,
        instructions: "You are a concise design collaboration assistant inside a Figma plugin. Return plain text in the requested labeled format.",
        input,
      }),
    });
    if (!response.ok) {
      throw new Error(await buildProviderHttpError("OpenAI", response));
    }
    const text = getOpenAiResponsesText(await response.json());
    if (typeof onProgress === "function") {
      onProgress(text);
    }
    return parseStructuredDesignChatText(text, payload.question);
  }

  async function requestOpenAiDesignChat(providerInfo, payload, signal, onProgress) {
    if (isOpenAiResponsesOnlyModel(providerInfo.model)) {
      return requestOpenAiDesignChatWithResponses(providerInfo, payload, signal, onProgress);
    }
    const preparedImage = payload.image && shouldAttachSelectionImage(payload) ? await prepareImageForAi(payload.image) : null;
    const content = [
      {
        type: "text",
        text: buildDesignChatInstruction(payload),
      },
    ];
    if (preparedImage) {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:${preparedImage.mimeType};base64,${preparedImage.base64}`,
        },
      });
    }

    const useStreaming = typeof onProgress === "function";
    const requestBody = {
      model: providerInfo.model,
      stream: useStreaming,
      messages: [
        {
          role: "system",
          content:
            "You are a concise design collaboration assistant inside a Figma plugin. Return plain text in the requested labeled format.",
        },
        {
          role: "user",
          content,
        },
      ],
    };
    if (canUseTemperatureWithOpenAiChatModel(providerInfo.model)) {
      requestBody.temperature = 0.4;
    }
    let response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${providerInfo.apiKey}`,
          "Content-Type": "application/json",
        },
        signal,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(await buildProviderHttpError("OpenAI", response));
      }
    } catch (error) {
      if (shouldRetryOpenAiWithResponsesApi(error)) {
        return requestOpenAiDesignChatWithResponses(providerInfo, payload, signal, onProgress);
      }
      throw error;
    }

    const text = useStreaming ? await readOpenAiTextStream(response, onProgress) : getOpenAiText(await response.json());
    return parseStructuredDesignChatText(text, payload.question);
  }

  async function requestGeminiDesignChat(providerInfo, payload, signal) {
    const preparedImage = payload.image && shouldAttachSelectionImage(payload) ? await prepareImageForAi(payload.image) : null;
    const parts = [
      {
        text: buildDesignChatInstruction(payload),
      },
    ];
    if (preparedImage) {
      parts.push({
        inline_data: {
          mime_type: preparedImage.mimeType,
          data: preparedImage.base64,
        },
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${providerInfo.model}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": providerInfo.apiKey,
          "Content-Type": "application/json",
        },
        signal,
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts,
            },
          ],
          generationConfig: {
            temperature: 0.4,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(await buildProviderHttpError("Gemini", response));
    }

    return parseStructuredDesignChatText(getGeminiText(await response.json()), payload.question);
  }

  async function requestDesignChat(payload, signal, onProgress, onAttempt, options) {
    const settings = requireReadySettings();
    const requestOptions = options && typeof options === "object" ? options : {};
    const candidatePlan = buildProviderCandidates(settings, {
      payload,
      selectedModelKey: requestOptions.selectedModelKey,
    });
    if (!candidatePlan.candidates.length) {
      throw new Error("AI 설정에서 Gemini 또는 OpenAI API 키를 먼저 입력해 주세요.");
    }

    let lastError = null;
    for (let index = 0; index < candidatePlan.candidates.length; index += 1) {
      const providerInfo = candidatePlan.candidates[index];
      try {
        if (typeof onAttempt === "function") {
          onAttempt(providerInfo, index, candidatePlan);
        }
        const result =
          providerInfo.provider === "openai"
            ? await requestOpenAiDesignChat(providerInfo, payload, signal, onProgress)
            : await requestGeminiDesignChat(providerInfo, payload, signal);
        return Object.assign({}, result, {
          modelKey: providerInfo.modelKey || `${providerInfo.provider}:${providerInfo.model}`,
          modelLabel: providerInfo.displayLabel || getModelDisplayLabel(providerInfo.provider, providerInfo.model),
          routeReason:
            index === 0
              ? compactText(candidatePlan.routeInfo && candidatePlan.routeInfo.reason, true)
              : `${providerInfo.displayLabel || getModelDisplayLabel(providerInfo.provider, providerInfo.model)} 모델로 다시 시도해 성공했습니다.`,
        });
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("AI 응답을 생성하지 못했습니다.");
  }

  async function handleSend() {
    const question = compactText(elements.input.value, false);
    if (!question) {
      return;
    }
    const selectedModelKey = syncSelectedModelKeyFromControl();
    const annotationRequested = hasAnnotationIntentText(question);
    if (!state.selection.ready) {
      state.selection = Object.assign({}, state.selection, {
        ready: true,
      });
    }
    if (!state.selection.ready) {
      setStatus("error", "프레임, 이미지, 텍스트를 먼저 선택해 주세요.");
      return;
    }

    const userMessage = appendCurrentMessage({
      id: buildId("user"),
      role: "user",
      content: question,
      createdAt: Date.now(),
      annotationState: "idle",
      checklistState: "idle",
      followups: [],
    });
    elements.input.value = "";
    render();

    let source;
    try {
      source = await ensureSelectionSource(false);
    } catch (error) {
      if (!isAbortError(error)) {
        const message = normalizeErrorMessage(error, "선택 캡처를 준비하지 못했습니다.");
        setStatus("error", message);
        reportUiError(message);
      }
      return;
    }

    const history = buildHistoryForAi(getCurrentMessages());
    const controller = new AbortController();
    const runId = buildId("design-chat-run");
    const liveMessageId = buildId("assistant-live");
    setLiveAssistantMessage({
      id: liveMessageId,
      role: "assistant",
      summary: "응답 작성 중",
      content: "",
      createdAt: Date.now(),
      annotationRequested,
      annotationText: "",
      annotationState: "idle",
      checklistItems: [],
      checklistState: "idle",
      checklistNote: "",
      followups: [],
    });
    state.activeRun = {
      id: runId,
      controller,
      selectionSignature: state.selection.selectionSignature,
      userMessageId: userMessage ? userMessage.id : "",
      liveMessageId,
    };
    setStatus("running", "AI가 현재 선택을 해석하는 중입니다.");
    render();

    try {
      const result = await requestDesignChat(
        {
          selection: source.selection || state.selection,
          image: source.image,
          question,
          history,
        },
        controller.signal,
        (partialText) => {
          if (!state.activeRun || state.activeRun.id !== runId) {
            return;
          }
          const answer = extractStreamingAnswer(partialText);
          updateLiveAssistantMessage({
            summary: "응답 작성 중",
            content: answer,
            annotationRequested,
          });
          renderThread();
          syncControls();
        },
        (providerInfo, index, candidatePlan) => {
          if (!state.activeRun || state.activeRun.id !== runId) {
            return;
          }
          updateLiveAssistantMessage({
            modelKey: providerInfo.modelKey || `${providerInfo.provider}:${providerInfo.model}`,
            modelLabel: providerInfo.displayLabel || getModelDisplayLabel(providerInfo.provider, providerInfo.model),
            routeReason:
              index === 0
                ? compactText(candidatePlan.routeInfo && candidatePlan.routeInfo.reason, true)
                : `${providerInfo.displayLabel || getModelDisplayLabel(providerInfo.provider, providerInfo.model)} 모델로 재시도 중입니다.`,
          });
          renderThread();
        },
        {
          selectedModelKey,
        }
      );

      if (!state.activeRun || state.activeRun.id !== runId) {
        return;
      }

      clearLiveAssistantMessage();
      const assistantMessage = appendCurrentMessage({
        id: buildId("assistant"),
        role: "assistant",
        summary: result.summary,
        content: result.answer,
        createdAt: Date.now(),
        modelKey: result.modelKey,
        modelLabel: result.modelLabel,
        routeReason: result.routeReason,
        annotationRequested: result.annotationRequested === true || annotationRequested,
        annotationText: result.annotation,
        annotationState: "idle",
        annotationNote: "",
        checklistItems: [],
        checklistState: "idle",
        checklistNote: "",
        followups: result.followups,
      });
      if (assistantMessage && (result.annotationRequested === true || annotationRequested)) {
        requestAnnotation(assistantMessage.id, {
          automatic: true,
        });
      } else {
        setStatus("ready", "AI 응답을 받았습니다.");
      }
    } catch (error) {
      if (!isAbortError(error)) {
        const partial =
          state.liveMessage && state.liveMessage.selectionSignature === state.selection.selectionSignature
            ? state.liveMessage.message
            : null;
        clearLiveAssistantMessage();
        if (partial && partial.content) {
          appendCurrentMessage({
            id: buildId("assistant"),
            role: "assistant",
            summary: "응답이 중단됨",
            content: partial.content,
            createdAt: partial.createdAt || Date.now(),
            modelKey: partial.modelKey,
            modelLabel: partial.modelLabel,
            routeReason: partial.routeReason,
            annotationRequested,
            annotationText: annotationRequested ? normalizeAnnotationText(partial.content) : "",
            annotationState: "error",
            annotationNote: "응답 중간까지의 내용만 임시로 보관했습니다.",
            checklistItems: [],
            checklistState: "idle",
            checklistNote: "",
            followups: [],
          });
        }
        const message = normalizeErrorMessage(error, "AI 응답을 생성하지 못했습니다.");
        setStatus("error", message);
        reportUiError(message);
      } else {
        clearLiveAssistantMessage();
      }
    } finally {
      if (state.activeRun && state.activeRun.id === runId) {
        state.activeRun = null;
      }
      render();
    }
  }

  function buildAnnotationText(message) {
    if (!message) {
      return "";
    }
    const explicitAnnotation = normalizeAnnotationText(message.annotationText);
    if (explicitAnnotation) {
      return explicitAnnotation;
    }
    if (message.annotationRequested === true) {
      return normalizeAnnotationText(message.summary || message.content);
    }
    return "";
  }

  function openPromptDraft(messageId) {
    const message = getCurrentMessages().find((entry) => entry && entry.id === messageId);
    const promptModal = window.__PIGMA_AI_IMAGE_PROMPT_MODAL__;
    if (!message) {
      return;
    }
    if (!promptModal || typeof promptModal.open !== "function") {
      setStatus("error", "프롬프트 편집기를 찾지 못했습니다.");
      return;
    }
    const question = getQuestionForAssistantMessage(messageId);
    const seed = buildPromptSeedFromMessage(message, question);
    promptModal.open({
      initialPrompt: seed,
    });
    setStatus("ready", "답변 내용을 이미지 프롬프트 초안으로 보냈습니다.");
  }

  async function requestChecklist(messageId) {
    const message = getCurrentMessages().find((entry) => entry && entry.id === messageId);
    if (!message) {
      return;
    }
    updateMessage(messageId, {
      checklistState: "generating",
      checklistNote: "답변을 작업 체크리스트로 정리하는 중입니다.",
    });
    render();

    const controller = new AbortController();
    try {
      const question = getQuestionForAssistantMessage(messageId);
      const result = await requestTextTask(
        buildChecklistInstruction({
          selection: state.selection,
          question,
          answer: message.content,
        }),
        {
          preferredModelKey: message.modelKey,
          preferredReason: message.modelLabel
            ? `${message.modelLabel} 모델로 체크리스트를 이어서 만듭니다.`
            : "방금 응답한 모델 우선으로 체크리스트를 만듭니다.",
        },
        controller.signal
      );
      const checklistItems = parseChecklistItems(result.text);
      if (!checklistItems.length) {
        throw new Error("체크리스트 항목을 만들지 못했습니다.");
      }
      updateMessage(messageId, {
        checklistItems,
        checklistState: "ready",
        checklistNote: `${checklistItems.length}개의 수정 체크리스트를 만들었습니다.`,
      });
      setStatus("ready", "수정 체크리스트를 만들었습니다.");
    } catch (error) {
      const messageText = normalizeErrorMessage(error, "체크리스트를 만들지 못했습니다.");
      updateMessage(messageId, {
        checklistState: "error",
        checklistNote: messageText,
      });
      setStatus("error", messageText);
    } finally {
      render();
    }
  }

  function requestAnnotation(messageId, options) {
    const nextOptions = options && typeof options === "object" ? options : {};
    const message = getCurrentMessages().find((entry) => entry && entry.id === messageId);
    if (!message || !state.selection.ready) {
      return false;
    }
    const annotationText = buildAnnotationText(message);
    if (!annotationText) {
      const errorMessage =
        nextOptions.automatic === true ? "AI가 붙일 주석 문구를 만들지 못했습니다." : "주석으로 남길 문구를 만들지 못했습니다.";
      updateMessage(messageId, {
        annotationState: "error",
        annotationNote: errorMessage,
      });
      setStatus("error", errorMessage);
      render();
      return false;
    }

    const requestId = buildId("design-chat-annotation");
    pendingAnnotationRequests.set(requestId, {
      requestId,
      messageId,
      selectionSignature: state.selection.selectionSignature,
    });
    updateMessage(messageId, {
      annotationState: "applying",
      annotationNote:
        nextOptions.automatic === true
          ? "AI 요청에 따라 현재 선택에 주석을 추가하는 중입니다."
          : "현재 선택에 주석을 추가하는 중입니다.",
    });
    render();

    postPluginMessage({
      type: "apply-ai-design-chat-annotation",
      clientRequestId: requestId,
      messageId,
      selectionSignature: state.selection.selectionSignature,
      annotationText,
    });
    return true;
  }

  function handleSourceReady(payload) {
    if (!state.pendingSource || payload.clientRequestId !== state.pendingSource.requestId) {
      return;
    }
    const expectedSignature = state.pendingSource.selectionSignature;
    const selection = normalizeSelection(payload.selection);
    const pending = state.pendingSource;
    state.pendingSource = null;
    state.sourcePromise = null;

    if (!selection.ready || (expectedSignature && selection.selectionSignature !== expectedSignature)) {
      pending.reject(new Error("선택이 바뀌어 이전 캡처를 사용하지 않았습니다."));
      return;
    }

    applySelection(selection);
    const source = normalizeSourcePayload(payload);
    state.source = source;
    setPreviewObjectUrl(source.previewUrl);
    pending.resolve(source);
    if (!state.activeRun) {
      setStatus("ready", "현재 선택 캡처를 준비했습니다.");
    }
    render();
  }

  function handleSourceError(payload) {
    if (!state.pendingSource || payload.clientRequestId !== state.pendingSource.requestId) {
      return;
    }
    const pending = state.pendingSource;
    state.pendingSource = null;
    state.sourcePromise = null;
    const message = normalizeErrorMessage(payload && payload.message, "선택 캡처를 준비하지 못했습니다.");
    pending.reject(new Error(message));
    if (!state.activeRun) {
      setStatus("error", message);
    }
    render();
  }

  function handleAnnotationResult(payload) {
    const request = pendingAnnotationRequests.get(payload.clientRequestId);
    if (!request) {
      return;
    }
    pendingAnnotationRequests.delete(payload.clientRequestId);
    updateMessage(request.messageId, {
      annotationState: "applied",
      annotationNote: `현재 선택에 주석 ${Math.max(1, Number(payload.annotationCount) || 1)}개를 남겼습니다.`,
    });
    setStatus("ready", "현재 선택에 주석을 남겼습니다.");
    render();
  }

  function handleAnnotationError(payload) {
    const request = pendingAnnotationRequests.get(payload.clientRequestId);
    if (!request) {
      return;
    }
    pendingAnnotationRequests.delete(payload.clientRequestId);
    const message = normalizeErrorMessage(payload && payload.message, "주석을 남기지 못했습니다.");
    updateMessage(request.messageId, {
      annotationState: "error",
      annotationNote: message,
    });
    setStatus("error", message);
    render();
  }

  function handlePluginMessage(event) {
    const payload =
      event && event.data && typeof event.data === "object"
        ? event.data.pluginMessage && typeof event.data.pluginMessage === "object"
          ? event.data.pluginMessage
          : event.data
        : null;
    if (!payload || typeof payload.type !== "string") {
      return;
    }

    if (payload.type === "ai-design-chat-selection") {
      applySelection(payload.selection);
      return;
    }

    if (payload.type === "ai-design-chat-source-ready") {
      handleSourceReady(payload);
      return;
    }

    if (payload.type === "ai-design-chat-source-error") {
      handleSourceError(payload);
      return;
    }

    if (payload.type === "ai-design-chat-annotation-result") {
      handleAnnotationResult(payload);
      return;
    }

    if (payload.type === "ai-design-chat-annotation-error") {
      handleAnnotationError(payload);
    }
  }

  elements.sendButton.addEventListener("click", () => {
    handleSend();
  });

  elements.refreshButton.addEventListener("click", () => {
    ensureSelectionSource(true).catch((error) => {
      if (!isAbortError(error)) {
        const message = normalizeErrorMessage(error, "선택 캡처를 다시 만들지 못했습니다.");
        setStatus("error", message);
        reportUiError(message);
      }
    });
  });

  elements.clearButton.addEventListener("click", () => {
    clearCurrentThread();
  });

  if (hasButton(elements.restartButton)) {
    elements.restartButton.addEventListener("click", () => {
      restartConversation();
    });
  }

  if (hasElement(elements.modelSelect)) {
    elements.modelSelect.addEventListener("change", () => {
      syncSelectedModelKeyFromControl();
      restartConversation({
        preserveNotice: true,
      });
      setStatus("ready", "모델이 바뀌어 현재 선택의 대화를 새로 시작했습니다.");
      renderModelSelect();
    });
  }

  if (hasElement(elements.modelSelect)) {
    elements.modelSelect.addEventListener("change", () => {
      setThreadNotice("모델이 바뀌어 현재 선택 기준의 대화를 새로 시작했습니다.", "ready");
      setStatus("ready", "모델이 바뀌어 현재 선택 기준의 대화를 새로 시작했습니다.");
      render();
    });
  }

  elements.input.addEventListener("input", () => {
    syncControls();
  });

  elements.input.addEventListener("keydown", (event) => {
    const inputTag = String(elements.input && elements.input.tagName ? elements.input.tagName : "").toUpperCase();
    const shouldSendFromSingleLine =
      inputTag === "INPUT" && event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey;
    const shouldSendFromTextarea =
      inputTag === "TEXTAREA" && event.key === "Enter" && (event.ctrlKey || event.metaKey) && !event.shiftKey;
    if (shouldSendFromSingleLine || shouldSendFromTextarea) {
      event.preventDefault();
      handleSend();
    }
  });

  elements.quickButtons.forEach((button) => {
    if (!hasButton(button)) {
      return;
    }
    button.addEventListener("click", () => {
      const template =
        typeof button.dataset.designChatTemplate === "string" && button.dataset.designChatTemplate.trim()
          ? button.dataset.designChatTemplate.trim()
          : "";
      if (!template) {
        return;
      }
      elements.input.value = template;
      elements.input.focus();
      syncControls();
    });
  });

  if (hasElement(aiTab)) {
    aiTab.addEventListener("click", () => {
      syncSelectionPolling();
      if (!isDesignChatTrackingEnabled()) {
        return;
      }
      requestSelectionSync();
      scheduleAutoCapture();
    });
    const observer = new MutationObserver(() => {
      syncSelectionPolling();
      if (isDesignChatTrackingEnabled()) {
        requestSelectionSync();
        scheduleAutoCapture();
      }
    });
    observer.observe(aiTab, {
      attributes: true,
      attributeFilter: ["aria-selected"],
    });
  }

  if (isDetailsElement(elements.group)) {
    elements.group.addEventListener("toggle", () => {
      syncSelectionPolling();
      if (isDesignChatTrackingEnabled()) {
        requestSelectionSync();
        scheduleAutoCapture();
        return;
      }
      clearAutoCaptureTimer();
    });
  }

  window.addEventListener("message", handlePluginMessage);
  window.addEventListener("pigma:debug-mode-changed", (event) => {
    state.debugModeEnabled = event && event.detail && event.detail.enabled === true;
    render();
  });
  window.addEventListener("pigma:ai-settings-changed", () => {
    renderModelSelect();
  });
  window.addEventListener("beforeunload", () => {
    if (state.selectionPollTimer) {
      window.clearInterval(state.selectionPollTimer);
      state.selectionPollTimer = 0;
    }
    clearAutoCaptureTimer();
    setPreviewObjectUrl("");
    clearLiveAssistantMessage();
  });

  setStatus("idle", "현재 선택 상태를 확인하는 중입니다.");
  render();
  syncSelectionPolling();
  if (isDesignChatTrackingEnabled()) {
    requestSelectionSync();
    scheduleAutoCapture();
  }

  window.__PIGMA_AI_DESIGN_CHAT_UI_LIVE__ = true;
  window.__PIGMA_AI_DESIGN_CHAT_UI__ = true;
})();
