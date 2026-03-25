const fs = require("fs");

const bundlePath = process.argv[2];

if (!bundlePath) {
  console.error("Usage: node externalize-embedded-ui.js <bundle.js>");
  process.exit(1);
}

const marker = "figma.showUI(";

function findFirstArgumentRange(source) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error("Could not find figma.showUI(...) in bundle.");
  }

  let start = markerIndex + marker.length;
  while (start < source.length && /\s/.test(source[start])) {
    start += 1;
  }

  if (source.slice(start, start + "__html__".length) === "__html__") {
    return { start, end: start + "__html__".length, alreadyExternal: true };
  }

  const quote = source[start];
  if (quote !== "'" && quote !== '"') {
    throw new Error("Expected the first figma.showUI argument to be a string literal or __html__.");
  }

  let end = start + 1;
  for (; end < source.length; end += 1) {
    const ch = source[end];
    if (ch === "\\") {
      end += 1;
      continue;
    }
    if (ch === quote) {
      break;
    }
  }

  if (end >= source.length) {
    throw new Error("Unterminated figma.showUI HTML string literal.");
  }

  return { start, end: end + 1, alreadyExternal: false };
}

const bundle = fs.readFileSync(bundlePath, "utf8");
const range = findFirstArgumentRange(bundle);

if (range.alreadyExternal) {
  console.log(`UI already externalized in ${bundlePath}`);
  process.exit(0);
}

const nextBundle =
  bundle.slice(0, range.start) +
  "__html__" +
  bundle.slice(range.end);

fs.writeFileSync(bundlePath, nextBundle, "utf8");
console.log(`Externalized figma.showUI(...) HTML in ${bundlePath}`);
