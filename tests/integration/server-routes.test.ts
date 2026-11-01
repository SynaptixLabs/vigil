/**
 * S07-22 — HTTP Route Integration Tests
 * Tests all vigil-server routes via supertest with mocked storage.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';

// vi.hoisted ensures mockStorage is initialized before vi.mock factories run
const { mockStorage } = vi.hoisted(() => ({
  mockStorage: {
    name: 'mock',
    // Projects
    listProjects: vi.fn(),
    getProject: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    // Bugs
    listBugs: vi.fn(),
    getBug: vi.fn(),
    writeBug: vi.fn(),
    updateBug: vi.fn(),
    closeBug: vi.fn(),
    updateReview: vi.fn(),
    // Features
    listFeatures: vi.fn(),
    getFeature: vi.fn(),
    writeFeature: vi.fn(),
    // Sessions
    writeSessionJson: vi.fn(),
    listSessions: vi.fn(),
    getSession: vi.fn(),
    getSessionTicket: vi.fn(),
    deleteSession: vi.fn(),
    // Archive / Restore
    archiveProject: vi.fn(),
    restoreProject: vi.fn(),
    archiveSession: vi.fn(),
    restoreSession: vi.fn(),
    archiveBug: vi.fn(),
    restoreBug: vi.fn(),
    archiveFeature: vi.fn(),
    restoreFeature: vi.fn(),
    // Counters
    nextBugId: vi.fn(),
    nextFeatId: vi.fn(),
    currentBugCount: vi.fn(),
    currentFeatCount: vi.fn(),
    // Sprints
    listSprints: vi.fn(),
  },
}));

vi.mock('../../packages/server/src/storage/index.js', () => ({
  initStorage: vi.fn().mockResolvedValue(mockStorage),
  getStorage: vi.fn(() => mockStorage),
}));

vi.mock('../../packages/server/src/db/client.js', () => ({
  isDatabaseConfigured: vi.fn(() => false),
  getPool: vi.fn(),
}));

vi.mock('../../packages/server/src/config.js', () => ({
  loadConfig: vi.fn(() => ({
    projectId: 'test-project',
    sprintCurrent: '07',
    serverPort: 7474,
    maxFixIterations: 3,
    llmMode: 'mock',
    agentsApiUrl: 'http://localhost:8000',
  })),
  getProjectRoot: vi.fn(() => '/tmp/vigil-test'),
  getVigilDataDir: vi.fn(() => '/tmp/vigil-test/.vigil'),
}));

import { app } from '../../packages/server/src/app.js';

// ── Fixtures ──

function makeValidSessionPayload() {
  return {
    id: 'vigil-SESSION-20260301-001',
    projectId: 'test-project',
    sprint: '07',
    name: 'Test Session',
    startedAt: Date.now() - 60000,
    endedAt: Date.now(),
    clock: 60000,
    recordings: [],
    snapshots: [],
    bugs: [],
    features: [],
  };
}

function makeBugFile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'BUG-001',
    title: 'Test bug',
    status: 'OPEN',
    severity: 'P2',
    sprint: '07',
    discovered: '2026-03-01 via test',
    raw: '# BUG-001 — Test bug',
    archivedAt: null,
    ...overrides,
  };
}

function makeFeatureFile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'FEAT-001',
    title: 'Test feature',
    status: 'OPEN',
    priority: 'ENHANCEMENT',
    sprint: '07',
    raw: '# FEAT-001 — Test feature',
    archivedAt: null,
    ...overrides,
  };
}

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    id: 'vigil-SESSION-20260301-001',
    projectId: 'test-project',
    sprint: '07',
    name: 'Test Session',
    startedAt: Date.now() - 60000,
    endedAt: Date.now(),
    clock: 60000,
    recordings: [],
    snapshots: [],
    bugs: [],
    features: [],
    annotations: [],
    ...overrides,
  };
}

// ── Tests ──

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /health', () => {
  it('returns 200 with correct shape', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('storage');
    expect(res.body).toHaveProperty('llmMode');
    expect(res.body).toHaveProperty('port');
  });

  it('reports mock storage name', async () => {
    const res = await request(app).get('/health');
    expect(res.body.storage).toBe('mock');
  });
});

describe('POST /api/session', () => {
  it('accepts valid session payload', async () => {
    mockStorage.getProject.mockResolvedValue({ id: 'test-project', name: 'Test' });
    mockStorage.writeSessionJson.mockResolvedValue('vigil-SESSION-20260301-001');
    const payload = makeValidSessionPayload();
    const res = await request(app).post('/api/session').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('sessionId');
    expect(res.body).toHaveProperty('bugsWritten', 0);
    expect(res.body).toHaveProperty('featuresWritten', 0);
  });

  it('writes bugs from session payload', async () => {
    mockStorage.getProject.mockResolvedValue({ id: 'test-project', name: 'Test' });
    mockStorage.writeSessionJson.mockResolvedValue('vigil-SESSION-20260301-001');
    mockStorage.writeBug.mockResolvedValue('BUG-001');
    const payload = makeValidSessionPayload();
    payload.bugs = [{
      id: 'temp-1',
      sessionId: payload.id,
      type: 'bug',
      title: 'Test bug',
      description: 'A test bug',
      priority: 'P2',
      status: 'open',
      url: 'http://localhost:3000',
      screenshotId: '',
      timestamp: Date.now(),
    }] as never[];
    const res = await request(app).post('/api/session').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.bugsWritten).toBe(1);
    expect(res.body.bugIds).toHaveLength(1);
  });

  it('rejects session with non-existent project', async () => {
    mockStorage.getProject.mockResolvedValue(null);
    const payload = makeValidSessionPayload();
    payload.projectId = 'no-such-project';
    const res = await request(app).post('/api/session').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('does not exist');
  });

  it('rejects invalid payload with 400', async () => {
    const res = await request(app).post('/api/session').send({ bad: 'data' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 500 on storage error', async () => {
    mockStorage.getProject.mockResolvedValue({ id: 'test-project', name: 'Test' });
    mockStorage.writeSessionJson.mockRejectedValue(new Error('DB down'));
    const payload = makeValidSessionPayload();
    const res = await request(app).post('/api/session').send(payload);
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('retries one F2 bug without replacing the original session or changing its ticket ID', async () => {
    mockStorage.writeSessionJson.mockReset().mockResolvedValue('stored');
    mockStorage.getSession.mockReset();
    const payload = makeValidSessionPayload();
    payload.id = 'hs-f2-admin-550e8400-e29b-41d4-a716-446655440000';
    payload.bugs = [{ id: 'source-bug', sessionId: payload.id, type: 'bug', priority: 'P2',
      status: 'open', title: 'A bug', description: 'A bug', url: '/he/hs-admin/today',
      timestamp: 100 }] as never[];
    mockStorage.getProject.mockResolvedValue({ id: 'test-project', name: 'Test' });
    mockStorage.getSession.mockResolvedValueOnce(null).mockResolvedValueOnce({ ...payload, annotations: [] });
    mockStorage.writeBug.mockResolvedValue('BUG-012');

    const first = await request(app).post('/api/session').send(payload);
    const second = await request(app).post('/api/session').send({ ...payload, startedAt: Date.now() });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(first.body.bugIds).toEqual(['BUG-012']);
    expect(second.body.bugIds).toEqual(['BUG-012']);
    expect(mockStorage.writeSessionJson).toHaveBeenCalledTimes(1);
  });

  it('keeps an F2 partial write retryable and rejects changed content for the same ID', async () => {
    mockStorage.writeSessionJson.mockReset().mockResolvedValue('stored');
    mockStorage.getSession.mockReset();
    mockStorage.writeFeature.mockReset();
    const payload = makeValidSessionPayload();
    payload.id = 'hs-f2-admin-550e8400-e29b-41d4-a716-446655440001';
    payload.features = [{ id: 'source-feature', sessionId: payload.id, type: 'feature',
      featureType: 'NEW_FEATURE', status: 'open', title: 'A feature',
      description: 'A feature', url: '/he/hs-admin/today', timestamp: 100 }] as never[];
    mockStorage.getProject.mockResolvedValue({ id: 'test-project', name: 'Test' });
    mockStorage.getSession.mockResolvedValueOnce(null).mockResolvedValue({ ...payload, annotations: [] });
    mockStorage.writeFeature.mockRejectedValueOnce(new Error('filesystem busy')).mockResolvedValue('FEAT-012');

    const first = await request(app).post('/api/session').send(payload);
    const conflict = await request(app).post('/api/session').send({ ...payload,
      features: [{ ...payload.features[0], description: 'changed' }] });
    const retry = await request(app).post('/api/session').send(payload);

    expect(first.status).toBe(503);
    expect(conflict.status).toBe(409);
    expect(retry.status).toBe(201);
    expect(retry.body.featIds).toEqual(['FEAT-012']);
    expect(mockStorage.writeSessionJson).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/session/receipt/:id', () => {
  it('returns only the canonical F2 reference after the normalized write', async () => {
    const id = 'hs-f2-admin-550e8400-e29b-41d4-a716-446655440002';
    mockStorage.getSession.mockResolvedValue(makeSession({ id, snapshots: [{ screenshotDataUrl: 'private' }] }));
    mockStorage.getSessionTicket.mockResolvedValue({ kind: 'bug', id: 'BUG-013' });
    const response = await request(app).get(`/api/session/receipt/${id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ kind: 'bug', id: 'BUG-013', sessionId: id,
      projectId: 'test-project', sprint: '07' });
    expect(JSON.stringify(response.body)).not.toContain('private');
  });
});

describe('GET /api/sessions', () => {
  it('returns empty session list', async () => {
    mockStorage.listSessions.mockResolvedValue([]);
    const res = await request(app).get('/api/sessions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sessions');
    expect(res.body.sessions).toEqual([]);
  });

  it('returns session summaries', async () => {
    mockStorage.listSessions.mockResolvedValue([makeSession()]);
    const res = await request(app).get('/api/sessions');
    expect(res.status).toBe(200);
    expect(res.body.sessions).toHaveLength(1);
    expect(res.body.sessions[0]).toHaveProperty('id');
    expect(res.body.sessions[0]).toHaveProperty('name');
  });

  it('passes query params to storage', async () => {
    mockStorage.listSessions.mockResolvedValue([]);
    await request(app).get('/api/sessions?project=myproj&sprint=07');
    expect(mockStorage.listSessions).toHaveBeenCalledWith('myproj', '07', false);
  });

  it('returns 500 on storage error', async () => {
    mockStorage.listSessions.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/sessions');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/sessions/:id', () => {
  it('returns session by ID', async () => {
    mockStorage.getSession.mockResolvedValue(makeSession());
    const res = await request(app).get('/api/sessions/vigil-SESSION-20260301-001');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('session');
    expect(res.body.session).toHaveProperty('id');
  });

  it('returns 404 for unknown session', async () => {
    mockStorage.getSession.mockResolvedValue(null);
    const res = await request(app).get('/api/sessions/unknown-id');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 500 on storage error', async () => {
    mockStorage.getSession.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/sessions/test-id');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/bugs', () => {
  it('returns empty bug list', async () => {
    mockStorage.listBugs.mockResolvedValue([]);
    const res = await request(app).get('/api/bugs');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('bugs');
    expect(res.body).toHaveProperty('count', 0);
  });

  it('returns bugs with count', async () => {
    mockStorage.listBugs.mockResolvedValue([makeBugFile(), makeBugFile({ id: 'BUG-002' })]);
    const res = await request(app).get('/api/bugs');
    expect(res.status).toBe(200);
    expect(res.body.bugs).toHaveLength(2);
    expect(res.body.count).toBe(2);
  });

  it('passes query params to storage', async () => {
    mockStorage.listBugs.mockResolvedValue([]);
    await request(app).get('/api/bugs?sprint=06&status=open');
    expect(mockStorage.listBugs).toHaveBeenCalledWith('06', 'open', false);
  });

  it('returns 500 on storage error', async () => {
    mockStorage.listBugs.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/bugs');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/bugs/:id', () => {
  it('returns bug by ID', async () => {
    mockStorage.getBug.mockResolvedValue(makeBugFile());
    const res = await request(app).get('/api/bugs/BUG-001');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'BUG-001');
  });

  it('passes sprint query param', async () => {
    mockStorage.getBug.mockResolvedValue(makeBugFile());
    await request(app).get('/api/bugs/BUG-001?sprint=06');
    expect(mockStorage.getBug).toHaveBeenCalledWith('BUG-001', '06');
  });

  it('returns 404 for unknown bug', async () => {
    mockStorage.getBug.mockResolvedValue(null);
    const res = await request(app).get('/api/bugs/BUG-999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 500 on storage error', async () => {
    mockStorage.getBug.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/bugs/BUG-001');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('PATCH /api/bugs/:id', () => {
  it('updates bug fields', async () => {
    mockStorage.updateBug.mockResolvedValue(true);
    const res = await request(app).patch('/api/bugs/BUG-001').send({ status: 'resolved' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('updated', true);
    expect(res.body).toHaveProperty('bugId', 'BUG-001');
  });

  it('passes sprint query param', async () => {
    mockStorage.updateBug.mockResolvedValue(true);
    await request(app).patch('/api/bugs/BUG-001?sprint=06').send({ severity: 'P1' });
    expect(mockStorage.updateBug).toHaveBeenCalledWith('BUG-001', { severity: 'P1' }, '06');
  });

  it('rejects invalid fields with 400', async () => {
    const res = await request(app).patch('/api/bugs/BUG-001').send({ status: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 when bug not found', async () => {
    mockStorage.updateBug.mockResolvedValue(false);
    const res = await request(app).patch('/api/bugs/BUG-999').send({ status: 'resolved' });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 500 on storage error', async () => {
    mockStorage.updateBug.mockRejectedValue(new Error('fail'));
    const res = await request(app).patch('/api/bugs/BUG-001').send({ status: 'resolved' });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/bugs/:id/close', () => {
  it('closes bug with resolution', async () => {
    mockStorage.closeBug.mockResolvedValue(true);
    const res = await request(app)
      .post('/api/bugs/BUG-001/close')
      .send({ resolution: 'Fixed in commit abc', keepTest: true });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('closed', true);
    expect(res.body).toHaveProperty('bugId', 'BUG-001');
  });

  it('passes sprint query param', async () => {
    mockStorage.closeBug.mockResolvedValue(true);
    await request(app)
      .post('/api/bugs/BUG-001/close?sprint=06')
      .send({ resolution: 'Fixed', keepTest: false });
    expect(mockStorage.closeBug).toHaveBeenCalledWith('BUG-001', 'Fixed', false, '06');
  });

  it('rejects missing resolution', async () => {
    const res = await request(app)
      .post('/api/bugs/BUG-001/close')
      .send({ keepTest: true });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects missing keepTest', async () => {
    const res = await request(app)
      .post('/api/bugs/BUG-001/close')
      .send({ resolution: 'Fixed' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 when bug not found', async () => {
    mockStorage.closeBug.mockResolvedValue(false);
    const res = await request(app)
      .post('/api/bugs/BUG-999/close')
      .send({ resolution: 'Fixed', keepTest: true });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 500 on storage error', async () => {
    mockStorage.closeBug.mockRejectedValue(new Error('fail'));
    const res = await request(app)
      .post('/api/bugs/BUG-001/close')
      .send({ resolution: 'Fixed', keepTest: true });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/features', () => {
  it('returns empty feature list', async () => {
    mockStorage.listFeatures.mockResolvedValue([]);
    const res = await request(app).get('/api/features');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('features');
    expect(res.body).toHaveProperty('count', 0);
  });

  it('returns features with count', async () => {
    mockStorage.listFeatures.mockResolvedValue([makeFeatureFile()]);
    const res = await request(app).get('/api/features');
    expect(res.body.features).toHaveLength(1);
    expect(res.body.count).toBe(1);
  });

  it('passes query params to storage', async () => {
    mockStorage.listFeatures.mockResolvedValue([]);
    await request(app).get('/api/features?sprint=06&status=done');
    expect(mockStorage.listFeatures).toHaveBeenCalledWith('06', 'done', false);
  });

  it('returns 500 on storage error', async () => {
    mockStorage.listFeatures.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/features');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/features/:id', () => {
  it('returns feature by ID', async () => {
    mockStorage.getFeature.mockResolvedValue(makeFeatureFile());
    const res = await request(app).get('/api/features/FEAT-001');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'FEAT-001');
  });

  it('passes sprint query param', async () => {
    mockStorage.getFeature.mockResolvedValue(makeFeatureFile());
    await request(app).get('/api/features/FEAT-001?sprint=06');
    expect(mockStorage.getFeature).toHaveBeenCalledWith('FEAT-001', '06');
  });

  it('returns 404 for unknown feature', async () => {
    mockStorage.getFeature.mockResolvedValue(null);
    const res = await request(app).get('/api/features/FEAT-999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 500 on storage error', async () => {
    mockStorage.getFeature.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/features/FEAT-001');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/sprints', () => {
  it('returns sprint list', async () => {
    mockStorage.listSprints.mockResolvedValue({
      sprints: [{ id: '06', name: 'sprint_06' }, { id: '07', name: 'sprint_07' }],
      current: '07',
    });
    const res = await request(app).get('/api/sprints');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sprints');
    expect(res.body).toHaveProperty('current', '07');
    expect(res.body.sprints).toHaveLength(2);
  });

  it('returns empty sprint list', async () => {
    mockStorage.listSprints.mockResolvedValue({ sprints: [], current: '07' });
    const res = await request(app).get('/api/sprints');
    expect(res.status).toBe(200);
    expect(res.body.sprints).toEqual([]);
  });

  it('returns 500 on storage error', async () => {
    mockStorage.listSprints.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/sprints');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/vigil/suggest', () => {
  it('returns mock suggestion in mock mode', async () => {
    const res = await request(app).post('/api/vigil/suggest').send({});
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('suggestion');
    expect(res.body.suggestion).toHaveProperty('confidence', 0);
    expect(res.body).toHaveProperty('model_used', 'mock');
  });
});

// ── HappySeniors F3: founder review block ──

describe('PATCH review block (F3)', () => {
  const TOKEN = 'test-service-token';
  const auth = { 'x-vigil-service-token': TOKEN };
  beforeEach(() => { vi.clearAllMocks(); process.env.VIGIL_SERVICE_TOKEN = TOKEN; });
  afterEach(() => { delete process.env.VIGIL_SERVICE_TOKEN; delete process.env.VIGIL_CORS_ORIGINS; });

  it('review writes need the service credential; unconfigured refuses', async () => {
    const wrong = await request(app).patch('/api/bugs/BUG-001').set('x-vigil-service-token', 'nope')
      .send({ review: { decision: 'approved' } });
    expect(wrong.status).toBe(401);
    expect((await request(app).patch('/api/features/FEAT-1').send({ review: { decision: 'approved' } })).status).toBe(401);
    delete process.env.VIGIL_SERVICE_TOKEN;
    expect((await request(app).patch('/api/features/FEAT-1').set(auth).send({ review: {} })).status).toBe(503);
    expect(mockStorage.updateReview).not.toHaveBeenCalled();
    expect(mockStorage.updateBug).not.toHaveBeenCalled();
  });

  it('rejects a path-like sprint before storage is touched', async () => {
    for (const sprint of ['..%2F..%2Fetc', '19/../x', 'a'.repeat(33)]) {
      expect((await request(app).get(`/api/bugs?sprint=${sprint}`)).status).toBe(400);
      expect((await request(app).patch(`/api/features/FEAT-1?sprint=${sprint}`).set(auth).send({ review: {} })).status).toBe(400);
    }
    expect((await request(app).get('/api/sessions?sprint=../x')).status).toBe(400);
    expect(mockStorage.listBugs).not.toHaveBeenCalled();
    expect(mockStorage.updateReview).not.toHaveBeenCalled();
  });

  it('CORS allows the configured HS origin and refuses others', async () => {
    process.env.VIGIL_CORS_ORIGINS = 'https://hs.example';
    const ok = await request(app).options('/api/features/FEAT-1').set('Origin', 'https://hs.example')
      .set('Access-Control-Request-Method', 'PATCH');
    expect(ok.headers['access-control-allow-origin']).toBe('https://hs.example');
    const evil = await request(app).options('/api/features/FEAT-1').set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'PATCH');
    expect(evil.headers['access-control-allow-origin']).toBeUndefined();
  });
  const stored = {
    decision: 'approved', founder_comment: 'go', decided_by: 'founder', decided_at: '2026-11-01T10:00:00.000Z',
    work_status: 'queued', implementation_link: null, notified_at: null, updated_at: '2026-11-01T10:00:00.000Z',
  };

  it('patches a bug review only, without touching other bug fields', async () => {
    mockStorage.updateReview.mockResolvedValue(stored);
    const res = await request(app).patch('/api/bugs/BUG-001?sprint=19').set(auth)
      .send({ review: { decision: 'approved', founder_comment: 'go', decided_by: 'founder' } });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ updated: true, bugId: 'BUG-001', review: stored });
    expect(mockStorage.updateBug).not.toHaveBeenCalled();
    expect(mockStorage.updateReview).toHaveBeenCalledWith('bug', 'BUG-001',
      { decision: 'approved', founder_comment: 'go', decided_by: 'founder' }, '19');
  });

  it('patches bug status and review together', async () => {
    mockStorage.updateBug.mockResolvedValue(true);
    mockStorage.updateReview.mockResolvedValue(stored);
    const res = await request(app).patch('/api/bugs/BUG-001').set(auth).send({ status: 'in_progress', review: { work_status: 'in_progress' } });
    expect(res.status).toBe(200);
    expect(mockStorage.updateBug).toHaveBeenCalledWith('BUG-001', { status: 'in_progress' }, undefined);
  });

  it('rejects unknown review fields and server-owned timestamps', async () => {
    for (const review of [{ decided_at: '2026-11-01T10:00:00Z' }, { updated_at: 'x' }, { decision: 'maybe' },
      { implementation_link: 'javascript:alert(1)' }]) {
      const res = await request(app).patch('/api/bugs/BUG-001').set(auth).send({ review });
      expect(res.status).toBe(400);
    }
    expect(mockStorage.updateReview).not.toHaveBeenCalled();
  });

  it('404s when the bug does not exist', async () => {
    mockStorage.updateReview.mockResolvedValue(null);
    const res = await request(app).patch('/api/bugs/BUG-404').set(auth).send({ review: { decision: 'rejected' } });
    expect(res.status).toBe(404);
  });

  it('patches a feature review with the same fields', async () => {
    mockStorage.updateReview.mockResolvedValue({ ...stored, implementation_link: 'https://github.com/o/r/pull/1' });
    const res = await request(app).patch('/api/features/FEAT-002?sprint=19').set(auth)
      .send({ review: { work_status: 'done', implementation_link: 'https://github.com/o/r/pull/1' } });
    expect(res.status).toBe(200);
    expect(res.body.featId).toBe('FEAT-002');
    expect(mockStorage.updateReview).toHaveBeenCalledWith('feature', 'FEAT-002',
      { work_status: 'done', implementation_link: 'https://github.com/o/r/pull/1' }, '19');
  });

  it('feature PATCH accepts the review block only', async () => {
    for (const body of [{ status: 'done' }, { review: { decision: 'approved' }, status: 'done' }, {}]) {
      const res = await request(app).patch('/api/features/FEAT-002').set(auth).send(body);
      expect(res.status).toBe(400);
    }
    mockStorage.updateReview.mockResolvedValue(null);
    expect((await request(app).patch('/api/features/FEAT-404').set(auth).send({ review: {} })).status).toBe(404);
  });

  it('archive and restore still route to their own handlers', async () => {
    mockStorage.archiveFeature.mockResolvedValue(true);
    const res = await request(app).patch('/api/features/FEAT-002/archive');
    expect(res.status).toBe(200);
    expect(mockStorage.updateReview).not.toHaveBeenCalled();
  });
});
