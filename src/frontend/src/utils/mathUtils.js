export function mean(arr) {
    // mean of an array of values
    return arr.reduce((a, b) => a + b) / arr.length;
}

export function scale(x, min_x, max_x, min_y=0, max_y=1) {
    // scale a value, x, between min_x and max_x
    if (min_x === max_x){return min_y}
    else {return ((x - min_x) / (max_x - min_x)) * (max_y - min_y) + min_y}
}