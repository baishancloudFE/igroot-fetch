import { Lokka } from 'lokka'
import { Transport } from './transport'


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
  let mutation, query

  // 是否需要 query 或 mutation 这两个关键字
  const needType = typeof options.needType === 'boolean' ? options.needType : true

  if (needType) {
    if (url.indexOf(placeholder) === -1)
      url += `/${placeholder}`

    mutation = lokkaFactory(url.replace(placeholder, 'mutation'), options)
    delete options.handleSuccess
    query = lokkaFactory(url.replace(placeholder, 'query'), options)
  } else {
    mutation = lokkaFactory(url, options)
    delete options.handleSuccess
    query = lokkaFactory(url, options)
  }
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

export class GraphQL {
  constructor(url, config) {
    const type = typeof config

    if (type === undefined)
      return
    return clientHandle(url, config)

    throw new TypeError('GraphQL Client configuration error!')
  }
}
