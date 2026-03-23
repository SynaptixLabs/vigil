# Vigil Session Analyst Crew — Design Specification

**Doc ID:** S09-CREW-01 | **Author:** CPTO | **Date:** 2026-03-23
**Status:** DRAFT — External DR required before implementation
**Follows:** AGENTS Platform Crew Creation Guide (Doc 24)
**Crew name:** `vigil-analyst`

---

## Status Legend

| Tag | Meaning |
|-----|---------|
| **PLATFORM RULE** | Inherited from AGENTS platform — non-negotiable |
| **TARGET** | Designed in this spec, not yet validated |
| **FUTURE** | Out of scope for Sprint 09, documented for roadmap |

---

## 1. The Story — Why This Crew Exists

### The Problem

Today, Vigil captures session data (rrweb recordings, screenshots, bugs, features, annotations) but all analysis is **manual**. A QA engineer records a session, manually logs bugs, manually describes features, and manually assigns severity. The AI auto-complete (Sprint 08) helps with individual bug fields, but there is no **holistic session analysis**.

This means:
- Bugs are only as good as the human's attention span
- Visual regressions go unnoticed if the tester doesn't see them
- Interaction patterns (rage clicks, dead ends, confusion loops) are invisible
- The connection between what was recorded and what gets reported is lossy
- Paying users get the same experience as free users

### The Solution

The `vigil-analyst` crew is an AI system that:
1. **Ingests** a complete recorded session (DOM events, screenshots, user-logged bugs/features, annotations, timeline)
2. **Analyzes** the session across multiple dimensions — visual, behavioral, and contextual
3. **Produces** a detailed structured report with findings
4. **Derives** precise, verbose bug reports and feature requests from the analysis — including the user's raw data AND the AI's analysis (so the coding system can act on them)
5. **Proactively discovers** bugs and features the user didn't report — and offers to create them (user consent required)
6. **Runs in the background** — the dashboard notifies the user when analysis is complete
7. **Provides a chat interface** on the generated data — users can ask questions, refine findings, accept/reject suggestions

### Who Benefits

- **Paying users** (Pro/Team/Enterprise) — this is a premium feature
- **Dev teams** receiving Vigil bug reports — they get AI-enriched, precise, actionable reports
- **QA engineers** — their manual work is augmented, not replaced

### Future Crew Expansions (FUTURE — Sprint 10+)

| Crew | Mission | Dependencies |
|------|---------|-------------|
| `vigil-code-reviewer` | Aligns bugs/features with codebase, offers fixes and code snippets | vigil-analyst output |
| `vigil-tracer` | Tracks whether bugs were resolved and features developed | vigil-analyst + git history |
| `vigil-fixer` | Autonomous bug fix agent (extends current vigil_agent) | vigil-analyst + vigil-code-reviewer |

These are **out of scope** for Sprint 09 but the vigil-analyst artifact schemas must be designed to feed them.

---

## 2. Crew Mission

**Mission:** Analyze recorded Vigil sessions (interaction data + visual captures) to produce a comprehensive analysis report, derive precise and verbose bug/feature tickets enriched with AI insights, and proactively discover unreported issues — all running asynchronously in the background with a conversational interface for refinement.

**What makes it different from a single agent:** The analysis requires multiple specialized perspectives (visual, behavioral, contextual) that a single prompt cannot cover without quality collapse. The crew pattern ensures each dimension gets dedicated attention, typed handoffs, and independent quality evaluation.

---

## 3. Operating Modes

| Mode | Name | Who Can Use | Tools Available | SXC Cost |
|------|------|-------------|-----------------|----------|
| 0 | **Quick Scan** | Pro+ | Ingest + Behavioral only → Summary report | ~5 SXC |
| 1 | **Standard Analysis** | Pro+ | Full pipeline without proactive discovery | ~15 SXC |
| 2 | **Deep Analysis** | Team+ | Full pipeline + proactive discovery + chat | ~25 SXC |

Mode 0 is the default for Pro users. Mode 2 is for Team/Enterprise.
Free users see a "Upgrade to unlock AI analysis" prompt.

