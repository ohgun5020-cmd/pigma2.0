;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_DESIGN_READ_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_DESIGN_READ_CACHE_KEY = "pigma:ai-design-read-cache:v1";
  const PATCH_VERSION = 1;
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
  const CONTAINER_TYPES = new Set([
    "FRAME",
    "GROUP",
    "SECTION",
    "COMPONENT",
    "COMPONENT_SET",
    "INSTANCE",
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

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isAiDesignReadMessage(message)) {
      if (message.type === "request-ai-design-read-cache") {
        await postCachedResult();
        return;
      }

      await runDesignRead();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_DESIGN_READ_PATCH__ = true;

  function isAiDesignReadMessage(message) {
    return !!message && (message.type === "request-ai-design-read-cache" || message.type === "run-ai-design-read");
  }

  async function runDesignRead() {
    postStatus("running", "선택된 디자인을 읽는 중입니다.");

    try {
      const localResult = analyzeCurrentSelection();
      const result = await enrichDesignReadWithAi(localResult);
      await writeCachedResult(result);

      figma.ui.postMessage({
        type: "ai-design-read-result",
        result,
        matchesCurrentSelection: true,
      });

      figma.notify("디자인 읽기 완료", { timeout: 1600 });
    } catch (error) {
      const message = normalizeErrorMessage(error);

      figma.ui.postMessage({
        type: "ai-design-read-error",
        message,
      });

      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function postCachedResult() {
    const result = await readCachedResult();

    figma.ui.postMessage({
      type: "ai-design-read-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-design-read-status",
      status,
      message,
    });
  }

  async function readCachedResult() {
    try {
      const value = await figma.clientStorage.getAsync(AI_DESIGN_READ_CACHE_KEY);
      return normalizeCachedResult(value);
    } catch (error) {
      return null;
    }
  }

  async function writeCachedResult(result) {
    const normalized = normalizeCachedResult(result);

    try {
      await figma.clientStorage.setAsync(AI_DESIGN_READ_CACHE_KEY, normalized);
    } catch (error) {}

    return normalized;
  }

  function normalizeCachedResult(value) {
    if (!value || typeof value !== "object") {
      return null;
    }

    return value;
  }

  function matchesCurrentSelection(result) {
    return !!result && result.selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  function analyzeCurrentSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const rootBounds = [];
    const rootSummaries = [];
    const typeCounts = new Map();
    const colorCounts = new Map();
    const fontFamilyCounts = new Map();
    const fontSizeCounts = new Map();
    const nameCounts = new Map();
    const scriptCounts = {
      korean: 0,
      latin: 0,
      japanese: 0,
      cjk: 0,
      digit: 0,
      other: 0,
    };
    const suspiciousExamples = [];
    const duplicateExamples = [];
    const textSamples = [];
    const rootNames = [];
    const fractionalExamples = [];
    const fractionalNodeIds = new Set();
    let suspiciousCount = 0;
    let fractionalValueCount = 0;
    const nodeInsights = [];
    const typeStats = {
      totalNodes: 0,
      frameCount: 0,
      groupCount: 0,
      textNodeCount: 0,
      vectorCount: 0,
      instanceCount: 0,
      componentCount: 0,
      sectionCount: 0,
      imageFillCount: 0,
      solidPaintCount: 0,
      effectNodeCount: 0,
      maskCount: 0,
      maxDepth: 0,
      textCharacterCount: 0,
      buttonLikeCount: 0,
    };

    const stack = [];
    for (let index = selection.length - 1; index >= 0; index -= 1) {
      const node = selection[index];
      stack.push({ node, depth: 1 });

      const bounds = getNodeBounds(node);
      if (bounds) {
        rootBounds.push(bounds);
      }

      rootSummaries.push({
        id: node.id,
        name: safeName(node),
        type: String(node.type || "UNKNOWN"),
        width: bounds ? roundPixel(bounds.width) : null,
        height: bounds ? roundPixel(bounds.height) : null,
        childCount: hasChildren(node) ? node.children.length : 0,
      });

      rootNames.push(safeName(node));
    }

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      const { node, depth } = current;
      const type = String(node.type || "UNKNOWN");
      const name = safeName(node);

      typeStats.totalNodes += 1;
      typeStats.maxDepth = Math.max(typeStats.maxDepth, depth);
      bumpCount(typeCounts, type);
      bumpCount(nameCounts, canonicalizeName(name));

      if (type === "FRAME") {
        typeStats.frameCount += 1;
      } else if (type === "GROUP") {
        typeStats.groupCount += 1;
      } else if (type === "TEXT") {
        typeStats.textNodeCount += 1;
      } else if (type === "INSTANCE") {
        typeStats.instanceCount += 1;
      } else if (type === "SECTION") {
        typeStats.sectionCount += 1;
      } else if (type === "COMPONENT" || type === "COMPONENT_SET") {
        typeStats.componentCount += 1;
      }

      if (VECTOR_TYPES.has(type)) {
        typeStats.vectorCount += 1;
      }

      if (isMaskNode(node)) {
        typeStats.maskCount += 1;
      }

      if (hasVisibleEffects(node)) {
        typeStats.effectNodeCount += 1;
      }

      if (isSuspiciousName(name, type)) {
        suspiciousCount += 1;
        if (suspiciousExamples.length < 6) {
          suspiciousExamples.push(name);
        }
      }

      fractionalValueCount += inspectNumericFields(node, name, fractionalExamples, fractionalNodeIds);
      inspectPaintArray(node.fills, colorCounts, typeStats);
      inspectPaintArray(node.strokes, colorCounts, typeStats);

      if (type === "TEXT") {
        collectTextNodeSummary(node, textSamples, scriptCounts, fontFamilyCounts, fontSizeCounts, typeStats);
      }

      if (looksLikeButton(node)) {
        typeStats.buttonLikeCount += 1;
      }

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push({ node: node.children[index], depth: depth + 1 });
        }
      }
    }

    const duplicateEntries = sortCountEntries(nameCounts).filter((entry) => entry.count > 1);
    for (let index = 0; index < duplicateEntries.length && duplicateExamples.length < 5; index += 1) {
      const entry = duplicateEntries[index];
      duplicateExamples.push(`${entry.key} ×${entry.count}`);
    }

    const selectionBounds = combineBounds(rootBounds);
    const languageSummary = summarizeLanguage(scriptCounts);
    const contextSummary = inferDesignContext({
      rootNames,
      textSamples,
      typeStats,
      selectionBounds,
      topTypes: sortCountEntries(typeCounts),
    });
    const topTypes = sortCountEntries(typeCounts).slice(0, 5).map((entry) => ({
      type: entry.key,
      label: formatNodeType(entry.key),
      count: entry.count,
    }));
    const topColors = sortCountEntries(colorCounts).slice(0, 6).map((entry) => ({
      value: entry.key,
      count: entry.count,
    }));
    const topFonts = sortCountEntries(fontFamilyCounts).slice(0, 4).map((entry) => ({
      value: entry.key,
      count: entry.count,
    }));
    const topFontSizes = sortCountEntries(fontSizeCounts).slice(0, 4).map((entry) => ({
      value: entry.key,
      count: entry.count,
    }));

    if (languageSummary.descriptor) {
      nodeInsights.push(`언어 추정: ${languageSummary.descriptor}`);
    }

    nodeInsights.push(`레이어 ${typeStats.totalNodes}개, 텍스트 ${typeStats.textNodeCount}개, 깊이 ${typeStats.maxDepth}단계`);

    if (contextSummary.label) {
      nodeInsights.push(`맥락 추정: ${contextSummary.label}`);
    }

    if (fractionalNodeIds.size > 0) {
      nodeInsights.push(
        `픽셀 퍼팩트 후보: ${fractionalNodeIds.size}개 레이어에서 소수점 값 ${fractionalValueCount}건 감지`
      );
    } else {
      nodeInsights.push("픽셀 퍼팩트 후보: 핵심 좌표/크기 값은 대부분 정수 기준");
    }

    if (suspiciousCount > 0 || duplicateEntries.length > 0) {
      nodeInsights.push(
        `리네이밍 후보: 기본 이름 ${suspiciousCount}개, 중복 이름 ${duplicateEntries.length}종`
      );
    }

    if (topFonts.length > 0) {
      nodeInsights.push(`주요 폰트: ${topFonts.map((entry) => `${entry.value} ${entry.count}`).join(" · ")}`);
    }

    if (textSamples.length > 0) {
      nodeInsights.push(`대표 텍스트: ${textSamples.slice(0, 2).join(" / ")}`);
    }

    return {
      version: PATCH_VERSION,
      source: "local-heuristic",
      selectionSignature: getSelectionSignature(selection),
      analyzedAt: new Date().toISOString(),
      roots: rootSummaries,
      selectionBounds: selectionBounds
        ? {
            width: roundPixel(selectionBounds.width),
            height: roundPixel(selectionBounds.height),
          }
        : null,
      summary: {
        selectionLabel: formatSelectionLabel(rootSummaries),
        languageLabel: languageSummary.descriptor,
        languageReason: languageSummary.reason,
        contextLabel: contextSummary.label,
        contextReason: contextSummary.reason,
      },
      stats: {
        rootCount: rootSummaries.length,
        totalNodes: typeStats.totalNodes,
        textNodeCount: typeStats.textNodeCount,
        frameCount: typeStats.frameCount,
        groupCount: typeStats.groupCount,
        vectorCount: typeStats.vectorCount,
        instanceCount: typeStats.instanceCount,
        componentCount: typeStats.componentCount,
        sectionCount: typeStats.sectionCount,
        imageFillCount: typeStats.imageFillCount,
        effectNodeCount: typeStats.effectNodeCount,
        maskCount: typeStats.maskCount,
        maxDepth: typeStats.maxDepth,
        textCharacterCount: typeStats.textCharacterCount,
        buttonLikeCount: typeStats.buttonLikeCount,
        topTypes,
      },
      naming: {
        suspiciousCount,
        suspiciousExamples,
        duplicateNameCount: duplicateEntries.length,
        duplicateExamples,
      },
      pixel: {
        fractionalNodeCount: fractionalNodeIds.size,
        fractionalValueCount,
        examples: fractionalExamples.slice(0, 8),
      },
      typography: {
        topFonts,
        topFontSizes,
        textSamples: textSamples.slice(0, 6),
      },
      colors: {
        topColors,
      },
      insights: nodeInsights.slice(0, 6),
    };
  }

  async function enrichDesignReadWithAi(localResult) {
    const ai = getAiHelper();
    if (!ai) {
      return localResult;
    }

    let configured = false;
    try {
      configured = await ai.hasConfiguredAiAsync();
    } catch (error) {
      configured = false;
    }

    if (!configured) {
      return localResult;
    }

    const payload = {
      selectionLabel: localResult.summary ? localResult.summary.selectionLabel : "",
      roots: Array.isArray(localResult.roots) ? localResult.roots.slice(0, 6) : [],
      selectionBounds: localResult.selectionBounds || null,
      stats: localResult.stats || {},
      naming: localResult.naming || {},
      pixel: localResult.pixel || {},
      typography: localResult.typography || {},
      colors: localResult.colors || {},
      currentSummary: localResult.summary || {},
      currentInsights: Array.isArray(localResult.insights) ? localResult.insights.slice(0, 6) : [],
    };
    const schema = {
      type: "object",
      properties: {
        languageLabel: { type: "string" },
        contextLabel: { type: "string" },
        contextReason: { type: "string" },
        contentSummary: { type: "string" },
        namingSummary: { type: "string" },
        pixelSummary: { type: "string" },
        insights: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["languageLabel", "contextLabel", "contextReason", "contentSummary", "namingSummary", "pixelSummary", "insights"],
    };

    try {
      const response = await ai.requestJsonTask({
        instructions:
          "You analyze structured Figma design metadata for a design correction plugin. Return concise Korean JSON. Keep labels short and practical. Infer what kind of screen this is, what content the screen is about, and summarize naming and pixel issues.",
        schema: schema,
        payload: payload,
      });
      if (!response || typeof response !== "object") {
        return localResult;
      }

      if (typeof response.languageLabel === "string" && response.languageLabel.trim()) {
        localResult.summary.languageLabel = response.languageLabel.trim();
      }

      if (typeof response.contextLabel === "string" && response.contextLabel.trim()) {
        localResult.summary.contextLabel = response.contextLabel.trim();
      }

      if (typeof response.contextReason === "string" && response.contextReason.trim()) {
        localResult.summary.contextReason = response.contextReason.trim();
      }

      if (typeof response.contentSummary === "string" && response.contentSummary.trim()) {
        localResult.summary.contentSummary = response.contentSummary.trim();
      }

      if (typeof response.namingSummary === "string" && response.namingSummary.trim()) {
        localResult.naming.aiSummary = response.namingSummary.trim();
      }

      if (typeof response.pixelSummary === "string" && response.pixelSummary.trim()) {
        localResult.pixel.aiSummary = response.pixelSummary.trim();
      }

      localResult.source = typeof response._provider === "string" ? response._provider : "hybrid-ai";
      localResult.insights = mergeInsights(ai, localResult, response);
    } catch (error) {
      localResult.aiError = normalizeErrorMessage(error, "AI 맥락 보강에 실패했습니다.");
    }

    return localResult;
  }

  function mergeInsights(ai, localResult, response) {
    const aiInsights = [];
    if (typeof response.contentSummary === "string" && response.contentSummary.trim()) {
      aiInsights.push("콘텐츠 요약: " + response.contentSummary.trim());
    }

    if (typeof response.namingSummary === "string" && response.namingSummary.trim()) {
      aiInsights.push("AI 네이밍 판단: " + response.namingSummary.trim());
    }

    if (typeof response.pixelSummary === "string" && response.pixelSummary.trim()) {
      aiInsights.push("AI 픽셀 판단: " + response.pixelSummary.trim());
    }

    if (Array.isArray(response.insights)) {
      for (const item of response.insights) {
        if (typeof item === "string" && item.trim()) {
          aiInsights.push(item.trim());
        }
      }
    }

    return ai.uniqueStrings(aiInsights.concat(Array.isArray(localResult.insights) ? localResult.insights : []), 6);
  }

  function getAiHelper() {
    const helper = globalScope.__PIGMA_AI_LLM__;
    return helper && typeof helper.requestJsonTask === "function" && typeof helper.hasConfiguredAiAsync === "function"
      ? helper
      : null;
  }

  function collectTextNodeSummary(node, textSamples, scriptCounts, fontFamilyCounts, fontSizeCounts, typeStats) {
    const value = typeof node.characters === "string" ? node.characters.trim() : "";
    if (value) {
      if (textSamples.length < 6 && !textSamples.includes(value)) {
        textSamples.push(value.length > 72 ? `${value.slice(0, 69)}...` : value);
      }

      addScriptCounts(scriptCounts, value);
      typeStats.textCharacterCount += value.length;
    }

    collectFontNames(node, fontFamilyCounts);

    if (typeof node.fontSize === "number" && Number.isFinite(node.fontSize)) {
      bumpCount(fontSizeCounts, String(roundValue(node.fontSize)));
    }
  }

  function collectFontNames(node, fontFamilyCounts) {
    if (node.fontName && node.fontName !== figma.mixed && typeof node.fontName === "object") {
      bumpCount(fontFamilyCounts, node.fontName.family || "Unknown");
      return;
    }

    if (node.fontName === figma.mixed && typeof node.getRangeAllFontNames === "function") {
      try {
        const fontNames = node.getRangeAllFontNames(0, typeof node.characters === "string" ? node.characters.length : 0);
        const uniqueFamilies = new Set();
        for (const fontName of fontNames) {
          if (!fontName || typeof fontName !== "object" || typeof fontName.family !== "string") {
            continue;
          }

          uniqueFamilies.add(fontName.family);
          if (uniqueFamilies.size >= 6) {
            break;
          }
        }

        uniqueFamilies.forEach((family) => bumpCount(fontFamilyCounts, family));
      } catch (error) {
        bumpCount(fontFamilyCounts, "Mixed");
      }
    }
  }

  function inspectPaintArray(paints, colorCounts, typeStats) {
    if (!Array.isArray(paints)) {
      return;
    }

    for (const paint of paints) {
      if (!paint || paint.visible === false) {
        continue;
      }

      if (paint.type === "IMAGE") {
        typeStats.imageFillCount += 1;
        continue;
      }

      if (paint.type !== "SOLID" || !paint.color) {
        continue;
      }

      const hex = rgbToHex(paint.color);
      bumpCount(colorCounts, hex);
      typeStats.solidPaintCount += 1;
    }
  }

  function inspectNumericFields(node, nodeName, examples, nodeIds) {
    const fields = [];

    maybeTrackNumber(fields, "x", node.x);
    maybeTrackNumber(fields, "y", node.y);
    maybeTrackNumber(fields, "width", node.width);
    maybeTrackNumber(fields, "height", node.height);
    maybeTrackNumber(fields, "rotation", node.rotation);
    maybeTrackNumber(fields, "strokeWeight", node.strokeWeight);
    maybeTrackNumber(fields, "cornerRadius", node.cornerRadius);
    maybeTrackNumber(fields, "topLeftRadius", node.topLeftRadius);
    maybeTrackNumber(fields, "topRightRadius", node.topRightRadius);
    maybeTrackNumber(fields, "bottomLeftRadius", node.bottomLeftRadius);
    maybeTrackNumber(fields, "bottomRightRadius", node.bottomRightRadius);

    if (!fields.length) {
      return 0;
    }

    nodeIds.add(node.id);

    if (examples.length < 12) {
      examples.push({
        name: nodeName,
        fields,
      });
    }

    return fields.length;
  }

  function maybeTrackNumber(fields, fieldName, value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return;
    }

    if (Math.abs(value - Math.round(value)) <= 0.0001) {
      return;
    }

    fields.push(`${fieldName} ${roundValue(value)}`);
  }

  function addScriptCounts(scriptCounts, text) {
    for (const character of text) {
      const codePoint = character.codePointAt(0);
      if (typeof codePoint !== "number") {
        continue;
      }

      if (
        (codePoint >= 0xac00 && codePoint <= 0xd7af) ||
        (codePoint >= 0x1100 && codePoint <= 0x11ff) ||
        (codePoint >= 0x3130 && codePoint <= 0x318f)
      ) {
        scriptCounts.korean += 1;
      } else if (
        (codePoint >= 0x3040 && codePoint <= 0x309f) ||
        (codePoint >= 0x30a0 && codePoint <= 0x30ff)
      ) {
        scriptCounts.japanese += 1;
      } else if (codePoint >= 0x4e00 && codePoint <= 0x9fff) {
        scriptCounts.cjk += 1;
      } else if (
        (codePoint >= 0x0041 && codePoint <= 0x005a) ||
        (codePoint >= 0x0061 && codePoint <= 0x007a)
      ) {
        scriptCounts.latin += 1;
      } else if (codePoint >= 0x0030 && codePoint <= 0x0039) {
        scriptCounts.digit += 1;
      } else if (!/\s/.test(character)) {
        scriptCounts.other += 1;
      }
    }
  }

  function summarizeLanguage(scriptCounts) {
    const ordered = Object.entries(scriptCounts)
      .filter((entry) => entry[0] !== "digit" && entry[0] !== "other" && entry[1] > 0)
      .sort((left, right) => right[1] - left[1]);

    if (!ordered.length) {
      return {
        descriptor: "텍스트 언어 미감지",
        reason: "텍스트 레이어가 없거나 언어 판별에 충분한 문자가 없습니다.",
      };
    }

    const primary = ordered[0];
    const secondary = ordered[1] && primary[1] > 0 && ordered[1][1] / primary[1] >= 0.25 ? ordered[1] : null;
    const descriptor = secondary
      ? `${languageLabel(primary[0])} 중심 / ${languageLabel(secondary[0])} 혼합`
      : `${languageLabel(primary[0])} 중심`;

    return {
      descriptor,
      reason: `${languageLabel(primary[0])} 비중이 가장 높습니다.`,
    };
  }

  function inferDesignContext({ rootNames, textSamples, typeStats, selectionBounds, topTypes }) {
    const corpus = `${rootNames.join(" ")} ${textSamples.join(" ")}`.toLowerCase();
    const categories = [
      {
        label: "인증/폼 화면",
        reason: "로그인, 가입, 입력, 확인 계열 텍스트 신호가 많습니다.",
        keywords: [
          "login",
          "sign in",
          "sign up",
          "email",
          "password",
          "submit",
          "continue",
          "로그인",
          "회원가입",
          "이메일",
          "비밀번호",
          "입력",
          "제출",
          "확인",
          "인증",
        ],
      },
      {
        label: "대시보드/데이터 화면",
        reason: "지표, 표, 차트 계열 레이어와 숫자 중심 텍스트가 보입니다.",
        keywords: [
          "dashboard",
          "analytics",
          "chart",
          "table",
          "report",
          "metric",
          "stats",
          "data",
          "대시보드",
          "분석",
          "차트",
          "테이블",
          "리포트",
          "지표",
          "매출",
        ],
      },
      {
        label: "랜딩/프로모션 화면",
        reason: "짧은 CTA 문구와 버튼형 신호가 많아 홍보형 화면으로 보입니다.",
        keywords: [
          "get started",
          "learn more",
          "shop",
          "book",
          "download",
          "discover",
          "contact",
          "지금",
          "시작",
          "구매",
          "예약",
          "자세히",
          "다운로드",
          "문의",
        ],
      },
      {
        label: "모달/다이얼로그",
        reason: "선택 범위가 상대적으로 작고 확인/취소 계열 문구가 보입니다.",
        keywords: ["cancel", "confirm", "delete", "ok", "취소", "삭제", "닫기", "확인"],
      },
      {
        label: "앱/웹 내비게이션 화면",
        reason: "메뉴, 설정, 홈, 프로필 등 탐색성 텍스트가 많습니다.",
        keywords: [
          "home",
          "profile",
          "settings",
          "menu",
          "search",
          "notification",
          "홈",
          "프로필",
          "설정",
          "메뉴",
          "검색",
          "알림",
        ],
      },
    ];

    let best = null;
    for (const category of categories) {
      let score = 0;
      for (const keyword of category.keywords) {
        if (corpus.includes(keyword)) {
          score += 1;
        }
      }

      if (category.label === "랜딩/프로모션 화면" && typeStats.buttonLikeCount >= 2) {
        score += 1;
      }

      if (category.label === "모달/다이얼로그" && selectionBounds && selectionBounds.width <= 720) {
        score += 1;
      }

      if (category.label === "대시보드/데이터 화면" && typeStats.textNodeCount >= 8) {
        score += 1;
      }

      if (!best || score > best.score) {
        best = {
          label: category.label,
          reason: category.reason,
          score,
        };
      }
    }

    if (best && best.score > 0) {
      return best;
    }

    if (typeStats.componentCount + typeStats.instanceCount >= Math.max(2, typeStats.rootCount || 1)) {
      return {
        label: "컴포넌트/변형 세트",
        reason: "컴포넌트와 인스턴스 비중이 높습니다.",
        score: 0,
      };
    }

    if (topTypes.length > 0) {
      return {
        label: "일반 UI 화면",
        reason: `${topTypes[0].label || formatNodeType(topTypes[0].type)} 중심 구조입니다.`,
        score: 0,
      };
    }

    return {
      label: "일반 선택 영역",
      reason: "구조 분석은 가능하지만 특정 화면 맥락 신호는 약합니다.",
      score: 0,
    };
  }

  function looksLikeButton(node) {
    const name = safeName(node).toLowerCase();
    if (/button|btn|cta|chip|tab|badge|버튼|탭|칩/.test(name)) {
      return true;
    }

    if (node.type === "TEXT" && typeof node.characters === "string") {
      const value = node.characters.trim().toLowerCase();
      return (
        value.length > 0 &&
        value.length <= 18 &&
        /^(ok|go|next|done|start|login|signup|save|apply|cancel|submit|확인|다음|완료|시작|저장|취소|적용)$/.test(
          value
        )
      );
    }

    return false;
  }

  function combineBounds(boundsList) {
    if (!boundsList.length) {
      return null;
    }

    let left = boundsList[0].x;
    let top = boundsList[0].y;
    let right = boundsList[0].x + boundsList[0].width;
    let bottom = boundsList[0].y + boundsList[0].height;

    for (let index = 1; index < boundsList.length; index += 1) {
      const bounds = boundsList[index];
      left = Math.min(left, bounds.x);
      top = Math.min(top, bounds.y);
      right = Math.max(right, bounds.x + bounds.width);
      bottom = Math.max(bottom, bounds.y + bounds.height);
    }

    return {
      x: left,
      y: top,
      width: Math.max(0, right - left),
      height: Math.max(0, bottom - top),
    };
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

  function getSelectionSignature(selection) {
    const ids = Array.from(selection || [])
      .map((node) => node.id)
      .sort();
    return `${figma.currentPage.id}:${ids.join(",")}`;
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

  function sortCountEntries(map) {
    return Array.from(map.entries())
      .map((entry) => ({
        key: entry[0],
        count: entry[1],
      }))
      .sort((left, right) => {
        if (right.count !== left.count) {
          return right.count - left.count;
        }

        return String(left.key).localeCompare(String(right.key));
      });
  }

  function bumpCount(map, key) {
    if (!key) {
      return;
    }

    map.set(key, (map.get(key) || 0) + 1);
  }

  function canonicalizeName(name) {
    return String(name || "Unnamed").trim().toLowerCase();
  }

  function safeName(node) {
    if (node && typeof node.name === "string" && node.name.trim().length > 0) {
      return node.name.trim();
    }

    return String((node && node.type) || "Unnamed");
  }

  function hasChildren(node) {
    return !!node && Array.isArray(node.children);
  }

  function hasVisibleEffects(node) {
    return !!node && Array.isArray(node.effects) && node.effects.some((effect) => effect && effect.visible !== false);
  }

  function isMaskNode(node) {
    return !!node && node.isMask === true;
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

  function rgbToHex(color) {
    const red = toHexChannel(color.r);
    const green = toHexChannel(color.g);
    const blue = toHexChannel(color.b);
    return `#${red}${green}${blue}`;
  }

  function toHexChannel(value) {
    const channel = Math.max(0, Math.min(255, Math.round(value * 255)));
    return channel.toString(16).padStart(2, "0").toUpperCase();
  }

  function roundValue(value) {
    return Math.round(value * 100) / 100;
  }

  function roundPixel(value) {
    return Math.round(value);
  }

  function languageLabel(language) {
    switch (language) {
      case "korean":
        return "한국어";
      case "latin":
        return "영어/라틴";
      case "japanese":
        return "일본어";
      case "cjk":
        return "중국어/한자";
      default:
        return "기타";
    }
  }

  function formatNodeType(type) {
    switch (String(type || "").toUpperCase()) {
      case "FRAME":
        return "프레임";
      case "GROUP":
        return "그룹";
      case "TEXT":
        return "텍스트";
      case "SECTION":
        return "섹션";
      case "COMPONENT":
        return "컴포넌트";
      case "COMPONENT_SET":
        return "컴포넌트 세트";
      case "INSTANCE":
        return "인스턴스";
      case "VECTOR":
        return "벡터";
      case "BOOLEAN_OPERATION":
        return "불리언";
      case "RECTANGLE":
        return "사각형";
      case "ELLIPSE":
        return "타원";
      default:
        return type;
    }
  }

  function normalizeErrorMessage(error) {
    if (error instanceof Error && typeof error.message === "string" && error.message.trim().length > 0) {
      return error.message.trim();
    }

    return "디자인 읽기에 실패했습니다.";
  }
})();
