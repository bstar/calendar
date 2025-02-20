import React from 'react';
import { parseISO, isWithinInterval, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const BackgroundLayer = ({
  months,
  data = [],
  visibleMonths,
  showMonthHeadings
}) => {
  const getBackgroundColor = (date) => {
    for (const range of data) {
      const start = parseISO(range.startDate);
      const end = parseISO(range.endDate);
      
      if (isWithinInterval(date, { start, end }) || 
          isSameDay(date, start) || 
          isSameDay(date, end)) {
        return range.color;
      }
    }
    return 'transparent';
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
      {months.map((month, monthIndex) => (
        <div 
          key={month.toISOString()}
          style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {showMonthHeadings && (
            <div style={{ height: '32px', marginBottom: '8px' }} />
          )}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridAutoRows: '36px',
            gap: '0',
            width: '100%'
          }}>
            {eachDayOfInterval({
              start: startOfMonth(month),
              end: endOfMonth(month)
            }).map(date => (
              <div
                key={date.toISOString()}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  backgroundColor: getBackgroundColor(date)
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BackgroundLayer; 