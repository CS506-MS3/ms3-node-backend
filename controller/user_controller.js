var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var secret = require('../secret/secret.json')
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ms3.cs506@gmail.com',
    pass: secret.gmailpass
  }
});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use(function timeLog (req, res, next) {
  console.log('In User Controller @ Time: ', Date.now());
  next();
});

// controller for /api/users
router.route('/')

	.get(function(req, res, next) {
		try {
			var token = req.get('token');
			var decoded = jwt.verify(token, secret.token_secret);
			if (decoded.data.id === undefined || decoded.data.email === undefined || decoded.data.type === undefined) {
				throw new Error('Missing JWT Payload Property');
			} else {
				if (decoded.data.type !== 'employee') {
					throw new Error('Employee Only');
				} else {
					res.locals.decoded = decoded;
					res.locals.token = token;
					next();
				}
			}
		} catch (err) {
			console.error(err);
			res.status(401);
			res.json({ message: 'Invalid Auth Token' });
		}
	},  function(req, res, next) { // verify JWT auth token is not in token blacklist
		try {
			const query = datastore.createQuery('Token_Blacklist_V1').filter('token', '=', res.locals.token);
			datastore.runQuery(query, function(err, entities) {
				if (err) {
					console.error(err);
					res.status(500);
					res.json({ message: 'Internal Server Error' });
				} else {
					if (entities.length != 0) {
						console.error('Blacklisted Token');
						res.status(401);
						res.json({ message: 'Invalid Auth Token' });	
			        } else {
			        	next();
			        }
	            }
			});
		} catch (err) {
			console.error(err);
			res.status(500);
			res.json({ message: 'Internal Server Error' });
		}
	},  function(req, res) {
		const query = datastore.createQuery('User_V1').limit(10);
		datastore.runQuery(query, function(err, entities) {
			if (err) {
				console.error(err);
				res.status(500);
				res.json({ message: "Internal Server Error" });
			} else {
				res.status(200);
				res.json(entities);
			}
		});
 	})

	// POST	/api/users
	.post(function(req, res, next) { // verify request body
		if (req.body.email === undefined || req.body.password === undefined || 
			req.body.notification === undefined || req.body.notification.marketing === undefined
		){ 
			res.status(400);
			res.json({ message: "Malformed Request" });
		} else {
			next();
		}
	}, function(req, res, next) { // verify account does not already exist
		const query = datastore.createQuery('User_V1').filter('email', '=', req.body.email);
		datastore.runQuery(query, function(err, entities) {
			if (err) {
				console.error(err);
				res.status(500);
				res.json({ message: 'Internal Server Error' });
			} else {
				if (entities.length !== 0) {
			  		res.status(409);
			  		res.json({ message: 'Account Already Exists' });
	            } else {
	            	try {
		            	var password_hash = crypto.createHmac('sha256', secret.password_secret)
							.update(req.body.password)
		                    .digest('hex');
		               	res.locals.user_key = datastore.key(['User_V1']);
						res.locals.user_data = {
							bid : {},
							wishlist : [],
							access : {},
							phone : (req.body.phone === undefined) ? 0 : req.body.phone,
							listing : [],
							stripe_id : 0,
							active : false,
							email : req.body.email,
							password_hash : password_hash,
							notification : req.body.notification
						};
						next();
					} catch (err) {
						console.error(err);
						res.status(500);
						res.json({ message: "Internal Server Error" });
					}
				}
			}
		});
	}, function(req, res, next) { // create user entity and send email with activation token
		datastore.save({
		  	key: res.locals.user_key,
			excludeFromIndexes: ["phone", "password_hash"],
			data: res.locals.user_data
		}, function(err) {
			if (!err) {
				try {
            		var token = jwt.sign({
						data: {
							id : res.locals.user_key.id,
							email : req.body.email,
							type : 'activation'
						}
					}, secret.token_secret, { expiresIn: '1h' });

            		var activation_link = 'https://ms3-web.firebaseapp.com/#/account/activate?token=' + token;
        			var mailOptions = {
					  from: 'ms3.cs506@gmail.com',
					  to: req.body.email,
					  subject: 'MS3 Activation Link',
					  text: 'Thank you for signing up with UW-Madison Students and Scholars Sublease. Please click the following link to activate your account. ' + activation_link + ' The activation link will expire in 1 hour.'
					};

					transporter.sendMail(mailOptions, function(err, info){
					  	if (err) {
					    	console.error(err);
					    	res.status(500);
							res.json({ message: 'Internal Server Error' });
					  	} else {
					    	res.status(201);
		    				res.json({ message: "Created" });
					  	}
					});

        		} catch(err){
        			console.log(err);
        			res.status(500);
					res.json({ message: "Internal Server Error" });
        		}
 			} else {
 				console.error(err);
				res.status(500);
				res.json({ message: "Internal Server Error" });
			}
		});
	});

