import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  format,
  parseISO,
  isSameDay,
} from '../../utils/DateUtils';
import { DateRange } from './selection/DateRangeSelectionManager';
import { DEFAULT_CONTAINER_STYLES, CalendarSettings } from '../CLACalendar.config';
import { RestrictionConfig } from './restrictions/types';
import { Layer } from '../CLACalendar.config';
import './CalendarComponents.css';

// Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable button component with variant styling
 * @param variant - Button style variant
 * @param children - Button content
 * @param className - Additional CSS class names
 * @param props - Additional button HTML attributes
 * @returns Styled button element
 */
export const Button: React.FC<ButtonProps> = ({ variant, children, className, ...props }) => (
  <button
    className={`cla-button cla-button-${variant} ${className || ''}`}
    {...props}
  >
    {children}
  </button>
);

// Chevron components
interface ChevronProps {
  size?: number;
}

/**
 * Left-pointing chevron icon component
 * @param size - Size of the chevron icon in pixels
 * @returns Chevron icon element
 */
export const ChevronLeft: React.FC<ChevronProps> = ({ size = 16 }) => (
  <span
    className="cla-chevron cla-chevron-left"
    style={{ 
      '--chevron-size': `${size}px`,
      width: size, 
      height: size
    } as React.CSSProperties}
  />
);

/**
 * Right-pointing chevron icon component
 * @param size - Size of the chevron icon in pixels
 * @returns Chevron icon element
 */
export const ChevronRight: React.FC<ChevronProps> = ({ size = 16 }) => (
  <span
    className="cla-chevron cla-chevron-right"
    style={{ 
      '--chevron-size': `${size}px`,
      width: size, 
      height: size
    } as React.CSSProperties}
  />
);

// Define ValidationError type
export interface ValidationError {
  message: string;
  type: string;
  field: string;
}

// DateInput component - copied exactly from CLACalendar.tsx
export interface DateInputProps {
  value: Date | null;
  onChange: (date: Date | null, isClearingError?: boolean, validationError?: ValidationError) => void;
  field: 'start' | 'end';
  placeholder: string;
  context: {
    startDate: string | null;
    endDate: string | null;
    currentField: string | null;
  };
  selectedRange: DateRange;
  defaultValue?: string;
  settings?: CalendarSettings;
}

/**
 * Date input field with validation and formatting
 * @param value - Currently selected date value
 * @param onChange - Callback function when date changes
 * @param field - Which field this input represents (start or end date)
 * @param placeholder - Placeholder text when no date is selected
 * @param selectedRange - The currently selected date range
 * @param defaultValue - Default value to initialize the input with
 * @returns Date input field with validation
 */
