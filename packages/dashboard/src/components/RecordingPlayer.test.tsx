import { render, screen, cleanup } from '@testing-library/react';
import { createRef } from 'react';
import { RecordingPlayer } from './RecordingPlayer';
import type { RecordingPlayerHandle } from './RecordingPlayer';
import type { RecordingItem } from '../types';

/**
 * RecordingPlayer wraps rrweb-player (Svelte component) via a loader module.
 *
 * We mock the loader to avoid the real Svelte component, which crashes in
 * jsdom with synthetic event data (no valid full-snapshot structure).
 */

const mockGoto = vi.fn();
const mockDestroy = vi.fn();

vi.mock('./rrweb-loader', () => ({
  loadRrwebPlayer: vi.fn().mockResolvedValue(
    class MockPlayer {
      goto = mockGoto;
      $destroy = mockDestroy;
      constructor(opts: { target: HTMLElement }) {
        const el = document.createElement('div');
        el.className = 'rr-player';
        el.dataset.testid = 'mock-rrweb-player';
        opts.target.appendChild(el);
      }
    },
  ),
}));

function makeRecording(overrides: Partial<RecordingItem> = {}): RecordingItem {
  return {
    id: 'rec-1',
    startedAt: 1000000,
    endedAt: 1060000,
    rrwebChunks: [
      {
        chunkIndex: 0,
        pageUrl: 'http://localhost',
        events: [
          { type: 4, data: { href: 'http://localhost' }, timestamp: 1000000 },
          { type: 2, data: {}, timestamp: 1000100 },
          { type: 3, data: {}, timestamp: 1001000 },
        ],
        createdAt: 1000000,
      },
    ],
    mouseTracking: true,
    ...overrides,
  };
}

describe('RecordingPlayer', () => {
  afterEach(() => {
    mockGoto.mockClear();
    mockDestroy.mockClear();
    cleanup();
  });

  it('shows "No recording available" when recordings array is empty', () => {
    render(<RecordingPlayer recordings={[]} />);
    expect(screen.getByTestId('recording-player')).toBeInTheDocument();
    expect(
      screen.getByText('No recording available for this session.'),
    ).toBeInTheDocument();
  });

  it('shows "No recording available" when recordings have no chunks', () => {
    const emptyRec: RecordingItem = {
      id: 'rec-empty',
      startedAt: 1000000,
      rrwebChunks: [],
      mouseTracking: false,
    };
    render(<RecordingPlayer recordings={[emptyRec]} />);
    expect(
      screen.getByText('No recording available for this session.'),
    ).toBeInTheDocument();
  });

  it('renders player container header with event count when recordings have events', () => {
    const recording = makeRecording();
    render(<RecordingPlayer recordings={[recording]} />);

    expect(screen.getByTestId('recording-player')).toBeInTheDocument();
    expect(screen.getByText('Session Recording')).toBeInTheDocument();
    expect(screen.getByText(/3 events across 1 recording/)).toBeInTheDocument();
  });

  it('shows combined event count from multiple recordings', () => {
    const rec1 = makeRecording({
      id: 'rec-1',
      rrwebChunks: [
        {
          chunkIndex: 0,
          pageUrl: 'http://localhost',
          events: [{ type: 4, data: {}, timestamp: 2000000 }],
          createdAt: 2000000,
        },
      ],
    });
    const rec2 = makeRecording({
      id: 'rec-2',
      rrwebChunks: [
        {
          chunkIndex: 0,
          pageUrl: 'http://localhost',
          events: [{ type: 4, data: {}, timestamp: 1000000 }],
          createdAt: 1000000,
        },
      ],
    });

    render(<RecordingPlayer recordings={[rec1, rec2]} />);
    expect(screen.getByText(/2 events across 2 recordings/)).toBeInTheDocument();
  });

  it('handles recordings with chunks containing no valid events (shows empty state)', () => {
    const rec: RecordingItem = {
      id: 'rec-bad',
      startedAt: 1000000,
      rrwebChunks: [
        {
          chunkIndex: 0,
          pageUrl: 'http://localhost',
          events: [null, undefined, 'not-an-event', { noTimestamp: true }] as unknown[],
          createdAt: 1000000,
        },
      ],
      mouseTracking: false,
    };

    render(<RecordingPlayer recordings={[rec]} />);
    expect(
      screen.getByText('No recording available for this session.'),
    ).toBeInTheDocument();
  });

  it('exposes goto function via ref that does not throw before player loads', () => {
    const ref = createRef<RecordingPlayerHandle>();
    const recording = makeRecording();
    render(<RecordingPlayer ref={ref} recordings={[recording]} />);

    expect(ref.current).not.toBeNull();
    expect(ref.current!.goto).toBeInstanceOf(Function);
    // Calling goto before player loads should be a safe no-op
    expect(() => ref.current!.goto(5000)).not.toThrow();
  });

  it('loads player and ref goto delegates to player.goto', async () => {
    const ref = createRef<RecordingPlayerHandle>();
    const recording = makeRecording();
    render(<RecordingPlayer ref={ref} recordings={[recording]} />);

    // Wait for the mock loader promise to resolve and player to mount
    await vi.waitFor(() => {
      const container = screen.getByTestId('recording-player');
      expect(container.querySelector('.rr-player')).toBeTruthy();
    });

    ref.current!.goto(12345);
    expect(mockGoto).toHaveBeenCalledWith(12345, false);
  });

  it('applies custom width and height to container style', () => {
    const recording = makeRecording();
    render(<RecordingPlayer recordings={[recording]} width={800} height={600} />);

    const container = screen.getByTestId('recording-player');
    // The inner container has a minHeight = height + 80 for controls area
    const innerDiv = container.querySelector('[style*="min-height"]');
    expect(innerDiv).toBeTruthy();
    expect(innerDiv?.getAttribute('style')).toContain('680');
  });
});
