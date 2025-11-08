# BrandAI Critique Engine

BrandAI is a hackathon prototype that automates quality control for AI-generated ads. It ingests brand kits, orchestrates Gemini 2.5 Flash specialist agents to critique generated videos, and can trigger Veo regenerations until the output is safe, on-brand, and ready for human approval.

## Features
- **Brand kit ingestion**: Upload logo, palette assets, and campaign briefs; palettes are auto-extracted via `node-vibrant` and stored in Postgres.
- **Multi-agent critique engine**: Frame extraction with ffmpeg feeds Gemini 2.5 Flash specialist prompts (BrandFit, VisualQuality, Safety, Clarity). Responses are validated and aggregated into structured scorecards.
- **Regeneration loop (planned)**: Orchestrator will refine Veo prompts using critique feedback, honoring configurable watchdog limits.
- **Publishing workflow (planned)**: Approved ads will be posted to Instagram via Graph API, persisting publish metadata.

## Tech Stack
- Node.js 20, TypeScript, Express
- Google AI Studio APIs (Gemini 2.5 Flash, Veo)
- Postgres for persistence; local `uploads/` for assets
- ffmpeg + `fluent-ffmpeg` for frame extraction
- `node-vibrant`, `opencv4nodejs` (planned) for visual checks
- React + Vite dashboard with shadcn/ui (planned)

## Getting Started
### Prerequisites
- Node.js 20+
- Postgres instance
- Google AI Studio API key with access to Gemini 2.5 Flash and Veo endpoints
- ffmpeg (bundled via `@ffmpeg-installer/ffmpeg`)

### Installation
```bash
npm install
cp .env.example .env
```
Edit `.env` with your credentials:
- `GOOGLE_API_KEY`
- `DATABASE_URL`
- Optional overrides for `UPLOAD_DIR`, `TEMP_DIR`, `DEFAULT_REGEN_LIMIT`

### Database Setup
The server bootstraps tables automatically. To initialize manually:
```bash
npm run build
npm run start
```
Tables created: `users`, `brand_kits`, `campaign_briefs` (more coming for scorecards/publish logs).

### Development
Run the dev server with hot reload:
```bash
npm run dev
```
Available endpoints (prefix `/api`):
- `GET /brand-kits` – list kits for the authenticated user (requires `X-User-Id` header)
- `GET /brand-kits/:id` – fetch single kit
- `POST /brand-kits` – multipart upload for logo/palette plus metadata
- Additional critique/generation routes coming soon

### Testing (planned)
Vitest suite to cover prompt builders, aggregation logic, and integration mocks for Gemini will arrive as the critique engine stabilizes.

## Project Structure
```text
src/
  config/        # Environment + Google AI client wrappers
  db/            # Postgres pool and DAO helpers
  prompt/        # Prompt templates for agents
  routes/        # Express route registrations
  services/
    critique/    # Multi-agent critique orchestration
  types/         # Shared TypeScript interfaces
  utils/         # Video frame extraction, helpers
uploads/          # Uploaded brand assets (gitignored)
tmp/              # Temporary frame storage (gitignored)
```

## Roadmap
- [ ] Wire Veo generation + regeneration loop
- [ ] Add auxiliary OpenCV logo/palette similarity scoring
- [ ] Persist critique scorecards and publish logs
- [ ] Build React dashboard (shadcn/ui) for human review + Instagram publish
- [ ] Regression tests & CI pipeline

## Contributing
Pull requests welcome during the hackathon. Follow the rules in `agents.md` and `rules/` to keep documentation and prompts in sync.

## License
MIT
