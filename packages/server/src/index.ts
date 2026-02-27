import express from 'express';
import cors from 'cors';
import { resolve } from 'node:path';
import { loadConfig } from './config.js';
import { sessionRouter } from './routes/session.js';
import { bugsRouter } from './routes/bugs.js';
import { featuresRouter } from './routes/features.js';
import { sprintsRouter } from './routes/sprints.js';
import { suggestRouter } from './routes/suggest.js';

const config = loadConfig();
const app = express();
const PORT = config.serverPort;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    llmMode: config.llmMode,
    port: PORT,
  });
});

// API routes
app.use('/api/session', sessionRouter);
app.use('/api/bugs', bugsRouter);
app.use('/api/features', featuresRouter);
app.use('/api/sprints', sprintsRouter);
app.use('/api/vigil', suggestRouter);

// Serve dashboard static files
app.use('/dashboard', express.static(resolve(import.meta.dirname, '..', 'public')));

app.listen(PORT, () => {
  console.log(`[vigil-server] running on http://localhost:${PORT}`);
  console.log(`[vigil-server] health: http://localhost:${PORT}/health`);
  console.log(`[vigil-server] LLM mode: ${config.llmMode}`);
});

export { app };
