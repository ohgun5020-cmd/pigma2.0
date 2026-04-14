const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const uiPath = path.join(root, "ui.html");
const pakoPath = path.join(root, "vendor", "pako.min.js");
const upngPath = path.join(root, "vendor", "upng.js");

const startMarker = "<!-- PIGMA_APNG_ASSET_BUNDLE:START -->";
const endMarker = "<!-- PIGMA_APNG_ASSET_BUNDLE:END -->";

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

function escapeInlineScript(value) {
  return value.replace(/<\/script/gi, "<\\/script");
}

function buildAssetBlock() {
  const pakoBuffer = fs.readFileSync(pakoPath);
  const upngBuffer = fs.readFileSync(upngPath);

  return [
    startMarker,
    "    <script>",
    "      window.__PIGMA_APNG_INLINE_ASSETS__ = Object.freeze({",
    `        pakoHash: ${JSON.stringify(crypto.createHash("sha256").update(pakoBuffer).digest("hex"))},`,
    `        upngHash: ${JSON.stringify(crypto.createHash("sha256").update(upngBuffer).digest("hex"))},`,
    `        pakoBase64: ${JSON.stringify(pakoBuffer.toString("base64"))},`,
    `        upngBase64: ${JSON.stringify(upngBuffer.toString("base64"))},`,
    "      });",
    "    </script>",
    "    <script>",
    escapeInlineScript(pakoBuffer.toString("utf8")),
    "    </script>",
    "    <script>",
    escapeInlineScript(upngBuffer.toString("utf8")),
    "    </script>",
    `    ${endMarker}`,
  ].join("\n");
}

function main() {
  const uiSource = readUtf8(uiPath);
  if (!uiSource.includes(startMarker) || !uiSource.includes(endMarker)) {
    throw new Error("Could not find APNG asset bundle markers in ui.html.");
  }

  const nextBlock = buildAssetBlock();
  const markerPattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, "m");
  const nextUiSource = uiSource.replace(markerPattern, escapeReplacement(nextBlock));

  if (nextUiSource !== uiSource) {
    writeUtf8(uiPath, nextUiSource);
    console.log("Synced inline APNG assets into ui.html");
    return;
  }

  console.log("Inline APNG assets already up to date");
}

main();
