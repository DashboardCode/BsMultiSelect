'use strict'

const rollup = require('rollup')
const { babel } = require('@rollup/plugin-babel')
const path = require('path')
const banner = require('./banner.js')

const rootPath = path.resolve(__dirname, '../js/dist/plugins')
const rollupPlugins = [
  babel({
    // Only transpile our source code
    exclude: 'node_modules/**',
    // Include the helpers in each file, at most one copy of each
    babelHelpers: 'bundled'
  })
]
const bsPlugins = {
  FormResetPlugin:   path.resolve(__dirname, '../js/src/plugins/FormResetPlugin.js'),
  PlaceholderPlugin: path.resolve(__dirname, '../js/src/plugins/PlaceholderPlugin.js'),
}

function getConfigByPluginKey (pluginKey) {
  if (
    pluginKey === 'FormResetPlugin' ||
    pluginKey === 'PlaceholderPlugin' 
  ) {
    return { external: [], globals: undefined}
  }
}

const build = async plugin => {
  console.log(`Building ${plugin} plugin...`)

  const { external, globals } = getConfigByPluginKey(plugin)
  const pluginFilename = path.basename(bsPlugins[plugin])
  let pluginPath = rootPath

  const bundle = await rollup.rollup({
    input: bsPlugins[plugin],
    plugins: rollupPlugins,
    external
  })

  await bundle.write({
    banner: banner(pluginFilename),
    format: 'umd',
    name: plugin,
    sourcemap: true,
    globals,
    file: path.resolve(__dirname, `${pluginPath}/${pluginFilename}`)
  })

  console.log(`Building ${plugin} plugin... Done!`)
}

const main = async () => {
  try {
    await Promise.all(Object.keys(bsPlugins).map(plugin => build(plugin)))
  } catch (error) {
    console.error(error)

    process.exit(1)
  }
}

main()