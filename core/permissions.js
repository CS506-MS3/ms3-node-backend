const utils = require('./utils');
const logger = require('./logger');

module.exports = (function () {
    'use strict';

    const ROLES = {
        USER: 'user',
        EMPLOYEE: 'employee',
        SUPER_ADMIN: 'superadmin'
    };

    function getRoleGuard(roles) {

        return runRoleCheckMiddleware.bind(undefined, roles);
    }

    function runRoleCheckMiddleware(roles, req, res, next) {
        try {
            utils.throwIfFalse(isTokenDecoded(res), 'Token not extracted at previous step');

            const data = res.locals.decoded.data;
            utils.throwIfFalse(hasRole(roles, data), 'Invalid Permissions');

            next();
        } catch (err) {
            console.error(err);
            res.status(403).json({message: 'Invalid Permissions'});
        }
    }

    function isTokenDecoded(res) {

        return res.locals.decoded;
    }

    function hasRole(roles, data) {

        return roles.includes(data.type);
    }

    function getOwnerGuard(roles) {

        return runOwnerCheckMiddleware.bind(undefined, roles);
    }

    function runOwnerCheckMiddleware(roles, req, res, next) {
        try {
            utils.throwIfFalse(isTokenDecoded(res), 'Token not extracted at previous step');

            const data = res.locals.decoded.data;
            const paramKey = req.params.id;
            console.log(paramKey);
            if (hasRole(roles, data)) {
                utils.throwIfFalse(checkOwnershipParam(paramKey, data, req), 'Not an owner');
                next();
            } else {
                next();
            }
        } catch (err) {
            logger.error(err);
            res.status(403).json({message: 'Invalid Permissions'});
        }
    }

    function checkOwnershipParam(paramKey, data, req) {

        return data[paramKey] && req.params[paramKey] &&
            data[paramKey] === req.params[paramKey];
    }

    function runIf(roles, middleware) {

        return conditionalMiddlewareSelector.bind(undefined, roles, middleware);
    }

    function conditionalMiddlewareSelector(roles, middleware, req, res, next) {
        const data = res.locals.decoded.data;

        if (hasRole(roles, data)) {

            return middleware(req, res, next);
        } else {

            return skipMiddleware(req, res, next);
        }
    }

    function skipMiddleware(req, res, next) {
        next();
    }

    return {
        ROLES: ROLES,
        getRoleGuard: getRoleGuard,
        getOwnerGuard: getOwnerGuard,
        runIf: runIf
    };
})();