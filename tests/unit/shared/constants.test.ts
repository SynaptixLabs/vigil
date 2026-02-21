import { describe, it, expect } from 'vitest';
import { SESSION_ID_FORMAT, SELECTOR_PRIORITIES, LIMITS, DEFAULT_VALUES } from '@shared/constants';

describe('Shared Constants', () => {
  describe('SESSION_ID_FORMAT', () => {
    it('should match valid session IDs', () => {
      const validIds = [
        'ats-2026-02-21-001',
        'ats-2024-12-31-999',
        'ats-2000-01-01-000'
      ];
      
      validIds.forEach(id => {
        expect(SESSION_ID_FORMAT.test(id)).toBe(true);
      });
    });

    it('should reject invalid session IDs', () => {
      const invalidIds = [
        'ats-2026-2-21-001', // missing leading zero in month
        'ats-26-02-21-001', // two digit year
        'ats-2026-02-21-1', // single digit sequence
        'session-2026-02-21-001', // wrong prefix
        'ats-2026-02-21-001-extra', // extra text
        'prefix-ats-2026-02-21-001', // leading text
        'ats-2026/02/21-001', // wrong separator
        ''
      ];
      
      invalidIds.forEach(id => {
        expect(SESSION_ID_FORMAT.test(id)).toBe(false);
      });
    });
  });

  describe('SELECTOR_PRIORITIES', () => {
    it('should be an array of strings in correct order', () => {
      expect(Array.isArray(SELECTOR_PRIORITIES)).toBe(true);
      expect(SELECTOR_PRIORITIES).toEqual(['data-testid', 'aria-label', 'id', 'css']);
    });
  });

  describe('LIMITS', () => {
    it('should define core application limits', () => {
      expect(LIMITS).toHaveProperty('MAX_SESSION_DURATION_MS');
      expect(LIMITS).toHaveProperty('MAX_EVENTS_PER_SESSION');
      expect(LIMITS).toHaveProperty('MAX_BUGS_PER_SESSION');
      expect(LIMITS).toHaveProperty('MAX_FEATURES_PER_SESSION');
      
      expect(typeof LIMITS.MAX_SESSION_DURATION_MS).toBe('number');
      expect(LIMITS.MAX_SESSION_DURATION_MS).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_VALUES', () => {
    it('should define default enum-like values', () => {
      expect(DEFAULT_VALUES).toHaveProperty('BUG_PRIORITY', 'P2');
      expect(DEFAULT_VALUES).toHaveProperty('FEATURE_TYPE', 'ENHANCEMENT');
    });
  });
});
