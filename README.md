# BrandAI Critique Engine

BrandAI is a hackathon prototype that automates quality control for AI-generated ads. It ingests brand kits, orchestrates Gemini 2.5 Flash specialist agents to critique generated videos, and can trigger Veo regenerations until the output is safe, on-brand, and ready for human approval.

## Features
- **Brand kit ingestion**: Upload logo, palette assets, and configure campaign briefs; palettes are auto-extracted via `node-vibrant` and stored in Postgres.
- **Multi-agent critique engine**: Frame extraction with ffmpeg feeds Gemini 2.5 Flash specialist prompts (BrandFit, VisualQuality, Safety, Clarity). Responses are validated and aggregated into structured scorecards.
- **Scorecard persistence**: Each critique iteration is stored in Postgres with public `/uploads/...` URLs, enabling history views and audit trails.
- **Synchronous generation loop**: Veo generations incorporate brand/product assets, then auto-run through the critique engine until scores clear configurable thresholds (watchdog defaults to 5 iterations).
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
Tables created: `users`, `brand_kits`, `campaign_briefs`, `scorecards`, `publish_logs`.

### Development
Run the dev server with hot reload:
```bash
npm run dev
```
Available endpoints (prefix `/api`):
- `GET /brand-kits` – list kits for the authenticated user (requires `X-User-Id` header)
- `GET /brand-kits/:id` – fetch single kit
- `POST /brand-kits` – multipart upload for logo/palette plus metadata
- `GET /campaigns?brandKitId=` – list campaigns for a kit
- `POST /campaigns` – create campaign brief (`multipart/form-data` with `product` image, optional `assets[]`)
- `POST /generation/generate` – single Veo pass (no critique)
- `POST /generation/generate-and-critique` – run Veo + critique loop until success or watchdog limit
- `POST /generation/regenerate` – convenience alias to re-run the loop with updated thresholds/limits
- `GET /scorecards?brandKitId=` / `?campaignId=` – list stored critique scorecards (requires ownership)
- `GET /scorecards/:id` – fetch a single scorecard
- `POST /publish-logs` – record an external publish event (platform, status, optional metadata)
- `GET /publish-logs?campaignId=` – view publish history for a campaign

### Testing
Run the unit test suite with:
```bash
npm run test
```
Watch mode is available during development:
```bash
npm run test:watch
```
Current coverage focuses on score aggregation and prompt builders; extend with integration tests as the Gemini/Veo flows stabilize.

### Sample Scripts
Generate a mock scorecard from canned agent outputs:
```bash
npm run sample:scorecard
```
Use this to demonstrate the JSON structure to stakeholders without invoking external APIs.

## Project Structure
```text
src/
  config/        # Environment + Google AI client wrappers
  db/            # Postgres pool and DAO helpers
  prompt/        # Prompt templates for agents & Veo
  routes/        # Express route registrations
  services/
    campaignService.ts
    brandKitService.ts
    critique/    # Multi-agent critique orchestration
    generation/  # Veo proxy + regen orchestrator
  types/         # Shared TypeScript interfaces
  utils/         # Video frame extraction, helpers
uploads/          # Uploaded brand assets (gitignored)
tmp/              # Temporary frame storage (gitignored)
```

## Roadmap
- [x] Wire Veo generation + regeneration loop
- [ ] Add auxiliary OpenCV logo/palette similarity scoring
- [ ] Persist critique scorecards and publish logs
- [ ] Build React dashboard (shadcn/ui) for human review + Instagram publish
- [ ] Regression tests & CI pipeline

## Contributing
Pull requests welcome during the hackathon. Follow the rules in `agents.md` and `rules/` to keep documentation and prompts in sync.

## License
MIT
