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

  var mutation = void 0,
      query = void 0;

  // 是否需要 query 或 mutation 这两个关键字
  var needType = typeof options.needType === 'boolean' ? options.needType : true;

  if (needType) {
    if (url.indexOf(placeholder) === -1) url += '/' + placeholder;

    mutation = lokkaFactory(url.replace(placeholder, 'mutation'), options);
    delete options.handleSuccess;
    query = lokkaFactory(url.replace(placeholder, 'query'), options);
  } else {
    mutation = lokkaFactory(url, options);
    delete options.handleSuccess;
    query = lokkaFactory(url, options);
  }
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

var GraphQL = exports.GraphQL = function GraphQL(url, config) {
  _classCallCheck(this, GraphQL);

  var type = typeof config === 'undefined' ? 'undefined' : _typeof(config);

  if (type === undefined) return;
  return clientHandle(url, config);

  throw new TypeError('GraphQL Client configuration error!');
};