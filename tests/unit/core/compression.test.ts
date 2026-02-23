import { describe, it, expect } from 'vitest';
import { compressEvents, decompressEvents } from '@core/compression';

describe('compression utility', () => {
  it('compresses and decompresses an array of events identically', async () => {
    const originalEvents = [
      { type: 4, data: { href: 'http://localhost' }, timestamp: 1000 },
      { type: 2, data: { node: { id: 1 } }, timestamp: 2000 },
      { type: 3, data: { source: 1, text: 'hello' }, timestamp: 3000 }
    ];

    const compressedBase64 = await compressEvents(originalEvents);
    
    expect(typeof compressedBase64).toBe('string');
    expect(compressedBase64.length).toBeGreaterThan(0);
    // Compressed string shouldn't be plain JSON
    expect(compressedBase64).not.toContain('http://localhost');

    const decompressedEvents = await decompressEvents(compressedBase64);
    
    expect(decompressedEvents).toEqual(originalEvents);
  });

  it('handles empty arrays', async () => {
    const compressed = await compressEvents([]);
    const decompressed = await decompressEvents(compressed);
    expect(decompressed).toEqual([]);
  });

  it('handles large event payloads', async () => {
    const largeEvents = Array.from({ length: 1000 }).map((_, i) => ({
      type: 3,
      data: { source: 2, positions: [{ x: i, y: i, id: 1, timeOffset: i * 10 }] },
      timestamp: 1000 + i * 10
    }));

    const compressed = await compressEvents(largeEvents);
    const decompressed = await decompressEvents(compressed);
    
    expect(decompressed).toEqual(largeEvents);
    // Ensure actual compression happened (base64 size vs JSON size)
    const jsonSize = JSON.stringify(largeEvents).length;
    const base64Size = compressed.length;
    expect(base64Size).toBeLessThan(jsonSize);
  });
});
