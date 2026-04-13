;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_IMAGE_UPSCALE_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  let isPreparing = false;
  let isApplying = false;
  let pendingSession = null;
  let isBoundsFitPreparing = false;
  let isBoundsFitApplying = false;
  let pendingBoundsFitSession = null;
  let isReferencePreparing = false;

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

      if (message.type === "open-image-reference-search") {
        await openImageReferenceSearch(message);
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
        message.type === "request-image-bounds-fit-source" ||
        message.type === "apply-image-bounds-fit-image" ||
        message.type === "image-bounds-fit-report-error" ||
        message.type === "request-image-reference-search-source" ||
        message.type === "open-image-reference-search" ||
        message.type === "image-reference-report-error")
    );
  }

  async function prepareUpscaleSource(message) {
    if (isPreparing || isApplying || isBoundsFitPreparing || isBoundsFitApplying) {
      postPrepareError("이미지 업스케일이 이미 진행 중입니다.", sanitizeClientRequestId(message && message.clientRequestId));
      return;
    }

    isPreparing = true;
    pendingSession = null;

    try {
      const target = collectSingleUpscaleTargetFromSelection();
      const image = figma.getImageByHash(target.entry.imageHash);
      if (!image) {
        throw new Error("선택한 IMAGE fill 원본을 찾지 못했습니다.");
      }

      const bytes = await image.getBytesAsync();
      if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
        throw new Error("선택한 IMAGE fill 원본 바이트를 읽지 못했습니다.");
      }

      const extension = detectImageExtension(bytes);
      const mimeType = detectImageMimeType(bytes);
      const fileName = buildFileName(target.entry, extension === "bin" ? "png" : extension);
      const sessionId = buildSessionId();

      pendingSession = {
        id: sessionId,
        clientRequestId: sanitizeClientRequestId(message && message.clientRequestId),
        originalHash: target.entry.imageHash,
        usages: target.usages,
        selectionLabel: formatSelectionLabel(target.selection),
        targetNodeName: target.entry.nodeName,
        operationLabel: sanitizeOperationLabel(message && message.operationLabel),
        preparedAt: new Date().toISOString(),
      };

      figma.ui.postMessage({
        type: "ai-image-upscale-source-ready",
        sessionId: sessionId,
        clientRequestId: pendingSession.clientRequestId,
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
      });
    } catch (error) {
      pendingSession = null;
      postPrepareError(
        normalizeErrorMessage(error, "이미지 업스케일용 원본 이미지를 준비하지 못했습니다."),
        sanitizeClientRequestId(message && message.clientRequestId)
      );
    } finally {
      isPreparing = false;
    }
  }

  async function applyUpscaledImage(message) {
    if (isApplying || isBoundsFitPreparing || isBoundsFitApplying) {
      postApplyError("업스케일 결과 적용이 이미 진행 중입니다.", sanitizeClientRequestId(message && message.clientRequestId));
      return;
    }

    isApplying = true;

    try {
      if (!pendingSession || !message || message.sessionId !== pendingSession.id) {
        throw new Error("업스케일 세션이 만료되었습니다. 다시 실행해 주세요.");
      }

      const bytes = normalizeBytes(message.bytes);
      if (!bytes.length) {
        throw new Error("업스케일 결과 이미지가 비어 있습니다.");
      }

      const createdImage = figma.createImage(bytes);
      if (!createdImage || typeof createdImage.hash !== "string" || !createdImage.hash) {
        throw new Error("업스케일 결과 이미지 hash를 만들지 못했습니다.");
      }

      const result = await replaceSelectionImageFills(pendingSession, createdImage.hash, bytes.length);
      figma.ui.postMessage({
        type: "ai-image-upscale-apply-result",
        clientRequestId: pendingSession.clientRequestId,
        result: result,
      });
      notifyApplyResult(result, sanitizeOperationLabel(message && message.operationLabel) || pendingSession.operationLabel);
      pendingSession = null;
    } catch (error) {
      const messageText = normalizeErrorMessage(error, "이미지 업스케일 결과를 적용하지 못했습니다.");
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

  async function prepareImageBoundsFitSource(message) {
    if (isPreparing || isApplying || isBoundsFitPreparing || isBoundsFitApplying) {
      postBoundsFitSourceError(
        "다른 이미지 작업이 이미 진행 중입니다.",
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
        normalizeErrorMessage(error, "보이는 영역에 맞출 이미지 레이어를 준비하지 못했습니다."),
        sanitizeClientRequestId(message && message.clientRequestId)
      );
    } finally {
      isBoundsFitPreparing = false;
    }
  }

  async function prepareReferenceSearchSource(message) {
    if (isPreparing || isApplying || isBoundsFitPreparing || isBoundsFitApplying || isReferencePreparing) {
      postReferenceSearchSourceError(
        "다른 이미지 작업이 이미 진행 중입니다.",
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
        normalizeErrorMessage(error, "레퍼런스 검색 대상을 준비하지 못했습니다."),
        sanitizeClientRequestId(message && message.clientRequestId)
      );
    } finally {
      isReferencePreparing = false;
    }
  }

  async function openImageReferenceSearch(message) {
    const clientRequestId = sanitizeClientRequestId(message && message.clientRequestId);
    try {
      const query = sanitizeReferenceSearchQuery(message && message.query);
      if (!query) {
        throw new Error("레퍼런스 검색어가 비어 있습니다.");
      }

      const encodedQuery = encodeURIComponent(query);
      const googleUrl = "https://www.google.com/search?tbm=isch&q=" + encodedQuery;
      const pinterestUrl = "https://www.pinterest.com/search/pins/?q=" + encodedQuery;
      figma.openExternal(googleUrl);
      figma.openExternal(pinterestUrl);
      figma.ui.postMessage({
        type: "image-reference-search-opened",
        clientRequestId: clientRequestId,
        query: query,
        urls: [googleUrl, pinterestUrl],
      });
      figma.notify("레퍼런스 검색 열기: " + summarizeReferenceSearchQuery(query), { timeout: 2400 });
    } catch (error) {
      postReferenceSearchOpenError(
        normalizeErrorMessage(error, "레퍼런스 검색을 열지 못했습니다."),
        clientRequestId
      );
    }
  }

  async function applyImageBoundsFit(message) {
    if (isPreparing || isApplying || isBoundsFitApplying) {
      postBoundsFitApplyError(
        "보이는 영역 맞추기 결과 적용이 이미 진행 중입니다.",
        pendingBoundsFitSession && pendingBoundsFitSession.clientRequestId
          ? pendingBoundsFitSession.clientRequestId
          : sanitizeClientRequestId(message && message.clientRequestId)
      );
      return;
    }

    isBoundsFitApplying = true;

    try {
      if (!pendingBoundsFitSession || !message || message.sessionId !== pendingBoundsFitSession.id) {
        throw new Error("보이는 영역 맞추기 세션이 만료되었습니다. 다시 실행해 주세요.");
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
      const messageText = normalizeErrorMessage(error, "보이는 영역 맞추기 결과를 적용하지 못했습니다.");
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
        : "이미지 작업 처리 중 오류가 발생했습니다.",
      "이미지 작업 처리 중 오류가 발생했습니다."
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

  function collectSingleUpscaleTargetFromSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
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
      throw new Error("선택 범위에서 업스케일할 IMAGE fill을 찾지 못했습니다.");
    }

    if (false) {
      throw new Error("이미지 업스케일은 한 번에 하나의 원본 이미지에만 적용할 수 있습니다. IMAGE fill이 하나만 포함되도록 선택해 주세요.");
    }

    return {
      selection: selection,
      entry: selectedEntry,
      usages: usages,
    };
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
          reason: "노드를 찾지 못했습니다.",
        });
        continue;
      }

      const fills = getNodeFills(node);
      if (!fills.length) {
        skipped.push({
          nodeId: usage.nodeId,
          nodeName: safeName(node),
          reason: "IMAGE fill이 더 이상 없습니다.",
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
          reason: "같은 원본 hash를 가진 IMAGE fill을 찾지 못했습니다.",
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
          reason: normalizeErrorMessage(error, "IMAGE fill을 교체하지 못했습니다."),
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

  function notifyApplyResult(result) {
    const summary = result && result.summary ? result.summary : {};
    const appliedFillCount =
      typeof summary.appliedFillCount === "number" && Number.isFinite(summary.appliedFillCount)
        ? summary.appliedFillCount
        : 0;
    const skippedCount =
      typeof summary.skippedCount === "number" && Number.isFinite(summary.skippedCount) ? summary.skippedCount : 0;

    if (!appliedFillCount) {
      figma.notify("이미지 업스케일 결과를 적용할 IMAGE fill을 찾지 못했습니다.", { timeout: 2200 });
      return;
    }

    let message = "이미지 업스케일 적용 완료 (" + appliedFillCount + "개 fill 교체)";
    if (skippedCount > 0) {
      message += " · " + skippedCount + "건 건너뜀";
    }
    figma.notify(message, { timeout: 2600 });
  }

  function cloneImagePaintWithHashAndVisibility(fill, imageHash, visible) {
    const cloned = JSON.parse(JSON.stringify(fill));
    cloned.imageHash = imageHash;
    cloned.visible = visible !== false;
    return cloned;
  }

  function cloneImagePaintWithHash(fill, imageHash) {
    return cloneImagePaintWithHashAndVisibility(fill, imageHash, true);
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
      figma.notify("AI 이미지 결과를 적용할 IMAGE fill을 찾지 못했습니다.", { timeout: 2200 });
      return;
    }

    let message = (operationLabel || "AI 이미지 작업") + " 완료 (" + appliedFillCount + "개 fill 교체)";
    if (skippedCount > 0) {
      message += " · " + skippedCount + "건 건너뜀";
    }
    figma.notify(message, { timeout: 2600 });
  }

  function sanitizeOperationLabel(value) {
    const label = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    return label || "AI 이미지 작업";
  }

  async function collectReferenceSearchSourceFromSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
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

    throw new Error("이미지나 텍스트가 포함된 레이어를 선택해 주세요.");
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
    return normalized.slice(0, Math.max(0, limit - 1)).trim() + "…";
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
        throw new Error("선택한 IMAGE fill 원본을 찾지 못했습니다.");
      }
      bytes = await image.getBytesAsync();
      if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
        throw new Error("선택한 IMAGE fill 원본 바이트를 읽지 못했습니다.");
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

  function sanitizeReferenceSearchQuery(value) {
    const normalized = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    return normalized ? normalized.slice(0, 120) : "";
  }

  function summarizeReferenceSearchQuery(query) {
    const text = sanitizeReferenceSearchQuery(query);
    if (text.length <= 44) {
      return text;
    }
    return text.slice(0, 43) + "…";
  }

  async function collectBoundsFitTargetsFromSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
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

  async function analyzeBoundsFitSelectionNode(node) {
    if (!node || node.removed) {
      return buildBoundsFitSkipped(node, "선택 레이어를 읽을 수 없습니다.");
    }

    if (hasChildren(node)) {
      return buildBoundsFitSkipped(node, "하위 레이어가 있는 프레임이나 그룹은 아직 지원하지 않습니다.");
    }

    if ("locked" in node && node.locked) {
      return buildBoundsFitSkipped(node, "잠금된 레이어는 보이는 영역에 맞출 수 없습니다.");
    }

    if (!("resize" in node) || typeof node.resize !== "function") {
      return buildBoundsFitSkipped(node, "크기를 직접 바꿀 수 있는 이미지 레이어만 지원합니다.");
    }

    if ("rotation" in node && typeof node.rotation === "number" && Math.abs(node.rotation) > 0.01) {
      return buildBoundsFitSkipped(node, "회전된 이미지 레이어는 아직 지원하지 않습니다.");
    }

    if (
      node.parent &&
      "layoutMode" in node.parent &&
      typeof node.parent.layoutMode === "string" &&
      node.parent.layoutMode !== "NONE"
    ) {
      return buildBoundsFitSkipped(node, "오토 레이아웃 안의 이미지 레이어는 아직 지원하지 않습니다.");
    }

    if (!hasSimpleVisibleImagePaint(node)) {
      return buildBoundsFitSkipped(node, "보이는 IMAGE fill 하나만 가진 이미지 레이어만 지원합니다.");
    }

    if (hasVisiblePaints(node.strokes)) {
      return buildBoundsFitSkipped(node, "스트로크가 있는 이미지 레이어는 아직 지원하지 않습니다.");
    }

    if (hasVisibleEffects(node.effects)) {
      return buildBoundsFitSkipped(node, "레이어 효과가 있는 이미지 레이어는 아직 지원하지 않습니다.");
    }

    const fills = getNodeFills(node);
    const fillIndex = getPrimaryVisibleImageFillIndex(fills);
    if (fillIndex < 0) {
      return buildBoundsFitSkipped(node, "IMAGE fill을 찾지 못했습니다.");
    }

    const fill = fills[fillIndex];

    const nodeWidth = typeof node.width === "number" && Number.isFinite(node.width) ? node.width : 0;
    const nodeHeight = typeof node.height === "number" && Number.isFinite(node.height) ? node.height : 0;
    if (!(nodeWidth > 0) || !(nodeHeight > 0)) {
      return buildBoundsFitSkipped(node, "현재 레이어 크기를 계산할 수 없습니다.");
    }

    const image = fill.imageHash ? figma.getImageByHash(fill.imageHash) : null;
    if (!image) {
      return buildBoundsFitSkipped(node, "원본 이미지 데이터를 찾지 못했습니다.");
    }

    const size = await image.getSizeAsync();
    const sourceWidth = size && typeof size.width === "number" ? size.width : 0;
    const sourceHeight = size && typeof size.height === "number" ? size.height : 0;
    if (!(sourceWidth > 0) || !(sourceHeight > 0)) {
      return buildBoundsFitSkipped(node, "원본 이미지 크기를 읽지 못했습니다.");
    }

    const scaleMode = typeof fill.scaleMode === "string" ? fill.scaleMode : "FILL";
    const fillRotation = typeof fill.rotation === "number" && Number.isFinite(fill.rotation) ? fill.rotation : 0;
    const needsRenderedAnalysis =
      scaleMode === "CROP" ||
      scaleMode === "TILE" ||
      !!fill.imageTransform ||
      Math.abs(fillRotation) > 0.01 ||
      !hasMatchingAspectRatio(nodeWidth, nodeHeight, sourceWidth, sourceHeight);

    const bytes = needsRenderedAnalysis
      ? await node.exportAsync({
          format: "PNG",
          useAbsoluteBounds: false,
        })
      : await image.getBytesAsync();
    if (!bytes || typeof bytes.length !== "number" || bytes.length <= 0) {
      return buildBoundsFitSkipped(
        node,
        needsRenderedAnalysis ? "현재 보이는 이미지 바이트를 읽지 못했습니다." : "원본 이미지 바이트를 읽지 못했습니다."
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
          reason: "UI 분석 결과를 받지 못했습니다.",
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
          reason: processed.reason || "보이는 픽셀을 찾지 못했습니다.",
        });
        continue;
      }

      const node = await figma.getNodeByIdAsync(target.nodeId);
      if (!node || node.removed) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: target.nodeName,
          reason: "레이어를 다시 찾지 못했습니다.",
        });
        continue;
      }

      if (!("resize" in node) || typeof node.resize !== "function") {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "현재 레이어는 크기를 변경할 수 없습니다.",
        });
        continue;
      }

      const fills = getNodeFills(node);
      if (!fills.length) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "IMAGE fill이 더 이상 없습니다.",
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
          reason: "같은 원본 hash를 가진 IMAGE fill을 찾지 못했습니다.",
        });
        continue;
      }

      const currentWidth = typeof node.width === "number" && Number.isFinite(node.width) ? node.width : 0;
      const currentHeight = typeof node.height === "number" && Number.isFinite(node.height) ? node.height : 0;
      if (!(currentWidth > 0) || !(currentHeight > 0)) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "현재 레이어 크기를 계산할 수 없습니다.",
        });
        continue;
      }

      if (!hasMatchingAspectRatio(currentWidth, currentHeight, processed.sourceWidth, processed.sourceHeight)) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "실행 도중 레이어 비율이 바뀌어 적용을 건너뛰었습니다.",
        });
        continue;
      }

      const bytes = normalizeBytes(processed.bytes);
      if (!bytes.length) {
        skipped.push({
          nodeId: target.nodeId,
          nodeName: safeName(node),
          reason: "잘라낸 이미지 바이트가 비어 있습니다.",
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
          reason: "잘라낸 이미지 크기가 올바르지 않습니다.",
        });
        continue;
      }

      const scaleX = currentWidth / processed.sourceWidth;
      const scaleY = currentHeight / processed.sourceHeight;
      const nextWidth = Math.max(1, Math.round(cropWidth * scaleX * 1000) / 1000);
      const nextHeight = Math.max(1, Math.round(cropHeight * scaleY * 1000) / 1000);
      const shiftX = Math.round(cropX * scaleX * 1000) / 1000;
      const shiftY = Math.round(cropY * scaleY * 1000) / 1000;

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
          reason: normalizeErrorMessage(error, "보이는 영역 맞추기를 적용하지 못했습니다."),
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
      throw new Error("현재 레이어 위치를 이동할 수 없습니다.");
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

  function buildBoundsFitEmptySelectionMessage(skipped) {
    if (Array.isArray(skipped) && skipped.length > 0) {
      const first = skipped[0];
      if (first && typeof first.reason === "string" && first.reason.trim()) {
        return first.reason.trim();
      }
    }
    return "보이는 영역에 맞출 수 있는 이미지 레이어를 찾지 못했습니다.";
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

  function notifyBoundsFitResult(result, operationLabel) {
    const summary = result && result.summary ? result.summary : {};
    const appliedCount =
      typeof summary.appliedCount === "number" && Number.isFinite(summary.appliedCount) ? summary.appliedCount : 0;
    const unchangedCount =
      typeof summary.unchangedCount === "number" && Number.isFinite(summary.unchangedCount) ? summary.unchangedCount : 0;
    const skippedCount =
      typeof summary.skippedCount === "number" && Number.isFinite(summary.skippedCount) ? summary.skippedCount : 0;
    const label = operationLabel || "보이는 영역에 맞추기";

    if (!appliedCount && unchangedCount > 0 && skippedCount === 0) {
      figma.notify("선택한 이미지가 이미 보이는 영역에 맞습니다.", { timeout: 2200 });
      return;
    }

    if (!appliedCount && skippedCount > 0) {
      figma.notify(label + " 결과를 적용할 수 있는 이미지 레이어를 찾지 못했습니다.", { timeout: 2200 });
      return;
    }

    let message = label + " 완료 (" + appliedCount + "개 적용";
    if (unchangedCount > 0) {
      message += " · " + unchangedCount + "개 유지";
    }
    if (skippedCount > 0) {
      message += " · " + skippedCount + "개 건너뜀";
    }
    message += ")";
    figma.notify(message, { timeout: 2600 });
  }

  function sanitizeClientRequestId(value) {
    const requestId = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    return requestId || "";
  }

  function toKoreanImageErrorMessage(value, fallback) {
    const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    if (!text) {
      return fallback;
    }

    const provider = /openai/i.test(text) ? "OpenAI" : /gemini/i.test(text) ? "Gemini" : "AI";

    if (/(401|403|permission|forbidden|unauthori|auth|api key|credential)/i.test(text)) {
      return provider + " 이미지 요청 권한을 확인해 주세요.";
    }

    if (/(429|resource_exhausted|rate limit|quota|too many requests)/i.test(text)) {
      return provider + " 이미지 요청이 많이 몰리거나 사용 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.";
    }

    if (/(503|unavailable|high demand|overloaded|temporar|try again later|busy)/i.test(text)) {
      return provider + " 이미지 요청이 일시적으로 몰려 잠시 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
    }

    if (/(400|invalid_argument|unsupported|mime|format|image|size)/i.test(text)) {
      return provider + " 이미지 요청 형식이나 입력 이미지를 확인해 주세요.";
    }

    if (/(500|502|504|internal|backend|server)/i.test(text)) {
      return provider + " 서버 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
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
      return "선택 없음";
    }

    if (selection.length === 1) {
      return safeName(selection[0]);
    }

    return safeName(selection[0]) + " 외 " + (selection.length - 1) + "개";
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
