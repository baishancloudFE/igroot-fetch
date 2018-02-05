'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Fetch = undefined;

var _notification5 = require('igroot/lib/notification');

var _notification6 = _interopRequireDefault(_notification5);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('igroot/lib/notification/style/css');

var _lokka = require('lokka');

var _transport = require('./transport');

var _http_request = require('./http_request');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// URL 完整性校验
var urlRegxp = /^https?:\/\//;

// error 弹出锁, 避免弹出框过多
var errorLock = false;

// 域名缓存，避免每次请求都去匹配域名
var defaultDomain = void 0;

function warp(method) {
  return function (data) {
    return _http_request.httpRequest.post(this.url, data, this._buildOptions()).then(function (res) {
      return res.json();
    }).then(function (json) {
      if (json.code !== 0) {
        // 弹出提示框
        if (!errorLock) {
          errorLock = true;
          setTimeout(function () {
            return errorLock = false;
          }, 2000);

          _notification6.default.error({
            message: '\u8BF7\u6C42\u5931\u8D25 code: ' + json.code,
            description: json.msg ? json.msg : json.message || ''
          });
        }
      } else _notification6.default.success({
        message: '请求成功',
        description: json.msg ? json.msg : ''
      });

      return json;
    }).catch(function (err) {
      _notification6.default.error({
        message: '请求失败',
        description: '错误信息请打开控制台查看'
      });

      throw err;
    });
  };
}

var RESTful = function () {
  function RESTful(url, configs) {
    _classCallCheck(this, RESTful);

    if (typeof url === 'string') {
      this.url = url;
      this.configs = configs;

      this.post = warp('post').bind(this);
      this.put = warp('put').bind(this);
      this.delete = warp('delete').bind(this);
    } else {
      throw new TypeError('API object constructor argument must be the object or string');
    }
  }

  _createClass(RESTful, [{
    key: '_buildOptions',
    value: function _buildOptions() {
      // 默认设置
      var options = {};
      this.configs.headers && (options.headers = this.configs.headers);
      this.configs.mode && (options.mode = this.configs.mode);
      this.configs.credentials && (options.credentials = 'include');

      return options;
    }

    // 按条件返回对象数组

  }, {
    key: 'get',
    value: function get(data) {
      return _http_request.httpRequest.get(this.url, data, this._buildOptions()).then(function (res) {
        return res.json();
      }).then(function (res) {
        if (res.code !== 0) _notification6.default.error({
          message: '\u8BF7\u6C42\u5931\u8D25 code: ' + res.code,
          description: res.msg ? res.msg : res.message || ''
        });

        return res;
      });
    }
  }]);

  return RESTful;
}();

var placeholder = '{type}';

// Lokka 工厂
function lokkaFactory(url, options) {
  var client = new _lokka.Lokka({
    transport: new _transport.Transport(url, options)
  });
  return client;
}

// client 处理
function clientHandle(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (url.indexOf(placeholder) === -1) url += '/' + placeholder;

  var mutation = lokkaFactory(url.replace(placeholder, 'mutation'), options);

  delete options.handleSuccess;

  var query = lokkaFactory(url.replace(placeholder, 'query'), options);

  /**
   * 双重作用域变换
   *
   * mutate 方法调用时作用域变换路径:
   *   mutate(query) => _findFragments(query) => fragments(query)
   *   mutate(query) => send(mutation) => _transport(mutation)
   */
  query.mutate = query.mutate.bind(mutation);
  mutation._findFragments = mutation._findFragments.bind(query);

  return query;
}

var GraphQL = function GraphQL(url, client) {
  _classCallCheck(this, GraphQL);

  var type = typeof client === 'undefined' ? 'undefined' : _typeof(client);

  // 无 GraphQL 接口
  if (type === undefined) return;
  return clientHandle(url, client);

  throw new TypeError('GraphQL Client configuration error!');
};

var Fetch = exports.Fetch = function Fetch(url) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  // const token = window.localStorage['JWT_TOKEN'] || window.localStorage['jwtToken'] || ''
  // let _config = {
  //   headers: {
  //     Authorization: `Bearer ${token}`
  //   }
  // }
  // _config = Object.assign({}, _config, config)

  // 如果不是完整的 url 就给它加上域名
  if (!urlRegxp.test(url)) {
    // 判断是否有默认域名缓存，如果没有就拿当前的域名遍历匹配，寻找相应的接口地址
    if (!defaultDomain) {
      var host = window.location.host;

      Object.keys(Fetch.domain).forEach(function (domain) {
        var condition = Fetch.domain[domain];

        if (typeof condition === 'string' && condition === host || condition instanceof RegExp && condition.test(window.location.host)) {
          defaultDomain = domain;
        }
      });

      if (!defaultDomain) throw new Error('Can not match the api domain! Please check your api domain config.');
    }

    url = defaultDomain + url;
  }

  var type = config.type || (url.indexOf('graphql') >= 0 ? 'graphql' : 'restful');
  var API = type === 'graphql' ? GraphQL : RESTful;

  return new API(url, config);
};

Fetch.setDomain = function setDomain(domain) {
  if (typeof domain === 'string') {
    if (urlRegxp.test(domain)) return Fetch.domain = _defineProperty({}, domain, /.*/);

    throw new Error('\'domain\' string must be \'http://\' or \'https://\' at the beginning.');
  }

  if ((typeof domain === 'undefined' ? 'undefined' : _typeof(domain)) === 'object') return Fetch.domain = domain;

  throw new TypeError('\'domain\' type must be a string or object!');
};

module.exports = Fetch;