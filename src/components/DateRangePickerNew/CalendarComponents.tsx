import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  format,
  parseISO,
  isSameDay,
} from '../../utils/DateUtils';
import { DateRange } from './selection/DateRangeSelectionManager';
import { DEFAULT_CONTAINER_STYLES } from '../DateRangePicker.config';
import { RestrictionConfig } from './restrictions/types';
import { Layer } from '../DateRangePicker.config';
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
      width: size, 
      height: size,
      display: 'block',
      position: 'relative',
      color: '#333',
      boxSizing: 'border-box',
      flex: '0 0 auto',
      margin: 0,
      padding: 0
    }}
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
      width: size, 
      height: size,
      display: 'block',
      position: 'relative',
      color: '#333',
      boxSizing: 'border-box',
      flex: '0 0 auto',
      margin: 0,
      padding: 0
    }}
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
  defaultValue
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
      const formattedValue = format(value, "MMM dd, yyyy");
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
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        minWidth: '120px',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap'
      }}
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
          width: '100%',
          minWidth: '120px',
          padding: '4px 10px',
          boxSizing: 'border-box',
          border: '1px solid #ccc',
          borderRadius: '4px',
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
        defaultValue={defaultValue}
      />
      {showIndicator && (
        <div className={`date-input-indicator date-input-indicator-${showIndicator}`}>
          {showIndicator === 'success' ? '✓' : '×'}
        </div>
      )}
      <div
        className="date-input-error"
        style={{
          height: error && showError ? '24px' : '0',
          marginTop: error && showError ? '4px' : '0',
        }}
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
  timezone = 'UTC'
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
           display: 'flex',
           justifyContent: 'space-between',
           alignItems: 'center',
           padding: '0px 8px !omportant',
           width: '100%',
           margin: 0,
           boxSizing: 'border-box',
           position: 'relative',
           flexWrap: 'nowrap',
           backgroundColor: 'white'
         }}>
      <button
        className="cla-button-nav"
        onClick={() => moveToMonth('prev')}
        aria-label="Previous month"
        style={{
          width: '36px',
          height: '36px',
          minWidth: '36px',
          minHeight: '36px',
          flex: '0 0 36px',
          padding: 0,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 5,
          boxSizing: 'border-box'
        }}
      >
        <ChevronLeft size={16} />
      </button>
      <span 
        className="cla-header-title"
        title={`Current timezone: ${formatTimezone(timezone)}`}
        style={{
          margin: '0 8px',
          padding: '0 4px',
          flex: '1 1 auto',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: 500,
          fontSize: '16px',
          lineHeight: 1.5,
          color: '#333'
        }}
      >
        {visibleMonths === 1
          ? format(months[0], "MMMM yyyy")
          : `${format(months[0], "MMMM yyyy")} - ${format(months[months.length - 1], "MMMM yyyy")}`
        }
      </span>
      <button
        className="cla-button-nav"
        onClick={() => moveToMonth('next')}
        aria-label="Next month"
        style={{
          width: '36px',
          height: '36px',
          minWidth: '36px',
          minHeight: '36px',
          flex: '0 0 36px',
          padding: 0,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 5,
          boxSizing: 'border-box'
        }}
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
  defaultRange
}) => (
  <div className={`cla-input-container ${selectionMode === 'single' ? 'single' : 'range'}`}
       style={{
         display: 'flex',
         flexDirection: 'row',
         flexWrap: 'nowrap',
         width: '100%',
         minWidth: selectionMode === 'single' ? '200px' : '300px',
         padding: '10px 8px',
         fontSize: '14px',
         justifyContent: 'space-between',
         alignItems: 'center',
         boxSizing: 'border-box',
         whiteSpace: 'nowrap',
         overflow: 'visible'
       }}>
    <div className="cla-input-wrapper"
         style={{
           flex: selectionMode === 'single' ? '1 0 auto' : '0 0 48%',
           width: selectionMode === 'single' ? 'auto' : '48%',
           maxWidth: selectionMode === 'single' ? 'none' : '48%',
           minWidth: '120px',
           display: 'block',
           whiteSpace: 'nowrap',
           position: 'relative',
           boxSizing: 'border-box'
         }}>
      <DateInput
        value={selectedRange.start ? parseISO(selectedRange.start) : null}
        onChange={handleDateChange('start')}
        field="start"
        placeholder={selectionMode === 'single' ? "Select date" : "Start date"}
        context={dateInputContext}
        selectedRange={selectedRange}
        defaultValue={defaultRange?.start ? format(new Date(defaultRange.start), "MMM dd, yyyy") : undefined}
      />
    </div>
    {selectionMode === 'range' && (
      <div className="cla-input-wrapper"
           style={{
             flex: '0 0 48%',
             width: '48%',
             maxWidth: '48%',
             minWidth: '120px',
             display: 'block',
             whiteSpace: 'nowrap',
             position: 'relative',
             boxSizing: 'border-box'
           }}>
        <DateInput
          value={selectedRange.end ? parseISO(selectedRange.end) : null}
          onChange={handleDateChange('end')}
          field="end"
          placeholder="End date"
          context={dateInputContext}
          selectedRange={selectedRange}
          defaultValue={defaultRange?.end ? format(new Date(defaultRange.end), "MMM dd, yyyy") : undefined}
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
        width: visibleMonths === 1 ? `${monthWidth}px` : `${monthWidth * Math.min(6, Math.max(1, visibleMonths))}px`,
        isolation: 'isolate', // Create new stacking context
        ...DEFAULT_CONTAINER_STYLES,
        ...containerStyle
      }}
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
  useEffect(() => {
    console.log('[SideChevronIndicator] Props changed:', {
      outOfBoundsDirection,
      isSelecting,
      timestamp: new Date().toISOString()
    });
  }, [outOfBoundsDirection, isSelecting]);

  console.log('[SideChevronIndicator] Render attempt:', {
    outOfBoundsDirection,
    isSelecting,
    willRender: !!(outOfBoundsDirection && isSelecting)
  });

  if (!outOfBoundsDirection || !isSelecting) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      [outOfBoundsDirection === 'prev' ? 'left' : 'right']: 0,
      width: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(227, 242, 253, 0.9)',
      zIndex: 9999,
      border: '1px solid var(--border-color)',
      cursor: "pointer",
    } as React.CSSProperties}>
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
      // Cast to HTMLDivElement to access style properties
      const divContainer = container as HTMLDivElement;
      divContainer.style.position = 'absolute';
      divContainer.style.top = '0';
      divContainer.style.left = '0';
      divContainer.style.zIndex = '9999';
      divContainer.style.pointerEvents = 'none';
      document.body.appendChild(container);
    }
    setPortalContainer(container as HTMLElement);

    return () => {
      // Only remove the container if it's empty and we created it
      if (container && container.childNodes.length === 0) {
        document.body.removeChild(container);
      }
    };
  }, []);

  useEffect(() => {
    // Update position handling function
    const updatePosition = () => {
      if (!targetRef.current || !tooltipRef.current) return;

      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // Calculate initial position
      // Position tooltip centered above the target element
      let top = targetRect.top + window.scrollY - tooltipRect.height - 8;
      let left = targetRect.left + window.scrollX + (targetRect.width - tooltipRect.width) / 2;

      // Check if tooltip would go off-screen
      if (left < 8) {
        left = 8;
      } else if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8;
      }

      // If tooltip would go above the viewport, position it below the target
      if (top < window.scrollY + 8) {
        top = targetRect.bottom + window.scrollY + 8;
      }

      // Update position
      setPosition({
        top: Math.round(top),
        left: Math.round(left)
      });
    };

    // Need to wait for content to render before calculating position
    if (show) {
      // Initial positioning - delay to ensure content is rendered
      setTimeout(updatePosition, 0);
      
      // Set up event listeners for repositioning
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [show, content]);

  return (
    <>
      <div ref={targetRef} className="tooltip-container" style={{ display: 'inline-block', position: 'relative' }}>
        {children}
      </div>
      {show && portalContainer && ReactDOM.createPortal(
        <div
          ref={tooltipRef}
          className="tooltip"
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            background: '#333',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            maxWidth: '200px',
            zIndex: 9999,
            pointerEvents: 'none',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            opacity: 1,
            transition: 'opacity 0.2s ease'
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
    <div style={{ display: 'flex', width: '100%', gap: '1rem' }}>
      {monthsToRender.map((month, _index) => (
        <div 
          key={month.toISOString()}
          style={{ 
            flex: 1,
            minWidth: 0,
            maxWidth: visibleMonths === 1 ? '100%' : '50%'
          }}
        >
          {showMonthHeadings && (
            <div style={{ 
              textAlign: 'center', 
              padding: '0.5rem 0', 
              fontWeight: 'bold',
              marginBottom: '0.5rem' 
            }}>
              {format(month, 'MMMM yyyy')}
            </div>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.25rem'
            }}
          >
            {/* Day header row with weekday abbreviations */}
            {weekDays.map(day => (
              <div 
                key={day} 
                style={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  color: '#666',
                  padding: '0.25rem 0'
                }}
              >
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