import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import type { ProjectItem } from '../types';

describe('Sidebar', () => {
  const defaultProjects: ProjectItem[] = [
    { id: 'vigil', name: 'Vigil', createdAt: '', updatedAt: '' },
    { id: 'papyrus', name: 'Papyrus', createdAt: '', updatedAt: '' },
    { id: 'nightingale', name: 'Nightingale', createdAt: '', updatedAt: '' },
  ];

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
    for (const p of defaultProjects) {
      expect(screen.getByTestId(`sidebar-project-${p.id}`)).toBeInTheDocument();
      expect(screen.getByText(p.name)).toBeInTheDocument();
    }
  });

  it('shows "No projects yet" when projects array is empty', () => {
    render(
      <Sidebar projects={[]} selectedProject="" onSelectProject={vi.fn()} />,
    );
    expect(screen.getByText('No projects yet')).toBeInTheDocument();
  });

  it('calls onSelectProject with empty string when "All projects" is clicked', () => {
    const onSelectProject = vi.fn();
    render(
      <Sidebar projects={defaultProjects} selectedProject="vigil" onSelectProject={onSelectProject} />,
    );
    fireEvent.click(screen.getByTestId('sidebar-all-projects'));
    expect(onSelectProject).toHaveBeenCalledWith('');
  });

  it('calls onSelectProject with project id when a project is clicked', () => {
    const onSelectProject = vi.fn();
    render(
      <Sidebar projects={defaultProjects} selectedProject="" onSelectProject={onSelectProject} />,
    );
    fireEvent.click(screen.getByTestId('sidebar-project-papyrus'));
    expect(onSelectProject).toHaveBeenCalledWith('papyrus');
  });

  it('has data-testid="sidebar" on root element', () => {
    render(
      <Sidebar projects={defaultProjects} selectedProject="" onSelectProject={vi.fn()} />,
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });
});
