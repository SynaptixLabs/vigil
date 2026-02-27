import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface VigilConfig {
  projectId: string;
  sprintCurrent: string;
  serverPort: number;
  maxFixIterations: number;
  llmMode: 'mock' | 'live';
  agentsApiUrl: string;
}

const CONFIG_FILENAME = 'vigil.config.json';

function findConfigPath(): string {
  // Walk up from packages/server/ to find vigil.config.json at project root
  let dir = resolve(import.meta.dirname, '..', '..');
  const maxDepth = 5;
  for (let i = 0; i < maxDepth; i++) {
    const candidate = resolve(dir, CONFIG_FILENAME);
    try {
      readFileSync(candidate, 'utf8');
      return candidate;
    } catch {
      dir = resolve(dir, '..');
    }
  }
  throw new Error(`${CONFIG_FILENAME} not found in any parent directory`);
}

let _config: VigilConfig | null = null;

export function loadConfig(): VigilConfig {
  if (_config) return _config;

  const configPath = findConfigPath();
  const raw = JSON.parse(readFileSync(configPath, 'utf8'));

  _config = {
    projectId: raw.projectId ?? 'unknown',
    sprintCurrent: raw.sprintCurrent ?? '06',
    serverPort: raw.serverPort ?? 7474,
    maxFixIterations: raw.maxFixIterations ?? 3,
    llmMode: raw.llmMode ?? 'mock',
    agentsApiUrl: raw.agentsApiUrl ?? 'http://localhost:8000',
  };

  return _config;
}

export function getProjectRoot(): string {
  const configPath = findConfigPath();
  return resolve(configPath, '..');
}

export function getVigilDataDir(): string {
  return resolve(getProjectRoot(), '.vigil');
}

export function getSprintDir(sprint?: string): string {
  const s = sprint ?? loadConfig().sprintCurrent;
  return resolve(getProjectRoot(), 'docs', 'sprints', `sprint_${s}`);
}
