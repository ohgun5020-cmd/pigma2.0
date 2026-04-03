# PC -> MO Engine Refactor

## Why

`pigma` already has the core pieces for PC -> MO conversion:

- provider-aware LLM requests in `ai-llm-client.js`
- reusable responsive memory in `ai-responsive-memory.js`
- pair learning and profile extraction in `ai-responsive-pair-analyzer.js`
- section-rebuilt draft generation in `ai-design-assist.js`

The next step is not "add more AI". The next step is to tighten the boundary between:

- what the LLM is allowed to decide
- what deterministic code must always own

## Keep

- `ai-llm-client.js`
  - Keep OpenAI/Gemini support model-agnostic.
- `ai-responsive-memory.js`
  - Keep JSONL memory as the portable evidence layer.
- `ai-responsive-pair-analyzer.js`
  - Keep frame, container, and text-role profile extraction.
- `createMobileDraftFromSelection(...)` in `ai-design-assist.js`
  - Keep the section-rebuilt renderer as the main mobile path.

## Update

- `buildAiRendererContract(...)` in `ai-design-assist.js`
  - Treat it as the source of truth for hard rules and planner boundaries.
- LLM planner prompts in `ai-design-assist.js`
  - Make them provider-agnostic.
  - Explicitly forbid the model from choosing exact pixels, safe area, target width, and touch targets.
- mobile device handling
  - Support common phone-width profiles such as `360`, `390`, and `393`.
- quality reporting
  - Report target width, selected device profile, and minimum touch target assumptions.

## Remove Or Freeze

- `createLegacyMobileDraftFromSelection(...)` in `ai-design-assist.js`
  - Do not expand this path.
  - Keep it only as a legacy fallback and debugging comparison.
- Claude-specific framing in docs or prompts
  - Replace with `LLM planner`, `OpenAI`, or `Gemini`.
- any future "AI decides everything" flow
  - Do not allow direct `source nodes -> LLM -> final Figma nodes`.

## Target Boundary

### LLM owns

- section priority
- keep vs hide decisions
- mobile pattern choice
- copy grouping
- visual emphasis

### Deterministic code owns

- target width
- safe area
- spacing scale
- minimum font sizes
- minimum touch target
- root auto-layout flow
- Figma node creation and mutation

## Recommended Pipeline

1. Read source frame and normalize structure.
2. Retrieve responsive memory evidence.
3. Build a renderer contract with hard rules.
4. Ask the LLM for section plans only.
5. Validate and normalize the plan.
6. Render the draft with deterministic Figma code.
7. Score the output and record warnings.

## Short-Term Checklist

- move all new planning changes through `buildAiRendererContract(...)`
- keep provider logic in `ai-llm-client.js`, not in planner modules
- add more device profiles before changing the default width
- keep `390` support available without breaking older `360`-based memory
- add touch-target and safe-area checks to future draft QA

## What Not To Do

- do not put provider-specific prompt logic deep inside renderer code
- do not let screenshot vision become the only planner input
- do not grow the clone-first mobile path
- do not store large draft plans in node plugin data
