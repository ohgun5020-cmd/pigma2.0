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
        "You improve Figma layer names for design handoff. Return Korean reasons, but every suggestedName must be ASCII slash notation in readable Title Case like Button/Primary/Sign In, Text/Hero/Title, Group/Navbar/Item/Profile. Use only letters, numbers, spaces, hyphens, and slashes. Do not use Korean, dots, or underscores in suggestedName. Reflect a clear topic when supported by text or metadata, for example Soccer, Sports, Finance, Food, Travel, Beauty, or Education. For image layers, prefer semantic roles like Hero, Banner, Thumbnail, Avatar, Photo, Poster, Cover, or Illustration when supported by the hints. Only include a color token when it clearly disambiguates a badge, chip, pill, or status-like visual; do not add colors to every layer. Do not invent a topic or color that is not supported by the payload. If uncertain, keep the provided localName.",
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
      const result = await applyRegroupRename(designReadResult, { namingMode });
      await writeRegroupRenameCache(result);

      figma.ui.postMessage({
        type: "ai-regroup-rename-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      figma.notify(`리그룹핑/리네이밍 완료 (${result.summary.renameCount}개 이름 정리)`, { timeout: 1800 });
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
    const result = await readRegroupRenameCache();

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

    const context = buildSelectionContext(selection, designReadResult, options);
    const renameResult = await applyRenamePlan(selection, context);
    const regroupResult = applyRegroupPlan(selection, context);
    const suggestionResult = buildRegroupSuggestions(selection, regroupResult.usedNodeIds, context);
    const skippedCount = renameResult.skipped.length + regroupResult.skipped.length;
    const insights = buildInsights(context, renameResult, regroupResult, suggestionResult);

    return {
      version: PATCH_VERSION,
      source: "local-heuristic",
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
        regroupCount: regroupResult.applied.length,
        suggestionCount: suggestionResult.length,
        skippedCount,
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
        topicSlug,
        topicLabel,
        paletteHints,
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
      topicSlug,
      topicLabel,
      paletteHints,
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
        const textHint = getPrimaryTextHint(node);
        const baseName = proposeNodeName(node, context);
        const duplicateCount = counts.get(currentKey) || 0;
        const shouldRename =
          isSuspiciousName(currentName, node.type) ||
          duplicateCount > 1 ||
          !isStructuredNameForMode(currentName, context.namingMode);
        const preserveRootName = context.preservedRootId && node.id === context.preservedRootId;

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

        candidates.push({
          node,
          currentName,
          baseName,
          reason: buildRenameReason(node, context),
          parentName: safeName(node.parent),
          type: String(node.type || "UNKNOWN"),
          textHint,
          textSamples: collectNodeTexts(node, 3, 2).slice(0, 3),
          topicHint: formatTopicLabel(detectTopicSlug(node, context, textHint)),
          colorHint: getNodeColorHint(node),
          imageRole: isImageLikeNode(node) ? detectImageRole(node) : "",
          hasImageFill: hasImageFill(node),
        });
      }

      parentGroups.push({
        usedNames,
        candidates,
      });
    }

    const aiRenameMap = await requestAiRenameSuggestions(parentGroups, context);

    for (const group of parentGroups) {
      const usedNames = group.usedNames;
      const candidates = group.candidates;
      for (const candidate of candidates) {
        const aiSuggestion = aiRenameMap.get(candidate.node.id);
        const nextBaseName = aiSuggestion && aiSuggestion.name ? aiSuggestion.name : candidate.baseName;
        const nextReason = aiSuggestion && aiSuggestion.reason ? aiSuggestion.reason : candidate.reason;
        const uniqueName = ensureUniqueName(nextBaseName, usedNames);
        if (!uniqueName || canonicalizeName(uniqueName) === canonicalizeName(candidate.currentName)) {
          continue;
        }

        try {
          candidate.node.name = uniqueName;
          applied.push({
            id: candidate.node.id,
            from: candidate.currentName,
            to: uniqueName,
            reason: nextReason,
          });
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
    };
  }

  async function requestAiRenameSuggestions(parentGroups, context) {
    const ai = getAiHelper();
    if (!ai) {
      return new Map();
    }

    let configured = false;
    try {
      configured = await ai.hasConfiguredAiAsync();
    } catch (error) {
      configured = false;
    }

    if (!configured) {
      return new Map();
    }

    const candidates = [];
    for (const group of parentGroups) {
      const items = group && Array.isArray(group.candidates) ? group.candidates : [];
      for (const candidate of items) {
        candidates.push({
          id: candidate.node.id,
          currentName: candidate.currentName,
          localName: candidate.baseName,
          nodeType: candidate.type,
          parentName: candidate.parentName,
          textHint: candidate.textHint,
          textSamples: candidate.textSamples,
          topicHint: candidate.topicHint,
          colorHint: candidate.colorHint,
          imageRole: candidate.imageRole,
          hasImageFill: candidate.hasImageFill,
        });
      }
    }

    if (!candidates.length) {
      return new Map();
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
          paletteHints: context.paletteHints,
          candidates: candidates.slice(0, 36),
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

      return map;
    } catch (error) {
      return new Map();
    }
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
            buildGroupName(pair.label, context),
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
          const groupName = ensureUniqueName(suggestion.name, collectSiblingNameSet(parent, group));
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

  function proposeNodeName(node, context) {
    const type = String(node.type || "UNKNOWN");
    const textHint = getPrimaryTextHint(node);
    const sectionSlug = detectSectionSlug(node, context);
    const contentSlug = resolveContentSlug(node, textHint, context);
    const topicSlug = detectTopicSlug(node, context, textHint);

    if (type === "TEXT") {
      return buildTextNodeName(node, textHint, sectionSlug, contentSlug, topicSlug, context);
    }

    if (isButtonContainer(node)) {
      return buildStructuredName(context.namingMode, "button", detectButtonVariant(node), findActionSlug(node) || contentSlug || "action");
    }

    if (isFieldContainer(node)) {
      return buildStructuredName(context.namingMode, "field", findFieldLabel(node) || contentSlug || "input", "input");
    }

    if (isImageLikeNode(node)) {
      return buildImageNodeName(node, sectionSlug, contentSlug, topicSlug, context);
    }

    if (isIconLikeNode(node)) {
      return buildStructuredName(context.namingMode, "icon", findActionSlug(node) || contentSlug || sectionSlug || "glyph");
    }

    if (hasChildren(node)) {
      return buildContainerName(node, context, sectionSlug, contentSlug, topicSlug);
    }

    if (VECTOR_TYPES.has(type)) {
      return buildStructuredName(context.namingMode, "shape", contentSlug || topicSlug || "vector");
    }

    return buildStructuredName(context.namingMode, "layer", typePrefix(type), contentSlug || topicSlug || sectionSlug || "item");
  }

  function buildTextNodeName(node, textHint, sectionSlug, contentSlug, topicSlug, context) {
    const text = textHint || getTextValue(node);
    const semanticSlug = contentSlug || topicSlug || sectionSlug || context.contextSlug || "content";
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

  function buildContainerName(node, context, sectionSlug, contentSlug, topicSlug) {
    const resolvedSection = sectionSlug || context.contextSlug || topicSlug || "content";
    const semanticSlug = contentSlug || topicSlug || "item";
    const groupRole = inferGroupRole(node, semanticSlug);

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

  function buildImageNodeName(node, sectionSlug, contentSlug, topicSlug, context) {
    const imageRole = detectImageRole(node);
    const semanticSlug = topicSlug || contentSlug || sectionSlug || context.contextSlug || "content";

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

    return texts.length > 0 ? compactText(texts[0]) : "";
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

  function looksLikeButtonText(text) {
    const normalized = compactText(text).toLowerCase();
    return normalized.length > 0 && normalized.length <= 24 && BUTTON_TEXT_PATTERN.test(normalized);
  }

  function matchFieldLabel(text) {
    return findBestToken([text], FIELD_KEYWORD_ENTRIES, "");
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
    const values = [safeName(node)];
    const parent = node && node.parent;
    if (parent) {
      values.push(safeName(parent));
    }

    values.push(...collectNodeTexts(node, 3, 2));
    const sectionSlug = findBestToken(values, SECTION_TOKEN_ENTRIES, "");
    return sectionSlug || context.contextSlug || context.topicSlug || "content";
  }

  function resolveContentSlug(node, preferredText, context) {
    const values = collectNodeSemanticValues(node, preferredText, 3, 1);
    const actionSlug = findBestToken(values, ACTION_TOKEN_ENTRIES, "");
    if (actionSlug) {
      return actionSlug;
    }

    const fieldSlug = findBestToken(values, FIELD_KEYWORD_ENTRIES, "");
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

    values.push(safeName(node));
    if (node && node.parent) {
      values.push(safeName(node.parent));
    }

    values.push(...collectNodeTexts(node, textLimit, textDepth));
    return values;
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
    return /^[A-Z][A-Za-z0-9]*(?:[ -][A-Za-z0-9]+)*(?:\/[A-Z][A-Za-z0-9]*(?:[ -][A-Za-z0-9]+)*)+$/.test(normalized);
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
    if (!bounds || bounds.width < 120 || bounds.height < 32) {
      return false;
    }

    return !!findFieldLabel(node);
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
        name: buildSuggestedTextBlockName(title, body, context),
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

  function buildGroupName(labelNode, context) {
    const label = getPrimaryTextHint(labelNode);
    const itemSlug = resolveContentSlug(labelNode, label, context) || context.topicSlug || "item";
    const sectionSlug = detectSectionSlug(labelNode, context);
    if (context.contextSlug === "navbar" || sectionSlug === "navbar") {
      return buildStructuredName(context.namingMode, "group", "navbar", "item", itemSlug);
    }

    return buildStructuredName(context.namingMode, "group", sectionSlug || context.contextSlug || "content", "item", itemSlug);
  }

  function buildSuggestedTextBlockName(titleNode, bodyNode, context) {
    const titleLabel = getPrimaryTextHint(titleNode);
    const bodyLabel = getPrimaryTextHint(bodyNode);
    const itemSlug =
      resolveContentSlug(titleNode, titleLabel, context) ||
      resolveContentSlug(bodyNode, bodyLabel, context) ||
      context.topicSlug ||
      "copy";
    const sectionSlug = detectSectionSlug(titleNode, context);
    return buildStructuredName(context.namingMode, "group", sectionSlug || context.contextSlug || "content", "copy", itemSlug);
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
      const suffix = String(index).padStart(2, "0");
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
