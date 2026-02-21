/**
 * @file ControlBar.tsx
 * @description Floating control bar rendered inside Shadow DOM.
 * Shows recording status, timer, and action buttons.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MessageType } from '@shared/types';
import BugEditor from './BugEditor';

interface ControlBarProps {
  sessionId: string;
  sessionName: string;
}

type RecordingState = 'recording' | 'paused';

const ControlBar: React.FC<ControlBarProps> = ({ sessionId, sessionName }) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('recording');
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [pauseStart, setPauseStart] = useState<number | null>(null);
  const [totalPaused, setTotalPaused] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [showBugEditor, setShowBugEditor] = useState(false);
  const [lastClickedSelector, setLastClickedSelector] = useState<string | undefined>(undefined);

  // Track elapsed time
  useEffect(() => {
    const id = setInterval(() => {
      if (recordingState === 'recording') {
        setElapsed(Date.now() - startTime - totalPaused);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [recordingState, startTime, totalPaused]);

  // Track last clicked element for bug editor pre-fill
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = e.target as Element;
      if (el && !el.closest('#refine-root')) {
        const testId = el.getAttribute('data-testid');
        if (testId) setLastClickedSelector(`[data-testid="${testId}"]`);
        else if (el.id) setLastClickedSelector(`#${el.id}`);
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handlePauseResume = () => {
    if (recordingState === 'recording') {
      chrome.runtime.sendMessage({ type: MessageType.PAUSE_RECORDING, source: 'content' });
      setPauseStart(Date.now());
      setRecordingState('paused');
    } else {
      chrome.runtime.sendMessage({ type: MessageType.RESUME_RECORDING, source: 'content' });
      if (pauseStart) setTotalPaused((p) => p + Date.now() - pauseStart);
      setPauseStart(null);
      setRecordingState('recording');
    }
  };

  const handleStop = () => {
    chrome.runtime.sendMessage({ type: MessageType.STOP_RECORDING, source: 'content' });
  };

  const handleScreenshot = () => {
    chrome.runtime.sendMessage(
      { type: MessageType.CAPTURE_SCREENSHOT, payload: { sessionId }, source: 'content' },
      () => showToast('✓ Screenshot captured')
    );
  };

  const formatTime = (ms: number): string => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <>
      {showBugEditor && (
        <BugEditor
          sessionId={sessionId}
          currentUrl={window.location.href}
          elementSelector={lastClickedSelector}
          onClose={() => setShowBugEditor(false)}
        />
      )}

      <div className="refine-control-bar">
        <div
          className={`refine-recording-dot ${recordingState === 'paused' ? 'refine-recording-dot--paused' : ''}`}
        />

        <span className="refine-session-name" title={sessionName}>
          {sessionName}
        </span>

        <span className="refine-timer">{formatTime(elapsed)}</span>

        <div className="refine-divider" />

        <button
          className="refine-btn"
          title={recordingState === 'recording' ? 'Pause' : 'Resume'}
          onClick={handlePauseResume}
        >
          {recordingState === 'recording' ? '⏸' : '▶'}
        </button>

        <button
          className="refine-btn refine-btn--danger"
          title="Stop recording"
          onClick={handleStop}
        >
          ⏹
        </button>

        <button
          className="refine-btn"
          title="Take screenshot"
          onClick={handleScreenshot}
        >
          📷
        </button>

        <button
          className="refine-btn refine-btn--record"
          title="Log bug or feature"
          onClick={() => setShowBugEditor((v) => !v)}
        >
          🐛
        </button>

        {toast && <span className="refine-toast">{toast}</span>}
      </div>
    </>
  );
};

export default ControlBar;
