function pricingsMiddleware(datastore, errorResponse, CONFIG) {
    'use strict';

    const ENTITY_KEY = CONFIG.ENTITY_KEYS.PRICINGS;

    return {
        getList
    };

    function getList(req, res) {
        const query = datastore.createQuery(ENTITY_KEY);

        datastore.runQuery(query)
            .then((result) => {
                const entities = result[0];

                res.status(200).json(entities.map((entity) => {
                    return Object.assign({}, {id: entity[datastore.KEY].id}, entity);
                }));
            })
            .catch((error) => errorResponse.send(res, 500, 'Internal Server Error', error));

    }
}

module.exports = pricingsMiddleware;