router.route('/:id/activate')

	.get(function(req, res,next){ // verify JWT auth token, verify token payload
		try {
			var token = req.get('token');
			var decoded = jwt.verify(token, secret.token_secret);
			if (decoded.data.id === undefined || decoded.data.email === undefined || decoded.data.type === undefined) {
				throw new Error('Missing JWT Payload Property');
			} else {
				if (decoded.data.id !== req.params.id) {
					if (decoded.data.type !== 'employee') {
						throw new Error('Employee Only');
					} else {
						res.locals.decoded = decoded;
						res.locals.token = token;
						next();
					}
				} else {
					throw new Error('Employee Only');
				}
			}
		} catch (err) {
			console.error(err);
			res.status(401);
			res.json({ message: 'Invalid Auth Token' });
		}
	}, function(req, res, next) { // verify JWT auth token is not in token blacklist
		try {
			const query = datastore.createQuery('Token_Blacklist_V1').filter('token', '=', res.locals.token);
			datastore.runQuery(query, function(err, entities) {
				if (err) {
					console.error(err);
					res.status(500);
					res.json({ message: 'Internal Server Error' });
				} else {
					if (entities.length != 0) {
						console.error('Blacklisted Token');
						res.status(401);
						res.json({ message: 'Invalid Auth Token' });	
			        } else {
			        	next();
			        }
	            }
			});
		} catch (err) {
			console.error(err);
			res.status(500);
			res.json({ message: 'Internal Server Error' });
		}
	}, function(req, res, next) { // verify user entity exists and inactive
		var key = {
			kind: 'User_V1',
			id: req.params.id
		};
		datastore.get(key, function(err, entity) {
			if (err) {
				console.error(err);
		  		res.status(500);
		  		res.json({ message: 'Internal Server Error' });
			} else {
				if (entity === undefined) {
			  		res.status(404);
			  		res.json({ message: 'User Resource Does Not Exist' });
			  	} else {
			  		if (entity.email === res.locals.decoded.data.email) {
			  			console.error('Employee Only');
			  			res.status(401);
						res.json({ message: 'Invalid Auth Token' });
			  		} else if (entity.active === true) {
						res.status(409);
						res.json({ message: 'Account Already Active' });
			  		} else {
			  			res.locals.user_data = entity;
			  			res.locals.user_key = key;
			  			next();
			  		}
			  	}
			}
		});
    }, function(req, res) { // update user entity
		res.locals.user_data.active = true;
		datastore.save({
			key: res.locals.user_key,
			excludeFromIndexes: ["phone", "password_hash"],
			data: res.locals.user_data
		}, function(err) {
			if (!err) {
				res.status(200);
				res.json({ active: true });
			} else {
				console.error(err);
				res.status(500);
		  		res.json({ message: 'Internal Server Error' });
			}
		});
	});


