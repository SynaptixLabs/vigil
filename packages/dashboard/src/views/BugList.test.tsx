import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BugList } from './BugList';
import type { BugItem } from '../types';

// Mock the API module — we never hit a real server in tests
vi.mock('../api', () => ({
  patchBug: vi.fn().mockResolvedValue(undefined),
  closeBug: vi.fn().mockResolvedValue(undefined),
}));

import { patchBug, closeBug } from '../api';
const mockPatchBug = vi.mocked(patchBug);
const mockCloseBug = vi.mocked(closeBug);

function makeBug(overrides: Partial<BugItem> = {}): BugItem {
  return {
    id: 'BUG-001',
    title: 'Login page crash',
    status: 'OPEN',
    severity: 'P1',
    sprint: '07',
    discovered: '2026-02-27',
    ...overrides,
  };
}

describe('BugList', () => {
  beforeEach(() => {
    mockPatchBug.mockClear();
    mockCloseBug.mockClear();
  });

  it('renders empty state when bugs array is empty', () => {
    render(<BugList bugs={[]} onRefresh={vi.fn()} />);
    expect(screen.getByTestId('bug-list-table')).toBeInTheDocument();
    expect(screen.getByText('No bugs found for this sprint.')).toBeInTheDocument();
  });

  it('renders table with headers', () => {
    render(<BugList bugs={[makeBug()]} onRefresh={vi.fn()} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Discovered')).toBeInTheDocument();
    expect(screen.getByText('Regression')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders bug row with correct data', () => {
    const bug = makeBug({
      id: 'BUG-042',
      title: 'Form validation broken',
      severity: 'P0',
      status: 'OPEN',
      discovered: '2026-03-01',
    });
    render(<BugList bugs={[bug]} onRefresh={vi.fn()} />);
    expect(screen.getByTestId('bug-row-BUG-042')).toBeInTheDocument();
    expect(screen.getByText('BUG-042')).toBeInTheDocument();
    expect(screen.getByText('Form validation broken')).toBeInTheDocument();
    expect(screen.getByText('2026-03-01')).toBeInTheDocument();
  });

  it('renders SeverityBadge for each bug', () => {
    const bug = makeBug({ id: 'BUG-007', severity: 'P2' });
    render(<BugList bugs={[bug]} onRefresh={vi.fn()} />);
    expect(screen.getByTestId('severity-badge-BUG-007')).toBeInTheDocument();
    expect(screen.getByTestId('severity-badge-BUG-007')).toHaveTextContent('P2');
  });

  it('renders multiple bug rows', () => {
    const bugs = [
      makeBug({ id: 'BUG-A' }),
      makeBug({ id: 'BUG-B', title: 'Second bug' }),
      makeBug({ id: 'BUG-C', title: 'Third bug' }),
    ];
    render(<BugList bugs={bugs} onRefresh={vi.fn()} />);
    expect(screen.getByTestId('bug-row-BUG-A')).toBeInTheDocument();
    expect(screen.getByTestId('bug-row-BUG-B')).toBeInTheDocument();
    expect(screen.getByTestId('bug-row-BUG-C')).toBeInTheDocument();
  });

  it('shows "Mark Fixed" button for OPEN bugs', () => {
    const bug = makeBug({ status: 'OPEN' });
    render(<BugList bugs={[bug]} onRefresh={vi.fn()} />);
    expect(screen.getByText('Mark Fixed')).toBeInTheDocument();
  });

  it('shows "Reopen" button for FIXED bugs', () => {
    const bug = makeBug({ status: 'FIXED' });
    render(<BugList bugs={[bug]} onRefresh={vi.fn()} />);
    expect(screen.getByText('Reopen')).toBeInTheDocument();
  });

  it('shows regression status PASS when regressionTest contains GREEN', () => {
    const bug = makeBug({ regressionTest: 'Status: GREEN' });
    render(<BugList bugs={[bug]} onRefresh={vi.fn()} />);
    expect(screen.getByText('PASS')).toBeInTheDocument();
  });

  it('shows regression status FAIL when regressionTest contains RED', () => {
    const bug = makeBug({ regressionTest: 'Status: RED' });
    render(<BugList bugs={[bug]} onRefresh={vi.fn()} />);
    expect(screen.getByText('FAIL')).toBeInTheDocument();
  });

  it('shows N/A for regression when regressionTest is empty', () => {
    const bug = makeBug({ regressionTest: undefined });
    render(<BugList bugs={[bug]} onRefresh={vi.fn()} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('calls closeBug and onRefresh when "Mark Fixed" is clicked', async () => {
    const onRefresh = vi.fn();
    const bug = makeBug({ id: 'BUG-FIX', status: 'OPEN' });
    render(<BugList bugs={[bug]} onRefresh={onRefresh} />);

    fireEvent.click(screen.getByText('Mark Fixed'));

    await waitFor(() => {
      expect(mockCloseBug).toHaveBeenCalledWith('BUG-FIX', 'Marked fixed via dashboard', true);
    });
    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  it('calls patchBug and onRefresh when "Reopen" is clicked', async () => {
    const onRefresh = vi.fn();
    const bug = makeBug({ id: 'BUG-REOPEN', status: 'FIXED' });
    render(<BugList bugs={[bug]} onRefresh={onRefresh} />);

    fireEvent.click(screen.getByText('Reopen'));

    await waitFor(() => {
      expect(mockPatchBug).toHaveBeenCalledWith('BUG-REOPEN', { status: 'open' });
    });
    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  it('calls patchBug when severity dropdown is changed', async () => {
    const onRefresh = vi.fn();
    const bug = makeBug({ id: 'BUG-SEV', severity: 'P1' });
    render(<BugList bugs={[bug]} onRefresh={onRefresh} />);

    // The severity select is inside the Actions column
    const selects = screen.getAllByRole('combobox');
    // Find the severity select (has P0-P3 options)
    const severitySelect = selects.find(
      (s) => (s as HTMLSelectElement).value === 'P1',
    )!;
    fireEvent.change(severitySelect, { target: { value: 'P0' } });

    await waitFor(() => {
      expect(mockPatchBug).toHaveBeenCalledWith('BUG-SEV', { severity: 'P0' });
    });
  });
});
