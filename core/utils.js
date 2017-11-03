module.exports = (function () {
    'use strict';

    function throwIfFalse(bool, message) {
        if (!bool) {
            throw new Error(message);
        }
    }

    return {
        throwIfFalse: throwIfFalse
    };
})();