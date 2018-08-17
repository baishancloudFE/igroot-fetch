# 更新日志：
- 1.2.2
    - 去除默认的网络报错处理，改由用户自己设置handleHttpErrors函数来做报错处理 

- 1.2.3
    - 在返回结果中加上分页信息

- 1.3.0
    - token实时从 localStorage 中读取

- 1.3.1
    - restful部分改用axios；

- 1.3.2
    - 添加 needType 配置项，用于判断发送请求时是否需要在请求地址后面添加 ``` query ``` 或者 ``` mutation ``` 这两个关键字的占位符

- 1.3.3
    - 修复 localStorage 中不存在 token 时获取失败的容错处理
- 1.3.10
    - 修复 localStorage 中不存在 token 时获取失败的容错处理；添加 needType 配置项

- 1.4.0
    - 恢复setDomain方法

- 1.4.1
    - 去掉打印日志的语句

- 1.4.2
    - 增加 returnCompleteResponse 配置项：满足响应的code为0需要取得完整响应体的需求
    - 增加 getDomain 方法，取得 domain 变量

- 1.4.3
    - 修复 将extra变量移到send函数内部

- 1.5.2
    - 开放 超时时间设置 和 请求撤回（graphql类型请求） 功能
    - 兼容 新旧两个后端框架 的业务错误处理

- 1.5.3
    - err回传

- 1.5.4
    - 在控制台打出文档链接
