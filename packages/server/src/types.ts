import { z } from 'zod';

// Bug priority levels
export const BugPrioritySchema = z.enum(['P0', 'P1', 'P2', 'P3']);
export type BugPriority = z.infer<typeof BugPrioritySchema>;

// Bug status
export const BugStatusSchema = z.enum(['open', 'in_progress', 'resolved', 'wontfix']);
export type BugStatus = z.infer<typeof BugStatusSchema>;

// Feature type
export const FeatureTypeSchema = z.enum(['ENHANCEMENT', 'NEW_FEATURE', 'UX_IMPROVEMENT']);
export type FeatureType = z.infer<typeof FeatureTypeSchema>;

// Feature status
export const FeatureStatusSchema = z.enum(['open', 'planned', 'in_sprint', 'done']);
export type FeatureStatus = z.infer<typeof FeatureStatusSchema>;

// Bug within a session payload
export const BugSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  type: z.literal('bug'),
  priority: BugPrioritySchema,
  status: BugStatusSchema,
  title: z.string(),
  description: z.string(),
  url: z.string(),
  elementSelector: z.string().optional(),
  screenshotId: z.string().optional(),
  timestamp: z.number(),
});
export type Bug = z.infer<typeof BugSchema>;

// Feature within a session payload
export const FeatureSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  type: z.literal('feature'),
  featureType: FeatureTypeSchema,
  status: FeatureStatusSchema,
  sprintRef: z.string().optional(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  elementSelector: z.string().optional(),
  screenshotId: z.string().optional(),
  timestamp: z.number(),
});
export type Feature = z.infer<typeof FeatureSchema>;

// rrweb chunk
export const RrwebChunkSchema = z.object({
  id: z.number().optional(),
  sessionId: z.string(),
  chunkIndex: z.number(),
  pageUrl: z.string(),
  events: z.array(z.unknown()),
  createdAt: z.number(),
  compressed: z.boolean().optional(),
  data: z.string().optional(),
});

// Recording within a session
export const VIGILRecordingSchema = z.object({
  id: z.string(),
  startedAt: z.number(),
  endedAt: z.number().optional(),
  rrwebChunks: z.array(RrwebChunkSchema),
  mouseTracking: z.boolean(),
});

// Snapshot within a session
export const VIGILSnapshotSchema = z.object({
  id: z.string(),
  capturedAt: z.number(),
  screenshotDataUrl: z.string(),
  url: z.string(),
  triggeredBy: z.enum(['manual', 'bug-editor', 'auto']),
});

// Full session payload from the extension
export const VIGILSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  projectId: z.string(),
  startedAt: z.number(),
  endedAt: z.number().optional(),
  clock: z.number(),
  recordings: z.array(VIGILRecordingSchema),
  snapshots: z.array(VIGILSnapshotSchema),
  bugs: z.array(BugSchema),
  features: z.array(FeatureSchema),
  pendingSync: z.boolean().optional(),
});
export type VIGILSession = z.infer<typeof VIGILSessionSchema>;

// Parsed bug file representation (from filesystem)
export interface BugFile {
  id: string;
  title: string;
  status: string;
  severity: string;
  sprint: string;
  discovered: string;
  stepsToReproduce?: string;
  expected?: string;
  actual?: string;
  regressionTest?: string;
  resolution?: string;
  raw: string;
}

// Parsed feature file representation (from filesystem)
export interface FeatureFile {
  id: string;
  title: string;
  status: string;
  priority: string;
  sprint: string;
  description?: string;
  raw: string;
}

// Regression test status indicators
export const TEST_STATUS = {
  PENDING: '⬜',
  PASSING: '🟢',
  FAILING: '🔴',
  ARCHIVED: '⬜ (archived)',
} as const;

// Bug update schema for PATCH operations
export const BugUpdateSchema = z.object({
  status: BugStatusSchema.optional(),
  severity: BugPrioritySchema.optional(),
  resolution: z.string().optional(),
  regressionTest: z.string().optional(),
});
export type BugUpdate = z.infer<typeof BugUpdateSchema>;
