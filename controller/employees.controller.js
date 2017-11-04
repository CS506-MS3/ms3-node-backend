function employeesController(
    express, bodyParser, permissions, auth, employees, CONFIG
) {
    'use strict';

    const router = express.Router();

    router.use(bodyParser.urlencoded({extended: true}));
    router.use(bodyParser.json());

    router.use(function timeLog(req, res, next) {
        console.log('In Employee Controller @ Time: ', Date.now());
        next();
    });

    router.route('/')
        .post(
            auth.checkAuth,
            permissions.getRoleGuard([CONFIG.ROLES.SUPER_ADMIN]),
            employees.checkForm,
            employees.checkDuplicate,
            employees.saveEmployee
        )
        .get(
            auth.checkAuth,
            permissions.getRoleGuard([
                CONFIG.ROLES.EMPLOYEE, CONFIG.ROLES.SUPER_ADMIN
            ]),
            employees.getList
        );

    router.route('/:id')
        .delete(
            auth.checkAuth,
            permissions.getRoleGuard([CONFIG.ROLES.SUPER_ADMIN]),
            employees.getByKey,
            employees.remove
        );

    return router;
}

module.exports = employeesController;