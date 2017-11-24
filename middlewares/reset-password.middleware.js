function resetPasswordMiddleware(datastore, errorResponse, secret, crypto, jwt, CONFIG) {
    'use strict';

    const ENTITY_KEY = CONFIG.ENTITY_KEYS.USERS;

    return {
    	getUserByEmail: getUserByEmail
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
                        res.locals.userData = entities[0];
                        console.log(res.locals.userKey);
                        console.log(res.locals.userData);
                        //next();
                        res.status(200).json({ message: 'Get user' })
                    }
                })
                .catch((error) => {
                    errorResponse.send(res, 500, 'Internal Server Error', error);
                });
		}
    }
}

module.exports = resetPasswordMiddleware;
