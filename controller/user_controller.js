var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var secret = require('../secret.json')

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// called everytime user_controller is called
router.use(function timeLog (req, res, next) {
  console.log('In User Controller @ Time: ', Date.now());
  console.log(secret.data.projectID);
  next();
});

// controller for /api/users
router.route('/')
	.get(function(req, res) {
		//TODO Access Datastore

		res.status(200);
		res.json({ message: 'Testing GET /api/users'});
	})

	.post(function(req, res) {
		//TODO Access & Update Datastore

		res.status(200);
		res.json({ message: 'Testing POST /api/users'});
	});

module.exports = router;