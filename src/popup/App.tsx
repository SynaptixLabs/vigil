/**
 * @file App.tsx
 * @description Root component for the Refine popup. State-based routing between pages.
 */

import React, { useState } from 'react';
import SessionList from './pages/SessionList';
import NewSession from './pages/NewSession';
import type { Session } from '@shared/types';

type Page = 'list' | 'new';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('list');
  const [_lastSession, setLastSession] = useState<Session | null>(null);

  const handleCreated = (session: Session) => {
    setLastSession(session);
    setPage('list');
  };

  return (
    <div className="w-[360px] h-[520px] bg-gray-950 text-white flex flex-col overflow-hidden">
      {page === 'list' && (
        <SessionList onNewSession={() => setPage('new')} />
      )}
      {page === 'new' && (
        <NewSession onBack={() => setPage('list')} onCreated={handleCreated} />
      )}
    </div>
  );
};

export default App;
