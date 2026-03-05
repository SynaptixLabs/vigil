import { Router } from 'express';
import { loadConfig } from '../config.js';
import { getAgentsClient } from '../agents-client.js';
import { getStorage } from '../storage/index.js';

export const suggestRouter = Router();

/**
 * POST /api/vigil/suggest
 *
 * Triage a bug via the vigil-router agent on the Agents Platform.
 *
 * Body:
 *   { bug_id?: string, sprint?: string, bug?: object, session_id?: string }
 *
 * - If `bug_id` is provided, fetches from storage.
 * - If `bug` object is provided inline, uses it directly.
 * - In `mock` mode, returns a canned response.
 */
suggestRouter.post('/suggest', async (req, res) => {
  const config = loadConfig();

  if (config.llmMode === 'mock') {
    res.json({
      suggestion: {
        severity: 'medium',
        category: 'ui',
        affected_components: ['mock-component'],
        root_cause_hypothesis: 'Mock mode — no LLM analysis performed',
        fix_strategy: 'needs_investigation',
        estimated_complexity: 'simple',
        confidence: 0.0,
        notes: 'Mock suggestion — set llmMode to "live" for real analysis',
      },
      model_used: 'mock',
      latency_ms: 0,
    });
    return;
  }

  // --- Live mode: forward to Agents Platform ---
  const { bug_id, sprint, bug: inlineBug, session_id } = req.body;

  // Resolve bug data
  let bugData: Record<string, unknown>;

  if (inlineBug) {
    bugData = inlineBug;
  } else if (bug_id) {
    try {
      const stored = await getStorage().getBug(bug_id, sprint);
      if (!stored) {
        res.status(404).json({ error: `Bug ${bug_id} not found` });
        return;
      }
      bugData = stored as unknown as Record<string, unknown>;
    } catch (err) {
      console.error('[vigil-suggest] Failed to fetch bug:', err);
      res.status(500).json({ error: 'Failed to fetch bug from storage' });
      return;
    }
  } else {
    res.status(400).json({ error: 'Provide bug_id or bug object in request body' });
    return;
  }

  // Build prompt for vigil-router agent
  const prompt = formatBugPrompt(bugData);

  // Get agent ID from env (set during seed)
  const routerAgentId = process.env.VIGIL_ROUTER_AGENT_ID;
  if (!routerAgentId) {
    res.status(503).json({
      error: 'VIGIL_ROUTER_AGENT_ID not configured. Run seed first.',
    });
    return;
  }

  try {
    const client = getAgentsClient();
    const response = await client.invoke(routerAgentId, {
      message: prompt,
      session_id: session_id ?? `vigil-triage-${bug_id ?? 'inline'}`,
      context: `Project: ${config.projectId}, Sprint: ${config.sprintCurrent}`,
    });

    // Try to parse structured JSON from agent response
    let suggestion: unknown;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      suggestion = jsonMatch ? JSON.parse(jsonMatch[0]) : response.content;
    } catch {
      suggestion = response.content;
    }

    res.json({
      suggestion,
      model_used: response.model,
      provider: response.provider,
      latency_ms: response.latency_ms,
      usage: response.usage,
      session_id: response.session_id,
    });
  } catch (err) {
    console.error('[vigil-suggest] Agent invocation failed:', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: `Agent invocation failed: ${message}` });
  }
});

/**
 * Format a bug object into a natural-language prompt for the vigil-router agent.
 */
function formatBugPrompt(bug: Record<string, unknown>): string {
  const lines: string[] = ['Analyze the following bug report and provide a structured triage assessment:\n'];

  if (bug.title) lines.push(`**Title:** ${bug.title}`);
  if (bug.description) lines.push(`**Description:** ${bug.description}`);
  if (bug.priority) lines.push(`**Reported Priority:** ${bug.priority}`);
  if (bug.status) lines.push(`**Current Status:** ${bug.status}`);
  if (bug.url) lines.push(`**URL:** ${bug.url}`);
  if (bug.elementSelector) lines.push(`**Element:** ${bug.elementSelector}`);
  if (bug.stepsToReproduce) lines.push(`**Steps to Reproduce:** ${bug.stepsToReproduce}`);
  if (bug.expected) lines.push(`**Expected:** ${bug.expected}`);
  if (bug.actual) lines.push(`**Actual:** ${bug.actual}`);

  lines.push('\nRespond with your structured JSON assessment.');

  return lines.join('\n');
}
