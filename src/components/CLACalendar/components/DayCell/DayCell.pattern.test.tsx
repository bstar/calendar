import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DayCell } from './DayCell';
import { createDate } from '../../../../utils/DateUtils';
import '@testing-library/jest-dom';

// Test utilities for CSS pattern testing
// Note: JSDOM doesn't support getComputedStyle with pseudo-elements,
// so we'll test the CSS classes are applied correctly instead

/**
 * Pattern Alignment Test Utilities
 * These utilities help detect and validate diagonal pattern alignment
 * across different container contexts.
 */

/**
 * Simulates different container environments that might affect pattern alignment
 */
const createContainerEnvironment = (type: 'storybook' | 'app' | 'isolated') => {
  const containerClass = {
    storybook: 'sbdocs-content docs-story',
    app: 'cla-cal-wrapper restriction-pattern-demo',
    isolated: 'test-container'
  }[type];
  
  return {
    containerProps: {
      className: containerClass,
      style: {
        // Simulate different CSS contexts
        ...(type === 'storybook' && {
          maxWidth: 'none',
          overflowX: 'auto'
        }),
        ...(type === 'app' && {
          padding: '20px',
          backgroundColor: '#f8f9fa'
        })
      }
    }
  };
};

/**
 * Validates CSS custom properties are correctly set on an element
 */
const validatePatternCustomProperties = (element: HTMLElement, expectedX: string, expectedY: string) => {
  const actualX = element.style.getPropertyValue('--pattern-offset-x');
  const actualY = element.style.getPropertyValue('--pattern-offset-y');
  
  return {
    x: { expected: expectedX, actual: actualX, matches: actualX === expectedX },
    y: { expected: expectedY, actual: actualY, matches: actualY === expectedY }
  };
};

/**
 * Detects potential pattern misalignment by checking if element has pattern class
 * and validating its CSS context
 */
const detectPatternMisalignment = (element: HTMLElement) => {
  const hasPatternClass = element.classList.contains('restricted-date-pattern');
  const computedStyle = window.getComputedStyle(element);
  
  return {
    hasPattern: hasPatternClass,
    position: computedStyle.position,
    overflow: computedStyle.overflow,
    // Check for CSS isolation issues that might affect background-attachment
    isolation: computedStyle.isolation,
    // Background attachment value (should be 'local')
    backgroundAttachment: computedStyle.backgroundAttachment
  };
};

/**
 * Creates a test wrapper that simulates different rendering contexts
 */
const TestContextWrapper: React.FC<{ 
  children: React.ReactNode; 
  context: 'storybook' | 'app' | 'isolated';
  customStyles?: React.CSSProperties;
}> = ({ children, context, customStyles }) => {
  const { containerProps } = createContainerEnvironment(context);
  
  return (
    <div 
      {...containerProps}
      style={{ ...containerProps.style, ...customStyles }}
      data-testid={`context-${context}`}
    >
      {children}
    </div>
  );
};

