import { z } from 'zod';

// ── Enums ────────────────────────────────────────────────────────────────────

export const BugPrioritySchema = z.enum(['P0', 'P1', 'P2', 'P3']);
export type BugPriority = z.infer<typeof BugPrioritySchema>;
export const BugPriority = BugPrioritySchema.enum;

export const BugStatusSchema = z.enum(['open', 'in_progress', 'resolved', 'wontfix']);
export type BugStatus = z.infer<typeof BugStatusSchema>;
export const BugStatus = BugStatusSchema.enum;

export const FeatureTypeSchema = z.enum(['ENHANCEMENT', 'NEW_FEATURE', 'UX_IMPROVEMENT']);
export type FeatureType = z.infer<typeof FeatureTypeSchema>;
export const FeatureType = FeatureTypeSchema.enum;

export const FeatureStatusSchema = z.enum(['open', 'planned', 'in_sprint', 'done']);
export type FeatureStatus = z.infer<typeof FeatureStatusSchema>;
export const FeatureStatus = FeatureStatusSchema.enum;

// ── Wire-format schemas (ext → server) ──────────────────────────────────────

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

export const RrwebChunkSchema = z.object({
  chunkIndex: z.number(),
  pageUrl: z.string(),
  events: z.array(z.unknown()),
  createdAt: z.number(),
  compressed: z.boolean().optional(),
  data: z.string().optional(),
});
export type RrwebChunk = z.infer<typeof RrwebChunkSchema>;

export const VIGILRecordingSchema = z.object({
  id: z.string(),
  startedAt: z.number(),
  endedAt: z.number().optional(),
  rrwebChunks: z.array(RrwebChunkSchema),
  mouseTracking: z.boolean(),
});
export type VIGILRecording = z.infer<typeof VIGILRecordingSchema>;

export const VIGILSnapshotSchema = z.object({
  id: z.string(),
  capturedAt: z.number(),
  screenshotDataUrl: z.string(),
  url: z.string(),
  triggeredBy: z.enum(['manual', 'bug-editor', 'auto']),
});
export type VIGILSnapshot = z.infer<typeof VIGILSnapshotSchema>;

// ── Annotations (Sprint 07 — visual markup) ─────────────────────────────────

export const AnnotationKindSchema = z.enum(['comment', 'rectangle', 'circle', 'freehand']);
export type AnnotationKind = z.infer<typeof AnnotationKindSchema>;

export const AnnotationSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  kind: AnnotationKindSchema,
  rect: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() }).optional(),
  circle: z.object({ cx: z.number(), cy: z.number(), rx: z.number(), ry: z.number() }).optional(),
  freehand: z.object({ pathData: z.string() }).optional(),
  comment: z.object({ x: z.number(), y: z.number() }).optional(),
  commentEntityType: z.enum(['bug', 'feature']).optional(),
  commentText: z.string().optional(),
  linkedEntityId: z.string().optional(),
  color: z.string(),
  strokeWidth: z.number(),
  pageUrl: z.string(),
  elementSelector: z.string().optional(),
  viewportWidth: z.number(),
  viewportHeight: z.number(),
  scrollX: z.number(),
  scrollY: z.number(),
  timestamp: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type Annotation = z.infer<typeof AnnotationSchema>;

export const VIGILSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  projectId: z.string(),
  sprint: z.string().optional(),
  description: z.string().optional(),
  startedAt: z.number(),
  endedAt: z.number().optional(),
  clock: z.number(),
  recordings: z.array(VIGILRecordingSchema),
  snapshots: z.array(VIGILSnapshotSchema),
  bugs: z.array(BugSchema),
  features: z.array(FeatureSchema),
  annotations: z.array(AnnotationSchema).default([]),
  pendingSync: z.boolean().optional(),
});
export type VIGILSession = z.infer<typeof VIGILSessionSchema>;

// ── Mutation schemas ─────────────────────────────────────────────────────────

export const BugUpdateSchema = z.object({
  status: BugStatusSchema.optional(),
  severity: BugPrioritySchema.optional(),
  resolution: z.string().optional(),
  regressionTest: z.string().optional(),
});
export type BugUpdate = z.infer<typeof BugUpdateSchema>;

// ── Founder review block (HappySeniors F3) ──────────────────────────────────
// One optional `review` block on a bug or feature in the SAME store: the
// founder's decision and comment, and the implementer's work status + link.

