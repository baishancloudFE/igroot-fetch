import { Lokka } from 'lokka'
import { Transport } from './transport'
import { httpRequest } from './http_request'

// URL 完整性校验
const urlRegxp = /^https?:\/\//

// 域名缓存，避免每次请求都去匹配域名
let defaultDomain

// 默认网络错误处理
function handleNetErrors(error) {
  throw error
}

// 默认 HTTP 错误处理
function handleHttpErrors(response) {
  if (response.code !== 0)
    console.log(response)
}

function warp(method) {
  return function (data) {
    return httpRequest.post(this.url, data, this._buildOptions())
      .then(res => res.json())
      .then(res => {
        this.handleHttpErrors(res)
        return res
      })
      .catch(err => this.handleNetErrors(err))
  }
}

class RESTful {
  constructor(url, configs) {
    if (typeof (url) === 'string') {
      this.url = url
      this.configs = configs

      this.post = warp('post').bind(this)
      this.put = warp('put').bind(this)
      this.delete = warp('delete').bind(this)
    } else {
      throw new TypeError('API object constructor argument must be the object or string')
    }
  }

  _buildOptions() {
    // 默认设置
    const options = {}
    this.configs.headers && (options.headers = this.configs.headers)
    this.configs.mode && (options.mode = this.configs.mode)
    this.configs.credentials && (options.credentials = 'include')
    this.handleNetErrors = this.configs.handleNetErrors || handleNetErrors
    this.handleHttpErrors = this.configs.handleHttpErrors || handleHttpErrors

    return options
  }

  // 按条件返回对象数组
  get(data) {
    return httpRequest.get(this.url, data, this._buildOptions())
      .then(res => res.json())
      .then(res => {
        this.handleHttpErrors(res)
        return res
      })
      .catch(err => this.handleNetErrors(err))
  }
}




const placeholder = '{type}'

// Lokka 工厂
function lokkaFactory(url, options) {
  const client = new Lokka({
    transport: new Transport(url, options)
  })
  return client
}

// client 处理
function clientHandle(url, options = {}) {
  if (url.indexOf(placeholder) === -1)
    url += `/${placeholder}`

  const mutation = lokkaFactory(url.replace(placeholder, 'mutation'), options)

  delete options.handleSuccess

  const query = lokkaFactory(url.replace(placeholder, 'query'), options)

  /**
   * 双重作用域变换
   *
   * mutate 方法调用时作用域变换路径:
   *   mutate(query) => _findFragments(query) => fragments(query)
   *   mutate(query) => send(mutation) => _transport(mutation)
   */
  query.mutate = query.mutate.bind(mutation)
  mutation._findFragments = mutation._findFragments.bind(query)

  return query
}

class GraphQL {
  constructor(url, client) {
    const type = typeof client

    // 无 GraphQL 接口
    if (type === undefined)
      return
    return clientHandle(url, client)

    throw new TypeError('GraphQL Client configuration error!')
  }
}

export const Fetch = (url, config = {}) => {
  // 如果不是完整的 url 就给它加上域名
  if (!urlRegxp.test(url)) {
    // 判断是否有默认域名缓存，如果没有就拿当前的域名遍历匹配，寻找相应的接口地址
    if (!defaultDomain) {
      if (Fetch.domain) {
        const host = window.location.host
        Object.keys(Fetch.domain).forEach(domain => {
          const condition = Fetch.domain[domain]
          if (
            (typeof condition === 'string' && condition === host) ||
            (condition instanceof RegExp && condition.test(window.location.host))
          ) { defaultDomain = domain }
        })
      } else {
        defaultDomain = ""
      }
      // if (!defaultDomain) throw new Error('Can not match the api domain! Please check your api domain config.')
    }

    url = defaultDomain + url
  }

  const type = config.type || (url.indexOf('graphql') >= 0 ? 'graphql' : 'restful')
  const API = type === 'graphql' ? GraphQL : RESTful

  return new API(url, config)
}

Fetch.setDomain = function setDomain(domain) {
  if (typeof domain === 'string') {
    // if (urlRegxp.test(domain))
    return Fetch.domain = { [domain]: /.*/ }

    // throw new Error('\'domain\' string must be \'http://\' or \'https://\' at the beginning.')
  }

  if (typeof domain === 'object')
    return Fetch.domain = domain

  throw new TypeError('\'domain\' type must be a string or object!')
}

// module.exports = Fetch
export default Fetch
