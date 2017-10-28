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
											res.json({ token: token,
													   data: user_data });
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
					const query = datastore.createQuery('Token_Blacklist_V1').filter('token', '=', token);
					datastore.runQuery(query, function(err, entities) {
							if (err) {
								console.log(err);
							}
							if (!err && entities.length == 0) {
		                    		var key = datastore.key(['Token_Blacklist_V1']);
									var data = {
										token : token
									};
									datastore.save({
										key: key,
										data: data
									}, function(err, entity) {
										if (err) {
											console.error(err);
										} else{
											console.log("Token blacklisted");
										}
									});
		                    } else {
		                    	console.log("Token already blacklisted");
		                    }
					});
				} catch (err) {
					console.log("Invalid Token");
				}
				res.status(204).send();
		});


module.exports = router;
