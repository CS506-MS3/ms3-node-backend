var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var secret = require('../secret/secret.json')
var jwt = require('jsonwebtoken');

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.route('/')
	
	.get(function(req, res, next){ // verify JWT auth token, verify token payload
		try {
			var token = req.query.token;
			var decoded = jwt.verify(token, secret.token_secret);
			if (decoded.data.id === undefined || decoded.data.email === undefined || decoded.data.type === undefined) {
				throw new Error('Missing JWT Payload Property');
			} else if (decoded.data.type !== 'activation') {
				throw new Error('Invalid Token Type');
			} else {
				res.locals.decoded = decoded;
				next();
			}
		} catch (err) {
			console.error(err);
			res.status(401);
			res.json({ message: 'Invalid Activation Token' });
		}
	}, function(req, res, next){ // verify JWT auth token is not in token blacklist
		try {
			const query = datastore.createQuery('Token_Blacklist_V1').filter('token', '=', req.query.token);
			datastore.runQuery(query, function(err, entities) {
				if (err) {
					console.error(err);
					res.status(500);
					res.json({ message: 'Internal Server Error' });
				} else {
					if (entities.length != 0) {
						console.error('Blacklisted Token');
						res.status(401);
						res.json({ message: 'Invalid Activation Token' });	
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
	}, function(req, res, next){ // verify user entity exists and inactive
		const userId = res.locals.decoded.data.id;
		const key = datastore.key(['User_V1', parseInt(userId) || userId]);

		datastore.get(key, function(err, entity) {
			if (err) {
				console.error(err);
		  		res.status(500);
		  		res.json({ message: 'Internal Server Error' });
			} else {
				if (entity === undefined) {
			  		console.error('Incorrect User Id In Payload');
			  		res.status(401);
			  		res.json({ message: 'Invalid Activation Token' });
			  	} else {
			  		if (entity.active === true) {
						res.status(409);
						res.json({ message: 'Account Already Active' });
			  		} else {
			  			if (res.locals.decoded.data.email !== entity.email) {
					  		console.error('Incorrect User Email In Payload');
					  		res.status(401);
					  		res.json({ message: 'Invalid Activation Token' });
			  			} else {
			  				res.locals.user_data = entity;
			  				res.locals.user_key = key;
			  				next();
			  			}
			  		}
			  	}
			}
		});
	}, function(req, res) { // update user entity and return summarized user info
		res.locals.user_data.active = true;
		datastore.save({
			key: res.locals.user_key,
			excludeFromIndexes: ["phone", "password_hash"],
			data: res.locals.user_data
		}, function(err) {
			if (!err) {
				try {
                    var auth_token = jwt.sign({
						data: {
							id : res.locals.user_key.id || res.locals.user_key.name,
							email : res.locals.user_data.email,
							type : 'user'
						}
					}, secret.token_secret, { expiresIn: '14d' });

                    res.status(200);
					res.json({
						token: auth_token,
				    	user: {
							email: res.locals.user_data.email,
							id: res.locals.user_key.id,
							wishlist: res.locals.user_data.wishlist
						}
					});
				} catch (err){
					console.error(err);
					res.status(500);
		  			res.json({ message: 'Internal Server Error' });
				}
			} else {
				console.error(err);
				res.status(500);
		  		res.json({ message: 'Internal Server Error' });
			}
		});
	});

module.exports = router;
