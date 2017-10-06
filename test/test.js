var supertest = require('supertest')
var should = require('should')

var server  = supertest.agent('http://localhost:3000')

describe('Get /', function() {
    it('respond with Hello World!', function(done) {
        server.get('/')
	.expect('Hello World!', done)
    })
})
