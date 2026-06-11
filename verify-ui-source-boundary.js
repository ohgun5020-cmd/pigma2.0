"use strict";

const fs = require("fs");
const path = require("path");

const root = __dirname;
const uiFile = "ui.html";
const mirrorFile = "ui-ai-correction.js";
const manifestFile = "manifest.json";
const allowedUiScriptSrcs = new Set([
  "ai-design-chat-ui.js",
  "ai-color-extract-ui.js",
]);

const failures = [];
const uiSource = readRequired(uiFile);
const mirrorSource = readRequired(mirrorFile);
const manifest = readJsonRequired(manifestFile);
const tabObserverStats = {
  uiShared: 0,
  uiFallback: 0,
  mirrorFallback: 0,
};

if (manifest.ui !== uiFile) {
  fail(`manifest.json must keep "${uiFile}" as the live UI source, found "${manifest.ui || ""}".`);
}

verifyMirrorBoundary();

const scriptTags = collectScriptTags(uiSource);
let inlineScriptCount = 0;
let externalScriptCount = 0;

for (const tag of scriptTags) {
  const attrs = tag.attrs || "";
  const src = getAttribute(attrs, "src");
  if (src) {
    externalScriptCount += 1;
    verifyExternalScript(src, tag.startLine);
    continue;
  }

  const type = getScriptType(attrs);
  if (!isJavaScriptType(type)) {
    continue;
  }

  if (type === "module") {
    fail(`${uiFile}:${tag.startLine} uses type="module"; this UI parse guard expects classic inline scripts.`);
    continue;
  }

  inlineScriptCount += 1;
  verifyClassicScript(tag.body, `${uiFile}:${tag.startLine}`);
}

verifyClassicScript(mirrorSource, mirrorFile);
verifyTabWatcherBoundary(scriptTags);

if (failures.length) {
  console.error("UI source boundary verification failed:");
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log(
  `Verified UI source boundary: ${inlineScriptCount} inline scripts, ${externalScriptCount} external UI scripts, ${tabObserverStats.uiShared} shared tab watcher, ${tabObserverStats.uiFallback} UI tab fallback observers, ${tabObserverStats.mirrorFallback} mirror tab fallback observers.`
);

function readRequired(file) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    fail(`Missing required file: ${file}`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

function readJsonRequired(file) {
  const source = readRequired(file);
  if (!source) {
    return {};
  }
  try {
    return JSON.parse(source);
  } catch (error) {
    fail(`Could not parse ${file}: ${formatError(error)}`);
    return {};
  }
}

function collectScriptTags(source) {
  const tags = [];
  const regex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(source))) {
    tags.push({
      attrs: match[1] || "",
      body: match[2] || "",
      startLine: lineNumberAt(source, match.index),
    });
  }
  return tags;
}

function getAttribute(attrs, name) {
  const regex = new RegExp(
    "\\b" + name + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))",
    "i"
  );
  const match = regex.exec(attrs || "");
  return match ? (match[1] || match[2] || match[3] || "").trim() : "";
}

function getScriptType(attrs) {
  return getAttribute(attrs, "type").toLowerCase();
}

function isJavaScriptType(type) {
  if (!type) {
    return true;
  }
  return (
    type === "text/javascript" ||
    type === "application/javascript" ||
    type === "application/ecmascript" ||
    type === "text/ecmascript" ||
    type === "module"
  );
}

function verifyExternalScript(src, line) {
  const normalized = normalizeScriptSrc(src);
  if (/^[a-z][a-z0-9+.-]*:/i.test(normalized)) {
    fail(`${uiFile}:${line} must not load remote or protocol script src "${src}".`);
    return;
  }

  if (normalized === mirrorFile) {
    fail(`${uiFile}:${line} must not load ${mirrorFile}; it is a reference mirror, not a live controller.`);
    return;
  }

  if (!allowedUiScriptSrcs.has(normalized)) {
    fail(`${uiFile}:${line} has unexpected script src "${src}". Add it to the verifier only after confirming the UI source boundary.`);
    return;
  }

  const source = readRequired(normalized);
  if (source) {
    verifyClassicScript(source, normalized);
  }
}

function normalizeScriptSrc(src) {
  return String(src || "")
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .trim();
}

function verifyClassicScript(source, label) {
  try {
    new Function(source);
  } catch (error) {
    fail(`${label} does not parse as a classic script: ${formatError(error)}`);
  }
}

function verifyMirrorBoundary() {
  if (uiSource.indexOf(`src="${mirrorFile}"`) >= 0 || uiSource.indexOf(`src='${mirrorFile}'`) >= 0) {
    fail(`${uiFile} must not directly load ${mirrorFile}.`);
  }

  const requiredMarkers = [
    "PIGMA_DEAD_UI_BLOCK",
    "Runtime source of truth currently lives in ui.html",
  ];

  for (const marker of requiredMarkers) {
    if (mirrorSource.indexOf(marker) < 0) {
      fail(`${mirrorFile} is missing mirror/source-boundary marker: ${marker}`);
    }
  }
}

