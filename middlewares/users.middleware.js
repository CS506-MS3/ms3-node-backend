const errorResponse = require('../core/error-response');
const secret = require('../secret/secret.json');
const crypto = require('crypto');


function usersMiddleware(datastore) {
    'use strict';

    const ENTITY_KEY = 'User_V1';

    datastore.runQuery(myQuery)
        .then((response) => console.log('response :' + JSON.stringify(response)))
        .catch((error) => console.log('Error: ' + error));

    return {
        getList: getList,
        getUser: getUser,
        isActive: isActive,
        isInactive: isInactive,
        activate: activate,
        deactivate: deactivate,
        checkPassword: checkPassword,
        checkEmail: checkEmail
    };

    function getList(req, res) {
        const query = datastore.createQuery(ENTITY_KEY);

        datastore.runQuery(query)
            .then((entities) => {

                res.status(200).json(entities);
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }

    function getUser(req, res, next) {
        const key = datastore.key([ENTITY_KEY, req.params.id]);
        datstore.get(key)
            .then((result) => {
                let entity = result[0];
                if (entity) {

                    res.locals.userData = entity;
                    res.locals.userKey = key;
                    next();
                } else {

                    errorResponse.sent(res, 404, 'User Not Found');
                }
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            })
    }

    function isActive(req, res, next) {

        checkStatus(true, req, res, next);
    }

    function isInactive(req, res, next) {

        checkStatus(false, req, res, next);
    }

    function checkStatus(status, req, res, next) {
        const key = res.locals.userKey;
        const entity = res.locals.userData;

        if (entity.status === status) {

            res.locals.userData = entity;
            res.locals.userKey = key;
            next();
        } else {

            errorResponse(res, 409, 'Account Already Active');
        }
    }

    function activate(req, res) {

        updateStatus(true, req, res);
    }

    function deactivate(req, res) {

        updateStatus(false, req, res);
    }

    function updateStatus(status, req, res) {
        let entity = {
            key: res.locals.userKey,
            excludeFromIndexes: ['phone', 'password_hash'],
            data: res.locals.userData
        };
        entity.data.active = status;

        datastore.save(entity)
            .then(() => {

                res.status(200).json({
                    id: entity.key.id,
                    active: entity.data.active
                });
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }
    
    function checkPassword(req, res, next) {
        if (req.body.password === undefined) {

            errorResponse.send(res, 400, 'Malformed Request');
        } else {
            const entity = res.locals.userData;
            const password_hash = hashPassword(password);

            if (entity.password_hash !== password_hash) {

                errorResponse.send(res, 401, 'Invalid Email/Password Combo');
            } else {

                next();
            }
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

    function checkEmail(req, res, next) {
        const entity = res.locals.userData;
        const decoded = res.locals.decoded;

        if (entity.email === decoded.email) {

            next();
        } else {

            errorResponse.send(res, 401, 'Invalid Auth Token');
        }
    }
}

module.exports = usersMiddleware;