/**
 * Pattern Test Utilities
 * 
 * Comprehensive utilities for testing diagonal pattern alignment issues
 * specifically related to the CSS diagonal pattern used for restricted dates.
 * 
 * These utilities help detect and validate pattern alignment across different
 * container contexts (Storybook vs App.tsx) and provide debugging tools.
 */

/**
 * Interface for pattern alignment detection results
 */
export interface PatternAlignmentInfo {
  hasPattern: boolean;
  position: string;
  overflow: string;
  isolation: string;
  backgroundAttachment: string;
  containerContext?: string;
}

/**
 * Interface for CSS custom property validation results
 */
export interface CustomPropertyValidation {
  x: { expected: string; actual: string; matches: boolean };
  y: { expected: string; actual: string; matches: boolean };
}

/**
 * Container environment types for testing different rendering contexts
 */
export type ContainerEnvironment = 'storybook' | 'app' | 'isolated' | 'custom';

/**
 * Creates container environment configurations that simulate different
 * rendering contexts where pattern misalignment might occur
 */
export const createContainerEnvironment = (type: ContainerEnvironment) => {
  const configurations = {
    storybook: {
      className: 'sbdocs-content docs-story',
      style: {
        maxWidth: 'none',
        overflowX: 'auto' as const,
        // Simulate Storybook's CSS reset and container styles
        fontSize: '14px',
        lineHeight: '1.4'
      }
    },
    app: {
      className: 'cla-cal-wrapper restriction-pattern-demo',
      style: {
        padding: '20px',
        backgroundColor: '#f8f9fa',
        // Simulate App.tsx container styles
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }
    },
    isolated: {
      className: 'test-container',
      style: {
        // Minimal styling for isolated testing
        position: 'relative' as const
      }
    },
    custom: {
      className: 'custom-test-container',
      style: {}
    }
  };

  return configurations[type] || configurations.isolated;
};

/**
 * Detects potential pattern misalignment by analyzing the element's
 * CSS context and checking for common issues that affect pattern rendering
 */
export const detectPatternMisalignment = (element: HTMLElement): PatternAlignmentInfo => {
  const hasPatternClass = element.classList.contains('restricted-date-pattern');
  const computedStyle = window.getComputedStyle(element);
  
  // Find the container context by traversing up the DOM
  let containerContext = 'unknown';
  let currentElement: HTMLElement | null = element;
  while (currentElement && currentElement.parentElement) {
    const parent = currentElement.parentElement;
    if (parent.classList.contains('sbdocs-content')) {
      containerContext = 'storybook';
      break;
    } else if (parent.classList.contains('cla-cal-wrapper')) {
      containerContext = 'app';
      break;
    } else if (parent.classList.contains('test-container')) {
      containerContext = 'test';
      break;
    }
    currentElement = parent;
  }
  
  return {
    hasPattern: hasPatternClass,
    position: computedStyle.position,
    overflow: computedStyle.overflow,
    isolation: computedStyle.isolation,
    backgroundAttachment: computedStyle.backgroundAttachment,
    containerContext
  };
};

/**
 * Validates that CSS custom properties for pattern offset are correctly
 * set on an element
 */
export const validatePatternCustomProperties = (
  element: HTMLElement, 
  expectedX: string, 
  expectedY: string
): CustomPropertyValidation => {
  const actualX = element.style.getPropertyValue('--pattern-offset-x');
  const actualY = element.style.getPropertyValue('--pattern-offset-y');
  
  return {
    x: { 
      expected: expectedX, 
      actual: actualX, 
      matches: actualX === expectedX 
    },
    y: { 
      expected: expectedY, 
      actual: actualY, 
      matches: actualY === expectedY 
    }
  };
};

/**
 * Creates dynamic CSS rules to test pattern offset solutions
 * similar to the approach used in App.tsx
 */
export const createPatternOffsetStyles = (
  offsetX: number, 
  offsetY: number, 
  containerClass = 'test-pattern-container'
): HTMLStyleElement => {
  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-test-pattern', `offset-${offsetX}-${offsetY}`);
  styleElement.textContent = `
    .${containerClass} .restricted-date-pattern::before {
      background-position: ${offsetX}px ${offsetY}px !important;
    }
  `;
  document.head.appendChild(styleElement);
  return styleElement;
};

/**
 * Removes all dynamically created pattern test styles from the document
 */
export const cleanupPatternTestStyles = (): void => {
  const testStyles = document.querySelectorAll('style[data-test-pattern]');
  testStyles.forEach(style => style.remove());
};

/**
 * Comprehensive pattern debugging information extractor
 */
export const getPatternDebugInfo = (element: HTMLElement) => {
  const alignmentInfo = detectPatternMisalignment(element);
  const computedStyle = window.getComputedStyle(element);
  
  return {
    // Basic pattern state
    hasPatternClass: alignmentInfo.hasPattern,
    containerContext: alignmentInfo.containerContext,
    
    // CSS context that might affect pattern
    element: {
      position: alignmentInfo.position,
      overflow: alignmentInfo.overflow,
      isolation: alignmentInfo.isolation,
      transform: computedStyle.transform,
      zIndex: computedStyle.zIndex,
      display: computedStyle.display
    },
    
    // Custom properties (may not work in all test environments)
    customProperties: {
      offsetX: element.style.getPropertyValue('--pattern-offset-x') || 'not set',
      offsetY: element.style.getPropertyValue('--pattern-offset-y') || 'not set'
    },
    
    // Parent chain analysis
    parentChain: getParentChainInfo(element),
    
    // Potential issues detection
    potentialIssues: detectPotentialPatternIssues(element, computedStyle)
  };
};

