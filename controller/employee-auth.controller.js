function employeeAuthController(
    express, bodyParser, auth, employees
) {
    'use strict';

    const router = express.Router();

    router.use(bodyParser.urlencoded({extended: true}));
    router.use(bodyParser.json());

    router.use(function timeLog(req, res, next) {
        console.log('In Employee Auth Controller @ Time: ', Date.now());
        next();
    });

    router.route('/')
        .post(
            auth.validateForm,
            employees.get,
            employees.checkPassword,
            employees.checkStatus,
            auth.authEmployee
        )
        .delete(
            auth.checkAuth,
            auth.checkInactiveToken,
            auth.deactivateToken
        );

    return router;
}

module.exports = employeeAuthController;