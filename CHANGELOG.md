# 更新日志：
- 1.2.2：去除默认的网络报错处理，改由用户自己设置handleHttpErrors函数来做报错处理
    
    使用姿势：

    ``` javascript
    import Fetch from 'igroot-fetch'
    const igrootFetch = Fetch('/v1/contract/auditConfig', {
        headers: {
            Authorization: 'xxxx'
        },
        handleHttpErrors: function (res) {
            if (res.code !== 0) {
                console.log(res)
            }
        },
    })
    igrootFetch.post({}).then(res => {
        console.log(123)
    })
    ``` 

    推荐使用姿势：
    ``` javascript
    // 先全局引入
    import Fetch from 'igroot-fetch'

    Fetch.setDomain({
        "http://server.xx.com": /localhost|172\.18\.11\.11/,
    })
    // 或者
    Fetch.setDomain("http://server.xx.com")

    // 针对 graphql 请求
    window.Client = Fetch('/graphql',{
        headers: {
            Authorization: 'xxxx'
        },
        handleHttpErrors: function (res) {
            if (res.code !== 0) {
                console.log(res)
            }
        },
    })
    // 然后在项目中直接使用
    Client.query(`xxxx`).then(res=>{})

    // 针对restful请求
    const igrootFetch = Fetch('/v1/contract/auditConfig', {
        headers: {
            Authorization: 'xxxx'
        },
        handleHttpErrors: function (res) {
            if (res.code !== 0) {
                console.log(res)
            }
        },
    })
    igrootFetch.post({}).then(res => {})
    ``` 

- 1.2.3：在返回结果中加上分页信息
