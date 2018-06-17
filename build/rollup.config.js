'use strict'

const path    = require('path')
const babel   = require('rollup-plugin-babel')

const pkg     = require(path.resolve(__dirname, '../package.json'))
const year    = new Date().getFullYear()

let presets = [
  [
      "@babel/env",
      {
          loose: true,
          modules: false,
          targets: {
              browsers: [
                  "chrome  >= 45", "Firefox >= 38", "Explorer >= 10", "edge >= 12", "iOS >= 9","Safari >= 9","Android >= 4.4","Opera >= 30"]
          },
          debug: true
      }
  ]
];

let fileDest  = 'BsMultiSelect.js';
let external  = ['jquery', 'popper.js'];
let globals   = {'jquery': 'jQuery', 'popper.js': 'Popper'};

// NOTE: with Babel 7 babel helpers are managed in .babelrc
const plugins = [
  babel({
    exclude: 'node_modules/**',
    presets: presets
  })]

module.exports = {
  input: path.resolve(__dirname, '../js/src/BsMultiSelect.js'),
  output: {
    banner: `/*!
  * DashboardCode BsMultiSelect v${pkg.version} (${pkg.homepage})
  * Copyright 2017-${year} ${pkg.author}
  * Licensed under APACHE 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */`,
    file: path.resolve(__dirname, `../dist/js/${fileDest}`),
    format: 'umd',
    globals,
    name: 'BsMultiSelect'
  },
  external,
  plugins
}
