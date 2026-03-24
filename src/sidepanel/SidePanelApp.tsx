/**
 * @file SidePanelApp.tsx
 * @description Root component for the Vigil side panel.
 * Smart project detection: auto-selects project by current tab URL,
 * shows project-scoped session list, and provides quick actions.
 */

import React, { useState } from 'react';
import { useProjects } from './hooks/useProjects';
import { useSessions } from './hooks/useSessions';
import ProjectTopBar from './components/ProjectTopBar';
import SessionList from './components/SessionList';
import NewProjectForm from './components/NewProjectForm';
import { MessageType } from '@shared/types';
import { VERSION } from '@shared/constants';

type Page = 'list' | 'new-project';

const SidePanelApp: React.FC = () => {
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    selectedProjectId,
    autoDetected,
    currentTabUrl,
    projectActivityMap,
    selectProject,
    refresh: refreshProjects,
  } = useProjects();

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    refresh: refreshSessions,
  } = useSessions(selectedProjectId);

  const [page, setPage] = useState<Page>('list');

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleNewSession = () => {
    if (!selectedProjectId) return;
    // Open the popup's NewSession page by navigating to the popup in a new tab,
    // or trigger session creation via the background script
    const proj = projects.find(p => p.id === selectedProjectId);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs.find(
        t => t.url && !t.url.startsWith('chrome-extension://') && !t.url.startsWith('chrome://'),
      );
      if (!tab?.url || !tab.id) return;

      chrome.runtime.sendMessage(
        {
          type: MessageType.CREATE_SESSION,
          payload: {
            name: '',  // auto-generate in background
            description: '',
            project: selectedProjectId,
            sprint: proj?.currentSprint || undefined,
            tags: [],
            url: tab.url,
            tabId: tab.id,
            recordMouseMove: false,
          },
          source: 'sidepanel',
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn('[Vigil] Create session error:', chrome.runtime.lastError.message);
            return;
          }
          if (response?.ok) {
            // Refresh sessions list after a short delay to let the server receive the session
            setTimeout(() => refreshSessions(), 1000);
          }
        },
      );
    });
  };

  const handleNewProject = () => {
    setPage('new-project');
  };

  const handleProjectCreated = (projectId: string) => {
    setPage('list');
    refreshProjects();
    // Auto-select the newly created project after refresh
    setTimeout(() => selectProject(projectId), 300);
  };

  const handleSelectSession = (sessionId: string) => {
    // Open session detail in dashboard
    const configUrl = chrome.runtime.getURL('vigil.config.json');
    fetch(configUrl)
      .then(r => r.ok ? r.json() : null)
      .then(config => {
        const serverUrl = config?.serverUrl ?? `http://localhost:${config?.serverPort ?? 7474}`;
        chrome.tabs.create({ url: `${serverUrl}/dashboard#session/${sessionId}` });
      })
      .catch(() => {
        chrome.tabs.create({ url: `http://localhost:7474/dashboard#session/${sessionId}` });
      });
  };

  // Listen for session completion to auto-refresh
  React.useEffect(() => {
    const listener = (message: { type: string }) => {
      if (
        message.type === 'SESSION_COMPLETED' ||
        message.type === MessageType.SESSION_SYNCED
      ) {
        refreshSessions();
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [refreshSessions]);

  // Derive current tab origin for new project form
  const currentOrigin = currentTabUrl ? (() => {
    try { return new URL(currentTabUrl).origin; }
    catch { return ''; }
  })() : '';

  return (
    <div className="w-full h-screen bg-gray-950 text-white flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-blue-500 text-lg">&#x2B21;</span>
          <span className="text-sm font-bold text-white">Vigil</span>
          <span className="text-[10px] text-gray-600">v{VERSION}</span>
        </div>
      </div>

      {/* Error banner */}
      {projectsError && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-lg border border-red-800/40 bg-red-900/20">
          <p className="text-xs text-red-400">{projectsError}</p>
          <p className="text-[10px] text-gray-500 mt-1">Is vigil-server running on port 7474?</p>
        </div>
      )}

      {/* Project top bar */}
      <ProjectTopBar
        projects={projects}
        selectedProjectId={selectedProjectId}
        autoDetected={autoDetected}
        loading={projectsLoading}
        projectActivityMap={projectActivityMap}
        onSelectProject={selectProject}
        onNewProject={handleNewProject}
        onNewSession={handleNewSession}
      />

      {/* Session list */}
      <SessionList
        sessions={sessions}
        loading={sessionsLoading}
        error={sessionsError}
        projectId={selectedProjectId}
        projectName={selectedProject?.name ?? null}
        onSelectSession={handleSelectSession}
      />

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-800 text-[10px] text-gray-600">
        <span>Side Panel</span>
        {selectedProject?.currentSprint && (
          <span>Sprint {selectedProject.currentSprint}</span>
        )}
      </div>

      {/* New project form overlay */}
      {page === 'new-project' && (
        <NewProjectForm
          defaultUrl={currentOrigin}
          onCreated={handleProjectCreated}
          onCancel={() => setPage('list')}
        />
      )}
    </div>
  );
};

export default SidePanelApp;
