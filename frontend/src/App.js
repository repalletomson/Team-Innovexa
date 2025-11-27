// import { CandleSeries } from '@syncfusion/ej2-charts';
import './App.css';
import PieChart from './PieChart';
import OverView from './templates/Overview';
import CandleStickChart from './templates/CandleStickChart';

function App() {
  return (
    <div className="App">
      <OverView />
      <div ></div>
      <PieChart/>
      <br />
      <CandleStickChart/>
    </div>
  );
}

export default App;
