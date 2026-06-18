#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = __dirname;
const contractPath = path.join(root, "psd-shape-layer-export.contract.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(contractPath)) {
  fail(`Missing PSD shape layer export contract: ${contractPath}`);
}

const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));

function readRequiredFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function assertIncludes(content, fileLabel, expectedValues, valueLabel) {
  const missing = expectedValues.filter(value => !content.includes(value));
  if (missing.length === 0) {
    return;
  }

  const details = missing.map(value => `- Missing ${valueLabel}: ${value}`).join("\n");
  fail(`PSD shape layer export verification failed for ${fileLabel}\n${details}`);
}

function assertExcludes(content, fileLabel, forbiddenValues, valueLabel) {
  const present = forbiddenValues.filter(value => content.includes(value));
  if (present.length === 0) {
    return;
  }

  const details = present.map(value => `- Forbidden ${valueLabel}: ${value}`).join("\n");
  fail(`PSD shape layer export verification failed for ${fileLabel}\n${details}`);
}

const sourceContent = readRequiredFile(contract.sourceFile);
const bundleContent = readRequiredFile(contract.bundleFile);
const buildScriptContent = readRequiredFile(contract.buildScript);
const baseContent = contract.baseFile ? readRequiredFile(contract.baseFile) : "";
const uiContent = contract.uiFile ? readRequiredFile(contract.uiFile) : "";

assertIncludes(sourceContent, contract.sourceFile, contract.requiredMarkers, "marker");
assertIncludes(bundleContent, contract.bundleFile, contract.requiredMarkers, "marker");
assertIncludes(
  sourceContent,
  contract.sourceFile,
  contract.requiredFunctions.map(name => `function ${name}(`),
  "function"
);
assertIncludes(
  bundleContent,
  contract.bundleFile,
  contract.requiredFunctions.map(name => `function ${name}(`),
  "function"
);
assertIncludes(sourceContent, contract.sourceFile, contract.requiredSnippets || [], "snippet");
assertIncludes(bundleContent, contract.bundleFile, contract.requiredSnippets || [], "snippet");
if (contract.baseFile) {
  assertIncludes(baseContent, contract.baseFile, contract.requiredBaseSnippets || [], "base snippet");
  assertIncludes(bundleContent, contract.bundleFile, contract.requiredBaseSnippets || [], "base snippet");
}
assertIncludes(bundleContent, contract.bundleFile, contract.requiredBundleSnippets || [], "bundle snippet");
assertIncludes(buildScriptContent, contract.buildScript, contract.requiredBuildSnippets || [], "build snippet");
assertIncludes(uiContent, contract.uiFile || "ui", contract.requiredUiSnippets || [], "UI snippet");
assertExcludes(uiContent, contract.uiFile || "ui", contract.forbiddenUiSnippets || [], "UI snippet");
assertIncludes(buildScriptContent, contract.buildScript, [contract.sourceFile], "patch reference");
assertIncludes(buildScriptContent, contract.buildScript, ["verify-psd-shape-layer-export.js"], "verifier hook");

const exportBoundaryIndex = bundleContent.indexOf("PIGER_EXPORT_BOUNDARY::SOURCE_OF_TRUTH");
const shapeLayerExportIndex = bundleContent.indexOf("PIGER_PSD_SHAPE_LAYER_EXPORT::SOURCE_OF_TRUTH");

if (exportBoundaryIndex !== -1 && shapeLayerExportIndex !== -1 && shapeLayerExportIndex < exportBoundaryIndex) {
  fail("PSD shape layer export patch must be appended after PSD export boundary patch.");
}

console.log("PSD shape layer export verified.");
