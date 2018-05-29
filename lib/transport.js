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

    this.needAuth = typeof options.needAuth === 'boolean' ? options.needAuth : true
    this.extra = { pagination: {} }
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
    }).then(responese => {
      if (responese.code && responese.code !== 0) {
        this.handleErrors(responese)
      } else if (responese.errors) {
        this.handleGraphQLErrors(responese.errors, responese.data)
      } else {
        this.handleSuccess(responese)
      }

      // switch (this.errType) {
      //   case 'old':
      //     // 旧框架会返回GraphQL 错误：GraphQL 错误处理
      //     const { data, errors } = responese
      //     if (errors) {
      //       this.handleGraphQLErrors(errors, data)
      //     } else { this.handleSuccess(data) }
      //     break;
      //   case 'new':
      //     // 新的后端框架不返回GraphQL错误
      //     const { data: resultData, code, msg } = responese
      //     if (code !== 0) {
      //       this.handleErrors(responese)
      //     } else { this.handleSuccess(resultData) }
      //     break;
      //   default:
      //     console.log('未指定正确的框架！')
      //     break;
      // }

      //返回所需数据和头部信息
      return Object.assign(responese, this.extra)
      // return data
    }).catch(err => this.handleNetErrors(err))
  }
}
