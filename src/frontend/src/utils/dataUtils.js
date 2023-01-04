import { scale } from './mathUtils.js';

export function filterData(data, startIndex, endIndex){
    // Filter a data object containing many arrays as properties between two indices.
    // data = {"Date": ["01/01/2023", ...], "Open": [1, ...]}
    // startIndex = 2, endIndex=3
    // Returns {"Date": ["03/01/2023", ...], "Open": [3, ...]}

    let filteredData = {}
    for (const [key, value] of Object.entries(data)) {
        filteredData[key] = value.filter((date, i) => {return i >= startIndex && i <= endIndex;});
    }
    return filteredData
}

export function createInvestmentsData(data){
    // create the investments data for a graph, formaing the data and calculating the radius of the circles to show on the chart.
    const minPointRadius = 2;
    const maxPointRadius = 7;

    const min = Math.min(...data.investment.filter(Boolean));   // Remove 0's from min/max calculation
    const max = Math.max(...data.investment.filter(Boolean));

    const indices = Array.from(Array(data.investment.length).keys())
    const investmentIndices = indices.filter(i => data.investment[i] !== 0);

    let investmentData = []
    let investments = {}

    for (let i = 0; i < investmentIndices.length; i++) {
        investmentData.push({"x": data.Date[investmentIndices[i]], "y": data.Open[investmentIndices[i]], "r": scale(data.investment[investmentIndices[i]], min, max, minPointRadius, maxPointRadius)})
        investments[data.Date[investmentIndices[i]]] = data.investment[investmentIndices[i]]
    }
    return {"data": investmentData, "investments": investments}
}