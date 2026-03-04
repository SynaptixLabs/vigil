/**
 * @file ShortcutsLegend.tsx
 * @description FEAT-SP-001: Collapsible keyboard shortcuts legend for the side panel.
 * Shows all available hotkeys for Vigil recording, screenshots, and bug editor.
 */

import React, { useState } from 'react';

const SHORTCUTS = [
  { keys: 'SPACE', action: 'Toggle recording', note: 'not in inputs' },
  { keys: 'Alt+Shift+V', action: 'Toggle recording', note: 'global' },
  { keys: 'Ctrl+Shift+S', action: 'Capture screenshot', note: '' },
  { keys: 'Alt+Shift+G', action: 'Open bug editor', note: '' },
];

export const ShortcutsLegend: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="px-3 py-1.5">
      <button
        onClick={() => setExpanded(!expanded)}
        data-testid="btn-shortcuts-legend"
        className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-300 transition-colors w-full"
      >
        <span className="text-[10px]">{expanded ? '▾' : '▸'}</span>
        <span className="font-semibold uppercase tracking-wider">Keyboard Shortcuts</span>
      </button>
      {expanded && (
        <div className="mt-1.5 rounded-lg border border-gray-800 bg-gray-900/60 overflow-hidden">
          {SHORTCUTS.map((s, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-3 py-1.5 text-[11px] ${
                i > 0 ? 'border-t border-gray-800/60' : ''
              }`}
            >
              <kbd className="font-mono text-indigo-400 bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">
                {s.keys}
              </kbd>
              <span className="text-gray-400 text-right">
                {s.action}
                {s.note && <span className="text-gray-600 ml-1">({s.note})</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
