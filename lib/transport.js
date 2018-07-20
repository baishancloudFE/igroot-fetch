import LokkaTransport from 'lokka/transport'

// 默认网络错误处理
function handleNetErrors(error) {
  throw error
}

// 默认 HTTP 错误处理
function handleHttpErrors(response) {
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
// 业务自定义的错误处理
function handleErrors(responese) {
  const { data, code, msg } = responese
  const error = new Error(`Error: ${msg}`)
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

    this.returnCompleteResponse = typeof options.returnCompleteResponse === 'boolean' ? options.needAuth : false//code为0时是否返回完整的响应体
    this.needAuth = typeof options.needAuth === 'boolean' ? options.needAuth : true
    // this.extra = { pagination: {} }
    this.handleErrors = options.handleErrors || handleErrors
    // this.errType = options.errType || 'old'
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

    const token = JSON.parse(window.localStorage['jwtToken'] || null)
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
    let extra = { pagination: {} }

    return fetch(this.endpoint, options).then(response => {
      // HTTP 错误处理
      if (response.status !== 200)
        this.handleHttpErrors(response)

      // 获取头部分页信息
      response.headers.forEach((val, key) => {
        extra.pagination[key] = val
      })
      // end
      return response.json()
    }).then(responese => {

      // if (responese.code && responese.code !== 0) {
      //   this.handleErrors(responese)
      // }
      // if (responese.errors) {
      //   this.handleGraphQLErrors(responese.errors, responese.data)
      // }

      if (responese.code && responese.code !== 0) {
        this.handleErrors(responese)
      } else if (responese.errors) {
        this.handleGraphQLErrors(responese.errors, responese.data)
        // return Promise.reject(responese)
      } else {
        const item = this.returnCompleteResponse ? responese : responese.data
        this.handleSuccess(item)
      }

      //返回所需数据和头部信息
      const result = this.returnCompleteResponse ? Object.assign(responese, extra) : Object.assign(responese.data || {}, extra)
      return result
      // return data
    }).catch(err => this.handleNetErrors(err))
  }
}
