const assert = require('assert');

module.exports = (function () {
    'use strict';

    function get(expectedStatus, expectedJson) {
        return {
            json: function (actual) {
                assert.deepEqual(actual, expectedJson);
            },
            status: function (responseStatus) {
                assert.equal(responseStatus, expectedStatus);

                return this;
            }
        };
    }

    return {
        get: get
    };
})();