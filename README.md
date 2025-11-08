# BrandAI Critique Engine

BrandAI is a hackathon prototype that automates quality control for AI-generated ads. It ingests brand kits, orchestrates Gemini 2.5 Flash specialist agents to critique generated videos, and can trigger Veo regenerations until the output is safe, on-brand, and ready for human approval.

## Features

### ✨ Core Workflow
1. **Brand Kit Ingestion** - Upload logos, palette images, define brand voice, target audience, prohibited phrases
2. **Campaign Creation** - Specify product, audience, tone keywords, upload product imagery
3. **AI Video Generation** - Veo 3.1 creates 5-10 second ad videos from text prompts
4. **Multi-Agent Critique** - 4 specialist Gemini agents analyze each video frame-by-frame
5. **Adaptive Regeneration** - Failed videos trigger new generations with critique feedback incorporated into prompts
6. **Video Gallery** - Browse all generated videos with scores, evidence, and playback
7. **Audit Trail** - Every iteration, scorecard, and decision is persisted for compliance

### 🎯 Key Capabilities
- **Automatic palette extraction** - `node-vibrant` extracts brand colors from uploaded images
- **Frame-by-frame analysis** - ffmpeg extracts frames, Gemini analyzes visual consistency
- **Structured scoring** - Each agent returns 0.0-1.0 scores with concrete evidence and citations
- **Feedback loop** - Prompts adapt based on previous critique (e.g., "BrandFit failed: logo too small")
- **Watchdog protection** - Configurable iteration limit (default: 5) prevents infinite loops and runaway costs
- **User-bound data** - Multi-tenancy with `X-User-Id` header, brand kits scoped per user
- **Video serving** - Generated videos accessible via `/uploads/generated/` URLs
- **Publishing logs** - Track which videos were posted to which platforms (Instagram, TikTok, YouTube)

## Tech Stack

### Backend
- **Node.js 20** + **TypeScript** + **Express** - API server
- **PostgreSQL** - Persistence for users, brand kits, campaigns, scorecards, publish logs
- **Docker & Docker Compose** - Containerized development with hot reload

### AI Models
- **Veo 3.1 (Generate Preview)** - Text-to-video generation (5-10 second ads)
- **Gemini 2.5 Flash** - Powers 4 specialist critique agents

### Critique Agents
1. **BrandFit Agent** - Logo correctness, palette adherence, tone alignment, prohibited phrases
2. **VisualQuality Agent** - Sharpness, lighting, composition, no glitches/watermarks
3. **Safety Agent** - Harmful content, bias, misleading claims, copyright issues
4. **Clarity Agent** - Product understanding, CTA clarity, message alignment

### Video Processing
- **ffmpeg** - Frame extraction from generated videos
- **`fluent-ffmpeg`** - Node.js wrapper for ffmpeg
- **`node-vibrant`** - Automatic color palette extraction from images

### Frontend
- **Next.js 16** (Turbopack) - React framework with server components
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first styling

## Getting Started

### Prerequisites

- **Docker & Docker Compose** (recommended) OR
- Node.js 20+ with Postgres instance (local setup)
- Google AI Studio API keys with access to Gemini 2.5 Flash and Veo endpoints
- ffmpeg (bundled via `@ffmpeg-installer/ffmpeg`)

### Quick Start with Docker (Recommended)

**Step 1: Clone the repository**
```bash
git clone https://github.com/downcaster/adprompt.git
cd adprompt
```

**Step 2: Get Google AI Studio API Keys**

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key (one key works for both Gemini and Veo)
3. Enable the Generative Language API if prompted

**Step 3: Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```env
GEMINI_API_KEY=your_api_key_here
VEO_API_KEY=  # Optional: leave empty to use GEMINI_API_KEY
```

**Step 4: Start all services**
```bash
make dev
# OR: docker-compose up -d
```

This will:
- ✅ Start PostgreSQL database
- ✅ Start Express backend API (port 3000)
- ✅ Start Next.js frontend (port 3001)
- ✅ Auto-create database tables
- ✅ Enable hot reload for development

**Step 5: Access the application**
- **Frontend Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **PostgreSQL**: localhost:5432

**Step 6: View logs (optional)**
```bash
make logs        # All services
make backend     # Backend only
make frontend    # Frontend only
```

**To stop services:**
```bash
make down
```

See [DOCKER.md](./DOCKER.md) for complete Docker documentation and troubleshooting.

### Local Development (Without Docker)

**Prerequisites:**
- Node.js 20+
- PostgreSQL running on localhost:5432
- Google AI Studio API keys

