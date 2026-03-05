import { Router } from 'express';
import { getStorage } from '../storage/index.js';

export const featuresRouter = Router();

// GET /api/features?sprint=06&status=open&archived=true
featuresRouter.get('/', async (req, res) => {
  const sprint = req.query.sprint as string | undefined;
  const status = req.query.status as 'open' | 'done' | undefined;
  const includeArchived = req.query.archived === 'true';

  try {
    const features = await getStorage().listFeatures(sprint, status, includeArchived);
    res.json({ features, count: features.length });
  } catch (err) {
    console.error('[vigil-server] Error listing features:', err);
    res.status(500).json({ error: 'Failed to list features' });
  }
});

// GET /api/features/:id
featuresRouter.get('/:id', async (req, res) => {
  const featId = req.params.id;
  const sprint = req.query.sprint as string | undefined;

  try {
    const feature = await getStorage().getFeature(featId, sprint);
    if (!feature) {
      res.status(404).json({ error: `Feature ${featId} not found` });
      return;
    }
    res.json(feature);
  } catch (err) {
    console.error('[vigil-server] Error getting feature:', err);
    res.status(500).json({ error: 'Failed to get feature' });
  }
});

// PATCH /api/features/:id/archive — archive a feature (soft-delete)
featuresRouter.patch('/:id/archive', async (req, res) => {
  try {
    const archived = await getStorage().archiveFeature(req.params.id);
    if (!archived) {
      res.status(404).json({ error: `Feature ${req.params.id} not found` });
      return;
    }
    res.json({ ok: true, archivedId: req.params.id });
  } catch (err) {
    console.error('[vigil-server] Error archiving feature:', err);
    res.status(500).json({ error: 'Failed to archive feature' });
  }
});

// PATCH /api/features/:id/restore — restore an archived feature
featuresRouter.patch('/:id/restore', async (req, res) => {
  try {
    const restored = await getStorage().restoreFeature(req.params.id);
    if (!restored) {
      res.status(404).json({ error: `Feature ${req.params.id} not found or not archived` });
      return;
    }
    res.json({ ok: true, restoredId: req.params.id });
  } catch (err) {
    console.error('[vigil-server] Error restoring feature:', err);
    res.status(500).json({ error: 'Failed to restore feature' });
  }
});
