'use strict'

const path    = require('path')
const babel   = require('rollup-plugin-babel')

const pkg     = require(path.resolve(__dirname, '../package.json'))
const year    = new Date().getFullYear()
const isEsm   = process.env.ESM === 'true'

// let presets = [
//   [
//       "@babel/env",
//       {
//           loose: true,
//           modules: false,
//           targets: {
//               browsers: [
//                   "chrome  >= 45", "Firefox >= 38", "Explorer >= 10", "edge >= 12", "iOS >= 9","Safari >= 9","Android >= 4.4","Opera >= 30"]
//           },
//           debug: true
//       }
//   ]
// ];

let bundleName = process.env.ALT;
if (!bundleName) 
   bundleName ='BsMultiSelect';

let fileDest  = `${bundleName}${isEsm ? '.esm' : ''}.js`;
let external  = ['jquery', 'popper.js'];
let globals   = {'jquery': 'jQuery', 'popper.js': 'Popper'};

// NOTE: with Babel 7 babel helpers are managed in .babelrc
const plugins = [
  babel({
    exclude: 'node_modules/**'//,
    //presets: presets
  })]

module.exports = {
  input: path.resolve(__dirname, `../js/src/${bundleName}${isEsm ? '.esm' : '.jquery'}.js`),
  output: {
    banner: `/*!
  * DashboardCode ${bundleName} v${pkg.version} (${pkg.homepage})
  * Copyright 2017-${year} ${pkg.author}
  * Licensed under APACHE 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */`,
    file: path.resolve(__dirname, `../dist/js/${fileDest}`),
    format: isEsm ? 'esm' :'umd',
    globals,
    name: bundleName
  },
  external,
  plugins
}

if (!isEsm) {
  module.exports.output.name = bundleName
}