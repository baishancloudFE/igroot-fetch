'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Fetch = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lokka = require('lokka');

var _transport = require('./transport');

var _http_request = require('./http_request');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// URL 完整性校验
var urlRegxp = /^https?:\/\//;

// 域名缓存，避免每次请求都去匹配域名
var defaultDomain = void 0;

// 默认网络错误处理
function handleNetErrors(error) {
  throw error;
}

// 默认 HTTP 错误处理
function handleHttpErrors(response) {
  if (response.code !== 0) throw new Error('Invalid status code: ' + response);
}

function warp(method) {
  return function (data) {
    var _this = this;

    return _http_request.httpRequest.post(this.url, data, this._buildOptions()).then(function (res) {
      return res.json();
    }).then(function (res) {
      _this.handleHttpErrors(res);
      return res;
    }).catch(function (err) {
      return _this.handleNetErrors(err);
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
      this.handleNetErrors = this.configs.handleNetErrors || handleNetErrors;
      this.handleHttpErrors = this.configs.handleHttpErrors || handleHttpErrors;

      return options;
    }

    // 按条件返回对象数组

  }, {
    key: 'get',
    value: function get(data) {
      var _this2 = this;

      return _http_request.httpRequest.get(this.url, data, this._buildOptions()).then(function (res) {
        return res.json();
      }).then(function (res) {
        _this2.handleHttpErrors(res);
        return res;
      }).catch(function (err) {
        return _this2.handleNetErrors(err);
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

// module.exports = Fetch
exports.default = Fetch;