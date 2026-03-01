import { render, screen, fireEvent } from '@testing-library/react';
import { SprintSelector } from './SprintSelector';

describe('SprintSelector', () => {
  const sprints = ['05', '06', '07'];

  it('renders a select element with data-testid', () => {
    render(<SprintSelector sprints={sprints} selected="07" onChange={vi.fn()} />);
    expect(screen.getByTestId('sprint-selector')).toBeInTheDocument();
  });

  it('renders sprint options with "Sprint XX" labels', () => {
    render(<SprintSelector sprints={sprints} selected="07" onChange={vi.fn()} />);
    for (const s of sprints) {
      expect(screen.getByText(`Sprint ${s}`)).toBeInTheDocument();
    }
  });

  it('shows "No sprints" when sprints array is empty', () => {
    render(<SprintSelector sprints={[]} selected="" onChange={vi.fn()} />);
    expect(screen.getByText('No sprints')).toBeInTheDocument();
  });

  it('shows "All sprints" option when showAll=true and sprints exist', () => {
    render(
      <SprintSelector sprints={sprints} selected="" onChange={vi.fn()} showAll />,
    );
    expect(screen.getByText('All sprints')).toBeInTheDocument();
  });

  it('does not show "All sprints" when showAll=true but sprints is empty', () => {
    render(
      <SprintSelector sprints={[]} selected="" onChange={vi.fn()} showAll />,
    );
    expect(screen.queryByText('All sprints')).not.toBeInTheDocument();
  });

  it('does not show "All sprints" when showAll is false/undefined', () => {
    render(<SprintSelector sprints={sprints} selected="07" onChange={vi.fn()} />);
    expect(screen.queryByText('All sprints')).not.toBeInTheDocument();
  });

  it('calls onChange with the selected sprint value', () => {
    const onChange = vi.fn();
    render(<SprintSelector sprints={sprints} selected="05" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('sprint-selector'), {
      target: { value: '07' },
    });
    expect(onChange).toHaveBeenCalledWith('07');
  });

  it('calls onChange with empty string when "All sprints" is selected', () => {
    const onChange = vi.fn();
    render(
      <SprintSelector sprints={sprints} selected="07" onChange={onChange} showAll />,
    );
    fireEvent.change(screen.getByTestId('sprint-selector'), {
      target: { value: '' },
    });
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('reflects the selected value', () => {
    render(<SprintSelector sprints={sprints} selected="06" onChange={vi.fn()} />);
    const select = screen.getByTestId('sprint-selector') as HTMLSelectElement;
    expect(select.value).toBe('06');
  });
});
