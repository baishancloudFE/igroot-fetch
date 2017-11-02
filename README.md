# igroot-fetch
在基于 iGroot 构建的项目中发送 fetch 请求，有 restful 和 graphql 两种请求发送方式

## 安装
    npm install --save igroot-fetch

## 使用
    const BsFetch = require('igroot-fetch')
    const graphqlApi = BsFetch('graphql',{
            url: Api_Config + '/graphql/{type}/cmdb', //本示例演示graphql接口有分支的情况
            options: {
                headers: {
                    Authorization: 'Bearer xxxxxx',
                }
                credentials: true||false

            }
        }
    })
    graphqlApi.mutate(`
        //graphql 的 mutate 语句
    `)
    graphqlApi.query(`
        //graphql 的 query 语句
    `)

    const restfulApi = BsFetch({
        type: 'restful',
        config: {
            url: 'xxxxxx', 
            options: {
                headers: {
                    Authorization: 'Bearer xxxxxx',
                }
                credentials: true||false
            }
        }
    })
    restfulApi.get()
    restfulApi.post(postBody)
