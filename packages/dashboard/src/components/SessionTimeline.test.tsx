import { render, screen, fireEvent } from '@testing-library/react';
import { SessionTimeline } from './SessionTimeline';
import type { SessionDetail } from '../types';

function makeSession(overrides: Partial<SessionDetail> = {}): SessionDetail {
  return {
    id: 'sess-1',
    project: 'vigil',
    sprint: '07',
    name: 'test-session',
    startedAt: 1000000,
    endedAt: 1060000,
    clock: 60000,
    recordings: [],
    snapshots: [],
    bugs: [],
    features: [],
    ...overrides,
  };
}

describe('SessionTimeline', () => {
  it('renders empty state when session has no events', () => {
    render(<SessionTimeline session={makeSession()} />);
    expect(screen.getByTestId('session-timeline')).toBeInTheDocument();
    expect(screen.getByText('No timeline events for this session.')).toBeInTheDocument();
  });

  it('renders bug events with title and relative timestamp', () => {
    const session = makeSession({
      bugs: [
        {
          id: 'bug-1',
          sessionId: 'sess-1',
          title: 'Button broken',
          description: 'The submit button does not work',
          priority: 'P1',
          status: 'open',
          url: 'http://localhost',
          timestamp: 1032000, // 32s after session start
        },
      ],
    });

    render(<SessionTimeline session={session} />);
    expect(screen.getByText('Bug: Button broken')).toBeInTheDocument();
    expect(screen.getByText('+0:32')).toBeInTheDocument();
  });

  it('renders feature events', () => {
    const session = makeSession({
      features: [
        {
          id: 'feat-1',
          sessionId: 'sess-1',
          title: 'Dark mode toggle',
          description: 'Add dark mode',
          featureType: 'ENHANCEMENT',
          status: 'open',
          url: 'http://localhost',
          timestamp: 1015000, // 15s after start
        },
      ],
    });

    render(<SessionTimeline session={session} />);
    expect(screen.getByText('Feature: Dark mode toggle')).toBeInTheDocument();
    expect(screen.getByText('+0:15')).toBeInTheDocument();
  });

  it('renders recording start/end events', () => {
    const session = makeSession({
      recordings: [
        {
          id: 'rec-1',
          startedAt: 1005000,
          endedAt: 1045000,
          rrwebChunks: [],
          mouseTracking: true,
        },
      ],
    });

    render(<SessionTimeline session={session} />);
    expect(screen.getByText('Recording started')).toBeInTheDocument();
    expect(screen.getByText('Recording ended')).toBeInTheDocument();
    expect(screen.getByText('+0:05')).toBeInTheDocument();
    expect(screen.getByText('+0:45')).toBeInTheDocument();
  });

  it('renders snapshot events', () => {
    const session = makeSession({
      snapshots: [
        {
          id: 'snap-1',
          capturedAt: 20000,
          screenshotDataUrl: 'data:image/png;base64,abc',
          url: 'http://localhost',
          triggeredBy: 'manual',
        },
      ],
    });

    render(<SessionTimeline session={session} />);
    expect(screen.getByText('Snapshot (manual)')).toBeInTheDocument();
    expect(screen.getByText('+0:20')).toBeInTheDocument();
  });

  it('sorts events by time ascending', () => {
    const session = makeSession({
      bugs: [
        {
          id: 'bug-1',
          sessionId: 'sess-1',
          title: 'Late bug',
          description: '',
          priority: 'P2',
          status: 'open',
          url: 'http://localhost',
          timestamp: 1050000, // 50s
        },
      ],
      features: [
        {
          id: 'feat-1',
          sessionId: 'sess-1',
          title: 'Early feature',
          description: '',
          featureType: 'NEW_FEATURE',
          status: 'open',
          url: 'http://localhost',
          timestamp: 1010000, // 10s
        },
      ],
    });

    render(<SessionTimeline session={session} />);
    const events = screen.getAllByTestId(/^timeline-event-/);
    expect(events).toHaveLength(2);
    // First event should be the feature (earlier)
    expect(events[0]).toHaveTextContent('Early feature');
    expect(events[1]).toHaveTextContent('Late bug');
  });

  it('shows event count in header', () => {
    const session = makeSession({
      bugs: [
        {
          id: 'bug-1',
          sessionId: 'sess-1',
          title: 'Bug A',
          description: '',
          priority: 'P0',
          status: 'open',
          url: 'http://localhost',
          timestamp: 1010000,
        },
        {
          id: 'bug-2',
          sessionId: 'sess-1',
          title: 'Bug B',
          description: '',
          priority: 'P1',
          status: 'open',
          url: 'http://localhost',
          timestamp: 1020000,
        },
      ],
    });

    render(<SessionTimeline session={session} />);
    expect(screen.getByText('Timeline (2 events)')).toBeInTheDocument();
  });

  it('calls onSeek with the event time when a timeline item is clicked', () => {
    const onSeek = vi.fn();
    const session = makeSession({
      bugs: [
        {
          id: 'bug-1',
          sessionId: 'sess-1',
          title: 'Click me',
          description: '',
          priority: 'P2',
          status: 'open',
          url: 'http://localhost',
          timestamp: 1025000, // 25s offset
        },
      ],
    });

    render(<SessionTimeline session={session} onSeek={onSeek} />);
    fireEvent.click(screen.getByTestId('timeline-event-0'));
    expect(onSeek).toHaveBeenCalledWith(25000);
  });

  it('does not crash when onSeek is undefined', () => {
    const session = makeSession({
      snapshots: [
        {
          id: 'snap-1',
          capturedAt: 5000,
          screenshotDataUrl: 'data:image/png;base64,abc',
          url: 'http://localhost',
          triggeredBy: 'auto',
        },
      ],
    });

    render(<SessionTimeline session={session} />);
    // Click should not throw even without onSeek
    expect(() => fireEvent.click(screen.getByTestId('timeline-event-0'))).not.toThrow();
  });
});
