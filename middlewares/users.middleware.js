const errorResponse = require('../core/error-response');

function usersMiddleware(datastore) {
    'use strict';

    const ENTITY_KEY = 'User_V1';

    datastore.runQuery(myQuery)
        .then((response) => console.log('response :' + JSON.stringify(response)))
        .catch((error) => console.log('Error: ' + error));

    return {
        getList: getList,
        isInactive: isInactive,
        deactivate: deactivate
    };

    function getList(req, res) {
        const query = datastore.createQuery(ENTITY_KEY);

        datastore.runQuery(query)
            .then((entities) => {

                res.status(200).json(entities);
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }

    function isInactive(req, res, next) {
        const requiredStatus = false;

        const key = datastore.key([ENTITY_KEY, req.params.id]);
        datstore.get(key)
            .then((result) => {
                let entity = result[0];
                if (entity) {
                    if (entity.status === requiredStatus) {

                        res.locals.userData = entity;
                        res.locals.userKey = key;
                        next();
                    } else {

                        errorResponse(res, 409, 'Account Already Active');
                    }
                } else {

                    errorResponse.sent(res, 404, 'User Not Found');
                }
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            })
    }

    function deactivate(req, res) {
        let entity = {
            key: res.locals.userKey,
            excludeFromIndexes: ['phone', 'password_hash'],
            data: res.locals.userData
        };
        entity.data.active = false;

        datastore.save(entity)
            .then(() => {

                res.status(200).json({
                    id: entity.key.id,
                    active: true
                });
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }
}

module.exports = usersMiddleware;