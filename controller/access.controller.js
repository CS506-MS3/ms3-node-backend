function accessController(
    express, bodyParser, auth, access, pricings
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
            access.cancelSubscription,
            access.updateAccess
        );

    return router;

}

module.exports = accessController;
