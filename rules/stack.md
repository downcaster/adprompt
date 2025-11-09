# Stack & Architecture

## Development Environment
- **Docker & Docker Compose**: **REQUIRED** for running the project. All services (backend, frontend, PostgreSQL) run in containers with hot reload support.
- Use `make dev` or `docker-compose up -d` to start the entire stack.
- See `DOCKER.md` for complete setup instructions and troubleshooting.

## Technology Stack
- Runtime: Node.js 20+ with TypeScript.
- API: Express with typed routes housed under `src/routes/`.
- AI Services: Google AI Studio (Gemini 2.5 Flash for critique agents, Veo for generation) via REST APIs.
- Media tooling: `ffmpeg` for frame extraction (bundled in Docker image).
- Palette extraction: `node-vibrant` for pulling HEX swatches from uploaded palette assets.
- Storage: PostgreSQL (primary store for users, brand kits, briefs, scorecards, publish logs) with asset files persisted locally under `storage/uploads/` (gitignored).
- Frontend: Next.js 16 (Turbopack) with React, using shadcn/ui as the design system.
- Asset handling: `multer` + helpers in `src/utils/uploads.ts`, `mime-types` for Veo asset MIME detection. Generated videos are written to `storage/uploads/generated` (served publicly at `/uploads/...`).
- TypeScript policy: avoid `any`. When inference fails, use specific interfaces or `unknown` with runtime validation (e.g., Zod).

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

## Generation Workflow
- Campaign briefs (`src/routes/campaign.ts`) collect product imagery and tone metadata per brand kit.
- Veo requests are assembled via `src/prompt/generationTemplate.ts` and executed in `src/services/generation/generationProxy.ts`, attaching brand/product assets as inline data blobs.
- `src/services/generation/orchestrator.ts` sequences Veo generation with critique loops, honoring per-campaign regen limits and score thresholds.
- REST endpoints under `/api/generation` expose single-pass generation, generate+critique, and regeneration flows.
- Persisted scorecards live in the `scorecards` table via `src/db/scorecards.ts`, storing JSON payloads and `/uploads/...` URLs for audit trails.
- Publish activity is logged through `src/db/publishLogs.ts` and exposed via `/api/publish-logs`.

## Regeneration Loop
- When any dimension falls below threshold, the orchestrator refines the Veo prompt using agent feedback, triggers regeneration, and re-runs the critique.
- Include a watchdog counter to abort after `N` iterations to prevent infinite loops and cost overruns. Persist the iteration count and final decision for auditing.

## Safety & Reliability
- All AI responses must be validated against JSON schema before use.
- Log every external AI call with request/response hashes for traceability.
- Provide manual override hooks for human approval in early iterations.

