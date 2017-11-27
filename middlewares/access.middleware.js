function accessMiddleware(datastore, errorResponse, stripe, CONFIG) {
    'use strict';

    return {
        checkStripeId: checkStripeId,
        conditionalCreateCustomer: conditionalCreateCustomer,
        conditionalUpdateUser: conditionalUpdateUser,
        validatePaymentType: validatePaymentType,
        createSubscription: createSubscription,
        createCharge: createCharge,
        updateUserEntity: updateUserEntity,
        cancelSubscription: cancelSubscription,
        updateAccess: updateAccess,
        cancelSubscriptionCheck: cancelSubscriptionCheck
    };

    function checkStripeId(req, res, next) {
        const key = datastore.key([CONFIG.ENTITY_KEYS.USERS, parseInt(res.locals.decoded.data.id) || res.locals.decoded.data.id]);
        datastore.get(key)
            .then((result) => {
                let entity = result[0];
                if (entity) {
                    res.locals.userData = entity;
                    res.locals.userKey = key;
                    if (entity.stripe_id === '0') {
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
    }

    function conditionalCreateCustomer(req, res, next) {
        if (res.locals.create_stripe_customer === true) {
            stripe.customers.create({
                email: res.locals.decoded.data.email
            }, function (err, customer) {
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
    }

    function conditionalUpdateUser(req, res, next) { // update user entity if necessary
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

    function validatePaymentType(req, res, next) {
        try {
            if (res.locals.userData.access === undefined ||
                res.locals.userData.access.vendor_next_payment_date === undefined ||
                res.locals.userData.access.vendor_payment_amount === undefined ||
                res.locals.userData.access.customer_next_payment_date === undefined ||
                res.locals.userData.access.customer_payment_amount === undefined ||
                res.locals.userData.access.vendor_additional_paid === undefined
            ) {
                throw new Error("Missing Access Property");
            }
            var now = new Date();
            switch (req.body.type.type) {
                case 'VENDOR_SUBSCRIPTION':
                    if (res.locals.userData.access.vendor_next_payment_date >= now) {
                        errorResponse.send(res, 409, 'Vendor Access Already Active');
                    } else {
                        res.locals.vendor = true;
                        next();
                    }
                    break;
                case 'CUSTOMER_SUBSCRIPTION':
                    if (res.locals.userData.access.customer_next_payment_date >= now) {
                        errorResponse.send(res, 409, 'Customer Access Already Active');
                    } else {
                        res.locals.customer = true;
                        next();
                    }
                    break;
                case 'VENDOR_ADDITIONAL':
                    if (res.locals.userData.access.vendor_next_payment_date < now) {
                        errorResponse.send(res, 403, 'Vendor Access Required');
                    } else if (res.locals.userData.access.vendor_additional_paid === true) {
                        errorResponse.send(res, 409, 'Vendor Additional Already Paid');
                    } else {
                        res.locals.additional = true;
                        res.locals.additional_price = req.body.type.price;
                        next();
                    }
                    break;
                default:
                    errorResponse.send(res, 400, 'Malformed Request');
                    break;
            }
        } catch (err) {
            errorResponse.send(res, 500, 'Internal Server Error', err);
        }
    }

    function createSubscription(req, res, next) {
        const CENTS_PER_DOLLAR = 100;
        const MILLISECONDS_PER_SECOND = 1000;
        if (res.locals.vendor === true || res.locals.customer === true) {
            stripe.subscriptions.create({
                customer: res.locals.userData.stripe_id,
                items: [
                    {
                        plan: req.body.type.type,
                    },
                ],
                source: req.body.token.id
            }, function (err, subscription) {
                if (err) {
                    errorResponse.send(res, 500, 'Internal Server Error', err);
                } else {
                    if (res.locals.vendor === true) {
                        res.locals.userData.access.vendor_payment_amount = subscription.plan.amount / CENTS_PER_DOLLAR;
                        res.locals.userData.access.vendor_next_payment_date = new Date(subscription.current_period_end * MILLISECONDS_PER_SECOND);
                        res.locals.userData.access.vendor_subscription_id = subscription.id;
                        next();
                    } else if (res.locals.customer === true) {
                        res.locals.userData.access.customer_payment_amount = subscription.plan.amount / CENTS_PER_DOLLAR;
                        res.locals.userData.access.customer_next_payment_date = new Date(subscription.current_period_end * MILLISECONDS_PER_SECOND);
                        res.locals.userData.access.customer_subscription_id = subscription.id;
                        next();
                    } else {
                        errorResponse.send(res, 500, 'Internal Server Error');
                    }
                }
            });
        } else {
            next();
        }
    }

    function createCharge(req, res, next) {
        if (res.locals.additional === true) {
            stripe.charges.create({
                amount: res.locals.additional_price,
                currency: "usd",
                description: "Vendor Additional Charge",
                source: req.body.token.id,
            }, function (err, charge) {
                if (err) {
                    errorResponse.send(res, 500, 'Internal Server Error', err);
                } else {
                    next();
                }
            });
        } else {
            next();
        }
    }

    function updateUserEntity(req, res) {
        const user = res.locals.userData;
        const propertyKeys = user.properties;
        const userEntity = {
            key: res.locals.userKey,
            excludeFromIndexes: ['phone', 'password_hash'],
            data: res.locals.userData
        };

        if (res.locals.additional) {
            // No need to update user, just update property
            if (propertyKeys.length > 0) {
                const propertyKey = datastore.key([
                    CONFIG.ENTITY_KEYS.PROPERTIES, parseInt(propertyKeys[propertyKeys.length - 1])]);
                datastore.get(propertyKey)
                    .then((result) => {
                        const property = result[0];
                        if (property && !property.status) {
                            property.status = true;

                            return datastore.save({
                                key: propertyKey,
                                data: property
                            })

                        } else {

                            return new Promise((resolve, reject) => reject('Additional payment has been made, but no matching property exists'));
                        }
                    })
                    .then(() => {
                        res.status(200).json({message: 'Success'});
                    })
                    .catch((error) => {
                        errorResponse.send(res, 500, 'Internal Server Error', error);
                    });
            } else {
                const error = 'Additional payment has been made, but no matching property exists';
                errorResponse.send(res, 500, 'Internal Server Error', error);
            }
        } else {
            // Update User and property if any
            if (propertyKeys.length > 0) {
                // just update the first property on the list
                const propertyKey = datastore.key([CONFIG.ENTITY_KEYS.PROPERTIES, parseInt(propertyKeys[0])]);
                const transaction = datastore.transaction();
                transaction.run()
                    .then(() => transaction.get(propertyKey))
                    .then((results) => {
                        const property = results[0];
                        const entities = [userEntity];
                        if (property && !property.status) {
                            property.status = true;
                            entities.push({
                                key: propertyKey,
                                data: property
                            });
                        }
                        transaction.save(entities);
                        return transaction.commit();
                    })
                    .then(() => {
                        res.status(200).json({message: 'Success'});
                    })
                    .catch((error) => {
                        errorResponse.send(res, 500, 'Internal Server Error', error);
                    });
            } else {
                datastore.save(userEntity)
                    .then(() => {
                        res.status(200).json({message: 'Success'});
                    })
                    .catch((error) => {
                        errorResponse.send(res, 500, 'Internal Server Error', error);
                    });
            }
        }
    }

    function cancelSubscriptionCheck(req, res, next) {
        if (req.body.type === 'VENDOR') {
            if (res.locals.tokenUser.stripe_id === '0' || 
                res.locals.tokenUser.access.vendor_subscription_id === '0' ||
                res.locals.tokenUser.access.vendor_next_payment_date < Date.now()
                ) {
                errorResponse.send(res, 403, 'No Existing Access');
            } else {
                res.locals.subscription_id = res.locals.tokenUser.access.vendor_subscription_id;
                next();
            }
        } else if (req.body.type === 'CUSTOMER') {
            if (res.locals.tokenUser.stripe_id === '0' ||
                res.locals.tokenUser.access.customer_subscription_id === '0' ||
                res.locals.tokenUser.access.customer_next_payment_date < Date.now()
                ) {
                errorResponse.send(res, 403, 'No Existing Access');
            } else {
                res.locals.subscription_id = res.locals.tokenUser.access.customer_subscription_id;
                next();
            }
        } else {
            errorResponse.send(res, 400, 'Malformed Request');
        }
    }

    function cancelSubscription(req, res, next) {
        stripe.subscriptions.del(
            res.locals.subscription_id,
            function(err, confirmation) {
                if (err) {
                    errorResponse.send(res, 500, 'Internal Server Error', err);
                } else {
                    var yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);  
                    if (req.body.type === 'VENDOR') {
                        res.locals.tokenUser.access.vendor_subscription_id = '0';
                        res.locals.tokenUser.access.vendor_next_payment_date = yesterday;
                    } else if (req.body.type === 'CUSTOMER') {
                        res.locals.tokenUser.access.customer_subscription_id = '0';
                        res.locals.tokenUser.access.customer_next_payment_date = yesterday;
                    } else {
                        errorResponse.send(res, 500, 'Internal Server Error');
                    }
                    res.locals.confirmation = confirmation;
                    next();
                }
            }
        );
    }

    function updateAccess(req, res) {
        datastore.save(res.locals.tokenUser)
            .then(() => {
                res.status(200).json({
                    confirmation: res.locals.confirmation
                });
            })
            .catch((error) => {
                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }
}

module.exports = accessMiddleware;
