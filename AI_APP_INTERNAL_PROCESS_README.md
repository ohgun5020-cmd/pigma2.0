# AI App Internal Process README

## Why

The current PC -> MO flow already has the right building blocks:

- provider-aware LLM requests in `ai-llm-client.js`
- responsive memory storage in `ai-responsive-memory.js`
- pair learning in `ai-responsive-pair-analyzer.js`
- mobile draft rendering in `ai-design-assist.js`

The problem is not missing AI capability. The problem is that the runtime still asks AI for too much, repeats similar work between dry-run and draft creation, and falls back to extra AI passes when deterministic code should repair the plan locally.

This document defines the new app-internal process that should replace the current "analyze again, ask again, patch again" behavior.

## Product Goal

Inside the plugin, the user experience should feel like:

1. Select one PC frame.
2. Choose a mobile width profile such as `360`, `390`, or `393`.
3. Run analysis once.
4. Review one concise plan.
5. Create the draft from the cached plan without another full planning cycle.

The plugin should feel like an internal product flow, not like an external agent repeatedly re-reading the same frame.

## Main Rules

- Use one LLM planning call per analysis attempt.
- Never use follow-up LLM calls to repair missing sections.
- Keep the LLM limited to section planning.
- Keep deterministic code responsible for width, safe area, spacing, minimum font size, touch targets, and node mutation.
- Keep responsive memory in `JSONL` shape and treat `clientStorage` as the local materialized cache.
- Keep clone-first placement only as a legacy safe mode, not as the normal mobile path.

## Target Runtime Flow

### Phase A. Selection Analysis

Input:

- selected root node
- action: `mobile-design` or `pc-design`
- target device width profile

Output:

- normalized selection summary
- section list
- text-role hints
- selection signature

Owner:

- `analyzeSelection(...)` in `ai-design-assist.js`

Requirements:

- analysis must be deterministic
- analysis must not call AI
- analysis result must be cacheable by signature

### Phase B. Memory Retrieval

Input:

- analysis result
- action
- target width profile

Output:

- relevant similar pairs
- section examples
- repeated rules
- profile records
- memory revision metadata

Owners:

- `ai-responsive-memory.js`
- `ai-responsive-pair-analyzer.js`
- `readResponsiveMemoryContext(...)` in `ai-design-assist.js`

Requirements:

- retrieval must be read-only
- retrieval must not mutate the document
- retrieval must expose a stable `memoryRevision` or equivalent hash for cache invalidation

### Phase C. Renderer Contract

Input:

- analysis result
- action
- target width profile

Output:

- authoritative contract for what the planner is allowed to decide

Owner:

- `buildAiRendererContract(...)` in `ai-design-assist.js`

Requirements:

- contract is the single source of truth for:
  - target width
  - safe area
  - supported layout variants
  - text safety constraints
  - hard rules
- planner prompts must follow the contract, not redefine it

### Phase D. LLM Planning

Input:

- compact planning payload
- renderer contract
- memory evidence

Output:

- one plan object
- one `sections` array
- no coordinates
- no pixel values

Owners:

- `buildAssistResult(...)` in `ai-design-assist.js`
- `requestJsonTask(...)` in `ai-llm-client.js`

Requirements:

- exactly one planner call per analysis attempt
- no `requestSupplementalAiSectionPlans(...)`
- no `requestForcedAiSectionPlans(...)`
- payload should contain compact summaries, not raw oversized frame dumps

### Phase E. Deterministic Validation And Repair

Input:

- LLM plan
- renderer contract
- analysis result

Output:

- normalized plan
- repaired plan when possible
- warnings when not possible

Owner:

- new helper block in `ai-design-assist.js`

Required functions:

- `normalizePlanV2(...)`
- `validatePlanAgainstContract(...)`
- `repairPlanWithDeterministicFallback(...)`

Repair rules:

- if a section is missing, fill with `keep`
- if a variant is unsupported, downgrade to the safest supported variant
- if text layout is unsafe, collapse to grouped copy
- if section count differs from source, pad or trim deterministically

### Phase F. Draft Rendering

Input:

- repaired plan
- analysis result
- memory-derived profiles

Output:

- mobile draft frame
- render metrics
- applied changes
- quality warnings

Owners:

- `createMobileDraftFromSelection(...)`
- section rebuild helpers in `ai-design-assist.js`

Requirements:

- rendering must not ask AI again
- rendering must default to section-rebuilt mode
- clone-first placement must be opt-in legacy mode only

### Phase G. Quality Reporting

Output:

- target width used
- selected device profile
- section coverage
- warnings
- evidence mode
- whether plan was reused from cache
- whether deterministic repair was applied

Owners:

- `buildInsights(...)` and result-shaping code in `ai-design-assist.js`
- result UI in `ui.html`

## State Machine

The app should explicitly move through these states:

1. `idle`
2. `analyzing`
3. `retrieving-memory`
4. `planning`
5. `validating-plan`
6. `ready-to-render`
7. `rendering`
8. `completed`
9. `failed`

