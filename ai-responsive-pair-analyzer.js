;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_RESPONSIVE_PAIR_ANALYZER_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const MOBILE_KNOWN_WIDTHS = [360, 375];
  const MOBILE_MAX_WIDTH = 480;
  const DESKTOP_MIN_WIDTH = 1024;
  const PATCH_VERSION = 2;
  const MAX_MATCH_RECORDS = 240;
  const MAX_CANDIDATE_MATCH_RECORDS = 64;
  const HIERARCHICAL_MATCH_THRESHOLD = 0.6;
  const FALLBACK_MATCH_THRESHOLD = 0.82;
  const CONFIRMED_MATCH_THRESHOLD = 0.9;
  const CANDIDATE_MATCH_THRESHOLD = 0.82;
  const LOW_CONFIDENCE_RULE_THRESHOLD = 0.82;
  const AGGREGATE_RULE_VERSION = 1;
  const CONTAINER_TYPES = {
    FRAME: true,
    GROUP: true,
    SECTION: true,
    COMPONENT: true,
    COMPONENT_SET: true,
    INSTANCE: true,
  };
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
  const DECORATIVE_NAME_PATTERNS = [
    /^bg$/i,
    /^background$/i,
    /^mask(?: group)?$/i,
    /^pdf#?$/i,
    /^image$/i,
    /^\+$/,
    /^container(?: \d+)?$/i,
    /^content(?: \d+)?$/i,
    /^wrapper(?: \d+)?$/i,
    /^inner(?: \d+)?$/i,
    /^outer(?: \d+)?$/i,
    /^body(?: \d+)?$/i,
  ];
  const WEAK_TEXT_ROLE_PATTERNS = [
    /^description(?: text)?$/i,
    /^body text$/i,
    /^caption(?: text)?$/i,
    /^copy$/i,
    /^offer$/i,
    /^subtitle(?: text)?$/i,
    /^text$/i,
  ];
  const DECORATIVE_LEAF_TYPES = {
    RECTANGLE: true,
    VECTOR: true,
    ELLIPSE: true,
    LINE: true,
    POLYGON: true,
    STAR: true,
    BOOLEAN_OPERATION: true,
  };
  let activeExecution = null;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isResponsivePairAnalyzerMessage(message)) {
      await withExecutionLock(
        {
          status: "running",
          message: "선택한 두 프레임을 PC/MO 학습 메모리로 분석하는 중입니다.",
        },
        runResponsivePairAnalysis
      );
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_RESPONSIVE_PAIR_ANALYZER_PATCH__ = true;

  function isResponsivePairAnalyzerMessage(message) {
    return !!message && message.type === "run-responsive-pair-analysis";
  }

  async function withExecutionLock(execution, runner) {
    if (activeExecution) {
      postStatus(activeExecution.status, activeExecution.message);
      return false;
    }

    activeExecution = execution && typeof execution === "object" ? execution : { status: "running", message: "" };
    try {
      await runner();
      return true;
    } finally {
      activeExecution = null;
    }
  }

  async function runResponsivePairAnalysis() {
    postStatus("running", "선택한 두 프레임을 PC/MO 학습 메모리로 분석하는 중입니다.");

    try {
      const memory = getResponsiveMemoryHelper();
      const currentStore = await memory.readStoreAsync();
      const analysis = await analyzeCurrentPairSelection(currentStore);
      const nextStore = await memory.appendRecordsAsync(analysis.records);

      figma.ui.postMessage({
        type: "responsive-pair-analysis-result",
        result: analysis.result,
        state: memory.summarizeStore(nextStore),
      });

      figma.notify("PC/MO 학습 메모리에 저장했습니다.", { timeout: 1800 });
    } catch (error) {
      const message = normalizeErrorMessage(error);
      figma.ui.postMessage({
        type: "responsive-pair-analysis-error",
        message: message,
      });
      figma.notify(message, { error: true, timeout: 2200 });
    }
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "responsive-pair-analysis-status",
      status: status,
      message: message,
    });
  }

  async function analyzeCurrentPairSelection(currentStore) {
    const selection = Array.from(figma.currentPage.selection || []).filter(Boolean);
    if (selection.length !== 2) {
      throw new Error("학습하려면 루트 프레임 두 개를 함께 선택해 주세요.");
    }

    const first = buildRootDescriptor(selection[0]);
    const second = buildRootDescriptor(selection[1]);
    const classifiedPair = classifyResponsivePair(first, second);
    const createdAt = new Date().toISOString();
    const selectionSignature = getSelectionSignature(selection);
    const pairId = createRecordId("pair");
    const summaryId = createRecordId("summary");

    const pairRecord = {
      type: "pair",
      id: pairId,
      version: PATCH_VERSION,
      source: "responsive-pair-analyzer",
      selectionSignature: selectionSignature,
      pcNodeId: classifiedPair.pc.id,
      pcNodeName: classifiedPair.pc.name,
      pcWidth: classifiedPair.pc.width,
      pcHeight: classifiedPair.pc.height,
      moNodeId: classifiedPair.mo.id,
      moNodeName: classifiedPair.mo.name,
      moWidth: classifiedPair.mo.width,
      moHeight: classifiedPair.mo.height,
      detectionReason: classifiedPair.reason,
      createdAt: createdAt,
    };

    const rootMatchRecord = {
      type: "match",
      id: createRecordId("match"),
      version: PATCH_VERSION,
      pairId: pairId,
      scope: "root",
      fromNodeIds: [classifiedPair.pc.id],
      toNodeIds: [classifiedPair.mo.id],
      cardinality: "1:1",
      confidence: 1,
      evidence: {
        rootPair: true,
        widthClassification: true,
        structure: true,
      },
      createdAt: createdAt,
    };

    const matching = await buildNodeMatches(classifiedPair.pc, classifiedPair.mo, pairId, createdAt);
    const ruleRecords = buildRuleRecords(classifiedPair, pairId, createdAt, matching);
    const aggregate = buildAggregateRuleRecords(currentStore, ruleRecords, pairRecord, createdAt);
    const preview = buildAnalysisPreview(matching, ruleRecords, aggregate.preview);
    const summaryRecord = {
      type: "summary",
      id: summaryId,
      version: PATCH_VERSION,
      pairId: pairId,
      content: `${classifiedPair.pc.name} (${classifiedPair.pc.width}) -> ${classifiedPair.mo.name} (${classifiedPair.mo.width})`,
      stats: {
        pcTotalNodes: classifiedPair.pc.stats.totalNodes,
        moTotalNodes: classifiedPair.mo.stats.totalNodes,
        pcTextNodes: classifiedPair.pc.stats.textNodes,
        moTextNodes: classifiedPair.mo.stats.textNodes,
        matchedNodeCount: matching.stats.matchedNodeCount,
        confirmedMatchCount: matching.stats.confirmedMatchCount,
        candidateMatchCount: matching.stats.candidateMatchCount,
        hierarchicalMatchCount: matching.stats.hierarchicalMatchCount,
        fallbackMatchCount: matching.stats.fallbackMatchCount,
        lowConfidenceMatchCount: matching.stats.lowConfidenceMatchCount,
        averageConfidence: matching.stats.averageConfidence,
        unmatchedPcCount: matching.stats.unmatchedPcCount,
        unmatchedMoCount: matching.stats.unmatchedMoCount,
        cappedAtMatchLimit: matching.stats.cappedAtMatchLimit,
        ruleCount: ruleRecords.length,
        aggregateRuleCount: aggregate.records.length,
      },
      createdAt: createdAt,
    };

    const records = [pairRecord, rootMatchRecord]
      .concat(matching.records)
      .concat(ruleRecords)
      .concat(aggregate.records)
      .concat([summaryRecord]);

    return {
      records: records,
      result: {
        pairId: pairId,
        selectionSignature: selectionSignature,
        summary:
          `${classifiedPair.pc.name} ${classifiedPair.pc.width}px -> ${classifiedPair.mo.name} ${classifiedPair.mo.width}px` +
          ` · match ${matching.stats.matchedNodeCount}건 · rule ${ruleRecords.length}개`,
        detectionReason: classifiedPair.reason,
        recordsCreated: records.length,
        matchStats: matching.stats,
        matchCount: matching.stats.matchedNodeCount,
        confirmedMatchCount: matching.stats.confirmedMatchCount,
        candidateMatchCount: matching.stats.candidateMatchCount,
        lowConfidenceCount: matching.stats.lowConfidenceMatchCount,
        ruleCount: ruleRecords.length,
        aggregateRuleCount: aggregate.records.length,
        preview: preview,
        pc: simplifyRootDescriptor(classifiedPair.pc),
        mo: simplifyRootDescriptor(classifiedPair.mo),
      },
    };
  }

  function buildRootDescriptor(node) {
    const bounds = getNodeBounds(node);
    if (!bounds) {
      throw new Error(`"${safeName(node)}" 프레임의 크기를 읽지 못했습니다.`);
    }

    return {
      node: node,
      id: node.id,
      name: safeName(node),
      type: String(node.type || "UNKNOWN"),
      width: roundPixel(bounds.width),
      height: roundPixel(bounds.height),
      bounds: {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      },
      stats: collectNodeStats(node),
    };
  }

  function classifyResponsivePair(first, second) {
    const items = [first, second].sort((left, right) => left.width - right.width);
    const smaller = items[0];
    const larger = items[1];
    const smallerIsKnownMobile = MOBILE_KNOWN_WIDTHS.indexOf(smaller.width) >= 0;
    const smallerLooksMobile = smaller.width <= MOBILE_MAX_WIDTH;
    const largerLooksDesktop = larger.width >= DESKTOP_MIN_WIDTH;

    if (largerLooksDesktop && (smallerIsKnownMobile || smallerLooksMobile)) {
      return {
        pc: larger,
        mo: smaller,
        reason: smallerIsKnownMobile
          ? `모바일 기준 폭 ${smaller.width}px와 데스크톱 기준 폭 ${larger.width}px를 감지했습니다.`
          : `${larger.width}px는 PC, ${smaller.width}px는 MO 범위로 분류했습니다.`,
      };
    }

    if (first.width >= DESKTOP_MIN_WIDTH && second.width >= DESKTOP_MIN_WIDTH) {
      throw new Error("선택한 두 프레임이 모두 PC 범위입니다. MO 프레임을 함께 선택해 주세요.");
    }

    if (first.width <= MOBILE_MAX_WIDTH && second.width <= MOBILE_MAX_WIDTH) {
      throw new Error("선택한 두 프레임이 모두 MO 범위입니다. PC 프레임을 함께 선택해 주세요.");
    }

    if (!largerLooksDesktop) {
      throw new Error(`PC 프레임은 ${DESKTOP_MIN_WIDTH}px 이상이어야 합니다. 현재 큰 프레임은 ${larger.width}px입니다.`);
    }

    throw new Error(`MO 프레임은 ${MOBILE_MAX_WIDTH}px 이하 또는 대표 모바일 폭(360/375px)이어야 합니다. 현재 작은 프레임은 ${smaller.width}px입니다.`);
  }

  async function buildNodeMatches(pcRoot, moRoot, pairId, createdAt) {
    const pcTree = await collectTreeDescriptors(pcRoot.node, pcRoot.bounds);
    const moTree = await collectTreeDescriptors(moRoot.node, moRoot.bounds);
    const pcByParent = groupDescriptorsByParent(pcTree.descriptors);
    const moByParent = groupDescriptorsByParent(moTree.descriptors);
    const pcMatchedIds = new Set([pcRoot.id]);
    const moMatchedIds = new Set([moRoot.id]);
    const records = [];
    const stats = {
      matchedNodeCount: 0,
      confirmedMatchCount: 0,
      candidateMatchCount: 0,
      hierarchicalMatchCount: 0,
      fallbackMatchCount: 0,
      lowConfidenceMatchCount: 0,
      averageConfidence: 0,
      unmatchedPcCount: 0,
      unmatchedMoCount: 0,
      cappedAtMatchLimit: false,
    };
    const pairs = [];
    let totalConfidence = 0;

    await matchChildrenRecursive(pcRoot.id, moRoot.id);

    if (records.length < MAX_MATCH_RECORDS) {
      matchFallbackDescriptors();
    } else {
      stats.cappedAtMatchLimit = true;
    }

    const unmatchedPcDescriptors = getUnmatchedDescriptors(pcTree.descriptors, pcMatchedIds);
    const unmatchedMoDescriptors = getUnmatchedDescriptors(moTree.descriptors, moMatchedIds);
    stats.unmatchedPcCount = unmatchedPcDescriptors.length;
    stats.unmatchedMoCount = unmatchedMoDescriptors.length;

    return {
      records: records,
      stats: stats,
      pairs: pairs,
      pcUnmatchedDescriptors: unmatchedPcDescriptors,
      moUnmatchedDescriptors: unmatchedMoDescriptors,
    };

    async function matchChildrenRecursive(pcParentId, moParentId) {
      if (records.length >= MAX_MATCH_RECORDS) {
        stats.cappedAtMatchLimit = true;
        return;
      }

      const pcChildren = getUnmatchedChildren(pcByParent, pcParentId, pcMatchedIds);
      const moChildren = getUnmatchedChildren(moByParent, moParentId, moMatchedIds);
      if (!pcChildren.length || !moChildren.length) {
        return;
      }

      const localThreshold =
        pcParentId === pcRoot.id && moParentId === moRoot.id ? Math.max(HIERARCHICAL_MATCH_THRESHOLD, 0.72) : HIERARCHICAL_MATCH_THRESHOLD;
      const pairs = buildGreedyMatches(pcChildren, moChildren, localThreshold, true);
      for (let index = 0; index < pairs.length; index += 1) {
        const pair = pairs[index];
        if (records.length >= MAX_MATCH_RECORDS) {
          stats.cappedAtMatchLimit = true;
          return;
        }

        if (!registerPair(pair, "hierarchical")) {
          continue;
        }

        if (pair.pc.hasChildren && pair.mo.hasChildren && shouldRecurseIntoPair(pair)) {
          await matchChildrenRecursive(pair.pc.id, pair.mo.id);
        }
      }
    }

    function matchFallbackDescriptors() {
      const pcUnmatched = getUnmatchedDescriptors(pcTree.descriptors, pcMatchedIds);
      const moUnmatched = getUnmatchedDescriptors(moTree.descriptors, moMatchedIds);
      if (!pcUnmatched.length || !moUnmatched.length) {
        return;
      }

      const pairs = buildGreedyMatches(pcUnmatched, moUnmatched, FALLBACK_MATCH_THRESHOLD, false);
      for (let index = 0; index < pairs.length; index += 1) {
        const pair = pairs[index];
        if (records.length >= MAX_MATCH_RECORDS) {
          stats.cappedAtMatchLimit = true;
          return;
        }

        registerPair(pair, "fallback");
      }
    }

    function registerPair(pair, scope) {
      if (!shouldRetainMatchPair(pair, scope)) {
        return false;
      }

      const matchTier = getMatchTier(pair.score);
      if (matchTier === "candidate" && stats.candidateMatchCount >= MAX_CANDIDATE_MATCH_RECORDS) {
        return false;
      }

      pcMatchedIds.add(pair.pc.id);
      moMatchedIds.add(pair.mo.id);
      records.push(createMatchRecord(pairId, createdAt, pair, scope));
      pairs.push({
        pc: pair.pc,
        mo: pair.mo,
        score: pair.score,
        tier: matchTier,
        scope: scope,
        evidence: pair.evidence,
      });
      stats.matchedNodeCount += 1;
      if (matchTier === "confirmed") {
        stats.confirmedMatchCount += 1;
      } else if (matchTier === "candidate") {
        stats.candidateMatchCount += 1;
      }
      totalConfidence += pair.score;
      stats.averageConfidence = roundConfidence(totalConfidence / Math.max(1, stats.matchedNodeCount));
      if (pair.score < LOW_CONFIDENCE_RULE_THRESHOLD) {
        stats.lowConfidenceMatchCount += 1;
      }
      if (scope === "hierarchical") {
        stats.hierarchicalMatchCount += 1;
      } else {
        stats.fallbackMatchCount += 1;
      }
      return true;
    }

    function shouldRetainMatchPair(pair, scope) {
      if (!pair) {
        return false;
      }

      const weakRolePair =
        isWeakTextRoleDescriptor(pair.pc) ||
        isWeakTextRoleDescriptor(pair.mo) ||
        isDecorativeDescriptor(pair.pc) ||
        isDecorativeDescriptor(pair.mo);

      if (pair.score >= CANDIDATE_MATCH_THRESHOLD) {
        return weakRolePair
          ? pair.evidence.parentContext >= 0.76 || pair.evidence.component >= 0.9 || pair.evidence.textFingerprint >= 0.92
          : true;
      }

      if (hasStrongIdentitySignal(pair.pc, pair.mo)) {
        return weakRolePair ? pair.evidence.parentContext >= 0.8 || pair.evidence.component >= 0.9 : true;
      }

      const strongEvidence =
        pair.evidence.component >= 0.9 ||
        pair.evidence.textFingerprint >= 0.9 ||
        pair.evidence.variableFingerprint >= 0.88;
      if (strongEvidence) {
        return true;
      }

      if (
        scope === "hierarchical" &&
        pair.pc.hasChildren &&
        pair.mo.hasChildren &&
        pair.evidence.childContent >= 0.86 &&
        pair.evidence.parentContext >= 0.8 &&
        pair.evidence.layout >= 0.76
      ) {
        return true;
      }

      return false;
    }

    function shouldRecurseIntoPair(pair) {
      if (!pair || !pair.pc || !pair.mo || !pair.pc.hasChildren || !pair.mo.hasChildren) {
        return false;
      }

      if (pair.score >= CONFIRMED_MATCH_THRESHOLD) {
        return true;
      }

      if (hasStrongIdentitySignal(pair.pc, pair.mo)) {
        return true;
      }

      const strongContainerContext =
        pair.evidence.childContent >= 0.9 &&
        pair.evidence.parentContext >= 0.82 &&
        pair.evidence.layout >= 0.78;
      if (strongContainerContext) {
        return true;
      }

      return false;
    }
  }

  async function collectTreeDescriptors(rootNode, rootBounds) {
    const descriptors = [];

    await walk(rootNode, null, 0, 0, 1);

    return {
      descriptors: descriptors,
    };

    async function walk(node, parentDescriptor, depth, index, siblingCount) {
      const descriptor = await buildNodeDescriptor(node, parentDescriptor, rootBounds, depth, index, siblingCount);
      descriptors.push(descriptor);

      if (!descriptor.hasChildren) {
        return descriptor;
      }

      const childDescriptors = [];
      const children = Array.isArray(node.children) ? node.children : [];
      for (let childIndex = 0; childIndex < children.length; childIndex += 1) {
        const childDescriptor = await walk(children[childIndex], descriptor, depth + 1, childIndex, children.length || 1);
        if (childDescriptor) {
          childDescriptors.push(childDescriptor);
        }
      }

      finalizeContainerDescriptor(descriptor, childDescriptors);
      return descriptor;
    }
  }

  async function buildNodeDescriptor(node, parentDescriptor, rootBounds, depth, orderIndex, siblingCount) {
    const bounds = getNodeBounds(node);
    const name = safeName(node);
    const canonicalName = canonicalizeName(name);
    const componentInfo = await getComponentInfo(node);
    const textFingerprint = getTextFingerprint(node);
    const variableFingerprint = getVariableFingerprint(node);
    const layoutInfo = getLayoutInfo(node);
    const layoutSignature = buildLayoutSignature(layoutInfo);
    const visible = !node || node.visible !== false;
    const childCount = hasChildren(node) ? node.children.length : 0;
    const semanticSegment = componentInfo.componentFamily || canonicalName || String(node.type || "unknown").toLowerCase();
    const path = parentDescriptor ? `${parentDescriptor.path}/${name}` : name;
    const semanticPath = parentDescriptor ? `${parentDescriptor.semanticPath}/${semanticSegment}` : semanticSegment;
    const topLevelId = !parentDescriptor ? node.id : depth === 1 ? node.id : parentDescriptor.topLevelId;
    const topLevelSemanticSegment = !parentDescriptor
      ? semanticSegment
      : depth === 1
      ? semanticSegment
      : parentDescriptor.topLevelSemanticSegment;
    const topLevelSemanticPath = !parentDescriptor
      ? semanticPath
      : depth === 1
      ? semanticPath
      : parentDescriptor.topLevelSemanticPath;

    return {
      node: node,
      id: node.id,
      parentId: parentDescriptor ? parentDescriptor.id : "",
      name: name,
      canonicalName: canonicalName,
      isAutoNamed: isAutoName(name),
      type: String(node.type || "UNKNOWN"),
      depth: depth,
      orderIndex: orderIndex,
      siblingCount: siblingCount,
      hasChildren: childCount > 0,
      childCount: childCount,
      visible: visible,
      path: path,
      semanticSegment: semanticSegment,
      semanticPath: semanticPath,
      topLevelId: topLevelId,
      topLevelSemanticSegment: topLevelSemanticSegment,
      topLevelSemanticPath: topLevelSemanticPath,
      parentSemanticPath: parentDescriptor ? parentDescriptor.semanticPath : "",
      parentSemanticSegment: parentDescriptor ? parentDescriptor.semanticSegment : "",
      parentType: parentDescriptor ? parentDescriptor.type : "",
      textFingerprint: textFingerprint,
      variableFingerprint: variableFingerprint,
      componentInfo: componentInfo,
      layoutInfo: layoutInfo,
      layoutSignature: layoutSignature,
      childSemanticSignature: "",
      meaningfulChildCount: 0,
      bounds: bounds,
      relativeBounds: buildRelativeBounds(bounds, parentDescriptor ? parentDescriptor.bounds : rootBounds),
    };
  }

  function finalizeContainerDescriptor(descriptor, childDescriptors) {
    const children = Array.isArray(childDescriptors) ? childDescriptors : [];
    descriptor.meaningfulChildCount = countMeaningfulChildDescriptors(children);
    descriptor.childSemanticSignature = buildChildSemanticSignature(children);
  }

  function buildRelativeBounds(bounds, contextBounds) {
    if (!bounds || !contextBounds || !contextBounds.width || !contextBounds.height) {
      return null;
    }

    const localX = bounds.x - contextBounds.x;
    const localY = bounds.y - contextBounds.y;
    const contextWidth = Math.max(1, contextBounds.width);
    const contextHeight = Math.max(1, contextBounds.height);
    const leftGap = localX;
    const rightGap = contextWidth - (localX + bounds.width);
    const topGap = localY;
    const bottomGap = contextHeight - (localY + bounds.height);
    const horizontalCenterDelta = Math.abs(localX + bounds.width / 2 - contextWidth / 2);
    const verticalCenterDelta = Math.abs(localY + bounds.height / 2 - contextHeight / 2);

    let horizontalAnchor = "left";
    if (horizontalCenterDelta <= leftGap && horizontalCenterDelta <= rightGap) {
      horizontalAnchor = "center";
    } else if (rightGap < leftGap) {
      horizontalAnchor = "right";
    }

    let verticalAnchor = "top";
    if (verticalCenterDelta <= topGap && verticalCenterDelta <= bottomGap) {
      verticalAnchor = "middle";
    } else if (bottomGap < topGap) {
      verticalAnchor = "bottom";
    }

    return {
      xRatio: roundRatio(localX / contextWidth),
      yRatio: roundRatio(localY / contextHeight),
      widthRatio: roundRatio(bounds.width / contextWidth),
      heightRatio: roundRatio(bounds.height / contextHeight),
      horizontalAnchor: horizontalAnchor,
      verticalAnchor: verticalAnchor,
    };
  }

  function getTextFingerprint(node) {
    if (!node || typeof node.characters !== "string") {
      return "";
    }

    const normalized = node.characters
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .replace(/[0-9]+/g, "#");

    if (!normalized) {
      return "";
    }

    return normalized.length > 80 ? normalized.slice(0, 80) : normalized;
  }

  function getVariableFingerprint(node) {
    const values = [];

    if (node && node.boundVariables && typeof node.boundVariables === "object") {
      collectFingerprintValues(node.boundVariables, values, "bound", 0);
    }

    if (node && node.inferredVariables && typeof node.inferredVariables === "object") {
      collectFingerprintValues(node.inferredVariables, values, "inferred", 0);
    }

    values.sort();
    return values.join("|");
  }

  function collectFingerprintValues(source, values, prefix, depth) {
    if (!source || depth > 3 || values.length >= 24) {
      return;
    }

    if (Array.isArray(source)) {
      for (let index = 0; index < source.length; index += 1) {
        collectFingerprintValues(source[index], values, prefix, depth + 1);
      }
      return;
    }

    const sourceType = typeof source;
    if (sourceType === "string" || sourceType === "number" || sourceType === "boolean") {
      values.push(`${prefix}:${String(source).trim().toLowerCase()}`);
      return;
    }

    if (sourceType !== "object") {
      return;
    }

    const keys = Object.keys(source).sort();
    for (let index = 0; index < keys.length; index += 1) {
      const key = keys[index];
      const value = source[key];
      const nextPrefix = prefix ? `${prefix}.${String(key).trim().toLowerCase()}` : String(key).trim().toLowerCase();
      if (key === "id" || key === "name" || key === "type" || key === "resolvedType") {
        if (typeof value === "string" && value.trim()) {
          values.push(`${nextPrefix}:${value.trim().toLowerCase()}`);
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        values.push(`${nextPrefix}:${String(value).trim().toLowerCase()}`);
        continue;
      }
      collectFingerprintValues(value, values, nextPrefix, depth + 1);
    }
  }

  async function getComponentInfo(node) {
    const info = {
      componentId: "",
      componentKey: "",
      componentName: "",
      componentFamily: "",
      propertySignature: "",
      referenceSignature: "",
    };

    let componentNode = null;
    const nodeType = String((node && node.type) || "");
    if (nodeType === "INSTANCE" && node && typeof node.getMainComponentAsync === "function") {
      componentNode = await getMainComponentSafeAsync(node);
    } else if (nodeType === "COMPONENT" || nodeType === "COMPONENT_SET") {
      componentNode = node;
    }

    if (componentNode) {
      info.componentId = typeof componentNode.id === "string" ? componentNode.id : "";
      info.componentKey = safeReadStringProperty(componentNode, "key");
      info.componentName = safeName(componentNode);
      info.componentFamily = canonicalizeName(info.componentName);
    }

    const properties = [];
    const componentProperties = safeReadObjectProperty(node, "componentProperties");
    if (componentProperties) {
      const keys = Object.keys(componentProperties).sort();
      for (let index = 0; index < keys.length; index += 1) {
        const key = keys[index];
        const item = componentProperties[key];
        let value = "";
        if (item && typeof item === "object" && typeof item.value !== "undefined") {
          value = String(item.value);
        } else if (typeof item !== "undefined") {
          value = String(item);
        }
        if (value) {
          properties.push(`${stripComponentPropertyKey(key)}:${value.trim().toLowerCase()}`);
        }
      }
    }

    const variantProperties = safeReadObjectProperty(node, "variantProperties");
    if (variantProperties) {
      const keys = Object.keys(variantProperties).sort();
      for (let index = 0; index < keys.length; index += 1) {
        const key = keys[index];
        const value = variantProperties[key];
        if (typeof value === "undefined" || value === null) {
          continue;
        }
        properties.push(`${stripComponentPropertyKey(key)}:${String(value).trim().toLowerCase()}`);
      }
    }

    info.referenceSignature = getComponentReferenceSignature(node);
    info.propertySignature = properties.sort().join("|");
    return info;
  }

  async function getMainComponentSafeAsync(node) {
    try {
      const componentNode = await node.getMainComponentAsync();
      return componentNode || null;
    } catch (error) {
      return null;
    }
  }

  function getComponentReferenceSignature(node) {
    const references = safeReadObjectProperty(node, "componentPropertyReferences");
    if (!references) {
      return "";
    }

    const values = [];
    const keys = Object.keys(references).sort();
    for (let index = 0; index < keys.length; index += 1) {
      const key = keys[index];
      const value = references[key];
      if (typeof value === "string" && value.trim()) {
        values.push(`${stripComponentPropertyKey(key)}:${value.trim().toLowerCase()}`);
      }
    }

    return values.join("|");
  }

  function safeReadObjectProperty(target, key) {
    try {
      if (!target || typeof target !== "object") {
        return null;
      }

      const value = target[key];
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function safeReadStringProperty(target, key) {
    try {
      if (!target || typeof target !== "object") {
        return "";
      }

      const value = target[key];
      return typeof value === "string" ? value : "";
    } catch (error) {
      return "";
    }
  }

  function stripComponentPropertyKey(value) {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) {
      return "";
    }

    const hashIndex = text.indexOf("#");
    const base = hashIndex >= 0 ? text.slice(0, hashIndex) : text;
    return base.trim().toLowerCase();
  }

  function getLayoutInfo(node) {
    const info = {
      mode: "NONE",
      source: "none",
      gap: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingX: 0,
      paddingY: 0,
      wrap: "",
      sizingHorizontal: "",
      sizingVertical: "",
      grow: 0,
      align: "",
      positioning: "",
    };

    const inferred = node && node.inferredAutoLayout && typeof node.inferredAutoLayout === "object" ? node.inferredAutoLayout : null;
    const layoutMode = typeof node.layoutMode === "string" ? node.layoutMode : "NONE";
    const inferredMode = inferred && typeof inferred.layoutMode === "string" ? inferred.layoutMode : "NONE";

    if (layoutMode && layoutMode !== "NONE") {
      info.mode = layoutMode;
      info.source = "auto-layout";
    } else if (inferredMode && inferredMode !== "NONE") {
      info.mode = inferredMode;
      info.source = "inferred";
    }

    const source = info.source === "inferred" ? inferred : node;
    if (source) {
      info.gap = roundPixel(typeof source.itemSpacing === "number" ? source.itemSpacing : 0);
      info.paddingTop = roundPixel(typeof source.paddingTop === "number" ? source.paddingTop : 0);
      info.paddingRight = roundPixel(typeof source.paddingRight === "number" ? source.paddingRight : 0);
      info.paddingBottom = roundPixel(typeof source.paddingBottom === "number" ? source.paddingBottom : 0);
      info.paddingLeft = roundPixel(typeof source.paddingLeft === "number" ? source.paddingLeft : 0);
      info.paddingX = roundPixel(info.paddingLeft + info.paddingRight);
      info.paddingY = roundPixel(info.paddingTop + info.paddingBottom);
      info.wrap = typeof source.layoutWrap === "string" ? source.layoutWrap : "";
    }

    info.sizingHorizontal = typeof node.layoutSizingHorizontal === "string" ? node.layoutSizingHorizontal : "";
    info.sizingVertical = typeof node.layoutSizingVertical === "string" ? node.layoutSizingVertical : "";
    info.grow = roundPixel(typeof node.layoutGrow === "number" ? node.layoutGrow : 0);
    info.align = typeof node.layoutAlign === "string" ? node.layoutAlign : "";
    info.positioning = typeof node.layoutPositioning === "string" ? node.layoutPositioning : "";

    return info;
  }

  function buildLayoutSignature(layoutInfo) {
    if (!layoutInfo) {
      return "";
    }

    return [
      String(layoutInfo.mode || "NONE"),
      String(layoutInfo.wrap || ""),
      bucketPixel(layoutInfo.gap),
      bucketPixel(layoutInfo.paddingX),
      bucketPixel(layoutInfo.paddingY),
      String(layoutInfo.sizingHorizontal || ""),
      String(layoutInfo.sizingVertical || ""),
      layoutInfo.grow ? "grow" : "",
      String(layoutInfo.align || ""),
      String(layoutInfo.positioning || ""),
    ]
      .filter(Boolean)
      .join("|");
  }

  function countMeaningfulChildDescriptors(descriptors) {
    let count = 0;

    for (let index = 0; index < descriptors.length; index += 1) {
      if (isMeaningfulDescriptorSignal(descriptors[index])) {
        count += 1;
      }
    }

    return count;
  }

  function buildChildSemanticSignature(descriptors) {
    const parts = [];

    for (let index = 0; index < descriptors.length; index += 1) {
      const descriptor = descriptors[index];
      const token = getDescriptorIdentityToken(descriptor);
      if (!token) {
        continue;
      }
      parts.push(token);
      if (parts.length >= 6) {
        break;
      }
    }

    return parts.join(">");
  }

  function isMeaningfulDescriptorSignal(descriptor) {
    if (!descriptor) {
      return false;
    }

    if (descriptor.componentInfo.componentKey || descriptor.textFingerprint || descriptor.variableFingerprint) {
      return true;
    }

    if (descriptor.canonicalName && !isGenericNamedDescriptor(descriptor)) {
      return true;
    }

    return !!(descriptor.hasChildren && descriptor.childCount > 0);
  }

  function getDescriptorIdentityToken(descriptor) {
    if (!descriptor) {
      return "";
    }

    if (descriptor.componentInfo.componentFamily) {
      return `cmp:${descriptor.componentInfo.componentFamily}`;
    }

    if (descriptor.textFingerprint) {
      return `txt:${descriptor.textFingerprint.split(" ").slice(0, 3).join("_")}`;
    }

    if (descriptor.variableFingerprint) {
      return `var:${descriptor.variableFingerprint.split("|").slice(0, 2).join("+")}`;
    }

    if (descriptor.canonicalName && !isGenericNamedDescriptor(descriptor)) {
      return `name:${descriptor.canonicalName}`;
    }

    if (descriptor.hasChildren && descriptor.childCount > 0 && descriptor.semanticSegment) {
      return `node:${descriptor.semanticSegment}`;
    }

    return "";
  }

  function groupDescriptorsByParent(descriptors) {
    const groups = new Map();

    for (let index = 0; index < descriptors.length; index += 1) {
      const descriptor = descriptors[index];
      const parentId = descriptor.parentId || "__root__";
      if (!groups.has(parentId)) {
        groups.set(parentId, []);
      }
      groups.get(parentId).push(descriptor);
    }

    return groups;
  }

  function getUnmatchedChildren(groupMap, parentId, matchedIds) {
    const list = groupMap.get(parentId) || [];
    const result = [];

    for (let index = 0; index < list.length; index += 1) {
      if (!matchedIds.has(list[index].id)) {
        result.push(list[index]);
      }
    }

    return result;
  }

  function getUnmatchedDescriptors(descriptors, matchedIds) {
    const result = [];

    for (let index = 0; index < descriptors.length; index += 1) {
      if (!matchedIds.has(descriptors[index].id)) {
        result.push(descriptors[index]);
      }
    }

    return result;
  }

  function countUnmatched(descriptors, matchedIds) {
    let count = 0;

    for (let index = 0; index < descriptors.length; index += 1) {
      if (!matchedIds.has(descriptors[index].id)) {
        count += 1;
      }
    }

    return count;
  }

  function buildGreedyMatches(pcDescriptors, moDescriptors, threshold, hierarchical) {
    const candidates = [];
    const maxCandidateCount = hierarchical ? 3200 : 6400;

    for (let pcIndex = 0; pcIndex < pcDescriptors.length; pcIndex += 1) {
      const pcDescriptor = pcDescriptors[pcIndex];
      if (shouldSkipDescriptorForMatching(pcDescriptor, hierarchical)) {
        continue;
      }
      for (let moIndex = 0; moIndex < moDescriptors.length; moIndex += 1) {
        const moDescriptor = moDescriptors[moIndex];
        if (shouldSkipDescriptorForMatching(moDescriptor, hierarchical)) {
          continue;
        }
        if (!hierarchical && !shouldAllowFallbackPair(pcDescriptor, moDescriptor)) {
          continue;
        }
        if (!areNodeTypesCompatible(pcDescriptor, moDescriptor)) {
          continue;
        }

        const candidate = scoreNodePair(pcDescriptor, moDescriptor, hierarchical);
        if (!candidate || candidate.score < threshold) {
          continue;
        }
        if (shouldRejectWeakCandidate(pcDescriptor, moDescriptor, candidate, hierarchical)) {
          continue;
        }

        candidates.push(candidate);
        if (candidates.length >= maxCandidateCount) {
          break;
        }
      }
      if (candidates.length >= maxCandidateCount) {
        break;
      }
    }

    candidates.sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (left.pc.depth !== right.pc.depth) {
        return left.pc.depth - right.pc.depth;
      }
      return left.pc.orderIndex - right.pc.orderIndex;
    });

    const usedPc = new Set();
    const usedMo = new Set();
    const matches = [];

    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      if (usedPc.has(candidate.pc.id) || usedMo.has(candidate.mo.id)) {
        continue;
      }

      usedPc.add(candidate.pc.id);
      usedMo.add(candidate.mo.id);
      matches.push(candidate);
    }

    return matches;
  }

  function shouldSkipDescriptorForMatching(descriptor, hierarchical) {
    if (!descriptor) {
      return true;
    }

    if (
      hierarchical &&
      descriptor.depth >= 2 &&
      !descriptor.hasChildren &&
      !descriptor.textFingerprint &&
      !descriptor.componentInfo.componentKey &&
      !descriptor.variableFingerprint &&
      (DECORATIVE_LEAF_TYPES[descriptor.type] || isGenericNamedDescriptor(descriptor) || isWeakTextRoleDescriptor(descriptor))
    ) {
      return true;
    }

    if (hierarchical) {
      return false;
    }

    if (descriptor.hasChildren || descriptor.textFingerprint || descriptor.componentInfo.componentKey || descriptor.variableFingerprint) {
      return false;
    }

    if (descriptor.layoutInfo && descriptor.layoutInfo.mode && descriptor.layoutInfo.mode !== "NONE") {
      return false;
    }

    if (DECORATIVE_LEAF_TYPES[descriptor.type]) {
      return true;
    }

    return isGenericNamedDescriptor(descriptor);
  }

  function shouldRejectWeakCandidate(pcDescriptor, moDescriptor, candidate, hierarchical) {
    if (!candidate) {
      return true;
    }

    const weakTextPair =
      isWeakTextRoleDescriptor(pcDescriptor) &&
      isWeakTextRoleDescriptor(moDescriptor) &&
      !hasStrongIdentitySignal(pcDescriptor, moDescriptor) &&
      candidate.evidence.textFingerprint < 0.78 &&
      candidate.score < (hierarchical ? 0.9 : 0.93);
    if (weakTextPair) {
      return true;
    }

    if (hierarchical) {
      const weakLeafPair =
        !pcDescriptor.hasChildren &&
        !moDescriptor.hasChildren &&
        !hasStrongIdentitySignal(pcDescriptor, moDescriptor) &&
        isDecorativeDescriptor(pcDescriptor) &&
        isDecorativeDescriptor(moDescriptor) &&
        candidate.score < 0.92;
      if (weakLeafPair) {
        return true;
      }

      const weakGenericGroupPair =
        isGenericContainerDescriptor(pcDescriptor) &&
        isGenericContainerDescriptor(moDescriptor) &&
        !hasStrongIdentitySignal(pcDescriptor, moDescriptor) &&
        candidate.evidence.childContent < 0.78 &&
        candidate.evidence.parentContext < 0.72 &&
        candidate.score < 0.92;
      if (weakGenericGroupPair) {
        return true;
      }
    }

    return false;
  }

  function isDecorativeDescriptor(descriptor) {
    if (!descriptor) {
      return false;
    }

    if (DECORATIVE_LEAF_TYPES[descriptor.type]) {
      return true;
    }

    return isGenericNamedDescriptor(descriptor);
  }

  function isGenericContainerDescriptor(descriptor) {
    if (!descriptor) {
      return false;
    }

    const type = String(descriptor.type || "");
    if (!(type === "GROUP" || type === "FRAME" || type === "SECTION")) {
      return false;
    }

    return isGenericNamedDescriptor(descriptor);
  }

  function isWeakTextRoleDescriptor(descriptor) {
    if (!descriptor || descriptor.type !== "TEXT") {
      return false;
    }

    const normalizedName = String(descriptor.canonicalName || descriptor.name || "").trim();
    if (!normalizedName) {
      return true;
    }

    for (let index = 0; index < WEAK_TEXT_ROLE_PATTERNS.length; index += 1) {
      if (WEAK_TEXT_ROLE_PATTERNS[index].test(normalizedName)) {
        return true;
      }
    }

    return !!descriptor.isAutoNamed;
  }

  function isGenericNamedDescriptor(descriptor) {
    const normalizedName = String((descriptor && descriptor.name) || "").trim();
    if (!normalizedName) {
      return true;
    }

    for (let index = 0; index < DECORATIVE_NAME_PATTERNS.length; index += 1) {
      if (DECORATIVE_NAME_PATTERNS[index].test(normalizedName)) {
        return true;
      }
    }

    return !!(descriptor && descriptor.isAutoNamed);
  }

  function shouldAllowFallbackPair(pcDescriptor, moDescriptor) {
    if (!pcDescriptor || !moDescriptor) {
      return false;
    }

    if (hasStrongIdentitySignal(pcDescriptor, moDescriptor)) {
      return true;
    }

    const sameTopLevelSegment =
      !!pcDescriptor.topLevelSemanticSegment &&
      !!moDescriptor.topLevelSemanticSegment &&
      pcDescriptor.topLevelSemanticSegment === moDescriptor.topLevelSemanticSegment;
    const sameParentSegment =
      !!pcDescriptor.parentSemanticSegment &&
      !!moDescriptor.parentSemanticSegment &&
      pcDescriptor.parentSemanticSegment === moDescriptor.parentSemanticSegment;
    const sameTopLevelPathFamily =
      !!pcDescriptor.topLevelSemanticPath &&
      !!moDescriptor.topLevelSemanticPath &&
      computePathSimilarity(pcDescriptor.topLevelSemanticPath, moDescriptor.topLevelSemanticPath) >= 0.7;
    const compatibleLayout =
      pcDescriptor.layoutInfo.mode === moDescriptor.layoutInfo.mode ||
      pcDescriptor.layoutSignature === moDescriptor.layoutSignature ||
      (pcDescriptor.layoutInfo.mode === "NONE" && moDescriptor.layoutInfo.mode === "NONE");
    const sameNamedRole =
      !!pcDescriptor.canonicalName &&
      !!moDescriptor.canonicalName &&
      (pcDescriptor.canonicalName === moDescriptor.canonicalName ||
        computePathSimilarity(pcDescriptor.canonicalName, moDescriptor.canonicalName) >= 0.72);

    const weakRolePair =
      isGenericContainerDescriptor(pcDescriptor) ||
      isGenericContainerDescriptor(moDescriptor) ||
      isWeakTextRoleDescriptor(pcDescriptor) ||
      isWeakTextRoleDescriptor(moDescriptor);

    if ((sameTopLevelSegment || sameParentSegment || sameTopLevelPathFamily) && compatibleLayout) {
      return weakRolePair ? sameParentSegment : true;
    }

    if (sameNamedRole && (sameTopLevelSegment || sameTopLevelPathFamily)) {
      return weakRolePair ? sameParentSegment && compatibleLayout : true;
    }

    return false;
  }

  function hasStrongIdentitySignal(pcDescriptor, moDescriptor) {
    if (
      pcDescriptor.componentInfo.componentKey &&
      moDescriptor.componentInfo.componentKey &&
      pcDescriptor.componentInfo.componentKey === moDescriptor.componentInfo.componentKey
    ) {
      return true;
    }

    if (
      pcDescriptor.textFingerprint &&
      moDescriptor.textFingerprint &&
      pcDescriptor.textFingerprint === moDescriptor.textFingerprint
    ) {
      return true;
    }

    if (
      pcDescriptor.variableFingerprint &&
      moDescriptor.variableFingerprint &&
      pcDescriptor.variableFingerprint === moDescriptor.variableFingerprint
    ) {
      return true;
    }

    if (
      pcDescriptor.canonicalName &&
      moDescriptor.canonicalName &&
      pcDescriptor.canonicalName === moDescriptor.canonicalName &&
      !pcDescriptor.isAutoNamed &&
      !moDescriptor.isAutoNamed
    ) {
      return true;
    }

    return false;
  }

  function scoreNodePair(pcDescriptor, moDescriptor, hierarchical) {
    const evidence = {
      type: 0,
      component: 0,
      textFingerprint: 0,
      variableFingerprint: 0,
      nameAlias: 0,
      structure: 0,
      parentContext: 0,
      layout: 0,
      childContent: 0,
      path: 0,
      geometry: 0,
    };
    let totalWeight = 0;
    let totalScore = 0;

    addWeighted("type", 1.2, pcDescriptor.type === moDescriptor.type ? 1 : CONTAINER_TYPES[pcDescriptor.type] && CONTAINER_TYPES[moDescriptor.type] ? 0.74 : 0.55);

    const componentScore = getComponentScore(pcDescriptor.componentInfo, moDescriptor.componentInfo);
    if (componentScore >= 0) {
      addWeighted("component", 2.3, componentScore);
    }

    const textScore = getTextScore(pcDescriptor.textFingerprint, moDescriptor.textFingerprint);
    if (textScore >= 0) {
      addWeighted("textFingerprint", 2.1, textScore);
    }

    const variableScore = getVariableScore(pcDescriptor.variableFingerprint, moDescriptor.variableFingerprint);
    if (variableScore >= 0) {
      addWeighted("variableFingerprint", 1.35, variableScore);
    }

    const nameScore = getNameScore(pcDescriptor, moDescriptor);
    if (nameScore >= 0) {
      addWeighted("nameAlias", 1.0, nameScore);
    }

    addWeighted("structure", 1.15, computeStructureScore(pcDescriptor, moDescriptor));
    addWeighted("parentContext", hierarchical ? 0.95 : 1.2, computeParentContextScore(pcDescriptor, moDescriptor));
    addWeighted("layout", 1.05, computeLayoutScore(pcDescriptor, moDescriptor));
    addWeighted("childContent", hierarchical ? 1.45 : 1.65, computeChildContentScore(pcDescriptor, moDescriptor));
    addWeighted("path", hierarchical ? 1.2 : 1.0, computePathSimilarity(pcDescriptor.semanticPath, moDescriptor.semanticPath));
    addWeighted("geometry", hierarchical ? 0.95 : 0.8, computeGeometryScore(pcDescriptor, moDescriptor));

    if (!totalWeight) {
      return null;
    }

    const score = clampScore(totalScore / totalWeight);
    return {
      pc: pcDescriptor,
      mo: moDescriptor,
      score: roundConfidence(score),
      evidence: evidence,
    };

    function addWeighted(key, weight, value) {
      if (typeof value !== "number" || value < 0) {
        return;
      }
      evidence[key] = roundConfidence(value);
      totalWeight += weight;
      totalScore += weight * clampScore(value);
    }
  }

  function getComponentScore(pcComponent, moComponent) {
    if (!pcComponent || !moComponent) {
      return -1;
    }

    if (pcComponent.componentKey && pcComponent.componentKey === moComponent.componentKey) {
      if (
        pcComponent.propertySignature &&
        pcComponent.propertySignature === moComponent.propertySignature &&
        pcComponent.referenceSignature === moComponent.referenceSignature
      ) {
        return 1;
      }
      return 0.94;
    }

    if (pcComponent.componentFamily && pcComponent.componentFamily === moComponent.componentFamily) {
      if (
        pcComponent.propertySignature &&
        pcComponent.propertySignature === moComponent.propertySignature &&
        pcComponent.referenceSignature === moComponent.referenceSignature
      ) {
        return 0.9;
      }
      return 0.82;
    }

    if (
      pcComponent.propertySignature &&
      moComponent.propertySignature &&
      pcComponent.propertySignature === moComponent.propertySignature
    ) {
      return 0.72;
    }

    if (!pcComponent.componentKey && !moComponent.componentKey && !pcComponent.propertySignature && !moComponent.propertySignature) {
      return -1;
    }

    return 0.2;
  }

  function getVariableScore(pcFingerprint, moFingerprint) {
    if (!pcFingerprint && !moFingerprint) {
      return -1;
    }
    if (!pcFingerprint || !moFingerprint) {
      return 0.08;
    }
    if (pcFingerprint === moFingerprint) {
      return 1;
    }

    const pcTokens = pcFingerprint.split("|").filter(Boolean);
    const moTokens = moFingerprint.split("|").filter(Boolean);
    if (!pcTokens.length || !moTokens.length) {
      return 0.2;
    }

    let shared = 0;
    for (let index = 0; index < pcTokens.length; index += 1) {
      if (moTokens.indexOf(pcTokens[index]) >= 0) {
        shared += 1;
      }
    }

    return clampScore(shared / Math.max(pcTokens.length, moTokens.length));
  }

  function getTextScore(pcText, moText) {
    if (!pcText && !moText) {
      return -1;
    }
    if (!pcText || !moText) {
      return 0.12;
    }
    if (pcText === moText) {
      return 1;
    }
    if (pcText.length >= 4 && moText.length >= 4 && (pcText.indexOf(moText) >= 0 || moText.indexOf(pcText) >= 0)) {
      return 0.82;
    }

    const pcTokens = pcText.split(" ").filter(Boolean);
    const moTokens = moText.split(" ").filter(Boolean);
    if (!pcTokens.length || !moTokens.length) {
      return 0.3;
    }

    let shared = 0;
    for (let pcIndex = 0; pcIndex < pcTokens.length; pcIndex += 1) {
      if (moTokens.indexOf(pcTokens[pcIndex]) >= 0) {
        shared += 1;
      }
    }

    return clampScore(shared / Math.max(pcTokens.length, moTokens.length));
  }

  function getNameScore(pcDescriptor, moDescriptor) {
    if (pcDescriptor.isAutoNamed && moDescriptor.isAutoNamed) {
      return -1;
    }

    const pcName = pcDescriptor.canonicalName;
    const moName = moDescriptor.canonicalName;
    if (!pcName && !moName) {
      return -1;
    }
    if (!pcName || !moName) {
      return 0.1;
    }
    if (pcName === moName) {
      return 1;
    }
    if (pcName.indexOf(moName) >= 0 || moName.indexOf(pcName) >= 0) {
      return 0.78;
    }

    const pcTokens = pcName.split(" ").filter(Boolean);
    const moTokens = moName.split(" ").filter(Boolean);
    let shared = 0;
    for (let index = 0; index < pcTokens.length; index += 1) {
      if (moTokens.indexOf(pcTokens[index]) >= 0) {
        shared += 1;
      }
    }

    if (!shared) {
      return 0;
    }

    return clampScore(shared / Math.max(pcTokens.length, moTokens.length));
  }

  function computeStructureScore(pcDescriptor, moDescriptor) {
    const scores = [];
    const childMax = Math.max(1, pcDescriptor.childCount, moDescriptor.childCount);
    const childDiff = Math.abs(pcDescriptor.childCount - moDescriptor.childCount);
    scores.push(clampScore(1 - childDiff / childMax));

    const siblingMax = Math.max(1, pcDescriptor.siblingCount - 1, moDescriptor.siblingCount - 1);
    const orderDiff = Math.abs(pcDescriptor.orderIndex - moDescriptor.orderIndex);
    scores.push(clampScore(1 - orderDiff / siblingMax));

    const depthMax = Math.max(1, pcDescriptor.depth, moDescriptor.depth);
    const depthDiff = Math.abs(pcDescriptor.depth - moDescriptor.depth);
    scores.push(clampScore(1 - depthDiff / depthMax));

    scores.push(pcDescriptor.hasChildren === moDescriptor.hasChildren ? 1 : 0.45);
    scores.push(pcDescriptor.visible === moDescriptor.visible ? 1 : 0.55);

    return averageScore(scores);
  }

  function computeParentContextScore(pcDescriptor, moDescriptor) {
    const scores = [];

    if (pcDescriptor.parentType || moDescriptor.parentType) {
      scores.push(pcDescriptor.parentType === moDescriptor.parentType ? 1 : 0.45);
    }

    if (pcDescriptor.parentSemanticSegment || moDescriptor.parentSemanticSegment) {
      scores.push(
        pcDescriptor.parentSemanticSegment && moDescriptor.parentSemanticSegment
          ? computePathSimilarity(pcDescriptor.parentSemanticSegment, moDescriptor.parentSemanticSegment)
          : 0.18
      );
    }

    if (pcDescriptor.parentSemanticPath || moDescriptor.parentSemanticPath) {
      scores.push(
        pcDescriptor.parentSemanticPath && moDescriptor.parentSemanticPath
          ? computePathSimilarity(pcDescriptor.parentSemanticPath, moDescriptor.parentSemanticPath)
          : 0.12
      );
    }

    if (!scores.length) {
      return 0.5;
    }

    return averageScore(scores);
  }

  function computeLayoutScore(pcDescriptor, moDescriptor) {
    const pcLayout = pcDescriptor.layoutInfo;
    const moLayout = moDescriptor.layoutInfo;
    if (!pcLayout && !moLayout) {
      return 0.5;
    }

    const scores = [];
    scores.push(pcLayout.mode === moLayout.mode ? 1 : pcLayout.mode === "NONE" || moLayout.mode === "NONE" ? 0.52 : 0.28);
    scores.push(pcLayout.wrap === moLayout.wrap ? 1 : 0.55);
    scores.push(clampScore(1 - Math.abs(pcLayout.gap - moLayout.gap) / Math.max(8, pcLayout.gap, moLayout.gap, 1)));
    scores.push(clampScore(1 - Math.abs(pcLayout.paddingX - moLayout.paddingX) / Math.max(12, pcLayout.paddingX, moLayout.paddingX, 1)));
    scores.push(clampScore(1 - Math.abs(pcLayout.paddingY - moLayout.paddingY) / Math.max(12, pcLayout.paddingY, moLayout.paddingY, 1)));
    scores.push(pcLayout.sizingHorizontal === moLayout.sizingHorizontal ? 1 : 0.65);
    scores.push(pcLayout.sizingVertical === moLayout.sizingVertical ? 1 : 0.65);
    scores.push(pcLayout.positioning === moLayout.positioning ? 1 : 0.4);
    scores.push(pcDescriptor.layoutSignature === moDescriptor.layoutSignature ? 1 : 0.6);

    return averageScore(scores);
  }

  function computeChildContentScore(pcDescriptor, moDescriptor) {
    if (!pcDescriptor.hasChildren && !moDescriptor.hasChildren) {
      return -1;
    }

    const scores = [];
    const pcSignature = String(pcDescriptor.childSemanticSignature || "");
    const moSignature = String(moDescriptor.childSemanticSignature || "");
    const pcMeaningful = Number.isFinite(pcDescriptor.meaningfulChildCount) ? pcDescriptor.meaningfulChildCount : 0;
    const moMeaningful = Number.isFinite(moDescriptor.meaningfulChildCount) ? moDescriptor.meaningfulChildCount : 0;

    if (pcSignature && moSignature) {
      if (pcSignature === moSignature) {
        scores.push(1);
      } else {
        scores.push(computePathSimilarity(pcSignature.replace(/>/g, "/"), moSignature.replace(/>/g, "/")));
      }
    } else if (pcMeaningful || moMeaningful) {
      scores.push(0.18);
    }

    const countMax = Math.max(1, pcMeaningful, moMeaningful);
    scores.push(clampScore(1 - Math.abs(pcMeaningful - moMeaningful) / countMax));

    return averageScore(scores);
  }

  function computePathSimilarity(pcPath, moPath) {
    const pcSegments = String(pcPath || "")
      .split("/")
      .filter(Boolean);
    const moSegments = String(moPath || "")
      .split("/")
      .filter(Boolean);

    if (!pcSegments.length || !moSegments.length) {
      return 0;
    }

    let suffixMatches = 0;
    let pcIndex = pcSegments.length - 1;
    let moIndex = moSegments.length - 1;
    while (pcIndex >= 0 && moIndex >= 0) {
      if (pcSegments[pcIndex] !== moSegments[moIndex]) {
        break;
      }
      suffixMatches += 1;
      pcIndex -= 1;
      moIndex -= 1;
    }

    const unique = new Set(pcSegments.concat(moSegments));
    let overlap = 0;
    unique.forEach((segment) => {
      if (pcSegments.indexOf(segment) >= 0 && moSegments.indexOf(segment) >= 0) {
        overlap += 1;
      }
    });

    const suffixScore = suffixMatches / Math.max(pcSegments.length, moSegments.length);
    const overlapScore = overlap / Math.max(1, unique.size);
    return clampScore(suffixScore * 0.65 + overlapScore * 0.35);
  }

  function computeGeometryScore(pcDescriptor, moDescriptor) {
    const pcBounds = pcDescriptor.relativeBounds;
    const moBounds = moDescriptor.relativeBounds;
    if (!pcBounds || !moBounds) {
      return 0.4;
    }

    const widthScore = clampScore(1 - Math.abs(pcBounds.widthRatio - moBounds.widthRatio) * 1.8);
    const heightScore = clampScore(1 - Math.abs(pcBounds.heightRatio - moBounds.heightRatio) * 1.8);
    const yScore = clampScore(1 - Math.abs(pcBounds.yRatio - moBounds.yRatio) * 2.6);
    const xScore = clampScore(1 - Math.abs(pcBounds.xRatio - moBounds.xRatio) * 1.6);
    const horizontalAnchorScore = pcBounds.horizontalAnchor === moBounds.horizontalAnchor ? 1 : 0.55;
    const verticalAnchorScore = pcBounds.verticalAnchor === moBounds.verticalAnchor ? 1 : 0.6;

    return averageScore([widthScore, heightScore, yScore, xScore, horizontalAnchorScore, verticalAnchorScore]);
  }

  function createMatchRecord(pairId, createdAt, pair, scope) {
    return {
      type: "match",
      id: createRecordId("match"),
      version: PATCH_VERSION,
      pairId: pairId,
      scope: scope,
      matchTier: getMatchTier(pair.score),
      fromNodeIds: [pair.pc.id],
      toNodeIds: [pair.mo.id],
      cardinality: "1:1",
      confidence: roundConfidence(pair.score),
      evidence: buildEvidencePayload(pair),
      createdAt: createdAt,
    };
  }

  function buildEvidencePayload(pair) {
    return {
      component: pair.evidence.component >= 0.75,
      textFingerprint: pair.evidence.textFingerprint >= 0.75,
      variableFingerprint: pair.evidence.variableFingerprint >= 0.68,
      structure: pair.evidence.structure >= 0.65,
      parentContext: pair.evidence.parentContext >= 0.7,
      layout: pair.evidence.layout >= 0.7,
      childContent: pair.evidence.childContent >= 0.75,
      nameAlias: pair.evidence.nameAlias >= 0.72,
      scores: {
        type: pair.evidence.type,
        component: pair.evidence.component,
        textFingerprint: pair.evidence.textFingerprint,
        variableFingerprint: pair.evidence.variableFingerprint,
        nameAlias: pair.evidence.nameAlias,
        structure: pair.evidence.structure,
        parentContext: pair.evidence.parentContext,
        layout: pair.evidence.layout,
        childContent: pair.evidence.childContent,
        path: pair.evidence.path,
        geometry: pair.evidence.geometry,
      },
      from: {
        path: pair.pc.path,
        semanticPath: pair.pc.semanticPath,
        parentSemanticPath: pair.pc.parentSemanticPath,
        type: pair.pc.type,
        variableFingerprint: pair.pc.variableFingerprint,
        layoutSignature: pair.pc.layoutSignature,
        childSemanticSignature: pair.pc.childSemanticSignature,
      },
      to: {
        path: pair.mo.path,
        semanticPath: pair.mo.semanticPath,
        parentSemanticPath: pair.mo.parentSemanticPath,
        type: pair.mo.type,
        variableFingerprint: pair.mo.variableFingerprint,
        layoutSignature: pair.mo.layoutSignature,
        childSemanticSignature: pair.mo.childSemanticSignature,
      },
    };
  }

  function buildRuleRecords(classifiedPair, pairId, createdAt, matching) {
    const records = [];
    const pcLayout = getLayoutInfo(classifiedPair.pc.node);
    const moLayout = getLayoutInfo(classifiedPair.mo.node);
    const widthRatio = roundRatio(classifiedPair.mo.width / Math.max(1, classifiedPair.pc.width));

    records.push(
      createRuleRecord(
        pairId,
        createdAt,
        "viewport-width",
        "root",
        1,
        "deterministic",
        `${classifiedPair.pc.width}px viewport to ${classifiedPair.mo.width}px viewport`,
        {
          pcWidth: classifiedPair.pc.width,
          moWidth: classifiedPair.mo.width,
          widthRatio: widthRatio,
        }
      )
    );

    if (pcLayout.mode !== moLayout.mode && (pcLayout.mode !== "NONE" || moLayout.mode !== "NONE")) {
      records.push(
        createRuleRecord(
          pairId,
          createdAt,
          "layout-axis",
          "root",
          0.94,
          "deterministic",
          `${pcLayout.mode.toLowerCase()} layout to ${moLayout.mode.toLowerCase()} layout`,
          {
            pcMode: pcLayout.mode,
            moMode: moLayout.mode,
            pcSource: pcLayout.source,
            moSource: moLayout.source,
          }
        )
      );
    }

    if (pcLayout.gap || moLayout.gap) {
      records.push(
        createRuleRecord(
          pairId,
          createdAt,
          "gap-scale",
          "root",
          0.86,
          "deterministic",
          `gap ${pcLayout.gap}px to ${moLayout.gap}px`,
          {
            pcGap: pcLayout.gap,
            moGap: moLayout.gap,
          }
        )
      );
    }

    if (pcLayout.paddingX || pcLayout.paddingY || moLayout.paddingX || moLayout.paddingY) {
      records.push(
        createRuleRecord(
          pairId,
          createdAt,
          "padding-scale",
          "root",
          0.84,
          "deterministic",
          `padding ${pcLayout.paddingX}x${pcLayout.paddingY}px to ${moLayout.paddingX}x${moLayout.paddingY}px`,
          {
            pcPaddingX: pcLayout.paddingX,
            pcPaddingY: pcLayout.paddingY,
            moPaddingX: moLayout.paddingX,
            moPaddingY: moLayout.paddingY,
          }
        )
      );
    }

    const pcColumns = estimateColumnCount(classifiedPair.pc.node);
    const moColumns = estimateColumnCount(classifiedPair.mo.node);
    if (pcColumns && moColumns && pcColumns !== moColumns) {
      records.push(
        createRuleRecord(
          pairId,
          createdAt,
          "estimated-columns",
          "root",
          0.8,
          "deterministic",
          `estimated columns ${pcColumns} to ${moColumns}`,
          {
            pcColumns: pcColumns,
            moColumns: moColumns,
          }
        )
      );
    }

    const pcFontSize = getRepresentativeFontSize(classifiedPair.pc.node);
    const moFontSize = getRepresentativeFontSize(classifiedPair.mo.node);
    if (pcFontSize && moFontSize && Math.abs(pcFontSize - moFontSize) >= 0.5) {
      records.push(
        createRuleRecord(
          pairId,
          createdAt,
          "font-scale",
          "root",
          0.78,
          "deterministic",
          `representative font ${pcFontSize}px to ${moFontSize}px`,
          {
            pcFontSize: pcFontSize,
            moFontSize: moFontSize,
          }
        )
      );
    }

    appendMatchedNodeRules(
      records,
      matching && Array.isArray(matching.pairs) ? matching.pairs.filter((pair) => pair.tier === "confirmed") : [],
      pairId,
      createdAt
    );
    appendSectionPresenceRules(records, matching, pairId, createdAt);
    return records;
  }

  function buildAnalysisPreview(matching, ruleRecords, aggregatePreview) {
    const pairs = matching && Array.isArray(matching.pairs) ? matching.pairs.slice() : [];
    const rules = Array.isArray(ruleRecords) ? ruleRecords.slice() : [];
    const aggregate = aggregatePreview && typeof aggregatePreview === "object" ? aggregatePreview : {};
    const lowConfidenceMatches = pairs
      .filter((pair) => pair.score < 0.82)
      .sort((left, right) => left.score - right.score)
      .slice(0, 3)
      .map((pair) => `${summarizePairLabel(pair.pc, pair.mo)} (${roundConfidence(pair.score)})`);
    const representativeMatches = pairs
      .slice()
      .sort((left, right) => right.score - left.score)
      .slice(0, 3)
      .map((pair) => `${summarizePairLabel(pair.pc, pair.mo)} (${roundConfidence(pair.score)})`);
    const representativeRules = rules
      .slice()
      .sort((left, right) => {
        const leftConfidence = typeof left.confidence === "number" ? left.confidence : 0;
        const rightConfidence = typeof right.confidence === "number" ? right.confidence : 0;
        return rightConfidence - leftConfidence;
      })
      .slice(0, 4)
      .map((rule) => String(rule.summary || "").trim())
      .filter(Boolean);
    const countsByRuleType = {};

    for (let index = 0; index < rules.length; index += 1) {
      const ruleType = typeof rules[index].ruleType === "string" ? rules[index].ruleType : "unknown";
      countsByRuleType[ruleType] = (countsByRuleType[ruleType] || 0) + 1;
    }

    return {
      lowConfidenceCount: matching && matching.stats ? matching.stats.lowConfidenceMatchCount : 0,
      lowConfidenceMatches: lowConfidenceMatches,
      representativeMatches: representativeMatches,
      representativeRules: representativeRules,
      countsByRuleType: countsByRuleType,
      repeatedRules: Array.isArray(aggregate.repeatedRules) ? aggregate.repeatedRules : [],
      conflictingRules: Array.isArray(aggregate.conflictingRules) ? aggregate.conflictingRules : [],
      lowConfidenceRules: Array.isArray(aggregate.lowConfidenceRules) ? aggregate.lowConfidenceRules : [],
      repeatedRuleCount: Number.isFinite(aggregate.repeatedRuleCount) ? aggregate.repeatedRuleCount : 0,
      conflictingRuleCount: Number.isFinite(aggregate.conflictingRuleCount) ? aggregate.conflictingRuleCount : 0,
      lowConfidenceRuleCount: Number.isFinite(aggregate.lowConfidenceRuleCount) ? aggregate.lowConfidenceRuleCount : 0,
    };
  }

  function appendMatchedNodeRules(records, pairs, pairId, createdAt) {
    const seen = new Set();
    const sortedPairs = pairs.slice().sort((left, right) => right.score - left.score);
    const maxDetailedRules = 48;

    for (let index = 0; index < sortedPairs.length; index += 1) {
      if (records.length >= maxDetailedRules) {
        return;
      }

      const pair = sortedPairs[index];
      appendVisibilityRule(pair);
      appendVariantRule(pair);
      appendAbsoluteAnchorRule(pair);
      appendSizingRule(pair);
    }

    appendChildReorderRules(sortedPairs);

    function appendVisibilityRule(pair) {
      if (pair.pc.visible === pair.mo.visible) {
        return;
      }

      const action = pair.pc.visible && !pair.mo.visible ? "hide" : "show";
      const nodeSignature = buildRuleNodeSignatureFromPair(pair);
      pushRule(
        `visibility|${nodeSignature}|${action}`,
        "visibility-change",
        deriveRuleScopeFromPair(pair),
        Math.max(0.72, pair.score),
        `${summarizePairLabel(pair.pc, pair.mo)} ${action} on mobile`,
        {
          fromNodeId: pair.pc.id,
          toNodeId: pair.mo.id,
          pcVisible: pair.pc.visible,
          moVisible: pair.mo.visible,
          nodeSignature: nodeSignature,
          nodeLabel: buildRuleNodeLabelFromPair(pair),
          parentSignature: buildParentRuleSignature(pair),
        }
      );
    }

    function appendVariantRule(pair) {
      const pcInfo = pair.pc.componentInfo;
      const moInfo = pair.mo.componentInfo;
      const sameFamily =
        (pcInfo.componentKey && pcInfo.componentKey === moInfo.componentKey) ||
        (pcInfo.componentFamily && pcInfo.componentFamily === moInfo.componentFamily);

      if (!sameFamily) {
        return;
      }

      const propertyChanged = pcInfo.propertySignature !== moInfo.propertySignature;
      const referenceChanged = pcInfo.referenceSignature !== moInfo.referenceSignature;
      if (!propertyChanged && !referenceChanged) {
        return;
      }

      const componentLabel = pcInfo.componentName || pair.pc.name || pair.mo.name || "component";
      pushRule(
        `variant|${pcInfo.componentKey || pcInfo.componentFamily}|${pcInfo.propertySignature}|${moInfo.propertySignature}|${pcInfo.referenceSignature}|${moInfo.referenceSignature}`,
        "variant-switch",
        deriveRuleScopeFromPair(pair),
        Math.max(0.78, pair.score),
        `${componentLabel} variant/property switch`,
        {
          fromNodeId: pair.pc.id,
          toNodeId: pair.mo.id,
          componentKey: pcInfo.componentKey || moInfo.componentKey,
          componentFamily: pcInfo.componentFamily || moInfo.componentFamily,
          pcPropertySignature: pcInfo.propertySignature,
          moPropertySignature: moInfo.propertySignature,
          pcReferenceSignature: pcInfo.referenceSignature,
          moReferenceSignature: moInfo.referenceSignature,
          nodeLabel: buildRuleNodeLabelFromPair(pair),
        }
      );
    }

    function appendAbsoluteAnchorRule(pair) {
      const pcBounds = pair.pc.relativeBounds;
      const moBounds = pair.mo.relativeBounds;
      if (!pcBounds || !moBounds) {
        return;
      }

      const hasAbsolute =
        pair.pc.layoutInfo.positioning === "ABSOLUTE" || pair.mo.layoutInfo.positioning === "ABSOLUTE";
      const sameHorizontal = pcBounds.horizontalAnchor === moBounds.horizontalAnchor;
      const sameVertical = pcBounds.verticalAnchor === moBounds.verticalAnchor;
      if (!hasAbsolute || !sameHorizontal || !sameVertical) {
        return;
      }

      const anchorLabel = `${pcBounds.horizontalAnchor}-${pcBounds.verticalAnchor}`;
      const nodeSignature = buildRuleNodeSignatureFromPair(pair);
      pushRule(
        `absolute|${anchorLabel}|${nodeSignature}`,
        "absolute-anchor",
        deriveRuleScopeFromPair(pair),
        Math.max(0.8, pair.score),
        `${summarizePairLabel(pair.pc, pair.mo)} absolute ${anchorLabel} anchor preserved`,
        {
          fromNodeId: pair.pc.id,
          toNodeId: pair.mo.id,
          anchor: anchorLabel,
          pcPositioning: pair.pc.layoutInfo.positioning,
          moPositioning: pair.mo.layoutInfo.positioning,
          nodeSignature: nodeSignature,
          nodeLabel: buildRuleNodeLabelFromPair(pair),
          parentSignature: buildParentRuleSignature(pair),
        }
      );
    }

    function appendSizingRule(pair) {
      const pcLayout = pair.pc.layoutInfo;
      const moLayout = pair.mo.layoutInfo;
      const sizingChanged =
        pcLayout.sizingHorizontal !== moLayout.sizingHorizontal ||
        pcLayout.sizingVertical !== moLayout.sizingVertical ||
        pcLayout.grow !== moLayout.grow;

      if (!sizingChanged) {
        return;
      }

      const nodeSignature = buildRuleNodeSignatureFromPair(pair);
      pushRule(
        `sizing|${nodeSignature}|${pcLayout.sizingHorizontal}|${pcLayout.sizingVertical}|${pcLayout.grow}|${moLayout.sizingHorizontal}|${moLayout.sizingVertical}|${moLayout.grow}`,
        "sizing-mode",
        deriveRuleScopeFromPair(pair),
        Math.max(0.7, pair.score),
        `${summarizePairLabel(pair.pc, pair.mo)} sizing ${formatSizingLabel(pcLayout)} -> ${formatSizingLabel(moLayout)}`,
        {
          fromNodeId: pair.pc.id,
          toNodeId: pair.mo.id,
          pcSizingHorizontal: pcLayout.sizingHorizontal,
          pcSizingVertical: pcLayout.sizingVertical,
          pcGrow: pcLayout.grow,
          moSizingHorizontal: moLayout.sizingHorizontal,
          moSizingVertical: moLayout.sizingVertical,
          moGrow: moLayout.grow,
          nodeSignature: nodeSignature,
          nodeLabel: buildRuleNodeLabelFromPair(pair),
          parentSignature: buildParentRuleSignature(pair),
          nodeType: pair.pc.type || pair.mo.type,
        }
      );
    }

    function appendChildReorderRules(confirmedPairs) {
      const groups = new Map();

      for (let index = 0; index < confirmedPairs.length; index += 1) {
        const pair = confirmedPairs[index];
        if (!pair || !pair.pc || !pair.mo || !pair.pc.parentId || !pair.mo.parentId) {
          continue;
        }

        const groupKey = `${pair.pc.parentId}|${pair.mo.parentId}`;
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey).push(pair);
      }

      groups.forEach((groupPairs) => {
        if (records.length >= maxDetailedRules || !Array.isArray(groupPairs) || groupPairs.length < 2) {
          return;
        }

        const reorder = buildChildReorderSummary(groupPairs);
        if (!reorder) {
          return;
        }

        const referencePair = groupPairs[0];
        const scope = deriveParentRuleScope(referencePair);
        const parentSignature = buildParentRuleSignature(referencePair);
        const parentLabel = summarizeScopeLabel(scope);
        pushRule(
          `child-reorder|${parentSignature}|${reorder.moOrderPattern}`,
          "child-reorder",
          scope,
          Math.max(0.8, reorder.confidence),
          `${parentLabel} child order reorders on mobile`,
          {
            parentPcId: referencePair.pc.parentId,
            parentMoId: referencePair.mo.parentId,
            parentSignature: parentSignature,
            matchedChildCount: reorder.matchedChildCount,
            movedCount: reorder.movedCount,
            inversionRatio: reorder.inversionRatio,
            averageShift: reorder.averageShift,
            pcOrderPattern: reorder.pcOrderPattern,
            moOrderPattern: reorder.moOrderPattern,
            pcOrderPreview: reorder.pcOrderPreview,
            moOrderPreview: reorder.moOrderPreview,
          }
        );
      });
    }

    function buildChildReorderSummary(groupPairs) {
      const sortablePairs = [];

      for (let index = 0; index < groupPairs.length; index += 1) {
        const pair = groupPairs[index];
        if (!pair || isWeakReorderPair(pair)) {
          continue;
        }
        sortablePairs.push(pair);
      }

      if (sortablePairs.length < 2) {
        return null;
      }

      const pcSorted = sortablePairs.slice().sort((left, right) => left.pc.orderIndex - right.pc.orderIndex);
      const moSorted = sortablePairs.slice().sort((left, right) => left.mo.orderIndex - right.mo.orderIndex);
      const moPositionByKey = new Map();
      const pcOrderPreview = [];
      const moOrderPreview = [];

      for (let index = 0; index < moSorted.length; index += 1) {
        moPositionByKey.set(`${moSorted[index].pc.id}|${moSorted[index].mo.id}`, index);
        moOrderPreview.push(buildReorderPreviewToken(moSorted[index], index));
      }

      if (!moPositionByKey.size) {
        return null;
      }

      let movedCount = 0;
      let totalShift = 0;
      let confidenceTotal = 0;
      const moRanksInPcOrder = [];

      for (let index = 0; index < pcSorted.length; index += 1) {
        const pair = pcSorted[index];
        const pairKey = `${pair.pc.id}|${pair.mo.id}`;
        const moPosition = moPositionByKey.get(pairKey);
        if (!Number.isFinite(moPosition)) {
          continue;
        }

        pcOrderPreview.push(buildReorderPreviewToken(pair, index));
        moRanksInPcOrder.push(moPosition);
        confidenceTotal += pair.score;
        if (moPosition !== index) {
          movedCount += 1;
          totalShift += Math.abs(moPosition - index);
        }
      }

      if (pcOrderPreview.join("|") === moOrderPreview.join("|")) {
        return null;
      }

      const averageShift = movedCount ? totalShift / movedCount : 0;
      const inversionRatio = computeInversionRatio(moRanksInPcOrder);
      if (movedCount < 2 && inversionRatio < 0.34 && averageShift < 1) {
        return null;
      }

      const averagePairConfidence = confidenceTotal / Math.max(1, pcSorted.length);
      const reorderStrength = clampScore(inversionRatio * 0.7 + clampScore(averageShift / Math.max(1, pcSorted.length - 1)) * 0.3);

      return {
        matchedChildCount: pcSorted.length,
        movedCount: movedCount,
        inversionRatio: roundConfidence(inversionRatio),
        averageShift: roundRatio(averageShift),
        pcOrderPattern: buildSequentialPattern(pcSorted.length),
        moOrderPattern: moRanksInPcOrder.join(">"),
        pcOrderPreview: limitPreviewTokens(pcOrderPreview),
        moOrderPreview: limitPreviewTokens(moOrderPreview),
        confidence: clampScore(averagePairConfidence * 0.78 + reorderStrength * 0.22),
      };
    }

    function isWeakReorderPair(pair) {
      if (!pair || !pair.pc || !pair.mo) {
        return true;
      }

      const pcToken = getDescriptorIdentityToken(pair.pc);
      const moToken = getDescriptorIdentityToken(pair.mo);
      const genericPair =
        (!pcToken && !moToken) ||
        (isGenericNamedDescriptor(pair.pc) && isGenericNamedDescriptor(pair.mo) && !pair.pc.textFingerprint && !pair.mo.textFingerprint);
      return genericPair && !pair.pc.componentInfo.componentKey && !pair.mo.componentInfo.componentKey;
    }

    function buildReorderPreviewToken(pair, index) {
      const token = getDescriptorIdentityToken(pair.pc) || getDescriptorIdentityToken(pair.mo) || summarizePairLabel(pair.pc, pair.mo) || "child";
      return `${token}#${index + 1}`;
    }

    function deriveParentRuleScope(pair) {
      if (pair.pc.parentSemanticSegment && !pair.pc.parentSemanticSegment.startsWith("unknown")) {
        return pair.pc.parentSemanticSegment;
      }
      if (pair.pc.topLevelSemanticSegment) {
        return pair.pc.topLevelSemanticSegment;
      }
      return deriveRuleScopeFromPair(pair);
    }

    function buildParentRuleSignature(pair) {
      return normalizeAggregateToken(
        pair.pc.parentSemanticPath || pair.mo.parentSemanticPath || pair.pc.topLevelSemanticPath || pair.mo.topLevelSemanticPath || pair.pc.parentId
      );
    }

    function buildRuleNodeSignatureFromPair(pair) {
      const componentKey =
        pair.pc.componentInfo.componentKey ||
        pair.mo.componentInfo.componentKey ||
        pair.pc.componentInfo.componentFamily ||
        pair.mo.componentInfo.componentFamily;
      if (componentKey) {
        return normalizeAggregateToken(componentKey);
      }

      const textFingerprint = pair.pc.textFingerprint || pair.mo.textFingerprint;
      if (textFingerprint) {
        return normalizeAggregateToken(textFingerprint.split(" ").slice(0, 4).join(" "));
      }

      const stableName = !isGenericNamedDescriptor(pair.pc)
        ? pair.pc.canonicalName
        : !isGenericNamedDescriptor(pair.mo)
        ? pair.mo.canonicalName
        : "";
      if (stableName) {
        return normalizeAggregateToken(stableName);
      }

      return normalizeAggregateToken(pair.pc.semanticPath || pair.mo.semanticPath || pair.pc.type || "node");
    }

    function buildRuleNodeLabelFromPair(pair) {
      return summarizePairLabel(pair.pc, pair.mo) || pair.pc.type || pair.mo.type || "node";
    }

    function computeInversionRatio(orderValues) {
      if (!Array.isArray(orderValues) || orderValues.length < 2) {
        return 0;
      }

      let inversions = 0;
      let comparisons = 0;
      for (let leftIndex = 0; leftIndex < orderValues.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < orderValues.length; rightIndex += 1) {
          comparisons += 1;
          if (orderValues[leftIndex] > orderValues[rightIndex]) {
            inversions += 1;
          }
        }
      }

      return comparisons ? inversions / comparisons : 0;
    }

    function buildSequentialPattern(count) {
      const values = [];
      for (let index = 0; index < count; index += 1) {
        values.push(String(index));
      }
      return values.join(">");
    }

    function limitPreviewTokens(tokens) {
      return Array.isArray(tokens) ? tokens.slice(0, 6) : [];
    }

    function pushRule(signature, ruleType, scope, confidence, summary, payload) {
      if (seen.has(signature)) {
        return;
      }
      seen.add(signature);
      records.push(createRuleRecord(pairId, createdAt, ruleType, scope, confidence, "deterministic", summary, payload));
    }
  }

  function deriveRuleScopeFromPair(pair) {
    if (pair.pc.parentSemanticSegment && !pair.pc.parentSemanticSegment.startsWith("unknown")) {
      return pair.pc.parentSemanticSegment;
    }
    if (pair.pc.semanticSegment) {
      return pair.pc.semanticSegment;
    }
    return "node";
  }

  function summarizeScopeLabel(scope) {
    const text = typeof scope === "string" ? scope.replace(/[-_/]+/g, " ").trim() : "";
    return text || "section";
  }

  function appendSectionPresenceRules(records, matching, pairId, createdAt) {
    const seen = new Set();
    const pcUnmatched = matching && Array.isArray(matching.pcUnmatchedDescriptors) ? matching.pcUnmatchedDescriptors : [];
    const moUnmatched = matching && Array.isArray(matching.moUnmatchedDescriptors) ? matching.moUnmatchedDescriptors : [];
    const pcSections = collectUnmatchedTopLevelSections(pcUnmatched);
    const moSections = collectUnmatchedTopLevelSections(moUnmatched);
    const sharedSectionSignatures = new Set();

    for (let pcIndex = 0; pcIndex < pcSections.length; pcIndex += 1) {
      const pcSignature = buildSectionSignature(pcSections[pcIndex]);
      if (!pcSignature) {
        continue;
      }

      for (let moIndex = 0; moIndex < moSections.length; moIndex += 1) {
        if (pcSignature === buildSectionSignature(moSections[moIndex])) {
          sharedSectionSignatures.add(pcSignature);
          break;
        }
      }
    }

    for (let index = 0; index < pcSections.length; index += 1) {
      pushSectionRule(pcSections[index], "collapse");
    }

    for (let index = 0; index < moSections.length; index += 1) {
      pushSectionRule(moSections[index], "expand");
    }

    function pushSectionRule(descriptor, action) {
      const sectionSignature = buildSectionSignature(descriptor);
      const signature = `section-presence|${sectionSignature}|${action}`;
      if (!sectionSignature || seen.has(signature) || sharedSectionSignatures.has(sectionSignature)) {
        return;
      }

      seen.add(signature);
      records.push(
        createRuleRecord(
          pairId,
          createdAt,
          "section-presence",
          descriptor.semanticSegment || "section",
          calculateSectionPresenceConfidence(descriptor),
          "deterministic",
          action === "collapse"
            ? `${summarizeSectionLabel(descriptor)} section collapses on mobile`
            : `${summarizeSectionLabel(descriptor)} section expands on mobile`,
          {
            action: action,
            nodeId: descriptor.id,
            sectionSignature: sectionSignature,
            sectionLabel: summarizeSectionLabel(descriptor),
            sectionSemanticPath: descriptor.semanticPath,
            topLevelSemanticPath: descriptor.topLevelSemanticPath,
            childCount: descriptor.childCount,
            meaningfulChildCount: descriptor.meaningfulChildCount,
            layoutMode: descriptor.layoutInfo ? descriptor.layoutInfo.mode : "",
          }
        )
      );
    }
  }

  function collectUnmatchedTopLevelSections(descriptors) {
    const result = [];

    for (let index = 0; index < descriptors.length; index += 1) {
      const descriptor = descriptors[index];
      if (!descriptor || descriptor.depth !== 1) {
        continue;
      }
      if (!isSectionLikeDescriptor(descriptor)) {
        continue;
      }
      result.push(descriptor);
    }

    return result;
  }

  function isSectionLikeDescriptor(descriptor) {
    if (!descriptor || descriptor.visible === false) {
      return false;
    }

    if (!descriptor.hasChildren || descriptor.childCount < 1) {
      return false;
    }

    if (descriptor.meaningfulChildCount >= 2) {
      return true;
    }

    if (descriptor.componentInfo.componentKey || descriptor.componentInfo.componentFamily) {
      return true;
    }

    if (descriptor.canonicalName && !isGenericNamedDescriptor(descriptor)) {
      return true;
    }

    return !!descriptor.childSemanticSignature;
  }

  function buildSectionSignature(descriptor) {
    if (!descriptor) {
      return "";
    }

    return normalizeAggregateToken(
      descriptor.componentInfo.componentFamily ||
        descriptor.canonicalName ||
        descriptor.childSemanticSignature ||
        descriptor.semanticSegment ||
        descriptor.topLevelSemanticSegment
    );
  }

  function summarizeSectionLabel(descriptor) {
    if (!descriptor) {
      return "section";
    }

    return (
      descriptor.componentInfo.componentName ||
      descriptor.name ||
      descriptor.canonicalName ||
      descriptor.semanticSegment ||
      descriptor.topLevelSemanticSegment ||
      "section"
    );
  }

  function calculateSectionPresenceConfidence(descriptor) {
    const scores = [];
    scores.push(descriptor.meaningfulChildCount >= 2 ? 0.94 : descriptor.meaningfulChildCount === 1 ? 0.84 : 0.74);
    scores.push(descriptor.componentInfo.componentKey || descriptor.componentInfo.componentFamily ? 0.92 : 0.76);
    scores.push(descriptor.canonicalName && !isGenericNamedDescriptor(descriptor) ? 0.88 : 0.72);
    scores.push(descriptor.layoutInfo && descriptor.layoutInfo.mode !== "NONE" ? 0.86 : 0.76);
    return roundConfidence(clampScore(averageScore(scores)));
  }

  function summarizePairLabel(pcDescriptor, moDescriptor) {
    const pcLabel = pcDescriptor && pcDescriptor.canonicalName ? pcDescriptor.canonicalName : pcDescriptor ? pcDescriptor.name : "";
    const moLabel = moDescriptor && moDescriptor.canonicalName ? moDescriptor.canonicalName : moDescriptor ? moDescriptor.name : "";
    const base = pcLabel || moLabel || "node";
    return String(base).replace(/\s+/g, " ").trim();
  }

  function formatSizingLabel(layoutInfo) {
    const horizontal = layoutInfo && layoutInfo.sizingHorizontal ? layoutInfo.sizingHorizontal.toLowerCase() : "none";
    const vertical = layoutInfo && layoutInfo.sizingVertical ? layoutInfo.sizingVertical.toLowerCase() : "none";
    const grow = layoutInfo && layoutInfo.grow ? "+grow" : "";
    return `${horizontal}/${vertical}${grow}`;
  }

  function createRuleRecord(pairId, createdAt, ruleType, scope, confidence, source, summary, payload) {
    return {
      type: "rule",
      id: createRecordId("rule"),
      version: PATCH_VERSION,
      pairId: pairId,
      direction: "pc-to-mo",
      ruleType: ruleType,
      scope: scope,
      confidence: roundConfidence(confidence),
      source: source,
      summary: summary,
      payload: payload,
      createdAt: createdAt,
    };
  }

  function buildAggregateRuleRecords(currentStore, currentRuleRecords, currentPairRecord, createdAt) {
    const existingRecords = currentStore && Array.isArray(currentStore.records) ? currentStore.records : [];
    const allRuleRecords = [];
    const pairSignatureById = new Map();

    for (let index = 0; index < existingRecords.length; index += 1) {
      const existingRecord = existingRecords[index];
      if (!existingRecord || existingRecord.type !== "pair") {
        continue;
      }

      pairSignatureById.set(
        existingRecord.id,
        typeof existingRecord.selectionSignature === "string" && existingRecord.selectionSignature ? existingRecord.selectionSignature : existingRecord.id
      );
    }

    if (currentPairRecord && currentPairRecord.id) {
      pairSignatureById.set(
        currentPairRecord.id,
        typeof currentPairRecord.selectionSignature === "string" && currentPairRecord.selectionSignature ? currentPairRecord.selectionSignature : currentPairRecord.id
      );
    }

    for (let index = 0; index < existingRecords.length; index += 1) {
      if (existingRecords[index] && existingRecords[index].type === "rule") {
        allRuleRecords.push(existingRecords[index]);
      }
    }

    for (let index = 0; index < currentRuleRecords.length; index += 1) {
      allRuleRecords.push(currentRuleRecords[index]);
    }

    const aggregateMap = new Map();
    const bucketMembers = new Map();

    for (let index = 0; index < allRuleRecords.length; index += 1) {
      const normalized = normalizeRuleForAggregation(allRuleRecords[index], pairSignatureById);
      if (!normalized) {
        continue;
      }

      if (!aggregateMap.has(normalized.canonicalKey)) {
        aggregateMap.set(normalized.canonicalKey, {
          type: "aggregate-rule",
          id: createAggregateRuleId(normalized.canonicalKey),
          version: AGGREGATE_RULE_VERSION,
          canonicalKey: normalized.canonicalKey,
          conflictBucketKey: normalized.conflictBucketKey,
          direction: normalized.direction,
          ruleType: normalized.ruleType,
          scope: normalized.scope,
          summary: normalized.summary,
          supportCount: 0,
          avgConfidence: 0,
          maxConfidence: 0,
          minConfidence: 1,
          supportConfidenceMap: new Map(),
          pairIds: [],
          exampleRuleIds: [],
          status: "single",
          conflictCount: 0,
          createdAt: createdAt,
          updatedAt: createdAt,
        });
      }

      const aggregateRecord = aggregateMap.get(normalized.canonicalKey);
      aggregateRecord.supportConfidenceMap.set(normalized.pairSupportKey, normalized.confidence);
      aggregateRecord.supportCount = aggregateRecord.supportConfidenceMap.size;
      aggregateRecord.avgConfidence = roundConfidence(computeAverageConfidence(aggregateRecord.supportConfidenceMap));
      aggregateRecord.maxConfidence = roundConfidence(Math.max(aggregateRecord.maxConfidence, normalized.confidence));
      aggregateRecord.minConfidence = roundConfidence(Math.min(aggregateRecord.minConfidence, normalized.confidence));
      aggregateRecord.updatedAt = createdAt;
      if (aggregateRecord.pairIds.indexOf(normalized.pairId) < 0) {
        aggregateRecord.pairIds.push(normalized.pairId);
      }
      if (aggregateRecord.exampleRuleIds.length < 8 && aggregateRecord.exampleRuleIds.indexOf(normalized.ruleId) < 0) {
        aggregateRecord.exampleRuleIds.push(normalized.ruleId);
      }

      if (!bucketMembers.has(normalized.conflictBucketKey)) {
        bucketMembers.set(normalized.conflictBucketKey, new Set());
      }
      bucketMembers.get(normalized.conflictBucketKey).add(normalized.canonicalKey);
    }

    const aggregateRecords = [];
    aggregateMap.forEach((aggregateRecord) => {
      const bucketSet = bucketMembers.get(aggregateRecord.conflictBucketKey);
      aggregateRecord.status = aggregateRecord.supportCount >= 2 ? "repeated" : "single";
      aggregateRecord.conflictCount = bucketSet ? bucketSet.size : 0;
      delete aggregateRecord.supportConfidenceMap;
      aggregateRecords.push(aggregateRecord);
    });

    return {
      records: aggregateRecords,
      preview: buildAggregatePreview(currentRuleRecords, aggregateRecords),
    };

    function computeAverageConfidence(confidenceMap) {
      let total = 0;
      let count = 0;

      confidenceMap.forEach((value) => {
        total += value;
        count += 1;
      });

      return count ? total / count : 0;
    }
  }

  function buildAggregatePreview(currentRuleRecords, aggregateRecords) {
    const aggregateByKey = new Map();
    const conflictCounts = new Map();

    for (let index = 0; index < aggregateRecords.length; index += 1) {
      const aggregateRecord = aggregateRecords[index];
      aggregateByKey.set(aggregateRecord.canonicalKey, aggregateRecord);
      conflictCounts.set(aggregateRecord.conflictBucketKey, aggregateRecord.conflictCount);
    }

    const repeatedRules = [];
    const conflictingRules = [];
    const lowConfidenceRules = [];
    const seenRepeated = new Set();
    const seenConflicts = new Set();

    for (let index = 0; index < currentRuleRecords.length; index += 1) {
      const normalized = normalizeRuleForAggregation(currentRuleRecords[index], null);
      if (!normalized) {
        continue;
      }

      const aggregateRecord = aggregateByKey.get(normalized.canonicalKey);
      if (aggregateRecord && aggregateRecord.supportCount >= 2 && !seenRepeated.has(normalized.canonicalKey)) {
        seenRepeated.add(normalized.canonicalKey);
        repeatedRules.push(`${aggregateRecord.summary} ×${aggregateRecord.supportCount}`);
      }

      const conflictCount = conflictCounts.get(normalized.conflictBucketKey) || 0;
      if (conflictCount > 1 && !seenConflicts.has(normalized.conflictBucketKey)) {
        seenConflicts.add(normalized.conflictBucketKey);
        conflictingRules.push(`${buildConflictLabel(currentRuleRecords[index])} (${conflictCount}패턴)`);
      }

      if (normalized.confidence < LOW_CONFIDENCE_RULE_THRESHOLD) {
        lowConfidenceRules.push(`${normalized.summary} (${roundConfidence(normalized.confidence)})`);
      }
    }

    return {
      repeatedRules: repeatedRules.slice(0, 3),
      conflictingRules: conflictingRules.slice(0, 3),
      lowConfidenceRules: lowConfidenceRules.slice(0, 3),
      repeatedRuleCount: repeatedRules.length,
      conflictingRuleCount: conflictingRules.length,
      lowConfidenceRuleCount: lowConfidenceRules.length,
    };
  }

  function normalizeRuleForAggregation(ruleRecord, pairSignatureById) {
    if (!ruleRecord || ruleRecord.type !== "rule") {
      return null;
    }

    const direction = typeof ruleRecord.direction === "string" && ruleRecord.direction ? ruleRecord.direction : "pc-to-mo";
    const ruleType = typeof ruleRecord.ruleType === "string" && ruleRecord.ruleType ? ruleRecord.ruleType : "unknown";
    const scope = normalizeAggregateToken(ruleRecord.scope);
    const payload = ruleRecord.payload && typeof ruleRecord.payload === "object" ? ruleRecord.payload : {};
    const subjectSignature = buildRuleSubjectSignature(ruleType, scope, payload);
    const outcomeSignature = buildRuleOutcomeSignature(ruleType, payload, ruleRecord.summary);
    const canonicalKey = [direction, ruleType, scope, subjectSignature, outcomeSignature].join("|");
    const conflictBucketKey = [direction, ruleType, scope, subjectSignature].join("|");
    const confidence = typeof ruleRecord.confidence === "number" ? clampScore(ruleRecord.confidence) : 0;

    return {
      canonicalKey: canonicalKey,
      conflictBucketKey: conflictBucketKey,
      direction: direction,
      ruleType: ruleType,
      scope: scope,
      summary: typeof ruleRecord.summary === "string" && ruleRecord.summary.trim() ? ruleRecord.summary.trim() : `${ruleType} rule`,
      confidence: confidence,
      pairId: typeof ruleRecord.pairId === "string" ? ruleRecord.pairId : "",
      pairSupportKey:
        pairSignatureById && pairSignatureById.has(ruleRecord.pairId)
          ? pairSignatureById.get(ruleRecord.pairId)
          : typeof ruleRecord.pairId === "string"
          ? ruleRecord.pairId
          : "",
      ruleId: typeof ruleRecord.id === "string" ? ruleRecord.id : "",
    };
  }

  function buildRuleSubjectSignature(ruleType, scope, payload) {
    if (ruleType === "variant-switch") {
      return normalizeAggregateToken(payload.componentFamily || payload.componentKey || scope);
    }

    if (ruleType === "child-reorder") {
      return normalizeAggregateToken(payload.parentSignature || scope);
    }

    if (ruleType === "section-presence") {
      return normalizeAggregateToken(payload.sectionSignature || scope);
    }

    if (ruleType === "absolute-anchor") {
      return normalizeAggregateToken(payload.parentSignature || payload.nodeSignature || scope);
    }

    if (ruleType === "visibility-change") {
      return normalizeAggregateToken(payload.parentSignature || payload.nodeSignature || scope);
    }

    if (ruleType === "sizing-mode") {
      return normalizeAggregateToken(payload.nodeSignature || payload.parentSignature || scope);
    }

    return normalizeAggregateToken(scope);
  }

  function buildRuleOutcomeSignature(ruleType, payload, summary) {
    if (ruleType === "viewport-width") {
      return `${bucketPixel(payload.pcWidth)}->${bucketPixel(payload.moWidth)}`;
    }

    if (ruleType === "layout-axis") {
      return `${normalizeAggregateToken(payload.pcMode)}->${normalizeAggregateToken(payload.moMode)}`;
    }

    if (ruleType === "gap-scale") {
      return `${bucketPixel(payload.pcGap)}->${bucketPixel(payload.moGap)}`;
    }

    if (ruleType === "padding-scale") {
      return `${bucketPixel(payload.pcPaddingX)}x${bucketPixel(payload.pcPaddingY)}->${bucketPixel(payload.moPaddingX)}x${bucketPixel(payload.moPaddingY)}`;
    }

    if (ruleType === "estimated-columns") {
      return `${normalizeAggregateToken(payload.pcColumns)}->${normalizeAggregateToken(payload.moColumns)}`;
    }

    if (ruleType === "font-scale") {
      return `${bucketPixel(payload.pcFontSize)}->${bucketPixel(payload.moFontSize)}`;
    }

    if (ruleType === "child-reorder") {
      return `${normalizeAggregateToken(payload.pcOrderPattern)}->${normalizeAggregateToken(payload.moOrderPattern)}`;
    }

    if (ruleType === "section-presence") {
      return normalizeAggregateToken(payload.action);
    }

    if (ruleType === "visibility-change") {
      return `${payload.pcVisible ? "show" : "hide"}->${payload.moVisible ? "show" : "hide"}`;
    }

    if (ruleType === "variant-switch") {
      return [
        normalizeAggregateToken(payload.pcPropertySignature),
        normalizeAggregateToken(payload.moPropertySignature),
        normalizeAggregateToken(payload.pcReferenceSignature),
        normalizeAggregateToken(payload.moReferenceSignature),
      ].join("->");
    }

    if (ruleType === "absolute-anchor") {
      return `${normalizeAggregateToken(payload.anchor)}|${normalizeAggregateToken(payload.pcPositioning)}->${normalizeAggregateToken(payload.moPositioning)}`;
    }

    if (ruleType === "sizing-mode") {
      return [
        normalizeAggregateToken(payload.pcSizingHorizontal),
        normalizeAggregateToken(payload.pcSizingVertical),
        normalizeAggregateToken(payload.pcGrow),
      ].join("/") +
        "->" +
        [
          normalizeAggregateToken(payload.moSizingHorizontal),
          normalizeAggregateToken(payload.moSizingVertical),
          normalizeAggregateToken(payload.moGrow),
        ].join("/");
    }

    return normalizeAggregateToken(summary);
  }

  function buildConflictLabel(ruleRecord) {
    if (!ruleRecord) {
      return "conflicting rule";
    }

    const scope = typeof ruleRecord.scope === "string" && ruleRecord.scope ? ruleRecord.scope : "scope";
    const ruleType = typeof ruleRecord.ruleType === "string" && ruleRecord.ruleType ? ruleRecord.ruleType : "rule";
    const payload = ruleRecord.payload && typeof ruleRecord.payload === "object" ? ruleRecord.payload : {};
    const nodeLabel = typeof payload.nodeLabel === "string" && payload.nodeLabel ? payload.nodeLabel : "";
    const sectionLabel = typeof payload.sectionLabel === "string" && payload.sectionLabel ? payload.sectionLabel : "";
    if (ruleType === "child-reorder") {
      return `${scope} child order`;
    }
    if (ruleType === "section-presence") {
      return `${sectionLabel || scope} section presence`;
    }
    if (ruleType === "sizing-mode") {
      return `${nodeLabel || scope} sizing`;
    }
    if (ruleType === "visibility-change") {
      return `${nodeLabel || scope} visibility`;
    }
    if (ruleType === "absolute-anchor") {
      return `${nodeLabel || scope} anchor`;
    }
    return `${scope} ${ruleType}`;
  }

  function createAggregateRuleId(canonicalKey) {
    return `aggregate-rule:${hashString(canonicalKey)}`;
  }

  function normalizeAggregateToken(value) {
    if (typeof value === "number" && isFinite(value)) {
      return String(roundPixel(value));
    }

    const text = typeof value === "string" ? value.trim().toLowerCase() : value === true ? "true" : value === false ? "false" : "";
    if (!text) {
      return "na";
    }

    return text.replace(/\s+/g, "-");
  }

  function hashString(value) {
    const text = String(value || "");
    let hash = 2166136261;

    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0).toString(36);
  }

  function simplifyRootDescriptor(root) {
    const layout = getLayoutInfo(root.node);

    return {
      id: root.id,
      name: root.name,
      type: root.type,
      width: root.width,
      height: root.height,
      estimatedColumns: estimateColumnCount(root.node),
      representativeFontSize: getRepresentativeFontSize(root.node),
      layout: {
        mode: layout.mode,
        gap: layout.gap,
        paddingX: layout.paddingX,
        paddingY: layout.paddingY,
        source: layout.source,
      },
      stats: root.stats,
    };
  }

  function collectNodeStats(node) {
    const stats = {
      totalNodes: 0,
      textNodes: 0,
      visibleNodes: 0,
      containerNodes: 0,
    };

    walk(node);
    return stats;

    function walk(current) {
      if (!current) {
        return;
      }

      stats.totalNodes += 1;
      if (current.visible !== false) {
        stats.visibleNodes += 1;
      }
      if (String(current.type || "") === "TEXT") {
        stats.textNodes += 1;
      }
      if (CONTAINER_TYPES[String(current.type || "")]) {
        stats.containerNodes += 1;
      }

      if (!hasChildren(current)) {
        return;
      }

      for (let index = 0; index < current.children.length; index += 1) {
        walk(current.children[index]);
      }
    }
  }

  function getResponsiveMemoryHelper() {
    const memory = globalScope.__PIGMA_RESPONSIVE_MEMORY__;
    if (!memory || typeof memory.appendRecordsAsync !== "function" || typeof memory.summarizeStore !== "function") {
      throw new Error("Responsive memory 저장소를 찾지 못했습니다. 메모리 패치를 먼저 로드해 주세요.");
    }
    return memory;
  }

  function areNodeTypesCompatible(pcDescriptor, moDescriptor) {
    if (pcDescriptor.type === moDescriptor.type) {
      return true;
    }

    if (
      pcDescriptor.componentInfo.componentKey &&
      moDescriptor.componentInfo.componentKey &&
      pcDescriptor.componentInfo.componentKey === moDescriptor.componentInfo.componentKey
    ) {
      return true;
    }

    if (
      pcDescriptor.componentInfo.componentFamily &&
      moDescriptor.componentInfo.componentFamily &&
      pcDescriptor.componentInfo.componentFamily === moDescriptor.componentInfo.componentFamily
    ) {
      return true;
    }

    if (CONTAINER_TYPES[pcDescriptor.type] && CONTAINER_TYPES[moDescriptor.type]) {
      return true;
    }

    if (
      pcDescriptor.canonicalName &&
      moDescriptor.canonicalName &&
      pcDescriptor.canonicalName === moDescriptor.canonicalName
    ) {
      return true;
    }

    if (pcDescriptor.textFingerprint && moDescriptor.textFingerprint) {
      return true;
    }

    if (pcDescriptor.variableFingerprint && moDescriptor.variableFingerprint) {
      return true;
    }

    return false;
  }

  function isAutoName(name) {
    const text = typeof name === "string" ? name.trim() : "";
    if (!text) {
      return true;
    }

    for (let index = 0; index < AUTO_NAME_PATTERNS.length; index += 1) {
      if (AUTO_NAME_PATTERNS[index].test(text)) {
        return true;
      }
    }

    return false;
  }

  function canonicalizeName(name) {
    const text = typeof name === "string" ? name.trim().toLowerCase() : "";
    if (!text || isAutoName(text)) {
      return "";
    }

    return text
      .replace(/[._:/\\-]+/g, " ")
      .replace(/[0-9]+/g, "#")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getNodeBounds(node) {
    if (!node || typeof node !== "object") {
      return null;
    }

    if (
      typeof node.x === "number" &&
      typeof node.y === "number" &&
      typeof node.width === "number" &&
      typeof node.height === "number"
    ) {
      return {
        x: roundPixel(node.x),
        y: roundPixel(node.y),
        width: roundPixel(node.width),
        height: roundPixel(node.height),
      };
    }

    if (
      node.absoluteRenderBounds &&
      typeof node.absoluteRenderBounds.x === "number" &&
      typeof node.absoluteRenderBounds.y === "number" &&
      typeof node.absoluteRenderBounds.width === "number" &&
      typeof node.absoluteRenderBounds.height === "number"
    ) {
      return {
        x: roundPixel(node.absoluteRenderBounds.x),
        y: roundPixel(node.absoluteRenderBounds.y),
        width: roundPixel(node.absoluteRenderBounds.width),
        height: roundPixel(node.absoluteRenderBounds.height),
      };
    }

    return null;
  }

  function getSelectionSignature(selection) {
    const items = Array.isArray(selection) ? selection.slice() : [];
    items.sort((left, right) => {
      if (left.id < right.id) {
        return -1;
      }
      if (left.id > right.id) {
        return 1;
      }
      return 0;
    });

    return items
      .map((node) => {
        const bounds = getNodeBounds(node);
        const width = bounds ? bounds.width : 0;
        return `${node.id}:${width}`;
      })
      .join("|");
  }

  function safeName(node) {
    if (node && typeof node.name === "string" && node.name.trim()) {
      return node.name.trim();
    }
    return String((node && node.type) || "Unnamed");
  }

  function hasChildren(node) {
    return !!(node && Array.isArray(node.children) && node.children.length);
  }

  function roundPixel(value) {
    const number = typeof value === "number" && isFinite(value) ? value : 0;
    return Math.round(number * 100) / 100;
  }

  function bucketPixel(value) {
    const rounded = roundPixel(value);
    if (!rounded) {
      return "0";
    }
    if (rounded <= 4) {
      return String(Math.round(rounded));
    }
    return String(Math.round(rounded / 4) * 4);
  }

  function roundRatio(value) {
    const number = typeof value === "number" && isFinite(value) ? value : 0;
    return Math.round(number * 1000) / 1000;
  }

  function roundConfidence(value) {
    const number = typeof value === "number" && isFinite(value) ? value : 0;
    return Math.round(clampScore(number) * 1000) / 1000;
  }

  function getMatchTier(score) {
    const normalized = clampScore(score);
    if (normalized >= CONFIRMED_MATCH_THRESHOLD) {
      return "confirmed";
    }
    if (normalized >= CANDIDATE_MATCH_THRESHOLD) {
      return "candidate";
    }
    return "low-confidence";
  }

  function clampScore(value) {
    const number = typeof value === "number" && isFinite(value) ? value : 0;
    if (number < 0) {
      return 0;
    }
    if (number > 1) {
      return 1;
    }
    return number;
  }

  function averageScore(values) {
    let total = 0;
    let count = 0;

    for (let index = 0; index < values.length; index += 1) {
      if (typeof values[index] !== "number" || values[index] < 0) {
        continue;
      }
      total += values[index];
      count += 1;
    }

    return count ? clampScore(total / count) : 0;
  }

  function estimateColumnCount(rootNode) {
    if (!rootNode || !hasChildren(rootNode)) {
      return 1;
    }

    const rootBounds = getNodeBounds(rootNode);
    if (!rootBounds || !rootBounds.width) {
      return 1;
    }

    const buckets = [];
    const children = rootNode.children;
    for (let index = 0; index < children.length; index += 1) {
      const child = children[index];
      if (!child || child.visible === false) {
        continue;
      }

      const bounds = getNodeBounds(child);
      if (!bounds) {
        continue;
      }

      const ratio = roundRatio((bounds.x - rootBounds.x) / Math.max(1, rootBounds.width));
      let matchedBucket = false;
      for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) {
        if (Math.abs(buckets[bucketIndex] - ratio) <= 0.08) {
          matchedBucket = true;
          break;
        }
      }
      if (!matchedBucket) {
        buckets.push(ratio);
      }
    }

    return Math.max(1, buckets.length || 1);
  }

  function getRepresentativeFontSize(rootNode) {
    const values = [];
    collectFontSizes(rootNode, values);
    if (!values.length) {
      return 0;
    }

    values.sort((left, right) => left - right);
    const middle = Math.floor(values.length / 2);
    if (values.length % 2) {
      return roundPixel(values[middle]);
    }

    return roundPixel((values[middle - 1] + values[middle]) / 2);
  }

  function collectFontSizes(node, values) {
    if (!node) {
      return;
    }

    if (String(node.type || "") === "TEXT" && typeof node.fontSize === "number" && isFinite(node.fontSize)) {
      values.push(node.fontSize);
    }

    if (!hasChildren(node)) {
      return;
    }

    for (let index = 0; index < node.children.length; index += 1) {
      collectFontSizes(node.children[index], values);
    }
  }

  function createRecordId(prefix) {
    const timestamp = Date.now().toString(36);
    const random = Math.floor(Math.random() * 1679616)
      .toString(36)
      .padStart(4, "0");
    return `${prefix}:${timestamp}:${random}`;
  }

  function normalizeErrorMessage(error) {
    const memory = globalScope.__PIGMA_RESPONSIVE_MEMORY__;
    if (memory && typeof memory.normalizeErrorMessage === "function") {
      return memory.normalizeErrorMessage(error);
    }

    if (error instanceof Error && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }

    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }

    return "Responsive pair analysis failed.";
  }
})();
