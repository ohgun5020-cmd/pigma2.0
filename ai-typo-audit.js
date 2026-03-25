;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_TYPO_AUDIT_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_DESIGN_READ_CACHE_KEY = "pigma:ai-design-read-cache:v1";
  const AI_TYPO_AUDIT_CACHE_KEY = "pigma:ai-typo-audit-cache:v1";
  const AI_TYPO_FIX_CACHE_KEY = "pigma:ai-typo-fix-cache:v1";
  const AI_TYPO_CLEAR_CACHE_KEY = "pigma:ai-typo-clear-cache:v1";
  const PATCH_VERSION = 6;
  const TYPO_AUDIT_MODEL_BY_PROVIDER = Object.freeze({
    openai: "gpt-5-mini",
    gemini: "gemini-2.5-pro",
  });
  const ANNOTATION_PREFIX = "[Ai 판단]";
  const LEGACY_ANNOTATION_PREFIXES = ["[AI Typo]", ANNOTATION_PREFIX, "[Pigma Ai Audit]"];
  const ANNOTATION_CATEGORY_LABEL = "Pigma Ai Audit";
  const ANNOTATION_CATEGORY_COLOR = "yellow";
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

      if (message.type === "run-ai-typo-fix") {
        await runTypoFix();
        return;
      }

      if (message.type === "run-ai-typo-clear") {
        await runTypoClear();
        return;
      }

      await runTypoAudit();
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
        message.type === "run-ai-typo-clear")
    );
  }

  async function runTypoAudit() {
    postStatus("running", "오타 후보를 찾고 Dev Mode 주석 또는 결과 패널로 정리하는 중입니다.");

    try {
      const designReadResult = await readDesignReadCache();
      const result = await applyTypoAudit(designReadResult);
      await writeTypoAuditCache(result);

      figma.ui.postMessage({
        type: "ai-typo-audit-result",
        result,
        matchesCurrentSelection: true,
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
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function runTypoFix() {
    postFixStatus("running", "오타 후보를 찾아 현재 선택의 텍스트를 직접 수정하고, 고친 부분에는 주석을 남기는 중입니다.");

    try {
      const designReadResult = await readDesignReadCache();
      const result = await applyTypoFix(designReadResult);
      await writeTypoFixCache(result);

      figma.ui.postMessage({
        type: "ai-typo-fix-result",
        result,
        matchesCurrentSelection: true,
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
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function runTypoClear() {
    postClearStatus("running", "현재 선택 범위에 남아 있는 AI 오타 주석을 정리하는 중입니다.");

    try {
      const designReadResult = await readDesignReadCache();
      const result = await clearManagedTypoAnnotations(designReadResult);
      await writeTypoClearCache(result);

      figma.ui.postMessage({
        type: "ai-typo-clear-result",
        result,
        matchesCurrentSelection: true,
      });

      figma.notify(`오타 주석 정리 완료 (${result.summary.removedAnnotationCount || 0}건 제거)`, {
        timeout: 2200,
      });
    } catch (error) {
      const message = normalizeErrorMessage(error, "오타 주석 정리에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-typo-clear-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
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

  function matchesCurrentSelection(result) {
    return !!result && result.selectionSignature === getSelectionSignature(figma.currentPage.selection);
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

    if (isSpacingOrPunctuationOnlyCorrection(currentValue, suggestionValue)) {
      return true;
    }

    const currentFamilies = getActiveScriptFamilies(currentValue);
    const suggestionFamilies = getActiveScriptFamilies(suggestionValue);
    if (!areScriptFamiliesCompatible(currentFamilies, suggestionFamilies)) {
      return false;
    }

    return tokensLookLikeMinorCorrections(currentValue, suggestionValue, kindLabels);
  }

  function isSpacingOrPunctuationOnlyCorrection(currentText, suggestion) {
    const currentTokens = tokenizeScriptTokens(currentText);
    const suggestionTokens = tokenizeScriptTokens(suggestion);
    if (!currentTokens.length || !suggestionTokens.length) {
      return false;
    }

    return flattenComparableTokens(currentTokens) === flattenComparableTokens(suggestionTokens);
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

  async function applyTypoAudit(designReadResult) {
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
    const issues = issueResult.issues.slice(0, 24);
    const annotationSupported = supportsAnnotations(textNodes);
    const category = annotationSupported ? await ensureAnnotationCategory(getManagedAnnotationCategoryColor()) : null;
    const applied = annotationSupported
      ? applyAnnotations(textNodes, issues, category)
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
    const insights = buildInsights(context, textNodes, issues, applied, annotationSupported, issueResult.aiMeta);

    return {
      version: PATCH_VERSION,
      source: issueResult.strategy === "ai-primary" ? "ai-primary-annotation" : "local-fallback-annotation",
      mode: annotationSupported ? "figma-dev-annotation" : "result-only",
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
        mode: annotationSupported ? "figma-dev-annotation" : "result-only",
        modeLabel: annotationSupported ? "Figma Dev Mode 주석" : "결과 패널만",
        reviewStrategy: issueResult.strategy === "ai-primary" ? "AI 우선 + 로컬 보완" : "로컬 fallback",
        aiStatusLabel: issueResult.aiMeta ? issueResult.aiMeta.statusLabel : "AI 상태 미확인",
        aiProviderLabel: issueResult.aiMeta ? issueResult.aiMeta.providerLabel : "",
        aiModelLabel: issueResult.aiMeta ? issueResult.aiMeta.modelLabel : "",
        categoryLabel:
          annotationSupported && category && category.label ? category.label : annotationSupported ? ANNOTATION_CATEGORY_LABEL : "결과 패널만",
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
    const annotationSupported = supportsAnnotations(textNodes);
    const category = annotationSupported ? await ensureAnnotationCategory(getManagedAnnotationCategoryColor()) : null;
    const annotationApplied = annotationSupported
      ? applyAnnotations(textNodes, applied.annotationIssues, category)
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
    const insights = buildFixInsights(context, textNodes, issueResult.issues, applied, annotationApplied, issueResult.aiMeta);

    return {
      version: PATCH_VERSION,
      source: issueResult.strategy === "ai-primary" ? "ai-primary-direct-fix-annotation" : "local-fallback-direct-fix-annotation",
      mode: annotationSupported ? "direct-text-edit-with-annotation" : "direct-text-edit",
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
        mode: annotationSupported ? "direct-text-edit-with-annotation" : "direct-text-edit",
        modeLabel: annotationSupported ? "직접 수정 + Dev Mode 주석" : "직접 수정",
        reviewStrategy: issueResult.strategy === "ai-primary" ? "AI 우선 + 로컬 보완" : "로컬 fallback",
        aiStatusLabel: issueResult.aiMeta ? issueResult.aiMeta.statusLabel : "AI 상태 미확인",
        aiProviderLabel: issueResult.aiMeta ? issueResult.aiMeta.providerLabel : "",
        aiModelLabel: issueResult.aiMeta ? issueResult.aiMeta.modelLabel : "",
        categoryLabel: annotationSupported ? "직접 수정 후 Dev Mode 주석" : "직접 수정",
      },
      issues,
      applied: applied.applied.slice(0, 12),
      annotations: annotationApplied.applied.slice(0, 12),
      skipped: skipped.slice(0, 8),
      insights: insights.slice(0, 6),
    };
  }

  async function clearManagedTypoAnnotations(designReadResult) {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const proofingSettings = await readProofingSettings();
    const context = buildSelectionContext(selection, designReadResult, proofingSettings);
    const textNodes = collectTextNodes(selection, { includeHidden: true, includeLocked: true });
    const annotationSupported = supportsAnnotations(textNodes);
    const category = annotationSupported ? await ensureAnnotationCategory(getManagedAnnotationCategoryColor()) : null;
    const applied = annotationSupported
      ? applyAnnotations(textNodes, [], category)
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
    const sampleNode = Array.isArray(textNodes) && textNodes.length > 0 ? textNodes[0] : null;
    return !!sampleNode && "annotations" in sampleNode;
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
    let annotatedNodeCount = 0;
    let annotationCount = 0;
    let clearedNodeCount = 0;
    let removedAnnotationCount = 0;

    for (const issue of issues) {
      for (const fragment of getIssueAnnotationFragments(issue)) {
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
      await figma.loadFontAsync(fontName);
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

  async function buildTypoIssues(textNodes, context, proofingSettings) {
    const issues = [];
    const seen = new Set();
    let aiError = "";
    const aiPromise = requestAiTypoIssues(textNodes, context, proofingSettings);
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

    const aiResult = await aiPromise;
    aiResult.issues = filterIssuesForProofing(aiResult.issues, proofingSettings);
    aiError = aiResult.aiError || "";
    const useAiPrimary = Array.isArray(aiResult.issues) && aiResult.issues.length > 0;
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
      strategy: useAiPrimary ? "ai-primary" : "local-fallback",
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
      "You review UI copy inside a Figma plugin. Detect only obvious spelling mistakes, broken words, malformed polite endings, spacing errors, punctuation errors, and clearly broken grammar. Be conservative: if a word is already a valid standard word in its language, keep it unless the surrounding sentence is clearly wrong with that exact word. Never replace one valid word with another valid word just because the spellings are similar. Example: keep 'optimal motion' unchanged and never change it to 'optional motion'. Preserve the original language, script, wording, product naming, and marketing intent of each string. Do not translate, localize, rewrite into the dominant language of the screen, unify terminology, smooth tone, or replace brand/product names unless the product name itself has an obvious typo. In mixed-language strings, preserve every language segment as-is and only fix the clearly broken part inside that same language segment. Some textNodes are full node strings, while others are single extracted lines from a multiline node. If an item is a single extracted line, return a corrected single line only and do not rewrite neighboring lines. If preferredLocaleHint is provided, use it only for Latin-script nodes or segments that actually fit that locale. Do not suppress Korean, English, or other script corrections just because another preferred locale is set. If latinLocaleHint is provided, keep corrections inside that locale only for matching Latin-script segments. Example: German copy with an English brand should stay mixed as needed: 'Find e deine perfekte Work-Life-Balanfce mit LG' -> 'Finde deine perfekte Work-Life-Balance mit LG', 'Jedtazt kaufenq' -> 'Jetzt kaufen', while keeping 'LG' untouched. Return the full corrected string in suggestion for the given item, never only a changed token. If the original text contains multiple lines, preserve every line and keep the same line count unless the user text itself clearly intends a merge. Never drop unrelated lower lines. Never edit any protectedTerms under any circumstances. Never mark userDictionary terms as mistakes. Example: '방갑스비난.' should be corrected to the full string '반갑습니다.' If the text looks fine, omit it. Return concise reasons in Korean when possible.";
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
          "You review UI copy inside a Figma plugin. Detect only obvious spelling mistakes, broken words, malformed polite endings, spacing errors, punctuation errors, and clearly broken grammar. Preserve the original language, script, wording, and product naming of each string. Do not translate, localize, rewrite into the dominant language of the screen, unify terminology, smooth tone, or replace brand/product names unless the product name itself has an obvious typo. In mixed-language strings, preserve every language segment as-is and only fix the clearly broken part inside that same language segment. If preferredLocaleHint is provided, treat it as the primary locale/country hint. If latinLocaleHint is provided, keep corrections inside that locale. Example: German copy with an English brand should stay mixed as needed: 'Find e deine perfekte Work-Life-Balanfce mit LG' -> 'Finde deine perfekte Work-Life-Balance mit LG', 'Jedtazt kaufenq' -> 'Jetzt kaufen', while keeping 'LG' untouched. Return the full corrected string in suggestion, never only a changed token. If the original text contains multiple lines, preserve every line and keep the same line count unless the user text itself clearly intends a merge. Never drop unrelated lower lines. Never edit any protectedTerms under any circumstances. Never mark userDictionary terms as mistakes. Example: '방갑스비난.' should be corrected to the full string '반갑습니다.' If the text looks fine, omit it. Return concise reasons in Korean when possible.",
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

  function buildInsights(context, textNodes, issues, applied, annotationSupported, aiMeta) {
    const insights = [
      `맥락 기준: ${context.contextLabel}`,
      `언어 기준: ${context.languageHintLabel || context.detectedLanguageLabel || context.languageLabel || "자동 감지"}`,
      `텍스트 레이어 ${textNodes.length}개 검사`,
      annotationSupported ? `주석 ${applied.annotationCount}건 적용` : "주석 대신 결과 패널에만 표시",
    ];

    if (aiMeta && aiMeta.statusLabel) {
      insights.push(`AI 상태: ${aiMeta.statusLabel}${aiMeta.providerLabel ? ` · ${aiMeta.providerLabel}` : ""}`);
    }

    if (issues.length === 0) {
      insights.push(
        annotationSupported
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
    } else if (annotationSupported) {
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
