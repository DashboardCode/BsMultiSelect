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
                        // where "script module" is possoble
                        "chrome  >= 61", "Firefox >= 60", "edge >= 16", "iOS >= 10.3","Safari >= 10.1","Android >= 93","Opera >= 48"
                    ]
                },
                "debug": true
            }
        ]
    ]
}