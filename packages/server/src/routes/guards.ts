import { createHash, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { SPRINT_LABEL_PATTERN } from '@synaptix/vigil-shared';

/** `?sprint=` must be one safe path segment (no traversal into docs/sprints). */
export function rejectBadSprint(req: Request, res: Response, next: NextFunction): void {
  const sprint = req.query.sprint;
  if (sprint !== undefined && (typeof sprint !== 'string' || !SPRINT_LABEL_PATTERN.test(sprint))) {
    res.status(400).json({ error: 'Invalid sprint' });
    return;
  }
  next();
}

export const SERVICE_TOKEN_ENV = 'VIGIL_SERVICE_TOKEN';
export const SERVICE_TOKEN_HEADER = 'x-vigil-service-token';

const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest();

/** Review writes (HappySeniors F3) need the shared service credential, compared
 * in constant time. No credential configured = review writes refused. */
export function hasServiceToken(req: Request, res: Response): boolean {
  const expected = process.env[SERVICE_TOKEN_ENV];
  if (!expected) {
    res.status(503).json({ error: 'Review writes are not configured' });
    return false;
  }
  const given = req.get(SERVICE_TOKEN_HEADER);
  if (typeof given !== 'string' || !timingSafeEqual(digest(given), digest(expected))) {
    res.status(401).json({ error: 'Service credential required' });
    return false;
  }
  return true;
}

/** CORS: loopback, the Chrome extension, and the comma-separated origins in
 * VIGIL_CORS_ORIGINS (the HS origins). Server-to-server calls send no Origin. */
export function corsOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  if (origin.startsWith('chrome-extension://')) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/.test(origin)) return true;
  const allowed = (process.env.VIGIL_CORS_ORIGINS ?? '').split(',').map((v) => v.trim()).filter(Boolean);
  return allowed.includes(origin);
}
