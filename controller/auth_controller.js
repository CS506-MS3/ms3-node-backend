var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var secret = require('../secret/secret.json')
var jwt = require('jsonwebtoken');
var crypto = require('crypto');

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use(function timeLog (req, res, next) {
  console.log('In Auth Controller @ Time: ', Date.now());
  next();
});

router.route('/')

		.post(function(req, res){
			try {
				if (
					req.body.email === undefined || req.body.password === undefined
				){ 
					res.status(400);
					res.json({ message: "Invalid Syntax" });
					throw new Error('Invalid Syntax');
				}
				const query = datastore.createQuery('User_V1').filter('email', '=', req.body.email);
				datastore.runQuery(query, function(err, entities) {
                               	var password_hash = req.body.password; // TODO hash password
				console.log(entities);
                            	if (entities.length == 0) {
		                               	res.status(401);
		                        		res.json({ message: "Invalid Email/Password Combo" });
		                        } else {
		                        		var user_data = entities[0];
		                        		var user_key = entities[0][datastore.KEY];
		                        		if (user_data.password_hash !== password_hash){ //|| user_data === undefined || user_key === undefined) {
		                        			res.status(401);
		                        			res.json({ message: "Invalid Email/Password Combo" });
		                        		} else {
		                        			var id = user_key.id
		                        			var token = jwt.sign({
													data: {
													  		id : id,
													  		email : user_data.email,
													  		type : 'user'
													}
											}, secret.token_secret, { expiresIn: '14d' });
											res.status(200);
											res.json({ token: token });
		                        		}
		                        }
				});
			} catch (err){
				console.error(err);
				if (err.message !== 'Invalid Syntax') {
						res.status(500);
						res.json({ message: "Internal Server Error" });
				}
			}

		})

		.delete(function(req, res){
				try {
					var token = req.get('token')
					var decoded = jwt.verify(token, secret.token_secret);
					res.status(200);
					res.json(decoded);
				} catch (err) {
					console.log(err);
					res.status(500);
					res.json({ message: "Error" });
				}
		});


module.exports = router;
