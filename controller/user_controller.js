var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var secret = require('../secret/secret.json')
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

const auth = require('../core/auth')(datastore);
const users = require('../middlewares/users.middleware')(datastore);
const permissions = require('../core/permissions');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ms3.cs506@gmail.com',
        pass: secret.gmailpass
    }
});

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.use(function timeLog(req, res, next) {
    console.log('In User Controller @ Time: ', Date.now());
    next();
});

// controller for /api/users
router.route('/')
    .get(
        auth.checkAuth,
        auth.checkInactiveToken,
        permissions.getRoleGuard([
            permissions.ROLES.EMPLOYEE,
            permissions.ROLES.SUPER_ADMIN
        ]),
        users.getList
    )

    // POST	/api/users
    .post(function (req, res, next) { // verify request body
        if (req.body.email === undefined || req.body.password === undefined ||
            req.body.notification === undefined || req.body.notification.marketing === undefined
        ) {
            res.status(400);
            res.json({message: "Malformed Request"});
        } else {
            next();
        }
    }, function (req, res, next) { // verify account does not already exist
        const query = datastore.createQuery('User_V1').filter('email', '=', req.body.email);
        datastore.runQuery(query, function (err, entities) {
            if (err) {
                console.error(err);
                res.status(500);
                res.json({message: 'Internal Server Error'});
            } else {
                if (entities.length !== 0) {
                    res.status(409);
                    res.json({message: 'Account Already Exists'});
                } else {
                    try {
                        var password_hash = crypto.createHmac('sha256', secret.password_secret)
                            .update(req.body.password)
                            .digest('hex');
                        res.locals.user_key = datastore.key(['User_V1']);
                        res.locals.user_data = {
                            bid: {},
                            wishlist: [],
                            access: {},
                            phone: (req.body.phone === undefined) ? 0 : req.body.phone,
                            listing: [],
                            stripe_id: 0,
                            active: false,
                            email: req.body.email,
                            password_hash: password_hash,
                            notification: req.body.notification
                        };
                        next();
                    } catch (err) {
                        console.error(err);
                        res.status(500);
                        res.json({message: "Internal Server Error"});
                    }
                }
            }
        });
    }, function (req, res, next) { // create user entity and send email with activation token
        datastore.save({
            key: res.locals.user_key,
            excludeFromIndexes: ["phone", "password_hash"],
            data: res.locals.user_data
        }, function (err) {
            if (!err) {
                try {
                    var token = jwt.sign({
                        data: {
                            id: res.locals.user_key.id,
                            email: req.body.email,
                            type: 'activation'
                        }
                    }, secret.token_secret, {expiresIn: '1h'});

                    var activation_link = 'https://ms3-web.firebaseapp.com/#/account/activate?token=' + token;
                    var mailOptions = {
                        from: 'ms3.cs506@gmail.com',
                        to: req.body.email,
                        subject: 'MS3 Activation Link',
                        text: 'Thank you for signing up with UW-Madison Students and Scholars Sublease. Please click the following link to activate your account. ' + activation_link + ' The activation link will expire in 1 hour.'
                    };

                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            console.error(err);
                            res.status(500);
                            res.json({message: 'Internal Server Error'});
                        } else {
                            res.status(201);
                            res.json({message: "Created"});
                        }
                    });

                } catch (err) {
                    console.log(err);
                    res.status(500);
                    res.json({message: "Internal Server Error"});
                }
            } else {
                console.error(err);
                res.status(500);
                res.json({message: "Internal Server Error"});
            }
        });
    });

router.route('/:id/activate')
    .get(
        auth.checkAuth,
        auth.checkInactiveToken,
        permissions.getRoleGuard([
            permissions.ROLES.EMPLOYEE,
            permissions.ROLES.SUPER_ADMIN
        ]),
        users.getUser,
        users.isInactive,
        users.activate
    );


router.route('/:id/deactivate')

    .put(auth.checkAuth,
        auth.checkInactiveToken,
        permissions.getRoleGuard([
            permissions.ROLES.USER,
            permissions.ROLES.EMPLOYEE,
            permissions.ROLES.SUPER_ADMIN
        ]),
        users.getUser,
        permissions.runIf([
            permissions.ROLES.USER
        ], users.checkPassword),
        permissions.runIf([
            permissions.ROLES.USER
        ], users.checkEmail),
        users.isActive,
        users.deactivate
    );

module.exports = router;