---

## 4. Crew Roles

| # | Role | Agent Name | Model | Temp | Boundary |
|---|------|-----------|-------|------|----------|
| 1 | **Session Ingestor** | `ingestor` | Code (deterministic) | — | Parses raw session into structured analysis context. Never interprets, never generates text. |
| 2 | **Visual Analyst** | `visual-analyst` | Gemini 2.5 Pro | 0.2 | Analyzes screenshots + DOM snapshots for visual bugs (layout breaks, responsive issues, accessibility). Never analyzes behavior. Uses Gemini's strong vision capabilities for image analysis. |
| 3 | **Behavioral Analyst** | `behavioral-analyst` | Auto (model_router) | 0.2 | Analyzes interaction timeline (click patterns, navigation flow, timing anomalies, rage clicks, dead ends, error sequences). Never analyzes visuals. Model selected by router based on session complexity + cost tier. |
| 4 | **Report Composer** | `composer` | Claude Sonnet 4 | 0.3 | Synthesizes findings from all analysts into a unified structured report. Never invents findings — only organizes and contextualizes what analysts found. |
| 5 | **Ticket Derivation** | `ticket-deriver` | Claude Sonnet 4 | 0.1 | Creates precise, verbose bug and feature tickets from the report. Each ticket includes: user raw data, AI analysis, reproduction steps, severity justification, affected components. Never creates tickets without evidence. |
| 6 | **Proactive Scout** | `proactive-scout` | Claude Opus 4 | 0.3 | Reviews the full session data for issues NOT reported by the user or other agents. Generates candidate bugs/features with confidence scores. Never auto-creates — only suggests (user consent required). |
| 7 | **Quality Judge** | `judge` | Claude Sonnet 4 | 0.0 | Evaluates the complete report + derived tickets for quality, completeness, actionability, and accuracy. Issues SHIP/ITERATE/RESTART verdict. Never produces content — only evaluates. |

**Total: 7 agents (6 + 1 gate)**

### Why These Specific Roles

- **Ingestor is deterministic (code, not LLM):** Session data parsing is structured — rrweb events have fixed schemas, screenshots are files, bugs have known fields. LLM would be wasteful here. `PLATFORM RULE: use code for deterministic steps`
- **Visual Analyst uses Gemini 2.5 Pro:** Best-in-class multimodal vision for screenshot analysis. Stronger at visual spatial reasoning than text-first models. Routed via `model_router` with Gemini as explicit target.
- **Behavioral Analyst uses Auto routing:** Session complexity varies wildly — simple 5-click sessions don't need Opus. The `model_router` selects the optimal model (Groq for fast/simple, Sonnet for standard, Opus for complex multi-page sessions) based on input size + user's cost tier.
- **Visual and Behavioral are separate:** Mixing visual analysis with interaction analysis in one prompt causes attention dilution. Separate agents = each gets full context window for their domain.
- **Proactive Scout uses Opus:** This is the creative, divergent-thinking role — finding what nobody reported requires stronger reasoning. Higher cost justified by higher value.
- **Judge at 0.0 temperature:** Evaluation must be consistent and reproducible.

---

## 5. Artifact Schemas

Every handoff produces a typed artifact. `PLATFORM RULE`

### Artifact Chain

```
SessionData (raw input)
    │
    ▼
┌─────────────────┐
│   Ingestor      │──→ AnalysisContext
└─────────────────┘         │
                    ┌───────┴───────┐
                    ▼               ▼
            ┌──────────────┐ ┌──────────────┐
            │ Visual       │ │ Behavioral   │
            │ Analyst      │ │ Analyst      │
            └──────┬───────┘ └──────┬───────┘
                   │                │
            VisualFindings   BehavioralFindings
                   │                │
                   └───────┬────────┘
                           ▼
                   ┌──────────────┐
                   │  Composer    │──→ AnalysisReport
                   └──────────────┘         │
                           ┌────────────────┤
                           ▼                ▼
                   ┌──────────────┐ ┌──────────────┐
                   │ Ticket       │ │ Proactive    │
                   │ Deriver      │ │ Scout        │
                   └──────┬───────┘ └──────┬───────┘
                          │                │
                   DerivedTickets   ProactiveSuggestions
                          │                │
                          └───────┬────────┘
                                  ▼
                          ┌──────────────┐
                          │    Judge     │──→ QualityVerdict
                          └──────────────┘
                                  │
                                  ▼
                          FinalDeliverable
```

