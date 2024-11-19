import DateRangePicker from './components/DateRangePicker'
import { Container } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <DateRangePicker />
    </Container>
  )
}

export default App