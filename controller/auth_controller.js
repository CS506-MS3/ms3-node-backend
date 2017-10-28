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
				datastore.runQuery(query)
                       	.then((results) => {
                               	const users = results[0];
                               	var token = '';
                               	var password_hash = req.body.password; // TODO hash password
                            	if (users.length == 0) {
		                               	res.status(401);
		                        		res.json({ message: "Invalid Email/Password Combo" });
		                        } else {
		                        		if (users[0].data.password_hash !== password_hash) {
		                        			res.status(401);
		                        			res.json({ message: "Invalid Email/Password Combo" });
		                        		} else {
		                        			token = jwt.sign({
													data: {
													  		id : users[0].key,
													  		email : users[0].data.email,
													  		type : 'user'
													}
											}, secret.token_secret, { expiresIn: '14d' });
											res.status(200);
											res.json({ token: token });
		                        		}
		                        }
                       	})
						.catch((err) => {
							    console.error(err);
			                    res.status(500);
			                    res.json({ message: "Internal Server Error" });
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


		});


module.exports = router;
