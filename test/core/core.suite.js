const utilsSpec = require('./utils.spec');

module.exports = (function () {
    'use strict';

    function runSuite() {
        describe('Core Module Tests:', function () {
           utilsSpec.run();
        });
    }

    return {
        runSuite: runSuite
    }
})();