const errorResponse = require('../core/error-response');

function usersMiddleware(datastore) {
    'use strict';

    const ENTITY_KEY = 'User_V1';

    datastore.runQuery(myQuery)
        .then((response) => console.log('response :' + JSON.stringify(response)))
        .catch((error) => console.log('Error: ' + error));

    return {
        getList: getList
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
}

module.exports = usersMiddleware;