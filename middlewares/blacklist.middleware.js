function blacklistMiddleware(datastore, errorResponse, CONFIG) {
    'use strict';

    const ENTITY_KEY = CONFIG.ENTITY_KEYS.EMAIL_BLACKLIST;

    return {
        add: add,
        getList: getList,
        remove: remove
    };

    function add(req, res) {
        let userKey = datastore.key([CONFIG.ENTITY_KEYS.USERS, req.body.email]);
        let blacklistKey = datastore.key([ENTITY_KEY, req.body.email]);
        let blacklistEntity = {
            key: blacklistKey,
            data: {
                email: req.body.email,
                createdAt: new Date().toJSON()
            }
        };

        const transaction = datastore.transaction();
        transaction.run()
            .then(() => transaction.get(userKey))
            .then((results) => {
                const user = results[0];
                const entities = [blacklistEntity];
                if (user) {
                    user.active = false;
                    entities.push({
                        key: userKey,
                        data: user
                    });
                }
                transaction.save(entities);
                return transaction.commit();
            })
            .then(() => {
                res.status(200).json({
                    id: blacklistKey.name,
                    email: blacklistEntity.data.email,
                    createdAt: blacklistEntity.data.createdAt
                });
                return new Promise((resolve, reject) => resolve());
            })
            .catch((error) => {
                errorResponse.send(res, 500, 'Internal Server Error', error);
                transaction.rollback();
            });
    }

    function getList(req, res) {
        const query = datastore.createQuery(ENTITY_KEY);

        datastore.runQuery(query, function (error, entities) {
            if (error) {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            } else {

                // Skip pagination for now.
                res.status(200).json({
                    list: entities
                });
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
}

module.exports = blacklistMiddleware;
