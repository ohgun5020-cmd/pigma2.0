;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_PIXEL_PERFECT_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const AI_DESIGN_READ_CACHE_KEY = "pigma:ai-design-read-cache:v1";
  const AI_PIXEL_PERFECT_CACHE_KEY = "pigma:ai-pixel-perfect-cache:v1";
  const AI_PIXEL_PERFECT_CLEAR_CACHE_KEY = "pigma:ai-pixel-perfect-clear-cache:v1";
  const PATCH_VERSION = 5;
  const RESULT_PREVIEW_LIMIT = 80;
  const VALUE_EPSILON = 0.0001;
  const EFFECT_RADIUS_KEYS = new Set(["radius", "spread", "startRadius", "endRadius"]);
  const OPACITY_PERCENT_SCALE = 100;
  const ANNOTATION_CATEGORY_LABEL = "Pigma Perfect pixel";
  const ANNOTATION_CATEGORY_COLOR = "red";
  const ANNOTATION_LABEL_PREFIX = "Pigma Perfect pixel";
  const ANNOTATION_CHANGE_PREVIEW_LIMIT = 4;
  let activePixelPerfectTask = "";

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isAiPixelPerfectMessage(message)) {
      if (message.type === "request-ai-pixel-perfect-cache") {
        await postCachedResult();
        return;
      }

      if (message.type === "request-ai-pixel-perfect-clear-cache") {
        await postCachedClearResult();
        return;
      }

      if (message.type === "run-ai-pixel-perfect-clear") {
        await withPixelPerfectTaskLock("clear", runPixelPerfectClear);
        return;
      }

      await withPixelPerfectTaskLock("apply", runPixelPerfect);
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_PIXEL_PERFECT_PATCH__ = true;

  function isAiPixelPerfectMessage(message) {
    return (
      !!message &&
      (message.type === "request-ai-pixel-perfect-cache" ||
        message.type === "run-ai-pixel-perfect" ||
        message.type === "request-ai-pixel-perfect-clear-cache" ||
        message.type === "run-ai-pixel-perfect-clear")
    );
  }

  async function withPixelPerfectTaskLock(task, runner) {
    if (activePixelPerfectTask) {
      if (activePixelPerfectTask === task) {
        postPixelPerfectTaskStatus(task, "running", getPixelPerfectTaskRunningMessage(task));
      } else {
        postPixelPerfectTaskError(
          task,
          "다른 픽셀 교정 작업이 이미 진행 중입니다. 현재 작업이 끝난 뒤 다시 실행해 주세요."
        );
      }
      return false;
    }

    activePixelPerfectTask = task;
    try {
      await runner();
      return true;
    } finally {
      activePixelPerfectTask = "";
    }
  }

  function getPixelPerfectTaskRunningMessage(task) {
    if (task === "clear") {
      return "Removing pixel-perfect Dev Mode annotations from the current selection.";
    }
    return "소수점 보정 후보를 분석하고 정수 스냅 적용 중입니다.";
  }

  function postPixelPerfectTaskStatus(task, status, message) {
    if (task === "clear") {
      postClearStatus(status, message);
      return;
    }
    postStatus(status, message);
  }

  function postPixelPerfectTaskError(task, message) {
    if (task === "clear") {
      figma.ui.postMessage({
        type: "ai-pixel-perfect-clear-error",
        message,
      });
      return;
    }
    figma.ui.postMessage({
      type: "ai-pixel-perfect-error",
      message,
    });
  }

  async function runPixelPerfect() {
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    postStatus("running", "소수점 보정 후보를 분석하고 정수 스냅 적용 중입니다.");

    try {
      const result = await applyPixelPerfect();
      await writeCachedResult(result);

      figma.ui.postMessage({
        type: "ai-pixel-perfect-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      const summary = result.summary || {};
      const appliedCount = summary.appliedCount || 0;
      const excludedCount = summary.excludedCount || 0;
      const annotationCount = summary.annotationCount || 0;
      const annotationSuffix = annotationCount > 0 ? `, annotations ${annotationCount}` : "";
      if (appliedCount > 0) {
        figma.notify(`Pixel perfect complete (${appliedCount} applied, ${excludedCount} excluded${annotationSuffix})`, {
          timeout: 2200,
        });
      } else if ((summary.candidateCount || 0) === 0) {
        figma.notify("픽셀 퍼팩트 후보가 없습니다.", { timeout: 1800 });
      } else {
        figma.notify(`Pixel perfect complete (0 applied, ${excludedCount} excluded${annotationSuffix})`, {
          timeout: 2200,
        });
      }
    } catch (error) {
      const message = normalizeErrorMessage(error, "픽셀 퍼팩트 적용에 실패했습니다.");
      figma.ui.postMessage({
        type: "ai-pixel-perfect-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function runPixelPerfectClear() {
    const runSelectionSignature = getSelectionSignature(figma.currentPage.selection);
    postClearStatus("running", "Removing pixel-perfect Dev Mode annotations from the current selection.");

    try {
      const result = await clearPixelPerfectAnnotations();
      await writeCachedClearResult(result);

      figma.ui.postMessage({
        type: "ai-pixel-perfect-clear-result",
        result,
        matchesCurrentSelection: matchesSelectionSignature(result.selectionSignature || runSelectionSignature),
      });

      const summary = result.summary || {};
      const removedAnnotationCount = summary.removedAnnotationCount || 0;
      if (removedAnnotationCount > 0) {
        figma.notify(`Pixel perfect annotations cleared (${removedAnnotationCount} removed)`, {
          timeout: 2200,
        });
      } else {
        figma.notify("No pixel-perfect annotations found in the current selection.", { timeout: 1800 });
      }
    } catch (error) {
      const message = normalizeErrorMessage(error, "Failed to clear the pixel-perfect annotations.");
      figma.ui.postMessage({
        type: "ai-pixel-perfect-clear-error",
        message,
        matchesCurrentSelection: matchesSelectionSignature(runSelectionSignature),
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  async function postCachedResult() {
    const result = await readCachedResult();
    figma.ui.postMessage({
      type: "ai-pixel-perfect-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  async function postCachedClearResult() {
    const result = await readCachedClearResult();
    figma.ui.postMessage({
      type: "ai-pixel-perfect-clear-cache",
      result,
      matchesCurrentSelection: matchesCurrentSelection(result),
    });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-pixel-perfect-status",
      status,
      message,
    });
  }

  function postClearStatus(status, message) {
    figma.ui.postMessage({
      type: "ai-pixel-perfect-clear-status",
      status,
      message,
    });
  }

  async function applyPixelPerfect() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const designReadResult = await readDesignReadCache();
    const context = buildRunContext(selection, designReadResult);
    const collection = collectPixelCandidates(selection);

    if (!collection.candidates.length) {
      return buildPixelPerfectResult({
        selection,
        context,
        source: "local-rules",
        aiSummary: buildLocalDecisionSummary([]),
        applied: [],
        annotations: [],
        excluded: collection.excluded,
        skipped: [],
        candidateCount: 0,
        annotationSummary: {
          applied: [],
          skipped: [],
          annotatedNodeCount: 0,
          annotationCount: 0,
          modeLabel: "Result only",
          categoryLabel: "",
        },
      });
    }

    const aiDecisionSummary = await requestAiDecisions(collection.candidates, context);
    const plans = buildDecisionPlans(collection.candidates, aiDecisionSummary);
    const applied = [];
    const appliedPlans = [];
    const skipped = [];

    for (const plan of plans) {
      try {
        await applyPlannedChange(plan);
        appliedPlans.push(plan);
        applied.push(buildAppliedEntry(plan));
      } catch (error) {
        skipped.push({
          label: `${plan.candidate.nodeName} / ${plan.candidate.label}`,
          reason: normalizeErrorMessage(error, "Failed to apply the snap target."),
        });
      }
    }

    const annotationSupported = supportsAnnotationsForPlans(appliedPlans);
    const annotationCategory = annotationSupported ? await ensureAnnotationCategory(ANNOTATION_CATEGORY_COLOR) : null;
    const annotationApplied = annotationSupported
      ? applyPixelPerfectAnnotations(appliedPlans, annotationCategory)
      : buildResultOnlyAnnotation(
          appliedPlans,
          appliedPlans.length > 0
            ? "Figma Annotation API is not available for the updated nodes, so the result stays in the panel only."
            : ""
        );

    return buildPixelPerfectResult({
      selection,
      context,
      source: "local-rules",
      aiSummary: aiDecisionSummary,
      applied,
      annotations: annotationApplied.applied,
      excluded: collection.excluded,
      skipped: skipped.concat(annotationApplied.skipped),
      candidateCount: collection.candidates.length,
      annotationSummary: annotationApplied,
    });
  }

  async function clearPixelPerfectAnnotations() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택해 주세요.");
    }

    const designReadResult = await readDesignReadCache();
    const context = buildRunContext(selection, designReadResult);
    const annotationCollection = collectAnnotationNodes(selection);
    const category = await ensureAnnotationCategory(ANNOTATION_CATEGORY_COLOR, { createIfMissing: false });
    const cleared = removePixelPerfectAnnotations(annotationCollection.nodes, category);

    return buildPixelPerfectClearResult({
      selection,
      context,
      scannedNodeCount: annotationCollection.scannedNodeCount,
      category,
      cleared,
    });
  }

  function buildPixelPerfectClearResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const context = options.context && typeof options.context === "object" ? options.context : {};
    const cleared = options.cleared && typeof options.cleared === "object" ? options.cleared : {};
    const clearedItems = Array.isArray(cleared.cleared) ? cleared.cleared : [];
    const skipped = Array.isArray(cleared.skipped) ? cleared.skipped : [];
    const category = options.category && typeof options.category === "object" ? options.category : null;
    const scannedNodeCount =
      typeof options.scannedNodeCount === "number" && Number.isFinite(options.scannedNodeCount) ? options.scannedNodeCount : 0;

    return {
      version: PATCH_VERSION,
      source: "managed-annotation-clear",
      selectionSignature: getSelectionSignature(selection),
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: context.selectionLabel || formatSelectionLabel(selection),
        contextLabel: context.contextLabel || "General UI",
        rootCount: selection.length,
        scannedNodeCount,
        removedAnnotationCount: cleared.removedAnnotationCount || 0,
        clearedNodeCount: cleared.clearedNodeCount || 0,
        skippedCount: skipped.length,
        mode: "annotation-clear",
        modeLabel: "Dev Mode annotation clear",
        categoryLabel: category && category.label ? category.label : ANNOTATION_CATEGORY_LABEL,
      },
      cleared: clearedItems.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function buildPixelPerfectResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const context = options.context && typeof options.context === "object" ? options.context : {};
    const applied = Array.isArray(options.applied) ? options.applied : [];
    const annotations = Array.isArray(options.annotations) ? options.annotations : [];
    const excluded = Array.isArray(options.excluded) ? options.excluded : [];
    const skipped = Array.isArray(options.skipped) ? options.skipped : [];
    const aiSummary = options.aiSummary && typeof options.aiSummary === "object" ? options.aiSummary : {};
    const annotationSummary =
      options.annotationSummary && typeof options.annotationSummary === "object" ? options.annotationSummary : {};
    const candidateCount =
      typeof options.candidateCount === "number" && Number.isFinite(options.candidateCount) ? options.candidateCount : 0;

    return {
      version: PATCH_VERSION,
      source: options.source || "local-rules",
      selectionSignature: getSelectionSignature(selection),
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: context.selectionLabel || formatSelectionLabel(selection),
        contextLabel: context.contextLabel || "General UI",
        rootCount: selection.length,
        candidateCount,
        appliedCount: applied.length,
        excludedCount: excluded.length,
        skippedCount: skipped.length,
        annotationCount: annotationSummary.annotationCount || 0,
        annotatedNodeCount: annotationSummary.annotatedNodeCount || 0,
        annotationSkippedCount: Array.isArray(annotationSummary.skipped) ? annotationSummary.skipped.length : 0,
        aiDecisionCount: aiSummary.aiDecisionCount || 0,
        fallbackDecisionCount: aiSummary.fallbackDecisionCount || 0,
        aiStatusLabel: aiSummary.aiStatusLabel || "로컬 규칙",
        aiProviderLabel: aiSummary.aiProviderLabel || "",
        aiModelLabel: aiSummary.aiModelLabel || "",
        reviewStrategy: aiSummary.reviewStrategy || "0.5 stroke/blur 예외 유지 후 최근접 정수 스냅",
        modeLabel: annotationSummary.modeLabel || "Result only",
        categoryLabel: annotationSummary.categoryLabel || "",
      },
      applied: applied.slice(0, RESULT_PREVIEW_LIMIT),
      annotations: annotations.slice(0, RESULT_PREVIEW_LIMIT),
      excluded: excluded.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function buildRunContext(selection, designReadResult) {
    const signature = getSelectionSignature(selection);
    const validDesignRead =
      designReadResult &&
      typeof designReadResult === "object" &&
      designReadResult.selectionSignature === signature &&
      designReadResult.summary &&
      typeof designReadResult.summary === "object";

    return {
      selectionLabel: validDesignRead && typeof designReadResult.summary.selectionLabel === "string"
        ? designReadResult.summary.selectionLabel
        : formatSelectionLabel(selection),
      contextLabel: validDesignRead && typeof designReadResult.summary.contextLabel === "string"
        ? designReadResult.summary.contextLabel
        : "일반 UI 화면",
      languageLabel: validDesignRead && typeof designReadResult.summary.languageLabel === "string"
        ? designReadResult.summary.languageLabel
        : "",
      designReadPixelSummary:
        validDesignRead &&
        designReadResult.pixel &&
        typeof designReadResult.pixel === "object" &&
        typeof designReadResult.pixel.aiSummary === "string"
          ? designReadResult.pixel.aiSummary
          : "",
    };
  }

  function collectPixelCandidates(selection) {
    const candidates = [];
    const excluded = [];
    const stack = [];

    for (let index = selection.length - 1; index >= 0; index -= 1) {
      stack.push(selection[index]);
    }

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      collectNodeCandidates(node, candidates, excluded);

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return { candidates, excluded };
  }

  function collectAnnotationNodes(selection) {
    const nodes = [];
    const stack = [];
    let scannedNodeCount = 0;

    for (let index = selection.length - 1; index >= 0; index -= 1) {
      stack.push(selection[index]);
    }

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      scannedNodeCount += 1;

      if (supportsAnnotationsOnNode(node)) {
        nodes.push(node);
      }

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return { nodes, scannedNodeCount };
  }

  function collectNodeCandidates(node, candidates, excluded) {
    const nodeName = safeName(node);
    const nodeType = String(node.type || "UNKNOWN");
    const resizable = canResizeNode(node);

    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "rotation",
      label: "rotation",
      value: node.rotation,
      kind: "direct",
      category: "rotation",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "x",
      label: "x",
      value: getVisualPositionValue(node, "x"),
      kind: "position",
      category: "position",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "y",
      label: "y",
      value: getVisualPositionValue(node, "y"),
      kind: "position",
      category: "position",
    });
    if (resizable) {
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: "width",
        label: "width",
        value: node.width,
        kind: "size",
        category: "size",
      });
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: "height",
        label: "height",
        value: node.height,
        kind: "size",
        category: "size",
      });
    }

    collectAutoLayoutCandidates(node, nodeName, nodeType, candidates, excluded);
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "strokeWeight",
      label: "stroke",
      value: node.strokeWeight,
      kind: "direct",
      category: "stroke",
    });

    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "cornerRadius",
      label: "corner radius",
      value: node.cornerRadius,
      kind: "direct",
      category: "radius",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "topLeftRadius",
      label: "top-left radius",
      value: node.topLeftRadius,
      kind: "direct",
      category: "radius",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "topRightRadius",
      label: "top-right radius",
      value: node.topRightRadius,
      kind: "direct",
      category: "radius",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "bottomLeftRadius",
      label: "bottom-left radius",
      value: node.bottomLeftRadius,
      kind: "direct",
      category: "radius",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "bottomRightRadius",
      label: "bottom-right radius",
      value: node.bottomRightRadius,
      kind: "direct",
      category: "radius",
    });

    collectEffectCandidates(node, nodeName, nodeType, candidates, excluded);
    collectTextCandidates(node, nodeName, nodeType, candidates, excluded);
    collectPaintOpacityCandidates(node, nodeName, nodeType, "fills", "fill", candidates, excluded);
    collectPaintOpacityCandidates(node, nodeName, nodeType, "strokes", "stroke paint", candidates, excluded);
    collectLayerOpacityCandidate(node, nodeName, nodeType, candidates, excluded);
  }

  function collectAutoLayoutCandidates(node, nodeName, nodeType, candidates, excluded) {
    if (!hasAutoLayout(node)) {
      return;
    }

    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "itemSpacing",
      label: "auto layout gap",
      value: typeof node.itemSpacing === "number" ? node.itemSpacing : null,
      kind: "direct",
      category: "auto-layout-gap",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "counterAxisSpacing",
      label: "auto layout wrap gap",
      value: typeof node.counterAxisSpacing === "number" ? node.counterAxisSpacing : null,
      kind: "direct",
      category: "auto-layout-gap",
    });

    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "paddingTop",
      label: "padding top",
      value: typeof node.paddingTop === "number" ? node.paddingTop : null,
      kind: "direct",
      category: "auto-layout-padding",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "paddingRight",
      label: "padding right",
      value: typeof node.paddingRight === "number" ? node.paddingRight : null,
      kind: "direct",
      category: "auto-layout-padding",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "paddingBottom",
      label: "padding bottom",
      value: typeof node.paddingBottom === "number" ? node.paddingBottom : null,
      kind: "direct",
      category: "auto-layout-padding",
    });
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "paddingLeft",
      label: "padding left",
      value: typeof node.paddingLeft === "number" ? node.paddingLeft : null,
      kind: "direct",
      category: "auto-layout-padding",
    });
  }

  function collectEffectCandidates(node, nodeName, nodeType, candidates, excluded) {
    if (!node || !Array.isArray(node.effects) || node.effects.length === 0) {
      return;
    }

    for (let index = 0; index < node.effects.length; index += 1) {
      const effect = node.effects[index];
      if (!effect || effect.visible === false) {
        continue;
      }

      const effectLabel = formatEffectLabel(effect);
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `effects.${index}.radius`,
        label: `${effectLabel} radius`,
        value: effect.radius,
        kind: "effect",
        category: "effect-blur",
        effectIndex: index,
        effectType: String(effect.type || ""),
        effectPath: ["radius"],
      });
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `effects.${index}.spread`,
        label: `${effectLabel} spread`,
        value: effect.spread,
        kind: "effect",
        category: "effect-blur",
        effectIndex: index,
        effectType: String(effect.type || ""),
        effectPath: ["spread"],
      });
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `effects.${index}.offset.x`,
        label: `${effectLabel} offset x`,
        value: effect.offset && effect.offset.x,
        kind: "effect",
        category: "effect-offset",
        effectIndex: index,
        effectType: String(effect.type || ""),
        effectPath: ["offset", "x"],
      });
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `effects.${index}.offset.y`,
        label: `${effectLabel} offset y`,
        value: effect.offset && effect.offset.y,
        kind: "effect",
        category: "effect-offset",
        effectIndex: index,
        effectType: String(effect.type || ""),
        effectPath: ["offset", "y"],
      });
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `effects.${index}.startRadius`,
        label: `${effectLabel} start radius`,
        value: effect.startRadius,
        kind: "effect",
        category: "effect-blur",
        effectIndex: index,
        effectType: String(effect.type || ""),
        effectPath: ["startRadius"],
      });
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `effects.${index}.endRadius`,
        label: `${effectLabel} end radius`,
        value: effect.endRadius,
        kind: "effect",
        category: "effect-blur",
        effectIndex: index,
        effectType: String(effect.type || ""),
        effectPath: ["endRadius"],
      });
    }
  }

  function collectTextCandidates(node, nodeName, nodeType, candidates, excluded) {
    if (!node || node.type !== "TEXT") {
      return;
    }

    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "fontSize",
      label: "font size",
      value: typeof node.fontSize === "number" ? node.fontSize : null,
      kind: "text-style",
      category: "text-size",
      meta: {
        textField: "fontSize",
      },
    });

    const lineHeight = getTextMetricDescriptor(node.lineHeight);
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "lineHeight",
      label: "line height",
      value: lineHeight ? lineHeight.value : null,
      kind: "text-style",
      category: "text-line-height",
      meta: {
        textField: "lineHeight",
        unit: lineHeight ? lineHeight.unit : "",
      },
    });

    const letterSpacing = getTextMetricDescriptor(node.letterSpacing);
    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "letterSpacing",
      label: "letter spacing",
      value: letterSpacing ? letterSpacing.value : null,
      kind: "text-style",
      category: "text-letter-spacing",
      meta: {
        textField: "letterSpacing",
        unit: letterSpacing ? letterSpacing.unit : "",
      },
    });

    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "paragraphSpacing",
      label: "paragraph spacing",
      value: typeof node.paragraphSpacing === "number" ? node.paragraphSpacing : null,
      kind: "text-style",
      category: "text-spacing",
      meta: {
        textField: "paragraphSpacing",
      },
    });
  }

  function collectPaintOpacityCandidates(node, nodeName, nodeType, paintListKey, paintLabel, candidates, excluded) {
    const paints = node && Array.isArray(node[paintListKey]) ? node[paintListKey] : null;
    if (!paints || paints.length === 0) {
      return;
    }

    for (let index = 0; index < paints.length; index += 1) {
      const paint = paints[index];
      if (!paint || paint.visible === false) {
        continue;
      }

      const opacity = typeof paint.opacity === "number" ? paint.opacity : 1;
      maybeAddCandidate({
        candidates,
        excluded,
        node,
        nodeName,
        nodeType,
        fieldKey: `${paintListKey}.${index}.opacity`,
        label: paints.length === 1 ? `${paintLabel} opacity` : `${paintLabel} ${index + 1} opacity`,
        value: opacity * OPACITY_PERCENT_SCALE,
        kind: "paint-opacity",
        category: "paint-opacity",
        meta: {
          paintListKey,
          paintIndex: index,
          valueScale: OPACITY_PERCENT_SCALE,
        },
      });
    }
  }

  function collectLayerOpacityCandidate(node, nodeName, nodeType, candidates, excluded) {
    if (!node || typeof node.opacity !== "number") {
      return;
    }

    maybeAddCandidate({
      candidates,
      excluded,
      node,
      nodeName,
      nodeType,
      fieldKey: "opacity",
      label: "layer opacity",
      value: node.opacity * OPACITY_PERCENT_SCALE,
      kind: "scaled-direct",
      category: "opacity",
      meta: {
        valueScale: OPACITY_PERCENT_SCALE,
      },
    });
  }

  function maybeAddCandidate(entry) {
    const value = entry.value;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return;
    }

    if (isIntegerValue(value)) {
      return;
    }

    if (shouldPreserveHalfStep(entry.category, entry.fieldKey, value)) {
      entry.excluded.push({
        label: `${entry.nodeName} / ${entry.label} ${formatNumber(value)}`,
        reason: preserveReasonForCategory(entry.category),
      });
      return;
    }

    const floorValue = Math.floor(value);
    const ceilValue = Math.ceil(value);
    entry.candidates.push({
      id: `${entry.node.id}:${entry.fieldKey}`,
      node: entry.node,
      nodeId: entry.node.id,
      nodeName: entry.nodeName,
      nodeType: entry.nodeType,
      fieldKey: entry.fieldKey,
      label: entry.label,
      kind: entry.kind,
      category: entry.category,
      currentValue: value,
      floorValue,
      ceilValue,
      nearestValue: selectNearestInteger(value),
      effectIndex: typeof entry.effectIndex === "number" ? entry.effectIndex : null,
      effectType: entry.effectType || "",
      effectPath: Array.isArray(entry.effectPath) ? entry.effectPath.slice() : null,
      meta: entry.meta && typeof entry.meta === "object" ? clonePlainObject(entry.meta) : null,
    });
  }

  function buildLocalDecisionSummary(candidates) {
    const candidateCount = Array.isArray(candidates) ? candidates.length : 0;
    return {
      usedAi: false,
      aiStatusLabel: "로컬 규칙",
      aiProviderLabel: "",
      aiModelLabel: "",
      aiDecisionCount: 0,
      fallbackDecisionCount: candidateCount,
      reviewStrategy: candidateCount > 0 ? "0.5 stroke/blur 예외 유지 후 최근접 정수 스냅" : "보정 대상 없음",
      decisionMap: new Map(),
    };
  }

  async function requestAiDecisions(candidates) {
    return buildLocalDecisionSummary(candidates);
  }

  function buildDecisionPlans(candidates) {
    const plans = [];
    for (const candidate of candidates) {
      plans.push({
        candidate,
        source: "local",
        targetValue: candidate.nearestValue,
        reason: buildLocalDecisionReason(candidate),
      });
    }

    return plans;
  }

  function buildLocalDecisionReason(candidate) {
    if (!candidate || typeof candidate !== "object") {
      return "가장 가까운 정수로 스냅했습니다.";
    }

    switch (candidate.category) {
      case "position":
        return "가장 가까운 정수 좌표로 스냅했습니다.";
      case "rotation":
        return "Snap rotation to the nearest whole degree.";
      case "size":
        return "가장 가까운 정수 크기로 스냅했습니다.";
      case "auto-layout-gap":
        return "가장 가까운 정수 오토레이아웃 간격으로 스냅했습니다.";
      case "auto-layout-padding":
        return "가장 가까운 정수 오토레이아웃 패딩으로 스냅했습니다.";
      case "radius":
        return "가장 가까운 정수 반경 값으로 스냅했습니다.";
      case "effect-blur":
      case "effect-offset":
        return "가장 가까운 정수 효과 값으로 스냅했습니다.";
      case "text-size":
      case "text-line-height":
      case "text-letter-spacing":
      case "text-spacing":
        return "가장 가까운 정수 텍스트 값으로 스냅했습니다.";
      case "paint-opacity":
      case "opacity":
        return "가장 가까운 정수 퍼센트로 스냅했습니다.";
      default:
        return "가장 가까운 정수로 스냅했습니다.";
    }
  }

  async function applyPlannedChange(plan) {
    const candidate = plan.candidate;
    const targetValue = plan.targetValue;
    if (!Number.isInteger(targetValue)) {
      throw new Error("정수 목표값이 아닙니다.");
    }

    if (candidate.kind === "position") {
      applyPositionChange(candidate.node, candidate.fieldKey, targetValue);
      return;
    }

    if (candidate.kind === "size") {
      applySizeChange(candidate.node, candidate.fieldKey, targetValue);
      return;
    }

    if (candidate.kind === "effect") {
      applyEffectChange(candidate.node, candidate.effectIndex, candidate.effectPath, targetValue);
      return;
    }

    if (candidate.kind === "text-style") {
      await applyTextStyleChange(candidate, targetValue);
      return;
    }

    if (candidate.kind === "paint-opacity") {
      applyPaintOpacityChange(candidate.node, candidate.meta, targetValue);
      return;
    }

    if (candidate.kind === "scaled-direct") {
      applyScaledDirectChange(candidate.node, candidate.fieldKey, candidate.meta, targetValue);
      return;
    }

    applyDirectChange(candidate.node, candidate.fieldKey, targetValue);
  }

  function applyPositionChange(node, fieldKey, targetValue) {
    const position = getVisualPosition(node);
    const currentX = position && typeof position.x === "number" ? position.x : null;
    const currentY = position && typeof position.y === "number" ? position.y : null;
    if (!Number.isFinite(currentX) || !Number.isFinite(currentY)) {
      throw new Error("position 속성을 읽을 수 없습니다.");
    }

    const desiredX = fieldKey === "x" ? targetValue : currentX;
    const desiredY = fieldKey === "y" ? targetValue : currentY;
    const deltaX = desiredX - currentX;
    const deltaY = desiredY - currentY;

    if (Math.abs(deltaX) <= VALUE_EPSILON && Math.abs(deltaY) <= VALUE_EPSILON) {
      return;
    }

    if ("x" in node && "y" in node) {
      try {
        node.x += deltaX;
        node.y += deltaY;
      } catch (error) {}
    }

    if (isVisualPositionCloseEnough(node, desiredX, desiredY)) {
      return;
    }

    if (Array.isArray(node.relativeTransform) && node.relativeTransform.length === 2) {
      const transform = node.relativeTransform;
      node.relativeTransform = [
        [transform[0][0], transform[0][1], roundValue(transform[0][2] + deltaX)],
        [transform[1][0], transform[1][1], roundValue(transform[1][2] + deltaY)],
      ];
    }

    if (!isVisualPositionCloseEnough(node, desiredX, desiredY)) {
      throw new Error("position 적용에 실패했습니다.");
    }
  }

  function getVisualPositionValue(node, axis) {
    const position = getVisualPosition(node);
    return position && typeof position[axis] === "number" ? position[axis] : null;
  }

  function getVisualPosition(node) {
    if (!node) {
      return null;
    }

    const nodeBounds = getAbsoluteBounds(node);
    if (nodeBounds) {
      const parentBounds = getAbsoluteBounds(node.parent);
      return {
        x: parentBounds ? nodeBounds.x - parentBounds.x : nodeBounds.x,
        y: parentBounds ? nodeBounds.y - parentBounds.y : nodeBounds.y,
      };
    }

    if (typeof node.x === "number" && typeof node.y === "number") {
      return {
        x: node.x,
        y: node.y,
      };
    }

    return null;
  }

  function getAbsoluteBounds(node) {
    if (!node || !node.absoluteBoundingBox) {
      return null;
    }

    const bounds = node.absoluteBoundingBox;
    if (
      typeof bounds.x !== "number" ||
      typeof bounds.y !== "number" ||
      !Number.isFinite(bounds.x) ||
      !Number.isFinite(bounds.y)
    ) {
      return null;
    }

    return bounds;
  }

  function isVisualPositionCloseEnough(node, expectedX, expectedY) {
    const position = getVisualPosition(node);
    return !!position && isCloseEnough(position.x, expectedX) && isCloseEnough(position.y, expectedY);
  }

  function applySizeChange(node, fieldKey, targetValue) {
    if (!canResizeNode(node)) {
      throw new Error("resize 지원 노드가 아닙니다.");
    }

    const currentWidth = typeof node.width === "number" ? node.width : null;
    const currentHeight = typeof node.height === "number" ? node.height : null;
    if (!Number.isFinite(currentWidth) || !Number.isFinite(currentHeight)) {
      throw new Error("현재 크기를 읽을 수 없습니다.");
    }

    const nextWidth = fieldKey === "width" ? targetValue : currentWidth;
    const nextHeight = fieldKey === "height" ? targetValue : currentHeight;
    if (nextWidth < 1 || nextHeight < 1) {
      throw new Error("1px 미만 크기는 적용할 수 없습니다.");
    }

    if (typeof node.resizeWithoutConstraints === "function") {
      node.resizeWithoutConstraints(nextWidth, nextHeight);
      return;
    }

    if (typeof node.resize === "function") {
      node.resize(nextWidth, nextHeight);
      return;
    }

    throw new Error("resize API를 사용할 수 없습니다.");
  }

  function applyDirectChange(node, fieldKey, targetValue) {
    if (!node || !(fieldKey in node)) {
      throw new Error("속성 접근에 실패했습니다.");
    }

    node[fieldKey] = targetValue;
  }

  function applyScaledDirectChange(node, fieldKey, meta, targetValue) {
    const valueScale = meta && typeof meta.valueScale === "number" && meta.valueScale > 0 ? meta.valueScale : 1;
    applyDirectChange(node, fieldKey, targetValue / valueScale);
  }

  function applyEffectChange(node, effectIndex, effectPath, targetValue) {
    if (!node || !Array.isArray(node.effects)) {
      throw new Error("effect 속성이 없습니다.");
    }

    const effects = cloneEffects(node.effects);
    const effect = typeof effectIndex === "number" ? effects[effectIndex] : null;
    if (!effect) {
      throw new Error("effect 대상을 찾지 못했습니다.");
    }

    if (!setNestedNumericValue(effect, effectPath, targetValue)) {
      throw new Error("effect 속성 쓰기에 실패했습니다.");
    }

    node.effects = effects;
  }

  async function applyTextStyleChange(candidate, targetValue) {
    const node = candidate && candidate.node;
    const meta = candidate && candidate.meta && typeof candidate.meta === "object" ? candidate.meta : {};
    const textField = typeof meta.textField === "string" ? meta.textField : "";
    if (!node || node.type !== "TEXT" || !textField) {
      throw new Error("text 속성 적용에 실패했습니다.");
    }

    await loadFontsForTextNode(node);

    if (textField === "fontSize" || textField === "paragraphSpacing") {
      if (typeof node[textField] !== "number") {
        throw new Error(`${textField} 값을 읽을 수 없습니다.`);
      }
      node[textField] = targetValue;
      return;
    }

    if (textField === "lineHeight" || textField === "letterSpacing") {
      const currentValue = node[textField];
      const unit = typeof meta.unit === "string" && meta.unit ? meta.unit : currentValue && currentValue.unit;
      if (!unit || currentValue === figma.mixed || !currentValue || typeof currentValue !== "object") {
        throw new Error(`${textField} 값을 수정할 수 없습니다.`);
      }

      node[textField] = {
        unit,
        value: targetValue,
      };
      return;
    }

    throw new Error("지원하지 않는 text 속성입니다.");
  }

  function applyPaintOpacityChange(node, meta, targetValue) {
    const paintListKey = meta && typeof meta.paintListKey === "string" ? meta.paintListKey : "";
    const paintIndex = meta && typeof meta.paintIndex === "number" ? meta.paintIndex : -1;
    const valueScale = meta && typeof meta.valueScale === "number" && meta.valueScale > 0 ? meta.valueScale : 1;
    const paints = node && Array.isArray(node[paintListKey]) ? node[paintListKey] : null;
    if (!paints || paintIndex < 0 || paintIndex >= paints.length) {
      throw new Error("paint opacity 적용에 실패했습니다.");
    }

    const clonedPaints = paints.map((paint) => clonePlainObject(paint));
    clonedPaints[paintIndex].opacity = clampNumber(targetValue / valueScale, 0, 1);
    node[paintListKey] = clonedPaints;
  }

  function buildAppliedEntry(plan) {
    return {
      nodeName: plan.candidate.nodeName,
      nodeType: plan.candidate.nodeType,
      field: plan.candidate.label,
      from: formatNumber(plan.candidate.currentValue),
      to: String(plan.targetValue),
      source: "로컬 규칙",
      reason: plan.reason,
    };
  }

  function supportsAnnotationsForPlans(plans) {
    return Array.isArray(plans) && plans.some((plan) => supportsAnnotationsOnNode(plan && plan.candidate && plan.candidate.node));
  }

  function supportsAnnotationsOnNode(node) {
    return !!node && "annotations" in node;
  }

  async function ensureAnnotationCategory(requestedColor, options) {
    if (!figma.annotations || typeof figma.annotations.getAnnotationCategoriesAsync !== "function") {
      return null;
    }

    try {
      const createIfMissing = !options || options.createIfMissing !== false;
      const categories = await figma.annotations.getAnnotationCategoriesAsync();
      const nextColor =
        typeof requestedColor === "string" && requestedColor.trim() ? requestedColor.trim().toLowerCase() : ANNOTATION_CATEGORY_COLOR;
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

  function applyPixelPerfectAnnotations(plans, category) {
    const applied = [];
    const skipped = [];
    const plansByNode = new Map();
    const unsupportedNodeIds = new Set();

    for (const plan of plans) {
      const node = plan && plan.candidate ? plan.candidate.node : null;
      if (!node) {
        continue;
      }

      if (!supportsAnnotationsOnNode(node)) {
        if (!unsupportedNodeIds.has(node.id)) {
          unsupportedNodeIds.add(node.id);
          skipped.push({
            label: safeName(node),
            reason: "This node type does not support Dev Mode annotations.",
          });
        }
        continue;
      }

      const bucket = plansByNode.get(node.id) || { node, plans: [] };
      bucket.plans.push(plan);
      plansByNode.set(node.id, bucket);
    }

    let annotatedNodeCount = 0;
    let annotationCount = 0;

    for (const bucket of plansByNode.values()) {
      const node = bucket.node;
      const nodePlans = bucket.plans;
      if (!node || !nodePlans.length) {
        continue;
      }

      try {
        const existing = Array.isArray(node.annotations) ? Array.from(node.annotations) : [];
        const preserved = existing.filter((annotation) => !isManagedPixelPerfectAnnotation(annotation, category));
        node.annotations = preserved.concat(buildPixelPerfectAnnotation(nodePlans, category));
        annotatedNodeCount += 1;
        annotationCount += 1;
        applied.push(buildPixelPerfectAnnotationResult(node, nodePlans, category));
      } catch (error) {
        skipped.push({
          label: safeName(node),
          reason: normalizeErrorMessage(error, "Failed to add the pixel-perfect annotation."),
        });
      }
    }

    return {
      applied,
      skipped,
      annotatedNodeCount,
      annotationCount,
      modeLabel: annotationCount > 0 ? "Direct apply + Dev Mode annotation" : "Result only",
      categoryLabel: category && category.label ? category.label : ANNOTATION_CATEGORY_LABEL,
    };
  }

  function removePixelPerfectAnnotations(nodes, category) {
    const cleared = [];
    const skipped = [];
    let clearedNodeCount = 0;
    let removedAnnotationCount = 0;

    for (const node of nodes) {
      let existing = [];
      let managedAnnotations = [];

      try {
        existing = Array.isArray(node.annotations) ? Array.from(node.annotations) : [];
        managedAnnotations = existing.filter((annotation) => isManagedPixelPerfectAnnotation(annotation, category));
        if (!managedAnnotations.length) {
          continue;
        }

        const preserved = existing.filter((annotation) => !isManagedPixelPerfectAnnotation(annotation, category));
        node.annotations = preserved;
        clearedNodeCount += 1;
        removedAnnotationCount += managedAnnotations.length;
        cleared.push({
          nodeId: node.id,
          nodeName: safeName(node),
          removedCount: managedAnnotations.length,
        });
      } catch (error) {
        if (!managedAnnotations.length) {
          continue;
        }

        skipped.push({
          label: safeName(node),
          reason: normalizeErrorMessage(error, "Failed to clear the pixel-perfect annotation."),
        });
      }
    }

    return {
      cleared,
      skipped,
      clearedNodeCount,
      removedAnnotationCount,
    };
  }

  function buildResultOnlyAnnotation(plans, reason) {
    const skipped = [];
    if (Array.isArray(plans) && plans.length > 0 && reason) {
      skipped.push({
        label: "Annotations unavailable",
        reason,
      });
    }

    return {
      applied: [],
      skipped,
      annotatedNodeCount: 0,
      annotationCount: 0,
      modeLabel: "Result only",
      categoryLabel: "",
    };
  }

  function buildPixelPerfectAnnotation(plans, category) {
    const previewPlans = Array.isArray(plans) ? plans.slice(0, ANNOTATION_CHANGE_PREVIEW_LIMIT) : [];
    const lines = [ANNOTATION_LABEL_PREFIX];

    previewPlans.forEach((plan) => {
      lines.push(
        `- ${plan.candidate.label}: ${formatNumber(plan.candidate.currentValue)} -> ${plan.targetValue} (${plan.source === "ai" ? "AI" : "Local"})`
      );
    });

    if (Array.isArray(plans) && plans.length > previewPlans.length) {
      lines.push(`- ${plans.length - previewPlans.length} more change(s)`);
    }

    const annotation = {
      label: lines.join("\n"),
    };

    if (category && category.id) {
      annotation.categoryId = category.id;
    }

    return annotation;
  }

  function buildPixelPerfectAnnotationResult(node, plans, category) {
    const previewPlans = Array.isArray(plans) ? plans.slice(0, 2) : [];
    return {
      nodeId: node.id,
      nodeName: safeName(node),
      changeCount: Array.isArray(plans) ? plans.length : 0,
      categoryLabel: category && category.label ? category.label : ANNOTATION_CATEGORY_LABEL,
      preview: previewPlans
        .map((plan) => `${plan.candidate.label} ${formatNumber(plan.candidate.currentValue)} -> ${plan.targetValue}`)
        .join(" | "),
    };
  }

  function isManagedPixelPerfectAnnotation(annotation, category) {
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

  function shouldPreserveHalfStep(category, fieldKey, value) {
    if (!isHalfStepValue(value)) {
      return false;
    }

    if (category === "stroke") {
      return true;
    }

    if (category === "effect-blur") {
      return true;
    }

    if (typeof fieldKey === "string") {
      const normalized = fieldKey.toLowerCase();
      if (normalized.includes("strokeweight")) {
        return true;
      }
      for (const key of EFFECT_RADIUS_KEYS) {
        if (normalized.endsWith(`.${key.toLowerCase()}`)) {
          return true;
        }
      }
    }

    return false;
  }

  function preserveReasonForCategory(category) {
    if (category === "stroke") {
      return "0.5 단위 stroke 값은 의도값으로 보고 유지했습니다.";
    }

    if (category === "effect-blur") {
      return "0.5 단위 blur/spread 값은 의도값으로 보고 유지했습니다.";
    }

    return "0.5 단위 예외값으로 보고 유지했습니다.";
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

  function hasAutoLayout(node) {
    return !!node && typeof node.layoutMode === "string" && node.layoutMode !== "NONE";
  }

  function cloneEffects(effects) {
    return effects.map((effect) => clonePlainObject(effect));
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

  function setNestedNumericValue(target, path, value) {
    if (!target || !Array.isArray(path) || path.length === 0) {
      return false;
    }

    let cursor = target;
    for (let index = 0; index < path.length - 1; index += 1) {
      const key = path[index];
      if (!cursor || typeof cursor !== "object" || !(key in cursor)) {
        return false;
      }
      cursor = cursor[key];
    }

    const lastKey = path[path.length - 1];
    if (!cursor || typeof cursor !== "object" || typeof cursor[lastKey] !== "number") {
      return false;
    }

    cursor[lastKey] = value;
    return true;
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

  function getTextMetricDescriptor(value) {
    if (!value || value === figma.mixed || typeof value !== "object" || value.unit === "AUTO") {
      return null;
    }

    if (typeof value.value !== "number" || !Number.isFinite(value.value)) {
      return null;
    }

    return {
      unit: typeof value.unit === "string" ? value.unit : "",
      value: value.value,
    };
  }

  async function readDesignReadCache() {
    try {
      const value = await figma.clientStorage.getAsync(AI_DESIGN_READ_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function readCachedResult() {
    try {
      const value = await figma.clientStorage.getAsync(AI_PIXEL_PERFECT_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function readCachedClearResult() {
    try {
      const value = await figma.clientStorage.getAsync(AI_PIXEL_PERFECT_CLEAR_CACHE_KEY);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function writeCachedResult(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    try {
      await figma.clientStorage.setAsync(AI_PIXEL_PERFECT_CACHE_KEY, result);
    } catch (error) {}

    return result;
  }

  async function writeCachedClearResult(result) {
    if (!result || typeof result !== "object") {
      return null;
    }

    try {
      await figma.clientStorage.setAsync(AI_PIXEL_PERFECT_CLEAR_CACHE_KEY, result);
    } catch (error) {}

    return result;
  }

  function matchesCurrentSelection(result) {
    return !!result && result.selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  function matchesSelectionSignature(selectionSignature) {
    return typeof selectionSignature === "string" && selectionSignature === getSelectionSignature(figma.currentPage.selection);
  }

  function getSelectionSignature(selection) {
    const ids = Array.from(selection || [])
      .map((node) => String(node.id || ""))
      .sort();
    return `${figma.currentPage.id}:${ids.join(",")}`;
  }

  function formatSelectionLabel(selection) {
    const roots = Array.from(selection || []);
    if (!roots.length) {
      return "선택 없음";
    }

    if (roots.length === 1) {
      return safeName(roots[0]);
    }

    return `${safeName(roots[0])} 외 ${roots.length - 1}개`;
  }

  function formatEffectLabel(effect) {
    switch (String(effect && effect.type || "").toUpperCase()) {
      case "DROP_SHADOW":
        return "drop shadow";
      case "INNER_SHADOW":
        return "inner shadow";
      case "LAYER_BLUR":
        return "layer blur";
      case "BACKGROUND_BLUR":
        return "background blur";
      default:
        return "effect";
    }
  }

  function isHalfStepValue(value) {
    return Math.abs(value * 2 - Math.round(value * 2)) <= VALUE_EPSILON;
  }

  function isIntegerValue(value) {
    return Math.abs(value - Math.round(value)) <= VALUE_EPSILON;
  }

  function isCloseEnough(value, expected) {
    return typeof value === "number" && typeof expected === "number" && Math.abs(value - expected) <= VALUE_EPSILON;
  }

  function selectNearestInteger(value) {
    const rounded = Math.round(value);
    const floorValue = Math.floor(value);
    const ceilValue = Math.ceil(value);
    if (rounded === floorValue || rounded === ceilValue) {
      return rounded;
    }
    return Math.abs(value - floorValue) <= Math.abs(ceilValue - value) ? floorValue : ceilValue;
  }

  function roundValue(value) {
    return Math.round(value * 100) / 100;
  }

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatNumber(value) {
    const rounded = roundValue(value);
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }

  function safeName(node) {
    return node && typeof node.name === "string" && node.name.trim().length > 0
      ? node.name.trim()
      : String((node && node.type) || "Unnamed");
  }

  function hasChildren(node) {
    return !!node && Array.isArray(node.children) && node.children.length > 0;
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

})();
