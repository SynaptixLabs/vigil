import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { listBugs, getBug, listFeatures, getFeature, listSessions, getSession } from '../filesystem/reader.js';
import { writeBug, writeFeature, writeSessionJson, updateBug, closeBug } from '../filesystem/writer.js';
import { nextBugId, nextFeatId, currentBugCount, currentFeatCount } from '../filesystem/counter.js';
import { getProjectRoot, getVigilDataDir, loadConfig } from '../config.js';
import type { StorageProvider, SprintInfo, ProjectRecord, ProjectCreate, ProjectUpdate } from './types.js';
import type { Bug, Feature, VIGILSession, BugFile, FeatureFile, BugUpdate } from '../types.js';

// ── JSON-file project store (.vigil/projects.json) ────────────────────────────

function projectsFilePath(): string {
  return resolve(getVigilDataDir(), 'projects.json');
}

async function readProjects(): Promise<ProjectRecord[]> {
  try {
    const raw = await readFile(projectsFilePath(), 'utf8');
    return JSON.parse(raw) as ProjectRecord[];
  } catch {
    return [];
  }
}

async function writeProjects(projects: ProjectRecord[]): Promise<void> {
  const dir = getVigilDataDir();
  await mkdir(dir, { recursive: true });
  await writeFile(projectsFilePath(), JSON.stringify(projects, null, 2), 'utf8');
}

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

  // ── Projects (.vigil/projects.json) ──────────────────────────────────────────

  async listProjects(includeArchived = false): Promise<ProjectRecord[]> {
    const all = await readProjects();
    return includeArchived ? all : all.filter(p => !p.archivedAt);
  }

  async getProject(id: string): Promise<ProjectRecord | null> {
    const all = await readProjects();
    return all.find(p => p.id === id) ?? null;
  }

  async createProject(p: ProjectCreate): Promise<string> {
    const all = await readProjects();
    const now = new Date().toISOString();
    const record: ProjectRecord = {
      id: p.id,
      name: p.name,
      description: p.description,
      currentSprint: p.currentSprint,
      url: p.url,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    };
    all.push(record);
    await writeProjects(all);
    return p.id;
  }

  async updateProject(id: string, fields: ProjectUpdate): Promise<boolean> {
    const all = await readProjects();
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) return false;
    const filtered = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
    if (Object.keys(filtered).length === 0) return false;
    Object.assign(all[idx], filtered, { updatedAt: new Date().toISOString() });
    await writeProjects(all);
    return true;
  }

  async deleteProject(id: string): Promise<boolean> {
    const all = await readProjects();
    const before = all.length;
    const filtered = all.filter(p => p.id !== id);
    if (filtered.length === before) return false;
    await writeProjects(filtered);
    return true;
  }

  // ── Archive / Restore ──────────────────────────────────────────────────────

  async archiveProject(id: string): Promise<boolean> {
    const all = await readProjects();
    const project = all.find(p => p.id === id);
    if (!project || project.archivedAt) return false;
    project.archivedAt = new Date().toISOString();
    project.updatedAt = new Date().toISOString();
    await writeProjects(all);
    return true;
  }

  async restoreProject(id: string): Promise<boolean> {
    const all = await readProjects();
    const project = all.find(p => p.id === id);
    if (!project || !project.archivedAt) return false;
    project.archivedAt = null;
    project.updatedAt = new Date().toISOString();
    await writeProjects(all);
    return true;
  }
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
