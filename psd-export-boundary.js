;(()=>{
  // PIGMA_EXPORT_BOUNDARY::SOURCE_OF_TRUTH
  // Keep export-only message guards in this file so PSD export changes can
  // evolve without touching PSD import post-processing.
  // PIGMA_EXPORT_BOUNDARY::MESSAGE_TYPES
  // PIGMA_EXPORT_BOUNDARY::NORMALIZE_SETTINGS
  // PIGMA_EXPORT_BOUNDARY::LONG_EDITABLE_SEGMENTS
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
  const LONG_EDITABLE_SEGMENT_HEIGHT = 10000;
  const LONG_EDITABLE_SEGMENT_AREA = 10000000;
  const LONG_EDITABLE_SEGMENT_MIN_HEIGHT = 1200;
  const LONG_EDITABLE_COMPLEX_NODE_COUNT = 80;
  const LONG_EDITABLE_COMPLEX_TEXT_COUNT = 25;
  const LONG_EDITABLE_COMPLEX_IMAGE_COUNT = 4;
  const LONG_EDITABLE_COMPLEX_EFFECT_COUNT = 8;
  const LONG_EDITABLE_ANALYSIS_LIMIT = 2500;
  let activeEditableSegmentSession = null;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  try {
    figma.ui.postMessage = message => {
      const result = originalPostMessage(message);
      if (message && (message.type === "export-finished" || message.type === "export-error")) {
        cleanupEditableSegmentSession();
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
      segments: buildLongEditableSegments(bounds, segmentCount)
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
    const count = Math.max(2, byHeight, byArea);
    const maxByMinHeight = Math.max(1, Math.floor(height / LONG_EDITABLE_SEGMENT_MIN_HEIGHT));
    return Math.max(2, Math.min(count, maxByMinHeight || count));
  }

  function buildLongEditableSegments(bounds, count) {
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
    return segments;
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
    cleanupEditableSegmentSession();

    const previousSelection = figma.currentPage.selection ? figma.currentPage.selection.slice() : [];
    const frames = [];

    try {
      for (let index = 0; index < plan.segments.length; index += 1) {
        frames.push(createLongEditableSegmentFrame(plan, plan.segments[index]));
      }

      activeEditableSegmentSession = {
        frames: frames,
        previousSelection: previousSelection
      };

      figma.currentPage.selection = frames;
      figma.notify("긴 PSD를 " + frames.length + "개 구간으로 나눠 순차 생성합니다.");

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

  function createLongEditableSegmentFrame(plan, segment) {
    const root = plan.root;
    const bounds = plan.bounds;
    const frame = figma.createFrame();
    frame.name = plan.rootName + " part " + String(segment.index + 1).padStart(2, "0");
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
          appendSegmentClone(child, frame, segment.rect, frameRect);
        }
      }
    } else if (nodeIntersectsRectDeep(root, segment.rect)) {
      appendSegmentClone(root, frame, segment.rect, frameRect);
    }

    return frame;
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
    cleanupNodes(session.frames);
    restoreSelection(session.previousSelection);
  }

  function cleanupNodes(nodes) {
    if (!nodes) {
      return;
    }

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      if (node && !node.removed) {
        try {
          node.remove();
        } catch (error) {
        }
      }
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
