const fs = require("fs");
const path = require("path");

const root = __dirname;
const uiPath = path.join(root, "ui.html");
const sourcePath = path.join(root, "presentation-import.js");

const startMarker = "<!-- PIGMA_PRESENTATION_IMPORT_RUNTIME:START -->";
const endMarker = "<!-- PIGMA_PRESENTATION_IMPORT_RUNTIME:END -->";
const legacyScriptTag = '    <script src="presentation-import.js"></script>';

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeUtf8(filePath, content) {
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, content, "utf8");
  fs.copyFileSync(tempPath, filePath);
  fs.unlinkSync(tempPath);
}

function escapeReplacement(value) {
  return value.replace(/\$/g, "$$$$");
}

function buildRuntimeBlock(source) {
  return [
    startMarker,
    "    <script>",
    source.trimEnd(),
    "    </script>",
    `    ${endMarker}`,
  ].join("\n");
}

function main() {
  const uiSource = readUtf8(uiPath);
  const runtimeSource = readUtf8(sourcePath);
  const nextBlock = buildRuntimeBlock(runtimeSource);

  let nextUiSource = uiSource;
  if (uiSource.includes(startMarker) && uiSource.includes(endMarker)) {
    const markerPattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, "m");
    nextUiSource = uiSource.replace(markerPattern, escapeReplacement(nextBlock));
  } else if (uiSource.includes(legacyScriptTag)) {
    nextUiSource = uiSource.replace(legacyScriptTag, nextBlock);
  } else {
    throw new Error("Could not find the presentation import runtime markers or legacy script tag in ui.html.");
  }

  if (nextUiSource !== uiSource) {
    writeUtf8(uiPath, nextUiSource);
    console.log("Synced inline presentation import runtime into ui.html");
    return;
  }

  console.log("Inline presentation import runtime already up to date");
}

main();
