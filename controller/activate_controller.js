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
		var key = {
			kind: 'User_V1',
			id: req.params.id
		};
		var data = {};
		var valid = true;

		datastore.get(key, function(err, entity) {
				if (err) { // If there is datastore error
					valid = false;
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
							res.status(500);
					  		res.json({ message: 'Internal Error' });
						}
					});
				}
			});
	});