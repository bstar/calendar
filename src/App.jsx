import 'bootstrap/dist/css/bootstrap.min.css'

import DateRangePicker from './components/DateRangePicker';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <DateRangePicker 
        // Display mode for calendar
        viewMode="dual"      // 'single' | 'dual'

        // Selection behavior
        selectionMode="range" // 'single' | 'range'

        // Animation settings
        useAnimations={true} // true | false

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
      />
    </div>
  );
}

export default App;