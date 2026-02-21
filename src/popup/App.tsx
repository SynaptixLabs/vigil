/**
 * @file App.tsx
 * @description Root component for the SynaptixLabs Refine popup UI.
 */

import React from 'react';
import { PlayCircle } from 'lucide-react';

const App: React.FC = () => {
  // Fetch manifest version for display (fallback for test/non-extension context)
  const version = chrome?.runtime?.getManifest?.()?.version ?? '0.1.0';

  return (
    <div className="w-[350px] min-h-[400px] flex flex-col items-center justify-center p-6 bg-white shadow-xl rounded-lg">
      <div className="flex items-center space-x-3 mb-4">
        <PlayCircle className="w-8 h-8 text-blue-600" />
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">SynaptixLabs Refine</h1>
      </div>
      
      <p className="text-sm text-gray-500 mb-8 font-mono bg-gray-100 px-2 py-1 rounded">v{version}</p>
      
      <div className="flex-1 w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-md bg-gray-50/50 p-6">
        <p className="text-gray-400 font-medium mb-1">No sessions yet</p>
        <p className="text-xs text-gray-400 text-center">Sprint 00 Scaffold Complete</p>
      </div>

      <button className="mt-6 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
        New Session
      </button>
    </div>
  );
};

export default App;