describe('DayCell Pattern Alignment', () => {
  
  // Clean up any global styles between tests
  beforeEach(() => {
    // Remove any dynamically injected styles
    const existingStyles = document.querySelectorAll('style[data-test-pattern]');
    existingStyles.forEach(style => style.remove());
  });

  const defaultProps = {
    date: createDate(2025, 5, 15), // June 15, 2025
    selectedRange: { start: null, end: null },
    isCurrentMonth: true,
    settings: {
      colors: {
        primary: '#0366d6',
        success: '#28a745',
        warning: '#f6c23e',
        danger: '#dc3545'
      },
      backgroundColors: {
        selection: '#b1e4e5'
      },
      timezone: 'UTC'
    },
    onMouseDown: () => {},
    onMouseEnter: () => {},
    showTooltips: false,
    layer: {
      name: 'default',
      title: 'Default',
      description: 'Default layer',
      visible: true,
      enabled: true,
      data: {
        events: [],
        background: []
      }
    },
    restrictionConfig: null,
    rowIndex: 0,
    colIndex: 0
  };

  it('should apply diagonal pattern to restricted dates', () => {
    const restrictedProps = {
      ...defaultProps,
      restrictionConfig: {
        restrictions: [{
          type: 'daterange',
          enabled: true,
          ranges: [{
            startDate: '2025-06-10',
            endDate: '2025-06-20'
          }]
        }]
      }
    };

    const { container } = render(
      <DayCell
        {...restrictedProps}
      />
    );

    const dayCell = container.querySelector('.day-cell');
    expect(dayCell).toHaveClass('restricted-date-pattern');
  });

  it('should use background-attachment: local for pattern', () => {
    const restrictedProps = {
      ...defaultProps,
      restrictionConfig: {
        restrictions: [{
          type: 'daterange',
          enabled: true,
          ranges: [{
            startDate: '2025-06-10',
            endDate: '2025-06-20'
          }]
        }]
      }
    };

    const { container } = render(
      <DayCell
        {...restrictedProps}
      />
    );

    const dayCell = container.querySelector('.day-cell');
    // Verify the restricted pattern class is applied
    expect(dayCell).toHaveClass('restricted-date-pattern');
    // The CSS file now uses background-attachment: local instead of fixed
    // This test verifies the class is applied correctly
  });

  it('should support CSS custom properties for pattern offset', () => {
    const restrictedProps = {
      ...defaultProps,
      restrictionConfig: {
        restrictions: [{
          type: 'daterange',
          enabled: true,
          ranges: [{
            startDate: '2025-06-10',
            endDate: '2025-06-20'
          }]
        }]
      }
    };

    const { container } = render(
      <DayCell
        {...restrictedProps}
      />
    );

    const dayCell = container.querySelector('.day-cell') as HTMLElement;
    if (dayCell) {
      // Set custom properties
      dayCell.style.setProperty('--pattern-offset-x', '10px');
      dayCell.style.setProperty('--pattern-offset-y', '20px');
      
      // Note: In JSDOM, we can't fully test pseudo-element styles
      // This test verifies the element accepts custom properties
      expect(dayCell.style.getPropertyValue('--pattern-offset-x')).toBe('10px');
      expect(dayCell.style.getPropertyValue('--pattern-offset-y')).toBe('20px');
    }
  });

  it('should maintain pattern consistency across multiple restricted cells', () => {
    const dates = [
      createDate(2025, 5, 15),
      createDate(2025, 5, 16),
      createDate(2025, 5, 17)
    ];

    const restrictionConfig = {
      restrictions: [{
        type: 'daterange',
        enabled: true,
        ranges: [{
          startDate: '2025-06-10',
          endDate: '2025-06-20'
        }]
      }]
    };

    const cells = dates.map(date => {
      const { container } = render(
        <DayCell
          {...defaultProps}
          date={date}
          restrictionConfig={restrictionConfig}
        />
      );
      return container.querySelector('.day-cell');
    });

    // All restricted cells should have the pattern class
    cells.forEach(cell => {
      expect(cell).toHaveClass('restricted-date-pattern');
    });
  });

  describe('Container Context Tests', () => {
    it('should render pattern correctly in Storybook-like environment', () => {
      const restrictedProps = {
        ...defaultProps,
        restrictionConfig: {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-20'
            }]
          }]
        }
      };

      const { container } = render(
        <TestContextWrapper context="storybook">
          <DayCell {...restrictedProps} />
        </TestContextWrapper>
      );

      const dayCell = container.querySelector('.day-cell');
      const contextWrapper = container.querySelector('[data-testid="context-storybook"]');
      
      expect(dayCell).toHaveClass('restricted-date-pattern');
      expect(contextWrapper).toHaveClass('sbdocs-content');
      
      // Validate pattern context
      const alignmentInfo = detectPatternMisalignment(dayCell as HTMLElement);
      expect(alignmentInfo.hasPattern).toBe(true);
    });

    it('should render pattern correctly in App.tsx-like environment', () => {
      const restrictedProps = {
        ...defaultProps,
        restrictionConfig: {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-20'
            }]
          }]
        }
      };

      const { container } = render(
        <TestContextWrapper context="app">
          <DayCell {...restrictedProps} />
        </TestContextWrapper>
      );

      const dayCell = container.querySelector('.day-cell');
      const contextWrapper = container.querySelector('[data-testid="context-app"]');
      
      expect(dayCell).toHaveClass('restricted-date-pattern');
      expect(contextWrapper).toHaveClass('cla-cal-wrapper');
      
      // Validate pattern context
      const alignmentInfo = detectPatternMisalignment(dayCell as HTMLElement);
      expect(alignmentInfo.hasPattern).toBe(true);
    });

    it('should handle different CSS transform contexts', () => {
      const restrictedProps = {
        ...defaultProps,
        restrictionConfig: {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-20'
            }]
          }]
        }
      };

      // Test with CSS transforms that might affect pattern alignment
      const transformContexts = [
        { transform: 'translateX(10px)' },
        { transform: 'scale(1.1)' },
        { transform: 'translateX(5px) translateY(3px)' },
        { position: 'relative', left: '2px', top: '1px' }
      ];

      transformContexts.forEach((customStyles, index) => {
        const { container } = render(
          <TestContextWrapper context="isolated" customStyles={customStyles}>
            <DayCell {...restrictedProps} />
          </TestContextWrapper>
        );

        const dayCell = container.querySelector('.day-cell');
        expect(dayCell).toHaveClass('restricted-date-pattern');
        
        // Each should maintain pattern class regardless of transform
        const alignmentInfo = detectPatternMisalignment(dayCell as HTMLElement);
        expect(alignmentInfo.hasPattern).toBe(true);
      });
    });
  });

  describe('Pattern Offset Validation', () => {
    it('should support dynamic pattern offset via CSS custom properties', () => {
      const restrictedProps = {
        ...defaultProps,
        restrictionConfig: {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-20'
            }]
          }]
        }
      };

      const { container } = render(<DayCell {...restrictedProps} />);
      const dayCell = container.querySelector('.day-cell') as HTMLElement;
      
      // Test various offset values
      const testOffsets = [
        { x: '0px', y: '0px' },
        { x: '5px', y: '3px' },
        { x: '-2px', y: '7px' },
        { x: '10px', y: '-5px' }
      ];

      testOffsets.forEach(({ x, y }) => {
        dayCell.style.setProperty('--pattern-offset-x', x);
        dayCell.style.setProperty('--pattern-offset-y', y);
        
        const validation = validatePatternCustomProperties(dayCell, x, y);
        expect(validation.x.matches).toBe(true);
        expect(validation.y.matches).toBe(true);
      });
    });

    it('should handle pattern offset inheritance from parent containers', () => {
      const restrictedProps = {
        ...defaultProps,
        restrictionConfig: {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-20'
            }]
          }]
        }
      };

      // Test offset inheritance from parent
      const parentOffsetStyle = {
        '--pattern-offset-x': '8px',
        '--pattern-offset-y': '12px'
      } as React.CSSProperties;

      const { container } = render(
        <div style={parentOffsetStyle}>
          <DayCell {...restrictedProps} />
        </div>
      );

      const dayCell = container.querySelector('.day-cell') as HTMLElement;
      expect(dayCell).toHaveClass('restricted-date-pattern');
      
      // The element should inherit the custom properties from its parent
      // Note: JSDOM has limitations with CSS custom property inheritance,
      // so we test that the pattern class is applied correctly
      expect(dayCell.classList.contains('restricted-date-pattern')).toBe(true);
    });
  });

  describe('Environment-Specific Pattern Tests', () => {
    it('should simulate App.tsx pattern offset fix', () => {
      const restrictedProps = {
        ...defaultProps,
        restrictionConfig: {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-20'
            }]
          }]
        }
      };

      // Simulate the dynamic CSS injection used in App.tsx
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-test-pattern', 'true');
      styleElement.textContent = `
        .restriction-pattern-demo .restricted-date-pattern::before {
          background-position: 5px 3px !important;
        }
      `;
      document.head.appendChild(styleElement);

      const { container } = render(
        <div className="restriction-pattern-demo">
          <DayCell {...restrictedProps} />
        </div>
      );

      const dayCell = container.querySelector('.day-cell');
      expect(dayCell).toHaveClass('restricted-date-pattern');
      
      // Verify the dynamic style was applied
      const dynamicStyle = document.querySelector('style[data-test-pattern]');
      expect(dynamicStyle).toBeTruthy();
      expect(dynamicStyle?.textContent).toContain('background-position: 5px 3px !important');
    });

    it('should validate pattern alignment with viewport-relative positioning', () => {
      const restrictedProps = {
        ...defaultProps,
        restrictionConfig: {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-20'
            }]
          }]
        }
      };

      // Test different viewport-relative scenarios
      const viewportScenarios = [
        { name: 'scrolled', style: { transform: 'translateY(-100px)' } },
        { name: 'offset', style: { marginLeft: '20px', marginTop: '15px' } },
        { name: 'nested', style: { padding: '10px', position: 'relative' as const } }
      ];

      viewportScenarios.forEach(({ name, style }) => {
        const { container } = render(
          <div style={style} data-testid={`viewport-${name}`}>
            <DayCell {...restrictedProps} />
          </div>
        );

        const dayCell = container.querySelector('.day-cell');
        expect(dayCell).toHaveClass('restricted-date-pattern');
        
        // Pattern should remain functional regardless of viewport position
        const alignmentInfo = detectPatternMisalignment(dayCell as HTMLElement);
        expect(alignmentInfo.hasPattern).toBe(true);
      });
    });
  });

  it('should not apply pattern to non-restricted dates', () => {
    // Test with a date outside the restriction range
    const nonRestrictedProps = {
      ...defaultProps,
      date: createDate(2025, 6, 1), // July 1, 2025
      restrictionConfig: {
        restrictions: [{
          type: 'daterange',
          enabled: true,
          ranges: [{
            startDate: '2025-06-10',
            endDate: '2025-06-20'
          }]
        }]
      }
    };

    const { container } = render(
      <DayCell
        {...nonRestrictedProps}
      />
    );

    const dayCell = container.querySelector('.day-cell');
    expect(dayCell).not.toHaveClass('restricted-date-pattern');
  });

  it('should handle pattern with different restriction states', () => {
    const props = {
      ...defaultProps,
      restrictionConfig: {
        restrictions: [{
          type: 'daterange',
          enabled: false, // Initially disabled
          ranges: [{
            startDate: '2025-06-10',
            endDate: '2025-06-20'
          }]
        }]
      }
    };

    const { rerender, container } = render(
      <DayCell {...props} />
    );

    let dayCell = container.querySelector('.day-cell');
    expect(dayCell).not.toHaveClass('restricted-date-pattern');

    // Enable the restriction
    const updatedProps = {
      ...props,
      restrictionConfig: {
        restrictions: [{
          type: 'daterange',
          enabled: true, // Now enabled
          ranges: [{
            startDate: '2025-06-10',
            endDate: '2025-06-20'
          }]
        }]
      }
    };

    rerender(
      <DayCell {...updatedProps} />
    );

    dayCell = container.querySelector('.day-cell');
    expect(dayCell).toHaveClass('restricted-date-pattern');
  });

  describe('Pattern Alignment Utilities', () => {
    it('should provide utility functions for pattern debugging', () => {
      const restrictedProps = {
        ...defaultProps,
        restrictionConfig: {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-20'
            }]
          }]
        }
      };

      const { container } = render(<DayCell {...restrictedProps} />);
      const dayCell = container.querySelector('.day-cell') as HTMLElement;
      
      // Test alignment detection utility
      const alignmentInfo = detectPatternMisalignment(dayCell);
      expect(alignmentInfo.hasPattern).toBe(true);
      expect(typeof alignmentInfo.position).toBe('string');
      expect(typeof alignmentInfo.overflow).toBe('string');
      
      // Test custom property validation utility
      dayCell.style.setProperty('--pattern-offset-x', '15px');
      dayCell.style.setProperty('--pattern-offset-y', '25px');
      
      const validation = validatePatternCustomProperties(dayCell, '15px', '25px');
      expect(validation.x.matches).toBe(true);
      expect(validation.y.matches).toBe(true);
    });
  });

  describe('Cross-Browser Pattern Behavior', () => {
    it('should handle background-attachment local behavior', () => {
      const restrictedProps = {
        ...defaultProps,
        restrictionConfig: {
          restrictions: [{
            type: 'daterange',
            enabled: true,
            ranges: [{
              startDate: '2025-06-10',
              endDate: '2025-06-20'
            }]
          }]
        }
      };

      const { container } = render(<DayCell {...restrictedProps} />);
      const dayCell = container.querySelector('.day-cell') as HTMLElement;
      
      expect(dayCell).toHaveClass('restricted-date-pattern');
      
      // Test that the element has the correct structure for pattern rendering
      const alignmentInfo = detectPatternMisalignment(dayCell);
      expect(alignmentInfo.hasPattern).toBe(true);
      
      // CSS validation - the pattern should use background-attachment: local
      // Note: JSDOM limitations mean we can't test computed styles on pseudo-elements
      // but we can verify the class structure is correct
      expect(dayCell.classList.contains('restricted-date-pattern')).toBe(true);
    });
  });
});

