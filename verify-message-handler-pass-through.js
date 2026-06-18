"use strict";

const fs = require("fs");
const path = require("path");

const root = __dirname;

const defaultFiles = [
  { file: "psd-import-text-fix.js" },
  { file: "psd-export-boundary.js" },
  { file: "psd-shape-layer-export.js" },
  { file: "ai-settings-storage.js" },
  { file: "piger-web-integration.js" },
  { file: "ai-responsive-memory.js" },
  { file: "ai-responsive-pair-analyzer.js" },
  { file: "ai-llm-client.js" },
  { file: "ai-design-read.js", optional: true },
  { file: "ai-accessibility-diagnosis.js" },
  { file: "ai-design-consistency.js" },
  { file: "ai-typo-audit.js" },
  { file: "ai-pixel-perfect.js" },
  { file: "skew-transform.js" },
  { file: "corner-radius-adjust.js" },
  { file: "button-text-auto-size.js" },
  { file: "select-all-text.js" },
  { file: "select-color-matches.js" },
  { file: "text-line-height-adjust.js" },
  { file: "text-style-normalize.js" },
  { file: "unlock-locked-layers.js" },
  { file: "detach-linked-components.js" },
  { file: "auto-layout-off.js" },
  { file: "delete-hidden-layers.js" },
  { file: "clear-frame-guides.js" },
  { file: "split-long-frame.js" },
  { file: "copy-prototype-link.js" },
  { file: "ai-color-extract.js" },
  { file: "ai-image-shared-bridge.js" },
  { file: "original-image-download.js", optional: true },
  { file: "ai-design-chat.js" },
];

const requestedFiles = process.argv.slice(2);
const targets = requestedFiles.length
  ? requestedFiles.map((file) => ({ file }))
  : defaultFiles;

const failures = [];
let checkedCount = 0;
let wrapperCount = 0;

for (const target of targets) {
  const filePath = path.resolve(root, target.file);
  if (!fs.existsSync(filePath)) {
    if (target.optional) {
      continue;
    }
    failures.push(`${target.file}: missing file`);
    continue;
  }

  const source = fs.readFileSync(filePath, "utf8");
  checkedCount += 1;

  if (!source.includes("figma.ui.onmessage")) {
    continue;
  }

  wrapperCount += 1;
  const label = path.relative(root, filePath).replace(/\\/g, "/");
  const assignsHandler = /figma\.ui\.onmessage\s*=/.test(source);
  const capturesPreviousHandler =
    /\b(?:const|let|var)\s+originalOnMessage\s*=\s*figma\.ui\.onmessage\b/.test(source) ||
    /\b(?:const|let|var)\s+originalOnMessage\s*=\s*typeof\s+figma\.ui\.onmessage\s*===\s*["']function["']\s*\?\s*figma\.ui\.onmessage\s*:\s*null\b/.test(source);
  const passesUnknownMessage =
    /return\s+originalOnMessage\s*\(\s*message\s*\)/.test(source) ||
    /return\s+originalOnMessage\s*\(\s*normalize[A-Za-z0-9_$]*\s*\(\s*message\s*\)\s*\)/.test(source) ||
    /if\s*\(\s*typeof\s+originalOnMessage\s*===\s*["']function["']\s*\)\s*\{\s*return\s+originalOnMessage\s*\(\s*message\s*\)\s*;?\s*\}/s.test(source);

  if (!assignsHandler) {
    failures.push(`${label}: references figma.ui.onmessage but does not assign a handler`);
  }

  if (!capturesPreviousHandler) {
    failures.push(`${label}: handler wrapper does not capture originalOnMessage`);
  }

  if (!passesUnknownMessage) {
    failures.push(`${label}: handler wrapper does not pass unknown messages to originalOnMessage(message)`);
  }
}

if (failures.length) {
  console.error("Message handler pass-through verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Verified message handler pass-through in ${wrapperCount} wrapper files (${checkedCount} files checked).`);
