import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tooltip } from './CalendarComponents';

// Mock getBoundingClientRect
const mockGetBoundingClientRect = vi.fn();
Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;

// Mock window.getComputedStyle
const mockGetComputedStyle = vi.fn();
window.getComputedStyle = mockGetComputedStyle;

describe('Tooltip', () => {
  beforeEach(() => {
    // Reset mocks
    mockGetBoundingClientRect.mockReset();
    mockGetComputedStyle.mockReset();
    
    // Default mock implementations
    mockGetBoundingClientRect.mockReturnValue({
      top: 100,
      left: 100,
      bottom: 120,
      right: 200,
      width: 100,
      height: 20,
      x: 100,
      y: 100
    });
    
    mockGetComputedStyle.mockReturnValue({
      overflow: 'visible',
      overflowX: 'visible',
      overflowY: 'visible'
    });
  });

  afterEach(() => {
    // Clean up any portal containers
    document.querySelectorAll('.cla-portal-container').forEach(el => el.remove());
  });

  it('should render children when content is invalid', () => {
    render(
      <Tooltip content={null} show={true}>
        <div>Test Child</div>
      </Tooltip>
    );
    
    expect(screen.getByText('Test Child')).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should not show tooltip when show is false', () => {
    render(
      <Tooltip content="Test tooltip" show={false}>
        <div>Test Child</div>
      </Tooltip>
    );
    
    expect(screen.getByText('Test Child')).toBeInTheDocument();
    expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
  });

  it('should show tooltip when show is true', async () => {
    render(
      <Tooltip content="Test tooltip" show={true}>
        <div>Test Child</div>
      </Tooltip>
    );
    
    await waitFor(() => {
      const tooltip = screen.getByText('Test tooltip');
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('should position tooltip using fixed positioning', async () => {
    // Mock tooltip dimensions
    mockGetBoundingClientRect
      .mockReturnValueOnce({ // Target element
        top: 200,
        left: 100,
        bottom: 220,
        right: 200,
        width: 100,
        height: 20,
        x: 100,
        y: 200
      })
      .mockReturnValueOnce({ // Tooltip element
        width: 80,
        height: 30
      });
    
    render(
      <Tooltip content="Test tooltip" show={true}>
        <div>Test Child</div>
      </Tooltip>
    );
    
    await waitFor(() => {
      const tooltip = screen.getByText('Test tooltip');
      const style = window.getComputedStyle(tooltip);
      
      // Should be positioned above the target element (200 - 30 - 8 = 162)
      expect(tooltip.style.top).toBe('162px');
      // Should be centered horizontally (100 + (100 - 80) / 2 = 110)
      expect(tooltip.style.left).toBe('110px');
    });
  });

  it('should hide tooltip when target scrolls out of view', async () => {
    // Initial position - element is visible
    mockGetBoundingClientRect
      .mockReturnValueOnce({ // Target element
        top: 200,
        left: 100,
        bottom: 220,
        right: 200,
        width: 100,
        height: 20
      })
      .mockReturnValueOnce({ // Tooltip element
        width: 80,
        height: 30
      });
    
    const { rerender } = render(
      <Tooltip content="Test tooltip" show={true}>
        <div>Test Child</div>
      </Tooltip>
    );
    
    await waitFor(() => {
      const tooltip = screen.getByText('Test tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip.style.top).not.toBe('-9999px');
    });
    
    // Simulate element scrolling out of view
    mockGetBoundingClientRect
      .mockReturnValueOnce({ // Target element - now out of view
        top: -100,
        left: 100,
        bottom: -80,
        right: 200,
        width: 100,
        height: 20
      })
      .mockReturnValueOnce({ // Tooltip element
        width: 80,
        height: 30
      });
    
    // Trigger scroll event
    fireEvent.scroll(window);
    
    await waitFor(() => {
      const tooltip = screen.getByText('Test tooltip');
      expect(tooltip.style.top).toBe('-9999px');
      expect(tooltip.style.left).toBe('-9999px');
    });
  });

  it('should update position when window scrolls', async () => {
    render(
      <Tooltip content="Test tooltip" show={true}>
        <div>Test Child</div>
      </Tooltip>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    });
    
    const initialTooltip = screen.getByText('Test tooltip');
    const initialTop = initialTooltip.style.top;
    
    // Mock new position after scroll
    mockGetBoundingClientRect
      .mockReturnValueOnce({ // Target element - moved after scroll
        top: 150,
        left: 100,
        bottom: 170,
        right: 200,
        width: 100,
        height: 20
      })
      .mockReturnValueOnce({ // Tooltip element
        width: 80,
        height: 30
      });
    
    // Trigger scroll event
    fireEvent.scroll(window);
    
    await waitFor(() => {
      const tooltip = screen.getByText('Test tooltip');
      // Position should have updated
      expect(tooltip.style.top).not.toBe(initialTop);
    });
  });

  it('should update position on window resize', async () => {
    render(
      <Tooltip content="Test tooltip" show={true}>
        <div>Test Child</div>
      </Tooltip>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    });
    
    // Change mock dimensions
    mockGetBoundingClientRect
      .mockReturnValueOnce({ // Target element - moved
        top: 300,
        left: 200,
        bottom: 320,
        right: 300,
        width: 100,
        height: 20
      })
      .mockReturnValueOnce({ // Tooltip element
        width: 80,
        height: 30
      });
    
    // Trigger resize event
    fireEvent.resize(window);
    
    await waitFor(() => {
      const tooltip = screen.getByText('Test tooltip');
      // Should be repositioned above the new target position (300 - 30 - 8 = 262)
      expect(tooltip.style.top).toBe('262px');
    });
  });

  it('should position tooltip below target if it would go above viewport', async () => {
    // Mock target near top of viewport
    mockGetBoundingClientRect
      .mockReturnValueOnce({ // Target element
        top: 10,
        left: 100,
        bottom: 30,
        right: 200,
        width: 100,
        height: 20
      })
      .mockReturnValueOnce({ // Tooltip element
        width: 80,
        height: 30
      });
    
    render(
      <Tooltip content="Test tooltip" show={true}>
        <div>Test Child</div>
      </Tooltip>
    );
    
    await waitFor(() => {
      const tooltip = screen.getByText('Test tooltip');
      // Should be positioned below the target (30 + 8 = 38)
      expect(tooltip.style.top).toBe('38px');
    });
  });

  it('should constrain tooltip position within viewport bounds', async () => {
    // Mock viewport width
    Object.defineProperty(window, 'innerWidth', {
      value: 500,
      writable: true
    });
    
    // Mock target near right edge
    mockGetBoundingClientRect
      .mockReturnValueOnce({ // Target element
        top: 100,
        left: 450,
        bottom: 120,
        right: 550,
        width: 100,
        height: 20
      })
      .mockReturnValueOnce({ // Tooltip element
        width: 100,
        height: 30
      });
    
    render(
      <Tooltip content="Test tooltip" show={true}>
        <div>Test Child</div>
      </Tooltip>
    );
    
    await waitFor(() => {
      const tooltip = screen.getByText('Test tooltip');
      // Should be constrained to viewport edge (500 - 100 - 8 = 392)
      expect(tooltip.style.left).toBe('392px');
    });
  });
});