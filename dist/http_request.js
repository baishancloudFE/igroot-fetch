'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * HTTP 请求高阶函数
 */
var request = function request(method) {
  return function (url, data) {
    var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var fetchObj = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    // 默认的传输格式为 JSON
    var body = !!data ? JSON.stringify(data) : undefined;

    return fetch(url, _extends({
      method: method,
      body: body,
      credentials: 'omit',
      mode: 'cors',
      headers: headers
    }, fetchObj));
  };
};

var httpRequest = exports.httpRequest = {
  /**
   * GET 请求
   * @param {String}      url
   * @param {Object = {}} data     查询参数
   * @param {Object = {}} headers  请求头对象
   * @param {Object = {}} fetchObj fetch参数对象
   */
  get: function get(url) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var fetchObj = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var keys = Object.keys(data);
    var params = keys.length !== 0 ? '?' + keys.map(function (key) {
      return key + '=' + data[key];
    }).join('&') : '';

    return fetch('' + url + params, _extends({
      method: 'GET',
      credentials: 'omit',
      mode: 'cors',
      headers: headers
    }, fetchObj));
  },


  patch: request('PATCH'),
  post: request('POST'),
  put: request('PUT'),
  delete: request('DELETE')
};