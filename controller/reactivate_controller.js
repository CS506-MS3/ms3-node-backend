var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var secret = require('../secret.json')

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use(function timeLog (req, res, next) {
  console.log('In Reactivate Controller @ Time: ', Date.now());
  next();
});

router.route('/')
	
	.get(function(req, res){

		var key = {
			kind: 'User_V1',
			id: req.params.id
		};
		var data = {};

		datastore.get(key, function(err, entity) {
				if (err) { // If there is datastore error
			  		res.status(500);
			  		res.json({ message: 'Internal Error' });
				} else if (entity === undefined) { // If user entity is not found
			  		res.status(404);
			  		res.json({ message: 'Email Not found' });
			  	} else {
			  		if (entity.active == true) { // If user entity is already active
						res.status(400);
						res.json({ message: 'Error Updating Entity' });
			  		} else { // If active user entity found
			  			data = entity;
			  		}
			  	}
			});
	});
