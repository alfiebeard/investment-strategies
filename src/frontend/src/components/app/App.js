import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import BarLoader from 'react-spinners/BarLoader';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import TickerForm from '../forms/TickerForm.js';
import StrategyForm from '../forms/StrategyForm.js';
import Chart from '../charts/Chart.js';
import ComparisonChart from '../charts/ComparisonChart.js';
import Info from '../results/Info.js';
import StrategyResults from '../results/StrategyResults.js';

import { subtractDays } from '../../utils/dateUtils';
import { createInvestmentsData, filterData } from '../../utils/dataUtils.js';

function App() {
  const [ticker, setTicker] = useState('');
  const [currency, setCurrency] = useState("$");
  const [data, setData] = useState(null);
  const [changingData, setChangingData] = useState(false);
  const [strategyData, setStrategyData] = useState({});
  const [minSliderDateIndex, setMinSliderDateIndex] = useState(null);
  const [maxSliderDateIndex, setMaxSliderDateIndex] = useState(null);
  const [strategyComparisons, setStrategyComparisons] = useState({});
  const [runningStrategy, setRunningStrategy] = useState(false);

  return (
    <Container fluid className={"App w-100 p-1"}>
      <Row className={"w-100 h-100 m-0"}>
        <Col lg={3} className={"controls " + (runningStrategy ? "computingStrategy" : "")}>
          {runningStrategy ? <div className={"computingStrategySpinner"}><BarLoader /></div> : null}
          {Object.keys(strategyComparisons).length === 0 ?
            <TickerForm
              ticker={ticker}
              setTicker={setTicker}
              setData={setData}
              setChangingData={setChangingData}
              setMinSliderDateIndex={setMinSliderDateIndex}
              setMaxSliderDateIndex={setMaxSliderDateIndex}
              setStrategyData={setStrategyData}
              runningStrategy={runningStrategy}
            />
            : null
          }
          {data ?
            <StrategyForm
              currency={currency}
              earliestStartDate={data.data.Date[0]}
              latestEndDate={subtractDays(data.data.Date[data.data.Date.length - 1])}
              symbol={data["info"].symbol}
              setStrategyData={setStrategyData}
              strategyComparisons={strategyComparisons}
              setStrategyComparisons={setStrategyComparisons}
              runningStrategy={runningStrategy}
              setRunningStrategy={setRunningStrategy}
            />
            : null
          }
        </Col>
        <Col lg={9} className={"h-100 p-0"}>
          {data ?
            <Row className={"h-100 p-3"}>
              <Col lg={Object.keys(strategyData).length > 0 ? 7 : 12} className={"h-100"}>
                  <Row className={"tickerInfoRow"}>
                    <Info
                      currency={currency}
                      info={data["info"]}
                    />
                  </Row>
                  
                  <Row className={"tickerChartRow pb-3 " + (Object.keys(strategyData).length > 0 ? "short" : "")}>
                    <Chart
                      ticker={ticker}
                      currency={currency}
                      data={data["data"]} // filterData(data["data"], minSliderDateIndex, maxSliderDateIndex)
                      changingData={changingData}
                      setChangingData={setChangingData}
                      investmentData={Object.keys(strategyData).length === 1 ? createInvestmentsData(filterData(Object.values(strategyData)[0].data, minSliderDateIndex, maxSliderDateIndex)) : {"data": [], "investments": []}}
                      maxSliderLength={data["data"].Date.length - 1}
                      minSliderDateIndex={minSliderDateIndex}
                      maxSliderDateIndex={maxSliderDateIndex}
                      setMinSliderDateIndex={setMinSliderDateIndex}
                      setMaxSliderDateIndex={setMaxSliderDateIndex}
                    />
                  </Row>
                  
                  {Object.keys(strategyData).length > 0 ? 
                    <Row className={"strategyResultsRow"}>
                        <StrategyResults
                          currency={currency}
                          data={strategyData}
                        />
                    </Row>
                  : null}
              </Col>

              {Object.keys(strategyData).length > 0 ? 
                <Col lg={5} className={"h-100"}>      
                  <>
                    <ComparisonChart
                      currency={currency}
                      data={strategyData}
                      title={"investment_cum"}
                      minSliderDate={data.data.Date[minSliderDateIndex]}
                      maxSliderDate={data.data.Date[maxSliderDateIndex]}
                    />
                    <ComparisonChart
                      currency={currency}
                      data={strategyData}
                      title={"total_value"}
                      minSliderDate={data.data.Date[minSliderDateIndex]}
                      maxSliderDate={data.data.Date[maxSliderDateIndex]}
                    />
                    <ComparisonChart
                      currency={"%"}
                      data={strategyData}
                      title={"percentage_returns"}
                      minSliderDate={data.data.Date[minSliderDateIndex]}
                      maxSliderDate={data.data.Date[maxSliderDateIndex]}
                    />
                  </>
                </Col>
                : null
              }
            </Row> : null
          }
        </Col>
      </Row>
    </Container>
  );
}

export default App;
