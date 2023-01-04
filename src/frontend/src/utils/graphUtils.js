import { isNullOrUndef } from 'chart.js/helpers'
import { formatNumber } from './resultsUtils.js';
import moment from 'moment';
import chroma from 'chroma-js';

export function createChartData(data, investmentData){
    // Formats the data for Chart.js using the data and investmentData.
    const graphData = {
        labels: data["Date"],
        datasets: [
            {
                type: "line",
                label: "Price",
                data: data["Open"],
                fill: true,
                pointRadius: 0,
                backgroundColor: "rgba(255,0,0,1)",
                borderColor: "rgba(255,0,0,1)",
                order: 1
            },
            {
                type: "bubble",
                label: "Investment",
                data: investmentData,
                pointRadius: 2,
                borderColor: "rgba(0,0,0,0)",
                backgroundColor: "rgba(0,0,0,1)",
                order: 0
            }
        ]
    };
    return graphData
}

export function createChartOptions(currency, investmentData, setMinSliderDateIndex, setMaxSliderDateIndex){
    // Creates the options for Chart.js, including the tooltips, zoom and formats axis labels.
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        animation: {
            duration: 0
        },
        plugins: {
            zoom: {
                zoom: {
                    drag: {
                        enabled: true,
                    },
                    mode: 'x',
                    onZoom: function(chart){
                        setMinSliderDateIndex(chart.chart.scales.x.min)
                        setMaxSliderDateIndex(chart.chart.scales.x.max)
                    }
                }
            },
            tooltip: {
                callbacks: {
                    title: function(tooltipItems) {
                        if (tooltipItems.length > 0) {
                            const item = tooltipItems[0];
                            const labels = item.chart.data.labels;
                            const labelCount = labels ? labels.length : 0;
                            
                            if (this && this.options && this.options.mode === 'dataset') {
                                return item.dataset.label || '';
                            } else if (item.label) {
                                if (item.label === "Investment") {
                                    return item.raw.x
                                } else {
                                    return item.label;
                                }
                            } else if (labelCount > 0 && item.dataIndex < labelCount) {
                                return labels[item.dataIndex];
                            }
                        }
                    
                        return '';
                    },
                    label: function(tooltipItem){
                        let label = tooltipItem.dataset.label || '';
                        let investment = false;

                        if (label) {
                            if (label === "Investment") {investment = true}
                            label += ': ';
                            label += currency;
                        }

                        let value;
                        if (investment) {
                            value = formatNumber(investmentData[tooltipItem.raw.x]);
                        }
                        else {
                            value = formatNumber(tooltipItem.formattedValue);
                        }

                        if (!isNullOrUndef(value)) {
                            label += value;
                        }

                        return label;
                   }
                }
            }
        }
    };
};

function createDataset(data, strategy, item, color){
    // Creates a Chart.js dataset from data and item, assigning a label (strategy) and color.
    return {
        type: "scatter",
        label: strategy,
        data: createData(data, item),
        line: true,
        pointRadius: 0,
        backgroundColor: color,
        borderColor: color,
    }
}

function createData (data, item) {
    // Formats the data for Chart.js, taking care of dates.
    let outData = [];
    for (let i=0; i < data.Date.length; i++) {
        outData.push({"x": moment(data.Date[i]), "y": data[item][i]})
    }
    return outData;
}

export function createComparisonChartData(data, item){
    // Formats all the comparison data for Chart.js.
    let datasets = []
    let colors = chroma.scale('Set1').domain([0, 9]);
    let colorId = 0;
    for (const [strategy, data_i] of Object.entries(data)) {
        datasets.push(createDataset(data_i.data, strategy, item, colors(colorId).hex()))
        colorId += 1
    }

    const graphData = {
        datasets: datasets
    };
    return graphData
}

export function createComparisonChartOptions(currency, title, dateRange){
    // Creates the options for the comparison chart for Chart.js including the ticks, title and tooltips.
    return {
        responsive: true,
        maintainAspectRatio: false,
        showLine: true,
        scales: {
            x: {
                min: dateRange[0],
                max: dateRange[1],
                ticks: {
                    callback: function(val, index) {
                        return moment(val).format("YYYY-MM-DD")
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        animation: {
            duration: 0
        },
        plugins: {
            title: {
                display: true,
                text: title
            },
            tooltip: {
                callbacks: {
                    title: function(tooltipItems) {
                        return tooltipItems[0].raw.x.format("YYYY-MM-DD");
                    },
                    label: function(tooltipItem){
                        let label = tooltipItem.dataset.label || '';

                        if (label) {
                            label += ': ';

                            // Add currency to front of label, unless it's a percentage (add at end)
                            if (currency !== "%"){
                                label += currency;
                            }
                        }

                        let value;
                        value = formatNumber(tooltipItem.formattedValue);

                        if (!isNullOrUndef(value)) {
                            label += value;
                        }

                        // Add percentage at end, if that's currency
                        if (currency === "%"){
                            label += currency;
                        }

                        return label;
                   }
                }
            }
        }
    };
};