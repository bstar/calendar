import React from 'react';
import PropTypes from 'prop-types';

const BaseLayer = ({
  selectedRange,
  onSelectionStart,
  onSelectionMove,
  isSelecting,
  months,
  visibleMonths,
  showMonthHeadings,
  showTooltips
}) => {
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
    />
  );
};

export default BaseLayer; 