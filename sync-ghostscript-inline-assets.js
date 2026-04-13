const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const uiPath = path.join(root, "ui.html");
const assetSpecs = [
  {
    key: "moduleBase64",
    filePath: path.join(root, "vendor", "ghostpdl", "gs.js"),
  },
  {
    key: "wasmBase64",
    filePath: path.join(root, "vendor", "ghostpdl", "gs.wasm"),
  },
];

const startMarker = "<!-- PIGMA_GHOSTSCRIPT_ASSET_BUNDLE:START -->";
const endMarker = "<!-- PIGMA_GHOSTSCRIPT_ASSET_BUNDLE:END -->";

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeUtf8(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function escapeReplacement(value) {
  return value.replace(/\$/g, "$$$$");
}

function buildAssetBlock() {
  const payload = {};
  const hash = crypto.createHash("sha256");

  for (const spec of assetSpecs) {
    const buffer = fs.readFileSync(spec.filePath);
    payload[spec.key] = buffer.toString("base64");
    hash.update(buffer);
  }

  const contentHash = hash.digest("hex");
  return [
    startMarker,
    "    <script>",
    "      window.__PIGMA_GHOSTSCRIPT_INLINE_ASSETS__ = Object.freeze({",
    `        contentHash: ${JSON.stringify(contentHash)},`,
    `        moduleBase64: ${JSON.stringify(payload.moduleBase64)},`,
    `        wasmBase64: ${JSON.stringify(payload.wasmBase64)},`,
    "      });",
    "    </script>",
    `    ${endMarker}`,
  ].join("\n");
}

function main() {
  const uiSource = readUtf8(uiPath);
  if (!uiSource.includes(startMarker) || !uiSource.includes(endMarker)) {
    throw new Error("Could not find Ghostscript asset bundle markers in ui.html.");
  }

  const nextBlock = buildAssetBlock();
  const markerPattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, "m");
  const nextUiSource = uiSource.replace(markerPattern, escapeReplacement(nextBlock));

  if (nextUiSource !== uiSource) {
    writeUtf8(uiPath, nextUiSource);
    console.log("Synced inline Ghostscript assets into ui.html");
    return;
  }

  console.log("Inline Ghostscript assets already up to date");
}

main();
