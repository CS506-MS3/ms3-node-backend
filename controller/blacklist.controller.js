const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const permissions = require('../core/permissions');

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

const auth = require('../core/auth')(datastore);
const employee = require('../core/employees')(datastore);

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.use(function timeLog(req, res, next) {
    console.log('In Blacklist Controller @ Time: ', Date.now());
    next();
});

router.route('/')
    .get(
        auth.checkAuth,
        permissions.getRoleGuard([
            permissions.ROLES.EMPLOYEE, permissions.ROLES.SUPER_ADMIN
        ]),
        blacklist.getList
    );
