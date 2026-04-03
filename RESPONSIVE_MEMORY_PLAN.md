# Responsive Memory Plan

## Goal

This document summarizes the March 26, 2026 planning session for the PC <-> MO design AI assist feature.

The current goal is not to change the existing UI behavior in the `AI 보정` tab. The first goal is to lock decisions, define a safe storage model, and establish an implementation order that avoids breaking the existing plugin runtime.

## Session Summary

- The feature should treat PC and MO examples as a reusable memory system rather than as repeated one-off AI training runs.
- The plugin should support paired frame learning:
  - `MO 디자인`: default target width `360`
  - `PC 디자인`: default target width `1920`
  - exact widths should remain configurable in settings
- Device detection should be separate from generation width:
  - mobile-known widths such as `360` and `375`
  - desktop threshold `1024+`
- Node matching should not trust names alone. Matching should combine:
  - component identity
  - component properties
  - structure and path context
  - text fingerprints
  - token and variable fingerprints
  - low-weight semantic names
- The system should extract deterministic layout rules first, then optionally add AI-inferred semantic rules with confidence labels.
- Memory should be exportable, importable, and portable so it can be backed up and later shared.

## Locked Decisions

These decisions are considered fixed for phase 1.

### Product and UI

- The memory management UI lives in `Settings > 학습 메모리`.
- The `AI 보정` tab remains focused on execution, analysis, and results.
- The settings section should eventually contain:
  - `JSONL 내보내기`
  - `JSONL 불러오기`
  - `내부 앱 동기화`
  - memory status metadata

### Storage Model

- The canonical memory format is `JSONL`.
- The canonical memory should be treated as a separate memory file, not mixed into source code files.
- `clientStorage` is used only as a local cache and recent-state layer.
- Document node `pluginData` stores only small anchors such as:
  - `pairId`
  - `role`
  - `fingerprint`
  - `lastMemoryRecordId`
- Large memory payloads should not be stored directly in node plugin data.

### Rollout Rules

- Existing AI correction runtime flows should remain untouched until memory import/export is stable.
- The first implementation pass must be read-only from a design-application perspective:
  - analyze frames
  - generate match candidates
  - generate rule candidates
  - store memory
  - no live design mutation yet

## Safe Implementation Process

This is the safest execution order discussed in the session.

1. Lock decisions.
2. Freeze schemas before runtime work:
   - memory file schema
   - pair schema
   - match schema
   - rule schema
   - settings schema
3. Add a dedicated plugin-side memory layer in a new source-of-truth patch file.
4. Add the `학습 메모리` section to `Settings`.
5. Ship `JSONL` export and import first.
6. Add read-only pair analysis for two selected frames.
7. Append dry-run pair, match, and rule records into memory.
8. Save lightweight anchors to node plugin data.
9. Add internal app sync after local memory import/export is stable.
10. Only then connect retrieved memory back into `AI 보정`.

## Why This Order Is Safe

- It keeps the current `AI 보정` behavior isolated during the riskiest early steps.
- It establishes a portable backup path before heavier analysis logic ships.
- It allows recovery even if later matching or sync logic changes.
- It reduces the chance of corrupting Figma documents because early phases are read-only.

## Recommended File Responsibilities

- Planned canonical memory file:
  - `responsive-memory.v1.jsonl`
- Planned plugin-side source-of-truth patch:
  - `ai-responsive-memory.js`
- Existing settings storage stays focused on AI provider configuration:
  - `ai-settings-storage.js`

## Immediate Next Scope

Phase 1 starts here:

- `결정 고정` is now documented.
- The next implementation step should be schema drafting before any runtime message handlers or UI actions are added.

## Notes

- If internal app sync is introduced later, `manifest.json` network allowlists will need to be expanded beyond the current OpenAI and Gemini domains.
- If memory is shared across teammates later, the JSONL schema should remain stable even if storage moves from local cache to an internal app backend.

## 2026-04 Update

- Keep the planner provider-agnostic so the same flow can run on OpenAI or Gemini.
- Recognize modern mobile widths such as `390` and `393` in addition to the earlier `360` and `375` memory profiles.
- Keep `360` compatibility for older memories until a deliberate default-width migration is done.
