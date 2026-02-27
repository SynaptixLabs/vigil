import { Router } from 'express';
import { loadConfig } from '../config.js';

export const suggestRouter = Router();

suggestRouter.post('/suggest', async (_req, res) => {
  const config = loadConfig();

  if (config.llmMode === 'mock') {
    res.json({
      suggestion: 'Mock suggestion — LLM not connected (Sprint 07)',
      confidence: 0.0,
      model_used: 'mock',
    });
    return;
  }

  // Sprint 07: forward to AGENTS platform
  res.status(501).json({
    error: 'Live LLM mode not implemented — coming in Sprint 07',
  });
});
