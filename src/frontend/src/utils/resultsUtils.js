import chroma from 'chroma-js';

export function formatNumber(x) {
    // If x is a string, parse it as a float.
    if (typeof x === 'string' || x instanceof String) {
        x = parseFloat(x.replaceAll(',', ''))  // Remove comma's from string, else treated as decimal separator.
    }
    // To 2 d.p and comma separated.
    return (Math.round(x * 100) / 100).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})
}

export function color(x, summary, reverse=false) {
    // Get the colour for a value, x, from an array of values, summary.
    // x = 1900
    // summary = [1900, 12000]
    // Returns a color
    let colourScale = ['#F1948A', '#FAFA33', '#58D68D'];
    
    // If min=max, then return transparent - as no scale
    if (summary[0] === summary[1]) {
        return 'transparent'
    }
    else {
        var scale;
        if (reverse) {
            scale = chroma.scale(colourScale.reverse()).domain([summary[0], summary[1]]);
        }
        else {
            scale = chroma.scale(colourScale).domain([summary[0], summary[1]]);
        }
        
        return scale(x)
    }
}