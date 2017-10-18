var supertest = require('supertest')
var should = require('should')
var server  = supertest.agent('http://localhost:3000')

describe('/api/users Test', function() {
    it('GET Test Example', function(done) {
    	server
    		.get('/api/users')
			.expect(200) // Change 200 to 400 to see fail example
			.expect("Content-Type",/json/) // Change '/json/' to '/text/' to see fail example
			.end(function(err, res){
				if (err)
					done(err);
				res.body.should.have.property('message'); // Change 'message' to 'foobar' to see fail example
				res.body.message.should.equal('Testing GET /api/users'); // Change 'Testing ...' to 'foobar' to see fail example
				done();
			});
    });

    it('POST Test Example', function(done) {
    	server
    		.post('/api/users')
			.expect(200)
			.expect("Content-Type",/json/)
			.end(function(err, res){
				if (err)
					done(err);
				res.body.should.have.property('message');
				res.body.message.should.equal('Testing POST /api/users');
				done();
			});
    });
})
