const fetch = require('node-fetch')
/**
 * HTTP 请求高阶函数
 */
const request = method => (url, data, options = {}) => {
  // 默认的传输格式为 JSON
  const body = !!data ? JSON.stringify(data) : undefined

  if (method === 'post' || method === 'POST') {
    options.headers = Object.assign({}, {
      "Content-Type": "application/json"
    }, options.headers)
  }
  return fetch(url, {
    method,
    body,
    ...options
  })
}

export const httpRequest = {
  /**
   * GET 请求
   * @param {String}      url
   * @param {Object = {}} data     查询参数
   * @param {Object = {}} headers  请求头对象
   * @param {Object = {}} fetchObj fetch参数对象
   */
  get(url, data = {}, options = {}) {
    const keys = Object.keys(data)
    const params = keys.length !== 0 ? `?${keys.map(key => `${key}=${data[key]}`).join('&')}` : ''

    return fetch(`${url}${params}`, {
      method: 'GET',
      ...options
    })
  },

  patch: request('PATCH'),
  post: request('POST'),
  put: request('PUT'),
  delete: request('DELETE'),
}
