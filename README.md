# SynaptixLabs Vigil — Bug Discovery & Resolution Platform

> Chrome Extension + Express Server + React Dashboard + MCP for AI-native bug management — v2.1.0

---

## What is Vigil?

Vigil is a 3-tier bug discovery and resolution platform that closes the loop between human QA testing and AI-driven fixes.

```
Chrome Extension  →  vigil-server (Express + MCP)  →  Dashboard (React)
  captures bugs        stores in PostgreSQL            manage projects,
  records sessions     exposes MCP tools               view sessions,
  logs features        serves dashboard                track bugs
                       session report API               AI integration
```

**How it works:**

1. **Create a project** in the dashboard (name, current sprint, URL)
2. **Start a session** from the Chrome extension — select a project, name the session, hit record
3. **Capture bugs and features** inline while testing — Vigil records DOM interactions via rrweb
4. **End the session** — the extension POSTs the full session (recordings, bugs, features, screenshots) to vigil-server
5. **Review in the dashboard** — two-panel layout: timeline (left) + canvas (right) with tab-based navigation
6. **Share with AI** — fetch the session report via API or use MCP tools directly from Claude Code
7. **AI resolution** — Claude Code uses MCP tools to read bugs, apply fixes, and close them

**Key capabilities:**

- Record DOM interactions via rrweb across page navigations
- Capture screenshots and log bugs/features inline during testing
- Visual annotation overlay (pins, rectangles, freehand, comments) on the page during sessions
- **GOD MODE** — Vigil UI never interferes with the host app (event isolation, z-index supremacy, auto-resurface)
- Visual replay via rrweb-player in the dashboard
- Project management with sprint tracking (dashboard-first workflow)
- REST API for sessions, bugs, features, and projects
- **Session Report API** — LLM-readable markdown reports of any session
- **MCP server** with 8 tools for Claude Code integration
- Playwright regression test export
- Vercel + Neon PostgreSQL deployment

## Stack

| Layer | Technology |
|-------|-----------|
| **Extension** | Chrome Manifest V3, Vite + CRXJS, React 18, Tailwind CSS, rrweb, IndexedDB (Dexie.js) |
| **Server** | Node.js ≥20, Express, Neon PostgreSQL (`@neondatabase/serverless`), MCP SDK, Zod |
| **Dashboard** | React 18, Vite, Tailwind CSS, rrweb-player |
| **Deployment** | Vercel (serverless) + Neon (PostgreSQL) |

---

## Quick Start

### Prerequisites

