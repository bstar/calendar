import { describe, it, expect } from 'vitest';
import { 
  getDefaultSettings, 
  DEFAULT_COLORS,
  createCalendarSettings,
  createSimpleCalendarSettings,
  createMinimalCalendar,
  validateCalendarSettings,
  validateLayers,
  getActiveLayers,
  findLayerByName
} from './CLACalendar.config';

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
      expect(settings.showLayersNavigation).toBe(false);
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

  describe('Null/Empty Data Handling', () => {
    describe('createCalendarSettings', () => {
      it('should handle undefined input gracefully', () => {
        const settings = createCalendarSettings(undefined);
        expect(settings).toBeDefined();
        expect(settings.displayMode).toBe('embedded');
        expect(settings.layers).toHaveLength(1);
        expect(settings.layers[0].name).toBe('Calendar');
        expect(settings.colors).toEqual(DEFAULT_COLORS);
      });

      it('should handle null input gracefully', () => {
        const settings = createCalendarSettings(null as any);
        expect(settings).toBeDefined();
        expect(settings.displayMode).toBe('embedded');
        expect(settings.visibleMonths).toBe(2);
      });

      it('should handle empty object', () => {
        const settings = createCalendarSettings({});
        expect(settings.displayMode).toBe('embedded');
        expect(settings.visibleMonths).toBe(2);
        expect(settings.layers).toHaveLength(1);
        expect(settings.layers[0].name).toBe('Calendar');
      });

      it('should filter out null values', () => {
        const settings = createCalendarSettings({
          displayMode: 'popup',
          visibleMonths: null as any,
          showHeader: undefined as any,
          layers: []
        });
        expect(settings.displayMode).toBe('popup');
        expect(settings.visibleMonths).toBe(2); // Should use default
        expect(settings.showHeader).toBe(true); // Should use default
        expect(settings.layers).toHaveLength(1); // Should provide default Calendar layer
        expect(settings.layers[0].name).toBe('Calendar');
      });

      it('should sanitize invalid numeric values', () => {
        const settings = createCalendarSettings({
          visibleMonths: -1,
          monthWidth: 50
        });
        expect(settings.visibleMonths).toBe(2); // Should reset to default
        expect(settings.monthWidth).toBe(500); // Should reset to default
      });

      it('should handle null layers safely', () => {
        const settings = createCalendarSettings({
          layers: null as any
        });
        expect(settings.layers).toHaveLength(1);
        expect(settings.layers[0].name).toBe('Calendar');
      });

      it('should merge colors safely', () => {
        const settings = createCalendarSettings({
          colors: {
            primary: '#ff0000',
            invalid: 'not-a-color' as any
          }
        });
        expect(settings.colors.primary).toBe('#ff0000');
        expect(settings.colors.success).toBe(DEFAULT_COLORS.success);
      });

      it('should handle backgroundColors configuration', () => {
        const settings = createCalendarSettings({
          backgroundColors: {
            emptyRows: 'rgb(254, 243, 226)',
            monthHeader: '#FFEDD5',
            headerContainer: 'rgba(254, 215, 170, 0.8)',
            dayCells: '#FEF3E2',
            selection: '#F59E0B',
            input: 'hsl(39, 100%, 95%)'
          }
        });
        
        expect(settings.backgroundColors).toBeDefined();
        expect(settings.backgroundColors?.emptyRows).toBe('rgb(254, 243, 226)');
        expect(settings.backgroundColors?.monthHeader).toBe('#FFEDD5');
        expect(settings.backgroundColors?.headerContainer).toBe('rgba(254, 215, 170, 0.8)');
        expect(settings.backgroundColors?.dayCells).toBe('#FEF3E2');
        expect(settings.backgroundColors?.selection).toBe('#F59E0B');
        expect(settings.backgroundColors?.input).toBe('hsl(39, 100%, 95%)');
      });

      it('should handle partial backgroundColors', () => {
        const settings = createCalendarSettings({
          backgroundColors: {
            selection: '#F59E0B',
            input: '#FFFBEB'
          }
        });
        
        expect(settings.backgroundColors?.selection).toBe('#F59E0B');
        expect(settings.backgroundColors?.input).toBe('#FFFBEB');
        expect(settings.backgroundColors?.emptyRows).toBeUndefined();
      });

      it('should handle various color formats in backgroundColors', () => {
        const settings = createCalendarSettings({
          backgroundColors: {
            emptyRows: 'red',
            monthHeader: '#FFF',
            headerContainer: 'transparent',
            dayCells: 'currentColor',
            selection: 'inherit',
            input: 'initial'
          }
        });
        
        expect(settings.backgroundColors?.emptyRows).toBe('red');
        expect(settings.backgroundColors?.monthHeader).toBe('#FFF');
        expect(settings.backgroundColors?.headerContainer).toBe('transparent');
        expect(settings.backgroundColors?.dayCells).toBe('currentColor');
        expect(settings.backgroundColors?.selection).toBe('inherit');
        expect(settings.backgroundColors?.input).toBe('initial');
      });
    });

    describe('createSimpleCalendarSettings', () => {
      it('should handle undefined input', () => {
        const settings = createSimpleCalendarSettings(undefined);
        expect(settings).toBeDefined();
        expect(settings.displayMode).toBe('embedded');
      });

      it('should handle null input', () => {
        const settings = createSimpleCalendarSettings(null as any);
        expect(settings).toBeDefined();
        expect(settings.displayMode).toBe('embedded');
      });

      it('should convert simple settings correctly', () => {
        const settings = createSimpleCalendarSettings({
          displayMode: 'popup',
          visibleMonths: 3,
          showSubmitButton: true,
          colors: { primary: '#ff0000' }
        });
        expect(settings.displayMode).toBe('popup');
        expect(settings.visibleMonths).toBe(3);
        expect(settings.showSubmitButton).toBe(true);
        expect(settings.colors.primary).toBe('#ff0000');
      });
    });

    describe('createMinimalCalendar', () => {
      it('should create minimal configuration', () => {
        const config = createMinimalCalendar();
        expect(config.displayMode).toBe('embedded');
        expect(config.visibleMonths).toBe(1);
        expect(config.showLayersNavigation).toBe(false);
        expect(config.showSubmitButton).toBe(false);
      });

      it('should handle onSubmit callback', () => {
        const onSubmit = () => {};
        const config = createMinimalCalendar({ onSubmit });
        expect(config.showSubmitButton).toBe(true);
        expect(config.showFooter).toBe(true);
      });
    });

    describe('validateCalendarSettings', () => {
      it('should validate valid settings', () => {
        const result = validateCalendarSettings({
          displayMode: 'popup',
          visibleMonths: 2,
          layers: []
        });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should catch invalid layers', () => {
        const result = validateCalendarSettings({
          layers: 'not-an-array' as any
        });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('layers must be an array');
      });

      it('should warn about invalid visibleMonths', () => {
        const result = validateCalendarSettings({
          visibleMonths: 10
        });
        expect(result.warnings).toContain('visibleMonths should be between 1 and 6');
      });

      it('should catch invalid date ranges', () => {
        const result = validateCalendarSettings({
          defaultRange: {
            start: '2025-01-31',
            end: '2025-01-01'
          }
        });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('defaultRange start date must be before end date');
      });
    });

    describe('Layer helpers', () => {
      const testLayers = [
        { name: 'layer1', title: 'Layer 1', description: 'Test', visible: true },
        { name: 'layer2', title: 'Layer 2', description: 'Test', visible: false },
        { name: 'layer3', title: 'Layer 3', description: 'Test' }
      ];

      describe('validateLayers', () => {
        it('should handle null layers', () => {
          expect(validateLayers(null)).toBe(true);
          expect(validateLayers(undefined)).toBe(true);
        });

        it('should handle empty arrays', () => {
          expect(validateLayers([])).toBe(true);
        });

        it('should validate non-empty arrays', () => {
          expect(validateLayers(testLayers)).toBe(true);
        });
      });

      describe('getActiveLayers', () => {
        it('should handle null input', () => {
          expect(getActiveLayers(null)).toEqual([]);
          expect(getActiveLayers(undefined)).toEqual([]);
        });

        it('should filter visible layers', () => {
          const active = getActiveLayers(testLayers);
          expect(active).toHaveLength(2); // layer1 (visible: true) and layer3 (no visible prop = default visible)
          expect(active.map(l => l.name)).toEqual(['layer1', 'layer3']);
        });
      });

      describe('findLayerByName', () => {
        it('should handle null input', () => {
          expect(findLayerByName(null, 'layer1')).toBeUndefined();
          expect(findLayerByName(undefined, 'layer1')).toBeUndefined();
        });

        it('should handle empty name', () => {
          expect(findLayerByName(testLayers, '')).toBeUndefined();
          expect(findLayerByName(testLayers, null as any)).toBeUndefined();
        });

        it('should find existing layer', () => {
          const layer = findLayerByName(testLayers, 'layer2');
          expect(layer).toBeDefined();
          expect(layer?.title).toBe('Layer 2');
        });

        it('should return undefined for non-existing layer', () => {
          expect(findLayerByName(testLayers, 'nonexistent')).toBeUndefined();
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle circular references in colors', () => {
        const circularColors: any = { primary: '#ff0000' };
        circularColors.self = circularColors;
        
        const settings = createCalendarSettings({
          colors: circularColors
        });
        expect(settings.colors.primary).toBe('#ff0000');
      });

      it('should handle very large numeric values', () => {
        const settings = createCalendarSettings({
          visibleMonths: Number.MAX_SAFE_INTEGER,
          monthWidth: Number.MAX_SAFE_INTEGER
        });
        expect(settings.visibleMonths).toBe(2); // Should reset to default
        expect(settings.monthWidth).toBe(500); // Should reset to default
      });

      it('should handle string numbers', () => {
        const settings = createCalendarSettings({
          visibleMonths: '3' as any,
          monthWidth: '400' as any
        });
        // Should use defaults since they're not proper numbers
        expect(settings.visibleMonths).toBe(2);
        expect(settings.monthWidth).toBe(500);
      });

      it('should handle malformed default range', () => {
        const settings = createCalendarSettings({
          defaultRange: {
            start: 'invalid-date',
            end: 'also-invalid'
          }
        });
        expect(settings.defaultRange).toBeDefined();
        // Should allow the malformed range through (validation happens elsewhere)
      });
    });
  });
});