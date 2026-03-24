/**
 * @file NewProjectForm.tsx
 * @description Inline form for creating a new project from the side panel.
 * Shown as a modal overlay within the side panel.
 */

import React, { useState } from 'react';
import { createProject } from '../api';

interface NewProjectFormProps {
  /** Pre-fill the URL field with the current tab origin. */
  defaultUrl?: string;
  onCreated: (projectId: string) => void;
  onCancel: () => void;
}

/** Slugify a project name into a valid ID. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

const NewProjectForm: React.FC<NewProjectFormProps> = ({
  defaultUrl,
  onCreated,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState(defaultUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = slugify(name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug) return;

    setSaving(true);
    setError(null);
    try {
      const project = await createProject(slug, name.trim(), url.trim() || undefined);
      onCreated(project.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-950/90 z-50 flex items-start justify-center pt-12">
      <form
        onSubmit={handleSubmit}
        className="w-[90%] max-w-sm bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col gap-3 shadow-2xl"
      >
        <h3 className="text-sm font-bold text-white">New Project</h3>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">
            Project Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My App"
            data-testid="input-new-project-name"
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-gray-500
                       focus:outline-none focus:border-indigo-500 transition-colors"
            autoFocus
          />
          {slug && (
            <p className="mt-1 text-[10px] text-gray-600">
              ID: <span className="text-gray-500 font-mono">{slug}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">
            URL <span className="text-gray-600 font-normal">(for auto-detection)</span>
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://myapp.com"
            data-testid="input-new-project-url"
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-gray-500
                       focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-md transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!slug || saving}
            className="flex-[2] py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed
                       text-white font-semibold rounded-md transition-colors text-sm"
          >
            {saving ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProjectForm;
