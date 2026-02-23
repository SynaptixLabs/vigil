/**
 * @file NewSession.tsx
 * @description New session creation form. Sends CREATE_SESSION to background.
 */

import React, { useState, useEffect } from 'react';
import { MessageType } from '@shared/types';
import type { Session } from '@shared/types';
import { getAllSessions } from '@core/db';

interface NewSessionProps {
  onBack: () => void;
  onCreated: (session: Session) => void;
}

const NewSession: React.FC<NewSessionProps> = ({ onBack, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState(''); // R025
  const [tagsInput, setTagsInput] = useState(''); // R020
  const [recordMouseMove, setRecordMouseMove] = useState(false);
  const [activeTabUrl, setActiveTabUrl] = useState('');
  const [activeTabId, setActiveTabId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingProjects, setExistingProjects] = useState<string[]>([]);

  // Save location: global default from Options, overridable per-project
  const [globalOutputPath, setGlobalOutputPath] = useState('');
  const [saveLocation, setSaveLocation] = useState('');
  const [saveLocationEdited, setSaveLocationEdited] = useState(false);

  useEffect(() => {
    // In the side panel, currentWindow refers to the browser window the panel is attached to.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const target = tabs.find(
        t => t.url && !t.url.startsWith('chrome-extension://') && !t.url.startsWith('chrome://')
      );
      if (target?.url) {
        setActiveTabUrl(target.url);
        setActiveTabId(target.id);
      } else {
        setError('No active tab found. Navigate to a webpage before starting a session.');
      }
    });

    getAllSessions().then(sessions => {
      const projects = Array.from(new Set(sessions.map(s => s.project).filter(Boolean))) as string[];
      setExistingProjects(projects);
    });

    chrome.storage.local.get(['refineOutputPath'], (res) => {
      const global = (res.refineOutputPath as string) || '';
      setGlobalOutputPath(global);
      if (!saveLocationEdited) setSaveLocation(global);
    });
  }, []);

  // When project changes, check for a per-project saved output path override
  useEffect(() => {
    if (!project.trim()) {
      if (!saveLocationEdited) setSaveLocation(globalOutputPath);
      return;
    }
    const key = `refineOutputPath_${project.trim()}`;
    chrome.storage.local.get([key], (res) => {
      const perProject = res[key] as string | undefined;
      if (perProject) {
        setSaveLocation(perProject);
      } else if (!saveLocationEdited) {
        setSaveLocation(globalOutputPath);
      }
    });
  }, [project]);

  const handleSaveLocationChange = (val: string) => {
    setSaveLocation(val);
    setSaveLocationEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const projectKey = project.trim();

    // Persist per-project override if it differs from global
    if (projectKey && saveLocation && saveLocation !== globalOutputPath) {
      chrome.storage.local.set({ [`refineOutputPath_${projectKey}`]: saveLocation });
    }
    // Also update the active global key so background picks it up for this session
    if (saveLocation) {
      chrome.storage.local.set({ refineOutputPath: saveLocation });
    }

    chrome.runtime.sendMessage(
      {
        type: MessageType.CREATE_SESSION,
        payload: {
          name: name.trim(),
          description: description.trim(),
          project: projectKey || undefined,
          tags,
          url: activeTabUrl,
          tabId: activeTabId,
          recordMouseMove,
        },
        source: 'popup',
      },
      (response) => {
        setLoading(false);
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message ?? 'Failed to start session');
          return;
        }
        if (response?.ok && response.data) {
          onCreated(response.data as Session);
        } else {
          setError(response?.error ?? 'Failed to start session');
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-800 flex-shrink-0">
        <h2 className="text-base font-bold text-white flex-1">New Recording Session</h2>
      </div>

      {/* ── Scrollable form body ── */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2">

          {/* 1. Project (first) */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Project <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              list="projects-list"
              data-testid="input-project-name"
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="e.g. internal-dashboard"
              value={project}
              onChange={(e) => { setProject(e.target.value); setSaveLocationEdited(false); }}
            />
            <datalist id="projects-list">
              {existingProjects.map(p => <option key={p} value={p} />)}
            </datalist>
          </div>

          {/* 2. Session Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Session Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Login flow QA pass"
              data-testid="input-session-name"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              autoFocus
              required
            />
          </div>

          {/* 3. Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Description <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
              placeholder="What are you testing?"
              rows={1}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 4. Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Tags <span className="text-gray-600 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="e.g. smoke-test, checkout, mobile"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          {/* 5. Save Location */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Save Location
              {project.trim() && saveLocation !== globalOutputPath && (
                <span className="ml-1.5 text-indigo-400 font-normal">(project override)</span>
              )}
              {!globalOutputPath && (
                <span className="ml-1.5 text-yellow-500 font-normal">— set in Options for default</span>
              )}
            </label>
            <input
              type="text"
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="e.g. C:\\QA\\RefineOutput"
              value={saveLocation}
              onChange={(e) => handleSaveLocationChange(e.target.value)}
              data-testid="input-save-location"
            />
            {globalOutputPath && saveLocation !== globalOutputPath && (
              <button
                type="button"
                onClick={() => { setSaveLocation(globalOutputPath); setSaveLocationEdited(false); }}
                className="mt-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                ↩ Reset to global default
              </button>
            )}
          </div>

          {/* 6. Record mouse movements */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="record-mouse-move"
              checked={recordMouseMove}
              onChange={(e) => setRecordMouseMove(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer flex-shrink-0"
              data-testid="toggle-record-mouse-move"
            />
            <label htmlFor="record-mouse-move" className="text-xs text-gray-400 cursor-pointer select-none">
              Record mouse movements <span className="text-gray-600">(increases replay file size)</span>
            </label>
          </div>

          {/* 7. Starting URL (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Starting URL
            </label>
            <div className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-500 truncate" title={activeTabUrl}>
              {activeTabUrl || 'Loading…'}
            </div>
            <div className="mt-1 text-[10px] text-gray-600 font-mono">
              Tab ID: {activeTabId ?? 'None'}
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* ── Sticky footer: Cancel + Start Recording ── */}
        <div className="flex gap-2 px-4 py-2 border-t border-gray-800 flex-shrink-0 bg-gray-950">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || loading}
            data-testid="btn-start-recording"
            className="flex-[2] py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
          >
            {loading ? 'Starting…' : '▶ Start Recording'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewSession;
