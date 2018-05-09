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

export class GraphQL {
  constructor(url, client) {
    const type = typeof client

    // 无 GraphQL 接口
    if (type === undefined)
      return
    return clientHandle(url, client)

    throw new TypeError('GraphQL Client configuration error!')
  }
}
