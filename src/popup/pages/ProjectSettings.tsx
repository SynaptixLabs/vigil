/**
 * @file ProjectSettings.tsx
 * @description Project-level settings to manage refine.project.json and the dashboard.
 */

import React, { useState, useEffect } from 'react';
import { VERSION } from '@shared/constants';
import type { Session, RefineProjectConfig } from '@shared/types';
import { getAllSessions, getBugsBySession } from '@core/db';
import { generateProjectDashboard } from '@core/dashboard-generator';

interface ProjectSettingsProps {
  project: string;
  onBack: () => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ project, onBack }) => {
  const [outputPath, setOutputPath] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    chrome.storage.local.get(['refineOutputPath'], async (res) => {
      if (res.refineOutputPath) setOutputPath(res.refineOutputPath);
      
      const allSessions = await getAllSessions();
      const projectSessions = allSessions.filter(s => s.project === project);
      setSessions(projectSessions);
      setLoading(false);
    });
  }, [project]);

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleExportConfig = () => {
    if (!outputPath) {
      showStatus('Global Output Path is required to export config.', 'error');
      return;
    }

    const config: RefineProjectConfig = {
      name: project,
      displayName: project,
      baseUrl: sessions[0]?.pages[0] || 'http://localhost',
      outputPath,
      created: new Date().toISOString().split('T')[0],
      version: VERSION
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url,
      filename: `${outputPath}/${project}/refine.project.json`,
      saveAs: false,
      conflictAction: 'overwrite'
    }, () => {
      URL.revokeObjectURL(url);
      if (chrome.runtime.lastError) {
        showStatus(`Failed: ${chrome.runtime.lastError.message}`, 'error');
      } else {
        showStatus('Config exported successfully!', 'success');
      }
    });
  };

  const handleRefreshDashboard = async () => {
    if (!outputPath) {
      showStatus('Global Output Path is required to refresh dashboard.', 'error');
      return;
    }
    
    try {
      const bugsPromises = sessions.map(s => getBugsBySession(s.id));
      const bugs = await Promise.all(bugsPromises);
      
      const html = generateProjectDashboard(sessions, bugs);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      chrome.downloads.download({
        url,
        filename: `${outputPath}/${project}/index.html`,
        saveAs: false,
        conflictAction: 'overwrite'
      }, () => {
        URL.revokeObjectURL(url);
        if (chrome.runtime.lastError) {
          showStatus(`Failed: ${chrome.runtime.lastError.message}`, 'error');
        } else {
          showStatus('Dashboard refreshed successfully!', 'success');
        }
      });
    } catch (err) {
      showStatus('Error generating dashboard.', 'error');
    }
  };

  return (
    <div data-testid="project-settings-container" className="flex flex-col h-full bg-gray-900 text-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Back
        </button>
        <span className="text-sm font-bold text-white truncate">Project Settings: {project}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* Status Message */}
        {statusMsg && (
          <div className={`px-3 py-2 rounded text-xs font-semibold ${statusMsg.type === 'error' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-green-900/30 text-green-400 border border-green-800'}`}>
            {statusMsg.text}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-400">
          <p className="mb-2">
            <strong>Output Path:</strong> {outputPath || <span className="text-red-400">Not configured (See Options)</span>}
          </p>
          <p>
            <strong>Total Sessions:</strong> {loading ? '...' : sessions.length}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-gray-800 pt-4">
          <button
            onClick={handleExportConfig}
            data-testid="btn-export-config"
            className="w-full bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold py-2 px-3 rounded border border-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>⚙️</span> Export refine.project.json
          </button>
          <p className="text-[10px] text-gray-500 mt-[-8px] mb-2 px-1">
            Downloads the project configuration file to &lt;OutputPath&gt;/&lt;Project&gt;/. Required for Windsurf AI workflows.
          </p>

          <button
            onClick={handleRefreshDashboard}
            data-testid="btn-refresh-dashboard"
            className="w-full bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/50 text-xs font-semibold py-2 px-3 rounded transition-colors flex items-center justify-center gap-2"
          >
            <span>📊</span> Refresh Dashboard HTML
          </button>
          <p className="text-[10px] text-gray-500 mt-[-8px] px-1">
            Regenerates the index.html dashboard using the latest IndexedDB data for this project.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
