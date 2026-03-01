import { render, screen, fireEvent } from '@testing-library/react';
import { SessionDetail } from './SessionDetail';
import type { SessionDetail as SessionDetailType, SessionBug, SessionFeature, SnapshotItem } from '../types';

/**
 * We mock rrweb-loader (used by RecordingPlayer child) to avoid real Svelte player
 * crashing in jsdom. This is the same pattern used in RecordingPlayer.test.tsx.
 */
vi.mock('../components/rrweb-loader', () => ({
  loadRrwebPlayer: vi.fn().mockResolvedValue(
    class MockPlayer {
      goto = vi.fn();
      $destroy = vi.fn();
      constructor(opts: { target: HTMLElement }) {
        const el = document.createElement('div');
        el.className = 'rr-player';
        opts.target.appendChild(el);
      }
    },
  ),
}));

function makeBug(overrides: Partial<SessionBug> = {}): SessionBug {
  return {
    id: 'bug-1',
    sessionId: 'sess-1',
    title: 'Button broken',
    description: 'The submit button does not work',
    priority: 'P1',
    status: 'open',
    url: 'http://localhost',
    timestamp: 1000030000,
    ...overrides,
  };
}

function makeFeature(overrides: Partial<SessionFeature> = {}): SessionFeature {
  return {
    id: 'feat-1',
    sessionId: 'sess-1',
    title: 'Dark mode toggle',
    description: 'Add a dark mode option',
    featureType: 'ENHANCEMENT',
    status: 'open',
    url: 'http://localhost',
    timestamp: 1000015000,
    ...overrides,
  };
}

function makeSnapshot(overrides: Partial<SnapshotItem> = {}): SnapshotItem {
  return {
    id: 'snap-1',
    capturedAt: 20000,
    screenshotDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
    url: 'http://localhost',
    triggeredBy: 'manual',
    ...overrides,
  };
}

function makeSession(overrides: Partial<SessionDetailType> = {}): SessionDetailType {
  return {
    id: 'sess-1',
    project: 'vigil',
    sprint: '07',
    name: 'vigil-session-2026-02-27-001',
    startedAt: 1000000000,
    endedAt: 1000060000,
    clock: 60000,
    recordings: [],
    snapshots: [],
    bugs: [],
    features: [],
    ...overrides,
  };
}

describe('SessionDetail', () => {
  it('renders session name in header', () => {
    render(<SessionDetail session={makeSession({ name: 'my-test-session' })} />);
    expect(screen.getByTestId('session-detail')).toBeInTheDocument();
    expect(screen.getByText('my-test-session')).toBeInTheDocument();
  });

  it('renders duration metadata', () => {
    render(<SessionDetail session={makeSession({ clock: 125000 })} />); // 2m 05s
    expect(screen.getByText(/Duration: 2m 05s/)).toBeInTheDocument();
  });

  it('renders counts for snapshots, bugs, features, recordings', () => {
    render(
      <SessionDetail
        session={makeSession({
          snapshots: [makeSnapshot()],
          bugs: [makeBug()],
          features: [makeFeature(), makeFeature({ id: 'feat-2', title: 'Feature 2' })],
          recordings: [],
        })}
      />,
    );
    expect(screen.getByText('Snapshots: 1')).toBeInTheDocument();
    expect(screen.getByText('Bugs: 1')).toBeInTheDocument();
    expect(screen.getByText('Features: 2')).toBeInTheDocument();
    expect(screen.getByText('Recordings: 0')).toBeInTheDocument();
  });

  it('renders bug section with bug title and priority', () => {
    const bugs = [makeBug({ title: 'Login fails', priority: 'P0' })];
    render(<SessionDetail session={makeSession({ bugs })} />);
    expect(screen.getByText('Bugs (1)')).toBeInTheDocument();
    expect(screen.getByText('Login fails')).toBeInTheDocument();
    expect(screen.getByText('P0')).toBeInTheDocument();
  });

  it('renders bug description when present', () => {
    const bugs = [makeBug({ description: 'Cannot submit the form' })];
    render(<SessionDetail session={makeSession({ bugs })} />);
    expect(screen.getByText('Cannot submit the form')).toBeInTheDocument();
  });

  it('renders feature section with feature titles', () => {
    const features = [
      makeFeature({ title: 'Auto-save' }),
      makeFeature({ id: 'feat-2', title: 'Keyboard shortcuts' }),
    ];
    render(<SessionDetail session={makeSession({ features })} />);
    expect(screen.getByText('Features (2)')).toBeInTheDocument();
    expect(screen.getByText('Auto-save')).toBeInTheDocument();
    expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument();
  });

  it('renders snapshots gallery with images', () => {
    const snapshots = [
      makeSnapshot({ id: 'snap-a', capturedAt: 5000, triggeredBy: 'manual' }),
      makeSnapshot({ id: 'snap-b', capturedAt: 25000, triggeredBy: 'auto' }),
    ];
    render(<SessionDetail session={makeSession({ snapshots })} />);
    expect(screen.getByText('Snapshots (2)')).toBeInTheDocument();
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  it('does not render bugs section when there are no bugs', () => {
    render(<SessionDetail session={makeSession({ bugs: [] })} />);
    expect(screen.queryByText(/Bugs \(/)).not.toBeInTheDocument();
  });

  it('does not render features section when there are no features', () => {
    render(<SessionDetail session={makeSession({ features: [] })} />);
    expect(screen.queryByText(/Features \(/)).not.toBeInTheDocument();
  });

  it('does not render snapshots section when there are no snapshots', () => {
    render(<SessionDetail session={makeSession({ snapshots: [] })} />);
    expect(screen.queryByText(/Snapshots \(/)).not.toBeInTheDocument();
  });

  it('renders timeline-player section when session has timeline content', () => {
    const session = makeSession({
      bugs: [makeBug()],
    });
    render(<SessionDetail session={session} />);
    // Timeline section should appear with at least the timeline component
    expect(screen.getByTestId('session-timeline')).toBeInTheDocument();
  });

  it('does not render timeline-player section when session is empty', () => {
    render(<SessionDetail session={makeSession()} />);
    expect(screen.queryByTestId('timeline-player-section')).not.toBeInTheDocument();
  });

  it('renders screenshot toggle button for bugs with linked screenshot', () => {
    const snapshot = makeSnapshot({ id: 'snap-linked' });
    const bug = makeBug({ screenshotId: 'snap-linked' });
    render(
      <SessionDetail session={makeSession({ bugs: [bug], snapshots: [snapshot] })} />,
    );
    expect(screen.getByText('Show screenshot')).toBeInTheDocument();
  });

  it('expands and collapses screenshot on toggle click', () => {
    const snapshot = makeSnapshot({ id: 'snap-toggle' });
    const bug = makeBug({ screenshotId: 'snap-toggle' });
    render(
      <SessionDetail session={makeSession({ bugs: [bug], snapshots: [snapshot] })} />,
    );

    // Click to expand
    fireEvent.click(screen.getByText('Show screenshot'));
    expect(screen.getByText('Hide screenshot')).toBeInTheDocument();
    expect(screen.getByAltText('Bug screenshot')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(screen.getByText('Hide screenshot'));
    expect(screen.getByText('Show screenshot')).toBeInTheDocument();
    expect(screen.queryByAltText('Bug screenshot')).not.toBeInTheDocument();
  });
});
