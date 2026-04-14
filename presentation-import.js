(function () {
  const ZIP_LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
  const ZIP_CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
  const ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
  const EMU_PER_PIXEL = 9525;
  const DEFAULT_SLIDE_WIDTH = 1280;
  const DEFAULT_SLIDE_HEIGHT = 720;
  const DEFAULT_TEXT_INSET_X = 91440;
  const DEFAULT_TEXT_INSET_Y = 45720;
  const TEXT_LINE_HEIGHT_MULTIPLIER = 1.2;
  const TEXT_PARAGRAPH_GAP_MULTIPLIER = 0.35;
  const DEFAULT_PPT_FONT_FALLBACKS = Object.freeze([
    "맑은 고딕",
    "Malgun Gothic",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Noto Sans CJK KR",
    "Segoe UI",
    "Arial",
    "sans-serif",
  ]);
  const GENERIC_FONT_FAMILY_NAMES = new Set([
    "serif",
    "sans-serif",
    "monospace",
    "cursive",
    "fantasy",
    "system-ui",
    "emoji",
    "math",
    "fangsong",
  ]);
  const DEFAULT_THEME_COLORS = Object.freeze({
    dk1: "#000000",
    lt1: "#FFFFFF",
    dk2: "#1F497D",
    lt2: "#EEECE1",
    accent1: "#4F81BD",
    accent2: "#C0504D",
    accent3: "#9BBB59",
    accent4: "#8064A2",
    accent5: "#4BACC6",
    accent6: "#F79646",
    hlink: "#0000FF",
    folHlink: "#800080",
    tx1: "#000000",
    bg1: "#FFFFFF",
    tx2: "#1F497D",
    bg2: "#EEECE1",
  });
  const PRESET_COLORS = Object.freeze({
    black: "#000000",
    white: "#FFFFFF",
    red: "#FF0000",
    green: "#00B050",
    blue: "#4472C4",
    yellow: "#FFC000",
    orange: "#ED7D31",
    purple: "#7030A0",
    gray: "#808080",
    grey: "#808080",
    lightgray: "#D9D9D9",
    lightgrey: "#D9D9D9",
    darkgray: "#404040",
    darkgrey: "#404040",
    cyan: "#00B0F0",
    magenta: "#FF00FF",
    brown: "#8B4513",
  });
  const IMAGE_MIME_TYPES = Object.freeze({
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
    svg: "image/svg+xml",
  });

  let textMeasureContext = null;

  function clamp(value, minValue, maxValue) {
    return Math.min(maxValue, Math.max(minValue, value));
  }

  function roundNumber(value) {
    return Math.round((Number(value) || 0) * 1000) / 1000;
  }

  function normalizePixelSize(value) {
    return Math.max(1, Math.round(Number(value) || 0));
  }

  function readUint16(bytes, offset) {
    return (bytes[offset] || 0) | ((bytes[offset + 1] || 0) << 8);
  }

  function readUint32(bytes, offset) {
    return (
      ((bytes[offset] || 0) |
        ((bytes[offset + 1] || 0) << 8) |
        ((bytes[offset + 2] || 0) << 16) |
        ((bytes[offset + 3] || 0) << 24)) >>>
      0
    );
  }

  function normalizeZipPath(path) {
    const source = String(path || "")
      .trim()
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");
    if (!source) {
      return "";
    }

    const segments = [];
    for (const segment of source.split("/")) {
      if (!segment || segment === ".") {
        continue;
      }
      if (segment === "..") {
        segments.pop();
        continue;
      }
      segments.push(segment);
    }
    return segments.join("/");
  }

  function getZipDirectory(path) {
    const normalizedPath = normalizeZipPath(path);
    const lastSlashIndex = normalizedPath.lastIndexOf("/");
    return lastSlashIndex >= 0 ? normalizedPath.slice(0, lastSlashIndex + 1) : "";
  }

  function resolveZipPath(sourcePath, targetPath) {
    const normalizedTarget = String(targetPath || "").trim();
    if (!normalizedTarget || /^[a-z]+:/i.test(normalizedTarget)) {
      return "";
    }
    if (normalizedTarget.startsWith("/")) {
      return normalizeZipPath(normalizedTarget);
    }
    return normalizeZipPath(`${getZipDirectory(sourcePath)}${normalizedTarget}`);
  }

  function getRelationshipsPath(sourcePath) {
    const normalizedSourcePath = normalizeZipPath(sourcePath);
    if (!normalizedSourcePath) {
      return "";
    }
    const directory = getZipDirectory(normalizedSourcePath);
    const baseName = normalizedSourcePath.slice(directory.length);
    return normalizeZipPath(`${directory}_rels/${baseName}.rels`);
  }

  async function inflateZipBytes(compressedBytes) {
    if (typeof DecompressionStream !== "function") {
      throw new Error("This Figma UI runtime does not expose DecompressionStream, so PPTX files cannot be inflated here.");
    }

    const tryFormats = ["deflate-raw", "deflate"];
    let lastError = null;
    for (const format of tryFormats) {
      try {
        const decompressionStream = new DecompressionStream(format);
        const response = new Response(new Blob([compressedBytes]).stream().pipeThrough(decompressionStream));
        return new Uint8Array(await response.arrayBuffer());
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("The PPTX ZIP entry could not be inflated.");
  }

  function createZipArchive(bytes, fileName) {
    if (!(bytes instanceof Uint8Array) || bytes.length < 22) {
      throw new Error("The selected PPTX file was empty or too small to contain a ZIP central directory.");
    }

    const maxSearchStart = Math.max(0, bytes.length - 65557);
    let endOfCentralDirectoryOffset = -1;
    for (let offset = bytes.length - 22; offset >= maxSearchStart; offset -= 1) {
      if (readUint32(bytes, offset) === ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
        endOfCentralDirectoryOffset = offset;
        break;
      }
    }

    if (endOfCentralDirectoryOffset < 0) {
      throw new Error("The selected PPTX file did not expose a readable ZIP end-of-central-directory record.");
    }

    const entryCount = readUint16(bytes, endOfCentralDirectoryOffset + 10);
    const centralDirectoryOffset = readUint32(bytes, endOfCentralDirectoryOffset + 16);
    if (!Number.isFinite(centralDirectoryOffset) || centralDirectoryOffset <= 0 || centralDirectoryOffset >= bytes.length) {
      throw new Error("The PPTX ZIP central directory offset was invalid.");
    }

    const decoder = new TextDecoder("utf-8");
    const entries = new Map();
    let cursor = centralDirectoryOffset;
    for (let index = 0; index < entryCount; index += 1) {
      if (cursor + 46 > bytes.length) {
        throw new Error("The PPTX ZIP central directory ended unexpectedly.");
      }
      if (readUint32(bytes, cursor) !== ZIP_CENTRAL_DIRECTORY_SIGNATURE) {
        throw new Error("The PPTX ZIP central directory signature was invalid.");
      }

      const compressionMethod = readUint16(bytes, cursor + 10);
      const compressedSize = readUint32(bytes, cursor + 20);
      const uncompressedSize = readUint32(bytes, cursor + 24);
      const fileNameLength = readUint16(bytes, cursor + 28);
      const extraFieldLength = readUint16(bytes, cursor + 30);
      const commentLength = readUint16(bytes, cursor + 32);
      const localHeaderOffset = readUint32(bytes, cursor + 42);
      const fileNameStart = cursor + 46;
      const fileNameEnd = fileNameStart + fileNameLength;
      if (fileNameEnd > bytes.length) {
        throw new Error("The PPTX ZIP entry name exceeded the archive bounds.");
      }

      const entryPath = normalizeZipPath(decoder.decode(bytes.subarray(fileNameStart, fileNameEnd)));
      if (entryPath) {
        if (readUint32(bytes, localHeaderOffset) !== ZIP_LOCAL_FILE_HEADER_SIGNATURE) {
          throw new Error(`The local ZIP header for ${entryPath} was invalid.`);
        }

        const localFileNameLength = readUint16(bytes, localHeaderOffset + 26);
        const localExtraFieldLength = readUint16(bytes, localHeaderOffset + 28);
        const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraFieldLength;
        const dataEnd = dataOffset + compressedSize;
        if (dataOffset < 0 || dataEnd > bytes.length) {
          throw new Error(`The compressed ZIP payload for ${entryPath} exceeded the archive bounds.`);
        }

        entries.set(entryPath, {
          path: entryPath,
          compressionMethod,
          compressedSize,
          uncompressedSize,
          dataOffset,
          bytesPromise: null,
        });
      }

      cursor = fileNameEnd + extraFieldLength + commentLength;
    }

    return {
      bytes,
      fileName,
      entries,
      xmlCache: new Map(),
      relationshipsCache: new Map(),
      imageDataUriCache: new Map(),
    };
  }

  async function loadZipArchive(file) {
    if (!(file instanceof File)) {
      throw new Error("A PPTX file handle is required before the archive can be read.");
    }
    return createZipArchive(new Uint8Array(await file.arrayBuffer()), file.name);
  }

  function getZipEntry(archive, entryPath) {
    return archive && archive.entries ? archive.entries.get(normalizeZipPath(entryPath)) || null : null;
  }

  async function extractZipEntryBytes(archive, entryPath, optional) {
    const entry = getZipEntry(archive, entryPath);
    if (!entry) {
      if (optional) {
        return null;
      }
      throw new Error(`The PPTX package did not contain ${normalizeZipPath(entryPath) || "the requested entry"}.`);
    }

    if (!entry.bytesPromise) {
      entry.bytesPromise = (async () => {
        const compressedBytes = archive.bytes.subarray(entry.dataOffset, entry.dataOffset + entry.compressedSize);
        if (entry.compressionMethod === 0) {
          return new Uint8Array(compressedBytes);
        }
        if (entry.compressionMethod === 8) {
          return inflateZipBytes(compressedBytes);
        }
        throw new Error(`The PPTX package used ZIP compression method ${entry.compressionMethod}, which is not supported.`);
      })();
    }

    return entry.bytesPromise;
  }

  async function readZipEntryText(archive, entryPath, optional) {
    const entryBytes = await extractZipEntryBytes(archive, entryPath, optional);
    if (!(entryBytes instanceof Uint8Array)) {
      return null;
    }

    const useUtf16Le = entryBytes.length >= 2 && entryBytes[0] === 0xff && entryBytes[1] === 0xfe;
    const decoder = new TextDecoder(useUtf16Le ? "utf-16le" : "utf-8");
    return decoder.decode(entryBytes).replace(/^\uFEFF/, "");
  }

  function parseXmlDocument(xmlText, label) {
    const documentNode = new DOMParser().parseFromString(String(xmlText || ""), "application/xml");
    const parserError = documentNode.getElementsByTagName("parsererror")[0];
    if (parserError) {
      throw new Error(`${label} could not be parsed as XML.`);
    }
    return documentNode;
  }

  async function readXmlDocument(archive, entryPath, optional) {
    const normalizedPath = normalizeZipPath(entryPath);
    if (!normalizedPath) {
      return null;
    }
    if (archive.xmlCache.has(normalizedPath)) {
      return archive.xmlCache.get(normalizedPath);
    }

    const xmlText = await readZipEntryText(archive, normalizedPath, optional);
    if (typeof xmlText !== "string") {
      return null;
    }

    const documentNode = parseXmlDocument(xmlText, normalizedPath);
    archive.xmlCache.set(normalizedPath, documentNode);
    return documentNode;
  }

  function getLocalName(node) {
    return String((node && (node.localName || node.nodeName)) || "")
      .trim()
      .toLowerCase();
  }

  function getChildElements(node) {
    return Array.from((node && node.childNodes) || []).filter(function (childNode) {
      return childNode && childNode.nodeType === Node.ELEMENT_NODE;
    });
  }

  function getChildrenByLocalName(node, localName) {
    const expectedName = String(localName || "").trim().toLowerCase();
    return getChildElements(node).filter(function (childNode) {
      return getLocalName(childNode) === expectedName;
    });
  }

  function getFirstChildByLocalName(node, localName) {
    return getChildrenByLocalName(node, localName)[0] || null;
  }

  function getDescendantsByLocalName(node, localName) {
    const expectedName = String(localName || "").trim().toLowerCase();
    const results = [];

    function visit(currentNode) {
      for (const childNode of getChildElements(currentNode)) {
        if (getLocalName(childNode) === expectedName) {
          results.push(childNode);
        }
        visit(childNode);
      }
    }

    visit(node);
    return results;
  }

  function getFirstDescendantByLocalName(node, localName) {
    return getDescendantsByLocalName(node, localName)[0] || null;
  }

  function getAttributeByLocalName(node, localName) {
    const expectedName = String(localName || "").trim().toLowerCase();
    if (!(node instanceof Element) || !expectedName) {
      return "";
    }

    for (const attribute of Array.from(node.attributes || [])) {
      const attributeName = String(attribute.localName || attribute.name || "")
        .trim()
        .toLowerCase();
      if (attributeName === expectedName) {
        return attribute.value;
      }
    }
    return "";
  }

  function getRelationshipId(node) {
    return getAttributeByLocalName(node, "id");
  }

  function getRelationshipByType(relationships, typeName) {
    const expectedTypeName = String(typeName || "").trim().toLowerCase();
    if (!expectedTypeName || !(relationships instanceof Map)) {
      return null;
    }

    for (const relationship of relationships.values()) {
      const relationshipType = String((relationship && relationship.type) || "")
        .trim()
        .toLowerCase();
      if (relationshipType === expectedTypeName || relationshipType.endsWith("/" + expectedTypeName)) {
        return relationship;
      }
    }

    return null;
  }

  function pushWarning(warnings, message) {
    const normalizedMessage = String(message || "").trim();
    if (!normalizedMessage) {
      return;
    }
    if (warnings.indexOf(normalizedMessage) < 0) {
      warnings.push(normalizedMessage);
    }
  }

  function convertEmuToPixels(value, fallback) {
    if (value === "" || value === null || typeof value === "undefined") {
      return fallback || 0;
    }
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return fallback || 0;
    }
    return numericValue / EMU_PER_PIXEL;
  }

  function formatSvgNumber(value) {
    return String(roundNumber(Number(value) || 0));
  }

  function escapeSvgText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeSvgAttribute(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function parseBoolean(value) {
    const normalizedValue = String(value || "").trim().toLowerCase();
    return normalizedValue === "1" || normalizedValue === "true";
  }

  function resolveDisplayBoolean(value, fallbackValue) {
    const normalizedValue = String(value || "").trim().toLowerCase();
    if (!normalizedValue) {
      return fallbackValue;
    }
    return normalizedValue === "1" || normalizedValue === "true";
  }

  function createRootTransformContext() {
    return {
      offsetX: 0,
      offsetY: 0,
      scaleX: 1 / EMU_PER_PIXEL,
      scaleY: 1 / EMU_PER_PIXEL,
    };
  }

  function createGroupTransformContext(parentContext, xfrmElement) {
    if (!(xfrmElement instanceof Element)) {
      return parentContext;
    }

    const offElement = getFirstChildByLocalName(xfrmElement, "off");
    const extElement = getFirstChildByLocalName(xfrmElement, "ext");
    const childOffsetElement = getFirstChildByLocalName(xfrmElement, "chOff");
    const childExtentElement = getFirstChildByLocalName(xfrmElement, "chExt");
    const offsetX = Number(getAttributeByLocalName(offElement, "x")) || 0;
    const offsetY = Number(getAttributeByLocalName(offElement, "y")) || 0;
    const extentX = Number(getAttributeByLocalName(extElement, "cx")) || 0;
    const extentY = Number(getAttributeByLocalName(extElement, "cy")) || 0;
    const childOffsetX = Number(getAttributeByLocalName(childOffsetElement, "x")) || 0;
    const childOffsetY = Number(getAttributeByLocalName(childOffsetElement, "y")) || 0;
    const childExtentX = Number(getAttributeByLocalName(childExtentElement, "cx")) || 0;
    const childExtentY = Number(getAttributeByLocalName(childExtentElement, "cy")) || 0;
    const localScaleX = childExtentX > 0 && extentX > 0 ? extentX / childExtentX : 1;
    const localScaleY = childExtentY > 0 && extentY > 0 ? extentY / childExtentY : 1;

    return {
      offsetX: parentContext.offsetX + (offsetX - childOffsetX * localScaleX) * parentContext.scaleX,
      offsetY: parentContext.offsetY + (offsetY - childOffsetY * localScaleY) * parentContext.scaleY,
      scaleX: parentContext.scaleX * localScaleX,
      scaleY: parentContext.scaleY * localScaleY,
    };
  }

  function resolveNodeBounds(xfrmElement, context) {
    if (!(xfrmElement instanceof Element)) {
      return null;
    }

    const offElement = getFirstChildByLocalName(xfrmElement, "off");
    const extElement = getFirstChildByLocalName(xfrmElement, "ext");
    const x = context.offsetX + (Number(getAttributeByLocalName(offElement, "x")) || 0) * context.scaleX;
    const y = context.offsetY + (Number(getAttributeByLocalName(offElement, "y")) || 0) * context.scaleY;
    const width = Math.max(0, (Number(getAttributeByLocalName(extElement, "cx")) || 0) * context.scaleX);
    const height = Math.max(0, (Number(getAttributeByLocalName(extElement, "cy")) || 0) * context.scaleY);

    return {
      x: x,
      y: y,
      width: width,
      height: height,
      centerX: x + width / 2,
      centerY: y + height / 2,
      rotation: (Number(getAttributeByLocalName(xfrmElement, "rot")) || 0) / 60000,
      flipH: parseBoolean(getAttributeByLocalName(xfrmElement, "flipH")),
      flipV: parseBoolean(getAttributeByLocalName(xfrmElement, "flipV")),
    };
  }

  function createTransformAttribute(bounds) {
    if (!bounds) {
      return "";
    }

    const transformSteps = [];
    if (Math.abs(bounds.rotation) > 0.001 || bounds.flipH || bounds.flipV) {
      transformSteps.push("translate(" + formatSvgNumber(bounds.centerX) + " " + formatSvgNumber(bounds.centerY) + ")");
      if (Math.abs(bounds.rotation) > 0.001) {
        transformSteps.push("rotate(" + formatSvgNumber(bounds.rotation) + ")");
      }
      if (bounds.flipH || bounds.flipV) {
        transformSteps.push("scale(" + (bounds.flipH ? -1 : 1) + " " + (bounds.flipV ? -1 : 1) + ")");
      }
      transformSteps.push("translate(" + formatSvgNumber(-bounds.centerX) + " " + formatSvgNumber(-bounds.centerY) + ")");
    }

    return transformSteps.length > 0 ? ' transform="' + escapeSvgAttribute(transformSteps.join(" ")) + '"' : "";
  }

  function parseHexColor(value) {
    const normalizedValue = String(value || "")
      .trim()
      .replace(/^#/, "");
    if (/^[0-9a-f]{3}$/i.test(normalizedValue)) {
      return {
        r: parseInt(normalizedValue[0] + normalizedValue[0], 16),
        g: parseInt(normalizedValue[1] + normalizedValue[1], 16),
        b: parseInt(normalizedValue[2] + normalizedValue[2], 16),
        a: 1,
      };
    }
    if (/^[0-9a-f]{6}$/i.test(normalizedValue)) {
      return {
        r: parseInt(normalizedValue.slice(0, 2), 16),
        g: parseInt(normalizedValue.slice(2, 4), 16),
        b: parseInt(normalizedValue.slice(4, 6), 16),
        a: 1,
      };
    }
    return null;
  }

  function clampColorByte(value) {
    return Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
  }

  function formatColor(color) {
    if (!color) {
      return "";
    }

    if ((Number(color.a) || 1) < 0.999) {
      return (
        "rgba(" +
        clampColorByte(color.r) +
        ", " +
        clampColorByte(color.g) +
        ", " +
        clampColorByte(color.b) +
        ", " +
        roundNumber(clamp(Number(color.a) || 0, 0, 1)) +
        ")"
      );
    }

    return (
      "#" +
      [color.r, color.g, color.b]
        .map(function (channel) {
          return clampColorByte(channel).toString(16).padStart(2, "0");
        })
        .join("")
    );
  }

  function convertHslToRgb(hue, saturation, lightness) {
    const normalizedHue = (((Number(hue) || 0) % 360) + 360) % 360;
    const normalizedSaturation = clamp(Number(saturation) || 0, 0, 1);
    const normalizedLightness = clamp(Number(lightness) || 0, 0, 1);
    if (normalizedSaturation <= 0) {
      const grayChannel = clampColorByte(normalizedLightness * 255);
      return { r: grayChannel, g: grayChannel, b: grayChannel, a: 1 };
    }

    const chroma = (1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation;
    const huePrime = normalizedHue / 60;
    const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));
    let red = 0;
    let green = 0;
    let blue = 0;
    if (huePrime >= 0 && huePrime < 1) {
      red = chroma;
      green = secondComponent;
    } else if (huePrime < 2) {
      red = secondComponent;
      green = chroma;
    } else if (huePrime < 3) {
      green = chroma;
      blue = secondComponent;
    } else if (huePrime < 4) {
      green = secondComponent;
      blue = chroma;
    } else if (huePrime < 5) {
      red = secondComponent;
      blue = chroma;
    } else {
      red = chroma;
      blue = secondComponent;
    }

    const matchLightness = normalizedLightness - chroma / 2;
    return {
      r: clampColorByte((red + matchLightness) * 255),
      g: clampColorByte((green + matchLightness) * 255),
      b: clampColorByte((blue + matchLightness) * 255),
      a: 1,
    };
  }

  function resolveBaseColor(colorElement, themeColors) {
    const localName = getLocalName(colorElement);
    if (!localName) {
      return null;
    }

    if (localName === "srgbclr") {
      return parseHexColor(getAttributeByLocalName(colorElement, "val"));
    }
    if (localName === "scrgbclr") {
      return {
        r: clampColorByte((Number(getAttributeByLocalName(colorElement, "r")) || 0) * 255 / 100000),
        g: clampColorByte((Number(getAttributeByLocalName(colorElement, "g")) || 0) * 255 / 100000),
        b: clampColorByte((Number(getAttributeByLocalName(colorElement, "b")) || 0) * 255 / 100000),
        a: 1,
      };
    }
    if (localName === "schemeclr") {
      const schemeName = String(getAttributeByLocalName(colorElement, "val") || "")
        .trim()
        .toLowerCase();
      return parseHexColor(themeColors[schemeName] || DEFAULT_THEME_COLORS[schemeName] || "");
    }
    if (localName === "prstclr") {
      return parseHexColor(PRESET_COLORS[String(getAttributeByLocalName(colorElement, "val") || "").trim().toLowerCase()] || "");
    }
    if (localName === "sysclr") {
      return parseHexColor(getAttributeByLocalName(colorElement, "lastClr")) || parseHexColor(getAttributeByLocalName(colorElement, "val"));
    }
    if (localName === "hslclr") {
      return convertHslToRgb(
        (Number(getAttributeByLocalName(colorElement, "hue")) || 0) / 60000,
        (Number(getAttributeByLocalName(colorElement, "sat")) || 0) / 100000,
        (Number(getAttributeByLocalName(colorElement, "lum")) || 0) / 100000
      );
    }

    return null;
  }

  function applyColorTransforms(color, colorElement) {
    if (!color || !(colorElement instanceof Element)) {
      return color;
    }

    const transformedColor = { r: color.r, g: color.g, b: color.b, a: color.a };
    for (const transformElement of getChildElements(colorElement)) {
      const transformName = getLocalName(transformElement);
      const ratio = clamp((Number(getAttributeByLocalName(transformElement, "val")) || 0) / 100000, 0, 1);
      if (transformName === "alpha") {
        transformedColor.a = clamp((Number(transformedColor.a) || 1) * ratio, 0, 1);
      } else if (transformName === "tint") {
        transformedColor.r = clampColorByte(transformedColor.r + (255 - transformedColor.r) * ratio);
        transformedColor.g = clampColorByte(transformedColor.g + (255 - transformedColor.g) * ratio);
        transformedColor.b = clampColorByte(transformedColor.b + (255 - transformedColor.b) * ratio);
      } else if (transformName === "shade" || transformName === "lummod") {
        transformedColor.r = clampColorByte(transformedColor.r * ratio);
        transformedColor.g = clampColorByte(transformedColor.g * ratio);
        transformedColor.b = clampColorByte(transformedColor.b * ratio);
      } else if (transformName === "lumoff") {
        transformedColor.r = clampColorByte(transformedColor.r + 255 * ratio);
        transformedColor.g = clampColorByte(transformedColor.g + 255 * ratio);
        transformedColor.b = clampColorByte(transformedColor.b + 255 * ratio);
      }
    }

    return transformedColor;
  }

  function resolveColorFromNode(node, themeColors, fallbackColor) {
    if (!(node instanceof Element)) {
      return fallbackColor || "";
    }

    const localName = getLocalName(node);
    if (localName === "nofill") {
      return "";
    }

    const directColor = resolveBaseColor(node, themeColors);
    if (directColor) {
      return formatColor(applyColorTransforms(directColor, node));
    }

    if (localName === "gradfill") {
      const gradientStop = getFirstDescendantByLocalName(node, "gs");
      if (gradientStop) {
        return resolveColorFromNode(gradientStop, themeColors, fallbackColor);
      }
    }

    for (const childNode of getChildElements(node)) {
      const resolvedColor = resolveColorFromNode(childNode, themeColors, fallbackColor);
      if (typeof resolvedColor === "string" && resolvedColor) {
        return resolvedColor;
      }
    }

    return fallbackColor || "";
  }

  function resolveThemeColors(themeDocument) {
    const themeColors = Object.assign({}, DEFAULT_THEME_COLORS);
    const colorSchemeElement = getFirstDescendantByLocalName(themeDocument, "clrScheme");
    if (!(colorSchemeElement instanceof Element)) {
      themeColors.__fontScheme = resolveThemeFontScheme(themeDocument);
      return themeColors;
    }

    for (const schemeElement of getChildElements(colorSchemeElement)) {
      const schemeName = getLocalName(schemeElement);
      const resolvedColor = resolveColorFromNode(schemeElement, themeColors, "");
      if (schemeName && resolvedColor) {
        themeColors[schemeName] = resolvedColor;
      }
    }

    themeColors.tx1 = themeColors.tx1 || themeColors.dk1 || DEFAULT_THEME_COLORS.tx1;
    themeColors.bg1 = themeColors.bg1 || themeColors.lt1 || DEFAULT_THEME_COLORS.bg1;
    themeColors.tx2 = themeColors.tx2 || themeColors.dk2 || DEFAULT_THEME_COLORS.tx2;
    themeColors.bg2 = themeColors.bg2 || themeColors.lt2 || DEFAULT_THEME_COLORS.bg2;
    themeColors.__fontScheme = resolveThemeFontScheme(themeDocument);
    return themeColors;
  }

  function resolveThemeFontCollection(collectionElement) {
    const collection = {
      latin: "",
      ea: "",
      cs: "",
      scripts: {},
    };
    if (!(collectionElement instanceof Element)) {
      return collection;
    }

    for (const childElement of getChildElements(collectionElement)) {
      const localName = getLocalName(childElement);
      if (localName === "latin" || localName === "ea" || localName === "cs") {
        collection[localName] = String(getAttributeByLocalName(childElement, "typeface") || "").trim();
        continue;
      }

      if (localName === "font") {
        const scriptName = String(getAttributeByLocalName(childElement, "script") || "").trim();
        const typeface = String(getAttributeByLocalName(childElement, "typeface") || "").trim();
        if (scriptName && typeface) {
          collection.scripts[scriptName] = typeface;
        }
      }
    }

    return collection;
  }

  function resolveThemeFontScheme(themeDocument) {
    const fontSchemeElement = getFirstDescendantByLocalName(themeDocument, "fontScheme");
    if (!(fontSchemeElement instanceof Element)) {
      return {
        major: resolveThemeFontCollection(null),
        minor: resolveThemeFontCollection(null),
      };
    }

    return {
      major: resolveThemeFontCollection(getFirstChildByLocalName(fontSchemeElement, "majorFont")),
      minor: resolveThemeFontCollection(getFirstChildByLocalName(fontSchemeElement, "minorFont")),
    };
  }

  async function loadThemeColors(archive) {
    const themeEntryPath =
      Array.from((archive && archive.entries && archive.entries.keys()) || []).find(function (entryPath) {
        return /^ppt\/theme\/theme\d+\.xml$/i.test(entryPath);
      }) || "";
    if (!themeEntryPath) {
      const fallbackThemeColors = Object.assign({}, DEFAULT_THEME_COLORS);
      fallbackThemeColors.__fontScheme = resolveThemeFontScheme(null);
      return fallbackThemeColors;
    }

    try {
      const themeDocument = await readXmlDocument(archive, themeEntryPath, true);
      if (themeDocument) {
        return resolveThemeColors(themeDocument);
      }
      const fallbackThemeColors = Object.assign({}, DEFAULT_THEME_COLORS);
      fallbackThemeColors.__fontScheme = resolveThemeFontScheme(null);
      return fallbackThemeColors;
    } catch (error) {
      console.warn("[pigma-import-dispatcher] failed to read PPTX theme colors", error);
      const fallbackThemeColors = Object.assign({}, DEFAULT_THEME_COLORS);
      fallbackThemeColors.__fontScheme = resolveThemeFontScheme(null);
      return fallbackThemeColors;
    }
  }

  async function readRelationships(archive, sourcePath) {
    const normalizedSourcePath = normalizeZipPath(sourcePath);
    if (!normalizedSourcePath) {
      return new Map();
    }
    if (archive.relationshipsCache.has(normalizedSourcePath)) {
      return archive.relationshipsCache.get(normalizedSourcePath);
    }

    const relationshipsPath = getRelationshipsPath(normalizedSourcePath);
    const relationshipsDocument = await readXmlDocument(archive, relationshipsPath, true);
    const relationships = new Map();
    if (relationshipsDocument) {
      for (const relationshipElement of getDescendantsByLocalName(relationshipsDocument, "Relationship")) {
        const relationshipId = getAttributeByLocalName(relationshipElement, "Id");
        const targetMode = getAttributeByLocalName(relationshipElement, "TargetMode");
        if (!relationshipId) {
          continue;
        }

        relationships.set(relationshipId, {
          id: relationshipId,
          type: getAttributeByLocalName(relationshipElement, "Type"),
          target: getAttributeByLocalName(relationshipElement, "Target"),
          targetMode: targetMode,
          path:
            String(targetMode || "").trim().toLowerCase() === "external"
              ? ""
              : resolveZipPath(normalizedSourcePath, getAttributeByLocalName(relationshipElement, "Target")),
        });
      }
    }

    archive.relationshipsCache.set(normalizedSourcePath, relationships);
    return relationships;
  }

  async function parsePresentationPackage(inspectedItem) {
    const archive = await loadZipArchive(inspectedItem.file);
    const presentationDocument = await readXmlDocument(archive, "ppt/presentation.xml");
    if (!presentationDocument) {
      throw new Error("The PPTX package did not contain ppt/presentation.xml.");
    }

    const slideSizeElement = getFirstDescendantByLocalName(presentationDocument, "sldSz");
    const slideWidth = normalizePixelSize(convertEmuToPixels(getAttributeByLocalName(slideSizeElement, "cx"), DEFAULT_SLIDE_WIDTH));
    const slideHeight = normalizePixelSize(convertEmuToPixels(getAttributeByLocalName(slideSizeElement, "cy"), DEFAULT_SLIDE_HEIGHT));
    const presentationRelationships = await readRelationships(archive, "ppt/presentation.xml");
    const slidePaths = [];

    for (const slideReferenceElement of getDescendantsByLocalName(presentationDocument, "sldId")) {
      const relationship = presentationRelationships.get(getRelationshipId(slideReferenceElement));
      if (relationship && relationship.path && /^ppt\/slides\/slide\d+\.xml$/i.test(relationship.path) && slidePaths.indexOf(relationship.path) < 0) {
        slidePaths.push(relationship.path);
      }
    }

    if (slidePaths.length === 0) {
      slidePaths.push.apply(
        slidePaths,
        Array.from(archive.entries.keys())
          .filter(function (entryPath) {
            return /^ppt\/slides\/slide\d+\.xml$/i.test(entryPath);
          })
          .sort(function (leftPath, rightPath) {
            const leftNumber = Number((leftPath.match(/slide(\d+)\.xml$/i) || [])[1]) || 0;
            const rightNumber = Number((rightPath.match(/slide(\d+)\.xml$/i) || [])[1]) || 0;
            return leftNumber - rightNumber;
          })
      );
    }

    if (slidePaths.length === 0) {
      throw new Error("The PPTX package did not expose any slide XML parts.");
    }

    return {
      archive: archive,
      fileName: inspectedItem.file.name,
      slideWidth: slideWidth,
      slideHeight: slideHeight,
      slidePaths: slidePaths,
      themeColors: await loadThemeColors(archive),
    };
  }

  function getImageMimeType(entryPath, env) {
    return IMAGE_MIME_TYPES[env.getExtension(entryPath)] || "";
  }

  async function bytesToDataUri(bytes, mimeType) {
    return new Promise(function (resolve, reject) {
      const fileReader = new FileReader();
      fileReader.onerror = function () {
        reject(fileReader.error || new Error("The PPTX image blob could not be converted to a data URI."));
      };
      fileReader.onload = function () {
        resolve(String(fileReader.result || ""));
      };
      fileReader.readAsDataURL(new Blob([bytes], { type: mimeType || "application/octet-stream" }));
    });
  }

  async function getImageDataUri(archive, entryPath, env) {
    const normalizedPath = normalizeZipPath(entryPath);
    if (!normalizedPath) {
      return "";
    }
    if (!archive.imageDataUriCache.has(normalizedPath)) {
      archive.imageDataUriCache.set(
        normalizedPath,
        (async function () {
          const mimeType = getImageMimeType(normalizedPath, env);
          if (!mimeType) {
            return "";
          }
          const imageBytes = await extractZipEntryBytes(archive, normalizedPath);
          return bytesToDataUri(imageBytes, mimeType);
        })()
      );
    }
    return archive.imageDataUriCache.get(normalizedPath);
  }

  function normalizePictureCropValue(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return 0;
    }
    return clamp(numericValue / 100000, -0.99, 0.99);
  }

  function resolvePictureCrop(pictureElement) {
    const blipFillElement = getFirstChildByLocalName(pictureElement, "blipFill");
    const sourceRectElement = getFirstChildByLocalName(blipFillElement, "srcRect");
    if (!(sourceRectElement instanceof Element)) {
      return null;
    }

    const left = normalizePictureCropValue(getAttributeByLocalName(sourceRectElement, "l"));
    const top = normalizePictureCropValue(getAttributeByLocalName(sourceRectElement, "t"));
    const right = normalizePictureCropValue(getAttributeByLocalName(sourceRectElement, "r"));
    const bottom = normalizePictureCropValue(getAttributeByLocalName(sourceRectElement, "b"));
    if (Math.abs(left) < 0.0001 && Math.abs(top) < 0.0001 && Math.abs(right) < 0.0001 && Math.abs(bottom) < 0.0001) {
      return null;
    }

    return {
      left,
      top,
      right,
      bottom,
      visibleWidth: Math.max(0.001, 1 - left - right),
      visibleHeight: Math.max(0.001, 1 - top - bottom),
    };
  }

  function getTextMeasureContext() {
    if (!textMeasureContext) {
      const measureCanvas = document.createElement("canvas");
      textMeasureContext = measureCanvas.getContext("2d");
    }
    return textMeasureContext;
  }

  function normalizeFontFamilyName(value) {
    return String(value || "")
      .trim()
      .replace(/^['"]+|['"]+$/g, "");
  }

  function formatFontFamilyToken(value) {
    const fontFamilyName = normalizeFontFamilyName(value);
    if (!fontFamilyName) {
      return "";
    }

    if (GENERIC_FONT_FAMILY_NAMES.has(fontFamilyName.toLowerCase())) {
      return fontFamilyName;
    }

    return /[\s,]/.test(fontFamilyName)
      ? '"' + fontFamilyName.replace(/"/g, '\\"') + '"'
      : fontFamilyName;
  }

  function buildFontFamilyValue(candidates) {
    const values = [];
    const seen = new Set();
    for (const candidate of Array.isArray(candidates) ? candidates : [candidates]) {
      const normalizedCandidate = normalizeFontFamilyName(candidate);
      if (!normalizedCandidate) {
        continue;
      }

      const dedupeKey = normalizedCandidate.toLowerCase();
      if (seen.has(dedupeKey)) {
        continue;
      }

      seen.add(dedupeKey);
      values.push(formatFontFamilyToken(normalizedCandidate));
    }

    return values.join(", ");
  }

  function extractPrimaryFontFamily(fontFamilyValue) {
    const tokens = String(fontFamilyValue || "")
      .split(",")
      .map(function (token) {
        return normalizeFontFamilyName(token);
      })
      .filter(Boolean);
    if (tokens.length > 0) {
      return tokens[0];
    }
    return normalizeFontFamilyName(fontFamilyValue);
  }

  function resolveThemeScriptName(languageTag) {
    const normalizedLanguage = String(languageTag || "")
      .trim()
      .toLowerCase();
    if (!normalizedLanguage) {
      return "";
    }

    if (normalizedLanguage.startsWith("ko")) {
      return "Hang";
    }
    if (normalizedLanguage.startsWith("ja")) {
      return "Jpan";
    }
    if (normalizedLanguage.startsWith("zh")) {
      if (
        normalizedLanguage.indexOf("tw") >= 0 ||
        normalizedLanguage.indexOf("hk") >= 0 ||
        normalizedLanguage.indexOf("hant") >= 0
      ) {
        return "Hant";
      }
      return "Hans";
    }
    if (normalizedLanguage.startsWith("th")) {
      return "Thai";
    }
    if (normalizedLanguage.startsWith("ar")) {
      return "Arab";
    }
    if (normalizedLanguage.startsWith("he")) {
      return "Hebr";
    }
    if (normalizedLanguage.startsWith("ru")) {
      return "Cyrl";
    }

    return "";
  }

  function resolveThemeFontFromCollection(collection, targetKind, languageTag) {
    const scriptName = resolveThemeScriptName(languageTag);
    if (!collection || typeof collection !== "object") {
      return "";
    }

    const prioritizedKeys =
      targetKind === "ea"
        ? ["ea", "script", "latin", "cs"]
        : targetKind === "cs"
        ? ["cs", "script", "ea", "latin"]
        : ["latin", "script", "ea", "cs"];

    for (const key of prioritizedKeys) {
      const candidate =
        key === "script"
          ? String(((collection.scripts || {})[scriptName]) || "").trim()
          : String(collection[key] || "").trim();
      if (candidate) {
        return candidate;
      }
    }

    return "";
  }

  function resolveThemeTypefaceAlias(typeface, themeColors, languageTag) {
    const normalizedTypeface = String(typeface || "").trim();
    if (!normalizedTypeface) {
      return "";
    }

    const aliasMatch = normalizedTypeface.match(/^\+(mj|mn)-(lt|ea|cs)$/i);
    if (!aliasMatch) {
      return normalizedTypeface;
    }

    const fontScheme = themeColors && themeColors.__fontScheme;
    const collection = fontScheme ? fontScheme[aliasMatch[1].toLowerCase() === "mj" ? "major" : "minor"] : null;
    return resolveThemeFontFromCollection(collection, aliasMatch[2].toLowerCase(), languageTag);
  }

  function resolveParagraphLanguageTag(paragraphPropertyChain, bodyProperties) {
    for (const propertyElement of paragraphPropertyChain) {
      if (!(propertyElement instanceof Element)) {
        continue;
      }

      const languageTag = String(getAttributeByLocalName(propertyElement, "lang") || "").trim();
      if (languageTag) {
        return languageTag;
      }

      const alternateLanguageTag = String(getAttributeByLocalName(propertyElement, "altLang") || "").trim();
      if (alternateLanguageTag) {
        return alternateLanguageTag;
      }
    }

    return String(getAttributeByLocalName(bodyProperties, "lang") || "").trim();
  }

  function resolveParagraphFontFamily(paragraphPropertyChain, fontRefElement, themeColors, languageTag) {
    const scriptName = resolveThemeScriptName(languageTag);
    const preferEastAsianFonts =
      scriptName === "Hang" || scriptName === "Hans" || scriptName === "Hant" || scriptName === "Jpan";
    const fontTagPriority = preferEastAsianFonts ? ["ea", "latin", "cs"] : ["latin", "ea", "cs"];
    const fontCandidates = [];

    for (const propertyElement of paragraphPropertyChain) {
      if (!(propertyElement instanceof Element)) {
        continue;
      }

      for (const fontTag of fontTagPriority) {
        const fontElement = getFirstChildByLocalName(propertyElement, fontTag);
        const typeface = resolveThemeTypefaceAlias(getAttributeByLocalName(fontElement, "typeface"), themeColors, languageTag);
        if (typeface) {
          fontCandidates.push(typeface);
        }
      }
    }

    for (const fontTag of fontTagPriority) {
      const fontElement = getFirstChildByLocalName(fontRefElement, fontTag);
      const typeface = resolveThemeTypefaceAlias(getAttributeByLocalName(fontElement, "typeface"), themeColors, languageTag);
      if (typeface) {
        fontCandidates.push(typeface);
      }
    }

    const themeFontKind = preferEastAsianFonts ? "ea" : "latin";
    const themeFontIndex = String(getAttributeByLocalName(fontRefElement, "idx") || "").trim().toLowerCase();
    if (themeFontIndex === "major" || themeFontIndex === "minor") {
      const fontScheme = themeColors && themeColors.__fontScheme;
      const collection = fontScheme ? fontScheme[themeFontIndex] : null;
      fontCandidates.push(resolveThemeFontFromCollection(collection, themeFontKind, languageTag));
      fontCandidates.push(resolveThemeFontFromCollection(collection, themeFontKind === "ea" ? "latin" : "ea", languageTag));
    }

    const themeFontScheme = themeColors && themeColors.__fontScheme;
    if (themeFontScheme && themeFontScheme.minor) {
      fontCandidates.push(String(((themeFontScheme.minor.scripts || {})[scriptName]) || "").trim());
      fontCandidates.push(String(themeFontScheme.minor.ea || "").trim());
      fontCandidates.push(String(themeFontScheme.minor.latin || "").trim());
    }

    fontCandidates.push.apply(fontCandidates, DEFAULT_PPT_FONT_FALLBACKS);
    return buildFontFamilyValue(fontCandidates) || buildFontFamilyValue(DEFAULT_PPT_FONT_FALLBACKS);
  }

  function resolveParagraphLetterSpacing(paragraphPropertyChain, fontSize) {
    for (const propertyElement of paragraphPropertyChain) {
      if (!(propertyElement instanceof Element)) {
        continue;
      }

      const spacingValue = Number(getAttributeByLocalName(propertyElement, "spc"));
      if (!Number.isFinite(spacingValue) || spacingValue === 0) {
        continue;
      }

      return roundNumber(clamp((fontSize * spacingValue) / 1000, -fontSize, fontSize));
    }

    return 0;
  }

  function resolveTextSpacingValue(spacingElement, fontSize, fallbackValue) {
    if (!(spacingElement instanceof Element)) {
      return roundNumber(fallbackValue);
    }

    const percentSpacingElement = getFirstChildByLocalName(spacingElement, "spcPct");
    const percentSpacingValue = Number(getAttributeByLocalName(percentSpacingElement, "val"));
    if (Number.isFinite(percentSpacingValue) && percentSpacingValue !== 0) {
      return roundNumber((Math.max(1, Number(fontSize) || 0) * percentSpacingValue) / 100000);
    }

    const pointSpacingElement = getFirstChildByLocalName(spacingElement, "spcPts");
    const pointSpacingValue = Number(getAttributeByLocalName(pointSpacingElement, "val"));
    if (Number.isFinite(pointSpacingValue) && pointSpacingValue !== 0) {
      return roundNumber((((pointSpacingValue || 0) / 100) * 96) / 72);
    }

    return roundNumber(fallbackValue);
  }

  function resolveTextPercentRatio(value, fallbackValue) {
    const normalizedValue = String(value || "").trim();
    if (!normalizedValue) {
      return fallbackValue;
    }

    if (/%$/.test(normalizedValue)) {
      const percentValue = Number(normalizedValue.replace(/%$/, ""));
      if (Number.isFinite(percentValue)) {
        return clamp(percentValue / 100, 0, 10);
      }
      return fallbackValue;
    }

    const numericValue = Number(normalizedValue);
    if (!Number.isFinite(numericValue)) {
      return fallbackValue;
    }

    if (numericValue > 1000) {
      return clamp(numericValue / 100000, 0, 10);
    }
    if (numericValue > 10) {
      return clamp(numericValue / 100, 0, 10);
    }
    return clamp(numericValue, 0, 10);
  }

  function normalizeElementChain(candidateElements) {
    return (Array.isArray(candidateElements) ? candidateElements : [candidateElements]).filter(function (candidateElement) {
      return candidateElement instanceof Element;
    });
  }

  function getAttributeByLocalNameInChain(candidateElements, localName) {
    for (const candidateElement of normalizeElementChain(candidateElements)) {
      const attributeValue = getAttributeByLocalName(candidateElement, localName);
      if (attributeValue !== "") {
        return attributeValue;
      }
    }
    return "";
  }

  function getFirstChildByLocalNameInChain(candidateElements, localName) {
    for (const candidateElement of normalizeElementChain(candidateElements)) {
      const childElement = getFirstChildByLocalName(candidateElement, localName);
      if (childElement) {
        return childElement;
      }
    }
    return null;
  }

  function resolveParagraphLevel(paragraphProperties) {
    const levelValue = Number(getAttributeByLocalName(paragraphProperties, "lvl"));
    if (!Number.isFinite(levelValue)) {
      return 0;
    }
    return clamp(Math.round(levelValue), 0, 8);
  }

  function resolveParagraphListStyle(textBodyElement, paragraphLevel) {
    const listStyleElement = getFirstChildByLocalName(textBodyElement, "lstStyle");
    if (!(listStyleElement instanceof Element)) {
      return {
        levelParagraphProperties: null,
        defaultParagraphProperties: null,
      };
    }

    const normalizedLevel = clamp(Math.round(Number(paragraphLevel) || 0), 0, 8);
    return {
      levelParagraphProperties: getFirstChildByLocalName(listStyleElement, "lvl" + String(normalizedLevel + 1) + "pPr"),
      defaultParagraphProperties: getFirstChildByLocalName(listStyleElement, "defPPr"),
    };
  }

  function resolveTextBodyLayout(bodyProperties) {
    const normalizedWrapValue = String(getAttributeByLocalName(bodyProperties, "wrap") || "")
      .trim()
      .toLowerCase();
    const normalizedVerticalValue = String(getAttributeByLocalName(bodyProperties, "vert") || "")
      .trim()
      .toLowerCase() || "horz";
    const normalAutoFitElement = getFirstChildByLocalName(bodyProperties, "normAutofit");
    const shapeAutoFitElement = getFirstChildByLocalName(bodyProperties, "spAutoFit");
    const noAutoFitElement = getFirstChildByLocalName(bodyProperties, "noAutofit");
    const autoFitMode = shapeAutoFitElement
      ? "shape"
      : normalAutoFitElement
      ? "normal"
      : noAutoFitElement
      ? "none"
      : "none";

    return {
      wrapLines: normalizedWrapValue !== "none",
      verticalMode: normalizedVerticalValue,
      upright: resolveDisplayBoolean(getAttributeByLocalName(bodyProperties, "upright"), false),
      anchorCenter: resolveDisplayBoolean(getAttributeByLocalName(bodyProperties, "anchorCtr"), false),
      rightToLeftColumns: resolveDisplayBoolean(getAttributeByLocalName(bodyProperties, "rtlCol"), false),
      autoFitMode: autoFitMode,
      fontScaleRatio: normalAutoFitElement
        ? resolveTextPercentRatio(getAttributeByLocalName(normalAutoFitElement, "fontScale"), 1)
        : 1,
      lineSpacingReductionRatio: normalAutoFitElement
        ? resolveTextPercentRatio(getAttributeByLocalName(normalAutoFitElement, "lnSpcReduction"), 0)
        : 0,
    };
  }

  function resolveParagraphLineHeightMeta(paragraphProperties, fontSize) {
    const lineSpacingElement = getFirstChildByLocalNameInChain(paragraphProperties, "lnSpc");
    return {
      value: Math.max(1, resolveTextSpacingValue(lineSpacingElement, fontSize, roundNumber(fontSize * TEXT_LINE_HEIGHT_MULTIPLIER))),
      allowsReduction:
        !(lineSpacingElement instanceof Element) || !!getFirstChildByLocalName(lineSpacingElement, "spcPct"),
    };
  }

  function resolveParagraphLineHeight(paragraphProperties, fontSize) {
    return resolveParagraphLineHeightMeta(paragraphProperties, fontSize).value;
  }

  function resolveParagraphSpacingBefore(paragraphProperties, fontSize) {
    return Math.max(
      0,
      resolveTextSpacingValue(getFirstChildByLocalNameInChain(paragraphProperties, "spcBef"), fontSize, 0)
    );
  }

  function resolveParagraphSpacingAfter(paragraphProperties, fontSize) {
    return Math.max(
      0,
      resolveTextSpacingValue(getFirstChildByLocalNameInChain(paragraphProperties, "spcAft"), fontSize, 0)
    );
  }

  function createFontCss(style) {
    const fontSize = Math.max(1, Number((style && style.fontSize) || 16));
    const fontFamily =
      String((style && style.fontFamily) || buildFontFamilyValue(DEFAULT_PPT_FONT_FALLBACKS)).trim() ||
      buildFontFamilyValue(DEFAULT_PPT_FONT_FALLBACKS);
    const fontStyle = String((style && style.fontStyle) || "").trim() || "normal";
    const fontWeight = String((style && style.fontWeight) || "").trim() || "400";
    return fontStyle + " " + fontWeight + " " + fontSize + "px " + fontFamily;
  }

  function measureTextWidth(text, style) {
    const context = getTextMeasureContext();
    const normalizedText = String(text || "");
    const letterSpacing = Number((style && style.letterSpacing) || 0);
    const characterCount = Array.from(normalizedText).length;
    const spacingWidth = characterCount > 1 ? (characterCount - 1) * letterSpacing : 0;
    if (!context) {
      return Math.max(0, characterCount) * (Number((style && style.fontSize) || 16)) * 0.55 + spacingWidth;
    }
    context.font = createFontCss(style);
    return context.measureText(normalizedText).width + spacingWidth;
  }

  function wrapTextLine(lineText, maxWidth, style) {
    const sourceText = String(lineText || "");
    if (!sourceText) {
      return [""];
    }
    if (!(maxWidth > 0) || measureTextWidth(sourceText, style) <= maxWidth) {
      return [sourceText];
    }

    const segments = createWrapSegments(sourceText);
    const wrappedLines = [];
    let currentLine = "";

    for (const segment of segments) {
      if (!segment) {
        continue;
      }

      const candidateLine = currentLine + segment;
      if (!currentLine || measureTextWidth(candidateLine, style) <= maxWidth) {
        currentLine = candidateLine;
        continue;
      }

      if (currentLine.trim().length > 0) {
        wrappedLines.push(currentLine.trimEnd());
      }
      currentLine = /^\s+$/.test(segment) ? "" : segment.trimStart();
    }

    if (currentLine.length > 0) {
      wrappedLines.push(currentLine.trimEnd());
    }

    return wrappedLines.length > 0 ? wrappedLines : [sourceText];
  }

  function containsEastAsianCharacters(value) {
    return /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF\u3040-\u30FF\u3400-\u9FFF\uF900-\uFAFF]/.test(String(value || ""));
  }

  function createWrapSegments(text) {
    const sourceText = String(text || "");
    if (!sourceText) {
      return [""];
    }

    const rawSegments = sourceText.split(/(\s+)/).filter(Boolean);
    if (rawSegments.length === 0) {
      return [sourceText];
    }

    const segments = [];
    for (const rawSegment of rawSegments) {
      if (/^\s+$/.test(rawSegment)) {
        segments.push(rawSegment);
        continue;
      }

      if (containsEastAsianCharacters(rawSegment)) {
        segments.push.apply(segments, Array.from(rawSegment));
        continue;
      }

      segments.push(rawSegment);
    }

    return segments.length > 0 ? segments : [sourceText];
  }

  function resolveTextFillColor(textProperties, fontRefElement, themeColors, fallbackColor) {
    const propertyChain = Array.isArray(textProperties) ? textProperties : [textProperties];
    for (const propertyElement of propertyChain) {
      if (!(propertyElement instanceof Element)) {
        continue;
      }

      if (getFirstChildByLocalName(propertyElement, "noFill")) {
        return "";
      }

      for (const fillName of ["solidFill", "gradFill", "pattFill", "blipFill"]) {
        const fillElement = getFirstChildByLocalName(propertyElement, fillName);
        if (fillElement) {
          const resolvedColor = resolveColorFromNode(fillElement, themeColors, "");
          if (resolvedColor || fillName === "blipFill") {
            return resolvedColor;
          }
        }
      }
    }

    return resolveColorFromNode(fontRefElement, themeColors, "") || fallbackColor || themeColors.tx1 || "#222222";
  }

  function resolveTextHighlightColor(textProperties, themeColors) {
    const propertyChain = Array.isArray(textProperties) ? textProperties : [textProperties];
    for (const propertyElement of propertyChain) {
      if (!(propertyElement instanceof Element)) {
        continue;
      }

      const highlightElement = getFirstChildByLocalName(propertyElement, "highlight");
      if (!highlightElement) {
        continue;
      }

      const resolvedColor = resolveColorFromNode(highlightElement, themeColors, "");
      if (resolvedColor) {
        return resolvedColor;
      }
    }

    return "";
  }

  function resolveParagraphUnderline(paragraphPropertyChain) {
    for (const propertyElement of paragraphPropertyChain) {
      if (!(propertyElement instanceof Element)) {
        continue;
      }

      const underlineValue = String(getAttributeByLocalName(propertyElement, "u") || "")
        .trim()
        .toLowerCase();
      if (!underlineValue) {
        continue;
      }
      return underlineValue !== "none";
    }

    return false;
  }

  function resolveParagraphStrike(paragraphPropertyChain) {
    for (const propertyElement of paragraphPropertyChain) {
      if (!(propertyElement instanceof Element)) {
        continue;
      }

      const strikeValue = String(getAttributeByLocalName(propertyElement, "strike") || "")
        .trim()
        .toLowerCase();
      if (!strikeValue) {
        continue;
      }
      return strikeValue !== "nostrike";
    }

    return false;
  }

  function resolveParagraphTextCase(paragraphPropertyChain) {
    for (const propertyElement of paragraphPropertyChain) {
      if (!(propertyElement instanceof Element)) {
        continue;
      }

      const capValue = String(getAttributeByLocalName(propertyElement, "cap") || "")
        .trim()
        .toLowerCase();
      if (!capValue) {
        continue;
      }
      if (capValue === "all") {
        return "upper";
      }
      if (capValue === "small") {
        return "small-caps";
      }
      return "original";
    }

    return "original";
  }

  function resolveParagraphBaselineShift(paragraphPropertyChain, fontSize) {
    for (const propertyElement of paragraphPropertyChain) {
      if (!(propertyElement instanceof Element)) {
        continue;
      }

      const baselineValue = Number(getAttributeByLocalName(propertyElement, "baseline"));
      if (!Number.isFinite(baselineValue) || baselineValue === 0) {
        continue;
      }
      return roundNumber(clamp((Math.max(1, Number(fontSize) || 0) * baselineValue) / 100000, -fontSize, fontSize));
    }

    return 0;
  }

  function resolveRenderedTextValue(text, style) {
    const sourceText = String(text || "");
    if (!sourceText) {
      return "";
    }

    if (style && style.textCase === "upper") {
      return sourceText.toUpperCase();
    }

    return sourceText;
  }

  function resolveSvgTextDecoration(style) {
    if (!style || typeof style !== "object") {
      return "";
    }

    const decorations = [];
    if (style.underline === true) {
      decorations.push("underline");
    }
    if (style.strikeThrough === true) {
      decorations.push("line-through");
    }
    return decorations.join(" ");
  }

  function createParagraphStyleContext(paragraphElement, textBodyElement, shapeElement) {
    const paragraphProperties = getFirstChildByLocalName(paragraphElement, "pPr");
    const bodyProperties = getFirstChildByLocalName(textBodyElement, "bodyPr");
    const shapeStyleElement = getFirstChildByLocalName(shapeElement, "style");
    const bodyLayout = resolveTextBodyLayout(bodyProperties);
    const paragraphLevel = resolveParagraphLevel(paragraphProperties);
    const listStyle = resolveParagraphListStyle(textBodyElement, paragraphLevel);
    const paragraphPropertyChain = [
      paragraphProperties,
      listStyle.levelParagraphProperties,
      listStyle.defaultParagraphProperties,
    ].filter(Boolean);
    const alignmentValue = String(getAttributeByLocalNameInChain(paragraphPropertyChain, "algn") || "")
      .trim()
      .toLowerCase();
    const textAlignMode =
      alignmentValue === "just" || alignmentValue === "justlow"
        ? "justify"
        : alignmentValue === "dist" || alignmentValue === "thaidist"
        ? "distributed"
        : alignmentValue === "ctr"
        ? "center"
        : alignmentValue === "r"
        ? "end"
        : "start";
    return {
      bodyLayout: bodyLayout,
      paragraphLevel: paragraphLevel,
      paragraphProperties: paragraphProperties,
      levelParagraphProperties: listStyle.levelParagraphProperties,
      defaultParagraphProperties: listStyle.defaultParagraphProperties,
      paragraphPropertyChain: paragraphPropertyChain,
      bodyProperties: bodyProperties,
      fontRefElement: getFirstChildByLocalName(shapeStyleElement, "fontRef"),
      defaultRunPropertyChain: [
        getFirstChildByLocalName(paragraphProperties, "defRPr"),
        getFirstChildByLocalName(listStyle.levelParagraphProperties, "defRPr"),
        getFirstChildByLocalName(listStyle.defaultParagraphProperties, "defRPr"),
      ].filter(Boolean),
      endParagraphRunProperties: getFirstChildByLocalName(paragraphElement, "endParaRPr"),
      applySpacingOnFirstLastParagraphs: resolveDisplayBoolean(
        getAttributeByLocalName(bodyProperties, "spcFirstLastPara"),
        false
      ),
      textAlignMode: textAlignMode,
      textAnchor: textAlignMode === "center" ? "middle" : textAlignMode === "end" ? "end" : "start",
      verticalAnchor: getAttributeByLocalName(bodyProperties, "anchor") || "t",
    };
  }

  function buildTextStyleKey(style) {
    if (!style || typeof style !== "object") {
      return "";
    }

    return [
      style.fontFamily || "",
      style.fontWeight || "",
      style.fontStyle || "",
      style.fontSize || 0,
      style.lineHeight || 0,
      style.letterSpacing || 0,
      style.fill || "",
      style.highlight || "",
      style.underline === true ? "u" : "",
      style.strikeThrough === true ? "s" : "",
      style.textCase || "",
      style.baselineShift || 0,
      style.textAlignMode || "",
      style.textAnchor || "",
      style.verticalAnchor || "",
    ].join("|");
  }

  function resolveParagraphStyle(styleContext, runProperties, themeColors, defaultTextColor) {
    const resolvedContext = styleContext && typeof styleContext === "object" ? styleContext : {};
    const paragraphPropertyChain = [
      runProperties,
      resolvedContext.endParagraphRunProperties,
    ]
      .concat(Array.isArray(resolvedContext.defaultRunPropertyChain) ? resolvedContext.defaultRunPropertyChain : [])
      .filter(Boolean);
    const firstRunProperties = paragraphPropertyChain[0] || null;
    const languageTag = resolveParagraphLanguageTag(paragraphPropertyChain, resolvedContext.bodyProperties);
    const fontSizePoints = (Number(getAttributeByLocalName(firstRunProperties, "sz")) || 1800) / 100;
    const bodyLayout = resolvedContext.bodyLayout && typeof resolvedContext.bodyLayout === "object" ? resolvedContext.bodyLayout : {};
    const fontScaleRatio = clamp(Number(bodyLayout.fontScaleRatio) || 1, 0.01, 10);
    const fontSize = Math.max(1, roundNumber(((fontSizePoints * 96) / 72) * fontScaleRatio));
    const lineHeightMeta = resolveParagraphLineHeightMeta(
      resolvedContext.paragraphPropertyChain || resolvedContext.paragraphProperties,
      fontSize
    );
    const lineSpacingReductionRatio = clamp(Number(bodyLayout.lineSpacingReductionRatio) || 0, 0, 1);
    const lineHeight = Math.max(
      1,
      roundNumber(
        lineHeightMeta.value * (lineHeightMeta.allowsReduction ? Math.max(0, 1 - lineSpacingReductionRatio) : 1)
      )
    );
    const fillColor = resolveTextFillColor(
      paragraphPropertyChain,
      resolvedContext.fontRefElement,
      themeColors,
      defaultTextColor
    );
    const highlightColor = resolveTextHighlightColor(paragraphPropertyChain, themeColors);

    const style = {
      fontSize: fontSize,
      lineHeight: lineHeight,
      fontFamily: resolveParagraphFontFamily(
        paragraphPropertyChain,
        resolvedContext.fontRefElement,
        themeColors,
        languageTag
      ),
      fontWeight: parseBoolean(getAttributeByLocalName(firstRunProperties, "b")) ? "700" : "400",
      fontStyle: parseBoolean(getAttributeByLocalName(firstRunProperties, "i")) ? "italic" : "normal",
      letterSpacing: resolveParagraphLetterSpacing(paragraphPropertyChain, fontSize),
      fill: fillColor,
      highlight: highlightColor,
      underline: resolveParagraphUnderline(paragraphPropertyChain),
      strikeThrough: resolveParagraphStrike(paragraphPropertyChain),
      textCase: resolveParagraphTextCase(paragraphPropertyChain),
      baselineShift: resolveParagraphBaselineShift(paragraphPropertyChain, fontSize),
      textAlignMode: resolvedContext.textAlignMode || "start",
      textAnchor: resolvedContext.textAnchor || "start",
      verticalAnchor: resolvedContext.verticalAnchor || "t",
    };
    style.styleKey = buildTextStyleKey(style);
    return style;
  }

  function formatAlphabeticCounter(value, uppercase) {
    let normalizedValue = Math.max(1, Math.round(Number(value) || 1));
    let result = "";
    while (normalizedValue > 0) {
      normalizedValue -= 1;
      const remainder = normalizedValue % 26;
      result = String.fromCharCode((uppercase ? 65 : 97) + remainder) + result;
      normalizedValue = Math.floor(normalizedValue / 26);
    }
    return result || (uppercase ? "A" : "a");
  }

  function formatRomanCounter(value, uppercase) {
    let normalizedValue = Math.max(1, Math.round(Number(value) || 1));
    const romanPairs = [
      [1000, "M"],
      [900, "CM"],
      [500, "D"],
      [400, "CD"],
      [100, "C"],
      [90, "XC"],
      [50, "L"],
      [40, "XL"],
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];
    let result = "";
    for (const romanPair of romanPairs) {
      while (normalizedValue >= romanPair[0]) {
        result += romanPair[1];
        normalizedValue -= romanPair[0];
      }
    }
    return uppercase ? result : result.toLowerCase();
  }

  function formatParagraphAutoNumber(value, typeName) {
    const normalizedType = String(typeName || "").trim();
    switch (normalizedType) {
      case "alphaLcParenR":
        return formatAlphabeticCounter(value, false) + ")";
      case "alphaUcParenR":
        return formatAlphabeticCounter(value, true) + ")";
      case "alphaLcPeriod":
        return formatAlphabeticCounter(value, false) + ".";
      case "alphaUcPeriod":
        return formatAlphabeticCounter(value, true) + ".";
      case "romanLcParenR":
        return formatRomanCounter(value, false) + ")";
      case "romanUcParenR":
        return formatRomanCounter(value, true) + ")";
      case "romanLcPeriod":
        return formatRomanCounter(value, false) + ".";
      case "romanUcPeriod":
        return formatRomanCounter(value, true) + ".";
      case "arabicParenR":
        return String(value) + ")";
      case "arabicParenBoth":
        return "(" + String(value) + ")";
      case "arabicPlain":
        return String(value);
      case "arabicMinus":
        return String(value) + "-";
      case "arabicPeriod":
      default:
        return String(value) + ".";
    }
  }

  function resolveParagraphAutoNumberText(listState, paragraphLevel, typeName, startAt) {
    const resolvedState = listState && typeof listState === "object" ? listState : {};
    if (!Array.isArray(resolvedState.autoNumberCounters)) {
      resolvedState.autoNumberCounters = [];
    }

    const normalizedLevel = clamp(Math.round(Number(paragraphLevel) || 0), 0, 8);
    const normalizedType = String(typeName || "").trim() || "arabicPeriod";
    const normalizedStartAt = Math.max(1, Math.round(Number(startAt) || 1));
    const existingCounter = resolvedState.autoNumberCounters[normalizedLevel];
    let counterValue = normalizedStartAt;

    if (
      existingCounter &&
      existingCounter.type === normalizedType &&
      resolvedState.lastWasAutoNumber === true &&
      Number(resolvedState.lastLevel) >= normalizedLevel
    ) {
      counterValue = Math.max(normalizedStartAt, Number(existingCounter.value) + 1);
    }

    resolvedState.autoNumberCounters[normalizedLevel] = {
      type: normalizedType,
      value: counterValue,
    };
    resolvedState.autoNumberCounters.length = normalizedLevel + 1;
    resolvedState.lastWasAutoNumber = true;
    resolvedState.lastLevel = normalizedLevel;

    return formatParagraphAutoNumber(counterValue, normalizedType);
  }

  function resolveParagraphBulletText(paragraphPropertyChain, listState, paragraphLevel) {
    if (getFirstChildByLocalNameInChain(paragraphPropertyChain, "buNone")) {
      if (listState && typeof listState === "object") {
        listState.lastWasAutoNumber = false;
        listState.lastLevel = paragraphLevel;
      }
      return "";
    }

    const bulletCharacterElement = getFirstChildByLocalNameInChain(paragraphPropertyChain, "buChar");
    const bulletCharacter = String(getAttributeByLocalName(bulletCharacterElement, "char") || "");
    if (bulletCharacter) {
      if (listState && typeof listState === "object") {
        listState.lastWasAutoNumber = false;
        listState.lastLevel = paragraphLevel;
      }
      return bulletCharacter;
    }

    const autoNumberElement = getFirstChildByLocalNameInChain(paragraphPropertyChain, "buAutoNum");
    if (autoNumberElement) {
      return resolveParagraphAutoNumberText(
        listState,
        paragraphLevel,
        getAttributeByLocalName(autoNumberElement, "type"),
        getAttributeByLocalName(autoNumberElement, "startAt")
      );
    }

    if (listState && typeof listState === "object") {
      listState.lastWasAutoNumber = false;
      listState.lastLevel = paragraphLevel;
    }
    return "";
  }

  function createParagraphBulletFragment(paragraphPropertyChain, paragraphStyle, listState, paragraphLevel) {
    const bulletText = resolveParagraphBulletText(paragraphPropertyChain, listState, paragraphLevel);
    if (!bulletText) {
      return null;
    }

    const bulletStyle = Object.assign({}, paragraphStyle);
    bulletStyle.styleKey = buildTextStyleKey(bulletStyle);
    return {
      text: bulletText,
      style: bulletStyle,
      width: roundNumber(measureTextWidth(bulletText, bulletStyle)),
    };
  }

  function resolveParagraphLineLayout(paragraphPropertyChain, paragraphStyle, maxTextWidth, bulletFragment) {
    const marginLeft = roundNumber(convertEmuToPixels(getAttributeByLocalNameInChain(paragraphPropertyChain, "marL"), 0));
    const indent = roundNumber(convertEmuToPixels(getAttributeByLocalNameInChain(paragraphPropertyChain, "indent"), 0));
    const continuationOffset = marginLeft;
    const bulletOffset = roundNumber(marginLeft + indent);
    const bulletGap = bulletFragment
      ? roundNumber(
          Math.max(4, Number(((bulletFragment.style && bulletFragment.style.fontSize) || paragraphStyle.fontSize || 16)) * 0.25)
        )
      : 0;
    const firstLineContentOffset = bulletFragment
      ? roundNumber(Math.max(continuationOffset, bulletOffset + Number(bulletFragment.width || 0) + bulletGap))
      : roundNumber(continuationOffset + indent);

    return {
      firstLineContentOffset: firstLineContentOffset,
      continuationOffset: continuationOffset,
      firstLinePrefixOffset: bulletOffset,
      firstLinePrefixFragments: bulletFragment ? [bulletFragment] : [],
      firstLineMaxWidth: Math.max(1, roundNumber(maxTextWidth - firstLineContentOffset)),
      continuationMaxWidth: Math.max(1, roundNumber(maxTextWidth - continuationOffset)),
    };
  }

  function resolveTextAnchorX(style, bounds, insetLeft, insetRight, lineLeftOffset, lineMaxWidth) {
    if (!style || !bounds) {
      return 0;
    }
    const resolvedLineLeft = bounds.x + insetLeft + (Number(lineLeftOffset) || 0);
    const resolvedLineWidth = Math.max(
      1,
      Number.isFinite(Number(lineMaxWidth))
        ? Number(lineMaxWidth)
        : bounds.width - insetLeft - insetRight - (Number(lineLeftOffset) || 0)
    );
    if (style.textAnchor === "middle") {
      return resolvedLineLeft + resolvedLineWidth / 2;
    }
    if (style.textAnchor === "end") {
      return resolvedLineLeft + resolvedLineWidth;
    }
    return resolvedLineLeft;
  }

  function resolveAnchorCenteredLineStartX(bodyLayout, bounds, insetLeft, line) {
    if (!bodyLayout || bodyLayout.anchorCenter !== true || !bounds) {
      return null;
    }

    const lineContentOffset = Number((line && line.contentOffset) || 0);
    const lineMaxWidth = Math.max(1, Number((line && line.maxWidth) || 0));
    const lineWidth = Math.max(0, Number((line && line.lineWidth) || 0));
    if (!(lineMaxWidth > lineWidth)) {
      return bounds.x + insetLeft + lineContentOffset;
    }

    return roundNumber(bounds.x + insetLeft + lineContentOffset + (lineMaxWidth - lineWidth) / 2);
  }

  function resolveVerticalTextRotation(bodyLayout) {
    const resolvedLayout = bodyLayout && typeof bodyLayout === "object" ? bodyLayout : {};
    const verticalMode = String(resolvedLayout.verticalMode || "horz").trim().toLowerCase();
    if (!verticalMode || verticalMode === "horz") {
      return 0;
    }

    const rightToLeftColumns = resolvedLayout.rightToLeftColumns !== false;
    let rotation = rightToLeftColumns ? 90 : -90;
    if (verticalMode === "vert270" || verticalMode === "mongolianvert") {
      rotation *= -1;
    }
    return rotation;
  }

  function createRotatedMarkup(markup, angle, centerX, centerY) {
    const rotation = roundNumber(angle);
    if (!markup || Math.abs(rotation) < 0.001) {
      return markup;
    }

    return (
      '<g transform="rotate(' +
      formatSvgNumber(rotation) +
      " " +
      formatSvgNumber(centerX) +
      " " +
      formatSvgNumber(centerY) +
      ')">' +
      markup +
      "</g>"
    );
  }

  function finalizeTextMarkup(markup, bodyLayout, bounds) {
    if (!markup) {
      return "";
    }

    const resolvedLayout = bodyLayout && typeof bodyLayout === "object" ? bodyLayout : {};
    if (resolvedLayout.upright === true && bounds && Math.abs(Number(bounds.rotation) || 0) > 0.001) {
      return createRotatedMarkup(markup, -Number(bounds.rotation) || 0, bounds.centerX, bounds.centerY);
    }

    return markup;
  }

  function resolveTextLineStartX(style, anchorX, lineWidth) {
    if (!style) {
      return anchorX;
    }
    if (style.textAnchor === "middle") {
      return anchorX - lineWidth / 2;
    }
    if (style.textAnchor === "end") {
      return anchorX - lineWidth;
    }
    return anchorX;
  }

  function transformPointByBounds(bounds, x, y) {
    if (!bounds) {
      return {
        x: roundNumber(x),
        y: roundNumber(y),
      };
    }

    const centerX = Number(bounds.centerX) || 0;
    const centerY = Number(bounds.centerY) || 0;
    let deltaX = (Number(x) || 0) - centerX;
    let deltaY = (Number(y) || 0) - centerY;

    if (bounds.flipH) {
      deltaX *= -1;
    }
    if (bounds.flipV) {
      deltaY *= -1;
    }

    const rotationRadians = ((Number(bounds.rotation) || 0) * Math.PI) / 180;
    if (Math.abs(rotationRadians) > 0.000001) {
      const cosValue = Math.cos(rotationRadians);
      const sinValue = Math.sin(rotationRadians);
      const rotatedX = deltaX * cosValue - deltaY * sinValue;
      const rotatedY = deltaX * sinValue + deltaY * cosValue;
      deltaX = rotatedX;
      deltaY = rotatedY;
    }

    return {
      x: roundNumber(centerX + deltaX),
      y: roundNumber(centerY + deltaY),
    };
  }

  function resolveEditableTextFill(fillValue) {
    const normalizedValue = String(fillValue || "").trim();
    if (!normalizedValue) {
      return {
        fillColor: "#000000",
        fillOpacity: 0,
      };
    }

    const hexMatch = normalizedValue.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hexMatch) {
      const compactHex = hexMatch[1];
      return {
        fillColor:
          "#" +
          (compactHex.length === 3
            ? compactHex[0] +
              compactHex[0] +
              compactHex[1] +
              compactHex[1] +
              compactHex[2] +
              compactHex[2]
            : compactHex),
        fillOpacity: 1,
      };
    }

    const rgbaMatch = normalizedValue.match(
      /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+)\s*)?\)$/i
    );
    if (!rgbaMatch) {
      return {
        fillColor: normalizedValue,
        fillOpacity: 1,
      };
    }

    return {
      fillColor:
        "#" +
        rgbaMatch
          .slice(1, 4)
          .map(function (channel) {
            return clampColorByte(Number(channel) || 0).toString(16).padStart(2, "0");
          })
          .join(""),
      fillOpacity: clamp(Number(rgbaMatch[4]) || 1, 0, 1),
    };
  }

  function createEditableTextRun(lineText, style, boxX, boxY, lineWidth, bounds) {
    const visibleLineText = String(lineText || "");
    if (!visibleLineText.trim()) {
      return null;
    }

    const lineHeight = Math.max(1, roundNumber(style && style.lineHeight));
    const fontSize = Math.max(1, roundNumber(style && style.fontSize));
    const lineCenter = transformPointByBounds(
      bounds,
      Number(boxX) + lineWidth / 2,
      Number(boxY) + lineHeight / 2
    );
    const fillMeta = resolveEditableTextFill(style && style.fill);
    const ascentRatio = clamp(fontSize / Math.max(1, lineHeight), 0.45, 0.92);

    return {
      characters: visibleLineText,
      x: roundNumber(lineCenter.x - lineWidth / 2),
      y: roundNumber(lineCenter.y - lineHeight / 2),
      width: Math.max(1, roundNumber(lineWidth)),
      height: lineHeight,
      fontFamily: extractPrimaryFontFamily(style && style.fontFamily) || "Arial",
      fontFamilyRaw: String((style && style.fontFamily) || "").trim() || undefined,
      fontStyle: style && style.fontStyle === "italic" ? "Italic" : "Regular",
      fontWeight: Number((style && style.fontWeight) || 400) || 400,
      fontSize: fontSize,
      nominalFontSize: fontSize,
      lineHeight: lineHeight,
      lineHeightRatio: roundNumber(lineHeight / Math.max(1, fontSize)),
      ascentRatio: roundNumber(ascentRatio),
      descentRatio: Math.max(0.01, roundNumber(1 - ascentRatio)),
      rotation: roundNumber((bounds && bounds.rotation) || 0),
      fillColor: fillMeta.fillColor,
      fillOpacity: roundNumber(fillMeta.fillOpacity),
      letterSpacing: roundNumber((style && style.letterSpacing) || 0),
      underline: style && style.underline === true,
      strikeThrough: style && style.strikeThrough === true,
      textCase: String((style && style.textCase) || "").trim() || "original",
      baselineShift: roundNumber((style && style.baselineShift) || 0),
    };
  }

  function appendRenderedTextFragments(
    textNodes,
    editableTextRuns,
    fragments,
    startX,
    baselineY,
    bounds,
    includeText,
    collectEditableText
  ) {
    let currentX = Number(startX) || 0;

    for (const fragment of Array.isArray(fragments) ? fragments : []) {
      const fragmentText = String((fragment && fragment.text) || "");
      const fragmentStyle =
        (fragment && fragment.style) || {
          fontSize: 16,
          lineHeight: roundNumber(16 * TEXT_LINE_HEIGHT_MULTIPLIER),
          fontFamily: buildFontFamilyValue(DEFAULT_PPT_FONT_FALLBACKS),
          fontWeight: "400",
          fontStyle: "normal",
          letterSpacing: 0,
          fill: "#000000",
          highlight: "",
          underline: false,
          strikeThrough: false,
          textCase: "original",
          baselineShift: 0,
        };
      const renderedText = resolveRenderedTextValue(fragmentText, fragmentStyle);
      const fragmentWidth = Math.max(0, Number((fragment && fragment.width) || 0));
      if (!fragmentText || !(fragmentWidth > 0)) {
        currentX += fragmentWidth;
        continue;
      }

      const highlightHorizontalPadding = roundNumber(fragmentStyle.fontSize * 0.12);
      const highlightVerticalPadding = roundNumber(fragmentStyle.fontSize * 0.14);
      const renderedBaselineY = roundNumber(Number(baselineY) - Number(fragmentStyle.baselineShift || 0));
      const fragmentTopY = renderedBaselineY - fragmentStyle.fontSize;
      const svgTextDecoration = resolveSvgTextDecoration(fragmentStyle);
      const svgSmallCapsAttribute = fragmentStyle.textCase === "small-caps" ? ' font-variant="small-caps"' : "";
      if (fragmentStyle.highlight) {
        const highlightX = currentX - highlightHorizontalPadding;
        const highlightY = fragmentTopY + highlightVerticalPadding * 0.15;
        const highlightWidth = fragmentWidth + highlightHorizontalPadding * 2;
        const highlightHeight = Math.max(1, fragmentStyle.fontSize + highlightVerticalPadding * 2);
        textNodes.push(
          '<rect x="' +
            formatSvgNumber(highlightX) +
            '" y="' +
            formatSvgNumber(highlightY) +
            '" width="' +
            formatSvgNumber(highlightWidth) +
            '" height="' +
            formatSvgNumber(highlightHeight) +
            '" fill="' +
            escapeSvgAttribute(fragmentStyle.highlight) +
            '" rx="' +
            formatSvgNumber(Math.max(0, fragmentStyle.fontSize * 0.04)) +
            '" ry="' +
            formatSvgNumber(Math.max(0, fragmentStyle.fontSize * 0.04)) +
            '" />'
        );
      }

      if (includeText) {
        textNodes.push(
          '<text x="' +
            formatSvgNumber(currentX) +
            '" y="' +
            formatSvgNumber(renderedBaselineY) +
            '" fill="' +
            escapeSvgAttribute(fragmentStyle.fill) +
            '" font-family="' +
            escapeSvgAttribute(fragmentStyle.fontFamily) +
            '" font-size="' +
            formatSvgNumber(fragmentStyle.fontSize) +
            '" font-weight="' +
            escapeSvgAttribute(fragmentStyle.fontWeight) +
            '" font-style="' +
            escapeSvgAttribute(fragmentStyle.fontStyle) +
            '" letter-spacing="' +
            formatSvgNumber(fragmentStyle.letterSpacing || 0) +
            '"' +
            (svgTextDecoration ? ' text-decoration="' + escapeSvgAttribute(svgTextDecoration) + '"' : "") +
            svgSmallCapsAttribute +
            ' text-anchor="start" xml:space="preserve">' +
            escapeSvgText(renderedText) +
            "</text>"
        );
      }

      if (collectEditableText) {
        const editableTextRun = createEditableTextRun(
          fragmentText,
          fragmentStyle,
          currentX,
          fragmentTopY,
          fragmentWidth,
          bounds
        );
        if (editableTextRun) {
          editableTextRuns.push(editableTextRun);
        }
      }

      currentX += fragmentWidth;
    }

    return roundNumber(currentX);
  }

  function createStyledWrapSegments(textRuns) {
    const segments = [];
    for (const textRun of Array.isArray(textRuns) ? textRuns : []) {
      if (!textRun || typeof textRun.text !== "string" || !textRun.text) {
        continue;
      }

      const style = textRun.style || null;
      const runSegments = createWrapSegments(textRun.text.replace(/\r/g, ""));
      for (const segment of runSegments) {
        if (!segment) {
          continue;
        }

        segments.push({
          text: segment,
          style: style,
        });
      }
    }
    return segments;
  }

  function mergeStyledLineFragment(targetFragments, text, style) {
    const visibleText = String(text || "");
    if (!visibleText) {
      return;
    }

      const normalizedStyle = style || null;
    const measuredWidth = roundNumber(measureTextWidth(resolveRenderedTextValue(visibleText, normalizedStyle), normalizedStyle));
    if (!(measuredWidth > 0)) {
      return;
    }

    const lastFragment = targetFragments[targetFragments.length - 1];
    if (
      lastFragment &&
      lastFragment.style &&
      normalizedStyle &&
      lastFragment.style.styleKey === normalizedStyle.styleKey
    ) {
      lastFragment.text += visibleText;
      lastFragment.width = roundNumber(
        measureTextWidth(resolveRenderedTextValue(lastFragment.text, lastFragment.style), lastFragment.style)
      );
      return;
    }

    targetFragments.push({
      text: visibleText,
      style: normalizedStyle,
      width: measuredWidth,
    });
  }

  function createEmptyStyledLine(fallbackStyle) {
    const style = fallbackStyle || {
      fontSize: 16,
      lineHeight: roundNumber(16 * TEXT_LINE_HEIGHT_MULTIPLIER),
    };
    return {
      fragments: [],
      lineWidth: 0,
      lineHeight: Math.max(1, roundNumber(style.lineHeight || style.fontSize || 16)),
      maxFontSize: Math.max(1, roundNumber(style.fontSize || 16)),
    };
  }

  function finalizeStyledLine(rawFragments, fallbackStyle) {
    const normalizedFragments = [];
    const fragments = Array.isArray(rawFragments) ? rawFragments : [];
    for (const fragment of fragments) {
      if (!fragment || typeof fragment.text !== "string" || !fragment.text) {
        continue;
      }

      if (/^\s+$/.test(fragment.text)) {
        if (normalizedFragments.length === 0) {
          continue;
        }

        mergeStyledLineFragment(
          normalizedFragments,
          fragment.text,
          normalizedFragments[normalizedFragments.length - 1].style || fragment.style || fallbackStyle
        );
        continue;
      }

      mergeStyledLineFragment(normalizedFragments, fragment.text, fragment.style || fallbackStyle);
    }

    const lastFragment = normalizedFragments[normalizedFragments.length - 1];
    if (lastFragment && /\s+$/.test(lastFragment.text)) {
        const trimmedText = lastFragment.text.replace(/\s+$/g, "");
      if (trimmedText) {
        lastFragment.text = trimmedText;
        lastFragment.width = roundNumber(
          measureTextWidth(resolveRenderedTextValue(trimmedText, lastFragment.style), lastFragment.style)
        );
      } else {
        normalizedFragments.pop();
      }
    }

    if (normalizedFragments.length === 0) {
      return createEmptyStyledLine(fallbackStyle);
    }

    let lineWidth = 0;
    let lineHeight = 0;
    let maxFontSize = 0;
    for (const fragment of normalizedFragments) {
      const fragmentStyle = fragment.style || fallbackStyle;
      lineWidth += fragment.width;
      lineHeight = Math.max(lineHeight, Number((fragmentStyle && fragmentStyle.lineHeight) || 0));
      maxFontSize = Math.max(maxFontSize, Number((fragmentStyle && fragmentStyle.fontSize) || 0));
    }

    return {
      fragments: normalizedFragments,
      lineWidth: roundNumber(lineWidth),
      lineHeight: Math.max(1, roundNumber(lineHeight || (fallbackStyle && fallbackStyle.lineHeight) || 16)),
      maxFontSize: Math.max(1, roundNumber(maxFontSize || (fallbackStyle && fallbackStyle.fontSize) || 16)),
    };
  }

  function wrapStyledTextRuns(textRuns, maxWidth, fallbackStyle, options) {
    const resolvedOptions = options && typeof options === "object" ? options : {};
    const firstLineMaxWidth = Math.max(
      1,
      Number.isFinite(Number(resolvedOptions.firstLineMaxWidth))
        ? Number(resolvedOptions.firstLineMaxWidth)
        : Number(maxWidth) || 1
    );
    const continuationMaxWidth = Math.max(
      1,
      Number.isFinite(Number(resolvedOptions.continuationMaxWidth))
        ? Number(resolvedOptions.continuationMaxWidth)
        : Number(maxWidth) || 1
    );
    const firstLineWrapWidth = Math.max(
      1,
      Number.isFinite(Number(resolvedOptions.firstLineWrapWidth))
        ? Number(resolvedOptions.firstLineWrapWidth)
        : firstLineMaxWidth
    );
    const continuationWrapWidth = Math.max(
      1,
      Number.isFinite(Number(resolvedOptions.continuationWrapWidth))
        ? Number(resolvedOptions.continuationWrapWidth)
        : continuationMaxWidth
    );
    const firstLineContentOffset = roundNumber(Number(resolvedOptions.firstLineContentOffset) || 0);
    const continuationOffset = roundNumber(Number(resolvedOptions.continuationOffset) || 0);
    const firstLinePrefixOffset = roundNumber(Number(resolvedOptions.firstLinePrefixOffset) || 0);
    const firstLinePrefixFragments = Array.isArray(resolvedOptions.firstLinePrefixFragments)
      ? resolvedOptions.firstLinePrefixFragments.slice()
      : [];
    const wrappedLines = [];
    const segments = createStyledWrapSegments(textRuns);
    if (segments.length === 0) {
      const emptyLine = createEmptyStyledLine(fallbackStyle);
      emptyLine.contentOffset = firstLineContentOffset;
      emptyLine.maxWidth = firstLineMaxWidth;
      if (firstLinePrefixFragments.length > 0) {
        emptyLine.prefixFragments = firstLinePrefixFragments;
        emptyLine.prefixOffset = firstLinePrefixOffset;
      }
      return [emptyLine];
    }

    let currentLine = [];
    let currentLineWidth = 0;
    let currentLineWrapLimit = firstLineWrapWidth;
    for (const segment of segments) {
      if (!segment || typeof segment.text !== "string" || !segment.text) {
        continue;
      }

      const segmentText = segment.text;
      const segmentStyle = segment.style || fallbackStyle;
      const segmentWidth = roundNumber(measureTextWidth(resolveRenderedTextValue(segmentText, segmentStyle), segmentStyle));
      const isWhitespaceOnly = /^\s+$/.test(segmentText);
      if (!(segmentWidth > 0)) {
        continue;
      }

      if (
        currentLine.length > 0 &&
        currentLineWrapLimit > 0 &&
        currentLineWidth + segmentWidth > currentLineWrapLimit &&
        !isWhitespaceOnly
      ) {
        wrappedLines.push(finalizeStyledLine(currentLine, fallbackStyle));
        currentLine = [];
        currentLineWidth = 0;
        currentLineWrapLimit = continuationWrapWidth;
      }

      if (currentLine.length === 0 && isWhitespaceOnly) {
        continue;
      }

      const normalizedSegmentText = currentLine.length === 0 ? segmentText.replace(/^\s+/g, "") : segmentText;
      if (!normalizedSegmentText) {
        continue;
      }

      currentLine.push({
        text: normalizedSegmentText,
        style: segmentStyle,
      });
      currentLineWidth += roundNumber(
        measureTextWidth(resolveRenderedTextValue(normalizedSegmentText, segmentStyle), segmentStyle)
      );
    }

    if (currentLine.length > 0) {
      wrappedLines.push(finalizeStyledLine(currentLine, fallbackStyle));
    }

    const resolvedLines = wrappedLines.length > 0 ? wrappedLines : [createEmptyStyledLine(fallbackStyle)];
    return resolvedLines.map(function (line, lineIndex) {
      const resolvedLine = line || createEmptyStyledLine(fallbackStyle);
      resolvedLine.contentOffset = lineIndex === 0 ? firstLineContentOffset : continuationOffset;
      resolvedLine.maxWidth = lineIndex === 0 ? firstLineMaxWidth : continuationMaxWidth;
      resolvedLine.wrapWidth = lineIndex === 0 ? firstLineWrapWidth : continuationWrapWidth;
      if (lineIndex === 0 && firstLinePrefixFragments.length > 0) {
        resolvedLine.prefixFragments = firstLinePrefixFragments;
        resolvedLine.prefixOffset = firstLinePrefixOffset;
      }
      return resolvedLine;
    });
  }

  function splitFragmentsByWhitespace(fragments) {
    const splitFragments = [];
    for (const fragment of Array.isArray(fragments) ? fragments : []) {
      const fragmentText = String((fragment && fragment.text) || "");
      const fragmentStyle = (fragment && fragment.style) || null;
      if (!fragmentText) {
        continue;
      }

      const parts = fragmentText.split(/(\s+)/).filter(Boolean);
      for (const part of parts) {
        splitFragments.push({
          text: part,
          style: fragmentStyle,
          width: roundNumber(measureTextWidth(part, fragmentStyle)),
        });
      }
    }
    return splitFragments;
  }

  function splitFragmentsByCharacter(fragments) {
    const splitFragments = [];
    for (const fragment of Array.isArray(fragments) ? fragments : []) {
      const fragmentText = String((fragment && fragment.text) || "");
      const fragmentStyle = (fragment && fragment.style) || null;
      if (!fragmentText) {
        continue;
      }

      for (const character of Array.from(fragmentText)) {
        splitFragments.push({
          text: character,
          style: fragmentStyle,
          width: roundNumber(measureTextWidth(character, fragmentStyle)),
        });
      }
    }
    return splitFragments;
  }

  function resolveLineRenderFragments(line, paragraphStyle, lineIndex, lineCount) {
    const fragments = Array.isArray(line && line.fragments) ? line.fragments : [];
    const alignMode = String((paragraphStyle && paragraphStyle.textAlignMode) || "start").trim().toLowerCase();
    const availableWidth = Math.max(0, Number((line && line.maxWidth) || 0));
    const lineWidth = Math.max(0, Number((line && line.lineWidth) || 0));
    const canJustify = lineWidth > 0 && availableWidth - lineWidth > 0.5;
    const shouldJustify =
      alignMode === "distributed"
        ? canJustify
        : alignMode === "justify"
        ? canJustify && lineIndex < lineCount - 1
        : false;

    if (!shouldJustify) {
      return fragments;
    }

    const baseFragments = alignMode === "distributed" ? splitFragmentsByCharacter(fragments) : splitFragmentsByWhitespace(fragments);
    if (baseFragments.length === 0) {
      return fragments;
    }

    const baseWidth = baseFragments.reduce(function (widthSum, fragment) {
      return widthSum + Math.max(0, Number((fragment && fragment.width) || 0));
    }, 0);
    const extraWidth = roundNumber(availableWidth - baseWidth);
    if (!(extraWidth > 0.5)) {
      return baseFragments;
    }

    if (alignMode === "distributed") {
      const opportunities = Math.max(0, baseFragments.length - 1);
      if (!(opportunities > 0)) {
        return baseFragments;
      }
      const extraPerGap = extraWidth / opportunities;
      return baseFragments.map(function (fragment, fragmentIndex) {
        const fragmentWidth = Math.max(0, Number((fragment && fragment.width) || 0));
        return Object.assign({}, fragment, {
          width: roundNumber(fragmentWidth + (fragmentIndex < baseFragments.length - 1 ? extraPerGap : 0)),
        });
      });
    }

    const whitespaceUnits = baseFragments.reduce(function (count, fragment) {
      return count + (/^\s+$/.test(String((fragment && fragment.text) || "")) ? Array.from(String(fragment.text || "")).length : 0);
    }, 0);
    if (!(whitespaceUnits > 0)) {
      return baseFragments;
    }

    const extraPerWhitespace = extraWidth / whitespaceUnits;
    return baseFragments.map(function (fragment) {
      const fragmentText = String((fragment && fragment.text) || "");
      if (!/^\s+$/.test(fragmentText)) {
        return fragment;
      }

      return Object.assign({}, fragment, {
        width: roundNumber(
          Math.max(0, Number((fragment && fragment.width) || 0)) + extraPerWhitespace * Array.from(fragmentText).length
        ),
      });
    });
  }

  function createParagraphEntry(
    paragraphElement,
    textBodyElement,
    shapeElement,
    themeColors,
    defaultTextColor,
    maxTextWidth,
    wrapTextWidth,
    listState
  ) {
    const styleContext = createParagraphStyleContext(paragraphElement, textBodyElement, shapeElement);
    const paragraphStyle = resolveParagraphStyle(styleContext, null, themeColors, defaultTextColor);
    const explicitLines = [[]];
    let lastStyle = paragraphStyle;

    for (const childElement of getChildElements(paragraphElement)) {
      const localName = getLocalName(childElement);
      if (localName === "r" || localName === "fld") {
        const textElement = getFirstChildByLocalName(childElement, "t");
        const textValue = ((textElement && textElement.textContent) || "").replace(/\r/g, "");
        if (!textValue) {
          continue;
        }

        const runStyle = resolveParagraphStyle(
          styleContext,
          getFirstChildByLocalName(childElement, "rPr"),
          themeColors,
          defaultTextColor
        );
        explicitLines[explicitLines.length - 1].push({
          text: textValue,
          style: runStyle,
        });
        lastStyle = runStyle;
      } else if (localName === "tab") {
        explicitLines[explicitLines.length - 1].push({
          text: "  ",
          style: lastStyle || paragraphStyle,
        });
      } else if (localName === "br") {
        explicitLines.push([]);
        lastStyle = paragraphStyle;
      }
    }

    const bulletFragment = createParagraphBulletFragment(
      styleContext.paragraphPropertyChain || styleContext.paragraphProperties,
      paragraphStyle,
      listState,
      styleContext.paragraphLevel
    );
    const paragraphLineLayout = resolveParagraphLineLayout(
      styleContext.paragraphPropertyChain || styleContext.paragraphProperties,
      paragraphStyle,
      maxTextWidth,
      bulletFragment
    );
    const wrapLimit = Math.max(1, Number(wrapTextWidth) || maxTextWidth || 1);

    const hasVisibleText = explicitLines.some(function (lineRuns) {
      return lineRuns.some(function (lineRun) {
        return lineRun && typeof lineRun.text === "string" && lineRun.text.trim().length > 0;
      });
    });
    if (!hasVisibleText && !bulletFragment) {
      return null;
    }

    const wrappedLines = [];
    for (let explicitLineIndex = 0; explicitLineIndex < explicitLines.length; explicitLineIndex += 1) {
      const explicitLineRuns = explicitLines[explicitLineIndex];
      wrappedLines.push.apply(
        wrappedLines,
        wrapStyledTextRuns(
          explicitLineRuns,
          explicitLineIndex === 0 ? paragraphLineLayout.firstLineMaxWidth : paragraphLineLayout.continuationMaxWidth,
          paragraphStyle,
          explicitLineIndex === 0
            ? {
                firstLineMaxWidth: paragraphLineLayout.firstLineMaxWidth,
                continuationMaxWidth: paragraphLineLayout.continuationMaxWidth,
                firstLineWrapWidth: Math.max(1, wrapLimit - paragraphLineLayout.firstLineContentOffset),
                continuationWrapWidth: Math.max(1, wrapLimit - paragraphLineLayout.continuationOffset),
                firstLineContentOffset: paragraphLineLayout.firstLineContentOffset,
                continuationOffset: paragraphLineLayout.continuationOffset,
                firstLinePrefixFragments: paragraphLineLayout.firstLinePrefixFragments,
                firstLinePrefixOffset: paragraphLineLayout.firstLinePrefixOffset,
              }
            : {
                firstLineMaxWidth: paragraphLineLayout.continuationMaxWidth,
                continuationMaxWidth: paragraphLineLayout.continuationMaxWidth,
                firstLineWrapWidth: Math.max(1, wrapLimit - paragraphLineLayout.continuationOffset),
                continuationWrapWidth: Math.max(1, wrapLimit - paragraphLineLayout.continuationOffset),
                firstLineContentOffset: paragraphLineLayout.continuationOffset,
                continuationOffset: paragraphLineLayout.continuationOffset,
              }
        )
      );
    }

    const paragraphLineHeight = wrappedLines.reduce(function (largestHeight, line) {
      return Math.max(largestHeight, Number((line && line.lineHeight) || 0));
    }, Number(paragraphStyle.lineHeight) || 0);

    return {
      style: paragraphStyle,
      lines: wrappedLines.length > 0 ? wrappedLines : [createEmptyStyledLine(paragraphStyle)],
      spacingBefore: resolveParagraphSpacingBefore(
        styleContext.paragraphPropertyChain || styleContext.paragraphProperties,
        paragraphLineHeight
      ),
      spacingAfter: resolveParagraphSpacingAfter(
        styleContext.paragraphPropertyChain || styleContext.paragraphProperties,
        paragraphLineHeight
      ),
      applySpacingOnFirstLastParagraphs: styleContext.applySpacingOnFirstLastParagraphs === true,
    };
  }

  function sanitizeEditableTextRunsForPayload(textRuns) {
    if (!Array.isArray(textRuns)) {
      return undefined;
    }

    const sanitizedRuns = textRuns.filter(function (run) {
      return run && typeof run.characters === "string" && run.characters.trim().length > 0;
    });
    return sanitizedRuns.length > 0 ? sanitizedRuns : undefined;
  }

  function createTextMarkupResult(textBodyElement, bounds, themeColors, shapeElement, defaultTextColor, options) {
    if (!(textBodyElement instanceof Element) || !bounds || !(bounds.width > 0) || !(bounds.height > 0)) {
      return {
        markup: "",
        editableTextRuns: [],
      };
    }

    const resolvedOptions = options && typeof options === "object" ? options : {};
    const includeText = resolvedOptions.includeText !== false;
    const collectEditableText = resolvedOptions.collectEditableText === true;

    const bodyProperties = getFirstChildByLocalName(textBodyElement, "bodyPr");
    const bodyLayout =
      resolvedOptions._bodyLayoutOverride && typeof resolvedOptions._bodyLayoutOverride === "object"
        ? resolvedOptions._bodyLayoutOverride
        : resolveTextBodyLayout(bodyProperties);
    const verticalRotation = resolveVerticalTextRotation(bodyLayout);
    if (Math.abs(verticalRotation) > 0.001 && resolvedOptions._verticalPass !== true) {
      const swappedBounds = Object.assign({}, bounds, {
        x: roundNumber(bounds.centerX - bounds.height / 2),
        y: roundNumber(bounds.centerY - bounds.width / 2),
        width: bounds.height,
        height: bounds.width,
        centerX: bounds.centerX,
        centerY: bounds.centerY,
        rotation: 0,
        flipH: false,
        flipV: false,
      });
      const nestedBodyLayout = Object.assign({}, bodyLayout, {
        verticalMode: "horz",
      });
      const rotatedTextMarkupResult = createTextMarkupResult(
        textBodyElement,
        swappedBounds,
        themeColors,
        shapeElement,
        defaultTextColor,
        Object.assign({}, resolvedOptions, {
          collectEditableText: false,
          _verticalPass: true,
          _bodyLayoutOverride: nestedBodyLayout,
        })
      );

      return {
        markup: finalizeTextMarkup(
          createRotatedMarkup(rotatedTextMarkupResult.markup, verticalRotation, bounds.centerX, bounds.centerY),
          bodyLayout,
          bounds
        ),
        editableTextRuns: [],
      };
    }

    const insetLeft = convertEmuToPixels(
      getAttributeByLocalName(bodyProperties, "lIns"),
      convertEmuToPixels(DEFAULT_TEXT_INSET_X)
    );
    const insetRight = convertEmuToPixels(
      getAttributeByLocalName(bodyProperties, "rIns"),
      convertEmuToPixels(DEFAULT_TEXT_INSET_X)
    );
    const insetTop = convertEmuToPixels(
      getAttributeByLocalName(bodyProperties, "tIns"),
      convertEmuToPixels(DEFAULT_TEXT_INSET_Y)
    );
    const insetBottom = convertEmuToPixels(
      getAttributeByLocalName(bodyProperties, "bIns"),
      convertEmuToPixels(DEFAULT_TEXT_INSET_Y)
    );
    const maxTextWidth = Math.max(1, bounds.width - insetLeft - insetRight);
    const wrapTextWidth = bodyLayout.wrapLines ? maxTextWidth : 1000000;
    const paragraphs = getChildrenByLocalName(textBodyElement, "p");
    if (paragraphs.length === 0) {
      return {
        markup: "",
        editableTextRuns: [],
      };
    }

    const paragraphEntries = [];
    const listState = {
      autoNumberCounters: [],
      lastWasAutoNumber: false,
      lastLevel: -1,
    };
    for (const paragraphElement of paragraphs) {
      const paragraphEntry = createParagraphEntry(
        paragraphElement,
        textBodyElement,
        shapeElement,
        themeColors,
        defaultTextColor,
        maxTextWidth,
        wrapTextWidth,
        listState
      );
      if (paragraphEntry) {
        paragraphEntries.push(paragraphEntry);
      }
    }

    if (paragraphEntries.length === 0) {
      return {
        markup: "",
        editableTextRuns: [],
      };
    }

    let totalTextHeight = 0;
    for (let index = 0; index < paragraphEntries.length; index += 1) {
      const entry = paragraphEntries[index];
      if (index > 0 || entry.applySpacingOnFirstLastParagraphs) {
        totalTextHeight += Math.max(0, Number(entry.spacingBefore) || 0);
      }
      totalTextHeight += entry.lines.reduce(function (heightSum, line) {
        return heightSum + Number((line && line.lineHeight) || 0);
      }, 0);
      if (index < paragraphEntries.length - 1 || entry.applySpacingOnFirstLastParagraphs) {
        totalTextHeight += Math.max(0, Number(entry.spacingAfter) || 0);
      }
    }

    const firstParagraphStyle = paragraphEntries[0].style;
    const availableTextHeight = Math.max(1, bounds.height - insetTop - insetBottom);
    let currentY = bounds.y + insetTop;
    if (bodyLayout.autoFitMode === "shape" && totalTextHeight > availableTextHeight) {
      currentY = bounds.y + insetTop;
    } else if (firstParagraphStyle.verticalAnchor === "ctr") {
      currentY = bounds.y + insetTop + Math.max(0, (availableTextHeight - totalTextHeight) / 2);
    } else if (firstParagraphStyle.verticalAnchor === "b") {
      currentY = bounds.y + bounds.height - insetBottom - totalTextHeight;
    }

    const textNodes = [];
    const editableTextRuns = [];
    for (let paragraphIndex = 0; paragraphIndex < paragraphEntries.length; paragraphIndex += 1) {
      const entry = paragraphEntries[paragraphIndex];
      if (paragraphIndex > 0 || entry.applySpacingOnFirstLastParagraphs) {
        currentY += Math.max(0, Number(entry.spacingBefore) || 0);
      }
      for (let lineIndex = 0; lineIndex < entry.lines.length; lineIndex += 1) {
        const line = entry.lines[lineIndex];
        const lineWidth = Number((line && line.lineWidth) || 0);
        const lineHeight = Math.max(1, Number((line && line.lineHeight) || entry.style.lineHeight || 16));
        const baselineY = currentY + Math.max(1, Number((line && line.maxFontSize) || entry.style.fontSize || 16));
        const renderFragments = resolveLineRenderFragments(line, entry.style, lineIndex, entry.lines.length);
        const anchorCenteredStartX = resolveAnchorCenteredLineStartX(bodyLayout, bounds, insetLeft, line);
        const prefixWidth = Array.isArray(line && line.prefixFragments)
          ? line.prefixFragments.reduce(function (widthSum, fragment) {
              return widthSum + Math.max(0, Number((fragment && fragment.width) || 0));
            }, 0)
          : 0;
        const prefixGap = Math.max(4, Number((entry.style && entry.style.fontSize) || 16) * 0.25);
        const textX =
          anchorCenteredStartX === null
            ? resolveTextAnchorX(
                entry.style,
                bounds,
                insetLeft,
                insetRight,
                line && line.contentOffset,
                line && line.maxWidth
              )
            : anchorCenteredStartX;
        const textLineStartX =
          anchorCenteredStartX === null
            ? resolveTextLineStartX(entry.style, textX, lineWidth)
            : anchorCenteredStartX;

        if (Array.isArray(line && line.prefixFragments) && line.prefixFragments.length > 0) {
          appendRenderedTextFragments(
            textNodes,
            editableTextRuns,
            line.prefixFragments,
            anchorCenteredStartX === null
              ? bounds.x + insetLeft + Number((line && line.prefixOffset) || 0)
              : Math.max(
                  bounds.x + insetLeft + Number((line && line.prefixOffset) || 0),
                  anchorCenteredStartX - Math.max(0, prefixWidth - prefixGap)
                ),
            baselineY,
            bounds,
            includeText,
            collectEditableText
          );
        }

        appendRenderedTextFragments(
          textNodes,
          editableTextRuns,
          renderFragments,
          textLineStartX,
          baselineY,
          bounds,
          includeText,
          collectEditableText
        );

        currentY += lineHeight;
      }

      if (paragraphIndex < paragraphEntries.length - 1 || entry.applySpacingOnFirstLastParagraphs) {
        currentY += Math.max(0, Number(entry.spacingAfter) || 0);
      }
    }

    return {
      markup: finalizeTextMarkup(textNodes.join(""), bodyLayout, bounds),
      editableTextRuns: editableTextRuns,
    };
  }

  function resolveShapeFill(spPrElement, shapeStyleElement, themeColors) {
    if (!(spPrElement instanceof Element)) {
      return resolveColorFromNode(getFirstChildByLocalName(shapeStyleElement, "fillRef"), themeColors, "");
    }

    if (getFirstChildByLocalName(spPrElement, "noFill")) {
      return "";
    }

    const fillCandidates = ["solidFill", "gradFill", "pattFill"];
    for (const candidateName of fillCandidates) {
      const fillElement = getFirstChildByLocalName(spPrElement, candidateName);
      if (fillElement) {
        return resolveColorFromNode(fillElement, themeColors, "");
      }
    }

    return resolveColorFromNode(getFirstChildByLocalName(shapeStyleElement, "fillRef"), themeColors, "");
  }

  function resolveShapeStroke(spPrElement, shapeStyleElement, themeColors) {
    const lineElement = getFirstChildByLocalName(spPrElement, "ln");
    if (lineElement) {
      const strokeColor = resolveColorFromNode(lineElement, themeColors, "");
      const strokeWidth = Math.max(1, convertEmuToPixels(getAttributeByLocalName(lineElement, "w"), 12700 / EMU_PER_PIXEL));
      return strokeColor ? { color: strokeColor, width: roundNumber(strokeWidth) } : null;
    }

    const styleStrokeColor = resolveColorFromNode(getFirstChildByLocalName(shapeStyleElement, "lnRef"), themeColors, "");
    return styleStrokeColor ? { color: styleStrokeColor, width: 1 } : null;
  }

  function getShapePreset(spPrElement, shapeElement) {
    const presetGeometryElement = getFirstDescendantByLocalName(spPrElement, "prstGeom");
    const presetName = String(getAttributeByLocalName(presetGeometryElement, "prst") || "").trim();
    if (presetName) {
      return presetName;
    }
    return getLocalName(shapeElement) === "cxnsp" ? "line" : "rect";
  }

  function createPrimitiveMarkup(shapePreset, bounds, fillColor, stroke) {
    const fillAttribute = fillColor ? ' fill="' + escapeSvgAttribute(fillColor) + '"' : ' fill="none"';
    const strokeAttribute =
      stroke && stroke.color && stroke.width
        ? ' stroke="' + escapeSvgAttribute(stroke.color) + '" stroke-width="' + formatSvgNumber(stroke.width) + '"'
        : "";
    const x = formatSvgNumber(bounds.x);
    const y = formatSvgNumber(bounds.y);
    const width = formatSvgNumber(Math.max(1, bounds.width));
    const height = formatSvgNumber(Math.max(1, bounds.height));

    switch (String(shapePreset || "").trim().toLowerCase()) {
      case "ellipse":
        return '<ellipse cx="' + formatSvgNumber(bounds.x + bounds.width / 2) + '" cy="' + formatSvgNumber(bounds.y + bounds.height / 2) + '" rx="' + formatSvgNumber(Math.max(0.5, bounds.width / 2)) + '" ry="' + formatSvgNumber(Math.max(0.5, bounds.height / 2)) + '"' + fillAttribute + strokeAttribute + " />";
      case "line":
        return '<line x1="' + x + '" y1="' + y + '" x2="' + formatSvgNumber(bounds.x + bounds.width) + '" y2="' + formatSvgNumber(bounds.y + bounds.height) + '" stroke="' + escapeSvgAttribute((stroke && stroke.color) || fillColor || "#000000") + '" stroke-width="' + formatSvgNumber((stroke && stroke.width) || 1) + '" fill="none" />';
      case "triangle":
      case "rttriangle":
        return '<polygon points="' + formatSvgNumber(bounds.x + bounds.width / 2) + "," + y + " " + formatSvgNumber(bounds.x + bounds.width) + "," + formatSvgNumber(bounds.y + bounds.height) + " " + x + "," + formatSvgNumber(bounds.y + bounds.height) + '"' + fillAttribute + strokeAttribute + " />";
      case "diamond":
        return '<polygon points="' + formatSvgNumber(bounds.x + bounds.width / 2) + "," + y + " " + formatSvgNumber(bounds.x + bounds.width) + "," + formatSvgNumber(bounds.y + bounds.height / 2) + " " + formatSvgNumber(bounds.x + bounds.width / 2) + "," + formatSvgNumber(bounds.y + bounds.height) + " " + x + "," + formatSvgNumber(bounds.y + bounds.height / 2) + '"' + fillAttribute + strokeAttribute + " />";
      case "hexagon":
        return '<polygon points="' + formatSvgNumber(bounds.x + bounds.width * 0.25) + "," + y + " " + formatSvgNumber(bounds.x + bounds.width * 0.75) + "," + y + " " + formatSvgNumber(bounds.x + bounds.width) + "," + formatSvgNumber(bounds.y + bounds.height / 2) + " " + formatSvgNumber(bounds.x + bounds.width * 0.75) + "," + formatSvgNumber(bounds.y + bounds.height) + " " + formatSvgNumber(bounds.x + bounds.width * 0.25) + "," + formatSvgNumber(bounds.y + bounds.height) + " " + x + "," + formatSvgNumber(bounds.y + bounds.height / 2) + '"' + fillAttribute + strokeAttribute + " />";
      case "parallelogram":
        return '<polygon points="' + formatSvgNumber(bounds.x + bounds.width * 0.18) + "," + y + " " + formatSvgNumber(bounds.x + bounds.width) + "," + y + " " + formatSvgNumber(bounds.x + bounds.width * 0.82) + "," + formatSvgNumber(bounds.y + bounds.height) + " " + x + "," + formatSvgNumber(bounds.y + bounds.height) + '"' + fillAttribute + strokeAttribute + " />";
      case "trapezoid":
        return '<polygon points="' + formatSvgNumber(bounds.x + bounds.width * 0.2) + "," + y + " " + formatSvgNumber(bounds.x + bounds.width * 0.8) + "," + y + " " + formatSvgNumber(bounds.x + bounds.width) + "," + formatSvgNumber(bounds.y + bounds.height) + " " + x + "," + formatSvgNumber(bounds.y + bounds.height) + '"' + fillAttribute + strokeAttribute + " />";
      case "roundrect":
        return '<rect x="' + x + '" y="' + y + '" width="' + width + '" height="' + height + '" rx="' + formatSvgNumber(Math.min(bounds.width, bounds.height) * 0.14) + '" ry="' + formatSvgNumber(Math.min(bounds.width, bounds.height) * 0.14) + '"' + fillAttribute + strokeAttribute + " />";
      default:
        return '<rect x="' + x + '" y="' + y + '" width="' + width + '" height="' + height + '"' + fillAttribute + strokeAttribute + " />";
    }
  }

  function getShapeName(shapeElement) {
    const nameElement = getFirstDescendantByLocalName(shapeElement, "cNvPr");
    return getAttributeByLocalName(nameElement, "name") || getLocalName(shapeElement) || "shape";
  }

  function createShapeMarkup(shapeElement, context, themeColors, warnings, options, editableTextRunsCollector) {
    const spPrElement = getFirstChildByLocalName(shapeElement, "spPr");
    const xfrmElement = getFirstChildByLocalName(spPrElement, "xfrm");
    const bounds = resolveNodeBounds(xfrmElement, context);
    if (!bounds) {
      pushWarning(warnings, getShapeName(shapeElement) + " was skipped because it did not expose shape bounds.");
      return "";
    }

    const shapeStyleElement = getFirstChildByLocalName(shapeElement, "style");
    const fillColor = resolveShapeFill(spPrElement, shapeStyleElement, themeColors);
    const stroke = resolveShapeStroke(spPrElement, shapeStyleElement, themeColors);
    const textBodyElement = getFirstChildByLocalName(shapeElement, "txBody");
    const defaultTextColor =
      resolveColorFromNode(getFirstChildByLocalName(shapeStyleElement, "fontRef"), themeColors, "") ||
      themeColors.tx1 ||
      "#222222";
    const primitiveMarkup = fillColor || stroke ? createPrimitiveMarkup(getShapePreset(spPrElement, shapeElement), bounds, fillColor, stroke) : "";
    const textMarkupResult = createTextMarkupResult(
      textBodyElement,
      bounds,
      themeColors,
      shapeElement,
      defaultTextColor,
      options
    );
    const textMarkup = textMarkupResult.markup;
    if (Array.isArray(editableTextRunsCollector) && Array.isArray(textMarkupResult.editableTextRuns)) {
      editableTextRunsCollector.push.apply(editableTextRunsCollector, textMarkupResult.editableTextRuns);
    }

    if (!primitiveMarkup && !textMarkup) {
      return "";
    }

    return "<g" + createTransformAttribute(bounds) + ">" + primitiveMarkup + textMarkup + "</g>";
  }

  async function createPictureMarkup(pictureElement, relationships, archive, context, warnings, env) {
    const spPrElement = getFirstChildByLocalName(pictureElement, "spPr");
    const xfrmElement = getFirstChildByLocalName(spPrElement, "xfrm");
    const bounds = resolveNodeBounds(xfrmElement, context);
    if (!bounds || !(bounds.width > 0) || !(bounds.height > 0)) {
      pushWarning(warnings, getShapeName(pictureElement) + " was skipped because it did not expose image bounds.");
      return "";
    }

    const blipElement = getFirstDescendantByLocalName(pictureElement, "blip");
    const relationshipId = getAttributeByLocalName(blipElement, "embed") || getAttributeByLocalName(blipElement, "link");
    const relationship = relationships.get(relationshipId);
    if (!relationship || !relationship.path) {
      pushWarning(warnings, getShapeName(pictureElement) + " was skipped because its image relationship could not be resolved.");
      return "";
    }

    const mimeType = getImageMimeType(relationship.path, env);
    if (!mimeType) {
      pushWarning(
        warnings,
        getShapeName(pictureElement) +
          " uses " +
          (env.getExtension(relationship.path) || "an unsupported image format") +
          ", which the PPTX prototype importer cannot decode in the browser."
      );
      return "";
    }

    const dataUri = await getImageDataUri(archive, relationship.path, env);
    if (!dataUri) {
      pushWarning(warnings, getShapeName(pictureElement) + " image data could not be prepared for SVG rasterization.");
      return "";
    }

    const crop = resolvePictureCrop(pictureElement);
    const imageMarkup =
      crop
        ? '<svg x="' +
          formatSvgNumber(bounds.x) +
          '" y="' +
          formatSvgNumber(bounds.y) +
          '" width="' +
          formatSvgNumber(bounds.width) +
          '" height="' +
          formatSvgNumber(bounds.height) +
          '" viewBox="0 0 ' +
          formatSvgNumber(bounds.width) +
          " " +
          formatSvgNumber(bounds.height) +
          '" overflow="hidden"><image x="' +
          formatSvgNumber((-crop.left * bounds.width) / crop.visibleWidth) +
          '" y="' +
          formatSvgNumber((-crop.top * bounds.height) / crop.visibleHeight) +
          '" width="' +
          formatSvgNumber(bounds.width / crop.visibleWidth) +
          '" height="' +
          formatSvgNumber(bounds.height / crop.visibleHeight) +
          '" href="' +
          escapeSvgAttribute(dataUri) +
          '" xlink:href="' +
          escapeSvgAttribute(dataUri) +
          '" preserveAspectRatio="none" /></svg>'
        : '<image x="' +
          formatSvgNumber(bounds.x) +
          '" y="' +
          formatSvgNumber(bounds.y) +
          '" width="' +
          formatSvgNumber(bounds.width) +
          '" height="' +
          formatSvgNumber(bounds.height) +
          '" href="' +
          escapeSvgAttribute(dataUri) +
          '" xlink:href="' +
          escapeSvgAttribute(dataUri) +
          '" preserveAspectRatio="none" />';

    return (
      "<g" +
      createTransformAttribute(bounds) +
      ">" +
      imageMarkup +
      "</g>"
    );
  }

  async function appendSlideMarkup(node, state, context, env) {
    const localName = getLocalName(node);
    if (!localName) {
      return;
    }

    if (localName === "alternatecontent" || localName === "choice" || localName === "fallback") {
      for (const childNode of getChildElements(node)) {
        await appendSlideMarkup(childNode, state, context, env);
      }
      return;
    }

    if (localName === "sp" || localName === "cxnsp") {
      const shapeMarkup = createShapeMarkup(
        node,
        context,
        state.themeColors,
        state.warnings,
        state.options,
        state.editableTextRuns
      );
      if (shapeMarkup) {
        state.parts.push(shapeMarkup);
      }
      return;
    }

    if (localName === "pic") {
      const pictureMarkup = await createPictureMarkup(node, state.relationships, state.archive, context, state.warnings, env);
      if (pictureMarkup) {
        state.parts.push(pictureMarkup);
      }
      return;
    }

    if (localName === "grpsp") {
      const groupPropertiesElement = getFirstChildByLocalName(node, "grpSpPr");
      const groupTransform = createGroupTransformContext(context, getFirstChildByLocalName(groupPropertiesElement, "xfrm"));
      for (const childNode of getChildElements(node)) {
        const childName = getLocalName(childNode);
        if (childName === "nvgrpsppr" || childName === "grpsppr") {
          continue;
        }
        await appendSlideMarkup(childNode, state, groupTransform, env);
      }
      return;
    }

    if (localName === "graphicframe") {
      pushWarning(
        state.warnings,
        getShapeName(node) + " contains a chart, table, SmartArt, or other graphic frame that the PPTX prototype importer does not rebuild yet."
      );
      return;
    }

    if (localName === "contentpart") {
      pushWarning(state.warnings, "An embedded content part was skipped during PPTX import.");
    }
  }

  function resolveBackgroundColorFromDocument(documentNode, themeColors) {
    const backgroundElement = getFirstDescendantByLocalName(documentNode, "bg");
    if (!(backgroundElement instanceof Element)) {
      return "";
    }

    return resolveColorFromNode(
      getFirstChildByLocalName(backgroundElement, "bgPr") || getFirstChildByLocalName(backgroundElement, "bgRef"),
      themeColors,
      ""
    );
  }

  function resolveInheritedBackgroundColor(documentChain, themeColors) {
    for (const documentNode of documentChain) {
      const backgroundColor = resolveBackgroundColorFromDocument(documentNode, themeColors);
      if (backgroundColor) {
        return backgroundColor;
      }
    }
    return themeColors.bg1 || "#FFFFFF";
  }

  async function loadSlideRenderSources(presentationPackage, slidePath, slideDocument, slideRelationships) {
    const renderSources = [];
    const layoutRelationship = getRelationshipByType(slideRelationships, "slideLayout");
    if (layoutRelationship && layoutRelationship.path) {
      const layoutDocument = await readXmlDocument(presentationPackage.archive, layoutRelationship.path, true);
      if (layoutDocument) {
        const layoutRelationships = await readRelationships(presentationPackage.archive, layoutRelationship.path);
        const masterRelationship = getRelationshipByType(layoutRelationships, "slideMaster");
        if (
          masterRelationship &&
          masterRelationship.path &&
          resolveDisplayBoolean(getAttributeByLocalName(slideDocument && slideDocument.documentElement, "showMasterSp"), true)
        ) {
          const masterDocument = await readXmlDocument(presentationPackage.archive, masterRelationship.path, true);
          if (masterDocument) {
            renderSources.push({
              path: masterRelationship.path,
              document: masterDocument,
              relationships: await readRelationships(presentationPackage.archive, masterRelationship.path),
            });
          }
        }

        renderSources.push({
          path: layoutRelationship.path,
          document: layoutDocument,
          relationships: layoutRelationships,
        });
      }
    }

    renderSources.push({
      path: slidePath,
      document: slideDocument,
      relationships: slideRelationships,
    });

    return renderSources;
  }

  async function buildSlideSvg(presentationPackage, slidePath, env, options) {
    const slideDocument = await readXmlDocument(presentationPackage.archive, slidePath);
    const slideRelationships = await readRelationships(presentationPackage.archive, slidePath);
    const renderSources = await loadSlideRenderSources(presentationPackage, slidePath, slideDocument, slideRelationships);

    const state = {
      archive: presentationPackage.archive,
      relationships: slideRelationships,
      themeColors: presentationPackage.themeColors,
      warnings: [],
      parts: [],
      editableTextRuns: [],
      options: {
        includeText: !(options && options.includeText === false),
        collectEditableText: !!(options && options.collectEditableText),
      },
    };

    for (const renderSource of renderSources) {
      const shapeTreeElement = getFirstDescendantByLocalName(renderSource.document, "spTree");
      if (!(shapeTreeElement instanceof Element)) {
        continue;
      }

      state.relationships = renderSource.relationships;
      for (const childNode of getChildElements(shapeTreeElement)) {
        const childName = getLocalName(childNode);
        if (childName === "nvgrpsppr" || childName === "grpsppr") {
          continue;
        }
        await appendSlideMarkup(childNode, state, createRootTransformContext(), env);
      }
    }

    const backgroundColor = resolveInheritedBackgroundColor(
      renderSources
        .slice()
        .reverse()
        .map(function (renderSource) {
          return renderSource.document;
        }),
      presentationPackage.themeColors
    );
    return {
      width: presentationPackage.slideWidth,
      height: presentationPackage.slideHeight,
      warnings: state.warnings,
      editableTextRuns: sanitizeEditableTextRunsForPayload(state.editableTextRuns),
      svgText:
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" width="' +
        formatSvgNumber(presentationPackage.slideWidth) +
        '" height="' +
        formatSvgNumber(presentationPackage.slideHeight) +
        '" viewBox="0 0 ' +
        formatSvgNumber(presentationPackage.slideWidth) +
        " " +
        formatSvgNumber(presentationPackage.slideHeight) +
        '"><rect width="100%" height="100%" fill="' +
        escapeSvgAttribute(backgroundColor) +
        '" />' +
        state.parts.join("") +
        "</svg>",
    };
  }

  function createSlideFileName(fileName, slideNumber, slideCount, env) {
    const slideLabel = env.getPdfImportPageNumberLabel(slideNumber, slideCount);
    const baseName = env.stripExtension(fileName) || "presentation";
    return baseName + "-slide-" + slideLabel + ".png";
  }

  function createSlideRootName(fileName, slideNumber, slideCount, env) {
    if (Math.max(1, slideCount || 1) <= 1) {
      return env.normalizeImportName(fileName, "PPT Import");
    }
    return env.normalizeImportName(
      (env.stripExtension(fileName) || "presentation") + " Slide " + env.getPdfImportPageNumberLabel(slideNumber, slideCount),
      "PPT Import"
    );
  }

  function resolvePptRasterScale(slideWidth, slideHeight) {
    const width = normalizePixelSize(slideWidth || DEFAULT_SLIDE_WIDTH);
    const height = normalizePixelSize(slideHeight || DEFAULT_SLIDE_HEIGHT);
    const pixelCount = Math.max(1, width * height);
    if (pixelCount <= 2500000) {
      return 2;
    }
    if (pixelCount <= 5000000) {
      return 1.5;
    }
    return 1;
  }

  async function buildBitmapImportPayloads(inspectedItem, importOptions, env) {
    const presentationPackage = await parsePresentationPackage(inspectedItem);
    const slideCount = presentationPackage.slidePaths.length;
    const payloads = [];
    const skippedSlideWarnings = [];
    const rasterScale = resolvePptRasterScale(presentationPackage.slideWidth, presentationPackage.slideHeight);

    for (let slideIndex = 0; slideIndex < slideCount; slideIndex += 1) {
      const slideNumber = slideIndex + 1;
      try {
        const slideSvg = await buildSlideSvg(presentationPackage, presentationPackage.slidePaths[slideIndex], env);
        const rasterizedSlide = await env.rasterizeSvgMarkupToBitmap(
          slideSvg.svgText,
          "Slide " + slideNumber + " of " + inspectedItem.file.name + " could not be rasterized for PPTX import.",
          {
            documentWidth: slideSvg.width,
            documentHeight: slideSvg.height,
            scale: rasterScale,
          }
        );

        const warnings = ["PPTX slide " + slideNumber + " was imported through the flatten-image path."].concat(slideSvg.warnings);
        if (rasterizedSlide.width !== slideSvg.width || rasterizedSlide.height !== slideSvg.height) {
          warnings.push("Slide " + slideNumber + " was rasterized at the browser-decoded size reported by the generated SVG.");
        }
        if ((Number(rasterizedSlide.renderedWidth) || 0) > slideSvg.width || (Number(rasterizedSlide.renderedHeight) || 0) > slideSvg.height) {
          warnings.push(
            "Slide " +
              slideNumber +
              " used high-resolution SVG rasterization (" +
              rasterizedSlide.renderedWidth +
              "x" +
              rasterizedSlide.renderedHeight +
              " px) to improve text clarity."
          );
        }

        payloads.push({
          fileName: createSlideFileName(inspectedItem.file.name, slideNumber, slideCount, env),
          rootName: createSlideRootName(inspectedItem.file.name, slideNumber, slideCount, env),
          documentWidth: slideSvg.width,
          documentHeight: slideSvg.height,
          placement: importOptions.placement,
          mode: "flatten-image",
          compositePngBytes: rasterizedSlide.pngBytes,
          nodes: [],
          warnings: warnings,
        });
      } catch (error) {
        skippedSlideWarnings.push(
          "Slide " +
            slideNumber +
            " was skipped during PPTX import. " +
            env.getErrorMessage(error, "The slide could not be parsed or rasterized cleanly.")
        );
      }
    }

    if (payloads.length === 0) {
      throw new Error(
        skippedSlideWarnings.length > 0
          ? skippedSlideWarnings.join(" ")
          : "The PPTX file did not produce any importable slide payloads."
      );
    }

    if (skippedSlideWarnings.length > 0) {
      payloads[0].warnings.push.apply(payloads[0].warnings, skippedSlideWarnings);
    }

    return payloads;
  }

  async function buildEditableTextImportPayloads(inspectedItem, importOptions, env) {
    const presentationPackage = await parsePresentationPackage(inspectedItem);
    const slideCount = presentationPackage.slidePaths.length;
    const payloads = [];
    const skippedSlideWarnings = [];
    const rasterScale = resolvePptRasterScale(presentationPackage.slideWidth, presentationPackage.slideHeight);

    for (let slideIndex = 0; slideIndex < slideCount; slideIndex += 1) {
      const slideNumber = slideIndex + 1;
      try {
        const slidePath = presentationPackage.slidePaths[slideIndex];
        const slideBackground = await buildSlideSvg(presentationPackage, slidePath, env, {
          includeText: false,
          collectEditableText: true,
        });
        const rasterizedBackground = await env.rasterizeSvgMarkupToBitmap(
          slideBackground.svgText,
          "Slide " + slideNumber + " of " + inspectedItem.file.name + " could not be rasterized for editable PPTX import.",
          {
            documentWidth: slideBackground.width,
            documentHeight: slideBackground.height,
            scale: rasterScale,
          }
        );

        let svgTextFallback = undefined;
        if (Array.isArray(slideBackground.editableTextRuns) && slideBackground.editableTextRuns.length > 0) {
          try {
            const fullSlideSvg = await buildSlideSvg(presentationPackage, slidePath, env, {
              includeText: true,
              collectEditableText: false,
            });
            svgTextFallback = fullSlideSvg.svgText;
          } catch (error) {
            console.warn("[pigma-import-dispatcher] failed to build PPTX editable-text SVG fallback", error);
          }
        }

        const warnings = [
          "Experimental editable PPT text layers were rebuilt from PowerPoint text boxes while the remaining slide content stayed in the background bitmap.",
        ].concat(slideBackground.warnings || []);
        if (!slideBackground.editableTextRuns || slideBackground.editableTextRuns.length === 0) {
          warnings.push("This slide did not expose editable text boxes, so it stayed on the bitmap-only background path.");
        }
        if (
          rasterizedBackground.width !== slideBackground.width ||
          rasterizedBackground.height !== slideBackground.height
        ) {
          warnings.push("Slide " + slideNumber + " used the browser-decoded size reported by the generated SVG background.");
        }
        if (
          (Number(rasterizedBackground.renderedWidth) || 0) > slideBackground.width ||
          (Number(rasterizedBackground.renderedHeight) || 0) > slideBackground.height
        ) {
          warnings.push(
            "Slide " +
              slideNumber +
              " used high-resolution SVG rasterization (" +
              rasterizedBackground.renderedWidth +
              "x" +
              rasterizedBackground.renderedHeight +
              " px) to keep the raster background sharper under editable text."
          );
        }

        payloads.push({
          fileName: createSlideFileName(inspectedItem.file.name, slideNumber, slideCount, env),
          rootName: createSlideRootName(inspectedItem.file.name, slideNumber, slideCount, env),
          placement: importOptions.placement,
          documentWidth: slideBackground.width,
          documentHeight: slideBackground.height,
          svgText: "",
          svgTextFallback,
          backgroundPngBytes: rasterizedBackground.pngBytes,
          editableTextRuns: sanitizeEditableTextRunsForPayload(slideBackground.editableTextRuns),
          warnings: warnings,
        });
      } catch (error) {
        skippedSlideWarnings.push(
          "Slide " +
            slideNumber +
            " was skipped during editable PPTX import. " +
            env.getErrorMessage(error, "The slide background or editable text payload could not be prepared cleanly.")
        );
      }
    }

    if (payloads.length === 0) {
      throw new Error(
        skippedSlideWarnings.length > 0
          ? skippedSlideWarnings.join(" ")
          : "The PPTX file did not produce any importable editable-text slide payloads."
      );
    }

    if (skippedSlideWarnings.length > 0) {
      payloads[0].warnings.push.apply(payloads[0].warnings, skippedSlideWarnings);
    }

    return payloads;
  }

  async function dispatch(analysis, env) {
    const sourceLabel = env.getPdfAdapterDisplayLabel(analysis && analysis.kind);
    const inspectedFiles = env.getInspectedFilesFromAnalysis(analysis);
    if (env.dispatcherState.importPromise) {
      env.setAnalysis({
        ...analysis,
        mode: "blocked",
        status: "blocked",
        summary: sourceLabel + " import is already running.",
        detail: "Wait for the current " + sourceLabel + " import to finish, then try again.",
      });
      return true;
    }

    if (inspectedFiles.length === 0) {
      env.setAnalysis({
        ...analysis,
        mode: "blocked",
        status: "blocked",
        summary: "No " + sourceLabel + " files are available for import.",
        detail: "Please reselect the " + sourceLabel + " file and try again.",
      });
      return true;
    }

    const legacyPresentationFiles = inspectedFiles.filter(function (inspectedItem) {
      return env.getExtension(inspectedItem && inspectedItem.file && inspectedItem.file.name) === "ppt" || (inspectedItem && inspectedItem.compatibility && inspectedItem.compatibility.profile) === "ppt-legacy";
    });
    if (legacyPresentationFiles.length > 0) {
      env.setAnalysis({
        ...analysis,
        mode: "blocked",
        status: "blocked",
        summary: "Legacy .ppt files are not supported yet.",
        detail:
          legacyPresentationFiles
            .map(function (inspectedItem) {
              return inspectedItem && inspectedItem.file ? inspectedItem.file.name : "";
            })
            .filter(Boolean)
            .join(", ") + " must be re-saved as .pptx before the speed-first importer can read the slide package.",
      });
      return true;
    }

    const importOptions = env.getImportOptions();
    if (importOptions.requestedMode === "keep-layers" && typeof env.createSvgImportRequest !== "function") {
      env.setAnalysis({
        ...analysis,
        mode: "blocked",
        status: "blocked",
        summary: "Editable PPT text import is unavailable in this UI build.",
        detail: "The presentation importer can prepare editable text payloads, but the SVG import bridge was not provided by the current UI runtime.",
      });
      return true;
    }

    env.setAnalysis(
      env.createProcessingAnalysis(
        analysis,
        importOptions.requestedMode === "keep-layers"
          ? "PPTX slides are being prepared for editable text import."
          : "PPTX slides are being prepared for import.",
        importOptions.requestedMode === "keep-layers"
          ? "Each PPTX slide is read from the ZIP package, rasterized without text, and then the PowerPoint text boxes are rebuilt as editable Figma text layers."
          : "Each PPTX slide is read from the ZIP package, rendered to SVG in the UI, and then rasterized to a flattened PNG payload."
      )
    );

    const importPromise = (async function () {
      try {
        const payloads = [];
        for (const inspectedItem of inspectedFiles) {
          payloads.push.apply(
            payloads,
            await (
              importOptions.requestedMode === "keep-layers"
                ? buildEditableTextImportPayloads(inspectedItem, importOptions, env)
                : buildBitmapImportPayloads(inspectedItem, importOptions, env)
            )
          );
        }

        const batchRootName = inspectedFiles.length === 1 ? env.normalizeImportName(inspectedFiles[0] && inspectedFiles[0].file && inspectedFiles[0].file.name, "PPT Import") : "";
        if (importOptions.requestedMode === "keep-layers") {
          env.postPluginMessage(env.createSvgImportRequest(payloads, importOptions, sourceLabel + " Editable Text"));
        } else {
          env.postPluginMessage(
            env.createAiImportRequest(payloads, importOptions, sourceLabel, {
              batchRootName: batchRootName,
            })
          );
        }
        env.setAnalysis({
          ...analysis,
          mode: "ready",
          status: "ready",
          summary:
            payloads.length > 1
              ? importOptions.requestedMode === "keep-layers"
                ? "PPTX slides were sent through the editable-text hybrid import path."
                : "PPTX slides were sent through the flattened bitmap import path."
              : importOptions.requestedMode === "keep-layers"
              ? "The PPTX slide was sent through the editable-text hybrid import path."
              : "The PPTX slide was sent through the flattened bitmap import path.",
          detail:
            inspectedFiles.length > 1
              ? importOptions.requestedMode === "keep-layers"
                ? "Each selected PPTX deck was rasterized slide by slide while PowerPoint text boxes were rebuilt as editable Figma text layers."
                : "Each selected PPTX deck was expanded slide by slide and imported as flattened PNG payloads."
              : importOptions.requestedMode === "keep-layers"
              ? "The selected PPTX deck was rasterized slide by slide while PowerPoint text boxes were rebuilt as editable Figma text layers."
              : "The selected PPTX deck was expanded slide by slide and imported as flattened PNG payloads.",
        });
      } catch (error) {
        console.warn("[pigma-import-dispatcher] PPTX import payload preparation failed", error);
        env.setAnalysis({
          ...analysis,
          mode: "blocked",
          status: "blocked",
          summary: "PPTX import payload preparation failed.",
          detail: env.getErrorMessage(error, "The PPTX ZIP package could not be parsed into usable slide payloads."),
        });
      }
    })();

    env.dispatcherState.importPromise = importPromise;
    try {
      await importPromise;
    } finally {
      if (env.dispatcherState.importPromise === importPromise) {
        env.dispatcherState.importPromise = null;
      }
    }

    return true;
  }

  window.PigmaPresentationImport = Object.freeze({
    dispatch: dispatch,
  });
})();
