import { describe, it, expect } from 'vitest';
import { generateSessionId, formatTimestamp, generateBugId, extractProjectName, generateSessionName } from '@shared/utils';

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
      const testDate = new Date(2026, 1, 21, 14, 30, 45);
      const timestamp = testDate.getTime();
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toBe('2026-02-21 14:30:45');
    });
  });

  describe('generateBugId', () => {
    it('should generate an ID with bug- prefix and 8-char hex segment', () => {
      const id = generateBugId();
      expect(id).toMatch(/^bug-[0-9a-f]{8}$/);
    });

    it('should generate unique IDs across 100 calls', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) ids.add(generateBugId());
      expect(ids.size).toBe(100);
    });
  });

  describe('extractProjectName', () => {
    it('should extract last segment from a Unix path', () => {
      expect(extractProjectName('/home/user/projects/vigil')).toBe('vigil');
    });

    it('should extract last segment from a Windows path', () => {
      expect(extractProjectName('C:\\Synaptix-Labs\\projects\\vigil')).toBe('vigil');
    });

    it('should handle mixed separators', () => {
      expect(extractProjectName('C:\\Users/dev\\projects/nightingale')).toBe('nightingale');
    });

    it('should handle trailing slashes', () => {
      expect(extractProjectName('/projects/vigil/')).toBe('vigil');
    });

    it('should handle single segment path', () => {
      expect(extractProjectName('vigil')).toBe('vigil');
    });

    it('should return "session" for empty string', () => {
      expect(extractProjectName('')).toBe('session');
    });

    it('should return "session" for path with only separators', () => {
      expect(extractProjectName('///')).toBe('session');
    });
  });

  describe('generateSessionName', () => {
    const fixedDate = new Date('2026-03-01T12:00:00Z');

    it('should produce name in format {project}-session-{date}-{seq}', () => {
      const name = generateSessionName('/projects/vigil', 1, fixedDate);
      expect(name).toBe('vigil-session-2026-03-01-001');
    });

    it('should zero-pad the sequence number to 3 digits', () => {
      expect(generateSessionName('/projects/vigil', 7, fixedDate)).toBe(
        'vigil-session-2026-03-01-007',
      );
      expect(generateSessionName('/projects/vigil', 42, fixedDate)).toBe(
        'vigil-session-2026-03-01-042',
      );
    });

    it('should handle Windows paths', () => {
      const name = generateSessionName('C:\\Synaptix-Labs\\projects\\papyrus', 3, fixedDate);
      expect(name).toBe('papyrus-session-2026-03-01-003');
    });

    it('should use current date when no date argument provided', () => {
      const name = generateSessionName('/projects/vigil', 1);
      // Just check the format — actual date varies by runtime
      expect(name).toMatch(/^vigil-session-\d{4}-\d{2}-\d{2}-001$/);
    });

    it('should handle large sequence numbers', () => {
      const name = generateSessionName('/projects/vigil', 999, fixedDate);
      expect(name).toBe('vigil-session-2026-03-01-999');
    });

    it('should use "session" as project name for empty path', () => {
      const name = generateSessionName('', 1, fixedDate);
      expect(name).toBe('session-session-2026-03-01-001');
    });
  });
});
