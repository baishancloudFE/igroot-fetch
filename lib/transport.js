import LokkaTransport from 'lokka/transport'
import axios from 'axios'

const CancelToken = axios.CancelToken

// 默认 HTTP 错误处理: 状态码不为200 的错误
function handleHttpErrors(response) {
  if (response.status && response.status !== 200) {
    throw new Error(response)
  }
}
// 默认 业务 错误处理: code不为0 的错误
function handleErrors(res) {
  if (res.code && res.code !== 0) {
    if (res.msg) { // 新后端框架的报错方式{code,data,mag}
      const errText = res.msg || '业务错误!'
      throw new Error(errText)
    } else {
      if (res.errors) {// 旧后端框架的报错方式{code,data,errors}
        const { message } = res.errors[0]
        const error = new Error(`GraphQL Error: ${message}`)
        error.rawError = res.errors
        error.rawData = res.data
        throw error
      }
    }
  }
}
// 默认 网络 错误处理: 网络错误，正式请求没有发出
function handleNetErrors(err) {
  throw new Error('网络错误!')
}
// 请求成功：请求成功后的反馈
function handleSuccess() {
}

const defaultOptions = {
  Authorization: '',
  timeout: 1000,
  withCredentials: true,              //发送请求时是否携带cookie
  needAuth: true,                     //需要 Authorization认证信息
  handleHttpErrors: handleHttpErrors,
  handleErrors: handleErrors,
  handleNetErrors: handleNetErrors,
  handleSuccess: handleSuccess
}

// 打印调试日志的开关（只有在LocalStorage中把 displayLog 设置为 true 才可以查看日志）
function log(...content) {
  const displayLog = JSON.parse(localStorage.getItem('displayLog') || false)
  if (displayLog) {
    console.log(...content)
  }
}

export class Transport extends LokkaTransport {
  constructor(url, options = {}) {
    if (!url)
      throw new Error('缺少 baseurl!')

    super()

    const newOptions = {
      ...defaultOptions,
      ...options
    }
    this.graphqlApi = axios.create({
      baseURL: url,
      ...newOptions
    })

    // http request 拦截器
    this.graphqlApi.interceptors.request.use(
      config => {
        if (newOptions.needAuth) {
          if (newOptions.Authorization) {
            config.headers.Authorization = newOptions.Authorization
          } else {
            const token = JSON.parse(window.localStorage['jwtToken'] || null)
            // 判断是否存在token，如果存在的话，则每个http header都加上token
            if (token) {
              config.headers.Authorization = 'Bearer ' + token
            }
          }
        }
        log(config)
        return config
      },
      err => {
        return Promise.reject(err)
      }
    )

    // http response 拦截器
    this.graphqlApi.interceptors.response.use(response => {
      let extra = { pagination: {} }

      const { data: res, status } = response
      if (status !== 200) {
        newOptions.handleHttpErrors(response)
        return Promise.reject(response)
      } else {
        if (res.code && res.code !== 0) {
          newOptions.handleErrors(res);
          return Promise.reject(res)
        } else {
          // 获取头部分页信息
          Object.keys(response.headers).forEach(key => {
            if (key.indexOf('pagination') >= 0) {
              extra.pagination[key] = response.headers[key];
            }
          })
          // end
          newOptions.handleSuccess()
        }
      }

      let result = res
      if (Object.keys(extra.pagination).length > 0) {
        result = { ...res, ...extra }
      }

      return result;
    }, err => {
      newOptions.handleNetErrors(err)
      return Promise.reject(err)
    })

    this.cancel = ''
  }

  send(query, variables, operationName) {
    const payload = { query, variables, operationName }

    log('send request', payload)

    const field = this

    const res = this.graphqlApi.post('', payload, {
      cancelToken: new CancelToken(function executor(c) {
        field.cancel = c;
        log('set cancel token', new Date().toString())
      })
    }).catch(function (thrown) {
      if (axios.isCancel(thrown)) {
        log('Request canceled', thrown.message);
      } else {
        // handle error
        return Promise.reject(thrown)
      }
    });
    res.cancel = this.cancel

    return res
  }
}
