var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var secret = require('../secret.json')

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// called everytime user_controller is called
router.use(function timeLog (req, res, next) {
  console.log('In User Controller @ Time: ', Date.now());
  next();
});

// controller for /api/users
router.route('/')
	// GET /api/users
	.get(function(req, res) {
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
		//TODO Access & Update Datastore
		var valid = true;
		var key = "";
		var data = "";
		try {
			if (
				req.body.email === undefined ||
				req.body.password_hash === undefined || req.body.notification === undefined
			) {
				throw 'Missing params';
			}
			/*const query = datastore.createQuery('User_V1').filter('email', '=', req.body.email);
			datastore.runQuery(query)
                       	.then((results) => {
                               	const users = results[0];
                            	console.log(users)
                       	})
						.catch((err) => {
 								console.error('ERROR:', err);
                        		res.status(500);
                       			res.json({ message: "Error" });
			});*/

			key = datastore.key(['User_V1']);
			data = {
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
		} catch (err){
			valid = false;
			res.status(400);
                        console.error("Error:", err);
			res.json({ message: 'Error'});
		}
		
		if (valid) {
			datastore.save({
			  	key: key,
				excludeFromIndexes: ["phone", "password_hash"],
 				data: data
			}, function(err) {
  				if (!err) {
    					res.status(201);
					res.json({ message: "Created" });
	 			} else {
					console.error("Create Error:", err);
					res.status(500);
					res.json({ message: "Error" });
				}
			});
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

		if (req.body.active === undefined || req.body.active != false) {
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
			  		if (entity.active == false) { // If user entity is already inactive
			  			valid = false;
						res.status(400);
						res.json({ message: 'Error Updating Entity' });
			  		} else { // If active user entity found
			  			data = entity;
			  		}
			  	}
			  	if (valid == true) {
					data.active = false;
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

module.exports = router;
