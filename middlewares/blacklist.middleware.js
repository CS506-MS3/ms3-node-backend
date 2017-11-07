function blacklistMiddleware(datastore, errorResponse, CONFIG) {
    'use strict';

    const ENTITY_KEY = CONFIG.ENTITY_KEYS.EMAIL_BLACKLIST;

    return {
        add: add,
        getList: getList,
        remove: remove,
        checkDuplicate: checkDuplicate
    };

    function add(req, res) {
        let key = datastore.key([ENTITY_KEY]);
        let entity = {
            key: key,
            data: {
                email: req.body.email,
                createdAt: new Date().toJson()
            }
        };

        datastore.save(entity)
            .then(() => {

                res.status(200).json({
                    id: key.id,
                    email: entity.data.email,
                    createdAt: entity.data.createdAt
                });
            })
            .catch((error) => {

                errorResponse(res, 500, 'Internal Server Error', error);
            });
    }

    function getList(req, res) {
        const query = datastore.createQuery(ENTITY_KEY);

        datastore.runQuery(query, function (error, entities) {
            if (error) {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            } else {

                // Skip pagination for now.
                res.status(200).json(entities);
            }
        });
    }

    function remove(req, res) {
        const key = datastore.key([ENTITY_KEY, req.params['id']]);

        datastore.delete(key)
            .then(() => {

                res.status(200).json({id: key.id});
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }

    function checkDuplicate(req, res, next) {
        const body = req.body;
        const query = datastore.createQuery(ENTITY_KEY).filter('email', '=', body.email);

        datastore.runQuery(query)
            .then((result) => {
                const entities = result[0];
                if (entities.length > 0) {

                    errorResponse.send(res, 409, 'Email Exists');
                } else {

                    next();
                }
            })
            .catch((error) => {
                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }
}

module.exports = blacklistMiddleware;