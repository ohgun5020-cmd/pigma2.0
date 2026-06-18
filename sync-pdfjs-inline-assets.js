const fs = require("fs");
const path = require("path");

const root = __dirname;
const uiPath = path.join(root, "ui.html");
const startMarker = "<!-- PIGER_PDFJS_ASSET_BUNDLE:START -->";
const endMarker = "<!-- PIGER_PDFJS_ASSET_BUNDLE:END -->";

function main() {
  const uiSource = fs.readFileSync(uiPath, "utf8");
  const startIndex = uiSource.indexOf(startMarker);
  const endIndex = uiSource.indexOf(endMarker);

  if (startIndex === -1 && endIndex === -1) {
    console.log("PDF.js inline asset bundle is already absent");
    return;
  }

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error("Found an incomplete PDF.js inline asset bundle marker pair in ui.html.");
  }

  const afterEndIndex = endIndex + endMarker.length;
  const trailingNewlineMatch = uiSource.slice(afterEndIndex).match(/^[\t ]*\r?\n/);
  const removeEndIndex = afterEndIndex + (trailingNewlineMatch ? trailingNewlineMatch[0].length : 0);
  const nextUiSource = `${uiSource.slice(0, startIndex)}${uiSource.slice(removeEndIndex)}`;

  fs.writeFileSync(uiPath, nextUiSource, "utf8");
  console.log("Removed PDF.js inline asset bundle from ui.html");
}

main();
