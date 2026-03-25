;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_DESIGN_CONSISTENCY_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  if (typeof originalOnMessage !== "function") {
    return;
  }

  const AI_DESIGN_CONSISTENCY_CACHE_KEY = "pigma:ai-design-consistency-cache:v1";
  const AI_DESIGN_READ_CACHE_KEY = "pigma:ai-design-read-cache:v1";
  const PATCH_VERSION = 1;
  const ANNOTATION_CATEGORY_LABEL = "디자인 일관성";
  const ANNOTATION_CATEGORY_COLOR = "blue";
  const ANNOTATION_LABEL_PREFIX = "[디자인 일관성]";
  const ACCESSIBILITY_ANNOTATION_CATEGORY_LABEL = "웹 접근성 진단";
  const ACCESSIBILITY_ANNOTATION_LABEL_PREFIX = "[웹 접근성 진단]";
  const DIAGNOSIS_CLEAR_CATEGORY_LABEL = "웹 접근성 진단 + 디자인 일관성";
  const MAX_ISSUE_COUNT = 24;
  const COLOR_DISTANCE_THRESHOLD = 0.11;
  const COLOR_TOKEN_LIMIT = 6;
  const FONT_SIZE_TOKEN_LIMIT = 6;
  const SPACING_TOKEN_LIMIT = 6;
  const MIN_TOKEN_COUNT = 2;
  const PALETTE_ROLES = {
    fills: "배경",
    strokes: "보더",
    text: "텍스트",
  };

  figma.ui.onmessage = async (message) => {
    if (isConsistencyMessage(message)) {
      if (message.type === "request-ai-design-consistency-cache") {
        await postCachedResult();
        return;
      }

      if (message.type === "run-ai-design-consistency-clear") {
        await runDesignConsistencyClear();
        return;
      }

      if (message.type === "run-ai-design-consistency-apply-fix") {
        await applyIssueFix(message);
        return;
      }

      await runDesignConsistencyDiagnosis();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_DESIGN_CONSISTENCY_PATCH__ = true;

  function isConsistencyMessage(message) {
    return (
      !!message &&
      (message.type === "request-ai-design-consistency-cache" ||
        message.type === "run-ai-design-consistency" ||
        message.type === "run-ai-design-consistency-clear" ||
        message.type === "run-ai-design-consistency-apply-fix")
    );
  }

  async function runDesignConsistencyDiagnosis(options) {
    const runOptions = options && typeof options === "object" ? options : {};
    if (!runOptions.skipStatus) {
      postStatus("running", "현재 선택을 기준으로 디자인 일관성을 검사하고 있습니다.");
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
        ? applyConsistencyAnnotations(analysis.annotationNodes, result.consistency.issues, category)
        : buildResultOnlyAnnotation(result.consistency.issues, "Dev Mode 주석을 지원하지 않는 선택입니다.");

      result.consistency.annotations = {
        annotationCount: annotationResult.annotationCount || 0,
        annotatedNodeCount: annotationResult.annotatedNodeCount || 0,
        clearedNodeCount: annotationResult.clearedNodeCount || 0,
        removedAnnotationCount: annotationResult.removedAnnotationCount || 0,
        categoryLabel: annotationResult.categoryLabel || ANNOTATION_CATEGORY_LABEL,
        modeLabel: annotationResult.modeLabel || "Result only",
      };
      result.summary.issueCount = result.consistency.issueCount;
      result.summary.fixableCount = result.consistency.fixableCount;
      result.summary.annotationCount = result.consistency.annotations.annotationCount;

      result = await enrichConsistencyWithAi(result);
      await writeCachedResult(result);

      figma.ui.postMessage({
        type: "ai-design-consistency-result",
        result,
        matchesCurrentSelection: true,
      });

      if (runOptions.notify !== false) {
        figma.notify(runOptions.notifyMessage || "디자인 일관성 진단 완료", { timeout: 1800 });
      }
    } catch (error) {
      const message = normalizeErrorMessage(error, "디자인 일관성 진단에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-design-consistency-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function applyIssueFix(message) {
    const issueId = message && typeof message.issueId === "string" ? message.issueId.trim() : "";
    if (!issueId) {
      throw new Error("적용할 디자인 일관성 제안을 찾지 못했습니다.");
    }

    postStatus("applying-fix", "선택한 일관성 제안을 적용하고 있습니다.", {
      issueId,
    });

    const cachedResult = await readCachedResult();
    const issues =
      cachedResult && cachedResult.consistency && Array.isArray(cachedResult.consistency.issues)
        ? cachedResult.consistency.issues
        : [];
    const issue = issues.find((entry) => entry && entry.id === issueId);

    if (!issue || !issue.fixPlan) {
      throw new Error("선택한 제안을 다시 찾지 못했습니다. 디자인 일관성 진단을 다시 실행해 주세요.");
    }

    await applyFixPlan(issue.fixPlan);
    figma.notify("디자인 일관성 제안 적용 완료", { timeout: 1600 });
    await runDesignConsistencyDiagnosis({
      skipStatus: true,
      notifyMessage: "제안 적용 후 디자인 일관성을 다시 확인했습니다.",
    });
  }

  async function runDesignConsistencyClear() {
    postStatus("clearing-annotations", "현재 선택 범위에 남아 있는 웹 접근성 진단과 디자인 일관성 Dev Mode 주석을 정리하고 있습니다.");

    try {
      const analysis = analyzeCurrentSelection();
      const managedCategories =
        Array.isArray(analysis.annotationNodes) && analysis.annotationNodes.length > 0
          ? await getManagedDiagnosisCategories()
          : { consistency: null, accessibility: null };
      const cleared = removeDiagnosisAnnotations(analysis.annotationNodes, managedCategories);
      const result = buildConsistencyClearResult(analysis.result, cleared, managedCategories);
      await syncDiagnosisCachesAfterClear(result.selectionSignature, result.summary);

      figma.ui.postMessage({
        type: "ai-design-consistency-clear-result",
        result,
        matchesCurrentSelection: true,
      });

      if ((result.summary.removedAnnotationCount || 0) > 0) {
        figma.notify(`디자인 진단 주석 정리 완료 (${result.summary.removedAnnotationCount || 0}건 제거)`, {
          timeout: 2200,
        });
      } else {
        figma.notify("현재 선택 범위에서 삭제할 디자인 진단 주석을 찾지 못했습니다.", { timeout: 1800 });
      }
    } catch (error) {
      const message = normalizeErrorMessage(error, "디자인 진단 주석 정리에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-design-consistency-clear-error",
        message,
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function postCachedResult() {
    const result = await readCachedResult();
    figma.ui.postMessage({
      type: "ai-design-consistency-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  function postStatus(status, message, extra) {
    const payload = extra && typeof extra === "object" ? extra : {};
    const body = {
      type: "ai-design-consistency-status",
      status,
      message,
    };
    Object.keys(payload).forEach((key) => {
      body[key] = payload[key];
    });
    figma.ui.postMessage(body);
  }

  function buildConsistencyClearResult(baseResult, cleared, managedCategories) {
    const result = baseResult && typeof baseResult === "object" ? baseResult : {};
    const summary = result.summary && typeof result.summary === "object" ? result.summary : {};
    const stats = result.stats && typeof result.stats === "object" ? result.stats : {};
    const clearedResult = cleared && typeof cleared === "object" ? cleared : {};
    const clearedItems = Array.isArray(clearedResult.cleared) ? clearedResult.cleared : [];
    const skipped = Array.isArray(clearedResult.skipped) ? clearedResult.skipped : [];
    const categories = managedCategories && typeof managedCategories === "object" ? managedCategories : {};
    const categoryLabels = [];

    if ((clearedResult.removedAccessibilityAnnotationCount || 0) > 0 || categories.accessibility) {
      categoryLabels.push(ACCESSIBILITY_ANNOTATION_CATEGORY_LABEL);
    }
    if ((clearedResult.removedConsistencyAnnotationCount || 0) > 0 || categories.consistency) {
      categoryLabels.push(ANNOTATION_CATEGORY_LABEL);
    }

    return {
      version: PATCH_VERSION,
      source: "managed-annotation-clear",
      selectionSignature: result.selectionSignature || getSelectionSignature(figma.currentPage.selection),
      analyzedAt: new Date().toISOString(),
      selectionBounds: result.selectionBounds || null,
      summary: {
        selectionLabel: summary.selectionLabel || "?좏깮",
        contextLabel: summary.contextLabel || "?쇰컲 UI ?붾㈃",
        aiStatusLabel: "주석 정리",
        aiProviderLabel: "",
        aiModelLabel: "",
        removedAnnotationCount: clearedResult.removedAnnotationCount || 0,
        removedAccessibilityAnnotationCount: clearedResult.removedAccessibilityAnnotationCount || 0,
        removedConsistencyAnnotationCount: clearedResult.removedConsistencyAnnotationCount || 0,
        clearedNodeCount: clearedResult.clearedNodeCount || 0,
        skippedCount: skipped.length,
        categoryLabel: categoryLabels.length ? categoryLabels.join(" + ") : DIAGNOSIS_CLEAR_CATEGORY_LABEL,
        mode: "annotation-clear",
        modeLabel: "Green/Blue Dev Mode annotation clear",
      },
      stats: {
        totalNodes: typeof stats.totalNodes === "number" && Number.isFinite(stats.totalNodes) ? stats.totalNodes : 0,
        textNodeCount: typeof stats.textNodeCount === "number" && Number.isFinite(stats.textNodeCount) ? stats.textNodeCount : 0,
        autoLayoutCount:
          typeof stats.autoLayoutCount === "number" && Number.isFinite(stats.autoLayoutCount) ? stats.autoLayoutCount : 0,
      },
      cleared: clearedItems.slice(0, 12),
      skipped: skipped.slice(0, 8),
    };
  }

  async function readCachedResult() {
    try {
      const value = await figma.clientStorage.getAsync(AI_DESIGN_CONSISTENCY_CACHE_KEY);
      return normalizeCachedResult(value);
    } catch (error) {
      return null;
    }
  }

  async function writeCachedResult(result) {
    const normalized = normalizeCachedResult(result);
    try {
      await figma.clientStorage.setAsync(AI_DESIGN_CONSISTENCY_CACHE_KEY, normalized);
    } catch (error) {}
    return normalized;
  }

  async function syncDiagnosisCachesAfterClear(selectionSignature, clearSummary) {
    const summary = clearSummary && typeof clearSummary === "object" ? clearSummary : {};
    await syncCachedAnnotationState(
      AI_DESIGN_CONSISTENCY_CACHE_KEY,
      selectionSignature,
      "consistency",
      summary.removedConsistencyAnnotationCount || 0
    );
    await syncCachedAnnotationState(
      AI_DESIGN_READ_CACHE_KEY,
      selectionSignature,
      "accessibility",
      summary.removedAccessibilityAnnotationCount || 0
    );
  }

  async function syncCachedAnnotationState(cacheKey, selectionSignature, sectionKey, removedAnnotationCount) {
    try {
      const cached = await figma.clientStorage.getAsync(cacheKey);
      if (!cached || typeof cached !== "object" || cached.selectionSignature !== selectionSignature) {
        return;
      }

      const section = cached[sectionKey];
      if (!section || typeof section !== "object" || !section.annotations || typeof section.annotations !== "object") {
        return;
      }

      section.annotations.annotationCount = 0;
      section.annotations.annotatedNodeCount = 0;
      section.annotations.clearedNodeCount = 0;
      section.annotations.removedAnnotationCount = removedAnnotationCount;
      section.annotations.modeLabel = "Result only";

      if (cached.summary && typeof cached.summary === "object") {
        cached.summary.annotationCount = 0;
      }

      await figma.clientStorage.setAsync(cacheKey, cached);
    } catch (error) {}
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
    const rootNames = [];
    const textSamples = [];
    const annotationNodes = [];
    const paintEntries = [];
    const textEntries = [];
    const spacingEntries = [];
    const nodeEntries = [];
    const typeCounts = new Map();
    let orderCounter = 0;

    const stats = {
      rootCount: selection.length,
      totalNodes: 0,
      frameCount: 0,
      groupCount: 0,
      textNodeCount: 0,
      instanceCount: 0,
      componentCount: 0,
      autoLayoutCount: 0,
      maxDepth: 0,
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
      const bounds = getNodeBounds(node);
      const type = String(node.type || "UNKNOWN");
      const name = safeName(node);
      const entry = {
        id: node.id,
        node,
        bounds,
        type,
        name,
        depth,
        rootId: current.rootId,
        parentId: node.parent && typeof node.parent.id === "string" ? node.parent.id : "",
        order: orderCounter++,
      };
      nodeEntries.push(entry);

      stats.totalNodes += 1;
      stats.maxDepth = Math.max(stats.maxDepth, depth);
      bumpCount(typeCounts, type);

      if (supportsAnnotationsOnNode(node)) {
        annotationNodes.push(node);
      }

      if (type === "FRAME") {
        stats.frameCount += 1;
      } else if (type === "GROUP") {
        stats.groupCount += 1;
      } else if (type === "TEXT") {
        stats.textNodeCount += 1;
      } else if (type === "INSTANCE") {
        stats.instanceCount += 1;
      } else if (type === "COMPONENT" || type === "COMPONENT_SET") {
        stats.componentCount += 1;
      }

      collectPaintEntries(node, entry, paintEntries);
      collectSpacingEntries(node, entry, spacingEntries);

      if (hasLayout(node)) {
        stats.autoLayoutCount += 1;
      }

      if (type === "TEXT") {
        const textEntry = buildTextEntry(node, entry);
        if (textEntry) {
          textEntries.push(textEntry);
          if (textSamples.length < 6 && textEntry.text) {
            textSamples.push(textEntry.text);
          }
        }
      }

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push({
            node: node.children[index],
            depth: depth + 1,
            rootId: current.rootId,
          });
        }
      }
    }

    const selectionBounds = combineBounds(rootBounds);
    const topTypes = sortCountEntries(typeCounts)
      .slice(0, 5)
      .map((item) => ({
        type: item.key,
        label: formatNodeType(item.key),
        count: item.count,
      }));
    const contextSummary = inferDesignContext({
      rootNames,
      textSamples,
      stats,
      selectionBounds,
      topTypes,
    });
    const consistency = buildConsistencySummary(paintEntries, textEntries, spacingEntries, nodeEntries);
    const insights = buildInsights(consistency);

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
        contextLabel: contextSummary.label,
        contextReason: contextSummary.reason,
        aiStatusLabel: "로컬 휴리스틱",
        aiProviderLabel: "",
        aiModelLabel: "",
        issueCount: consistency.issueCount,
        fixableCount: consistency.fixableCount,
        annotationCount: 0,
      },
      stats: Object.assign({}, stats, {
        topTypes,
      }),
      consistency,
      insights,
    };

    return {
      result,
      annotationNodes,
    };
  }

  function buildConsistencySummary(paintEntries, textEntries, spacingEntries, nodeEntries) {
    const colorTokens = buildColorTokens(paintEntries);
    const typographyTokens = buildTypographyTokens(textEntries);
    const spacingTokens = buildSpacingTokens(spacingEntries);

    const colorIssues = analyzeColorIssues(paintEntries, colorTokens);
    const typographyIssues = analyzeTypographyIssues(textEntries, typographyTokens);
    const spacingIssues = analyzeSpacingIssues(spacingEntries, spacingTokens);
    const semanticSpacingIssues = analyzeSemanticSpacingIssues(nodeEntries, textEntries);
    const repeatedPatternIssues = analyzeRepeatedPatternIssues(nodeEntries, textEntries);
    const formIssues = analyzeFormConsistencyIssues(nodeEntries, textEntries);

    const issues = dedupeIssues(
      colorIssues.concat(typographyIssues, spacingIssues, semanticSpacingIssues, repeatedPatternIssues, formIssues)
    )
      .sort(compareIssues)
      .slice(0, MAX_ISSUE_COUNT);

    return {
      standardLabel: "색상 · 타이포 · 여백 · 맥락",
      issueCount: issues.length,
      fixableCount: issues.filter((issue) => issue && issue.canApply).length,
      colorIssueCount: colorIssues.length,
      typographyIssueCount: typographyIssues.length,
      spacingIssueCount: spacingIssues.length,
      semanticIssueCount: semanticSpacingIssues.length,
      repetitionIssueCount: repeatedPatternIssues.length,
      formIssueCount: formIssues.length,
      colorTokenSummary: colorTokens.summary,
      typographyTokenSummary: typographyTokens.summary,
      spacingTokenSummary: spacingTokens.summary,
      colorTokens: colorTokens.items.map((item) => item.hex),
      typographyTokens: {
        families: typographyTokens.familyItems.map((item) => item.value),
        sizes: typographyTokens.sizeItems.map((item) => item.value),
      },
      spacingTokens: spacingTokens.items.map((item) => item.value),
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

  function buildColorTokens(paintEntries) {
    const counts = new Map();
    for (const entry of paintEntries) {
      if (!entry || !entry.hex) {
        continue;
      }
      bumpCount(counts, entry.hex);
    }

    let items = sortCountEntries(counts)
      .filter((item) => item.count >= MIN_TOKEN_COUNT)
      .slice(0, COLOR_TOKEN_LIMIT)
      .map((item) => ({
        hex: item.key,
        count: item.count,
        color: paintEntries.find((entry) => entry.hex === item.key).color,
      }));

    if (!items.length) {
      items = sortCountEntries(counts)
        .slice(0, Math.min(COLOR_TOKEN_LIMIT, 4))
        .map((item) => ({
          hex: item.key,
          count: item.count,
          color: paintEntries.find((entry) => entry.hex === item.key).color,
        }));
    }

    return {
      items,
      summary: items.length ? items.map((item) => `${item.hex} (${item.count})`).join(" · ") : "대표 색상 감지 없음",
    };
  }

  function buildTypographyTokens(textEntries) {
    const familyCounts = new Map();
    const sizeCounts = new Map();

    for (const entry of textEntries) {
      if (entry.fontFamily && entry.fontFamily !== "Mixed") {
        bumpCount(familyCounts, entry.fontFamily);
      }
      if (typeof entry.fontSize === "number" && Number.isFinite(entry.fontSize)) {
        bumpCount(sizeCounts, String(roundValue(entry.fontSize)));
      }
    }

    const familyItems = sortCountEntries(familyCounts)
      .filter((item) => item.count >= MIN_TOKEN_COUNT)
      .slice(0, 3)
      .map((item) => ({
        value: item.key,
        count: item.count,
      }));
    const sizeItems = sortCountEntries(sizeCounts)
      .filter((item) => item.count >= MIN_TOKEN_COUNT)
      .slice(0, FONT_SIZE_TOKEN_LIMIT)
      .map((item) => ({
        value: Number(item.key),
        count: item.count,
      }));

    const familySummary = familyItems.length ? familyItems.map((item) => item.value).join(" · ") : "대표 폰트 감지 없음";
    const sizeSummary = sizeItems.length ? sizeItems.map((item) => `${item.value}px`).join(" · ") : "대표 크기 감지 없음";

    return {
      familyItems,
      sizeItems,
      dominantFamily: familyItems.length ? familyItems[0].value : "",
      summary: `${familySummary} / ${sizeSummary}`,
    };
  }

  function buildSpacingTokens(spacingEntries) {
    const counts = new Map();
    for (const entry of spacingEntries) {
      if (!entry || typeof entry.value !== "number" || !Number.isFinite(entry.value)) {
        continue;
      }
      bumpCount(counts, String(roundValue(entry.value)));
    }

    let items = sortCountEntries(counts)
      .filter((item) => item.count >= MIN_TOKEN_COUNT)
      .slice(0, SPACING_TOKEN_LIMIT)
      .map((item) => ({
        value: Number(item.key),
        count: item.count,
      }));

    if (!items.length) {
      items = sortCountEntries(counts)
        .slice(0, Math.min(SPACING_TOKEN_LIMIT, 4))
        .map((item) => ({
          value: Number(item.key),
          count: item.count,
        }));
    }

    return {
      items,
      summary: items.length ? items.map((item) => `${item.value}px`).join(" · ") : "대표 간격 감지 없음",
    };
  }

  function analyzeColorIssues(paintEntries, colorTokens) {
    if (!colorTokens.items.length) {
      return [];
    }

    const tokenSet = new Set(colorTokens.items.map((item) => item.hex));
    const colorCounts = new Map();
    for (const entry of paintEntries) {
      bumpCount(colorCounts, entry.hex);
    }

    const issues = [];
    for (const entry of paintEntries) {
      if (!entry || !entry.hex || tokenSet.has(entry.hex)) {
        continue;
      }

      const nearest = findNearestColorToken(entry.color, colorTokens.items);
      if (!nearest || nearest.distance > COLOR_DISTANCE_THRESHOLD) {
        continue;
      }

      const currentCount = colorCounts.get(entry.hex) || 0;
      const shouldFlag = currentCount <= 1 || nearest.count >= Math.max(2, currentCount + 1);
      if (!shouldFlag) {
        continue;
      }

      const fixPlan = canEditPaintEntry(entry)
        ? {
            action: "set-solid-paint-color",
            targetNodeId: entry.nodeId,
            property: entry.property,
            paintIndex: entry.paintIndex,
            color: cloneColor(nearest.color),
          }
        : null;

      issues.push({
        id: createIssueId(`color:${entry.property}:${entry.paintIndex}`, entry.nodeId),
        category: "color",
        type: "color-token",
        severity: nearest.distance <= 0.05 ? "warning" : "info",
        guideline: "색상 토큰",
        nodeId: entry.nodeId,
        nodeName: entry.nodeName,
        nodeType: entry.nodeType,
        summary: `${PALETTE_ROLES[entry.role] || "색상"} ${entry.hex}`,
        detail: `${PALETTE_ROLES[entry.role] || "색상"} 값이 대표 팔레트 ${nearest.hex}과 거의 같은데 따로 사용되고 있습니다.`,
        suggestion: `${nearest.hex}로 맞추면 색상 일관성이 더 좋아집니다.`,
        canApply: !!fixPlan,
        applyLabel: fixPlan ? "색상 적용" : "",
        fixPlan,
      });
    }

    return issues;
  }

  function analyzeTypographyIssues(textEntries, typographyTokens) {
    const issues = [];
    const familyCounts = new Map();
    const sizeCounts = new Map();

    for (const entry of textEntries) {
      if (entry.fontFamily && entry.fontFamily !== "Mixed") {
        bumpCount(familyCounts, entry.fontFamily);
      }
      if (typeof entry.fontSize === "number" && Number.isFinite(entry.fontSize)) {
        bumpCount(sizeCounts, String(roundValue(entry.fontSize)));
      }
    }

    for (const entry of textEntries) {
      if (entry.fontFamily && entry.fontFamily !== "Mixed" && typographyTokens.dominantFamily) {
        const dominantCount = familyCounts.get(typographyTokens.dominantFamily) || 0;
        const currentCount = familyCounts.get(entry.fontFamily) || 0;
        if (
          entry.fontFamily !== typographyTokens.dominantFamily &&
          dominantCount >= 3 &&
          currentCount <= 1
        ) {
          issues.push({
            id: createIssueId("type-family", entry.nodeId),
            category: "typography",
            type: "font-family",
            severity: "warning",
            guideline: "대표 폰트",
            nodeId: entry.nodeId,
            nodeName: entry.nodeName,
            nodeType: entry.nodeType,
            summary: `폰트 ${entry.fontFamily}`,
            detail: `이 텍스트는 대표 폰트 ${typographyTokens.dominantFamily} 대신 ${entry.fontFamily}를 단독으로 사용하고 있습니다.`,
            suggestion: `${typographyTokens.dominantFamily} 계열로 맞추면 타이포 일관성이 높아집니다.`,
            canApply: false,
            applyLabel: "",
            fixPlan: null,
          });
        }
      }

      if (typeof entry.fontSize !== "number" || !Number.isFinite(entry.fontSize) || !typographyTokens.sizeItems.length) {
        continue;
      }

      const nearest = findNearestNumericToken(entry.fontSize, typographyTokens.sizeItems.map((item) => item.value));
      if (!nearest) {
        continue;
      }

      const currentCount = sizeCounts.get(String(roundValue(entry.fontSize))) || 0;
      if (Math.abs(nearest - entry.fontSize) < 0.5 || Math.abs(nearest - entry.fontSize) > 4 || currentCount > 1) {
        continue;
      }

      const fixPlan = canAdjustFontSize(entry.node)
        ? {
            action: "set-font-size",
            targetNodeId: entry.nodeId,
            targetFontSize: nearest,
          }
        : null;

      issues.push({
        id: createIssueId("type-size", entry.nodeId),
        category: "typography",
        type: "font-size",
        severity: "info",
        guideline: "대표 폰트 크기",
        nodeId: entry.nodeId,
        nodeName: entry.nodeName,
        nodeType: entry.nodeType,
        summary: `폰트 크기 ${roundValue(entry.fontSize)}px`,
        detail: `현재 크기가 대표 크기 스케일과 어긋나 있습니다. 가장 가까운 토큰은 ${nearest}px입니다.`,
        suggestion: `${nearest}px로 맞추면 화면 전체의 타이포 리듬이 더 안정적입니다.`,
        canApply: !!fixPlan,
        applyLabel: fixPlan ? "크기 적용" : "",
        fixPlan,
      });
    }

    return issues;
  }

  function analyzeSpacingIssues(spacingEntries, spacingTokens) {
    if (!spacingTokens.items.length) {
      return [];
    }

    const counts = new Map();
    for (const entry of spacingEntries) {
      bumpCount(counts, String(roundValue(entry.value)));
    }

    const tokenValues = spacingTokens.items.map((item) => item.value);
    const issues = [];
    for (const entry of spacingEntries) {
      if (!entry || typeof entry.value !== "number" || !Number.isFinite(entry.value)) {
        continue;
      }

      const currentValue = roundValue(entry.value);
      if (tokenValues.some((value) => Math.abs(value - currentValue) < 0.01)) {
        continue;
      }

      const nearestToken = findNearestNumericToken(currentValue, tokenValues);
      const gridTarget = Math.max(0, Math.round(currentValue / 4) * 4);
      const targetValue =
        typeof nearestToken === "number" && Math.abs(nearestToken - currentValue) <= 4
          ? nearestToken
          : gridTarget;

      if (Math.abs(targetValue - currentValue) < 1) {
        continue;
      }

      const currentCount = counts.get(String(currentValue)) || 0;
      if (currentCount > 1 && isOnFourPointGrid(currentValue)) {
        continue;
      }

      issues.push({
        id: createIssueId(`spacing:${entry.kind}`, entry.nodeId),
        category: "spacing",
        type: "spacing",
        severity: isOnFourPointGrid(currentValue) ? "info" : "warning",
        guideline: "간격 스케일",
        nodeId: entry.nodeId,
        nodeName: entry.nodeName,
        nodeType: entry.nodeType,
        summary: `${entry.label} ${currentValue}px`,
        detail: `${entry.label} 값이 대표 간격 스케일과 어긋나 있습니다.`,
        suggestion: `${targetValue}px로 맞추면 여백 규칙이 더 또렷해집니다.`,
        canApply: true,
        applyLabel: "간격 적용",
        fixPlan: {
          action: "set-spacing-value",
          targetNodeId: entry.nodeId,
          changes: entry.fields.map((field) => ({
            field,
            value: targetValue,
          })),
        },
      });
    }

    return issues;
  }

  function analyzeSemanticSpacingIssues(nodeEntries, textEntries) {
    const nodeEntryMap = buildNodeEntryMap(nodeEntries);
    const textEntryMap = buildTextEntryMap(textEntries);
    const titleBodyCandidates = [];
    const sectionCandidates = [];

    for (const parentEntry of nodeEntries) {
      const childEntries = sortEntriesVertically(listVisibleChildEntries(parentEntry, nodeEntryMap));
      if (childEntries.length < 2) {
        continue;
      }

      const maxTextSize = getMaxDirectChildTextSize(childEntries, textEntryMap);
      for (let index = 0; index < childEntries.length - 1; index += 1) {
        const current = childEntries[index];
        const next = childEntries[index + 1];
        const gap = measureVerticalGap(current, next);
        if (gap === null || gap < 0 || gap > 120) {
          continue;
        }

        if (parentEntry.node.layoutMode !== "VERTICAL" && !hasAlignedLeadingEdge(current, next, 48)) {
          continue;
        }

        const currentText = textEntryMap.get(current.id) || null;
        const nextText = textEntryMap.get(next.id) || null;

        if (currentText && nextText && isLikelyHeadingToBodyPair(currentText, nextText)) {
          titleBodyCandidates.push({
            groupKey: String(parentEntry.rootId || parentEntry.id) + ":title-body",
            nodeId: current.id,
            nodeName: current.name,
            nodeType: current.type,
            value: gap,
            label: truncateText(currentText.text || current.name, 28),
          });
          continue;
        }

        if (currentText && !nextText && isLikelySectionHeaderText(currentText, maxTextSize) && isLikelySectionContent(next)) {
          sectionCandidates.push({
            groupKey: String(parentEntry.rootId || parentEntry.id) + ":section-gap",
            nodeId: current.id,
            nodeName: current.name,
            nodeType: current.type,
            value: gap,
            label: truncateText(currentText.text || current.name, 28),
          });
        }
      }
    }

    return createGroupedNumericConsistencyIssues(titleBodyCandidates, {
      tolerance: 2,
      maxDistance: 24,
      buildIssue: function (candidate, nearest, currentCount, groupSize) {
        return {
          id: createIssueId("semantic-title-gap:" + roundValue(candidate.value), candidate.nodeId),
          category: "context",
          type: "title-body-gap",
          severity: Math.abs(nearest - candidate.value) >= 8 ? "warning" : "info",
          guideline: "제목-본문 간격",
          nodeId: candidate.nodeId,
          nodeName: candidate.nodeName,
          nodeType: candidate.nodeType,
          summary: "제목 아래 " + roundValue(candidate.value) + "px",
          detail:
            "같은 화면의 제목-본문 간격은 주로 " +
            nearest +
            "px인데, " +
            candidate.label +
            " 아래 간격만 " +
            roundValue(candidate.value) +
            "px입니다. (" +
            groupSize +
            "개 패턴 비교)",
          suggestion: nearest + "px 기준으로 맞추면 텍스트 위계 리듬이 더 안정적입니다.",
          canApply: false,
          applyLabel: "",
          fixPlan: null,
        };
      },
    }).concat(
      createGroupedNumericConsistencyIssues(sectionCandidates, {
        tolerance: 2,
        maxDistance: 32,
        buildIssue: function (candidate, nearest, currentCount, groupSize) {
          return {
            id: createIssueId("semantic-section-gap:" + roundValue(candidate.value), candidate.nodeId),
            category: "context",
            type: "section-gap",
            severity: Math.abs(nearest - candidate.value) >= 10 ? "warning" : "info",
            guideline: "섹션 간격",
            nodeId: candidate.nodeId,
            nodeName: candidate.nodeName,
            nodeType: candidate.nodeType,
            summary: "섹션 아래 " + roundValue(candidate.value) + "px",
            detail:
              "섹션 제목 아래 첫 콘텐츠까지 간격은 주로 " +
              nearest +
              "px인데, " +
              candidate.label +
              " 아래만 " +
              roundValue(candidate.value) +
              "px입니다. (" +
              groupSize +
              "개 섹션 비교)",
            suggestion: nearest + "px로 맞추면 섹션 구분 리듬이 더 또렷해집니다.",
            canApply: false,
            applyLabel: "",
            fixPlan: null,
          };
        },
      })
    );
  }

  function analyzeRepeatedPatternIssues(nodeEntries, textEntries) {
    const nodeEntryMap = buildNodeEntryMap(nodeEntries);
    const textEntryMap = buildTextEntryMap(textEntries);
    const paddingCandidates = [];
    const gapCandidates = [];
    const titleSizeCandidates = [];

    for (const parentEntry of nodeEntries) {
      const childEntries = listVisibleChildEntries(parentEntry, nodeEntryMap);
      if (childEntries.length < 2) {
        continue;
      }

      const groups = new Map();
      for (const childEntry of childEntries) {
        const summary = buildRepeatedPatternSummary(childEntry, nodeEntryMap, textEntryMap);
        if (!summary) {
          continue;
        }

        const bucket = groups.get(summary.signature) || [];
        bucket.push(summary);
        groups.set(summary.signature, bucket);
      }

      for (const group of groups.values()) {
        if (!group || group.length < 2) {
          continue;
        }

        const clusterKey = String(parentEntry.id) + "::" + String(group[0].signature || "cluster");
        for (const summary of group) {
          if (typeof summary.paddingValue === "number") {
            paddingCandidates.push({
              groupKey: clusterKey + ":padding",
              nodeId: summary.nodeId,
              nodeName: summary.nodeName,
              nodeType: summary.nodeType,
              value: summary.paddingValue,
              clusterSize: group.length,
              label: summary.label,
              fixPlan:
                summary.paddingFields && summary.paddingFields.length
                  ? {
                      action: "set-spacing-value",
                      targetNodeId: summary.nodeId,
                      changes: summary.paddingFields.map(function (field) {
                        return {
                          field: field,
                          value: summary.paddingValue,
                        };
                      }),
                    }
                  : null,
            });
          }

          if (typeof summary.gapValue === "number") {
            gapCandidates.push({
              groupKey: clusterKey + ":gap",
              nodeId: summary.nodeId,
              nodeName: summary.nodeName,
              nodeType: summary.nodeType,
              value: summary.gapValue,
              clusterSize: group.length,
              label: summary.label,
              fixPlan: {
                action: "set-spacing-value",
                targetNodeId: summary.nodeId,
                changes: [
                  {
                    field: "itemSpacing",
                    value: summary.gapValue,
                  },
                ],
              },
            });
          }

          if (summary.titleTextEntry && typeof summary.titleTextEntry.fontSize === "number") {
            titleSizeCandidates.push({
              groupKey: clusterKey + ":title-size",
              nodeId: summary.titleTextEntry.nodeId,
              nodeName: summary.nodeName,
              nodeType: summary.nodeType,
              value: summary.titleTextEntry.fontSize,
              clusterSize: group.length,
              label: summary.label,
              titleNodeId: summary.titleTextEntry.nodeId,
            });
          }
        }
      }
    }

    return createGroupedNumericConsistencyIssues(paddingCandidates, {
      tolerance: 2,
      maxDistance: 24,
      buildIssue: function (candidate, nearest, currentCount, groupSize) {
        return {
          id: createIssueId("repeat-padding:" + roundValue(candidate.value), candidate.nodeId),
          category: "component",
          type: "repeat-padding",
          severity: Math.abs(nearest - candidate.value) >= 8 ? "warning" : "info",
          guideline: "반복 카드/리스트 패딩",
          nodeId: candidate.nodeId,
          nodeName: candidate.nodeName,
          nodeType: candidate.nodeType,
          summary: "내부 패딩 " + roundValue(candidate.value) + "px",
          detail:
            "같은 구조의 카드/리스트 " +
            groupSize +
            "개를 비교하면 " +
            candidate.label +
            "만 패딩이 " +
            roundValue(candidate.value) +
            "px이고, 기준 패턴은 " +
            nearest +
            "px입니다.",
          suggestion: nearest + "px로 맞추면 반복 블록의 내부 리듬이 더 안정적입니다.",
          canApply: false,
          applyLabel: "",
          fixPlan: null,
        };
      },
    }).concat(
      createGroupedNumericConsistencyIssues(gapCandidates, {
        tolerance: 2,
        maxDistance: 20,
        buildIssue: function (candidate, nearest, currentCount, groupSize) {
          return {
            id: createIssueId("repeat-gap:" + roundValue(candidate.value), candidate.nodeId),
            category: "component",
            type: "repeat-gap",
            severity: Math.abs(nearest - candidate.value) >= 8 ? "warning" : "info",
            guideline: "반복 카드/리스트 간격",
            nodeId: candidate.nodeId,
            nodeName: candidate.nodeName,
            nodeType: candidate.nodeType,
            summary: "내부 간격 " + roundValue(candidate.value) + "px",
            detail:
              "같은 구조의 카드/리스트 " +
              groupSize +
              "개 중 " +
              candidate.label +
              "만 내부 간격이 " +
              roundValue(candidate.value) +
              "px입니다. 주로 쓰인 값은 " +
              nearest +
              "px입니다.",
            suggestion: nearest + "px로 맞추면 반복 패턴의 밀도가 더 일정해집니다.",
            canApply: false,
            applyLabel: "",
            fixPlan: null,
          };
        },
      })
    ).concat(
      createGroupedNumericConsistencyIssues(titleSizeCandidates, {
        tolerance: 1,
        maxDistance: 6,
        buildIssue: function (candidate, nearest, currentCount, groupSize) {
          const canApply = typeof candidate.titleNodeId === "string" && candidate.titleNodeId.length > 0;
          return {
            id: createIssueId("repeat-title-size:" + roundValue(candidate.value), candidate.nodeId),
            category: "component",
            type: "repeat-title-size",
            severity: Math.abs(nearest - candidate.value) >= 3 ? "warning" : "info",
            guideline: "반복 카드/리스트 타이포",
            nodeId: candidate.nodeId,
            nodeName: candidate.nodeName,
            nodeType: candidate.nodeType,
            summary: "대표 텍스트 " + roundValue(candidate.value) + "px",
            detail:
              "같은 구조의 카드/리스트 " +
              groupSize +
              "개를 비교하면 " +
              candidate.label +
              "의 대표 텍스트 크기만 " +
              roundValue(candidate.value) +
              "px이고, 나머지는 주로 " +
              nearest +
              "px입니다.",
            suggestion: nearest + "px로 맞추면 반복 블록의 제목 위계가 더 안정적입니다.",
            canApply: canApply,
            applyLabel: canApply ? "크기 적용" : "",
            fixPlan: canApply
              ? {
                  action: "set-font-size",
                  targetNodeId: candidate.titleNodeId,
                  targetFontSize: nearest,
                }
              : null,
          };
        },
      })
    );
  }

  function analyzeFormConsistencyIssues(nodeEntries, textEntries) {
    const nodeEntryMap = buildNodeEntryMap(nodeEntries);
    const textEntryMap = buildTextEntryMap(textEntries);
    const blocks = collectFormBlockCandidates(nodeEntries, nodeEntryMap, textEntryMap);
    const blocksByRoot = new Map();

    for (const block of blocks) {
      const bucket = blocksByRoot.get(block.rootId) || [];
      bucket.push(block);
      blocksByRoot.set(block.rootId, bucket);
    }

    const labelGapCandidates = [];
    const helpGapCandidates = [];
    const helpSizeCandidates = [];

    for (const group of blocksByRoot.values()) {
      if (!group || group.length < 2) {
        continue;
      }

      for (const block of group) {
        labelGapCandidates.push({
          groupKey: String(block.rootId) + ":label-field-gap",
          nodeId: block.fieldNodeId,
          nodeName: block.nodeName,
          nodeType: block.nodeType,
          value: block.labelFieldGap,
          label: block.labelText,
        });

        if (typeof block.fieldHelpGap === "number") {
          helpGapCandidates.push({
            groupKey: String(block.rootId) + ":field-help-gap",
            nodeId: block.helpNodeId,
            nodeName: block.nodeName,
            nodeType: block.nodeType,
            value: block.fieldHelpGap,
            label: block.labelText,
          });
        }

        if (typeof block.helpFontSize === "number") {
          helpSizeCandidates.push({
            groupKey: String(block.rootId) + ":help-font-size",
            nodeId: block.helpNodeId,
            nodeName: block.nodeName,
            nodeType: block.nodeType,
            value: block.helpFontSize,
            label: block.labelText,
          });
        }
      }
    }

    return createGroupedNumericConsistencyIssues(labelGapCandidates, {
      tolerance: 2,
      maxDistance: 16,
      buildIssue: function (candidate, nearest) {
        return {
          id: createIssueId("form-label-gap:" + roundValue(candidate.value), candidate.nodeId),
          category: "form",
          type: "form-label-gap",
          severity: Math.abs(nearest - candidate.value) >= 6 ? "warning" : "info",
          guideline: "폼 라벨-인풋 간격",
          nodeId: candidate.nodeId,
          nodeName: candidate.nodeName,
          nodeType: candidate.nodeType,
          summary: "라벨-인풋 " + roundValue(candidate.value) + "px",
          detail:
            "같은 화면의 폼에서 라벨 아래 인풋 간격은 주로 " +
            nearest +
            "px인데, " +
            candidate.label +
            " 필드만 " +
            roundValue(candidate.value) +
            "px입니다.",
          suggestion: nearest + "px 기준으로 맞추면 폼 입력 리듬이 더 안정적입니다.",
          canApply: false,
          applyLabel: "",
          fixPlan: null,
        };
      },
    }).concat(
      createGroupedNumericConsistencyIssues(helpGapCandidates, {
        tolerance: 2,
        maxDistance: 12,
        buildIssue: function (candidate, nearest) {
          return {
            id: createIssueId("form-help-gap:" + roundValue(candidate.value), candidate.nodeId),
            category: "form",
            type: "form-help-gap",
            severity: Math.abs(nearest - candidate.value) >= 4 ? "warning" : "info",
            guideline: "폼 인풋-헬프텍스트 간격",
            nodeId: candidate.nodeId,
            nodeName: candidate.nodeName,
            nodeType: candidate.nodeType,
            summary: "인풋-헬프텍스트 " + roundValue(candidate.value) + "px",
            detail:
              "폼 헬프텍스트 간격은 주로 " +
              nearest +
              "px인데, " +
              candidate.label +
              " 필드 아래만 " +
              roundValue(candidate.value) +
              "px입니다.",
            suggestion: nearest + "px로 맞추면 도움말 리듬이 더 안정적입니다.",
            canApply: false,
            applyLabel: "",
            fixPlan: null,
          };
        },
      })
    ).concat(
      createGroupedNumericConsistencyIssues(helpSizeCandidates, {
        tolerance: 1,
        maxDistance: 4,
        buildIssue: function (candidate, nearest) {
          return {
            id: createIssueId("form-help-size:" + roundValue(candidate.value), candidate.nodeId),
            category: "form",
            type: "form-help-size",
            severity: Math.abs(nearest - candidate.value) >= 2 ? "warning" : "info",
            guideline: "폼 헬프텍스트 크기",
            nodeId: candidate.nodeId,
            nodeName: candidate.nodeName,
            nodeType: candidate.nodeType,
            summary: "헬프텍스트 " + roundValue(candidate.value) + "px",
            detail:
              "폼 도움말 텍스트는 주로 " +
              nearest +
              "px인데, " +
              candidate.label +
              " 필드의 헬프텍스트만 " +
              roundValue(candidate.value) +
              "px입니다.",
            suggestion: nearest + "px로 맞추면 라벨-인풋-헬프텍스트 위계가 더 또렷해집니다.",
            canApply: false,
            applyLabel: "",
            fixPlan: null,
          };
        },
      })
    );
  }

  function createGroupedNumericConsistencyIssues(candidates, options) {
    const groups = new Map();
    const issues = [];
    const tolerance = options && typeof options.tolerance === "number" ? options.tolerance : 1;
    const maxDistance = options && typeof options.maxDistance === "number" ? options.maxDistance : 16;

    for (const candidate of candidates) {
      if (!candidate || typeof candidate.groupKey !== "string") {
        continue;
      }
      const bucket = groups.get(candidate.groupKey) || [];
      bucket.push(candidate);
      groups.set(candidate.groupKey, bucket);
    }

    for (const group of groups.values()) {
      if (!group || group.length < 2) {
        continue;
      }

      const counts = new Map();
      for (const candidate of group) {
        bumpCount(counts, String(roundValue(candidate.value)));
      }

      const tokenItems = sortCountEntries(counts).filter(function (item) {
        return item.count >= 2;
      });
      if (!tokenItems.length) {
        continue;
      }

      const tokenValues = [];
      for (const item of tokenItems) {
        tokenValues.push(Number(item.key));
      }

      for (const candidate of group) {
        const currentValue = roundValue(candidate.value);
        const currentCount = counts.get(String(currentValue)) || 0;
        const nearest = findNearestNumericToken(currentValue, tokenValues);
        if (typeof nearest !== "number" || !Number.isFinite(nearest)) {
          continue;
        }
        if (Math.abs(nearest - currentValue) <= tolerance) {
          continue;
        }
        if (currentCount > 1) {
          continue;
        }
        if (Math.abs(nearest - currentValue) > maxDistance) {
          continue;
        }

        const issue =
          options && typeof options.buildIssue === "function"
            ? options.buildIssue(candidate, nearest, currentCount, group.length)
            : null;
        if (issue) {
          issues.push(issue);
        }
      }
    }

    return issues;
  }

  function buildNodeEntryMap(entries) {
    const map = new Map();
    for (const entry of Array.isArray(entries) ? entries : []) {
      if (!entry || typeof entry.id !== "string") {
        continue;
      }
      map.set(entry.id, entry);
    }
    return map;
  }

  function buildTextEntryMap(entries) {
    const map = new Map();
    for (const entry of Array.isArray(entries) ? entries : []) {
      if (!entry || typeof entry.nodeId !== "string") {
        continue;
      }
      map.set(entry.nodeId, entry);
    }
    return map;
  }

  function listVisibleChildEntries(parentEntry, nodeEntryMap) {
    const result = [];
    if (!parentEntry || !parentEntry.node || !hasChildren(parentEntry.node)) {
      return result;
    }

    for (const child of parentEntry.node.children) {
      const entry = nodeEntryMap.get(child.id) || null;
      if (!entry) {
        continue;
      }
      result.push(entry);
    }
    return result;
  }

  function sortEntriesVertically(entries) {
    return Array.isArray(entries)
      ? entries.slice().sort(function (left, right) {
          const leftY = left && left.bounds ? left.bounds.y : Number.POSITIVE_INFINITY;
          const rightY = right && right.bounds ? right.bounds.y : Number.POSITIVE_INFINITY;
          if (leftY !== rightY) {
            return leftY - rightY;
          }

          const leftX = left && left.bounds ? left.bounds.x : Number.POSITIVE_INFINITY;
          const rightX = right && right.bounds ? right.bounds.x : Number.POSITIVE_INFINITY;
          if (leftX !== rightX) {
            return leftX - rightX;
          }

          return Number(left && left.order ? left.order : 0) - Number(right && right.order ? right.order : 0);
        })
      : [];
  }

  function measureVerticalGap(upper, lower) {
    if (!upper || !lower || !upper.bounds || !lower.bounds) {
      return null;
    }
    return roundValue(lower.bounds.y - (upper.bounds.y + upper.bounds.height));
  }

  function hasAlignedLeadingEdge(left, right, maxOffset) {
    if (!left || !right || !left.bounds || !right.bounds) {
      return false;
    }
    const offset = typeof maxOffset === "number" ? maxOffset : 32;
    return Math.abs(left.bounds.x - right.bounds.x) <= offset;
  }

  function getMaxDirectChildTextSize(childEntries, textEntryMap) {
    let maxSize = 0;
    for (const childEntry of Array.isArray(childEntries) ? childEntries : []) {
      const textEntry = textEntryMap.get(childEntry.id) || null;
      if (!textEntry || typeof textEntry.fontSize !== "number" || !Number.isFinite(textEntry.fontSize)) {
        continue;
      }
      maxSize = Math.max(maxSize, textEntry.fontSize);
    }
    return maxSize;
  }

  function isLikelyHeadingToBodyPair(titleText, bodyText) {
    if (
      !titleText ||
      !bodyText ||
      typeof titleText.fontSize !== "number" ||
      !Number.isFinite(titleText.fontSize) ||
      typeof bodyText.fontSize !== "number" ||
      !Number.isFinite(bodyText.fontSize)
    ) {
      return false;
    }

    if (titleText.fontSize < 14 || bodyText.fontSize < 10) {
      return false;
    }

    if (titleText.fontSize < bodyText.fontSize + 1.5) {
      return false;
    }

    const titleLength = typeof titleText.text === "string" ? titleText.text.length : 0;
    const bodyLength = typeof bodyText.text === "string" ? bodyText.text.length : 0;
    if (titleLength > 64 && bodyLength < 16) {
      return false;
    }

    return true;
  }

  function isLikelySectionHeaderText(textEntry, maxTextSize) {
    if (!textEntry || typeof textEntry.fontSize !== "number" || !Number.isFinite(textEntry.fontSize)) {
      return false;
    }

    if (textEntry.fontSize < 14) {
      return false;
    }

    const textLength = typeof textEntry.text === "string" ? textEntry.text.length : 0;
    if (textLength > 60) {
      return false;
    }

    return textEntry.fontSize >= Math.max(14, maxTextSize - 1);
  }

  function isLikelySectionContent(entry) {
    if (!entry || !entry.bounds) {
      return false;
    }
    if (entry.type === "TEXT") {
      return false;
    }
    return entry.bounds.width >= 48 && entry.bounds.height >= 16;
  }

  function buildRepeatedPatternSummary(entry, nodeEntryMap, textEntryMap) {
    if (!entry || !entry.bounds || entry.type === "TEXT" || !hasChildren(entry.node)) {
      return null;
    }

    if (entry.bounds.width < 80 || entry.bounds.height < 32 || entry.bounds.height > 420) {
      return null;
    }

    const childEntries = listVisibleChildEntries(entry, nodeEntryMap);
    if (childEntries.length < 2) {
      return null;
    }

    const signature = buildRepeatedPatternSignature(entry, childEntries, nodeEntryMap, textEntryMap);
    if (!signature) {
      return null;
    }

    const paddingValue = getUniformPaddingValue(entry.node);
    const titleTextEntry = findPrimaryTextDescendant(entry, 2, nodeEntryMap, textEntryMap);
    const gapValue =
      typeof entry.node.itemSpacing === "number" && Number.isFinite(entry.node.itemSpacing)
        ? roundValue(entry.node.itemSpacing)
        : null;

    return {
      nodeId: entry.id,
      nodeName: entry.name,
      nodeType: entry.type,
      label: truncateText(entry.name, 24),
      signature: signature,
      paddingValue: paddingValue,
      paddingFields:
        typeof paddingValue === "number"
          ? ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]
          : null,
      gapValue: gapValue,
      titleTextEntry: titleTextEntry,
    };
  }

  function buildRepeatedPatternSignature(entry, childEntries, nodeEntryMap, textEntryMap) {
    const orderedChildren = entry.node.layoutMode === "NONE" ? sortEntriesVertically(childEntries) : childEntries.slice();
    const kinds = [];
    const countLabel = orderedChildren.length > 6 ? "6+" : String(orderedChildren.length);

    for (let index = 0; index < orderedChildren.length && index < 4; index += 1) {
      kinds.push(describePatternChildKind(orderedChildren[index], nodeEntryMap, textEntryMap));
    }

    return [String(entry.node.layoutMode || "NONE"), countLabel, kinds.join("-")].join("|");
  }

  function describePatternChildKind(entry, nodeEntryMap, textEntryMap) {
    if (!entry) {
      return "U";
    }
    if (textEntryMap.has(entry.id)) {
      return "T";
    }
    if (isLikelyIconEntry(entry)) {
      return "I";
    }
    if (findPrimaryTextDescendant(entry, 1, nodeEntryMap, textEntryMap)) {
      return "B";
    }
    return hasChildren(entry.node) ? "C" : String(entry.type || "N").slice(0, 1);
  }

  function isLikelyIconEntry(entry) {
    if (!entry || !entry.bounds) {
      return false;
    }
    if (entry.bounds.width > 40 || entry.bounds.height > 40) {
      return false;
    }

    return (
      entry.type === "VECTOR" ||
      entry.type === "BOOLEAN_OPERATION" ||
      entry.type === "ELLIPSE" ||
      entry.type === "RECTANGLE" ||
      entry.type === "POLYGON" ||
      entry.type === "STAR"
    );
  }

  function getUniformPaddingValue(node) {
    if (!hasLayout(node)) {
      return null;
    }

    const fields = [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft];
    for (const value of fields) {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return null;
      }
    }

    const rounded = roundValue(fields[0]);
    for (let index = 1; index < fields.length; index += 1) {
      if (Math.abs(roundValue(fields[index]) - rounded) > 0.01) {
        return null;
      }
    }

    return rounded;
  }

  function findPrimaryTextDescendant(entry, maxDepth, nodeEntryMap, textEntryMap) {
    if (!entry || typeof maxDepth !== "number" || maxDepth < 0) {
      return null;
    }

    let best = null;
    const selfText = textEntryMap.get(entry.id) || null;
    if (selfText && typeof selfText.fontSize === "number" && Number.isFinite(selfText.fontSize)) {
      best = selfText;
    }

    if (!hasChildren(entry.node) || maxDepth === 0) {
      return best;
    }

    const stack = [];
    for (let index = entry.node.children.length - 1; index >= 0; index -= 1) {
      const childEntry = nodeEntryMap.get(entry.node.children[index].id) || null;
      if (!childEntry) {
        continue;
      }
      stack.push({
        entry: childEntry,
        depth: 1,
      });
    }

    while (stack.length > 0) {
      const current = stack.pop();
      const currentEntry = current && current.entry ? current.entry : null;
      if (!currentEntry) {
        continue;
      }

      const textEntry = textEntryMap.get(currentEntry.id) || null;
      if (textEntry && typeof textEntry.fontSize === "number" && Number.isFinite(textEntry.fontSize)) {
        best = choosePreferredTextEntry(best, textEntry);
      }

      if (current.depth >= maxDepth || !hasChildren(currentEntry.node)) {
        continue;
      }

      for (let index = currentEntry.node.children.length - 1; index >= 0; index -= 1) {
        const childEntry = nodeEntryMap.get(currentEntry.node.children[index].id) || null;
        if (!childEntry) {
          continue;
        }
        stack.push({
          entry: childEntry,
          depth: current.depth + 1,
        });
      }
    }

    return best;
  }

  function choosePreferredTextEntry(current, next) {
    if (!current) {
      return next;
    }
    if (!next) {
      return current;
    }

    const currentSize = typeof current.fontSize === "number" ? current.fontSize : -1;
    const nextSize = typeof next.fontSize === "number" ? next.fontSize : -1;
    if (currentSize !== nextSize) {
      return nextSize > currentSize ? next : current;
    }

    const currentOrder = typeof current.order === "number" ? current.order : Number.POSITIVE_INFINITY;
    const nextOrder = typeof next.order === "number" ? next.order : Number.POSITIVE_INFINITY;
    return nextOrder < currentOrder ? next : current;
  }

  function collectFormBlockCandidates(nodeEntries, nodeEntryMap, textEntryMap) {
    const blocks = [];
    const seen = new Set();

    for (const parentEntry of nodeEntries) {
      const childEntries = sortEntriesVertically(listVisibleChildEntries(parentEntry, nodeEntryMap));
      if (childEntries.length < 2) {
        continue;
      }

      for (let index = 0; index < childEntries.length - 1; index += 1) {
        const labelEntry = childEntries[index];
        const fieldEntry = childEntries[index + 1];
        const labelText = textEntryMap.get(labelEntry.id) || null;
        if (!labelText || !isLikelyFormLabelText(labelText)) {
          continue;
        }
        if (!isLikelyInputLikeEntry(fieldEntry, textEntryMap)) {
          continue;
        }

        const labelFieldGap = measureVerticalGap(labelEntry, fieldEntry);
        if (labelFieldGap === null || labelFieldGap < 0 || labelFieldGap > 40) {
          continue;
        }
        if (!hasAlignedLeadingEdge(labelEntry, fieldEntry, 40)) {
          continue;
        }

        let helpEntry = null;
        let helpText = null;
        let fieldHelpGap = null;
        if (index + 2 < childEntries.length) {
          const nextEntry = childEntries[index + 2];
          const nextText = textEntryMap.get(nextEntry.id) || null;
          const nextGap = measureVerticalGap(fieldEntry, nextEntry);
          if (
            nextText &&
            isLikelyFormHelpText(nextText, labelText) &&
            nextGap !== null &&
            nextGap >= 0 &&
            nextGap <= 24 &&
            hasAlignedLeadingEdge(fieldEntry, nextEntry, 40)
          ) {
            helpEntry = nextEntry;
            helpText = nextText;
            fieldHelpGap = nextGap;
          }
        }

        const key = String(parentEntry.id) + ":" + String(labelEntry.id) + ":" + String(fieldEntry.id);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);

        blocks.push({
          rootId: String(parentEntry.rootId || parentEntry.id),
          nodeName: fieldEntry.name,
          nodeType: fieldEntry.type,
          fieldNodeId: fieldEntry.id,
          helpNodeId: helpEntry ? helpEntry.id : "",
          labelText: truncateText(labelText.text || labelEntry.name, 28),
          labelFieldGap: labelFieldGap,
          fieldHelpGap: fieldHelpGap,
          helpFontSize: helpText && typeof helpText.fontSize === "number" ? helpText.fontSize : null,
        });
      }
    }

    return blocks;
  }

  function isLikelyFormLabelText(textEntry) {
    if (
      !textEntry ||
      typeof textEntry.text !== "string" ||
      typeof textEntry.fontSize !== "number" ||
      !Number.isFinite(textEntry.fontSize)
    ) {
      return false;
    }

    const length = textEntry.text.trim().length;
    if (length < 1 || length > 48) {
      return false;
    }

    return textEntry.fontSize >= 11 && textEntry.fontSize <= 18;
  }

  function isLikelyFormHelpText(helpText, labelText) {
    if (!helpText || typeof helpText.text !== "string") {
      return false;
    }

    const helpLength = helpText.text.trim().length;
    const labelLength = labelText && typeof labelText.text === "string" ? labelText.text.trim().length : 0;
    const helpSize = typeof helpText.fontSize === "number" && Number.isFinite(helpText.fontSize) ? helpText.fontSize : 0;
    const labelSize = labelText && typeof labelText.fontSize === "number" && Number.isFinite(labelText.fontSize) ? labelText.fontSize : 0;

    if (helpLength < 4 || helpLength > 120) {
      return false;
    }
    if (helpSize > 0 && labelSize > 0 && helpSize > labelSize + 2) {
      return false;
    }
    if (helpLength <= labelLength && helpSize >= labelSize) {
      return false;
    }
    return true;
  }

  function isLikelyInputLikeEntry(entry, textEntryMap) {
    if (!entry || !entry.bounds || textEntryMap.has(entry.id)) {
      return false;
    }

    if (entry.bounds.width < 120 || entry.bounds.height < 28 || entry.bounds.height > 72) {
      return false;
    }

    if (entry.type === "VECTOR" || entry.type === "LINE") {
      return false;
    }

    return (
      entry.type === "FRAME" ||
      entry.type === "GROUP" ||
      entry.type === "INSTANCE" ||
      entry.type === "COMPONENT" ||
      entry.type === "COMPONENT_SET" ||
      entry.type === "RECTANGLE" ||
      hasChildren(entry.node)
    );
  }

  function dedupeIssues(issues) {
    const map = new Map();
    for (const issue of issues) {
      if (!issue || !issue.id) {
        continue;
      }
      if (!map.has(issue.id)) {
        map.set(issue.id, issue);
      }
    }
    return Array.from(map.values());
  }

  function compareIssues(left, right) {
    const severityRank = {
      warning: 0,
      info: 1,
    };
    const leftSeverityKey = left && left.severity ? left.severity : "info";
    const rightSeverityKey = right && right.severity ? right.severity : "info";
    const leftSeverityValue = severityRank[leftSeverityKey];
    const rightSeverityValue = severityRank[rightSeverityKey];
    const leftSeverity = typeof leftSeverityValue === "number" ? leftSeverityValue : 99;
    const rightSeverity = typeof rightSeverityValue === "number" ? rightSeverityValue : 99;
    if (leftSeverity !== rightSeverity) {
      return leftSeverity - rightSeverity;
    }

    const categoryRank = {
      color: 0,
      typography: 1,
      context: 2,
      component: 3,
      form: 4,
      spacing: 5,
    };
    const leftCategoryKey = left && left.category ? left.category : "spacing";
    const rightCategoryKey = right && right.category ? right.category : "spacing";
    const leftCategoryValue = categoryRank[leftCategoryKey];
    const rightCategoryValue = categoryRank[rightCategoryKey];
    const leftCategory = typeof leftCategoryValue === "number" ? leftCategoryValue : 99;
    const rightCategory = typeof rightCategoryValue === "number" ? rightCategoryValue : 99;
    if (leftCategory !== rightCategory) {
      return leftCategory - rightCategory;
    }

    return String(left && left.nodeName ? left.nodeName : "").localeCompare(String(right && right.nodeName ? right.nodeName : ""));
  }

  function buildInsights(consistency) {
    const insights = [];
    if (consistency.colorTokenSummary) {
      insights.push(`색상 토큰: ${consistency.colorTokenSummary}`);
    }
    if (consistency.typographyTokenSummary) {
      insights.push(`타이포 토큰: ${consistency.typographyTokenSummary}`);
    }
    if (consistency.spacingTokenSummary) {
      insights.push(`여백 토큰: ${consistency.spacingTokenSummary}`);
    }
    insights.push(
      `일관성 이슈: 색상 ${consistency.colorIssueCount}건 · 타이포 ${consistency.typographyIssueCount}건 · 여백 ${consistency.spacingIssueCount}건`
    );
    if (
      (consistency.semanticIssueCount || 0) > 0 ||
      (consistency.repetitionIssueCount || 0) > 0 ||
      (consistency.formIssueCount || 0) > 0
    ) {
      insights.push(
        `맥락 이슈: 제목/섹션 ${consistency.semanticIssueCount || 0}건 · 반복 블록 ${consistency.repetitionIssueCount || 0}건 · 폼 ${consistency.formIssueCount || 0}건`
      );
    }
    if (consistency.fixableCount > 0) {
      insights.push(`즉시 적용 가능: ${consistency.fixableCount}건`);
    } else {
      insights.push("즉시 적용 가능한 제안은 없습니다.");
    }
    return insights.slice(0, 6);
  }

  async function enrichConsistencyWithAi(localResult) {
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
      currentSummary: localResult.summary || {},
      consistency: {
        colorTokenSummary: localResult.consistency ? localResult.consistency.colorTokenSummary : "",
        typographyTokenSummary: localResult.consistency ? localResult.consistency.typographyTokenSummary : "",
        spacingTokenSummary: localResult.consistency ? localResult.consistency.spacingTokenSummary : "",
        colorIssueCount: localResult.consistency ? localResult.consistency.colorIssueCount : 0,
        typographyIssueCount: localResult.consistency ? localResult.consistency.typographyIssueCount : 0,
        spacingIssueCount: localResult.consistency ? localResult.consistency.spacingIssueCount : 0,
        semanticIssueCount: localResult.consistency ? localResult.consistency.semanticIssueCount : 0,
        repetitionIssueCount: localResult.consistency ? localResult.consistency.repetitionIssueCount : 0,
        formIssueCount: localResult.consistency ? localResult.consistency.formIssueCount : 0,
        issues: Array.isArray(localResult.consistency && localResult.consistency.issues)
          ? localResult.consistency.issues.slice(0, 6).map((issue) => ({
              id: issue.id,
              category: issue.category,
              summary: issue.summary,
              detail: issue.detail,
              suggestion: issue.suggestion,
            }))
          : [],
      },
      currentInsights: Array.isArray(localResult.insights) ? localResult.insights.slice(0, 6) : [],
    };
    const schema = {
      type: "object",
      properties: {
        contextLabel: { type: "string" },
        colorSummary: { type: "string" },
        typographySummary: { type: "string" },
        spacingSummary: { type: "string" },
        prioritySummary: { type: "string" },
        insights: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["contextLabel", "colorSummary", "typographySummary", "spacingSummary", "prioritySummary", "insights"],
    };

    try {
      const response = await ai.requestJsonTask({
        instructions:
          "You analyze Figma design metadata for a design consistency diagnosis feature. Return concise Korean JSON only. Keep labels practical. Summarize color, typography, and spacing consistency using only values already present in the payload. Do not invent design system tokens that are not implied by the payload.",
        schema,
        payload,
      });
      if (!response || typeof response !== "object") {
        return localResult;
      }

      if (typeof response.contextLabel === "string" && response.contextLabel.trim()) {
        localResult.summary.contextLabel = response.contextLabel.trim();
      }
      if (typeof response.colorSummary === "string" && response.colorSummary.trim()) {
        localResult.consistency.aiColorSummary = response.colorSummary.trim();
      }
      if (typeof response.typographySummary === "string" && response.typographySummary.trim()) {
        localResult.consistency.aiTypographySummary = response.typographySummary.trim();
      }
      if (typeof response.spacingSummary === "string" && response.spacingSummary.trim()) {
        localResult.consistency.aiSpacingSummary = response.spacingSummary.trim();
      }
      if (typeof response.prioritySummary === "string" && response.prioritySummary.trim()) {
        localResult.consistency.prioritySummary = response.prioritySummary.trim();
      }

      localResult.summary.aiProviderLabel = formatProviderLabel(response._provider || runInfo.provider);
      localResult.summary.aiModelLabel = response._model || runInfo.model || "";
      localResult.source = typeof response._provider === "string" ? response._provider : "hybrid-ai";
      localResult.insights = mergeAiInsights(localResult, response);
    } catch (error) {
      localResult.aiError = normalizeErrorMessage(error, "AI 디자인 일관성 요약에 실패했습니다.");
    }

    return localResult;
  }

  function mergeAiInsights(localResult, response) {
    const next = [];
    if (typeof response.colorSummary === "string" && response.colorSummary.trim()) {
      next.push("AI 색상 판단: " + response.colorSummary.trim());
    }
    if (typeof response.typographySummary === "string" && response.typographySummary.trim()) {
      next.push("AI 타이포 판단: " + response.typographySummary.trim());
    }
    if (typeof response.spacingSummary === "string" && response.spacingSummary.trim()) {
      next.push("AI 여백 판단: " + response.spacingSummary.trim());
    }
    if (typeof response.prioritySummary === "string" && response.prioritySummary.trim()) {
      next.push("우선 수정: " + response.prioritySummary.trim());
    }
    if (Array.isArray(response.insights)) {
      for (const item of response.insights) {
        if (typeof item === "string" && item.trim()) {
          next.push(item.trim());
        }
      }
    }
    return uniqueStrings(next.concat(Array.isArray(localResult.insights) ? localResult.insights : []), 6);
  }

  async function applyFixPlan(plan) {
    if (!plan || typeof plan !== "object" || typeof plan.action !== "string") {
      throw new Error("적용 가능한 수정 정보가 없습니다.");
    }

    if (plan.action === "set-solid-paint-color") {
      applySolidPaintColorPlan(plan);
      return;
    }
    if (plan.action === "set-font-size") {
      await applyFontSizePlan(plan);
      return;
    }
    if (plan.action === "set-spacing-value") {
      applySpacingPlan(plan);
      return;
    }

    throw new Error("아직 지원하지 않는 수정 유형입니다.");
  }

  function applySolidPaintColorPlan(plan) {
    const node = figma.getNodeById(plan.targetNodeId);
    const property = plan.property === "strokes" ? "strokes" : "fills";
    if (!node || !(property in node) || !Array.isArray(node[property])) {
      throw new Error("색상을 변경할 레이어를 찾지 못했습니다.");
    }

    const paints = node[property].map((paint) => clonePlainObject(paint));
    const target = paints[plan.paintIndex];
    if (!target || target.type !== "SOLID") {
      throw new Error("변경할 색상 페인트를 찾지 못했습니다.");
    }

    target.color = cloneColor(plan.color || {});
    node[property] = paints;
  }

  async function applyFontSizePlan(plan) {
    const node = figma.getNodeById(plan.targetNodeId);
    if (!node || node.type !== "TEXT") {
      throw new Error("폰트 크기를 변경할 텍스트를 찾지 못했습니다.");
    }

    const targetFontSize = Number(plan.targetFontSize);
    if (!Number.isFinite(targetFontSize) || targetFontSize <= 0) {
      throw new Error("적용할 폰트 크기가 올바르지 않습니다.");
    }

    await loadFontsForTextNode(node);
    if (typeof node.characters === "string" && node.characters.length > 0 && typeof node.setRangeFontSize === "function") {
      node.setRangeFontSize(0, node.characters.length, targetFontSize);
      return;
    }

    throw new Error("이 텍스트는 폰트 크기를 직접 조정할 수 없습니다.");
  }

  function applySpacingPlan(plan) {
    const node = figma.getNodeById(plan.targetNodeId);
    if (!node) {
      throw new Error("간격을 조정할 레이어를 찾지 못했습니다.");
    }

    const changes = Array.isArray(plan.changes) ? plan.changes : [];
    if (!changes.length) {
      throw new Error("적용할 간격 값이 비어 있습니다.");
    }

    for (const change of changes) {
      if (!change || typeof change.field !== "string") {
        continue;
      }
      if (!(change.field in node)) {
        continue;
      }
      const nextValue = Math.max(0, Number(change.value) || 0);
      node[change.field] = nextValue;
    }
  }

  function supportsAnnotations(nodes) {
    const sampleNode = Array.isArray(nodes) && nodes.length > 0 ? nodes[0] : null;
    return !!sampleNode && "annotations" in sampleNode;
  }

  async function ensureAnnotationCategory(requestedColor, options) {
    if (!figma.annotations || typeof figma.annotations.getAnnotationCategoriesAsync !== "function") {
      return null;
    }

    try {
      const createIfMissing = !options || options.createIfMissing !== false;
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

      if (!createIfMissing || typeof figma.annotations.addAnnotationCategoryAsync !== "function") {
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

  async function getManagedDiagnosisCategories() {
    const managed = {
      consistency: null,
      accessibility: null,
    };

    if (!figma.annotations || typeof figma.annotations.getAnnotationCategoriesAsync !== "function") {
      return managed;
    }

    try {
      const categories = await figma.annotations.getAnnotationCategoriesAsync();
      if (!Array.isArray(categories)) {
        return managed;
      }

      for (const category of categories) {
        if (!category || typeof category.label !== "string") {
          continue;
        }
        if (category.label === ANNOTATION_CATEGORY_LABEL) {
          managed.consistency = category;
          continue;
        }
        if (category.label === ACCESSIBILITY_ANNOTATION_CATEGORY_LABEL) {
          managed.accessibility = category;
        }
      }
    } catch (error) {}

    return managed;
  }

  function applyConsistencyAnnotations(nodes, issues, category) {
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
        const preserved = existing.filter((annotation) => !isManagedConsistencyAnnotation(annotation, category));
        const removedCount = Math.max(0, existing.length - preserved.length);

        if (removedCount > 0) {
          removedAnnotationCount += removedCount;
        }
        if (removedCount > 0 && nodeIssues.length === 0) {
          clearedNodeCount += 1;
        }

        node.annotations = preserved.concat(nodeIssues.map((issue) => buildConsistencyAnnotation(issue, category)));
        if (nodeIssues.length > 0) {
          annotatedNodeCount += 1;
          annotationCount += nodeIssues.length;
        }
      } catch (error) {
        if (nodeIssues.length > 0) {
          skipped.push({
            label: safeName(node),
            reason: normalizeErrorMessage(error, "디자인 일관성 주석을 추가하지 못했습니다."),
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
      modeLabel: annotationCount > 0 ? "Blue Dev Mode annotation" : "Result only",
      categoryLabel: category && category.label ? category.label : ANNOTATION_CATEGORY_LABEL,
    };
  }

  function removeDiagnosisAnnotations(nodes, managedCategories) {
    const cleared = [];
    const skipped = [];
    let clearedNodeCount = 0;
    let removedAnnotationCount = 0;
    let removedAccessibilityAnnotationCount = 0;
    let removedConsistencyAnnotationCount = 0;
    const categories = managedCategories && typeof managedCategories === "object" ? managedCategories : {};
    const consistencyCategory = categories.consistency || null;
    const accessibilityCategory = categories.accessibility || null;

    for (const node of Array.isArray(nodes) ? nodes : []) {
      let managedAnnotations = [];
      let removedNodeAccessibilityCount = 0;
      let removedNodeConsistencyCount = 0;

      try {
        const existing = Array.isArray(node.annotations) ? Array.from(node.annotations) : [];
        managedAnnotations = existing.filter(
          (annotation) =>
            isManagedConsistencyAnnotation(annotation, consistencyCategory) ||
            isManagedAccessibilityAnnotation(annotation, accessibilityCategory)
        );
        if (!managedAnnotations.length) {
          continue;
        }

        managedAnnotations.forEach((annotation) => {
          if (isManagedConsistencyAnnotation(annotation, consistencyCategory)) {
            removedNodeConsistencyCount += 1;
            return;
          }
          if (isManagedAccessibilityAnnotation(annotation, accessibilityCategory)) {
            removedNodeAccessibilityCount += 1;
          }
        });

        const preserved = existing.filter(
          (annotation) =>
            !isManagedConsistencyAnnotation(annotation, consistencyCategory) &&
            !isManagedAccessibilityAnnotation(annotation, accessibilityCategory)
        );
        node.annotations = preserved;
        clearedNodeCount += 1;
        removedAnnotationCount += managedAnnotations.length;
        removedAccessibilityAnnotationCount += removedNodeAccessibilityCount;
        removedConsistencyAnnotationCount += removedNodeConsistencyCount;
        cleared.push({
          nodeId: node.id,
          nodeName: safeName(node),
          removedCount: managedAnnotations.length,
          removedAccessibilityCount: removedNodeAccessibilityCount,
          removedConsistencyCount: removedNodeConsistencyCount,
        });
      } catch (error) {
        if (!managedAnnotations.length) {
          continue;
        }

        skipped.push({
          label: safeName(node),
          reason: normalizeErrorMessage(error, "디자인 진단 주석을 정리하지 못했습니다."),
        });
      }
    }

    return {
      cleared,
      skipped,
      clearedNodeCount,
      removedAnnotationCount,
      removedAccessibilityAnnotationCount,
      removedConsistencyAnnotationCount,
    };
  }

  function buildConsistencyAnnotation(issue, category) {
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

  function isManagedConsistencyAnnotation(annotation, category) {
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

  function isManagedAccessibilityAnnotation(annotation, category) {
    if (!annotation || typeof annotation !== "object") {
      return false;
    }

    if (category && category.id && annotation.categoryId === category.id) {
      return true;
    }

    const label =
      typeof annotation.label === "string" ? annotation.label : typeof annotation.labelMarkdown === "string" ? annotation.labelMarkdown : "";
    return (
      typeof label === "string" &&
      (label.startsWith(ACCESSIBILITY_ANNOTATION_LABEL_PREFIX) ||
        label.startsWith(`[${ACCESSIBILITY_ANNOTATION_LABEL_PREFIX}]`))
    );
  }

  function buildResultOnlyAnnotation(issues, reason) {
    const skipped = [];
    if (Array.isArray(issues) && issues.length > 0 && reason) {
      skipped.push({
        label: "주석 미지원",
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

  function collectPaintEntries(node, entry, bucket) {
    collectPaintEntriesFromArray(node, entry, "fills", node.fills, bucket, node.type === "TEXT" ? "text" : "fills");
    if (node.type !== "TEXT") {
      collectPaintEntriesFromArray(node, entry, "strokes", node.strokes, bucket, "strokes");
    }
  }

  function collectPaintEntriesFromArray(node, entry, property, paints, bucket, role) {
    if (!Array.isArray(paints)) {
      return;
    }

    for (let index = 0; index < paints.length; index += 1) {
      const paint = paints[index];
      if (!paint || paint.visible === false || paint.type !== "SOLID" || !paint.color) {
        continue;
      }

      const opacity = typeof paint.opacity === "number" && Number.isFinite(paint.opacity) ? paint.opacity : 1;
      if (opacity < 0.95) {
        continue;
      }

      bucket.push({
        node,
        nodeId: node.id,
        nodeName: entry.name,
        nodeType: entry.type,
        property,
        paintIndex: index,
        role,
        color: cloneColor(paint.color),
        hex: rgbToHex(paint.color),
        opacity,
        order: entry.order,
      });
    }
  }

  function buildTextEntry(node, entry) {
    const value = getTextValue(node);
    return {
      node,
      nodeId: node.id,
      nodeName: entry.name,
      nodeType: entry.type,
      text: value,
      fontFamily: resolveUniformFontFamily(node),
      fontSize: resolveUniformFontSize(node),
      bounds: entry.bounds,
      order: entry.order,
      depth: entry.depth,
      rootId: entry.rootId,
      parentId: entry.parentId,
    };
  }

  function collectSpacingEntries(node, entry, bucket) {
    if (!hasLayout(node)) {
      return;
    }

    if (typeof node.itemSpacing === "number" && Number.isFinite(node.itemSpacing) && node.itemSpacing > 0) {
      bucket.push({
        node,
        nodeId: node.id,
        nodeName: entry.name,
        nodeType: entry.type,
        kind: "gap",
        label: "간격",
        value: roundValue(node.itemSpacing),
        fields: ["itemSpacing"],
      });
    }

    const paddingFields = [
      { field: "paddingTop", label: "상단 여백", value: node.paddingTop },
      { field: "paddingRight", label: "우측 여백", value: node.paddingRight },
      { field: "paddingBottom", label: "하단 여백", value: node.paddingBottom },
      { field: "paddingLeft", label: "좌측 여백", value: node.paddingLeft },
    ].filter((item) => typeof item.value === "number" && Number.isFinite(item.value) && item.value > 0);

    if (paddingFields.length === 4) {
      const uniqueValues = uniqueNumbers(paddingFields.map((item) => roundValue(item.value)));
      if (uniqueValues.length === 1) {
        bucket.push({
          node,
          nodeId: node.id,
          nodeName: entry.name,
          nodeType: entry.type,
          kind: "padding",
          label: "패딩",
          value: uniqueValues[0],
          fields: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
        });
        return;
      }
    }

    for (const item of paddingFields) {
      bucket.push({
        node,
        nodeId: node.id,
        nodeName: entry.name,
        nodeType: entry.type,
        kind: item.field,
        label: item.label,
        value: roundValue(item.value),
        fields: [item.field],
      });
    }
  }

  function supportsAnnotationsOnNode(node) {
    return !!node && "annotations" in node;
  }

  function canEditPaintEntry(entry) {
    return !!entry && !!entry.node && entry.property in entry.node && Array.isArray(entry.node[entry.property]);
  }

  function canAdjustFontSize(node) {
    return !!node && node.type === "TEXT";
  }

  function hasLayout(node) {
    return !!node && typeof node.layoutMode === "string" && node.layoutMode !== "NONE";
  }

  function getTextValue(node) {
    return typeof node.characters === "string" ? truncateText(node.characters, 72) : "";
  }

  function truncateText(value, limit) {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    const maxLength = typeof limit === "number" ? limit : 48;
    if (!normalized) {
      return "";
    }
    return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3)}...` : normalized;
  }

  function resolveUniformFontFamily(node) {
    if (!node || node.type !== "TEXT") {
      return "";
    }
    if (node.fontName && node.fontName !== figma.mixed && typeof node.fontName === "object") {
      return node.fontName.family || "";
    }

    if (node.fontName === figma.mixed && typeof node.getRangeAllFontNames === "function" && typeof node.characters === "string") {
      try {
        const rangeFonts = node.getRangeAllFontNames(0, node.characters.length);
        const families = Array.from(
          new Set(
            rangeFonts
              .filter((fontName) => fontName && typeof fontName.family === "string" && fontName.family.trim())
              .map((fontName) => fontName.family.trim())
          )
        );
        return families.length === 1 ? families[0] : "Mixed";
      } catch (error) {
        return "Mixed";
      }
    }

    return "";
  }

  function resolveUniformFontSize(node) {
    if (!node || node.type !== "TEXT") {
      return null;
    }
    if (typeof node.fontSize === "number" && Number.isFinite(node.fontSize)) {
      return roundValue(node.fontSize);
    }
    return null;
  }

  function findNearestColorToken(color, tokenItems) {
    let best = null;
    for (const item of tokenItems) {
      const distance = colorDistance(color, item.color);
      if (!best || distance < best.distance) {
        best = Object.assign({}, item, {
          distance,
        });
      }
    }
    return best;
  }

  function findNearestNumericToken(value, tokenValues) {
    let best = null;
    for (const candidate of tokenValues) {
      if (typeof candidate !== "number" || !Number.isFinite(candidate)) {
        continue;
      }
      const distance = Math.abs(candidate - value);
      if (best === null || distance < Math.abs(best - value)) {
        best = candidate;
      }
    }
    return best;
  }

  function isOnFourPointGrid(value) {
    return Math.abs(value - Math.round(value / 4) * 4) < 0.01;
  }

  function colorDistance(left, right) {
    if (!left || !right) {
      return Number.POSITIVE_INFINITY;
    }
    const red = Number(left.r || 0) - Number(right.r || 0);
    const green = Number(left.g || 0) - Number(right.g || 0);
    const blue = Number(left.b || 0) - Number(right.b || 0);
    return Math.sqrt(red * red + green * green + blue * blue);
  }

  function uniqueNumbers(values) {
    const seen = new Set();
    const result = [];
    for (const value of values) {
      const key = String(value);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(value);
    }
    return result;
  }

  function uniqueStrings(values, limit) {
    const seen = new Set();
    const result = [];
    for (const value of values) {
      const normalized = typeof value === "string" ? value.trim() : "";
      if (!normalized || seen.has(normalized)) {
        continue;
      }
      seen.add(normalized);
      result.push(normalized);
      if (typeof limit === "number" && result.length >= limit) {
        break;
      }
    }
    return result;
  }

  function getAiHelper() {
    const helper = globalScope.__PIGMA_AI_LLM__;
    return helper &&
      typeof helper.requestJsonTask === "function" &&
      typeof helper.hasConfiguredAiAsync === "function"
      ? helper
      : null;
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

  function inferDesignContext(options) {
    const corpus = `${options.rootNames.join(" ")} ${options.textSamples.join(" ")}`.toLowerCase();
    const categories = [
      {
        label: "로그인/인증 화면",
        reason: "로그인, 이메일, 비밀번호 계열 텍스트가 함께 보입니다.",
        keywords: ["login", "sign in", "sign up", "email", "password", "로그인", "이메일", "비밀번호", "회원가입"],
      },
      {
        label: "대시보드/리포트",
        reason: "숫자, 표, 카드형 정보가 많은 업무용 화면처럼 보입니다.",
        keywords: ["dashboard", "analytics", "report", "chart", "table", "대시보드", "리포트", "차트", "테이블"],
      },
      {
        label: "랜딩/프로모션",
        reason: "CTA 문구와 소개성 텍스트가 함께 나타납니다.",
        keywords: ["get started", "learn more", "shop", "download", "discover", "시작", "자세히", "다운로드", "구매"],
      },
      {
        label: "모달/다이얼로그",
        reason: "짧은 안내 텍스트와 확인/취소 계열 버튼이 보입니다.",
        keywords: ["cancel", "confirm", "delete", "ok", "취소", "확인", "삭제"],
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
      if (category.label === "모달/다이얼로그" && options.selectionBounds && options.selectionBounds.width <= 720) {
        score += 1;
      }
      if (category.label === "대시보드/리포트" && options.stats.textNodeCount >= 8) {
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

    if (options.topTypes.length > 0) {
      return {
        label: "일반 UI 화면",
        reason: `${formatNodeType(options.topTypes[0].type || options.topTypes[0].key)} 중심 레이아웃입니다.`,
        score: 0,
      };
    }

    return {
      label: "선택 영역",
      reason: "선택된 레이어 집합을 기준으로 검사했습니다.",
      score: 0,
    };
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
    if (!key && key !== 0) {
      return;
    }
    map.set(key, (map.get(key) || 0) + 1);
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

  function isNodeVisible(node) {
    return !!node && node.visible !== false;
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
        return "원형";
      default:
        return type;
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
