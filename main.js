// 获取目录
const {resolve} = require('path')

var fileBase = resolve('./')
console.log(fileBase)
module.exports = {
    temp:`${fileBase}/example/assets/temp`,
    file:`${fileBase}/example/assets/file`,
    fileBase,
}


// 启动web服务
require('./server');

// 启动service服务
require('./example/service/ajax/node/index')