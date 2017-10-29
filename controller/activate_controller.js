var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var secret = require('../secret/secret.json')
var jwt = require('jsonwebtoken');

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// called everytime user_controller is called
router.use(function timeLog (req, res, next) {
  console.log('In Activate Controller @ Time: ', Date.now());
  next();
});

router.route('/')
	
	.get(function(req, res){
		// TODO JWT token auth

		var valid = true;
		var token = req.query.token;
		var decoded = {};

		// check if token provided
		if (token === undefined) {
			valid = false;
			console.log('Missing Token In Query');
			res.status(401);
			res.json({ message : "Invalid Activation Token" });
		}

		// check if token payload missing property or expired
		if (valid === true) {
			try {
				decoded = jwt.verify(token, secret.token_secret);
				if (decoded.data.id === undefined || decoded.data.email === undefined || decoded.data.type === undefined) {
					console.log('Missing JWT Payload Property');
					throw new Error('Missing JWT Payload Property');
				} else {
					if (decoded.data.type !== 'activation') {
						console.log('Invalid Token Payload');
						throw new Error('Invalid Token Payload');
					}
				}
			} catch (err) {
				valid = false;
				console.log('Incorrect Token Payload');
				res.status(401);
				res.json({ message: 'Invalid Activation Token' });
			}
		}

		if (valid === true) {
			var key = {
				kind: 'User_V1',
				id: decoded.data.id
			};
			var data = {};
		
			datastore.get(key, function(err, entity) {
					if (err) { // If there is datastore error
						valid = false;
						console.log('Error Running User Query');
				  		res.status(500);
				  		res.json({ message: 'Internal Server Error' });
					} else if (entity === undefined) { // If user entity is not found
				  		valid = false;
				  		console.log('Incorrect User Id In Payload');
				  		res.status(401);
				  		res.json({ message: 'Invalid Activation Token' });
				  	} else {
				  		if (entity.active == true) { // If user entity is already active
				  			valid = false;
				  			console.log('Account Already Activated');
							res.status(409);
							res.json({ message: 'Account Already Activated' });
				  		} else { // If active user entity found
				  			if (decoded.data.email !== entity.email) {
				  				valid = false;
						  		console.log('Incorrect User Email In Payload');
						  		res.status(401);
						  		res.json({ message: 'Invalid Activation Token' });
				  			} else {
				  				data = entity;
				  			}
				  		}
				  	}
				  	if (valid == true) {
						data.active = true;
						datastore.save({
							key: key,
							data: data
						}, function(err, entity) {
							console.log(entity);
							
							if (!err) { // If update success
								try {
									res.status(200);
			                        token = jwt.sign({
										data: {
											id : entity.id,
											email : entity.email,
											type : 'user'
										}
									}, secret.token_secret, { expiresIn: '14d' });

			                        console.log(entity.email);
			                        console.log(entity.wishlist); 

									res.json({
										token: token,
								    	user: {
											email: entity.email,
											wishlist: entity.wishlist
										}
									});
								} catch (err){
									res.status(500);
						  			res.json({ message: 'Internal Server Error' });
								}
							} else { // If there is datastore error
								res.status(500);
						  		res.json({ message: 'Internal Server Error' });
							}
						});
					}
				});
		}
	});

module.exports = router;
