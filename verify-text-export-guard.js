#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = __dirname;
const contractPath = path.join(root, "text-export-guard.contract.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(contractPath)) {
  fail(`Missing text export guard contract: ${contractPath}`);
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
  fail(`Text export guard verification failed for ${fileLabel}\n${details}`);
}

function assertExcludes(content, fileLabel, forbiddenValues, valueLabel) {
  const present = forbiddenValues.filter(value => content.includes(value));
  if (present.length === 0) {
    return;
  }

  const details = present.map(value => `- Forbidden ${valueLabel}: ${value}`).join("\n");
  fail(`Text export guard verification failed for ${fileLabel}\n${details}`);
}

const runtimeContent = readRequiredFile(contract.runtimeFile);
const mainBundleContent = contract.mainBundleFile ? readRequiredFile(contract.mainBundleFile) : "";
const buildScriptContent = readRequiredFile(contract.buildScript);

assertIncludes(runtimeContent, contract.runtimeFile, contract.requiredRuntimeSnippets || [], "runtime snippet");
assertExcludes(runtimeContent, contract.runtimeFile, contract.forbiddenRuntimeSnippets || [], "runtime snippet");
if (contract.mainBundleFile) {
  assertIncludes(mainBundleContent, contract.mainBundleFile, contract.requiredMainBundleSnippets || [], "main bundle snippet");
  assertExcludes(mainBundleContent, contract.mainBundleFile, contract.forbiddenMainBundleSnippets || [], "main bundle snippet");
}
assertIncludes(buildScriptContent, contract.buildScript, contract.requiredBuildSnippets || [], "build snippet");

console.log("Text export guard verified.");
