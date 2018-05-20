'use strict'

const path    = require('path')
const babel   = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')

const pkg     = require(path.resolve(__dirname, '../package.json'))
const BUNDLE  = process.env.BUNDLE === 'true'
const year    = new Date().getFullYear()

const plugins = [
babel({
  exclude: 'node_modules/**',  // Only transpile our source code
  //   externalHelpersWhitelist: [ // Include only required helpers
  //      'defineProperties',
  //      'toConsumableArray',
  //      'createClass',
  //      'classCallCheck',
  //      'defineProperty',
  //      'typeof',
  //      'arrayWithoutHoles',
  //      'iterableToArray'
  //   ]
})
]

let fileDest  = "";
let external  = [];
let globals  = [];
if (BUNDLE) {
  fileDest = 'BsMultiSelect.bundle.js'
  external = ['jquery']
  globals = {'jquery': 'jQuery'}
  plugins.push(resolve())
}else{
  fileDest  = 'BsMultiSelect.js';
  external = ['jquery', 'popper.js'];
  globals = {'jquery': 'jQuery', 'popper.js': 'Popper'}
}

module.exports = {
  input: path.resolve(__dirname, '../js/src/BsMultiSelect.es8.js'),
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