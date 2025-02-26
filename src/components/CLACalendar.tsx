import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import debounce from "lodash-es/debounce";
import {
  format,
  parse,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  getISOWeek,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isValid,
  isWithinInterval,
  addDays
} from "date-fns";
import './DateRangePicker.css';
import { 
  DEFAULT_CONTAINER_STYLES, 
  DEFAULT_LAYERS,
  CalendarSettings,
  Layer,
  LayerData,
  BackgroundData
} from './DateRangePicker.config';
import { LayerRenderer } from './DateRangePickerNew/layers/LayerRenderer';
import { RestrictionManager } from './DateRangePickerNew/restrictions/RestrictionManager';
import { RestrictionConfig } from './DateRangePickerNew/restrictions/types';
import { Notification } from './DateRangePickerNew/Notification';
import { LayerManager } from './DateRangePickerNew/layers/LayerManager';
import { RestrictionBackgroundGenerator } from './DateRangePickerNew/restrictions/RestrictionBackgroundGenerator';
import { DateRangeSelectionManager, DateRange } from './DateRangePickerNew/selection/DateRangeSelectionManager';
import { DateRangePickerHandlers, ValidationError, DateInputContext, MousePosition } from './DateRangePickerNew/handlers/DateRangePickerHandlers';
import {
  Button,
  ChevronLeft,
  ChevronRight,
  DateInput,
  DateInputProps,
  CalendarHeader,
  DateInputSection,
  CalendarFooter,
  CalendarContainer
} from './DateRangePickerNew/CalendarComponents';

// Add these interfaces after the existing ones
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardCompositionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

interface CardComponent extends React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>> {
  Header: React.FC<CardCompositionProps>;
  Body: React.FC<CardCompositionProps>;
  Footer: React.FC<CardCompositionProps>;
}

// Custom components
const Card = React.forwardRef<HTMLDivElement, CardProps>(({ children, className, ...props }, ref) => (
  <div ref={ref} className={`cla-card ${className || ''}`} {...props}>
    {children}
  </div>
)) as CardComponent;

