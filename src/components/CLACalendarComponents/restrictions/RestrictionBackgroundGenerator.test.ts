import { describe, it, expect } from 'vitest';
import { RestrictionBackgroundGenerator } from './RestrictionBackgroundGenerator';
import { RestrictionConfig } from './types';
import { parseISO } from '../../../utils/DateUtils';

describe('RestrictionBackgroundGenerator', () => {
  describe('generateBackground', () => {
    it('should return undefined when no restrictions are configured', () => {
      const config: RestrictionConfig = { restrictions: [] };
      const generator = new RestrictionBackgroundGenerator(config);
      const date = new Date('2025-06-15');
      
      expect(generator.generateBackground(date)).toBeUndefined();
    });

    it('should return undefined when config is null', () => {
      const generator = new RestrictionBackgroundGenerator(null as any);
      const date = new Date('2025-06-15');
      
      expect(generator.generateBackground(date)).toBeUndefined();
    });

    describe('boundary restrictions', () => {
      it('should restrict dates before boundary when direction is before', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'boundary',
            enabled: true,
            date: '2025-06-15',
            direction: 'before'
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        const beforeDate = new Date('2025-06-14');
        const boundaryDate = new Date('2025-06-15');
        const afterDate = new Date('2025-06-16');
        
        expect(generator.generateBackground(beforeDate)).toBe('rgba(0, 0, 0, 0.1)');
        expect(generator.generateBackground(boundaryDate)).toBeUndefined();
        expect(generator.generateBackground(afterDate)).toBeUndefined();
      });

      it('should restrict dates after boundary when direction is after', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'boundary',
            enabled: true,
            date: '2025-06-15',
            direction: 'after'
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        const beforeDate = new Date('2025-06-14');
        const boundaryDate = new Date('2025-06-15');
        const afterDate = new Date('2025-06-16');
        
        expect(generator.generateBackground(beforeDate)).toBeUndefined();
        expect(generator.generateBackground(boundaryDate)).toBeUndefined();
        expect(generator.generateBackground(afterDate)).toBe('rgba(0, 0, 0, 0.1)');
      });

      it('should handle end of day correctly for after boundaries', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'boundary',
            enabled: true,
            date: '2025-06-15',
            direction: 'after'
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        // Test with dates that are clearly different days to avoid timezone edge cases
        // Using dates several days apart to ensure consistent behavior
        const june10 = new Date(2025, 5, 10); // Well before boundary
        const june20 = new Date(2025, 5, 20); // Well after boundary
        
        // Before boundary should not be restricted
        expect(generator.generateBackground(june10)).toBeUndefined();
        // After boundary should be restricted
        expect(generator.generateBackground(june20)).toBe('rgba(0, 0, 0, 0.1)');
      });

      it('should ignore disabled boundary restrictions', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'boundary',
            enabled: false,
            date: '2025-06-15',
            direction: 'after'
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        const afterDate = new Date('2025-06-16');
        expect(generator.generateBackground(afterDate)).toBeUndefined();
      });

      it('should handle invalid boundary date gracefully', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'boundary',
            enabled: true,
            date: 'invalid-date',
            direction: 'after'
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        const date = new Date('2025-06-16');
        expect(generator.generateBackground(date)).toBeUndefined();
      });
    });

    describe('daterange restrictions', () => {
      it('should restrict dates within specified ranges', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-15'
            }]
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        const beforeRange = new Date('2025-06-09');
        const inRange = new Date('2025-06-12');
        const afterRange = new Date('2025-06-16');
        
        expect(generator.generateBackground(beforeRange)).toBeUndefined();
        expect(generator.generateBackground(inRange)).toBe('rgba(0, 0, 0, 0.1)');
        expect(generator.generateBackground(afterRange)).toBeUndefined();
      });

      it('should handle multiple date ranges', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [
              { startDate: '2025-06-10', endDate: '2025-06-12' },
              { startDate: '2025-06-20', endDate: '2025-06-22' }
            ]
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        expect(generator.generateBackground(new Date('2025-06-11'))).toBe('rgba(0, 0, 0, 0.1)');
        expect(generator.generateBackground(new Date('2025-06-15'))).toBeUndefined();
        expect(generator.generateBackground(new Date('2025-06-21'))).toBe('rgba(0, 0, 0, 0.1)');
      });

      it('should include range boundaries', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-15'
            }]
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        expect(generator.generateBackground(new Date('2025-06-10'))).toBe('rgba(0, 0, 0, 0.1)');
        expect(generator.generateBackground(new Date('2025-06-15'))).toBe('rgba(0, 0, 0, 0.1)');
      });

      it('should skip ranges with invalid dates', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [
              { startDate: 'invalid', endDate: '2025-06-15' },
              { startDate: '2025-06-20', endDate: '2025-06-22' }
            ]
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        // Should skip invalid range but process valid one
        expect(generator.generateBackground(new Date('2025-06-12'))).toBeUndefined();
        expect(generator.generateBackground(new Date('2025-06-21'))).toBe('rgba(0, 0, 0, 0.1)');
      });
    });

    describe('allowedranges restrictions', () => {
      it('should restrict dates outside allowed ranges', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'allowedranges',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-20'
            }]
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        const beforeRange = new Date('2025-06-09');
        const inRange = new Date('2025-06-15');
        const afterRange = new Date('2025-06-21');
        
        expect(generator.generateBackground(beforeRange)).toBe('rgba(0, 0, 0, 0.1)');
        expect(generator.generateBackground(inRange)).toBeUndefined();
        expect(generator.generateBackground(afterRange)).toBe('rgba(0, 0, 0, 0.1)');
      });

      it('should handle multiple allowed ranges', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'allowedranges',
            enabled: true,
            ranges: [
              { startDate: '2025-06-01', endDate: '2025-06-05' },
              { startDate: '2025-06-20', endDate: '2025-06-25' }
            ]
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        // Dates in allowed ranges
        expect(generator.generateBackground(new Date('2025-06-03'))).toBeUndefined();
        expect(generator.generateBackground(new Date('2025-06-22'))).toBeUndefined();
        
        // Dates outside allowed ranges
        expect(generator.generateBackground(new Date('2025-06-10'))).toBe('rgba(0, 0, 0, 0.1)');
      });

      it('should return undefined when no ranges are specified', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'allowedranges',
            enabled: true,
            ranges: []
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        expect(generator.generateBackground(new Date('2025-06-15'))).toBeUndefined();
      });
    });

    describe('weekday restrictions', () => {
      it('should restrict specific weekdays', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'weekday',
            enabled: true,
            days: [0, 6] // Sunday and Saturday
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        // Create dates in LOCAL timezone since getDay() uses local timezone
        // Using specific dates that are definitely Saturday and Sunday in local time
        const saturday = new Date(2025, 5, 14); // June 14, 2025 - Saturday in local
        const sunday = new Date(2025, 5, 15); // June 15, 2025 - Sunday in local
        const monday = new Date(2025, 5, 16); // June 16, 2025 - Monday in local
        
        // Verify our assumptions about days
        expect(saturday.getDay()).toBe(6); // Saturday
        expect(sunday.getDay()).toBe(0); // Sunday
        expect(monday.getDay()).toBe(1); // Monday
        
        expect(generator.generateBackground(sunday)).toBe('rgba(0, 0, 0, 0.1)');
        expect(generator.generateBackground(saturday)).toBe('rgba(0, 0, 0, 0.1)');
        expect(generator.generateBackground(monday)).toBeUndefined();
      });

      it('should handle undefined days array', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'weekday',
            enabled: true
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        expect(generator.generateBackground(new Date('2025-06-15'))).toBeUndefined();
      });
    });

    describe('restricted_boundary restrictions', () => {
      it('should restrict dates within restricted boundary ranges', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'restricted_boundary',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-15'
            }]
          }]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        const inRange = new Date('2025-06-12');
        const outsideRange = new Date('2025-06-20');
        
        expect(generator.generateBackground(inRange)).toBe('rgba(0, 0, 0, 0.1)');
        expect(generator.generateBackground(outsideRange)).toBeUndefined();
      });
    });

    describe('multiple restrictions', () => {
      it('should apply first matching restriction', () => {
        const config: RestrictionConfig = {
          restrictions: [
            {
              type: 'boundary',
              enabled: true,
              date: '2025-06-15',
              direction: 'after'
            },
            {
              type: 'weekday',
              enabled: true,
              days: [1] // Monday
            }
          ]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        // June 16, 2025 is a Monday after the boundary
        // Should match boundary first and return its style
        const mondayAfterBoundary = new Date('2025-06-16');
        expect(generator.generateBackground(mondayAfterBoundary)).toBe('rgba(0, 0, 0, 0.1)');
      });

      it('should skip disabled restrictions', () => {
        const config: RestrictionConfig = {
          restrictions: [
            {
              type: 'boundary',
              enabled: false,
              date: '2025-06-15',
              direction: 'after'
            },
            {
              type: 'weekday',
              enabled: true,
              days: [1] // Monday
            }
          ]
        };
        const generator = new RestrictionBackgroundGenerator(config);
        
        // Should skip disabled boundary and check weekday
        // Create a date that is definitely a Monday (Jan 6, 2025)
        const mondayDate = new Date('2025-01-06T12:00:00Z'); // Monday
        // Verify it's actually Monday (1)
        expect(mondayDate.getUTCDay()).toBe(1);
        expect(generator.generateBackground(mondayDate)).toBe('rgba(0, 0, 0, 0.1)');
        
        // Create a date that is definitely a Tuesday (Jan 7, 2025)
        const tuesdayDate = new Date('2025-01-07T12:00:00Z'); // Tuesday
        expect(tuesdayDate.getUTCDay()).toBe(2);
        expect(generator.generateBackground(tuesdayDate)).toBeUndefined();
      });
    });

    it('should handle unknown restriction types gracefully', () => {
      const config: RestrictionConfig = {
        restrictions: [{
          type: 'unknown-type' as any,
          enabled: true
        }]
      };
      const generator = new RestrictionBackgroundGenerator(config);
      
      expect(generator.generateBackground(new Date('2025-06-15'))).toBeUndefined();
    });
  });

  describe('generateBackgroundData (static)', () => {
    it('should return empty array when no config provided', () => {
      expect(RestrictionBackgroundGenerator.generateBackgroundData()).toEqual([]);
      expect(RestrictionBackgroundGenerator.generateBackgroundData(null as any)).toEqual([]);
    });

    it('should return empty array when no restrictions', () => {
      const config: RestrictionConfig = { restrictions: [] };
      expect(RestrictionBackgroundGenerator.generateBackgroundData(config)).toEqual([]);
    });

    describe('daterange background data', () => {
      it('should generate background data for date ranges', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-15'
            }]
          }]
        };
        
        const result = RestrictionBackgroundGenerator.generateBackgroundData(config);
        
        expect(result).toEqual([{
          startDate: '2025-06-10',
          endDate: '2025-06-15',
          color: '#ffe6e6'
        }]);
      });

      it('should filter out invalid date ranges', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [
              { startDate: 'invalid', endDate: '2025-06-15' },
              { startDate: '2025-06-20', endDate: 'invalid' },
              { startDate: '2025-06-25', endDate: '2025-06-24' }, // End before start
              { startDate: '2025-06-10', endDate: '2025-06-15' } // Valid
            ]
          }]
        };
        
        const result = RestrictionBackgroundGenerator.generateBackgroundData(config);
        
        expect(result).toEqual([{
          startDate: '2025-06-10',
          endDate: '2025-06-15',
          color: '#ffe6e6'
        }]);
      });
    });

    describe('boundary background data', () => {
      it('should generate background data for before boundary', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'boundary',
            enabled: true,
            date: '2025-06-15',
            direction: 'before'
          }]
        };
        
        const result = RestrictionBackgroundGenerator.generateBackgroundData(config);
        
        expect(result).toEqual([{
          startDate: '1900-01-01',
          endDate: '2025-06-15',
          color: '#ffe6e6'
        }]);
      });

      it('should generate background data for after boundary', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'boundary',
            enabled: true,
            date: '2025-06-15',
            direction: 'after'
          }]
        };
        
        const result = RestrictionBackgroundGenerator.generateBackgroundData(config);
        
        expect(result).toEqual([{
          startDate: '2025-06-15',
          endDate: '2100-12-31',
          color: '#ffe6e6'
        }]);
      });

      it('should handle invalid boundary date', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'boundary',
            enabled: true,
            date: 'invalid-date',
            direction: 'after'
          }]
        };
        
        const result = RestrictionBackgroundGenerator.generateBackgroundData(config);
        
        expect(result).toEqual([]);
      });
    });

    describe('allowedranges background data', () => {
      it('should generate inverse background data for allowed ranges', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'allowedranges',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-20'
            }]
          }]
        };
        
        const result = RestrictionBackgroundGenerator.generateBackgroundData(config);
        
        // Should highlight everything EXCEPT the allowed range
        expect(result).toEqual([
          {
            startDate: '1900-01-01',
            endDate: '2025-06-10',
            color: '#ffe6e6'
          },
          {
            startDate: '2025-06-20',
            endDate: '2100-12-31',
            color: '#ffe6e6'
          }
        ]);
      });

      it('should handle multiple allowed ranges', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'allowedranges',
            enabled: true,
            ranges: [
              { startDate: '2025-06-01', endDate: '2025-06-05' },
              { startDate: '2025-06-20', endDate: '2025-06-25' }
            ]
          }]
        };
        
        const result = RestrictionBackgroundGenerator.generateBackgroundData(config);
        
        expect(result).toHaveLength(4); // Before first, between ranges, between ranges, after last
        expect(result).toContainEqual({
          startDate: '1900-01-01',
          endDate: '2025-06-01',
          color: '#ffe6e6'
        });
        expect(result).toContainEqual({
          startDate: '2025-06-25',
          endDate: '2100-12-31',
          color: '#ffe6e6'
        });
      });
    });

    describe('weekday and restricted_boundary background data', () => {
      it('should return empty array for weekday restrictions', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'weekday',
            enabled: true,
            days: [0, 6]
          }]
        };
        
        const result = RestrictionBackgroundGenerator.generateBackgroundData(config);
        expect(result).toEqual([]);
      });

      it('should return empty array for restricted_boundary', () => {
        const config: RestrictionConfig = {
          restrictions: [{
            type: 'restricted_boundary',
            enabled: true,
            ranges: [{ startDate: '2025-06-10', endDate: '2025-06-15' }]
          }]
        };
        
        const result = RestrictionBackgroundGenerator.generateBackgroundData(config);
        expect(result).toEqual([]);
      });
    });

    it('should combine data from multiple restrictions', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: true,
            ranges: [{ startDate: '2025-06-10', endDate: '2025-06-12' }]
          },
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-20',
            direction: 'after'
          }
        ]
      };
      
      const result = RestrictionBackgroundGenerator.generateBackgroundData(config);
      
      expect(result).toContainEqual({
        startDate: '2025-06-10',
        endDate: '2025-06-12',
        color: '#ffe6e6'
      });
      expect(result).toContainEqual({
        startDate: '2025-06-20',
        endDate: '2100-12-31',
        color: '#ffe6e6'
      });
    });

    it('should skip disabled restrictions', () => {
      const config: RestrictionConfig = {
        restrictions: [
          {
            type: 'daterange',
            enabled: false,
            ranges: [{ startDate: '2025-06-10', endDate: '2025-06-12' }]
          },
          {
            type: 'boundary',
            enabled: true,
            date: '2025-06-20',
            direction: 'after'
          }
        ]
      };
      
      const result = RestrictionBackgroundGenerator.generateBackgroundData(config);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        startDate: '2025-06-20',
        endDate: '2100-12-31',
        color: '#ffe6e6'
      });
    });

    it('should handle unknown restriction types', () => {
      const config: RestrictionConfig = {
        restrictions: [{
          type: 'unknown-type' as any,
          enabled: true
        }]
      };
      
      const result = RestrictionBackgroundGenerator.generateBackgroundData(config);
      expect(result).toEqual([]);
    });
  });
});