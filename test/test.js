var assert = require('assert')
var BsFetch = require('../dist/api')

console.log(BsFetch)

describe('测试get请求', function () {
    it('should return -1 when the value is not present', function () {
        assert.equal([1, 2, 3].indexOf(4), -1)
    })
})