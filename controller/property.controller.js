function propertyController(
    express, bodyParser, permissions, auth
) {
    'use strict';

    const router = express.Router();

    router.use(bodyParser.urlencoded({extended: true}));
    router.use(bodyParser.json());

    router.route('/')
        .post(
            auth.checkAuth,
            auth.checkInactiveToken,
            permissions.getRoleGuard([
                permissions.ROLES.USER
            ]),
            // Check User's Access
            // properties.create // Save Property & Update User's my property list
        )
        .get(
            // properties.getList
        );

    router.route('/:id')
        .get(
            // If user has auth
                // If user has customer access
                    // return full detail
            // Else
                // Hide owner info & contact
        )
        .delete(
            auth.checkAuth,
            auth.checkInactiveToken,
            permissions.getRoleGuard([
                permissions.ROLES.EMPLOYEE,
                permissions.ROLES.SUPER_ADMIN
            ]),
            // properties.delete
        );

    return router;
}

module.exports = propertyController;