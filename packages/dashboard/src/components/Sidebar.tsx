import type { ProjectItem } from '../types';

interface SidebarProps {
  projects: ProjectItem[];
  selectedProject: string;
  onSelectProject: (project: string) => void;
  onManageProjects?: () => void;
}

export function Sidebar({ projects, selectedProject, onSelectProject, onManageProjects }: SidebarProps) {
  return (
    <aside
      data-testid="sidebar"
      className="w-60 shrink-0 bg-slate-900 min-h-0 overflow-y-auto custom-scrollbar flex flex-col"
    >
      <div className="px-5 py-4 flex-1">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Projects
        </h2>
        <nav className="space-y-0.5">
          <button
            data-testid="sidebar-all-projects"
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-150 ${
              selectedProject === ''
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            onClick={() => onSelectProject('')}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              All projects
            </span>
          </button>
          {projects.map((project) => (
            <button
              key={project.id}
              data-testid={`sidebar-project-${project.id}`}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-150 ${
                selectedProject === project.id
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => onSelectProject(project.id)}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                {project.name}
              </span>
            </button>
          ))}
          {projects.length === 0 && (
            <div className="px-3 py-4 text-xs text-slate-500 text-center">
              No projects yet
            </div>
          )}
        </nav>
      </div>

      <div className="px-5 py-3 border-t border-slate-800 space-y-2">
        {onManageProjects && (
          <button
            className="w-full text-left text-xs text-slate-400 hover:text-indigo-400 transition-colors"
            onClick={onManageProjects}
          >
            Manage Projects
          </button>
        )}
        <div className="text-xs text-slate-500">Vigil v2.0.0</div>
      </div>
    </aside>
  );
}
