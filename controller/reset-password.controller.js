function resetPasswordController(
    express, bodyParser, permissions, mailer, auth, users, resetPassword
) {
    'use strict';

    const router = express.Router();

    router.use(bodyParser.urlencoded({extended: true}));
    router.use(bodyParser.json());

    router.route('/')
    	.post(
    		resetPassword.requestResetPasswordLinkConditionCheck,
    		resetPassword.getUserByEmail,
    		resetPassword.passwordResetToken,
    		mailer.sendPasswordResetLink
    	)
    	.put(
    		resetPassword.parseResetPasswordToken,
    		auth.checkInactiveToken,
    		auth.passwordChangeDeactivateToken,
    		resetPassword.getUserByEmail,
    		resetPassword.resetPassword,
    		mailer.sendPasswordChangeNotification
    	);

    return router;
}

module.exports = resetPasswordController;
