import React, { useMemo, useCallback, useRef } from 'react';
import { addMonths, format } from '../../../../utils/DateUtils';
import { LayerRenderer } from '../../../CLACalendarComponents/layers/LayerRenderer';
import { MonthGrid } from '../MonthGrid';
import { CalendarGridProps, MonthPairProps } from './CalendarGrid.types';
import { RenderResult, Renderer } from '../../CLACalendar.types';
import './CalendarGrid.css';

const MonthPair: React.FC<MonthPairProps> = ({
  firstMonth,
  secondMonth,
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting,
  visibleMonths,
  showMonthHeadings,
  renderDay,
  layer,
  activeLayer,
  restrictionConfig,
  startWeekOnSunday,
  settings,
  months,
  onNavigateMonth
}) => {
  // Calculate whether to show tooltips based on settings
  const showTooltips = useMemo(() => {
    if (!settings?.showTooltips) return false;
    if (settings.suppressTooltipsOnSelection && isSelecting) return false;
    return true;
  }, [settings?.showTooltips, settings?.suppressTooltipsOnSelection, isSelecting]);

  // Create a ref to store the focused date for each month
  const focusedDatesRef = useRef<Map<number, Date>>(new Map());

  // Handle navigation between months
  const handleNavigateToMonth = useCallback((targetMonthIndex: number, targetDate: Date) => {
    // Store the target date for the month
    focusedDatesRef.current.set(targetMonthIndex, targetDate);
    
    // Find the element in the target month and focus it
    requestAnimationFrame(() => {
      const targetDateStr = format(targetDate, 'yyyy-MM-dd', settings?.timezone || 'UTC');
      const targetCell = document.querySelector(`[data-date="${targetDateStr}"]`) as HTMLElement;
      if (targetCell) {
        targetCell.focus();
      }
    });
  }, [settings?.timezone]);
  // Use the months array directly if provided, otherwise calculate months
  const monthsToShow: Date[] = months || (() => {
    const result: Date[] = [];

    // Use secondMonth if provided, otherwise calculate months based on firstMonth
    if (secondMonth) {
      result.push(firstMonth);
      result.push(secondMonth);
    } else {
      for (let i = 0; i < visibleMonths; i++) {
        result.push(addMonths(firstMonth, i));
      }
    }

    return result;
  })();

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      gap: '0px',
      justifyContent: 'center'
    }}>
      {monthsToShow.map((month, index) => (
        <MonthGrid
          key={month.toISOString()}
          baseDate={month}
          monthIndex={index}
          selectedRange={selectedRange}
          onSelectionStart={onSelectionStart}
          onSelectionMove={onSelectionMove}
          style={{ width: 'auto' }}
          showMonthHeading={showMonthHeadings}
          showTooltips={showTooltips}
          renderDay={renderDay}
          layer={layer}
          restrictionConfig={restrictionConfig}
          startWeekOnSunday={startWeekOnSunday}
          settings={settings}
          activeLayer={activeLayer}
          totalMonths={monthsToShow.length}
          onNavigateToMonth={handleNavigateToMonth}
          onNavigateMonth={onNavigateMonth}
          monthsPerRow={monthsToShow.length} // For now, all months in one row
        />
      ))}
    </div>
  );
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  months,
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting,
  visibleMonths,
  showMonthHeadings,
  layer,
  activeLayer,
  restrictionConfig,
  startWeekOnSunday,
  settings,
  onNavigateMonth
}) => {
  // Only create renderers when needed and they contain actual data
  const renderers: Renderer[] = useMemo(() => {
    const results: Renderer[] = [];

    if (layer.data?.background) {
      results.push(LayerRenderer.createBackgroundRenderer(layer.data.background));
    }

    if (layer.data?.events && layer.data.events.length > 0) {
      results.push(LayerRenderer.createEventRenderer(
        layer.data.events.map(event => ({
          ...event,
          type: event.type as 'work' | 'other'
        }))
      ));
    }

    return results;
  }, [layer.data?.background, layer.data?.events]);

  const renderDay = useCallback((date: Date): RenderResult | null => {
    // Quick exit if no renderers - avoids unnecessary work
    if (renderers.length === 0) return null;

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
  }, [renderers]);

  return (
    <MonthPair
      firstMonth={months[0]}
      secondMonth={visibleMonths === 1 ? null : null}
      selectedRange={selectedRange}
      onSelectionStart={onSelectionStart}
      onSelectionMove={onSelectionMove}
      isSelecting={isSelecting}
      visibleMonths={visibleMonths}
      showMonthHeadings={showMonthHeadings}
      renderDay={renderDay}
      layer={layer}
      restrictionConfig={restrictionConfig}
      startWeekOnSunday={startWeekOnSunday}
      settings={settings}
      activeLayer={activeLayer}
      months={months}
      onNavigateMonth={onNavigateMonth}
    />
  );
};