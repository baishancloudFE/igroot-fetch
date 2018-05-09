'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RESTful = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 默认 HTTP 错误处理
function handleErrors(response) {
  if (!!response.data.code && response.data.code !== 0) {
    throw new Error('Invalid status: ' + response);
  } else if (!!response.code && response.code !== 0) {
    throw new Error('Invalid status: ' + response);
  }
}

var RESTful = exports.RESTful = function RESTful(url, config) {
  var rest = _axios2.default.create(_extends({
    baseURL: url
  }, config));
  var handleHttpErrors = config.handleHttpErrors || handleErrors;

  // http request 拦截器
  rest.interceptors.request.use(function (config) {
    var needAuth = typeof config.needAuth === 'boolean' ? config.needAuth : true;
    if (needAuth) {
      var token = JSON.parse(window.localStorage['jwtToken']);
      // 判断是否存在token，如果存在的话，则每个http header都加上token
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
    }
    return config;
  }, function (err) {
    return Promise.reject(err);
  });

  // http response 拦截器
  rest.interceptors.response.use(function (response) {
    handleHttpErrors(response);
    return response;
  }, function (err) {
    return Promise.reject(err);
  });

  // console.log(axios)

  return rest;
};