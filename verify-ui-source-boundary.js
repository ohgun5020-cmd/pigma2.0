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
verifyTabWatcherBoundary();

if (failures.length) {
  console.error("UI source boundary verification failed:");
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log(
  `Verified UI source boundary: ${inlineScriptCount} inline scripts, ${externalScriptCount} external UI scripts, ${mirrorFile} kept as mirror.`
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

function verifyTabWatcherBoundary() {
  const assignmentMatches = uiSource.match(/window\.__PIGMA_AI_CORRECTION_TAB_WATCHER__\s*=\s*\{/g) || [];
  if (assignmentMatches.length !== 1) {
    fail(`${uiFile} should define window.__PIGMA_AI_CORRECTION_TAB_WATCHER__ exactly once; found ${assignmentMatches.length}.`);
  }

  if (uiSource.indexOf("subscribe: (callback)") < 0) {
    fail(`${uiFile} shared AI correction tab watcher must expose subscribe(callback).`);
  }
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
