const fs = require("fs");

const bundlePaths = process.argv.slice(2);

if (bundlePaths.length === 0) {
  console.error("Usage: node verify-externalized-ui.js <bundle.js> [more-bundles...]");
  process.exit(1);
}

const marker = "figma.showUI(";

function inspectFirstArgument(source) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error("Could not find figma.showUI(...) in bundle.");
  }

  let start = markerIndex + marker.length;
  while (start < source.length && /\s/.test(source[start])) {
    start += 1;
  }

  if (source.slice(start, start + "__html__".length) === "__html__") {
    return { kind: "__html__" };
  }

  const quote = source[start];
  if (quote === "'" || quote === '"') {
    return { kind: "string-literal" };
  }

  let end = start;
  while (end < source.length && !/[,\)\s]/.test(source[end])) {
    end += 1;
  }

  return {
    kind: "other",
    token: source.slice(start, end) || "<unknown>",
  };
}

let hasFailure = false;

for (const bundlePath of bundlePaths) {
  try {
    const bundle = fs.readFileSync(bundlePath, "utf8");
    const result = inspectFirstArgument(bundle);

    if (result.kind === "__html__") {
      console.log(`Verified external UI reference in ${bundlePath}`);
      continue;
    }

    hasFailure = true;

    if (result.kind === "string-literal") {
      console.error(
        [
          `Embedded UI string detected in ${bundlePath}.`,
          "This repo expects figma.showUI(__html__, ...) so ui.html stays the single source of truth.",
          `Repair with: node externalize-embedded-ui.js ${bundlePath}`,
        ].join(" ")
      );
      continue;
    }

    console.error(
      `Unexpected figma.showUI(...) first argument in ${bundlePath}: ${result.token}`
    );
  } catch (error) {
    hasFailure = true;
    console.error(
      `Failed to verify ${bundlePath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

process.exit(hasFailure ? 1 : 0);