export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  field,
  placeholder,
  selectedRange,
  defaultValue,
  settings
}) => {
  const [inputValue, setInputValue] = useState<string>(defaultValue || '');
  const [error, setError] = useState<ValidationError | null>(null);
  const [showError, setShowError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showIndicator, setShowIndicator] = useState<'success' | 'error' | null>(null);
  const previousInputRef = useRef(defaultValue || '');

  // Initialize with defaultValue when component first mounts
  useEffect(() => {
    if (defaultValue && !value && !inputValue) {
      setInputValue(defaultValue);
      previousInputRef.current = defaultValue;
      
      // Try to parse defaultValue as a date and trigger onChange
      try {
        const date = new Date(defaultValue);
        if (!isNaN(date.getTime())) {
          onChange(date);
        }
      } catch (e) {
        // Ignore parsing errors for defaultValue
      }
    }
  }, [defaultValue, value, onChange, inputValue]);

  // Update input value when value changes
  useEffect(() => {
    if (!isEditing && value) {
      const formattedValue = format(value, "MMM dd, yyyy", 'UTC');
      setInputValue(formattedValue);
      previousInputRef.current = formattedValue;
    } else if (!isEditing && !value && !defaultValue) {
      setInputValue('');
      previousInputRef.current = '';
    }
  }, [value, isEditing, defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsEditing(true);

    if (error) {
      setError(null);
      setShowError(false);
      onChange(null, true);
    }
  };

  const validateAndUpdate = () => {
    if (inputValue === previousInputRef.current) {
      return;
    }

    previousInputRef.current = inputValue;

    // Handle empty input
    if (!inputValue.trim()) {
      onChange(null);
      setError(null);
      setShowError(false);
      if (value) {
        setShowIndicator('error');
        setTimeout(() => setShowIndicator(null), 1500);
      }
      return;
    }

    // Try to parse the input value
    try {
      const date = new Date(inputValue);
      if (!isNaN(date.getTime())) {
        // Range validation
        if (field === 'start' && selectedRange?.end) {
          const endDate = parseISO(selectedRange.end);
          if (date > endDate) {
            showValidationError({
              message: 'Start date must be before end date',
              type: 'error',
              field: 'range'
            });
            return;
          }
        } else if (field === 'end' && selectedRange?.start) {
          const startDate = parseISO(selectedRange.start);
          if (date < startDate) {
            showValidationError({
              message: 'End date must be after start date',
              type: 'error',
              field: 'range'
            });
            return;
          }
        }

        // Only show success for valid new values
        const isNewValue = !value || !isSameDay(date, value);
        if (isNewValue) {
          setShowIndicator('success');
          setTimeout(() => setShowIndicator(null), 1500);
        }

        onChange(date);
        setError(null);
        setShowError(false);
      } else {
        showValidationError({
          message: 'Please use format: MM/DD/YY or MMM DD, YYYY',
          type: 'error',
          field: 'format'
        });
      }
    } catch {
      showValidationError({
        message: 'Please use format: MM/DD/YY or MMM DD, YYYY',
        type: 'error',
        field: 'format'
      });
    }
  };

  const showValidationError = (error: ValidationError) => {
    setError(error);
    setShowError(true);
    setShowIndicator('error');
    onChange(null, false, error);

    setTimeout(() => {
      setShowError(false);
      setError(null);
      setShowIndicator(null);
    }, 1500);
  };

  return (
    <div
      className="date-input-container"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={() => {
          setIsEditing(false);
          validateAndUpdate();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setIsEditing(false);
            validateAndUpdate();
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="date-input"
        style={{
          backgroundColor: settings?.backgroundColors?.input || '#fff'
        }}
      />
      {showIndicator && (
        <div className={`date-input-indicator date-input-indicator-${showIndicator}`}>
          {showIndicator === 'success' ? '✓' : '×'}
        </div>
      )}
      <div
        className={`date-input-error ${error && showError ? 'show' : ''}`}
      >
        {error?.message}
      </div>
    </div>
  );
};

// Calendar Header component
export interface CalendarHeaderProps {
  months: Date[];
  visibleMonths: number;
  moveToMonth: (direction: 'prev' | 'next') => void;
  timezone?: string;
  settings?: CalendarSettings;
}

/**
 * Calendar header with navigation controls
 * @param months - Array of month dates to display
 * @param visibleMonths - Number of months visible at once
 * @param moveToMonth - Function to navigate between months
 * @param timezone - Optional timezone for display
 * @returns Calendar header with navigation buttons
 */
export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  months,
  visibleMonths,
  moveToMonth,
  timezone = 'UTC',
  settings
}) => {
  // Format timezone for display
  const formatTimezone = (tz: string) => {
    if (tz === 'UTC') return 'UTC';
    if (tz === 'local') return 'Browser Local Time';
    // Convert IANA timezone to more readable format
    return tz.split('/').pop()?.replace('_', ' ') || tz;
  };

  return (
    <div className="cla-header"
         style={{
           backgroundColor: settings?.backgroundColors?.monthHeader || 'white'
         }}>
      <button
        className="cla-button-nav"
        onClick={() => moveToMonth('prev')}
        aria-label="Previous month"
      >
        <ChevronLeft size={16} />
      </button>
      <span 
        className="cla-header-title"
        title={`Current timezone: ${formatTimezone(timezone)}`}
      >
        {visibleMonths === 1
          ? format(months[0], "MMMM yyyy", 'UTC')
          : `${format(months[0], "MMMM yyyy", 'UTC')} - ${format(months[months.length - 1], "MMMM yyyy", 'UTC')}`
        }
      </span>
      <button
        className="cla-button-nav"
        onClick={() => moveToMonth('next')}
        aria-label="Next month"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

// Date Input Section component
export interface DateInputSectionProps {
  selectedRange: DateRange;
  handleDateChange: (field: 'start' | 'end') => (date: Date | null, isClearingError?: boolean, validationError?: ValidationError) => void;
  dateInputContext: {
    startDate: string | null;
    endDate: string | null;
    currentField: string | null;
  };
  selectionMode: 'single' | 'range';
  defaultRange?: { start: string; end: string };
  settings?: CalendarSettings;
}

/**
 * Section containing date input fields
 * @param selectedRange - Currently selected date range
 * @param handleDateChange - Function to handle date changes
 * @param dateInputContext - Context for date input fields
 * @param selectionMode - Mode of selection (single or range)
 * @param defaultRange - Default date range to initialize inputs with
 * @returns Section with date input fields
 */
export const DateInputSection: React.FC<DateInputSectionProps> = ({
  selectedRange,
  handleDateChange,
  dateInputContext,
  selectionMode,
  defaultRange,
  settings
}) => (
  <div className={`cla-input-container ${selectionMode === 'single' ? 'single' : 'range'}`}
       style={{
         backgroundColor: settings?.backgroundColors?.headerContainer || 'transparent'
       }}>
    <div className="cla-input-wrapper">
      <DateInput
        value={selectedRange.start ? parseISO(selectedRange.start) : null}
        onChange={handleDateChange('start')}
        field="start"
        placeholder={selectionMode === 'single' ? "Select date" : "Start date"}
        context={dateInputContext}
        selectedRange={selectedRange}
        defaultValue={defaultRange?.start ? format(new Date(defaultRange.start), "MMM dd, yyyy", 'UTC') : undefined}
        settings={settings}
      />
    </div>
    {selectionMode === 'range' && (
      <div className="cla-input-wrapper">
        <DateInput
          value={selectedRange.end ? parseISO(selectedRange.end) : null}
          onChange={handleDateChange('end')}
          field="end"
          placeholder="End date"
          context={dateInputContext}
          selectedRange={selectedRange}
          defaultValue={defaultRange?.end ? format(new Date(defaultRange.end), "MMM dd, yyyy", 'UTC') : undefined}
          settings={settings}
        />
      </div>
    )}
  </div>
);

// Calendar Footer component
export interface CalendarFooterProps {
  showSubmitButton: boolean;
  handleClear: () => void;
  handleSubmit: () => void;
}

/**
 * Footer with action buttons for the calendar
 * @param showSubmitButton - Whether to show the submit button
 * @param handleClear - Function to clear the selection
 * @param handleSubmit - Function to submit the selection
 * @returns Footer with clear and submit buttons
 */
export const CalendarFooter: React.FC<CalendarFooterProps> = ({
  showSubmitButton,
  handleClear,
  handleSubmit
}) => (
  <div className="calendar-footer">
    <Button
      variant="secondary"
      onClick={handleClear}
    >
      Clear
    </Button>
    {showSubmitButton && (
      <Button
        variant="secondary"
        onClick={handleSubmit}
      >
        Submit
      </Button>
    )}
  </div>
);

// Calendar Container component
export interface CalendarContainerProps {
  isOpen: boolean;
  displayMode: 'popup' | 'embedded';
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
  containerStyle: React.CSSProperties | null;
  visibleMonths: number;
  monthWidth: number;
  enableOutOfBoundsScroll: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseLeave: (e: React.MouseEvent) => void;
}

/**
 * Main container for the calendar component
 * @param isOpen - Whether the calendar is open
 * @param displayMode - Display mode (popup or embedded)
 * @param children - Child components
 * @param containerRef - Reference to the container element
 * @param containerStyle - Additional container styles
 * @param visibleMonths - Number of months visible at once
 * @param monthWidth - Width of a single month view
 * @param enableOutOfBoundsScroll - Whether to enable scrolling when mouse is out of bounds
 * @param handleMouseDown - Mouse down event handler
 * @param handleMouseMove - Mouse move event handler
 * @param handleMouseLeave - Mouse leave event handler
 * @returns Calendar container or null if not visible
 */
export const CalendarContainer: React.FC<CalendarContainerProps> = ({
  isOpen,
  displayMode,
  children,
  containerRef,
  containerStyle,
  visibleMonths,
  monthWidth,
  enableOutOfBoundsScroll,
  handleMouseDown,
  handleMouseMove,
  handleMouseLeave
}) => (
  (isOpen || displayMode === 'embedded') && (
    <div
      ref={containerRef}
      className={`cla-card ${displayMode === 'popup' ? 'cla-card-popup' : ''}`}
      style={{
        '--calendar-width': visibleMonths === 1 ? `${monthWidth}px` : `${monthWidth * Math.min(6, Math.max(1, visibleMonths))}px`,
        width: 'var(--calendar-width)',
        ...DEFAULT_CONTAINER_STYLES,
        ...containerStyle
      } as React.CSSProperties}
      onMouseDown={enableOutOfBoundsScroll ? handleMouseDown : undefined}
      onMouseMove={enableOutOfBoundsScroll ? handleMouseMove : undefined}
      onMouseLeave={enableOutOfBoundsScroll ? handleMouseLeave : undefined}
    >
      {children}
    </div>
  )
);

// Add the SideChevronIndicator component with the exact same implementation
export interface SideChevronIndicatorProps {
  outOfBoundsDirection: 'prev' | 'next' | null;
  isSelecting: boolean;
}

/**
 * Indicator for out-of-bounds scrolling during selection
 * @param outOfBoundsDirection - Direction of out-of-bounds scrolling
 * @param isSelecting - Whether user is currently selecting a date range
 * @returns Chevron indicator or null if not needed
 */
export const SideChevronIndicator: React.FC<SideChevronIndicatorProps> = ({
  outOfBoundsDirection,
  isSelecting
}) => {
  if (!outOfBoundsDirection || !isSelecting) return null;

  return (
    <div className={`side-chevron-indicator ${outOfBoundsDirection}`}>
      {outOfBoundsDirection === 'prev' ? (
        <ChevronLeft size={24} />
      ) : (
        <ChevronRight size={24} />
      )}
    </div>
  );
};

// Add the Tooltip component
export interface TooltipProps {
  content: React.ReactNode;
  show: boolean;
  children: React.ReactNode;
}

/**
 * Tooltip component for displaying additional information
 * @param content - Content to display in the tooltip
 * @param show - Whether the tooltip should be shown
 * @param children - Element that triggers the tooltip
 * @returns Tooltip with content
 */
export const Tooltip: React.FC<TooltipProps> = ({ content, show, children }) => {
  // Don't render if content is invalid
  if (!content) {
    return <>{children}</>;
  }

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create or get the portal container
    let container = document.querySelector('.cla-portal-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'cla-portal-container';
      document.body.appendChild(container);
    }
    setPortalContainer(container as HTMLElement);

    return () => {
      // Only remove the container if it's empty and we created it
      try {
        if (container && container.parentNode && container.childNodes.length === 0) {
          document.body.removeChild(container);
        }
      } catch (error) {
        // Ignore cleanup errors during unmount/story transitions
        console.debug('Tooltip cleanup error (safe to ignore):', error);
      }
    };
  }, []);

  useEffect(() => {
    // Update position handling function
    const updatePosition = () => {
      if (!targetRef.current || !tooltipRef.current || !show) return;

      try {
        const targetRect = targetRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        // Check if target is still visible in viewport
        const isTargetVisible = 
          targetRect.bottom > 0 &&
          targetRect.top < window.innerHeight &&
          targetRect.right > 0 &&
          targetRect.left < window.innerWidth;

        // Hide tooltip if target is not visible
        if (!isTargetVisible) {
          setPosition({ top: -9999, left: -9999 });
          return;
        }

        // Calculate initial position
        // Since we're using a fixed position portal, we should use viewport coordinates
        // Position tooltip centered above the target element
        let top = targetRect.top - tooltipRect.height - 8;
        let left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;

        // Check if tooltip would go off-screen
        if (left < 8) {
          left = 8;
        } else if (left + tooltipRect.width > window.innerWidth - 8) {
          left = window.innerWidth - tooltipRect.width - 8;
        }

        // If tooltip would go above the viewport, position it below the target
        if (top < 8) {
          top = targetRect.bottom + 8;
        }

        // Update position
        setPosition({
          top: Math.round(top),
          left: Math.round(left)
        });
      } catch (error) {
        // Ignore positioning errors during unmount/story transitions
        console.debug('Tooltip positioning error (safe to ignore):', error);
      }
    };

    // Find all scrollable parents and attach listeners
    const scrollableParents: Element[] = [];
    const findScrollableParents = (element: Element | null) => {
      if (!element || element === document.body) return;
      
      const style = window.getComputedStyle(element);
      const isScrollable = 
        style.overflow === 'auto' || 
        style.overflow === 'scroll' ||
        style.overflowY === 'auto' ||
        style.overflowY === 'scroll' ||
        style.overflowX === 'auto' ||
        style.overflowX === 'scroll';
      
      if (isScrollable) {
        scrollableParents.push(element);
      }
      
      findScrollableParents(element.parentElement);
    };

    // Need to wait for content to render before calculating position
    if (show && targetRef.current) {
      // Find all scrollable parents
      findScrollableParents(targetRef.current);
      
      // Initial positioning - delay to ensure content is rendered
      setTimeout(updatePosition, 0);
      
      // Set up event listeners for repositioning
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      // Add scroll listeners to all scrollable parents
      scrollableParents.forEach(parent => {
        parent.addEventListener('scroll', updatePosition);
      });
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
        
        // Remove scroll listeners from all scrollable parents
        scrollableParents.forEach(parent => {
          parent.removeEventListener('scroll', updatePosition);
        });
      };
    }
  }, [show, content]);

  return (
    <>
      <div ref={targetRef} className="tooltip-container">
        {children}
      </div>
      {show && portalContainer && ReactDOM.createPortal(
        <div
          ref={tooltipRef}
          className="tooltip"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`
          }}
        >
          {content}
        </div>,
        portalContainer
      )}
    </>
  );
};

// Add these interfaces and export them
export interface RenderResult {
  backgroundColor?: string;
  element?: React.ReactNode;
  tooltipContent?: React.ReactNode;
}

export interface DayCellProps {
  date: Date;
  selectedRange: DateRange;
  isCurrentMonth: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  showTooltips: boolean;
  renderContent?: (date: Date) => RenderResult | null;
  layer: Layer;
  activeLayer: string;
  restrictionConfig?: RestrictionConfig;
}

export interface MonthGridProps {
  baseDate: Date;
  selectedRange: DateRange;
  onSelectionStart: (date: Date) => void;
  onSelectionMove: (date: Date) => void;
  isSelecting: boolean;
  style?: React.CSSProperties;
  showMonthHeading?: boolean;
  showTooltips: boolean;
  renderDay?: (date: Date) => RenderResult | null;
  layer: Layer;
  activeLayer: string;
  restrictionConfig?: RestrictionConfig;
  startWeekOnSunday?: boolean;
}

export interface MonthPairProps extends Omit<MonthGridProps, 'baseDate' | 'style'> {
  firstMonth: Date;
  secondMonth: Date | null;
  visibleMonths: number;
  showMonthHeadings: boolean;
  restrictionConfig?: RestrictionConfig;
  _selectedRange?: DateRange;
  _onSelectionStart?: (date: Date) => void;
  _onSelectionMove?: (date: Date) => void;
  _isSelecting?: boolean;
  _showTooltips?: boolean;
  _renderDay?: (date: Date) => RenderResult | null;
  _layer?: Layer;
  _activeLayer?: string;
  _restrictionConfig?: RestrictionConfig;
}

export interface CalendarGridProps {
  months: Date[];
  selectedRange: DateRange;
  onSelectionStart: (date: Date) => void;
  onSelectionMove: (date: Date) => void;
  isSelecting: boolean;
  visibleMonths: number;
  showMonthHeadings: boolean;
  showTooltips: boolean;
  layer: Layer;
  activeLayer: string;
  restrictionConfig?: RestrictionConfig;
  startWeekOnSunday: boolean;
}

export interface LayerControlProps {
  layers: Layer[];
  activeLayer: string;
  onLayerChange: (layerId: string) => void;
}

// Add these types
export type DocumentMouseHandler = (e: MouseEvent) => void;
export type ReactMouseHandler = (e: React.MouseEvent<HTMLDivElement>) => void;

// Rename MonthPair to _MonthPair
const _MonthPair: React.FC<MonthPairProps> = ({
  firstMonth,
  secondMonth,
  _selectedRange,
  _onSelectionStart,
  _onSelectionMove,
  _isSelecting,
  visibleMonths,
  showMonthHeadings,
  _showTooltips,
  _renderDay,
  _layer,
  _activeLayer,
  _restrictionConfig,
  startWeekOnSunday
}) => {
  // Create an array of months to show based on firstMonth and secondMonth
  const monthsToRender = secondMonth ? [firstMonth, secondMonth] : [firstMonth];
  
  // Week day abbreviations
  const weekDays = startWeekOnSunday 
    ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  
  return (
    <div className="month-pair-container">
      {monthsToRender.map((month, _index) => (
        <div 
          key={month.toISOString()}
          className={`month-pair-item ${visibleMonths === 1 ? 'single' : 'multiple'}`}
        >
          {showMonthHeadings && (
            <div className="month-pair-heading">
              {format(month, 'MMMM yyyy', 'UTC')}
            </div>
          )}
          <div className="month-pair-grid">
            {/* Day header row with weekday abbreviations */}
            {weekDays.map(day => (
              <div key={day} className="month-pair-weekday">
                {day}
              </div>
            ))}
            
            {/* Generate the actual calendar grid here */}
            {/* This would be implemented with the specific date calculation logic */}
            {/* Placeholder for now */}
          </div>
        </div>
      ))}
    </div>
  );
}; 