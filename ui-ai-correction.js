(() => {
  if (window.__PIGMA_AI_LLM_UI_BRIDGE__) {
    return;
  }

  window.__PIGMA_AI_LLM_UI_BRIDGE__ = true;

  window.addEventListener("message", async (event) => {
    const message = event.data?.pluginMessage;
    if (!message || message.type !== "ai-llm-ui-request" || typeof message.requestId !== "string") {
      return;
    }

    try {
      const result = await runAiUiBridgeRequest(message.payload);
      parent.postMessage(
        {
          pluginMessage: {
            type: "ai-llm-ui-response",
            requestId: message.requestId,
            ok: true,
            result,
          },
        },
        "*"
      );
    } catch (error) {
      parent.postMessage(
        {
          pluginMessage: {
            type: "ai-llm-ui-response",
            requestId: message.requestId,
            ok: false,
            error: normalizeUiBridgeError(error, "UI AI bridge 요청에 실패했습니다."),
          },
        },
        "*"
      );
    }
  });

  async function runAiUiBridgeRequest(payload) {
    const request = payload && typeof payload === "object" ? payload : {};
    const provider = request.provider === "gemini" ? "gemini" : "openai";
    const model = typeof request.model === "string" && request.model ? request.model : provider === "gemini" ? "gemini-2.5-flash" : "gpt-4o-mini";
    const apiKey = sanitizeUiBridgeValue(request.apiKey);
    const prompt = typeof request.prompt === "string" ? request.prompt : "";

    if (!apiKey) {
      throw new Error("API 키가 비어 있습니다.");
    }

    if (!prompt) {
      throw new Error("AI 프롬프트가 비어 있습니다.");
    }

    return provider === "gemini"
      ? await callGeminiFromUi(model, apiKey, prompt)
      : await callOpenAiFromUi(model, apiKey, prompt);
  }

  async function callOpenAiFromUi(model, apiKey, prompt) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are an assistant inside a Figma plugin. Return concise structured JSON only, following the requested shape.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(await buildUiBridgeHttpError("OpenAI", response));
    }

    const data = await response.json();
    const text = getOpenAiUiText(data);
    return parseUiBridgeJson(text);
  }

  async function callGeminiFromUi(model, apiKey, prompt) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(await buildUiBridgeHttpError("Gemini", response));
    }

    const data = await response.json();
    const text = getGeminiUiText(data);
    return parseUiBridgeJson(text);
  }

  async function buildUiBridgeHttpError(provider, response) {
    let detail = "";
    try {
      detail = await response.text();
    } catch (error) {
      detail = "";
    }

    const compact = String(detail || "").replace(/\s+/g, " ").trim();
    return `${provider} API 오류 (${response.status})${compact ? `: ${compact.slice(0, 220)}` : ""}`;
  }

  function getOpenAiUiText(data) {
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

  function getGeminiUiText(data) {
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

  function parseUiBridgeJson(text) {
    const normalized = String(text || "").trim();
    if (!normalized) {
      throw new Error("AI 응답이 비어 있습니다.");
    }

    try {
      return JSON.parse(normalized);
    } catch (error) {}

    const fenceMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch && fenceMatch[1]) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch (error) {}
    }

    const start = normalized.indexOf("{");
    const end = normalized.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(normalized.slice(start, end + 1));
      } catch (error) {}
    }

    throw new Error("AI JSON 응답을 해석하지 못했습니다.");
  }

  function sanitizeUiBridgeValue(value) {
    return String(value || "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, "")
      .replace(/^['"`]+|['"`]+$/g, "")
      .replace(/[^\x21-\x7E]/g, "")
      .trim();
  }

  function normalizeUiBridgeError(error, fallback) {
    if (error && typeof error === "object" && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }

    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }

    return fallback;
  }
})();

