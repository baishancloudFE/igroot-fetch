'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Transport = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _transport = require('lokka/transport');

var _transport2 = _interopRequireDefault(_transport);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CancelToken = _axios2.default.CancelToken;

// 默认 HTTP 错误处理: 状态码不为200 的错误
function handleHttpErrors(response) {
  if (response.status && response.status !== 200) {
    throw new Error(response);
  }
}
// 默认 业务 错误处理: code不为0 的错误
function handleErrors(res) {
  if (res.code && res.code !== 0) {
    if (res.msg) {
      // 新后端框架的报错方式{code,data,mag}
      var errText = res.msg || '业务错误!';
      throw new Error(errText);
    } else {
      if (res.errors) {
        // 旧后端框架的报错方式{code,data,errors}
        var message = res.errors[0].message;

        var error = new Error('GraphQL Error: ' + message);
        error.rawError = res.errors;
        error.rawData = res.data;
        throw error;
      }
    }
  }
}
// 默认 网络 错误处理: 网络错误，正式请求没有发出
function handleNetErrors(err) {
  throw new Error('网络错误!');
}
// 请求成功：请求成功后的反馈
function handleSuccess() {}

var defaultOptions = {
  Authorization: '',
  timeout: 1000,
  withCredentials: true, //发送请求时是否携带cookie
  needAuth: true, //需要 Authorization认证信息
  handleHttpErrors: handleHttpErrors,
  handleErrors: handleErrors,
  handleNetErrors: handleNetErrors,
  handleSuccess: handleSuccess

  // 打印调试日志的开关（只有在LocalStorage中把 displayLog 设置为 true 才可以查看日志）
};function log() {
  var displayLog = JSON.parse(localStorage.getItem('displayLog') || false);
  if (displayLog) {
    var _console;

    (_console = console).log.apply(_console, arguments);
  }
}

var Transport = exports.Transport = function (_LokkaTransport) {
  _inherits(Transport, _LokkaTransport);

  function Transport(url) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Transport);

    if (!url) throw new Error('缺少 baseurl!');

    var _this = _possibleConstructorReturn(this, (Transport.__proto__ || Object.getPrototypeOf(Transport)).call(this));

    var newOptions = _extends({}, defaultOptions, options);
    _this.graphqlApi = _axios2.default.create(_extends({
      baseURL: url
    }, newOptions));

    // http request 拦截器
    _this.graphqlApi.interceptors.request.use(function (config) {
      if (newOptions.needAuth) {
        if (newOptions.Authorization) {
          config.headers.Authorization = newOptions.Authorization;
        } else {
          var token = JSON.parse(window.localStorage['jwtToken'] || null);
          // 判断是否存在token，如果存在的话，则每个http header都加上token
          if (token) {
            config.headers.Authorization = 'Bearer ' + token;
          }
        }
      }
      log(config);
      return config;
    }, function (err) {
      return Promise.reject(err);
    });

    // http response 拦截器
    _this.graphqlApi.interceptors.response.use(function (response) {
      var extra = { pagination: {} };

      var res = response.data,
          status = response.status;

      if (status !== 200) {
        newOptions.handleHttpErrors(response);
        return Promise.reject(response);
      } else {
        if (res.code && res.code !== 0) {
          newOptions.handleErrors(res);
          return Promise.reject(res);
        } else {
          // 获取头部分页信息
          Object.keys(response.headers).forEach(function (key) {
            if (key.indexOf('pagination') >= 0) {
              extra.pagination[key] = response.headers[key];
            }
          });
          // end
          newOptions.handleSuccess();
        }
      }

      var result = res;
      if (Object.keys(extra.pagination).length > 0) {
        result = _extends({}, res, extra);
      }

      return result;
    }, function (err) {
      newOptions.handleNetErrors(err);
      return Promise.reject(err);
    });

    _this.cancel = '';
    return _this;
  }

  _createClass(Transport, [{
    key: 'send',
    value: function send(query, variables, operationName) {
      var payload = { query: query, variables: variables, operationName: operationName };

      log('send request', payload);

      var field = this;

      var res = this.graphqlApi.post('', payload, {
        cancelToken: new CancelToken(function executor(c) {
          field.cancel = c;
          log('set cancel token', new Date().toString());
        })
      }).catch(function (thrown) {
        if (_axios2.default.isCancel(thrown)) {
          log('Request canceled', thrown.message);
        } else {
          // handle error
          return Promise.reject(thrown);
        }
      });
      res.cancel = this.cancel;

      return res;
    }
  }]);

  return Transport;
}(_transport2.default);