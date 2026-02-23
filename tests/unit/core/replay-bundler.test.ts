import { describe, it, expect } from 'vitest';
import { generateReplayHtml } from '@core/replay-bundler';
import type { Session, RecordingChunk } from '@shared/types';
import { SessionStatus } from '@shared/types';

const baseSession: Session = {
  id: 'ats-2026-02-22-001',
  name: 'Replay Test Session',
  description: '',
  status: SessionStatus.COMPLETED,
  startedAt: 1_700_000_000_000,
  stoppedAt: 1_700_000_060_000,
  duration: 60_000,
  pages: ['http://localhost:38470/'],
  actionCount: 0,
  bugCount: 0,
  featureCount: 0,
  screenshotCount: 0,
  tags: [],
  recordMouseMove: false,
};

const mockEvents = [
  { type: 4, data: { href: 'http://localhost' }, timestamp: 1000 },
  { type: 2, data: { node: { id: 1 } }, timestamp: 2000 }
];

const mockChunks: RecordingChunk[] = [
  {
    sessionId: baseSession.id,
    chunkIndex: 0,
    pageUrl: 'http://localhost',
    events: mockEvents,
    createdAt: 1000
  }
];

describe('generateReplayHtml', () => {
  it('generates basic HTML structure', async () => {
    const html = await generateReplayHtml(baseSession, mockChunks);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<head>');
    expect(html).toContain('<body>');
    expect(html).toContain(baseSession.name);
  });

  it('embeds session events as JSON', async () => {
    const html = await generateReplayHtml(baseSession, mockChunks);
    expect(html).toContain('"type":4');
  });

  it('includes rrweb-player script tag', async () => {
    const html = await generateReplayHtml(baseSession, mockChunks);
    expect(html).toContain('<script>');
  });

  it('references the player container element', async () => {
    const html = await generateReplayHtml(baseSession, mockChunks);
    expect(html).toContain('id="player"');
  });

  it('includes no-events fallback element', async () => {
    const html = await generateReplayHtml(baseSession, mockChunks);
    expect(html).toContain('id="no-events"');
  });

  it('handles empty chunks array without throwing', async () => {
    const html = await generateReplayHtml(baseSession, []);
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('escapes HTML special chars in session name', async () => {
    const xssSession: Session = { ...baseSession, name: '<script>alert(1)</script>' };
    const html = await generateReplayHtml(xssSession, []);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
