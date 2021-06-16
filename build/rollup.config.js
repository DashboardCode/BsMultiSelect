'use strict'

const path    = require('path')
const { babel } = require('@rollup/plugin-babel')
const banner = require('./banner.js')

const isEsm   = process.env.ESM === 'true'
const isBS4 = process.env.BS4  === 'true'


let bundleName = process.env.ALT;
if (!bundleName) 
   bundleName ='BsMultiSelect';
if (isBS4)
   bundleName +=".bs4";

let fileDest  = `${bundleName}${isEsm ? '.esm' : ''}.js`;
let external  = isBS4? ['jquery', 'popper.js']:[ '@popperjs/core'];
let globals   = isBS4? {'jquery': 'jQuery', 'popper.js': 'Popper'} :{'@popperjs/core': 'Popper'};

// NOTE: with Babel 7 babel helpers are managed in .babelrc
const plugins = [
  babel({
    // Only transpile our source code
    exclude: 'node_modules/**',
    babelHelpers: 'bundled'
  })]

module.exports = {
  input: path.resolve(__dirname, `../js/src/${bundleName}${isEsm ? '.esm' : '.jquery'}.js`),
  output: {
    banner,
    file: path.resolve(__dirname, `../dist/js/${fileDest}`),
    format: isEsm ? 'esm' :'umd',
    globals,
    name: bundleName
  },
  external,
  plugins
}

if (!isEsm) {
  module.exports.output.name = 'dashboardcode'
}