function verifyTabWatcherBoundary(scriptTags) {
  const assignmentMatches = uiSource.match(/window\.__PIGMA_AI_CORRECTION_TAB_WATCHER__\s*=\s*\{/g) || [];
  if (assignmentMatches.length !== 1) {
    fail(`${uiFile} should define window.__PIGMA_AI_CORRECTION_TAB_WATCHER__ exactly once; found ${assignmentMatches.length}.`);
  }

  if (uiSource.indexOf("subscribe: (callback)") < 0) {
    fail(`${uiFile} shared AI correction tab watcher must expose subscribe(callback).`);
  }

  const uiStats = verifyTabAttributeObservers(
    uiFile,
    scriptTags
      .filter((tag) => !getAttribute(tag.attrs || "", "src") && isJavaScriptType(getScriptType(tag.attrs || "")))
      .map((tag) => ({ body: tag.body, startLine: tag.startLine })),
    true
  );
  const mirrorStats = verifyTabAttributeObservers(
    mirrorFile,
    [{ body: mirrorSource, startLine: 1 }],
    false
  );

  tabObserverStats.uiShared = uiStats.shared;
  tabObserverStats.uiFallback = uiStats.fallback;
  tabObserverStats.mirrorFallback = mirrorStats.fallback;

  if (uiStats.shared !== 1) {
    fail(`${uiFile} should have exactly one active shared data-ai-correction-tab observer; found ${uiStats.shared}.`);
  }
}

function verifyTabAttributeObservers(file, scripts, allowSharedDefinition) {
  const stats = {
    shared: 0,
    fallback: 0,
  };
  const filterRegex = /attributeFilter\s*:\s*\[\s*["']data-ai-correction-tab["']\s*\]/g;

  for (const script of scripts) {
    const activeSource = stripJavaScriptComments(script.body || "");
    let match;
    while ((match = filterRegex.exec(activeSource))) {
      if (isInsideDeadUiBlock(script.body || "", match.index)) {
        continue;
      }

      const line = script.startLine + lineNumberAt(activeSource, match.index) - 1;
      const before = activeSource.slice(Math.max(0, match.index - 1000), match.index);
      const after = activeSource.slice(match.index, Math.min(activeSource.length, match.index + 800));
      const scriptHasSharedDefinition =
        allowSharedDefinition &&
        activeSource.indexOf("const callbacks = new Set()") >= 0 &&
        activeSource.indexOf("window.__PIGMA_AI_CORRECTION_TAB_WATCHER__ = {") >= 0;
      const isFallbackObserver =
        before.indexOf("window.__PIGMA_AI_CORRECTION_TAB_WATCHER__") >= 0 &&
        before.indexOf(".subscribe") >= 0 &&
        before.indexOf("} else {") >= 0;

      if (scriptHasSharedDefinition) {
        stats.shared += 1;
        continue;
      }

      if (isFallbackObserver) {
        stats.fallback += 1;
        continue;
      }

      fail(
        `${file}:${line} observes data-ai-correction-tab outside the shared watcher/fallback path. Route active refreshes through window.__PIGMA_AI_CORRECTION_TAB_WATCHER__.subscribe(...).`
      );

      if (after.indexOf("rootObserver.observe") < 0 && before.indexOf("rootObserver.observe") < 0) {
        fail(`${file}:${line} has a data-ai-correction-tab attributeFilter without a nearby observer.observe call.`);
      }
    }
  }

  return stats;
}

function isInsideDeadUiBlock(source, index) {
  const marker = source.lastIndexOf("PIGMA_DEAD_UI_BLOCK", index);
  if (marker < 0) {
    return false;
  }

  const commentStart = source.lastIndexOf("/*", marker);
  if (commentStart < 0 || commentStart > index) {
    return false;
  }

  const commentEnd = source.indexOf("*/", commentStart + 2);
  return commentEnd < 0 || commentEnd > index;
}

function stripJavaScriptComments(source) {
  let result = "";
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1] || "";

    if (lineComment) {
      if (char === "\n") {
        lineComment = false;
        result += char;
      } else {
        result += " ";
      }
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        result += "  ";
        index += 1;
        blockComment = false;
      } else {
        result += char === "\n" ? "\n" : " ";
      }
      continue;
    }

    if (quote) {
      result += char;
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) {
        quote = "";
      }
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      result += char;
      continue;
    }

    if (char === "/" && next === "/") {
      result += "  ";
      index += 1;
      lineComment = true;
      continue;
    }

    if (char === "/" && next === "*") {
      result += "  ";
      index += 1;
      blockComment = true;
      continue;
    }

    result += char;
  }

  return result;
}

function lineNumberAt(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source.charCodeAt(i) === 10) {
      line += 1;
    }
  }
  return line;
}

function formatError(error) {
  return error && error.message ? error.message : String(error);
}

function fail(message) {
  failures.push(message);
}
