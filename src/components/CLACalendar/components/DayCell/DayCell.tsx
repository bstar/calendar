import React, { useState, useMemo, useCallback } from 'react';
import { isSameDay, parseISO, format } from '../../../../utils/DateUtils';
import { RestrictionManager } from '../../../CLACalendarComponents/restrictions/RestrictionManager';
import { LayerRenderer } from '../../../CLACalendarComponents/layers/LayerRenderer';
import { Tooltip } from '../../../CLACalendarComponents/CalendarComponents';
import { DayCellProps } from './DayCell.types';
import { getFontSize } from '../../utils/calendar.utils';
import {
  hasAnyBoundaryRestriction,
  isAnchorInAnyBoundary,
  isDateInAnyBoundary,
  isInSameBoundary
} from './DayCell.utils';
import './DayCell.css';

export const DayCell: React.FC<DayCellProps> = ({
  date,
  selectedRange,
  isCurrentMonth,
  onMouseDown,
  onMouseEnter,
  showTooltips,
  renderContent,
  layer,
  restrictionConfig,
  settings,
  rowIndex,
  colIndex,
  globalRowIndex,
  globalColIndex,
  onKeyDown,
  tabIndex,
  onFocus
}) => {
  const { isSelected, isInRange, isRangeStart, isRangeEnd } = useMemo(() => {
    if (!selectedRange.start) {
      return { isSelected: false, isInRange: false, isRangeStart: false, isRangeEnd: false };
    }

    const startDate = parseISO(selectedRange.start, settings?.timezone);
    const endDate = selectedRange.end ? parseISO(selectedRange.end, settings?.timezone) : null;

    // Always use chronological ordering for visual styling
    const [chronologicalStart, chronologicalEnd] = endDate && startDate > endDate
      ? [endDate, startDate]
      : [startDate, endDate];

    const timezone = settings?.timezone || 'UTC';
    return {
      isSelected: isSameDay(date, startDate, timezone) || (endDate && isSameDay(date, endDate, timezone)),
      isInRange: chronologicalEnd
        ? (date >= chronologicalStart && date <= chronologicalEnd)
        : false,
      // Use chronological ordering for range start/end determination
      isRangeStart: isSameDay(date, chronologicalStart, timezone),
      // For single day selection in range mode, treat it as both start and end for circular appearance
      isRangeEnd: chronologicalEnd ? isSameDay(date, chronologicalEnd, timezone) : isSameDay(date, chronologicalStart, timezone)
    };
  }, [date, selectedRange, settings?.timezone]);

  const [isHovered, setIsHovered] = useState(false);

  const restrictionManager = useMemo(() => {
    if (!restrictionConfig || !restrictionConfig.restrictions || restrictionConfig.restrictions.length === 0) {
      return null;
    }
    return new RestrictionManager(restrictionConfig ?? { restrictions: [] });
  }, [restrictionConfig]);

  const restrictionResult = useMemo(() => {
    if (!restrictionManager) {
      return { allowed: true };
    }

    // Get basic restriction status for this date
    const baseRestriction = restrictionManager.checkSelection(date, date);

    // If no selection is in progress or this isn't a restricted date, just return the base result
    if (!selectedRange.start || (baseRestriction.allowed && !hasAnyBoundaryRestriction(restrictionConfig))) {
      return baseRestriction;
    }

    // From here, we're dealing with a selection in progress
    // Get the anchor date - the fixed point of the selection
    // selectedRange.start is guaranteed to exist at this point due to the check above
    const anchorDate = selectedRange.anchorDate
      ? parseISO(selectedRange.anchorDate, settings?.timezone)
      : parseISO(selectedRange.start!, settings?.timezone);

    // Check if the anchor is in a boundary - this is the key to determine if we need
    // to apply boundary restrictions
    const anchorInBoundary = isAnchorInAnyBoundary(anchorDate, restrictionConfig);
    const currentDateInBoundary = isDateInAnyBoundary(date, restrictionConfig);

    // If anchor is in a boundary but current date is not, show restriction
    if (anchorInBoundary.inBoundary && !isInSameBoundary(date, anchorInBoundary.boundaryStart, anchorInBoundary.boundaryEnd)) {
      return { allowed: false, message: anchorInBoundary.message };
    }

    // If anchor is NOT in a boundary but current date IS, do NOT show restriction pattern
    // This allows selections to cross into boundaries when starting outside them
    if (!anchorInBoundary.inBoundary && currentDateInBoundary) {
      return { allowed: true };
    }

    // For all other cases, use the base restriction result
    return baseRestriction;
  }, [date, restrictionManager, selectedRange, restrictionConfig]);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter(e);
  }, [onMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!restrictionResult.allowed) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Simulate a mouse down event for selection
      const mouseEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      e.currentTarget.dispatchEvent(mouseEvent);
    } else if (onKeyDown) {
      onKeyDown(e);
    }
  }, [restrictionResult.allowed, onKeyDown]);

  const handleFocus = useCallback((e: React.FocusEvent) => {
    setIsHovered(true);
    if (onFocus) onFocus(e);
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsHovered(false);
  }, []);

  const isSingleDay = useMemo(() => {
    if (!selectedRange.start) return false;
    if (!selectedRange.end) return true;
    return isSameDay(
      parseISO(selectedRange.start, settings?.timezone), 
      parseISO(selectedRange.end, settings?.timezone),
      settings?.timezone
    );
  }, [selectedRange.start, selectedRange.end, settings?.timezone]);

  // Always render the DayCell component, but return a placeholder for non-current month days
  const cellPlaceholder = !isCurrentMonth ? (
    <div className="day-cell-placeholder" style={{ backgroundColor: settings?.backgroundColors?.emptyRows || "white" }} />
  ) : null;

  // Moved useMemo outside the conditional statement
  const eventContent = useMemo(() => {
    if (!renderContent) return null;

    // Only compute event content when needed
    if (!isCurrentMonth) return null;

    // Compute event content if we need to display it
    if (showTooltips || isSelected || isInRange || isHovered) {
      return renderContent(date);
    }
    return null;
  }, [renderContent, date, showTooltips, isSelected, isInRange, isHovered, isCurrentMonth]);

  // If this is not the current month, render the placeholder
  if (!isCurrentMonth) {
    return cellPlaceholder;
  }

  const getBackgroundColor = () => {
    // Only get background color for non-restricted dates
    if (layer.data?.background) {
      const renderer = LayerRenderer.createBackgroundRenderer(layer.data.background);
      const result = renderer(date);
      return result?.backgroundColor || settings?.backgroundColors?.dayCells || 'transparent';
    }
    return settings?.backgroundColors?.dayCells || 'transparent';
  };

  const dayCellClasses = [
    'day-cell',
    !restrictionResult.allowed && 'restricted',
    isSelected && 'selected',
    isRangeStart && 'range-start',
    isRangeEnd && 'range-end',
    isInRange && !isSelected && 'range-middle',
    isSingleDay && (isSelected || isInRange) && 'single-day'
  ].filter(Boolean).join(' ');

  // Format date for screen reader
  const dateLabel = format(date, "EEEE, MMMM d, yyyy", settings?.timezone || 'UTC');
  const ariaLabel = [
    dateLabel,
    isSelected && 'selected',
    isRangeStart && 'start of range',
    isRangeEnd && 'end of range',
    !restrictionResult.allowed && `unavailable: ${restrictionResult.message || 'restricted'}`
  ].filter(Boolean).join(', ');

  const cellContent = (
    <div
      className={dayCellClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={onMouseDown}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={isCurrentMonth ? (tabIndex ?? -1) : -1}
      role="gridcell"
      aria-label={ariaLabel}
      aria-selected={isSelected}
      aria-disabled={!restrictionResult.allowed}
      data-date={format(date, 'yyyy-MM-dd', settings?.timezone || 'UTC')}
      style={{
        backgroundColor: restrictionResult.allowed 
          ? ((isSelected || isInRange) ? (settings?.backgroundColors?.selection || "#cce5ff") : getBackgroundColor())
          : 'transparent',
        '--row-index': rowIndex,
        '--col-index': colIndex
      } as React.CSSProperties}
    >
      <div className="day-cell-date">
        <span className="day-cell-date-text" style={{
          fontSize: getFontSize(settings, 'small'),
        }}>
          {format(date, "d", settings?.timezone || 'UTC')}
        </span>
      </div>
      {eventContent?.element && (
        <div className="day-cell-event">
          {eventContent.element}
        </div>
      )}
    </div>
  );

  // Only show tooltips if showTooltips is true and we have tooltip content
  const tooltipContent = eventContent?.tooltipContent;
  return (showTooltips && tooltipContent) ? (
    <Tooltip
      content={tooltipContent}
      show={isHovered}
    >
      {cellContent}
    </Tooltip>
  ) : cellContent;
};