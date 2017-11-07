const winston = require('winston');

const level = process.env.LOG_LEVEL || 'debug';

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: level,
            timestamp: function () {
                return (new Date()).toISOString();
            }
        })
    ]
});

logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};

logger.errorStream = {
    write: function(message, encoding){
        logger.error(message);
    }
};

module.exports = logger;