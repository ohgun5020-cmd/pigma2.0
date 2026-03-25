const fs = require("fs");

const LEGACY_FLAG = "--allow-legacy-embed";
const rawArgs = process.argv.slice(2);
const allowLegacyEmbed = rawArgs.includes(LEGACY_FLAG);
const args = rawArgs.filter((arg) => arg !== LEGACY_FLAG);
const bundlePath = args[0];
const uiPath = args[1];

if (!allowLegacyEmbed) {
  console.error(
    [
      "sync-embedded-ui.js is disabled by default.",
      "This repo now keeps ui.html as the only UI source, and runtime bundles must stay on figma.showUI(__html__, ...).",
      `If you truly need a one-off legacy embed for debugging, rerun with ${LEGACY_FLAG}.`,
    ].join(" ")
  );
  process.exit(1);
}

if (!bundlePath || !uiPath) {
  console.error(`Usage: node sync-embedded-ui.js ${LEGACY_FLAG} <bundle.js> <ui.html>`);
  process.exit(1);
}

const marker = "figma.showUI(";

function encodeForSingleQuotedJsString(text) {
  return (
    "'" +
    text
      .replace(/\r\n?/g, "\n")
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/\n/g, "\\n")
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029") +
    "'"
  );
}

function findFirstArgumentRange(source) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error("Could not find figma.showUI(...) in bundle.");
  }

  let literalStart = markerIndex + marker.length;
  while (literalStart < source.length && /\s/.test(source[literalStart])) {
    literalStart += 1;
  }

  if (source.slice(literalStart, literalStart + "__html__".length) === "__html__") {
    return { start: literalStart, end: literalStart + "__html__".length };
  }

  const quote = source[literalStart];
  if (quote !== "'" && quote !== '"') {
    throw new Error("Expected the first figma.showUI argument to be a string literal or __html__.");
  }

  let literalEnd = literalStart + 1;
  for (; literalEnd < source.length; literalEnd += 1) {
    const ch = source[literalEnd];
    if (ch === "\\") {
      literalEnd += 1;
      continue;
    }
    if (ch === quote) {
      break;
    }
  }

  if (literalEnd >= source.length) {
    throw new Error("Unterminated figma.showUI HTML string literal.");
  }

  return { start: literalStart, end: literalEnd + 1 };
}

const bundle = fs.readFileSync(bundlePath, "utf8");
const uiHtml = fs.readFileSync(uiPath, "utf8");
const range = findFirstArgumentRange(bundle);
const embeddedLiteral = encodeForSingleQuotedJsString(uiHtml);
const nextBundle =
  bundle.slice(0, range.start) +
  embeddedLiteral +
  bundle.slice(range.end);

if (nextBundle !== bundle) {
  fs.writeFileSync(bundlePath, nextBundle, "utf8");
  console.log(`Synced embedded UI from ${uiPath} into ${bundlePath}`);
  console.warn(
    `Legacy embedded UI mode was used for ${bundlePath}. Restore normal runtime behavior with: node externalize-embedded-ui.js ${bundlePath}`
  );
} else {
  console.log(`Embedded UI already matches ${uiPath}`);
}
