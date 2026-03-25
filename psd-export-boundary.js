;(()=>{
  // PIGMA_EXPORT_BOUNDARY::SOURCE_OF_TRUTH
  // Keep export-only message guards in this file so PSD export changes can
  // evolve without touching PSD import post-processing.
  // PIGMA_EXPORT_BOUNDARY::MESSAGE_TYPES
  // PIGMA_EXPORT_BOUNDARY::NORMALIZE_SETTINGS
  const originalOnMessage = figma.ui.onmessage;
  const DEFAULT_EXPORT_SETTINGS = Object.freeze({
    psdVersion: "max-compatibility",
    textExportMode: "editable-text",
    imageExportMode: "bitmap-only",
    hiddenLayerMode: "ignore-hidden",
    exportPackageMode: "psd-only",
    fileNamePattern: "{frame-name}.psd"
  });

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async message => {
    if (!isExportMessage(message)) {
      return originalOnMessage(message);
    }

    return originalOnMessage(normalizeExportMessage(message));
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
    return value === "bundle-with-rasters" ? value : DEFAULT_EXPORT_SETTINGS.exportPackageMode;
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
})();
