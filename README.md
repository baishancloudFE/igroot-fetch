# igroot-fetch
在基于 iGroot 构建的项目中发送 fetch 请求，有 restful 和 graphql 两种请求发送方式

## 安装
    npm install --save igroot-fetch
    或者
    bower install igroot-fetch
    或者
    yarn add igroot-fetch

## 使用
    const BsFetch = require('igroot-fetch')
    或者
    import BsFetch from('igroot-fetch')
    
#### get 请求
    BsFetch(url).get().then(res=>{
      console.log(res)
    })
    若有get参数：
    const params={
      name:'fanyizhen',
      gender:'female'
    }
    BsFetch(url).get(params).then(res=>{
      console.log(res)
    })
#### post 请求
    const postBody={
      name:'fanyizhen',
      gender:'female'
    }
    BsFetch(url).post(postBody).then(res=>{
      console.log(res)
    })
#### put 请求
#### delete 请求
#### query 请求( graphQL 类型的接口)

    BsFetch(url).query(`
    {
        users{
            id
            name
        }
    }`).then(res => {
            console.log(res)
        })
#### mutate 请求( graphQL 类型的接口)

    const graphqlApi = BsFetch(url)
    const updateResult = graphqlApi.createFragment(`
        fragment on UpdateResult {
            value
        }
    `)
    graphqlApi.mutate(`
        {
            update_user(
                id:5,
                apps:[1,4,5]
            ){
                ...${updateResult}
            }
        }
    `).then(res => {
            console.log(res)
        })
#### 特殊配置项

- 若 graphQL 接口有分支
  - 例如，请求路径为 APP_CONFIG.default.apiDomain + '/graphql'，当前请求的是该接口的cmdb分支，则请求地址写成 APP_CONFIG.default.apiDomain + '/graphql/{type}/cmdb'
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