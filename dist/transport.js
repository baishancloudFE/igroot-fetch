'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Transport = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _transport = require('lokka/transport');

var _transport2 = _interopRequireDefault(_transport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// 默认网络错误处理
function handleNetErrors(error) {
  throw error;
}

// 默认 HTTP 错误处理
function handleHttpErrors(response) {
  console.log(response);
  throw new Error('Invalid status code: ' + response.status);
}

// 默认 GraphQL 错误处理
function handleGraphQLErrors(errors, data) {
  var message = errors[0].message;

  var error = new Error('GraphQL Error: ' + message);
  error.rawError = errors;
  error.rawData = data;
  throw error;
}

var Transport = exports.Transport = function (_LokkaTransport) {
  _inherits(Transport, _LokkaTransport);

  function Transport(endpoint) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Transport);

    if (!endpoint) throw new Error('endpoint is required!');

    var _this = _possibleConstructorReturn(this, (Transport.__proto__ || Object.getPrototypeOf(Transport)).call(this));

    _this._httpOptions = {
      auth: options.auth,
      headers: options.headers || {},
      credentials: options.credentials
    };

    _this.endpoint = endpoint;
    _this.handleNetErrors = options.handleNetErrors || handleNetErrors;
    _this.handleHttpErrors = options.handleHttpErrors || handleHttpErrors;
    _this.handleGraphQLErrors = options.handleGraphQLErrors || handleGraphQLErrors;
    _this.handleSuccess = options.handleSuccess || function () {};
    return _this;
  }

  _createClass(Transport, [{
    key: '_buildOptions',
    value: function _buildOptions(payload) {
      // 默认设置
      var options = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),

        // CORS
        credentials: 'include'
      };

      if (this._httpOptions.credentials === false) delete options.credentials;

      Object.assign(options.headers, this._httpOptions.headers);

      return options;
    }
  }, {
    key: 'send',
    value: function send(query, variables, operationName) {
      var _this2 = this;

      var payload = { query: query, variables: variables, operationName: operationName };
      var options = this._buildOptions(payload);

      return fetch(this.endpoint, options).then(function (response) {
        // HTTP 错误处理
        if (response.status !== 200) _this2.handleHttpErrors(response);

        return response.json();
      }).then(function (_ref) {
        var data = _ref.data,
            errors = _ref.errors;

        // GraphQL 错误处理
        if (errors) {
          _this2.handleGraphQLErrors(errors, data);
          return null;
        } else {
          _this2.handleSuccess(data);
        }

        return data;
      }).catch(function (err) {
        return _this2.handleNetErrors(err);
      });
    }
  }]);

  return Transport;
}(_transport2.default);