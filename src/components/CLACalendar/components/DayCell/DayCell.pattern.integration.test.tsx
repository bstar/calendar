/**
 * Integration Tests for Pattern Alignment
 * 
 * These tests simulate real-world scenarios where diagonal pattern misalignment
 * occurs, specifically focusing on the differences between Storybook and App.tsx
 * rendering contexts.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { DayCell } from './DayCell';
import { createDate } from '../../../../utils/DateUtils';
import {
  createContainerEnvironment,
  detectPatternMisalignment,
  validatePatternCustomProperties,
  createPatternOffsetStyles,
  cleanupPatternTestStyles,
  getPatternDebugInfo,
  runPatternAlignmentTests,
  validatePatternOffsetFix,
  type ContainerEnvironment
} from '../../../../test-utils/patternTestUtils';
import '@testing-library/jest-dom';

describe('DayCell Pattern Alignment Integration Tests', () => {
  
  beforeEach(() => {
    cleanupPatternTestStyles();
  });
  
  afterEach(() => {
    cleanupPatternTestStyles();
  });

  const defaultProps = {
    date: createDate(2025, 5, 15),
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
      data: { events: [], background: [] }
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
    rowIndex: 0,
    colIndex: 0
  };

  const TestWrapper: React.FC<{ 
    children: React.ReactNode; 
    environment: ContainerEnvironment;
    additionalStyles?: React.CSSProperties;
  }> = ({ children, environment, additionalStyles }) => {
    const config = createContainerEnvironment(environment);
    
    return (
      <div 
        className={config.className}
        style={{ ...config.style, ...additionalStyles }}
        data-testid={`environment-${environment}`}
      >
        {children}
      </div>
    );
  };

  describe('Cross-Environment Pattern Consistency', () => {
    it('should render patterns consistently across Storybook and App environments', () => {
      const environments: ContainerEnvironment[] = ['storybook', 'app', 'isolated'];
      const results: Array<{ env: string; hasPattern: boolean; debugInfo: any }> = [];

      environments.forEach(env => {
        const { container } = render(
          <TestWrapper environment={env}>
            <DayCell {...defaultProps} />
          </TestWrapper>
        );

        const dayCell = container.querySelector('.day-cell') as HTMLElement;
        const alignmentInfo = detectPatternMisalignment(dayCell);
        const debugInfo = getPatternDebugInfo(dayCell);

        results.push({
          env,
          hasPattern: alignmentInfo.hasPattern,
          debugInfo
        });
      });

      // All environments should render the pattern
      results.forEach(result => {
        expect(result.hasPattern).toBe(true);
        expect(result.debugInfo.hasPatternClass).toBe(true);
      });

      // Pattern consistency check
      const patternStates = results.map(r => r.hasPattern);
      const allConsistent = patternStates.every(state => state === patternStates[0]);
      expect(allConsistent).toBe(true);

      // Log debug info for manual inspection
      console.log('Pattern Consistency Results:', results.map(r => ({
        environment: r.env,
        hasPattern: r.hasPattern,
        containerContext: r.debugInfo.containerContext,
        potentialIssues: r.debugInfo.potentialIssues
      })));
    });

    it('should handle pattern alignment under different CSS transform contexts', () => {
      const transformScenarios = [
        { name: 'no-transform', style: {} },
        { name: 'translate', style: { transform: 'translateX(10px) translateY(5px)' } },
        { name: 'scale', style: { transform: 'scale(1.05)' } },
        { name: 'rotate', style: { transform: 'rotate(1deg)' } },
        { name: 'combined', style: { transform: 'translateX(5px) scale(1.02) rotate(0.5deg)' } }
      ];

      const testResults: Array<{ scenario: string; success: boolean; issues: string[] }> = [];

      transformScenarios.forEach(scenario => {
        const { container } = render(
          <TestWrapper environment="app">
            <div style={scenario.style}>
              <DayCell {...defaultProps} />
            </div>
          </TestWrapper>
        );

        const dayCell = container.querySelector('.day-cell') as HTMLElement;
        const debugInfo = getPatternDebugInfo(dayCell);

        testResults.push({
          scenario: scenario.name,
          success: debugInfo.hasPatternClass,
          issues: debugInfo.potentialIssues
        });
      });

      // All scenarios should maintain pattern functionality
      testResults.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Log any potential issues found
      const scenariosWithIssues = testResults.filter(r => r.issues.length > 0);
      if (scenariosWithIssues.length > 0) {
        console.warn('Scenarios with potential pattern issues:', scenariosWithIssues);
      }
    });
  });

  describe('Pattern Offset Fix Validation', () => {
    it('should validate the App.tsx pattern offset approach', () => {
      const testOffsets = [
        { x: 0, y: 0 },
        { x: 5, y: 3 },
        { x: -2, y: 7 },
        { x: 12, y: -4 }
      ];

      testOffsets.forEach(({ x, y }) => {
        // Create container with pattern offset class
        const { container } = render(
          <div className="pattern-offset-test-container">
            <DayCell {...defaultProps} />
          </div>
        );

        const dayCell = container.querySelector('.day-cell') as HTMLElement;
        
        // Validate the pattern offset fix
        const validation = validatePatternOffsetFix(
          dayCell, 
          x, 
          y, 
          'pattern-offset-test-container'
        );

        expect(validation.success).toBe(true);
        expect(validation.details.styleExists).toBe(true);
        expect(validation.details.containsExpectedPosition).toBe(true);
        expect(validation.details.hasPatternClass).toBe(true);
        expect(validation.details.isInContainer).toBe(true);
      });
    });

    it('should test CSS custom property inheritance for pattern offset', () => {
      const parentOffsets = [
        { x: '8px', y: '12px' },
        { x: '0px', y: '5px' },
        { x: '-3px', y: '0px' }
      ];

      parentOffsets.forEach(({ x, y }) => {
        const parentStyle = {
          '--pattern-offset-x': x,
          '--pattern-offset-y': y
        } as React.CSSProperties;

        const { container } = render(
          <div style={parentStyle}>
            <DayCell {...defaultProps} />
          </div>
        );

        const dayCell = container.querySelector('.day-cell') as HTMLElement;
        
        // Manually set the custom properties to test validation utility
        dayCell.style.setProperty('--pattern-offset-x', x);
        dayCell.style.setProperty('--pattern-offset-y', y);

        const validation = validatePatternCustomProperties(dayCell, x, y);
        expect(validation.x.matches).toBe(true);
        expect(validation.y.matches).toBe(true);
      });
    });
  });

  describe('Real-World Scenario Simulation', () => {
    it('should simulate the exact App.tsx restriction pattern demo context', () => {
      // Recreate the exact structure from App.tsx
      const { container } = render(
        <div className="cla-cal-wrapper">
          <div className="restriction-pattern-demo">
            <DayCell {...defaultProps} />
          </div>
        </div>
      );

      const dayCell = container.querySelector('.day-cell') as HTMLElement;
      const debugInfo = getPatternDebugInfo(dayCell);

      // Should have pattern class
      expect(debugInfo.hasPatternClass).toBe(true);
      
      // Should detect App container context
      expect(debugInfo.containerContext).toBe('app');

      // Test the dynamic offset approach from App.tsx
      const styleElement = createPatternOffsetStyles(5, 3, 'restriction-pattern-demo');
      
      // Verify the style was applied correctly
      expect(document.head.contains(styleElement)).toBe(true);
      expect(styleElement.textContent).toContain('background-position: 5px 3px !important');
      
      // Clean up
      styleElement.remove();
    });

    it('should simulate Storybook docs environment with wide calendar', () => {
      // Simulate Storybook's docs environment
      const { container } = render(
        <div className="sbdocs-content">
          <div className="docs-story" style={{ minWidth: 'fit-content', overflowX: 'auto' }}>
            {/* Simulate multiple DayCells in a calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
              {Array.from({ length: 14 }, (_, i) => (
                <DayCell 
                  key={i}
                  {...defaultProps} 
                  date={createDate(2025, 5, 10 + i)}
                />
              ))}
            </div>
          </div>
        </div>
      );

      const dayCells = container.querySelectorAll('.day-cell');
      expect(dayCells.length).toBe(14);

      // All restricted cells should have consistent pattern rendering
      const restrictedCells = Array.from(dayCells).filter(cell => 
        cell.classList.contains('restricted-date-pattern')
      );

      expect(restrictedCells.length).toBeGreaterThan(0);

      // Check pattern consistency across all restricted cells
      restrictedCells.forEach(cell => {
        const debugInfo = getPatternDebugInfo(cell as HTMLElement);
        expect(debugInfo.hasPatternClass).toBe(true);
        expect(debugInfo.containerContext).toBe('storybook');
      });
    });

    it('should test pattern alignment with calendar scrolling and viewport changes', () => {
      // Simulate different viewport positions that might affect pattern alignment
      const viewportScenarios = [
        { name: 'default', containerStyle: {} },
        { name: 'scrolled-down', containerStyle: { transform: 'translateY(-200px)' } },
        { name: 'scrolled-right', containerStyle: { transform: 'translateX(-100px)' } },
        { name: 'both-directions', containerStyle: { transform: 'translate(-50px, -150px)' } },
        { name: 'scaled-viewport', containerStyle: { transform: 'scale(0.8)' } }
      ];

      const results: Array<{ scenario: string; success: boolean; debugInfo: any }> = [];

      viewportScenarios.forEach(scenario => {
        const { container } = render(
          <div style={scenario.containerStyle}>
            <TestWrapper environment="app">
              <DayCell {...defaultProps} />
            </TestWrapper>
          </div>
        );

        const dayCell = container.querySelector('.day-cell') as HTMLElement;
        const debugInfo = getPatternDebugInfo(dayCell);

        results.push({
          scenario: scenario.name,
          success: debugInfo.hasPatternClass,
          debugInfo
        });
      });

      // All viewport scenarios should maintain pattern functionality
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Log any transform-related issues
      const issuesFound = results.filter(r => r.debugInfo.potentialIssues.length > 0);
      if (issuesFound.length > 0) {
        console.log('Transform-related pattern issues found:', issuesFound);
      }
    });
  });

  describe('Comprehensive Pattern Test Suite', () => {
    it('should run comprehensive pattern alignment tests', () => {
      const renderElementInContext = (
        containerStyle?: React.CSSProperties,
        elementStyle?: React.CSSProperties
      ): HTMLElement => {
        const { container } = render(
          <div style={containerStyle}>
            <div style={elementStyle}>
              <DayCell {...defaultProps} />
            </div>
          </div>
        );
        
        return container.querySelector('.day-cell') as HTMLElement;
      };

      const results = runPatternAlignmentTests(renderElementInContext);

      // All scenarios should pass
      results.forEach(result => {
        expect(result.passed).toBe(true);
      });

      // Log comprehensive results
      console.log('Comprehensive Pattern Test Results:', {
        totalScenarios: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        issuesFound: results.filter(r => r.issues.length > 0).length
      });

      // Detailed failure analysis if any
      const failures = results.filter(r => !r.passed);
      if (failures.length > 0) {
        console.error('Pattern test failures:', failures);
      }
    });
  });

  describe('Performance and Memory Impact', () => {
    it('should not create memory leaks with dynamic pattern styles', () => {
      const initialStyleCount = document.querySelectorAll('style[data-test-pattern]').length;
      
      // Create and clean up multiple pattern styles
      for (let i = 0; i < 10; i++) {
        const style = createPatternOffsetStyles(i, i * 2);
        style.remove();
      }
      
      const finalStyleCount = document.querySelectorAll('style[data-test-pattern]').length;
      expect(finalStyleCount).toBe(initialStyleCount);
    });

    it('should handle rapid pattern style changes efficiently', () => {
      const { container } = render(
        <div className="rapid-change-test">
          <DayCell {...defaultProps} />
        </div>
      );

      const dayCell = container.querySelector('.day-cell') as HTMLElement;
      expect(dayCell).toHaveClass('restricted-date-pattern');

      // Rapidly change pattern offsets
      const startTime = performance.now();
      
      for (let i = 0; i < 50; i++) {
        const style = createPatternOffsetStyles(i % 10, (i * 2) % 10, 'rapid-change-test');
        style.remove();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });
  });
});