import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import moment from 'moment';

import '../app/App.css';

import { mean } from '../../utils/mathUtils.js';
import { formatNumber, color } from '../../utils/resultsUtils.js';
import { convertDays } from '../../utils/dateUtils';

function StrategyResults(props) {
  const [summaryValues, setSummaryValues] = useState({"invested": [0, 0, 0], "returns": [0, 0, 0], "percentage_returns": [0, 0, 0]})

  useEffect(() => {
    let invested =[], returns = [], returns_percent = []
    Object.values(props.data).forEach(x => {invested.push(x.summary.total_invested); returns.push(x.summary.returns); returns_percent.push(x.summary.percentage_returns)})
    setSummaryValues({"invested": [Math.min(...invested), Math.max(...invested), mean(invested)], "returns": [Math.min(...returns), Math.max(...returns), mean(returns)], "percentage_returns": [Math.min(...returns_percent), Math.max(...returns_percent), mean(returns_percent)]})
  }, [props.data])

  return (
    <div className={"strategyResultsContainer p-3"}>
      <div className={"strategyResultsTable"}>
        <Table bordered hover className={"h-100 w-100 mb-0"}>
          <thead>
            <tr>
              <th>Strategy</th>
              <th>Start</th>
              <th>Time</th>
              <th>Invested</th>
              <th>Returns</th>
              <th>Returns</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(props.data).map(([key, value]) =>
              <tr key={key}>
                <td>{key}</td>
                <td>{moment(value.summary.investment_date[0]).format("Do MMM YYYY")}</td>
                <td>{convertDays(value.summary.investment_time_days)}</td>
                <td style={{"backgroundColor": color(value.summary.total_invested, summaryValues.invested, true)}}>{props.currency}{formatNumber(value.summary.total_invested)}</td>
                <td style={{"backgroundColor": color(value.summary.returns, summaryValues.returns)}}>{props.currency}{formatNumber(value.summary.returns)}</td>
                <td style={{"backgroundColor": color(value.summary.percentage_returns, summaryValues.percentage_returns)}}>{formatNumber(value.summary.percentage_returns)}%</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default StrategyResults