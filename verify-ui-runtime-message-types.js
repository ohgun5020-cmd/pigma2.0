"use strict";

const fs = require("fs");
const path = require("path");

const root = __dirname;
const uiFiles = ["ui.html", "ui-ai-correction.js", "ai-design-chat-ui.js", "ai-color-extract-ui.js"];
const runtimeFiles = [
  "code.js",
  "psd-import-text-fix.js",
  "psd-export-boundary.js",
  "psd-shape-layer-export.js",
  "ai-settings-storage.js",
  "pigma-web-integration.js",
  "ai-responsive-memory.js",
  "ai-responsive-pair-analyzer.js",
  "ai-llm-client.js",
  "ai-design-read.js",
  "ai-accessibility-diagnosis.js",
  "ai-design-consistency.js",
  "ai-typo-audit.js",
  "ai-pixel-perfect.js",
  "skew-transform.js",
  "corner-radius-adjust.js",
  "button-text-auto-size.js",
  "select-all-text.js",
  "text-line-height-adjust.js",
  "unlock-locked-layers.js",
  "detach-linked-components.js",
  "auto-layout-off.js",
  "delete-hidden-layers.js",
  "clear-frame-guides.js",
  "split-long-frame.js",
  "copy-prototype-link.js",
  "ai-color-extract.js",
  "ai-image-upscale.js",
  "original-image-download.js",
  "ai-design-chat.js",
];

const coreRuntimeMessageTypes = [
  "close-plugin",
  "request-export",
  "request-next-export-root",
  "request-import",
  "request-import-batch",
  "request-svg-import",
  "request-svg-import-batch",
  "request-export-cancel",
  "request-runtime-cache-refresh",
  "request-selection-sync",
  "update-preferences",
];

const knownFactorySentTypes = [
  "request-import",
  "request-import-batch",
  "request-svg-import",
  "request-svg-import-batch",
];

const sendCallNames = [
  "postPluginMessage",
  "postToPlugin",
  "qn",
  "parent.postMessage",
  "shared.postPluginMessage",
  "env.postPluginMessage",
];

const sentPropertyNames = [
  "runMessage",
  "previewMessage",
];

const sentTypes = new Map();
const handledTypes = new Map();

for (const type of coreRuntimeMessageTypes) {
  addType(handledTypes, type, "core-runtime");
}

for (const type of knownFactorySentTypes) {
  addType(sentTypes, type, "known import factory");
}

for (const file of uiFiles) {
  const source = readOptional(file);
  if (!source) {
    continue;
  }
  collectSentTypesFromCalls(source, file);
  collectSentTypesFromMessageProperties(source, file);
}

for (const file of runtimeFiles) {
  const source = readOptional(file);
  if (!source) {
    continue;
  }
  collectHandledTypes(source, file);
}

const missing = [];
for (const [type, locations] of Array.from(sentTypes.entries()).sort(compareEntries)) {
  if (!handledTypes.has(type)) {
    missing.push({ type, locations });
  }
}

if (missing.length) {
  console.error("UI-to-runtime message type verification failed:");
  for (const item of missing) {
    console.error(`- ${item.type}`);
    for (const location of item.locations.slice(0, 5)) {
      console.error(`  ${location}`);
    }
  }
  process.exit(1);
}

console.log(
  `Verified ${sentTypes.size} UI-to-runtime message types against ${handledTypes.size} runtime-handled types.`
);

function readOptional(file) {
  const filePath = path.resolve(root, file);
  if (!fs.existsSync(filePath)) {
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

function collectSentTypesFromCalls(source, file) {
  for (const callName of sendCallNames) {
    let index = 0;
    while (index < source.length) {
      const found = source.indexOf(callName, index);
      if (found < 0) {
        break;
      }
      const open = source.indexOf("(", found + callName.length);
      if (open < 0) {
        break;
      }
      const close = findMatchingParen(source, open);
      if (close < 0) {
        index = open + 1;
        continue;
      }
      const callText = source.slice(open + 1, close);
      collectTypeProperties(callText, sentTypes, file, source, found);
      index = close + 1;
    }
  }
}

function collectSentTypesFromMessageProperties(source, file) {
  for (const propertyName of sentPropertyNames) {
    const regex = new RegExp("\\b" + propertyName + "\\s*:\\s*\\{", "g");
    let match;
    while ((match = regex.exec(source))) {
      const open = source.indexOf("{", match.index);
      const close = findMatchingBrace(source, open);
      if (close < 0) {
        continue;
      }
      collectTypeProperties(source.slice(open + 1, close), sentTypes, file, source, match.index);
    }
  }
}

function collectHandledTypes(source, file) {
  collectWithRegex(source, file, /\bmessage\.type\s*===\s*["']([^"']+)["']/g, handledTypes);
  collectWithRegex(source, file, /\btype\s*===\s*["']([^"']+)["']/g, handledTypes);
  collectWithRegex(source, file, /\brequest[A-Za-z0-9_$]*\s*:\s*["']([^"']+)["']/g, handledTypes);
  collectWithRegex(source, file, /\brun[A-Za-z0-9_$]*\s*:\s*["']([^"']+)["']/g, handledTypes);
  collectWithRegex(source, file, /\bapply[A-Za-z0-9_$]*\s*:\s*["']([^"']+)["']/g, handledTypes);
}

function collectTypeProperties(source, target, file, fullSource, offset) {
  const regex = /\btype\s*:\s*["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(source))) {
    addType(target, match[1], formatLocation(file, fullSource, offset + match.index));
  }
}

function collectWithRegex(source, file, regex, target) {
  let match;
  while ((match = regex.exec(source))) {
    addType(target, match[1], formatLocation(file, source, match.index));
  }
}

function addType(map, type, location) {
  if (!type || typeof type !== "string") {
    return;
  }
  const normalized = type.trim();
  if (!normalized) {
    return;
  }
  if (!map.has(normalized)) {
    map.set(normalized, []);
  }
  map.get(normalized).push(location);
}

function findMatchingParen(source, openIndex) {
  return findMatchingToken(source, openIndex, "(", ")");
}

function findMatchingBrace(source, openIndex) {
  return findMatchingToken(source, openIndex, "{", "}");
}

function findMatchingToken(source, openIndex, openToken, closeToken) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = openIndex; index < source.length; index += 1) {
    const ch = source[index];
    const next = index + 1 < source.length ? source[index + 1] : "";

    if (lineComment) {
      if (ch === "\n") {
        lineComment = false;
      }
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        quote = "";
      }
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (ch === "\"" || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === openToken) {
      depth += 1;
      continue;
    }

    if (ch === closeToken) {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

function formatLocation(file, source, index) {
  const line = source.slice(0, index).split(/\r?\n/).length;
  return `${file}:${line}`;
}

function compareEntries(left, right) {
  return left[0].localeCompare(right[0]);
}
