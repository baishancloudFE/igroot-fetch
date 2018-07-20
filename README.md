# igroot-fetch
在基于 iGroot 构建的项目中发送 fetch 请求，有 restful 和 graphql 两种请求发送方式

## 安装

```jsx
    npm install --save igroot-fetch
    或者
    bower install igroot-fetch
    或者
    yarn add igroot-fetch
```

## 使用

```jsx
    const igrootFetch = require('igroot-fetch')
    或者
    import igrootFetch from('igroot-fetch')
```

#### restful 类型的请求

> restful 类型的请求底层采用 axios 库，想要查看更详细的文档，可以参考 [axios的官方文档]('https://github.com/axios/axios')

```jsx
import igrootFetch from 'igroot-fetch'
const restApi = igrootFetch(baseUrl,config)

// 发送get请求
restApi.get(resourceUrl)
    .then(res=>{
        // 您的业务代码
    })

// 发送post请求
restApi.post(resourceUrl,paramsBody)
    .then(res=>{
        // 您的业务代码
    })

// 发送put请求
restApi.put(resourceUrl,paramsBody)
    .then(res=>{
        // 您的业务代码
    })

// 发送delete请求
restApi.delete(resourceUrl)
    .then(res=>{
        // 您的业务代码
    })

// 还有其余类型的请求可以参照 axios 的官方文档
```

#### graphQL 类型的请求

```jsx
import igrootFetch from 'igroot-fetch'
const graphQLApi = igrootFetch(host+'/graphql',{
    handleHttpErrors: function (response) {
        notification.error({ message: 'Http Error', description: response.statusText })
        if (response.status === 401) {
            onTokenInvalid(domain)
        }
    },
    handleErrors: function (res) {
        notification.error(res.msg)
    }
})

// query
graphQLApi.query(`
{
    users{
        id
        name
    }
}`).then(res => {
        console.log(res)
    })

// mutate
graphQLApi.mutate(`
    {
        update_user(
            id:5,
            apps:[1,4,5]
        ){
            value
        }
    }
`).then(res => {
        console.log(res)
    })
```


#### 开放的配置项
> 如有疑问可以直接咨询 范溢贞(tel:18106987196,qq:614235948)

| 参数        | 说明    |  类型  |  默认值
| --------   | -----:   | :----: |  :----: |
| Authorization     | 头部认证信息，默认从 localStorage 中取，因为如果你的系统有接入 SSO，SSO 会默认将 token 存入 localStorage      |   string   | ''
| needAuth| 是否需要在请求头中配置jwt认证信息,有的平台不需要Authorization认证信息，可以将这一项配置为false     |   boolean    | true
| needType| 是否需要 query 或 mutation 这两个关键字     |   boolean    | true
| withCredentials    |   发送请求时是否携带cookie    |   boolean    | true
| timeout    |   请求超时时间设置，默认设置为1000ms   |   boolean    | 1000
| handleNetErrors    |   处理网络错误（网络错误：正式请求没有发出）    |   function    | 见下方
| handleHttpErrors  |   处理HTTP错误（状态码不为200 的错误）   |   function    | 见下方
| handleErrors   |   处理 业务逻辑 错误（code不为0 的错误）    |   function    | 见下方
| handleSuccess   |   成功后的反馈，一般不会用到     |   function    | -


```jsx
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
```

#### 特殊说明

- 若 graphQL 接口有分支
  - 例如，请求路径为 APP_CONFIG.default.apiDomain + '/graphql'，当前请求的是该接口的cmdb分支，则请求地址写成 APP_CONFIG.default.apiDomain + '/graphql/{type}/cmdb'
  > 备注：{type} 是 ``` query ``` 或者 ``` mutation ``` 这两个关键字的占位符
- 针对 graphql 类型的请求，已经开放了请求撤销的功能，用法如下：
```jsx
const myQuery = igrootFetch.query(`
    {users{id}}
`)
//在需要撤销这个请求的时候调用，即可撤回请求
myQuery.cancel()
``` 

- 因为时间关系，暂未开放 restful 请求的撤回功能

- V1.5.1 后兼容了两种版本的后端框架的错误处理，对1.4.5之前的用户有一个不兼容改动如下所示：
```jsx
// 对原来的后端抛出的GraphQL错误，igroot-fetch默认处理如下，并从response中抛出 errors, data 供用户自定义处理
function handleGraphQLErrors(errors, data) {
  const { message } = errors[0]
  const error = new Error(`GraphQL Error: ${message}`)
  error.rawError = errors
  error.rawData = data
  throw error
}
// 现在取消了 所谓的 GraphQL错误 的说法，并合并处理所有的业务逻辑错误
// igroot-fetch默认处理如下，并从response中抛出 res(也就是{code,data,msg}) 供用户自定义处理
function handleErrors(res) {
  if (res.code && res.code !== 0) {
    const errText = res.msg || '业务错误!'
    throw new Error(errText)
  }
}
```
    如果您要将您的igroot-fetch版本由V1.4.5之前升级为
    V1.5.1以后，只需要将您配置项中的 handleGraphQLErrors 改为 handleErrors ，并将您在 handleGraphQLErrors 中使用的 errors, data 取消，改为使用{code,data,msg}来定义您的错误处理方式 即可

#### 升级日志

[升级日志](./CHANGELOG.md)
