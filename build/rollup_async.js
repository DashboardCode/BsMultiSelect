'use strict'

// alternative building method, saved as important sample
const rollup = require('rollup')

const path    = require('path')
const { babel} = require('@rollup/plugin-babel')
const banner = require('./banner.js')

const isEsm = process.env.ESM === 'true'
const isEcmaScript5 = process.env.ECMA5 === 'true'
const isBS4 = process.env.BS4  === 'true'
const isMJS = process.env.MJS === 'true'

let bundleName = process.env.ALT;
if (!bundleName) 
    bundleName ='BsMultiSelect';
if (isBS4)
    bundleName +=".bs4";

let inputFile = isMJS?'index.js':`${bundleName}${isEsm ? '.esm' : '.jquery'}.js`;
let external  = isBS4? ['jquery', 'popper.js']:['@popperjs/core'];
let globals   = isBS4? {'jquery': 'jQuery', 'popper.js': 'Popper'} : {'@popperjs/core': 'Popper'};
    
let fileDest  = `${bundleName}${ isMJS? ( isEcmaScript5?'.ecma5.mjs': '.mjs' ) : ( isEsm ? '.esm.js':'.js')}`
let fileConfig= `babel.${isMJS?('mjs'+(isEcmaScript5 ?'.ecma5':'')):('bundle'+(isEsm?'.esm':'.umd') )}.config.js`

console.log({isEsm, isEcmaScript5, isBS4, isMJS, fileDest, fileConfig})

// NOTE: with Babel 7 babel helpers are managed in .babelrc
const rollupPlugins = [
  babel({
    // Only transpile our source code
    exclude: 'node_modules/**',
    babelHelpers: isMJS?undefined:'bundled',
    configFile: './'+fileConfig
  })];

const rollupInput = path.resolve(__dirname, `../src/${inputFile}`);

const rollupOutput = {
  banner,
  file: path.resolve(__dirname, `../dist/js/${fileDest}`),
  format: isEsm || isMJS  ? 'esm' : 'umd',
  globals,
  name: isEsm || isMJS ? bundleName: 'dashboardcode',
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