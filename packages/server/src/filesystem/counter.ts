import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getVigilDataDir } from '../config.js';

async function ensureVigilDir(): Promise<string> {
  const dir = getVigilDataDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

async function readCounter(filePath: string): Promise<number> {
  try {
    const content = await readFile(filePath, 'utf8');
    const value = parseInt(content.trim(), 10);
    return isNaN(value) ? 0 : value;
  } catch {
    return 0;
  }
}

async function incrementCounter(filePath: string): Promise<number> {
  const current = await readCounter(filePath);
  const next = current + 1;
  await writeFile(filePath, String(next), 'utf8');
  return next;
}

export async function nextBugId(): Promise<string> {
  const dir = await ensureVigilDir();
  const counterPath = resolve(dir, 'bugs.counter');
  const next = await incrementCounter(counterPath);
  return `BUG-${String(next).padStart(3, '0')}`;
}

export async function nextFeatId(): Promise<string> {
  const dir = await ensureVigilDir();
  const counterPath = resolve(dir, 'features.counter');
  const next = await incrementCounter(counterPath);
  return `FEAT-${String(next).padStart(3, '0')}`;
}

export async function currentBugCount(): Promise<number> {
  const dir = await ensureVigilDir();
  return readCounter(resolve(dir, 'bugs.counter'));
}

export async function currentFeatCount(): Promise<number> {
  const dir = await ensureVigilDir();
  return readCounter(resolve(dir, 'features.counter'));
}
