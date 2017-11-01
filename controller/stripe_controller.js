var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var secret = require('../secret/secret.json')
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ms3.cs506@gmail.com',
    pass: secret.gmailpass
  }
});
const keyPublishable = "pk_test_L9NiqklwtvWYTbgsj2616QzV";
const keySecret = "sk_test_rI3Brro4TbOViRL5IoJfWNHp";
const stripe = require("stripe")(keySecret);


router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use(function timeLog (req, res, next) {
  console.log('In User Controller @ Time: ', Date.now());
  next();
});

// controller for /api/users
router.route('/')
	// GET /api/users
	.get(function(req, res) {
    /* go into pay page */
		res.render("pay.pug", {keyPublishable});
		
 	});
	
router.route('/charge')
	// GET /api/users
	.post(function(req, res){
	  let email = req.body.stripeEmail;
	  let card = req.body.stripeToken;
	  //let des = req.body.description;
	  //let currency = req.body.currency;
	  let amount = 100;//default
	  stripe.customers.create({
		email: req.body.stripeEmail,
		card: req.body.stripeToken,
	  })
	  .then(customer =>
      stripe.charges.create({
        amount:amount,
        description: "description",
        currency: "usd",
        customer: customer.id
      }, function(err, charge) {
          if(err){
          res.status(500);
          console.error(err);
          res.send(err.toString());
          }else{
            console.log(charge);
            res.json(charge).status(200).end();
          }
          // asynchronously called
        }
      )
	  )
	  .catch(function(err) {
      	res.status(500);
      	console.error(err);
      	res.send(err.toString());
      });
	});
module.exports = router;
