const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const uiPath = path.join(root, "ui.html");
const assetPath = path.join(root, "vendor", "gifenc.esm.js");

const startMarker = "<!-- PIGMA_GIFENC_ASSET_BUNDLE:START -->";
const endMarker = "<!-- PIGMA_GIFENC_ASSET_BUNDLE:END -->";

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

function buildAssetBlock() {
  const buffer = fs.readFileSync(assetPath);
  const contentHash = crypto.createHash("sha256").update(buffer).digest("hex");
  const moduleBase64 = buffer.toString("base64");

  return [
    startMarker,
    "    <script>",
    "      window.__PIGMA_GIFENC_INLINE_ASSETS__ = Object.freeze({",
    `        contentHash: ${JSON.stringify(contentHash)},`,
    `        moduleBase64: ${JSON.stringify(moduleBase64)},`,
    "      });",
    "    </script>",
    `    ${endMarker}`,
  ].join("\n");
}

function main() {
  const uiSource = readUtf8(uiPath);
  if (!uiSource.includes(startMarker) || !uiSource.includes(endMarker)) {
    throw new Error("Could not find GIF encoder asset bundle markers in ui.html.");
  }

  const nextBlock = buildAssetBlock();
  const markerPattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, "m");
  const nextUiSource = uiSource.replace(markerPattern, escapeReplacement(nextBlock));

  if (nextUiSource !== uiSource) {
    writeUtf8(uiPath, nextUiSource);
    console.log("Synced inline GIF encoder assets into ui.html");
    return;
  }

  console.log("Inline GIF encoder assets already up to date");
}

main();
