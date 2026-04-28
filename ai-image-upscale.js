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
  let isPromptDraftPreparing = false;
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
  const BOUNDS_FIT_SOURCE_PREPARE_ERROR_MESSAGE = "Failed to prepare the bounds-fit source.";
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
  const PROMPT_DRAFT_SOURCE_PREPARE_ERROR_MESSAGE = "Failed to prepare the prompt draft source.";
  const PROMPT_DRAFT_SOURCE_NOT_FOUND_MESSAGE = "Select one image, frame, shape, or text layer to generate a prompt.";
  const PROMPT_SMART_SELECTION_MESSAGE = "Select at most one visual layer plus optional text layers for prompt edit/generation.";
  const PROMPT_MULTI_IMAGE_CONTAINER_MESSAGE =
    "Prompt edit/generation supports a frame only when it contains one main image plus optional text. Select a single image layer instead.";
  const PROMPT_TARGET_EXPORT_ERROR_MESSAGE = "Failed to export the selected layer for prompt edit/generation.";
  const PROMPT_TARGET_EXPORT_EMPTY_MESSAGE = "The selected layer export for prompt edit/generation was empty.";
  const PROMPT_PLACEMENT_APPLY_ERROR_MESSAGE = "Failed to place the generated prompt image.";
  const PROMPT_TEXT_ANCHOR_GAP = 24;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isAiImageUpscaleMessage(message)) {
      if (message.type === "request-ai-image-upscale-source") {
        await prepareUpscaleSource(message);
        return;
      }

      if (message.type === "request-ai-image-prompt-draft-source") {
        await preparePromptDraftSource(message);
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

      if (message.type === "run-image-merge") {
        await runImageMerge(message);
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
        message.type === "request-ai-image-prompt-draft-source" ||
        message.type === "apply-ai-image-upscaled-image" ||
        message.type === "ai-image-upscale-report-error" ||
        message.type === "request-image-extend-source" ||
        message.type === "apply-image-extend-underlay" ||
        message.type === "image-extend-report-error" ||
        message.type === "request-image-composite-source" ||
        message.type === "apply-image-composite-image" ||
        message.type === "image-composite-report-error" ||
        message.type === "run-image-merge" ||
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
      isPromptDraftPreparing ||
      isTextOverlayPreparing ||
      isTextOverlayApplying
    ) {
      postPrepareError(IMAGE_TASK_ALREADY_RUNNING_MESSAGE, sanitizeClientRequestId(message && message.clientRequestId));
      return;
    }

    isPreparing = true;
    pendingSession = null;

    try {
      const target = collectAiImageSourceTargetFromSelection(
        sanitizeSourceMode(message && message.sourceMode),
        message
      );
      const source = await buildAiImageSource(target, {
        preferOriginalImageBytes: shouldPreferOriginalUpscaleSource(message),
      });
      const sessionId = buildSessionId();

      pendingSession = {
        id: sessionId,
        clientRequestId: sanitizeClientRequestId(message && message.clientRequestId),
        targetKind: target.kind,
        captureMode: source && source.summary && typeof source.summary.captureMode === "string" ? source.summary.captureMode : "",
        targetNodeId: target.entry && target.entry.nodeId ? target.entry.nodeId : "",
        originalHash: target.kind === "image-fill" ? target.entry.imageHash : "",
        usages: target.kind === "image-fill" ? target.usages : [],
        selectionLabel: formatSelectionLabel(target.selection),
        targetNodeName: target.entry && target.entry.nodeName ? target.entry.nodeName : "",
        targetWidth: target.targetWidth || 0,
        targetHeight: target.targetHeight || 0,
        targetParentId: target.targetParentId || "",
        targetX: target.targetX || 0,
        targetY: target.targetY || 0,
        placementMode: target.placementMode || "",
        operationLabel: sanitizeOperationLabel(message && message.operationLabel),
        preparedAt: new Date().toISOString(),
      };

      figma.ui.postMessage({
        type: "ai-image-upscale-source-ready",
        sessionId: sessionId,
        clientRequestId: pendingSession.clientRequestId,
        image: source.image,
        summary: source.summary,
        composite: source.composite || null,
      });
    } catch (error) {
      pendingSession = null;
      postPrepareError(
        normalizeErrorMessage(error, UPSCALE_SOURCE_PREPARE_ERROR_MESSAGE, {
          operationLabel: sanitizeOperationLabel(message && message.operationLabel),
        }),
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
      isPromptDraftPreparing ||
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

      let result = null;
      if (pendingSession.targetKind === "shape-export") {
        result = await applyGeneratedImageToShapeNode(pendingSession, createdImage.hash, bytes.length);
      } else if (pendingSession.targetKind === "container-placement" || pendingSession.targetKind === "new-image-placement") {
        result = await applyGeneratedPromptImagePlacement(pendingSession, createdImage.hash, bytes.length);
      } else {
        result = await replaceSelectionImageFills(pendingSession, createdImage.hash, bytes.length);
      }
      figma.ui.postMessage({
        type: "ai-image-upscale-apply-result",
        clientRequestId: pendingSession.clientRequestId,
        result: result,
      });
      notifyApplyResult(result, sanitizeOperationLabel(message && message.operationLabel) || pendingSession.operationLabel);
      pendingSession = null;
    } catch (error) {
      const messageText = normalizeErrorMessage(error, UPSCALE_APPLY_ERROR_MESSAGE, {
        operationLabel:
          sanitizeOperationLabel(message && message.operationLabel) ||
          (pendingSession && pendingSession.operationLabel) ||
          "",
      });
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
      isPromptDraftPreparing ||
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
      const requestedExpand = sanitizeImageExtendPadding(message && message.expand);
      const expand = resolveImageExtendEffectivePadding(requestedExpand, target.boundsPadding);
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
        imageBounds: target.imageBounds,
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
          captureMode: "image-bounds",
          currentWidth: target.currentWidth,
          currentHeight: target.currentHeight,
          targetWidth: target.currentWidth + expand.left + expand.right,
          targetHeight: target.currentHeight + expand.top + expand.bottom,
          expandTop: expand.top,
          expandRight: expand.right,
          expandBottom: expand.bottom,
          expandLeft: expand.left,
          expansionSource: expand.source || "prompt",
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
      isPromptDraftPreparing ||
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
      isPromptDraftPreparing ||
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
        selectedRootNodeId: collection.selectedRoot && collection.selectedRoot.id ? collection.selectedRoot.id : "",
        selectedRootNodeName: collection.selectedRoot ? safeName(collection.selectedRoot) : "",
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
            layerKind: layer.layerKind || "image",
            nodeType: layer.nodeType || "",
            textContent: layer.textContent || "",
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
          backgroundNodeName:
            pendingCompositeSession.selectedRootNodeName || (collection.layers[0] ? collection.layers[0].nodeName : ""),
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
      isPromptDraftPreparing ||
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
      isPromptDraftPreparing ||
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
        containers: collection.containers,
        skipped: collection.skipped,
        requestedCount: collection.selection.length,
        preparedAt: new Date().toISOString(),
      };

      figma.ui.postMessage({
        type: "image-bounds-fit-source-ready",
        sessionId: sessionId,
        clientRequestId: pendingBoundsFitSession.clientRequestId,
        items: collection.targets
          .filter(function (target) {
            return !target || target.skipRasterAnalysis !== true;
          })
          .map(function (target) {
            return {
              nodeId: target.nodeId,
              nodeName: target.nodeName,
              imageHash: target.originalHash,
              fileName: target.fileName,
              mimeType: target.mimeType,
              bytes: target.bytes,
              sourceWidth: target.sourceWidth,
              sourceHeight: target.sourceHeight,
              analysisOffsetX: target.analysisOffsetX,
              analysisOffsetY: target.analysisOffsetY,
              analysisWidth: target.analysisWidth,
              analysisHeight: target.analysisHeight,
              rasterAnalysisOffsetX: Number.isFinite(Number(target.rasterAnalysisOffsetX))
                ? Number(target.rasterAnalysisOffsetX)
                : Number(target.analysisOffsetX) || 0,
              rasterAnalysisOffsetY: Number.isFinite(Number(target.rasterAnalysisOffsetY))
                ? Number(target.rasterAnalysisOffsetY)
                : Number(target.analysisOffsetY) || 0,
              rasterAnalysisWidth: Number(target.rasterAnalysisWidth) > 0 ? Number(target.rasterAnalysisWidth) : Number(target.analysisWidth) || 0,
              rasterAnalysisHeight:
                Number(target.rasterAnalysisHeight) > 0 ? Number(target.rasterAnalysisHeight) : Number(target.analysisHeight) || 0,
            };
          }),
        summary: {
          selectionLabel: pendingBoundsFitSession.selectionLabel,
          eligibleCount: collection.targets.length + collection.containers.length,
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
      isPromptDraftPreparing ||
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

  async function preparePromptDraftSource(message) {
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
      isPromptDraftPreparing ||
      isTextOverlayPreparing ||
      isTextOverlayApplying
    ) {
      postPromptDraftSourceError(
        IMAGE_TASK_ALREADY_RUNNING_MESSAGE,
        sanitizeClientRequestId(message && message.clientRequestId)
      );
      return;
    }

    isPromptDraftPreparing = true;

    try {
      const source = await collectPromptDraftSourceFromSelection();
      figma.ui.postMessage({
        type: "ai-image-prompt-draft-source-ready",
        clientRequestId: sanitizeClientRequestId(message && message.clientRequestId),
        sourceType: source.sourceType,
        text: source.text || "",
        image: source.image || null,
        summary: source.summary || {},
      });
    } catch (error) {
      postPromptDraftSourceError(
        normalizeErrorMessage(error, PROMPT_DRAFT_SOURCE_PREPARE_ERROR_MESSAGE),
        sanitizeClientRequestId(message && message.clientRequestId)
      );
    } finally {
      isPromptDraftPreparing = false;
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
      isPromptDraftPreparing ||
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
      isPromptDraftPreparing ||
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
      UI_REPORTED_IMAGE_ERROR_FALLBACK,
      {
        operationLabel: sanitizeOperationLabel(message && message.operationLabel),
        operationKind: message && typeof message.operationKind === "string" ? message.operationKind : "",
      }
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

  function postPromptDraftSourceError(message, clientRequestId) {
    figma.ui.postMessage({
      type: "ai-image-prompt-draft-source-error",
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

  function collectAiImageSourceTargetFromSelection(sourceMode, message) {
    if (sanitizeSourceMode(sourceMode) === "prompt-smart") {
      return collectPromptSmartTargetFromSelection(message);
    }

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

  function collectPromptSmartTargetFromSelection(message) {
    const selection = Array.from(figma.currentPage.selection || []).filter(Boolean);
    const outputSize = sanitizePromptOutputSize(message && message.requestedOutputSize);
    const visualNodes = selection.filter(function (node) {
      return !!node && !node.removed && node.type !== "TEXT";
    });

    if (!visualNodes.length) {
      return buildPromptPlacementTarget(selection, outputSize);
    }

    if (visualNodes.length > 1) {
      throw new Error(PROMPT_SMART_SELECTION_MESSAGE);
    }

    const node = visualNodes[0];
    if ("locked" in node && node.locked) {
      throw new Error("Locked layers are not supported for prompt edit/generation.");
    }

    const directImageTarget = collectDirectImageFillTarget(node, selection);
    if (directImageTarget) {
      return directImageTarget;
    }

    if (isPromptEditableShapeNode(node)) {
      const localBounds = getImageExtendLocalBounds(node);
      return {
        kind: "shape-export",
        selection: selection,
        entry: {
          nodeId: node.id,
          nodeName: safeName(node),
          path: safeName(node),
        },
        targetWidth: localBounds ? localBounds.width : roundBoundsFitMetric(node.width),
        targetHeight: localBounds ? localBounds.height : roundBoundsFitMetric(node.height),
      };
    }

    if (!isPromptSmartContainerTarget(node)) {
      throw new Error(PROMPT_SMART_SELECTION_MESSAGE);
    }

    return {
      kind: "container-placement",
      selection: selection,
      entry: {
        nodeId: node.id,
        nodeName: safeName(node),
        path: safeName(node),
      },
      targetWidth: roundBoundsFitMetric(node.width),
      targetHeight: roundBoundsFitMetric(node.height),
    };
  }

  function buildPromptPlacementTarget(selection, outputSize) {
    const dimensions = buildPromptPlacementDimensions(outputSize);
    const target = {
      kind: "new-image-placement",
      selection: Array.isArray(selection) ? selection.slice() : [],
      entry: {
        nodeId: "",
        nodeName: Array.isArray(selection) && selection.length ? safeName(selection[0]) : "Viewport center",
        path: "",
      },
      targetWidth: dimensions.width,
      targetHeight: dimensions.height,
    };

    if (Array.isArray(selection) && selection.length === 1 && selection[0] && selection[0].type === "TEXT") {
      const textNode = selection[0];
      const textRect = getBoundsFitNodeRect(textNode);
      target.entry.nodeId = textNode.id;
      target.entry.nodeName = safeName(textNode);
      target.entry.path = safeName(textNode);
      target.targetParentId = textNode.parent && typeof textNode.parent.id === "string" ? textNode.parent.id : "";
      target.targetX = textRect ? textRect.x : 0;
      target.targetY = textRect ? textRect.y : 0;
      target.placementMode = "below-selected-text";
    }

    return target;
  }

  function collectDirectImageFillTarget(node, selection) {
    if (!node || node.removed || !hasSimpleVisibleImagePaint(node)) {
      return null;
    }

    const fills = getNodeFills(node);
    const fillIndex = getPrimaryVisibleImageFillIndex(fills);
    if (fillIndex < 0) {
      return null;
    }

    const fill = fills[fillIndex];
    if (!fill || !fill.imageHash) {
      return null;
    }

    return {
      kind: "image-fill",
      selection: Array.isArray(selection) ? selection.slice() : [node],
      entry: {
        imageHash: fill.imageHash,
        nodeId: node.id,
        nodeName: safeName(node),
        path: safeName(node),
      },
      usages: [
        {
          nodeId: node.id,
          nodeName: safeName(node),
          fillIndex: fillIndex,
          imageHash: fill.imageHash,
          path: safeName(node),
        },
      ],
      targetWidth: roundBoundsFitMetric(node.width),
      targetHeight: roundBoundsFitMetric(node.height),
    };
  }

  function isPromptSmartContainerTarget(node) {
    return (
      !!node &&
      !node.removed &&
      node.type !== "TEXT" &&
      (!("locked" in node) || !node.locked) &&
      typeof node.exportAsync === "function" &&
      typeof node.width === "number" &&
      typeof node.height === "number" &&
      node.width > 0 &&
      node.height > 0
    );
  }

  async function buildAiImageSource(target, options) {
    if (target && target.kind === "shape-export") {
      return await buildShapeEditSource(target);
    }
    if (target && target.kind === "container-placement") {
      return await buildContainerPromptSource(target);
    }
    if (target && target.kind === "new-image-placement") {
      return buildPromptPlacementSource(target);
    }
    return await buildUpscaleImageSource(target, options);
  }

  function buildPromptPlacementSource(target) {
    return {
      image: null,
      summary: {
        selectionLabel: formatSelectionLabel(target.selection),
        targetNodeName: target.entry && target.entry.nodeName ? target.entry.nodeName : "Viewport center",
        targetWidth: target.targetWidth || 0,
        targetHeight: target.targetHeight || 0,
        placementMode: "viewport-center",
        requestMode: "prompt-only",
        byteLength: 0,
      },
    };
  }

  async function buildContainerPromptSource(target) {
    const node = await figma.getNodeByIdAsync(target.entry.nodeId);
    if (!isPromptSmartContainerTarget(node)) {
      throw new Error(PROMPT_TARGET_EXPORT_ERROR_MESSAGE);
    }

    let composite = null;
    let collection = null;
    if (hasChildren(node)) {
      try {
        collection = await collectImageCompositeTargetsFromSelection([node]);
      } catch (error) {
        collection = null;
      }
      if (collection && Array.isArray(collection.layers)) {
        const imageLayerCount = collection.layers.filter(function (layer) {
          return !!layer && layer.layerKind === "image";
        }).length;
        if (imageLayerCount >= 2) {
          throw new Error(PROMPT_MULTI_IMAGE_CONTAINER_MESSAGE);
        }
        if (collection.layers.length >= 2 && collection.unionRect) {
          composite = {
            layers: collection.layers.map(function (layer) {
              return {
                nodeId: layer.nodeId,
                nodeName: layer.nodeName,
                role: layer.role,
                orderIndex: layer.orderIndex,
                fileName: layer.fileName,
                mimeType: layer.mimeType,
                bytes: layer.bytes,
                layerKind: layer.layerKind || "image",
                nodeType: layer.nodeType || "",
                textContent: layer.textContent || "",
                offsetX: layer.offsetX,
                offsetY: layer.offsetY,
                width: layer.visibleRect.width,
                height: layer.visibleRect.height,
              };
            }),
            summary: {
              selectionLabel: formatSelectionLabel(target.selection),
              layerCount: collection.layers.length,
              skippedCount: Array.isArray(collection.skipped) ? collection.skipped.length : 0,
              backgroundNodeName: safeName(node),
              foregroundCount: Math.max(0, collection.layers.length - 1),
              canvasWidth: collection.unionRect.width,
              canvasHeight: collection.unionRect.height,
            },
          };
        }
      }
    }

    const bytes = await node.exportAsync({
      format: "PNG",
      useAbsoluteBounds: false,
    });
    if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
      throw new Error(PROMPT_TARGET_EXPORT_EMPTY_MESSAGE);
    }

    return {
      image: {
        bytes: bytes,
        mimeType: "image/png",
        fileName: buildFileName(
          {
            nodeName: safeName(node),
            imageHash: node.id,
          },
          "png"
        ),
      },
      summary: {
        selectionLabel: formatSelectionLabel(target.selection),
        targetNodeName: safeName(node),
        captureMode: "rendered-node",
        targetWidth: roundBoundsFitMetric(node.width),
        targetHeight: roundBoundsFitMetric(node.height),
        requestMode: "image-edit",
        byteLength: bytes.length,
        pipelineMode: composite ? "composite" : "upscale",
      },
      composite: composite,
    };
  }

  async function buildUpscaleImageSource(target, options) {
    const targetNode = await figma.getNodeByIdAsync(target.entry.nodeId);
    const preferOriginalImageBytes = !!(options && options.preferOriginalImageBytes);
    const sourceFill = resolveUpscaleSourceFill(targetNode, target);
    const requiresRenderedSource = sourceFill ? await isRenderedUpscaleSourceRequired(targetNode, sourceFill) : false;
    const localBounds = getImageExtendLocalBounds(targetNode);
    let sourceWidth = 0;
    let sourceHeight = 0;
    if (target && target.entry && target.entry.imageHash) {
      const sourceImage = figma.getImageByHash(target.entry.imageHash);
      if (sourceImage && typeof sourceImage.getSizeAsync === "function") {
        try {
          const size = await sourceImage.getSizeAsync();
          sourceWidth = size && typeof size.width === "number" && Number.isFinite(size.width) ? Math.max(0, Math.round(size.width)) : 0;
          sourceHeight =
            size && typeof size.height === "number" && Number.isFinite(size.height) ? Math.max(0, Math.round(size.height)) : 0;
        } catch (error) {}
      }
    }
    const summary = {
      selectionLabel: formatSelectionLabel(target.selection),
      targetNodeName: target.entry.nodeName,
      targetFillCount: target.usages.length,
      imageHash: target.entry.imageHash,
      captureMode: "rendered-node",
      targetWidth: localBounds ? localBounds.width : 0,
      targetHeight: localBounds ? localBounds.height : 0,
      sourceWidth: sourceWidth,
      sourceHeight: sourceHeight,
      byteLength: 0,
    };
    let bytes = new Uint8Array(0);
    let mimeType = "image/png";
    let fileName = buildFileName(target.entry, "png");

    if (!preferOriginalImageBytes && targetNode && !targetNode.removed && typeof targetNode.exportAsync === "function") {
      try {
        bytes = await targetNode.exportAsync({
          format: "PNG",
          useAbsoluteBounds: false,
        });
      } catch (error) {
        bytes = new Uint8Array(0);
      }
    }

    if (!bytes.length) {
      if (requiresRenderedSource && !preferOriginalImageBytes) {
        throw new Error("Could not export the currently visible image bytes for upscale.");
      }
      const image = figma.getImageByHash(target.entry.imageHash);
      if (!image) {
        throw new Error(IMAGE_FILL_NOT_FOUND_MESSAGE);
      }
      bytes = await image.getBytesAsync();
      if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
        throw new Error(IMAGE_FILL_BYTES_MISSING_MESSAGE);
      }
      const extension = detectImageExtension(bytes);
      mimeType = detectImageMimeType(bytes);
      fileName = buildFileName(target.entry, extension === "bin" ? "png" : extension);
      summary.captureMode = "source-image";
    }

    summary.byteLength = bytes.length;

    return {
      image: {
        bytes: bytes,
        mimeType: mimeType,
        fileName: fileName,
      },
      summary: summary,
    };
  }

  function resolveUpscaleSourceFill(node, target) {
    if (!node || node.removed) {
      return null;
    }
    const fills = getNodeFills(node);
    if (!fills.length) {
      return null;
    }
    const preferredUsage = target && Array.isArray(target.usages) && target.usages.length ? target.usages[0] : null;
    if (
      preferredUsage &&
      Number.isInteger(preferredUsage.fillIndex) &&
      preferredUsage.fillIndex >= 0 &&
      preferredUsage.fillIndex < fills.length
    ) {
      const directFill = fills[preferredUsage.fillIndex];
      if (isImagePaint(directFill) && directFill.imageHash === target.entry.imageHash) {
        return directFill;
      }
    }
    for (let index = 0; index < fills.length; index += 1) {
      const fill = fills[index];
      if (isImagePaint(fill) && fill.imageHash === target.entry.imageHash) {
        return fill;
      }
    }
    return null;
  }

  async function isRenderedUpscaleSourceRequired(node, fill) {
    if (!node || !fill || !fill.imageHash) {
      return false;
    }
    const nodeWidth = typeof node.width === "number" && Number.isFinite(node.width) ? node.width : 0;
    const nodeHeight = typeof node.height === "number" && Number.isFinite(node.height) ? node.height : 0;
    const image = figma.getImageByHash(fill.imageHash);
    if (!image) {
      return false;
    }
    const size = await image.getSizeAsync();
    const sourceWidth = size && typeof size.width === "number" ? size.width : 0;
    const sourceHeight = size && typeof size.height === "number" ? size.height : 0;
    if (!(nodeWidth > 0) || !(nodeHeight > 0) || !(sourceWidth > 0) || !(sourceHeight > 0)) {
      return false;
    }
    const scaleMode = typeof fill.scaleMode === "string" ? fill.scaleMode : "FILL";
    const fillRotation = typeof fill.rotation === "number" && Number.isFinite(fill.rotation) ? fill.rotation : 0;
    return (
      scaleMode === "CROP" ||
      scaleMode === "TILE" ||
      !!fill.imageTransform ||
      Math.abs(fillRotation) > 0.01 ||
      !hasMatchingAspectRatio(nodeWidth, nodeHeight, sourceWidth, sourceHeight)
    );
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
    const localBounds = getImageExtendLocalBounds(node);

    let bytes = new Uint8Array(0);
    if (shapeEditNeedsPlaceholderSource(node)) {
      bytes = await exportShapeEditPlaceholderPng(node);
    } else {
      bytes = await node.exportAsync({
        format: "PNG",
        useAbsoluteBounds: false,
      });
    }
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
        targetWidth: localBounds ? localBounds.width : 0,
        targetHeight: localBounds ? localBounds.height : 0,
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

    const imageBounds = await resolveImageExtendImageLocalBounds(node, fill, width, height);
    const boundsPadding = buildImageExtendBoundsPadding(imageBounds, width, height);
    const bytes = await exportImageExtendSourcePng(node, imageBounds);
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
      currentWidth: imageBounds.width,
      currentHeight: imageBounds.height,
      imageBounds: imageBounds,
      boundsPadding: boundsPadding,
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

  async function resolveImageExtendImageLocalBounds(node, fill, fallbackWidth, fallbackHeight) {
    const nodeWidth = Math.max(1, Number(fallbackWidth) || 1);
    const nodeHeight = Math.max(1, Number(fallbackHeight) || 1);
    const fullBounds = buildImageExtendFullLocalBounds(nodeWidth, nodeHeight);
    if (!fill || !isImagePaint(fill)) {
      return fullBounds;
    }

    const fillRotation = typeof fill.rotation === "number" && Number.isFinite(fill.rotation) ? fill.rotation : 0;
    if (Math.abs(fillRotation) > 0.01 || !!fill.imageTransform) {
      return fullBounds;
    }

    const scaleMode = typeof fill.scaleMode === "string" ? fill.scaleMode : "FILL";
    if (scaleMode !== "FIT") {
      return fullBounds;
    }

    const sourceSize = await getImageExtendSourceSize(fill);
    if (!sourceSize) {
      return fullBounds;
    }

    const scale = Math.min(nodeWidth / sourceSize.width, nodeHeight / sourceSize.height);
    if (!(scale > 0)) {
      return fullBounds;
    }

    const imageWidth = Math.max(1, roundBoundsFitMetric(sourceSize.width * scale));
    const imageHeight = Math.max(1, roundBoundsFitMetric(sourceSize.height * scale));
    return normalizeImageExtendLocalBounds(
      {
        x: roundBoundsFitMetric((nodeWidth - imageWidth) / 2),
        y: roundBoundsFitMetric((nodeHeight - imageHeight) / 2),
        width: imageWidth,
        height: imageHeight,
      },
      nodeWidth,
      nodeHeight
    );
  }

  async function getImageExtendSourceSize(fill) {
    if (!fill || !fill.imageHash) {
      return null;
    }

    const image = figma.getImageByHash(fill.imageHash);
    if (!image || typeof image.getSizeAsync !== "function") {
      return null;
    }

    try {
      const size = await image.getSizeAsync();
      const width = size && typeof size.width === "number" && Number.isFinite(size.width) ? size.width : 0;
      const height = size && typeof size.height === "number" && Number.isFinite(size.height) ? size.height : 0;
      if (!(width > 0) || !(height > 0)) {
        return null;
      }
      return {
        width: width,
        height: height,
      };
    } catch (error) {
      return null;
    }
  }

  function buildImageExtendFullLocalBounds(width, height) {
    return {
      x: 0,
      y: 0,
      width: Math.max(1, roundBoundsFitMetric(width)),
      height: Math.max(1, roundBoundsFitMetric(height)),
    };
  }

  function normalizeImageExtendLocalBounds(value, fallbackWidth, fallbackHeight) {
    const fallback = buildImageExtendFullLocalBounds(fallbackWidth, fallbackHeight);
    if (!value || typeof value !== "object") {
      return fallback;
    }

    const x = Number(value.x);
    const y = Number(value.y);
    const width = Number(value.width);
    const height = Number(value.height);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !(width > 0) || !(height > 0)) {
      return fallback;
    }

    return {
      x: roundBoundsFitMetric(x),
      y: roundBoundsFitMetric(y),
      width: Math.max(1, roundBoundsFitMetric(width)),
      height: Math.max(1, roundBoundsFitMetric(height)),
    };
  }

  function areImageExtendLocalBoundsFullNode(bounds, width, height) {
    const normalized = normalizeImageExtendLocalBounds(bounds, width, height);
    return (
      Math.abs(normalized.x) <= 0.01 &&
      Math.abs(normalized.y) <= 0.01 &&
      Math.abs(normalized.width - Math.max(1, Number(width) || 1)) <= 0.01 &&
      Math.abs(normalized.height - Math.max(1, Number(height) || 1)) <= 0.01
    );
  }

  async function exportImageExtendSourcePng(node, imageBounds) {
    if (!node || typeof node.exportAsync !== "function") {
      throw new Error("Could not export the selected image layer for image extend.");
    }

    const nodeWidth = typeof node.width === "number" && Number.isFinite(node.width) ? node.width : 0;
    const nodeHeight = typeof node.height === "number" && Number.isFinite(node.height) ? node.height : 0;
    const bounds = normalizeImageExtendLocalBounds(imageBounds, nodeWidth, nodeHeight);
    if (areImageExtendLocalBoundsFullNode(bounds, nodeWidth, nodeHeight)) {
      return await node.exportAsync({
        format: "PNG",
        useAbsoluteBounds: false,
      });
    }

    const preview = figma.createFrame();
    let clone = null;
    try {
      preview.name = "__pigma-image-extend-source-bounds__";
      preview.resize(bounds.width, bounds.height);
      preview.clipsContent = true;
      preview.fills = [];
      preview.strokes = [];
      figma.currentPage.appendChild(preview);

      clone = node.clone();
      preview.appendChild(clone);
      setImageExtendNodePosition(clone, -bounds.x, -bounds.y);

      return await preview.exportAsync({
        format: "PNG",
        useAbsoluteBounds: false,
      });
    } finally {
      if (clone && !clone.removed) {
        clone.remove();
      }
      if (preview && !preview.removed) {
        preview.remove();
      }
    }
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

  function buildImageExtendBoundsPadding(imageBounds, nodeWidth, nodeHeight) {
    const bounds = normalizeImageExtendLocalBounds(imageBounds, nodeWidth, nodeHeight);
    const width = Math.max(1, Number(nodeWidth) || 1);
    const height = Math.max(1, Number(nodeHeight) || 1);
    return {
      top: sanitizeImageExtendPaddingValue(bounds.y),
      right: sanitizeImageExtendPaddingValue(width - (bounds.x + bounds.width)),
      bottom: sanitizeImageExtendPaddingValue(height - (bounds.y + bounds.height)),
      left: sanitizeImageExtendPaddingValue(bounds.x),
    };
  }

  function hasPositiveImageExtendPadding(padding) {
    return !!padding && (padding.top > 0 || padding.right > 0 || padding.bottom > 0 || padding.left > 0);
  }

  function resolveImageExtendEffectivePadding(requestedPadding, boundsPadding) {
    const requested = requestedPadding || { top: 0, right: 0, bottom: 0, left: 0 };
    const bounds = boundsPadding || { top: 0, right: 0, bottom: 0, left: 0 };
    if (hasPositiveImageExtendPadding(bounds)) {
      return {
        top: sanitizeImageExtendPaddingValue(bounds.top),
        right: sanitizeImageExtendPaddingValue(bounds.right),
        bottom: sanitizeImageExtendPaddingValue(bounds.bottom),
        left: sanitizeImageExtendPaddingValue(bounds.left),
        source: "image-bounds",
      };
    }
    return {
      top: sanitizeImageExtendPaddingValue(requested.top),
      right: sanitizeImageExtendPaddingValue(requested.right),
      bottom: sanitizeImageExtendPaddingValue(requested.bottom),
      left: sanitizeImageExtendPaddingValue(requested.left),
      source: "prompt",
    };
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

  async function resolveImageExtendCurrentImageBounds(node, session, localBounds) {
    const width = localBounds && localBounds.width > 0 ? localBounds.width : typeof node.width === "number" ? node.width : 0;
    const height = localBounds && localBounds.height > 0 ? localBounds.height : typeof node.height === "number" ? node.height : 0;
    const fallback = normalizeImageExtendLocalBounds(session && session.imageBounds, width, height);
    const fills = getNodeFills(node);
    let fill = null;
    const originalHash = session && typeof session.originalHash === "string" ? session.originalHash : "";

    if (originalHash) {
      const fillIndex = findVisibleImageFillIndexByHash(fills, originalHash);
      if (fillIndex >= 0) {
        fill = fills[fillIndex];
      }
    }

    if (!fill) {
      const primaryFillIndex = getPrimaryVisibleImageFillIndex(fills);
      if (primaryFillIndex >= 0) {
        fill = fills[primaryFillIndex];
      }
    }

    if (!fill) {
      return fallback;
    }

    return await resolveImageExtendImageLocalBounds(node, fill, width, height);
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
    const imageBounds = await resolveImageExtendCurrentImageBounds(node, session, localBounds);
    const nextX = localBounds.x + imageBounds.x - expand.left;
    const nextY = localBounds.y + imageBounds.y - expand.top;
    const nextWidth = Math.max(1, roundBoundsFitMetric(imageBounds.width + expand.left + expand.right));
    const nextHeight = Math.max(1, roundBoundsFitMetric(imageBounds.height + expand.top + expand.bottom));
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

  function buildImageCompositeApplyResult(session, resultNode, byteLength, skipped, placementMode) {
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
        placementMode: typeof placementMode === "string" ? placementMode : "",
        resultByteLength: byteLength,
      },
      skipped: Array.isArray(skipped) ? skipped.slice(0, 24) : [],
    };
  }

  async function runImageMerge(message) {
    const clientRequestId = message && typeof message.clientRequestId === "string" ? message.clientRequestId : "";
    try {
      const source = await exportImageMergeSelection();
      const createdImage = figma.createImage(source.bytes);
      if (!createdImage || !createdImage.hash) {
        throw new Error("이미지 병합 결과를 Figma 이미지로 만들지 못했습니다.");
      }

      const result = await applyImageCompositeToSelection(
        {
          selectionLabel: source.selectionLabel,
          selectedRootNodeId: source.selectedRootNodeId,
          selectedRootNodeName: source.selectedRootNodeName,
          unionRect: source.unionRect,
          preserveSelectedRootTransform: source.preserveSelectedRootTransform,
          selectedRootWidth: source.selectedRootWidth,
          selectedRootHeight: source.selectedRootHeight,
        },
        createdImage.hash,
        source.bytes.length
      );

      figma.ui.postMessage({
        type: "image-merge-result",
        clientRequestId: clientRequestId,
        result: result,
      });

      const appliedCount = result && result.summary && Number(result.summary.appliedCount) > 0 ? 1 : 0;
      figma.notify(appliedCount ? "이미지 병합 레이어를 만들었습니다." : "이미지 병합 레이어를 만들지 못했습니다.", {
        timeout: 2200,
      });
    } catch (error) {
      const messageText = normalizeErrorMessage(error, "이미지 병합에 실패했습니다.");
      figma.ui.postMessage({
        type: "image-merge-error",
        clientRequestId: clientRequestId,
        message: messageText,
      });
      figma.notify(messageText, { error: true, timeout: 2600 });
    }
  }

  async function exportImageMergeSelection() {
    const selection = Array.from(figma.currentPage.selection || []).filter(function (node) {
      return !!node && !node.removed && typeof node.exportAsync === "function";
    });
    if (!selection.length) {
      throw new Error("이미지로 병합할 프레임, 그룹, 레이어를 먼저 선택해주세요.");
    }

    const rects = selection
      .map(function (node) {
        return getBoundsFitNodeRect(node);
      })
      .filter(Boolean);
    const unionRect = unionAbsoluteRects(rects);
    if (!unionRect || !(unionRect.width > 0) || !(unionRect.height > 0)) {
      throw new Error("선택한 항목의 병합 영역을 계산하지 못했습니다.");
    }

    const exportSettings = {
      format: "PNG",
      useAbsoluteBounds: true,
    };

    let bytes = null;
    if (selection.length === 1) {
      bytes = await selection[0].exportAsync(exportSettings);
    } else {
      bytes = await exportImageMergeMultipleSelection(selection, unionRect, exportSettings);
    }

    if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
      throw new Error("이미지 병합 PNG가 비어 있습니다.");
    }

    return {
      selectionLabel: formatSelectionLabel(selection),
      selectedRootNodeId: selection.length === 1 && selection[0] && typeof selection[0].id === "string" ? selection[0].id : "",
      selectedRootNodeName: selection.length === 1 ? safeName(selection[0]) : "",
      preserveSelectedRootTransform: selection.length === 1,
      selectedRootWidth:
        selection.length === 1 && typeof selection[0].width === "number" && Number.isFinite(selection[0].width)
          ? selection[0].width
          : 0,
      selectedRootHeight:
        selection.length === 1 && typeof selection[0].height === "number" && Number.isFinite(selection[0].height)
          ? selection[0].height
          : 0,
      unionRect: unionRect,
      bytes: bytes,
    };
  }

  async function exportImageMergeMultipleSelection(selection, unionRect, exportSettings) {
    const preview = figma.createFrame();
    const clones = [];
    try {
      preview.name = "__pigma-image-merge-preview__";
      preview.resize(unionRect.width, unionRect.height);
      preview.clipsContent = true;
      preview.fills = [];
      preview.strokes = [];
      preview.x = unionRect.x;
      preview.y = unionRect.y;
      figma.currentPage.appendChild(preview);

      const orderedSelection = selection.slice().sort(compareSceneNodeCanvasOrder);
      for (let index = 0; index < orderedSelection.length; index += 1) {
        const node = orderedSelection[index];
        const rect = getBoundsFitNodeRect(node);
        if (!rect) {
          continue;
        }
        const clone = node.clone();
        preview.appendChild(clone);
        clones.push(clone);
        if ("x" in clone && typeof clone.x === "number") {
          clone.x = roundBoundsFitMetric(rect.x - unionRect.x);
        }
        if ("y" in clone && typeof clone.y === "number") {
          clone.y = roundBoundsFitMetric(rect.y - unionRect.y);
        }
      }

      if (!clones.length) {
        throw new Error("병합 가능한 선택 레이어를 찾지 못했습니다.");
      }

      return await preview.exportAsync(exportSettings);
    } finally {
      for (let index = 0; index < clones.length; index += 1) {
        if (clones[index] && !clones[index].removed) {
          clones[index].remove();
        }
      }
      if (preview && !preview.removed) {
        preview.remove();
      }
    }
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
      return buildImageCompositeApplyResult(session, null, byteLength, skipped, "");
    }
    let resultNode = null;
    let placementMode = "";

    try {
      resultNode = figma.createRectangle();
      resultNode.name = buildImageCompositeResultName(session && session.selectionLabel ? session.selectionLabel : "");
      const resultWidth =
        session && session.preserveSelectedRootTransform && Number(session.selectedRootWidth) > 0
          ? Number(session.selectedRootWidth)
          : unionRect.width;
      const resultHeight =
        session && session.preserveSelectedRootTransform && Number(session.selectedRootHeight) > 0
          ? Number(session.selectedRootHeight)
          : unionRect.height;
      resultNode.resize(resultWidth, resultHeight);
      resultNode.fills = [buildVisibleImageFill(newImageHash)];
      resultNode.strokes = [];
      if ("cornerRadius" in resultNode) {
        resultNode.cornerRadius = 0;
      }

      let placed = false;
      if (session && session.selectedRootNodeId) {
        const selectedRootNode = await figma.getNodeByIdAsync(session.selectedRootNodeId);
        if (
          selectedRootNode &&
          !selectedRootNode.removed &&
          (!("locked" in selectedRootNode) || !selectedRootNode.locked)
        ) {
          if (canUsePromptPlacementContainer(selectedRootNode)) {
            selectedRootNode.insertChild(selectedRootNode.children.length, resultNode);
            setImageExtendNodePosition(resultNode, 0, 0);
            placementMode = "inside-selected-root";
            placed = true;
          } else if (
            selectedRootNode.parent &&
            canUsePromptPlacementContainer(selectedRootNode.parent) &&
            !isAutoLayoutNode(selectedRootNode.parent)
          ) {
            const localBounds = getImageExtendLocalBounds(selectedRootNode);
            if (localBounds) {
              const parent = selectedRootNode.parent;
              const insertIndex = findNodeChildIndex(parent, selectedRootNode.id);
              parent.insertChild(insertIndex >= 0 ? insertIndex + 1 : parent.children.length, resultNode);
              if (
                session &&
                session.preserveSelectedRootTransform &&
                copyNodeRelativeTransform(resultNode, selectedRootNode)
              ) {
                placementMode = "selected-root-sibling-transform";
              } else {
                setImageExtendNodePosition(resultNode, localBounds.x, localBounds.y);
                placementMode = "selected-root-sibling";
              }
              placed = true;
            }
          }
        }
      }

      if (!placed) {
        figma.currentPage.appendChild(resultNode);
        resultNode.x = unionRect.x;
        resultNode.y = unionRect.y;
        placementMode = "page-overlay";
      }

      figma.currentPage.selection = [resultNode];
      if (typeof figma.viewport.scrollAndZoomIntoView === "function") {
        figma.viewport.scrollAndZoomIntoView([resultNode]);
      }
      return buildImageCompositeApplyResult(session, resultNode, byteLength, skipped, placementMode);
    } catch (error) {
      if (resultNode && !resultNode.removed && resultNode.parent) {
        resultNode.remove();
      }
      skipped.push({
        nodeId: session && session.selectedRootNodeId ? session.selectedRootNodeId : "",
        nodeName: session && session.selectedRootNodeName ? session.selectedRootNodeName : "",
        reason: normalizeErrorMessage(error, "Failed to place the generated composite image."),
      });
      return buildImageCompositeApplyResult(session, null, byteLength, skipped, placementMode);
    }
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

  function copyNodeRelativeTransform(targetNode, sourceNode) {
    if (
      !targetNode ||
      !sourceNode ||
      !("relativeTransform" in targetNode) ||
      !("relativeTransform" in sourceNode) ||
      !Array.isArray(sourceNode.relativeTransform) ||
      sourceNode.relativeTransform.length < 2
    ) {
      return false;
    }

    const row0 = Array.isArray(sourceNode.relativeTransform[0]) ? sourceNode.relativeTransform[0] : null;
    const row1 = Array.isArray(sourceNode.relativeTransform[1]) ? sourceNode.relativeTransform[1] : null;
    if (!row0 || !row1 || row0.length < 3 || row1.length < 3) {
      return false;
    }

    targetNode.relativeTransform = [
      [Number(row0[0]) || 0, Number(row0[1]) || 0, roundBoundsFitMetric(Number(row0[2]) || 0)],
      [Number(row1[0]) || 0, Number(row1[1]) || 0, roundBoundsFitMetric(Number(row1[2]) || 0)],
    ];
    return true;
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
      const newVisibleFill =
        session && session.captureMode === "source-image"
          ? cloneImagePaintWithHash(originalFill, newImageHash)
          : cloneRenderedUpscaleImagePaint(originalFill, newImageHash);
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

  async function applyGeneratedPromptImagePlacement(session, newImageHash, byteLength) {
    const skipped = [];
    let resultNode = null;
    let placementMode = "";

    try {
      if (session.targetKind === "new-image-placement") {
        resultNode = createPromptPlacementResultNode(session, newImageHash);
        placementMode = await placePromptGeneratedNodeFromAnchor(session, resultNode);
      } else {
        const targetNode = await figma.getNodeByIdAsync(session.targetNodeId);
        if (!targetNode || targetNode.removed) {
          throw new Error("Could not find the selected target layer again.");
        }
        if ("locked" in targetNode && targetNode.locked) {
          throw new Error("Locked layers are not supported for prompt edit/generation.");
        }
        if ("rotation" in targetNode && typeof targetNode.rotation === "number" && Math.abs(targetNode.rotation) > 0.01) {
          throw new Error("Rotated layers are not supported for prompt edit/generation yet.");
        }

        resultNode = createPromptPlacementResultNode(session, newImageHash);
        if (canUsePromptPlacementContainer(targetNode)) {
          targetNode.insertChild(targetNode.children.length, resultNode);
          setImageExtendNodePosition(resultNode, 0, 0);
          placementMode = "inside-target";
        } else if (
          targetNode.parent &&
          canUsePromptPlacementContainer(targetNode.parent) &&
          !isAutoLayoutNode(targetNode.parent)
        ) {
          const localBounds = getImageExtendLocalBounds(targetNode);
          if (!localBounds) {
            throw new Error("Could not determine the selected layer position.");
          }
          const parent = targetNode.parent;
          const insertIndex = findNodeChildIndex(parent, targetNode.id);
          if (insertIndex >= 0) {
            parent.insertChild(insertIndex + 1, resultNode);
          } else {
            parent.insertChild(parent.children.length, resultNode);
          }
          setImageExtendNodePosition(resultNode, localBounds.x, localBounds.y);
          placementMode = "sibling-overlay";
        } else {
          const absoluteRect = getBoundsFitNodeRect(targetNode);
          if (!absoluteRect) {
            throw new Error("Could not determine the selected layer bounds.");
          }
          figma.currentPage.appendChild(resultNode);
          resultNode.x = absoluteRect.x;
          resultNode.y = absoluteRect.y;
          placementMode = "page-overlay";
        }
      }

      if (resultNode) {
        figma.currentPage.selection = [resultNode];
        if (typeof figma.viewport.scrollAndZoomIntoView === "function") {
          figma.viewport.scrollAndZoomIntoView([resultNode]);
        }
      }
    } catch (error) {
      if (resultNode && !resultNode.removed && resultNode.parent) {
        resultNode.remove();
      }
      skipped.push({
        nodeId: session.targetNodeId,
        nodeName: session.targetNodeName,
        reason: normalizeErrorMessage(error, PROMPT_PLACEMENT_APPLY_ERROR_MESSAGE),
      });
      resultNode = null;
    }

    return buildPromptPlacementApplyResult(session, resultNode, byteLength, skipped, placementMode);
  }

  async function placePromptGeneratedNodeFromAnchor(session, resultNode) {
    if (
      session &&
      session.targetNodeId &&
      typeof session.targetNodeId === "string" &&
      session.targetNodeId &&
      session.placementMode === "below-selected-text"
    ) {
      const anchorNode = await figma.getNodeByIdAsync(session.targetNodeId);
      if (
        anchorNode &&
        !anchorNode.removed &&
        (!("locked" in anchorNode) || !anchorNode.locked) &&
        (!("rotation" in anchorNode) || typeof anchorNode.rotation !== "number" || Math.abs(anchorNode.rotation) <= 0.01)
      ) {
        const localBounds = getImageExtendLocalBounds(anchorNode);
        if (
          localBounds &&
          anchorNode.parent &&
          canUsePromptPlacementContainer(anchorNode.parent) &&
          !isAutoLayoutNode(anchorNode.parent)
        ) {
          const parent = anchorNode.parent;
          const insertIndex = findNodeChildIndex(parent, anchorNode.id);
          if (insertIndex >= 0) {
            parent.insertChild(insertIndex + 1, resultNode);
          } else {
            parent.insertChild(parent.children.length, resultNode);
          }
          setImageExtendNodePosition(resultNode, localBounds.x, localBounds.y + localBounds.height + PROMPT_TEXT_ANCHOR_GAP);
          return "below-selected-text";
        }

        const absoluteRect = getBoundsFitNodeRect(anchorNode);
        if (absoluteRect) {
          figma.currentPage.appendChild(resultNode);
          resultNode.x = absoluteRect.x;
          resultNode.y = absoluteRect.y + absoluteRect.height + PROMPT_TEXT_ANCHOR_GAP;
          return "below-selected-text-page";
        }
      }
    }

    const viewportCenter = figma.viewport && figma.viewport.center ? figma.viewport.center : { x: 0, y: 0 };
    figma.currentPage.appendChild(resultNode);
    resultNode.x = roundBoundsFitMetric(viewportCenter.x - resultNode.width / 2);
    resultNode.y = roundBoundsFitMetric(viewportCenter.y - resultNode.height / 2);
    return "viewport-center";
  }

  function createPromptPlacementResultNode(session, newImageHash) {
    const width = Math.max(1, roundBoundsFitPixel(session && session.targetWidth ? session.targetWidth : 1024));
    const height = Math.max(1, roundBoundsFitPixel(session && session.targetHeight ? session.targetHeight : 1024));
    const node = figma.createRectangle();
    node.name = buildPromptPlacementResultName(session);
    node.resize(width, height);
    node.fills = [buildVisibleImageFill(newImageHash)];
    node.strokes = [];
    if ("cornerRadius" in node) {
      node.cornerRadius = 0;
    }
    return node;
  }

  function buildPromptPlacementResultName(session) {
    const baseName =
      session && typeof session.targetNodeName === "string" && session.targetNodeName.trim()
        ? session.targetNodeName.trim()
        : "AI generated image";
    return baseName + " / generated";
  }

  function buildPromptPlacementApplyResult(session, resultNode, byteLength, skipped, placementMode) {
    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: session && session.selectionLabel ? session.selectionLabel : "",
        targetNodeName: session && session.targetNodeName ? session.targetNodeName : "",
        appliedNodeCount: resultNode ? 1 : 0,
        skippedCount: Array.isArray(skipped) ? skipped.length : 0,
        resultNodeId: resultNode && resultNode.id ? resultNode.id : "",
        resultNodeName: resultNode && resultNode.name ? resultNode.name : "",
        placementMode: placementMode || "",
        resultByteLength: byteLength,
      },
      skipped: Array.isArray(skipped) ? skipped.slice(0, 24) : [],
    };
  }

  function isAutoLayoutNode(node) {
    return !!node && "layoutMode" in node && typeof node.layoutMode === "string" && node.layoutMode !== "NONE";
  }

  function canUsePromptPlacementContainer(node) {
    return canUseImageExtendParent(node) && !isAutoLayoutNode(node);
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

  function resolveRenderedUpscaleScaleMode(fill) {
    const scaleMode = typeof (fill && fill.scaleMode) === "string" ? fill.scaleMode : "FILL";
    if (scaleMode === "FIT" || scaleMode === "STRETCH" || scaleMode === "FILL") {
      return scaleMode;
    }
    return "FIT";
  }

  function cloneRenderedUpscaleImagePaint(fill, imageHash) {
    const cloned = cloneImagePaintWithHash(fill, imageHash);
    const resolvedScaleMode = resolveRenderedUpscaleScaleMode(fill);
    cloned.scaleMode = resolvedScaleMode;
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

  function cloneBoundsFitPreservedImagePaint(fill, target, processed) {
    if (!fill || !isImagePaint(fill) || !fill.imageHash || !target || !processed) {
      return null;
    }

    const useRenderedAnalysis = target.analysisMode === "rendered-node";
    const sourceWidth =
      useRenderedAnalysis && Number(processed.sourceWidth) > 0
        ? Number(processed.sourceWidth)
        : Number(target.sourceWidth) > 0
          ? Number(target.sourceWidth)
          : 0;
    const sourceHeight =
      useRenderedAnalysis && Number(processed.sourceHeight) > 0
        ? Number(processed.sourceHeight)
        : Number(target.sourceHeight) > 0
          ? Number(target.sourceHeight)
          : 0;
    const rasterOffsetX =
      useRenderedAnalysis || !Number.isFinite(Number(target.rasterAnalysisOffsetX))
        ? 0
        : Number(target.rasterAnalysisOffsetX);
    const rasterOffsetY =
      useRenderedAnalysis || !Number.isFinite(Number(target.rasterAnalysisOffsetY))
        ? 0
        : Number(target.rasterAnalysisOffsetY);
    const cropX = rasterOffsetX + (Number(processed.cropX) || 0);
    const cropY = rasterOffsetY + (Number(processed.cropY) || 0);
    const cropWidth = Number(processed.cropWidth) > 0 ? Number(processed.cropWidth) : 0;
    const cropHeight = Number(processed.cropHeight) > 0 ? Number(processed.cropHeight) : 0;

    if (!(sourceWidth > 0) || !(sourceHeight > 0) || !(cropWidth > 0) || !(cropHeight > 0)) {
      return null;
    }

    const cloned = cloneImagePaintWithHash(fill, fill.imageHash);
    cloned.scaleMode = "CROP";
    cloned.imageTransform = [
      [cropWidth / sourceWidth, 0, cropX / sourceWidth],
      [0, cropHeight / sourceHeight, cropY / sourceHeight],
    ];
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
    const appliedNodeCount =
      typeof summary.appliedNodeCount === "number" && Number.isFinite(summary.appliedNodeCount)
        ? summary.appliedNodeCount
        : 0;
    const skippedCount =
      typeof summary.skippedCount === "number" && Number.isFinite(summary.skippedCount) ? summary.skippedCount : 0;
    const skipped = result && Array.isArray(result.skipped) ? result.skipped : [];
    const firstSkippedReason =
      skipped.length && skipped[0] && typeof skipped[0].reason === "string" ? skipped[0].reason.trim() : "";

    if (!appliedFillCount && !appliedNodeCount) {
      const message = firstSkippedReason
        ? "AI image result could not be applied: " + firstSkippedReason
        : "AI image result could not be applied.";
      figma.notify(message, { timeout: 3200, error: true });
      return;
    }

    let message = operationLabel || "AI Image";
    if (appliedFillCount > 0) {
      message += " complete (" + appliedFillCount + " fill applied";
    } else {
      message += " complete (" + appliedNodeCount + " layer created";
    }
    if (skippedCount > 0) {
      message += ", " + skippedCount + " skipped";
    }
    figma.notify(message + ")", { timeout: 2600 });
  }

  function sanitizeOperationLabel(value) {
    const label = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    return label || "AI Image";
  }

  function isBoundsFitOperation(options) {
    const operationKind =
      options && typeof options.operationKind === "string" ? options.operationKind.replace(/\s+/g, " ").trim().toLowerCase() : "";
    if (operationKind === "bounds-fit") {
      return true;
    }
    const operationLabel = sanitizeOperationLabel(options && options.operationLabel);
    return /bounds\s*fit/i.test(operationLabel);
  }

  function isImageExtendOperation(options) {
    const operationKind =
      options && typeof options.operationKind === "string" ? options.operationKind.replace(/\s+/g, " ").trim().toLowerCase() : "";
    if (operationKind === "image-extend") {
      return true;
    }
    const operationLabel = sanitizeOperationLabel(options && options.operationLabel);
    return /extend|확장/i.test(operationLabel);
  }

  function sanitizeSourceMode(value) {
    const mode = typeof value === "string" ? value.replace(/\s+/g, " ").trim().toLowerCase() : "";
    return mode === "shape-or-image" || mode === "prompt-smart" ? mode : "image-fill-only";
  }

  function shouldPreferOriginalUpscaleSource(message) {
    if (message && message.preferOriginalImageBytes === true) {
      return true;
    }
    return isSharpenOperationLabel(message && message.operationLabel) || isUpscaleOperationLabel(message && message.operationLabel);
  }

  function sanitizePromptOutputSize(value) {
    const normalized = typeof value === "string" ? value.replace(/\s+/g, "").trim().toUpperCase() : "";
    return normalized === "2K" || normalized === "4K" ? normalized : "1K";
  }

  function isSharpenOperationLabel(value) {
    const label = sanitizeOperationLabel(value);
    return label === "샤프닝" || /sharpen/i.test(label);
  }

  function isUpscaleOperationLabel(value) {
    const label = sanitizeOperationLabel(value);
    return /업스케일|upscale/i.test(label);
  }

  function shouldPreferOriginalUpscaleSource(message) {
    if (message && message.preferOriginalImageBytes === true) {
      return true;
    }
    return isSharpenOperationLabel(message && message.operationLabel) || isUpscaleOperationLabel(message && message.operationLabel);
  }

  function buildPromptPlacementDimensions(outputSize) {
    const normalizedSize = sanitizePromptOutputSize(outputSize);
    if (normalizedSize === "4K") {
      return { width: 4096, height: 4096 };
    }
    if (normalizedSize === "2K") {
      return { width: 2048, height: 2048 };
    }
    return { width: 1024, height: 1024 };
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

  async function collectPromptDraftSourceFromSelection() {
    const selection = Array.from(figma.currentPage.selection || []).filter(Boolean);
    if (!selection.length) {
      throw new Error(PROMPT_DRAFT_SOURCE_NOT_FOUND_MESSAGE);
    }

    const selectedRangeText = getSelectedTextRangeSnapshot();
    const textPayload = collectPromptDraftTextPayload(selection, selectedRangeText);
    const visualNodes = selection.filter(function (node) {
      return !!node && !node.removed && node.type !== "TEXT";
    });

    if (visualNodes.length > 1) {
      throw new Error(PROMPT_SMART_SELECTION_MESSAGE);
    }

    if (visualNodes.length === 1) {
      const source = await buildPromptDraftVisualSource(visualNodes[0], selection);
      if (textPayload && textPayload.text) {
        source.sourceType = "mixed";
        source.text = textPayload.text;
        source.summary = source.summary || {};
        source.summary.textLength = textPayload.text.length;
        source.summary.textMode = textPayload.textMode;
      }
      return source;
    }

    if (textPayload && textPayload.text) {
      return {
        sourceType: "text",
        text: textPayload.text,
        summary: {
          selectionLabel: formatSelectionLabel(selection),
          targetNodeName: textPayload.nodeName || safeName(selection[0]),
          textMode: textPayload.textMode,
          textLength: textPayload.text.length,
        },
      };
    }

    throw new Error(PROMPT_DRAFT_SOURCE_NOT_FOUND_MESSAGE);
  }

  function collectPromptDraftTextPayload(selection, selectedRangeText) {
    if (selectedRangeText && selectedRangeText.text) {
      return {
        text: selectedRangeText.text,
        textMode: "selected-range",
        nodeName: selectedRangeText.nodeName,
      };
    }

    if (selection.every(function (node) { return node && node.type === "TEXT"; })) {
      const directText = collectReferenceTextFromNodes(selection, {
        maxNodes: 8,
        maxLength: 600,
        includeDescendants: false,
      });
      if (directText) {
        return {
          text: directText,
          textMode: "text-selection",
          nodeName: safeName(selection[0]),
        };
      }
    }

    const fallbackText = collectReferenceTextFromNodes(selection, {
      maxNodes: 10,
      maxLength: 720,
      includeDescendants: true,
    });
    if (fallbackText) {
      return {
        text: fallbackText,
        textMode: "selection-descendants",
        nodeName: safeName(selection[0]),
      };
    }

    return null;
  }

  async function buildPromptDraftVisualSource(node, selection) {
    if (!node || node.removed || typeof node.exportAsync !== "function") {
      throw new Error(PROMPT_TARGET_EXPORT_ERROR_MESSAGE);
    }

    if (hasChildren(node)) {
      let collection = null;
      try {
        collection = await collectImageCompositeTargetsFromSelection([node]);
      } catch (error) {
        collection = null;
      }
      if (collection && Array.isArray(collection.layers)) {
        const imageLayerCount = collection.layers.filter(function (layer) {
          return !!layer && layer.layerKind === "image";
        }).length;
        if (imageLayerCount >= 2) {
          throw new Error(PROMPT_MULTI_IMAGE_CONTAINER_MESSAGE);
        }
      }
    }

    const bytes = await node.exportAsync({
      format: "PNG",
      useAbsoluteBounds: false,
    });
    if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
      throw new Error(PROMPT_TARGET_EXPORT_EMPTY_MESSAGE);
    }

    const bounds = getBoundsFitNodeRect(node);
    return {
      sourceType: "image",
      image: {
        bytes: bytes,
        mimeType: "image/png",
        fileName: buildFileName(
          {
            nodeName: safeName(node),
            imageHash: node.id,
          },
          "png"
        ),
      },
      summary: {
        selectionLabel: formatSelectionLabel(selection),
        targetNodeName: safeName(node),
        captureMode: "rendered-node",
        targetWidth: bounds ? bounds.width : roundBoundsFitMetric(node.width),
        targetHeight: bounds ? bounds.height : roundBoundsFitMetric(node.height),
        byteLength: bytes.length,
      },
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

  function shapeEditNeedsPlaceholderSource(node) {
    return !hasRenderablePaints(node && node.fills) && !hasRenderablePaints(node && node.strokes);
  }

  function hasRenderablePaints(paints) {
    return Array.isArray(paints) && paints.some(isRenderablePaint);
  }

  function isRenderablePaint(paint) {
    if (!paint || paint.visible === false) {
      return false;
    }

    if (paint.type === "IMAGE") {
      return typeof paint.imageHash === "string" && paint.imageHash.length > 0;
    }

    const opacity = typeof paint.opacity === "number" && Number.isFinite(paint.opacity) ? Number(paint.opacity) : 1;
    if (!(opacity > 0.001)) {
      return false;
    }

    return (
      paint.type === "SOLID" ||
      paint.type === "GRADIENT_LINEAR" ||
      paint.type === "GRADIENT_RADIAL" ||
      paint.type === "GRADIENT_ANGULAR" ||
      paint.type === "GRADIENT_DIAMOND"
    );
  }

  async function exportShapeEditPlaceholderPng(node) {
    const width = typeof node.width === "number" && Number.isFinite(node.width) ? Math.max(1, Math.round(node.width)) : 0;
    const height = typeof node.height === "number" && Number.isFinite(node.height) ? Math.max(1, Math.round(node.height)) : 0;
    if (!(width > 0) || !(height > 0)) {
      throw new Error(SHAPE_EXPORT_SOURCE_ERROR_MESSAGE);
    }

    const placeholder = figma.createRectangle();
    try {
      placeholder.name = "__pigma-shape-source-placeholder__";
      placeholder.resize(width, height);
      placeholder.fills = [createSolidPaintFromColor("#f4f4f5", 1)];
      placeholder.strokes = [];
      placeholder.x = -100000;
      placeholder.y = -100000;
      figma.currentPage.appendChild(placeholder);
      return await placeholder.exportAsync({
        format: "PNG",
        useAbsoluteBounds: false,
      });
    } finally {
      if (placeholder && !placeholder.removed) {
        placeholder.remove();
      }
    }
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
    const selection = Array.from(figma.currentPage.selection || []).filter(Boolean);
    if (!selection.length) {
      throw new Error("Select a frame, group, text, or image layer first.");
    }

    const state = {
      targets: [],
      containers: [],
      skipped: [],
      targetNodeIds: {},
      containerNodeIds: {},
      skippedNodeIds: {},
    };

    for (let index = 0; index < selection.length; index += 1) {
      await collectBoundsFitPlansFromNode(selection[index], state, true);
    }

    return {
      selection: selection,
      targets: state.targets,
      containers: state.containers,
      skipped: state.skipped,
    };
  }

  async function collectBoundsFitPlansFromNode(node, state, isRootSelection) {
    if (!node || node.removed) {
      if (isRootSelection) {
        appendBoundsFitSkipped(buildBoundsFitSkipped(node, "The selected layer could not be read."), state);
      }
      return false;
    }

    if (!isBoundsFitNodeVisible(node)) {
      if (isRootSelection) {
        appendBoundsFitSkipped(buildBoundsFitSkipped(node, "Hidden layers are not supported for bounds-fit."), state);
      }
      return false;
    }

    if ("locked" in node && node.locked) {
      if (isRootSelection) {
        appendBoundsFitSkipped(buildBoundsFitSkipped(node, "Locked layers are not supported for bounds-fit."), state);
      }
      return false;
    }

    if (hasChildren(node)) {
      let hasEligibleDescendant = false;
      for (let index = 0; index < node.children.length; index += 1) {
        if (await collectBoundsFitPlansFromNode(node.children[index], state, false)) {
          hasEligibleDescendant = true;
        }
      }

      if (hasEligibleDescendant && canApplyBoundsFitContainer(node)) {
        appendBoundsFitContainerPlan(node, state, {
          selectedRoot: isRootSelection,
        });
      } else if (isRootSelection && !hasEligibleDescendant) {
        appendBoundsFitSkipped(
          buildBoundsFitSkipped(
            node,
            isBoundsFitContainerTreeNode(node)
              ? "Could not find visible text or image layers inside the selected container."
              : buildBoundsFitUnsupportedRootReason(node)
          ),
          state
        );
      }

      return hasEligibleDescendant;
    }

    let analysis = null;
    if (isBoundsFitTextSelectionNodeCandidate(node)) {
      analysis = await analyzeBoundsFitTextSelectionNode(node);
    } else if (isBoundsFitImageSelectionNodeCandidate(node)) {
      analysis = await analyzeBoundsFitImageSelectionNode(node);
    } else {
      if (isRootSelection) {
        appendBoundsFitSkipped(buildBoundsFitSkipped(node, buildBoundsFitUnsupportedRootReason(node)), state);
      }
      return false;
    }

    if (analysis && analysis.target) {
      appendBoundsFitTarget(analysis.target, state);
      return true;
    }

    if (analysis && analysis.skipped && isRootSelection) {
      appendBoundsFitSkipped(analysis, state);
    }

    return false;
  }

  function appendBoundsFitTarget(target, state) {
    if (!target || !target.nodeId || !state || !state.targetNodeIds) {
      return;
    }

    if (state.targetNodeIds[target.nodeId]) {
      return;
    }

    state.targetNodeIds[target.nodeId] = true;
    state.targets.push(target);
  }

  function appendBoundsFitContainerPlan(node, state, options) {
    if (!node || !node.id || !state || !state.containerNodeIds) {
      return;
    }

    const existingIndex =
      typeof state.containerNodeIds[node.id] === "number" && state.containerNodeIds[node.id] >= 0
        ? state.containerNodeIds[node.id]
        : -1;
    if (existingIndex >= 0) {
      if (options && options.selectedRoot === true && state.containers[existingIndex]) {
        state.containers[existingIndex].selectedRoot = true;
      }
      return;
    }

    state.containerNodeIds[node.id] = state.containers.length;
    state.containers.push({
      nodeId: node.id,
      nodeName: safeName(node),
      nodeType: typeof node.type === "string" ? node.type : "",
      depth: getBoundsFitNodeDepth(node),
      selectedRoot: !!(options && options.selectedRoot === true),
    });
  }

  function appendBoundsFitSkipped(analysis, state) {
    const skipped = analysis && analysis.skipped ? analysis.skipped : analysis;
    if (!skipped || !state || !Array.isArray(state.skipped)) {
      return;
    }

    const key = skipped.nodeId || skipped.nodeName || skipped.reason;
    if (key && state.skippedNodeIds && state.skippedNodeIds[key]) {
      return;
    }

    if (key && state.skippedNodeIds) {
      state.skippedNodeIds[key] = true;
    }

    state.skipped.push(skipped);
  }

  function isBoundsFitNodeVisible(node) {
    return !!node && (!("visible" in node) || node.visible !== false);
  }

  function isBoundsFitContainerTreeNode(node) {
    if (!node || !hasChildren(node)) {
      return false;
    }

    return node.type === "FRAME" || node.type === "GROUP" || node.type === "SECTION" || node.type === "INSTANCE";
  }

  function isBoundsFitAutoLayoutNode(node) {
    return !!node && "layoutMode" in node && typeof node.layoutMode === "string" && node.layoutMode !== "NONE";
  }

  function isBoundsFitAutoLayoutChildNode(node) {
    return !!node && !!node.parent && isBoundsFitAutoLayoutNode(node.parent);
  }

  function canMoveBoundsFitNode(node) {
    if (!node) {
      return false;
    }

    if (!isBoundsFitAutoLayoutChildNode(node)) {
      return true;
    }

    return "layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE";
  }

  function shouldPreserveBoundsFitTextWidth(node) {
    if (!node || node.type !== "TEXT") {
      return false;
    }

    if (isBoundsFitAutoLayoutChildNode(node)) {
      return true;
    }

    if ("textAutoResize" in node && typeof node.textAutoResize === "string" && node.textAutoResize === "NONE") {
      return true;
    }

    return false;
  }

  function shouldResizeBoundsFitContainer(node) {
    if (!node || node.type === "GROUP") {
      return false;
    }

    if (isBoundsFitAutoLayoutChildNode(node) && (!("layoutPositioning" in node) || node.layoutPositioning !== "ABSOLUTE")) {
      return false;
    }

    return true;
  }

  function canApplyBoundsFitContainer(node) {
    if (!isBoundsFitContainerTreeNode(node)) {
      return false;
    }

    if ("rotation" in node && typeof node.rotation === "number" && Math.abs(node.rotation) > 0.01) {
      return false;
    }

    if (node.type !== "GROUP" && !canResizeBoundsFitNode(node)) {
      return false;
    }

    return true;
  }

  function buildBoundsFitUnsupportedRootReason(node) {
    if (!node) {
      return "Could not find an eligible layer for bounds-fit.";
    }

    if (hasChildren(node)) {
      return buildBoundsFitContainerUnsupportedReason(node);
    }

    return "Bounds-fit currently supports text layers, image layers, and groups/frames that contain them.";
  }

  function buildBoundsFitContainerUnsupportedReason(node) {
    if (!node) {
      return "Could not find an eligible container for bounds-fit.";
    }

    if (!isBoundsFitContainerTreeNode(node)) {
      return "Bounds-fit container mode currently supports groups, frames, sections, and instances that contain text or image layers.";
    }

    if ("rotation" in node && typeof node.rotation === "number" && Math.abs(node.rotation) > 0.01) {
      return "Rotated containers are not supported yet.";
    }

    if (node.type !== "GROUP" && !canResizeBoundsFitNode(node)) {
      return "Bounds-fit could not resize the selected container.";
    }

    return "Bounds-fit could not find visible text or image layers inside the selected container.";
  }

  function isBoundsFitTextSelectionNodeCandidate(node) {
    return !!node && node.type === "TEXT";
  }

  function isBoundsFitImageSelectionNodeCandidate(node) {
    return !!node && !hasChildren(node) && hasSimpleVisibleImagePaint(node);
  }

  function isBoundsFitPreferredContentNode(node) {
    return isBoundsFitTextSelectionNodeCandidate(node) || isBoundsFitImageSelectionNodeCandidate(node);
  }

  function canResizeBoundsFitNode(node) {
    return !!node && (typeof node.resizeWithoutConstraints === "function" || typeof node.resize === "function");
  }

  function getBoundsFitNodeDepth(node) {
    let depth = 0;
    let current = node && node.parent ? node.parent : null;
    while (current) {
      depth += 1;
      current = current.parent;
    }
    return depth;
  }

  const IMAGE_COMPOSITE_MAX_LAYER_COUNT = 8;

  async function collectImageCompositeTargetsFromSelection(selectionInput) {
    const selection = Array.isArray(selectionInput)
      ? selectionInput.filter(Boolean)
      : Array.from(figma.currentPage.selection || []).filter(Boolean);
    if (!selection.length) {
      throw new Error("Select a frame or 2 to 8 visible visual layers first.");
    }
    const rootSelection = resolveImageCompositeSelectionRoot(selection);
    const rootRect = rootSelection ? getBoundsFitNodeRect(rootSelection) : null;
    const candidateNodes = collectImageCompositeCandidateNodes(selection);

    const layers = [];
    const skipped = [];

    for (let index = 0; index < candidateNodes.length; index += 1) {
      const analysis = await analyzeImageCompositeSelectionNode(candidateNodes[index], {
        rootRect: rootRect,
      });
      if (analysis && analysis.target) {
        layers.push(analysis.target);
      } else if (analysis && analysis.skipped) {
        skipped.push(analysis.skipped);
      }
    }

    if (!layers.length) {
      throw new Error(buildImageCompositeEmptySelectionMessage(layers, skipped));
    }

    layers.sort(function (left, right) {
      return compareSceneNodeCanvasOrder(left.node, right.node);
    });

    const trimmedLayers = trimImageCompositeLayersForPayload(layers, skipped, IMAGE_COMPOSITE_MAX_LAYER_COUNT);

    const unionRect =
      rootRect ||
      unionAbsoluteRects(
        trimmedLayers.map(function (layer) {
          return layer.visibleRect;
        })
      );
    if (!unionRect) {
      throw new Error(buildImageCompositeEmptySelectionMessage(trimmedLayers, skipped));
    }

    for (let index = 0; index < trimmedLayers.length; index += 1) {
      const layer = trimmedLayers[index];
      layer.role = index === 0 ? "background" : "foreground";
      layer.orderIndex = index;
      layer.offsetX = roundBoundsFitMetric(layer.visibleRect.x - unionRect.x);
      layer.offsetY = roundBoundsFitMetric(layer.visibleRect.y - unionRect.y);
    }

    return {
      selection: selection,
      selectedRoot: rootSelection,
      layers: trimmedLayers,
      skipped: skipped,
      unionRect: unionRect,
    };
  }

  function resolveImageCompositeSelectionRoot(selection) {
    if (!Array.isArray(selection) || selection.length !== 1) {
      return null;
    }

    const node = selection[0];
    if (!node || node.removed || !hasChildren(node)) {
      return null;
    }

    return getBoundsFitNodeRect(node) ? node : null;
  }

  function getImageCompositeLayerArea(layer) {
    const rect = layer && layer.visibleRect ? layer.visibleRect : null;
    const width = rect && Number(rect.width) > 0 ? Number(rect.width) : 0;
    const height = rect && Number(rect.height) > 0 ? Number(rect.height) : 0;
    return width * height;
  }

  function getImageCompositeLayerWeight(layer) {
    if (!layer || layer.layerKind === "image") {
      return 3;
    }
    if (layer.layerKind === "text") {
      return 2.4;
    }
    return 1.8;
  }

  function trimImageCompositeLayersForPayload(layers, skipped, maxCount) {
    if (!Array.isArray(layers) || layers.length <= maxCount) {
      return Array.isArray(layers) ? layers.slice() : [];
    }

    const ranked = layers
      .slice()
      .sort(function (left, right) {
        const scoreDelta =
          getImageCompositeLayerArea(right) * getImageCompositeLayerWeight(right) -
          getImageCompositeLayerArea(left) * getImageCompositeLayerWeight(left);
        if (Math.abs(scoreDelta) > 0.01) {
          return scoreDelta > 0 ? 1 : -1;
        }
        return compareSceneNodeCanvasOrder(left.node, right.node);
      })
      .slice(0, maxCount);
    const kept = {};
    for (let index = 0; index < ranked.length; index += 1) {
      kept[ranked[index].nodeId] = true;
    }

    const result = [];
    for (let index = 0; index < layers.length; index += 1) {
      const layer = layers[index];
      if (layer && kept[layer.nodeId]) {
        result.push(layer);
        continue;
      }
      skipped.push({
        nodeId: layer && typeof layer.nodeId === "string" ? layer.nodeId : "",
        nodeName: layer && typeof layer.nodeName === "string" ? layer.nodeName : "",
        reason: "Skipped because image composite currently keeps up to 8 of the most prominent visible layers.",
      });
    }

    return result;
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

  function roundBoundsFitPixel(value) {
    return Math.round(Number(value) || 0);
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

  function readBoundsFitRectCandidate(getter) {
    if (typeof getter !== "function") {
      return null;
    }
    try {
      const rect = getter();
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
    } catch (error) {
      return null;
    }
  }

  function getBoundsFitTransformRect(node) {
    if (!node) {
      return null;
    }

    try {
      const width = Number(node.width) || 0;
      const height = Number(node.height) || 0;
      if (!(width > 0) || !(height > 0)) {
        return null;
      }

      const transform = Array.isArray(node.absoluteTransform) ? node.absoluteTransform : null;
      if (!transform || transform.length < 2) {
        return null;
      }

      const axisAligned =
        Math.abs(Number(transform[0][1]) || 0) <= 0.0001 && Math.abs(Number(transform[1][0]) || 0) <= 0.0001;
      if (!axisAligned) {
        return null;
      }

      return {
        x: roundBoundsFitMetric(Number(transform[0][2]) || 0),
        y: roundBoundsFitMetric(Number(transform[1][2]) || 0),
        width: roundBoundsFitMetric(width),
        height: roundBoundsFitMetric(height),
      };
    } catch (error) {
      return null;
    }
  }

  function getBoundsFitNodeRect(node) {
    const isTextNode = !!node && node.type === "TEXT";
    const transformRect = getBoundsFitTransformRect(node);

    const preferredRect = isTextNode
      ? readBoundsFitRectCandidate(function () {
          return node.absoluteRenderBounds;
        }) ||
        readBoundsFitRectCandidate(function () {
          return node.absoluteBoundingBox;
        }) ||
        transformRect
      : transformRect ||
        readBoundsFitRectCandidate(function () {
          return node.absoluteBoundingBox;
        }) ||
        readBoundsFitRectCandidate(function () {
          return node.absoluteRenderBounds;
        });

    return preferredRect || null;
  }

  function getBoundsFitNodeLayoutRect(node) {
    return (
      readBoundsFitRectCandidate(function () {
        return node.absoluteBoundingBox;
      }) ||
      getBoundsFitTransformRect(node) ||
      getBoundsFitNodeRect(node)
    );
  }

  function getBoundsFitNodeRenderRect(node) {
    return readBoundsFitRectCandidate(function () {
      return node.absoluteRenderBounds;
    });
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

  function resolveBoundsFitRenderedExportScale(nodeWidth, nodeHeight, sourceWidth, sourceHeight) {
    // Bounds-fit only needs the currently visible pixels to shrink the layer.
    // Exporting at the on-canvas size is the most stable path for edited Figma images.
    return 1;
  }

  function resolveBoundsFitSourceImageAnalysis(fill, nodeWidth, nodeHeight, sourceWidth, sourceHeight, analysisContext) {
    if (!fill || !(nodeWidth > 0) || !(nodeHeight > 0) || !(sourceWidth > 0) || !(sourceHeight > 0) || !analysisContext) {
      return null;
    }

    const scaleMode = typeof fill.scaleMode === "string" ? fill.scaleMode : "FILL";
    const fillRotation = typeof fill.rotation === "number" && Number.isFinite(fill.rotation) ? fill.rotation : 0;
    if (!!fill.imageTransform || Math.abs(fillRotation) > 0.01 || scaleMode === "CROP" || scaleMode === "TILE") {
      return null;
    }

    const localVisibleRect = {
      x: roundBoundsFitMetric(analysisContext.offsetX),
      y: roundBoundsFitMetric(analysisContext.offsetY),
      width: roundBoundsFitMetric(analysisContext.visibleRect.width),
      height: roundBoundsFitMetric(analysisContext.visibleRect.height),
    };

    if (scaleMode === "STRETCH") {
      const scaleX = sourceWidth / nodeWidth;
      const scaleY = sourceHeight / nodeHeight;
      return {
        analysisOffsetX: localVisibleRect.x,
        analysisOffsetY: localVisibleRect.y,
        analysisWidth: localVisibleRect.width,
        analysisHeight: localVisibleRect.height,
        rasterAnalysisOffsetX: roundBoundsFitMetric(localVisibleRect.x * scaleX),
        rasterAnalysisOffsetY: roundBoundsFitMetric(localVisibleRect.y * scaleY),
        rasterAnalysisWidth: roundBoundsFitMetric(localVisibleRect.width * scaleX),
        rasterAnalysisHeight: roundBoundsFitMetric(localVisibleRect.height * scaleY),
      };
    }

    const uniformScale =
      scaleMode === "FIT" ? Math.min(nodeWidth / sourceWidth, nodeHeight / sourceHeight) : Math.max(nodeWidth / sourceWidth, nodeHeight / sourceHeight);
    if (!(uniformScale > 0)) {
      return null;
    }

    const displayRect = {
      x: roundBoundsFitMetric((nodeWidth - sourceWidth * uniformScale) / 2),
      y: roundBoundsFitMetric((nodeHeight - sourceHeight * uniformScale) / 2),
      width: roundBoundsFitMetric(sourceWidth * uniformScale),
      height: roundBoundsFitMetric(sourceHeight * uniformScale),
    };
    const visibleImageRect = intersectBoundsFitRects(localVisibleRect, displayRect);
    if (!visibleImageRect) {
      return null;
    }

    return {
      analysisOffsetX: visibleImageRect.x,
      analysisOffsetY: visibleImageRect.y,
      analysisWidth: visibleImageRect.width,
      analysisHeight: visibleImageRect.height,
      rasterAnalysisOffsetX: roundBoundsFitMetric((visibleImageRect.x - displayRect.x) / uniformScale),
      rasterAnalysisOffsetY: roundBoundsFitMetric((visibleImageRect.y - displayRect.y) / uniformScale),
      rasterAnalysisWidth: roundBoundsFitMetric(visibleImageRect.width / uniformScale),
      rasterAnalysisHeight: roundBoundsFitMetric(visibleImageRect.height / uniformScale),
    };
  }

  async function exportBoundsFitRenderedAnalysisBytes(node, analysisContext, exportScale) {
    const visibleRect = analysisContext && analysisContext.visibleRect ? analysisContext.visibleRect : null;
    if (!visibleRect) {
      return new Uint8Array(0);
    }

    const resolvedExportScale =
      Number.isFinite(Number(exportScale)) && Number(exportScale) > 0 ? Number(exportScale) : 1;
    const exportSettings = {
      format: "PNG",
      // Bounds-fit needs the full node/frame area so the UI can crop visible pixels itself.
      // Using absolute bounds also avoids Figma's internal render-bounds crop path, which
      // has been unstable for some edited images such as background-removed assets.
      useAbsoluteBounds: true,
    };
    if (Math.abs(resolvedExportScale - 1) > 0.01) {
      exportSettings.constraint = {
        type: "SCALE",
        value: resolvedExportScale,
      };
    }

    if (!analysisContext.clipped) {
      return await node.exportAsync(exportSettings);
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

      return await preview.exportAsync(exportSettings);
    } finally {
      if (clonedNode && !clonedNode.removed) {
        clonedNode.remove();
      }
      if (preview && !preview.removed) {
        preview.remove();
      }
    }
  }

  async function analyzeBoundsFitImageSelectionNode(node) {
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

    const renderedExportScale = resolveBoundsFitRenderedExportScale(nodeWidth, nodeHeight, sourceWidth, sourceHeight);
    // Bounds-fit must follow the pixels currently visible on canvas. Raw getImageByHash() bytes can lag
    // behind in-editor image edits such as background removal, so we always analyze the rendered node.
    const analysisContext = getBoundsFitAnalysisContext(node);
    if (!analysisContext) {
      return buildBoundsFitSkipped(node, "Could not calculate the visible bounds for analysis.");
    }

    const directSourceAnalysis = resolveBoundsFitSourceImageAnalysis(
      fill,
      nodeWidth,
      nodeHeight,
      sourceWidth,
      sourceHeight,
      analysisContext
    );
    if (directSourceAnalysis) {
      const directBytes = await image.getBytesAsync();
      if (!directBytes || typeof directBytes.length !== "number" || directBytes.length <= 0) {
        return buildBoundsFitSkipped(node, "Could not read the source image bytes.");
      }

      return {
        target: {
          nodeId: node.id,
          nodeName: safeName(node),
          targetKind: "image-fill",
          analysisMode: "source-image",
          fillIndex: fillIndex,
          originalHash: fill.imageHash,
          sourceWidth: sourceWidth,
          sourceHeight: sourceHeight,
          analysisOffsetX: directSourceAnalysis.analysisOffsetX,
          analysisOffsetY: directSourceAnalysis.analysisOffsetY,
          analysisWidth: directSourceAnalysis.analysisWidth,
          analysisHeight: directSourceAnalysis.analysisHeight,
          rasterAnalysisOffsetX: directSourceAnalysis.rasterAnalysisOffsetX,
          rasterAnalysisOffsetY: directSourceAnalysis.rasterAnalysisOffsetY,
          rasterAnalysisWidth: directSourceAnalysis.rasterAnalysisWidth,
          rasterAnalysisHeight: directSourceAnalysis.rasterAnalysisHeight,
          fileName: buildFileName(
            {
              nodeName: safeName(node),
              imageHash: fill.imageHash,
            },
            detectImageExtension(directBytes) === "bin" ? "png" : detectImageExtension(directBytes)
          ),
          mimeType: detectImageMimeType(directBytes),
          bytes: directBytes,
        },
      };
    }

    const exportSettings = {
      format: "PNG",
      useAbsoluteBounds: true,
    };
    if (Math.abs(renderedExportScale - 1) > 0.01) {
      exportSettings.constraint = {
        type: "SCALE",
        value: renderedExportScale,
      };
    }

    let bytes = new Uint8Array(0);
    let analysisMode = "rendered-node";
    let mimeType = "image/png";
    let rasterAnalysisOffsetX = analysisContext.offsetX;
    let rasterAnalysisOffsetY = analysisContext.offsetY;
    let rasterAnalysisWidth = analysisContext.visibleRect.width;
    let rasterAnalysisHeight = analysisContext.visibleRect.height;

    try {
      bytes = await node.exportAsync(exportSettings);
    } catch (error) {
      let previewExportError = null;
      try {
        // Some edited fills (notably background-removed assets in crop mode) can fail
        // direct exportAsync(). Exporting a temporary preview clone still captures the
        // currently visible pixels and keeps bounds-fit usable for those layers.
        bytes = await exportBoundsFitRenderedAnalysisBytes(
          node,
          {
            visibleRect: analysisContext.visibleRect,
            clipped: true,
          },
          renderedExportScale
        );
        if (bytes && typeof bytes.length === "number" && bytes.length > 0) {
          rasterAnalysisOffsetX = 0;
          rasterAnalysisOffsetY = 0;
          rasterAnalysisWidth = analysisContext.visibleRect.width;
          rasterAnalysisHeight = analysisContext.visibleRect.height;
        }
      } catch (previewError) {
        previewExportError = previewError;
      }

      if (bytes && typeof bytes.length === "number" && bytes.length > 0) {
        // Recovered with the preview export path.
      } else {
        const scaleMode = typeof fill.scaleMode === "string" ? fill.scaleMode : "FILL";
        const fillRotation = typeof fill.rotation === "number" && Number.isFinite(fill.rotation) ? fill.rotation : 0;
        const canFallbackToSourceImage =
          scaleMode !== "CROP" &&
          scaleMode !== "TILE" &&
          !fill.imageTransform &&
          Math.abs(fillRotation) <= 0.01 &&
          hasMatchingAspectRatio(nodeWidth, nodeHeight, sourceWidth, sourceHeight);
        if (!canFallbackToSourceImage) {
          return buildBoundsFitSkipped(
            node,
            normalizeErrorMessage(
              previewExportError,
              normalizeErrorMessage(error, "Could not export the currently visible image bytes.")
            )
          );
        }

        bytes = await image.getBytesAsync();
        if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
          return buildBoundsFitSkipped(node, "Could not read the source image bytes.");
        }

        analysisMode = "source-image";
        mimeType = detectImageMimeType(bytes);
        const scaleX = sourceWidth / nodeWidth;
        const scaleY = sourceHeight / nodeHeight;
        rasterAnalysisOffsetX = roundBoundsFitMetric(analysisContext.offsetX * scaleX);
        rasterAnalysisOffsetY = roundBoundsFitMetric(analysisContext.offsetY * scaleY);
        rasterAnalysisWidth = roundBoundsFitMetric(analysisContext.visibleRect.width * scaleX);
        rasterAnalysisHeight = roundBoundsFitMetric(analysisContext.visibleRect.height * scaleY);
      }
    }
    if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
      return buildBoundsFitSkipped(node, "Could not export the currently visible image bytes.");
    }

    return {
      target: {
        nodeId: node.id,
        nodeName: safeName(node),
        targetKind: "image-fill",
        analysisMode: analysisMode,
        fillIndex: fillIndex,
        originalHash: fill.imageHash,
        sourceWidth: sourceWidth,
        sourceHeight: sourceHeight,
        analysisOffsetX: analysisContext.offsetX,
        analysisOffsetY: analysisContext.offsetY,
        analysisWidth: analysisContext.visibleRect.width,
        analysisHeight: analysisContext.visibleRect.height,
        rasterAnalysisOffsetX: rasterAnalysisOffsetX,
        rasterAnalysisOffsetY: rasterAnalysisOffsetY,
        rasterAnalysisWidth: rasterAnalysisWidth,
        rasterAnalysisHeight: rasterAnalysisHeight,
        fileName: buildFileName(
          {
            nodeName: safeName(node),
            imageHash: fill.imageHash,
          },
          "png"
        ),
        mimeType: mimeType,
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
      if (!processed && !(target && target.skipRasterAnalysis === true)) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          reason: "Did not receive a UI analysis result.",
        });
        continue;
      }

      if (!processed && target && target.skipRasterAnalysis === true) {
        const directStatus = await applyBoundsFitTargetResult(target, null, skipped);
        if (directStatus === "applied") {
          appliedCount += 1;
        } else if (directStatus === "unchanged") {
          unchangedCount += 1;
        }
        continue;
      }

      if (processed.status === "unchanged") {
        unchangedCount += 1;
        continue;
      }

      if (processed.status === "skipped" || processed.status !== "trimmed") {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          reason: processed.reason || "Could not find visible content bounds.",
        });
        continue;
      }

      const applyStatus = await applyBoundsFitTargetResult(target, processed, skipped);
      if (applyStatus === "applied") {
        appliedCount += 1;
      } else if (applyStatus === "unchanged") {
        unchangedCount += 1;
      }
    }

    const containerPlans = sortBoundsFitContainerPlans(session && Array.isArray(session.containers) ? session.containers : []);
    for (let index = 0; index < containerPlans.length; index += 1) {
      const containerStatus = await applyBoundsFitContainerPlan(containerPlans[index], skipped);
      if (containerStatus === "applied") {
        appliedCount += 1;
      } else if (containerStatus === "unchanged") {
        unchangedCount += 1;
      }
    }

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: session.selectionLabel,
        requestedCount: session.requestedCount,
        eligibleCount: session.targets.length + (session && Array.isArray(session.containers) ? session.containers.length : 0),
        appliedCount: appliedCount,
        unchangedCount: unchangedCount,
        skippedCount: skipped.length,
      },
      skipped: skipped.slice(0, 24),
    };
  }

  async function applyBoundsFitTargetResult(target, processed, skipped) {
    if (!target) {
      return "skipped";
    }

    if (!processed && !(target.targetKind === "text" && target.skipRasterAnalysis === true)) {
      return "skipped";
    }

    if (target.targetKind === "text") {
      return await applyBoundsFitTextTargetResult(target, processed, skipped);
    }

    return await applyBoundsFitImageTargetResult(target, processed, skipped);
  }

  async function applyBoundsFitImageTargetResult(target, processed, skipped) {
    const node = await figma.getNodeByIdAsync(target.nodeId);
    if (!node || node.removed) {
      skipped.push({
        nodeId: target.nodeId,
        nodeName: target.nodeName,
        reason: "Could not find the layer again.",
      });
      return "skipped";
    }

    if (!canResizeBoundsFitNode(node)) {
      skipped.push({
        nodeId: target.nodeId,
        nodeName: safeName(node),
        reason: "This layer cannot be resized.",
      });
      return "skipped";
    }

    const fills = getNodeFills(node);
    if (!fills.length) {
      skipped.push({
        nodeId: target.nodeId,
        nodeName: safeName(node),
        reason: "The IMAGE fill is no longer available.",
      });
      return "skipped";
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
      return "skipped";
    }

    const currentWidth = typeof node.width === "number" && Number.isFinite(node.width) ? node.width : 0;
    const currentHeight = typeof node.height === "number" && Number.isFinite(node.height) ? node.height : 0;
    if (!(currentWidth > 0) || !(currentHeight > 0)) {
      skipped.push({
        nodeId: target.nodeId,
        nodeName: safeName(node),
        reason: "Could not calculate the current layer size.",
      });
      return "skipped";
    }

    const geometry = resolveBoundsFitProcessedGeometry(target, processed, currentWidth, currentHeight);
    if (!geometry) {
      skipped.push({
        nodeId: target.nodeId,
        nodeName: safeName(node),
        reason: "Could not calculate the visible bounds size.",
      });
      return "skipped";
    }

    if (!hasMatchingAspectRatio(geometry.analysisWidth, geometry.analysisHeight, processed.sourceWidth, processed.sourceHeight)) {
      skipped.push({
        nodeId: target.nodeId,
        nodeName: safeName(node),
        reason: "The analyzed crop aspect ratio no longer matches the source image.",
      });
      return "skipped";
    }

    try {
      const nextFills = fills.slice();
      const cropPaint = cloneBoundsFitPreservedImagePaint(nextFills[targetIndex], target, processed);
      if (!cropPaint) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "Could not preserve the original IMAGE fill while fitting visible bounds.",
        });
        return "skipped";
      }
      nextFills[targetIndex] = cropPaint;
      node.fills = nextFills;
      applyBoundsFitGeometry(node, geometry.nextWidth, geometry.nextHeight, geometry.shiftX, geometry.shiftY, null);
      return "applied";
    } catch (error) {
      skipped.push({
        nodeId: target.nodeId,
        nodeName: safeName(node),
        reason: normalizeErrorMessage(error, "Failed to apply bounds-fit."),
      });
      return "skipped";
    }
  }

  async function loadBoundsFitTextFonts(node) {
    if (!node || node.type !== "TEXT") {
      return;
    }

    const fontNames = collectBoundsFitTextFontNames(node);
    for (let index = 0; index < fontNames.length; index += 1) {
      await figma.loadFontAsync(fontNames[index]);
    }
  }

  function collectBoundsFitTextFontNames(node) {
    const fontNames = [];
    const seen = {};

    function pushFont(fontName) {
      if (!fontName || typeof fontName !== "object") {
        return;
      }

      if (typeof fontName.family !== "string" || typeof fontName.style !== "string") {
        return;
      }

      const key = fontName.family + "::" + fontName.style;
      if (seen[key]) {
        return;
      }

      seen[key] = true;
      fontNames.push({
        family: fontName.family,
        style: fontName.style,
      });
    }

    if (typeof node.getRangeAllFontNames === "function" && typeof node.characters === "string" && node.characters.length > 0) {
      try {
        const rangeFonts = node.getRangeAllFontNames(0, node.characters.length);
        for (let index = 0; index < rangeFonts.length; index += 1) {
          pushFont(rangeFonts[index]);
        }
      } catch (error) {}
    }

    if (!fontNames.length && node.fontName && node.fontName !== figma.mixed && typeof node.fontName === "object") {
      pushFont(node.fontName);
    }

    return fontNames;
  }

  async function resolveBoundsFitTextMeasuredRect(node) {
    const layoutRect = getBoundsFitNodeLayoutRect(node);
    if (!layoutRect) {
      return null;
    }

    const renderRect = getBoundsFitNodeRenderRect(node);
    if (renderRect) {
      if (!areBoundsFitRectsEqual(renderRect, layoutRect)) {
        return renderRect;
      }
    }

    await loadBoundsFitTextFonts(node);

    const probe = figma.createFrame();
    let clonedNode = null;
    let flattenedNode = null;

    try {
      probe.name = "__pigma-bounds-fit-text-probe__";
      probe.resize(layoutRect.width, layoutRect.height);
      probe.clipsContent = false;
      probe.fills = [];
      probe.strokes = [];
      probe.x = layoutRect.x;
      probe.y = layoutRect.y;
      figma.currentPage.appendChild(probe);

      clonedNode = node.clone();
      probe.appendChild(clonedNode);
      positionBoundsFitPreviewClone(node, clonedNode, layoutRect);

      flattenedNode = figma.flatten([clonedNode], probe);
      const flattenedRect = getBoundsFitNodeRect(flattenedNode);
      if (!flattenedRect) {
        return renderRect || layoutRect;
      }

      return flattenedRect;
    } catch (error) {
      return renderRect || layoutRect;
    } finally {
      if (clonedNode && !clonedNode.removed) {
        clonedNode.remove();
      }
      if (flattenedNode && !flattenedNode.removed) {
        flattenedNode.remove();
      }
      if (probe && !probe.removed) {
        probe.remove();
      }
    }
  }

  async function applyBoundsFitTextTargetResult(target, processed, skipped) {
    const node = await figma.getNodeByIdAsync(target.nodeId);
    if (!node || node.removed) {
      skipped.push({
        nodeId: target.nodeId,
        nodeName: target.nodeName,
        reason: "Could not find the layer again.",
      });
      return "skipped";
    }

    if (!canResizeBoundsFitNode(node)) {
      skipped.push({
        nodeId: target.nodeId,
        nodeName: safeName(node),
        reason: "This text layer cannot be resized.",
      });
      return "skipped";
    }

    const currentWidth = typeof node.width === "number" && Number.isFinite(node.width) ? node.width : 0;
    const currentHeight = typeof node.height === "number" && Number.isFinite(node.height) ? node.height : 0;
    if (!(currentWidth > 0) || !(currentHeight > 0)) {
      skipped.push({
        nodeId: target.nodeId,
        nodeName: safeName(node),
        reason: "Could not calculate the current text layer size.",
      });
      return "skipped";
    }

    const geometry =
      target.skipRasterAnalysis === true
        ? resolveBoundsFitDirectGeometry(target, currentWidth, currentHeight)
        : resolveBoundsFitProcessedGeometry(target, processed, currentWidth, currentHeight);
    if (!geometry) {
      skipped.push({
        nodeId: target.nodeId,
        nodeName: safeName(node),
        reason: "The visible text bounds are invalid.",
      });
      return "skipped";
    }

    if (shouldPreserveBoundsFitTextWidth(node)) {
      geometry.nextWidth = currentWidth;
      geometry.shiftX = 0;
      geometry.nextHeight = Math.max(currentHeight, geometry.nextHeight);
    }

    if (isBoundsFitAutoLayoutChildNode(node)) {
      geometry.shiftX = 0;
      geometry.shiftY = 0;
      geometry.nextHeight = Math.max(currentHeight, geometry.nextHeight);
    }

    if (
      Math.abs(geometry.shiftX) <= 0.01 &&
      Math.abs(geometry.shiftY) <= 0.01 &&
      Math.abs(geometry.nextWidth - currentWidth) <= 0.01 &&
      Math.abs(geometry.nextHeight - currentHeight) <= 0.01
    ) {
      return "unchanged";
    }

    try {
      applyBoundsFitGeometry(node, geometry.nextWidth, geometry.nextHeight, geometry.shiftX, geometry.shiftY, {
        textAutoResizeNone: true,
        preferWithoutConstraints: true,
      });
      return "applied";
    } catch (error) {
      skipped.push({
        nodeId: target.nodeId,
        nodeName: safeName(node),
        reason: normalizeErrorMessage(error, "Failed to apply bounds-fit to the selected text layer."),
      });
      return "skipped";
    }
  }

  function resolveBoundsFitProcessedGeometry(target, processed, fallbackWidth, fallbackHeight) {
    const analysisWidth =
      Number(target.analysisWidth) > 0 ? Number(target.analysisWidth) : Number(fallbackWidth) > 0 ? Number(fallbackWidth) : 0;
    const analysisHeight =
      Number(target.analysisHeight) > 0 ? Number(target.analysisHeight) : Number(fallbackHeight) > 0 ? Number(fallbackHeight) : 0;
    const analysisOffsetX = Number.isFinite(Number(target.analysisOffsetX)) ? Number(target.analysisOffsetX) : 0;
    const analysisOffsetY = Number.isFinite(Number(target.analysisOffsetY)) ? Number(target.analysisOffsetY) : 0;
    const cropWidth = Number(processed.cropWidth) || 0;
    const cropHeight = Number(processed.cropHeight) || 0;
    const cropX = Number(processed.cropX) || 0;
    const cropY = Number(processed.cropY) || 0;

    if (!(analysisWidth > 0) || !(analysisHeight > 0)) {
      return null;
    }

    if (!(processed.sourceWidth > 0) || !(processed.sourceHeight > 0)) {
      return null;
    }

    if (!(cropWidth > 0) || !(cropHeight > 0)) {
      return null;
    }

    const scaleX = analysisWidth / processed.sourceWidth;
    const scaleY = analysisHeight / processed.sourceHeight;
    return {
      analysisWidth: analysisWidth,
      analysisHeight: analysisHeight,
      nextWidth: Math.max(1, roundBoundsFitMetric(cropWidth * scaleX)),
      nextHeight: Math.max(1, roundBoundsFitMetric(cropHeight * scaleY)),
      shiftX: roundBoundsFitMetric(analysisOffsetX + cropX * scaleX),
      shiftY: roundBoundsFitMetric(analysisOffsetY + cropY * scaleY),
    };
  }

  function resolveBoundsFitDirectGeometry(target, fallbackWidth, fallbackHeight) {
    const analysisWidth = Number(fallbackWidth) > 0 ? Number(fallbackWidth) : 0;
    const analysisHeight = Number(fallbackHeight) > 0 ? Number(fallbackHeight) : 0;
    const cropWidth = Number(target.directCropWidth) || 0;
    const cropHeight = Number(target.directCropHeight) || 0;
    const cropX = Number(target.directCropX) || 0;
    const cropY = Number(target.directCropY) || 0;

    if (!(analysisWidth > 0) || !(analysisHeight > 0)) {
      return null;
    }

    if (!(cropWidth > 0) || !(cropHeight > 0)) {
      return null;
    }

    return {
      analysisWidth: analysisWidth,
      analysisHeight: analysisHeight,
      nextWidth: Math.max(1, roundBoundsFitMetric(cropWidth)),
      nextHeight: Math.max(1, roundBoundsFitMetric(cropHeight)),
      shiftX: roundBoundsFitMetric(cropX),
      shiftY: roundBoundsFitMetric(cropY),
    };
  }

  function sortBoundsFitContainerPlans(plans) {
    if (!Array.isArray(plans) || !plans.length) {
      return [];
    }

    return plans.slice().sort(function (left, right) {
      const leftDepth = left && typeof left.depth === "number" ? left.depth : 0;
      const rightDepth = right && typeof right.depth === "number" ? right.depth : 0;
      return rightDepth - leftDepth;
    });
  }

  async function applyBoundsFitContainerPlan(plan, skipped) {
    if (!plan || !plan.nodeId) {
      return "skipped";
    }

    const node = await figma.getNodeByIdAsync(plan.nodeId);
    if (!node || node.removed) {
      skipped.push({
        nodeId: plan.nodeId,
        nodeName: plan.nodeName || "Unnamed",
        reason: "Could not find the selected container again.",
      });
      return "skipped";
    }

    if (!canApplyBoundsFitContainer(node)) {
      skipped.push({
        nodeId: plan.nodeId,
        nodeName: safeName(node),
        reason: buildBoundsFitContainerUnsupportedReason(node),
      });
      return "skipped";
    }

    const containerRect = getBoundsFitNodeRect(node);
    if (!containerRect) {
      skipped.push({
        nodeId: plan.nodeId,
        nodeName: safeName(node),
        reason: "Could not calculate the current container bounds.",
      });
      return "skipped";
    }

    const childUnion = getBoundsFitContainerChildrenUnionRect(node, containerRect);
    if (!childUnion) {
      skipped.push({
        nodeId: plan.nodeId,
        nodeName: safeName(node),
        reason: "Could not calculate the visible child bounds inside the selected container.",
      });
      return "skipped";
    }

    const shiftX = roundBoundsFitMetric(childUnion.x - containerRect.x);
    const shiftY = roundBoundsFitMetric(childUnion.y - containerRect.y);
    const needsMove = Math.abs(shiftX) > 0.01 || Math.abs(shiftY) > 0.01;
    const needsResize =
      shouldResizeBoundsFitContainer(node) &&
      (Math.abs(childUnion.width - containerRect.width) > 0.01 || Math.abs(childUnion.height - containerRect.height) > 0.01);

    if (!needsMove && !needsResize) {
      return "unchanged";
    }

    try {
      if (isBoundsFitAutoLayoutNode(node)) {
        applyBoundsFitAutoLayoutContainerGeometry(node, containerRect, childUnion, {
          preserveLeadingInsets: !!(plan && plan.selectedRoot === true),
        });
      } else {
        if (plan && plan.selectedRoot === true) {
          applyBoundsFitSelectedRootContainerGeometry(node, containerRect, childUnion);
        } else {
          if (canMoveBoundsFitNode(node)) {
            moveBoundsFitNode(node, shiftX, shiftY);
          }
          moveBoundsFitContainerChildren(node, -shiftX, -shiftY);
          if (shouldResizeBoundsFitContainer(node)) {
            resizeBoundsFitNode(node, childUnion.width, childUnion.height, false);
          }
        }
      }
      return "applied";
    } catch (error) {
      skipped.push({
        nodeId: plan.nodeId,
        nodeName: safeName(node),
        reason: normalizeErrorMessage(error, "Failed to apply bounds-fit to the selected container."),
      });
      return "skipped";
    }
  }

  function getBoundsFitContainerChildrenUnionRect(node, containerRect) {
    if (!node || !hasChildren(node)) {
      return null;
    }

    const preferredRects = [];
    const fallbackRects = [];
    const clipRect = containerRect || getBoundsFitNodeRect(node);
    const nextClipRect =
      "clipsContent" in node && node.clipsContent === true && clipRect ? clipRect : null;
    collectBoundsFitDescendantRects(node, nextClipRect, preferredRects, fallbackRects);

    return unionAbsoluteRects(preferredRects.length ? preferredRects : fallbackRects);
  }

  function collectBoundsFitDescendantRects(node, clipRect, preferredRects, fallbackRects) {
    if (!node || !hasChildren(node) || !Array.isArray(preferredRects) || !Array.isArray(fallbackRects)) {
      return;
    }

    for (let index = 0; index < node.children.length; index += 1) {
      const child = node.children[index];
      if (!child || child.removed || !isBoundsFitNodeVisible(child)) {
        continue;
      }

      let childRect = getBoundsFitNodeRect(child);
      if (!childRect) {
        continue;
      }

      if (clipRect) {
        childRect = intersectBoundsFitRects(childRect, clipRect);
        if (!childRect) {
          continue;
        }
      }

      if (hasChildren(child)) {
        const descendantClipRect =
          "clipsContent" in child && child.clipsContent === true ? childRect : clipRect;
        collectBoundsFitDescendantRects(child, descendantClipRect, preferredRects, fallbackRects);
        continue;
      }

      fallbackRects.push(childRect);
      if (isBoundsFitPreferredContentNode(child)) {
        preferredRects.push(childRect);
      }
    }
  }

  function moveBoundsFitContainerChildren(node, shiftX, shiftY) {
    if (!node || !hasChildren(node)) {
      return;
    }

    for (let index = 0; index < node.children.length; index += 1) {
      moveBoundsFitNode(node.children[index], shiftX, shiftY);
    }
  }

  function applyBoundsFitSelectedRootContainerGeometry(node, containerRect, childUnion) {
    const nextLeft = Math.min(containerRect.x, childUnion.x);
    const nextTop = Math.min(containerRect.y, childUnion.y);
    const nextRight = Math.max(containerRect.x, childUnion.x + childUnion.width);
    const nextBottom = Math.max(containerRect.y, childUnion.y + childUnion.height);
    const shiftX = roundBoundsFitMetric(nextLeft - containerRect.x);
    const shiftY = roundBoundsFitMetric(nextTop - containerRect.y);
    const nextWidth = Math.max(1, roundBoundsFitMetric(nextRight - nextLeft));
    const nextHeight = Math.max(1, roundBoundsFitMetric(nextBottom - nextTop));

    if (canMoveBoundsFitNode(node) && (Math.abs(shiftX) > 0.01 || Math.abs(shiftY) > 0.01)) {
      moveBoundsFitNode(node, shiftX, shiftY);
    }

    if (shouldResizeBoundsFitContainer(node)) {
      resizeBoundsFitNode(node, nextWidth, nextHeight, false);
    }
  }

  function applyBoundsFitAutoLayoutContainerGeometry(node, containerRect, childUnion, options) {
    const preserveLeadingInsets = !!(options && options.preserveLeadingInsets === true);
    const leftInset = roundBoundsFitMetric(childUnion.x - containerRect.x);
    const topInset = roundBoundsFitMetric(childUnion.y - containerRect.y);
    const rightInset = roundBoundsFitMetric(containerRect.x + containerRect.width - (childUnion.x + childUnion.width));
    const bottomInset = roundBoundsFitMetric(containerRect.y + containerRect.height - (childUnion.y + childUnion.height));

    if (!preserveLeadingInsets && canMoveBoundsFitNode(node)) {
      moveBoundsFitNode(node, leftInset, topInset);
    }

    if ("paddingLeft" in node && typeof node.paddingLeft === "number") {
      node.paddingLeft = preserveLeadingInsets && leftInset >= 0 ? roundBoundsFitPixel(node.paddingLeft) : Math.max(0, roundBoundsFitPixel(node.paddingLeft - leftInset));
    }
    if ("paddingTop" in node && typeof node.paddingTop === "number") {
      node.paddingTop = preserveLeadingInsets && topInset >= 0 ? roundBoundsFitPixel(node.paddingTop) : Math.max(0, roundBoundsFitPixel(node.paddingTop - topInset));
    }
    if ("paddingRight" in node && typeof node.paddingRight === "number") {
      node.paddingRight = Math.max(0, roundBoundsFitPixel(node.paddingRight - rightInset));
    }
    if ("paddingBottom" in node && typeof node.paddingBottom === "number") {
      node.paddingBottom = Math.max(0, roundBoundsFitPixel(node.paddingBottom - bottomInset));
    }

    if (shouldResizeBoundsFitContainer(node)) {
      const nextWidth = preserveLeadingInsets && leftInset >= 0 ? childUnion.width + leftInset : childUnion.width;
      const nextHeight = preserveLeadingInsets && topInset >= 0 ? childUnion.height + topInset : childUnion.height;
      resizeBoundsFitNode(node, nextWidth, nextHeight, false);
    }
  }

  function applyBoundsFitGeometry(node, width, height, shiftX, shiftY, options) {
    if (canMoveBoundsFitNode(node)) {
      moveBoundsFitNode(node, shiftX, shiftY);
    }

    if (options && options.textAutoResizeNone === true && node && node.type === "TEXT" && "textAutoResize" in node) {
      try {
        node.textAutoResize = "NONE";
      } catch (error) {
        // Ignore text nodes that do not allow changing auto-resize in the current runtime.
      }
    }

    resizeBoundsFitNode(node, width, height, !!(options && options.preferWithoutConstraints === true));
  }

  function moveBoundsFitNode(node, shiftX, shiftY) {
    const nextShiftX = roundBoundsFitPixel(shiftX);
    const nextShiftY = roundBoundsFitPixel(shiftY);
    if ("x" in node && typeof node.x === "number" && "y" in node && typeof node.y === "number") {
      node.x = roundBoundsFitPixel(node.x + nextShiftX);
      node.y = roundBoundsFitPixel(node.y + nextShiftY);
    } else if ("relativeTransform" in node && Array.isArray(node.relativeTransform)) {
      node.relativeTransform = [
        [node.relativeTransform[0][0], node.relativeTransform[0][1], roundBoundsFitPixel(node.relativeTransform[0][2] + nextShiftX)],
        [node.relativeTransform[1][0], node.relativeTransform[1][1], roundBoundsFitPixel(node.relativeTransform[1][2] + nextShiftY)],
      ];
    } else if (nextShiftX !== 0 || nextShiftY !== 0) {
      throw new Error("Could not move the layer to the analyzed position.");
    }
  }

  function resizeBoundsFitNode(node, width, height, preferWithoutConstraints) {
    const nextWidth = Math.max(1, roundBoundsFitPixel(width));
    const nextHeight = Math.max(1, roundBoundsFitPixel(height));

    if (preferWithoutConstraints && typeof node.resizeWithoutConstraints === "function") {
      node.resizeWithoutConstraints(nextWidth, nextHeight);
      return;
    }

    if (typeof node.resize === "function") {
      node.resize(nextWidth, nextHeight);
      return;
    }

    if (typeof node.resizeWithoutConstraints === "function") {
      node.resizeWithoutConstraints(nextWidth, nextHeight);
      return;
    }

    throw new Error("Could not resize the selected layer.");
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

  async function analyzeBoundsFitTextSelectionNode(node) {
    if (!node || node.removed) {
      return buildBoundsFitSkipped(node, "The selected text layer could not be read.");
    }

    if (node.type !== "TEXT") {
      return buildBoundsFitSkipped(node, "Bounds-fit text mode requires a text layer.");
    }

    if ("locked" in node && node.locked) {
      return buildBoundsFitSkipped(node, "Locked text layers are not supported for bounds-fit.");
    }

    if (!canResizeBoundsFitNode(node)) {
      return buildBoundsFitSkipped(node, "Bounds-fit could not resize the selected text layer.");
    }

    if ("rotation" in node && typeof node.rotation === "number" && Math.abs(node.rotation) > 0.01) {
      return buildBoundsFitSkipped(node, "Rotated text layers are not supported yet.");
    }

    const layoutRect = getBoundsFitNodeLayoutRect(node);
    if (!layoutRect) {
      return buildBoundsFitSkipped(node, "Could not calculate the selected text layer bounds.");
    }

    const measuredRect = await resolveBoundsFitTextMeasuredRect(node);
    if (!measuredRect) {
      return buildBoundsFitSkipped(node, "Could not calculate the visible bounds for the selected text layer.");
    }

    const measuredWidth = Number(measuredRect.width) || 0;
    const measuredHeight = Number(measuredRect.height) || 0;
    if (!(measuredWidth > 0) || !(measuredHeight > 0)) {
      return buildBoundsFitSkipped(node, "Could not calculate the visible text bounds inside the selected layer.");
    }

    return {
      target: {
        nodeId: node.id,
        nodeName: safeName(node),
        targetKind: "text",
        analysisMode: "direct-text-bounds",
        skipRasterAnalysis: true,
        fillIndex: -1,
        originalHash: "",
        sourceWidth: layoutRect.width,
        sourceHeight: layoutRect.height,
        analysisOffsetX: 0,
        analysisOffsetY: 0,
        analysisWidth: layoutRect.width,
        analysisHeight: layoutRect.height,
        directCropX: roundBoundsFitMetric(measuredRect.x - layoutRect.x),
        directCropY: roundBoundsFitMetric(measuredRect.y - layoutRect.y),
        directCropWidth: measuredRect.width,
        directCropHeight: measuredRect.height,
        fileName: "",
        mimeType: "",
        bytes: new Uint8Array(0),
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
    return "Could not find an eligible text, image, or supported container for bounds-fit.";
  }

  function buildImageCompositeEmptySelectionMessage(layers, skipped) {
    if (Array.isArray(layers) && layers.length === 1) {
      return "Image composite requires at least 2 eligible visible layers.";
    }

    if (Array.isArray(skipped) && skipped.length > 0 && (!Array.isArray(layers) || !layers.length)) {
      const first = skipped[0];
      if (first && typeof first.reason === "string" && first.reason.trim()) {
        return first.reason.trim();
      }
    }

    return "Could not find 2 to 8 eligible visible layers for image composite.";
  }

  function resolveImageCompositeLayerKind(node) {
    if (node && node.type === "TEXT") {
      return "text";
    }
    if (hasSimpleVisibleImagePaint(node)) {
      return "image";
    }
    return "shape";
  }

  function getImageCompositeTextContent(node) {
    if (!node || node.type !== "TEXT" || typeof node.characters !== "string") {
      return "";
    }

    return node.characters.replace(/\s+/g, " ").trim().slice(0, 240);
  }

  function hasRenderableImageCompositeAppearance(node) {
    if (!node) {
      return false;
    }

    if (node.type === "TEXT") {
      return hasVisiblePaints(node.fills) || hasVisibleEffects(node.effects);
    }

    if (hasSimpleVisibleImagePaint(node)) {
      return true;
    }

    return hasVisiblePaints(getNodeFills(node)) || hasVisiblePaints(node.strokes) || hasVisibleEffects(node.effects);
  }

  async function analyzeImageCompositeSelectionNode(node, options) {
    if (!node || node.removed) {
      return buildImageCompositeSkipped(node, "The selected layer could not be read.");
    }

    if (!isBoundsFitNodeVisible(node)) {
      return buildImageCompositeSkipped(node, "The selected layer is hidden.");
    }

    if (hasChildren(node)) {
      return buildImageCompositeSkipped(node, "Image composite supports visible leaf layers only inside the selected frame.");
    }

    if ("locked" in node && node.locked) {
      return buildImageCompositeSkipped(node, "Locked layers are not supported for image composite.");
    }

    if (typeof node.exportAsync !== "function") {
      return buildImageCompositeSkipped(node, "The selected layer cannot be exported for image composite.");
    }

    if (!hasRenderableImageCompositeAppearance(node)) {
      return buildImageCompositeSkipped(node, "The selected layer does not have visible pixels to composite.");
    }

    const analysisContext = getBoundsFitAnalysisContext(node);
    if (!analysisContext || !analysisContext.visibleRect) {
      return buildImageCompositeSkipped(node, "Could not calculate the visible bounds for the selected layer.");
    }

    let visibleRect = analysisContext.visibleRect;
    const rootRect = options && options.rootRect ? options.rootRect : null;
    if (rootRect) {
      visibleRect = intersectBoundsFitRects(visibleRect, rootRect);
      if (!visibleRect) {
        return buildImageCompositeSkipped(node, "The selected layer is outside the chosen frame bounds.");
      }
    }

    const exportContext =
      rootRect && !areBoundsFitRectsEqual(visibleRect, analysisContext.visibleRect)
        ? {
            nodeRect: analysisContext.nodeRect,
            visibleRect: visibleRect,
            clipped: true,
            offsetX: roundBoundsFitMetric(visibleRect.x - analysisContext.nodeRect.x),
            offsetY: roundBoundsFitMetric(visibleRect.y - analysisContext.nodeRect.y),
          }
        : analysisContext;

    const bytes = await exportBoundsFitRenderedAnalysisBytes(node, exportContext);
    if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
      return buildImageCompositeSkipped(node, "Could not export the current layer as PNG.");
    }

    const fills = getNodeFills(node);
    const fillIndex = hasSimpleVisibleImagePaint(node) ? getPrimaryVisibleImageFillIndex(fills) : -1;
    const fill = fillIndex >= 0 ? fills[fillIndex] : null;
    return {
      target: {
        node: node,
        nodeId: node.id,
        nodeName: safeName(node),
        layerKind: resolveImageCompositeLayerKind(node),
        nodeType: node.type,
        textContent: getImageCompositeTextContent(node),
        fillIndex: fillIndex,
        originalHash: fill && typeof fill.imageHash === "string" ? fill.imageHash : "",
        visibleRect: visibleRect,
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
      figma.notify("The selected layer is already tightly fit to its visible bounds.", { timeout: 2200 });
      return;
    }

    if (!appliedCount && skippedCount > 0) {
      figma.notify(label + " could not find an eligible layer or container to apply.", { timeout: 2200 });
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

  function buildSharpenSpecificImageError(text, provider) {
    const providerLabel = provider && provider !== "AI" ? provider + " " : "";

    if (
      /(select at least one node|could not find the selected image fill|could not find an image fill in the current selection|select one editable shape layer|shape layer or a layer that uses an image fill|select exactly one editable shape layer)/i.test(
        text
      )
    ) {
      return "샤프닝할 이미지를 찾지 못했습니다. 이미지 레이어를 다시 선택해주세요.";
    }

    if (
      /(could not read bytes|bytes from the selected image fill|image fill bytes missing|input image bytes|source image .*empty|exported shape image was empty|empty image bytes|no generated image bytes)/i.test(
        text
      )
    ) {
      return "샤프닝 원본 이미지 바이트를 읽지 못했습니다. 원본 이미지가 비었거나 손상되었을 수 있습니다.";
    }

    if (/(application\/octet-stream|unsupported|mime|format|image\/gif|image\/bmp|image\/tiff|image\/heic|image\/heif)/i.test(text)) {
      return "샤프닝 입력 이미지 형식을 지원하지 않습니다. PNG, JPG, WEBP처럼 일반적인 이미지로 다시 시도해주세요.";
    }

    if (/(payload|request size|20 ?mb|inline[_ ]data|too large|exceeds?.*limit|max(?:imum)? size)/i.test(text)) {
      return "샤프닝 입력 이미지가 너무 큽니다. 더 작은 이미지로 다시 시도해주세요.";
    }

    if (/(aspect[_ -]?ratio|unsupported image setting|image dimensions|width|height)/i.test(text)) {
      return "샤프닝 입력 이미지 비율이나 크기가 현재 처리 범위를 벗어났습니다. 일반적인 비율이나 크기로 다시 시도해주세요.";
    }

    if (/(400|invalid_argument|invalid image|unsupported image|image|size)/i.test(text)) {
      return providerLabel + "샤프닝 입력 이미지를 현재 요청 형식으로 처리하지 못했습니다. 이미지 소스나 설정을 다시 확인해주세요.";
    }

    return "";
  }

  function toKoreanImageErrorMessage(value, fallback, options) {
    const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    if (!text) {
      return fallback;
    }

    if (looksLikeCorruptedImageText(text)) {
      return fallback;
    }

    if (isBoundsFitOperation(options)) {
      return text;
    }

    if (isImageExtendOperation(options)) {
      return text;
    }

    if (
      /(bounds-fit|auto-layout|text overlay|selected text layer|selected container|visible bounds|cannot be resized|could not resize)/i.test(
        text
      )
    ) {
      return text;
    }

    const provider = /openai/i.test(text) ? "OpenAI" : /gemini/i.test(text) ? "Gemini" : "AI";
    const operationLabel = sanitizeOperationLabel(options && options.operationLabel);

    if (/(401|403|permission|forbidden|unauthori|auth|api key|credential)/i.test(text)) {
      return provider + " image request permission was denied. Check your API key or credentials.";
    }

    if (/(429|resource_exhausted|rate limit|quota|too many requests)/i.test(text)) {
      return provider + " image request hit a rate limit or quota. Please try again later.";
    }

    if (/(503|unavailable|high demand|overloaded|temporar|try again later|busy)/i.test(text)) {
      return provider + " image request is temporarily unavailable. Please try again later.";
    }

    if (isSharpenOperationLabel(operationLabel)) {
      const sharpenSpecificMessage = buildSharpenSpecificImageError(text, provider);
      if (sharpenSpecificMessage) {
        return sharpenSpecificMessage;
      }
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

  function normalizeErrorMessage(error, fallback, options) {
    if (error && typeof error === "object" && typeof error.message === "string" && error.message.trim()) {
      return toKoreanImageErrorMessage(error.message, fallback, options);
    }

    if (typeof error === "string" && error.trim()) {
      return toKoreanImageErrorMessage(error, fallback, options);
    }

    return fallback;
  }
})();
