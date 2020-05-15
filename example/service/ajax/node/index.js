//@ts-check
var http = require('http');
var fs = require('fs');
var path = require('path');
var fileBase = require('../../../../main');

http.createServer(function (req, res) {
  // 解决跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // 定义了一个post变量，用于暂存请求体的信息
  let bufferArray = []

  // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
  req.on('data', function (chunk) {
    // post += chunk;
    bufferArray.push(chunk)
  });

  // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
  req.on('end', function () {
    // post = querystring.parse(post);
    // console.log(JSON.stringify(post))
    const buffer = Buffer.concat(bufferArray)

    var data = new Uint8Array(buffer)

    // 解决 预请求 (最优解决方法是判断请求头信息)
    if (data.length > 0) {

      var entity = new uploadEntity(data)

      if (entity.parameter.current_chunk < entity.parameter.totol_chunk) {
        entity.parameter['type'] = 'progress'


        // 写文件
        fs.writeFile(`${fileBase.temp}/${entity.parameter.extname}-${entity.parameter.key}-${entity.parameter.current_chunk}.temp`, entity.data, { 'flag': 'w' }, function (err) {
          if (err) {
            throw err;
          }
          res.end(JSON.stringify(entity.parameter));
        });

      } else if (entity.parameter.current_chunk = entity.parameter.totol_chunk) {
        entity.parameter['type'] = 'success'


        // 写文件
        fs.writeFile(`${fileBase.temp}/${entity.parameter.extname}-${entity.parameter.key}-${entity.parameter.current_chunk}.temp`, entity.data, { 'flag': 'w' }, function (err) {
          if (err) {
            throw err;
          }
          res.end(JSON.stringify(entity.parameter));

          // 合并文件
          concatFile(fileBase, entity)
        });
      }


      // // 方便打印
      // entity.parameter = JSON.stringify(entity.parameter)

      // // 打印日志
      // console.log(entity.parameter)

    } else {
      res.statusCode = 200;
      res.end('ok');
    }
  });
}).listen(3000);
console.log('node service 服务启动成功 端口 3000')
// 合并文件
function concatFile(fileBase, entity) {
  // 有文件就删除
  fs.unlink(`${fileBase.file}/${entity.parameter.key}.${entity.parameter.extname}`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('delete ok');
    }
  });

  // 获取temp文件夹
  fs.readdir(fileBase.temp, function (err, files) {
    if (err) {
      console.log(err);
      return;
    }
    // 循环所有块
    forWrite(1, entity, files)

  });
}

// 递归写文件
function forWrite(start, entity, files) {
  var temp_name = `${entity.parameter.extname}-${entity.parameter.key}-${start}.temp`
  // 匹配就读
  if (files.includes(temp_name)) {

    var data = fs.readFileSync(`${fileBase.temp}/${temp_name}`);
    // 写入file
    fs.writeFile(`${fileBase.file}/${entity.parameter.key}.${entity.parameter.extname}`, data, { 'flag': 'a' }, function (err) {
      if (err) {
        throw err;
      }
      if (start < entity.parameter.totol_chunk) {
        start += 1;
        forWrite(start, entity, files)
      } else {
        delTemp(files, entity)
      }
    })
  }
}

// 删除零时文件
function delTemp(files, entity) {
  var temp_name = `${entity.parameter.extname}-${entity.parameter.key}`
  for (let name of files) {
    if (name.includes(temp_name)) {
      fs.unlink(`${fileBase.temp}/${name}`, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(name +'  delete ok');
        }
      })
    }
  }
}

class uploadEntity {
  constructor(data) {

    var _header = data.slice(0, 16);
    var _header_buffer = Buffer.from(_header, 'hex');
    var _header_value = +(_header_buffer + '')
    this.header = _header_value;

    var _parameter = data.slice(16, (data.length - _header_value))
    var _parameter_buffer = Buffer.from(_parameter, 'hex');
    var _parameter_value = _parameter_buffer + ''
    try {
      this.parameter = JSON.parse(_parameter_value);
    } catch (error) {
      this.parameter = '';
    }

    var _data = data.slice(data.length - _header_value, data.length);

    var _data_buffer = Buffer.from(_data, 'hex');
    var _data_value = _data_buffer
    this.data = _data_value;
  }
}