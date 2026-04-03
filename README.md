# Pigma 2.0

Clean local workspace for the Figma-to-PSD plugin.

## Responsive Memory Planning

PC <-> MO design AI assist planning, the locked phase-1 decisions, the schema notes, and the safe implementation order live in:

- [RESPONSIVE_MEMORY_PLAN.md](RESPONSIVE_MEMORY_PLAN.md)
- [RESPONSIVE_MEMORY_SCHEMA.md](RESPONSIVE_MEMORY_SCHEMA.md)
- [PC_MO_ENGINE_REFACTOR.md](PC_MO_ENGINE_REFACTOR.md)

The current refactor direction is:

- keep provider support model-agnostic with OpenAI/Gemini adapters
- keep the section-rebuilt renderer as the main path
- keep responsive memory as reusable evidence, not as prompt stuffing
- move more authority into deterministic rules for target width, safe area, minimum text, and touch targets
- treat clone-first mobile draft logic as legacy fallback only

Execution README for the next internal-app flow:

- [AI_APP_INTERNAL_PROCESS_README.md](AI_APP_INTERNAL_PROCESS_README.md)
  - Defines the target plugin state machine, the one-call planner rule, cache strategy, width-profile handling, validator/repair layer, and rollout order for the in-app PC -> MO flow.

Phase 1 currently fixes these decisions:

- UI entry lives in `Settings > 학습 메모리`, not in the `AI 보정` tab.
- The canonical memory format is `JSONL`.
- `clientStorage` is cache-only, not the canonical source of truth.
- Node-level plugin data stores only lightweight anchors such as ids, roles, and fingerprints.
- Existing `AI 보정` runtime flows stay untouched until memory import/export and dry-run analysis are stable.

Safe implementation order:

1. Lock product decisions and freeze schemas.
2. Add a dedicated responsive memory storage layer.
3. Add `Settings > 학습 메모리` UI controls.
4. Ship `JSONL` export and import before any live design mutation.
5. Add read-only pair analysis for two selected frames.
6. Append dry-run pair, match, and rule records into memory.
7. Add lightweight node anchors.
8. Add internal app sync.
9. Only then retrieve memory inside `AI 보정`.

## Plugin Manifest

- Name: `Pigma 2.0 - Figma to PSD`
- Local plugin ID: `pigma20-clean-local-20260325`
- API: `1.0.0`
- Main bundle: `code.patched.js`
- UI entry: `ui.html`

## Folder Layout

- `manifest.json`
  - Local Figma plugin manifest.
- `ui.html`
  - Single source of truth for UI edits.
- `code.js`
  - Base main/plugin bundle.
- `code.patched.js`
  - Runtime main bundle referenced by `manifest.json`.
- `build-patched-main.ps1`
  - Rebuilds `code.patched.js` from `code.js` and applies patch steps.
- `psd-import-text-fix.js`
  - Source of truth for the PSD import text guard patch.
- `psd-export-boundary.js`
  - Source of truth for the PSD export message boundary patch.
- `ai-settings-storage.js`
  - Source of truth for plugin-side AI settings persistence via `figma.clientStorage`.
- `ai-responsive-memory.js`
  - Source of truth for responsive memory cache state and JSONL import/export plumbing.
- `ai-responsive-pair-analyzer.js`
  - Source of truth for the read-only PC/MO pair analyzer that classifies two selected frames and appends draft pair, section-example, rule, and aggregate records into responsive memory.
- `ai-llm-client.js`
  - Source of truth for provider-aware OpenAI/Gemini API requests and JSON parsing.
- `ai-design-assist.js`
  - Source of truth for AI-tab responsive design assist, memory retrieval, and PC -> MO draft generation experiments.
- `ai-design-read.js`
  - Source of truth for the `디자인 읽기` plugin-side analysis and cache pipeline.
- `ai-regroup-rename.js`
  - Source of truth for the second AI button's safe regroup/rename apply pipeline and cache.
- `ai-typo-audit.js`
  - Source of truth for the third AI button's typo audit and Figma annotation apply pipeline.
- `ai-pixel-perfect.js`
  - Source of truth for the pixel-perfect button's decimal filtering, AI snap decisions, and apply pipeline.
- `delete-hidden-layers.js`
  - Source of truth for the hidden-layer delete button's local cleanup and apply pipeline.
- `ui-ai-correction.js`
  - Source of truth for `Ai 보정` feature logic and AI-only behavior. The `Ai 보정` UI itself lives in `ui.html`.
