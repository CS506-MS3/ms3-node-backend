/* Core Dependencies */
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const logger = require('./core/logger');

/* Other 3rd Party Dependencies */
const secret = require('./secret/secret.json');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

/* Import Core Modules */
const permissions = require('./core/permissions');
const errorResponseService = require('./core/error-response');
const Tokenizer = require('./core/tokenizer.service');
const Mailer = require('./core/mail.service');

/* Import Middlewares */
const AuthMiddleware = require('./core/auth');
const EmployeesMiddleware = require('./middlewares/employees.middleware');
const UsersMiddleware = require('./middlewares/users.middleware');
const BlacklistMiddleware = require('./middlewares/blacklist.middleware');
const PropertiesMiddleware = require('./middlewares/properties.middleware');
const PricingsMiddleware = require('./middlewares/pricings.middleware');

/* Import Controllers */
const EmployeesController = require('./controller/employees.controller');
const EmployeeAuthController = require('./controller/employee-auth.controller');
const BlacklistController = require('./controller/blacklist.controller');
const UserController = require('./controller/user.controller');
const PricingsController = require('./controller/pricings.controller');

/* Import Config Constants */
const CONFIG = {
    WEB_URL: 'https://ms3-web.firebaseapp.com',
    TOKEN_CONFIG: require('./configs/token.config'),
    ROLES: require('./configs/roles.constants'),
    ENTITY_KEYS: require('./configs/entity-keys.constants'),
    MAILER: {
        FROM: 'ms3.cs506@gmail.com'
    }
};
// TODO: CONFIG & ENV should be combined
/* Import Env */
const ENV = require('./environments/environment')();

/* Set-up Scripts */
require('./core/super-admin-creator')();

/* Initialize Application */
const app = express();
const router = express.Router();

/* Global Route Settings */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* Connect DB */
const datastore = ENV.connectToDatastore();

/* Initialize Core Services */
const tokenizer = new Tokenizer(jwt, secret, CONFIG);
const mailer = Mailer(nodemailer, tokenizer, secret, CONFIG);

/* Initialize Middleware */
const auth = AuthMiddleware(datastore, errorResponseService, secret, jwt, CONFIG);
const employees = EmployeesMiddleware(datastore, errorResponseService, secret, crypto, CONFIG);
const users = UsersMiddleware(datastore, errorResponseService, secret, crypto, CONFIG);
const blacklist = BlacklistMiddleware(datastore, errorResponseService, CONFIG);
const pricings = PricingsMiddleware(datastore, errorResponseService, CONFIG);

/* Initialize Controllers */
const employeesController = EmployeesController(express, bodyParser, permissions, auth, employees, CONFIG);
const employeeAuthController = EmployeeAuthController(express, bodyParser, auth, employees);
const blacklistController = BlacklistController(express, bodyParser, permissions, auth, blacklist, CONFIG);
const userController = UserController(express, bodyParser, permissions, mailer, auth, users);
const pricingsController = PricingsController(express, pricings);

/* Add Routes */
router.use('/employees', employeesController);
router.use('/employee-auth', employeeAuthController);
router.use('/blacklist', blacklistController);
router.use('/users', userController);
router.use('/pricings', pricingsController);

// TODO: REFACTOR CONTROLLERS
const authController = require('./controller/auth_controller');
const reactivateController = require('./controller/reactivate_controller');
const activateController = require('./controller/activate_controller');
router.use('/auth', authController);
router.use('/reactivate', reactivateController);
router.use('/activate', activateController);

// TODO /api/access
// TODO /api/

app.get('/', function(req, res){
	res.send('Hello');
});

app.use(morgan('dev', {
    skip: function (req, res) {
        return res.statusCode < 400
    }, stream: logger.errorStream
}));

app.use(morgan('dev', {

    skip: function (req, res) {
        return res.statusCode >= 400
    }, stream: logger.stream
}));

/* Run */
app.use('/api', router);
app.listen(ENV.PORT, () => logger.info(`Application Server listening on port ${ENV.PORT}`));

