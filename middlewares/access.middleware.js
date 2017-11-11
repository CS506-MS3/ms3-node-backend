function accessMiddleware(datastore, errorResponse, stripe, CONFIG) {
    'use strict';

    return {
    	checkStripeId: checkStripeId,
    	conditionalCreateCustomer: conditionalCreateCustomer,
    	conditionalUpdateUser: conditionalUpdateUser,
    	createSubscription: createSubscription,
    	updateUserEntity: updateUserEntity
    };

    function checkStripeId(req, res, next) {
        const key = datastore.key([CONFIG.ENTITY_KEYS.USERS, parseInt(res.locals.decoded.data.id)]);
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
    }

    function conditionalCreateCustomer(req, res, next) {
        if (res.locals.create_stripe_customer === true) {
            stripe.customers.create({
                email: res.locals.decoded.data.email
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

    function createSubscription(req, res, next) {
        stripe.subscriptions.create({
          customer: res.locals.userData.stripe_id,
          items: [
            {
              plan: req.body.type.type,
            },
          ],
          source: req.body.token.id
        }, function(err, subscription) {
            if (err) {
                errorResponse.send(res, 500, 'Internal Server Error', err);
            } else {
                if (req.body.type.type === 'VENDOR_SUBSCRIPTION') {
                    res.locals.userData.access.vendor_payment_amount = subscription.plan.amount;
                    res.locals.userData.access.vendor_next_payment_date = new Date(subscription.current_period_end * 1000);
                    next();
                } else if (req.body.type.type === 'CUSTOMER_SUBSCRIPTION') {
                    res.locals.userData.access.customer_payment_amount = subscription.plan.amount;
                    res.locals.userData.access.customer_next_payment_date = new Date(subscription.current_period_end * 1000);
                    next();
                } else {
                    errorResponse.send(res, 400, 'Malformed Request');
                }
            }
        });
    }

    function updateUserEntity(req, res) {
        let entity = {
            key: res.locals.userKey,
            excludeFromIndexes: ['phone', 'password_hash'],
            data: res.locals.userData
        };

        datastore.save(entity)
            .then(() => {
                res.status(200);
                res.json({ message: 'Success'});
            })
            .catch((error) => {
                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }
}

module.exports = accessMiddleware;