# ADR S09-003 — Data Governance for AI Analysis

**Status:** APPROVED | **Date:** 2026-03-23 | **Author:** CPTO | **Trigger:** External DR finding U2/U3

---

## Context

External review identified that PII protection and chat security were "hand-wavy." For a public product that processes user session data through AI, we need concrete policy on what gets redacted, where, what's stored, what's logged, and how the chat interface is contained.

## Decision

### 1. Data Classification

| Data Type | Classification | Storage | Sent to LLM? | Retention |
|-----------|---------------|---------|--------------|-----------|
| rrweb DOM events | Internal | Neon (session record) | Behavioral analyst only (text events, no rendered HTML) | 90 days after session |
| Screenshots (raw) | Sensitive | Neon BLOB / object storage | **NO** — only sanitized version | 90 days |
| Screenshots (sanitized) | Internal | Neon BLOB / object storage | YES — to visual analyst | 90 days |
| User-logged bugs/features | Internal | Neon (bugs/features tables) | YES — text only | Indefinite |
| Annotations | Internal | Neon (session record) | YES — text metadata only | 90 days |
| Console errors | Internal | Neon (session record) | YES — to behavioral analyst | 90 days |
| Network requests | Sensitive | Neon (session record) | URL + status code only, **NO request/response bodies** | 90 days |
| Analysis report | Internal | Neon (analysis_results) | For chat context only | Indefinite |
| Chat messages | Internal | Neon (analysis_chat) | YES — user's own messages + analysis context | Indefinite |

### 2. Sanitization Pipeline

Screenshot sanitization runs **server-side before any LLM call**, not at capture time.

```
Raw screenshot (from session)
    │
    ▼
Step 1: Form field redaction
  - Detect <input>, <textarea>, <select> elements via DOM snapshot
  - Overlay solid rectangles on their bounding boxes
  - Redact: password fields, credit card inputs, SSN-pattern fields

Step 2: PII pattern redaction
  - Regex scan OCR text for: email addresses, phone numbers, SSN patterns
  - Overlay redaction rectangles on matches

Step 3: Confidence check
  - If redaction confidence < 0.8 for any region → flag for human review
  - Job proceeds with redacted version but report notes "low-confidence redaction"

Output: Sanitized screenshot (stored separately, original preserved for user viewing)
```

**Failure mode:** If sanitization fails entirely (crash, timeout), the screenshot is **excluded** from AI analysis. The job continues without it. The report notes "N screenshots excluded due to sanitization failure."

### 3. What Gets Stored vs What Gets Sent to LLM

| Artifact | Stored in Vigil DB | Sent to AGENTS/LLM | Notes |
|----------|-------------------|---------------------|-------|
| Raw screenshots | YES | **NO** | User can view their own raw screenshots in dashboard |
| Sanitized screenshots | YES | YES | Visual analyst receives these |
| rrweb event stream | YES | Summarized timeline only | Full stream too large for context window |
| Network request bodies | **NO** — stripped at ingestion | NO | Only URL + method + status + timing stored |
| User cookies/tokens | **NO** — stripped at ingestion | NO | Never stored, never sent |
| Analysis artifacts | YES | Within crew pipeline only | Not sent to external systems |
| Chat conversation | YES | To composer agent for responses | Scoped to analysis context |

### 4. Chat Containment Model

The chat interface (Mode 2, Team+ users) has these security boundaries:

**Input containment:**
- Max message length: 2,000 characters
- Rate limit: 20 messages per analysis session per hour
- Input sanitized: HTML stripped, control characters removed
- No file uploads in chat

**Context containment:**
- Chat agent receives ONLY: the FinalDeliverable artifact + user's message
- Chat agent has NO access to: raw session data, other users' data, system prompts, tool registry
- Chat agent can ONLY: answer questions, explain findings, suggest edits to findings
- Chat agent CANNOT: create bugs/features directly, modify the analysis report, execute tools

**Output containment:**
- Chat responses are text-only (no code execution, no tool calls)
- If user wants to create a bug from chat discussion → explicit "Create Bug" button → separate API call with user confirmation
- All chat-originated edits preserve provenance: `{ editedBy: 'user_via_chat', originalValue, newValue, timestamp }`

**Prompt injection defense:**
- System prompt is hardcoded, never includes user input in instruction position
- User message is always in the `user` role, never in `system` or `assistant`
- Analysis context is provided as a separate `tool_result`, not concatenated with instructions
- If chat agent produces a response that references tools or system internals → filter and return generic error

### 5. Audit Logging

Every AI analysis operation is logged to `analysis_audit_log`:

```sql
CREATE TABLE analysis_audit_log (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        TEXT NOT NULL,
  user_id       TEXT NOT NULL,
  action        TEXT NOT NULL,   -- 'job_created' | 'sanitization_run' | 'llm_call' | 'chat_message' | 'suggestion_accepted' | 'suggestion_rejected' | 'bug_created_from_analysis'
  details       JSONB,           -- action-specific metadata
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Retention & Deletion

- Users can delete their sessions → cascading delete of: analysis jobs, results, chat history, audit log entries
- 90-day auto-cleanup for sessions not attached to active projects
- Analysis results persist as long as the parent session exists
- User account deletion → delete all data (GDPR right to erasure)

## Consequences

- Screenshot sanitization is a blocking step before AI analysis (adds ~2s per screenshot)
- Network request bodies are never stored (privacy-first, reduces storage)
- Chat is read-only on analysis context (no side effects without explicit user action)
- All operations auditable via `analysis_audit_log`
- Raw screenshots preserved for user viewing but never sent to LLM

---

*ADR S09-003 | Data Governance | CPTO | 2026-03-23*
