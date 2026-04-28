;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_TYPO_AUDIT_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_DESIGN_READ_CACHE_KEY = "pigma:ai-design-read-cache:v1";
  const AI_TYPO_AUDIT_CACHE_KEY = "pigma:ai-typo-audit-cache:v2";
  const AI_TYPO_FIX_CACHE_KEY = "pigma:ai-typo-fix-cache:v2";
  const AI_TYPO_CLEAR_CACHE_KEY = "pigma:ai-typo-clear-cache:v1";
  const AI_TRANSLATE_CACHE_KEY = "pigma:ai-translate-cache:v1";
  const AI_TRANSLATE_MEMORY_KEY = "pigma:ai-translate-memory:v1";
  const AI_TEXT_HIGHLIGHT_DEFAULT_COLOR = "#F5FF74";
  const AI_TEXT_HIGHLIGHT_DEFAULT_TEXT_COLOR = "#111111";
  const AI_TEXT_HIGHLIGHT_DEFAULT_RADIUS = 0;
  const AI_TEXT_HIGHLIGHT_DEFAULT_DECORATION_SCALE = 3;
  const AI_TEXT_HIGHLIGHT_DEFAULT_BOX_PADDING_PX = 0;
  const AI_TEXT_HIGHLIGHT_DEFAULT_STRIKE_RADIUS = 0;
  const AI_TEXT_HIGHLIGHT_MEASURE_COLOR = "#FF00FF";
  const AI_TEXT_HIGHLIGHT_GROUP_NAME = "#high-light-text";
  const AI_TEXT_HIGHLIGHT_GROUP_PLUGIN_KEY = "pigma:text-highlight-group";
  const AI_TEXT_HIGHLIGHT_GROUP_TEXT_NODE_KEY = "pigma:text-highlight-text-node-id";
  const AI_TEXT_HIGHLIGHT_GROUP_WIDTH_KEY = "pigma:text-highlight-container-width";
  const AI_TEXT_HIGHLIGHT_GROUP_HEIGHT_KEY = "pigma:text-highlight-container-height";
  const PATCH_VERSION = 13;
  const TYPO_AUDIT_MODEL_BY_PROVIDER = Object.freeze({
    openai: "gpt-5-mini",
    gemini: "gemini-2.5-pro",
  });
  const AI_TRANSLATE_MODEL_BY_PROVIDER = Object.freeze({
    openai: "gpt-4.1-mini",
    gemini: "gemini-2.5-flash-lite",
  });
  const AI_TRANSLATE_MAX_CHUNK_ITEMS = 24;
  const AI_TRANSLATE_MAX_CHUNK_CHARS = 3600;
  const AI_TRANSLATE_MEMORY_LIMIT = 400;
  const loadedFontPromiseCache = new Map();
  const pendingTextHighlightMeasureRequests = new Map();
  let textHighlightMeasureRequestSequence = 0;
  const ANNOTATION_PREFIX = "[Ai 판단]";
  const LEGACY_ANNOTATION_PREFIXES = ["[AI Typo]", ANNOTATION_PREFIX, "[Pigma Ai Audit]"];
  const ANNOTATION_CATEGORY_LABEL = "Pigma Ai Audit";
  const ANNOTATION_CATEGORY_COLOR = "yellow";
  const TRANSLATION_LANGUAGE_METADATA = Object.freeze({
    "en-US": { label: "영어 (미국)", aiLabel: "English (United States)", latinLocaleHint: "english" },
    "ja-JP": { label: "일본어 (일본)", aiLabel: "Japanese (Japan)", latinLocaleHint: "" },
    "zh-CN": { label: "중국어 간체 (중국)", aiLabel: "Chinese Simplified (China)", latinLocaleHint: "" },
    "ko-KR": { label: "한국어 (대한민국)", aiLabel: "Korean (South Korea)", latinLocaleHint: "" },
    "es-ES": { label: "스페인어 (스페인)", aiLabel: "Spanish (Spain)", latinLocaleHint: "spanish" },
    "fr-FR": { label: "프랑스어 (프랑스)", aiLabel: "French (France)", latinLocaleHint: "french" },
    "de-DE": { label: "독일어 (독일)", aiLabel: "German (Germany)", latinLocaleHint: "german" },
    "pt-BR": { label: "포르투갈어 (브라질)", aiLabel: "Portuguese (Brazil)", latinLocaleHint: "portuguese" },
  });
  const TYPO_REPLACEMENT_RULES = [
    {
      id: "bangapseubnida-direct",
      pattern: /방\s*갑\s*스\s*비\s*난[.!?]?/g,
      replacement: "반갑습니다.",
      reason: "문장 전체가 '반갑습니다.'의 오타로 보여 직접 교정 후보로 표시했습니다.",
      kind: "오타",
    },
    {
      id: "bangapseumnida",
      pattern: /방\s*갑\s*습\s*니\s*다[.!?]?/g,
      replacement: "반갑습니다.",
      reason: "'반갑습니다.' 표현의 대표 오타입니다.",
      kind: "오타",
    },
    {
      id: "login-spacing",
      pattern: /로그\s+인/g,
      replacement: "로그인",
      reason: "UI 용어는 '로그인'을 붙여 쓰는 편이 자연스럽습니다.",
      kind: "띄어쓰기",
    },
    {
      id: "signup-spacing",
      pattern: /회원\s+가입/g,
      replacement: "회원가입",
      reason: "UI 용어는 '회원가입'을 붙여 쓰는 편이 자연스럽습니다.",
      kind: "띄어쓰기",
    },
    {
      id: "password-spacing",
      pattern: /비밀\s+번호/g,
      replacement: "비밀번호",
      reason: "UI 용어는 '비밀번호'를 붙여 쓰는 편이 자연스럽습니다.",
      kind: "띄어쓰기",
    },
    {
      id: "download-spacing",
      pattern: /다운\s+로드/g,
      replacement: "다운로드",
      reason: "UI 용어는 '다운로드'를 붙여 쓰는 편이 자연스럽습니다.",
      kind: "띄어쓰기",
    },
    {
      id: "mypage-spacing",
      pattern: /마이\s+페이지/g,
      replacement: "마이페이지",
      reason: "서비스 메뉴 명칭은 '마이페이지'처럼 붙여 쓰는 경우가 많습니다.",
      kind: "띄어쓰기",
    },
    {
      id: "cart-spacing",
      pattern: /장바\s+구니/g,
      replacement: "장바구니",
      reason: "커머스 UI 용어는 '장바구니'를 붙여 쓰는 편이 자연스럽습니다.",
      kind: "띄어쓰기",
    },
    {
      id: "id-spacing",
      pattern: /아이\s+디/g,
      replacement: "아이디",
      reason: "계정 식별자 표기는 '아이디'를 붙여 쓰는 편이 자연스럽습니다.",
      kind: "띄어쓰기",
    },
  ];
  const CONSISTENCY_RULES = [
    {
      id: "email-term",
      canonical: "이메일",
      variants: ["이메일", "이 메일", "e-mail", "email"],
      reason: "선택 내부에서 이메일 표기를 한 가지 방식으로 통일하면 읽기가 쉬워집니다.",
    },
    {
      id: "login-term",
      canonical: "로그인",
      variants: ["로그인", "로그 인"],
      reason: "선택 내부에서 로그인 표기를 한 가지 방식으로 통일하면 읽기가 쉬워집니다.",
    },
    {
      id: "signup-term",
      canonical: "회원가입",
      variants: ["회원가입", "회원 가입"],
      reason: "선택 내부에서 회원가입 표기를 한 가지 방식으로 통일하면 읽기가 쉬워집니다.",
    },
    {
      id: "email-term-en",
      canonical: "email",
      variants: ["email", "e-mail", "Email", "E-mail"],
      reason: "Use one email term consistently across the same UI.",
    },
    {
      id: "favorite-term-en",
      canonical: "favorite",
      variants: ["favorite", "favourite", "Favorite", "Favourite"],
      reason: "Use one English locale spelling consistently across the same UI.",
    },
  ];
  const TYPO_PHRASE_HINTS = [
    {
      canonical: "반갑습니다",
      suggestion: "반갑습니다.",
      maxDistance: 4,
      reason: "문장 전체가 '반갑습니다.'의 오타로 보여 교정 후보로 표시했습니다.",
      kind: "오타",
    },
  ];
  const LATIN_UI_TOKEN_HINTS_BY_LOCALE = Object.freeze({
    english: Object.freeze([
      "welcome",
      "continue",
      "cancel",
      "confirm",
      "search",
      "settings",
      "profile",
      "account",
      "password",
      "email",
      "username",
      "download",
      "upload",
      "favorite",
      "favourite",
      "notification",
      "privacy",
      "security",
      "submit",
      "message",
      "success",
      "error",
      "retry",
      "delete",
      "create",
      "update",
      "save",
      "close",
      "open",
      "language",
      "address",
      "country",
      "payment",
      "required",
      "optional",
      "optimal",
      "remember",
      "forgot",
      "subscribe",
      "analytics",
      "dashboard",
      "support",
      "help",
      "find",
      "monthly",
      "login",
      "logout",
      "signin",
      "signup",
    ]),
    spanish: Object.freeze([
      "bienvenido",
      "continuar",
      "cancelar",
      "confirmar",
      "buscar",
      "correo",
      "usuario",
      "configuracion",
      "configuración",
      "perfil",
      "contrasena",
      "contraseña",
      "guardar",
      "cerrar",
    ]),
    french: Object.freeze([
      "bonjour",
      "continuer",
      "annuler",
      "rechercher",
      "parametres",
      "paramètres",
      "profil",
      "enregistrer",
      "fermer",
    ]),
    german: Object.freeze([
      "hallo",
      "weiter",
      "abbrechen",
      "bestatigen",
      "bestätigen",
      "einstellungen",
      "konto",
      "passwort",
      "finde",
      "deine",
      "perfekte",
      "lösungen",
      "loesungen",
      "bessere",
      "balance",
      "angebot",
      "solange",
      "vorrat",
      "reicht",
      "jetzt",
      "kaufen",
      "februar",
      "monatlich",
      "monatliche",
      "speichern",
      "schliessen",
      "schließen",
    ]),
    portuguese: Object.freeze([
      "olá",
      "ola",
      "pesquisar",
      "configuracoes",
      "configurações",
      "senha",
      "endereco",
      "endereço",
      "fechar",
      "salvar",
    ]),
    italian: Object.freeze([
      "ciao",
      "continua",
      "annulla",
      "conferma",
      "ricerca",
      "impostazioni",
      "profilo",
      "salva",
      "chiudi",
    ]),
    dutch: Object.freeze([
      "welkom",
      "doorgaan",
      "annuleren",
      "zoeken",
      "instellingen",
      "profiel",
      "opslaan",
      "sluiten",
    ]),
  });
  const LATIN_UI_TOKEN_HINTS = Object.freeze(
    []
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.english)
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.spanish)
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.french)
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.german)
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.portuguese)
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.italian)
      .concat(LATIN_UI_TOKEN_HINTS_BY_LOCALE.dutch)
  );
  const LATIN_UI_TOKEN_SET = new Set(LATIN_UI_TOKEN_HINTS.map((token) => normalizeLatinTokenForLookup(token)).filter(Boolean));
  const LATIN_COMMON_SHORT_WORDS = new Set([
    "a",
    "an",
    "as",
    "at",
    "be",
    "by",
    "do",
    "go",
    "he",
    "i",
    "if",
    "in",
    "is",
    "it",
    "me",
    "my",
    "no",
    "of",
    "on",
    "or",
    "so",
    "to",
    "up",
    "us",
    "we",
  ]);
  const PROOFING_LOCALE_METADATA = Object.freeze({
    "cs-CZ": { label: "체코어 (체코)", aiLabel: "Czech (Czech Republic)", latinLocaleHint: "" },
    "da-DK": { label: "덴마크어 (덴마크)", aiLabel: "Danish (Denmark)", latinLocaleHint: "" },
    "de-DE": { label: "독일어 (독일)", aiLabel: "German (Germany)", latinLocaleHint: "german" },
    "el-GR": { label: "그리스어 (그리스)", aiLabel: "Greek (Greece)", latinLocaleHint: "" },
    "en-GB": { label: "영어 (영국)", aiLabel: "English (United Kingdom)", latinLocaleHint: "english" },
    "en-GY": { label: "영어 (가이아나)", aiLabel: "English (Guyana)", latinLocaleHint: "english" },
    "en-IE": { label: "영어 (아일랜드)", aiLabel: "English (Ireland)", latinLocaleHint: "english" },
    "es-AR": { label: "스페인어 (아르헨티나)", aiLabel: "Spanish (Argentina)", latinLocaleHint: "spanish" },
    "es-BO": { label: "스페인어 (볼리비아)", aiLabel: "Spanish (Bolivia)", latinLocaleHint: "spanish" },
    "es-CL": { label: "스페인어 (칠레)", aiLabel: "Spanish (Chile)", latinLocaleHint: "spanish" },
    "es-CO": { label: "스페인어 (콜롬비아)", aiLabel: "Spanish (Colombia)", latinLocaleHint: "spanish" },
    "es-EC": { label: "스페인어 (에콰도르)", aiLabel: "Spanish (Ecuador)", latinLocaleHint: "spanish" },
    "es-ES": { label: "스페인어 (스페인)", aiLabel: "Spanish (Spain)", latinLocaleHint: "spanish" },
    "es-PE": { label: "스페인어 (페루)", aiLabel: "Spanish (Peru)", latinLocaleHint: "spanish" },
    "es-PY": { label: "스페인어 (파라과이)", aiLabel: "Spanish (Paraguay)", latinLocaleHint: "spanish" },
    "es-UY": { label: "스페인어 (우루과이)", aiLabel: "Spanish (Uruguay)", latinLocaleHint: "spanish" },
    "es-VE": { label: "스페인어 (베네수엘라)", aiLabel: "Spanish (Venezuela)", latinLocaleHint: "spanish" },
    "fi-FI": { label: "핀란드어 (핀란드)", aiLabel: "Finnish (Finland)", latinLocaleHint: "" },
    "fr-FR": { label: "프랑스어 (프랑스)", aiLabel: "French (France)", latinLocaleHint: "french" },
    "fr-GF": { label: "프랑스어 (프랑스령 기아나)", aiLabel: "French (French Guiana)", latinLocaleHint: "french" },
    "hu-HU": { label: "헝가리어 (헝가리)", aiLabel: "Hungarian (Hungary)", latinLocaleHint: "" },
    "it-IT": { label: "이탈리아어 (이탈리아)", aiLabel: "Italian (Italy)", latinLocaleHint: "italian" },
    "nl-NL": { label: "네덜란드어 (네덜란드)", aiLabel: "Dutch (Netherlands)", latinLocaleHint: "dutch" },
    "nl-SR": { label: "네덜란드어 (수리남)", aiLabel: "Dutch (Suriname)", latinLocaleHint: "dutch" },
    "no-NO": { label: "노르웨이어 (노르웨이)", aiLabel: "Norwegian (Norway)", latinLocaleHint: "" },
    "pl-PL": { label: "폴란드어 (폴란드)", aiLabel: "Polish (Poland)", latinLocaleHint: "" },
    "pt-BR": { label: "포르투갈어 (브라질)", aiLabel: "Portuguese (Brazil)", latinLocaleHint: "portuguese" },
    "pt-PT": { label: "포르투갈어 (포르투갈)", aiLabel: "Portuguese (Portugal)", latinLocaleHint: "portuguese" },
    "ro-RO": { label: "루마니아어 (루마니아)", aiLabel: "Romanian (Romania)", latinLocaleHint: "" },
    "sk-SK": { label: "슬로바키아어 (슬로바키아)", aiLabel: "Slovak (Slovakia)", latinLocaleHint: "" },
    "sv-SE": { label: "스웨덴어 (스웨덴)", aiLabel: "Swedish (Sweden)", latinLocaleHint: "" },
    "tr-TR": { label: "터키어 (튀르키예)", aiLabel: "Turkish (Turkey)", latinLocaleHint: "" },
    "uk-UA": { label: "우크라이나어 (우크라이나)", aiLabel: "Ukrainian (Ukraine)", latinLocaleHint: "" },
  });
  let activeTypoTask = "";

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isAiTypoMessage(message)) {
      if (message.type === "request-ai-typo-audit-cache") {
        await postCachedTypoAuditResult();
        return;
      }

      if (message.type === "request-ai-typo-fix-cache") {
        await postCachedTypoFixResult();
        return;
      }

      if (message.type === "request-ai-typo-clear-cache") {
        await postCachedTypoClearResult();
        return;
      }

      if (message.type === "request-ai-translate-cache") {
        await postCachedTranslateResult();
        return;
      }

      if (message.type === "request-ai-text-highlight-source") {
        await postTextHighlightSource(message);
        return;
      }

      if (message.type === "measure-ai-text-highlight-alpha-bounds-result") {
        resolveTextHighlightAlphaBounds(message);
        return;
      }

      if (message.type === "run-ai-typo-fix") {
        await withTypoTaskLock("fix", runTypoFix);
        return;
      }

      if (message.type === "run-ai-typo-clear") {
        await withTypoTaskLock("clear", runTypoClear);
        return;
      }

      if (message.type === "run-ai-translate") {
        await withTypoTaskLock("translate", async () => {
          await runAiTranslate(message);
        });
        return;
      }

      if (message.type === "apply-ai-text-highlight") {
        await withTypoTaskLock("highlight", async () => {
          await runTextHighlight(message);
        });
        return;
      }

      if (message.type === "run-ai-typo-audit") {
        await withTypoTaskLock("audit", async () => {
          await runTypoAudit(message);
        });
        return;
      }

      return;
    }
    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_TYPO_AUDIT_PATCH__ = true;

  function isAiTypoMessage(message) {
    return (
      !!message &&
      (message.type === "request-ai-typo-audit-cache" ||
        message.type === "run-ai-typo-audit" ||
        message.type === "request-ai-typo-fix-cache" ||
        message.type === "run-ai-typo-fix" ||
        message.type === "request-ai-typo-clear-cache" ||
        message.type === "run-ai-typo-clear" ||
        message.type === "request-ai-translate-cache" ||
        message.type === "run-ai-translate" ||
        message.type === "request-ai-text-highlight-source" ||
        message.type === "apply-ai-text-highlight" ||
        message.type === "measure-ai-text-highlight-alpha-bounds-result")
    );
  }

  async function withTypoTaskLock(task, runner) {
    if (activeTypoTask) {
      if (activeTypoTask === task) {
        postTypoTaskStatus(task, "running", getTypoTaskRunningMessage(task));
      } else {
        postTypoTaskError(task, "다른 텍스트 작업이 이미 진행 중입니다. 현재 작업이 끝난 뒤 다시 실행해 주세요.");
      }
      return false;
    }

    activeTypoTask = task;
    try {
      await runner();
      return true;
    } finally {
      activeTypoTask = "";
    }
  }

  function getTypoTaskRunningMessage(task) {
    if (task === "highlight") {
      return "선택한 텍스트에 하이라이트를 적용하는 중입니다.";
    }
    if (task === "fix") {
      return "오타 후보를 찾아 현재 선택의 텍스트를 직접 수정하고, 고친 부분에는 주석을 남기는 중입니다.";
    }
    if (task === "clear") {
      return "현재 선택 범위에 남아 있는 AI 오타 주석을 정리하는 중입니다.";
    }
    if (task === "translate") {
      return "선택한 화면의 텍스트를 선택한 언어로 AI 번역하고 있으며, 선택이 없으면 현재 페이지 전체를 번역합니다.";
    }
    return "오타 후보를 찾고 Dev Mode 주석 또는 결과 패널로 정리하는 중입니다.";
  }

  function postTypoTaskStatus(task, status, message) {
    if (task === "highlight") {
      postTextHighlightStatus(status, message);
      return;
    }
    if (task === "fix") {
      postFixStatus(status, message);
      return;
    }
    if (task === "clear") {
      postClearStatus(status, message);
      return;
    }
    if (task === "translate") {
      postTranslateStatus(status, message);
      return;
    }
    postStatus(status, message);
  }

  function postTypoTaskError(task, message) {
    if (task === "highlight") {
      figma.ui.postMessage({
        type: "ai-text-highlight-error",
        message,
      });
      return;
    }
    if (task === "fix") {
      figma.ui.postMessage({
        type: "ai-typo-fix-error",
        message,
      });
      return;
    }
    if (task === "clear") {
      figma.ui.postMessage({
        type: "ai-typo-clear-error",
        message,
      });
      return;
    }
    if (task === "translate") {
      figma.ui.postMessage({
        type: "ai-translate-error",
        message,
      });
      return;
    }
    figma.ui.postMessage({
      type: "ai-typo-audit-error",
      message,
    });
  }

  function normalizeTypoAuditProfile(value) {
    return value === "speed" || value === "quality" ? value : "quality";
  }

  function getTypoAuditProfileLabel(profile) {
    return normalizeTypoAuditProfile(profile) === "speed" ? "속도용" : "품질용";
  }

  function getTypoAuditProfileStrategyLabel(profile, strategy) {
    const normalizedProfile = normalizeTypoAuditProfile(profile);
    if (normalizedProfile === "speed") {
      return "속도용 로컬 검수";
    }
    return strategy === "ai-primary" ? "품질용 AI 우선 + 로컬 보완" : "품질용 로컬 fallback";
  }

  async function runTypoAudit(options) {
    const auditProfile = normalizeTypoAuditProfile(options && options.auditProfile);
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    postStatus(
      "running",
      `${getTypoAuditProfileLabel(auditProfile)} 오타 후보를 찾고 Dev Mode 주석 또는 결과 패널로 정리하는 중입니다.`
    );

    try {
      const designReadResult = await readDesignReadCache();
      const result = await applyTypoAudit(designReadResult, { auditProfile });
      await writeTypoAuditCache(result);

      figma.ui.postMessage({
        type: "ai-typo-audit-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      figma.notify(
        result.summary && result.summary.mode === "figma-dev-annotation"
          ? `오타 검수 완료 (${result.summary.annotationCount}건 주석, Dev Mode에서 확인)`
          : `오타 검수 완료 (${result.summary.issueCount}건 후보, 결과 패널 확인)`,
        { timeout: 2200 }
      );
    } catch (error) {
      const message = normalizeErrorMessage(error, "오타 검수에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-typo-audit-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function runTypoFix() {
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    postFixStatus("running", "오타 후보를 찾아 현재 선택의 텍스트를 직접 수정하고, 고친 부분에는 주석을 남기는 중입니다.");

    try {
      const designReadResult = await readDesignReadCache();
      const result = await applyTypoFix(designReadResult);
      await writeTypoFixCache(result);

      figma.ui.postMessage({
        type: "ai-typo-fix-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      figma.notify(
        result.summary && result.summary.appliedCount > 0
          ? `오타 자동 수정 완료 (${result.summary.appliedCount}개 텍스트 수정, ${result.summary.annotationCount || 0}건 주석)`
          : `오타 자동 수정 완료 (${result.summary.issueCount}건 후보, 직접 수정 없음)`,
        { timeout: 2200 }
      );
    } catch (error) {
      const message = normalizeErrorMessage(error, "오타 자동 수정에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-typo-fix-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function runTypoClear() {
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    postClearStatus("running", "현재 선택 범위에 남아 있는 AI 오타 주석을 정리하는 중입니다.");

    try {
      const designReadResult = await readDesignReadCache();
      const result = await clearManagedTypoAnnotations(designReadResult);
      await writeTypoClearCache(result);

      figma.ui.postMessage({
        type: "ai-typo-clear-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      figma.notify(`오타 주석 정리 완료 (${result.summary.removedAnnotationCount || 0}건 제거)`, {
        timeout: 2200,
      });
    } catch (error) {
      const message = normalizeErrorMessage(error, "오타 주석 정리에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-typo-clear-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function runAiTranslate(message) {
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    const targetLanguage = getTranslationLanguageMetadata(message && message.targetLanguage);
    postTranslateStatus("running", `${targetLanguage.label}로 번역하는 중입니다.`);

    try {
      const designReadResult = await readDesignReadCache();
      const result = await applyAiTranslation(designReadResult, targetLanguage);
      await writeTranslateCache(result);

      figma.ui.postMessage({
        type: "ai-translate-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      figma.notify(
        result.summary && result.summary.translatedCount > 0
          ? `번역 완료 (${result.summary.translatedCount}개 텍스트, ${result.summary.targetLanguageLabel})`
          : `번역 완료 (${result.summary.textNodeCount || 0}개 확인, 변경 없음)`,
        { timeout: 2200 }
      );
    } catch (error) {
      const messageText = normalizeErrorMessage(error, "AI 번역에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-translate-error",
        message: messageText,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(messageText, { error: true, timeout: 2200 });
    }
  }

  async function postTextHighlightSource(message) {
    const requestId = message && typeof message.requestId === "string" ? message.requestId : "";
    try {
      const source = prepareTextHighlightSource();
      figma.ui.postMessage({
        type: "ai-text-highlight-source-ready",
        requestId,
        source,
      });
    } catch (error) {
      figma.ui.postMessage({
        type: "ai-text-highlight-source-error",
        requestId,
        message: normalizeErrorMessage(error, "드래그한 텍스트 범위를 먼저 선택해 주세요."),
      });
    }
  }

  function resolveTextHighlightMode(message) {
    const rawMode = message && typeof message.highlightMode === "string" ? message.highlightMode.trim().toLowerCase() : "";
    if (rawMode === "line" || rawMode === "strike") {
      return rawMode;
    }
    return "box";
  }

  async function runTextHighlight(message) {
    const highlightMode = resolveTextHighlightMode(message);
    if (highlightMode === "line") {
      await runTextHighlightLine(message);
      return;
    }
    if (highlightMode === "strike") {
      await runTextHighlightStrike(message);
      return;
    }
    await runTextHighlightBox(message);
  }

  async function runTextHighlightBox(message) {
    try {
      const range = await resolveTextHighlightRange(message);
      const parent = range.node.parent;
      const colorSnapshot = extractTextRangeColorSnapshot(range.node, range.start, range.end);
      const highlightColorHex = sanitizeHexColor(message && message.highlightColorHex, AI_TEXT_HIGHLIGHT_DEFAULT_COLOR);
      const textColorHex = sanitizeHexColor(message && message.textColorHex, colorSnapshot.hex);
      const cornerRadius = sanitizeTextHighlightRadius(
        message && message.cornerRadius,
        AI_TEXT_HIGHLIGHT_DEFAULT_RADIUS
      );
      const boxPaddingPx = sanitizeTextHighlightBoxPaddingPx(
        message && message.decorationScale,
        AI_TEXT_HIGHLIGHT_DEFAULT_BOX_PADDING_PX
      );

      if (!parent) {
        throw new Error("하이라이트를 만들 부모 레이어를 찾지 못했습니다.");
      }

      postTextHighlightStatus("running", "텍스트 하이라이트 도형을 만드는 중입니다.");

      const measurement = await measureTextHighlightBounds(range.node, range.start, range.end, textColorHex);
      let boundsList = getTextHighlightMeasurementBoundsList(measurement);
      if (!boundsList.length) {
        throw new Error("선택한 텍스트 범위를 정확히 측정하지 못했습니다. 다시 드래그한 뒤 시도해 주세요.");
      }
      if (hasMergedTextHighlightBlockBounds(boundsList, measurement.fontSize)) {
        boundsList = splitMergedTextHighlightBlockBounds(
          boundsList,
          measurement.fontSize,
          measurement.lineHeight
        );
      }
      boundsList = normalizeTextHighlightBoundsListForApply(
        range.node,
        range.start,
        range.end,
        boundsList,
        measurement.fontSize,
        measurement.lineHeight
      );
      if (!boundsList.length) {
        throw new Error("선택한 텍스트 범위의 위치를 안전하게 계산하지 못했습니다. 다시 드래그한 뒤 시도해 주세요.");
      }

      await applyTextHighlightColor(range.node, range.start, range.end, textColorHex);

      const container = prepareTextHighlightLayerContainer(parent, range.node);
      const highlightParent = container.parent;
      const nodeIndex = container.nodeIndex;
      const anchorNodeId = container.anchorNodeId || range.node.id;
      const rects = [];
      for (let index = 0; index < boundsList.length; index += 1) {
        const rect = createTextHighlightRect(
          range.node,
          highlightParent,
          boundsList[index],
          measurement.fontSize,
          highlightColorHex,
          cornerRadius,
          boxPaddingPx
        );
        rect.name = boundsList.length > 1 ? `Highlight ${index + 1}` : "Highlight";
        placeTextHighlightRectBehindNode(highlightParent, rect, anchorNodeId, nodeIndex >= 0 ? nodeIndex + index : -1);
        rects.push(rect);
      }
      finalizeTextHighlightLayerContainer(highlightParent, range.node, container);

      const group = groupTextHighlightSelection(highlightParent, range.node, rects, nodeIndex, container);

      figma.ui.postMessage({
        type: "ai-text-highlight-result",
        result: {
          groupId: group.id,
          groupName: group.name,
          nodeId: range.node.id,
          selectionLabel: safeName(range.node),
          textPreview: compactText(range.text) || previewText(range.text, 72),
          highlightColorHex,
          textColorHex,
          rectCount: rects.length,
          mode: "box",
        },
      });
      figma.notify("박스형 텍스트 하이라이트를 만들었습니다.", { timeout: 2200 });
    } catch (error) {
      const messageText = normalizeErrorMessage(error, "텍스트 하이라이트를 적용하지 못했습니다.");
      figma.ui.postMessage({
        type: "ai-text-highlight-error",
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2200 });
    }
  }

  async function runTextHighlightLine(message) {
    try {
      const range = await resolveTextHighlightRange(message);
      const parent = range.node.parent;
      const colorSnapshot = extractTextRangeColorSnapshot(range.node, range.start, range.end);
      const fontSize = getTextRangeFontSize(range.node, range.start, range.end);
      const lineHeight = getTextRangeLineHeight(range.node, range.start, range.end, fontSize);
      const highlightColorHex = sanitizeHexColor(message && message.highlightColorHex, AI_TEXT_HIGHLIGHT_DEFAULT_COLOR);
      const textColorHex = sanitizeHexColor(message && message.textColorHex, colorSnapshot.hex);
      const decorationScale = sanitizeTextHighlightDecorationScale(
        message && message.decorationScale,
        buildTextHighlightAutoDecorationScale(fontSize, "line", lineHeight)
      );
      const lineCapRadius = sanitizeTextHighlightRadius(
        message && message.strikeCapRadius,
        AI_TEXT_HIGHLIGHT_DEFAULT_STRIKE_RADIUS
      );

      if (!parent) {
        throw new Error("하이라이트를 만들 부모 레이어를 찾지 못했습니다.");
      }

      postTextHighlightStatus("running", "라인형 하이라이트를 만드는 중입니다.");

      const measurement = await measureTextHighlightBounds(range.node, range.start, range.end, textColorHex);
      let boundsList = getTextHighlightMeasurementBoundsList(measurement);
      if (!boundsList.length) {
        throw new Error("선택한 텍스트 범위를 정확히 측정하지 못했습니다. 다시 드래그한 뒤 시도해 주세요.");
      }
      if (hasMergedTextHighlightBlockBounds(boundsList, measurement.fontSize)) {
        boundsList = splitMergedTextHighlightBlockBounds(
          boundsList,
          measurement.fontSize,
          measurement.lineHeight
        );
      }
      boundsList = normalizeTextHighlightBoundsListForApply(
        range.node,
        range.start,
        range.end,
        boundsList,
        measurement.fontSize,
        measurement.lineHeight
      );
      if (!boundsList.length) {
        throw new Error("선택한 텍스트 범위의 위치를 안전하게 계산하지 못했습니다. 다시 드래그한 뒤 시도해 주세요.");
      }

      clearTextHighlightDecoration(range.node, range.start, range.end);
      await applyTextHighlightColor(range.node, range.start, range.end, textColorHex);

      const container = prepareTextHighlightLayerContainer(parent, range.node);
      const highlightParent = container.parent;
      const nodeIndex = container.nodeIndex;
      const anchorNodeId = container.anchorNodeId || range.node.id;
      const rects = [];
      const thickness = buildTextHighlightDecorationThickness(measurement.fontSize, "line", decorationScale);
      for (let index = 0; index < boundsList.length; index += 1) {
        const rect = createTextHighlightLineRect(
          range.node,
          highlightParent,
          boundsList[index],
          measurement.fontSize,
          thickness,
          highlightColorHex,
          lineCapRadius
        );
        rect.name = boundsList.length > 1 ? `Line Highlight ${index + 1}` : "Line Highlight";
        placeTextHighlightRectBehindNode(highlightParent, rect, anchorNodeId, nodeIndex >= 0 ? nodeIndex + index : -1);
        rects.push(rect);
      }
      finalizeTextHighlightLayerContainer(highlightParent, range.node, container);

      const group = groupTextHighlightSelection(highlightParent, range.node, rects, nodeIndex, container);

      figma.ui.postMessage({
        type: "ai-text-highlight-result",
        result: {
          groupId: group.id,
          groupName: group.name,
          nodeId: range.node.id,
          selectionLabel: safeName(range.node),
          textPreview: compactText(range.text) || previewText(range.text, 72),
          highlightColorHex,
          textColorHex,
          rectCount: rects.length,
          mode: "line",
        },
      });
      figma.notify("라인형 텍스트 하이라이트를 만들었습니다.", { timeout: 2200 });
    } catch (error) {
      const messageText = normalizeErrorMessage(error, "텍스트 하이라이트를 적용하지 못했습니다.");
      figma.ui.postMessage({
        type: "ai-text-highlight-error",
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2200 });
    }
  }

  async function runTextHighlightStrike(message) {
    try {
      const range = await resolveTextHighlightRange(message);
      const parent = range.node.parent;
      const colorSnapshot = extractTextRangeColorSnapshot(range.node, range.start, range.end);
      const fontSize = getTextRangeFontSize(range.node, range.start, range.end);
      const lineHeight = getTextRangeLineHeight(range.node, range.start, range.end, fontSize);
      const highlightColorHex = sanitizeHexColor(message && message.highlightColorHex, AI_TEXT_HIGHLIGHT_DEFAULT_COLOR);
      const textColorHex = sanitizeHexColor(message && message.textColorHex, colorSnapshot.hex);
      const decorationScale = sanitizeTextHighlightDecorationScale(
        message && message.decorationScale,
        buildTextHighlightAutoDecorationScale(fontSize, "strike", lineHeight)
      );
      const strikeCapRadius = sanitizeTextHighlightRadius(
        message && message.strikeCapRadius,
        AI_TEXT_HIGHLIGHT_DEFAULT_STRIKE_RADIUS
      );

      if (!parent) {
        throw new Error("하이라이트를 만들 부모 레이어를 찾지 못했습니다.");
      }

      postTextHighlightStatus("running", "취소선형 하이라이트 라인을 만드는 중입니다.");

      const measurement = await measureTextHighlightBounds(range.node, range.start, range.end, textColorHex);
      let boundsList = getTextHighlightMeasurementBoundsList(measurement);
      if (!boundsList.length) {
        throw new Error("선택한 텍스트 범위를 정확히 측정하지 못했습니다. 다시 드래그한 뒤 시도해 주세요.");
      }
      if (hasMergedTextHighlightBlockBounds(boundsList, measurement.fontSize)) {
        boundsList = splitMergedTextHighlightBlockBounds(
          boundsList,
          measurement.fontSize,
          measurement.lineHeight
        );
      }
      boundsList = normalizeTextHighlightBoundsListForApply(
        range.node,
        range.start,
        range.end,
        boundsList,
        measurement.fontSize,
        measurement.lineHeight
      );
      if (!boundsList.length) {
        throw new Error("선택한 텍스트 범위의 위치를 안전하게 계산하지 못했습니다. 다시 드래그한 뒤 시도해 주세요.");
      }

      clearTextHighlightDecoration(range.node, range.start, range.end);
      await applyTextHighlightColor(range.node, range.start, range.end, textColorHex);

      const container = prepareTextHighlightLayerContainer(parent, range.node);
      const highlightParent = container.parent;
      const nodeIndex = container.nodeIndex;
      const anchorNodeId = container.anchorNodeId || range.node.id;
      const rects = [];
      const thickness = buildTextHighlightDecorationThickness(measurement.fontSize, "strike", decorationScale);
      for (let index = 0; index < boundsList.length; index += 1) {
        const rect = createTextHighlightStrikeRect(
          range.node,
          highlightParent,
          boundsList[index],
          measurement.fontSize,
          thickness,
          highlightColorHex,
          strikeCapRadius
        );
        rect.name = boundsList.length > 1 ? `Strike Highlight ${index + 1}` : "Strike Highlight";
        placeTextHighlightRectBehindNode(highlightParent, rect, anchorNodeId, nodeIndex >= 0 ? nodeIndex + index : -1);
        rects.push(rect);
      }
      finalizeTextHighlightLayerContainer(highlightParent, range.node, container);

      const group = groupTextHighlightSelection(highlightParent, range.node, rects, nodeIndex, container);

      figma.ui.postMessage({
        type: "ai-text-highlight-result",
        result: {
          groupId: group.id,
          groupName: group.name,
          nodeId: range.node.id,
          selectionLabel: safeName(range.node),
          textPreview: compactText(range.text) || previewText(range.text, 72),
          highlightColorHex,
          textColorHex,
          rectCount: rects.length,
          mode: "strike",
        },
      });
      figma.notify("취소선형 텍스트 하이라이트를 만들었습니다.", { timeout: 2200 });
    } catch (error) {
      const messageText = normalizeErrorMessage(error, "텍스트 하이라이트를 적용하지 못했습니다.");
      figma.ui.postMessage({
        type: "ai-text-highlight-error",
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2200 });
    }
  }

  async function runTextHighlightNative(message, highlightMode) {
    try {
      const resolvedMode = highlightMode === "strike" ? "strike" : "line";
      const range = await resolveTextHighlightRange(message);
      const colorSnapshot = extractTextRangeColorSnapshot(range.node, range.start, range.end);
      const highlightColorHex = sanitizeHexColor(message && message.highlightColorHex, AI_TEXT_HIGHLIGHT_DEFAULT_COLOR);
      const textColorHex = sanitizeHexColor(message && message.textColorHex, colorSnapshot.hex);
      const decorationScale = sanitizeTextHighlightDecorationScale(
        message && message.decorationScale,
        AI_TEXT_HIGHLIGHT_DEFAULT_DECORATION_SCALE
      );

      postTextHighlightStatus("running", "텍스트 하이라이트를 적용하는 중입니다.");
      await applyTextHighlightDecoration(range.node, range.start, range.end, highlightColorHex, resolvedMode, decorationScale);
      await applyTextHighlightColor(range.node, range.start, range.end, textColorHex);
      figma.currentPage.selection = [range.node];
      figma.viewport.scrollAndZoomIntoView([range.node]);

      figma.ui.postMessage({
        type: "ai-text-highlight-result",
        result: {
          groupId: "",
          groupName: "",
          nodeId: range.node.id,
          selectionLabel: safeName(range.node),
          textPreview: compactText(range.text) || previewText(range.text, 72),
          highlightColorHex,
          textColorHex,
          mode: resolvedMode,
        },
      });
      figma.notify(
        resolvedMode === "strike" ? "취소선형 텍스트 하이라이트를 적용했습니다." : "라인형 텍스트 하이라이트를 적용했습니다.",
        { timeout: 2200 }
      );
    } catch (error) {
      const messageText = normalizeErrorMessage(error, "텍스트 하이라이트를 적용하지 못했습니다.");
      figma.ui.postMessage({
        type: "ai-text-highlight-error",
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2200 });
    }
  }

  function clearTextHighlightDecoration(node, start, end) {
    if (!node || typeof node.setRangeTextDecoration !== "function") {
      return;
    }

    try {
      node.setRangeTextDecoration(start, end, "NONE");
    } catch (error) {}
  }

  async function applyTextHighlightDecoration(node, start, end, highlightColorHex, highlightMode, decorationScale) {
    if (!node || node.type !== "TEXT") {
      throw new Error("텍스트 하이라이트를 적용할 텍스트 레이어를 찾지 못했습니다.");
    }

    if (typeof node.setRangeTextDecoration !== "function") {
      throw new Error("현재 Figma 버전에서는 텍스트 데코 하이라이트를 지원하지 않습니다.");
    }

    try {
      await loadFontsForTextNode(node);
    } catch (error) {}

    const fontSize = getTextRangeFontSize(node, start, end);
    const resolvedMode = highlightMode === "strike" ? "strike" : "line";
    const resolvedScale = sanitizeTextHighlightDecorationScale(decorationScale, AI_TEXT_HIGHLIGHT_DEFAULT_DECORATION_SCALE);
    const thicknessValue = buildTextHighlightDecorationThickness(fontSize, resolvedMode, resolvedScale);
    const offsetValue = buildTextHighlightDecorationOffset(fontSize, resolvedMode, resolvedScale, thicknessValue);
    const decorationKind = resolvedMode === "strike" ? "STRIKETHROUGH" : "UNDERLINE";

    node.setRangeTextDecoration(start, end, decorationKind);

    if (typeof node.setRangeTextDecorationStyle === "function") {
      try {
        node.setRangeTextDecorationStyle(start, end, "SOLID");
      } catch (error) {}
    }

    if (typeof node.setRangeTextDecorationColor === "function") {
      try {
        node.setRangeTextDecorationColor(start, end, {
          value: createSolidPaint(highlightColorHex),
        });
      } catch (error) {}
    }

    if (typeof node.setRangeTextDecorationSkipInk === "function") {
      try {
        node.setRangeTextDecorationSkipInk(start, end, false);
      } catch (error) {}
    }

    if (typeof node.setRangeTextDecorationThickness === "function") {
      try {
        node.setRangeTextDecorationThickness(start, end, {
          unit: "PIXELS",
          value: thicknessValue,
        });
      } catch (error) {}
    }

    if (typeof node.setRangeTextDecorationOffset === "function") {
      try {
        node.setRangeTextDecorationOffset(start, end, {
          unit: "PIXELS",
          value: offsetValue,
        });
      } catch (error) {}
    }
  }

  function buildTextHighlightDecorationThickness(fontSize, highlightMode, decorationScale) {
    const size = Math.max(12, Number(fontSize) || 16);
    const scale = sanitizeTextHighlightDecorationScale(decorationScale, AI_TEXT_HIGHLIGHT_DEFAULT_DECORATION_SCALE);
    if (highlightMode === "strike") {
      return roundTextHighlightThickness(Math.max(3, Math.min(size * 1.45, size * 0.22 * scale)));
    }
    return roundTextHighlightThickness(Math.max(2, Math.min(36, size * 0.1 * scale)));
  }

  function buildTextHighlightAutoDecorationScale(fontSize, highlightMode, lineHeight) {
    const size = Math.max(12, Number(fontSize) || 16);
    const mode = highlightMode === "line" ? "line" : "strike";
    const baseThickness = buildTextHighlightDecorationThickness(size, mode, 1);
    if (mode === "strike") {
      const targetThickness = buildTextHighlightMinimumBoxThickness(size, lineHeight);
      return Math.max(1, Math.min(10, Math.ceil(targetThickness / Math.max(1, baseThickness))));
    }

    const targetThickness = Math.max(2, Math.min(14, size * 0.1));
    return sanitizeTextHighlightDecorationScale(
      targetThickness / Math.max(1, baseThickness),
      AI_TEXT_HIGHLIGHT_DEFAULT_DECORATION_SCALE
    );
  }

  function buildTextHighlightMinimumBoxThickness(fontSize, lineHeight) {
    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    return ceilTextHighlightThickness(Math.max(size * 0.78, Math.min(resolvedLineHeight, size)));
  }

  function buildTextHighlightDecorationOffset(fontSize, highlightMode, decorationScale, thicknessValue) {
    const size = Math.max(12, Number(fontSize) || 16);
    if (highlightMode === "strike") {
      return roundTextHighlightMetric(0);
    }

    const scale = sanitizeTextHighlightDecorationScale(decorationScale, AI_TEXT_HIGHLIGHT_DEFAULT_DECORATION_SCALE);
    const thickness =
      Number(thicknessValue) > 0
        ? Number(thicknessValue)
        : buildTextHighlightDecorationThickness(size, highlightMode, scale);
    const baseThickness = buildTextHighlightDecorationThickness(size, highlightMode, 1);
    const baseCenterOffset = Math.max(3, Math.min(14, size * 0.2));
    const fixedBottomOffset = baseCenterOffset + baseThickness / 2;
    const centeredOffset = fixedBottomOffset - thickness / 2;
    return roundTextHighlightMetric(Math.max(-size * 0.35, Math.min(baseCenterOffset, centeredOffset)));
  }

  function getManagedAnnotationCategoryColor() {
    return ANNOTATION_CATEGORY_COLOR;
  }

  async function postCachedTypoAuditResult() {
    const result = await readTypoAuditCache();
    figma.ui.postMessage({
      type: "ai-typo-audit-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  async function postCachedTypoFixResult() {
    const result = await readTypoFixCache();
    figma.ui.postMessage({
      type: "ai-typo-fix-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  async function postCachedTypoClearResult() {
    const result = await readTypoClearCache();
    figma.ui.postMessage({
      type: "ai-typo-clear-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  async function postCachedTranslateResult() {
    const result = await readTranslateCache();
    figma.ui.postMessage({
      type: "ai-translate-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-typo-audit-status",
      status,
      message,
    });
  }

  function postFixStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-typo-fix-status",
      status,
      message,
    });
  }

  function postClearStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-typo-clear-status",
      status,
      message,
    });
  }

  function postTranslateStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-translate-status",
      status,
      message,
    });
  }

  function postTextHighlightStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-text-highlight-status",
      status,
      message,
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

  async function readTypoAuditCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_TYPO_AUDIT_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function readTypoFixCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_TYPO_FIX_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function readTypoClearCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_TYPO_CLEAR_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function readTranslateCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_TRANSLATE_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function readTranslateMemory() {
    try {
      return normalizeTranslateMemory(await figma.clientStorage.getAsync(AI_TRANSLATE_MEMORY_KEY));
    } catch (error) {
      return [];
    }
  }

  async function writeTypoAuditCache(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    try {
      await figma.clientStorage.setAsync(AI_TYPO_AUDIT_CACHE_KEY, result);
    } catch (error) {}

    return result;
  }

  async function writeTypoFixCache(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    try {
      await figma.clientStorage.setAsync(AI_TYPO_FIX_CACHE_KEY, result);
    } catch (error) {}

    return result;
  }

  async function writeTypoClearCache(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    try {
      await figma.clientStorage.setAsync(AI_TYPO_CLEAR_CACHE_KEY, result);
    } catch (error) {}

    return result;
  }

  async function writeTranslateCache(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    try {
      await figma.clientStorage.setAsync(AI_TRANSLATE_CACHE_KEY, result);
    } catch (error) {}

    return result;
  }

  async function writeTranslateMemory(entries) {
    const normalized = normalizeTranslateMemory(entries);
    try {
      await figma.clientStorage.setAsync(AI_TRANSLATE_MEMORY_KEY, normalized);
    } catch (error) {}
    return normalized;
  }

  function matchesCurrentSelection(result) {
    return !!result && result.selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  function matchesSelectionSignature(selectionSignature) {
    return typeof selectionSignature === "string" && selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  async function readProofingSettings() {
    const ai = getAiHelper();
    if (!ai || typeof ai.getAiSettingsAsync !== "function") {
      return normalizeProofingSettings(null);
    }

    try {
      return normalizeProofingSettings(await ai.getAiSettingsAsync());
    } catch (error) {
      return normalizeProofingSettings(null);
    }
  }

  function normalizeProofingSettings(value) {
    const source = value && typeof value === "object" ? value : {};
    const userDictionary = normalizeTermList(source.userDictionary);
    const protectedTerms = normalizeTermList(source.protectedTerms);
    const proofingLocale = normalizeKnownProofingLocale(source.proofingLocale);
    const localeMeta = getProofingLocaleMetadata(proofingLocale);
    return {
      proofingLocale,
      proofingLocaleLabel: localeMeta ? localeMeta.label : "",
      proofingLocaleAiLabel: localeMeta ? localeMeta.aiLabel : "",
      preferredLatinLocaleHint: localeMeta ? localeMeta.latinLocaleHint : "",
      userDictionary,
      protectedTerms,
      exactBlockedSet: new Set(userDictionary.concat(protectedTerms).map((term) => compactText(term).toLocaleLowerCase())),
      protectedTermsLower: protectedTerms.map((term) => term.toLocaleLowerCase()),
      userDictionaryLower: userDictionary.map((term) => term.toLocaleLowerCase()),
    };
  }

  function normalizeTermList(value) {
    const source = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(/\r?\n|,/)
        : [];
    const normalized = [];
    const seen = new Set();

    for (const entry of source) {
      const term = String(entry || "").replace(/\s+/g, " ").trim();
      if (!term) {
        continue;
      }

      const key = term.toLocaleLowerCase();
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      normalized.push(term);
    }

    return normalized.slice(0, 200);
  }

  function normalizeKnownProofingLocale(value) {
    const compact = String(value || "")
      .replace(/[^A-Za-z-]/g, "")
      .trim();
    if (!compact) {
      return "";
    }

    const parts = compact.split("-").filter(Boolean);
    let normalized = "";
    if (parts.length === 1 && /^[A-Za-z]{2,3}$/.test(parts[0])) {
      normalized = parts[0].toLowerCase();
    } else if (parts.length === 2 && /^[A-Za-z]{2,3}$/.test(parts[0]) && /^[A-Za-z]{2,4}$/.test(parts[1])) {
      normalized = `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
    }

    return normalized && Object.prototype.hasOwnProperty.call(PROOFING_LOCALE_METADATA, normalized) ? normalized : "";
  }

  function getProofingLocaleMetadata(locale) {
    if (!locale || !Object.prototype.hasOwnProperty.call(PROOFING_LOCALE_METADATA, locale)) {
      return null;
    }

    return Object.assign(
      {
        code: locale,
      },
      PROOFING_LOCALE_METADATA[locale]
    );
  }

  function getTranslationLanguageMetadata(code) {
    const normalized = typeof code === "string" ? code.trim() : "";
    const fallback = "en-US";
    const resolved = normalized && Object.prototype.hasOwnProperty.call(TRANSLATION_LANGUAGE_METADATA, normalized) ? normalized : fallback;
    return Object.assign(
      {
        code: resolved,
      },
      TRANSLATION_LANGUAGE_METADATA[resolved]
    );
  }

  function isWholeTextProtected(text, proofingSettings) {
    if (!proofingSettings || !(proofingSettings.exactBlockedSet instanceof Set)) {
      return false;
    }

    const key = compactText(text).toLocaleLowerCase();
    return !!key && proofingSettings.exactBlockedSet.has(key);
  }

  function issueRespectsProofingTerms(currentText, suggestion, proofingSettings) {
    if (!proofingSettings) {
      return true;
    }

    if (isWholeTextProtected(currentText, proofingSettings)) {
      return false;
    }

    const currentValue = normalizeLineEndings(currentText);
    const suggestionValue = normalizeLineEndings(suggestion);
    if (!currentValue || !suggestionValue) {
      return true;
    }

    const guardedTerms = normalizeTermList(
      []
        .concat(proofingSettings.userDictionary || [])
        .concat(proofingSettings.protectedTerms || [])
    );

    for (const term of guardedTerms) {
      const currentExactCount = countTermOccurrences(currentValue, term, false);
      if (currentExactCount > 0) {
        if (countTermOccurrences(suggestionValue, term, false) < currentExactCount) {
          return false;
        }
        continue;
      }

      const currentLooseCount = countTermOccurrences(currentValue, term, true);
      if (currentLooseCount > countTermOccurrences(suggestionValue, term, true)) {
        return false;
      }
    }

    return true;
  }

  function filterIssuesForProofing(issues, proofingSettings) {
    if (!Array.isArray(issues) || !issues.length) {
      return [];
    }

    return issues.filter((issue) => {
      if (!issue || typeof issue !== "object") {
        return false;
      }

      return (
        !isWholeTextProtected(issue.currentText, proofingSettings) &&
        issueRespectsProofingTerms(issue.currentText, issue.suggestion, proofingSettings) &&
        changeMatchesCorrectionPolicy(issue.currentText, issue.suggestion, issue.kind)
      );
    });
  }

  function changeMatchesCorrectionPolicy(currentText, suggestion, kind) {
    const currentValue = normalizeLineEndings(currentText);
    const suggestionValue = normalizeLineEndings(suggestion);
    if (!currentValue || !suggestionValue || currentValue === suggestionValue) {
      return false;
    }

    const kindLabels = getAnnotationKindLabels({
      currentText: currentValue,
      suggestion: suggestionValue,
      kind,
    });
    if (kindLabels.includes("용어 통일")) {
      return false;
    }

    if (countTextLines(currentValue) !== countTextLines(suggestionValue)) {
      return false;
    }

    if (isLowSignalCosmeticCorrection(currentValue, suggestionValue, kindLabels)) {
      return false;
    }

    if (isSpacingOrPunctuationOnlyCorrection(currentValue, suggestionValue)) {
      return looksLikeCriticalBrokenLatinSpacing(currentValue, suggestionValue);
    }

    const currentFamilies = getActiveScriptFamilies(currentValue);
    const suggestionFamilies = getActiveScriptFamilies(suggestionValue);
    if (!areScriptFamiliesCompatible(currentFamilies, suggestionFamilies)) {
      return false;
    }

    return tokensLookLikeMinorCorrections(currentValue, suggestionValue, kindLabels);
  }

  function isLowSignalCosmeticCorrection(currentText, suggestion, kindLabels) {
    const currentValue = normalizeLineEndings(currentText);
    const suggestionValue = normalizeLineEndings(suggestion);
    if (!currentValue || !suggestionValue || currentValue === suggestionValue) {
      return false;
    }

    if (!containsSubstantiveText(currentValue) && !containsSubstantiveText(suggestionValue)) {
      return true;
    }

    if (
      stripCosmeticCharacters(currentValue) === stripCosmeticCharacters(suggestionValue) &&
      !looksLikeCriticalBrokenLatinSpacing(currentValue, suggestionValue)
    ) {
      return true;
    }

    if (Array.isArray(kindLabels) && kindLabels.includes("띄어쓰기") && !looksLikeCriticalBrokenLatinSpacing(currentValue, suggestionValue)) {
      return true;
    }

    return false;
  }

  function isSpacingOrPunctuationOnlyCorrection(currentText, suggestion) {
    const currentTokens = tokenizeScriptTokens(currentText);
    const suggestionTokens = tokenizeScriptTokens(suggestion);
    if (!currentTokens.length || !suggestionTokens.length) {
      return false;
    }

    return flattenComparableTokens(currentTokens) === flattenComparableTokens(suggestionTokens);
  }

  function containsSubstantiveText(value) {
    return /[0-9A-Za-z\u00C0-\u024F\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0900-\u097F\u0E00-\u0E7F\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/.test(
      String(value || "")
    );
  }

  function stripCosmeticCharacters(value) {
    return String(value || "")
      .replace(/[\s()[\]{}<>.,;:!?"'`~\-_/\\]+/g, "")
      .trim();
  }

  function looksLikeCriticalBrokenLatinSpacing(currentText, suggestion) {
    const currentValue = normalizeLineEndings(currentText);
    const suggestionValue = normalizeLineEndings(suggestion);
    if (!currentValue || !suggestionValue || currentValue === suggestionValue) {
      return false;
    }

    if (!/\s/.test(currentValue) || /\s/.test(suggestionValue)) {
      return false;
    }

    const currentWords = getLatinWordRuns(currentValue);
    const suggestionWords = getLatinWordRuns(suggestionValue);
    if (currentWords.length < 2 || suggestionWords.length !== 1) {
      return false;
    }

    const joinedCurrent = normalizeLatinTokenForLookup(currentWords.join(""));
    const joinedSuggestion = normalizeLatinTokenForLookup(suggestionWords[0]);
    if (!joinedCurrent || !joinedSuggestion || joinedCurrent !== joinedSuggestion) {
      return false;
    }

    if (joinedSuggestion.length < 5) {
      return false;
    }

    let hasSuspiciousShortFragment = false;
    for (const word of currentWords) {
      if (word.length <= 2) {
        const normalizedWord = normalizeLatinTokenForLookup(word);
        if (normalizedWord && !LATIN_COMMON_SHORT_WORDS.has(normalizedWord)) {
          hasSuspiciousShortFragment = true;
          break;
        }
      }
    }

    if (hasSuspiciousShortFragment) {
      return true;
    }

    return currentWords.length >= 3 && currentWords.some((word) => word.length === 1);
  }

  function getLatinWordRuns(value) {
    const matches = String(value || "").match(/[A-Za-z\u00C0-\u024F]+/g);
    return Array.isArray(matches) ? matches : [];
  }

  function areScriptFamiliesCompatible(currentFamilies, suggestionFamilies) {
    if (!currentFamilies.length || !suggestionFamilies.length) {
      return true;
    }

    for (const family of suggestionFamilies) {
      if (!currentFamilies.includes(family)) {
        return false;
      }
    }

    if (currentFamilies.length > 1) {
      for (const family of currentFamilies) {
        if (!suggestionFamilies.includes(family)) {
          return false;
        }
      }
    }

    return true;
  }

  function tokensLookLikeMinorCorrections(currentText, suggestion, kindLabels) {
    const currentTokens = tokenizeScriptTokens(currentText);
    const suggestionTokens = tokenizeScriptTokens(suggestion);
    const latinLocaleHint = inferLatinLocaleHint(currentText);
    if (!currentTokens.length || !suggestionTokens.length) {
      return assessDirectReplacementSafety(currentText, suggestion).safe;
    }

    if (flattenComparableTokens(currentTokens) === flattenComparableTokens(suggestionTokens)) {
      return true;
    }

    if (currentTokens.length !== suggestionTokens.length) {
      return false;
    }

    let changedCount = 0;
    let totalDistance = 0;
    for (let index = 0; index < currentTokens.length; index += 1) {
      const currentToken = currentTokens[index];
      const suggestionToken = suggestionTokens[index];
      if (currentToken.family !== suggestionToken.family) {
        return false;
      }

      if (currentToken.normalized === suggestionToken.normalized) {
        continue;
      }

      if (looksLikeLocaleSwap(currentToken, suggestionToken)) {
        return false;
      }

      const distance = getEditDistance(currentToken.normalized, suggestionToken.normalized);
      if (!isMinorTokenEdit(currentToken, suggestionToken, kindLabels, distance, latinLocaleHint)) {
        return false;
      }

      changedCount += 1;
      totalDistance += distance;
    }

    if (changedCount === 0) {
      return false;
    }

    const editBudget =
      currentTokens.length <= 4
        ? Math.max(6, currentTokens.length * 2)
        : Math.max(8, Math.ceil(currentTokens.length * 2.2));
    return totalDistance <= editBudget;
  }

  function isMinorTokenEdit(currentToken, suggestionToken, kindLabels, precomputedDistance, latinLocaleHint) {
    const currentValue = currentToken && currentToken.normalized ? currentToken.normalized : "";
    const suggestionValue = suggestionToken && suggestionToken.normalized ? suggestionToken.normalized : "";
    if (!currentValue || !suggestionValue) {
      return false;
    }

    const maxLength = Math.max(currentValue.length, suggestionValue.length, 1);
    const minLength = Math.max(1, Math.min(currentValue.length, suggestionValue.length));
    const distance =
      typeof precomputedDistance === "number" && Number.isFinite(precomputedDistance)
        ? precomputedDistance
        : getEditDistance(currentValue, suggestionValue);
    const similarity = 1 - distance / maxLength;
    const grammarMode = Array.isArray(kindLabels) && kindLabels.includes("문법");

    let allowedDistance = grammarMode ? 3 : 2;
    if (maxLength <= 4) {
      allowedDistance = grammarMode ? 2 : 1;
    } else if (maxLength >= 12) {
      allowedDistance = grammarMode ? 5 : 4;
    } else if (maxLength >= 8) {
      allowedDistance = grammarMode ? 4 : 3;
    }

    if (distance > allowedDistance) {
      return false;
    }

    if (minLength / maxLength < (grammarMode ? 0.5 : 0.62)) {
      return false;
    }

    if (similarity < (grammarMode ? 0.35 : 0.5)) {
      return false;
    }

    if (shouldRejectConservativeLatinWordSwap(currentToken, suggestionToken, kindLabels, distance, latinLocaleHint)) {
      return false;
    }

    if (currentToken.family === "latin" && currentValue.length > 2 && suggestionValue.length > 2) {
      if (currentValue[0] !== suggestionValue[0] && currentValue.slice(0, 2) !== suggestionValue.slice(0, 2)) {
        return false;
      }
    }

    return true;
  }

  function looksLikeLocaleSwap(currentToken, suggestionToken) {
    if (!currentToken || !suggestionToken || currentToken.family !== "latin" || suggestionToken.family !== "latin") {
      return false;
    }

    const currentValue = currentToken.normalized;
    const suggestionValue = suggestionToken.normalized;
    if (!currentValue || !suggestionValue || currentValue === suggestionValue) {
      return false;
    }

    return LATIN_UI_TOKEN_SET.has(currentValue) && LATIN_UI_TOKEN_SET.has(suggestionValue);
  }

  function shouldRejectConservativeLatinWordSwap(currentToken, suggestionToken, kindLabels, distance, latinLocaleHint) {
    if (!currentToken || !suggestionToken || currentToken.family !== "latin" || suggestionToken.family !== "latin") {
      return false;
    }

    const currentValue = currentToken.normalized;
    const suggestionValue = suggestionToken.normalized;
    if (!currentValue || !suggestionValue || currentValue === suggestionValue || distance <= 1) {
      return false;
    }

    if (!/^[a-z]+$/.test(currentValue) || !/^[a-z]+$/.test(suggestionValue)) {
      return false;
    }

    if (Array.isArray(kindLabels) && kindLabels.includes("臾몃쾿")) {
      return false;
    }

    return !isKnownLatinReferenceToken(currentValue, latinLocaleHint) && !isKnownLatinReferenceToken(suggestionValue, latinLocaleHint);
  }

  function isKnownLatinReferenceToken(value, latinLocaleHint) {
    const normalized = normalizeLatinTokenForLookup(value);
    if (!normalized) {
      return false;
    }

    if (LATIN_UI_TOKEN_SET.has(normalized)) {
      return true;
    }

    const hintPool = getLatinTokenHintPool(latinLocaleHint);
    for (const token of hintPool) {
      if (normalizeLatinTokenForLookup(token) === normalized) {
        return true;
      }
    }

    return false;
  }

  function flattenComparableTokens(tokens) {
    return (Array.isArray(tokens) ? tokens : []).map((token) => token.normalized).join("");
  }

  function tokenizeScriptTokens(text) {
    const tokens = [];
    let buffer = "";
    let family = "";

    const flush = () => {
      if (!buffer || !family) {
        buffer = "";
        family = "";
        return;
      }

      const normalized = normalizeTokenForComparison(buffer, family);
      if (normalized) {
        tokens.push({
          text: buffer,
          family,
          normalized,
        });
      }

      buffer = "";
      family = "";
    };

    for (const character of normalizeLineEndings(text)) {
      const charFamily = detectCharacterScriptFamily(character);
      if (!charFamily) {
        if (buffer && /[0-9'’\-]/.test(character)) {
          buffer += character;
          continue;
        }

        flush();
        continue;
      }

      if (!buffer) {
        buffer = character;
        family = charFamily;
        continue;
      }

      if (charFamily === family) {
        buffer += character;
        continue;
      }

      flush();
      buffer = character;
      family = charFamily;
    }

    flush();
    return tokens;
  }

  function normalizeTokenForComparison(value, family) {
    const source = String(value || "").trim();
    if (!source) {
      return "";
    }

    if (family === "latin") {
      return normalizeLatinTokenForLookup(source);
    }

    return source.replace(/[\s'’\-]/g, "");
  }

  function getActiveScriptFamilies(text) {
    const counts = {
      korean: 0,
      latin: 0,
      japanese: 0,
      cjk: 0,
      cyrillic: 0,
      arabic: 0,
      devanagari: 0,
      thai: 0,
      hebrew: 0,
      greek: 0,
      other: 0,
    };
    addScriptCounts(counts, text);
    return Object.keys(counts).filter((key) => key !== "other" && counts[key] > 0);
  }

  function countTermOccurrences(text, term, caseInsensitive) {
    const source = String(normalizeLineEndings(text) || "");
    const needle = String(term || "");
    if (!source || !needle) {
      return 0;
    }

    const haystack = caseInsensitive ? source.toLocaleLowerCase() : source;
    const target = caseInsensitive ? needle.toLocaleLowerCase() : needle;
    if (!target) {
      return 0;
    }

    let count = 0;
    let index = 0;
    while (index <= haystack.length) {
      const nextIndex = haystack.indexOf(target, index);
      if (nextIndex < 0) {
        break;
      }

      count += 1;
      index = nextIndex + target.length;
    }

    return count;
  }

  async function applyTypoAudit(designReadResult, options) {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const auditProfile = normalizeTypoAuditProfile(options && options.auditProfile);
    const proofingSettings = await readProofingSettings();
    const context = buildSelectionContext(selection, designReadResult, proofingSettings);
    const textNodes = collectTextNodes(selection);
    if (!textNodes.length) {
      throw new Error("텍스트 레이어가 포함된 선택을 먼저 선택하세요.");
    }

    const issueResult = await buildTypoIssues(textNodes, context, proofingSettings, { auditProfile });
    const issues = issueResult.issues.slice(0, 24);
    const annotationNodes = getAnnotatableTextNodes(textNodes);
    const annotationSupported = annotationNodes.length > 0;
    const category = annotationSupported ? await ensureAnnotationCategory(getManagedAnnotationCategoryColor()) : null;
    const applied = annotationSupported
      ? applyAnnotations(annotationNodes, issues, category)
      : buildResultOnlyApplication(
          issues,
          "현재 환경에서는 Figma Annotation API를 사용할 수 없어 결과 패널에만 표시했습니다."
        );
    if (issueResult.aiError) {
      applied.skipped.unshift({
        label: "AI 검수 경고",
        reason: issueResult.aiError,
      });
    }
    const auditUsesAnnotations = applied.annotationCount > 0;
    const insights = buildInsights(context, textNodes, issues, applied, auditUsesAnnotations, issueResult.aiMeta);

    return {
      version: PATCH_VERSION,
      source:
        issueResult.strategy === "ai-primary"
          ? "ai-primary-annotation"
          : issueResult.strategy === "speed-local"
            ? "speed-local-annotation"
            : "local-fallback-annotation",
      mode: auditUsesAnnotations ? "figma-dev-annotation" : "result-only",
      selectionSignature: getSelectionSignature(selection),
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: context.selectionLabel,
        contextLabel: context.contextLabel,
        textNodeCount: textNodes.length,
        issueCount: issues.length,
        annotatedNodeCount: applied.annotatedNodeCount,
        annotationCount: applied.annotationCount,
        clearedNodeCount: applied.clearedNodeCount,
        skippedCount: applied.skipped.length,
        mode: auditUsesAnnotations ? "figma-dev-annotation" : "result-only",
        modeLabel: auditUsesAnnotations ? "Figma Dev Mode 주석" : "결과 패널만",
        auditProfile,
        auditProfileLabel: getTypoAuditProfileLabel(auditProfile),
        reviewStrategy: getTypoAuditProfileStrategyLabel(auditProfile, issueResult.strategy),
        aiStatusLabel: issueResult.aiMeta ? issueResult.aiMeta.statusLabel : "AI 상태 미확인",
        aiProviderLabel: issueResult.aiMeta ? issueResult.aiMeta.providerLabel : "",
        aiModelLabel: issueResult.aiMeta ? issueResult.aiMeta.modelLabel : "",
        categoryLabel:
          auditUsesAnnotations && category && category.label ? category.label : auditUsesAnnotations ? ANNOTATION_CATEGORY_LABEL : "결과 패널만",
      },
      issues: summarizeIssueResults(issues).slice(0, 12),
      skipped: applied.skipped.slice(0, 8),
      insights: insights.slice(0, 6),
    };
  }

  async function applyTypoFix(designReadResult) {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const proofingSettings = await readProofingSettings();
    const context = buildSelectionContext(selection, designReadResult, proofingSettings);
    const textNodes = collectTextNodes(selection);
    if (!textNodes.length) {
      throw new Error("텍스트 레이어가 포함된 선택을 먼저 선택하세요.");
    }

    const issueResult = await buildTypoIssues(textNodes, context, proofingSettings);
    const applied = await applyDirectTextFixes(textNodes, issueResult, context, proofingSettings);
    const annotationNodes = getAnnotatableTextNodes(textNodes);
    const annotationSupported = annotationNodes.length > 0;
    const category = annotationSupported ? await ensureAnnotationCategory(getManagedAnnotationCategoryColor()) : null;
    const annotationApplied = annotationSupported
      ? applyAnnotations(annotationNodes, applied.annotationIssues, category)
      : applied.annotationIssues.length > 0
        ? buildResultOnlyApplication(
            applied.annotationIssues,
            "현재 환경에서는 Figma Annotation API를 사용할 수 없어 수정 결과를 패널에만 표시합니다."
          )
        : {
            applied: [],
            cleared: [],
            skipped: [],
            annotatedNodeCount: 0,
            annotationCount: 0,
            clearedNodeCount: 0,
            removedAnnotationCount: 0,
          };
    if (issueResult.aiError) {
      applied.skipped.unshift({
        label: "AI 검수 경고",
        reason: issueResult.aiError,
      });
    }
    const issues = summarizeIssueResults(issueResult.issues).slice(0, 12);
    const skipped = [...applied.skipped, ...annotationApplied.skipped];
    const fixUsesAnnotations = annotationApplied.annotationCount > 0;
    const insights = buildFixInsights(context, textNodes, issueResult.issues, applied, annotationApplied, issueResult.aiMeta);

    return {
      version: PATCH_VERSION,
      source: issueResult.strategy === "ai-primary" ? "ai-primary-direct-fix-annotation" : "local-fallback-direct-fix-annotation",
      mode: fixUsesAnnotations ? "direct-text-edit-with-annotation" : "direct-text-edit",
      selectionSignature: getSelectionSignature(selection),
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: context.selectionLabel,
        contextLabel: context.contextLabel,
        textNodeCount: textNodes.length,
        issueCount: issueResult.issues.length,
        appliedCount: applied.appliedCount,
        unchangedCount: applied.unchangedCount,
        annotationCount: annotationApplied.annotationCount,
        annotatedNodeCount: annotationApplied.annotatedNodeCount,
        clearedNodeCount: annotationApplied.clearedNodeCount,
        skippedCount: skipped.length,
        mode: fixUsesAnnotations ? "direct-text-edit-with-annotation" : "direct-text-edit",
        modeLabel: fixUsesAnnotations ? "직접 수정 + Dev Mode 주석" : "직접 수정",
        reviewStrategy: issueResult.strategy === "ai-primary" ? "AI 우선 + 로컬 보완" : "로컬 fallback",
        aiStatusLabel: issueResult.aiMeta ? issueResult.aiMeta.statusLabel : "AI 상태 미확인",
        aiProviderLabel: issueResult.aiMeta ? issueResult.aiMeta.providerLabel : "",
        aiModelLabel: issueResult.aiMeta ? issueResult.aiMeta.modelLabel : "",
        categoryLabel: fixUsesAnnotations ? "직접 수정 후 Dev Mode 주석" : "직접 수정",
      },
      issues,
      applied: applied.applied.slice(0, 12),
      annotations: annotationApplied.applied.slice(0, 12),
      skipped: skipped.slice(0, 8),
      insights: insights.slice(0, 6),
    };
  }

  async function applyAiTranslation(designReadResult, targetLanguage) {
    const selection = Array.from(figma.currentPage.selection || []);
    const translationRoots = selection.length ? selection : [figma.currentPage];

    const proofingSettings = await readProofingSettings();
    const context = buildSelectionContext(translationRoots, designReadResult, proofingSettings);
    const textNodes = collectTextNodes(translationRoots);
    if (!textNodes.length) {
      throw new Error("텍스트가 포함된 프레임이나 페이지를 먼저 선택하세요.");
    }

    const translationResult = await requestAiTranslations(textNodes, context, proofingSettings, targetLanguage);
    const applied = await applyTranslatedText(textNodes, translationResult.issues, proofingSettings, targetLanguage);
    const sourceLanguageLabel =
      context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "자동 감지";
    const insights = buildTranslateInsights(
      context,
      textNodes,
      applied,
      translationResult.aiMeta,
      targetLanguage,
      translationResult.cacheStats
    );

    return {
      version: PATCH_VERSION,
      source: "ai-translation-direct-edit",
      mode: "direct-text-translation",
      selectionSignature: getSelectionSignature(selection),
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: context.selectionLabel,
        contextLabel: context.contextLabel,
        textNodeCount: textNodes.length,
        translatedCount: applied.appliedCount,
        unchangedCount: applied.unchangedCount,
        skippedCount: applied.skipped.length,
        reusedCount: translationResult.cacheStats ? translationResult.cacheStats.reusedCount : 0,
        requestedTextCount: translationResult.cacheStats ? translationResult.cacheStats.requestedCount : textNodes.length,
        uniqueRequestedTextCount: translationResult.cacheStats ? translationResult.cacheStats.uniqueRequestedCount : textNodes.length,
        sourceLanguageLabel,
        targetLanguageCode: targetLanguage.code,
        targetLanguageLabel: targetLanguage.label,
        mode: "direct-text-translation",
        modeLabel: "현재 선택 번역",
        aiStatusLabel: translationResult.aiMeta ? translationResult.aiMeta.statusLabel : "AI 상태 미확인",
        aiProviderLabel: translationResult.aiMeta ? translationResult.aiMeta.providerLabel : "",
        aiModelLabel: translationResult.aiMeta ? translationResult.aiMeta.modelLabel : "",
      },
      applied: applied.applied.slice(0, 12),
      skipped: applied.skipped.slice(0, 8),
      insights: insights.slice(0, 6),
    };
  }

  async function requestAiTranslations(textNodes, context, proofingSettings, targetLanguage) {
    const ai = getAiHelper();
    if (!ai) {
      throw new Error("AI 번역을 사용하려면 AI 설정에서 API 키를 먼저 입력해 주세요.");
    }

    let configured = false;
    let runInfo = { provider: "", model: "" };
    try {
      configured = await ai.hasConfiguredAiAsync();
      if (typeof ai.getAiSettingsAsync === "function" && typeof ai.getResolvedRunInfo === "function") {
        const settings = await ai.getAiSettingsAsync();
        runInfo = ai.getResolvedRunInfo(settings, { modelByProvider: AI_TRANSLATE_MODEL_BY_PROVIDER });
      }
    } catch (error) {
      configured = false;
    }

    if (!configured) {
      throw new Error("AI 번역을 사용하려면 AI 설정에서 API 키를 먼저 입력해 주세요.");
    }

    const candidates = buildAiTranslateCandidates(textNodes, proofingSettings);
    if (!candidates.length) {
      return {
        issues: [],
        aiMeta: createAiMeta("skipped", runInfo.provider, runInfo.model, "번역할 텍스트 후보가 없습니다."),
      };
    }

    const translationMemoryMap = buildTranslateMemoryMap(await readTranslateMemory());
    const pendingCandidateMap = new Map();
    const pendingCandidates = [];
    const issues = [];
    let cachedCount = 0;
    let requestedCount = 0;
    let translationMemoryDirty = false;

    for (const candidate of candidates) {
      const currentText = normalizeLineEndings(candidate.currentText || "");
      const memoryKey = buildTranslateMemoryKey(targetLanguage.code, currentText);
      const cachedEntry = translationMemoryMap.get(memoryKey);
      if (cachedEntry && cachedEntry.translatedText) {
        const cachedSuggestion = normalizeLineEndings(cachedEntry.translatedText);
        if (
          cachedSuggestion &&
          compactText(currentText) !== compactText(cachedSuggestion) &&
          issueRespectsProofingTerms(currentText, cachedSuggestion, proofingSettings) &&
          translationPreservesCriticalTokens(currentText, cachedSuggestion)
        ) {
          issues.push(
            createIssue(
              candidate.node,
              currentText,
              cachedSuggestion,
              "번역",
              cachedEntry.reason || "이전 AI 번역 결과를 다시 사용했습니다.",
              "ai"
            )
          );
          cachedCount += 1;
          continue;
        }
      }

      requestedCount += 1;
      let bucket = pendingCandidateMap.get(memoryKey);
      if (!bucket) {
        bucket = {
          id: candidate.id,
          memoryKey,
          node: candidate.node,
          currentText,
          text: currentText,
          members: [],
        };
        pendingCandidateMap.set(memoryKey, bucket);
        pendingCandidates.push(bucket);
      }
      bucket.members.push(candidate);
    }

    if (!pendingCandidates.length) {
      return {
        issues,
        aiMeta: createAiMeta("success", runInfo.provider, runInfo.model, ""),
        cacheStats: {
          reusedCount: cachedCount,
          requestedCount,
          uniqueRequestedCount: 0,
        },
      };
    }

    const schema = {
      type: "object",
      properties: {
        translations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              text: { type: "string" },
              reason: { type: "string" },
            },
            required: ["id", "text", "reason"],
          },
        },
      },
      required: ["translations"],
    };
    const instructions =
      "Translate each text node into the requested target language. Preserve product names, brand names, protectedTerms, URLs, emails, placeholders such as {{name}}, ${name}, {name}, printf tokens such as %s or %1$d, numbers, HTML-like tags, slash commands, and code-like identifiers exactly. Keep punctuation and line breaks whenever possible. Do not summarize, censor, or add explanations. Omit entries that should stay unchanged. Return short reasons in Korean when possible.";
    const candidateChunks = buildTranslateChunks(pendingCandidates);
    const chunkCount = Math.max(1, candidateChunks.length);
    let resolvedProvider = runInfo.provider;
    let resolvedModel = runInfo.model;

    for (let chunkIndex = 0; chunkIndex < candidateChunks.length; chunkIndex += 1) {
      const chunk = candidateChunks[chunkIndex];
      postTranslateStatus("running", `${targetLanguage.label}로 번역하는 중입니다. (${chunkIndex + 1}/${chunkCount})`);

      const payload = {
        selectionLabel: context.selectionLabel,
        contextLabel: context.contextLabel,
        sourceLanguageLabel:
          context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "Auto detect",
        targetLanguageCode: targetLanguage.code,
        targetLanguageLabel: targetLanguage.aiLabel || targetLanguage.label,
        latinLocaleHint: targetLanguage.latinLocaleHint || context.latinLocaleHint || "",
        protectedTerms: proofingSettings ? proofingSettings.protectedTerms : [],
        userDictionary: proofingSettings ? proofingSettings.userDictionary : [],
        textNodes: chunk.map((entry) => ({
          id: entry.id,
          text: entry.text,
        })),
      };

      let response = null;
      try {
        try {
          response = await ai.requestJsonTask({
            instructions,
            schema,
            payload,
            modelByProvider: AI_TRANSLATE_MODEL_BY_PROVIDER,
          });
        } catch (error) {
          if (!shouldRetryTypoAuditWithDefaultModel(error)) {
            throw error;
          }

          response = await ai.requestJsonTask({
            instructions,
            schema,
            payload,
          });
        }
      } catch (error) {
        throw new Error(normalizeErrorMessage(error, "AI 번역 요청에 실패했습니다."));
      }

      if (response && response._provider) {
        resolvedProvider = response._provider;
      }
      if (response && response._model) {
        resolvedModel = response._model;
      }

      const rows = response && Array.isArray(response.translations) ? response.translations : [];
      const candidateMap = new Map();
      for (const candidate of chunk) {
        candidateMap.set(candidate.id, candidate);
      }

      for (const row of rows) {
        if (!row || typeof row !== "object" || typeof row.id !== "string" || typeof row.text !== "string") {
          continue;
        }

        const candidate = candidateMap.get(row.id);
        if (!candidate || !Array.isArray(candidate.members) || !candidate.members.length) {
          continue;
        }

        const currentText = normalizeLineEndings(candidate.currentText || "");
        const suggestion = normalizeLineEndings(String(row.text || ""));
        if (!currentText || !suggestion || compactText(currentText) === compactText(suggestion)) {
          continue;
        }

        if (!issueRespectsProofingTerms(currentText, suggestion, proofingSettings)) {
          continue;
        }

        if (!translationPreservesCriticalTokens(currentText, suggestion)) {
          continue;
        }

        issues.push(
          createIssue(
            candidate.node,
            currentText,
            suggestion,
            "번역",
            typeof row.reason === "string" && row.reason.trim() ? row.reason.trim() : "AI가 선택한 언어로 번역했습니다.",
            "ai"
          )
        );
      }
    }

    for (const issue of issues) {
      if (!issue) {
        continue;
      }
      upsertTranslateMemoryEntry(
        translationMemoryMap,
        targetLanguage.code,
        normalizeLineEndings(issue.currentText || ""),
        normalizeLineEndings(issue.suggestion || ""),
        typeof issue.reason === "string" ? issue.reason : ""
      );
      translationMemoryDirty = true;
    }

    if (translationMemoryDirty) {
      await writeTranslateMemory(collectTranslateMemoryEntries(translationMemoryMap));
    }

    return {
      issues: expandTranslateIssuesForDuplicateCandidates(issues, pendingCandidates),
      aiMeta: createAiMeta("success", resolvedProvider, resolvedModel, ""),
      cacheStats: {
        reusedCount: cachedCount,
        requestedCount,
        uniqueRequestedCount: pendingCandidates.length,
      },
    };
  }

  function buildTranslateChunks(candidates) {
    const chunks = [];
    let currentChunk = [];
    let currentChars = 0;

    for (const candidate of Array.isArray(candidates) ? candidates : []) {
      if (!candidate) {
        continue;
      }

      const nextChars = currentChars + String(candidate.text || "").length;
      const exceedsItemLimit = currentChunk.length >= AI_TRANSLATE_MAX_CHUNK_ITEMS;
      const exceedsCharLimit = currentChunk.length > 0 && nextChars > AI_TRANSLATE_MAX_CHUNK_CHARS;

      if (exceedsItemLimit || exceedsCharLimit) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentChars = 0;
      }

      currentChunk.push(candidate);
      currentChars += String(candidate.text || "").length;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  function buildTranslateMemoryMap(entries) {
    const map = new Map();
    for (const entry of normalizeTranslateMemory(entries)) {
      map.set(entry.key, entry);
    }
    return map;
  }

  function collectTranslateMemoryEntries(memoryMap) {
    const entries = [];
    if (!memoryMap || typeof memoryMap.values !== "function") {
      return entries;
    }

    for (const entry of memoryMap.values()) {
      entries.push(entry);
    }

    return normalizeTranslateMemory(entries);
  }

  function normalizeTranslateMemory(entries) {
    const source =
      Array.isArray(entries)
        ? entries
        : entries && typeof entries === "object" && Array.isArray(entries.entries)
          ? entries.entries
          : [];
    const normalized = [];
    const seen = new Set();

    for (const item of source) {
      const entry = normalizeTranslateMemoryEntry(item);
      if (!entry || seen.has(entry.key)) {
        continue;
      }
      seen.add(entry.key);
      normalized.push(entry);
      if (normalized.length >= AI_TRANSLATE_MEMORY_LIMIT) {
        break;
      }
    }

    return normalized;
  }

  function normalizeTranslateMemoryEntry(value) {
    const source = value && typeof value === "object" ? value : null;
    if (!source) {
      return null;
    }

    const targetLanguageCode = String(source.targetLanguageCode || "").trim();
    const sourceText = normalizeLineEndings(source.sourceText || "");
    const translatedText = normalizeLineEndings(source.translatedText || "");
    if (!targetLanguageCode || !sourceText || !translatedText) {
      return null;
    }

    return {
      key: buildTranslateMemoryKey(targetLanguageCode, sourceText),
      targetLanguageCode,
      sourceText,
      translatedText,
      reason: typeof source.reason === "string" ? source.reason.trim() : "",
      updatedAt:
        typeof source.updatedAt === "string" && source.updatedAt.trim() ? source.updatedAt.trim() : new Date().toISOString(),
    };
  }

  function buildTranslateMemoryKey(targetLanguageCode, sourceText) {
    return `${String(targetLanguageCode || "").trim().toLowerCase()}::${normalizeLineEndings(sourceText || "")}`;
  }

  function upsertTranslateMemoryEntry(memoryMap, targetLanguageCode, sourceText, translatedText, reason) {
    if (!memoryMap || typeof memoryMap.set !== "function") {
      return;
    }

    const entry = normalizeTranslateMemoryEntry({
      targetLanguageCode,
      sourceText,
      translatedText,
      reason,
      updatedAt: new Date().toISOString(),
    });
    if (!entry) {
      return;
    }

    if (memoryMap.has(entry.key)) {
      memoryMap.delete(entry.key);
    }
    memoryMap.set(entry.key, entry);
  }

  function expandTranslateIssuesForDuplicateCandidates(issues, pendingCandidates) {
    const expanded = [];
    const pendingByNodeId = new Map();

    for (const candidate of Array.isArray(pendingCandidates) ? pendingCandidates : []) {
      if (!candidate || !candidate.node || !candidate.node.id) {
        continue;
      }
      pendingByNodeId.set(candidate.node.id, candidate);
    }

    for (const issue of Array.isArray(issues) ? issues : []) {
      if (!issue || !issue.node || !issue.node.id) {
        continue;
      }

      const candidate = pendingByNodeId.get(issue.node.id);
      const members = candidate && Array.isArray(candidate.members) ? candidate.members : [];
      if (!members.length) {
        expanded.push(issue);
        continue;
      }

      for (const member of members) {
        if (!member || !member.node) {
          continue;
        }
        expanded.push(
          createIssue(
            member.node,
            issue.currentText,
            issue.suggestion,
            issue.kind || "번역",
            issue.reason || "",
            issue.source || "ai"
          )
        );
      }
    }

    return expanded;
  }

  function buildAiTranslateCandidates(textNodes, proofingSettings) {
    const candidates = [];

    for (const node of textNodes) {
      const currentText = getTextValue(node);
      if (!shouldTranslateTextNodeValue(currentText, proofingSettings)) {
        continue;
      }

      candidates.push({
        id: node.id,
        node,
        nodeId: node.id,
        name: safeName(node),
        currentText,
        text: currentText,
      });
    }

    return candidates;
  }

  function shouldTranslateTextNodeValue(text, proofingSettings) {
    const currentText = normalizeLineEndings(text);
    const compactValue = compactText(currentText);
    if (!compactValue) {
      return false;
    }

    if (isWholeTextProtected(currentText, proofingSettings)) {
      return false;
    }

    if (getActiveScriptFamilies(currentText).length === 0) {
      return false;
    }

    if (/^(https?:\/\/|www\.)/i.test(compactValue)) {
      return false;
    }

    if (/^[\d\s.,:/\-+%()[\]{}<>#@_*"'!?&|=]+$/.test(compactValue)) {
      return false;
    }

    return true;
  }

  async function applyTranslatedText(textNodes, issues, proofingSettings, targetLanguage) {
    const issuesByNode = new Map();
    const applied = [];
    const skipped = [];
    let appliedCount = 0;
    let unchangedCount = 0;

    for (const issue of Array.isArray(issues) ? issues : []) {
      if (!issue || !issue.node || !issue.node.id) {
        continue;
      }

      issuesByNode.set(issue.node.id, issue);
    }

    await preloadFontsForTextNodes(textNodes, issuesByNode);

    for (const node of textNodes) {
      const currentText = getTextValue(node);
      if (!currentText) {
        unchangedCount += 1;
        continue;
      }

      const issue = issuesByNode.get(node.id);
      if (!issue) {
        unchangedCount += 1;
        continue;
      }

      const nextText = normalizeTranslatedSuggestion(currentText, issue.suggestion);
      if (!nextText || nextText === currentText) {
        unchangedCount += 1;
        continue;
      }

      if (!issueRespectsProofingTerms(currentText, nextText, proofingSettings)) {
        skipped.push({
          label: safeName(node),
          reason: "보호된 용어가 변경될 수 있어 번역 적용을 건너뛰었습니다.",
        });
        unchangedCount += 1;
        continue;
      }

      if (!translationPreservesCriticalTokens(currentText, nextText)) {
        skipped.push({
          label: safeName(node),
          reason: "URL, 플레이스홀더, 코드형 토큰이 바뀔 수 있어 번역 적용을 건너뛰었습니다.",
        });
        unchangedCount += 1;
        continue;
      }

      if (countTextLines(currentText) > 1 && countNonEmptyLines(nextText) < Math.max(1, countNonEmptyLines(currentText) - 1)) {
        skipped.push({
          label: safeName(node),
          reason: "여러 줄 텍스트 구조가 크게 바뀌어 번역 적용을 건너뛰었습니다.",
        });
        unchangedCount += 1;
        continue;
      }

      try {
        await loadFontsForTextNode(node);
        node.characters = nextText;
        appliedCount += 1;
        applied.push(
          formatIssueResult(
            createIssue(
              node,
              currentText,
              nextText,
              "번역",
              issue.reason || `${targetLanguage.label}로 번역했습니다.`,
              issue.source || "ai"
            )
          )
        );
      } catch (error) {
        skipped.push({
          label: safeName(node),
          reason: normalizeErrorMessage(error, "텍스트를 번역 결과로 바꾸지 못했습니다."),
        });
        unchangedCount += 1;
      }
    }

    return {
      applied,
      skipped,
      appliedCount,
      unchangedCount,
    };
  }

  function normalizeTranslatedSuggestion(currentText, suggestion) {
    let next = normalizeLineEndings(suggestion).trim();
    if (!next) {
      return "";
    }

    if (countTextLines(currentText) === 1) {
      next = next.replace(/\s*\n+\s*/g, " ");
    }

    return next;
  }

  function translationPreservesCriticalTokens(currentText, suggestion) {
    const tokens = collectCriticalTokens(currentText);
    if (!tokens.length) {
      return true;
    }

    for (const token of tokens) {
      if (countTermOccurrences(suggestion, token, false) < countTermOccurrences(currentText, token, false)) {
        return false;
      }
    }

    return true;
  }

  function collectCriticalTokens(text) {
    const value = normalizeLineEndings(text);
    const tokens = [];
    const patterns = [
      /https?:\/\/[^\s)]+/g,
      /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g,
      /\{\{[^{}]+\}\}/g,
      /\$\{[^{}]+\}/g,
      /\{[^{}\n]+\}/g,
      /%[0-9]*\$?[sdif]/g,
      /<[^>\n]+>/g,
    ];

    for (const pattern of patterns) {
      const matches = value.match(pattern);
      if (!matches || !matches.length) {
        continue;
      }

      for (const match of matches) {
        tokens.push(match);
      }
    }

    return normalizeTermList(tokens);
  }

  function buildTranslateInsights(context, textNodes, applied, aiMeta, targetLanguage, cacheStats) {
    const sourceLanguageLabel =
      context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "자동 감지";
    const insights = [
      `맥락 기준: ${context.contextLabel}`,
      `원본 언어: ${sourceLanguageLabel}`,
      `목표 언어: ${targetLanguage.label}`,
      `텍스트 레이어 ${textNodes.length}개 확인`,
      `번역 적용 ${applied.appliedCount}개`,
    ];

    if (applied.unchangedCount > 0) {
      insights.push(`변경 없이 유지 ${applied.unchangedCount}개`);
    }

    if (applied.skipped.length > 0) {
      insights.push(`안전 검사로 건너뜀 ${applied.skipped.length}개`);
    }

    if (cacheStats && cacheStats.reusedCount > 0) {
      insights.push(`재사용 캐시 ${cacheStats.reusedCount}개`);
    }

    if (cacheStats && cacheStats.requestedCount > 0 && cacheStats.uniqueRequestedCount > 0) {
      insights.push(`AI 요청 ${cacheStats.requestedCount}개 -> 중복 제거 후 ${cacheStats.uniqueRequestedCount}개`);
    }

    if (aiMeta && aiMeta.statusLabel) {
      insights.push(`AI 상태: ${aiMeta.statusLabel}${aiMeta.providerLabel ? ` · ${aiMeta.providerLabel}` : ""}`);
    }

    if (applied.applied.length > 0) {
      const firstApplied = applied.applied[0];
      insights.push(`대표 변경: ${previewText(firstApplied.currentText, 32)} -> ${previewText(firstApplied.suggestion, 32)}`);
    } else {
      insights.push("번역 결과가 없어 기존 텍스트를 유지했습니다.");
    }

    return insights;
  }

  async function clearManagedTypoAnnotations(designReadResult) {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const proofingSettings = await readProofingSettings();
    const context = buildSelectionContext(selection, designReadResult, proofingSettings);
    const textNodes = collectTextNodes(selection, { includeHidden: true, includeLocked: true });
    const annotationNodes = getAnnotatableTextNodes(textNodes);
    const annotationSupported = annotationNodes.length > 0;
    const category = annotationSupported ? await ensureAnnotationCategory(getManagedAnnotationCategoryColor()) : null;
    const applied = annotationSupported
      ? applyAnnotations(annotationNodes, [], category)
      : buildResultOnlyApplication([], "현재 환경에서는 Figma Annotation API를 사용할 수 없어 주석을 지울 수 없습니다.");

    if (textNodes.length === 0) {
      applied.skipped.unshift({
        label: "텍스트 없음",
        reason: "선택한 범위 안에서 주석을 정리할 텍스트 레이어를 찾지 못했습니다.",
      });
    }

    const insights = buildClearInsights(context, textNodes, applied, annotationSupported);

    return {
      version: PATCH_VERSION,
      source: "managed-annotation-clear",
      mode: annotationSupported ? "annotation-clear" : "result-only",
      selectionSignature: getSelectionSignature(selection),
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: context.selectionLabel,
        contextLabel: context.contextLabel,
        textNodeCount: textNodes.length,
        clearedNodeCount: applied.clearedNodeCount,
        removedAnnotationCount: applied.removedAnnotationCount || 0,
        skippedCount: applied.skipped.length,
        mode: annotationSupported ? "annotation-clear" : "result-only",
        modeLabel: annotationSupported ? "Dev Mode 주석 정리" : "결과 패널만",
        categoryLabel: annotationSupported ? "AI 오타 주석 정리" : "결과 패널만",
      },
      cleared: Array.isArray(applied.cleared) ? applied.cleared.slice(0, 12) : [],
      skipped: applied.skipped.slice(0, 8),
      insights: insights.slice(0, 6),
    };
  }

  function supportsAnnotations(textNodes) {
    return getAnnotatableTextNodes(textNodes).length > 0;
  }

  function getAnnotatableTextNodes(textNodes) {
    const result = [];
    for (const node of Array.isArray(textNodes) ? textNodes : []) {
      if (supportsAnnotationsOnNode(node)) {
        result.push(node);
      }
    }
    return result;
  }

  function supportsAnnotationsOnNode(node) {
    return !!node && "annotations" in node;
  }

  async function ensureAnnotationCategory(requestedColor) {
    if (!figma.annotations || typeof figma.annotations.getAnnotationCategoriesAsync !== "function") {
      return null;
    }

    try {
      const nextColor =
        typeof requestedColor === "string" && requestedColor.trim()
          ? requestedColor.trim().toLowerCase()
          : ANNOTATION_CATEGORY_COLOR;
      const categories = await figma.annotations.getAnnotationCategoriesAsync();
      const existing = Array.isArray(categories)
        ? categories.find((category) => category && category.label === ANNOTATION_CATEGORY_LABEL)
        : null;
      if (existing) {
        if (typeof existing.setColor === "function" && existing.color !== nextColor) {
          existing.setColor(nextColor);
        }
        return existing;
      }

      if (typeof figma.annotations.addAnnotationCategoryAsync !== "function") {
        return null;
      }

      return await figma.annotations.addAnnotationCategoryAsync({
        label: ANNOTATION_CATEGORY_LABEL,
        color: nextColor,
      });
    } catch (error) {
      return null;
    }
  }

  function applyAnnotations(textNodes, issues, category) {
    const issuesByNode = new Map();
    const applied = [];
    const cleared = [];
    const skipped = [];
    const availableNodeIds = new Set();
    const unsupportedIssueNodeIds = new Set();
    let annotatedNodeCount = 0;
    let annotationCount = 0;
    let clearedNodeCount = 0;
    let removedAnnotationCount = 0;

    for (const node of textNodes) {
      if (node && node.id) {
        availableNodeIds.add(node.id);
      }
    }

    for (const issue of issues) {
      for (const fragment of getIssueAnnotationFragments(issue)) {
        if (!fragment || !fragment.node || !fragment.node.id) {
          continue;
        }

        if (!availableNodeIds.has(fragment.node.id)) {
          if (!unsupportedIssueNodeIds.has(fragment.node.id)) {
            unsupportedIssueNodeIds.add(fragment.node.id);
            skipped.push({
              label: safeName(fragment.node),
              reason: "이 텍스트 레이어는 Dev Mode 주석을 지원하지 않아 결과 패널에만 표시했습니다.",
            });
          }
          continue;
        }

        const bucket = issuesByNode.get(fragment.node.id) || [];
        bucket.push(fragment);
        issuesByNode.set(fragment.node.id, bucket);
      }
    }

    for (const node of textNodes) {
      const nodeIssues = issuesByNode.get(node.id) || [];
      try {
        const existing = Array.isArray(node.annotations) ? Array.from(node.annotations) : [];
        const preserved = existing.filter((annotation) => !isManagedAnnotation(annotation, category));
        const nextAnnotations = preserved.concat(nodeIssues.map((issue) => buildAnnotation(issue, category)));
        const removedCount = Math.max(0, existing.length - preserved.length);
        if (removedCount > 0) {
          removedAnnotationCount += removedCount;
        }

        if (removedCount > 0 && nodeIssues.length === 0) {
          clearedNodeCount += 1;
          cleared.push({
            nodeId: node.id,
            nodeName: safeName(node),
            removedCount,
          });
        }

        node.annotations = nextAnnotations;

        if (nodeIssues.length > 0) {
          annotatedNodeCount += 1;
          annotationCount += nodeIssues.length;
          for (const issue of nodeIssues) {
            applied.push(formatIssueResult(issue));
          }
        }
      } catch (error) {
        if (!nodeIssues.length) {
          continue;
        }

        skipped.push({
          label: safeName(node),
          reason: normalizeErrorMessage(error, "주석을 남기지 못했습니다."),
        });
      }
    }

    return {
      applied,
      cleared,
      skipped,
      annotatedNodeCount,
      annotationCount,
      clearedNodeCount,
      removedAnnotationCount,
    };
  }

  function buildResultOnlyApplication(issues, reason) {
    const skipped = [];
    if (reason) {
      skipped.push({
        label: "주석 미적용",
        reason,
      });
    }

    return {
      applied: summarizeIssueResults(issues),
      cleared: [],
      skipped,
      annotatedNodeCount: 0,
      annotationCount: 0,
      clearedNodeCount: 0,
      removedAnnotationCount: 0,
    };
  }

  async function applyDirectTextFixes(textNodes, issueResult, context, proofingSettings) {
    const issuesByNode = new Map();
    const localRepairMap = buildLocalRepairMap(textNodes, context, proofingSettings);
    const applied = [];
    const annotationIssues = [];
    const skipped = [];
    let appliedCount = 0;
    let unchangedCount = 0;

    for (const issue of issueResult.issues || []) {
      const bucket = issuesByNode.get(issue.node.id) || [];
      bucket.push(issue);
      issuesByNode.set(issue.node.id, bucket);
    }

    for (const node of textNodes) {
      const currentText = getTextValue(node);
      if (!currentText) {
        unchangedCount += 1;
        continue;
      }

      const resolution = stabilizeDirectFixResolution(
        node,
        currentText,
        resolveDirectFix(node, currentText, issuesByNode.get(node.id) || [], localRepairMap),
        localRepairMap.get(node.id) || ""
      );
      if (resolution && resolution.skipReason) {
        skipped.push({
          label: safeName(node),
          reason: resolution.skipReason,
        });
        unchangedCount += 1;
        continue;
      }
      if (!resolution || !resolution.nextText || resolution.nextText === currentText) {
        unchangedCount += 1;
        continue;
      }

      try {
        await loadFontsForTextNode(node);
        node.characters = resolution.nextText;
        appliedCount += 1;
        const appliedIssue =
          resolution.issue ||
          createIssue(node, currentText, resolution.nextText, "자동 수정", "오타 후보를 직접 수정했습니다.", resolution.source);
        for (const fragment of getIssueAnnotationFragments(appliedIssue)) {
          applied.push(formatIssueResult(fragment));
        }
        annotationIssues.push(appliedIssue);
      } catch (error) {
        skipped.push({
          label: safeName(node),
          reason: normalizeErrorMessage(error, "텍스트를 직접 수정하지 못했습니다."),
        });
      }
    }

    return {
      applied,
      annotationIssues,
      skipped,
      appliedCount,
      unchangedCount,
    };
  }

  function resolveDirectFix(node, currentText, nodeIssues, localRepairMap) {
    const aiIssue = nodeIssues.find((issue) => issue && issue.source === "ai" && issue.suggestion && issue.suggestion !== currentText);
    if (aiIssue) {
      return {
        nextText: aiIssue.suggestion,
        issue: aiIssue,
        source: "ai",
      };
    }

    const localSuggestion = localRepairMap.get(node.id);
    if (localSuggestion && localSuggestion !== currentText) {
      const localIssue =
        nodeIssues.find((issue) => issue && issue.suggestion === localSuggestion) ||
        createIssue(node, currentText, localSuggestion, "자동 수정", "로컬 규칙으로 직접 수정했습니다.", "local");
      return {
        nextText: localSuggestion,
        issue: localIssue,
        source: "local",
      };
    }

    const fallbackIssue = nodeIssues.find((issue) => issue && issue.suggestion && issue.suggestion !== currentText);
    if (fallbackIssue) {
      return {
        nextText: fallbackIssue.suggestion,
        issue: fallbackIssue,
        source: fallbackIssue.source || "local",
      };
    }

    return null;
  }

  function stabilizeDirectFixResolution(node, currentText, resolution, localSuggestion) {
    if (!resolution || !currentText) {
      return resolution;
    }

    const safetyCheck = assessDirectReplacementSafety(currentText, resolution.nextText);
    const currentLineCount = countTextLines(currentText);
    const nextLineCount = countTextLines(resolution.nextText);
    const currentVisibleLines = countNonEmptyLines(currentText);
    const nextVisibleLines = countNonEmptyLines(resolution.nextText);
    const isMultiline = currentLineCount > 1 || currentVisibleLines > 1;

    if (!safetyCheck.safe) {
      if (isSafeLocalSuggestion(currentText, localSuggestion)) {
        return {
          nextText: localSuggestion,
          issue: createIssue(
            node,
            currentText,
            localSuggestion,
            "안전 교정",
            "AI 제안의 변화 폭이 커서, 더 안전한 로컬 교정만 직접 반영했습니다.",
            "local"
          ),
          source: "local",
        };
      }

      return {
        nextText: "",
        issue: null,
        source: resolution.source || "ai",
        skipReason: safetyCheck.reason,
      };
    }

    if (!isMultiline) {
      return resolution;
    }

    const lineStructureReduced = nextLineCount < currentLineCount || nextVisibleLines < currentVisibleLines;
    if (!lineStructureReduced) {
      return resolution;
    }

    if (
      localSuggestion &&
      localSuggestion !== currentText &&
      countTextLines(localSuggestion) === currentLineCount &&
      countNonEmptyLines(localSuggestion) >= currentVisibleLines
    ) {
      return {
        nextText: localSuggestion,
        issue: createIssue(
          node,
          currentText,
          localSuggestion,
          "멀티라인 보호",
          "AI 제안이 줄 구조를 줄여서, 줄 수를 유지하는 로컬 교정만 직접 반영했습니다.",
          "local"
        ),
        source: "local",
      };
    }

    return {
      nextText: "",
      issue: null,
      source: resolution.source || "ai",
      skipReason: `멀티라인 텍스트 보호: ${currentLineCount}줄 텍스트를 ${nextLineCount}줄 제안으로 바꾸려 해 자동 적용을 건너뛰었습니다.`,
    };
  }

  function countTextLines(value) {
    return normalizeLineEndings(value).split("\n").length;
  }

  function countNonEmptyLines(value) {
    return normalizeLineEndings(value)
      .split("\n")
      .filter((line) => line.replace(/\s+/g, "").length > 0).length;
  }

  function assessDirectReplacementSafety(currentText, nextText) {
    const currentCompact = compactText(currentText);
    const nextCompact = compactText(nextText);
    if (!currentCompact || !nextCompact || currentCompact === nextCompact) {
      return { safe: true, reason: "" };
    }

    const maxLength = Math.max(currentCompact.length, nextCompact.length, 1);
    const minLength = Math.max(1, Math.min(currentCompact.length, nextCompact.length));
    const similarity = 1 - getEditDistance(currentCompact, nextCompact) / maxLength;
    const lengthRatio = minLength / maxLength;

    if (lengthRatio < 0.45) {
      return {
        safe: false,
        reason: "변경 폭이 너무 커서 자동 적용을 건너뛰었습니다. 결과 패널에서 후보를 먼저 확인해 주세요.",
      };
    }

    if (similarity < 0.35) {
      return {
        safe: false,
        reason: "원문과 제안의 차이가 커서 자동 적용을 건너뛰었습니다. 결과 패널에서 후보를 먼저 확인해 주세요.",
      };
    }

    return { safe: true, reason: "" };
  }

  function isSafeLocalSuggestion(currentText, localSuggestion) {
    if (!localSuggestion || localSuggestion === currentText) {
      return false;
    }

    return assessDirectReplacementSafety(currentText, localSuggestion).safe;
  }

  function buildLocalRepairMap(textNodes, context, proofingSettings) {
    const map = new Map();

    for (const node of textNodes) {
      const original = getTextValue(node);
      if (!original) {
        continue;
      }

      if (isWholeTextProtected(original, proofingSettings)) {
        continue;
      }

      const repaired = repairTextLocally(node, original, context, []);
      if (
        repaired &&
        repaired !== original &&
        issueRespectsProofingTerms(original, repaired, proofingSettings) &&
        changeMatchesCorrectionPolicy(original, repaired, "로컬 교정")
      ) {
        map.set(node.id, repaired);
      }
    }

    return map;
  }

  function repairTextLocally(node, text, context, replacements) {
    let next = String(text || "");
    if (!next) {
      return next;
    }

    const languageFamily = detectLanguageFamilyFromText(next) || detectLanguageFamilyLabel(context && context.detectedLanguageLabel);
    const latinLocaleHint = resolveLatinTokenLocaleHint(context, next);
    next = normalizeInlineWhitespace(next);
    next = normalizePunctuationSpacing(next, languageFamily);
    next = normalizeNoSpaceScriptSpacing(next, languageFamily);
    next = normalizeRepeatedPunctuation(next);

    next = applyTypoReplacementRules(next);

    next = applyPhraseHintSuggestion(next) || next;
    next = repairLatinTokensInText(next, languageFamily, latinLocaleHint);

    for (const replacement of replacements) {
      next = replaceAllLiteral(next, replacement.variant, replacement.canonical);
    }

    return next;
  }

  function buildConsistencyReplacementMap(textNodes) {
    const replacementsByNode = new Map();

    for (const rule of CONSISTENCY_RULES) {
      const matched = [];
      for (const node of textNodes) {
        const text = compactText(getTextValue(node));
        if (!text) {
          continue;
        }

        const variant = rule.variants.find((entry) => text.includes(entry));
        if (variant) {
          matched.push({ node, variant });
        }
      }

      const hasCanonical = matched.some((entry) => entry.variant === rule.canonical);
      if (!hasCanonical) {
        continue;
      }

      for (const entry of matched) {
        if (entry.variant === rule.canonical) {
          continue;
        }

        const bucket = replacementsByNode.get(entry.node.id) || [];
        bucket.push({
          variant: entry.variant,
          canonical: rule.canonical,
        });
        replacementsByNode.set(entry.node.id, bucket);
      }
    }

    return replacementsByNode;
  }

  function replaceAllLiteral(value, search, replacement) {
    const source = String(value || "");
    const token = String(search || "");
    if (!token) {
      return source;
    }

    return source.split(token).join(String(replacement || ""));
  }

  function applyPhraseHintSuggestion(text) {
    const normalizedText = normalizeLineEndings(text);
    const lines = normalizedText.split("\n");
    let changed = false;
    const nextLines = lines.map((line) => {
      const hint = getPhraseHintForLine(line);
      if (!hint) {
        return line;
      }

      changed = true;
      return hint.suggestion;
    });

    return changed ? nextLines.join("\n") : "";
  }

  function repairLatinTokensInText(text, languageFamily, latinLocaleHint) {
    if (languageFamily !== "latin") {
      return text;
    }

    const hintPool = getLatinTokenHintPool(latinLocaleHint);
    if (!hintPool.length) {
      return text;
    }

    const matches = Array.from(String(text || "").matchAll(/\b[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'-]{3,}\b/g));
    if (!matches.length) {
      return text;
    }

    let next = String(text || "");
    for (let index = matches.length - 1; index >= 0; index -= 1) {
      const match = matches[index];
      const token = match && typeof match[0] === "string" ? match[0] : "";
      const start = match && typeof match.index === "number" ? match.index : -1;
      if (!token || start < 0) {
        continue;
      }

      const bestHint = findBestLatinTokenHint(token, latinLocaleHint);
      if (!bestHint) {
        continue;
      }

      const replacement = applyLatinTokenCase(bestHint.canonical, token);
      if (!replacement || replacement === token) {
        continue;
      }

      next = next.slice(0, start) + replacement + next.slice(start + token.length);
    }

    return next;
  }

  async function loadFontsForTextNode(node) {
    if (!node || node.type !== "TEXT") {
      return;
    }

    const fontNames = collectEditableFontNames(node);
    for (const fontName of fontNames) {
      await loadFontWithCache(fontName);
    }
  }

  async function preloadFontsForTextNodes(textNodes, issuesByNode) {
    const fontNames = [];
    const seen = new Set();

    for (const node of Array.isArray(textNodes) ? textNodes : []) {
      if (!node || !node.id) {
        continue;
      }
      if (issuesByNode && !issuesByNode.has(node.id)) {
        continue;
      }

      const editableFontNames = collectEditableFontNames(node);
      for (const fontName of editableFontNames) {
        const key = getFontCacheKey(fontName);
        if (!key || seen.has(key)) {
          continue;
        }

        seen.add(key);
        fontNames.push({
          family: fontName.family,
          style: fontName.style,
        });
      }
    }

    for (const fontName of fontNames) {
      await loadFontWithCache(fontName);
    }
  }

  function getFontCacheKey(fontName) {
    if (!fontName || typeof fontName !== "object") {
      return "";
    }
    if (typeof fontName.family !== "string" || typeof fontName.style !== "string") {
      return "";
    }
    return `${fontName.family}::${fontName.style}`;
  }

  async function loadFontWithCache(fontName) {
    const key = getFontCacheKey(fontName);
    if (!key) {
      return;
    }

    let pending = loadedFontPromiseCache.get(key);
    if (!pending) {
      pending = figma.loadFontAsync({
        family: fontName.family,
        style: fontName.style,
      });
      loadedFontPromiseCache.set(key, pending);
    }

    try {
      await pending;
    } catch (error) {
      loadedFontPromiseCache.delete(key);
      throw error;
    }
  }

  function collectEditableFontNames(node) {
    const fontNames = [];
    const seen = new Set();
    const pushFont = (fontName) => {
      if (!fontName || typeof fontName !== "object" || typeof fontName.family !== "string" || typeof fontName.style !== "string") {
        return;
      }

      const key = `${fontName.family}::${fontName.style}`;
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      fontNames.push({
        family: fontName.family,
        style: fontName.style,
      });
    };

    if (typeof node.getRangeAllFontNames === "function" && typeof node.characters === "string" && node.characters.length > 0) {
      try {
        const rangeFonts = node.getRangeAllFontNames(0, node.characters.length);
        for (const fontName of rangeFonts) {
          pushFont(fontName);
        }
      } catch (error) {}
    }

    if (fontNames.length === 0 && node.fontName && node.fontName !== figma.mixed && typeof node.fontName === "object") {
      pushFont(node.fontName);
    }

    return fontNames;
  }

  function summarizeIssueResults(issues) {
    if (!Array.isArray(issues)) {
      return [];
    }

    const results = [];
    for (const issue of issues) {
      for (const fragment of getIssueAnnotationFragments(issue)) {
        results.push(formatIssueResult(fragment));
      }
    }
    return results;
  }

  function formatIssueResult(issue) {
    return {
      id: issue && issue.node ? issue.node.id : "",
      nodeName: safeName(issue && issue.node),
      currentText: previewVisibleText(issue && issue.currentText ? issue.currentText : "", 72),
      suggestion: previewVisibleText(issue && issue.suggestion ? issue.suggestion : "", 72),
      reason: issue && issue.reason ? issue.reason : "",
      kind: issue && issue.kind ? issue.kind : "오타",
      source: issue && issue.source ? issue.source : "local",
    };
  }

  function buildAnnotation(issue, category) {
    const kindLabels = getAnnotationKindLabels(issue);
    const label = [
      `[Pigma Ai Audit] ${kindLabels.join(", ")}`,
      `전 : ${previewText(issue.currentText, 72)}`,
      `후 : ${previewText(issue.suggestion, 72)}`,
      `이유 : ${buildAnnotationReason(issue, kindLabels)}`,
    ].join("\n");

    return category && category.id
      ? {
          label,
          categoryId: category.id,
        }
      : {
          label,
        };
  }

  function isManagedAnnotation(annotation, category) {
    if (!annotation || typeof annotation !== "object") {
      return false;
    }

    if (category && category.id && annotation.categoryId === category.id) {
      return true;
    }

    const label = typeof annotation.label === "string" ? annotation.label : typeof annotation.labelMarkdown === "string" ? annotation.labelMarkdown : "";
    return LEGACY_ANNOTATION_PREFIXES.some((prefix) => label.startsWith(prefix));
  }

  function getAnnotationKindLabels(issue) {
    const tokens = String(issue && issue.kind ? issue.kind : "")
      .split(/[,+/|]/)
      .map((token) => token.trim())
      .filter(Boolean);
    const resolved = [];

    for (const token of tokens) {
      const label = normalizeAnnotationKindLabel(token, issue);
      if (label && !resolved.includes(label)) {
        resolved.push(label);
      }
    }

    if (resolved.length > 0) {
      return resolved;
    }

    return [inferAnnotationKindFromIssue(issue)];
  }

  function normalizeAnnotationKindLabel(kind, issue) {
    const raw = String(kind || "").trim();
    if (!raw) {
      return "";
    }

    const compact = raw.replace(/\s+/g, "");
    const lower = compact.toLowerCase();

    if (
      compact.includes("띄어쓰기") ||
      compact.includes("공백") ||
      lower.includes("space") ||
      lower.includes("whitespace")
    ) {
      return "띄어쓰기";
    }

    if (compact.includes("문법") || lower.includes("grammar")) {
      return "문법";
    }

    if (compact.includes("문장부호") || lower.includes("punct")) {
      return "문장부호";
    }

    if (
      compact.includes("용어통일") ||
      compact.includes("표기통일") ||
      compact.includes("일관성") ||
      lower.includes("terminology") ||
      lower.includes("consisten")
    ) {
      return "용어 통일";
    }

    if (
      compact.includes("오타") ||
      compact.includes("철자") ||
      compact.includes("자동수정") ||
      compact.includes("안전교정") ||
      compact.includes("멀티라인보호") ||
      lower.includes("spell") ||
      lower.includes("typo")
    ) {
      return "철자";
    }

    return inferAnnotationKindFromIssue(issue);
  }

  function inferAnnotationKindFromIssue(issue) {
    const currentText = String(issue && issue.currentText ? issue.currentText : "");
    const suggestion = String(issue && issue.suggestion ? issue.suggestion : "");
    const currentNoSpace = currentText.replace(/\s+/g, "");
    const suggestionNoSpace = suggestion.replace(/\s+/g, "");
    if (currentNoSpace && currentNoSpace === suggestionNoSpace) {
      return "띄어쓰기";
    }

    const currentNoPunctuation = currentText.replace(/[.,!?;:'"()\-_[\]{}]/g, "");
    const suggestionNoPunctuation = suggestion.replace(/[.,!?;:'"()\-_[\]{}]/g, "");
    if (currentNoPunctuation && currentNoPunctuation === suggestionNoPunctuation) {
      return "문장부호";
    }

    return "철자";
  }

  function buildAnnotationReason(issue, kindLabels) {
    const explicitReason = String(issue && issue.reason ? issue.reason : "").trim();
    if (explicitReason) {
      return explicitReason;
    }

    if (Array.isArray(kindLabels) && kindLabels.includes("용어 통일")) {
      return "같은 용어를 다른 말로 바꾸지 않도록 유지했습니다.";
    }

    if (Array.isArray(kindLabels) && kindLabels.includes("띄어쓰기")) {
      return "띄어쓰기를 바로잡았습니다.";
    }

    if (Array.isArray(kindLabels) && kindLabels.includes("문법")) {
      return "문법상 어색한 부분을 바로잡았습니다.";
    }

    if (Array.isArray(kindLabels) && kindLabels.includes("문장부호")) {
      return "문장부호를 바로잡았습니다.";
    }
    return "명백한 오타를 바로잡았습니다.";
  }

  function getIssueAnnotationFragments(issue) {
    if (!issue || !issue.node) {
      return [];
    }

    if (issue.annotationFragment === true) {
      return [issue];
    }

    if (Array.isArray(issue.annotationFragments) && issue.annotationFragments.length > 0) {
      return issue.annotationFragments;
    }

    const fragments = buildIssueAnnotationFragments(issue);
    issue.annotationFragments = fragments.length > 0 ? fragments : [createFallbackIssueFragment(issue)];
    return issue.annotationFragments;
  }

  function buildIssueAnnotationFragments(issue) {
    const currentText = normalizeLineEndings(issue && issue.currentText ? issue.currentText : "");
    const suggestion = normalizeLineEndings(issue && issue.suggestion ? issue.suggestion : "");
    if (!currentText && !suggestion) {
      return [];
    }

    const currentLines = currentText.split("\n");
    const suggestionLines = suggestion.split("\n");
    const fragments = [];

    if (currentLines.length === suggestionLines.length) {
      for (let index = 0; index < currentLines.length; index += 1) {
        if (currentLines[index] === suggestionLines[index]) {
          continue;
        }

        fragments.push(...buildPairIssueFragments(issue, currentLines[index], suggestionLines[index]));
      }
    } else {
      fragments.push(...buildPairIssueFragments(issue, currentText, suggestion));
    }

    return fragments.filter(Boolean);
  }

  function buildPairIssueFragments(issue, currentText, suggestion) {
    const currentValue = normalizeLineEndings(currentText);
    const suggestionValue = normalizeLineEndings(suggestion);
    if (currentValue === suggestionValue) {
      return [];
    }

    const clusters = buildDiffClusters(currentValue, suggestionValue);
    if (!clusters.length) {
      return [createFallbackIssueFragment(issue, currentValue, suggestionValue)];
    }

    return clusters.map((cluster, index) =>
      createIssueFragmentFromCluster(issue, currentValue, suggestionValue, cluster, index, clusters.length)
    );
  }

  function buildDiffClusters(currentText, suggestion) {
    const left = String(currentText || "");
    const right = String(suggestion || "");
    if (left === right) {
      return [];
    }

    if (left.length * right.length > 120000) {
      return [buildFallbackDiffCluster(left, right)];
    }

    const segments = buildDiffSegments(left, right);
    if (!segments.length) {
      return [buildFallbackDiffCluster(left, right)];
    }

    const clusters = [];
    let currentCluster = null;

    for (const segment of segments) {
      if (segment.type === "equal") {
        if (!currentCluster) {
          continue;
        }

        if (shouldMergeDiffBridge(segment.text)) {
          currentCluster.leftEnd = segment.leftEnd;
          currentCluster.rightEnd = segment.rightEnd;
          continue;
        }

        clusters.push(currentCluster);
        currentCluster = null;
        continue;
      }

      if (!currentCluster) {
        currentCluster = {
          leftStart: segment.leftStart,
          leftEnd: segment.leftEnd,
          rightStart: segment.rightStart,
          rightEnd: segment.rightEnd,
        };
        continue;
      }

      currentCluster.leftEnd = segment.leftEnd;
      currentCluster.rightEnd = segment.rightEnd;
    }

    if (currentCluster) {
      clusters.push(currentCluster);
    }

    return clusters.length ? clusters : [buildFallbackDiffCluster(left, right)];
  }

  function buildDiffSegments(currentText, suggestion) {
    const leftChars = String(currentText || "").split("");
    const rightChars = String(suggestion || "").split("");
    const rows = leftChars.length + 1;
    const cols = rightChars.length + 1;
    const table = Array.from({ length: rows }, () => new Array(cols).fill(0));

    for (let row = 0; row < rows; row += 1) {
      table[row][0] = row;
    }

    for (let col = 0; col < cols; col += 1) {
      table[0][col] = col;
    }

    for (let row = 1; row < rows; row += 1) {
      for (let col = 1; col < cols; col += 1) {
        if (leftChars[row - 1] === rightChars[col - 1]) {
          table[row][col] = table[row - 1][col - 1];
        } else {
          table[row][col] = Math.min(table[row - 1][col - 1], table[row - 1][col], table[row][col - 1]) + 1;
        }
      }
    }

    const raw = [];
    let row = leftChars.length;
    let col = rightChars.length;
    while (row > 0 || col > 0) {
      if (row > 0 && col > 0 && leftChars[row - 1] === rightChars[col - 1]) {
        raw.push({ type: "equal", leftText: leftChars[row - 1], rightText: rightChars[col - 1] });
        row -= 1;
        col -= 1;
        continue;
      }

      const replaceCost = row > 0 && col > 0 ? table[row - 1][col - 1] : Number.POSITIVE_INFINITY;
      const deleteCost = row > 0 ? table[row - 1][col] : Number.POSITIVE_INFINITY;
      const insertCost = col > 0 ? table[row][col - 1] : Number.POSITIVE_INFINITY;
      const bestCost = Math.min(replaceCost, deleteCost, insertCost);

      if (row > 0 && col > 0 && replaceCost === bestCost) {
        raw.push({ type: "replace", leftText: leftChars[row - 1], rightText: rightChars[col - 1] });
        row -= 1;
        col -= 1;
      } else if (row > 0 && deleteCost === bestCost) {
        raw.push({ type: "delete", leftText: leftChars[row - 1], rightText: "" });
        row -= 1;
      } else {
        raw.push({ type: "insert", leftText: "", rightText: rightChars[col - 1] });
        col -= 1;
      }
    }

    raw.reverse();

    const segments = [];
    let leftOffset = 0;
    let rightOffset = 0;
    for (const entry of raw) {
      const leftText = entry.leftText || "";
      const rightText = entry.rightText || "";
      const previous = segments[segments.length - 1];
      if (previous && previous.type === entry.type) {
        previous.leftText += leftText;
        previous.rightText += rightText;
        previous.leftEnd += leftText.length;
        previous.rightEnd += rightText.length;
        previous.text = previous.type === "equal" ? previous.leftText : "";
      } else {
        segments.push({
          type: entry.type,
          text: entry.type === "equal" ? leftText : "",
          leftText,
          rightText,
          leftStart: leftOffset,
          leftEnd: leftOffset + leftText.length,
          rightStart: rightOffset,
          rightEnd: rightOffset + rightText.length,
        });
      }

      leftOffset += leftText.length;
      rightOffset += rightText.length;
    }

    return segments;
  }

  function shouldMergeDiffBridge(value) {
    const text = String(value || "");
    return !!text && text.length <= 4 && !/[\s.,!?;:()[\]{}"'“”‘’<>]/.test(text);
  }

  function buildFallbackDiffCluster(currentText, suggestion) {
    const left = String(currentText || "");
    const right = String(suggestion || "");
    let prefix = 0;
    while (prefix < left.length && prefix < right.length && left[prefix] === right[prefix]) {
      prefix += 1;
    }

    let suffix = 0;
    while (
      suffix < left.length - prefix &&
      suffix < right.length - prefix &&
      left[left.length - suffix - 1] === right[right.length - suffix - 1]
    ) {
      suffix += 1;
    }

    return {
      leftStart: prefix,
      leftEnd: Math.max(prefix, left.length - suffix),
      rightStart: prefix,
      rightEnd: Math.max(prefix, right.length - suffix),
    };
  }

  function createIssueFragmentFromCluster(issue, currentText, suggestion, cluster, index, total) {
    const snippetCurrent = buildSnippetForCluster(currentText, cluster.leftStart, cluster.leftEnd);
    const snippetSuggestion = buildSnippetForCluster(suggestion, cluster.rightStart, cluster.rightEnd);
    const changeCurrent = currentText.slice(cluster.leftStart, cluster.leftEnd);
    const changeSuggestion = suggestion.slice(cluster.rightStart, cluster.rightEnd);
    return {
      node: issue.node,
      currentText: snippetCurrent,
      suggestion: snippetSuggestion,
      kind: issue.kind,
      reason: buildDetailedFragmentReason(issue, changeCurrent, changeSuggestion),
      source: issue.source || "local",
      annotationFragment: true,
      fragmentIndex: index,
      fragmentCount: total,
    };
  }

  function createFallbackIssueFragment(issue, currentText, suggestion) {
    const currentValue = typeof currentText === "string" ? currentText : String(issue && issue.currentText ? issue.currentText : "");
    const suggestionValue = typeof suggestion === "string" ? suggestion : String(issue && issue.suggestion ? issue.suggestion : "");
    return {
      node: issue.node,
      currentText: currentValue,
      suggestion: suggestionValue,
      kind: issue.kind,
      reason: buildDetailedFragmentReason(issue, currentValue, suggestionValue),
      source: issue.source || "local",
      annotationFragment: true,
      fragmentIndex: 0,
      fragmentCount: 1,
    };
  }

  function buildSnippetForCluster(text, start, end) {
    const value = normalizeLineEndings(text);
    const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const nextBreak = value.indexOf("\n", end);
    const lineEnd = nextBreak >= 0 ? nextBreak : value.length;
    if (lineEnd - lineStart <= 48) {
      return value.slice(lineStart, lineEnd);
    }

    const contextStart = findSnippetStart(value, start, lineStart);
    const contextEnd = findSnippetEnd(value, end, lineEnd);
    const prefix = contextStart > lineStart ? "..." : "";
    const suffix = contextEnd < lineEnd ? "..." : "";
    return `${prefix}${value.slice(contextStart, contextEnd)}${suffix}`;
  }

  function findSnippetStart(text, start, lineStart) {
    const min = Math.max(lineStart, start - 18);
    for (let index = start - 1; index >= min; index -= 1) {
      if (/\s/.test(text[index])) {
        return index + 1;
      }
    }

    return min;
  }

  function findSnippetEnd(text, end, lineEnd) {
    const max = Math.min(lineEnd, end + 18);
    for (let index = end; index < max; index += 1) {
      if (/\s/.test(text[index])) {
        return index;
      }
    }

    return max;
  }

  function buildDetailedFragmentReason(issue, currentText, suggestion) {
    const currentValue = String(currentText || "");
    const suggestionValue = String(suggestion || "");
    const kindLabels = getAnnotationKindLabels(issue);

    if (!currentValue && suggestionValue) {
      if (isWhitespaceOnly(suggestionValue) || kindLabels.includes("띄어쓰기")) {
        return `띄어쓰기 ${formatReasonToken(suggestionValue)} 추가`;
      }

      if (isPunctuationOnly(suggestionValue) || kindLabels.includes("문장부호")) {
        return `문장부호 ${formatReasonToken(suggestionValue)} 추가`;
      }

      return `오타 ${formatReasonToken(suggestionValue)} 소실`;
    }

    if (currentValue && !suggestionValue) {
      if (isWhitespaceOnly(currentValue) || kindLabels.includes("띄어쓰기")) {
        return `띄어쓰기 ${formatReasonToken(currentValue)} 제거`;
      }

      if (isPunctuationOnly(currentValue) || kindLabels.includes("문장부호")) {
        return `문장부호 ${formatReasonToken(currentValue)} 제거`;
      }

      return `불필요한 ${formatReasonToken(currentValue)} 제거`;
    }

    if (kindLabels.includes("용어 통일")) {
      return `표현 ${formatReasonToken(currentValue)} → ${formatReasonToken(suggestionValue)} 통일`;
    }

    if (kindLabels.includes("문법")) {
      return `문법 ${formatReasonToken(currentValue)} → ${formatReasonToken(suggestionValue)} 교정`;
    }

    if (
      kindLabels.includes("띄어쓰기") ||
      isWhitespaceOnly(currentValue) ||
      isWhitespaceOnly(suggestionValue) ||
      collapseWhitespace(currentValue) === collapseWhitespace(suggestionValue)
    ) {
      return `띄어쓰기 ${formatReasonToken(currentValue)} → ${formatReasonToken(suggestionValue)} 조정`;
    }

    if (kindLabels.includes("문장부호") || isPunctuationOnly(currentValue) || isPunctuationOnly(suggestionValue)) {
      return `문장부호 ${formatReasonToken(currentValue)} → ${formatReasonToken(suggestionValue)} 교정`;
    }

    return `오타 ${formatReasonToken(currentValue)} → ${formatReasonToken(suggestionValue)} 교정`;
  }

  function formatReasonToken(value) {
    const text = normalizeLineEndings(value);
    if (!text) {
      return "[empty]";
    }

    if (text === " ") {
      return "[ ]";
    }

    if (text === "\t") {
      return "[tab]";
    }

    if (text === "\n") {
      return "[\\n]";
    }

    return `[${previewText(text, 24)}]`;
  }

  function isWhitespaceOnly(value) {
    return !!String(value || "") && !/\S/.test(String(value || ""));
  }

  function isPunctuationOnly(value) {
    return !!String(value || "") && /^[.,!?;:()[\]{}"'“”‘’<>،؛؟。、，．！？：；-]+$/.test(String(value || ""));
  }

  function collapseWhitespace(value) {
    return String(value || "").replace(/\s+/g, "");
  }

  async function buildTypoIssues(textNodes, context, proofingSettings, options) {
    const issues = [];
    const seen = new Set();
    let aiError = "";
    const auditProfile = normalizeTypoAuditProfile(options && options.auditProfile);
    const useSpeedProfile = auditProfile === "speed";
    const aiPromise = useSpeedProfile ? null : requestAiTypoIssues(textNodes, context, proofingSettings);
    const localIssues = [];

    for (const node of textNodes) {
      const text = getTextValue(node);
      if (!text) {
        continue;
      }

      if (isWholeTextProtected(text, proofingSettings)) {
        continue;
      }

      for (const issue of collectRuleIssues(node, text, context)) {
        if (
          issueRespectsProofingTerms(issue.currentText, issue.suggestion, proofingSettings) &&
          changeMatchesCorrectionPolicy(issue.currentText, issue.suggestion, issue.kind)
        ) {
          localIssues.push(issue);
        }
      }
    }

    const aiResult = aiPromise
      ? await aiPromise
      : {
          issues: [],
          aiError: "",
          aiMeta: createAiMeta("local-only", "", "", "속도용 검수는 AI 호출 없이 로컬 규칙만 사용합니다."),
        };
    aiResult.issues = filterIssuesForProofing(aiResult.issues, proofingSettings);
    aiError = aiResult.aiError || "";
    const useAiPrimary = !useSpeedProfile && Array.isArray(aiResult.issues) && aiResult.issues.length > 0;
    const primaryIssues = useAiPrimary ? aiResult.issues : localIssues;
    const secondaryIssues = useAiPrimary ? localIssues : [];

    for (const issue of primaryIssues) {
      pushUniqueIssue(issues, seen, issue);
    }

    for (const issue of secondaryIssues) {
      pushUniqueIssue(issues, seen, issue);
    }

    return {
      issues: mergeIssuesByNode(issues),
      aiError,
      strategy: useSpeedProfile ? "speed-local" : useAiPrimary ? "ai-primary" : "local-fallback",
      aiMeta: aiResult.aiMeta || createAiMeta("unknown", "", "", ""),
    };
  }

  function pushUniqueIssue(target, seen, issue) {
    if (!issue || !issue.node || !issue.node.id) {
      return;
    }

    const key = `${issue.node.id}:${issue.suggestion}:${issue.reason}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    target.push(issue);
  }

  function mergeIssuesByNode(issues) {
    if (!Array.isArray(issues) || !issues.length) {
      return [];
    }

    const grouped = new Map();
    for (const issue of issues) {
      if (!issue || !issue.node || !issue.node.id) {
        continue;
      }

      const bucket = grouped.get(issue.node.id) || [];
      bucket.push(issue);
      grouped.set(issue.node.id, bucket);
    }

    const merged = [];
    for (const nodeIssues of grouped.values()) {
      merged.push(mergeNodeIssues(nodeIssues));
    }

    return merged.filter(Boolean);
  }

  function mergeNodeIssues(nodeIssues) {
    const sourceIssues = Array.isArray(nodeIssues) ? nodeIssues.filter(Boolean) : [];
    if (!sourceIssues.length) {
      return null;
    }

    if (sourceIssues.length === 1) {
      return sourceIssues[0];
    }

    const baseIssue = sourceIssues[0];
    const baseText = normalizeLineEndings(baseIssue.currentText);
    if (!baseText) {
      return baseIssue;
    }

    const accepted = [];
    let order = 0;
    for (const issue of sourceIssues) {
      if (!issue || normalizeLineEndings(issue.currentText) !== baseText) {
        continue;
      }

      const clusters = buildDiffClusters(baseText, issue.suggestion);
      if (!clusters.length) {
        continue;
      }

      for (const cluster of clusters) {
        const candidate = {
          leftStart: cluster.leftStart,
          leftEnd: cluster.leftEnd,
          rightText: issue.suggestion.slice(cluster.rightStart, cluster.rightEnd),
          issue,
          order: order++,
        };
        if (hasConflictingMergedCluster(accepted, candidate)) {
          continue;
        }

        accepted.push(candidate);
      }
    }

    if (!accepted.length) {
      return baseIssue;
    }

    if (accepted.length === 1 && sourceIssues.length > 0) {
      return accepted[0].issue || baseIssue;
    }

    accepted.sort((left, right) => left.leftStart - right.leftStart || left.order - right.order);

    let mergedText = "";
    let cursor = 0;
    for (const entry of accepted) {
      mergedText += baseText.slice(cursor, entry.leftStart);
      mergedText += entry.rightText;
      cursor = entry.leftEnd;
    }
    mergedText += baseText.slice(cursor);

    if (!mergedText || mergedText === baseText) {
      return baseIssue;
    }

    const fragments = accepted
      .map((entry) => buildPairIssueFragments(entry.issue, baseText.slice(entry.leftStart, entry.leftEnd), entry.rightText)[0] || null)
      .filter(Boolean);
    const mergedIssue = createIssue(
      baseIssue.node,
      baseText,
      mergedText,
      accepted.some((entry) => entry.issue && entry.issue.kind === "臾몃쾿") ? "臾몃쾿" : baseIssue.kind,
      "같은 텍스트 노드의 여러 언어 교정 후보를 함께 병합했습니다.",
      accepted.some((entry) => entry.issue && entry.issue.source === "ai") ? "ai" : baseIssue.source || "local"
    );
    if (fragments.length > 0) {
      mergedIssue.annotationFragments = fragments;
    }

    return mergedIssue;
  }

  function hasConflictingMergedCluster(accepted, candidate) {
    for (const entry of accepted) {
      const leftOverlaps = candidate.leftStart < entry.leftEnd && entry.leftStart < candidate.leftEnd;
      const sameInsertionPoint =
        candidate.leftStart === candidate.leftEnd &&
        entry.leftStart === entry.leftEnd &&
        candidate.leftStart === entry.leftStart;
      if (leftOverlaps || sameInsertionPoint) {
        return true;
      }
    }

    return false;
  }

  function buildAiTypoCandidates(textNodes, proofingSettings) {
    const candidates = [];

    for (const node of textNodes) {
      const text = String(getTextValue(node) || "");
      if (!text) {
        continue;
      }

      if (isWholeTextProtected(text, proofingSettings)) {
        continue;
      }

      for (const candidate of splitTextNodeIntoAiTypoCandidates(node, text)) {
        candidates.push(candidate);
      }
    }

    return candidates;
  }

  function splitTextNodeIntoAiTypoCandidates(node, text) {
    const currentText = normalizeLineEndings(text);
    const lines = currentText.split("\n");
    const nonEmptyLineIndexes = [];

    for (let index = 0; index < lines.length; index += 1) {
      if (compactText(lines[index])) {
        nonEmptyLineIndexes.push(index);
      }
    }

    if (nonEmptyLineIndexes.length <= 1) {
      return [
        {
          id: node.id,
          node,
          nodeId: node.id,
          name: safeName(node),
          text: currentText,
          currentText,
          scope: "node",
        },
      ];
    }

    return nonEmptyLineIndexes.map((lineIndex) => ({
      id: `${node.id}::line:${lineIndex}`,
      node,
      nodeId: node.id,
      name: safeName(node),
      text: lines[lineIndex],
      currentText,
      scope: "line",
      lineIndex,
    }));
  }

  function applyAiTypoCandidateSuggestion(candidate, suggestion) {
    if (!candidate || typeof candidate !== "object") {
      return "";
    }

    const currentText = normalizeLineEndings(candidate.currentText || "");
    const suggestionText = normalizeLineEndings(suggestion);
    if (!currentText || !suggestionText) {
      return "";
    }

    if (candidate.scope !== "line") {
      return suggestionText;
    }

    if (countTextLines(suggestionText) !== 1 || typeof candidate.lineIndex !== "number") {
      return "";
    }

    const lines = currentText.split("\n");
    if (candidate.lineIndex < 0 || candidate.lineIndex >= lines.length) {
      return "";
    }

    lines[candidate.lineIndex] = suggestionText;
    return lines.join("\n");
  }

  async function requestAiTypoIssues(textNodes, context, proofingSettings) {
    const ai = getAiHelper();
    if (!ai) {
      return { issues: [], aiError: "", aiMeta: createAiMeta("unavailable", "", "", "AI helper unavailable") };
    }

    let configured = false;
    let runInfo = { provider: "", model: "" };
    try {
      configured = await ai.hasConfiguredAiAsync();
      if (typeof ai.getAiSettingsAsync === "function" && typeof ai.getResolvedRunInfo === "function") {
        const settings = await ai.getAiSettingsAsync();
        runInfo = ai.getResolvedRunInfo(settings, { modelByProvider: TYPO_AUDIT_MODEL_BY_PROVIDER });
      }
    } catch (error) {
      configured = false;
    }

    if (!configured) {
      return {
        issues: [],
        aiError: "AI 설정이 꺼져 있거나 API 키가 없어 로컬 규칙만 사용했습니다.",
        aiMeta: createAiMeta("not-configured", runInfo.provider, runInfo.model, "AI 설정이 비어 있습니다."),
      };
    }

    const candidates = buildAiTypoCandidates(textNodes, proofingSettings);

    if (!candidates.length) {
      return {
        issues: [],
        aiError: "",
        aiMeta: createAiMeta("skipped", runInfo.provider, runInfo.model, "검수할 텍스트 후보가 없습니다."),
      };
    }

    const schema = {
      type: "object",
      properties: {
        issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              suggestion: { type: "string" },
              reason: { type: "string" },
              kind: { type: "string" },
            },
            required: ["id", "suggestion", "reason", "kind"],
          },
        },
      },
      required: ["issues"],
    };
    const instructions =
      "You review UI copy inside a Figma plugin. Detect only obvious spelling mistakes, broken words, malformed polite endings, spacing errors, punctuation errors, and clearly broken grammar. Be conservative: if a word is already a valid standard word in its language, keep it unless the surrounding sentence is clearly wrong with that exact word. Never replace one valid word with another valid word just because the spellings are similar. Example: keep 'optimal motion' unchanged and never change it to 'optional motion'. Preserve the original language, script, wording, product naming, and marketing intent of each string. Do not translate, localize, rewrite into the dominant language of the screen, unify terminology, smooth tone, or replace brand/product names unless the product name itself has an obvious typo. In mixed-language strings, preserve every language segment as-is and only fix the clearly broken part inside that same language segment. Some textNodes are full node strings, while others are single extracted lines from a multiline node. If an item is a single extracted line, return a corrected single line only and do not rewrite neighboring lines. If preferredLocaleHint is provided, use it only for Latin-script nodes or segments that actually fit that locale. Do not suppress Korean, English, or other script corrections just because another preferred locale is set. If latinLocaleHint is provided, keep corrections inside that locale only for matching Latin-script segments. Ignore cosmetic whitespace cleanup such as empty brackets, bracket spacing, or punctuation-only cleanup. Only flag spacing when a word is visibly broken into fragments, for example 'app le' -> 'apple'. Example: German copy with an English brand should stay mixed as needed: 'Find e deine perfekte Work-Life-Balanfce mit LG' -> 'Finde deine perfekte Work-Life-Balance mit LG', 'Jedtazt kaufenq' -> 'Jetzt kaufen', while keeping 'LG' untouched. Return the full corrected string in suggestion for the given item, never only a changed token. If the original text contains multiple lines, preserve every line and keep the same line count unless the user text itself clearly intends a merge. Never drop unrelated lower lines. Never edit any protectedTerms under any circumstances. Never mark userDictionary terms as mistakes. Example: '방갑스비난.' should be corrected to the full string '반갑습니다.' If the text looks fine, omit it. Return concise reasons in Korean when possible.";
    const payload = {
      languageHint: context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "?먮룞 媛먯?",
      preferredLocaleHint: context.proofingLocale || "",
      preferredLocaleLabel: context.proofingLocaleAiLabel || context.proofingLocaleLabel || "",
      languageFamilyHint: detectLanguageFamilyLabel(context.detectedLanguageLabel || context.languageLabel || ""),
      contextLabel: context.contextLabel,
      latinLocaleHint: context.latinLocaleHint || inferLatinLocaleHint(candidates.map((entry) => entry.text).join("\n")),
      userDictionary: proofingSettings ? proofingSettings.userDictionary : [],
      protectedTerms: proofingSettings ? proofingSettings.protectedTerms : [],
      textNodes: candidates.slice(0, 48).map((entry) => ({
        id: entry.id,
        name: entry.name,
        text: entry.text,
        lineCount: countTextLines(entry.text),
        lines: String(entry.text || "").split(/\r?\n/),
        scriptFamilies: getActiveScriptFamilies(entry.text),
        mixedLanguage: getActiveScriptFamilies(entry.text).length > 1,
        latinLocaleHint: context.latinLocaleHint || inferLatinLocaleHint(entry.text),
        segmentScope: entry.scope || "node",
        lineIndex: typeof entry.lineIndex === "number" ? entry.lineIndex : -1,
      })),
    };

    try {
      let response = null;

      try {
        response = await ai.requestJsonTask({
        instructions: instructions ||
          "You review UI copy inside a Figma plugin. Detect only obvious spelling mistakes, broken words, malformed polite endings, spacing errors, punctuation errors, and clearly broken grammar. Preserve the original language, script, wording, and product naming of each string. Do not translate, localize, rewrite into the dominant language of the screen, unify terminology, smooth tone, or replace brand/product names unless the product name itself has an obvious typo. In mixed-language strings, preserve every language segment as-is and only fix the clearly broken part inside that same language segment. If preferredLocaleHint is provided, treat it as the primary locale/country hint. If latinLocaleHint is provided, keep corrections inside that locale. Ignore cosmetic whitespace cleanup such as empty brackets, bracket spacing, or punctuation-only cleanup. Only flag spacing when a word is visibly broken into fragments, for example 'app le' -> 'apple'. Example: German copy with an English brand should stay mixed as needed: 'Find e deine perfekte Work-Life-Balanfce mit LG' -> 'Finde deine perfekte Work-Life-Balance mit LG', 'Jedtazt kaufenq' -> 'Jetzt kaufen', while keeping 'LG' untouched. Return the full corrected string in suggestion, never only a changed token. If the original text contains multiple lines, preserve every line and keep the same line count unless the user text itself clearly intends a merge. Never drop unrelated lower lines. Never edit any protectedTerms under any circumstances. Never mark userDictionary terms as mistakes. Example: '방갑스비난.' should be corrected to the full string '반갑습니다.' If the text looks fine, omit it. Return concise reasons in Korean when possible.",
        schema: schema,
        payload: payload || {
          languageHint:
            context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "자동 감지",
          preferredLocaleHint: context.proofingLocale || "",
          preferredLocaleLabel: context.proofingLocaleAiLabel || context.proofingLocaleLabel || "",
          languageFamilyHint: detectLanguageFamilyLabel(context.detectedLanguageLabel || context.languageLabel || ""),
          contextLabel: context.contextLabel,
          latinLocaleHint: context.latinLocaleHint || inferLatinLocaleHint(candidates.map((entry) => entry.text).join("\n")),
          userDictionary: proofingSettings ? proofingSettings.userDictionary : [],
          protectedTerms: proofingSettings ? proofingSettings.protectedTerms : [],
          textNodes: candidates.slice(0, 48).map((entry) => ({
            id: entry.id,
            name: entry.name,
            text: entry.text,
            lineCount: countTextLines(entry.text),
            lines: String(entry.text || "").split(/\r?\n/),
            scriptFamilies: getActiveScriptFamilies(entry.text),
            mixedLanguage: getActiveScriptFamilies(entry.text).length > 1,
            latinLocaleHint: context.latinLocaleHint || inferLatinLocaleHint(entry.text),
            segmentScope: entry.scope || "node",
            lineIndex: typeof entry.lineIndex === "number" ? entry.lineIndex : -1,
          })),
        },
        modelByProvider: TYPO_AUDIT_MODEL_BY_PROVIDER,
      });
      } catch (error) {
        if (!shouldRetryTypoAuditWithDefaultModel(error)) {
          throw error;
        }

        response = await ai.requestJsonTask({
          instructions,
          schema,
          payload,
        });
      }

      const rows = response && Array.isArray(response.issues) ? response.issues : [];
      const candidateMap = new Map();
      for (const candidate of candidates) {
        candidateMap.set(candidate.id, candidate);
      }

      const results = [];
      for (const row of rows) {
        if (!row || typeof row !== "object" || typeof row.id !== "string" || typeof row.suggestion !== "string") {
          continue;
        }

        const candidate = candidateMap.get(row.id);
        if (!candidate || !candidate.node) {
          continue;
        }

        const node = candidate.node;
        const currentText = normalizeLineEndings(candidate.currentText || "");
        const suggestion = applyAiTypoCandidateSuggestion(candidate, String(row.suggestion || ""));
        if (!currentText || !suggestion || compactText(currentText) === compactText(suggestion)) {
          continue;
        }

        const kind = typeof row.kind === "string" && row.kind.trim() ? row.kind.trim() : "AI 검수";
        if (!changeMatchesCorrectionPolicy(currentText, suggestion, kind)) {
          continue;
        }

        results.push(createIssue(node, currentText, suggestion, kind, typeof row.reason === "string" && row.reason.trim() ? row.reason.trim() : "AI 검수 후보", "ai"));
      }

      return {
        issues: results,
        aiError: "",
        aiMeta: createAiMeta("success", response && response._provider ? response._provider : runInfo.provider, response && response._model ? response._model : runInfo.model, ""),
      };
    } catch (error) {
      const message = normalizeErrorMessage(error, "AI 오타 검수 호출에 실패했습니다.");
      return {
        issues: [],
        aiError: message,
        aiMeta: createAiMeta("error", runInfo.provider, runInfo.model, message),
      };
    }
  }

  function shouldRetryTypoAuditWithDefaultModel(error) {
    const compact = String(normalizeErrorMessage(error, "") || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    if (!compact || !compact.includes("model")) {
      return false;
    }

    return (
      compact.includes("does not exist") ||
      compact.includes("not found") ||
      compact.includes("unsupported") ||
      compact.includes("not supported") ||
      compact.includes("invalid model") ||
      compact.includes("permission") ||
      compact.includes("access") ||
      compact.includes("not available") ||
      compact.includes("unavailable")
    );
  }

  function createAiMeta(status, provider, model, error) {
    const normalizedStatus = String(status || "unknown");
    const providerLabel = provider ? String(provider) : "provider 미확인";
    const modelLabel = model ? String(model) : "model 미확인";
    let statusLabel = "AI 상태 미확인";

    if (normalizedStatus === "success") {
      statusLabel = "AI 호출 성공";
    } else if (normalizedStatus === "error") {
      statusLabel = "AI 호출 실패";
    } else if (normalizedStatus === "not-configured") {
      statusLabel = "AI 설정 없음";
    } else if (normalizedStatus === "skipped") {
      statusLabel = "AI 호출 건너뜀";
    } else if (normalizedStatus === "local-only") {
      statusLabel = "AI 호출 안 함";
    } else if (normalizedStatus === "unavailable") {
      statusLabel = "AI helper 없음";
    }

    return {
      status: normalizedStatus,
      statusLabel,
      providerLabel,
      modelLabel,
      error: error ? String(error) : "",
    };
  }

  function collectRuleIssues(node, text, context) {
    const issues = [];
    const normalizedText = String(text || "");
    const languageFamily = detectLanguageFamilyFromText(normalizedText) || detectLanguageFamilyLabel(context && context.detectedLanguageLabel);

    const singleSpace = normalizeInlineWhitespace(normalizedText);
    if (singleSpace !== normalizedText) {
      issues.push(createIssue(node, normalizedText, singleSpace, "중복 공백", "연속된 공백을 한 칸으로 바로잡았습니다."));
    }

    const punctuationNormalized = normalizePunctuationSpacing(normalizedText, languageFamily);
    if (punctuationNormalized !== normalizedText) {
      issues.push(
        createIssue(
          node,
          normalizedText,
          punctuationNormalized,
          "문장부호 간격",
          getPunctuationSpacingReason(languageFamily)
        )
      );
    }

    const noSpaceScriptNormalized = normalizeNoSpaceScriptSpacing(normalizedText, languageFamily);
    if (noSpaceScriptNormalized !== normalizedText) {
      issues.push(
        createIssue(node, normalizedText, noSpaceScriptNormalized, "공백 정리", getNoSpaceScriptReason(languageFamily))
      );
    }

    const repeatedPunctuation = normalizeRepeatedPunctuation(normalizedText);
    if (repeatedPunctuation !== normalizedText) {
      issues.push(
        createIssue(node, normalizedText, repeatedPunctuation, "반복 문장부호", "반복된 문장부호를 바로잡았습니다.")
      );
    }

    for (const issue of collectTypoReplacementIssues(node, normalizedText)) {
      issues.push(issue);
    }

    for (const issue of collectPhraseHintIssues(node, normalizedText)) {
      issues.push(issue);
    }

    for (const issue of collectLatinTokenIssues(node, normalizedText, languageFamily, context && context.latinLocaleHint)) {
      issues.push(issue);
    }

    return issues;
  }

  function collectPhraseHintIssues(node, text) {
    const issues = [];
    const normalizedText = normalizeLineEndings(text);
    const lines = normalizedText.split("\n");
    for (let index = 0; index < lines.length; index += 1) {
      const hint = getPhraseHintForLine(lines[index]);
      if (!hint) {
        continue;
      }

      const nextLines = lines.slice();
      nextLines[index] = hint.suggestion;
      issues.push(createIssue(node, normalizedText, nextLines.join("\n"), hint.kind, hint.reason));
    }

    return issues;
  }

  function getPhraseHintForLine(text) {
    const compactHangul = String(text || "")
      .replace(/[.!?,;:~"'`()\[\]{}<>]/g, "")
      .replace(/\s+/g, "")
      .trim();
    if (!compactHangul || !/^[가-힣]+$/.test(compactHangul)) {
      return null;
    }

    for (const hint of TYPO_PHRASE_HINTS) {
      const canonical = String(hint.canonical || "").trim();
      if (!canonical || compactHangul === canonical) {
        continue;
      }

      if (Math.abs(compactHangul.length - canonical.length) > 2) {
        continue;
      }

      const distance = getEditDistance(compactHangul, canonical);
      if (distance > hint.maxDistance) {
        continue;
      }

      return hint;
    }

    return null;
  }

  function getEditDistance(left, right) {
    const a = String(left || "");
    const b = String(right || "");
    const rows = a.length + 2;
    const cols = b.length + 2;
    const maxDistance = a.length + b.length;
    const table = Array.from({ length: rows }, () => new Array(cols).fill(0));
    const lastSeen = new Map();

    table[0][0] = maxDistance;
    for (let row = 0; row <= a.length; row += 1) {
      table[row + 1][0] = maxDistance;
      table[row + 1][1] = row;
    }

    for (let col = 0; col <= b.length; col += 1) {
      table[0][col + 1] = maxDistance;
      table[1][col + 1] = col;
    }

    for (let row = 1; row <= a.length; row += 1) {
      let lastMatchColumn = 0;
      for (let col = 1; col <= b.length; col += 1) {
        const previousRow = lastSeen.get(b[col - 1]) || 0;
        const previousColumn = lastMatchColumn;
        const cost = a[row - 1] === b[col - 1] ? 0 : 1;
        if (cost === 0) {
          lastMatchColumn = col;
        }

        table[row + 1][col + 1] = Math.min(
          table[row][col] + cost,
          table[row + 1][col] + 1,
          table[row][col + 1] + 1,
          table[previousRow][previousColumn] + (row - previousRow - 1) + 1 + (col - previousColumn - 1)
        );
      }

      lastSeen.set(a[row - 1], row);
    }

    return table[a.length + 1][b.length + 1];
  }

  function collectLatinTokenIssues(node, text, languageFamily, latinLocaleHint) {
    if (languageFamily !== "latin") {
      return [];
    }

    const hintPool = getLatinTokenHintPool(latinLocaleHint);
    if (!hintPool.length) {
      return [];
    }

    const issues = [];
    const value = String(text || "");
    const matches = value.matchAll(/\b[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'-]{3,}\b/g);

    for (const match of matches) {
      const token = match && typeof match[0] === "string" ? match[0] : "";
      const index = match && typeof match.index === "number" ? match.index : -1;
      if (!token || index < 0) {
        continue;
      }

      const bestHint = findBestLatinTokenHint(token, latinLocaleHint);
      if (!bestHint) {
        continue;
      }

      const replacement = applyLatinTokenCase(bestHint.canonical, token);
      if (!replacement || replacement === token) {
        continue;
      }

      const suggestion = value.slice(0, index) + replacement + value.slice(index + token.length);
      issues.push(
        createIssue(
          node,
          value,
          suggestion,
          "Latin spelling",
          `라틴 문자 UI 단어 '${token}'가 '${replacement}'의 오타처럼 보여 후보로 표시했습니다.`
        )
      );
    }

    return issues;
  }

  function findBestLatinTokenHint(token, latinLocaleHint) {
    const normalizedToken = normalizeLatinTokenForLookup(token);
    if (!normalizedToken || normalizedToken.length < 4) {
      return null;
    }

    const hintPool = getLatinTokenHintPool(latinLocaleHint);
    if (!hintPool.length) {
      return null;
    }

    let best = null;
    let second = null;
    for (const canonical of hintPool) {
      const normalizedCanonical = normalizeLatinTokenForLookup(canonical);
      if (!normalizedCanonical || normalizedCanonical === normalizedToken) {
        continue;
      }

      if (normalizedCanonical[0] !== normalizedToken[0]) {
        continue;
      }

      if (Math.abs(normalizedCanonical.length - normalizedToken.length) > 2) {
        continue;
      }

      const distance = getEditDistance(normalizedToken, normalizedCanonical);
      const threshold = normalizedToken.length >= 7 ? 2 : 1;
      if (distance > threshold) {
        continue;
      }

      if (
        distance === 2 &&
        normalizedToken.length < 7 &&
        normalizedCanonical.slice(0, 2) !== normalizedToken.slice(0, 2)
      ) {
        continue;
      }

      const candidate = {
        canonical,
        normalizedCanonical,
        distance,
      };

      if (!best || candidate.distance < best.distance) {
        second = best;
        best = candidate;
      } else if (!second || candidate.distance < second.distance) {
        second = candidate;
      }
    }

    if (!best) {
      return null;
    }

    if (second && second.distance === best.distance && second.normalizedCanonical !== best.normalizedCanonical) {
      return null;
    }

    return best;
  }

  function getLatinTokenHintPool(latinLocaleHint) {
    const normalizedHint = String(latinLocaleHint || "").trim().toLowerCase();
    if (!normalizedHint) {
      return [];
    }

    return Object.prototype.hasOwnProperty.call(LATIN_UI_TOKEN_HINTS_BY_LOCALE, normalizedHint)
      ? LATIN_UI_TOKEN_HINTS_BY_LOCALE[normalizedHint]
      : [];
  }

  function resolveLatinTokenLocaleHint(context, text) {
    const contextHint = String(context && context.latinLocaleHint ? context.latinLocaleHint : "").trim().toLowerCase();
    if (contextHint) {
      return contextHint;
    }

    return inferLatinLocaleHint(text);
  }

  function normalizeLatinTokenForLookup(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['’-]/g, "")
      .toLowerCase()
      .trim();
  }

  function inferLatinLocaleHint(text) {
    const normalized = normalizeLatinTokenForLookup(text).replace(/[^a-z0-9\s]/g, " ");
    if (!normalized) {
      return "";
    }

    const tokens = normalized.split(/\s+/).filter(Boolean);
    if (!tokens.length) {
      return "";
    }

    const locales = [
      ["german", ["der", "die", "das", "und", "mit", "deine", "dein", "finde", "jetzt", "kaufen", "angebot", "gilt", "solange", "vorrat", "reicht", "februar", "monatlich", "monatliche"]],
      ["french", ["bonjour", "continuer", "annuler", "rechercher", "parametres", "profil", "enregistrer", "fermer"]],
      ["spanish", ["hola", "continuar", "cancelar", "buscar", "correo", "usuario", "guardar", "cerrar"]],
      ["portuguese", ["ola", "pesquisar", "configuracoes", "senha", "endereco", "fechar", "salvar"]],
      ["italian", ["ciao", "continua", "annulla", "conferma", "ricerca", "impostazioni", "profilo", "salva", "chiudi"]],
      ["dutch", ["welkom", "doorgaan", "annuleren", "zoeken", "instellingen", "profiel", "opslaan", "sluiten"]],
      ["english", ["welcome", "continue", "cancel", "search", "settings", "profile", "account", "password", "download", "upload", "monthly", "find"]],
    ];

    let bestLocale = "";
    let bestScore = 0;
    for (const [locale, keywords] of locales) {
      let score = 0;
      for (const keyword of keywords) {
        if (tokens.includes(keyword)) {
          score += 1;
        }
      }

      if (score > bestScore) {
        bestLocale = locale;
        bestScore = score;
      }
    }

    return bestScore >= 2 ? bestLocale : "";
  }

  function applyLatinTokenCase(canonical, original) {
    const value = String(canonical || "");
    const sample = String(original || "");
    if (!value) {
      return value;
    }

    if (sample === sample.toUpperCase()) {
      return value.toUpperCase();
    }

    if (sample[0] && sample[0] === sample[0].toUpperCase()) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return value;
  }

  function normalizePunctuationSpacing(text, languageFamily) {
    const value = String(text || "");
    if (!value) {
      return value;
    }

    if (languageFamily === "japanese" || languageFamily === "cjk") {
      return value
        .replace(/[^\S\r\n]+([、。，．！？：；])/g, "$1")
        .replace(/([（【「『《〈])[^\S\r\n]+/g, "$1")
        .replace(/[^\S\r\n]+([）】」』》〉])/g, "$1");
    }

    if (languageFamily === "arabic") {
      return value
        .replace(/[^\S\r\n]+([،؛؟!.,:;])/g, "$1")
        .replace(/([(\[])[^\S\r\n]+/g, "$1")
        .replace(/[^\S\r\n]+([)\]])/g, "$1");
    }

    return value
      .replace(/[^\S\r\n]+([,.;:!?])/g, "$1")
      .replace(/([(\[])[^\S\r\n]+/g, "$1")
      .replace(/[^\S\r\n]+([)\]])/g, "$1");
  }

  function normalizeNoSpaceScriptSpacing(text, languageFamily) {
    const value = String(text || "");
    if (!value) {
      return value;
    }

    if (languageFamily === "japanese") {
      return value.replace(/([\u3040-\u30ff\u3400-\u9fff])[^\S\r\n]+([\u3040-\u30ff\u3400-\u9fff])/g, "$1$2");
    }

    if (languageFamily === "cjk") {
      return value.replace(/([\u3400-\u9fff])[^\S\r\n]+([\u3400-\u9fff])/g, "$1$2");
    }

    if (languageFamily === "thai") {
      return value.replace(/([\u0E00-\u0E7F])[^\S\r\n]+([\u0E00-\u0E7F])/g, "$1$2");
    }

    return value;
  }

  function normalizeRepeatedPunctuation(text) {
    return String(text || "")
      .replace(/([!?.,])\1{2,}/g, "$1$1")
      .replace(/([！？。、，．])\1{2,}/g, "$1$1")
      .replace(/([،؛؟])\1{2,}/g, "$1$1");
  }

  function normalizeInlineWhitespace(text) {
    return String(text || "").replace(/[^\S\r\n]{2,}/g, " ");
  }

  function applyTypoReplacementRules(text) {
    return mapTextLines(text, (line) => {
      let next = line;
      for (const rule of TYPO_REPLACEMENT_RULES) {
        next = next.replace(cloneRegex(rule.pattern), rule.replacement);
      }
      return next;
    });
  }

  function collectTypoReplacementIssues(node, text) {
    const issues = [];
    const normalizedText = normalizeLineEndings(text);
    const lines = normalizedText.split("\n");
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      for (const rule of TYPO_REPLACEMENT_RULES) {
        const suggestionLine = line.replace(cloneRegex(rule.pattern), rule.replacement);
        if (suggestionLine === line) {
          continue;
        }

        const nextLines = lines.slice();
        nextLines[lineIndex] = suggestionLine;
        issues.push(createIssue(node, normalizedText, nextLines.join("\n"), rule.kind, rule.reason));
      }
    }

    return issues;
  }

  function cloneRegex(pattern) {
    return pattern instanceof RegExp ? new RegExp(pattern.source, pattern.flags) : new RegExp(String(pattern || ""));
  }

  function mapTextLines(text, iteratee) {
    const lines = normalizeLineEndings(text).split("\n");
    return lines.map((line, index) => iteratee(line, index)).join("\n");
  }

  function getPunctuationSpacingReason(languageFamily) {
    if (languageFamily === "japanese" || languageFamily === "cjk") {
      return "동아시아 문장부호 앞뒤 공백이 어색해서 정리 후보로 표시했습니다.";
    }

    if (languageFamily === "arabic") {
      return "아랍 문자권 문장부호 앞뒤 공백이 어색해서 정리 후보로 표시했습니다.";
    }

    return "문장부호 앞뒤 간격이 어색해서 정리 후보로 표시했습니다.";
  }

  function getNoSpaceScriptReason(languageFamily) {
    if (languageFamily === "japanese") {
      return "일본어 문장 안의 불필요한 공백이 보여 정리 후보로 표시했습니다.";
    }

    if (languageFamily === "cjk") {
      return "중국어/한자권 문장 안의 불필요한 공백이 보여 정리 후보로 표시했습니다.";
    }

    if (languageFamily === "thai") {
      return "태국어 문장 안의 불필요한 공백이 보여 정리 후보로 표시했습니다.";
    }

    return "문장 안의 불필요한 공백이 보여 정리 후보로 표시했습니다.";
  }

  function collectConsistencyIssues(textNodes) {
    const issues = [];
    for (const rule of CONSISTENCY_RULES) {
      const matched = [];
      for (const node of textNodes) {
        const text = compactText(getTextValue(node));
        if (!text) {
          continue;
        }

        const variant = rule.variants.find((entry) => text.includes(entry));
        if (variant) {
          matched.push({ node, text, variant });
        }
      }

      const hasCanonical = matched.some((entry) => entry.variant === rule.canonical);
      if (!hasCanonical) {
        continue;
      }

      for (const entry of matched) {
        if (entry.variant === rule.canonical) {
          continue;
        }

        issues.push(
          createIssue(
            entry.node,
            entry.text,
            entry.text.replace(entry.variant, rule.canonical),
            "용어 통일",
            rule.reason
          )
        );
      }
    }

    return issues;
  }

  function createIssue(node, currentText, suggestion, kind, reason, source) {
    return {
      node,
      currentText: String(currentText || ""),
      suggestion: String(suggestion || ""),
      kind,
      reason,
      source: source || "local",
    };
  }

  function buildInsights(context, textNodes, issues, applied, usesAnnotations, aiMeta) {
    const insights = [
      `맥락 기준: ${context.contextLabel}`,
      `언어 기준: ${context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "자동 감지"}`,
      `텍스트 레이어 ${textNodes.length}개 검사`,
      usesAnnotations ? `주석 ${applied.annotationCount}건 적용` : "주석 대신 결과 패널에만 표시",
    ];

    if (aiMeta && aiMeta.statusLabel) {
      insights.push(`AI 상태: ${aiMeta.statusLabel}${aiMeta.providerLabel ? ` · ${aiMeta.providerLabel}` : ""}`);
    }

    if (issues.length === 0) {
      insights.push(
        usesAnnotations
          ? "뚜렷한 오타 후보를 찾지 못해 기존 AI 오타 주석만 정리했습니다."
          : "뚜렷한 오타 후보를 찾지 못했습니다."
      );
      return insights;
    }

    const firstIssue = issues[0];
    insights.push(`대표 후보: ${previewText(firstIssue.currentText, 32)} -> ${previewText(firstIssue.suggestion, 32)}`);
    insights.push(`가장 많은 규칙: ${summarizeKinds(issues)}`);

    if (applied.skipped.length > 0) {
      insights.push(`일부 주석은 구조 제한으로 건너뜀 ${applied.skipped.length}건`);
    } else if (usesAnnotations) {
      insights.push("Figma 주석은 Dev Mode에서 확인할 수 있습니다.");
    }

    return insights;
  }

  function buildFixInsights(context, textNodes, issues, applied, annotationApplied, aiMeta) {
    const insights = [
      `맥락 기준: ${context.contextLabel}`,
      `언어 기준: ${context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "자동 감지"}`,
      `텍스트 레이어 ${textNodes.length}개 검사`,
      `직접 수정 ${applied.appliedCount}개 적용`,
    ];

    if (annotationApplied && typeof annotationApplied.annotationCount === "number") {
      insights.push(
        annotationApplied.annotationCount > 0
          ? `수정된 텍스트에 주석 ${annotationApplied.annotationCount}건 적용`
          : "수정된 텍스트 주석은 없거나 현재 환경에서 지원되지 않았습니다."
      );
    }

    if (aiMeta && aiMeta.statusLabel) {
      insights.push(`AI 상태: ${aiMeta.statusLabel}${aiMeta.providerLabel ? ` · ${aiMeta.providerLabel}` : ""}`);
    }

    if (issues.length === 0) {
      insights.push("뚜렷한 오타 후보를 찾지 못했습니다.");
      return insights;
    }

    const firstApplied = applied.applied[0];
    if (firstApplied) {
      insights.push(`대표 수정: ${previewText(firstApplied.currentText, 32)} -> ${previewText(firstApplied.suggestion, 32)}`);
    } else {
      const firstIssue = issues[0];
      insights.push(`대표 후보: ${previewText(firstIssue.currentText, 32)} -> ${previewText(firstIssue.suggestion, 32)}`);
    }

    insights.push(`가장 많은 규칙: ${summarizeKinds(issues)}`);

    const skippedCount =
      (applied && Array.isArray(applied.skipped) ? applied.skipped.length : 0) +
      (annotationApplied && Array.isArray(annotationApplied.skipped) ? annotationApplied.skipped.length : 0);
    if (skippedCount > 0) {
      insights.push(`일부 텍스트는 구조 제한으로 건너뜀 ${skippedCount}건`);
    } else if (applied.appliedCount > 0) {
      insights.push("현재 선택 텍스트에 직접 반영했습니다.");
    }

    return insights;
  }

  function buildClearInsights(context, textNodes, applied, annotationSupported) {
    const insights = [
      `맥락 기준: ${context.contextLabel}`,
      `언어 기준: ${context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "자동 감지"}`,
      `텍스트 레이어 ${textNodes.length}개 확인`,
      annotationSupported
        ? `AI 주석 ${applied.removedAnnotationCount || 0}건 제거`
        : "현재 환경에서는 주석 제거를 지원하지 않음",
    ];

    if (Array.isArray(applied.cleared) && applied.cleared.length > 0) {
      const firstCleared = applied.cleared[0];
      insights.push(`정리 예시: ${firstCleared.nodeName} · ${firstCleared.removedCount}건 제거`);
    } else if (annotationSupported) {
      insights.push("정리할 AI 오타 주석을 찾지 못했습니다.");
    }

    if (Array.isArray(applied.skipped) && applied.skipped.length > 0) {
      insights.push(`구조 또는 환경 제한으로 ${applied.skipped.length}건 건너뜀`);
    }

    return insights;
  }

  function summarizeKinds(issues) {
    const counts = new Map();
    for (const issue of issues) {
      counts.set(issue.kind, (counts.get(issue.kind) || 0) + 1);
    }

    const top = Array.from(counts.entries()).sort((left, right) => right[1] - left[1])[0];
    return top ? `${top[0]} ${top[1]}건` : "없음";
  }

  function collectTextNodes(selection, options) {
    const settings = options && typeof options === "object" ? options : {};
    const includeHidden = settings.includeHidden === true;
    const includeLocked = settings.includeLocked === true;
    const nodes = [];
    const stack = [...selection];
    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      if ((!includeHidden && node.visible === false) || (!includeLocked && node.locked === true)) {
        continue;
      }

      if (node.type === "TEXT") {
        nodes.push(node);
      }

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return nodes;
  }

  function buildSelectionContext(selection, designReadResult, proofingSettings) {
    const roots = selection.map((node) => ({
      id: node.id,
      name: safeName(node),
      type: String(node.type || "UNKNOWN"),
    }));
    const selectionLabel = formatSelectionLabel(roots);
    const selectionSignature = getSelectionSignature(selection);
    const textSamples = collectSelectionTextSamples(selection, 8);
    const localeMeta = getProofingLocaleMetadata(proofingSettings ? proofingSettings.proofingLocale : "");
    const fallbackLatinLocaleHint = inferLatinLocaleHint(textSamples.join("\n"));
    if (
      designReadResult &&
      designReadResult.selectionSignature === selectionSignature &&
      designReadResult.summary &&
      typeof designReadResult.summary.contextLabel === "string"
    ) {
      const rawLanguageLabel =
        typeof designReadResult.summary.languageLabel === "string" ? designReadResult.summary.languageLabel : "";
      const detectedLanguageLabel = normalizeDetectedLanguage(rawLanguageLabel);
      return {
        selectionLabel,
        contextLabel: designReadResult.summary.contextLabel || "일반 UI 화면",
        languageLabel:
          typeof designReadResult.summary.languageLabel === "string" ? designReadResult.summary.languageLabel : "텍스트 언어 미감지",
        detectedLanguageLabel: normalizeDetectedLanguage(
          typeof designReadResult.summary.languageLabel === "string" ? designReadResult.summary.languageLabel : ""
        ),
        languageHintLabel: localeMeta ? localeMeta.label : detectedLanguageLabel,
        proofingLocale: localeMeta ? localeMeta.code : "",
        proofingLocaleLabel: localeMeta ? localeMeta.label : "",
        proofingLocaleAiLabel: localeMeta ? localeMeta.aiLabel : "",
        latinLocaleHint: localeMeta && localeMeta.latinLocaleHint ? localeMeta.latinLocaleHint : fallbackLatinLocaleHint,
      };
    }

    const detectedLanguageLabel = detectLanguageFromSamples(textSamples);
    return {
      selectionLabel,
      contextLabel: inferSelectionContext(selection, textSamples),
      languageLabel: detectedLanguageLabel,
      detectedLanguageLabel: detectedLanguageLabel,
      languageHintLabel: localeMeta ? localeMeta.label : detectedLanguageLabel,
      proofingLocale: localeMeta ? localeMeta.code : "",
      proofingLocaleLabel: localeMeta ? localeMeta.label : "",
      proofingLocaleAiLabel: localeMeta ? localeMeta.aiLabel : "",
      latinLocaleHint: localeMeta && localeMeta.latinLocaleHint ? localeMeta.latinLocaleHint : fallbackLatinLocaleHint,
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

  function detectLanguageFromSamples(textSamples) {
    const counts = {
      korean: 0,
      latin: 0,
      japanese: 0,
      cjk: 0,
      cyrillic: 0,
      arabic: 0,
      devanagari: 0,
      thai: 0,
      hebrew: 0,
      greek: 0,
      other: 0,
    };
    const samples = Array.isArray(textSamples) ? textSamples : [];
    for (const text of samples) {
      addScriptCounts(counts, text);
    }

    const ordered = Object.entries(counts)
      .filter((entry) => entry[1] > 0)
      .sort((left, right) => right[1] - left[1]);
    if (!ordered.length) {
      return "텍스트 언어 미감지";
    }

    if (ordered.length > 1 && ordered[1][1] >= ordered[0][1] * 0.55) {
      return "다국어 혼합";
    }

    const primary = ordered[0][0];
    switch (primary) {
      case "korean":
        return "한국어 중심";
      case "latin":
        return "영어/라틴 문자 중심";
      case "japanese":
        return "일본어 중심";
      case "cjk":
        return "중국어 한자권 중심";
      case "cyrillic":
        return "키릴 문자권 중심";
      case "arabic":
        return "아랍 문자권 중심";
      case "devanagari":
        return "데바나가리권 중심";
      case "thai":
        return "태국어 중심";
      case "hebrew":
        return "히브리어 중심";
      case "greek":
        return "그리스어 중심";
      default:
        return "다국어 혼합";
    }
  }

  function normalizeDetectedLanguage(label) {
    const normalized = String(label || "").trim();
    if (!normalized) {
      return "텍스트 언어 미감지";
    }

    if (normalized.includes("한국어")) {
      return "한국어 중심";
    }

    if (normalized.includes("영어") || normalized.includes("라틴")) {
      return "영어/라틴 문자 중심";
    }

    if (normalized.includes("일본어")) {
      return "일본어 중심";
    }

    if (normalized.includes("중국어") || normalized.includes("한자")) {
      return "중국어 한자권 중심";
    }

    if (normalized.includes("키릴")) {
      return "키릴 문자권 중심";
    }

    if (normalized.includes("아랍")) {
      return "아랍 문자권 중심";
    }

    if (normalized.includes("데바나가리")) {
      return "데바나가리권 중심";
    }

    if (normalized.includes("태국")) {
      return "태국어 중심";
    }

    if (normalized.includes("히브리")) {
      return "히브리어 중심";
    }

    if (normalized.includes("그리스")) {
      return "그리스어 중심";
    }

    if (normalized.includes("다국어")) {
      return "다국어 혼합";
    }

    return normalized;
  }

  function detectLanguageFamilyLabel(label) {
    const normalized = normalizeDetectedLanguage(label);
    if (normalized.includes("한국어")) {
      return "korean";
    }
    if (normalized.includes("영어") || normalized.includes("라틴")) {
      return "latin";
    }
    if (normalized.includes("일본어")) {
      return "japanese";
    }
    if (normalized.includes("중국어") || normalized.includes("한자")) {
      return "cjk";
    }
    if (normalized.includes("키릴")) {
      return "cyrillic";
    }
    if (normalized.includes("아랍")) {
      return "arabic";
    }
    if (normalized.includes("데바나가리")) {
      return "devanagari";
    }
    if (normalized.includes("태국")) {
      return "thai";
    }
    if (normalized.includes("히브리")) {
      return "hebrew";
    }
    if (normalized.includes("그리스")) {
      return "greek";
    }
    return "";
  }

  function detectLanguageFamilyFromText(text) {
    const counts = {
      korean: 0,
      latin: 0,
      japanese: 0,
      cjk: 0,
      cyrillic: 0,
      arabic: 0,
      devanagari: 0,
      thai: 0,
      hebrew: 0,
      greek: 0,
      other: 0,
    };
    addScriptCounts(counts, text);
    const ordered = Object.entries(counts)
      .filter((entry) => entry[1] > 0)
      .sort((left, right) => right[1] - left[1]);
    return ordered.length ? ordered[0][0] : "";
  }

  function addScriptCounts(scriptCounts, text) {
    const value = String(text || "");
    for (const character of value) {
      const family = detectCharacterScriptFamily(character);
      if (family) {
        scriptCounts[family] += 1;
      } else if (!/\s/.test(character)) {
        scriptCounts.other += 1;
      }
    }
  }

  function detectCharacterScriptFamily(character) {
    const codePoint = character.codePointAt(0);
    if (typeof codePoint !== "number") {
      return "";
    }

    if (
      (codePoint >= 0xac00 && codePoint <= 0xd7af) ||
      (codePoint >= 0x1100 && codePoint <= 0x11ff) ||
      (codePoint >= 0x3130 && codePoint <= 0x318f)
    ) {
      return "korean";
    }

    if (
      (codePoint >= 0x3040 && codePoint <= 0x309f) ||
      (codePoint >= 0x30a0 && codePoint <= 0x30ff)
    ) {
      return "japanese";
    }

    if (codePoint >= 0x4e00 && codePoint <= 0x9fff) {
      return "cjk";
    }

    if (codePoint >= 0x0400 && codePoint <= 0x052f) {
      return "cyrillic";
    }

    if (codePoint >= 0x0600 && codePoint <= 0x06ff) {
      return "arabic";
    }

    if (codePoint >= 0x0900 && codePoint <= 0x097f) {
      return "devanagari";
    }

    if (codePoint >= 0x0e00 && codePoint <= 0x0e7f) {
      return "thai";
    }

    if (codePoint >= 0x0590 && codePoint <= 0x05ff) {
      return "hebrew";
    }

    if (codePoint >= 0x0370 && codePoint <= 0x03ff) {
      return "greek";
    }

    if (
      (codePoint >= 0x0041 && codePoint <= 0x005a) ||
      (codePoint >= 0x0061 && codePoint <= 0x007a) ||
      (codePoint >= 0x00c0 && codePoint <= 0x024f)
    ) {
      return "latin";
    }

    return "";
  }

  function formatSelectionLabel(roots) {
    if (!Array.isArray(roots) || roots.length === 0) {
      return "선택 없음";
    }

    if (roots.length === 1) {
      return `${roots[0].name} / ${normalizeTypeLabel(roots[0].type)}`;
    }

    return `${roots[0].name} 외 ${roots.length - 1}개`;
  }

  function getSelectionSignature(selection) {
    return Array.from(selection || [])
      .map((node) => String(node.id || ""))
      .sort()
      .join("|");
  }

  function safeName(node) {
    return node && typeof node.name === "string" && node.name.trim()
      ? node.name.trim()
      : normalizeTypeLabel(node && node.type);
  }

  function getTextValue(node) {
    return node && typeof node.characters === "string" ? normalizeLineEndings(node.characters) : "";
  }

  function previewText(value, limit) {
    const visible = makeWhitespaceVisible(value);
    if (visible.length <= limit) {
      return visible;
    }

    return `${visible.slice(0, limit - 3)}...`;
  }

  function previewVisibleText(value, limit) {
    return previewText(value, limit);
  }

  function makeWhitespaceVisible(value) {
    const normalized = normalizeLineEndings(value);
    if (!normalized) {
      return "[empty]";
    }

    return normalized.replace(/ /g, "[ ]").replace(/\t/g, "[tab]").replace(/\n/g, "[\\n]");
  }

  function compactText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function normalizeLineEndings(value) {
    return String(value || "").replace(/\r\n?/g, "\n");
  }

  function hasChildren(node) {
    return !!node && Array.isArray(node.children) && node.children.length > 0;
  }

  function normalizeTypeLabel(type) {
    switch (String(type || "").toUpperCase()) {
      case "PAGE":
        return "페이지";
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
      default:
        return String(type || "레이어");
    }
  }

  function prepareTextHighlightSource() {
    const range = resolveSelectedTextHighlightRange();
    const colorSnapshot = extractTextRangeColorSnapshot(range.node, range.start, range.end);
    const fontSize = getTextRangeFontSize(range.node, range.start, range.end);
    const lineHeight = getTextRangeLineHeight(range.node, range.start, range.end, fontSize);

    return {
      nodeId: range.node.id,
      nodeName: safeName(range.node),
      selectionLabel: safeName(range.node),
      start: range.start,
      end: range.end,
      text: range.text,
      textPreview: compactText(range.text) || previewText(range.text, 72),
      fontSize,
      lineHeight,
      textColorHex: colorSnapshot.hex,
      highlightColorHex: AI_TEXT_HIGHLIGHT_DEFAULT_COLOR,
      cornerRadius: sanitizeTextHighlightRadius(
        AI_TEXT_HIGHLIGHT_DEFAULT_RADIUS,
        AI_TEXT_HIGHLIGHT_DEFAULT_RADIUS
      ),
      decorationScale: AI_TEXT_HIGHLIGHT_DEFAULT_BOX_PADDING_PX,
      lineDecorationScale: buildTextHighlightAutoDecorationScale(fontSize, "line", lineHeight),
      strikeCapRadius: sanitizeTextHighlightRadius(
        AI_TEXT_HIGHLIGHT_DEFAULT_STRIKE_RADIUS,
        AI_TEXT_HIGHLIGHT_DEFAULT_STRIKE_RADIUS
      ),
      hasMixedTextColor: colorSnapshot.mixed === true,
    };
  }

  function requestTextHighlightAlphaBounds(payload) {
    return new Promise((resolve, reject) => {
      const requestId = `text-highlight-alpha-${Date.now()}-${(textHighlightMeasureRequestSequence += 1)}`;
      const timeoutId = setTimeout(() => {
        pendingTextHighlightMeasureRequests.delete(requestId);
        reject(new Error("Text highlight measurement timed out."));
      }, 15000);

      pendingTextHighlightMeasureRequests.set(requestId, {
        resolve,
        reject,
        timeoutId,
      });

      figma.ui.postMessage({
        type: "measure-ai-text-highlight-alpha-bounds",
        requestId,
        payload,
      });
    });
  }

  function resolveTextHighlightAlphaBounds(message) {
    const requestId = message && typeof message.requestId === "string" ? message.requestId : "";
    if (!requestId || !pendingTextHighlightMeasureRequests.has(requestId)) {
      return;
    }

    const pending = pendingTextHighlightMeasureRequests.get(requestId);
    pendingTextHighlightMeasureRequests.delete(requestId);
    if (pending && pending.timeoutId) {
      clearTimeout(pending.timeoutId);
    }

    if (!pending) {
      return;
    }

    if (message && typeof message.error === "string" && message.error) {
      pending.reject(new Error(message.error));
      return;
    }

    const bounds = message && message.bounds && typeof message.bounds === "object" ? message.bounds : null;
    const segments = message && Array.isArray(message.segments) ? message.segments : [];
    if (!bounds && !segments.length) {
      pending.resolve(null);
      return;
    }

    pending.resolve({
      bounds,
      segments,
    });
  }

  async function resolveTextHighlightRange(message) {
    const hasExplicitRange =
      message &&
      typeof message.nodeId === "string" &&
      message.nodeId &&
      Number.isFinite(Number(message.start)) &&
      Number.isFinite(Number(message.end));

    if (!hasExplicitRange) {
      const liveRange = tryResolveLiveSelectedTextHighlightRange(message);
      if (liveRange) {
        return liveRange;
      }
      return resolveSelectedTextHighlightRange();
    }

    const node =
      typeof figma.getNodeByIdAsync === "function"
        ? await figma.getNodeByIdAsync(message.nodeId)
        : typeof figma.getNodeById === "function"
          ? figma.getNodeById(message.nodeId)
          : null;
    if (!node || node.removed || node.type !== "TEXT") {
      throw new Error("선택한 텍스트 레이어를 다시 찾지 못했습니다. 다시 드래그한 뒤 시도해 주세요.");
    }

    const characters = typeof node.characters === "string" ? node.characters : "";
    const start = Math.max(0, Math.floor(Number(message.start) || 0));
    const end = Math.max(start, Math.min(characters.length, Math.floor(Number(message.end) || 0)));
    const text = normalizeLineEndings(characters.slice(start, end));
    const sourceText = normalizeLineEndings(message && typeof message.sourceText === "string" ? message.sourceText : "");
    if (end <= start || !compactText(text)) {
      throw new Error("하이라이트할 텍스트 범위를 먼저 드래그해 주세요.");
    }

    if (sourceText && compactText(sourceText) && text !== sourceText) {
      const liveRange = tryResolveLiveSelectedTextHighlightRange(message);
      if (liveRange && liveRange.text === sourceText) {
        return liveRange;
      }
    }

    return {
      node,
      start,
      end,
      text,
    };
  }

  function tryResolveLiveSelectedTextHighlightRange(message) {
    const page = figma.currentPage;
    const selectedTextRange = page && "selectedTextRange" in page ? page.selectedTextRange : null;
    if (!selectedTextRange || !selectedTextRange.node || selectedTextRange.node.removed || selectedTextRange.node.type !== "TEXT") {
      return null;
    }

    const characters = typeof selectedTextRange.node.characters === "string" ? selectedTextRange.node.characters : "";
    const start = Math.max(0, Math.floor(Number(selectedTextRange.start) || 0));
    const end = Math.max(start, Math.min(characters.length, Math.floor(Number(selectedTextRange.end) || 0)));
    const text = normalizeLineEndings(characters.slice(start, end));
    if (end <= start || !compactText(text)) {
      return null;
    }

    if (message && typeof message.nodeId === "string" && message.nodeId && message.nodeId !== selectedTextRange.node.id) {
      return null;
    }

    return {
      node: selectedTextRange.node,
      start,
      end,
      text,
    };
  }

  function resolveSelectedTextHighlightRange() {
    const page = figma.currentPage;
    const selectedTextRange = page && "selectedTextRange" in page ? page.selectedTextRange : null;
    if (!selectedTextRange || !selectedTextRange.node || selectedTextRange.node.removed || selectedTextRange.node.type !== "TEXT") {
      throw new Error("하이라이트할 텍스트를 Figma에서 드래그한 뒤 다시 시도해 주세요.");
    }

    const characters = typeof selectedTextRange.node.characters === "string" ? selectedTextRange.node.characters : "";
    const start = Math.max(0, Math.floor(Number(selectedTextRange.start) || 0));
    const end = Math.max(start, Math.min(characters.length, Math.floor(Number(selectedTextRange.end) || 0)));
    const text = normalizeLineEndings(characters.slice(start, end));
    if (end <= start || !compactText(text)) {
      throw new Error("하이라이트할 텍스트 범위를 먼저 드래그해 주세요.");
    }

    return {
      node: selectedTextRange.node,
      start,
      end,
      text,
    };
  }

  function isWholeTextHighlightRange(node, start, end) {
    const characters = node && typeof node.characters === "string" ? node.characters : "";
    const characterCount = characters.length;
    if (!(characterCount > 0)) {
      return false;
    }

    const rangeStart = Math.max(0, Math.floor(Number(start) || 0));
    const rangeEnd = Math.max(rangeStart, Math.min(characterCount, Math.floor(Number(end) || 0)));
    return rangeStart <= 0 && rangeEnd >= characterCount;
  }

  function extractTextRangeColorSnapshot(node, start, end) {
    const fallbackHex = AI_TEXT_HIGHLIGHT_DEFAULT_TEXT_COLOR;
    const segments = getTextHighlightStyledSegments(node, start, end, ["fills"]);
    const seen = {};
    let firstHex = "";
    let uniqueCount = 0;

    for (const segment of segments) {
      const hex = extractVisibleSolidPaintHex(segment && segment.fills);
      if (!hex) {
        continue;
      }

      if (!firstHex) {
        firstHex = hex;
      }
      if (!seen[hex]) {
        seen[hex] = true;
        uniqueCount += 1;
      }
    }

    if (firstHex) {
      return {
        hex: firstHex,
        mixed: uniqueCount > 1,
      };
    }

    const rangeHex = extractVisibleSolidPaintHex(getTextHighlightPaints(node, start, end));
    if (rangeHex) {
      return {
        hex: rangeHex,
        mixed: false,
      };
    }

    const singleCharHex = extractVisibleSolidPaintHex(getTextHighlightPaints(node, start, Math.min(end, start + 1)));
    if (singleCharHex) {
      return {
        hex: singleCharHex,
        mixed: false,
      };
    }

    const nodeHex = extractVisibleSolidPaintHex(node && node.fills);
    return {
      hex: nodeHex || fallbackHex,
      mixed: false,
    };
  }

  async function measureTextHighlightBounds(node, start, end, textColorHex) {
    const characters = node && typeof node.characters === "string" ? node.characters : "";
    const characterCount = characters.length;
    const rangeStart = Math.max(0, Math.min(characterCount, Math.floor(Number(start) || 0)));
    const rangeEnd = Math.max(rangeStart, Math.min(characterCount, Math.floor(Number(end) || 0)));
    const fontSize = getTextRangeFontSize(node, rangeStart, rangeEnd);
    const lineHeight = getTextRangeLineHeight(node, rangeStart, rangeEnd, fontSize);
    const selectedText = characters.slice(rangeStart, rangeEnd);
    const isPartialSingleLineSelection =
      !!selectedText &&
      !/[\r\n]/.test(selectedText) &&
      !isWholeTextHighlightRange(node, rangeStart, rangeEnd);
    const directMeasurement = await measureExactTextHighlightBounds(
      node,
      rangeStart,
      rangeEnd,
      textColorHex,
      fontSize,
      lineHeight
    );
    const directBoundsList = getTextHighlightMeasurementBoundsList(directMeasurement);
    if (
      directBoundsList.length &&
      !hasSuspiciousTextHighlightDirectBounds(node, directBoundsList, rangeStart, rangeEnd, fontSize, lineHeight)
    ) {
      return {
        bounds: mergeTextHighlightBoundsList(directBoundsList),
        boundsList: directBoundsList,
        segments: directBoundsList.slice(),
        fontSize,
        lineHeight,
      };
    }

    const underlineGeometryMeasurement = await measureTextHighlightUnderlineGeometryBounds(
      node,
      rangeStart,
      rangeEnd,
      fontSize,
      lineHeight
    );
    const underlineGeometryBoundsList = getTextHighlightMeasurementBoundsList(underlineGeometryMeasurement);
    if (underlineGeometryBoundsList.length) {
      const glyphAwareBoundsList = await refineTextHighlightBoundsWithGlyphBounds(
        node,
        rangeStart,
        rangeEnd,
        textColorHex,
        fontSize,
        lineHeight,
        underlineGeometryBoundsList
      );
      if (glyphAwareBoundsList.length) {
        return {
          bounds: mergeTextHighlightBoundsList(glyphAwareBoundsList),
          boundsList: glyphAwareBoundsList,
          segments: glyphAwareBoundsList.slice(),
          fontSize,
          lineHeight,
        };
      }
    }

    const endMeasurement = await measureTextHighlightPrefixBounds(node, rangeEnd, textColorHex, fontSize, lineHeight);
    const endBoundsList = Array.isArray(endMeasurement && endMeasurement.boundsList) ? endMeasurement.boundsList : [];
    let boundsList = rangeStart > 0 ? [] : endBoundsList.slice();
    let startMeasurement = null;

    if (endBoundsList.length && rangeStart > 0) {
      startMeasurement = await measureTextHighlightPrefixBounds(
        node,
        rangeStart,
        textColorHex,
        fontSize,
        lineHeight
      );
      const startBoundsList = Array.isArray(startMeasurement && startMeasurement.boundsList)
        ? startMeasurement.boundsList
        : [];
      if (startBoundsList.length) {
        if (isPartialSingleLineSelection) {
          boundsList = await buildTextHighlightSelectionRowsFromPrefixStart(
            node,
            rangeStart,
            rangeEnd,
            textColorHex,
            fontSize,
            lineHeight,
            endBoundsList,
            startBoundsList,
            selectedText
          );
        }
        if (!boundsList.length) {
          boundsList = subtractTextHighlightPrefixBounds(endBoundsList, startBoundsList, fontSize, lineHeight);
        }
        if (!boundsList.length) {
          boundsList = extractTrailingTextHighlightBounds(endBoundsList, startBoundsList, fontSize, lineHeight);
        }
      }
    }

    if (!boundsList.length) {
      if (directBoundsList.length && !hasSuspiciousTextHighlightDirectBounds(node, directBoundsList, rangeStart, rangeEnd, fontSize, lineHeight)) {
        boundsList = directBoundsList;
      }
    }

    if (!boundsList.length && isPartialSingleLineSelection) {
      throw new Error("Could not safely measure the selected text highlight range.");
    }

    if (!boundsList.length) {
      boundsList = buildConservativeTextHighlightBounds(
        node,
        rangeStart,
        rangeEnd,
        fontSize,
        lineHeight,
        startMeasurement && startMeasurement.fallbackBounds,
        endMeasurement && endMeasurement.fallbackBounds
      );
    }

    if (!boundsList.length) {
      boundsList = buildEmergencyTextHighlightBounds(node, rangeStart, rangeEnd, fontSize, lineHeight);
    }

    if (!boundsList.length) {
      throw new Error("선택한 텍스트 범위의 렌더 영역을 찾지 못했습니다.");
    }

    boundsList = await constrainTextHighlightBoundsListToExactSelection(
      node,
      rangeStart,
      rangeEnd,
      textColorHex,
      fontSize,
      lineHeight,
      boundsList,
      endBoundsList
    );
    if (!boundsList.length) {
      throw new Error("\uc120\ud0dd \ud14d\uc2a4\ud2b8 \ubc94\uc704\ub97c \uc548\uc804\ud558\uac8c \uce21\uc815\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
    }
    if (isPartialSingleLineSelection && sortTextHighlightBoundsList(boundsList).length !== 1) {
      throw new Error("Could not safely measure the selected text highlight range.");
    }
    if (hasOverwideTextHighlightSelectionRows(boundsList, selectedText, fontSize, lineHeight)) {
      throw new Error("Could not safely measure the selected text highlight range.");
    }

    return {
      bounds: mergeTextHighlightBoundsList(boundsList),
      boundsList,
      segments: boundsList.slice(),
      fontSize,
      lineHeight,
    };
  }

  async function measureTextHighlightUnderlineGeometryBounds(node, start, end, fontSize, lineHeight) {
    const characterCount = node && typeof node.characters === "string" ? node.characters.length : 0;
    const rangeStart = Math.max(0, Math.min(characterCount, Math.floor(Number(start) || 0)));
    const rangeEnd = Math.max(rangeStart, Math.min(characterCount, Math.floor(Number(end) || 0)));
    if (!(rangeEnd > rangeStart) || !node || typeof node.clone !== "function" || typeof node.setRangeTextDecoration !== "function") {
      return {
        bounds: null,
        boundsList: [],
        segments: [],
        fontSize,
        lineHeight,
      };
    }

    const clone = node.clone();
    try {
      if ("effects" in clone && Array.isArray(clone.effects)) {
        clone.effects = [];
      }
      if ("strokes" in clone && Array.isArray(clone.strokes)) {
        clone.strokes = [];
      }
      if ("opacity" in clone && typeof clone.opacity === "number") {
        clone.opacity = 1;
      }
      if ("blendMode" in clone) {
        clone.blendMode = "NORMAL";
      }

      try {
        await loadFontsForTextNode(clone);
      } catch (error) {}

      clearTextHighlightDecoration(clone, 0, characterCount);
      if (typeof clone.setRangeFills === "function") {
        try {
          clone.setRangeFills(0, characterCount, [createTransparentPaint()]);
        } catch (error) {}
      }
      clone.setRangeTextDecoration(rangeStart, rangeEnd, "UNDERLINE");
      if (typeof clone.setRangeTextDecorationStyle === "function") {
        try {
          clone.setRangeTextDecorationStyle(rangeStart, rangeEnd, "SOLID");
        } catch (error) {}
      }
      if (typeof clone.setRangeTextDecorationColor === "function") {
        try {
          clone.setRangeTextDecorationColor(rangeStart, rangeEnd, {
            value: createSolidPaint(AI_TEXT_HIGHLIGHT_MEASURE_COLOR),
          });
        } catch (error) {}
      }
      if (typeof clone.setRangeTextDecorationSkipInk === "function") {
        try {
          clone.setRangeTextDecorationSkipInk(rangeStart, rangeEnd, false);
        } catch (error) {}
      }

      const underlineLocalBoundsList = await waitForTextHighlightUnderlineGeometryBounds(clone, fontSize, lineHeight);
      const boundsList = underlineLocalBoundsList
        .map((localBounds) => buildTextHighlightBoundsFromUnderlineLocalBounds(node, localBounds, fontSize, lineHeight))
        .filter(Boolean);

      return {
        bounds: mergeTextHighlightBoundsList(boundsList),
        boundsList,
        segments: boundsList.slice(),
        fontSize,
        lineHeight,
      };
    } catch (error) {
      return {
        bounds: null,
        boundsList: [],
        segments: [],
        fontSize,
        lineHeight,
      };
    } finally {
      if (clone && !clone.removed) {
        clone.remove();
      }
    }
  }

  async function waitForTextHighlightUnderlineGeometryBounds(node, fontSize, lineHeight) {
    const attempts = 10;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const boundsList = getTextHighlightUnderlineGeometryLocalBounds(node, fontSize, lineHeight);
      if (boundsList.length) {
        return boundsList;
      }
      await waitForTextHighlightGeometryTick(attempt < 2 ? 1 : 16);
    }

    return [];
  }

  function waitForTextHighlightGeometryTick(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, Math.max(1, Math.floor(Number(ms) || 1)));
    });
  }

  function getTextHighlightUnderlineGeometryLocalBounds(node, fontSize, lineHeight) {
    const geometry = node && Array.isArray(node.fillGeometry) ? node.fillGeometry : [];
    if (!geometry.length) {
      return [];
    }

    const boundsList = [];
    for (let index = 0; index < geometry.length; index += 1) {
      const path = geometry[index];
      const pathBoundsList = parseTextHighlightSvgPathBoundsList(path && path.data, fontSize, lineHeight);
      for (const pathBounds of pathBoundsList) {
        boundsList.push(pathBounds);
      }
    }

    return mergeTextHighlightLocalBoundsByRows(boundsList, fontSize, lineHeight);
  }

  function mergeTextHighlightLocalBoundsByRows(boundsList, fontSize, lineHeight) {
    const sortedBoundsList = sortTextHighlightBoundsList(boundsList);
    if (sortedBoundsList.length < 2) {
      return sortedBoundsList;
    }

    const rowTolerance = getTextHighlightRowTolerance(fontSize, lineHeight);
    const rows = [];
    for (const bounds of sortedBoundsList) {
      const normalizedBounds = normalizeTextHighlightWorldBounds(bounds);
      if (!normalizedBounds) {
        continue;
      }

      let matchedRow = null;
      for (const row of rows) {
        if (doTextHighlightBoundsShareRow(row, normalizedBounds, rowTolerance)) {
          matchedRow = row;
          break;
        }
      }

      if (!matchedRow) {
        rows.push({
          x: normalizedBounds.x,
          y: normalizedBounds.y,
          width: normalizedBounds.width,
          height: normalizedBounds.height,
        });
        continue;
      }

      const minX = Math.min(matchedRow.x, normalizedBounds.x);
      const minY = Math.min(matchedRow.y, normalizedBounds.y);
      const maxX = Math.max(matchedRow.x + matchedRow.width, normalizedBounds.x + normalizedBounds.width);
      const maxY = Math.max(matchedRow.y + matchedRow.height, normalizedBounds.y + normalizedBounds.height);
      matchedRow.x = roundTextHighlightMetric(minX);
      matchedRow.y = roundTextHighlightMetric(minY);
      matchedRow.width = roundTextHighlightMetric(Math.max(1, maxX - minX));
      matchedRow.height = roundTextHighlightMetric(Math.max(0.5, maxY - minY));
    }

    return sortTextHighlightBoundsList(rows);
  }

  function parseTextHighlightSvgPathBoundsList(pathData, fontSize, lineHeight) {
    if (typeof pathData !== "string" || !pathData.trim()) {
      return [];
    }

    const chunks = pathData
      .split(/[zZ]/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);
    const boundsList = [];
    for (const chunk of chunks) {
      const bounds = parseTextHighlightSvgPathChunkBounds(chunk);
      if (!bounds) {
        continue;
      }

      const minimumWidth = getTextHighlightMinimumWidth(fontSize);
      const minimumHeight = Math.max(0.5, Math.min(Math.max(1, Number(lineHeight) || 1), Math.max(1, Number(fontSize) || 12) * 0.2));
      if (bounds.width < minimumWidth || bounds.height < minimumHeight * 0.05) {
        continue;
      }

      boundsList.push(bounds);
    }

    return boundsList;
  }

  function parseTextHighlightSvgPathChunkBounds(pathChunk) {
    const matches = String(pathChunk || "").match(/[-+]?(?:\d*\.\d+|\d+)(?:e[-+]?\d+)?/gi);
    if (!matches || matches.length < 4) {
      return null;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let index = 0; index + 1 < matches.length; index += 2) {
      const x = Number(matches[index]);
      const y = Number(matches[index + 1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    if (!Number.isFinite(minX) || !Number.isFinite(minY) || maxX <= minX || maxY < minY) {
      return null;
    }

    return {
      x: roundTextHighlightMetric(minX),
      y: roundTextHighlightMetric(minY),
      width: roundTextHighlightMetric(Math.max(1, maxX - minX)),
      height: roundTextHighlightMetric(Math.max(0.5, maxY - minY)),
    };
  }

  function buildTextHighlightBoundsFromUnderlineLocalBounds(node, underlineLocalBounds, fontSize, lineHeight) {
    const localBounds = normalizeTextHighlightWorldBounds(underlineLocalBounds);
    if (!localBounds) {
      return null;
    }

    const metrics = buildTextHighlightBoxGlyphMetrics(fontSize, lineHeight);
    const underlineTop = localBounds.y;
    const textTop = roundTextHighlightMetric(underlineTop - metrics.ascent);
    const highlightLocalBounds = {
      x: localBounds.x,
      y: textTop,
      width: localBounds.width,
      height: metrics.height,
    };

    return getTextHighlightWorldBoundsFromLocalBounds(node, highlightLocalBounds);
  }

  function buildTextHighlightBoxGlyphMetrics(fontSize, lineHeight) {
    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    const ascent = Math.max(size * 0.82, Math.min(resolvedLineHeight * 0.74, size * 0.92));
    const descent = Math.max(size * 0.14, Math.min(resolvedLineHeight * 0.18, size * 0.22));
    return {
      ascent: roundTextHighlightMetric(ascent),
      descent: roundTextHighlightMetric(descent),
      height: roundTextHighlightMetric(Math.max(1, ascent + descent)),
    };
  }

  async function refineTextHighlightBoundsWithGlyphBounds(
    node,
    start,
    end,
    textColorHex,
    fontSize,
    lineHeight,
    boundsList
  ) {
    const baseRows = sortTextHighlightBoundsList(boundsList);
    if (!baseRows.length) {
      return [];
    }

    let glyphMeasurement = null;
    try {
      glyphMeasurement = await measureExactTextHighlightBounds(node, start, end, textColorHex, fontSize, lineHeight);
    } catch (error) {}

    let glyphRows = getTextHighlightMeasurementBoundsList(glyphMeasurement);
    if (hasMergedTextHighlightBlockBounds(glyphRows, fontSize)) {
      glyphRows = splitMergedTextHighlightBlockBounds(glyphRows, fontSize, lineHeight);
    }
    glyphRows = filterTextHighlightGlyphBoundsRows(glyphRows, fontSize, lineHeight);
    if (!glyphRows.length) {
      return [];
    }

    const refinedRows = [];
    const usedGlyphRows = {};
    for (const baseRow of baseRows) {
      const glyphRow = findTextHighlightGlyphBoundsForBaseRow(
        baseRow,
        glyphRows,
        usedGlyphRows,
        fontSize,
        lineHeight
      );
      if (!glyphRow) {
        continue;
      }

      const constrainedBaseRow = constrainTextHighlightBaseRowToGlyphRow(baseRow, glyphRow, fontSize);
      refinedRows.push(expandTextHighlightBoundsToGlyphHeight(constrainedBaseRow, glyphRow, fontSize, lineHeight));
    }

    return refinedRows;
  }

  async function constrainTextHighlightBoundsListToExactSelection(
    node,
    start,
    end,
    textColorHex,
    fontSize,
    lineHeight,
    boundsList,
    endBoundsList
  ) {
    const rows = sortTextHighlightBoundsList(boundsList);
    if (!rows.length || isWholeTextHighlightRange(node, start, end)) {
      return rows;
    }

    const characters = node && typeof node.characters === "string" ? node.characters : "";
    const characterCount = characters.length;
    const rangeStart = Math.max(0, Math.min(characterCount, Math.floor(Number(start) || 0)));
    const rangeEnd = Math.max(rangeStart, Math.min(characterCount, Math.floor(Number(end) || 0)));
    const selectedText = characters.slice(rangeStart, rangeEnd);
    if (!selectedText || /[\r\n]/.test(selectedText)) {
      return rows;
    }

    let exactMeasurement = null;
    try {
      exactMeasurement = await measureExactTextHighlightBounds(
        node,
        rangeStart,
        rangeEnd,
        textColorHex,
        fontSize,
        lineHeight
      );
    } catch (error) {}

    let exactRows = getTextHighlightMeasurementBoundsList(exactMeasurement);
    if (hasMergedTextHighlightBlockBounds(exactRows, fontSize)) {
      exactRows = splitMergedTextHighlightBlockBounds(exactRows, fontSize, lineHeight);
    }
    exactRows = filterTextHighlightGlyphBoundsRows(exactRows, fontSize, lineHeight).filter((row) =>
      isReasonableTextHighlightSelectionRow(row, selectedText, fontSize)
    );
    if (!exactRows.length) {
      return rows;
    }

    const refinedRows = [];
    const usedExactRows = {};
    for (const row of rows) {
      const exactRow = findTextHighlightGlyphBoundsForBaseRow(
        row,
        exactRows,
        usedExactRows,
        fontSize,
        lineHeight
      );
      if (!exactRow) {
        continue;
      }

      const constrainedRow = constrainTextHighlightBaseRowToGlyphRow(row, exactRow, fontSize);
      refinedRows.push(expandTextHighlightBoundsToGlyphHeight(constrainedRow, exactRow, fontSize, lineHeight));
    }

    if (refinedRows.length) {
      return refinedRows;
    }

    return exactRows;
  }

  async function buildTextHighlightSelectionRowsFromPrefixEnd(
    node,
    start,
    end,
    textColorHex,
    fontSize,
    lineHeight,
    rows,
    endBoundsList,
    selectedText
  ) {
    const candidateRows = sortTextHighlightBoundsList(rows);
    if (!candidateRows.length) {
      return [];
    }

    const referenceRows = sortTextHighlightBoundsList(endBoundsList && endBoundsList.length ? endBoundsList : candidateRows);
    const targetRow = candidateRows[candidateRows.length - 1];
    const referenceRow = findTextHighlightReferenceRowForTarget(targetRow, referenceRows, fontSize, lineHeight) || targetRow;
    const selectedWidth = await measureTextHighlightSelectedWidth(
      node,
      start,
      end,
      textColorHex,
      fontSize,
      lineHeight,
      selectedText,
      referenceRow.width
    );

    if (!(selectedWidth > 0)) {
      return [];
    }

    const minimumWidth = getTextHighlightMinimumWidth(fontSize);
    const endRight = referenceRow.x + referenceRow.width;
    const nextWidth = roundTextHighlightMetric(
      Math.max(minimumWidth, Math.min(referenceRow.width, selectedWidth))
    );
    const nextX = roundTextHighlightMetric(Math.max(referenceRow.x, endRight - nextWidth));

    return [
      {
        x: nextX,
        y: targetRow.y,
        width: nextWidth,
        height: targetRow.height,
      },
    ];
  }

  async function buildTextHighlightSelectionRowsFromPrefixStart(
    node,
    start,
    end,
    textColorHex,
    fontSize,
    lineHeight,
    endBoundsList,
    startBoundsList,
    selectedText
  ) {
    if (!selectedText || /[\r\n]/.test(selectedText)) {
      return [];
    }

    const endRows = sortTextHighlightBoundsList(endBoundsList);
    if (!endRows.length) {
      return [];
    }

    const startRows = sortTextHighlightBoundsList(startBoundsList);
    const targetRowIndex = endRows.length - 1;
    const targetRow = endRows[targetRowIndex];
    if (!targetRow) {
      return [];
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const rowTolerance = getTextHighlightRowTolerance(fontSize, lineHeight);
    const minimumWidth = getTextHighlightMinimumWidth(fontSize);
    const endRight = targetRow.x + targetRow.width;
    let startRight = -Infinity;

    if ((Number(start) || 0) <= 0) {
      startRight = targetRow.x;
    } else if (startRows.length === endRows.length) {
      startRight = findTextHighlightMatchedStartRight(
        targetRow,
        startRows,
        rowTolerance,
        fontSize,
        lineHeight
      );
      if (!Number.isFinite(startRight)) {
        startRight = findTextHighlightIndexMatchedStartRight(
          targetRow,
          startRows,
          targetRowIndex,
          fontSize,
          lineHeight
        );
      }
      if (Number.isFinite(startRight)) {
        startRight += getTextHighlightWhitespaceAdvanceBeforeSelection(node, start, fontSize);
      }
    } else if (endRows.length === startRows.length + 1) {
      startRight = targetRow.x;
    }

    if (!Number.isFinite(startRight)) {
      return [];
    }

    const nodeBounds = normalizeTextHighlightWorldBounds(getNodeRenderBounds(node));
    const maximumWidth =
      nodeBounds && Number.isFinite(nodeBounds.width)
        ? Math.max(targetRow.width, nodeBounds.width)
        : Math.max(targetRow.width, endRight - startRight);
    const selectedWidth = await measureTextHighlightSelectedWidth(
      node,
      start,
      end,
      textColorHex,
      fontSize,
      lineHeight,
      selectedText,
      maximumWidth
    );
    if (!(selectedWidth > 0)) {
      return [];
    }

    const prefixWidth = endRight - startRight;
    const trustPrefixWidth =
      prefixWidth >= minimumWidth &&
      prefixWidth <= Math.max(selectedWidth * 1.28, selectedWidth + size * 0.65);
    const nextX = roundTextHighlightMetric(Math.max(targetRow.x, Math.min(startRight, endRight - minimumWidth)));
    let nextWidth = trustPrefixWidth ? prefixWidth : selectedWidth;
    if (nodeBounds) {
      const maxRight = nodeBounds.x + nodeBounds.width + Math.max(1, size * 0.2);
      nextWidth = Math.min(nextWidth, Math.max(minimumWidth, maxRight - nextX));
    }
    nextWidth = roundTextHighlightMetric(Math.max(minimumWidth, nextWidth));

    const row = {
      x: nextX,
      y: targetRow.y,
      width: nextWidth,
      height: targetRow.height,
    };

    if (hasOverwideTextHighlightSelectionRows([row], selectedText, fontSize, lineHeight)) {
      return [];
    }

    return [row];
  }

  function getTextHighlightWhitespaceAdvanceBeforeSelection(node, start, fontSize) {
    const characters = node && typeof node.characters === "string" ? node.characters : "";
    const rangeStart = Math.max(0, Math.min(characters.length, Math.floor(Number(start) || 0)));
    if (rangeStart <= 0) {
      return 0;
    }

    let whitespaceCount = 0;
    for (let index = rangeStart - 1; index >= 0; index -= 1) {
      const character = characters[index];
      if (character === "\n" || character === "\r") {
        break;
      }
      if (!/\s/.test(character)) {
        break;
      }
      whitespaceCount += 1;
    }

    if (!whitespaceCount) {
      return 0;
    }

    const size = Math.max(12, Number(fontSize) || 16);
    return roundTextHighlightMetric(whitespaceCount * size * 0.28);
  }

  function findTextHighlightReferenceRowForTarget(targetRow, referenceRows, fontSize, lineHeight) {
    const target = normalizeTextHighlightWorldBounds(targetRow);
    const rows = sortTextHighlightBoundsList(referenceRows);
    if (!target || !rows.length) {
      return null;
    }

    const rowTolerance = Math.max(getTextHighlightRowTolerance(fontSize, lineHeight), Math.max(12, Number(fontSize) || 16) * 0.28);
    let bestRow = null;
    let bestDistance = Infinity;
    for (const row of rows) {
      if (!doTextHighlightBoundsShareRow(target, row, rowTolerance)) {
        continue;
      }

      const targetCenter = target.y + target.height / 2;
      const rowCenter = row.y + row.height / 2;
      const distance = Math.abs(targetCenter - rowCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestRow = row;
      }
    }

    return bestRow || rows[rows.length - 1];
  }

  async function measureTextHighlightSelectedWidth(
    node,
    start,
    end,
    textColorHex,
    fontSize,
    lineHeight,
    selectedText,
    maximumWidth
  ) {
    try {
      const measurement = await measureTextHighlightSelectedOnlyBounds(
        node,
        start,
        end,
        textColorHex,
        fontSize,
        lineHeight
      );
      const measuredBounds = normalizeTextHighlightWorldBounds(
        mergeTextHighlightBoundsList(getTextHighlightMeasurementBoundsList(measurement))
      );
      if (measuredBounds && measuredBounds.width > 0 && measuredBounds.width <= Math.max(1, Number(maximumWidth) || Infinity)) {
        return measuredBounds.width;
      }
    } catch (error) {}

    const size = Math.max(12, Number(fontSize) || 16);
    const selectedLength = Math.max(1, compactText(selectedText).length);
    const estimatedWidth = selectedLength * size * 0.56;
    return roundTextHighlightMetric(Math.max(getTextHighlightMinimumWidth(fontSize), Math.min(Number(maximumWidth) || estimatedWidth, estimatedWidth)));
  }

  function hasOverwideTextHighlightSelectionRows(boundsList, selectedText, fontSize, lineHeight) {
    const rows = sortTextHighlightBoundsList(boundsList);
    if (!rows.length || !selectedText || /[\r\n]/.test(selectedText)) {
      return false;
    }
    if (rows.length > 1) {
      return true;
    }

    const mergedBounds = normalizeTextHighlightWorldBounds(mergeTextHighlightBoundsList(rows));
    if (!mergedBounds) {
      return false;
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    const selectedLength = Math.max(1, compactText(selectedText).length);
    const maxExpectedWidth = Math.max(size * 2.8, selectedLength * size * 1.65);
    const maxExpectedHeight = Math.max(resolvedLineHeight * 1.6, size * 2);
    return mergedBounds.width > maxExpectedWidth && mergedBounds.height <= maxExpectedHeight;
  }

  function isReasonableTextHighlightSelectionRow(row, selectedText, fontSize) {
    const bounds = normalizeTextHighlightWorldBounds(row);
    if (!bounds) {
      return false;
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const selectedLength = Math.max(1, compactText(selectedText).length);
    const maxExpectedWidth = Math.max(size * 2.2, selectedLength * size * 1.25);
    return bounds.width <= maxExpectedWidth;
  }

  function constrainTextHighlightBaseRowToGlyphRow(baseRow, glyphRow, fontSize) {
    const base = normalizeTextHighlightWorldBounds(baseRow);
    const glyph = normalizeTextHighlightWorldBounds(glyphRow);
    if (!base || !glyph) {
      return base;
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const baseRight = base.x + base.width;
    const glyphRight = glyph.x + glyph.width;
    const allowedOverflow = Math.max(2, Math.min(size * 0.5, 18));
    const widthTooWide = base.width > Math.max(glyph.width + size * 1.2, glyph.width * 1.35);
    const leaksOutsideGlyph =
      base.x < glyph.x - allowedOverflow ||
      baseRight > glyphRight + allowedOverflow;

    if (!widthTooWide && !leaksOutsideGlyph) {
      return base;
    }

    return {
      x: glyph.x,
      y: base.y,
      width: glyph.width,
      height: base.height,
    };
  }

  function filterTextHighlightGlyphBoundsRows(boundsList, fontSize, lineHeight) {
    const rows = sortTextHighlightBoundsList(boundsList);
    if (!rows.length) {
      return [];
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    const maxGlyphRowHeight = Math.max(size * 1.75, resolvedLineHeight * 1.35);
    return rows.filter((row) => row.height <= maxGlyphRowHeight);
  }

  function findTextHighlightGlyphBoundsForBaseRow(
    baseRow,
    glyphRows,
    usedGlyphRows,
    fontSize,
    lineHeight
  ) {
    const base = normalizeTextHighlightWorldBounds(baseRow);
    if (!base || !Array.isArray(glyphRows) || !glyphRows.length) {
      return null;
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    const rowTolerance = Math.max(getTextHighlightRowTolerance(fontSize, lineHeight), resolvedLineHeight * 0.32);
    const baseCenterY = base.y + base.height / 2;
    const baseRight = base.x + base.width;
    let bestIndex = -1;
    let bestScore = Infinity;

    for (let index = 0; index < glyphRows.length; index += 1) {
      if (usedGlyphRows[index]) {
        continue;
      }

      const glyph = normalizeTextHighlightWorldBounds(glyphRows[index]);
      if (!glyph) {
        continue;
      }

      const glyphRight = glyph.x + glyph.width;
      const glyphCenterY = glyph.y + glyph.height / 2;
      const verticalDistance = Math.abs(baseCenterY - glyphCenterY);
      const horizontalGap = Math.max(0, Math.max(base.x - glyphRight, glyph.x - baseRight));
      const sharesRow = doTextHighlightBoundsShareRow(base, glyph, rowTolerance) || verticalDistance <= rowTolerance;
      const isNearX = horizontalGap <= size;
      if (!sharesRow || !isNearX) {
        continue;
      }

      const score = verticalDistance + horizontalGap * 0.2;
      if (score < bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    }

    if (bestIndex < 0) {
      return null;
    }

    usedGlyphRows[bestIndex] = true;
    return glyphRows[bestIndex];
  }

  function expandTextHighlightBoundsToGlyphHeight(baseRow, glyphRow, fontSize, lineHeight) {
    const base = normalizeTextHighlightWorldBounds(baseRow);
    const glyph = normalizeTextHighlightWorldBounds(glyphRow);
    if (!base || !glyph) {
      return base;
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    const targetTop = Math.min(base.y, glyph.y);
    const targetBottom = Math.max(base.y + base.height, glyph.y + glyph.height);
    const maxHeight = Math.max(size * 0.95, Math.min(size * 1.22, resolvedLineHeight * 1.05));
    const nextHeight = Math.min(maxHeight, Math.max(base.height, glyph.height, targetBottom - targetTop));
    let nextY = targetTop;
    if (nextY + nextHeight < glyph.y + glyph.height) {
      nextY = Math.min(base.y, glyph.y + glyph.height - nextHeight);
    }

    return {
      x: base.x,
      y: roundTextHighlightMetric(nextY),
      width: base.width,
      height: roundTextHighlightMetric(Math.max(1, nextHeight)),
    };
  }

  async function measureExactTextHighlightBounds(node, start, end, textColorHex, fontSize, lineHeight) {
    const characterCount = node && typeof node.characters === "string" ? node.characters.length : 0;
    const rangeStart = Math.max(0, Math.min(characterCount, Math.floor(Number(start) || 0)));
    const rangeEnd = Math.max(rangeStart, Math.min(characterCount, Math.floor(Number(end) || 0)));
    if (!(rangeEnd > rangeStart)) {
      return {
        bounds: null,
        boundsList: [],
        segments: [],
        fontSize,
        lineHeight,
      };
    }

    try {
      const clone = await createTextHighlightSelectionMeasurementClone(node, rangeStart, rangeEnd);
      const measurement = await measureTextHighlightCloneBounds(node, clone, fontSize, lineHeight, {
        targetColorHex: AI_TEXT_HIGHLIGHT_MEASURE_COLOR,
      });
      const boundsList = getTextHighlightMeasurementBoundsList(measurement);
      if (boundsList.length) {
        return measurement;
      }

      const fallbackBounds = normalizeTextHighlightWorldBounds(measurement && measurement.fallbackBounds);
      if (isPlausibleExactTextHighlightFallbackBounds(node, fallbackBounds, rangeStart, rangeEnd, fontSize, lineHeight)) {
        return {
          bounds: fallbackBounds,
          boundsList: [fallbackBounds],
          segments: [fallbackBounds],
          fallbackBounds,
          fontSize,
          lineHeight,
        };
      }

      return measurement;
    } catch (error) {
      return {
        bounds: null,
        boundsList: [],
        segments: [],
        fontSize,
        lineHeight,
      };
    }
  }

  async function measureTextHighlightPrefixBounds(node, end, textColorHex, fontSize, lineHeight) {
    const characterCount = node && typeof node.characters === "string" ? node.characters.length : 0;
    const prefixEnd = Math.max(
      0,
      Math.min(characterCount, Math.floor(Number(end) || 0))
    );
    if (!(prefixEnd > 0)) {
      return {
        bounds: null,
        boundsList: [],
        segments: [],
        fontSize,
        lineHeight,
      };
    }

    const clone = await createTextHighlightMeasurementClone(node, prefixEnd, textColorHex);
    try {
      const geometryMeasurement = await measureTextHighlightCloneGeometryBounds(node, clone, fontSize, lineHeight);
      if (getTextHighlightMeasurementBoundsList(geometryMeasurement).length) {
        return geometryMeasurement;
      }

      return await measureTextHighlightCloneBounds(node, clone, fontSize, lineHeight);
    } finally {
      if (clone && !clone.removed) {
        clone.remove();
      }
    }
  }

  async function measureTextHighlightCloneBounds(node, clone, fontSize, lineHeight, options) {
    const probeBounds = getNodeRenderBounds(node);
    const probe = figma.createFrame();
    let boundsList = [];
    let flattenedNode = null;

    try {
      probe.resize(
        Math.max(1, roundTextHighlightMetric(probeBounds ? probeBounds.width : Number(node && node.width) || 1)),
        Math.max(1, roundTextHighlightMetric(probeBounds ? probeBounds.height : Number(node && node.height) || 1))
      );
      probe.clipsContent = false;
      probe.fills = [];
      probe.strokes = [];
      probe.name = "__pigma_text_highlight_measure__";
      probe.x = roundTextHighlightMetric(probeBounds ? probeBounds.x : 0);
      probe.y = roundTextHighlightMetric(probeBounds ? probeBounds.y : 0);
      figma.currentPage.appendChild(probe);

      moveTextHighlightMeasureClone(node, clone, probe, probe.x, probe.y);
      boundsList = await measureTextHighlightProbeAlphaBounds(probe, fontSize, lineHeight, options);
      if (!boundsList.length && clone && typeof figma.flatten === "function") {
        try {
          flattenedNode = figma.flatten([clone], probe);
        } catch (error) {}
        boundsList = await measureTextHighlightProbeAlphaBounds(probe, fontSize, lineHeight, options);
      }

      const fallbackBounds =
        getVisibleTextHighlightBounds(flattenedNode && !flattenedNode.removed ? flattenedNode : clone) ||
        getVisibleTextHighlightBounds(probe);

      return {
        bounds: mergeTextHighlightBoundsList(boundsList),
        boundsList,
        segments: boundsList.slice(),
        fallbackBounds,
        fontSize,
        lineHeight,
      };
    } finally {
      if (flattenedNode && !flattenedNode.removed) {
        flattenedNode.remove();
      }
      if (probe && !probe.removed) {
        probe.remove();
      }
    }
  }

  async function measureTextHighlightCloneGeometryBounds(sourceNode, clone, fontSize, lineHeight) {
    const localBoundsList = await waitForTextHighlightFillGeometryBounds(clone, fontSize, lineHeight);
    const boundsList = localBoundsList
      .map((localBounds) => getTextHighlightWorldBoundsFromLocalBounds(sourceNode, localBounds))
      .filter(Boolean);

    return {
      bounds: mergeTextHighlightBoundsList(boundsList),
      boundsList,
      segments: boundsList.slice(),
      fontSize,
      lineHeight,
    };
  }

  async function waitForTextHighlightFillGeometryBounds(node, fontSize, lineHeight) {
    const attempts = 8;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const boundsList = getTextHighlightFillGeometryLocalBounds(node, fontSize, lineHeight);
      if (boundsList.length) {
        return boundsList;
      }
      await waitForTextHighlightGeometryTick(attempt < 2 ? 1 : 16);
    }

    return [];
  }

  function getTextHighlightFillGeometryLocalBounds(node, fontSize, lineHeight) {
    const geometry = node && Array.isArray(node.fillGeometry) ? node.fillGeometry : [];
    if (!geometry.length) {
      return [];
    }

    const boundsList = [];
    for (let index = 0; index < geometry.length; index += 1) {
      const path = geometry[index];
      const pathBoundsList = parseTextHighlightSvgPathBoundsList(path && path.data, fontSize, lineHeight);
      for (const pathBounds of pathBoundsList) {
        boundsList.push(pathBounds);
      }
    }

    return mergeTextHighlightLocalBoundsByRows(boundsList, fontSize, lineHeight);
  }

  async function measureTextHighlightProbeAlphaBounds(probe, fontSize, lineHeight, options) {
    let alphaMeasurement = null;

    try {
      const pngBytes = await probe.exportAsync({
        format: "PNG",
        useAbsoluteBounds: false,
      });
      alphaMeasurement = await requestTextHighlightAlphaBounds({
        pngBytes,
        probeX: probe.x,
        probeY: probe.y,
        probeWidth: probe.width,
        probeHeight: probe.height,
        fontSize,
        lineHeight,
        targetColor: buildTextHighlightMeasureTargetColor(options && options.targetColorHex),
      });
    } catch (error) {}

    return getTextHighlightMeasurementBoundsList(alphaMeasurement);
  }

  function buildTextHighlightMeasureTargetColor(hexColor) {
    const hex = sanitizeHexColor(hexColor, "");
    if (!hex) {
      return null;
    }

    const rgb = hexToFigmaRgb(hex);
    return {
      r: Math.round(rgb.r * 255),
      g: Math.round(rgb.g * 255),
      b: Math.round(rgb.b * 255),
    };
  }

  async function createTextHighlightMeasurementClone(node, end, textColorHex) {
    if (!node || typeof node.clone !== "function") {
      throw new Error("텍스트 범위를 측정할 복제 레이어를 만들지 못했습니다.");
    }

    const clone = node.clone();

    if ("effects" in clone && Array.isArray(clone.effects)) {
      clone.effects = [];
    }
    if ("strokes" in clone && Array.isArray(clone.strokes)) {
      clone.strokes = [];
    }
    if ("opacity" in clone && typeof clone.opacity === "number") {
      clone.opacity = 1;
    }
    if ("blendMode" in clone) {
      clone.blendMode = "NORMAL";
    }
    if (typeof clone.setRangeFills !== "function") {
      throw new Error("선택 텍스트의 하이라이트 측정을 지원하지 않는 텍스트 레이어입니다.");
    }

    try {
      await loadFontsForTextNode(clone);
    } catch (error) {}

    const characterCount = typeof clone.characters === "string" ? clone.characters.length : 0;
    if (characterCount > 0) {
      truncateTextHighlightMeasurementClone(clone, end);
      const nextCharacterCount = typeof clone.characters === "string" ? clone.characters.length : 0;
      if (nextCharacterCount > 0) {
        clone.setRangeFills(0, nextCharacterCount, [createSolidPaint(textColorHex)]);
      }
    }
    return clone;
  }

  async function createTextHighlightSelectionMeasurementClone(node, start, end) {
    if (!node || typeof node.clone !== "function") {
      throw new Error("선택한 텍스트 범위를 측정할 복제 레이어를 만들지 못했습니다.");
    }

    const clone = node.clone();

    if ("effects" in clone && Array.isArray(clone.effects)) {
      clone.effects = [];
    }
    if ("strokes" in clone && Array.isArray(clone.strokes)) {
      clone.strokes = [];
    }
    if ("opacity" in clone && typeof clone.opacity === "number") {
      clone.opacity = 1;
    }
    if ("blendMode" in clone) {
      clone.blendMode = "NORMAL";
    }
    if (typeof clone.setRangeFills !== "function") {
      throw new Error("선택 텍스트의 하이라이트 측정을 지원하지 않는 텍스트 레이어입니다.");
    }

    try {
      await loadFontsForTextNode(clone);
    } catch (error) {}

    const characterCount = typeof clone.characters === "string" ? clone.characters.length : 0;
    if (characterCount > 0) {
      const rangeStart = Math.max(0, Math.min(characterCount, Math.floor(Number(start) || 0)));
      const rangeEnd = Math.max(rangeStart, Math.min(characterCount, Math.floor(Number(end) || 0)));
      clearTextHighlightDecoration(clone, 0, characterCount);
      clone.setRangeFills(0, characterCount, [createTransparentPaint()]);
      if (rangeEnd > rangeStart) {
        clone.setRangeFills(rangeStart, rangeEnd, [createSolidPaint(AI_TEXT_HIGHLIGHT_MEASURE_COLOR)]);
      }
    }

    return clone;
  }

  async function refineSingleLineTextHighlightBoundsWithSelectedWidth(
    node,
    start,
    end,
    textColorHex,
    fontSize,
    lineHeight,
    boundsList,
    endBoundsList
  ) {
    const characters = node && typeof node.characters === "string" ? node.characters : "";
    const characterCount = characters.length;
    const rangeStart = Math.max(0, Math.min(characterCount, Math.floor(Number(start) || 0)));
    const rangeEnd = Math.max(rangeStart, Math.min(characterCount, Math.floor(Number(end) || 0)));
    const selectedText = characters.slice(rangeStart, rangeEnd);
    if (!selectedText || /[\r\n]/.test(selectedText)) {
      return boundsList;
    }

    const sortedEndBoundsList = sortTextHighlightBoundsList(endBoundsList);
    const endRowBounds = sortedEndBoundsList.length ? sortedEndBoundsList[sortedEndBoundsList.length - 1] : null;
    if (!endRowBounds) {
      return boundsList;
    }

    const selectedOnlyMeasurement = await measureTextHighlightSelectedOnlyBounds(
      node,
      rangeStart,
      rangeEnd,
      textColorHex,
      fontSize,
      lineHeight
    );
    const selectedOnlyBounds = mergeTextHighlightBoundsList(
      getTextHighlightMeasurementBoundsList(selectedOnlyMeasurement)
    );
    const normalizedSelectedBounds = normalizeTextHighlightWorldBounds(selectedOnlyBounds);
    if (!normalizedSelectedBounds) {
      return boundsList;
    }

    const minimumWidth = getTextHighlightMinimumWidth(fontSize);
    const selectedWidth = roundTextHighlightMetric(
      Math.max(minimumWidth, Math.min(endRowBounds.width, normalizedSelectedBounds.width))
    );
    const endRight = endRowBounds.x + endRowBounds.width;
    const nextX = roundTextHighlightMetric(Math.max(endRowBounds.x, endRight - selectedWidth));
    const nextWidth = roundTextHighlightMetric(Math.max(minimumWidth, endRight - nextX));

    return [
      {
        x: nextX,
        y: endRowBounds.y,
        width: nextWidth,
        height: endRowBounds.height,
      },
    ];
  }

  async function measureTextHighlightSelectedOnlyBounds(node, start, end, textColorHex, fontSize, lineHeight) {
    const clone = await createTextHighlightSelectedOnlyMeasurementClone(node, start, end, textColorHex);
    try {
      const geometryMeasurement = await measureTextHighlightCloneGeometryBounds(node, clone, fontSize, lineHeight);
      if (getTextHighlightMeasurementBoundsList(geometryMeasurement).length) {
        return geometryMeasurement;
      }

      return await measureTextHighlightCloneBounds(node, clone, fontSize, lineHeight);
    } finally {
      if (clone && !clone.removed) {
        clone.remove();
      }
    }
  }

  async function createTextHighlightSelectedOnlyMeasurementClone(node, start, end, textColorHex) {
    if (!node || typeof node.clone !== "function") {
      throw new Error("선택 텍스트의 폭을 측정할 복제 레이어를 만들지 못했습니다.");
    }

    const clone = node.clone();

    if ("effects" in clone && Array.isArray(clone.effects)) {
      clone.effects = [];
    }
    if ("strokes" in clone && Array.isArray(clone.strokes)) {
      clone.strokes = [];
    }
    if ("opacity" in clone && typeof clone.opacity === "number") {
      clone.opacity = 1;
    }
    if ("blendMode" in clone) {
      clone.blendMode = "NORMAL";
    }
    if (typeof clone.setRangeFills !== "function") {
      throw new Error("선택 텍스트의 폭 측정을 지원하지 않는 텍스트 레이어입니다.");
    }

    try {
      await loadFontsForTextNode(clone);
    } catch (error) {}

    const characterCount = typeof clone.characters === "string" ? clone.characters.length : 0;
    const rangeStart = Math.max(0, Math.min(characterCount, Math.floor(Number(start) || 0)));
    const rangeEnd = Math.max(rangeStart, Math.min(characterCount, Math.floor(Number(end) || 0)));
    if (rangeEnd < characterCount) {
      deleteTextHighlightMeasurementCloneRange(clone, rangeEnd, characterCount);
    }
    if (rangeStart > 0) {
      deleteTextHighlightMeasurementCloneRange(clone, 0, rangeStart);
    }

    const nextCharacterCount = typeof clone.characters === "string" ? clone.characters.length : 0;
    if (nextCharacterCount > 0) {
      clearTextHighlightDecoration(clone, 0, nextCharacterCount);
      clone.setRangeFills(0, nextCharacterCount, [createSolidPaint(textColorHex)]);
    }

    return clone;
  }

  function deleteTextHighlightMeasurementCloneRange(node, start, end) {
    if (!node || typeof node.characters !== "string") {
      return;
    }

    const characterCount = node.characters.length;
    const rangeStart = Math.max(0, Math.min(characterCount, Math.floor(Number(start) || 0)));
    const rangeEnd = Math.max(rangeStart, Math.min(characterCount, Math.floor(Number(end) || 0)));
    if (rangeEnd <= rangeStart) {
      return;
    }

    if (typeof node.deleteCharacters === "function") {
      try {
        node.deleteCharacters(rangeStart, rangeEnd);
        return;
      } catch (error) {}
    }

    try {
      node.characters = node.characters.slice(0, rangeStart) + node.characters.slice(rangeEnd);
    } catch (error) {}
  }

  function isPlausibleExactTextHighlightFallbackBounds(node, bounds, start, end, fontSize, lineHeight) {
    const fallbackBounds = normalizeTextHighlightWorldBounds(bounds);
    if (!fallbackBounds) {
      return false;
    }

    if (isWholeTextHighlightRange(node, start, end)) {
      return true;
    }

    const nodeBounds = normalizeTextHighlightWorldBounds(getNodeRenderBounds(node));
    if (!nodeBounds) {
      return true;
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    const nearFullWidth = fallbackBounds.width >= nodeBounds.width * 0.96;
    const nearFullHeight = fallbackBounds.height >= nodeBounds.height * 0.9;
    const looksLikeSingleTextRow = fallbackBounds.height <= Math.max(resolvedLineHeight * 1.35, size * 1.7);
    const characters = node && typeof node.characters === "string" ? node.characters : "";
    const selectedText = characters.slice(
      Math.max(0, Math.min(characters.length, Math.floor(Number(start) || 0))),
      Math.max(0, Math.min(characters.length, Math.floor(Number(end) || 0)))
    );
    if (selectedText && !/[\r\n]/.test(selectedText) && looksLikeSingleTextRow) {
      const selectedLength = Math.max(1, compactText(selectedText).length);
      const maxExpectedWidth = Math.max(size * 2.6, selectedLength * size * 1.45);
      if (fallbackBounds.width > maxExpectedWidth) {
        return false;
      }
    }

    return !nearFullHeight || (!nearFullWidth && looksLikeSingleTextRow);
  }

  function hasSuspiciousTextHighlightDirectBounds(node, boundsList, start, end, fontSize, lineHeight) {
    const normalizedBoundsList = sortTextHighlightBoundsList(boundsList);
    if (!normalizedBoundsList.length || isWholeTextHighlightRange(node, start, end)) {
      return false;
    }

    const characters = node && typeof node.characters === "string" ? node.characters : "";
    const selectedText = characters.slice(
      Math.max(0, Math.min(characters.length, Math.floor(Number(start) || 0))),
      Math.max(0, Math.min(characters.length, Math.floor(Number(end) || 0)))
    );
    if (/[\r\n]/.test(selectedText)) {
      return false;
    }
    if (normalizedBoundsList.length > 1) {
      return true;
    }

    const nodeBounds = normalizeTextHighlightWorldBounds(getNodeRenderBounds(node));
    if (!nodeBounds) {
      return false;
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    const mergedBounds = mergeTextHighlightBoundsList(normalizedBoundsList);
    const bounds = normalizeTextHighlightWorldBounds(mergedBounds);
    if (!bounds) {
      return false;
    }

    const selectedLength = compactText(selectedText).length;
    const estimatedMaxWidth = Math.max(size * 2, selectedLength * size * 0.95);
    const looksLikeWholeRow = bounds.height <= resolvedLineHeight * 1.35 && bounds.width >= nodeBounds.width * 0.72;
    return looksLikeWholeRow && bounds.width > estimatedMaxWidth;
  }

  function subtractTextHighlightPrefixBounds(endBoundsList, startBoundsList, fontSize, lineHeight) {
    const normalizedEndBoundsList = sortTextHighlightBoundsList(endBoundsList);
    const normalizedStartBoundsList = sortTextHighlightBoundsList(startBoundsList);
    if (!normalizedEndBoundsList.length) {
      return [];
    }
    if (!normalizedStartBoundsList.length) {
      return normalizedEndBoundsList;
    }

    const rowTolerance = getTextHighlightRowTolerance(fontSize, lineHeight);
    const minimumWidth = getTextHighlightMinimumWidth(fontSize);
    const nextBoundsList = [];

    for (let index = 0; index < normalizedEndBoundsList.length; index += 1) {
      const endBounds = normalizedEndBoundsList[index];
      const endRight = endBounds.x + endBounds.width;
      let matchedStartRight = findTextHighlightMatchedStartRight(
        endBounds,
        normalizedStartBoundsList,
        rowTolerance,
        fontSize,
        lineHeight
      );
      if (!Number.isFinite(matchedStartRight)) {
        matchedStartRight = findTextHighlightIndexMatchedStartRight(
          endBounds,
          normalizedStartBoundsList,
          index,
          fontSize,
          lineHeight
        );
      }
      if (!Number.isFinite(matchedStartRight)) {
        continue;
      }

      const nextX = Math.max(endBounds.x, Math.min(endRight, matchedStartRight));
      const nextWidth = endRight - nextX;
      if (nextWidth < minimumWidth) {
        continue;
      }

      nextBoundsList.push({
        x: roundTextHighlightMetric(nextX),
        y: endBounds.y,
        width: roundTextHighlightMetric(nextWidth),
        height: endBounds.height,
      });
    }

    return nextBoundsList;
  }

  function extractTrailingTextHighlightBounds(endBoundsList, startBoundsList, fontSize, lineHeight) {
    const normalizedEndBoundsList = sortTextHighlightBoundsList(endBoundsList);
    const normalizedStartBoundsList = sortTextHighlightBoundsList(startBoundsList);
    if (!normalizedEndBoundsList.length) {
      return [];
    }
    if (!normalizedStartBoundsList.length) {
      return normalizedEndBoundsList.slice(-1);
    }

    const rowTolerance = getTextHighlightRowTolerance(fontSize, lineHeight);
    const minimumWidth = getTextHighlightMinimumWidth(fontSize);

    for (let index = normalizedEndBoundsList.length - 1; index >= 0; index -= 1) {
      const endBounds = normalizedEndBoundsList[index];
      const endRight = endBounds.x + endBounds.width;
      let matchedStartRight = findTextHighlightMatchedStartRight(
        endBounds,
        normalizedStartBoundsList,
        rowTolerance,
        fontSize,
        lineHeight
      );
      if (!Number.isFinite(matchedStartRight)) {
        matchedStartRight = findTextHighlightIndexMatchedStartRight(
          endBounds,
          normalizedStartBoundsList,
          index,
          fontSize,
          lineHeight
        );
      }

      if (!Number.isFinite(matchedStartRight)) {
        continue;
      }

      const nextX = Math.max(endBounds.x, Math.min(endRight, matchedStartRight));
      const nextWidth = endRight - nextX;
      if (nextWidth >= minimumWidth) {
        return [
          {
            x: roundTextHighlightMetric(nextX),
            y: endBounds.y,
            width: roundTextHighlightMetric(nextWidth),
            height: endBounds.height,
          },
        ];
      }
    }

    return [];
  }

  function findTextHighlightMatchedStartRight(endBounds, startBoundsList, rowTolerance, fontSize, lineHeight) {
    const normalizedEndBounds = normalizeTextHighlightWorldBounds(endBounds);
    if (!normalizedEndBounds || !Array.isArray(startBoundsList) || !startBoundsList.length) {
      return -Infinity;
    }

    let matchedStartRight = -Infinity;
    for (const startBounds of startBoundsList) {
      if (!doTextHighlightBoundsShareRow(normalizedEndBounds, startBounds, rowTolerance)) {
        continue;
      }
      matchedStartRight = Math.max(matchedStartRight, startBounds.x + startBounds.width);
    }

    if (Number.isFinite(matchedStartRight)) {
      return matchedStartRight;
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    const relaxedTolerance = Math.max(rowTolerance * 2.5, Math.min(resolvedLineHeight * 0.55, size * 0.9));
    const endCenter = normalizedEndBounds.y + normalizedEndBounds.height / 2;
    const endBottom = normalizedEndBounds.y + normalizedEndBounds.height;
    let bestDistance = Infinity;
    let bestRight = -Infinity;

    for (const startBounds of startBoundsList) {
      const normalizedStartBounds = normalizeTextHighlightWorldBounds(startBounds);
      if (!normalizedStartBounds) {
        continue;
      }

      const startCenter = normalizedStartBounds.y + normalizedStartBounds.height / 2;
      const startBottom = normalizedStartBounds.y + normalizedStartBounds.height;
      const distance = Math.min(Math.abs(startCenter - endCenter), Math.abs(startBottom - endBottom));
      if (distance > relaxedTolerance || distance >= bestDistance) {
        continue;
      }

      bestDistance = distance;
      bestRight = normalizedStartBounds.x + normalizedStartBounds.width;
    }

    return bestRight;
  }

  function findTextHighlightIndexMatchedStartRight(endBounds, startBoundsList, index, fontSize, lineHeight) {
    const normalizedEndBounds = normalizeTextHighlightWorldBounds(endBounds);
    const normalizedStartBoundsList = sortTextHighlightBoundsList(startBoundsList);
    if (!normalizedEndBounds || !normalizedStartBoundsList.length) {
      return -Infinity;
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    const relaxedTolerance = Math.max(resolvedLineHeight * 0.65, size);
    const endRight = normalizedEndBounds.x + normalizedEndBounds.width;
    const endCenter = normalizedEndBounds.y + normalizedEndBounds.height / 2;
    const candidateIndexes = [index, index - 1, index + 1, normalizedStartBoundsList.length - 1];
    let bestRight = -Infinity;
    let bestScore = Infinity;

    for (const candidateIndex of candidateIndexes) {
      if (candidateIndex < 0 || candidateIndex >= normalizedStartBoundsList.length) {
        continue;
      }

      const candidate = normalizeTextHighlightWorldBounds(normalizedStartBoundsList[candidateIndex]);
      if (!candidate) {
        continue;
      }

      const candidateRight = candidate.x + candidate.width;
      const verticalDistance = Math.abs(candidate.y + candidate.height / 2 - endCenter);
      if (candidateRight <= normalizedEndBounds.x - size * 0.5 || candidateRight > endRight + size * 0.5) {
        continue;
      }
      if (verticalDistance > relaxedTolerance) {
        continue;
      }

      const score = verticalDistance + Math.abs(endRight - candidateRight) * 0.02;
      if (score < bestScore) {
        bestScore = score;
        bestRight = candidateRight;
      }
    }

    return bestRight;
  }

  function sortTextHighlightBoundsList(boundsList) {
    if (!Array.isArray(boundsList) || !boundsList.length) {
      return [];
    }

    return boundsList
      .map((bounds) => normalizeTextHighlightWorldBounds(bounds))
      .filter(Boolean)
      .sort((left, right) => {
        if (Math.abs(left.y - right.y) > 0.5) {
          return left.y - right.y;
        }
        if (Math.abs(left.x - right.x) > 0.5) {
          return left.x - right.x;
        }
        return left.width - right.width;
      });
  }

  function getTextHighlightRowTolerance(fontSize, lineHeight) {
    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    return roundTextHighlightMetric(Math.max(2, Math.min(12, resolvedLineHeight * 0.18)));
  }

  function getTextHighlightMinimumWidth(fontSize) {
    const size = Math.max(12, Number(fontSize) || 16);
    return roundTextHighlightMetric(Math.max(1, Math.min(6, size * 0.08)));
  }

  function doTextHighlightBoundsShareRow(leftBounds, rightBounds, rowTolerance) {
    const left = normalizeTextHighlightWorldBounds(leftBounds);
    const right = normalizeTextHighlightWorldBounds(rightBounds);
    if (!left || !right) {
      return false;
    }

    const leftBottom = left.y + left.height;
    const rightBottom = right.y + right.height;
    const overlap = Math.min(leftBottom, rightBottom) - Math.max(left.y, right.y);
    const minimumOverlap = Math.max(1, Math.min(left.height, right.height) * 0.25);
    if (overlap >= minimumOverlap) {
      return true;
    }

    const leftCenter = left.y + left.height / 2;
    const rightCenter = right.y + right.height / 2;
    return Math.abs(leftCenter - rightCenter) <= Math.max(1, Number(rowTolerance) || 0);
  }

  function buildConservativeTextHighlightBounds(node, start, end, fontSize, lineHeight, startBounds, endBounds) {
    const resolvedEndBounds = normalizeTextHighlightWorldBounds(endBounds);
    if (!resolvedEndBounds) {
      return [];
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    const minimumWidth = getTextHighlightMinimumWidth(size);
    const approximateLineHeight = roundTextHighlightMetric(
      Math.max(1, Math.min(resolvedEndBounds.height, resolvedLineHeight))
    );
    const endBottom = resolvedEndBounds.y + resolvedEndBounds.height;
    const nextY = roundTextHighlightMetric(Math.max(resolvedEndBounds.y, endBottom - approximateLineHeight));
    const endRight = resolvedEndBounds.x + resolvedEndBounds.width;
    let nextX = resolvedEndBounds.x;

    const resolvedStartBounds = normalizeTextHighlightWorldBounds(startBounds);
    if (resolvedStartBounds) {
      const startBottom = resolvedStartBounds.y + resolvedStartBounds.height;
      if (Math.abs(startBottom - endBottom) <= Math.max(2, resolvedLineHeight * 0.75)) {
        nextX = Math.max(resolvedEndBounds.x, Math.min(endRight, resolvedStartBounds.x + resolvedStartBounds.width));
      }
    } else if ((Number(start) || 0) <= 0) {
      nextX = resolvedEndBounds.x;
    }

    let nextWidth = endRight - nextX;
    if (nextWidth < minimumWidth) {
      nextX = Math.max(resolvedEndBounds.x, endRight - Math.max(minimumWidth, resolvedEndBounds.width * 0.18));
      nextWidth = endRight - nextX;
    }

    if (nextWidth < minimumWidth) {
      return [];
    }

    return [
      {
        x: roundTextHighlightMetric(nextX),
        y: nextY,
        width: roundTextHighlightMetric(nextWidth),
        height: approximateLineHeight,
      },
    ];
  }

  function buildEmergencyTextHighlightBounds(node, start, end, fontSize, lineHeight) {
    const nodeBounds = getNodeRenderBounds(node);
    const resolvedNodeBounds = normalizeTextHighlightWorldBounds(nodeBounds);
    if (!resolvedNodeBounds) {
      return [];
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    const approximateLineHeight = roundTextHighlightMetric(
      Math.max(1, Math.min(resolvedNodeBounds.height, resolvedLineHeight))
    );
    const selectionLength = Math.max(1, Math.floor(Number(end) || 0) - Math.floor(Number(start) || 0));
    const estimatedWidth = roundTextHighlightMetric(
      Math.max(
        getTextHighlightMinimumWidth(size),
        Math.min(resolvedNodeBounds.width, selectionLength * Math.max(4, size * 0.42))
      )
    );

    return [
      {
        x: resolvedNodeBounds.x,
        y: roundTextHighlightMetric(
          Math.max(resolvedNodeBounds.y, resolvedNodeBounds.y + resolvedNodeBounds.height - approximateLineHeight)
        ),
        width: estimatedWidth,
        height: approximateLineHeight,
      },
    ];
  }

  function truncateTextHighlightMeasurementClone(node, end) {
    if (!node || typeof node.characters !== "string") {
      return;
    }

    const characterCount = node.characters.length;
    const truncateAt = Math.max(0, Math.min(characterCount, Math.floor(Number(end) || 0)));
    if (truncateAt >= characterCount) {
      return;
    }

    if (typeof node.deleteCharacters === "function") {
      try {
        node.deleteCharacters(truncateAt, characterCount);
        return;
      } catch (error) {}
    }

    try {
      node.characters = node.characters.slice(0, truncateAt);
    } catch (error) {}
  }

  function moveTextHighlightMeasureClone(sourceNode, cloneNode, parentNode, offsetX, offsetY) {
    const targetParent = parentNode && !parentNode.removed ? parentNode : figma.currentPage;
    if (cloneNode.parent !== targetParent) {
      targetParent.appendChild(cloneNode);
    }

    if ("layoutPositioning" in cloneNode) {
      try {
        cloneNode.layoutPositioning = "ABSOLUTE";
      } catch (error) {}
    }

    const sourceTransform = getAbsoluteTransformMatrix(sourceNode);
    const xOffset = Number(offsetX) || 0;
    const yOffset = Number(offsetY) || 0;
    if ("relativeTransform" in cloneNode && Array.isArray(cloneNode.relativeTransform)) {
      cloneNode.relativeTransform = [
        [sourceTransform[0][0], sourceTransform[0][1], sourceTransform[0][2] - xOffset],
        [sourceTransform[1][0], sourceTransform[1][1], sourceTransform[1][2] - yOffset],
      ];
      return;
    }

    if ("x" in cloneNode && typeof cloneNode.x === "number" && "y" in cloneNode && typeof cloneNode.y === "number") {
      cloneNode.x = roundTextHighlightMetric(sourceTransform[0][2] - xOffset);
      cloneNode.y = roundTextHighlightMetric(sourceTransform[1][2] - yOffset);
    }
  }

  function getVisibleTextHighlightBounds(node) {
    if (!node) {
      return null;
    }

    const bounds = getNodeRenderBounds(node);
    if (bounds) {
      return bounds;
    }

    return null;
  }

  function getTextHighlightMeasurementBoundsList(measurement, fallbackNode) {
    const boundsList = [];
    const measurementSegments =
      measurement && Array.isArray(measurement.boundsList)
        ? measurement.boundsList
        : measurement && Array.isArray(measurement.segments)
          ? measurement.segments
          : null;
    if (measurementSegments) {
      for (const segment of measurementSegments) {
        const normalizedSegment = normalizeTextHighlightWorldBounds(segment);
        if (normalizedSegment) {
          boundsList.push(normalizedSegment);
        }
      }
    }

    if (!boundsList.length && measurement && measurement.bounds) {
      const normalizedBounds = normalizeTextHighlightWorldBounds(measurement.bounds);
      if (normalizedBounds) {
        boundsList.push(normalizedBounds);
      }
    }

    if (!boundsList.length && fallbackNode) {
      const fallbackBounds = getVisibleTextHighlightBounds(fallbackNode);
      if (fallbackBounds) {
        boundsList.push(fallbackBounds);
      }
    }

    return boundsList;
  }

  function normalizeTextHighlightWorldBounds(bounds) {
    if (!bounds || typeof bounds !== "object") {
      return null;
    }

    const x = Number(bounds.x);
    const y = Number(bounds.y);
    const width = Number(bounds.width);
    const height = Number(bounds.height);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
      return null;
    }

    if (width <= 0 || height <= 0) {
      return null;
    }

    return {
      x: roundTextHighlightMetric(x),
      y: roundTextHighlightMetric(y),
      width: roundTextHighlightMetric(width),
      height: roundTextHighlightMetric(height),
    };
  }

  function mergeTextHighlightBoundsList(boundsList) {
    if (!Array.isArray(boundsList) || !boundsList.length) {
      return null;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const bounds of boundsList) {
      const normalizedBounds = normalizeTextHighlightWorldBounds(bounds);
      if (!normalizedBounds) {
        continue;
      }

      minX = Math.min(minX, normalizedBounds.x);
      minY = Math.min(minY, normalizedBounds.y);
      maxX = Math.max(maxX, normalizedBounds.x + normalizedBounds.width);
      maxY = Math.max(maxY, normalizedBounds.y + normalizedBounds.height);
    }

    if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
      return null;
    }

    return {
      x: roundTextHighlightMetric(minX),
      y: roundTextHighlightMetric(minY),
      width: roundTextHighlightMetric(Math.max(1, maxX - minX)),
      height: roundTextHighlightMetric(Math.max(1, maxY - minY)),
    };
  }

  function hasMergedTextHighlightBlockBounds(boundsList, fontSize) {
    if (!Array.isArray(boundsList) || boundsList.length !== 1) {
      return false;
    }

    const bounds = normalizeTextHighlightWorldBounds(boundsList[0]);
    if (!bounds) {
      return false;
    }

    const size = Math.max(12, Number(fontSize) || 16);
    return bounds.height > Math.max(size * 1.9, 30);
  }

  function splitMergedTextHighlightBlockBounds(boundsList, fontSize, lineHeight) {
    const mergedBounds = mergeTextHighlightBoundsList(boundsList);
    const bounds = normalizeTextHighlightWorldBounds(mergedBounds);
    if (!bounds) {
      return Array.isArray(boundsList) ? boundsList : [];
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    const lineCount = Math.max(2, Math.min(80, Math.ceil(Math.max(0, bounds.height - size) / resolvedLineHeight) + 1));
    if (lineCount <= 1) {
      return [bounds];
    }

    const chunkHeight = bounds.height / lineCount;
    const nextBoundsList = [];
    for (let index = 0; index < lineCount; index += 1) {
      const chunkY = bounds.y + chunkHeight * index;
      const nextY = index === lineCount - 1 ? bounds.y + bounds.height : bounds.y + chunkHeight * (index + 1);
      const nextHeight = Math.max(1, nextY - chunkY);
      nextBoundsList.push({
        x: bounds.x,
        y: roundTextHighlightMetric(chunkY),
        width: bounds.width,
        height: roundTextHighlightMetric(nextHeight),
      });
    }

    return nextBoundsList.length ? nextBoundsList : [bounds];
  }

  function normalizeTextHighlightBoundsListForApply(node, start, end, boundsList, fontSize, lineHeight) {
    let rows = sortTextHighlightBoundsList(boundsList);
    if (!rows.length) {
      rows = buildConservativeTextHighlightBounds(node, start, end, fontSize, lineHeight, null, null);
    }
    if (!rows.length) {
      rows = buildEmergencyTextHighlightBounds(node, start, end, fontSize, lineHeight);
    }
    if (!rows.length) {
      return [];
    }

    const nodeBounds = normalizeTextHighlightWorldBounds(getNodeRenderBounds(node));
    if (!nodeBounds) {
      return rows;
    }

    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedLineHeight = Math.max(size, Number(lineHeight) || size * 1.2);
    const padding = Math.max(120, size * 4, resolvedLineHeight * 3);
    const expandedNodeBounds = {
      x: nodeBounds.x - padding,
      y: nodeBounds.y - padding,
      width: nodeBounds.width + padding * 2,
      height: nodeBounds.height + padding * 2,
    };
    const maximumRowHeight = Math.max(resolvedLineHeight * 2.6, size * 3.2);
    const filteredRows = rows.filter((row) => {
      const bounds = normalizeTextHighlightWorldBounds(row);
      if (!bounds) {
        return false;
      }
      if (bounds.height > maximumRowHeight && bounds.height > nodeBounds.height * 0.65) {
        return false;
      }
      return doTextHighlightBoundsIntersect(bounds, expandedNodeBounds);
    });

    if (filteredRows.length) {
      return filteredRows;
    }

    const conservativeRows = buildConservativeTextHighlightBounds(node, start, end, fontSize, lineHeight, null, null);
    const safeConservativeRows = conservativeRows.filter((row) => {
      const bounds = normalizeTextHighlightWorldBounds(row);
      return !!bounds && doTextHighlightBoundsIntersect(bounds, expandedNodeBounds);
    });
    if (safeConservativeRows.length) {
      return safeConservativeRows;
    }

    return buildEmergencyTextHighlightBounds(node, start, end, fontSize, lineHeight).filter((row) => {
      const bounds = normalizeTextHighlightWorldBounds(row);
      return !!bounds && doTextHighlightBoundsIntersect(bounds, expandedNodeBounds);
    });
  }

  function doTextHighlightBoundsIntersect(left, right) {
    const leftBounds = normalizeTextHighlightWorldBounds(left);
    const rightBounds = normalizeTextHighlightWorldBounds(right);
    if (!leftBounds || !rightBounds) {
      return false;
    }

    return (
      leftBounds.x < rightBounds.x + rightBounds.width &&
      leftBounds.x + leftBounds.width > rightBounds.x &&
      leftBounds.y < rightBounds.y + rightBounds.height &&
      leftBounds.y + leftBounds.height > rightBounds.y
    );
  }

  function getTextRangeFontSize(node, start, end) {
    const segments = getTextHighlightStyledSegments(node, start, end, ["fontSize"]);
    let maxSize = 0;

    for (const segment of segments) {
      const fontSize = segment && typeof segment.fontSize === "number" ? segment.fontSize : 0;
      if (fontSize > maxSize) {
        maxSize = fontSize;
      }
    }

    if (maxSize > 0) {
      return maxSize;
    }

    if (node && typeof node.getRangeFontSize === "function") {
      try {
        const rangeFontSize = node.getRangeFontSize(start, end);
        if (typeof rangeFontSize === "number" && Number.isFinite(rangeFontSize) && rangeFontSize > 0) {
          return rangeFontSize;
        }
      } catch (error) {}
    }

    if (node && typeof node.fontSize === "number" && Number.isFinite(node.fontSize) && node.fontSize > 0) {
      return node.fontSize;
    }

    return 16;
  }

  function getTextRangeLineHeight(node, start, end, fontSize) {
    const fallback = getFallbackTextHighlightLineHeight(fontSize);
    const segments = getTextHighlightStyledSegments(node, start, end, ["fontSize", "lineHeight"]);
    let maxLineHeight = 0;

    for (const segment of segments) {
      const segmentFontSize =
        segment && typeof segment.fontSize === "number" && Number.isFinite(segment.fontSize)
          ? segment.fontSize
          : fontSize;
      const nextLineHeight = resolveTextHighlightLineHeight(segment && segment.lineHeight, segmentFontSize);
      if (nextLineHeight > maxLineHeight) {
        maxLineHeight = nextLineHeight;
      }
    }

    if (maxLineHeight > 0) {
      return roundTextHighlightMetric(maxLineHeight);
    }

    if (node && typeof node.getRangeLineHeight === "function") {
      try {
        const rangeLineHeight = resolveTextHighlightLineHeight(node.getRangeLineHeight(start, end), fontSize);
        if (rangeLineHeight > 0) {
          return roundTextHighlightMetric(rangeLineHeight);
        }
      } catch (error) {}
    }

    return fallback;
  }

  function resolveTextHighlightLineHeight(lineHeight, fontSize) {
    const size = Math.max(12, Number(fontSize) || 16);
    if (!lineHeight || lineHeight === figma.mixed) {
      return 0;
    }

    if (typeof lineHeight === "number" && Number.isFinite(lineHeight) && lineHeight > 0) {
      return lineHeight;
    }

    if (typeof lineHeight !== "object") {
      return 0;
    }

    const unit = typeof lineHeight.unit === "string" ? lineHeight.unit.toUpperCase() : "";
    const value = Number(lineHeight.value);
    if (unit === "PIXELS" && Number.isFinite(value) && value > 0) {
      return value;
    }
    if (unit === "PERCENT" && Number.isFinite(value) && value > 0) {
      return size * (value / 100);
    }
    if (unit === "AUTO") {
      return getFallbackTextHighlightLineHeight(size);
    }

    return 0;
  }

  function getFallbackTextHighlightLineHeight(fontSize) {
    const size = Math.max(12, Number(fontSize) || 16);
    return roundTextHighlightMetric(size * 1.2);
  }

  function getTextHighlightStyledSegments(node, start, end, fields) {
    if (!node || typeof node.getStyledTextSegments !== "function") {
      return [];
    }

    try {
      const segments = node.getStyledTextSegments(fields, start, end);
      return Array.isArray(segments) ? segments : [];
    } catch (error) {
      return [];
    }
  }

  function getTextHighlightPaints(node, start, end) {
    if (!node || typeof node.getRangeFills !== "function") {
      return null;
    }

    try {
      const fills = node.getRangeFills(start, end);
      return Array.isArray(fills) ? fills : null;
    } catch (error) {
      return null;
    }
  }

  async function applyTextHighlightColor(node, start, end, textColorHex) {
    if (!node || typeof node.setRangeFills !== "function") {
      throw new Error("선택한 텍스트 색상을 변경할 수 없습니다.");
    }

    try {
      await loadFontsForTextNode(node);
    } catch (error) {}

    node.setRangeFills(start, end, [createSolidPaint(textColorHex)]);
  }

  function createTextHighlightRect(node, parent, worldBounds, fontSize, colorHex, cornerRadius, boxPaddingPx) {
    const nodeTransform = getAbsoluteTransformMatrix(node);
    const inverseNodeTransform = invertAffineTransform(nodeTransform);
    if (!inverseNodeTransform) {
      throw new Error("텍스트 하이라이트 위치를 계산하지 못했습니다.");
    }

    const localBounds = getTextHighlightLocalBounds(inverseNodeTransform, worldBounds);
    const padding = buildTextHighlightBoxPixelPadding(fontSize, boxPaddingPx);
    const localX = localBounds.x - padding.left;
    const localY = localBounds.y - padding.top;
    const localWidth = Math.max(1, localBounds.width + padding.left + padding.right);
    const localHeight = ceilTextHighlightMetric(localBounds.height + padding.top + padding.bottom);
    const clampedGeometry = clampTextHighlightLocalGeometryToParentBounds(node, parent, {
      x: localX,
      y: localY,
      width: localWidth,
      height: localHeight,
    });
    return createTextHighlightRectFromLocalGeometry(
      node,
      parent,
      clampedGeometry.x,
      clampedGeometry.y,
      clampedGeometry.width,
      clampedGeometry.height,
      colorHex,
      sanitizeTextHighlightRadius(cornerRadius, padding.radius)
    );
  }

  function createTextHighlightLineRect(node, parent, worldBounds, fontSize, thickness, colorHex, cornerRadius) {
    const nodeTransform = getAbsoluteTransformMatrix(node);
    const inverseNodeTransform = invertAffineTransform(nodeTransform);
    if (!inverseNodeTransform) {
      throw new Error("라인형 하이라이트 위치를 계산하지 못했습니다.");
    }

    const localBounds = getTextHighlightLocalBounds(inverseNodeTransform, worldBounds);
    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedThickness = roundTextHighlightThickness(
      Math.max(2, Math.min(size * 1.35, Number(thickness) || size * 0.16))
    );
    const horizontalPadding = 0;
    const lineBottomAnchor = roundTextHighlightMetric(localBounds.y + localBounds.height + Math.max(0.5, size * 0.02));
    const localX = localBounds.x - horizontalPadding;
    const localY = lineBottomAnchor - resolvedThickness;
    const localWidth = Math.max(1, localBounds.width + horizontalPadding * 2);
    const localHeight = Math.max(1, resolvedThickness);
    const clampedGeometry = clampTextHighlightLocalGeometryToParentBounds(node, parent, {
      x: localX,
      y: localY,
      width: localWidth,
      height: localHeight,
    });

    return createTextHighlightRectFromLocalGeometry(
      node,
      parent,
      clampedGeometry.x,
      clampedGeometry.y,
      clampedGeometry.width,
      clampedGeometry.height,
      colorHex,
      sanitizeTextHighlightRadius(cornerRadius, AI_TEXT_HIGHLIGHT_DEFAULT_STRIKE_RADIUS)
    );
  }

  function createTextHighlightStrikeRect(node, parent, worldBounds, fontSize, thickness, colorHex, cornerRadius) {
    const nodeTransform = getAbsoluteTransformMatrix(node);
    const inverseNodeTransform = invertAffineTransform(nodeTransform);
    if (!inverseNodeTransform) {
      throw new Error("취소선형 하이라이트 위치를 계산하지 못했습니다.");
    }

    const localBounds = getTextHighlightLocalBounds(inverseNodeTransform, worldBounds);
    const size = Math.max(12, Number(fontSize) || 16);
    const resolvedThickness = roundTextHighlightThickness(
      Math.max(2, Math.min(size * 1.45, Number(thickness) || size * 0.22))
    );
    const horizontalPadding = 0;
    const centerY = localBounds.y + localBounds.height * 0.5;
    const localX = localBounds.x - horizontalPadding;
    const localY = centerY - resolvedThickness / 2;
    const localWidth = Math.max(1, localBounds.width + horizontalPadding * 2);
    const localHeight = Math.max(1, resolvedThickness);
    const clampedGeometry = clampTextHighlightLocalGeometryToParentBounds(node, parent, {
      x: localX,
      y: localY,
      width: localWidth,
      height: localHeight,
    });

    return createTextHighlightRectFromLocalGeometry(
      node,
      parent,
      clampedGeometry.x,
      clampedGeometry.y,
      clampedGeometry.width,
      clampedGeometry.height,
      colorHex,
      sanitizeTextHighlightRadius(cornerRadius, roundTextHighlightMetric(Math.max(0, Math.min(999, resolvedThickness / 2))))
    );
  }

  function clampTextHighlightLocalGeometryToParentBounds(node, parent, geometry) {
    return normalizeTextHighlightLocalGeometry(geometry);
  }

  function normalizeTextHighlightLocalGeometry(geometry) {
    return {
      x: roundTextHighlightMetric(Number(geometry && geometry.x) || 0),
      y: roundTextHighlightMetric(Number(geometry && geometry.y) || 0),
      width: roundTextHighlightMetric(Math.max(1, Number(geometry && geometry.width) || 1)),
      height: ceilTextHighlightMetric(Math.max(1, Number(geometry && geometry.height) || 1)),
    };
  }

  function createTextHighlightRectFromLocalGeometry(node, parent, localX, localY, localWidth, localHeight, colorHex, cornerRadius) {
    const nodeTransform = getAbsoluteTransformMatrix(node);
    const rect = figma.createRectangle();

    rect.resize(Math.max(1, localWidth), Math.max(1, localHeight));
    rect.cornerRadius = sanitizeTextHighlightRadius(cornerRadius, 0);
    rect.fills = [createSolidPaint(colorHex)];
    rect.strokes = [];

    if ("layoutPositioning" in rect && (isAutoLayoutParent(parent) || isReusableTextHighlightContainer(parent))) {
      setTextHighlightAbsoluteLayout(rect);
    }

    const absoluteOrigin = transformPointWithMatrix(nodeTransform, localX, localY);
    const desiredAbsoluteTransform = [
      [nodeTransform[0][0], nodeTransform[0][1], absoluteOrigin.x],
      [nodeTransform[1][0], nodeTransform[1][1], absoluteOrigin.y],
    ];
    const parentTransform = getAbsoluteTransformMatrix(parent);
    const inverseParentTransform = invertAffineTransform(parentTransform);
    const relativeTransform = inverseParentTransform
      ? multiplyAffineTransforms(inverseParentTransform, desiredAbsoluteTransform)
      : desiredAbsoluteTransform;

    if (rect.parent !== parent) {
      if ("relativeTransform" in rect && Array.isArray(rect.relativeTransform)) {
        rect.relativeTransform = relativeTransform;
      } else if ("x" in rect && typeof rect.x === "number" && "y" in rect && typeof rect.y === "number") {
        rect.x = roundTextHighlightMetric(relativeTransform[0][2]);
        rect.y = roundTextHighlightMetric(relativeTransform[1][2]);
      }
      parent.appendChild(rect);
      if (isAutoLayoutParent(parent)) {
        setTextHighlightAbsoluteLayout(rect);
      }
    }

    if ("relativeTransform" in rect && Array.isArray(rect.relativeTransform)) {
      rect.relativeTransform = relativeTransform;
    } else if ("x" in rect && typeof rect.x === "number" && "y" in rect && typeof rect.y === "number") {
      rect.x = roundTextHighlightMetric(relativeTransform[0][2]);
      rect.y = roundTextHighlightMetric(relativeTransform[1][2]);
    }

    return rect;
  }

  function setTextHighlightAbsoluteLayout(node) {
    if (!node || !("layoutPositioning" in node)) {
      return;
    }

    try {
      node.layoutPositioning = "ABSOLUTE";
    } catch (error) {}
  }

  function prepareTextHighlightLayerContainer(parent, node) {
    const nodeIndex = findNodeChildIndex(parent, node && node.id);
    const groupOverlayTarget = getTextHighlightGroupOverlayTarget(parent);
    if (groupOverlayTarget) {
      return {
        parent: groupOverlayTarget.parent,
        nodeIndex: findNodeChildIndex(groupOverlayTarget.parent, groupOverlayTarget.anchorNodeId),
        anchorNodeId: groupOverlayTarget.anchorNodeId,
        looseHighlights: true,
        externalOverlay: true,
      };
    }

    return {
      parent,
      nodeIndex,
      looseHighlights: true,
      anchorNodeId: node && node.id,
    };
  }

  function getTextHighlightGroupOverlayTarget(parent) {
    if (!parent || parent.type !== "GROUP") {
      return null;
    }

    let anchor = parent;
    let overlayParent = parent.parent;
    while (overlayParent && overlayParent.type === "GROUP") {
      anchor = overlayParent;
      overlayParent = overlayParent.parent;
    }

    if (!anchor || !overlayParent || overlayParent.type === "DOCUMENT" || !("children" in overlayParent)) {
      return null;
    }

    return {
      parent: overlayParent,
      anchorNodeId: anchor.id,
    };
  }

  function finalizeTextHighlightLayerContainer(container, node, options) {
    return;
  }

  function groupTextHighlightSelection(parent, node, rect, index, options) {
    const rects = Array.isArray(rect) ? rect.filter(Boolean) : rect ? [rect] : [];
    return groupLooseTextHighlightSelection(rects);
  }

  function groupLooseTextHighlightSelection(rects) {
    const nodesToGroup = Array.isArray(rects) ? rects.filter(Boolean) : [];
    if (!nodesToGroup.length) {
      throw new Error("Could not prepare text highlight layers.");
    }

    for (let nodeIndex = 0; nodeIndex < nodesToGroup.length; nodeIndex += 1) {
      const highlightNode = nodesToGroup[nodeIndex];
      try {
        highlightNode.name =
          nodesToGroup.length > 1
            ? `Text Highlight ${nodeIndex + 1}`
            : "Text Highlight";
      } catch (error) {}
    }

    return nodesToGroup[0];
  }

  function markTextHighlightGroup(group, node) {
    if (!group) {
      return;
    }

    try {
      group.name = AI_TEXT_HIGHLIGHT_GROUP_NAME;
    } catch (error) {}

    if (typeof group.setPluginData === "function") {
      try {
        group.setPluginData(AI_TEXT_HIGHLIGHT_GROUP_PLUGIN_KEY, "1");
        group.setPluginData(AI_TEXT_HIGHLIGHT_GROUP_TEXT_NODE_KEY, node && typeof node.id === "string" ? node.id : "");
      } catch (error) {}
    }
  }

  function isReusableTextHighlightGroup(group, node) {
    if (!group || group.removed || (group.type !== "GROUP" && group.type !== "FRAME")) {
      return false;
    }

    if (!node || node.removed || node.parent !== group) {
      return false;
    }

    if (safeName(group) === AI_TEXT_HIGHLIGHT_GROUP_NAME || looksLikeLegacyTextHighlightGroup(group, node)) {
      return true;
    }

    if (typeof group.getPluginData === "function") {
      try {
        return group.getPluginData(AI_TEXT_HIGHLIGHT_GROUP_PLUGIN_KEY) === "1";
      } catch (error) {}
    }

    return false;
  }

  function isReusableTextHighlightContainer(group) {
    if (!group || group.removed || (group.type !== "GROUP" && group.type !== "FRAME")) {
      return false;
    }

    if (safeName(group) === AI_TEXT_HIGHLIGHT_GROUP_NAME) {
      return true;
    }

    if (typeof group.getPluginData === "function") {
      try {
        return group.getPluginData(AI_TEXT_HIGHLIGHT_GROUP_PLUGIN_KEY) === "1";
      } catch (error) {}
    }

    return false;
  }

  function looksLikeLegacyTextHighlightGroup(group, node) {
    if (!group || group.type !== "GROUP" || !node || node.parent !== group) {
      return false;
    }
    if (!("children" in group) || !Array.isArray(group.children)) {
      return false;
    }

    let hasText = false;
    let hasHighlightShape = false;
    for (const child of group.children) {
      if (!child || child.removed) {
        continue;
      }
      if (child.id === node.id || child.type === "TEXT") {
        hasText = true;
      }
      const childName = safeName(child);
      if (
        /highlight/i.test(childName) &&
        (child.type === "RECTANGLE" || child.type === "VECTOR" || child.type === "LINE" || child.type === "BOOLEAN_OPERATION")
      ) {
        hasHighlightShape = true;
      }
    }

    return hasText && hasHighlightShape && /highlight/i.test(safeName(group));
  }

  function placeTextHighlightRectBehindNode(parent, rect, nodeId, index) {
    if (!parent || !rect || typeof parent.insertChild !== "function") {
      return;
    }

    const targetIndex =
      typeof index === "number" && index >= 0 ? index : findNodeChildIndex(parent, typeof nodeId === "string" ? nodeId : "");
    if (targetIndex < 0) {
      return;
    }

    try {
      parent.insertChild(targetIndex, rect);
      if (isAutoLayoutParent(parent)) {
        setTextHighlightAbsoluteLayout(rect);
      }
    } catch (error) {}
  }

  function findNodeChildIndex(parent, nodeId) {
    if (!parent || !("children" in parent) || !Array.isArray(parent.children)) {
      return -1;
    }

    for (let index = 0; index < parent.children.length; index += 1) {
      if (parent.children[index] && parent.children[index].id === nodeId) {
        return index;
      }
    }

    return -1;
  }

  function isAutoLayoutParent(node) {
    return !!node && "layoutMode" in node && typeof node.layoutMode === "string" && node.layoutMode !== "NONE";
  }

  function shouldPreserveAbsoluteLayoutPositioning(node) {
    return !!node && "layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE";
  }

  function buildTextHighlightPadding(fontSize) {
    const size = Math.max(12, Number(fontSize) || 16);
    return {
      left: roundTextHighlightMetric(Math.max(6, size * 0.18)),
      right: roundTextHighlightMetric(Math.max(6, size * 0.18)),
      top: roundTextHighlightMetric(Math.max(3, size * 0.08)),
      bottom: roundTextHighlightMetric(Math.max(4, size * 0.12)),
      radius: roundTextHighlightMetric(Math.max(4, Math.min(14, size * 0.16))),
    };
  }

  function buildTextHighlightBoxPixelPadding(fontSize, boxPaddingPx) {
    const size = Math.max(12, Number(fontSize) || 16);
    const padding = sanitizeTextHighlightBoxPaddingPx(boxPaddingPx, AI_TEXT_HIGHLIGHT_DEFAULT_BOX_PADDING_PX);
    return {
      left: padding,
      right: padding,
      top: padding,
      bottom: padding,
      radius: roundTextHighlightMetric(Math.max(0, Math.min(14, size * 0.16))),
    };
  }

  function getNodeRenderBounds(node) {
    if (!node || node.removed) {
      return null;
    }

    try {
      const renderBounds = "absoluteRenderBounds" in node ? node.absoluteRenderBounds : null;
      if (renderBounds && renderBounds.width > 0 && renderBounds.height > 0) {
        return {
          x: roundTextHighlightMetric(renderBounds.x),
          y: roundTextHighlightMetric(renderBounds.y),
          width: roundTextHighlightMetric(renderBounds.width),
          height: roundTextHighlightMetric(renderBounds.height),
        };
      }
    } catch (error) {}

    try {
      const absoluteBounds = "absoluteBoundingBox" in node ? node.absoluteBoundingBox : null;
      if (absoluteBounds && absoluteBounds.width > 0 && absoluteBounds.height > 0) {
        return {
          x: roundTextHighlightMetric(absoluteBounds.x),
          y: roundTextHighlightMetric(absoluteBounds.y),
          width: roundTextHighlightMetric(absoluteBounds.width),
          height: roundTextHighlightMetric(absoluteBounds.height),
        };
      }
    } catch (error) {}

    try {
      if ("width" in node && "height" in node && Number(node.width) > 0 && Number(node.height) > 0) {
        const matrix = getAbsoluteTransformMatrix(node);
        const isAxisAligned =
          Math.abs(Number(matrix[0][1]) || 0) <= 0.0001 &&
          Math.abs(Number(matrix[1][0]) || 0) <= 0.0001;
        if (isAxisAligned) {
          return {
            x: roundTextHighlightMetric(Number(matrix[0][2]) || 0),
            y: roundTextHighlightMetric(Number(matrix[1][2]) || 0),
            width: roundTextHighlightMetric(Number(node.width) || 0),
            height: roundTextHighlightMetric(Number(node.height) || 0),
          };
        }
      }
    } catch (error) {}

    return null;
  }

  function getAbsoluteTransformMatrix(node) {
    if (node && Array.isArray(node.absoluteTransform) && node.absoluteTransform.length >= 2) {
      const row0 = Array.isArray(node.absoluteTransform[0]) ? node.absoluteTransform[0] : [];
      const row1 = Array.isArray(node.absoluteTransform[1]) ? node.absoluteTransform[1] : [];
      const a = Number(row0[0]);
      const c = Number(row0[1]);
      const e = Number(row0[2]);
      const b = Number(row1[0]);
      const d = Number(row1[1]);
      const f = Number(row1[2]);
      return [
        [Number.isFinite(a) ? a : 1, Number.isFinite(c) ? c : 0, Number.isFinite(e) ? e : 0],
        [Number.isFinite(b) ? b : 0, Number.isFinite(d) ? d : 1, Number.isFinite(f) ? f : 0],
      ];
    }

    if (node && "x" in node && typeof node.x === "number" && "y" in node && typeof node.y === "number") {
      return [
        [1, 0, Number(node.x) || 0],
        [0, 1, Number(node.y) || 0],
      ];
    }

    return createIdentityTransform();
  }

  function createIdentityTransform() {
    return [
      [1, 0, 0],
      [0, 1, 0],
    ];
  }

  function invertAffineTransform(matrix) {
    if (!Array.isArray(matrix) || matrix.length < 2) {
      return null;
    }

    const a = Number(matrix[0][0]) || 0;
    const c = Number(matrix[0][1]) || 0;
    const e = Number(matrix[0][2]) || 0;
    const b = Number(matrix[1][0]) || 0;
    const d = Number(matrix[1][1]) || 0;
    const f = Number(matrix[1][2]) || 0;
    const determinant = a * d - b * c;

    if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-8) {
      return null;
    }

    return [
      [d / determinant, -c / determinant, (c * f - d * e) / determinant],
      [-b / determinant, a / determinant, (b * e - a * f) / determinant],
    ];
  }

  function multiplyAffineTransforms(left, right) {
    return [
      [
        left[0][0] * right[0][0] + left[0][1] * right[1][0],
        left[0][0] * right[0][1] + left[0][1] * right[1][1],
        left[0][0] * right[0][2] + left[0][1] * right[1][2] + left[0][2],
      ],
      [
        left[1][0] * right[0][0] + left[1][1] * right[1][0],
        left[1][0] * right[0][1] + left[1][1] * right[1][1],
        left[1][0] * right[0][2] + left[1][1] * right[1][2] + left[1][2],
      ],
    ];
  }

  function transformPointWithMatrix(matrix, x, y) {
    return {
      x: matrix[0][0] * x + matrix[0][1] * y + matrix[0][2],
      y: matrix[1][0] * x + matrix[1][1] * y + matrix[1][2],
    };
  }

  function getTextHighlightLocalBounds(inverseTransform, worldBounds) {
    const corners = [
      transformPointWithMatrix(inverseTransform, worldBounds.x, worldBounds.y),
      transformPointWithMatrix(inverseTransform, worldBounds.x + worldBounds.width, worldBounds.y),
      transformPointWithMatrix(inverseTransform, worldBounds.x, worldBounds.y + worldBounds.height),
      transformPointWithMatrix(inverseTransform, worldBounds.x + worldBounds.width, worldBounds.y + worldBounds.height),
    ];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const point of corners) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      x: roundTextHighlightMetric(minX),
      y: roundTextHighlightMetric(minY),
      width: roundTextHighlightMetric(Math.max(1, maxX - minX)),
      height: roundTextHighlightMetric(Math.max(1, maxY - minY)),
    };
  }

  function getTextHighlightWorldBoundsFromLocalBounds(node, localBounds) {
    const bounds = normalizeTextHighlightWorldBounds(localBounds);
    if (!bounds) {
      return null;
    }

    const matrix = getAbsoluteTransformMatrix(node);
    const corners = [
      transformPointWithMatrix(matrix, bounds.x, bounds.y),
      transformPointWithMatrix(matrix, bounds.x + bounds.width, bounds.y),
      transformPointWithMatrix(matrix, bounds.x, bounds.y + bounds.height),
      transformPointWithMatrix(matrix, bounds.x + bounds.width, bounds.y + bounds.height),
    ];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const point of corners) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    if (!Number.isFinite(minX) || !Number.isFinite(minY) || maxX <= minX || maxY <= minY) {
      return null;
    }

    return {
      x: roundTextHighlightMetric(minX),
      y: roundTextHighlightMetric(minY),
      width: roundTextHighlightMetric(Math.max(1, maxX - minX)),
      height: roundTextHighlightMetric(Math.max(1, maxY - minY)),
    };
  }

  function roundTextHighlightMetric(value) {
    return Math.round((Number(value) || 0) * 1000) / 1000;
  }

  function ceilTextHighlightMetric(value) {
    return Math.max(1, Math.ceil(Number(value) || 0));
  }

  function roundTextHighlightThickness(value) {
    return Math.max(1, Math.round(Number(value) || 0));
  }

  function ceilTextHighlightThickness(value) {
    return Math.max(1, Math.ceil(Number(value) || 0));
  }

  function sanitizeHexColor(value, fallback) {
    const next = normalizeHexCandidate(value);
    if (next) {
      return next;
    }

    const fallbackValue = normalizeHexCandidate(fallback);
    return fallbackValue || AI_TEXT_HIGHLIGHT_DEFAULT_TEXT_COLOR;
  }

  function sanitizeTextHighlightRadius(value, fallback) {
    const next = parseTextHighlightRadius(value);
    if (typeof next === "number") {
      return next;
    }

    const fallbackValue = parseTextHighlightRadius(fallback);
    return typeof fallbackValue === "number" ? fallbackValue : AI_TEXT_HIGHLIGHT_DEFAULT_RADIUS;
  }

  function sanitizeTextHighlightDecorationScale(value, fallback) {
    const next = parseTextHighlightDecorationScale(value);
    if (typeof next === "number") {
      return next;
    }

    const fallbackValue = parseTextHighlightDecorationScale(fallback);
    return typeof fallbackValue === "number" ? fallbackValue : AI_TEXT_HIGHLIGHT_DEFAULT_DECORATION_SCALE;
  }

  function sanitizeTextHighlightBoxPaddingPx(value, fallback) {
    const numeric = parseFloat(typeof value === "number" ? String(value) : String(value || "").trim());
    if (isFinite(numeric)) {
      return roundTextHighlightMetric(Math.max(-999, Math.min(999, Math.round(numeric))));
    }

    const fallbackValue = parseFloat(typeof fallback === "number" ? String(fallback) : String(fallback || "").trim());
    if (isFinite(fallbackValue)) {
      return roundTextHighlightMetric(Math.max(-999, Math.min(999, Math.round(fallbackValue))));
    }

    return AI_TEXT_HIGHLIGHT_DEFAULT_BOX_PADDING_PX;
  }

  function parseTextHighlightRadius(value) {
    const raw = typeof value === "number" ? String(value) : String(value || "").trim();
    if (!raw) {
      return null;
    }

    const numeric = parseFloat(raw);
    if (!isFinite(numeric)) {
      return null;
    }

    return roundTextHighlightMetric(Math.max(0, Math.min(999, Math.round(numeric))));
  }

  function parseTextHighlightDecorationScale(value) {
    const raw = typeof value === "number" ? String(value) : String(value || "").trim();
    if (!raw) {
      return null;
    }

    const numeric = parseFloat(raw);
    if (!isFinite(numeric)) {
      return null;
    }

    return roundTextHighlightMetric(Math.max(1, Math.min(10, Math.round(numeric * 10) / 10)));
  }

  function normalizeHexCandidate(value) {
    const raw = String(value || "")
      .trim()
      .replace(/^#+/, "")
      .toUpperCase();

    if (/^[0-9A-F]{6}$/.test(raw)) {
      return `#${raw}`;
    }

    if (/^[0-9A-F]{3}$/.test(raw)) {
      return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`;
    }

    return "";
  }

  function hexToFigmaRgb(value) {
    const hex = sanitizeHexColor(value, AI_TEXT_HIGHLIGHT_DEFAULT_TEXT_COLOR);
    return {
      r: parseInt(hex.slice(1, 3), 16) / 255,
      g: parseInt(hex.slice(3, 5), 16) / 255,
      b: parseInt(hex.slice(5, 7), 16) / 255,
    };
  }

  function rgbToHex(color) {
    if (!color || typeof color !== "object") {
      return "";
    }

    const red = Math.max(0, Math.min(255, Math.round((Number(color.r) || 0) * 255)));
    const green = Math.max(0, Math.min(255, Math.round((Number(color.g) || 0) * 255)));
    const blue = Math.max(0, Math.min(255, Math.round((Number(color.b) || 0) * 255)));

    return `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue
      .toString(16)
      .padStart(2, "0")}`.toUpperCase();
  }

  function extractVisibleSolidPaintHex(paints) {
    if (!Array.isArray(paints)) {
      return "";
    }

    for (const paint of paints) {
      if (!paint || paint.type !== "SOLID" || paint.visible === false || !paint.color) {
        continue;
      }

      const opacity = typeof paint.opacity === "number" ? paint.opacity : 1;
      if (!Number.isFinite(opacity) || opacity <= 0) {
        continue;
      }

      const hex = rgbToHex(paint.color);
      if (hex) {
        return hex;
      }
    }

    return "";
  }

  function createSolidPaint(hexColor) {
    return {
      type: "SOLID",
      visible: true,
      opacity: 1,
      blendMode: "NORMAL",
      color: hexToFigmaRgb(hexColor),
    };
  }

  function createTransparentPaint() {
    return {
      type: "SOLID",
      visible: true,
      opacity: 0,
      blendMode: "NORMAL",
      color: { r: 0, g: 0, b: 0 },
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

  function getAiHelper() {
    const helper = globalScope.__PIGMA_AI_LLM__;
    return helper && typeof helper.requestJsonTask === "function" && typeof helper.hasConfiguredAiAsync === "function"
      ? helper
      : null;
  }
})();
