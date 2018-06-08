import { GraphQL } from './graghql'
import { RESTful } from './restful'

// URL 完整性校验
const urlRegxp = /^https?:\/\//
// 域名缓存，避免每次请求都去匹配域名
let defaultDomain

/**
 * Fetch对象
 * @param {*} url 请求地址的host
 * @param {*} config 配置项
 */
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
          ) {
            defaultDomain = domain
          }
        })
      } else {
        defaultDomain = ""
      }
    }

    url = defaultDomain + url
  }

  const type = config.type || (url.indexOf('graphql') >= 0 ? 'graphql' : 'restful')
  let res
  if (type === 'graphql') {
    res = new GraphQL(url, config)
  } else {
    res = RESTful(url, config)
  }

  return res
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

export default Fetch