### Schema Definitions

```typescript
// Base provenance (PLATFORM RULE)
interface ArtifactBase {
  schemaVersion: string;
  createdBy: string;          // agent name
  createdAt: string;          // ISO 8601
  parentArtifactIds: string[];
  payloadHash: string;        // SHA-256
  toolName: string;
  model: string;              // or "code" for deterministic
  promptVersion: string;
  confidence: number | null;  // 0.0-1.0
}

// 1. AnalysisContext (Ingestor → all analysts)
interface AnalysisContext extends ArtifactBase {
  sessionId: string;
  sessionMeta: {
    name: string;
    project: string;
    sprint: string;
    duration: number;
    pageCount: number;
    url: string;
  };
  timeline: TimelineEvent[];        // normalized interaction events
  screenshots: ScreenshotRef[];     // URLs + metadata (no base64)
  userBugs: UserBug[];              // bugs the user logged manually
  userFeatures: UserFeature[];      // features the user logged
  annotations: Annotation[];        // user annotations on the page
  domSnapshots: DOMSnapshotRef[];   // key DOM states
  recordingSegments: RecordingSegmentRef[];  // rrweb chunk references
}

// 2. VisualFindings (Visual Analyst → Composer)
interface VisualFindings extends ArtifactBase {
  findings: VisualFinding[];
}
interface VisualFinding {
  id: string;
  type: 'layout_break' | 'responsive_issue' | 'accessibility' | 'visual_regression' | 'style_inconsistency' | 'missing_element';
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  description: string;
  evidence: {
    screenshotId: string;
    boundingBox?: { x: number; y: number; w: number; h: number };
    domSelector?: string;
    comparisonNote?: string;
  };
  confidence: number;
}

// 3. BehavioralFindings (Behavioral Analyst → Composer)
interface BehavioralFindings extends ArtifactBase {
  findings: BehavioralFinding[];
}
interface BehavioralFinding {
  id: string;
  type: 'rage_click' | 'dead_end' | 'confusion_loop' | 'error_sequence' | 'slow_interaction' | 'navigation_anomaly' | 'abandoned_flow';
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  description: string;
  evidence: {
    timelineRange: { start: number; end: number }; // ms from session start
    eventIds: string[];
    url: string;
    patternDescription: string;
  };
  confidence: number;
}

// 4. AnalysisReport (Composer → Ticket Deriver + Scout)
interface AnalysisReport extends ArtifactBase {
  executiveSummary: string;         // 2-3 sentences
  sessionQualityScore: number;      // 0-100 (how buggy is this session?)
  findingsCount: {
    visual: number;
    behavioral: number;
    userReported: number;
    total: number;
  };
  sections: ReportSection[];
  recommendations: string[];
}

// 5. DerivedTickets (Ticket Deriver → Judge)
interface DerivedTickets extends ArtifactBase {
  bugs: DerivedBug[];
  features: DerivedFeature[];
}
interface DerivedBug {
  id: string;
  title: string;
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  severityJustification: string;
  description: string;               // verbose, precise
  stepsToReproduce: string[];
  expected: string;
  actual: string;
  affectedComponent: string;
  affectedUrl: string;
  userRawData: object;               // original user bug data (if exists)
  aiAnalysis: string;                // AI's interpretation and enrichment
  evidence: {
    screenshotIds: string[];
    timelineRange?: { start: number; end: number };
    findingIds: string[];            // references to Visual/Behavioral findings
  };
  source: 'user_reported' | 'ai_derived';
  confidence: number;
}
interface DerivedFeature {
  id: string;
  title: string;
  description: string;
  userRawData: object;
  aiAnalysis: string;
  rationale: string;
  source: 'user_reported' | 'ai_derived';
  confidence: number;
}

// 6. ProactiveSuggestions (Scout → Judge)
interface ProactiveSuggestions extends ArtifactBase {
  suggestedBugs: DerivedBug[];       // same schema, source='ai_derived'
  suggestedFeatures: DerivedFeature[];
  // All suggestions require user consent before creation
  consentRequired: true;             // always true — never auto-create
}

// 7. QualityVerdict (Judge → Final)
interface QualityVerdict extends ArtifactBase {
  verdict: 'SHIP' | 'ITERATE' | 'RESTART';
  scores: {
    completeness: number;     // 1-10: all session data analyzed?
    accuracy: number;         // 1-10: findings match evidence?
    actionability: number;    // 1-10: can a dev act on these tickets?
    verbosity: number;        // 1-10: enough detail for coding system?
    proactiveValue: number;   // 1-10: scout found useful extras?
  };
  totalScore: number;         // /50
  issues: JudgeIssue[];
  iterationTarget?: string;   // which agent to re-run if ITERATE
}
```

