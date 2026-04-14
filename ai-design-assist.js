;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_DESIGN_ASSIST_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const CACHE_KEY = "pigma:ai-design-assist-cache:v3";
  const CACHE_SCHEMA_VERSION = 1;
  const PATCH_VERSION = 3;
  const PLANNER_VERSION = "v2";
  const RENDERER_CONTRACT_VERSION = 2;
  const DESIGN_ASSIST_ENABLED = false;
  const DESIGN_ASSIST_DISABLED_MESSAGE = "디자인 어시스트는 360 변환 체인 정리 중이라 현재 비활성화되어 있습니다.";
  const DEFAULT_MOBILE_WIDTH = 360;
  const DEFAULT_DESKTOP_WIDTH = 1920;
  const MOBILE_TOUCH_TARGET_MIN = 44;
  const MOBILE_DEVICE_PROFILES = [
    {
      key: "compact-360",
      label: "Compact 360",
      width: 360,
      safeAreaTop: 0,
      safeAreaRight: 16,
      safeAreaBottom: 24,
      safeAreaLeft: 16,
    },
    {
      key: "phone-390",
      label: "Phone 390",
      width: 390,
      safeAreaTop: 0,
      safeAreaRight: 16,
      safeAreaBottom: 24,
      safeAreaLeft: 16,
    },
    {
      key: "phone-393",
      label: "Phone 393",
      width: 393,
      safeAreaTop: 0,
      safeAreaRight: 16,
      safeAreaBottom: 24,
      safeAreaLeft: 16,
    },
  ];
  const MAX_SIMILAR_PAIRS = 3;
  const MAX_RULES = 6;
  const DRAFT_SPACING = 160;
  const MOBILE_PLANNING_MODE = "ai-plan-renderer";
  let activeExecution = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (!DESIGN_ASSIST_ENABLED && isDesignAssistMessage(message)) {
      await handleDisabledDesignAssistMessage(message);
      return;
    }

    if (message && message.type === "request-ai-design-assist-cache") {
      await postCache();
      return;
    }

    if (message && message.type === "run-ai-design-assist") {
      if (activeExecution) {
        postStatus("running", "???????????????????濡?씀?濾?????????????嚥???癲????????????? ???? ???????? ??????????野껊챶??????????????????????????????살몝??");
        return;
      }

      activeExecution = true;
      try {
        await runDesignAssist(message);
      } finally {
        activeExecution = false;
      }
      return;
    }

    if (message && message.type === "create-ai-design-assist-draft") {
      if (activeExecution) {
        postStatus("running", "???????????????????濡?씀?濾?????????????嚥???癲????????????? ???? ???????? ??????????野껊챶??????????????????????????????살몝??");
        return;
      }

      activeExecution = true;
      try {
        await createResponsiveDesignAssistDraft(message);
      } finally {
        activeExecution = false;
      }
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_DESIGN_ASSIST_PATCH__ = true;

  if (!DESIGN_ASSIST_ENABLED) {
    return;
  }

  function isDesignAssistMessage(message) {
    if (!message || typeof message.type !== "string") {
      return false;
    }

    return (
      message.type === "request-ai-design-assist-cache" ||
      message.type === "run-ai-design-assist" ||
      message.type === "create-ai-design-assist-draft"
    );
  }

  async function handleDisabledDesignAssistMessage(message) {
    const cacheMeta = {
      status: "disabled",
      label: "Disabled",
      disabled: true,
    };

    if (message && message.type === "request-ai-design-assist-cache") {
      figma.ui.postMessage({
        type: "ai-design-assist-cache",
        result: null,
        cacheMeta,
        matchesCurrentSelection: true,
      });
      return;
    }

    figma.ui.postMessage({
      type: "ai-design-assist-error",
      message: DESIGN_ASSIST_DISABLED_MESSAGE,
      cacheMeta,
      matchesCurrentSelection: true,
    });
    figma.notify(DESIGN_ASSIST_DISABLED_MESSAGE, { error: true, timeout: 2200 });
  }

  async function runDesignAssist(message) {
    const action = message && message.action === "pc-design" ? "pc-design" : "mobile-design";
    const requestedTargetWidth = resolveAssistTargetWidth(action, message && message.targetWidth);
    const selectionSignature = getSelectionSignature(figma.currentPage.selection);
    postStatus("running", action === "pc-design" ? "?????????????????????????PC ????????????????????????關?쒎첎?嫄??????????꿔꺂???⑸븶?????????猷몄굣?????????????????野껊챶??????????????????????????????살몝??" : "?????????????????????????MO ????????????????????????關?쒎첎?嫄??????????꿔꺂???⑸븶?????????猷몄굣?????????????????野껊챶??????????????????????????????살몝??");

    try {
      const cachedEnvelope = await readAssistCacheEnvelope();
      postAssistPhaseStatus(action, "analyzing");
      let localResult = getReusableCachedAnalysis(cachedEnvelope, action, selectionSignature, requestedTargetWidth);
      if (!localResult) {
        localResult = analyzeSelection(action, requestedTargetWidth);
      }
      const memoryStore = await readResponsiveMemoryStoreSafe();
      const currentMemoryRevision = string(memoryStore && memoryStore.revision, "");
      postAssistPhaseStatus(action, "retrieving-memory");
      let memoryContext = getReusableCachedMemoryContext(
        cachedEnvelope,
        action,
        selectionSignature,
        requestedTargetWidth,
        currentMemoryRevision
      );
      if (!memoryContext) {
        memoryContext = await readResponsiveMemoryContext(localResult, action, memoryStore);
      }
      const cacheInspection = inspectRequestAssistCacheEntry(
        cachedEnvelope,
        action,
        selectionSignature,
        requestedTargetWidth,
        memoryContext.memoryRevision,
        memoryContext.retrievalFingerprint
      );
      let result = cacheInspection.result;
      let cacheMeta = cacheInspection.cacheMeta;
      if (!result) {
        postAssistPhaseStatus(action, "planning");
        result = await buildAssistResult(localResult, memoryContext, action);
        cacheMeta = createFreshAssistCacheMeta(cacheInspection.cacheMeta);
      } else {
        postAssistPhaseStatus(action, "ready-to-render");
      }
      await writeAssistCache(localResult, memoryContext, result);
      figma.ui.postMessage({
        type: "ai-design-assist-result",
        result: result,
        cacheMeta: cacheMeta,
        matchesCurrentSelection: result.selectionSignature === getSelectionSignature(figma.currentPage.selection),
      });
      figma.notify(action === "pc-design" ? "PC design assist complete" : "MO design assist complete", { timeout: 1600 });
    } catch (error) {
      const messageText = normalizeError(error, "???????????????????濡?씀?濾?????????????嚥???癲??????????????????????????곕춴?????????????????????살몝??");
      figma.ui.postMessage({
        type: "ai-design-assist-error",
        message: messageText,
        matchesCurrentSelection: selectionSignature === getSelectionSignature(figma.currentPage.selection),
      });
      figma.notify(messageText, { error: true, timeout: 2200 });
    }
  }

  async function createDesignAssistDraft(message) {
    const action = message && message.action === "pc-design" ? "pc-design" : "mobile-design";
    const requestedTargetWidth = resolveAssistTargetWidth(action, message && message.targetWidth);
    if (action !== "mobile-design") {
      throw new Error("??????????諛몃마嶺뚮?????????????硫λ젒???PC -> MO ??????????????????諛몃마嶺뚮?????????????硫λ젒???????????熬곣뫖利당춯??쎾퐲??????????????????????紐????????椰????????????????⑥レ뿥????????????????????살몝??");
    }

    const selectionSignature = getSelectionSignature(figma.currentPage.selection);
    postStatus("running", "PC -> MO ??????????????????諛몃마嶺뚮?????????????硫λ젒???????????諛몃마嶺뚮?????????????硫λ젒?????????????熬곣뫖利당춯??쎾퐲?????????????????꿔꺂???⑸븶?????????猷몄굣?????????????????野껊챶??????????????????????????????살몝??");

    try {
      const root = getSingleSelectedRootNode();
      const localResult = analyzeSelection(action, requestedTargetWidth);
      const memoryContext = await readResponsiveMemoryContext(localResult, action);
      const cacheInspection = await inspectAssistCache(action, selectionSignature, requestedTargetWidth, memoryContext.memoryRevision);
      let result = cacheInspection.result;
      let cacheMeta = cacheInspection.cacheMeta;
      if (!result) {
        result = await buildAssistResult(localResult, memoryContext, action);
        cacheMeta = createFreshAssistCacheMeta(cacheInspection.cacheMeta);
      }
      ensureRequiredAiPlanningResult(result, action);

      const draft = await createMobileDraftFromSelection(root, result, localResult);
      result.draft = draft;
      result.analyzedAt = new Date().toISOString();
      result.insights = buildInsights(result);
      await writeAssistCache(localResult, memoryContext, result);
      figma.ui.postMessage({
        type: "ai-design-assist-result",
        result: result,
        cacheMeta: cacheMeta,
        matchesCurrentSelection: selectionSignature === getSelectionSignature(figma.currentPage.selection),
      });

      const draftNode = draft && draft.nodeId ? await figma.getNodeByIdAsync(draft.nodeId) : null;
      if (draftNode) {
        figma.viewport.scrollAndZoomIntoView([root, draftNode]);
      }

      figma.notify("MO ??????????????????諛몃마嶺뚮?????????????硫λ젒???????????諛몃마嶺뚮?????????????硫λ젒?????????????熬곣뫖利당춯??쎾퐲?????????????????????????????살몝??", { timeout: 1800 });
    } catch (error) {
      const messageText = normalizeError(error, "MO ??????????????????諛몃마嶺뚮?????????????硫λ젒???????????諛몃마嶺뚮?????????????硫λ젒?????????????熬곣뫖利당춯??쎾퐲????????????? ??????椰????????????????????");
      figma.ui.postMessage({
        type: "ai-design-assist-error",
        message: messageText,
        matchesCurrentSelection: selectionSignature === getSelectionSignature(figma.currentPage.selection),
      });
      figma.notify(messageText, { error: true, timeout: 2200 });
    }
  }

  async function postCache() {
    let currentMemoryRevision = "";
    try {
      const helper = globalScope.__PIGMA_RESPONSIVE_MEMORY__;
      if (helper && typeof helper.readStoreAsync === "function") {
        const store = await helper.readStoreAsync();
        currentMemoryRevision = string(store && store.revision, "");
      }
    } catch (error) {
      currentMemoryRevision = "";
    }
    const inspection = await inspectStoredAssistCache(currentMemoryRevision);

    figma.ui.postMessage({
      type: "ai-design-assist-cache",
      result: inspection.result,
      cacheMeta: inspection.cacheMeta,
      matchesCurrentSelection:
        !!inspection.result && inspection.result.selectionSignature === getSelectionSignature(figma.currentPage.selection),
    });
  }

  function createAssistCacheMeta(status, label, reason) {
    return {
      status: string(status, "unknown"),
      label: string(label, ""),
      reason: string(reason, ""),
    };
  }

  function cloneAssistCachePayload(value) {
    if (value === null || typeof value !== "object") {
      return value;
    }

    try {
      return JSON.parse(JSON.stringify(value));
    } catch (error) {
      return null;
    }
  }

  function createEmptyAssistCacheEnvelope() {
    return {
      schemaVersion: CACHE_SCHEMA_VERSION,
      analysisCache: null,
      memoryContextCache: null,
      planCache: null,
      renderSummaryCache: null,
    };
  }

  function buildAnalysisCacheRecord(localResult, action) {
    if (!localResult || typeof localResult !== "object") {
      return null;
    }

    return {
      action: action,
      selectionSignature: string(localResult.selectionSignature, ""),
      targetWidth: Math.max(0, Math.round(numeric(localResult.targetWidth))),
      storedAt: new Date().toISOString(),
      result: cloneAssistCachePayload(localResult),
    };
  }

  function buildMemoryContextCacheRecord(localResult, memoryContext, action) {
    if (!memoryContext || typeof memoryContext !== "object") {
      return null;
    }

    return {
      action: action,
      selectionSignature: string(localResult && localResult.selectionSignature, ""),
      targetWidth: Math.max(0, Math.round(numeric(localResult && localResult.targetWidth))),
      memoryRevision: string(memoryContext.memoryRevision, ""),
      retrievalFingerprint: string(memoryContext.retrievalFingerprint, ""),
      storedAt: new Date().toISOString(),
      context: cloneAssistCachePayload(memoryContext),
    };
  }

  function buildPlanCacheRecord(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    const nextResult = cloneAssistCachePayload(result);
    if (!nextResult || typeof nextResult !== "object") {
      return null;
    }
    delete nextResult.draft;

    return {
      action: string(result.action, ""),
      selectionSignature: string(result.selectionSignature, ""),
      targetWidth: Math.max(0, Math.round(numeric(result.targetWidth))),
      plannerVersion: string(result.plannerVersion, ""),
      memoryRevision: string(result.memoryRevision, ""),
      retrievalFingerprint: string(result.retrievalFingerprint, ""),
      storedAt: new Date().toISOString(),
      result: nextResult,
    };
  }

  function buildRenderSummaryCacheRecord(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    return {
      action: string(result.action, ""),
      selectionSignature: string(result.selectionSignature, ""),
      targetWidth: Math.max(0, Math.round(numeric(result.targetWidth))),
      plannerVersion: string(result.plannerVersion, ""),
      memoryRevision: string(result.memoryRevision, ""),
      retrievalFingerprint: string(result.retrievalFingerprint, ""),
      storedAt: new Date().toISOString(),
      analyzedAt: string(result.analyzedAt, ""),
      draft: cloneAssistCachePayload(result.draft),
      insights: cloneAssistCachePayload(result.insights),
    };
  }

  function buildAssistCacheEnvelope(localResult, memoryContext, result) {
    return {
      schemaVersion: CACHE_SCHEMA_VERSION,
      analysisCache: buildAnalysisCacheRecord(localResult, result && result.action ? result.action : "mobile-design"),
      memoryContextCache: buildMemoryContextCacheRecord(localResult, memoryContext, result && result.action ? result.action : "mobile-design"),
      planCache: buildPlanCacheRecord(result),
      renderSummaryCache: buildRenderSummaryCacheRecord(result),
    };
  }

  function buildLegacyAssistCacheEnvelope(result) {
    const envelope = createEmptyAssistCacheEnvelope();
    envelope.planCache = buildPlanCacheRecord(result);
    envelope.renderSummaryCache = buildRenderSummaryCacheRecord(result);
    return envelope;
  }

  function normalizeAssistCacheEnvelope(value) {
    if (!value || typeof value !== "object") {
      return createEmptyAssistCacheEnvelope();
    }

    if (
      numeric(value.schemaVersion) === CACHE_SCHEMA_VERSION &&
      (Object.prototype.hasOwnProperty.call(value, "planCache") ||
        Object.prototype.hasOwnProperty.call(value, "analysisCache") ||
        Object.prototype.hasOwnProperty.call(value, "memoryContextCache") ||
        Object.prototype.hasOwnProperty.call(value, "renderSummaryCache"))
    ) {
      return {
        schemaVersion: CACHE_SCHEMA_VERSION,
        analysisCache: value.analysisCache && typeof value.analysisCache === "object" ? value.analysisCache : null,
        memoryContextCache: value.memoryContextCache && typeof value.memoryContextCache === "object" ? value.memoryContextCache : null,
        planCache: value.planCache && typeof value.planCache === "object" ? value.planCache : null,
        renderSummaryCache: value.renderSummaryCache && typeof value.renderSummaryCache === "object" ? value.renderSummaryCache : null,
      };
    }

    return buildLegacyAssistCacheEnvelope(value);
  }

  function buildCachedAssistResult(cached) {
    const envelope = normalizeAssistCacheEnvelope(cached);
    const planCache = envelope.planCache && typeof envelope.planCache === "object" ? envelope.planCache : null;
    const renderSummaryCache =
      envelope.renderSummaryCache && typeof envelope.renderSummaryCache === "object" ? envelope.renderSummaryCache : null;
    const result = cloneAssistCachePayload(planCache && planCache.result);
    if (!result || typeof result !== "object") {
      return null;
    }

    if (renderSummaryCache) {
      if (Object.prototype.hasOwnProperty.call(renderSummaryCache, "draft")) {
        result.draft = cloneAssistCachePayload(renderSummaryCache.draft);
      }
      if (Object.prototype.hasOwnProperty.call(renderSummaryCache, "insights")) {
        result.insights = cloneAssistCachePayload(renderSummaryCache.insights);
      }
      if (string(renderSummaryCache.analyzedAt, "")) {
        result.analyzedAt = string(renderSummaryCache.analyzedAt, "");
      }
    }

    return result;
  }

  function matchesAssistCacheIdentity(record, action, selectionSignature, requestedTargetWidth) {
    if (!record || typeof record !== "object") {
      return false;
    }
    if (string(record.action, "") !== string(action, "")) {
      return false;
    }
    if (string(record.selectionSignature, "") !== string(selectionSignature, "")) {
      return false;
    }
    if (Math.max(0, Math.round(numeric(record.targetWidth))) !== resolveAssistTargetWidth(action, requestedTargetWidth)) {
      return false;
    }
    return true;
  }

  function getReusableCachedAnalysis(cached, action, selectionSignature, requestedTargetWidth) {
    const envelope = normalizeAssistCacheEnvelope(cached);
    const record = envelope.analysisCache;
    if (!matchesAssistCacheIdentity(record, action, selectionSignature, requestedTargetWidth)) {
      return null;
    }
    return cloneAssistCachePayload(record && record.result);
  }

  function getReusableCachedMemoryContext(cached, action, selectionSignature, requestedTargetWidth, currentMemoryRevision) {
    const envelope = normalizeAssistCacheEnvelope(cached);
    const record = envelope.memoryContextCache;
    if (!matchesAssistCacheIdentity(record, action, selectionSignature, requestedTargetWidth)) {
      return null;
    }
    if (string(currentMemoryRevision, "") && string(record && record.memoryRevision, "") !== string(currentMemoryRevision, "")) {
      return null;
    }
    return cloneAssistCachePayload(record && record.context);
  }

  async function readAssistCacheEnvelope() {
    try {
      return normalizeAssistCacheEnvelope(await figma.clientStorage.getAsync(CACHE_KEY));
    } catch (error) {
      return createEmptyAssistCacheEnvelope();
    }
  }

  async function writeAssistCache(localResult, memoryContext, result) {
    await figma.clientStorage.setAsync(CACHE_KEY, buildAssistCacheEnvelope(localResult, memoryContext, result));
  }

  function inspectStoredAssistCacheEntry(cached, currentMemoryRevision) {
    const result = buildCachedAssistResult(cached);
    if (!result || typeof result !== "object") {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("empty", "No cached plan", "empty"),
      };
    }
    if (numeric(result.version) !== PATCH_VERSION) {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("invalidated", "Invalidated by planner update", "patch-version-mismatch"),
      };
    }
    if (
      string(result.memoryRevision, "") &&
      currentMemoryRevision &&
      string(result.memoryRevision, "") !== currentMemoryRevision
    ) {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("invalidated", "Invalidated by memory update", "memory-revision-mismatch"),
      };
    }
    return {
      result: result,
      cacheMeta: createAssistCacheMeta("stored", "Stored cached plan", "stored"),
    };
  }

  function inspectRequestAssistCacheEntry(
    cached,
    action,
    selectionSignature,
    requestedTargetWidth,
    currentMemoryRevision,
    currentRetrievalFingerprint
  ) {
    const result = buildCachedAssistResult(cached);
    if (!result || typeof result !== "object") {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("empty", "No cached plan", "empty"),
      };
    }
    if (numeric(result.version) !== PATCH_VERSION) {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("invalidated", "Invalidated by planner update", "patch-version-mismatch"),
      };
    }
    if (result.action !== action) {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("invalidated", "Invalidated by mode change", "action-mismatch"),
      };
    }
    if (result.selectionSignature !== selectionSignature) {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("invalidated", "Invalidated by selection change", "selection-mismatch"),
      };
    }
    if (string(currentMemoryRevision, "") && string(result.memoryRevision, "") !== string(currentMemoryRevision, "")) {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("invalidated", "Invalidated by memory update", "memory-revision-mismatch"),
      };
    }
    if (
      string(currentRetrievalFingerprint, "") &&
      string(result.retrievalFingerprint, "") &&
      string(result.retrievalFingerprint, "") !== string(currentRetrievalFingerprint, "")
    ) {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("invalidated", "Invalidated by retrieval change", "retrieval-fingerprint-mismatch"),
      };
    }
    if (requiresAiPlanningForAction(action) && numeric(result.targetWidth) !== resolveAssistTargetWidth(action, requestedTargetWidth)) {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("invalidated", "Invalidated by width change", "target-width-mismatch"),
      };
    }
    if (requiresAiPlanningForAction(action) && string(result.plannerVersion, "") !== PLANNER_VERSION) {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("invalidated", "Invalidated by planner update", "planner-version-mismatch"),
      };
    }
    if (requiresAiPlanningForAction(action) && !hasUsableAiPlanningResult(result)) {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("invalidated", "Invalidated incomplete cached plan", "incomplete-plan"),
      };
    }
    return {
      result: result,
      cacheMeta: createAssistCacheMeta("reused", "Reused cached plan", "reused"),
    };
  }

  function createFreshAssistCacheMeta(previousMeta) {
    const reason = string(previousMeta && previousMeta.reason, "");
    switch (reason) {
      case "memory-revision-mismatch":
        return createAssistCacheMeta("fresh", "Fresh plan after memory update", reason);
      case "target-width-mismatch":
        return createAssistCacheMeta("fresh", "Fresh plan for selected width", reason);
      case "selection-mismatch":
        return createAssistCacheMeta("fresh", "Fresh plan for current selection", reason);
      case "action-mismatch":
        return createAssistCacheMeta("fresh", "Fresh plan for current mode", reason);
      case "patch-version-mismatch":
      case "planner-version-mismatch":
        return createAssistCacheMeta("fresh", "Fresh plan after planner update", reason);
      case "retrieval-fingerprint-mismatch":
        return createAssistCacheMeta("fresh", "Fresh plan for updated retrieval evidence", reason);
      default:
        return createAssistCacheMeta("fresh", "Fresh plan generated", reason || "fresh");
    }
  }

  async function inspectStoredAssistCache(currentMemoryRevision) {
    try {
      const cached = await readAssistCacheEnvelope();
      return inspectStoredAssistCacheEntry(cached, currentMemoryRevision);
    } catch (error) {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("empty", "No cached plan", "storage-error"),
      };
    }
  }

  async function inspectAssistCache(action, selectionSignature, requestedTargetWidth, currentMemoryRevision, currentRetrievalFingerprint) {
    try {
      const cached = await readAssistCacheEnvelope();
      return inspectRequestAssistCacheEntry(
        cached,
        action,
        selectionSignature,
        requestedTargetWidth,
        currentMemoryRevision,
        currentRetrievalFingerprint
      );
    } catch (error) {
      return {
        result: null,
        cacheMeta: createAssistCacheMeta("empty", "No cached plan", "storage-error"),
      };
    }
  }

  async function readCachedResult(action, selectionSignature, requestedTargetWidth, currentMemoryRevision, currentRetrievalFingerprint) {
    const inspection = await inspectAssistCache(
      action,
      selectionSignature,
      requestedTargetWidth,
      currentMemoryRevision,
      currentRetrievalFingerprint
    );
    return inspection.result;
  }

  function getSingleSelectedRootNode() {
    const selection = Array.from(figma.currentPage.selection || []).filter(Boolean);
    if (selection.length !== 1) {
      throw new Error("MO ????????????????熬곣뫖利당춯??쎾퐲???????????? ???????猷멥럸????壤굿?袁り턁??????????????諛몃마嶺뚮?????????????硫λ젒???1???????????? ??????????????????????????????????????????????????????????????????????????살몝??");
    }
    return selection[0];
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-design-assist-status",
      status: status,
      message: sanitizeUserFacingText(message, "디자인 어시스트를 실행 중입니다."),
    });
  }

  function postAssistPhaseStatus(action, phase) {
    const mobile = action !== "pc-design";
    let message = "";

    switch (phase) {
      case "analyzing":
        message = mobile ? "Analyzing the selected PC frame for a mobile draft..." : "Analyzing the selected mobile frame for a desktop draft...";
        break;
      case "retrieving-memory":
        message = "Retrieving responsive memory and learned layout evidence...";
        break;
      case "planning":
        message = mobile ? "Requesting one AI section plan for the mobile rebuild..." : "Preparing the draft plan from the current evidence...";
        break;
      case "validating-plan":
        message = "Validating the section plan and repairing unsupported parts in code...";
        break;
      case "ready-to-render":
        message = mobile ? "Reusing the cached mobile section plan for draft rendering..." : "Reusing the cached desktop plan for draft rendering...";
        break;
      case "rendering":
        message = mobile ? "Rendering the mobile draft from the validated section plan..." : "Rendering the desktop draft from the validated plan...";
        break;
      default:
        message = mobile ? "Preparing the mobile draft..." : "Preparing the desktop draft...";
        break;
    }

    postStatus("running", message);
  }

  function resolveAssistTargetWidth(action, requestedTargetWidth) {
    if (action === "pc-design") {
      return DEFAULT_DESKTOP_WIDTH;
    }

    const width = Math.round(numeric(requestedTargetWidth));
    if (width === 390 || width === 393) {
      return width;
    }
    return DEFAULT_MOBILE_WIDTH;
  }

  function analyzeSelection(action, requestedTargetWidth) {
    const selection = Array.from(figma.currentPage.selection || []).filter(Boolean);
    if (selection.length !== 1) {
      throw new Error("???????????????????濡?씀?濾?????????????嚥???癲???????????猷멥럸????壤굿?袁り턁??????????????諛몃마嶺뚮?????????????硫λ젒???1???????????? ???????????????????????????????????????????????????썹땟戮녹??諭???????????");
    }

    const root = selection[0];
    const type = String(root.type || "");
    const targetWidth = resolveAssistTargetWidth(action, requestedTargetWidth);
    if (["FRAME", "GROUP", "SECTION", "COMPONENT", "COMPONENT_SET", "INSTANCE"].indexOf(type) < 0) {
      throw new Error("??????????諛몃마嶺뚮?????????????硫λ젒??? ????????????????????????? ?????? ??????????????????됰뼸??? ???????嫄???????????????????濡?씀?濾?????????????꿔꺂???⑸븶??????遺얘턁???????????????????????????????????썹땟戮녹??諭???????????");
    }

    const bounds = getNodeBounds(root);
    if (!bounds) {
      throw new Error("???????????????????????猷멥럸????壤굿?袁り턁??????????????????????????????? ??????椰????????????????????");
    }

    const stack = [{ node: root, depth: 1 }];
    const stats = {
      totalNodes: 0,
      textNodeCount: 0,
      autoLayoutCount: 0,
      sectionCount: 0,
      imageFillCount: 0,
      maxDepth: 0,
    };
    const textSamples = [];
    const childNames = [];
    const tokenSet = {};

    if (Array.isArray(root.children)) {
      for (let index = 0; index < root.children.length && childNames.length < 8; index += 1) {
        childNames.push(safeName(root.children[index]));
      }
    }

    addTokens(tokenSet, safeName(root));

    while (stack.length > 0) {
      const current = stack.pop();
      const node = current.node;
      const depth = current.depth;
      const currentType = String(node.type || "UNKNOWN");
      stats.totalNodes += 1;
      if (depth > stats.maxDepth) {
        stats.maxDepth = depth;
      }
      if (currentType === "TEXT") {
        stats.textNodeCount += 1;
        if (typeof node.characters === "string" && node.characters.trim()) {
          const sample = node.characters.trim();
          if (textSamples.length < 4) {
            textSamples.push(sample.length > 48 ? `${sample.slice(0, 45)}...` : sample);
          }
          addTokens(tokenSet, sample);
        }
      }
      if (currentType === "SECTION") {
        stats.sectionCount += 1;
      }
      if (typeof node.layoutMode === "string" && node.layoutMode && node.layoutMode !== "NONE") {
        stats.autoLayoutCount += 1;
      }
      if (Array.isArray(node.fills)) {
        for (let fillIndex = 0; fillIndex < node.fills.length; fillIndex += 1) {
          const fill = node.fills[fillIndex];
          if (fill && fill.visible !== false && fill.type === "IMAGE") {
            stats.imageFillCount += 1;
          }
        }
      }
      if (Array.isArray(node.children)) {
        for (let childIndex = node.children.length - 1; childIndex >= 0; childIndex -= 1) {
          stack.push({ node: node.children[childIndex], depth: depth + 1 });
        }
      }
    }

    return {
      version: PATCH_VERSION,
      analyzedAt: new Date().toISOString(),
      action: action,
      selectionSignature: getSelectionSignature(selection),
      selection: {
        id: root.id,
        name: safeName(root),
        type: type,
        width: round(bounds.width),
        height: round(bounds.height),
      },
      targetWidth: targetWidth,
      summary: {
        actionLabel: action === "pc-design" ? "MO to PC design" : "PC to MO design",
        targetLabel: action === "pc-design" ? `${DEFAULT_DESKTOP_WIDTH}px PC` : `${targetWidth}px MO`,
        sourceLabel: action === "pc-design" ? "PC expand" : "MO compact",
        contextLabel: inferContext(safeName(root), textSamples, stats),
        layoutLabel: buildLayoutLabel(root, stats),
      },
      stats: stats,
      textSamples: textSamples,
      childNames: childNames,
      tokens: Object.keys(tokenSet),
      layout: buildLayoutSnapshot(root),
      sections: collectSelectionSectionProfiles(root),
    };
  }

  async function readResponsiveMemoryStoreSafe() {
    const helper = globalScope.__PIGMA_RESPONSIVE_MEMORY__;
    if (!helper || typeof helper.readStoreAsync !== "function") {
      return null;
    }

    try {
      return await helper.readStoreAsync();
    } catch (error) {
      return null;
    }
  }

  function updateAssistFingerprintHash(seed, text) {
    let hash = seed >>> 0;
    const source = String(text || "");
    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash >>> 0;
  }

  function buildMemoryRetrievalFingerprint(localResult, action, memoryContext) {
    const sourceSections = Array.isArray(localResult && localResult.sections) ? localResult.sections : [];
    const similarPairs = memoryContext && Array.isArray(memoryContext.similarPairs) ? memoryContext.similarPairs : [];
    const sectionExamples =
      memoryContext && Array.isArray(memoryContext.relevantSectionExamples) ? memoryContext.relevantSectionExamples : [];
    const repeatedRules = memoryContext && Array.isArray(memoryContext.repeatedRules) ? memoryContext.repeatedRules : [];
    const pairRuleReferences = memoryContext && Array.isArray(memoryContext.pairRuleReferences) ? memoryContext.pairRuleReferences : [];
    let hash = 2166136261;

    const parts = [
      string(action, ""),
      String(Math.max(0, Math.round(numeric(localResult && localResult.targetWidth)))),
      string(memoryContext && memoryContext.memoryRevision, ""),
      String(sourceSections.length),
      String(similarPairs.length),
      String(sectionExamples.length),
      String(repeatedRules.length),
      String(pairRuleReferences.length),
    ];

    for (let index = 0; index < parts.length; index += 1) {
      hash = updateAssistFingerprintHash(hash, parts[index]);
    }

    for (let index = 0; index < similarPairs.length; index += 1) {
      const pair = similarPairs[index];
      hash = updateAssistFingerprintHash(
        hash,
        `${string(pair && pair.pairId, "")}:${Math.round(numeric(pair && pair.score) * 100)}:${string(pair && pair.label, "")}`
      );
    }

    for (let index = 0; index < sectionExamples.length; index += 1) {
      const example = sectionExamples[index];
      hash = updateAssistFingerprintHash(
        hash,
        `${string(example && example.id, "")}:${string(example && example.sectionType, "")}:${string(example && example.matchSource, "")}`
      );
    }

    for (let index = 0; index < repeatedRules.length; index += 1) {
      const rule = repeatedRules[index];
      hash = updateAssistFingerprintHash(hash, `${string(rule && rule.summary, "")}:${numeric(rule && rule.supportCount)}`);
    }

    for (let index = 0; index < pairRuleReferences.length; index += 1) {
      hash = updateAssistFingerprintHash(hash, pairRuleReferences[index]);
    }

    return `rf-${String(hash >>> 0).toString(36)}`;
  }

  async function readResponsiveMemoryContext(localResult, action, storeOverride) {
    const store = storeOverride || (await readResponsiveMemoryStoreSafe());
    if (!store) {
      return emptyMemoryContext();
    }

    const records = store && Array.isArray(store.records) ? store.records : [];
    if (!records.length) {
      const empty = emptyMemoryContext();
      empty.memoryRevision = string(store && store.revision, "");
      empty.memoryUpdatedAt = string(store && store.updatedAt, "");
      empty.retrievalFingerprint = buildMemoryRetrievalFingerprint(localResult, action, empty);
      return empty;
    }

    const pairById = {};
    const summaryByPairId = {};
    const rulesByPairId = {};
    const sectionExamples = [];
    const aggregate = [];
    const textRoleProfiles = [];
    const frameShapeProfiles = [];
    const containerProfiles = [];
    const desiredDirection = action === "pc-design" ? "mo-to-pc" : "pc-to-mo";

    for (let index = 0; index < records.length; index += 1) {
      const record = records[index];
      if (!record || typeof record !== "object") {
        continue;
      }
      if (record.type === "pair" && typeof record.id === "string") {
        pairById[record.id] = record;
      } else if (record.type === "summary" && typeof record.pairId === "string") {
        summaryByPairId[record.pairId] = record;
      } else if (record.type === "rule" && typeof record.pairId === "string") {
        if (!rulesByPairId[record.pairId]) {
          rulesByPairId[record.pairId] = [];
        }
        rulesByPairId[record.pairId].push(record);
      } else if (record.type === "section-example") {
        sectionExamples.push(record);
      } else if (record.type === "aggregate-rule") {
        aggregate.push(record);
      } else if (record.type === "text-role-profile") {
        const direction = string(record.direction, "pc-to-mo");
        if (direction === desiredDirection) {
          textRoleProfiles.push(record);
        }
      } else if (record.type === "frame-shape-profile") {
        const direction = string(record.direction, "pc-to-mo");
        if (direction === desiredDirection) {
          frameShapeProfiles.push(record);
        }
      } else if (record.type === "container-profile") {
        const direction = string(record.direction, "pc-to-mo");
        if (direction === desiredDirection) {
          containerProfiles.push(record);
        }
      }
    }

    const similarPairs = [];
    Object.keys(pairById).forEach((pairId) => {
      const pairRecord = pairById[pairId];
      const summaryRecord = summaryByPairId[pairId];
      const similarity = scorePair(localResult, pairRecord, summaryRecord, action);
      if (similarity.score <= 0) {
        return;
      }
      similarPairs.push({
        pairId: pairId,
        label: buildPairLabel(pairRecord),
        score: similarity.score,
        reason: similarity.reason,
        matchCount: summaryRecord && summaryRecord.stats ? numeric(summaryRecord.stats.matchedNodeCount) : 0,
        ruleCount: summaryRecord && summaryRecord.stats ? numeric(summaryRecord.stats.ruleCount) : 0,
        rules: summarizePairRules(rulesByPairId[pairId], action),
      });
    });

    similarPairs.sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (right.ruleCount !== left.ruleCount) {
        return right.ruleCount - left.ruleCount;
      }
      return right.matchCount - left.matchCount;
    });

    const repeatedRules = [];
    const highConfidenceRules = [];
    for (let index = 0; index < aggregate.length; index += 1) {
      const record = aggregate[index];
      const summary = adaptRuleSummary(record.summary, action);
      if (!summary) {
        continue;
      }
      if (numeric(record.supportCount) >= 2) {
        repeatedRules.push({
          summary: summary,
          ruleType: string(record.ruleType, ""),
          scope: string(record.scope, ""),
          supportCount: numeric(record.supportCount),
          avgConfidence: round(numeric(record.avgConfidence)),
        });
      }
      if (isHighConfidenceMemoryRuleRecord(record)) {
        highConfidenceRules.push({
          summary: summary,
          ruleType: string(record.ruleType, ""),
          scope: string(record.scope, ""),
          supportCount: numeric(record.supportCount),
          avgConfidence: round(numeric(record.avgConfidence)),
        });
      }
    }

    repeatedRules.sort(compareRuleItems);
    highConfidenceRules.sort(compareRuleItems);

    const topPairs = similarPairs.slice(0, MAX_SIMILAR_PAIRS);
    const relevantSectionExamples = buildRelevantSectionExamples(localResult.sections, sectionExamples, action);
    const pairRuleReferences = [];
    const seen = {};
    for (let index = 0; index < topPairs.length; index += 1) {
      const list = Array.isArray(topPairs[index].rules) ? topPairs[index].rules : [];
      for (let ruleIndex = 0; ruleIndex < list.length; ruleIndex += 1) {
        const summary = list[ruleIndex];
        if (seen[summary]) {
          continue;
        }
        seen[summary] = true;
        pairRuleReferences.push(summary);
        if (pairRuleReferences.length >= MAX_RULES) {
          break;
        }
      }
      if (pairRuleReferences.length >= MAX_RULES) {
        break;
      }
    }

    const memoryContext = {
      available: true,
      memoryRevision: string(store && store.revision, ""),
      memoryUpdatedAt: string(store && store.updatedAt, ""),
      pairCount: Object.keys(pairById).length,
      sectionExampleCount: sectionExamples.length,
      aggregateCount: aggregate.length,
      frameProfileCount: frameShapeProfiles.length,
      containerProfileCount: containerProfiles.length,
      textProfileCount: textRoleProfiles.length,
      similarPairs: topPairs,
      relevantSectionExamples: relevantSectionExamples,
      repeatedRules: repeatedRules.slice(0, MAX_RULES),
      highConfidenceRules: highConfidenceRules.slice(0, MAX_RULES),
      pairRuleReferences: pairRuleReferences,
      frameShapeProfiles: sortFrameShapeProfiles(frameShapeProfiles).slice(0, 24),
      containerProfiles: sortContainerProfiles(containerProfiles).slice(0, 32),
      textRoleProfiles: sortTextRoleProfiles(textRoleProfiles).slice(0, 48),
    };
    memoryContext.retrievalFingerprint = buildMemoryRetrievalFingerprint(localResult, action, memoryContext);
    return memoryContext;
  }

  async function createResponsiveDesignAssistDraft(message) {
    const action = message && message.action === "pc-design" ? "pc-design" : "mobile-design";
    const requestedTargetWidth = resolveAssistTargetWidth(action, message && message.targetWidth);
    const legacySafeMode = !!(message && message.legacySafeMode);
    const selectionSignature = getSelectionSignature(figma.currentPage.selection);
    postStatus(
      "running",
      action === "pc-design"
        ? "MO -> PC 학습 프로필을 바탕으로 데스크톱 초안을 조립하고 있습니다."
        : "PC -> MO 학습 프로필을 바탕으로 모바일 초안을 조립하고 있습니다."
    );

    try {
      const root = getSingleSelectedRootNode();
      const cachedEnvelope = await readAssistCacheEnvelope();
      postAssistPhaseStatus(action, "analyzing");
      let localResult = getReusableCachedAnalysis(cachedEnvelope, action, selectionSignature, requestedTargetWidth);
      if (!localResult) {
        localResult = analyzeSelection(action, requestedTargetWidth);
      }
      const memoryStore = await readResponsiveMemoryStoreSafe();
      const currentMemoryRevision = string(memoryStore && memoryStore.revision, "");
      postAssistPhaseStatus(action, "retrieving-memory");
      let memoryContext = getReusableCachedMemoryContext(
        cachedEnvelope,
        action,
        selectionSignature,
        requestedTargetWidth,
        currentMemoryRevision
      );
      if (!memoryContext) {
        memoryContext = await readResponsiveMemoryContext(localResult, action, memoryStore);
      }
      const cacheInspection = inspectRequestAssistCacheEntry(
        cachedEnvelope,
        action,
        selectionSignature,
        requestedTargetWidth,
        memoryContext.memoryRevision,
        memoryContext.retrievalFingerprint
      );
      let result = cacheInspection.result;
      let cacheMeta = cacheInspection.cacheMeta;
      if (!result) {
        postAssistPhaseStatus(action, "planning");
        result = await buildAssistResult(localResult, memoryContext, action);
        cacheMeta = createFreshAssistCacheMeta(cacheInspection.cacheMeta);
      } else {
        postAssistPhaseStatus(action, "ready-to-render");
      }
      ensureRequiredAiPlanningResult(result, action);

      postAssistPhaseStatus(action, "rendering");
      const draft =
        action === "pc-design"
          ? await createDesktopDraftFromSelection(root, result, localResult)
          : await createMobileDraftFromSelection(root, result, localResult, { legacySafeMode });
      result.draft = draft;
      result.analyzedAt = new Date().toISOString();
      result.insights = buildInsights(result);
      await writeAssistCache(localResult, memoryContext, result);
      figma.ui.postMessage({
        type: "ai-design-assist-result",
        result: result,
        cacheMeta: cacheMeta,
        matchesCurrentSelection: selectionSignature === getSelectionSignature(figma.currentPage.selection),
      });

      const draftNode = draft && draft.nodeId ? await figma.getNodeByIdAsync(draft.nodeId) : null;
      if (draftNode) {
        figma.viewport.scrollAndZoomIntoView([root, draftNode]);
      }

      figma.notify(action === "pc-design" ? "PC draft created" : "MO draft created", { timeout: 1800 });
    } catch (error) {
      const messageText = normalizeError(
        error,
        action === "pc-design" ? "PC 초안을 만드는 중 문제가 발생했습니다." : "MO 초안을 만드는 중 문제가 발생했습니다."
      );
      figma.ui.postMessage({
        type: "ai-design-assist-error",
        message: messageText,
        matchesCurrentSelection: selectionSignature === getSelectionSignature(figma.currentPage.selection),
      });
      figma.notify(messageText, { error: true, timeout: 2200 });
    }
  }

  async function buildAssistResult(localResult, memoryContext, action) {
    const base = createBaseResult(localResult, memoryContext, action);
    const helper = globalScope.__PIGMA_AI_LLM__;
    const rendererContract = buildAiRendererContract(localResult, action);
    const aiPayload = {
      action: base.summary.actionLabel,
      targetLabel: base.summary.targetLabel,
      selection: {
        name: localResult.selection.name,
        size: `${localResult.selection.width}x${localResult.selection.height}`,
        contextLabel: localResult.summary.contextLabel,
        layoutLabel: localResult.summary.layoutLabel,
        textSamples: localResult.textSamples,
        childNames: localResult.childNames,
      },
      stats: localResult.stats,
      layout: localResult.layout,
      sections: localResult.sections,
      renderer: rendererContract,
      memory: {
        revision: memoryContext.memoryRevision,
        retrievalFingerprint: memoryContext.retrievalFingerprint,
        pairCount: memoryContext.pairCount,
        sectionExampleCount: memoryContext.sectionExampleCount,
        aggregateCount: memoryContext.aggregateCount,
        similarPairs: memoryContext.similarPairs,
        sectionExamples: memoryContext.relevantSectionExamples,
        repeatedRules: memoryContext.repeatedRules.map((entry) => entry.summary),
        highConfidenceRules: memoryContext.highConfidenceRules.map((entry) => entry.summary),
        pairRuleReferences: memoryContext.pairRuleReferences,
      },
    };
    if (!helper || typeof helper.hasConfiguredAiAsync !== "function" || typeof helper.requestJsonTask !== "function") {
      return handleAiFallback(base, action, "AI bridge unavailable", "AI bridge is unavailable, so memory fallback was used.");
    }

    let configured = false;
    try {
      configured = await helper.hasConfiguredAiAsync();
    } catch (error) {
      configured = false;
    }
    if (!configured) {
      return handleAiFallback(
        base,
        action,
        "AI disabled or API key missing",
        "AI is disabled or missing an API key, so textPlan AI was not applied."
      );
    }

    try {
      const planTaskContext = buildDesignAssistTaskContext(action, localResult && localResult.targetWidth, "plan");
      let response = await helper.requestJsonTask({
        taskType: "responsive-design-plan",
        taskContext: planTaskContext,
        plannerVersion: PLANNER_VERSION,
        providerProfile: buildDesignAssistProviderProfile(action, "plan"),
        modelByProvider: {
          openai: "gpt-5.4",
          gemini: "gemini-2.5-pro",
        },
        instructions:
          "You are the LLM planner for a Figma plugin that converts a desktop-origin design into a mobile editorial draft. This is not responsive resize. It is semantic extraction plus mobile recomposition. Do not preserve original coordinates, overlaps, absolute stacking, or tiny desktop fragments. Decide what to keep, what to discard, and how to rebuild. Return a design spec, not pixel placements. You are not the writer: do not choose exact coordinates, widths, heights, spacing tokens, safe-area values, target width, or minimum touch target sizes. Those are deterministic rules owned by code. Your job is to choose section priority, keep or hide decisions, mobile pattern selection, copy grouping, and visual emphasis. The renderer contract in the payload is authoritative. Plan only structures that this deterministic renderer can actually build well. Avoid plans that require many nested helper frames, free absolute composition, ultra narrow text columns, or letter-by-letter line breaks. Headlines must stay readable in roughly 1 to 3 lines, never degrade into 1 to 3 characters per line, and should prefer the safer variant when the renderer contract says a variant is unstable. First identify section boundaries and content priority. Then output a top-level sections array describing how each section should be rendered by code. Prefer one strong hero and one clear promo or benefit section when the source supports that reading. For hero sections, choose layoutVariant editorial-overlay or rebuilt-stack, provide heroCopyBlock, visualFocus, backgroundTreatment, and discardTextTokens when useful. For promo sections, choose layoutVariant benefit-card-list or promo-card, provide sectionHeader, date, cards, and discardTextTokens when useful. Use sectionIndex whenever possible to map plans to input sections. When sections include textEntries, infer textPlan from them. For textPlan, only use alignment left/center, copyMode grouped-copy/stacked, roleOrder from eyebrow/headline/subtitle/body/meta/cta, and gapAfterRatioByRole values as relative ratios without pixel math. Enum-like fields must stay in exact English schema tokens: type, sectionType, builderType, layoutVariant, visualPriority, cropPriority, focalTargets, textPlan.alignment, textPlan.copyMode, and textPlan.roleOrder. Only prose strings such as summaries, notes, copy text, labels, titles, and body text may be in Korean. Never return coordinates, widths, heights, or pixel math. Return concise Korean JSON only.",
        schema: {
          type: "object",
          properties: {
            targetSummary: { type: "string" },
            conversionSummary: { type: "string" },
            layoutChanges: { type: "array", items: { type: "string" } },
            contentChanges: { type: "array", items: { type: "string" } },
            warnings: { type: "array", items: { type: "string" } },
            suggestedSteps: { type: "array", items: { type: "string" } },
            memoryReferences: { type: "array", items: { type: "string" } },
            confidenceLabel: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sectionIndex: { type: "number" },
                  sectionName: { type: "string" },
                  type: { type: "string" },
                  sectionType: { type: "string" },
                  builderType: { type: "string" },
                  layoutVariant: { type: "string" },
                  visualPriority: { type: "string" },
                  cropPriority: { type: "string" },
                  focalTargets: { type: "array", items: { type: "string" } },
                  compactText: { type: "boolean" },
                  discardTextTokens: { type: "array", items: { type: "string" } },
                  keepTextTokens: { type: "array", items: { type: "string" } },
                  heroCopyBlock: {
                    type: "object",
                    properties: {
                      eyebrow: { type: "string" },
                      headline: { type: "string" },
                      subtitle: { type: "string" },
                      body: { type: "string" },
                    },
                  },
                  visualFocus: {
                    type: "object",
                    properties: {
                      primary: { type: "string" },
                      secondary: { type: "string" },
                      background: { type: "string" },
                    },
                  },
                  backgroundTreatment: {
                    type: "object",
                    properties: {
                      dim: { type: "boolean" },
                      blur: { type: "string" },
                      contrastBoost: { type: "boolean" },
                    },
                  },
                  sectionHeader: { type: "string" },
                  date: { type: "string" },
                  cards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        title: { type: "string" },
                        body: { type: "string" },
                        productRef: { type: "string" },
                        skuText: { type: "string" },
                      },
                    },
                  },
                  textPlan: {
                    type: "object",
                    properties: {
                      alignment: { type: "string" },
                      copyMode: { type: "string" },
                      preserveLineBreaks: { type: "boolean" },
                      roleOrder: { type: "array", items: { type: "string" } },
                      gapAfterRatioByRole: {
                        type: "object",
                        properties: {
                          eyebrow: { type: "number" },
                          headline: { type: "number" },
                          subtitle: { type: "number" },
                          body: { type: "number" },
                          meta: { type: "number" },
                          cta: { type: "number" },
                        },
                      },
                    },
                  },
                  notes: { type: "string" },
                },
                required: ["type"],
              },
            },
          },
          required: [
            "targetSummary",
            "conversionSummary",
            "layoutChanges",
            "contentChanges",
            "warnings",
            "suggestedSteps",
            "memoryReferences",
            "confidenceLabel",
            "sections",
          ],
        },
        payload: aiPayload,
      });

      if (!response || typeof response !== "object") {
        response = {};
      }

      base.source = typeof response._provider === "string" ? response._provider : "hybrid-ai";
      base.summary.aiStatusLabel = buildAiStatusLabel(response);
      captureAiRunTelemetry(base, response);
      applyAiResponse(base, response);
      if (Array.isArray(base.guidance && base.guidance.decisionNotes)) {
        base.guidance.decisionNotes.unshift(describeAiResponseShape(response));
      }
      postAssistPhaseStatus(action, "validating-plan");
      finalizeAiPlanningResult(base, localResult, rendererContract, action);
      ensureRequiredAiPlanningResult(base, action);
      return base;
    } catch (error) {
      if (error && error.pigmaAiPlanningRequired === true) {
        throw error;
      }
      captureAiFailureTelemetry(base, error);
      base.aiError = normalizeError(error, "AI ???????????????????濡?씀?濾?????????????嚥???癲?????????????? ??????椰????????????????????");
      return handleAiFallback(base, action, "AI request failed", "AI request failed, so memory fallback was used.");
    }
  }

  function handleAiFallback(result, action, statusLabel, warningText) {
    if (requiresAiPlanningForAction(action)) {
      throwRequiredAiPlanningError(result, statusLabel, warningText);
    }
    return finalizeAiFallback(result, statusLabel, warningText);
  }

  function finalizeAiFallback(result, statusLabel, warningText) {
    if (result && result.summary && statusLabel) {
      result.summary.aiStatusLabel = statusLabel;
    }
    if (
      result &&
      result.guidance &&
      Array.isArray(result.guidance.warnings) &&
      warningText &&
      result.guidance.warnings.indexOf(warningText) < 0
    ) {
      result.guidance.warnings.unshift(warningText);
    }
    return finalizeFallback(result);
  }

  async function requestSupplementalAiSectionPlans(helper, payload) {
    void helper;
    void payload;
    return [];
    if (!helper || typeof helper.requestJsonTask !== "function") {
      return [];
    }

    try {
      let response = await helper.requestJsonTask({
        taskType: "responsive-design-plan",
        taskContext: buildDesignAssistTaskContext(payload && payload.action, payload && payload.targetWidth, "supplemental"),
        plannerVersion: PLANNER_VERSION,
        providerProfile: buildDesignAssistProviderProfile("mobile-design", "supplemental"),
        modelByProvider: {
          openai: "gpt-5.4",
          gemini: "gemini-2.5-pro",
        },
        instructions:
          "You are filling only the missing mobile design spec sections for a Figma mobile redesign pass. This is not resize. Every section spec must map to one input section, and when possible preserve the input section index. The renderer contract in the payload is authoritative. You are not the writer: do not choose exact coordinates, target width, safe-area values, spacing tokens, or minimum touch target sizes. Those are deterministic code rules. Plan only sections that the deterministic renderer can build stably. Avoid nested helper-frame-heavy structures, ultra narrow text columns, and headline layouts that would break into tiny vertical fragments. Prefer the safer variant when unsure. Rebuild the source into readable mobile sections instead of preserving desktop layering. Prefer hero, promo, article, or keep decisions that are actually applicable to the given section profiles. For hero sections, choose layoutVariant editorial-overlay or rebuilt-stack and provide heroCopyBlock, visualFocus, backgroundTreatment, and discardTextTokens when useful. For promo sections, choose layoutVariant benefit-card-list or promo-card and provide sectionHeader, date, cards, and discardTextTokens when useful. Enum-like fields must stay in exact English schema tokens: type, sectionType, builderType, layoutVariant, visualPriority, cropPriority, focalTargets, textPlan.alignment, textPlan.copyMode, and textPlan.roleOrder. Only prose strings may be in Korean. Return concise Korean JSON only. For textPlan, only use alignment left/center, copyMode grouped-copy/stacked, roleOrder from eyebrow/headline/subtitle/body/meta/cta, and gapAfterRatioByRole values as relative ratios. Never return pixel values or coordinates.",
        schema: {
          type: "object",
          properties: {
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sectionIndex: { type: "number" },
                  sectionName: { type: "string" },
                  type: { type: "string" },
                  sectionType: { type: "string" },
                  builderType: { type: "string" },
                  layoutVariant: { type: "string" },
                  visualPriority: { type: "string" },
                  cropPriority: { type: "string" },
                  focalTargets: { type: "array", items: { type: "string" } },
                  compactText: { type: "boolean" },
                  discardTextTokens: { type: "array", items: { type: "string" } },
                  keepTextTokens: { type: "array", items: { type: "string" } },
                  heroCopyBlock: {
                    type: "object",
                    properties: {
                      eyebrow: { type: "string" },
                      headline: { type: "string" },
                      subtitle: { type: "string" },
                      body: { type: "string" },
                    },
                  },
                  visualFocus: {
                    type: "object",
                    properties: {
                      primary: { type: "string" },
                      secondary: { type: "string" },
                      background: { type: "string" },
                    },
                  },
                  backgroundTreatment: {
                    type: "object",
                    properties: {
                      dim: { type: "boolean" },
                      blur: { type: "string" },
                      contrastBoost: { type: "boolean" },
                    },
                  },
                  sectionHeader: { type: "string" },
                  date: { type: "string" },
                  cards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        title: { type: "string" },
                        body: { type: "string" },
                        productRef: { type: "string" },
                        skuText: { type: "string" },
                      },
                    },
                  },
                  textPlan: {
                    type: "object",
                    properties: {
                      alignment: { type: "string" },
                      copyMode: { type: "string" },
                      preserveLineBreaks: { type: "boolean" },
                      roleOrder: { type: "array", items: { type: "string" } },
                      gapAfterRatioByRole: {
                        type: "object",
                        properties: {
                          eyebrow: { type: "number" },
                          headline: { type: "number" },
                          subtitle: { type: "number" },
                          body: { type: "number" },
                          meta: { type: "number" },
                          cta: { type: "number" },
                        },
                      },
                    },
                  },
                  notes: { type: "string" },
                },
                required: ["type"],
              },
            },
          },
          required: ["sections"],
        },
        payload: {
          action: payload && payload.action,
          targetLabel: payload && payload.targetLabel,
          selection: payload && payload.selection,
          sections: payload && payload.sections,
          renderer: payload && payload.renderer,
          memory: payload && payload.memory,
        },
      });
      const designSections = normalizeAiDesignSections(
        response && Array.isArray(response.sections) && response.sections.length > 0 ? response.sections : response && response.sectionPlans
      );
      return designSections.length > 0 ? convertAiDesignSectionsToSectionPlans(designSections) : normalizeAiSectionPlans(response && response.sectionPlans);
    } catch (error) {
      return [];
    }
  }

  async function requestForcedAiSectionPlans(helper, payload) {
    void helper;
    void payload;
    return [];
    if (!helper || typeof helper.requestJsonTask !== "function") {
      return [];
    }

    try {
      let response = await helper.requestJsonTask({
        taskType: "responsive-design-plan",
        taskContext: buildDesignAssistTaskContext(payload && payload.action, payload && payload.targetWidth, "forced"),
        plannerVersion: PLANNER_VERSION,
        providerProfile: buildDesignAssistProviderProfile("mobile-design", "forced"),
        modelByProvider: {
          openai: "gpt-5.4",
          gemini: "gemini-2.5-pro",
        },
        instructions:
          "You are creating the minimum mobile planning skeleton for a Figma desktop-to-mobile redesign. The renderer contract in the payload is authoritative. Return exactly one section spec for each input section. Never return an empty sections array. You are not the writer, so do not decide exact target width, safe-area values, touch sizes, spacing tokens, coordinates, or pixel math. If unsure, use type keep. Avoid unstable variants that would create narrow text columns or helper-frame-heavy structures. Enum-like fields must stay in exact English schema tokens. Allowed type values: hero, promo, article, keep. Allowed layoutVariant values: editorial-overlay, rebuilt-stack, benefit-card-list, promo-card, stacked-article, media-first-article, keep. Use concise Korean only in notes. Do not return coordinates, widths, heights, or pixel math.",
        schema: {
          type: "object",
          properties: {
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sectionIndex: { type: "number" },
                  sectionName: { type: "string" },
                  type: { type: "string" },
                  layoutVariant: { type: "string" },
                  notes: { type: "string" },
                },
                required: ["sectionIndex", "type"],
              },
            },
          },
          required: ["sections"],
        },
        payload: {
          action: payload && payload.action,
          targetLabel: payload && payload.targetLabel,
          selection: payload && payload.selection,
          renderer: payload && payload.renderer,
          sections:
            payload && Array.isArray(payload.sections)
              ? payload.sections.map((section, index) => ({
                  sectionIndex: index,
                  name: string(section && section.name, ""),
                  type: string(section && section.type, ""),
                  textEntries: Array.isArray(section && section.textEntries)
                    ? section.textEntries.slice(0, 6).map((entry) => ({
                        text: string(entry && entry.text, ""),
                        role: string(entry && entry.role, ""),
                        fontSize: numeric(entry && entry.fontSize),
                      }))
                    : [],
                }))
              : [],
        },
      });
      const designSections = normalizeAiDesignSections(
        response && Array.isArray(response.sections) && response.sections.length > 0 ? response.sections : response && response.sectionPlans
      );
      return designSections.length > 0 ? convertAiDesignSectionsToSectionPlans(designSections) : [];
    } catch (error) {
      return [];
    }
  }

  function describeAiResponseShape(response) {
    if (!response || typeof response !== "object") {
      return "AI response shape: empty";
    }
    const keys = Object.keys(response).slice(0, 12);
    const sectionsCount = Array.isArray(response.sections) ? response.sections.length : 0;
    const sectionPlansCount = Array.isArray(response.sectionPlans) ? response.sectionPlans.length : 0;
    return `AI response shape keys=${keys.join(",")} sections=${sectionsCount} sectionPlans=${sectionPlansCount}`;
  }

  function buildMobileDeviceProfileContract(targetWidth) {
    const profile = pickMobileDeviceProfile(targetWidth);
    if (!profile) {
      return null;
    }

    return {
      key: string(profile.key, ""),
      label: string(profile.label, ""),
      width: Math.max(1, Math.round(numeric(profile.width))),
      safeArea: {
        top: Math.max(0, Math.round(numeric(profile.safeAreaTop))),
        right: Math.max(0, Math.round(numeric(profile.safeAreaRight))),
        bottom: Math.max(0, Math.round(numeric(profile.safeAreaBottom))),
        left: Math.max(0, Math.round(numeric(profile.safeAreaLeft))),
      },
    };
  }

  function pickMobileDeviceProfile(targetWidth) {
    const width = Math.max(1, Math.round(numeric(targetWidth)));
    let matched = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < MOBILE_DEVICE_PROFILES.length; index += 1) {
      const candidate = MOBILE_DEVICE_PROFILES[index];
      const candidateWidth = Math.max(1, Math.round(numeric(candidate && candidate.width)));
      const distance = Math.abs(candidateWidth - width);
      if (distance < bestDistance) {
        matched = candidate;
        bestDistance = distance;
      }
    }

    return matched;
  }

  function buildPlanningDecisionBoundaries(action) {
    return {
      llmOwns:
        action === "mobile-design"
          ? ["section-priority", "keep-hide-decisions", "mobile-pattern-choice", "copy-grouping", "visual-emphasis"]
          : ["section-priority", "keep-hide-decisions", "desktop-pattern-choice", "copy-grouping", "visual-emphasis"],
      deterministicOwns: [
        "target-width",
        "safe-area",
        "spacing-scale",
        "minimum-fonts",
        "minimum-touch-target",
        "root-flow",
        "figma-node-writing",
      ],
    };
  }

  function buildHardRuleContract(action, targetWidth, deviceProfile) {
    return {
      targetWidth: Math.max(1, Math.round(numeric(targetWidth))),
      targetWidthLockedByCode: true,
      exactPixelsOwnedByRenderer: true,
      safeArea: deviceProfile && deviceProfile.safeArea ? deviceProfile.safeArea : null,
      minTouchTarget: action === "mobile-design" ? MOBILE_TOUCH_TARGET_MIN : 32,
      minFonts: {
        headline: action === "mobile-design" ? 40 : 28,
        subtitle: action === "mobile-design" ? 22 : 18,
        body: action === "mobile-design" ? 15 : 16,
        meta: 12,
      },
      spacingScale:
        action === "mobile-design"
          ? {
              xlTo: 24,
              lgTo: 16,
              mdTo: 12,
              smTo: 8,
            }
          : null,
    };
  }

  function buildAiRendererContract(localResult, action) {
    const targetWidth = Math.max(320, numeric(localResult && localResult.targetWidth) || DEFAULT_MOBILE_WIDTH);
    const selectionWidth = Math.max(1, numeric(localResult && localResult.selection && localResult.selection.width) || targetWidth);
    const deviceProfile = action === "mobile-design" ? buildMobileDeviceProfileContract(targetWidth) : null;
    return {
      version: RENDERER_CONTRACT_VERSION,
      mode: action === "mobile-design" ? MOBILE_PLANNING_MODE : "memory-assisted",
      targetWidth: targetWidth,
      sourceWidth: selectionWidth,
      deviceProfile: deviceProfile,
      layoutPolicy: {
        rootFlow: action === "mobile-design" ? "single-vertical-draft-root" : "single-horizontal-draft-root",
        helperFrames: "allowed-but-minimize",
        nestedAutoLayout: "avoid",
        maxRecommendedHelperDepth: 2,
        postProcess: "helper-auto-layout-may-be-flattened-after-render",
      },
      decisionBoundaries: buildPlanningDecisionBoundaries(action),
      supportedVariants: {
        hero: ["editorial-overlay", "rebuilt-stack"],
        promo: ["benefit-card-list", "promo-card"],
        article: ["stacked-article", "media-first-article"],
        keep: ["keep"],
      },
      unstablePatterns: [
        "many-nested-helper-frames",
        "free-absolute-pixel-composition",
        "ultra-narrow-text-columns",
        "headline-broken-into-1-to-3-characters-per-line",
      ],
      textConstraints: {
        heroPreferredVariant: "editorial-overlay",
        heroOverlayTextColumnMinWidthRatio: 0.88,
        heroEyebrowMinFont: 18,
        heroHeadlineMinFont: 40,
        heroHeadlineMaxLines: 3,
        heroSubtitleMinFont: 22,
        bodyMinFont: 15,
        metaMinFont: 12,
        avoidVerticalWordBreaks: true,
        avoidNarrowHeadlineColumns: true,
      },
      hardRules: buildHardRuleContract(action, targetWidth, deviceProfile),
      frameConstraints: {
        keepRootDraftAsOnlyRequiredAutoLayout: true,
        avoidExtraWrapperFrames: true,
        preferFlatSectionTrees: true,
      },
    };
  }

  function createBaseResult(localResult, memoryContext, action) {
    const similarPairLabels = [];
    const planTaskContext = buildDesignAssistTaskContext(action, localResult && localResult.targetWidth, "plan");
    for (let index = 0; index < memoryContext.similarPairs.length; index += 1) {
      const entry = memoryContext.similarPairs[index];
      similarPairLabels.push(`${entry.label} (${Math.round(entry.score * 100)}%)`);
    }
    const memoryConfidenceLabel = deriveMemoryConfidenceLabel(memoryContext);
    const evidenceMode = describeMemoryEvidenceMode(memoryContext);

    return {
      version: PATCH_VERSION,
      plannerVersion: PLANNER_VERSION,
      rendererContractVersion: RENDERER_CONTRACT_VERSION,
      source: "memory-assisted",
      memoryRevision: string(memoryContext && memoryContext.memoryRevision, ""),
      memoryUpdatedAt: string(memoryContext && memoryContext.memoryUpdatedAt, ""),
      retrievalFingerprint: string(memoryContext && memoryContext.retrievalFingerprint, ""),
      analyzedAt: new Date().toISOString(),
      selectionSignature: localResult.selectionSignature,
      action: action,
      selection: localResult.selection,
      targetWidth: localResult.targetWidth,
      deviceProfile: action === "mobile-design" ? buildMobileDeviceProfileContract(localResult.targetWidth) : null,
      summary: {
        actionLabel: localResult.summary.actionLabel,
        targetLabel: localResult.summary.targetLabel,
        sourceLabel: localResult.summary.sourceLabel,
        contextLabel: localResult.summary.contextLabel,
        planningModeLabel:
          action === "mobile-design" ? "LLM planner + deterministic renderer" : "Memory-guided planner + deterministic renderer",
        aiStatusLabel: "Rule-based draft",
        memoryStatusLabel: memoryContext.available
          ? `Learned pairs ${memoryContext.pairCount} / sections ${memoryContext.sectionExampleCount} / aggregate ${memoryContext.aggregateCount} / frame profiles ${memoryContext.frameProfileCount || 0} / container profiles ${memoryContext.containerProfileCount || 0} / text profiles ${memoryContext.textProfileCount || 0}`
          : "No learned memory",
        contentSummary: `${localResult.summary.contextLabel} basis prepared a ${localResult.summary.targetLabel} proposal.`,
      },
      retrieval: {
        planningMode: action === "mobile-design" ? MOBILE_PLANNING_MODE : "memory-assisted",
        similarPairCount: memoryContext.similarPairs.length,
        sectionExampleCount: memoryContext.relevantSectionExamples.length,
        repeatedRuleCount: memoryContext.repeatedRules.length,
        highConfidenceRuleCount: memoryContext.highConfidenceRules.length,
        similarPairs: similarPairLabels,
        evidenceMode: evidenceMode,
        memoryRevision: string(memoryContext && memoryContext.memoryRevision, ""),
        retrievalFingerprint: string(memoryContext && memoryContext.retrievalFingerprint, ""),
        expectedSectionCount: Array.isArray(localResult.sections) ? localResult.sections.length : 0,
      },
      memory: memoryContext,
      aiRun: {
        ok: false,
        provider: "",
        model: "",
        taskType: "",
        taskContext: planTaskContext,
        plannerVersion: "",
        providerProfile: "",
        durationMs: 0,
        responseQualityScore: 0,
        responseQualityLabel: "",
        responseQualityNotes: [],
        failureType: "",
        failureMessage: "",
      },
      planning: {
        plannerVersion: PLANNER_VERSION,
        rendererContractVersion: RENDERER_CONTRACT_VERSION,
        memoryRevision: string(memoryContext && memoryContext.memoryRevision, ""),
        retrievalFingerprint: string(memoryContext && memoryContext.retrievalFingerprint, ""),
        expectedSectionCount: Array.isArray(localResult.sections) ? localResult.sections.length : 0,
        outputSectionCount: 0,
        deterministicRepairApplied: false,
        repairedSectionCount: 0,
        fallbackSectionCount: 0,
        validationWarnings: [],
        aiTaskType: "",
        aiTaskContext: planTaskContext,
        aiProvider: "",
        aiModel: "",
        aiProviderProfile: "",
        aiDurationMs: 0,
        aiResponseQualityScore: 0,
        aiResponseQualityLabel: "",
        aiFailureType: "",
        aiFailureMessage: "",
        qualityScore: 0,
        qualityLabel: "pending",
        qualitySummary: "",
      },
      guidance: {
        targetSummary: `${localResult.selection.name} will be reorganized for ${localResult.summary.targetLabel}.`,
        conversionSummary: "",
        layoutChanges: [],
        contentChanges: [],
        warnings: [],
        suggestedSteps: [],
        memoryReferences: [],
        designSpec: { sections: [] },
        sectionPlans: [],
        confidenceLabel: memoryConfidenceLabel,
        evidenceMode: evidenceMode,
        decisionNotes: [buildMemoryEvidenceDecision(memoryContext)],
      },
      insights: [],
    };
  }

  function deriveMemoryConfidenceLabel(memoryContext) {
    const score = deriveMemoryConfidenceScore(memoryContext);
    if (score >= 0.72) {
      return "high";
    }
    if (score >= 0.45) {
      return "medium";
    }
    return "low";
  }

  function deriveMemoryConfidenceScore(memoryContext) {
    const similarPairs = memoryContext && Array.isArray(memoryContext.similarPairs) ? memoryContext.similarPairs : [];
    const sectionExamples = memoryContext && Array.isArray(memoryContext.relevantSectionExamples) ? memoryContext.relevantSectionExamples : [];
    const highConfidenceRules = memoryContext && Array.isArray(memoryContext.highConfidenceRules) ? memoryContext.highConfidenceRules : [];
    const repeatedRules = memoryContext && Array.isArray(memoryContext.repeatedRules) ? memoryContext.repeatedRules : [];
    const textProfiles = numeric(memoryContext && memoryContext.textProfileCount);
    const containerProfiles = numeric(memoryContext && memoryContext.containerProfileCount);
    const frameProfiles = numeric(memoryContext && memoryContext.frameProfileCount);
    const pairScore = Math.min(1, similarPairs.length / 3);
    const sectionScore = Math.min(1, sectionExamples.length / 4);
    const ruleScore = Math.min(1, (highConfidenceRules.length * 1.2 + repeatedRules.length * 0.6) / 4);
    const profileScore = Math.min(1, (textProfiles * 0.5 + containerProfiles * 0.3 + frameProfiles * 0.2) / 20);
    return round(pairScore * 0.32 + sectionScore * 0.24 + ruleScore * 0.24 + profileScore * 0.2);
  }

  function describeMemoryEvidenceMode(memoryContext) {
    const label = deriveMemoryConfidenceLabel(memoryContext);
    if (label === "high") {
      return "learning-based";
    }
    if (label === "medium") {
      return "mixed";
    }
    return "fallback-heavy";
  }

  function buildMemoryEvidenceDecision(memoryContext) {
    const mode = describeMemoryEvidenceMode(memoryContext);
    if (mode === "learning-based") {
      return "학습된 pair/profile 근거가 충분해서 learned profile 우선으로 조립합니다.";
    }
    if (mode === "mixed") {
      return "학습 근거와 fallback 휴리스틱을 함께 써서 보수적으로 조립합니다.";
    }
    return "학습 근거가 아직 약해서 fallback 휴리스틱 비중을 높여 조립합니다.";
  }

  function buildMemoryEvidenceDecision(memoryContext) {
    const mode = describeMemoryEvidenceMode(memoryContext);
    if (mode === "learning-based") {
      return "학습된 pair와 profile 근거가 충분해 learned profile을 우선 사용합니다.";
    }
    if (mode === "mixed") {
      return "학습 근거와 fallback 휴리스틱을 함께 사용해 보수적으로 조립합니다.";
    }
    return "학습 근거가 아직 부족해 fallback 휴리스틱 비중을 높여 조립합니다.";
  }

  function applyAiResponse(result, response) {
    if (typeof response.targetSummary === "string" && response.targetSummary.trim()) {
      result.guidance.targetSummary = response.targetSummary.trim();
    }
    if (typeof response.conversionSummary === "string" && response.conversionSummary.trim()) {
      result.guidance.conversionSummary = response.conversionSummary.trim();
      result.summary.contentSummary = response.conversionSummary.trim();
    }

    result.guidance.layoutChanges = uniqueStrings(response.layoutChanges, 5);
    result.guidance.contentChanges = uniqueStrings(response.contentChanges, 4);
    result.guidance.warnings = uniqueStrings(response.warnings, 4);
    result.guidance.suggestedSteps = uniqueStrings(response.suggestedSteps, 5);
    result.guidance.memoryReferences = uniqueStrings(response.memoryReferences, 4);
    if (typeof response.confidenceLabel === "string" && response.confidenceLabel.trim()) {
      result.guidance.confidenceLabel = response.confidenceLabel.trim();
    }
    const designSections = normalizeAiDesignSections(
      Array.isArray(response.sections) && response.sections.length > 0 ? response.sections : response.sectionPlans
    );
    result.guidance.designSpec = { sections: designSections };
    result.guidance.sectionPlans =
      designSections.length > 0 ? convertAiDesignSectionsToSectionPlans(designSections) : normalizeAiSectionPlans(response.sectionPlans);

    if (result.guidance.layoutChanges.length === 0) {
      result.guidance.layoutChanges.push(buildFallbackLayoutHint(result.action, result.selection.width));
    }
    if (result.guidance.contentChanges.length === 0) {
      result.guidance.contentChanges.push("CTA, ????????????? ?????????썹땟戮녹??諭?????⑸㎦??????????, ??????????⑤벡?????????????嫄?????????????????????????????거???????????饔낅떽????묐뻿????ㅼ굣????????????????덉떻??????????꿔꺂???⑸븶?????????猷몄굣?????????????????썹땟戮녹??諭???????????");
    }
    if (result.guidance.suggestedSteps.length === 0) {
      result.guidance.suggestedSteps = buildSuggestedSteps(result);
    }

    sanitizeGuidanceCopy(result);
    result.insights = buildInsights(result);
  }

  function normalizeAiDesignSections(sections) {
    const items = Array.isArray(sections) ? sections : [];
    const out = [];

    for (let index = 0; index < items.length; index += 1) {
      const entry = items[index];
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const inferredType = inferAiSectionTypeFromSpec(entry);
      const rawType = string(entry.type || entry.sectionType || entry.builderType || inferredType, "").trim().toLowerCase();
      const sectionType = normalizeAiSectionType(rawType || entry.sectionType || inferredType);
      const builderType = normalizeAiBuilderType(rawType || entry.builderType, sectionType);
      if (!builderType) {
        continue;
      }

      const sectionHeader = string(entry.sectionHeader, "").trim();
      const sectionName = string(entry.sectionName || sectionHeader || `${builderType} section`, "").trim();
      const sectionIndex =
        typeof entry.sectionIndex === "number" && isFinite(entry.sectionIndex) ? Math.max(0, Math.round(entry.sectionIndex)) : -1;
      const heroCopyBlock = normalizeAiHeroCopyBlock(entry.heroCopyBlock);
      const cards = normalizeAiPromoCards(entry.cards);
      const derivedTextPlan = deriveAiTextPlanFromDesignSection(entry, builderType, heroCopyBlock, cards);
      const normalizedTextPlan = normalizeAiTextPlan(entry.textPlan) || derivedTextPlan;
      const visualFocus = normalizeAiVisualFocus(entry.visualFocus);
      const focalTargets = normalizeAiFocalTargets(entry.focalTargets);
      const section = {
        sectionIndex: sectionIndex,
        sectionName: sectionName,
        sectionType: sectionType,
        builderType: builderType,
        layoutVariant: normalizeAiLayoutVariant(entry.layoutVariant, builderType),
        visualPriority: normalizeAiVisualPriority(entry.visualPriority),
        cropPriority: normalizeAiCropPriority(entry.cropPriority),
        focalTargets: focalTargets.length > 0 ? focalTargets : deriveAiFocalTargetsFromVisualFocus(visualFocus, builderType),
        compactText: entry.compactText === true || (builderType === "promo" && cards.length >= 2),
        textPlan: normalizedTextPlan,
        discardTextTokens: normalizeAiTokenList(entry.discardTextTokens, 16),
        keepTextTokens: normalizeAiTokenList(entry.keepTextTokens, 16),
        heroCopyBlock: heroCopyBlock,
        visualFocus: visualFocus,
        backgroundTreatment: normalizeAiBackgroundTreatment(entry.backgroundTreatment),
        sectionHeader: sectionHeader,
        date: string(entry.date, "").trim(),
        cards: cards,
        notes: string(entry.notes, "").trim(),
        tokens: tokenize(sectionName),
      };

      out.push(section);
      if (out.length >= 12) {
        break;
      }
    }

    return out;
  }

  function convertAiDesignSectionsToSectionPlans(sections) {
    const items = Array.isArray(sections) ? sections : [];
    const out = [];

    for (let index = 0; index < items.length; index += 1) {
      const entry = items[index];
      if (!entry || typeof entry !== "object" || !entry.builderType) {
        continue;
      }
      out.push({
        sectionIndex: typeof entry.sectionIndex === "number" ? entry.sectionIndex : -1,
        sectionName: string(entry.sectionName, "").trim(),
        sectionType: string(entry.sectionType, ""),
        builderType: string(entry.builderType, ""),
        layoutVariant: string(entry.layoutVariant, ""),
        visualPriority: normalizeAiVisualPriority(entry.visualPriority),
        cropPriority: normalizeAiCropPriority(entry.cropPriority),
        focalTargets: normalizeAiFocalTargets(entry.focalTargets),
        compactText: entry.compactText === true,
        textPlan: normalizeAiTextPlan(entry.textPlan),
        discardTextTokens: normalizeAiTokenList(entry.discardTextTokens, 16),
        keepTextTokens: normalizeAiTokenList(entry.keepTextTokens, 16),
        heroCopyBlock: normalizeAiHeroCopyBlock(entry.heroCopyBlock),
        visualFocus: normalizeAiVisualFocus(entry.visualFocus),
        backgroundTreatment: normalizeAiBackgroundTreatment(entry.backgroundTreatment),
        sectionHeader: string(entry.sectionHeader, "").trim(),
        date: string(entry.date, "").trim(),
        cards: normalizeAiPromoCards(entry.cards),
        notes: string(entry.notes, "").trim(),
        tokens: Array.isArray(entry.tokens) ? entry.tokens.slice(0, 16) : tokenize(string(entry.sectionName, "")),
      });
    }

    return normalizeAiSectionPlans(out);
  }

  function normalizeAiSectionPlans(plans) {
    const items = Array.isArray(plans) ? plans : [];
    const out = [];

    for (let index = 0; index < items.length; index += 1) {
      const entry = items[index];
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const inferredType = inferAiSectionTypeFromSpec(entry);
      const sectionName = string(entry.sectionName || entry.sectionHeader, "").trim();
      const sectionType = normalizeAiSectionType(entry.sectionType || inferredType);
      const builderType = normalizeAiBuilderType(entry.builderType || entry.type || inferredType, sectionType);
      if (!sectionName || !builderType) {
        continue;
      }

      const sectionIndex =
        typeof entry.sectionIndex === "number" && isFinite(entry.sectionIndex) ? Math.max(0, Math.round(entry.sectionIndex)) : -1;
      out.push({
        sectionIndex: sectionIndex,
        sectionName: sectionName,
        sectionType: sectionType,
        builderType: builderType,
        layoutVariant: normalizeAiLayoutVariant(entry.layoutVariant, builderType),
        visualPriority: normalizeAiVisualPriority(entry.visualPriority),
        cropPriority: normalizeAiCropPriority(entry.cropPriority),
        focalTargets: normalizeAiFocalTargets(entry.focalTargets),
        compactText: entry.compactText === true,
        textPlan: normalizeAiTextPlan(entry.textPlan),
        discardTextTokens: normalizeAiTokenList(entry.discardTextTokens, 16),
        keepTextTokens: normalizeAiTokenList(entry.keepTextTokens, 16),
        heroCopyBlock: normalizeAiHeroCopyBlock(entry.heroCopyBlock),
        visualFocus: normalizeAiVisualFocus(entry.visualFocus),
        backgroundTreatment: normalizeAiBackgroundTreatment(entry.backgroundTreatment),
        sectionHeader: string(entry.sectionHeader, "").trim(),
        date: string(entry.date, "").trim(),
        cards: normalizeAiPromoCards(entry.cards),
        notes: string(entry.notes, "").trim(),
        tokens: tokenize(sectionName),
      });

      if (out.length >= 12) {
        break;
      }
    }

    return out;
  }

  function finalizeAiPlanningResult(result, localResult, rendererContract, action) {
    const normalized = normalizePlanV2(result, localResult, rendererContract, action);
    result.guidance.designSpec = { sections: normalized.designSections };
    result.guidance.sectionPlans = normalized.sectionPlans;
    result.guidance.warnings = uniqueStrings(normalized.warnings.concat(result.guidance.warnings || []), 6);
    result.guidance.decisionNotes = uniqueStrings(normalized.decisionNotes.concat(result.guidance.decisionNotes || []), 6);

    if (!result.planning || typeof result.planning !== "object") {
      result.planning = {};
    }
    result.planning.plannerVersion = PLANNER_VERSION;
    result.planning.rendererContractVersion = RENDERER_CONTRACT_VERSION;
    result.planning.expectedSectionCount = normalized.expectedSectionCount;
    result.planning.outputSectionCount = normalized.outputSectionCount;
    result.planning.deterministicRepairApplied = normalized.repairedCount > 0 || normalized.fallbackSectionCount > 0;
    result.planning.repairedSectionCount = normalized.repairedCount;
    result.planning.fallbackSectionCount = normalized.fallbackSectionCount;
    result.planning.validationWarnings = normalized.warnings.slice(0, 8);

    if (result.retrieval && typeof result.retrieval === "object") {
      result.retrieval.expectedSectionCount = normalized.expectedSectionCount;
      result.retrieval.outputSectionCount = normalized.outputSectionCount;
    }

    if (normalized.repairedCount > 0 || normalized.fallbackSectionCount > 0) {
      const statusLabel = string(result && result.summary && result.summary.aiStatusLabel, "");
      if (result && result.summary && statusLabel.indexOf("deterministic repair") < 0) {
        result.summary.aiStatusLabel = statusLabel ? statusLabel + " + deterministic repair" : "AI model + deterministic repair";
      }
    }

    sanitizeGuidanceCopy(result);
    applyPlanningQualitySnapshot(result);
    result.insights = buildInsights(result);
  }

  function normalizePlanV2(result, localResult, rendererContract, action) {
    const sourceSections = buildPlanningSourceSections(localResult);
    const inputPlans = collectAiSectionPlans(result);
    const validation = validatePlanAgainstContract(inputPlans, sourceSections, rendererContract, action);
    const repair = repairPlanWithDeterministicFallback(inputPlans, sourceSections, rendererContract);
    const designSections = normalizeAiDesignSections(repair.sectionPlans);
    const sectionPlans = convertAiDesignSectionsToSectionPlans(designSections);
    const warnings = uniqueStrings(validation.warnings.concat(repair.warnings), 8);
    const decisionNotes = uniqueStrings(validation.decisionNotes.concat(repair.decisionNotes), 6);

    return {
      designSections: designSections,
      sectionPlans: sectionPlans,
      warnings: warnings,
      decisionNotes: decisionNotes,
      expectedSectionCount: sourceSections.length,
      outputSectionCount: sectionPlans.length,
      repairedCount: repair.repairedCount,
      fallbackSectionCount: repair.fallbackSectionCount,
    };
  }

  function buildPlanningSourceSections(localResult) {
    const sections = localResult && Array.isArray(localResult.sections) ? localResult.sections.slice(0, 12) : [];
    if (sections.length > 0) {
      return sections;
    }

    return [
      {
        id: localResult && localResult.selection ? localResult.selection.id : "",
        index: 0,
        name: string(localResult && localResult.selection && localResult.selection.name, "Section 1"),
        sectionType: "section",
        width: numeric(localResult && localResult.selection && localResult.selection.width),
        height: numeric(localResult && localResult.selection && localResult.selection.height),
        layoutMode: string(localResult && localResult.layout && localResult.layout.mode, "none"),
        childCount: 1,
        textNodeCount: numeric(localResult && localResult.stats && localResult.stats.textNodeCount),
        imageFillCount: numeric(localResult && localResult.stats && localResult.stats.imageFillCount),
        textSamples: Array.isArray(localResult && localResult.textSamples) ? localResult.textSamples.slice(0, 4) : [],
        textEntries: [],
        tokenSample: Array.isArray(localResult && localResult.tokens) ? localResult.tokens.slice(0, 8) : [],
      },
    ];
  }

  function validatePlanAgainstContract(plans, sourceSections, rendererContract, action) {
    const list = Array.isArray(plans) ? plans : [];
    const expectedSectionCount = Array.isArray(sourceSections) ? sourceSections.length : 0;
    const warnings = [];
    const decisionNotes = [];
    let invalidEntryCount = 0;

    if (list.length === 0) {
      warnings.push("AI returned no usable section plan, so code rebuilt the plan from source sections.");
    } else if (expectedSectionCount > 0 && list.length !== expectedSectionCount) {
      warnings.push(
        "AI section plan count did not match the source sections, so code normalized the plan before rendering."
      );
    }

    for (let index = 0; index < list.length; index += 1) {
      const plan = list[index];
      const builderType = normalizeAiBuilderType(string(plan && plan.builderType, ""), string(plan && plan.sectionType, ""));
      const layoutVariant = normalizeAiLayoutVariant(string(plan && plan.layoutVariant, ""), builderType);
      const sectionName = string(plan && plan.sectionName, "").trim();
      const sectionIndex = typeof (plan && plan.sectionIndex) === "number" ? Math.round(plan.sectionIndex) : -1;

      if (!builderType || !sectionName || sectionIndex < 0 || (expectedSectionCount > 0 && sectionIndex >= expectedSectionCount)) {
        invalidEntryCount += 1;
        continue;
      }
      if (!supportsLayoutVariant(builderType, layoutVariant, rendererContract)) {
        invalidEntryCount += 1;
      }
    }

    if (invalidEntryCount > 0) {
      warnings.push("Some AI section entries were incomplete or unsupported, so deterministic repair replaced unstable fields.");
    }

    decisionNotes.push(
      "Plan validation checked section count, section mapping, builder types, and supported layout variants before rendering."
    );
    if (requiresAiPlanningForAction(action) && list.length > 0) {
      decisionNotes.push("The planner stayed single-pass; missing or unstable output was repaired in code instead of calling AI again.");
    }

    return {
      warnings: uniqueStrings(warnings, 6),
      decisionNotes: uniqueStrings(decisionNotes, 4),
    };
  }

  function repairPlanWithDeterministicFallback(plans, sourceSections, rendererContract) {
    const list = Array.isArray(plans) ? plans : [];
    const sections = Array.isArray(sourceSections) ? sourceSections : [];
    const usedPlanIndexes = {};
    const repairedPlans = [];
    const warnings = [];
    const decisionNotes = [];
    let repairedCount = 0;
    let fallbackSectionCount = 0;

    for (let index = 0; index < sections.length; index += 1) {
      const sourceSection = sections[index];
      const match = findBestAiPlanForSourceSection(list, sourceSection, index, usedPlanIndexes);
      const repaired = normalizeAndRepairSingleSectionPlan(match ? match.plan : null, sourceSection, index, rendererContract);
      if (match && typeof match.planIndex === "number" && match.planIndex >= 0) {
        usedPlanIndexes[match.planIndex] = true;
      }
      if (repaired.usedFallback) {
        fallbackSectionCount += 1;
      }
      if (repaired.wasRepaired) {
        repairedCount += 1;
      }
      repairedPlans.push(repaired.plan);
    }

    if (fallbackSectionCount > 0) {
      warnings.push("Code filled missing section plans from source-section heuristics instead of issuing a second AI request.");
    }
    if (repairedCount > 0) {
      decisionNotes.push(
        "Deterministic repair aligned the plan to the renderer contract before the draft renderer consumed it."
      );
    }

    return {
      sectionPlans: repairedPlans,
      repairedCount: repairedCount,
      fallbackSectionCount: fallbackSectionCount,
      warnings: uniqueStrings(warnings, 4),
      decisionNotes: uniqueStrings(decisionNotes, 4),
    };
  }

  function findBestAiPlanForSourceSection(plans, sourceSection, sourceIndex, usedPlanIndexes) {
    const list = Array.isArray(plans) ? plans : [];
    const used = usedPlanIndexes && typeof usedPlanIndexes === "object" ? usedPlanIndexes : {};
    const sourceTokens = Array.isArray(sourceSection && sourceSection.tokenSample)
      ? sourceSection.tokenSample
      : tokenize(string(sourceSection && sourceSection.name, ""));
    const sourceBuilderType = deriveDeterministicBuilderTypeFromSectionProfile(sourceSection);
    const sourceSectionType = string(sourceSection && sourceSection.sectionType, "");
    let best = null;
    let bestPlanIndex = -1;
    let bestScore = 0;

    for (let index = 0; index < list.length; index += 1) {
      if (used[index]) {
        continue;
      }

      const plan = list[index];
      if (!plan || typeof plan !== "object") {
        continue;
      }

      const planBuilderType = normalizeAiBuilderType(string(plan.builderType, ""), string(plan.sectionType, ""));
      const planTokens = Array.isArray(plan.tokens) ? plan.tokens : tokenize(string(plan.sectionName, ""));
      const typeScore =
        planBuilderType && sourceBuilderType && planBuilderType === sourceBuilderType
          ? 1
          : areTemplateSectionTypesCompatible(sourceSectionType, string(plan.sectionType, ""));
      const tokenScore = tokenSimilarity(sourceTokens, planTokens);
      const indexScore = typeof plan.sectionIndex === "number" && Math.round(plan.sectionIndex) === sourceIndex ? 1 : 0;
      const score = round(typeScore * 0.52 + tokenScore * 0.22 + indexScore * 0.26);

      if (score > bestScore) {
        best = plan;
        bestPlanIndex = index;
        bestScore = score;
      }
    }

    return bestScore >= 0.24 ? { plan: best, planIndex: bestPlanIndex } : null;
  }

  function normalizeAndRepairSingleSectionPlan(plan, sourceSection, sourceIndex, rendererContract) {
    const fallbackPlan = buildDeterministicSectionPlan(sourceSection, sourceIndex, rendererContract);
    if (!plan || typeof plan !== "object") {
      return {
        plan: fallbackPlan,
        usedFallback: true,
        wasRepaired: true,
      };
    }

    let wasRepaired = false;
    const sourceBuilderType = fallbackPlan.builderType;
    let builderType = normalizeAiBuilderType(string(plan.builderType || plan.type, ""), sourceBuilderType);
    if (!builderType || !hasSupportedBuilderType(builderType, rendererContract)) {
      builderType = sourceBuilderType;
      wasRepaired = true;
    }

    let sectionType = normalizeAiSectionType(string(plan.sectionType, ""));
    if (!sectionType) {
      sectionType = fallbackPlan.sectionType;
      wasRepaired = true;
    }

    let sectionName = string(plan.sectionName || plan.sectionHeader, "").trim();
    if (!sectionName) {
      sectionName = fallbackPlan.sectionName;
      wasRepaired = true;
    }

    let layoutVariant = normalizeAiLayoutVariant(string(plan.layoutVariant, ""), builderType);
    if (!supportsLayoutVariant(builderType, layoutVariant, rendererContract)) {
      layoutVariant = fallbackPlan.layoutVariant;
      wasRepaired = true;
    }

    let textPlan = normalizeAiTextPlan(plan.textPlan);
    if (!textPlan) {
      textPlan = fallbackPlan.textPlan;
      if (textPlan) {
        wasRepaired = true;
      }
    }

    let heroCopyBlock = normalizeAiHeroCopyBlock(plan.heroCopyBlock);
    if (builderType === "hero" && !heroCopyBlock && fallbackPlan.heroCopyBlock) {
      heroCopyBlock = fallbackPlan.heroCopyBlock;
      wasRepaired = true;
    }
    if (builderType !== "hero") {
      heroCopyBlock = null;
    }

    let cards = normalizeAiPromoCards(plan.cards);
    if (builderType === "promo" && cards.length === 0 && fallbackPlan.cards.length > 0) {
      cards = fallbackPlan.cards.slice(0);
      wasRepaired = true;
    }
    if (builderType !== "promo") {
      cards = [];
    }

    let focalTargets = normalizeAiFocalTargets(plan.focalTargets);
    if (focalTargets.length === 0 && fallbackPlan.focalTargets.length > 0) {
      focalTargets = fallbackPlan.focalTargets.slice(0);
      wasRepaired = true;
    }

    const normalizedPlan = {
      sectionIndex: sourceIndex,
      sectionName: sectionName,
      sectionType: sectionType,
      builderType: builderType,
      layoutVariant: layoutVariant,
      visualPriority: normalizeAiVisualPriority(plan.visualPriority),
      cropPriority: normalizeAiCropPriority(plan.cropPriority),
      focalTargets: focalTargets,
      compactText: plan.compactText === true || fallbackPlan.compactText === true,
      textPlan: textPlan,
      discardTextTokens: normalizeAiTokenList(plan.discardTextTokens, 16),
      keepTextTokens: normalizeAiTokenList(plan.keepTextTokens, 16),
      heroCopyBlock: heroCopyBlock,
      visualFocus: normalizeAiVisualFocus(plan.visualFocus) || fallbackPlan.visualFocus,
      backgroundTreatment: normalizeAiBackgroundTreatment(plan.backgroundTreatment) || fallbackPlan.backgroundTreatment,
      sectionHeader: string(plan.sectionHeader, "").trim() || fallbackPlan.sectionHeader,
      date: string(plan.date, "").trim(),
      cards: cards,
      notes: string(plan.notes, "").trim() || fallbackPlan.notes,
      tokens: tokenize(sectionName),
    };

    if (typeof plan.sectionIndex !== "number" || Math.round(plan.sectionIndex) !== sourceIndex) {
      wasRepaired = true;
    }

    return {
      plan: normalizedPlan,
      usedFallback: false,
      wasRepaired: wasRepaired,
    };
  }

  function buildDeterministicSectionPlan(sourceSection, sourceIndex, rendererContract) {
    const builderType = deriveDeterministicBuilderTypeFromSectionProfile(sourceSection);
    const sectionName = string(sourceSection && sourceSection.name, "").trim() || "Section " + String(sourceIndex + 1);
    const layoutVariant = deriveDeterministicLayoutVariant(builderType, sourceSection, rendererContract);
    const textPlan = deriveDeterministicTextPlanFromSectionProfile(sourceSection, builderType, layoutVariant);
    const heroCopyBlock = builderType === "hero" ? deriveDeterministicHeroCopyBlockFromSectionProfile(sourceSection) : null;
    const cards = builderType === "promo" ? deriveDeterministicPromoCardsFromSectionProfile(sourceSection) : [];

    return {
      sectionIndex: sourceIndex,
      sectionName: sectionName,
      sectionType: normalizeAiSectionType(string(sourceSection && sourceSection.sectionType, "")) || builderType,
      builderType: builderType,
      layoutVariant: layoutVariant,
      visualPriority: builderType === "article" ? "last" : "auto",
      cropPriority: "balanced",
      focalTargets: deriveDeterministicFocalTargets(builderType),
      compactText: builderType === "promo" && numeric(sourceSection && sourceSection.childCount) >= 3,
      textPlan: textPlan,
      discardTextTokens: [],
      keepTextTokens: normalizeAiTokenList(
        Array.isArray(sourceSection && sourceSection.textSamples) ? sourceSection.textSamples : [],
        8
      ),
      heroCopyBlock: heroCopyBlock,
      visualFocus: deriveDeterministicVisualFocus(builderType),
      backgroundTreatment: deriveDeterministicBackgroundTreatment(builderType, sourceSection),
      sectionHeader: builderType === "promo" ? sectionName : "",
      date: "",
      cards: cards,
      notes: "Deterministic fallback plan",
      tokens: tokenize(sectionName),
    };
  }

  function buildImplicitKeepSectionPlan(sourceSection, sourceIndex, sectionTypeHint) {
    const sectionName = string(sourceSection && sourceSection.name, "").trim() || "Section " + String(sourceIndex + 1);
    return {
      sectionIndex: typeof sourceIndex === "number" && sourceIndex >= 0 ? sourceIndex : 0,
      sectionName: sectionName,
      sectionType: normalizeAiSectionType(string(sectionTypeHint, "")) || "keep",
      builderType: "keep",
      layoutVariant: "keep",
      visualPriority: "auto",
      cropPriority: "auto",
      focalTargets: [],
      compactText: false,
      textPlan: null,
      discardTextTokens: [],
      keepTextTokens: normalizeAiTokenList(
        Array.isArray(sourceSection && sourceSection.textSamples) ? sourceSection.textSamples : [],
        8
      ),
      heroCopyBlock: null,
      visualFocus: null,
      backgroundTreatment: null,
      sectionHeader: "",
      date: "",
      cards: [],
      notes: "Implicit keep fallback plan",
      tokens: tokenize(sectionName),
    };
  }

  function deriveDeterministicBuilderTypeFromSectionProfile(sourceSection) {
    const sectionType = string(sourceSection && sourceSection.sectionType, "").toLowerCase();
    if (sectionType === "hero") {
      return "hero";
    }
    if (sectionType === "promo" || sectionType === "card-list") {
      return "promo";
    }
    if (["article", "editorial", "media", "visual"].indexOf(sectionType) >= 0) {
      return "article";
    }
    return "keep";
  }

  function deriveDeterministicLayoutVariant(builderType, sourceSection, rendererContract) {
    let variant = "keep";

    if (builderType === "hero") {
      variant = numeric(sourceSection && sourceSection.imageFillCount) > 0 ? "editorial-overlay" : "rebuilt-stack";
    } else if (builderType === "promo") {
      variant = numeric(sourceSection && sourceSection.childCount) >= 3 ? "benefit-card-list" : "promo-card";
    } else if (builderType === "article") {
      variant = numeric(sourceSection && sourceSection.imageFillCount) > 0 ? "media-first-article" : "stacked-article";
    }

    return supportsLayoutVariant(builderType, variant, rendererContract) ? variant : "keep";
  }

  function deriveDeterministicTextPlanFromSectionProfile(sourceSection, builderType, layoutVariant) {
    const roleOrder = collectDeterministicRoleOrder(sourceSection, builderType);
    return normalizeAiTextPlan({
      alignment: builderType === "hero" && layoutVariant !== "rebuilt-stack" ? "center" : "left",
      copyMode: builderType === "hero" && layoutVariant !== "rebuilt-stack" ? "grouped-copy" : "stacked",
      preserveLineBreaks: builderType === "hero" || builderType === "article",
      roleOrder: roleOrder,
    });
  }

  function collectDeterministicRoleOrder(sourceSection, builderType) {
    const entries = Array.isArray(sourceSection && sourceSection.textEntries) ? sourceSection.textEntries : [];
    const roles = [];
    const seen = {};

    for (let index = 0; index < entries.length; index += 1) {
      const role = normalizeAiTextClusterRole(entries[index] && entries[index].roleHint);
      if (!role || seen[role]) {
        continue;
      }
      seen[role] = true;
      roles.push(role);
    }

    if (roles.length > 0) {
      return roles;
    }
    if (builderType === "hero") {
      return ["eyebrow", "headline", "subtitle", "body"];
    }
    if (builderType === "promo") {
      return ["meta", "headline", "body"];
    }
    if (builderType === "article") {
      return ["headline", "body"];
    }
    return ["body"];
  }

  function deriveDeterministicHeroCopyBlockFromSectionProfile(sourceSection) {
    const entries = Array.isArray(sourceSection && sourceSection.textEntries) ? sourceSection.textEntries : [];
    const block = {
      eyebrow: "",
      headline: "",
      subtitle: "",
      body: "",
    };

    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      const role = normalizeAiTextClusterRole(entry && entry.roleHint);
      const text = string(entry && entry.text, "").trim();
      if (!text) {
        continue;
      }
      if (role === "eyebrow" && !block.eyebrow) {
        block.eyebrow = text;
      } else if (role === "headline" && !block.headline) {
        block.headline = text;
      } else if (role === "subtitle" && !block.subtitle) {
        block.subtitle = text;
      } else if ((role === "body" || role === "meta") && !block.body) {
        block.body = text;
      }
    }

    if (!block.headline) {
      const samples = Array.isArray(sourceSection && sourceSection.textSamples) ? sourceSection.textSamples : [];
      if (samples.length > 0) {
        block.headline = string(samples[0], "").trim();
      }
      if (samples.length > 1 && !block.body) {
        block.body = string(samples[1], "").trim();
      }
    }

    return normalizeAiHeroCopyBlock(block);
  }

  function deriveDeterministicPromoCardsFromSectionProfile(sourceSection) {
    const samples = Array.isArray(sourceSection && sourceSection.textSamples) ? sourceSection.textSamples : [];
    const cards = [];

    for (let index = 0; index < samples.length; index += 1) {
      const title = string(samples[index], "").trim();
      if (!title) {
        continue;
      }
      cards.push({
        label: "",
        title: title,
        body: "",
        productRef: "",
        skuText: "",
      });
      if (cards.length >= 3) {
        break;
      }
    }

    return cards;
  }

  function deriveDeterministicFocalTargets(builderType) {
    if (builderType === "hero") {
      return ["headline", "product"];
    }
    if (builderType === "promo") {
      return ["product"];
    }
    if (builderType === "article") {
      return ["headline"];
    }
    return ["headline"];
  }

  function deriveDeterministicVisualFocus(builderType) {
    if (builderType === "hero") {
      return {
        primary: "headline",
        secondary: "product",
        background: "background image",
      };
    }
    if (builderType === "promo") {
      return {
        primary: "product",
        secondary: "headline",
        background: "",
      };
    }
    if (builderType === "article") {
      return {
        primary: "headline",
        secondary: "supporting image",
        background: "",
      };
    }
    return null;
  }

  function deriveDeterministicBackgroundTreatment(builderType, sourceSection) {
    if (builderType !== "hero") {
      return null;
    }
    return {
      dim: numeric(sourceSection && sourceSection.imageFillCount) > 0,
      blur: "none",
      contrastBoost: true,
    };
  }

  function hasSupportedBuilderType(builderType, rendererContract) {
    const contract = rendererContract && typeof rendererContract === "object" ? rendererContract : {};
    const supportedVariants = contract.supportedVariants && typeof contract.supportedVariants === "object" ? contract.supportedVariants : {};
    return !!supportedVariants[builderType];
  }

  function supportsLayoutVariant(builderType, layoutVariant, rendererContract) {
    const contract = rendererContract && typeof rendererContract === "object" ? rendererContract : {};
    const supportedVariants = contract.supportedVariants && typeof contract.supportedVariants === "object" ? contract.supportedVariants : {};
    const allowed = Array.isArray(supportedVariants[builderType]) ? supportedVariants[builderType] : [];
    return !!layoutVariant && allowed.indexOf(layoutVariant) >= 0;
  }

  function deriveAiTextPlanFromDesignSection(entry, builderType, heroCopyBlock, cards) {
    if (builderType === "hero" && heroCopyBlock) {
      const roleOrder = [];
      if (heroCopyBlock.eyebrow) {
        roleOrder.push("eyebrow");
      }
      if (heroCopyBlock.headline) {
        roleOrder.push("headline");
      }
      if (heroCopyBlock.subtitle) {
        roleOrder.push("subtitle");
      }
      if (heroCopyBlock.body) {
        roleOrder.push("body");
      }
      return normalizeAiTextPlan({
        alignment: string(entry && entry.layoutVariant, "").toLowerCase() === "rebuilt-stack" ? "left" : "center",
        copyMode: string(entry && entry.layoutVariant, "").toLowerCase() === "rebuilt-stack" ? "stacked" : "grouped-copy",
        preserveLineBreaks: true,
        roleOrder: roleOrder,
      });
    }
    if (builderType === "promo" && Array.isArray(cards) && cards.length > 0) {
      return normalizeAiTextPlan({
        alignment: "center",
        copyMode: "stacked",
        preserveLineBreaks: false,
        roleOrder: ["meta", "headline", "body"],
      });
    }
    return null;
  }

  function normalizeAiLayoutVariant(value, builderType) {
    const normalized = string(value, "").trim().toLowerCase();
    const allowed =
      builderType === "hero"
        ? ["editorial-overlay", "rebuilt-stack"]
        : builderType === "promo"
        ? ["benefit-card-list", "promo-card"]
        : builderType === "article"
        ? ["stacked-article", "media-first-article"]
        : builderType === "keep"
        ? ["keep"]
        : [];
    if (allowed.indexOf(normalized) >= 0) {
      return normalized;
    }
    if (builderType === "hero") {
      if (containsAny(normalized, ["editorial overlay", "editorial-overlay", "overlay", "hero overlay", "오버레이"])) {
        return "editorial-overlay";
      }
      if (containsAny(normalized, ["rebuilt stack", "rebuilt-stack", "rebuild", "stack", "stacked", "재구성", "스택"])) {
        return "rebuilt-stack";
      }
    }
    if (builderType === "promo") {
      if (containsAny(normalized, ["benefit-card-list", "benefit card list", "benefit list", "card list", "cards", "혜택카드", "카드리스트"])) {
        return "benefit-card-list";
      }
      if (containsAny(normalized, ["promo-card", "promo card", "promotion card", "single card", "프로모카드"])) {
        return "promo-card";
      }
    }
    if (builderType === "article") {
      if (containsAny(normalized, ["stacked-article", "stacked article", "article stack", "세로본문"])) {
        return "stacked-article";
      }
      if (containsAny(normalized, ["media-first-article", "media first article", "image first article", "미디어우선"])) {
        return "media-first-article";
      }
    }
    if (builderType === "keep" && containsAny(normalized, ["keep", "preserve", "유지", "보존"])) {
      return "keep";
    }
    return "";
  }

  function normalizeAiTokenList(values, limit) {
    const list = Array.isArray(values) ? values : [];
    const out = [];
    const seen = {};
    for (let index = 0; index < list.length; index += 1) {
      const value = normalizeMeaningfulText(string(list[index], "")).toLowerCase();
      if (!value || seen[value]) {
        continue;
      }
      seen[value] = true;
      out.push(value);
      if (out.length >= Math.max(1, Math.round(numeric(limit) || 8))) {
        break;
      }
    }
    return out;
  }

  function normalizeAiHeroCopyBlock(value) {
    const source = value && typeof value === "object" ? value : null;
    if (!source) {
      return null;
    }
    const block = {
      eyebrow: string(source.eyebrow, "").trim(),
      headline: string(source.headline, "").trim(),
      subtitle: string(source.subtitle, "").trim(),
      body: string(source.body, "").trim(),
    };
    return block.eyebrow || block.headline || block.subtitle || block.body ? block : null;
  }

  function normalizeAiVisualFocus(value) {
    const source = value && typeof value === "object" ? value : null;
    if (!source) {
      return null;
    }
    const focus = {
      primary: string(source.primary, "").trim().toLowerCase(),
      secondary: string(source.secondary, "").trim().toLowerCase(),
      background: string(source.background, "").trim().toLowerCase(),
    };
    return focus.primary || focus.secondary || focus.background ? focus : null;
  }

  function normalizeAiBackgroundTreatment(value) {
    const source = value && typeof value === "object" ? value : null;
    if (!source) {
      return null;
    }
    const blur = string(source.blur, "").trim().toLowerCase();
    const treatment = {
      dim: source.dim === true,
      blur: normalizeAiBlurStrength(blur),
      contrastBoost: source.contrastBoost === true,
    };
    return treatment.dim || treatment.blur || treatment.contrastBoost ? treatment : null;
  }

  function normalizeAiBlurStrength(value) {
    const normalized = string(value, "").trim().toLowerCase();
    if (["none", "low", "medium", "high"].indexOf(normalized) >= 0) {
      return normalized;
    }
    if (containsAny(normalized, ["none", "off", "없음"])) {
      return "none";
    }
    if (containsAny(normalized, ["low", "small", "약", "낮음"])) {
      return "low";
    }
    if (containsAny(normalized, ["medium", "mid", "중", "중간"])) {
      return "medium";
    }
    if (containsAny(normalized, ["high", "strong", "강", "높음"])) {
      return "high";
    }
    return "";
  }

  function normalizeAiPromoCards(value) {
    const list = Array.isArray(value) ? value : [];
    const out = [];
    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index];
      if (!entry || typeof entry !== "object") {
        continue;
      }
      const card = {
        label: string(entry.label, "").trim(),
        title: string(entry.title, "").trim(),
        body: string(entry.body, "").trim(),
        productRef: string(entry.productRef, "").trim(),
        skuText: string(entry.skuText, "").trim(),
      };
      if (!card.label && !card.title && !card.body && !card.productRef && !card.skuText) {
        continue;
      }
      out.push(card);
      if (out.length >= 6) {
        break;
      }
    }
    return out;
  }

  function deriveAiFocalTargetsFromVisualFocus(visualFocus, builderType) {
    const values = [];
    const source = visualFocus && typeof visualFocus === "object" ? [visualFocus.primary, visualFocus.secondary, visualFocus.background] : [];
    for (let index = 0; index < source.length; index += 1) {
      const text = string(source[index], "").toLowerCase();
      if (!text) {
        continue;
      }
      if (containsAny(text, ["person", "hand", "human", "model", "face"])) {
        values.push("person");
      } else if (containsAny(text, ["logo", "brand"])) {
        values.push("logo");
      } else if (containsAny(text, ["cta", "button"])) {
        values.push("cta");
      } else if (containsAny(text, ["headline", "title", "copy", "text"])) {
        values.push("headline");
      } else if (containsAny(text, ["product", "fridge", "refrigerator", "drink", "cocktail", "glass", "mocktail"])) {
        values.push("product");
      }
    }
    const normalized = normalizeAiFocalTargets(values);
    if (normalized.length > 0) {
      return normalized;
    }
    return builderType === "hero" ? ["headline", "product"] : ["product"];
  }

  function inferAiSectionTypeFromSpec(entry) {
    const source = entry && typeof entry === "object" ? entry : null;
    if (!source) {
      return "";
    }
    const raw = [
      source.type,
      source.sectionType,
      source.builderType,
      source.layoutVariant,
      source.sectionName,
      source.sectionHeader,
    ]
      .map((value) => string(value, ""))
      .join(" ");
    if (normalizeAiHeroCopyBlock(source.heroCopyBlock)) {
      return "hero";
    }
    if (Array.isArray(source.cards) && source.cards.length > 0) {
      return "promo";
    }
    if (source.sectionHeader || source.date) {
      return "promo";
    }
    if (containsAny(raw.toLowerCase(), ["benefit-card-list", "promo-card", "benefit", "promo", "혜택", "프로모"])) {
      return "promo";
    }
    if (containsAny(raw.toLowerCase(), ["editorial-overlay", "rebuilt-stack", "hero", "kv", "key visual", "히어로", "키비주얼"])) {
      return "hero";
    }
    if (containsAny(raw.toLowerCase(), ["article", "editorial", "story", "본문", "아티클"])) {
      return "article";
    }
    if (containsAny(raw.toLowerCase(), ["keep", "preserve", "clone", "유지", "보존"])) {
      return "keep";
    }
    return "";
  }

  function normalizeAiSectionType(value) {
    const normalized = string(value, "").trim().toLowerCase();
    if (["hero", "promo", "article", "media", "header", "footer", "card-list"].indexOf(normalized) >= 0) {
      return normalized;
    }
    if (containsAny(normalized, ["hero", "key visual", "keyvisual", "kv", "main visual", "히어로", "키비주얼", "메인비주얼", "비주얼"])) {
      return "hero";
    }
    if (containsAny(normalized, ["promo", "promotion", "benefit", "offer", "coupon", "프로모", "프로모션", "혜택", "오퍼", "쿠폰"])) {
      return "promo";
    }
    if (containsAny(normalized, ["article", "editorial", "story", "content", "아티클", "에디토리얼", "스토리", "본문", "콘텐츠"])) {
      return "article";
    }
    if (containsAny(normalized, ["media", "visual", "image", "미디어", "이미지"])) {
      return "media";
    }
    if (containsAny(normalized, ["header", "헤더"])) {
      return "header";
    }
    if (containsAny(normalized, ["footer", "푸터"])) {
      return "footer";
    }
    if (containsAny(normalized, ["card list", "card-list", "cards", "카드리스트", "카드 목록"])) {
      return "card-list";
    }
    return "";
  }

  function normalizeAiBuilderType(value, fallbackType) {
    const normalized = string(value, "").trim().toLowerCase();
    if (["hero", "promo", "article", "keep"].indexOf(normalized) >= 0) {
      return normalized;
    }
    const normalizedSectionType = normalizeAiSectionType(normalized);
    if (["hero", "promo", "article"].indexOf(normalizedSectionType) >= 0) {
      return normalizedSectionType;
    }
    if (containsAny(normalized, ["keep", "preserve", "clone", "original", "유지", "보존", "원본"])) {
      return "keep";
    }
    if (["hero", "promo", "article"].indexOf(fallbackType) >= 0) {
      return fallbackType;
    }
    return "";
  }

  function normalizeAiVisualPriority(value) {
    const normalized = string(value, "").trim().toLowerCase();
    if (["first", "last", "auto"].indexOf(normalized) >= 0) {
      return normalized;
    }
    if (containsAny(normalized, ["first", "visual first", "먼저", "우선", "상단"])) {
      return "first";
    }
    if (containsAny(normalized, ["last", "after", "later", "나중", "하단"])) {
      return "last";
    }
    return "auto";
  }

  function normalizeAiTextPlan(value) {
    const source = value && typeof value === "object" ? value : null;
    if (!source) {
      return null;
    }

    const alignment = normalizeAiTextAlignment(source.alignment);
    const copyMode = normalizeAiTextCopyMode(source.copyMode);
    const roleOrder = normalizeAiTextRoleList(source.roleOrder);
    const gapAfterRatioByRole = normalizeAiGapAfterRatioByRole(source.gapAfterRatioByRole);
    const preserveLineBreaks = source.preserveLineBreaks === true;
    if (!alignment && !copyMode && roleOrder.length === 0 && !gapAfterRatioByRole && !preserveLineBreaks) {
      return null;
    }

    return {
      alignment: alignment,
      copyMode: copyMode,
      preserveLineBreaks: preserveLineBreaks,
      roleOrder: roleOrder,
      gapAfterRatioByRole: gapAfterRatioByRole,
    };
  }

  function normalizeAiTextAlignment(value) {
    const normalized = string(value, "").trim().toLowerCase();
    if (normalized === "center" || normalized === "left") {
      return normalized;
    }
    if (containsAny(normalized, ["center", "centre", "중앙", "가운데"])) {
      return "center";
    }
    if (containsAny(normalized, ["left", "왼", "좌"])) {
      return "left";
    }
    return "";
  }

  function normalizeAiTextCopyMode(value) {
    const normalized = string(value, "").trim().toLowerCase();
    if (normalized === "grouped-copy" || normalized === "stacked") {
      return normalized;
    }
    if (containsAny(normalized, ["grouped", "group", "copy block", "copyblock", "묶음", "그룹", "통합", "블록"])) {
      return "grouped-copy";
    }
    if (containsAny(normalized, ["stacked", "stack", "vertical", "세로", "스택"])) {
      return "stacked";
    }
    return "";
  }

  function normalizeAiTextClusterRole(value) {
    const normalized = string(value, "").trim().toLowerCase();
    if (["eyebrow", "headline", "subtitle", "body", "meta", "cta"].indexOf(normalized) >= 0) {
      return normalized;
    }
    if (containsAny(normalized, ["eyebrow", "kicker", "topline", "아이브로", "키커"])) {
      return "eyebrow";
    }
    if (containsAny(normalized, ["headline", "title", "heading", "hero", "헤드라인", "타이틀", "제목"])) {
      return "headline";
    }
    if (containsAny(normalized, ["subtitle", "subheading", "sub title", "서브타이틀", "부제"])) {
      return "subtitle";
    }
    if (containsAny(normalized, ["body", "description", "desc", "copy", "본문", "설명"])) {
      return "body";
    }
    if (containsAny(normalized, ["meta", "date", "label", "tag", "메타", "날짜", "라벨", "태그"])) {
      return "meta";
    }
    if (containsAny(normalized, ["cta", "button", "action", "버튼", "액션"])) {
      return "cta";
    }
    return "";
  }

  function normalizeAiTextRoleList(values) {
    const list = Array.isArray(values) ? values : [];
    const out = [];
    const seen = {};
    for (let index = 0; index < list.length; index += 1) {
      const role = normalizeAiTextClusterRole(list[index]);
      if (!role || seen[role]) {
        continue;
      }
      seen[role] = true;
      out.push(role);
      if (out.length >= 6) {
        break;
      }
    }
    return out;
  }

  function normalizeAiGapAfterRatioByRole(value) {
    const source = value && typeof value === "object" ? value : null;
    if (!source) {
      return null;
    }

    const roles = ["eyebrow", "headline", "subtitle", "body", "meta", "cta"];
    const out = {};
    for (let index = 0; index < roles.length; index += 1) {
      const role = roles[index];
      const ratio = numeric(source[role]);
      if (!(ratio > 0)) {
        continue;
      }
      out[role] = round(clamp(ratio, 0.04, 1.6));
    }
    return Object.keys(out).length > 0 ? out : null;
  }

  function normalizeAiCropPriority(value) {
    const normalized = string(value, "").trim().toLowerCase();
    if (["headline-first", "product-first", "person-first", "balanced", "auto"].indexOf(normalized) >= 0) {
      return normalized;
    }
    if (containsAny(normalized, ["headline", "title", "copy", "헤드라인", "타이틀", "카피"])) {
      return "headline-first";
    }
    if (containsAny(normalized, ["product", "fridge", "refrigerator", "cocktail", "mocktail", "제품", "상품", "냉장고", "음료"])) {
      return "product-first";
    }
    if (containsAny(normalized, ["person", "human", "model", "hand", "인물", "모델", "손"])) {
      return "person-first";
    }
    if (containsAny(normalized, ["balanced", "balance", "균형"])) {
      return "balanced";
    }
    return "auto";
  }

  function normalizeAiFocalTargets(values) {
    const list = Array.isArray(values) ? values : [];
    const out = [];
    for (let index = 0; index < list.length; index += 1) {
      const normalized = normalizeAiFocalTarget(list[index]);
      if (["headline", "product", "person", "logo", "cta"].indexOf(normalized) < 0) {
        continue;
      }
      if (out.indexOf(normalized) >= 0) {
        continue;
      }
      out.push(normalized);
      if (out.length >= 3) {
        break;
      }
    }
    return out;
  }

  function finalizeFallback(result) {
    const repeatedRules = result.memory && Array.isArray(result.memory.repeatedRules) ? result.memory.repeatedRules : [];
    const pairRules = result.memory && Array.isArray(result.memory.pairRuleReferences) ? result.memory.pairRuleReferences : [];
    const similarPairs = result.memory && Array.isArray(result.memory.similarPairs) ? result.memory.similarPairs : [];
    const sectionExamples = result.memory && Array.isArray(result.memory.relevantSectionExamples) ? result.memory.relevantSectionExamples : [];
    const highConfidence = result.memory && Array.isArray(result.memory.highConfidenceRules) ? result.memory.highConfidenceRules : [];

    result.guidance.conversionSummary =
      `${result.selection.name} converted toward ${result.summary.targetLabel} as a dry-run proposal.` +
      (sectionExamples.length > 0
        ? ` Referenced ${similarPairs.length} similar pairs and ${sectionExamples.length} section examples.`
        : similarPairs.length > 0
        ? ` Referenced ${similarPairs.length} similar examples first.`
        : " Similar examples are still limited, so heuristic weight is higher.");

    for (let index = 0; index < repeatedRules.length && result.guidance.layoutChanges.length < 4; index += 1) {
      result.guidance.layoutChanges.push(repeatedRules[index].summary);
    }
    for (let index = 0; index < sectionExamples.length && result.guidance.layoutChanges.length < 4; index += 1) {
      const sectionHint = `${sectionExamples[index].sectionType} -> ${sectionExamples[index].mobilePattern}`;
      if (result.guidance.layoutChanges.indexOf(sectionHint) < 0) {
        result.guidance.layoutChanges.push(sectionHint);
      }
    }
    for (let index = 0; index < pairRules.length && result.guidance.layoutChanges.length < 4; index += 1) {
      if (result.guidance.layoutChanges.indexOf(pairRules[index]) < 0) {
        result.guidance.layoutChanges.push(pairRules[index]);
      }
    }
    if (result.guidance.layoutChanges.length === 0) {
      result.guidance.layoutChanges.push(buildFallbackLayoutHint(result.action, result.selection.width));
    }

    for (let index = 0; index < pairRules.length && result.guidance.contentChanges.length < 3; index += 1) {
      if (result.guidance.layoutChanges.indexOf(pairRules[index]) < 0) {
        result.guidance.contentChanges.push(pairRules[index]);
      }
    }
    for (let index = 0; index < sectionExamples.length && result.guidance.contentChanges.length < 3; index += 1) {
      const sectionContentHint = `${sectionExamples[index].sectionType} section reflowed as ${sectionExamples[index].mobilePattern}`;
      if (result.guidance.contentChanges.indexOf(sectionContentHint) < 0) {
        result.guidance.contentChanges.push(sectionContentHint);
      }
    }
    if (result.guidance.contentChanges.length === 0) {
      result.guidance.contentChanges.push("????????釉먮폁???????????????????????????거???????????饔낅떽????묐뻿????ㅼ굣??? ??????????⑤벡?????????????嫄??????????????????嫄???????????????????????獄쏅챶留덌┼????????????????????덉떻??????????嫄???????????????????????썹땟戮녹??諭???????????");
    }

    if (similarPairs.length === 0) {
      result.guidance.warnings.push("???????pair??????????? ????????????????????椰??????????????????썹땟戮녹??諭?????⑸㎦??????????????????????????????? ????????????????????살몝??");
    }
    if (highConfidence.length === 0) {
      result.guidance.warnings.push("????????????????롮쾸?椰????aggregate ?????????????????諛몃마嶺뚮?????????????硫λ젒???????怨?????????????????椰???????? ???????????????????살몝??");
    }
    if (result.guidance.warnings.length === 0) {
      result.guidance.warnings.push("????????????????????????????諛몃마嶺뚮?????????????硫λ젒?????? ????????? ????????釉먮폁????????????????????野껊챶??????????????????????????????????????썹땟戮녹??諭?????⑸㎦?????????????????????癲ル슢?싩땟????????????????????????썹땟戮녹??諭???????????");
    }

    for (let index = 0; index < similarPairs.length && result.guidance.memoryReferences.length < 3; index += 1) {
      result.guidance.memoryReferences.push(`${similarPairs[index].label} / ${similarPairs[index].reason}`);
    }
    for (let index = 0; index < sectionExamples.length && result.guidance.memoryReferences.length < 3; index += 1) {
      result.guidance.memoryReferences.push(`${sectionExamples[index].title} / ${sectionExamples[index].reason}`);
    }
    for (let index = 0; index < repeatedRules.length && result.guidance.memoryReferences.length < 3; index += 1) {
      result.guidance.memoryReferences.push(`${repeatedRules[index].summary} / support ${repeatedRules[index].supportCount}`);
    }
    if (!Array.isArray(result.guidance.decisionNotes)) {
      result.guidance.decisionNotes = [];
    }
    if (result.guidance.decisionNotes.length === 0) {
      result.guidance.decisionNotes.push(buildMemoryEvidenceDecision(result.memory));
    }

    result.guidance.suggestedSteps = buildSuggestedSteps(result);
    sanitizeGuidanceCopy(result);
    applyPlanningQualitySnapshot(result);
    result.insights = buildInsights(result);
    return result;
  }

  function buildSuggestedSteps(result) {
    const steps = [];
    steps.push(`${result.summary.targetLabel} ???????????????????????????????????????????쇰뮛?????????????????Β?щ엠?????饔낅떽?????? ??????椰???????????????됰Ŧ???????????????????썹땟戮녹??諭????????????????????????????????????????????嫄?????????`);
    if (result.guidance.layoutChanges.length > 0) {
      steps.push(result.guidance.layoutChanges[0]);
    }
    if (result.guidance.contentChanges.length > 0) {
      steps.push(result.guidance.contentChanges[0]);
    }
    steps.push("????????????????????????????諛몃마嶺뚮?????????????硫λ젒?????? ??????椰??????????????遺얘턁???????猷몄굣??????? ????????釉먮폁????????????????????野껊챶??????????????????????????????????????癲ル슢?싩땟????????????????????嫄?????????");
    return uniqueStrings(steps, 5);
  }

  function buildInsights(result) {
    const items = [];
    if (result && result.draft && typeof result.draft.name === "string") {
      pushInsight(items, "Draft", `${result.draft.name}${result.draft.width ? ` ${result.draft.width}px` : ""}`);
    }
    if (result && result.draft && typeof result.draft.evidenceMode === "string") {
      pushInsight(items, "Mode", result.draft.evidenceMode);
    }
    if (result && result.aiRun && result.aiRun.provider && result.aiRun.model) {
      pushInsight(items, "AI", `${result.aiRun.provider} / ${result.aiRun.model}`);
    }
    if (numeric(result && result.targetWidth) > 0) {
      const deviceLabel = string(result && result.deviceProfile && result.deviceProfile.label, "");
      pushInsight(items, "Width", `${Math.round(numeric(result.targetWidth))}px${deviceLabel ? ` / ${deviceLabel}` : ""}`);
    }
    if (result && result.planning && result.planning.deterministicRepairApplied) {
      pushInsight(
        items,
        "Plan",
        `Deterministic repair ${Math.max(1, Math.round(numeric(result.planning.repairedSectionCount) || 0))} section(s)`
      );
    }
    if (result && result.planning && string(result.planning.qualitySummary, "")) {
      pushInsight(items, "Quality", result.planning.qualitySummary);
    }
    pushInsight(items, "Target", result.guidance.targetSummary);
    pushInsight(items, "Summary", result.guidance.conversionSummary);
    pushInsight(items, "Layout", result.guidance.layoutChanges[0]);
    pushInsight(items, "Content", result.guidance.contentChanges[0]);
    pushInsight(items, "Evidence", result.guidance.memoryReferences[0]);
    pushInsight(items, "Warning", result.guidance.warnings[0]);
    pushInsight(items, "Next", result.guidance.suggestedSteps[0]);
    return items.slice(0, 8);
  }

  function pushInsight(items, label, value) {
    if (!Array.isArray(items)) {
      return;
    }

    const nextLabel = sanitizeUserFacingText(label, "");
    const nextValue = sanitizeUserFacingText(value, "");
    if (!nextLabel || !nextValue) {
      return;
    }

    items.push({
      label: nextLabel,
      value: nextValue,
    });
  }

  // Legacy clone-first fallback stays for comparison and emergency recovery only.
  async function createLegacyMobileDraftFromSelection(root, result) {
    if (!root || typeof root.clone !== "function") {
      throw new Error("???????????????????????猷멥럸????壤굿?袁り턁????????遺얘턁??????????????????⑤벡???????븐뼐??????????????????????濡?씀?濾?????????????????살몝??");
    }

    const originalBounds = getNodeBounds(root);
    if (!originalBounds) {
      throw new Error("????????????猷멥럸????壤굿?袁り턁???????????????諛몃마嶺뚮?????????????硫λ젒??? ?????????????????????????? ??????椰????????????????????");
    }

    let draft = root.clone();
    if (draft && draft.type === "INSTANCE" && typeof draft.detachInstance === "function") {
      draft = draft.detachInstance();
    }

    unlockNodeTree(draft);

    const targetWidth = Math.max(320, numeric(result && result.targetWidth) || DEFAULT_MOBILE_WIDTH);
    const state = {
      targetWidth: targetWidth,
      sourceWidth: Math.max(1, numeric(originalBounds.width) || targetWidth),
      sourceHeight: Math.max(1, numeric(originalBounds.height) || targetWidth),
      sourceSectionCount: Array.isArray(root && root.children) && root.children.length > 0 ? root.children.length : 1,
      layoutHints: collectLayoutHintText(result),
      frameShapeProfiles: result && result.memory && Array.isArray(result.memory.frameShapeProfiles) ? result.memory.frameShapeProfiles.slice() : [],
      containerProfiles: result && result.memory && Array.isArray(result.memory.containerProfiles) ? result.memory.containerProfiles.slice() : [],
      rootFrameGuidance: predictDraftRootFrameGuidance(
        root,
        targetWidth,
        {
          selection: { width: numeric(originalBounds.width), height: numeric(originalBounds.height) },
          sections: Array.isArray(root && root.children) ? root.children : [],
        },
        result && result.memory ? result.memory.frameShapeProfiles : []
      ),
      textRoleProfiles: result && result.memory && Array.isArray(result.memory.textRoleProfiles) ? result.memory.textRoleProfiles.slice() : [],
      appliedChanges: [],
      topLevelReflowCount: 0,
      scaledNodeCount: 0,
      textAdjustments: 0,
      stackedContainers: 0,
      hiddenTopLevelNodes: 0,
      spacingAdjustments: 0,
    };

    draft.name = `${safeName(root)} / MO Draft ${targetWidth}`;
    writeResponsiveDraftPluginData(draft, root, targetWidth, "mobile-design");
    transformNodeTreeForMobileDraft(draft, state, 0);
    if (!prefersConservativeMobileSections(state)) {
      await adjustTextNodesForMobileDraft(draft, state);
    }
    await enforceReadableTextMinimumsForMobileDraft(draft, state);
    minimizeGeneratedAutoLayoutFrames(draft, state);
    positionDraftNode(root, draft, originalBounds);
    /*
    /*

    const draftBounds = getNodeBounds(draft);
    if (state.textAdjustments > 0) {
      addAppliedChange(state, `????????釉먮폁??????????????${state.textAdjustments}???????????????);
    }
    if (state.stackedContainers > 0) {
      addAppliedChange(state, `???????????????????????${state.stackedContainers}???????????? ???????嫄??????????????????紐????????????????沅걔???????????????????????);
    }
    if (state.hiddenTopLevelNodes > 0) {
      addAppliedChange(state, `?????????????PC ??????????諛몃마嶺뚮?????????????硫λ젒????????${state.hiddenTopLevelNodes}?????`);
    }
    if (state.topLevelReflowCount > 0) {
      addAppliedChange(state, `???????????????????${state.topLevelReflowCount}???????????? ??????椰??????????????椰????????????癲ル슢?싩땟??????????????????????????????);
    }
    if (state.scaledNodeCount > 0) {
      addAppliedChange(state, `??????????밸븶筌믩끃??獄???????멥렑????????????${state.scaledNodeCount}???????????? ??????椰??????????????椰????????????????椰????????????????????????됰뼸????);
    }
    if (state.spacingAdjustments > 0) {
      addAppliedChange(state, `spacing/padding ${state.spacingAdjustments}?????????嫄????????????);
    }

    */
    /*
    const draftBounds = getNodeBounds(draft);
    addAppliedChange(state, `${Math.round(state.sourceWidth)}px PC??${state.targetWidth}px MO ??????????諛몃마嶺뚮?????????????硫λ젒???????????諛몃마嶺뚮?????????????硫λ젒??????????????);
    if (state.textAdjustments > 0) {
      addAppliedChange(state, `????????釉먮폁??????????????${state.textAdjustments}???????????????);
    }
    if (state.stackedContainers > 0) {
      addAppliedChange(state, `???????????????????????${state.stackedContainers}???????????? ???????嫄??????????????????紐????????????????沅걔???????????????????????);
    }
    if (state.hiddenTopLevelNodes > 0) {
      addAppliedChange(state, `?????????????PC ??????????諛몃마嶺뚮?????????????硫λ젒????????${state.hiddenTopLevelNodes}?????`);
    }
    if (state.skippedSectionCount > 0) {
      addAppliedChange(state, `????????????????????????${state.skippedSectionCount}??????????거?????????);
    }
    if (state.appendedSectionCount > 0) {
      addAppliedChange(state, `???????????????????${state.appendedSectionCount}???????????? ??MO ??????????諛몃마嶺뚮?????????????硫λ젒???????????諛몃마嶺뚮?????????????硫λ젒???????????????);
    }
    if (state.topLevelReflowCount > 0) {
      addAppliedChange(state, `???????????????????${state.topLevelReflowCount}???????????? ??????椰??????????????椰????????????癲ル슢?싩땟???????????????椰???????????????????????????);
    }
    if (state.scaledNodeCount > 0) {
      addAppliedChange(state, `??????????밸븶筌믩끃??獄???????멥렑????????????${state.scaledNodeCount}???????????? ??????椰??????????????椰????????????????椰?????????????????????????);
    }
    if (state.spacingAdjustments > 0) {
      addAppliedChange(state, `spacing/padding ${state.spacingAdjustments}?????????嫄????????????);
    }

    */
    const draftBounds = getNodeBounds(draft);
    addAppliedChange(state, Math.round(state.sourceWidth) + "px PC to " + state.targetWidth + "px MO frame");
    if (state.textAdjustments > 0) {
      addAppliedChange(state, "text resized: " + state.textAdjustments);
    }
    if (state.stackedContainers > 0) {
      addAppliedChange(state, "stacked containers: " + state.stackedContainers);
    }
    if (state.hiddenTopLevelNodes > 0) {
      addAppliedChange(state, "hidden desktop sections: " + state.hiddenTopLevelNodes);
    }
    if (state.skippedSectionCount > 0) {
      addAppliedChange(state, "skipped decorative sections: " + state.skippedSectionCount);
    }
    if (state.appendedSectionCount > 0) {
      addAppliedChange(state, "appended sections: " + state.appendedSectionCount);
    }
    if (state.topLevelReflowCount > 0) {
      addAppliedChange(state, "reflowed sections: " + state.topLevelReflowCount);
    }
    if (state.scaledNodeCount > 0) {
      addAppliedChange(state, "scaled blocks: " + state.scaledNodeCount);
    }
    if (state.spacingAdjustments > 0) {
      addAppliedChange(state, "spacing adjustments: " + state.spacingAdjustments);
    }
    return {
      nodeId: draft.id,
      name: safeName(draft),
      width: draftBounds ? round(draftBounds.width) : targetWidth,
      height: draftBounds ? round(draftBounds.height) : 0,
      createdAt: new Date().toISOString(),
      appliedChanges: state.appliedChanges.slice(0, 6),
    };
  }

  function collectLayoutHintText(result) {
    const values = [];
    const guidance = result && result.guidance ? result.guidance : null;
    if (guidance && Array.isArray(guidance.layoutChanges)) {
      for (let index = 0; index < guidance.layoutChanges.length; index += 1) {
        if (typeof guidance.layoutChanges[index] === "string") {
          values.push(guidance.layoutChanges[index].toLowerCase());
        }
      }
    }
    if (guidance && Array.isArray(guidance.memoryReferences)) {
      for (let index = 0; index < guidance.memoryReferences.length; index += 1) {
        if (typeof guidance.memoryReferences[index] === "string") {
          values.push(guidance.memoryReferences[index].toLowerCase());
        }
      }
    }
    return values.join(" ");
  }

  function collectMemoryTemplateHints(result) {
    const values = [];
    const memory = result && result.memory ? result.memory : null;
    if (!memory) {
      return "";
    }

    if (Array.isArray(memory.repeatedRules)) {
      for (let index = 0; index < memory.repeatedRules.length; index += 1) {
        const entry = memory.repeatedRules[index];
        if (isStructuredMemoryTemplateHint(entry) && typeof entry.summary === "string") {
          values.push(entry.summary.toLowerCase());
        }
      }
    }
    if (Array.isArray(memory.highConfidenceRules)) {
      for (let index = 0; index < memory.highConfidenceRules.length; index += 1) {
        const entry = memory.highConfidenceRules[index];
        if (isStructuredMemoryTemplateHint(entry) && typeof entry.summary === "string") {
          values.push(entry.summary.toLowerCase());
        }
      }
    }
    if (values.length === 0 && Array.isArray(memory.pairRuleReferences)) {
      for (let index = 0; index < memory.pairRuleReferences.length; index += 1) {
        if (typeof memory.pairRuleReferences[index] === "string") {
          values.push(memory.pairRuleReferences[index].toLowerCase());
        }
      }
    }
    return values.join(" ");
  }

  function isHighConfidenceMemoryRuleRecord(record) {
    return numeric(record && record.supportCount) >= 3 && numeric(record && record.avgConfidence) >= 0.9;
  }

  function isStructuredMemoryTemplateHint(entry) {
    if (!entry || typeof entry !== "object" || typeof entry.summary !== "string" || !entry.summary) {
      return false;
    }

    const scope = string(entry.scope, "");
    const ruleType = string(entry.ruleType, "");
    if (scope !== "root") {
      return true;
    }

    return !isRootOnlyTemplateRuleType(ruleType);
  }

  function isRootOnlyTemplateRuleType(ruleType) {
    switch (string(ruleType, "")) {
      case "viewport-width":
      case "frame-aspect-ratio":
      case "frame-shape":
      case "layout-axis":
      case "gap-scale":
      case "padding-scale":
      case "estimated-columns":
      case "font-scale":
        return true;
      default:
        return false;
    }
  }

  function collectAiSectionPlans(result) {
    const guidance = result && result.guidance ? result.guidance : null;
    if (!guidance) {
      return [];
    }
    if (Array.isArray(guidance.sectionPlans) && guidance.sectionPlans.length > 0) {
      return guidance.sectionPlans.slice(0, 12);
    }
    if (guidance.designSpec && Array.isArray(guidance.designSpec.sections)) {
      return convertAiDesignSectionsToSectionPlans(guidance.designSpec.sections).slice(0, 12);
    }
    return [];
  }

  function requiresAiPlanningForAction(action) {
    return action === "mobile-design";
  }

  function hasUsableAiPlanningResult(result) {
    if (!result || typeof result !== "object") {
      return false;
    }
    if (string(result.source, "") === "memory-assisted") {
      return false;
    }
    return collectAiSectionPlans(result).length > 0;
  }

  function ensureRequiredAiPlanningResult(result, action) {
    if (!requiresAiPlanningForAction(action) || hasUsableAiPlanningResult(result)) {
      return;
    }
    throwRequiredAiPlanningError(result, "AI planning missing section plans");
  }

  function throwRequiredAiPlanningError(result, statusLabel, warningText) {
    const resolvedStatus = string(statusLabel, "") || string(result && result.summary && result.summary.aiStatusLabel, "");
    if (result && result.summary && resolvedStatus) {
      result.summary.aiStatusLabel = resolvedStatus;
    }
    if (
      result &&
      result.guidance &&
      Array.isArray(result.guidance.warnings) &&
      warningText &&
      result.guidance.warnings.indexOf(warningText) < 0
    ) {
      result.guidance.warnings.unshift(warningText);
    }
    const error = new Error(
      resolvedStatus
        ? `PC -> MO 변환은 AI 기획이 필수입니다. 현재 AI 상태: ${resolvedStatus}`
        : "PC -> MO 변환은 AI 기획이 필수입니다. AI를 켜고 다시 실행해주세요."
    );
    error.pigmaAiPlanningRequired = true;
    throw error;
  }

  function predictDraftRootFrameGuidance(root, targetWidth, localResult, profiles) {
    const sourceWidth =
      numeric(localResult && localResult.selection && localResult.selection.width) || numeric(root && root.width) || Math.max(1, numeric(targetWidth));
    const sourceHeight =
      numeric(localResult && localResult.selection && localResult.selection.height) || numeric(root && root.height) || Math.max(1, sourceWidth);
    const sourceAspectRatio = getDraftFrameAspectRatio(sourceWidth, sourceHeight);
    const sourceShape = classifyDraftFrameShape(sourceAspectRatio);
    const sourceAspectBucket = bucketDraftFrameAspectRatio(sourceAspectRatio);
    const sourceLayoutMode = normalizeDraftFrameLayoutMode(root && root.layoutMode);
    const rawSections =
      localResult && Array.isArray(localResult.sections)
        ? localResult.sections
        : root && Array.isArray(root.children)
        ? root.children
        : [];
    const sectionCount = Math.max(1, rawSections.length || 1);
    const sectionCountBucket = bucketDraftFrameSectionCount(sectionCount);
    const targetWidthBucket = bucketDraftFrameWidth(targetWidth);
    const list = Array.isArray(profiles) ? profiles : [];
    let best = null;
    let bestScore = 0;

    for (let index = 0; index < list.length; index += 1) {
      const profile = list[index];
      const score = scoreFrameShapeProfileMatch(profile, sourceShape, sourceAspectBucket, sourceLayoutMode, sectionCountBucket, targetWidthBucket);
      if (score > bestScore) {
        best = profile;
        bestScore = score;
      }
    }

    if (!best || bestScore < 0.56) {
      return buildFallbackRootFrameGuidance(sourceAspectRatio, sourceShape, sectionCount, targetWidth, sourceHeight);
    }
    const reliability = evaluateLearnedProfileReliability(best, bestScore, "frame");
    if (reliability.level === "low") {
      return buildFallbackRootFrameGuidance(sourceAspectRatio, sourceShape, sectionCount, targetWidth, sourceHeight);
    }

    const targetAspectRatio = resolveProfileMedian(best, "targetAspectRatio");
    const heightScaleRatio = resolveProfileMedian(best, "heightScaleRatio");
    const targetShape =
      normalizeFrameShapeLabel(string(best && best.dominantTargetShape, "")) || classifyDraftFrameShape(targetAspectRatio || sourceAspectRatio);

    return {
      profileId: string(best && best.id, ""),
      confidence: numeric(best && best.confidence),
      sourceShape: sourceShape,
      targetShape: targetShape,
      sourceAspectRatio: round(sourceAspectRatio),
      targetAspectRatio: round(targetAspectRatio || sourceAspectRatio),
      sectionCount: sectionCount,
      preferTallReflow: targetShape === "tall" || numeric(targetAspectRatio) >= 1.12,
      suggestedHeight: derivePredictedRootFrameHeight(targetWidth, sourceHeight, targetAspectRatio, heightScaleRatio, sectionCount),
      matchScore: round(bestScore),
      confidenceLevel: reliability.level,
      reliabilityScore: reliability.score,
      usingFallback: false,
    };
  }

  function scoreFrameShapeProfileMatch(profile, sourceShape, sourceAspectBucket, sourceLayoutMode, sectionCountBucket, targetWidthBucket) {
    const profileShape = normalizeFrameShapeLabel(string(profile && profile.sourceShape, ""));
    const profileAspectBucket = string(profile && profile.sourceAspectBucket, "");
    const profileLayoutMode = normalizeDraftFrameLayoutMode(profile && profile.sourceLayoutMode);
    const profileSectionBucket = string(profile && profile.sectionCountBucket, "");
    const profileTargetWidthBucket = string(profile && profile.targetWidthBucket, "");
    const sampleCount = numeric(profile && profile.sampleCount);
    const confidence = numeric(profile && profile.confidence);
    const shapeScore = sourceShape && profileShape ? (sourceShape === profileShape ? 1 : 0.42) : 0.62;
    const aspectScore = compareBucketDistance(sourceAspectBucket, profileAspectBucket, getDraftFrameAspectBucketOrder());
    const layoutScore =
      sourceLayoutMode && profileLayoutMode
        ? sourceLayoutMode === profileLayoutMode
          ? 1
          : sourceLayoutMode === "none" || profileLayoutMode === "none"
          ? 0.72
          : 0.48
        : 0.68;
    const sectionScore = compareBucketDistance(sectionCountBucket, profileSectionBucket, getDraftFrameSectionBucketOrder());
    const widthScore = compareBucketDistance(targetWidthBucket, profileTargetWidthBucket, getDraftFrameWidthBucketOrder());
    const supportScore = clamp(Math.min(1, sampleCount / 6) * 0.58 + confidence * 0.42, 0, 1);
    return round(shapeScore * 0.28 + aspectScore * 0.26 + layoutScore * 0.14 + sectionScore * 0.18 + widthScore * 0.08 + supportScore * 0.06);
  }

  function buildFallbackRootFrameGuidance(sourceAspectRatio, sourceShape, sectionCount, targetWidth, sourceHeight) {
    let targetAspectRatio = sourceShape === "wide" ? 1.42 : sourceShape === "balanced" ? 1.18 : clamp(sourceAspectRatio, 1.02, 1.72);
    if (numeric(sourceAspectRatio) <= 0.6) {
      targetAspectRatio += 0.12;
    }
    if (numeric(sectionCount) >= 4) {
      targetAspectRatio += 0.14;
    }
    if (numeric(sectionCount) >= 7) {
      targetAspectRatio += 0.12;
    }
    targetAspectRatio = clamp(targetAspectRatio, 1.02, 1.96);
    const targetShape = classifyDraftFrameShape(targetAspectRatio);
    return {
      profileId: "",
      confidence: 0,
      sourceShape: sourceShape,
      targetShape: targetShape,
      sourceAspectRatio: round(sourceAspectRatio),
      targetAspectRatio: round(targetAspectRatio),
      sectionCount: sectionCount,
      preferTallReflow: targetShape === "tall" || targetAspectRatio >= 1.12,
      suggestedHeight: derivePredictedRootFrameHeight(targetWidth, sourceHeight, targetAspectRatio, 0, sectionCount),
      matchScore: 0,
      confidenceLevel: "low",
      reliabilityScore: 0,
      usingFallback: true,
    };
  }

  function derivePredictedRootFrameHeight(targetWidth, sourceHeight, targetAspectRatio, heightScaleRatio, sectionCount) {
    const ratioHeight = Math.max(480, Math.round(Math.max(1.02, numeric(targetAspectRatio) || 1.12) * Math.max(1, numeric(targetWidth))));
    const scaledHeight =
      sourceHeight > 0 && heightScaleRatio > 0
        ? Math.round(numeric(sourceHeight) * clamp(heightScaleRatio, 0.24, 1.4))
        : 0;
    let nextHeight = Math.max(ratioHeight, scaledHeight);
    if (numeric(sectionCount) >= 4) {
      nextHeight = Math.max(nextHeight, 760);
    }
    if (numeric(sectionCount) >= 7) {
      nextHeight = Math.max(nextHeight, 980);
    }
    return Math.round(clamp(nextHeight, 480, 2200));
  }

  function deriveDraftRootInitialHeight(targetWidth, originalBounds, rootFrameGuidance) {
    const learnedHeight = numeric(rootFrameGuidance && rootFrameGuidance.suggestedHeight);
    if (learnedHeight > 0) {
      return Math.max(480, Math.round(learnedHeight));
    }
    return Math.max(480, numeric(originalBounds && originalBounds.height) || Math.max(480, numeric(targetWidth) * 1.18));
  }

  function prefersTallRootReflow(state) {
    return !!(state && state.rootFrameGuidance && state.rootFrameGuidance.preferTallReflow);
  }

  function getDraftFrameAspectRatio(width, height) {
    return round(numeric(height) / Math.max(1, numeric(width)));
  }

  function classifyDraftFrameShape(aspectRatio) {
    const ratio = numeric(aspectRatio);
    if (ratio >= 1.18) {
      return "tall";
    }
    if (ratio <= 0.82) {
      return "wide";
    }
    return "balanced";
  }

  function normalizeFrameShapeLabel(value) {
    const text = string(value, "").toLowerCase();
    if (text === "wide" || text === "balanced" || text === "tall") {
      return text;
    }
    return "";
  }

  function bucketDraftFrameAspectRatio(aspectRatio) {
    const ratio = numeric(aspectRatio);
    if (ratio <= 0.64) {
      return "0.00-0.64";
    }
    if (ratio <= 0.84) {
      return "0.65-0.84";
    }
    if (ratio <= 1.09) {
      return "0.85-1.09";
    }
    if (ratio <= 1.39) {
      return "1.10-1.39";
    }
    if (ratio <= 1.79) {
      return "1.40-1.79";
    }
    return "1.80+";
  }

  function bucketDraftFrameWidth(width) {
    const value = Math.max(0, numeric(width));
    if (value <= 399) {
      return "320-399";
    }
    if (value <= 767) {
      return "400-767";
    }
    if (value <= 1023) {
      return "768-1023";
    }
    if (value <= 1439) {
      return "1024-1439";
    }
    if (value <= 1919) {
      return "1440-1919";
    }
    return "1920+";
  }

  function bucketDraftFrameSectionCount(count) {
    const value = Math.max(0, Math.round(numeric(count)));
    if (value <= 1) {
      return "1";
    }
    if (value <= 3) {
      return "2-3";
    }
    if (value <= 6) {
      return "4-6";
    }
    return "7+";
  }

  function normalizeDraftFrameLayoutMode(mode) {
    const value = String(mode || "NONE").toLowerCase();
    if (value === "horizontal" || value === "vertical" || value === "none") {
      return value;
    }
    return "none";
  }

  function getDraftFrameAspectBucketOrder() {
    return ["0.00-0.64", "0.65-0.84", "0.85-1.09", "1.10-1.39", "1.40-1.79", "1.80+"];
  }

  function getDraftFrameSectionBucketOrder() {
    return ["1", "2-3", "4-6", "7+"];
  }

  function getDraftFrameWidthBucketOrder() {
    return ["320-399", "400-767", "768-1023", "1024-1439", "1440-1919", "1920+"];
  }

  function writeDraftPluginData(draft, sourceNode, targetWidth) {
    if (!draft || typeof draft.setPluginData !== "function") {
      return;
    }

    try {
      draft.setPluginData("pigma:design-assist", "mobile-draft");
      draft.setPluginData("pigma:design-assist-source-id", String(sourceNode && sourceNode.id ? sourceNode.id : ""));
      draft.setPluginData("pigma:design-assist-target-width", String(targetWidth));
    } catch (error) {}
  }

  function writeResponsiveDraftPluginData(draft, sourceNode, targetWidth, action) {
    if (!draft || typeof draft.setPluginData !== "function") {
      return;
    }

    try {
      draft.setPluginData("pigma:design-assist", action === "pc-design" ? "desktop-draft" : "mobile-draft");
      draft.setPluginData("pigma:design-assist-source-id", String(sourceNode && sourceNode.id ? sourceNode.id : ""));
      draft.setPluginData("pigma:design-assist-target-width", String(targetWidth));
      draft.setPluginData("pigma:design-assist-action", action === "pc-design" ? "pc-design" : "mobile-design");
    } catch (error) {}
  }

  function writeDraftSectionPluginData(node, sectionType, sourceName) {
    if (!node || typeof node.setPluginData !== "function") {
      return;
    }
    try {
      node.setPluginData("pigma:design-assist-section-type", string(sectionType, "section"));
      node.setPluginData("pigma:design-assist-section-name", string(sourceName, ""));
    } catch (error) {}
  }

  function writeDraftTextRolePluginData(node, role, sectionType) {
    if (!node || typeof node.setPluginData !== "function") {
      return;
    }
    try {
      node.setPluginData("pigma:design-assist-text-role", normalizePredictedTextRole(role));
      if (sectionType) {
        node.setPluginData("pigma:design-assist-section-type", string(sectionType, "section"));
      }
    } catch (error) {}
  }

  function writeDraftVisualPolicyPluginData(node, entry, policy, scaleResult) {
    if (!node || typeof node.setPluginData !== "function") {
      return;
    }
    const preserveTargets = Array.isArray(policy && policy.preserveTargets) ? policy.preserveTargets : [];
    try {
      node.setPluginData("pigma:design-assist-visual-role", normalizeVisualSemanticRole(string(entry && entry.semanticRole, "")));
      node.setPluginData("pigma:design-assist-visual-anchor", string(policy && policy.visualAnchor, ""));
      node.setPluginData("pigma:design-assist-crop-mode", string(scaleResult && scaleResult.appliedCropMode, string(policy && policy.cropMode, "")));
      node.setPluginData("pigma:design-assist-crop-overflow", String(round(numeric(scaleResult && scaleResult.cropOverflow))));
      node.setPluginData("pigma:design-assist-crop-limit", String(round(numeric(scaleResult && scaleResult.cropLimit))));
      node.setPluginData("pigma:design-assist-horizontal-bias", string(scaleResult && scaleResult.horizontalBias, string(policy && policy.horizontalBias, "")));
      node.setPluginData("pigma:design-assist-vertical-bias", string(scaleResult && scaleResult.verticalBias, string(policy && policy.verticalBias, "")));
      node.setPluginData("pigma:design-assist-allow-background-trim", policy && policy.allowBackgroundTrim === false ? "false" : "true");
      node.setPluginData("pigma:design-assist-preserve-targets", preserveTargets.join(","));
    } catch (error) {}
  }

  function writeDraftSectionEvidencePluginData(node, evidence) {
    if (!node || typeof node.setPluginData !== "function") {
      return;
    }
    const info = evidence && typeof evidence === "object" ? evidence : {};
    const reasons = Array.isArray(info.reasons) ? info.reasons.filter(Boolean).slice(0, 4) : [];
    try {
      node.setPluginData("pigma:design-assist-evidence-mode", string(info.evidenceMode, ""));
      node.setPluginData("pigma:design-assist-confidence-label", string(info.confidenceLabel, ""));
      node.setPluginData("pigma:design-assist-section-strategy", string(info.sectionStrategy, ""));
      node.setPluginData("pigma:design-assist-builder-type", string(info.builderType, ""));
      node.setPluginData("pigma:design-assist-fallback-reason", string(info.fallbackReason, ""));
      node.setPluginData("pigma:design-assist-learned-layout-count", String(Math.max(0, Math.round(numeric(info.learnedLayoutCount)))));
      node.setPluginData("pigma:design-assist-heuristic-layout-count", String(Math.max(0, Math.round(numeric(info.heuristicLayoutCount)))));
      node.setPluginData("pigma:design-assist-profile-count", String(Math.max(0, Math.round(numeric(info.profileCount)))));
      node.setPluginData("pigma:design-assist-reliability-score", String(round(numeric(info.reliabilityScore))));
      node.setPluginData("pigma:design-assist-evidence-reasons", reasons.join(" | "));
    } catch (error) {}
  }

  function buildDraftQualityReport(state) {
    const allWarnings = state && Array.isArray(state.qualityWarnings) ? state.qualityWarnings : [];
    const allNotes = state && Array.isArray(state.decisionNotes) ? state.decisionNotes : [];
    const warnings = allWarnings.slice(0, 8);
    const notes = allNotes.slice(0, 8);
    const deviceProfile = state && state.deviceProfile ? state.deviceProfile : null;
    return {
      evidenceMode: classifyAssemblyEvidenceMode(
        numeric(state && state.learnedSectionCount),
        numeric(state && state.fallbackSectionCount),
        numeric(state && state.hybridSectionCount)
      ),
      targetWidth: Math.max(0, Math.round(numeric(state && state.targetWidth))),
      deviceProfileKey: string(deviceProfile && deviceProfile.key, ""),
      deviceProfileLabel: string(deviceProfile && deviceProfile.label, ""),
      minTouchTarget: Math.max(0, Math.round(numeric(state && state.minTouchTarget))),
      learnedSectionCount: Math.max(0, Math.round(numeric(state && state.learnedSectionCount))),
      hybridSectionCount: Math.max(0, Math.round(numeric(state && state.hybridSectionCount))),
      fallbackSectionCount: Math.max(0, Math.round(numeric(state && state.fallbackSectionCount))),
      conservativeDecisionCount: Math.max(0, Math.round(numeric(state && state.conservativeDecisionCount))),
      warningCount: allWarnings.length,
      decisionNoteCount: allNotes.length,
      templatedSectionCount: Math.max(0, Math.round(numeric(state && state.templatedSectionCount))),
      rejectedTemplateCount: Math.max(0, Math.round(numeric(state && state.rejectedTemplateCount))),
      warnings: warnings,
      decisionNotes: notes,
    };
  }

  function unlockNodeTree(node) {
    if (!node) {
      return;
    }

    try {
      if ("locked" in node && node.locked === true) {
        node.locked = false;
      }
    } catch (error) {}

    if (Array.isArray(node.children)) {
      for (let index = 0; index < node.children.length; index += 1) {
        unlockNodeTree(node.children[index]);
      }
    }
  }

  function transformNodeTreeForMobileDraft(node, state, depth) {
    if (!node) {
      return;
    }

    if (depth === 0) {
      applyRootDraftSizing(node, state);
      reflowTopLevelSections(node, state);
    }

    if (maybeHideTopLevelNode(node, state, depth)) {
      return;
    }

    if (supportsLayoutEditing(node)) {
      const sectionType = normalizePredictedSectionType(readDraftSectionType(node) || "");
      const learnedLayout = applyLearnedMobileContainerLayout(node, state, depth, sectionType);
      const stacked = learnedLayout ? learnedLayout.stacked : maybeConvertContainerToVertical(node, state, depth);
      const spacingChanged = applyMobileSpacingStrategy(node, state, learnedLayout);
      if (stacked || depth === 0) {
        reorderChildrenByReadingOrder(node);
      }
      if (
        depth > 0 &&
        "layoutSizingHorizontal" in node &&
        node.layoutPositioning !== "ABSOLUTE" &&
        shouldPromoteNodeToFillWidth(node)
      ) {
        try {
          node.layoutSizingHorizontal = "FILL";
        } catch (error) {}
      }
      if (spacingChanged) {
        state.spacingAdjustments += 1;
      }
    }

    if (Array.isArray(node.children)) {
      for (let index = 0; index < node.children.length; index += 1) {
        transformNodeTreeForMobileDraft(node.children[index], state, depth + 1);
      }
    }
  }

  function applyRootDraftSizing(node, state) {
    if (supportsLayoutEditing(node)) {
      try {
        node.layoutMode = "VERTICAL";
      } catch (error) {}
      try {
        node.layoutWrap = "NO_WRAP";
      } catch (error) {}
      try {
        if ("primaryAxisSizingMode" in node) {
          node.primaryAxisSizingMode = "AUTO";
        }
      } catch (error) {}
      try {
        if ("counterAxisSizingMode" in node) {
          node.counterAxisSizingMode = "FIXED";
        }
      } catch (error) {}
      addAppliedChange(state, `${Math.round(state.sourceWidth)}px root adapted into a ${state.targetWidth}px mobile draft`);
    } else {
      addAppliedChange(state, `${Math.round(state.sourceWidth)}px root cloned into a ${state.targetWidth}px draft`);
    }

    resizeNodeForDraft(
      node,
      state.targetWidth,
      deriveDraftRootInitialHeight(state.targetWidth, { height: numeric(node.height) || 1 }, state.rootFrameGuidance)
    );
    tightenAutoLayoutSpacing(node, state);
    try {
      if ("clipsContent" in node) {
        node.clipsContent = true;
      }
    } catch (error) {}
  }

  function reflowTopLevelSections(root, state) {
    if (!root || !Array.isArray(root.children) || root.children.length === 0) {
      return;
    }

    reorderChildrenByReadingOrder(root);

    const contentWidth = getMobileContentWidth(root, state.targetWidth);
    const children = root.children.slice().filter((child) => child && child.visible !== false);
    for (let index = 0; index < children.length; index += 1) {
      const child = children[index];
      if (!child) {
        continue;
      }

      normalizeTopLevelChildForFlow(child);
      if (fitNodeIntoMobileColumn(child, contentWidth, state)) {
        state.topLevelReflowCount += 1;
      }
      promoteChildToFillWidth(child);
    }
  }

  function getMobileContentWidth(root, targetWidth) {
    const paddingLeft = "paddingLeft" in root ? numeric(root.paddingLeft) : 0;
    const paddingRight = "paddingRight" in root ? numeric(root.paddingRight) : 0;
    const horizontalPadding = paddingLeft + paddingRight;
    if (horizontalPadding > 0) {
      return Math.max(220, Math.round(targetWidth - horizontalPadding));
    }
    return Math.max(220, Math.round(targetWidth - 32));
  }

  function normalizeTopLevelChildForFlow(node) {
    if (!node) {
      return;
    }

    const preserveAbsolutePlacement = "layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE";
    if (preserveAbsolutePlacement) {
      return;
    }

    try {
      if ("x" in node) {
        node.x = 0;
      }
      if ("y" in node) {
        node.y = 0;
      }
    } catch (error) {}
  }

  function fitNodeIntoMobileColumn(node, targetWidth, state) {
    const bounds = getNodeBounds(node);
    const currentWidth = bounds ? numeric(bounds.width) : numeric(node && node.width);
    const currentHeight = bounds ? numeric(bounds.height) : numeric(node && node.height);
    if (!currentWidth || currentWidth <= targetWidth * 1.03) {
      return false;
    }

    const scale = targetWidth / currentWidth;
    if (!(scale > 0 && scale < 1)) {
      return false;
    }

    let changed = false;
    if (typeof node.rescale === "function") {
      try {
        node.rescale(scale);
        changed = true;
      } catch (error) {
        changed = false;
      }
    }

    if (!changed && currentHeight > 0) {
      changed = resizeNodeForDraft(node, targetWidth, Math.max(1, Math.round(currentHeight * scale)));
    }

    if (changed) {
      state.scaledNodeCount += 1;
    }
    return changed;
  }

  function promoteChildToFillWidth(node) {
    if (!node) {
      return;
    }

    try {
      if ("layoutSizingHorizontal" in node && node.layoutPositioning !== "ABSOLUTE") {
        node.layoutSizingHorizontal = "FILL";
      }
    } catch (error) {}

    try {
      if ("layoutAlign" in node) {
        node.layoutAlign = "STRETCH";
      }
    } catch (error) {}
  }

  function maybeConvertContainerToVertical(node, state, depth) {
    if (!supportsLayoutEditing(node)) {
      return false;
    }

    const childCount = Array.isArray(node.children) ? node.children.length : 0;
    if (childCount < 2) {
      return false;
    }
    if (shouldPreserveFreeformContainer(node)) {
      return false;
    }

    const layoutMode = String(node.layoutMode || "NONE");
    const bounds = getNodeBounds(node);
    const width = bounds ? numeric(bounds.width) : numeric(node.width);
    const height = bounds ? numeric(bounds.height) : numeric(node.height);
    const tallReflow = prefersTallRootReflow(state);
    const landscapeLike = width > 0 && height > 0 ? width / Math.max(1, height) >= (tallReflow ? 1.05 : 1.2) : false;
    const shouldStack =
      layoutMode === "HORIZONTAL" ||
      (depth === 1 && layoutMode === "NONE" && width >= state.targetWidth * (tallReflow ? 0.92 : 1.1) && (!tallReflow || landscapeLike)) ||
      (layoutMode === "NONE" &&
        childCount >= (tallReflow ? 2 : 3) &&
        width >= state.targetWidth * (tallReflow ? 0.72 : 0.85) &&
        (!tallReflow || landscapeLike));

    if (!shouldStack) {
      return false;
    }

    try {
      node.layoutMode = "VERTICAL";
    } catch (error) {
      return false;
    }

    try {
      if ("layoutWrap" in node) {
        node.layoutWrap = "NO_WRAP";
      }
    } catch (error) {}
    try {
      if ("primaryAxisSizingMode" in node) {
        node.primaryAxisSizingMode = "AUTO";
      }
    } catch (error) {}
    try {
      if ("counterAxisSizingMode" in node) {
        node.counterAxisSizingMode = "AUTO";
      }
    } catch (error) {}

    state.stackedContainers += 1;
    addAppliedChange(state, `${safeName(node)} switched into a mobile stack layout`);
    return true;
  }

  function applyLearnedMobileContainerLayout(node, state, depth, sectionTypeHint) {
    if (!supportsLayoutEditing(node)) {
      return null;
    }

    const childCount = Array.isArray(node.children) ? node.children.length : 0;
    if (childCount < 2) {
      return null;
    }
    if (shouldPreserveFreeformContainer(node)) {
      return null;
    }

    const sectionType = normalizePredictedSectionType(sectionTypeHint || readDraftSectionType(node) || "");
    const profile = findMatchingContainerProfile(node, sectionType, state);
    if (!profile) {
      return null;
    }

    const preferredLayout = normalizeContainerProfileLayoutMode(profile && profile.preferredTargetLayoutMode);
    const targetColumns = resolveLearnedMobileTargetColumns(profile, node, state, childCount);
    const shouldStack = !!(profile.collapseToSingleColumn || preferredLayout === "vertical" || targetColumns <= 1);
    let changed = false;
    let stacked = false;

    if (shouldStack) {
      if (String(node.layoutMode || "NONE") !== "VERTICAL") {
        try {
          node.layoutMode = "VERTICAL";
          changed = true;
          stacked = true;
        } catch (error) {
          return null;
        }
      }
      try {
        if ("layoutWrap" in node) {
          node.layoutWrap = "NO_WRAP";
        }
      } catch (error) {}
      try {
        if ("primaryAxisSizingMode" in node) {
          node.primaryAxisSizingMode = "AUTO";
        }
      } catch (error) {}
      try {
        if ("counterAxisSizingMode" in node) {
          node.counterAxisSizingMode = "AUTO";
        }
      } catch (error) {}
    } else {
      if (String(node.layoutMode || "NONE") !== "HORIZONTAL") {
        try {
          node.layoutMode = "HORIZONTAL";
          changed = true;
        } catch (error) {
          return null;
        }
      }
      try {
        if ("layoutWrap" in node) {
          node.layoutWrap = childCount > targetColumns ? "WRAP" : "NO_WRAP";
        }
      } catch (error) {}
      try {
        if ("primaryAxisSizingMode" in node) {
          node.primaryAxisSizingMode = "AUTO";
        }
      } catch (error) {}
      try {
        if ("counterAxisSizingMode" in node) {
          node.counterAxisSizingMode = "AUTO";
        }
      } catch (error) {}
    }

    const spacingManaged = hasLearnedMobileContainerSpacingProfile(profile);
    const spacingChanged = applyLearnedMobileContainerSpacing(node, profile);
    changed = spacingChanged || changed;
    const childWidth = shouldStack ? 0 : resolveLearnedMobileGridChildWidth(node, targetColumns, profile, state);
    if (childWidth > 0) {
      changed = applyLearnedMobileChildWidths(node, childWidth, targetColumns, state) || changed;
    }

    if (changed && depth <= 1) {
      addDecisionNote(
        state,
        `${safeName(node)} used learned mobile ${shouldStack ? "single-column" : `${targetColumns}-column`} container layout`
      );
    }

    return {
      changed: changed,
      stacked: stacked,
      targetColumns: targetColumns,
      childWidth: childWidth,
      spacingManaged: spacingManaged,
      spacingChanged: spacingChanged,
      profileId: string(profile && profile.id, ""),
      profile: profile,
    };
  }

  function applyMobileSpacingStrategy(node, state, learnedLayout) {
    if (learnedLayout && learnedLayout.spacingChanged) {
      state.spacingAdjustments += 1;
      return true;
    }
    if (learnedLayout && learnedLayout.spacingManaged) {
      return false;
    }
    if (tightenAutoLayoutSpacing(node, state)) {
      state.spacingAdjustments += 1;
      return true;
    }
    return false;
  }

  function resolveLearnedMobileTargetColumns(profile, node, state, childCount) {
    const entries =
      profile && profile.targetColumnDistribution && Array.isArray(profile.targetColumnDistribution.entries)
        ? profile.targetColumnDistribution.entries
        : [];
    let preferred = Math.max(1, Math.round(numeric(profile && profile.preferredTargetColumns) || 1));
    if (profile && profile.collapseToSingleColumn) {
      preferred = 1;
    }

    if (entries.length > 1 && preferred <= 1) {
      const secondaryColumns = parseContainerProfileColumnValue(entries[1] && entries[1].columns);
      const secondaryRatio = numeric(entries[1] && entries[1].ratio);
      const bounds = getNodeBounds(node);
      const width = bounds ? numeric(bounds.width) : numeric(node && node.width);
      if (secondaryColumns === 2 && secondaryRatio >= 0.28 && childCount >= 4 && width >= Math.max(260, numeric(state && state.targetWidth) * 0.62)) {
        preferred = 2;
      }
    }

    const bounds = getNodeBounds(node);
    const width = bounds ? numeric(bounds.width) : numeric(node && node.width);
    if (width > 0 && width < Math.max(220, numeric(state && state.targetWidth) * 0.52)) {
      preferred = 1;
    }
    return Math.max(1, Math.min(Math.max(1, childCount), preferred));
  }

  function parseContainerProfileColumnValue(value) {
    const parsed = Math.round(numeric(value));
    if (parsed > 0) {
      return parsed;
    }
    const fromString = parseInt(String(value || "").replace(/[^\d]/g, ""), 10);
    return isFinite(fromString) && fromString > 0 ? fromString : 0;
  }

  function applyLearnedMobileContainerSpacing(node, profile) {
    if (!node || !profile) {
      return false;
    }

    let changed = false;
    const targetGap = resolveProfileRangeP50(profile, "targetGap");
    const targetPaddingX = resolveProfileRangeP50(profile, "targetPaddingX");
    const targetPaddingY = resolveProfileRangeP50(profile, "targetPaddingY");
    if ("itemSpacing" in node && targetGap > 0) {
      const nextGap = Math.max(0, Math.round(targetGap));
      if (numeric(node.itemSpacing) !== nextGap) {
        try {
          node.itemSpacing = nextGap;
          changed = true;
        } catch (error) {}
      }
    }

    const perSideX = targetPaddingX > 0 ? Math.round(targetPaddingX / 2) : 0;
    const perSideY = targetPaddingY > 0 ? Math.round(targetPaddingY / 2) : 0;
    if (perSideX > 0) {
      changed = setOptionalNumericProperty(node, "paddingLeft", perSideX) || changed;
      changed = setOptionalNumericProperty(node, "paddingRight", perSideX) || changed;
    }
    if (perSideY > 0) {
      changed = setOptionalNumericProperty(node, "paddingTop", perSideY) || changed;
      changed = setOptionalNumericProperty(node, "paddingBottom", perSideY) || changed;
    }
    return changed;
  }

  function hasLearnedMobileContainerSpacingProfile(profile) {
    return (
      resolveProfileRangeP50(profile, "targetGap") > 0 ||
      resolveProfileRangeP50(profile, "targetPaddingX") > 0 ||
      resolveProfileRangeP50(profile, "targetPaddingY") > 0
    );
  }

  function setOptionalNumericProperty(node, propertyName, nextValue) {
    if (!node || !(propertyName in node) || typeof node[propertyName] !== "number" || !isFinite(node[propertyName])) {
      return false;
    }
    if (numeric(node[propertyName]) === numeric(nextValue)) {
      return false;
    }
    try {
      node[propertyName] = numeric(nextValue);
      return true;
    } catch (error) {
      return false;
    }
  }

  function resolveLearnedMobileGridChildWidth(node, targetColumns, profile, state) {
    const bounds = getNodeBounds(node);
    const width = bounds ? numeric(bounds.width) : numeric(node && node.width);
    const paddingLeft = "paddingLeft" in node ? numeric(node.paddingLeft) : 0;
    const paddingRight = "paddingRight" in node ? numeric(node.paddingRight) : 0;
    const gap = resolveProfileRangeP50(profile, "targetGap") || ("itemSpacing" in node ? numeric(node.itemSpacing) : 0);
    const availableWidth = Math.max(180, width > 0 ? width - paddingLeft - paddingRight : Math.max(220, numeric(state && state.targetWidth) - 32));
    return Math.max(140, Math.round((availableWidth - Math.max(0, targetColumns - 1) * gap) / Math.max(1, targetColumns)));
  }

  function applyLearnedMobileChildWidths(node, targetChildWidth, targetColumns, state) {
    if (!node || !Array.isArray(node.children) || !(targetChildWidth > 0)) {
      return false;
    }

    let changed = false;
    for (let index = 0; index < node.children.length; index += 1) {
      const child = node.children[index];
      if (!child || child.visible === false) {
        continue;
      }
      if ("layoutPositioning" in child && child.layoutPositioning === "ABSOLUTE") {
        continue;
      }
      if (child.type === "TEXT") {
        continue;
      }

      if (supportsLayoutEditing(child) && "layoutSizingHorizontal" in child && child.layoutPositioning !== "ABSOLUTE") {
        try {
          child.layoutSizingHorizontal = targetColumns <= 1 ? "FILL" : "FIXED";
        } catch (error) {}
      }

      const childBounds = getNodeBounds(child);
      const currentWidth = childBounds ? numeric(childBounds.width) : numeric(child.width);
      const currentHeight = childBounds ? numeric(childBounds.height) : numeric(child.height);
      if (currentHeight <= 0) {
        continue;
      }
      if (currentWidth > targetChildWidth * 1.06 || currentWidth < targetChildWidth * 0.78) {
        if (resizeNodeForDraft(child, targetChildWidth, Math.max(1, currentHeight))) {
          state.scaledNodeCount += 1;
          changed = true;
        }
      }
    }
    return changed;
  }

  function shouldPromoteNodeToFillWidth(node) {
    const parent = node && node.parent ? node.parent : null;
    if (!parent) {
      return true;
    }
    const parentLayoutMode = String(parent.layoutMode || "NONE");
    const parentWrap = String(parent.layoutWrap || "NO_WRAP");
    return !(parentLayoutMode === "HORIZONTAL" && parentWrap === "WRAP");
  }

  function tightenAutoLayoutSpacing(node, state) {
    let changed = false;

    if ("itemSpacing" in node && typeof node.itemSpacing === "number" && isFinite(node.itemSpacing) && node.itemSpacing > 0) {
      const nextGap = shrinkGapValue(node.itemSpacing);
      if (nextGap !== node.itemSpacing) {
        try {
          node.itemSpacing = nextGap;
          changed = true;
        } catch (error) {}
      }
    }

    changed = updateNumericProperty(node, "paddingLeft", shrinkPaddingValue, changed);
    changed = updateNumericProperty(node, "paddingRight", shrinkPaddingValue, changed);
    changed = updateNumericProperty(node, "paddingTop", shrinkPaddingValue, changed);
    changed = updateNumericProperty(node, "paddingBottom", shrinkPaddingValue, changed);
    return changed;
  }

  function updateNumericProperty(node, propertyName, transformer, changed) {
    if (!(propertyName in node) || typeof node[propertyName] !== "number" || !isFinite(node[propertyName])) {
      return changed;
    }

    const nextValue = transformer(node[propertyName]);
    if (nextValue === node[propertyName]) {
      return changed;
    }

    try {
      node[propertyName] = nextValue;
      return true;
    } catch (error) {
      return changed;
    }
  }

  function shrinkGapValue(value) {
    const amount = numeric(value);
    if (amount >= 40) {
      return 20;
    }
    if (amount >= 24) {
      return 16;
    }
    if (amount >= 16) {
      return 12;
    }
    if (amount >= 12) {
      return 10;
    }
    return Math.max(4, round(amount));
  }

  function shrinkPaddingValue(value) {
    const amount = numeric(value);
    if (amount >= 96) {
      return 24;
    }
    if (amount >= 64) {
      return 20;
    }
    if (amount >= 32) {
      return 16;
    }
    if (amount >= 20) {
      return 12;
    }
    if (amount >= 12) {
      return 10;
    }
    return Math.max(4, round(amount));
  }

  function maybeHideTopLevelNode(node, state, depth) {
    if (depth !== 1 || !node || node.visible === false) {
      return false;
    }

    const name = safeName(node).toLowerCase();
    const matchesDesktopOnly = containsAny(name, ["sidebar", "desktop", "pc only", "gnb", "global nav"]);
    const collapseHint = state.layoutHints.indexOf("section collapses on mobile") >= 0 || state.layoutHints.indexOf("collapse") >= 0;
    if (!matchesDesktopOnly || !collapseHint) {
      return false;
    }

    try {
      node.visible = false;
      state.hiddenTopLevelNodes += 1;
      addAppliedChange(state, `${safeName(node)} hidden in the mobile draft`);
      return true;
    } catch (error) {
      return false;
    }
  }

  function reorderChildrenByReadingOrder(node) {
    if (!node || !Array.isArray(node.children) || typeof node.insertChild !== "function" || node.children.length < 2) {
      return;
    }
    if (shouldPreserveFreeformContainer(node)) {
      return;
    }

    const ordered = node.children
      .map((child, index) => {
        const bounds = getNodeBounds(child);
        return {
          child: child,
          y: bounds ? numeric(bounds.y) : index * 1000,
          x: bounds ? numeric(bounds.x) : index,
          index: index,
        };
      })
      .sort((left, right) => {
        if (Math.abs(left.y - right.y) > 2) {
          return left.y - right.y;
        }
        if (Math.abs(left.x - right.x) > 2) {
          return left.x - right.x;
        }
        return left.index - right.index;
      });

    for (let index = 0; index < ordered.length; index += 1) {
      try {
        node.insertChild(index, ordered[index].child);
      } catch (error) {}
    }
  }

  async function adjustTextNodesForMobileDraft(root, state) {
    const textNodes = [];
    collectTextNodes(root, textNodes);
    for (let index = 0; index < textNodes.length; index += 1) {
      const node = textNodes[index];
      const prediction = predictDraftTextSize(node, state, "", "");
      const nextSize = prediction && prediction.size ? prediction.size : computeMobileFontSize(node, prediction ? prediction.role : "");
      if (!prediction && !nextSize) {
        continue;
      }

      await loadFontsForTextNode(node);
      let changed = false;
      if (prediction) {
        changed = applyPredictedTextStyle(node, prediction) || changed;
      } else if (nextSize) {
        changed = setTextNodeFontSize(node, nextSize) || changed;
      }

      const targetWidth = resolvePredictedTextTargetWidth(node, prediction, getDraftTextAvailableWidth(node, state));
      if (targetWidth > 0) {
        changed = forceFitTextNodeToWidth(node, targetWidth) || changed;
      }

      try {
        if ("textAutoResize" in node && node.textAutoResize !== "HEIGHT") {
          node.textAutoResize = "HEIGHT";
          changed = true;
        }
      } catch (error) {}

      if (changed) {
        state.textAdjustments += 1;
      }
    }
  }

  async function enforceReadableTextMinimumsForMobileDraft(root, state) {
    const scopes = collectMobileTextReadabilityScopes(root);
    for (let scopeIndex = 0; scopeIndex < scopes.length; scopeIndex += 1) {
      const scope = scopes[scopeIndex];
      if (!scope || shouldSkipMobileReadabilityScope(scope)) {
        continue;
      }

      const sectionType = normalizePredictedSectionType(readDraftSectionType(scope) || "");
      const entries = collectMobileTextReadabilityEntries(scope, sectionType);
      for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        const node = entry && entry.node ? entry.node : null;
        if (!node || node.type !== "TEXT") {
          continue;
        }

        const role = normalizePredictedTextRole(entry.role || readDraftTextRole(node) || "body");
        const currentSize = getTemplateTextSize(node);
        const minimumSize = getGuidedMinimumTextSize(role, sectionType);
        const computedMobileSize = computeMobileFontSize(node, role);
        const targetSize = Math.max(minimumSize, computedMobileSize);
        if (!(targetSize > 0) || currentSize + 0.1 >= targetSize) {
          continue;
        }

        await loadFontsForTextNode(node);
        let changed = false;
        if (setTextNodeFontSize(node, targetSize)) {
          changed = true;
        }

        const nextFontSize = getTemplateTextSize(node) || targetSize;
        const currentLineHeight = getDraftTextLineHeight(node, nextFontSize);
        const minimumLineHeight = Math.max(nextFontSize, Math.round(nextFontSize * getDraftTextLineHeightMultiplier(role)));
        if (!(currentLineHeight > 0) || currentLineHeight + 0.5 < minimumLineHeight) {
          changed = setTextNodeLineHeight(node, minimumLineHeight) || changed;
        }

        try {
          if ("textAutoResize" in node && node.textAutoResize !== "HEIGHT") {
            node.textAutoResize = "HEIGHT";
            changed = true;
          }
        } catch (error) {}

        const availableWidth = getDraftTextAvailableWidth(node, state);
        if (availableWidth > 0) {
          changed = forceFitTextNodeToWidth(node, availableWidth) || changed;
        }

        if (changed) {
          state.textAdjustments += 1;
        }
      }
    }
  }

  function collectMobileTextReadabilityScopes(root) {
    const scopes = [];
    if (!root) {
      return scopes;
    }

    if (Array.isArray(root.children)) {
      for (let index = 0; index < root.children.length; index += 1) {
        const child = root.children[index];
        if (!child || child.visible === false) {
          continue;
        }
        scopes.push(child);
      }
    }

    if (scopes.length === 0) {
      scopes.push(root);
    }
    return scopes;
  }

  function shouldSkipMobileReadabilityScope(scope) {
    if (!scope || !Array.isArray(scope.children) || scope.children.length !== 1) {
      return false;
    }

    const child = scope.children[0];
    if (!child || child.visible === false) {
      return false;
    }

    if (child.type === "GROUP" || isSectionBand(child)) {
      return true;
    }

    if (shouldPreserveFreeformContainer(child)) {
      return true;
    }

    return String(child.layoutMode || "NONE") === "NONE" && countAbsoluteChildrenForDraft(child) > 0;
  }

  function collectMobileTextReadabilityEntries(scope, sectionType) {
    const textNodes = [];
    const entries = [];
    collectTextNodes(scope, textNodes);
    for (let index = 0; index < textNodes.length; index += 1) {
      const node = textNodes[index];
      const text = normalizeMeaningfulText(string(node && node.characters, ""));
      if (!node || node.visible === false || !text) {
        continue;
      }
      entries.push({
        node: node,
        text: text,
        bounds: getNodeBounds(node),
        fontSize: getTemplateTextSize(node),
      });
    }

    entries.sort(compareTemplateReadingOrder);
    for (let index = 0; index < entries.length; index += 1) {
      entries[index].role = inferMobileTextReadabilityRole(entries[index], entries, sectionType, index);
    }
    return entries;
  }

  function inferMobileTextReadabilityRole(entry, entries, sectionType, readingIndex) {
    const explicitRole = normalizePredictedTextRole(readDraftTextRole(entry && entry.node));
    if (explicitRole) {
      return explicitRole;
    }

    const heuristicRole = classifyTemplateTextEntryRole(entry, sectionType || "", readingIndex, Array.isArray(entries) ? entries.length : 0);
    if (heuristicRole && heuristicRole !== "body") {
      return heuristicRole;
    }

    const ranked = Array.isArray(entries) ? entries.slice() : [];
    ranked.sort((left, right) => {
      const rightSize = numeric(right && right.fontSize);
      const leftSize = numeric(left && left.fontSize);
      if (rightSize !== leftSize) {
        return rightSize - leftSize;
      }
      return compareTemplateReadingOrder(left, right);
    });

    let sizeRank = -1;
    for (let index = 0; index < ranked.length; index += 1) {
      if (ranked[index] && ranked[index].node && entry && entry.node && ranked[index].node.id === entry.node.id) {
        sizeRank = index;
        break;
      }
    }

    const currentSize = numeric(entry && entry.fontSize);
    const largestSize = numeric(ranked[0] && ranked[0].fontSize);
    const secondSize = numeric(ranked[1] && ranked[1].fontSize);
    const textLength = string(entry && entry.text, "").length;
    if (sizeRank === 0) {
      if (sectionType === "hero" && textLength <= 96) {
        return "headline";
      }
      if (ranked.length === 1 && textLength <= 72) {
        return "headline";
      }
      if (!(secondSize > 0) || currentSize >= secondSize * 1.18 || currentSize - secondSize >= 1.5) {
        return "headline";
      }
    }
    if (sizeRank === 1) {
      if (sectionType === "hero" && textLength <= 120) {
        return "subtitle";
      }
      if (largestSize > 0 && currentSize >= Math.max(12, largestSize * 0.54)) {
        return "subtitle";
      }
    }
    return heuristicRole || "body";
  }

  function transformNodeTreeForDesktopDraft(node, state, depth) {
    if (!node) {
      return;
    }

    if (depth === 0) {
      applyRootDesktopDraftSizing(node, state);
      reflowTopLevelSectionsForDesktop(node, state);
    }

    if (supportsLayoutEditing(node)) {
      const sectionType = normalizePredictedSectionType(readDraftSectionType(node) || "");
      const learnedLayout = applyLearnedDesktopContainerLayout(node, state, depth, sectionType, null);
      const converted = learnedLayout ? !!learnedLayout.changed : maybeConvertContainerToDesktopLayout(node, state, depth, sectionType);
      const spacingChanged = learnedLayout ? false : loosenAutoLayoutSpacing(node, state);
      if (converted) {
        reorderChildrenByReadingOrder(node);
      }
      if (spacingChanged) {
        state.spacingAdjustments += 1;
      }
    }

    if (Array.isArray(node.children)) {
      for (let index = 0; index < node.children.length; index += 1) {
        transformNodeTreeForDesktopDraft(node.children[index], state, depth + 1);
      }
    }
  }

  function applyRootDesktopDraftSizing(node, state) {
    if (supportsLayoutEditing(node)) {
      try {
        node.layoutMode = "VERTICAL";
      } catch (error) {}
      try {
        node.layoutWrap = "NO_WRAP";
      } catch (error) {}
      try {
        if ("primaryAxisSizingMode" in node) {
          node.primaryAxisSizingMode = "AUTO";
        }
      } catch (error) {}
      try {
        if ("counterAxisSizingMode" in node) {
          node.counterAxisSizingMode = "FIXED";
        }
      } catch (error) {}
      try {
        if ("counterAxisAlignItems" in node) {
          node.counterAxisAlignItems = "CENTER";
        }
      } catch (error) {}
      addAppliedChange(state, `${Math.round(state.sourceWidth)}px root adapted into a ${state.targetWidth}px desktop draft`);
    } else {
      addAppliedChange(state, `${Math.round(state.sourceWidth)}px root cloned into a ${state.targetWidth}px desktop draft`);
    }

    resizeNodeForDraft(
      node,
      state.targetWidth,
      deriveDesktopDraftRootInitialHeight(state.targetWidth, { height: numeric(node.height) || 1 }, state.rootFrameGuidance)
    );
    loosenAutoLayoutSpacing(node, state);
    try {
      if ("clipsContent" in node) {
        node.clipsContent = false;
      }
    } catch (error) {}
  }

  function reflowTopLevelSectionsForDesktop(root, state) {
    if (!root || !Array.isArray(root.children) || root.children.length === 0) {
      return;
    }

    reorderChildrenByReadingOrder(root);

    const contentWidth = state && state.targetContentWidth > 0 ? state.targetContentWidth : getDesktopContentWidth(root, state.targetWidth);
    const children = root.children.slice().filter((child) => child && child.visible !== false);
    for (let index = 0; index < children.length; index += 1) {
      const child = children[index];
      if (!child) {
        continue;
      }

      normalizeTopLevelChildForFlow(child);
      if (fitNodeIntoDesktopCanvas(child, contentWidth, state, 1.2)) {
        state.topLevelReflowCount += 1;
      }
    }
  }

  function fitNodeIntoDesktopCanvas(node, targetWidth, state, maxUpscale) {
    const bounds = getNodeBounds(node);
    const currentWidth = bounds ? numeric(bounds.width) : numeric(node && node.width);
    const currentHeight = bounds ? numeric(bounds.height) : numeric(node && node.height);
    if (!(currentWidth > 0) || !(currentHeight > 0)) {
      return false;
    }

    let changed = false;
    if (currentWidth > targetWidth * 1.03) {
      changed = resizeNodeForDraft(node, targetWidth, Math.max(1, Math.round(currentHeight)));
    } else if (currentWidth < targetWidth * 0.72) {
      const scale = clamp(targetWidth / Math.max(1, currentWidth), 1.04, numeric(maxUpscale) > 1 ? numeric(maxUpscale) : 1.24);
      if (typeof node.rescale === "function" && scale > 1.04) {
        try {
          node.rescale(scale);
          changed = true;
        } catch (error) {
          changed = false;
        }
      }
      if (!changed) {
        changed = resizeNodeForDraft(node, targetWidth, Math.max(1, Math.round(currentHeight)));
      }
    }

    if (changed) {
      state.scaledNodeCount += 1;
    }
    return changed;
  }

  function maybeConvertContainerToDesktopLayout(node, state, depth, sectionTypeHint) {
    if (!supportsLayoutEditing(node)) {
      return false;
    }

    const childCount = Array.isArray(node.children) ? node.children.length : 0;
    if (childCount < 2) {
      return false;
    }
    if (shouldPreserveFreeformContainer(node)) {
      return false;
    }

    const sectionType = normalizePredictedSectionType(sectionTypeHint || readDraftSectionType(node) || "");
    const profile = findMatchingContainerProfile(node, sectionType, state);
    const preferredLayout = normalizeContainerProfileLayoutMode(profile && profile.preferredTargetLayoutMode);
    const preferredColumns = Math.max(1, Math.round(numeric(profile && profile.preferredTargetColumns) || 1));
    const layoutMode = String(node.layoutMode || "NONE");
    const bounds = getNodeBounds(node);
    const width = bounds ? numeric(bounds.width) : numeric(node.width);
    const shouldHorizontalize =
      (layoutMode === "VERTICAL" &&
        (preferredLayout === "horizontal" ||
          preferredColumns >= 2 ||
          (depth <= 1 && width > 0 && width <= Math.max(560, state.targetContentWidth * 0.7) && childCount <= 4))) ||
      (layoutMode === "NONE" &&
        countAbsoluteChildrenForDraft(node) === 0 &&
        preferredLayout === "horizontal" &&
        preferredColumns >= 2 &&
        depth <= 1 &&
        childCount <= 4);

    if (!shouldHorizontalize) {
      if (layoutMode === "HORIZONTAL") {
        widenDesktopContainerChildren(node, preferredColumns, state);
      }
      return false;
    }

    try {
      node.layoutMode = "HORIZONTAL";
    } catch (error) {
      return false;
    }
    try {
      if ("layoutWrap" in node) {
        node.layoutWrap = preferredColumns >= 3 || childCount > preferredColumns ? "WRAP" : "NO_WRAP";
      }
    } catch (error) {}
    try {
      if ("primaryAxisSizingMode" in node) {
        node.primaryAxisSizingMode = "AUTO";
      }
    } catch (error) {}
    try {
      if ("counterAxisSizingMode" in node) {
        node.counterAxisSizingMode = "AUTO";
      }
    } catch (error) {}
    widenDesktopContainerChildren(node, preferredColumns, state);
    state.horizontalizedContainers += 1;
    addAppliedChange(state, `${safeName(node)} expanded into a desktop row layout`);
    return true;
  }

  function applyLearnedDesktopContainerLayout(node, state, depth, sectionTypeHint, evidence) {
    if (!supportsLayoutEditing(node)) {
      return null;
    }

    const childCount = Array.isArray(node.children) ? node.children.length : 0;
    if (childCount < 2) {
      return null;
    }
    if (shouldPreserveFreeformContainer(node)) {
      return null;
    }

    const sectionType = normalizePredictedSectionType(sectionTypeHint || readDraftSectionType(node) || "");
    const profile = findMatchingContainerProfile(node, sectionType, state);
    if (!profile) {
      return null;
    }

    const preferredLayout = normalizeContainerProfileLayoutMode(profile && profile.preferredTargetLayoutMode);
    const targetColumns = resolveLearnedDesktopTargetColumns(profile, node, state, childCount);
    const shouldHorizontalize = preferredLayout === "horizontal" || targetColumns >= 2;
    let changed = false;
    let horizontalized = false;

    if (shouldHorizontalize) {
      if (String(node.layoutMode || "NONE") !== "HORIZONTAL") {
        try {
          node.layoutMode = "HORIZONTAL";
          changed = true;
          horizontalized = true;
        } catch (error) {
          return null;
        }
      }
      try {
        if ("layoutWrap" in node) {
          node.layoutWrap = childCount > targetColumns || targetColumns >= 3 ? "WRAP" : "NO_WRAP";
        }
      } catch (error) {}
    } else {
      if (preferredLayout === "vertical" && String(node.layoutMode || "NONE") !== "VERTICAL") {
        try {
          node.layoutMode = "VERTICAL";
          changed = true;
        } catch (error) {
          return null;
        }
      }
      try {
        if ("layoutWrap" in node) {
          node.layoutWrap = "NO_WRAP";
        }
      } catch (error) {}
    }

    try {
      if ("primaryAxisSizingMode" in node) {
        node.primaryAxisSizingMode = "AUTO";
      }
    } catch (error) {}
    try {
      if ("counterAxisSizingMode" in node) {
        node.counterAxisSizingMode = "AUTO";
      }
    } catch (error) {}

    changed = applyLearnedDesktopContainerSpacing(node, profile) || changed;
    const childWidth = shouldHorizontalize ? resolveLearnedDesktopGridChildWidth(node, targetColumns, profile, state) : 0;
    if (childWidth > 0) {
      changed = applyLearnedDesktopChildWidths(node, childWidth, targetColumns, state) || changed;
    }

    if (changed) {
      state.horizontalizedContainers += horizontalized ? 1 : 0;
      if (evidence && typeof evidence === "object") {
        evidence.learnedContainerLayouts = Math.round(numeric(evidence.learnedContainerLayouts) + 1);
        evidence.profileIds = evidence.profileIds || {};
        evidence.profileIds[string(profile && profile.id, "")] = true;
        evidence.reliabilityTotal = numeric(evidence.reliabilityTotal) + numeric(profile && profile._reliabilityScore);
        evidence.reliabilityCount = Math.round(numeric(evidence.reliabilityCount) + 1);
      }
      if (depth <= 1) {
        addDecisionNote(
          state,
          `${safeName(node)} used learned desktop ${shouldHorizontalize ? `${targetColumns}-column` : "vertical"} container layout`
        );
      }
    }

    return {
      changed: changed,
      horizontalized: horizontalized,
      targetColumns: targetColumns,
      childWidth: childWidth,
      profileId: string(profile && profile.id, ""),
      profile: profile,
    };
  }

  function resolveLearnedDesktopTargetColumns(profile, node, state, childCount) {
    const entries =
      profile && profile.targetColumnDistribution && Array.isArray(profile.targetColumnDistribution.entries)
        ? profile.targetColumnDistribution.entries
        : [];
    let preferred = Math.max(1, Math.round(numeric(profile && profile.preferredTargetColumns) || 1));
    let strongestRatio = 0;

    for (let index = 0; index < entries.length; index += 1) {
      const columns = parseContainerProfileColumnValue(entries[index] && entries[index].columns);
      const ratio = numeric(entries[index] && entries[index].ratio);
      if (!(columns > 0) || !(ratio > 0)) {
        continue;
      }
      if (ratio > strongestRatio || (ratio === strongestRatio && columns > preferred)) {
        preferred = columns;
        strongestRatio = ratio;
      }
    }

    const bounds = getNodeBounds(node);
    const width = bounds ? numeric(bounds.width) : numeric(node && node.width);
    const contentWidth = Math.max(900, numeric(state && state.targetContentWidth) || numeric(state && state.targetWidth));
    if (width > 0 && width < contentWidth * 0.42) {
      preferred = Math.min(preferred, 2);
    }
    if (childCount <= 3) {
      preferred = Math.min(preferred, childCount);
    }
    if (childCount >= 6 && preferred < 3 && width >= 960) {
      preferred = 3;
    }
    return Math.max(1, Math.min(Math.max(1, childCount), preferred));
  }

  function applyLearnedDesktopContainerSpacing(node, profile) {
    if (!node || !profile) {
      return false;
    }

    let changed = false;
    const targetGap = resolveProfileRangeP50(profile, "targetGap");
    const targetPaddingX = resolveProfileRangeP50(profile, "targetPaddingX");
    const targetPaddingY = resolveProfileRangeP50(profile, "targetPaddingY");
    if ("itemSpacing" in node && targetGap > 0) {
      const nextGap = Math.max(0, Math.round(targetGap));
      if (numeric(node.itemSpacing) !== nextGap) {
        try {
          node.itemSpacing = nextGap;
          changed = true;
        } catch (error) {}
      }
    }

    const perSideX = targetPaddingX > 0 ? Math.round(targetPaddingX / 2) : 0;
    const perSideY = targetPaddingY > 0 ? Math.round(targetPaddingY / 2) : 0;
    if (perSideX > 0) {
      changed = setOptionalNumericProperty(node, "paddingLeft", perSideX) || changed;
      changed = setOptionalNumericProperty(node, "paddingRight", perSideX) || changed;
    }
    if (perSideY > 0) {
      changed = setOptionalNumericProperty(node, "paddingTop", perSideY) || changed;
      changed = setOptionalNumericProperty(node, "paddingBottom", perSideY) || changed;
    }
    return changed;
  }

  function resolveLearnedDesktopGridChildWidth(node, targetColumns, profile, state) {
    const bounds = getNodeBounds(node);
    const width = bounds ? numeric(bounds.width) : numeric(node && node.width);
    const paddingLeft = "paddingLeft" in node ? numeric(node.paddingLeft) : 0;
    const paddingRight = "paddingRight" in node ? numeric(node.paddingRight) : 0;
    const gap = resolveProfileRangeP50(profile, "targetGap") || ("itemSpacing" in node ? numeric(node.itemSpacing) : 0);
    const availableWidth =
      Math.max(280, width > 0 ? width - paddingLeft - paddingRight : Math.max(960, numeric(state && state.targetContentWidth) - 48));
    return Math.max(220, Math.round((availableWidth - Math.max(0, targetColumns - 1) * gap) / Math.max(1, targetColumns)));
  }

  function applyLearnedDesktopChildWidths(node, targetChildWidth, targetColumns, state) {
    if (!node || !Array.isArray(node.children) || !(targetChildWidth > 0)) {
      return false;
    }

    let changed = false;
    for (let index = 0; index < node.children.length; index += 1) {
      const child = node.children[index];
      if (!child || child.visible === false) {
        continue;
      }
      if ("layoutPositioning" in child && child.layoutPositioning === "ABSOLUTE") {
        continue;
      }
      if (child.type === "TEXT") {
        continue;
      }

      if (supportsLayoutEditing(child) && "layoutSizingHorizontal" in child && child.layoutPositioning !== "ABSOLUTE") {
        try {
          child.layoutSizingHorizontal = targetColumns <= 2 ? "FILL" : "FIXED";
        } catch (error) {}
      }

      const childBounds = getNodeBounds(child);
      const currentWidth = childBounds ? numeric(childBounds.width) : numeric(child.width);
      const currentHeight = childBounds ? numeric(childBounds.height) : numeric(child.height);
      if (!(currentHeight > 0)) {
        continue;
      }
      if (currentWidth > targetChildWidth * 1.12 || currentWidth < targetChildWidth * 0.7) {
        if (resizeNodeForDraft(child, targetChildWidth, Math.max(1, currentHeight))) {
          state.scaledNodeCount += 1;
          changed = true;
        }
      }
    }

    return changed;
  }

  function widenDesktopContainerChildren(node, preferredColumns, state) {
    if (!node || !Array.isArray(node.children) || node.children.length < 2) {
      return false;
    }

    const columns = Math.max(1, Math.round(numeric(preferredColumns) || 1));
    if (columns < 2) {
      return false;
    }

    const bounds = getNodeBounds(node);
    const width = bounds ? numeric(bounds.width) : numeric(node.width);
    const gap = "itemSpacing" in node ? numeric(node.itemSpacing) : 0;
    if (!(width > 0)) {
      return false;
    }

    const usableWidth = Math.max(240, width - Math.max(0, columns - 1) * gap);
    const targetChildWidth = Math.max(220, Math.round(usableWidth / columns));
    let changed = false;

    for (let index = 0; index < node.children.length; index += 1) {
      const child = node.children[index];
      if (!child || child.visible === false) {
        continue;
      }
      if ("layoutPositioning" in child && child.layoutPositioning === "ABSOLUTE") {
        continue;
      }

      if (supportsLayoutEditing(child) && "layoutSizingHorizontal" in child && child.layoutPositioning !== "ABSOLUTE" && columns === 2) {
        try {
          child.layoutSizingHorizontal = "FILL";
          changed = true;
          continue;
        } catch (error) {}
      }

      const childBounds = getNodeBounds(child);
      const childWidth = childBounds ? numeric(childBounds.width) : numeric(child.width);
      const childHeight = childBounds ? numeric(childBounds.height) : numeric(child.height);
      if (childWidth > 0 && childWidth < targetChildWidth * 0.82 && childHeight > 0) {
        if (resizeNodeForDraft(child, targetChildWidth, Math.max(1, Math.round(childHeight)))) {
          state.scaledNodeCount += 1;
          changed = true;
        }
      }
    }

    return changed;
  }

  function loosenAutoLayoutSpacing(node, state) {
    let changed = false;

    if ("itemSpacing" in node && typeof node.itemSpacing === "number" && isFinite(node.itemSpacing) && node.itemSpacing > 0) {
      const nextGap = expandGapValue(node.itemSpacing);
      if (nextGap !== node.itemSpacing) {
        try {
          node.itemSpacing = nextGap;
          changed = true;
        } catch (error) {}
      }
    }

    changed = updateNumericProperty(node, "paddingLeft", expandPaddingValue, changed);
    changed = updateNumericProperty(node, "paddingRight", expandPaddingValue, changed);
    changed = updateNumericProperty(node, "paddingTop", expandPaddingValue, changed);
    changed = updateNumericProperty(node, "paddingBottom", expandPaddingValue, changed);
    return changed;
  }

  function expandGapValue(value) {
    const amount = numeric(value);
    if (amount >= 40) {
      return 56;
    }
    if (amount >= 24) {
      return 36;
    }
    if (amount >= 16) {
      return 28;
    }
    if (amount >= 12) {
      return 20;
    }
    return Math.max(12, round(amount * 1.5));
  }

  function expandPaddingValue(value) {
    const amount = numeric(value);
    if (amount >= 72) {
      return 120;
    }
    if (amount >= 48) {
      return 88;
    }
    if (amount >= 24) {
      return 56;
    }
    if (amount >= 12) {
      return 28;
    }
    return Math.max(16, round(amount * 1.8));
  }

  async function adjustTextNodesForDesktopDraft(root, state) {
    const textNodes = [];
    collectTextNodes(root, textNodes);
    for (let index = 0; index < textNodes.length; index += 1) {
      const node = textNodes[index];
      const prediction = predictDraftTextSize(node, state, "", "");
      const nextSize = prediction && prediction.size ? prediction.size : computeDesktopFontSize(node, prediction ? prediction.role : "");
      if (!prediction && !nextSize) {
        continue;
      }

      await loadFontsForTextNode(node);
      let changed = false;
      if (prediction) {
        changed = applyPredictedTextStyle(node, prediction) || changed;
      } else if (nextSize) {
        changed = setTextNodeFontSize(node, nextSize) || changed;
      }

      const targetWidth = resolvePredictedTextTargetWidth(node, prediction, getDraftTextAvailableWidth(node, state));
      if (targetWidth > 0) {
        changed = forceFitTextNodeToWidth(node, prediction ? targetWidth : Math.round(targetWidth * 0.96)) || changed;
      }

      try {
        if ("textAutoResize" in node && node.textAutoResize !== "HEIGHT") {
          node.textAutoResize = "HEIGHT";
          changed = true;
        }
      } catch (error) {}

      if (changed) {
        state.textAdjustments += 1;
      }
    }
  }

  function computeDesktopFontSize(node, roleHint) {
    const role = normalizePredictedTextRole(roleHint);
    const current = typeof node.fontSize === "number" && isFinite(node.fontSize) ? node.fontSize : 0;
    if (!current) {
      return 0;
    }

    if (role === "headline") {
      if (current <= 32) {
        return Math.max(48, Math.round(current * 1.72));
      }
      if (current <= 64) {
        return Math.max(64, Math.round(current * 1.48));
      }
      return Math.max(72, Math.round(current * 1.24));
    }
    if (role === "subtitle") {
      if (current <= 24) {
        return Math.max(28, Math.round(current * 1.34));
      }
      return Math.max(30, Math.round(current * 1.18));
    }
    if (role === "meta") {
      return Math.max(14, Math.round(current * 1.08));
    }
    if (role === "cta") {
      return Math.max(16, Math.round(current * 1.12));
    }
    if (current <= 14) {
      return 16;
    }
    if (current <= 18) {
      return Math.max(18, Math.round(current * 1.12));
    }
    if (current <= 24) {
      return Math.max(22, Math.round(current * 1.18));
    }
    if (current <= 40) {
      return Math.max(28, Math.round(current * 1.22));
    }
    return Math.max(36, Math.round(current * 1.14));
  }

  function collectTextNodes(node, target) {
    if (!node) {
      return;
    }

    if (node.type === "TEXT") {
      target.push(node);
    }

    if (Array.isArray(node.children)) {
      for (let index = 0; index < node.children.length; index += 1) {
        collectTextNodes(node.children[index], target);
      }
    }
  }

  async function loadFontsForTextNode(node) {
    if (!node || node.type !== "TEXT") {
      return;
    }

    const fontNames = collectEditableFontNames(node);
    for (let index = 0; index < fontNames.length; index += 1) {
      try {
        await figma.loadFontAsync(fontNames[index]);
      } catch (error) {}
    }
  }

  function collectEditableFontNames(node) {
    const fontNames = [];
    const seen = {};
    const pushFont = (fontName) => {
      if (!fontName || typeof fontName !== "object") {
        return;
      }
      if (typeof fontName.family !== "string" || typeof fontName.style !== "string") {
        return;
      }
      const key = `${fontName.family}::${fontName.style}`;
      if (seen[key]) {
        return;
      }
      seen[key] = true;
      fontNames.push({
        family: fontName.family,
        style: fontName.style,
      });
    };

    if (typeof node.getRangeAllFontNames === "function" && typeof node.characters === "string" && node.characters.length > 0) {
      try {
        const rangeFonts = node.getRangeAllFontNames(0, node.characters.length);
        for (let index = 0; index < rangeFonts.length; index += 1) {
          pushFont(rangeFonts[index]);
        }
      } catch (error) {}
    }

    if (fontNames.length === 0 && node.fontName && node.fontName !== figma.mixed && typeof node.fontName === "object") {
      pushFont(node.fontName);
    }

    return fontNames;
  }

  function computeMobileFontSize(node, roleHint) {
    const role = normalizePredictedTextRole(roleHint);
    const name = safeName(node).toLowerCase();
    const current = typeof node.fontSize === "number" && isFinite(node.fontSize) ? node.fontSize : 0;
    if (!current) {
      return 0;
    }
    if (role === "headline") {
      if (current >= 180) {
        return Math.max(72, Math.round(current * 0.43));
      }
      if (current >= 96) {
        return Math.max(48, Math.round(current * 0.52));
      }
    }
    if (role === "subtitle") {
      if (current >= 40) {
        return Math.max(22, Math.round(current * 0.62));
      }
    }
    if (role === "meta") {
      if (current >= 18) {
        return Math.max(14, Math.round(current * 0.78));
      }
    }
    if (role === "cta") {
      if (current >= 18) {
        return Math.max(15, Math.round(current * 0.84));
      }
    }
    if (name.indexOf("hero-copy-headline") >= 0) {
      return Math.max(40, Math.round(current * 0.94));
    }
    if (name.indexOf("hero-copy-subtitle") >= 0) {
      return Math.max(22, Math.round(current * 0.96));
    }
    if (name.indexOf("hero-copy-body") >= 0) {
      return Math.max(16, Math.round(current * 0.98));
    }
    if (current >= 56) {
      return Math.max(36, Math.round(current * 0.88));
    }
    if (current >= 40) {
      return Math.max(28, Math.round(current * 0.82));
    }
    if (current >= 28) {
      return Math.max(22, Math.round(current * 0.86));
    }
    if (current >= 20) {
      return Math.max(18, Math.round(current * 0.92));
    }
    if (current >= 16) {
      return Math.max(16, Math.round(current * 0.98));
    }
    if (current >= 12) {
      return Math.max(14, Math.round(current));
    }
    return Math.max(12, Math.round(current));
  }

  function predictDraftTextSize(node, state, roleHint, sectionTypeHint) {
    if (!node || node.type !== "TEXT") {
      return null;
    }

    const currentSize = getTemplateTextSize(node);
    const profiles = state && Array.isArray(state.textRoleProfiles) ? state.textRoleProfiles : [];
    if (!currentSize || profiles.length === 0) {
      return null;
    }

    const role = normalizePredictedTextRole(roleHint || readDraftTextRole(node) || deriveTemplateTextRole(node));
    const sectionType = normalizePredictedSectionType(sectionTypeHint || readDraftSectionType(node) || "");
    const charCount = string(node.characters, "").replace(/\s+/g, " ").trim().length;
    const sourceFontBucket = bucketPredictedFontSize(currentSize);
    const charBucket = bucketPredictedCharCount(charCount);
    const align = string(node.textAlignHorizontal, "").toLowerCase();
    let best = null;
    let bestScore = 0;

    for (let index = 0; index < profiles.length; index += 1) {
      const profile = profiles[index];
      if (!profile || typeof profile !== "object") {
        continue;
      }

      const score = scoreTextRoleProfileMatch(profile, role, sectionType, sourceFontBucket, charBucket, align);
      if (score > bestScore) {
        best = profile;
        bestScore = score;
      }
    }

    if (!best || bestScore < 0.56) {
      return null;
    }
    const reliability = evaluateLearnedProfileReliability(best, bestScore, "text");
    if (reliability.level === "low") {
      return null;
    }

    const ratio = resolveProfileMedian(best, "fontScaleRatio");
    if (!(ratio > 0)) {
      return null;
    }

    let targetSize = currentSize * ratio;
    const targetFont = best.targetFontSize && typeof best.targetFontSize === "object" ? best.targetFontSize : null;
    if (targetFont && numeric(targetFont.p50) > 0) {
      targetSize = targetSize * 0.68 + numeric(targetFont.p50) * 0.32;
    }
    const sizeBlend = reliability.level === "high" ? 0.84 : 0.58;
    targetSize = currentSize * (1 - sizeBlend) + targetSize * sizeBlend;

    const guidanceMinimum = getGuidedMinimumTextSize(role, sectionType);
    const lowerBound = Math.max(
      guidanceMinimum,
      targetFont && numeric(targetFont.min) > 0 ? Math.min(numeric(targetFont.min), numeric(targetFont.p50) || numeric(targetFont.min)) : 0
    );
    const upperBound = targetFont && numeric(targetFont.max) > 0 ? numeric(targetFont.max) : currentSize;
    targetSize = clamp(targetSize, lowerBound || 10, upperBound > 0 ? Math.max(lowerBound || 10, upperBound) : currentSize);

    const learnedLineHeightRatio = resolveProfileMedian(best, "lineHeightRatio");
    const learnedWidthRatio = resolveProfileMedian(best, "widthRatio");
    const learnedLineCount = Math.max(0, Math.round(resolveProfileMedian(best, "targetLineCount")));
    return {
      size: Math.max(1, Math.round(targetSize)),
      role: role || normalizePredictedTextRole(string(best.textRole, "")),
      sectionType: sectionType || normalizePredictedSectionType(string(best.sectionType, "")),
      align: resolvePredictedProfileAlign(best, sectionType, role),
      alignConfidence: getPredictedProfileAlignConfidence(best),
      lineHeightRatio: blendProfileMetric(learnedLineHeightRatio, 1, reliability.level === "high" ? 0.9 : 0.55),
      widthRatio: blendProfileMetric(learnedWidthRatio, 1, reliability.level === "high" ? 0.88 : 0.5),
      targetLineCount:
        reliability.level === "high"
          ? learnedLineCount
          : Math.max(0, Math.round(blendProfileMetric(learnedLineCount, countDraftTextLines(node), 0.45))),
      alignDistribution: best && best.alignDistribution && typeof best.alignDistribution === "object" ? best.alignDistribution : null,
      confidence: numeric(best.confidence),
      matchScore: bestScore,
      sampleCount: Math.max(0, Math.round(numeric(best.sampleCount))),
      reliabilityLevel: reliability.level,
      conservative: reliability.level !== "high",
      profileId: string(best.id, ""),
    };
  }

  function scoreTextRoleProfileMatch(profile, role, sectionType, fontBucket, charBucket, align) {
    const profileRole = normalizePredictedTextRole(string(profile && profile.textRole, ""));
    const profileSection = normalizePredictedSectionType(string(profile && profile.sectionType, ""));
    const profileFontBucket = string(profile && profile.sourceFontBucket, "");
    const profileCharBucket = string(profile && profile.charBucket, "");
    const sampleCount = numeric(profile && profile.sampleCount);
    const confidence = numeric(profile && profile.confidence);
    const roleScore = role ? (role === profileRole ? 1 : arePredictedRolesCompatible(role, profileRole)) : 0.62;
    const sectionScore = sectionType ? getSectionTypeCompatibility(sectionType, profileSection) : 0.62;
    const fontScore = compareBucketDistance(fontBucket, profileFontBucket, getPredictedFontBucketOrder());
    const charScore = compareBucketDistance(charBucket, profileCharBucket, getPredictedCharBucketOrder());
    const alignScore = getProfileAlignMatchScore(profile, align);
    const supportScore = clamp(Math.min(1, sampleCount / 6) * 0.6 + confidence * 0.4, 0, 1);
    return round(roleScore * 0.34 + sectionScore * 0.3 + fontScore * 0.17 + charScore * 0.09 + alignScore * 0.04 + supportScore * 0.06);
  }

  function getProfileAlignMatchScore(profile, align) {
    const normalizedAlign = normalizeTextAlignLabel(align);
    const preferred = normalizeTextAlignLabel(string(profile && profile.preferredAlign, ""));
    const distribution = profile && profile.alignDistribution && typeof profile.alignDistribution === "object" ? profile.alignDistribution : null;
    const entries = distribution && Array.isArray(distribution.entries) ? distribution.entries : [];
    if (!normalizedAlign) {
      return 0.84;
    }
    for (let index = 0; index < entries.length; index += 1) {
      const entryAlign = normalizeTextAlignLabel(entries[index] && entries[index].align);
      if (!entryAlign || entryAlign !== normalizedAlign) {
        continue;
      }
      return clamp(0.42 + numeric(entries[index].ratio) * 0.58, 0.42, 1);
    }
    if (preferred && preferred === normalizedAlign) {
      return 0.82;
    }
    if (entries.length > 0) {
      return numeric(entries[0].ratio) >= 0.58 ? 0.36 : 0.54;
    }
    return 0.62;
  }

  function blendProfileMetric(learnedValue, fallbackValue, blend) {
    const learned = numeric(learnedValue);
    const fallback = numeric(fallbackValue);
    if (!(learned > 0)) {
      return fallback;
    }
    const amount = clamp(numeric(blend), 0, 1);
    return round(fallback * (1 - amount) + learned * amount);
  }

  function evaluateLearnedProfileReliability(profile, matchScore, profileType) {
    const sampleCount = Math.max(0, Math.round(numeric(profile && profile.sampleCount)));
    const confidence = clamp(numeric(profile && profile.confidence), 0, 1);
    const match = clamp(numeric(matchScore), 0, 1);
    const type = string(profileType, "").toLowerCase();
    const sampleWeight = type === "text" ? 5 : 4;
    const sampleScore = clamp(sampleCount / sampleWeight, 0, 1);
    const score = round(sampleScore * 0.44 + confidence * 0.34 + match * 0.22);
    if (score >= 0.78 && sampleCount >= 4) {
      return { level: "high", score: score, sampleCount: sampleCount, confidence: confidence, matchScore: match };
    }
    if (score >= 0.52 && sampleCount >= 2) {
      return { level: "medium", score: score, sampleCount: sampleCount, confidence: confidence, matchScore: match };
    }
    return { level: "low", score: score, sampleCount: sampleCount, confidence: confidence, matchScore: match };
  }

  function resolveProfileMedian(profile, key) {
    const group = profile && profile[key] && typeof profile[key] === "object" ? profile[key] : null;
    if (!group) {
      return 0;
    }
    return numeric(typeof group.p50 !== "undefined" ? group.p50 : group.median);
  }

  function resolvePredictedProfileAlign(profile, sectionType, role) {
    const distribution = profile && profile.alignDistribution && typeof profile.alignDistribution === "object" ? profile.alignDistribution : null;
    const entries = distribution && Array.isArray(distribution.entries) ? distribution.entries : [];
    const preferred = normalizeTextAlignLabel(string(profile && profile.preferredAlign, ""));
    if (entries.length > 0) {
      const top = entries[0];
      if (top && normalizeTextAlignLabel(top.align) && numeric(top.ratio) >= 0.5) {
        return normalizeTextAlignLabel(top.align);
      }
    }
    if (preferred) {
      return preferred;
    }
    if (normalizePredictedSectionType(sectionType) === "hero" && normalizePredictedTextRole(role) === "headline") {
      return "center";
    }
    return "";
  }

  function getPredictedProfileAlignConfidence(profile) {
    const distribution = profile && profile.alignDistribution && typeof profile.alignDistribution === "object" ? profile.alignDistribution : null;
    const entries = distribution && Array.isArray(distribution.entries) ? distribution.entries : [];
    if (entries.length === 0) {
      return 0;
    }
    return numeric(entries[0].ratio);
  }

  function applyPredictedTextAlignment(node, align) {
    if (!node || node.type !== "TEXT") {
      return false;
    }
    const normalized = normalizeTextAlignLabel(align);
    const figmaAlign = mapPredictedAlignToFigma(normalized);
    if (!figmaAlign) {
      return false;
    }
    try {
      if ("textAlignHorizontal" in node) {
        node.textAlignHorizontal = figmaAlign;
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  function applyPredictedTextStyle(node, prediction) {
    if (!node || node.type !== "TEXT" || !prediction || typeof prediction !== "object") {
      return false;
    }

    let changed = false;
    const nextSize = Math.max(0, Math.round(numeric(prediction.size)));
    if (nextSize > 0) {
      changed = setTextNodeFontSize(node, nextSize) || changed;
    }
    changed = applyPredictedTextLineHeight(node, prediction) || changed;
    if (prediction.align && numeric(prediction.alignConfidence) >= 0.42) {
      changed = applyPredictedTextAlignment(node, prediction.align) || changed;
    }
    try {
      if ("textAutoResize" in node && node.textAutoResize !== "HEIGHT") {
        node.textAutoResize = "HEIGHT";
        changed = true;
      }
    } catch (error) {}
    return changed;
  }

  function applyPredictedTextLineHeight(node, prediction) {
    if (!node || node.type !== "TEXT" || !prediction || typeof prediction !== "object") {
      return false;
    }
    const ratio = numeric(prediction.lineHeightRatio);
    const fontSize = getTemplateTextSize(node);
    if (!(ratio > 0 && fontSize > 0)) {
      return false;
    }

    const role = normalizePredictedTextRole(string(prediction.role, ""));
    const currentLineHeight = getDraftTextLineHeight(node, fontSize);
    const baseLineHeight = currentLineHeight > 0 ? currentLineHeight : fontSize * getDraftTextLineHeightMultiplier(role);
    const lowerBound = fontSize * (role === "body" ? 1.18 : role === "subtitle" ? 1.1 : 1.02);
    const upperBound = fontSize * (role === "body" ? 1.84 : role === "headline" ? 1.42 : 1.56);
    const nextLineHeight = clamp(baseLineHeight * ratio, lowerBound, Math.max(lowerBound, upperBound));
    return setTextNodeLineHeight(node, nextLineHeight);
  }

  function resolvePredictedTextTargetWidth(node, prediction, maxWidth) {
    if (!node || node.type !== "TEXT") {
      return 0;
    }
    const bounds = getNodeBounds(node);
    const currentWidth = bounds ? numeric(bounds.width) : numeric(node.width);
    const capWidth = numeric(maxWidth);
    if (!(currentWidth > 0) && !(capWidth > 0)) {
      return 0;
    }

    const role = normalizePredictedTextRole(string(prediction && prediction.role, ""));
    const charCount = string(node.characters, "").replace(/\s+/g, " ").trim().length;
    const widthRatio = numeric(prediction && prediction.widthRatio);
    const targetLineCount = Math.max(0, Math.round(numeric(prediction && prediction.targetLineCount)));
    const lineWidthRatio = derivePredictedLineWidthRatio(targetLineCount, role, charCount);
    let resolvedRatio = 0;
    if (widthRatio > 0 && lineWidthRatio > 0) {
      resolvedRatio = clamp(widthRatio * 0.72 + lineWidthRatio * 0.28, 0.28, 1.12);
    } else {
      resolvedRatio = widthRatio > 0 ? widthRatio : lineWidthRatio;
    }

    let targetWidth = currentWidth > 0 && resolvedRatio > 0 ? currentWidth * resolvedRatio : 0;
    if (targetLineCount > 0) {
      const minimumWidth = derivePredictedTextWidthFloor(
        numeric(prediction && prediction.size) || getTemplateTextSize(node),
        charCount,
        targetLineCount,
        role
      );
      if (minimumWidth > 0) {
        targetWidth = targetWidth > 0 ? Math.max(targetWidth, minimumWidth) : minimumWidth;
      }
    }

    if (!(targetWidth > 0)) {
      return capWidth > 0 ? capWidth : 0;
    }

    const lowerBound = capWidth > 0 ? Math.min(capWidth, Math.max(96, capWidth * 0.42)) : Math.max(96, currentWidth * 0.32);
    const upperBound = capWidth > 0 ? Math.max(lowerBound, capWidth) : Math.max(lowerBound, currentWidth);
    return clamp(targetWidth, lowerBound, upperBound);
  }

  function derivePredictedLineWidthRatio(targetLineCount, role, charCount) {
    const lines = Math.max(0, Math.round(numeric(targetLineCount)));
    if (!(lines > 0)) {
      return 0;
    }
    let ratio = 1;
    if (lines >= 5) {
      ratio = 0.52;
    } else if (lines === 4) {
      ratio = 0.6;
    } else if (lines === 3) {
      ratio = 0.7;
    } else if (lines === 2) {
      ratio = 0.84;
    }
    const normalizedRole = normalizePredictedTextRole(role);
    if (normalizedRole === "body") {
      ratio += 0.08;
    } else if (normalizedRole === "headline") {
      ratio -= 0.04;
    }
    if (numeric(charCount) >= 48) {
      ratio += 0.06;
    } else if (numeric(charCount) <= 10) {
      ratio -= 0.04;
    }
    return clamp(ratio, 0.38, 1.08);
  }

  function derivePredictedTextWidthFloor(fontSize, charCount, targetLineCount, role) {
    const size = numeric(fontSize);
    const chars = Math.max(1, Math.round(numeric(charCount)));
    const lines = Math.max(1, Math.round(numeric(targetLineCount)));
    if (!(size > 0)) {
      return 0;
    }
    const charsPerLine = Math.max(1, Math.ceil(chars / lines));
    const normalizedRole = normalizePredictedTextRole(role);
    const glyphFactor = normalizedRole === "body" ? 0.5 : normalizedRole === "headline" ? 0.58 : 0.54;
    return Math.max(96, Math.round(charsPerLine * size * glyphFactor + size * 1.1));
  }

  function getDraftTextAvailableWidth(node, state) {
    const parent = node && node.parent ? node.parent : null;
    const parentBounds = getNodeBounds(parent);
    const fallbackWidth = Math.max(120, Math.round(numeric(state && state.targetWidth) - 32));
    if (!parentBounds) {
      return fallbackWidth;
    }
    const horizontalPadding =
      ("paddingLeft" in parent ? numeric(parent.paddingLeft) : 0) + ("paddingRight" in parent ? numeric(parent.paddingRight) : 0);
    return Math.max(120, Math.min(Math.round(numeric(parentBounds.width) - horizontalPadding), fallbackWidth));
  }

  function getDraftTextLineHeight(node, fontSize) {
    if (!node || node.type !== "TEXT") {
      return 0;
    }
    const lineHeight = node.lineHeight;
    if (lineHeight && lineHeight !== figma.mixed && typeof lineHeight === "object") {
      const unit = string(lineHeight.unit, "").toUpperCase();
      const value = numeric(lineHeight.value);
      if (unit === "PIXELS" && value > 0) {
        return round(value);
      }
      if (unit === "PERCENT" && value > 0 && fontSize > 0) {
        return round((fontSize * value) / 100);
      }
    }
    const bounds = getNodeBounds(node);
    const explicitLines = countDraftTextLines(node);
    if (bounds && explicitLines > 0) {
      return round(numeric(bounds.height) / Math.max(1, explicitLines));
    }
    return 0;
  }

  function countDraftTextLines(node) {
    const text = string(node && node.characters, "");
    if (!text) {
      return 0;
    }
    return text.split(/\r?\n/).length;
  }

  function getDraftTextLineHeightMultiplier(role) {
    const normalizedRole = normalizePredictedTextRole(role);
    if (normalizedRole === "body") {
      return 1.42;
    }
    if (normalizedRole === "headline") {
      return 1.08;
    }
    if (normalizedRole === "subtitle") {
      return 1.16;
    }
    return 1.22;
  }

  function setTextNodeLineHeight(node, nextLineHeight) {
    if (!node || node.type !== "TEXT" || !(numeric(nextLineHeight) > 0)) {
      return false;
    }
    const value = {
      unit: "PIXELS",
      value: round(Math.max(1, numeric(nextLineHeight))),
    };
    try {
      if (node.lineHeight !== figma.mixed) {
        node.lineHeight = value;
        return true;
      }
      if (typeof node.setRangeLineHeight === "function" && typeof node.characters === "string") {
        node.setRangeLineHeight(0, node.characters.length, value);
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  function readDraftTextRole(node) {
    return readDraftPluginData(node, "pigma:design-assist-text-role");
  }

  function readDraftVisualPolicyData(node) {
    const role = normalizeVisualSemanticRole(readDraftPluginData(node, "pigma:design-assist-visual-role"));
    const anchor = string(readDraftPluginData(node, "pigma:design-assist-visual-anchor"), "");
    const cropMode = string(readDraftPluginData(node, "pigma:design-assist-crop-mode"), "");
    const cropOverflow = numeric(readDraftPluginData(node, "pigma:design-assist-crop-overflow"));
    const cropLimit = numeric(readDraftPluginData(node, "pigma:design-assist-crop-limit"));
    const horizontalBias = string(readDraftPluginData(node, "pigma:design-assist-horizontal-bias"), "");
    const verticalBias = string(readDraftPluginData(node, "pigma:design-assist-vertical-bias"), "");
    const allowBackgroundTrim = readDraftPluginData(node, "pigma:design-assist-allow-background-trim") !== "false";
    const preserveTargetsRaw = string(readDraftPluginData(node, "pigma:design-assist-preserve-targets"), "");
    const preserveTargets = preserveTargetsRaw
      ? preserveTargetsRaw
          .split(",")
          .map((value) => normalizeVisualSemanticRole(value))
          .filter(Boolean)
      : [];
    if (!role && !anchor && !cropMode) {
      return null;
    }
    return {
      role: role,
      visualAnchor: anchor,
      cropMode: cropMode,
      cropOverflow: cropOverflow,
      cropLimit: cropLimit,
      horizontalBias: horizontalBias,
      verticalBias: verticalBias,
      allowBackgroundTrim: allowBackgroundTrim,
      preserveTargets: preserveTargets,
    };
  }

  function readDraftSectionType(node) {
    let current = node;
    while (current) {
      const sectionType = readDraftPluginData(current, "pigma:design-assist-section-type");
      if (sectionType) {
        return sectionType;
      }
      current = current.parent || null;
    }
    return "";
  }

  function readDraftPluginData(node, key) {
    if (!node || typeof node.getPluginData !== "function") {
      return "";
    }
    try {
      return string(node.getPluginData(key), "");
    } catch (error) {
      return "";
    }
  }

  function normalizePredictedTextRole(role) {
    const value = string(role, "").toLowerCase();
    if (value === "eyebrow") {
      return "meta";
    }
    if (["headline", "subtitle", "body", "meta", "cta"].indexOf(value) >= 0) {
      return value;
    }
    return "";
  }

  function normalizePredictedSectionType(sectionType) {
    const value = string(sectionType, "").toLowerCase();
    if (!value) {
      return "";
    }
    if (value === "editorial") {
      return "article";
    }
    if (value === "visual") {
      return "hero";
    }
    return value;
  }

  function normalizeTextAlignLabel(value) {
    const text = string(value, "").toLowerCase();
    if (!text) {
      return "";
    }
    if (text === "justified" || text === "justify") {
      return "justified";
    }
    if (text === "centre") {
      return "center";
    }
    if (["left", "center", "right"].indexOf(text) >= 0) {
      return text;
    }
    return "";
  }

  function mapPredictedAlignToFigma(value) {
    const text = normalizeTextAlignLabel(value);
    if (text === "left") {
      return "LEFT";
    }
    if (text === "center") {
      return "CENTER";
    }
    if (text === "right") {
      return "RIGHT";
    }
    if (text === "justified") {
      return "JUSTIFIED";
    }
    return "";
  }

  function normalizeVisualSemanticRole(value) {
    const text = string(value, "").toLowerCase();
    if (["background", "supporting", "product", "person", "logo", "decorative"].indexOf(text) >= 0) {
      return text;
    }
    return "";
  }

  function normalizeVisualBias(value, fallback) {
    const text = string(value, "").toLowerCase();
    if (["left", "center", "right", "top", "bottom"].indexOf(text) >= 0) {
      return text;
    }
    return string(fallback, "");
  }

  function getSectionTypeCompatibility(left, right) {
    const normalizedLeft = normalizePredictedSectionType(left);
    const normalizedRight = normalizePredictedSectionType(right);
    if (!normalizedLeft || !normalizedRight) {
      return 0.58;
    }
    if (normalizedLeft === normalizedRight) {
      return 1;
    }
    return areTemplateSectionTypesCompatible(normalizedLeft, normalizedRight);
  }

  function arePredictedRolesCompatible(left, right) {
    if (!left || !right) {
      return 0;
    }
    if (left === right) {
      return 1;
    }
    if ((left === "meta" && right === "subtitle") || (left === "subtitle" && right === "meta")) {
      return 0.58;
    }
    if ((left === "subtitle" && right === "headline") || (left === "headline" && right === "subtitle")) {
      return 0.48;
    }
    if ((left === "body" && right === "subtitle") || (left === "subtitle" && right === "body")) {
      return 0.44;
    }
    return 0;
  }

  function getGuidedMinimumTextSize(role, sectionType) {
    if (role === "headline") {
      return sectionType === "hero" ? 40 : 24;
    }
    if (role === "subtitle") {
      return 18;
    }
    if (role === "meta") {
      return 12;
    }
    if (role === "cta") {
      return 14;
    }
    return 14;
  }

  function bucketPredictedFontSize(size) {
    const value = numeric(size);
    if (value < 16) {
      return "0-15";
    }
    if (value < 24) {
      return "16-23";
    }
    if (value < 32) {
      return "24-31";
    }
    if (value < 48) {
      return "32-47";
    }
    if (value < 64) {
      return "48-63";
    }
    if (value < 80) {
      return "64-79";
    }
    if (value < 112) {
      return "80-111";
    }
    if (value < 160) {
      return "112-159";
    }
    if (value < 220) {
      return "160-219";
    }
    if (value < 320) {
      return "220-319";
    }
    return "320+";
  }

  function bucketPredictedCharCount(count) {
    const value = numeric(count);
    if (value <= 5) {
      return "1-5";
    }
    if (value <= 11) {
      return "6-11";
    }
    if (value <= 19) {
      return "12-19";
    }
    if (value <= 31) {
      return "20-31";
    }
    if (value <= 47) {
      return "32-47";
    }
    return "48+";
  }

  function compareBucketDistance(left, right, order) {
    const buckets = Array.isArray(order) ? order : [];
    const leftIndex = buckets.indexOf(left);
    const rightIndex = buckets.indexOf(right);
    if (leftIndex < 0 || rightIndex < 0) {
      return 0.42;
    }
    const distance = Math.abs(leftIndex - rightIndex);
    if (distance === 0) {
      return 1;
    }
    if (distance === 1) {
      return 0.82;
    }
    if (distance === 2) {
      return 0.62;
    }
    if (distance === 3) {
      return 0.45;
    }
    return 0.24;
  }

  function getPredictedFontBucketOrder() {
    return ["0-15", "16-23", "24-31", "32-47", "48-63", "64-79", "80-111", "112-159", "160-219", "220-319", "320+"];
  }

  function getPredictedCharBucketOrder() {
    return ["1-5", "6-11", "12-19", "20-31", "32-47", "48+"];
  }

  function positionDraftNode(sourceNode, draftNode, sourceBounds) {
    if (!draftNode || typeof draftNode.x !== "number" || typeof draftNode.y !== "number") {
      return;
    }

    try {
      draftNode.x = numeric(sourceNode.x) + numeric(sourceBounds.width) + DRAFT_SPACING;
      draftNode.y = numeric(sourceNode.y);
    } catch (error) {}
  }

  function minimizeGeneratedAutoLayoutFrames(draft, state) {
    if (!draft) {
      return;
    }
    unwrapDraftSectionSlots(draft);
    freezeGeneratedAutoLayoutSubtree(draft, draft);
    if (state) {
      addDecisionNote(state, "Kept only the root draft in auto layout and flattened inner helper frames where possible");
    }
  }

  function unwrapDraftSectionSlots(draft) {
    if (!draft || !Array.isArray(draft.children) || typeof draft.insertChild !== "function") {
      return;
    }

    const children = draft.children.slice();
    for (let index = 0; index < children.length; index += 1) {
      const slot = children[index];
      if (!shouldUnwrapDraftSectionSlot(slot) || !Array.isArray(slot.children) || slot.children.length !== 1) {
        continue;
      }

      const child = slot.children[0];
      if (!child) {
        continue;
      }

      copyDraftSectionPluginData(slot, child);
      try {
        draft.insertChild(index, child);
        slot.remove();
      } catch (error) {}
    }
  }

  function shouldUnwrapDraftSectionSlot(node) {
    if (!node || String(node.type || "") !== "FRAME") {
      return false;
    }
    const name = safeName(node).toLowerCase();
    if (name.indexOf("/ mobile-section") >= 0 || name.indexOf("/ desktop-section") >= 0) {
      return true;
    }
    return readDraftSectionType(node).length > 0;
  }

  function copyDraftSectionPluginData(fromNode, toNode) {
    if (!fromNode || !toNode || typeof fromNode.getPluginData !== "function" || typeof toNode.setPluginData !== "function") {
      return;
    }

    const keys = [
      "pigma:design-assist-section-type",
      "pigma:design-assist-section-name",
      "pigma:design-assist-evidence-mode",
      "pigma:design-assist-confidence-label",
      "pigma:design-assist-section-strategy",
      "pigma:design-assist-builder-type",
      "pigma:design-assist-fallback-reason",
      "pigma:design-assist-learned-layout-count",
      "pigma:design-assist-heuristic-layout-count",
      "pigma:design-assist-profile-count",
      "pigma:design-assist-reliability-score",
      "pigma:design-assist-evidence-reasons",
    ];

    for (let index = 0; index < keys.length; index += 1) {
      const key = keys[index];
      const value = string(fromNode.getPluginData(key), "");
      if (!value) {
        continue;
      }
      try {
        toNode.setPluginData(key, value);
      } catch (error) {}
    }
  }

  function freezeGeneratedAutoLayoutSubtree(node, rootDraft) {
    if (!node || !Array.isArray(node.children)) {
      return;
    }

    const children = node.children.slice();
    for (let index = 0; index < children.length; index += 1) {
      freezeGeneratedAutoLayoutSubtree(children[index], rootDraft);
    }

    if (node === rootDraft) {
      return;
    }

    freezeGeneratedAutoLayoutNode(node);
  }

  function freezeGeneratedAutoLayoutNode(node) {
    if (!node || String(node.layoutMode || "NONE") === "NONE" || !Array.isArray(node.children) || node.children.length === 0) {
      return false;
    }

    const nodeBounds = getNodeBounds(node);
    if (!nodeBounds) {
      return false;
    }

    const childEntries = [];
    for (let index = 0; index < node.children.length; index += 1) {
      const child = node.children[index];
      const bounds = getNodeBounds(child);
      childEntries.push({
        node: child,
        bounds: bounds,
        removeAfterFreeze: isGeneratedSpacerNode(child),
      });
    }

    try {
      node.layoutMode = "NONE";
    } catch (error) {
      return false;
    }

    resizeNodeForDraft(node, Math.max(1, numeric(nodeBounds.width)), Math.max(1, numeric(nodeBounds.height)));

    for (let index = 0; index < childEntries.length; index += 1) {
      const entry = childEntries[index];
      if (!entry || !entry.node || !entry.bounds) {
        continue;
      }
      try {
        entry.node.x = round(numeric(entry.bounds.x) - numeric(nodeBounds.x));
        entry.node.y = round(numeric(entry.bounds.y) - numeric(nodeBounds.y));
      } catch (error) {}
    }

    for (let index = childEntries.length - 1; index >= 0; index -= 1) {
      const entry = childEntries[index];
      if (!entry || !entry.node || !entry.removeAfterFreeze) {
        continue;
      }
      try {
        entry.node.remove();
      } catch (error) {}
    }

    return true;
  }

  function isGeneratedSpacerNode(node) {
    if (!node || String(node.type || "") !== "FRAME" || Array.isArray(node.children) && node.children.length > 0) {
      return false;
    }
    const name = safeName(node).toLowerCase();
    return name === "text-gap" || name.indexOf("text-gap-") === 0 || name.indexOf("hero-copy-gap-") === 0;
  }

  function resizeNodeForDraft(node, width, height) {
    if (!node || node.type === "GROUP" || node.type === "TEXT" || node.type === "LINE") {
      return false;
    }

    if (typeof node.resizeWithoutConstraints === "function") {
      try {
        node.resizeWithoutConstraints(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
        return true;
      } catch (error) {
        return false;
      }
    }

    if (typeof node.resize === "function") {
      try {
        node.resize(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
        return true;
      } catch (error) {
        return false;
      }
    }

    return false;
  }

  function supportsLayoutEditing(node) {
    return !!node && typeof node.layoutMode === "string";
  }

  function containsAny(value, words) {
    const text = string(value, "").toLowerCase();
    for (let index = 0; index < words.length; index += 1) {
      if (text.indexOf(String(words[index]).toLowerCase()) >= 0) {
        return true;
      }
    }
    return false;
  }

  function addAppliedChange(state, text) {
    const value = sanitizeUserFacingText(text, "");
    if (!state || !value) {
      return;
    }

    if (state.appliedChanges.indexOf(value) >= 0) {
      return;
    }

    state.appliedChanges.push(value);
  }

  function emptyMemoryContext() {
    return {
      available: false,
      memoryRevision: "",
      memoryUpdatedAt: "",
      retrievalFingerprint: "",
      pairCount: 0,
      sectionExampleCount: 0,
      aggregateCount: 0,
      similarPairs: [],
      relevantSectionExamples: [],
      repeatedRules: [],
      highConfidenceRules: [],
      pairRuleReferences: [],
      frameProfileCount: 0,
      frameShapeProfiles: [],
      containerProfileCount: 0,
      containerProfiles: [],
      textProfileCount: 0,
      textRoleProfiles: [],
    };
  }

  function sortFrameShapeProfiles(profiles) {
    const list = Array.isArray(profiles) ? profiles.slice() : [];
    list.sort((left, right) => {
      const rightSample = numeric(right && right.sampleCount);
      const leftSample = numeric(left && left.sampleCount);
      if (rightSample !== leftSample) {
        return rightSample - leftSample;
      }
      const rightConfidence = numeric(right && right.confidence);
      const leftConfidence = numeric(left && left.confidence);
      if (rightConfidence !== leftConfidence) {
        return rightConfidence - leftConfidence;
      }
      return String(left && left.id ? left.id : "").localeCompare(String(right && right.id ? right.id : ""));
    });
    return list;
  }

  function sortContainerProfiles(profiles) {
    const list = Array.isArray(profiles) ? profiles.slice() : [];
    list.sort((left, right) => {
      const rightSample = numeric(right && right.sampleCount);
      const leftSample = numeric(left && left.sampleCount);
      if (rightSample !== leftSample) {
        return rightSample - leftSample;
      }
      const rightConfidence = numeric(right && right.confidence);
      const leftConfidence = numeric(left && left.confidence);
      if (rightConfidence !== leftConfidence) {
        return rightConfidence - leftConfidence;
      }
      return String(left && left.id ? left.id : "").localeCompare(String(right && right.id ? right.id : ""));
    });
    return list;
  }

  function sortTextRoleProfiles(profiles) {
    const list = Array.isArray(profiles) ? profiles.slice() : [];
    list.sort((left, right) => {
      const rightSample = numeric(right && right.sampleCount);
      const leftSample = numeric(left && left.sampleCount);
      if (rightSample !== leftSample) {
        return rightSample - leftSample;
      }
      const rightConfidence = numeric(right && right.confidence);
      const leftConfidence = numeric(left && left.confidence);
      if (rightConfidence !== leftConfidence) {
        return rightConfidence - leftConfidence;
      }
      return String(left && left.id ? left.id : "").localeCompare(String(right && right.id ? right.id : ""));
    });
    return list;
  }

  function compareRuleItems(left, right) {
    if (right.supportCount !== left.supportCount) {
      return right.supportCount - left.supportCount;
    }
    if (right.avgConfidence !== left.avgConfidence) {
      return right.avgConfidence - left.avgConfidence;
    }
    return String(left.summary || "").localeCompare(String(right.summary || ""));
  }

  function summarizePairRules(records, action) {
    const list = Array.isArray(records) ? records : [];
    const out = [];
    const seen = {};
    for (let index = 0; index < list.length; index += 1) {
      const summary = adaptRuleSummary(list[index] && list[index].summary, action);
      if (!summary || seen[summary]) {
        continue;
      }
      seen[summary] = true;
      out.push(summary);
      if (out.length >= 4) {
        break;
      }
    }
    return out;
  }

  /*
  function adaptRuleSummary(value, action) {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) {
      return "";
    }
    return action === "pc-design" ? `???????????椰??????????????산뭐????????${text}` : text;
  }

  }
  */

  function adaptRuleSummary(value, action) {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) {
      return "";
    }
    return action === "pc-design" ? ("Desktop expansion summary: " + text) : text;
  }

  function scorePair(localResult, pairRecord, summaryRecord, action) {
    const comparePc = action !== "pc-design";
    const pairWidth = numeric(comparePc ? pairRecord.pcWidth : pairRecord.moWidth);
    const pairName = comparePc ? pairRecord.pcNodeName : pairRecord.moNodeName;
    const stats = summaryRecord && summaryRecord.stats ? summaryRecord.stats : {};
    const pairNodeCount = numeric(comparePc ? stats.pcTotalNodes : stats.moTotalNodes);
    const pairTextCount = numeric(comparePc ? stats.pcTextNodes : stats.moTextNodes);
    const widthScore = similarity(localResult.selection.width, pairWidth);
    const nodeScore = similarity(localResult.stats.totalNodes, pairNodeCount);
    const textScore = similarity(localResult.stats.textNodeCount, pairTextCount);
    const tokenScore = tokenSimilarity(localResult.tokens, tokenize(pairName));
    const score = round(widthScore * 0.35 + nodeScore * 0.25 + textScore * 0.15 + tokenScore * 0.25);
    const reasons = [];
    if (widthScore >= 0.85) {
      reasons.push("width similarity");
    }
    if (nodeScore >= 0.8) {
      reasons.push("name and semantic token similarity");
    }
    if (tokenScore >= 0.4) {
      reasons.push("content and role token similarity");
    }
    if (reasons.length === 0) {
      reasons.push("structure similarity");
    }
    return { score: score, reason: reasons.join(" / ") };
  }

  function buildRelevantSectionExamples(localSections, sectionExamples, action) {
    const sections = Array.isArray(localSections) ? localSections : [];
    const examples = Array.isArray(sectionExamples) ? sectionExamples : [];
    const scored = [];
    const seen = {};

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
      const localSection = sections[sectionIndex];
      for (let exampleIndex = 0; exampleIndex < examples.length; exampleIndex += 1) {
        const entry = scoreSectionExample(localSection, examples[exampleIndex], action);
        if (!entry || seen[entry.key]) {
          continue;
        }
        seen[entry.key] = true;
        scored.push(entry);
      }
    }

    scored.sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (right.confidence !== left.confidence) {
        return right.confidence - left.confidence;
      }
      return String(left.summary || "").localeCompare(String(right.summary || ""));
    });

    return scored.slice(0, 4).map((entry) => {
      return {
        id: entry.exampleId,
        title: entry.summary,
        summary: entry.summary,
        sectionType: entry.sectionType,
        mobilePattern: entry.mobilePattern,
        score: entry.score,
        confidence: entry.confidence,
        pairId: entry.pairId,
        direction: entry.direction,
        reason: entry.reason,
        heroGuidance: entry.heroGuidance,
        sectionGuidance: entry.sectionGuidance,
        pc: entry.pc,
        mo: entry.mo,
      };
    });
  }

  function scoreSectionExample(localSection, exampleRecord, action) {
    if (!localSection || !exampleRecord || exampleRecord.type !== "section-example") {
      return null;
    }

    const compareSide = action === "pc-design" ? exampleRecord.mo : exampleRecord.pc;
    if (!compareSide || typeof compareSide !== "object") {
      return null;
    }

    const compareStats = compareSide.stats && typeof compareSide.stats === "object" ? compareSide.stats : {};
    const widthScore = similarity(localSection.width, numeric(compareSide.width));
    const heightScore = similarity(localSection.height, numeric(compareSide.height));
    const childScore = similarity(localSection.childCount, numeric(compareSide.childCount));
    const textScore = similarity(localSection.textNodeCount, numeric(compareStats.textNodes));
    const imageScore = similarity(Math.max(1, localSection.imageFillCount), Math.max(1, numeric(compareStats.imageFillNodes)));
    const typeScore = localSection.sectionType === string(exampleRecord.sectionType, "") ? 1 : 0;
    const tokenScore = tokenSimilarity(localSection.tokenSample, tokenize(string(compareSide.name, "")));
    const score = round(widthScore * 0.24 + heightScore * 0.14 + childScore * 0.16 + textScore * 0.14 + imageScore * 0.1 + typeScore * 0.14 + tokenScore * 0.08);

    if (score < 0.52) {
      return null;
    }

    const reasons = [];
    if (typeScore === 1) {
      reasons.push(`${localSection.sectionType} section type similarity`);
    }
    if (widthScore >= 0.82) {
      reasons.push("width similarity");
    }
    if (tokenScore >= 0.35) {
      reasons.push("content token similarity");
    }
    if (reasons.length === 0) {
      reasons.push("section similarity");
    }

    return {
      key: `${localSection.id}|${exampleRecord.id}`,
      exampleId: string(exampleRecord.id, ""),
      pairId: string(exampleRecord.pairId, ""),
      direction: string(exampleRecord.direction, "pc-to-mo"),
      summary: string(exampleRecord.summary, "section example"),
      sectionType: string(exampleRecord.sectionType, "section"),
      mobilePattern: string(exampleRecord.mobilePattern, "mobile-fit"),
      score: score,
      confidence: numeric(exampleRecord.confidence),
      reason: reasons.join(" / "),
      heroGuidance: exampleRecord && exampleRecord.heroGuidance && typeof exampleRecord.heroGuidance === "object" ? exampleRecord.heroGuidance : null,
      sectionGuidance:
        exampleRecord && exampleRecord.sectionGuidance && typeof exampleRecord.sectionGuidance === "object" ? exampleRecord.sectionGuidance : null,
      pc: exampleRecord && exampleRecord.pc && typeof exampleRecord.pc === "object" ? exampleRecord.pc : null,
      mo: exampleRecord && exampleRecord.mo && typeof exampleRecord.mo === "object" ? exampleRecord.mo : null,
    };
  }

  function buildPairLabel(pairRecord) {
    return `${string(pairRecord.pcNodeName, "PC")} ${Math.round(numeric(pairRecord.pcWidth))}px -> ${string(pairRecord.moNodeName, "MO")} ${Math.round(numeric(pairRecord.moWidth))}px`;
  }

  function buildAiStatusLabel(response) {
    const provider = string(response._provider, "");
    const model = string(response._model, "");
    if (provider && model) {
      return `${provider} / ${model}`;
    }
    return provider || "AI model";
  }

  function buildDesignAssistProviderProfile(action, phase) {
    const actionLabel = action === "pc-design" ? "pc-design" : "mobile-design";
    const phaseLabel = string(phase, "plan")
      .toLowerCase()
      .replace(/[^a-z0-9/_-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^[-/]+|[-/]+$/g, "");
    return `design-assist/${actionLabel}/${phaseLabel || "plan"}/${PLANNER_VERSION}`;
  }

  function buildDesignAssistTaskContext(action, targetWidth, phase) {
    const actionLabel = action === "pc-design" ? "pc-design" : "mobile-design";
    const resolvedTargetWidth = resolveAssistTargetWidth(actionLabel, targetWidth);
    const safeTargetWidth = Math.max(
      1,
      Math.round(numeric(resolvedTargetWidth) || (actionLabel === "pc-design" ? DEFAULT_DESKTOP_WIDTH : DEFAULT_MOBILE_WIDTH))
    );
    const phaseLabel = string(phase, "plan")
      .toLowerCase()
      .replace(/[^a-z0-9/_-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^[-/]+|[-/]+$/g, "");
    return `design-assist/${actionLabel}/${safeTargetWidth}/${phaseLabel || "plan"}`;
  }

  function captureAiRunTelemetry(result, response) {
    if (!result || typeof result !== "object") {
      return;
    }
    const aiRun = {
      ok: true,
      provider: string(response && response._provider, ""),
      model: string(response && response._model, ""),
      taskType: string(response && response._taskType, ""),
      taskContext: string(response && response._taskContext, ""),
      plannerVersion: string(response && response._plannerVersion, ""),
      providerProfile: string(response && response._providerProfile, ""),
      durationMs: Math.max(0, Math.round(numeric(response && response._durationMs))),
      responseQualityScore: Math.max(0, Math.min(100, Math.round(numeric(response && response._responseQualityScore)))),
      responseQualityLabel: string(response && response._responseQualityLabel, ""),
      responseQualityNotes: Array.isArray(response && response._responseQualityNotes)
        ? response._responseQualityNotes.slice(0, 4)
        : [],
      failureType: "",
      failureMessage: "",
    };
    result.aiRun = aiRun;
    if (!result.planning || typeof result.planning !== "object") {
      result.planning = {};
    }
    result.planning.aiTaskType = aiRun.taskType;
    result.planning.aiTaskContext = aiRun.taskContext;
    result.planning.aiProvider = aiRun.provider;
    result.planning.aiModel = aiRun.model;
    result.planning.aiProviderProfile = aiRun.providerProfile;
    result.planning.aiDurationMs = aiRun.durationMs;
    result.planning.aiResponseQualityScore = aiRun.responseQualityScore;
    result.planning.aiResponseQualityLabel = aiRun.responseQualityLabel;
    result.planning.aiFailureType = "";
    result.planning.aiFailureMessage = "";
    if (result.guidance && Array.isArray(result.guidance.decisionNotes)) {
      const note =
        aiRun.provider && aiRun.model
          ? `AI run ${aiRun.provider} / ${aiRun.model} (${aiRun.responseQualityLabel || "quality-unknown"} ${aiRun.responseQualityScore || 0})`
          : "";
      if (note && result.guidance.decisionNotes.indexOf(note) < 0) {
        result.guidance.decisionNotes.unshift(note);
      }
    }
  }

  function captureAiFailureTelemetry(result, error) {
    if (!result || typeof result !== "object") {
      return;
    }
    const failureType = classifyDesignAssistAiFailure(error);
    const failureMessage = normalizeError(error, "AI request failed");
    const aiRun = {
      ok: false,
      provider: string(error && error.pigmaAiProvider, ""),
      model: string(error && error.pigmaAiModel, ""),
      taskType: string(error && error.pigmaAiTaskType, ""),
      taskContext: string(error && error.pigmaAiTaskContext, ""),
      plannerVersion: string(error && error.pigmaAiPlannerVersion, ""),
      providerProfile: string(error && error.pigmaAiProviderProfile, ""),
      durationMs: Math.max(0, Math.round(numeric(error && error.pigmaAiDurationMs))),
      responseQualityScore: 0,
      responseQualityLabel: "",
      responseQualityNotes: [],
      failureType: failureType,
      failureMessage: failureMessage,
    };
    result.aiRun = aiRun;
    if (!result.planning || typeof result.planning !== "object") {
      result.planning = {};
    }
    result.planning.aiTaskType = aiRun.taskType;
    result.planning.aiTaskContext = aiRun.taskContext;
    result.planning.aiProvider = aiRun.provider;
    result.planning.aiModel = aiRun.model;
    result.planning.aiProviderProfile = aiRun.providerProfile;
    result.planning.aiDurationMs = aiRun.durationMs;
    result.planning.aiResponseQualityScore = 0;
    result.planning.aiResponseQualityLabel = "";
    result.planning.aiFailureType = failureType;
    result.planning.aiFailureMessage = failureMessage;
    if (result.guidance && Array.isArray(result.guidance.decisionNotes)) {
      const note = `AI failure ${failureType}${aiRun.provider ? ` via ${aiRun.provider}` : ""}`;
      if (result.guidance.decisionNotes.indexOf(note) < 0) {
        result.guidance.decisionNotes.unshift(note);
      }
    }
  }

  function classifyDesignAssistAiFailure(error) {
    const explicitType = string(error && error.pigmaAiFailureType, "");
    if (explicitType) {
      return explicitType;
    }
    const message = normalizeError(error, "").toLowerCase();
    if (!message) {
      return "unknown";
    }
    if (message.indexOf("timeout") >= 0 || message.indexOf("시간 내") >= 0) {
      return "timeout";
    }
    if (message.indexOf("api key") >= 0) {
      return "configuration";
    }
    if (message.indexOf("bridge") >= 0) {
      return "bridge";
    }
    return "request-failed";
  }

  function applyPlanningQualitySnapshot(result) {
    if (!result || !result.planning || typeof result.planning !== "object") {
      return;
    }
    const planning = result.planning;
    const responseQuality = Math.max(0, Math.min(100, Math.round(numeric(planning.aiResponseQualityScore))));
    let integrity = 100;
    const reasons = [];
    const expectedCount = Math.max(0, Math.round(numeric(planning.expectedSectionCount)));
    const outputCount = Math.max(0, Math.round(numeric(planning.outputSectionCount)));
    const repairedCount = Math.max(0, Math.round(numeric(planning.repairedSectionCount)));
    const fallbackCount = Math.max(0, Math.round(numeric(planning.fallbackSectionCount)));
    const validationCount = Array.isArray(planning.validationWarnings) ? planning.validationWarnings.length : 0;

    if (string(planning.aiFailureType, "")) {
      integrity -= 55;
      reasons.push(`AI failure ${planning.aiFailureType}`);
    }
    if (expectedCount > 0 && outputCount > 0 && expectedCount !== outputCount) {
      integrity -= 18;
      reasons.push(`section count ${outputCount}/${expectedCount}`);
    }
    if (planning.deterministicRepairApplied === true) {
      integrity -= Math.min(28, repairedCount * 6 + fallbackCount * 10);
      reasons.push(fallbackCount > 0 ? `repair ${repairedCount} / fallback ${fallbackCount}` : `repair ${repairedCount}`);
    }
    if (validationCount > 0) {
      integrity -= Math.min(20, validationCount * 4);
      reasons.push(`validation warnings ${validationCount}`);
    }
    if (result.aiError && typeof result.aiError === "string" && result.aiError.trim()) {
      integrity -= 10;
      if (reasons.indexOf("fallback used") < 0) {
        reasons.push("fallback used");
      }
    }

    integrity = Math.max(0, Math.min(100, Math.round(integrity)));
    const score = Math.max(0, Math.min(100, Math.round(responseQuality > 0 ? integrity * 0.72 + responseQuality * 0.28 : integrity)));
    const label = score >= 85 ? "high" : score >= 60 ? "medium" : score >= 35 ? "low" : "fallback";
    planning.qualityScore = score;
    planning.qualityLabel = label;
    planning.qualitySummary = describePlanningQuality(score, label, reasons, planning);
  }

  function describePlanningQuality(score, label, reasons, planning) {
    const parts = [];
    parts.push(`${label} ${Math.max(0, Math.min(100, Math.round(Number(score) || 0)))}%`);
    if (Array.isArray(reasons) && reasons.length > 0) {
      parts.push(reasons[0]);
    } else if (planning && planning.outputSectionCount > 0) {
      parts.push("plan matched the renderer contract");
    } else {
      parts.push("awaiting plan output");
    }
    return parts.join(" / ");
  }

  function buildLayoutLabel(root, stats) {
    const snapshot = buildLayoutSnapshot(root);
    const parts = [];
    if (snapshot.mode !== "none") {
      parts.push(snapshot.mode);
    }
    if (snapshot.wrap !== "none") {
      parts.push(snapshot.wrap);
    }
    if (snapshot.itemSpacing > 0) {
      parts.push(`gap ${snapshot.itemSpacing}`);
    }
    if (snapshot.paddingX > 0 || snapshot.paddingY > 0) {
      parts.push(`padding ${snapshot.paddingX}/${snapshot.paddingY}`);
    }
    if (parts.length === 0) {
      parts.push(stats.autoLayoutCount > 0 ? "includes auto layout" : "mostly absolute and freeform layout");
    }
    return parts.join(" / ");
  }

  function buildLayoutSnapshot(root) {
    const paddingLeft = numeric(root.paddingLeft);
    const paddingRight = numeric(root.paddingRight);
    const paddingTop = numeric(root.paddingTop);
    const paddingBottom = numeric(root.paddingBottom);
    return {
      mode: string(root.layoutMode, "none").toLowerCase(),
      wrap: string(root.layoutWrap, "none").toLowerCase(),
      itemSpacing: round(numeric(root.itemSpacing)),
      paddingX: round((paddingLeft + paddingRight) / 2),
      paddingY: round((paddingTop + paddingBottom) / 2),
      childCount: Array.isArray(root.children) ? root.children.length : 0,
    };
  }

  function collectSelectionSectionProfiles(root) {
    const sections = collectSourceSectionsForDraft(root);
    const profiles = [];

    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index];
      if (!section || section.visible === false) {
        continue;
      }
      profiles.push(buildSectionProfile(section, index));
      if (profiles.length >= 12) {
        break;
      }
    }

    return profiles;
  }

  function buildSectionProfile(node, index) {
    const bounds = getNodeBounds(node);
    const stats = collectSectionNodeStats(node);
    const name = safeName(node);
    const type = classifySelectionSectionType(node, stats, bounds);
    const textEntries = collectSectionTextPlanEntries(node, bounds, type, 6);
    return {
      id: node.id,
      index: index,
      name: name,
      sectionType: type,
      width: bounds ? round(bounds.width) : 0,
      height: bounds ? round(bounds.height) : 0,
      layoutMode: string(node.layoutMode, "none").toLowerCase(),
      childCount: isSectionBand(node) ? node.nodes.length : Array.isArray(node.children) ? node.children.length : 0,
      textNodeCount: stats.textNodeCount,
      imageFillCount: stats.imageFillCount,
      textSamples: collectSectionTextSamples(node, 3),
      textEntries: textEntries,
      tokenSample: tokenize(name).slice(0, 8),
    };
  }

  function collectSectionTextSamples(node, limit) {
    const maxCount = Math.max(1, numeric(limit) || 3);
    const out = [];
    const stack = isSectionBand(node) ? node.nodes.slice() : [node];

    while (stack.length > 0 && out.length < maxCount) {
      const current = stack.shift();
      if (!current) {
        continue;
      }
      if (current.type === "TEXT" && typeof current.characters === "string") {
        const text = current.characters.replace(/\s+/g, " ").trim();
        if (text && out.indexOf(text) < 0) {
          out.push(text.slice(0, 120));
        }
      }
      if (Array.isArray(current.children)) {
        for (let index = 0; index < current.children.length; index += 1) {
          stack.push(current.children[index]);
        }
      }
    }

    return out;
  }

  function collectSectionNodeStats(node) {
    const stats = {
      totalNodes: 0,
      textNodeCount: 0,
      imageFillCount: 0,
      autoLayoutCount: 0,
    };
    const stack = isSectionBand(node) ? node.nodes.slice() : [node];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      stats.totalNodes += 1;
      if (String(current.type || "") === "TEXT") {
        stats.textNodeCount += 1;
      }
      if (typeof current.layoutMode === "string" && current.layoutMode && current.layoutMode !== "NONE") {
        stats.autoLayoutCount += 1;
      }
      if (Array.isArray(current.fills)) {
        for (let fillIndex = 0; fillIndex < current.fills.length; fillIndex += 1) {
          const fill = current.fills[fillIndex];
          if (fill && fill.visible !== false && fill.type === "IMAGE") {
            stats.imageFillCount += 1;
            break;
          }
        }
      }
      if (!Array.isArray(current.children)) {
        continue;
      }
      for (let childIndex = current.children.length - 1; childIndex >= 0; childIndex -= 1) {
        stack.push(current.children[childIndex]);
      }
    }

    return stats;
  }

  function classifySelectionSectionType(node, stats, bounds) {
    const layoutMode = isSectionBand(node) ? "NONE" : string(node.layoutMode, "");
    const corpus = `${safeName(node)} ${layoutMode}`.toLowerCase();
    const imageHeavy = stats.imageFillCount >= 1;
    const textHeavy = stats.textNodeCount >= 3;
    const repeatedChildren = isSectionBand(node)
      ? Array.isArray(node.nodes) && node.nodes.length >= 3
      : Array.isArray(node.children) && node.children.length >= 3;
    const largeHero = !!(bounds && bounds.width >= 640 && bounds.height >= 240);

    if (containsAny(corpus, ["hero", "banner", "kv", "masthead", "main visual"]) || (largeHero && imageHeavy && textHeavy)) {
      return "hero";
    }
    if (containsAny(corpus, ["promo", "promotion", "offer", "coupon", "discount", "deal", "event"])) {
      return "promo";
    }
    if (containsAny(corpus, ["video", "media", "gallery", "carousel", "slider"])) {
      return "media";
    }
    if (containsAny(corpus, ["header", "gnb", "nav"])) {
      return "header";
    }
    if (containsAny(corpus, ["footer"])) {
      return "footer";
    }
    if (repeatedChildren && containsAny(corpus, ["card", "product", "grid", "collection", "list"])) {
      return "card-list";
    }
    if (imageHeavy && textHeavy) {
      return "editorial";
    }
    if (textHeavy) {
      return "article";
    }
    if (imageHeavy) {
      return "visual";
    }
    return "section";
  }

  function buildFallbackLayoutHint(action, width) {
    return action === "pc-design"
      ? `${Math.round(width)}px desktop-origin screen that should be rebuilt into a denser desktop layout while preserving the main sections.`
      : `${Math.round(width)}px screen that should be reorganized into a narrower mobile flow with clearer vertical stacking.`;
  }

  function inferContext(name, textSamples, stats) {
    const corpus = `${name} ${Array.isArray(textSamples) ? textSamples.join(" ") : ""}`.toLowerCase();
    if (contains(corpus, ["product", "coupon", "offer", "price", "cart", "shop", "deal"])) {
      return "commerce or promotion screen";
    }
    if (contains(corpus, ["login", "sign in", "password", "email"])) {
      return "authentication or account screen";
    }
    if (contains(corpus, ["dashboard", "report", "analytics", "chart", "table"])) {
      return "dashboard or data-heavy screen";
    }
    return stats.sectionCount >= 2 ? "section-based screen" : "general UI screen";
  }

  function contains(text, words) {
    const corpus = string(text, "").toLowerCase();
    for (let index = 0; index < words.length; index += 1) {
      if (corpus.indexOf(String(words[index]).toLowerCase()) >= 0) {
        return true;
      }
    }
    return false;
  }

  function addTokens(target, value) {
    const tokens = tokenize(value);
    for (let index = 0; index < tokens.length; index += 1) {
      target[tokens[index]] = true;
    }
  }

  function tokenize(value) {
    return string(value, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2);
  }

  function tokenSimilarity(left, right) {
    const a = Array.isArray(left) ? left : [];
    const b = Array.isArray(right) ? right : [];
    if (!a.length || !b.length) {
      return 0;
    }
    let overlap = 0;
    for (let index = 0; index < a.length; index += 1) {
      if (b.indexOf(a[index]) >= 0) {
        overlap += 1;
      }
    }
    return round(overlap / Math.max(a.length, b.length));
  }

  function similarity(left, right) {
    const a = numeric(left);
    const b = numeric(right);
    if (!a || !b) {
      return 0;
    }
    return round(Math.min(a, b) / Math.max(a, b));
  }

  function getSelectionSignature(selection) {
    const items = Array.isArray(selection) ? selection.slice() : [];
    items.sort((left, right) => String(left.id).localeCompare(String(right.id)));
    return items
      .map((node) => {
        const bounds = getNodeBounds(node);
        return `${node.id}:${bounds ? bounds.width : 0}`;
      })
      .join("|");
  }

  function getNodeBounds(node) {
    if (isSectionBand(node) && node.bounds) {
      return cloneBounds(node.bounds);
    }
    if (
      node &&
      typeof node.x === "number" &&
      typeof node.y === "number" &&
      typeof node.width === "number" &&
      typeof node.height === "number"
    ) {
      return {
        x: round(node.x),
        y: round(node.y),
        width: round(node.width),
        height: round(node.height),
      };
    }
    if (
      node &&
      node.absoluteRenderBounds &&
      typeof node.absoluteRenderBounds.x === "number" &&
      typeof node.absoluteRenderBounds.y === "number" &&
      typeof node.absoluteRenderBounds.width === "number" &&
      typeof node.absoluteRenderBounds.height === "number"
    ) {
      return {
        x: round(node.absoluteRenderBounds.x),
        y: round(node.absoluteRenderBounds.y),
        width: round(node.absoluteRenderBounds.width),
        height: round(node.absoluteRenderBounds.height),
      };
    }
    return null;
  }

  function safeName(node) {
    if (isSectionBand(node)) {
      return typeof node.name === "string" && node.name.trim() ? node.name.trim() : "Section Band";
    }
    return node && typeof node.name === "string" && node.name.trim() ? node.name.trim() : String((node && node.type) || "Unnamed");
  }

  function uniqueStrings(items, limit) {
    const list = Array.isArray(items) ? items : [];
    const out = [];
    const seen = {};
    for (let index = 0; index < list.length; index += 1) {
      const text = string(list[index], "").replace(/\s+/g, " ").trim();
      if (!text || seen[text]) {
        continue;
      }
      seen[text] = true;
      out.push(text);
      if (out.length >= limit) {
        break;
      }
    }
    return out;
  }

  function numeric(value) {
    return typeof value === "number" && isFinite(value) ? value : 0;
  }

  function string(value, fallback) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function round(value) {
    return Math.round(numeric(value) * 1000) / 1000;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(numeric(value), numeric(min)), numeric(max));
  }

  function normalizeError(error, fallback) {
    const fallbackMessage = sanitizeUserFacingText(fallback, "디자인 어시스트를 실행하는 중 문제가 발생했습니다.");
    if (error && typeof error === "object" && typeof error.message === "string" && error.message.trim()) {
      const message = error.message.trim();
      return looksLikeBrokenKorean(message) ? fallbackMessage : message;
    }
    if (typeof error === "string" && error.trim()) {
      const message = error.trim();
      return looksLikeBrokenKorean(message) ? fallbackMessage : message;
    }
    return fallbackMessage;
  }

  function looksLikeBrokenKorean(text) {
    const value = string(text, "");
    if (!value) {
      return false;
    }
    let replacementCount = 0;
    let questionCount = 0;
    let weirdChunkCount = 0;
    for (let index = 0; index < value.length - 1; index += 1) {
      const current = value[index];
      const next = value[index + 1];
      const code = current ? current.charCodeAt(0) : 0;
      if (code === 65533) {
        replacementCount += 1;
      }
      if (current === "?") {
        questionCount += 1;
      }
      if (current && next === "?" && current.charCodeAt(0) > 127) {
        weirdChunkCount += 1;
      }
    }
    if (value[value.length - 1] === "?") {
      questionCount += 1;
    }
    if (replacementCount > 0) {
      return true;
    }
    if (questionCount >= 4) {
      return true;
    }
    return weirdChunkCount >= 2;
  }

  function sanitizeUserFacingText(value, fallback) {
    const text = typeof value === "string" ? value.trim() : "";
    const safeFallback = typeof fallback === "string" ? fallback.trim() : "";
    if (!text) {
      return safeFallback;
    }
    return looksLikeBrokenKorean(text) ? safeFallback : text;
  }

  function sanitizeUserFacingList(values, fallback, limit) {
    const out = [];
    const list = Array.isArray(values) ? values : [];
    const maxCount = Math.max(0, Math.floor(numeric(limit) || list.length || 0));
    for (let index = 0; index < list.length; index += 1) {
      const sanitized = sanitizeUserFacingText(list[index], "");
      if (!sanitized || out.indexOf(sanitized) >= 0) {
        continue;
      }
      out.push(sanitized);
      if (maxCount > 0 && out.length >= maxCount) {
        break;
      }
    }
    if (out.length === 0) {
      const fallbackText = sanitizeUserFacingText(fallback, "");
      if (fallbackText) {
        out.push(fallbackText);
      }
    }
    return out;
  }

  function normalizeAiFocalTarget(value) {
    const normalized = string(value, "").trim().toLowerCase();
    if (["headline", "product", "person", "logo", "cta"].indexOf(normalized) >= 0) {
      return normalized;
    }
    if (containsAny(normalized, ["headline", "title", "copy", "text", "헤드라인", "제목", "카피", "텍스트"])) {
      return "headline";
    }
    if (containsAny(normalized, ["product", "fridge", "refrigerator", "drink", "cocktail", "mocktail", "glass", "제품", "상품", "냉장고", "칵테일"])) {
      return "product";
    }
    if (containsAny(normalized, ["person", "human", "model", "hand", "face", "인물", "모델", "손", "얼굴"])) {
      return "person";
    }
    if (containsAny(normalized, ["logo", "brand", "브랜드", "로고"])) {
      return "logo";
    }
    if (containsAny(normalized, ["cta", "button", "call to action", "버튼", "액션"])) {
      return "cta";
    }
    return "";
  }

  function collectSectionTextPlanEntries(node, sectionBounds, sectionType, limit) {
    if (!sectionBounds) {
      return [];
    }

    const maxCount = Math.max(1, numeric(limit) || 6);
    const textNodes = [];
    collectTextNodes(node, textNodes);

    const raw = [];
    const seen = {};
    for (let index = 0; index < textNodes.length; index += 1) {
      const textNode = textNodes[index];
      const bounds = getNodeBounds(textNode);
      const text = normalizeMeaningfulText(string(textNode && textNode.characters, ""));
      if (!bounds || !text) {
        continue;
      }

      const dedupeKey = `${text}::${Math.round(numeric(bounds.x))}::${Math.round(numeric(bounds.y))}`;
      if (seen[dedupeKey]) {
        continue;
      }
      seen[dedupeKey] = true;
      raw.push({
        node: textNode,
        bounds: bounds,
        fontSize: getTemplateTextSize(textNode),
        score: getTemplateTextCandidateScore(textNode, bounds),
        text: text,
      });
    }

    const selected = pickProminentTextCandidates(raw, maxCount, true);
    const builderType = normalizeSectionProfileBuilderType(sectionType);
    const out = [];
    for (let index = 0; index < selected.length; index += 1) {
      const entry = selected[index];
      const bounds = entry && entry.bounds ? entry.bounds : null;
      const fontSize = numeric(entry && entry.fontSize);
      const nextEntry = index < selected.length - 1 ? selected[index + 1] : null;
      const roleHint =
        normalizeAiTextClusterRole(classifyTemplateTextEntryRole(entry, builderType, index, selected.length)) ||
        normalizeAiTextClusterRole(deriveTemplateTextRole(entry && entry.node)) ||
        "body";
      const lineCount = Math.max(1, countDraftTextLines(entry && entry.node) || estimateSectionProfileLineCount(bounds, fontSize));
      const gapAfterRatio =
        nextEntry && fontSize > 0 ? round(clamp(measureSourceTextVerticalGap(entry, nextEntry) / Math.max(1, fontSize), 0, 1.6)) : 0;
      out.push({
        order: index,
        text: string(entry && entry.text, "").slice(0, 80),
        roleHint: roleHint,
        fontSize: round(fontSize),
        lineCount: lineCount,
        topRatio: round((numeric(bounds && bounds.y) - numeric(sectionBounds.y)) / Math.max(1, numeric(sectionBounds.height))),
        leftRatio: round((numeric(bounds && bounds.x) - numeric(sectionBounds.x)) / Math.max(1, numeric(sectionBounds.width))),
        widthRatio: round(numeric(bounds && bounds.width) / Math.max(1, numeric(sectionBounds.width))),
        gapAfterRatio: gapAfterRatio,
      });
    }

    return out;
  }

  function normalizeSectionProfileBuilderType(sectionType) {
    const normalized = string(sectionType, "").trim().toLowerCase();
    if (normalized === "hero" || normalized === "promo" || normalized === "article") {
      return normalized;
    }
    if (normalized === "editorial") {
      return "article";
    }
    return "";
  }

  function estimateSectionProfileLineCount(bounds, fontSize) {
    if (!bounds || !(fontSize > 0)) {
      return 1;
    }
    const estimatedLineHeight = Math.max(fontSize * 1.08, 12);
    return Math.max(1, Math.round(numeric(bounds.height) / Math.max(1, estimatedLineHeight)));
  }

  function sanitizeGuidanceCopy(result) {
    const guidance = result && result.guidance && typeof result.guidance === "object" ? result.guidance : null;
    if (!guidance) {
      return;
    }

    const targetLabel = string(result && result.summary && result.summary.targetLabel, "");
    guidance.targetSummary = sanitizeUserFacingText(
      guidance.targetSummary,
      targetLabel ? `${targetLabel} 방향으로 변환 가이드를 정리했습니다.` : "변환 가이드를 정리했습니다."
    );
    guidance.conversionSummary = sanitizeUserFacingText(
      guidance.conversionSummary,
      "학습 메모리와 현재 선택을 바탕으로 변환 방향을 정리했습니다."
    );
    guidance.layoutChanges = sanitizeUserFacingList(
      guidance.layoutChanges,
      buildFallbackLayoutHint(result && result.action, numeric(result && result.selection && result.selection.width)),
      4
    );
    guidance.contentChanges = sanitizeUserFacingList(
      guidance.contentChanges,
      "텍스트와 핵심 콘텐츠를 유지하면서 섹션을 재배치합니다.",
      4
    );
    guidance.warnings = sanitizeUserFacingList(
      guidance.warnings,
      "학습 근거가 아직 충분하지 않아 보수적으로 조립합니다.",
      4
    );
    guidance.suggestedSteps = sanitizeUserFacingList(
      guidance.suggestedSteps,
      "초안 생성 후 텍스트 보존과 레이아웃 흐름을 먼저 확인해 주세요.",
      5
    );
    guidance.memoryReferences = sanitizeUserFacingList(guidance.memoryReferences, "", 4);
    guidance.decisionNotes = sanitizeUserFacingList(
      guidance.decisionNotes,
      buildMemoryEvidenceDecision(result && result.memory),
      4
    );
  }

  async function createMobileDraftFromSelection(root, result, localResult, options) {
    const type = String(root && root.type ? root.type : "");
    if (["FRAME", "GROUP", "SECTION", "COMPONENT", "INSTANCE"].indexOf(type) < 0) {
      throw new Error("??????????諛몃마嶺뚮?????????????硫λ젒??MO ????????????????熬곣뫖利당춯??쎾퐲???????????? ??????????諛몃마嶺뚮?????????????硫λ젒??? ????????????????????????? ?????? ??????????????????됰뼸??? ???????嫄???????????????????濡?씀?濾???????????猷멥럸????壤굿?袁り턁?????????????? ????????????????????????살몝??");
    }

    const originalBounds = getNodeBounds(root);
    if (!originalBounds) {
      throw new Error("????????????猷멥럸????壤굿?袁り턁???????????????諛몃마嶺뚮?????????????硫λ젒??? ?????????????????????????? ??????椰????????????????????");
    }

    const targetWidth = Math.max(320, numeric(result && result.targetWidth) || DEFAULT_MOBILE_WIDTH);
    const rootFrameGuidance = predictDraftRootFrameGuidance(
      root,
      targetWidth,
      localResult,
      result && result.memory ? result.memory.frameShapeProfiles : []
    );
    const draft = createSectionRebuiltMobileDraftFrame(root, targetWidth, originalBounds, rootFrameGuidance);
    const state = {
      targetWidth: targetWidth,
      deviceProfile: buildMobileDeviceProfileContract(targetWidth),
      minTouchTarget: MOBILE_TOUCH_TARGET_MIN,
      sourceWidth: Math.max(1, numeric(originalBounds.width) || targetWidth),
      sourceHeight: Math.max(1, numeric(originalBounds.height) || targetWidth),
      sourceSectionCount: Array.isArray(root && root.children) && root.children.length > 0 ? root.children.length : 1,
      layoutHints: collectLayoutHintText(result),
      memoryRuleHints: collectMemoryTemplateHints(result),
      aiSectionPlans: collectAiSectionPlans(result),
      aiCompositionOnly: !!(result && result.source && result.source !== "memory-assisted"),
      frameShapeProfiles: result && result.memory && Array.isArray(result.memory.frameShapeProfiles) ? result.memory.frameShapeProfiles.slice() : [],
      containerProfiles: result && result.memory && Array.isArray(result.memory.containerProfiles) ? result.memory.containerProfiles.slice() : [],
      rootFrameGuidance: rootFrameGuidance,
      textRoleProfiles: result && result.memory && Array.isArray(result.memory.textRoleProfiles) ? result.memory.textRoleProfiles.slice() : [],
      memorySectionExamples:
        result && result.memory && Array.isArray(result.memory.relevantSectionExamples) ? result.memory.relevantSectionExamples.slice() : [],
      appliedChanges: [],
      templatedSectionCount: 0,
      learnedSectionCount: 0,
      hybridSectionCount: 0,
      fallbackSectionCount: 0,
      appendedSectionCount: 0,
      skippedSectionCount: 0,
      topLevelReflowCount: 0,
      scaledNodeCount: 0,
      textAdjustments: 0,
      stackedContainers: 0,
      hiddenTopLevelNodes: 0,
      spacingAdjustments: 0,
      rejectedTemplateCount: 0,
      qualityWarnings: [],
      conservativeDecisionCount: 0,
      preferConservativeMobileSections: !!(options && options.legacySafeMode),
      decisionNotes: [],
    };

    writeResponsiveDraftPluginData(draft, root, targetWidth, "mobile-design");
    const appendedCount = await rebuildMobileDraftSectionsFromSource(root, draft, state);
    if (appendedCount === 0) {
      throw new Error("MO ????????????????????????????????????椰????????????????????????????????????椰????????? ??????椰????????????????????");
    }

    if (!prefersConservativeMobileSections(state)) {
      await adjustTextNodesForMobileDraft(draft, state);
    }
    await enforceReadableTextMinimumsForMobileDraft(draft, state);
    positionDraftNode(root, draft, originalBounds);

    const draftBounds = getNodeBounds(draft);
    addAppliedChange(state, `${Math.round(state.sourceWidth)}px PC to ${state.targetWidth}px MO frame rebuild`);
    if (rootFrameGuidance && rootFrameGuidance.usingFallback) {
      state.conservativeDecisionCount += 1;
      addQualityWarning(state, "Root frame guidance fell back to heuristic sizing because learned frame confidence was low");
      addDecisionNote(state, "Used heuristic root sizing because frame-shape evidence was weak");
      addAppliedChange(state, "Used fallback root sizing due to low frame-shape confidence");
    }
    if (rootFrameGuidance && rootFrameGuidance.profileId) {
      addAppliedChange(
        state,
        `Learned root frame shift ${rootFrameGuidance.sourceShape} -> ${rootFrameGuidance.targetShape} (${rootFrameGuidance.targetAspectRatio})`
      );
    }
    if (state.textAdjustments > 0) {
      addAppliedChange(state, `Adjusted text sizing for ${state.textAdjustments} nodes`);
    }
    if (state.stackedContainers > 0) {
      addAppliedChange(state, `Converted ${state.stackedContainers} horizontal containers into vertical stacks`);
    }
    if (state.hiddenTopLevelNodes > 0) {
      addAppliedChange(state, `Hid ${state.hiddenTopLevelNodes} desktop-only top-level sections`);
    }
    if (state.skippedSectionCount > 0) {
      addAppliedChange(state, `Skipped ${state.skippedSectionCount} top-level sections that could not be interpreted`);
    }
    if (state.appendedSectionCount > 0) {
      addAppliedChange(state, `Appended ${state.appendedSectionCount} top-level sections into the MO frame`);
    }
    if (state.templatedSectionCount > 0) {
      addAppliedChange(state, `Applied ${state.templatedSectionCount} templated sections`);
    }
    if (state.learnedSectionCount > 0) {
      addAppliedChange(state, `Learning-based sections: ${state.learnedSectionCount}`);
    }
    if (state.hybridSectionCount > 0) {
      addAppliedChange(state, `Hybrid sections: ${state.hybridSectionCount}`);
    }
    if (state.fallbackSectionCount > 0) {
      addAppliedChange(state, `Fallback sections: ${state.fallbackSectionCount}`);
    }
    if (state.rejectedTemplateCount > 0) {
      addAppliedChange(state, `Moved ${state.rejectedTemplateCount} low-quality templates to fallback generation`);
    }
    if (state.conservativeDecisionCount > 0) {
      addAppliedChange(state, `Conservative guards applied: ${state.conservativeDecisionCount}`);
    }
    if (prefersConservativeMobileSections(state)) {
      addDecisionNote(state, "Legacy safe mode kept clone-first placement enabled for fragile sections");
      addAppliedChange(state, "Used clone-first mobile placement to preserve source layer composition");
    }
    if (state.topLevelReflowCount > 0) {
      addAppliedChange(state, `Reflowed ${state.topLevelReflowCount} top-level sections into a mobile column`);
    }
    if (state.scaledNodeCount > 0) {
      addAppliedChange(state, `Scaled ${state.scaledNodeCount} content blocks for mobile fit`);
    }
    if (state.spacingAdjustments > 0) {
      addAppliedChange(state, `Adjusted spacing and padding in ${state.spacingAdjustments} places`);
    }

    const qualityReport = buildDraftQualityReport(state);
    return {
      nodeId: draft.id,
      name: safeName(draft),
      width: draftBounds ? round(draftBounds.width) : targetWidth,
      height: draftBounds ? round(draftBounds.height) : 0,
      createdAt: new Date().toISOString(),
      appliedChanges: state.appliedChanges.slice(0, 6),
      warnings: state.qualityWarnings.slice(0, 3),
      decisionNotes: state.decisionNotes.slice(0, 4),
      evidenceMode: qualityReport.evidenceMode,
      learnedSectionCount: state.learnedSectionCount,
      hybridSectionCount: state.hybridSectionCount,
      fallbackSectionCount: state.fallbackSectionCount,
      qualityReport: qualityReport,
    };
  }

  async function createDesktopDraftFromSelection(root, result, localResult) {
    const type = String(root && root.type ? root.type : "");
    if (["FRAME", "GROUP", "SECTION", "COMPONENT", "INSTANCE"].indexOf(type) < 0) {
      throw new Error("PC 초안으로 확장할 수 있는 루트 노드를 선택해 주세요.");
    }

    const originalBounds = getNodeBounds(root);
    if (!originalBounds) {
      throw new Error("선택한 루트의 크기를 읽지 못해 PC 초안을 만들 수 없습니다.");
    }

    const targetWidth = Math.max(960, numeric(result && result.targetWidth) || DEFAULT_DESKTOP_WIDTH);
    const rootFrameGuidance = predictDraftRootFrameGuidance(
      root,
      targetWidth,
      localResult,
      result && result.memory ? result.memory.frameShapeProfiles : []
    );
    const draft = createSectionRebuiltDesktopDraftFrame(root, targetWidth, originalBounds, rootFrameGuidance);
    const state = {
      action: "pc-design",
      targetWidth: targetWidth,
      minTouchTarget: 32,
      sourceWidth: Math.max(1, numeric(originalBounds.width) || targetWidth),
      sourceHeight: Math.max(1, numeric(originalBounds.height) || targetWidth),
      sourceSectionCount: Array.isArray(root && root.children) && root.children.length > 0 ? root.children.length : 1,
      targetContentWidth: getDesktopContentWidth(draft, targetWidth),
      layoutHints: collectLayoutHintText(result),
      memoryRuleHints: collectMemoryTemplateHints(result),
      aiSectionPlans: collectAiSectionPlans(result),
      frameShapeProfiles: result && result.memory && Array.isArray(result.memory.frameShapeProfiles) ? result.memory.frameShapeProfiles.slice() : [],
      containerProfiles: result && result.memory && Array.isArray(result.memory.containerProfiles) ? result.memory.containerProfiles.slice() : [],
      rootFrameGuidance: rootFrameGuidance,
      textRoleProfiles: result && result.memory && Array.isArray(result.memory.textRoleProfiles) ? result.memory.textRoleProfiles.slice() : [],
      memorySectionExamples:
        result && result.memory && Array.isArray(result.memory.relevantSectionExamples) ? result.memory.relevantSectionExamples.slice() : [],
      appliedChanges: [],
      learnedSectionCount: 0,
      hybridSectionCount: 0,
      fallbackSectionCount: 0,
      appendedSectionCount: 0,
      skippedSectionCount: 0,
      topLevelReflowCount: 0,
      scaledNodeCount: 0,
      textAdjustments: 0,
      horizontalizedContainers: 0,
      hiddenTopLevelNodes: 0,
      spacingAdjustments: 0,
      qualityWarnings: [],
      conservativeDecisionCount: 0,
      decisionNotes: [],
    };

    writeResponsiveDraftPluginData(draft, root, targetWidth, "pc-design");
    const appendedCount = await rebuildDesktopDraftSectionsFromSource(root, draft, state);
    if (appendedCount === 0) {
      throw new Error("PC 초안에 담을 수 있는 섹션을 찾지 못했습니다.");
    }

    transformNodeTreeForDesktopDraft(draft, state, 0);
    await adjustTextNodesForDesktopDraft(draft, state);
    minimizeGeneratedAutoLayoutFrames(draft, state);
    positionDraftNode(root, draft, originalBounds);

    const draftBounds = getNodeBounds(draft);
    addAppliedChange(state, `${Math.round(state.sourceWidth)}px MO to ${state.targetWidth}px PC frame rebuild`);
    if (rootFrameGuidance && rootFrameGuidance.usingFallback) {
      state.conservativeDecisionCount += 1;
      addQualityWarning(state, "Root frame guidance fell back to heuristic sizing because learned frame confidence was low");
      addDecisionNote(state, "Used heuristic root sizing because frame-shape evidence was weak");
      addAppliedChange(state, "Used fallback root sizing due to low frame-shape confidence");
    }
    if (rootFrameGuidance && rootFrameGuidance.profileId) {
      addAppliedChange(
        state,
        `Learned root frame shift ${rootFrameGuidance.sourceShape} -> ${rootFrameGuidance.targetShape} (${rootFrameGuidance.targetAspectRatio})`
      );
    }
    if (state.textAdjustments > 0) {
      addAppliedChange(state, `Expanded text sizing for ${state.textAdjustments} nodes`);
    }
    if (state.horizontalizedContainers > 0) {
      addAppliedChange(state, `Expanded ${state.horizontalizedContainers} containers into wider desktop layouts`);
    }
    if (state.hiddenTopLevelNodes > 0) {
      addAppliedChange(state, `Hid ${state.hiddenTopLevelNodes} mobile-only top-level sections`);
    }
    if (state.skippedSectionCount > 0) {
      addAppliedChange(state, `Skipped ${state.skippedSectionCount} top-level sections that could not be expanded safely`);
    }
    if (state.appendedSectionCount > 0) {
      addAppliedChange(state, `Appended ${state.appendedSectionCount} top-level sections into the PC frame`);
    }
    if (state.learnedSectionCount > 0) {
      addAppliedChange(state, `Learning-based sections: ${state.learnedSectionCount}`);
    }
    if (state.hybridSectionCount > 0) {
      addAppliedChange(state, `Hybrid sections: ${state.hybridSectionCount}`);
    }
    if (state.fallbackSectionCount > 0) {
      addAppliedChange(state, `Fallback sections: ${state.fallbackSectionCount}`);
    }
    if (state.topLevelReflowCount > 0) {
      addAppliedChange(state, `Reflowed ${state.topLevelReflowCount} top-level sections for desktop width`);
    }
    if (state.conservativeDecisionCount > 0) {
      addAppliedChange(state, `Conservative guards applied: ${state.conservativeDecisionCount}`);
    }
    if (state.scaledNodeCount > 0) {
      addAppliedChange(state, `Resized ${state.scaledNodeCount} content blocks for desktop fit`);
    }
    if (state.spacingAdjustments > 0) {
      addAppliedChange(state, `Loosened spacing and padding in ${state.spacingAdjustments} places`);
    }

    const qualityReport = buildDraftQualityReport(state);
    return {
      nodeId: draft.id,
      name: safeName(draft),
      width: draftBounds ? round(draftBounds.width) : targetWidth,
      height: draftBounds ? round(draftBounds.height) : 0,
      createdAt: new Date().toISOString(),
      appliedChanges: state.appliedChanges.slice(0, 6),
      warnings: state.qualityWarnings.slice(0, 3),
      decisionNotes: state.decisionNotes.slice(0, 4),
      evidenceMode: qualityReport.evidenceMode,
      learnedSectionCount: state.learnedSectionCount,
      hybridSectionCount: state.hybridSectionCount,
      fallbackSectionCount: state.fallbackSectionCount,
      qualityReport: qualityReport,
    };
  }

  function createSectionRebuiltDesktopDraftFrame(root, targetWidth, originalBounds, rootFrameGuidance) {
    const draft = figma.createFrame();
    attachSectionRebuiltDraftToSourceParent(root, draft);
    draft.name = `${safeName(root)} / PC Draft ${targetWidth}`;
    const draftGap = deriveDesktopDraftRootGap(root, targetWidth);
    const draftPadding = deriveDesktopDraftRootPadding(root, targetWidth);
    const initialHeight = deriveDesktopDraftRootInitialHeight(targetWidth, originalBounds, rootFrameGuidance);

    try {
      draft.layoutMode = "VERTICAL";
    } catch (error) {}
    try {
      draft.layoutWrap = "NO_WRAP";
    } catch (error) {}
    try {
      if ("primaryAxisSizingMode" in draft) {
        draft.primaryAxisSizingMode = "AUTO";
      }
    } catch (error) {}
    try {
      if ("counterAxisSizingMode" in draft) {
        draft.counterAxisSizingMode = "FIXED";
      }
    } catch (error) {}
    try {
      if ("counterAxisAlignItems" in draft) {
        draft.counterAxisAlignItems = "CENTER";
      }
    } catch (error) {}
    try {
      if ("itemSpacing" in draft) {
        draft.itemSpacing = draftGap;
      }
    } catch (error) {}
    try {
      if ("paddingLeft" in draft) {
        draft.paddingLeft = draftPadding.left;
      }
      if ("paddingRight" in draft) {
        draft.paddingRight = draftPadding.right;
      }
      if ("paddingTop" in draft) {
        draft.paddingTop = draftPadding.top;
      }
      if ("paddingBottom" in draft) {
        draft.paddingBottom = draftPadding.bottom;
      }
    } catch (error) {}
    try {
      if ("clipsContent" in draft) {
        draft.clipsContent = false;
      }
    } catch (error) {}

    applySectionRebuiltDraftVisualStyle(root, draft);
    resizeNodeForDraft(draft, targetWidth, initialHeight);
    return draft;
  }

  function deriveDesktopDraftRootGap(root, targetWidth) {
    const layoutMode = string(root && root.layoutMode, "NONE");
    const sourceGap = numeric(root && root.itemSpacing);
    if (layoutMode !== "NONE" && sourceGap > 0) {
      return expandGapValue(sourceGap);
    }
    if (targetWidth >= 1600) {
      return 28;
    }
    if (targetWidth >= 1280) {
      return 24;
    }
    return 20;
  }

  function deriveDesktopDraftRootPadding(root, targetWidth) {
    const layoutMode = string(root && root.layoutMode, "NONE");
    const padding = {
      left: numeric(root && root.paddingLeft),
      right: numeric(root && root.paddingRight),
      top: numeric(root && root.paddingTop),
      bottom: numeric(root && root.paddingBottom),
    };
    if (layoutMode !== "NONE" && (padding.left > 0 || padding.right > 0 || padding.top > 0 || padding.bottom > 0)) {
      return {
        left: expandPaddingValue(padding.left),
        right: expandPaddingValue(padding.right),
        top: expandPaddingValue(padding.top),
        bottom: expandPaddingValue(padding.bottom),
      };
    }

    const horizontal = targetWidth >= 1800 ? 160 : targetWidth >= 1440 ? 112 : targetWidth >= 1200 ? 80 : 48;
    const vertical = targetWidth >= 1440 ? 56 : 40;
    return {
      left: horizontal,
      right: horizontal,
      top: vertical,
      bottom: vertical,
    };
  }

  function deriveDesktopDraftRootInitialHeight(targetWidth, originalBounds, rootFrameGuidance) {
    return Math.max(760, deriveDraftRootInitialHeight(targetWidth, originalBounds, rootFrameGuidance));
  }

  function getDesktopContentWidth(root, targetWidth) {
    const paddingLeft = "paddingLeft" in root ? numeric(root.paddingLeft) : 0;
    const paddingRight = "paddingRight" in root ? numeric(root.paddingRight) : 0;
    const availableWidth = Math.max(860, Math.round(targetWidth - paddingLeft - paddingRight));
    if (targetWidth >= 1800) {
      return Math.min(1440, availableWidth);
    }
    if (targetWidth >= 1440) {
      return Math.min(1320, availableWidth);
    }
    if (targetWidth >= 1200) {
      return Math.min(1120, availableWidth);
    }
    return Math.min(Math.max(900, targetWidth - 80), availableWidth);
  }

  async function rebuildDesktopDraftSectionsFromSource(sourceRoot, draft, state) {
    const sections = collectSourceSectionsForDraft(sourceRoot);
    const contentWidth = state && state.targetContentWidth > 0 ? state.targetContentWidth : getDesktopContentWidth(draft, state.targetWidth);
    let appended = 0;

    for (let index = 0; index < sections.length; index += 1) {
      const sourceSection = sections[index];
      if (!sourceSection || sourceSection.visible === false) {
        continue;
      }
      if (shouldSkipSourceSectionForDesktop(sourceSection, state)) {
        continue;
      }

      const appendedNode = await appendSourceSectionCloneToDesktopDraft(sourceSection, draft, contentWidth, state);
      if (appendedNode) {
        appended += 1;
        state.appendedSectionCount += 1;
      } else {
        state.skippedSectionCount += 1;
      }
    }

    return appended;
  }

  function shouldSkipSourceSectionForDesktop(node, state) {
    if (!node) {
      return true;
    }

    const bounds = getNodeBounds(node);
    const type = String(node.type || "");
    const width = bounds ? numeric(bounds.width) : numeric(node.width);
    const height = bounds ? numeric(bounds.height) : numeric(node.height);
    const name = safeName(node).toLowerCase();
    const area = width * height;
    const sourceArea = Math.max(1, state.sourceWidth * state.sourceHeight);

    if (containsAny(name, ["mobile only", "mo only", "bottom nav", "tab bar", "drawer handle"])) {
      state.hiddenTopLevelNodes += 1;
      return true;
    }

    const decorativeType = ["ELLIPSE", "VECTOR", "LINE", "STAR", "POLYGON", "BOOLEAN_OPERATION"].indexOf(type) >= 0;
    const decorativeName = containsAny(name, ["bg", "background", "decoration", "ornament", "shape", "dot"]);
    if (area > 0 && area <= sourceArea * 0.028 && (decorativeType || decorativeName)) {
      return true;
    }

    return false;
  }

  async function appendSourceSectionCloneToDesktopDraft(sourceSection, draft, contentWidth, state) {
    const bounds = getNodeBounds(sourceSection);
    const stats = collectSectionNodeStats(sourceSection);
    const sectionType = classifySelectionSectionType(sourceSection, stats, bounds);
    const slot = createDesktopDraftSectionSlot(sourceSection, contentWidth, sectionType);
    const clone = cloneSourceNodeForDraft(sourceSection);
    if (!clone) {
      try {
        slot.remove();
      } catch (slotError) {}
      return null;
    }

    unlockNodeTree(clone);
    normalizeTopLevelChildForFlow(clone);
    const evidence = createDesktopSectionEvidence();
    fitSectionCloneToDesktopWidth(clone, contentWidth, state, sectionType, evidence);
    prepareSectionCloneTreeForDesktop(clone, contentWidth, state, 0, sectionType, evidence);

    try {
      slot.appendChild(clone);
      draft.appendChild(slot);
      const sectionEvidence = finalizeDesktopSectionEvidence(state, sourceSection, evidence);
      writeDraftSectionEvidencePluginData(slot, sectionEvidence);
      return slot;
    } catch (error) {
      try {
        clone.remove();
      } catch (removeError) {}
      try {
        slot.remove();
      } catch (slotError) {}
      return null;
    }
  }

  function createDesktopSectionEvidence() {
    return {
      learnedContainerLayouts: 0,
      heuristicLayouts: 0,
      profileIds: {},
      reliabilityTotal: 0,
      reliabilityCount: 0,
    };
  }

  function noteDesktopSectionHeuristic(evidence) {
    if (!evidence || typeof evidence !== "object") {
      return;
    }
    evidence.heuristicLayouts = Math.round(numeric(evidence.heuristicLayouts) + 1);
  }

  function finalizeDesktopSectionEvidence(state, sourceSection, evidence) {
    const learnedCount = Math.max(0, Math.round(numeric(evidence && evidence.learnedContainerLayouts)));
    const heuristicCount = Math.max(0, Math.round(numeric(evidence && evidence.heuristicLayouts)));
    const reliabilityCount = Math.max(0, Math.round(numeric(evidence && evidence.reliabilityCount)));
    const reliability =
      reliabilityCount > 0 ? clamp(numeric(evidence && evidence.reliabilityTotal) / reliabilityCount, 0, 1) : 0;
    const uniqueProfiles = evidence && evidence.profileIds ? Object.keys(evidence.profileIds).filter(Boolean).length : 0;
    const sectionEvidence = {
      evidenceMode: "fallback-heavy",
      confidenceLabel: "low (fallback)",
      sectionStrategy: "clone-fallback",
      builderType: normalizePredictedSectionType(readDraftSectionType(sourceSection) || classifySelectionSectionType(sourceSection, collectSectionNodeStats(sourceSection), getNodeBounds(sourceSection))),
      fallbackReason: "",
      learnedLayoutCount: learnedCount,
      heuristicLayoutCount: heuristicCount,
      profileCount: uniqueProfiles,
      reliabilityScore: reliability,
      reasons: [],
    };

    if (learnedCount > 0) {
      state.learnedSectionCount += 1;
      sectionEvidence.evidenceMode = heuristicCount > 0 ? "mixed" : "learning-based";
      sectionEvidence.confidenceLabel = reliability >= 0.72 ? "high (learned)" : reliability >= 0.52 ? "medium (learned)" : "low (learned)";
      sectionEvidence.sectionStrategy = heuristicCount > 0 ? "learned-plus-fallback" : "learned-clone";
      sectionEvidence.reasons.push("learned desktop reflow");
      addDecisionNote(
        state,
        `${safeName(sourceSection)} used learned desktop reflow with ${learnedCount} matched container layouts` +
          (uniqueProfiles > 0 ? ` across ${uniqueProfiles} profile${uniqueProfiles === 1 ? "" : "s"}` : "")
      );
      if (heuristicCount > 0) {
        state.hybridSectionCount += 1;
        state.conservativeDecisionCount += 1;
        sectionEvidence.reasons.push("heuristic fallback");
        addQualityWarning(state, `${safeName(sourceSection)} mixed learned desktop layout with heuristic fallback (${heuristicCount})`);
      }
      if (reliability > 0 && reliability < 0.62) {
        state.conservativeDecisionCount += 1;
        sectionEvidence.reasons.push("weak profile reliability");
        addQualityWarning(state, `${safeName(sourceSection)} relied on weak desktop container evidence (${round(reliability)})`);
      }
      return sectionEvidence;
    }

    state.fallbackSectionCount += 1;
    addDecisionNote(state, `${safeName(sourceSection)} used clone fallback for desktop assembly`);
    if (heuristicCount > 0) {
      state.conservativeDecisionCount += 1;
      sectionEvidence.reasons.push("heuristic desktop layout");
      addQualityWarning(state, `${safeName(sourceSection)} expanded with heuristic desktop layout because no reliable profile matched`);
      sectionEvidence.fallbackReason = "no-reliable-profile-match";
    } else {
      sectionEvidence.reasons.push("clone fallback");
      sectionEvidence.fallbackReason = "clone-fallback";
    }
    return sectionEvidence;
  }

  function createDesktopDraftSectionSlot(sourceSection, contentWidth, sectionType) {
    const slot = figma.createFrame();
    slot.name = `${safeName(sourceSection)} / desktop-section`;

    try {
      slot.layoutMode = "VERTICAL";
    } catch (error) {}
    try {
      slot.layoutWrap = "NO_WRAP";
    } catch (error) {}
    try {
      if ("primaryAxisSizingMode" in slot) {
        slot.primaryAxisSizingMode = "AUTO";
      }
    } catch (error) {}
    try {
      if ("counterAxisSizingMode" in slot) {
        slot.counterAxisSizingMode = "FIXED";
      }
    } catch (error) {}
    try {
      if ("itemSpacing" in slot) {
        slot.itemSpacing = 0;
      }
    } catch (error) {}
    try {
      if ("paddingLeft" in slot) {
        slot.paddingLeft = 0;
      }
      if ("paddingRight" in slot) {
        slot.paddingRight = 0;
      }
      if ("paddingTop" in slot) {
        slot.paddingTop = 0;
      }
      if ("paddingBottom" in slot) {
        slot.paddingBottom = 0;
      }
    } catch (error) {}
    try {
      if ("layoutAlign" in slot) {
        slot.layoutAlign = "INHERIT";
      }
    } catch (error) {}
    try {
      slot.fills = [];
    } catch (error) {}

    resizeNodeForDraft(slot, contentWidth, 120);
    writeDraftSectionPluginData(slot, sectionType, safeName(sourceSection));
    return slot;
  }

  function createSectionRebuiltMobileDraftFrame(root, targetWidth, originalBounds, rootFrameGuidance) {
    const draft = figma.createFrame();
    attachSectionRebuiltDraftToSourceParent(root, draft);
    draft.name = `${safeName(root)} / MO Draft ${targetWidth}`;
    const draftGap = deriveDraftRootGap(root);
    const draftPadding = deriveDraftRootPadding(root);
    const initialHeight = deriveDraftRootInitialHeight(targetWidth, originalBounds, rootFrameGuidance);

    try {
      draft.layoutMode = "VERTICAL";
    } catch (error) {}
    try {
      draft.layoutWrap = "NO_WRAP";
    } catch (error) {}
    try {
      if ("primaryAxisSizingMode" in draft) {
        draft.primaryAxisSizingMode = "AUTO";
      }
    } catch (error) {}
    try {
      if ("counterAxisSizingMode" in draft) {
        draft.counterAxisSizingMode = "FIXED";
      }
    } catch (error) {}
    try {
      if ("itemSpacing" in draft) {
        draft.itemSpacing = draftGap;
      }
    } catch (error) {}
    try {
      if ("paddingLeft" in draft) {
        draft.paddingLeft = draftPadding.left;
      }
      if ("paddingRight" in draft) {
        draft.paddingRight = draftPadding.right;
      }
      if ("paddingTop" in draft) {
        draft.paddingTop = draftPadding.top;
      }
      if ("paddingBottom" in draft) {
        draft.paddingBottom = draftPadding.bottom;
      }
    } catch (error) {}
    try {
      if ("clipsContent" in draft) {
        draft.clipsContent = false;
      }
    } catch (error) {}

    applySectionRebuiltDraftVisualStyle(root, draft);
    resizeNodeForDraft(draft, targetWidth, initialHeight);
    return draft;
  }

  function deriveDraftRootGap(root) {
    const layoutMode = string(root && root.layoutMode, "NONE");
    const sourceGap = numeric(root && root.itemSpacing);
    if (layoutMode !== "NONE" && sourceGap > 0) {
      return shrinkGapValue(sourceGap);
    }
    return 0;
  }

  function deriveDraftRootPadding(root) {
    const layoutMode = string(root && root.layoutMode, "NONE");
    const padding = {
      left: numeric(root && root.paddingLeft),
      right: numeric(root && root.paddingRight),
      top: numeric(root && root.paddingTop),
      bottom: numeric(root && root.paddingBottom),
    };

    if (layoutMode !== "NONE" && (padding.left > 0 || padding.right > 0 || padding.top > 0 || padding.bottom > 0)) {
      return {
        left: shrinkPaddingValue(padding.left),
        right: shrinkPaddingValue(padding.right),
        top: shrinkPaddingValue(padding.top),
        bottom: shrinkPaddingValue(padding.bottom),
      };
    }

    return {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };
  }

  function attachSectionRebuiltDraftToSourceParent(sourceNode, draft) {
    const parent = sourceNode && sourceNode.parent;
    if (!parent || typeof parent.appendChild !== "function") {
      return;
    }

    try {
      parent.appendChild(draft);
    } catch (error) {}
  }

  function applySectionRebuiltDraftVisualStyle(sourceNode, draft) {
    const fills = clonePaintArrayForDraft(sourceNode && sourceNode.fills);
    if (fills.length > 0) {
      try {
        draft.fills = fills;
      } catch (error) {}
      return;
    }

    try {
      draft.fills = [
        {
          type: "SOLID",
          color: { r: 1, g: 1, b: 1 },
        },
      ];
    } catch (error) {}
  }

  async function rebuildMobileDraftSectionsFromSource(sourceRoot, draft, state) {
    const sections = collectSourceSectionsForDraft(sourceRoot);
    const contentWidth = getMobileContentWidth(draft, state.targetWidth);
    let appended = 0;

    for (let index = 0; index < sections.length; index += 1) {
      const sourceSection = sections[index];
      if (!sourceSection || sourceSection.visible === false) {
        continue;
      }
      if (shouldSkipSourceSectionForDraft(sourceSection, state)) {
        continue;
      }

      const appendedNode = await appendSourceSectionCloneToDraft(sourceSection, draft, contentWidth, state, index);
      if (!appendedNode) {
        continue;
      }

      appended += 1;
      state.appendedSectionCount += 1;
      state.topLevelReflowCount += 1;
    }

    return appended;
  }

  function collectSourceSectionsForDraft(sourceRoot) {
    if (shouldTreatRootAsSingleSectionForDraft(sourceRoot)) {
      return [sourceRoot];
    }
    let sections = [];
    if (sourceRoot && sourceRoot.type === "SECTION" && Array.isArray(sourceRoot.children) && sourceRoot.children.length > 0) {
      sections = sourceRoot.children.slice();
    } else if (sourceRoot && Array.isArray(sourceRoot.children) && sourceRoot.children.length > 0) {
      sections = sourceRoot.children.slice();
    } else {
      sections = sourceRoot ? [sourceRoot] : [];
    }
    return buildVisualSectionBands(sortTopLevelSectionsByVisualOrder(sections));
  }

  function shouldTreatRootAsSingleSectionForDraft(sourceRoot) {
    if (!sourceRoot || !Array.isArray(sourceRoot.children) || sourceRoot.children.length < 3) {
      return false;
    }
    const bounds = getNodeBounds(sourceRoot);
    if (!bounds) {
      return false;
    }
    const stats = collectSectionNodeStats(sourceRoot);
    const sectionType = classifySelectionSectionType(sourceRoot, stats, bounds);
    if (sectionType !== "hero" && sectionType !== "editorial") {
      return false;
    }
    if (countAbsoluteChildrenForDraft(sourceRoot) >= 2) {
      return true;
    }
    return shouldPreserveFreeformContainer(sourceRoot) && stats.imageFillCount >= 1 && stats.textNodeCount >= 2;
  }

  function sortTopLevelSectionsByVisualOrder(sections) {
    const list = Array.isArray(sections) ? sections.slice() : [];
    return list
      .map((node, index) => {
        const bounds = getNodeBounds(node);
        return {
          node: node,
          index: index,
          y: bounds ? numeric(bounds.y) : index * 1000,
          x: bounds ? numeric(bounds.x) : index,
        };
      })
      .sort((left, right) => {
        if (Math.abs(left.y - right.y) > 4) {
          return left.y - right.y;
        }
        if (Math.abs(left.x - right.x) > 4) {
          return left.x - right.x;
        }
        return left.index - right.index;
      })
      .map((entry) => entry.node);
  }

  function buildVisualSectionBands(sections) {
    const sorted = Array.isArray(sections) ? sections.slice() : [];
    const out = [];
    let band = null;

    for (let index = 0; index < sorted.length; index += 1) {
      const node = sorted[index];
      const bounds = getNodeBounds(node);
      if (!node || !bounds) {
        continue;
      }

      if (!band || !shouldMergeIntoVisualBand(band.bounds, bounds)) {
        if (band) {
          out.push(finalizeVisualSectionBand(band));
        }
        band = {
          id: `band-${index}`,
          nodes: [node],
          bounds: cloneBounds(bounds),
        };
        continue;
      }

      band.nodes.push(node);
      band.bounds = mergeBounds(band.bounds, bounds);
    }

    if (band) {
      out.push(finalizeVisualSectionBand(band));
    }

    return out;
  }

  function shouldMergeIntoVisualBand(existingBounds, nextBounds) {
    if (!existingBounds || !nextBounds) {
      return false;
    }
    const overlapTop = Math.max(numeric(existingBounds.y), numeric(nextBounds.y));
    const overlapBottom = Math.min(
      numeric(existingBounds.y) + numeric(existingBounds.height),
      numeric(nextBounds.y) + numeric(nextBounds.height)
    );
    const verticalOverlap = overlapBottom - overlapTop;
    return verticalOverlap >= 24;
  }

  function finalizeVisualSectionBand(band) {
    if (!band || !Array.isArray(band.nodes) || band.nodes.length <= 1) {
      return band && Array.isArray(band.nodes) && band.nodes.length === 1 ? band.nodes[0] : null;
    }

    const names = [];
    for (let index = 0; index < band.nodes.length && names.length < 3; index += 1) {
      const name = safeName(band.nodes[index]);
      if (name && names.indexOf(name) < 0) {
        names.push(name);
      }
    }

    return {
      kind: "source-section-band",
      id: band.id,
      name: names.join(" / ") || `Band ${band.id}`,
      nodes: band.nodes.slice(),
      bounds: cloneBounds(band.bounds),
    };
  }

  function cloneBounds(bounds) {
    return bounds
      ? {
          x: round(bounds.x),
          y: round(bounds.y),
          width: round(bounds.width),
          height: round(bounds.height),
        }
      : null;
  }

  function mergeBounds(left, right) {
    if (!left) {
      return cloneBounds(right);
    }
    if (!right) {
      return cloneBounds(left);
    }
    const x = Math.min(numeric(left.x), numeric(right.x));
    const y = Math.min(numeric(left.y), numeric(right.y));
    const rightEdge = Math.max(numeric(left.x) + numeric(left.width), numeric(right.x) + numeric(right.width));
    const bottomEdge = Math.max(numeric(left.y) + numeric(left.height), numeric(right.y) + numeric(right.height));
    return {
      x: round(x),
      y: round(y),
      width: round(rightEdge - x),
      height: round(bottomEdge - y),
    };
  }

  function isSectionBand(node) {
    return !!(node && node.kind === "source-section-band" && Array.isArray(node.nodes));
  }

  function shouldSkipSourceSectionForDraft(node, state) {
    if (!node) {
      return true;
    }

    const bounds = getNodeBounds(node);
    const type = String(node.type || "");
    const width = bounds ? numeric(bounds.width) : numeric(node.width);
    const height = bounds ? numeric(bounds.height) : numeric(node.height);
    const name = safeName(node).toLowerCase();
    const area = width * height;
    const sourceArea = Math.max(1, state.sourceWidth * state.sourceWidth);
    const collapseHint = state.layoutHints.indexOf("section collapses on mobile") >= 0 || state.layoutHints.indexOf("collapse") >= 0;

    if (collapseHint && containsAny(name, ["sidebar", "desktop", "pc only", "gnb", "global nav"])) {
      state.hiddenTopLevelNodes += 1;
      return true;
    }

    const decorativeType = ["ELLIPSE", "VECTOR", "LINE", "STAR", "POLYGON", "BOOLEAN_OPERATION"].indexOf(type) >= 0;
    const decorativeName = containsAny(name, ["bg", "background", "decoration", "ornament", "shape", "dot"]);
    if (area > 0 && area <= sourceArea * 0.04 && (decorativeType || decorativeName)) {
      state.skippedSectionCount += 1;
      return true;
    }

    return false;
  }

  function prefersConservativeMobileSections(state) {
    return !state || state.preferConservativeMobileSections !== false;
  }

  function usesAiCompositionOnly(state) {
    return !!(state && state.aiCompositionOnly);
  }

  function shouldAttemptTemplatedMobileSection(sourceSection, sectionTypeHint) {
    if (!sourceSection || isSectionBand(sourceSection)) {
      return false;
    }

    const sectionType = normalizePredictedSectionType(sectionTypeHint || readDraftSectionType(sourceSection) || "");
    return sectionType === "hero" || sectionType === "promo" || sectionType === "article" || sectionType === "editorial";
  }

  function shouldUseConservativeMobileSectionPlacement(node, state, sectionTypeHint) {
    if (usesAiCompositionOnly(state)) {
      return true;
    }

    if (prefersConservativeMobileSections(state)) {
      return true;
    }

    if (isSectionBand(node) || shouldPreserveFreeformContainer(node)) {
      return true;
    }
    return false;
  }

  function normalizeCloneForSlotPlacement(node) {
    if (!node) {
      return;
    }

    try {
      if ("layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE") {
        node.layoutPositioning = "AUTO";
      }
    } catch (error) {}

    try {
      if ("x" in node) {
        node.x = 0;
      }
      if ("y" in node) {
        node.y = 0;
      }
    } catch (error) {}
  }

  async function appendSourceSectionCloneToDraft(sourceSection, draft, contentWidth, state, sourceSectionIndex) {
    const bounds = getNodeBounds(sourceSection);
    const stats = collectSectionNodeStats(sourceSection);
    const sectionType = classifySelectionSectionType(sourceSection, stats, bounds);
    let aiPlan = usesAiCompositionOnly(state)
      ? findMatchingAiSectionPlan(sourceSection, sectionType, state, sourceSectionIndex)
      : null;
    let implicitKeepFallbackReason = "";
    if (usesAiCompositionOnly(state) && !aiPlan) {
      aiPlan = buildImplicitKeepSectionPlan(sourceSection, sourceSectionIndex, sectionType);
      implicitKeepFallbackReason = "missing-ai-plan";
      state.conservativeDecisionCount += 1;
      addQualityWarning(state, `${safeName(sourceSection)} had no matched AI section plan, so code preserved it with keep fallback.`);
      addDecisionNote(state, `${safeName(sourceSection)} had no matched AI section plan and was preserved with implicit keep fallback`);
    }
    let aiKeepPlan = !!(aiPlan && string(aiPlan.builderType, "") === "keep");
    const slot = createDraftSectionSlot(sourceSection, contentWidth, sectionType);
    if (
      shouldAttemptTemplatedMobileSection(sourceSection, sectionType) &&
      (await appendTemplatedSectionToSlot(sourceSection, slot, contentWidth, state, sectionType, sourceSectionIndex))
    ) {
      try {
        draft.appendChild(slot);
        return slot;
      } catch (error) {
        try {
          slot.remove();
        } catch (slotError) {}
        return null;
      }
    }

    if (usesAiCompositionOnly(state) && !aiKeepPlan) {
      aiPlan = buildImplicitKeepSectionPlan(sourceSection, sourceSectionIndex, sectionType);
      aiKeepPlan = true;
      implicitKeepFallbackReason = implicitKeepFallbackReason || "unrenderable-ai-plan";
      state.conservativeDecisionCount += 1;
      addQualityWarning(
        state,
        `${safeName(sourceSection)} could not be rendered through the AI template path, so code preserved it with keep fallback.`
      );
      addDecisionNote(state, `${safeName(sourceSection)} fell back to implicit keep after the AI template path could not render it`);
    }

    if (usesAiCompositionOnly(state)) {
      if (!aiPlan) {
        try {
          slot.remove();
        } catch (slotError) {}
        throw new Error(`PC -> MO AI 기획이 '${safeName(sourceSection)}' 섹션을 렌더링할 계획을 주지 않았습니다.`);
      }
      if (!aiKeepPlan) {
        try {
          slot.remove();
        } catch (slotError) {}
        throw new Error(`PC -> MO 변환은 AI 기획 기반 렌더러만 사용합니다. '${safeName(sourceSection)}' 섹션 plan이 템플릿으로 연결되지 않았습니다.`);
      }
    }

    const useConservativeClone = shouldUseConservativeMobileSectionPlacement(sourceSection, state, sectionType);

    const clone = cloneSourceNodeForDraft(sourceSection);
    if (!clone) {
      try {
        slot.remove();
      } catch (slotError) {}
      return null;
    }

    unlockNodeTree(clone);
    normalizeCloneForSlotPlacement(clone);
    fitSectionCloneToDraftWidth(clone, contentWidth, state, sectionType);
    if (!useConservativeClone) {
      prepareSectionCloneTreeForDraft(clone, contentWidth, state, 0, sectionType);
    }

    try {
      slot.appendChild(clone);
      draft.appendChild(slot);
      state.fallbackSectionCount += 1;
      if (implicitKeepFallbackReason === "missing-ai-plan") {
        addDecisionNote(state, `${safeName(sourceSection)} used implicit AI keep fallback with clone renderer`);
      } else if (implicitKeepFallbackReason === "unrenderable-ai-plan") {
        addDecisionNote(state, `${safeName(sourceSection)} used implicit keep fallback after AI template rendering failed`);
      } else if (aiKeepPlan) {
        addDecisionNote(state, `${safeName(sourceSection)} used AI keep plan with clone renderer`);
      } else if (useConservativeClone) {
        state.conservativeDecisionCount += 1;
        addDecisionNote(state, `${safeName(sourceSection)} used conservative clone placement to preserve source layering`);
      } else {
        addDecisionNote(state, `${safeName(sourceSection)} used clone fallback for mobile assembly`);
      }
      writeDraftSectionEvidencePluginData(slot, {
        evidenceMode: aiKeepPlan ? "ai-keep" : "fallback-heavy",
        confidenceLabel: aiKeepPlan ? "ai keep" : "low (fallback)",
        sectionStrategy:
          implicitKeepFallbackReason === "missing-ai-plan"
            ? "implicit-ai-keep-clone"
            : implicitKeepFallbackReason === "unrenderable-ai-plan"
            ? "ai-template-to-keep-clone"
            : aiKeepPlan
            ? "ai-keep-clone"
            : useConservativeClone
            ? "clone-scale-preserve"
            : "clone-fallback",
        builderType: aiKeepPlan ? "keep" : sectionType,
        fallbackReason:
          implicitKeepFallbackReason === "missing-ai-plan"
            ? "missing-ai-plan"
            : implicitKeepFallbackReason === "unrenderable-ai-plan"
            ? "unrenderable-ai-plan"
            : aiKeepPlan
            ? "ai-plan-keep"
            : useConservativeClone
            ? "preserve-source-layering"
            : "template-unavailable-or-rejected",
        learnedLayoutCount: 0,
        heuristicLayoutCount: aiKeepPlan ? 0 : 1,
        profileCount: 0,
        reliabilityScore: aiKeepPlan ? 1 : 0,
        reasons:
          implicitKeepFallbackReason === "missing-ai-plan"
            ? ["implicit keep fallback", "missing ai plan"]
            : implicitKeepFallbackReason === "unrenderable-ai-plan"
            ? ["implicit keep fallback", "ai template unavailable"]
            : aiKeepPlan
            ? ["ai keep plan", "clone renderer"]
            : useConservativeClone
            ? ["conservative clone placement", "preserved source layering"]
            : ["clone fallback", "template unavailable or rejected"],
      });
      return slot;
    } catch (error) {
      try {
        clone.remove();
      } catch (removeError) {}
      try {
        slot.remove();
      } catch (slotError) {}
      return null;
    }
  }

  function cloneSourceNodeForDraft(sourceNode) {
    if (isSectionBand(sourceNode)) {
      return cloneSectionBandForDraft(sourceNode);
    }
    if (!sourceNode || typeof sourceNode.clone !== "function") {
      return null;
    }

    let clone = null;
    try {
      clone = sourceNode.clone();
    } catch (error) {
      clone = null;
    }

    if (clone && clone.type === "INSTANCE" && typeof clone.detachInstance === "function") {
      try {
        clone = clone.detachInstance();
      } catch (error) {}
    }

    return clone;
  }

  function cloneSectionBandForDraft(sourceBand) {
    if (!isSectionBand(sourceBand)) {
      return null;
    }

    const frame = figma.createFrame();
    frame.name = `${safeName(sourceBand)} / band`;
    try {
      frame.layoutMode = "NONE";
    } catch (error) {}
    try {
      frame.clipsContent = false;
    } catch (error) {}
    try {
      frame.fills = [];
    } catch (error) {}

    const bandBounds = getNodeBounds(sourceBand);
    if (bandBounds) {
      resizeNodeForDraft(frame, Math.max(1, bandBounds.width), Math.max(1, bandBounds.height));
    }

    const nodes = sortTopLevelSectionsByVisualOrder(sourceBand.nodes);
    for (let index = 0; index < nodes.length; index += 1) {
      const sourceNode = nodes[index];
      const clone = cloneSourceNodeForDraft(sourceNode);
      const childBounds = getNodeBounds(sourceNode);
      if (!clone || !childBounds || !bandBounds) {
        if (clone) {
          try {
            clone.remove();
          } catch (removeError) {}
        }
        continue;
      }

      unlockNodeTree(clone);
      try {
        clone.x = round(childBounds.x - bandBounds.x);
        clone.y = round(childBounds.y - bandBounds.y);
      } catch (error) {}

      try {
        frame.appendChild(clone);
      } catch (appendError) {
        try {
          clone.remove();
        } catch (removeError) {}
      }
    }

    return frame;
  }

  function createDraftSectionSlot(sourceSection, contentWidth, sectionType) {
    const slot = figma.createFrame();
    slot.name = `${safeName(sourceSection)} / mobile-section`;

    try {
      slot.layoutMode = "VERTICAL";
    } catch (error) {}
    try {
      slot.layoutWrap = "NO_WRAP";
    } catch (error) {}
    try {
      if ("primaryAxisSizingMode" in slot) {
        slot.primaryAxisSizingMode = "AUTO";
      }
    } catch (error) {}
    try {
      if ("counterAxisSizingMode" in slot) {
        slot.counterAxisSizingMode = "FIXED";
      }
    } catch (error) {}
    try {
      if ("itemSpacing" in slot) {
        slot.itemSpacing = 0;
      }
    } catch (error) {}
    try {
      if ("paddingLeft" in slot) {
        slot.paddingLeft = 0;
      }
      if ("paddingRight" in slot) {
        slot.paddingRight = 0;
      }
      if ("paddingTop" in slot) {
        slot.paddingTop = 0;
      }
      if ("paddingBottom" in slot) {
        slot.paddingBottom = 0;
      }
    } catch (error) {}
    try {
      if ("layoutSizingHorizontal" in slot) {
        slot.layoutSizingHorizontal = "FILL";
      }
    } catch (error) {}
    try {
      if ("layoutAlign" in slot) {
        slot.layoutAlign = "STRETCH";
      }
    } catch (error) {}
    try {
      slot.fills = [];
    } catch (error) {}

    resizeNodeForDraft(slot, contentWidth, 100);
    writeDraftSectionPluginData(slot, sectionType, safeName(sourceSection));
    return slot;
  }

  async function appendTemplatedSectionToSlot(sourceSection, slot, contentWidth, state, sectionType, sourceSectionIndex) {
    const templatePlan = resolveSectionTemplatePlan(sourceSection, sectionType, state, sourceSectionIndex);
    if (!templatePlan || ["hero", "promo", "article"].indexOf(templatePlan.builderType) < 0) {
      return false;
    }
    const confidenceReport =
      templatePlan && templatePlan.confidenceReport && typeof templatePlan.confidenceReport === "object"
        ? templatePlan.confidenceReport
        : { level: "low", score: 0, mode: "fallback", preferFallback: true, reasons: [], label: "low (fallback)" };
    if (confidenceReport.preferFallback) {
      addDecisionNote(
        state,
        `${safeName(sourceSection)} is trying ${templatePlan.builderType} template before clone fallback because evidence was ${confidenceReport.label}`
      );
    }

    const candidates = collectTemplateCandidates(sourceSection);
    let template = null;
    if (templatePlan.builderType === "hero") {
      template = await buildHeroTemplateSection(sourceSection, candidates, contentWidth, state, templatePlan);
    } else if (templatePlan.builderType === "promo") {
      template = await buildPromoTemplateSection(sourceSection, candidates, contentWidth, state, templatePlan);
    } else {
      template = await buildArticleTemplateSection(sourceSection, candidates, contentWidth, state, templatePlan);
    }

    if (!template) {
      return false;
    }

    const quality = evaluateTemplatedSectionQuality(sourceSection, template, templatePlan);
    if (!quality.ok && !usesAiCompositionOnly(state)) {
      state.rejectedTemplateCount += 1;
      state.conservativeDecisionCount += 1;
      if (Array.isArray(quality.warnings)) {
        for (let index = 0; index < quality.warnings.length; index += 1) {
          addQualityWarning(state, `${safeName(sourceSection)}: ${quality.warnings[index]}`);
        }
      }
      addDecisionNote(state, `${safeName(sourceSection)} rejected ${templatePlan.builderType} template and moved to clone fallback`);
      try {
        template.remove();
      } catch (removeError) {}
      return false;
    }

    if (Array.isArray(quality.warnings)) {
      for (let index = 0; index < quality.warnings.length; index += 1) {
        addQualityWarning(state, `${safeName(sourceSection)}: ${quality.warnings[index]}`);
      }
    }

    try {
      writeDraftSectionPluginData(slot, templatePlan.sourceType || sectionType, safeName(sourceSection));
      writeDraftSectionEvidencePluginData(slot, {
        evidenceMode: usesAiCompositionOnly(state) ? "ai-only" : confidenceReport.mode || (confidenceReport.preferFallback ? "fallback" : "learned"),
        confidenceLabel: confidenceReport.label,
        sectionStrategy: "template",
        builderType: templatePlan.builderType,
        fallbackReason: "",
        learnedLayoutCount: 1,
        heuristicLayoutCount: usesAiCompositionOnly(state) ? 0 : confidenceReport.level === "high" ? 0 : 1,
        profileCount:
          (templatePlan.memoryExample ? 1 : 0) +
          (templatePlan.containerProfile ? 1 : 0) +
          (templatePlan.aiPlan ? 1 : 0),
        reliabilityScore: confidenceReport.score,
        reasons: Array.isArray(confidenceReport.reasons) ? confidenceReport.reasons : [],
      });
      slot.appendChild(template);
      state.templatedSectionCount += 1;
      state.learnedSectionCount += 1;
      if (confidenceReport.level !== "high") {
        state.hybridSectionCount += 1;
        state.conservativeDecisionCount += 1;
      }
      addDecisionNote(state, `${safeName(sourceSection)} used ${templatePlan.builderType} template with ${confidenceReport.label} evidence`);
      addAppliedChange(
        state,
        `${safeName(sourceSection)} -> ${templatePlan.builderType} mobile template` +
          (templatePlan.memoryExample ? ` (${templatePlan.memoryExample.mobilePattern})` : "") +
          (templatePlan.aiPlan && templatePlan.aiPlan.notes ? ` [AI: ${templatePlan.aiPlan.notes}]` : "") +
          ` [${confidenceReport.mode}]`
      );
      return true;
    } catch (error) {
      try {
        template.remove();
      } catch (removeError) {}
      return false;
    }
  }

  function collectTemplateCandidates(sourceSection) {
    const result = {
      textNodes: [],
      visualNodes: [],
      blockNodes: [],
    };
    const stack = [];
    const sourceBounds = getNodeBounds(sourceSection);
    if (isSectionBand(sourceSection)) {
      for (let index = sourceSection.nodes.length - 1; index >= 0; index -= 1) {
        const bandNode = sourceSection.nodes[index];
        stack.push({
          node: bandNode,
          depth: 1,
          mirrored: isMirroredTransformNode(bandNode),
        });
      }
    } else {
      stack.push({ node: sourceSection, depth: 0, mirrored: isMirroredTransformNode(sourceSection) });
    }

    while (stack.length > 0) {
      const currentEntry = stack.pop();
      const current = currentEntry.node;
      const depth = currentEntry.depth;
      const mirrored = !!currentEntry.mirrored;
      if (!current || current.visible === false) {
        continue;
      }

      const bounds = getNodeBounds(current);
      if ((!isSectionBand(sourceSection) ? current !== sourceSection : true) && bounds) {
        if (depth === 1 && !isTinyDecorativeNodeForTemplate(current, bounds)) {
          result.blockNodes.push({
            node: current,
            bounds: bounds,
            depth: depth,
            mirrored: mirrored,
          });
        }

        if (isTemplateTextCandidate(current)) {
          result.textNodes.push({
            node: current,
            bounds: bounds,
            depth: depth,
            mirrored: mirrored,
            fontSize: getTemplateTextSize(current),
            score: getTemplateTextCandidateScore(current, bounds),
          });
        } else if (isTemplateVisualCandidate(current, bounds)) {
          const areaRatio =
            sourceBounds && numeric(sourceBounds.width) * numeric(sourceBounds.height) > 0
              ? (numeric(bounds.width) * numeric(bounds.height)) / (numeric(sourceBounds.width) * numeric(sourceBounds.height))
              : 0;
          const semanticRole = classifyTemplateVisualSemanticRole(current, bounds, sourceBounds, areaRatio);
          result.visualNodes.push({
            node: current,
            bounds: bounds,
            depth: depth,
            mirrored: mirrored,
            hasImageFill: nodeHasVisibleImageFill(current),
            semanticRole: semanticRole,
            trimTolerance: deriveVisualTrimTolerance(semanticRole),
            areaRatio: round(areaRatio),
            score: getTemplateVisualCandidateScore(current, bounds, depth),
          });
        }
      }

      if (!Array.isArray(current.children)) {
        continue;
      }
      for (let childIndex = current.children.length - 1; childIndex >= 0; childIndex -= 1) {
        const childNode = current.children[childIndex];
        stack.push({
          node: childNode,
          depth: depth + 1,
          mirrored: mirrored !== isMirroredTransformNode(childNode),
        });
      }
    }

    result.textNodes.sort(compareTemplateTextCandidates);
    result.visualNodes.sort(compareTemplateVisualCandidates);
    result.blockNodes.sort(compareTemplateReadingOrder);
    return result;
  }

  function legacyEvaluateTemplatedSectionQuality(sourceSection, template, plan) {
    const warnings = [];
    const sourceTextNodes = [];
    const templateTextNodes = [];
    const textPreservation = plan && plan.textPreservation && typeof plan.textPreservation === "object" ? plan.textPreservation : null;
    collectTextNodes(sourceSection, sourceTextNodes);
    collectTextNodes(template, templateTextNodes);

    const sourceTextCount = countMeaningfulTextNodes(sourceTextNodes);
    const templateTextCount = countMeaningfulTextNodes(templateTextNodes);
    const missingTexts = findMissingTemplateTexts(sourceTextNodes, templateTextNodes);
    const hiddenTexts = collectHiddenTemplateTextFailures(templateTextNodes);
    const clippedTexts = collectTemplateClippedTextFailures(template, templateTextNodes);
    if (sourceTextCount >= 2 && templateTextCount < Math.min(sourceTextCount, 2)) {
      warnings.push("????????釉먮폁????????????????????⑤벡?????????????????????????????????????????살몝??");
      return { ok: false, warnings: warnings };
    }

    const minFontSizes = getTemplateMinFontSizes(plan);
    const minFailures = collectTemplateMinFontFailures(templateTextNodes, minFontSizes);
    const compressionFailures = collectTemplateTextCompressionFailures(sourceTextNodes, templateTextNodes, minFontSizes);
    const readingOrderFailures =
      textPreservation && textPreservation.preserveReadingOrder ? collectTemplateReadingOrderFailures(sourceTextNodes, templateTextNodes) : [];
    if (minFailures.length > 0) {
      warnings.push(minFailures[0]);
      return { ok: false, warnings: warnings };
    }
    if (compressionFailures.length > 0) {
      warnings.push(compressionFailures[0]);
      return { ok: false, warnings: warnings };
    }

    if (string(plan && plan.contentPriority, "") === "text-first" && !doesTemplateRespectTextFirstFlow(template, plan)) {
      warnings.push("text-first ????????????椰???????????????袁⑸즴筌?씛彛???돗?????????????????椰??????? ???????????????????????");
      return { ok: false, warnings: warnings };
    }

    if (templateTextCount < sourceTextCount) {
      warnings.push(`Template preserved fewer text nodes than the source (${sourceTextCount} -> ${templateTextCount})`);
    }

    return {
      ok: true,
      warnings: warnings,
    };
    /*
    if (textPreservation && textPreservation.allTextMustSurvive && sourceTextCount > 0 && templateTextCount < sourceTextCount) {
      warnings.push(`????????븐뼐???????????????????怨뺤떪???????????????????留⑶뜮?????????붺몭?????????? ??????嫄???????????????????? (${templateTextCount}/${sourceTextCount})`);
      return { ok: false, warnings: warnings };
    }
    }
    */
    if (textPreservation && textPreservation.allTextMustSurvive && sourceTextCount > 0 && templateTextCount < sourceTextCount) {
      warnings.push(`Template lost required text coverage (${templateTextCount}/${sourceTextCount})`);
      return { ok: false, warnings: warnings };
    }
    if (textPreservation && textPreservation.allTextMustSurvive && missingTexts.length > 0) {
      warnings.push(`Missing source text in template: ${missingTexts[0]}`);
      return { ok: false, warnings: warnings };
    }
    if (textPreservation && textPreservation.allTextMustSurvive && hiddenTexts.length > 0) {
      warnings.push(hiddenTexts[0]);
      return { ok: false, warnings: warnings };
    }
    if (textPreservation && textPreservation.allTextMustSurvive && clippedTexts.length > 0) {
      warnings.push(clippedTexts[0]);
      return { ok: false, warnings: warnings };
    }
    if (readingOrderFailures.length > 0) {
      warnings.push(readingOrderFailures[0]);
      return { ok: false, warnings: warnings };
    }
    if (templateTextCount < sourceTextCount) {
      warnings.push(`Template preserved fewer text nodes than the source (${sourceTextCount} -> ${templateTextCount})`);
    }

    return {
      ok: true,
      warnings: warnings,
    };
  }
    /*
    if (templateTextCount < sourceTextCount) {
      warnings.push(`????????釉먮폁?????????????????嫄??????????????ㅻ깹???????????雅?굛肄?????????怨쀫엥????????????????????쎛 ${sourceTextCount}?????????????????곗뿨???????????????${templateTextCount}?????????????????곗뿨?????????????????????????????????????????????살몝??`);
    }

    return {
      ok: true,
      warnings: warnings,
    };
  }

  */

  function evaluateTemplatedSectionQuality(sourceSection, template, plan) {
    const warnings = [];
    const builderType = string(plan && plan.builderType, readDraftSectionType(template));
    const sourceTextNodes = [];
    const templateTextNodes = [];
    const textPreservation = plan && plan.textPreservation && typeof plan.textPreservation === "object" ? plan.textPreservation : null;
    collectTextNodes(sourceSection, sourceTextNodes);
    collectTextNodes(template, templateTextNodes);

    const sourceTextCount = countMeaningfulTextNodes(sourceTextNodes);
    const templateTextCount = countMeaningfulTextNodes(templateTextNodes);
    const missingTexts = findMissingTemplateTexts(sourceTextNodes, templateTextNodes);
    const hiddenTexts = collectHiddenTemplateTextFailures(templateTextNodes);
    const clippedTexts = collectTemplateClippedTextFailures(template, templateTextNodes);
    const minFontSizes = getTemplateMinFontSizes(plan);
    const minFailures = collectTemplateMinFontFailures(templateTextNodes, minFontSizes);
    const compressionFailures = collectTemplateTextCompressionFailures(sourceTextNodes, templateTextNodes, minFontSizes);
    const readingOrderFailures =
      textPreservation && textPreservation.preserveReadingOrder ? collectTemplateReadingOrderFailures(sourceTextNodes, templateTextNodes) : [];

    if (sourceTextCount >= 2 && templateTextCount < Math.min(sourceTextCount, 2)) {
      return { ok: false, warnings: ["Template collapsed too much text content"] };
    }
    if (minFailures.length > 0) {
      return { ok: false, warnings: [minFailures[0]] };
    }
    if (compressionFailures.length > 0) {
      return { ok: false, warnings: [compressionFailures[0]] };
    }
    if (string(plan && plan.contentPriority, "") === "text-first" && !doesTemplateRespectTextFirstFlow(template, plan)) {
      return { ok: false, warnings: ["Template violated the guided text-first flow"] };
    }
    if (textPreservation && textPreservation.allTextMustSurvive && sourceTextCount > 0 && templateTextCount < sourceTextCount) {
      return { ok: false, warnings: [`Template lost required text coverage (${templateTextCount}/${sourceTextCount})`] };
    }
    if (textPreservation && textPreservation.allTextMustSurvive && missingTexts.length > 0) {
      return { ok: false, warnings: [`Missing source text in template: ${missingTexts[0]}`] };
    }
    if (textPreservation && textPreservation.allTextMustSurvive && hiddenTexts.length > 0) {
      return { ok: false, warnings: [hiddenTexts[0]] };
    }
    if (textPreservation && textPreservation.allTextMustSurvive && clippedTexts.length > 0) {
      return { ok: false, warnings: [clippedTexts[0]] };
    }
    if (readingOrderFailures.length > 0) {
      return { ok: false, warnings: [readingOrderFailures[0]] };
    }

    const requiredRoleFailures = collectRequiredTemplateRoleFailures(sourceSection, template, plan, builderType);
    if (requiredRoleFailures.length > 0) {
      return { ok: false, warnings: [requiredRoleFailures[0]] };
    }
    const visualGuidance = collectTemplateVisualGuidanceFailures(template, plan, builderType);
    if (visualGuidance.failures.length > 0) {
      return { ok: false, warnings: [visualGuidance.failures[0]] };
    }
    for (let index = 0; index < visualGuidance.warnings.length; index += 1) {
      warnings.push(visualGuidance.warnings[index]);
    }
    if (templateTextCount < sourceTextCount) {
      warnings.push(`Template preserved fewer text nodes than the source (${sourceTextCount} -> ${templateTextCount})`);
    }

    return {
      ok: true,
      warnings: warnings,
    };
  }

  function collectRequiredTemplateRoleFailures(sourceSection, template, plan, builderType) {
    const required = plan && plan.textGroupRoles && Array.isArray(plan.textGroupRoles.required) ? plan.textGroupRoles.required : [];
    if (required.length === 0) {
      return [];
    }
    const sourceCounts = collectTemplateTextRoleCountsForQuality(sourceSection, builderType, false);
    const templateCounts = collectTemplateTextRoleCountsForQuality(template, builderType, true);
    const sourceTextCount = numeric(sourceCounts._total);
    const out = [];
    for (let index = 0; index < required.length; index += 1) {
      const role = normalizePredictedTextRole(required[index]);
      if (!role) {
        continue;
      }
      const presentInSource = numeric(sourceCounts[role]) > 0;
      const shouldEnforce = presentInSource || (role === "headline" && sourceTextCount > 0);
      if (!shouldEnforce) {
        continue;
      }
      if (!(numeric(templateCounts[role]) > 0)) {
        out.push(`Template missed required ${role} text role`);
      }
    }
    return out;
  }

  function collectTemplateTextRoleCountsForQuality(root, builderType, preferPluginRoles) {
    const entries = collectTemplateTextRoleEntriesForQuality(root, builderType, preferPluginRoles);
    const counts = { _total: entries.length };
    for (let index = 0; index < entries.length; index += 1) {
      const role = normalizePredictedTextRole(entries[index] && entries[index].role);
      if (!role) {
        continue;
      }
      counts[role] = Math.round(numeric(counts[role]) + 1);
    }
    return counts;
  }

  function collectTemplateTextRoleEntriesForQuality(root, builderType, preferPluginRoles) {
    const textNodes = [];
    const entries = [];
    collectTextNodes(root, textNodes);
    for (let index = 0; index < textNodes.length; index += 1) {
      const node = textNodes[index];
      const text = normalizeMeaningfulText(string(node && node.characters, ""));
      if (!text) {
        continue;
      }
      entries.push({
        node: node,
        bounds: getNodeBounds(node),
        fontSize: getTemplateTextSize(node),
      });
    }
    entries.sort(compareTemplateReadingOrder);
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      const learnedRole = preferPluginRoles ? normalizePredictedTextRole(readDraftTextRole(entry.node)) : "";
      entry.role = learnedRole || classifyTemplateTextEntryRole(entry, builderType || "", index, entries.length);
    }
    return entries;
  }

  function collectTemplateVisualGuidanceFailures(template, plan, builderType) {
    const visuals = collectTemplateVisualPolicyNodes(template);
    const report = {
      failures: [],
      warnings: [],
    };
    if (visuals.length === 0) {
      return report;
    }
    const primary = visuals[0];
    const policy = primary.policy || {};
    const expectedAnchor = normalizeTemplateVisualAnchor(string(plan && plan.visualAnchor, string(plan && plan.visualRole && plan.visualRole.anchor, "")));
    const actualPlacement = deriveTemplatePrimaryVisualPlacement(template, primary.node);
    if (builderType !== "hero" && expectedAnchor && (expectedAnchor === "top" || expectedAnchor === "bottom" || expectedAnchor === "inline")) {
      if (actualPlacement && actualPlacement !== expectedAnchor) {
        report.failures.push(`Primary visual placement did not follow the guided ${expectedAnchor} anchor`);
      }
    }
    const role = normalizeVisualSemanticRole(string(policy.role, ""));
    const preserveTargets = Array.isArray(policy.preserveTargets) ? policy.preserveTargets : [];
    const cropMode = string(policy.cropMode, "");
    const cropOverflow = numeric(policy.cropOverflow);
    const cropLimit = numeric(policy.cropLimit);
    if (!policy.allowBackgroundTrim && role === "background" && cropMode !== "fit") {
      report.failures.push("Background visual exceeded the guided crop safe zone");
    }
    if ((role === "product" || role === "person" || role === "logo" || preserveTargets.indexOf(role) >= 0) && cropMode !== "fit") {
      if (cropOverflow > 0 && cropOverflow >= Math.max(0.06, cropLimit * 0.82)) {
        report.failures.push(`Primary ${role} visual exceeded the guided crop safe zone`);
      }
    }
    const expectedPrimaryRole = normalizeVisualSemanticRole(string(plan && plan.visualRole && plan.visualRole.primary, ""));
    if (expectedPrimaryRole && expectedPrimaryRole !== "supporting" && role && role !== expectedPrimaryRole) {
      report.warnings.push(`Primary visual role drifted from ${expectedPrimaryRole} to ${role}`);
    }
    return report;
  }

  function collectTemplateVisualPolicyNodes(root) {
    const out = [];
    const stack = [{ node: root, depth: 0 }];
    while (stack.length > 0) {
      const currentEntry = stack.pop();
      const current = currentEntry.node;
      if (!current) {
        continue;
      }
      const policy = readDraftVisualPolicyData(current);
      const bounds = getNodeBounds(current);
      if (policy && bounds) {
        out.push({
          node: current,
          bounds: bounds,
          depth: currentEntry.depth,
          policy: policy,
          area: numeric(bounds.width) * numeric(bounds.height),
        });
      }
      if (!Array.isArray(current.children)) {
        continue;
      }
      for (let index = current.children.length - 1; index >= 0; index -= 1) {
        stack.push({
          node: current.children[index],
          depth: currentEntry.depth + 1,
        });
      }
    }
    out.sort((a, b) => numeric(b.area) - numeric(a.area) || numeric(a.depth) - numeric(b.depth));
    return out;
  }

  function normalizeTemplateVisualAnchor(value) {
    const text = string(value, "").toLowerCase();
    if (text.indexOf("bottom") >= 0) {
      return "bottom";
    }
    if (text.indexOf("top") >= 0) {
      return "top";
    }
    if (text.indexOf("inline") >= 0 || text.indexOf("center") >= 0) {
      return "inline";
    }
    if (text.indexOf("left") >= 0) {
      return "left";
    }
    if (text.indexOf("right") >= 0) {
      return "right";
    }
    return "";
  }

  function deriveTemplatePrimaryVisualPlacement(template, visualNode) {
    const directChild = findDirectTemplateChild(template, visualNode);
    if (!template || !directChild || !Array.isArray(template.children)) {
      return "";
    }
    const visualIndex = template.children.indexOf(directChild);
    const firstTextIndex = findFirstTemplateTextChildIndex(template);
    if (firstTextIndex >= 0) {
      if (visualIndex < firstTextIndex) {
        return "top";
      }
      if (visualIndex > firstTextIndex) {
        return "bottom";
      }
      return "inline";
    }
    const templateBounds = getNodeBounds(template);
    const visualBounds = getNodeBounds(directChild);
    if (!templateBounds || !visualBounds) {
      return "";
    }
    const centerY =
      (numeric(visualBounds.y) + numeric(visualBounds.height) / 2 - numeric(templateBounds.y)) / Math.max(1, numeric(templateBounds.height));
    if (centerY <= 0.34) {
      return "top";
    }
    if (centerY >= 0.66) {
      return "bottom";
    }
    return "inline";
  }

  function findDirectTemplateChild(template, node) {
    let current = node;
    while (current && current.parent && current.parent !== template) {
      current = current.parent;
    }
    return current && current.parent === template ? current : null;
  }

  function findFirstTemplateTextChildIndex(template) {
    const children = Array.isArray(template && template.children) ? template.children : [];
    for (let index = 0; index < children.length; index += 1) {
      const textNodes = [];
      collectTextNodes(children[index], textNodes);
      if (countMeaningfulTextNodes(textNodes) > 0) {
        return index;
      }
    }
    return -1;
  }

  function countMeaningfulTextNodes(nodes) {
    const list = Array.isArray(nodes) ? nodes : [];
    let count = 0;
    for (let index = 0; index < list.length; index += 1) {
      const node = list[index];
      const text = string(node && node.characters, "").trim();
      if (text) {
        count += 1;
      }
    }
    return count;
  }

  function findMissingTemplateTexts(sourceTextNodes, templateTextNodes) {
    const source = collectNormalizedTextSignatures(sourceTextNodes);
    const template = collectNormalizedTextSignatures(templateTextNodes);
    const templateSet = {};
    const missing = [];

    for (let index = 0; index < template.length; index += 1) {
      templateSet[template[index]] = true;
    }

    for (let index = 0; index < source.length; index += 1) {
      const signature = source[index];
      if (!signature || templateSet[signature]) {
        continue;
      }
      missing.push(signature.slice(0, 80));
      if (missing.length >= 3) {
        break;
      }
    }

    return missing;
  }

  function collectNormalizedTextSignatures(nodes) {
    const list = Array.isArray(nodes) ? nodes : [];
    const out = [];
    const seen = {};
    for (let index = 0; index < list.length; index += 1) {
      const text = normalizeMeaningfulText(string(list[index] && list[index].characters, ""));
      if (!text || seen[text]) {
        continue;
      }
      seen[text] = true;
      out.push(text);
    }
    return out;
  }

  function normalizeMeaningfulText(value) {
    return string(value, "").replace(/\s+/g, " ").trim();
  }

  function collectMeaningfulTextEntries(nodes, options) {
    const config = options && typeof options === "object" ? options : {};
    const includeHidden = !!config.includeHidden;
    const list = Array.isArray(nodes) ? nodes : [];
    const raw = [];
    const ordered = [];
    const counts = {};
    for (let index = 0; index < list.length; index += 1) {
      const node = list[index];
      const text = normalizeMeaningfulText(string(node && node.characters, ""));
      if (!text) {
        continue;
      }
      if (!includeHidden && node && node.visible === false) {
        continue;
      }
      raw.push({
        node: node,
        text: text,
        bounds: getNodeBounds(node),
        visible: !!(node && node.visible !== false),
        fontSize: getTemplateTextSize(node),
        role: deriveTemplateTextRole(node),
      });
    }

    raw.sort(compareTemplateReadingOrder);
    for (let index = 0; index < raw.length; index += 1) {
      const entry = raw[index];
      counts[entry.text] = (counts[entry.text] || 0) + 1;
      entry.token = `${entry.text}#${counts[entry.text]}`;
      ordered.push(entry);
    }
    return ordered;
  }

  function collectHiddenTemplateTextFailures(templateTextNodes) {
    const list = Array.isArray(templateTextNodes) ? templateTextNodes : [];
    const out = [];
    for (let index = 0; index < list.length; index += 1) {
      const node = list[index];
      const text = normalizeMeaningfulText(string(node && node.characters, ""));
      if (!text || !node || node.visible !== false) {
        continue;
      }
      out.push(`Hidden text node in template: ${formatMeaningfulTextPreview(text)}`);
      if (out.length >= 2) {
        break;
      }
    }
    return out;
  }

  function collectTemplateClippedTextFailures(template, templateTextNodes) {
    const entries = collectMeaningfulTextEntries(templateTextNodes, { includeHidden: false });
    const out = [];
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      if (!entry || !entry.node || !isTemplateTextClipped(entry.node, template)) {
        continue;
      }
      out.push(`Clipped text in template: ${formatMeaningfulTextPreview(entry.text)}`);
      if (out.length >= 2) {
        break;
      }
    }
    return out;
  }

  function isTemplateTextClipped(node, root) {
    const textBounds = getNodeBounds(node);
    if (!node || !textBounds) {
      return false;
    }
    let current = node.parent;
    let depth = 0;
    while (current && depth < 10) {
      if ("clipsContent" in current && current.clipsContent) {
        const currentBounds = getNodeBounds(current);
        if (currentBounds && !boundsContain(currentBounds, textBounds, 2)) {
          return true;
        }
      }
      if (current === root) {
        break;
      }
      current = current.parent;
      depth += 1;
    }
    return false;
  }

  function collectTemplateReadingOrderFailures(sourceTextNodes, templateTextNodes) {
    const sourceEntries = collectMeaningfulTextEntries(sourceTextNodes, { includeHidden: false });
    const templateEntries = collectMeaningfulTextEntries(templateTextNodes, { includeHidden: false });
    const templateIndexByToken = {};
    const out = [];
    let previousIndex = -1;

    for (let index = 0; index < templateEntries.length; index += 1) {
      const token = string(templateEntries[index] && templateEntries[index].token, "");
      if (!token || typeof templateIndexByToken[token] === "number") {
        continue;
      }
      templateIndexByToken[token] = index;
    }

    for (let index = 0; index < sourceEntries.length; index += 1) {
      const sourceEntry = sourceEntries[index];
      const token = string(sourceEntry && sourceEntry.token, "");
      if (!token || typeof templateIndexByToken[token] !== "number") {
        continue;
      }
      const currentIndex = templateIndexByToken[token];
      if (currentIndex < previousIndex) {
        out.push(`Reading order changed around ${formatMeaningfulTextPreview(sourceEntry.text)}`);
        break;
      }
      previousIndex = currentIndex;
    }
    return out;
  }

  function collectTemplateTextCompressionFailures(sourceTextNodes, templateTextNodes, minFontSizes) {
    const sourceEntries = collectMeaningfulTextEntries(sourceTextNodes, { includeHidden: false });
    const templateEntries = collectMeaningfulTextEntries(templateTextNodes, { includeHidden: false });
    const templateEntryByToken = {};
    const out = [];

    for (let index = 0; index < templateEntries.length; index += 1) {
      const token = string(templateEntries[index] && templateEntries[index].token, "");
      if (token) {
        templateEntryByToken[token] = templateEntries[index];
      }
    }

    for (let index = 0; index < sourceEntries.length; index += 1) {
      const sourceEntry = sourceEntries[index];
      const token = string(sourceEntry && sourceEntry.token, "");
      const templateEntry = token ? templateEntryByToken[token] : null;
      if (!templateEntry) {
        continue;
      }

      const sourceSize = numeric(sourceEntry.fontSize);
      const templateSize = numeric(templateEntry.fontSize);
      if (!(sourceSize > 0) || !(templateSize > 0)) {
        continue;
      }

      const role = string(sourceEntry.role, "") || string(templateEntry.role, "") || "body";
      const minimum = numeric(minFontSizes && minFontSizes[role]) || numeric(minFontSizes && minFontSizes.body) || 12;
      const compressionFloor = Math.max(minimum, Math.round(sourceSize * getTextCompressionFloorRatio(role) * 10) / 10);
      if (templateSize + 0.5 >= compressionFloor) {
        continue;
      }

      out.push(
        `${role} text compressed too far: ${formatMeaningfulTextPreview(sourceEntry.text)} (${Math.round(sourceSize)}px -> ${Math.round(
          templateSize
        )}px)`
      );
      if (out.length >= 2) {
        break;
      }
    }

    return out;
  }

  function getTextCompressionFloorRatio(role) {
    const normalized = string(role, "body");
    if (normalized === "headline") {
      return 0.22;
    }
    if (normalized === "subtitle") {
      return 0.28;
    }
    if (normalized === "meta") {
      return 0.46;
    }
    return 0.34;
  }

  function formatMeaningfulTextPreview(value) {
    const text = normalizeMeaningfulText(value);
    if (!text) {
      return '"text"';
    }
    const preview = text.length > 40 ? `${text.slice(0, 40)}...` : text;
    return `"${preview}"`;
  }

  function getTemplateMinFontSizes(plan) {
    const guidance = plan && plan.textLayoutGuidance && typeof plan.textLayoutGuidance === "object" ? plan.textLayoutGuidance : null;
    const minFont = guidance && guidance.minFontSize && typeof guidance.minFontSize === "object" ? guidance.minFontSize : {};
    return {
      headline: numeric(minFont.headline) || 24,
      subtitle: numeric(minFont.subtitle) || 18,
      body: numeric(minFont.body) || 14,
      meta: numeric(minFont.meta) || 12,
    };
  }

  function collectTemplateMinFontFailures(textNodes, minFontSizes) {
    const out = [];
    const list = Array.isArray(textNodes) ? textNodes : [];
    for (let index = 0; index < list.length; index += 1) {
      const node = list[index];
      const role = deriveTemplateTextRole(node);
      const current = getTemplateTextSize(node);
      const minimum = numeric(minFontSizes[role]) || numeric(minFontSizes.body);
      /*
      if (!current || current >= minimum) {
        continue;
      }
      out.push(`${role} ????????釉먮폁??????????? ??????椰???????????????${minimum}px??????????⑤벡?????????????????????????살몝??`);
      if (out.length >= 2) {
        break;
      }
      */
      if (!current || current >= minimum) {
        continue;
      }
      out.push(`${role} text dropped below the learned minimum size of ${minimum}px`);
      if (out.length >= 2) {
        break;
      }
    }
    return out;
  }

  function deriveTemplateTextRole(node) {
    const name = safeName(node).toLowerCase();
    if (name.indexOf("headline") >= 0) {
      return "headline";
    }
    if (name.indexOf("subtitle") >= 0) {
      return "subtitle";
    }
    if (name.indexOf("meta") >= 0 || name.indexOf("eyebrow") >= 0) {
      return "meta";
    }
    return "body";
  }

  function doesTemplateRespectTextFirstFlow(template, plan) {
    if (!template || !Array.isArray(template.children) || template.children.length === 0) {
      return true;
    }
    if (string(plan && plan.builderType, "") === "hero") {
      return true;
    }
    const firstChild = template.children[0];
    const firstName = safeName(firstChild).toLowerCase();
    return firstName.indexOf("media") < 0;
  }

  function addQualityWarning(state, text) {
    if (!state || !Array.isArray(state.qualityWarnings)) {
      return;
    }
    const value = sanitizeUserFacingText(text, "");
    if (!value || state.qualityWarnings.indexOf(value) >= 0) {
      return;
    }
    state.qualityWarnings.push(value);
  }

  function addDecisionNote(state, text) {
    if (!state || !Array.isArray(state.decisionNotes)) {
      return;
    }
    const value = sanitizeUserFacingText(text, "");
    if (!value || state.decisionNotes.indexOf(value) >= 0) {
      return;
    }
    state.decisionNotes.push(value);
  }

  function classifyAssemblyEvidenceMode(learnedSectionCount, fallbackSectionCount, hybridSectionCount) {
    const learned = Math.max(0, Math.round(numeric(learnedSectionCount)));
    const fallback = Math.max(0, Math.round(numeric(fallbackSectionCount)));
    const hybrid = Math.max(0, Math.round(numeric(hybridSectionCount)));
    if (learned > 0 && fallback === 0 && hybrid === 0) {
      return "learning-based";
    }
    if (learned > 0 && (fallback > 0 || hybrid > 0)) {
      return "mixed";
    }
    return "fallback-heavy";
  }

  function deriveSectionPlanConfidence(builderType, memoryExample, containerProfile, aiPlan) {
    const memoryConfidence = clamp(numeric(memoryExample && memoryExample.confidence), 0, 1);
    const containerReliability = clamp(numeric(containerProfile && containerProfile._reliabilityScore), 0, 1);
    const builderScore = ["hero", "promo", "article"].indexOf(string(builderType, "")) >= 0 ? 0.14 : 0;
    const aiScore = aiPlan ? 0.08 : 0;
    const score = round(builderScore + memoryConfidence * 0.44 + containerReliability * 0.34 + aiScore);
    const level = score >= 0.74 ? "high" : score >= 0.5 ? "medium" : "low";
    const mode = level === "high" ? "learned" : level === "medium" ? "hybrid" : "fallback";
    const reasons = [];
    if (memoryConfidence >= 0.7) {
      reasons.push("section example support");
    } else if (memoryExample) {
      reasons.push("weak section example support");
    }
    if (containerReliability >= 0.68) {
      reasons.push("container profile support");
    } else if (containerProfile) {
      reasons.push("weak container profile support");
    }
    if (aiPlan) {
      reasons.push("AI plan overlay");
    }

    return {
      level: level,
      score: score,
      mode: mode,
      preferFallback: level === "low",
      reasons: reasons,
      label: `${level} (${mode})`,
    };
  }

  function findMatchingContainerProfile(sourceSection, sectionType, state) {
    const profiles = state && Array.isArray(state.containerProfiles) ? state.containerProfiles : [];
    const bounds = getNodeBounds(sourceSection);
    const layoutMode = normalizeContainerProfileLayoutMode(sourceSection && sourceSection.layoutMode);
    const widthBucket = bucketContainerProfileWidth(bounds ? numeric(bounds.width) : numeric(sourceSection && sourceSection.width));
    const childCount = Array.isArray(sourceSection && sourceSection.children) ? sourceSection.children.length : 0;
    const childBucket = bucketContainerProfileChildCount(childCount);
    const targetWidthBucket = bucketContainerProfileWidth(resolveExpectedTargetContainerWidth(sourceSection, state, bounds));
    let best = null;
    let bestScore = 0;

    for (let index = 0; index < profiles.length; index += 1) {
      const profile = profiles[index];
      const score = scoreContainerProfileMatch(profile, sectionType, layoutMode, widthBucket, childBucket, targetWidthBucket);
      if (score > bestScore) {
        best = profile;
        bestScore = score;
      }
    }

    if (!best || bestScore < 0.52) {
      return null;
    }
    const reliability = evaluateLearnedProfileReliability(best, bestScore, "container");
    if (reliability.level === "low") {
      return null;
    }
    const matched = Object.assign({}, best);
    matched._matchScore = bestScore;
    matched._reliabilityLevel = reliability.level;
    matched._reliabilityScore = reliability.score;
    matched._sampleCount = reliability.sampleCount;
    matched._targetWidthBucket = targetWidthBucket;
    return matched;
  }

  function scoreContainerProfileMatch(profile, sectionType, layoutMode, widthBucket, childBucket, targetWidthBucket) {
    const profileSection = normalizePredictedSectionType(string(profile && profile.sectionType, ""));
    const profileLayout = normalizeContainerProfileLayoutMode(profile && profile.sourceLayoutMode);
    const profileWidthBucket = string(profile && profile.sourceWidthBucket, "");
    const profileChildBucket = string(profile && profile.childCountBucket, "");
    const profileTargetWidthBucket = string(profile && profile.targetWidthBucket, "");
    const sampleCount = numeric(profile && profile.sampleCount);
    const confidence = numeric(profile && profile.confidence);
    const sectionScore = sectionType ? getSectionTypeCompatibility(sectionType, profileSection) : 0.62;
    const layoutScore =
      layoutMode && profileLayout
        ? layoutMode === profileLayout
          ? 1
          : layoutMode === "none" || profileLayout === "none"
          ? 0.74
          : 0.45
        : 0.68;
    const widthScore = compareBucketDistance(widthBucket, profileWidthBucket, getContainerProfileWidthBucketOrder());
    const childScore = compareBucketDistance(childBucket, profileChildBucket, getContainerProfileChildBucketOrder());
    const targetWidthScore = compareBucketDistance(targetWidthBucket, profileTargetWidthBucket, getContainerProfileWidthBucketOrder());
    const supportScore = clamp(Math.min(1, sampleCount / 6) * 0.58 + confidence * 0.42, 0, 1);
    return round(
      sectionScore * 0.32 +
        layoutScore * 0.2 +
        widthScore * 0.16 +
        childScore * 0.12 +
        targetWidthScore * 0.12 +
        supportScore * 0.08
    );
  }

  function resolveExpectedTargetContainerWidth(sourceSection, state, bounds) {
    const sourceBounds = bounds || getNodeBounds(sourceSection);
    const sourceWidth = sourceBounds ? numeric(sourceBounds.width) : numeric(sourceSection && sourceSection.width);
    const sourceRootWidth = Math.max(1, numeric(state && state.sourceWidth));
    const targetRootWidth = resolveTargetContainerRootWidth(state);
    if (!(targetRootWidth > 0)) {
      return sourceWidth;
    }

    const widthRatio = sourceWidth > 0 ? clamp(sourceWidth / sourceRootWidth, 0.18, 1) : 0;
    if (!(widthRatio > 0)) {
      return targetRootWidth;
    }

    return Math.max(120, Math.round(targetRootWidth * widthRatio));
  }

  function resolveTargetContainerRootWidth(state) {
    const desktopTargetWidth = numeric(state && state.targetContentWidth);
    if (desktopTargetWidth > 0) {
      return desktopTargetWidth;
    }
    const mobileTargetWidth = numeric(state && state.targetWidth);
    if (!(mobileTargetWidth > 0)) {
      return 0;
    }
    return Math.max(220, Math.round(mobileTargetWidth - 32));
  }

  function normalizeContainerProfileLayoutMode(mode) {
    const value = String(mode || "NONE").toLowerCase();
    if (value === "horizontal" || value === "vertical" || value === "none") {
      return value;
    }
    return "none";
  }

  function bucketContainerProfileWidth(width) {
    const value = Math.max(0, numeric(width));
    if (value < 160) {
      return "0-159";
    }
    if (value < 280) {
      return "160-279";
    }
    if (value < 400) {
      return "280-399";
    }
    if (value < 560) {
      return "400-559";
    }
    if (value < 800) {
      return "560-799";
    }
    if (value < 1120) {
      return "800-1119";
    }
    return "1120+";
  }

  function bucketContainerProfileChildCount(count) {
    const value = Math.max(0, Math.round(numeric(count)));
    if (value <= 1) {
      return "1";
    }
    if (value <= 3) {
      return "2-3";
    }
    if (value <= 6) {
      return "4-6";
    }
    return "7+";
  }

  function getContainerProfileWidthBucketOrder() {
    return ["0-159", "160-279", "280-399", "400-559", "560-799", "800-1119", "1120+"];
  }

  function getContainerProfileChildBucketOrder() {
    return ["1", "2-3", "4-6", "7+"];
  }

  function resolveProfileRangeP50(profile, key) {
    const group = profile && profile[key] && typeof profile[key] === "object" ? profile[key] : null;
    if (!group) {
      return 0;
    }
    return numeric(typeof group.p50 !== "undefined" ? group.p50 : group.median);
  }

  function resolveContainerProfilePadding(containerProfile, fallbackPadding) {
    const targetPaddingX = resolveProfileRangeP50(containerProfile, "targetPaddingX");
    const targetPaddingY = resolveProfileRangeP50(containerProfile, "targetPaddingY");
    const perSideX = targetPaddingX > 0 ? targetPaddingX / 2 : 0;
    const perSideY = targetPaddingY > 0 ? targetPaddingY / 2 : 0;
    const values = [perSideX, perSideY].filter((value) => value > 0);
    if (values.length === 0) {
      return fallbackPadding;
    }
    let total = 0;
    for (let index = 0; index < values.length; index += 1) {
      total += values[index];
    }
    return Math.round(total / values.length);
  }

  function deriveLearnedMediaRatioFromContainerProfile(builderType, containerProfile, fallbackRatio) {
    const learnedAspect = resolveProfileMedian(containerProfile, "targetAspectRatio");
    if (!(learnedAspect > 0)) {
      return fallbackRatio;
    }
    if (builderType === "hero") {
      return clamp(learnedAspect * 0.84, 0.96, 1.62);
    }
    if (builderType === "promo") {
      return clamp(learnedAspect * 0.46, 0.38, 0.88);
    }
    return clamp(learnedAspect * 0.58, 0.46, 0.96);
  }

  function resolveSectionBudgetMediaHeight(contentWidth, plan, fallbackRatio, minHeight, maxHeight) {
    const fallbackHeight = Math.max(minHeight, Math.min(maxHeight, Math.round(contentWidth * fallbackRatio)));
    const budget = plan && plan.heightBudget && typeof plan.heightBudget === "object" ? plan.heightBudget : null;
    const budgetHeight = numeric(budget && budget.mediaHeight);
    const sectionMaxHeight = numeric(budget && budget.maxHeight);
    if (!(budgetHeight > 0)) {
      return fallbackHeight;
    }
    const lower = Math.max(minHeight, Math.round(minHeight * 0.96));
    const upper = Math.max(lower, sectionMaxHeight > 0 ? Math.min(maxHeight, Math.round(sectionMaxHeight * 0.84)) : maxHeight);
    return Math.round(clamp(fallbackHeight * 0.34 + budgetHeight * 0.66, lower, upper));
  }

  function resolveSectionTemplatePlan(sourceSection, sectionType, state, sourceSectionIndex) {
    const aiPlan = findMatchingAiSectionPlan(sourceSection, sectionType, state, sourceSectionIndex);
    if (usesAiCompositionOnly(state)) {
      return resolveAiOnlySectionTemplatePlan(sourceSection, sectionType, state, aiPlan);
    }
    const memoryExample = findMatchingSectionExample(sourceSection, sectionType, state);
    const containerProfile = findMatchingContainerProfile(sourceSection, sectionType, state);
    const memoryPattern = memoryExample ? string(memoryExample.mobilePattern, "") : "";
    const heroGuidance = memoryExample && memoryExample.heroGuidance && typeof memoryExample.heroGuidance === "object" ? memoryExample.heroGuidance : null;
    const sectionGuidance = memoryExample && memoryExample.sectionGuidance && typeof memoryExample.sectionGuidance === "object" ? memoryExample.sectionGuidance : null;
    let builderType = sectionType;

    if (aiPlan && aiPlan.builderType && aiPlan.builderType !== "keep") {
      builderType = aiPlan.builderType;
    } else if (containsAny(memoryPattern, ["hero"])) {
      builderType = "hero";
    } else if (containsAny(memoryPattern, ["promo", "card"])) {
      builderType = "promo";
    } else if (containsAny(memoryPattern, ["article", "editorial", "stack"])) {
      builderType = "article";
    } else if (sectionType === "editorial") {
      builderType = "article";
    }

    if (["hero", "promo", "article"].indexOf(builderType) < 0) {
      return null;
    }

    const metrics = deriveTemplateMetricsFromMemory(builderType, memoryPattern, state, aiPlan, containerProfile);
    const transformPriority = deriveSectionTransformPriority(sectionGuidance);
    const cropPriority = deriveHeroCropPriority(aiPlan, heroGuidance);
    const focalTargets = deriveHeroFocalTargets(aiPlan, heroGuidance);
    const headlinePreserve = deriveHeroHeadlinePreserve(heroGuidance);
    const copyIntegrity = deriveHeroCopyIntegrity(heroGuidance);
    const copyBlockPreferred = deriveHeroCopyBlockPreferred(heroGuidance);
    const overlayPosition = deriveHeroOverlayPosition(heroGuidance, sectionGuidance);
    const compositionPreset = deriveHeroCompositionPreset(heroGuidance, sectionGuidance);
    const textAlignment = deriveHeroTextAlignment(aiPlan, heroGuidance, sectionGuidance);
    const visualAnchor = deriveHeroVisualAnchor(heroGuidance, sectionGuidance);
    const contentPriority = deriveSectionContentPriority(builderType, heroGuidance, sectionGuidance, memoryPattern);
    const reflowPattern = deriveSectionReflowPattern(builderType, sectionGuidance, memoryPattern);
    const textGroupRoles = deriveSectionTextGroupRoles(builderType, sectionGuidance, aiPlan);
    const textPreservation = deriveSectionTextPreservation(builderType, sectionGuidance, heroGuidance);
    const textLayoutGuidance = deriveSectionTextLayoutGuidance(builderType, sectionGuidance, aiPlan);
    const visualRole = deriveSectionVisualRole(builderType, sectionGuidance);
    const mobileAspectPreference = deriveSectionMobileAspectPreference(builderType, sectionGuidance);
    const cropSafeZone = deriveSectionCropSafeZone(builderType, sectionGuidance, heroGuidance);
    const dropRules = deriveSectionDropRules(builderType, sectionGuidance);
    const heightBudget = deriveSectionHeightBudget(sourceSection, builderType, state, {
      containerProfile: containerProfile,
      contentPriority: contentPriority,
      transformPriority: transformPriority,
      textPreservation: textPreservation,
      mobileAspectPreference: mobileAspectPreference,
      visualRole: visualRole,
    });
    const imagePolicy = deriveSectionImagePolicy(builderType, {
      contentPriority: contentPriority,
      transformPriority: transformPriority,
      visualRole: visualRole,
      cropSafeZone: cropSafeZone,
      focalTargets: focalTargets,
      dropRules: dropRules,
      heightBudget: heightBudget,
      cropPriority: cropPriority,
      visualAnchor: visualAnchor,
    });
    const confidenceReport = deriveSectionPlanConfidence(builderType, memoryExample, containerProfile, aiPlan);

    return {
      sourceType: sectionType,
      builderType: builderType,
      aiPlan: aiPlan,
      memoryExample: memoryExample,
      containerProfile: containerProfile,
      transformPriority: transformPriority,
      mobilePattern: memoryPattern || metrics.defaultPattern,
      gap: metrics.gap,
      padding: metrics.padding,
      mediaRatio: metrics.mediaRatio,
      visualFirst: metrics.visualFirst,
      compactText: metrics.compactText,
      cropPriority: cropPriority,
      focalTargets: focalTargets,
      headlinePreserve: headlinePreserve,
      copyIntegrity: copyIntegrity,
      copyBlockPreferred: copyBlockPreferred,
      overlayPosition: overlayPosition,
      compositionPreset: compositionPreset,
      textAlignment: textAlignment,
      visualAnchor: visualAnchor,
      contentPriority: contentPriority,
      reflowPattern: reflowPattern,
      textGroupRoles: textGroupRoles,
      textPreservation: textPreservation,
      textLayoutGuidance: textLayoutGuidance,
      visualRole: visualRole,
      mobileAspectPreference: mobileAspectPreference,
      cropSafeZone: cropSafeZone,
      dropRules: dropRules,
      heightBudget: heightBudget,
      imagePolicy: imagePolicy,
      confidenceReport: confidenceReport,
    };
  }

  function resolveAiOnlySectionTemplatePlan(sourceSection, sectionType, state, aiPlan) {
    if (!aiPlan || !aiPlan.builderType || aiPlan.builderType === "keep") {
      return null;
    }

    const builderType = aiPlan.builderType;
    if (["hero", "promo", "article"].indexOf(builderType) < 0) {
      return null;
    }

    const metrics = deriveTemplateMetricsFromAiOnly(builderType, aiPlan);
    const textLayoutGuidance = deriveSectionTextLayoutGuidance(builderType, null, aiPlan);
    const textAlignment = string(textLayoutGuidance && textLayoutGuidance.alignment, builderType === "article" ? "left" : "center");
    const focalTargets = normalizeAiFocalTargets(aiPlan.focalTargets);
    const cropPriority =
      builderType === "hero"
        ? normalizeAiCropPriority(aiPlan.cropPriority || "headline-first")
        : normalizeAiCropPriority(aiPlan.cropPriority || "balanced");
    const textGroupRoles = deriveSectionTextGroupRoles(builderType, null, aiPlan);
    const transformPriority = ["text-content", "text-scale", "text-align", "image-size", "image-align"];
    const copyMode = normalizeAiTextCopyMode(aiPlan && aiPlan.textPlan && aiPlan.textPlan.copyMode) || (builderType === "hero" ? "grouped-copy" : "stacked");
    const textPreservation = {
      allTextMustSurvive: false,
      preserveReadingOrder: true,
      preserveHeadlineVerbatim: builderType === "hero",
      copyBlockPreferred: builderType === "hero" && copyMode === "grouped-copy",
    };
    const contentPriority = deriveAiOnlySectionContentPriority(builderType, aiPlan, metrics);
    const reflowPattern = deriveAiOnlySectionReflowPattern(builderType, aiPlan);
    const visualRole = deriveAiOnlySectionVisualRole(builderType, focalTargets, aiPlan);
    const mobileAspectPreference = deriveSectionMobileAspectPreference(builderType, null);
    const cropSafeZone = deriveAiOnlyCropSafeZone(builderType, textAlignment, focalTargets, aiPlan);
    const dropRules = deriveAiOnlySectionDropRules(builderType, aiPlan);
    const overlayPosition = deriveAiOnlyHeroOverlayPosition(textAlignment, aiPlan);
    const compositionPreset =
      builderType === "hero" ? (string(aiPlan && aiPlan.layoutVariant, "") === "rebuilt-stack" ? "stacked-copy-top" : "overlay-copy-bottom-visual") : "";
    const visualAnchor =
      builderType === "hero" ? (string(aiPlan && aiPlan.layoutVariant, "") === "rebuilt-stack" ? "inline" : "bottom") : "inline";
    const heightBudget = deriveSectionHeightBudget(sourceSection, builderType, state, {
      containerProfile: null,
      contentPriority: contentPriority,
      transformPriority: transformPriority,
      textPreservation: textPreservation,
      mobileAspectPreference: mobileAspectPreference,
      visualRole: visualRole,
    });
    const imagePolicy = deriveSectionImagePolicy(builderType, {
      contentPriority: contentPriority,
      transformPriority: transformPriority,
      visualRole: visualRole,
      cropSafeZone: cropSafeZone,
      focalTargets: focalTargets,
      dropRules: dropRules,
      heightBudget: heightBudget,
      cropPriority: cropPriority,
      visualAnchor: visualAnchor,
    });
    const confidenceReport = {
      level: "high",
      score: 1,
      mode: "ai-only",
      preferFallback: false,
      reasons: ["ai-only composition"],
      label: "ai-only",
    };

    return {
      sourceType: sectionType,
      builderType: builderType,
      aiPlan: aiPlan,
      aiOnlyComposition: true,
      layoutVariant: string(aiPlan && aiPlan.layoutVariant, ""),
      memoryExample: null,
      containerProfile: null,
      transformPriority: transformPriority,
      mobilePattern: metrics.defaultPattern,
      gap: metrics.gap,
      padding: metrics.padding,
      mediaRatio: metrics.mediaRatio,
      visualFirst: metrics.visualFirst,
      compactText: metrics.compactText,
      cropPriority: cropPriority,
      focalTargets: focalTargets.length > 0 ? focalTargets : builderType === "hero" ? ["headline", "product"] : ["product"],
      headlinePreserve: builderType === "hero",
      copyIntegrity: builderType === "hero" ? "required" : "balanced",
      copyBlockPreferred: textPreservation.copyBlockPreferred,
      overlayPosition: overlayPosition,
      compositionPreset: compositionPreset,
      textAlignment: textAlignment,
      visualAnchor: visualAnchor,
      contentPriority: contentPriority,
      reflowPattern: reflowPattern,
      textGroupRoles: textGroupRoles,
      textPreservation: textPreservation,
      textLayoutGuidance: textLayoutGuidance,
      visualRole: visualRole,
      mobileAspectPreference: mobileAspectPreference,
      cropSafeZone: cropSafeZone,
      dropRules: dropRules,
      heightBudget: heightBudget,
      imagePolicy: imagePolicy,
      confidenceReport: confidenceReport,
    };
  }

  function deriveTemplateMetricsFromAiOnly(builderType, aiPlan) {
    const compactText = !!(aiPlan && aiPlan.compactText);
    const visualPriority = string(aiPlan && aiPlan.visualPriority, "");
    const layoutVariant = string(aiPlan && aiPlan.layoutVariant, "");
    if (builderType === "hero") {
      return {
        defaultPattern: layoutVariant === "rebuilt-stack" ? "ai-only-hero-stack" : "ai-only-hero-editorial-overlay",
        gap: layoutVariant === "rebuilt-stack" ? (compactText ? 10 : 14) : compactText ? 8 : 12,
        padding: 0,
        mediaRatio: layoutVariant === "rebuilt-stack" ? 0.92 : 1.22,
        visualFirst: layoutVariant === "rebuilt-stack" ? false : true,
        compactText: compactText,
        collapseToSingleColumn: true,
      };
    }
    if (builderType === "promo") {
      return {
        defaultPattern: layoutVariant === "benefit-card-list" ? "ai-only-promo-benefit-card-list" : "ai-only-promo-card",
        gap: layoutVariant === "benefit-card-list" ? (compactText ? 14 : 20) : compactText ? 12 : 16,
        padding: layoutVariant === "benefit-card-list" ? 20 : 16,
        mediaRatio: layoutVariant === "benefit-card-list" ? 0.82 : 0.56,
        visualFirst: layoutVariant === "benefit-card-list" ? false : visualPriority === "first",
        compactText: compactText,
        collapseToSingleColumn: true,
      };
    }
    return {
      defaultPattern: "ai-only-article-stack",
      gap: compactText ? 10 : 14,
      padding: 0,
      mediaRatio: 0.68,
      visualFirst: visualPriority === "first",
      compactText: compactText,
      collapseToSingleColumn: true,
    };
  }

  function deriveAiOnlySectionContentPriority(builderType, aiPlan, metrics) {
    const visualPriority = string(aiPlan && aiPlan.visualPriority, "");
    const layoutVariant = string(aiPlan && aiPlan.layoutVariant, "");
    if (builderType === "hero") {
      return layoutVariant === "rebuilt-stack" ? "balanced" : "text-first";
    }
    if (builderType === "promo") {
      if (layoutVariant === "benefit-card-list") {
        return "text-first";
      }
      return visualPriority === "first" && !(metrics && metrics.visualFirst === false) ? "balanced" : "text-first";
    }
    return visualPriority === "first" ? "balanced" : "text-first";
  }

  function deriveAiOnlySectionReflowPattern(builderType, aiPlan) {
    const layoutVariant = string(aiPlan && aiPlan.layoutVariant, "");
    if (builderType === "hero") {
      return layoutVariant === "rebuilt-stack" ? "title-body-media" : "overlay-copy-bottom-visual";
    }
    if (builderType === "promo") {
      return layoutVariant === "benefit-card-list" ? "meta-title-body-product" : "horizontal-to-vertical";
    }
    return "title-body-media";
  }

  function deriveAiOnlySectionVisualRole(builderType, focalTargets, aiPlan) {
    const targets = Array.isArray(focalTargets) ? focalTargets : [];
    const visualFocus = aiPlan && aiPlan.visualFocus && typeof aiPlan.visualFocus === "object" ? aiPlan.visualFocus : null;
    const backgroundTreatment = aiPlan && aiPlan.backgroundTreatment && typeof aiPlan.backgroundTreatment === "object" ? aiPlan.backgroundTreatment : null;
    if (builderType === "hero") {
      return {
        primary: backgroundTreatment && backgroundTreatment.dim ? "background" : visualFocus && visualFocus.background ? "background" : "background",
        focal: targets.indexOf("person") >= 0 ? "person" : targets.indexOf("product") >= 0 ? "product" : "product",
        anchor: "bottom",
      };
    }
    if (builderType === "promo") {
      return {
        primary: "supporting",
        focal: "product",
        anchor: "inline",
      };
    }
    return {
      primary: "supporting",
      focal: "supporting",
      anchor: "inline",
    };
  }

  function deriveAiOnlyCropSafeZone(builderType, textAlignment, focalTargets, aiPlan) {
    const layoutVariant = string(aiPlan && aiPlan.layoutVariant, "");
    return {
      horizontalBias: layoutVariant === "rebuilt-stack" ? "center" : textAlignment === "left" ? "left" : "center",
      verticalBias: builderType === "hero" ? (layoutVariant === "rebuilt-stack" ? "center" : "top") : "center",
      preserveTargets: Array.isArray(focalTargets) && focalTargets.length > 0 ? focalTargets.slice(0, 3) : builderType === "hero" ? ["headline", "product"] : ["product"],
      allowBackgroundTrim: builderType === "hero",
    };
  }

  function deriveAiOnlySectionDropRules(builderType, aiPlan) {
    const layoutVariant = string(aiPlan && aiPlan.layoutVariant, "");
    return {
      hideDecorative: true,
      hideDesktopOnlyElements: true,
      hideRedundantMeta: builderType === "promo",
      prioritizeTextOverVisual: true,
      collapseHorizontalLayout: builderType === "promo" || builderType === "article" || layoutVariant === "rebuilt-stack",
      preserveAllText: false,
    };
  }

  function deriveAiOnlyHeroOverlayPosition(textAlignment, aiPlan) {
    const explicit = normalizeAiTextAlignment(aiPlan && aiPlan.textPlan && aiPlan.textPlan.alignment);
    const align = explicit || string(textAlignment, "center").toLowerCase();
    return align === "left" ? "top-left" : "top-center";
  }

  function deriveSectionHeightBudget(sourceSection, builderType, state, options) {
    const config = options && typeof options === "object" ? options : {};
    const rootGuidance = state && state.rootFrameGuidance && typeof state.rootFrameGuidance === "object" ? state.rootFrameGuidance : {};
    const sourceBounds = getNodeBounds(sourceSection);
    const targetRootHeight =
      numeric(rootGuidance.suggestedHeight) || Math.max(520, Math.round(Math.max(1, numeric(state && state.targetWidth)) * 1.24));
    const sourceHeight = Math.max(1, numeric(state && state.sourceHeight));
    const sourceHeightShare = sourceBounds ? clamp(numeric(sourceBounds.height) / sourceHeight, 0.08, 0.72) : 0;
    const sectionCount = Math.max(1, Math.round(numeric(state && state.sourceSectionCount) || 1));
    const targetShape = normalizeFrameShapeLabel(string(rootGuidance.targetShape, "")) || "balanced";
    const preferTall = targetShape === "tall" || !!rootGuidance.preferTallReflow;
    const contentPriority = string(config.contentPriority, "balanced");
    const textPreservation = config.textPreservation && typeof config.textPreservation === "object" ? config.textPreservation : null;
    const mobileAspectPreference = config.mobileAspectPreference && typeof config.mobileAspectPreference === "object" ? config.mobileAspectPreference : null;
    const containerProfile = config.containerProfile && typeof config.containerProfile === "object" ? config.containerProfile : null;
    const textMetrics = summarizeSectionTextDemand(sourceSection);
    const textFirst = contentPriority === "text-first";
    const protectAllText = !!(textPreservation && textPreservation.allTextMustSurvive);

    let baseShare = builderType === "hero" ? 0.3 : builderType === "promo" ? 0.22 : 0.25;
    if (preferTall) {
      baseShare += builderType === "hero" ? 0.08 : builderType === "article" ? 0.06 : 0.03;
    }
    if (textFirst) {
      baseShare += builderType === "promo" ? 0.02 : 0.03;
    }
    if (protectAllText) {
      baseShare += builderType === "hero" ? 0.03 : 0.02;
    }

    let preferredShare = sourceHeightShare > 0 ? sourceHeightShare * 0.62 + baseShare * 0.38 : baseShare;
    if (textMetrics.textNodeCount >= 4) {
      preferredShare += builderType === "article" ? 0.05 : 0.03;
    }
    if (textMetrics.charCount >= 280) {
      preferredShare += builderType === "article" ? 0.08 : 0.04;
    }
    if (textMetrics.charCount >= 520) {
      preferredShare += builderType === "article" ? 0.04 : 0.02;
    }
    if (sectionCount >= 5) {
      preferredShare -= 0.015;
    }
    if (sectionCount >= 7) {
      preferredShare -= 0.025;
    }

    const minShare = builderType === "hero" ? 0.24 : builderType === "promo" ? 0.16 : 0.18;
    const maxShare = builderType === "hero" ? 0.56 : builderType === "promo" ? 0.34 : 0.44;
    preferredShare = clamp(preferredShare, minShare, maxShare);

    const minHeight = builderType === "hero" ? 320 : builderType === "promo" ? 220 : 240;
    const maxHeight = Math.round(
      clamp(
        builderType === "hero" ? targetRootHeight * 0.72 : builderType === "promo" ? targetRootHeight * 0.42 : targetRootHeight * 0.5,
        builderType === "hero" ? 520 : 320,
        builderType === "hero" ? 860 : builderType === "promo" ? 520 : 620
      )
    );
    let preferredHeight = Math.round(clamp(targetRootHeight * preferredShare, minHeight, maxHeight));

    const learnedContainerAspect = resolveProfileMedian(containerProfile, "targetAspectRatio");
    const preferredAspect = numeric(mobileAspectPreference && mobileAspectPreference.preferredRatio);
    let mediaShare = builderType === "hero" ? 0.62 : builderType === "promo" ? 0.42 : 0.36;
    if (textFirst) {
      mediaShare -= builderType === "hero" ? 0.08 : builderType === "promo" ? 0.1 : 0.08;
    }
    if (protectAllText) {
      mediaShare -= 0.04;
    }
    if (builderType === "article" && textMetrics.charCount >= 280) {
      mediaShare -= 0.08;
    }
    if (builderType === "promo" && textMetrics.textNodeCount >= 4) {
      mediaShare -= 0.04;
    }
    if (builderType === "hero" && preferredAspect >= 1.42) {
      preferredHeight = Math.max(preferredHeight, Math.round(numeric(state && state.targetWidth) * Math.min(1.82, preferredAspect)));
    }
    if (learnedContainerAspect > 1.28 && builderType === "hero") {
      preferredHeight = Math.max(preferredHeight, Math.round(numeric(state && state.targetWidth) * Math.min(1.76, learnedContainerAspect)));
    }

    mediaShare = clamp(mediaShare, builderType === "hero" ? 0.38 : 0.2, builderType === "hero" ? 0.78 : builderType === "promo" ? 0.56 : 0.48);
    const mediaHeight = Math.round(
      clamp(
        preferredHeight * mediaShare,
        builderType === "hero" ? 220 : 140,
        builderType === "hero" ? 640 : builderType === "promo" ? 320 : 280
      )
    );
    const textHeight = Math.max(96, preferredHeight - mediaHeight);

    return {
      preferredHeight: preferredHeight,
      minHeight: minHeight,
      maxHeight: maxHeight,
      mediaHeight: mediaHeight,
      textHeight: textHeight,
      preferredShare: round(preferredShare),
      sourceHeightShare: round(sourceHeightShare),
      mediaShare: round(mediaShare),
      textShare: round(1 - mediaShare),
      preferVisualAfterText: textFirst && (builderType === "promo" || builderType === "article"),
      preferExpandedText: protectAllText || textMetrics.charCount >= 220,
      targetRootShape: targetShape,
      rootProfileId: string(rootGuidance.profileId, ""),
    };
  }

  function summarizeSectionTextDemand(sourceSection) {
    const textNodes = [];
    collectTextNodes(sourceSection, textNodes);
    let charCount = 0;
    let textNodeCount = 0;
    for (let index = 0; index < textNodes.length; index += 1) {
      const text = normalizeMeaningfulText(string(textNodes[index] && textNodes[index].characters, ""));
      if (!text) {
        continue;
      }
      textNodeCount += 1;
      charCount += text.length;
    }
    return {
      textNodeCount: textNodeCount,
      charCount: charCount,
    };
  }

  function deriveHeroCropPriority(aiPlan, heroGuidance) {
    if (!aiPlan || !aiPlan.cropPriority || aiPlan.cropPriority === "auto") {
      const fallback = string(heroGuidance && heroGuidance.cropPriority, "");
      return fallback || "headline-first";
    }
    return aiPlan.cropPriority;
  }

  function deriveHeroFocalTargets(aiPlan, heroGuidance) {
    if (!aiPlan || !Array.isArray(aiPlan.focalTargets) || aiPlan.focalTargets.length === 0) {
      if (heroGuidance && Array.isArray(heroGuidance.focalTargets) && heroGuidance.focalTargets.length > 0) {
        return heroGuidance.focalTargets.slice(0, 3);
      }
      return ["headline", "product"];
    }
    return aiPlan.focalTargets.slice(0, 3);
  }

  function deriveHeroHeadlinePreserve(heroGuidance) {
    return !!(heroGuidance && heroGuidance.headlinePreserve);
  }

  function deriveHeroCopyIntegrity(heroGuidance) {
    const value = string(heroGuidance && heroGuidance.copyIntegrity, "");
    return value || "required";
  }

  function deriveHeroCopyBlockPreferred(heroGuidance) {
    return !!(heroGuidance && heroGuidance.copyBlockPreferred);
  }

  function deriveHeroOverlayPosition(heroGuidance, sectionGuidance) {
    const value = string(heroGuidance && heroGuidance.overlayPosition, "");
    const fallback = string(sectionGuidance && sectionGuidance.textLayoutGuidance && sectionGuidance.textLayoutGuidance.alignment, "") === "center" ? "top-center" : "";
    return value || fallback || "top-center";
  }

  function deriveHeroCompositionPreset(heroGuidance, sectionGuidance) {
    const value = string(heroGuidance && heroGuidance.compositionPreset, "");
    const fallback = string(sectionGuidance && sectionGuidance.reflowPattern, "");
    return value || fallback || "overlay-copy-bottom-visual";
  }

  function deriveHeroTextAlignment(aiPlan, heroGuidance, sectionGuidance) {
    const aiAlignment = normalizeAiTextAlignment(aiPlan && aiPlan.textPlan && aiPlan.textPlan.alignment);
    if (aiAlignment) {
      return aiAlignment;
    }
    const value = string(heroGuidance && heroGuidance.textAlignment, "");
    const fallback = string(sectionGuidance && sectionGuidance.textLayoutGuidance && sectionGuidance.textLayoutGuidance.alignment, "");
    return value || fallback || "center";
  }

  function deriveHeroVisualAnchor(heroGuidance, sectionGuidance) {
    const value = string(heroGuidance && heroGuidance.visualAnchor, "");
    const fallback = string(sectionGuidance && sectionGuidance.visualRole && sectionGuidance.visualRole.anchor, "");
    return value || fallback || "bottom";
  }

  function deriveSectionContentPriority(builderType, heroGuidance, sectionGuidance, memoryPattern) {
    const guided = string(sectionGuidance && sectionGuidance.contentPriority, "");
    if (guided) {
      return guided;
    }
    if (builderType === "hero") {
      return "text-first";
    }
    if (builderType === "promo") {
      return "text-first";
    }
    if (builderType === "article" && containsAny(memoryPattern, ["text-first", "stack"])) {
      return "text-first";
    }
    return "balanced";
  }

  function deriveSectionReflowPattern(builderType, sectionGuidance, memoryPattern) {
    const guided = string(sectionGuidance && sectionGuidance.reflowPattern, "");
    if (guided) {
      return guided;
    }
    if (builderType === "promo") {
      return "meta-title-body-product";
    }
    if (builderType === "hero") {
      return "overlay-copy-bottom-visual";
    }
    if (builderType === "article" && containsAny(memoryPattern, ["stack"])) {
      return "title-body-media";
    }
    return "mobile-fit";
  }

  function deriveSectionTextLayoutGuidance(builderType, sectionGuidance, aiPlan) {
    const guided = sectionGuidance && sectionGuidance.textLayoutGuidance && typeof sectionGuidance.textLayoutGuidance === "object"
      ? Object.assign({}, sectionGuidance.textLayoutGuidance)
      : null;
    const aiTextPlan = aiPlan && aiPlan.textPlan && typeof aiPlan.textPlan === "object" ? aiPlan.textPlan : null;
    if (guided) {
      if (normalizeAiTextAlignment(aiTextPlan && aiTextPlan.alignment)) {
        guided.alignment = normalizeAiTextAlignment(aiTextPlan.alignment);
      }
      if (normalizeAiTextCopyMode(aiTextPlan && aiTextPlan.copyMode)) {
        guided.copyMode = normalizeAiTextCopyMode(aiTextPlan.copyMode);
      }
      if (aiTextPlan && aiTextPlan.gapAfterRatioByRole && typeof aiTextPlan.gapAfterRatioByRole === "object") {
        guided.gapAfterRatioByRole = aiTextPlan.gapAfterRatioByRole;
      }
      if (aiTextPlan && aiTextPlan.preserveLineBreaks === true) {
        guided.preserveLineBreaks = true;
      }
      return guided;
    }

    if (builderType === "hero") {
      const base = {
        alignment: "center",
        copyMode: "grouped-copy",
        rewrapRequired: true,
        headlineMaxWidthRatio: 0.88,
      };
      if (normalizeAiTextAlignment(aiTextPlan && aiTextPlan.alignment)) {
        base.alignment = normalizeAiTextAlignment(aiTextPlan.alignment);
      }
      if (normalizeAiTextCopyMode(aiTextPlan && aiTextPlan.copyMode)) {
        base.copyMode = normalizeAiTextCopyMode(aiTextPlan.copyMode);
      }
      if (aiTextPlan && aiTextPlan.gapAfterRatioByRole && typeof aiTextPlan.gapAfterRatioByRole === "object") {
        base.gapAfterRatioByRole = aiTextPlan.gapAfterRatioByRole;
      }
      if (aiTextPlan && aiTextPlan.preserveLineBreaks === true) {
        base.preserveLineBreaks = true;
      }
      return base;
    }
    if (builderType === "promo") {
      const base = {
        alignment: "center",
        copyMode: "stacked",
        rewrapRequired: true,
        headlineMaxWidthRatio: 0.9,
      };
      if (normalizeAiTextAlignment(aiTextPlan && aiTextPlan.alignment)) {
        base.alignment = normalizeAiTextAlignment(aiTextPlan.alignment);
      }
      if (normalizeAiTextCopyMode(aiTextPlan && aiTextPlan.copyMode)) {
        base.copyMode = normalizeAiTextCopyMode(aiTextPlan.copyMode);
      }
      if (aiTextPlan && aiTextPlan.gapAfterRatioByRole && typeof aiTextPlan.gapAfterRatioByRole === "object") {
        base.gapAfterRatioByRole = aiTextPlan.gapAfterRatioByRole;
      }
      if (aiTextPlan && aiTextPlan.preserveLineBreaks === true) {
        base.preserveLineBreaks = true;
      }
      return base;
    }
    const base = {
      alignment: "left",
      copyMode: "stacked",
      rewrapRequired: false,
      headlineMaxWidthRatio: 0.92,
    };
    if (normalizeAiTextAlignment(aiTextPlan && aiTextPlan.alignment)) {
      base.alignment = normalizeAiTextAlignment(aiTextPlan.alignment);
    }
    if (normalizeAiTextCopyMode(aiTextPlan && aiTextPlan.copyMode)) {
      base.copyMode = normalizeAiTextCopyMode(aiTextPlan.copyMode);
    }
    if (aiTextPlan && aiTextPlan.gapAfterRatioByRole && typeof aiTextPlan.gapAfterRatioByRole === "object") {
      base.gapAfterRatioByRole = aiTextPlan.gapAfterRatioByRole;
    }
    if (aiTextPlan && aiTextPlan.preserveLineBreaks === true) {
      base.preserveLineBreaks = true;
    }
    return base;
  }

  function resolveTemplateTextCopyMode(plan, builderType) {
    const guided = normalizeAiTextCopyMode(plan && plan.textLayoutGuidance && plan.textLayoutGuidance.copyMode);
    if (guided) {
      return guided;
    }
    if (builderType === "hero" && (requiresStrictHeroCopy(plan) || !!(plan && plan.copyBlockPreferred))) {
      return "grouped-copy";
    }
    return "stacked";
  }

  function deriveSectionTextGroupRoles(builderType, sectionGuidance, aiPlan) {
    const aiTextPlan = aiPlan && aiPlan.textPlan && typeof aiPlan.textPlan === "object" ? aiPlan.textPlan : null;
    const aiHeroCopyBlock = aiPlan && aiPlan.heroCopyBlock && typeof aiPlan.heroCopyBlock === "object" ? aiPlan.heroCopyBlock : null;
    if (sectionGuidance && sectionGuidance.textGroupRoles && typeof sectionGuidance.textGroupRoles === "object") {
      const base = Object.assign({}, sectionGuidance.textGroupRoles);
      if (Array.isArray(aiTextPlan && aiTextPlan.roleOrder) && aiTextPlan.roleOrder.length > 0) {
        base.order = mergePreferredTextRoleOrder(aiTextPlan.roleOrder, base.order);
        base.detected = mergePreferredTextRoleOrder(aiTextPlan.roleOrder, base.detected);
        if (Array.isArray(base.required)) {
          base.required = base.required.filter((role) => base.order.indexOf(role) >= 0);
        }
      }
      return base;
    }
    if (builderType === "hero") {
      const requiredRoles = [];
      if (aiHeroCopyBlock) {
        if (aiHeroCopyBlock.eyebrow) {
          requiredRoles.push("eyebrow");
        }
        if (aiHeroCopyBlock.headline) {
          requiredRoles.push("headline");
        }
        if (aiHeroCopyBlock.subtitle) {
          requiredRoles.push("subtitle");
        }
        if (aiHeroCopyBlock.body) {
          requiredRoles.push("body");
        }
      }
      const base = {
        order: ["eyebrow", "headline", "subtitle", "body"],
        required: requiredRoles.length > 0 ? requiredRoles : ["headline", "subtitle", "body"],
        detected: ["eyebrow", "headline", "subtitle", "body"],
      };
      if (Array.isArray(aiTextPlan && aiTextPlan.roleOrder) && aiTextPlan.roleOrder.length > 0) {
        base.order = mergePreferredTextRoleOrder(aiTextPlan.roleOrder, base.order);
        base.detected = mergePreferredTextRoleOrder(aiTextPlan.roleOrder, base.detected);
      }
      return base;
    }
    if (builderType === "promo") {
      const base = {
        order: ["meta", "headline", "body", "cta"],
        required: ["meta", "headline", "body"],
        detected: ["meta", "headline", "body", "cta"],
      };
      if (Array.isArray(aiTextPlan && aiTextPlan.roleOrder) && aiTextPlan.roleOrder.length > 0) {
        base.order = mergePreferredTextRoleOrder(aiTextPlan.roleOrder, base.order);
        base.detected = mergePreferredTextRoleOrder(aiTextPlan.roleOrder, base.detected);
      }
      return base;
    }
    const base = {
      order: ["headline", "body"],
      required: ["headline", "body"],
      detected: ["headline", "body"],
    };
    if (Array.isArray(aiTextPlan && aiTextPlan.roleOrder) && aiTextPlan.roleOrder.length > 0) {
      base.order = mergePreferredTextRoleOrder(aiTextPlan.roleOrder, base.order);
      base.detected = mergePreferredTextRoleOrder(aiTextPlan.roleOrder, base.detected);
    }
    return base;
  }

  function mergePreferredTextRoleOrder(preferred, fallback) {
    const out = [];
    const seen = {};
    const source = []
      .concat(Array.isArray(preferred) ? preferred : [])
      .concat(Array.isArray(fallback) ? fallback : []);
    for (let index = 0; index < source.length; index += 1) {
      const role = normalizeAiTextClusterRole(source[index]);
      if (!role || seen[role]) {
        continue;
      }
      seen[role] = true;
      out.push(role);
    }
    return out;
  }

  function deriveSectionTextPreservation(builderType, sectionGuidance, heroGuidance) {
    if (sectionGuidance && sectionGuidance.textPreservation && typeof sectionGuidance.textPreservation === "object") {
      return sectionGuidance.textPreservation;
    }
    return {
      allTextMustSurvive: true,
      preserveReadingOrder: true,
      preserveHeadlineVerbatim: builderType === "hero" || !!(heroGuidance && heroGuidance.headlinePreserve),
      copyBlockPreferred: builderType === "hero" && !!(heroGuidance && heroGuidance.copyBlockPreferred),
    };
  }

  function deriveSectionTransformPriority(sectionGuidance) {
    const source = sectionGuidance && Array.isArray(sectionGuidance.transformPriority) ? sectionGuidance.transformPriority : [];
    const out = [];
    const seen = {};
    const preferred = source.concat(["text-content", "text-scale", "text-align", "image-size", "image-align"]);
    for (let index = 0; index < preferred.length; index += 1) {
      const value = normalizeTransformPriorityToken(preferred[index]);
      if (!value || seen[value]) {
        continue;
      }
      seen[value] = true;
      out.push(value);
    }
    return out;
  }

  function normalizeTransformPriorityToken(value) {
    const text = string(value, "").toLowerCase();
    if (["text-content", "text-scale", "text-align", "image-size", "image-align"].indexOf(text) >= 0) {
      return text;
    }
    return "";
  }

  function getTransformPriorityOrder(plan) {
    const list = plan && Array.isArray(plan.transformPriority) ? plan.transformPriority : [];
    const normalized = [];
    const seen = {};
    const source = list.concat(["text-content", "text-scale", "text-align", "image-size", "image-align"]);
    for (let index = 0; index < source.length; index += 1) {
      const token = normalizeTransformPriorityToken(source[index]);
      if (!token || seen[token]) {
        continue;
      }
      seen[token] = true;
      normalized.push(token);
    }
    return normalized;
  }

  function getTransformPriorityIndex(plan, token) {
    const order = getTransformPriorityOrder(plan);
    const normalizedToken = normalizeTransformPriorityToken(token);
    const index = order.indexOf(normalizedToken);
    return index >= 0 ? index : order.length;
  }

  function prioritizesTextContentOverImages(plan) {
    return getTransformPriorityIndex(plan, "text-content") < getTransformPriorityIndex(plan, "image-size");
  }

  function prioritizesTextScaleOverImages(plan) {
    return getTransformPriorityIndex(plan, "text-scale") < getTransformPriorityIndex(plan, "image-size");
  }

  function prioritizesTextAlignOverImages(plan) {
    return getTransformPriorityIndex(plan, "text-align") < getTransformPriorityIndex(plan, "image-align");
  }

  function deriveSectionVisualRole(builderType, sectionGuidance) {
    if (sectionGuidance && sectionGuidance.visualRole && typeof sectionGuidance.visualRole === "object") {
      return sectionGuidance.visualRole;
    }
    if (builderType === "hero") {
      return {
        primary: "background",
        focal: "product",
        anchor: "bottom",
      };
    }
    return {
      primary: "supporting",
      focal: "supporting",
      anchor: "inline",
    };
  }

  function deriveSectionMobileAspectPreference(builderType, sectionGuidance) {
    if (sectionGuidance && sectionGuidance.mobileAspectPreference && typeof sectionGuidance.mobileAspectPreference === "object") {
      return sectionGuidance.mobileAspectPreference;
    }
    if (builderType === "hero") {
      return { preferredRatio: 1.48, minRatio: 1.16, maxRatio: 1.82 };
    }
    if (builderType === "promo") {
      return { preferredRatio: 1.12, minRatio: 0.88, maxRatio: 1.42 };
    }
    return { preferredRatio: 0.9, minRatio: 0.72, maxRatio: 1.22 };
  }

  function deriveSectionCropSafeZone(builderType, sectionGuidance, heroGuidance) {
    if (sectionGuidance && sectionGuidance.cropSafeZone && typeof sectionGuidance.cropSafeZone === "object") {
      return sectionGuidance.cropSafeZone;
    }
    return {
      horizontalBias: builderType === "hero" ? string(heroGuidance && heroGuidance.overlayPosition, "").indexOf("left") >= 0 ? "left" : "center" : "center",
      verticalBias: builderType === "hero" ? "top" : "center",
      preserveTargets: Array.isArray(heroGuidance && heroGuidance.focalTargets) && heroGuidance.focalTargets.length ? heroGuidance.focalTargets.slice(0, 3) : ["headline"],
      allowBackgroundTrim: builderType === "hero",
    };
  }

  function deriveSectionDropRules(builderType, sectionGuidance) {
    if (sectionGuidance && sectionGuidance.dropRules && typeof sectionGuidance.dropRules === "object") {
      return sectionGuidance.dropRules;
    }
    return {
      hideDecorative: builderType === "hero" || builderType === "promo",
      hideDesktopOnlyElements: false,
      hideRedundantMeta: false,
      prioritizeTextOverVisual: true,
      collapseHorizontalLayout: builderType === "promo",
      preserveAllText: true,
    };
  }

  function findMatchingAiSectionPlan(sourceSection, sectionType, state, sourceSectionIndex) {
    const plans = state && Array.isArray(state.aiSectionPlans) ? state.aiSectionPlans : [];
    const sectionTokens = tokenize(safeName(sourceSection));
    if (typeof sourceSectionIndex === "number" && sourceSectionIndex >= 0) {
      for (let index = 0; index < plans.length; index += 1) {
        const plan = plans[index];
        if (!plan || typeof plan !== "object") {
          continue;
        }
        if (typeof plan.sectionIndex === "number" && Math.round(plan.sectionIndex) === sourceSectionIndex) {
          return plan;
        }
      }
    }
    let best = null;
    let bestScore = 0;

    for (let index = 0; index < plans.length; index += 1) {
      const plan = plans[index];
      if (!plan || typeof plan !== "object") {
        continue;
      }

      const typeScore = plan.sectionType ? areTemplateSectionTypesCompatible(sectionType, plan.sectionType) : 0.58;
      const tokenScore = tokenSimilarity(sectionTokens, Array.isArray(plan.tokens) ? plan.tokens : tokenize(plan.sectionName));
      const indexScore =
        typeof sourceSectionIndex === "number" && sourceSectionIndex >= 0 && plan.sectionIndex === sourceSectionIndex ? 1 : 0;
      const score = round(typeScore * 0.5 + tokenScore * 0.24 + indexScore * 0.26);
      if (score > bestScore) {
        best = plan;
        bestScore = score;
      }
    }

    return bestScore >= 0.34 ? best : null;
  }

  function findMatchingSectionExample(sourceSection, sectionType, state) {
    const examples = state && Array.isArray(state.memorySectionExamples) ? state.memorySectionExamples : [];
    const sectionTokens = tokenize(safeName(sourceSection));
    let best = null;
    let bestScore = 0;

    for (let index = 0; index < examples.length; index += 1) {
      const example = examples[index];
      if (!example || typeof example !== "object") {
        continue;
      }

      const typeMatch = string(example.sectionType, "") === sectionType ? 1 : areTemplateSectionTypesCompatible(sectionType, string(example.sectionType, ""));
      const tokenScore = tokenSimilarity(sectionTokens, tokenize(string(example.title, "")));
      const score = round(typeMatch * 0.72 + tokenScore * 0.28);
      if (score > bestScore) {
        best = example;
        bestScore = score;
      }
    }

    return bestScore >= 0.45 ? best : null;
  }

  function areTemplateSectionTypesCompatible(left, right) {
    if (!left || !right) {
      return 0;
    }
    if (left === right) {
      return 1;
    }
    if ((left === "article" && right === "editorial") || (left === "editorial" && right === "article")) {
      return 0.82;
    }
    if ((left === "visual" && right === "hero") || (left === "hero" && right === "visual")) {
      return 0.78;
    }
    return 0;
  }

  function deriveTemplateMetricsFromMemory(builderType, memoryPattern, state, aiPlan, containerProfile) {
    const hints = state && typeof state.memoryRuleHints === "string" ? state.memoryRuleHints : "";
    const compact = hints.indexOf("16px to 14px") >= 0 || hints.indexOf("font 16px") >= 0;
    const zeroPadding = hints.indexOf("padding 0") >= 0;
    const reordered = hints.indexOf("child order") >= 0 || hints.indexOf("reorder") >= 0;
    const aiCompact = !!(aiPlan && aiPlan.compactText);
    const aiVisualPriority = aiPlan ? aiPlan.visualPriority : "";
    const aiVisualFirst = aiVisualPriority === "first" ? true : aiVisualPriority === "last" ? false : null;
    const learnedGap = resolveProfileRangeP50(containerProfile, "targetGap");
    const learnedPadding = resolveContainerProfilePadding(containerProfile, 0);
    const learnedMediaRatio = deriveLearnedMediaRatioFromContainerProfile(builderType, containerProfile, 0);
    const collapseToSingleColumn = !!(containerProfile && containerProfile.collapseToSingleColumn);
    const learnedCompact = (learnedGap > 0 && learnedGap <= 10) || (learnedPadding > 0 && learnedPadding <= 12);

    if (builderType === "hero") {
      const baseGap = aiCompact || compact ? 8 : 12;
      const basePadding = 0;
      const baseMediaRatio = containsAny(memoryPattern, ["crop"]) ? 1.32 : 1.18;
      return {
        defaultPattern: "hero-crop-stack",
        gap: learnedGap > 0 ? Math.round(clamp(baseGap * 0.45 + learnedGap * 0.55, 0, 24)) : baseGap,
        padding: learnedPadding > 0 ? Math.round(clamp(basePadding * 0.2 + learnedPadding * 0.8, 0, 24)) : basePadding,
        mediaRatio:
          learnedMediaRatio > 0 ? round(clamp(baseMediaRatio * 0.58 + learnedMediaRatio * 0.42, 0.88, 1.68)) : baseMediaRatio,
        visualFirst: aiVisualFirst === null ? !reordered : aiVisualFirst,
        compactText: aiCompact || compact || learnedCompact,
        collapseToSingleColumn: collapseToSingleColumn,
      };
    }
    if (builderType === "promo") {
      const baseGap = aiCompact || compact ? 8 : 12;
      const basePadding = zeroPadding ? 12 : 16;
      const baseMediaRatio = containsAny(memoryPattern, ["card"]) ? 0.56 : 0.48;
      return {
        defaultPattern: "promo-card",
        gap: learnedGap > 0 ? Math.round(clamp(baseGap * 0.42 + learnedGap * 0.58, 0, 24)) : baseGap,
        padding: learnedPadding > 0 ? Math.round(clamp(basePadding * 0.34 + learnedPadding * 0.66, 0, 28)) : basePadding,
        mediaRatio:
          learnedMediaRatio > 0 ? round(clamp(baseMediaRatio * 0.62 + learnedMediaRatio * 0.38, 0.32, 0.92)) : baseMediaRatio,
        visualFirst: aiVisualFirst === null ? true : aiVisualFirst,
        compactText: aiCompact || compact || learnedCompact,
        collapseToSingleColumn: collapseToSingleColumn,
      };
    }
    const baseGap = aiCompact || compact ? 8 : 12;
    const basePadding = 0;
    const baseMediaRatio = containsAny(memoryPattern, ["stack"]) ? 0.68 : 0.58;
    return {
      defaultPattern: "stacked-article",
      gap: learnedGap > 0 ? Math.round(clamp(baseGap * 0.46 + learnedGap * 0.54, 0, 24)) : baseGap,
      padding: learnedPadding > 0 ? Math.round(clamp(basePadding * 0.2 + learnedPadding * 0.8, 0, 24)) : basePadding,
      mediaRatio:
        learnedMediaRatio > 0 ? round(clamp(baseMediaRatio * 0.62 + learnedMediaRatio * 0.38, 0.42, 1.02)) : baseMediaRatio,
      visualFirst: aiVisualFirst === null ? !containsAny(memoryPattern, ["text-first"]) : aiVisualFirst,
      compactText: aiCompact || compact || learnedCompact,
      collapseToSingleColumn: collapseToSingleColumn,
    };
  }

  function deriveSectionImagePolicy(builderType, options) {
    const config = options && typeof options === "object" ? options : {};
    const cropSafeZone = config.cropSafeZone && typeof config.cropSafeZone === "object" ? config.cropSafeZone : null;
    const visualRole = config.visualRole && typeof config.visualRole === "object" ? config.visualRole : null;
    const dropRules = config.dropRules && typeof config.dropRules === "object" ? config.dropRules : null;
    const heightBudget = config.heightBudget && typeof config.heightBudget === "object" ? config.heightBudget : null;
    const contentPriority = string(config.contentPriority, "balanced");
    const cropPriority = string(config.cropPriority, "balanced");
    const visualAnchor = string(config.visualAnchor, "");
    const mediaShare = numeric(heightBudget && heightBudget.mediaShare);
    const prioritizeTextOverVisual = !!(dropRules && dropRules.prioritizeTextOverVisual) || contentPriority === "text-first";
    const preserveTargets = uniqueStrings(
      []
        .concat(Array.isArray(config.focalTargets) ? config.focalTargets : [])
        .concat(Array.isArray(cropSafeZone && cropSafeZone.preserveTargets) ? cropSafeZone.preserveTargets : []),
      4
    );

    return {
      preferredVisualRole: normalizeVisualSemanticRole(string(visualRole && visualRole.primary, "")) || (builderType === "hero" ? "background" : "supporting"),
      focalRole: normalizeVisualSemanticRole(string(visualRole && visualRole.focal, "")),
      prioritizeTextOverVisual: prioritizeTextOverVisual,
      allowBackgroundTrim: cropSafeZone ? cropSafeZone.allowBackgroundTrim !== false : builderType === "hero",
      horizontalBias: normalizeVisualBias(cropSafeZone && cropSafeZone.horizontalBias, "center"),
      verticalBias: normalizeVisualBias(cropSafeZone && cropSafeZone.verticalBias, builderType === "hero" ? "top" : "center"),
      visualAnchor: visualAnchor || string(visualRole && visualRole.anchor, ""),
      cropPriority: cropPriority || "balanced",
      preserveTargets: preserveTargets,
      compactMedia: mediaShare > 0 && mediaShare <= 0.34,
      backgroundCropLimit: builderType === "hero" ? 0.58 : 0.44,
      supportingCropLimit: prioritizeTextOverVisual ? 0.26 : 0.34,
      subjectCropLimit: prioritizeTextOverVisual ? 0.16 : 0.24,
    };
  }

  async function buildHeroTemplateSection(sourceSection, candidates, contentWidth, state, plan) {
    const padding = plan && typeof plan.padding === "number" ? plan.padding : 0;
    const innerWidth = Math.max(120, contentWidth - padding * 2);
    const frame = createTemplateSectionFrame(
      `${safeName(sourceSection)} / hero-template`,
      contentWidth,
      plan && plan.gap ? plan.gap : 12,
      padding,
      true,
      sourceSection
    );
    const visualCandidate = choosePrimaryVisualCandidate(candidates, sourceSection, plan);
    const filteredTextNodes = filterTextEntriesForAiPlan(candidates.textNodes, plan && plan.aiPlan, "hero");
    const textCandidates = pickHeroTextCandidates(filteredTextNodes);
    const ctaCandidates = pickCtaTextCandidates(filteredTextNodes, textCandidates);
    const preserveComposition = shouldPreserveHeroComposition(sourceSection, candidates, plan);

    if (preserveComposition) {
      const compositeHeight = getHeroCompositeHeight(contentWidth, plan);
      const compositeFrame = createTemplateMediaFrame("hero-composite", contentWidth, compositeHeight);
      const backgroundCandidate = chooseHeroBackgroundCandidate(candidates.visualNodes, sourceSection);
      let composed = false;
      if (backgroundCandidate) {
        composed = appendHeroBackgroundToMediaFrame(backgroundCandidate, compositeFrame, contentWidth, compositeHeight, state, plan);
        if (composed) {
          const overlayAppended = await appendHeroOverlayTextToMediaFrame(
            compositeFrame,
            sourceSection,
            candidates,
            textCandidates,
            ctaCandidates,
            contentWidth,
            state,
            plan
          );
          if (requiresStrictHeroCopy(plan) && !overlayAppended) {
            clearFrameChildren(compositeFrame);
            composed = false;
          } else {
            const accentCandidate = chooseHeroAccentVisualCandidate(candidates.visualNodes, backgroundCandidate, sourceSection, plan);
            if (accentCandidate && !shouldDisableHeroAccent(plan)) {
              appendHeroAccentToMediaFrame(accentCandidate, compositeFrame, contentWidth, compositeHeight, state, plan);
            }
          }
        }
      }
      if (!composed) {
        composed = appendHeroCompositeToMediaFrame(sourceSection, compositeFrame, contentWidth, compositeHeight, state, candidates, plan);
      }
      if (composed) {
        frame.appendChild(compositeFrame);
        return Array.isArray(frame.children) && frame.children.length > 0 ? frame : null;
      }
      try {
        compositeFrame.remove();
      } catch (error) {}
    }

    if (visualCandidate && (!plan || plan.visualFirst !== false)) {
      const mediaHeight = resolveSectionBudgetMediaHeight(contentWidth, plan, plan && plan.mediaRatio ? plan.mediaRatio : 0.72, 220, 420);
      const mediaFrame = createTemplateMediaFrame("hero-media", contentWidth, mediaHeight);
      if (appendVisualCandidateToMediaFrame(visualCandidate, mediaFrame, innerWidth, mediaHeight, state, plan)) {
        frame.appendChild(mediaFrame);
      } else {
        try {
          mediaFrame.remove();
        } catch (error) {}
      }
    }

    if (textCandidates.length > 0) {
      const textStack = createTemplateSectionFrame("hero-copy", contentWidth, 8, 0, false, null);
      await appendTextCandidatesToStack(textCandidates, textStack, contentWidth, state, 4, "", plan && plan.textLayoutGuidance, "hero");
      if (Array.isArray(textStack.children) && textStack.children.length > 0) {
        frame.appendChild(textStack);
      } else {
        try {
          textStack.remove();
        } catch (error) {}
      }
    }

    if (ctaCandidates.length > 0) {
      const ctaStack = createTemplateSectionFrame("hero-cta", contentWidth, 8, 0, false, null);
      await appendTextCandidatesToStack(ctaCandidates, ctaStack, contentWidth, state, 2, "cta", plan && plan.textLayoutGuidance, "hero");
      if (Array.isArray(ctaStack.children) && ctaStack.children.length > 0) {
        frame.appendChild(ctaStack);
      } else {
        try {
          ctaStack.remove();
        } catch (error) {}
      }
    }

    if (visualCandidate && plan && plan.visualFirst === false) {
      const mediaHeight = resolveSectionBudgetMediaHeight(contentWidth, plan, plan.mediaRatio || 0.72, 220, 420);
      const mediaFrame = createTemplateMediaFrame("hero-media", contentWidth, mediaHeight);
      if (appendVisualCandidateToMediaFrame(visualCandidate, mediaFrame, contentWidth, mediaHeight, state, plan)) {
        frame.appendChild(mediaFrame);
      } else {
        try {
          mediaFrame.remove();
        } catch (error) {}
      }
    }

    return Array.isArray(frame.children) && frame.children.length > 0 ? frame : null;
  }

  function shouldPreserveHeroComposition(sourceSection, candidates, plan) {
    if (plan && plan.aiOnlyComposition) {
      return false;
    }
    if (isSectionBand(sourceSection)) {
      return true;
    }
    if (plan && plan.aiPlan && plan.aiPlan.builderType === "hero" && plan.aiPlan.visualPriority === "auto") {
      return true;
    }
    if (countAbsoluteChildrenForDraft(sourceSection) >= 2) {
      return true;
    }
    const textNodes = candidates && Array.isArray(candidates.textNodes) ? candidates.textNodes : [];
    const visualNodes = candidates && Array.isArray(candidates.visualNodes) ? candidates.visualNodes : [];
    return textNodes.length >= 3 && visualNodes.length >= 2;
  }

  function requiresStrictHeroCopy(plan) {
    return string(plan && plan.copyIntegrity, "") === "required" || !!(plan && plan.headlinePreserve) || prioritizesTextContentOverImages(plan);
  }

  function clearFrameChildren(frame) {
    if (!frame || !Array.isArray(frame.children)) {
      return;
    }
    const children = frame.children.slice();
    for (let index = 0; index < children.length; index += 1) {
      try {
        children[index].remove();
      } catch (error) {}
    }
  }

  function getHeroCompositeHeight(contentWidth, plan) {
    const preset = string(plan && plan.compositionPreset, "");
    const preferredRatio = numeric(plan && plan.mobileAspectPreference && plan.mobileAspectPreference.preferredRatio);
    const minRatio = numeric(plan && plan.mobileAspectPreference && plan.mobileAspectPreference.minRatio);
    const maxRatio = numeric(plan && plan.mobileAspectPreference && plan.mobileAspectPreference.maxRatio);
    const budget = plan && plan.heightBudget && typeof plan.heightBudget === "object" ? plan.heightBudget : null;
    const budgetPreferredHeight = numeric(budget && budget.preferredHeight);
    const budgetMediaHeight = numeric(budget && budget.mediaHeight);
    const budgetMaxHeight = numeric(budget && budget.maxHeight);
    let nextHeight = 0;
    if (preferredRatio > 0) {
      const lower = minRatio > 0 ? minRatio : 0.9;
      const upper = maxRatio > 0 ? maxRatio : 2;
      const clampedRatio = Math.max(lower, Math.min(upper, preferredRatio));
      nextHeight = Math.max(360, Math.min(720, Math.round(contentWidth * clampedRatio)));
    } else if (preset === "overlay-copy-bottom-visual") {
      nextHeight = Math.max(420, Math.min(620, Math.round(contentWidth * 1.56)));
    } else {
      nextHeight = Math.max(300, Math.min(460, Math.round(contentWidth * 1.18)));
    }

    if (budgetPreferredHeight > 0) {
      const budgetBlend = Math.round(budgetPreferredHeight * (preset === "overlay-copy-bottom-visual" ? 0.84 : 0.74));
      nextHeight = Math.max(nextHeight, budgetBlend);
    }
    if (budgetMediaHeight > 0) {
      nextHeight = Math.max(nextHeight, Math.round(budgetMediaHeight));
    }
    const upperCap = budgetMaxHeight > 0 ? Math.max(420, Math.min(860, budgetMaxHeight)) : 720;
    return Math.max(300, Math.min(upperCap, nextHeight));
  }

  function chooseHeroBackgroundCandidate(candidates, sourceSection) {
    const list = Array.isArray(candidates) ? candidates.slice() : [];
    const sourceBounds = getNodeBounds(sourceSection);
    let best = null;
    let bestScore = 0;

    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index];
      if (!entry || !entry.bounds || entry.mirrored) {
        continue;
      }

      const corpus = safeName(entry.node).toLowerCase();
      const areaRatio =
        sourceBounds && numeric(sourceBounds.width) * numeric(sourceBounds.height) > 0
          ? (numeric(entry.bounds.width) * numeric(entry.bounds.height)) / (numeric(sourceBounds.width) * numeric(sourceBounds.height))
          : 0;
      let score = areaRatio * 2;
      if (string(entry.semanticRole, "") === "background") {
        score += 1.6;
      }
      if (containsAny(corpus, ["hero", "kv", "key visual", "background", "bg", "visual"])) {
        score += 1;
      }
      if (entry.hasImageFill) {
        score += 0.5;
      }
      if (score > bestScore) {
        best = entry;
        bestScore = score;
      }
    }

    return bestScore >= 0.45 ? best : null;
  }

  function chooseHeroAccentVisualCandidate(candidates, backgroundCandidate, sourceSection, plan) {
    const sourceBounds = getNodeBounds(sourceSection);
    const preferredTargets = Array.isArray(plan && plan.focalTargets) ? plan.focalTargets : [];
    for (let index = 0; index < preferredTargets.length; index += 1) {
      const target = preferredTargets[index];
      if (target !== "product" && target !== "person") {
        continue;
      }
      const candidate = pickHeroVisualFocusCandidate(candidates, target, sourceBounds);
      if (candidate && (!backgroundCandidate || candidate.node !== backgroundCandidate.node)) {
        return candidate;
      }
    }

    const list = Array.isArray(candidates) ? candidates.slice() : [];
    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index];
      if (!entry || !entry.bounds || entry.mirrored) {
        continue;
      }
      if (backgroundCandidate && entry.node === backgroundCandidate.node) {
        continue;
      }
      const areaRatio =
        sourceBounds && numeric(sourceBounds.width) * numeric(sourceBounds.height) > 0
          ? (numeric(entry.bounds.width) * numeric(entry.bounds.height)) / (numeric(sourceBounds.width) * numeric(sourceBounds.height))
          : 0;
      const semanticRole = normalizeVisualSemanticRole(string(entry.semanticRole, ""));
      if (areaRatio < 0.03 || areaRatio > 0.42) {
        continue;
      }
      if (semanticRole === "background" || semanticRole === "decorative") {
        continue;
      }
      return entry;
    }

    return null;
  }

  function appendHeroCompositeToMediaFrame(sourceNode, mediaFrame, targetWidth, targetHeight, state, candidates, plan) {
    const clone = cloneSourceNodeForDraft(sourceNode);
    if (!clone) {
      return false;
    }

    unlockNodeTree(clone);
    scaleNodeToCoverFrame(clone, targetWidth, targetHeight, state);

    try {
      mediaFrame.appendChild(clone);
      positionHeroCompositeClone(clone, sourceNode, candidates, plan, targetWidth, targetHeight);
      return true;
    } catch (error) {
      try {
        clone.remove();
      } catch (removeError) {}
      return false;
    }
  }

  async function appendHeroOverlayTextToMediaFrame(mediaFrame, sourceSection, candidates, textCandidates, ctaCandidates, contentWidth, state, plan) {
    const overlayMetrics = getHeroOverlayMetrics(mediaFrame, contentWidth, plan);
    const overlayWidth = overlayMetrics.width;
    const maxOverlayHeight = overlayMetrics.maxHeight;
    const copyMode = resolveTemplateTextCopyMode(plan, "hero");
    if (copyMode !== "stacked") {
      if (await appendHeroCopyBlockToMediaFrame(mediaFrame, sourceSection, candidates, overlayWidth, maxOverlayHeight, state, plan)) {
        return true;
      }
      if (copyMode === "grouped-copy" && (requiresStrictHeroCopy(plan) || (plan && plan.copyBlockPreferred))) {
        return false;
      }
    } else if (!Array.isArray(textCandidates) || textCandidates.length === 0) {
      return false;
    }
    if (copyMode !== "stacked" && (requiresStrictHeroCopy(plan) || (plan && plan.copyBlockPreferred))) {
      return false;
    }
    const overlay = createTemplateSectionFrame("hero-overlay-copy", overlayWidth, plan && plan.compactText ? 6 : 8, 0, false, null);
    configureHeroOverlayFrame(overlay, plan);
    await appendTextCandidatesToStack(textCandidates, overlay, overlayWidth, state, 4, "", plan && plan.textLayoutGuidance, "hero");
    if (Array.isArray(overlay.children) && overlay.children.length > 0 && ctaCandidates.length > 0) {
      await appendTextCandidatesToStack(ctaCandidates, overlay, overlayWidth, state, 1, "cta", plan && plan.textLayoutGuidance, "hero");
    }
    if (!Array.isArray(overlay.children) || overlay.children.length === 0) {
      try {
        overlay.remove();
      } catch (error) {}
      return false;
    }

    try {
      mediaFrame.appendChild(overlay);
      positionHeroOverlayNode(overlay, mediaFrame, plan);
      return true;
    } catch (error) {
      try {
        overlay.remove();
      } catch (removeError) {}
      return false;
    }
  }

  async function appendHeroCopyBlockToMediaFrame(mediaFrame, sourceSection, candidates, overlayWidth, maxOverlayHeight, state, plan) {
    const overlay = createTemplateSectionFrame("hero-overlay-copy-block", overlayWidth, plan && plan.compactText ? 4 : 6, 0, false, null);
    configureHeroOverlayFrame(overlay, plan);
    const textEntries = resolveHeroCopyTextEntries(sourceSection, candidates, overlayWidth, plan && plan.aiPlan);
    const textGroups = buildHeroCopyGroups(textEntries, plan);
    const overlayBaseGap = "itemSpacing" in overlay ? numeric(overlay.itemSpacing) : 0;
    const sourceBlockWidth = measureTextEntryCollectionWidth(textGroups);
    setTemplateStackItemSpacing(overlay, 0);
    if (textGroups.length === 0) {
      try {
        overlay.remove();
      } catch (error) {}
      return false;
    }

    for (let index = 0; index < textGroups.length; index += 1) {
      const clone = await createHeroTextGroupClone(textGroups[index], overlayWidth, state, plan);
      if (!clone) {
        continue;
      }
      try {
        overlay.appendChild(clone);
        if (index < textGroups.length - 1) {
          appendTemplateStackSpacer(
            overlay,
            resolveScaledTextGapHeight(
              textGroups[index],
              textGroups[index + 1],
              clone,
              overlayWidth,
              sourceBlockWidth,
              overlayBaseGap,
              textGroups[index].role,
              textGroups[index + 1].role,
              plan && plan.textLayoutGuidance
            ),
            `hero-copy-gap-${index + 1}`
          );
        }
      } catch (appendError) {
        try {
          clone.remove();
        } catch (removeError) {}
      }
    }

    if (!Array.isArray(overlay.children) || overlay.children.length === 0) {
      try {
        overlay.remove();
      } catch (error) {}
      return false;
    }

    if (!(await fitHeroOverlayFrameToBounds(overlay, overlayWidth, maxOverlayHeight))) {
      try {
        overlay.remove();
      } catch (removeError) {}
      return false;
    }

    try {
      mediaFrame.appendChild(overlay);
      positionHeroOverlayNode(overlay, mediaFrame, plan);
      return true;
    } catch (error) {
      try {
        overlay.remove();
      } catch (removeError) {}
      return false;
    }
  }

  function getHeroOverlayMetrics(mediaFrame, contentWidth, plan) {
    const strict = requiresStrictHeroCopy(plan) || string(plan && plan.compositionPreset, "") === "overlay-copy-bottom-visual";
    const frameHeight = numeric(mediaFrame && mediaFrame.height);
    const widthRatio = numeric(plan && plan.textLayoutGuidance && plan.textLayoutGuidance.headlineMaxWidthRatio) || 0.88;
    const prioritizeTextScale = prioritizesTextScaleOverImages(plan);
    const prioritizeTextContent = prioritizesTextContentOverImages(plan);
    const budget = plan && plan.heightBudget && typeof plan.heightBudget === "object" ? plan.heightBudget : null;
    const textShare = numeric(budget && budget.textShare);
    const budgetTextHeight = numeric(budget && budget.textHeight);
    return {
      width: Math.max(
        220,
        Math.round(
          contentWidth *
            (strict
              ? Math.max(Math.max(widthRatio, prioritizeTextScale ? 0.94 : widthRatio), textShare > 0.5 ? 0.95 : 0)
              : Math.max(Math.min(0.9, widthRatio), prioritizeTextContent || textShare > 0.54 ? 0.92 : 0.86))
        )
      ),
      maxHeight: Math.max(
        180,
        Math.max(
          Math.round(frameHeight * (strict ? (prioritizeTextScale ? 0.62 : 0.42) : prioritizeTextContent ? 0.54 : 0.44)),
          budgetTextHeight > 0 ? Math.round(budgetTextHeight * (strict ? 0.96 : 0.82)) : 0
        )
      ),
    };
  }

  function configureHeroOverlayFrame(overlay, plan) {
    if (!overlay) {
      return;
    }
    try {
      if ("counterAxisAlignItems" in overlay) {
        overlay.counterAxisAlignItems = string(plan && plan.textAlignment, "center") === "center" ? "CENTER" : "MIN";
      }
    } catch (error) {}
  }

  function shouldDisableHeroAccent(plan) {
    return string(plan && plan.compositionPreset, "") === "overlay-copy-bottom-visual";
  }

  function positionHeroOverlayNode(node, mediaFrame, plan) {
    const frameWidth = numeric(mediaFrame && mediaFrame.width);
    const overlayWidth = numeric(node && node.width);
    const overlayHeight = numeric(node && node.height);
    let position = string(plan && plan.overlayPosition, "top-left");
    if (requiresStrictHeroCopy(plan) && position === "top-left") {
      position = "top-center";
    }
    let x = 16;
    let y = 18;

    if (position === "top-center") {
      x = Math.round((frameWidth - overlayWidth) / 2);
    } else if (position === "top-right") {
      x = Math.round(frameWidth - overlayWidth - 16);
    }

    try {
      node.x = Math.max(8, x);
      node.y = Math.max(12, y);
      if (string(plan && plan.compositionPreset, "") === "overlay-copy-bottom-visual") {
        node.y = 24;
      }
      if (overlayHeight > numeric(mediaFrame && mediaFrame.height) * 0.5) {
        node.y = Math.min(node.y, 12);
      }
    } catch (error) {}
  }

  function findHeroCopyBlockCandidate(sourceSection, candidates) {
    const blocks = candidates && Array.isArray(candidates.blockNodes) ? candidates.blockNodes : [];
    const heroTexts = pickHeroTextCandidates(candidates && Array.isArray(candidates.textNodes) ? candidates.textNodes : []);
    const sourceBounds = getNodeBounds(sourceSection);
    let best = null;
    let bestScore = 0;

    for (let index = 0; index < blocks.length; index += 1) {
      const block = blocks[index];
      if (!block || !block.bounds || block.mirrored) {
        continue;
      }

      const areaRatio =
        sourceBounds && numeric(sourceBounds.width) * numeric(sourceBounds.height) > 0
          ? (numeric(block.bounds.width) * numeric(block.bounds.height)) / (numeric(sourceBounds.width) * numeric(sourceBounds.height))
          : 0;
      if (areaRatio <= 0 || areaRatio >= 0.55) {
        continue;
      }

      const relativeX = sourceBounds ? (numeric(block.bounds.x) - numeric(sourceBounds.x)) / Math.max(1, numeric(sourceBounds.width)) : 0;
      const relativeY = sourceBounds ? (numeric(block.bounds.y) - numeric(sourceBounds.y)) / Math.max(1, numeric(sourceBounds.height)) : 0;
      if (relativeY > 0.58 || relativeX > 0.52) {
        continue;
      }

      let containedTexts = 0;
      for (let textIndex = 0; textIndex < heroTexts.length; textIndex += 1) {
        if (boundsContain(block.bounds, heroTexts[textIndex].bounds, 12)) {
          containedTexts += 1;
        }
      }

      const corpus = safeName(block.node).toLowerCase();
      let score = containedTexts * 2 + (1 - areaRatio);
      if (containsAny(corpus, ["copy", "title", "headline", "text", "kv", "hero"])) {
        score += 0.8;
      }
      if (relativeX <= 0.18) {
        score += 0.25;
      }

      if (score > bestScore) {
        best = block;
        bestScore = score;
      }
    }

    return bestScore >= 1.8 ? best : null;
  }

  function collectHeroCopyTextEntries(rootNode, overlayWidth) {
    const nodes = [];
    collectTextNodes(rootNode, nodes);
    const entries = [];
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      const bounds = getNodeBounds(node);
      if (!bounds || node.visible === false || isMirroredTransformNode(node)) {
        continue;
      }
      const text = string(node.characters, "");
      if (!text) {
        continue;
      }
      entries.push({
        node: node,
        bounds: bounds,
        fontSize: getTemplateTextSize(node),
        textLength: text.length,
      });
    }

    entries.sort(compareTemplateReadingOrder);
    const filtered = [];
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      if (entry.textLength <= 1) {
        continue;
      }
      filtered.push(entry);
      if (filtered.length >= 6) {
        break;
      }
    }
    return filtered;
  }

  function buildHeroCopyGroups(textEntries, plan) {
    const entries = Array.isArray(textEntries) ? textEntries.slice() : [];
    if (entries.length === 0) {
      return [];
    }

    let headlineIndex = 0;
    for (let index = 1; index < entries.length; index += 1) {
      if (entries[index].fontSize > entries[headlineIndex].fontSize) {
        headlineIndex = index;
      }
    }

    const groups = [];
    const eyebrowEntries = entries.slice(0, headlineIndex);
    const headlineEntry = entries[headlineIndex];
    const trailingEntries = entries.slice(headlineIndex + 1);
    const subtitleEntries = [];
    const bodyEntries = [];

    for (let index = 0; index < trailingEntries.length; index += 1) {
      const entry = trailingEntries[index];
      if (subtitleEntries.length === 0 && isHeroSubtitleCandidate(entry, headlineEntry)) {
        subtitleEntries.push(entry);
      } else {
        bodyEntries.push(entry);
      }
    }

    if (eyebrowEntries.length > 0) {
      groups.push(buildTextEntryGroup("eyebrow", eyebrowEntries));
    }
    groups.push(buildTextEntryGroup("headline", [headlineEntry]));
    if (subtitleEntries.length > 0) {
      groups.push(buildTextEntryGroup("subtitle", subtitleEntries));
    }
    if (bodyEntries.length > 0) {
      groups.push(buildTextEntryGroup("body", bodyEntries));
    }
    return sortHeroTextGroupsByPlan(groups, plan);
  }

  function buildTextEntryGroup(role, entries) {
    const list = Array.isArray(entries) ? entries.slice() : [];
    let bounds = null;
    let fontSize = 0;
    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index];
      bounds = mergeBounds(bounds, entry && entry.bounds ? entry.bounds : null);
      fontSize = Math.max(fontSize, numeric(entry && entry.fontSize));
    }
    return {
      role: role,
      entries: list,
      bounds: bounds,
      fontSize: fontSize,
    };
  }

  function sortHeroTextGroupsByPlan(groups, plan) {
    const list = Array.isArray(groups) ? groups.slice() : [];
    const preferred = plan && plan.textGroupRoles && Array.isArray(plan.textGroupRoles.order) ? plan.textGroupRoles.order : [];
    if (preferred.length === 0 || list.length <= 1) {
      return list;
    }
    return list.sort((left, right) => {
      const leftIndex = preferred.indexOf(string(left && left.role, "").toLowerCase());
      const rightIndex = preferred.indexOf(string(right && right.role, "").toLowerCase());
      const normalizedLeft = leftIndex >= 0 ? leftIndex : 999;
      const normalizedRight = rightIndex >= 0 ? rightIndex : 999;
      if (normalizedLeft !== normalizedRight) {
        return normalizedLeft - normalizedRight;
      }
      return compareTemplateReadingOrder(left, right);
    });
  }

  function isHeroSubtitleCandidate(entry, headlineEntry) {
    if (!entry) {
      return false;
    }
    const subtitleFloor = Math.max(18, Math.round(numeric(headlineEntry && headlineEntry.fontSize) * 0.28));
    return numeric(entry.fontSize) >= subtitleFloor || numeric(entry.textLength) <= 72;
  }

  async function createHeroTextGroupClone(group, overlayWidth, state, plan) {
    if (!group || !Array.isArray(group.entries) || group.entries.length === 0) {
      return null;
    }

    const clone = cloneSourceNodeForDraft(group.entries[0].node);
    if (!clone || clone.type !== "TEXT") {
      return null;
    }

    unlockNodeTree(clone);
    normalizeTopLevelChildForFlow(clone);
    try {
      clone.name = `hero-copy-${string(group.role, "text")}`;
    } catch (error) {}
    await prepareHeroTextCloneForOverlay(
      clone,
      overlayWidth,
      state,
      group.role,
      mergeHeroCopyGroupText(group.entries, shouldPreserveHeroGroupLineBreaks(group.entries, plan))
    );
    return clone;
  }

  function shouldPreserveHeroGroupLineBreaks(entries, plan) {
    if (plan && plan.textLayoutGuidance && plan.textLayoutGuidance.preserveLineBreaks === true) {
      return true;
    }
    const list = Array.isArray(entries) ? entries : [];
    for (let index = 0; index < list.length; index += 1) {
      if (countDraftTextLines(list[index] && list[index].node) > 1) {
        return true;
      }
    }
    return false;
  }

  function mergeHeroCopyGroupText(entries, preserveLineBreaks) {
    const parts = [];
    const list = Array.isArray(entries) ? entries : [];
    for (let index = 0; index < list.length; index += 1) {
      const rawText = string(list[index] && list[index].node && list[index].node.characters, "").trim();
      const text = preserveLineBreaks ? rawText.replace(/\r\n/g, "\n") : rawText.replace(/\s+/g, " ");
      if (!text) {
        continue;
      }
      parts.push(text.trim());
    }
    return parts.join(preserveLineBreaks ? "\n" : " ").trim();
  }

  async function prepareHeroTextCloneForOverlay(node, contentWidth, state, role, mergedText) {
    if (!node) {
      return;
    }

    if (node.type === "TEXT") {
      await loadFontsForTextNode(node);
      if (mergedText && typeof node.characters === "string") {
        try {
          node.characters = mergedText;
        } catch (error) {}
      }
      try {
        if ("textAutoResize" in node) {
          node.textAutoResize = "HEIGHT";
        }
      } catch (error) {}
      try {
        if ("textAlignHorizontal" in node) {
          node.textAlignHorizontal = "CENTER";
        }
      } catch (error) {}
      await fitHeroTextNodeToPreset(node, contentWidth, role);
      return;
    }

    prepareTextCloneForTemplate(node, contentWidth, state);
  }

  async function fitHeroTextNodeToPreset(node, contentWidth, role) {
    if (!node || node.type !== "TEXT") {
      return;
    }

    const targetWidth = getHeroTextTargetWidth(role, contentWidth);
    const targetSize = getHeroTextTargetFontSize(node, role, targetWidth);
    if (targetSize > 0) {
      setTextNodeFontSize(node, targetSize);
    }

    forceFitTextNodeToWidth(node, targetWidth);
    let fontSize = getTemplateTextSize(node);
    for (let index = 0; index < 12; index += 1) {
      if (!heroTextExceedsLineCap(node, role)) {
        break;
      }
      fontSize = Math.max(10, fontSize - (role === "body" ? 1 : 2));
      setTextNodeFontSize(node, fontSize);
      forceFitTextNodeToWidth(node, targetWidth);
    }
  }

  function getHeroTextTargetWidth(role, contentWidth) {
    if (role === "body") {
      return Math.max(220, Math.round(contentWidth * 0.92));
    }
    if (role === "headline") {
      return Math.max(240, Math.round(contentWidth * 0.96));
    }
    return Math.max(220, Math.round(contentWidth * 0.9));
  }

  function getHeroTextTargetFontSize(node, role, contentWidth) {
    const current = getTemplateTextSize(node);
    if (!current) {
      return 0;
    }
    if (role === "headline") {
      return clamp(Math.round(Math.min(current * 0.9, contentWidth * 0.29)), 64, 108);
    }
    if (role === "subtitle") {
      return clamp(Math.round(Math.min(current * 0.92, contentWidth * 0.11)), 28, 42);
    }
    if (role === "body") {
      return clamp(Math.round(Math.min(current * 0.96, contentWidth * 0.072)), 18, 26);
    }
    return clamp(Math.round(Math.min(current * 0.96, contentWidth * 0.09)), 22, 34);
  }

  function heroTextExceedsLineCap(node, role) {
    const bounds = getNodeBounds(node);
    const fontSize = getTemplateTextSize(node);
    if (!bounds || !fontSize) {
      return false;
    }
    const maxHeight =
      role === "headline"
        ? fontSize * 2.7
        : role === "subtitle"
        ? fontSize * 2.6
        : role === "body"
        ? fontSize * 6.6
        : fontSize * 2.8;
    return numeric(bounds.height) > maxHeight;
  }

  function setTextNodeFontSize(node, nextSize) {
    if (!node || node.type !== "TEXT" || !nextSize) {
      return false;
    }
    try {
      if (typeof node.fontSize === "number" && node.fontSize !== figma.mixed) {
        node.fontSize = nextSize;
        return true;
      }
      if (typeof node.setRangeFontSize === "function" && typeof node.characters === "string") {
        node.setRangeFontSize(0, node.characters.length, nextSize);
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  async function fitHeroOverlayFrameToBounds(overlay, overlayWidth, maxOverlayHeight) {
    const initialBounds = getNodeBounds(overlay);
    if (initialBounds && numeric(initialBounds.height) <= maxOverlayHeight) {
      return true;
    }

    const textNodes = [];
    collectTextNodes(overlay, textNodes);
    for (let step = 0; step < 10; step += 1) {
      let changed = false;
      for (let index = 0; index < textNodes.length; index += 1) {
        const node = textNodes[index];
        const role = deriveHeroRoleFromTextNode(node);
        const current = getTemplateTextSize(node);
        const minimum = role === "headline" ? 56 : role === "subtitle" ? 24 : role === "body" ? 16 : 20;
        if (!current || current <= minimum) {
          continue;
        }

        await loadFontsForTextNode(node);
        if (setTextNodeFontSize(node, Math.max(minimum, current - (role === "body" ? 1 : 2)))) {
          forceFitTextNodeToWidth(node, getHeroTextTargetWidth(role, overlayWidth));
          changed = true;
        }
      }

      const nextBounds = getNodeBounds(overlay);
      if (nextBounds && numeric(nextBounds.height) <= maxOverlayHeight) {
        return true;
      }
      if (!changed) {
        break;
      }
    }

    const finalBounds = getNodeBounds(overlay);
    return !!finalBounds && numeric(finalBounds.height) <= maxOverlayHeight;
  }

  function deriveHeroRoleFromTextNode(node) {
    const name = safeName(node).toLowerCase();
    if (name.indexOf("headline") >= 0) {
      return "headline";
    }
    if (name.indexOf("subtitle") >= 0) {
      return "subtitle";
    }
    if (name.indexOf("body") >= 0) {
      return "body";
    }
    return "eyebrow";
  }

  function forceFitTextNodeToWidth(node, contentWidth) {
    if (!node || node.type !== "TEXT" || typeof node.resize !== "function") {
      return false;
    }

    const bounds = getNodeBounds(node);
    const height = bounds ? Math.max(24, numeric(bounds.height)) : Math.max(24, numeric(node.height));
    try {
      node.resize(Math.max(1, Math.round(contentWidth)), Math.max(24, Math.round(height)));
      return true;
    } catch (error) {
      return fitTextNodeToWidth(node, contentWidth);
    }
  }

  function boundsContain(outer, inner, padding) {
    if (!outer || !inner) {
      return false;
    }
    const inset = numeric(padding);
    const outerLeft = numeric(outer.x) - inset;
    const outerTop = numeric(outer.y) - inset;
    const outerRight = numeric(outer.x) + numeric(outer.width) + inset;
    const outerBottom = numeric(outer.y) + numeric(outer.height) + inset;
    const innerLeft = numeric(inner.x);
    const innerTop = numeric(inner.y);
    const innerRight = numeric(inner.x) + numeric(inner.width);
    const innerBottom = numeric(inner.y) + numeric(inner.height);
    return innerLeft >= outerLeft && innerTop >= outerTop && innerRight <= outerRight && innerBottom <= outerBottom;
  }

  function appendHeroAccentToMediaFrame(sourceVisual, mediaFrame, targetWidth, targetHeight, state, plan) {
    const entry = sourceVisual && sourceVisual.node ? sourceVisual : null;
    const sourceNode = entry ? entry.node : sourceVisual;
    const clone = cloneSourceNodeForDraft(sourceNode);
    if (!clone) {
      return false;
    }

    unlockNodeTree(clone);
    normalizeTopLevelChildForFlow(clone);
    const accentWidth = Math.max(120, Math.round(targetWidth * 0.54));
    const accentHeight = Math.max(100, Math.round(targetHeight * 0.42));
    const policy = resolveVisualPolicyForEntry(plan, entry, string(entry && entry.semanticRole, "") || "supporting");
    const scaleResult = applyVisualPolicyScale(clone, accentWidth, accentHeight, state, policy);

    try {
      mediaFrame.appendChild(clone);
      writeDraftVisualPolicyPluginData(clone, entry, policy, scaleResult);
      positionCloneByVisualPolicy(clone, targetWidth, targetHeight, {
        horizontalBias: "right",
        verticalBias: "bottom",
      });
      return true;
    } catch (error) {
      try {
        clone.remove();
      } catch (removeError) {}
      return false;
    }
  }

  function appendHeroBackgroundToMediaFrame(sourceVisual, mediaFrame, targetWidth, targetHeight, state, plan) {
    const entry = sourceVisual && sourceVisual.node ? sourceVisual : null;
    const sourceNode = entry ? entry.node : sourceVisual;
    const clone = cloneSourceNodeForDraft(sourceNode);
    if (!clone) {
      return false;
    }

    unlockNodeTree(clone);
    normalizeTopLevelChildForFlow(clone);
    const policy = resolveVisualPolicyForEntry(plan, entry, "background");
    const scaleResult = applyVisualPolicyScale(clone, targetWidth, targetHeight, state, policy);

    try {
      mediaFrame.appendChild(clone);
      writeDraftVisualPolicyPluginData(mediaFrame, entry, policy, scaleResult);
      writeDraftVisualPolicyPluginData(clone, entry, policy, scaleResult);
      positionCloneByVisualPolicy(clone, targetWidth, targetHeight, policy);
      return true;
    } catch (error) {
      try {
        clone.remove();
      } catch (removeError) {}
      return false;
    }
  }

  function positionHeroCompositeClone(clone, sourceNode, candidates, plan, targetWidth, targetHeight) {
    const sourceBounds = getNodeBounds(sourceNode);
    const cloneBounds = getNodeBounds(clone);
    if (!sourceBounds || !cloneBounds) {
      centerCloneWithinFrame(clone, targetWidth, targetHeight);
      return;
    }

    const scaleX = numeric(cloneBounds.width) / Math.max(1, numeric(sourceBounds.width));
    const scaleY = numeric(cloneBounds.height) / Math.max(1, numeric(sourceBounds.height));
    const cropPriority = string(plan && plan.cropPriority, "balanced");
    const desiredCenter = getHeroDesiredCenter(cropPriority, targetWidth, targetHeight, plan, priorityToHeroTarget(cropPriority));
    const focalRect = computeHeroFocalRect(sourceNode, candidates, plan, sourceBounds);

    if (!focalRect) {
      positionCloneByHeroAnchor(clone, cropPriority, targetWidth, targetHeight, plan, priorityToHeroTarget(cropPriority));
      return;
    }

    const focalCenterX = (numeric(focalRect.x) + numeric(focalRect.width) / 2) * scaleX;
    const focalCenterY = (numeric(focalRect.y) + numeric(focalRect.height) / 2) * scaleY;
    const minX = Math.min(0, Math.round(targetWidth - numeric(clone.width)));
    const minY = Math.min(0, Math.round(targetHeight - numeric(clone.height)));
    const x = clamp(Math.round(desiredCenter.x - focalCenterX), minX, 0);
    const y = clamp(Math.round(desiredCenter.y - focalCenterY), minY, 0);

    try {
      clone.x = x;
      clone.y = y;
    } catch (error) {
      centerCloneWithinFrame(clone, targetWidth, targetHeight);
    }
  }

  function computeHeroFocalRect(sourceNode, candidates, plan, sourceBounds) {
    const targets = Array.isArray(plan && plan.focalTargets) && plan.focalTargets.length > 0 ? plan.focalTargets : ["headline", "product"];
    const rects = [];

    for (let index = 0; index < targets.length; index += 1) {
      const rect = getHeroTargetRect(targets[index], candidates, sourceBounds);
      if (rect) {
        rects.push(rect);
      }
    }

    if (rects.length === 0) {
      const priorityRect = getHeroTargetRect(priorityToHeroTarget(string(plan && plan.cropPriority, "balanced")), candidates, sourceBounds);
      return priorityRect;
    }

    let merged = rects[0];
    for (let index = 1; index < rects.length; index += 1) {
      merged = mergeBounds(merged, rects[index]);
    }
    return merged;
  }

  function getHeroTargetRect(target, candidates, sourceBounds) {
    if (!target || !sourceBounds) {
      return null;
    }

    if (target === "headline") {
      return convertEntriesToRelativeBounds(pickHeroTextCandidates(candidates.textNodes).slice(0, 2), sourceBounds);
    }
    if (target === "cta") {
      return convertEntriesToRelativeBounds(pickCtaTextCandidates(candidates.textNodes, pickHeroTextCandidates(candidates.textNodes).slice(0, 2)), sourceBounds);
    }
    if (target === "logo") {
      return convertEntriesToRelativeBounds(filterTemplateEntriesByName(candidates.textNodes, ["logo", "lg", "brand"]), sourceBounds);
    }
    if (target === "product") {
      return convertEntryToRelativeBounds(pickHeroVisualFocusCandidate(candidates.visualNodes, "product", sourceBounds), sourceBounds);
    }
    if (target === "person") {
      return convertEntryToRelativeBounds(pickHeroVisualFocusCandidate(candidates.visualNodes, "person", sourceBounds), sourceBounds);
    }
    return null;
  }

  function pickHeroVisualFocusCandidate(candidates, role, sourceBounds) {
    const list = Array.isArray(candidates) ? candidates.slice() : [];
    let best = null;
    let bestScore = 0;

    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index];
      if (!entry || !entry.bounds || entry.mirrored) {
        continue;
      }
      const areaRatio = (numeric(entry.bounds.width) * numeric(entry.bounds.height)) / Math.max(1, numeric(sourceBounds.width) * numeric(sourceBounds.height));
      if (areaRatio >= 0.72) {
        continue;
      }

      const corpus = safeName(entry.node).toLowerCase();
      const semanticRole = normalizeVisualSemanticRole(string(entry.semanticRole, ""));
      let score = 0;
      if (role === "product") {
        if (semanticRole === "product") {
          score += 1.4;
        }
        if (containsAny(corpus, ["refrigerator", "fridge", "instaview", "product", "oled", "tv", "monitor", "phone", "device"])) {
          score += 1;
        }
        score += 1 - Math.min(1, numeric(entry.bounds.x) / Math.max(1, numeric(sourceBounds.width)));
      } else if (role === "person") {
        if (semanticRole === "person") {
          score += 1.4;
        }
        if (containsAny(corpus, ["person", "model", "woman", "man", "people", "hand", "face", "arm"])) {
          score += 1;
        }
        score += Math.min(1, (numeric(entry.bounds.x) + numeric(entry.bounds.width)) / Math.max(1, numeric(sourceBounds.width)));
      }
      score += numeric(entry.score) / 1000000;
      if (score > bestScore) {
        best = entry;
        bestScore = score;
      }
    }

    return bestScore > 0.4 ? best : null;
  }

  function convertEntriesToRelativeBounds(entries, sourceBounds) {
    const list = Array.isArray(entries) ? entries : [];
    let merged = null;
    for (let index = 0; index < list.length; index += 1) {
      const next = convertEntryToRelativeBounds(list[index], sourceBounds);
      if (!next) {
        continue;
      }
      merged = merged ? mergeBounds(merged, next) : next;
    }
    return merged;
  }

  function convertEntryToRelativeBounds(entry, sourceBounds) {
    if (!entry || !entry.bounds || !sourceBounds) {
      return null;
    }
    return {
      x: round(numeric(entry.bounds.x) - numeric(sourceBounds.x)),
      y: round(numeric(entry.bounds.y) - numeric(sourceBounds.y)),
      width: round(numeric(entry.bounds.width)),
      height: round(numeric(entry.bounds.height)),
    };
  }

  function filterTemplateEntriesByName(entries, keywords) {
    const list = Array.isArray(entries) ? entries : [];
    const out = [];
    for (let index = 0; index < list.length; index += 1) {
      const corpus = safeName(list[index].node).toLowerCase();
      if (containsAny(corpus, keywords)) {
        out.push(list[index]);
      }
    }
    return out;
  }

  function priorityToHeroTarget(priority) {
    if (priority === "headline-first") {
      return "headline";
    }
    if (priority === "product-first") {
      return "product";
    }
    if (priority === "person-first") {
      return "person";
    }
    return "headline";
  }

  function getHeroDesiredCenter(priority, targetWidth, targetHeight, plan, role) {
    const horizontalBias = resolveVisualHorizontalBias(plan, role || "");
    const verticalBias = resolveVisualVerticalBias(plan, role || "");
    const fallbackX = horizontalBias === "left" ? 0.34 : horizontalBias === "right" ? 0.66 : 0.5;
    const fallbackY = verticalBias === "top" ? 0.28 : verticalBias === "bottom" ? 0.64 : 0.46;
    if (priority === "headline-first") {
      return { x: Math.round(targetWidth * 0.5), y: Math.round(targetHeight * 0.3) };
    }
    if (priority === "product-first") {
      return { x: Math.round(targetWidth * (horizontalBias === "right" ? 0.58 : 0.38)), y: Math.round(targetHeight * 0.55) };
    }
    if (priority === "person-first") {
      return { x: Math.round(targetWidth * (horizontalBias === "left" ? 0.46 : 0.65)), y: Math.round(targetHeight * 0.48) };
    }
    return { x: Math.round(targetWidth * fallbackX), y: Math.round(targetHeight * fallbackY) };
  }

  function positionCloneByHeroAnchor(clone, priority, targetWidth, targetHeight, plan, role) {
    const cloneWidth = numeric(clone && clone.width);
    const cloneHeight = numeric(clone && clone.height);
    const minX = Math.min(0, Math.round(targetWidth - cloneWidth));
    const minY = Math.min(0, Math.round(targetHeight - cloneHeight));
    const horizontalBias = resolveVisualHorizontalBias(plan, role || "");
    const verticalBias = resolveVisualVerticalBias(plan, role || "");
    let x = horizontalBias === "left" ? minX : horizontalBias === "right" ? 0 : Math.round((targetWidth - cloneWidth) / 2);
    let y = verticalBias === "top" ? minY : verticalBias === "bottom" ? 0 : Math.round((targetHeight - cloneHeight) / 2);

    if (priority === "product-first") {
      x = horizontalBias === "right" ? 0 : minX;
      y = Math.round((targetHeight - cloneHeight) * 0.55);
    } else if (priority === "person-first") {
      x = horizontalBias === "left" ? minX : 0;
      y = Math.round((targetHeight - cloneHeight) * 0.45);
    } else if (priority === "headline-first") {
      x = Math.round((targetWidth - cloneWidth) / 2);
      y = minY;
    }

    try {
      clone.x = clamp(x, minX, 0);
      clone.y = clamp(y, minY, 0);
    } catch (error) {
      centerCloneWithinFrame(clone, targetWidth, targetHeight);
    }
  }

  function centerCloneWithinFrame(clone, targetWidth, targetHeight) {
    try {
      clone.x = Math.round((targetWidth - numeric(clone.width)) / 2);
      clone.y = Math.round((targetHeight - numeric(clone.height)) / 2);
    } catch (error) {}
  }

  async function buildPromoTemplateSection(sourceSection, candidates, contentWidth, state, plan) {
    const padding = plan && typeof plan.padding === "number" ? plan.padding : 16;
    const gap = plan && typeof plan.gap === "number" ? plan.gap : 12;
    const innerWidth = Math.max(120, contentWidth - padding * 2);
    const frame = createTemplateSectionFrame(`${safeName(sourceSection)} / promo-template`, contentWidth, gap, padding, true, sourceSection);
    const visualCandidate = choosePromoVisualCandidate(candidates, sourceSection, plan);
    const filteredTextNodes = filterTextEntriesForAiPlan(candidates.textNodes, plan && plan.aiPlan, "promo");
    const allText = pickPromoTextCandidates(filteredTextNodes);
    const roleBuckets = buildTemplateTextRoleBuckets(allText, "promo");
    const usedNodeIds = {};
    const fallbackMeta = pickPromoMetaCandidates(allText);
    const metaText = resolveTemplateRoleEntries(roleBuckets, plan, "meta", fallbackMeta, 2, usedNodeIds);
    const fallbackHeading = pickPromoHeadingCandidates(allText, metaText);
    const headingText = resolveTemplateRoleEntries(roleBuckets, plan, "headline", fallbackHeading, 2, usedNodeIds);
    const subtitleText = resolveTemplateRoleEntries(roleBuckets, plan, "subtitle", [], 2, usedNodeIds);
    const fallbackBody = pickPromoBodyCandidates(allText, metaText, headingText.concat(subtitleText));
    const bodyText = resolveTemplateRoleEntries(roleBuckets, plan, "body", fallbackBody, 4, usedNodeIds);
    const ctaFallback = pickCtaTextCandidates(allText, headingText.concat(subtitleText, bodyText));
    const ctaText = resolveTemplateRoleEntries(roleBuckets, plan, "cta", ctaFallback, 1, usedNodeIds);
    const textAlignment = string(plan && plan.textLayoutGuidance && plan.textLayoutGuidance.alignment, "center");
    const reflowPattern = string(plan && plan.reflowPattern, "");
    const heightBudget = plan && plan.heightBudget && typeof plan.heightBudget === "object" ? plan.heightBudget : null;
    const textFirst =
      !plan ||
      plan.contentPriority === "text-first" ||
      plan.visualFirst === false ||
      !!(heightBudget && heightBudget.preferVisualAfterText) ||
      reflowPattern === "meta-title-body-product" ||
      reflowPattern === "horizontal-to-vertical";
    const placeVisualAfterText = shouldPlaceTemplateVisualAfterText(plan, "promo", textFirst);

    const promoTextBlocks = {
      meta: metaText,
      headline: headingText,
      subtitle: subtitleText,
      body: bodyText,
      cta: ctaText,
    };
    const orderedRoles = buildOrderedTemplateTextRoles(plan, ["meta", "headline", "subtitle", "body", "cta"]);
    const metaOnlyLeft = textAlignment === "center" && !textFirst ? "left" : textAlignment;

    for (let roleIndex = 0; roleIndex < orderedRoles.length; roleIndex += 1) {
      const role = orderedRoles[roleIndex];
      if (shouldDropTemplateTextRole(role, plan)) {
        continue;
      }
      const entries = promoTextBlocks[role];
      if (!Array.isArray(entries) || entries.length === 0) {
        continue;
      }
      const roleWidth = getTemplateRoleContentWidth(role, innerWidth, plan && plan.textLayoutGuidance);
      const blockAlignment = role === "meta" ? metaOnlyLeft : textAlignment;
      const blockGap = getTemplateRoleGap(role, plan && plan.compactText);
      const block = createTemplateSectionFrame(`promo-${role}`, innerWidth, blockGap, 0, false, null);
      await appendTextCandidatesToStack(entries, block, roleWidth, state, entries.length, role, plan && plan.textLayoutGuidance, "promo");
      finalizeTemplateTextStack(block, roleWidth, blockAlignment);
      if (Array.isArray(block.children) && block.children.length > 0) {
        frame.appendChild(block);
      } else {
        try {
          block.remove();
        } catch (error) {}
      }
    }

    if (visualCandidate) {
      const compactProductFigure =
        shouldUseCompactPromoVisual(plan, textFirst) || !!(heightBudget && heightBudget.preferExpandedText && numeric(heightBudget.mediaShare) <= 0.34);
      const mediaWidth = compactProductFigure ? getCompactPromoVisualWidth(innerWidth, plan) : innerWidth;
      const mediaHeight = compactProductFigure
        ? getCompactPromoVisualHeight(visualCandidate, mediaWidth, plan)
        : resolveSectionBudgetMediaHeight(innerWidth, plan, plan && plan.mediaRatio ? plan.mediaRatio : 0.82, 180, 360);
      const mediaFrame = createTemplateMediaFrame("promo-media", mediaWidth, mediaHeight);
      if (compactProductFigure) {
        configureCompactTemplateVisualFrame(mediaFrame);
      }
      if (appendVisualCandidateToMediaFrame(visualCandidate, mediaFrame, mediaWidth, mediaHeight, state, plan)) {
        insertTemplateVisualFrame(frame, mediaFrame, placeVisualAfterText);
      } else {
        try {
          mediaFrame.remove();
        } catch (error) {}
      }
    }

    return Array.isArray(frame.children) && frame.children.length > 0 ? frame : null;
  }

  async function buildArticleTemplateSection(sourceSection, candidates, contentWidth, state, plan) {
    const frame = createTemplateSectionFrame(
      `${safeName(sourceSection)} / article-template`,
      contentWidth,
      plan && plan.gap ? plan.gap : 12,
      plan && plan.padding ? plan.padding : 0,
      true,
      sourceSection
    );
    const leadingText = pickArticleHeadingCandidates(candidates.textNodes);
    const bodyText = pickArticleBodyCandidates(candidates.textNodes, leadingText);
    const visualCandidate = choosePrimaryVisualCandidate(candidates, sourceSection, plan);
    const innerWidth = Math.max(120, contentWidth - (plan && typeof plan.padding === "number" ? plan.padding * 2 : 0));
    const textAlignment = string(plan && plan.textLayoutGuidance && plan.textLayoutGuidance.alignment, "left");
    const heightBudget = plan && plan.heightBudget && typeof plan.heightBudget === "object" ? plan.heightBudget : null;
    const preferVisualAfterText = !!(heightBudget && heightBudget.preferVisualAfterText);
    const placeVisualAfterText = shouldPlaceTemplateVisualAfterText(plan, "article", preferVisualAfterText);

    if (visualCandidate && (!plan || plan.visualFirst !== false) && !placeVisualAfterText) {
      const mediaHeight = resolveSectionBudgetMediaHeight(innerWidth, plan, plan && plan.mediaRatio ? plan.mediaRatio : 0.7, 180, 320);
      const mediaFrame = createTemplateMediaFrame("article-media", innerWidth, mediaHeight);
      if (appendVisualCandidateToMediaFrame(visualCandidate, mediaFrame, contentWidth, mediaHeight, state, plan)) {
        insertTemplateVisualFrame(frame, mediaFrame, false);
      } else {
        try {
          mediaFrame.remove();
        } catch (error) {}
      }
    }

    if (leadingText.length > 0) {
      const headingStack = createTemplateSectionFrame("article-heading", innerWidth, 8, 0, false, null);
      await appendTextCandidatesToStack(leadingText, headingStack, innerWidth, state, 3, "headline", plan && plan.textLayoutGuidance, "article");
      finalizeTemplateTextStack(headingStack, innerWidth, textAlignment);
      if (Array.isArray(headingStack.children) && headingStack.children.length > 0) {
        frame.appendChild(headingStack);
      } else {
        try {
          headingStack.remove();
        } catch (error) {}
      }
    }

    if (bodyText.length > 0) {
      const bodyStack = createTemplateSectionFrame("article-body", innerWidth, 8, 0, false, null);
      await appendTextCandidatesToStack(bodyText, bodyStack, innerWidth, state, 4, "body", plan && plan.textLayoutGuidance, "article");
      finalizeTemplateTextStack(bodyStack, innerWidth, textAlignment);
      if (Array.isArray(bodyStack.children) && bodyStack.children.length > 0) {
        frame.appendChild(bodyStack);
      } else {
        try {
          bodyStack.remove();
        } catch (error) {}
      }
    }

    if (visualCandidate && placeVisualAfterText) {
      const mediaHeight = resolveSectionBudgetMediaHeight(innerWidth, plan, plan && plan.mediaRatio ? plan.mediaRatio : 0.7, 180, 320);
      const mediaFrame = createTemplateMediaFrame("article-media", innerWidth, mediaHeight);
      if (appendVisualCandidateToMediaFrame(visualCandidate, mediaFrame, innerWidth, mediaHeight, state, plan)) {
        insertTemplateVisualFrame(frame, mediaFrame, true);
      } else {
        try {
          mediaFrame.remove();
        } catch (error) {}
      }
    }

    return Array.isArray(frame.children) && frame.children.length > 0 ? frame : null;
  }

  function shouldPlaceTemplateVisualAfterText(plan, builderType, fallback) {
    const anchor = normalizeTemplateVisualAnchor(string(plan && plan.visualAnchor, string(plan && plan.visualRole && plan.visualRole.anchor, "")));
    if (anchor === "bottom") {
      return true;
    }
    if (anchor === "top") {
      return false;
    }
    if (builderType === "hero") {
      return !!fallback;
    }
    const textPriorityWins =
      prioritizesTextContentOverImages(plan) || prioritizesTextScaleOverImages(plan) || prioritizesTextAlignOverImages(plan);
    return !!fallback || textPriorityWins || string(plan && plan.contentPriority, "") === "text-first";
  }

  function insertTemplateVisualFrame(frame, mediaFrame, appendAfterText) {
    if (!frame || !mediaFrame) {
      return false;
    }
    try {
      if (appendAfterText || !Array.isArray(frame.children) || frame.children.length === 0) {
        frame.appendChild(mediaFrame);
      } else {
        frame.insertChild(0, mediaFrame);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function resolveHeroCopyTextEntries(sourceSection, candidates, overlayWidth, aiPlan) {
    const blockCandidate = findHeroCopyBlockCandidate(sourceSection, candidates);
    if (blockCandidate && blockCandidate.node) {
      return filterTextEntriesForAiPlan(collectHeroCopyTextEntries(blockCandidate.node, overlayWidth), aiPlan, "hero");
    }

    const filteredTextNodes = filterTextEntriesForAiPlan(
      candidates && Array.isArray(candidates.textNodes) ? candidates.textNodes : [],
      aiPlan,
      "hero"
    );
    const heroCandidates = pickHeroTextCandidates(filteredTextNodes);
    const fallback = [];
    const seen = {};
    for (let index = 0; index < heroCandidates.length; index += 1) {
      const entry = heroCandidates[index];
      const text = normalizeMeaningfulText(string(entry && entry.node && entry.node.characters, ""));
      const bounds = entry && entry.bounds ? entry.bounds : getNodeBounds(entry && entry.node);
      if (!text || !bounds || seen[text]) {
        continue;
      }
      seen[text] = true;
      fallback.push({
        node: entry.node,
        bounds: bounds,
        fontSize: numeric(entry && entry.fontSize) || getTemplateTextSize(entry && entry.node),
        textLength: text.length,
      });
      if (fallback.length >= 4) {
        break;
      }
    }
    return fallback.length >= 2 ? fallback.sort(compareTemplateReadingOrder) : [];
  }

  function createTemplateSectionFrame(name, width, gap, padding, styled, sourceSection) {
    const frame = figma.createFrame();
    frame.name = name;

    try {
      frame.layoutMode = "VERTICAL";
    } catch (error) {}
    try {
      frame.layoutWrap = "NO_WRAP";
    } catch (error) {}
    try {
      if ("primaryAxisSizingMode" in frame) {
        frame.primaryAxisSizingMode = "AUTO";
      }
    } catch (error) {}
    try {
      if ("counterAxisSizingMode" in frame) {
        frame.counterAxisSizingMode = "FIXED";
      }
    } catch (error) {}
    try {
      if ("itemSpacing" in frame) {
        frame.itemSpacing = gap;
      }
    } catch (error) {}
    try {
      if ("paddingLeft" in frame) {
        frame.paddingLeft = padding;
      }
      if ("paddingRight" in frame) {
        frame.paddingRight = padding;
      }
      if ("paddingTop" in frame) {
        frame.paddingTop = padding;
      }
      if ("paddingBottom" in frame) {
        frame.paddingBottom = padding;
      }
    } catch (error) {}
    try {
      if ("layoutSizingHorizontal" in frame) {
        frame.layoutSizingHorizontal = "FILL";
      }
    } catch (error) {}
    try {
      if ("layoutAlign" in frame) {
        frame.layoutAlign = "STRETCH";
      }
    } catch (error) {}
    try {
      if ("clipsContent" in frame) {
        frame.clipsContent = false;
      }
    } catch (error) {}

    if (styled && sourceSection) {
      applySectionTemplateStyle(frame, sourceSection);
    } else {
      try {
        frame.fills = [];
      } catch (error) {}
    }

    resizeNodeForDraft(frame, width, 100);
    return frame;
  }

  function applySectionTemplateStyle(frame, sourceSection) {
    const fills = clonePaintArrayForDraft(sourceSection && sourceSection.fills);
    if (fills.length > 0) {
      try {
        frame.fills = fills;
        return;
      } catch (error) {}
    }

    try {
      frame.fills = [];
    } catch (error) {}
  }

  function createTemplateMediaFrame(name, width, height) {
    const frame = figma.createFrame();
    frame.name = name;
    try {
      if ("clipsContent" in frame) {
        frame.clipsContent = true;
      }
    } catch (error) {}
    try {
      frame.fills = [];
    } catch (error) {}
    try {
      if ("layoutSizingHorizontal" in frame) {
        frame.layoutSizingHorizontal = "FILL";
      }
    } catch (error) {}
    try {
      if ("layoutAlign" in frame) {
        frame.layoutAlign = "STRETCH";
      }
    } catch (error) {}
    resizeNodeForDraft(frame, width, height);
    return frame;
  }

  function appendVisualCandidateToMediaFrame(sourceVisual, mediaFrame, targetWidth, targetHeight, state, plan) {
    const entry = sourceVisual && sourceVisual.node ? sourceVisual : null;
    const sourceNode = entry ? entry.node : sourceVisual;
    const clone = cloneSourceNodeForDraft(sourceNode);
    if (!clone) {
      return false;
    }

    unlockNodeTree(clone);
    normalizeTopLevelChildForFlow(clone);
    const policy = resolveVisualPolicyForEntry(plan, entry, "");
    const scaleResult = applyVisualPolicyScale(clone, targetWidth, targetHeight, state, policy);

    try {
      mediaFrame.appendChild(clone);
      writeDraftVisualPolicyPluginData(mediaFrame, entry, policy, scaleResult);
      writeDraftVisualPolicyPluginData(clone, entry, policy, scaleResult);
      positionCloneByVisualPolicy(clone, targetWidth, targetHeight, policy);
      return true;
    } catch (error) {
      try {
        clone.remove();
      } catch (removeError) {}
      return false;
    }
  }

  function scaleNodeToCoverFrame(node, targetWidth, targetHeight, state) {
    const bounds = getNodeBounds(node);
    const width = bounds ? numeric(bounds.width) : numeric(node && node.width);
    const height = bounds ? numeric(bounds.height) : numeric(node && node.height);
    if (!width || !height) {
      return false;
    }

    const scale = Math.max(targetWidth / width, targetHeight / height);
    if (!(scale > 0)) {
      return false;
    }

    let changed = false;
    if (typeof node.rescale === "function" && Math.abs(scale - 1) > 0.02) {
      try {
        node.rescale(scale);
        changed = true;
      } catch (error) {
        changed = false;
      }
    }

    if (!changed) {
      changed = resizeNodeForDraft(node, Math.round(width * scale), Math.round(height * scale));
    }

    if (changed) {
      state.scaledNodeCount += 1;
    }
    return changed;
  }

  function resolveVisualPolicyForEntry(plan, entry, fallbackRole) {
    const imagePolicy = plan && plan.imagePolicy && typeof plan.imagePolicy === "object" ? plan.imagePolicy : null;
    const role = normalizeVisualSemanticRole(string(entry && entry.semanticRole, "")) || normalizeVisualSemanticRole(fallbackRole) || "supporting";
    const trimTolerance = string(entry && entry.trimTolerance, role === "background" ? "high" : role === "supporting" ? "medium" : "low").toLowerCase();
    const compactMedia = !!(imagePolicy && imagePolicy.compactMedia);
    const prioritizeText = !!(imagePolicy && imagePolicy.prioritizeTextOverVisual);
    const allowBackgroundTrim = !imagePolicy || imagePolicy.allowBackgroundTrim !== false;
    const preserveTargets = Array.isArray(imagePolicy && imagePolicy.preserveTargets) ? imagePolicy.preserveTargets : [];
    let cropMode = "cover";
    if (role === "background") {
      cropMode = allowBackgroundTrim ? "cover" : "balanced-cover";
    } else if (role === "product" || role === "person" || role === "logo") {
      cropMode = prioritizeText || compactMedia ? "fit" : "balanced-cover";
    } else if (role === "decorative") {
      cropMode = compactMedia ? "fit" : "balanced-cover";
    } else if (prioritizeText && compactMedia) {
      cropMode = "fit";
    } else if (prioritizeText) {
      cropMode = "balanced-cover";
    }

    return {
      role: role,
      trimTolerance: trimTolerance,
      cropMode: cropMode,
      horizontalBias: resolveVisualHorizontalBias(plan, role),
      verticalBias: resolveVisualVerticalBias(plan, role),
      visualAnchor: string(imagePolicy && imagePolicy.visualAnchor, ""),
      allowBackgroundTrim: allowBackgroundTrim,
      preserveTargets: preserveTargets.slice(0),
      backgroundCropLimit: numeric(imagePolicy && imagePolicy.backgroundCropLimit) || 0.5,
      supportingCropLimit: numeric(imagePolicy && imagePolicy.supportingCropLimit) || 0.3,
      subjectCropLimit: numeric(imagePolicy && imagePolicy.subjectCropLimit) || 0.18,
    };
  }

  function resolveVisualHorizontalBias(plan, role) {
    const imagePolicy = plan && plan.imagePolicy && typeof plan.imagePolicy === "object" ? plan.imagePolicy : null;
    const cropPriority = string(imagePolicy && imagePolicy.cropPriority, "");
    const anchor = string(imagePolicy && imagePolicy.visualAnchor, "").toLowerCase();
    const explicit = normalizeVisualBias(imagePolicy && imagePolicy.horizontalBias, "center");
    if (anchor.indexOf("left") >= 0) {
      return "left";
    }
    if (anchor.indexOf("right") >= 0) {
      return "right";
    }
    if (role === "product" && cropPriority === "product-first" && explicit === "center") {
      return "left";
    }
    if (role === "person" && cropPriority === "person-first" && explicit === "center") {
      return "right";
    }
    return explicit || "center";
  }

  function resolveVisualVerticalBias(plan, role) {
    const imagePolicy = plan && plan.imagePolicy && typeof plan.imagePolicy === "object" ? plan.imagePolicy : null;
    const cropPriority = string(imagePolicy && imagePolicy.cropPriority, "");
    const anchor = string(imagePolicy && imagePolicy.visualAnchor, "").toLowerCase();
    const explicit = normalizeVisualBias(imagePolicy && imagePolicy.verticalBias, role === "background" ? "top" : "center");
    if (anchor.indexOf("top") >= 0) {
      return "top";
    }
    if (role === "background" && anchor === "bottom") {
      return "bottom";
    }
    if (anchor.indexOf("bottom") >= 0) {
      return "bottom";
    }
    if (cropPriority === "headline-first" && explicit === "center") {
      return "top";
    }
    return explicit || "center";
  }

  function applyVisualPolicyScale(node, targetWidth, targetHeight, state, policy) {
    const metrics = getCoverOverflowMetrics(node, targetWidth, targetHeight);
    const cropLimit = getVisualCropLimit(policy);
    const shouldFit =
      string(policy && policy.cropMode, "cover") === "fit" ||
      (string(policy && policy.cropMode, "cover") === "balanced-cover" && metrics.maxOverflow > cropLimit);
    const appliedCropMode = shouldFit ? "fit" : string(policy && policy.cropMode, "cover");
    const changed = shouldFit
      ? scaleNodeToFitBounds(node, targetWidth, targetHeight, state)
      : scaleNodeToCoverFrame(node, targetWidth, targetHeight, state);
    return {
      changed: changed,
      requestedCropMode: string(policy && policy.cropMode, "cover"),
      appliedCropMode: appliedCropMode,
      cropOverflow: shouldFit ? 0 : metrics.maxOverflow,
      cropLimit: cropLimit,
      horizontalBias: resolveVisualHorizontalBias({ imagePolicy: policy }, string(policy && policy.role, "")),
      verticalBias: resolveVisualVerticalBias({ imagePolicy: policy }, string(policy && policy.role, "")),
    };
  }

  function getVisualCropLimit(policy) {
    const role = normalizeVisualSemanticRole(string(policy && policy.role, ""));
    if (role === "background") {
      return numeric(policy && policy.backgroundCropLimit) || 0.5;
    }
    if (role === "supporting" || role === "decorative") {
      return numeric(policy && policy.supportingCropLimit) || 0.3;
    }
    return numeric(policy && policy.subjectCropLimit) || 0.18;
  }

  function getCoverOverflowMetrics(node, targetWidth, targetHeight) {
    const bounds = getNodeBounds(node);
    const width = bounds ? numeric(bounds.width) : numeric(node && node.width);
    const height = bounds ? numeric(bounds.height) : numeric(node && node.height);
    if (!(width > 0 && height > 0)) {
      return { overflowX: 0, overflowY: 0, maxOverflow: 0 };
    }
    const scale = Math.max(targetWidth / width, targetHeight / height);
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const overflowX = scaledWidth > 0 ? Math.max(0, scaledWidth - targetWidth) / scaledWidth : 0;
    const overflowY = scaledHeight > 0 ? Math.max(0, scaledHeight - targetHeight) / scaledHeight : 0;
    return {
      overflowX: overflowX,
      overflowY: overflowY,
      maxOverflow: Math.max(overflowX, overflowY),
    };
  }

  function positionCloneByVisualPolicy(clone, targetWidth, targetHeight, policy) {
    const horizontalBias = normalizeVisualBias(policy && policy.horizontalBias, "center");
    const verticalBias = normalizeVisualBias(policy && policy.verticalBias, "center");
    const cloneWidth = numeric(clone && clone.width);
    const cloneHeight = numeric(clone && clone.height);
    const minX = cloneWidth > targetWidth ? Math.min(0, Math.round(targetWidth - cloneWidth)) : 0;
    const maxX = cloneWidth > targetWidth ? 0 : Math.max(0, Math.round(targetWidth - cloneWidth));
    const minY = cloneHeight > targetHeight ? Math.min(0, Math.round(targetHeight - cloneHeight)) : 0;
    const maxY = cloneHeight > targetHeight ? 0 : Math.max(0, Math.round(targetHeight - cloneHeight));
    let x = horizontalBias === "left" ? minX : horizontalBias === "right" ? maxX : Math.round((targetWidth - cloneWidth) / 2);
    let y = verticalBias === "top" ? minY : verticalBias === "bottom" ? maxY : Math.round((targetHeight - cloneHeight) / 2);

    try {
      clone.x = clamp(x, minX, maxX);
      clone.y = clamp(y, minY, maxY);
    } catch (error) {
      centerCloneWithinFrame(clone, targetWidth, targetHeight);
    }
  }

  function scaleNodeToFitBounds(node, maxWidth, maxHeight, state) {
    const bounds = getNodeBounds(node);
    const width = bounds ? numeric(bounds.width) : numeric(node && node.width);
    const height = bounds ? numeric(bounds.height) : numeric(node && node.height);
    if (!width || !height) {
      return false;
    }

    const widthScale = maxWidth > 0 ? maxWidth / width : 1;
    const heightScale = maxHeight > 0 ? maxHeight / height : 1;
    const scale = Math.min(1, widthScale, heightScale);
    if (!(scale > 0)) {
      return false;
    }

    let changed = false;
    if (typeof node.rescale === "function" && Math.abs(scale - 1) > 0.02) {
      try {
        node.rescale(scale);
        changed = true;
      } catch (error) {
        changed = false;
      }
    }

    if (!changed && scale < 0.999) {
      changed = resizeNodeForDraft(node, Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)));
    }

    if (changed) {
      state.scaledNodeCount += 1;
    }
    return true;
  }

  async function appendTextCandidatesToStack(candidates, stackFrame, contentWidth, state, limit, defaultRole, textLayoutGuidance, builderType) {
    const source = Array.isArray(candidates) ? candidates.slice().sort(compareTemplateReadingOrder) : [];
    const list = [];
    for (let index = 0; index < source.length; index += 1) {
      if (source[index] && source[index].mirrored) {
        continue;
      }
      list.push(source[index]);
      if (list.length >= limit) {
        break;
      }
    }
    const baseGap = "itemSpacing" in stackFrame ? numeric(stackFrame.itemSpacing) : 0;
    const sourceBlockWidth = measureTextEntryCollectionWidth(list);
    if (list.length > 1) {
      setTemplateStackItemSpacing(stackFrame, 0);
    }
    for (let index = 0; index < list.length; index += 1) {
      const clone = cloneSourceNodeForDraft(list[index].node);
      if (!clone) {
        continue;
      }

      unlockNodeTree(clone);
      normalizeTopLevelChildForFlow(clone);
      const currentRole = resolveTemplateEntryRole(list[index], defaultRole, builderType);
      const nextRole = index < list.length - 1 ? resolveTemplateEntryRole(list[index + 1], defaultRole, builderType) : "";
      await prepareTextCloneForTemplate(clone, contentWidth, state, currentRole, textLayoutGuidance, builderType);
      try {
        stackFrame.appendChild(clone);
        if (index < list.length - 1) {
          appendTemplateStackSpacer(
            stackFrame,
            resolveScaledTextGapHeight(
              list[index],
              list[index + 1],
              clone,
              contentWidth,
              sourceBlockWidth,
              baseGap,
              currentRole,
              nextRole,
              textLayoutGuidance
            ),
            `text-gap-${index + 1}`
          );
        }
      } catch (error) {
        try {
          clone.remove();
        } catch (removeError) {}
      }
    }
  }

  function finalizeTemplateTextStack(stackFrame, contentWidth, alignment) {
    if (!stackFrame) {
      return;
    }
    const align = string(alignment, "left").toLowerCase() === "center" ? "CENTER" : "MIN";
    try {
      if ("counterAxisAlignItems" in stackFrame) {
        stackFrame.counterAxisAlignItems = align;
      }
    } catch (error) {}

    const textNodes = [];
    collectTextNodes(stackFrame, textNodes);
    for (let index = 0; index < textNodes.length; index += 1) {
      const node = textNodes[index];
      try {
        if ("textAlignHorizontal" in node) {
          node.textAlignHorizontal = align === "CENTER" ? "CENTER" : "LEFT";
        }
      } catch (error) {}
      forceFitTextNodeToWidth(node, contentWidth);
    }
  }

  function setTemplateStackItemSpacing(frame, gap) {
    if (!frame) {
      return;
    }
    try {
      if ("itemSpacing" in frame) {
        frame.itemSpacing = Math.max(0, Math.round(numeric(gap)));
      }
    } catch (error) {}
  }

  function appendTemplateStackSpacer(parent, height, name) {
    const gapHeight = Math.max(0, Math.round(numeric(height)));
    if (!parent || !(gapHeight > 0)) {
      return null;
    }

    const spacer = figma.createFrame();
    spacer.name = name || "text-gap";
    try {
      spacer.fills = [];
    } catch (error) {}
    try {
      if ("strokes" in spacer) {
        spacer.strokes = [];
      }
    } catch (error) {}
    try {
      if ("layoutSizingHorizontal" in spacer) {
        spacer.layoutSizingHorizontal = "FILL";
      }
    } catch (error) {}
    try {
      if ("layoutAlign" in spacer) {
        spacer.layoutAlign = "STRETCH";
      }
    } catch (error) {}
    try {
      if ("counterAxisSizingMode" in spacer) {
        spacer.counterAxisSizingMode = "FIXED";
      }
    } catch (error) {}
    try {
      if ("primaryAxisSizingMode" in spacer) {
        spacer.primaryAxisSizingMode = "FIXED";
      }
    } catch (error) {}
    resizeNodeForDraft(spacer, 1, gapHeight);

    try {
      parent.appendChild(spacer);
      return spacer;
    } catch (error) {
      try {
        spacer.remove();
      } catch (removeError) {}
      return null;
    }
  }

  function resolveScaledTextGapHeight(previousEntry, nextEntry, renderedNode, targetWidth, sourceBlockWidth, fallbackGap, previousRole, nextRole, textLayoutGuidance) {
    const fallback = Math.max(0, Math.round(numeric(fallbackGap)));
    const sourceGap = measureSourceTextVerticalGap(previousEntry, nextEntry);
    if (!(sourceGap > 0)) {
      const preferredGapRatio = resolvePreferredTextGapRatio(textLayoutGuidance, previousRole, nextRole);
      const renderedFontSize = getTemplateTextSize(renderedNode);
      if (preferredGapRatio > 0 && renderedFontSize > 0) {
        return Math.max(fallback, Math.round(renderedFontSize * preferredGapRatio));
      }
      return fallback;
    }

    const sourceFontSize =
      numeric(previousEntry && previousEntry.fontSize) ||
      numeric(nextEntry && nextEntry.fontSize) ||
      getTemplateTextSize(renderedNode) ||
      16;
    const renderedFontSize = getTemplateTextSize(renderedNode) || sourceFontSize;
    const preferredGapRatio = resolvePreferredTextGapRatio(textLayoutGuidance, previousRole, nextRole);
    const ratioGap =
      sourceFontSize > 0 && renderedFontSize > 0
        ? renderedFontSize * clamp(sourceGap / Math.max(1, sourceFontSize), 0.08, 1.8)
        : 0;
    const widthScaledGap =
      sourceBlockWidth > 0 && targetWidth > 0 ? sourceGap * clamp(targetWidth / Math.max(1, sourceBlockWidth), 0.22, 1.08) : 0;
    let resolvedGap = ratioGap > 0 && widthScaledGap > 0 ? ratioGap * 0.68 + widthScaledGap * 0.32 : ratioGap || widthScaledGap || fallback;
    if (preferredGapRatio > 0 && renderedFontSize > 0) {
      const preferredGap = renderedFontSize * preferredGapRatio;
      resolvedGap = resolvedGap > 0 ? preferredGap * 0.72 + resolvedGap * 0.28 : preferredGap;
    }
    const minGap = Math.max(2, fallback > 0 ? Math.min(fallback, 8) : 2);
    const maxGap = Math.max(minGap, Math.round(Math.max(renderedFontSize, sourceFontSize) * 0.92));
    resolvedGap = clamp(resolvedGap, minGap, maxGap);
    return Math.round(resolvedGap);
  }

  function resolvePreferredTextGapRatio(textLayoutGuidance, previousRole, nextRole) {
    const map =
      textLayoutGuidance &&
      textLayoutGuidance.gapAfterRatioByRole &&
      typeof textLayoutGuidance.gapAfterRatioByRole === "object"
        ? textLayoutGuidance.gapAfterRatioByRole
        : null;
    if (!map) {
      return 0;
    }

    const previous = normalizeAiTextClusterRole(previousRole);
    const next = normalizeAiTextClusterRole(nextRole);
    const fallbackPrevious = previous === "eyebrow" ? "meta" : previous;
    const fallbackNext = next === "eyebrow" ? "meta" : next;
    return (
      numeric(previous && map[previous]) ||
      numeric(fallbackPrevious && map[fallbackPrevious]) ||
      numeric(next && map[next]) ||
      numeric(fallbackNext && map[fallbackNext]) ||
      0
    );
  }

  function measureSourceTextVerticalGap(previousEntry, nextEntry) {
    const previousBounds = previousEntry && previousEntry.bounds ? previousEntry.bounds : null;
    const nextBounds = nextEntry && nextEntry.bounds ? nextEntry.bounds : null;
    if (!previousBounds || !nextBounds) {
      return 0;
    }
    const previousBottom = numeric(previousBounds.y) + numeric(previousBounds.height);
    const nextTop = numeric(nextBounds.y);
    return Math.max(0, Math.round(nextTop - previousBottom));
  }

  function measureTextEntryCollectionWidth(entries) {
    const list = Array.isArray(entries) ? entries : [];
    let bounds = null;
    for (let index = 0; index < list.length; index += 1) {
      const entryBounds = list[index] && list[index].bounds ? list[index].bounds : null;
      bounds = mergeBounds(bounds, entryBounds);
    }
    return bounds ? numeric(bounds.width) : 0;
  }

  async function prepareTextCloneForTemplate(node, contentWidth, state, role, textLayoutGuidance, builderType) {
    if (!node) {
      return;
    }

    if (node.type === "TEXT") {
      await loadFontsForTextNode(node);
      try {
        if ("textAutoResize" in node) {
          node.textAutoResize = "HEIGHT";
        }
      } catch (error) {}
      applyTemplateTextGuidance(node, contentWidth, role, textLayoutGuidance, state, builderType);
      return;
    }

    fitSectionCloneToDraftWidth(node, contentWidth, state, builderType);
    prepareSectionCloneTreeForDraft(node, contentWidth, state, 0, builderType);
  }

  function fitTextNodeToWidth(node, contentWidth) {
    if (!node || node.type !== "TEXT" || typeof node.resize !== "function") {
      return false;
    }

    const bounds = getNodeBounds(node);
    const width = bounds ? numeric(bounds.width) : numeric(node.width);
    const height = bounds ? Math.max(24, numeric(bounds.height)) : Math.max(24, numeric(node.height));
    if (!width || width <= contentWidth * 1.02) {
      return false;
    }

    try {
      node.resize(Math.max(1, Math.round(contentWidth)), Math.max(24, Math.round(height)));
      return true;
    } catch (error) {
      return false;
    }
  }

  function choosePrimaryVisualCandidate(candidates, sourceSection, plan) {
    const list = candidates && Array.isArray(candidates.visualNodes) ? candidates.visualNodes.slice() : [];
    const sourceBounds = getNodeBounds(sourceSection);
    let best = null;
    let bestScore = 0;

    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index];
      if (!entry || entry.mirrored) {
        continue;
      }
      const score = scoreVisualCandidateForPlan(entry, sourceBounds, plan);
      if (score > bestScore) {
        best = entry;
        bestScore = score;
      }
    }

    return best || null;
  }

  function choosePromoVisualCandidate(candidates, sourceSection, plan) {
    const list = candidates && Array.isArray(candidates.visualNodes) ? candidates.visualNodes.slice() : [];
    const sourceBounds = getNodeBounds(sourceSection);
    let best = null;
    let bestScore = 0;

    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index];
      if (!entry || !entry.bounds || entry.mirrored) {
        continue;
      }
      const corpus = safeName(entry.node).toLowerCase();
      const areaRatio =
        sourceBounds && numeric(sourceBounds.width) * numeric(sourceBounds.height) > 0
          ? (numeric(entry.bounds.width) * numeric(entry.bounds.height)) / (numeric(sourceBounds.width) * numeric(sourceBounds.height))
          : 0;
      let score = 0;
      if (containsAny(corpus, ["refrigerator", "fridge", "instaview", "product", "oled", "tv", "monitor", "device"])) {
        score += 2.5;
      }
      if (containsAny(corpus, ["coupon", "discount", "badge", "offer", "copy"])) {
        score -= 1.5;
      }
      if (entry.hasImageFill) {
        score += 0.5;
      }
      if (areaRatio >= 0.06 && areaRatio <= 0.42) {
        score += 1;
      }
      score += scoreVisualCandidateForPlan(entry, sourceBounds, plan);
      if (score > bestScore) {
        best = entry;
        bestScore = score;
      }
    }

    return best || choosePrimaryVisualCandidate(candidates, sourceSection, plan);
  }

  function scoreVisualCandidateForPlan(entry, sourceBounds, plan) {
    if (!entry) {
      return 0;
    }
    const policy = plan && plan.imagePolicy && typeof plan.imagePolicy === "object" ? plan.imagePolicy : null;
    const role = normalizeVisualSemanticRole(string(entry.semanticRole, ""));
    const trimTolerance = string(entry.trimTolerance, "medium").toLowerCase();
    const preferredRole = normalizeVisualSemanticRole(string(policy && policy.preferredVisualRole, ""));
    const focalRole = normalizeVisualSemanticRole(string(policy && policy.focalRole, ""));
    const preserveTargets = Array.isArray(policy && policy.preserveTargets) ? policy.preserveTargets : [];
    const compactMedia = !!(policy && policy.compactMedia);
    const prioritizeText = !!(policy && policy.prioritizeTextOverVisual);
    const allowBackgroundTrim = !policy || policy.allowBackgroundTrim !== false;
    const areaRatio =
      numeric(entry.areaRatio) > 0
        ? numeric(entry.areaRatio)
        : sourceBounds && entry.bounds && numeric(sourceBounds.width) * numeric(sourceBounds.height) > 0
        ? (numeric(entry.bounds.width) * numeric(entry.bounds.height)) / (numeric(sourceBounds.width) * numeric(sourceBounds.height))
        : 0;
    let score = numeric(entry.score) / 1000000;

    if (preferredRole && role === preferredRole) {
      score += 2.2;
    }
    if (focalRole && role === focalRole) {
      score += 1.6;
    }
    if (preserveTargets.indexOf("product") >= 0 && role === "product") {
      score += 1.6;
    }
    if (preserveTargets.indexOf("person") >= 0 && role === "person") {
      score += 1.6;
    }
    if (preserveTargets.indexOf("logo") >= 0 && role === "logo") {
      score += 1.4;
    }
    if (role === "decorative") {
      score -= 2.8;
    }
    if (role === "background" && !allowBackgroundTrim) {
      score -= 1.2;
    }
    if (compactMedia && role === "background") {
      score -= 1.6;
    }
    if (compactMedia && (role === "product" || role === "person" || role === "logo")) {
      score += 0.9;
    }
    if (prioritizeText && role === "background" && areaRatio > 0.54) {
      score -= 1.1;
    }
    if (prioritizeText && trimTolerance === "low") {
      score += 0.5;
    }
    score += getVisualAnchorCandidateScore(entry, sourceBounds, string(policy && policy.visualAnchor, ""));
    if (entry.hasImageFill) {
      score += 0.2;
    }

    return score;
  }

  function getVisualAnchorCandidateScore(entry, sourceBounds, visualAnchor) {
    if (!entry || !entry.bounds || !sourceBounds) {
      return 0;
    }
    const anchor = string(visualAnchor, "").toLowerCase();
    if (!anchor) {
      return 0;
    }
    const centerX = (numeric(entry.bounds.x) + numeric(entry.bounds.width) / 2 - numeric(sourceBounds.x)) / Math.max(1, numeric(sourceBounds.width));
    const centerY = (numeric(entry.bounds.y) + numeric(entry.bounds.height) / 2 - numeric(sourceBounds.y)) / Math.max(1, numeric(sourceBounds.height));
    if (anchor.indexOf("left") >= 0) {
      return round(clamp(1 - centerX, 0, 1) * 0.72);
    }
    if (anchor.indexOf("right") >= 0) {
      return round(clamp(centerX, 0, 1) * 0.72);
    }
    if (anchor.indexOf("top") >= 0) {
      return round(clamp(1 - centerY, 0, 1) * 0.72);
    }
    if (anchor.indexOf("bottom") >= 0) {
      return round(clamp(centerY, 0, 1) * 0.72);
    }
    return round((1 - Math.min(1, Math.abs(centerX - 0.5) * 2)) * 0.48);
  }

  function pickHeroTextCandidates(candidates) {
    return pickProminentTextCandidates(candidates, 3, true);
  }

  function pickPromoTextCandidates(candidates) {
    return pickProminentTextCandidates(candidates, 4, false);
  }

  function filterTextEntriesForAiPlan(entries, aiPlan, builderType) {
    const list = Array.isArray(entries) ? entries.slice() : [];
    if (!aiPlan || typeof aiPlan !== "object" || list.length === 0) {
      return list;
    }

    const discardTokens = normalizeAiTokenList(aiPlan.discardTextTokens, 16);
    const keepTokens = collectAiKeepTextTokens(aiPlan, builderType);
    const kept = [];
    const filtered = [];

    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index];
      const text = normalizeMeaningfulText(string(entry && entry.node && entry.node.characters, "")).toLowerCase();
      if (!text) {
        continue;
      }
      if (matchesAiTextTokens(text, discardTokens)) {
        continue;
      }
      filtered.push(entry);
      if (keepTokens.length === 0 || matchesAiTextTokens(text, keepTokens)) {
        kept.push(entry);
      }
    }

    if (keepTokens.length > 0 && kept.length > 0) {
      return kept;
    }
    return filtered;
  }

  function collectAiKeepTextTokens(aiPlan, builderType) {
    const out = normalizeAiTokenList(aiPlan && aiPlan.keepTextTokens, 20);
    const seen = {};
    for (let index = 0; index < out.length; index += 1) {
      seen[out[index]] = true;
    }

    if (builderType === "hero" && aiPlan && aiPlan.heroCopyBlock) {
      const block = aiPlan.heroCopyBlock;
      const values = [block.eyebrow, block.headline, block.subtitle, block.body];
      for (let index = 0; index < values.length; index += 1) {
        const token = normalizeMeaningfulText(string(values[index], "")).toLowerCase();
        if (!token || seen[token]) {
          continue;
        }
        seen[token] = true;
        out.push(token);
      }
    }

    if (builderType === "promo" && aiPlan) {
      const values = [aiPlan.sectionHeader, aiPlan.date];
      const cards = Array.isArray(aiPlan.cards) ? aiPlan.cards : [];
      for (let index = 0; index < cards.length; index += 1) {
        values.push(cards[index] && cards[index].label);
        values.push(cards[index] && cards[index].title);
        values.push(cards[index] && cards[index].body);
        values.push(cards[index] && cards[index].skuText);
      }
      for (let index = 0; index < values.length; index += 1) {
        const token = normalizeMeaningfulText(string(values[index], "")).toLowerCase();
        if (!token || seen[token]) {
          continue;
        }
        seen[token] = true;
        out.push(token);
      }
    }

    return out.slice(0, 20);
  }

  function matchesAiTextTokens(text, tokens) {
    const source = normalizeMeaningfulText(string(text, "")).toLowerCase();
    const list = Array.isArray(tokens) ? tokens : [];
    if (!source || list.length === 0) {
      return false;
    }
    for (let index = 0; index < list.length; index += 1) {
      const token = normalizeMeaningfulText(string(list[index], "")).toLowerCase();
      if (!token) {
        continue;
      }
      if (source === token || source.indexOf(token) >= 0 || token.indexOf(source) >= 0) {
        return true;
      }
    }
    return false;
  }

  function buildTemplateTextRoleBuckets(entries, builderType) {
    const list = Array.isArray(entries) ? entries.slice().sort(compareTemplateReadingOrder) : [];
    const buckets = {
      meta: [],
      headline: [],
      subtitle: [],
      body: [],
      cta: [],
    };

    for (let index = 0; index < list.length; index += 1) {
      const role = classifyTemplateTextEntryRole(list[index], builderType, index, list.length);
      const target = buckets[role] ? role : "body";
      buckets[target].push(list[index]);
    }

    return buckets;
  }

  function classifyTemplateTextEntryRole(entry, builderType, index, totalCount) {
    const name = string(safeName(entry && entry.node), "").toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    const text = string(entry && entry.node && entry.node.characters, "").trim();
    const lowerText = text.toLowerCase();
    const fontSize = numeric(entry && entry.fontSize);

    if (containsAny(name, ["cta", "button", "shop", "buy", "copy", "apply"]) || containsAny(lowerText, ["copy", "shop", "buy now", "learn more"])) {
      return "cta";
    }
    if (containsDigit(text) || containsAny(name, ["meta", "date", "eyebrow", "label", "tag"]) || containsAny(lowerText, ["2024", "2025", "2026", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"])) {
      return "meta";
    }
    if (containsAny(name, ["headline", "title", "hero", "kv", "benefit", "offer"])) {
      return builderType === "hero" && index === 0 ? "eyebrow" : "headline";
    }
    if (containsAny(name, ["subtitle", "sub title", "subheading"])) {
      return "subtitle";
    }
    if (fontSize >= 40) {
      return builderType === "hero" && index === 0 && totalCount >= 3 ? "eyebrow" : "headline";
    }
    if (fontSize >= 24) {
      return builderType === "promo" && index > 0 ? "subtitle" : "headline";
    }
    return "body";
  }

  function resolveTemplateRoleEntries(roleBuckets, plan, role, fallbackEntries, limit, usedNodeIds) {
    const seen = usedNodeIds || {};
    const preferred = roleBuckets && Array.isArray(roleBuckets[role]) ? roleBuckets[role] : [];
    const fallback = Array.isArray(fallbackEntries) ? fallbackEntries : [];
    const combined = [];
    const sources = preferred.concat(fallback);
    for (let index = 0; index < sources.length; index += 1) {
      const entry = sources[index];
      if (!entry || !entry.node || !entry.node.id || seen[entry.node.id]) {
        continue;
      }
      seen[entry.node.id] = true;
      combined.push(entry);
      if (combined.length >= limit) {
        break;
      }
    }
    return combined.sort(compareTemplateReadingOrder);
  }

  function buildOrderedTemplateTextRoles(plan, fallbackRoles) {
    const guided = plan && plan.textGroupRoles && Array.isArray(plan.textGroupRoles.order) ? plan.textGroupRoles.order : [];
    const ordered = [];
    const seen = {};
    const source = guided.concat(Array.isArray(fallbackRoles) ? fallbackRoles : []);
    for (let index = 0; index < source.length; index += 1) {
      const role = string(source[index], "").toLowerCase();
      if (!role || seen[role]) {
        continue;
      }
      seen[role] = true;
      ordered.push(role);
    }
    return ordered;
  }

  function shouldDropTemplateTextRole(role, plan) {
    const dropRules = plan && plan.dropRules && typeof plan.dropRules === "object" ? plan.dropRules : null;
    const required = plan && plan.textGroupRoles && Array.isArray(plan.textGroupRoles.required) ? plan.textGroupRoles.required : [];
    if (required.indexOf(role) >= 0) {
      return false;
    }
    if (!dropRules) {
      return false;
    }
    if (role === "meta" && dropRules.hideRedundantMeta) {
      return true;
    }
    return false;
  }

  function getTemplateRoleGap(role, compactText) {
    if (role === "headline") {
      return compactText ? 4 : 6;
    }
    if (role === "body") {
      return compactText ? 4 : 6;
    }
    return compactText ? 2 : 4;
  }

  function getTemplateRoleContentWidth(role, contentWidth, textLayoutGuidance) {
    const headlineRatio = numeric(textLayoutGuidance && textLayoutGuidance.headlineMaxWidthRatio);
    if (role === "headline") {
      return Math.max(180, Math.round(contentWidth * (headlineRatio > 0 ? headlineRatio : 0.9)));
    }
    if (role === "meta") {
      return Math.max(160, Math.round(contentWidth * 0.86));
    }
    if (role === "cta") {
      return Math.max(150, Math.round(contentWidth * 0.72));
    }
    return Math.max(180, Math.round(contentWidth * 0.94));
  }

  function resolveTemplateEntryRole(entry, defaultRole, builderType) {
    if (defaultRole) {
      return defaultRole;
    }
    return classifyTemplateTextEntryRole(entry, builderType || "", 0, 1);
  }

  function applyTemplateTextGuidance(node, contentWidth, role, textLayoutGuidance, state, builderType) {
    const alignment = string(textLayoutGuidance && textLayoutGuidance.alignment, "left").toLowerCase();
    const targetWidth = getTemplateRoleContentWidth(role, contentWidth, textLayoutGuidance);
    const minSize = numeric(
      textLayoutGuidance &&
        textLayoutGuidance.minFontSize &&
        role &&
        Object.prototype.hasOwnProperty.call(textLayoutGuidance.minFontSize, role)
        ? textLayoutGuidance.minFontSize[role]
        : 0
    );

    try {
      if ("textAlignHorizontal" in node) {
        node.textAlignHorizontal = alignment === "center" ? "CENTER" : "LEFT";
      }
    } catch (error) {}

    writeDraftTextRolePluginData(node, role, builderType);

    const predicted = predictDraftTextSize(node, state, role, builderType);
    if (predicted) {
      applyPredictedTextStyle(node, predicted);
    }

    if (minSize > 0) {
      const currentSize = getTemplateTextSize(node);
      if (currentSize > 0 && currentSize < minSize) {
        setTextNodeFontSize(node, minSize);
        if (predicted) {
          applyPredictedTextLineHeight(node, predicted);
        }
      }
    }

    forceFitTextNodeToWidth(node, resolvePredictedTextTargetWidth(node, predicted, targetWidth) || targetWidth);
  }

  function shouldUseCompactPromoVisual(plan, textFirst) {
    if (!textFirst) {
      return false;
    }
    const role = string(plan && plan.visualRole && plan.visualRole.primary, "");
    return role === "product" || string(plan && plan.reflowPattern, "") === "meta-title-body-product" || prioritizesTextContentOverImages(plan);
  }

  function getCompactPromoVisualWidth(contentWidth, plan) {
    const width = Math.round(contentWidth * (prioritizesTextContentOverImages(plan) ? 0.34 : 0.44));
    return clamp(width, 120, 188);
  }

  function getCompactPromoVisualHeight(visualCandidate, width, plan) {
    const bounds = visualCandidate && visualCandidate.bounds ? visualCandidate.bounds : null;
    const ratio = bounds && numeric(bounds.width) > 0 ? numeric(bounds.height) / numeric(bounds.width) : 1.6;
    return clamp(Math.round(width * ratio), prioritizesTextContentOverImages(plan) ? 120 : 160, 320);
  }

  function configureCompactTemplateVisualFrame(frame) {
    if (!frame) {
      return;
    }
    try {
      if ("layoutSizingHorizontal" in frame) {
        frame.layoutSizingHorizontal = "FIXED";
      }
    } catch (error) {}
    try {
      if ("layoutAlign" in frame) {
        frame.layoutAlign = "CENTER";
      }
    } catch (error) {}
  }

  function pickPromoMetaCandidates(candidates) {
    const list = Array.isArray(candidates) ? candidates.slice().sort(compareTemplateReadingOrder) : [];
    const out = [];
    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index];
      const text = string(entry && entry.node && entry.node.characters, "").trim();
      if (!text) {
        continue;
      }
      if (!containsDigit(text) && !containsAny(text.toLowerCase(), ["july", "june", "aug", "2024", "2025", "2026", "~", "-", "/"])) {
        continue;
      }
      out.push(entry);
      if (out.length >= 2) {
        break;
      }
    }
    return out;
  }

  function pickPromoHeadingCandidates(candidates, metaCandidates) {
    const excluded = buildEntryNodeSet(metaCandidates);
    const list = Array.isArray(candidates) ? candidates.slice() : [];
    list.sort((left, right) => {
      if (right.fontSize !== left.fontSize) {
        return right.fontSize - left.fontSize;
      }
      return compareTemplateReadingOrder(left, right);
    });
    const out = [];
    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index];
      if (excluded[entry.node.id]) {
        continue;
      }
      out.push(entry);
      if (out.length >= 2) {
        break;
      }
    }
    return out.sort(compareTemplateReadingOrder);
  }

  function pickPromoBodyCandidates(candidates, metaCandidates, headingCandidates) {
    const excluded = buildEntryNodeSet([].concat(metaCandidates || [], headingCandidates || []));
    const list = Array.isArray(candidates) ? candidates.slice().sort(compareTemplateReadingOrder) : [];
    const out = [];
    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index];
      if (excluded[entry.node.id]) {
        continue;
      }
      out.push(entry);
      if (out.length >= 4) {
        break;
      }
    }
    return out;
  }

  function buildEntryNodeSet(entries) {
    const set = {};
    const list = Array.isArray(entries) ? entries : [];
    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index];
      if (entry && entry.node && entry.node.id) {
        set[entry.node.id] = true;
      }
    }
    return set;
  }

  function containsDigit(text) {
    return /[0-9]/.test(string(text, ""));
  }

  function pickArticleHeadingCandidates(candidates) {
    const list = Array.isArray(candidates) ? candidates.slice() : [];
    list.sort((left, right) => {
      if (right.fontSize !== left.fontSize) {
        return right.fontSize - left.fontSize;
      }
      return compareTemplateReadingOrder(left, right);
    });
    return list.slice(0, 2).sort(compareTemplateReadingOrder);
  }

  function pickArticleBodyCandidates(candidates, selectedHeadings) {
    const selectedNodes = [];
    const list = Array.isArray(candidates) ? candidates.slice().sort(compareTemplateReadingOrder) : [];
    const headings = Array.isArray(selectedHeadings) ? selectedHeadings : [];

    for (let index = 0; index < headings.length; index += 1) {
      selectedNodes.push(headings[index].node);
    }

    const out = [];
    for (let index = 0; index < list.length; index += 1) {
      if (selectedNodes.indexOf(list[index].node) >= 0) {
        continue;
      }
      out.push(list[index]);
      if (out.length >= 4) {
        break;
      }
    }
    return out;
  }

  function pickCtaTextCandidates(candidates, selectedTexts) {
    const selectedNodes = [];
    const list = Array.isArray(candidates) ? candidates.slice() : [];
    const chosen = [];
    const selected = Array.isArray(selectedTexts) ? selectedTexts : [];

    for (let index = 0; index < selected.length; index += 1) {
      selectedNodes.push(selected[index].node);
    }

    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index];
      if (selectedNodes.indexOf(entry.node) >= 0) {
        continue;
      }
      const corpus = `${safeName(entry.node)} ${string(entry.node.characters, "")}`.toLowerCase();
      if (!containsAny(corpus, ["shop", "buy", "learn", "more", "cta", "click", "copy", "discover", "read"])) {
        continue;
      }
      chosen.push(entry);
      if (chosen.length >= 2) {
        break;
      }
    }
    return chosen;
  }

  function pickProminentTextCandidates(candidates, limit, preferLarge) {
    const list = Array.isArray(candidates) ? candidates.slice() : [];
    list.sort((left, right) => {
      if (preferLarge && right.fontSize !== left.fontSize) {
        return right.fontSize - left.fontSize;
      }
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return compareTemplateReadingOrder(left, right);
    });
    return list.slice(0, limit).sort(compareTemplateReadingOrder);
  }

  function isTemplateTextCandidate(node) {
    return !!(
      node &&
      node.type === "TEXT" &&
      typeof node.characters === "string" &&
      node.characters.trim() &&
      node.visible !== false
    );
  }

  function isTemplateVisualCandidate(node, bounds) {
    if (!node || !bounds || node.visible === false) {
      return false;
    }
    if (node.type === "TEXT" || node.type === "LINE") {
      return false;
    }
    if (isTinyDecorativeNodeForTemplate(node, bounds)) {
      return false;
    }
    if (nodeHasVisibleImageFill(node)) {
      return true;
    }
    return bounds.width >= 96 && bounds.height >= 96;
  }

  function isTinyDecorativeNodeForTemplate(node, bounds) {
    const corpus = safeName(node).toLowerCase();
    const decorative = containsAny(corpus, ["bg", "background", "decoration", "ornament", "shape", "dot", "circle"]);
    const tinyArea = numeric(bounds.width) * numeric(bounds.height) <= 18000;
    return tinyArea && decorative;
  }

  function getTemplateTextSize(node) {
    if (!node || node.type !== "TEXT") {
      return 0;
    }
    if (typeof node.fontSize === "number" && isFinite(node.fontSize)) {
      return numeric(node.fontSize);
    }
    return 0;
  }

  function getTemplateTextCandidateScore(node, bounds) {
    const fontSize = getTemplateTextSize(node);
    const width = bounds ? numeric(bounds.width) : 0;
    const height = bounds ? numeric(bounds.height) : 0;
    const textLength = typeof node.characters === "string" ? node.characters.trim().length : 0;
    const densityBonus = textLength > 0 && textLength <= 80 ? 16 : 0;
    return round(fontSize * 2 + Math.min(width, 240) * 0.05 + Math.min(height, 80) * 0.1 + densityBonus);
  }

  function getTemplateVisualCandidateScore(node, bounds, depth) {
    const area = numeric(bounds.width) * numeric(bounds.height);
    const imageBonus = nodeHasVisibleImageFill(node) ? 400000 : 0;
    const depthPenalty = depth * 12000;
    return Math.round(area + imageBonus - depthPenalty);
  }

  function classifyTemplateVisualSemanticRole(node, bounds, sourceBounds, areaRatioHint) {
    const corpus = safeName(node).toLowerCase();
    const areaRatio =
      numeric(areaRatioHint) > 0
        ? numeric(areaRatioHint)
        : sourceBounds && bounds && numeric(sourceBounds.width) * numeric(sourceBounds.height) > 0
        ? (numeric(bounds.width) * numeric(bounds.height)) / (numeric(sourceBounds.width) * numeric(sourceBounds.height))
        : 0;
    if (containsAny(corpus, ["logo", "brand", "wordmark", "symbol"])) {
      return "logo";
    }
    if (containsAny(corpus, ["person", "model", "woman", "man", "people", "portrait", "face", "hand", "arm"])) {
      return "person";
    }
    if (
      containsAny(corpus, [
        "product",
        "device",
        "refrigerator",
        "fridge",
        "instaview",
        "tv",
        "oled",
        "monitor",
        "phone",
        "laptop",
        "bottle",
        "pack",
        "shoe",
        "bag",
      ])
    ) {
      return "product";
    }
    if (containsAny(corpus, ["background", "bg", "hero", "banner", "kv", "visual", "wallpaper"]) || areaRatio >= 0.58) {
      return "background";
    }
    if (containsAny(corpus, ["badge", "coupon", "offer", "discount", "icon", "shape", "ornament", "pattern", "deco"]) || areaRatio <= 0.04) {
      return "decorative";
    }
    return "supporting";
  }

  function deriveVisualTrimTolerance(role) {
    const normalized = normalizeVisualSemanticRole(role);
    if (normalized === "background" || normalized === "decorative") {
      return "high";
    }
    if (normalized === "supporting") {
      return "medium";
    }
    return "low";
  }

  function nodeHasVisibleImageFill(node) {
    if (isSectionBand(node)) {
      for (let index = 0; index < node.nodes.length; index += 1) {
        if (nodeHasVisibleImageFill(node.nodes[index])) {
          return true;
        }
      }
      return false;
    }
    if (!node || !Array.isArray(node.fills)) {
      return false;
    }
    for (let index = 0; index < node.fills.length; index += 1) {
      const fill = node.fills[index];
      if (fill && fill.visible !== false && fill.type === "IMAGE") {
        return true;
      }
    }
    return false;
  }

  function compareTemplateTextCandidates(left, right) {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return compareTemplateReadingOrder(left, right);
  }

  function compareTemplateVisualCandidates(left, right) {
    if (!!left.mirrored !== !!right.mirrored) {
      return left.mirrored ? 1 : -1;
    }
    if (right.hasImageFill !== left.hasImageFill) {
      return right.hasImageFill ? 1 : -1;
    }
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return compareTemplateReadingOrder(left, right);
  }

  function compareTemplateReadingOrder(left, right) {
    const leftBounds = left && left.bounds ? left.bounds : null;
    const rightBounds = right && right.bounds ? right.bounds : null;
    const leftY = leftBounds ? numeric(leftBounds.y) : 0;
    const rightY = rightBounds ? numeric(rightBounds.y) : 0;
    if (Math.abs(leftY - rightY) > 2) {
      return leftY - rightY;
    }
    const leftX = leftBounds ? numeric(leftBounds.x) : 0;
    const rightX = rightBounds ? numeric(rightBounds.x) : 0;
    if (Math.abs(leftX - rightX) > 2) {
      return leftX - rightX;
    }
    return 0;
  }

  function isMirroredTransformNode(node) {
    if (!node || !Array.isArray(node.relativeTransform) || node.relativeTransform.length < 2) {
      return false;
    }

    const row0 = Array.isArray(node.relativeTransform[0]) ? node.relativeTransform[0] : null;
    const row1 = Array.isArray(node.relativeTransform[1]) ? node.relativeTransform[1] : null;
    if (!row0 || !row1 || row0.length < 2 || row1.length < 2) {
      return false;
    }

    const determinant = numeric(row0[0]) * numeric(row1[1]) - numeric(row0[1]) * numeric(row1[0]);
    return determinant < 0;
  }

  function fitSectionCloneToDraftWidth(node, targetWidth, state, sectionTypeHint) {
    if (!node) {
      return false;
    }

    if (shouldUseConservativeMobileSectionPlacement(node, state, sectionTypeHint)) {
      return fitNodeIntoMobileColumn(node, targetWidth, state);
    }

    if (shouldScaleSectionCloneForDraft(node, targetWidth, state)) {
      return fitNodeIntoMobileColumn(node, targetWidth, state);
    }

    const bounds = getNodeBounds(node);
    const currentWidth = bounds ? numeric(bounds.width) : numeric(node.width);
    const currentHeight = bounds ? numeric(bounds.height) : numeric(node.height);
    let changed = false;

    if (supportsLayoutEditing(node)) {
      const learnedLayout = applyLearnedMobileContainerLayout(node, state, 1, sectionTypeHint);
      changed = (learnedLayout && learnedLayout.changed) || changed;
      if (!learnedLayout) {
        changed = maybeConvertContainerToVertical(node, state, 1) || changed;
      }
      applyMobileSpacingStrategy(node, state, learnedLayout);
      promoteChildToFillWidth(node);
    }

    if (currentWidth > targetWidth * 1.03 && currentHeight > 0) {
      changed = resizeNodeForDraft(node, targetWidth, Math.max(1, currentHeight));
    }

    if (changed) {
      state.scaledNodeCount += 1;
    }
    return changed;
  }

  function fitSectionCloneToDesktopWidth(node, targetWidth, state, sectionType, evidence) {
    if (!node) {
      return false;
    }

    if (shouldScaleSectionCloneForDraft(node, targetWidth, state)) {
      return fitNodeIntoDesktopCanvas(node, targetWidth, state, 2.4);
    }

    const bounds = getNodeBounds(node);
    const currentWidth = bounds ? numeric(bounds.width) : numeric(node.width);
    const currentHeight = bounds ? numeric(bounds.height) : numeric(node.height);
    let changed = false;

    if (supportsLayoutEditing(node)) {
      const learnedLayout = applyLearnedDesktopContainerLayout(node, state, 1, sectionType, evidence);
      if (!learnedLayout) {
        if (maybeConvertContainerToDesktopLayout(node, state, 1, sectionType)) {
          noteDesktopSectionHeuristic(evidence);
        }
      }
      if (!learnedLayout && loosenAutoLayoutSpacing(node, state)) {
        state.spacingAdjustments += 1;
      }
      promoteChildToFillWidth(node);
    }

    if (currentWidth > targetWidth * 1.03 || (currentWidth > 0 && currentWidth < targetWidth * 0.72 && currentHeight > 0)) {
      changed = fitNodeIntoDesktopCanvas(node, targetWidth, state, 1.8) || changed;
    }

    return changed;
  }

  function shouldScaleSectionCloneForDraft(node, targetWidth, state) {
    if (!node) {
      return false;
    }

    const type = String(node.type || "");
    if (type === "GROUP") {
      return true;
    }

    const layoutMode = String(node.layoutMode || "NONE");
    const width = numeric(node.width);
    if (layoutMode === "NONE" && countAbsoluteChildrenForDraft(node) >= 2) {
      return true;
    }
    if (layoutMode === "NONE" && width >= targetWidth * 1.5) {
      if (prefersTallRootReflow(state) && supportsLayoutEditing(node)) {
        return false;
      }
      return true;
    }
    return false;
  }

  function countAbsoluteChildrenForDraft(node) {
    if (!node || !Array.isArray(node.children)) {
      return 0;
    }

    let count = 0;
    for (let index = 0; index < node.children.length; index += 1) {
      const child = node.children[index];
      if (child && "layoutPositioning" in child && child.layoutPositioning === "ABSOLUTE") {
        count += 1;
      }
    }
    return count;
  }

  function shouldPreserveFreeformContainer(node) {
    if (!node || !Array.isArray(node.children) || node.children.length < 2) {
      return false;
    }

    if (countAbsoluteChildrenForDraft(node) > 0) {
      return true;
    }

    if (String(node.layoutMode || "NONE") !== "NONE") {
      return false;
    }

    const childEntries = collectVisibleChildBounds(node);
    if (childEntries.length < 2) {
      return false;
    }

    if (hasOverlappingChildBounds(childEntries)) {
      return true;
    }

    return hasMultiAxisChildDistribution(childEntries, node);
  }

  function collectVisibleChildBounds(node) {
    const entries = [];
    if (!node || !Array.isArray(node.children)) {
      return entries;
    }

    for (let index = 0; index < node.children.length; index += 1) {
      const child = node.children[index];
      if (!child || child.visible === false) {
        continue;
      }
      const bounds = getNodeBounds(child);
      if (!bounds) {
        continue;
      }
      const width = numeric(bounds.width);
      const height = numeric(bounds.height);
      if (!(width > 0) || !(height > 0)) {
        continue;
      }
      entries.push({
        x: numeric(bounds.x),
        y: numeric(bounds.y),
        width: width,
        height: height,
      });
    }

    return entries;
  }

  function hasOverlappingChildBounds(entries) {
    if (!Array.isArray(entries) || entries.length < 2) {
      return false;
    }

    for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
      const left = entries[leftIndex];
      const leftRight = left.x + left.width;
      const leftBottom = left.y + left.height;
      for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
        const right = entries[rightIndex];
        const overlapWidth = Math.min(leftRight, right.x + right.width) - Math.max(left.x, right.x);
        const overlapHeight = Math.min(leftBottom, right.y + right.height) - Math.max(left.y, right.y);
        if (!(overlapWidth > 0) || !(overlapHeight > 0)) {
          continue;
        }
        const overlapArea = overlapWidth * overlapHeight;
        const smallerArea = Math.min(left.width * left.height, right.width * right.height);
        if (smallerArea > 0 && overlapArea / smallerArea >= 0.18) {
          return true;
        }
      }
    }

    return false;
  }

  function hasMultiAxisChildDistribution(entries, node) {
    if (!Array.isArray(entries) || entries.length < 2) {
      return false;
    }

    const bounds = getNodeBounds(node);
    const nodeWidth = bounds ? numeric(bounds.width) : numeric(node && node.width);
    const nodeHeight = bounds ? numeric(bounds.height) : numeric(node && node.height);
    const xThreshold = Math.max(24, nodeWidth > 0 ? nodeWidth * 0.14 : 48);
    const yThreshold = Math.max(24, nodeHeight > 0 ? nodeHeight * 0.14 : 48);
    const xAnchors = [];
    const yAnchors = [];

    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      const centerX = entry.x + entry.width / 2;
      const centerY = entry.y + entry.height / 2;
      if (!hasNearbyAnchor(xAnchors, centerX, xThreshold)) {
        xAnchors.push(centerX);
      }
      if (!hasNearbyAnchor(yAnchors, centerY, yThreshold)) {
        yAnchors.push(centerY);
      }
      if (xAnchors.length >= 2 && yAnchors.length >= 2) {
        return true;
      }
    }

    return false;
  }

  function hasNearbyAnchor(values, nextValue, threshold) {
    if (!Array.isArray(values) || !(threshold >= 0)) {
      return false;
    }
    for (let index = 0; index < values.length; index += 1) {
      if (Math.abs(values[index] - nextValue) <= threshold) {
        return true;
      }
    }
    return false;
  }

  function prepareSectionCloneTreeForDraft(node, targetWidth, state, depth, sectionTypeHint) {
    if (!node || depth > 1) {
      return;
    }

    const sectionType = normalizePredictedSectionType(sectionTypeHint || readDraftSectionType(node) || "");
    const nodeLearnedLayout = supportsLayoutEditing(node) ? applyLearnedMobileContainerLayout(node, state, depth + 1, sectionType) : null;
    if (supportsLayoutEditing(node)) {
      if (!nodeLearnedLayout) {
        maybeConvertContainerToVertical(node, state, depth + 1);
      }
      applyMobileSpacingStrategy(node, state, nodeLearnedLayout);
      if (shouldPromoteNodeToFillWidth(node)) {
        promoteChildToFillWidth(node);
      }
    }

    if (!Array.isArray(node.children) || node.children.length === 0) {
      return;
    }

    for (let index = 0; index < node.children.length; index += 1) {
      const child = node.children[index];
      if (!child || child.visible === false) {
        continue;
      }

      const childLearnedLayout = supportsLayoutEditing(child) ? applyLearnedMobileContainerLayout(child, state, depth + 2, sectionType) : null;
      if (supportsLayoutEditing(child)) {
        if (!childLearnedLayout) {
          maybeConvertContainerToVertical(child, state, depth + 2);
        }
        applyMobileSpacingStrategy(child, state, childLearnedLayout);
        if (shouldPromoteNodeToFillWidth(child)) {
          promoteChildToFillWidth(child);
        }
      }

      const nextTargetWidth =
        childLearnedLayout && childLearnedLayout.childWidth > 0 ? childLearnedLayout.childWidth : targetWidth;
      if (shouldScaleSectionCloneForDraft(child, nextTargetWidth, state)) {
        fitNodeIntoMobileColumn(child, nextTargetWidth, state);
      } else {
        const bounds = getNodeBounds(child);
        const childWidth = bounds ? numeric(bounds.width) : numeric(child.width);
        const childHeight = bounds ? numeric(bounds.height) : numeric(child.height);
        if (childWidth > nextTargetWidth * 1.03 && childHeight > 0) {
          if (resizeNodeForDraft(child, nextTargetWidth, Math.max(1, childHeight))) {
            state.scaledNodeCount += 1;
          }
        }
      }

      if (depth === 0) {
        prepareSectionCloneTreeForDraft(child, nextTargetWidth, state, depth + 1, sectionType);
      }
    }
  }

  function prepareSectionCloneTreeForDesktop(node, targetWidth, state, depth, sectionType, evidence) {
    if (!node || depth > 1) {
      return;
    }

    let nodeLayoutMode = String(node.layoutMode || "NONE");
    if (supportsLayoutEditing(node)) {
      const learnedLayout = applyLearnedDesktopContainerLayout(node, state, depth + 1, sectionType, evidence);
      if (!learnedLayout) {
        if (maybeConvertContainerToDesktopLayout(node, state, depth + 1, sectionType)) {
          noteDesktopSectionHeuristic(evidence);
        }
      }
      if (!learnedLayout && loosenAutoLayoutSpacing(node, state)) {
        state.spacingAdjustments += 1;
      }
      promoteChildToFillWidth(node);
      nodeLayoutMode = String(node.layoutMode || "NONE");
    }

    if (!Array.isArray(node.children) || node.children.length === 0) {
      return;
    }

    const visibleChildCount = node.children.filter((child) => child && child.visible !== false).length || 1;
    const layoutGap = "itemSpacing" in node ? numeric(node.itemSpacing) : 0;
    const horizontalChildTargetWidth =
      nodeLayoutMode === "HORIZONTAL"
        ? Math.max(220, Math.round((targetWidth - Math.max(0, visibleChildCount - 1) * layoutGap) / visibleChildCount))
        : targetWidth;

    for (let index = 0; index < node.children.length; index += 1) {
      const child = node.children[index];
      if (!child || child.visible === false) {
        continue;
      }

      if (supportsLayoutEditing(child)) {
        const childLearnedLayout = applyLearnedDesktopContainerLayout(child, state, depth + 2, sectionType, evidence);
        if (!childLearnedLayout) {
          if (maybeConvertContainerToDesktopLayout(child, state, depth + 2, sectionType)) {
            noteDesktopSectionHeuristic(evidence);
          }
        }
        if (!childLearnedLayout && loosenAutoLayoutSpacing(child, state)) {
          state.spacingAdjustments += 1;
        }
        promoteChildToFillWidth(child);
      }

      const childBounds = getNodeBounds(child);
      const childWidth = childBounds ? numeric(childBounds.width) : numeric(child.width);
      const childHeight = childBounds ? numeric(childBounds.height) : numeric(child.height);
      const nextTargetWidth = nodeLayoutMode === "HORIZONTAL" ? horizontalChildTargetWidth : targetWidth;

      if (childWidth > nextTargetWidth * 1.03 || (depth === 0 && childWidth > 0 && childWidth < nextTargetWidth * 0.62 && childHeight > 0)) {
        fitNodeIntoDesktopCanvas(child, nextTargetWidth, state, depth === 0 ? 1.8 : 1.4);
      }

      if (depth === 0) {
        prepareSectionCloneTreeForDesktop(child, nextTargetWidth, state, depth + 1, sectionType, evidence);
      }
    }
  }

  function clonePaintArrayForDraft(paints) {
    if (!Array.isArray(paints) || paints.length === 0) {
      return [];
    }

    try {
      return JSON.parse(JSON.stringify(paints));
    } catch (error) {
      return [];
    }
  }
})();