**Step 1: Clone and install dependencies**
```bash
git clone https://github.com/downcaster/adprompt.git
cd adprompt
npm install
cd apps/web && npm install && cd ../..
```

**Step 2: Start PostgreSQL**
```bash
# Using Homebrew (macOS)
brew services start postgresql@14

# OR using Docker
docker run -d \
  --name adprompt-db \
  -e POSTGRES_USER=adprompt \
  -e POSTGRES_PASSWORD=adprompt \
  -e POSTGRES_DB=adprompt \
  -p 5432:5432 \
  postgres:15
```

**Step 3: Configure environment**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
GEMINI_API_KEY=your_api_key_here
VEO_API_KEY=  # Optional
DATABASE_URL=postgresql://adprompt:adprompt@localhost:5432/adprompt
DEFAULT_REGEN_LIMIT=5  # Optional
```

**Step 4: Start backend**
```bash
npm run dev
```

**Step 5: Start frontend (in a new terminal)**
```bash
cd apps/web
npm run dev
```

**Access:**
- Backend: http://localhost:3000
- Frontend: http://localhost:3001

The server auto-creates tables on first run: `users`, `brand_kits`, `campaign_briefs`, `scorecards`, `publish_logs`.

### API Endpoints

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

**With Docker:**
```bash
make test        # Unit tests only
make test-api    # API tests (uses real API keys, consumes quota)
```

**Without Docker:**
```bash
npm test              # Unit tests only
npm run test:api      # API tests (uses real API keys, consumes quota)
npm run test:watch    # Unit tests in watch mode
```

**Note**: API tests make real calls to Google AI Studio and are excluded from `npm test` to prevent accidental quota consumption.

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
storage/
  uploads/        # Uploaded brand assets (gitignored)
  tmp/            # Temporary frame storage (gitignored)
```

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Frontend (Next.js + shadcn/ui)                          │
│  - Brand kit upload                                      │
│  - Campaign creation                                     │
│  - Video gallery with playback                           │
│  - Scorecard visualization                               │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTP (localhost:3001 → 3000)
                     ▼
┌──────────────────────────────────────────────────────────┐
│  Backend (Express API)                                   │
│  - REST endpoints for CRUD operations                    │
│  - File upload handling (multer)                         │
│  - Video serving (/uploads/generated/...)               │
└────────┬────────────────┬────────────────────────────────┘
         │                │
         │                ▼
         │     ┌─────────────────────────────────────┐
         │     │  Veo 3.1 Generate Preview           │
         │     │  (Google AI Studio)                 │
         │     │  - Text-to-video generation         │
         │     │  - 5-10 second ads                  │
         │     └─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│  Multi-Agent Critique Engine                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Orchestrator                                       │  │
│  │ 1. Extract frames with ffmpeg                      │  │
│  │ 2. Call 4 specialist agents in parallel           │  │
│  │ 3. Aggregate scores → pass/fail decision           │  │
│  │ 4. If fail: regenerate with feedback              │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ BrandFit     │ │ VisualQuality│ │ Safety       │    │
│  │ Agent        │ │ Agent        │ │ Agent        │    │
│  │ (Gemini 2.5) │ │ (Gemini 2.5) │ │ (Gemini 2.5) │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│  ┌──────────────┐                                       │
│  │ Clarity      │                                       │
│  │ Agent        │                                       │
│  │ (Gemini 2.5) │                                       │
│  └──────────────┘                                       │
└────────┬─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                     │
│  - users, brand_kits, campaign_briefs                    │
│  - scorecards (with video URLs)                          │
│  - publish_logs                                          │
└──────────────────────────────────────────────────────────┘
```

## Roadmap

- [x] ✅ Veo 3.1 video generation with text prompts
- [x] ✅ Multi-agent critique with 4 specialist Gemini agents
- [x] ✅ Adaptive regeneration loop with feedback incorporation
- [x] ✅ Scorecard persistence in PostgreSQL
- [x] ✅ Video gallery UI with playback
- [x] ✅ Docker setup with hot reload
- [x] ✅ E2E tests for Gemini and Veo APIs
- [ ] OpenCV logo/palette similarity scoring
- [ ] Instagram Graph API integration for publishing
- [ ] CI/CD pipeline with automated tests
- [ ] Video quality metrics (resolution, bitrate analysis)
- [ ] A/B testing framework for prompt variations

## Contributing

Pull requests welcome during the hackathon. Follow the rules in `agents.md` and `rules/` to keep documentation and prompts in sync.

## License

MIT
