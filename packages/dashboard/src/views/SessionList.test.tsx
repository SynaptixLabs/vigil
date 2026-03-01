import { render, screen, fireEvent } from '@testing-library/react';
import { SessionList } from './SessionList';
import type { SessionSummary } from '../types';

function makeSession(overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    id: 'sess-1',
    project: 'vigil',
    sprint: '07',
    name: 'vigil-session-2026-02-27-001',
    startedAt: 1740700000000,
    endedAt: 1740700120000, // 2 minutes later
    recordingCount: 1,
    snapshotCount: 2,
    bugCount: 0,
    featureCount: 0,
    ...overrides,
  };
}

describe('SessionList', () => {
  it('renders empty state when sessions array is empty', () => {
    render(<SessionList sessions={[]} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByTestId('session-list')).toBeInTheDocument();
    expect(screen.getByText('No sessions found.')).toBeInTheDocument();
  });

  it('renders session rows with name', () => {
    const sessions = [
      makeSession({ id: 'sess-1', name: 'session-one' }),
      makeSession({ id: 'sess-2', name: 'session-two' }),
    ];
    render(<SessionList sessions={sessions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText('session-one')).toBeInTheDocument();
    expect(screen.getByText('session-two')).toBeInTheDocument();
  });

  it('renders data-testid for each session row', () => {
    const sessions = [makeSession({ id: 'sess-abc' })];
    render(<SessionList sessions={sessions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByTestId('session-row-sess-abc')).toBeInTheDocument();
  });

  it('shows "In progress" when endedAt is undefined', () => {
    const sessions = [makeSession({ endedAt: undefined })];
    render(<SessionList sessions={sessions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText(/In progress/)).toBeInTheDocument();
  });

  it('shows formatted duration when endedAt is set', () => {
    const sessions = [makeSession({ startedAt: 1000000, endedAt: 1125000 })]; // 125s = 2m 05s
    render(<SessionList sessions={sessions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText(/2m 05s/)).toBeInTheDocument();
  });

  it('shows bug count badge when bugCount > 0', () => {
    const sessions = [makeSession({ bugCount: 3 })];
    render(<SessionList sessions={sessions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText('3 bugs')).toBeInTheDocument();
  });

  it('shows singular "bug" for bugCount = 1', () => {
    const sessions = [makeSession({ bugCount: 1 })];
    render(<SessionList sessions={sessions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText('1 bug')).toBeInTheDocument();
  });

  it('shows feature count badge when featureCount > 0', () => {
    const sessions = [makeSession({ featureCount: 2 })];
    render(<SessionList sessions={sessions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText('2 feat')).toBeInTheDocument();
  });

  it('does not show badges for zero counts', () => {
    const sessions = [
      makeSession({ bugCount: 0, featureCount: 0, snapshotCount: 0, recordingCount: 0 }),
    ];
    render(<SessionList sessions={sessions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.queryByText(/bug/)).not.toBeInTheDocument();
    expect(screen.queryByText(/feat/)).not.toBeInTheDocument();
    expect(screen.queryByText(/snap/)).not.toBeInTheDocument();
    expect(screen.queryByText(/rec/)).not.toBeInTheDocument();
  });

  it('calls onSelect with session id when clicked', () => {
    const onSelect = vi.fn();
    const sessions = [makeSession({ id: 'sess-click-me' })];
    render(<SessionList sessions={sessions} selectedId={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('session-row-sess-click-me'));
    expect(onSelect).toHaveBeenCalledWith('sess-click-me');
  });

  it('applies active styles to the selected session row', () => {
    const sessions = [
      makeSession({ id: 'sess-a' }),
      makeSession({ id: 'sess-b', name: 'other' }),
    ];
    render(<SessionList sessions={sessions} selectedId="sess-a" onSelect={vi.fn()} />);
    const activeRow = screen.getByTestId('session-row-sess-a');
    expect(activeRow.className).toContain('bg-blue-50');
  });
});
