import { describe, it, expect } from 'vitest';
import { getDefaultSettings, DEFAULT_COLORS } from './CLACalendar.config';

describe('CLACalendar Configuration', () => {
  describe('getDefaultSettings', () => {
    it('should return default settings with correct structure', () => {
      const settings = getDefaultSettings();
      
      // Core settings
      expect(settings.displayMode).toBe('embedded');
      expect(settings.timezone).toBe('UTC');
      expect(settings.visibleMonths).toBe(2);
      expect(settings.monthWidth).toBe(500);
      expect(settings.showMonthHeadings).toBe(true);
      expect(settings.baseFontSize).toBeUndefined();
      expect(settings.position).toBeUndefined();
      expect(settings.useDynamicPosition).toBeUndefined();
      
      // Feature settings
      expect(settings.selectionMode).toBe('range');
      expect(settings.showTooltips).toBe(true);
      expect(settings.showHeader).toBe(true);
      expect(settings.closeOnClickAway).toBe(true);
      expect(settings.showSubmitButton).toBe(false);
      expect(settings.showFooter).toBe(true);
      expect(settings.enableOutOfBoundsScroll).toBe(true);
      expect(settings.suppressTooltipsOnSelection).toBe(false);
      expect(settings.showSelectionAlert).toBe(false);
      expect(settings.startWeekOnSunday).toBe(false);
      
      // Layer settings
      expect(settings.layers).toEqual([]);
      expect(settings.showLayersNavigation).toBe(true);
      expect(settings.defaultLayer).toBe('');
      
      // Color settings
      expect(settings.colors).toEqual(DEFAULT_COLORS);
    });

    it('should return a new object instance each time', () => {
      const settings1 = getDefaultSettings();
      const settings2 = getDefaultSettings();
      
      expect(settings1).not.toBe(settings2);
      // Note: colors and layers may share the same reference to constants
      expect(settings1.colors).toBe(settings2.colors); // Both reference DEFAULT_COLORS
      expect(settings1.layers).toBe(settings2.layers); // Both reference DEFAULT_LAYERS
    });

    it('should have all required color properties', () => {
      const settings = getDefaultSettings();
      
      expect(settings.colors).toHaveProperty('primary', '#0366d6');
      expect(settings.colors).toHaveProperty('success', '#28a745');
      expect(settings.colors).toHaveProperty('warning', '#f6c23e');
      expect(settings.colors).toHaveProperty('danger', '#dc3545');
      expect(settings.colors).toHaveProperty('purple', '#6f42c1');
      expect(settings.colors).toHaveProperty('teal', '#20c997');
      expect(settings.colors).toHaveProperty('orange', '#fd7e14');
      expect(settings.colors).toHaveProperty('pink', '#e83e8c');
    });
  });

  describe('DEFAULT_COLORS', () => {
    it('should contain all expected color values', () => {
      expect(DEFAULT_COLORS).toEqual({
        primary: '#0366d6',
        success: '#28a745',
        warning: '#f6c23e',
        danger: '#dc3545',
        purple: '#6f42c1',
        teal: '#20c997',
        orange: '#fd7e14',
        pink: '#e83e8c'
      });
    });

    it('should have valid hex color values', () => {
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
      
      Object.entries(DEFAULT_COLORS).forEach(([colorName, colorValue]) => {
        expect(colorValue, `${colorName} should be a valid hex color`).toMatch(hexColorRegex);
      });
    });
  });

  describe('Settings validation', () => {
    it('should have valid display modes', () => {
      const settings = getDefaultSettings();
      expect(['popup', 'embedded']).toContain(settings.displayMode);
    });

    it('should have valid selection modes', () => {
      const settings = getDefaultSettings();
      expect(['single', 'range']).toContain(settings.selectionMode);
    });

    it('should have positive numeric values', () => {
      const settings = getDefaultSettings();
      expect(settings.visibleMonths).toBeGreaterThan(0);
      expect(settings.monthWidth).toBeGreaterThan(0);
    });

    it('should have consistent boolean defaults', () => {
      const settings = getDefaultSettings();
      
      // These should generally be true for good UX
      expect(settings.showMonthHeadings).toBe(true);
      expect(settings.showTooltips).toBe(true);
      expect(settings.showHeader).toBe(true);
      expect(settings.showFooter).toBe(true);
      
      // These should be false by default
      expect(settings.showSubmitButton).toBe(false);
      expect(settings.suppressTooltipsOnSelection).toBe(false);
      expect(settings.showSelectionAlert).toBe(false);
      expect(settings.startWeekOnSunday).toBe(false);
    });
  });

  describe('Settings modification', () => {
    it('should allow partial updates while preserving other values', () => {
      const defaultSettings = getDefaultSettings();
      const modifiedSettings = {
        ...defaultSettings,
        displayMode: 'popup' as const,
        visibleMonths: 3,
        colors: {
          ...defaultSettings.colors,
          primary: '#ff0000'
        }
      };
      
      expect(modifiedSettings.displayMode).toBe('popup');
      expect(modifiedSettings.visibleMonths).toBe(3);
      expect(modifiedSettings.colors.primary).toBe('#ff0000');
      
      // Other values should remain unchanged
      expect(modifiedSettings.selectionMode).toBe('range');
      expect(modifiedSettings.colors.success).toBe('#28a745');
      expect(modifiedSettings.showTooltips).toBe(true);
    });

    it('should allow adding custom properties', () => {
      const settings = getDefaultSettings();
      const customSettings = {
        ...settings,
        dateFormatter: (date: Date) => date.toISOString(),
        defaultRange: { start: '2025-01-01', end: '2025-01-31' },
        inputClassName: 'custom-input-class'
      };
      
      expect(customSettings.dateFormatter).toBeDefined();
      expect(customSettings.defaultRange).toEqual({ start: '2025-01-01', end: '2025-01-31' });
      expect(customSettings.inputClassName).toBe('custom-input-class');
    });
  });

  describe('Layer configuration', () => {
    it('should start with empty layers array', () => {
      const settings = getDefaultSettings();
      expect(settings.layers).toEqual([]);
      expect(settings.layers).toHaveLength(0);
    });

    it('should allow adding layers', () => {
      const settings = getDefaultSettings();
      const layerSettings = {
        ...settings,
        layers: [
          {
            name: 'holidays',
            title: 'Public Holidays',
            description: 'National holidays',
            visible: true,
            enabled: true,
            color: '#ff0000',
            data: {
              events: [
                {
                  date: '2025-12-25',
                  title: 'Christmas',
                  type: 'holiday',
                  time: 'All day',
                  description: 'Christmas Day'
                }
              ]
            }
          }
        ],
        defaultLayer: 'holidays'
      };
      
      expect(layerSettings.layers).toHaveLength(1);
      expect(layerSettings.layers[0].name).toBe('holidays');
      expect(layerSettings.defaultLayer).toBe('holidays');
    });
  });

  describe('Position configuration', () => {
    it('should support all valid positions', () => {
      const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const;
      const settings = getDefaultSettings();
      
      validPositions.forEach(position => {
        const positionSettings = { ...settings, position };
        expect(positionSettings.position).toBe(position);
      });
    });
  });
});