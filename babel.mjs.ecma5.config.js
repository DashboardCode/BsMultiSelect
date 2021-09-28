module.exports = {
  //retainLines: true,
  "presets": [
      [
          "@babel/preset-env",
          {
              "loose": true, // ES6 to EcmaScript5
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


// const BROWSER_COMPAT = process.env.BROWSER_COMPAT === 'true';

// module.exports = {
// //   presets: [
// //     [
// //       '@babel/env',
// //       {
// //         loose: true,
// //         modules: false,
// //       },
// //     ],
// //   ],
//   plugins: [
//     //'@babel/plugin-transform-flow-strip-types',
//     'babel-plugin-add-import-extension',
//     [
//       '@babel/plugin-proposal-object-rest-spread',
//       {
//         loose: true,
//         useBuiltIns: true,
//       },
//     ],
//     ...(BROWSER_COMPAT
//       ? [
//           [
//             'inline-replace-variables',
//             {
//               __DEV__: false,
//             },
//           ],
//         ]
//       : ['dev-expression']),
//     'annotate-pure-calls',
//   ],
//   env: {
//     test: {
//       presets: ['@babel/env'],
//       plugins: ['@babel/plugin-transform-runtime'],
//     },
//     dev: {
//       plugins: [
//         [
//           'transform-inline-environment-variables',
//           {
//             include: ['NODE_ENV'],
//           },
//         ],
//       ],
//     },
//   },
// };