'use strict'

const path    = require('path')
const babel   = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')

const pkg     = require(path.resolve(__dirname, '../package.json'))
const BUNDLE  = process.env.BUNDLE === 'true'
const year    = new Date().getFullYear()

let fileDest  = 'BsMultiSelect.js'
const external = ['jquery', 'popper.js']
const plugins = [
  babel({
    exclude: 'node_modules/**', // Only transpile our source code
     externalHelpersWhitelist: [ // Include only required helpers
       'defineProperties',
       'toConsumableArray',
       'createClass',
       'classCallCheck',
       'defineProperty',
       'typeof',

       'arrayWithoutHoles',
       'iterableToArray'
     ]
  })
]
const globals = {
  jquery: 'jQuery', // Ensure we use jQuery which is always available even in noConflict mode
  'popper.js': 'Popper'
}

if (BUNDLE) {
  fileDest = 'BsMultiSelect.bundle.js'
  // Remove last entry in external array to bundle Popper
  external.pop()
  delete globals['popper.js']
  plugins.push(resolve())
}

module.exports = {
  input: path.resolve(__dirname, '../src/BsMultiSelect.es8.js'),
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