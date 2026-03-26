;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_AI_RESPONSIVE_MEMORY_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const RESPONSIVE_MEMORY_KEY = "pigma:responsive-memory:v1";
  const RESPONSIVE_MEMORY_SCHEMA_VERSION = 1;
  const DEFAULT_RESPONSIVE_MEMORY = Object.freeze({
    schemaVersion: RESPONSIVE_MEMORY_SCHEMA_VERSION,
    updatedAt: "",
    records: [],
  });

  if (typeof originalOnMessage !== "function") {
    return;
  }

  globalScope.__PIGMA_RESPONSIVE_MEMORY__ = {
    readStoreAsync: readResponsiveMemoryStore,
    writeStoreAsync: writeResponsiveMemoryStore,
    appendRecordsAsync: appendResponsiveMemoryRecords,
    summarizeStore: summarizeResponsiveMemoryStore,
    serializeStore: serializeResponsiveMemoryStore,
    normalizeRecord: normalizeResponsiveMemoryRecord,
    normalizeErrorMessage: normalizeResponsiveMemoryError,
  };

  figma.ui.onmessage = async (message) => {
    if (isResponsiveMemoryMessage(message)) {
      await handleResponsiveMemoryMessage(message);
      return;
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_AI_RESPONSIVE_MEMORY_PATCH__ = true;

  function isResponsiveMemoryMessage(message) {
    return (
      !!message &&
      (message.type === "request-responsive-memory-state" ||
        message.type === "export-responsive-memory-jsonl" ||
        message.type === "import-responsive-memory-jsonl" ||
        message.type === "clear-responsive-memory")
    );
  }

  async function handleResponsiveMemoryMessage(message) {
    try {
      if (message.type === "request-responsive-memory-state") {
        await postResponsiveMemoryState();
        return;
      }

      if (message.type === "export-responsive-memory-jsonl") {
        await postResponsiveMemoryExport();
        return;
      }

      if (message.type === "import-responsive-memory-jsonl") {
        await importResponsiveMemory(message);
        return;
      }

      if (message.type === "clear-responsive-memory") {
        await clearResponsiveMemory();
        return;
      }
    } catch (error) {
      postResponsiveMemoryError(normalizeResponsiveMemoryError(error));
    }
  }

  async function postResponsiveMemoryState() {
    const store = await readResponsiveMemoryStore();
    figma.ui.postMessage({
      type: "responsive-memory-state",
      state: summarizeResponsiveMemoryStore(store),
    });
  }

  async function postResponsiveMemoryExport() {
    const store = await readResponsiveMemoryStore();
    figma.ui.postMessage({
      type: "responsive-memory-export",
      content: serializeResponsiveMemoryStore(store),
      state: summarizeResponsiveMemoryStore(store),
    });
  }

  async function importResponsiveMemory(message) {
    const mode = normalizeImportMode(message && message.mode);
    const parsed = parseJsonLines(message && message.content);
    const currentStore = await readResponsiveMemoryStore();
    const nextStore = mode === "replace" ? buildResponsiveMemoryStore(parsed.records) : mergeResponsiveMemoryStores(currentStore, parsed.records);
    await writeResponsiveMemoryStore(nextStore);

    figma.ui.postMessage({
      type: "responsive-memory-import-result",
      mode: mode,
      importedCount: parsed.records.length,
      skippedCount: parsed.errors.length,
      errors: parsed.errors,
      state: summarizeResponsiveMemoryStore(nextStore),
    });
  }

  async function clearResponsiveMemory() {
    const emptyStore = cloneDefaultResponsiveMemory();
    await writeResponsiveMemoryStore(emptyStore);
    figma.ui.postMessage({
      type: "responsive-memory-clear-result",
      state: summarizeResponsiveMemoryStore(emptyStore),
    });
  }

  async function readResponsiveMemoryStore() {
    try {
      return normalizeResponsiveMemoryStore(await figma.clientStorage.getAsync(RESPONSIVE_MEMORY_KEY));
    } catch (error) {
      return cloneDefaultResponsiveMemory();
    }
  }

  async function writeResponsiveMemoryStore(value) {
    const normalized = normalizeResponsiveMemoryStore(value);
    await figma.clientStorage.setAsync(RESPONSIVE_MEMORY_KEY, normalized);
    return normalized;
  }

  async function appendResponsiveMemoryRecords(records) {
    const currentStore = await readResponsiveMemoryStore();
    const list = Array.isArray(records) ? records : [];
    const nextStore = mergeResponsiveMemoryStores(currentStore, list);
    await writeResponsiveMemoryStore(nextStore);
    return nextStore;
  }

  function cloneDefaultResponsiveMemory() {
    return {
      schemaVersion: DEFAULT_RESPONSIVE_MEMORY.schemaVersion,
      updatedAt: DEFAULT_RESPONSIVE_MEMORY.updatedAt,
      records: [],
    };
  }

  function normalizeResponsiveMemoryStore(value) {
    const source = value && typeof value === "object" ? value : {};
    const rawRecords = Array.isArray(source.records) ? source.records : [];
    const records = [];
    const seenIds = new Set();

    for (const entry of rawRecords) {
      const normalizedEntry = normalizeResponsiveMemoryRecord(entry);
      if (!normalizedEntry) {
        continue;
      }

      if (seenIds.has(normalizedEntry.id)) {
        continue;
      }

      seenIds.add(normalizedEntry.id);
      records.push(normalizedEntry);
    }

    return {
      schemaVersion: RESPONSIVE_MEMORY_SCHEMA_VERSION,
      updatedAt: typeof source.updatedAt === "string" && source.updatedAt ? source.updatedAt : records.length ? new Date().toISOString() : "",
      records: records,
    };
  }

  function normalizeResponsiveMemoryRecord(value) {
    if (!value || typeof value !== "object") {
      return null;
    }

    const type = typeof value.type === "string" ? value.type.trim() : "";
    const id = typeof value.id === "string" ? value.id.trim() : "";
    if (!type || !id) {
      return null;
    }

    const next = {};
    Object.keys(value).forEach((key) => {
      next[key] = value[key];
    });
    next.type = type;
    next.id = id;
    if (typeof next.createdAt !== "string" || !next.createdAt) {
      next.createdAt = new Date().toISOString();
    }
    return next;
  }

  function summarizeResponsiveMemoryStore(store) {
    const safeStore = normalizeResponsiveMemoryStore(store);
    const countsByType = {};
    const aggregateStats = {
      totalCount: 0,
      repeatedCount: 0,
      conflictCount: 0,
      highConfidenceCount: 0,
      totalSupportCount: 0,
      averageSupportCount: 0,
      pairCount: 0,
    };

    for (const record of safeStore.records) {
      const type = record.type;
      countsByType[type] = (countsByType[type] || 0) + 1;

      if (type === "pair") {
        aggregateStats.pairCount += 1;
        continue;
      }

      if (type !== "aggregate-rule") {
        continue;
      }

      aggregateStats.totalCount += 1;
      const supportCount = typeof record.supportCount === "number" && isFinite(record.supportCount) ? record.supportCount : 0;
      const avgConfidence = typeof record.avgConfidence === "number" && isFinite(record.avgConfidence) ? record.avgConfidence : 0;
      const conflictCount = typeof record.conflictCount === "number" && isFinite(record.conflictCount) ? record.conflictCount : 0;
      aggregateStats.totalSupportCount += supportCount;
      if (supportCount >= 2) {
        aggregateStats.repeatedCount += 1;
      }
      if (conflictCount > 1) {
        aggregateStats.conflictCount += 1;
      }
      if (avgConfidence >= 0.9) {
        aggregateStats.highConfidenceCount += 1;
      }
    }

    if (aggregateStats.totalCount > 0) {
      aggregateStats.averageSupportCount = roundAggregateValue(aggregateStats.totalSupportCount / aggregateStats.totalCount);
    }

    return {
      schemaVersion: safeStore.schemaVersion,
      updatedAt: safeStore.updatedAt,
      recordCount: safeStore.records.length,
      countsByType: countsByType,
      aggregateStats: aggregateStats,
    };
  }

  function serializeResponsiveMemoryStore(store) {
    const safeStore = normalizeResponsiveMemoryStore(store);
    return safeStore.records.map((record) => JSON.stringify(record)).join("\n");
  }

  function parseJsonLines(content) {
    const text = typeof content === "string" ? content : "";
    const lines = text.split(/\r?\n/);
    const records = [];
    const errors = [];
    const seenIds = new Set();

    for (let index = 0; index < lines.length; index += 1) {
      const rawLine = lines[index];
      const line = String(rawLine || "").trim();
      if (!line) {
        continue;
      }

      try {
        const parsed = JSON.parse(line);
        const normalized = normalizeResponsiveMemoryRecord(parsed);
        if (!normalized) {
          errors.push({
            line: index + 1,
            message: "Invalid responsive memory record.",
          });
          continue;
        }

        if (seenIds.has(normalized.id)) {
          continue;
        }

        seenIds.add(normalized.id);
        records.push(normalized);
      } catch (error) {
        errors.push({
          line: index + 1,
          message: normalizeResponsiveMemoryError(error),
        });
      }
    }

    return {
      records: records,
      errors: errors,
    };
  }

  function buildResponsiveMemoryStore(records) {
    return normalizeResponsiveMemoryStore({
      schemaVersion: RESPONSIVE_MEMORY_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      records: records,
    });
  }

  function mergeResponsiveMemoryStores(store, incomingRecords) {
    const currentStore = normalizeResponsiveMemoryStore(store);
    const map = new Map();

    for (const record of currentStore.records) {
      map.set(record.id, record);
    }

    for (const entry of incomingRecords) {
      const normalized = normalizeResponsiveMemoryRecord(entry);
      if (!normalized) {
        continue;
      }
      map.set(normalized.id, normalized);
    }

    return buildResponsiveMemoryStore(Array.from(map.values()));
  }

  function normalizeImportMode(value) {
    return value === "replace" ? "replace" : "merge";
  }

  function postResponsiveMemoryError(message) {
    figma.ui.postMessage({
      type: "responsive-memory-error",
      message: message,
    });
  }

  function normalizeResponsiveMemoryError(error) {
    if (error instanceof Error && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }

    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }

    return "Responsive memory operation failed.";
  }

  function roundAggregateValue(value) {
    if (typeof value !== "number" || !isFinite(value)) {
      return 0;
    }
    return Math.round(value * 100) / 100;
  }
})();
