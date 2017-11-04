module.exports = (function () {
    'use strict';

    function send(res, status, message, error) {
        if (error) {

            console.log(error);
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