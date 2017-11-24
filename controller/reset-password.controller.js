function resetPasswordController(
    express, bodyParser, permissions, mailer, auth, users
) {
    'use strict';

    const router = express.Router();

    router.use(bodyParser.urlencoded({extended: true}));
    router.use(bodyParser.json());

    router.route('/')
        .put(auth.checkAuth,
            auth.checkInactiveToken,
            permissions.getRoleGuard([
                permissions.ROLES.USER
            ]),
            users.getUser,
            permissions.runIf([
                permissions.ROLES.USER
            ], users.checkPassword),
            permissions.runIf([
                permissions.ROLES.USER
            ], users.checkEmail),
            users.resetPassword,
            mailer.sendPasswordResetNotification
        );

    return router;
}

module.exports = resetPasswordController;
