function wishlistMiddleware(datastore, errorResponse, CONFIG) {
    'use strict';

    const USERS_KEY = CONFIG.ENTITY_KEYS.USERS;
    const PROPERTIES_KEY = CONFIG.ENTITY_KEYS.PROPERTIES;

    return {
        add,
        remove
    };

    function add(req, res) {
        const tokenUser = res.locals.decoded.data;
        const userKey = datastore.key([USERS_KEY, parseInt(tokenUser.id) || tokenUser.id]);
        const propertyId = parseInt(req.body.id);
        const propertyKey = datastore.key([PROPERTIES_KEY, parseInt(propertyId)]);

        Promise.all([datastore.get(propertyKey), datastore.get(userKey)])
            .then((results) => {
            console.log(results);
                let property = results[0][0];
                let user = results[1][0];
                if (property && user) {
                    user.wishlist = [...user.wishlist, propertyId];

                    return datastore.save({
                        key: userKey,
                        data: user
                    })
                        .then(() => {
                            res.status(200).json({
                                id: property[datastore.KEY].id,
                                title: property.title,
                                address: getAddressString(property.address),
                                status: property.status,
                                startDate: property.startDate,
                                duration: property.duration,
                                price: property.price
                            })
                        });
                } else {

                    errorResponse.send(res, 404, 'No such property');
                }
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }

    function getAddressString(address) {

        return `${address.detailLevel2}, ${address.city}, ${address.state}`;
    }

    function remove(req, res) {
        const tokenUser = res.locals.decoded.data;
        const userKey = datastore.key([USERS_KEY, parseInt(tokenUser.id) || tokenUser.id]);
        const propertyId = parseInt(req.params.id);

        datastore.get(userKey)
            .then((result) => {
                let user = result[0];
                if (user) {
                    user.wishlist = user.wishlist.filter((id) => {
                        return parseInt(id) !== propertyId;
                    });

                    return datastore.save({
                        key: userKey,
                        data: user
                    }).then(() => {
                        res.status(200).json({message: 'success'})
                    });
                } else {

                    errorResponse.send(res, 404, 'No such user');
                }
            })
            .catch((error) => {

                errorResponse.send(res, 500, 'Internal Server Error', error);
            });
    }
}

module.exports = wishlistMiddleware;