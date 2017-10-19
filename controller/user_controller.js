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
				res.json(users);
                       	})
			.catch((err) => {
 				console.error('ERROR:', err);
                        	res.status(500);
                       		res.json({ message: "Error" });
			});
 	})

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

module.exports = router;
