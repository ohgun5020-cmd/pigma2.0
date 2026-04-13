const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const uiPath = path.join(root, "ui.html");
const assetSpecs = [
  {
    key: "moduleBase64",
    filePath: path.join(root, "vendor", "pdfjs", "legacy", "build", "pdf.mjs"),
  },
  {
    key: "workerBase64",
    filePath: path.join(root, "vendor", "pdfjs", "legacy", "build", "pdf.worker.mjs"),
  },
];
const directoryAssetSpecs = [
  {
    key: "cMapAssets",
    dirPath: path.join(root, "vendor", "pdfjs", "cmaps"),
  },
  {
    key: "standardFontAssets",
    dirPath: path.join(root, "vendor", "pdfjs", "standard_fonts"),
  },
];

const startMarker = "<!-- PIGMA_PDFJS_ASSET_BUNDLE:START -->";
const endMarker = "<!-- PIGMA_PDFJS_ASSET_BUNDLE:END -->";

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

function readDirectoryBase64Map(dirPath) {
  const entries = {};
  const names = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  for (const name of names) {
    const filePath = path.join(dirPath, name);
    entries[name] = fs.readFileSync(filePath).toString("base64");
  }

  return entries;
}

function buildAssetBlock() {
  const payload = {};
  const hash = crypto.createHash("sha256");

  for (const spec of assetSpecs) {
    const buffer = fs.readFileSync(spec.filePath);
    payload[spec.key] = buffer.toString("base64");
    hash.update(buffer);
  }

  for (const spec of directoryAssetSpecs) {
    const entryMap = readDirectoryBase64Map(spec.dirPath);
    payload[spec.key] = entryMap;
    for (const [name, base64Value] of Object.entries(entryMap)) {
      hash.update(name);
      hash.update(base64Value);
    }
  }

  const contentHash = hash.digest("hex");
  return [
    startMarker,
    "    <script>",
    "      window.__PIGMA_PDFJS_INLINE_ASSETS__ = Object.freeze({",
    `        contentHash: ${JSON.stringify(contentHash)},`,
    `        moduleBase64: ${JSON.stringify(payload.moduleBase64)},`,
    `        workerBase64: ${JSON.stringify(payload.workerBase64)},`,
    `        cMapAssets: Object.freeze(${JSON.stringify(payload.cMapAssets)}),`,
    `        standardFontAssets: Object.freeze(${JSON.stringify(payload.standardFontAssets)}),`,
    "      });",
    "    </script>",
    `    ${endMarker}`,
  ].join("\n");
}

function main() {
  const uiSource = readUtf8(uiPath);
  if (!uiSource.includes(startMarker) || !uiSource.includes(endMarker)) {
    throw new Error("Could not find PDF.js asset bundle markers in ui.html.");
  }

  const nextBlock = buildAssetBlock();
  const markerPattern = new RegExp(
    `${startMarker}[\\s\\S]*?${endMarker}`,
    "m"
  );
  const nextUiSource = uiSource.replace(markerPattern, escapeReplacement(nextBlock));

  if (nextUiSource !== uiSource) {
    writeUtf8(uiPath, nextUiSource);
    console.log("Synced inline PDF.js assets into ui.html");
    return;
  }

  console.log("Inline PDF.js assets already up to date");
}

main();
