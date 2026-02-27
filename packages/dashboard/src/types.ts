// Mirrors server BugFile (packages/server/src/types.ts)
export interface BugItem {
  id: string;
  title: string;
  status: string;       // 'OPEN' | 'FIXED' (from filesystem folder)
  severity: string;     // 'P0' | 'P1' | 'P2' | 'P3'
  sprint: string;
  discovered: string;
  stepsToReproduce?: string;
  expected?: string;
  actual?: string;
  regressionTest?: string;  // raw text from markdown section
  resolution?: string;
}

// Mirrors server FeatureFile (packages/server/src/types.ts)
export interface FeatureItem {
  id: string;
  title: string;
  status: string;       // 'OPEN' | 'DONE' (from filesystem folder)
  priority: string;     // 'P0'-'P3' or 'ENHANCEMENT' etc.
  sprint: string;
  description?: string;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  version?: string;
  llmMode?: string;
}

// For PATCH /api/bugs/:id — mirrors server BugUpdateSchema
export interface BugUpdate {
  status?: 'open' | 'in_progress' | 'resolved' | 'wontfix';
  severity?: 'P0' | 'P1' | 'P2' | 'P3';
  resolution?: string;
  regressionTest?: string;
}
