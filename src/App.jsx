import './bootstrap.min.css'

import DateRangePicker from './components/DateRangePicker';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <DateRangePicker 
        // Number of months to display (1-6)
        visibleMonths={2}
        // Show month headings
        showMonthHeadings={true}
        // Single vs range selection
        selectionMode="range"  // or "range"
        showTooltips={false}  // Disable tooltips
      />
    </div>
  );
}

export default App;