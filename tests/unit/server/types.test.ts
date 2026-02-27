// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { VIGILSessionSchema, BugSchema, FeatureSchema } from '../../../packages/server/src/types.js';

describe('VIGILSessionSchema', () => {
  const validSession = {
    id: 'vigil-SESSION-20260226-001',
    name: 'Test Session',
    projectId: 'my-project',
    startedAt: 1740000000000,
    endedAt: 1740000060000,
    clock: 60000,
    recordings: [],
    snapshots: [],
    bugs: [],
    features: [],
  };

  it('validates a correct session payload', () => {
    const result = VIGILSessionSchema.safeParse(validSession);
    expect(result.success).toBe(true);
  });

  it('rejects session without required fields', () => {
    const result = VIGILSessionSchema.safeParse({ id: 'test' });
    expect(result.success).toBe(false);
  });

  it('accepts session with bugs and features', () => {
    const session = {
      ...validSession,
      bugs: [
        {
          id: 'temp-1',
          sessionId: 'vigil-SESSION-20260226-001',
          type: 'bug',
          priority: 'P1',
          status: 'open',
          title: 'Test bug',
          description: 'A test',
          url: 'http://localhost',
          timestamp: 1740000030000,
        },
      ],
      features: [
        {
          id: 'temp-2',
          sessionId: 'vigil-SESSION-20260226-001',
          type: 'feature',
          featureType: 'ENHANCEMENT',
          status: 'open',
          title: 'Test feature',
          description: 'A feature',
          url: 'http://localhost',
          timestamp: 1740000045000,
        },
      ],
    };
    const result = VIGILSessionSchema.safeParse(session);
    expect(result.success).toBe(true);
  });

  it('rejects invalid bug priority', () => {
    const result = BugSchema.safeParse({
      id: 'temp',
      sessionId: 'ses',
      type: 'bug',
      priority: 'P5',
      status: 'open',
      title: 'Test',
      description: 'A test',
      url: 'http://localhost',
      timestamp: 123,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid feature type', () => {
    const result = FeatureSchema.safeParse({
      id: 'temp',
      sessionId: 'ses',
      type: 'feature',
      featureType: 'INVALID',
      status: 'open',
      title: 'Test',
      description: 'A test',
      url: 'http://localhost',
      timestamp: 123,
    });
    expect(result.success).toBe(false);
  });
});
