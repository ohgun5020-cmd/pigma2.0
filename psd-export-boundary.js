;(()=>{
  // PIGMA_EXPORT_BOUNDARY::SOURCE_OF_TRUTH
  // Keep export-only message guards in this file so PSD export changes can
  // evolve without touching PSD import post-processing.
  // PIGMA_EXPORT_BOUNDARY::MESSAGE_TYPES
  // PIGMA_EXPORT_BOUNDARY::NORMALIZE_SETTINGS
  // PIGMA_EXPORT_BOUNDARY::LONG_EDITABLE_SEGMENTS
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  const originalOnMessage = figma.ui.onmessage;
  const originalPostMessage = figma.ui.postMessage.bind(figma.ui);
  const DEFAULT_EXPORT_SETTINGS = Object.freeze({
    psdVersion: "max-compatibility",
    textExportMode: "editable-text",
    imageExportMode: "bitmap-only",
    hiddenLayerMode: "ignore-hidden",
    exportPackageMode: "psd-only",
    fileNamePattern: "{frame-name}.psd"
  });
  const LONG_EDITABLE_SEGMENT_HEIGHT = 4500;
  const LONG_EDITABLE_SEGMENT_AREA = 10000000;
  const LONG_EDITABLE_SEGMENT_MIN_HEIGHT = 3500;
  const LONG_EDITABLE_COMPLEX_NODE_COUNT = 80;
  const LONG_EDITABLE_COMPLEX_TEXT_COUNT = 25;
  const LONG_EDITABLE_COMPLEX_IMAGE_COUNT = 4;
  const LONG_EDITABLE_COMPLEX_EFFECT_COUNT = 8;
  const LONG_EDITABLE_ANALYSIS_LIMIT = 2500;
  const LONG_EDITABLE_WHITESPACE_CAPTURE_MIN = 8;
  const LONG_EDITABLE_WHITESPACE_CAPTURE_MAX = 160;
  const LONG_EDITABLE_WHITESPACE_EDGE_TOLERANCE = 4;
  const PIGMA_EXPORT_TEMP_NODE_NAMES = Object.freeze([
    "__pigma-mask-preview__",
    "__pigma-background-blur-crop__",
    "__pigma-vector-preview__",
    "__pigma-text-preview-padding__",
    "__pigma-text-visual-probe__",
    "__pigma-long-frame-tile__"
  ]);
  const PIGMA_EXPORT_TEMP_NODE_NAME_SET = new Set(PIGMA_EXPORT_TEMP_NODE_NAMES);
  let activeEditableSegmentSession = null;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  try {
    figma.ui.postMessage = message => {
      const result = originalPostMessage(message);
      if (message && (message.type === "export-finished" || message.type === "export-error")) {
        cleanupExportMemory("after-export");
      }
      return result;
    };
  } catch (error) {
  }

  figma.ui.onmessage = async message => {
    if (message && message.type === "psd-export-long-editable-cancelled") {
      figma.ui.postMessage({ type: "export-error", message: "PSD 만들기를 취소했습니다." });
      return;
    }

    if (!isExportMessage(message)) {
      return originalOnMessage(message);
    }

    const normalizedMessage = normalizeExportMessage(message);

    if (normalizedMessage.type === "request-export") {
      cleanupExportMemory("before-export");

      const segmentPlan = getLongEditableSegmentPlan(normalizedMessage);
      if (segmentPlan && normalizedMessage.longEditableSegmentConsent !== true) {
        figma.ui.postMessage({
          type: "psd-export-long-editable-confirm",
          request: normalizedMessage,
          plan: serializeLongEditableSegmentPlan(segmentPlan)
        });
        figma.notify("긴 PSD 내보내기 확인이 필요합니다. 플러그인 창의 안내를 확인해주세요.");
        return;
      }

      if (segmentPlan && normalizedMessage.longEditableSegmentConsent === true) {
        return runLongEditableSegmentExport(normalizedMessage, segmentPlan);
      }
    }

    return originalOnMessage(normalizedMessage);
  };

  function isExportMessage(message) {
    return !!message && (message.type === "request-export" || message.type === "request-next-export-root");
  }

  function normalizeExportMessage(message) {
    if (!message || typeof message !== "object") {
      return message;
    }

    if (message.type === "request-next-export-root") {
      return { type: "request-next-export-root" };
    }

    return Object.assign({}, message, {
      type: "request-export",
      hiddenLayerMode: normalizeHiddenLayerMode(message.hiddenLayerMode),
      includeCompositePng: message.includeCompositePng === true,
      settings: normalizeExportSettings(message.settings),
      developerExportExperiments: normalizeExportExperiments(message.developerExportExperiments)
    });
  }

  function normalizeExportSettings(settings) {
    const source = settings && typeof settings === "object" ? settings : {};

    return {
      psdVersion: DEFAULT_EXPORT_SETTINGS.psdVersion,
      textExportMode: normalizeTextExportMode(source.textExportMode),
      imageExportMode: normalizeImageExportMode(source.imageExportMode),
      hiddenLayerMode: normalizeHiddenLayerMode(source.hiddenLayerMode),
      exportPackageMode: normalizeExportPackageMode(source.exportPackageMode),
      fileNamePattern: normalizeFileNamePattern(source.fileNamePattern)
    };
  }

  function normalizeTextExportMode(value) {
    return value === "rasterize-text" ? value : DEFAULT_EXPORT_SETTINGS.textExportMode;
  }

  function normalizeImageExportMode(value) {
    return value === "smart-object-if-possible" ? value : DEFAULT_EXPORT_SETTINGS.imageExportMode;
  }

  function normalizeHiddenLayerMode(value) {
    return value === "preserve-hidden" ? value : DEFAULT_EXPORT_SETTINGS.hiddenLayerMode;
  }

  function normalizeExportPackageMode(value) {
    if (value === "bundle-with-rasters" || value === "psd-with-png") {
      return "psd-with-png";
    }

    if (value === "psd-with-jpg") {
      return value;
    }

    return DEFAULT_EXPORT_SETTINGS.exportPackageMode;
  }

  function normalizeFileNamePattern(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : DEFAULT_EXPORT_SETTINGS.fileNamePattern;
  }

  function normalizeExportExperiments(value) {
    const source = value && typeof value === "object" ? value : {};

    return {
      disableShapePreviewCanvas: source.disableShapePreviewCanvas === true,
      forceBitmapVectorPreview: source.forceBitmapVectorPreview === true,
      disableEditableTextPreview: source.disableEditableTextPreview === true,
      disableLayerBlur: source.disableLayerBlur === true,
      disableProgressiveLayerBlur: source.disableProgressiveLayerBlur === true,
      disableBackgroundBlur: source.disableBackgroundBlur === true,
      disableNoise: source.disableNoise === true,
      disableTexture: source.disableTexture === true
    };
  }

  function getLongEditableSegmentPlan(message) {
    if (message.longEditableSegmentActive === true) {
      return null;
    }

    const selection = figma.currentPage.selection;
    if (!selection || selection.length !== 1) {
      return null;
    }

    const root = selection[0];
    if (!root || !("exportAsync" in root)) {
      return null;
    }

    const bounds = getNodeBounds(root);
    if (!bounds || bounds.width <= 0 || bounds.height <= LONG_EDITABLE_SEGMENT_HEIGHT) {
      return null;
    }

    const complexity = analyzeLongEditableComplexity(root);
    if (!isLongEditableRisk(bounds, complexity)) {
      return null;
    }

    const segmentCount = calculateLongEditableSegmentCount(bounds);
    if (segmentCount < 2) {
      return null;
    }

    return {
      root: root,
      rootName: getNodeName(root),
      bounds: bounds,
      complexity: complexity,
      segmentCount: segmentCount,
      segments: buildLongEditableSegments(root, bounds, segmentCount)
    };
  }

  function isLongEditableRisk(bounds, complexity) {
    if (!bounds || !complexity) {
      return false;
    }

    if (complexity.truncated) {
      return true;
    }

    if (complexity.nodeCount >= LONG_EDITABLE_COMPLEX_NODE_COUNT) {
      return true;
    }

    if (complexity.textCount >= LONG_EDITABLE_COMPLEX_TEXT_COUNT) {
      return true;
    }

    if (complexity.imagePaintCount >= LONG_EDITABLE_COMPLEX_IMAGE_COUNT) {
      return true;
    }

    if (complexity.effectCount >= LONG_EDITABLE_COMPLEX_EFFECT_COUNT) {
      return true;
    }

    return bounds.width * bounds.height >= LONG_EDITABLE_SEGMENT_AREA * 3 && complexity.nodeCount > 10;
  }

  function calculateLongEditableSegmentCount(bounds) {
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    const byHeight = Math.ceil(height / LONG_EDITABLE_SEGMENT_HEIGHT);
    const byArea = Math.ceil(width * height / LONG_EDITABLE_SEGMENT_AREA);
    let count = Math.max(2, byHeight, byArea);
    while (count > 2 && height / (count - 1) <= LONG_EDITABLE_SEGMENT_HEIGHT) {
      if (height / count >= LONG_EDITABLE_SEGMENT_MIN_HEIGHT) {
        break;
      }
      count -= 1;
    }
    return count;
  }

  function buildLongEditableSegments(root, bounds, count) {
    const segments = [];
    const height = Math.max(1, Math.round(bounds.height));
    for (let index = 0; index < count; index += 1) {
      const start = Math.round(index * height / count);
      const end = Math.round((index + 1) * height / count);
      segments.push({
        index: index,
        offsetY: start,
        height: Math.max(1, end - start),
        rect: {
          x: bounds.x,
          y: bounds.y + start,
          width: bounds.width,
          height: Math.max(1, end - start)
        }
      });
    }
    return includeLongEditableAdjacentWhitespaceAroundSegments(segments, root, bounds);
  }

  function includeLongEditableAdjacentWhitespaceAroundSegments(segments, root, bounds) {
    const intervals = getLongEditableContentIntervals(root);
    if (!intervals.length) {
      return segments;
    }

    const maxAllowedHeight = LONG_EDITABLE_SEGMENT_HEIGHT + LONG_EDITABLE_WHITESPACE_CAPTURE_MAX;
    const adjusted = segments.map(segment => includeLongEditableWhitespaceAroundSegment(segment, intervals, bounds, maxAllowedHeight));
    return removeLongEditableSegmentOverlap(adjusted);
  }

  function includeLongEditableWhitespaceAroundSegment(segment, intervals, rootBounds, maxAllowedHeight) {
    const contentRange = getLongEditableSegmentContentRange(segment, intervals);
    if (!contentRange) {
      return segment;
    }

    let nextY = segment.rect.y;
    let nextEnd = segment.rect.y + segment.rect.height;

    if (Math.abs(contentRange.start - segment.rect.y) <= LONG_EDITABLE_WHITESPACE_EDGE_TOLERANCE) {
      const previousEnd = findPreviousLongEditableContentEnd(intervals, contentRange.start);
      if (previousEnd !== null) {
        const gap = contentRange.start - previousEnd;
        if (gap >= LONG_EDITABLE_WHITESPACE_CAPTURE_MIN && gap <= LONG_EDITABLE_WHITESPACE_CAPTURE_MAX) {
          nextY = previousEnd;
        }
      } else {
        const gap = contentRange.start - rootBounds.y;
        if (gap >= LONG_EDITABLE_WHITESPACE_CAPTURE_MIN && gap <= LONG_EDITABLE_WHITESPACE_CAPTURE_MAX) {
          nextY = rootBounds.y;
        }
      }
    }

    if (Math.abs(contentRange.end - (segment.rect.y + segment.rect.height)) <= LONG_EDITABLE_WHITESPACE_EDGE_TOLERANCE) {
      const nextStart = findNextLongEditableContentStart(intervals, contentRange.end);
      if (nextStart !== null) {
        const gap = nextStart - contentRange.end;
        if (gap >= LONG_EDITABLE_WHITESPACE_CAPTURE_MIN && gap <= LONG_EDITABLE_WHITESPACE_CAPTURE_MAX) {
          nextEnd = nextStart;
        }
      } else {
        const rootEnd = rootBounds.y + rootBounds.height;
        const gap = rootEnd - contentRange.end;
        if (gap >= LONG_EDITABLE_WHITESPACE_CAPTURE_MIN && gap <= LONG_EDITABLE_WHITESPACE_CAPTURE_MAX) {
          nextEnd = rootEnd;
        }
      }
    }

    if (nextEnd - nextY > maxAllowedHeight) {
      return segment;
    }

    return buildLongEditableSegmentFromAbsoluteRange(segment.index, rootBounds, nextY, nextEnd);
  }

  function buildLongEditableSegmentFromAbsoluteRange(index, rootBounds, y, end) {
    const offsetY = Math.max(0, Math.round(y - rootBounds.y));
    const height = Math.max(1, Math.round(end - y));
    return {
      index: index,
      offsetY: offsetY,
      height: height,
      rect: {
        x: rootBounds.x,
        y: rootBounds.y + offsetY,
        width: rootBounds.width,
        height: height
      }
    };
  }

  function getLongEditableSegmentContentRange(segment, intervals) {
    const segmentStart = segment.rect.y;
    const segmentEnd = segment.rect.y + segment.rect.height;
    let start = Infinity;
    let end = -Infinity;
    for (let index = 0; index < intervals.length; index += 1) {
      const interval = intervals[index];
      if (interval.end <= segmentStart + 0.5 || interval.start >= segmentEnd - 0.5) {
        continue;
      }
      start = Math.min(start, interval.start);
      end = Math.max(end, interval.end);
    }
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return null;
    }
    return { start: start, end: end };
  }

  function getLongEditableContentIntervals(root) {
    const intervals = [];
    const stack = [];
    if (root && "children" in root && Array.isArray(root.children)) {
      for (let index = root.children.length - 1; index >= 0; index -= 1) {
        stack.push(root.children[index]);
      }
    }

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node || node.removed || node.visible === false) {
        continue;
      }

      const bounds = getNodeBounds(node);
      if (bounds && isLongEditableWhitespaceContentNode(node, bounds)) {
        intervals.push({
          start: bounds.y,
          end: bounds.y + bounds.height
        });
      }

      if ("children" in node && Array.isArray(node.children)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    intervals.sort((a, b) => a.start - b.start || a.end - b.end);
    return mergeLongEditableContentIntervals(intervals);
  }

  function isLongEditableWhitespaceContentNode(node, bounds) {
    if (!bounds || bounds.height <= 0.5) {
      return false;
    }
    if ("children" in node && Array.isArray(node.children) && isStructuralSegmentContainer(node)) {
      return false;
    }
    return bounds.height <= LONG_EDITABLE_SEGMENT_HEIGHT + LONG_EDITABLE_WHITESPACE_CAPTURE_MAX;
  }

  function mergeLongEditableContentIntervals(intervals) {
    const merged = [];
    for (let index = 0; index < intervals.length; index += 1) {
      const interval = intervals[index];
      const previous = merged.length > 0 ? merged[merged.length - 1] : null;
      if (previous && interval.start <= previous.end + 0.5) {
        previous.end = Math.max(previous.end, interval.end);
      } else {
        merged.push({
          start: interval.start,
          end: interval.end
        });
      }
    }
    return merged;
  }

  function findPreviousLongEditableContentEnd(intervals, contentStart) {
    let previousEnd = null;
    for (let index = 0; index < intervals.length; index += 1) {
      const interval = intervals[index];
      if (interval.end >= contentStart - 0.5) {
        break;
      }
      previousEnd = interval.end;
    }
    return previousEnd;
  }

  function findNextLongEditableContentStart(intervals, contentEnd) {
    for (let index = 0; index < intervals.length; index += 1) {
      const interval = intervals[index];
      if (interval.start > contentEnd + 0.5) {
        return interval.start;
      }
    }
    return null;
  }

  function removeLongEditableSegmentOverlap(segments) {
    const resolved = segments.map(segment => buildLongEditableSegmentFromAbsoluteRange(
      segment.index,
      {
        x: segment.rect.x,
        y: segment.rect.y - segment.offsetY,
        width: segment.rect.width,
        height: 0
      },
      segment.rect.y,
      segment.rect.y + segment.rect.height
    ));

    for (let index = 1; index < resolved.length; index += 1) {
      const previous = resolved[index - 1];
      const current = resolved[index];
      if (!previous || !current || previous.rect.y + previous.rect.height <= current.rect.y + 0.5) {
        continue;
      }

      const boundary = current.rect.y;
      previous.height = Math.max(1, Math.round(boundary - previous.rect.y));
      previous.rect.height = previous.height;
    }

    return resolved;
  }

  function serializeLongEditableSegmentPlan(plan) {
    const firstSegment = plan.segments.length > 0 ? plan.segments[0] : null;
    return {
      rootName: plan.rootName,
      width: Math.round(plan.bounds.width),
      height: Math.round(plan.bounds.height),
      segmentCount: plan.segmentCount,
      approximateSegmentHeight: firstSegment ? Math.round(firstSegment.height) : 0,
      maxSegmentHeight: LONG_EDITABLE_SEGMENT_HEIGHT,
      maxSegmentArea: LONG_EDITABLE_SEGMENT_AREA,
      nodeCount: plan.complexity.nodeCount,
      textCount: plan.complexity.textCount,
      imagePaintCount: plan.complexity.imagePaintCount,
      effectCount: plan.complexity.effectCount,
      truncated: plan.complexity.truncated === true
    };
  }

  async function runLongEditableSegmentExport(message, plan) {
    cleanupExportMemory("before-long-editable");

    const previousSelection = figma.currentPage.selection ? figma.currentPage.selection.slice() : [];
    const frames = [];
    let splitMode = "fixed";

    try {
      const prepared = createLongEditableExportFrames(plan);
      splitMode = prepared.mode;
      for (let index = 0; index < prepared.frames.length; index += 1) {
        frames.push(prepared.frames[index]);
      }

      activeEditableSegmentSession = {
        frames: frames,
        previousSelection: previousSelection
      };

      figma.currentPage.selection = frames;
      if (splitMode === "section") {
        figma.notify("긴 PSD를 섹션 기준 " + frames.length + "개 프레임으로 나눠 순차 생성합니다.");
      } else {
        figma.notify("긴 PSD를 " + frames.length + "개 구간으로 나눠 순차 생성합니다.");
      }

      const segmentedMessage = Object.assign({}, message, {
        longEditableSegmentActive: true,
        longEditableSegmentConsent: false
      });

      return originalOnMessage(segmentedMessage);
    } catch (error) {
      cleanupNodes(frames);
      restoreSelection(previousSelection);
      activeEditableSegmentSession = null;
      const messageText = error instanceof Error && error.message ? error.message : "긴 PSD 구간 준비 중 오류가 발생했습니다.";
      figma.ui.postMessage({ type: "export-error", message: messageText });
      figma.notify(messageText, { error: true });
    }
  }

  function createLongEditableExportFrames(plan) {
    const sectionSplit = createLongEditableSectionSplitFrames(plan);
    if (sectionSplit && sectionSplit.frames && sectionSplit.frames.length >= 2) {
      return sectionSplit;
    }

    const frames = [];
    for (let index = 0; index < plan.segments.length; index += 1) {
      frames.push(createLongEditableSegmentFrame(plan, plan.segments[index]));
    }

    return {
      frames: frames,
      mode: "fixed"
    };
  }

  function createLongEditableSectionSplitFrames(plan) {
    const api = getSplitLongFrameApi();
    if (!api || typeof api.createFramesForNode !== "function") {
      return null;
    }

    try {
      const output = api.createFramesForNode(plan.root, {
        direction: "vertical",
        outputOffset: 120,
        outputGap: 48,
        selectCreatedFrames: false,
        scrollIntoView: false
      });

      if (!output || !Array.isArray(output.frames) || output.frames.length < 2) {
        cleanupLongEditableSplitOutput(output);
        return null;
      }

      return {
        frames: output.frames,
        mode: "section"
      };
    } catch (error) {
      try {
        console.warn("[pigma][long-editable-section-split]", error);
      } catch (warnError) {
      }
      return null;
    }
  }

  function getSplitLongFrameApi() {
    const api = globalScope.__PIGMA_SPLIT_LONG_FRAME_API__;
    return api && typeof api === "object" ? api : null;
  }

  function cleanupLongEditableSplitOutput(output) {
    if (!output || !Array.isArray(output.frames)) {
      return;
    }

    cleanupNodes(output.frames);
  }

  function createLongEditableSegmentFrame(plan, segment) {
    const root = plan.root;
    const bounds = plan.bounds;
    const frame = figma.createFrame();
    frame.name = buildNumberedSegmentFrameName(plan.rootName, segment.index);
    frame.clipsContent = true;
    frame.fills = [];
    frame.strokes = [];
    frame.x = Math.round(bounds.x + bounds.width + 120);
    frame.y = Math.round(bounds.y + segment.offsetY);
    frame.resize(Math.max(1, Math.round(bounds.width)), Math.max(1, Math.round(segment.height)));
    figma.currentPage.appendChild(frame);
    const frameRect = {
      x: frame.x,
      y: frame.y,
      width: segment.rect.width,
      height: segment.rect.height
    };

    appendRootVisualBackground(root, frame, bounds, segment);

    if ("children" in root) {
      for (let index = 0; index < root.children.length; index += 1) {
        const child = root.children[index];
        if (nodeIntersectsRectDeep(child, segment.rect)) {
          appendSegmentNodeForFrame(child, frame, segment.rect, frameRect);
        }
      }
    } else if (nodeIntersectsRectDeep(root, segment.rect)) {
      appendSegmentNodeForFrame(root, frame, segment.rect, frameRect);
    }

    return frame;
  }

  function buildNumberedSegmentFrameName(rootName, index) {
    const number = String(index + 1).padStart(3, "0");
    return number + "_" + sanitizeGeneratedFrameBaseName(rootName);
  }

  function sanitizeGeneratedFrameBaseName(name) {
    const cleaned = String(name || "")
      .replace(/[\\/:*?"<>|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned) {
      return "\uC774\uB984 \uC5C6\uC74C";
    }
    return cleaned.length > 120 ? cleaned.slice(0, 120).trim() : cleaned;
  }

  function appendRootVisualBackground(root, frame, bounds, segment) {
    if (!hasVisiblePaints(root, "fills") && !hasVisiblePaints(root, "strokes")) {
      return;
    }

    const background = figma.createRectangle();
    background.name = getNodeName(root) + " background";
    background.resize(Math.max(1, Math.round(bounds.width)), Math.max(1, Math.round(bounds.height)));
    background.x = 0;
    background.y = -Math.round(segment.offsetY);
    copyPaintProperty(root, background, "fills");
    copyPaintProperty(root, background, "strokes");
    copyScalarProperty(root, background, "strokeWeight");
    copyScalarProperty(root, background, "strokeAlign");
    copyScalarProperty(root, background, "opacity");
    frame.appendChild(background);
  }

  function appendSegmentNodeForFrame(source, frame, sourceRect, frameRect) {
    if (shouldInlineSegmentContainer(source, sourceRect)) {
      appendInlineSegmentChildren(source, frame, sourceRect, frameRect);
      return null;
    }

    return appendSegmentClone(source, frame, sourceRect, frameRect);
  }

  function appendInlineSegmentChildren(container, frame, sourceRect, frameRect) {
    if (!container || !("children" in container)) {
      return;
    }

    for (let index = 0; index < container.children.length; index += 1) {
      const child = container.children[index];
      if (!nodeIntersectsRectDeep(child, sourceRect)) {
        continue;
      }

      appendSegmentNodeForFrame(child, frame, sourceRect, frameRect);
    }
  }

  function shouldInlineSegmentContainer(node, rect) {
    if (!isStructuralSegmentContainer(node)) {
      return false;
    }

    const bounds = getNodeBounds(node);
    if (!bounds) {
      return true;
    }

    return !rectContainsRect(rect, bounds);
  }

  function appendSegmentClone(source, frame, sourceRect, frameRect) {
    const clone = source.clone();
    frame.appendChild(clone);
    positionCloneInsideSegmentFrame(source, clone, sourceRect);
    pruneCloneToSegment(clone, frameRect);
    return clone;
  }

  function positionCloneInsideSegmentFrame(source, clone, rect) {
    if ("relativeTransform" in clone && "absoluteTransform" in source) {
      const sourceTransform = source.absoluteTransform;
      clone.relativeTransform = [
        [sourceTransform[0][0], sourceTransform[0][1], sourceTransform[0][2] - rect.x],
        [sourceTransform[1][0], sourceTransform[1][1], sourceTransform[1][2] - rect.y]
      ];
      return;
    }

    const bounds = getNodeBounds(source);
    if (bounds && "x" in clone && "y" in clone) {
      clone.x = Math.round(bounds.x - rect.x);
      clone.y = Math.round(bounds.y - rect.y);
    }
  }

  function pruneCloneToSegment(node, rect) {
    if (!("children" in node)) {
      return;
    }

    for (let index = node.children.length - 1; index >= 0; index -= 1) {
      const child = node.children[index];
      if (!nodeIntersectsRectDeep(child, rect)) {
        removeOrHideSegmentChild(child);
      } else {
        pruneCloneToSegment(child, rect);
        if ("children" in child && child.children.length === 0 && isEmptyStructuralSegmentContainer(child)) {
          removeOrHideSegmentChild(child);
        }
      }
    }
  }

  function removeOrHideSegmentChild(node) {
    try {
      node.remove();
      return;
    } catch (error) {
    }

    try {
      if ("visible" in node) {
        node.visible = false;
        return;
      }
    } catch (error) {
    }

    try {
      if ("opacity" in node) {
        node.opacity = 0;
      }
    } catch (error) {
    }
  }

  function analyzeLongEditableComplexity(root) {
    const result = {
      nodeCount: 0,
      textCount: 0,
      imagePaintCount: 0,
      effectCount: 0,
      truncated: false
    };
    const stack = [root];

    while (stack.length > 0) {
      const node = stack.pop();
      result.nodeCount += 1;

      if (node.type === "TEXT") {
        result.textCount += 1;
      }

      result.imagePaintCount += countImagePaints(node);
      result.effectCount += countVisibleEffects(node);

      if (result.nodeCount >= LONG_EDITABLE_ANALYSIS_LIMIT) {
        result.truncated = true;
        break;
      }

      if ("children" in node) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return result;
  }

  function nodeIntersectsRectDeep(node, rect) {
    const bounds = getNodeBounds(node);
    if (bounds && rectsIntersect(bounds, rect)) {
      return true;
    }

    if (!bounds && "children" in node) {
      for (let index = 0; index < node.children.length; index += 1) {
        if (nodeIntersectsRectDeep(node.children[index], rect)) {
          return true;
        }
      }
    }

    return false;
  }

  function rectsIntersect(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function rectContainsRect(outer, inner) {
    return inner.x >= outer.x - 0.5 &&
      inner.y >= outer.y - 0.5 &&
      inner.x + inner.width <= outer.x + outer.width + 0.5 &&
      inner.y + inner.height <= outer.y + outer.height + 0.5;
  }

  function getNodeBounds(node) {
    if (node && "absoluteBoundingBox" in node && isUsableBounds(node.absoluteBoundingBox)) {
      return normalizeBounds(node.absoluteBoundingBox);
    }

    if (node && "absoluteRenderBounds" in node && isUsableBounds(node.absoluteRenderBounds)) {
      return normalizeBounds(node.absoluteRenderBounds);
    }

    return null;
  }

  function normalizeBounds(bounds) {
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    };
  }

  function isUsableBounds(bounds) {
    return !!bounds && Number.isFinite(bounds.x) && Number.isFinite(bounds.y) && Number.isFinite(bounds.width) && Number.isFinite(bounds.height) && bounds.width > 0 && bounds.height > 0;
  }

  function getNodeName(node) {
    return node && typeof node.name === "string" && node.name.length > 0 ? node.name : "figma-export";
  }

  function countImagePaints(node) {
    return countImagePaintsForProperty(node, "fills") + countImagePaintsForProperty(node, "strokes");
  }

  function countImagePaintsForProperty(node, property) {
    if (!node || !(property in node) || !Array.isArray(node[property])) {
      return 0;
    }

    let count = 0;
    const paints = node[property];
    for (let index = 0; index < paints.length; index += 1) {
      const paint = paints[index];
      if (paint && paint.type === "IMAGE" && paint.visible !== false) {
        count += 1;
      }
    }
    return count;
  }

  function countVisibleEffects(node) {
    if (!node || !("effects" in node) || !Array.isArray(node.effects)) {
      return 0;
    }

    let count = 0;
    for (let index = 0; index < node.effects.length; index += 1) {
      const effect = node.effects[index];
      if (effect && effect.visible !== false) {
        count += 1;
      }
    }
    return count;
  }

  function hasVisiblePaints(node, property) {
    if (!node || !(property in node) || !Array.isArray(node[property])) {
      return false;
    }

    const paints = node[property];
    for (let index = 0; index < paints.length; index += 1) {
      if (paints[index] && paints[index].visible !== false) {
        return true;
      }
    }

    return false;
  }

  function isStructuralSegmentContainer(node) {
    if (!node || !("children" in node) || !Array.isArray(node.children) || !isEmptyStructuralSegmentContainer(node)) {
      return false;
    }

    const type = String(node.type || "");
    return type === "GROUP" || type === "FRAME" || type === "SECTION";
  }

  function isEmptyStructuralSegmentContainer(node) {
    if (!node || node.isMask === true || node.clipsContent === true) {
      return false;
    }

    const type = String(node.type || "");
    if (type === "INSTANCE" || type === "COMPONENT" || type === "COMPONENT_SET" || type === "BOOLEAN_OPERATION") {
      return false;
    }

    if (hasVisibleArrayProperty(node, "fills") || hasVisibleArrayProperty(node, "strokes") || hasVisibleArrayProperty(node, "effects")) {
      return false;
    }

    if (typeof node.opacity === "number" && node.opacity < 0.999) {
      return false;
    }

    const blendMode = String(node.blendMode || "NORMAL");
    return blendMode === "NORMAL" || blendMode === "PASS_THROUGH";
  }

  function hasVisibleArrayProperty(node, property) {
    if (!node || !(property in node) || !Array.isArray(node[property])) {
      return false;
    }

    return node[property].some(item => item && item.visible !== false);
  }

  function copyPaintProperty(source, target, property) {
    if (source && target && property in source && property in target && Array.isArray(source[property])) {
      try {
        target[property] = source[property];
      } catch (error) {
      }
    }
  }

  function copyScalarProperty(source, target, property) {
    if (source && target && property in source && property in target) {
      try {
        target[property] = source[property];
      } catch (error) {
      }
    }
  }

  function cleanupEditableSegmentSession() {
    if (!activeEditableSegmentSession) {
      return;
    }

    const session = activeEditableSegmentSession;
    activeEditableSegmentSession = null;
    const shouldRestoreSelection = shouldRestoreEditableSegmentSelection(session);
    cleanupNodes(session.frames);
    if (shouldRestoreSelection) {
      restoreSelection(session.previousSelection);
    }
  }

  function shouldRestoreEditableSegmentSelection(session) {
    try {
      const currentSelection = figma.currentPage && Array.isArray(figma.currentPage.selection)
        ? figma.currentPage.selection
        : [];
      if (!currentSelection.length) {
        return true;
      }

      const frames = Array.isArray(session.frames) ? session.frames : [];
      const frameIds = new Set(frames.map(node => node && node.id).filter(Boolean));
      if (!frameIds.size) {
        return true;
      }

      return currentSelection.some(node => node && frameIds.has(node.id));
    } catch (error) {
      return true;
    }
  }

  function cleanupExportMemory(reason) {
    cleanupEditableSegmentSession();
    cleanupOrphanPigmaExportNodes(reason);
  }

  function cleanupOrphanPigmaExportNodes(reason) {
    let removedCount = 0;
    try {
      const pages = figma.currentPage ? [figma.currentPage] : [];
      for (let index = 0; index < pages.length; index += 1) {
        removedCount += cleanupPigmaExportTempDescendants(pages[index]);
      }
    } catch (error) {
    }

    if (removedCount > 0) {
      try {
        console.info("[pigma][export-memory-cleanup]", reason || "export", "removed", removedCount);
      } catch (error) {
      }
    }
  }

  function cleanupPigmaExportTempDescendants(parent) {
    try {
      if (!parent || !("children" in parent) || !Array.isArray(parent.children)) {
        return 0;
      }

      let removedCount = 0;
      const children = Array.from(parent.children);
      for (let index = 0; index < children.length; index += 1) {
        const child = children[index];
        if (!child || child.removed) {
          continue;
        }

        if (isPigmaExportTempNode(child)) {
          if (removeNodeSafely(child)) {
            removedCount += 1;
          }
          continue;
        }

        removedCount += cleanupPigmaExportTempDescendants(child);
      }

      return removedCount;
    } catch (error) {
      return 0;
    }
  }

  function isPigmaExportTempNode(node) {
    try {
      const name = node && typeof node.name === "string" ? node.name : "";
      return PIGMA_EXPORT_TEMP_NODE_NAME_SET.has(name);
    } catch (error) {
      return false;
    }
  }

  function removeNodeSafely(node) {
    try {
      if (node && !node.removed) {
        node.remove();
        return true;
      }
    } catch (error) {
    }
    return false;
  }

  function cleanupNodes(nodes) {
    if (!nodes) {
      return;
    }

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      removeNodeSafely(node);
    }
  }

  function restoreSelection(selection) {
    if (!selection) {
      return;
    }

    const aliveSelection = [];
    for (let index = 0; index < selection.length; index += 1) {
      const node = selection[index];
      if (node && !node.removed) {
        aliveSelection.push(node);
      }
    }

    try {
      figma.currentPage.selection = aliveSelection;
    } catch (error) {
    }
  }
})();
