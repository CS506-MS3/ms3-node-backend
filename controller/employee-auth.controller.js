const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

const auth = require('../core/auth')(datastore);
const employee = require('../core/employees')(datastore);

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.use(function timeLog(req, res, next) {
    console.log('In Employee Auth Controller @ Time: ', Date.now());
    next();
});

router.route('/')
    .post(
        auth.validateForm,
        employee.get,
        employee.checkPassword,
        employee.checkStatus,
        auth.authEmployee
    )
    .delete(
        auth.checkAuth,
        auth.checkInactiveToken,
        auth.deactivateToken
    );

module.exports = router;