(() => {
  if (window.__PIGMA_AI_CORRECTION__) {
    return;
  }

  {
    const root = document.documentElement;
    const tabs = document.querySelector(".tabs");
    const aiTab = document.getElementById("tabAi");
    const aiView = document.getElementById("viewAi");
    const views = Array.from(document.querySelectorAll(".view"));
    const postPluginMessage = (message) => {
      parent.postMessage({ pluginMessage: message }, "*");
    };
    const aiActionDescriptions = {
      aiReadDesignButton: {
        title: "명도 대비, 폰트 크기, 터치 영역을 기준으로 현재 선택의 웹 접근성을 진단합니다.",
        ariaLabel: "웹 접근성 진단. 명도 대비, 폰트 크기, 터치 영역을 기준으로 현재 선택의 웹 접근성을 진단합니다.",
      },
      aiDesignConsistencyButton: {
        title: "선택 화면의 색상, 타이포그래피, 여백과 제목·반복 블록·폼 규칙을 기준으로 디자인 일관성을 진단합니다.",
        ariaLabel: "디자인 일관성. 색상, 타이포그래피, 여백과 제목, 반복 블록, 폼 규칙을 기준으로 현재 선택의 일관성을 진단합니다.",
      },
      aiDesignConsistencyClearButton: {
        title: "현재 선택 범위에 남아 있는 웹 접근성 진단과 디자인 일관성 Dev Mode 주석을 함께 정리합니다.",
        ariaLabel: "디자인 진단 주석 삭제. 현재 선택 범위에 남아 있는 웹 접근성 진단과 디자인 일관성 Dev Mode 주석을 함께 정리합니다.",
      },
      aiRegroupRenameButton: {
        title: "맥락을 이해하고 웹용 구조 기준으로 그룹과 이름을 수정합니다.",
        ariaLabel: "그룹과 이름 수정 웹용. 맥락을 이해하고 웹용 구조 기준으로 그룹과 이름을 수정합니다.",
      },
      aiRegroupRenameHybridButton: {
        title: "맥락을 이해하고 디자인용 구조 기준으로 그룹과 이름을 수정합니다.",
        ariaLabel: "그룹과 이름 수정 디자인용. 맥락을 이해하고 디자인용 구조 기준으로 그룹과 이름을 수정합니다.",
      },
      aiTypoAuditButton: {
        title: "맥락을 이해하고 오타 후보를 직접 수정하지 않고 Figma Dev Mode 주석 또는 결과 패널로 남깁니다.",
        ariaLabel: "오타 검수. 맥락을 이해하고 오타 후보를 직접 수정하지 않고 Figma Dev Mode 주석 또는 결과 패널로 남깁니다.",
      },
      aiTypoFixButton: {
        title: "맥락을 이해하고 오타 후보를 찾아 현재 선택의 텍스트를 직접 수정하고, 고친 부분에는 주석을 남깁니다.",
        ariaLabel: "오타 자동 수정. 맥락을 이해하고 오타 후보를 찾아 현재 선택의 텍스트를 직접 수정하고, 고친 부분에는 주석을 남깁니다.",
      },
      aiPixelPerfectButton: {
        title: "레이어와 각종 수치 데이터의 소수점 보정 대상을 AI로 판독해 정수 스냅으로 교정합니다.",
        ariaLabel: "픽셀 교정. 레이어와 각종 수치 데이터의 소수점 보정 대상을 AI로 판독해 정수 스냅으로 교정합니다.",
      },
      aiDeleteHiddenLayersButton: {
        title: "현재 선택 내부의 숨겨진 레이어를 정리하기 위한 준비 단계입니다.",
        ariaLabel: "숨겨진 레이어 삭제. 현재 선택 내부의 숨겨진 레이어를 정리하기 위한 준비 단계입니다.",
      },
    };
    const AI_READ_SUMMARY_OPEN_KEY = "pigma:ai-read-summary-open:v1";
    const elements = {
      summaryPanel: document.getElementById("aiReadSummaryPanel"),
      panelTitle: document.getElementById("aiReadPanelTitle"),
      panelCopy: document.getElementById("aiReadPanelCopy"),
      statusPill: document.getElementById("aiReadStatusPill"),
      analyzedAt: document.getElementById("aiReadAnalyzedAt"),
      selectionSummary: document.getElementById("aiReadSelectionSummary"),
      selectionNote: document.getElementById("aiReadSelectionNote"),
      rootCount: document.getElementById("aiReadRootCount"),
      layerCount: document.getElementById("aiReadLayerCount"),
      textCount: document.getElementById("aiReadTextCount"),
      fractionalCount: document.getElementById("aiReadFractionalCount"),
      languageValue: document.getElementById("aiReadLanguageValue"),
      contextValue: document.getElementById("aiReadContextValue"),
      layerBreakdownValue: document.getElementById("aiReadLayerBreakdownValue"),
      namingValue: document.getElementById("aiReadNamingValue"),
      pixelValue: document.getElementById("aiReadPixelValue"),
      styleValue: document.getElementById("aiReadStyleValue"),
      insightMeta: document.getElementById("aiReadInsightMeta"),
      insightList: document.getElementById("aiReadInsightList"),
      readButton: document.getElementById("aiReadDesignButton"),
      consistencyButton: document.getElementById("aiDesignConsistencyButton"),
    };

    if (
      !(tabs instanceof HTMLElement) ||
      !(aiTab instanceof HTMLElement) ||
      !(aiView instanceof HTMLElement) ||
      !(elements.summaryPanel instanceof HTMLDetailsElement) ||
      !(elements.panelTitle instanceof HTMLElement) ||
      !(elements.panelCopy instanceof HTMLElement) ||
      !(elements.statusPill instanceof HTMLElement) ||
      !(elements.analyzedAt instanceof HTMLElement) ||
      !(elements.selectionSummary instanceof HTMLElement) ||
      !(elements.selectionNote instanceof HTMLElement) ||
      !(elements.rootCount instanceof HTMLElement) ||
      !(elements.layerCount instanceof HTMLElement) ||
      !(elements.textCount instanceof HTMLElement) ||
      !(elements.fractionalCount instanceof HTMLElement) ||
      !(elements.languageValue instanceof HTMLElement) ||
      !(elements.contextValue instanceof HTMLElement) ||
      !(elements.layerBreakdownValue instanceof HTMLElement) ||
      !(elements.namingValue instanceof HTMLElement) ||
      !(elements.pixelValue instanceof HTMLElement) ||
      !(elements.styleValue instanceof HTMLElement) ||
      !(elements.insightMeta instanceof HTMLElement) ||
      !(elements.insightList instanceof HTMLElement) ||
      !(elements.readButton instanceof HTMLButtonElement)
    ) {
      return;
    }

    let isSyncing = false;
    let isReadingDesign = false;
    let activeApplyIssueId = "";
    let lastRenderedResult = null;

    const syncAiActionDescriptions = () => {
      Object.entries(aiActionDescriptions).forEach(([id, metadata]) => {
        const button = document.getElementById(id);
        if (!(button instanceof HTMLElement)) {
          return;
        }

        button.title = metadata.title;
        button.setAttribute("aria-label", metadata.ariaLabel);
      });
    };

    const syncAiState = () => {
      if (isSyncing) {
        return;
      }

      isSyncing = true;
      const active = root.dataset.aiCorrectionTab === "active";

      views.forEach((view) => {
        if (!(view instanceof HTMLElement)) {
          return;
        }

        if (!active) {
          view.style.removeProperty("display");
          return;
        }

        view.style.setProperty("display", view === aiView ? "block" : "none", "important");
      });

      aiView.hidden = !active;
      aiView.classList.toggle("is-active", active);
      aiTab.classList.toggle("is-active", active);
      aiTab.setAttribute("aria-selected", active ? "true" : "false");
      aiTab.tabIndex = active ? 0 : -1;
      isSyncing = false;
    };

    const requestCachedDesignRead = () => {
      postPluginMessage({ type: "request-ai-design-read-cache" });
    };

    const activateAiTab = () => {
      root.dataset.aiCorrectionTab = "active";
      syncAiState();
      requestCachedDesignRead();
    };

    const deactivateAiTab = () => {
      delete root.dataset.aiCorrectionTab;
      syncAiState();
    };

    const handleAiTabClick = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      activateAiTab();
    };

    const readStoredSummaryPanelState = () => {
      try {
        return window.localStorage.getItem(AI_READ_SUMMARY_OPEN_KEY) === "true";
      } catch (error) {
        return false;
      }
    };

    const persistSummaryPanelState = () => {
      try {
        window.localStorage.setItem(AI_READ_SUMMARY_OPEN_KEY, elements.summaryPanel.open ? "true" : "false");
      } catch (error) {}
    };

    const syncIssueButtonsBusyState = () => {
      elements.insightList.querySelectorAll("[data-issue-id]").forEach((button) => {
        if (!(button instanceof HTMLButtonElement)) {
          return;
        }

        const issueId = button.dataset.issueId || "";
        const busy = !!issueId && issueId === activeApplyIssueId;
        button.disabled = isReadingDesign;
        button.textContent = busy ? "적용 중..." : button.dataset.defaultLabel || "제안 적용";
        button.setAttribute("aria-busy", busy ? "true" : "false");
      });
    };

    const setReadButtonBusy = (busy) => {
      isReadingDesign = busy;
      elements.readButton.disabled = busy;
      elements.readButton.textContent = busy ? "웹 접근성 진단 중..." : "웹 접근성 진단";
      elements.readButton.setAttribute("aria-busy", busy ? "true" : "false");
      syncIssueButtonsBusyState();
    };

    const setIssueApplyBusy = (issueId) => {
      activeApplyIssueId = typeof issueId === "string" ? issueId : "";
      syncIssueButtonsBusyState();
    };

    const setStatus = (tone, label) => {
      elements.statusPill.dataset.tone = tone;
      elements.statusPill.textContent = label;
      elements.statusPill.classList.toggle("active", tone === "ready" || tone === "running");
    };

    const fillMetric = (element, value) => {
      element.textContent = String(value);
    };

    const formatAnalyzedAt = (isoString) => {
      if (typeof isoString !== "string" || !isoString) {
        return "마지막 진단 없음";
      }

      const date = new Date(isoString);
      if (!Number.isFinite(date.getTime())) {
        return "마지막 진단 없음";
      }

      return `마지막 진단 ${date.toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    };

    const formatBounds = (bounds) => {
      if (!bounds || typeof bounds.width !== "number" || typeof bounds.height !== "number") {
        return "범위 미감지";
      }

      return `${bounds.width} x ${bounds.height}px`;
    };

    const formatRatio = (value) => {
      return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(2)}:1` : "";
    };

    const formatContrastSummary = (accessibility) => {
      if (!accessibility || !accessibility.contrastIssueCount) {
        return "문제 없음";
      }

      const parts = [];
      if (accessibility.bodyTextContrastIssueCount > 0) {
        parts.push(`본문 ${accessibility.bodyTextContrastIssueCount}건`);
      }
      if (accessibility.actionTextContrastIssueCount > 0) {
        parts.push(`버튼 ${accessibility.actionTextContrastIssueCount}건`);
      }
      if (accessibility.largeTextContrastIssueCount > 0) {
        parts.push(`큰 텍스트 ${accessibility.largeTextContrastIssueCount}건`);
      }
      const minimum = formatRatio(accessibility.minimumContrastRatio);
      if (parts.length && minimum) {
        return `문제 ${accessibility.contrastIssueCount}건 · ${parts.join(" · ")} · 최저 ${minimum}`;
      }
      if (parts.length) {
        return `문제 ${accessibility.contrastIssueCount}건 · ${parts.join(" · ")}`;
      }
      return minimum ? `문제 ${accessibility.contrastIssueCount}건 · 최저 ${minimum}` : `문제 ${accessibility.contrastIssueCount}건`;
    };

    const formatFontSummary = (accessibility) => {
      if (!accessibility || !accessibility.fontSizeIssueCount) {
        return "문제 없음";
      }

      const smallest = typeof accessibility.smallestFontSize === "number" ? `${accessibility.smallestFontSize}px 최저` : "";
      return smallest ? `문제 ${accessibility.fontSizeIssueCount}건 · ${smallest}` : `문제 ${accessibility.fontSizeIssueCount}건`;
    };

    const formatTapSummary = (accessibility) => {
      if (!accessibility || !accessibility.tapTargetIssueCount) {
        return "문제 없음";
      }

      return accessibility.smallestTapTargetLabel
        ? `문제 ${accessibility.tapTargetIssueCount}건 · ${accessibility.smallestTapTargetLabel}`
        : `문제 ${accessibility.tapTargetIssueCount}건`;
    };

    const formatAiStatus = (result) => {
      const summary = result && result.summary ? result.summary : {};
      if (summary.aiProviderLabel && summary.aiModelLabel) {
        return `${summary.aiProviderLabel} · ${summary.aiModelLabel}`;
      }

      if (summary.aiStatusLabel) {
        return summary.aiStatusLabel;
      }

      return result && result.source === "local-heuristic" ? "로컬 휴리스틱" : "AI + 로컬";
    };

    const formatIssuePriority = (issue) => {
      const severityMap = {
        error: "상",
        warning: "중",
        info: "하",
      };
      return severityMap[issue && issue.severity ? issue.severity : "info"] || "하";
    };

    const formatIssueMeta = (issue) => {
      const parts = [`중요도 ${formatIssuePriority(issue)}`];
      if (issue && typeof issue.wcag === "string" && issue.wcag.trim()) {
        parts.push(issue.wcag.trim());
      }
      return parts.join(" · ");
    };

    const appendIssuePlaceholder = (titleText, detailText) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const detail = document.createElement("span");
      title.className = "list-title";
      detail.className = "list-detail";
      title.textContent = titleText;
      detail.textContent = detailText;
      item.append(title, detail);
      elements.insightList.append(item);
    };

    const renderIssueList = (result) => {
      elements.insightList.replaceChildren();

      const issues =
        result && result.accessibility && Array.isArray(result.accessibility.issues)
          ? result.accessibility.issues.filter(Boolean).slice(0, 8)
          : [];

      if (!issues.length) {
        appendIssuePlaceholder("즉시 수정 제안 없음", "현재 선택에서 바로 적용할 수 있는 접근성 이슈를 찾지 못했습니다.");
        syncIssueButtonsBusyState();
        return;
      }

      issues.forEach((issue) => {
        const item = document.createElement("li");
        const copy = document.createElement("div");
        const meta = document.createElement("span");
        const title = document.createElement("strong");
        const detail = document.createElement("p");

        item.className = "ai-read-issue-item";
        item.dataset.severity = issue.severity || "info";

        copy.className = "ai-read-issue-copy";
        meta.className = "list-meta";
        meta.textContent = formatIssueMeta(issue);
        title.className = "list-title";
        title.textContent = `${issue.nodeName || "레이어"} · ${issue.summary || "접근성 이슈"}`;
        detail.className = "ai-read-issue-detail";
        detail.textContent = issue.detail || "세부 정보를 확인할 수 없습니다.";

        copy.append(meta, title, detail);

        if (typeof issue.suggestion === "string" && issue.suggestion.trim()) {
          const suggestion = document.createElement("p");
          suggestion.className = "ai-read-issue-suggestion";
          suggestion.textContent = issue.suggestion.trim();
          copy.append(suggestion);
        }

        item.append(copy);

        if (issue.canApply) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "button-secondary ai-read-apply-button";
          button.dataset.issueId = issue.id || "";
          button.dataset.defaultLabel = issue.applyLabel || "제안 적용";
          button.textContent = issue.applyLabel || "제안 적용";
          item.append(button);
        }

        elements.insightList.append(item);
      });

      syncIssueButtonsBusyState();
    };

    const renderEmptyState = () => {
      lastRenderedResult = null;
      setReadButtonBusy(false);
      setIssueApplyBusy("");
      setStatus("idle", "대기");
      elements.panelTitle.textContent = "웹 접근성 진단 준비";
      elements.panelCopy.textContent = "진단 결과와 즉시 적용 가능한 접근성 수정안을 여기에 표시합니다.";
      elements.analyzedAt.textContent = "마지막 진단 없음";
      elements.selectionSummary.textContent = "프레임, 그룹, 레이어를 선택한 뒤 실행하세요.";
      elements.selectionNote.textContent =
        "명도 대비, 폰트 크기, 터치 영역을 기준으로 문제를 찾고 초록색 주석과 즉시 적용 버튼을 함께 제공합니다.";
      fillMetric(elements.rootCount, 0);
      fillMetric(elements.layerCount, 0);
      fillMetric(elements.textCount, 0);
      fillMetric(elements.fractionalCount, 0);
      elements.languageValue.textContent = "WCAG 대기";
      elements.contextValue.textContent = "맥락 대기";
      elements.layerBreakdownValue.textContent = "대비 대기";
      elements.namingValue.textContent = "폰트 대기";
      elements.pixelValue.textContent = "터치 영역 대기";
      elements.styleValue.textContent = "진단 대기";
      elements.insightMeta.textContent = "진단 대기";
      renderIssueList(null);
    };

    const renderErrorState = (message) => {
      setReadButtonBusy(false);
      setIssueApplyBusy("");
      setStatus("error", "오류");
      elements.panelTitle.textContent = "웹 접근성 진단 실패";
      elements.panelCopy.textContent = message || "웹 접근성 진단에 실패했습니다.";
      elements.selectionSummary.textContent = message || "선택을 확인한 뒤 다시 시도하세요.";
      elements.selectionNote.textContent = "선택된 레이어가 없거나 읽을 수 없는 경우 이 안내가 표시됩니다.";

      if (!lastRenderedResult) {
        fillMetric(elements.rootCount, 0);
        fillMetric(elements.layerCount, 0);
        fillMetric(elements.textCount, 0);
        fillMetric(elements.fractionalCount, 0);
        elements.languageValue.textContent = "재시도 필요";
        elements.contextValue.textContent = "재시도 필요";
        elements.layerBreakdownValue.textContent = "재시도 필요";
        elements.namingValue.textContent = "재시도 필요";
        elements.pixelValue.textContent = "재시도 필요";
        elements.styleValue.textContent = "재시도 필요";
        elements.insightMeta.textContent = "재시도 필요";
        elements.insightList.replaceChildren();
        appendIssuePlaceholder("다시 진단해 주세요", "선택을 다시 확인하고 웹 접근성 진단 버튼을 한 번 더 눌러주세요.");
      }
    };

    const renderResult = (result, matchesCurrentSelection) => {
      if (!result || typeof result !== "object") {
        renderEmptyState();
        return;
      }

      lastRenderedResult = result;
      setReadButtonBusy(false);
      setIssueApplyBusy("");

      const summary = result.summary || {};
      const stats = result.stats || {};
      const accessibility = result.accessibility || {};
      const issueCount = accessibility.issueCount || 0;
      const fixableCount = accessibility.fixableCount || 0;
      const annotationCount =
        accessibility.annotations && typeof accessibility.annotations.annotationCount === "number"
          ? accessibility.annotations.annotationCount
          : 0;
      const statusLabel = matchesCurrentSelection ? (issueCount > 0 ? "완료" : "통과") : "캐시";

      setStatus(matchesCurrentSelection ? "ready" : "stale", statusLabel);
      elements.panelTitle.textContent = matchesCurrentSelection
        ? issueCount > 0
          ? "웹 접근성 진단 완료"
          : "웹 접근성 기준 통과"
        : "최근 진단 불러옴";
      elements.panelCopy.textContent = issueCount
        ? `문제 ${issueCount}건을 찾았고, ${fixableCount}건은 버튼에서 바로 적용할 수 있습니다.`
        : "즉시 수정이 필요한 접근성 이슈를 찾지 못했습니다.";
      elements.analyzedAt.textContent = `${formatAnalyzedAt(result.analyzedAt)} · ${summary.aiStatusLabel || "로컬 진단"}`;
      elements.selectionSummary.textContent = `${summary.selectionLabel || "선택"} · ${summary.contextLabel || "일반 UI 화면"}`;
      elements.selectionNote.textContent = `${formatBounds(result.selectionBounds)} · 텍스트 ${
        stats.textNodeCount || 0
      }개 · 터치 후보 ${accessibility.tapTargetCandidateCount || stats.buttonLikeCount || 0}개`;

      fillMetric(elements.rootCount, issueCount);
      fillMetric(elements.layerCount, fixableCount);
      fillMetric(elements.textCount, annotationCount);
      fillMetric(elements.fractionalCount, accessibility.evaluatedTextCount || stats.textNodeCount || 0);

      elements.languageValue.textContent = accessibility.standardLabel || "WCAG 2.2 AA";
      elements.contextValue.textContent = summary.contextLabel || "일반 UI 화면";
      elements.layerBreakdownValue.textContent = formatContrastSummary(accessibility);
      elements.namingValue.textContent = formatFontSummary(accessibility);
      elements.pixelValue.textContent = formatTapSummary(accessibility);
      elements.styleValue.textContent = formatAiStatus(result);
      elements.insightMeta.textContent = matchesCurrentSelection
        ? issueCount > 0
          ? `현재 선택 기준 · 문제 ${issueCount}건`
          : "현재 선택 기준 · 즉시 수정 없음"
        : `최근 캐시 · 문제 ${issueCount}건`;

      renderIssueList(result);
    };

    elements.readButton.addEventListener("click", () => {
      if (isReadingDesign) {
        return;
      }

      setIssueApplyBusy("");
      setReadButtonBusy(true);
      setStatus("running", "진단 중");
      elements.panelTitle.textContent = "웹 접근성 진단 중";
      elements.panelCopy.textContent = "현재 선택을 기준으로 명도 대비, 폰트 크기, 터치 영역을 분석하고 있습니다.";
      postPluginMessage({ type: "run-ai-design-read" });
    });

    elements.insightList.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("button[data-issue-id]") : null;
      if (!(button instanceof HTMLButtonElement) || isReadingDesign) {
        return;
      }

      const issueId = button.dataset.issueId || "";
      if (!issueId) {
        return;
      }

      setIssueApplyBusy(issueId);
      setReadButtonBusy(true);
      setStatus("running", "적용 중");
      elements.panelTitle.textContent = "수정안 적용 중";
      elements.panelCopy.textContent = "선택한 제안을 적용한 뒤 다시 진단하고 있습니다.";
      postPluginMessage({
        type: "run-ai-design-read-apply-fix",
        issueId,
      });
    });

    aiTab.addEventListener("click", handleAiTabClick, true);

    tabs.addEventListener("click", (event) => {
      const tab = event.target instanceof Element ? event.target.closest(".tab[data-tab]") : null;
      if (!(tab instanceof HTMLElement)) {
        return;
      }

      if (tab.dataset.tab === "ai") {
        activateAiTab();
        return;
      }

      deactivateAiTab();
    });

    aiTab.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateAiTab();
      }
    });

    window.addEventListener("message", (event) => {
      const message = event.data?.pluginMessage;
      if (!message || typeof message !== "object") {
        return;
      }

      if (message.type === "ai-design-read-cache") {
        if (message.result) {
          renderResult(message.result, message.matchesCurrentSelection === true);
        } else if (!lastRenderedResult) {
          renderEmptyState();
        }
        return;
      }

      if (message.type === "ai-design-read-status") {
        if (message.status === "running") {
          setReadButtonBusy(true);
          setIssueApplyBusy("");
          setStatus("running", "진단 중");
          return;
        }

        if (message.status === "applying-fix") {
          setReadButtonBusy(true);
          setIssueApplyBusy(typeof message.issueId === "string" ? message.issueId : "");
          setStatus("running", "적용 중");
        }
        return;
      }

      if (message.type === "ai-design-read-result") {
        renderResult(message.result, message.matchesCurrentSelection !== false);
        return;
      }

      if (message.type === "ai-design-read-error") {
        if (message.matchesCurrentSelection === false) {
          setReadButtonBusy(false);
          setIssueApplyBusy("");
          return;
        }
        renderErrorState(message.message);
      }
    });

    deactivateAiTab();
    elements.summaryPanel.open = readStoredSummaryPanelState();
    elements.summaryPanel.addEventListener("toggle", persistSummaryPanelState);
    syncAiActionDescriptions();
    renderEmptyState();
    requestCachedDesignRead();

    const observer = new MutationObserver(() => {
      if (root.dataset.aiCorrectionTab === "active") {
        syncAiState();
      }

      syncAiActionDescriptions();
    });
    observer.observe(aiTab, {
      attributes: true,
      attributeFilter: ["aria-selected", "class", "tabindex"],
    });
    observer.observe(aiView, {
      attributes: true,
      attributeFilter: ["hidden", "class"],
    });

    window.__PIGMA_AI_CORRECTION__ = {
      activate: activateAiTab,
      deactivate: deactivateAiTab,
      requestCachedDesignRead,
    };
  }

  return;

  /* PIGMA_DEAD_UI_BLOCK: legacy AI correction bootstrap left only as a disabled
     reference copy. Runtime source of truth currently lives in ui.html.

  const root = document.documentElement;
  const tabs = document.querySelector(".tabs");
  const aiTab = document.getElementById("tabAi");
  const aiView = document.getElementById("viewAi");
  const views = Array.from(document.querySelectorAll(".view"));
  const postPluginMessage = (message) => {
    parent.postMessage({ pluginMessage: message }, "*");
  };
  const aiActionDescriptions = {
    aiReadDesignButton: {
      title: "AI로 디자인을 전반적으로 이해하고 데이터를 캐시에 저장합니다.",
      ariaLabel: "디자인 읽기. AI로 디자인을 전반적으로 이해하고 데이터를 캐시에 저장합니다.",
    },
    aiRegroupRenameButton: {
      title: "맥락을 이해하고 웹용 구조 기준으로 그룹과 이름을 수정합니다.",
      ariaLabel: "그룹과 이름 수정 웹용. 맥락을 이해하고 웹용 구조 기준으로 그룹과 이름을 수정합니다.",
    },
    aiTypoAuditButton: {
      title: "맥락을 이해하고 오타 후보를 직접 수정하지 않고 Figma Dev Mode 주석 또는 결과 패널로 남깁니다.",
      ariaLabel: "오타 검수. 맥락을 이해하고 오타 후보를 직접 수정하지 않고 Figma Dev Mode 주석 또는 결과 패널로 남깁니다.",
    },
    aiTypoFixButton: {
      title: "맥락을 이해하고 오타 후보를 찾아 현재 선택의 텍스트를 직접 수정하고, 고친 부분에는 주석을 남깁니다.",
      ariaLabel: "오타 자동 수정. 맥락을 이해하고 오타 후보를 찾아 현재 선택의 텍스트를 직접 수정하고, 고친 부분에는 주석을 남깁니다.",
    },
    aiPixelPerfectButton: {
      title: "레이어와 각종 수치 데이터의 소수점 보정 대상을 AI로 판독해 정수 스냅으로 교정합니다.",
      ariaLabel: "픽셀 교정. 레이어와 각종 수치 데이터의 소수점 보정 대상을 AI로 판독해 정수 스냅으로 교정합니다.",
    },
    aiDeleteHiddenLayersButton: {
      title: "현재 선택 내부의 숨겨진 레이어를 정리하기 위한 준비 단계입니다.",
      ariaLabel: "숨겨진 레이어 삭제. 현재 선택 내부의 숨겨진 레이어를 정리하기 위한 준비 단계입니다.",
    },
  };

  const AI_READ_SUMMARY_OPEN_KEY = "pigma:ai-read-summary-open:v1";
  const elements = {
    summaryPanel: document.getElementById("aiReadSummaryPanel"),
    panelTitle: document.getElementById("aiReadPanelTitle"),
    panelCopy: document.getElementById("aiReadPanelCopy"),
    statusPill: document.getElementById("aiReadStatusPill"),
    analyzedAt: document.getElementById("aiReadAnalyzedAt"),
    selectionSummary: document.getElementById("aiReadSelectionSummary"),
    selectionNote: document.getElementById("aiReadSelectionNote"),
    rootCount: document.getElementById("aiReadRootCount"),
    layerCount: document.getElementById("aiReadLayerCount"),
    textCount: document.getElementById("aiReadTextCount"),
    fractionalCount: document.getElementById("aiReadFractionalCount"),
    languageValue: document.getElementById("aiReadLanguageValue"),
    contextValue: document.getElementById("aiReadContextValue"),
    layerBreakdownValue: document.getElementById("aiReadLayerBreakdownValue"),
    namingValue: document.getElementById("aiReadNamingValue"),
    pixelValue: document.getElementById("aiReadPixelValue"),
    styleValue: document.getElementById("aiReadStyleValue"),
    insightMeta: document.getElementById("aiReadInsightMeta"),
    insightList: document.getElementById("aiReadInsightList"),
    readButton: document.getElementById("aiReadDesignButton"),
  };

  if (
    !(tabs instanceof HTMLElement) ||
    !(aiTab instanceof HTMLElement) ||
    !(aiView instanceof HTMLElement) ||
    !(elements.summaryPanel instanceof HTMLDetailsElement) ||
    !(elements.panelTitle instanceof HTMLElement) ||
    !(elements.panelCopy instanceof HTMLElement) ||
    !(elements.statusPill instanceof HTMLElement) ||
    !(elements.analyzedAt instanceof HTMLElement) ||
    !(elements.selectionSummary instanceof HTMLElement) ||
    !(elements.selectionNote instanceof HTMLElement) ||
    !(elements.rootCount instanceof HTMLElement) ||
    !(elements.layerCount instanceof HTMLElement) ||
    !(elements.textCount instanceof HTMLElement) ||
    !(elements.fractionalCount instanceof HTMLElement) ||
    !(elements.languageValue instanceof HTMLElement) ||
    !(elements.contextValue instanceof HTMLElement) ||
    !(elements.layerBreakdownValue instanceof HTMLElement) ||
    !(elements.namingValue instanceof HTMLElement) ||
    !(elements.pixelValue instanceof HTMLElement) ||
    !(elements.styleValue instanceof HTMLElement) ||
    !(elements.insightMeta instanceof HTMLElement) ||
    !(elements.insightList instanceof HTMLElement) ||
    !(elements.readButton instanceof HTMLButtonElement)
  ) {
    return;
  }

  let isSyncing = false;
  let isReadingDesign = false;
  let lastRenderedResult = null;

  const syncAiActionDescriptions = () => {
    Object.entries(aiActionDescriptions).forEach(([id, metadata]) => {
      const button = document.getElementById(id);
      if (!(button instanceof HTMLElement)) {
        return;
      }

      button.title = metadata.title;
      button.setAttribute("aria-label", metadata.ariaLabel);
    });
  };

  const syncAiState = () => {
    if (isSyncing) {
      return;
    }

    isSyncing = true;

    const active = root.dataset.aiCorrectionTab === "active";

    views.forEach((view) => {
      if (!(view instanceof HTMLElement)) {
        return;
      }

      if (!active) {
        view.style.removeProperty("display");
        return;
      }

      view.style.setProperty("display", view === aiView ? "block" : "none", "important");
    });

    aiView.hidden = !active;
    aiView.classList.toggle("is-active", active);
    aiTab.classList.toggle("is-active", active);
    aiTab.setAttribute("aria-selected", active ? "true" : "false");
    aiTab.tabIndex = active ? 0 : -1;

    isSyncing = false;
  };

  const activateAiTab = () => {
    root.dataset.aiCorrectionTab = "active";
    syncAiState();
    requestCachedDesignRead();
  };

  const deactivateAiTab = () => {
    delete root.dataset.aiCorrectionTab;
    syncAiState();
  };

  const handleAiTabClick = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    activateAiTab();
  };

  const requestCachedDesignRead = () => {
    postPluginMessage({ type: "request-ai-design-read-cache" });
  };

  const readStoredSummaryPanelState = () => {
    try {
      return window.localStorage.getItem(AI_READ_SUMMARY_OPEN_KEY) === "true";
    } catch (error) {
      return false;
    }
  };

  const persistSummaryPanelState = () => {
    try {
      window.localStorage.setItem(AI_READ_SUMMARY_OPEN_KEY, elements.summaryPanel.open ? "true" : "false");
    } catch (error) {}
  };

  const setReadButtonBusy = (busy) => {
    isReadingDesign = busy;
    elements.readButton.disabled = busy;
    elements.readButton.textContent = busy ? "디자인 읽는 중..." : "디자인 읽기";
    elements.readButton.setAttribute("aria-busy", busy ? "true" : "false");
  };

  const setStatus = (tone, label) => {
    elements.statusPill.dataset.tone = tone;
    elements.statusPill.textContent = label;
    elements.statusPill.classList.toggle("active", tone === "ready" || tone === "running");
  };

  const fillMetric = (element, value) => {
    element.textContent = String(value);
  };

  const formatAnalyzedAt = (isoString) => {
    if (typeof isoString !== "string" || !isoString) {
      return "마지막 읽기 없음";
    }

    const date = new Date(isoString);
    if (!Number.isFinite(date.getTime())) {
      return "마지막 읽기 없음";
    }

    return `마지막 읽기 ${date.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const formatBounds = (bounds) => {
    if (!bounds || typeof bounds.width !== "number" || typeof bounds.height !== "number") {
      return "범위 미감지";
    }

    return `${bounds.width} x ${bounds.height}px`;
  };

  const formatTopEntries = (entries, formatter, fallback, limit = 2) => {
    const list = Array.isArray(entries) ? entries.filter(Boolean).slice(0, limit) : [];
    if (!list.length) {
      return fallback;
    }

    return list.map(formatter).join(" · ");
  };

  const formatTypeBreakdown = (topTypes) => {
    return formatTopEntries(topTypes, (entry) => `${entry.label} ${entry.count}`, "레이어 정보 없음", 3);
  };

  const formatFontSummary = (fonts, fontSizes) => {
    const fontText = formatTopEntries(fonts, (entry) => `${entry.value} ${entry.count}`, "");
    const sizeText = formatTopEntries(fontSizes, (entry) => `${entry.value}px ${entry.count}`, "");

    if (fontText && sizeText) {
      return `${fontText} / ${sizeText}`;
    }

    return fontText || sizeText || "폰트 정보 없음";
  };

  const formatColorSummary = (colors) => {
    return formatTopEntries(colors, (entry) => `${entry.value} ${entry.count}`, "컬러 정보 없음");
  };

  const formatStyleSummary = (fonts, fontSizes, colors) => {
    const fontSummary = formatFontSummary(fonts, fontSizes);
    const colorSummary = formatColorSummary(colors);

    if (fontSummary === "폰트 정보 없음" && colorSummary === "컬러 정보 없음") {
      return "스타일 정보 없음";
    }

    if (fontSummary === "폰트 정보 없음") {
      return `컬러 ${colorSummary}`;
    }

    if (colorSummary === "컬러 정보 없음") {
      return `폰트 ${fontSummary}`;
    }

    return `폰트 ${fontSummary} / 컬러 ${colorSummary}`;
  };

  const formatNamingSummary = (naming) => {
    if (!naming) {
      return "네이밍 검사 대기";
    }

    const parts = [`기본 이름 ${naming.suspiciousCount || 0}개`, `중복 ${naming.duplicateNameCount || 0}종`];
    const preview = Array.isArray(naming.suspiciousExamples) && naming.suspiciousExamples.length > 0 ? naming.suspiciousExamples[0] : null;

    if (preview) {
      parts.push(`예: ${preview}`);
    }

    return parts.join(" · ");
  };

  const formatPixelSummary = (pixel) => {
    if (!pixel) {
      return "소수점 검사 대기";
    }

    const parts = [`레이어 ${pixel.fractionalNodeCount || 0}개`, `값 ${pixel.fractionalValueCount || 0}건`];
    const preview = Array.isArray(pixel.examples) && pixel.examples.length > 0 ? pixel.examples[0] : null;

    if (preview && Array.isArray(preview.fields) && preview.fields.length > 0) {
      parts.push(`${preview.name}: ${preview.fields.join(", ")}`);
    }

    return parts.join(" · ");
  };

  const renderInsightList = (items) => {
    elements.insightList.replaceChildren();

    const list = Array.isArray(items) ? items.filter(Boolean).slice(0, 3) : [];
    if (!list.length) {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const detail = document.createElement("span");
      title.className = "list-title";
      detail.className = "list-detail";
      title.textContent = "분석 대기";
      detail.textContent = "디자인 읽기를 실행하면 핵심 인사이트를 여기에 정리합니다.";
      item.append(title, detail);
      elements.insightList.append(item);
      return;
    }

    list.forEach((entry) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      title.className = "list-title";
      title.textContent = entry;
      item.append(title);
      elements.insightList.append(item);
    });
  };

  const renderEmptyState = () => {
    lastRenderedResult = null;
    setReadButtonBusy(false);
    setStatus("idle", "대기");
    elements.panelTitle.textContent = "디자인 읽기 준비";
    elements.panelCopy.textContent = "결과는 기본 접힘 상태로 유지되며, 다음 버튼들이 이 데이터를 재사용합니다.";
    elements.analyzedAt.textContent = "마지막 읽기 없음";
    elements.selectionSummary.textContent = "프레임, 그룹, 레이어를 선택한 뒤 실행하세요.";
    elements.selectionNote.textContent =
      "첫 버튼에서 읽은 결과는 이후 그룹과 이름 수정, 오타 자동 수정, 픽셀 퍼펙트 판단의 기반 데이터로 재사용됩니다.";
    fillMetric(elements.rootCount, 0);
    fillMetric(elements.layerCount, 0);
    fillMetric(elements.textCount, 0);
    fillMetric(elements.fractionalCount, 0);
    elements.languageValue.textContent = "언어 대기";
    elements.contextValue.textContent = "맥락 대기";
    elements.layerBreakdownValue.textContent = "레이어 대기";
    elements.namingValue.textContent = "네이밍 대기";
    elements.pixelValue.textContent = "픽셀 퍼펙트 대기";
    elements.styleValue.textContent = "스타일 대기";
    elements.insightMeta.textContent = "로컬 분석";
    renderInsightList([]);
  };

  const renderErrorState = (message) => {
    setReadButtonBusy(false);
    setStatus("error", "오류");
    elements.panelTitle.textContent = "디자인 읽기 실패";
    elements.panelCopy.textContent = message || "디자인 읽기에 실패했습니다.";
    elements.selectionSummary.textContent = message || "선택을 확인한 뒤 다시 시도하세요.";
    elements.selectionNote.textContent = "선택된 레이어가 없거나 읽을 수 없는 경우 이 안내가 표시됩니다.";

    if (!lastRenderedResult) {
      fillMetric(elements.rootCount, 0);
      fillMetric(elements.layerCount, 0);
      fillMetric(elements.textCount, 0);
      fillMetric(elements.fractionalCount, 0);
      elements.languageValue.textContent = "재시도 필요";
      elements.contextValue.textContent = "재시도 필요";
      elements.layerBreakdownValue.textContent = "재시도 필요";
      elements.namingValue.textContent = "재시도 필요";
      elements.pixelValue.textContent = "재시도 필요";
      elements.styleValue.textContent = "재시도 필요";
      renderInsightList(["선택을 다시 확인하고 버튼을 한 번 더 눌러주세요."]);
    }
  };

  const renderResult = (result, matchesCurrentSelection) => {
    if (!result || typeof result !== "object") {
      renderEmptyState();
      return;
    }

    lastRenderedResult = result;
    setReadButtonBusy(false);
    setStatus(matchesCurrentSelection ? "ready" : "stale", matchesCurrentSelection ? "완료" : "캐시");
    elements.panelTitle.textContent = matchesCurrentSelection ? "디자인 읽기 완료" : "최근 캐시 불러옴";
    elements.panelCopy.textContent = matchesCurrentSelection
      ? "언어, 맥락, 구조 요약을 읽어 다음 AI 작업용 기준 데이터를 만들었습니다."
      : "최근에 읽은 결과를 간단히 요약해 보여주고 있습니다. 현재 선택과 다를 수 있습니다.";
    elements.analyzedAt.textContent = `${formatAnalyzedAt(result.analyzedAt)} · 로컬 분석`;
    elements.selectionSummary.textContent = `${result.summary?.selectionLabel || "선택"} · ${
      result.summary?.contextLabel || "일반 UI 화면"
    }`;

    elements.selectionNote.textContent = `${formatBounds(result.selectionBounds)} · 루트 ${
      result.stats?.rootCount || 0
    }개 · 텍스트 ${result.stats?.textNodeCount || 0}개`;

    fillMetric(elements.rootCount, result.stats?.rootCount || 0);
    fillMetric(elements.layerCount, result.stats?.totalNodes || 0);
    fillMetric(elements.textCount, result.stats?.textNodeCount || 0);
    fillMetric(elements.fractionalCount, result.pixel?.fractionalValueCount || 0);

    elements.languageValue.textContent = result.summary?.languageLabel || "텍스트 언어 미감지";
    elements.contextValue.textContent = result.summary?.contextLabel || "일반 선택 영역";
    elements.layerBreakdownValue.textContent = formatTypeBreakdown(result.stats?.topTypes);
    elements.namingValue.textContent = formatNamingSummary(result.naming);
    elements.pixelValue.textContent = formatPixelSummary(result.pixel);
    elements.styleValue.textContent = formatStyleSummary(
      result.typography?.topFonts,
      result.typography?.topFontSizes,
      result.colors?.topColors
    );
    const insightCount = Array.isArray(result.insights) ? result.insights.filter(Boolean).length : 0;
    elements.insightMeta.textContent = insightCount
      ? `${matchesCurrentSelection ? "현재 선택 기준" : "최근 캐시"} · 상위 ${Math.min(insightCount, 3)}개`
      : matchesCurrentSelection
        ? "현재 선택 기준"
        : "최근 캐시";
    renderInsightList(result.insights);
  };

  elements.readButton.addEventListener("click", () => {
    if (isReadingDesign) {
      return;
    }

    setReadButtonBusy(true);
    setStatus("running", "읽는 중");
    elements.panelTitle.textContent = "디자인 읽는 중";
    elements.panelCopy.textContent = "현재 선택을 구조적으로 읽고 있습니다.";
    postPluginMessage({ type: "run-ai-design-read" });
  });

  aiTab.addEventListener("click", handleAiTabClick, true);

  tabs.addEventListener("click", (event) => {
    const tab = event.target instanceof Element ? event.target.closest(".tab[data-tab]") : null;
    if (!(tab instanceof HTMLElement)) {
      return;
    }

    if (tab.dataset.tab === "ai") {
      activateAiTab();
      return;
    }

    deactivateAiTab();
  });

  aiTab.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateAiTab();
    }
  });

  window.addEventListener("message", (event) => {
    const message = event.data?.pluginMessage;
    if (!message || typeof message !== "object") {
      return;
    }

    if (message.type === "ai-design-read-cache") {
      if (message.result) {
        renderResult(message.result, message.matchesCurrentSelection === true);
      } else if (!lastRenderedResult) {
        renderEmptyState();
      }
      return;
    }

    if (message.type === "ai-design-read-status") {
      if (message.status === "running") {
        setStatus("running", "읽는 중");
      }
      return;
    }

    if (message.type === "ai-design-read-result") {
      renderResult(message.result, message.matchesCurrentSelection !== false);
      return;
    }

    if (message.type === "ai-design-read-error") {
      if (message.matchesCurrentSelection === false) {
        setReadButtonBusy(false);
        return;
      }
      renderErrorState(message.message);
    }
  });

  deactivateAiTab();
  elements.summaryPanel.open = readStoredSummaryPanelState();
  elements.summaryPanel.addEventListener("toggle", persistSummaryPanelState);
  syncAiActionDescriptions();
  renderEmptyState();
  requestCachedDesignRead();

  const observer = new MutationObserver(() => {
    if (root.dataset.aiCorrectionTab === "active") {
      syncAiState();
    }

    syncAiActionDescriptions();
  });
  observer.observe(aiTab, {
    attributes: true,
    attributeFilter: ["aria-selected", "class", "tabindex"],
  });
  observer.observe(aiView, {
    attributes: true,
    attributeFilter: ["hidden", "class"],
  });

  window.__PIGMA_AI_CORRECTION__ = {
    activate: activateAiTab,
    deactivate: deactivateAiTab,
    requestCachedDesignRead,
  };
  */
})();

