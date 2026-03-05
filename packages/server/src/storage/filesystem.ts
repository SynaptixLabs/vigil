import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { listBugs, getBug, listFeatures, getFeature, listSessions, getSession } from '../filesystem/reader.js';
import { writeBug, writeFeature, writeSessionJson, updateBug, closeBug } from '../filesystem/writer.js';
import { nextBugId, nextFeatId, currentBugCount, currentFeatCount } from '../filesystem/counter.js';
import { getProjectRoot, loadConfig } from '../config.js';
import type { StorageProvider, SprintInfo, ProjectRecord, ProjectCreate, ProjectUpdate } from './types.js';
import type { Bug, Feature, VIGILSession, BugFile, FeatureFile, BugUpdate } from '../types.js';

export class FilesystemStorage implements StorageProvider {
  readonly name = 'filesystem';

  listBugs(sprint?: string, status?: 'open' | 'fixed', _includeArchived?: boolean): Promise<BugFile[]> {
    return listBugs(sprint, status);
  }

  getBug(bugId: string, sprint?: string): Promise<BugFile | null> {
    return getBug(bugId, sprint);
  }

  writeBug(bug: Bug, sprint?: string): Promise<string> {
    return writeBug(bug, sprint);
  }

  updateBug(bugId: string, fields: BugUpdate, sprint?: string): Promise<boolean> {
    return updateBug(bugId, fields, sprint);
  }

  closeBug(bugId: string, resolution: string, keepTest: boolean, sprint?: string): Promise<boolean> {
    return closeBug(bugId, resolution, keepTest, sprint);
  }

  listFeatures(sprint?: string, status?: 'open' | 'done', _includeArchived?: boolean): Promise<FeatureFile[]> {
    return listFeatures(sprint, status);
  }

  getFeature(featId: string, sprint?: string): Promise<FeatureFile | null> {
    return getFeature(featId, sprint);
  }

  writeFeature(feat: Feature, sprint?: string): Promise<string> {
    return writeFeature(feat, sprint);
  }

  writeSessionJson(session: VIGILSession): Promise<string> {
    return writeSessionJson(session);
  }

  listSessions(project?: string, sprint?: string, _includeArchived?: boolean): Promise<VIGILSession[]> {
    return listSessions(project, sprint);
  }

  getSession(sessionId: string): Promise<VIGILSession | null> {
    return getSession(sessionId);
  }

  async deleteSession(_sessionId: string): Promise<boolean> {
    // Filesystem deletion not implemented — Neon is primary storage
    return false;
  }

  // ── Projects (not supported in filesystem mode — use Neon) ─────────────────
  async listProjects(_includeArchived?: boolean): Promise<ProjectRecord[]> { return []; }
  async getProject(_id: string): Promise<ProjectRecord | null> { return null; }
  async createProject(_p: ProjectCreate): Promise<string> { throw new Error('Projects require Neon storage'); }
  async updateProject(_id: string, _f: ProjectUpdate): Promise<boolean> { return false; }
  async deleteProject(_id: string): Promise<boolean> { return false; }

  // ── Archive / Restore (not supported in filesystem mode — use Neon) ────────
  async archiveProject(_id: string): Promise<boolean> { return false; }
  async restoreProject(_id: string): Promise<boolean> { return false; }
  async archiveSession(_id: string): Promise<boolean> { return false; }
  async restoreSession(_id: string): Promise<boolean> { return false; }
  async archiveBug(_id: string): Promise<boolean> { return false; }
  async restoreBug(_id: string): Promise<boolean> { return false; }
  async archiveFeature(_id: string): Promise<boolean> { return false; }
  async restoreFeature(_id: string): Promise<boolean> { return false; }

  nextBugId(): Promise<string> {
    return nextBugId();
  }

  nextFeatId(): Promise<string> {
    return nextFeatId();
  }

  currentBugCount(): Promise<number> {
    return currentBugCount();
  }

  currentFeatCount(): Promise<number> {
    return currentFeatCount();
  }

  async listSprints(): Promise<{ sprints: SprintInfo[]; current: string }> {
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
    return { sprints, current };
  }
}
