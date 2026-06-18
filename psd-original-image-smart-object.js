;(() => {
  // PIGER_PSD_ORIGINAL_IMAGE_SMART_OBJECT::SOURCE_OF_TRUTH
  // Adds original IMAGE fill bytes to simple bitmap PSD layers so Photoshop can
  // open the layer as a Smart Object at the original image dimensions.
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  const PATCH_FLAG = "__PIGER_PSD_ORIGINAL_IMAGE_SMART_OBJECT_PATCH__";
  const SCAN_YIELD_INTERVAL = 96;
  const READ_YIELD_INTERVAL = 4;
  const AXIS_EPSILON = 0.0001;

  if (globalScope[PATCH_FLAG]) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const originalPostMessage = figma.ui.postMessage.bind(figma.ui);
  let originalSmartObjectCache = new Map();
  let originalSmartObjectExportEnabled = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  globalScope[PATCH_FLAG] = true;

  figma.ui.onmessage = async message => {
    if (isExportStartMessage(message)) {
      await prepareOriginalSmartObjectCache(message);
    }

    return originalOnMessage(message);
  };

  try {
    figma.ui.postMessage = message => {
      try {
        if (message && message.type === "export-root-ready" && originalSmartObjectExportEnabled) {
          enrichExportRootReadyMessage(message);
        }
      } catch (error) {
        console.warn("[piger-original-smart-object] Could not enrich PSD payload.", error);
      }

      const result = originalPostMessage(message);

      if (message && (message.type === "export-finished" || message.type === "export-error")) {
        resetOriginalSmartObjectCache();
      }

      return result;
    };
  } catch (error) {
    console.warn("[piger-original-smart-object] Could not wrap postMessage.", error);
  }

  function isExportStartMessage(message) {
    return !!message && message.type === "request-export";
  }

  async function prepareOriginalSmartObjectCache(message) {
    resetOriginalSmartObjectCache();

    if (!shouldEnableOriginalSmartObjects(message)) {
      return;
    }

    originalSmartObjectExportEnabled = true;

    try {
      originalSmartObjectCache = await collectOriginalSmartObjectSources(message);
    } catch (error) {
      originalSmartObjectCache = new Map();
      console.warn("[piger-original-smart-object] Original image source scan failed.", error);
    }
  }

  function shouldEnableOriginalSmartObjects(message) {
    const settings = message && message.settings && typeof message.settings === "object" ? message.settings : {};
    return settings.imageExportMode === "smart-object-if-possible";
  }

  function resetOriginalSmartObjectCache() {
    originalSmartObjectExportEnabled = false;
    originalSmartObjectCache = new Map();
  }

  async function collectOriginalSmartObjectSources(message) {
    const cache = new Map();
    const imageCacheByHash = new Map();
    const selection = Array.from(figma.currentPage.selection || []);
    const hiddenLayerMode =
      message && message.hiddenLayerMode === "preserve-hidden" ? "preserve-hidden" : "ignore-hidden";
    const stack = selection.slice().reverse();
    let scannedCount = 0;
    let readCount = 0;

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node || node.removed) {
        continue;
      }

      scannedCount += 1;
      if (scannedCount % SCAN_YIELD_INTERVAL === 0) {
        await waitForNextTick();
      }

      if (hiddenLayerMode === "ignore-hidden" && !isNodeVisibleInTree(node)) {
        continue;
      }

      const candidate = getOriginalImageCandidate(node);
      if (candidate) {
        if (readCount > 0 && readCount % READ_YIELD_INTERVAL === 0) {
          await waitForNextTick();
        }

        readCount += 1;
        const source = await buildOriginalSmartObjectSource(candidate, imageCacheByHash);
        if (source) {
          cache.set(node.id, source);
        }
      }

      if (hasChildren(node)) {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          stack.push(node.children[index]);
        }
      }
    }

    return cache;
  }

  function getOriginalImageCandidate(node) {
    if (!node || node.removed || node.isMask === true || hasChildren(node) || !isAxisAlignedNode(node)) {
      return null;
    }

    if (!("fills" in node) || !Array.isArray(node.fills)) {
      return null;
    }

    const fills = getVisiblePaints(node.fills);
    if (fills.length !== 1 || fills[0].type !== "IMAGE" || typeof fills[0].imageHash !== "string") {
      return null;
    }

    const paint = fills[0];
    if (!paint.imageHash) {
      return null;
    }

    const bounds = getNodeBounds(node);
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
      return null;
    }

    return { node, paint, bounds };
  }

  async function buildOriginalSmartObjectSource(candidate, imageCacheByHash) {
    const imageHash = candidate.paint.imageHash;
    let imageRecord = imageCacheByHash.get(imageHash);

    if (!imageRecord) {
      const image = figma.getImageByHash(imageHash);
      if (!image) {
        return null;
      }

      const bytes = await image.getBytesAsync();
      const extension = detectImageExtension(bytes);
      const mimeType = detectImageMimeType(extension);
      const size = await readImageSize(image, bytes);

      if (!size || size.width <= 0 || size.height <= 0 || extension === "bin") {
        return null;
      }

      imageRecord = {
        bytes,
        extension,
        mimeType,
        width: size.width,
        height: size.height,
        imageHash,
      };
      imageCacheByHash.set(imageHash, imageRecord);
    }

    return {
      bytes: imageRecord.bytes,
      extension: imageRecord.extension,
      mimeType: imageRecord.mimeType,
      width: imageRecord.width,
      height: imageRecord.height,
      imageHash,
      fileName: buildSmartObjectFileName(candidate.node, imageHash),
    };
  }

  async function readImageSize(image, bytes) {
    if (image && typeof image.getSizeAsync === "function") {
      try {
        const size = await image.getSizeAsync();
        const width = Math.round(Number(size && size.width));
        const height = Math.round(Number(size && size.height));
        if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
          return { width, height };
        }
      } catch (error) {
      }
    }

    return parseImageSize(bytes);
  }

  function enrichExportRootReadyMessage(message) {
    const payload = message && message.payload;
    if (!payload || !Array.isArray(payload.nodes)) {
      return;
    }

    let enrichedCount = 0;
    let fallbackCount = 0;
    for (const node of payload.nodes) {
      const result = enrichPayloadNode(node);
      enrichedCount += result.enriched;
      fallbackCount += result.fallback;
    }

    if (enrichedCount > 0) {
      payload.originalImageSmartObjectCount = enrichedCount;
    }
    if (fallbackCount > 0) {
      payload.originalImageSmartObjectFallbackCount = fallbackCount;
    }
  }

  function enrichPayloadNode(node) {
    if (!node || typeof node !== "object") {
      return { enriched: 0, fallback: 0 };
    }

    let enriched = 0;
    let fallback = 0;
    if (node.kind === "group" && Array.isArray(node.children)) {
      for (const child of node.children) {
        const result = enrichPayloadNode(child);
        enriched += result.enriched;
        fallback += result.fallback;
      }
      return { enriched, fallback };
    }

    if ((node.kind !== "bitmap" && node.kind !== "vector") || node.smartObjectDocument) {
      return { enriched: 0, fallback: 0 };
    }

    const source = typeof node.id === "string" ? originalSmartObjectCache.get(node.id) : null;
    if (source) {
      convertToBitmapSmartObject(node);
      node.smartObjectSourceKind = "original-image";
      node.smartObjectSourceBytes = source.bytes;
      node.smartObjectSourceMimeType = source.mimeType;
      node.smartObjectSourceExtension = "png";
      node.smartObjectSourceFileName = source.fileName;
      node.smartObjectSourceWidth = source.width;
      node.smartObjectSourceHeight = source.height;
      node.smartObjectSourceImageHash = source.imageHash;
      return { enriched: 1, fallback: 0 };
    }

    if (node.kind === "vector" && isImageBackedSvgVector(node)) {
      convertToBitmapSmartObject(node);
      node.smartObjectSourceKind = "preview-png-fallback";
      return { enriched: 0, fallback: 1 };
    }

    return { enriched: 0, fallback: 0 };
  }

  function convertToBitmapSmartObject(node) {
    attachVectorPreviewAlignment(node);
    node.kind = "bitmap";
    node.smartObject = true;
    delete node.svgString;
    delete node.strategy;
    delete node.fill;
    delete node.previewOffsetX;
    delete node.previewOffsetY;
  }

  function attachVectorPreviewAlignment(node) {
    if (!node || node.kind !== "vector" || node.smartObjectDocument) {
      return;
    }

    const width = Math.max(1, Math.round(Number(node.width) || 0));
    const height = Math.max(1, Math.round(Number(node.height) || 0));
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return;
    }

    node.smartObjectDocument = {
      width,
      height,
      offsetX: Math.round(Number(node.previewOffsetX) || 0),
      offsetY: Math.round(Number(node.previewOffsetY) || 0),
      children: [],
    };
  }

  function isImageBackedSvgVector(node) {
    const svg = node && typeof node.svgString === "string" ? node.svgString : "";
    if (!svg) {
      return false;
    }

    return /<image[\s>]/i.test(svg) || /\b(?:href|xlink:href)\s*=\s*["']data:image\//i.test(svg);
  }

  function getVisiblePaints(paints) {
    if (!Array.isArray(paints)) {
      return [];
    }

    return paints.filter(paint => paint && paint.visible !== false);
  }

  function hasChildren(node) {
    return !!node && "children" in node && Array.isArray(node.children) && node.children.length > 0;
  }

  function isAxisAlignedNode(node) {
    const transform = Array.isArray(node.absoluteTransform)
      ? node.absoluteTransform
      : Array.isArray(node.relativeTransform)
        ? node.relativeTransform
        : null;

    if (
      !Array.isArray(transform) ||
      !Array.isArray(transform[0]) ||
      !Array.isArray(transform[1]) ||
      transform[0].length < 2 ||
      transform[1].length < 2
    ) {
      return true;
    }

    const xx = Number(transform[0][0]);
    const xy = Number(transform[0][1]);
    const yx = Number(transform[1][0]);
    const yy = Number(transform[1][1]);

    if (![xx, xy, yx, yy].every(Number.isFinite)) {
      return false;
    }

    return Math.abs(xy) <= AXIS_EPSILON && Math.abs(yx) <= AXIS_EPSILON && xx > 0 && yy > 0;
  }

  function getNodeBounds(node) {
    const bounds = node && node.absoluteBoundingBox ? node.absoluteBoundingBox : null;
    if (bounds && bounds.width > 0 && bounds.height > 0) {
      return { width: bounds.width, height: bounds.height };
    }

    if (node && typeof node.width === "number" && typeof node.height === "number") {
      return { width: node.width, height: node.height };
    }

    return null;
  }

  function isNodeVisibleInTree(node) {
    let current = node;
    while (current) {
      if ("visible" in current && current.visible === false) {
        return false;
      }
      current = current.parent;
    }
    return true;
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
    switch (extension) {
      case "png":
        return "image/png";
      case "jpg":
        return "image/jpeg";
      case "gif":
        return "image/gif";
      case "webp":
        return "image/webp";
      case "bmp":
        return "image/bmp";
      default:
        return "application/octet-stream";
    }
  }

  function parseImageSize(bytes) {
    switch (detectImageExtension(bytes)) {
      case "png":
        return parsePngSize(bytes);
      case "jpg":
        return parseJpegSize(bytes);
      case "gif":
        return parseGifSize(bytes);
      case "webp":
        return parseWebpSize(bytes);
      case "bmp":
        return parseBmpSize(bytes);
      default:
        return null;
    }
  }

  function parsePngSize(bytes) {
    if (!bytes || bytes.length < 24) {
      return null;
    }
    return normalizeSize(readUint32BE(bytes, 16), readUint32BE(bytes, 20));
  }

  function parseGifSize(bytes) {
    if (!bytes || bytes.length < 10) {
      return null;
    }
    return normalizeSize(readUint16LE(bytes, 6), readUint16LE(bytes, 8));
  }

  function parseBmpSize(bytes) {
    if (!bytes || bytes.length < 26) {
      return null;
    }
    return normalizeSize(readInt32LE(bytes, 18), Math.abs(readInt32LE(bytes, 22)));
  }

  function parseJpegSize(bytes) {
    if (!bytes || bytes.length < 4 || bytes[0] !== 255 || bytes[1] !== 216) {
      return null;
    }

    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 255) {
        offset += 1;
        continue;
      }

      while (offset < bytes.length && bytes[offset] === 255) {
        offset += 1;
      }

      const marker = bytes[offset];
      offset += 1;

      if (marker === 218 || marker === 217) {
        break;
      }

      if (marker >= 208 && marker <= 215) {
        continue;
      }

      if (offset + 2 > bytes.length) {
        break;
      }

      const length = readUint16BE(bytes, offset);
      if (!Number.isFinite(length) || length < 2 || offset + length > bytes.length) {
        break;
      }

      if (isJpegStartOfFrame(marker) && offset + 7 <= bytes.length) {
        return normalizeSize(readUint16BE(bytes, offset + 5), readUint16BE(bytes, offset + 3));
      }

      offset += length;
    }

    return null;
  }

  function parseWebpSize(bytes) {
    if (
      !bytes ||
      bytes.length < 30 ||
      readAscii(bytes, 0, 4) !== "RIFF" ||
      readAscii(bytes, 8, 4) !== "WEBP"
    ) {
      return null;
    }

    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const chunkType = readAscii(bytes, offset, 4);
      const chunkSize = readUint32LE(bytes, offset + 4);
      const dataOffset = offset + 8;

      if (chunkType === "VP8X" && dataOffset + 10 <= bytes.length) {
        return normalizeSize(1 + readUint24LE(bytes, dataOffset + 4), 1 + readUint24LE(bytes, dataOffset + 7));
      }

      if (chunkType === "VP8 " && dataOffset + 10 <= bytes.length) {
        if (bytes[dataOffset + 3] === 157 && bytes[dataOffset + 4] === 1 && bytes[dataOffset + 5] === 42) {
          return normalizeSize(readUint16LE(bytes, dataOffset + 6) & 16383, readUint16LE(bytes, dataOffset + 8) & 16383);
        }
      }

      if (chunkType === "VP8L" && dataOffset + 5 <= bytes.length && bytes[dataOffset] === 47) {
        const b0 = bytes[dataOffset + 1];
        const b1 = bytes[dataOffset + 2];
        const b2 = bytes[dataOffset + 3];
        const b3 = bytes[dataOffset + 4];
        const width = 1 + (((b1 & 63) << 8) | b0);
        const height = 1 + (((b3 & 15) << 10) | (b2 << 2) | ((b1 & 192) >> 6));
        return normalizeSize(width, height);
      }

      offset = dataOffset + chunkSize + (chunkSize % 2);
    }

    return null;
  }

  function isJpegStartOfFrame(marker) {
    return (
      (marker >= 192 && marker <= 195) ||
      (marker >= 197 && marker <= 199) ||
      (marker >= 201 && marker <= 203) ||
      (marker >= 205 && marker <= 207)
    );
  }

  function normalizeSize(width, height) {
    const nextWidth = Math.round(Number(width));
    const nextHeight = Math.round(Number(height));
    if (!Number.isFinite(nextWidth) || !Number.isFinite(nextHeight) || nextWidth <= 0 || nextHeight <= 0) {
      return null;
    }

    return { width: nextWidth, height: nextHeight };
  }

  function readAscii(bytes, offset, length) {
    let result = "";
    for (let index = 0; index < length; index += 1) {
      result += String.fromCharCode(bytes[offset + index] || 0);
    }
    return result;
  }

  function readUint16BE(bytes, offset) {
    return ((bytes[offset] || 0) << 8) | (bytes[offset + 1] || 0);
  }

  function readUint16LE(bytes, offset) {
    return (bytes[offset] || 0) | ((bytes[offset + 1] || 0) << 8);
  }

  function readUint24LE(bytes, offset) {
    return (bytes[offset] || 0) | ((bytes[offset + 1] || 0) << 8) | ((bytes[offset + 2] || 0) << 16);
  }

  function readUint32BE(bytes, offset) {
    return (
      ((bytes[offset] || 0) * 16777216) +
      ((bytes[offset + 1] || 0) << 16) +
      ((bytes[offset + 2] || 0) << 8) +
      (bytes[offset + 3] || 0)
    );
  }

  function readUint32LE(bytes, offset) {
    return (
      (bytes[offset] || 0) +
      ((bytes[offset + 1] || 0) << 8) +
      ((bytes[offset + 2] || 0) << 16) +
      ((bytes[offset + 3] || 0) * 16777216)
    );
  }

  function readInt32LE(bytes, offset) {
    const value = readUint32LE(bytes, offset);
    return value > 2147483647 ? value - 4294967296 : value;
  }

  function buildSmartObjectFileName(node, imageHash) {
    const baseName = sanitizeFileName(node && node.name ? node.name : "figma-image");
    const hash = typeof imageHash === "string" && imageHash ? imageHash.slice(0, 8) : "image";
    return `${baseName}-${hash}.png`;
  }

  function sanitizeFileName(value) {
    const source = typeof value === "string" && value ? value : "figma-image";
    const trimmed = source.replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim();
    return trimmed ? trimmed.slice(0, 80) : "figma-image";
  }

  function waitForNextTick() {
    return new Promise(resolve => {
      setTimeout(resolve, 0);
    });
  }
})();
