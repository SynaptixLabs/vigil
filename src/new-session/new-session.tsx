/**
 * @file new-session.tsx
 * @description Standalone tab entry point for the New Recording Session form.
 * Opens as a full Chrome tab so it is NOT closed when the user clicks outside
 * (unlike the popup which always closes on blur — a hard Chrome constraint).
 *
 * On successful session creation, posts SESSION_CREATED to the background so
 * the popup refreshes its session list when next opened.
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MessageType } from '@shared/types';
import type { Session } from '@shared/types';
import { getAllSessions } from '@core/db';
import '@popup/popup.css';

const NewSessionTab: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [recordMouseMove, setRecordMouseMove] = useState(false);
  const [activeTabUrl, setActiveTabUrl] = useState('');
  const [activeTabId, setActiveTabId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingProjects, setExistingProjects] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  // Save location state
  const [globalOutputPath, setGlobalOutputPath] = useState('');
  const [saveLocation, setSaveLocation] = useState('');
  const [saveLocationEdited, setSaveLocationEdited] = useState(false);

  useEffect(() => {
    // Read the origin tab stored by the popup before opening this tab
    chrome.storage.local.get(['refineOriginTabId', 'refineOriginTabUrl'], (res) => {
      const tabId = res.refineOriginTabId as number | undefined;
      const tabUrl = (res.refineOriginTabUrl as string) || '';
      if (tabId) setActiveTabId(tabId);
      if (tabUrl) setActiveTabUrl(tabUrl);
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

  // Per-project save location override
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

    if (projectKey && saveLocation && saveLocation !== globalOutputPath) {
      chrome.storage.local.set({ [`refineOutputPath_${projectKey}`]: saveLocation });
    }
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
        source: 'new-session-tab',
      },
      (response: { ok: boolean; data?: Session; error?: string }) => {
        setLoading(false);
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message ?? 'Failed to start session');
          return;
        }
        if (response?.ok) {
          setDone(true);
          // Switch back to the target tab so the user sees the control bar, then close this tab
          if (activeTabId) {
            chrome.tabs.update(activeTabId, { active: true }, () => {
              setTimeout(() => window.close(), 400);
            });
          } else {
            setTimeout(() => window.close(), 1200);
          }
        } else {
          setError(response?.error ?? 'Failed to start session');
        }
      }
    );
  };

  const handleCancel = () => {
    window.close();
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-white font-semibold text-lg">Recording started!</p>
          <p className="text-gray-400 text-sm mt-1">Switch back to your target tab — the control bar is active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-md bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-indigo-400 text-lg">⬡</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">SynaptixLabs Refine</span>
          </div>
          <h1 className="text-xl font-bold text-white">New Recording Session</h1>
          {activeTabUrl && (
            <p className="text-xs text-gray-500 mt-1 truncate">Recording on: {activeTabUrl}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {/* 1. Project */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Project <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              list="projects-list"
              data-testid="input-project-name"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
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
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
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
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
              placeholder="What are you testing?"
              rows={2}
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
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
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
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="e.g. C:\QA\RefineOutput"
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

          {error && (
            <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleCancel}
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
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<NewSessionTab />);
}