### Artifact Dependency Graph (no orphans verified)

| Artifact | Producer | Consumer(s) |
|----------|----------|------------|
| AnalysisContext | ingestor | visual-analyst, behavioral-analyst |
| VisualFindings | visual-analyst | composer |
| BehavioralFindings | behavioral-analyst | composer |
| AnalysisReport | composer | ticket-deriver, proactive-scout |
| DerivedTickets | ticket-deriver | judge |
| ProactiveSuggestions | proactive-scout | judge |
| QualityVerdict | judge | FinalDeliverable (system) |

No orphans. Every artifact has exactly one producer and at least one consumer.

---

## 6. Tools Registration

Every capability = a registered tool. `PLATFORM RULE`

| # | Tool Name | Agent | Required Artifacts | Output Artifact | Side Effect | Est. SXC | Modes |
|---|-----------|-------|-------------------|-----------------|-------------|----------|-------|
| T1 | `ingest_session` | ingestor | SessionData (raw) | AnalysisContext | read_only | 0 | 0,1,2 |
| T2 | `analyze_visuals` | visual-analyst | AnalysisContext | VisualFindings | read_only | 3 | 1,2 |
| T3 | `analyze_behavior` | behavioral-analyst | AnalysisContext | BehavioralFindings | read_only | 3 | 0,1,2 |
| T4 | `compose_report` | composer | VisualFindings + BehavioralFindings | AnalysisReport | read_only | 3 | 0,1,2 |
| T5 | `derive_tickets` | ticket-deriver | AnalysisReport | DerivedTickets | reversible_write | 3 | 0,1,2 |
| T6 | `scout_proactive` | proactive-scout | AnalysisReport + AnalysisContext | ProactiveSuggestions | read_only | 5 | 2 |
| T7 | `judge_quality` | judge | DerivedTickets + ProactiveSuggestions? | QualityVerdict | read_only | 2 | 0,1,2 |
| T8 | `persist_results` | system | QualityVerdict == SHIP | — | irreversible_write | 0 | 0,1,2 |
| T9 | `chat_query` | composer | FinalDeliverable | ChatResponse | read_only | 1/msg | 2 |

---

## 7. Safety Guards

| Guard | Required? | Implementation |
|-------|-----------|---------------|
| Mode tool filtering | YES | Mode 0 hides T2, T6. Mode 1 hides T6. |
| Artifact dependency | YES | T4 requires T2+T3. T5 requires T4. T7 requires T5. |
| Budget ceiling | YES | Mode 0: 10 SXC. Mode 1: 25 SXC. Mode 2: 40 SXC. |
| Iteration cap | YES | Max 2 judge→iterate loops. |
| No auto-create | YES | ProactiveSuggestions NEVER auto-create bugs. User consent mandatory. |
| DAG fallback | YES | If agentic orchestrator fails 3x → switch to sequential pipeline. |
| Loop detection | YES | Same tool called 5x → abort + fallback. |
| PII guard | YES | Strip PII from screenshots before LLM analysis (blur faces, redact form data). |
| Rate limit | YES | Max 3 concurrent analyses per user. |

