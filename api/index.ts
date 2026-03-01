/**
 * Vercel serverless entry point (repo root /api/).
 * Cold-start: builds shared + server via buildCommand, then
 * this handler lazily initializes storage and delegates to Express.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

let handler: ((req: VercelRequest, res: VercelResponse) => void) | null = null;

export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!handler) {
    const { app, initStorage } = await import('../packages/server/dist/app.js');
    await initStorage();
    handler = app as unknown as (req: VercelRequest, res: VercelResponse) => void;
  }
  handler(req, res);
}
