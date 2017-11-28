module.exports = (function () {
    'use strict';
    const logger = require('./logger');

    function send(res, status, message, error) {
        if (error) {

            logger.error(error);
        }

        if (message) {

            res.status(status).json({message: message});
        } else {

            res.status(status).send();
        }
    }

    return {
        send: send
    };
})();