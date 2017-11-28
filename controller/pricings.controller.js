function pricingsController(
    express, pricings
) {
    'use strict';

    const router = express.Router();

    router.route('/')
        .get(
            pricings.getList
        );

    return router;
}

module.exports = pricingsController;