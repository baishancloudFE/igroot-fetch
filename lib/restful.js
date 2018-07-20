import axios from 'axios'

// 默认 HTTP 错误处理: 状态码不为200 的错误
function handleHttpErrors(response) {
  if (response.status && response.status !== 200) {
    throw new Error(response)
  }
}
// 默认 业务 错误处理: code不为0 的错误
function handleErrors(res) {
  if (res.code && res.code !== 0) {
    const errText = res.msg || '业务错误!'
    throw new Error(errText)
  }
}
// 默认 网络 错误处理: 网络错误，正式请求没有发出
function handleNetErrors(err) {
  throw new Error('网络错误!')
}
// 请求成功：请求成功后的反馈
function handleSuccess() {
}

// 打印调试日志的开关（只有在LocalStorage中把 displayLog 设置为 true 才可以查看日志）
function log(...content) {
  const displayLog = JSON.parse(localStorage.getItem('displayLog') || false)
  if (displayLog) {
    console.log(...content)
  }
}

const defaultOptions = {
  Authorization: '',
  timeout: 1000,
  withCredentials: true,              //发送请求时是否携带cookie
  needAuth: true,                     //需要 Authorization认证信息
  handleHttpErrors: handleHttpErrors,
  handleErrors: handleErrors,
  handleNetErrors: handleNetErrors,
  handleSuccess: handleSuccess,
}



export const RESTful = (url, options) => {

  const newOptions = {
    ...defaultOptions,
    ...options
  }
  let rest = axios.create({
    baseURL: url,
    ...newOptions
  })

  // http request 拦截器
  rest.interceptors.request.use(
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
  rest.interceptors.response.use(response => {
    const { data: res, status } = response
    if (status !== 200) {
      newOptions.handleHttpErrors(response)
      return Promise.reject(response)
    } else {
      if (res.code !== 0) {
        newOptions.handleErrors(res);
        return Promise.reject(res)
      } else {
        newOptions.handleSuccess()
      }
    }
    return res;
  }, err => {
    newOptions.handleNetErrors(err)
    return Promise.reject(err)
  })

  return rest
}
