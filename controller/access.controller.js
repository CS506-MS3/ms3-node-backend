function accessController(
    express, bodyParser, auth, access, pricings, mailer
) {
    'use strict';

    const router = express.Router();

    

    router.use(bodyParser.urlencoded({ extended: true }));
    router.use(bodyParser.json());
        
    router.route('/')
        .post(auth.checkAuth,
            auth.checkInactiveToken,
            access.checkStripeId,
            access.conditionalCreateCustomer,
            access.conditionalUpdateUser,
            access.validatePaymentType,
            pricings.getAdditionalPricing,
            access.createSubscription,
            access.createCharge,
            access.updateUserEntity
        )
        .put(
            auth.checkAuth,
            auth.checkInactiveToken,
            access.cancelSubscriptionCheck,
            access.cancelSubscription,
            access.updateAccess,
            mailer.sendSubscriptionCancelNotification
        );

    return router;

}

module.exports = accessController;
