module.exports = (function () {
    'use strict';

    const Datastore = require('@google-cloud/datastore');

    function connectToDatastore() {

        return Datastore();
    }

    return {
        PORT: 3000,
        connectToDatastore: connectToDatastore
    };
});