/**
 * Analyzes the parent element chain to identify CSS contexts that
 * might affect pattern rendering
 */
const getParentChainInfo = (element: HTMLElement) => {
  const parents: Array<{ tagName: string; className: string; position: string }> = [];
  let current: HTMLElement | null = element.parentElement;
  let depth = 0;
  
  while (current && depth < 5) { // Limit depth to avoid infinite loops
    const computedStyle = window.getComputedStyle(current);
    parents.push({
      tagName: current.tagName.toLowerCase(),
      className: current.className,
      position: computedStyle.position
    });
    current = current.parentElement;
    depth++;
  }
  
  return parents;
};

/**
 * Detects potential CSS issues that commonly cause pattern misalignment
 */
const detectPotentialPatternIssues = (element: HTMLElement, computedStyle: CSSStyleDeclaration) => {
  const issues: string[] = [];
  
  // Check for CSS isolation
  if (computedStyle.isolation !== 'auto') {
    issues.push(`CSS isolation set to '${computedStyle.isolation}' may affect background-attachment`);
  }
  
  // Check for transforms that might affect pattern positioning
  if (computedStyle.transform !== 'none') {
    issues.push(`CSS transform '${computedStyle.transform}' may affect pattern alignment`);
  }
  
  // Check for overflow settings that might clip pattern
  if (computedStyle.overflow === 'hidden') {
    issues.push('overflow: hidden might clip diagonal pattern');
  }
  
  // Check for position contexts
  if (computedStyle.position === 'fixed') {
    issues.push('position: fixed might affect background-attachment: local behavior');
  }
  
  return issues;
};

/**
 * Creates test scenarios for different CSS contexts that might affect
 * pattern alignment
 */
export const createPatternTestScenarios = () => {
  return [
    {
      name: 'baseline',
      description: 'No additional transforms or positioning',
      style: {}
    },
    {
      name: 'translated',
      description: 'Element translated in both directions',
      style: { transform: 'translateX(10px) translateY(5px)' }
    },
    {
      name: 'scaled',
      description: 'Element scaled up',
      style: { transform: 'scale(1.1)' }
    },
    {
      name: 'positioned',
      description: 'Relatively positioned element',
      style: { position: 'relative' as const, left: '3px', top: '2px' }
    },
    {
      name: 'nested-transform',
      description: 'Nested in a transformed container',
      containerStyle: { transform: 'translateX(5px)' },
      style: { transform: 'translateY(3px)' }
    },
    {
      name: 'overflow-hidden',
      description: 'Container with overflow hidden',
      containerStyle: { overflow: 'hidden', padding: '10px' },
      style: {}
    },
    {
      name: 'high-z-index',
      description: 'Element with high z-index',
      style: { position: 'relative' as const, zIndex: 1000 }
    }
  ];
};

/**
 * Runs a comprehensive pattern alignment test across multiple scenarios
 */
export const runPatternAlignmentTests = (
  renderElement: (containerStyle?: React.CSSProperties, elementStyle?: React.CSSProperties) => HTMLElement,
  expectedPatternClass = 'restricted-date-pattern'
) => {
  const scenarios = createPatternTestScenarios();
  const results: Array<{
    scenario: string;
    passed: boolean;
    debugInfo: any;
    issues: string[];
  }> = [];
  
  scenarios.forEach(scenario => {
    try {
      const element = renderElement(scenario.containerStyle, scenario.style);
      const hasPattern = element.classList.contains(expectedPatternClass);
      const debugInfo = getPatternDebugInfo(element);
      
      results.push({
        scenario: scenario.name,
        passed: hasPattern,
        debugInfo,
        issues: debugInfo.potentialIssues
      });
    } catch (error) {
      results.push({
        scenario: scenario.name,
        passed: false,
        debugInfo: { error: (error as Error).message },
        issues: ['Test execution failed']
      });
    }
  });
  
  return results;
};

/**
 * Validates that a pattern offset fix works correctly
 */
export const validatePatternOffsetFix = (
  element: HTMLElement,
  offsetX: number,
  offsetY: number,
  containerClass = 'test-pattern-container'
): { success: boolean; details: any } => {
  // Create the offset styles
  const styleElement = createPatternOffsetStyles(offsetX, offsetY, containerClass);
  
  try {
    // Verify the style was created and applied
    const styleExists = document.head.contains(styleElement);
    const styleContent = styleElement.textContent;
    const expectedPosition = `${offsetX}px ${offsetY}px`;
    const containsExpectedPosition = styleContent?.includes(`background-position: ${expectedPosition} !important`);
    
    // Check if element has the pattern class
    const hasPatternClass = element.classList.contains('restricted-date-pattern');
    
    // Check if element is within the correct container
    const isInContainer = element.closest(`.${containerClass}`) !== null;
    
    return {
      success: styleExists && containsExpectedPosition && hasPatternClass && isInContainer,
      details: {
        styleExists,
        containsExpectedPosition,
        hasPatternClass,
        isInContainer,
        expectedPosition,
        actualStyleContent: styleContent,
        containerClass
      }
    };
  } finally {
    // Clean up
    styleElement.remove();
  }
};

/**
 * Default export of commonly used utilities
 */
export default {
  createContainerEnvironment,
  detectPatternMisalignment,
  validatePatternCustomProperties,
  createPatternOffsetStyles,
  cleanupPatternTestStyles,
  getPatternDebugInfo,
  createPatternTestScenarios,
  runPatternAlignmentTests,
  validatePatternOffsetFix
};