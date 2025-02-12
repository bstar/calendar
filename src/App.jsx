import 'bootstrap/dist/css/bootstrap.min.css'

import DateRangePicker from './components/DateRangePicker';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <DateRangePicker 
        // Number of months to display (1-6)
        visibleMonths={2}

        // Show month headings
        showMonthHeadings={true}

        // Optional callbacks
        // onChange={(dates) => console.log(dates)}  // {start: Date, end: Date}
        // onApply={(dates) => console.log(dates)}   // {start: Date, end: Date}
        // onClear={() => console.log('cleared')}    // void

        // Optional styling
        // className="custom-class"                  // string
        // style={{ width: '300px' }}               // React.CSSProperties

        // Optional date constraints
        // minDate={new Date()}                     // Date
        // maxDate={new Date('2025-12-31')}         // Date
        
        // Optional initial dates
        // defaultStartDate={new Date()}            // Date
        // defaultEndDate={new Date()}              // Date

        selectionMode="single"  // or "range"
      />
    </div>
  );
}

export default App;