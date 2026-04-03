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
    revision: "",
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
      revision: DEFAULT_RESPONSIVE_MEMORY.revision,
      updatedAt: DEFAULT_RESPONSIVE_MEMORY.updatedAt,
      records: [],
    };
  }

  function normalizeResponsiveMemoryStore(value) {
    const source = value && typeof value === "object" ? value : {};
    const rawRecords = Array.isArray(source.records) ? source.records : [];
    const recordsByKey = new Map();

    for (const entry of rawRecords) {
      const normalizedEntry = normalizeResponsiveMemoryRecord(entry);
      if (!normalizedEntry) {
        continue;
      }

      recordsByKey.set(buildResponsiveMemoryRecordMergeKey(normalizedEntry), normalizedEntry);
    }

    const records = Array.from(recordsByKey.values());

    const updatedAt =
      typeof source.updatedAt === "string" && source.updatedAt ? source.updatedAt : records.length ? new Date().toISOString() : "";
    return {
      schemaVersion: RESPONSIVE_MEMORY_SCHEMA_VERSION,
      revision: buildResponsiveMemoryRevision(records, updatedAt),
      updatedAt: updatedAt,
      records: records,
    };
  }

  function buildResponsiveMemoryRevision(records, updatedAt) {
    const list = Array.isArray(records) ? records.slice() : [];
    list.sort((left, right) => buildResponsiveMemoryRecordMergeKey(left).localeCompare(buildResponsiveMemoryRecordMergeKey(right)));

    let hash = 2166136261;
    hash = updateResponsiveMemoryHash(hash, String(updatedAt || ""));

    for (let index = 0; index < list.length; index += 1) {
      hash = updateResponsiveMemoryHash(hash, serializeValueForResponsiveMemoryRevision(list[index]));
    }

    return "rm-" + String(list.length) + "-" + String(hash >>> 0).toString(36);
  }

  function updateResponsiveMemoryHash(seed, text) {
    let hash = seed >>> 0;
    const source = String(text || "");
    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash >>> 0;
  }

  function serializeValueForResponsiveMemoryRevision(value) {
    if (value === null) {
      return "null";
    }
    if (typeof value === "string") {
      return JSON.stringify(value);
    }
    if (typeof value === "number") {
      return isFinite(value) ? String(value) : "null";
    }
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (Array.isArray(value)) {
      const parts = [];
      for (let index = 0; index < value.length; index += 1) {
        parts.push(serializeValueForResponsiveMemoryRevision(value[index]));
      }
      return "[" + parts.join(",") + "]";
    }
    if (!value || typeof value !== "object") {
      return "null";
    }

    const keys = Object.keys(value).sort();
    const parts = [];
    for (let index = 0; index < keys.length; index += 1) {
      const key = keys[index];
      parts.push(JSON.stringify(key) + ":" + serializeValueForResponsiveMemoryRevision(value[key]));
    }
    return "{" + parts.join(",") + "}";
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

  function buildResponsiveMemoryRecordMergeKey(record) {
    if (!record || typeof record !== "object") {
      return "";
    }

    const type = typeof record.type === "string" ? record.type.trim() : "";
    const id = typeof record.id === "string" ? record.id.trim() : "";
    const profileKey = typeof record.profileKey === "string" ? record.profileKey.trim() : "";
    const direction = typeof record.direction === "string" ? record.direction.trim() : "";
    if (!type || !id) {
      return "";
    }

    if (isStableProfileRecordType(type) && profileKey) {
      return `${type}|${direction || "default"}|${profileKey}`;
    }

    return `${type}|${id}`;
  }

  function isStableProfileRecordType(type) {
    return type === "text-role-profile" || type === "frame-shape-profile" || type === "container-profile";
  }

  function summarizeResponsiveMemoryStore(store) {
    const safeStore = normalizeResponsiveMemoryStore(store);
    const countsByType = {};
    const aggregateRecords = [];
    const pairLabelById = new Map();
    const sectionStats = {
      totalCount: 0,
      typeCounts: {},
    };
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
        pairLabelById.set(record.id, buildResponsiveMemoryPairLabel(record));
        continue;
      }

      if (type === "section-example") {
        sectionStats.totalCount += 1;
        const sectionType = typeof record.sectionType === "string" && record.sectionType ? record.sectionType : "section";
        sectionStats.typeCounts[sectionType] = (sectionStats.typeCounts[sectionType] || 0) + 1;
        continue;
      }

      if (type !== "aggregate-rule") {
        continue;
      }

      aggregateRecords.push(record);
      aggregateStats.totalCount += 1;
      const supportCount = typeof record.supportCount === "number" && isFinite(record.supportCount) ? record.supportCount : 0;
      aggregateStats.totalSupportCount += supportCount;
      if (isRepeatedAggregateRule(record)) {
        aggregateStats.repeatedCount += 1;
      }
      if (isHighConfidenceAggregateRule(record)) {
        aggregateStats.highConfidenceCount += 1;
      }
    }

    if (aggregateStats.totalCount > 0) {
      aggregateStats.averageSupportCount = roundAggregateValue(aggregateStats.totalSupportCount / aggregateStats.totalCount);
    }
    aggregateStats.conflictCount = buildMeaningfulConflictGroups(aggregateRecords).length;

    return {
      schemaVersion: safeStore.schemaVersion,
      revision: safeStore.revision,
      updatedAt: safeStore.updatedAt,
      recordCount: safeStore.records.length,
      countsByType: countsByType,
      sectionStats: sectionStats,
      aggregateStats: aggregateStats,
      aggregatePreview: buildAggregateDetailPreview(aggregateRecords, pairLabelById),
    };
  }

  function buildAggregateDetailPreview(aggregateRecords, pairLabelById) {
    const records = Array.isArray(aggregateRecords) ? aggregateRecords.slice() : [];
    const repeatedRules = records
      .filter((record) => isRepeatedAggregateRule(record))
      .sort(compareAggregateRecords)
      .slice(0, 3)
      .map((record) => buildAggregateRuleDetail(record, pairLabelById));

    const highConfidenceRules = records
      .filter((record) => isHighConfidenceAggregateRule(record))
      .sort(compareAggregateRecords)
      .slice(0, 3)
      .map((record) => buildAggregateRuleDetail(record, pairLabelById));

    const conflictingRules = buildMeaningfulConflictGroups(records)
      .sort(compareConflictGroups)
      .slice(0, 3)
      .map((group) => buildAggregateConflictDetail(group, pairLabelById));

    return {
      repeatedRules: repeatedRules,
      conflictingRules: conflictingRules,
      highConfidenceRules: highConfidenceRules,
    };
  }

  function buildAggregateRuleDetail(record, pairLabelById) {
    const safeRecord = record && typeof record === "object" ? record : {};
    const summary = typeof safeRecord.summary === "string" && safeRecord.summary.trim() ? safeRecord.summary.trim() : "aggregate rule";
    const supportCount = getNumericField(safeRecord, "supportCount");
    const avgConfidence = getNumericField(safeRecord, "avgConfidence");
    const pairIds = Array.isArray(safeRecord.pairIds) ? safeRecord.pairIds : [];
    return {
      title: summary,
      detail: `support ${supportCount} · 평균 신뢰 ${formatConfidencePercent(avgConfidence)}`,
      meta: buildPairSupportLabel(pairIds, pairLabelById),
    };
  }

  function buildAggregateConflictDetail(group, pairLabelById) {
    const list = Array.isArray(group) ? group.slice() : [];
    list.sort(compareAggregateRecords);
    const first = list[0] || {};
    const patternLabels = [];
    const pairIds = [];

    for (let index = 0; index < list.length; index += 1) {
      const record = list[index];
      if (patternLabels.length < 2) {
        patternLabels.push(`${record.summary} ×${getNumericField(record, "supportCount")}`);
      }
      if (Array.isArray(record.pairIds)) {
        for (let pairIndex = 0; pairIndex < record.pairIds.length; pairIndex += 1) {
          if (pairIds.indexOf(record.pairIds[pairIndex]) < 0) {
            pairIds.push(record.pairIds[pairIndex]);
          }
        }
      }
    }

    return {
      title: buildAggregateConflictTitle(first),
      detail: patternLabels.join(" · "),
      meta: `${list.length}패턴 · ${buildPairSupportLabel(pairIds, pairLabelById)}`,
    };
  }

  function buildAggregateConflictTitle(record) {
    const safeRecord = record && typeof record === "object" ? record : {};
    const scope = humanizeAggregateToken(safeRecord.scope);
    const ruleType = humanizeAggregateToken(safeRecord.ruleType);
    if (scope && ruleType) {
      return `${scope} ${ruleType}`;
    }
    if (ruleType) {
      return ruleType;
    }
    if (scope) {
      return scope;
    }
    return "aggregate conflict";
  }

  function isRepeatedAggregateRule(record) {
    return getNumericField(record, "supportCount") >= 2;
  }

  function isHighConfidenceAggregateRule(record) {
    return getNumericField(record, "supportCount") >= 3 && getNumericField(record, "avgConfidence") >= 0.9;
  }

  function buildMeaningfulConflictGroups(records) {
    const list = Array.isArray(records) ? records : [];
    const conflictGroups = new Map();

    for (let index = 0; index < list.length; index += 1) {
      const record = list[index];
      const conflictCount = getNumericField(record, "conflictCount");
      const bucketKey = typeof record.conflictBucketKey === "string" ? record.conflictBucketKey : "";
      if (conflictCount <= 1 || !bucketKey) {
        continue;
      }

      if (!conflictGroups.has(bucketKey)) {
        conflictGroups.set(bucketKey, []);
      }
      conflictGroups.get(bucketKey).push(record);
    }

    const meaningfulGroups = [];
    conflictGroups.forEach((group) => {
      const filtered = filterMeaningfulConflictGroupMembers(group);
      if (filtered.length >= 2) {
        meaningfulGroups.push(filtered);
      }
    });
    return meaningfulGroups;
  }

  function filterMeaningfulConflictGroupMembers(group) {
    const list = Array.isArray(group) ? group.slice() : [];
    list.sort(compareAggregateRecords);
    return list.filter((record) => isRepeatedAggregateRule(record));
  }

  function buildPairSupportLabel(pairIds, pairLabelById) {
    const ids = Array.isArray(pairIds) ? pairIds : [];
    const labels = [];

    for (let index = 0; index < ids.length; index += 1) {
      const pairId = ids[index];
      const label = pairLabelById && pairLabelById.has(pairId) ? pairLabelById.get(pairId) : "";
      if (label && labels.indexOf(label) < 0) {
        labels.push(label);
      }
    }

    const previewLabels = labels.slice(0, 2);
    const extraCount = labels.length - previewLabels.length;
    const labelParts = [];
    labelParts.push(`근거 pair ${ids.length}건`);
    if (previewLabels.length) {
      labelParts.push(previewLabels.join(" · "));
    }
    if (extraCount > 0) {
      labelParts.push(`+${extraCount}`);
    }
    return labelParts.join(" · ");
  }

  function buildResponsiveMemoryPairLabel(record) {
    const safeRecord = record && typeof record === "object" ? record : {};
    const pcName = typeof safeRecord.pcNodeName === "string" && safeRecord.pcNodeName.trim() ? safeRecord.pcNodeName.trim() : "PC";
    const moName = typeof safeRecord.moNodeName === "string" && safeRecord.moNodeName.trim() ? safeRecord.moNodeName.trim() : "MO";
    const pcWidth = getNumericField(safeRecord, "pcWidth");
    const moWidth = getNumericField(safeRecord, "moWidth");
    return `${pcName} ${pcWidth}px -> ${moName} ${moWidth}px`;
  }

  function compareAggregateRecords(left, right) {
    const rightSupport = getNumericField(right, "supportCount");
    const leftSupport = getNumericField(left, "supportCount");
    if (rightSupport !== leftSupport) {
      return rightSupport - leftSupport;
    }

    const rightConfidence = getNumericField(right, "avgConfidence");
    const leftConfidence = getNumericField(left, "avgConfidence");
    if (rightConfidence !== leftConfidence) {
      return rightConfidence - leftConfidence;
    }

    const rightConflict = getNumericField(right, "conflictCount");
    const leftConflict = getNumericField(left, "conflictCount");
    if (rightConflict !== leftConflict) {
      return rightConflict - leftConflict;
    }

    const leftSummary = typeof left.summary === "string" ? left.summary : "";
    const rightSummary = typeof right.summary === "string" ? right.summary : "";
    if (leftSummary < rightSummary) {
      return -1;
    }
    if (leftSummary > rightSummary) {
      return 1;
    }
    return 0;
  }

  function compareConflictGroups(left, right) {
    const leftList = Array.isArray(left) ? left : [];
    const rightList = Array.isArray(right) ? right : [];
    if (rightList.length !== leftList.length) {
      return rightList.length - leftList.length;
    }

    const leftBest = leftList.slice().sort(compareAggregateRecords)[0];
    const rightBest = rightList.slice().sort(compareAggregateRecords)[0];
    return compareAggregateRecords(leftBest, rightBest);
  }

  function humanizeAggregateToken(value) {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) {
      return "";
    }

    return text
      .replace(/[|/_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatConfidencePercent(value) {
    const next = getNumericField({ value: value }, "value");
    return `${Math.round(next * 100)}%`;
  }

  function getNumericField(record, key) {
    const value = record && typeof record === "object" ? record[key] : 0;
    return typeof value === "number" && isFinite(value) ? value : 0;
  }

  function serializeResponsiveMemoryStore(store) {
    const safeStore = normalizeResponsiveMemoryStore(store);
    return safeStore.records.map((record) => JSON.stringify(record)).join("\n");
  }

  function parseJsonLines(content) {
    const text = typeof content === "string" ? content : "";
    const lines = text.split(/\r?\n/);
    const recordsByKey = new Map();
    const errors = [];

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

        recordsByKey.set(buildResponsiveMemoryRecordMergeKey(normalized), normalized);
      } catch (error) {
        errors.push({
          line: index + 1,
          message: normalizeResponsiveMemoryError(error),
        });
      }
    }

    return {
      records: Array.from(recordsByKey.values()),
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
      map.set(buildResponsiveMemoryRecordMergeKey(record), record);
    }

    for (const entry of incomingRecords) {
      const normalized = normalizeResponsiveMemoryRecord(entry);
      if (!normalized) {
        continue;
      }
      map.set(buildResponsiveMemoryRecordMergeKey(normalized), normalized);
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
