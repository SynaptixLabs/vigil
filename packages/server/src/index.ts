import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

// Load .env from project root (two levels up from packages/server/)
loadEnv({ path: resolve(import.meta.dirname, '..', '..', '..', '.env') });

import { app, initStorage } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const PORT = config.serverPort;
// Local filesystem mode is private by default. An internal container ingress
// may explicitly bind all interfaces behind its own IAM/network gate.
const HOST = process.env.VIGIL_BIND_HOST === '0.0.0.0' ? '0.0.0.0' : '127.0.0.1';

initStorage().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`[vigil-server] running on http://${HOST}:${PORT}`);
    console.log(`[vigil-server] health: http://localhost:${PORT}/health`);
    console.log(`[vigil-server] LLM mode: ${config.llmMode}`);
  });
}).catch((err) => {
  console.error('[vigil-server] Failed to initialize storage:', err);
  process.exit(1);
});
