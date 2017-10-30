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
	
	.post(function(req, res){
		try {
				if (
					req.body.email === undefined
				){  
					console.log("Malformed Request");
					res.status(400);
					res.json({ message: "Invalid Syntax" });
					throw new Error('Invalid Syntax');
				}
				const query = datastore.createQuery('User_V1').filter('email', '=', req.body.email);
				datastore.runQuery(query, function(err, entities) {
					var entity = entities[0];
					if (err) { // error running query
						console.log('Error Running User Query');
						res.status(500);
						res.json({ message: 'Internal Server Error' });
					} else if (entity === undefined) { // If user entity is not found
				  		console.log('User Entity Not Found');
				  		res.status(404);
				  		res.json({ message: 'User Resource Does Not Exist' });
		            } else {
		            	if (entity.active === true) {
				  			console.log('Account Already Active');
							res.status(409);
							res.json({ message: 'Account Already Active' });
		            	} else {
		            		try {
			            		// generate activation token
			            		var token = jwt.sign({
									data: {
										id : entity[datastore.KEY].id,
										email : entity.email,
										type : 'activation'
									}
								}, secret.token_secret, { expiresIn: '1h' });

			            		console.log(token);
			            		// TODO nodemailer
			            		res.status(200);
			            		res.json({ token: token })
		            		} catch(err){
		            			console.log(err);
		            			res.status(500);
								res.json({ message: "Internal Server Error" });
		            		}
		            	}
		            }
				});
		} catch (err){
			if (err.message !== 'Invalid Syntax') {
				res.status(500);
				res.json({ message: "Internal Server Error" });
			}
		}
	});

module.exports = router;