router.route('/:id/deactivate')

	.put(function(req, res, next){ // verify JWT auth token, verify token payload
		try {
			var token = req.get('token');
			var decoded = jwt.verify(token, secret.token_secret);
			if (decoded.data.id === undefined || decoded.data.email === undefined || decoded.data.type === undefined) {
				throw new Error('Missing JWT Payload Property');
			} else {
				if (decoded.data.id !== req.params.id) {
					if (decoded.data.type === 'user') {
						throw new Error('User Id Mismatch');
					} else {
						res.locals.token = token;
						res.locals.decoded = decoded;
						next();
					}
				} else {
					res.locals.token = token;
					res.locals.decoded = decoded;
					next();
				}
			}
		} catch (err) {
			console.error(err);
			res.status(401);
			res.json({ message: 'Invalid Auth Token' });
		}
	}, function(req, res, next){ // verify user request body
		if (res.locals.decoded.data.type === 'user') {
			if (req.body.password === undefined) {
				res.status(400);
				res.json({ message: 'Malformed Request' });
			} else {
				next();
			}
		} else {
			next();
		}
	}, function(req, res, next) { // verify JWT auth token is not already blacklisted
		try {
			const query = datastore.createQuery('Token_Blacklist_V1').filter('token', '=', res.locals.token);
			datastore.runQuery(query, function(err, entities) {
				if (err) {
					console.error(err);
					res.status(500);
					res.json({ message: 'Internal Server Error' });
				} else {
					if (entities.length != 0) {
						console.error('Blacklisted Token');
						res.status(401);
						res.json({ message: 'Invalid Auth Token' });	
			        } else {
			        	next();
			        }
	            }
			});
		} catch (err) {
			console.error(err);
			res.status(500);
			res.json({ message: 'Internal Server Error' });
		}
	}, function(req, res, next) { // verify user entity exists, active, and password is correct
		var key = {
			kind: 'User_V1',
			id: req.params.id
		};
		datastore.get(key, function(err, entity) {
			if (err) {
				console.error(err);
		  		res.status(500);
		  		res.json({ message: 'Internal Server Error' });
			} else {
				if (entity === undefined) {
			  		res.status(404);
			  		res.json({ message: 'User Resource Does Not Exist' });
		  		} else {
			  		if (entity.email !== res.locals.decoded.data.email && res.locals.decoded.data.type === 'user') {
			  			console.error('Invalid JWT Payload');
			  			res.status(401);
						res.json({ message: 'Invalid Auth Token' });
			  		} else if (entity.active === false) {
						res.status(409);
						res.json({ message: 'Account Already Inactive' });
			  		} else {
			  			if (res.locals.decoded.data.type === 'user') {
				  			try {
				  				var password_hash = crypto.createHmac('sha256', secret.password_secret)
				                   .update(req.body.password)
				                   .digest('hex');
								if (entity.password_hash !== password_hash) {
									throw new Error('Incorrect Password');
								} else {
									res.locals.user_data = entity;
									res.locals.user_key = key;
									next();
								}
							} catch (err) {
								if (err.message === 'Incorrect Password') {
									res.status(401);
			                    	res.json({ message: "Invalid Email/Password Combo" });
								} else {
									console.error('Password Hashing Error');
							  		res.status(500);
							  		res.json({ message: 'Internal Server Error' });
							  	}
							}
						} else {
							res.locals.user_data = entity;
							res.locals.user_key = key;
							next();
						}
		  			}
		  		}
		  	}
		});
	}, function(req, res) { // update user entity
		res.locals.user_data.active = false;
		datastore.save({
			key: res.locals.user_key,
			excludeFromIndexes: ["phone", "password_hash"],
			data: res.locals.user_data
		}, function(err) {
			if (!err) {
				res.status(200);
				res.json({ active: false });
			} else {
				console.error('Error Saving New User Entity');
				res.status(500);
		  		res.json({ message: 'Internal Server Error' });
			}
		});
	});

module.exports = router;
