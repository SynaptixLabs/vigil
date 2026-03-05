/**
 * Agents Platform API Client
 * ===========================
 *
 * Thin client for invoking agents on the SynaptixLabs Agents Platform.
 * Used by Vigil server to forward bug triage/fix requests to pre-configured agents.
 *
 * Requires:
 *   - VIGIL_AGENTS_API_KEY env var (format: sl_agent_...)
 *   - agentsApiUrl in vigil.config.json (default: http://localhost:8000)
 */

import { loadConfig } from './config.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InvokeRequest {
  message: string;
  session_id?: string;
  context?: string;
  model_override?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
}

export interface InvokeResponse {
  request_id: string;
  agent_id: string;
  agent_name: string;
  content: string;
  model: string;
  provider: string;
  usage: TokenUsage;
  latency_ms: number;
  session_id: string;
  stop_reason: string;
}

export interface AgentsClientOptions {
  apiUrl?: string;
  apiKey?: string;
  timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class AgentsClient {
  private apiUrl: string;
  private apiKey: string;
  private timeoutMs: number;

  constructor(options: AgentsClientOptions = {}) {
    const config = loadConfig();
    this.apiUrl = (options.apiUrl ?? config.agentsApiUrl).replace(/\/$/, '');
    this.apiKey = options.apiKey ?? process.env.VIGIL_AGENTS_API_KEY ?? '';
    this.timeoutMs = options.timeoutMs ?? 30_000;
  }

  /**
   * Invoke a pre-configured agent on the platform.
   */
  async invoke(agentId: string, request: InvokeRequest): Promise<InvokeResponse> {
    const url = `${this.apiUrl}/api/v1/platform/agents/${agentId}/invoke`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Agents API ${res.status}: ${body}`);
      }

      return (await res.json()) as InvokeResponse;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Health check on the Agents platform.
   */
  async health(): Promise<{ status: string }> {
    const res = await fetch(`${this.apiUrl}/`);
    return (await res.json()) as { status: string };
  }
}

// Singleton
let _client: AgentsClient | null = null;

export function getAgentsClient(): AgentsClient {
  if (!_client) _client = new AgentsClient();
  return _client;
}
