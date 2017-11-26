function wishlistController(
    express, bodyParser, auth, wishlist
) {
    'use strict';

    const router = express.Router();

    router.use(bodyParser.urlencoded({extended: true}));
    router.use(bodyParser.json());

    router.route('/')
        .post(
            auth.checkAuth,
            auth.checkInactiveToken,
            wishlist.add
        );

    router.route('/:id')
        .delete(
            auth.checkAuth,
            auth.checkInactiveToken,
            wishlist.remove
        );

    return router;
}

module.exports = wishlistController;