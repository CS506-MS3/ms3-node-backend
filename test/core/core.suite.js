const utilsSpec = require('./utils.spec');
const permissionsSpec = require('./permissions.spec');

module.exports = (function () {
    'use strict';

    function runSuite() {
        describe('Core Module Tests:', function () {
           utilsSpec.run();
           permissionsSpec.run();
        });
    }

    return {
        runSuite: runSuite
    }
})();