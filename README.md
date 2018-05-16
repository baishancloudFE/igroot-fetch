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
const restApi = igrootFetch(host,config)

// 发送get请求
restApi.get(resourceUrl)
    .then(res=>{
        // 您的业务代码
    })
    .catch(err=>{
        // 错误处理
    })

// 发送post请求
restApi.post(resourceUrl,paramsBody)
    .then(res=>{
        // 您的业务代码
    })
    .catch(err=>{
        // 错误处理
    })

// 发送delete请求
restApi.delete(resourceUrl)
    .then(res=>{
        // 您的业务代码
    })
    .catch(err=>{
        // 错误处理
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

    handleGraphQLErrors: function (errors, data) {
        const { message } = errors[0]
        notification.error({ message: 'GraphQL Error', description: message })
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

#### 特殊说明

- 若 graphQL 接口有分支
  - 例如，请求路径为 APP_CONFIG.default.apiDomain + '/graphql'，当前请求的是该接口的cmdb分支，则请求地址写成 APP_CONFIG.default.apiDomain + '/graphql/{type}/cmdb'
  > 备注：{type} 是 ``` query ``` 或者 ``` mutation ``` 这两个关键字的占位符
- 发送请求时需要携带 cookie
  - 为 BsFetch 添加第二个参数：
    
        {
            credentials: true||false(设置发送请求时是否携带cookie)
        }
- 对请求头的配置
  - 为 BsFetch 添加第二个参数：

        {
            headers: {
                Authorization: 'Bearer xxxxxx',
            }
        }

#### config配置项
> 如有疑问可以直接咨询 范溢贞(tel:18106987196,qq:614235948)

| 参数        | 说明    |  类型  |  默认值
| --------   | -----:   | :----: |  :----: |
| headers     | 请求头      |   object   | -
| needAuth| 是否需要在请求头中配置jwt认证信息,默认配置jwttoken实时从localStorage中读取     |   boolean    | true
| handleNetErrors    |   处理网络错误    |   function    | (error)=> {throw error}
| handleHttpErrors  |   处理HTTP错误    |   function    | (error)=> {throw error}
| handleGraphQLErrors   |   处理GraphQL错误    |   function    | 见下方
| handleSuccess   |   成功后的反馈，一般不会用到     |   function    | -
| credentials    |   发送请求时是否携带cookie    |   boolean    | true

```jsx
handleGraphQLErrors=(errors, data)=> {
  const { message } = errors[0]
  const error = new Error(`GraphQL Error: ${message}`)
  error.rawError = errors
  error.rawData = data
  throw error
}
```
