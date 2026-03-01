import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  const defaultProjects = ['vigil', 'papyrus', 'nightingale'];

  it('renders the Projects heading', () => {
    render(
      <Sidebar projects={defaultProjects} selectedProject="" onSelectProject={vi.fn()} />,
    );
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders "All projects" button', () => {
    render(
      <Sidebar projects={defaultProjects} selectedProject="" onSelectProject={vi.fn()} />,
    );
    expect(screen.getByTestId('sidebar-all-projects')).toBeInTheDocument();
    expect(screen.getByText('All projects')).toBeInTheDocument();
  });

  it('renders all project names as buttons', () => {
    render(
      <Sidebar projects={defaultProjects} selectedProject="" onSelectProject={vi.fn()} />,
    );
    for (const name of defaultProjects) {
      expect(screen.getByTestId(`sidebar-project-${name}`)).toBeInTheDocument();
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('shows "No projects found" when projects array is empty', () => {
    render(
      <Sidebar projects={[]} selectedProject="" onSelectProject={vi.fn()} />,
    );
    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  it('calls onSelectProject with empty string when "All projects" is clicked', () => {
    const onSelectProject = vi.fn();
    render(
      <Sidebar projects={defaultProjects} selectedProject="vigil" onSelectProject={onSelectProject} />,
    );
    fireEvent.click(screen.getByTestId('sidebar-all-projects'));
    expect(onSelectProject).toHaveBeenCalledWith('');
  });

  it('calls onSelectProject with project name when a project is clicked', () => {
    const onSelectProject = vi.fn();
    render(
      <Sidebar projects={defaultProjects} selectedProject="" onSelectProject={onSelectProject} />,
    );
    fireEvent.click(screen.getByTestId('sidebar-project-papyrus'));
    expect(onSelectProject).toHaveBeenCalledWith('papyrus');
  });

  it('applies active styles to "All projects" when selectedProject is empty', () => {
    render(
      <Sidebar projects={defaultProjects} selectedProject="" onSelectProject={vi.fn()} />,
    );
    const allBtn = screen.getByTestId('sidebar-all-projects');
    expect(allBtn.className).toContain('bg-blue-50');
    expect(allBtn.className).toContain('text-blue-700');
  });

  it('applies active styles to the selected project button', () => {
    render(
      <Sidebar projects={defaultProjects} selectedProject="vigil" onSelectProject={vi.fn()} />,
    );
    const vigilBtn = screen.getByTestId('sidebar-project-vigil');
    expect(vigilBtn.className).toContain('bg-blue-50');
    expect(vigilBtn.className).toContain('text-blue-700');

    // Other projects should NOT have active styles
    const papyrusBtn = screen.getByTestId('sidebar-project-papyrus');
    expect(papyrusBtn.className).not.toContain('bg-blue-50');
  });

  it('has data-testid="sidebar" on root element', () => {
    render(
      <Sidebar projects={defaultProjects} selectedProject="" onSelectProject={vi.fn()} />,
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });
});
