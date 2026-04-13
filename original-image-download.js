;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_ORIGINAL_IMAGE_DOWNLOAD_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESULT_PREVIEW_LIMIT = 24;
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isOriginalImageDownloadMessage(message)) {
      if (isRunning) {
        postStatus({
          status: "running",
          currentCount: 0,
          totalCount: 0,
          message: "원본 이미지 추출이 이미 진행 중입니다.",
        });
        return;
      }

      await runOriginalImageDownload();
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_ORIGINAL_IMAGE_DOWNLOAD_PATCH__ = true;

  function isOriginalImageDownloadMessage(message) {
    return !!message && message.type === "run-original-image-download";
  }

  async function runOriginalImageDownload() {
    isRunning = true;

    try {
      const collection = collectOriginalImagesFromSelection();
      const totalCount = collection.uniqueEntries.length;

      if (!totalCount) {
        const emptyResult = buildResult({
          selection: collection.selection,
          totalFillCount: collection.totalFillCount,
          duplicateFillCount: collection.duplicateFillCount,
          uniqueCandidateCount: 0,
          downloadedFiles: [],
          skipped: collection.skipped,
        });

        figma.ui.postMessage({
          type: "original-image-download-result",
          result: emptyResult,
        });
        figma.notify("선택 범위에서 추출할 원본 이미지가 없습니다.", { timeout: 2000 });
        return;
      }

      figma.ui.postMessage({
        type: "original-image-download-start",
        totalCount: totalCount,
      });

      const downloadedFiles = [];
      const skipped = collection.skipped.slice();

      for (let index = 0; index < collection.uniqueEntries.length; index += 1) {
        const entry = collection.uniqueEntries[index];
        postStatus({
          status: "prepare",
          currentCount: index + 1,
          totalCount: totalCount,
          message: '"' + entry.displayName + '" 원본 이미지를 준비하는 중입니다.',
        });

        try {
          const image = figma.getImageByHash(entry.imageHash);
          if (!image) {
            throw new Error("원본 이미지 객체를 찾지 못했습니다.");
          }

          const bytes = await image.getBytesAsync();
          const extension = detectImageExtension(bytes);
          const mimeType = detectImageMimeType(extension);
          const fileName = buildFileName(entry, index, extension);
          const fileRecord = {
            index: index + 1,
            fileName: fileName,
            mimeType: mimeType,
            byteLength: bytes.length,
            imageHash: entry.imageHash,
            nodeId: entry.nodeId,
            nodeName: entry.nodeName,
            path: entry.path,
            usageCount: entry.usageCount,
          };

          downloadedFiles.push(fileRecord);

          figma.ui.postMessage({
            type: "original-image-download-file",
            file: {
              index: index + 1,
              totalCount: totalCount,
              fileName: fileName,
              mimeType: mimeType,
              imageHash: entry.imageHash,
              nodeId: entry.nodeId,
              nodeName: entry.nodeName,
              usageCount: entry.usageCount,
              byteLength: bytes.length,
              bytes: bytes,
            },
          });
        } catch (error) {
          skipped.push({
            nodeId: entry.nodeId,
            nodeName: entry.nodeName,
            imageHash: entry.imageHash,
            path: entry.path,
            reason: normalizeErrorMessage(error, "원본 이미지 바이트를 읽지 못했습니다."),
          });
        }
      }

      const result = buildResult({
        selection: collection.selection,
        totalFillCount: collection.totalFillCount,
        duplicateFillCount: collection.duplicateFillCount,
        uniqueCandidateCount: totalCount,
        downloadedFiles: downloadedFiles,
        skipped: skipped,
      });

      figma.ui.postMessage({
        type: "original-image-download-result",
        result: result,
      });
      notifyResult(result);
    } catch (error) {
      const message = normalizeErrorMessage(error, "원본 이미지 추출에 실패했습니다.");
      figma.ui.postMessage({
        type: "original-image-download-error",
        message: message,
      });
      figma.notify(message, { error: true, timeout: 2400 });
    } finally {
      isRunning = false;
    }
  }

  function collectOriginalImagesFromSelection() {
    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error("프레임, 그룹, 레이어를 먼저 선택하세요.");
    }

    const uniqueEntries = [];
    const entriesByHash = {};
    const skipped = [];
    let totalFillCount = 0;
    let duplicateFillCount = 0;

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
        for (let fillIndex = 0; fillIndex < fills.length; fillIndex += 1) {
          const fill = fills[fillIndex];
          if (!fill || fill.type !== "IMAGE") {
            continue;
          }

          totalFillCount += 1;

          if (!fill.imageHash || typeof fill.imageHash !== "string") {
            skipped.push({
              nodeId: node.id,
              nodeName: safeName(node),
              imageHash: "",
              path: current.path,
              reason: "IMAGE fill에 imageHash가 없어 건너뛰었습니다.",
            });
            continue;
          }

          if (entriesByHash[fill.imageHash]) {
            entriesByHash[fill.imageHash].usageCount += 1;
            duplicateFillCount += 1;
            continue;
          }

          const entry = {
            imageHash: fill.imageHash,
            nodeId: node.id,
            nodeName: safeName(node),
            displayName: safeName(node),
            path: current.path,
            usageCount: 1,
          };

          entriesByHash[fill.imageHash] = entry;
          uniqueEntries.push(entry);
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

    return {
      selection: selection,
      totalFillCount: totalFillCount,
      duplicateFillCount: duplicateFillCount,
      uniqueEntries: uniqueEntries,
      skipped: skipped,
    };
  }

  function buildResult(options) {
    const selection = Array.isArray(options.selection) ? options.selection : [];
    const totalFillCount =
      typeof options.totalFillCount === "number" && Number.isFinite(options.totalFillCount) ? options.totalFillCount : 0;
    const duplicateFillCount =
      typeof options.duplicateFillCount === "number" && Number.isFinite(options.duplicateFillCount)
        ? options.duplicateFillCount
        : 0;
    const uniqueCandidateCount =
      typeof options.uniqueCandidateCount === "number" && Number.isFinite(options.uniqueCandidateCount)
        ? options.uniqueCandidateCount
        : 0;
    const downloadedFiles = Array.isArray(options.downloadedFiles) ? options.downloadedFiles : [];
    const skipped = Array.isArray(options.skipped) ? options.skipped : [];

    return {
      processedAt: new Date().toISOString(),
      summary: {
        selectionLabel: formatSelectionLabel(selection),
        rootCount: selection.length,
        totalFillCount: totalFillCount,
        uniqueCandidateCount: uniqueCandidateCount,
        duplicateFillCount: duplicateFillCount,
        downloadedCount: downloadedFiles.length,
        skippedCount: skipped.length,
      },
      files: downloadedFiles.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
    };
  }

  function notifyResult(result) {
    const summary = result && result.summary ? result.summary : {};
    const downloadedCount = summary.downloadedCount || 0;
    const skippedCount = summary.skippedCount || 0;
    const duplicateFillCount = summary.duplicateFillCount || 0;

    if (!downloadedCount) {
      figma.notify("추출할 수 있는 원본 이미지가 없습니다.", { timeout: 2000 });
      return;
    }

    let message = "원본 이미지 " + downloadedCount + "개를 준비했습니다.";
    if (duplicateFillCount > 0) {
      message += " 중복 사용 " + duplicateFillCount + "건은 한 번만 내려받습니다.";
    }
    if (skippedCount > 0) {
      message += " " + skippedCount + "건은 건너뛰었습니다.";
    }
    figma.notify(message, { timeout: 2600 });
  }

  function postStatus(status) {
    figma.ui.postMessage({
      type: "original-image-download-status",
      status: status && status.status ? status.status : "running",
      currentCount:
        status && typeof status.currentCount === "number" && Number.isFinite(status.currentCount) ? status.currentCount : 0,
      totalCount:
        status && typeof status.totalCount === "number" && Number.isFinite(status.totalCount) ? status.totalCount : 0,
      message: status && typeof status.message === "string" ? status.message : "",
    });
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

  function detectImageMimeType(extension) {
    if (extension === "png") {
      return "image/png";
    }

    if (extension === "jpg") {
      return "image/jpeg";
    }

    if (extension === "gif") {
      return "image/gif";
    }

    if (extension === "webp") {
      return "image/webp";
    }

    if (extension === "bmp") {
      return "image/bmp";
    }

    return "application/octet-stream";
  }

  function buildFileName(entry, _index, extension) {
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
      return error.message.trim();
    }

    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }

    return fallback;
  }
})();
