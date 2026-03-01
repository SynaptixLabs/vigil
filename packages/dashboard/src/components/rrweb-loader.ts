/**
 * Thin loader for rrweb-player. Extracted to a separate module to
 * enable clean mocking in unit tests (vi.mock only intercepts static
 * module resolution, not dynamic import() in some vitest versions).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadRrwebPlayer(): Promise<any> {
  const mod = await import('rrweb-player');
  return mod.default || mod.Player;
}