---

## 8. Quality Gates

| Gate | Type | When | What It Checks |
|------|------|------|---------------|
| **Ingest Verify** | Deterministic | After T1 | Session has >0 events, >0 pages, valid structure |
| **Findings Verify** | Deterministic | After T2+T3 | Every finding has evidence, severity, and confidence |
| **Report Verify** | Deterministic | After T4 | Report references all findings, summary exists, scores present |
| **Ticket Verify** | Deterministic | After T5 | Every ticket has: title, severity, steps, evidence, AI analysis |
| **Quality Judge** | LLM (adversarial) | After T5+T6 | 5-dimension scoring, SHIP/ITERATE/RESTART verdict |

The universal rule: deterministic check first (cheap), then LLM judgment (expensive). `PLATFORM RULE`

---

## 9. Sequential Pipeline (DAG Mode — Primary)

```
Phase 1: Ingest
  T1: ingest_session → AnalysisContext
  Gate: Ingest Verify

Phase 2: Analyze (PARALLEL)
  T2: analyze_visuals → VisualFindings         [Mode 1, 2 only]
  T3: analyze_behavior → BehavioralFindings    [All modes]
  Gate: Findings Verify

Phase 3: Synthesize
  T4: compose_report → AnalysisReport
  Gate: Report Verify

Phase 4: Derive
  T5: derive_tickets → DerivedTickets
  T6: scout_proactive → ProactiveSuggestions   [Mode 2 only]
  Gate: Ticket Verify

Phase 5: Judge
  T7: judge_quality → QualityVerdict
  If ITERATE: re-run Phase 3-4 (max 2x)
  If RESTART: abort, return partial results
  If SHIP: proceed

Phase 6: Persist
  T8: persist_results → Write to Neon DB
  Notify dashboard via WebSocket/polling
```

### Parallel Execution

Phase 2 (T2 + T3) runs in parallel — they share the same input (AnalysisContext) but produce independent outputs. This is the primary performance optimization.

Phase 4 (T5 + T6) can also run in parallel in Mode 2.

---

## 10. Dashboard Integration

### Background Execution Flow

```
User ends session → POST /api/session → vigil-server stores session
                                       → IF user.plan >= 'pro':
                                           Queue analysis job
                                           Return { sessionId, analysisStatus: 'queued' }

Analysis runs in background (AGENTS platform):
  POST /api/v1/vigil/analyze { sessionId, mode, userId }
  → vigil-analyst crew executes
  → On completion: PATCH /api/sessions/:id/analysis { status: 'complete', reportId }

Dashboard polling / WebSocket:
  GET /api/sessions/:id/analysis-status
  → { status: 'queued' | 'running' | 'complete' | 'failed', progress?: number }

When complete:
  Dashboard shows "AI Analysis Ready" badge on session
  User clicks → opens analysis report view
  Chat interface available (Mode 2)
```

### Chat Interface

The chat interface allows users to:
- Ask questions about the analysis ("Why was this classified as P0?")
- Refine findings ("This isn't actually a bug, it's expected behavior")
- Accept/reject proactive suggestions
- Request deeper analysis of specific findings
- Export refined tickets to the bug tracker

Chat uses the `chat_query` tool (T9) with the FinalDeliverable as context.

### User Consent Flow (Proactive Suggestions)

```
Scout finds potential bugs/features not reported by user
  → Stored as ProactiveSuggestions (never auto-created)
  → Dashboard shows "AI Suggestions" section in analysis view
  → Each suggestion has: Accept / Reject / Edit buttons
  → Accept → creates bug/feature in Vigil system
  → Reject → dismissed (logged for quality feedback)
  → Edit → opens editor pre-filled with suggestion, user modifies, then saves
```

---

## 11. Cost Model