- `externalize-embedded-ui.js`
  - Replaces embedded `figma.showUI(...)` HTML with `__html__`.
- `verify-externalized-ui.js`
  - Fails if a bundle stops using `figma.showUI(__html__, ...)`.
- `text-import-guard.contract.json`
  - Contract for the import text guard.
- `verify-text-import-guard.js`
  - Verifies the import text guard survives source and build output.
- `text-export-guard.contract.json`
  - Contract for the export-side text guard.
- `verify-text-export-guard.js`
  - Verifies the export-side text guard survives source and build output.
- `psd-export-boundary.contract.json`
  - Contract for the export-side runtime message boundary.
- `verify-psd-export-boundary.js`
  - Verifies the export-side boundary survives source and build output.
- `verify-figma-runtime-syntax.js`
  - Fails when source patch files contain plugin-runtime syntax that Figma has rejected locally, such as object spread, `??`, or `?.`.
- `sync-embedded-ui.js`
  - Legacy escape hatch. Avoid this in the normal workflow.

## Clean 2.0 Scope

This `2.0` folder intentionally keeps only the runtime, patch, and verification files that are needed for local plugin work.

Not copied forward from `pigma1.7`:

- `.old/` backups
- debug screenshots and ad-hoc specs
- mojibake audit artifacts

## Safe Workflow

Runtime note: the active AI correction UI logic currently lives inline in `ui.html`, so replace old bootstrap blocks instead of stacking duplicate copies.

### White Screen Postmortem

- Symptom we hit in `2.0`:
  - the plugin opened as a blank white panel and Figma felt frozen right after launch
  - the console kept repeating permissions-policy warnings such as `camera is not allowed in this document`, `microphone is not allowed in this document`, `clipboard-write is not allowed in this document`, and `display-capture is not allowed in this document`
- Actual root cause:
  - the `디자인 일관성` UI bootstrap in `ui.html` created a `MutationObserver` that watched the same button attributes that `syncButtonState()` was mutating
  - the observer watched attributes such as `title`, `aria-label`, and `disabled` on the design-consistency button while `syncButtonState()` wrote those same attributes
  - that self-observing loop froze the UI iframe
- Important takeaway:
  - the repeated permissions warnings were noise in this case, not the freeze trigger
  - if the plugin whitescreens again, isolate `ui.html` vs `code.patched.js` first with a minimal UI or script bisection before assuming the console warnings are the cause
- Prevention rule:
  - do not observe attributes that are updated in the same callback path
  - keep button-state syncing one-way instead of observing your own writes

1. Edit `ui.html` for UI-only changes.
   - Keep `Ai 보정` screen markup and styles in `ui.html`.
   - Keep `Ai 보정` feature logic in `ui-ai-correction.js` so Make/Import behavior stays isolated.
2. Edit `code.js` or a source-of-truth patch file only when main/plugin behavior changes.
   - Export-only routing/normalization changes should go to `psd-export-boundary.js`.
   - AI settings persistence changes should go to `ai-settings-storage.js`.
3. Run `build-patched-main.ps1` after logic or patch changes.
4. Re-run the verification scripts before loading in Figma:
   - `node verify-externalized-ui.js code.patched.js`
   - `node verify-text-import-guard.js`
   - `node verify-text-export-guard.js`
   - `node verify-psd-export-boundary.js`
   - `node verify-figma-runtime-syntax.js`
   - `node -c code.patched.js`
   - Run a `ui.html` script parse check as well whenever AI correction UI scripts changed.
5. Load `manifest.json` as the local plugin entry in Figma.

## Important Rules

- `ui.html` is the live UI source. Do not treat embedded HTML inside a bundle as canonical.
- `code.patched.js` is the runtime bundle that Figma actually runs from `manifest.json`.
- Keep import-only runtime fixes in `psd-import-text-fix.js` and export-only runtime fixes in `psd-export-boundary.js`.
- If a UI edit does not show up, externalize the bundle again:
  - `node externalize-embedded-ui.js code.patched.js`
  - optionally `node externalize-embedded-ui.js code.js`
- Avoid patching generated `code.patched.js` directly when the same rule already has a source file or contract.

## Figma Runtime Syntax Guard

Figma can reject newer-looking plugin-side syntax even when local Node syntax checks pass. We hit real runtime failures during a `Local fonts` / agent flow with:

