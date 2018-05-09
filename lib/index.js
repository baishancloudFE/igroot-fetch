import { GraphQL } from './graghql'
import { RESTful } from './restful'

/**
 * Fetch对象
 * @param {*} host 请求地址的host
 * @param {*} config 配置项
 */
export const Fetch = (host, config = {}) => {
  const type = config.type || (host.indexOf('graphql') >= 0 ? 'graphql' : 'restful')

  let res
  if (type === 'graphql') {
    res = new GraphQL(host, config)
  } else {
    res = RESTful(host, config)
  }
  console.log(res)
  return res
}

export default Fetch
