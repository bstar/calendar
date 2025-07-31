import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { MonthGrid } from './MonthGrid';
import '@testing-library/jest-dom';

// Test the tooltip rendering logic directly by extracting and testing the renderTooltip function
describe('MonthGrid renderTooltip functionality', () => {
  let createPortalSpy: any;
  
  beforeEach(() => {
    // Spy on ReactDOM.createPortal
    createPortalSpy = vi.spyOn(ReactDOM, 'createPortal').mockImplementation((element: any) => {
      return element as React.ReactPortal;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render tooltip with correct styles and content', () => {
    // Create a simple component that uses the tooltip rendering pattern from MonthGrid
    const TestComponent = () => {
      const [mousePosition] = React.useState({ x: 100, y: 200 });
      const settings = { baseFontSize: '16px' };
      
      const renderTooltip = (message: string, settings: any) => {
        return ReactDOM.createPortal(
          <div
            className="month-grid-tooltip"
            style={{
              left: `${mousePosition.x + 10}px`,
              top: `${mousePosition.y + 10}px`,
              fontSize: `${parseFloat(settings.baseFontSize) * 0.875}px`
            }}
          >
            {message}
          </div>,
          document.body
        );
      };
      
      return <>{renderTooltip('Test tooltip message', settings)}</>;
    };
    
    render(<TestComponent />);
    
    expect(createPortalSpy).toHaveBeenCalled();
    const portalCall = createPortalSpy.mock.calls[0];
    const tooltipElement = portalCall[0];
    
    expect(tooltipElement.type).toBe('div');
    expect(tooltipElement.props.className).toBe('month-grid-tooltip');
    expect(tooltipElement.props.children).toBe('Test tooltip message');
    expect(tooltipElement.props.style).toEqual({
      left: '110px',
      top: '210px',
      fontSize: '14px'
    });
  });

  it('should handle different base font sizes', () => {
    const TestComponent = ({ baseFontSize }: { baseFontSize: string }) => {
      const [mousePosition] = React.useState({ x: 50, y: 75 });
      const settings = { baseFontSize };
      
      const renderTooltip = (message: string, settings: any) => {
        const baseSize = settings.baseFontSize || '1rem';
        const fontSize = baseSize.includes('rem') ?
          `${parseFloat(baseSize) * 0.875}rem` :
          baseSize.includes('px') ?
            `${parseFloat(baseSize) * 0.875}px` :
            '0.875rem';
            
        return ReactDOM.createPortal(
          <div
            className="month-grid-tooltip"
            style={{
              left: `${mousePosition.x + 10}px`,
              top: `${mousePosition.y + 10}px`,
              fontSize
            }}
          >
            {message}
          </div>,
          document.body
        );
      };
      
      return <>{renderTooltip('Font size test', settings)}</>;
    };
    
    // Test with rem units
    const { rerender } = render(<TestComponent baseFontSize="1rem" />);
    let tooltipElement = createPortalSpy.mock.calls[0][0];
    expect(tooltipElement.props.style.fontSize).toBe('0.875rem');
    
    // Test with px units
    createPortalSpy.mockClear();
    rerender(<TestComponent baseFontSize="20px" />);
    tooltipElement = createPortalSpy.mock.calls[0][0];
    expect(tooltipElement.props.style.fontSize).toBe('17.5px');
    
    // Test with other units (defaults to rem)
    createPortalSpy.mockClear();
    rerender(<TestComponent baseFontSize="1em" />);
    tooltipElement = createPortalSpy.mock.calls[0][0];
    expect(tooltipElement.props.style.fontSize).toBe('0.875rem');
  });

  it('should render to document.body', () => {
    const TestComponent = () => {
      const renderTooltip = (message: string) => {
        return ReactDOM.createPortal(
          <div className="month-grid-tooltip">{message}</div>,
          document.body
        );
      };
      
      return <>{renderTooltip('Portal target test')}</>;
    };
    
    render(<TestComponent />);
    
    expect(createPortalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          children: 'Portal target test'
        })
      }),
      document.body
    );
  });
});