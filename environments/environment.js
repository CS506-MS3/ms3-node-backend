module.exports = (function () {
    'use strict';

    const Datastore = require('@google-cloud/datastore');

    function connectToDatastore() {

        return Datastore();
    }

    return {
        connectToDatastore: connectToDatastore
    }
})();