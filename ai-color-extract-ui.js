(() => {
  const initButtonId = "aiColorExtractButton";

  function postColorExtractInitFailure(message) {
    try {
      parent.postMessage(
        {
          pluginMessage: {
            type: "ai-color-extract-report-error",
            message,
          },
        },
        "*"
      );
    } catch (error) {
      console.error("[pigma] failed to report color extract init error:", error);
    }
  }

  function bindColorExtractInitFailure(message, error) {
    const button = document.getElementById(initButtonId);
    const normalizedMessage =
      typeof message === "string" && message.trim()
        ? message.trim()
        : "색상 추출 초기화 중 문제가 발생했습니다. 플러그인을 다시 열어 주세요.";

    window.__PIGMA_AI_COLOR_EXTRACT_V2_INIT_FAILED__ = normalizedMessage;
    if (error) {
      console.error("[pigma] ai color extract V2 init failed:", error);
    }

    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    if (button.dataset.pigmaColorExtractInitFailureBound === "true") {
      return;
    }

    button.dataset.pigmaColorExtractInitFailureBound = "true";
    button.disabled = false;
    button.setAttribute("aria-busy", "false");
    button.setAttribute("aria-disabled", "false");
    button.title = normalizedMessage;
    button.setAttribute("aria-label", `색상 추출 초기화 실패. ${normalizedMessage}`);
    button.addEventListener("click", () => {
      postColorExtractInitFailure(normalizedMessage);
    });
  }

  if (window.__PIGMA_AI_COLOR_EXTRACT_V2__) {
    return;
  }

  try {

  const shared = window.__PIGMA_AI_IMAGE_UPSCALE_SHARED__;
  if (
    !shared ||
    typeof shared.postPluginMessage !== "function" ||
    typeof shared.requireReadySettings !== "function" ||
    typeof shared.resolveUpscaleProvider !== "function" ||
    typeof shared.prepareInputImage !== "function" ||
    typeof shared.normalizeBytes !== "function" ||
    typeof shared.encodeBytesToBase64 !== "function" ||
    typeof shared.normalizeErrorMessage !== "function" ||
    typeof shared.isAbortError !== "function" ||
    typeof shared.ensureProcessingToast !== "function"
  ) {
    bindColorExtractInitFailure("색상 추출 초기화에 필요한 공용 이미지 런타임을 찾지 못했습니다. 플러그인을 다시 열어 주세요.");
    return;
  }

  function replaceButtonWithClone(buttonId) {
    const button = document.getElementById(buttonId);
    if (!(button instanceof HTMLButtonElement) || !button.parentNode) {
      return null;
    }
    const clone = button.cloneNode(true);
    button.parentNode.replaceChild(clone, button);
    return clone;
  }

  const button = replaceButtonWithClone("aiColorExtractButton");
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  button.title =
    "\uC120\uD0DD\uD55C \uC774\uBBF8\uC9C0\uB098 \uD14D\uC2A4\uD2B8\uB97C \uBC14\uD0D5\uC73C\uB85C AI\uAC00 \uC5C5\uC885, \uBE0C\uB79C\uB4DC, \uC6A9\uB3C4\uB97C \uC790\uB3D9 \uAC10\uC9C0\uD574 3x5 \uD314\uB808\uD2B8\uC640 \uADF8\uB77C\uB370\uC774\uC158 \uC2A4\uC640\uCE58\uB97C \uB9CC\uB4ED\uB2C8\uB2E4.";
  button.setAttribute(
    "aria-label",
    "\uC0C9\uC0C1 \uCD94\uCD9C. \uC120\uD0DD\uD55C \uC774\uBBF8\uC9C0\uB098 \uD14D\uC2A4\uD2B8\uB97C \uBC14\uD0D5\uC73C\uB85C AI\uAC00 \uC5C5\uC885, \uBE0C\uB79C\uB4DC, \uC6A9\uB3C4\uB97C \uC790\uB3D9 \uAC10\uC9C0\uD574 3x5 \uD314\uB808\uD2B8\uC640 \uADF8\uB77C\uB370\uC774\uC158 \uC2A4\uC640\uCE58\uB97C \uB9CC\uB4ED\uB2C8\uB2E4."
  );

  const defaultLabel = String(button.textContent || "\uC0C9\uC0C1 \uCD94\uCD9C").trim() || "\uC0C9\uC0C1 \uCD94\uCD9C";
  const preparingLabel = "\uC120\uD0DD \uD655\uC778 \uC911...";
  const analyzingLabel = "AI \uC0C9\uC0C1 \uBD84\uC11D \uC911...";
  const fallbackLabel = "\uBCF4\uC870 \uD314\uB808\uD2B8 \uC815\uB9AC \uC911...";
  const applyingLabel = "\uD314\uB808\uD2B8 \uC0DD\uC131 \uC911...";
  const operationLabel = "\uC0C9\uC0C1 \uCD94\uCD9C";
  const openAiModel = "gpt-4.1-mini";
  const geminiModel = "gemini-2.5-flash-lite";
  const processingToast = shared.ensureProcessingToast();
  const toastOwnerKey = "ai-image:aiColorExtractButton";
  const peerButtons = [
    "aiImageReferenceSearchButton",
    "aiOriginalImageDownloadButton",
    "aiImageTextFeasibilityButton",
    "aiImageSharpenButton",
    "aiImageUpscaleButton",
    "aiImageUpscaleObjectButton",
    "aiImagePromptEditButton",
    "aiImageExtendButton",
    "aiImageBoundsFitButton",
  ]
    .map((id) => document.getElementById(id))
    .filter((element) => element instanceof HTMLButtonElement && element !== button);
  const defaultPalette = {
    representative: ["#2563EB", "#7C3AED", "#F97316"],
    companions: ["#0EA5E9", "#EC4899", "#F59E0B"],
    accents: ["#EC4899", "#22C55E", "#FACC15"],
    text: ["#0F172A", "#2563EB", "#64748B"],
    surfaces: ["#E0F2FE", "#F5D0FE", "#FEF3C7"],
  };
  const adobeTrendCategoryProfiles = [
    {
      key: "fashion",
      title: "패션",
      keywords: ["fashion", "패션", "style", "apparel", "lookbook", "wear", "beauty", "cosmetic", "luxury", "editorial"],
      domains: ["fashion", "beauty"],
      intents: ["editorial", "banner", "sns"],
      tones: ["premium", "refined", "bold", "soft", "trendy"],
      preferredSources: ["BEHANCE", "KULER"],
    },
    {
      key: "graphic-design",
      title: "그래픽 디자인",
      keywords: ["graphic", "design", "poster", "logo", "branding", "brand", "campaign", "그래픽", "포스터", "로고", "브랜딩"],
      domains: ["general", "sports"],
      intents: ["banner", "editorial", "sns"],
      tones: ["bold", "playful", "high-contrast", "energetic"],
      preferredSources: ["BEHANCE", "KULER"],
    },
    {
      key: "illustration",
      title: "일러스트레이션",
      keywords: ["illustration", "illustrator", "drawing", "paint", "painting", "sticker", "cartoon", "character", "일러스트", "드로잉"],
      domains: ["general", "fashion"],
      intents: ["editorial", "sns"],
      tones: ["playful", "soft", "youthful", "colorful"],
      preferredSources: ["BEHANCE", "KULER"],
    },
    {
      key: "uiux",
      title: "UI/UX",
      keywords: ["ui", "ux", "app", "mobile", "web", "dashboard", "screen", "interface", "interaction", "product design"],
      domains: ["electronics", "general", "home"],
      intents: ["ui", "detail"],
      tones: ["clean", "modern", "minimal", "trustworthy"],
      preferredSources: ["BEHANCE", "KULER"],
    },
    {
      key: "architecture",
      title: "건축",
      keywords: ["architecture", "interior", "home", "furniture", "living", "space", "building", "urban", "건축", "인테리어"],
      domains: ["home"],
      intents: ["editorial", "detail"],
      tones: ["calm", "modern", "warm", "minimal"],
      preferredSources: ["BEHANCE", "KULER"],
    },
    {
      key: "game-design",
      title: "게임 디자인",
      keywords: ["game", "gaming", "arcade", "fantasy", "cyber", "esports", "character", "게임"],
      domains: ["sports", "general"],
      intents: ["banner", "sns", "editorial"],
      tones: ["energetic", "bold", "high-contrast", "playful"],
      preferredSources: ["BEHANCE", "KULER"],
    },
    {
      key: "wild",
      title: "야생",
      keywords: ["wild", "nature", "forest", "animal", "ocean", "sea", "mountain", "jungle", "flora", "fauna", "water", "야생", "자연", "바다"],
      domains: ["general"],
      intents: ["editorial", "banner"],
      tones: ["fresh", "natural", "calm", "adventurous"],
      preferredSources: ["STOCK", "KULER"],
    },
    {
      key: "flavor",
      title: "풍미",
      keywords: ["food", "flavor", "drink", "coffee", "wine", "fruit", "restaurant", "dessert", "meal", "풍미", "와인", "푸드", "음식"],
      domains: ["food"],
      intents: ["detail", "banner", "sns"],
      tones: ["warm", "fresh", "appetizing", "rich"],
      preferredSources: ["STOCK", "KULER"],
    },
    {
      key: "travel",
      title: "여행",
      keywords: ["travel", "trip", "journey", "beach", "holiday", "hotel", "resort", "sunset", "landscape", "sky", "여행"],
      domains: ["general"],
      intents: ["editorial", "banner", "sns"],
      tones: ["fresh", "calm", "adventurous", "bright"],
      preferredSources: ["STOCK", "KULER"],
    },
  ];
  const colorHuntTagProfiles = [
    { key: "popular", title: "Popular", keywords: ["popular", "trend", "general"], domains: ["general"], intents: ["ui", "banner", "sns", "editorial", "detail"], tones: ["modern", "playful", "bold"] },
    { key: "neon", title: "Neon", keywords: ["neon", "pop", "electric", "bold", "energetic", "playful"], domains: ["sports", "fashion", "beauty", "general"], intents: ["banner", "sns"], tones: ["energetic", "bold", "high-contrast", "playful", "trendy"] },
    { key: "kids", title: "Kids", keywords: ["kids", "cute", "toy", "sticker", "happy", "school"], domains: ["kids", "general"], intents: ["banner", "sns", "editorial"], tones: ["playful", "happy", "youthful", "soft"] },
    { key: "food", title: "Food", keywords: ["food", "dessert", "drink", "flavor", "coffee", "restaurant"], domains: ["food"], intents: ["detail", "banner", "sns"], tones: ["warm", "rich", "appetizing", "fresh"] },
    { key: "sky", title: "Sky", keywords: ["sky", "cloud", "air", "travel", "bright"], domains: ["general"], intents: ["banner", "editorial"], tones: ["bright", "fresh", "calm", "airy"] },
    { key: "sea", title: "Sea", keywords: ["sea", "ocean", "water", "travel", "fresh"], domains: ["general"], intents: ["banner", "editorial"], tones: ["fresh", "cool", "calm"] },
    { key: "nature", title: "Nature", keywords: ["nature", "wild", "forest", "fresh", "green"], domains: ["general"], intents: ["editorial", "banner"], tones: ["fresh", "natural", "calm"] },
    { key: "earth", title: "Earth", keywords: ["earth", "organic", "warm", "natural", "brown"], domains: ["home", "food", "general"], intents: ["detail", "editorial"], tones: ["warm", "natural", "calm"] },
    { key: "pastel", title: "Pastel", keywords: ["pastel", "soft", "light", "gentle"], domains: ["fashion", "beauty", "general"], intents: ["editorial", "sns", "banner"], tones: ["soft", "light", "gentle", "cute"] },
    { key: "gradient", title: "Gradient", keywords: ["gradient", "ui", "digital", "modern"], domains: ["electronics", "general"], intents: ["ui", "banner"], tones: ["modern", "clean", "bold"] },
    { key: "space", title: "Space", keywords: ["space", "future", "night", "cyber", "game"], domains: ["general", "sports"], intents: ["banner", "sns", "editorial"], tones: ["bold", "dramatic", "high-contrast"] },
    { key: "sunset", title: "Sunset", keywords: ["sunset", "warm", "glow", "travel"], domains: ["general"], intents: ["banner", "editorial"], tones: ["warm", "glow", "bright"] },
    { key: "warm", title: "Warm", keywords: ["warm", "cozy", "glow"], domains: ["food", "fashion", "home", "general"], intents: ["detail", "banner"], tones: ["warm", "rich", "cozy"] },
    { key: "cold", title: "Cold", keywords: ["cold", "cool", "clean", "tech"], domains: ["electronics", "general"], intents: ["ui", "detail"], tones: ["clean", "cool", "trustworthy"] },
    { key: "dark", title: "Dark", keywords: ["dark", "night", "premium", "dramatic"], domains: ["fashion", "beauty", "electronics", "general"], intents: ["editorial", "banner", "ui"], tones: ["premium", "dramatic", "bold"] },
    { key: "light", title: "Light", keywords: ["light", "soft", "clean", "airy"], domains: ["beauty", "general"], intents: ["ui", "editorial", "detail"], tones: ["light", "soft", "clean"] },
    { key: "retro", title: "Retro", keywords: ["retro", "graphic", "playful"], domains: ["fashion", "general"], intents: ["banner", "editorial", "sns"], tones: ["playful", "bold", "trendy"] },
    { key: "vintage", title: "Vintage", keywords: ["vintage", "muted", "classic", "editorial"], domains: ["fashion", "home", "general"], intents: ["editorial", "detail"], tones: ["classic", "muted", "soft"] },
  ];
  let isBusy = false;
  let activeRequestId = "";
  let activeAbortController = null;
  const adobeTrendThumbnailPaletteCache = new Map();

  function postPluginMessage(message) {
    shared.postPluginMessage(message);
  }

  function setPeerDisabled(disabled) {
    peerButtons.forEach((peerButton) => {
      peerButton.disabled = disabled;
      peerButton.setAttribute("aria-disabled", disabled ? "true" : "false");
    });
  }

  function isPeerBusy() {
    return peerButtons.some(
      (peerButton) =>
        peerButton.getAttribute("aria-busy") === "true" ||
        peerButton.dataset.pigmaBusy === "true"
    );
  }

  function setButtonBusy(busy, label) {
    isBusy = busy;
    button.disabled = busy;
    button.dataset.pigmaBusy = busy ? "true" : "false";
    button.setAttribute("aria-busy", busy ? "true" : "false");
    button.setAttribute("aria-disabled", busy ? "true" : "false");
    button.textContent = busy ? label : defaultLabel;
    setPeerDisabled(busy);
    if (busy) {
      processingToast.show(label, cancelCurrentRun, "\uCDE8\uC18C Esc", { ownerKey: toastOwnerKey });
      return;
    }
    processingToast.hide({ ownerKey: toastOwnerKey });
  }

  function resetState() {
    if (activeAbortController && typeof activeAbortController.abort === "function") {
      activeAbortController.abort();
    }
    activeAbortController = null;
    activeRequestId = "";
    if (isBusy) {
      setButtonBusy(false);
    }
  }

  function cancelCurrentRun() {
    resetState();
  }

  function reportUiError(message) {
    const normalized =
      typeof message === "string" && message.trim()
        ? message.trim()
        : "\uC0C9\uC0C1 \uCD94\uCD9C\uC744 \uC644\uB8CC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
    postPluginMessage({
      type: "ai-color-extract-report-error",
      clientRequestId: activeRequestId,
      message: normalized,
    });
  }

  function compactText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function clipText(value, maxLength) {
    const text = compactText(value);
    const limit = Math.max(1, Number(maxLength) || 0);
    if (!text || !limit || text.length <= limit) {
      return text;
    }
    return `${text.slice(0, Math.max(1, limit - 3)).trim()}...`;
  }

  async function buildProviderHttpError(provider, response) {
    let detail = "";
    try {
      detail = await response.text();
    } catch (error) {
      detail = "";
    }
    const compact = compactText(detail);
    return `${provider} API 오류 (${response.status})${compact ? `: ${compact.slice(0, 220)}` : ""}`;
  }

  function parseJsonResponseText(text) {
    const normalized = String(text || "").trim();
    if (!normalized) {
      throw new Error("AI 응답이 비어 있습니다.");
    }
    try {
      return JSON.parse(normalized);
    } catch (error) {}
    const fencedMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fencedMatch && fencedMatch[1]) {
      return JSON.parse(fencedMatch[1].trim());
    }
    const objectMatch = normalized.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
    throw new Error("AI 응답 JSON을 해석하지 못했습니다.");
  }

  function getOpenAiText(data) {
    if (!data || typeof data !== "object") {
      throw new Error("OpenAI 응답 형식을 읽지 못했습니다.");
    }
    const choices = Array.isArray(data.choices) ? data.choices : [];
    if (!choices.length) {
      throw new Error("OpenAI 응답 choices가 비어 있습니다.");
    }
    const firstMessage = choices[0] && choices[0].message ? choices[0].message : null;
    if (!firstMessage) {
      throw new Error("OpenAI 응답 message가 없습니다.");
    }
    if (typeof firstMessage.content === "string" && firstMessage.content.trim()) {
      return firstMessage.content;
    }
    if (Array.isArray(firstMessage.content)) {
      const parts = [];
      for (const item of firstMessage.content) {
        if (item && typeof item.text === "string" && item.text.trim()) {
          parts.push(item.text);
        }
      }
      if (parts.length > 0) {
        return parts.join("\n");
      }
    }
    throw new Error("OpenAI 응답 텍스트를 찾지 못했습니다.");
  }

  function getGeminiText(data) {
    if (!data || typeof data !== "object") {
      throw new Error("Gemini 응답 형식을 읽지 못했습니다.");
    }
    const candidates = Array.isArray(data.candidates) ? data.candidates : [];
    if (!candidates.length) {
      throw new Error("Gemini 응답 candidates가 비어 있습니다.");
    }
    const content = candidates[0] && candidates[0].content ? candidates[0].content : null;
    const parts = content && Array.isArray(content.parts) ? content.parts : [];
    const texts = [];
    for (const part of parts) {
      if (part && typeof part.text === "string" && part.text.trim()) {
        texts.push(part.text);
      }
    }
    if (texts.length > 0) {
      return texts.join("\n");
    }
    throw new Error("Gemini 응답 텍스트를 찾지 못했습니다.");
  }

  function normalizeSourceType(value, fallback) {
    const text = compactText(value).toLowerCase();
    if (!text) {
      return fallback || "image";
    }
    if (/^(text|ocr|copy)$/i.test(text) || /텍스트/.test(text)) {
      return "text";
    }
    if (/^(mixed|hybrid|combo)$/i.test(text) || /혼합|믹스/.test(text)) {
      return "mixed";
    }
    return "image";
  }

  function normalizeIntent(value, fallback) {
    const text = compactText(value).toLowerCase();
    if (!text) {
      return fallback || "ui";
    }
    if (/banner|hero|event|promo|campaign|배너|프로모션|광고/.test(text)) {
      return "banner";
    }
    if (/detail|product|pdp|상세/.test(text)) {
      return "detail";
    }
    if (/sns|social|feed|thumbnail|reel|shorts|썸네일|피드|소셜/.test(text)) {
      return "sns";
    }
    if (/editorial|magazine|lookbook|브랜딩|에디토리얼/.test(text)) {
      return "editorial";
    }
    if (/general|default|basic|일반/.test(text)) {
      return "general";
    }
    return "ui";
  }

  function normalizeConfidence(value, fallback) {
    const text = compactText(value).toLowerCase();
    if (text === "high" || text === "medium" || text === "low") {
      return text;
    }
    if (/높/.test(text)) {
      return "high";
    }
    if (/낮/.test(text)) {
      return "low";
    }
    return fallback || "medium";
  }

  function normalizeTag(value, fallback, maxLength) {
    const text = clipText(value, maxLength || 48);
    return text || fallback;
  }

  function normalizeBrand(value, fallback) {
    const text = compactText(value);
    if (!text) {
      return fallback || "none";
    }
    if (/^(none|unknown|n\/a)$/i.test(text) || /없음|미상/.test(text)) {
      return "none";
    }
    return clipText(text, 48);
  }

  function normalizeToneList(value, fallback) {
    const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[|,]/) : [];
    const list = [];
    const seen = {};

    for (let index = 0; index < source.length; index += 1) {
      const entry = clipText(source[index], 32);
      if (!entry) {
        continue;
      }
      const key = entry.toLowerCase();
      if (seen[key]) {
        continue;
      }
      seen[key] = true;
      list.push(entry);
      if (list.length >= 3) {
        break;
      }
    }

    if (list.length > 0) {
      return list;
    }
    return Array.isArray(fallback) ? fallback.slice(0, 3) : [];
  }

  function normalizeReason(value, fallback) {
    return clipText(value, 220) || fallback || "";
  }

  function normalizeHexColor(value) {
    const text = typeof value === "string" ? value.replace(/\s+/g, "").trim().toUpperCase() : "";
    if (/^#[0-9A-F]{6}$/.test(text)) {
      return text;
    }
    return "";
  }

  function hasCompletePaletteRow(value) {
    return Array.isArray(value) && value.length >= 3 && value.slice(0, 3).every((item) => !!normalizeHexColor(item));
  }

  function normalizePaletteRow(value, fallback) {
    const source = Array.isArray(value) ? value : [];
    const normalized = [];
    for (let index = 0; index < 3; index += 1) {
      normalized.push(normalizeHexColor(source[index]) || fallback[index]);
    }
    return normalized;
  }

  function paletteNeedsFallback(result) {
    const source = result && result.palette && typeof result.palette === "object" ? result.palette : result;
    return !(
      source &&
      hasCompletePaletteRow(source.representative) &&
      hasCompletePaletteRow(source.companions) &&
      hasCompletePaletteRow(source.accents) &&
      hasCompletePaletteRow(source.text) &&
      hasCompletePaletteRow(source.surfaces)
    );
  }

  function buildSummaryDigest(summary) {
    const safeSummary = summary && typeof summary === "object" ? summary : {};
    return {
      selectionLabel: clipText(safeSummary.selectionLabel, 80),
      nodeType: clipText(safeSummary.nodeType, 24),
      sourceType: normalizeSourceType(safeSummary.sourceType, "image"),
      size: `${Number(safeSummary.width) || 0}x${Number(safeSummary.height) || 0}`,
      textHint: clipText(safeSummary.textHint, 240),
      textColors: normalizeSummaryTextColors(safeSummary),
      textNodeCount: Number.isFinite(Number(safeSummary.textNodeCount)) ? Number(safeSummary.textNodeCount) : 0,
      childCount: Number.isFinite(Number(safeSummary.childCount)) ? Number(safeSummary.childCount) : 0,
    };
  }

  function normalizeSummaryTextColors(summary) {
    const source = summary && typeof summary === "object" && Array.isArray(summary.textColors) ? summary.textColors : [];
    const normalized = [];
    const seen = {};
    for (let index = 0; index < source.length; index += 1) {
      const hex = normalizeHexColor(source[index]);
      if (!hex || seen[hex]) {
        continue;
      }
      seen[hex] = true;
      normalized.push(hex);
      if (normalized.length >= 6) {
        break;
      }
    }
    return normalized;
  }

  function normalizeAdobeTrendRecords(records) {
    const source = Array.isArray(records) ? records : [];
    const normalized = [];

    for (let index = 0; index < source.length; index += 1) {
      const record = normalizeAdobeTrendRecord(source[index]);
      if (record) {
        normalized.push(record);
      }
    }

    return normalized;
  }

  function normalizeColorHuntRecords(records) {
    return normalizeAdobeTrendRecords(records);
  }

  function normalizeAdobeTrendRecord(value) {
    const source = value && typeof value === "object" ? value : {};
    const swatches = Array.isArray(source.swatches)
      ? source.swatches.map((swatch) => normalizeHexColor(swatch)).filter(Boolean).slice(0, 7)
      : [];
    const thumbnailUrl = clipText(source.thumbnailUrl || source.thumbnail_url, 240);
    if (swatches.length < 3 && !thumbnailUrl) {
      return null;
    }

    const tags = Array.isArray(source.tags)
      ? source.tags.map((tag) => clipText(tag, 48)).filter(Boolean).slice(0, 18)
      : [];

    return {
      id: clipText(source.id, 32),
      name: clipText(source.name, 96),
      source: clipText(source.source, 24).toUpperCase(),
      href: clipText(source.href, 180),
      tags: tags,
      swatches: swatches,
      categoryKey: clipText(source.categoryKey || source.category, 48).toLowerCase(),
      thumbnailUrl: thumbnailUrl,
    };
  }

  function buildColorExtractPrompt(payload) {
    const digest = buildSummaryDigest(payload && payload.summary);
    return [
      "Analyze this Figma selection and generate a design-ready 3x5 color palette.",
      "Infer the context automatically from the attached image plus any text hints.",
      "Return JSON only. No markdown. No explanation outside JSON.",
      'Use exactly this schema: {"sourceType":"image|text|mixed","domain":"...","brand":"...","intent":"ui|banner|detail|sns|editorial|general","tone":["..."],"confidence":"high|medium|low","reason":"...","representative":["#RRGGBB","#RRGGBB","#RRGGBB"],"companions":["#RRGGBB","#RRGGBB","#RRGGBB"],"accents":["#RRGGBB","#RRGGBB","#RRGGBB"],"text":["#RRGGBB","#RRGGBB","#RRGGBB"],"surfaces":["#RRGGBB","#RRGGBB","#RRGGBB"]}',
      "Rules:",
      "- representative: 3 distinct main colors grounded in the actual visual or brand cues.",
      "- companions: 1 supporting color for each representative, paired by index, but they should feel expressive rather than conservative.",
      "- accents: 3 bolder pop colors paired by index, with stronger visual punch than companions when the source allows it.",
      "- Prefer vivid accent colors already present in smaller objects, decorations, stickers, typography, or product details instead of defaulting to pale near-neutrals.",
      "- Accent colors should come from real vivid elements in the source whenever possible, not from the same generic fallback trio every time.",
      "- text: 3 semantic text colors ordered as [primary text, highlight text, secondary/subtle text].",
      "- surfaces: 3 soft support colors for backgrounds, chips, cards, or light fills, paired by index.",
      "- Surface colors should reflect real bright fills, clouds, paper, glow, pastel objects, or background materials already visible in the image whenever possible.",
      "- If the selection already contains text colors, treat those existing text fills as a strong hint for the text row instead of replacing them with generic dark UI colors.",
      "- The three text colors must not collapse into the same swatch unless there is an extreme reason.",
      "- primary text should be the default body/headline text color.",
      "- highlight text should be the accent text color for links, emphasis, badges, or key numbers.",
      "- secondary/subtle text should be quieter than primary text but still readable.",
      "- surfaces should stay usable and lighter than the main colors, but still keep the image mood.",
      "- For bright posters, editorial artwork, or playful visuals, the text row may include white, pastel, or vivid highlight colors when the source supports it.",
      "- Avoid duplicate or near-duplicate colors whenever possible.",
      "- Keep the palette useful for digital design and UI work, not painterly.",
      "- For energetic, playful, trendy, or youth-oriented visuals, allow bolder companion colors such as vivid pink, electric blue, sunny yellow, candy purple, neon green, or similar high-chroma accents when justified by the image.",
      "- If a recognizable brand is present, preserve its color character without mechanically copying a single official swatch.",
      "- Consider domain, brand, intent, audience, accessibility, season, and material/style cues when deciding the palette, even if those factors are not explicitly returned.",
      "- If context is unclear, use domain='general', brand='none', intent='ui', confidence='low'.",
      "",
      "Selection summary:",
      JSON.stringify(digest, null, 2),
    ].join("\n");
  }

  async function prepareImagePayloadForAi(imagePayload) {
    const prepared = await shared.prepareInputImage(imagePayload, {
      inputPreparation: {
        mode: "reference-search",
        maxLongEdge: 1600,
        maxPixelCount: 2200000,
        forceGemini2k: false,
      },
    });
    const bytes = shared.normalizeBytes(await prepared.blob.arrayBuffer());
    if (!bytes.length) {
      throw new Error("\uC0C9\uC0C1 \uBD84\uC11D\uC6A9 \uC774\uBBF8\uC9C0 \uB370\uC774\uD130\uAC00 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.");
    }
    return {
      base64: shared.encodeBytesToBase64(bytes),
      mimeType: prepared.blob.type || "image/png",
    };
  }

  async function requestOpenAiColorPalette(providerInfo, payload, signal) {
    const prompt = buildColorExtractPrompt(payload);
    const image = await prepareImagePayloadForAi(payload && payload.image);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerInfo.apiKey}`,
        "Content-Type": "application/json",
      },
      signal,
      body: JSON.stringify({
        model: openAiModel,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an assistant inside a Figma plugin. Return concise structured JSON only, following the requested shape.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${image.mimeType};base64,${image.base64}`,
                },
              },
            ],
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(await buildProviderHttpError("OpenAI", response));
    }
    const data = await response.json();
    return parseJsonResponseText(getOpenAiText(data));
  }

  async function requestGeminiColorPalette(providerInfo, payload, signal) {
    const prompt = buildColorExtractPrompt(payload);
    const image = await prepareImagePayloadForAi(payload && payload.image);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`, {
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
              { text: prompt },
              {
                inline_data: {
                  mime_type: image.mimeType,
                  data: image.base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });
    if (!response.ok) {
      throw new Error(await buildProviderHttpError("Gemini", response));
    }
    const data = await response.json();
    return parseJsonResponseText(getGeminiText(data));
  }

  function hasOpenAiColorFallback(settings) {
    return !!(settings && typeof settings.openAiApiKey === "string" && settings.openAiApiKey.trim());
  }

  async function requestAiColorPalette(payload, signal) {
    const settings = shared.requireReadySettings();
    const providerInfo = shared.resolveUpscaleProvider(settings);
    if (!providerInfo) {
      throw new Error("\uC124\uC815\uC5D0 Gemini \uB610\uB294 OpenAI API \uD0A4\uB97C \uBA3C\uC800 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
    }

    try {
      return providerInfo.provider === "gemini"
        ? await requestGeminiColorPalette(providerInfo, payload, signal)
        : await requestOpenAiColorPalette(providerInfo, payload, signal);
    } catch (error) {
      if (shared.isAbortError(error)) {
        throw error;
      }
      if (providerInfo.provider === "gemini" && hasOpenAiColorFallback(settings)) {
        return requestOpenAiColorPalette(
          {
            provider: "openai",
            apiKey: String(settings.openAiApiKey || "").trim(),
            label: "OpenAI",
          },
          payload,
          signal
        );
      }
      throw error;
    }
  }

  function inferSourceTypeFromSummary(summary) {
    const safeSummary = summary && typeof summary === "object" ? summary : {};
    const hinted = normalizeSourceType(safeSummary.sourceType, "");
    if (hinted) {
      return hinted;
    }
    const textHint = compactText(safeSummary.textHint);
    return textHint ? "mixed" : "image";
  }

  function inferFallbackAnalysis(summary, error) {
    const safeSummary = summary && typeof summary === "object" ? summary : {};
    const haystack = compactText(
      [safeSummary.selectionLabel, safeSummary.targetNodeName, safeSummary.textHint, safeSummary.nodeType].join(" ")
    ).toLowerCase();
    let domain = "general";
    let brand = "none";
    let intent = "ui";
    let tone = ["clean"];

    if (/samsung|삼성|galaxy|비스포크/.test(haystack)) {
      domain = "electronics";
      brand = "Samsung";
      tone = ["clean", "trustworthy", "premium"];
    } else if (/(^|\\s)lg(\\s|$)|엘지|그램|스탠바이미/.test(haystack)) {
      domain = "electronics";
      brand = "LG";
      tone = ["clean", "modern", "friendly"];
    } else if (/apple|iphone|ipad|macbook|애플/.test(haystack)) {
      domain = "electronics";
      brand = "Apple";
      tone = ["minimal", "premium", "clean"];
    } else if (/sport|soccer|football|baseball|basketball|golf|fitness|runner|marathon|운동|스포츠|축구|야구|농구/.test(haystack)) {
      domain = "sports";
      tone = ["energetic", "bold", "high-contrast"];
    } else if (/food|cafe|coffee|drink|beverage|burger|pizza|restaurant|menu|식음료|음료|커피|카페|푸드|버거|피자|메뉴/.test(haystack)) {
      domain = "food";
      tone = ["fresh", "appetizing", "warm"];
    } else if (/beauty|cosmetic|skincare|makeup|perfume|뷰티|화장품|스킨케어/.test(haystack)) {
      domain = "beauty";
      tone = ["soft", "premium", "refined"];
    } else if (/fashion|apparel|lookbook|wear|style|패션|의류/.test(haystack)) {
      domain = "fashion";
      tone = ["editorial", "bold", "refined"];
    } else if (/home|furniture|interior|living|리빙|인테리어|가구/.test(haystack)) {
      domain = "home";
      tone = ["warm", "calm", "modern"];
    }

    if (/banner|hero|promo|campaign|event|배너|프로모션|이벤트|광고/.test(haystack)) {
      intent = "banner";
    } else if (/detail|product|pdp|spec|상세|상품/.test(haystack)) {
      intent = "detail";
    } else if (/sns|social|feed|thumbnail|reel|shorts|인스타|피드|썸네일|유튜브/.test(haystack)) {
      intent = "sns";
    } else if (/editorial|magazine|lookbook|브랜딩|에디토리얼/.test(haystack)) {
      intent = "editorial";
    }

    return {
      sourceType: inferSourceTypeFromSummary(safeSummary),
      domain: domain,
      brand: brand,
      intent: intent,
      tone: tone,
      confidence: error ? "low" : "medium",
      reason: error
        ? "AI analysis fallback used because the model response was unavailable."
        : "Heuristic summary fallback used to fill missing AI fields.",
    };
  }

  function normalizeColorExtractResult(value, payload, fallbackPalette, fallbackAnalysis, usedFallback) {
    const safe = value && typeof value === "object" ? value : {};
    const paletteSource = safe.palette && typeof safe.palette === "object" ? safe.palette : safe;
    const paletteFallback = fallbackPalette || defaultPalette;
    const analysisFallback = fallbackAnalysis || inferFallbackAnalysis(payload && payload.summary, null);

    return {
      analysis: {
        sourceType: normalizeSourceType(safe.sourceType, analysisFallback.sourceType),
        domain: normalizeTag(safe.domain, analysisFallback.domain, 48),
        brand: normalizeBrand(safe.brand, analysisFallback.brand),
        intent: normalizeIntent(safe.intent, analysisFallback.intent),
        tone: normalizeToneList(safe.tone, analysisFallback.tone),
        confidence: normalizeConfidence(safe.confidence, usedFallback ? "low" : analysisFallback.confidence),
        reason: normalizeReason(safe.reason, analysisFallback.reason),
      },
      representative: normalizePaletteRow(paletteSource.representative, paletteFallback.representative),
      companions: normalizePaletteRow(paletteSource.companions, paletteFallback.companions),
      accents: normalizePaletteRow(paletteSource.accents, paletteFallback.accents),
      text: normalizePaletteRow(paletteSource.text, paletteFallback.text),
      surfaces: normalizePaletteRow(paletteSource.surfaces, paletteFallback.surfaces),
    };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function clampByte(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
  }

  function normalizeHue(value) {
    const normalized = Number(value) || 0;
    return ((normalized % 360) + 360) % 360;
  }

  function rgbToHex(r, g, b) {
    const toHex = (channel) => clampByte(channel).toString(16).padStart(2, "0").toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function rgbToHsl(r, g, b) {
    const red = clampByte(r) / 255;
    const green = clampByte(g) / 255;
    const blue = clampByte(b) / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const lightness = (max + min) / 2;
    const delta = max - min;
    let hue = 0;
    let saturation = 0;

    if (delta > 0) {
      saturation = delta / (1 - Math.abs(2 * lightness - 1));
      switch (max) {
        case red:
          hue = ((green - blue) / delta) % 6;
          break;
        case green:
          hue = (blue - red) / delta + 2;
          break;
        default:
          hue = (red - green) / delta + 4;
          break;
      }
      hue *= 60;
    }

    return {
      h: normalizeHue(hue),
      s: clamp(saturation, 0, 1),
      l: clamp(lightness, 0, 1),
    };
  }

  function hslToRgb(h, s, l) {
    const hue = normalizeHue(h);
    const saturation = clamp(s, 0, 1);
    const lightness = clamp(l, 0, 1);
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
    const match = lightness - chroma / 2;
    let red = 0;
    let green = 0;
    let blue = 0;

    if (hue < 60) {
      red = chroma;
      green = x;
    } else if (hue < 120) {
      red = x;
      green = chroma;
    } else if (hue < 180) {
      green = chroma;
      blue = x;
    } else if (hue < 240) {
      green = x;
      blue = chroma;
    } else if (hue < 300) {
      red = x;
      blue = chroma;
    } else {
      red = chroma;
      blue = x;
    }

    return {
      r: clampByte((red + match) * 255),
      g: clampByte((green + match) * 255),
      b: clampByte((blue + match) * 255),
    };
  }

  function createCandidate(r, g, b, count) {
    const hsl = rgbToHsl(r, g, b);
    return {
      r: clampByte(r),
      g: clampByte(g),
      b: clampByte(b),
      count: typeof count === "number" && Number.isFinite(count) ? count : 1,
      hsl,
      hex: rgbToHex(r, g, b),
    };
  }

  function candidateFromHsl(h, s, l, count) {
    const rgb = hslToRgb(h, s, l);
    return createCandidate(rgb.r, rgb.g, rgb.b, count);
  }

  function hueDistance(first, second) {
    const delta = Math.abs(normalizeHue(first) - normalizeHue(second));
    return Math.min(delta, 360 - delta);
  }

  function colorDistance(first, second) {
    const dr = first.r - second.r;
    const dg = first.g - second.g;
    const db = first.b - second.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function relativeLuminance(candidate) {
    const toLinear = (channel) => {
      const value = clampByte(channel) / 255;
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * toLinear(candidate.r) + 0.7152 * toLinear(candidate.g) + 0.0722 * toLinear(candidate.b);
  }

  function contrastRatio(background, foreground) {
    const first = relativeLuminance(background);
    const second = relativeLuminance(foreground);
    const lighter = Math.max(first, second);
    const darker = Math.min(first, second);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function candidateFromHex(hex) {
    const normalized = normalizeHexColor(hex);
    if (!normalized) {
      return null;
    }
    return createCandidate(
      parseInt(normalized.slice(1, 3), 16),
      parseInt(normalized.slice(3, 5), 16),
      parseInt(normalized.slice(5, 7), 16),
      1
    );
  }

  function pickReadableTextColor(backgroundHex) {
    const background = candidateFromHex(backgroundHex) || createCandidate(59, 130, 246, 1);
    const dark = createCandidate(15, 23, 42, 1);
    const light = createCandidate(255, 255, 255, 1);
    return contrastRatio(background, dark) >= contrastRatio(background, light) ? dark.hex : light.hex;
  }

  function buildAdobeTrendHaystack(summary, analysis) {
    const safeSummary = summary && typeof summary === "object" ? summary : {};
    const safeAnalysis = analysis && typeof analysis === "object" ? analysis : {};
    const parts = [
      safeSummary.selectionLabel,
      safeSummary.targetNodeName,
      safeSummary.textHint,
      safeSummary.nodeType,
      safeAnalysis.domain,
      safeAnalysis.brand,
      safeAnalysis.intent,
      Array.isArray(safeAnalysis.tone) ? safeAnalysis.tone.join(" ") : safeAnalysis.tone,
    ];
    return compactText(parts.join(" ")).toLowerCase();
  }

  function scoreKeywordHits(text, keywords, weight) {
    const haystack = compactText(text).toLowerCase();
    const source = Array.isArray(keywords) ? keywords : [];
    let score = 0;

    for (let index = 0; index < source.length; index += 1) {
      const keyword = compactText(source[index]).toLowerCase();
      if (!keyword || !haystack.includes(keyword)) {
        continue;
      }
      score += typeof weight === "number" ? weight : 1;
    }

    return score;
  }

  function rankAdobeTrendCategories(summary, analysis) {
    const haystack = buildAdobeTrendHaystack(summary, analysis);
    const safeAnalysis = analysis && typeof analysis === "object" ? analysis : {};
    const domain = compactText(safeAnalysis.domain).toLowerCase();
    const intent = compactText(safeAnalysis.intent).toLowerCase();
    const tones = Array.isArray(safeAnalysis.tone) ? safeAnalysis.tone.map((tone) => compactText(tone).toLowerCase()) : [];

    const ranked = adobeTrendCategoryProfiles
      .map((profile) => {
        let score = scoreKeywordHits(haystack, profile.keywords, 10);
        if (profile.domains.includes(domain)) {
          score += 36;
        }
        if (profile.intents.includes(intent)) {
          score += 22;
        }
        for (let toneIndex = 0; toneIndex < tones.length; toneIndex += 1) {
          if (profile.tones.includes(tones[toneIndex])) {
            score += 10;
          }
        }
        if (profile.key === "uiux" && intent === "ui") {
          score += 40;
        }
        if (profile.key === "flavor" && domain === "food") {
          score += 48;
        }
        if (profile.key === "fashion" && (domain === "fashion" || domain === "beauty")) {
          score += 42;
        }
        if (profile.key === "architecture" && domain === "home") {
          score += 38;
        }
        return {
          key: profile.key,
          title: profile.title,
          profile: profile,
          score: score,
        };
      })
      .sort((first, second) => second.score - first.score);

    if (!ranked.length || ranked[0].score <= 0) {
      return adobeTrendCategoryProfiles
        .filter((profile) => profile.key === "graphic-design" || profile.key === "uiux" || profile.key === "illustration")
        .map((profile, index) => ({
          key: profile.key,
          title: profile.title,
          profile: profile,
          score: 20 - index * 2,
        }));
    }

    return ranked;
  }

  function scoreAdobeTrendRecord(record, rankedCategories, localContext) {
    const text = compactText(
      [record.name, Array.isArray(record.tags) ? record.tags.join(" ") : "", record.source, record.categoryKey].join(" ")
    ).toLowerCase();
    const categories = Array.isArray(rankedCategories) ? rankedCategories : [];
    let score = 0;

    for (let index = 0; index < Math.min(categories.length, 3); index += 1) {
      const category = categories[index];
      if (!category || !category.profile) {
        continue;
      }
      score += scoreKeywordHits(text, category.profile.keywords, 6 - index);
      if (category.profile.preferredSources.includes(record.source)) {
        score += 14 - index * 2;
      }
      if (record.categoryKey && record.categoryKey === category.key) {
        score += 28 - index * 4;
      }
      if (record.categoryKey && record.categoryKey === "ui-ux" && category.key === "uiux") {
        score += 26;
      }
      score += Math.max(0, category.score / (index === 0 ? 4 : 8));
    }

    if (record.thumbnailUrl) {
      score += record.source === "STOCK" ? 18 : 14;
    }

    const representative = localContext && Array.isArray(localContext.representative) ? localContext.representative : [];
    const companions = localContext && Array.isArray(localContext.companions) ? localContext.companions : [];
    const recordCandidates = (Array.isArray(record.swatches) ? record.swatches : []).map((hex) => candidateFromHex(hex)).filter(Boolean);
    const representativeCandidates = representative.map((hex) => candidateFromHex(hex)).filter(Boolean);
    const companionCandidates = companions.map((hex) => candidateFromHex(hex)).filter(Boolean);

    for (let index = 0; index < recordCandidates.length; index += 1) {
      const candidate = recordCandidates[index];
      if (candidate.hsl.s > 0.4) {
        score += 3;
      }
      if (candidate.hsl.l > 0.74) {
        score += 2;
      }
      if (representativeCandidates.length) {
        const representativeGap = representativeCandidates.reduce((minGap, current) => Math.min(minGap, colorDistance(current, candidate)), Infinity);
        if (representativeGap > 24 && representativeGap < 150) {
          score += 3;
        }
      }
      if (companionCandidates.length) {
        const hueGap = companionCandidates.reduce((minGap, current) => Math.min(minGap, hueDistance(current.hsl.h, candidate.hsl.h)), Infinity);
        if (hueGap < 28) {
          score += 2;
        }
      }
    }

    return score;
  }

  function selectAdobeTrendSwatches(records, mode, localContext) {
    const scoredRecords = Array.isArray(records) ? records : [];
    const selected = [];
    const representative = localContext && Array.isArray(localContext.representative) ? localContext.representative : [];
    const companions = localContext && Array.isArray(localContext.companions) ? localContext.companions : [];

    const recordLimit = mode === "accent" ? 18 : 14;
    for (let recordIndex = 0; recordIndex < Math.min(scoredRecords.length, recordLimit); recordIndex += 1) {
      const record = scoredRecords[recordIndex];
      if (!record || !Array.isArray(record.swatches)) {
        continue;
      }

      for (let swatchIndex = 0; swatchIndex < record.swatches.length; swatchIndex += 1) {
        const hex = record.swatches[swatchIndex];
        const candidate = candidateFromHex(hex);
        if (!candidate || hasSimilarCandidate(selected.map((item) => candidateFromHex(item.hex)).filter(Boolean), candidate, mode === "surface" ? 18 : 28)) {
          continue;
        }

        let score = record.score || 0;
        if (mode === "accent") {
          if (candidate.hsl.s < 0.38 || candidate.hsl.l < 0.16 || candidate.hsl.l > 0.84) {
            continue;
          }
          score += candidate.hsl.s * 120;
          const companionGap = companions.length
            ? companions
                .map((value) => candidateFromHex(value))
                .filter(Boolean)
                .reduce((maxGap, current) => Math.max(maxGap, hueDistance(current.hsl.h, candidate.hsl.h)), 0)
            : 24;
          score += Math.min(64, companionGap) * 0.3;
        } else {
          if (candidate.hsl.l < 0.72 || candidate.hsl.l > 0.98 || candidate.hsl.s > 0.48) {
            continue;
          }
          score += (1 - Math.abs(candidate.hsl.l - 0.88)) * 48;
          const companionHueGap = companions.length
            ? companions
                .map((value) => candidateFromHex(value))
                .filter(Boolean)
                .reduce((minGap, current) => Math.min(minGap, hueDistance(current.hsl.h, candidate.hsl.h)), Infinity)
            : 30;
          if (companionHueGap < 30) {
            score += 20;
          }
          const representativeGap = representative.length
            ? representative
                .map((value) => candidateFromHex(value))
                .filter(Boolean)
                .reduce((minGap, current) => Math.min(minGap, colorDistance(current, candidate)), Infinity)
            : 40;
          if (representativeGap > 20) {
            score += 8;
          }
        }

        selected.push({
          hex: candidate.hex,
          score: score,
        });
      }
    }

    selected.sort((first, second) => second.score - first.score);
    return selected.slice(0, 3).map((item) => item.hex);
  }

  async function hydrateAdobeTrendRecords(records, signal) {
    const source = Array.isArray(records) ? records : [];
    const hydrated = await Promise.all(
      source.map(async (record) => {
        if (!record || (Array.isArray(record.swatches) && record.swatches.length >= 3) || !record.thumbnailUrl) {
          return record;
        }

        const swatches = await fetchAdobeTrendThumbnailSwatches(record, signal);
        if (swatches.length < 3) {
          return record;
        }

        return {
          ...record,
          swatches,
        };
      })
    );

    return hydrated.filter((record) => record && Array.isArray(record.swatches) && record.swatches.length >= 3);
  }

  async function buildAdobeTrendGuide(records, summary, analysis, localContext, signal) {
    const dataset = normalizeAdobeTrendRecords(records);
    if (!dataset.length) {
      return null;
    }

    const rankedCategories = rankAdobeTrendCategories(summary, analysis);
    const preScoredRecords = dataset
      .map((record) => ({
        ...record,
        score: scoreAdobeTrendRecord(record, rankedCategories, localContext),
      }))
      .filter((record) => record.score > 0)
      .sort((first, second) => second.score - first.score);

    if (!preScoredRecords.length) {
      return null;
    }

    const hydratedSubset = await hydrateAdobeTrendRecords(preScoredRecords.slice(0, 12), signal);
    const fallbackHydrated = await hydrateAdobeTrendRecords(dataset.filter((record) => record.thumbnailUrl).slice(0, 6), signal);
    const scoredRecords = mergeAdobeTrendRecordsForGuide(preScoredRecords, hydratedSubset, fallbackHydrated);
    if (!scoredRecords.length) {
      return null;
    }

    const accentRecords = scoredRecords.filter((record) => record.source === "BEHANCE" || record.source === "STOCK");
    const accents = selectAdobeTrendSwatches(accentRecords.length ? accentRecords : scoredRecords, "accent", localContext);
    const surfaces = selectAdobeTrendSwatches(scoredRecords, "surface", localContext);
    return {
      categories: rankedCategories.slice(0, 2).map((item) => item.key),
      categoryLabels: rankedCategories.slice(0, 2).map((item) => item.title),
      accents: accents,
      surfaces: surfaces,
      records: scoredRecords.slice(0, 3).map((record) => ({
        name: record.name,
        source: record.source,
        href: record.href,
      })),
    };
  }

  function mergeAdobeTrendRecordsForGuide(baseRecords, hydratedSubset, fallbackHydrated) {
    const merged = [];
    const hydratedMap = {};
    const seen = {};
    const source = []
      .concat(Array.isArray(hydratedSubset) ? hydratedSubset : [])
      .concat(Array.isArray(fallbackHydrated) ? fallbackHydrated : []);

    for (let index = 0; index < source.length; index += 1) {
      const record = source[index];
      if (!record) {
        continue;
      }
      hydratedMap[buildAdobeTrendRecordKey(record)] = record;
    }

    const base = Array.isArray(baseRecords) ? baseRecords : [];
    for (let index = 0; index < base.length; index += 1) {
      const record = base[index];
      const replacement = hydratedMap[buildAdobeTrendRecordKey(record)] || record;
      if (!replacement || !Array.isArray(replacement.swatches) || replacement.swatches.length < 3) {
        continue;
      }
      const key = buildAdobeTrendRecordKey(replacement);
      if (key && seen[key]) {
        continue;
      }
      if (key) {
        seen[key] = true;
      }
      merged.push({
        ...replacement,
        score:
          (Number(record && record.score) || 0) +
          (replacement.thumbnailUrl ? 8 : 0) +
          (replacement.source === "STOCK" ? 6 : replacement.source === "BEHANCE" ? 4 : 0),
      });
    }

    for (let index = 0; index < source.length; index += 1) {
      const record = source[index];
      const key = buildAdobeTrendRecordKey(record);
      if (!record || !Array.isArray(record.swatches) || record.swatches.length < 3 || (key && seen[key])) {
        continue;
      }
      if (key) {
        seen[key] = true;
      }
      merged.push({
        ...record,
        score: (record.thumbnailUrl ? 24 : 10) + (record.source === "STOCK" ? 8 : record.source === "BEHANCE" ? 6 : 0),
      });
    }

    merged.sort((first, second) => {
      const scoreGap = (second.score || 0) - (first.score || 0);
      if (scoreGap !== 0) {
        return scoreGap;
      }
      return (second.swatches ? second.swatches.length : 0) - (first.swatches ? first.swatches.length : 0);
    });
    return merged;
  }

  function buildAdobeTrendRecordKey(record) {
    const source = record && typeof record === "object" ? record : {};
    return [source.source, source.id, source.href, source.thumbnailUrl].filter(Boolean).join("::");
  }

  function buildColorHuntHaystack(summary, analysis) {
    return buildAdobeTrendHaystack(summary, analysis);
  }

  function rankColorHuntTags(summary, analysis) {
    const haystack = buildColorHuntHaystack(summary, analysis);
    const safeAnalysis = analysis && typeof analysis === "object" ? analysis : {};
    const domain = compactText(safeAnalysis.domain).toLowerCase();
    const intent = compactText(safeAnalysis.intent).toLowerCase();
    const tones = Array.isArray(safeAnalysis.tone) ? safeAnalysis.tone.map((tone) => compactText(tone).toLowerCase()) : [];

    const ranked = colorHuntTagProfiles
      .map((profile) => {
        let score = scoreKeywordHits(haystack, profile.keywords, 10);
        if (profile.domains.includes(domain)) {
          score += 32;
        }
        if (profile.intents.includes(intent)) {
          score += 18;
        }
        for (let index = 0; index < tones.length; index += 1) {
          if (profile.tones.includes(tones[index])) {
            score += 10;
          }
        }
        return {
          key: profile.key,
          title: profile.title,
          profile,
          score,
        };
      })
      .sort((first, second) => second.score - first.score);

    if (!ranked.length || ranked[0].score <= 0) {
      return colorHuntTagProfiles
        .filter((profile) => profile.key === "popular" || profile.key === "gradient" || profile.key === "pastel")
        .map((profile, index) => ({
          key: profile.key,
          title: profile.title,
          profile,
          score: 16 - index * 2,
        }));
    }

    return ranked;
  }

  function scoreColorHuntRecord(record, rankedTags, representative, companions) {
    const text = compactText(
      [record.name, Array.isArray(record.tags) ? record.tags.join(" ") : "", record.categoryKey, record.source].join(" ")
    ).toLowerCase();
    const categories = Array.isArray(rankedTags) ? rankedTags : [];
    let score = record.source === "COLORHUNT" ? 12 : 0;

    for (let index = 0; index < Math.min(categories.length, 3); index += 1) {
      const category = categories[index];
      if (!category || !category.profile) {
        continue;
      }
      score += scoreKeywordHits(text, category.profile.keywords, 6 - index);
      if (record.categoryKey && record.categoryKey === category.key) {
        score += 24 - index * 4;
      }
      score += Math.max(0, category.score / (index === 0 ? 4 : 8));
    }

    const swatches = Array.isArray(record.swatches) ? record.swatches : [];
    const representativeCandidates = (Array.isArray(representative) ? representative : []).map((hex) => candidateFromHex(hex)).filter(Boolean);
    const companionCandidates = (Array.isArray(companions) ? companions : []).map((hex) => candidateFromHex(hex)).filter(Boolean);

    for (let index = 0; index < swatches.length; index += 1) {
      const candidate = candidateFromHex(swatches[index]);
      if (!candidate) {
        continue;
      }
      if (candidate.hsl.s > 0.45) {
        score += 2;
      }
      if (candidate.hsl.l > 0.74 && candidate.hsl.s < 0.42) {
        score += 2;
      }
      if (representativeCandidates.length) {
        const representativeGap = representativeCandidates.reduce((minGap, current) => Math.min(minGap, colorDistance(current, candidate)), Infinity);
        if (representativeGap > 18 && representativeGap < 160) {
          score += 4;
        }
      }
      if (companionCandidates.length) {
        const companionGap = companionCandidates.reduce((minGap, current) => Math.min(minGap, hueDistance(current.hsl.h, candidate.hsl.h)), Infinity);
        if (companionGap < 40) {
          score += 3;
        }
      }
    }

    return score;
  }

  function pickColorHuntCompanionForBase(baseHex, records, usedHexes) {
    const base = candidateFromHex(baseHex);
    let best = null;
    let bestScore = -Infinity;
    const source = Array.isArray(records) ? records : [];

    for (let recordIndex = 0; recordIndex < Math.min(source.length, 18); recordIndex += 1) {
      const record = source[recordIndex];
      const swatches = Array.isArray(record && record.swatches) ? record.swatches : [];
      for (let swatchIndex = 0; swatchIndex < swatches.length; swatchIndex += 1) {
        const candidate = candidateFromHex(swatches[swatchIndex]);
        if (!candidate || (usedHexes && usedHexes[candidate.hex])) {
          continue;
        }
        if (base && colorDistance(base, candidate) < 34) {
          continue;
        }

        let score = Number(record && record.score) || 0;
        if (candidate.hsl.s < 0.24 || candidate.hsl.l < 0.16 || candidate.hsl.l > 0.88) {
          score -= 12;
        } else {
          score += candidate.hsl.s * 54;
        }
        if (base) {
          const hueGap = hueDistance(base.hsl.h, candidate.hsl.h);
          const rgbGap = colorDistance(base, candidate);
          if (hueGap >= 18 && hueGap <= 110) {
            score += 34 - Math.abs(56 - hueGap) * 0.28;
          } else if (hueGap >= 112 && hueGap <= 170) {
            score += 18;
          }
          if (rgbGap >= 28 && rgbGap <= 150) {
            score += 18 - Math.abs(76 - rgbGap) * 0.12;
          }
        }

        if (score > bestScore) {
          bestScore = score;
          best = candidate;
        }
      }
    }

    if (!best) {
      return "";
    }
    if (usedHexes) {
      usedHexes[best.hex] = true;
    }
    return best.hex;
  }

  function pickColorHuntSurfaceForBase(baseHex, records, usedHexes) {
    const base = candidateFromHex(baseHex);
    let best = null;
    let bestScore = -Infinity;
    const source = Array.isArray(records) ? records : [];

    for (let recordIndex = 0; recordIndex < Math.min(source.length, 20); recordIndex += 1) {
      const record = source[recordIndex];
      const swatches = Array.isArray(record && record.swatches) ? record.swatches : [];
      for (let swatchIndex = 0; swatchIndex < swatches.length; swatchIndex += 1) {
        const candidate = candidateFromHex(swatches[swatchIndex]);
        if (!candidate || (usedHexes && usedHexes[candidate.hex])) {
          continue;
        }
        if (candidate.hsl.l < 0.74 || candidate.hsl.l > 0.98 || candidate.hsl.s > 0.46) {
          continue;
        }

        let score = Number(record && record.score) || 0;
        score += (1 - Math.abs(candidate.hsl.l - 0.88)) * 42;
        if (base) {
          const hueGap = hueDistance(base.hsl.h, candidate.hsl.h);
          if (hueGap < 40) {
            score += 18;
          } else if (hueGap < 90) {
            score += 8;
          }
        }

        if (score > bestScore) {
          bestScore = score;
          best = candidate;
        }
      }
    }

    if (!best) {
      return "";
    }
    if (usedHexes) {
      usedHexes[best.hex] = true;
    }
    return best.hex;
  }

  function buildColorHuntGuide(records, summary, analysis, representative, companions) {
    const dataset = normalizeColorHuntRecords(records);
    if (!dataset.length) {
      return null;
    }

    const rankedTags = rankColorHuntTags(summary, analysis);
    const scoredRecords = dataset
      .map((record) => ({
        ...record,
        score: scoreColorHuntRecord(record, rankedTags, representative, companions),
      }))
      .filter((record) => record.score > 0)
      .sort((first, second) => second.score - first.score);

    if (!scoredRecords.length) {
      return null;
    }

    const usedCompanionHexes = {};
    const variationCompanions = [];
    const usedSurfaceHexes = {};
    const variationSurfaces = [];

    for (let index = 0; index < 3; index += 1) {
      const baseHex = companions[index] || representative[index];
      variationCompanions.push(pickColorHuntCompanionForBase(baseHex, scoredRecords, usedCompanionHexes));
      variationSurfaces.push(pickColorHuntSurfaceForBase(baseHex, scoredRecords, usedSurfaceHexes));
    }

    return {
      tags: rankedTags.slice(0, 3).map((item) => item.key),
      tagLabels: rankedTags.slice(0, 3).map((item) => item.title),
      companions: variationCompanions.filter(Boolean).length >= 3 ? variationCompanions : [],
      surfaces: variationSurfaces.filter(Boolean).length >= 3 ? variationSurfaces : [],
      records: scoredRecords.slice(0, 3).map((record) => ({
        name: record.name,
        source: record.source,
        href: record.href,
      })),
    };
  }

  function estimateDarkTextSurface(candidates) {
    if (!Array.isArray(candidates) || !candidates.length) {
      return false;
    }
    const lightnessValues = candidates.map((candidate) => candidate.hsl.l);
    const average = lightnessValues.reduce((sum, value) => sum + value, 0) / lightnessValues.length;
    const darkCount = lightnessValues.filter((value) => value < 0.42).length;
    return average < 0.48 || darkCount >= Math.ceil(lightnessValues.length * 0.6);
  }

  function chooseAccentCandidate(representative, companions, accentCandidates) {
    const pool = []
      .concat(Array.isArray(accentCandidates) ? accentCandidates : [])
      .concat(Array.isArray(companions) ? companions : [])
      .concat(Array.isArray(representative) ? representative : [])
      .map((value) => (typeof value === "string" ? candidateFromHex(value) : value))
      .filter(Boolean);
    let best = null;
    let bestScore = -Infinity;

    for (let index = 0; index < pool.length; index += 1) {
      const candidate = pool[index];
      const score = candidate.hsl.s * 120 - Math.abs(candidate.hsl.l - 0.52) * 24;
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    return best;
  }

  function tuneAccentTextColor(candidate, darkSurface) {
    const source = candidate || createCandidate(37, 99, 235, 1);
    const saturation = clamp(Math.max(source.hsl.s, 0.42), 0.36, 0.88);
    const lightness = darkSurface ? clamp(Math.max(source.hsl.l, 0.68), 0.62, 0.82) : clamp(Math.min(source.hsl.l, 0.42), 0.28, 0.46);
    return candidateFromHsl(source.hsl.h, saturation, lightness, 1).hex;
  }

  function buildSubtleTextColor(candidate, darkSurface, primaryCandidate) {
    const source = candidate || createCandidate(100, 116, 139, 1);
    const primary = primaryCandidate || null;
    const hue = source.hsl.h;
    const primaryIsLight = !!primary && primary.hsl.l > 0.78;
    const saturation = primaryIsLight
      ? clamp(source.hsl.s * 0.22 + 0.06, 0.08, 0.26)
      : darkSurface
        ? clamp(source.hsl.s * 0.22 + 0.04, 0.06, 0.24)
        : clamp(source.hsl.s * 0.28 + 0.04, 0.08, 0.28);
    const lightness = primaryIsLight
      ? clamp(primary.hsl.l - 0.1, 0.74, 0.9)
      : darkSurface
        ? clamp(Math.max(source.hsl.l, 0.78), 0.74, 0.88)
        : clamp(Math.min(Math.max(source.hsl.l, 0.52), 0.68), 0.5, 0.72);
    return candidateFromHsl(hue, saturation, lightness, 1).hex;
  }

  function areHexesNear(firstHex, secondHex, threshold) {
    const first = candidateFromHex(firstHex);
    const second = candidateFromHex(secondHex);
    if (!first || !second) {
      return false;
    }
    return colorDistance(first, second) < threshold;
  }

  function isAccentTextWeak(hex) {
    const candidate = candidateFromHex(hex);
    return !candidate || candidate.hsl.s < 0.28 || candidate.hsl.l < 0.2 || candidate.hsl.l > 0.9;
  }

  function choosePrimaryTextHint(textHintColors) {
    const candidates = (Array.isArray(textHintColors) ? textHintColors : []).map((hex) => candidateFromHex(hex)).filter(Boolean);
    if (!candidates.length) {
      return null;
    }

    let best = null;
    let bestScore = -Infinity;
    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      let score = Math.max(0, 12 - index * 2);
      if (candidate.hsl.s < 0.18) {
        score += 26;
      }
      if (candidate.hsl.l > 0.84 || candidate.hsl.l < 0.24) {
        score += 28;
      }
      if (candidate.hsl.s > 0.56 && candidate.hsl.l > 0.28 && candidate.hsl.l < 0.78) {
        score -= 18;
      }
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    return best || candidates[0];
  }

  function chooseHighlightTextHint(textHintColors, primaryHex) {
    const primary = candidateFromHex(primaryHex);
    const candidates = (Array.isArray(textHintColors) ? textHintColors : []).map((hex) => candidateFromHex(hex)).filter(Boolean);
    let best = null;
    let bestScore = -Infinity;

    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      if (primary && areHexesNear(primary.hex, candidate.hex, 38)) {
        continue;
      }

      let score = candidate.hsl.s * 120 + Math.max(0, 10 - index * 2);
      if (primary) {
        score += Math.min(80, hueDistance(primary.hsl.h, candidate.hsl.h)) * 0.24;
      }
      if (candidate.hsl.l < 0.18 || candidate.hsl.l > 0.92) {
        score -= 18;
      }
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    return best;
  }

  function chooseSubtleTextHint(textHintColors, primaryHex, accentHex) {
    const primary = candidateFromHex(primaryHex);
    const accent = candidateFromHex(accentHex);
    const candidates = (Array.isArray(textHintColors) ? textHintColors : []).map((hex) => candidateFromHex(hex)).filter(Boolean);
    let best = null;
    let bestScore = -Infinity;

    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      if ((primary && areHexesNear(primary.hex, candidate.hex, 34)) || (accent && areHexesNear(accent.hex, candidate.hex, 28))) {
        continue;
      }

      let score = Math.max(0, 10 - index * 2);
      if (candidate.hsl.s < 0.34) {
        score += 20;
      } else {
        score -= Math.min(18, candidate.hsl.s * 26);
      }
      if (primary && primary.hsl.l > 0.78) {
        score += candidate.hsl.l > 0.68 ? 18 : -10;
      } else {
        score += candidate.hsl.l > 0.34 && candidate.hsl.l < 0.74 ? 12 : -8;
      }
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    return best;
  }

  function buildFallbackTextRolePalette(representative, companions, accentCandidates, textHintColors) {
    const candidates = []
      .concat(Array.isArray(representative) ? representative : [])
      .concat(Array.isArray(companions) ? companions : [])
      .concat(Array.isArray(accentCandidates) ? accentCandidates.map((candidate) => candidate.hex) : [])
      .map((hex) => candidateFromHex(hex))
      .filter(Boolean);
    const primaryHint = choosePrimaryTextHint(textHintColors);
    const darkSurface = primaryHint ? primaryHint.hsl.l > 0.78 : estimateDarkTextSurface(candidates);
    const primary = primaryHint ? primaryHint.hex : darkSurface ? "#F8FAFC" : "#0F172A";
    const accentCandidate = chooseAccentCandidate(representative, companions, accentCandidates);
    const highlightHint = chooseHighlightTextHint(textHintColors, primary);
    const accent = highlightHint ? highlightHint.hex : tuneAccentTextColor(accentCandidate, darkSurface);
    const subtleHint = chooseSubtleTextHint(textHintColors, primary, accent);
    const subtle = subtleHint
      ? subtleHint.hex
      : buildSubtleTextColor(highlightHint || accentCandidate, darkSurface, primaryHint || candidateFromHex(primary));
    return [primary, accent, subtle];
  }

  function normalizeSemanticTextPalette(textRow, representative, companions, accentCandidates, textHintColors) {
    const fallback = buildFallbackTextRolePalette(representative, companions, accentCandidates, textHintColors);
    const source = Array.isArray(textRow) ? textRow : [];
    const hasTextHints = Array.isArray(textHintColors) && textHintColors.length > 0;
    let primary = hasTextHints ? fallback[0] : normalizeHexColor(source[0]) || fallback[0];
    let accent = normalizeHexColor(source[1]) || fallback[1];
    let subtle = normalizeHexColor(source[2]) || fallback[2];
    const primaryCandidate = candidateFromHex(primary);
    const darkSurface = primaryCandidate ? primaryCandidate.hsl.l > 0.78 : false;

    if (areHexesNear(primary, accent, 42) || isAccentTextWeak(accent)) {
      accent = fallback[1];
    }
    if (areHexesNear(primary, subtle, hasTextHints ? 48 : 34) || areHexesNear(accent, subtle, hasTextHints ? 36 : 28)) {
      subtle = fallback[2];
    }
    if (areHexesNear(primary, accent, 42)) {
      primary = fallback[0];
      accent = fallback[1];
    }
    if (areHexesNear(primary, subtle, hasTextHints ? 48 : 34)) {
      subtle = buildSubtleTextColor(candidateFromHex(accent), darkSurface, candidateFromHex(primary));
    }

    return [primary, accent, subtle];
  }

  function loadImageFromBlob(blob, loadErrorMessage) {
    if (!(blob instanceof Blob) || !(blob.size > 0)) {
      throw new Error(loadErrorMessage || "\uC120\uD0DD \uC774\uBBF8\uC9C0\uB97C \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const element = new Image();
      element.onload = () => {
        URL.revokeObjectURL(url);
        resolve(element);
      };
      element.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(loadErrorMessage || "\uC120\uD0DD \uC774\uBBF8\uC9C0\uB97C \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC5F4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."));
      };
      element.src = url;
    });
  }

  function loadImageFromBytes(image) {
    const bytes = shared.normalizeBytes(image && image.bytes);
    if (!bytes.length) {
      throw new Error("\uC120\uD0DD \uC774\uBBF8\uC9C0\uB97C \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    return loadImageFromBlob(
      new Blob([bytes], {
        type: image && typeof image.mimeType === "string" && image.mimeType ? image.mimeType : "image/png",
      }),
      "\uC120\uD0DD \uC774\uBBF8\uC9C0\uB97C \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC5F4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."
    );
  }

  function decodeImageElementToImageData(element, maxEdge) {
    const width = Number(element.naturalWidth) || Number(element.width) || 0;
    const height = Number(element.naturalHeight) || Number(element.height) || 0;
    if (!(width > 0 && height > 0)) {
      throw new Error("\uC120\uD0DD \uC774\uBBF8\uC9C0 \uD06C\uAE30\uB97C \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    const limit = Math.max(80, Number(maxEdge) || 320);
    const scale = Math.min(1, limit / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("\uC0C9\uC0C1 \uBD84\uC11D \uC6A9 \uCE94\uBC84\uC2A4\uB97C \uB9CC\uB4E4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(element, 0, 0, canvas.width, canvas.height);
    return context.getImageData(0, 0, canvas.width, canvas.height);
  }

  async function decodeImageToImageData(image) {
    const element = await loadImageFromBytes(image);
    return decodeImageElementToImageData(element, 320);
  }

  async function decodeBlobToImageData(blob, maxEdge) {
    const element = await loadImageFromBlob(blob, "\uC5B4\uB3C4\uBE44 \uB808\uD37C\uB7F0\uC2A4 \uC378\uB124\uC77C\uC744 \uC5F4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
    return decodeImageElementToImageData(element, maxEdge || 240);
  }

  function dedupeHexPalette(values, limit) {
    const source = Array.isArray(values) ? values : [];
    const normalized = [];
    const seen = {};

    for (let index = 0; index < source.length; index += 1) {
      const hex = normalizeHexColor(source[index]);
      if (!hex || seen[hex]) {
        continue;
      }
      seen[hex] = true;
      normalized.push(hex);
      if (normalized.length >= Math.max(3, Number(limit) || 0)) {
        break;
      }
    }

    return normalized;
  }

  async function fetchAdobeTrendThumbnailSwatches(record, signal) {
    const url = record && typeof record.thumbnailUrl === "string" ? record.thumbnailUrl.trim() : "";
    if (!url) {
      return [];
    }
    if (adobeTrendThumbnailPaletteCache.has(url)) {
      return await adobeTrendThumbnailPaletteCache.get(url);
    }

    const promise = (async () => {
      const response = await fetch(url, {
        signal,
        cache: "force-cache",
      });
      if (!response || !response.ok) {
        throw new Error(`Adobe thumbnail fetch failed (${response ? response.status : "?"})`);
      }

      const blob = await response.blob();
      const imageData = await decodeBlobToImageData(blob, 240);
      const candidates = buildColorCandidates(imageData);
      const representative = selectRepresentativeColors(candidates).map((candidate) => candidate.hex);
      const accents = selectAccentCandidates(candidates, representative)
        .slice(0, 4)
        .map((candidate) => candidate.hex);
      const surfaces = selectSurfaceCandidates(candidates, representative, representative)
        .slice(0, 3)
        .map((candidate) => candidate.hex);
      const swatches = dedupeHexPalette([].concat(accents, representative, surfaces), 7);
      if (swatches.length >= 3) {
        return swatches;
      }
      return dedupeHexPalette(representative, 5);
    })();

    adobeTrendThumbnailPaletteCache.set(url, promise);
    try {
      return await promise;
    } catch (error) {
      adobeTrendThumbnailPaletteCache.delete(url);
      if (!shared.isAbortError(error)) {
        console.warn("[pigma] adobe thumbnail swatch extraction failed:", url, error);
      }
      return [];
    }
  }

  function buildColorCandidates(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const totalPixels = Math.max(1, width * height);
    const stride = width * height > 64000 ? 2 : 1;
    const buckets = {};

    for (let y = 0; y < height; y += stride) {
      for (let x = 0; x < width; x += stride) {
        const offset = (y * width + x) * 4;
        const alpha = data[offset + 3];
        if (alpha < 24) {
          continue;
        }

        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const key = `${Math.round(red / 16)}-${Math.round(green / 16)}-${Math.round(blue / 16)}`;
        if (!buckets[key]) {
          buckets[key] = {
            count: 0,
            r: 0,
            g: 0,
            b: 0,
            minX: x,
            maxX: x,
            minY: y,
            maxY: y,
          };
        }

        buckets[key].count += 1;
        buckets[key].r += red;
        buckets[key].g += green;
        buckets[key].b += blue;
        buckets[key].minX = Math.min(buckets[key].minX, x);
        buckets[key].maxX = Math.max(buckets[key].maxX, x);
        buckets[key].minY = Math.min(buckets[key].minY, y);
        buckets[key].maxY = Math.max(buckets[key].maxY, y);
      }
    }

    const candidates = [];
    Object.keys(buckets).forEach((key) => {
      const entry = buckets[key];
      if (!entry || entry.count <= 0) {
        return;
      }
      const candidate = createCandidate(entry.r / entry.count, entry.g / entry.count, entry.b / entry.count, entry.count);
      const spanWidth = Math.max(1, entry.maxX - entry.minX + 1);
      const spanHeight = Math.max(1, entry.maxY - entry.minY + 1);
      const spreadArea = spanWidth * spanHeight;
      candidate.pixelRatio = entry.count / totalPixels;
      candidate.spreadRatio = spreadArea / totalPixels;
      candidate.compactness = entry.count / spreadArea;
      candidates.push(candidate);
    });

    candidates.sort((first, second) => {
      if (second.count !== first.count) {
        return second.count - first.count;
      }
      if (second.hsl.s !== first.hsl.s) {
        return second.hsl.s - first.hsl.s;
      }
      return second.hsl.l - first.hsl.l;
    });

    return candidates;
  }

  function isBackgroundLikeCandidate(candidate) {
    return candidate.hsl.s < 0.08 && (candidate.hsl.l > 0.94 || candidate.hsl.l < 0.08);
  }

  function hasSimilarCandidate(selected, candidate, threshold) {
    for (let index = 0; index < selected.length; index += 1) {
      const current = selected[index];
      if (colorDistance(current, candidate) < threshold) {
        return true;
      }
      if (
        hueDistance(current.hsl.h, candidate.hsl.h) < 16 &&
        Math.abs(current.hsl.l - candidate.hsl.l) < 0.12 &&
        Math.abs(current.hsl.s - candidate.hsl.s) < 0.18
      ) {
        return true;
      }
    }
    return false;
  }

  function deriveRepresentativeColor(base, index) {
    const source = base || createCandidate(59, 130, 246, 1);
    const hueShift = index === 1 ? 18 : -22;
    const nextHue = normalizeHue(source.hsl.h + hueShift);
    const nextSaturation = clamp(source.hsl.s + (index === 1 ? 0.12 : -0.04), 0.18, 0.82);
    const nextLightness = clamp(source.hsl.l + (index === 1 ? 0.16 : -0.14), 0.22, 0.82);
    return candidateFromHsl(nextHue, nextSaturation, nextLightness, 1);
  }

  function selectRepresentativeColors(candidates) {
    const source = candidates.filter((candidate) => !isBackgroundLikeCandidate(candidate));
    const pool = source.length ? source : candidates.slice();
    const selected = [];
    const thresholds = [96, 76, 56, 40, 28, 18];

    for (let thresholdIndex = 0; thresholdIndex < thresholds.length; thresholdIndex += 1) {
      const threshold = thresholds[thresholdIndex];
      for (let index = 0; index < pool.length; index += 1) {
        const candidate = pool[index];
        if (hasSimilarCandidate(selected, candidate, threshold)) {
          continue;
        }
        selected.push(candidate);
        if (selected.length >= 3) {
          return selected.slice(0, 3);
        }
      }
    }

    if (!selected.length && candidates.length) {
      selected.push(candidates[0]);
    }

    while (selected.length < 3) {
      selected.push(deriveRepresentativeColor(selected[0], selected.length));
    }

    return selected.slice(0, 3);
  }

  function selectAccentCandidates(candidates, representative) {
    const selected = [];
    const representativeCandidates = (Array.isArray(representative) ? representative : []).map((hex) => candidateFromHex(hex)).filter(Boolean);

    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      if (!candidate || candidate.hsl.s < 0.2 || candidate.hsl.l < 0.12 || candidate.hsl.l > 0.9) {
        continue;
      }
      if (hasSimilarCandidate(selected, candidate, 38)) {
        continue;
      }

      const minRepresentativeGap = representativeCandidates.length
        ? representativeCandidates.reduce((minGap, current) => Math.min(minGap, colorDistance(current, candidate)), Infinity)
        : 999;
      const minHueGap = representativeCandidates.length
        ? representativeCandidates.reduce((minGap, current) => Math.min(minGap, hueDistance(current.hsl.h, candidate.hsl.h)), Infinity)
        : 180;

      let score = candidate.hsl.s * 132 + (1 - Math.abs(candidate.hsl.l - 0.56)) * 26 + Math.min(Math.log(candidate.count + 1) * 8, 18);
      score += Math.min(minHueGap, 120) * 0.18;
      score += Math.min(28, Math.max(0, (candidate.compactness || 0) * 180));
      if (minRepresentativeGap < 30) {
        score -= 12;
      } else if (minRepresentativeGap > 52) {
        score += 10;
      }
      if (candidate.hsl.s > 0.58) {
        score += 16;
      }
      if (candidate.hsl.l > 0.22 && candidate.hsl.l < 0.8) {
        score += 8;
      }
      if ((candidate.spreadRatio || 0) > 0.42) {
        score -= 40;
      } else if ((candidate.spreadRatio || 0) > 0.24) {
        score -= 18;
      } else if ((candidate.spreadRatio || 0) < 0.08) {
        score += 12;
      }
      if ((candidate.pixelRatio || 0) < 0.002) {
        score -= 8;
      } else if ((candidate.pixelRatio || 0) < 0.04) {
        score += 6;
      }

      candidate.__accentScore = score;
      selected.push(candidate);
    }

    selected.sort((first, second) => second.__accentScore - first.__accentScore);
    return selected.slice(0, 9);
  }

  function selectSurfaceCandidates(candidates, representative, companions) {
    const selected = [];
    const representativeCandidates = (Array.isArray(representative) ? representative : []).map((hex) => candidateFromHex(hex)).filter(Boolean);
    const companionCandidates = (Array.isArray(companions) ? companions : []).map((hex) => candidateFromHex(hex)).filter(Boolean);

    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      if (!candidate || candidate.hsl.l < 0.72 || candidate.hsl.l > 0.98 || candidate.hsl.s > 0.46) {
        continue;
      }
      if (hasSimilarCandidate(selected, candidate, 20)) {
        continue;
      }

      const minRepresentativeGap = representativeCandidates.length
        ? representativeCandidates.reduce((minGap, current) => Math.min(minGap, colorDistance(current, candidate)), Infinity)
        : 999;
      const minCompanionHueGap = companionCandidates.length
        ? companionCandidates.reduce((minGap, current) => Math.min(minGap, hueDistance(current.hsl.h, candidate.hsl.h)), Infinity)
        : 180;

      let score = (1 - Math.abs(candidate.hsl.l - 0.88)) * 44 + Math.min(Math.log(candidate.count + 1) * 10, 22);
      score += (0.24 - Math.abs(candidate.hsl.s - 0.2)) * 40;
      score += Math.min(34, (candidate.spreadRatio || 0) * 70);
      if (minRepresentativeGap > 22) {
        score += 12;
      }
      if (minCompanionHueGap < 22) {
        score += 18;
      } else if (minCompanionHueGap < 42) {
        score += 10;
      }
      if ((candidate.compactness || 0) > 0.28) {
        score -= 12;
      }
      if ((candidate.pixelRatio || 0) > 0.04) {
        score += 10;
      }

      candidate.__surfaceScore = score;
      selected.push(candidate);
    }

    selected.sort((first, second) => second.__surfaceScore - first.__surfaceScore);
    return selected.slice(0, 9);
  }

  function hasEnergeticColorIntent(analysis) {
    const source = analysis && typeof analysis === "object" ? analysis : {};
    const domain = compactText(source.domain).toLowerCase();
    const intent = compactText(source.intent).toLowerCase();
    const tones = Array.isArray(source.tone) ? source.tone.join(" ").toLowerCase() : compactText(source.tone).toLowerCase();
    return /sports|fashion|beauty|music|kids|gaming|food/.test(domain) || /banner|sns/.test(intent) || /energetic|bold|playful|high-contrast|youthful|trendy/.test(tones);
  }

  function deriveExpressiveCompanionColor(base, index, analysis) {
    const source = base || createCandidate(59, 130, 246, 1);
    const energetic = hasEnergeticColorIntent(analysis) || source.hsl.s > 0.45;
    const shifts = energetic ? [122, -150, 64] : [88, -102, 138];
    const defaultHues = energetic ? [320, 276, 52] : [330, 210, 40];
    const hue =
      source.hsl.s < 0.16 && source.hsl.l > 0.82
        ? defaultHues[index % defaultHues.length]
        : normalizeHue(source.hsl.h + shifts[index % shifts.length]);
    const saturationFloor = energetic ? 0.62 : 0.46;
    const lightnessTarget = energetic ? [0.58, 0.62, 0.52][index % 3] : [0.56, 0.5, 0.6][index % 3];
    const saturation = clamp(Math.max(source.hsl.s, saturationFloor), saturationFloor, 0.9);
    const lightness = clamp(lightnessTarget, 0.34, 0.72);
    return candidateFromHsl(hue, saturation, lightness, 1);
  }

  function deriveCompanionColor(base, index) {
    const source = base || createCandidate(59, 130, 246, 1);
    let hue = normalizeHue(source.hsl.h + (index === 1 ? -30 : 32));
    let saturation = source.hsl.s < 0.16 ? 0.42 + index * 0.08 : clamp(source.hsl.s * 0.9 + 0.08, 0.24, 0.82);
    let lightness = clamp(source.hsl.l + (source.hsl.l > 0.58 ? -0.16 : 0.14), 0.28, 0.72);

    if (source.hsl.s < 0.1 && source.hsl.l > 0.84) {
      hue = [210, 28, 145][index % 3];
      saturation = 0.46;
      lightness = 0.54;
    }

    return candidateFromHsl(hue, saturation, lightness, 1);
  }

  function pickCompanionColor(base, candidates, usedHexes, index) {
    let best = null;
    let bestScore = -Infinity;

    for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
      const candidate = candidates[candidateIndex];
      if (usedHexes[candidate.hex]) {
        continue;
      }

      const rgbGap = colorDistance(base, candidate);
      if (rgbGap < 36) {
        continue;
      }

      const hueGap = hueDistance(base.hsl.h, candidate.hsl.h);
      const saturationGap = Math.abs(base.hsl.s - candidate.hsl.s);
      const lightnessGap = Math.abs(base.hsl.l - candidate.hsl.l);
      let score = Math.min(40, candidate.count);

      if (hueGap >= 18 && hueGap <= 72) {
        score += 42 - Math.abs(40 - hueGap);
      } else if (hueGap >= 110 && hueGap <= 168) {
        score += 20 - Math.abs(138 - hueGap) / 2;
      } else {
        score -= 10;
      }

      score -= saturationGap * 18;
      score -= lightnessGap * 16;
      if (candidate.hsl.s < 0.12 && base.hsl.s > 0.2) {
        score -= 12;
      }

      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    if (!best || bestScore < 6) {
      best = deriveCompanionColor(base, index);
    }

    usedHexes[best.hex] = true;
    return best;
  }

  function isCompanionTooConservative(hex, representativeHex) {
    const candidate = candidateFromHex(hex);
    const representative = candidateFromHex(representativeHex);
    if (!candidate) {
      return true;
    }
    if (candidate.hsl.s < 0.2 || candidate.hsl.l > 0.92 || candidate.hsl.l < 0.1) {
      return true;
    }
    if (representative && (colorDistance(candidate, representative) < 38 || hueDistance(candidate.hsl.h, representative.hsl.h) < 16)) {
      return true;
    }
    return false;
  }

  function buildExpressiveCompanionPalette(representative, accentCandidates, analysis) {
    const usedHexes = {};
    const rows = [];

    for (let index = 0; index < representative.length; index += 1) {
      const baseHex = representative[index];
      const base = candidateFromHex(baseHex) || createCandidate(59, 130, 246, 1);
      let selected = null;

      for (let accentIndex = 0; accentIndex < accentCandidates.length; accentIndex += 1) {
        const accent = accentCandidates[accentIndex];
        if (!accent || usedHexes[accent.hex]) {
          continue;
        }
        if (colorDistance(base, accent) < 52) {
          continue;
        }
        if (hueDistance(base.hsl.h, accent.hsl.h) < 28) {
          continue;
        }
        selected = accent;
        break;
      }

      if (!selected) {
        selected = deriveExpressiveCompanionColor(base, index, analysis);
      }

      usedHexes[selected.hex] = true;
      rows.push(selected.hex);
    }

    return rows;
  }

  function normalizeCompanionPalette(companions, representative, accentCandidates, analysis) {
    const source = Array.isArray(companions) ? companions : [];
    const expressiveFallback = buildExpressiveCompanionPalette(representative, accentCandidates, analysis);
    const normalized = [];

    for (let index = 0; index < 3; index += 1) {
      const current = normalizeHexColor(source[index]) || expressiveFallback[index];
      normalized.push(current);
    }

    const weakCount = normalized.filter((hex, index) => isCompanionTooConservative(hex, representative[index])).length;
    if (weakCount >= 2) {
      return expressiveFallback;
    }

    for (let index = 0; index < normalized.length; index += 1) {
      const current = normalized[index];
      if (isCompanionTooConservative(current, representative[index])) {
        normalized[index] = expressiveFallback[index];
        continue;
      }
      for (let compareIndex = 0; compareIndex < index; compareIndex += 1) {
        if (areHexesNear(normalized[compareIndex], current, 32)) {
          normalized[index] = expressiveFallback[index];
          break;
        }
      }
    }

    return normalized;
  }

  function deriveAccentColor(base, index, analysis) {
    const source = base || createCandidate(236, 72, 153, 1);
    const energetic = hasEnergeticColorIntent(analysis) || source.hsl.s > 0.42;
    const shifts = energetic ? [154, -118, 208] : [136, -92, 182];
    const defaultHues = energetic ? [320, 142, 48] : [330, 200, 42];
    const hue =
      source.hsl.s < 0.14 && source.hsl.l > 0.82
        ? defaultHues[index % defaultHues.length]
        : normalizeHue(source.hsl.h + shifts[index % shifts.length]);
    const saturation = clamp(Math.max(source.hsl.s, energetic ? 0.68 : 0.56), energetic ? 0.68 : 0.56, 0.94);
    const lightness = energetic ? [0.58, 0.52, 0.56][index % 3] : [0.56, 0.48, 0.54][index % 3];
    return candidateFromHsl(hue, saturation, lightness, 1);
  }

  function buildAccentPalette(representative, companions, accentCandidates, analysis) {
    const usedHexes = {};
    const palette = [];

    for (let index = 0; index < representative.length; index += 1) {
      const base = candidateFromHex(representative[index]) || createCandidate(59, 130, 246, 1);
      const companion = candidateFromHex(companions[index]);
      let best = null;
      let bestScore = -Infinity;

      for (let accentIndex = 0; accentIndex < accentCandidates.length; accentIndex += 1) {
        const accent = accentCandidates[accentIndex];
        if (!accent || usedHexes[accent.hex]) {
          continue;
        }
        const baseGap = colorDistance(base, accent);
        const baseHueGap = hueDistance(base.hsl.h, accent.hsl.h);
        const companionGap = companion ? colorDistance(companion, accent) : 999;

        let score = accent.hsl.s * 140 + Math.min(120, baseHueGap) * 0.26;
        score += Math.min(Math.log(accent.count + 1) * 10, 18);
        if (accent.hsl.l > 0.2 && accent.hsl.l < 0.82) {
          score += 12;
        }
        if (baseGap >= 58) {
          score += 18;
        } else if (baseGap < 34) {
          score -= 18;
        }
        if (baseHueGap >= 32) {
          score += 12;
        } else if (baseHueGap < 16) {
          score -= 14;
        }
        if (companionGap < 24) {
          score -= 10;
        }
        if (score > bestScore) {
          bestScore = score;
          best = accent;
        }
      }

      if (!best) {
        for (let accentIndex = 0; accentIndex < accentCandidates.length; accentIndex += 1) {
          const accent = accentCandidates[accentIndex];
          if (!accent || usedHexes[accent.hex]) {
            continue;
          }
          best = accent;
          break;
        }
      }

      if (!best) {
        best = deriveAccentColor(companion || base, index, analysis);
      }

      usedHexes[best.hex] = true;
      palette.push(best.hex);
    }

    return palette;
  }

  function isAccentTooWeak(hex, representativeHex, companionHex) {
    const candidate = candidateFromHex(hex);
    const representative = candidateFromHex(representativeHex);
    const companion = candidateFromHex(companionHex);
    if (!candidate) {
      return true;
    }
    if (candidate.hsl.s < 0.32 || candidate.hsl.l < 0.18 || candidate.hsl.l > 0.9) {
      return true;
    }
    if (representative && (colorDistance(candidate, representative) < 40 || hueDistance(candidate.hsl.h, representative.hsl.h) < 18)) {
      return true;
    }
    if (companion && colorDistance(candidate, companion) < 28) {
      return true;
    }
    return false;
  }

  function rowLooksLikeDefaults(source, defaults, threshold) {
    if (!Array.isArray(source) || !Array.isArray(defaults) || source.length < 3 || defaults.length < 3) {
      return false;
    }
    for (let index = 0; index < 3; index += 1) {
      if (!areHexesNear(source[index], defaults[index], threshold)) {
        return false;
      }
    }
    return true;
  }

  function countNearPaletteDuplicates(row, threshold) {
    if (!Array.isArray(row) || row.length < 2) {
      return 0;
    }
    let duplicates = 0;
    for (let index = 0; index < row.length; index += 1) {
      for (let compareIndex = 0; compareIndex < index; compareIndex += 1) {
        if (areHexesNear(row[index], row[compareIndex], threshold)) {
          duplicates += 1;
          break;
        }
      }
    }
    return duplicates;
  }

  function shouldPreferAdobeTrendRow(mode, baseRow, trendRow, representative, companions, analysis, localContext) {
    if (!hasCompletePaletteRow(trendRow)) {
      return false;
    }

    const isAccentMode = mode === "accent";
    const defaults = isAccentMode ? defaultPalette.accents : defaultPalette.surfaces;
    const nearThreshold = isAccentMode ? 28 : 18;
    const defaultThreshold = isAccentMode ? 20 : 16;
    const normalized = normalizePaletteRow(baseRow, defaults);
    const weakCount = normalized.filter((hex, index) =>
      isAccentMode ? isAccentTooWeak(hex, representative[index], companions[index]) : isSurfaceTooWeak(hex, representative[index])
    ).length;
    const duplicateCount = countNearPaletteDuplicates(normalized, nearThreshold);
    const localSignals = isAccentMode
      ? localContext && Array.isArray(localContext.accentCandidates) && localContext.accentCandidates.length > 0
      : localContext && Array.isArray(localContext.surfaceCandidates) && localContext.surfaceCandidates.length > 0;

    if (rowLooksLikeDefaults(normalized, defaults, defaultThreshold)) {
      return true;
    }
    if (!localSignals) {
      return true;
    }
    if (weakCount >= 2) {
      return true;
    }
    if (duplicateCount >= 1 && weakCount >= 1) {
      return true;
    }
    if (isAccentMode && weakCount >= 1 && hasEnergeticColorIntent(analysis)) {
      return true;
    }
    return false;
  }

  function normalizeAccentPalette(accents, representative, companions, accentCandidates, analysis) {
    const source = Array.isArray(accents) ? accents : [];
    const fallback = buildAccentPalette(representative, companions, accentCandidates, analysis);
    const normalized = [];

    for (let index = 0; index < 3; index += 1) {
      normalized.push(normalizeHexColor(source[index]) || fallback[index]);
    }

    if (accentCandidates.length && rowLooksLikeDefaults(normalized, defaultPalette.accents, 20)) {
      return fallback;
    }

    const weakCount = normalized.filter((hex, index) => isAccentTooWeak(hex, representative[index], companions[index])).length;
    if (weakCount >= 2) {
      return fallback;
    }

    for (let index = 0; index < normalized.length; index += 1) {
      if (isAccentTooWeak(normalized[index], representative[index], companions[index])) {
        normalized[index] = fallback[index];
        continue;
      }
      for (let compareIndex = 0; compareIndex < index; compareIndex += 1) {
        if (areHexesNear(normalized[compareIndex], normalized[index], 28)) {
          normalized[index] = fallback[index];
          break;
        }
      }
    }

    return normalized;
  }

  function deriveSurfaceColor(baseHex, companionHex, accentHex, index, analysis) {
    const source =
      candidateFromHex(companionHex) ||
      candidateFromHex(baseHex) ||
      candidateFromHex(accentHex) ||
      createCandidate(224, 242, 254, 1);
    const energetic = hasEnergeticColorIntent(analysis) || source.hsl.s > 0.46;
    const hue = source.hsl.h;
    const saturation = energetic ? clamp(source.hsl.s * 0.34 + 0.08, 0.12, 0.38) : clamp(source.hsl.s * 0.24 + 0.05, 0.08, 0.28);
    const lightness = energetic ? [0.94, 0.88, 0.8][index % 3] : [0.95, 0.9, 0.84][index % 3];
    return candidateFromHsl(hue, saturation, lightness, 1).hex;
  }

  function buildSurfacePalette(representative, companions, accents, analysis, surfaceCandidates) {
    const usedHexes = {};
    const palette = [];

    for (let index = 0; index < representative.length; index += 1) {
      const representativeCandidate = candidateFromHex(representative[index]) || createCandidate(224, 242, 254, 1);
      const companionCandidate = candidateFromHex(companions[index]) || representativeCandidate;
      const accentCandidate = candidateFromHex(accents[index]);
      let best = null;
      let bestScore = -Infinity;

      for (let surfaceIndex = 0; surfaceIndex < surfaceCandidates.length; surfaceIndex += 1) {
        const surface = surfaceCandidates[surfaceIndex];
        if (!surface || usedHexes[surface.hex]) {
          continue;
        }

        const representativeGap = colorDistance(representativeCandidate, surface);
        const companionHueGap = hueDistance(companionCandidate.hsl.h, surface.hsl.h);
        const accentHueGap = accentCandidate ? hueDistance(accentCandidate.hsl.h, surface.hsl.h) : 90;
        let score = Math.min(Math.log(surface.count + 1) * 12, 22);
        score += (1 - Math.abs(surface.hsl.l - 0.88)) * 38;
        score += (0.24 - Math.abs(surface.hsl.s - 0.18)) * 42;
        if (representativeGap > 20) {
          score += 10;
        } else {
          score -= 12;
        }
        if (companionHueGap < 24) {
          score += 18;
        } else if (companionHueGap < 48) {
          score += 10;
        }
        if (accentCandidate && accentHueGap < 18) {
          score += 8;
        }

        if (score > bestScore) {
          bestScore = score;
          best = surface;
        }
      }

      if (!best) {
        best = candidateFromHex(deriveSurfaceColor(representative[index], companions[index], accents[index], index, analysis));
      }

      usedHexes[best.hex] = true;
      palette.push(best.hex);
    }

    return palette;
  }

  function isSurfaceTooWeak(hex, representativeHex) {
    const candidate = candidateFromHex(hex);
    const representative = candidateFromHex(representativeHex);
    if (!candidate) {
      return true;
    }
    if (candidate.hsl.l < 0.7) {
      return true;
    }
    if (representative && colorDistance(candidate, representative) < 26) {
      return true;
    }
    return false;
  }

  function normalizeSurfacePalette(surfaces, representative, companions, accents, analysis, surfaceCandidates) {
    const source = Array.isArray(surfaces) ? surfaces : [];
    const fallback = buildSurfacePalette(representative, companions, accents, analysis, surfaceCandidates);
    const normalized = [];

    for (let index = 0; index < 3; index += 1) {
      normalized.push(normalizeHexColor(source[index]) || fallback[index]);
    }

    if (surfaceCandidates.length && rowLooksLikeDefaults(normalized, defaultPalette.surfaces, 16)) {
      return fallback;
    }

    const weakCount = normalized.filter((hex, index) => isSurfaceTooWeak(hex, representative[index])).length;
    if (weakCount >= 2) {
      return fallback;
    }

    for (let index = 0; index < normalized.length; index += 1) {
      if (isSurfaceTooWeak(normalized[index], representative[index])) {
        normalized[index] = fallback[index];
        continue;
      }
      for (let compareIndex = 0; compareIndex < index; compareIndex += 1) {
        if (areHexesNear(normalized[compareIndex], normalized[index], 18)) {
          normalized[index] = fallback[index];
          break;
        }
      }
    }

    return normalized;
  }

  function pickTextColor(base) {
    const dark = createCandidate(15, 23, 42, 1);
    const light = createCandidate(255, 255, 255, 1);
    return contrastRatio(base, dark) >= contrastRatio(base, light) ? dark : light;
  }

  async function extractLocalColorContext(image, analysis, textHintColors) {
    const imageData = await decodeImageToImageData(image);
    const candidates = buildColorCandidates(imageData);
    const representative = selectRepresentativeColors(candidates);
    const representativeHexes = representative.map((candidate) => candidate.hex);
    const accentCandidates = selectAccentCandidates(candidates, representativeHexes);
    const usedHexes = {};

    for (let index = 0; index < representative.length; index += 1) {
      usedHexes[representative[index].hex] = true;
    }

    const companions = representative.map((candidate, index) => pickCompanionColor(candidate, candidates, usedHexes, index));
    const expressiveCompanions = normalizeCompanionPalette(
      companions.map((candidate) => candidate.hex),
      representativeHexes,
      accentCandidates,
      analysis
    );
    const surfaceCandidates = selectSurfaceCandidates(candidates, representativeHexes, expressiveCompanions);
    const accents = normalizeAccentPalette([], representativeHexes, expressiveCompanions, accentCandidates, analysis);
    const text = buildFallbackTextRolePalette(representativeHexes, expressiveCompanions, accentCandidates, textHintColors);
    const surfaces = normalizeSurfacePalette([], representativeHexes, expressiveCompanions, accents, analysis, surfaceCandidates);

    return {
      candidates: candidates,
      representative: representativeHexes,
      companions: expressiveCompanions,
      accents: accents,
      text: text,
      surfaces: surfaces,
      accentCandidates: accentCandidates,
      surfaceCandidates: surfaceCandidates,
    };
  }

  async function buildColorExtractResult(payload, signal) {
    let aiResult = null;
    let aiError = null;
    const textHintColors = normalizeSummaryTextColors(payload && payload.summary);

    try {
      aiResult = await requestAiColorPalette(payload, signal);
    } catch (error) {
      if (shared.isAbortError(error)) {
        throw error;
      }
      aiError = error;
      console.warn("[pigma] ai color extract AI analysis failed:", error);
    }

    const needsFallback = !!aiError || paletteNeedsFallback(aiResult);
    let localContext = null;
    if (payload && payload.image) {
      setButtonBusy(true, fallbackLabel);
      localContext = await extractLocalColorContext(
        payload.image,
        inferFallbackAnalysis(payload && payload.summary, aiError),
        textHintColors
      );
    }

    const normalized = normalizeColorExtractResult(
      aiResult,
      payload,
      localContext,
      inferFallbackAnalysis(payload && payload.summary, aiError),
      needsFallback
    );
    normalized.companions = normalizeCompanionPalette(
      normalized.companions,
      normalized.representative,
      localContext && Array.isArray(localContext.accentCandidates) ? localContext.accentCandidates : [],
      normalized.analysis
    );
    const colorHuntGuide = buildColorHuntGuide(
      payload && payload.colorHuntPalettes,
      payload && payload.summary,
      normalized.analysis,
      normalized.representative,
      normalized.companions
    );
    if (colorHuntGuide && Array.isArray(colorHuntGuide.companions) && colorHuntGuide.companions.length >= 3) {
      normalized.companions = normalizeCompanionPalette(
        colorHuntGuide.companions,
        normalized.representative,
        localContext && Array.isArray(localContext.accentCandidates) ? localContext.accentCandidates : [],
        normalized.analysis
      );
    }
    const adobeTrendGuide = await buildAdobeTrendGuide(
      payload && payload.adobeTrends,
      payload && payload.summary,
      normalized.analysis,
      {
        representative: normalized.representative,
        companions: normalized.companions,
      },
      signal
    );
    const localAccentRow =
      localContext && Array.isArray(localContext.accents) && localContext.accents.length >= 3 ? localContext.accents : normalized.accents;
    const localSurfaceRow =
      localContext && Array.isArray(localContext.surfaces) && localContext.surfaces.length >= 3 ? localContext.surfaces : normalized.surfaces;
    const accentSource =
      adobeTrendGuide && Array.isArray(adobeTrendGuide.accents) && adobeTrendGuide.accents.length >= 3
        ? adobeTrendGuide.accents
        : localAccentRow;
    normalized.accents = normalizeAccentPalette(
      accentSource,
      normalized.representative,
      normalized.companions,
      localContext && Array.isArray(localContext.accentCandidates) ? localContext.accentCandidates : [],
      normalized.analysis
    );
    normalized.text = normalizeSemanticTextPalette(
      normalized.text,
      normalized.representative,
      normalized.companions,
      localContext && Array.isArray(localContext.accentCandidates) ? localContext.accentCandidates : [],
      textHintColors
    );
    const colorHuntSurfaceRow =
      colorHuntGuide && Array.isArray(colorHuntGuide.surfaces) && colorHuntGuide.surfaces.length >= 3
        ? colorHuntGuide.surfaces
        : localSurfaceRow;
    const surfaceSource =
      adobeTrendGuide &&
      shouldPreferAdobeTrendRow(
        "surface",
        colorHuntSurfaceRow,
        adobeTrendGuide.surfaces,
        normalized.representative,
        normalized.companions,
        normalized.analysis,
        localContext
      )
        ? adobeTrendGuide.surfaces
        : colorHuntSurfaceRow;
    normalized.surfaces = normalizeSurfacePalette(
      surfaceSource,
      normalized.representative,
      normalized.companions,
      normalized.accents,
      normalized.analysis,
      localContext && Array.isArray(localContext.surfaceCandidates) ? localContext.surfaceCandidates : []
    );
    if (adobeTrendGuide) {
      normalized.analysis.adobeTrendCategories = adobeTrendGuide.categoryLabels;
      normalized.analysis.adobeTrendPaletteNames = adobeTrendGuide.records.map((record) => record.name).filter(Boolean);
    }
    if (colorHuntGuide) {
      normalized.analysis.colorHuntTags = colorHuntGuide.tagLabels;
      normalized.analysis.colorHuntPaletteNames = colorHuntGuide.records.map((record) => record.name).filter(Boolean);
    }
    return normalized;
  }

  async function handleSourceReady(payload, requestId, signal) {
    setButtonBusy(true, analyzingLabel);
    const result = await buildColorExtractResult(payload, signal);
    if (!activeRequestId || requestId !== activeRequestId || (signal && signal.aborted)) {
      return;
    }
    setButtonBusy(true, applyingLabel);
    postPluginMessage({
      type: "apply-ai-color-extract-palette",
      sessionId: payload.sessionId,
      clientRequestId: requestId,
      palette: {
        representative: result.representative,
        companions: result.companions,
        accents: result.accents,
        text: result.text,
        surfaces: result.surfaces,
      },
      analysis: result.analysis,
      operationLabel: operationLabel,
    });
  }

  button.addEventListener("click", () => {
    if (isBusy) {
      return;
    }

    if (isPeerBusy()) {
      reportUiError("\uB2E4\uB978 AI \uC774\uBBF8\uC9C0 \uC791\uC5C5\uC774 \uC774\uBBF8 \uC2E4\uD589 \uC911\uC785\uB2C8\uB2E4.");
      return;
    }

    activeRequestId = `ai-color-extract-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    activeAbortController = typeof AbortController === "function" ? new AbortController() : null;
    setButtonBusy(true, preparingLabel);
    postPluginMessage({
      type: "request-ai-color-extract-source",
      clientRequestId: activeRequestId,
      operationLabel: operationLabel,
    });
  });

  window.addEventListener("message", (event) => {
    const payload = event && event.data ? event.data.pluginMessage : null;
    if (!payload || typeof payload !== "object" || !activeRequestId) {
      return;
    }

    const isColorExtractMessage =
      payload.type === "ai-color-extract-source-ready" ||
      payload.type === "ai-color-extract-source-error" ||
      payload.type === "ai-color-extract-apply-result" ||
      payload.type === "ai-color-extract-apply-error";
    if (!isColorExtractMessage) {
      return;
    }

    if (payload.clientRequestId && payload.clientRequestId !== activeRequestId) {
      return;
    }

    if (payload.type === "ai-color-extract-source-ready") {
      const currentRequestId = activeRequestId;
      const signal = activeAbortController ? activeAbortController.signal : null;
      handleSourceReady(payload, currentRequestId, signal).catch((error) => {
        if (!shared.isAbortError(error)) {
          reportUiError(shared.normalizeErrorMessage(error, "\uC0C9\uC0C1 \uCD94\uCD9C\uC744 \uC644\uB8CC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."));
        }
        resetState();
      });
      return;
    }

    if (payload.type === "ai-color-extract-source-error" || payload.type === "ai-color-extract-apply-error") {
      resetState();
      return;
    }

    if (payload.type === "ai-color-extract-apply-result") {
      resetState();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isBusy) {
      cancelCurrentRun();
    }
  });

  button.textContent = defaultLabel;
  window.__PIGMA_AI_COLOR_EXTRACT_V2__ = true;
  } catch (error) {
    bindColorExtractInitFailure("색상 추출 초기화 중 오류가 발생했습니다. 플러그인을 다시 열어 주세요.", error);
  }
})();
