'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Fetch = undefined;

var _graghql = require('./graghql');

var _restful = require('./restful');

/**
 * Fetch对象
 * @param {*} host 请求地址的host
 * @param {*} config 配置项
 */
var Fetch = exports.Fetch = function Fetch(host) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var type = config.type || (host.indexOf('graphql') >= 0 ? 'graphql' : 'restful');

  var res = void 0;
  if (type === 'graphql') {
    res = new _graghql.GraphQL(host, config);
  } else {
    res = (0, _restful.RESTful)(host, config);
  }
  console.log(res);
  return res;
};

exports.default = Fetch;