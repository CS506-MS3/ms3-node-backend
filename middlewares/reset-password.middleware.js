function resetPasswordMiddleware(datastore, errorResponse, secret, crypto, jwt, CONFIG) {
    'use strict';

    const ENTITY_KEY = CONFIG.ENTITY_KEYS.USERS;
    const TOKEN_EXPIRY = CONFIG.TOKEN_CONFIG.PASSWORD_RESET_LINK_EXPIRY;

    return {
    	getUserByEmail: getUserByEmail,
    	passwordResetToken: passwordResetToken
    };

    function getUserByEmail(req, res, next) {
    	if (req.body.email === undefined) {
			errorResponse.send(res, 400, 'Malformed Request');
		} else {
			const query = datastore.createQuery(ENTITY_KEY)
                .filter('email', '=', req.body.email)

            datastore.runQuery(query)
                .then((response) => {
                    const entities = response[0];
                    if (entities.length === 0) {
                        errorResponse.send(res, 404, 'User Not Found');
                    } else {
                    	res.locals.userKey = entities[0][datastore.KEY];
                        res.locals.userData = entities[0][0];
                        console.log(res.locals.userKey);
                        console.log(res.locals.userData);
                        next();
                    }
                })
                .catch((error) => {
                    errorResponse.send(res, 500, 'Internal Server Error', error);
                });
		}
    }

    function passwordResetToken(req, res, next) {
    	const token = jwt.sign({
            data: {
                id: res.locals.userKey.id,
                email: req.body.email,
                type: 'password'
            }
        }, secret.token_secret, {expiresIn: TOKEN_EXPIRY});
        res.locals.token = token;
        next();
    }
}

module.exports = resetPasswordMiddleware;