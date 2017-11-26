function usersMiddleware(datastore, errorResponse, secret, crypto, CONFIG) {
    'use strict';

    const ENTITY_KEY = CONFIG.ENTITY_KEYS.USERS;

    return {
        getList: getList,
        getUser: getUser,
        getUserInfo: getUserInfo,
        checkBlacklist: checkBlacklist,
        isActive: isActive,
        isInactive: isInactive,
        activate: activate,
        deactivate: deactivate,
        checkPassword: checkPassword,
        checkEmail: checkEmail,
        checkCreateForm: checkCreateForm,
        checkDuplicate: checkDuplicate,
        createUser: createUser,
        updateUser: updateUser,
        changePassword: changePassword
    };

    function getList(req, res) {
        const query = datastore.createQuery(ENTITY_KEY);

        datastore.runQuery(query)
            .then((result) => {
                const entities = result[0];

                res.status(200).json(entities.map((entity) => {
                    return Object.assign({}, {id: entity[datastore.KEY].id || entity[datastore.KEY].name}, entity);
                }));
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }

    function getUser(req, res, next) {
        const key = datastore.key([ENTITY_KEY, parseInt(req.params.id) || req.params.id]);
        datastore.get(key)
            .then((result) => {
                let entity = result[0];
                if (entity) {

                    res.locals.userData = entity;
                    res.locals.userKey = key;
                    next();
                } else {

                    errorResponse.send(res, 404, 'User Not Found');
                }
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            })
    }

    function getUserInfo(req, res) {
        if (res.locals.userData === undefined) {
            errorResponse.send(res, 500, 'Internal Server Error');
        } else {
            delete res.locals.userData.password_hash;
            delete res.locals.userData.stripe_id;

            if (res.locals.userData.properties && res.locals.userData.properties.length > 0) {
                const propertyKeys = res.locals.userData.properties.map((keyString) => {
                    return datastore.key([CONFIG.ENTITY_KEYS.PROPERTIES, parseInt(keyString)]);
                });

                datastore.get(propertyKeys)
                    .then((results) => {
                        let entities = results[0];
                        if (entities) {
                            res.locals.userData.properties = entities.map((entity) => {
                                return {
                                    id: entity[datastore.KEY].id,
                                    title: entity.title,
                                    address: getAddressString(entity.address),
                                    status: entity.status,
                                    startDate: entity.startDate,
                                    duration: entity.duration,
                                    price: entity.price
                                };
                            });
                        }
                        res.status(200).json(res.locals.userData);
                    })
                    .catch((error) => {

                        errorResponse.send(res, 500, 'Internal Server Error', error);
                    });
            } else {
                res.locals.userData.properties = [];
                res.status(200).json(res.locals.userData);
            }

        }
    }

    function getAddressString(address) {

        return `${address.detailLevel2}, ${address.city}, ${address.state}`;
    }

    function checkBlacklist(req, res, next) {
        const key = datastore.key([CONFIG.ENTITY_KEYS.EMAIL_BLACKLIST, res.locals.userData.email]);

        datastore.get(key)
            .then((result) => {
                let blacklistedEmail = result[0];
                if (blacklistedEmail) {
                    errorResponse.send(res, 403, 'Email Blacklisted');
                } else {
                    next();
                }
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

        if (entity.active === status) {

            res.locals.userData = entity;
            res.locals.userKey = key;
            next();
        } else {

            errorResponse.send(res, 409, 'Account Already Active');
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
            const password_hash = hashPassword(req.body.password);

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

        if (entity.email === decoded.data.email) {

            next();
        } else {

            errorResponse.send(res, 401, 'Invalid Auth Token');
        }
    }

    function checkCreateForm(req, res, next) {
        if (req.body.email === undefined || req.body.password === undefined ||
            req.body.notification === undefined || req.body.notification.marketing === undefined
        ) {

            errorResponse.send(res, 400, 'Malformed Request');
        } else {

            next();
        }
    }

    function checkDuplicate(req, res, next) {
        const query = datastore.createQuery(ENTITY_KEY).filter('email', '=', req.body.email);
        datastore.runQuery(query)
            .then((response) => {
                const entities = response[0];
                if (entities.length === 0) {

                    next();
                } else {

                    errorResponse.send(res, 409, 'Account Already Exists', entities);
                }
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }

    function createUser(req, res, next) {
        const password = hashPassword(req.body.password);
        const key = datastore.key([ENTITY_KEY, req.body.email]);
        const entity = {
            key: key,
            excludeFromIndexes: ['phone', 'password_hash'],
            data: {
                bid: {},
                wishlist: [],
                access: {
                    customer_next_payment_date: null,
                    vendor_next_payment_date: null,
                    customer_payment_amount: 5,
                    vendor_payment_amount: 5,
                    vendor_additional_paid: false
                },
                phone: req.body.phone ? null : req.body.phone,
                properties: [],
                stripe_id: 0,
                active: false,
                email: req.body.email,
                password_hash: password,
                notification: {
                    marketing: req.body.notification.marketing
                }
            }
        };

        datastore.save(entity)
            .then(() => {
                res.locals.activationData = {
                    id: key.id || key.name,
                    email: req.body.email,
                    type: 'activation'
                };

                next();
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }

    function updateUser(req, res, next) {
        if (req.body.phone === undefined || 
            req.body.notification === undefined || 
            req.body.notification.marketing === undefined) {
            errorResponse.send(res, 400, 'Malformed Request');
        } else if (typeof req.body.notification.marketing !== 'boolean' ||
            req.body.phone.toString().match(/\d/g).length !== 10) {
            errorResponse.send(res, 400, 'Malformed Request');
        } else if (res.locals.userData.phone === req.body.phone &&
                   res.locals.userData.notification.marketing === req.body.notification.marketing) {
            res.status(200).json({message: 'No Changes'});
        } else {
            const key = res.locals.userKey;
            res.locals.userData.phone = req.body.phone;
            res.locals.userData.notification.marketing = req.body.notification.marketing;
            const entity = {
                key: key,
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
        }
    }

    function changePassword(req, res, next) {
        if (req.body.new_password === undefined) {
            errorResponse.send(res, 400, 'Malformed Request');
        }else if (res.locals.userData.password_hash !== hashPassword(req.body.new_password)) {
            res.locals.userData.password_hash = hashPassword(req.body.new_password);
            const entity = {
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
            res.status(200).json({message: 'No changes', token: res.locals.auth_token });
        }
    }

}

module.exports = usersMiddleware;
