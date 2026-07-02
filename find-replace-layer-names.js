;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGER_FIND_REPLACE_LAYER_NAMES_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESULT_PREVIEW_LIMIT = 200;
  const SCAN_YIELD_INTERVAL = 500;
  const RUNTIME_COPY = {
    ko: {
      alreadyRunning: "\uB808\uC774\uC5B4 \uC774\uB984 \uBCC0\uACBD\uC774 \uC774\uBBF8 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4.",
      finding: "\uB808\uC774\uC5B4 \uC774\uB984\uC744 \uCC3E\uB294 \uC911\uC785\uB2C8\uB2E4.",
      replacing: "\uB808\uC774\uC5B4 \uC774\uB984\uC744 \uBC14\uAFB8\uB294 \uC911\uC785\uB2C8\uB2E4.",
      previewError: "\uB808\uC774\uC5B4 \uC774\uB984\uC744 \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
      replaceError: "\uB808\uC774\uC5B4 \uC774\uB984 \uBCC0\uACBD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
      enterFind: "\uCC3E\uC744 \uB808\uC774\uC5B4 \uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694.",
      nothingToChange: "\uBCC0\uACBD\uB420 \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      renameBlocked: "\uC774 \uB808\uC774\uC5B4\uB294 \uC774\uB984\uC744 \uBC14\uAFC0 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
      selectFirst: "\uD504\uB808\uC784, \uADF8\uB8F9, \uB808\uC774\uC5B4\uB97C \uBA3C\uC800 \uC120\uD0DD\uD558\uC138\uC694.",
      noLayerNamesToChange: "\uBCC0\uACBD\uD560 \uB808\uC774\uC5B4 \uC774\uB984\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
      changed: function (changedCount, skippedCount) {
        let message = "\uB808\uC774\uC5B4 \uC774\uB984 " + changedCount + "\uAC1C \uBCC0\uACBD \uC644\uB8CC";
        if (skippedCount > 0) {
          message += ", " + skippedCount + "\uAC1C \uAC74\uB108\uB700";
        }
        return message;
      },
    },
    en: {
      alreadyRunning: "Layer name replacement is already running.",
      finding: "Finding layer names...",
      replacing: "Replacing layer names...",
      previewError: "Could not check layer names.",
      replaceError: "Could not replace layer names.",
      enterFind: "Enter a layer name to find.",
      nothingToChange: "Nothing to change.",
      renameBlocked: "This layer cannot be renamed.",
      selectFirst: "Select a frame, group, or layer first.",
      noLayerNamesToChange: "No layer names to change.",
      changed: function (changedCount, skippedCount) {
        return "Changed " + changedCount + (skippedCount > 0 ? ", skipped " + skippedCount : "");
      },
    },
    es: {
      alreadyRunning: "El reemplazo de nombres de capa ya está en curso.",
      finding: "Buscando nombres de capa...",
      replacing: "Reemplazando nombres de capa...",
      previewError: "No se pudieron comprobar los nombres de capa.",
      replaceError: "No se pudieron reemplazar los nombres de capa.",
      enterFind: "Introduce un nombre de capa para buscar.",
      nothingToChange: "No hay nada que cambiar.",
      renameBlocked: "No se puede cambiar el nombre de esta capa.",
      selectFirst: "Selecciona primero un marco, grupo o capa.",
      noLayerNamesToChange: "No hay nombres de capa para cambiar.",
      changed: function (changedCount, skippedCount) {
        return "Se cambiaron " + changedCount + (skippedCount > 0 ? ", se omitieron " + skippedCount : "");
      },
    },
    ja: {
      alreadyRunning: "\u30EC\u30A4\u30E4\u30FC\u540D\u306E\u7F6E\u63DB\u306F\u3059\u3067\u306B\u5B9F\u884C\u4E2D\u3067\u3059\u3002",
      finding: "\u30EC\u30A4\u30E4\u30FC\u540D\u3092\u691C\u7D22\u4E2D...",
      replacing: "\u30EC\u30A4\u30E4\u30FC\u540D\u3092\u7F6E\u63DB\u4E2D...",
      previewError: "\u30EC\u30A4\u30E4\u30FC\u540D\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
      replaceError: "\u30EC\u30A4\u30E4\u30FC\u540D\u3092\u7F6E\u63DB\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
      enterFind: "\u691C\u7D22\u3059\u308B\u30EC\u30A4\u30E4\u30FC\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      nothingToChange: "\u5909\u66F4\u3059\u308B\u5185\u5BB9\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
      renameBlocked: "\u3053\u306E\u30EC\u30A4\u30E4\u30FC\u306E\u540D\u524D\u306F\u5909\u66F4\u3067\u304D\u307E\u305B\u3093\u3002",
      selectFirst:
        "\u5148\u306B\u30D5\u30EC\u30FC\u30E0\u3001\u30B0\u30EB\u30FC\u30D7\u3001\u307E\u305F\u306F\u30EC\u30A4\u30E4\u30FC\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      noLayerNamesToChange: "\u5909\u66F4\u3059\u308B\u30EC\u30A4\u30E4\u30FC\u540D\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
      changed: function (changedCount, skippedCount) {
        return changedCount + "\u4EF6\u5909\u66F4\u3057\u307E\u3057\u305F" + (skippedCount > 0 ? "\u3001" + skippedCount + "\u4EF6\u30B9\u30AD\u30C3\u30D7" : "");
      },
    },
    "zh-CN": {
      alreadyRunning: "\u56FE\u5C42\u540D\u79F0\u66FF\u6362\u5DF2\u5728\u8FDB\u884C\u4E2D\u3002",
      finding: "\u6B63\u5728\u67E5\u627E\u56FE\u5C42\u540D\u79F0...",
      replacing: "\u6B63\u5728\u66FF\u6362\u56FE\u5C42\u540D\u79F0...",
      previewError: "\u65E0\u6CD5\u68C0\u67E5\u56FE\u5C42\u540D\u79F0\u3002",
      replaceError: "\u65E0\u6CD5\u66FF\u6362\u56FE\u5C42\u540D\u79F0\u3002",
      enterFind: "\u8BF7\u8F93\u5165\u8981\u67E5\u627E\u7684\u56FE\u5C42\u540D\u79F0\u3002",
      nothingToChange: "\u6CA1\u6709\u53EF\u66F4\u6539\u7684\u5185\u5BB9\u3002",
      renameBlocked: "\u65E0\u6CD5\u91CD\u547D\u540D\u6B64\u56FE\u5C42\u3002",
      selectFirst: "\u8BF7\u5148\u9009\u62E9\u6846\u67B6\u3001\u7EC4\u6216\u56FE\u5C42\u3002",
      noLayerNamesToChange: "\u6CA1\u6709\u53EF\u66F4\u6539\u7684\u56FE\u5C42\u540D\u79F0\u3002",
      changed: function (changedCount, skippedCount) {
        return "\u5DF2\u66F4\u6539 " + changedCount + " \u4E2A" + (skippedCount > 0 ? "\uFF0C\u5DF2\u8DF3\u8FC7 " + skippedCount + " \u4E2A" : "");
      },
    },
  };
  let isRunning = false;

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async (message) => {
    if (isLayerNameReplaceMessage(message)) {
      if (isRunning) {
        postStatus("running", runtimeText(message, "alreadyRunning"));
        return;
      }

      if (message.type === "request-layer-name-replace-preview") {
        await runLayerNameReplacePreview(message);
      } else {
        await runLayerNameReplace(message);
      }
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGER_FIND_REPLACE_LAYER_NAMES_PATCH__ = true;

  function isLayerNameReplaceMessage(message) {
    return (
      !!message &&
      (message.type === "request-layer-name-replace-preview" || message.type === "run-layer-name-replace")
    );
  }

  function normalizeRuntimeLocale(locale) {
    const value = normalizeString(locale).toLowerCase();
    if (!value) {
      return "ko";
    }
    if (value === "zh-cn" || value === "zh-hans" || value.indexOf("zh") === 0) {
      return "zh-CN";
    }
    if (value.indexOf("ja") === 0) {
      return "ja";
    }
    if (value.indexOf("es") === 0) {
      return "es";
    }
    if (value.indexOf("en") === 0) {
      return "en";
    }
    return "ko";
  }

  function getRuntimeLocale(source) {
    return normalizeRuntimeLocale(source && source.locale);
  }

  function getRuntimeCopy(source) {
    return RUNTIME_COPY[getRuntimeLocale(source)] || RUNTIME_COPY.ko;
  }

  function runtimeText(source, key) {
    const copy = getRuntimeCopy(source);
    return copy[key] || RUNTIME_COPY.ko[key] || "";
  }

  async function runLayerNameReplacePreview(message) {
    isRunning = true;
    postStatus("running", runtimeText(message, "finding"));

    try {
      const options = normalizeSearchOptions(message);
      const collected = await collectMatchingLayerNames(options);
      const result = buildPreviewResult(options, collected);
      figma.ui.postMessage({
        type: "layer-name-replace-preview",
        result,
      });
    } catch (error) {
      const errorMessage = normalizeErrorMessage(
        error,
        runtimeText(message, "previewError")
      );
      figma.ui.postMessage({
        type: "layer-name-replace-preview-error",
        message: errorMessage,
      });
      figma.notify(errorMessage, { error: true, timeout: 2200 });
    } finally {
      isRunning = false;
    }
  }

  async function runLayerNameReplace(message) {
    isRunning = true;
    postStatus("running", runtimeText(message, "replacing"));

    try {
      const options = normalizeSearchOptions(message);
      const collected = await collectMatchingLayerNames(options);
      const selectedIds = buildSelectedIdLookup(message);
      const result = applyLayerNameReplacement(options, collected.entries, selectedIds);

      if (typeof figma.commitUndo === "function" && result.summary.changedCount > 0) {
        figma.commitUndo();
      }

      figma.ui.postMessage({
        type: "layer-name-replace-result",
        result,
      });
      notifyResult(result);
    } catch (error) {
      const errorMessage = normalizeErrorMessage(
        error,
        runtimeText(message, "replaceError")
      );
      figma.ui.postMessage({
        type: "layer-name-replace-error",
        message: errorMessage,
      });
      figma.notify(errorMessage, { error: true, timeout: 2400 });
    } finally {
      isRunning = false;
    }
  }

  function normalizeSearchOptions(message) {
    const query = normalizeString(message && message.query).trim();
    const locale = getRuntimeLocale(message);
    if (!query) {
      throw new Error(runtimeText({ locale }, "enterFind"));
    }

    return {
      query,
      replacement: normalizeString(message && message.replacement),
      scope: message && message.scope === "page" ? "page" : "selection",
      matchCase: !!(message && message.matchCase === true),
      locale,
    };
  }

  async function collectMatchingLayerNames(options) {
    const roots = getTraversalRoots(options);
    const stack = [];
    const visited = {};
    const entries = [];
    let scannedCount = 0;

    for (let index = roots.length - 1; index >= 0; index -= 1) {
      const root = roots[index];
      stack.push({
        node: root,
        path: safeName(root),
      });
    }

    while (stack.length > 0) {
      const current = stack.pop();
      const node = current && current.node;
      if (!node || node.removed) {
        continue;
      }

      if (node.id && visited[node.id]) {
        continue;
      }
      if (node.id) {
        visited[node.id] = true;
      }

      scannedCount += 1;
      if (isNameMatch(node.name, options.query, options.matchCase)) {
        const layerName = readLayerName(node);
        entries.push({
          node,
          nodeId: node.id || "",
          nodeName: layerName,
          nodeType: String(node.type || "UNKNOWN"),
          path: current.path,
          previewName: replaceLayerName(layerName, options.query, options.replacement, options.matchCase),
        });
      }

      if (hasChildren(node)) {
        for (let childIndex = node.children.length - 1; childIndex >= 0; childIndex -= 1) {
          const child = node.children[childIndex];
          stack.push({
            node: child,
            path: current.path + " / " + safeName(child),
          });
        }
      }

      if (scannedCount % SCAN_YIELD_INTERVAL === 0) {
        await yieldLayerNameTurn();
      }
    }

    return {
      entries,
      scannedCount,
      rootCount: roots.length,
    };
  }

  function applyLayerNameReplacement(options, entries, selectedIds) {
    const changed = [];
    const skipped = [];
    const useSelectedIds = selectedIds && selectedIds.count > 0;

    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      const node = entry && entry.node;
      if (!node || node.removed) {
        continue;
      }
      if (useSelectedIds && !selectedIds.lookup[node.id]) {
        continue;
      }

      const previousName = readLayerName(node);
      const nextName = replaceLayerName(previousName, options.query, options.replacement, options.matchCase);
      if (previousName === nextName) {
        skipped.push(buildSkippedEntry(entry, runtimeText(options, "nothingToChange")));
        continue;
      }

      try {
        node.name = nextName;
        changed.push({
          nodeId: entry.nodeId,
          nodeName: previousName,
          nodeType: entry.nodeType,
          path: entry.path,
          newName: nextName,
        });
      } catch (error) {
        skipped.push(buildSkippedEntry(entry, normalizeErrorMessage(error, runtimeText(options, "renameBlocked"))));
      }
    }

    return {
      processedAt: new Date().toISOString(),
      summary: {
        scope: options.scope,
        query: options.query,
        replacement: options.replacement,
        locale: options.locale,
        matchCount: entries.length,
        changedCount: changed.length,
        skippedCount: skipped.length,
      },
      changed: changed.slice(0, RESULT_PREVIEW_LIMIT),
      skipped: skipped.slice(0, RESULT_PREVIEW_LIMIT),
      truncated: changed.length > RESULT_PREVIEW_LIMIT || skipped.length > RESULT_PREVIEW_LIMIT,
    };
  }

  function buildPreviewResult(options, collected) {
    const entries = Array.isArray(collected.entries) ? collected.entries : [];
    const matches = [];
    const limit = Math.min(entries.length, RESULT_PREVIEW_LIMIT);

    for (let index = 0; index < limit; index += 1) {
      const entry = entries[index];
      matches.push({
        nodeId: entry.nodeId,
        nodeName: entry.nodeName,
        nodeType: entry.nodeType,
        path: entry.path,
        previewName: entry.previewName,
      });
    }

    return {
      processedAt: new Date().toISOString(),
      summary: {
        scope: options.scope,
        query: options.query,
        replacement: options.replacement,
        locale: options.locale,
        rootCount: collected.rootCount || 0,
        scannedCount: collected.scannedCount || 0,
        matchCount: entries.length,
        visibleCount: matches.length,
      },
      matches,
      truncated: entries.length > RESULT_PREVIEW_LIMIT,
    };
  }

  function getTraversalRoots(options) {
    const scope = options && options.scope;
    if (scope === "page") {
      return Array.from(figma.currentPage.children || []);
    }

    const selection = Array.from(figma.currentPage.selection || []);
    if (!selection.length) {
      throw new Error(runtimeText(options, "selectFirst"));
    }

    return selection;
  }

  function buildSelectedIdLookup(message) {
    const nodeIds = message && Array.isArray(message.nodeIds) ? message.nodeIds : [];
    const lookup = {};
    let count = 0;

    for (let index = 0; index < nodeIds.length; index += 1) {
      const id = normalizeString(nodeIds[index]).trim();
      if (!id || lookup[id]) {
        continue;
      }
      lookup[id] = true;
      count += 1;
    }

    return {
      lookup,
      count,
    };
  }

  function isNameMatch(name, query, matchCase) {
    const source = normalizeString(name);
    if (!source) {
      return false;
    }

    if (matchCase) {
      return source.indexOf(query) >= 0;
    }

    return source.toLowerCase().indexOf(query.toLowerCase()) >= 0;
  }

  function replaceLayerName(name, query, replacement, matchCase) {
    const source = normalizeString(name);
    const replacementText = normalizeString(replacement);
    if (!query) {
      return source;
    }

    if (matchCase) {
      return source.split(query).join(replacementText);
    }

    const lowerSource = source.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let result = "";
    let cursor = 0;
    let foundIndex = lowerSource.indexOf(lowerQuery, cursor);

    while (foundIndex >= 0) {
      result += source.slice(cursor, foundIndex) + replacementText;
      cursor = foundIndex + query.length;
      foundIndex = lowerSource.indexOf(lowerQuery, cursor);
    }

    return result + source.slice(cursor);
  }

  function buildSkippedEntry(entry, reason) {
    return {
      nodeId: entry.nodeId,
      nodeName: entry.nodeName,
      nodeType: entry.nodeType,
      path: entry.path,
      reason,
    };
  }

  function notifyResult(result) {
    const summary = result && result.summary ? result.summary : {};
    const changedCount = summary.changedCount || 0;
    const skippedCount = summary.skippedCount || 0;
    const localeSource = { locale: summary.locale };

    if (changedCount === 0) {
      figma.notify(runtimeText(localeSource, "noLayerNamesToChange"), { timeout: 1800 });
      return;
    }

    const copy = getRuntimeCopy(localeSource);
    const message =
      copy && typeof copy.changed === "function" ? copy.changed(changedCount, skippedCount) : RUNTIME_COPY.ko.changed(changedCount, skippedCount);
    figma.notify(message, { timeout: 2200 });
  }

  function postStatus(status, message) {
    figma.ui.postMessage({
      type: "layer-name-replace-status",
      status,
      message,
    });
  }

  function yieldLayerNameTurn() {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  function hasChildren(node) {
    return !!node && "children" in node && Array.isArray(node.children) && node.children.length > 0;
  }

  function safeName(node) {
    if (node && typeof node.name === "string" && node.name.trim()) {
      return node.name.trim();
    }

    if (node && typeof node.type === "string" && node.type.trim()) {
      return node.type.trim();
    }

    return "Unnamed";
  }

  function readLayerName(node) {
    if (node && typeof node.name === "string") {
      return node.name;
    }

    return safeName(node);
  }

  function normalizeString(value) {
    if (value === undefined || value === null) {
      return "";
    }
    return String(value);
  }

  function normalizeErrorMessage(error, fallback) {
    if (error && typeof error === "object" && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }

    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }

    return fallback;
  }
})();