Card.Header = ({ children, className, ...props }: CardCompositionProps) => (
  <div className={`cla-card-header ${className || ''}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className, ...props }: CardCompositionProps) => (
  <div className={`cla-card-body ${className || ''}`} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className, ...props }: CardCompositionProps) => (
  <div className={`cla-card-footer ${className || ''}`} {...props}>
    {children}
  </div>
);

const Input: React.FC<InputProps> = ({ className, ...props }) => (
  <input
    className={`cla-input ${className || ''}`}
    {...props}
  />
);

// Add these type definitions
interface RenderResult {
  backgroundColor?: string;
  element?: React.ReactNode;
  tooltipContent?: React.ReactNode;
}

interface Renderer {
  (date: Date): RenderResult | null;
}

// Add these types near the top with other interfaces
type DocumentMouseHandler = (e: MouseEvent) => void;
type ReactMouseHandler = (e: React.MouseEvent<HTMLDivElement>) => void;

const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      const isFloatingIndicator = (event.target as Element).closest('.floating-indicator');
      if (isFloatingIndicator) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
};

const dateValidator = (() => {
  const DATE_FORMAT = "MMMM d, yyyy";

  const parseDotNotation = (input) => {
    console.log('Input:', input);
    
    // Quick test for dot notation attempt
    if (!/\d\./.test(input)) {
      console.log('Not dot notation');
      return null;
    }

    // Parse the components
    const match = input.match(/(\d?\d)\.(\d?\d)\.(\d?\d?\d\d)/);
    console.log('Regex match:', match);
    
    if (!match) {
      console.log('No match found');
      return null;
    }

    const [_, month, day, year] = match;
    console.log('Parsed components:', { month, day, year });
    
    const fullYear = year.length === 2 ? `20${year}` : year;
    console.log('Full year:', fullYear);
    
    // Create and validate date
    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    console.log('Created date:', date);
    console.log('Month check:', date.getMonth(), parseInt(month) - 1);
    
    const isValid = date.getMonth() === parseInt(month) - 1;
    console.log('Is valid?', isValid);
    
    return isValid ? date : null;
  };

  return {
    validate: (value, context) => {
      if (!value) return { isValid: true, error: null };

      // Try dot notation if it looks like one
      if (/\d\./.test(value)) {
        const date = parseDotNotation(value);
        return date ? { isValid: true, error: null } : {
          isValid: false,
          error: {
            message: 'Invalid date',
            type: 'error',
            field: 'date'
          }
        };
      }

      // Otherwise use standard format
      try {
        parse(value, DATE_FORMAT, new Date());
        return { isValid: true, error: null };
      } catch {
        return {
          isValid: false,
          error: {
            message: `Please use format: ${DATE_FORMAT}`,
            type: 'error',
            field: 'format'
          }
        };
      }
    },
    formatValue: (date) => !date ? '' : format(date, DATE_FORMAT),
    parseValue: (value) => {
      if (!value) return null;
      return /\d\./.test(value) ? parseDotNotation(value) : parse(value, DATE_FORMAT, new Date());
    },
    DATE_FORMAT
  };
})();

// Add type for validation error
interface ValidationError {
  message: string;
  type: string;
  field: string;
}

// Add these interfaces near the top with other interfaces
interface CalendarGridProps {
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

interface MonthGridProps {
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

interface DayCellProps {
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

interface TooltipProps {
  content: React.ReactNode;
  show: boolean;
  children: React.ReactNode;
}

interface MonthPairProps extends Omit<MonthGridProps, 'baseDate' | 'style'> {
  firstMonth: Date;
  secondMonth: Date | null;
  visibleMonths: number;
  showMonthHeadings: boolean;
}

interface LayerControlProps {
  layers: Layer[];
  activeLayer: string;
  onLayerChange: (layerId: string) => void;
}

interface SideChevronIndicatorProps {
  outOfBoundsDirection: 'prev' | 'next' | null;
  isSelecting: boolean;
}

// Update the Tooltip component
const Tooltip: React.FC<TooltipProps> = ({ content, show, children }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && isHovered && targetRef.current && tooltipRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      const newPosition = {
        top: targetRect.top - tooltipRect.height - 8,
        left: targetRect.left + (targetRect.width - tooltipRect.width) / 2
      };

      setPosition(newPosition);
    }
  }, [show, isHovered, content]);

  return (
    <div 
      ref={targetRef} 
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {show && isHovered && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            borderRadius: '4px',
            zIndex: 9999,
            fontSize: '14px',
            maxWidth: '300px',
            padding: '8px',
            pointerEvents: 'none',
            border: '1px solid rgba(0,0,0,0.2)'
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// Update MonthGrid to use proper types for weeks
const MonthGrid: React.FC<MonthGridProps> = ({
  baseDate,
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting,
  style,
  showMonthHeading = false,
  showTooltips,
  renderDay,
  layer,
  startWeekOnSunday = false,
  restrictionConfig
}) => {
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(monthStart);
  const weekStart = startOfWeek(monthStart, { weekStartsOn: startWeekOnSunday ? 0 : 1 });
  const weekEnd = endOfWeek(monthEnd, { weekStartsOn: startWeekOnSunday ? 0 : 1 });
  const calendarDays = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });

  const weeks: Record<number, Date[]> = calendarDays.reduce((acc, day, index) => {
    const weekIndex = Math.floor(index / 7);
    return {
      ...acc,
      [weekIndex]: [...(acc[weekIndex] || []), day]
    };
  }, {} as Record<number, Date[]>);

  // Always maintain 6 rows of space regardless of actual weeks in month
  const totalWeeks = 6;
  const currentWeeks = Object.keys(weeks).length;
  const emptyWeeks = totalWeeks - currentWeeks;

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const restrictionManager = useMemo(() => 
    new RestrictionManager(restrictionConfig ?? { restrictions: [] }), 
    [restrictionConfig]
  );

  const weekDays = useMemo(() => {
    const days = startWeekOnSunday 
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days;
  }, [startWeekOnSunday]);

  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({
      x: e.clientX + 10,
      y: e.clientY + 10
    });
  };

  const handleGridMouseLeave = () => {
    setHoveredDate(null);
  };

  return (
    <div style={{ 
      width: '100%',
      padding: '0 8px',
      marginTop: 0,  // Ensure no top margin
      ...style
    }}>
      {showMonthHeading && (
        <div style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#333',
          textAlign: 'left',
          marginTop: 0,  // Ensure no top margin
          marginBottom: '8px',
          paddingTop: 0,  // Ensure no top padding
          paddingLeft: '2px'
        }}>
          {format(monthStart, 'MMMM')}
        </div>
      )}

      {/* Weekday header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        marginBottom: '8px',
        paddingLeft: '2px'  // Match month heading alignment
      }}>
        {weekDays.map(day => (
          <div
            key={day}
            style={{
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "#6c757d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "24px"  // Reduced header height
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div 
        onMouseMove={handleGridMouseMove}
        onMouseLeave={handleGridMouseLeave}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridAutoRows: '36px',
          rowGap: '4px',
          paddingLeft: '2px'  // Match month heading alignment
        }}
      >
        {Object.values(weeks).flatMap(week =>
          week.map(date => (
            <DayCell
              key={date.toISOString()}
              date={date}
              selectedRange={selectedRange}
              isCurrentMonth={isSameMonth(date, baseDate)}
              onMouseDown={() => onSelectionStart(date)}
              onMouseEnter={() => {
                onSelectionMove(date);
                setHoveredDate(date);
              }}
              showTooltips={showTooltips}
              renderContent={renderDay}
              layer={layer}
              activeLayer={layer.name}
              restrictionConfig={restrictionConfig}
            />
          ))
        )}
        
        {[...Array(emptyWeeks * 7)].map((_, i) => (
          <div key={`empty-${i}`} style={{ backgroundColor: "white" }} />
        ))}
      </div>

      {/* Tooltip at grid level */}
      {hoveredDate && restrictionConfig?.restrictions && document.hasFocus() && (
        (() => {
          const result = restrictionManager.checkSelection(hoveredDate, hoveredDate);
          if (!result.allowed && result.message) {
            return (
              <div
                style={{
                  position: 'fixed',
                  left: mousePosition.x,
                  top: mousePosition.y,
                  backgroundColor: 'rgba(220, 53, 69, 0.9)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  pointerEvents: 'none',
                  zIndex: 1000,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  maxWidth: '250px',
                  whiteSpace: 'pre-line'
                }}
              >
                {result.message}
              </div>
            );
          }
          return null;
        })()
      )}
    </div>
  );
};

// Update the DayCell component to add debug logging and ensure hover events
const DayCell = ({
  date,
  selectedRange,
  isCurrentMonth,
  onMouseDown,
  onMouseEnter,
  showTooltips,
  renderContent,
  layer,
  activeLayer,
  restrictionConfig
}) => {
  const { isSelected, isInRange, isRangeStart, isRangeEnd } = useMemo(() => {
    if (!selectedRange.start) {
      return { isSelected: false, isInRange: false, isRangeStart: false, isRangeEnd: false };
    }

    const startDate = parseISO(selectedRange.start);
    const endDate = selectedRange.end ? parseISO(selectedRange.end) : null;

    const [chronologicalStart, chronologicalEnd] = endDate && startDate > endDate
      ? [endDate, startDate]
      : [startDate, endDate];

    return {
      isSelected: isSameDay(date, startDate) || (endDate && isSameDay(date, endDate)),
      isInRange: chronologicalEnd
        ? (date >= chronologicalStart && date <= chronologicalEnd)
        : false,
      isRangeStart: chronologicalEnd ? isSameDay(date, chronologicalStart) : false,
      isRangeEnd: chronologicalEnd ? isSameDay(date, chronologicalEnd) : false
    };
  }, [date, selectedRange.start, selectedRange.end]);

  const [isHovered, setIsHovered] = useState(false);
  
  const restrictionManager = useMemo(() => 
    new RestrictionManager(restrictionConfig ?? { restrictions: [] }), 
    [restrictionConfig]
  );

  const restrictionResult = useMemo(() => 
    restrictionManager.checkSelection(date, date),
    [date, restrictionManager]
  );

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const isSingleDay = useMemo(() => {
    if (!selectedRange.start) return false;
    if (!selectedRange.end) return true;
    return isSameDay(parseISO(selectedRange.start), parseISO(selectedRange.end));
  }, [selectedRange.start, selectedRange.end]);

  if (!isCurrentMonth) {
    return <div style={{ width: "100%", height: "100%", position: "relative", backgroundColor: "white" }} />;
  }

  const eventContent = renderContent?.(date);
  
  const getBackgroundColor = () => {
    if (layer.data?.background) {
      const renderer = LayerRenderer.createBackgroundRenderer(layer.data.background);
      const result = renderer(date);
      return result?.backgroundColor || 'transparent';
    }
    return 'transparent';
  };

  const dayCell = (
    <div
      className={!restrictionResult.allowed ? 'restricted-date-pattern' : ''}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={onMouseDown}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        cursor: !restrictionResult.allowed ? 'not-allowed' : 'pointer',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: (isSelected || isInRange) ? "#b1e4e5" : getBackgroundColor(),
        borderRadius: isSingleDay && (isSelected || isInRange) ? "50%" : (
          isRangeStart || isRangeEnd ? 
            `${isRangeStart ? "15px" : "0"} ${isRangeEnd ? "15px" : "0"} ${isRangeEnd ? "15px" : "0"} ${isRangeStart ? "15px" : "0"}`
            : "0"
        ),
        fontWeight: isSelected ? "600" : "normal",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        ...(isSingleDay && (isSelected || isInRange) ? {
          width: "36px",
          height: "36px",
          margin: "auto"
        } : {})
      }}
    >
      <div style={{ 
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <span style={{ 
          position: 'relative', 
          zIndex: 1,
          pointerEvents: 'none' 
        }}>
          {format(date, "d")}
        </span>
      </div>
      {eventContent?.element && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          {eventContent.element}
        </div>
      )}
    </div>
  );

  // Only show tooltips if showTooltips is true and we have tooltip content
  return (showTooltips && eventContent?.tooltipContent) ? (
    <Tooltip 
      content={eventContent?.tooltipContent}
      show={isHovered}
    >
      {dayCell}
    </Tooltip>
  ) : dayCell;
};

const MonthPair = ({
  firstMonth,
  secondMonth,
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting,
  visibleMonths,
  showMonthHeadings,
  showTooltips,
  renderDay,
  layer,
  restrictionConfig,
  startWeekOnSunday
}) => {
  // Add explicit type for monthsToShow
  const monthsToShow: Date[] = [];
  for (let i = 0; i < visibleMonths && i < 6; i++) {
    monthsToShow.push(addMonths(firstMonth, i));
  }

  return (
    <div style={{ 
      display: 'flex', 
      width: '100%',
      gap: '1rem'
    }}>
      {monthsToShow.map((month, index) => (
        <MonthGrid
          key={month.toISOString()}
          baseDate={month}
          selectedRange={selectedRange}
          onSelectionStart={onSelectionStart}
          onSelectionMove={onSelectionMove}
          isSelecting={isSelecting}
          style={{ width: `${100 / visibleMonths}%` }}
          showMonthHeading={showMonthHeadings}
          showTooltips={showTooltips}
          renderDay={renderDay}
          layer={layer}
          activeLayer={layer.name}
          restrictionConfig={restrictionConfig}
          startWeekOnSunday={startWeekOnSunday}
        />
      ))}
    </div>
  );
};

const SideChevronIndicator: React.FC<SideChevronIndicatorProps> = ({ outOfBoundsDirection, isSelecting }) => {
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

const LayerControl = ({ layers, activeLayer, onLayerChange }) => {
  return (
    <div className="cla-layer-control" style={{
    }}>
      {layers
        .filter(layer => layer.visible !== false)
        .map(layer => (
          <button
            key={layer.name}
            onClick={() => onLayerChange(layer.name)}
            className={`cla-layer-button ${activeLayer === layer.name ? 'active' : ''}`}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              backgroundColor: activeLayer === layer.name ? '#e7f3ff' : '#fff',
              color: activeLayer === layer.name ? '#0366d6' : '#666',
              cursor: 'pointer'
            }}
          >
            {layer.title}
          </button>
        ))}
    </div>
  );
};

const CalendarGrid: React.FC<CalendarGridProps> = ({
  months,
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting,
  visibleMonths,
  showMonthHeadings,
  showTooltips,
  layer,
  activeLayer,
  restrictionConfig,
  startWeekOnSunday
}) => {
  const renderers: Renderer[] = [];
  
  if (layer.data?.background) {
    renderers.push(LayerRenderer.createBackgroundRenderer(layer.data.background));
  }
  
  if (layer.data?.events) {
    renderers.push(LayerRenderer.createEventRenderer(
      layer.data.events.map(event => ({
        ...event,
        type: event.type as 'work' | 'other'
      }))
    ));
  }
  
  const renderDay = (date: Date): RenderResult | null => {
    const results = renderers
      .map(renderer => renderer(date))
      .filter((result): result is RenderResult => result !== null);
      
    if (results.length === 0) return null;
    
    return results.reduce((combined, result) => ({
      backgroundColor: result.backgroundColor || combined.backgroundColor,
      element: result.element ? (
        <div style={{ position: 'relative' }}>
          {combined.element}
          {result.element}
        </div>
      ) : combined.element,
      tooltipContent: result.tooltipContent ? (
        <div>
          {combined.tooltipContent}
          {result.tooltipContent}
        </div>
      ) : combined.tooltipContent
    }));
  };
  
  return (
    <MonthPair
      firstMonth={months[0]}
      secondMonth={visibleMonths === 1 ? null : months[1]}
      selectedRange={selectedRange}
      onSelectionStart={onSelectionStart}
      onSelectionMove={onSelectionMove}
      isSelecting={isSelecting}
      visibleMonths={visibleMonths}
      showMonthHeadings={showMonthHeadings}
      showTooltips={showTooltips}
      renderDay={renderDay}
      layer={layer}
      restrictionConfig={restrictionConfig}
      startWeekOnSunday={startWeekOnSunday}
    />
  );
};

// Add interface for restriction background data
interface RestrictionBackgroundData {
  startDate: string;
  endDate: string;
  color: string;
}

const CLACalendar: React.FC<CalendarSettings> = ({
  displayMode = 'popup',
  containerStyle = null,
  isOpen: initialIsOpen = false,
  visibleMonths = 2,
  showMonthHeadings = false,
  selectionMode = 'range',
  showTooltips = true,
  showHeader = true,
  closeOnClickAway = true,
  showSubmitButton = false,
  showFooter = true,
  singleMonthWidth = 500,
  enableOutOfBoundsScroll = true,
  suppressTooltipsOnSelection = false,
  showSelectionAlert = false,
  layers = DEFAULT_LAYERS,
  showLayersNavigation = true,
  defaultLayer = 'calendar',
  restrictionConfig,
  startWeekOnSunday = false
}) => {
  const [isOpen, setIsOpen] = useState(displayMode === 'embedded' || initialIsOpen);
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null });
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date(2025, 1, 1)));
  const [isSelecting, setIsSelecting] = useState(false);
  const [outOfBoundsDirection, setOutOfBoundsDirection] = useState<'prev' | 'next' | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dateInputContext, setDateInputContext] = useState({
    startDate: null,
    endDate: null,
    currentField: null
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, ValidationError>>({});
  
  // Create layerManager before using it
  const layerManager = useMemo(() => 
    new LayerManager(layers),
    [layers]
  );
  
  // Now we can use layerManager
  const [activeLayers, setActiveLayers] = useState<Layer[]>(
    layerManager.getLayers()
  );
  
  const [activeLayer, setActiveLayer] = useState(defaultLayer);
  const [notification, setNotification] = useState<string | null>(null);
  
  const selectionManager = useMemo(() => 
    new DateRangeSelectionManager(
      restrictionConfig,
      selectionMode,
      showSelectionAlert
    ), 
    [restrictionConfig, selectionMode, showSelectionAlert]
  );
  
  const restrictionBackgroundData = useMemo(() => 
    RestrictionBackgroundGenerator.generateBackgroundData(restrictionConfig),
    [restrictionConfig]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const moveToMonthRef = useRef<((direction: 'prev' | 'next') => void) | null>(null);
  const debouncedMoveToMonthRef = useRef<ReturnType<typeof debounce> | null>(null);

  // Calculate if tooltips should be shown based on selection state and settings
  const shouldShowTooltips = useMemo(() => {
    if (!showTooltips) return false;
    if (suppressTooltipsOnSelection && isSelecting) return false;
    return true;
  }, [showTooltips, suppressTooltipsOnSelection, isSelecting]);

  // Add this effect to update activeLayers when initialLayers changes
  useEffect(() => {
    setActiveLayers(layerManager.getLayers());
    // Ensure we have a valid active layer
    if (!activeLayer || !layers.find(l => l.name === activeLayer)) {
      const defaultLayerExists = layers.find(l => l.name === defaultLayer);
      const firstLayer = layers[0];
      setActiveLayer(defaultLayerExists ? defaultLayer : firstLayer?.name);
    }
  }, [layers, defaultLayer, activeLayer]);

  // In the months memo, update the result array type
  const months = useMemo(() => {
    const validVisibleMonths = Math.min(6, Math.max(1, visibleMonths));
    const result: Date[] = [];
    for (let i = 0; i < validVisibleMonths; i++) {
      result.push(addMonths(currentMonth, i));
    }
    return result;
  }, [currentMonth, visibleMonths]);

  // Keep debounced month change for out-of-bounds scrolling
  useEffect(() => {
    debouncedMoveToMonthRef.current = debounce((direction) => {
      if (moveToMonthRef.current) {
        moveToMonthRef.current(direction);
      }
    }, 1000, { leading: true, trailing: false });

    return () => {
      if (debouncedMoveToMonthRef.current) {
        debouncedMoveToMonthRef.current.cancel();
      }
    };
  }, []);

  // Add back the continuous month advancement effect with enableOutOfBoundsScroll check
  useEffect(() => {
    if (!enableOutOfBoundsScroll) return () => {};

    const shouldAdvance = Boolean(isSelecting && outOfBoundsDirection && moveToMonthRef.current);
    if (!shouldAdvance) return () => {};

    const advanceMonth = () => {
      if (moveToMonthRef.current && outOfBoundsDirection) {
        moveToMonthRef.current(outOfBoundsDirection);
      }
    };

    // Initial delay then continuous advancement every second
    const initialAdvance = setTimeout(advanceMonth, 1000);
    const continuousAdvance = setInterval(advanceMonth, 1000);

    return () => {
      clearTimeout(initialAdvance);
      clearInterval(continuousAdvance);
    };
  }, [isSelecting, outOfBoundsDirection, enableOutOfBoundsScroll]);

  // Use the abstracted handlers
  const { handleMouseMove, handleMouseLeave } = useMemo(() => 
    DateRangePickerHandlers.createMouseHandlers(
      containerRef,
      isSelecting,
      setOutOfBoundsDirection,
      setMousePosition
    ),
    [containerRef, isSelecting, setOutOfBoundsDirection, setMousePosition]
  );
  
  const { handleDocumentMouseMove, handleMouseUp, handleMouseDown } = useMemo(() => 
    DateRangePickerHandlers.createDocumentMouseHandlers(
      containerRef,
      isSelecting,
      outOfBoundsDirection,
      setOutOfBoundsDirection,
      setMousePosition,
      moveToMonthRef,
      setIsSelecting
    ),
    [containerRef, isSelecting, outOfBoundsDirection, setOutOfBoundsDirection, setMousePosition, moveToMonthRef, setIsSelecting]
  );
  
  const handleDateChange = useMemo(() => 
    DateRangePickerHandlers.createDateChangeHandler(
      selectedRange,
      dateInputContext,
      setSelectedRange,
      setDateInputContext,
      setValidationErrors,
      setCurrentMonth,
      visibleMonths,
      dateValidator
    ),
    [selectedRange, dateInputContext, setSelectedRange, setDateInputContext, setValidationErrors, setCurrentMonth, visibleMonths, dateValidator]
  );
  
  const getDisplayText = useMemo(() => 
    DateRangePickerHandlers.createDisplayTextFormatter(
      selectedRange,
      selectionMode
    ),
    [selectedRange, selectionMode]
  );

  // Use the abstracted selection handlers with all required parameters
  const { handleSelectionStart, handleSelectionMove } = useMemo(() => 
    DateRangePickerHandlers.createSelectionHandlers(
      selectionManager,
      isSelecting,
      setIsSelecting,
      setSelectedRange,
      setNotification,
      showSelectionAlert,
      selectedRange,
      outOfBoundsDirection
    ),
    [selectionManager, isSelecting, setIsSelecting, setSelectedRange, setNotification, showSelectionAlert, selectedRange, outOfBoundsDirection]
  );

  // Use the abstracted calendar action handlers
  const { handleClear, handleSubmit, handleLayerChange } = useMemo(() => 
    DateRangePickerHandlers.createCalendarActionHandlers(
      setSelectedRange,
      setDateInputContext,
      setIsSelecting,
      setValidationErrors,
      setCurrentMonth,
      setIsOpen,
      setActiveLayer
    ),
    [setSelectedRange, setDateInputContext, setIsSelecting, setValidationErrors, setCurrentMonth, setIsOpen, setActiveLayer]
  );

  const renderLayer = (layer: Layer) => {
    return (
      <CalendarGrid
        months={months}
        selectedRange={selectedRange}
        onSelectionStart={handleSelectionStart}
        onSelectionMove={handleSelectionMove}
        isSelecting={isSelecting}
        visibleMonths={visibleMonths}
        showMonthHeadings={showMonthHeadings}
        showTooltips={shouldShowTooltips}
        layer={layer}
        activeLayer={activeLayer}
        restrictionConfig={restrictionConfig}
        startWeekOnSunday={startWeekOnSunday}
      />
    );
  };

  // Update layers with restriction background
  useEffect(() => {
    const updatedLayers = [...layerManager.getLayers()];
    const calendarLayer = updatedLayers.find(layer => layer.name === 'Calendar');
    
    if (calendarLayer) {
      layerManager.setBackgroundData('Calendar', restrictionBackgroundData);
      setActiveLayers(layerManager.getLayers());
    }
  }, [restrictionBackgroundData, layerManager]);

  // Update isDateRestricted to handle both types
  const isDateRestricted = useCallback((date: Date): boolean => {
    const result = selectionManager.canSelectDate(date);
    return !result.allowed;
  }, [selectionManager]);

  // Update the moveToMonth function to only show notifications during out-of-bounds scrolling
  const moveToMonth = useCallback((direction: 'prev' | 'next') => {
    // First move the month - this happens regardless of selection state
    setCurrentMonth(prev => {
      return direction === 'next'
        ? addMonths(prev, 1)
        : addMonths(prev, -1);
    });

    // Then handle selection logic only if we're in an out-of-bounds selection
    if (isSelecting && outOfBoundsDirection) {
      const start = selectedRange.start ? parseISO(selectedRange.start) : null;
      if (!start) return;

      // Calculate the month we just moved to
      const nextMonth = direction === 'next' 
        ? addMonths(months[months.length - 1], 1)
        : addMonths(months[0], -1);
        
      const firstDayOfMonth = startOfMonth(nextMonth);
      const lastDayOfMonth = endOfMonth(nextMonth);

      // Determine the potential new end of the selection
      const potentialEnd = direction === 'next' ? lastDayOfMonth : firstDayOfMonth;
      
      // Check if the entire selection range would cross any restrictions
      // We need to check from the earliest date to the latest date
      const earliestDate = start < potentialEnd ? start : potentialEnd;
      const latestDate = start < potentialEnd ? potentialEnd : start;
      
      // Get all days in the potential selection range
      const allDaysInRange = eachDayOfInterval({
        start: earliestDate,
        end: latestDate
      });
      
      // Find the first restricted day in the entire range, if any
      const firstRestrictedDay = allDaysInRange.find(day => 
        !selectionManager.canSelectDate(day).allowed
      );
      
      if (firstRestrictedDay) {
        // If there's a restriction in the range, we need to stop the selection
        // at the day before the restriction
        
        // Calculate the valid end date based on the direction of selection
        const validEndDate = start < firstRestrictedDay 
          ? addDays(firstRestrictedDay, -1)  // Forward selection: day before restriction
          : addDays(firstRestrictedDay, 1);  // Backward selection: day after restriction
        
        // Ensure the valid end date is between start and potential end
        const finalEndDate = start < potentialEnd
          ? Math.min(validEndDate.getTime(), potentialEnd.getTime())
          : Math.max(validEndDate.getTime(), potentialEnd.getTime());
        
        // Update the selection to the valid range
        setSelectedRange((prev: DateRange) => ({
          ...prev,
          end: format(new Date(finalEndDate), 'yyyy-MM-dd')
        }));
        
        // End the selection and show message
        setIsSelecting(false);
        setOutOfBoundsDirection(null);
        
        // Only show notification during out-of-bounds scrolling
        if (showSelectionAlert && outOfBoundsDirection) {
          // Get the specific restriction message
          const restrictionResult = selectionManager.canSelectDate(firstRestrictedDay);
          const message = restrictionResult.message || 
            `Selection cannot include restricted date: ${format(firstRestrictedDay, 'MMM dd, yyyy')}`;
          
          setNotification(message);
        }
        
        document.removeEventListener("mousemove", handleDocumentMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      } else {
        // No restrictions in the range, extend selection to include the new month
        setSelectedRange((prev: DateRange) => ({
          ...prev,
          end: format(potentialEnd, 'yyyy-MM-dd')
        }));
      }
    }
  }, [months, selectionManager, showSelectionAlert, isSelecting, outOfBoundsDirection, selectedRange.start, handleDocumentMouseMove, handleMouseUp]);

  // After the existing moveToMonth function is defined (around line 1480), add:
  useEffect(() => {
    // Set the ref to the current moveToMonth function
    moveToMonthRef.current = moveToMonth;
  }, [moveToMonth]);

  // Add this effect to handle clicks outside the calendar
  useEffect(() => {
    if (!closeOnClickAway || displayMode === 'embedded' || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, displayMode, isOpen]);

  return (
    <div className="cla-calendar" style={{ width: 'fit-content' }}>
      {displayMode === 'popup' && (
        <input
          type="text"
          value={getDisplayText()}
          onClick={() => setIsOpen(true)}
          className="cla-form-control"
          readOnly
          style={{
            width: '300px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        />
      )}

      <CalendarContainer
        isOpen={isOpen}
        displayMode={displayMode}
        containerRef={containerRef}
        containerStyle={containerStyle}
        visibleMonths={visibleMonths}
        singleMonthWidth={singleMonthWidth}
        enableOutOfBoundsScroll={enableOutOfBoundsScroll}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseLeave={handleMouseLeave}
      >
        {showHeader && (
          <>
            <DateInputSection
              selectedRange={selectedRange}
              handleDateChange={handleDateChange}
              dateInputContext={dateInputContext}
              selectionMode={selectionMode}
            />

            <CalendarHeader
              months={months}
              visibleMonths={visibleMonths}
              moveToMonth={moveToMonth}
            />
          </>
        )}

        {showLayersNavigation && (
          <LayerControl
            layers={activeLayers}
            activeLayer={activeLayer}
            onLayerChange={handleLayerChange}
          />
        )}

        <div className="cla-card-body" style={{ padding: '16px' }}>
          <div style={{ display: 'flex' }}>
            {activeLayers.map(layer => 
              layer.name === activeLayer && (
                <div key={layer.name} style={{ width: '100%' }}>
                  {renderLayer(layer)}
                </div>
              )
            )}
          </div>
        </div>

        {showFooter && (
          <CalendarFooter
            showSubmitButton={showSubmitButton}
            handleClear={handleClear}
            handleSubmit={handleSubmit}
          />
        )}

        {enableOutOfBoundsScroll && (
          <SideChevronIndicator
            outOfBoundsDirection={outOfBoundsDirection}
            isSelecting={isSelecting}
          />
        )}

        {showSelectionAlert && notification && (
          <Notification
            message={notification}
            onDismiss={() => setNotification(null)}
          />
        )}
      </CalendarContainer>
    </div>
  );
};

export default CLACalendar;