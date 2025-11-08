# Stack & Architecture

## Technology Stack
- Runtime: Node.js 20+ with TypeScript.
- API: Express with typed routes housed under `src/routes/`.
- AI Services: Google AI Studio (Gemini 2.5 Flash for critique agents, Veo for generation) via REST APIs.
- Media tooling: `ffmpeg` for frame extraction, `opencv4nodejs` for logo/palette checks.
- Palette extraction: `node-vibrant` for pulling HEX swatches from uploaded palette assets.
- Storage: Postgres (primary store for users, brand kits, briefs, scorecards, publish logs) with asset files persisted locally under `uploads/` (gitignored).
- Frontend: React + Vite client consuming the API, using shadcn/ui as the shared design system (to be scaffolded).

## Critique Engine Multi-Agent Workflow
- **Orchestrator Agent** assembles critique context, invokes specialist agents, and aggregates their JSON responses.
- **Specialist Agents** (system prompts) focus on dimensions such as BrandFit, VisualQuality, Safety, and Clarity. Each must return JSON adhering to the shared schema:
  ```jsonc
  {
    "dimension": "BrandFit",
    "score": 0.0,        // 0–1 float
    "status": "pass|fail",
    "evidence": "text summary",
    "citations": ["optional media frame references"]
  }
  ```
- The orchestrator merges agent outputs into the canonical scorecard, recording provenance for each dimension.
- Default specialist system prompts are defined in `src/services/critique/agentConfigs.ts`. Update these when brand-specific policies evolve.

## Regeneration Loop
- When any dimension falls below threshold, the orchestrator refines the Veo prompt using agent feedback, triggers regeneration, and re-runs the critique.
- Include a watchdog counter to abort after `N` iterations to prevent infinite loops and cost overruns. Persist the iteration count and final decision for auditing.

## Safety & Reliability
- All AI responses must be validated against JSON schema before use.
- Log every external AI call with request/response hashes for traceability.
- Provide manual override hooks for human approval in early iterations.

