import { Router } from 'express';
import { getStorage } from '../storage/index.js';
import { BugUpdateSchema } from '@synaptix/vigil-shared';

export const bugsRouter = Router();

// GET /api/bugs?sprint=06&status=open&archived=true
bugsRouter.get('/', async (req, res) => {
  const sprint = req.query.sprint as string | undefined;
  const status = req.query.status as 'open' | 'fixed' | undefined;
  const includeArchived = req.query.archived === 'true';

  try {
    const bugs = await getStorage().listBugs(sprint, status, includeArchived);
    res.json({ bugs, count: bugs.length });
  } catch (err) {
    console.error('[vigil-server] Error listing bugs:', err);
    res.status(500).json({ error: 'Failed to list bugs' });
  }
});

// GET /api/bugs/:id
bugsRouter.get('/:id', async (req, res) => {
  const bugId = req.params.id;
  const sprint = req.query.sprint as string | undefined;

  try {
    const bug = await getStorage().getBug(bugId, sprint);
    if (!bug) {
      res.status(404).json({ error: `Bug ${bugId} not found` });
      return;
    }
    res.json(bug);
  } catch (err) {
    console.error('[vigil-server] Error getting bug:', err);
    res.status(500).json({ error: 'Failed to get bug' });
  }
});

// PATCH /api/bugs/:id
bugsRouter.patch('/:id', async (req, res) => {
  const bugId = req.params.id;
  const sprint = req.query.sprint as string | undefined;

  const result = BugUpdateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid update fields', details: result.error.issues });
    return;
  }

  try {
    const updated = await getStorage().updateBug(bugId, result.data, sprint);
    if (!updated) {
      res.status(404).json({ error: `Bug ${bugId} not found` });
      return;
    }
    res.json({ updated: true, bugId });
  } catch (err) {
    console.error('[vigil-server] Error updating bug:', err);
    res.status(500).json({ error: 'Failed to update bug' });
  }
});

// POST /api/bugs/:id/close
bugsRouter.post('/:id/close', async (req, res) => {
  const bugId = req.params.id;
  const { resolution, keepTest } = req.body;
  const sprint = req.query.sprint as string | undefined;

  if (!resolution || typeof keepTest !== 'boolean') {
    res.status(400).json({ error: 'Required: resolution (string), keepTest (boolean)' });
    return;
  }

  try {
    const closed = await getStorage().closeBug(bugId, resolution, keepTest, sprint);
    if (!closed) {
      res.status(404).json({ error: `Bug ${bugId} not found in open/` });
      return;
    }
    res.json({ closed: true, bugId });
  } catch (err) {
    console.error('[vigil-server] Error closing bug:', err);
    res.status(500).json({ error: 'Failed to close bug' });
  }
});

// PATCH /api/bugs/:id/archive — archive a bug (soft-delete)
bugsRouter.patch('/:id/archive', async (req, res) => {
  try {
    const archived = await getStorage().archiveBug(req.params.id);
    if (!archived) {
      res.status(404).json({ error: `Bug ${req.params.id} not found` });
      return;
    }
    res.json({ ok: true, archivedId: req.params.id });
  } catch (err) {
    console.error('[vigil-server] Error archiving bug:', err);
    res.status(500).json({ error: 'Failed to archive bug' });
  }
});

// PATCH /api/bugs/:id/restore — restore an archived bug
bugsRouter.patch('/:id/restore', async (req, res) => {
  try {
    const restored = await getStorage().restoreBug(req.params.id);
    if (!restored) {
      res.status(404).json({ error: `Bug ${req.params.id} not found or not archived` });
      return;
    }
    res.json({ ok: true, restoredId: req.params.id });
  } catch (err) {
    console.error('[vigil-server] Error restoring bug:', err);
    res.status(500).json({ error: 'Failed to restore bug' });
  }
});
