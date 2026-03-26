# Responsive Memory Schema

## Goal

This document freezes the initial schema direction for the responsive memory feature before broader runtime integration starts.

The canonical storage format is `JSONL`.

## File Format

- File name target:
  - `responsive-memory.v1.jsonl`
- Encoding:
  - `UTF-8`
- Record policy:
  - one JSON object per line
  - append-friendly
  - import can merge or replace

## Record Types

### Meta Record

```json
{
  "type": "meta",
  "id": "meta:default",
  "schemaVersion": 1,
  "workspaceId": "local",
  "createdAt": "2026-03-26T00:00:00.000Z",
  "updatedAt": "2026-03-26T00:00:00.000Z"
}
```

### Pair Record

```json
{
  "type": "pair",
  "id": "pair:abc123",
  "pcNodeId": "12:34",
  "moNodeId": "56:78",
  "pcWidth": 1920,
  "moWidth": 360,
  "selectionSignature": "12:34|56:78",
  "createdAt": "2026-03-26T00:00:00.000Z"
}
```

### Match Record

```json
{
  "type": "match",
  "id": "match:def456",
  "pairId": "pair:abc123",
  "matchTier": "confirmed",
  "fromNodeIds": ["12:40"],
  "toNodeIds": ["56:82"],
  "cardinality": "1:1",
  "confidence": 0.92,
  "evidence": {
    "component": true,
    "textFingerprint": true,
    "structure": true,
    "nameAlias": false
  },
  "createdAt": "2026-03-26T00:00:00.000Z"
}
```

### Aggregate Rule Record

```json
{
  "type": "aggregate-rule",
  "id": "aggregate-rule:abc999",
  "version": 1,
  "canonicalKey": "pc-to-mo|layout-axis|root|root|horizontal->vertical",
  "conflictBucketKey": "pc-to-mo|layout-axis|root|root",
  "direction": "pc-to-mo",
  "ruleType": "layout-axis",
  "scope": "root",
  "summary": "horizontal layout to vertical layout",
  "supportCount": 4,
  "avgConfidence": 0.93,
  "maxConfidence": 0.98,
  "minConfidence": 0.88,
  "pairIds": ["pair:abc123", "pair:def456"],
  "exampleRuleIds": ["rule:ghi789"],
  "status": "repeated",
  "conflictCount": 2,
  "createdAt": "2026-03-26T00:00:00.000Z",
  "updatedAt": "2026-03-26T00:00:00.000Z"
}
```

### Rule Record

```json
{
  "type": "rule",
  "id": "rule:ghi789",
  "pairId": "pair:abc123",
  "direction": "pc-to-mo",
  "ruleType": "layout-axis",
  "scope": "section",
  "confidence": 0.95,
  "source": "deterministic",
  "summary": "horizontal stack to vertical stack",
  "createdAt": "2026-03-26T00:00:00.000Z"
}
```

Representative `ruleType` values currently include:

- `layout-axis`
- `gap-scale`
- `padding-scale`
- `estimated-columns`
- `font-scale`
- `visibility-change`
- `variant-switch`
- `absolute-anchor`
- `sizing-mode`
- `child-reorder`
- `section-presence`

### Summary Record

```json
{
  "type": "summary",
  "id": "summary:jkl012",
  "pairId": "pair:abc123",
  "content": "PC to MO responsive learning summary",
  "createdAt": "2026-03-26T00:00:00.000Z"
}
```

## Local Cache Shape

The plugin cache can keep a materialized state for quick reads.

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-03-26T00:00:00.000Z",
  "records": []
}
```

## Plugin Message Contract

### Request State

```json
{
  "type": "request-responsive-memory-state"
}
```

### Export JSONL

```json
{
  "type": "export-responsive-memory-jsonl"
}
```

### Import JSONL

```json
{
  "type": "import-responsive-memory-jsonl",
  "content": "...jsonl lines...",
  "mode": "merge"
}
```

### Clear Cache

```json
{
  "type": "clear-responsive-memory"
}
```

## Guardrails

- `clientStorage` is cache-only.
- The canonical memory remains `JSONL`.
- Node plugin data should only store lightweight anchors.
- Large records should stay in memory cache or external sync targets, not on individual scene nodes.
- Raw `pair`, `match`, and `rule` records remain the source examples.
- `aggregate-rule` records are a compiled index over raw rules and can be rebuilt.
- Conflicting rules should be bucketed by rule family, not averaged into one output.
- `matchTier` should separate `confirmed` vs `candidate`, and downstream rule extraction should prefer `confirmed` matches first.
