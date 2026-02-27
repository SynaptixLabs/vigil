import { Router } from 'express';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getProjectRoot, loadConfig } from '../config.js';

export const sprintsRouter = Router();

// GET /api/sprints → list available sprints
sprintsRouter.get('/', async (_req, res) => {
  try {
    const sprintsDir = resolve(getProjectRoot(), 'docs', 'sprints');
    const entries = await readdir(sprintsDir, { withFileTypes: true });

    const sprints = entries
      .filter((e) => e.isDirectory() && e.name.startsWith('sprint_'))
      .map((e) => {
        const id = e.name.replace('sprint_', '');
        return { id, name: e.name };
      })
      .sort((a, b) => a.id.localeCompare(b.id));

    const current = loadConfig().sprintCurrent;

    res.json({ sprints, current });
  } catch (err) {
    console.error('[vigil-server] Error listing sprints:', err);
    res.status(500).json({ error: 'Failed to list sprints' });
  }
});