(() => {
  if (window.__PIGMA_AI_DESIGN_CONSISTENCY_UI__) {
    return;
  }

  const postPluginMessage = (message) => {
    parent.postMessage({ pluginMessage: message }, "*");
  };
  const elements = {
    panel: document.getElementById("aiReadSummaryPanel"),
    kicker: document.querySelector("#aiReadSummaryPanel .section-kicker"),
    panelTitle: document.getElementById("aiReadPanelTitle"),
    panelCopy: document.getElementById("aiReadPanelCopy"),
    statusPill: document.getElementById("aiReadStatusPill"),
    analyzedAt: document.getElementById("aiReadAnalyzedAt"),
    selectionSummary: document.getElementById("aiReadSelectionSummary"),
    selectionNote: document.getElementById("aiReadSelectionNote"),
    rootCount: document.getElementById("aiReadRootCount"),
    layerCount: document.getElementById("aiReadLayerCount"),
    textCount: document.getElementById("aiReadTextCount"),
    fractionalCount: document.getElementById("aiReadFractionalCount"),
    languageValue: document.getElementById("aiReadLanguageValue"),
    contextValue: document.getElementById("aiReadContextValue"),
    layerBreakdownValue: document.getElementById("aiReadLayerBreakdownValue"),
    namingValue: document.getElementById("aiReadNamingValue"),
    pixelValue: document.getElementById("aiReadPixelValue"),
    styleValue: document.getElementById("aiReadStyleValue"),
    insightMeta: document.getElementById("aiReadInsightMeta"),
    insightList: document.getElementById("aiReadInsightList"),
    readButton: document.getElementById("aiReadDesignButton"),
    button: document.getElementById("aiDesignConsistencyButton"),
    clearButton: document.getElementById("aiDesignConsistencyClearButton"),
    metricLabels: Array.from(document.querySelectorAll("#aiReadSummaryPanel .ai-read-metrics .detail-label")),
    compactLabels: Array.from(document.querySelectorAll("#aiReadSummaryPanel .ai-read-compact-row .detail-label")),
    compactHead: document.querySelector("#aiReadSummaryPanel .ai-read-compact-list .meta-fold-label"),
    compactNote: document.querySelector("#aiReadSummaryPanel .ai-read-compact-list .surface-card-note"),
    insightHead: document.querySelector("#aiReadSummaryPanel .ai-read-insights .meta-fold-label"),
  };

  if (
    !(elements.panel instanceof HTMLDetailsElement) ||
    !(elements.panelTitle instanceof HTMLElement) ||
    !(elements.panelCopy instanceof HTMLElement) ||
    !(elements.statusPill instanceof HTMLElement) ||
    !(elements.analyzedAt instanceof HTMLElement) ||
    !(elements.selectionSummary instanceof HTMLElement) ||
    !(elements.selectionNote instanceof HTMLElement) ||
    !(elements.rootCount instanceof HTMLElement) ||
    !(elements.layerCount instanceof HTMLElement) ||
    !(elements.textCount instanceof HTMLElement) ||
    !(elements.fractionalCount instanceof HTMLElement) ||
    !(elements.languageValue instanceof HTMLElement) ||
    !(elements.contextValue instanceof HTMLElement) ||
    !(elements.layerBreakdownValue instanceof HTMLElement) ||
    !(elements.namingValue instanceof HTMLElement) ||
    !(elements.pixelValue instanceof HTMLElement) ||
    !(elements.styleValue instanceof HTMLElement) ||
    !(elements.insightMeta instanceof HTMLElement) ||
    !(elements.insightList instanceof HTMLElement) ||
    !(elements.readButton instanceof HTMLButtonElement) ||
    !(elements.button instanceof HTMLButtonElement) ||
    !(elements.clearButton instanceof HTMLButtonElement)
  ) {
    return;
  }

  let isBusy = false;
  let activeBusyMode = "";
  let activeIssueId = "";
  let lastResult = null;
  let lastRenderMode = "";

  const DEFAULT_BUTTON_LABEL = "디자인 일관성";
  const BUSY_BUTTON_LABEL = "디자인 일관성 진단 중...";
  const CLEAR_BUTTON_LABEL = "주석 삭제";
  const CLEAR_BUSY_BUTTON_LABEL = "주석 삭제 중...";
  const CONSISTENCY_TITLE =
    "선택 화면의 색상, 타이포그래피, 여백 규칙을 기준으로 일관성을 진단하고 파란 Dev Mode 주석으로 표시합니다.";
  const CONSISTENCY_ARIA =
    "디자인 일관성. 색상, 타이포그래피, 여백과 제목, 반복 블록, 폼 규칙을 기준으로 현재 선택의 일관성을 검사합니다.";
  const CLEAR_TITLE = "현재 선택 범위에 남아 있는 웹 접근성 진단과 디자인 일관성 Dev Mode 주석을 함께 정리합니다.";
  const CLEAR_ARIA =
    "디자인 진단 주석 삭제. 현재 선택 범위에 남아 있는 웹 접근성 진단과 디자인 일관성 Dev Mode 주석을 함께 정리합니다.";

  const fillMetric = (element, value) => {
    element.textContent = String(value);
  };

  const formatAnalyzedAt = (isoString) => {
    if (typeof isoString !== "string" || !isoString) {
      return "마지막 진단 없음";
    }

    const date = new Date(isoString);
    if (!Number.isFinite(date.getTime())) {
      return "마지막 진단 없음";
    }

    return `마지막 진단 ${date.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const formatBounds = (bounds) => {
    if (!bounds || typeof bounds.width !== "number" || typeof bounds.height !== "number") {
      return "범위 미감지";
    }
    return `${bounds.width} x ${bounds.height}px`;
  };

  const formatAiStatus = (result) => {
    const summary = result && result.summary ? result.summary : {};
    if (summary.aiProviderLabel && summary.aiModelLabel) {
      return `${summary.aiProviderLabel} · ${summary.aiModelLabel}`;
    }
    if (summary.aiStatusLabel) {
      return summary.aiStatusLabel;
    }
    return "로컬 휴리스틱";
  };

  const formatClearBreakdown = (accessibilityCount, consistencyCount) => {
    const parts = [];
    if (accessibilityCount > 0) {
      parts.push(`접근성 ${accessibilityCount}건`);
    }
    if (consistencyCount > 0) {
      parts.push(`일관성 ${consistencyCount}건`);
    }
    return parts.length ? parts.join(" · ") : "세부 내역 없음";
  };

  const formatIssuePriority = (issue) => {
    const severityMap = {
      error: "상",
      warning: "중",
      info: "하",
    };
    return severityMap[issue && issue.severity ? issue.severity : "info"] || "하";
  };

  const formatIssueMeta = (issue) => {
    const parts = [`중요도 ${formatIssuePriority(issue)}`];
    if (issue && typeof issue.guideline === "string" && issue.guideline.trim()) {
      parts.push(issue.guideline.trim());
    }
    return parts.join(" · ");
  };

  const setStatus = (tone, label) => {
    elements.statusPill.dataset.tone = tone;
    elements.statusPill.textContent = label;
    elements.statusPill.classList.toggle("active", tone === "ready" || tone === "running");
  };

  const syncButtonState = () => {
    const consistencyBusy = isBusy && activeBusyMode === "diagnosis";
    const clearBusy = isBusy && activeBusyMode === "clear";
    elements.button.textContent = consistencyBusy ? BUSY_BUTTON_LABEL : DEFAULT_BUTTON_LABEL;
    elements.button.title = CONSISTENCY_TITLE;
    elements.button.setAttribute("aria-label", CONSISTENCY_ARIA);
    elements.button.disabled = isBusy;
    if (!isBusy) {
      elements.button.removeAttribute("disabled");
    }
    elements.button.setAttribute("aria-busy", consistencyBusy ? "true" : "false");

    elements.clearButton.textContent = clearBusy ? CLEAR_BUSY_BUTTON_LABEL : CLEAR_BUTTON_LABEL;
    elements.clearButton.title = CLEAR_TITLE;
    elements.clearButton.setAttribute("aria-label", CLEAR_ARIA);
    elements.clearButton.disabled = isBusy;
    if (!isBusy) {
      elements.clearButton.removeAttribute("disabled");
    }
    elements.clearButton.setAttribute("aria-busy", clearBusy ? "true" : "false");

    elements.insightList.querySelectorAll("button[data-consistency-issue-id]").forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }
      const issueId = button.dataset.consistencyIssueId || "";
      const busy = isBusy && !!issueId && issueId === activeIssueId;
      button.disabled = isBusy;
      button.textContent = busy ? "적용 중..." : button.dataset.defaultLabel || "제안 적용";
      button.setAttribute("aria-busy", busy ? "true" : "false");
    });
  };

  const applyClearModeLabels = () => {
    if (elements.kicker) {
      elements.kicker.textContent = "디자인 진단";
    }
    if (elements.compactHead) {
      elements.compactHead.textContent = "주석 정리";
    }
    if (elements.compactNote) {
      elements.compactNote.textContent = "웹 접근성 진단의 초록 주석과 디자인 일관성의 파란 주석을 함께 삭제합니다.";
    }
    if (elements.insightHead) {
      elements.insightHead.textContent = "정리 결과";
    }

    const metricLabels = ["정리 노드", "삭제 주석", "건너뜀", "검사 레이어"];
    const compactLabels = ["선택", "디자인 맥락", "카테고리", "최근 정리", "상태", "정리 방식"];

    elements.metricLabels.forEach((label, index) => {
      if (metricLabels[index]) {
        label.textContent = metricLabels[index];
      }
    });
    elements.compactLabels.forEach((label, index) => {
      if (compactLabels[index]) {
        label.textContent = compactLabels[index];
      }
    });
  };

  const applyModeLabels = () => {
    if (elements.kicker) {
      elements.kicker.textContent = "디자인 일관성 진단";
    }
    if (elements.compactHead) {
      elements.compactHead.textContent = "감지된 규칙";
    }
    if (elements.compactNote) {
      elements.compactNote.textContent = "대표 토큰과 제목, 반복 블록, 폼 규칙을 함께 검사합니다.";
    }
    if (elements.insightHead) {
      elements.insightHead.textContent = "일관성 이슈";
    }

    const metricLabels = ["이슈", "즉시 수정", "블루 주석", "검사 레이어"];
    const compactLabels = ["기준", "디자인 맥락", "색상", "타이포", "여백", "AI 상태"];

    elements.metricLabels.forEach((label, index) => {
      if (metricLabels[index]) {
        label.textContent = metricLabels[index];
      }
    });
    elements.compactLabels.forEach((label, index) => {
      if (compactLabels[index]) {
        label.textContent = compactLabels[index];
      }
    });
  };

  const applyAccessibilityLabels = () => {
    if (elements.kicker) {
      elements.kicker.textContent = "웹 접근성 진단";
    }
    if (elements.compactHead) {
      elements.compactHead.textContent = "진단 기준";
    }
    if (elements.compactNote) {
      elements.compactNote.textContent = "즉시 적용 전에 먼저 확인해 주세요.";
    }
    if (elements.insightHead) {
      elements.insightHead.textContent = "수정 제안";
    }

    const metricLabels = ["이슈", "즉시 수정", "초록 주석", "평가 텍스트"];
    const compactLabels = ["기준", "디자인 맥락", "텍스트 대비", "폰트 크기", "터치 영역", "AI 상태"];

    elements.metricLabels.forEach((label, index) => {
      if (metricLabels[index]) {
        label.textContent = metricLabels[index];
      }
    });
    elements.compactLabels.forEach((label, index) => {
      if (compactLabels[index]) {
        label.textContent = compactLabels[index];
      }
    });
  };

  const appendPlaceholder = (titleText, detailText) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    const detail = document.createElement("span");
    title.className = "list-title";
    detail.className = "list-detail";
    title.textContent = titleText;
    detail.textContent = detailText;
    item.append(title, detail);
    elements.insightList.append(item);
  };

  const renderIssueList = (result) => {
    elements.insightList.replaceChildren();
    const issues =
      result && result.consistency && Array.isArray(result.consistency.issues)
        ? result.consistency.issues.filter(Boolean).slice(0, 8)
        : [];

    if (!issues.length) {
      appendPlaceholder("즉시 적용 제안 없음", "현재 선택에서 바로 적용 가능한 일관성 제안을 찾지 못했습니다.");
      syncButtonState();
      return;
    }

    issues.forEach((issue) => {
      const item = document.createElement("li");
      const copy = document.createElement("div");
      const meta = document.createElement("span");
      const title = document.createElement("strong");
      const detail = document.createElement("p");

      item.className = "ai-read-issue-item";
      item.dataset.severity = issue.severity || "info";

      copy.className = "ai-read-issue-copy";
      meta.className = "list-meta";
      meta.textContent = formatIssueMeta(issue);
      title.className = "list-title";
      title.textContent = `${issue.nodeName || "레이어"} · ${issue.summary || "일관성 이슈"}`;
      detail.className = "ai-read-issue-detail";
      detail.textContent = issue.detail || "추가 설명이 없습니다.";
      copy.append(meta, title, detail);

      if (typeof issue.suggestion === "string" && issue.suggestion.trim()) {
        const suggestion = document.createElement("p");
        suggestion.className = "ai-read-issue-suggestion";
        suggestion.textContent = issue.suggestion.trim();
        copy.append(suggestion);
      }

      item.append(copy);

      if (issue.canApply) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "button-secondary ai-read-apply-button";
        button.dataset.consistencyIssueId = issue.id || "";
        button.dataset.defaultLabel = issue.applyLabel || "제안 적용";
        button.textContent = issue.applyLabel || "제안 적용";
        item.append(button);
      }

      elements.insightList.append(item);
    });

    syncButtonState();
  };

  const renderClearList = (result) => {
    elements.insightList.replaceChildren();
    const rows = [];

    (Array.isArray(result?.cleared) ? result.cleared : []).slice(0, 6).forEach((entry) => {
      rows.push({
        title: `정리됨 · ${entry.nodeName || "이름 없음"}`,
        detail: `진단 주석 ${entry.removedCount || 0}건 제거 · ${formatClearBreakdown(
          entry.removedAccessibilityCount || 0,
          entry.removedConsistencyCount || 0
        )}`,
      });
    });

    (Array.isArray(result?.skipped) ? result.skipped : []).slice(0, 3).forEach((entry) => {
      rows.push({
        title: "건너뜀",
        detail: `${entry.label || "이름 없음"} · ${entry.reason || "원인을 확인하세요."}`,
      });
    });

    if (!rows.length) {
      appendPlaceholder("정리 결과 대기", "버튼을 실행하면 삭제한 주석과 건너뛴 이유가 여기에 표시됩니다.");
      syncButtonState();
      return;
    }

    rows.forEach((row) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const detail = document.createElement("span");
      title.className = "list-title";
      detail.className = "list-detail";
      title.textContent = row.title;
      detail.textContent = row.detail;
      item.append(title, detail);
      elements.insightList.append(item);
    });

    syncButtonState();
  };

  const renderEmptyState = () => {
    lastResult = null;
    isBusy = false;
    activeBusyMode = "";
    activeIssueId = "";
    lastRenderMode = "";
    applyModeLabels();
    setStatus("idle", "대기");
    elements.panelTitle.textContent = "디자인 일관성 진단 준비";
    elements.panelCopy.textContent = "대표 토큰과 제목, 반복 블록, 폼 규칙을 기준으로 어긋난 부분을 찾아 제안합니다.";
    elements.analyzedAt.textContent = "마지막 진단 없음";
    elements.selectionSummary.textContent = "프레임, 그룹, 레이어를 선택한 뒤 실행해 주세요.";
    elements.selectionNote.textContent = "어긋난 값과 반복 블록 편차는 파란 Dev Mode 주석으로 표시하고, 가능한 항목은 즉시 적용 버튼을 제공합니다.";
    fillMetric(elements.rootCount, 0);
    fillMetric(elements.layerCount, 0);
    fillMetric(elements.textCount, 0);
    fillMetric(elements.fractionalCount, 0);
    elements.languageValue.textContent = "규칙 대기";
    elements.contextValue.textContent = "맥락 대기";
    elements.layerBreakdownValue.textContent = "색상 대기";
    elements.namingValue.textContent = "타이포 대기";
    elements.pixelValue.textContent = "여백 대기";
    elements.styleValue.textContent = "진단 대기";
    elements.insightMeta.textContent = "진단 대기";
    renderIssueList(null);
    syncButtonState();
  };

  const renderErrorState = (message) => {
    isBusy = false;
    activeBusyMode = "";
    activeIssueId = "";
    applyModeLabels();
    setStatus("error", "오류");
    elements.panelTitle.textContent = "디자인 일관성 진단 실패";
    elements.panelCopy.textContent = message || "디자인 일관성 진단에 실패했습니다.";
    elements.selectionSummary.textContent = message || "선택 상태를 확인한 뒤 다시 시도해 주세요.";
    elements.selectionNote.textContent = "레이아웃, 색상, 텍스트가 너무 적은 선택에서는 안내 가능한 결과가 제한될 수 있습니다.";

    if (lastRenderMode !== "diagnosis") {
      fillMetric(elements.rootCount, 0);
      fillMetric(elements.layerCount, 0);
      fillMetric(elements.textCount, 0);
      fillMetric(elements.fractionalCount, 0);
      elements.languageValue.textContent = "재시도 필요";
      elements.contextValue.textContent = "재시도 필요";
      elements.layerBreakdownValue.textContent = "재시도 필요";
      elements.namingValue.textContent = "재시도 필요";
      elements.pixelValue.textContent = "재시도 필요";
      elements.styleValue.textContent = "재시도 필요";
      elements.insightMeta.textContent = "재시도 필요";
      elements.insightList.replaceChildren();
      appendPlaceholder("다시 진단해 주세요", "선택을 다시 확인하고 디자인 일관성 버튼을 눌러 주세요.");
    }

    syncButtonState();
  };

  const renderResult = (result, matchesCurrentSelection) => {
    if (!result || typeof result !== "object") {
      renderEmptyState();
      return;
    }

    lastResult = result;
    isBusy = false;
    activeBusyMode = "";
    activeIssueId = "";
    lastRenderMode = "diagnosis";
    applyModeLabels();

    const summary = result.summary || {};
    const stats = result.stats || {};
    const consistency = result.consistency || {};
    const issueCount = consistency.issueCount || 0;
    const fixableCount = consistency.fixableCount || 0;
    const annotationCount =
      consistency.annotations && typeof consistency.annotations.annotationCount === "number"
        ? consistency.annotations.annotationCount
        : 0;
    const statusLabel = matchesCurrentSelection ? (issueCount > 0 ? "완료" : "통과") : "캐시";

    setStatus(matchesCurrentSelection ? "ready" : "stale", statusLabel);
    elements.panelTitle.textContent = matchesCurrentSelection
      ? issueCount > 0
        ? "디자인 일관성 진단 완료"
        : "디자인 일관성 기준 통과"
      : "최근 디자인 일관성 진단";
    elements.panelCopy.textContent = issueCount
      ? `문제 ${issueCount}건을 찾았고 ${fixableCount}건은 버튼에서 바로 적용할 수 있습니다.`
      : "대표 색상, 타이포, 여백 규칙에서 큰 이탈을 찾지 못했습니다.";
    elements.analyzedAt.textContent = `${formatAnalyzedAt(result.analyzedAt)} · ${summary.aiStatusLabel || "로컬 휴리스틱"}`;
    elements.selectionSummary.textContent = `${summary.selectionLabel || "선택"} · ${summary.contextLabel || "일반 UI 화면"}`;
    elements.selectionNote.textContent = `${formatBounds(result.selectionBounds)} · 레이어 ${stats.totalNodes || 0}개 · 텍스트 ${
      stats.textNodeCount || 0
    }개 · 오토레이아웃 ${stats.autoLayoutCount || 0}개`;

    fillMetric(elements.rootCount, issueCount);
    fillMetric(elements.layerCount, fixableCount);
    fillMetric(elements.textCount, annotationCount);
    fillMetric(elements.fractionalCount, stats.totalNodes || 0);

    elements.languageValue.textContent = consistency.standardLabel || "색상 · 타이포 · 여백";
    elements.contextValue.textContent = summary.contextLabel || "일반 UI 화면";
    elements.layerBreakdownValue.textContent =
      consistency.aiColorSummary || consistency.colorTokenSummary || "대표 색상 감지 없음";
    elements.namingValue.textContent =
      consistency.aiTypographySummary || consistency.typographyTokenSummary || "대표 타이포 감지 없음";
    elements.pixelValue.textContent =
      consistency.aiSpacingSummary || consistency.spacingTokenSummary || "대표 간격 감지 없음";
    elements.styleValue.textContent = formatAiStatus(result);
    elements.insightMeta.textContent = consistency.prioritySummary
      ? `우선 수정 · ${consistency.prioritySummary}`
      : matchesCurrentSelection
      ? issueCount > 0
        ? `현재 선택 기준 · 문제 ${issueCount}건`
        : "현재 선택 기준 · 큰 이탈 없음"
      : `최근 캐시 · 문제 ${issueCount}건`;

    renderIssueList(result);
    syncButtonState();
  };

  const renderClearResult = (result, matchesCurrentSelection) => {
    if (!result || typeof result !== "object") {
      renderEmptyState();
      return;
    }

  const summary = result.summary || {};
  const stats = result.stats || {};
  const cleared = Array.isArray(result.cleared) ? result.cleared : [];
  const removedAnnotationCount = summary.removedAnnotationCount || 0;
  const removedAccessibilityAnnotationCount = summary.removedAccessibilityAnnotationCount || 0;
  const removedConsistencyAnnotationCount = summary.removedConsistencyAnnotationCount || 0;
  const clearedNodeCount = summary.clearedNodeCount || 0;
  const skippedCount = summary.skippedCount || 0;

    lastResult = result;
    isBusy = false;
    activeBusyMode = "";
    activeIssueId = "";
    lastRenderMode = "clear";
  applyClearModeLabels();
  setStatus(matchesCurrentSelection ? "ready" : "stale", matchesCurrentSelection ? "완료" : "캐시");
  elements.panelTitle.textContent = matchesCurrentSelection
    ? "디자인 진단 주석 정리 완료"
    : "최근 디자인 진단 주석 정리";
  elements.panelCopy.textContent = removedAnnotationCount
    ? "현재 선택 범위에 남아 있던 웹 접근성 진단과 디자인 일관성 Dev Mode 주석을 정리했습니다."
    : "현재 선택 범위에서 삭제할 디자인 진단 주석을 찾지 못했습니다.";
    elements.analyzedAt.textContent = `${formatAnalyzedAt(result.analyzedAt)} · ${summary.modeLabel || "Blue Dev Mode annotation clear"}`;
    elements.selectionSummary.textContent = `${summary.selectionLabel || "선택"} · ${summary.contextLabel || "일반 UI 화면"}`;
    elements.selectionNote.textContent = `${formatBounds(result.selectionBounds)} · 검사 레이어 ${stats.totalNodes || 0}개 · 삭제 주석 ${
      removedAnnotationCount || 0
    }건 · 정리 노드 ${clearedNodeCount || 0}개`;
    fillMetric(elements.rootCount, clearedNodeCount || 0);
    fillMetric(elements.layerCount, removedAnnotationCount || 0);
  fillMetric(elements.textCount, skippedCount || 0);
  fillMetric(elements.fractionalCount, stats.totalNodes || 0);
  elements.languageValue.textContent = summary.selectionLabel || "선택";
  elements.contextValue.textContent = summary.contextLabel || "일반 UI 화면";
  elements.layerBreakdownValue.textContent = summary.categoryLabel || "웹 접근성 진단 + 디자인 일관성";
  elements.namingValue.textContent = cleared.length
    ? `${cleared[0].nodeName || "이름 없음"} · ${cleared[0].removedCount || 0}건 제거 · ${formatClearBreakdown(
        cleared[0].removedAccessibilityCount || 0,
        cleared[0].removedConsistencyCount || 0
      )}`
    : "삭제할 주석 없음";
  elements.pixelValue.textContent =
    removedAnnotationCount > 0
      ? formatClearBreakdown(removedAccessibilityAnnotationCount, removedConsistencyAnnotationCount)
      : "삭제할 주석 없음";
    elements.styleValue.textContent = summary.modeLabel || "Blue Dev Mode annotation clear";
    elements.insightMeta.textContent = matchesCurrentSelection
      ? `현재 선택 기준 · 삭제 주석 ${removedAnnotationCount || 0}건`
      : `최근 캐시 · 삭제 주석 ${removedAnnotationCount || 0}건`;
    renderClearList(result);
    syncButtonState();
  };

  const renderClearErrorState = (message) => {
    isBusy = false;
    activeBusyMode = "";
    activeIssueId = "";
  lastRenderMode = "clear";
  applyClearModeLabels();
  setStatus("error", "오류");
  elements.panelTitle.textContent = "디자인 진단 주석 정리 실패";
  elements.panelCopy.textContent = message || "디자인 진단 주석 정리에 실패했습니다.";
  elements.selectionSummary.textContent = message || "선택 범위를 확인한 뒤 다시 시도해 주세요.";
  elements.selectionNote.textContent =
    "웹 접근성 진단과 디자인 일관성 주석만 삭제하며, 현재 선택 범위에 대상이 없으면 정리할 내용이 없다고 안내합니다.";
    fillMetric(elements.rootCount, 0);
    fillMetric(elements.layerCount, 0);
    fillMetric(elements.textCount, 0);
    fillMetric(elements.fractionalCount, 0);
    elements.languageValue.textContent = "재시도 필요";
    elements.contextValue.textContent = "재시도 필요";
    elements.layerBreakdownValue.textContent = "재시도 필요";
    elements.namingValue.textContent = "재시도 필요";
    elements.pixelValue.textContent = "재시도 필요";
    elements.styleValue.textContent = "재시도 필요";
    elements.insightMeta.textContent = "재시도 필요";
    renderClearList({
      skipped: [{ label: "정리 실패", reason: message || "선택 범위를 다시 확인해 주세요." }],
    });
    syncButtonState();
  };

  const runDiagnosis = () => {
    if (isBusy) {
      return;
    }
    isBusy = true;
    activeBusyMode = "diagnosis";
    activeIssueId = "";
    applyModeLabels();
    elements.panel.open = true;
    setStatus("running", "진단 중");
    elements.panelTitle.textContent = "디자인 일관성 진단 중";
    elements.panelCopy.textContent = "대표 색상, 타이포, 여백과 제목, 반복 블록, 폼 규칙을 추론하고 어긋난 값을 찾고 있습니다.";
    syncButtonState();
    postPluginMessage({ type: "run-ai-design-consistency" });
  };

  const runClearAnnotations = () => {
    if (isBusy) {
      return;
    }
    isBusy = true;
    activeBusyMode = "clear";
  activeIssueId = "";
  applyClearModeLabels();
  elements.panel.open = true;
  setStatus("running", "정리 중");
  elements.panelTitle.textContent = "디자인 진단 주석 정리 중";
  elements.panelCopy.textContent =
    "현재 선택 범위에 남아 있는 웹 접근성 진단과 디자인 일관성 Dev Mode 주석을 함께 정리하고 있습니다.";
  syncButtonState();
  postPluginMessage({ type: "run-ai-design-consistency-clear" });
};

  elements.readButton.addEventListener("click", applyAccessibilityLabels);
  elements.button.addEventListener("click", runDiagnosis);
  elements.clearButton.addEventListener("click", runClearAnnotations);

  elements.insightList.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button[data-consistency-issue-id]") : null;
    if (!(button instanceof HTMLButtonElement) || isBusy) {
      return;
    }

    const issueId = button.dataset.consistencyIssueId || "";
    if (!issueId) {
      return;
    }

    isBusy = true;
    activeBusyMode = "apply-fix";
    activeIssueId = issueId;
    elements.panel.open = true;
    setStatus("running", "적용 중");
    elements.panelTitle.textContent = "일관성 제안 적용 중";
    elements.panelCopy.textContent = "선택한 제안을 적용하고 다시 디자인 일관성을 확인하고 있습니다.";
    syncButtonState();
    postPluginMessage({
      type: "run-ai-design-consistency-apply-fix",
      issueId,
    });
  });

  window.addEventListener("message", (event) => {
    const message = event.data?.pluginMessage;
    if (!message || typeof message !== "object") {
      return;
    }

    if (
      message.type === "ai-design-read-cache" ||
      message.type === "ai-design-read-status" ||
      message.type === "ai-design-read-result" ||
      message.type === "ai-design-read-error"
    ) {
      applyAccessibilityLabels();
      return;
    }

    if (message.type === "ai-design-consistency-cache") {
      if (message.result) {
        renderResult(message.result, message.matchesCurrentSelection === true);
      }
      return;
    }

  if (message.type === "ai-design-consistency-status") {
    isBusy = true;
    activeBusyMode =
      message.status === "applying-fix"
        ? "apply-fix"
        : message.status === "clearing-annotations"
          ? "clear"
          : "diagnosis";
    activeIssueId = typeof message.issueId === "string" ? message.issueId : "";
    setStatus(
      "running",
      message.status === "applying-fix"
        ? "적용 중"
        : message.status === "clearing-annotations"
          ? "정리 중"
          : "진단 중"
    );
    syncButtonState();
    return;
  }

  if (message.type === "ai-design-consistency-result") {
    renderResult(message.result, message.matchesCurrentSelection !== false);
    return;
  }

  if (message.type === "ai-design-consistency-clear-result") {
    renderClearResult(message.result, message.matchesCurrentSelection !== false);
    return;
  }

  if (message.type === "ai-design-consistency-error") {
    if (message.matchesCurrentSelection === false) {
      isBusy = false;
      activeBusyMode = "";
      activeIssueId = "";
      syncButtonState();
      return;
    }
    renderErrorState(message.message);
    return;
  }

  if (message.type === "ai-design-consistency-clear-error") {
    if (message.matchesCurrentSelection === false) {
      isBusy = false;
      activeBusyMode = "";
      activeIssueId = "";
      syncButtonState();
      return;
    }
    renderClearErrorState(message.message);
  }
});

  syncButtonState();

  window.__PIGMA_AI_DESIGN_CONSISTENCY_UI__ = {
    requestCached: () => postPluginMessage({ type: "request-ai-design-consistency-cache" }),
  };
})();

(() => {
  if (window.__PIGMA_AI_CORRECTION_REGROUP_RENAME__) {
    return;
  }

  const rootElement = document.documentElement;
  const postPluginMessage = (message) => {
    parent.postMessage({ pluginMessage: message }, "*");
  };
  const PANEL_STATE_KEY = "pigma:ai-regroup-rename-open:v1";
  const elements = {
    panel: document.getElementById("aiRegroupRenamePanel"),
    panelTitle: document.getElementById("aiRegroupRenamePanelTitle"),
    panelCopy: document.getElementById("aiRegroupRenamePanelCopy"),
    statusPill: document.getElementById("aiRegroupRenameStatusPill"),
    processedAt: document.getElementById("aiRegroupRenameProcessedAt"),
    selectionSummary: document.getElementById("aiRegroupRenameSelectionSummary"),
    selectionNote: document.getElementById("aiRegroupRenameSelectionNote"),
    renameCount: document.getElementById("aiRegroupRenameCount"),
    groupCount: document.getElementById("aiRegroupGroupCount"),
    suggestionCount: document.getElementById("aiRegroupSuggestionCount"),
    skippedCount: document.getElementById("aiRegroupSkippedCount"),
    contextValue: document.getElementById("aiRegroupContextValue"),
    renamePreview: document.getElementById("aiRegroupRenamePreview"),
    regroupPreview: document.getElementById("aiRegroupPreviewValue"),
    changeMeta: document.getElementById("aiRegroupChangeMeta"),
    changeList: document.getElementById("aiRegroupChangeList"),
    button: document.getElementById("aiRegroupRenameButton"),
  };

  if (
    !(elements.panel instanceof HTMLDetailsElement) ||
    !(elements.panelTitle instanceof HTMLElement) ||
    !(elements.panelCopy instanceof HTMLElement) ||
    !(elements.statusPill instanceof HTMLElement) ||
    !(elements.processedAt instanceof HTMLElement) ||
    !(elements.selectionSummary instanceof HTMLElement) ||
    !(elements.selectionNote instanceof HTMLElement) ||
    !(elements.renameCount instanceof HTMLElement) ||
    !(elements.groupCount instanceof HTMLElement) ||
    !(elements.suggestionCount instanceof HTMLElement) ||
    !(elements.skippedCount instanceof HTMLElement) ||
    !(elements.contextValue instanceof HTMLElement) ||
    !(elements.renamePreview instanceof HTMLElement) ||
    !(elements.regroupPreview instanceof HTMLElement) ||
    !(elements.changeMeta instanceof HTMLElement) ||
    !(elements.changeList instanceof HTMLElement) ||
    !(elements.button instanceof HTMLButtonElement)
  ) {
    return;
  }

  let isApplying = false;
  let lastRenderedResult = null;

  const requestCachedResult = () => {
    postPluginMessage({ type: "request-ai-regroup-rename-cache" });
  };

  const readStoredPanelState = () => {
    try {
      return window.localStorage.getItem(PANEL_STATE_KEY) === "true";
    } catch (error) {
      return false;
    }
  };

  const persistPanelState = () => {
    try {
      window.localStorage.setItem(PANEL_STATE_KEY, elements.panel.open ? "true" : "false");
    } catch (error) {}
  };

  const setButtonBusy = (busy) => {
    isApplying = busy;
    elements.button.disabled = busy;
    elements.button.textContent = busy ? "그룹과 이름 수정 중..." : "그룹과 이름 수정 (웹용)";
    elements.button.setAttribute("aria-busy", busy ? "true" : "false");
  };

  const setStatus = (tone, label) => {
    elements.statusPill.dataset.tone = tone;
    elements.statusPill.textContent = label;
    elements.statusPill.classList.toggle("active", tone === "ready" || tone === "running");
  };

  const fillMetric = (element, value) => {
    element.textContent = String(value);
  };

  const formatProcessedAt = (isoString) => {
    if (typeof isoString !== "string" || !isoString) {
      return "마지막 실행 없음";
    }

    const date = new Date(isoString);
    if (!Number.isFinite(date.getTime())) {
      return "마지막 실행 없음";
    }

    return `마지막 실행 ${date.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const truncateText = (value, limit = 56) => {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    if (!normalized) {
      return "";
    }

    return normalized.length > limit ? `${normalized.slice(0, limit - 3)}...` : normalized;
  };

  const renderChangeList = (result) => {
    elements.changeList.replaceChildren();

    const rows = [];
    (Array.isArray(result?.renamed) ? result.renamed : []).slice(0, 3).forEach((entry) => {
      rows.push({
        title: "이름 변경",
        detail: `${entry.from} -> ${entry.to} · ${entry.reason}`,
      });
    });
    (Array.isArray(result?.regrouped) ? result.regrouped : []).slice(0, 2).forEach((entry) => {
      rows.push({
        title: "리그룹핑 적용",
        detail: `${entry.name} · ${entry.reason}`,
      });
    });
    (Array.isArray(result?.suggestions) ? result.suggestions : []).slice(0, 2).forEach((entry) => {
      rows.push({
        title: "추가 후보",
        detail: `${entry.name} · ${entry.reason}`,
      });
    });
    (Array.isArray(result?.skipped) ? result.skipped : []).slice(0, 1).forEach((entry) => {
      rows.push({
        title: "건너뜀",
        detail: `${entry.label} · ${entry.reason}`,
      });
    });

    if (!rows.length) {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const detail = document.createElement("span");
      title.className = "list-title";
      detail.className = "list-detail";
      title.textContent = "결과 대기";
      detail.textContent = "버튼을 실행하면 적용된 이름 변경과 리그룹핑 내역이 여기에 표시됩니다.";
      item.append(title, detail);
      elements.changeList.append(item);
      return;
    }

    rows.forEach((row) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const detail = document.createElement("span");
      title.className = "list-title";
      detail.className = "list-detail";
      title.textContent = row.title;
      detail.textContent = truncateText(row.detail, 96);
      item.append(title, detail);
      elements.changeList.append(item);
    });
  };

  const renderEmptyState = () => {
    lastRenderedResult = null;
    setButtonBusy(false);
    setStatus("idle", "대기");
    elements.panelTitle.textContent = "그룹과 이름 수정 준비";
    elements.panelCopy.textContent = "웹용 구조 기준으로 그룹과 이름을 정리하고, 안전한 그룹만 제한적으로 적용합니다.";
    elements.processedAt.textContent = "마지막 실행 없음";
    elements.selectionSummary.textContent = "웹 접근성 진단 후 실행하면 결과가 여기에 표시됩니다.";
    elements.selectionNote.textContent = "웹용은 안전한 조합 위주로 그룹과 이름을 정리합니다.";
    fillMetric(elements.renameCount, 0);
    fillMetric(elements.groupCount, 0);
    fillMetric(elements.suggestionCount, 0);
    fillMetric(elements.skippedCount, 0);
    elements.contextValue.textContent = "맥락 대기";
    elements.renamePreview.textContent = "이름 변경 대기";
    elements.regroupPreview.textContent = "리그룹핑 대기";
    elements.changeMeta.textContent = "로컬 분석";
    renderChangeList(null);
  };

  const renderErrorState = (message) => {
    setButtonBusy(false);
    setStatus("error", "오류");
    elements.panelTitle.textContent = "그룹과 이름 수정 실패";
    elements.panelCopy.textContent = message || "그룹과 이름 수정에 실패했습니다.";
    elements.selectionSummary.textContent = message || "선택을 확인한 뒤 다시 시도하세요.";
    elements.selectionNote.textContent = "잠긴 레이어, 인스턴스 내부, 구조 제한이 있으면 일부 항목은 건너뜁니다.";

    if (!lastRenderedResult) {
      fillMetric(elements.renameCount, 0);
      fillMetric(elements.groupCount, 0);
      fillMetric(elements.suggestionCount, 0);
      fillMetric(elements.skippedCount, 0);
      elements.contextValue.textContent = "재시도 필요";
      elements.renamePreview.textContent = "재시도 필요";
      elements.regroupPreview.textContent = "재시도 필요";
      elements.changeMeta.textContent = "재시도 필요";
      renderChangeList({
        skipped: [{ label: "실행 실패", reason: message || "선택을 다시 확인해 주세요." }],
      });
    }
  };

  const renderResult = (result, matchesCurrentSelection) => {
    if (!result || typeof result !== "object") {
      renderEmptyState();
      return;
    }

    const summary = result.summary || {};
    const renamed = Array.isArray(result.renamed) ? result.renamed : [];
    const regrouped = Array.isArray(result.regrouped) ? result.regrouped : [];
    const suggestions = Array.isArray(result.suggestions) ? result.suggestions : [];
    lastRenderedResult = result;
    setButtonBusy(false);
    setStatus(matchesCurrentSelection ? "ready" : "stale", matchesCurrentSelection ? "완료" : "캐시");
    elements.panelTitle.textContent = matchesCurrentSelection ? "그룹과 이름 수정 완료" : "최근 결과 불러옴";
    elements.panelCopy.textContent = matchesCurrentSelection
      ? "웹용 구조 기준으로 그룹과 이름을 정리하고, 안전한 조합만 보수적으로 묶었습니다."
      : "최근에 실행한 그룹과 이름 수정 결과를 보여주고 있습니다.";
    elements.processedAt.textContent = `${formatProcessedAt(result.processedAt)} · 로컬 적용`;
    elements.selectionSummary.textContent = `${summary.selectionLabel || "선택"} · ${summary.contextLabel || "일반 UI 화면"}`;
    elements.selectionNote.textContent = `이름 변경 ${summary.renameCount || 0}건 · 리그룹핑 ${
      summary.regroupCount || 0
    }건 · 추가 후보 ${summary.suggestionCount || 0}건`;
    fillMetric(elements.renameCount, summary.renameCount || 0);
    fillMetric(elements.groupCount, summary.regroupCount || 0);
    fillMetric(elements.suggestionCount, summary.suggestionCount || 0);
    fillMetric(elements.skippedCount, summary.skippedCount || 0);
    elements.contextValue.textContent = summary.contextLabel || "일반 UI 화면";
    elements.renamePreview.textContent = renamed.length
      ? truncateText(`${renamed[0].from} -> ${renamed[0].to}`, 60)
      : "적용 없음";
    elements.regroupPreview.textContent = regrouped.length
      ? truncateText(regrouped[0].name, 60)
      : suggestions.length
        ? truncateText(`후보: ${suggestions[0].name}`, 60)
        : "적용 없음";
    const appliedCount = (summary.renameCount || 0) + (summary.regroupCount || 0);
    elements.changeMeta.textContent = matchesCurrentSelection
      ? `현재 선택 기준 · 적용 ${appliedCount}건`
      : `최근 캐시 · 적용 ${appliedCount}건`;
    renderChangeList(result);
  };

  elements.button.addEventListener("click", () => {
    if (isApplying) {
      return;
    }

    setButtonBusy(true);
    setStatus("running", "적용 중");
    elements.panelTitle.textContent = "그룹과 이름 수정 진행 중";
    elements.panelCopy.textContent = "웹용 구조 기준으로 그룹과 이름을 정리하고 안전한 그룹 후보를 확인하고 있습니다.";
    postPluginMessage({ type: "run-ai-regroup-rename" });
  });

  window.addEventListener("message", (event) => {
    const message = event.data?.pluginMessage;
    if (!message || typeof message !== "object") {
      return;
    }

    if (message.type === "ai-regroup-rename-cache") {
      if (message.result) {
        renderResult(message.result, message.matchesCurrentSelection === true);
      } else if (!lastRenderedResult) {
        renderEmptyState();
      }
      return;
    }

    if (message.type === "ai-regroup-rename-status") {
      if (message.status === "running") {
        setStatus("running", "적용 중");
      }
      return;
    }

    if (message.type === "ai-regroup-rename-result") {
      renderResult(message.result, message.matchesCurrentSelection !== false);
      return;
    }

    if (message.type === "ai-regroup-rename-error") {
      if (message.matchesCurrentSelection === false) {
        setButtonBusy(false);
        return;
      }
      renderErrorState(message.message);
    }
  });

  elements.panel.open = readStoredPanelState();
  elements.panel.addEventListener("toggle", persistPanelState);
  renderEmptyState();
  requestCachedResult();

  const rootObserver = new MutationObserver(() => {
    if (rootElement.dataset.aiCorrectionTab === "active") {
      requestCachedResult();
    }
  });
  rootObserver.observe(rootElement, {
    attributes: true,
    attributeFilter: ["data-ai-correction-tab"],
  });

window.__PIGMA_AI_CORRECTION_REGROUP_RENAME__ = {
  requestCachedResult,
};
})();

(() => {
  if (window.__PIGMA_AI_CORRECTION_TYPO_AUDIT__) {
    return;
  }

  const rootElement = document.documentElement;
  const postPluginMessage = (message) => {
    parent.postMessage({ pluginMessage: message }, "*");
  };
  const PANEL_STATE_KEY = "pigma:ai-typo-audit-open:v1";
  const elements = {
    panel: document.getElementById("aiTypoAuditPanel"),
    panelTitle: document.getElementById("aiTypoAuditPanelTitle"),
    panelCopy: document.getElementById("aiTypoAuditPanelCopy"),
    statusPill: document.getElementById("aiTypoAuditStatusPill"),
    processedAt: document.getElementById("aiTypoAuditProcessedAt"),
    selectionSummary: document.getElementById("aiTypoAuditSelectionSummary"),
    selectionNote: document.getElementById("aiTypoAuditSelectionNote"),
    issueCount: document.getElementById("aiTypoAuditIssueCount"),
    annotationCount: document.getElementById("aiTypoAuditAnnotationCount"),
    clearedCount: document.getElementById("aiTypoAuditClearedCount"),
    skippedCount: document.getElementById("aiTypoAuditSkippedCount"),
    contextValue: document.getElementById("aiTypoAuditContextValue"),
    categoryValue: document.getElementById("aiTypoAuditCategoryValue"),
    aiStatusValue: document.getElementById("aiTypoAuditAiStatusValue"),
    previewValue: document.getElementById("aiTypoAuditPreviewValue"),
    changeMeta: document.getElementById("aiTypoAuditChangeMeta"),
    changeList: document.getElementById("aiTypoAuditChangeList"),
    button: document.getElementById("aiTypoAuditButton"),
  };

  if (
    !(elements.panel instanceof HTMLDetailsElement) ||
    !(elements.panelTitle instanceof HTMLElement) ||
    !(elements.panelCopy instanceof HTMLElement) ||
    !(elements.statusPill instanceof HTMLElement) ||
    !(elements.processedAt instanceof HTMLElement) ||
    !(elements.selectionSummary instanceof HTMLElement) ||
    !(elements.selectionNote instanceof HTMLElement) ||
    !(elements.issueCount instanceof HTMLElement) ||
    !(elements.annotationCount instanceof HTMLElement) ||
    !(elements.clearedCount instanceof HTMLElement) ||
    !(elements.skippedCount instanceof HTMLElement) ||
    !(elements.contextValue instanceof HTMLElement) ||
    !(elements.categoryValue instanceof HTMLElement) ||
    !(elements.aiStatusValue instanceof HTMLElement) ||
    !(elements.previewValue instanceof HTMLElement) ||
    !(elements.changeMeta instanceof HTMLElement) ||
    !(elements.changeList instanceof HTMLElement) ||
    !(elements.button instanceof HTMLButtonElement)
  ) {
    return;
  }

  let isApplying = false;
  let lastRenderedResult = null;

  const requestCachedResult = () => {
    postPluginMessage({ type: "request-ai-typo-audit-cache" });
  };

  const readStoredPanelState = () => {
    try {
      return window.localStorage.getItem(PANEL_STATE_KEY) === "true";
    } catch (error) {
      return false;
    }
  };

  const persistPanelState = () => {
    try {
      window.localStorage.setItem(PANEL_STATE_KEY, elements.panel.open ? "true" : "false");
    } catch (error) {}
  };

  const setButtonBusy = (busy) => {
    isApplying = busy;
    elements.button.disabled = busy;
    elements.button.textContent = busy ? "검수 중..." : "검수";
    elements.button.setAttribute("aria-busy", busy ? "true" : "false");
  };

  const setStatus = (tone, label) => {
    elements.statusPill.dataset.tone = tone;
    elements.statusPill.textContent = label;
    elements.statusPill.classList.toggle("active", tone === "ready" || tone === "running");
  };

  const fillMetric = (element, value) => {
    element.textContent = String(value);
  };

  const formatProcessedAt = (isoString) => {
    if (typeof isoString !== "string" || !isoString) {
      return "마지막 실행 없음";
    }

    const date = new Date(isoString);
    if (!Number.isFinite(date.getTime())) {
      return "마지막 실행 없음";
    }

    return `마지막 실행 ${date.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const truncateText = (value, limit = 56) => {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    if (!normalized) {
      return "";
    }

    return normalized.length > limit ? `${normalized.slice(0, limit - 3)}...` : normalized;
  };

  const renderChangeList = (result) => {
    elements.changeList.replaceChildren();

    const rows = [];
    (Array.isArray(result?.issues) ? result.issues : []).slice(0, 4).forEach((entry) => {
      rows.push({
        title: `${entry.kind} · ${entry.nodeName}`,
        detail: `${entry.currentText} -> ${entry.suggestion} · ${entry.reason}`,
      });
    });
    (Array.isArray(result?.skipped) ? result.skipped : []).slice(0, 2).forEach((entry) => {
      rows.push({
        title: "건너뜀",
        detail: `${entry.label} · ${entry.reason}`,
      });
    });

      if (!rows.length) {
        const item = document.createElement("li");
        const title = document.createElement("strong");
        const detail = document.createElement("span");
        title.className = "list-title";
        detail.className = "list-detail";
        title.textContent = "결과 대기";
        detail.textContent = "버튼을 실행하면 Dev Mode 주석 또는 결과 패널에 남긴 오타 후보가 여기에 표시됩니다.";
        item.append(title, detail);
        elements.changeList.append(item);
        return;
      }

    rows.forEach((row) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const detail = document.createElement("span");
      title.className = "list-title";
      detail.className = "list-detail";
      title.textContent = row.title;
      detail.textContent = truncateText(row.detail, 110);
      item.append(title, detail);
      elements.changeList.append(item);
    });
  };

        const renderEmptyState = () => {
          lastRenderedResult = null;
          setButtonBusy(false);
          setStatus("idle", "대기");
          elements.panelTitle.textContent = "오타 검수 준비";
          elements.panelCopy.textContent = "직접 수정하지 않고 오타 후보를 Figma Dev Mode 주석 또는 결과 패널로 남깁니다.";
          elements.processedAt.textContent = "마지막 실행 없음";
          elements.selectionSummary.textContent = "웹 접근성 진단 후 실행하면 결과가 여기에 표시됩니다.";
          elements.selectionNote.textContent =
            "주석은 Dev Mode에서 보입니다. 현재 환경에서 주석을 쓸 수 없으면 결과 패널에만 표시합니다.";
          fillMetric(elements.issueCount, 0);
          fillMetric(elements.annotationCount, 0);
          fillMetric(elements.clearedCount, 0);
          fillMetric(elements.skippedCount, 0);
          elements.contextValue.textContent = "맥락 대기";
          elements.categoryValue.textContent = "반영 방식 대기";
          elements.aiStatusValue.textContent = "AI 상태 대기";
          elements.previewValue.textContent = "오타 후보 대기";
          elements.changeMeta.textContent = "AI 호출 대기";
          renderChangeList(null);
        };

        const renderErrorState = (message) => {
          setButtonBusy(false);
          setStatus("error", "오류");
          elements.panelTitle.textContent = "오타 검수 실패";
          elements.panelCopy.textContent = message || "오타 검수에 실패했습니다.";
          elements.selectionSummary.textContent = message || "선택을 확인한 뒤 다시 시도하세요.";
          elements.selectionNote.textContent = "현재 선택 안에 텍스트가 없거나, 주석 API를 쓸 수 없는 환경이면 이 안내가 표시됩니다.";

    if (!lastRenderedResult) {
      fillMetric(elements.issueCount, 0);
      fillMetric(elements.annotationCount, 0);
      fillMetric(elements.clearedCount, 0);
      fillMetric(elements.skippedCount, 0);
      elements.contextValue.textContent = "재시도 필요";
      elements.categoryValue.textContent = "재시도 필요";
      elements.aiStatusValue.textContent = "AI 재시도 필요";
      elements.previewValue.textContent = "재시도 필요";
      elements.changeMeta.textContent = "재시도 필요";
      renderChangeList({
        skipped: [{ label: "실행 실패", reason: message || "선택을 다시 확인해 주세요." }],
      });
    }
  };

        const renderResult = (result, matchesCurrentSelection) => {
          if (!result || typeof result !== "object") {
            renderEmptyState();
            return;
          }

          const summary = result.summary || {};
          const issues = Array.isArray(result.issues) ? result.issues : [];
          const usesAnnotations = summary.mode === "figma-dev-annotation";
          const modeLabel = summary.modeLabel || (usesAnnotations ? "Figma Dev Mode 주석" : "결과 패널만");
          const aiStatusLabel = summary.aiStatusLabel || "AI 상태 미확인";
          const aiProviderLabel = summary.aiProviderLabel || "";
          const aiModelLabel = summary.aiModelLabel || "";
          lastRenderedResult = result;
          setButtonBusy(false);
          setStatus(matchesCurrentSelection ? "ready" : "stale", matchesCurrentSelection ? "완료" : "캐시");
          elements.panelTitle.textContent = matchesCurrentSelection ? "오타 검수 완료" : "최근 결과 불러옴";
          elements.panelCopy.textContent = matchesCurrentSelection
            ? usesAnnotations
              ? "텍스트를 직접 수정하지 않고 오타 후보를 Figma Dev Mode 주석으로 남겼습니다."
              : "텍스트를 직접 수정하지 않고 오타 후보를 결과 패널에 표시했습니다."
            : "최근에 실행한 오타 검수 결과를 보여주고 있습니다.";
          elements.processedAt.textContent = `${formatProcessedAt(result.processedAt)} · ${modeLabel}`;
          elements.selectionSummary.textContent = `${summary.selectionLabel || "선택"} · ${summary.contextLabel || "일반 UI 화면"}`;
          elements.selectionNote.textContent = usesAnnotations
            ? `텍스트 ${summary.textNodeCount || 0}개 검사 · Dev Mode 주석 ${summary.annotationCount || 0}건 · 정리 ${
                summary.clearedNodeCount || 0
              }개`
            : `텍스트 ${summary.textNodeCount || 0}개 검사 · 결과 패널 후보 ${summary.issueCount || 0}건 · 주석 미적용`;
          fillMetric(elements.issueCount, summary.issueCount || 0);
          fillMetric(elements.annotationCount, summary.annotationCount || 0);
          fillMetric(elements.clearedCount, summary.clearedNodeCount || 0);
          fillMetric(elements.skippedCount, summary.skippedCount || 0);
          elements.contextValue.textContent = summary.contextLabel || "일반 UI 화면";
          elements.categoryValue.textContent = summary.categoryLabel || modeLabel;
          elements.aiStatusValue.textContent = aiProviderLabel
            ? `${aiStatusLabel} · ${aiProviderLabel}${aiModelLabel ? ` / ${aiModelLabel}` : ""}`
            : aiStatusLabel;
          elements.previewValue.textContent = issues.length
            ? truncateText(`${issues[0].currentText} -> ${issues[0].suggestion}`, 72)
            : "오타 후보 없음";
          const appliedCount = (summary.annotationCount || 0) + (summary.clearedNodeCount || 0);
          elements.changeMeta.textContent = matchesCurrentSelection
            ? `${summary.reviewStrategy || "전략 미확인"} · ${aiStatusLabel}`
            : `최근 캐시 · ${summary.reviewStrategy || "전략 미확인"} · ${aiStatusLabel}`;
          renderChangeList(result);
        };

  elements.button.addEventListener("click", () => {
    if (isApplying) {
      return;
    }

          setButtonBusy(true);
          setStatus("running", "검수 중");
          elements.panelTitle.textContent = "오타 검수 진행 중";
          elements.panelCopy.textContent = "현재 선택의 텍스트를 검사하고 직접 수정 없이 Dev Mode 주석 또는 결과 패널로 반영하고 있습니다.";
          postPluginMessage({ type: "run-ai-typo-audit" });
        });

  window.addEventListener("message", (event) => {
    const message = event.data?.pluginMessage;
    if (!message || typeof message !== "object") {
      return;
    }

    if (message.type === "ai-typo-audit-cache") {
      if (message.result) {
        renderResult(message.result, message.matchesCurrentSelection === true);
      } else if (!lastRenderedResult) {
        renderEmptyState();
      }
      return;
    }

    if (message.type === "ai-typo-audit-status") {
      if (message.status === "running") {
        setStatus("running", "검수 중");
      }
      return;
    }

    if (message.type === "ai-typo-audit-result") {
      renderResult(message.result, message.matchesCurrentSelection !== false);
      return;
    }

    if (message.type === "ai-typo-audit-error") {
      if (message.matchesCurrentSelection === false) {
        setButtonBusy(false);
        return;
      }
      renderErrorState(message.message);
    }
  });

  elements.panel.open = readStoredPanelState();
  elements.panel.addEventListener("toggle", persistPanelState);
  renderEmptyState();
  requestCachedResult();

  const rootObserver = new MutationObserver(() => {
    if (rootElement.dataset.aiCorrectionTab === "active") {
      requestCachedResult();
    }
  });
  rootObserver.observe(rootElement, {
    attributes: true,
    attributeFilter: ["data-ai-correction-tab"],
  });

  window.__PIGMA_AI_CORRECTION_TYPO_AUDIT__ = {
    requestCachedResult,
  };
})();

(() => {
  const rootElement = document.documentElement;
  const postPluginMessage = (message) => {
    parent.postMessage({ pluginMessage: message }, "*");
  };
  const PANEL_STATE_KEY = "pigma:ai-typo-fix-open:v1";
  const elements = {
    panel: document.getElementById("aiTypoFixPanel"),
    panelTitle: document.getElementById("aiTypoFixPanelTitle"),
    panelCopy: document.getElementById("aiTypoFixPanelCopy"),
    statusPill: document.getElementById("aiTypoFixStatusPill"),
    processedAt: document.getElementById("aiTypoFixProcessedAt"),
    selectionSummary: document.getElementById("aiTypoFixSelectionSummary"),
    selectionNote: document.getElementById("aiTypoFixSelectionNote"),
    issueCount: document.getElementById("aiTypoFixIssueCount"),
    appliedCount: document.getElementById("aiTypoFixAppliedCount"),
    annotationCount: document.getElementById("aiTypoFixUnchangedCount"),
    skippedCount: document.getElementById("aiTypoFixSkippedCount"),
    contextValue: document.getElementById("aiTypoFixContextValue"),
    categoryValue: document.getElementById("aiTypoFixCategoryValue"),
    aiStatusValue: document.getElementById("aiTypoFixAiStatusValue"),
    previewValue: document.getElementById("aiTypoFixPreviewValue"),
    changeMeta: document.getElementById("aiTypoFixChangeMeta"),
    changeList: document.getElementById("aiTypoFixChangeList"),
    button: document.getElementById("aiTypoFixButton"),
  };

  if (
    !(elements.panel instanceof HTMLDetailsElement) ||
    !(elements.panelTitle instanceof HTMLElement) ||
    !(elements.panelCopy instanceof HTMLElement) ||
    !(elements.statusPill instanceof HTMLElement) ||
    !(elements.processedAt instanceof HTMLElement) ||
    !(elements.selectionSummary instanceof HTMLElement) ||
    !(elements.selectionNote instanceof HTMLElement) ||
    !(elements.issueCount instanceof HTMLElement) ||
    !(elements.appliedCount instanceof HTMLElement) ||
    !(elements.annotationCount instanceof HTMLElement) ||
    !(elements.skippedCount instanceof HTMLElement) ||
    !(elements.contextValue instanceof HTMLElement) ||
    !(elements.categoryValue instanceof HTMLElement) ||
    !(elements.aiStatusValue instanceof HTMLElement) ||
    !(elements.previewValue instanceof HTMLElement) ||
    !(elements.changeMeta instanceof HTMLElement) ||
    !(elements.changeList instanceof HTMLElement) ||
    !(elements.button instanceof HTMLButtonElement)
  ) {
    return;
  }

  let isApplying = false;
  let lastRenderedResult = null;

  const requestCachedResult = () => {
    postPluginMessage({ type: "request-ai-typo-fix-cache" });
  };

  const readStoredPanelState = () => {
    try {
      return window.localStorage.getItem(PANEL_STATE_KEY) === "true";
    } catch (error) {
      return false;
    }
  };

  const persistPanelState = () => {
    try {
      window.localStorage.setItem(PANEL_STATE_KEY, elements.panel.open ? "true" : "false");
    } catch (error) {}
  };

  const setButtonBusy = (busy) => {
    isApplying = busy;
    elements.button.disabled = busy;
    elements.button.textContent = busy ? "자동 수정 중..." : "자동 수정";
    elements.button.setAttribute("aria-busy", busy ? "true" : "false");
  };

  const setStatus = (tone, label) => {
    elements.statusPill.dataset.tone = tone;
    elements.statusPill.textContent = label;
    elements.statusPill.classList.toggle("active", tone === "ready" || tone === "running");
  };

  const fillMetric = (element, value) => {
    element.textContent = String(value);
  };

  const formatProcessedAt = (isoString) => {
    if (typeof isoString !== "string" || !isoString) {
      return "마지막 실행 없음";
    }

    const date = new Date(isoString);
    if (!Number.isFinite(date.getTime())) {
      return "마지막 실행 없음";
    }

    return `마지막 실행 ${date.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const truncateText = (value, limit = 56) => {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    if (!normalized) {
      return "";
    }

    return normalized.length > limit ? `${normalized.slice(0, limit - 3)}...` : normalized;
  };

  const renderChangeList = (result) => {
    elements.changeList.replaceChildren();

    const rows = [];
    (Array.isArray(result?.applied) ? result.applied : []).slice(0, 4).forEach((entry) => {
      rows.push({
        title: `수정 · ${entry.kind} · ${entry.nodeName}`,
        detail: `${entry.currentText} -> ${entry.suggestion} · ${entry.reason}`,
      });
    });
    (Array.isArray(result?.skipped) ? result.skipped : []).slice(0, 2).forEach((entry) => {
      rows.push({
        title: "건너뜀",
        detail: `${entry.label} · ${entry.reason}`,
      });
    });

    if (!rows.length) {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const detail = document.createElement("span");
      title.className = "list-title";
      detail.className = "list-detail";
      title.textContent = "결과 대기";
      detail.textContent = "버튼을 실행하면 직접 수정된 텍스트, 남겨진 주석, 건너뛴 이유가 여기에 표시됩니다.";
      item.append(title, detail);
      elements.changeList.append(item);
      return;
    }

    rows.forEach((row) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const detail = document.createElement("span");
      title.className = "list-title";
      detail.className = "list-detail";
      title.textContent = row.title;
      detail.textContent = truncateText(row.detail, 110);
      item.append(title, detail);
      elements.changeList.append(item);
    });
  };

  const renderEmptyState = () => {
    lastRenderedResult = null;
    setButtonBusy(false);
    setStatus("idle", "대기");
    elements.panelTitle.textContent = "오타 자동 수정 준비";
    elements.panelCopy.textContent = "오타 후보를 찾은 뒤 현재 선택의 텍스트를 직접 수정하고, 고친 부분에는 Dev Mode 주석도 남깁니다.";
    elements.processedAt.textContent = "마지막 실행 없음";
    elements.selectionSummary.textContent = "웹 접근성 진단 후 실행하면 결과가 여기에 표시됩니다.";
    elements.selectionNote.textContent =
      "직접 수정이 가능한 텍스트만 반영합니다. 수정된 텍스트에는 Dev Mode 주석을 남기고, 구조 제한이 있으면 건너뛴 이유를 결과 패널에 남깁니다.";
    fillMetric(elements.issueCount, 0);
    fillMetric(elements.appliedCount, 0);
    fillMetric(elements.annotationCount, 0);
    fillMetric(elements.skippedCount, 0);
    elements.contextValue.textContent = "맥락 대기";
    elements.categoryValue.textContent = "직접 수정 + 주석 대기";
    elements.aiStatusValue.textContent = "AI 상태 대기";
    elements.previewValue.textContent = "수정/주석 후보 대기";
    elements.changeMeta.textContent = "AI 호출 대기";
    renderChangeList(null);
  };

  const renderErrorState = (message) => {
    setButtonBusy(false);
    setStatus("error", "오류");
    elements.panelTitle.textContent = "오타 자동 수정 실패";
    elements.panelCopy.textContent = message || "오타 자동 수정에 실패했습니다.";
    elements.selectionSummary.textContent = message || "선택을 확인한 뒤 다시 시도하세요.";
    elements.selectionNote.textContent = "현재 선택 안에 텍스트가 없거나, 수정할 수 없는 구조면 이 안내가 표시됩니다.";

    if (!lastRenderedResult) {
      fillMetric(elements.issueCount, 0);
      fillMetric(elements.appliedCount, 0);
      fillMetric(elements.annotationCount, 0);
      fillMetric(elements.skippedCount, 0);
      elements.contextValue.textContent = "재시도 필요";
      elements.categoryValue.textContent = "재시도 필요";
      elements.aiStatusValue.textContent = "AI 재시도 필요";
      elements.previewValue.textContent = "재시도 필요";
      elements.changeMeta.textContent = "재시도 필요";
      renderChangeList({
        skipped: [{ label: "실행 실패", reason: message || "선택을 다시 확인해 주세요." }],
      });
    }
  };

  const renderResult = (result, matchesCurrentSelection) => {
    if (!result || typeof result !== "object") {
      renderEmptyState();
      return;
    }

    const summary = result.summary || {};
    const applied = Array.isArray(result.applied) ? result.applied : [];
    const issues = Array.isArray(result.issues) ? result.issues : [];
    const aiStatusLabel = summary.aiStatusLabel || "AI 상태 미확인";
    const aiProviderLabel = summary.aiProviderLabel || "";
    const aiModelLabel = summary.aiModelLabel || "";
    lastRenderedResult = result;
    setButtonBusy(false);
    setStatus(matchesCurrentSelection ? "ready" : "stale", matchesCurrentSelection ? "완료" : "캐시");
    elements.panelTitle.textContent = matchesCurrentSelection ? "오타 자동 수정 완료" : "최근 결과 불러옴";
    elements.panelCopy.textContent = matchesCurrentSelection
      ? summary.appliedCount > 0
        ? summary.annotationCount > 0
          ? "오타 후보를 찾아 현재 선택의 텍스트에 직접 반영했고, 고친 부분에는 주석도 남겼습니다."
          : "오타 후보를 찾아 현재 선택의 텍스트에 직접 반영했습니다."
        : "오타 후보를 찾았지만 직접 수정이나 주석 표기가 적용되지 않았습니다."
      : "최근에 실행한 오타 자동 수정 결과를 보여주고 있습니다.";
    elements.processedAt.textContent = `${formatProcessedAt(result.processedAt)} · ${summary.modeLabel || "직접 수정"}`;
    elements.selectionSummary.textContent = `${summary.selectionLabel || "선택"} · ${summary.contextLabel || "일반 UI 화면"}`;
    elements.selectionNote.textContent = `텍스트 ${summary.textNodeCount || 0}개 검사 · 직접 수정 ${summary.appliedCount || 0}개 · 주석 ${summary.annotationCount || 0}건`;
    fillMetric(elements.issueCount, summary.issueCount || 0);
    fillMetric(elements.appliedCount, summary.appliedCount || 0);
    fillMetric(elements.annotationCount, summary.annotationCount || 0);
    fillMetric(elements.skippedCount, summary.skippedCount || 0);
    elements.contextValue.textContent = summary.contextLabel || "일반 UI 화면";
    elements.categoryValue.textContent = summary.categoryLabel || "직접 수정 + 주석";
    elements.aiStatusValue.textContent = aiProviderLabel
      ? `${aiStatusLabel} · ${aiProviderLabel}${aiModelLabel ? ` / ${aiModelLabel}` : ""}`
      : aiStatusLabel;
    elements.previewValue.textContent = applied.length
      ? truncateText(`${applied[0].currentText} -> ${applied[0].suggestion}`, 72)
      : issues.length
        ? truncateText(`${issues[0].currentText} -> ${issues[0].suggestion}`, 72)
        : "수정 후보 없음";
    elements.changeMeta.textContent = matchesCurrentSelection
      ? `${summary.reviewStrategy || "전략 미확인"} · ${summary.modeLabel || "직접 수정"} · ${aiStatusLabel}`
      : `최근 캐시 · ${summary.reviewStrategy || "전략 미확인"} · ${summary.modeLabel || "직접 수정"} · ${aiStatusLabel}`;
    renderChangeList(result);
  };

  elements.button.addEventListener("click", () => {
    if (isApplying) {
      return;
    }

  setButtonBusy(true);
  setStatus("running", "수정 중");
  elements.panelTitle.textContent = "오타 자동 수정 진행 중";
  elements.panelCopy.textContent = "현재 선택의 텍스트를 검사하고, 수정 가능한 후보는 직접 반영한 뒤 고친 부분에 주석을 남기고 있습니다.";
  postPluginMessage({ type: "run-ai-typo-fix" });
  });

  window.addEventListener("message", (event) => {
    const message = event.data?.pluginMessage;
    if (!message || typeof message !== "object") {
      return;
    }

    if (message.type === "ai-typo-fix-cache") {
      if (message.result) {
        renderResult(message.result, message.matchesCurrentSelection === true);
      } else if (!lastRenderedResult) {
        renderEmptyState();
      }
      return;
    }

    if (message.type === "ai-typo-fix-status") {
      if (message.status === "running") {
        setStatus("running", "수정 중");
      }
      return;
    }

    if (message.type === "ai-typo-fix-result") {
      renderResult(message.result, message.matchesCurrentSelection !== false);
      return;
    }

    if (message.type === "ai-typo-fix-error") {
      if (message.matchesCurrentSelection === false) {
        setButtonBusy(false);
        return;
      }
      renderErrorState(message.message);
    }
  });

  elements.panel.open = readStoredPanelState();
  elements.panel.addEventListener("toggle", persistPanelState);
  renderEmptyState();
  requestCachedResult();

  const rootObserver = new MutationObserver(() => {
    if (rootElement.dataset.aiCorrectionTab === "active") {
      requestCachedResult();
    }
  });
  rootObserver.observe(rootElement, {
    attributes: true,
    attributeFilter: ["data-ai-correction-tab"],
  });

window.__PIGMA_AI_CORRECTION_TYPO_FIX__ = {
    requestCachedResult,
  };
})();

(() => {
  if (window.__PIGMA_AI_CORRECTION_PIXEL_PERFECT__) {
    return;
  }

  const rootElement = document.documentElement;
  const postPluginMessage = (message) => {
    parent.postMessage({ pluginMessage: message }, "*");
  };
  const PANEL_STATE_KEY = "pigma:ai-pixel-perfect-open:v1";
  const elements = {
    panel: document.getElementById("aiPixelPerfectPanel"),
    panelTitle: document.getElementById("aiPixelPerfectPanelTitle"),
    panelCopy: document.getElementById("aiPixelPerfectPanelCopy"),
    statusPill: document.getElementById("aiPixelPerfectStatusPill"),
    processedAt: document.getElementById("aiPixelPerfectProcessedAt"),
    selectionSummary: document.getElementById("aiPixelPerfectSelectionSummary"),
    selectionNote: document.getElementById("aiPixelPerfectSelectionNote"),
    candidateCount: document.getElementById("aiPixelPerfectCandidateCount"),
    appliedCount: document.getElementById("aiPixelPerfectAppliedCount"),
    excludedCount: document.getElementById("aiPixelPerfectExcludedCount"),
    skippedCount: document.getElementById("aiPixelPerfectSkippedCount"),
    contextValue: document.getElementById("aiPixelPerfectContextValue"),
    strategyValue: document.getElementById("aiPixelPerfectStrategyValue"),
    aiStatusValue: document.getElementById("aiPixelPerfectAiStatusValue"),
    previewValue: document.getElementById("aiPixelPerfectPreviewValue"),
    changeMeta: document.getElementById("aiPixelPerfectChangeMeta"),
    changeList: document.getElementById("aiPixelPerfectChangeList"),
    button: document.getElementById("aiPixelPerfectButton"),
  };

  if (
    !(elements.panel instanceof HTMLDetailsElement) ||
    !(elements.panelTitle instanceof HTMLElement) ||
    !(elements.panelCopy instanceof HTMLElement) ||
    !(elements.statusPill instanceof HTMLElement) ||
    !(elements.processedAt instanceof HTMLElement) ||
    !(elements.selectionSummary instanceof HTMLElement) ||
    !(elements.selectionNote instanceof HTMLElement) ||
    !(elements.candidateCount instanceof HTMLElement) ||
    !(elements.appliedCount instanceof HTMLElement) ||
    !(elements.excludedCount instanceof HTMLElement) ||
    !(elements.skippedCount instanceof HTMLElement) ||
    !(elements.contextValue instanceof HTMLElement) ||
    !(elements.strategyValue instanceof HTMLElement) ||
    !(elements.aiStatusValue instanceof HTMLElement) ||
    !(elements.previewValue instanceof HTMLElement) ||
    !(elements.changeMeta instanceof HTMLElement) ||
    !(elements.changeList instanceof HTMLElement) ||
    !(elements.button instanceof HTMLButtonElement)
  ) {
    return;
  }

  let isApplying = false;
  let lastRenderedResult = null;

  const requestCachedResult = () => {
    postPluginMessage({ type: "request-ai-pixel-perfect-cache" });
  };

  const readStoredPanelState = () => {
    try {
      return window.localStorage.getItem(PANEL_STATE_KEY) === "true";
    } catch (error) {
      return false;
    }
  };

  const persistPanelState = () => {
    try {
      window.localStorage.setItem(PANEL_STATE_KEY, elements.panel.open ? "true" : "false");
    } catch (error) {}
  };

  const setButtonBusy = (busy) => {
    isApplying = busy;
    elements.button.disabled = busy;
    elements.button.textContent = busy ? "픽셀 교정 중..." : "픽셀 교정";
    elements.button.setAttribute("aria-busy", busy ? "true" : "false");
  };

  const setStatus = (tone, label) => {
    elements.statusPill.dataset.tone = tone;
    elements.statusPill.textContent = label;
    elements.statusPill.classList.toggle("active", tone === "ready" || tone === "running");
  };

  const fillMetric = (element, value) => {
    element.textContent = String(value);
  };

  const formatProcessedAt = (isoString) => {
    if (typeof isoString !== "string" || !isoString) {
      return "마지막 실행 없음";
    }

    const date = new Date(isoString);
    if (!Number.isFinite(date.getTime())) {
      return "마지막 실행 없음";
    }

    return `마지막 실행 ${date.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const truncateText = (value, limit = 96) => {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    if (!normalized) {
      return "";
    }

    return normalized.length > limit ? `${normalized.slice(0, limit - 3)}...` : normalized;
  };

  const renderChangeList = (result) => {
    elements.changeList.replaceChildren();

    const rows = [];
    (Array.isArray(result?.applied) ? result.applied : []).slice(0, 4).forEach((entry) => {
      rows.push({
        title: `적용 · ${entry.field} · ${entry.nodeName}`,
        detail: `${entry.from} -> ${entry.to} · ${entry.source} · ${entry.reason}`,
      });
    });
    (Array.isArray(result?.excluded) ? result.excluded : []).slice(0, 2).forEach((entry) => {
      rows.push({
        title: "예외 유지",
        detail: `${entry.label} · ${entry.reason}`,
      });
    });
    (Array.isArray(result?.skipped) ? result.skipped : []).slice(0, 2).forEach((entry) => {
      rows.push({
        title: "건너뜀",
        detail: `${entry.label} · ${entry.reason}`,
      });
    });

    if (!rows.length) {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const detail = document.createElement("span");
      title.className = "list-title";
      detail.className = "list-detail";
      title.textContent = "결과 대기";
      detail.textContent = "버튼을 실행하면 적용 내역, 0.5 예외 유지 항목, 건너뛴 이유가 여기에 표시됩니다.";
      item.append(title, detail);
      elements.changeList.append(item);
      return;
    }

    rows.forEach((row) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const detail = document.createElement("span");
      title.className = "list-title";
      detail.className = "list-detail";
      title.textContent = row.title;
      detail.textContent = truncateText(row.detail, 120);
      item.append(title, detail);
      elements.changeList.append(item);
    });
  };

  const renderEmptyState = () => {
    lastRenderedResult = null;
    setButtonBusy(false);
    setStatus("idle", "대기");
    elements.panelTitle.textContent = "픽셀 교정 준비";
    elements.panelCopy.textContent =
      "0.5 단위 stroke/blur 예외값은 유지하고, 나머지 소수점 보정 대상은 AI 판독 후 정수 스냅으로 적용합니다.";
    elements.processedAt.textContent = "마지막 실행 없음";
    elements.selectionSummary.textContent = "웹 접근성 진단 이후 결과가 여기에 표시됩니다.";
    elements.selectionNote.textContent =
      "후보를 찾은 뒤 AI가 올림/내림 방향을 판독하고, 적용 불가 항목과 0.5 예외값은 결과 패널에 함께 남깁니다.";
    fillMetric(elements.candidateCount, 0);
    fillMetric(elements.appliedCount, 0);
    fillMetric(elements.excludedCount, 0);
    fillMetric(elements.skippedCount, 0);
    elements.contextValue.textContent = "맥락 대기";
    elements.strategyValue.textContent = "전략 대기";
    elements.aiStatusValue.textContent = "AI 상태 대기";
    elements.previewValue.textContent = "대표 변경 대기";
    elements.changeMeta.textContent = "AI 호출 대기";
    renderChangeList(null);
  };

  const renderErrorState = (message) => {
    setButtonBusy(false);
    setStatus("error", "오류");
    elements.panelTitle.textContent = "픽셀 교정 실패";
    elements.panelCopy.textContent = message || "픽셀 교정에 실패했습니다.";
    elements.selectionSummary.textContent = message || "선택 대상을 확인하고 다시 시도해 주세요.";
    elements.selectionNote.textContent = "선택이 비어 있거나 속성 쓰기가 불가능한 경우 오류가 표시됩니다.";

    if (!lastRenderedResult) {
      fillMetric(elements.candidateCount, 0);
      fillMetric(elements.appliedCount, 0);
      fillMetric(elements.excludedCount, 0);
      fillMetric(elements.skippedCount, 0);
      elements.contextValue.textContent = "재시도 필요";
      elements.strategyValue.textContent = "재시도 필요";
      elements.aiStatusValue.textContent = "AI 재시도 필요";
      elements.previewValue.textContent = "대표 변경 없음";
      elements.changeMeta.textContent = "재시도 필요";
      renderChangeList({
        skipped: [{ label: "실행 실패", reason: message || "선택 대상을 다시 확인해 주세요." }],
      });
    }
  };

  const renderResult = (result, matchesCurrentSelection) => {
    if (!result || typeof result !== "object") {
      renderEmptyState();
      return;
    }

    const summary = result.summary || {};
    const applied = Array.isArray(result.applied) ? result.applied : [];
    const excluded = Array.isArray(result.excluded) ? result.excluded : [];
    const skipped = Array.isArray(result.skipped) ? result.skipped : [];
    const aiStatusLabel = summary.aiStatusLabel || "AI 상태 미확인";
    const aiProviderLabel = summary.aiProviderLabel || "";
    const aiModelLabel = summary.aiModelLabel || "";
    lastRenderedResult = result;
    setButtonBusy(false);
    setStatus(matchesCurrentSelection ? "ready" : "stale", matchesCurrentSelection ? "완료" : "캐시");
    elements.panelTitle.textContent = matchesCurrentSelection ? "픽셀 교정 완료" : "최근 결과 불러옴";
    elements.panelCopy.textContent = matchesCurrentSelection
      ? summary.appliedCount > 0
        ? "소수점 후보를 정수 스냅으로 보정하고, 0.5 예외값은 유지했습니다."
        : summary.candidateCount > 0
          ? "후보는 찾았지만 실제 적용까지 이어진 항목은 없었습니다."
          : "보정이 필요한 소수점 후보를 찾지 못했습니다."
      : "최근 실행한 픽셀 교정 결과를 보여주고 있습니다.";
    elements.processedAt.textContent = formatProcessedAt(result.processedAt);
    elements.selectionSummary.textContent = `${summary.selectionLabel || "선택"} · ${summary.contextLabel || "일반 UI 화면"}`;
    elements.selectionNote.textContent = `후보 ${summary.candidateCount || 0}건 · 적용 ${summary.appliedCount || 0}건 · 예외 유지 ${
      summary.excludedCount || 0
    }건 · 건너뜀 ${summary.skippedCount || 0}건`;
    fillMetric(elements.candidateCount, summary.candidateCount || 0);
    fillMetric(elements.appliedCount, summary.appliedCount || 0);
    fillMetric(elements.excludedCount, summary.excludedCount || 0);
    fillMetric(elements.skippedCount, summary.skippedCount || 0);
    elements.contextValue.textContent = summary.contextLabel || "일반 UI 화면";
    elements.strategyValue.textContent = summary.reviewStrategy || "전략 미확인";
    elements.aiStatusValue.textContent = aiProviderLabel
      ? `${aiStatusLabel} · ${aiProviderLabel}${aiModelLabel ? ` / ${aiModelLabel}` : ""}`
      : aiStatusLabel;
    elements.previewValue.textContent = applied.length
      ? truncateText(`${applied[0].field} ${applied[0].from} -> ${applied[0].to}`, 72)
      : excluded.length
        ? truncateText(excluded[0].label, 72)
        : skipped.length
          ? truncateText(skipped[0].label, 72)
          : "대표 변경 없음";
    elements.changeMeta.textContent = matchesCurrentSelection
      ? `${summary.reviewStrategy || "전략 미확인"} · ${aiStatusLabel}`
      : `최근 캐시 · ${summary.reviewStrategy || "전략 미확인"} · ${aiStatusLabel}`;
    renderChangeList(result);
  };

  elements.button.addEventListener("click", () => {
    if (isApplying) {
      return;
    }

    setButtonBusy(true);
    setStatus("running", "적용 중");
    elements.panelTitle.textContent = "픽셀 교정 진행 중";
    elements.panelCopy.textContent =
      "현재 선택에서 소수점 후보를 찾고, 0.5 stroke/blur 예외값을 제외한 뒤 AI 판독으로 정수 스냅을 적용하고 있습니다.";
    postPluginMessage({ type: "run-ai-pixel-perfect" });
  });

  window.addEventListener("message", (event) => {
    const message = event.data?.pluginMessage;
    if (!message || typeof message !== "object") {
      return;
    }

    if (message.type === "ai-pixel-perfect-cache") {
      if (message.result) {
        renderResult(message.result, message.matchesCurrentSelection === true);
      } else if (!lastRenderedResult) {
        renderEmptyState();
      }
      return;
    }

    if (message.type === "ai-pixel-perfect-status") {
      if (message.status === "running") {
        setStatus("running", "적용 중");
      }
      return;
    }

    if (message.type === "ai-pixel-perfect-result") {
      renderResult(message.result, message.matchesCurrentSelection !== false);
      return;
    }

    if (message.type === "ai-pixel-perfect-error") {
      if (message.matchesCurrentSelection === false) {
        setButtonBusy(false);
        return;
      }
      renderErrorState(message.message);
    }
  });

  elements.panel.open = readStoredPanelState();
  elements.panel.addEventListener("toggle", persistPanelState);
  renderEmptyState();
  requestCachedResult();

  const rootObserver = new MutationObserver(() => {
    if (rootElement.dataset.aiCorrectionTab === "active") {
      requestCachedResult();
    }
  });
  rootObserver.observe(rootElement, {
    attributes: true,
    attributeFilter: ["data-ai-correction-tab"],
  });

  window.__PIGMA_AI_CORRECTION_PIXEL_PERFECT__ = {
    requestCachedResult,
  };
})();

(() => {
  if (window.__PIGMA_AI_CORRECTION_DELETE_HIDDEN_LAYERS__) {
    return;
  }

  const button = document.getElementById("aiDeleteHiddenLayersButton");
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  const defaultLabel = button.textContent || "숨겨진 레이어 삭제";
  const runningLabel = "숨김 정리 중..";
  const postPluginMessage = (message) => {
    parent.postMessage({ pluginMessage: message }, "*");
  };

  let isRunning = false;

  const setButtonBusy = (busy) => {
    isRunning = busy;
    button.disabled = busy;
    button.textContent = busy ? runningLabel : defaultLabel;
    button.setAttribute("aria-busy", busy ? "true" : "false");
  };

  button.addEventListener("click", () => {
    if (isRunning) {
      return;
    }

    setButtonBusy(true);
    postPluginMessage({ type: "run-delete-hidden-layers" });
  });

  window.addEventListener("message", (event) => {
    const message = event.data?.pluginMessage;
    if (!message || typeof message !== "object") {
      return;
    }

    if (message.type === "delete-hidden-layers-status") {
      if (message.status === "running") {
        setButtonBusy(true);
      }
      return;
    }

    if (message.type === "delete-hidden-layers-result" || message.type === "delete-hidden-layers-error") {
      setButtonBusy(false);
    }
  });

  window.__PIGMA_AI_CORRECTION_DELETE_HIDDEN_LAYERS__ = true;
})();
