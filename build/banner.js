'use strict'

const npmPackageData = require('../package.json')

function getBanner(subname) {
  return `/*!
  * BsMultiSelect${subname ? ` ${subname}`: ''} v${npmPackageData.version} (${npmPackageData.homepage})
  * Licensed under Apache License (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */`
}

module.exports = getBanner