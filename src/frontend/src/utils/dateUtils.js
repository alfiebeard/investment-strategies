import moment from 'moment';


export function getMaxDateRange(data, item) {
    // Get the max date range from a set of strategies, each with a sub-property of Date (or item).
    // data = {"strategy1": {"data": {"Date": ["01-01-2023", ...], "Open": [1, ...]}}, 
    //         "strategy2": {"data": {"Date": ["01-01-2023", ...], "Open": [1, ...]}}}}
    // item = "Date"
    // Returns range = max date range across all dates in strategy.

    let range = [null, null]
    for (const [strategy, data_i] of Object.entries(data)) {
        // convert to moments
        let momentDates = data_i.data[item].map(d => moment(d))
        let minValue = moment.min(momentDates);
        let maxValue = moment.max(momentDates);

        // If range is null - set min/max values.
        if (range[0] === null) {
            range[0] = minValue
        }
        if (range[1] === null) {
            range[1] = maxValue
        }

        // Update min/max values if new values are more extreme.
        if (range[0].isAfter(minValue)) {
            range[0] = minValue
        }
        if (range[1].isBefore(maxValue)) {
            range[1] = maxValue
        }        
    }

    return range.map(d => d.unix() * 1000)
}

export function convertDays(x) {
    // Convert a number of days to year, months, weeks, days.
    const years = Math.floor(x / 365.2425);
    const months = Math.floor((x - (365.2425 * years)) / 30.437);
    const weeks = Math.floor((x - (365.2425 * years) - (30.437 * months)) / 7);
    const days = Math.round((x - (365.2425 * years) - (30.437 * months) - (4 * weeks)));
    
    if (years > 0) {return `${years}Y ${months}M`}
    else if (months > 0) {return `${months}M ${weeks}W`}
    else if (weeks > 0) {return `${weeks}W ${days}D`}
    else {return `${days}D`}
};

export function subtractDays(date, days=1) {
    // Subtract a set number of days from a date
    return moment(date).subtract(days, "days").format("YYYY-MM-DD");
}