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
    console.log('In Employee Controller @ Time: ', Date.now());
    next();
});

router.route('/')
    .post(
        auth.checkAuth,
        permissions.getRoleGuard([permissions.ROLES.SUPER_ADMIN]),
        employee.checkForm,
        employee.checkDuplicate,
        employee.saveEmployee
    )
    .get(
        auth.checkAuth,
        permissions.getRoleGuard([
            permissions.ROLES.EMPLOYEE, permissions.ROLES.SUPER_ADMIN
        ]),
        employee.getList
    );

router.route('/:id')
    .delete(
        auth.checkAuth,
        permissions.getRoleGuard([permissions.ROLES.SUPER_ADMIN]),
        employee.getByKey,
        employee.remove
    );

module.exports = router;