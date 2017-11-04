module.exports = (function () {
    'use strict';

    const ENTITY_KEY = 'Email_Blacklist_Dev';

    function getList(req, res) {
        const query = datastore.createQuery(ENTITY_KEY);

        datastore.runQuery(query, function (error, entities) {
           if (error) {

               errorResponse.send(res, 500, 'Internal Server Error', error);
           } else if (entities.length === 0) {

               res.status(200).json([]);
           } else {

               // Skip pagination for now.
               res.status(200).json(entities);
           }
        });
    }

    return {
        getList: getList
    };
})();