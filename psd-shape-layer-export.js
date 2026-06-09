;(() => {
  // PIGMA_PSD_SHAPE_LAYER_EXPORT::SOURCE_OF_TRUTH
  // Keeps Photoshop shape-layer export gating outside ui.html. The PSD writer
  // already knows how to emit vectorFill/vectorMask layers; this patch only
  // prevents simple Figma shapes from being forced down the bitmap fallback.
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
    if (!shouldAllowPhotoshopShapeLayers(message)) {
      return message;
    }

    return Object.assign({}, message, {
      developerExportExperiments: Object.assign({}, message.developerExportExperiments, {
        forceBitmapVectorPreview: false
      })
    });
  }

  function shouldAllowPhotoshopShapeLayers(message) {
    if (!message || !message.developerExportExperiments) {
      return false;
    }

    if (message.developerExportExperiments.forceBitmapVectorPreview !== true) {
      return false;
    }

    const selection = figma.currentPage && Array.isArray(figma.currentPage.selection)
      ? figma.currentPage.selection
      : [];

    for (const node of selection) {
      if (containsPhotoshopShapeCandidate(node)) {
        return true;
      }
    }

    return false;
  }

  function containsPhotoshopShapeCandidate(root) {
    const state = { count: 0, found: false };
    visitShapeCandidate(root, state);
    return state.found;
  }

  function visitShapeCandidate(node, state) {
    if (!node || state.found || state.count >= MAX_SHAPE_SCAN_COUNT) {
      return;
    }

    state.count += 1;

    if (isSimplePhotoshopShapeCandidate(node)) {
      state.found = true;
      return;
    }

    if (!("children" in node) || !node.children) {
      return;
    }

    for (const child of node.children) {
      visitShapeCandidate(child, state);
      if (state.found || state.count >= MAX_SHAPE_SCAN_COUNT) {
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
