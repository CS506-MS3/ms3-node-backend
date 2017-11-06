function userController(
    express, bodyParser, permissions, mailer, auth, users
) {
    'use strict';

    const router = express.Router();

    router.use(bodyParser.urlencoded({extended: true}));
    router.use(bodyParser.json());

    router.use(function timeLog(req, res, next) {
        console.log('In User Controller @ Time: ', Date.now());
        next();
    });

    router.route('/')
        .get(
            auth.checkAuth,
            auth.checkInactiveToken,
            permissions.getRoleGuard([
                permissions.ROLES.EMPLOYEE,
                permissions.ROLES.SUPER_ADMIN
            ]),
            users.getList
        )
        .post(
            users.checkCreateForm,
            users.checkDuplicate,
            users.createUser,
            mailer.sendActivationLink
        );

    router.route('/:id/activate')
        .get(
            auth.checkAuth,
            auth.checkInactiveToken,
            permissions.getRoleGuard([
                permissions.ROLES.EMPLOYEE,
                permissions.ROLES.SUPER_ADMIN
            ]),
            users.getUser,
            users.isInactive,
            users.activate
        );

    router.route('/:id/deactivate')
        .put(auth.checkAuth,
            auth.checkInactiveToken,
            permissions.getRoleGuard([
                permissions.ROLES.USER,
                permissions.ROLES.EMPLOYEE,
                permissions.ROLES.SUPER_ADMIN
            ]),
            users.getUser,
            permissions.runIf([
                permissions.ROLES.USER
            ], users.checkPassword),
            permissions.runIf([
                permissions.ROLES.USER
            ], users.checkEmail),
            users.isActive,
            users.deactivate
        );

    return router;
}

module.exports = userController;
