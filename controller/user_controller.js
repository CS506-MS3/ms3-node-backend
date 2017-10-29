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

// controller for /api/users
router.route('/')
	// GET /api/users
	.get(function(req, res) {
		// TODO Employee Auth
		try {
					var token = req.get('token')
					var decoded = jwt.verify(token, secret.token_secret);
		} catch (err) {
					console.log("Invalid Token");
		}
		
		const query = datastore.createQuery('User_V1');
		datastore.runQuery(query)
                       	.then((results) => {
                               	const users = results[0];
                            	res.status(200);
								res.json(users);
                       	})
						.catch((err) => {
			 				console.error('ERROR:', err);
			                    res.status(500);
			                    res.json({ message: "Error" });
						});
 	})

	// POST	/api/users
	.post(function(req, res) {
			try {
				if (
					req.body.email === undefined ||
					req.body.password_hash === undefined || req.body.notification === undefined
				){ 
					res.status(400);
					res.json({ message: "Invalid Syntax" });
					throw new Error('Invalid Syntax');
				}
				const query = datastore.createQuery('User_V1').filter('email', '=', req.body.email);
				datastore.runQuery(query)
		                .then((results) => {
		                        const users = results[0];
		                        if (users.length != 0) {
		                               	res.status(409);
		                               	res.json({ message: "User Already Exists" });
		                        } else {
		                        	var key = datastore.key(['User_V1']);
									var data = {
										bid : {},
										wishlist : [],
										access : {},
										phone : (req.body.phone === undefined) ? 0 : req.body.phone,
										listing : [],
										stripe_id : 0,
										active : false,
										email : req.body.email,
										password_hash : req.body.password_hash,
										notification : req.body.notification
									};
									datastore.save({
									  	key: key,
										excludeFromIndexes: ["phone", "password_hash"],
						 				data: data
									}, function(err) {
							  				if (!err) {
							    				res.status(201);
												res.json({ message: "Created" });
								 			} else {
								 				res.status(500);
												res.json({ message: "Error" });
											}
									});
		                        }
		                })
						.catch((err) => {
								res.status(500);
								res.json({ message: "Error" });
						});
			} catch (err){
				if (err.message !== 'Invalid Syntax') {
						res.status(500);
						res.json({ message: "Error" });
				}
			}
	});

router.route('/:id/activate')
	// PUT /api/users/:id/activate
	.put(function(req, res){
		var valid = true;

		if (req.body.active === undefined || req.body.active != true) {
			valid = false;
			res.status(400);
			res.json({ message: 'Missing valid property' });
		}
		
		var key = {
			kind: 'User_V1',
			id: req.params.id
		};
		var data = {};

		if (valid == true) {
			datastore.get(key, function(err, entity) {
				if (err) { // If there is datastore error
					valid = false;
					console.error(err);
			  		res.status(500);
			  		res.json({ message: 'Internal Error' });
				} else if (entity === undefined) { // If user entity is not found
			  		valid = false;
			  		res.status(404);
			  		res.json({ message: 'Not found' });
			  	} else {
			  		if (entity.active == true) { // If user entity is already active
			  			valid = false;
						res.status(400);
						res.json({ message: 'Error Updating Entity' });
			  		} else { // If active user entity found
			  			data = entity;
			  		}
			  	}
			  	if (valid == true) {
					data.active = true;
					datastore.save({
						key: key,
						data: data
					}, function(err, entity) {
						if (!err) { // If update success
							res.status(200);
							res.json(data);
						} else { // If there is datastore error
							console.error(err);
							res.status(500);
					  		res.json({ message: 'Internal Error' });
						}
					});
				}
			});
		}
	});

router.route('/:id/deactivate')
	// PUT /api/users/:id/deactivate
	.put(function(req, res){
		var valid = true;
		var token = '';
		var decoded = {};
		// sync verify if token valid
		try {
			token = req.get('token');
			decoded = jwt.verify(token, secret.token_secret);
			if (decoded.data.id === undefined || decoded.data.email === undefined || decoded.data.type === undefined) {
				console.log('Missing JWT Payload Property');
				throw new Error('Missing JWT Payload Property');
			} else {
				if (decoded.data.id !== req.params.id) {
					// employee token id will be different from user id in url params
					if (decoded.data.type === 'user') {
						console.log('User Id Mismatch');
						throw new Error('User Id Mismatch');
					}
				}
			}
		} catch (err) {
			valid = false;
			res.status(401);
			res.json({ message: 'Invalid Auth Token' });
		}

		// for users, check if password property in request body
		if (valid === true) {
			if (decoded.data.type === 'user') {
				if (req.body.password === undefined) {
					valid = false;
					console.log('Missing Password');
					res.status(400);
					res.json({ message: 'Malformed Request' });
				}
			}
		}

		// check if token in token blacklist
		if (valid === true) {
			const query = datastore.createQuery('Token_Blacklist_V1').filter('token', '=', token);
			datastore.runQuery(query, function(err, entities) {
				if (err) {
					valid = false;
					console.log('Error Running Token Blacklist Query');
					res.status(500);
					res.json({ message: 'Internal Server Error' });
				} else {
					if (entities.length != 0) {
						valid = false;
						console.log('Token Blacklisted');
						res.status(401);
						res.json({ message: 'Invalid Auth Token' });	
			        }
	            }
			});
		}

		// check user entity and update
		if (valid === true) {
			var key = {
				kind: 'User_V1',
				id: req.params.id
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
			  		console.log('User Entity Not Found');
			  		res.status(404);
			  		res.json({ message: 'User Resource Does Not Exist' });
			  	} else {
			  		if (entity.email !== decoded.data.email && decoded.data.type === 'user') { // If email in JWT payload mismatch
			  			valid = false;
			  			console.log('Incomplete JWT Payload');
			  			res.status(401);
						res.json({ message: 'Invalid Auth Token' });
			  		} else if (entity.active === false) { // If user entity is already inactive
			  			valid = false;
			  			console.log('Account Already Inactive');
						res.status(409);
						res.json({ message: 'Account Already Inactive' });
			  		} else { // If active user entity found
			  			if (decoded.data.type === 'user') { // for user request check if password match
				  			try {
				  				var password_hash = crypto.createHmac('sha256', secret.password_secret)
								                   .update(req.body.password)
								                   .digest('hex');
								if (entity.password_hash !== password_hash) {
									console.log('Incorrect Password');
									throw new Error('Incorrect Password');
								}
							} catch (err){
								valid = false;
								if (err.message === 'Incorrect Password') {
									res.status(400);
									res.json({ message: 'Malformed Request' });
								} else {
									console.log('Password Hash Error');
							  		res.status(500);
							  		res.json({ message: 'Internal Server Error' });
							  	}
							}
						}
			  			data = entity;
			  		}
			  	}

			  	// update user entity 
			  	if (valid === true) {
					data.active = false;
					datastore.save({
						key: key,
						data: data
					}, function(err, entity) {
						if (!err) { // If update success
							delete data["password_hash"];
							delete data["stripe_id"];
							res.status(200);
							res.json({ active: false });
						} else { // If there is datastore error
							console.log('Error Saving New User Entity');
							res.status(500);
					  		res.json({ message: 'Internal Server Error' });
						}
					});
				}
			});
		}

	});

module.exports = router;
