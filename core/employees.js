const errorResponse = require('../core/error-response');
const secret = require('../secret/secret.json');
const crypto = require('crypto');

module.exports = function (datastore) {
    'use strict';

    const ENTITY_KEY = 'Employee_Dev';

    return {
        get: get,
        checkPassword: checkPassword,
        checkStatus: checkStatus,
        checkForm: checkForm,
        checkDuplicate: checkDuplicate,
        saveEmployee: saveEmployee
    };

    function get(req, res, next) {
        const body = req.body;
        const query = datastore.createQuery(ENTITY_KEY).filter('email', '=', body.email);

        datastore.runQuery(query, function (error, entities) {
            if (error) {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            } else if (entities.length === 0) {

                errorResponse.send(res, 401, 'Account Not Found');
            } else if (!this._checkStatus(entities[0])) {

                errorResponse.send(res, 403, 'Inactive Account');
            } else {
                res.locals.userData = entities[0];
                res.locals.userKey = entities[0][datastore.KEY];
                res.locals.userType = 'admin';

                next();
            }
        });
    }

    function checkForm(req, res, next) {
        if (req.body.email === undefined || req.body.password === undefined) {

            errorResponse(res, 400, 'Malformed Request')
        } else {

            next();
        }
    }

    function checkDuplicate(req, res, next) {
        const body = req.body;
        const query = datastore.createQuery(ENTITY_KEY).filter('email', '=', body.email);

        datastore.runQuery(query, function (error, entities) {
            if (error) {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            } else if (entities.length > 0) {

                errorResponse.send(res, 409, 'Account Exists');
            } else {

                next();
            }
        });
    }

    function checkPassword(req, res, next) {
        const user = res.locals.userData;
        const password = hashPassword(req.body['password']);

        if (user.password_hash === password) {

            next();
        } else {

            errorResponse.send(res, 401, 'Invalid Email/Password Combo');
        }
    }

    function hashPassword(password) {
        if (!password) {

            return null;
        } else {

            return crypto.createHmac('sha256', secret.password_secret)
                .update(password)
                .digest('hex');
        }
    }

    function checkStatus(req, res, next) {
        const user = res.locals.userData;

        if (user.status) {

            next();
        } else {

            errorResponse.send(res, 403, 'Inactive Account');
        }
    }

    function saveEmployee(req, res) {
        datastore.save({
            key: datastore.key([ENTITY_KEY]),
            excludeFromIndexes: ['phone', 'password_hash'],
            data: {
                email: req.body.email,
                phone: '',
                active: true,
                role: permissions.ROLES.EMPLOYEE,
                password_hash: crypto.createHmac('sha256', secret.password_secret)
                    .update(req.body.password)
                    .digest('hex')
            }
        }, function (error) {

            errorResponse(res, 500, 'Internal Server Error', error);
        });
    }
};