| Mode | Agents Used | Est. LLM Calls | Est. SXC | Who Pays |
|------|------------|----------------|----------|----------|
| 0 (Quick) | 4 (ingest, behavioral, composer, deriver) | 3 LLM + 1 judge | ~5 SXC | Pro+ |
| 1 (Standard) | 6 (+ visual analyst) | 5 LLM + 1 judge | ~15 SXC | Pro+ |
| 2 (Deep) | 7 (+ proactive scout) + chat | 6 LLM + 1 judge + chat | ~25 SXC + 1/msg | Team+ |

Cost tracked via AGENTS `resource_manager`. Each tool call logged to `TokenTransaction` for audit.

---

## 12. Integration with AGENTS Platform

The vigil-analyst crew runs on the AGENTS platform (`:8000`), not inside vigil-server.

```
vigil-server                          AGENTS platform
─────────────                         ─────────────────
POST /api/v1/vigil/analyze  ────────→ Queue job
                                      → crew_core.HiveRunner
                                      → vigil-analyst pipeline
                                      → resource_manager tracking
Webhook/poll ←──────────────────────  Job complete callback
GET  /api/v1/vigil/analysis/:id ───→  Return analysis results
POST /api/v1/vigil/chat     ────────→ Chat with analysis context
```

### AGENTS Platform Modules Used

| Module | Usage |
|--------|-------|
| `llm_core` | All LLM calls (Sonnet 4, Opus 4 for scout) |
| `crew_core` | HiveRunner for pipeline execution |
| `tools_core` | Tool registration for T1-T9 |
| `skills_core` | Analysis prompts and domain skills |
| `resource_manager` | SXC cost tracking per analysis |
| `model_router` | Model selection per agent role |

---

## 13. Security Considerations

| Concern | Mitigation |
|---------|------------|
| PII in screenshots | Blur/redact faces + form data before sending to LLM |
| Session data in transit | HTTPS only, no plaintext session data |
| LLM data retention | Use Claude API with zero-retention option |
| User consent for proactive bugs | Never auto-create — explicit accept required |
| Analysis cost abuse | Rate limit: 3 concurrent, budget ceiling per mode |
| Chat injection | Sanitize chat input, constrain to analysis context |

---

## 14. File Organization

Following AGENTS platform convention: `PLATFORM RULE`

```
vigil/
├── docs/sprints/sprint_09/specs/
│   └── SPRINT_09_SPEC_vigil_analyst_crew.md    ← THIS FILE (source of truth)
│
└── [AGENTS project — implementation lives here]
    agents-specs/
      vigil-analyst/
        README.md                     # One-page walkthrough
        README.html                   # Interactive flow visualization
        DR_VIGIL_ANALYST_DESIGN.md    # Design Review (derived from this spec)
        VIGIL_ANALYST_ORCHESTRATOR.md # Orchestrator spec (when agentic mode ships)
        VIGIL_ANALYST_IO_SCHEMAS.md   # Full artifact schemas
```

---

## 15. Crew Creation Checklist (from AGENTS Guide Doc 24)

- [x] Define mission (§2)
- [x] Define operating modes — 3 modes: Quick, Standard, Deep (§3)
- [x] Define crew roles with boundaries (§4)
- [x] Assign tools per role with side-effect classes (§6)
- [ ] Assign skills per role (Sprint 09 implementation task)
- [x] Define artifact schemas with provenance base (§5)
- [x] Map artifact dependency graph — no orphans verified (§5)
- [x] Define quality gates — deterministic + LLM judge (§8)
- [x] Define safety guards — 9 guards (§7)
- [x] Choose orchestration mode — DAG primary, agentic future (§9)
- [ ] Write orchestrator system prompt (Sprint 10 — agentic mode)
- [x] Write Sequential Pipeline (§9)
- [ ] Set feature flag for dual mode (implementation task)
- [ ] Create `agents-specs/vigil-analyst/` folder (implementation task)
- [x] Write DR v1 (this document)
- [ ] Get external review
- [ ] Build HTML visualization
- [ ] Get FOUNDER approval
- [ ] Write sprint kickoff TODOs

---

*S09-CREW-01 | Vigil Session Analyst Crew Spec v1.0 | CPTO | 2026-03-23*
*Following AGENTS Crew Creation Guide (Doc 24)*
