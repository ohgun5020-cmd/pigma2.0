"use strict";

const fs = require("fs");
const path = require("path");

const STYLE_WORDS = [
  "Extra Black",
  "Ultra Black",
  "Extra Bold",
  "Ultra Bold",
  "Semi Bold",
  "Demi Bold",
  "Extra Light",
  "Ultra Light",
  "Demi Light",
  "Semi Light",
  "Black",
  "Heavy",
  "Bold",
  "Medium",
  "Regular",
  "Roman",
  "Normal",
  "Book",
  "Light",
  "Thin",
  "Hairline"
];

const STYLE_CANONICAL = new Map([
  ["regular", "Regular"],
  ["roman", "Regular"],
  ["normal", "Regular"],
  ["book", "Regular"],
  ["thin", "Thin"],
  ["hairline", "Thin"],
  ["extralight", "ExtraLight"],
  ["ultralight", "ExtraLight"],
  ["light", "Light"],
  ["demilight", "DemiLight"],
  ["semilight", "SemiLight"],
  ["medium", "Medium"],
  ["semibold", "SemiBold"],
  ["demibold", "DemiBold"],
  ["demi", "DemiBold"],
  ["bold", "Bold"],
  ["extrabold", "ExtraBold"],
  ["ultrabold", "ExtraBold"],
  ["black", "Black"],
  ["heavy", "Heavy"]
]);

const STYLE_ALIASES = new Map([
  ["regular", ["regular", "roman", "normal", "book"]],
  ["roman", ["regular", "roman", "normal", "book"]],
  ["normal", ["regular", "roman", "normal", "book"]],
  ["book", ["regular", "roman", "normal", "book"]],
  ["semibold", ["semibold", "demibold", "demi"]],
  ["demibold", ["demibold", "semibold", "demi"]],
  ["demi", ["demibold", "semibold", "demi"]],
  ["extralight", ["extralight", "ultralight"]],
  ["ultralight", ["ultralight", "extralight"]],
  ["black", ["black", "heavy"]],
  ["heavy", ["heavy", "black"]]
]);

function normalizeToken(value) {
  let text = String(value || "").trim().toLowerCase();
  try {
    text = text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  } catch (_) {
    // Old Node runtimes may not support normalize; the raw token is still useful.
  }
  return text.replace(/[^a-z0-9]+/g, "");
}

function canonicalStyle(style) {
  const key = normalizeToken(style || "Regular");
  if (STYLE_CANONICAL.has(key)) return STYLE_CANONICAL.get(key);
  const clean = String(style || "Regular").replace(/[^A-Za-z0-9]+/g, "");
  return clean || "Regular";
}

function styleTokens(style) {
  const base = normalizeToken(style || "Regular");
  const canonical = normalizeToken(canonicalStyle(style || "Regular"));
  const tokens = [base, canonical];
  const aliases = STYLE_ALIASES.get(base);
  if (aliases) tokens.push(...aliases);
  return [...new Set(tokens.filter(Boolean))];
}

function inferStyleFromName(name) {
  const normalizedName = normalizeToken(name);
  for (const word of STYLE_WORDS) {
    const normalizedStyle = normalizeToken(word);
    if (normalizedName.endsWith(normalizedStyle)) return canonicalStyle(word);
  }
  return "";
}

