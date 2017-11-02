'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BsFetch = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lokka = require('lokka');

var _transport = require('./transport');

var _http_request = require('./http_request');

var _igroot = require('igroot');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// error 弹出锁, 避免弹出框过多
var errorLock = false;

// function warp(method) {
//   return (data, showSuccessMsg = true) => {
//     return httpRequest[method](this.url, data, {}, {})
//       .then(res => res.json())
//       .then(json => {
//         if (json.code !== 0) {
//           // 弹出提示框
//           if (!errorLock) {
//             errorLock = true
//             setTimeout(() => errorLock = false, 2000)

//             notification.error({
//               message: `请求失败 code: ${json.code}`,
//               description: json.msg ? json.msg : json.message || ''
//             })
//           }
//         } else
//           showSuccessMsg && notification.success({
//             message: '请求成功',
//             description: json.msg ? json.msg : ''
//           })

//         return json
//       })

//       .catch(err => {
//         notification.error({
//           message: '请求失败',
//           description: '错误信息请打开控制台查看'
//         })

//         throw err
//       })
//   }
// }

var RESTful = function () {
  function RESTful(url, configs) {
    _classCallCheck(this, RESTful);

    if (typeof url === 'string') {
      this.url = url;
      this.configs = configs;
    } else {
      throw new TypeError('API object constructor argument must be the object or string');
    }
  }

  // 按条件返回对象数组


  _createClass(RESTful, [{
    key: 'get',
    value: function get(data) {
      return _http_request.httpRequest.get(this.url, data, this.configs.headers, this.configs.fetchObj).then(function (res) {
        return res.json();
      }).then(function (res) {
        if (res.code !== 0) _igroot.notification.error({
          message: '\u8BF7\u6C42\u5931\u8D25 code: ' + res.code,
          description: res.msg ? res.msg : res.message || ''
        });

        return res;
      });
    }
  }, {
    key: 'post',
    value: function post(data) {
      var _this = this;

      return function (data) {
        var showSuccessMsg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        return _http_request.httpRequest.post(_this.url, data, _this.configs.headers, _this.configs.fetchObj).then(function (res) {
          return res.json();
        }).then(function (json) {
          if (json.code !== 0) {
            // 弹出提示框
            if (!errorLock) {
              errorLock = true;
              setTimeout(function () {
                return errorLock = false;
              }, 2000);

              _igroot.notification.error({
                message: '\u8BF7\u6C42\u5931\u8D25 code: ' + json.code,
                description: json.msg ? json.msg : json.message || ''
              });
            }
          } else showSuccessMsg && _igroot.notification.success({
            message: '请求成功',
            description: json.msg ? json.msg : ''
          });

          return json;
        }).catch(function (err) {
          _igroot.notification.error({
            message: '请求失败',
            description: '错误信息请打开控制台查看'
          });

          throw err;
        });
      };
    }
  }, {
    key: 'put',
    value: function put(data) {
      var _this2 = this;

      return function (data) {
        var showSuccessMsg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        return _http_request.httpRequest.put(_this2.url, data, _this2.configs.headers, _this2.configs.fetchObj).then(function (res) {
          return res.json();
        }).then(function (json) {
          if (json.code !== 0) {
            // 弹出提示框
            if (!errorLock) {
              errorLock = true;
              setTimeout(function () {
                return errorLock = false;
              }, 2000);

              _igroot.notification.error({
                message: '\u8BF7\u6C42\u5931\u8D25 code: ' + json.code,
                description: json.msg ? json.msg : json.message || ''
              });
            }
          } else showSuccessMsg && _igroot.notification.success({
            message: '请求成功',
            description: json.msg ? json.msg : ''
          });

          return json;
        }).catch(function (err) {
          _igroot.notification.error({
            message: '请求失败',
            description: '错误信息请打开控制台查看'
          });

          throw err;
        });
      };
    }
  }, {
    key: 'delete',
    value: function _delete(data) {
      var _this3 = this;

      return function (data) {
        var showSuccessMsg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        return _http_request.httpRequest.delete(_this3.url, data, _this3.configs.headers, _this3.configs.fetchObj).then(function (res) {
          return res.json();
        }).then(function (json) {
          if (json.code !== 0) {
            // 弹出提示框
            if (!errorLock) {
              errorLock = true;
              setTimeout(function () {
                return errorLock = false;
              }, 2000);

              _igroot.notification.error({
                message: '\u8BF7\u6C42\u5931\u8D25 code: ' + json.code,
                description: json.msg ? json.msg : json.message || ''
              });
            }
          } else showSuccessMsg && _igroot.notification.success({
            message: '请求成功',
            description: json.msg ? json.msg : ''
          });

          return json;
        }).catch(function (err) {
          _igroot.notification.error({
            message: '请求失败',
            description: '错误信息请打开控制台查看'
          });

          throw err;
        });
      };
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

var BsFetch = exports.BsFetch = function BsFetch(url) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (url.indexOf('graphql') >= 0) return new GraphQL(url, config);
  return new RESTful(url, config);
};

module.exports = BsFetch;