- **Node.js** >= 20.11.0
- **Chrome** browser
- **Neon PostgreSQL** account ([neon.tech](https://neon.tech)) — free tier works

### 1. Install

```bash
git clone https://github.com/SynaptixLabs/vigil.git
cd vigil
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@host/dbname?sslmode=require
```

Get your connection string from [Neon Console](https://console.neon.tech).

### 3. Build & Start

```bash
# Build shared types (required first)
npm run build:shared

# Build Chrome extension → dist/
npm run build

# Build dashboard → packages/server/public/
npm run build:dashboard

# Start server (runs migration on first start)
npm run dev:server
# Server starts at http://localhost:7474
# Dashboard at http://localhost:7474/dashboard
```

### 4. Load the Extension

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `dist/` folder

### 5. Create a Project & Start Recording

1. Open the dashboard at **http://localhost:7474/dashboard**
2. Go to the **Projects** tab → create a new project (set name, sprint, URL)
3. Click the Vigil extension icon in Chrome → **New Session**
4. Select your project from the dropdown, click **Start Session**
5. Navigate your app — a floating control bar appears at the bottom
6. Use the control bar or keyboard shortcuts to capture bugs, screenshots, and features
7. Click **End Session** — data syncs to the server automatically
8. View the session in the dashboard

---

## Sharing Sessions with AI

### Session Report API (LLM-readable)

Every session has a shareable markdown report:

```
GET /api/sessions/:id/report
```

Returns a full markdown document with:
- Session metadata (name, project, sprint, duration)
- All bugs (priority, description, URLs)
- All features
- Snapshot metadata (timestamps, URLs — no base64 bloat)
- Annotations
- Recording summary
- Chronological timeline

**Example — share this URL with any LLM:**
```
https://vigil-two.vercel.app/api/sessions/vigil-SESSION-20260322-002/report
```

### MCP Integration (Claude Code)

vigil-server includes a stdio MCP server with 8 tools. Connect it to Claude Code for direct access to all Vigil data.

#### Setup

Add to your Claude Code MCP config (`~/.claude/settings.json` or project `.claude/settings.local.json`):

```json
{
  "mcpServers": {
    "vigil": {
      "command": "npx",
      "args": ["tsx", "packages/server/src/mcp/server.ts"],
      "cwd": "/path/to/vigil"
    }
  }
}
```

Or run manually:
```bash
cd packages/server
npm run mcp
```

#### Available MCP Tools

| Tool | Description |
|------|-------------|
| `vigil_list_sessions` | List session summaries (optional project filter) |
| `vigil_read_session` | Read full session data as structured markdown |
| `vigil_list_bugs` | List bugs by sprint and status |
| `vigil_get_bug` | Read bug details and reproduction steps |
| `vigil_update_bug` | Update bug severity, status, or resolution |
| `vigil_close_bug` | Mark a bug as fixed with resolution notes |
| `vigil_list_features` | List features by sprint |
| `vigil_get_feature` | Read feature details |

#### Example Claude Code usage

```
> Use vigil to list all bugs from the latest session
> Read session vigil-SESSION-20260322-002 and summarize the bugs found
> Close bug BUG-035 with resolution "Fixed in commit abc123"
```

### Dashboard (shareable link)

```
https://vigil-two.vercel.app/dashboard/
```

Navigate to Sessions → click a session to view the two-panel detail view with timeline, recording player, bugs, screenshots, and annotations.

---

## Development

Run these in separate terminals for watch mode:

```bash
# Terminal 1: Extension (Vite + CRXJS watch build)
npm run dev

# Terminal 2: Server (nodemon + tsx, port 7474)
npm run dev:server

# Terminal 3: Dashboard (Vite dev server)
npm run dev:dashboard
```

Reload the extension at `chrome://extensions` after each extension build.

### Port Map

| Port | Service |
|------|---------|
| 7474 | vigil-server (REST API + MCP + Dashboard) |
| 5173 | Vite HMR (extension dev) |
| 3900 | Demo app (TaskPilot) |
| 3847 | QA target app (E2E tests) |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Toggle recording (pause / resume) |
| `Ctrl+Shift+S` | Capture screenshot |
| `Alt+Shift+G` | Open inline bug/feature editor |
| `Alt+Shift+B` | Toggle recording (alternative) |

---

## API Endpoints

All endpoints are served by vigil-server at `http://localhost:7474`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Server health check |
| `POST` | `/api/session` | Receive a completed session from extension |
| `GET` | `/api/sessions` | List all sessions (`?project=X&sprint=Y`) |
| `GET` | `/api/sessions/:id` | Get session detail (full JSON) |
| `GET` | `/api/sessions/:id/report` | **Session report (LLM-readable markdown)** |
| `DELETE` | `/api/sessions/:id` | Archive a session |
| `PATCH` | `/api/sessions/:id/restore` | Restore archived session |
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create a project |
| `PATCH` | `/api/projects/:id` | Update a project |
| `DELETE` | `/api/projects/:id` | Archive a project |
| `GET` | `/api/bugs` | List bugs (by sprint) |
| `PATCH` | `/api/bugs/:id` | Update a bug |
| `GET` | `/api/features` | List features (by sprint) |
| `GET` | `/api/sprints` | List available sprints |

---

## Project Structure

```
vigil/
├── src/                        # Chrome Extension source
│   ├── background/             # Service worker (session lifecycle, messaging)
│   ├── content/                # Content script (rrweb, control bar, bug editor, annotations)
│   ├── sidepanel/              # Side panel (session list, new session form)
│   ├── core/                   # Business logic (IndexedDB, reports, codegen)
│   └── shared/                 # Types, constants, utilities
├── packages/
│   ├── server/                 # vigil-server (Express + MCP)
│   │   ├── src/routes/         # REST endpoints (sessions, bugs, projects)
│   │   ├── src/mcp/            # MCP server + tool definitions (8 tools)
│   │   ├── src/storage/        # Neon + filesystem storage providers
│   │   └── src/db/             # Schema, migrations, seed
│   ├── dashboard/              # React management dashboard
│   │   └── src/views/          # Two-panel session detail, project list
│   └── shared/                 # Shared types + Zod schemas
├── tests/
│   ├── unit/                   # Unit tests (Vitest, 267 tests)
│   ├── integration/            # Integration tests (Vitest)
│   └── e2e/                    # E2E + regression tests (Playwright)
├── demos/
│   └── refine-demo-app/        # TaskPilot — manual QA demo app
├── docs/                       # Architecture, sprint artifacts
├── dist/                       # Extension build output
└── vigil.config.json           # Project configuration (no secrets)
```

---

## Configuration

### `vigil.config.json`

Committed to Git. No secrets.

| Field | Description | Default |
|-------|-------------|---------|
| `projectId` | Default project identifier | `"my-project"` |
| `sprintCurrent` | Active sprint number | `"07"` |
| `serverPort` | vigil-server port | `7474` |
| `serverUrl` | Production server URL | — |
| `llmMode` | LLM mode (`"mock"` or `"live"`) | `"mock"` |
| `agentsApiUrl` | AGENTS platform URL | `"http://localhost:8000"` |
| `maxFixIterations` | Max AI fix attempts per bug | `3` |

### Environment Variables

Set in `.env` (project root):

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL pooled connection string |
| `DATABASE_URL_UNPOOLED` | No | Direct connection for migrations |

---

## Testing

```bash
# Unit + integration tests (267 tests)
npx vitest run

# E2E tests (requires built dist/ + target app)
npx playwright test

# Full suite
npm run test:all

# Type check
npx tsc --noEmit
```

---

## Deployment

### Vercel (production)

```bash
npx vercel --prod
```

The server deploys as a Vercel serverless function. Dashboard is served as static files. Database is Neon PostgreSQL.

**Live instance:** `https://vigil-two.vercel.app`

---

## Sprint Status

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 00 | Repo setup, scaffold, hello-world extension | Done |
| Sprint 01 | P0 MVP: Session recording, control bar, screenshots, bug editor | Done |
| Sprint 02 | Reports, replay, Playwright export, ZIP, shortcuts | Done |
| Sprint 03 | P2 features, project folder, bug/feature workflow | Done |
| Sprint 04 | AI workflows, project dashboard, compression | Done |
| Sprint 05 | Full design review, bug fixes, codebase hardening | Done |
| Sprint 06 | vigil-server (Express + MCP), React dashboard, Neon PostgreSQL | Done |
| Sprint 07 | Dashboard-first projects, annotation overlay, Vercel deployment | Done |
| Sprint 08 | Session resilience, GOD MODE, dashboard redesign, LLM API, MCP tools | Active |

---

## Distribution

**Unpacked extension only** — no Chrome Web Store submission. Share via repo `dist/` folder. Team members load via `chrome://extensions` → "Load unpacked".

The server can be self-hosted or deployed to Vercel (serverless).

## Documentation

Start here: [`docs/00_INDEX.md`](docs/00_INDEX.md)

---

*SynaptixLabs — 2026*
