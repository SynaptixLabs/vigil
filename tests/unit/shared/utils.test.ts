import { describe, it, expect } from 'vitest';
import { generateSessionId, formatTimestamp, generateBugId } from '@shared/utils';

describe('Shared Utils', () => {
  describe('generateSessionId', () => {
    it('should generate an ID in the correct format', () => {
      const id = generateSessionId();
      expect(id).toMatch(/^ats-\d{4}-\d{2}-\d{2}-\d{3}$/);
    });

    it('should use provided date and sequence', () => {
      const testDate = new Date('2026-02-21T10:00:00Z');
      const id = generateSessionId(testDate, 42);
      expect(id).toBe('ats-2026-02-21-042');
    });

    it('should pad single digit dates correctly', () => {
      const testDate = new Date('2026-01-05T10:00:00Z');
      const id = generateSessionId(testDate, 1);
      expect(id).toBe('ats-2026-01-05-001');
    });
  });

  describe('formatTimestamp', () => {
    it('should format epoch timestamp into readable string', () => {
      // Using a fixed timezone could cause test flakiness across environments,
      // so we use the local timezone equivalent of a known date.
      const testDate = new Date(2026, 1, 21, 14, 30, 45); // Feb 21, 2026 14:30:45 local time
      const timestamp = testDate.getTime();
      
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toBe('2026-02-21 14:30:45');
    });
  });

  describe('generateBugId', () => {
    it('should generate an ID with the bug- prefix', () => {
      const id = generateBugId();
      expect(id).toMatch(/^bug-[a-z0-9]{5}$/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      const count = 100;
      
      for (let i = 0; i < count; i++) {
        ids.add(generateBugId());
      }
      
      // The chance of collision in 100 random 5-char base36 strings is negligible
      expect(ids.size).toBe(count);
    });
  });
});
