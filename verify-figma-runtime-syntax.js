"use strict";

const fs = require("fs");
const path = require("path");

const root = __dirname;
const defaultFiles = [
  "psd-import-text-fix.js",
  "psd-export-boundary.js",
  "ai-settings-storage.js",
  "ai-responsive-memory.js",
  "ai-responsive-pair-analyzer.js",
  "ai-llm-client.js",
  "ai-design-assist.js",
  "ai-design-read.js",
  "ai-accessibility-diagnosis.js",
  "ai-design-consistency.js",
  "ai-regroup-rename.js",
  "ai-typo-audit.js",
  "ai-pixel-perfect.js",
  "delete-hidden-layers.js",
  "original-image-download.js",
  "ai-image-upscale.js",
];

const inputFiles = process.argv.slice(2);
const files = (inputFiles.length ? inputFiles : defaultFiles)
  .map((file) => path.resolve(root, file))
  .filter((file, index, list) => list.indexOf(file) === index);

const unsupportedPatterns = [
  {
    name: "object_spread_standalone",
    description: "object spread property (...value)",
    regex: /^\s*\.\.\.[A-Za-z_$][\w$]*(?:\s*,)?\s*$/gm,
  },
  {
    name: "object_spread_inline",
    description: "inline object spread (...value)",
    regex: /\{\s*\.\.\.[A-Za-z_$][\w$]*/g,
  },
  {
    name: "nullish_coalescing",
    description: "nullish coalescing operator (??)",
    regex: /\?\?(?![=?])/g,
  },
  {
    name: "optional_chaining",
    description: "optional chaining operator (?.)",
    regex: /\?\.(?=[A-Za-z_$[(])/g,
  },
];

function stripStringsAndComments(source) {
  const chars = source.split("");
  const output = source.split("");
  let index = 0;
  let state = "normal";
  let templateExpressionDepth = 0;

  function mask(position) {
    if (position < 0 || position >= output.length) {
      return;
    }
    if (output[position] !== "\n" && output[position] !== "\r") {
      output[position] = " ";
    }
  }

  while (index < chars.length) {
    const char = chars[index];
    const next = index + 1 < chars.length ? chars[index + 1] : "";

    if (state === "line_comment") {
      if (char === "\n") {
        state = templateExpressionDepth > 0 ? "normal" : "normal";
      } else {
        mask(index);
      }
      index += 1;
      continue;
    }

    if (state === "block_comment") {
      mask(index);
      if (char === "*" && next === "/") {
        mask(index + 1);
        index += 2;
        state = "normal";
      } else {
        index += 1;
      }
      continue;
    }

    if (state === "single_quote") {
      mask(index);
      if (char === "\\") {
        mask(index + 1);
        index += 2;
        continue;
      }
      if (char === "'") {
        state = "normal";
      }
      index += 1;
      continue;
    }

    if (state === "double_quote") {
      mask(index);
      if (char === "\\") {
        mask(index + 1);
        index += 2;
        continue;
      }
      if (char === "\"") {
        state = "normal";
      }
      index += 1;
      continue;
    }

    if (state === "template") {
      if (char === "$" && next === "{") {
        mask(index);
        mask(index + 1);
        templateExpressionDepth = 1;
        state = "normal";
        index += 2;
        continue;
      }
      mask(index);
      if (char === "\\") {
        mask(index + 1);
        index += 2;
        continue;
      }
      if (char === "`") {
        state = "normal";
      }
      index += 1;
      continue;
    }

    if (char === "/" && next === "/") {
      mask(index);
      mask(index + 1);
      state = "line_comment";
      index += 2;
      continue;
    }

    if (char === "/" && next === "*") {
      mask(index);
      mask(index + 1);
      state = "block_comment";
      index += 2;
      continue;
    }

    if (char === "'") {
      mask(index);
      state = "single_quote";
      index += 1;
      continue;
    }

    if (char === "\"") {
      mask(index);
      state = "double_quote";
      index += 1;
      continue;
    }

    if (char === "`") {
      mask(index);
      state = "template";
      index += 1;
      continue;
    }

    if (templateExpressionDepth > 0) {
      if (char === "{") {
        templateExpressionDepth += 1;
      } else if (char === "}") {
        templateExpressionDepth -= 1;
        if (templateExpressionDepth === 0) {
          state = "template";
          mask(index);
        }
      }
    }

    index += 1;
  }

  return output.join("");
}

function indexToLineColumn(text, index) {
  let line = 1;
  let column = 1;
  for (let i = 0; i < index; i += 1) {
    if (text[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

function readLine(text, lineNumber) {
  const lines = text.split(/\r?\n/);
  return lines[lineNumber - 1] || "";
}

function buildCommentLineMap(source) {
  const lines = source.split(/\r?\n/);
  const map = {};
  let inBlockComment = false;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const lineNumber = lineIndex + 1;
    const line = lines[lineIndex];
    let cursor = 0;

    if (inBlockComment) {
      map[lineNumber] = true;
    }

    while (cursor < line.length) {
      if (inBlockComment) {
        const blockEnd = line.indexOf("*/", cursor);
        map[lineNumber] = true;
        if (blockEnd < 0) {
          cursor = line.length;
          continue;
        }
        inBlockComment = false;
        cursor = blockEnd + 2;
        continue;
      }

      const lineCommentStart = line.indexOf("//", cursor);
      const blockCommentStart = line.indexOf("/*", cursor);

      if (lineCommentStart >= 0 && (blockCommentStart < 0 || lineCommentStart < blockCommentStart)) {
        map[lineNumber] = true;
        break;
      }

      if (blockCommentStart >= 0) {
        map[lineNumber] = true;
        const blockEnd = line.indexOf("*/", blockCommentStart + 2);
        if (blockEnd < 0) {
          inBlockComment = true;
          break;
        }
        cursor = blockEnd + 2;
        continue;
      }

      break;
    }
  }

  return map;
}

let failureCount = 0;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`[figma-runtime-syntax] Missing file: ${file}`);
    failureCount += 1;
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  const codeOnly = stripStringsAndComments(source);
  const commentLineMap = buildCommentLineMap(source);

  for (const pattern of unsupportedPatterns) {
    pattern.regex.lastIndex = 0;
    let match = pattern.regex.exec(codeOnly);
    while (match) {
      const location = indexToLineColumn(codeOnly, match.index);
      if (commentLineMap[location.line]) {
        match = pattern.regex.exec(codeOnly);
        continue;
      }
      const lineText = readLine(source, location.line).trim();
      console.error(
        `[figma-runtime-syntax] ${path.basename(file)}:${location.line}:${location.column} ` +
          `uses unsupported ${pattern.description}: ${lineText}`
      );
      failureCount += 1;
      match = pattern.regex.exec(codeOnly);
    }
  }
}

if (failureCount > 0) {
  process.exit(1);
}

console.log("[figma-runtime-syntax] verified.");