function stripStyleSuffix(family, style) {
  const familyText = String(family || "").trim();
  const styleText = String(style || "").trim();
  if (!familyText || !styleText) return "";
  const familyKey = normalizeToken(familyText);
  const styleKey = normalizeToken(styleText);
  if (!styleKey || !familyKey.endsWith(styleKey) || familyKey.length <= styleKey.length + 2) return "";
  const suffixPattern = new RegExp("(?:[\\s_-]+)?" + styleText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");
  const stripped = familyText.replace(suffixPattern, "").trim();
  return stripped && normalizeToken(stripped) !== familyKey ? stripped : "";
}

function unique(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function isLikelyPostScriptName(value) {
  const text = String(value || "").trim();
  return text.length > 0 &&
    text.length <= 127 &&
    /^[A-Za-z0-9._-]+$/.test(text) &&
    !/copyright|rights reserved/i.test(text);
}

function decodeUtf16Be(buffer) {
  const chars = [];
  for (let offset = 0; offset + 1 < buffer.length; offset += 2) {
    chars.push(buffer.readUInt16BE(offset));
  }
  return String.fromCharCode(...chars);
}

function decodeNameString(buffer, platformId) {
  if (platformId === 0 || platformId === 3) return decodeUtf16Be(buffer);
  return buffer.toString("latin1");
}

function tableMap(buffer, baseOffset = 0) {
  if (baseOffset < 0 || baseOffset + 12 > buffer.length) return null;
  const signature = buffer.toString("latin1", baseOffset, baseOffset + 4);
  const sfntVersion = buffer.readUInt32BE(baseOffset);
  const valid = sfntVersion === 0x00010000 || signature === "OTTO" || signature === "true" || signature === "typ1";
  if (!valid) return null;
  const numTables = buffer.readUInt16BE(baseOffset + 4);
  const tables = new Map();
  for (let index = 0; index < numTables; index += 1) {
    const record = baseOffset + 12 + index * 16;
    if (record + 16 > buffer.length) break;
    const tag = buffer.toString("latin1", record, record + 4);
    const offset = buffer.readUInt32BE(record + 8);
    const length = buffer.readUInt32BE(record + 12);
    if (offset + length <= buffer.length) tables.set(tag, { offset, length });
  }
  return tables;
}

function namePriority(platformId, languageId) {
  if (platformId === 3 && languageId === 0x0409) return 0;
  if (platformId === 0) return 1;
  if (platformId === 3) return 2;
  if (platformId === 1) return 3;
  return 4;
}

function readNames(buffer, tables) {
  const table = tables.get("name");
  if (!table || table.offset + 6 > buffer.length) return null;
  const offset = table.offset;
  const count = buffer.readUInt16BE(offset + 2);
  const stringOffset = buffer.readUInt16BE(offset + 4);
  const records = new Map();
  for (let index = 0; index < count; index += 1) {
    const record = offset + 6 + index * 12;
    if (record + 12 > offset + table.length || record + 12 > buffer.length) break;
    const platformId = buffer.readUInt16BE(record);
    const languageId = buffer.readUInt16BE(record + 4);
    const nameId = buffer.readUInt16BE(record + 6);
    const length = buffer.readUInt16BE(record + 8);
    const valueOffset = buffer.readUInt16BE(record + 10);
    const start = offset + stringOffset + valueOffset;
    const end = start + length;
    if (start < 0 || end > buffer.length) continue;
    const value = decodeNameString(buffer.subarray(start, end), platformId).replace(/\0/g, "").trim();
    if (!value) continue;
    const priority = namePriority(platformId, languageId);
    const current = records.get(nameId);
    if (!current || priority < current.priority) records.set(nameId, { value, priority });
  }
  return {
    get(id) {
      return records.get(id)?.value || "";
    }
  };
}

function readVariableInstances(buffer, tables, names, family) {
  const table = tables.get("fvar");
  if (!table || table.offset + 16 > buffer.length) return [];
  const offset = table.offset;
  const axesArrayOffset = buffer.readUInt16BE(offset + 4);
  const axisCount = buffer.readUInt16BE(offset + 8);
  const axisSize = buffer.readUInt16BE(offset + 10);
  const instanceCount = buffer.readUInt16BE(offset + 12);
  const instanceSize = buffer.readUInt16BE(offset + 14);
  const instancesOffset = offset + axesArrayOffset + axisCount * axisSize;
  const coordinateBytes = axisCount * 4;
  const items = [];
  for (let index = 0; index < instanceCount; index += 1) {
    const entry = instancesOffset + index * instanceSize;
    if (entry + 4 + coordinateBytes > buffer.length) break;
    const subfamilyNameId = buffer.readUInt16BE(entry);
    const postScriptNameOffset = entry + 4 + coordinateBytes;
    const postScriptNameId = postScriptNameOffset + 2 <= entry + instanceSize ? buffer.readUInt16BE(postScriptNameOffset) : 0;
    const style = names.get(subfamilyNameId);
    const rawPostScriptName = postScriptNameId > 0 && postScriptNameId !== 65535 ? names.get(postScriptNameId) : "";
    const postScriptName = isLikelyPostScriptName(rawPostScriptName) ? rawPostScriptName.trim() : "";
    if (family && style && postScriptName) items.push({ family, style, postScriptName });
  }
  return items;
}

function parseFontBuffer(buffer, baseOffset = 0) {
  const tables = tableMap(buffer, baseOffset);
  if (!tables) return null;
  const names = readNames(buffer, tables);
  if (!names) return null;

  const family = names.get(1);
  const subfamily = names.get(2);
  const fullName = names.get(4);
  const rawPostScriptName = names.get(6);
  const postScriptName = isLikelyPostScriptName(rawPostScriptName) ? rawPostScriptName.trim() : "";
  const preferredFamily = names.get(16);
  const preferredSubfamily = names.get(17);
  if (!postScriptName && !family && !preferredFamily) return null;

  const baseFamily = preferredFamily || family;
  const baseStyle = preferredSubfamily || subfamily || inferStyleFromName(fullName) || "Regular";
  return {
    family,
    subfamily,
    fullName,
    postScriptName,
    preferredFamily,
    preferredSubfamily,
    baseFamily,
    baseStyle,
    variableInstances: readVariableInstances(buffer, tables, names, baseFamily)
  };
}

function parseFonts(filePath) {
  let buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch (_) {
    return [];
  }

  if (buffer.length >= 12 && buffer.toString("latin1", 0, 4) === "ttcf") {
    const count = buffer.readUInt32BE(8);
    const fonts = [];
    for (let index = 0; index < count; index += 1) {
      const offsetRecord = 12 + index * 4;
      if (offsetRecord + 4 > buffer.length) break;
      const offset = buffer.readUInt32BE(offsetRecord);
      const font = parseFontBuffer(buffer, offset);
      if (font) fonts.push(font);
    }
    return fonts;
  }

  const font = parseFontBuffer(buffer);
  return font ? [font] : [];
}

function addRecord(map, family, style, postScriptName) {
  if (!family || !isLikelyPostScriptName(postScriptName)) return;
  const safePostScriptName = String(postScriptName).trim();
  const resolvedStyle = style || inferStyleFromName(family) || "Regular";
  const families = unique([family, stripStyleSuffix(family, resolvedStyle)]);
  const styles = styleTokens(resolvedStyle);
  for (const familyName of families) {
    const familyKey = normalizeToken(familyName);
    if (!familyKey) continue;
    for (const styleKey of styles) {
      const key = `${familyKey}|${styleKey}`;
      if (!map.has(key)) map.set(key, safePostScriptName);
    }
  }
}

function addFont(map, font) {
  if (!font) return;
  addRecord(map, font.baseFamily, font.baseStyle, font.postScriptName);
  addRecord(map, font.family, font.subfamily, font.postScriptName);
  addRecord(map, font.preferredFamily, font.preferredSubfamily || font.subfamily, font.postScriptName);

  const fullStyle = inferStyleFromName(font.fullName);
  if (fullStyle) {
    addRecord(map, stripStyleSuffix(font.fullName, fullStyle), fullStyle, font.postScriptName);
  }

  for (const instance of font.variableInstances) {
    addRecord(map, instance.family, instance.style, instance.postScriptName);
  }
}

function fontRoots() {
  const roots = [];
  if (process.env.WINDIR) roots.push(path.join(process.env.WINDIR, "Fonts"));
  if (process.env.LOCALAPPDATA) roots.push(path.join(process.env.LOCALAPPDATA, "Microsoft", "Windows", "Fonts"));
  if (process.env.APPDATA) roots.push(path.join(process.env.APPDATA, "Adobe", "CoreSync", "plugins", "livetype", "r"));
  return [...new Set(roots)];
}

function walkFonts(root, out) {
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch (_) {
    return;
  }
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      walkFonts(fullPath, out);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (ext && ext !== ".ttf" && ext !== ".otf" && ext !== ".ttc" && ext !== ".otc") continue;
    out.push(fullPath);
  }
}

function addCurated(map) {
  const curated = [
    ["Arial", "Regular", "ArialMT"],
    ["Arial", "Bold", "Arial-BoldMT"],
    ["Arial", "Italic", "Arial-ItalicMT"],
    ["Arial", "Bold Italic", "Arial-BoldItalicMT"],
    ["Inter", "Regular", "Inter-Regular"],
    ["Inter", "Medium", "Inter-Medium"],
    ["Inter", "SemiBold", "Inter-SemiBold"],
    ["Inter", "Bold", "Inter-Bold"],
    ["Inter Display", "Regular", "InterDisplay-Regular"],
    ["Inter Display", "Bold", "InterDisplay-Bold"],
    ["Roboto", "Regular", "Roboto-Regular"],
    ["Roboto", "Medium", "Roboto-Medium"],
    ["Roboto", "Bold", "Roboto-Bold"],
    ["Roboto", "Black", "Roboto-Black"],
    ["LG EI Headline", "Regular", "LGEIHeadline-Regular"],
    ["LG EI Headline", "Light", "LGEIHeadline-Light"],
    ["LG EI Headline", "Thin", "LGEIHeadline-Thin"],
    ["LG EI Headline", "SemiBold", "LGEIHeadline-Semibold"],
    ["LG EI Headline", "Bold", "LGEIHeadline-Bold"],
    ["LG EI Headline TTF", "Regular", "LGEIHeadlineTTF-Regular"],
    ["LG EI Headline TTF", "Light", "LGEIHeadlineTTF-Light"],
    ["LG EI Headline TTF", "Thin", "LGEIHeadlineTTF-Thin"],
    ["LG EI Headline TTF", "SemiBold", "LGEIHeadlineTTF-Semibold"],
    ["LG EI Headline TTF", "Bold", "LGEIHeadlineTTF-Bold"],
    ["Noto Sans KR", "Regular", "NotoSansKR-Regular"],
    ["Noto Sans KR", "Medium", "NotoSansKR-Medium"],
    ["Noto Sans KR", "Bold", "NotoSansKR-Bold"],
    ["Noto Sans KR", "Black", "NotoSansKR-Black"],
    ["Noto Serif KR", "Regular", "NotoSerifKR-Regular"],
    ["Noto Serif KR", "Medium", "NotoSerifKR-Medium"],
    ["Noto Serif KR", "SemiBold", "NotoSerifKR-SemiBold"],
    ["Noto Serif KR", "Bold", "NotoSerifKR-Bold"],
    ["Noto Serif KR", "Black", "NotoSerifKR-Heavy"],
    ["Noto Sans CJK KR", "Regular", "NotoSansCJKkr-Regular"],
    ["Noto Sans CJK KR", "Medium", "NotoSansCJKkr-Medium"],
    ["Noto Sans CJK KR", "Bold", "NotoSansCJKkr-Bold"],
    ["Noto Serif CJK KR", "Regular", "NotoSerifCJKkr-Regular"],
    ["Noto Sans SC", "Regular", "NotoSansSC-Regular"],
    ["Noto Sans TC", "Regular", "NotoSansTC-Regular"],
    ["Noto Sans JP", "Regular", "NotoSansJP-Regular"]
  ];
  for (const [family, style, postScriptName] of curated) addRecord(map, family, style, postScriptName);
}

function main() {
  const fontFiles = [];
  for (const root of fontRoots()) walkFonts(root, fontFiles);

  const map = new Map();
  addCurated(map);
  for (const filePath of fontFiles) {
    for (const font of parseFonts(filePath)) addFont(map, font);
  }

  const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  const object = Object.fromEntries(sorted);
  process.stdout.write(JSON.stringify(object));
}

main();
