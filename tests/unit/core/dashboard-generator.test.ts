import { describe, it, expect } from 'vitest';
import { generateProjectDashboard } from '@core/dashboard-generator';
import type { Session, Bug } from '@shared/types';
import { SessionStatus, BugPriority } from '@shared/types';

describe('dashboard-generator', () => {
  it('generates valid HTML with session data', () => {
    const sessions: Session[] = [
      {
        id: 'ats-2026-02-22-001',
        name: 'Dashboard Test',
        description: 'Test session',
        status: SessionStatus.COMPLETED,
        tags: [],
        startedAt: 1740235200000, // 2026-02-22
        duration: 120000, // 2m 0s
        pages: ['http://localhost'],
        actionCount: 5,
        bugCount: 1,
        featureCount: 0,
        screenshotCount: 0,
        recordMouseMove: false
      } as Session & { source?: string }
    ];

    const bugs: Bug[][] = [
      [{
        id: 'bug-1',
        sessionId: 'ats-2026-02-22-001',
        type: 'bug',
        priority: BugPriority.P1,
        status: 'open',
        title: 'Broken button',
        description: 'Does not click',
        url: 'http://localhost',
        timestamp: 1740235201000
      }]
    ];

    const html = generateProjectDashboard(sessions, bugs);
    
    // Core HTML structure
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Refine Dashboard');
    
    // Aggregated metrics
    expect(html).toContain('<div class="val">1</div><div class="lbl">Sessions</div>');
    expect(html).toContain('<div class="val" style="color: var(--red)">1</div><div class="lbl">Total Bugs</div>');
    
    // Session row
    expect(html).toContain('Dashboard Test');
    expect(html).toContain('2026-02-22');
    expect(html).toContain('2m 0s');
    
    // Links
    expect(html).toContain('href="./sessions/ats-2026-02-22-001/regression.spec.ts"');
    expect(html).toContain('href="./sessions/ats-2026-02-22-001/replay.html"');
    
    // Inline report iframe
    expect(html).toContain('src="./sessions/ats-2026-02-22-001/report.md"');
  });
});
