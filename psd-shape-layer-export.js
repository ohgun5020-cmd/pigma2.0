;(() => {
  // PIGMA_PSD_SHAPE_LAYER_EXPORT::SOURCE_OF_TRUTH
  // Keeps Photoshop shape-layer export gating outside ui.html. The PSD writer
  // can emit vectorFill/vectorMask layers, but transformed Figma shapes need
  // to stay as bitmap previews when Photoshop cannot represent the transform.
  // PIGMA_PSD_SHAPE_LAYER_EXPORT::MESSAGE_NORMALIZER
  // PIGMA_PSD_SHAPE_LAYER_EXPORT::PHOTOSHOP_SHAPE_GATE
  // PIGMA_PSD_SHAPE_LAYER_EXPORT::PHOTOSHOP_FIGMA_SHAPE_MAP
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  const PATCH_FLAG = "__PIGMA_PSD_SHAPE_LAYER_EXPORT_PATCH__";
  const PHOTOSHOP_SHAPE_KIND_TO_FIGMA_TYPES = Object.freeze({
    rectangle: Object.freeze(["RECTANGLE"]),
    roundedRectangle: Object.freeze(["RECTANGLE"]),
    ellipse: Object.freeze(["ELLIPSE"]),
    polygon: Object.freeze(["POLYGON"]),
    star: Object.freeze(["STAR"]),
    customPath: Object.freeze(["VECTOR", "BOOLEAN_OPERATION"])
  });
  const FIGMA_TO_PHOTOSHOP_SHAPE_KIND = buildFigmaToPhotoshopShapeKindMap(
    PHOTOSHOP_SHAPE_KIND_TO_FIGMA_TYPES
  );
  const VECTOR_SHAPE_TYPE_SET = new Set(Object.keys(FIGMA_TO_PHOTOSHOP_SHAPE_KIND));
  const MAX_SHAPE_SCAN_COUNT = 600;
  const TRANSFORM_AXIS_EPSILON = 0.001;

  if (globalScope[PATCH_FLAG]) {
    return;
  }
  globalScope[PATCH_FLAG] = true;

  const originalOnMessage = figma.ui.onmessage;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async message => {
    if (message && message.type === "request-export") {
      return originalOnMessage(normalizeShapeLayerExportMessage(message));
    }

    return originalOnMessage(message);
  };

  function normalizeShapeLayerExportMessage(message) {
    if (!message || typeof message !== "object") {
      return message;
    }

    const scan = scanCurrentSelectionForShapeCandidates();

    if (shouldForceBitmapVectorPreview(scan)) {
      return withBitmapVectorPreview(message, true);
    }

    if (!shouldAllowPhotoshopShapeLayers(message, scan)) {
      return message;
    }

    return withBitmapVectorPreview(message, false);
  }

  function shouldForceBitmapVectorPreview(scan) {
    return !!scan && (scan.foundUnsupported || scan.exhausted);
  }

  function withBitmapVectorPreview(message, forceBitmapVectorPreview) {
    return Object.assign({}, message, {
      developerExportExperiments: Object.assign({}, message.developerExportExperiments, {
        forceBitmapVectorPreview
      })
    });
  }

  function shouldAllowPhotoshopShapeLayers(message, scan = null) {
    if (!message || !message.developerExportExperiments) {
      return false;
    }

    if (message.developerExportExperiments.forceBitmapVectorPreview !== true) {
      return false;
    }

    const result = scan || scanCurrentSelectionForShapeCandidates();
    return result.foundSupported && !result.foundUnsupported && !result.exhausted;
  }

  function scanCurrentSelectionForShapeCandidates() {
    const selection = figma.currentPage && Array.isArray(figma.currentPage.selection)
      ? figma.currentPage.selection
      : [];
    const scan = createShapeCandidateScanState();

    for (const node of selection) {
      visitShapeCandidate(node, scan);
      if (scan.foundUnsupported || scan.exhausted) {
        break;
      }
    }

    return scan;
  }

  function containsPhotoshopShapeCandidate(root) {
    const state = createShapeCandidateScanState();
    visitShapeCandidate(root, state);
    return state.foundSupported && !state.foundUnsupported && !state.exhausted;
  }

  function createShapeCandidateScanState() {
    return {
      count: 0,
      exhausted: false,
      foundSupported: false,
      foundUnsupported: false
    };
  }

  function visitShapeCandidate(node, state) {
    if (!node || state.foundUnsupported || state.exhausted) {
      return;
    }

    if (state.count >= MAX_SHAPE_SCAN_COUNT) {
      state.exhausted = true;
      return;
    }

    state.count += 1;

    if (isSimplePhotoshopShapeCandidate(node)) {
      if (isPhotoshopShapeTransformSafe(node)) {
        state.foundSupported = true;
      } else {
        state.foundUnsupported = true;
      }
      return;
    }

    if (!("children" in node) || !node.children) {
      return;
    }

    for (const child of node.children) {
      visitShapeCandidate(child, state);
      if (state.foundUnsupported || state.exhausted) {
        return;
      }
    }
  }

  function isSimplePhotoshopShapeCandidate(node) {
    if (!getPhotoshopShapeKindForFigmaType(node && node.type)) {
      return false;
    }

    if (node.visible === false || node.isMask === true) {
      return false;
    }

    if (!("exportAsync" in node) || typeof node.exportAsync !== "function") {
      return false;
    }

    if (hasVisiblePaints(node.strokes)) {
      return false;
    }

    if (hasVisibleEffects(node.effects)) {
      return false;
    }

    return hasExactlyOneVisibleSolidFill(node.fills);
  }

  function isPhotoshopShapeTransformSafe(node) {
    const transform = Array.isArray(node && node.absoluteTransform)
      ? node.absoluteTransform
      : Array.isArray(node && node.relativeTransform)
        ? node.relativeTransform
        : null;

    return isAxisAlignedTransform(transform);
  }

  function isAxisAlignedTransform(transform) {
    if (
      !Array.isArray(transform) ||
      transform.length < 2 ||
      !Array.isArray(transform[0]) ||
      !Array.isArray(transform[1])
    ) {
      return false;
    }

    const xx = Number(transform[0][0]);
    const xy = Number(transform[0][1]);
    const yx = Number(transform[1][0]);
    const yy = Number(transform[1][1]);

    if (![xx, xy, yx, yy].every(Number.isFinite)) {
      return false;
    }

    return (
      Math.abs(xx) > TRANSFORM_AXIS_EPSILON &&
      Math.abs(yy) > TRANSFORM_AXIS_EPSILON &&
      Math.abs(xy) <= TRANSFORM_AXIS_EPSILON &&
      Math.abs(yx) <= TRANSFORM_AXIS_EPSILON
    );
  }

  function hasExactlyOneVisibleSolidFill(fills) {
    if (!Array.isArray(fills)) {
      return false;
    }

    const visibleFills = fills.filter(isVisiblePaint);
    return visibleFills.length === 1 && visibleFills[0].type === "SOLID";
  }

  function hasVisiblePaints(paints) {
    return Array.isArray(paints) && paints.some(isVisiblePaint);
  }

  function isVisiblePaint(paint) {
    return !!paint && paint.visible !== false;
  }

  function hasVisibleEffects(effects) {
    return Array.isArray(effects) && effects.some(effect => effect && effect.visible !== false);
  }

  function buildFigmaToPhotoshopShapeKindMap(mapping) {
    const result = {};

    for (const photoshopKind of Object.keys(mapping)) {
      const figmaTypes = mapping[photoshopKind];

      for (const figmaType of figmaTypes) {
        if (!result[figmaType]) {
          result[figmaType] = photoshopKind;
        }
      }
    }

    return Object.freeze(result);
  }

  function getPhotoshopShapeKindForFigmaType(type) {
    return type ? FIGMA_TO_PHOTOSHOP_SHAPE_KIND[String(type)] || null : null;
  }
})();
