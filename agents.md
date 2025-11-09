# ADPrompt - Root Rules

## CRITICAL: Docker Required

**⚠️ ADPrompt MUST be run using Docker & Docker Compose.** All services (backend, frontend, PostgreSQL) run in containers with hot reload support.

- Start: `make dev` or `docker-compose up -d`
- Logs: `make logs`, `make backend`, `make frontend`
- Stop: `make down`
- See `DOCKER.md` for complete documentation

## CRITICAL: Read Rules Directory

Before implementing features, READ the relevant files in the `rules/` directory:

- **`rules/ai-collaboration.md`** - AI collaboration style and workflow (READ FIRST)
- **`rules/challenge.md`** - Hackathon challenge brief and success criteria
- **`rules/stack.md`** - Technology stack and architecture decisions (includes Docker setup)
- **`rules/structure.md`** - Project file structure and folder organization
- **`rules/documentation.md`** - Documentation rules and JSDoc standards
- **`rules/development.md`** - Development guidelines and best practices

if documents are not present, let's create them.

## Update Rules When Implementing

**MANDATORY:** After implementing features, update relevant rule files if:

### Update `rules/stack.md` when:

- Adding new libraries or dependencies
- Changing architecture patterns
- Modifying performance targets
- Adjusting AI difficulty algorithms

### Update `rules/structure.md` when:

- Creating new major folders
- Changing folder organization
- Adding new route structures
- Modifying build output locations

### Update `rules/documentation.md` when:

- Establishing new documentation patterns
- Changing JSDoc standards
- Adding documentation requirements
- Modifying folder .cursorrules policy

### Update `rules/development.md` when:

- Introducing new coding patterns
- Changing component structure conventions
- Adding development tools or workflows
- Establishing new best practices

## Non-Negotiable Rules

1. **JSDoc in every file** - No exceptions (see `rules/documentation.md`)
2. **Update JSDoc when modifying files** - Keep docs current
3. **Update rule files when needed** - Reflect current project state
4. **Folder .cursorrules only for complex architecture** - Don't over-document
5. **Keep responses concise** - After completing tasks: 1-3 sentences max, no long summaries or celebrations
6. **Terminal tick sound** - Play a tick sound at the very end of each response (after summary) using: `printf '\a'`
7. **No commits without approval** - Never create git commits unless explicitly requested by the user

## Quick Reference

### Tech Stack

- Node.js 20+, TypeScript, Express
- Google AI Studio (Gemini 2.5 Flash, Veo) with separate `GEMINI_API_KEY` / `VEO_API_KEY`
- Postgres for persistence, local `storage/uploads/` for assets
- ffmpeg for frame extraction
- opencv4nodejs + node-vibrant for visual checks/palette extraction
- React + Vite dashboard (shadcn/ui design system) [planned]

### Key Principles

- Multi-agent critique pipeline with orchestrator + specialist agents
- Shared JSON schema for agent outputs and scorecards
- Regeneration loop with watchdog to cap iterations and spend
- Require X-User headers for tenancy; store brand kits + scorecards per user
- Default specialist prompts live in `src/services/critique/agentConfigs.ts`; keep them updated with brand policies
- Campaign briefs require product imagery uploads; Veo generation endpoints live under `/api/generation`
- Generated videos are saved to `storage/uploads/generated` (served at `/uploads/...`) for critique and static serving
- Run `npm run test` (Vitest) before pushes; add cases when adding prompts or aggregation logic
- Avoid `any` in TypeScript; prefer precise types or `unknown` + validation when inference fails

### When in Doubt

1. Read relevant file in `rules/` directory
2. Check existing code patterns
3. Follow code conventions

---

**Note:** This is the root rule file. Detailed guidelines are in the `rules/` directory.