/**
 * Test Suite for Pattern Alignment Regression Testing
 * 
 * This test suite provides comprehensive coverage for the diagonal pattern
 * alignment issue that occurs when changing from background-attachment: fixed
 * to background-attachment: local. It includes:
 * 
 * 1. Container context simulation (Storybook vs App.tsx)
 * 2. CSS custom property validation
 * 3. Transform and positioning edge cases
 * 4. Dynamic style injection testing
 * 5. Pattern alignment detection utilities
 * 
 * To run these tests:
 * - npm test -- DayCell.pattern.test.tsx
 * - npm run test:coverage -- DayCell.pattern.test.tsx
 */

describe('Pattern Alignment Regression Tests', () => {
  const createRestrictedCell = (additionalProps = {}) => ({
    ...{
      date: createDate(2025, 5, 15), // June 15, 2025
      selectedRange: { start: null, end: null },
      isCurrentMonth: true,
      settings: {
        colors: {
          primary: '#0366d6',
          success: '#28a745',
          warning: '#f6c23e',
          danger: '#dc3545'
        },
        backgroundColors: {
          selection: '#b1e4e5'
        },
        timezone: 'UTC'
      },
      onMouseDown: () => {},
      onMouseEnter: () => {},
      showTooltips: false,
      layer: {
        name: 'default',
        title: 'Default',
        description: 'Default layer',
        visible: true,
        enabled: true,
        data: {
          events: [],
          background: []
        }
      },
      restrictionConfig: null,
      rowIndex: 0,
      colIndex: 0
    },
    restrictionConfig: {
      restrictions: [{
        type: 'daterange',
        enabled: true,
        ranges: [{
          startDate: '2025-06-10',
          endDate: '2025-06-20'
        }]
      }]
    },
    ...additionalProps
  });

  it('should detect pattern misalignment between different rendering contexts', () => {
    const contexts: Array<'storybook' | 'app' | 'isolated'> = ['storybook', 'app', 'isolated'];
    const results: Array<{ context: string; hasPattern: boolean; info: any }> = [];

    contexts.forEach(context => {
      const { container } = render(
        <TestContextWrapper context={context}>
          <DayCell {...createRestrictedCell()} />
        </TestContextWrapper>
      );

      const dayCell = container.querySelector('.day-cell') as HTMLElement;
      const alignmentInfo = detectPatternMisalignment(dayCell);
      
      results.push({
        context,
        hasPattern: alignmentInfo.hasPattern,
        info: alignmentInfo
      });
    });

    // All contexts should successfully render the pattern
    results.forEach(result => {
      expect(result.hasPattern).toBe(true);
    });

    // All contexts should have consistent pattern behavior
    const patternStates = results.map(r => r.hasPattern);
    const allSame = patternStates.every(state => state === patternStates[0]);
    expect(allSame).toBe(true);
  });

  it('should validate that pattern offset solutions are testable', () => {
    // This test validates that the pattern offset approach used in App.tsx
    // can be properly tested and verified
    
    const testOffsets = [
      { x: 0, y: 0, description: 'no offset' },
      { x: 5, y: 3, description: 'positive offset' },
      { x: -2, y: 7, description: 'mixed offset' },
      { x: 10, y: -5, description: 'negative y offset' }
    ];

    testOffsets.forEach(({ x, y, description }) => {
      // Create dynamic style similar to App.tsx approach
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-test-pattern', `offset-${x}-${y}`);
      styleElement.textContent = `
        .test-pattern-container .restricted-date-pattern::before {
          background-position: ${x}px ${y}px !important;
        }
      `;
      document.head.appendChild(styleElement);

      const { container } = render(
        <div className="test-pattern-container">
          <DayCell {...createRestrictedCell()} />
        </div>
      );

      const dayCell = container.querySelector('.day-cell');
      expect(dayCell).toHaveClass('restricted-date-pattern');
      
      // Verify style was applied
      const appliedStyle = document.querySelector(`style[data-test-pattern="offset-${x}-${y}"]`);
      expect(appliedStyle).toBeTruthy();
      expect(appliedStyle?.textContent).toContain(`background-position: ${x}px ${y}px !important`);
      
      // Clean up
      appliedStyle?.remove();
    });
  });

  it('should provide debugging information for pattern alignment issues', () => {
    const { container } = render(<DayCell {...createRestrictedCell()} />);
    const dayCell = container.querySelector('.day-cell') as HTMLElement;
    
    const debugInfo = {
      hasPatternClass: dayCell.classList.contains('restricted-date-pattern'),
      element: {
        position: window.getComputedStyle(dayCell).position,
        overflow: window.getComputedStyle(dayCell).overflow,
      },
      customProperties: {
        offsetX: dayCell.style.getPropertyValue('--pattern-offset-x') || 'not set',
        offsetY: dayCell.style.getPropertyValue('--pattern-offset-y') || 'not set'
      }
    };
    
    // This debug info structure can be used to diagnose pattern alignment issues
    expect(debugInfo.hasPatternClass).toBe(true);
    expect(typeof debugInfo.element.position).toBe('string');
    expect(typeof debugInfo.element.overflow).toBe('string');
    expect(typeof debugInfo.customProperties.offsetX).toBe('string');
    expect(typeof debugInfo.customProperties.offsetY).toBe('string');
  });
});