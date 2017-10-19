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
	.get(function(req, res) {
		const query = datastore.createQuery('User_V1');
                datastore.runQuery(query)
                        .then((results) => {
                                const users = results[0];
                                res.status(200);
                                res.json(users)
                        })
                        .catch((err) => {
                                console.error('ERROR:', err);
                                res.status(500);
                                res.json({ message: "Error" })
                        });
 	})

	.post(function(req, res) {
		//TODO Access & Update Datastore

		res.status(200);
		res.json({ message: 'Testing POST /api/users'});
	});

module.exports = router;
