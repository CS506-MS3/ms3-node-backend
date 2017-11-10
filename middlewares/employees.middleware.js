function employeesMiddleware(datastore, errorResponse, secret, crypto, CONFIG) {
    'use strict';

    const ENTITY_KEY = CONFIG.ENTITY_KEYS.EMPLOYEES;

    return {
        get: get,
        checkPassword: checkPassword,
        checkStatus: checkStatus,
        checkForm: checkForm,
        checkDuplicate: checkDuplicate,
        saveEmployee: saveEmployee,
        getList: getList,
        getByKey: getByKey,
        remove: remove
    };

    function get(req, res, next) {
        const body = req.body;
        const query = datastore.createQuery(ENTITY_KEY).filter('email', '=', body.email);

        datastore.runQuery(query, function (error, entities) {
            if (error) {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            } else if (entities.length === 0) {

                errorResponse.send(res, 401, 'Account Not Found');
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

            errorResponse.send(res, 400, 'Malformed Request')
        } else {

            next();
        }
    }

    function checkDuplicate(req, res, next) {
        const body = req.body;
        const query = datastore.createQuery(ENTITY_KEY).filter('email', '=', body.email);

        datastore.runQuery(query)
            .then((results) => {
                const entities = results[0];

                if (entities.length > 0) {

                    errorResponse.send(res, 409, 'Account Exists');
                } else {

                    next();
                }

            })
            .catch((error) => {
                errorResponse.send(res, 500, 'Internal Server Error', error);
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

        if (user.active) {

            next();
        } else {

            errorResponse.send(res, 403, 'Inactive Account');
        }
    }

    function saveEmployee(req, res) {
        const entity = {
            key: datastore.key([ENTITY_KEY]),
            excludeFromIndexes: ['phone', 'password_hash'],
            data: {
                email: req.body.email,
                phone: req.body.phone || '',
                active: true,
                role: CONFIG.ROLES.EMPLOYEE,
                created_at: new Date().toJSON(),
                updated_at: new Date().toJSON(),
                password_hash: crypto.createHmac('sha256', secret.password_secret)
                    .update(req.body.password)
                    .digest('hex')
            }
        };

        datastore.save(entity)
            .then(() => res.status(201).json({message: 'Employee Created'}))
            .catch((error) => errorResponse.send(res, 500, 'Internal Server Error', error));
    }

    function getList(req, res) {
        const query = datastore.createQuery(ENTITY_KEY).filter('role', '=', CONFIG.ROLES.EMPLOYEE);

        datastore.runQuery(query)
            .then((response) => {
                const entities = response[0];

                res.status(200).json(entities.map((entity) => {
                    return {
                        id: parseInt(entity[datastore.KEY].id) || entity[datastore.KEY].name,
                        email: entity.email,
                        phone: entity.phone || '',
                        active: entity.active
                    };
                }));
            })
            .catch((error) => {
                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }

    function getByKey(req, res, next) {
        const key = datastore.key([ENTITY_KEY, parseInt(req.params.id) || req.params.id]);

        datastore.get(key)
            .then((response) => {
                const entity = response[0];

                if (entity) {
                    next();
                } else {
                    errorResponse.send(res, 404, 'Employee Not Found');
                }
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server error', error);
            });
    }

    function remove(req, res) {
        const key = datastore.key([ENTITY_KEY, parseInt(req.params.id) || req.params.id]);

        datastore.delete(key)
            .then(() => {

                res.status(200).json({
                    id: key.id
                });
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }
}

module.exports = employeesMiddleware;
