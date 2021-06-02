'use strict'

const npmPackageData = require('../package.json')

function getBanner(subname) {
  const year    = new Date().getFullYear()
  return `/*!
  * BsMultiSelect${subname ? ` ${subname}`: ''} v${npmPackageData.version} (${npmPackageData.homepage})
  * Copyright 2017-${year} ${npmPackageData.author}
  * Licensed under Apache 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */`
}

module.exports = getBanner