/**
 * @fileoverview Main CLACalendar component - A flexible React date range picker
 * 
 * This is the primary component that provides date range selection functionality
 * with support for:
 * - Single date and date range selection modes
 * - Embedded and popup display modes
 * - External input element binding
 * - Customizable restrictions and validation
 * - Data layers for events and background highlights
 * - UTC-first date handling for timezone consistency
 * - Keyboard navigation and accessibility features
 * - Responsive design with configurable month display
 * 
 * The component uses a modular architecture with separate managers for:
 * - Date selection (DateRangeSelectionManager)
 * - Restrictions (RestrictionManager)
 * - Layers (LayerManager)
 * - Event handling (CLACalendarHandlers)
 * 
 * @module CLACalendar
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import debounce from "lodash-es/debounce";
import { parse, isValid, eachDayOfInterval } from "date-fns"; // Remove unused imports
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  addMonthsUTC,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "../utils/DateUtils";
import { CalendarErrorBoundary } from "./ErrorBoundary";

import "./CLACalendar.css";
import "./CLACalendarComponents/CalendarComponents.css";

import { DateRangeSelectionManager, DateRange } from "./CLACalendarComponents/selection/DateRangeSelectionManager";
import { CLACalendarHandlers } from "./CLACalendarComponents/handlers/CLACalendarHandlers";
import { RestrictionBackgroundGenerator } from "./CLACalendarComponents/restrictions/RestrictionBackgroundGenerator";
import { LayerManager } from "./CLACalendarComponents/layers/LayerManager";
import { CalendarPortal } from "./CLACalendarComponents/CalendarPortal";
import {
  CalendarSettings,
  Layer,
  DEFAULT_COLORS,
  DEFAULT_CONTAINER_STYLES,
  createCalendarSettings,
  getActiveLayers,
  findLayerByName
} from "./CLACalendar.config";
import { LayerRenderer } from './CLACalendarComponents/layers/LayerRenderer';
import { RestrictionManager } from './CLACalendarComponents/restrictions/RestrictionManager';
import { Notification } from './CLACalendarComponents/Notification';
import {
  CalendarHeader,
  DateInputSection,
  CalendarFooter,
  CalendarContainer,
  SideChevronIndicator,
  Tooltip,
  MonthGridProps,
  CalendarGridProps,
  ValidationError as CalendarValidationError,
} from './CLACalendarComponents/CalendarComponents';
// Comment out unused imports
// import { CalendarPortal } from './DateRangePickerNew/CalendarPortal';
import { registerCalendar } from './CLACalendarComponents/CalendarCoordinator';
import './CLACalendarComponents/CalendarPortal.css';
import { RestrictionConfig, RestrictedBoundaryRestriction } from './CLACalendarComponents/restrictions/types';

// Import new extracted components
import { DayCell } from './CLACalendar/components/DayCell';
import { MonthGrid } from './CLACalendar/components/MonthGrid';
import { CalendarGrid } from './CLACalendar/components/CalendarGrid';
import { LayerControl } from './CLACalendar/components/LayerControl';
import { getFontSize, isSameMonth } from './CLACalendar/utils/calendar.utils';
import type { RenderResult, Renderer, CLACalendarProps } from './CLACalendar/CLACalendar.types';


// Generate a unique ID for each calendar instance
let calendarCounter = 0;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const _Input: React.FC<InputProps> = ({ className, ...props }) => (
  <input
    className={`cla-input ${className || ''}`}
    {...props}
  />
);


// Renamed this to a regular function since it's not a hook
const _handleClickOutsideListener = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent) => void
) => {
  const setupListener = () => {
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
  };

  return setupListener;
};

const dateValidator = (() => {
  const DATE_FORMAT = "MMMM d, yyyy";

  const parseDotNotation = (input) => {
    // Quick test for dot notation attempt
    if (!/\d\./.test(input)) {
      return null;
    }

    // Parse the components
    const match = input.match(/(\d?\d)\.(\d?\d)\.(\d?\d?\d\d)/);

    if (!match) {
      return null;
    }

    const [_, month, day, year] = match;

    const fullYear = year.length === 2 ? `20${year}` : year;

    // Create and validate date
    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));

    const isValid = date.getMonth() === parseInt(month) - 1;

    return isValid ? date : null;
  };

  return {
    validate: (value, _context) => {
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
    formatValue: (date) => !date ? '' : format(date, DATE_FORMAT, 'UTC'),
    parseValue: (value) => {
      if (!value) return null;
      return /\d\./.test(value) ? parseDotNotation(value) : parse(value, DATE_FORMAT, new Date());
    },
    DATE_FORMAT
  };
})();

// Use the imported ValidationError type instead of defining our own
// interface ValidationError {
//   message: string;
//   type: string;
//   field: string;
// }







// Add this outside the component to cache measurements
const measurementCache = {
  height: null as number | null,
  measuring: false,
  measurementPromise: null as Promise<number> | null,
  listeners: new Set<(height: number) => void>(),

  async measure(calendarElement: HTMLElement): Promise<number> {
    if (this.height !== null) return this.height;

    if (this.measurementPromise) {
      return this.measurementPromise;
    }

    this.measuring = true;
    this.measurementPromise = new Promise<number>((resolve) => {
      requestAnimationFrame(() => {
        const height = calendarElement.offsetHeight;
        this.height = height;
        this.measuring = false;
        this.measurementPromise = null;
        this.listeners.forEach(listener => listener(height));
        resolve(height);
      });
    });

    return this.measurementPromise;
  },

  addListener(callback: (height: number) => void) {
    this.listeners.add(callback);
  },

  removeListener(callback: (height: number) => void) {
    this.listeners.delete(callback);
  },

  reset() {
    this.height = null;
    this.measuring = false;
    this.measurementPromise = null;
    this.listeners.clear();
  }
};

// This interface is now defined in CLACalendar.types.ts


export const CLACalendar: React.FC<CLACalendarProps> = ({
  settings: userSettings = {},
  _onSettingsChange = () => {},
  onMonthChange
}) => {
  // Create safe, complete settings with null handling
  const settings = useMemo(() => createCalendarSettings(userSettings), [userSettings]);
  const _colors = settings.colors || DEFAULT_COLORS;

  // Track whether calendar has ever been initialized (opened)
  const [everInitialized, setEverInitialized] = useState(settings.displayMode === 'embedded' || settings.isOpen);

  // Track if lazy data has been loaded
  const [lazyDataLoaded, setLazyDataLoaded] = useState(false);

  // Store lazy-loaded data
  const [lazyLayers, setLazyLayers] = useState<Layer[] | null>(null);
  const [lazyRestrictionConfig, setLazyRestrictionConfig] = useState<RestrictionConfig | null>(null);

  // Basic state needed for input field display
  const [isOpen, setIsOpen] = useState(settings.displayMode === 'embedded' || settings.isOpen);
  const [selectedRange, setSelectedRange] = useState<DateRange>(() => {
    if (settings.defaultRange) {
      return {
        start: settings.defaultRange.start,
        end: settings.defaultRange.end,
        anchorDate: settings.defaultRange.start
      };
    }
    return { start: null, end: null, anchorDate: null };
  });
  const [displayRange, setDisplayRange] = useState<DateRange>(() => {
    if (settings.defaultRange) {
      return {
        start: settings.defaultRange.start,
        end: settings.defaultRange.end,
        anchorDate: settings.defaultRange.start
      };
    }
    return { start: null, end: null, anchorDate: null };
  });

  // Reference handlers
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarIdRef = useRef<string>(`calendar-${++calendarCounter}`);
  const coordinatorRef = useRef<ReturnType<typeof registerCalendar> | null>(null);
  const [externalInputRef, setExternalInputRef] = useState<HTMLInputElement | null>(null);

  // These states will only be initialized when calendar is first opened
  const [currentMonth, setCurrentMonth] = useState<Date | null>(() => {
    // If defaultRange is provided, use its start date directly
    const defaultRange = settings.defaultRange;
    if (defaultRange?.start) {
      try {
        const date = new Date(defaultRange.start);
        return isValid(date) ? date : (everInitialized ? new Date() : null);
      } catch {
        return everInitialized ? new Date() : null;
      }
    }
    // Otherwise use current date if we need to initialize now
    return everInitialized ? new Date() : null;
  });
  const [outOfBoundsDirection, setOutOfBoundsDirection] = useState<'prev' | 'next' | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [_validationErrors, setValidationErrors] = useState<Record<string, CalendarValidationError>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [dateInputContext, setDateInputContext] = useState(() => {
    const defaultRange = settings.defaultRange;
    if (defaultRange?.start && defaultRange?.end) {
      const formatDateString = (dateString: string) => {
        try {
          const date = parseISO(dateString);
          return settings.dateFormatter
            ? settings.dateFormatter(date)
            : format(date, "MMM dd, yyyy", 'UTC');
        } catch (e) {
          return null;
        }
      };

      return {
        startDate: formatDateString(defaultRange.start),
        endDate: formatDateString(defaultRange.end),
        currentField: null
      };
    }
    return {
      startDate: null,
      endDate: null,
      currentField: null
    };
  });

  // Store mouse position in a ref to avoid re-renders
  const mousePositionRef = useRef({ x: 0, y: 0 });


  // Load lazy data when calendar is first opened
  useEffect(() => {
    if (everInitialized && !lazyDataLoaded) {
      // Load lazy layers if factory provided
      if (settings.layersFactory) {
        const layers = settings.layersFactory();
        setLazyLayers(layers);

        // Initialize the LayerManager immediately with the layers
        const tempLayerManager = new LayerManager(layers);
        setActiveLayers(tempLayerManager.getLayers());
      }

      // Load lazy restriction config if factory provided
      if (settings.restrictionConfigFactory) {
        const config = settings.restrictionConfigFactory();
        setLazyRestrictionConfig(config);
      }

      setLazyDataLoaded(true);
    }
  }, [everInitialized, lazyDataLoaded, settings.layersFactory, settings.restrictionConfigFactory]);

  // Get the effective layers to use - either from lazy loading or direct settings
  const effectiveLayers = useMemo(() => {
    let layers: Layer[] = [];
    
    if (settings.layersFactory && lazyLayers) {
      layers = Array.isArray(lazyLayers) ? lazyLayers : [];
    } else {
      layers = Array.isArray(settings.layers) ? settings.layers : [];
    }
    
    // Filter out null/undefined values and validate required properties
    const validLayers = layers.filter((layer): layer is Layer => {
      return layer != null && 
             typeof layer === 'object' && 
             typeof layer.name === 'string' && 
             layer.name.length > 0 &&
             typeof layer.title === 'string' &&
             typeof layer.description === 'string';
    });
    
    // If no valid layers, provide a default one
    if (validLayers.length === 0) {
      return [{
        name: 'Calendar',
        title: 'Base Calendar',
        description: 'Default calendar layer',
        required: true,
        visible: true,
        data: {
          events: [],
          background: []
        }
      }];
    }
    
    return validLayers;
  }, [settings.layers, lazyLayers, settings.layersFactory]);

  // Get the effective restriction config to use - either from lazy loading or direct settings
  const effectiveRestrictionConfig = useMemo(() => {
    if (settings.restrictionConfigFactory && lazyRestrictionConfig) {
      return lazyRestrictionConfig;
    }
    return settings.restrictionConfig || null;
  }, [settings.restrictionConfig, lazyRestrictionConfig, settings.restrictionConfigFactory]);

  // These expensive operations only happen when the calendar is first opened

  // Create LayerManager only when calendar is first opened and layers are available
  const layerManager = useMemo(() => {
    if (!everInitialized) return null;

    // Only create manager when we have layers (either direct or lazy-loaded)
    if (settings.layersFactory && !lazyLayers) return null;

    return new LayerManager(effectiveLayers);
  }, [everInitialized, effectiveLayers, settings.layersFactory, lazyLayers]);

  // Initialize the selection manager only when first opened and restriction config is available
  const selectionManager = useMemo(() => {
    if (!everInitialized) return null;

    // Only create manager when we have restriction config (either direct or lazy-loaded)
    if (settings.restrictionConfigFactory && !lazyRestrictionConfig) return null;

    return new DateRangeSelectionManager(
      effectiveRestrictionConfig,
      settings.selectionMode,
      settings.showSelectionAlert
    );
  }, [everInitialized, effectiveRestrictionConfig, settings.selectionMode, settings.showSelectionAlert, settings.restrictionConfigFactory, lazyRestrictionConfig]);

  // Generate restriction background data only when first opened and restriction config is available
  const _restrictionBackgroundData = useMemo(() => {
    if (!everInitialized) return null;

    // Only generate data when we have restriction config (either direct or lazy-loaded)
    if (settings.restrictionConfigFactory && !lazyRestrictionConfig) return null;

    return RestrictionBackgroundGenerator.generateBackgroundData(effectiveRestrictionConfig);
  }, [everInitialized, effectiveRestrictionConfig, settings.restrictionConfigFactory, lazyRestrictionConfig]);

  // Use initialActiveLayer from settings if provided, otherwise use settings.defaultLayer
  const [activeLayer, setActiveLayer] = useState(
    settings.initialActiveLayer || settings.defaultLayer
  );

  // Initialize activeLayers only when first opened
  const [activeLayers, setActiveLayers] = useState<Layer[]>([]);

  // Effect to handle external input setup
  useEffect(() => {
    let element: HTMLInputElement | null = null;

    // Try to get external input from ref or direct element
    if (settings.externalInput) {
      if ('current' in settings.externalInput) {
        // It's a React ref
        element = settings.externalInput.current;
      } else {
        // It's a direct HTMLInputElement
        element = settings.externalInput;
      }
    } 
    // Try to get external input from selector
    else if (settings.externalInputSelector) {
      element = document.querySelector(settings.externalInputSelector) as HTMLInputElement;
    }

    setExternalInputRef(element);
  }, [settings.externalInput, settings.externalInputSelector]);

  // Effect to bind events to external input
  useEffect(() => {
    if (!externalInputRef || settings.bindExternalInputEvents === false) return;

    const handleClick = () => {
      if (!isOpen && settings.displayMode === 'popup') {
        setIsOpen(true);
        
        // Ensure the calendar is initialized when first opened
        if (!everInitialized) {
          setEverInitialized(true);

          // If settings has a defaultRange, use it; otherwise use current date
          if (settings.defaultRange) {
            setCurrentMonth(new Date(settings.defaultRange.start));
          } else {
            setCurrentMonth(new Date());
          }

          // Load lazy data if needed
          if (!lazyDataLoaded) {
            setLazyDataLoaded(true);
            
            if (settings.restrictionConfigFactory) {
              const config = settings.restrictionConfigFactory();
              setLazyRestrictionConfig(config);
            }
            
            if (settings.layersFactory) {
              const layers = settings.layersFactory();
              setLazyLayers(layers);

              // Initialize activeLayers right away
              const tempLayerManager = new LayerManager(layers);
              setActiveLayers(tempLayerManager.getLayers());

              // Make sure we have a valid activeLayer
              if (layers.length > 0) {
                const validLayer = layers.find(l => l.name === activeLayer) || layers[0];
                setActiveLayer(validLayer.name);
              }
            }
          }

          // Force the coordinator to register this calendar as active
          if (coordinatorRef.current) {
            coordinatorRef.current.open();
          }
        }
      }
    };

    externalInputRef.addEventListener('click', handleClick);
    externalInputRef.addEventListener('focus', handleClick);

    return () => {
      externalInputRef.removeEventListener('click', handleClick);
      externalInputRef.removeEventListener('focus', handleClick);
    };
  }, [externalInputRef, settings.bindExternalInputEvents, settings.displayMode, isOpen, everInitialized, settings.defaultRange, lazyDataLoaded, settings.restrictionConfigFactory, settings.layersFactory, activeLayer]);

  // Effect to update external input value when display range changes
  useEffect(() => {
    if (externalInputRef && settings.updateExternalInput !== false) {
      const displayText = CLACalendarHandlers.createDisplayTextFormatter(
        displayRange,
        settings.selectionMode,
        settings.dateFormatter,
        settings.dateRangeSeparator
      )();
      
      externalInputRef.value = displayText;
      
      // Dispatch input event for form libraries that listen to it
      const event = new Event('input', { bubbles: true });
      externalInputRef.dispatchEvent(event);
    }
  }, [displayRange, externalInputRef, settings.updateExternalInput, settings.selectionMode, settings.dateFormatter, settings.dateRangeSeparator]);

  // Update active layers when layerManager and initialization state changes
  useEffect(() => {
    if (layerManager && everInitialized) {
      setActiveLayers(layerManager.getLayers());
    }
  }, [layerManager, everInitialized]);

  // Update layers with restriction background - only when initialized
  useEffect(() => {
    if (!layerManager || !everInitialized) return;

    const updatedLayers = [...layerManager.getLayers()];
    const calendarLayer = updatedLayers.find(layer => layer.name === 'Calendar');

    if (calendarLayer) {
      const backgrounds = RestrictionBackgroundGenerator.generateBackgroundData(effectiveRestrictionConfig);
      layerManager.setBackgroundData('Calendar', backgrounds);
      setActiveLayers(layerManager.getLayers());
    }
  }, [everInitialized, effectiveRestrictionConfig, layerManager]);

  // Helpers and refs for month navigation
  const moveToMonthRef = useRef<((direction: 'prev' | 'next') => void) | null>(null);
  const debouncedMoveToMonthRef = useRef<ReturnType<typeof debounce> | null>(null);

  // Update moveToMonth function
  useEffect(() => {
    if (!everInitialized) return;

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
  }, [everInitialized]);

  // Only calculate months when initialized
  const months = useMemo(() => {
    if (!everInitialized || !currentMonth) return [];

    const validVisibleMonths = Math.min(6, Math.max(1, settings.visibleMonths));
    const result: Date[] = [];
    for (let i = 0; i < validVisibleMonths; i++) {
      result.push(addMonthsUTC(currentMonth, i));
    }
    
    
    return result;
  }, [currentMonth, settings.visibleMonths, everInitialized]);

  // Call onMonthChange callback when months change
  useEffect(() => {
    if (onMonthChange && months.length > 0) {
      onMonthChange(months);
    }
  }, [months, onMonthChange]);


  // Initialize during first open
  useEffect(() => {
    if (isOpen && !everInitialized) {
      setEverInitialized(true);
      // Initialize currentMonth when first opened
      setCurrentMonth(settings.defaultRange
        ? new Date(settings.defaultRange.start)
        : new Date());

      // If defaultRange is provided, make sure it's properly loaded
      if (settings.defaultRange) {
        const { start, end } = settings.defaultRange;

        // Set selected range and display range
        setSelectedRange({
          start,
          end,
          anchorDate: start
        });

        setDisplayRange({
          start,
          end,
          anchorDate: start
        });

        // Format dates for input context
        const formatDateString = (dateString: string) => {
          try {
            const date = parseISO(dateString);
            return settings.dateFormatter
              ? settings.dateFormatter(date)
              : format(date, "MMM dd, yyyy", 'UTC');
          } catch (e) {
            return null;
          }
        };

        // Update date input context
        setDateInputContext({
          startDate: formatDateString(start),
          endDate: formatDateString(end),
          currentField: null
        });
      }
    }
  }, [isOpen, everInitialized, settings.defaultRange, settings.dateFormatter]);

  // Add a useEffect to update activeLayer when initialActiveLayer changes
  useEffect(() => {
    if (settings.initialActiveLayer) {
      setActiveLayer(settings.initialActiveLayer);
    }
  }, [settings.initialActiveLayer]);

  // Effect for continuous month advancement - only when initialized
  useEffect(() => {
    if (!everInitialized || !settings.enableOutOfBoundsScroll) return () => { };

    const shouldAdvance = Boolean(isSelecting && outOfBoundsDirection && moveToMonthRef.current);
    if (!shouldAdvance) return () => { };

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
  }, [everInitialized, isSelecting, outOfBoundsDirection, settings.enableOutOfBoundsScroll]);

  // Only create mouse handlers when initialized
  const { handleMouseMove, handleMouseLeave } = useMemo(() => {
    if (!everInitialized) {
      return {
        handleMouseMove: () => { },
        handleMouseLeave: () => { }
      };
    }

    return CLACalendarHandlers.createMouseHandlers(
      containerRef,
      isSelecting,
      setOutOfBoundsDirection,
      (position) => {
        mousePositionRef.current = position;
      }
    );
  }, [everInitialized, containerRef, isSelecting, setOutOfBoundsDirection]);

  // Only create document mouse handlers when initialized
  const { handleDocumentMouseMove, handleMouseUp, handleMouseDown } = useMemo(() => {
    if (!everInitialized) {
      return {
        handleDocumentMouseMove: () => { },
        handleMouseUp: () => { },
        handleMouseDown: () => { }
      };
    }

    return CLACalendarHandlers.createDocumentMouseHandlers(
      containerRef,
      isSelecting,
      outOfBoundsDirection,
      setOutOfBoundsDirection,
      (position) => {
        mousePositionRef.current = position;
      },
      moveToMonthRef,
      setIsSelecting
    );
  }, [everInitialized, containerRef, isSelecting, outOfBoundsDirection, setOutOfBoundsDirection, moveToMonthRef, setIsSelecting]);

  // Only create date change handler when initialized
  const handleDateChange = useMemo(() => {
    if (!everInitialized) {
      // Return a function with the same signature as the real handler
      return (_field: "end" | "start") => (_date: Date, _isClearingError?: boolean, _validationError?: CalendarValidationError) => {
        // Empty function with proper parameter names prefixed with underscore
      };
    }

    return CLACalendarHandlers.createDateChangeHandler(
      selectedRange,
      dateInputContext,
      setSelectedRange,
      setDateInputContext,
      setValidationErrors,
      setCurrentMonth,
      settings.visibleMonths,
      dateValidator // Include dateValidator as the 8th argument
    );
  }, [everInitialized, selectedRange, dateInputContext, settings.visibleMonths]);

  // Format display text doesn't need the whole calendar to be initialized
  const getDisplayText = useMemo(() =>
    CLACalendarHandlers.createDisplayTextFormatter(
      displayRange,
      settings.selectionMode,
      settings.dateFormatter,
      settings.dateRangeSeparator
    ),
    [displayRange, settings.selectionMode, settings.dateFormatter, settings.dateRangeSeparator]
  );

  // Only create selection handlers when initialized
  const { handleSelectionStart, handleSelectionMove } = useMemo(() => {
    if (!everInitialized || !selectionManager) {
      return {
        handleSelectionStart: () => { },
        handleSelectionMove: () => { }
      };
    }

    return CLACalendarHandlers.createSelectionHandlers(
      selectionManager,
      isSelecting,
      setIsSelecting,
      setSelectedRange,
      setNotification,
      settings.showSelectionAlert,
      selectedRange,
      outOfBoundsDirection
    );
  }, [everInitialized, selectionManager, isSelecting, setIsSelecting, setSelectedRange, setNotification, settings.showSelectionAlert, selectedRange, outOfBoundsDirection]);

  // Use the abstracted calendar action handlers
  const { handleClear, handleSubmit: originalHandleSubmit, handleClickOutside, handleLayerChange } = useMemo(() =>
    CLACalendarHandlers.createCalendarActionHandlers(
      setSelectedRange,
      setDateInputContext,
      setIsSelecting,
      setValidationErrors,
      setCurrentMonth,
      setIsOpen,
      setActiveLayer,
      selectedRange,
      settings.onSubmit,
      settings.closeOnClickAway
    ),
    [setSelectedRange, setDateInputContext, setIsSelecting, setValidationErrors, setCurrentMonth, setIsOpen, setActiveLayer, selectedRange, settings.onSubmit, settings.closeOnClickAway]
  );

  // Wrap the original handleSubmit to update displayRange
  const handleSubmit = useCallback(() => {
    setDisplayRange(selectedRange);
    originalHandleSubmit();
  }, [selectedRange, originalHandleSubmit]);

  // Update handleClear to also clear displayRange
  const handleClearAll = useCallback(() => {
    handleClear();
    setDisplayRange({ start: null, end: null });
  }, [handleClear]);

  // Layer rendering function - only used when calendar is initialized
  const renderLayer = useCallback((layer: Layer) => {
    if (!everInitialized) return null;

    return (
      <CalendarGrid
        months={months}
        selectedRange={selectedRange}
        onSelectionStart={handleSelectionStart}
        onSelectionMove={handleSelectionMove}
        isSelecting={isSelecting}
        visibleMonths={settings.visibleMonths}
        showMonthHeadings={settings.showMonthHeadings}
        layer={layer}
        restrictionConfig={effectiveRestrictionConfig}
        startWeekOnSunday={settings.startWeekOnSunday}
        settings={settings}
        activeLayer={activeLayer}
      />
    );
  }, [everInitialized, months, selectedRange, handleSelectionStart, handleSelectionMove, isSelecting, settings, effectiveRestrictionConfig, activeLayer]);

  // Register with the calendar coordinator 
  useEffect(() => {
    // Define the state change handler
    const handleStateChange = () => {
      // If another calendar is activated, close this one
      if (coordinatorRef.current && !coordinatorRef.current.isActive() && isOpen) {
        setIsOpen(false);
      }
    };

    // Register this calendar with the coordinator
    coordinatorRef.current = registerCalendar(calendarIdRef.current, handleStateChange);

    // Clean up on unmount
    return () => {
      coordinatorRef.current?.unregister();
    };
  }, [isOpen]); // Added isOpen to dependency array

  // Sync calendar open state with coordinator
  useEffect(() => {
    if (!coordinatorRef.current) return;

    if (isOpen && settings.displayMode === 'popup') {
      coordinatorRef.current.open();
    } else if (coordinatorRef.current.isActive() && !isOpen) {
      coordinatorRef.current.close();
    }
  }, [isOpen, settings.displayMode]);

  // Update isDateRestricted to handle both types - only needed when initialized
  const _isDateRestricted = useCallback((date: Date): boolean => {
    if (!everInitialized || !selectionManager) return false;
    const result = selectionManager.canSelectDate(date);
    return !result.allowed;
  }, [everInitialized, selectionManager]);

  // Update the moveToMonth function - only needed when initialized
  const moveToMonth = useCallback((direction: 'prev' | 'next') => {
    if (!everInitialized || !currentMonth) return;

    // First move the month - this happens regardless of selection state
    setCurrentMonth(prev => {
      return direction === 'next'
        ? addMonths(prev, 1)
        : addMonths(prev, -1);
    });

    // Then handle selection logic only if we're in an out-of-bounds selection
    if (isSelecting && outOfBoundsDirection && selectionManager) {
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

      // Use the selection manager to handle the update, which now properly checks boundaries
      const updateResult = selectionManager.updateSelection(
        selectedRange,
        potentialEnd
      );

      // Update the selection range with the result
      setSelectedRange(updateResult.range);

      // If there's a message or the update wasn't successful, we hit a restriction
      if (updateResult.message || !updateResult.success) {
        // End the selection and show message
        setIsSelecting(false);
        setOutOfBoundsDirection(null);

        // Only show notification during out-of-bounds scrolling
        if (settings.showSelectionAlert && outOfBoundsDirection) {
          setNotification(updateResult.message);
        }

        document.removeEventListener("mousemove", handleDocumentMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }
    }
  }, [everInitialized, months, selectionManager, settings.showSelectionAlert, isSelecting, outOfBoundsDirection, selectedRange, handleDocumentMouseMove, handleMouseUp, currentMonth]);

  // Update moveToMonthRef when moveToMonth changes
  useEffect(() => {
    moveToMonthRef.current = moveToMonth;
  }, [moveToMonth]);

  // Handle input click to open calendar and initialize if needed
  const handleInputClick = () => {
    // Always open the calendar when input is clicked
    setIsOpen(true);

    // Ensure the calendar is initialized when first opened
    if (!everInitialized) {
      setEverInitialized(true);

      // If settings has a defaultRange, use it; otherwise use current date
      if (settings.defaultRange) {
        setCurrentMonth(new Date(settings.defaultRange.start));
      } else {
        setCurrentMonth(new Date());
      }

      // Force immediate loading of lazy data
      if (settings.layersFactory && !lazyLayers) {
        const layers = settings.layersFactory();
        setLazyLayers(layers);

        // Initialize activeLayers right away
        const tempLayerManager = new LayerManager(layers);
        setActiveLayers(tempLayerManager.getLayers());

        // Make sure we have a valid activeLayer
        if (layers.length > 0) {
          const validLayer = layers.find(l => l.name === activeLayer) || layers[0];
          setActiveLayer(validLayer.name);
        }
      }
    }

    // Force the coordinator to register this calendar as active
    if (coordinatorRef.current) {
      coordinatorRef.current.open();
    }
  };

  // Note: Click outside handling is now managed by the CalendarPortal component itself
  // The CalendarPortal's onClose prop handles the click-away behavior

  // Simple effect to hide calendar on scroll
  useEffect(() => {
    if (!isOpen || settings.displayMode === 'embedded') return;

    const handleScroll = () => {
      setIsOpen(false);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, settings.displayMode]);

  // Helper function to render the calendar content
  const renderCalendarContent = () => {
    if (!everInitialized) return null;

    // Make sure we have layers before attempting to render
    // This is crucial to prevent empty rendering
    if ((settings.layersFactory && !lazyLayers) || !activeLayers || activeLayers.length === 0) {
      return <div>Loading calendar data...</div>;
    }

    // Make sure we have at least one active layer that matches activeLayer
    const hasValidActiveLayer = activeLayers.some(layer => layer.name === activeLayer);
    if (!hasValidActiveLayer) {
      // If the activeLayer isn't valid, use the first available layer
      if (activeLayers.length > 0) {
        setActiveLayer(activeLayers[0].name);
      }
      return <div>Initializing calendar view...</div>;
    }

    return (
      <>
        {settings.showHeader && (
          <>
            <div className="cla-date-inputs-wrapper" style={{
              width: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              margin: 0,
              padding: settings.backgroundColors?.headerContainer ? '8px' : '0',
              backgroundColor: settings.backgroundColors?.headerContainer || 'transparent',
              borderRadius: settings.backgroundColors?.headerContainer ? '4px' : '0',
            }}>
              {settings.showDateInputs !== false && (
                <DateInputSection
                  selectedRange={selectedRange}
                  handleDateChange={handleDateChange}
                  dateInputContext={dateInputContext}
                  selectionMode={settings.selectionMode}
                  defaultRange={settings.defaultRange}
                  settings={settings}
                />
              )}
            </div>

            <CalendarHeader
              months={months}
              visibleMonths={settings.visibleMonths}
              moveToMonth={moveToMonth}
              timezone={settings.timezone}
              settings={settings}
            />
          </>
        )}

        {settings.showLayersNavigation && (
          <LayerControl
            layers={activeLayers}
            activeLayer={activeLayer}
            onLayerChange={handleLayerChange}
          />
        )}

        <div className="cla-card-body" style={{ padding: '0px 0px' }}>
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

        {settings.showFooter && (
          <CalendarFooter
            showSubmitButton={settings.showSubmitButton}
            handleClear={handleClearAll}
            handleSubmit={handleSubmit}
          />
        )}

        {settings.enableOutOfBoundsScroll && (
          <SideChevronIndicator
            outOfBoundsDirection={outOfBoundsDirection}
            isSelecting={isSelecting}
          />
        )}

        {settings.showSelectionAlert && notification && (
          <Notification
            message={notification}
            onDismiss={() => setNotification(null)}
          />
        )}
      </>
    );
  };

  const calendarRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Reset states when calendar closes
  useEffect(() => {
    if (!isOpen) {
      setIsReady(false);
    }
  }, [isOpen]);

  // Show calendar after a brief delay
  useEffect(() => {
    if (!isOpen) return;

    // Reset state
    setIsReady(false);

    // Show after a brief delay to allow portal to position
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);




  return (
    <CalendarErrorBoundary
      componentName="CLACalendar"
      onError={(error, errorInfo, errorId) => {
        // Custom error handling - you can send to your error tracking service
        console.error(`Calendar Error [${errorId}]:`, error, errorInfo);
        
        // Optional: Report to external service
        // Example: Sentry, LogRocket, Bugsnag, etc.
        /*
        if (window.Sentry) {
          window.Sentry.captureException(error, {
            tags: { component: 'CLACalendar', errorId },
            extra: { errorInfo, settings }
          });
        }
        */
      }}
    >
      <div
        className="cla-calendar-wrapper"
        data-open={isOpen ? "true" : "false"}
        data-display-mode={settings.displayMode}
      >
        {settings.inputStyle && (
          <style>
            {`
            #${calendarIdRef.current}-input {
              ${Object.entries(settings.inputStyle).map(([key, value]) =>
              `${key}: ${value} !important;`
            ).join('\n            ')}
            }
            `}
          </style>
        )}
        {settings.displayMode !== 'embedded' && !externalInputRef && (
          <input
            ref={inputRef}
            id={`${calendarIdRef.current}-input`}
            type="text"
            className={`cla-form-control cla-input-custom${settings.inputClassName ? ` ${settings.inputClassName}` : ''}`}
            readOnly
            value={getDisplayText()}
            onClick={handleInputClick}
            onChange={settings.inputOnChange}
          />
        )}

        {/* Only render the calendar when it's open */}
        {isOpen && (
          settings.displayMode === 'embedded' ? (
            <CalendarContainer
              isOpen={isOpen}
              displayMode={settings.displayMode}
              containerRef={containerRef}
              containerStyle={settings.containerStyle}
              visibleMonths={settings.visibleMonths}
              monthWidth={settings.monthWidth}
              enableOutOfBoundsScroll={settings.enableOutOfBoundsScroll}
              handleMouseDown={handleMouseDown}
              handleMouseMove={handleMouseMove}
              handleMouseLeave={handleMouseLeave}
            >
              {renderCalendarContent()}
            </CalendarContainer>
          ) : (
            <CalendarPortal
              isOpen={true}
              triggerRef={externalInputRef ? { current: externalInputRef } : inputRef}
              onClose={settings.closeOnClickAway ? () => setIsOpen(false) : undefined}
              portalClassName={`cla-calendar-portal cla-calendar-portal-${calendarIdRef.current}`}
              position={settings.position}
              dynamicPosition={settings.useDynamicPosition}
              expectedWidth={settings.visibleMonths * settings.monthWidth}
              portalStyle={{
                width: `${settings.visibleMonths * settings.monthWidth}px`,
                visibility: isReady ? 'visible' : 'hidden',
                pointerEvents: isReady ? 'auto' : 'none'
              }}
            >
              <div
                ref={calendarRef}
                className="cla-card"
                style={{
                  width: `${settings.visibleMonths * settings.monthWidth}px`,
                  ...DEFAULT_CONTAINER_STYLES,
                  ...settings.containerStyle,
                  visibility: isReady ? 'visible' : 'hidden'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  if (settings.enableOutOfBoundsScroll) {
                    handleMouseDown(e);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  ref={containerRef}
                  style={{ width: '100%', height: '100%' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (settings.enableOutOfBoundsScroll) {
                      handleMouseDown(e);
                    }
                  }}
                  onMouseMove={settings.enableOutOfBoundsScroll ? handleMouseMove : undefined}
                  onMouseLeave={settings.enableOutOfBoundsScroll ? handleMouseLeave : undefined}
                >
                  {renderCalendarContent()}
                </div>
              </div>
            </CalendarPortal>
          )
        )}
      </div>
    </CalendarErrorBoundary>
  );
};


export default CLACalendar;

