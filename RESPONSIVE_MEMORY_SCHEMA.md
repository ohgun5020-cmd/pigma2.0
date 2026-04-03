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
  - profile records merge by `type + direction + profileKey` and replace older snapshots

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

### Frame Transform Record

```json
{
  "type": "frame-transform",
  "id": "frame-transform:abc321",
  "version": 4,
  "pairId": "pair:abc123",
  "direction": "pc-to-mo",
  "scope": "root",
  "sourceShape": "wide",
  "targetShape": "tall",
  "sourceAspectBucket": "0.65-0.84",
  "targetWidthBucket": "320-399",
  "sectionCountBucket": "4-6",
  "sourceLayoutMode": "none",
  "source": {
    "nodeId": "12:34",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 0.563,
    "shape": "wide"
  },
  "target": {
    "nodeId": "56:78",
    "width": 360,
    "height": 780,
    "aspectRatio": 2.167,
    "shape": "tall"
  },
  "delta": {
    "widthScaleRatio": 0.188,
    "heightScaleRatio": 0.722,
    "aspectRatioShift": 1.604,
    "shapeChanged": true
  },
  "createdAt": "2026-03-31T00:00:00.000Z"
}
```

### Container Transform Record

```json
{
  "type": "container-transform",
  "id": "container-transform:abc777",
  "version": 5,
  "pairId": "pair:abc123",
  "direction": "pc-to-mo",
  "nodeKind": "container",
  "sectionType": "promo",
  "sourceLayoutMode": "horizontal",
  "sourceWidthBucket": "800-1119",
  "childCountBucket": "2-3",
  "targetWidthBucket": "280-399",
  "source": {
    "nodeId": "12:60",
    "width": 920,
    "height": 320,
    "gap": 32,
    "paddingX": 64,
    "paddingY": 48,
    "columns": 3
  },
  "target": {
    "nodeId": "56:91",
    "width": 328,
    "height": 510,
    "gap": 12,
    "paddingX": 24,
    "paddingY": 24,
    "columns": 1
  },
  "delta": {
    "widthScaleRatio": 0.357,
    "heightScaleRatio": 1.594,
    "gapScaleRatio": 0.375,
    "paddingXScaleRatio": 0.375,
    "paddingYScaleRatio": 0.5,
    "columnsDelta": -2,
    "layoutChanged": true
  },
  "createdAt": "2026-03-31T00:00:00.000Z"
}
```

### Text Node Transform Record

```json
{
  "type": "node-transform",
  "id": "node-transform:abc901",
  "version": 5,
  "pairId": "pair:abc123",
  "direction": "pc-to-mo",
  "nodeKind": "text",
  "sectionType": "hero",
  "textRole": "headline",
  "sourceFontBucket": "180-259",
  "charBucket": "12-19",
  "profileKey": "pc-to-mo|hero|headline|180-259|12-19",
  "pc": {
    "nodeId": "12:40",
    "fontSize": 220,
    "lineHeight": 240,
    "lineCount": 2,
    "textAlign": "CENTER"
  },
  "mo": {
    "nodeId": "56:82",
    "fontSize": 95,
    "lineHeight": 108,
    "lineCount": 4,
    "textAlign": "CENTER"
  },
  "delta": {
    "fontScaleRatio": 0.432,
    "lineHeightRatio": 0.45,
    "widthRatio": 0.318,
    "lineCountDelta": 2,
    "alignmentChanged": false
  },
  "createdAt": "2026-03-31T00:00:00.000Z"
}
```

Notes:
- the same matched pair now emits both `pc-to-mo` and `mo-to-pc` text observations
- `pc` and `mo` payloads are always preserved together, while `direction` decides which side is treated as source vs target for profile aggregation

### Text Role Profile Record

```json
{
  "type": "text-role-profile",
  "id": "text-role-profile:abc902",
  "version": 1,
  "direction": "pc-to-mo",
  "sectionType": "hero",
  "textRole": "headline",
  "sourceFontBucket": "180-259",
  "charBucket": "12-19",
  "profileKey": "pc-to-mo|hero|headline|180-259|12-19",
  "sampleCount": 12,
  "pairCount": 8,
  "preferredAlign": "center",
  "alignDistribution": {
    "dominant": "center",
    "entries": [
      { "align": "center", "count": 8, "ratio": 0.667 },
      { "align": "left", "count": 3, "ratio": 0.25 },
      { "align": "justified", "count": 1, "ratio": 0.083 }
    ]
  },
  "fontScaleRatio": { "p25": 0.41, "p50": 0.43, "p75": 0.46 },
  "lineHeightRatio": { "p25": 0.42, "p50": 0.45, "p75": 0.48 },
  "widthRatio": { "p25": 0.28, "p50": 0.32, "p75": 0.36 },
  "targetFontSize": { "min": 88, "p50": 95, "max": 108 },
  "targetLineCount": { "min": 3, "median": 4, "max": 5 },
  "createdAt": "2026-03-31T00:00:00.000Z",
  "updatedAt": "2026-03-31T00:00:00.000Z"
}
```

### Section Example Record

