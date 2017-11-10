var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var secret = require('../secret/secret.json')
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

const CONFIG = {
    WEB_URL: 'https://ms3-web.firebaseapp.com',
    TOKEN_CONFIG: require('../configs/token.config'),
    ROLES: require('../configs/roles.constants'),
    ENTITY_KEYS: require('../configs/entity-keys.constants'),
    MAILER: {
        FROM: 'ms3.cs506@gmail.com'
    }
};

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
const stripe = require("stripe")(secret.stripe_secret_key;


router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
	
router.route('/')

    .post(auth.checkAuth,
        auth.checkInactiveToken,
        function(req, res, next) { // get user entity and check if stripe_id exists
            const key = datastore.key([CONFIG.ENTITY_KEYS.USERS, parseInt(req.locals.decoded.data.id)]);
            datastore.get(key)
            .then((result) => {
                let entity = result[0];
                if (entity) {
                    res.locals.userData = entity;
                    res.locals.userKey = key;
                    if (entity.stripe_id === 0) {
                        res.locals.create_stripe_customer = true;
                    }
                    next();
                } else {
                    errorResponse.send(res, 401, 'Invalid Token');
                }
            })
            .catch((error) => {
                errorResponse.send(res, 500, 'Internal Server Error', error);
            })
        }, function(req, res, next) { // create Stripe customer if necessary
            if (res.locals.create_stripe_customer === true) {
                stripe.customers.create({
                    email: res.locals.tokenUse.email;
                }, function(err, customer) {
                    if (err) {
                        errorResponse.send(res, 500, 'Internal Server Error', err);
                    } else {
                        res.locals.userData.stripe_id = customer.id;
                        next();
                    }
                });
            } else {
                next();
            }
      	}, function(req, res, next) { // update user entity if necessary
            if (res.locals.create_stripe_customer === true) {
                let entity = {
                    key: res.locals.userKey,
                    excludeFromIndexes: ['phone', 'password_hash'],
                    data: res.locals.userData
                };

                datastore.save(entity)
                    .then(() => {
                        next();
                    })
                    .catch((error) => {

                        errorResponse.send(res, 500, 'Internal Server Error', error);
                    });
            } else {
                next();
            }
        }
    );
module.exports = router;