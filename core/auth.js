function authMiddleware(
    datastore, errorResponse, secret, jwt, CONFIG
) {
    'use strict';

    const SignInForm = require('./sign-in-form');

    const TOKEN_EXPIRY = CONFIG.TOKEN_CONFIG.DEFAULT_EXPIRY;
    const ENTITY_KEY = CONFIG.ENTITY_KEYS.TOKEN_BLACKLIST;

    return {
        validateForm: validateForm,
        authEmployee: authEmployee,
        checkAuth: checkAuth,
        checkInactiveToken: checkInactiveToken,
        deactivateToken: deactivateToken
    };

    function validateForm(req, res, next) {
        let form = new SignInForm(req.body);
        if (form.isValid()) {
            next();
        } else {
            res.status(400).json({message: 'Malformed Request'});
        }
    }

    function authEmployee(req, res, next) {
        try {
            const user = res.locals.userData;
            const userId = res.locals.userKey.id;

            const token = jwt.sign({
                data: {
                    id: userId,
                    email: user.email,
                    type: user.role
                }
            }, secret.token_secret, {expiresIn: TOKEN_EXPIRY});

            res.status(200).json({
                token: token,
                user: {
                    id: userId,
                    email: user.email,
                    phone: user.phone
                }
            });
        } catch (error) {

            errorResponse.send(res, 500, 'Internal Server Error', error);
        }
    }

    function checkAuth(req, res, next) {
        const token = req.get('token');

        try {
            res.locals.token = token;
            res.locals.decoded = decodeToken(token);

            next();
        } catch (error) {

            errorResponse(res, 401, 'Invalid Token', error);
        }
    }

    function decodeToken(token) {
        const decoded = jwt.verify(token, secret.token_secret);
        if (decoded.data.id === undefined || decoded.data.email === undefined || decoded.data.type === undefined) {

            throw new Error('Missing JWT Payload Property');
        } else {

            return decoded;
        }
    }

    function checkInactiveToken(req, res, next) {
        const query = datastore.createQuery(ENTITY_KEY).filter('token', '=', res.locals.token);

        datastore.runQuery(query, function (error, entities) {
            if (error) {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            } else if (entities.length === 0) {

                res.locals.tokenKey = datastore.key([ENTITY_KEY]);
                res.locals.tokenData = {
                    token : res.locals.token,
                    exp : res.locals.decoded.exp
                };

                next();
            } else {

                errorResponse.send(res, 204, undefined, 'Token Already Blacklisted');
            }
        });
    }

    function deactivateToken(req, res) {
        datastore.save({
            key: res.locals.tokenKey,
            data: res.locals.tokenData
        }, function(err) {
            if (err) {
                console.error(err);
            }
        });

        res.status(204).send();
    }
}

module.exports = authMiddleware;
