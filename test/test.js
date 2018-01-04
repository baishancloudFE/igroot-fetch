var assert = require('assert')
var expect = require('chai').expect
var BsFetch = require('../dist/api')

describe('测试igroot-fetch请求', function () {

    // it('get请求应该返回一个对象', function () {
    //     return BsFetch('http://172.18.9.36:8001/base/nodenamemap')
    //         .get()
    //         .then(function (json) {
    //             console.log(json)
    //             expect(json).to.be.an('object');
    //         });
    // });

    it('graphql的query请求应该返回一个对象', function () {
        return BsFetch('http://172.18.11.112:23000/graphql/query', {
            headers: {
                Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjIzMDAxL2dyYXBocWwvcXVlcnkiLCJpYXQiOjE1MTE0MjA2MzMsImV4cCI6MTU0Mjk1NjYzMywibmJmIjoxNTExNDIwNjMzLCJqdGkiOiJnVXJkRm1xcW5RRnpTaERWIiwic3ViIjp7InVpZCI6MzAxNjUsImNuYW1lIjoiXHU1ZjIwXHU2MDFkXHU2NTg3Iiwic2lkIjoiNWExNjcyYWJkMjQwNSIsIm5hbWUiOiJ6aGFuZ3Npd2VuIn0sInBydiI6ImYxMzFhOTNkZTgwZjE4ZDkwMjk2N2YwYzRiYTRlNDQxNGE3NTYxMjciLCJ1c2VyX2lkIjoyMDksInVzZXJuYW1lIjoiaHVhbmdqaW53ZWkiLCJuYW1lIjoiXHU5ZWM0XHU5MWQxXHU0ZjFmIn0.CQ0SdIbKkucO7MSt815_OgnMjrfBkePYfEaCqQomMps'
            }
        })
            .query('{sys{ org(sys:{parent_id:0}){id org_code name}}}')
            .then(function (json) {
                console.log(json)
                expect(json).to.be.an('object');
            });
    });
})
