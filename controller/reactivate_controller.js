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
	
	.post(function(req, res){

		try {
				if (
					req.body.email === undefined
				){ 
					res.status(400);
					res.json({ message: "Invalid Syntax" });
					throw new Error('Invalid Syntax');
				}
				const query = datastore.createQuery('User_V1').filter('email', '=', req.body.email);
				datastore.runQuery(query)
		                .then((results) => {
		                        const users = results[0];
		                        if (users.length === 0) {
		                               	res.status(404);
		                               	res.json({ message: "User Not Found" });
		                        } else {
		                        		if (users[0].data.active !== false) {
		                        			res.status(409);
		                        			res.json({ message: "Account Already Active" });
		                        		} else {
		                        			// TODO Generate Token, send through nodemailer
		                        		}
		                        }
		                })
						.catch((err) => {
								res.status(500);
								res.json({ message: "Error" });
						});
			} catch (err){
				if (err.message !== 'Invalid Syntax') {
						res.status(500);
						res.json({ message: "Error" });
				}
			}
	});
