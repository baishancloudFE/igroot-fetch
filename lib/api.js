import { Lokka } from 'lokka'

import { Transport } from './transport'
import { httpRequest } from './http_request'
import { notification } from 'igroot'

// error 弹出锁, 避免弹出框过多
let errorLock = false

// function warp(method) {
//   return (data, showSuccessMsg = true) => {
//     return httpRequest[method](this.url, data, {}, {})
//       .then(res => res.json())
//       .then(json => {
//         if (json.code !== 0) {
//           // 弹出提示框
//           if (!errorLock) {
//             errorLock = true
//             setTimeout(() => errorLock = false, 2000)

//             notification.error({
//               message: `请求失败 code: ${json.code}`,
//               description: json.msg ? json.msg : json.message || ''
//             })
//           }
//         } else
//           showSuccessMsg && notification.success({
//             message: '请求成功',
//             description: json.msg ? json.msg : ''
//           })

//         return json
//       })

//       .catch(err => {
//         notification.error({
//           message: '请求失败',
//           description: '错误信息请打开控制台查看'
//         })

//         throw err
//       })
//   }
// }

class RESTful {
  constructor(configs, isUrl) {
    const confType = typeof configs

    if (isUrl && confType === 'string') {
      this.url = configs
      return
    }

    if (confType === 'object')
      this.url = APP_CONFIG[configs.group].apiDomain + configs.url

    else if (confType === 'string')
      this.url = APP_CONFIG.default.apiDomain + configs

    else
      throw new TypeError('API object constructor argument must be the object or string')
  }

  // 按条件返回对象数组
  get(data, headers = {}, fetchObj = {}) {
    return httpRequest.get(this.url, data, headers, fetchObj)
      .then(res => res.json())
      .then(res => {
        if (res.code !== 0)
          notification.error({
            message: `请求失败 code: ${res.code}`,
            description: res.msg ? res.msg : res.message || ''
          })

        return res
      })
  }

  post(data) {
    return (data, showSuccessMsg = true) => {
      return httpRequest.post(this.url, data, {}, {})
        .then(res => res.json())
        .then(json => {
          if (json.code !== 0) {
            // 弹出提示框
            if (!errorLock) {
              errorLock = true
              setTimeout(() => errorLock = false, 2000)

              notification.error({
                message: `请求失败 code: ${json.code}`,
                description: json.msg ? json.msg : json.message || ''
              })
            }
          } else
            showSuccessMsg && notification.success({
              message: '请求成功',
              description: json.msg ? json.msg : ''
            })

          return json
        })

        .catch(err => {
          notification.error({
            message: '请求失败',
            description: '错误信息请打开控制台查看'
          })

          throw err
        })
    }
  }
  put(data) {
    return (data, showSuccessMsg = true) => {
      return httpRequest.put(this.url, data, {}, {})
        .then(res => res.json())
        .then(json => {
          if (json.code !== 0) {
            // 弹出提示框
            if (!errorLock) {
              errorLock = true
              setTimeout(() => errorLock = false, 2000)

              notification.error({
                message: `请求失败 code: ${json.code}`,
                description: json.msg ? json.msg : json.message || ''
              })
            }
          } else
            showSuccessMsg && notification.success({
              message: '请求成功',
              description: json.msg ? json.msg : ''
            })

          return json
        })

        .catch(err => {
          notification.error({
            message: '请求失败',
            description: '错误信息请打开控制台查看'
          })

          throw err
        })
    }
  }
  delete(data) {
    return (data, showSuccessMsg = true) => {
      return httpRequest.delete(this.url, data, {}, {})
        .then(res => res.json())
        .then(json => {
          if (json.code !== 0) {
            // 弹出提示框
            if (!errorLock) {
              errorLock = true
              setTimeout(() => errorLock = false, 2000)

              notification.error({
                message: `请求失败 code: ${json.code}`,
                description: json.msg ? json.msg : json.message || ''
              })
            }
          } else
            showSuccessMsg && notification.success({
              message: '请求成功',
              description: json.msg ? json.msg : ''
            })

          return json
        })

        .catch(err => {
          notification.error({
            message: '请求失败',
            description: '错误信息请打开控制台查看'
          })

          throw err
        })
    }
  }
}



const placeholder = '{type}'

// Lokka 工厂
function lokkaFactory(url, options) {
  return new Lokka({
    transport: new Transport(url, options)
  })
}

// client 处理
function clientHandle(url, options = {}, isUrl) {
  if (url.indexOf(placeholder) === -1)
    url += `/${placeholder}`

  options.isUrl = isUrl
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
  constructor(client, isUrl) {
    const type = typeof client

    // 无 GraphQL 接口
    if (type === undefined)
      return

    // 无配置
    if (type === 'string')
      return clientHandle(client, undefined, isUrl)

    // 有配置
    if (type === 'object')
      return clientHandle(client.url, client.options, isUrl)

    throw new TypeError('GraphQL Client configuration error!')
  }
}

export const BsFetch = ({ type, url }) => {
  if (type === 'restful')
    return new RESTful(url, true)

  if (type === 'graphql')
    return new GraphQL(url, true)
}
module.exports = BsFetch