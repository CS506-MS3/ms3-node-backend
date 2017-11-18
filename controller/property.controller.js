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
            properties.create, // Save Property & Update User's my property list
            properties.validateAccess
        )
        .get(
            properties.getList
        );

    router.route('/:id')
        .get(
            properties.get,
            properties.processPropertyDetail
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