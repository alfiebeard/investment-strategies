export function prepareAllStrategies(obj) {
    // Take an object of all strategies and additional parameters and reformat to add a readable name and the additional parameters.
    // obj = {"strategy1": [{"default": 3, "label": "Down periods", "name": "number_down_periods", "type": "integer"}],
    //        "strategy2": [{"default": 3, "label": "Search range", "name": "search_range","type": "integer"}]}
    // Returns {"strategy1": {"additionalParameters": [{"default": 3, "label": "Down periods", "name": "number_down_periods", "type": "integer"}], "name": "Strategy 1"},
    //          "strategy2": {"additionalParameters": [{"default": 3, "label": "Search range", "name": "search_range", "type": "integer"}]}}
    
    var objWithName = {}

    Object.keys(obj).forEach(function (key) {
        var dataObj = {}
        dataObj.additionalParameters = obj[key]

        const name = key.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
        dataObj.name = name
        objWithName[key] = dataObj;
    });

    return objWithName
}

export function splitArrayIntoColumns(array, numCols=2) {
    // Split an array of objects across numCols columns, e.g., if 5 items, split into 3 and 2.
    // array = [{"default": 4, "label": "V Threshold", "name": "velocity_threshold", "type": "number"}, 
    // {"default": 0.01,"label": "P Threshold", "name": "power_threshold", "type": "number"}]
    // Returns [[{"default": 4, "label": "V Threshold", "name": "velocity_threshold", "type": "number"},
    //           {"default": 0.01, "label": "P Threshold", "name": "power_threshold", "type": "number"}]]
    var splitArray = []
    for (let i = 0; i < array.length; i += numCols) {
        splitArray.push(array.slice(i, i + numCols));
    }
    return splitArray
}


export function parseAdditionalParameters(form, parameterInfo) {
    // Parse additional parameters in a single or set of strategies, i.e., ensure each additional parameter matches it's type.

    // Loop through each strategy in form and parse the additional parameters according to their type.
    for (const strategy of Object.values(form)) {
        // Loop through each of the additional parameters
        const additionalParameters = parameterInfo[strategy["strategy"]]["additionalParameters"]
        for (const additionalParameter of additionalParameters) {
            // Parse the form values according to their type
            if (additionalParameter["type"] === "integer") {
                strategy[additionalParameter["name"]] = parseInt(strategy[additionalParameter["name"]])
            }
            else if (additionalParameter["type"] === "number") {
                strategy[additionalParameter["name"]] = parseFloat(strategy[additionalParameter["name"]])
            }
        }
    }
    return form
}