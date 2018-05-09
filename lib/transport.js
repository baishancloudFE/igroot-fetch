import LokkaTransport from 'lokka/transport'

// 默认网络错误处理
function handleNetErrors(error) {
  throw error
}

// 默认 HTTP 错误处理
function handleHttpErrors(response) {
  console.log(response)
  throw new Error(`Invalid status code: ${response.status}`)
}

// 默认 GraphQL 错误处理
function handleGraphQLErrors(errors, data) {
  const { message } = errors[0]
  const error = new Error(`GraphQL Error: ${message}`)
  error.rawError = errors
  error.rawData = data
  throw error
}

export class Transport extends LokkaTransport {
  constructor(endpoint, options = {}) {
    if (!endpoint)
      throw new Error('endpoint is required!')

    super()

    this._httpOptions = {
      auth: options.auth,
      headers: options.headers || {},
      credentials: options.credentials
    }

    this.endpoint = endpoint
    this.handleNetErrors = options.handleNetErrors || handleNetErrors
    this.handleHttpErrors = options.handleHttpErrors || handleHttpErrors
    this.handleGraphQLErrors = options.handleGraphQLErrors || handleGraphQLErrors
    this.handleSuccess = options.handleSuccess || function () { }

    this.needAuth = typeof options.needAuth === 'boolean' ? options.needAuth : true
    this.extra = { pagination: {} }
  }

  _buildOptions(payload) {
    // 默认设置
    const options = {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),

      // CORS
      credentials: 'include',
    }

    if (this._httpOptions.credentials === false)
      delete options.credentials

    const token = JSON.parse(window.localStorage['jwtToken'])
    Object.assign(
      options.headers,
      this._httpOptions.headers,
      this.needAuth ? { Authorization: token ? 'Bearer ' + token : null } : {}
    )

    return options
  }

  send(query, variables, operationName) {
    const payload = { query, variables, operationName }
    const options = this._buildOptions(payload)

    return fetch(this.endpoint, options).then(response => {
      // HTTP 错误处理
      if (response.status !== 200)
        this.handleHttpErrors(response)

      // 获取头部分页信息
      this.extra.pagination = {}
      response.headers.forEach((val, key) => {
        this.extra.pagination[key] = val
      })
      // end

      return response.json()
    }).then(({ data, errors }) => {
      // GraphQL 错误处理
      if (errors) {
        this.handleGraphQLErrors(errors, data)
        return null
      } else { this.handleSuccess(data) }

      //返回所需数据和头部信息
      return Object.assign(data, this.extra)
      // return data
    }).catch(err => this.handleNetErrors(err))
  }
}
