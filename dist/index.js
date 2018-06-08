'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Fetch = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _graghql = require('./graghql');

var _restful = require('./restful');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// URL 完整性校验
var urlRegxp = /^https?:\/\//;
// 域名缓存，避免每次请求都去匹配域名
var defaultDomain = void 0;

/**
 * Fetch对象
 * @param {*} url 请求地址的host
 * @param {*} config 配置项
 */
var Fetch = exports.Fetch = function Fetch(url) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  // 如果不是完整的 url 就给它加上域名
  if (!urlRegxp.test(url)) {
    // 判断是否有默认域名缓存，如果没有就拿当前的域名遍历匹配，寻找相应的接口地址
    if (!defaultDomain) {
      if (Fetch.domain) {
        var host = window.location.host;
        Object.keys(Fetch.domain).forEach(function (domain) {
          var condition = Fetch.domain[domain];
          if (typeof condition === 'string' && condition === host || condition instanceof RegExp && condition.test(window.location.host)) {
            defaultDomain = domain;
          }
        });
      } else {
        defaultDomain = "";
      }
    }

    url = defaultDomain + url;
  }

  var type = config.type || (url.indexOf('graphql') >= 0 ? 'graphql' : 'restful');
  var res = void 0;
  if (type === 'graphql') {
    res = new _graghql.GraphQL(url, config);
  } else {
    res = (0, _restful.RESTful)(url, config);
  }

  return res;
};

Fetch.setDomain = function setDomain(domain) {
  if (typeof domain === 'string') {
    // if (urlRegxp.test(domain))
    return Fetch.domain = _defineProperty({}, domain, /.*/);

    // throw new Error('\'domain\' string must be \'http://\' or \'https://\' at the beginning.')
  }

  if ((typeof domain === 'undefined' ? 'undefined' : _typeof(domain)) === 'object') return Fetch.domain = domain;

  throw new TypeError('\'domain\' type must be a string or object!');
};

exports.default = Fetch;