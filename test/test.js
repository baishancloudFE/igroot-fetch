const BsFetch = require('igroot-fetch')

describe("A suite", function () {
  it("contains spec with an expectation", function () {
    expect(
      BsFetch('http://172.18.11.112:11000/region/select?country=&', {
        headers: {
          Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTcyLjE4LjExLjExMjoxMTAwMC9hY2NvdW50L3VzZXIvdmlldyIsImlhdCI6MTUxMTc4MzA2OCwiZXhwIjoxNTExODY5NDY4LCJuYmYiOjE1MTE3ODMwNjgsImp0aSI6InVMVThPN1l2bTk3UXdsZjciLCJzdWIiOnsidWlkIjozMDQ2OCwic2lkIjoiNWExYmZhOWFlY2FmZSIsIm5hbWUiOiJ5dWFueWFuZy53YW5nIiwiY25hbWUiOiJcdTczOGJcdThmZGNcdTZkMGIiLCJhdXRoIjoiZUp3ek1BQURRME5EQTBNd3cyQkVBUUR2SUMvVyIsInJlc291cmNlcyI6ImVKd3pNREF3TkJpNUFBRHJWQy9TIn0sInBydiI6ImYxMzFhOTNkZTgwZjE4ZDkwMjk2N2YwYzRiYTRlNDQxNGE3NTYxMjcifQ.dOSEkaQH7htUuUCLj1GYtBlLwWphqAt_Ke_xZPIKwwQ'
        }
      }).get()
    ).toBe(res)
  })
})
