function propertyController(
    express, bodyParser, permissions, auth, properties
) {
    'use strict';

    const router = express.Router();

    router.use(bodyParser.urlencoded({extended: true}));
    router.use(bodyParser.json());

    router.route('/options')
        .get(
            properties.getOptions
        );

    router.route('/')
        .post(
            auth.checkAuth,
            auth.checkInactiveToken,
            permissions.getRoleGuard([
                permissions.ROLES.USER
            ]),
            properties.validateCreateForm,
            properties.create // Save Property & Update User's my property list
            // Check User's Access - If has subscription, send 200. If not, send 402
        )
        .get(
            properties.getList
        );

    router.route('/:id')
        .get(
            // If user has auth
                // If user has customer access
                    // return full detail
            // Else
                // Hide owner info & contact
        )
        .put(
            auth.checkAuth,
            auth.checkInactiveToken,
            permissions.getRoleGuard([
                permissions.ROLES.EMPLOYEE,
                permissions.ROLES.SUPER_ADMIN
            ]),
            properties.validateUpdateForm,
            properties.update
        )
        .delete(
            auth.checkAuth,
            auth.checkInactiveToken,
            permissions.getRoleGuard([
                permissions.ROLES.USER,
                permissions.ROLES.EMPLOYEE,
                permissions.ROLES.SUPER_ADMIN
            ]),
            properties.remove
        );

    return router;
}

module.exports = propertyController;