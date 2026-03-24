/**
 * @file sidepanel.tsx
 * @description Entry point for the Chrome Side Panel.
 * Sprint 09: Uses dedicated SidePanelApp with smart project detection
 * instead of reusing the popup App.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import SidePanelApp from './SidePanelApp';
import '@popup/popup.css';

const container = document.getElementById('root');
if (!container) throw new Error('[Vigil] Missing root element in sidepanel.html');

createRoot(container).render(
  <React.StrictMode>
    <SidePanelApp />
  </React.StrictMode>
);
