function resetPasswordMiddleware(datastore, errorResponse, secret, crypto, jwt, CONFIG) {
    'use strict';

    const ENTITY_KEY = CONFIG.ENTITY_KEYS.USERS;
    const TOKEN_EXPIRY = CONFIG.TOKEN_CONFIG.PASSWORD_RESET_LINK_EXPIRY;

    return {
        requestResetPasswordLinkConditionCheck: requestResetPasswordLinkConditionCheck,
    	getUserByEmail: getUserByEmail,
    	passwordResetToken: passwordResetToken,
        parseResetPasswordToken: parseResetPasswordToken,
        resetPassword: resetPassword
    };

    function requestResetPasswordLinkConditionCheck(req, res, next) {
        if (req.body.email === undefined) {
            errorResponse.send(res, 400, 'Malformed Request');
        } else {
            res.locals.email = req.body.email;
            next();
        }
    }

    function getUserByEmail(req, res, next) {
		const query = datastore.createQuery(ENTITY_KEY)
            .filter('email', '=', res.locals.email)

        datastore.runQuery(query)
            .then((response) => {
                const entities = response[0];
                if (entities.length === 0) {
                    errorResponse.send(res, 404, 'User Not Found');
                } else {
                	res.locals.userKey = entities[0][datastore.KEY];
                    res.locals.userData = entities[0];
                    next();
                }
            })
            .catch((error) => {
                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
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

    function parseResetPasswordToken(req, res, next) {
        if (req.body.password === undefined ||
            req.body.token === undefined) {
            errorResponse.send(res, 400, 'Malformed Request');
        } else {
            try {
                var token = req.body.token;
                var decoded = jwt.verify(token, secret.token_secret);
                if ((decoded.data.id === undefined && decoded.data.name === undefined) || decoded.data.email === undefined || decoded.data.type === undefined) {
                    throw new Error('Missing JWT Payload Property');
                } else if (decoded.data.type !== 'password') {
                    throw new Error('Invalid Token Type');
                } else {
                    res.locals.token = token;
                    res.locals.decoded = decoded;
                    res.locals.email = decoded.data.email;
                    next();
                }
            } catch (error) {
                console.error(error);
                res.status(401);
                res.json({ message: 'Invalid Reset Password Token' });
            } 
        }
    }

    function resetPassword(req, res, next) {
        var password_hash = crypto.createHmac('sha256', secret.password_secret)
                .update(req.body.password)
                .digest('hex');
        if (res.locals.userData.password_hash !== password_hash) {
            res.locals.userData.password_hash = password_hash;
            const entity = {
                key: res.locals.userKey,
                excludeFromIndexes: ['phone', 'password_hash'],
                data: res.locals.userData
            };

            datastore.save(entity)
                .then(() => {
                    next();
                })
                .catch((error) => {
                    errorResponse.send(res, 500, 'Internal Server Error', error);
                });
        } else {
            res.status(200).json({message: 'No changes', token: res.locals.auth_token });
        }
    }
}

module.exports = resetPasswordMiddleware;
