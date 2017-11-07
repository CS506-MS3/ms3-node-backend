function blacklistController(
    express, bodyParser, permissions, auth, blacklist, CONFIG
) {
    'use strict';

    const router = express.Router();

    router.use(bodyParser.urlencoded({extended: true}));
    router.use(bodyParser.json());

    router.use(function timeLog(req, res, next) {
        console.log('In Blacklist Controller @ Time: ', Date.now());
        next();
    });

    router.route('/')
        .post(
            auth.checkAuth,
            permissions.getRoleGuard([
                CONFIG.ROLES.EMPLOYEE, CONFIG.ROLES.SUPER_ADMIN
            ]),
            blacklist.checkDuplicate,
            blacklist.add
        )
        .get(
            auth.checkAuth,
            permissions.getRoleGuard([
                CONFIG.ROLES.EMPLOYEE, CONFIG.ROLES.SUPER_ADMIN
            ]),
            blacklist.getList
        );

    router.route('/:id')
        .delete(
            auth.checkAuth,
            permissions.getRoleGuard([
                CONFIG.ROLES.EMPLOYEE, CONFIG.ROLES.SUPER_ADMIN
            ]),
            blacklist.remove
        );

    return router;
}

module.exports = blacklistController;