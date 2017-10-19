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
				req.body.bid === undefined || req.body.wishlist === undefined ||
				req.body.access === undefined || req.body.phone === undefined ||
				req.body.listing === undefined || req.body.stripe_id === undefined ||
				req.body.active === undefined || req.body.email === undefined ||
				req.body.password_hash === undefined || req.body.notification === undefined
			) {
				throw 'Missing params';
			}
			key = datastore.key(['User_V1']);
			data = {
				bid : req.body.bid,
				wishlist : req.body.wishlist,
				access : req.body.access,
				phone : req.body.phone,
				listing : req.body.listing,
				stripe_id : req.body.stripe_id,
				active : req.body.active,
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
