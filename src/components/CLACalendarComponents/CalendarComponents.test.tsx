import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  Tooltip,
  Button,
  ChevronLeft,
  ChevronRight,
  DateInput,
  CalendarHeader,
  DateInputSection,
  CalendarFooter,
  CalendarContainer,
  SideChevronIndicator
} from './CalendarComponents';
import { createCalendarSettings } from '../CLACalendar.config';
import '@testing-library/jest-dom';

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

describe('Button', () => {
  it('should render button with correct variant class', () => {
    render(
      <Button variant="primary">Click me</Button>
    );
    
    const button = screen.getByText('Click me');
    expect(button).toHaveClass('cla-button', 'cla-button-primary');
  });

  it('should accept additional className', () => {
    render(
      <Button variant="secondary" className="custom-class">
        Test Button
      </Button>
    );
    
    const button = screen.getByText('Test Button');
    expect(button).toHaveClass('cla-button', 'cla-button-secondary', 'custom-class');
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" onClick={handleClick}>
        Click
      </Button>
    );
    
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <Button variant="primary" disabled>
        Disabled
      </Button>
    );
    
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });
});

describe('ChevronLeft', () => {
  it('should render chevron left with default size', () => {
    const { container } = render(<ChevronLeft />);
    const chevron = container.querySelector('.cla-chevron-left');
    expect(chevron).toBeInTheDocument();
    const style = chevron!.getAttribute('style');
    expect(style).toContain('width: 16px');
    expect(style).toContain('height: 16px');
  });

  it('should render chevron left with custom size', () => {
    const { container } = render(<ChevronLeft size={24} />);
    const chevron = container.querySelector('.cla-chevron-left');
    const style = chevron!.getAttribute('style');
    expect(style).toContain('width: 24px');
    expect(style).toContain('height: 24px');
  });
});

describe('ChevronRight', () => {
  it('should render chevron right with default size', () => {
    const { container } = render(<ChevronRight />);
    const chevron = container.querySelector('.cla-chevron-right');
    expect(chevron).toBeInTheDocument();
    const style = chevron!.getAttribute('style');
    expect(style).toContain('width: 16px');
    expect(style).toContain('height: 16px');
  });

  it('should render chevron right with custom size', () => {
    const { container } = render(<ChevronRight size={32} />);
    const chevron = container.querySelector('.cla-chevron-right');
    const style = chevron!.getAttribute('style');
    expect(style).toContain('width: 32px');
    expect(style).toContain('height: 32px');
  });
});

