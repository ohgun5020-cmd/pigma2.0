;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_IMAGE_UPSCALE_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  let isPreparing = false;
  let isApplying = false;
  let pendingSession = null;
  let isImageExtendPreparing = false;
  let isImageExtendApplying = false;
  let pendingImageExtendSession = null;
  let isCompositePreparing = false;
  let isCompositeApplying = false;
  let pendingCompositeSession = null;
  let isBoundsFitPreparing = false;
  let isBoundsFitApplying = false;
  let pendingBoundsFitSession = null;
  let isReferencePreparing = false;
  let isTextOverlayPreparing = false;
  let isTextOverlayApplying = false;
  let pendingTextOverlaySession = null;
  let availableFontsPromise = null;
  const IMAGE_TASK_ALREADY_RUNNING_MESSAGE = "Another image task is already running.";
  const IMAGE_TASK_APPLY_IN_PROGRESS_MESSAGE = "Another image task is already applying a result.";
  const UPSCALE_SOURCE_PREPARE_ERROR_MESSAGE = "Failed to prepare the source image for the AI image task.";
  const UPSCALE_SESSION_EXPIRED_MESSAGE = "The AI image session expired. Please run it again.";
  const UPSCALE_RESULT_BYTES_MISSING_MESSAGE = "No generated image bytes were provided.";
  const UPSCALE_IMAGE_CREATE_ERROR_MESSAGE = "Failed to create an image hash from the generated result.";
  const UPSCALE_APPLY_ERROR_MESSAGE = "Failed to apply the generated AI image result.";
  const BOUNDS_FIT_SOURCE_PREPARE_ERROR_MESSAGE = "Failed to prepare the bounds-fit image source.";
  const REFERENCE_SEARCH_SOURCE_PREPARE_ERROR_MESSAGE = "Failed to prepare the reference search source.";
  const REFERENCE_SEARCH_QUERY_REQUIRED_MESSAGE = "Enter a search query before opening reference pages.";
  const REFERENCE_SEARCH_OPENED_MESSAGE_PREFIX = "Opened reference search: ";
  const REFERENCE_SEARCH_OPEN_ERROR_MESSAGE = "Failed to open the reference search pages.";
  const BOUNDS_FIT_APPLY_IN_PROGRESS_MESSAGE = "Bounds fit is already applying a result.";
  const BOUNDS_FIT_SESSION_EXPIRED_MESSAGE = "The bounds-fit session expired. Please run it again.";
  const BOUNDS_FIT_APPLY_ERROR_MESSAGE = "Failed to apply the bounds-fit result.";
  const UI_REPORTED_IMAGE_ERROR_FALLBACK = "The image task failed before a usable result was returned.";
  const IMAGE_TASK_NO_SELECTION_MESSAGE = "Select at least one node before running this image task.";
  const IMAGE_FILL_NOT_FOUND_MESSAGE = "Could not find the selected IMAGE fill.";
  const IMAGE_FILL_BYTES_MISSING_MESSAGE = "Could not read bytes from the selected IMAGE fill.";
  const IMAGE_FILL_SELECTION_REQUIRED_MESSAGE = "Could not find an IMAGE fill in the current selection.";
  const SHAPE_EDIT_SINGLE_SELECTION_MESSAGE = "Select exactly one editable shape layer to use this mode.";
  const SHAPE_OR_IMAGE_SELECTION_MESSAGE = "Select one editable shape layer or a layer that uses an IMAGE fill.";
  const SHAPE_EXPORT_SOURCE_ERROR_MESSAGE = "Failed to export the selected shape as an image source.";
  const SHAPE_EXPORT_EMPTY_MESSAGE = "The exported shape image was empty.";
  const IMAGE_NODE_UNAVAILABLE_REASON = "The original node is no longer available.";
  const IMAGE_FILL_LIST_EMPTY_REASON = "The node does not have any fills.";
  const IMAGE_FILL_HASH_MISMATCH_REASON = "Could not find a matching IMAGE fill with the original hash.";
  const IMAGE_FILL_UPDATE_ERROR_MESSAGE = "Failed to update the IMAGE fill.";
  const SHAPE_TARGET_UNAVAILABLE_REASON = "Could not find an editable shape layer to apply the generated image.";
  const SHAPE_FILL_APPLY_ERROR_MESSAGE = "Failed to apply the generated image to the shape fill.";
  const REFERENCE_SOURCE_NOT_FOUND_MESSAGE = "Could not find usable text or image content in the selection.";

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isAiImageUpscaleMessage(message)) {
      if (message.type === "request-ai-image-upscale-source") {
        await prepareUpscaleSource(message);
        return;
      }

      if (message.type === "apply-ai-image-upscaled-image") {
        await applyUpscaledImage(message);
        return;
      }

      if (message.type === "ai-image-upscale-report-error") {
        pendingSession = null;
        notifyUiReportedError(message);
        return;
      }

      if (message.type === "request-image-extend-source") {
        await prepareImageExtendSource(message);
        return;
      }

      if (message.type === "apply-image-extend-underlay") {
        await applyImageExtendUnderlay(message);
        return;
      }

      if (message.type === "image-extend-report-error") {
        pendingImageExtendSession = null;
        notifyUiReportedError(message);
        return;
      }

      if (message.type === "request-image-composite-source") {
        await prepareImageCompositeSource(message);
        return;
      }

      if (message.type === "apply-image-composite-image") {
        await applyImageCompositeImage(message);
        return;
      }

      if (message.type === "image-composite-report-error") {
        pendingCompositeSession = null;
        notifyUiReportedError(message);
        return;
      }

      if (message.type === "request-image-bounds-fit-source") {
        await prepareImageBoundsFitSource(message);
        return;
      }

      if (message.type === "apply-image-bounds-fit-image") {
        await applyImageBoundsFit(message);
        return;
      }

      if (message.type === "image-bounds-fit-report-error") {
        pendingBoundsFitSession = null;
        notifyUiReportedError(message);
        return;
      }

      if (message.type === "request-image-reference-search-source") {
        await prepareReferenceSearchSource(message);
        return;
      }

      if (message.type === "request-image-text-overlay-source") {
        await prepareImageTextOverlaySource(message);
        return;
      }

      if (message.type === "apply-image-text-overlay") {
        await applyImageTextOverlay(message);
        return;
      }

      if (message.type === "open-image-reference-search") {
        await openImageReferenceSearch(message);
        return;
      }

      if (message.type === "image-text-overlay-report-error") {
        notifyUiReportedError(message);
        return;
      }

      if (message.type === "image-reference-report-error") {
        notifyUiReportedError(message);
        return;
      }
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_IMAGE_UPSCALE_PATCH__ = true;

  function isAiImageUpscaleMessage(message) {
    return (
      !!message &&
      (message.type === "request-ai-image-upscale-source" ||
        message.type === "apply-ai-image-upscaled-image" ||
        message.type === "ai-image-upscale-report-error" ||
        message.type === "request-image-extend-source" ||
        message.type === "apply-image-extend-underlay" ||
        message.type === "image-extend-report-error" ||
        message.type === "request-image-composite-source" ||
        message.type === "apply-image-composite-image" ||
        message.type === "image-composite-report-error" ||
        message.type === "request-image-bounds-fit-source" ||
        message.type === "apply-image-bounds-fit-image" ||
        message.type === "image-bounds-fit-report-error" ||
        message.type === "request-image-reference-search-source" ||
        message.type === "request-image-text-overlay-source" ||
        message.type === "apply-image-text-overlay" ||
        message.type === "image-text-overlay-report-error" ||
        message.type === "open-image-reference-search" ||
        message.type === "image-reference-report-error")
    );
  }

  async function prepareUpscaleSource(message) {
    if (
      isPreparing ||
      isApplying ||
      isImageExtendPreparing ||
      isImageExtendApplying ||
      isCompositePreparing ||
      isCompositeApplying ||
      isBoundsFitPreparing ||
      isBoundsFitApplying ||
      isTextOverlayPreparing ||
      isTextOverlayApplying
    ) {
      postPrepareError(IMAGE_TASK_ALREADY_RUNNING_MESSAGE, sanitizeClientRequestId(message && message.clientRequestId));
      return;
    }

    isPreparing = true;
    pendingSession = null;

    try {
      const target = collectAiImageSourceTargetFromSelection(sanitizeSourceMode(message && message.sourceMode));
      const source = await buildAiImageSource(target);
      const sessionId = buildSessionId();

      pendingSession = {
        id: sessionId,
        clientRequestId: sanitizeClientRequestId(message && message.clientRequestId),
        targetKind: target.kind,
        targetNodeId: target.entry.nodeId,
        originalHash: target.kind === "image-fill" ? target.entry.imageHash : "",
        usages: target.kind === "image-fill" ? target.usages : [],
        selectionLabel: formatSelectionLabel(target.selection),
        targetNodeName: target.entry.nodeName,
        operationLabel: sanitizeOperationLabel(message && message.operationLabel),
        preparedAt: new Date().toISOString(),
      };

      figma.ui.postMessage({
        type: "ai-image-upscale-source-ready",
        sessionId: sessionId,
        clientRequestId: pendingSession.clientRequestId,
        image: source.image,
        summary: source.summary,
      });
    } catch (error) {
      pendingSession = null;
      postPrepareError(
        normalizeErrorMessage(error, UPSCALE_SOURCE_PREPARE_ERROR_MESSAGE),
        sanitizeClientRequestId(message && message.clientRequestId)
      );
    } finally {
      isPreparing = false;
    }
  }

  async function applyUpscaledImage(message) {
    if (
      isApplying ||
      isImageExtendPreparing ||
      isImageExtendApplying ||
      isCompositePreparing ||
      isCompositeApplying ||
      isBoundsFitPreparing ||
      isBoundsFitApplying ||
      isTextOverlayPreparing ||
      isTextOverlayApplying
    ) {
      postApplyError(IMAGE_TASK_APPLY_IN_PROGRESS_MESSAGE, sanitizeClientRequestId(message && message.clientRequestId));
      return;
    }

    isApplying = true;

    try {
      if (!pendingSession || !message || message.sessionId !== pendingSession.id) {
        throw new Error(UPSCALE_SESSION_EXPIRED_MESSAGE);
      }

      const bytes = normalizeBytes(message.bytes);
      if (!bytes.length) {
        throw new Error(UPSCALE_RESULT_BYTES_MISSING_MESSAGE);
      }

      const createdImage = figma.createImage(bytes);
      if (!createdImage || typeof createdImage.hash !== "string" || !createdImage.hash) {
        throw new Error(UPSCALE_IMAGE_CREATE_ERROR_MESSAGE);
      }

      const result =
        pendingSession.targetKind === "shape-export"
          ? await applyGeneratedImageToShapeNode(pendingSession, createdImage.hash, bytes.length)
          : await replaceSelectionImageFills(pendingSession, createdImage.hash, bytes.length);
      figma.ui.postMessage({
        type: "ai-image-upscale-apply-result",
        clientRequestId: pendingSession.clientRequestId,
        result: result,
      });
      notifyApplyResult(result, sanitizeOperationLabel(message && message.operationLabel) || pendingSession.operationLabel);
      pendingSession = null;
    } catch (error) {
      const messageText = normalizeErrorMessage(error, UPSCALE_APPLY_ERROR_MESSAGE);
      figma.ui.postMessage({
        type: "ai-image-upscale-apply-error",
        clientRequestId: pendingSession && pendingSession.clientRequestId ? pendingSession.clientRequestId : sanitizeClientRequestId(message && message.clientRequestId),
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2600 });
    } finally {
      isApplying = false;
    }
  }

  async function prepareImageExtendSource(message) {
    if (
      isPreparing ||
      isApplying ||
      isImageExtendPreparing ||
      isImageExtendApplying ||
      isCompositePreparing ||
      isCompositeApplying ||
      isBoundsFitPreparing ||
      isBoundsFitApplying ||
      isReferencePreparing ||
      isTextOverlayPreparing ||
      isTextOverlayApplying
    ) {
      postImageExtendSourceError(
        "Another image task is already running.",
        sanitizeClientRequestId(message && message.clientRequestId)
      );
      return;
    }

    isImageExtendPreparing = true;
    pendingImageExtendSession = null;

    try {
      const target = await collectImageExtendTargetFromSelection();
      const expand = sanitizeImageExtendPadding(message && message.expand);
      const sessionId = buildImageExtendSessionId();

      pendingImageExtendSession = {
        id: sessionId,
        clientRequestId: sanitizeClientRequestId(message && message.clientRequestId),
        operationLabel: sanitizeOperationLabel(message && message.operationLabel),
        selectionLabel: formatSelectionLabel(target.selection),
        targetNodeId: target.entry.nodeId,
        targetNodeName: target.entry.nodeName,
        originalHash: target.entry.imageHash,
        expand: expand,
        preparedAt: new Date().toISOString(),
      };

      figma.ui.postMessage({
        type: "image-extend-source-ready",
        sessionId: sessionId,
        clientRequestId: pendingImageExtendSession.clientRequestId,
        image: target.image,
        summary: {
          selectionLabel: pendingImageExtendSession.selectionLabel,
          targetNodeName: target.entry.nodeName,
          captureMode: "rendered-node",
          currentWidth: target.currentWidth,
          currentHeight: target.currentHeight,
          targetWidth: target.currentWidth + expand.left + expand.right,
          targetHeight: target.currentHeight + expand.top + expand.bottom,
          expandTop: expand.top,
          expandRight: expand.right,
          expandBottom: expand.bottom,
          expandLeft: expand.left,
          byteLength: target.image.bytes.length,
        },
      });
    } catch (error) {
      pendingImageExtendSession = null;
      postImageExtendSourceError(
        normalizeErrorMessage(error, "Failed to prepare the source image for image extend."),
        sanitizeClientRequestId(message && message.clientRequestId)
      );
    } finally {
      isImageExtendPreparing = false;
    }
  }

  async function applyImageExtendUnderlay(message) {
    if (
      isPreparing ||
      isApplying ||
      isImageExtendPreparing ||
      isImageExtendApplying ||
      isCompositePreparing ||
      isCompositeApplying ||
      isBoundsFitPreparing ||
      isBoundsFitApplying ||
      isTextOverlayPreparing ||
      isTextOverlayApplying
    ) {
      postImageExtendApplyError(
        "Image extend is already running.",
        pendingImageExtendSession && pendingImageExtendSession.clientRequestId
          ? pendingImageExtendSession.clientRequestId
          : sanitizeClientRequestId(message && message.clientRequestId)
      );
      return;
    }

    isImageExtendApplying = true;

    try {
      if (!pendingImageExtendSession || !message || message.sessionId !== pendingImageExtendSession.id) {
        throw new Error("The image extend session expired. Please run it again.");
      }

      const bytes = normalizeBytes(message.bytes);
      if (!bytes.length) {
        throw new Error("The generated image extend result is empty.");
      }

      const createdImage = figma.createImage(bytes);
      if (!createdImage || typeof createdImage.hash !== "string" || !createdImage.hash) {
        throw new Error("Could not create an image hash for the generated background.");
      }

      const result = await applyImageExtendUnderlayToSelection(pendingImageExtendSession, createdImage.hash, bytes.length);
      figma.ui.postMessage({
        type: "image-extend-apply-result",
        clientRequestId: pendingImageExtendSession.clientRequestId,
        result: result,
      });
      notifyImageExtendResult(result, pendingImageExtendSession.operationLabel);
      pendingImageExtendSession = null;
    } catch (error) {
      const messageText = normalizeErrorMessage(error, "Failed to apply the generated image extend result.");
      figma.ui.postMessage({
        type: "image-extend-apply-error",
        clientRequestId:
          pendingImageExtendSession && pendingImageExtendSession.clientRequestId
            ? pendingImageExtendSession.clientRequestId
            : sanitizeClientRequestId(message && message.clientRequestId),
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2600 });
    } finally {
      isImageExtendApplying = false;
    }
  }

  async function prepareImageCompositeSource(message) {
    if (
      isPreparing ||
      isApplying ||
      isImageExtendPreparing ||
      isImageExtendApplying ||
      isCompositePreparing ||
      isCompositeApplying ||
      isBoundsFitPreparing ||
      isBoundsFitApplying ||
      isReferencePreparing ||
      isTextOverlayPreparing ||
      isTextOverlayApplying
    ) {
      postImageCompositeSourceError(
        "Another image task is already running.",
        sanitizeClientRequestId(message && message.clientRequestId)
      );
      return;
    }

    isCompositePreparing = true;
    pendingCompositeSession = null;

    try {
      const collection = await collectImageCompositeTargetsFromSelection();
      if (collection.layers.length < 2) {
        throw new Error(buildImageCompositeEmptySelectionMessage(collection.layers, collection.skipped));
      }

      const sessionId = buildImageCompositeSessionId();
      pendingCompositeSession = {
        id: sessionId,
        clientRequestId: sanitizeClientRequestId(message && message.clientRequestId),
        operationLabel: sanitizeOperationLabel(message && message.operationLabel),
        selectionLabel: formatSelectionLabel(collection.selection),
        unionRect: collection.unionRect,
        layerCount: collection.layers.length,
        preparedAt: new Date().toISOString(),
      };

      figma.ui.postMessage({
        type: "image-composite-source-ready",
        sessionId: sessionId,
        clientRequestId: pendingCompositeSession.clientRequestId,
        layers: collection.layers.map(function (layer) {
          return {
            nodeId: layer.nodeId,
            nodeName: layer.nodeName,
            role: layer.role,
            orderIndex: layer.orderIndex,
            fileName: layer.fileName,
            mimeType: layer.mimeType,
            bytes: layer.bytes,
            offsetX: layer.offsetX,
            offsetY: layer.offsetY,
            width: layer.visibleRect.width,
            height: layer.visibleRect.height,
          };
        }),
        summary: {
          selectionLabel: pendingCompositeSession.selectionLabel,
          layerCount: collection.layers.length,
          skippedCount: collection.skipped.length,
          backgroundNodeName: collection.layers[0].nodeName,
          foregroundCount: Math.max(0, collection.layers.length - 1),
          canvasWidth: collection.unionRect.width,
          canvasHeight: collection.unionRect.height,
        },
      });
    } catch (error) {
      pendingCompositeSession = null;
      postImageCompositeSourceError(
        normalizeErrorMessage(error, "Failed to prepare the composite image source."),
        sanitizeClientRequestId(message && message.clientRequestId)
      );
    } finally {
      isCompositePreparing = false;
    }
  }

  async function applyImageCompositeImage(message) {
    if (
      isPreparing ||
      isApplying ||
      isImageExtendPreparing ||
      isImageExtendApplying ||
      isCompositePreparing ||
      isCompositeApplying ||
      isBoundsFitPreparing ||
      isBoundsFitApplying ||
      isTextOverlayPreparing ||
      isTextOverlayApplying
    ) {
      postImageCompositeApplyError(
        "Image composite is already running.",
        pendingCompositeSession && pendingCompositeSession.clientRequestId
          ? pendingCompositeSession.clientRequestId
          : sanitizeClientRequestId(message && message.clientRequestId)
      );
      return;
    }

    isCompositeApplying = true;

    try {
      if (!pendingCompositeSession || !message || message.sessionId !== pendingCompositeSession.id) {
        throw new Error("The image composite session expired. Please run it again.");
      }

      const bytes = normalizeBytes(message.bytes);
      if (!bytes.length) {
        throw new Error("The generated composite image is empty.");
      }

      const createdImage = figma.createImage(bytes);
      if (!createdImage || typeof createdImage.hash !== "string" || !createdImage.hash) {
        throw new Error("Could not create an image hash for the composite result.");
      }

      const result = await applyImageCompositeToSelection(pendingCompositeSession, createdImage.hash, bytes.length);
      figma.ui.postMessage({
        type: "image-composite-apply-result",
        clientRequestId: pendingCompositeSession.clientRequestId,
        result: result,
      });
      notifyImageCompositeResult(result, pendingCompositeSession.operationLabel);
      pendingCompositeSession = null;
    } catch (error) {
      const messageText = normalizeErrorMessage(error, "Failed to apply the generated composite image.");
      figma.ui.postMessage({
        type: "image-composite-apply-error",
        clientRequestId:
          pendingCompositeSession && pendingCompositeSession.clientRequestId
            ? pendingCompositeSession.clientRequestId
            : sanitizeClientRequestId(message && message.clientRequestId),
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2600 });
    } finally {
      isCompositeApplying = false;
    }
  }

  async function prepareImageBoundsFitSource(message) {
    if (
      isPreparing ||
      isApplying ||
      isImageExtendPreparing ||
      isImageExtendApplying ||
      isCompositePreparing ||
      isCompositeApplying ||
      isBoundsFitPreparing ||
      isBoundsFitApplying ||
      isTextOverlayPreparing ||
      isTextOverlayApplying
    ) {
      postBoundsFitSourceError(
        IMAGE_TASK_ALREADY_RUNNING_MESSAGE,
        sanitizeClientRequestId(message && message.clientRequestId)
      );
      return;
    }

    isBoundsFitPreparing = true;
    pendingBoundsFitSession = null;

    try {
      const collection = await collectBoundsFitTargetsFromSelection();
      if (!collection.targets.length) {
        throw new Error(buildBoundsFitEmptySelectionMessage(collection.skipped));
      }

      const sessionId = buildBoundsFitSessionId();
      pendingBoundsFitSession = {
        id: sessionId,
        clientRequestId: sanitizeClientRequestId(message && message.clientRequestId),
        operationLabel: sanitizeOperationLabel(message && message.operationLabel),
        selectionLabel: formatSelectionLabel(collection.selection),
        targets: collection.targets,
        skipped: collection.skipped,
        requestedCount: collection.selection.length,
        preparedAt: new Date().toISOString(),
      };

      figma.ui.postMessage({
        type: "image-bounds-fit-source-ready",
        sessionId: sessionId,
        clientRequestId: pendingBoundsFitSession.clientRequestId,
        items: collection.targets.map(function (target) {
          return {
            nodeId: target.nodeId,
            nodeName: target.nodeName,
            imageHash: target.originalHash,
            fileName: target.fileName,
            mimeType: target.mimeType,
            bytes: target.bytes,
            sourceWidth: target.sourceWidth,
            sourceHeight: target.sourceHeight,
          };
        }),
        summary: {
          selectionLabel: pendingBoundsFitSession.selectionLabel,
          eligibleCount: collection.targets.length,
          skippedCount: collection.skipped.length,
        },
      });
    } catch (error) {
      pendingBoundsFitSession = null;
      postBoundsFitSourceError(
        normalizeErrorMessage(error, BOUNDS_FIT_SOURCE_PREPARE_ERROR_MESSAGE),
        sanitizeClientRequestId(message && message.clientRequestId)
      );
    } finally {
      isBoundsFitPreparing = false;
    }
  }

  async function prepareReferenceSearchSource(message) {
    if (
      isPreparing ||
      isApplying ||
      isImageExtendPreparing ||
      isImageExtendApplying ||
      isCompositePreparing ||
      isCompositeApplying ||
      isBoundsFitPreparing ||
      isBoundsFitApplying ||
      isReferencePreparing ||
      isTextOverlayPreparing ||
      isTextOverlayApplying
    ) {
      postReferenceSearchSourceError(
        IMAGE_TASK_ALREADY_RUNNING_MESSAGE,
        sanitizeClientRequestId(message && message.clientRequestId)
      );
      return;
    }

    isReferencePreparing = true;

    try {
      const source = await collectReferenceSearchSourceFromSelection();
      figma.ui.postMessage({
        type: "image-reference-search-source-ready",
        clientRequestId: sanitizeClientRequestId(message && message.clientRequestId),
        sourceType: source.sourceType,
        text: source.text || "",
        image: source.image || null,
        summary: source.summary,
      });
    } catch (error) {
      postReferenceSearchSourceError(
        normalizeErrorMessage(error, REFERENCE_SEARCH_SOURCE_PREPARE_ERROR_MESSAGE),
        sanitizeClientRequestId(message && message.clientRequestId)
      );
    } finally {
      isReferencePreparing = false;
    }
  }

  async function prepareImageTextOverlaySource(message) {
    if (
      isPreparing ||
      isApplying ||
      isImageExtendPreparing ||
      isImageExtendApplying ||
      isCompositePreparing ||
      isCompositeApplying ||
      isBoundsFitPreparing ||
      isBoundsFitApplying ||
      isReferencePreparing ||
      isTextOverlayPreparing ||
      isTextOverlayApplying
    ) {
      postTextOverlaySourceError(
        "Another image task is already running.",
        sanitizeClientRequestId(message && message.clientRequestId)
      );
      return;
    }

    isTextOverlayPreparing = true;
    pendingTextOverlaySession = null;

    try {
      const prepared = await collectImageTextOverlaySourceFromSelection(message);
      pendingTextOverlaySession = prepared.overlaySession;
      figma.ui.postMessage({
        type: "image-text-overlay-source-ready",
        sessionId: prepared.overlaySession ? prepared.overlaySession.id : "",
        clientRequestId: sanitizeClientRequestId(message && message.clientRequestId),
        sourceType: prepared.source.sourceType,
        text: prepared.source.text || "",
        image: prepared.source.image || null,
        summary: prepared.source.summary || {},
      });
    } catch (error) {
      pendingTextOverlaySession = null;
      postTextOverlaySourceError(
        normalizeErrorMessage(error, "Failed to prepare the text overlay source."),
        sanitizeClientRequestId(message && message.clientRequestId)
      );
    } finally {
      isTextOverlayPreparing = false;
    }
  }

  async function applyImageTextOverlay(message) {
    if (
      isPreparing ||
      isApplying ||
      isImageExtendPreparing ||
      isImageExtendApplying ||
      isCompositePreparing ||
      isCompositeApplying ||
      isBoundsFitPreparing ||
      isBoundsFitApplying ||
      isReferencePreparing ||
      isTextOverlayPreparing ||
      isTextOverlayApplying
    ) {
      postTextOverlayApplyError(
        "Text overlay is already running.",
        pendingTextOverlaySession && pendingTextOverlaySession.clientRequestId
          ? pendingTextOverlaySession.clientRequestId
          : sanitizeClientRequestId(message && message.clientRequestId)
      );
      return;
    }

    isTextOverlayApplying = true;

    try {
      if (!pendingTextOverlaySession || !message || message.sessionId !== pendingTextOverlaySession.id) {
        throw new Error("The text overlay session expired. Please run it again.");
      }

      const lines = sanitizeImageTextOverlayLines(message && message.lines);
      if (!lines.length) {
        throw new Error("No detected text lines were provided.");
      }

      const result = await applyImageTextOverlayToSelection(pendingTextOverlaySession, lines);
      figma.ui.postMessage({
        type: "image-text-overlay-apply-result",
        clientRequestId: pendingTextOverlaySession.clientRequestId,
        result: result,
      });
      notifyImageTextOverlayResult(
        result,
        sanitizeOperationLabel(message && message.operationLabel) || pendingTextOverlaySession.operationLabel
      );
      pendingTextOverlaySession = null;
    } catch (error) {
      const messageText = normalizeErrorMessage(error, "Failed to create the text overlay.");
      figma.ui.postMessage({
        type: "image-text-overlay-apply-error",
        clientRequestId:
          pendingTextOverlaySession && pendingTextOverlaySession.clientRequestId
            ? pendingTextOverlaySession.clientRequestId
            : sanitizeClientRequestId(message && message.clientRequestId),
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2600 });
    } finally {
      isTextOverlayApplying = false;
    }
  }

  async function openImageReferenceSearch(message) {
    const clientRequestId = sanitizeClientRequestId(message && message.clientRequestId);
    try {
      const query = sanitizeReferenceSearchQuery(message && message.query);
      if (!query) {
        throw new Error(REFERENCE_SEARCH_QUERY_REQUIRED_MESSAGE);
      }

      const encodedQuery = encodeURIComponent(query);
      const dribbbleUrl = "https://dribbble.com/search/" + encodedQuery;
      const behanceUrl = "https://www.behance.net/search/projects/" + encodedQuery;
      const pinterestUrl = "https://www.pinterest.com/search/pins/?q=" + encodedQuery;
      figma.openExternal(dribbbleUrl);
      figma.openExternal(behanceUrl);
      figma.openExternal(pinterestUrl);
      figma.ui.postMessage({
        type: "image-reference-search-opened",
        clientRequestId: clientRequestId,
        query: query,
        urls: [dribbbleUrl, behanceUrl, pinterestUrl],
      });
      figma.notify(REFERENCE_SEARCH_OPENED_MESSAGE_PREFIX + summarizeReferenceSearchQuery(query), { timeout: 2400 });
    } catch (error) {
      postReferenceSearchOpenError(
        normalizeErrorMessage(error, REFERENCE_SEARCH_OPEN_ERROR_MESSAGE),
        clientRequestId
      );
    }
  }

  async function applyImageBoundsFit(message) {
    if (isPreparing || isApplying || isImageExtendPreparing || isImageExtendApplying || isBoundsFitApplying) {
      postBoundsFitApplyError(
        BOUNDS_FIT_APPLY_IN_PROGRESS_MESSAGE,
        pendingBoundsFitSession && pendingBoundsFitSession.clientRequestId
          ? pendingBoundsFitSession.clientRequestId
          : sanitizeClientRequestId(message && message.clientRequestId)
      );
      return;
    }

    isBoundsFitApplying = true;

    try {
      if (!pendingBoundsFitSession || !message || message.sessionId !== pendingBoundsFitSession.id) {
        throw new Error(BOUNDS_FIT_SESSION_EXPIRED_MESSAGE);
      }

      const result = await applyBoundsFitResultsToSelection(pendingBoundsFitSession, message.results);
      figma.ui.postMessage({
        type: "image-bounds-fit-apply-result",
        clientRequestId: pendingBoundsFitSession.clientRequestId,
        result: result,
      });
      notifyBoundsFitResult(result, pendingBoundsFitSession.operationLabel);
      pendingBoundsFitSession = null;
    } catch (error) {
      const messageText = normalizeErrorMessage(error, BOUNDS_FIT_APPLY_ERROR_MESSAGE);
      figma.ui.postMessage({
        type: "image-bounds-fit-apply-error",
        clientRequestId:
          pendingBoundsFitSession && pendingBoundsFitSession.clientRequestId
            ? pendingBoundsFitSession.clientRequestId
            : sanitizeClientRequestId(message && message.clientRequestId),
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2600 });
    } finally {
      isBoundsFitApplying = false;
    }
  }

  function notifyUiReportedError(message) {
    const text = toKoreanImageErrorMessage(
      message && typeof message.message === "string" && message.message.trim()
        ? message.message.trim()
        : UI_REPORTED_IMAGE_ERROR_FALLBACK,
      UI_REPORTED_IMAGE_ERROR_FALLBACK
    );
    figma.notify(text, { error: true, timeout: 2600 });
  }

  function postPrepareError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "ai-image-upscale-source-error",
      clientRequestId: sanitizeClientRequestId(clientRequestId),
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2600 });
  }

  function postApplyError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "ai-image-upscale-apply-error",
      clientRequestId: sanitizeClientRequestId(clientRequestId),
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2600 });
  }

  function postImageExtendSourceError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "image-extend-source-error",
      clientRequestId: sanitizeClientRequestId(clientRequestId),
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2600 });
  }

  function postImageExtendApplyError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "image-extend-apply-error",
      clientRequestId: sanitizeClientRequestId(clientRequestId),
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2600 });
  }

  function postImageCompositeSourceError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "image-composite-source-error",
      clientRequestId: sanitizeClientRequestId(clientRequestId),
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2600 });
  }

  function postImageCompositeApplyError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "image-composite-apply-error",
      clientRequestId: sanitizeClientRequestId(clientRequestId),
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2600 });
  }

  function postBoundsFitSourceError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "image-bounds-fit-source-error",
      clientRequestId: sanitizeClientRequestId(clientRequestId),
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2600 });
  }

  function postBoundsFitApplyError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "image-bounds-fit-apply-error",
      clientRequestId: sanitizeClientRequestId(clientRequestId),
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2600 });
  }

  function postReferenceSearchSourceError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "image-reference-search-source-error",
      clientRequestId: sanitizeClientRequestId(clientRequestId),
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2600 });
  }

  function postReferenceSearchOpenError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "image-reference-search-error",
      clientRequestId: sanitizeClientRequestId(clientRequestId),
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2600 });
  }

  function postTextOverlaySourceError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "image-text-overlay-source-error",
      clientRequestId: sanitizeClientRequestId(clientRequestId),
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2600 });
  }

  function postTextOverlayApplyError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "image-text-overlay-apply-error",
      clientRequestId: sanitizeClientRequestId(clientRequestId),
      message: message,
    });
    figma.notify(message, { error: true, timeout: 2600 });
  }

  function collectAiImageSourceTargetFromSelection(sourceMode) {
    try {
      const imageTarget = collectSingleUpscaleTargetFromSelection();
      imageTarget.kind = "image-fill";
      return imageTarget;
    } catch (error) {
      if (sanitizeSourceMode(sourceMode) !== "shape-or-image") {
        throw error;
      }
      return collectSingleShapeEditTargetFromSelection();
    }
  }

  async function buildAiImageSource(target) {
    if (target && target.kind === "shape-export") {
      return await buildShapeEditSource(target);
    }
    return await buildUpscaleImageSource(target);
  }

  async function buildUpscaleImageSource(target) {
    const image = figma.getImageByHash(target.entry.imageHash);
    if (!image) {
      throw new Error(IMAGE_FILL_NOT_FOUND_MESSAGE);
    }

    const bytes = await image.getBytesAsync();
    if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
      throw new Error(IMAGE_FILL_BYTES_MISSING_MESSAGE);
    }

    const extension = detectImageExtension(bytes);
    const mimeType = detectImageMimeType(bytes);
    const fileName = buildFileName(target.entry, extension === "bin" ? "png" : extension);

    return {
      image: {
        bytes: bytes,
        mimeType: mimeType,
        fileName: fileName,
      },
      summary: {
        selectionLabel: formatSelectionLabel(target.selection),
        targetNodeName: target.entry.nodeName,
        targetFillCount: target.usages.length,
        imageHash: target.entry.imageHash,
        byteLength: bytes.length,
      },
    };
  }

  function collectSingleUpscaleTargetFromSelection(selectionInput) {
    const selection = Array.isArray(selectionInput) ? selectionInput.filter(Boolean) : Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error(IMAGE_TASK_NO_SELECTION_MESSAGE);
    }

    let selectedEntry = null;
    const usages = [];

    for (let rootIndex = 0; rootIndex < selection.length; rootIndex += 1) {
      const root = selection[rootIndex];
      const stack = [
        {
          node: root,
          path: safeName(root),
        },
      ];

      while (stack.length > 0) {
        const current = stack.pop();
        const node = current && current.node;
        if (!node || node.removed) {
          continue;
        }

        const fills = getNodeFills(node);
        const fillIndices = getFillIndicesInUiOrder(fills);
        for (let orderedFillIndex = 0; orderedFillIndex < fillIndices.length; orderedFillIndex += 1) {
          const fillIndex = fillIndices[orderedFillIndex];
          const fill = fills[fillIndex];
          if (!isImagePaint(fill)) {
            continue;
          }

          if (!fill.imageHash || typeof fill.imageHash !== "string") {
            continue;
          }

          if (!selectedEntry) {
            selectedEntry = {
              imageHash: fill.imageHash,
              nodeId: node.id,
              nodeName: safeName(node),
              path: current.path,
            };
          }

          if (fill.imageHash === selectedEntry.imageHash) {
            usages.push({
              nodeId: node.id,
              nodeName: safeName(node),
              fillIndex: fillIndex,
              imageHash: fill.imageHash,
              path: current.path,
            });
          }
        }

        if (!hasChildren(node)) {
          continue;
        }

        for (let childIndex = node.children.length - 1; childIndex >= 0; childIndex -= 1) {
          const child = node.children[childIndex];
          stack.push({
            node: child,
            path: current.path + " / " + safeName(child),
          });
        }
      }
    }

    if (!selectedEntry || !usages.length) {
      throw new Error(IMAGE_FILL_SELECTION_REQUIRED_MESSAGE);
    }

    if (false) {
      throw new Error(IMAGE_FILL_SELECTION_REQUIRED_MESSAGE);
    }

    return {
      selection: selection,
      entry: selectedEntry,
      usages: usages,
    };
  }

  function collectSingleShapeEditTargetFromSelection(selectionInput) {
    const selection = Array.isArray(selectionInput) ? selectionInput.filter(Boolean) : Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error(IMAGE_TASK_NO_SELECTION_MESSAGE);
    }

    if (selection.length !== 1) {
      throw new Error(SHAPE_EDIT_SINGLE_SELECTION_MESSAGE);
    }

    const node = selection[0];
    if (!isPromptEditableShapeNode(node)) {
      throw new Error(SHAPE_OR_IMAGE_SELECTION_MESSAGE);
    }

    return {
      kind: "shape-export",
      selection: selection,
      entry: {
        nodeId: node.id,
        nodeName: safeName(node),
        path: safeName(node),
      },
    };
  }

  async function buildShapeEditSource(target) {
    const node = await figma.getNodeByIdAsync(target.entry.nodeId);
    if (!isPromptEditableShapeNode(node) || typeof node.exportAsync !== "function") {
      throw new Error(SHAPE_EXPORT_SOURCE_ERROR_MESSAGE);
    }

    const bytes = await node.exportAsync({
      format: "PNG",
      useAbsoluteBounds: false,
    });
    if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
      throw new Error(SHAPE_EXPORT_EMPTY_MESSAGE);
    }

    return {
      image: {
        bytes: bytes,
        mimeType: "image/png",
        fileName: buildFileName(
          {
            nodeName: target.entry.nodeName,
            imageHash: target.entry.nodeId,
          },
          "png"
        ),
      },
      summary: {
        selectionLabel: formatSelectionLabel(target.selection),
        targetNodeName: target.entry.nodeName,
        targetFillCount: 1,
        imageHash: "",
        captureMode: "rendered-node",
        byteLength: bytes.length,
      },
    };
  }

  async function collectImageExtendTargetFromSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("Select a frame, group, or layer first.");
    }

    if (selection.length !== 1) {
      throw new Error("Image extend requires exactly one selected image layer.");
    }

    const node = selection[0];
    if (!node || node.removed) {
      throw new Error("The selected layer could not be read.");
    }

    if (hasChildren(node)) {
      throw new Error("Image extend does not support frames, groups, or layers with children yet.");
    }

    if ("locked" in node && node.locked) {
      throw new Error("Locked layers are not supported for image extend.");
    }

    if ("rotation" in node && typeof node.rotation === "number" && Math.abs(node.rotation) > 0.01) {
      throw new Error("Rotated image layers are not supported yet.");
    }

    if (!hasSimpleVisibleImagePaint(node)) {
      throw new Error("Image extend requires a layer with exactly one visible IMAGE fill.");
    }

    if (!node.parent || !canUseImageExtendParent(node.parent)) {
      throw new Error("The current parent container does not support inserting the extended background.");
    }

    if (
      "layoutMode" in node.parent &&
      typeof node.parent.layoutMode === "string" &&
      node.parent.layoutMode !== "NONE"
    ) {
      throw new Error("Image extend does not support auto-layout parents yet.");
    }

    const fills = getNodeFills(node);
    const fillIndex = getPrimaryVisibleImageFillIndex(fills);
    if (fillIndex < 0) {
      throw new Error("Could not find an IMAGE fill on the selected layer.");
    }

    const fill = fills[fillIndex];
    const width = typeof node.width === "number" && Number.isFinite(node.width) ? node.width : 0;
    const height = typeof node.height === "number" && Number.isFinite(node.height) ? node.height : 0;
    if (!(width > 0) || !(height > 0)) {
      throw new Error("Could not determine the current layer size.");
    }

    if (typeof node.exportAsync !== "function") {
      throw new Error("Could not export the selected image layer for image extend.");
    }

    const bytes = await node.exportAsync({
      format: "PNG",
      useAbsoluteBounds: false,
    });
    if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
      throw new Error("Could not export the selected image layer as PNG.");
    }

    return {
      selection: selection,
      entry: {
        nodeId: node.id,
        nodeName: safeName(node),
        imageHash: fill.imageHash || "",
      },
      currentWidth: width,
      currentHeight: height,
      image: {
        bytes: bytes,
        mimeType: "image/png",
        fileName: buildFileName(
          {
            nodeName: safeName(node),
            imageHash: fill.imageHash || node.id,
          },
          "png"
        ),
      },
    };
  }

  function sanitizeImageExtendPadding(value) {
    const source = value && typeof value === "object" ? value : {};
    const next = {
      top: sanitizeImageExtendPaddingValue(source.top),
      right: sanitizeImageExtendPaddingValue(source.right),
      bottom: sanitizeImageExtendPaddingValue(source.bottom),
      left: sanitizeImageExtendPaddingValue(source.left),
    };

    if (!(next.top > 0 || next.right > 0 || next.bottom > 0 || next.left > 0)) {
      throw new Error("Enter at least one positive expand value.");
    }

    return next;
  }

  function sanitizeImageExtendPaddingValue(value) {
    const numeric = Math.floor(Number(value) || 0);
    if (!(numeric > 0)) {
      return 0;
    }
    return Math.min(4096, numeric);
  }

  function canUseImageExtendParent(parent) {
    if (!parent || parent.removed) {
      return false;
    }

    if (!("children" in parent) || !Array.isArray(parent.children) || typeof parent.insertChild !== "function") {
      return false;
    }

    if (parent.type === "INSTANCE" || parent.type === "COMPONENT" || parent.type === "COMPONENT_SET") {
      return false;
    }

    return true;
  }

  async function applyImageExtendUnderlayToSelection(session, newImageHash, byteLength) {
    const skipped = [];
    const node = await figma.getNodeByIdAsync(session.targetNodeId);
    if (!node || node.removed) {
      skipped.push({
        nodeId: session.targetNodeId,
        nodeName: session.targetNodeName,
        reason: "Could not find the layer again.",
      });
      return buildImageExtendApplyResult(session, null, byteLength, skipped);
    }

    if (!node.parent || !canUseImageExtendParent(node.parent)) {
      skipped.push({
        nodeId: node.id,
        nodeName: safeName(node),
        reason: "The current parent container does not support inserting the extended background.",
      });
      return buildImageExtendApplyResult(session, null, byteLength, skipped);
    }

    if ("rotation" in node && typeof node.rotation === "number" && Math.abs(node.rotation) > 0.01) {
      skipped.push({
        nodeId: node.id,
        nodeName: safeName(node),
        reason: "Rotated image layers are not supported yet.",
      });
      return buildImageExtendApplyResult(session, null, byteLength, skipped);
    }

    if (
      "layoutMode" in node.parent &&
      typeof node.parent.layoutMode === "string" &&
      node.parent.layoutMode !== "NONE"
    ) {
      skipped.push({
        nodeId: node.id,
        nodeName: safeName(node),
        reason: "Image extend does not support auto-layout parents yet.",
      });
      return buildImageExtendApplyResult(session, null, byteLength, skipped);
    }

    const localBounds = getImageExtendLocalBounds(node);
    if (!localBounds) {
      skipped.push({
        nodeId: node.id,
        nodeName: safeName(node),
        reason: "Could not calculate the layer position.",
      });
      return buildImageExtendApplyResult(session, null, byteLength, skipped);
    }

    const parent = node.parent;
    const expand = session.expand || { top: 0, right: 0, bottom: 0, left: 0 };
    const nextX = localBounds.x - expand.left;
    const nextY = localBounds.y - expand.top;
    const nextWidth = Math.max(1, roundBoundsFitMetric(localBounds.width + expand.left + expand.right));
    const nextHeight = Math.max(1, roundBoundsFitMetric(localBounds.height + expand.top + expand.bottom));
    let background = null;

    try {
      background = figma.createRectangle();
      background.name = safeName(node) + " / extended background";
      background.resize(nextWidth, nextHeight);
      background.fills = [buildVisibleImageFill(newImageHash)];
      background.strokes = [];
      if ("cornerRadius" in background) {
        background.cornerRadius = 0;
      }
      setImageExtendNodePosition(background, nextX, nextY);

      const nodeIndex = findNodeChildIndex(parent, node.id);
      if (nodeIndex < 0) {
        throw new Error("Could not find the layer inside its current parent.");
      }

      parent.insertChild(nodeIndex, background);
      const group = figma.group([background, node], parent);
      group.name = safeName(node) + " / extended";
      figma.currentPage.selection = [group];

      return buildImageExtendApplyResult(session, group, byteLength, skipped);
    } catch (error) {
      if (background && !background.removed && background.parent) {
        background.remove();
      }
      skipped.push({
        nodeId: node.id,
        nodeName: safeName(node),
        reason: normalizeErrorMessage(error, "Failed to apply the generated image extend result."),
      });
      return buildImageExtendApplyResult(session, null, byteLength, skipped);
    }
  }

  function buildImageExtendApplyResult(session, group, byteLength, skipped) {
    const appliedCount = group ? 1 : 0;
    const groupName = group && typeof group.name === "string" ? group.name : "";
    const groupId = group && typeof group.id === "string" ? group.id : "";
    const expand = session && session.expand ? session.expand : { top: 0, right: 0, bottom: 0, left: 0 };
    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: session && session.selectionLabel ? session.selectionLabel : "",
        targetNodeName: session && session.targetNodeName ? session.targetNodeName : "",
        appliedCount: appliedCount,
        skippedCount: Array.isArray(skipped) ? skipped.length : 0,
        groupId: groupId,
        groupName: groupName,
        expandTop: expand.top,
        expandRight: expand.right,
        expandBottom: expand.bottom,
        expandLeft: expand.left,
        resultByteLength: byteLength,
      },
      skipped: Array.isArray(skipped) ? skipped.slice(0, 24) : [],
    };
  }

  function buildImageCompositeApplyResult(session, resultNode, byteLength, skipped) {
    const appliedCount = resultNode ? 1 : 0;
    const nodeName = resultNode && typeof resultNode.name === "string" ? resultNode.name : "";
    const nodeId = resultNode && typeof resultNode.id === "string" ? resultNode.id : "";
    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: session && session.selectionLabel ? session.selectionLabel : "",
        appliedCount: appliedCount,
        skippedCount: Array.isArray(skipped) ? skipped.length : 0,
        resultNodeId: nodeId,
        resultNodeName: nodeName,
        resultByteLength: byteLength,
      },
      skipped: Array.isArray(skipped) ? skipped.slice(0, 24) : [],
    };
  }

  async function applyImageCompositeToSelection(session, newImageHash, byteLength) {
    const skipped = [];
    const unionRect = session && session.unionRect ? session.unionRect : null;
    if (!unionRect || !(unionRect.width > 0) || !(unionRect.height > 0)) {
      skipped.push({
        nodeId: "",
        nodeName: "",
        reason: "Could not calculate the composite placement bounds.",
      });
      return buildImageCompositeApplyResult(session, null, byteLength, skipped);
    }

    const resultNode = figma.createRectangle();
    resultNode.name = buildImageCompositeResultName(session && session.selectionLabel ? session.selectionLabel : "");
    resultNode.resize(unionRect.width, unionRect.height);
    resultNode.fills = [buildVisibleImageFill(newImageHash)];
    resultNode.strokes = [];
    if ("cornerRadius" in resultNode) {
      resultNode.cornerRadius = 0;
    }
    resultNode.x = unionRect.x;
    resultNode.y = unionRect.y;
    figma.currentPage.appendChild(resultNode);
    figma.currentPage.selection = [resultNode];

    return buildImageCompositeApplyResult(session, resultNode, byteLength, skipped);
  }

  function getImageExtendLocalBounds(node) {
    if (!node || node.removed) {
      return null;
    }

    const width = typeof node.width === "number" && Number.isFinite(node.width) ? node.width : 0;
    const height = typeof node.height === "number" && Number.isFinite(node.height) ? node.height : 0;
    if (!(width > 0) || !(height > 0)) {
      return null;
    }

    if ("x" in node && typeof node.x === "number" && "y" in node && typeof node.y === "number") {
      return {
        x: roundBoundsFitMetric(node.x),
        y: roundBoundsFitMetric(node.y),
        width: roundBoundsFitMetric(width),
        height: roundBoundsFitMetric(height),
      };
    }

    if ("relativeTransform" in node && Array.isArray(node.relativeTransform) && node.relativeTransform.length >= 2) {
      const row0 = Array.isArray(node.relativeTransform[0]) ? node.relativeTransform[0] : null;
      const row1 = Array.isArray(node.relativeTransform[1]) ? node.relativeTransform[1] : null;
      if (row0 && row1 && Number.isFinite(Number(row0[2])) && Number.isFinite(Number(row1[2]))) {
        return {
          x: roundBoundsFitMetric(Number(row0[2])),
          y: roundBoundsFitMetric(Number(row1[2])),
          width: roundBoundsFitMetric(width),
          height: roundBoundsFitMetric(height),
        };
      }
    }

    return null;
  }

  function setImageExtendNodePosition(node, x, y) {
    const nextX = roundBoundsFitMetric(x);
    const nextY = roundBoundsFitMetric(y);

    if ("x" in node && typeof node.x === "number" && "y" in node && typeof node.y === "number") {
      node.x = nextX;
      node.y = nextY;
      return;
    }

    if ("relativeTransform" in node && Array.isArray(node.relativeTransform)) {
      node.relativeTransform = [
        [node.relativeTransform[0][0], node.relativeTransform[0][1], nextX],
        [node.relativeTransform[1][0], node.relativeTransform[1][1], nextY],
      ];
      return;
    }

    throw new Error("Could not update the layer position.");
  }

  function findNodeChildIndex(parent, nodeId) {
    if (!parent || !("children" in parent) || !Array.isArray(parent.children)) {
      return -1;
    }

    for (let index = 0; index < parent.children.length; index += 1) {
      const child = parent.children[index];
      if (child && child.id === nodeId) {
        return index;
      }
    }

    return -1;
  }

  function buildSceneNodeOrderPath(node) {
    if (!node || node.removed) {
      return null;
    }

    const path = [];
    let current = node;
    while (current && current.parent && current.parent.type !== "DOCUMENT") {
      const parent = current.parent;
      const childIndex = findNodeChildIndex(parent, current.id);
      if (childIndex < 0) {
        return null;
      }
      path.unshift(childIndex);
      current = parent;
      if (parent.type === "PAGE") {
        break;
      }
    }

    return path;
  }

  function compareSceneNodeCanvasOrder(leftNode, rightNode) {
    const leftPath = buildSceneNodeOrderPath(leftNode);
    const rightPath = buildSceneNodeOrderPath(rightNode);
    if (!leftPath || !rightPath) {
      return 0;
    }

    const sharedLength = Math.min(leftPath.length, rightPath.length);
    for (let index = 0; index < sharedLength; index += 1) {
      if (leftPath[index] !== rightPath[index]) {
        return leftPath[index] - rightPath[index];
      }
    }

    return leftPath.length - rightPath.length;
  }

  async function applyImageTextOverlayToSelection(session, lines) {
    const skipped = [];
    const node = await figma.getNodeByIdAsync(session.targetNodeId);
    if (!node || node.removed) {
      skipped.push({
        nodeId: session.targetNodeId,
        nodeName: session.targetNodeName,
        reason: "Could not find the selected layer again.",
      });
      return buildImageTextOverlayApplyResult(session, null, 0, skipped);
    }

    if ("locked" in node && node.locked) {
      skipped.push({
        nodeId: node.id,
        nodeName: safeName(node),
        reason: "Locked layers are not supported for text overlay.",
      });
      return buildImageTextOverlayApplyResult(session, null, 0, skipped);
    }

    if ("rotation" in node && typeof node.rotation === "number" && Math.abs(node.rotation) > 0.01) {
      skipped.push({
        nodeId: node.id,
        nodeName: safeName(node),
        reason: "Rotated layers are not supported for text overlay yet.",
      });
      return buildImageTextOverlayApplyResult(session, null, 0, skipped);
    }

    if (!node.parent || !canUseImageExtendParent(node.parent)) {
      skipped.push({
        nodeId: node.id,
        nodeName: safeName(node),
        reason: "The current parent container does not support grouping the text overlay result.",
      });
      return buildImageTextOverlayApplyResult(session, null, 0, skipped);
    }

    if (
      "layoutMode" in node.parent &&
      typeof node.parent.layoutMode === "string" &&
      node.parent.layoutMode !== "NONE"
    ) {
      skipped.push({
        nodeId: node.id,
        nodeName: safeName(node),
        reason: "Auto-layout parents are not supported for text overlay yet.",
      });
      return buildImageTextOverlayApplyResult(session, null, 0, skipped);
    }

    const localBounds = getImageExtendLocalBounds(node);
    if (!localBounds) {
      skipped.push({
        nodeId: node.id,
        nodeName: safeName(node),
        reason: "Could not determine the selected layer position.",
      });
      return buildImageTextOverlayApplyResult(session, null, 0, skipped);
    }

    const parent = node.parent;
    const overlay = createImageTextOverlayContainer(node, localBounds);
    const sortedLines = lines.slice().sort(function (leftLine, rightLine) {
      if (Math.abs(leftLine.topRatio - rightLine.topRatio) > 0.0005) {
        return leftLine.topRatio - rightLine.topRatio;
      }
      return leftLine.leftRatio - rightLine.leftRatio;
    });
    const availableFonts = await getImageTextOverlayAvailableFontsSafely();
    let createdCount = 0;
    let group = null;

    try {
      for (let index = 0; index < sortedLines.length; index += 1) {
        const line = sortedLines[index];
        const textNode = await createImageTextOverlayTextNode(line, localBounds.width, localBounds.height, availableFonts);
        if (!textNode) {
          skipped.push({
            nodeId: node.id,
            nodeName: safeName(node),
            reason: "Skipped a text line because its font could not be loaded.",
          });
          continue;
        }

        overlay.appendChild(textNode);
        textNode.x = roundBoundsFitMetric(localBounds.width * line.leftRatio);
        textNode.y = roundBoundsFitMetric(localBounds.height * line.topRatio);
        createdCount += 1;
      }

      if (!createdCount) {
        overlay.remove();
        skipped.push({
          nodeId: node.id,
          nodeName: safeName(node),
          reason: "No editable text layers could be created from the detected text.",
        });
        return buildImageTextOverlayApplyResult(session, null, createdCount, skipped);
      }

      const nodeIndex = findNodeChildIndex(parent, node.id);
      parent.insertChild(nodeIndex >= 0 ? nodeIndex + 1 : parent.children.length, overlay);
      group = figma.group([node, overlay], parent);
      group.name = safeName(node) + " / text overlay";
      tagImageTextOverlayNode(group, "group");
      tagImageTextOverlayNode(overlay, "overlay");
      figma.currentPage.selection = [group];
      figma.viewport.scrollAndZoomIntoView([group]);
      return buildImageTextOverlayApplyResult(session, group, createdCount, skipped);
    } catch (error) {
      if (overlay && !overlay.removed) {
        overlay.remove();
      }
      skipped.push({
        nodeId: node.id,
        nodeName: safeName(node),
        reason: normalizeErrorMessage(error, "Failed to create the text overlay group."),
      });
      return buildImageTextOverlayApplyResult(session, null, createdCount, skipped);
    }
  }

  function createImageTextOverlayContainer(node, localBounds) {
    const overlay = figma.createFrame();
    overlay.name = safeName(node) + " / editable text";
    overlay.resize(
      Math.max(1, roundBoundsFitMetric(localBounds.width)),
      Math.max(1, roundBoundsFitMetric(localBounds.height))
    );
    overlay.clipsContent = false;
    overlay.fills = [];
    overlay.strokes = [];
    setImageExtendNodePosition(overlay, localBounds.x, localBounds.y);
    return overlay;
  }

  async function createImageTextOverlayTextNode(line, targetWidth, targetHeight, availableFonts) {
    const characters = sanitizeImageTextOverlayCharacters(line && line.text);
    if (!characters) {
      return null;
    }

    const fontName = await loadImageTextOverlayFont(line, availableFonts);
    if (!fontName) {
      return null;
    }

    const textNode = figma.createText();
    const width = Math.max(1, roundBoundsFitMetric(targetWidth * line.widthRatio));
    const height = Math.max(1, roundBoundsFitMetric(targetHeight * line.heightRatio));
    const fontSize = resolveImageTextOverlayFontSize(line, targetHeight, height);
    textNode.fontName = fontName;
    textNode.fontSize = fontSize;
    textNode.characters = characters;
    textNode.name = buildImageTextOverlayLayerName(characters);
    applyImageTextOverlayTextAlign(textNode, line.align);
    applyImageTextOverlayTextSizing(textNode, width, height);

    const fillPaint = createImageTextOverlayPaint(line);
    textNode.fills = [fillPaint || createSolidPaintFromColor("000000", 1)];

    if ("rotation" in textNode) {
      const rotation = sanitizeImageTextOverlayRotation(line.rotation);
      if (rotation !== 0) {
        textNode.rotation = rotation;
      }
    }

    return textNode;
  }

  function applyImageTextOverlayTextAlign(textNode, align) {
    if (!textNode || !("textAlignHorizontal" in textNode)) {
      return;
    }

    if (align === "center") {
      textNode.textAlignHorizontal = "CENTER";
      return;
    }

    if (align === "right") {
      textNode.textAlignHorizontal = "RIGHT";
      return;
    }

    textNode.textAlignHorizontal = "LEFT";
  }

  function applyImageTextOverlayTextSizing(textNode, width, height) {
    if (!textNode) {
      return;
    }

    try {
      if ("textAutoResize" in textNode) {
        textNode.textAutoResize = "NONE";
      }
      if (typeof textNode.resize === "function") {
        textNode.resize(Math.max(1, roundBoundsFitMetric(width)), Math.max(1, roundBoundsFitMetric(height)));
      }
    } catch (error) {
      if ("textAutoResize" in textNode) {
        textNode.textAutoResize = "WIDTH_AND_HEIGHT";
      }
    }
  }

  function resolveImageTextOverlayFontSize(line, targetHeight, fallbackHeight) {
    const ratio = Number(line && line.fontSizeRatio);
    if (Number.isFinite(ratio) && ratio > 0) {
      return Math.max(1, roundBoundsFitMetric(targetHeight * ratio));
    }

    if (Number.isFinite(fallbackHeight) && fallbackHeight > 0) {
      return Math.max(1, roundBoundsFitMetric(fallbackHeight * 0.82));
    }

    return 12;
  }

  function buildImageTextOverlayApplyResult(session, group, createdCount, skipped) {
    const appliedCount = group ? 1 : 0;
    const groupName = group && typeof group.name === "string" ? group.name : "";
    const groupId = group && typeof group.id === "string" ? group.id : "";
    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: session && session.selectionLabel ? session.selectionLabel : "",
        targetNodeName: session && session.targetNodeName ? session.targetNodeName : "",
        appliedCount: appliedCount,
        createdTextCount: Math.max(0, Math.floor(Number(createdCount) || 0)),
        skippedCount: Array.isArray(skipped) ? skipped.length : 0,
        groupId: groupId,
        groupName: groupName,
      },
      skipped: Array.isArray(skipped) ? skipped.slice(0, 24) : [],
    };
  }

  function notifyImageTextOverlayResult(result, operationLabel) {
    const summary = result && result.summary ? result.summary : {};
    const appliedCount =
      typeof summary.appliedCount === "number" && Number.isFinite(summary.appliedCount) ? summary.appliedCount : 0;
    const createdTextCount =
      typeof summary.createdTextCount === "number" && Number.isFinite(summary.createdTextCount)
        ? summary.createdTextCount
        : 0;
    const skippedCount =
      typeof summary.skippedCount === "number" && Number.isFinite(summary.skippedCount) ? summary.skippedCount : 0;

    if (!appliedCount) {
      figma.notify("No editable text overlay could be created.", { timeout: 2400 });
      return;
    }

    let message = (operationLabel || "Text overlay") + " complete (" + createdTextCount + " text layer";
    if (createdTextCount !== 1) {
      message += "s";
    }
    if (skippedCount > 0) {
      message += ", " + skippedCount + " skipped";
    }
    figma.notify(message + ")", { timeout: 2600 });
  }

  function sanitizeImageTextOverlayLines(input) {
    const list = Array.isArray(input) ? input : [];
    const normalized = [];

    for (let index = 0; index < list.length; index += 1) {
      const raw = list[index];
      if (!raw || typeof raw !== "object") {
        continue;
      }

      const text = sanitizeImageTextOverlayCharacters(raw.text);
      if (!text) {
        continue;
      }

      const leftRatio = sanitizeImageTextOverlayRatio(raw.leftRatio, 0);
      const topRatio = sanitizeImageTextOverlayRatio(raw.topRatio, 0);
      const widthRatio = sanitizeImageTextOverlayRatio(raw.widthRatio, 0);
      const heightRatio = sanitizeImageTextOverlayRatio(raw.heightRatio, 0);
      if (!(widthRatio > 0.002) || !(heightRatio > 0.002) || leftRatio >= 1 || topRatio >= 1) {
        continue;
      }

      normalized.push({
        text: text,
        leftRatio: leftRatio,
        topRatio: topRatio,
        widthRatio: Math.min(1 - leftRatio, widthRatio),
        heightRatio: Math.min(1 - topRatio, heightRatio),
        fontSizeRatio: sanitizeImageTextOverlayRatio(raw.fontSizeRatio, 0),
        fontFamily: sanitizeImageTextOverlayFontFamily(raw.fontFamily),
        fontStyle: sanitizeImageTextOverlayFontStyle(raw.fontStyle),
        fontWeight: sanitizeImageTextOverlayFontWeight(raw.fontWeight),
        fillColor: typeof raw.fillColor === "string" ? raw.fillColor.trim() : "",
        fillOpacity: sanitizeImageTextOverlayOpacity(raw.fillOpacity),
        align: sanitizeImageTextOverlayAlign(raw.align),
        rotation: sanitizeImageTextOverlayRotation(raw.rotation),
      });
    }

    return normalized.slice(0, 120);
  }

  function sanitizeImageTextOverlayCharacters(value) {
    if (typeof value !== "string") {
      return "";
    }

    const normalized = value.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").trim();
    return normalized ? normalized.slice(0, 500) : "";
  }

  function sanitizeImageTextOverlayRatio(value, fallbackValue) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return Number.isFinite(fallbackValue) ? fallbackValue : 0;
    }
    return Math.max(0, Math.min(1, Math.round(numeric * 1000000) / 1000000));
  }

  function sanitizeImageTextOverlayOpacity(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return 1;
    }
    return Math.max(0, Math.min(1, Math.round(numeric * 1000) / 1000));
  }

  function sanitizeImageTextOverlayAlign(value) {
    const normalized = typeof value === "string" ? value.replace(/\s+/g, " ").trim().toLowerCase() : "";
    if (normalized === "center" || normalized === "centre") {
      return "center";
    }
    if (normalized === "right") {
      return "right";
    }
    return "left";
  }

  function sanitizeImageTextOverlayRotation(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return 0;
    }
    const rounded = Math.round(numeric * 1000) / 1000;
    if (rounded > 180) {
      return 180;
    }
    if (rounded < -180) {
      return -180;
    }
    return rounded;
  }

  function sanitizeImageTextOverlayFontFamily(value) {
    return typeof value === "string" ? value.trim().slice(0, 120) : "";
  }

  function sanitizeImageTextOverlayFontStyle(value) {
    return typeof value === "string" ? value.trim().slice(0, 80) : "";
  }

  function sanitizeImageTextOverlayFontWeight(value) {
    const numeric = Math.round(Number(value) || 0);
    if (!(numeric > 0)) {
      return 400;
    }
    return Math.max(100, Math.min(900, numeric));
  }

  function buildImageTextOverlayLayerName(characters) {
    const normalized = String(characters || "").replace(/\s+/g, " ").trim();
    if (!normalized) {
      return "Editable Text";
    }
    return normalized.length > 48 ? normalized.slice(0, 48) : normalized;
  }

  function createImageTextOverlayPaint(line) {
    if (!line || !line.fillColor) {
      return null;
    }
    return createSolidPaintFromColor(line.fillColor, line.fillOpacity);
  }

  function createSolidPaintFromColor(value, opacityValue) {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (!normalized) {
      return null;
    }

    const hexMatch = normalized.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    let fullHex = "";
    if (hexMatch) {
      const compactHex = hexMatch[1];
      fullHex =
        compactHex.length === 3
          ? compactHex[0] + compactHex[0] + compactHex[1] + compactHex[1] + compactHex[2] + compactHex[2]
          : compactHex;
    } else {
      const rgbMatch = normalized.match(
        /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*[0-9.]+\s*)?\)$/i
      );
      if (!rgbMatch) {
        return null;
      }

      fullHex = rgbMatch
        .slice(1, 4)
        .map(function (channel) {
          return Math.max(0, Math.min(255, Math.round(Number(channel) || 0))).toString(16).padStart(2, "0");
        })
        .join("");
    }

    const red = Number.parseInt(fullHex.slice(0, 2), 16);
    const green = Number.parseInt(fullHex.slice(2, 4), 16);
    const blue = Number.parseInt(fullHex.slice(4, 6), 16);
    if (!Number.isFinite(red) || !Number.isFinite(green) || !Number.isFinite(blue)) {
      return null;
    }

    const paint = {
      type: "SOLID",
      color: {
        r: red / 255,
        g: green / 255,
        b: blue / 255,
      },
    };
    if (Number.isFinite(opacityValue) && opacityValue >= 0 && opacityValue < 1) {
      paint.opacity = Math.max(0, Math.min(1, Number(opacityValue)));
    }
    return paint;
  }

  async function loadImageTextOverlayFont(line, availableFonts) {
    const candidates = getImageTextOverlayFontCandidates(line, availableFonts);
    for (let index = 0; index < candidates.length; index += 1) {
      const fontName = candidates[index];
      try {
        await figma.loadFontAsync(fontName);
        return fontName;
      } catch (error) {}
    }
    return null;
  }

  function getImageTextOverlayFontCandidates(line, availableFonts) {
    const candidates = [];
    const requestedStyle = getRequestedImageTextOverlayFontStyle(line);
    const requestedFamily = getRequestedImageTextOverlayFontFamily(line);
    const splitRequest = splitRequestedImageTextOverlayFontFamily(requestedFamily);

    pushDirectImageTextOverlayFontCandidate(candidates, requestedFamily, requestedStyle);
    pushImageTextOverlayFontNameCandidate(
      candidates,
      findExactImageTextOverlayFontMatch(
        {
          fontFamily: requestedFamily,
          fontStyle: requestedStyle,
        },
        availableFonts
      )
    );

    if (splitRequest.family && splitRequest.family !== requestedFamily) {
      pushDirectImageTextOverlayFontCandidate(candidates, splitRequest.family, requestedStyle);
      pushImageTextOverlayFontNameCandidate(
        candidates,
        findExactImageTextOverlayFontMatch(
          {
            fontFamily: splitRequest.family,
            fontStyle: requestedStyle,
          },
          availableFonts
        )
      );
      if (splitRequest.style) {
        pushDirectImageTextOverlayFontCandidate(candidates, splitRequest.family, splitRequest.style);
        pushImageTextOverlayFontNameCandidate(
          candidates,
          findExactImageTextOverlayFontMatch(
            {
              fontFamily: splitRequest.family,
              fontStyle: splitRequest.style,
            },
            availableFonts
          )
        );
      }
    }

    pushImageTextOverlayFontNameCandidate(candidates, findImageTextOverlayFamilyFontMatch(requestedFamily, line, availableFonts));
    if (splitRequest.family && splitRequest.family !== requestedFamily) {
      pushImageTextOverlayFontNameCandidate(
        candidates,
        findImageTextOverlayFamilyFontMatch(splitRequest.family, line, availableFonts)
      );
    }

    pushKnownImageTextOverlayFontFallbacks(candidates, line);
    pushImageTextOverlayFontNameCandidate(candidates, findImageTextOverlayFallbackFontName(availableFonts));
    return candidates;
  }

  function pushDirectImageTextOverlayFontCandidate(candidates, family, style) {
    const normalizedFamily = cleanupImageTextOverlayFontFamily(family);
    if (!normalizedFamily) {
      return;
    }

    pushImageTextOverlayFontNameCandidate(candidates, {
      family: normalizedFamily,
      style: normalizeImageTextOverlayFontStyle(style) || "Regular",
    });
  }

  function pushKnownImageTextOverlayFontFallbacks(candidates, line) {
    const styleCandidates = buildImageTextOverlayFontStyleCandidates(line);
    const families = [
      "LGEIText",
      "Malgun Gothic",
      "Apple SD Gothic Neo",
      "Noto Sans KR",
      "Noto Sans CJK KR",
      "Arial",
      "Inter",
      "Roboto",
    ];

    for (let familyIndex = 0; familyIndex < families.length; familyIndex += 1) {
      const family = families[familyIndex];
      for (let styleIndex = 0; styleIndex < styleCandidates.length; styleIndex += 1) {
        pushDirectImageTextOverlayFontCandidate(candidates, family, styleCandidates[styleIndex]);
      }
    }
  }

  function getRequestedImageTextOverlayFontFamily(line) {
    const preferred = cleanupImageTextOverlayFontFamily(line && line.fontFamily);
    return preferred || "Arial";
  }

  function getRequestedImageTextOverlayFontStyle(line) {
    const preferred = normalizeImageTextOverlayFontStyle(line && line.fontStyle);
    return preferred || "Regular";
  }

  function cleanupImageTextOverlayFontFamily(value) {
    if (typeof value !== "string") {
      return "";
    }

    return value
      .trim()
      .replace(/^["']+|["']+$/g, "")
      .replace(/(?:PS)?MT$/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeImageTextOverlayFontStyle(value) {
    const normalized = typeof value === "string" ? value.replace(/[_-]+/g, " ").trim().toLowerCase() : "";
    if (!normalized) {
      return "";
    }

    if (
      (normalized.indexOf("bold") !== -1 && normalized.indexOf("italic") !== -1) ||
      (normalized.indexOf("bold") !== -1 && normalized.indexOf("oblique") !== -1)
    ) {
      return "Bold Italic";
    }
    if (
      (normalized.indexOf("semi") !== -1 || normalized.indexOf("demi") !== -1) &&
      normalized.indexOf("bold") !== -1
    ) {
      return "Semi Bold";
    }
    if (
      (normalized.indexOf("extra") !== -1 || normalized.indexOf("ultra") !== -1) &&
      normalized.indexOf("bold") !== -1
    ) {
      return "Extra Bold";
    }
    if (normalized.indexOf("bold") !== -1) {
      return "Bold";
    }
    if (normalized.indexOf("medium") !== -1) {
      return "Medium";
    }
    if (normalized.indexOf("light") !== -1) {
      return "Light";
    }
    if (normalized.indexOf("thin") !== -1) {
      return "Thin";
    }
    if (normalized.indexOf("black") !== -1 || normalized.indexOf("heavy") !== -1) {
      return "Black";
    }
    if (normalized.indexOf("italic") !== -1 || normalized.indexOf("oblique") !== -1) {
      return "Italic";
    }
    if (normalized.indexOf("book") !== -1) {
      return "Book";
    }
    if (normalized.indexOf("roman") !== -1 || normalized.indexOf("regular") !== -1) {
      return "Regular";
    }

    return "";
  }

  function splitRequestedImageTextOverlayFontFamily(value) {
    const normalized = cleanupImageTextOverlayFontFamily(value);
    if (!normalized) {
      return { family: "", style: "" };
    }

    const styleMatch = normalized.match(
      /(?:^|[-\s])(bold[\s-]*italic|italic[\s-]*bold|semi[\s-]*bold|demi[\s-]*bold|extra[\s-]*bold|ultra[\s-]*bold|bold|medium|light|thin|black|heavy|italic|oblique|regular|roman|book)$/i
    );
    const rawStyle = styleMatch ? styleMatch[1] : "";
    const family = cleanupImageTextOverlayFontFamily(
      styleMatch ? normalized.slice(0, styleMatch.index).replace(/[-\s]+$/, "") : normalized
    );
    return {
      family: family || normalized,
      style: normalizeImageTextOverlayFontStyle(rawStyle),
    };
  }

  function buildImageTextOverlayFontStyleCandidates(line) {
    const candidates = [];
    const requestedStyle = getRequestedImageTextOverlayFontStyle(line);
    const weight = Number(line && line.fontWeight);
    const normalizedWeight = Number.isFinite(weight) ? weight : 400;

    pushImageTextOverlayFontStyleCandidate(candidates, requestedStyle);
    if (requestedStyle === "Bold Italic") {
      pushImageTextOverlayFontStyleCandidate(candidates, "Italic");
      pushImageTextOverlayFontStyleCandidate(candidates, "Bold");
    } else if (requestedStyle === "Italic") {
      pushImageTextOverlayFontStyleCandidate(candidates, "Regular");
    }

    if (normalizedWeight >= 800) {
      pushImageTextOverlayFontStyleCandidate(candidates, "Black");
      pushImageTextOverlayFontStyleCandidate(candidates, "Extra Bold");
    }
    if (normalizedWeight >= 700) {
      pushImageTextOverlayFontStyleCandidate(candidates, "Bold");
    } else if (normalizedWeight >= 600) {
      pushImageTextOverlayFontStyleCandidate(candidates, "Semi Bold");
    } else if (normalizedWeight >= 500) {
      pushImageTextOverlayFontStyleCandidate(candidates, "Medium");
    } else if (normalizedWeight <= 300) {
      pushImageTextOverlayFontStyleCandidate(candidates, "Light");
    }

    pushImageTextOverlayFontStyleCandidate(candidates, "Regular");
    pushImageTextOverlayFontStyleCandidate(candidates, "Book");
    pushImageTextOverlayFontStyleCandidate(candidates, "Roman");
    return candidates;
  }

  function pushImageTextOverlayFontStyleCandidate(candidates, value) {
    const normalized = normalizeImageTextOverlayFontStyle(value);
    if (!normalized) {
      return;
    }

    for (let index = 0; index < candidates.length; index += 1) {
      if (normalizeImageTextOverlayFontToken(candidates[index]) === normalizeImageTextOverlayFontToken(normalized)) {
        return;
      }
    }

    candidates.push(normalized);
  }

  function getImageTextOverlayFontFamilyTokens(value) {
    const tokens = [];
    const cleaned = cleanupImageTextOverlayFontFamily(value);
    const split = splitRequestedImageTextOverlayFontFamily(cleaned);
    pushImageTextOverlayFontFamilyToken(tokens, cleaned);
    pushImageTextOverlayFontFamilyToken(tokens, split.family);
    return tokens;
  }

  function pushImageTextOverlayFontFamilyToken(tokens, value) {
    const normalized = normalizeImageTextOverlayFontToken(cleanupImageTextOverlayFontFamily(value));
    if (!normalized || tokens.indexOf(normalized) !== -1) {
      return;
    }

    tokens.push(normalized);
  }

  function findImageTextOverlayFamilyFontMatch(family, line, availableFonts) {
    if (!Array.isArray(availableFonts) || availableFonts.length === 0) {
      return null;
    }

    const familyTokens = getImageTextOverlayFontFamilyTokens(family);
    if (familyTokens.length === 0) {
      return null;
    }

    const exactMatches = [];
    const partialMatches = [];
    for (let index = 0; index < availableFonts.length; index += 1) {
      const entry = availableFonts[index];
      if (!entry || !entry.fontName) {
        continue;
      }

      const entryFamily = normalizeImageTextOverlayFontToken(cleanupImageTextOverlayFontFamily(entry.fontName.family));
      if (!entryFamily) {
        continue;
      }

      if (familyTokens.indexOf(entryFamily) !== -1) {
        exactMatches.push(entry);
        continue;
      }

      if (
        familyTokens.some(function (token) {
          return token.indexOf(entryFamily) !== -1 || entryFamily.indexOf(token) !== -1;
        })
      ) {
        partialMatches.push(entry);
      }
    }

    return selectImageTextOverlayFontEntryByStyle(exactMatches.length > 0 ? exactMatches : partialMatches, line);
  }

  function selectImageTextOverlayFontEntryByStyle(entries, line) {
    if (!Array.isArray(entries) || entries.length === 0) {
      return null;
    }

    const styleCandidates = buildImageTextOverlayFontStyleCandidates(line);
    for (let styleIndex = 0; styleIndex < styleCandidates.length; styleIndex += 1) {
      const normalizedStyle = normalizeImageTextOverlayFontToken(styleCandidates[styleIndex]);
      for (let entryIndex = 0; entryIndex < entries.length; entryIndex += 1) {
        const entry = entries[entryIndex];
        if (!entry || !entry.fontName) {
          continue;
        }

        if (normalizeImageTextOverlayFontToken(entry.fontName.style) === normalizedStyle) {
          return entry.fontName;
        }
      }
    }

    for (let fallbackIndex = 0; fallbackIndex < 3; fallbackIndex += 1) {
      const fallbackStyle = ["Regular", "Book", "Roman"][fallbackIndex];
      const normalizedFallbackStyle = normalizeImageTextOverlayFontToken(fallbackStyle);
      for (let entryIndex = 0; entryIndex < entries.length; entryIndex += 1) {
        const entry = entries[entryIndex];
        if (!entry || !entry.fontName) {
          continue;
        }

        if (normalizeImageTextOverlayFontToken(entry.fontName.style) === normalizedFallbackStyle) {
          return entry.fontName;
        }
      }
    }

    return entries[0] && entries[0].fontName ? entries[0].fontName : null;
  }

  function findImageTextOverlayFallbackFontName(availableFonts) {
    if (!Array.isArray(availableFonts) || availableFonts.length === 0) {
      return null;
    }

    let fallback = findImageTextOverlayFamilyFontMatch("Arial", { fontStyle: "Regular", fontWeight: 400 }, availableFonts);
    if (fallback) {
      return fallback;
    }

    fallback = findImageTextOverlayFamilyFontMatch("Inter", { fontStyle: "Regular", fontWeight: 400 }, availableFonts);
    if (fallback) {
      return fallback;
    }

    fallback = findImageTextOverlayFamilyFontMatch("Roboto", { fontStyle: "Regular", fontWeight: 400 }, availableFonts);
    if (fallback) {
      return fallback;
    }

    return selectImageTextOverlayFontEntryByStyle(availableFonts, { fontStyle: "Regular", fontWeight: 400 });
  }

  function pushImageTextOverlayFontNameCandidate(candidates, fontName) {
    if (!fontName || typeof fontName !== "object") {
      return;
    }

    const candidateKey =
      normalizeImageTextOverlayFontToken(fontName.family) + ":" + normalizeImageTextOverlayFontToken(fontName.style);
    for (let index = 0; index < candidates.length; index += 1) {
      const existing = candidates[index];
      const existingKey =
        normalizeImageTextOverlayFontToken(existing.family) + ":" + normalizeImageTextOverlayFontToken(existing.style);
      if (existingKey === candidateKey) {
        return;
      }
    }

    candidates.push(fontName);
  }

  function findExactImageTextOverlayFontMatch(style, availableFonts) {
    if (!style || !Array.isArray(availableFonts)) {
      return null;
    }

    const targetFamily = normalizeImageTextOverlayFontToken(style.fontFamily);
    const targetStyle = normalizeImageTextOverlayFontToken(style.fontStyle);
    if (targetFamily.length === 0 || targetStyle.length === 0) {
      return null;
    }

    for (let index = 0; index < availableFonts.length; index += 1) {
      const entry = availableFonts[index];
      if (!entry || !entry.fontName) {
        continue;
      }

      const family = normalizeImageTextOverlayFontToken(entry.fontName.family);
      const fontStyle = normalizeImageTextOverlayFontToken(entry.fontName.style);
      if (family === targetFamily && fontStyle === targetStyle) {
        return entry.fontName;
      }
    }

    return null;
  }

  async function getImageTextOverlayAvailableFonts() {
    if (!availableFontsPromise) {
      availableFontsPromise = figma.listAvailableFontsAsync().catch(function (error) {
        availableFontsPromise = null;
        throw error;
      });
    }

    return availableFontsPromise;
  }

  async function getImageTextOverlayAvailableFontsSafely() {
    try {
      return await getImageTextOverlayAvailableFonts();
    } catch (error) {
      return [];
    }
  }

  function normalizeImageTextOverlayFontToken(value) {
    return typeof value === "string" ? value.trim().toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  }

  function tagImageTextOverlayNode(node, role) {
    if (!node || typeof node.setPluginData !== "function") {
      return;
    }

    try {
      node.setPluginData("__pigmaTextOverlay", "1");
      node.setPluginData("__pigmaTextOverlayRole", String(role || ""));
    } catch (error) {}
  }

  async function replaceSelectionImageFills(session, newImageHash, byteLength) {
    const skipped = [];
    const appliedNodeIds = {};
    let appliedFillCount = 0;

    for (let index = 0; index < session.usages.length; index += 1) {
      const usage = session.usages[index];
      const node = await figma.getNodeByIdAsync(usage.nodeId);
      if (!node || node.removed) {
        skipped.push({
          nodeId: usage.nodeId,
          nodeName: usage.nodeName,
          reason: IMAGE_NODE_UNAVAILABLE_REASON,
        });
        continue;
      }

      const fills = getNodeFills(node);
      if (!fills.length) {
        skipped.push({
          nodeId: usage.nodeId,
          nodeName: safeName(node),
          reason: IMAGE_FILL_LIST_EMPTY_REASON,
        });
        continue;
      }

      let targetIndex = -1;
      if (usage.fillIndex >= 0 && usage.fillIndex < fills.length) {
        const directFill = fills[usage.fillIndex];
        if (isImagePaint(directFill) && directFill.imageHash === session.originalHash) {
          targetIndex = usage.fillIndex;
        }
      }

      if (targetIndex < 0) {
        const fillIndices = getFillIndicesInUiOrder(fills);
        for (let orderedFillIndex = 0; orderedFillIndex < fillIndices.length; orderedFillIndex += 1) {
          const fillIndex = fillIndices[orderedFillIndex];
          const fill = fills[fillIndex];
          if (isImagePaint(fill) && fill.imageHash === session.originalHash) {
            targetIndex = fillIndex;
            break;
          }
        }
      }

      if (targetIndex < 0) {
        skipped.push({
          nodeId: usage.nodeId,
          nodeName: safeName(node),
          reason: IMAGE_FILL_HASH_MISMATCH_REASON,
        });
        continue;
      }

      const nextFills = fills.slice();
      const originalFill = nextFills[targetIndex];
      const hiddenOriginalFill = cloneImagePaintWithHashAndVisibility(originalFill, session.originalHash, false);
      const newVisibleFill = cloneImagePaintWithHashAndVisibility(originalFill, newImageHash, true);
      nextFills.splice(targetIndex, 1, hiddenOriginalFill, newVisibleFill);

      try {
        node.fills = nextFills;
        appliedFillCount += 1;
        appliedNodeIds[node.id] = safeName(node);
      } catch (error) {
        skipped.push({
          nodeId: usage.nodeId,
          nodeName: safeName(node),
          reason: normalizeErrorMessage(error, IMAGE_FILL_UPDATE_ERROR_MESSAGE),
        });
      }
    }

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: session.selectionLabel,
        targetNodeName: session.targetNodeName,
        originalImageHash: session.originalHash,
        newImageHash: newImageHash,
        appliedFillCount: appliedFillCount,
        appliedNodeCount: Object.keys(appliedNodeIds).length,
        skippedCount: skipped.length,
        resultByteLength: byteLength,
      },
      skipped: skipped.slice(0, 24),
    };
  }

  async function applyGeneratedImageToShapeNode(session, newImageHash, byteLength) {
    const skipped = [];
    let appliedFillCount = 0;
    const node = await figma.getNodeByIdAsync(session.targetNodeId);
    if (!isPromptEditableShapeNode(node)) {
      skipped.push({
        nodeId: session.targetNodeId,
        nodeName: session.targetNodeName,
        reason: SHAPE_TARGET_UNAVAILABLE_REASON,
      });
    } else {
      const fills = getNodeFills(node);
      const nextFills = fills.map(function (fill) {
        return clonePaintWithVisibility(fill, false);
      });
      nextFills.push(buildVisibleImageFill(newImageHash));

      try {
        node.fills = nextFills;
        appliedFillCount = 1;
      } catch (error) {
        skipped.push({
          nodeId: session.targetNodeId,
          nodeName: safeName(node),
          reason: normalizeErrorMessage(error, SHAPE_FILL_APPLY_ERROR_MESSAGE),
        });
      }
    }

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: session.selectionLabel,
        targetNodeName: session.targetNodeName,
        newImageHash: newImageHash,
        appliedFillCount: appliedFillCount,
        appliedNodeCount: appliedFillCount ? 1 : 0,
        skippedCount: skipped.length,
        resultByteLength: byteLength,
      },
      skipped: skipped.slice(0, 24),
    };
  }

  function notifyApplyResult(result) {
    const summary = result && result.summary ? result.summary : {};
    const appliedFillCount =
      typeof summary.appliedFillCount === "number" && Number.isFinite(summary.appliedFillCount)
        ? summary.appliedFillCount
        : 0;
    const skippedCount =
      typeof summary.skippedCount === "number" && Number.isFinite(summary.skippedCount) ? summary.skippedCount : 0;

    if (!appliedFillCount) {
      figma.notify("Could not find an IMAGE fill to replace.", { timeout: 2200 });
      return;
    }

    let message = "Image upscale applied (" + appliedFillCount + " fill replaced";
    if (skippedCount > 0) {
      message += ", " + skippedCount + " skipped";
    }
    figma.notify(message + ")", { timeout: 2600 });
  }

  function clonePaintWithVisibility(fill, visible) {
    const cloned = JSON.parse(JSON.stringify(fill));
    cloned.visible = visible !== false;
    return cloned;
  }

  function cloneImagePaintWithHashAndVisibility(fill, imageHash, visible) {
    const cloned = clonePaintWithVisibility(fill, visible);
    cloned.imageHash = imageHash;
    return cloned;
  }

  function cloneImagePaintWithHash(fill, imageHash) {
    return cloneImagePaintWithHashAndVisibility(fill, imageHash, true);
  }

  function buildVisibleImageFill(imageHash) {
    return {
      type: "IMAGE",
      imageHash: imageHash,
      scaleMode: "FILL",
      visible: true,
    };
  }

  function cloneBoundsFitImagePaint(fill, imageHash) {
    const cloned = cloneImagePaintWithHash(fill, imageHash);
    cloned.scaleMode = "FILL";
    if ("imageTransform" in cloned) {
      delete cloned.imageTransform;
    }
    if ("scalingFactor" in cloned) {
      delete cloned.scalingFactor;
    }
    if ("rotation" in cloned) {
      delete cloned.rotation;
    }
    return cloned;
  }

  function notifyApplyResult(result, operationLabel) {
    const summary = result && result.summary ? result.summary : {};
    const appliedFillCount =
      typeof summary.appliedFillCount === "number" && Number.isFinite(summary.appliedFillCount)
        ? summary.appliedFillCount
        : 0;
    const skippedCount =
      typeof summary.skippedCount === "number" && Number.isFinite(summary.skippedCount) ? summary.skippedCount : 0;

    if (!appliedFillCount) {
      figma.notify("AI image result could not find an IMAGE fill to apply.", { timeout: 2200 });
      return;
    }

    let message = (operationLabel || "AI Image") + " complete (" + appliedFillCount + " fill applied";
    if (skippedCount > 0) {
      message += ", " + skippedCount + " skipped";
    }
    figma.notify(message + ")", { timeout: 2600 });
  }

  function sanitizeOperationLabel(value) {
    const label = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    return label || "AI Image";
  }

  function sanitizeSourceMode(value) {
    const mode = typeof value === "string" ? value.replace(/\s+/g, " ").trim().toLowerCase() : "";
    return mode === "shape-or-image" ? mode : "image-fill-only";
  }

  async function collectReferenceSearchSourceFromSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error(IMAGE_TASK_NO_SELECTION_MESSAGE);
    }

    const selectedRangeText = getSelectedTextRangeSnapshot();
    if (selectedRangeText) {
      return {
        sourceType: "text",
        text: selectedRangeText.text,
        summary: {
          selectionLabel: selectedRangeText.selectionLabel,
          targetNodeName: selectedRangeText.nodeName,
          textMode: "selected-range",
          textLength: selectedRangeText.text.length,
        },
      };
    }

    if (selection.every(function (node) { return node && node.type === "TEXT"; })) {
      const directText = collectReferenceTextFromNodes(selection, {
        maxNodes: 6,
        maxLength: 480,
        includeDescendants: false,
      });
      if (directText) {
        return {
          sourceType: "text",
          text: directText,
          summary: {
            selectionLabel: formatSelectionLabel(selection),
            targetNodeName: safeName(selection[0]),
            textMode: "text-selection",
            textLength: directText.length,
          },
        };
      }
    }

    let imageTarget = null;
    try {
      imageTarget = collectSingleUpscaleTargetFromSelection();
    } catch (error) {
      imageTarget = null;
    }

    if (imageTarget) {
      return await buildReferenceImageSource(imageTarget);
    }

    const fallbackText = collectReferenceTextFromNodes(selection, {
      maxNodes: 8,
      maxLength: 560,
      includeDescendants: true,
    });
    if (fallbackText) {
      return {
        sourceType: "text",
        text: fallbackText,
        summary: {
          selectionLabel: formatSelectionLabel(selection),
          targetNodeName: safeName(selection[0]),
          textMode: "selection-descendants",
          textLength: fallbackText.length,
        },
      };
    }

    throw new Error(REFERENCE_SOURCE_NOT_FOUND_MESSAGE);
  }

  function getSelectedTextRangeSnapshot() {
    const page = figma.currentPage;
    const selectedTextRange = page && "selectedTextRange" in page ? page.selectedTextRange : null;
    if (!selectedTextRange || !selectedTextRange.node || selectedTextRange.node.removed || selectedTextRange.node.type !== "TEXT") {
      return null;
    }

    const characters = typeof selectedTextRange.node.characters === "string" ? selectedTextRange.node.characters : "";
    const start = Math.max(0, Math.floor(Number(selectedTextRange.start) || 0));
    const end = Math.max(start, Math.floor(Number(selectedTextRange.end) || 0));
    const text = normalizeReferenceText(characters.slice(start, end), 480);
    if (!text) {
      return null;
    }

    return {
      text: text,
      nodeName: safeName(selectedTextRange.node),
      selectionLabel: safeName(selectedTextRange.node),
    };
  }

  function collectReferenceTextFromNodes(nodes, options) {
    const list = Array.isArray(nodes) ? nodes : [];
    const maxNodes =
      options && Number(options.maxNodes) > 0 ? Math.max(1, Math.floor(Number(options.maxNodes))) : 6;
    const maxLength =
      options && Number(options.maxLength) > 0 ? Math.max(80, Math.floor(Number(options.maxLength))) : 480;
    const includeDescendants = !(options && options.includeDescendants === false);
    const parts = [];
    const seen = {};

    function visit(node) {
      if (!node || node.removed || parts.length >= maxNodes) {
        return;
      }
      if ("visible" in node && node.visible === false) {
        return;
      }

      if (node.type === "TEXT" && typeof node.characters === "string") {
        const text = normalizeReferenceText(node.characters, Math.max(40, Math.min(200, maxLength)));
        if (text && !seen[text]) {
          seen[text] = true;
          parts.push(text);
        }
      }

      if (includeDescendants && hasChildren(node)) {
        for (let index = 0; index < node.children.length; index += 1) {
          visit(node.children[index]);
          if (parts.length >= maxNodes) {
            break;
          }
        }
      }
    }

    for (let index = 0; index < list.length; index += 1) {
      visit(list[index]);
      if (parts.length >= maxNodes) {
        break;
      }
    }

    return normalizeReferenceText(parts.join(" / "), maxLength);
  }

  function normalizeReferenceText(value, maxLength) {
    const normalized = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    if (!normalized) {
      return "";
    }
    const limit = Number(maxLength) > 0 ? Math.floor(Number(maxLength)) : 0;
    if (!limit || normalized.length <= limit) {
      return normalized;
    }
    return normalized.slice(0, Math.max(0, limit - 1)).trim() + "...";
  }

  async function buildReferenceImageSource(target) {
    const summary = {
      selectionLabel: formatSelectionLabel(target.selection),
      targetNodeName: target.entry.nodeName,
      imageHash: target.entry.imageHash,
      captureMode: "rendered-node",
      byteLength: 0,
    };
    let bytes = new Uint8Array(0);
    let mimeType = "image/png";
    let fileName = buildFileName(target.entry, "png");

    const node = await figma.getNodeByIdAsync(target.entry.nodeId);
    if (node && !node.removed && typeof node.exportAsync === "function") {
      try {
        bytes = await node.exportAsync({
          format: "PNG",
          useAbsoluteBounds: false,
        });
      } catch (error) {
        bytes = new Uint8Array(0);
      }
    }

    if (!bytes.length) {
      const image = figma.getImageByHash(target.entry.imageHash);
      if (!image) {
        throw new Error("Could not find the selected IMAGE fill source.");
      }
      bytes = await image.getBytesAsync();
      if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
        throw new Error("Could not read the selected IMAGE fill bytes.");
      }
      const extension = detectImageExtension(bytes);
      mimeType = detectImageMimeType(bytes);
      fileName = buildFileName(target.entry, extension === "bin" ? "png" : extension);
      summary.captureMode = "source-image";
    }

    summary.byteLength = bytes.length;

    return {
      sourceType: "image",
      image: {
        bytes: bytes,
        mimeType: mimeType,
        fileName: fileName,
      },
      summary: summary,
    };
  }

  async function collectImageTextOverlaySourceFromSelection(message) {
    let overlayReason = "";

    try {
      const target = await collectTextOverlayApplyTargetFromSelection();
      const source = await buildImageTextOverlaySourceFromTarget(target);
      const sessionId = buildTextOverlaySessionId();
      const overlaySession = {
        id: sessionId,
        clientRequestId: sanitizeClientRequestId(message && message.clientRequestId),
        operationLabel: sanitizeOperationLabel(message && message.operationLabel),
        selectionLabel: target.selectionLabel,
        targetNodeId: target.nodeId,
        targetNodeName: target.nodeName,
        preparedAt: new Date().toISOString(),
      };

      source.summary = source.summary || {};
      source.summary.canCreateOverlay = true;
      source.summary.overlayReason = "";
      source.summary.overlayMode = "group-selection";
      return {
        source: source,
        overlaySession: overlaySession,
      };
    } catch (error) {
      overlayReason = normalizeErrorMessage(error, "");
    }

    const fallbackSource = await collectReferenceSearchSourceFromSelection();
    if (!fallbackSource.summary || typeof fallbackSource.summary !== "object") {
      fallbackSource.summary = {};
    }
    fallbackSource.summary.canCreateOverlay = false;
    fallbackSource.summary.overlayReason = overlayReason;
    fallbackSource.summary.overlayMode = "";
    return {
      source: fallbackSource,
      overlaySession: null,
    };
  }

  async function collectTextOverlayApplyTargetFromSelection(selectionInput) {
    const selection = Array.isArray(selectionInput) ? selectionInput.filter(Boolean) : Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("Select a frame, group, or image layer first.");
    }

    if (selection.length !== 1) {
      throw new Error("Text overlay currently supports exactly one selected layer.");
    }

    const node = selection[0];
    if (!node || node.removed) {
      throw new Error("Could not read the selected layer.");
    }

    if ("locked" in node && node.locked) {
      throw new Error("Locked layers are not supported for text overlay.");
    }

    if ("rotation" in node && typeof node.rotation === "number" && Math.abs(node.rotation) > 0.01) {
      throw new Error("Rotated layers are not supported for text overlay yet.");
    }

    if (!node.parent || !canUseImageExtendParent(node.parent)) {
      throw new Error("The current parent container does not support grouping the text overlay result.");
    }

    if (
      "layoutMode" in node.parent &&
      typeof node.parent.layoutMode === "string" &&
      node.parent.layoutMode !== "NONE"
    ) {
      throw new Error("Auto-layout parents are not supported for text overlay yet.");
    }

    if (typeof node.exportAsync !== "function") {
      throw new Error("The selected layer cannot be exported for text overlay.");
    }

    const localBounds = getImageExtendLocalBounds(node);
    if (!localBounds) {
      throw new Error("Could not determine the selected layer bounds.");
    }

    return {
      selection: selection,
      selectionLabel: formatSelectionLabel(selection),
      nodeId: node.id,
      nodeName: safeName(node),
      localBounds: localBounds,
    };
  }

  async function buildImageTextOverlaySourceFromTarget(target) {
    const node = await figma.getNodeByIdAsync(target.nodeId);
    if (!node || node.removed || typeof node.exportAsync !== "function") {
      throw new Error("Could not export the selected layer for text overlay.");
    }

    const bytes = await node.exportAsync({
      format: "PNG",
      useAbsoluteBounds: false,
    });
    if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
      throw new Error("The selected layer export is empty.");
    }

    return {
      sourceType: "image",
      image: {
        bytes: bytes,
        mimeType: "image/png",
        fileName: buildFileName(
          {
            nodeName: target.nodeName,
            imageHash: target.nodeId,
          },
          "png"
        ),
      },
      summary: {
        selectionLabel: target.selectionLabel,
        targetNodeName: target.nodeName,
        captureMode: "rendered-node",
        targetWidth: target.localBounds.width,
        targetHeight: target.localBounds.height,
        byteLength: bytes.length,
      },
    };
  }

  function sanitizeReferenceSearchQuery(value) {
    const normalized = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    return normalized ? normalized.slice(0, 120) : "";
  }

  function summarizeReferenceSearchQuery(query) {
    const text = sanitizeReferenceSearchQuery(query);
    if (text.length <= 44) {
      return text;
    }
    return text.slice(0, 43) + "...";
  }

  async function collectBoundsFitTargetsFromSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("Select a frame, group, or layer first.");
    }

    const targets = [];
    const skipped = [];

    for (let index = 0; index < selection.length; index += 1) {
      const analysis = await analyzeBoundsFitSelectionNode(selection[index]);
      if (analysis && analysis.target) {
        targets.push(analysis.target);
      } else if (analysis && analysis.skipped) {
        skipped.push(analysis.skipped);
      }
    }

    return {
      selection: selection,
      targets: targets,
      skipped: skipped,
    };
  }

  async function collectImageCompositeTargetsFromSelection() {
    const selection = Array.from(figma.currentPage.selection || []).filter(Boolean);
    if (!selection.length) {
      throw new Error("Select 2 to 5 image layers first.");
    }
    const candidateNodes = collectImageCompositeCandidateNodes(selection);

    const layers = [];
    const skipped = [];

    for (let index = 0; index < candidateNodes.length; index += 1) {
      const analysis = await analyzeImageCompositeSelectionNode(candidateNodes[index]);
      if (analysis && analysis.target) {
        layers.push(analysis.target);
      } else if (analysis && analysis.skipped) {
        skipped.push(analysis.skipped);
      }
    }

    if (layers.length > 5) {
      throw new Error("Image composite currently supports up to 5 eligible image layers.");
    }

    layers.sort(function (left, right) {
      return compareSceneNodeCanvasOrder(left.node, right.node);
    });

    const unionRect = unionAbsoluteRects(
      layers.map(function (layer) {
        return layer.visibleRect;
      })
    );
    if (!unionRect) {
      throw new Error(buildImageCompositeEmptySelectionMessage(layers, skipped));
    }

    for (let index = 0; index < layers.length; index += 1) {
      const layer = layers[index];
      layer.role = index === 0 ? "background" : "foreground";
      layer.orderIndex = index;
      layer.offsetX = roundBoundsFitMetric(layer.visibleRect.x - unionRect.x);
      layer.offsetY = roundBoundsFitMetric(layer.visibleRect.y - unionRect.y);
    }

    return {
      selection: selection,
      layers: layers,
      skipped: skipped,
      unionRect: unionRect,
    };
  }

  function collectImageCompositeCandidateNodes(selection) {
    const result = [];
    const seen = {};
    for (let index = 0; index < selection.length; index += 1) {
      appendImageCompositeCandidateNode(selection[index], result, seen);
    }
    return result;
  }

  function appendImageCompositeCandidateNode(node, result, seen) {
    if (!node || node.removed || !Array.isArray(result) || !seen) {
      return;
    }

    if (hasChildren(node)) {
      for (let index = 0; index < node.children.length; index += 1) {
        appendImageCompositeCandidateNode(node.children[index], result, seen);
      }
      return;
    }

    if (seen[node.id]) {
      return;
    }

    seen[node.id] = true;
    result.push(node);
  }

  function roundBoundsFitMetric(value) {
    return Math.round((Number(value) || 0) * 1000) / 1000;
  }

  function unionAbsoluteRects(rects) {
    if (!Array.isArray(rects) || !rects.length) {
      return null;
    }

    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;

    for (let index = 0; index < rects.length; index += 1) {
      const rect = rects[index];
      if (!rect) {
        continue;
      }
      left = Math.min(left, rect.x);
      top = Math.min(top, rect.y);
      right = Math.max(right, rect.x + rect.width);
      bottom = Math.max(bottom, rect.y + rect.height);
    }

    const width = right - left;
    const height = bottom - top;
    if (!(width > 0) || !(height > 0) || !Number.isFinite(left) || !Number.isFinite(top)) {
      return null;
    }

    return {
      x: roundBoundsFitMetric(left),
      y: roundBoundsFitMetric(top),
      width: roundBoundsFitMetric(width),
      height: roundBoundsFitMetric(height),
    };
  }

  function getBoundsFitNodeRect(node) {
    const rect =
      node && node.absoluteBoundingBox
        ? node.absoluteBoundingBox
        : node && node.absoluteRenderBounds
          ? node.absoluteRenderBounds
          : null;
    if (!rect) {
      return null;
    }

    const width = Number(rect.width) || 0;
    const height = Number(rect.height) || 0;
    if (!(width > 0) || !(height > 0)) {
      return null;
    }

    return {
      x: roundBoundsFitMetric(rect.x),
      y: roundBoundsFitMetric(rect.y),
      width: roundBoundsFitMetric(width),
      height: roundBoundsFitMetric(height),
    };
  }

  function intersectBoundsFitRects(baseRect, clipRect) {
    if (!baseRect || !clipRect) {
      return null;
    }

    const left = Math.max(baseRect.x, clipRect.x);
    const top = Math.max(baseRect.y, clipRect.y);
    const right = Math.min(baseRect.x + baseRect.width, clipRect.x + clipRect.width);
    const bottom = Math.min(baseRect.y + baseRect.height, clipRect.y + clipRect.height);
    const width = right - left;
    const height = bottom - top;

    if (!(width > 0) || !(height > 0)) {
      return null;
    }

    return {
      x: roundBoundsFitMetric(left),
      y: roundBoundsFitMetric(top),
      width: roundBoundsFitMetric(width),
      height: roundBoundsFitMetric(height),
    };
  }

  function areBoundsFitRectsEqual(leftRect, rightRect) {
    if (!leftRect || !rightRect) {
      return false;
    }

    return (
      Math.abs(leftRect.x - rightRect.x) <= 0.01 &&
      Math.abs(leftRect.y - rightRect.y) <= 0.01 &&
      Math.abs(leftRect.width - rightRect.width) <= 0.01 &&
      Math.abs(leftRect.height - rightRect.height) <= 0.01
    );
  }

  function getBoundsFitAnalysisContext(node) {
    const nodeRect = getBoundsFitNodeRect(node);
    if (!nodeRect) {
      return null;
    }

    let visibleRect = {
      x: nodeRect.x,
      y: nodeRect.y,
      width: nodeRect.width,
      height: nodeRect.height,
    };
    let clipped = false;
    let current = node.parent;

    while (current) {
      if ("clipsContent" in current && current.clipsContent === true) {
        const clipRect = getBoundsFitNodeRect(current);
        if (clipRect) {
          const nextVisibleRect = intersectBoundsFitRects(visibleRect, clipRect);
          if (!nextVisibleRect) {
            return null;
          }
          if (!areBoundsFitRectsEqual(nextVisibleRect, visibleRect)) {
            clipped = true;
          }
          visibleRect = nextVisibleRect;
        }
      }
      current = current.parent;
    }

    return {
      nodeRect: nodeRect,
      visibleRect: visibleRect,
      clipped: clipped,
      offsetX: roundBoundsFitMetric(visibleRect.x - nodeRect.x),
      offsetY: roundBoundsFitMetric(visibleRect.y - nodeRect.y),
    };
  }

  function positionBoundsFitPreviewClone(sourceNode, clonedNode, visibleRect) {
    if (
      "relativeTransform" in clonedNode &&
      Array.isArray(clonedNode.relativeTransform) &&
      Array.isArray(sourceNode.absoluteTransform) &&
      sourceNode.absoluteTransform.length >= 2
    ) {
      clonedNode.relativeTransform = [
        [
          sourceNode.absoluteTransform[0][0],
          sourceNode.absoluteTransform[0][1],
          roundBoundsFitMetric(sourceNode.absoluteTransform[0][2] - visibleRect.x),
        ],
        [
          sourceNode.absoluteTransform[1][0],
          sourceNode.absoluteTransform[1][1],
          roundBoundsFitMetric(sourceNode.absoluteTransform[1][2] - visibleRect.y),
        ],
      ];
      return;
    }

    if ("x" in clonedNode && typeof clonedNode.x === "number" && "y" in clonedNode && typeof clonedNode.y === "number") {
      clonedNode.x = roundBoundsFitMetric(-visibleRect.x);
      clonedNode.y = roundBoundsFitMetric(-visibleRect.y);
      return;
    }

    throw new Error("Could not position the preview clone for bounds-fit analysis.");
  }

  async function exportBoundsFitRenderedAnalysisBytes(node, analysisContext) {
    const visibleRect = analysisContext && analysisContext.visibleRect ? analysisContext.visibleRect : null;
    if (!visibleRect) {
      return new Uint8Array(0);
    }

    if (!analysisContext.clipped) {
      return await node.exportAsync({
        format: "PNG",
        useAbsoluteBounds: false,
      });
    }

    const preview = figma.createFrame();
    let clonedNode = null;

    try {
      preview.name = "__pigma-bounds-fit-preview__";
      preview.resize(visibleRect.width, visibleRect.height);
      preview.clipsContent = true;
      preview.fills = [];
      preview.strokes = [];
      preview.x = visibleRect.x;
      preview.y = visibleRect.y;
      figma.currentPage.appendChild(preview);

      clonedNode = node.clone();
      preview.appendChild(clonedNode);
      positionBoundsFitPreviewClone(node, clonedNode, visibleRect);

      return await preview.exportAsync({
        format: "PNG",
        useAbsoluteBounds: false,
      });
    } finally {
      if (preview && !preview.removed) {
        preview.remove();
      }
      if (clonedNode && !clonedNode.removed) {
        clonedNode.remove();
      }
    }
  }

  async function analyzeBoundsFitSelectionNode(node) {
    if (!node || node.removed) {
      return buildBoundsFitSkipped(node, "The selected image layer could not be read.");
    }

    if (hasChildren(node)) {
      return buildBoundsFitSkipped(node, "Bounds-fit does not support frames, groups, or layers with children yet.");
    }

    if ("locked" in node && node.locked) {
      return buildBoundsFitSkipped(node, "Locked image layers are not supported for bounds-fit.");
    }

    if (!("resize" in node) || typeof node.resize !== "function") {
      return buildBoundsFitSkipped(node, "Bounds-fit only supports image layers that can be resized directly.");
    }

    if ("rotation" in node && typeof node.rotation === "number" && Math.abs(node.rotation) > 0.01) {
      return buildBoundsFitSkipped(node, "Rotated image layers are not supported yet.");
    }

    if (
      node.parent &&
      "layoutMode" in node.parent &&
      typeof node.parent.layoutMode === "string" &&
      node.parent.layoutMode !== "NONE"
    ) {
      return buildBoundsFitSkipped(node, "Bounds-fit does not support image layers inside auto-layout parents yet.");
    }

    if (!hasSimpleVisibleImagePaint(node)) {
      return buildBoundsFitSkipped(node, "Bounds-fit requires a layer with exactly one visible IMAGE fill.");
    }

    if (hasVisiblePaints(node.strokes)) {
      return buildBoundsFitSkipped(node, "Image layers with visible strokes are not supported yet.");
    }

    if (hasVisibleEffects(node.effects)) {
      return buildBoundsFitSkipped(node, "Image layers with visible effects are not supported yet.");
    }

    const fills = getNodeFills(node);
    const fillIndex = getPrimaryVisibleImageFillIndex(fills);
    if (fillIndex < 0) {
      return buildBoundsFitSkipped(node, "Could not find an IMAGE fill.");
    }

    const fill = fills[fillIndex];

    const nodeWidth = typeof node.width === "number" && Number.isFinite(node.width) ? node.width : 0;
    const nodeHeight = typeof node.height === "number" && Number.isFinite(node.height) ? node.height : 0;
    if (!(nodeWidth > 0) || !(nodeHeight > 0)) {
      return buildBoundsFitSkipped(node, "Could not calculate the current layer size.");
    }

    const image = fill.imageHash ? figma.getImageByHash(fill.imageHash) : null;
    if (!image) {
      return buildBoundsFitSkipped(node, "Could not find the source image data.");
    }

    const size = await image.getSizeAsync();
    const sourceWidth = size && typeof size.width === "number" ? size.width : 0;
    const sourceHeight = size && typeof size.height === "number" ? size.height : 0;
    if (!(sourceWidth > 0) || !(sourceHeight > 0)) {
      return buildBoundsFitSkipped(node, "Could not read the source image size.");
    }

    const scaleMode = typeof fill.scaleMode === "string" ? fill.scaleMode : "FILL";
    const fillRotation = typeof fill.rotation === "number" && Number.isFinite(fill.rotation) ? fill.rotation : 0;
    const needsRenderedAnalysis =
      scaleMode === "CROP" ||
      scaleMode === "TILE" ||
      !!fill.imageTransform ||
      Math.abs(fillRotation) > 0.01 ||
      !hasMatchingAspectRatio(nodeWidth, nodeHeight, sourceWidth, sourceHeight);
    const analysisContext = needsRenderedAnalysis ? getBoundsFitAnalysisContext(node) : null;
    if (needsRenderedAnalysis && !analysisContext) {
      return buildBoundsFitSkipped(node, "Could not calculate the visible bounds for analysis.");
    }

    const bytes = needsRenderedAnalysis
      ? await exportBoundsFitRenderedAnalysisBytes(node, analysisContext)
      : await image.getBytesAsync();
    if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
      return buildBoundsFitSkipped(
        node,
        needsRenderedAnalysis ? "Could not export the currently visible image bytes." : "Could not read the source image bytes."
      );
    }

    return {
      target: {
        nodeId: node.id,
        nodeName: safeName(node),
        analysisMode: needsRenderedAnalysis ? "rendered-node" : "source-image",
        fillIndex: fillIndex,
        originalHash: fill.imageHash,
        sourceWidth: sourceWidth,
        sourceHeight: sourceHeight,
        analysisOffsetX: needsRenderedAnalysis ? analysisContext.offsetX : 0,
        analysisOffsetY: needsRenderedAnalysis ? analysisContext.offsetY : 0,
        analysisWidth: needsRenderedAnalysis ? analysisContext.visibleRect.width : nodeWidth,
        analysisHeight: needsRenderedAnalysis ? analysisContext.visibleRect.height : nodeHeight,
        fileName: buildFileName(
          {
            nodeName: safeName(node),
            imageHash: fill.imageHash,
          },
          "png"
        ),
        mimeType: needsRenderedAnalysis ? "image/png" : detectImageMimeType(bytes),
        bytes: bytes,
      },
    };
  }

  async function applyBoundsFitResultsToSelection(session, rawResults) {
    const normalizedResults = normalizeBoundsFitResults(rawResults);
    const resultByNodeId = {};
    const skipped = Array.isArray(session.skipped) ? session.skipped.slice() : [];
    let appliedCount = 0;
    let unchangedCount = 0;

    for (let index = 0; index < normalizedResults.length; index += 1) {
      const entry = normalizedResults[index];
      if (entry && entry.nodeId) {
        resultByNodeId[entry.nodeId] = entry;
      }
    }

    for (let index = 0; index < session.targets.length; index += 1) {
      const target = session.targets[index];
      const processed = resultByNodeId[target.nodeId];
      if (!processed) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          reason: "Did not receive a UI analysis result.",
        });
        continue;
      }

      if (processed.status === "unchanged") {
        unchangedCount += 1;
        continue;
      }

      if (processed.status !== "trimmed") {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          reason: processed.reason || "Could not find visible content bounds.",
        });
        continue;
      }

      const node = await figma.getNodeByIdAsync(target.nodeId);
      if (!node || node.removed) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          reason: "Could not find the layer again.",
        });
        continue;
      }

      if (!("resize" in node) || typeof node.resize !== "function") {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "This layer cannot be resized.",
        });
        continue;
      }

      const fills = getNodeFills(node);
      if (!fills.length) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "The IMAGE fill is no longer available.",
        });
        continue;
      }

      let targetIndex = -1;
      if (target.fillIndex >= 0 && target.fillIndex < fills.length) {
        const directFill = fills[target.fillIndex];
        if (isImagePaint(directFill) && directFill.imageHash === target.originalHash) {
          targetIndex = target.fillIndex;
        }
      }

      if (targetIndex < 0) {
        targetIndex = findVisibleImageFillIndexByHash(fills, target.originalHash);
      }

      if (targetIndex < 0) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "Could not find the IMAGE fill with the original image hash.",
        });
        continue;
      }

      const currentWidth = typeof node.width === "number" && Number.isFinite(node.width) ? node.width : 0;
      const currentHeight = typeof node.height === "number" && Number.isFinite(node.height) ? node.height : 0;
      if (!(currentWidth > 0) || !(currentHeight > 0)) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "Could not calculate the current layer size.",
        });
        continue;
      }

      const analysisWidth =
        Number(target.analysisWidth) > 0 ? Number(target.analysisWidth) : Number(currentWidth) > 0 ? Number(currentWidth) : 0;
      const analysisHeight =
        Number(target.analysisHeight) > 0 ? Number(target.analysisHeight) : Number(currentHeight) > 0 ? Number(currentHeight) : 0;
      const analysisOffsetX = Number.isFinite(Number(target.analysisOffsetX)) ? Number(target.analysisOffsetX) : 0;
      const analysisOffsetY = Number.isFinite(Number(target.analysisOffsetY)) ? Number(target.analysisOffsetY) : 0;
      if (!(analysisWidth > 0) || !(analysisHeight > 0)) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "Could not calculate the visible bounds size.",
        });
        continue;
      }

      if (!hasMatchingAspectRatio(analysisWidth, analysisHeight, processed.sourceWidth, processed.sourceHeight)) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "The analyzed crop aspect ratio no longer matches the source image.",
        });
        continue;
      }

      const bytes = normalizeBytes(processed.bytes);
      if (!bytes.length) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "The trimmed image bytes are empty.",
        });
        continue;
      }

      const cropWidth = Number(processed.cropWidth) || 0;
      const cropHeight = Number(processed.cropHeight) || 0;
      const cropX = Number(processed.cropX) || 0;
      const cropY = Number(processed.cropY) || 0;
      if (!(cropWidth > 0) || !(cropHeight > 0)) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "The trimmed image size is invalid.",
        });
        continue;
      }

      const scaleX = analysisWidth / processed.sourceWidth;
      const scaleY = analysisHeight / processed.sourceHeight;
      const nextWidth = Math.max(1, roundBoundsFitMetric(cropWidth * scaleX));
      const nextHeight = Math.max(1, roundBoundsFitMetric(cropHeight * scaleY));
      const shiftX = roundBoundsFitMetric(analysisOffsetX + cropX * scaleX);
      const shiftY = roundBoundsFitMetric(analysisOffsetY + cropY * scaleY);

      try {
        const createdImage = figma.createImage(bytes);
        const nextFills = fills.slice();
        nextFills[targetIndex] =
          target.analysisMode === "rendered-node"
            ? cloneBoundsFitImagePaint(nextFills[targetIndex], createdImage.hash)
            : cloneImagePaintWithHash(nextFills[targetIndex], createdImage.hash);
        node.fills = nextFills;
        applyBoundsFitGeometry(node, nextWidth, nextHeight, shiftX, shiftY);
        appliedCount += 1;
      } catch (error) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: normalizeErrorMessage(error, "Failed to apply bounds-fit."),
        });
      }
    }

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: session.selectionLabel,
        requestedCount: session.requestedCount,
        eligibleCount: session.targets.length,
        appliedCount: appliedCount,
        unchangedCount: unchangedCount,
        skippedCount: skipped.length,
      },
      skipped: skipped.slice(0, 24),
    };
  }

  function applyBoundsFitGeometry(node, width, height, shiftX, shiftY) {
    if ("x" in node && typeof node.x === "number" && "y" in node && typeof node.y === "number") {
      node.x = node.x + shiftX;
      node.y = node.y + shiftY;
    } else if ("relativeTransform" in node && Array.isArray(node.relativeTransform)) {
      node.relativeTransform = [
        [node.relativeTransform[0][0], node.relativeTransform[0][1], node.relativeTransform[0][2] + shiftX],
        [node.relativeTransform[1][0], node.relativeTransform[1][1], node.relativeTransform[1][2] + shiftY],
      ];
    } else if (shiftX !== 0 || shiftY !== 0) {
      throw new Error("Could not move the layer to the analyzed position.");
    }

    node.resize(width, height);
  }

  function normalizeBoundsFitResults(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map(function (entry) {
      return {
        nodeId: entry && typeof entry.nodeId === "string" ? entry.nodeId : "",
        status: entry && typeof entry.status === "string" ? entry.status : "",
        reason: entry && typeof entry.reason === "string" ? entry.reason : "",
        sourceWidth: entry && Number(entry.sourceWidth) > 0 ? Number(entry.sourceWidth) : 0,
        sourceHeight: entry && Number(entry.sourceHeight) > 0 ? Number(entry.sourceHeight) : 0,
        analysisOffsetX: entry && Number.isFinite(Number(entry.analysisOffsetX)) ? Number(entry.analysisOffsetX) : 0,
        analysisOffsetY: entry && Number.isFinite(Number(entry.analysisOffsetY)) ? Number(entry.analysisOffsetY) : 0,
        analysisWidth: entry && Number(entry.analysisWidth) > 0 ? Number(entry.analysisWidth) : 0,
        analysisHeight: entry && Number(entry.analysisHeight) > 0 ? Number(entry.analysisHeight) : 0,
        cropX: entry && Number.isFinite(Number(entry.cropX)) ? Number(entry.cropX) : 0,
        cropY: entry && Number.isFinite(Number(entry.cropY)) ? Number(entry.cropY) : 0,
        cropWidth: entry && Number(entry.cropWidth) > 0 ? Number(entry.cropWidth) : 0,
        cropHeight: entry && Number(entry.cropHeight) > 0 ? Number(entry.cropHeight) : 0,
        bytes: normalizeBytes(entry && entry.bytes),
      };
    });
  }

  function buildBoundsFitSkipped(node, reason) {
    return {
      skipped: {
        nodeId: node && typeof node.id === "string" ? node.id : "",
        nodeName: safeName(node),
        reason: reason,
      },
    };
  }

  function buildImageCompositeSkipped(node, reason) {
    return {
      skipped: {
        nodeId: node && typeof node.id === "string" ? node.id : "",
        nodeName: safeName(node),
        reason: reason,
      },
    };
  }

  function buildBoundsFitEmptySelectionMessage(skipped) {
    if (Array.isArray(skipped) && skipped.length > 0) {
      const first = skipped[0];
      if (first && typeof first.reason === "string" && first.reason.trim()) {
        return first.reason.trim();
      }
    }
    return "Could not find an eligible image layer for bounds-fit.";
  }

  function buildImageCompositeEmptySelectionMessage(layers, skipped) {
    if (Array.isArray(layers) && layers.length === 1) {
      return "Image composite requires at least 2 eligible image layers.";
    }

    if (Array.isArray(skipped) && skipped.length > 0 && (!Array.isArray(layers) || !layers.length)) {
      const first = skipped[0];
      if (first && typeof first.reason === "string" && first.reason.trim()) {
        return first.reason.trim();
      }
    }

    return "Could not find 2 to 5 eligible image layers for image composite.";
  }

  async function analyzeImageCompositeSelectionNode(node) {
    if (!node || node.removed) {
      return buildImageCompositeSkipped(node, "The selected image layer could not be read.");
    }

    if (hasChildren(node)) {
      return buildImageCompositeSkipped(node, "Image composite does not support frames, groups, or layers with children yet.");
    }

    if ("locked" in node && node.locked) {
      return buildImageCompositeSkipped(node, "Locked image layers are not supported for image composite.");
    }

    if (typeof node.exportAsync !== "function") {
      return buildImageCompositeSkipped(node, "The selected layer cannot be exported for image composite.");
    }

    if ("rotation" in node && typeof node.rotation === "number" && Math.abs(node.rotation) > 0.01) {
      return buildImageCompositeSkipped(node, "Rotated image layers are not supported yet.");
    }

    if (!hasSimpleVisibleImagePaint(node)) {
      return buildImageCompositeSkipped(node, "Image composite requires layers with exactly one visible IMAGE fill.");
    }

    if (hasVisiblePaints(node.strokes)) {
      return buildImageCompositeSkipped(node, "Image layers with visible strokes are not supported yet.");
    }

    if (hasVisibleEffects(node.effects)) {
      return buildImageCompositeSkipped(node, "Image layers with visible effects are not supported yet.");
    }

    const fills = getNodeFills(node);
    const fillIndex = getPrimaryVisibleImageFillIndex(fills);
    if (fillIndex < 0) {
      return buildImageCompositeSkipped(node, "Could not find an IMAGE fill.");
    }

    const analysisContext = getBoundsFitAnalysisContext(node);
    if (!analysisContext || !analysisContext.visibleRect) {
      return buildImageCompositeSkipped(node, "Could not calculate the visible bounds for the selected layer.");
    }

    const bytes = await exportBoundsFitRenderedAnalysisBytes(node, analysisContext);
    if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
      return buildImageCompositeSkipped(node, "Could not export the current layer as PNG.");
    }

    const fill = fills[fillIndex];
    return {
      target: {
        node: node,
        nodeId: node.id,
        nodeName: safeName(node),
        fillIndex: fillIndex,
        originalHash: fill && typeof fill.imageHash === "string" ? fill.imageHash : "",
        visibleRect: analysisContext.visibleRect,
        fileName: buildFileName(
          {
            nodeName: safeName(node),
            imageHash: fill && fill.imageHash ? fill.imageHash : node.id,
          },
          "png"
        ),
        mimeType: "image/png",
        bytes: bytes,
      },
    };
  }

  function hasSimpleVisibleImagePaint(node) {
    const fills = getNodeFills(node);
    let visibleImageCount = 0;
    let visibleOtherCount = 0;

    for (let index = 0; index < fills.length; index += 1) {
      const fill = fills[index];
      if (!fill || fill.visible === false) {
        continue;
      }
      if (fill.type === "IMAGE") {
        visibleImageCount += 1;
      } else {
        visibleOtherCount += 1;
      }
    }

    return visibleImageCount === 1 && visibleOtherCount === 0;
  }

  function isPromptEditableShapeNode(node) {
    return (
      !!node &&
      !node.removed &&
      node.type !== "TEXT" &&
      (!("locked" in node) || !node.locked) &&
      !hasChildren(node) &&
      "fills" in node &&
      Array.isArray(node.fills) &&
      typeof node.exportAsync === "function"
    );
  }

  function getPrimaryVisibleImageFillIndex(fills) {
    const fillIndices = getFillIndicesInUiOrder(fills);
    for (let index = 0; index < fillIndices.length; index += 1) {
      const fillIndex = fillIndices[index];
      const fill = fills[fillIndex];
      if (isImagePaint(fill) && fill.imageHash) {
        return fillIndex;
      }
    }
    return -1;
  }

  function findVisibleImageFillIndexByHash(fills, imageHash) {
    const fillIndices = getFillIndicesInUiOrder(fills);
    for (let index = 0; index < fillIndices.length; index += 1) {
      const fillIndex = fillIndices[index];
      const fill = fills[fillIndex];
      if (isImagePaint(fill) && fill.imageHash === imageHash) {
        return fillIndex;
      }
    }
    return -1;
  }

  function hasVisiblePaints(paints) {
    if (!Array.isArray(paints) || !paints.length) {
      return false;
    }

    for (let index = 0; index < paints.length; index += 1) {
      const paint = paints[index];
      if (paint && paint.visible !== false) {
        return true;
      }
    }

    return false;
  }

  function hasVisibleEffects(effects) {
    if (!Array.isArray(effects) || !effects.length) {
      return false;
    }

    for (let index = 0; index < effects.length; index += 1) {
      const effect = effects[index];
      if (effect && effect.visible !== false) {
        return true;
      }
    }

    return false;
  }

  function hasMatchingAspectRatio(nodeWidth, nodeHeight, sourceWidth, sourceHeight) {
    if (!(nodeWidth > 0) || !(nodeHeight > 0) || !(sourceWidth > 0) || !(sourceHeight > 0)) {
      return false;
    }

    const nodeAspect = nodeWidth / nodeHeight;
    const sourceAspect = sourceWidth / sourceHeight;
    return Math.abs(nodeAspect - sourceAspect) <= 0.02;
  }

  function buildBoundsFitSessionId() {
    return "image-bounds-fit-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function buildImageExtendSessionId() {
    return "image-extend-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function buildImageCompositeSessionId() {
    return "image-composite-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function buildTextOverlaySessionId() {
    return "image-text-overlay-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function notifyBoundsFitResult(result, operationLabel) {
    const summary = result && result.summary ? result.summary : {};
    const appliedCount =
      typeof summary.appliedCount === "number" && Number.isFinite(summary.appliedCount) ? summary.appliedCount : 0;
    const unchangedCount =
      typeof summary.unchangedCount === "number" && Number.isFinite(summary.unchangedCount) ? summary.unchangedCount : 0;
    const skippedCount =
      typeof summary.skippedCount === "number" && Number.isFinite(summary.skippedCount) ? summary.skippedCount : 0;
    const label = operationLabel || "Bounds Fit";

    if (!appliedCount && unchangedCount > 0 && skippedCount === 0) {
      figma.notify("The selected image is already tightly fit to its visible bounds.", { timeout: 2200 });
      return;
    }

    if (!appliedCount && skippedCount > 0) {
      figma.notify(label + " could not find an eligible image layer to apply.", { timeout: 2200 });
      return;
    }

    let message = label + " complete (" + appliedCount + " applied";
    if (unchangedCount > 0) {
      message += ", " + unchangedCount + " unchanged";
    }
    if (skippedCount > 0) {
      message += ", " + skippedCount + " skipped";
    }
    message += ")";
    figma.notify(message, { timeout: 2600 });
  }

  function notifyImageExtendResult(result, operationLabel) {
    const summary = result && result.summary ? result.summary : {};
    const appliedCount =
      typeof summary.appliedCount === "number" && Number.isFinite(summary.appliedCount) ? summary.appliedCount : 0;
    const skippedCount =
      typeof summary.skippedCount === "number" && Number.isFinite(summary.skippedCount) ? summary.skippedCount : 0;
    const label = operationLabel || "Image Extend";

    if (!appliedCount) {
      figma.notify(label + " could not find an eligible image layer to apply.", { timeout: 2200 });
      return;
    }

    let message = label + " complete (" + appliedCount + " group created";
    if (skippedCount > 0) {
      message += ", " + skippedCount + " skipped";
    }
    message += ")";
    figma.notify(message, { timeout: 2600 });
  }

  function notifyImageCompositeResult(result, operationLabel) {
    const summary = result && result.summary ? result.summary : {};
    const appliedCount =
      typeof summary.appliedCount === "number" && Number.isFinite(summary.appliedCount) ? summary.appliedCount : 0;
    const skippedCount =
      typeof summary.skippedCount === "number" && Number.isFinite(summary.skippedCount) ? summary.skippedCount : 0;
    const label = operationLabel || "AI Composite";

    if (!appliedCount) {
      figma.notify(label + " could not create a composite layer.", { timeout: 2200 });
      return;
    }

    let message = label + " complete (" + appliedCount + " layer created";
    if (skippedCount > 0) {
      message += ", " + skippedCount + " skipped";
    }
    message += ")";
    figma.notify(message, { timeout: 2600 });
  }

  function buildImageCompositeResultName(selectionLabel) {
    const base = typeof selectionLabel === "string" && selectionLabel.trim() ? selectionLabel.trim() : "Selection";
    return base + " / AI composite";
  }

  function sanitizeClientRequestId(value) {
    const requestId = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    return requestId || "";
  }

  function looksLikeCorruptedImageText(value) {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) {
      return false;
    }

    if (/\?{2,}|\uFFFD/.test(text)) {
      return true;
    }

    const questionCount = (text.match(/\?/g) || []).length;
    const nonAsciiCount = (text.match(/[^\x00-\x7F]/g) || []).length;
    return questionCount >= 2 && nonAsciiCount >= 4;
  }

  function toKoreanImageErrorMessage(value, fallback) {
    const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    if (!text) {
      return fallback;
    }

    if (looksLikeCorruptedImageText(text)) {
      return fallback;
    }

    const provider = /openai/i.test(text) ? "OpenAI" : /gemini/i.test(text) ? "Gemini" : "AI";

    if (/(401|403|permission|forbidden|unauthori|auth|api key|credential)/i.test(text)) {
      return provider + " image request permission was denied. Check your API key or credentials.";
    }

    if (/(429|resource_exhausted|rate limit|quota|too many requests)/i.test(text)) {
      return provider + " image request hit a rate limit or quota. Please try again later.";
    }

    if (/(503|unavailable|high demand|overloaded|temporar|try again later|busy)/i.test(text)) {
      return provider + " image request is temporarily unavailable. Please try again later.";
    }

    if (/(payload|request size|20 ?mb|inline[_ ]data|aspect[_ -]?ratio|too large)/i.test(text)) {
      return provider + " image request is too large or uses an unsupported image setting. Try again with fewer or smaller layers.";
    }

    if (/(400|invalid_argument|unsupported|mime|format|image|size)/i.test(text)) {
      return provider + " image request format or input image is invalid. Check the request and try again.";
    }

    if (/(500|502|504|internal|backend|server)/i.test(text)) {
      return provider + " server error occurred while processing the image request. Please try again later.";
    }

    return text;
  }

  function normalizeBytes(value) {
    if (value instanceof Uint8Array) {
      return value;
    }

    if (value instanceof ArrayBuffer) {
      return new Uint8Array(value);
    }

    if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && ArrayBuffer.isView(value)) {
      return new Uint8Array(value.buffer);
    }

    if (Array.isArray(value)) {
      return new Uint8Array(value);
    }

    return new Uint8Array(0);
  }

  function isImagePaint(fill) {
    return !!fill && fill.visible !== false && fill.type === "IMAGE";
  }

  function getFillIndicesInUiOrder(fills) {
    const indices = [];
    if (!Array.isArray(fills) || !fills.length) {
      return indices;
    }

    // Reverse paint order so the Fill panel's top-most visible image wins first.
    for (let fillIndex = fills.length - 1; fillIndex >= 0; fillIndex -= 1) {
      indices.push(fillIndex);
    }

    return indices;
  }

  function getNodeFills(node) {
    if (!node || !("fills" in node) || !Array.isArray(node.fills)) {
      return [];
    }

    return node.fills;
  }

  function hasChildren(node) {
    return !!node && "children" in node && Array.isArray(node.children) && node.children.length > 0;
  }

  function detectImageExtension(bytes) {
    if (!bytes || typeof bytes.length !== "number" || bytes.length < 4) {
      return "bin";
    }

    if (
      bytes.length >= 8 &&
      bytes[0] === 137 &&
      bytes[1] === 80 &&
      bytes[2] === 78 &&
      bytes[3] === 71 &&
      bytes[4] === 13 &&
      bytes[5] === 10 &&
      bytes[6] === 26 &&
      bytes[7] === 10
    ) {
      return "png";
    }

    if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
      return "jpg";
    }

    if (bytes[0] === 71 && bytes[1] === 73 && bytes[2] === 70) {
      return "gif";
    }

    if (
      bytes.length >= 12 &&
      bytes[0] === 82 &&
      bytes[1] === 73 &&
      bytes[2] === 70 &&
      bytes[3] === 70 &&
      bytes[8] === 87 &&
      bytes[9] === 69 &&
      bytes[10] === 66 &&
      bytes[11] === 80
    ) {
      return "webp";
    }

    if (bytes[0] === 66 && bytes[1] === 77) {
      return "bmp";
    }

    return "bin";
  }

  function detectImageMimeType(bytes) {
    const extension = detectImageExtension(bytes);
    if (extension === "png") {
      return "image/png";
    }
    if (extension === "jpg") {
      return "image/jpeg";
    }
    if (extension === "webp") {
      return "image/webp";
    }
    if (extension === "gif") {
      return "image/gif";
    }
    if (extension === "bmp") {
      return "image/bmp";
    }
    return "application/octet-stream";
  }

  function buildFileName(entry, extension) {
    const baseName = sanitizeFileName(entry && entry.nodeName ? entry.nodeName : "figma-image");
    const hash = entry && typeof entry.imageHash === "string" ? entry.imageHash.slice(0, 8) : "image";
    return baseName + "-" + hash + "." + extension;
  }

  function sanitizeFileName(value) {
    const source = typeof value === "string" && value ? value : "figma-image";
    const trimmed = source.replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim();
    return trimmed ? trimmed.slice(0, 80) : "figma-image";
  }

  function formatSelectionLabel(selection) {
    if (!selection.length) {
      return "No selection";
    }

    if (selection.length === 1) {
      return safeName(selection[0]);
    }

    return safeName(selection[0]) + " +" + (selection.length - 1) + " more";
  }

  function buildSessionId() {
    return "ai-image-upscale-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function safeName(node) {
    if (node && typeof node.name === "string" && node.name.trim()) {
      return node.name.trim();
    }

    if (node && typeof node.type === "string" && node.type.trim()) {
      return node.type.trim();
    }

    return "Unnamed";
  }

  function normalizeErrorMessage(error, fallback) {
    if (error && typeof error === "object" && typeof error.message === "string" && error.message.trim()) {
      return toKoreanImageErrorMessage(error.message, fallback);
    }

    if (typeof error === "string" && error.trim()) {
      return toKoreanImageErrorMessage(error, fallback);
    }

    return fallback;
  }
})();
