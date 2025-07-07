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
  colIndex
}) => {
  const { isSelected, isInRange, isRangeStart, isRangeEnd } = useMemo(() => {
    if (!selectedRange.start) {
      return { isSelected: false, isInRange: false, isRangeStart: false, isRangeEnd: false };
    }

    const startDate = parseISO(selectedRange.start);
    const endDate = selectedRange.end ? parseISO(selectedRange.end) : null;

    // Always use chronological ordering for visual styling
    const [chronologicalStart, chronologicalEnd] = endDate && startDate > endDate
      ? [endDate, startDate]
      : [startDate, endDate];

    return {
      isSelected: isSameDay(date, startDate) || (endDate && isSameDay(date, endDate)),
      isInRange: chronologicalEnd
        ? (date >= chronologicalStart && date <= chronologicalEnd)
        : false,
      // Use chronological ordering for range start/end determination
      isRangeStart: isSameDay(date, chronologicalStart),
      isRangeEnd: chronologicalEnd && isSameDay(date, chronologicalEnd)
    };
  }, [date, selectedRange]);

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
    const anchorDate = selectedRange.anchorDate
      ? parseISO(selectedRange.anchorDate)
      : parseISO(selectedRange.start);

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

  const isSingleDay = useMemo(() => {
    if (!selectedRange.start) return false;
    if (!selectedRange.end) return true;
    return isSameDay(parseISO(selectedRange.start), parseISO(selectedRange.end));
  }, [selectedRange.start, selectedRange.end]);

  // Always render the DayCell component, but return a placeholder for non-current month days
  const cellPlaceholder = !isCurrentMonth ? (
    <div style={{ width: "100%", height: "100%", position: "relative", backgroundColor: settings?.backgroundColors?.emptyRows || "white" }} />
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

  const cellContent = (
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
        // Only apply backgroundColor for non-restricted dates
        ...(!restrictionResult.allowed ? {
          '--row-index': rowIndex,
          '--col-index': colIndex
        } as React.CSSProperties : {
          backgroundColor: (isSelected || isInRange) ? (settings?.backgroundColors?.selection || "#b1e4e5") : getBackgroundColor()
        }),
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
        pointerEvents: 'none',
        zIndex: 3 // Ensure date number appears above pattern and below events
      }}>
        <span style={{
          position: 'relative',
          pointerEvents: 'none',
          fontSize: getFontSize(settings, 'small'),
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
          pointerEvents: 'none',
          zIndex: 10 // Higher z-index to ensure events display above the restricted pattern
        }}>
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