```json
{
  "type": "section-example",
  "id": "section:abc777",
  "version": 2,
  "pairId": "pair:abc123",
  "direction": "pc-to-mo",
  "confidence": 0.91,
  "sectionType": "hero",
  "mobilePattern": "hero-crop-stack",
  "heroGuidance": {
    "headlinePreserve": true,
    "copyIntegrity": "required",
    "copyBlockPreferred": true,
    "overlayPosition": "top-center",
    "focalTargets": ["headline", "product"],
    "cropPriority": "headline-first",
    "compositionPreset": "overlay-copy-bottom-visual",
    "textAlignment": "center",
    "visualAnchor": "bottom"
  },
  "sectionGuidance": {
    "contentPriority": "text-first",
    "reflowPattern": "overlay-copy-bottom-visual",
    "textGroupRoles": {
      "order": ["eyebrow", "headline", "subtitle", "body"],
      "required": ["headline", "subtitle", "body"],
      "detected": ["eyebrow", "headline", "subtitle", "body"]
    },
    "textPreservation": {
      "allTextMustSurvive": true,
      "preserveReadingOrder": true,
      "preserveHeadlineVerbatim": true,
      "copyBlockPreferred": true
    },
    "textLayoutGuidance": {
      "alignment": "center",
      "rewrapRequired": true,
      "headlineMaxWidthRatio": 0.88,
      "preferredLineBreakCount": 3,
      "maxLineCount": {
        "eyebrow": 2,
        "headline": 4,
        "subtitle": 3,
        "body": 5
      },
      "minFontSize": {
        "headline": 40,
        "subtitle": 22,
        "body": 16,
        "meta": 14
      }
    },
    "visualRole": {
      "primary": "background",
      "focal": "product",
      "anchor": "bottom"
    },
    "mobileAspectPreference": {
      "preferredRatio": 1.48,
      "minRatio": 1.24,
      "maxRatio": 1.8
    },
    "cropSafeZone": {
      "horizontalBias": "center",
      "verticalBias": "top",
      "preserveTargets": ["headline", "product"],
      "allowBackgroundTrim": true
    },
    "dropRules": {
      "hideDecorative": true,
      "hideDesktopOnlyElements": false,
      "hideRedundantMeta": false,
      "prioritizeTextOverVisual": true,
      "collapseHorizontalLayout": false,
      "preserveAllText": true
    }
  },
  "sectionSignature": "hero-main-visual",
  "summary": "main visual · hero -> hero-crop-stack",
  "pcNodeId": "12:40",
  "moNodeId": "56:82",
  "pc": {
    "name": "Hero",
    "layoutMode": "NONE",
    "width": 1920,
    "height": 720,
    "childCount": 4,
    "stats": {
      "totalNodes": 22,
      "textNodes": 5,
      "imageFillNodes": 1
    }
  },
  "mo": {
    "name": "Hero Mobile",
    "layoutMode": "VERTICAL",
    "width": 360,
    "height": 420,
    "childCount": 3,
    "stats": {
      "totalNodes": 18,
      "textNodes": 4,
      "imageFillNodes": 1
    }
  },
  "createdAt": "2026-03-30T00:00:00.000Z"
}
```

### Frame Shape Profile Record

```json
{
  "type": "frame-shape-profile",
  "id": "frame-shape-profile:abc654",
  "version": 1,
  "direction": "pc-to-mo",
  "sourceShape": "wide",
  "sourceAspectBucket": "0.65-0.84",
  "sourceLayoutMode": "none",
  "sectionCountBucket": "4-6",
  "targetWidthBucket": "320-399",
  "sampleCount": 9,
  "pairCount": 6,
  "dominantTargetShape": "tall",
  "targetShapeDistribution": {
    "dominant": "tall",
    "entries": [
      { "shape": "tall", "count": 7, "ratio": 0.778 },
      { "shape": "balanced", "count": 2, "ratio": 0.222 }
    ]
  },
  "targetAspectRatio": { "p25": 1.24, "p50": 1.42, "p75": 1.58 },
  "heightScaleRatio": { "p25": 0.48, "p50": 0.61, "p75": 0.74 },
  "confidence": 0.91,
  "createdAt": "2026-03-31T00:00:00.000Z",
  "updatedAt": "2026-03-31T00:00:00.000Z"
}
```

### Container Profile Record

```json
{
  "type": "container-profile",
  "id": "container-profile:abc888",
  "version": 1,
  "direction": "pc-to-mo",
  "sectionType": "promo",
  "sourceLayoutMode": "horizontal",
  "sourceWidthBucket": "800-1119",
  "childCountBucket": "2-3",
  "targetWidthBucket": "280-399",
  "sampleCount": 11,
  "pairCount": 7,
  "preferredTargetLayoutMode": "vertical",
  "preferredTargetColumns": 1,
  "targetGap": { "min": 8, "p50": 12, "max": 16 },
  "targetPaddingX": { "min": 16, "p50": 24, "max": 32 },
  "targetPaddingY": { "min": 16, "p50": 24, "max": 40 },
  "targetAspectRatio": { "p25": 1.18, "p50": 1.36, "p75": 1.54 },
  "collapseToSingleColumn": true,
  "confidence": 0.89,
  "createdAt": "2026-03-31T00:00:00.000Z",
  "updatedAt": "2026-03-31T00:00:00.000Z"
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
- `frame-aspect-ratio`
- `frame-shape`
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
- `section-example` records are the bridge between page-level learning and section-template reconstruction.
- `aggregate-rule` records are a compiled index over raw rules and can be rebuilt.
- Conflicting rules should be bucketed by rule family, not averaged into one output.
- `matchTier` should separate `confirmed` vs `candidate`, and downstream rule extraction should prefer `confirmed` matches first.
