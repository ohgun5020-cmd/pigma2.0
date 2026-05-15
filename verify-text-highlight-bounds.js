#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = __dirname;
const contractPath = path.join(root, "text-highlight-bounds.contract.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readRequiredFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function assertIncludes(content, fileLabel, expectedValues, valueLabel) {
  const missing = expectedValues.filter((value) => !content.includes(value));
  if (missing.length === 0) {
    return;
  }

  const details = missing.map((value) => `- Missing ${valueLabel}: ${value}`).join("\n");
  fail(`Text highlight bounds verification failed for ${fileLabel}\n${details}`);
}

function assertExcludes(content, fileLabel, forbiddenValues) {
  const present = forbiddenValues.filter((value) => content.includes(value));
  if (present.length === 0) {
    return;
  }

  const details = present.map((value) => `- Forbidden snippet still present: ${value}`).join("\n");
  fail(`Text highlight bounds verification failed for ${fileLabel}\n${details}`);
}

function assertOrdered(content, fileLabel, orderedGroups) {
  for (const group of orderedGroups) {
    let cursor = -1;
    for (const snippet of group) {
      const index = content.indexOf(snippet, cursor + 1);
      if (index < 0) {
        fail(`Text highlight bounds verification failed for ${fileLabel}\n- Ordered snippet missing: ${snippet}`);
      }
      if (index <= cursor) {
        fail(`Text highlight bounds verification failed for ${fileLabel}\n- Ordered snippet moved before expected point: ${snippet}`);
      }
      cursor = index;
    }
  }
}

if (!fs.existsSync(contractPath)) {
  fail(`Missing text highlight bounds contract: ${contractPath}`);
}

const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const sourceContent = readRequiredFile(contract.sourceFile);
const uiContent = contract.uiFile ? readRequiredFile(contract.uiFile) : "";
const bundleContent = readRequiredFile(contract.bundleFile);
const buildScriptContent = readRequiredFile(contract.buildScript);
const functionSnippets = (contract.requiredFunctions || []).map((name) => `function ${name}(`);

for (const fileEntry of [
  { label: contract.sourceFile, content: sourceContent },
  { label: contract.bundleFile, content: bundleContent },
]) {
  assertIncludes(fileEntry.content, fileEntry.label, functionSnippets, "function");
  assertIncludes(fileEntry.content, fileEntry.label, contract.requiredSnippets || [], "snippet");
  assertExcludes(fileEntry.content, fileEntry.label, contract.forbiddenSnippets || []);
  assertOrdered(fileEntry.content, fileEntry.label, contract.requiredOrderedSnippets || []);
}

if (contract.uiFile) {
  assertIncludes(uiContent, contract.uiFile, contract.requiredUiSnippets || [], "UI snippet");
}

assertIncludes(buildScriptContent, contract.buildScript, contract.requiredBuildSnippets || [], "build hook");

console.log("Text highlight bounds verified.");
