# fileUpload
 * 只提供到api，与ui分离（解耦）
 * 采用二进制流以及[内置协议](#内置协议)实现上传功能 
 * 支持ajax、websocket
 * 支持多文件、分片、断点上传
  
### 内置协议
二进制流格式
* [start-16]      字节 数据体字节大小（记录数据体大小）
* [16-?]          字节 自定义参数格式为json（字节截取后可以转换成json对象）
* [?-end]         字节 数据体 (分片数据体)


## events
| name     |     Parameters      | Description      |
|:---------|:-------------------:|:-----------------|
| start    |     file,files      | 开始事件         |
| pause    |     file,files      | 暂停事件         |
| end      |     file,files      | 当前文件上传结束 |
| progress | file,files,progress | 上传进度         |
| change   |     file,files      | 文件改变         |
| error    |        error        | 错误信息         |


## methods
| name                                              | Description |
|:--------------------------------------------------|:------------|
| start()                                           | 开始事件    |
| pause()                                           | 暂停事件    |
| on([eventname](#events):String, handler:function) | 监听事件    |
| config(option : [option](#option))                | 参数配置    |
| addfile(file:File)                                | 添加文件    |

### option

```
{
  // 上传类型 
  type: 'ajax' || 'sock',
  // 分片大小单位：kb
  size:  1024,
  // 上传服务地址
  url: ''
}
```

## Example 

```
var upload = new fileUpload({
  url:'wss://127.0.0.1:8055/',
  type:'sock',
  // 单位kb
  size: 1024 
});

upload.config({
  url:'http://127.0.0.1:8055/test.php',
  type:'ajax',
});


upload.addfile(new File(["one"], "one.txt", {type: "text/plain",}))

upload.addfile(new File(["two"], "two.txt", {type: "text/plain",}))

...

// 监听
upload.on('progress',function(FileInfo, FileList , progress){
  // code

})

//开始
upload.start()


```

## run demo

```
// node

base:>node ./main
base:>服务成功开启端口为:7096
base:>请访问：http://localhost:7096/example/page/index.html
base:>node service 服务启动成功 端口 3000

```

## 目录结构

```
根目录
├─ example
│  ├─ assets        //文件资源
│  ├─ page          //页面
│  ├─ service       //后台服务
├─ fileUpload.js    //核心
└─ main.js          //node 入口文件
```