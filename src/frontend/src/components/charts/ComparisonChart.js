import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Title } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import moment from 'moment';

import './ComparisonChart.css';

import { getMaxDateRange } from '../../utils/dateUtils.js';
import { createComparisonChartData, createComparisonChartOptions } from '../../utils/graphUtils.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Title)

function ComparisonChart(props) {
  const chartRef = useRef(null);

  useEffect(() => {
    chartRef.current.zoomScale("x", {min: moment(props.minSliderDate).unix() * 1000, max: moment(props.maxSliderDate).unix() * 1000}, 'none')
  })

  return (
    <div className={"p-1 comparisonChart"}>
      <Scatter
        ref={chartRef}
        data={createComparisonChartData(props.data, props.title)}
        options={createComparisonChartOptions(props.currency, props.title, getMaxDateRange(props.data, 'Date'))}
      />
    </div>
  );
}

export default ComparisonChart