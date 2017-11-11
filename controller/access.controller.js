function accessController(
    express, bodyParser, auth, access
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
            access.createSubscription,
            access.updateUserEntity
        );

    return router;

}

module.exports = accessController;
