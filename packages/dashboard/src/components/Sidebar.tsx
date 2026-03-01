interface SidebarProps {
  projects: string[];
  selectedProject: string;
  onSelectProject: (project: string) => void;
}

export function Sidebar({ projects, selectedProject, onSelectProject }: SidebarProps) {
  return (
    <aside data-testid="sidebar" className="w-56 shrink-0 bg-white border-r border-gray-200 min-h-0 overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Projects
        </h2>
      </div>
      <nav className="py-1">
        <button
          data-testid="sidebar-all-projects"
          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
            selectedProject === ''
              ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => onSelectProject('')}
        >
          All projects
        </button>
        {projects.map((project) => (
          <button
            key={project}
            data-testid={`sidebar-project-${project}`}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
              selectedProject === project
                ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onSelectProject(project)}
          >
            {project}
          </button>
        ))}
        {projects.length === 0 && (
          <div className="px-4 py-3 text-xs text-gray-400">No projects found</div>
        )}
      </nav>
    </aside>
  );
}
