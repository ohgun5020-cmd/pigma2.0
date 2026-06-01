#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = __dirname;
const contractPath = path.join(root, "psd-export-boundary.contract.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(contractPath)) {
  fail(`Missing PSD export boundary contract: ${contractPath}`);
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
  fail(`PSD export boundary verification failed for ${fileLabel}\n${details}`);
}

function assertExcludes(content, fileLabel, forbiddenValues, valueLabel) {
  const present = forbiddenValues.filter(value => content.includes(value));
  if (present.length === 0) {
    return;
  }

  const details = present.map(value => `- Forbidden ${valueLabel}: ${value}`).join("\n");
  fail(`PSD export boundary verification failed for ${fileLabel}\n${details}`);
}

const sourceContent = readRequiredFile(contract.sourceFile);
const bundleContent = readRequiredFile(contract.bundleFile);
const runtimeContent = contract.runtimeFile ? readRequiredFile(contract.runtimeFile) : "";
const buildScriptContent = readRequiredFile(contract.buildScript);

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
assertIncludes(bundleContent, contract.bundleFile, contract.requiredBundleSnippets || [], "bundle snippet");
assertExcludes(bundleContent, contract.bundleFile, contract.forbiddenBundleSnippets || [], "bundle snippet");
if (contract.runtimeFile) {
  assertIncludes(runtimeContent, contract.runtimeFile, contract.requiredRuntimeSnippets || [], "runtime snippet");
  assertExcludes(runtimeContent, contract.runtimeFile, contract.forbiddenRuntimeSnippets || [], "runtime snippet");
}
assertIncludes(buildScriptContent, contract.buildScript, [contract.sourceFile], "patch reference");
assertIncludes(buildScriptContent, contract.buildScript, ["verify-psd-export-boundary.js"], "verifier hook");
assertIncludes(buildScriptContent, contract.buildScript, contract.requiredBuildSnippets || [], "build snippet");

console.log("PSD export boundary verified.");
