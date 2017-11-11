function userController(
    express, bodyParser, permissions, mailer, auth, users
) {
    'use strict';

    const router = express.Router();

    router.use(bodyParser.urlencoded({extended: true}));
    router.use(bodyParser.json());

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
        .put(
            auth.checkAuth,
            auth.checkInactiveToken,
            permissions.getRoleGuard([
                permissions.ROLES.EMPLOYEE,
                permissions.ROLES.SUPER_ADMIN
            ]),
            users.getUser,
            users.checkBlacklist,
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

    router.route('/:id/info')
    .get(
        auth.checkAuth,
        auth.checkInactiveToken,
        permissions.getRoleGuard([
                permissions.ROLES.USER,
                permissions.ROLES.EMPLOYEE,
                permissions.ROLES.SUPER_ADMIN
        ]),
        permissions.getOwnerGuard(
                "id",
                permissions.ROLES.USER
        ),
        users.getUser,
        function(req, res) {
            if (res.locals.userData === undefined) {
                errorResponse.send(res, 500, 'Internal Server Error');
            } else {
                res.status(200);
                res.json(res.locals.userData);
            }
        }
    );

    return router;
}

module.exports = userController;
