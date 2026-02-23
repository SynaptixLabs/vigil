/**
 * @file options.tsx
 * @description Global settings page for Refine.
 */
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@popup/popup.css';

const Options = () => {
  const [outputPath, setOutputPath] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['refineOutputPath'], (res) => {
      if (res.refineOutputPath) setOutputPath(res.refineOutputPath);
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set({ refineOutputPath: outputPath.trim() }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-8 flex justify-center font-sans">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-indigo-500">⬡</span> Refine Settings
        </h1>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Publish Configuration</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              Global Output Path
            </label>
            <p className="text-xs text-gray-500 mb-3">
              When publishing sessions, files will be downloaded to this local directory structure: <br/>
              <code className="text-indigo-400 bg-indigo-900/30 px-1 rounded">&lt;Global Output Path&gt;/&lt;Project Name&gt;/sessions/&lt;Session ID&gt;/</code>
            </p>
            <input
              type="text"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="e.g. C:/Users/me/projects/qa-exports"
              value={outputPath}
              onChange={(e) => setOutputPath(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <span className={`text-sm text-green-400 transition-opacity ${saved ? 'opacity-100' : 'opacity-0'}`}>
              ✓ Settings saved
            </span>
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<Options />);
}
