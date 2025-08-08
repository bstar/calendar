import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RestrictionBackgroundGenerator } from './RestrictionBackgroundGenerator';
import { RestrictionConfig } from './types';

describe('RestrictionBackgroundGenerator - Timezone Handling', () => {
  describe('boundary restriction timezone consistency', () => {
    it('should handle after boundary consistently across timezones', () => {
      const config: RestrictionConfig = {
        restrictions: [{
          type: 'boundary',
          enabled: true,
          date: '2025-06-15',
          direction: 'after'
        }]
      };
      const generator = new RestrictionBackgroundGenerator(config);
      
      // Test dates that are on the boundary edge
      // June 15, 2025 at 23:59:59.999 UTC should NOT be restricted
      const endOfBoundaryDay = new Date('2025-06-15T23:59:59.999Z');
      expect(generator.generateBackground(endOfBoundaryDay)).toBeUndefined();
      
      // June 16, 2025 at 00:00:00.000 UTC SHOULD be restricted
      const startOfNextDay = new Date('2025-06-16T00:00:00.000Z');
      expect(generator.generateBackground(startOfNextDay)).toBe('rgba(0, 0, 0, 0.1)');
      
      // Test with dates created using Date constructor (local timezone)
      // These should work consistently regardless of system timezone
      const june15Local = new Date(2025, 5, 15, 12, 0, 0); // June 15, noon local time
      const june16Local = new Date(2025, 5, 16, 12, 0, 0); // June 16, noon local time
      
      // June 15 should not be restricted (it's the boundary date)
      expect(generator.generateBackground(june15Local)).toBeUndefined();
      
      // June 16 should be restricted (after the boundary)
      expect(generator.generateBackground(june16Local)).toBe('rgba(0, 0, 0, 0.1)');
    });

    it('should handle before boundary consistently', () => {
      const config: RestrictionConfig = {
        restrictions: [{
          type: 'boundary',
          enabled: true,
          date: '2025-06-15',
          direction: 'before'
        }]
      };
      const generator = new RestrictionBackgroundGenerator(config);
      
      // June 14 should be restricted (before boundary)
      const june14 = new Date('2025-06-14T12:00:00Z');
      expect(generator.generateBackground(june14)).toBe('rgba(0, 0, 0, 0.1)');
      
      // June 15 should NOT be restricted (is the boundary)
      const june15 = new Date('2025-06-15T00:00:00Z');
      expect(generator.generateBackground(june15)).toBeUndefined();
      
      // June 15 at any time should NOT be restricted
      const june15End = new Date('2025-06-15T23:59:59Z');
      expect(generator.generateBackground(june15End)).toBeUndefined();
      
      // June 16 should NOT be restricted (after boundary)
      const june16 = new Date('2025-06-16T00:00:00Z');
      expect(generator.generateBackground(june16)).toBeUndefined();
    });

    it('should handle boundary at year transitions', () => {
      const config: RestrictionConfig = {
        restrictions: [{
          type: 'boundary',
          enabled: true,
          date: '2025-12-31',
          direction: 'after'
        }]
      };
      const generator = new RestrictionBackgroundGenerator(config);
      
      // December 31, 2025 should NOT be restricted
      const dec31 = new Date('2025-12-31T23:59:59.999Z');
      expect(generator.generateBackground(dec31)).toBeUndefined();
      
      // January 1, 2026 should be restricted
      const jan1 = new Date('2026-01-01T00:00:00.000Z');
      expect(generator.generateBackground(jan1)).toBe('rgba(0, 0, 0, 0.1)');
    });

    it('should handle dates created in different ways consistently', () => {
      const config: RestrictionConfig = {
        restrictions: [{
          type: 'boundary',
          enabled: true,
          date: '2025-06-15',
          direction: 'after'
        }]
      };
      const generator = new RestrictionBackgroundGenerator(config);
      
      // All these represent June 16, 2025 and should be restricted
      const june16ISO = new Date('2025-06-16');
      const june16Constructor = new Date(2025, 5, 16);
      const june16Timestamp = new Date(Date.UTC(2025, 5, 16));
      
      expect(generator.generateBackground(june16ISO)).toBe('rgba(0, 0, 0, 0.1)');
      expect(generator.generateBackground(june16Constructor)).toBe('rgba(0, 0, 0, 0.1)');
      expect(generator.generateBackground(june16Timestamp)).toBe('rgba(0, 0, 0, 0.1)');
      
      // All these represent June 15, 2025 and should NOT be restricted
      const june15ISO = new Date('2025-06-15');
      const june15Constructor = new Date(2025, 5, 15);
      const june15Timestamp = new Date(Date.UTC(2025, 5, 15));
      
      expect(generator.generateBackground(june15ISO)).toBeUndefined();
      expect(generator.generateBackground(june15Constructor)).toBeUndefined();
      expect(generator.generateBackground(june15Timestamp)).toBeUndefined();
    });
  });
});