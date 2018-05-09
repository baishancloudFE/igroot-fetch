'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GraphQL = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _lokka = require('lokka');

var _transport = require('./transport');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var GraphQL = exports.GraphQL = function GraphQL(url, client) {
  _classCallCheck(this, GraphQL);

  var type = typeof client === 'undefined' ? 'undefined' : _typeof(client);

  // 无 GraphQL 接口
  if (type === undefined) return;
  return clientHandle(url, client);

  throw new TypeError('GraphQL Client configuration error!');
};