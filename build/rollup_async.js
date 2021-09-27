'use strict'

// alternative building method, saved as important sample

const path    = require('path')
const { babel, getBabelOutputPlugin } = require('@rollup/plugin-babel')
const banner = require('./banner.js')
const rollup = require('rollup')

const isEsm = process.env.ESM === 'true'
const isEcmaScript5 = process.env.ECMAS5 === 'true'
const isBS4 = process.env.BS4  === 'true'

console.log({isEsm, isEcmaScript5, isBS4})

let bundleName = process.env.ALT;
if (!bundleName) 
    bundleName ='BsMultiSelect';
if (isBS4)
    bundleName +=".bs4";

let inputFile = !isEcmaScript5?'index.js':`${bundleName}${isEsm ? '.esm' : '.jquery'}.js`;
let external  = isBS4? ['jquery', 'popper.js']:['@popperjs/core'];
let globals   = isBS4? {'jquery': 'jQuery', 'popper.js': 'Popper'} : {'@popperjs/core': 'Popper'};

let fileDest  = `${bundleName}${isEsm ? (isEcmaScript5 ?'.esm.js':'.mjs') : '.js'}`
let fileConfig= `babel.bundle${isEsm ? (isEcmaScript5 ?'.esm':'.mjs') : '.umd'}.config.js`

// NOTE: with Babel 7 babel helpers are managed in .babelrc
const rollupPlugins = [
  babel({
    // Only transpile our source code
    exclude: 'node_modules/**',
    babelHelpers: (!isEcmaScript5)?undefined:'bundled',
    configFile: './'+fileConfig
  })];

const rollupInput = path.resolve(__dirname, `../src/${inputFile}`);

const rollupOutput = {
  banner,
  file: path.resolve(__dirname, `../dist/js/${fileDest}`),
  format: isEsm ? 'esm' : 'umd',
  globals,
  name: (!isEsm)? 'dashboardcode' : bundleName,
  sourcemap: true
};




var rollupExports = { bundle1 : { input: rollupInput, external, plugins: rollupPlugins, output: rollupOutput } }; 

const build = async rollupExportKey => {
  console.log(`Rollup ${rollupExportKey}...`)
  var rollupExport = rollupExports[rollupExportKey];

  const bundle = await rollup.rollup({
    input: rollupExport.input,
    plugins: rollupExport.plugins,
    external: rollupExport.external
  })

  await bundle.write(rollupExport.output);

  console.log(`Rollup ${rollupExportKey} done!`)
}

const main = async () => {
  try {
    await Promise.all(Object.keys(rollupExports).map(key => build(key)))
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

main()