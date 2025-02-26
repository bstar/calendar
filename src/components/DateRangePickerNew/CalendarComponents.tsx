import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { DateRange } from './selection/DateRangeSelectionManager';
import { DEFAULT_CONTAINER_STYLES } from '../DateRangePicker.config';

// Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: string;
  children: React.ReactNode;
  className?: string;
}

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

export const ChevronLeft: React.FC<ChevronProps> = ({ size = 16 }) => (
  <span 
    className="cla-chevron cla-chevron-left" 
    style={{ width: size, height: size }}
  />
);

export const ChevronRight: React.FC<ChevronProps> = ({ size = 16 }) => (
  <span 
    className="cla-chevron cla-chevron-right" 
    style={{ width: size, height: size }}
  />
);

// DateInput component - copied exactly from CLACalendar.tsx
export interface DateInputProps {
  value: Date | null;
  onChange: (date: Date | null, isClearingError?: boolean, validationError?: any) => void;
  field: 'start' | 'end';
  placeholder: string;
  context: {
    startDate: string | null;
    endDate: string | null;
    currentField: string | null;
  };
  selectedRange: DateRange;
}

// This is the exact implementation from CLACalendar.tsx
export const DateInput: React.FC<DateInputProps> = ({ 
  value, 
  onChange, 
  field, 
  placeholder, 
  context,
  selectedRange 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<any | null>(null);
  const [showError, setShowError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showIndicator, setShowIndicator] = useState<'success' | 'error' | null>(null);
  const previousInputRef = useRef('');

  useEffect(() => {
    if (!isEditing && value) {
      const formattedValue = format(value, "MMM dd, yyyy");
      setInputValue(formattedValue);
      previousInputRef.current = formattedValue;
    } else if (!isEditing && !value) {
      setInputValue('');
      previousInputRef.current = '';
    }
  }, [value, isEditing]);

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
    } catch (e) {
      showValidationError({
        message: 'Please use format: MM/DD/YY or MMM DD, YYYY',
        type: 'error',
        field: 'format'
      });
    }
  };

  const showValidationError = (error: any) => {
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
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}
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
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '4px',
          backgroundColor: 'white',
          color: '#000',
          transition: 'border-color 0.15s ease',
          cursor: 'text',
          userSelect: 'text',
          WebkitUserSelect: 'text',
          MozUserSelect: 'text',
          border: '1px solid #979797',
          textAlign: 'center',
        }}
      />
      {showIndicator && (
        <div
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            color: showIndicator === 'success' ? '#28a745' : '#dc3545',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {showIndicator === 'success' ? '✓' : '×'}
        </div>
      )}
      <div
        style={{
          height: error && showError ? '24px' : '0',
          marginTop: error && showError ? '4px' : '0',
          fontSize: '0.875rem',
          color: '#dc3545',
          overflow: 'hidden',
          transition: 'height 0.2s ease-in-out, margin-top 0.2s ease-in-out',
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
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  months, 
  visibleMonths, 
  moveToMonth 
}) => (
  <div className="cla-header" style={{ 
    padding: '12px 16px',
    borderBottom: 'none' // Force remove any border
  }}>
    <button 
      className="cla-button-nav" 
      onClick={() => moveToMonth('prev')}
      style={{ outline: 'none' }}
    >
      <ChevronLeft size={16} />
    </button>
    <span className="cla-header-title">
      {visibleMonths === 1 
        ? format(months[0], "MMMM yyyy")
        : `${format(months[0], "MMMM yyyy")} - ${format(months[months.length - 1], "MMMM yyyy")}`
      }
    </span>
    <button 
      className="cla-button-nav" 
      onClick={() => moveToMonth('next')}
      style={{ outline: 'none' }}
    >
      <ChevronRight size={16} />
    </button>
  </div>
);

// Date Input Section component
export interface DateInputSectionProps {
  selectedRange: DateRange;
  handleDateChange: (field: 'start' | 'end') => (date: Date | null, isClearingError?: boolean, validationError?: any) => void;
  dateInputContext: {
    startDate: string | null;
    endDate: string | null;
    currentField: string | null;
  };
  selectionMode: 'single' | 'range';
}

export const DateInputSection: React.FC<DateInputSectionProps> = ({
  selectedRange,
  handleDateChange,
  dateInputContext,
  selectionMode
}) => (
  <div className="cla-input-container" style={{ padding: '16px' }}>
    <div className="cla-input-wrapper">
      <DateInput
        value={selectedRange.start ? parseISO(selectedRange.start) : null}
        onChange={handleDateChange('start')}
        field="start"
        placeholder={selectionMode === 'single' ? "Select date" : "Start date"}
        context={dateInputContext}
        selectedRange={selectedRange}
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

export const CalendarFooter: React.FC<CalendarFooterProps> = ({ 
  showSubmitButton, 
  handleClear, 
  handleSubmit 
}) => (
  <div className="cla-card-footer" style={{ 
    padding: '0 16px 16px 16px',
    borderTop: 'none', // Force remove any border
    display: 'flex',
    justifyContent: 'space-between'
  }}>
    <Button
      variant="primary"
      onClick={handleClear}
    >
      Clear
    </Button>
    <div>
      {showSubmitButton && (
        <Button
          variant="primary"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      )}
    </div>
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
  singleMonthWidth: number;
  enableOutOfBoundsScroll: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseLeave: (e: React.MouseEvent) => void;
}

export const CalendarContainer: React.FC<CalendarContainerProps> = ({
  isOpen,
  displayMode,
  children,
  containerRef,
  containerStyle,
  visibleMonths,
  singleMonthWidth,
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
        width: visibleMonths === 1 ? `${singleMonthWidth}px` : `${400 * Math.min(6, Math.max(1, visibleMonths))}px`,
        position: displayMode === 'popup' ? 'relative' : 'static',
        padding: 0,
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