- `Syntax error on line 3179: Unexpected token ...`
- failing pattern: object spread inside plugin-side patch code such as `{ ...payload }`
- `Syntax error on line 4405: Unexpected token ?`
- failing pattern: nullish coalescing inside plugin-side patch code such as `severityOrder[level] ?? 3`

Treat source-of-truth patch files as conservative-runtime JavaScript, especially anything that gets appended into `code.patched.js`.

### Do not generate these patterns in plugin-side patches

- object spread:
  - `const body = { ...payload, status: "done" }`
  - `return { ...entry, fill }`
- nullish coalescing:
  - `const rank = severityOrder[level] ?? 99`
- optional chaining:
  - `const status = result?.status`
- dynamic spread into helpers when a simple loop/reducer works:
  - `Math.min(...values)`
  - `Math.max(...values)`

### Prefer these safer patterns

- object merge:
  - `const body = Object.assign({}, payload, { status: "done" })`
- object clone + extra fields:
  - `return Object.assign({}, entry, { fill: fillValue })`
- min/max over dynamic arrays:
  - `values.reduce((smallest, value) => (value < smallest ? value : smallest), values[0])`

### Code generation rule

When adding or regenerating plugin-side code in files such as `ai-*.js`, `delete-hidden-layers.js`, or other patches that are injected into `code.patched.js`:

- avoid raw object spread in new code
- avoid `??` and `?.` in new plugin-side patch code
- prefer `Object.assign`, explicit loops, fallback variables, and reducers
- fix the source patch file first, then rebuild
- do not rely on `code.patched.js` manual edits as the permanent fix

### Current protection in this repo

- `build-patched-main.ps1` now runs `verify-figma-runtime-syntax.js` before bundle assembly, so source patch files fail fast if they contain blocked runtime syntax.
- `build-patched-main.ps1` also runs `node -c code.patched.js` after assembly so the generated runtime bundle must still parse cleanly.
- `verify-figma-runtime-syntax.js` is intentionally focused on source patch files and currently blocks:
  - object spread in object literals
  - nullish coalescing `??`
  - optional chaining `?.`

### Required verification after patch changes

1. Run syntax checks for every edited source patch file with `node -c`.
2. Rebuild the runtime bundle:
   - `powershell -ExecutionPolicy Bypass -File .\build-patched-main.ps1`
   - this now includes the runtime syntax guard automatically
3. Re-run the existing verification scripts:
   - `node verify-externalized-ui.js code.patched.js`
   - `node verify-text-import-guard.js`
   - `node verify-text-export-guard.js`
   - `node verify-psd-export-boundary.js`
   - `node verify-figma-runtime-syntax.js`
   - `node -c code.patched.js`
4. If the change added or touched plugin-side generated logic, scan the patched bundle for risky spread patterns before loading Figma:
   - `rg -n -F "...payload" code.patched.js`
   - `rg -n -F "??" code.patched.js`
   - `rg -n -F "?." code.patched.js`
   - `rg -n "\\.\\.\\." . -g "ai-*.js" -g "delete-hidden-layers.js" -g "code.patched.js"`
5. Reload the local plugin in Figma and test the exact button/flow that changed.

If a future generated patch needs a newer syntax feature, assume it is unsafe until it has been verified in the local Figma runtime, not just in Node.

## PSD Preview Compatibility

- Some exported PSD files can show a black or missing preview in Windows Explorer or macOS Finder/Quick Look even when the PSD itself opens correctly in Photoshop.
- The current safeguard keeps PSD preview data enabled for normal `psd-only` exports, not just bundle exports.
- `build-patched-main.ps1` now reapplies three UI-side PSD preview fixes when rebuilding:
  - include composite PNG bytes for `psd-only` export requests
  - write PSDs with `generateThumbnail: true`
  - paint a white matte behind the generated JPEG thumbnail to avoid transparent previews appearing black
- Source of truth:
  - runtime behavior lives in `ui.html`
  - rebuild-time patch rules live in `build-patched-main.ps1`
- If this regression comes back after a rebuild, first run `build-patched-main.ps1` again and verify `ui.html` still contains:
  - `includeCompositePng` for `psd-only`
  - `generateThumbnail:!0`
  - the white thumbnail matte fill before thumbnail draw

## Version Bump Summary

- Folder target moved to `2.0`
- Plugin display name updated to `Pigma 2.0 - Figma to PSD`
- Local plugin ID replaced with `pigma20-clean-local-20260325`
- README rewritten to match the clean 2.0 workspace