export const ReviewDecisionSchema = z.enum(['pending', 'approved', 'rejected']);
export type ReviewDecision = z.infer<typeof ReviewDecisionSchema>;
export const ReviewWorkStatusSchema = z.enum(['queued', 'in_progress', 'done']);
export type ReviewWorkStatus = z.infer<typeof ReviewWorkStatusSchema>;

export interface TicketReview {
  decision: ReviewDecision;
  founder_comment: string | null;
  decided_by: string | null;
  decided_at: string | null;
  work_status: ReviewWorkStatus | null;
  implementation_link: string | null;
  notified_at: string | null;
  updated_at: string;
}

const httpLink = z.string().max(500).refine((value) => {
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password;
  } catch {
    return false;
  }
}, 'implementation_link must be an http(s) URL');

/** PATCH body for a ticket's review block. Only these fields; `decided_at` and
 * `updated_at` are server-set. `notified_at` is set-once (first write wins). */
export const TicketReviewPatchSchema = z.object({
  decision: ReviewDecisionSchema.optional(),
  founder_comment: z.string().max(4000).nullable().optional(),
  decided_by: z.string().max(200).nullable().optional(),
  work_status: ReviewWorkStatusSchema.nullable().optional(),
  implementation_link: httpLink.nullable().optional(),
  notified_at: z.string().datetime({ offset: true }).nullable().optional(),
}).strict();
export type TicketReviewPatch = z.infer<typeof TicketReviewPatchSchema>;

const REVIEW_FIELDS = ['decision', 'founder_comment', 'decided_by', 'work_status', 'implementation_link'] as const;

/** Apply a review patch. Idempotent: the same patch applied twice changes
 * nothing the second time (no timestamp moves). An approval with no work
 * status queues the ticket; a rejection clears the work status. */
export function applyReviewPatch(
  current: TicketReview | null | undefined,
  patch: TicketReviewPatch,
  now: string,
): { review: TicketReview; changed: boolean } {
  const review: TicketReview = current ? { ...current } : {
    decision: 'pending', founder_comment: null, decided_by: null, decided_at: null,
    work_status: null, implementation_link: null, notified_at: null, updated_at: now,
  };
  let changed = !current;
  for (const key of REVIEW_FIELDS) {
    const value = patch[key];
    if (value === undefined || review[key] === value) continue;
    (review as unknown as Record<string, unknown>)[key] = value;
    changed = true;
    if (key === 'decision') {
      review.decided_at = value === 'pending' ? null : now;
      if (value === 'approved' && review.work_status === null && patch.work_status === undefined) {
        review.work_status = 'queued';
      }
      if (value === 'rejected' && patch.work_status === undefined) review.work_status = null;
    }
  }
  if (patch.notified_at !== undefined && review.notified_at === null && patch.notified_at !== null) {
    review.notified_at = patch.notified_at;
    changed = true;
  }
  if (changed) review.updated_at = now;
  return { review, changed };
}

/** Parse a stored review block; malformed data reads as no block. */
export function parseStoredReview(value: unknown): TicketReview | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  const decision = ReviewDecisionSchema.safeParse(v.decision);
  if (!decision.success || typeof v.updated_at !== 'string') return null;
  const str = (x: unknown) => (typeof x === 'string' ? x : null);
  const work = ReviewWorkStatusSchema.safeParse(v.work_status);
  return {
    decision: decision.data,
    founder_comment: str(v.founder_comment),
    decided_by: str(v.decided_by),
    decided_at: str(v.decided_at),
    work_status: work.success ? work.data : null,
    implementation_link: str(v.implementation_link),
    notified_at: str(v.notified_at),
    updated_at: v.updated_at,
  };
}

// ── Server/dashboard shared interfaces ───────────────────────────────────────

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
  url?: string;
  regressionTest?: string;
  resolution?: string;
  raw: string;
  archivedAt?: string | null;
  review?: TicketReview | null;
}

export interface FeatureFile {
  id: string;
  title: string;
  status: string;
  priority: string;
  sprint: string;
  description?: string;
  url?: string;
  raw: string;
  archivedAt?: string | null;
  review?: TicketReview | null;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  version?: string;
  storage?: string;
  llmMode?: string;
  port?: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

export const TEST_STATUS = {
  PENDING: '\u2B1C',
  PASSING: '\uD83D\uDFE2',
  FAILING: '\uD83D\uDD34',
  ARCHIVED: '\u2B1C (archived)',
} as const;

// ── Utilities ────────────────────────────────────────────────────────────────

/** Strip `sprint_` prefix to normalize sprint values to bare numbers (e.g. "sprint_10" → "10"). */
export function normalizeSprint(sprint: string): string {
  return sprint.replace(/^sprint_/, '');
}
