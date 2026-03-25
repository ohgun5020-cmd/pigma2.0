;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_ACCESSIBILITY_DIAG_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_DESIGN_READ_CACHE_KEY = "pigma:ai-design-read-cache:v1";
  const PATCH_VERSION = 3;
  const ANNOTATION_CATEGORY_LABEL = "웹 접근성 진단";
  const ANNOTATION_CATEGORY_COLOR = "green";
  const ANNOTATION_LABEL_PREFIX = "[웹 접근성 진단]";
  const MAX_ISSUE_COUNT = 24;
  const MIN_TAP_TARGET = 44;
  const CRITICAL_TAP_TARGET = 24;
  const MIN_BODY_FONT_SIZE = 14;
  const MIN_ACTION_FONT_SIZE = 16;
  const NORMAL_TEXT_CONTRAST_RATIO = 4.5;
  const LARGE_TEXT_CONTRAST_RATIO = 3;
  const CRITICAL_NORMAL_TEXT_CONTRAST_RATIO = 2.2;
  const CRITICAL_LARGE_TEXT_CONTRAST_RATIO = 1.8;
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
  const CONTROL_NAME_PATTERN = /(button|btn|cta|chip|tab|pill|toggle|switch|checkbox|radio|link|menu|nav|button|버튼|탭|칩|토글|스위치|체크|링크|메뉴)/i;
  const ACTION_TEXT_PATTERN =
    /^(ok|go|next|done|start|login|sign in|sign up|signup|save|apply|cancel|submit|buy|open|menu|search|confirm|delete|continue|확인|다음|완료|시작|저장|적용|취소|구매|열기|메뉴|검색|삭제|계속)$/i;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isAccessibilityMessage(message)) {
      if (message.type === "request-ai-design-read-cache") {
        await postCachedResult();
        return;
      }

      if (message.type === "run-ai-design-read-apply-fix") {
        await applyIssueFix(message);
        return;
      }

      await runAccessibilityDiagnosis();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_ACCESSIBILITY_DIAG_PATCH__ = true;

  function isAccessibilityMessage(message) {
    return (
      !!message &&
      (message.type === "request-ai-design-read-cache" ||
        message.type === "run-ai-design-read" ||
        message.type === "run-ai-design-read-apply-fix")
    );
  }

  async function runAccessibilityDiagnosis(options) {
    const runOptions = options && typeof options === "object" ? options : {};
    if (!runOptions.skipStatus) {
      postStatus("running", "현재 선택의 웹 접근성을 진단하고 있습니다.");
    }

    try {
      const analysis = analyzeCurrentSelection();
      let result = analysis.result;
      const annotationSupported = Array.isArray(analysis.annotationNodes) && analysis.annotationNodes.length > 0;
      const category =
        annotationSupported && supportsAnnotations(analysis.annotationNodes)
          ? await ensureAnnotationCategory(ANNOTATION_CATEGORY_COLOR)
          : null;
      const annotationResult = category
        ? applyAccessibilityAnnotations(analysis.annotationNodes, result.accessibility.issues, category)
        : buildResultOnlyAnnotation(result.accessibility.issues, "Dev Mode 주석을 사용할 수 없습니다.");

      result.accessibility.annotations = {
        annotationCount: annotationResult.annotationCount || 0,
        annotatedNodeCount: annotationResult.annotatedNodeCount || 0,
        clearedNodeCount: annotationResult.clearedNodeCount || 0,
        removedAnnotationCount: annotationResult.removedAnnotationCount || 0,
        categoryLabel: annotationResult.categoryLabel || ANNOTATION_CATEGORY_LABEL,
        modeLabel: annotationResult.modeLabel || "Result only",
      };
      result.summary.issueCount = result.accessibility.issueCount;
      result.summary.fixableCount = result.accessibility.fixableCount;
      result.summary.annotationCount = result.accessibility.annotations.annotationCount;

      result = await enrichDiagnosisWithAi(result);
      await writeCachedResult(result);

      figma.ui.postMessage({
        type: "ai-design-read-result",
        result,
        matchesCurrentSelection: true,
      });

      if (runOptions.notify !== false) {
        figma.notify(runOptions.notifyMessage || "웹 접근성 진단 완료", { timeout: 1800 });
      }
    } catch (error) {
      const message = normalizeErrorMessage(error, "웹 접근성 진단에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-design-read-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function applyIssueFix(message) {
    const issueId = message && typeof message.issueId === "string" ? message.issueId.trim() : "";
    if (!issueId) {
      throw new Error("적용할 접근성 수정안을 찾지 못했습니다.");
    }

    postStatus("applying-fix", "선택한 접근성 수정안을 적용하고 있습니다.", {
      issueId,
    });

    const cachedResult = await readCachedResult();
    const issues =
      cachedResult && cachedResult.accessibility && Array.isArray(cachedResult.accessibility.issues)
        ? cachedResult.accessibility.issues
        : [];
    const issue = issues.find((entry) => entry && entry.id === issueId);

    if (!issue || !issue.fixPlan) {
      throw new Error("선택한 수정안을 다시 찾지 못했습니다. 웹 접근성 진단을 다시 실행해 주세요.");
    }

    await applyFixPlan(issue.fixPlan);
    figma.notify("접근성 수정 적용 완료", { timeout: 1600 });
    await runAccessibilityDiagnosis({
      skipStatus: true,
      notifyMessage: "접근성 수정 적용 후 재진단 완료",
    });
  }

  async function postCachedResult() {
    const result = await readCachedResult();
    figma.ui.postMessage({
      type: "ai-design-read-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  function postStatus(status, message, extra) {
    const payload = extra && typeof extra === "object" ? extra : {};
    const body = {
      type: "ai-design-read-status",
      status,
      message,
    };
    Object.keys(payload).forEach((key) => {
      body[key] = payload[key];
    });
    figma.ui.postMessage(body);
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
      throw new Error("프레임, 그룹, 레이어를 먼저 선택해 주세요.");
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
    const annotationNodes = [];
    const nodeEntries = [];
    const textEntries = [];
    const solidFillEntries = [];
    const nodeInsights = [];
    let orderCounter = 0;
    let suspiciousCount = 0;
    let fractionalValueCount = 0;
    const typeStats = {
      totalNodes: 0,
      rootCount: selection.length,
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
      stack.push({ node, depth: 1, rootId: node.id });

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
      if (!current || !current.node || !isNodeVisible(current.node)) {
        continue;
      }

      const node = current.node;
      const depth = current.depth;
      const rootId = current.rootId;
      const type = String(node.type || "UNKNOWN");
      const name = safeName(node);
      const bounds = getNodeBounds(node);
      const entry = {
        id: node.id,
        node,
        name,
        type,
        depth,
        rootId,
        order: orderCounter++,
        bounds,
      };

      nodeEntries.push(entry);
      if (supportsAnnotationsOnNode(node)) {
        annotationNodes.push(node);
      }

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

      const solidFill = getFirstVisibleSolidPaint(node.fills);
      if (solidFill && bounds && type !== "TEXT" && solidFill.opacity >= 0.95) {
        solidFillEntries.push(Object.assign({}, entry, {
          paintIndex: solidFill.paintIndex,
          color: cloneColor(solidFill.color),
          opacity: solidFill.opacity,
          hex: solidFill.hex,
        }));
      }

      if (type === "TEXT") {
        collectTextNodeSummary(node, textSamples, scriptCounts, fontFamilyCounts, fontSizeCounts, typeStats);
        const textEntry = buildTextEntry(node, entry);
        if (textEntry) {
          textEntries.push(textEntry);
        }
      }

      if (looksLikeButton(node)) {
        typeStats.buttonLikeCount += 1;
      }

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push({
            node: node.children[index],
            depth: depth + 1,
            rootId,
          });
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
    const topTypes = sortCountEntries(typeCounts)
      .slice(0, 5)
      .map((entry) => ({
        type: entry.key,
        label: formatNodeType(entry.key),
        count: entry.count,
      }));
    const topColors = sortCountEntries(colorCounts)
      .slice(0, 6)
      .map((entry) => ({
        value: entry.key,
        count: entry.count,
      }));
    const topFonts = sortCountEntries(fontFamilyCounts)
      .slice(0, 4)
      .map((entry) => ({
        value: entry.key,
        count: entry.count,
      }));
    const topFontSizes = sortCountEntries(fontSizeCounts)
      .slice(0, 4)
      .map((entry) => ({
        value: entry.key,
        count: entry.count,
      }));

    const accessibility = buildAccessibilitySummary(textEntries, nodeEntries, solidFillEntries);

    if (languageSummary.descriptor) {
      nodeInsights.push(`언어 추정: ${languageSummary.descriptor}`);
    }
    nodeInsights.push(`레이어 ${typeStats.totalNodes}개, 텍스트 ${typeStats.textNodeCount}개, 깊이 ${typeStats.maxDepth}단계`);
    if (contextSummary.label) {
      nodeInsights.push(`맥락 추정: ${contextSummary.label}`);
    }
    if (fractionalNodeIds.size > 0) {
      nodeInsights.push(`픽셀 퍼펙트 후보: ${fractionalNodeIds.size}개 레이어에서 소수점 값 ${fractionalValueCount}건 감지`);
    } else {
      nodeInsights.push("픽셀 퍼펙트 후보: 핵심 좌표/크기 값은 대부분 정수 기준");
    }
    if (suspiciousCount > 0 || duplicateEntries.length > 0) {
      nodeInsights.push(`리네이밍 후보: 기본 이름 ${suspiciousCount}개, 중복 이름 ${duplicateEntries.length}종`);
    }
    if (accessibility.issueCount > 0) {
      nodeInsights.push(
        `접근성 진단: 대비 ${accessibility.contrastIssueCount}건 · 폰트 ${accessibility.fontSizeIssueCount}건 · 터치 ${accessibility.tapTargetIssueCount}건`
      );
      if (accessibility.fixableCount > 0) {
        nodeInsights.push(`즉시 적용 가능: ${accessibility.fixableCount}건`);
      }
    } else {
      nodeInsights.push("접근성 진단: 즉시 수정이 필요한 이슈를 찾지 못했습니다.");
    }

    const result = {
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
        aiStatusLabel: "로컬 휴리스틱",
        aiProviderLabel: "",
        aiModelLabel: "",
        issueCount: accessibility.issueCount,
        fixableCount: accessibility.fixableCount,
        annotationCount: 0,
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
      accessibility,
      insights: nodeInsights.slice(0, 6),
    };

    return {
      result,
      annotationNodes,
    };
  }

  function buildAccessibilitySummary(textEntries, nodeEntries, solidFillEntries) {
    const contrastIssues = analyzeContrastIssues(textEntries, solidFillEntries);
    const fontSizeIssues = analyzeFontSizeIssues(textEntries);
    const tapTargetAnalysis = analyzeTapTargetIssues(nodeEntries);
    const issues = dedupeIssues(contrastIssues.concat(fontSizeIssues, tapTargetAnalysis.issues))
      .sort(compareIssues)
      .slice(0, MAX_ISSUE_COUNT);

    const contrastRatios = contrastIssues
      .map((issue) => issue.currentRatio)
      .filter((value) => typeof value === "number" && Number.isFinite(value));
    const fontSizes = fontSizeIssues
      .map((issue) => issue.currentFontSize)
      .filter((value) => typeof value === "number" && Number.isFinite(value));

    const smallestTapTarget = tapTargetAnalysis.issues.reduce((best, issue) => {
      if (!issue || !issue.currentSize) {
        return best;
      }
      if (!best) {
        return issue.currentSize;
      }
      const bestArea = best.width * best.height;
      const issueArea = issue.currentSize.width * issue.currentSize.height;
      return issueArea < bestArea ? issue.currentSize : best;
    }, null);

    return {
      standardLabel: "WCAG 2.2 AA",
      issueCount: issues.length,
      fixableCount: issues.filter((issue) => issue && issue.canApply).length,
      contrastIssueCount: contrastIssues.length,
      fontSizeIssueCount: fontSizeIssues.length,
      tapTargetIssueCount: tapTargetAnalysis.issues.length,
      minimumContrastRatio: contrastRatios.length
        ? contrastRatios.reduce((smallest, value) => (value < smallest ? value : smallest), contrastRatios[0])
        : null,
      smallestFontSize: fontSizes.length
        ? fontSizes.reduce((smallest, value) => (value < smallest ? value : smallest), fontSizes[0])
        : null,
      smallestTapTargetLabel: smallestTapTarget
        ? `${roundPixel(smallestTapTarget.width)} x ${roundPixel(smallestTapTarget.height)}px`
        : "",
      evaluatedTextCount: textEntries.length,
      tapTargetCandidateCount: tapTargetAnalysis.candidateCount,
      issues,
      annotations: {
        annotationCount: 0,
        annotatedNodeCount: 0,
        clearedNodeCount: 0,
        removedAnnotationCount: 0,
        categoryLabel: ANNOTATION_CATEGORY_LABEL,
        modeLabel: "Result only",
      },
    };
  }

  function analyzeContrastIssues(textEntries, solidFillEntries) {
    const issues = [];
    for (const textEntry of textEntries) {
      if (!textEntry || !textEntry.bounds || !textEntry.fill || textEntry.fill.opacity < 0.95) {
        continue;
      }

      const background = findBackgroundForText(textEntry, solidFillEntries);
      if (!background || background.opacity < 0.95) {
        continue;
      }

      const threshold = getContrastTarget(textEntry);
      const ratio = contrastRatio(textEntry.fill.color, background.color);
      if (!Number.isFinite(ratio) || ratio + 0.01 >= threshold) {
        continue;
      }

      const fixPlan = buildContrastFixPlan(textEntry, background, threshold);
      const suggestion = fixPlan
        ? buildContrastSuggestionText(fixPlan, threshold)
        : "배경색 또는 텍스트 색을 더 선명하게 조정하면 기준에 가까워질 수 있습니다.";

      issues.push({
        id: createIssueId("contrast", textEntry.node.id),
        type: "contrast",
        severity: resolveContrastSeverity(ratio, threshold),
        wcag: threshold >= NORMAL_TEXT_CONTRAST_RATIO ? "WCAG 1.4.3" : "WCAG 1.4.3 (큰 텍스트)",
        nodeId: textEntry.node.id,
        nodeName: textEntry.name,
        nodeType: textEntry.type,
        summary: `명도 대비 ${ratio.toFixed(2)}:1`,
        detail: `현재 텍스트 대비가 권장 기준 ${threshold}:1에 못 미칩니다.`,
        suggestion,
        canApply: !!fixPlan,
        applyLabel: fixPlan ? "제안 적용" : "",
        fixPlan,
        currentRatio: ratio,
        currentSize: null,
        currentFontSize: null,
      });
    }

    return issues;
  }

  function analyzeFontSizeIssues(textEntries) {
    const issues = [];
    for (const textEntry of textEntries) {
      if (!textEntry || typeof textEntry.fontSize !== "number" || !Number.isFinite(textEntry.fontSize)) {
        continue;
      }

      const recommendedSize = textEntry.isActionText ? MIN_ACTION_FONT_SIZE : MIN_BODY_FONT_SIZE;
      if (textEntry.fontSize + 0.01 >= recommendedSize) {
        continue;
      }

      const fixPlan = canAdjustFontSize(textEntry.node)
        ? {
            action: "set-font-size",
            targetNodeId: textEntry.node.id,
            targetFontSize: recommendedSize,
          }
        : null;

      issues.push({
        id: createIssueId("font-size", textEntry.node.id),
        type: "font-size",
        severity: textEntry.fontSize < Math.max(12, recommendedSize - 2) ? "warning" : "info",
        wcag: "가독성 권장",
        nodeId: textEntry.node.id,
        nodeName: textEntry.name,
        nodeType: textEntry.type,
        summary: `폰트 크기 ${roundValue(textEntry.fontSize)}px`,
        detail: textEntry.isActionText
          ? `버튼/액션 텍스트는 ${recommendedSize}px 이상에서 읽기와 탭 정확도가 좋아집니다.`
          : `본문 텍스트는 ${recommendedSize}px 이상에서 읽기 편한 경우가 많습니다.`,
        suggestion: `폰트 크기를 ${recommendedSize}px로 키우면 가독성이 좋아집니다.`,
        canApply: !!fixPlan,
        applyLabel: fixPlan ? "크기 적용" : "",
        fixPlan,
        currentRatio: null,
        currentSize: null,
        currentFontSize: textEntry.fontSize,
      });
    }

    return issues;
  }

  function analyzeTapTargetIssues(nodeEntries) {
    const issues = [];
    const seen = new Set();
    let candidateCount = 0;

    for (const entry of nodeEntries) {
      const candidate = resolveTapTargetCandidate(entry);
      if (!candidate) {
        continue;
      }

      if (seen.has(candidate.id)) {
        continue;
      }
      seen.add(candidate.id);
      candidateCount += 1;

      const bounds = candidate.bounds;
      if (!bounds) {
        continue;
      }

      if (bounds.width + 0.01 >= MIN_TAP_TARGET && bounds.height + 0.01 >= MIN_TAP_TARGET) {
        continue;
      }

      const targetWidth = Math.max(MIN_TAP_TARGET, roundPixel(bounds.width));
      const targetHeight = Math.max(MIN_TAP_TARGET, roundPixel(bounds.height));
      const fixPlan = canResizeNode(candidate.node)
        ? {
            action: "resize-node",
            targetNodeId: candidate.node.id,
            targetWidth,
            targetHeight,
          }
        : null;

      issues.push({
        id: createIssueId("tap-target", candidate.node.id),
        type: "tap-target",
        severity: resolveTapTargetSeverity(bounds),
        wcag: "WCAG 2.5.8",
        nodeId: candidate.node.id,
        nodeName: candidate.name,
        nodeType: candidate.type,
        summary: `터치 영역 ${roundPixel(bounds.width)} x ${roundPixel(bounds.height)}px`,
        detail: "모바일 웹/앱에서 터치 대상은 44 x 44px 이상일 때 누르기 편합니다.",
        suggestion: `터치 영역을 ${targetWidth} x ${targetHeight}px 이상으로 키우면 탭 정확도가 좋아집니다.`,
        canApply: !!fixPlan,
        applyLabel: fixPlan ? "영역 적용" : "",
        fixPlan,
        currentRatio: null,
        currentSize: {
          width: bounds.width,
          height: bounds.height,
        },
        currentFontSize: null,
      });
    }

    return {
      issues,
      candidateCount,
    };
  }

  async function enrichDiagnosisWithAi(localResult) {
    const ai = getAiHelper();
    if (!ai) {
      localResult.summary.aiStatusLabel = "로컬 휴리스틱";
      return localResult;
    }

    let configured = false;
    let runInfo = {
      provider: "",
      model: "",
    };
    try {
      const settings = typeof ai.getAiSettingsAsync === "function" ? await ai.getAiSettingsAsync() : null;
      if (settings && typeof ai.getResolvedRunInfo === "function") {
        runInfo = ai.getResolvedRunInfo(settings);
      }
      configured = await ai.hasConfiguredAiAsync();
    } catch (error) {
      configured = false;
    }

    if (!configured) {
      localResult.summary.aiStatusLabel = "로컬 휴리스틱";
      return localResult;
    }

    localResult.summary.aiStatusLabel = "AI + 로컬";
    localResult.summary.aiProviderLabel = formatProviderLabel(runInfo.provider);
    localResult.summary.aiModelLabel = runInfo.model || "";

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
      accessibility: {
        issueCount: localResult.accessibility ? localResult.accessibility.issueCount : 0,
        contrastIssueCount: localResult.accessibility ? localResult.accessibility.contrastIssueCount : 0,
        fontSizeIssueCount: localResult.accessibility ? localResult.accessibility.fontSizeIssueCount : 0,
        tapTargetIssueCount: localResult.accessibility ? localResult.accessibility.tapTargetIssueCount : 0,
        issues: Array.isArray(localResult.accessibility && localResult.accessibility.issues)
          ? localResult.accessibility.issues.slice(0, 6).map((issue) => ({
              id: issue.id,
              type: issue.type,
              summary: issue.summary,
              detail: issue.detail,
              suggestion: issue.suggestion,
            }))
          : [],
      },
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
        accessibilitySummary: { type: "string" },
        prioritySummary: { type: "string" },
        insights: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: [
        "languageLabel",
        "contextLabel",
        "contextReason",
        "contentSummary",
        "namingSummary",
        "pixelSummary",
        "accessibilitySummary",
        "prioritySummary",
        "insights",
      ],
    };

    try {
      const response = await ai.requestJsonTask({
        instructions:
          "You analyze structured Figma metadata plus accessibility findings for a design correction plugin. Return concise Korean JSON. Keep labels short and practical. Infer the screen context, summarize naming and pixel issues, and explain accessibility priorities without inventing numeric values that are not already in the payload.",
        schema,
        payload,
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
      if (typeof response.accessibilitySummary === "string" && response.accessibilitySummary.trim()) {
        localResult.accessibility.aiSummary = response.accessibilitySummary.trim();
      }
      if (typeof response.prioritySummary === "string" && response.prioritySummary.trim()) {
        localResult.accessibility.prioritySummary = response.prioritySummary.trim();
      }

      localResult.summary.aiProviderLabel = formatProviderLabel(response._provider || runInfo.provider);
      localResult.summary.aiModelLabel = response._model || runInfo.model || "";
      localResult.source = typeof response._provider === "string" ? response._provider : "hybrid-ai";
      localResult.insights = mergeInsights(ai, localResult, response);
    } catch (error) {
      localResult.aiError = normalizeErrorMessage(error, "AI 접근성 요약에 실패했습니다.");
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
    if (typeof response.accessibilitySummary === "string" && response.accessibilitySummary.trim()) {
      aiInsights.push("AI 접근성 요약: " + response.accessibilitySummary.trim());
    }
    if (typeof response.prioritySummary === "string" && response.prioritySummary.trim()) {
      aiInsights.push("우선 순위: " + response.prioritySummary.trim());
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

  async function applyFixPlan(plan) {
    if (!plan || typeof plan !== "object" || typeof plan.action !== "string") {
      throw new Error("적용 가능한 수정안 정보가 없습니다.");
    }

    if (plan.action === "set-solid-fill-color") {
      applySolidFillColorPlan(plan);
      return;
    }
    if (plan.action === "set-font-size") {
      await applyFontSizePlan(plan);
      return;
    }
    if (plan.action === "resize-node") {
      applyResizePlan(plan);
      return;
    }

    throw new Error("아직 지원하지 않는 수정안입니다.");
  }

  function applySolidFillColorPlan(plan) {
    const node = figma.getNodeById(plan.targetNodeId);
    if (!node || !("fills" in node) || !Array.isArray(node.fills)) {
      throw new Error("색상을 변경할 레이어를 찾지 못했습니다.");
    }

    const fills = node.fills.map((paint) => clonePlainObject(paint));
    const index = typeof plan.paintIndex === "number" ? plan.paintIndex : 0;
    const paint = fills[index];
    if (!paint || paint.type !== "SOLID") {
      throw new Error("색상을 적용할 수 있는 SOLID fill이 없습니다.");
    }

    paint.color = cloneColor(plan.color);
    fills[index] = paint;
    node.fills = fills;
  }

  async function applyFontSizePlan(plan) {
    const node = figma.getNodeById(plan.targetNodeId);
    if (!node || node.type !== "TEXT") {
      throw new Error("폰트 크기를 조정할 텍스트 레이어를 찾지 못했습니다.");
    }

    await loadFontsForTextNode(node);
    const targetFontSize = typeof plan.targetFontSize === "number" ? plan.targetFontSize : null;
    if (!targetFontSize || !Number.isFinite(targetFontSize)) {
      throw new Error("적용할 폰트 크기 값이 올바르지 않습니다.");
    }

    if (typeof node.fontSize === "number" && node.fontSize !== figma.mixed) {
      node.fontSize = targetFontSize;
      return;
    }

    if (typeof node.setRangeFontSize === "function" && typeof node.characters === "string") {
      node.setRangeFontSize(0, node.characters.length, targetFontSize);
      return;
    }

    throw new Error("이 텍스트 레이어는 폰트 크기를 직접 조정할 수 없습니다.");
  }

  function applyResizePlan(plan) {
    const node = figma.getNodeById(plan.targetNodeId);
    if (!node || !canResizeNode(node)) {
      throw new Error("터치 영역을 조정할 레이어를 찾지 못했습니다.");
    }

    const width = Math.max(1, Number(plan.targetWidth) || 0);
    const height = Math.max(1, Number(plan.targetHeight) || 0);
    if (typeof node.resizeWithoutConstraints === "function") {
      node.resizeWithoutConstraints(width, height);
      return;
    }
    if (typeof node.resize === "function") {
      node.resize(width, height);
      return;
    }

    throw new Error("이 레이어는 크기 조정을 지원하지 않습니다.");
  }

  function supportsAnnotations(nodes) {
    const sampleNode = Array.isArray(nodes) && nodes.length > 0 ? nodes[0] : null;
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

  function applyAccessibilityAnnotations(nodes, issues, category) {
    const issuesByNode = new Map();
    const skipped = [];
    let annotationCount = 0;
    let annotatedNodeCount = 0;
    let clearedNodeCount = 0;
    let removedAnnotationCount = 0;

    for (const issue of issues) {
      const bucket = issuesByNode.get(issue.nodeId) || [];
      bucket.push(issue);
      issuesByNode.set(issue.nodeId, bucket);
    }

    for (const node of nodes) {
      const nodeIssues = issuesByNode.get(node.id) || [];
      try {
        const existing = Array.isArray(node.annotations) ? Array.from(node.annotations) : [];
        const preserved = existing.filter((annotation) => !isManagedAccessibilityAnnotation(annotation, category));
        const removedCount = Math.max(0, existing.length - preserved.length);

        if (removedCount > 0) {
          removedAnnotationCount += removedCount;
        }
        if (removedCount > 0 && nodeIssues.length === 0) {
          clearedNodeCount += 1;
        }

        node.annotations = preserved.concat(nodeIssues.map((issue) => buildAccessibilityAnnotation(issue, category)));
        if (nodeIssues.length > 0) {
          annotatedNodeCount += 1;
          annotationCount += nodeIssues.length;
        }
      } catch (error) {
        if (nodeIssues.length > 0) {
          skipped.push({
            label: safeName(node),
            reason: normalizeErrorMessage(error, "접근성 주석을 남기지 못했습니다."),
          });
        }
      }
    }

    return {
      skipped,
      annotationCount,
      annotatedNodeCount,
      clearedNodeCount,
      removedAnnotationCount,
      modeLabel: annotationCount > 0 ? "Green Dev Mode annotation" : "Result only",
      categoryLabel: category && category.label ? category.label : ANNOTATION_CATEGORY_LABEL,
    };
  }

  function buildAccessibilityAnnotation(issue, category) {
    const lines = [`[중요도 : ${getIssuePriorityLabel(issue)}]`];
    if (issue.summary) {
      lines.push(`- ${issue.summary}`);
    }
    if (issue.suggestion) {
      lines.push(`- ${issue.suggestion}`);
    }

    const annotation = {
      label: lines.join("\n"),
    };
    if (category && category.id) {
      annotation.categoryId = category.id;
    }
    return annotation;
  }

  function getIssuePriorityLabel(issue) {
    const severity = issue && typeof issue.severity === "string" ? issue.severity : "info";
    if (severity === "error") {
      return "상";
    }
    if (severity === "warning") {
      return "중";
    }
    return "하";
  }

  function isManagedAccessibilityAnnotation(annotation, category) {
    if (!annotation || typeof annotation !== "object") {
      return false;
    }

    if (category && category.id && annotation.categoryId === category.id) {
      return true;
    }

    const label =
      typeof annotation.label === "string" ? annotation.label : typeof annotation.labelMarkdown === "string" ? annotation.labelMarkdown : "";
    return typeof label === "string" && (label.startsWith(ANNOTATION_LABEL_PREFIX) || label.startsWith(`[${ANNOTATION_LABEL_PREFIX}]`));
  }

  function buildResultOnlyAnnotation(issues, reason) {
    const skipped = [];
    if (Array.isArray(issues) && issues.length > 0 && reason) {
      skipped.push({
        label: "주석 미적용",
        reason,
      });
    }

    return {
      skipped,
      annotationCount: 0,
      annotatedNodeCount: 0,
      clearedNodeCount: 0,
      removedAnnotationCount: 0,
      modeLabel: "Result only",
      categoryLabel: ANNOTATION_CATEGORY_LABEL,
    };
  }

  function getAiHelper() {
    const helper = globalScope.__PIGMA_AI_LLM__;
    return helper &&
      typeof helper.requestJsonTask === "function" &&
      typeof helper.hasConfiguredAiAsync === "function" &&
      typeof helper.uniqueStrings === "function"
      ? helper
      : null;
  }

  function buildTextEntry(node, entry) {
    const bounds = entry.bounds;
    if (!bounds) {
      return null;
    }

    const fill = getFirstVisibleSolidPaint(node.fills);
    const textValue = getTextValue(node);
    const fontSize = typeof node.fontSize === "number" && Number.isFinite(node.fontSize) ? node.fontSize : null;
    const fontWeight = getFontWeight(node);
    return Object.assign({}, entry, {
      text: textValue,
      fill,
      fontSize,
      fontWeight,
      isActionText: looksLikeActionText(textValue) || looksLikeButton(node),
    });
  }

  function getTextValue(node) {
    const value = typeof node.characters === "string" ? node.characters.replace(/\s+/g, " ").trim() : "";
    return value || safeName(node);
  }

  function getFontWeight(node) {
    if (typeof node.fontWeight === "number" && Number.isFinite(node.fontWeight)) {
      return node.fontWeight;
    }
    if (node.fontName && node.fontName !== figma.mixed && typeof node.fontName === "object") {
      return fontWeightFromStyle(node.fontName.style);
    }
    return 400;
  }

  function fontWeightFromStyle(style) {
    const value = String(style || "").toLowerCase();
    if (/black|heavy|extrabold|extra bold|bold/.test(value)) {
      return 700;
    }
    if (/semibold|semi bold|demi/.test(value)) {
      return 600;
    }
    if (/medium/.test(value)) {
      return 500;
    }
    return 400;
  }

  function getContrastTarget(textEntry) {
    const fontSize = typeof textEntry.fontSize === "number" ? textEntry.fontSize : 0;
    const fontWeight = typeof textEntry.fontWeight === "number" ? textEntry.fontWeight : 400;
    return fontSize >= 24 || (fontSize >= 18.5 && fontWeight >= 700)
      ? LARGE_TEXT_CONTRAST_RATIO
      : NORMAL_TEXT_CONTRAST_RATIO;
  }

  function resolveTapTargetCandidate(entry) {
    if (!entry || !entry.node || !entry.bounds) {
      return null;
    }

    if (entry.type === "PAGE" || entry.type === "SECTION" || entry.type === "COMPONENT_SET") {
      return null;
    }

    if (entry.type === "TEXT") {
      const textValue = getTextValue(entry.node);
      if (!looksLikeActionText(textValue)) {
        return null;
      }

      const parent = entry.node.parent;
      if (!parent || parent.type === "PAGE" || parent.type === "SECTION") {
        return null;
      }

      const parentBounds = getNodeBounds(parent);
      if (!parentBounds) {
        return null;
      }

      return {
        id: parent.id,
        node: parent,
        name: safeName(parent),
        type: String(parent.type || "UNKNOWN"),
        bounds: parentBounds,
      };
    }

    const bounds = entry.bounds;
    if (bounds.width > 360 || bounds.height > 160) {
      return null;
    }

    if (hasReactions(entry.node)) {
      return entry;
    }

    const name = safeName(entry.node);
    if (CONTROL_NAME_PATTERN.test(name)) {
      return entry;
    }

    const textValue = truncateText(collectNodeTexts(entry.node, 2, 2).join(" "), 36);
    if (looksLikeActionText(textValue) && (hasVisibleFillOrStroke(entry.node) || hasCornerRadius(entry.node) || hasLayout(entry.node))) {
      return entry;
    }

    return null;
  }

  function findBackgroundForText(textEntry, solidFillEntries) {
    let current = textEntry.node.parent;
    while (current && current.type !== "PAGE") {
      const bounds = getNodeBounds(current);
      const fill = getFirstVisibleSolidPaint(current.fills);
      if (bounds && fill && fill.opacity >= 0.95 && containsBounds(bounds, textEntry.bounds)) {
        return {
          node: current,
          name: safeName(current),
          type: String(current.type || "UNKNOWN"),
          bounds,
          color: cloneColor(fill.color),
          opacity: fill.opacity,
          paintIndex: fill.paintIndex,
          hex: fill.hex,
        };
      }
      current = current.parent;
    }

    let best = null;
    for (const entry of solidFillEntries) {
      if (!entry || entry.rootId !== textEntry.rootId || entry.id === textEntry.id) {
        continue;
      }
      if (entry.order >= textEntry.order || !entry.bounds) {
        continue;
      }

      const contains = containsBounds(entry.bounds, textEntry.bounds);
      const overlapRatio = overlapArea(entry.bounds, textEntry.bounds) / Math.max(1, textEntry.bounds.width * textEntry.bounds.height);
      if (!contains && overlapRatio < 0.6) {
        continue;
      }

      if (!best) {
        best = { entry, contains };
        continue;
      }

      const currentArea = entry.bounds.width * entry.bounds.height;
      const bestArea = best.entry.bounds.width * best.entry.bounds.height;
      if (contains && !best.contains) {
        best = { entry, contains };
        continue;
      }
      if (contains === best.contains && currentArea < bestArea) {
        best = { entry, contains };
      }
    }

    return best
      ? {
          node: best.entry.node,
          name: best.entry.name,
          type: best.entry.type,
          bounds: best.entry.bounds,
          color: cloneColor(best.entry.color),
          opacity: best.entry.opacity,
          paintIndex: best.entry.paintIndex,
          hex: best.entry.hex,
        }
      : null;
  }

  function buildContrastFixPlan(textEntry, background, threshold) {
    const candidates = [];
    if (textEntry.fill && canEditSolidPaint(textEntry.node, textEntry.fill.paintIndex)) {
      const color = findAccessibleReplacement(background.color, textEntry.fill.color, threshold);
      if (color) {
        candidates.push({
          action: "set-solid-fill-color",
          targetNodeId: textEntry.node.id,
          paintIndex: textEntry.fill.paintIndex,
          color,
          colorHex: rgbToHex(color),
          targetLabel: "텍스트 색상",
          previewRatio: contrastRatio(color, background.color),
        });
      }
    }

    if (background && canEditSolidPaint(background.node, background.paintIndex)) {
      const color = findAccessibleReplacement(textEntry.fill.color, background.color, threshold);
      if (color) {
        candidates.push({
          action: "set-solid-fill-color",
          targetNodeId: background.node.id,
          paintIndex: background.paintIndex,
          color,
          colorHex: rgbToHex(color),
          targetLabel: "배경색",
          previewRatio: contrastRatio(textEntry.fill.color, color),
        });
      }
    }

    if (!candidates.length) {
      return null;
    }

    candidates.sort((left, right) => {
      const leftBase = left.targetLabel === "배경색" ? background.color : textEntry.fill.color;
      const rightBase = right.targetLabel === "배경색" ? background.color : textEntry.fill.color;
      const leftDistance = colorDistance(left.color, leftBase);
      const rightDistance = colorDistance(right.color, rightBase);
      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
      if (left.targetLabel === "배경색" && right.targetLabel !== "배경색") {
        return -1;
      }
      if (left.targetLabel !== "배경색" && right.targetLabel === "배경색") {
        return 1;
      }
      return 0;
    });

    return candidates[0];
  }

  function buildContrastSuggestionText(fixPlan, threshold) {
    const ratioText =
      typeof fixPlan.previewRatio === "number" && Number.isFinite(fixPlan.previewRatio)
        ? ` (${fixPlan.previewRatio.toFixed(2)}:1)`
        : "";
    return `${fixPlan.targetLabel}을 ${fixPlan.colorHex}로 변경하면 명도 대비 ${threshold}:1 기준을 통과할 수 있습니다${ratioText}.`;
  }

  function dedupeIssues(issues) {
    const map = new Map();
    for (const issue of issues) {
      if (!issue || !issue.id || map.has(issue.id)) {
        continue;
      }
      map.set(issue.id, issue);
    }
    return Array.from(map.values());
  }

  function compareIssues(left, right) {
    const severityOrder = {
      error: 0,
      warning: 1,
      info: 2,
    };
    const leftSeverityKey = left && left.severity ? left.severity : "info";
    const rightSeverityKey = right && right.severity ? right.severity : "info";
    const leftSeverityValue = severityOrder[leftSeverityKey];
    const rightSeverityValue = severityOrder[rightSeverityKey];
    const leftSeverity = typeof leftSeverityValue === "number" ? leftSeverityValue : 3;
    const rightSeverity = typeof rightSeverityValue === "number" ? rightSeverityValue : 3;
    if (leftSeverity !== rightSeverity) {
      return leftSeverity - rightSeverity;
    }
    return String(left.summary || "").localeCompare(String(right.summary || ""));
  }

  function resolveContrastSeverity(ratio, threshold) {
    if (!Number.isFinite(ratio)) {
      return "warning";
    }

    const criticalThreshold =
      threshold >= NORMAL_TEXT_CONTRAST_RATIO ? CRITICAL_NORMAL_TEXT_CONTRAST_RATIO : CRITICAL_LARGE_TEXT_CONTRAST_RATIO;
    return ratio <= criticalThreshold ? "error" : "warning";
  }

  function resolveTapTargetSeverity(bounds) {
    if (!bounds) {
      return "warning";
    }

    return bounds.width < CRITICAL_TAP_TARGET || bounds.height < CRITICAL_TAP_TARGET ? "error" : "warning";
  }

  function findAccessibleReplacement(fixedColor, currentColor, threshold) {
    if (contrastRatio(fixedColor, currentColor) >= threshold) {
      return cloneColor(currentColor);
    }

    const endpoints = [
      { r: 0, g: 0, b: 0 },
      { r: 1, g: 1, b: 1 },
    ];
    const candidates = [];

    for (const endpoint of endpoints) {
      if (contrastRatio(fixedColor, endpoint) + 0.0001 < threshold) {
        continue;
      }

      let low = 0;
      let high = 1;
      for (let index = 0; index < 24; index += 1) {
        const mid = (low + high) / 2;
        const candidate = mixColors(currentColor, endpoint, mid);
        if (contrastRatio(fixedColor, candidate) >= threshold) {
          high = mid;
        } else {
          low = mid;
        }
      }
      candidates.push(mixColors(currentColor, endpoint, high));
    }

    if (!candidates.length) {
      return null;
    }

    candidates.sort((left, right) => colorDistance(left, currentColor) - colorDistance(right, currentColor));
    return candidates[0];
  }

  function contrastRatio(left, right) {
    const leftL = relativeLuminance(left);
    const rightL = relativeLuminance(right);
    const lighter = Math.max(leftL, rightL);
    const darker = Math.min(leftL, rightL);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function relativeLuminance(color) {
    const toLinear = (value) => {
      const channel = Math.max(0, Math.min(1, Number(value) || 0));
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    };
    const red = toLinear(color.r);
    const green = toLinear(color.g);
    const blue = toLinear(color.b);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  }

  function mixColors(source, target, amount) {
    const ratio = Math.max(0, Math.min(1, amount));
    return {
      r: source.r + (target.r - source.r) * ratio,
      g: source.g + (target.g - source.g) * ratio,
      b: source.b + (target.b - source.b) * ratio,
    };
  }

  function colorDistance(left, right) {
    const red = left.r - right.r;
    const green = left.g - right.g;
    const blue = left.b - right.b;
    return Math.sqrt(red * red + green * green + blue * blue);
  }

  function supportsAnnotationsOnNode(node) {
    return !!node && "annotations" in node;
  }

  function canEditSolidPaint(node, paintIndex) {
    return !!node && "fills" in node && Array.isArray(node.fills) && typeof paintIndex === "number" && paintIndex >= 0;
  }

  function canAdjustFontSize(node) {
    return !!node && node.type === "TEXT";
  }

  function canResizeNode(node) {
    if (!node) {
      return false;
    }
    if (node.type === "GROUP" || node.type === "TEXT" || node.type === "LINE") {
      return false;
    }
    return typeof node.resizeWithoutConstraints === "function" || typeof node.resize === "function";
  }

  function hasVisibleFillOrStroke(node) {
    return hasVisibleSolidPaint(node.fills) || hasVisibleSolidPaint(node.strokes);
  }

  function hasVisibleSolidPaint(paints) {
    return !!getFirstVisibleSolidPaint(paints);
  }

  function hasCornerRadius(node) {
    const fields = [
      node.cornerRadius,
      node.topLeftRadius,
      node.topRightRadius,
      node.bottomRightRadius,
      node.bottomLeftRadius,
    ];
    return fields.some((value) => typeof value === "number" && Number.isFinite(value) && value > 0);
  }

  function hasLayout(node) {
    return !!node && typeof node.layoutMode === "string" && node.layoutMode !== "NONE";
  }

  function hasReactions(node) {
    return !!node && Array.isArray(node.reactions) && node.reactions.length > 0;
  }

  function looksLikeActionText(value) {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    if (!normalized || normalized.length > 24) {
      return false;
    }
    return ACTION_TEXT_PATTERN.test(normalized.toLowerCase());
  }

  function collectNodeTexts(node, limit, depth) {
    const texts = [];
    const maxCount = typeof limit === "number" ? limit : 2;
    const maxDepth = typeof depth === "number" ? depth : 2;

    const walk = (current, currentDepth) => {
      if (!current || texts.length >= maxCount || currentDepth > maxDepth) {
        return;
      }
      if (current.type === "TEXT") {
        const value = getTextValue(current);
        if (value) {
          texts.push(value);
        }
        return;
      }
      if (!hasChildren(current)) {
        return;
      }
      for (const child of current.children) {
        if (texts.length >= maxCount) {
          break;
        }
        walk(child, currentDepth + 1);
      }
    };

    walk(node, 0);
    return texts;
  }

  function truncateText(value, limit) {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    const maxLength = typeof limit === "number" ? limit : 48;
    if (!normalized) {
      return "";
    }
    return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3)}...` : normalized;
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
      } else if ((codePoint >= 0x0041 && codePoint <= 0x005a) || (codePoint >= 0x0061 && codePoint <= 0x007a)) {
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

  function inferDesignContext(options) {
    const corpus = `${options.rootNames.join(" ")} ${options.textSamples.join(" ")}`.toLowerCase();
    const categories = [
      { label: "인증/폼 화면", reason: "로그인, 가입, 입력, 확인 계열 텍스트 신호가 많습니다.", keywords: ["login", "sign in", "sign up", "email", "password", "submit", "continue", "로그인", "회원가입", "이메일", "비밀번호", "입력", "제출", "확인", "인증"] },
      { label: "대시보드/데이터 화면", reason: "지표, 표, 차트 계열 레이어와 숫자 중심 텍스트가 보입니다.", keywords: ["dashboard", "analytics", "chart", "table", "report", "metric", "stats", "data", "대시보드", "분석", "차트", "테이블", "리포트", "지표", "매출"] },
      { label: "랜딩/프로모션 화면", reason: "짧은 CTA 문구와 버튼형 신호가 많아 홍보형 화면으로 보입니다.", keywords: ["get started", "learn more", "shop", "book", "download", "discover", "contact", "지금", "시작", "구매", "예약", "자세히", "다운로드", "문의"] },
      { label: "모달/다이얼로그", reason: "선택 범위가 상대적으로 작고 확인/취소 계열 문구가 보입니다.", keywords: ["cancel", "confirm", "delete", "ok", "취소", "삭제", "닫기", "확인"] },
      { label: "앱/웹 내비게이션 화면", reason: "메뉴, 설정, 홈, 프로필 등 탐색성 텍스트가 많습니다.", keywords: ["home", "profile", "settings", "menu", "search", "notification", "홈", "프로필", "설정", "메뉴", "검색", "알림"] },
    ];

    let best = null;
    for (const category of categories) {
      let score = 0;
      for (const keyword of category.keywords) {
        if (corpus.includes(keyword)) {
          score += 1;
        }
      }
      if (category.label === "랜딩/프로모션 화면" && options.typeStats.buttonLikeCount >= 2) {
        score += 1;
      }
      if (category.label === "모달/다이얼로그" && options.selectionBounds && options.selectionBounds.width <= 720) {
        score += 1;
      }
      if (category.label === "대시보드/데이터 화면" && options.typeStats.textNodeCount >= 8) {
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
    if (options.typeStats.componentCount + options.typeStats.instanceCount >= Math.max(2, options.typeStats.rootCount || 1)) {
      return {
        label: "컴포넌트/변형 세트",
        reason: "컴포넌트와 인스턴스 비중이 높습니다.",
        score: 0,
      };
    }
    if (options.topTypes.length > 0) {
      return {
        label: "일반 UI 화면",
        reason: `${formatNodeType(options.topTypes[0].key || options.topTypes[0].type)} 중심 구조입니다.`,
        score: 0,
      };
    }
    return {
      label: "일반 선택 영역",
      reason: "구조 분석은 가능하지만 특정 화면 맥락 신호는 약합니다.",
      score: 0,
    };
  }

  function getFirstVisibleSolidPaint(paints) {
    if (!Array.isArray(paints)) {
      return null;
    }
    for (let index = 0; index < paints.length; index += 1) {
      const paint = paints[index];
      if (!paint || paint.visible === false || paint.type !== "SOLID" || !paint.color) {
        continue;
      }
      return {
        paintIndex: index,
        color: cloneColor(paint.color),
        opacity: typeof paint.opacity === "number" && Number.isFinite(paint.opacity) ? paint.opacity : 1,
        hex: rgbToHex(paint.color),
      };
    }
    return null;
  }

  function looksLikeButton(node) {
    const name = safeName(node).toLowerCase();
    if (CONTROL_NAME_PATTERN.test(name)) {
      return true;
    }
    if (node.type === "TEXT" && typeof node.characters === "string") {
      return looksLikeActionText(node.characters);
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

  function overlapArea(left, right) {
    const overlapWidth = Math.max(0, Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x));
    const overlapHeight = Math.max(0, Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y));
    return overlapWidth * overlapHeight;
  }

  function containsBounds(outer, inner) {
    return (
      outer.x <= inner.x + 0.5 &&
      outer.y <= inner.y + 0.5 &&
      outer.x + outer.width >= inner.x + inner.width - 0.5 &&
      outer.y + outer.height >= inner.y + inner.height - 0.5
    );
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

  function isNodeVisible(node) {
    return !!node && node.visible !== false;
  }

  function cloneColor(color) {
    return {
      r: Number(color.r) || 0,
      g: Number(color.g) || 0,
      b: Number(color.b) || 0,
    };
  }

  function clonePlainObject(value) {
    if (!value || typeof value !== "object") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((item) => clonePlainObject(item));
    }
    const clone = {};
    Object.keys(value).forEach((key) => {
      clone[key] = clonePlainObject(value[key]);
    });
    return clone;
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

  function createIssueId(type, nodeId) {
    return `${type}:${nodeId}`;
  }

  function formatProviderLabel(provider) {
    switch (String(provider || "").toLowerCase()) {
      case "openai":
        return "OpenAI";
      case "gemini":
        return "Gemini";
      default:
        return provider ? String(provider) : "";
    }
  }

  function normalizeErrorMessage(error, fallback) {
    if (error instanceof Error && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }
    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }
    return fallback;
  }
})();
