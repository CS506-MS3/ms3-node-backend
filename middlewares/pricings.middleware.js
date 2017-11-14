function pricingsMiddleware(datastore, errorResponse, CONFIG) {
    'use strict';

    const ENTITY_KEY = CONFIG.ENTITY_KEYS.PRICINGS;

    return {
        getList,
        getAdditionalPricing
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

    function getAdditionalPricing(req, res, next) {
        if (res.locals.additional === true) {
            const query = datastore.createQuery(ENTITY_KEY).filter('type', '=', 'VENDOR_ADDITIONAL');

            datastore.runQuery(query)
                .then((result) => {
                    const entity = result[0];
                    res.locals.additional_price = entity.price * 100;
                    next();
                })
                .catch((error) => errorResponse.send(res, 500, 'Internal Server Error', error));
        }

    }
}

module.exports = pricingsMiddleware;