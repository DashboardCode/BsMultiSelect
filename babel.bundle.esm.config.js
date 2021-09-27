module.exports = {
    //retainLines: true,
    "presets": [
        [
            "@babel/preset-env",
            {
                "loose": true, // ES6 to ES5
                "bugfixes": true,
                // "useBuiltIns": "usage",
                "modules": false,
                "exclude": ["transform-typeof-symbol"],
                "targets": {
                    "browsers": [
                        "chrome  >= 45", "Firefox >= 38", "Explorer >= 10", "edge >= 12", "iOS >= 9","Safari >= 9","Android >= 4.4","Opera >= 30"
                    ]
                },
                "debug": true
            }
        ]
    ]
}