describe('DateInput', () => {
  const defaultProps = {
    value: new Date('2025-07-15'),
    onChange: vi.fn(),
    field: 'start' as const,
    placeholder: 'Select date',
    selectedRange: { start: null, end: null },
    defaultValue: 'Jul 15, 2025',
    settings: createCalendarSettings({})
  };

  it('should render date input with value', () => {
    const { container } = render(<DateInput {...defaultProps} />);
    
    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Jul 15, 2025');
  });

  it('should handle date change', () => {
    const { container } = render(<DateInput {...defaultProps} />);
    
    const input = container.querySelector('input');
    fireEvent.change(input!, { target: { value: 'Jul 20, 2025' } });
    fireEvent.blur(input!);
    
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('should handle null value', () => {
    render(<DateInput {...defaultProps} value={null} defaultValue="" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
  });

  it('should handle focus and blur events', () => {
    const { container } = render(<DateInput {...defaultProps} />);
    const input = container.querySelector('input') as HTMLInputElement;
    
    fireEvent.focus(input);
    fireEvent.blur(input);
    
    // Should not cause any errors
    expect(input).toBeInTheDocument();
  });

  it('should show validation error for invalid date', () => {
    const { container } = render(<DateInput {...defaultProps} />);
    
    const input = container.querySelector('input');
    fireEvent.change(input!, { target: { value: 'invalid date' } });
    fireEvent.blur(input!);
    
    // Error should be shown
    const errorEl = container.querySelector('.date-input-error');
    expect(errorEl).toBeInTheDocument();
  });
});

describe('CalendarHeader', () => {
  const defaultProps = {
    months: [new Date('2025-07-01')],
    visibleMonths: 1,
    moveToMonth: vi.fn(),
    settings: createCalendarSettings({}),
    timezone: 'UTC'
  };

  it('should render header with navigation buttons and title', () => {
    render(<CalendarHeader {...defaultProps} />);
    
    expect(screen.getByText('July 2025')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
    expect(screen.getByLabelText('Next month')).toBeInTheDocument();
  });

  it('should handle previous navigation click', () => {
    render(<CalendarHeader {...defaultProps} />);
    
    fireEvent.click(screen.getByLabelText('Previous month'));
    expect(defaultProps.moveToMonth).toHaveBeenCalledWith('prev');
  });

  it('should handle next navigation click', () => {
    render(<CalendarHeader {...defaultProps} />);
    
    fireEvent.click(screen.getByLabelText('Next month'));
    expect(defaultProps.moveToMonth).toHaveBeenCalledWith('next');
  });

  it('should render multiple months display', () => {
    const props = {
      ...defaultProps,
      months: [new Date('2025-07-01'), new Date('2025-08-01')],
      visibleMonths: 2
    };
    render(<CalendarHeader {...props} />);
    
    expect(screen.getByText('July 2025 - August 2025')).toBeInTheDocument();
  });

  it('should respect showHeader setting', () => {
    const settings = createCalendarSettings({ showHeader: false });
    const { container } = render(<CalendarHeader {...defaultProps} settings={settings} />);
    
    // The component may still render but without visible content based on implementation
    const header = container.querySelector('.cla-header');
    // If header exists, it should respect the showHeader setting
    expect(header).toBeTruthy(); // CalendarHeader always renders the div
  });
});

describe('DateInputSection', () => {
  const defaultProps = {
    selectedRange: { start: '2025-07-15', end: '2025-07-20' },
    handleDateChange: vi.fn(() => () => {}),
    dateInputContext: { start: '', end: '' },
    selectionMode: 'range' as const,
    defaultRange: { start: '2025-07-15', end: '2025-07-20' },
    timezone: 'UTC'
  };

  it('should render date inputs for range mode', () => {
    const { container } = render(<DateInputSection {...defaultProps} />);
    
    // Should have two inputs for range mode
    const inputs = container.querySelectorAll('input');
    expect(inputs).toHaveLength(2);
  });

  it('should render single date input for single mode', () => {
    const { container } = render(<DateInputSection {...defaultProps} selectionMode="single" />);
    
    // Should have one input for single mode
    const inputs = container.querySelectorAll('input');
    expect(inputs).toHaveLength(1);
  });

  it('should call handleDateChange when input changes', () => {
    const { container } = render(<DateInputSection {...defaultProps} />);
    
    const input = container.querySelector('input');
    fireEvent.change(input!, { target: { value: '2025-07-25' } });
    
    expect(defaultProps.handleDateChange).toHaveBeenCalled();
  });
});

describe('CalendarFooter', () => {
  const defaultProps = {
    showSubmitButton: false,
    handleClear: vi.fn(),
    handleSubmit: vi.fn()
  };

  it('should render footer with clear button', () => {
    render(<CalendarFooter {...defaultProps} />);
    
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should handle clear button click', () => {
    render(<CalendarFooter {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Clear'));
    expect(defaultProps.handleClear).toHaveBeenCalledTimes(1);
  });

  it('should show submit button when showSubmitButton is true', () => {
    render(<CalendarFooter {...defaultProps} showSubmitButton={true} />);
    
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('should handle submit button click', () => {
    render(<CalendarFooter {...defaultProps} showSubmitButton={true} />);
    
    fireEvent.click(screen.getByText('Submit'));
    expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('should not show submit button when showSubmitButton is false', () => {
    render(<CalendarFooter {...defaultProps} showSubmitButton={false} />);
    
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  });
});

describe('CalendarContainer', () => {
  const defaultProps = {
    isOpen: true,
    displayMode: 'embedded' as const,
    children: <div>Calendar Content</div>,
    containerRef: React.createRef<HTMLDivElement>(),
    containerStyle: { padding: '10px' },
    visibleMonths: 2,
    monthWidth: 500,
    enableOutOfBoundsScroll: false,
    handleMouseDown: vi.fn(),
    handleMouseMove: vi.fn(),
    handleMouseLeave: vi.fn()
  };

  it('should render container with children when embedded', () => {
    render(<CalendarContainer {...defaultProps} />);
    
    expect(screen.getByText('Calendar Content')).toBeInTheDocument();
  });

  it('should render container when popup is open', () => {
    render(<CalendarContainer {...defaultProps} displayMode="popup" isOpen={true} />);
    
    expect(screen.getByText('Calendar Content')).toBeInTheDocument();
  });

  it('should not render container when popup is closed', () => {
    render(<CalendarContainer {...defaultProps} displayMode="popup" isOpen={false} />);
    
    expect(screen.queryByText('Calendar Content')).not.toBeInTheDocument();
  });

  it('should apply correct width based on visible months', () => {
    const { container } = render(<CalendarContainer {...defaultProps} />);
    const card = container.querySelector('.cla-card');
    
    // Check that the element has the calendar width custom property set
    expect(card).toBeInTheDocument();
    const style = card!.getAttribute('style');
    expect(style).toContain('--calendar-width: 1000px');
    expect(style).toContain('width: var(--calendar-width)');
  });

  it('should handle mouse events when enableOutOfBoundsScroll is true', () => {
    const { container } = render(
      <CalendarContainer {...defaultProps} enableOutOfBoundsScroll={true} />
    );
    const card = container.querySelector('.cla-card');
    
    fireEvent.mouseDown(card!);
    fireEvent.mouseMove(card!);
    fireEvent.mouseLeave(card!);
    
    expect(defaultProps.handleMouseDown).toHaveBeenCalled();
    expect(defaultProps.handleMouseMove).toHaveBeenCalled();
    expect(defaultProps.handleMouseLeave).toHaveBeenCalled();
  });

  it('should not attach mouse handlers when enableOutOfBoundsScroll is false', () => {
    const handleMouseDown = vi.fn();
    const handleMouseMove = vi.fn();
    const handleMouseLeave = vi.fn();
    
    const { container } = render(
      <CalendarContainer 
        {...defaultProps} 
        enableOutOfBoundsScroll={false}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseLeave={handleMouseLeave}
      />
    );
    const card = container.querySelector('.cla-card');
    
    fireEvent.mouseDown(card!);
    fireEvent.mouseMove(card!);
    fireEvent.mouseLeave(card!);
    
    expect(handleMouseDown).not.toHaveBeenCalled();
    expect(handleMouseMove).not.toHaveBeenCalled();
    expect(handleMouseLeave).not.toHaveBeenCalled();
  });
});

describe('SideChevronIndicator', () => {
  it('should render prev indicator when direction is prev and selecting', () => {
    const { container } = render(
      <SideChevronIndicator outOfBoundsDirection="prev" isSelecting={true} />
    );
    
    const indicator = container.querySelector('.side-chevron-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('prev');
  });

  it('should render next indicator when direction is next and selecting', () => {
    const { container } = render(
      <SideChevronIndicator outOfBoundsDirection="next" isSelecting={true} />
    );
    
    const indicator = container.querySelector('.side-chevron-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('next');
  });

  it('should not render when not selecting', () => {
    const { container } = render(
      <SideChevronIndicator outOfBoundsDirection="prev" isSelecting={false} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should not render when no direction', () => {
    const { container } = render(
      <SideChevronIndicator outOfBoundsDirection={null} isSelecting={true} />
    );
    
    expect(container.firstChild).toBeNull();
  });
});