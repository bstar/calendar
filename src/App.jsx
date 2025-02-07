
import 'bootstrap/dist/css/bootstrap.min.css'

import DateRangePicker from './components/DateRangePicker';

function App() {
  return (
    <div style={{ padding: '20px 0px 0px 100px' }}>
      <DateRangePicker useAnimations={true}  />
    </div>
  );
}

export default App;