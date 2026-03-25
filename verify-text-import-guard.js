#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = __dirname;
const contractPath = path.join(root, "text-import-guard.contract.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(contractPath)) {
  fail(`Missing text import guard contract: ${contractPath}`);
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
  fail(`Text import guard verification failed for ${fileLabel}\n${details}`);
}

const sourceContent = readRequiredFile(contract.sourceFile);
const bundleContent = readRequiredFile(contract.bundleFile);
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
assertIncludes(buildScriptContent, contract.buildScript, [contract.sourceFile], "patch reference");
assertIncludes(buildScriptContent, contract.buildScript, ["verify-text-import-guard.js"], "verifier hook");

console.log("Text import guard verified.");
