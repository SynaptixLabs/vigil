/**
 * @file ChangelogModal.tsx
 * @description In-app changelog viewer. Renders CHANGELOG.md content
 * in a scrollable modal. "What's New" badge shown when VERSION has changed.
 */

import React from 'react';
import changelogContent from '../../../WHATSNEW.md?raw';

interface ChangelogModalProps {
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose }) => {
  const sections = changelogContent
    .split(/(?=^## \[)/m)
    .filter(Boolean)
    .slice(0, 5); // show last 5 releases max

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-h-[80%] bg-gray-900 border-t border-gray-700 rounded-t-2xl flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-bold text-white">What&apos;s New</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg leading-none transition-colors"
            aria-label="Close changelog"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-3 flex flex-col gap-4 text-xs text-gray-300">
          {sections.map((section, i) => {
            const lines = section.trim().split('\n');
            const heading = lines[0] ?? '';
            const body = lines.slice(1).join('\n').trim();
            const versionMatch = heading.match(/\[([^\]]+)\]/);
            const version = versionMatch?.[1] ?? '';
            const dateMatch = heading.match(/- (\d{4}-\d{2}-\d{2})/);
            const date = dateMatch?.[1] ?? '';

            return (
              <div key={i}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-indigo-400 font-bold">v{version}</span>
                  {i === 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-700 font-semibold">
                      LATEST
                    </span>
                  )}
                  {date && <span className="text-gray-500">{date}</span>}
                </div>
                <div className="text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {body
                    .split('\n')
                    .map((line, j) => {
                      // Strip markdown formatting: **bold**, `code`, *italic*
                      const clean = (s: string) =>
                        s.replace(/\*\*([^*]+)\*\*/g, '$1')
                          .replace(/`([^`]+)`/g, '$1')
                          .replace(/\*([^*]+)\*/g, '$1');
                      if (line.startsWith('### ')) {
                        return (
                          <p key={j} className="font-semibold text-gray-200 mt-2 mb-1">
                            {clean(line.replace('### ', ''))}
                          </p>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <p key={j} className="pl-2 text-gray-400">
                            • {clean(line.slice(2))}
                          </p>
                        );
                      }
                      return line ? <p key={j} className="text-gray-500">{clean(line)}</p> : null;
                    })
                    .filter(Boolean)}
                </div>
                {i < sections.length - 1 && (
                  <div className="border-t border-gray-800 mt-3" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
