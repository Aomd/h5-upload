// ajax上传
// websock上传

class fileUpload {
  constructor(option) {
    this._event = {
      // 文件开始上传
      'start': [],
      // 文件上传经度
      'pause': [],
      // 文件上传完毕
      'end': [],
      // 进度
      'progress': [],
      // 错误
      'error': [],
      'change':[]

    }
    // 待上传文件列表
    this._fileList = []

    this._action = {
      file: null,
      // 当前第几个分片
      current_chunk: 0,
      // 总分片
      totol_chunk: 0,
      // 上传状态
      status: false
    }
    this._updataConfig = {
      sock: null,
      xhr: null
    }
    // 配置
    this._config = {

      type: option && option.type || 'sock',

      // dom: document.getElementById(option && option.id || ''),

      // 分片大小kb
      size: option && option.size || 1024,
      url: option && option.url || ''
    }

  }

  /**
   * 上传
   *
   * @memberof fileUpload
   */
  async _updata() {
    if (this._action.status) {

      // 计算起始位置
      var fileStart = (this._action.current_chunk - 1) * this._config.size * 1024

      // 计算结束位置
      var fileEnd = (this._action.current_chunk) * this._config.size * 1024

      var file = this._action.file

      var blob = file.slice(fileStart, fileEnd);

      // 数据格式end-------------------------------------------------
      var context = new Blob([
        // 头部 16字节-------------------------------------------------
        blob.size.toString().padStart(16, '0'),
        // 自定义数据 大小未知
        JSON.stringify({
          extname: file.name.substr((file.name.lastIndexOf('.') + 1), file.name.length),
          // 文件唯一key 格式：
          // 最后修改时间 + 字节大小
          key: '' + file.lastModified + file.size,
          // 文件原始name
          name: file.name,
          // 当前块
          current_chunk: this._action.current_chunk,
          // 总块
          totol_chunk: this._action.totol_chunk,
        }),
        //  数据体 大小 为头部大小 单位字节-------------------------------------------------
        blob
      ], {
        type: 'application/octet-stream'
      })
      // 数据格式end-------------------------------------------------


      if (this._config.type === 'ajax') {
        this._xhrUpdata(await context.arrayBuffer());
      } else if (this._config.type === 'sock') {
        this._sockUpdata(await context.arrayBuffer());
      }
    } else {

      return false;
    }
  }

  /**
   *
   *
   * @memberof fileUpload
   */
  _sockUpdata(data) {
    if (!this._updataConfig.sock) {
      this._updataConfig.sock = new WebSocket(this._config.url);

      this._updataConfig.sock.onopen = () => {
        this._sockUpdata(data)
      }
      return false;
    }
    this._updataConfig.sock.send(data)
    // this._updataConfig.sock.send('data')
    this._updataConfig.sock.onmessage = (e) => {
      var data = JSON.parse(e.data);
      if ('success' in data) {
        this._compute(data['success'], 'success')
      } else if ('progress' in data) {
        this._compute(data['progress'], 'progress')
      }
    }
  }

    /**
   *
   *
   * @memberof fileUpload
   */
  _xhrUpdata(data) {
    var _this = this;
    if (!this._updataConfig.xhr) {
      this._updataConfig.xhr = new XMLHttpRequest();

      this._updataConfig.xhr.addEventListener('loadend', function () {
        var data = this.response
        if (_this._updataConfig.xhr.status === 200 && this.readyState == 4) {
          if(data){
            if(typeof(data) === 'string'){
              data = JSON.parse(data);
            }
            _this._compute(data, data.type);
          }
        } else {
          _this._action.status = false;
          throw new Error(`this url ${_this._config.url} is status ${_this._updataConfig.xhr.status}`);
        }
  
      })
    }
    // 设置响应头为json
    if(this._updataConfig.xhr.responseType != 'json'){
      this._updataConfig.xhr.responseType = 'json'
    }
    this._updataConfig.xhr.open('post', this._config.url, true)
    // 设置请求头为二进制流
    this._updataConfig.xhr.setRequestHeader('Content-Type', "application/octet-stream");
    this._updataConfig.xhr.send(data)


  }

  /**
   * 返回计算
   *
   * @memberof fileUpload
   */
  _compute(data, type) {
    if (type == 'progress' && data.current_chunk != data.totol_chunk) {

      // 分片指针++
      this._action.current_chunk = data.current_chunk + 1

      // 出发进度事件
      for (let fun of this._event['progress']) {
        fun(this._action, this._fileList, ((data.current_chunk / data.totol_chunk) * 100))
      }

      // 调用上传函数
      this._updata()

    } else if (type == 'success' && data.current_chunk == data.totol_chunk) {
      // 触发进度事件 调整值至百分百
      for (let fun of this._event['progress']) {
        fun(this._action, this._fileList, 100)
      }
      // 触发结束事件
      for (let fun of this._event['end']) {
        fun(this._action, this._fileList)
      }
      // 删除当前action file
      this._action.file = null;
      // 删除filelist[0]
      this._fileList.shift();
      // 改变当前文件为false
      this._action.status = false;

      // 从新检查准备状态
      this._checkAction()
    }
  }

  /**
   *查看待上传
   *
   * @memberof fileUpload
   */
  _checkAction() {
    // 判断文件是否存在
    if (this._action.file) {
      this._updata()

    } else if (this._fileList.length > 0) {
      // 上传状态 为true
      this._action.status = true;

      // 计算总分片
      this._ready(this._fileList[0])

      this._updata()
    }
  }

  /**
   * 准备初始化数据
   *
   * @memberof fileUpload
   */
  _ready(file) {
    // 计算分片
    var size = file.size;
    var totol = Math.ceil(size / this._config.size / 1024);
    // 赋值 初始化
    this._action.file = file;
    this._action.current_chunk = 1;
    this._action.totol_chunk = totol;
  }
  /**
   * 检查filelist
   *
   * @memberof fileUpload
   */
  _checkFileList() {
    if (this._fileList.length > 0) {
      this._checkAction()
    } else {
      for (var fun of this._event['error']) {
        fun('上传文件列表为空')
      }
      this._action.status = false;
    }
  }

  /**
   * 开始执行
   *
   * @memberof fileUpload
   */
  _done() {
      this._checkFileList();
  }

  /**
   * 点击开始
   *
   * @memberof fileUpload
   */
  start() {
    if(!this._action.status){
      this._action.status = true;

      this._done()
  
      for (var fun of this._event['start']) {
        fun(this._action, this._fileList)
      }
    }
    
  }
  /**
   * 暂停
   *
   * @memberof fileUpload
   */
  pause() {
    if(this._action.status){
      this._action.status = false;

      for (var fun of this._event['pause']) {
        fun(this._action, this._fileList)
      }
    }
  }

  /**
   * 监听
   *
   * @param {*} name
   * @param {*} fun
   * @memberof fileUpload
   */
  on(name, fun) {
    if (name in this._event) {
      this._event[name].push(fun);
    }
  }

  /**
   * 配置
   *
   * @param {*} option
   * @memberof fileUpload
   */
  config(option) {
    for (var item in this._config) {
      if (item in option) {
        this._config[item] = option[item]
      }
    }

  }


  /**
   * 添加file
   *
   * @param {*} file
   * @memberof fileUpload
   */
  addfile(file) {
    this._fileList.push(file);
    
    for (var fun of this._event['change']) {
      fun(file, this._fileList)
    }
  }

}

export {
  fileUpload
}