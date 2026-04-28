;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_REGROUP_RENAME_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_DESIGN_READ_CACHE_KEY = "pigma:ai-design-read-cache:v1";
  const AI_REGROUP_RENAME_CACHE_KEY = "pigma:ai-regroup-rename-cache:v2";
  const PATCH_VERSION = 2;
  const DEFAULT_NAMING_MODE = "web";
  const NAMING_MODE_METADATA = {
    web: {
      id: "web",
      label: "웹 호환 네이밍",
      renameDescription: "웹 호환 구조형 이름으로 정리하고, 안전한 조합만 보수적으로 묶습니다.",
      runningDescription: "웹 호환 구조형 이름을 정리하고 안전한 리그룹핑 후보를 확인하고 있습니다.",
      aggressiveRegroup: false,
      aiInstructions:
        "You improve Figma layer names for web implementation. Return Korean reasons, but every suggestedName must be lowercase ASCII dot notation like section.hero, button.primary.sign-in, text.heading.hero.title. Do not use spaces, slashes, Korean, or underscores in suggestedName. Reflect a clear topic when supported by text or metadata, for example soccer, sports, finance, food, travel, beauty, or education. For image layers, prefer semantic roles like hero, banner, thumbnail, avatar, photo, poster, cover, or illustration when supported by the hints. Only include a color token when it clearly disambiguates a badge, chip, pill, or status-like visual; do not add colors to every layer. Do not invent a topic or color that is not supported by the payload. If uncertain, keep the provided localName.",
      aiReasonFallback: "AI 구조형 네이밍 기준",
    },
    hybrid: {
      id: "hybrid",
      label: "하이브리드 네이밍",
      renameDescription: "하이브리드 구조형 이름으로 정리하고, 텍스트 블록까지 조금 더 적극적으로 묶습니다.",
      runningDescription: "하이브리드 구조형 이름을 정리하고 적극적인 리그룹핑 후보를 확인하고 있습니다.",
      aggressiveRegroup: true,
      aiInstructions:
        "You improve Figma layer names for design handoff. Return Korean reasons. When candidate.nameMode is 'structured', suggestedName should be short readable ASCII labels in Title Case, using slashes only for meaningful block hierarchy such as Hero/Copy, Hero/Media, Feature/List, Navbar/Item, CTA Primary, Title, Body, Thumbnail, Price, or Badge. Do not prefix every structured name with generic words like Group, Text, Frame, Container, or Layer. Use only letters, numbers, spaces, hyphens, and slashes. Do not use Korean or dots. When candidate.nameMode is 'display', suggestedName must be a human-readable section or repeat-card label like 01_Key Visual, 02_Introduction, 03_Features, 04_Product 01, 05_Product 02, 06_FAQ, 07_Outro, Product Card 01, Product Card 02, Coupon + Product Card, Awards, FAQ, or Archiving Page. For display names, first infer the section role from narrative context, visual hierarchy, section order, surrounding sections, and what the block is trying to communicate. Only after that decide the final label. Use heading/body/action text, sibling order, visual composition, nearby section context, and repeated card patterns together. Do not rely on file names, document titles, or shallow keywords alone. A word like monthly by itself does not mean Pricing. Avoid labels like Sports, Finance, Food, or other broad topic words as top-level section names unless the block is literally a named category section. Prefix 01_, 02_ only when candidate.needsIndex is true. For repeated cards, prefer 2-digit numbering like 01 and 02. Avoid repeating the same broad label for parent and child. If localName looks heuristic or weak, replace it with a better role-based label instead of preserving it. When candidate.aiOnlySectionName is true and candidate.currentNameLooksWeak or candidate.localNameLooksWeak is true, ignore those weak names and infer a new section label from the content. Prefer candidate.sectionRoleHint and candidate.sectionNarrative when they are supported by the rest of the payload.",
      aiReasonFallback: "AI 하이브리드 네이밍 기준",
    },
  };
  let activeNamingMode = DEFAULT_NAMING_MODE;
  const VECTOR_TYPES = new Set([
    "VECTOR",
    "BOOLEAN_OPERATION",
    "STAR",
    "LINE",
    "ELLIPSE",
    "POLYGON",
    "REGULAR_POLYGON",
    "RECTANGLE",
  ]);
  const AUTO_NAME_PATTERNS = [
    /^frame \d+$/i,
    /^group \d+$/i,
    /^rectangle \d+$/i,
    /^text \d+$/i,
    /^vector \d+$/i,
    /^ellipse \d+$/i,
    /^polygon \d+$/i,
    /^star \d+$/i,
    /^line \d+$/i,
    /^image \d+$/i,
    /^component \d+$/i,
    /^instance \d+$/i,
    /^section \d+$/i,
    /^copy(?: of)? /i,
    /^untitled/i,
  ];
  const BUTTON_TEXT_PATTERN =
    /^(ok|go|next|done|start|login|sign in|sign up|save|apply|cancel|submit|buy|book|download|contact|확인|다음|완료|시작|저장|취소|적용|구매|예약|문의|다운로드)$/i;
  const FIELD_KEYWORD_ENTRIES = [
    ["email", ["email", "e-mail", "이메일"]],
    ["password", ["password", "비밀번호"]],
    ["search", ["search", "검색"]],
    ["phone", ["phone", "mobile", "telephone", "전화", "휴대폰"]],
    ["name", ["name", "이름"]],
    ["company", ["company", "organization", "회사"]],
    ["message", ["message", "comment", "메시지", "문의"]],
    ["address", ["address", "주소"]],
  ];
  const ACTION_TOKEN_ENTRIES = [
    ["sign-in", ["login", "log in", "sign in", "로그인"]],
    ["sign-up", ["signup", "sign up", "회원가입"]],
    ["submit", ["submit", "제출", "확인"]],
    ["cancel", ["cancel", "취소"]],
    ["save", ["save", "저장"]],
    ["apply", ["apply", "적용"]],
    ["download", ["download", "다운로드"]],
    ["contact", ["contact", "문의"]],
    ["search", ["search", "검색"]],
    ["start", ["start", "시작"]],
    ["next", ["next", "다음"]],
    ["close", ["close", "닫기"]],
    ["delete", ["delete", "삭제"]],
    ["book", ["book", "예약"]],
    ["buy", ["buy", "purchase", "구매"]],
  ];
  const SECTION_TOKEN_ENTRIES = [
    ["hero", ["hero", "main", "intro", "banner", "get started", "discover", "learn more", "메인", "소개", "배너"]],
    ["navbar", ["nav", "navigation", "menu", "home", "profile", "settings", "알림", "메뉴", "홈", "프로필", "설정"]],
    ["sidebar", ["sidebar", "filter", "category", "project", "폴더", "카테고리", "필터", "사이드"]],
    ["footer", ["footer", "copyright", "privacy", "terms", "policy", "푸터", "약관", "정책"]],
    ["pricing", ["pricing", "price", "plan", "billing", "monthly", "yearly", "요금", "가격", "플랜"]],
    ["feature", ["feature", "benefit", "advantage", "why", "기능", "혜택", "장점"]],
    ["form", ["form", "email", "password", "input", "submit", "로그인", "회원가입", "이메일", "비밀번호", "입력", "제출"]],
    ["modal", ["modal", "dialog", "confirm", "cancel", "닫기", "취소", "확인"]],
    ["dashboard", ["dashboard", "analytics", "report", "metric", "chart", "data", "대시보드", "분석", "리포트", "지표", "차트"]],
    ["content", ["content", "body", "copy", "section", "콘텐츠", "본문", "섹션"]],
  ];
  const CONTENT_ROLE_TOKEN_ENTRIES = [
    ["introduction", ["introduction", "intro", "opening", "overview", "about", "hi i am", "hi i'm", "reviewer", "reviewed", "real use", "story"]],
    ["summary", ["summary", "conclusion", "closing", "wrap up", "takeaway"]],
    ["faq", ["faq", "frequently asked", "questions"]],
    ["archive", ["archive", "archiving", "history", "behind the scenes"]],
  ];
  const TOPIC_TOKEN_ENTRIES = [
    [
      "soccer",
      [
        "soccer",
        "football club",
        "football match",
        "goalkeeper",
        "striker",
        "midfielder",
        "premier league",
        "champions league",
        "fifa",
        "uefa",
        "kickoff",
        "clean sheet",
        "football",
        "축구",
        "골",
        "득점",
        "슈팅",
        "선수",
        "경기",
        "리그",
        "월드컵",
        "챔피언스리그",
      ],
    ],
    [
      "sports",
      [
        "sports",
        "sport",
        "athlete",
        "athletic",
        "league",
        "tournament",
        "match",
        "player",
        "team",
        "coach",
        "score",
        "scoreboard",
        "stadium",
        "mvp",
        "스포츠",
        "선수",
        "팀",
        "리그",
        "토너먼트",
        "점수",
        "경기장",
      ],
    ],
    ["basketball", ["basketball", "nba", "wnba", "dunk", "three pointer", "three-point", "hoop", "농구", "덩크"]],
    ["baseball", ["baseball", "mlb", "pitcher", "homerun", "home run", "inning", "야구", "투수", "타자"]],
    ["tennis", ["tennis", "atp", "wta", "serve", "racket", "grand slam", "테니스", "서브"]],
    ["fitness", ["fitness", "workout", "exercise", "gym", "trainer", "yoga", "pilates", "피트니스", "운동"]],
    ["finance", ["finance", "fintech", "bank", "banking", "loan", "payment", "wallet", "card", "stock", "crypto", "금융", "은행", "주식", "결제"]],
    ["shopping", ["shop", "shopping", "store", "commerce", "cart", "checkout", "product", "ecommerce", "sale", "쇼핑", "장바구니", "결제", "상품"]],
    ["food", ["food", "restaurant", "cafe", "menu", "recipe", "drink", "coffee", "dessert", "meal", "음식", "레시피", "메뉴", "카페"]],
    ["travel", ["travel", "trip", "flight", "hotel", "tour", "booking", "destination", "vacation", "여행", "항공", "호텔", "예약"]],
    ["beauty", ["beauty", "cosmetic", "skincare", "makeup", "hair", "perfume", "뷰티", "화장품", "스킨케어"]],
    ["fashion", ["fashion", "style", "outfit", "clothing", "apparel", "wardrobe", "패션", "의류", "스타일"]],
    ["music", ["music", "album", "artist", "song", "playlist", "concert", "뮤직", "음악", "아티스트", "플레이리스트"]],
    ["gaming", ["game", "gaming", "gamer", "quest", "level", "esports", "게임", "게이밍", "e-sports", "e sports"]],
    ["education", ["education", "course", "lesson", "class", "academy", "student", "learn", "school", "교육", "수업", "학생", "강의"]],
    ["health", ["health", "medical", "clinic", "doctor", "care", "wellness", "hospital", "healthcare", "헬스", "의료", "병원", "건강"]],
    ["news", ["news", "article", "headline", "editorial", "press", "magazine", "media", "뉴스", "기사", "헤드라인"]],
  ];
  const TOPIC_LABELS = {
    soccer: "Soccer",
    sports: "Sports",
    basketball: "Basketball",
    baseball: "Baseball",
    tennis: "Tennis",
    fitness: "Fitness",
    finance: "Finance",
    shopping: "Shopping",
    food: "Food",
    travel: "Travel",
    beauty: "Beauty",
    fashion: "Fashion",
    music: "Music",
    gaming: "Gaming",
    education: "Education",
    health: "Health",
    news: "News",
  };
  const IMAGE_ROLE_TOKEN_ENTRIES = [
    ["avatar", ["avatar", "profile", "portrait", "author", "speaker", "member", "user", "player", "coach", "프로필", "아바타", "선수"]],
    ["hero", ["hero", "banner", "masthead", "key visual", "kv", "cover", "메인", "배너", "키비주얼"]],
    ["thumbnail", ["thumbnail", "thumb", "preview", "teaser", "card image", "썸네일", "미리보기"]],
    ["poster", ["poster", "flyer", "campaign", "event", "포스터", "이벤트"]],
    ["illustration", ["illustration", "illust", "graphic", "mascot", "character", "일러스트", "캐릭터"]],
    ["logo", ["logo", "brand", "wordmark", "symbol", "logomark", "로고", "브랜드"]],
    ["photo", ["photo", "image", "picture", "gallery", "shot", "사진", "이미지"]],
  ];
  const IMAGE_NAME_PATTERN = /\b(image|photo|picture|avatar|thumbnail|thumb|cover|hero|banner|poster|illustration|illust|portrait|gallery)\b/i;
  const GENERIC_TOKEN_SET = new Set([
    "frame",
    "group",
    "section",
    "rectangle",
    "vector",
    "ellipse",
    "polygon",
    "line",
    "text",
    "component",
    "instance",
    "layer",
    "copy",
    "content",
    "item",
    "icon",
    "button",
    "field",
    "container",
  ]);
  let activeExecution = null;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isAiRegroupRenameMessage(message)) {
      if (message.type === "request-ai-regroup-rename-cache") {
        await postCachedRegroupRenameResult();
        return;
      }

      await withExecutionLock(
        {
          status: "running",
          message: getNamingModeMeta(resolveNamingMode(message && message.namingMode)).runningDescription,
          namingMode: resolveNamingMode(message && message.namingMode),
        },
        () => runRegroupRename(message)
      );
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_REGROUP_RENAME_PATCH__ = true;

  function isAiRegroupRenameMessage(message) {
    return !!message && (message.type === "request-ai-regroup-rename-cache" || message.type === "run-ai-regroup-rename");
  }

  async function withExecutionLock(execution, runner) {
    if (activeExecution) {
      postStatus(activeExecution.status, activeExecution.message, activeExecution.namingMode);
      return false;
    }

    activeExecution =
      execution && typeof execution === "object"
        ? execution
        : { status: "running", message: "", namingMode: DEFAULT_NAMING_MODE };
    try {
      await runner();
      return true;
    } finally {
      activeExecution = null;
    }
  }

  function resolveNamingMode(value) {
    return value === "hybrid" ? "hybrid" : DEFAULT_NAMING_MODE;
  }

  function getNamingModeMeta(mode) {
    return NAMING_MODE_METADATA[resolveNamingMode(mode)] || NAMING_MODE_METADATA[DEFAULT_NAMING_MODE];
  }

  async function runRegroupRename(message) {
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    const namingMode = resolveNamingMode(message && message.namingMode);
    const modeMeta = getNamingModeMeta(namingMode);
    activeNamingMode = namingMode;
    postStatus("running", modeMeta.runningDescription, namingMode);
    postStatus("running", "리그룹핑/리네이밍을 적용하는 중입니다.");

    try {
      const designReadResult = await readDesignReadCache();
      const result = sanitizeRegroupRenameResult(await applyRegroupRename(designReadResult, { namingMode }));
      await writeRegroupRenameCache(result);

      figma.ui.postMessage({
        type: "ai-regroup-rename-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      figma.notify(buildRegroupRenameToast(result), { timeout: 2200 });
    } catch (error) {
      const message = normalizeErrorMessage(error, "리그룹핑/리네이밍에 실패했습니다.");

      figma.ui.postMessage({
        type: "ai-regroup-rename-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });

      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function postCachedRegroupRenameResult() {
    const result = sanitizeRegroupRenameResult(await readRegroupRenameCache());

    figma.ui.postMessage({
      type: "ai-regroup-rename-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  function postStatus(status, message, namingMode) {
    figma.ui.postMessage({
      type: "ai-regroup-rename-status",
      status,
      message,
      namingMode: resolveNamingMode(namingMode || activeNamingMode),
    });
  }

  async function readDesignReadCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_DESIGN_READ_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function readRegroupRenameCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_REGROUP_RENAME_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function writeRegroupRenameCache(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    try {
      await figma.clientStorage.setAsync(AI_REGROUP_RENAME_CACHE_KEY, result);
    } catch (error) {}

    return result;
  }

  function sanitizeRegroupRenameResult(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    const summary = result.summary && typeof result.summary === "object" ? result.summary : {};
    return {
      version: typeof result.version === "number" ? result.version : PATCH_VERSION,
      source: typeof result.source === "string" ? result.source : "local-heuristic",
      namingMode: typeof result.namingMode === "string" ? result.namingMode : resolveNamingMode(activeNamingMode),
      namingModeLabel: typeof result.namingModeLabel === "string" ? result.namingModeLabel : "",
      selectionSignature: typeof result.selectionSignature === "string" ? result.selectionSignature : "",
      processedAt: typeof result.processedAt === "string" ? result.processedAt : new Date().toISOString(),
      summary: {
        selectionLabel: typeof summary.selectionLabel === "string" ? summary.selectionLabel : "",
        contextLabel: typeof summary.contextLabel === "string" ? summary.contextLabel : "",
        topicLabel: typeof summary.topicLabel === "string" ? summary.topicLabel : "",
        namingMode: typeof summary.namingMode === "string" ? summary.namingMode : "",
        namingModeLabel: typeof summary.namingModeLabel === "string" ? summary.namingModeLabel : "",
        renameCount: Math.max(0, Number(summary.renameCount) || 0),
        aiRenameCount: Math.max(0, Number(summary.aiRenameCount) || 0),
        localRenameCount: Math.max(0, Number(summary.localRenameCount) || 0),
        aiConfigured: summary.aiConfigured === true,
        aiHelperAvailable: summary.aiHelperAvailable === true,
        aiCandidateCount: Math.max(0, Number(summary.aiCandidateCount) || 0),
        aiSuggestionCount: Math.max(0, Number(summary.aiSuggestionCount) || 0),
        aiFailed: summary.aiFailed === true,
        aiErrorMessage: typeof summary.aiErrorMessage === "string" ? summary.aiErrorMessage : "",
        aiFailureType: typeof summary.aiFailureType === "string" ? summary.aiFailureType : "",
        aiStatusLabel: typeof summary.aiStatusLabel === "string" ? summary.aiStatusLabel : "",
        regroupCount: Math.max(0, Number(summary.regroupCount) || 0),
        suggestionCount: Math.max(0, Number(summary.suggestionCount) || 0),
        skippedCount: Math.max(0, Number(summary.skippedCount) || 0),
        aiOnlySkippedCount: Math.max(0, Number(summary.aiOnlySkippedCount) || 0),
      },
      renamed: sanitizeRegroupRenameEntryList(result.renamed, ["id", "from", "to", "reason", "nameSource"], 24),
      regrouped: sanitizeRegroupRenameEntryList(result.regrouped, ["id", "name", "parentName", "nodes", "reason"], 12),
      suggestions: sanitizeRegroupRenameEntryList(result.suggestions, ["name", "parentName", "nodes", "reason"], 12),
      skipped: sanitizeRegroupRenameEntryList(result.skipped, ["label", "reason", "nameSource"], 12),
      insights: sanitizeStringList(result.insights, 6),
    };
  }

  function sanitizeRegroupRenameEntryList(rows, allowedKeys, limit) {
    const values = Array.isArray(rows) ? rows : [];
    const max = typeof limit === "number" && limit > 0 ? limit : values.length;
    const entries = [];
    for (const row of values) {
      if (!row || typeof row !== "object") {
        continue;
      }

      const next = {};
      for (const key of allowedKeys) {
        if (key === "nodes") {
          if (Array.isArray(row.nodes)) {
            next.nodes = row.nodes
              .map((entry) => {
                if (entry && typeof entry === "object") {
                  return {
                    id: typeof entry.id === "string" ? entry.id : "",
                    name: typeof entry.name === "string" ? entry.name : "",
                  };
                }

                return typeof entry === "string" ? entry : "";
              })
              .filter((entry) => {
                if (typeof entry === "string") {
                  return !!entry;
                }

                return !!(entry && (entry.id || entry.name));
              })
              .slice(0, 6);
          }
          continue;
        }

        if (typeof row[key] === "string") {
          next[key] = row[key];
        }
      }

      entries.push(next);
      if (entries.length >= max) {
        break;
      }
    }

    return entries;
  }

  function sanitizeStringList(values, limit) {
    const rows = Array.isArray(values) ? values : [];
    const max = typeof limit === "number" && limit > 0 ? limit : rows.length;
    const items = [];
    for (const value of rows) {
      if (typeof value !== "string" || !value) {
        continue;
      }

      items.push(value);
      if (items.length >= max) {
        break;
      }
    }

    return items;
  }

  function matchesCurrentSelection(result) {
    return !!result && result.selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  function matchesSelectionSignature(selectionSignature) {
    return typeof selectionSignature === "string" && selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  async function applyRegroupRename(designReadResult, options) {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const selectionIds = selection.map((node) => node.id);
    const context = buildSelectionContext(selection, designReadResult, options);
    const renameResult = await applyRenamePlan(selection, context);
    const refreshedSelection = resolveNodeListByIds(selectionIds);
    const regroupResult = applyRegroupPlan(refreshedSelection, context);
    const suggestionResult = buildRegroupSuggestions(refreshedSelection, regroupResult.usedNodeIds, context);
    const skippedCount = renameResult.skipped.length + regroupResult.skipped.length;
    const insights = buildInsights(context, renameResult, regroupResult, suggestionResult);
    const aiRenameCount = renameResult.aiAppliedCount || 0;
    const localRenameCount = renameResult.localAppliedCount || 0;
    const aiStatusLabel = buildAiRenameStatusLabel(renameResult);

    return {
      version: PATCH_VERSION,
      source: aiRenameCount > 0 ? (localRenameCount > 0 ? "mixed" : "ai") : "local-heuristic",
      namingMode: context.namingMode,
      namingModeLabel: context.namingModeLabel,
      selectionSignature: getSelectionSignature(selection),
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: context.selectionLabel,
        contextLabel: context.contextLabel,
        topicLabel: context.topicLabel,
        namingMode: context.namingMode,
        namingModeLabel: context.namingModeLabel,
        renameCount: renameResult.applied.length,
        aiRenameCount,
        localRenameCount,
        aiConfigured: renameResult.aiConfigured === true,
        aiHelperAvailable: renameResult.aiHelperAvailable === true,
        aiCandidateCount: renameResult.aiCandidateCount || 0,
        aiSuggestionCount: renameResult.aiSuggestionCount || 0,
        aiFailed: renameResult.aiFailed === true,
        aiErrorMessage: renameResult.aiErrorMessage || "",
        aiFailureType: renameResult.aiFailureType || "",
        aiStatusLabel,
        regroupCount: regroupResult.applied.length,
        suggestionCount: suggestionResult.length,
        skippedCount,
        aiOnlySkippedCount: renameResult.aiOnlySkippedCount || 0,
      },
      renamed: renameResult.applied.slice(0, 24),
      regrouped: regroupResult.applied.slice(0, 12),
      suggestions: suggestionResult.slice(0, 12),
      skipped: [...renameResult.skipped, ...regroupResult.skipped].slice(0, 12),
      insights: insights.slice(0, 6),
    };
  }

  function buildSelectionContext(selection, designReadResult, options) {
    const namingMode = resolveNamingMode(options && options.namingMode);
    const namingModeMeta = getNamingModeMeta(namingMode);
    const preservedRoot = findLargestSelectedRoot(selection);
    const textSamples = collectSelectionTextSamples(selection, 8);
    const roots = selection.map((node) => ({
      id: node.id,
      name: safeName(node),
      type: String(node.type || "UNKNOWN"),
    }));
    const selectionLabel = formatSelectionLabel(roots);
    const selectionSignature = getSelectionSignature(selection);
    const contentSummary =
      designReadResult &&
      designReadResult.summary &&
      typeof designReadResult.summary.contentSummary === "string"
        ? designReadResult.summary.contentSummary
        : "";
    const topicSlug = inferSelectionTopic(selection, textSamples, designReadResult);
    const topicLabel = formatTopicLabel(topicSlug);
    const paletteHints = extractPaletteHints(designReadResult);
    if (
      designReadResult &&
      designReadResult.selectionSignature === selectionSignature &&
      designReadResult.summary &&
      typeof designReadResult.summary.contextLabel === "string"
    ) {
      const contextLabel = designReadResult.summary.contextLabel || "일반 UI 화면";
      return {
        selectionLabel,
        contextLabel,
        contextSlug: deriveContextSlug(contextLabel),
        contentSummary,
        selectionTextSamples: textSamples.slice(0, 16),
        topicSlug,
        topicLabel,
        paletteHints,
        selectedRootIds: selection.map((node) => node.id),
        selectedRootCount: selection.length,
        preservedRootId: preservedRoot ? preservedRoot.id : "",
        preservedRootName: preservedRoot ? safeName(preservedRoot) : "",
        namingMode,
        namingModeLabel: namingModeMeta.label,
        namingModeDescription: namingModeMeta.renameDescription,
        aggressiveRegroup: namingModeMeta.aggressiveRegroup,
      };
    }

    const contextLabel = inferSelectionContext(selection, textSamples);
    return {
      selectionLabel,
      contextLabel,
      contextSlug: deriveContextSlug(contextLabel),
      contentSummary,
      selectionTextSamples: textSamples.slice(0, 16),
      topicSlug,
      topicLabel,
      paletteHints,
      selectedRootIds: selection.map((node) => node.id),
      selectedRootCount: selection.length,
      preservedRootId: preservedRoot ? preservedRoot.id : "",
      preservedRootName: preservedRoot ? safeName(preservedRoot) : "",
      namingMode,
      namingModeLabel: namingModeMeta.label,
      namingModeDescription: namingModeMeta.renameDescription,
      aggressiveRegroup: namingModeMeta.aggressiveRegroup,
    };
  }

  function collectSelectionTextSamples(selection, limit) {
    const samples = [];
    const stack = [...selection];
    while (stack.length > 0 && samples.length < limit) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      if (node.type === "TEXT") {
        const text = getTextValue(node);
        if (text && !samples.includes(text)) {
          samples.push(text);
        }
      }

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return samples;
  }

  function inferSelectionContext(selection, textSamples) {
    const rootNames = selection.map((node) => safeName(node).toLowerCase());
    const corpus = `${rootNames.join(" ")} ${textSamples.join(" ")}`.toLowerCase();
    const categories = [
      ["인증/폼 화면", ["login", "sign in", "sign up", "email", "password", "로그인", "이메일", "비밀번호", "입력"]],
      ["대시보드/데이터 화면", ["dashboard", "analytics", "chart", "table", "report", "metric", "지표", "차트", "테이블"]],
      ["랜딩/프로모션 화면", ["get started", "learn more", "buy", "download", "contact", "시작", "구매", "문의"]],
      ["모달/다이얼로그", ["cancel", "confirm", "delete", "ok", "취소", "삭제", "닫기", "확인"]],
      ["앱/웹 내비게이션 화면", ["home", "profile", "settings", "menu", "search", "홈", "프로필", "설정", "검색"]],
    ];

    let bestLabel = "일반 UI 화면";
    let bestScore = 0;
    for (const [label, keywords] of categories) {
      let score = 0;
      for (const keyword of keywords) {
        if (corpus.includes(keyword)) {
          score += 1;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestLabel = label;
      }
    }

    return bestLabel;
  }

  function inferSelectionTopic(selection, textSamples, designReadResult) {
    const values = [];
    for (const node of selection || []) {
      values.push(safeName(node));
    }
    values.push(...textSamples);

    if (designReadResult && designReadResult.summary) {
      if (typeof designReadResult.summary.contextLabel === "string" && designReadResult.summary.contextLabel.trim()) {
        values.push(designReadResult.summary.contextLabel.trim());
      }
      if (typeof designReadResult.summary.contentSummary === "string" && designReadResult.summary.contentSummary.trim()) {
        values.push(designReadResult.summary.contentSummary.trim());
      }
    }

    if (designReadResult && designReadResult.typography && Array.isArray(designReadResult.typography.textSamples)) {
      for (const value of designReadResult.typography.textSamples.slice(0, 4)) {
        values.push(value);
      }
    }

    return findBestToken(values, TOPIC_TOKEN_ENTRIES, "");
  }

  function formatTopicLabel(topicSlug) {
    if (!topicSlug) {
      return "";
    }

    return TOPIC_LABELS[topicSlug] || humanizeHybridSegment(topicSlug);
  }

  function extractPaletteHints(designReadResult) {
    const hints = [];
    const rows =
      designReadResult &&
      designReadResult.colors &&
      Array.isArray(designReadResult.colors.topColors)
        ? designReadResult.colors.topColors
        : [];

    for (const row of rows) {
      if (!row || typeof row.value !== "string") {
        continue;
      }

      const hint = describeHexColor(row.value);
      if (!hint || hints.includes(hint)) {
        continue;
      }

      hints.push(hint);
      if (hints.length >= 3) {
        break;
      }
    }

    return hints;
  }

  async function applyRenamePlan(selection, context) {
    const allNodes = collectSceneNodes(selection);
    const nodesByParent = new Map();
    const parentNameCounts = new Map();
    const applied = [];
    const skipped = [];
    let aiAppliedCount = 0;
    let localAppliedCount = 0;
    let aiOnlySkippedCount = 0;
    let aiHelperAvailable = false;
    let aiConfigured = false;
    let aiCandidateCount = 0;
    let aiSuggestionCount = 0;
    let aiFailed = false;
    let aiErrorMessage = "";
    let aiFailureType = "";
    const parentGroups = [];

    for (const node of allNodes) {
      if (!canRenameNode(node)) {
        continue;
      }

      const parent = node.parent;
      if (!parent) {
        continue;
      }

      const parentId = getParentKey(parent);
      if (!nodesByParent.has(parentId)) {
        nodesByParent.set(parentId, []);
        parentNameCounts.set(parentId, countSiblingNames(parent));
      }

      nodesByParent.get(parentId).push(node);
    }

    for (const [parentId, nodes] of nodesByParent.entries()) {
      const counts = parentNameCounts.get(parentId) || new Map();
      const usedNames = new Set();
      const candidates = [];

      for (const node of nodes) {
        const currentName = safeName(node);
        const currentKey = canonicalizeName(currentName);
        const useHybridDisplayName = shouldUseHybridDisplayName(node, context);
        const majorSection = isMajorHybridSection(node, context);
        const textHint = getPrimaryTextHint(node);
        const sectionSlug = detectSectionSlug(node, context);
        const contentSlug = resolveContentSlug(node, textHint, context);
        const topicSlug = detectTopicSlug(node, context, textHint);
        const semanticSlug = contentSlug || topicSlug || sectionSlug || context.contextSlug || "content";
        const groupRole = hasChildren(node) ? inferGroupRole(node, semanticSlug) : "";
        const repeatRole = describeRepeatableRole(node, context, {
          textHint: textHint,
          sectionSlug: sectionSlug,
          contentSlug: contentSlug,
          topicSlug: topicSlug,
          groupRole: groupRole,
          majorSection: majorSection,
        });
        const candidateNameMode = resolveCandidateNameMode(context, useHybridDisplayName, majorSection, repeatRole);
        const baseName = proposeNodeName(node, context, {
          textHint: textHint,
          sectionSlug: sectionSlug,
          contentSlug: contentSlug,
          topicSlug: topicSlug,
          groupRole: groupRole,
          repeatRole: repeatRole,
          majorSection: majorSection,
        });
        const duplicateCount = counts.get(currentKey) || 0;
        const currentNameSafeDisplay = candidateNameMode === "display" ? isSafeLocalDisplayFallback(currentName, node, context) : false;
        const baseNameSafeDisplay = candidateNameMode === "display" ? isSafeLocalDisplayFallback(baseName, node, context) : false;
        const baseNameSemanticallyWeak = baseName ? isSemanticallyWeakCurrentName(baseName, node, context) : true;
        const forceAiRename = shouldAlwaysEvaluateHybridDisplayName(node, context, useHybridDisplayName, majorSection);
        const weakHybridDisplayName =
          resolveNamingMode(context.namingMode) === "hybrid" &&
          candidateNameMode === "display" &&
          (!currentNameSafeDisplay || hasRedundantHybridParentLabel(currentName, safeName(node.parent)));
        const semanticWeakCurrentName = isSemanticallyWeakCurrentName(currentName, node, context);
        const shouldRename =
          forceAiRename ||
          isSuspiciousName(currentName, node.type) ||
          duplicateCount > 1 ||
          semanticWeakCurrentName ||
          !isStructuredNameForMode(currentName, context.namingMode) ||
          weakHybridDisplayName;
        const preserveRootName = shouldPreserveRootName(node, context, currentName);

        if (preserveRootName) {
          usedNames.add(currentKey);
          if (baseName && shouldRename) {
            skipped.push({
              label: currentName,
              reason: "선택된 가장 큰 루트 레이어 이름은 사용자 지정값으로 보고 유지했습니다.",
            });
          }
          continue;
        }

        if (!baseName || !shouldRename) {
          usedNames.add(currentKey);
          continue;
        }

        const majorSectionSiblings = majorSection ? getMajorHybridSectionSiblings(node, context) : [];
        const majorSectionOrder = majorSection ? majorSectionSiblings.findIndex((entry) => entry && entry.id === node.id) + 1 : 0;
        const deepTextSamples = collectNodeTexts(node, 8, 4).slice(0, 8);
        const aiOnlySectionName = useHybridDisplayName && majorSection;
        const sectionRoleAnalysis =
          useHybridDisplayName && hasChildren(node)
            ? analyzeSectionRole(node, context, {
                textHint,
              })
            : null;
        candidates.push({
          nodeId: node.id,
          currentName,
          baseName,
          reason: buildRenameReason(node, context),
          parentName: safeName(node.parent),
          type: String(node.type || "UNKNOWN"),
          namingMode: context.namingMode,
          textHint,
          textSamples: deepTextSamples.slice(0, 3),
          deepTextSamples,
          headingTexts: collectProminentTexts(node, 3),
          actionTexts: collectActionTexts(node, 3),
          contentDigest: buildNodeContentDigest(node, context),
          sectionNarrative: sectionRoleAnalysis ? sectionRoleAnalysis.summary : "",
          sectionRoleHint: sectionRoleAnalysis ? sectionRoleAnalysis.role : "",
          sectionRoleReason: sectionRoleAnalysis ? sectionRoleAnalysis.reason : "",
          topicHint: formatTopicLabel(detectTopicSlug(node, context, textHint)),
          colorHint: getNodeColorHint(node),
          imageRole: isImageLikeNode(node) ? detectImageRole(node) : "",
          hasImageFill: hasImageFill(node),
          allowAiOverride: true,
          nameMode: candidateNameMode,
          aiOnlySectionName,
          localFallbackAllowed: !aiOnlySectionName || isSafeLocalDisplayFallback(baseName, node, context),
          majorSection: majorSection,
          majorSectionOrder: majorSectionOrder,
          majorSectionCount: majorSectionSiblings.length,
          needsIndex: shouldPrefixHybridDisplayOrdinal(node, context),
          positionHint: describeNodeSectionPosition(node, context),
          siblingContext: buildSiblingContentContext(node, context),
          currentNameSafeDisplay: currentNameSafeDisplay,
          baseNameSafeDisplay: baseNameSafeDisplay,
          currentNameSemanticallyWeak: semanticWeakCurrentName,
          baseNameSemanticallyWeak: baseNameSemanticallyWeak,
          looksLikePricing: looksLikePricingSection(node),
          bounds: snapshotNodeBounds(node),
          sectionSlug: sectionSlug,
          contentSlug: contentSlug,
          topicSlug: topicSlug,
          groupRole: groupRole,
          repeatRole: repeatRole,
        });
      }

      applySiblingClusterNaming(candidates);

      parentGroups.push({
        usedNames,
        candidates,
      });
    }

    const aiRenameResult = await requestAiRenameSuggestions(parentGroups, context);
    const aiRenameMap = aiRenameResult && aiRenameResult.map instanceof Map ? aiRenameResult.map : new Map();
    aiHelperAvailable = !!(aiRenameResult && aiRenameResult.helperAvailable);
    aiConfigured = !!(aiRenameResult && aiRenameResult.configured);
    aiCandidateCount = Math.max(0, Number(aiRenameResult && aiRenameResult.candidateCount) || 0);
    aiSuggestionCount = Math.max(0, Number(aiRenameResult && aiRenameResult.suggestionCount) || 0);
    aiFailed = !!(aiRenameResult && aiRenameResult.failed);
    aiErrorMessage = typeof (aiRenameResult && aiRenameResult.errorMessage) === "string" ? aiRenameResult.errorMessage.trim() : "";
    aiFailureType = typeof (aiRenameResult && aiRenameResult.failureType) === "string" ? aiRenameResult.failureType.trim() : "";

    for (const group of parentGroups) {
      const usedNames = group.usedNames;
      const candidates = group.candidates;
      for (const candidate of candidates) {
        const aiSuggestion = candidate.allowAiOverride ? aiRenameMap.get(candidate.nodeId) : null;
        const renameDecision = resolveRenameDecision(candidate, aiSuggestion, aiRenameResult);
        if (!renameDecision) {
          usedNames.add(canonicalizeName(candidate.currentName));
          if (candidate.aiOnlySectionName) {
            aiOnlySkippedCount += 1;
            skipped.push({
              label: candidate.currentName,
              reason: "AI 대분류 네이밍 결과가 없어 기존 이름을 유지했습니다.",
              nameSource: "kept",
            });
          }
          continue;
        }
        const nextBaseName = renameDecision.name;
        const nextReason = renameDecision.reason;
        const uniqueName = ensureUniqueName(nextBaseName, usedNames);
        if (!uniqueName || canonicalizeName(uniqueName) === canonicalizeName(candidate.currentName)) {
          continue;
        }

        try {
          const liveNode = getNodeByIdSafe(candidate.nodeId);
          if (!liveNode || !canRenameNode(liveNode)) {
            skipped.push({
              label: candidate.currentName,
              reason: "변경 대상 레이어를 다시 찾지 못해 이름 변경을 건너뛰었습니다.",
            });
            usedNames.add(canonicalizeName(candidate.currentName));
            continue;
          }

          liveNode.name = uniqueName;
          applied.push({
            id: candidate.nodeId,
            from: candidate.currentName,
            to: uniqueName,
            reason: nextReason,
            nameSource: renameDecision.source,
          });
          if (renameDecision.source === "ai") {
            aiAppliedCount += 1;
          } else {
            localAppliedCount += 1;
          }
          usedNames.add(canonicalizeName(uniqueName));
        } catch (error) {
          skipped.push({
            label: candidate.currentName,
            reason: normalizeErrorMessage(error, "이름을 바꾸지 못했습니다."),
          });
          usedNames.add(canonicalizeName(candidate.currentName));
        }
      }
    }

    return {
      applied,
      skipped,
      aiAppliedCount,
      localAppliedCount,
      aiOnlySkippedCount,
      aiHelperAvailable,
      aiConfigured,
      aiCandidateCount,
      aiSuggestionCount,
      aiFailed,
      aiErrorMessage,
      aiFailureType,
    };
  }

  async function requestAiRenameSuggestions(parentGroups, context) {
    const ai = getAiHelper();
    if (!ai) {
      return {
        map: new Map(),
        helperAvailable: false,
        configured: false,
        candidateCount: 0,
        suggestionCount: 0,
        failed: false,
        errorMessage: "",
        failureType: "",
      };
    }

    let configured = false;
    try {
      configured = await ai.hasConfiguredAiAsync();
    } catch (error) {
      configured = false;
    }

    if (!configured) {
      return {
        map: new Map(),
        helperAvailable: true,
        configured: false,
        candidateCount: 0,
        suggestionCount: 0,
        failed: false,
        errorMessage: "",
        failureType: "",
      };
    }

    const candidates = [];
    for (const group of parentGroups) {
      const items = group && Array.isArray(group.candidates) ? group.candidates : [];
      for (const candidate of items) {
        if (candidate.allowAiOverride === false) {
          continue;
        }

        candidates.push({
          id: candidate.nodeId,
          currentName: candidate.aiOnlySectionName && candidate.currentNameSafeDisplay !== true ? "" : candidate.currentName,
          localName: candidate.aiOnlySectionName && candidate.baseNameSafeDisplay !== true ? "" : candidate.baseName,
          nodeType: candidate.type,
          parentName: candidate.parentName,
          currentNameLooksWeak: candidate.aiOnlySectionName ? candidate.currentNameSafeDisplay !== true || candidate.currentNameSemanticallyWeak === true : false,
          localNameLooksWeak: candidate.aiOnlySectionName ? candidate.baseNameSafeDisplay !== true || candidate.baseNameSemanticallyWeak === true : false,
          textHint: candidate.textHint,
          textSamples: candidate.textSamples,
          deepTextSamples: Array.isArray(candidate.deepTextSamples) ? candidate.deepTextSamples.slice(0, 4) : [],
          headingTexts: Array.isArray(candidate.headingTexts) ? candidate.headingTexts.slice(0, 2) : [],
          actionTexts: Array.isArray(candidate.actionTexts) ? candidate.actionTexts.slice(0, 2) : [],
          contentDigest: candidate.contentDigest,
          sectionNarrative: candidate.sectionNarrative,
          sectionRoleHint: candidate.sectionRoleHint,
          sectionRoleReason: candidate.sectionRoleReason,
          topicHint: candidate.topicHint,
          colorHint: candidate.colorHint,
          imageRole: candidate.imageRole,
          hasImageFill: candidate.hasImageFill,
          nameMode: candidate.nameMode,
          aiOnlySectionName: candidate.aiOnlySectionName,
          majorSection: candidate.majorSection,
          majorSectionOrder: candidate.majorSectionOrder,
          majorSectionCount: candidate.majorSectionCount,
          needsIndex: candidate.needsIndex,
          positionHint: candidate.positionHint,
          siblingContext: candidate.siblingContext,
        });
      }
    }

    if (!candidates.length) {
      return {
        map: new Map(),
        helperAvailable: true,
        configured: true,
        candidateCount: 0,
        suggestionCount: 0,
        failed: false,
        errorMessage: "",
        failureType: "",
      };
    }

    const schema = {
      type: "object",
      properties: {
        renames: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              suggestedName: { type: "string" },
              reason: { type: "string" },
            },
            required: ["id", "suggestedName", "reason"],
          },
        },
      },
      required: ["renames"],
    };

    try {
      const response = await ai.requestJsonTask({
        instructions: getNamingModeMeta(context.namingMode).aiInstructions,
        schema: schema,
        payload: {
          contextLabel: context.contextLabel,
          contextSlug: context.contextSlug,
          topicLabel: context.topicLabel,
          contentSummary: context.contentSummary,
          selectionTextSamples: context.selectionTextSamples,
          paletteHints: context.paletteHints,
          candidates: candidates.slice(0, 24),
        },
      });
      const map = new Map();
      const rows = response && Array.isArray(response.renames) ? response.renames : [];
      for (const row of rows) {
        if (!row || typeof row !== "object" || typeof row.id !== "string" || typeof row.suggestedName !== "string") {
          continue;
        }

        const suggestedName = String(row.suggestedName).trim();
        if (!isStructuredNameForMode(suggestedName, context.namingMode)) {
          continue;
        }

        map.set(row.id, {
          name: suggestedName,
          reason: typeof row.reason === "string" && row.reason.trim() ? row.reason.trim() : "AI 구조형 네이밍 기준",
        });
      }

      return {
        map,
        helperAvailable: true,
        configured: true,
        candidateCount: candidates.length,
        suggestionCount: map.size,
        failed: false,
        errorMessage: "",
        failureType: "",
      };
    } catch (error) {
      const errorMessage = normalizeAiRequestError(ai, error, "AI 대분류 네이밍 호출에 실패했습니다.");
      const failureType =
        error && typeof error === "object" && typeof error.pigmaAiFailureType === "string"
          ? String(error.pigmaAiFailureType).trim()
          : "";
      return {
        map: new Map(),
        helperAvailable: true,
        configured: true,
        candidateCount: candidates.length,
        suggestionCount: 0,
        failed: true,
        errorMessage,
        failureType,
      };
    }
  }

  function buildAiRenameStatusLabel(renameResult) {
    if (!renameResult || typeof renameResult !== "object") {
      return "AI 상태 알 수 없음";
    }

    if (renameResult.aiFailed === true) {
      return "AI 오류";
    }

    if (renameResult.aiHelperAvailable !== true) {
      return "AI helper 없음";
    }

    if (renameResult.aiConfigured !== true) {
      return "AI 비활성";
    }

    if ((renameResult.aiCandidateCount || 0) <= 0) {
      return "AI 후보 없음";
    }

    if ((renameResult.aiSuggestionCount || 0) <= 0) {
      return "AI 응답 없음";
    }

    if ((renameResult.aiAppliedCount || 0) <= 0) {
      return "AI 미적용";
    }

    return "AI 적용";
  }

  function normalizeAiRequestError(ai, error, fallback) {
    if (ai && typeof ai.normalizeErrorMessage === "function") {
      const normalized = ai.normalizeErrorMessage(error, fallback);
      if (typeof normalized === "string" && normalized.trim()) {
        return normalized.trim();
      }
    }

    return normalizeErrorMessage(error, fallback);
  }

  function compactAiErrorMessage(message, limit) {
    const normalized = String(message || "").replace(/\s+/g, " ").trim();
    if (!normalized) {
      return "";
    }

    const max = typeof limit === "number" && limit > 0 ? limit : 48;
    return normalized.length > max ? `${normalized.slice(0, max - 3)}...` : normalized;
  }

  function buildRegroupRenameToast(result) {
    const summary = (result && result.summary) || {};
    const parts = [`${summary.renameCount || 0}개 이름 정리`, `AI ${summary.aiRenameCount || 0}`, `Local ${summary.localRenameCount || 0}`];
    if (summary.aiStatusLabel) {
      parts.push(summary.aiStatusLabel);
    }
    if (summary.aiFailed === true) {
      const errorLabel = compactAiErrorMessage(summary.aiErrorMessage || summary.aiFailureType || "", 34);
      if (errorLabel) {
        parts.push(errorLabel);
      }
    }
    return `리그룹핑/리네이밍 완료 (${parts.join(" · ")})`;
  }

  function applySafeRegroup(selection, context) {
    const parents = collectGroupableParents(selection);
    const applied = [];
    const skipped = [];
    const usedNodeIds = new Set();

    for (const parent of parents) {
      const pairs = findIconLabelPairs(parent.children || [], usedNodeIds);
      for (const pair of pairs) {
        try {
          const group = figma.group([pair.icon, pair.label], parent);
          const groupName = ensureUniqueName(
            buildGroupName(group, pair.label, context),
            collectSiblingNameSet(parent, group)
          );
          group.name = groupName;
          applied.push({
            id: group.id,
            name: groupName,
            parentName: safeName(parent),
            nodes: [safeName(pair.icon), safeName(pair.label)],
            reason: "가까운 아이콘과 라벨을 묶었습니다.",
          });
          usedNodeIds.add(pair.icon.id);
          usedNodeIds.add(pair.label.id);
          usedNodeIds.add(group.id);
        } catch (error) {
          skipped.push({
            label: `${safeName(pair.icon)} + ${safeName(pair.label)}`,
            reason: normalizeErrorMessage(error, "리그룹핑을 적용하지 못했습니다."),
          });
        }
      }
    }

    return {
      applied,
      skipped,
      usedNodeIds,
    };
  }

  function applyRegroupPlan(selection, context) {
    const baseResult = applySafeRegroup(selection, context);
    if (!context.aggressiveRegroup) {
      return baseResult;
    }

    const textBlockResult = applyTextBlockRegroup(selection, baseResult.usedNodeIds, context);
    return {
      applied: [...baseResult.applied, ...textBlockResult.applied],
      skipped: [...baseResult.skipped, ...textBlockResult.skipped],
      usedNodeIds: textBlockResult.usedNodeIds,
    };
  }

  function applyTextBlockRegroup(selection, seedUsedNodeIds, context) {
    const usedNodeIds = new Set(seedUsedNodeIds || []);
    const applied = [];
    const skipped = [];
    const parents = collectGroupableParents(selection);

    for (const parent of parents) {
      const suggestions = findTextBlockSuggestions(parent.children || [], usedNodeIds, context);
      for (const suggestion of suggestions) {
        const nodes = suggestion.nodes
          .map((entry) => Array.from(parent.children || []).find((child) => child && child.id === entry.id))
          .filter(Boolean);
        if (nodes.length !== suggestion.nodes.length) {
          continue;
        }

        try {
          const group = figma.group(nodes, parent);
          const groupName = ensureUniqueName(buildSuggestedTextBlockName(group, nodes[0], nodes[1], context), collectSiblingNameSet(parent, group));
          group.name = groupName;
          applied.push({
            id: group.id,
            name: groupName,
            parentName: safeName(parent),
            nodes: suggestion.nodes.map((entry) => entry.name),
            reason: suggestion.reason,
          });
          nodes.forEach((node) => usedNodeIds.add(node.id));
          usedNodeIds.add(group.id);
        } catch (error) {
          skipped.push({
            label: suggestion.nodes.map((entry) => entry.name).join(" + "),
            reason: normalizeErrorMessage(error, "由ш렇猷뱁븨???곸슜?섏? 紐삵뻽?듬땲??"),
          });
        }
      }
    }

    return {
      applied,
      skipped,
      usedNodeIds,
    };
  }

  function buildRegroupSuggestions(selection, usedNodeIds, context) {
    const suggestions = [];
    const seen = new Set();
    const parents = collectGroupableParents(selection, true);

    for (const parent of parents) {
      for (const suggestion of findTextBlockSuggestions(parent.children || [], usedNodeIds, context)) {
        const key = `${suggestion.parentName}:${suggestion.nodes.map((node) => node.id).join(",")}`;
        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        suggestions.push(suggestion);
        if (suggestions.length >= 12) {
          return suggestions;
        }
      }
    }

    return suggestions;
  }

  function buildInsights(context, renameResult, regroupResult, suggestions) {
    const insights = [
      `네이밍 기준: ${context.namingModeLabel}`,
      `맥락 기준: ${context.contextLabel}`,
      `이름 정리 ${renameResult.applied.length}건 적용`,
      `안전한 아이콘+라벨 리그룹핑 ${regroupResult.applied.length}건 적용`,
    ];

    if (context.preservedRootName) {
      insights.push(`가장 큰 선택 루트 이름 유지: ${context.preservedRootName}`);
    }

    if (context.aggressiveRegroup) {
      insights.push("하이브리드 모드에서 텍스트 블록 리그룹핑까지 적용");
    }

    if (suggestions.length > 0) {
      insights.push(`추가 리그룹핑 후보 ${suggestions.length}건 감지`);
    }

    if (renameResult.applied.length > 0) {
      const firstRename = renameResult.applied[0];
      insights.push(`대표 이름 변경: ${firstRename.from} -> ${firstRename.to}`);
    }

    if (regroupResult.applied.length > 0) {
      const firstGroup = regroupResult.applied[0];
      insights.push(`대표 리그룹핑: ${firstGroup.name}`);
    }

    return insights;
  }

  function collectSceneNodes(selection) {
    const nodes = [];
    const stack = [...selection];
    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      nodes.push(node);

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return nodes;
  }

  function collectGroupableParents(selection, includeSuggestionParents) {
    const parents = [];
    const seen = new Set();
    const stack = [...selection];

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      if (hasChildren(node)) {
        if (canUseParentForGrouping(node, includeSuggestionParents)) {
          const key = getParentKey(node);
          if (!seen.has(key)) {
            seen.add(key);
            parents.push(node);
          }
        }

        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return parents;
  }

  function canUseParentForGrouping(parent, includeSuggestionParents) {
    if (!parent || !hasChildren(parent) || parent.locked === true || parent.children.length < 2) {
      return false;
    }

    if (isInsideInstance(parent)) {
      return false;
    }

    const type = String(parent.type || "");
    if (type === "INSTANCE" || type === "COMPONENT" || type === "COMPONENT_SET") {
      return false;
    }

    if (typeof parent.layoutMode === "string" && parent.layoutMode !== "NONE") {
      return includeSuggestionParents === true;
    }

    return true;
  }

  function canRenameNode(node) {
    if (!node || node.locked === true || node.visible === false) {
      return false;
    }

    if (isInsideInstance(node)) {
      return false;
    }

    return typeof node.name === "string";
  }

  function shouldPreserveRootName(node, context, currentName) {
    if (!context || !context.preservedRootId || !node || node.id !== context.preservedRootId) {
      return false;
    }

    if (shouldAlwaysEvaluateHybridDisplayName(node, context)) {
      return false;
    }

    return true;
  }

  function shouldAlwaysEvaluateHybridDisplayName(node, context, knownUseHybridDisplayName, knownMajorSection) {
    if (resolveNamingMode(context && context.namingMode) !== "hybrid") {
      return false;
    }

    if (!node || !context) {
      return false;
    }

    const useHybridDisplayName =
      typeof knownUseHybridDisplayName === "boolean"
        ? knownUseHybridDisplayName
        : shouldUseHybridDisplayName(node, context);
    if (!useHybridDisplayName) {
      return false;
    }

    const majorSection =
      typeof knownMajorSection === "boolean" ? knownMajorSection : isMajorHybridSection(node, context);
    return !!majorSection;
  }

  function resolveRenameDecision(candidate, aiSuggestion, aiResult) {
    const hasAiSuggestion =
      !!(aiSuggestion && aiSuggestion.name) && !isInvalidAiDisplaySuggestion(aiSuggestion.name, candidate);
    if (hasAiSuggestion) {
      return {
        name: aiSuggestion.name,
        reason: aiSuggestion.reason || candidate.reason,
        source: "ai",
      };
    }

    if (candidate && candidate.aiOnlySectionName) {
      const safeCurrentName = candidate.currentName && candidate.currentNameSafeDisplay === true && candidate.currentNameSemanticallyWeak !== true;
      const safeLocalBaseName = candidate.baseName && candidate.baseNameSafeDisplay === true && candidate.baseNameSemanticallyWeak !== true;

      if (
        safeLocalBaseName &&
        canonicalizeName(candidate.baseName) !== canonicalizeName(candidate.currentName)
      ) {
        return {
          name: candidate.baseName,
          reason: buildAiSectionFallbackReason(aiResult),
          source: "local",
        };
      }

      if (safeCurrentName) {
        return null;
      }

      const safeSectionName = buildSafeAiSectionFallbackName(candidate);
      if (!safeSectionName) {
        return null;
      }

      return {
        name: safeSectionName,
        reason: buildAiSectionFallbackReason(aiResult),
        source: "local",
      };
    }

    if (!candidate || !candidate.baseName) {
      return null;
    }

    return {
      name: candidate.baseName,
      reason: candidate.reason,
      source: "local",
    };
  }

  function buildSafeAiSectionFallbackName(candidate) {
    if (!candidate || !candidate.aiOnlySectionName) {
      return candidate && candidate.baseName ? candidate.baseName : "";
    }

    if (candidate.baseName && candidate.baseNameSafeDisplay === true && candidate.baseNameSemanticallyWeak !== true) {
      return candidate.baseName;
    }

    const ordinal =
      candidate.needsIndex && Number(candidate.majorSectionOrder) > 0
        ? String(candidate.majorSectionOrder).padStart(2, "0") + "_"
        : "";
    return `${ordinal}Content`;
  }

  function buildAiSectionFallbackReason(aiResult) {
    if (aiResult && aiResult.failed) {
      return "AI 오류로 안전한 번호형 대분류 기본값을 사용했습니다.";
    }

    if (aiResult && aiResult.configured !== true) {
      return "AI 비활성 상태라 안전한 번호형 대분류 기본값을 사용했습니다.";
    }

    return "AI 대분류 네이밍 응답이 없어 안전한 번호형 기본값을 사용했습니다.";
  }

  function isInvalidAiDisplaySuggestion(name, candidate) {
    if (!candidate || !candidate.aiOnlySectionName) {
      return false;
    }

    const normalized = String(name || "").trim().replace(/^\d{2}_/, "");
    const slug = slugifyAsciiToken(normalized);
    if (!slug) {
      return true;
    }

    if (isWeakHybridDisplayName(normalized)) {
      return true;
    }

    if (slug === "pricing" && candidate.looksLikePricing !== true) {
      return true;
    }

    return false;
  }

  function isSafeLocalDisplayFallback(name, node, context) {
    const normalized = String(name || "").trim();
    if (!normalized) {
      return false;
    }

    if (normalized.includes("/")) {
      return false;
    }

    if (isWeakHybridDisplayName(normalized)) {
      return false;
    }

    const slug = slugifyAsciiToken(normalized.replace(/^\d{2}_/, "").trim());
    if (!slug) {
      return false;
    }

    if (slug === "pricing" && node && !looksLikePricingSection(node)) {
      return false;
    }

    if (slug === "navigation" && node && !looksLikeNavigationBar(node)) {
      return false;
    }

    if ((slug === "outro" || looksLikeClosingDisplaySlug(slug)) && node && !looksLikeOutroSection(node)) {
      return false;
    }

    if (slug === "key-visual" && node && !looksLikeKeyVisualSection(node, context)) {
      return false;
    }

    if (slug === "introduction" && node && looksLikeCompositeContentWrapper(node)) {
      return false;
    }

    if (
      slug === "introduction" &&
      node &&
      isMajorHybridSection(node, context) &&
      getHybridDisplayOrdinal(node, context) === "01" &&
      looksLikeKeyVisualSection(node, context)
    ) {
      return false;
    }

    return true;
  }

  function looksLikeClosingDisplaySlug(slug) {
    return /(?:^|-)closing(?:-|$)|(?:^|-)summary(?:-|$)|(?:^|-)conclusion(?:-|$)|(?:^|-)takeaway(?:-|$)/.test(
      String(slug || "")
    );
  }

  function isSemanticallyWeakCurrentName(name, node, context) {
    const normalized = String(name || "").trim();
    if (!normalized) {
      return true;
    }

    const slug = slugifyAsciiToken(normalized.replace(/^\d{2}_/, "").replace(/[/.]+/g, " "));
    const segments = normalized
      .replace(/^\d{2}_/, "")
      .split(/[/.]+/)
      .map((segment) => slugifyAsciiToken(segment))
      .filter(Boolean);

    if (segments.some((segment) => segment === "field" || segment === "input" || segment === "field-label")) {
      return !isFieldSemanticNode(node);
    }

    if (segments.some((segment) => segment === "button" || segment === "cta" || segment === "button-label")) {
      return !isButtonSemanticNode(node);
    }

    if (segments.some((segment) => segment === "navbar" || segment === "navigation" || segment === "menu")) {
      return !looksLikeNavigationBar(node);
    }

    if (
      segments.some((segment) => segment === "outro" || segment === "footer" || segment === "closing" || segment === "summary") ||
      looksLikeClosingDisplaySlug(slug)
    ) {
      return !looksLikeOutroSection(node);
    }

    if (segments.some((segment) => segment === "hero" || segment === "key-visual" || segment === "kv") || slug === "key-visual") {
      return !looksLikeKeyVisualSection(node, context);
    }

    if (
      slug === "introduction" &&
      isMajorHybridSection(node, context) &&
      getHybridDisplayOrdinal(node, context) === "01" &&
      looksLikeKeyVisualSection(node, context)
    ) {
      return true;
    }

    return false;
  }

  function proposeNodeName(node, context, hints) {
    const type = String(node.type || "UNKNOWN");
    const textHint = hints && typeof hints.textHint === "string" ? hints.textHint : getPrimaryTextHint(node);
    const sectionSlug = hints && hints.sectionSlug ? hints.sectionSlug : detectSectionSlug(node, context);
    const contentSlug = hints && hints.contentSlug ? hints.contentSlug : resolveContentSlug(node, textHint, context);
    const topicSlug = hints && hints.topicSlug ? hints.topicSlug : detectTopicSlug(node, context, textHint);
    const semanticSlug = contentSlug || topicSlug || sectionSlug || (context && context.contextSlug) || "content";
    const groupRole = hints && hints.groupRole ? hints.groupRole : (hasChildren(node) ? inferGroupRole(node, semanticSlug) : "");
    const repeatRole =
      hints && hints.repeatRole
        ? hints.repeatRole
        : describeRepeatableRole(node, context, {
            textHint: textHint,
            sectionSlug: sectionSlug,
            contentSlug: contentSlug,
            topicSlug: topicSlug,
            groupRole: groupRole,
          });

    if (resolveNamingMode(context.namingMode) === "hybrid" && hints && hints.majorSection === true) {
      return buildHybridDisplayName(node, context, {
        textHint,
        sectionSlug,
        contentSlug,
        topicSlug,
        groupRole,
        repeatRole,
      });
    }

    if (type === "TEXT") {
      return buildTextNodeName(node, textHint, sectionSlug, contentSlug, topicSlug, context);
    }

    if (isButtonContainer(node)) {
      if (resolveNamingMode(context.namingMode) === "hybrid") {
        return `CTA ${humanizeHybridSegment(detectButtonVariant(node) || "primary")}`;
      }
      return buildStructuredName(context.namingMode, "button", detectButtonVariant(node), findActionSlug(node) || contentSlug || "action");
    }

    if (isFieldContainer(node)) {
      if (resolveNamingMode(context.namingMode) === "hybrid") {
        return "Input";
      }
      return buildStructuredName(context.namingMode, "field", findFieldLabel(node) || contentSlug || "input", "input");
    }

    if (isImageLikeNode(node)) {
      return buildImageNodeName(node, sectionSlug, contentSlug, topicSlug, context);
    }

    if (isIconLikeNode(node)) {
      if (resolveNamingMode(context.namingMode) === "hybrid") {
        return "Icon";
      }
      return buildStructuredName(context.namingMode, "icon", findActionSlug(node) || contentSlug || sectionSlug || "glyph");
    }

    if (hasChildren(node)) {
      return buildContainerName(node, context, sectionSlug, contentSlug, topicSlug, {
        groupRole: groupRole,
        repeatRole: repeatRole,
      });
    }

    if (VECTOR_TYPES.has(type)) {
      if (resolveNamingMode(context.namingMode) === "hybrid") {
        return "Shape";
      }
      return buildStructuredName(context.namingMode, "shape", contentSlug || topicSlug || "vector");
    }

    if (resolveNamingMode(context.namingMode) === "hybrid") {
      return "Layer";
    }

    return buildStructuredName(context.namingMode, "layer", typePrefix(type), contentSlug || topicSlug || sectionSlug || "item");
  }

  function buildTextNodeName(node, textHint, sectionSlug, contentSlug, topicSlug, context) {
    const text = textHint || getTextValue(node);
    const semanticSlug = contentSlug || topicSlug || sectionSlug || context.contextSlug || "content";
    if (resolveNamingMode(context.namingMode) === "hybrid") {
      return buildHybridTextAtomName(node, text, sectionSlug, contentSlug, topicSlug, context);
    }

    if (!text) {
      return buildStructuredName(context.namingMode, "text", "body", sectionSlug || topicSlug || "content", "copy");
    }

    const actionSlug = findActionSlugFromText(text);
    if (actionSlug) {
      return buildStructuredName(context.namingMode, "text", "button-label", actionSlug);
    }

    const fieldLabel = matchFieldLabel(text);
    if (fieldLabel) {
      return buildStructuredName(context.namingMode, "text", "field-label", fieldLabel);
    }

    const textRole = detectTextRole(node, text);
    if (textRole === "heading" || textRole === "title") {
      return buildStructuredName(context.namingMode, "text", textRole, sectionSlug || topicSlug || "content", topicSlug || contentSlug || "title");
    }

    if (textRole === "meta") {
      return buildStructuredName(context.namingMode, "text", "meta", semanticSlug || "label");
    }

    if (textRole === "label") {
      return buildStructuredName(context.namingMode, "text", "label", semanticSlug || "label");
    }

    return buildStructuredName(context.namingMode, "text", "body", sectionSlug || topicSlug || "content", contentSlug || topicSlug || "copy");
  }

  function buildRenameReason(node, context) {
    if (shouldUseHybridDisplayName(node, context)) {
      return "디자인 영역 역할 기준";
    }

    if (String(node.type || "") === "TEXT") {
      return "웹 구조형 텍스트 역할 기준";
    }

    if (isButtonContainer(node)) {
      return "웹 버튼 구조 기준";
    }

    if (isFieldContainer(node)) {
      return "웹 입력 필드 구조 기준";
    }

    if (isIconLikeNode(node)) {
      return "웹 아이콘 역할 기준";
    }

    return "웹 호환 구조형 네이밍 기준";
  }

  function buildContainerName(node, context, sectionSlug, contentSlug, topicSlug, hints) {
    const resolvedSection = sectionSlug || context.contextSlug || topicSlug || "content";
    const semanticSlug = contentSlug || topicSlug || "item";
    const groupRole = hints && hints.groupRole ? hints.groupRole : inferGroupRole(node, semanticSlug);
    const repeatRole =
      hints && hints.repeatRole
        ? hints.repeatRole
        : describeRepeatableRole(node, context, {
            sectionSlug: sectionSlug,
            contentSlug: contentSlug,
            topicSlug: topicSlug,
            groupRole: groupRole,
          });

    if (repeatRole && Array.isArray(repeatRole.webSegments) && repeatRole.webSegments.length > 0) {
      return resolveNamingMode(context.namingMode) === "hybrid" ? repeatRole.hybridLabel : buildStructuredNameFromSegments(context.namingMode, repeatRole.webSegments);
    }

    if (resolveNamingMode(context.namingMode) === "hybrid") {
      const hybridScopeName = buildHybridScopeContainerName(sectionSlug, contentSlug, topicSlug, groupRole);
      if (hybridScopeName) {
        return hybridScopeName;
      }
    }

    if (isCardLikeNode(node)) {
      return buildStructuredName(context.namingMode, "card", resolvedSection, semanticSlug);
    }

    if (isSectionRootLike(node)) {
      return buildStructuredName(context.namingMode, "section", resolvedSection, topicSlug || "");
    }

    if (String(node.type || "") === "GROUP") {
      return buildStructuredName(context.namingMode, "group", resolvedSection, groupRole, topicSlug || "");
    }

    return buildStructuredName(context.namingMode, "container", resolvedSection, groupRole, topicSlug || "");
  }

  function buildHybridScopeContainerName(sectionSlug, contentSlug, topicSlug, groupRole) {
    const scopeSlug = slugifyAsciiToken(sectionSlug || contentSlug || topicSlug);
    const roleSlug = slugifyAsciiToken(groupRole);
    if (!scopeSlug || !roleSlug) {
      return "";
    }

    if (GENERIC_TOKEN_SET.has(scopeSlug) && GENERIC_TOKEN_SET.has(roleSlug)) {
      return "";
    }

    if (roleSlug === "copy" || roleSlug === "media" || roleSlug === "list" || roleSlug === "actions" || roleSlug === "item") {
      return buildStructuredName("hybrid", scopeSlug, roleSlug === "actions" ? "actions" : roleSlug);
    }

    if (scopeSlug === "hero" && roleSlug === "content") {
      return "Hero/Copy";
    }

    return "";
  }

  function buildHybridTextAtomName(node, text, sectionSlug, contentSlug, topicSlug, context) {
    const normalizedText = compactText(text);
    if (!normalizedText) {
      return "Body";
    }

    if (looksLikePriceText(normalizedText)) {
      return "Price";
    }

    if (looksLikeBadgeTextNode(node, normalizedText)) {
      return "Badge";
    }

    const actionSlug = findActionSlugFromText(normalizedText);
    if (actionSlug) {
      return "Label";
    }

    const fieldLabel = matchFieldLabel(normalizedText);
    if (fieldLabel) {
      return "Label";
    }

    const textRole = detectTextRole(node, normalizedText);
    if (textRole === "heading" || textRole === "title") {
      return "Title";
    }

    if (textRole === "meta") {
      return "Meta";
    }

    if (textRole === "label") {
      if (sectionSlug === "pricing" || contentSlug === "pricing" || topicSlug === "shopping") {
        return "Price";
      }
      return "Label";
    }

    if (context && context.contextSlug === "hero" && normalizedText.length <= 60) {
      return "Body";
    }

    return "Body";
  }

  function describeRepeatableRole(node, context, hints) {
    if (!node || !context) {
      return null;
    }

    if (hints && hints.majorSection) {
      return null;
    }

    if (String(node.type || "") === "TEXT" || isButtonContainer(node) || isFieldContainer(node) || isIconLikeNode(node)) {
      return null;
    }

    const textHint = hints && typeof hints.textHint === "string" ? hints.textHint : getPrimaryTextHint(node);
    const sectionSlug = hints && hints.sectionSlug ? hints.sectionSlug : detectSectionSlug(node, context);
    const contentSlug = hints && hints.contentSlug ? hints.contentSlug : resolveContentSlug(node, textHint, context);
    const topicSlug = hints && hints.topicSlug ? hints.topicSlug : detectTopicSlug(node, context, textHint);
    const semanticSlug = contentSlug || topicSlug || sectionSlug || context.contextSlug || "content";
    const groupRole = hints && hints.groupRole ? hints.groupRole : (hasChildren(node) ? inferGroupRole(node, semanticSlug) : "");
    const parent = node.parent;

    if (parent && looksLikeNavigationBar(parent)) {
      return buildRepeatRole("menu-item", "Menu Item", "Menu", ["group", "navbar", "item"]);
    }

    if (looksLikeFaqItemNode(node, context, sectionSlug, contentSlug) || (parent && looksLikeFaqSectionNode(parent, context))) {
      return buildRepeatRole("faq-item", "FAQ Item", "FAQ", ["group", "faq", "item"]);
    }

    if ((sectionSlug === "pricing" || looksLikePricingCardNode(node, context, sectionSlug, contentSlug)) && (isCardLikeNode(node) || groupRole === "item" || groupRole === "list")) {
      return buildRepeatRole("pricing-card", "Pricing Card", "Plan", ["card", "pricing"], "display");
    }

    if (looksLikeProductCardNode(node, context, sectionSlug, contentSlug, topicSlug) && (isCardLikeNode(node) || groupRole === "item" || groupRole === "list")) {
      return buildRepeatRole("product-card", "Product Card", "Product", ["card", "product"], "display", true);
    }

    if (sectionSlug === "feature" && (isCardLikeNode(node) || groupRole === "item" || groupRole === "list")) {
      return buildRepeatRole("feature-card", "Feature Card", "Feature", ["card", "feature"], "display", true);
    }

    if (sectionSlug === "dashboard" && (isCardLikeNode(node) || groupRole === "item" || groupRole === "list")) {
      return buildRepeatRole("metric-card", "Metric Card", "Metric", ["card", "metric"], "display", true);
    }

    if ((contentSlug === "archive" || sectionSlug === "archive") && (isCardLikeNode(node) || groupRole === "item")) {
      return buildRepeatRole("archive-card", "Archive Card", "Archive", ["card", "archive"], "display", true);
    }

    if (sectionSlug === "hero" && isCardLikeNode(node)) {
      return buildRepeatRole("highlight-card", "Highlight Card", "Card", ["card", "highlight"], "display", true);
    }

    if (isCardLikeNode(node)) {
      const contextualCardSlug = selectRepeatableContextSlug(sectionSlug, contentSlug, topicSlug, context);
      if (contextualCardSlug) {
        return buildRepeatRole(
          "card:" + contextualCardSlug,
          joinHybridDisplayParts(buildHybridRoleLabel(contextualCardSlug), "Card"),
          "Card",
          ["card", contextualCardSlug],
          "display"
        );
      }
    }

    if (groupRole === "item" || groupRole === "list") {
      const contextualItemSlug = selectRepeatableContextSlug(sectionSlug, contentSlug, topicSlug, context);
      if (contextualItemSlug) {
        return buildRepeatRole(
          "item:" + contextualItemSlug,
          joinHybridDisplayParts(buildHybridRoleLabel(contextualItemSlug), "Item"),
          contextualItemSlug === "navbar" ? "Menu" : "Item",
          ["group", contextualItemSlug, "item"]
        );
      }
    }

    return null;
  }

  function resolveCandidateNameMode(context, useHybridDisplayName, majorSection, repeatRole) {
    if (resolveNamingMode(context && context.namingMode) !== "hybrid") {
      return "structured";
    }

    if (!useHybridDisplayName) {
      return "structured";
    }

    if (majorSection) {
      return "display";
    }

    if (repeatRole && repeatRole.preferredMode === "display") {
      return "display";
    }

    return "structured";
  }

  function buildRepeatRole(familyKey, hybridLabel, hybridSuffix, webSegments, preferredMode, preferIndex) {
    return {
      familyKey: familyKey,
      hybridLabel: hybridLabel,
      hybridSuffix: hybridSuffix || "",
      webSegments: Array.isArray(webSegments) ? webSegments.slice(0, 6) : [],
      preferredMode: preferredMode === "display" ? "display" : "structured",
      preferIndex: preferIndex === true,
    };
  }

  function selectRepeatableContextSlug(sectionSlug, contentSlug, topicSlug, context) {
    const values = [contentSlug, sectionSlug, topicSlug, context && context.contextSlug ? context.contextSlug : "", context && context.topicSlug ? context.topicSlug : ""];
    for (const value of values) {
      const slug = slugifyAsciiToken(value);
      if (slug && !GENERIC_TOKEN_SET.has(slug)) {
        return slug;
      }
    }

    return "";
  }

  function looksLikeFaqSectionNode(node, context) {
    if (!node || !hasChildren(node)) {
      return false;
    }

    const values = collectNodeSemanticValues(node, "", 6, 2);
    const corpus = values.join(" ").toLowerCase();
    if (/faq|q&a|questions|question|answer/.test(corpus)) {
      return true;
    }

    return !!(context && context.contextSlug === "faq");
  }

  function looksLikeFaqItemNode(node, context, knownSectionSlug, knownContentSlug) {
    if (!node || !hasChildren(node)) {
      return false;
    }

    if (knownSectionSlug === "faq" || knownContentSlug === "faq") {
      return true;
    }

    if (node.parent && looksLikeFaqSectionNode(node.parent, context)) {
      return true;
    }

    const texts = collectNodeTexts(node, 4, 2).map((text) => compactText(text)).filter(Boolean);
    if (texts.length < 2) {
      return false;
    }

    const first = texts[0].toLowerCase();
    if (/^(q|faq|qna)\b/.test(first)) {
      return true;
    }

    if (/\?$/.test(texts[0])) {
      return true;
    }

    return /question|answer/.test(texts.join(" ").toLowerCase());
  }

  function looksLikePricingCardNode(node, context, knownSectionSlug, knownContentSlug) {
    if (!node || !hasChildren(node)) {
      return false;
    }

    if (knownSectionSlug === "pricing" || knownContentSlug === "pricing") {
      return true;
    }

    if (context && context.contextSlug === "pricing") {
      return true;
    }

    return looksLikePricingValueSet(collectNodeTexts(node, 8, 3));
  }

  function looksLikeProductCardNode(node, context, knownSectionSlug, knownContentSlug, knownTopicSlug) {
    if (!node || !hasChildren(node)) {
      return false;
    }

    if (knownSectionSlug === "shopping" || knownContentSlug === "shopping" || knownTopicSlug === "shopping") {
      return true;
    }

    const values = collectNodeSemanticValues(node, "", 6, 2);
    const corpus = values.join(" ").toLowerCase();
    if (/product|sku|sale|buy|cart|checkout|shop|shopping|price/.test(corpus)) {
      return true;
    }

    const imageCount = countDirectChildrenByPredicate(node, isImageLikeNode);
    const textCount = countDirectChildrenByType(node, "TEXT");
    return isCardLikeNode(node) && imageCount >= 1 && textCount >= 1 && !!(context && context.topicSlug === "shopping");
  }

  function shouldUseHybridDisplayName(node, context) {
    if (resolveNamingMode(context && context.namingMode) !== "hybrid") {
      return false;
    }

    if (!node || node.locked === true || node.visible === false || isInsideInstance(node)) {
      return false;
    }

    const type = String(node.type || "");
    if (type === "TEXT" || isIconLikeNode(node)) {
      return false;
    }

    if (isButtonContainer(node) || isFieldContainer(node)) {
      return true;
    }

    if (isImageLikeNode(node)) {
      const bounds = getNodeBounds(node);
      return !!bounds && (bounds.width >= 120 || bounds.height >= 120);
    }

    if (isSectionRootLike(node)) {
      return true;
    }

    return hasChildren(node) && node.children.length >= 2;
  }

  function buildHybridDisplayName(node, context, hints) {
    const label = buildHybridDisplayLabel(node, context, hints);
    const ordinal = getHybridDisplayOrdinal(node, context);
    return ordinal ? `${ordinal}_${label}` : label;
  }

  function buildHybridDisplayLabel(node, context, hints) {
    const textHint = hints && typeof hints.textHint === "string" ? hints.textHint : getPrimaryTextHint(node);
    const sectionSlug = hints && hints.sectionSlug ? hints.sectionSlug : detectSectionSlug(node, context);
    const contentSlug = hints && hints.contentSlug ? hints.contentSlug : resolveContentSlug(node, textHint, context);
    const topicSlug = hints && hints.topicSlug ? hints.topicSlug : detectTopicSlug(node, context, textHint);
    const semanticSlug = contentSlug || topicSlug || sectionSlug || (context && context.contextSlug) || "content";
    const groupRole = hints && hints.groupRole ? hints.groupRole : (hasChildren(node) ? inferGroupRole(node, semanticSlug) : "");
    const actionSlug = isButtonContainer(node) ? findActionSlug(node) || contentSlug || "action" : "";
    const fieldSlug = isFieldContainer(node) ? findFieldLabel(node) || contentSlug || "input" : "";
    const imageRole = isImageLikeNode(node) ? detectImageRole(node) : "";
    const repeatRole =
      hints && hints.repeatRole
        ? hints.repeatRole
        : describeRepeatableRole(node, context, {
            textHint: textHint,
            sectionSlug: sectionSlug,
            contentSlug: contentSlug,
            topicSlug: topicSlug,
            groupRole: groupRole,
          });
    const childNodes = hasChildren(node) ? node.children.filter(Boolean) : [];
    const textCount = childNodes.filter((child) => child.type === "TEXT").length;
    const imageCount = childNodes.filter((child) => isImageLikeNode(child)).length;

    if (isButtonContainer(node)) {
      return joinHybridDisplayParts(buildHybridRoleLabel(actionSlug || "action"), "CTA");
    }

    if (isFieldContainer(node)) {
      return joinHybridDisplayParts(buildHybridRoleLabel(fieldSlug || "input"), "Input");
    }

    const explicitLabel = detectExplicitHybridDisplayLabel(node, textHint, sectionSlug, contentSlug, topicSlug, context);
    if (explicitLabel) {
      return explicitLabel;
    }

    if (isMajorHybridSection(node, context)) {
      return buildMajorHybridSectionLabel(node, context, {
        sectionSlug,
        contentSlug,
        topicSlug,
        groupRole,
        imageRole,
        textCount,
        imageCount,
      });
    }

    if (repeatRole && repeatRole.hybridLabel) {
      return repeatRole.hybridLabel;
    }

    if (imageRole === "hero" || sectionSlug === "hero") {
      if (isImageLikeNode(node) || imageCount > textCount) {
        return "Key Visual";
      }

      if (groupRole === "copy" || textCount >= 2) {
        return "Introduction";
      }
    }

    if (looksLikeCompositeContentWrapper(node)) {
      return "Content";
    }

    if (sectionSlug === "navbar") {
      if (!looksLikeNavigationBar(node)) {
        return "Content";
      }
      if (groupRole === "item" && semanticSlug && semanticSlug !== "navbar") {
        return joinHybridDisplayParts(buildHybridRoleLabel(semanticSlug), "Menu");
      }
      return "Navigation";
    }

    if (sectionSlug === "footer") {
      return looksLikeOutroSection(node, sectionSlug) ? "Outro" : "Content";
    }

    if (sectionSlug === "sidebar") {
      return "Sidebar";
    }

    if (sectionSlug === "feature") {
      return groupRole === "list" ? "Feature List" : "Features";
    }

    if (sectionSlug === "pricing" && looksLikePricingSection(node)) {
      return "Pricing";
    }

    if (sectionSlug === "modal") {
      return "Dialog";
    }

    if (sectionSlug === "dashboard") {
      return groupRole === "list" ? "Metric List" : "Metrics";
    }

    if (imageRole === "avatar") {
      return "Profile Image";
    }

    if (imageRole === "thumbnail") {
      return "Thumbnail";
    }

    if (imageRole === "poster") {
      return "Poster";
    }

    if (imageRole === "illustration") {
      return "Illustration";
    }

    if (imageRole === "logo") {
      return "Logo";
    }

    if (imageRole === "photo") {
      return "Photo";
    }

    if (groupRole === "copy") {
      return sectionSlug === "hero" ? "Introduction" : joinHybridDisplayParts(buildHybridRoleLabel(semanticSlug), "Copy");
    }

    if (groupRole === "actions") {
      return actionSlug ? joinHybridDisplayParts(buildHybridRoleLabel(actionSlug), "Actions") : "Actions";
    }

    if (groupRole === "list") {
      return joinHybridDisplayParts(buildHybridRoleLabel(sectionSlug || semanticSlug), "List");
    }

    if (groupRole === "media") {
      return "Media";
    }

    if (topicSlug) {
      return buildHybridRoleLabel(topicSlug);
    }

    if (contentSlug && !GENERIC_TOKEN_SET.has(contentSlug)) {
      return buildHybridRoleLabel(contentSlug);
    }

    if (sectionSlug && !GENERIC_TOKEN_SET.has(sectionSlug)) {
      return buildHybridRoleLabel(sectionSlug);
    }

    return "Content";
  }

  function buildMajorHybridSectionLabel(node, context, hints) {
    return mapSectionRoleToDisplayLabel(node, context, analyzeSectionRole(node, context, hints));
  }

  function analyzeSectionRole(node, context, hints) {
    const majorSections = getMajorHybridSectionSiblings(node, context);
    const orderIndex = majorSections.findIndex((entry) => entry && entry.id === node.id);
    const sectionSlug = hints && hints.sectionSlug ? hints.sectionSlug : detectSectionSlug(node, context);
    const textHint = hints && typeof hints.textHint === "string" ? hints.textHint : getPrimaryTextHint(node);
    const contentSlug = hints && hints.contentSlug ? hints.contentSlug : resolveContentSlug(node, textHint, context);
    const topicSlug = hints && hints.topicSlug ? hints.topicSlug : detectTopicSlug(node, context, textHint);
    const groupRole = hints && hints.groupRole ? hints.groupRole : inferGroupRole(node, contentSlug || sectionSlug || "content");
    const imageRole = hints && hints.imageRole ? hints.imageRole : (isImageLikeNode(node) ? detectImageRole(node) : "");
    const textCount = hints && typeof hints.textCount === "number" ? hints.textCount : countDirectChildrenByType(node, "TEXT");
    const imageCount =
      hints && typeof hints.imageCount === "number" ? hints.imageCount : countDirectChildrenByPredicate(node, isImageLikeNode);
    const headingTexts = hints && Array.isArray(hints.headingTexts) ? hints.headingTexts : collectProminentTexts(node, 3);
    const actionTexts = hints && Array.isArray(hints.actionTexts) ? hints.actionTexts : collectActionTexts(node, 3);
    const bodyTexts = collectNodeTexts(node, 6, 3).map((text) => compactText(text)).filter(Boolean);
    const semanticValues = collectNodeSemanticValues(node, textHint, 8, 3);
    const corpus = semanticValues.join(" ").toLowerCase();
    const isFirst = orderIndex === 0;
    const isLast = orderIndex >= 0 && orderIndex === majorSections.length - 1;
    const hasKvStructure = looksLikeKeyVisualSection(node, context, sectionSlug);
    const hasIntroNarrative =
      contentSlug === "introduction" ||
      sectionSlug === "hero" ||
      /intro|introduction|opening|overview|about|story|reviewer|real use|experience/.test(corpus);
    const hasClosingNarrative =
      /outro|closing|final|wrap up|thank you|summary|conclusion|takeaway/.test(corpus);
    const hasFaqNarrative = /faq|q&a|frequently asked|question/.test(corpus);
    const hasAwardsNarrative = /award|awards|trophy|prize|certified|certification/.test(corpus);
    const hasArchiveNarrative = /archive|archiving|collection|library|history/.test(corpus);

    let role = "content-section";
    let reason = "general section";

    if (looksLikeCompositeContentWrapper(node)) {
      role = "content-wrapper";
      reason = "multiple large blocks in one wrapper";
    } else if (looksLikeCouponProductSection(node)) {
      role = "coupon-product";
      reason = "coupon and product card appear together";
    } else if (hasFaqNarrative) {
      role = "faq";
      reason = "question and answer narrative";
    } else if (hasAwardsNarrative) {
      role = "awards";
      reason = "award or certification narrative";
    } else if (hasArchiveNarrative) {
      role = "archive";
      reason = "archive or history narrative";
    } else if (looksLikePricingSection(node)) {
      role = "pricing";
      reason = "explicit price or plan structure";
    } else if (looksLikeProductSection(node)) {
      role = "product";
      reason = "product-like content card structure";
    } else if (sectionSlug === "feature") {
      role = "features";
      reason = "feature-oriented section structure";
    } else if (looksLikeOutroSection(node, sectionSlug, majorSections, orderIndex) || (isLast && hasClosingNarrative)) {
      role = "outro";
      reason = "last section or closing narrative";
    } else if (hasKvStructure || (isFirst && hasProminentHeadingText(node))) {
      role = "key-visual";
      reason = "top section with hero hierarchy";
    } else if (
      hasIntroNarrative ||
      groupRole === "copy" ||
      ((isFirst || orderIndex === 1) && headingTexts.length > 0 && imageCount <= textCount + 1)
    ) {
      role = "introduction";
      reason = "narrative copy-led introduction";
    } else if (sectionSlug === "navbar" && looksLikeNavigationBar(node)) {
      role = "navigation";
      reason = "navigation bar structure";
    } else if (isFirst) {
      role = "key-visual";
      reason = "first major section fallback";
    } else if (orderIndex === 1) {
      role = "introduction";
      reason = "second major section fallback";
    }

    return {
      role,
      reason,
      summary: buildSectionNarrativeSummary({
        role,
        reason,
        orderIndex,
        majorCount: majorSections.length,
        sectionSlug,
        contentSlug,
        topicSlug,
        groupRole,
        imageRole,
        headingTexts,
        actionTexts,
        bodyTexts,
        hasKvStructure,
      }),
    };
  }

  function buildSectionNarrativeSummary(analysis) {
    const orderText =
      analysis.majorCount > 0 && analysis.orderIndex >= 0
        ? `${analysis.orderIndex + 1}/${analysis.majorCount}`
        : "single";
    const headings = Array.isArray(analysis.headingTexts) ? analysis.headingTexts.slice(0, 2).join(" / ") : "";
    const actions = Array.isArray(analysis.actionTexts) ? analysis.actionTexts.slice(0, 2).join(" / ") : "";
    const bodies = Array.isArray(analysis.bodyTexts) ? analysis.bodyTexts.slice(0, 2).join(" / ") : "";
    return [
      `Role: ${analysis.role}`,
      `Reason: ${analysis.reason}`,
      `Order: ${orderText}`,
      analysis.sectionSlug ? `Section: ${analysis.sectionSlug}` : "",
      analysis.contentSlug ? `Content: ${analysis.contentSlug}` : "",
      analysis.groupRole ? `Group: ${analysis.groupRole}` : "",
      analysis.hasKvStructure ? "Visual: hero-like" : "",
      headings ? `Headings: ${headings}` : "",
      bodies ? `Bodies: ${bodies}` : "",
      actions ? `Actions: ${actions}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
  }

  function mapSectionRoleToDisplayLabel(node, context, analysis) {
    const role = analysis && analysis.role ? analysis.role : "content-section";
    switch (role) {
      case "coupon-product":
        return "Coupon + Product Card";
      case "faq":
        return "FAQ";
      case "awards":
        return "Awards";
      case "archive":
        return "Archiving Page";
      case "pricing":
        return "Pricing";
      case "product":
        return buildProductSectionLabel(node, context);
      case "features":
        return "Features";
      case "outro":
        return "Outro";
      case "key-visual":
        return "Key Visual";
      case "introduction":
        return "Introduction";
      case "navigation":
        return "Navigation";
      case "content-wrapper":
        return "Content";
      default:
        return "Content Section";
    }
  }

  function looksLikeCouponProductSection(node) {
    const values = collectNodeSemanticValues(node, "", 6, 2);
    const corpus = values.join(" ").toLowerCase();
    return /coupon|promo|discount/.test(corpus) && /(product|card|item)/.test(corpus);
  }

  function looksLikePricingSection(node) {
    return looksLikePricingValueSet(collectNodeTexts(node, 10, 4));
  }

  function looksLikeProductSection(node) {
    if (!node || !hasChildren(node)) {
      return false;
    }

    const cardCount = countDirectChildrenByPredicate(node, isCardLikeNode);
    const imageCount = countDirectChildrenByPredicate(node, isImageLikeNode);
    const textCount = countDirectChildrenByType(node, "TEXT");
    return cardCount >= 1 && (imageCount >= 1 || textCount >= 2);
  }

  function buildProductSectionLabel(node, context) {
    const siblings = getMajorHybridSectionSiblings(node, context).filter((entry) => looksLikeProductSection(entry));
    if (siblings.length <= 1) {
      return "Product";
    }

    const productIndex = siblings.findIndex((entry) => entry && entry.id === node.id) + 1;
    return productIndex > 0 ? `Product ${formatRepeatIndex(productIndex)}` : "Product";
  }

  function hasProminentHeadingText(node) {
    if (!node) {
      return false;
    }

    const stack = [{ node, depth: 0 }];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      if (current.node.type === "TEXT") {
        const text = compactText(getTextValue(current.node));
        const fontSize = typeof current.node.fontSize === "number" ? current.node.fontSize : 0;
        if (text && ((fontSize >= 24 && text.length >= 8) || fontSize >= 32)) {
          return true;
        }
      }

      if (current.depth >= 3 || !hasChildren(current.node)) {
        continue;
      }

      for (let index = current.node.children.length - 1; index >= 0; index -= 1) {
        stack.push({ node: current.node.children[index], depth: current.depth + 1 });
      }
    }

    return false;
  }

  function looksLikeKeyVisualSection(node, context, knownSectionSlug) {
    if (!node || looksLikeNavigationBar(node) || isFieldContainer(node) || isButtonContainer(node)) {
      return false;
    }

    const sectionSlug = knownSectionSlug || detectSectionSlug(node, context || {});
    if (sectionSlug === "hero") {
      return true;
    }

    if (hasDominantVisualSection(node)) {
      return true;
    }

    const bounds = getNodeBounds(node);
    const parentBounds = node.parent ? getNodeBounds(node.parent) : null;
    if (!bounds || !parentBounds || parentBounds.width <= 0 || parentBounds.height <= 0) {
      return false;
    }

    const widthRatio = bounds.width / parentBounds.width;
    const heightRatio = bounds.height / parentBounds.height;
    const topOffset = bounds.y - parentBounds.y;
    const majorSections = getMajorHybridSectionSiblings(node, context || {});
    const orderIndex = majorSections.findIndex((entry) => entry && entry.id === node.id);

    return (
      orderIndex === 0 &&
      widthRatio >= 0.72 &&
      topOffset <= Math.max(140, parentBounds.height * 0.18) &&
      (heightRatio >= 0.16 || bounds.height >= 280) &&
      hasProminentHeadingText(node)
    );
  }

  function hasDominantVisualSection(node) {
    if (!node || !hasChildren(node)) {
      return false;
    }

    const bounds = getNodeBounds(node);
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
      return false;
    }

    for (const child of node.children) {
      if (!child || !isImageLikeNode(child)) {
        continue;
      }

      const childBounds = getNodeBounds(child);
      if (!childBounds) {
        continue;
      }

      const widthRatio = childBounds.width / bounds.width;
      const heightRatio = childBounds.height / bounds.height;
      if (widthRatio >= 0.45 || heightRatio >= 0.35) {
        return true;
      }
    }

    return false;
  }

  function countLargeDirectChildBlocks(node) {
    if (!node || !hasChildren(node)) {
      return 0;
    }

    const bounds = getNodeBounds(node);
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
      return 0;
    }

    let count = 0;
    for (const child of node.children) {
      if (!child || child.locked === true || child.visible === false || child.type === "TEXT") {
        continue;
      }

      const childBounds = getNodeBounds(child);
      if (!childBounds) {
        continue;
      }

      const widthRatio = childBounds.width / bounds.width;
      const heightRatio = childBounds.height / bounds.height;
      if (widthRatio >= 0.45 || heightRatio >= 0.14 || childBounds.height >= 160) {
        count += 1;
      }
    }

    return count;
  }

  function looksLikeCompositeContentWrapper(node) {
    if (!node || !hasChildren(node)) {
      return false;
    }

    const largeBlockCount = countLargeDirectChildBlocks(node);
    if (largeBlockCount >= 2) {
      return true;
    }

    return largeBlockCount >= 1 && countDirectChildrenByType(node, "TEXT") >= 3;
  }

  function looksLikeNavigationBar(node) {
    if (!node || !hasChildren(node)) {
      return false;
    }

    const bounds = getNodeBounds(node);
    const parentBounds = node.parent ? getNodeBounds(node.parent) : null;
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
      return false;
    }

    const heightRatio = parentBounds && parentBounds.height > 0 ? bounds.height / parentBounds.height : 0;
    const widthRatio = parentBounds && parentBounds.width > 0 ? bounds.width / parentBounds.width : 0;
    const topOffset = parentBounds ? bounds.y - parentBounds.y : 0;
    const directTextCount = countDirectChildrenByType(node, "TEXT");
    const iconCount = countDirectChildrenByPredicate(node, isIconLikeNode);
    const imageCount = countDirectChildrenByPredicate(node, isImageLikeNode);

    return (
      (bounds.height <= 220 || heightRatio <= 0.18) &&
      (widthRatio === 0 || widthRatio >= 0.55) &&
      topOffset <= Math.max(80, (parentBounds && parentBounds.height ? parentBounds.height * 0.12 : 80)) &&
      imageCount === 0 &&
      countLargeDirectChildBlocks(node) <= 1 &&
      (directTextCount >= 1 || iconCount >= 1)
    );
  }

  function looksLikeOutroSection(node, sectionSlug, majorSections, orderIndex) {
    const values = collectNodeSemanticValues(node, "", 6, 2);
    const corpus = values.join(" ").toLowerCase();
    if (/outro|closing|final|wrap up|thank you/.test(corpus) || sectionSlug === "footer") {
      return true;
    }

    if (!node || !node.parent) {
      return false;
    }

    const bounds = getNodeBounds(node);
    const parentBounds = getNodeBounds(node.parent);
    if (!bounds || !parentBounds || parentBounds.height <= 0) {
      return false;
    }

    const isLastSection =
      Array.isArray(majorSections) && majorSections.length > 1 ? orderIndex === majorSections.length - 1 : false;
    return isLastSection && bounds.height / parentBounds.height <= 0.24 && !looksLikeCompositeContentWrapper(node);
  }

  function countDirectChildrenByPredicate(node, predicate) {
    if (!node || !hasChildren(node)) {
      return 0;
    }

    let count = 0;
    for (const child of node.children) {
      if (child && typeof predicate === "function" && predicate(child)) {
        count += 1;
      }
    }
    return count;
  }

  function countDirectChildrenByType(node, type) {
    if (!node || !hasChildren(node)) {
      return 0;
    }

    let count = 0;
    for (const child of node.children) {
      if (child && String(child.type || "") === String(type || "")) {
        count += 1;
      }
    }
    return count;
  }

  function isMajorHybridSection(node, context) {
    return getMajorHybridSectionSiblings(node, context).some((entry) => entry && entry.id === (node && node.id));
  }

  function getMajorHybridSectionContainer(context) {
    if (!context) {
      return null;
    }

    const selectedRoots = getContextSelectedRoots(context);
    if (selectedRoots.length !== 1) {
      return null;
    }

    const root = selectedRoots[0];
    if (!root || root.id !== context.preservedRootId || !hasChildren(root)) {
      return root || null;
    }

    const directMajorChildren = getPotentialMajorHybridChildren(root, context);
    if (directMajorChildren.length >= 2) {
      return root;
    }

    const rootBounds = getNodeBounds(root);
    let bestWrapper = null;
    let bestWrapperCount = 0;

    for (const child of root.children) {
      if (!child || !hasChildren(child) || child.locked === true || child.visible === false) {
        continue;
      }

      if (isButtonContainer(child) || isFieldContainer(child) || isImageLikeNode(child) || looksLikeNavigationBar(child)) {
        continue;
      }

      const childBounds = getNodeBounds(child);
      if (!childBounds || !rootBounds || rootBounds.width <= 0 || rootBounds.height <= 0) {
        continue;
      }

      const widthRatio = childBounds.width / rootBounds.width;
      const heightRatio = childBounds.height / rootBounds.height;
      if (widthRatio < 0.55 && heightRatio < 0.35) {
        continue;
      }

      const nestedMajorChildren = getPotentialMajorHybridChildren(child, context);
      if (nestedMajorChildren.length >= 2 && nestedMajorChildren.length > bestWrapperCount) {
        bestWrapper = child;
        bestWrapperCount = nestedMajorChildren.length;
      }
    }

    return bestWrapper || root;
  }

  function getPotentialMajorHybridChildren(container, context) {
    if (!container || !hasChildren(container)) {
      return [];
    }

    return container.children.filter((child) => isPotentialMajorHybridSectionCandidate(child, context, container)).sort(compareBounds);
  }

  function getMajorHybridSectionSiblings(node, context) {
    if (!node || !context) {
      return [];
    }

    const selectedRoots = getContextSelectedRoots(context);
    if (selectedRoots.length > 1 && selectedRoots.some((entry) => entry.id === node.id)) {
      return selectedRoots.filter((entry) => isPotentialMajorHybridSection(entry, context)).sort(compareBounds);
    }

    const container = getMajorHybridSectionContainer(context);
    if (container && node.parent && node.parent.id === container.id) {
      return getPotentialMajorHybridChildren(container, context);
    }

    return [];
  }

  function isPotentialMajorHybridSection(node, context) {
    const container = getMajorHybridSectionContainer(context);
    if (container && node && node.parent && node.parent.id === container.id) {
      return isPotentialMajorHybridSectionCandidate(node, context, container);
    }

    const selectedRoots = getContextSelectedRoots(context);
    if (selectedRoots.length > 1) {
      return selectedRoots.some((entry) => entry && entry.id === node.id) && isPotentialMajorHybridSectionCandidate(node, context, node.parent);
    }

    return false;
  }

  function isPotentialMajorHybridSectionCandidate(node, context, container) {
    if (!shouldUseHybridDisplayName(node, context)) {
      return false;
    }

    if (!node || !hasChildren(node) || isButtonContainer(node) || isFieldContainer(node) || isImageLikeNode(node)) {
      return false;
    }

    const type = String(node.type || "");
    if (type !== "FRAME" && type !== "SECTION" && type !== "GROUP") {
      return false;
    }

    const bounds = getNodeBounds(node);
    if (!bounds || bounds.width < 160 || bounds.height < 80) {
      return false;
    }

    const childCount = Array.isArray(node.children) ? node.children.length : 0;
    if (childCount < 2) {
      return false;
    }

    if (container) {
      const parentBounds = getNodeBounds(container);
      const widthRatio = parentBounds && parentBounds.width > 0 ? bounds.width / parentBounds.width : 0;
      return type !== "GROUP" || widthRatio >= 0.35 || bounds.height >= 180;
    }

    return true;
  }

  function detectExplicitHybridDisplayLabel(node, textHint, sectionSlug, contentSlug, topicSlug, context) {
    const values = collectNodeSemanticValues(node, textHint, 4, 2);
    const corpus = values.join(" ").toLowerCase();

    const explicitProduct = findExplicitProductDisplayLabel(values);
    if (explicitProduct) {
      return explicitProduct;
    }

    if (/coupon|promo|discount/.test(corpus) && /(product|card|item)/.test(corpus)) {
      return "Coupon + Product Card";
    }

    if (/faq|q&a|questions|frequently asked/.test(corpus)) {
      return "FAQ";
    }

    if (/award|awards|trophy|prize|certified|certification/.test(corpus)) {
      return "Awards";
    }

    if (/archive|archiving|collection|library|history/.test(corpus)) {
      return "Archiving Page";
    }

    if ((/outro|closing|final|wrap up|thank you/.test(corpus) || sectionSlug === "footer") && looksLikeOutroSection(node, sectionSlug)) {
      return "Outro";
    }

    if (/intro|introduction|opening|overview|about/.test(corpus) && !looksLikeCompositeContentWrapper(node)) {
      return "Introduction";
    }

    if ((/hero|key visual|kv/.test(corpus) || sectionSlug === "hero") && (isImageLikeNode(node) || hasDominantVisualSection(node))) {
      return "Key Visual";
    }

    if (contentSlug === "message") {
      return "Inquiry";
    }

    if (context && context.contextSlug === "hero" && hasChildren(node) && inferGroupRole(node, contentSlug || topicSlug || "content") === "copy") {
      return "Introduction";
    }

    return "";
  }

  function findExplicitProductDisplayLabel(values) {
    const samples = Array.isArray(values) ? values : [];
    for (const sample of samples) {
      const normalized = compactText(sample);
      if (!normalized) {
        continue;
      }

      const match = normalized.match(/product\s*(\d+(?:-\d+)?)/i);
      if (match) {
        return `Product ${match[1]}`;
      }

      if (/^product$/i.test(normalized)) {
        return "Product";
      }
    }

    return "";
  }

  function buildHybridRoleLabel(value) {
    const slug = slugifyAsciiToken(value);
    if (!slug) {
      return "";
    }

    switch (slug) {
      case "hero":
        return "Key Visual";
      case "footer":
        return "Outro";
      case "navbar":
        return "Navigation";
      case "sidebar":
        return "Sidebar";
      case "feature":
        return "Feature";
      case "pricing":
        return "Pricing";
      case "modal":
        return "Dialog";
      case "dashboard":
        return "Metrics";
      case "message":
        return "Inquiry";
      case "email":
        return "Email";
      case "password":
        return "Password";
      case "search":
        return "Search";
      case "phone":
        return "Phone";
      case "name":
        return "Name";
      case "company":
        return "Company";
      case "address":
        return "Address";
      case "sign-in":
        return "Sign In";
      case "sign-up":
        return "Sign Up";
      case "contact":
        return "Contact";
      case "faq":
        return "FAQ";
      case "archive":
      case "archiving":
        return "Archiving";
      default:
        return humanizeHybridSegment(slug);
    }
  }

  function joinHybridDisplayParts() {
    const joined = [];
    for (let index = 0; index < arguments.length; index += 1) {
      const part = compactHybridDisplayText(arguments[index]);
      if (!part) {
        continue;
      }

      if (joined.length > 0 && canonicalizeName(joined[joined.length - 1]) === canonicalizeName(part)) {
        continue;
      }

      joined.push(part);
    }

    return joined.length ? joined.join(" ") : "Content";
  }

  function compactHybridDisplayText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/\s*\+\s*/g, " + ")
      .trim();
  }

  function getHybridDisplayOrdinal(node, context) {
    if (!shouldPrefixHybridDisplayOrdinal(node, context)) {
      return "";
    }

    const candidates = getMajorHybridSectionSiblings(node, context);
    if (candidates.length < 2) {
      return "";
    }

    const ordinalIndex = candidates.findIndex((candidate) => candidate && candidate.id === node.id);
    return formatRepeatIndex((ordinalIndex >= 0 ? ordinalIndex : candidates.length) + 1);
  }

  function shouldPrefixHybridDisplayOrdinal(node, context) {
    return isMajorHybridSection(node, context);
  }

  function isHybridOrdinalSibling(node, context) {
    return shouldUseHybridDisplayName(node, context) && shouldPrefixHybridDisplayOrdinal(node, context);
  }

  function buildImageNodeName(node, sectionSlug, contentSlug, topicSlug, context) {
    const imageRole = detectImageRole(node);
    const semanticSlug = topicSlug || contentSlug || sectionSlug || context.contextSlug || "content";

    if (resolveNamingMode(context.namingMode) === "hybrid") {
      if (imageRole === "avatar") {
        return "Avatar";
      }

      if (imageRole === "hero") {
        return "Hero Image";
      }

      if (imageRole === "thumbnail") {
        return "Thumbnail";
      }

      if (imageRole === "poster") {
        return "Poster";
      }

      if (imageRole === "illustration") {
        return "Illustration";
      }

      if (imageRole === "logo") {
        return "Logo";
      }

      return "Image";
    }

    if (imageRole === "avatar") {
      return buildStructuredName(context.namingMode, "image", "avatar", semanticSlug);
    }

    if (imageRole === "hero") {
      return buildStructuredName(context.namingMode, "image", "hero", semanticSlug);
    }

    return buildStructuredName(context.namingMode, "image", imageRole, semanticSlug);
  }

  function typePrefix(type) {
    switch (String(type || "").toUpperCase()) {
      case "FRAME":
      case "SECTION":
        return "section";
      case "GROUP":
        return "group";
      case "COMPONENT":
        return "component";
      case "COMPONENT_SET":
        return "component-set";
      case "INSTANCE":
        return "instance";
      case "TEXT":
        return "text";
      default:
        return "layer";
    }
  }

  function findActionLabel(node) {
    const texts = collectNodeTexts(node, 4, 2);
    for (const text of texts) {
      if (looksLikeButtonText(text)) {
        return compactText(text);
      }
    }

    return texts.length > 0 ? compactText(texts[0]) : "";
  }

  function findFieldLabel(node) {
    const texts = collectNodeTexts(node, 4, 2);
    for (const text of texts) {
      const fieldLabel = matchFieldLabel(text);
      if (fieldLabel) {
        return fieldLabel;
      }
    }

    return "";
  }

  function collectNodeTexts(node, limit, maxDepth) {
    const texts = [];
    const stack = [{ node, depth: 0 }];

    while (stack.length > 0 && texts.length < limit) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      if (current.node.type === "TEXT") {
        const text = getTextValue(current.node);
        if (text && !texts.includes(text)) {
          texts.push(text);
        }
      }

      if (current.depth >= maxDepth || !hasChildren(current.node)) {
        continue;
      }

      for (let index = current.node.children.length - 1; index >= 0; index -= 1) {
        stack.push({ node: current.node.children[index], depth: current.depth + 1 });
      }
    }

    return texts;
  }

  function collectProminentTexts(node, limit) {
    if (!node) {
      return [];
    }

    const entries = [];
    const stack = [{ node, depth: 0 }];
    while (stack.length > 0 && entries.length < Math.max(limit * 3, 6)) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      if (current.node.type === "TEXT") {
        const value = compactText(getTextValue(current.node));
        if (value) {
          entries.push({
            text: value,
            fontSize: typeof current.node.fontSize === "number" ? current.node.fontSize : 0,
          });
        }
      }

      if (current.depth >= 3 || !hasChildren(current.node)) {
        continue;
      }

      for (let index = current.node.children.length - 1; index >= 0; index -= 1) {
        stack.push({ node: current.node.children[index], depth: current.depth + 1 });
      }
    }

    return entries
      .sort((left, right) => right.fontSize - left.fontSize)
      .map((entry) => entry.text)
      .filter((value, index, array) => array.indexOf(value) === index)
      .slice(0, limit);
  }

  function collectActionTexts(node, limit) {
    return collectNodeTexts(node, 10, 3)
      .filter((text) => findActionSlugFromText(text) || looksLikeButtonText(text))
      .map((text) => compactText(text))
      .filter((value, index, array) => value && array.indexOf(value) === index)
      .slice(0, limit);
  }

  function buildNodeContentDigest(node, context) {
    const headings = collectProminentTexts(node, 2);
    const texts = collectNodeTexts(node, 6, 3)
      .map((text) => compactText(text))
      .filter(Boolean);
    const actions = collectActionTexts(node, 2);
    const sectionPosition = describeNodeSectionPosition(node, context);
    const summary = [];
    if (sectionPosition) {
      summary.push(sectionPosition);
    }
    if (headings.length) {
      summary.push(`Headings: ${headings.join(" / ")}`);
    }
    if (texts.length) {
      summary.push(`Texts: ${texts.slice(0, 3).join(" / ")}`);
    }
    if (actions.length) {
      summary.push(`Actions: ${actions.join(" / ")}`);
    }
    return summary.join(" | ");
  }

  function describeNodeSectionPosition(node, context) {
    const majorSections = getMajorHybridSectionSiblings(node, context);
    const index = majorSections.findIndex((entry) => entry && entry.id === (node && node.id));
    if (index < 0 || majorSections.length <= 1) {
      return "";
    }

    if (index === 0) {
      return `first of ${majorSections.length}`;
    }
    if (index === majorSections.length - 1) {
      return `last of ${majorSections.length}`;
    }
    return `${index + 1} of ${majorSections.length}`;
  }

  function buildSiblingContentContext(node, context) {
    const majorSections = getMajorHybridSectionSiblings(node, context);
    const index = majorSections.findIndex((entry) => entry && entry.id === (node && node.id));
    if (index < 0) {
      return "";
    }

    const prev = index > 0 ? majorSections[index - 1] : null;
    const next = index < majorSections.length - 1 ? majorSections[index + 1] : null;
    const parts = [];
    if (prev) {
      parts.push(`Prev: ${safeName(prev)} | ${collectNodeTexts(prev, 2, 2).join(" / ")}`);
    }
    if (next) {
      parts.push(`Next: ${safeName(next)} | ${collectNodeTexts(next, 2, 2).join(" / ")}`);
    }
    return parts.join(" || ");
  }

  function getPrimaryTextHint(node) {
    if (!node) {
      return "";
    }

    if (node.type === "TEXT") {
      return compactText(getTextValue(node));
    }

    const texts = collectNodeTexts(node, 2, 2);
    return texts.length > 0 ? compactText(texts[0]) : "";
  }

  function getTextValue(node) {
    return typeof node.characters === "string" ? node.characters.replace(/\s+/g, " ").trim() : "";
  }

  function compactText(text) {
    const normalized = String(text || "")
      .replace(/\s+/g, " ")
      .replace(/^[\s\-–—:;,.|/]+|[\s\-–—:;,.|/]+$/g, "")
      .trim();
    if (!normalized) {
      return "";
    }

    return normalized.length > 28 ? `${normalized.slice(0, 25)}...` : normalized;
  }

  function looksLikePriceText(text) {
    const normalized = compactText(text);
    if (!normalized) {
      return false;
    }

    return /\$\s*\d|\d[\d,.\s]*(?:원|krw|usd|eur)|(?:price|pricing|monthly|yearly|month|year)/i.test(normalized);
  }

  function looksLikeBadgeTextNode(node, text) {
    const normalized = compactText(text);
    if (!normalized || normalized.length > 18) {
      return false;
    }

    if (/(new|hot|sale|best|event|live|pro|beta|%\s*off)/i.test(normalized)) {
      return true;
    }

    const bounds = getNodeBounds(node);
    if (bounds && bounds.width <= 160 && bounds.height <= 48) {
      const colorHint = getNodeColorHint(node) || getNodeColorHint(node && node.parent);
      if (colorHint && colorHint !== "black" && colorHint !== "white" && colorHint !== "gray" && colorHint !== "silver") {
        return true;
      }
    }

    return /^[A-Z0-9\s+-]{2,18}$/.test(normalized);
  }

  function looksLikeButtonText(text) {
    const normalized = compactText(text).toLowerCase();
    return normalized.length > 0 && normalized.length <= 24 && BUTTON_TEXT_PATTERN.test(normalized);
  }

  function matchFieldLabel(text) {
    const normalized = compactFieldCandidateText(text);
    if (!normalized || !looksLikeFieldLabelText(normalized)) {
      return "";
    }

    return findBestToken([normalized], FIELD_KEYWORD_ENTRIES, "");
  }

  function compactFieldCandidateText(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .replace(/[“”"']/g, "")
      .trim();
  }

  function looksLikeFieldLabelText(text) {
    const normalized = compactFieldCandidateText(text);
    if (!normalized) {
      return false;
    }

    if (normalized.length > 40) {
      return false;
    }

    if (/[.!?]|:\s|\n/.test(normalized)) {
      return false;
    }

    const words = normalized.split(/\s+/).filter(Boolean);
    if (words.length > 4) {
      return false;
    }

    const lower = normalized.toLowerCase();
    if (/(smartphone|smartphones|laptops|reviewed everything|does it really feel different)/.test(lower)) {
      return false;
    }

    return true;
  }

  function findFieldSlugFromValues(values) {
    const items = Array.isArray(values) ? values : [];
    const candidates = [];

    for (const value of items) {
      const normalized = compactFieldCandidateText(value);
      if (!looksLikeFieldLabelText(normalized)) {
        continue;
      }
      candidates.push(normalized);
    }

    return findBestToken(candidates, FIELD_KEYWORD_ENTRIES, "");
  }

  function findActionSlug(node) {
    const texts = collectNodeTexts(node, 4, 2);
    return findBestToken(texts, ACTION_TOKEN_ENTRIES, "") || slugifyAsciiToken(findActionLabel(node));
  }

  function findActionSlugFromText(text) {
    return findBestToken([text], ACTION_TOKEN_ENTRIES, "");
  }

  function deriveContextSlug(contextLabel) {
    const normalized = String(contextLabel || "");
    const normalizedLower = normalized.toLowerCase();
    if (/login|sign in|sign up|form|auth|password|email/.test(normalizedLower)) {
      return "form";
    }

    if (/dashboard|analytics|report|metric|table|chart|data/.test(normalizedLower)) {
      return "dashboard";
    }

    if (/hero|landing|promo|banner|marketing|campaign/.test(normalizedLower)) {
      return "hero";
    }

    if (/modal|dialog|confirm|alert/.test(normalizedLower)) {
      return "modal";
    }

    if (/nav|menu|navigation|header/.test(normalizedLower)) {
      return "navbar";
    }

    if (/component|library|design system/.test(normalizedLower)) {
      return "component";
    }
    if (normalized.includes("인증") || normalized.includes("폼")) {
      return "form";
    }

    if (normalized.includes("대시보드") || normalized.includes("데이터")) {
      return "dashboard";
    }

    if (normalized.includes("랜딩") || normalized.includes("프로모션")) {
      return "hero";
    }

    if (normalized.includes("모달") || normalized.includes("다이얼로그")) {
      return "modal";
    }

    if (normalized.includes("내비게이션")) {
      return "navbar";
    }

    if (normalized.includes("컴포넌트")) {
      return "component";
    }

    return "content";
  }

  function detectSectionSlug(node, context) {
    const values = [];
    appendSemanticNameValue(values, node);
    const parent = node && node.parent;
    if (parent) {
      appendSemanticNameValue(values, parent);
    }

    values.push(...collectNodeTexts(node, 3, 2));
    const sectionSlug = findBestToken(values, SECTION_TOKEN_ENTRIES, "");
    if (sectionSlug === "pricing" && !looksLikePricingValueSet(values)) {
      return context.contextSlug || context.topicSlug || "content";
    }
    return sectionSlug || context.contextSlug || context.topicSlug || "content";
  }

  function resolveContentSlug(node, preferredText, context) {
    const values = collectNodeSemanticValues(node, preferredText, 3, 1);
    const actionSlug = findBestToken(values, ACTION_TOKEN_ENTRIES, "");
    if (actionSlug) {
      return actionSlug;
    }

    const contentRoleSlug = findBestToken(values, CONTENT_ROLE_TOKEN_ENTRIES, "");
    if (contentRoleSlug) {
      return contentRoleSlug;
    }

    const fieldSlug = findFieldSlugFromValues(values);
    if (fieldSlug) {
      return fieldSlug;
    }

    const topicSlug = findBestToken(values, TOPIC_TOKEN_ENTRIES, "");
    if (topicSlug) {
      return topicSlug;
    }

    for (const value of values) {
      const slug = slugifyAsciiToken(value);
      if (slug && !GENERIC_TOKEN_SET.has(slug)) {
        return slug;
      }
    }

    return context && context.topicSlug ? context.topicSlug : "";
  }

  function collectNodeSemanticValues(node, preferredText, textLimit, textDepth) {
    const values = [];
    if (preferredText) {
      values.push(preferredText);
    }

    appendSemanticNameValue(values, node);
    if (node && node.parent) {
      appendSemanticNameValue(values, node.parent);
    }

    values.push(...collectNodeTexts(node, textLimit, textDepth));
    return values;
  }

  function appendSemanticNameValue(values, node) {
    const name = safeName(node);
    if (!name || isDocumentStyleName(name)) {
      return;
    }

    values.push(name);
  }

  function isDocumentStyleName(name) {
    const normalized = String(name || "").trim();
    if (!normalized) {
      return true;
    }

    if (normalized.length >= 24 && /[_]/.test(normalized)) {
      return true;
    }

    if (/[A-Z]{3,}/.test(normalized) && /\d/.test(normalized)) {
      return true;
    }

    if (/ver\s*\d|v\d|\d{6,}/i.test(normalized)) {
      return true;
    }

    return /^[A-Za-z0-9_.-]+$/.test(normalized) && normalized.split(/[_-]/).length >= 4;
  }

  function looksLikePricingValueSet(values) {
    const corpus = (Array.isArray(values) ? values : [])
      .filter((value) => typeof value === "string" && value.trim())
      .join(" ")
      .toLowerCase();
    if (!corpus) {
      return false;
    }

    const explicitCount = [
      "pricing",
      "price",
      "prices",
      "plan",
      "plans",
      "billing",
      "subscription",
      "subscribe",
      "cost",
      "fee",
      "$",
      "usd",
      "krw",
      "￦",
      "원",
      "요금",
      "가격",
      "플랜",
    ].filter((token) => corpus.includes(token)).length;
    return explicitCount >= 2 || /\$\s*\d|￦\s*\d|\d+\s*(usd|krw|원)/i.test(corpus);
  }

  function detectTopicSlug(node, context, preferredText) {
    const values = collectNodeSemanticValues(node, preferredText, 4, 2);
    const localTopic = findBestToken(values, TOPIC_TOKEN_ENTRIES, "");
    if (localTopic) {
      return localTopic;
    }

    return context && context.topicSlug ? context.topicSlug : "";
  }

  function detectTextRole(node, text) {
    const fontSize = typeof node.fontSize === "number" ? node.fontSize : 0;
    const normalized = compactText(text);
    if (fontSize >= 28) {
      return "heading";
    }

    if (fontSize >= 18) {
      return "title";
    }

    if (fontSize > 0 && fontSize <= 11) {
      return "meta";
    }

    if (normalized.length <= 28) {
      return "label";
    }

    return "body";
  }

  function inferGroupRole(node, contentSlug) {
    const childNodes = Array.isArray(node.children) ? node.children.filter(Boolean) : [];
    const buttonCount = childNodes.filter((child) => isButtonContainer(child)).length;
    const textCount = childNodes.filter((child) => child.type === "TEXT").length;
    const iconCount = childNodes.filter((child) => isIconLikeNode(child)).length;
    const cardCount = childNodes.filter((child) => isCardLikeNode(child)).length;

    if (buttonCount >= 2) {
      return "actions";
    }

    if (cardCount >= 2) {
      return "list";
    }

    if (textCount >= 2 && iconCount === 0) {
      return "copy";
    }

    if (iconCount >= 1 && textCount >= 1) {
      return "item";
    }

    if (iconCount >= 1 && textCount === 0) {
      return "media";
    }

    return contentSlug || "content";
  }

  function detectButtonVariant(node) {
    const hasSolidFill = hasVisibleSolidFill(node);
    const hasStroke = hasVisibleStroke(node);
    if (hasSolidFill) {
      return "primary";
    }

    if (hasStroke) {
      return "secondary";
    }

    return "ghost";
  }

  function buildStructuredName(mode, ...segments) {
    return resolveNamingMode(mode) === "hybrid" ? buildHybridName(...segments) : buildWebName(...segments);
  }

  function buildStructuredNameFromSegments(mode, segments) {
    const values = Array.isArray(segments) ? segments : [];
    return buildStructuredName(mode, values[0], values[1], values[2], values[3], values[4], values[5]);
  }

  function buildWebName(...segments) {
    const normalized = [];
    for (const segment of segments) {
      const slug = slugifyAsciiToken(segment);
      if (!slug) {
        continue;
      }

      if (normalized[normalized.length - 1] === slug) {
        continue;
      }

      normalized.push(slug);
    }

    if (!normalized.length) {
      return "layer.item";
    }

    return normalized.join(".");
  }

  function buildHybridName(...segments) {
    const normalized = [];
    for (const segment of segments) {
      const value = humanizeHybridSegment(segment);
      if (!value) {
        continue;
      }

      if (canonicalizeName(normalized[normalized.length - 1]) === canonicalizeName(value)) {
        continue;
      }

      normalized.push(value);
    }

    if (!normalized.length) {
      return "Layer/Item";
    }

    return normalized.join("/");
  }

  function formatRepeatIndex(index) {
    const numeric = Number(index);
    if (!(numeric > 0)) {
      return "01";
    }

    return String(Math.round(numeric)).padStart(2, "0");
  }

  function appendHumanIndexSuffix(label, index) {
    const trimmed = String(label || "").trim();
    if (!trimmed) {
      return "";
    }

    const suffix = formatRepeatIndex(index);
    if (new RegExp("(?:^|\\s)" + suffix + "$").test(trimmed)) {
      return trimmed;
    }

    return `${trimmed} ${suffix}`;
  }

  function appendStructuredOrdinal(name, index) {
    const trimmed = String(name || "").trim();
    if (!trimmed) {
      return "";
    }

    const suffix = formatRepeatIndex(index);
    if (isWebCompatibleStructuredName(trimmed)) {
      return `${trimmed}.${suffix}`;
    }

    return `${trimmed} ${suffix}`;
  }

  function endsWithDisplaySuffix(label, suffix) {
    const left = slugifyAsciiToken(label);
    const right = slugifyAsciiToken(suffix);
    if (!left || !right) {
      return false;
    }

    return left === right || left.endsWith("-" + right);
  }

  function humanizeHybridSegment(value) {
    const slug = slugifyAsciiToken(value);
    if (!slug) {
      return "";
    }

    return slug
      .split("-")
      .filter(Boolean)
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(" ");
  }

  function findBestToken(values, entries, fallback) {
    const corpus = values
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .join(" ")
      .toLowerCase();
    if (!corpus) {
      return fallback;
    }

    let bestSlug = fallback;
    let bestScore = 0;
    for (const [slug, keywords] of entries) {
      let score = 0;
      for (const keyword of keywords) {
        if (corpus.includes(String(keyword).toLowerCase())) {
          score += 1;
        }
      }

      if (score > bestScore) {
        bestSlug = slug;
        bestScore = score;
      }
    }

    return bestScore > 0 ? bestSlug : fallback;
  }

  function slugifyAsciiToken(value) {
    const normalized = compactText(value)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return normalized;
  }

  function isWebCompatibleStructuredName(name) {
    const normalized = String(name || "").trim();
    return /^[a-z][a-z0-9-]*(?:\.[a-z0-9-]+)+$/.test(normalized);
  }

  function isHybridStructuredName(name) {
    const normalized = String(name || "").trim();
    return (
      /^[A-Z][A-Za-z0-9]*(?:[ -][A-Za-z0-9]+)*(?:\/[A-Z][A-Za-z0-9]*(?:[ -][A-Za-z0-9]+)*)+$/.test(normalized) ||
      /^(?:\d{2}_)?[A-Z][A-Za-z0-9]*(?: (?:\+ )?[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)*$/.test(normalized)
    );
  }

  function isWeakHybridDisplayName(name) {
    const normalized = String(name || "").trim();
    if (!normalized) {
      return true;
    }

    const label = normalized.replace(/^\d{2}_/, "").trim();
    const slug = slugifyAsciiToken(label);
    if (!slug) {
      return true;
    }

    if (GENERIC_TOKEN_SET.has(slug)) {
      return true;
    }

    if (TOPIC_TOKEN_ENTRIES.some((entry) => entry && entry[0] === slug)) {
      return true;
    }

    return (
      slug === "section" ||
      slug === "content-section" ||
      slug === "visual-section" ||
      slug === "content" ||
      slug === "group" ||
      slug === "container" ||
      slug === "item" ||
      slug === "list" ||
      slug === "media"
    );
  }

  function hasRedundantHybridParentLabel(name, parentName) {
    const childSlug = slugifyAsciiToken(String(name || "").replace(/^\d{2}_/, "").trim());
    const parentSlug = slugifyAsciiToken(String(parentName || "").replace(/^\d{2}_/, "").trim());
    return !!childSlug && !!parentSlug && childSlug === parentSlug;
  }

  function isStructuredNameForMode(name, mode) {
    return resolveNamingMode(mode) === "hybrid" ? isHybridStructuredName(name) : isWebCompatibleStructuredName(name);
  }

  function hasVisibleSolidFill(node) {
    return !!node && Array.isArray(node.fills) && node.fills.some((paint) => paint && paint.visible !== false && paint.type === "SOLID");
  }

  function hasVisibleStroke(node) {
    return !!node && Array.isArray(node.strokes) && node.strokes.some((paint) => paint && paint.visible !== false);
  }

  function hasImageFill(node) {
    return !!node && Array.isArray(node.fills) && node.fills.some((paint) => paint && paint.visible !== false && paint.type === "IMAGE");
  }

  function isImageLikeNode(node) {
    if (!node || node.locked === true || node.visible === false) {
      return false;
    }

    const bounds = getNodeBounds(node);
    if (!bounds || bounds.width < 24 || bounds.height < 24) {
      return false;
    }

    if (hasChildren(node) && node.children.length > 3) {
      return false;
    }

    if (hasChildren(node) && collectNodeTexts(node, 1, 2).length > 0) {
      return false;
    }

    if (hasImageFill(node)) {
      return true;
    }

    return IMAGE_NAME_PATTERN.test(safeName(node));
  }

  function detectImageRole(node) {
    const values = collectNodeSemanticValues(node, "", 2, 1);
    const matched = findBestToken(values, IMAGE_ROLE_TOKEN_ENTRIES, "");
    if (matched) {
      return matched;
    }

    const bounds = getNodeBounds(node);
    if (bounds && bounds.width <= 96 && bounds.height <= 96) {
      return "avatar";
    }

    if (bounds && bounds.width >= 240 && bounds.height >= 120) {
      return "hero";
    }

    return "photo";
  }

  function getNodeColorHint(node) {
    const solidFill = getFirstVisibleSolidPaint(node && node.fills);
    if (solidFill) {
      return describeRgbColor(solidFill.color);
    }

    const solidStroke = getFirstVisibleSolidPaint(node && node.strokes);
    return solidStroke ? describeRgbColor(solidStroke.color) : "";
  }

  function getFirstVisibleSolidPaint(paints) {
    if (!Array.isArray(paints)) {
      return null;
    }

    for (const paint of paints) {
      if (!paint || paint.visible === false || paint.type !== "SOLID" || !paint.color) {
        continue;
      }

      return paint;
    }

    return null;
  }

  function describeHexColor(hex) {
    const color = parseHexColor(hex);
    return color ? describeRgbColor(color) : "";
  }

  function parseHexColor(hex) {
    const normalized = String(hex || "").trim().replace(/^#/, "");
    if (!/^[0-9a-f]{6}$/i.test(normalized)) {
      return null;
    }

    return {
      r: parseInt(normalized.slice(0, 2), 16) / 255,
      g: parseInt(normalized.slice(2, 4), 16) / 255,
      b: parseInt(normalized.slice(4, 6), 16) / 255,
    };
  }

  function describeRgbColor(color) {
    if (!color || typeof color.r !== "number" || typeof color.g !== "number" || typeof color.b !== "number") {
      return "";
    }

    const red = clamp01(color.r);
    const green = clamp01(color.g);
    const blue = clamp01(color.b);
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    const lightness = (max + min) / 2;

    if (lightness <= 0.08) {
      return "black";
    }

    if (lightness >= 0.94 && delta < 0.04) {
      return "white";
    }

    if (delta < 0.08) {
      if (lightness < 0.3) {
        return "charcoal";
      }
      if (lightness > 0.75) {
        return "silver";
      }
      return "gray";
    }

    const hue = getHueDegrees(red, green, blue, max, delta);
    if (hue < 15 || hue >= 345) {
      return "red";
    }
    if (hue < 45) {
      return "orange";
    }
    if (hue < 70) {
      return "yellow";
    }
    if (hue < 160) {
      return "green";
    }
    if (hue < 200) {
      return "teal";
    }
    if (hue < 255) {
      return "blue";
    }
    if (hue < 305) {
      return "purple";
    }
    return "pink";
  }

  function getHueDegrees(red, green, blue, max, delta) {
    if (delta <= 0) {
      return 0;
    }

    let hue = 0;
    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }

    hue *= 60;
    return hue < 0 ? hue + 360 : hue;
  }

  function clamp01(value) {
    if (value < 0) {
      return 0;
    }
    if (value > 1) {
      return 1;
    }
    return value;
  }

  function isButtonSemanticNode(node) {
    if (!node) {
      return false;
    }

    if (isButtonContainer(node)) {
      return true;
    }

    if (node.type === "TEXT") {
      return looksLikeButtonText(getTextValue(node));
    }

    return false;
  }

  function isFieldSemanticNode(node) {
    if (!node) {
      return false;
    }

    if (isFieldContainer(node)) {
      return true;
    }

    if (node.type === "TEXT") {
      return !!matchFieldLabel(getTextValue(node));
    }

    return false;
  }

  function isButtonContainer(node) {
    if (!node || !hasChildren(node)) {
      return false;
    }

    const name = safeName(node).toLowerCase();
    if (/button|btn|cta|chip|tab|badge|버튼|탭|칩/.test(name)) {
      return true;
    }

    const texts = collectNodeTexts(node, 3, 2);
    const bounds = getNodeBounds(node);
    return (
      !!bounds &&
      bounds.height <= 88 &&
      texts.some((text) => looksLikeButtonText(text))
    );
  }

  function isFieldContainer(node) {
    if (!node || !hasChildren(node)) {
      return false;
    }

    const bounds = getNodeBounds(node);
    if (!bounds || bounds.width < 120 || bounds.height < 32 || bounds.height > 160) {
      return false;
    }

    const texts = collectNodeTexts(node, 4, 2);
    const shortFieldTexts = texts.filter((text) => !!matchFieldLabel(text));
    if (!shortFieldTexts.length) {
      return false;
    }

    return texts.length <= 3;
  }

  function isCardLikeNode(node) {
    const bounds = getNodeBounds(node);
    if (!bounds || !hasChildren(node)) {
      return false;
    }

    return bounds.width >= 120 && bounds.width <= 480 && bounds.height >= 72 && bounds.height <= 360;
  }

  function isSectionRootLike(node) {
    const type = String(node.type || "");
    return type === "FRAME" || type === "SECTION";
  }

  function findIconLabelPairs(children, usedNodeIds) {
    const pairs = [];
    const used = new Set(usedNodeIds);
    const labels = children
      .filter((node) => isLabelTextNode(node) && !used.has(node.id))
      .sort((left, right) => compareBounds(left, right));
    const icons = children.filter((node) => isIconLikeNode(node) && !used.has(node.id));

    for (const label of labels) {
      const labelBounds = getNodeBounds(label);
      if (!labelBounds) {
        continue;
      }

      let bestIcon = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const icon of icons) {
        if (used.has(icon.id)) {
          continue;
        }

        const iconBounds = getNodeBounds(icon);
        if (!iconBounds) {
          continue;
        }

        const gap = labelBounds.x - (iconBounds.x + iconBounds.width);
        const centerDelta = Math.abs(centerY(labelBounds) - centerY(iconBounds));
        if (gap < -2 || gap > 28 || centerDelta > 12) {
          continue;
        }

        const distance = gap + centerDelta;
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIcon = icon;
        }
      }

      if (!bestIcon) {
        continue;
      }

      used.add(label.id);
      used.add(bestIcon.id);
      pairs.push({
        icon: bestIcon,
        label,
      });
    }

    return pairs;
  }

  function findTextBlockSuggestions(children, usedNodeIds, context) {
    const suggestions = [];
    const texts = children
      .filter((node) => node.type === "TEXT" && !usedNodeIds.has(node.id) && node.locked !== true && node.visible !== false)
      .sort((left, right) => compareBounds(left, right));

    for (let index = 0; index < texts.length - 1; index += 1) {
      const title = texts[index];
      const body = texts[index + 1];
      const titleBounds = getNodeBounds(title);
      const bodyBounds = getNodeBounds(body);
      if (!titleBounds || !bodyBounds) {
        continue;
      }

      const leftDelta = Math.abs(titleBounds.x - bodyBounds.x);
      const verticalGap = bodyBounds.y - (titleBounds.y + titleBounds.height);
      const titleSize = typeof title.fontSize === "number" ? title.fontSize : 0;
      const bodySize = typeof body.fontSize === "number" ? body.fontSize : 0;

      if (leftDelta > 12 || verticalGap < 0 || verticalGap > 24 || titleSize <= bodySize) {
        continue;
      }

      suggestions.push({
        name: buildSuggestedTextBlockName(null, title, body, context),
        parentName: safeName(title.parent),
        nodes: [
          { id: title.id, name: safeName(title) },
          { id: body.id, name: safeName(body) },
        ],
        reason: "제목과 설명이 세로로 이어진 조합입니다.",
      });
    }

    return suggestions;
  }

  function buildGroupName(groupNode, labelNode, context) {
    const label = getPrimaryTextHint(labelNode || groupNode);
    const sourceNode = labelNode || groupNode;
    const itemSlug = resolveContentSlug(sourceNode, label, context) || context.topicSlug || "item";
    const sectionSlug = detectSectionSlug(sourceNode, context);
    if (context.contextSlug === "navbar" || sectionSlug === "navbar") {
      return buildStructuredName(context.namingMode, "group", "navbar", "item", itemSlug);
    }

    return buildStructuredName(context.namingMode, "group", sectionSlug || context.contextSlug || "content", "item", itemSlug);
  }

  function buildSuggestedTextBlockName(groupNode, titleNode, bodyNode, context) {
    const primaryNode = titleNode || groupNode;
    const secondaryNode = bodyNode || groupNode;
    const titleLabel = getPrimaryTextHint(primaryNode);
    const bodyLabel = getPrimaryTextHint(secondaryNode);
    const itemSlug =
      resolveContentSlug(primaryNode, titleLabel, context) ||
      resolveContentSlug(secondaryNode, bodyLabel, context) ||
      context.topicSlug ||
      "copy";
    const sectionSlug = detectSectionSlug(primaryNode, context);
    return buildStructuredName(context.namingMode, "group", sectionSlug || context.contextSlug || "content", "copy", itemSlug);
  }

  function applySiblingClusterNaming(candidates) {
    if (!Array.isArray(candidates) || candidates.length < 2) {
      return;
    }

    const clusters = new Map();
    for (const candidate of candidates) {
      if (!candidate || !candidate.repeatRole || !candidate.repeatRole.familyKey) {
        continue;
      }

      const key = candidate.repeatRole.familyKey;
      const bucket = clusters.get(key) || [];
      bucket.push(candidate);
      clusters.set(key, bucket);
    }

    for (const bucket of clusters.values()) {
      if (!bucket || bucket.length < 2) {
        continue;
      }

      bucket.sort((left, right) => compareStoredBounds(left.bounds, right.bounds));
      const titleMap = collectClusterTitleMap(bucket);
      const useDistinctTitles =
        titleMap && titleMap.useDistinctTitles === true && !(bucket[0] && bucket[0].repeatRole && bucket[0].repeatRole.preferIndex === true);
      for (let index = 0; index < bucket.length; index += 1) {
        const candidate = bucket[index];
        if (!candidate) {
          continue;
        }

        const titleInfo = useDistinctTitles ? titleMap.byNodeId.get(candidate.nodeId) : null;
        const nextBaseName = titleInfo ? buildClusterTitleDrivenName(candidate, titleInfo) : buildClusterIndexedName(candidate, index + 1);
        if (!nextBaseName) {
          continue;
        }

        candidate.baseName = nextBaseName;
        candidate.repeatIndex = index + 1;
        candidate.repeatCount = bucket.length;
      }
    }
  }

  function collectClusterTitleMap(bucket) {
    const byNodeId = new Map();
    const usedSlugs = new Set();
    for (const candidate of bucket) {
      const titleInfo = extractClusterTitleInfo(candidate);
      if (!titleInfo || usedSlugs.has(titleInfo.slug)) {
        return {
          useDistinctTitles: false,
          byNodeId: new Map(),
        };
      }

      usedSlugs.add(titleInfo.slug);
      byNodeId.set(candidate.nodeId, titleInfo);
    }

    return {
      useDistinctTitles: byNodeId.size >= 2 && byNodeId.size === bucket.length,
      byNodeId: byNodeId,
    };
  }

  function extractClusterTitleInfo(candidate) {
    if (!candidate) {
      return null;
    }

    const samples = [];
    appendCandidateTitleSamples(samples, candidate.headingTexts, 2);
    appendCandidateTitleSamples(samples, [candidate.textHint], 1);
    appendCandidateTitleSamples(samples, candidate.textSamples, 2);
    appendCandidateTitleSamples(samples, candidate.deepTextSamples, 4);
    for (const sample of samples) {
      const titleInfo = normalizeClusterTitleInfo(sample, candidate.repeatRole);
      if (titleInfo) {
        return titleInfo;
      }
    }

    return null;
  }

  function appendCandidateTitleSamples(target, values, limit) {
    if (!Array.isArray(target) || !Array.isArray(values)) {
      return;
    }

    let count = 0;
    for (const value of values) {
      if (!(count < limit)) {
        break;
      }

      const normalized = compactText(value);
      if (!normalized || target.includes(normalized)) {
        continue;
      }

      target.push(normalized);
      count += 1;
    }
  }

  function normalizeClusterTitleInfo(value, repeatRole) {
    const normalized = compactText(value);
    if (!normalized || normalized.length < 2 || normalized.length > 32) {
      return null;
    }

    if (looksLikeButtonText(normalized) || matchFieldLabel(normalized)) {
      return null;
    }

    const slug = slugifyAsciiToken(normalized);
    if (!slug) {
      return null;
    }

    const tokenCount = slug.split("-").filter(Boolean).length;
    if (tokenCount <= 0 || tokenCount > 4) {
      return null;
    }

    if (isGenericClusterTitleSlug(slug, repeatRole)) {
      return null;
    }

    return {
      slug: slug,
      label: humanizeHybridSegment(slug),
    };
  }

  function isGenericClusterTitleSlug(slug, repeatRole) {
    if (!slug || GENERIC_TOKEN_SET.has(slug)) {
      return true;
    }

    if (
      slug === "faq" ||
      slug === "menu" ||
      slug === "product" ||
      slug === "pricing" ||
      slug === "plan" ||
      slug === "feature" ||
      slug === "card" ||
      slug === "item" ||
      slug === "metric"
    ) {
      return true;
    }

    if (repeatRole) {
      const familySlug = slugifyAsciiToken(repeatRole.familyKey);
      const labelSlug = slugifyAsciiToken(repeatRole.hybridLabel);
      const suffixSlug = slugifyAsciiToken(repeatRole.hybridSuffix);
      if (slug === labelSlug || slug === suffixSlug) {
        return true;
      }

      if (familySlug && (familySlug === slug || familySlug.split("-").indexOf(slug) >= 0)) {
        return true;
      }
    }

    return false;
  }

  function buildClusterTitleDrivenName(candidate, titleInfo) {
    if (!candidate || !candidate.repeatRole || !titleInfo) {
      return "";
    }

    if (candidate.nameMode === "display") {
      let label = titleInfo.label;
      const suffix = candidate.repeatRole.hybridSuffix;
      if (suffix && !endsWithDisplaySuffix(label, suffix)) {
        label = joinHybridDisplayParts(label, suffix);
      }
      return label;
    }

    const segments = Array.isArray(candidate.repeatRole.webSegments) ? candidate.repeatRole.webSegments.slice(0, 6) : [];
    segments.push(titleInfo.slug);
    return buildStructuredNameFromSegments(candidate.namingMode, segments);
  }

  function buildClusterIndexedName(candidate, index) {
    if (!candidate) {
      return "";
    }

    if (candidate.nameMode === "display") {
      const baseLabel =
        candidate.repeatRole && candidate.repeatRole.hybridLabel ? candidate.repeatRole.hybridLabel : candidate.baseName;
      return appendHumanIndexSuffix(baseLabel, index);
    }

    if (candidate.repeatRole && Array.isArray(candidate.repeatRole.webSegments) && candidate.repeatRole.webSegments.length > 0) {
      const segments = candidate.repeatRole.webSegments.slice(0, 6);
      segments.push(formatRepeatIndex(index));
      return buildStructuredNameFromSegments(candidate.namingMode, segments);
    }

    return appendStructuredOrdinal(candidate.baseName, index);
  }

  function isLabelTextNode(node) {
    const text = getTextValue(node);
    if (node.type !== "TEXT" || !text || text.length > 28) {
      return false;
    }

    const bounds = getNodeBounds(node);
    return !!bounds && bounds.width <= 280;
  }

  function isIconLikeNode(node) {
    if (!node || node.locked === true || node.visible === false) {
      return false;
    }

    const bounds = getNodeBounds(node);
    if (!bounds || bounds.width > 40 || bounds.height > 40) {
      return false;
    }

    const type = String(node.type || "");
    if (VECTOR_TYPES.has(type)) {
      return true;
    }

    if (!hasChildren(node)) {
      return false;
    }

    const texts = collectNodeTexts(node, 1, 1);
    if (texts.length > 0) {
      return false;
    }

    let descCount = 0;
    const stack = [...node.children];
    while (stack.length > 0 && descCount <= 3) {
      const child = stack.pop();
      if (!child) {
        continue;
      }

      descCount += 1;
      if (VECTOR_TYPES.has(String(child.type || ""))) {
        return true;
      }

      if (hasChildren(child)) {
        for (let index = child.children.length - 1; index >= 0; index -= 1) {
          stack.push(child.children[index]);
        }
      }
    }

    return false;
  }

  function compareBounds(leftNode, rightNode) {
    const left = getNodeBounds(leftNode);
    const right = getNodeBounds(rightNode);
    return compareStoredBounds(left, right);
  }

  function compareStoredBounds(left, right) {
    if (!left || !right) {
      return 0;
    }

    if (Math.abs(left.y - right.y) > 4) {
      return left.y - right.y;
    }

    return left.x - right.x;
  }

  function centerY(bounds) {
    return bounds.y + bounds.height / 2;
  }

  function ensureUniqueName(baseName, usedNames) {
    const trimmed = String(baseName || "").trim();
    if (!trimmed) {
      return "";
    }

    let candidate = trimmed;
    let index = 2;
    const structured = isWebCompatibleStructuredName(trimmed);
    const hybridStructured = isHybridStructuredName(trimmed);
    while (usedNames.has(canonicalizeName(candidate))) {
      const suffix = formatRepeatIndex(index);
      candidate = structured ? `${trimmed}-${suffix}` : hybridStructured ? `${trimmed} ${suffix}` : `${trimmed} ${suffix}`;
      index += 1;
    }

    return candidate;
  }

  function collectSiblingNameSet(parent, skipNode) {
    const usedNames = new Set();
    if (!parent || !Array.isArray(parent.children)) {
      return usedNames;
    }

    for (const child of parent.children) {
      if (!child || child === skipNode) {
        continue;
      }

      usedNames.add(canonicalizeName(safeName(child)));
    }

    return usedNames;
  }

  function countSiblingNames(parent) {
    const counts = new Map();
    if (!parent || !Array.isArray(parent.children)) {
      return counts;
    }

    for (const child of parent.children) {
      if (!child) {
        continue;
      }

      const key = canonicalizeName(safeName(child));
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return counts;
  }

  function getParentKey(parent) {
    return parent && typeof parent.id === "string" ? parent.id : `parent:${safeName(parent)}`;
  }

  function getSelectionSignature(selection) {
    const ids = Array.from(selection || [])
      .map((node) => node.id)
      .sort();
    return `${figma.currentPage.id}:${ids.join(",")}`;
  }

  function getNodeBounds(node) {
    if (node && node.absoluteBoundingBox) {
      return node.absoluteBoundingBox;
    }

    if (node && node.absoluteRenderBounds) {
      return node.absoluteRenderBounds;
    }

    if (
      node &&
      typeof node.x === "number" &&
      typeof node.y === "number" &&
      typeof node.width === "number" &&
      typeof node.height === "number"
    ) {
      return {
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
      };
    }

    return null;
  }

  function snapshotNodeBounds(node) {
    const bounds = getNodeBounds(node);
    if (!bounds) {
      return null;
    }

    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };
  }

  function getNodeByIdSafe(nodeId) {
    if (typeof nodeId !== "string" || !nodeId) {
      return null;
    }

    try {
      return typeof figma.getNodeById === "function" ? figma.getNodeById(nodeId) : null;
    } catch (error) {
      return null;
    }
  }

  function resolveNodeListByIds(nodeIds) {
    const values = Array.isArray(nodeIds) ? nodeIds : [];
    const nodes = [];
    for (const nodeId of values) {
      const node = getNodeByIdSafe(nodeId);
      if (node) {
        nodes.push(node);
      }
    }

    return nodes;
  }

  function getContextSelectedRoots(context) {
    if (!context) {
      return [];
    }

    return resolveNodeListByIds(context.selectedRootIds);
  }

  function findLargestSelectedRoot(selection) {
    const roots = Array.from(selection || []).filter(Boolean);
    if (!roots.length) {
      return null;
    }

    let bestNode = roots[0];
    let bestArea = getNodeArea(bestNode);
    for (let index = 1; index < roots.length; index += 1) {
      const node = roots[index];
      const area = getNodeArea(node);
      if (area > bestArea) {
        bestNode = node;
        bestArea = area;
      }
    }

    return bestNode;
  }

  function getNodeArea(node) {
    const bounds = getNodeBounds(node);
    if (!bounds) {
      return 0;
    }

    const width = typeof bounds.width === "number" ? Math.max(0, bounds.width) : 0;
    const height = typeof bounds.height === "number" ? Math.max(0, bounds.height) : 0;
    return width * height;
  }

  function formatSelectionLabel(roots) {
    if (!roots.length) {
      return "선택 없음";
    }

    if (roots.length === 1) {
      return roots[0].name;
    }

    return `${roots[0].name} 외 ${roots.length - 1}개`;
  }

  function safeName(node) {
    if (node && typeof node.name === "string" && node.name.trim().length > 0) {
      return node.name.trim();
    }

    return String((node && node.type) || "Unnamed");
  }

  function canonicalizeName(name) {
    return String(name || "").trim().toLowerCase();
  }

  function hasChildren(node) {
    return !!node && Array.isArray(node.children);
  }

  function isInsideInstance(node) {
    let current = node && node.parent;
    while (current) {
      if (String(current.type || "") === "INSTANCE") {
        return true;
      }

      current = current.parent;
    }

    return false;
  }

  function isSuspiciousName(name, type) {
    if (!name) {
      return true;
    }

    const normalized = String(name).trim();
    if (!normalized) {
      return true;
    }

    if (normalized.toUpperCase() === String(type || "").toUpperCase()) {
      return true;
    }

    return AUTO_NAME_PATTERNS.some((pattern) => pattern.test(normalized));
  }

  function normalizeErrorMessage(error, fallback) {
    if (error instanceof Error && typeof error.message === "string" && error.message.trim().length > 0) {
      return error.message.trim();
    }

    return fallback;
  }

  function getAiHelper() {
    const helper = globalScope.__PIGMA_AI_LLM__;
    return helper && typeof helper.requestJsonTask === "function" && typeof helper.hasConfiguredAiAsync === "function"
      ? helper
      : null;
  }
})();
