import { render, screen } from '@testing-library/react';
import { FeatureList } from './FeatureList';
import type { FeatureItem } from '../types';

function makeFeature(overrides: Partial<FeatureItem> = {}): FeatureItem {
  return {
    id: 'FEAT-001',
    title: 'Dark mode support',
    status: 'OPEN',
    priority: 'P1',
    sprint: '07',
    ...overrides,
  };
}

describe('FeatureList', () => {
  it('renders empty state when features array is empty', () => {
    render(<FeatureList features={[]} />);
    expect(screen.getByTestId('feature-list-table')).toBeInTheDocument();
    expect(screen.getByText('No features found for this sprint.')).toBeInTheDocument();
  });

  it('renders table with column headers', () => {
    render(<FeatureList features={[makeFeature()]} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Sprint')).toBeInTheDocument();
  });

  it('renders feature row with correct data', () => {
    const feature = makeFeature({
      id: 'FEAT-042',
      title: 'Auto-save drafts',
      priority: 'P0',
      status: 'DONE',
      sprint: '06',
    });
    render(<FeatureList features={[feature]} />);
    expect(screen.getByText('FEAT-042')).toBeInTheDocument();
    expect(screen.getByText('Auto-save drafts')).toBeInTheDocument();
    expect(screen.getByText('P0')).toBeInTheDocument();
    expect(screen.getByText('DONE')).toBeInTheDocument();
    expect(screen.getByText('06')).toBeInTheDocument();
  });

  it('renders multiple feature rows', () => {
    const features = [
      makeFeature({ id: 'FEAT-A', title: 'Feature A' }),
      makeFeature({ id: 'FEAT-B', title: 'Feature B' }),
      makeFeature({ id: 'FEAT-C', title: 'Feature C' }),
    ];
    render(<FeatureList features={features} />);
    expect(screen.getByText('Feature A')).toBeInTheDocument();
    expect(screen.getByText('Feature B')).toBeInTheDocument();
    expect(screen.getByText('Feature C')).toBeInTheDocument();
  });

  it('renders priority badge with correct severity style for P0', () => {
    render(<FeatureList features={[makeFeature({ priority: 'P0' })]} />);
    const badge = screen.getByText('P0');
    expect(badge.className).toContain('bg-red-100');
    expect(badge.className).toContain('text-red-800');
  });

  it('renders priority badge with correct style for P2', () => {
    render(<FeatureList features={[makeFeature({ priority: 'P2' })]} />);
    const badge = screen.getByText('P2');
    expect(badge.className).toContain('bg-blue-100');
  });

  it('renders OPEN status with yellow styling', () => {
    render(<FeatureList features={[makeFeature({ status: 'OPEN' })]} />);
    const statusBadge = screen.getByText('OPEN');
    expect(statusBadge.className).toContain('bg-yellow-100');
    expect(statusBadge.className).toContain('text-yellow-800');
  });

  it('renders DONE status with green styling', () => {
    render(<FeatureList features={[makeFeature({ status: 'DONE' })]} />);
    const statusBadge = screen.getByText('DONE');
    expect(statusBadge.className).toContain('bg-green-100');
    expect(statusBadge.className).toContain('text-green-800');
  });

  it('renders unknown status with gray styling', () => {
    render(<FeatureList features={[makeFeature({ status: 'IN_PROGRESS' })]} />);
    const statusBadge = screen.getByText('IN_PROGRESS');
    expect(statusBadge.className).toContain('bg-gray-100');
  });

  it('has data-testid="feature-list-table" on the table element', () => {
    render(<FeatureList features={[makeFeature()]} />);
    expect(screen.getByTestId('feature-list-table')).toBeInTheDocument();
  });
});