Two user-visible actions should map cleanly onto this:

- `run-ai-design-assist`
  - ends at `ready-to-render`
- `create-ai-design-assist-draft`
  - starts from cached `ready-to-render`
  - skips planning unless cache is invalid

## Cache Strategy

The current single-result cache should be split into stage-aware records.

Recommended cache keys:

- `analysisCache`
- `memoryContextCache`
- `planCache`
- `renderSummaryCache`

Recommended cache identity:

- `selectionSignature`
- `action`
- `targetWidth`
- `plannerVersion`
- `memoryRevision`

Rules:

- changing width invalidates plan cache
- changing memory revision invalidates plan cache
- draft creation should reuse plan cache when valid
- draft creation should not rebuild analysis if the selected frame signature still matches

## Mobile Width Profiles

The UI should expose explicit width choices based on existing runtime support:

- `360`
- `390`
- `393`

Rules:

- default remains `360`
- width is user-selected, not hidden inference
- selected width must be displayed in the result summary
- width must be included in cache identity and QA output

## AI Update Plan

### 1. Prompt Policy

Update prompts so the planner:

- chooses section priority
- chooses keep or hide
- chooses mobile pattern
- chooses copy grouping
- chooses visual emphasis

The planner must not:

- choose coordinates
- choose spacing tokens
- choose safe area
- choose target width
- choose touch target values
- emit pixel math

### 2. Payload Policy

Reduce payload size and ambiguity:

- keep section summaries
- keep text role samples
- keep memory evidence summaries
- keep contract and supported variants
- remove oversized child dumps when they do not improve planning quality

### 3. Provider Policy

Keep provider selection in `ai-llm-client.js`.

Do not:

- embed provider-specific branching deep inside renderer logic
- create separate renderer code paths for OpenAI and Gemini

### 4. Version Policy

Add versioned planning metadata:

- `taskType: "pc-to-mo-plan"`
- `plannerVersion: "v2"`
- `contractVersion`
- `memoryRevision`

This makes cache invalidation and debugging much easier.

## UI Update Plan

### Add

- explicit mobile width selector
- clear `Analyze` vs `Create Draft` separation
- plan reuse indicator
- deterministic repair warning badge
- legacy safe mode toggle for clone-first fallback

### Remove Or Reduce

- hidden width assumptions
- repeated busy states that look like re-analysis
- messaging that suggests AI is directly drawing final nodes

## Storage And Sync Plan

### Keep Now

- canonical schema: `JSONL`
- local materialized cache: `figma.clientStorage`

### Add Next

- `memoryRevision` in the summarized store
- export metadata needed for future team sync

### Add Later

- internal backend sync for shared memory
- optional internal AI gateway provider

Do not add backend dependency before the local planning pipeline is stable.

## File Ownership

- `ai-design-assist.js`
  - state machine
  - planning pipeline
  - contract
  - plan validation and repair
  - render summary
- `ai-llm-client.js`
  - provider selection
  - request metadata
  - request timeout and error normalization
- `ai-responsive-memory.js`
  - local memory store
  - revision metadata
  - JSONL import and export
- `ai-responsive-pair-analyzer.js`
  - pair analysis
  - rule extraction
  - profile generation
- `ui.html`
  - width selector
  - action separation
  - cache and repair indicators

## Rollout Order

### Step 1. Planning Pipeline Refactor

- split dry-run and draft-creation states
- remove supplemental and forced AI passes
- add plan normalization and repair

### Step 2. Width-Aware UI

- expose `360`, `390`, `393`
- include width in result summary and cache key

### Step 3. Memory Revision

- add revision metadata to responsive memory state
- invalidate stale plan cache when memory changes

### Step 4. Quality And Telemetry

- surface repaired-plan warnings
- surface plan reuse
- surface selected width profile

### Step 5. Optional Internal Services

- internal sync for shared JSONL memory
- optional internal LLM gateway provider

## Definition Of Done

The new process is complete when:

- one analysis attempt produces at most one LLM plan call
- draft creation reuses the cached plan when valid
- width profile is explicit in UI and summary
- deterministic repair replaces follow-up AI repair calls
- clone-first is no longer the default mobile path
- quality output reports plan reuse, repair status, and selected width

## Verification

After implementation changes:

1. Run `powershell -ExecutionPolicy Bypass -File .\build-patched-main.ps1`
2. Run `node verify-externalized-ui.js code.patched.js`
3. Run `node verify-text-import-guard.js`
4. Run `node verify-text-export-guard.js`
5. Run `node verify-psd-export-boundary.js`
6. Run `node verify-figma-runtime-syntax.js`
7. Run `node -c code.patched.js`
8. Reload the plugin and test:
   - analyze only
   - create draft from cached plan
   - width switch `360 -> 390`
   - stale cache invalidation after memory import

## What Not To Do

- do not add more AI retries to compensate for missing validator logic
- do not let the planner own layout numbers
- do not expand the clone-first path
- do not move canonical memory into node plugin data
- do not add backend-first architecture before local flow is stable
