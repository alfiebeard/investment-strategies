import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, BubbleController } from 'chart.js';
import { Line, Bubble } from 'react-chartjs-2';   // import Bubble as registered controller, else fails in build
import Button from 'react-bootstrap/Button';
import MultiRangeSlider from 'multi-range-slider-react';
import ZoomPlugin from 'chartjs-plugin-zoom';
import $ from 'jquery';

import './Chart.css';

import { createChartData, createChartOptions } from '../../utils/graphUtils.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BubbleController, Tooltip, ZoomPlugin)

function Chart(props) {
  const [resetZoom, setResetZoom] = useState(false);

  const chartRef = useRef(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    chartRef.current.zoomScale("x", {min: props.minSliderDateIndex, max: props.maxSliderDateIndex}, 'none');
    props.setChangingData(false);
  }, [props.minSliderDateIndex, props.maxSliderDateIndex])

  useEffect(() => {
    $(".min-caption").text(props.data.Date[props.minSliderDateIndex]);
    $(".max-caption").text(props.data.Date[props.maxSliderDateIndex]);
  })

  return (
    <>
      {props.data ?
        <>
          {props.minSliderDateIndex !== 0 || props.maxSliderDateIndex !== props.maxSliderLength ?
            <div className={"resetTickerChartZoomContainer"}>
              <Button className={"resetTickerChartZoom"} onClick={() => {props.setMinSliderDateIndex(0); props.setMaxSliderDateIndex(props.maxSliderLength); setResetZoom(true)}}>
                Reset
              </Button>
            </div>
            : null
          }

          <Line
            ref={chartRef}
            className={"p-3 mainTickerChart"}
            data={createChartData(props.data, props.investmentData.data)}
            options={createChartOptions(props.currency, props.investmentData.investments, props.setMinSliderDateIndex, props.setMaxSliderDateIndex)}
          />
          
          <div className={"mainTickerChartSlider d-flex"}>
            <div className={"mainTickerChartSliderDateCaption m-auto"}>
              {props.data.Date[props.minSliderDateIndex]}
            </div>
            <MultiRangeSlider
              className={"tickerChartRangeSlider m-auto"}
              ref={sliderRef}
              min={0}
              max={props.maxSliderLength}
              step={1}
              minValue={props.minSliderDateIndex}
              maxValue={props.maxSliderDateIndex}
              ruler={false}
              label={false}
              onInput={(e) => {
                if (e.minValue !== props.minSliderDateIndex) {
                  // If min slider handle has changed - update caption
                  $(".min-caption").text(props.data.Date[e.minValue]);
                }
                if (e.maxValue !== props.maxSliderDateIndex) {
                  // If max slider handle has changed - update caption
                  $(".max-caption").text(props.data.Date[e.maxValue]);
                }
              }}
              onChange={(e) => {
                if (resetZoom) {
                  setResetZoom(false);
                  $(".min-caption").text(props.data.Date[props.minSliderDateIndex]);
                  $(".max-caption").text(props.data.Date[props.maxSliderDateIndex]);
                }
                else if (!props.changingData){
                  props.setMinSliderDateIndex(e.minValue);
                  props.setMaxSliderDateIndex(e.maxValue);
                  $(".min-caption").text(props.data.Date[e.minValue]);
                  $(".max-caption").text(props.data.Date[e.maxValue]);
                }
              }}
            />
            <div className={"mainTickerChartSliderDateCaption m-auto"}>
              {props.data.Date[props.maxSliderDateIndex]}
            </div>
          </div>
        </>
        : null
      }
    </>
  );
}

export default Chart