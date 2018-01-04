var assert = require('assert')
var expect = require('chai').expect
var BsFetch = require('../dist/api')

describe('测试get请求', function () {

    it('get请求应该返回一个对象', function () {
        return BsFetch('http://172.18.9.36:8001/base/nodenamemap')
            .get()
            .then(function (json) {
                console.log(json)
                expect(json).to.be.an('object');
            });
    });
})
