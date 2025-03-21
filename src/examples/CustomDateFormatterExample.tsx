import React, { useState } from 'react';
import { CLACalendar } from '../components/CLACalendar';
import { CalendarSettings, getDefaultSettings } from '../components/DateRangePicker.config';
import '../components/DateRangePickerNew/defensive-styles.css';

const CustomDateFormatterExample: React.FC = () => {
  // Create initial settings with a custom date formatter
  const initialSettings: CalendarSettings = {
    ...getDefaultSettings(),
    displayMode: 'popup',
    visibleMonths: 2,
    showSubmitButton: true,
    // Define a custom date formatter that formats dates as YYYY-MM-DD
    dateFormatter: (date: Date) => {
      // Pad numbers with leading zeros
      const pad = (num: number): string => String(num).padStart(2, '0');

      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1); // Months are 0-indexed
      const day = pad(date.getDate());

      return `${year}-${month}-${day}`;
    }
  };

  const [settings, setSettings] = useState<CalendarSettings>(initialSettings);
  const [selectedValues, setSelectedValues] = useState<{ startDate: string | null, endDate: string | null }>({
    startDate: null,
    endDate: null
  });

  const handleSubmit = (startDate: string | null, endDate: string | null) => {
    // No console.log, just set the selected values
    setSelectedValues({ startDate, endDate });
  };

  return (
    <div className="example-container">
      <h2>Calendar with Custom Date Formatter</h2>
      <p>This example shows how to use a custom date formatter to display dates in YYYY-MM-DD format.</p>

      <div className="calendar-container">
        <CLACalendar
          settings={settings}
          onSettingsChange={setSettings}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Display selected values */}
      <div className="selected-values" style={{ marginTop: '20px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
        <h3>Selected Range:</h3>
        <p>Start Date: {selectedValues.startDate || 'Not selected'}</p>
        <p>End Date: {selectedValues.endDate || 'Not selected'}</p>
      </div>

      <div className="code-example">
        <h3>Code Example:</h3>
        <pre>
          {`// Define settings with a custom date formatter
const settings = {
  ...getDefaultSettings(),
  dateFormatter: (date: Date) => {
    // Pad numbers with leading zeros
    const pad = (num: number): string => String(num).padStart(2, '0');
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are 0-indexed
    const day = pad(date.getDate());
    
    return \`\${year}-\${month}-\${day}\`;
  }
};

// Use the calendar with custom settings
<CLACalendar 
  settings={settings}
  onSettingsChange={setSettings}
  onSubmit={handleSubmit}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default CustomDateFormatterExample; 