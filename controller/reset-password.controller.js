function resetPasswordController(
    express, bodyParser, permissions, mailer, auth, users, resetPassword
) {
    'use strict';

    const router = express.Router();

    router.use(bodyParser.urlencoded({extended: true}));
    router.use(bodyParser.json());

    router.route('/')
    	.post(
    		resetPassword.getUserByEmail
    	)

    return router;
}

module.exports = resetPasswordController;
