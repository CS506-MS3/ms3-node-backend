var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var secret = require('../secret.json')

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore({
  projectId: secret.data.projectId
});
const kind = 'User_V1';

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// called everytime user_controller is called
router.use(function timeLog (req, res, next) {
  console.log('In User Controller @ Time: ', Date.now());
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

router.route('/:id')
	.get(function(req, res) {
		//TODO Access Datastore
		// datastore.get(req.params.id, function(err, entity) {
		// 	if (err) {
		// 		res.status(500)
		// 		res.json({ message : "Error" })
		// 	} else {
		// 		res.status(200);
		// 		res.json(entity);
		// 	}
		// });
	})

module.exports = router;