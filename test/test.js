var supertest = require('supertest')
var server  = supertest.agent('http://localhost:3000')
const chai = require('chai');
const sinon = require('sinon');
const should = require('should');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

const coreTests = require('./core/core.suite');

xdescribe('/api/users Test', function() {
    it('GET Test Example', function(done) {
    	server
    		.get('/api/users')
			.expect(200) // Change 200 to 400 to see fail example
			.expect("Content-Type",/json/) // Change '/json/' to '/text/' to see fail example
			.end(function(err, res){
				if (err)
					done(err);
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
});

function runAll(tests) {
	'use strict';

	describe('Running all specs:', function () {
		before(function () {
			// Global Set Up
		});
		console.log(tests);
		tests.forEach(function (test) {
			test();
		});
		after(function () {
			// Global Teardown
		});
	});
}

runAll([
	coreTests.runSuite
]);
