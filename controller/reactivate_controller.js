var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var secret = require('../secret/secret.json')
var jwt = require('jsonwebtoken');

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use(function timeLog (req, res, next) {
  console.log('In Reactivate Controller @ Time: ', Date.now());
  next();
});

router.route('/')
	
	.post(function(req, res, next){
		if (req.body.email === undefined) {
			console.error('Malformed Request');
			res.status(400);
			res.json({ message: 'Malformed Request' });
		} else {
			next();
		}
	}, function(req, res, next){
		try {
			const query = datastore.createQuery('User_V1').filter('email', '=', req.body.email);
			datastore.runQuery(query, function(err, entities) {
				if (err) { // error running query
					console.error(err);
					res.status(500);
					res.json({ message: 'Internal Server Error' });
				} else {
					if (entities.length == 0) {
					  	res.status(404);
					  	res.json({ message: 'User Resource Does Not Exist' });
			        } else {
			        	var user_data = entities[0];
			            var user_key = entities[0][datastore.KEY];
		            	if (user_data.active === true) {
							res.status(409);
							res.json({ message: 'Account Already Active' });
		            	} else {
		            		res.locals.id = user_key.id;
		            		res.locals.user_data = user_data;
			                next();	
		            	}
		        	}
	        	}
			});
		} catch (err) {
			console.error(err);
			res.status(500);
			res.json({ message: 'Internal Server Error' });
		}
	}, function(req, res) {
		try {
    		var token = jwt.sign({
				data: {
					id : res.locals.id,
					email : res.locals.user_data.email,
					type : 'activation'
				}
			}, secret.token_secret, { expiresIn: '1h' });

    		// TODO nodemailer
    		res.status(200);
    		res.json({ 
    			token: token 
    		})
		} catch(err){
			console.error(err);
			res.status(500);
			res.json({ message: 'Internal Server Error' });
		}
	});

module.exports = router;
