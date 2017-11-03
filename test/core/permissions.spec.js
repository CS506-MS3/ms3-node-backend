const permissions = require('../../core/permissions');
const assert = require('assert');
const supertest = require('supertest');
const should = require('should');
const sinon = require('sinon');

const mockResponseFactory = require('../helper/mock-response.factory');

module.exports = (function () {
    'use strict';

    function run() {
        describe('Permissions Specs:', function () {
            testRoles();
            getRoleGuard();
            getOwnerGuard();
        });
    }

    function testRoles() {
        describe('const: roles', function () {
            it('should define user, employee and superadmin', function () {

                assert.equal(permissions.ROLES.USER, 'user');
                assert.equal(permissions.ROLES.EMPLOYEE, 'employee');
                assert.equal(permissions.ROLES.SUPER_ADMIN, 'superadmin');
            });
        });
    }

    function getRoleGuard() {
        describe('method: getRoleGuard', function () {
            let guard, res, req;
            let next;
            let roles = ['user', 'superadmin'];

            beforeEach(function () {
                guard = permissions.getRoleGuard(roles);
                next = sinon.spy();
            });

            describe('Token Extraction Check', function () {
                before(function () {
                    res = mockResponseFactory.get(403, {
                        message: 'Invalid Permissions'
                    });
                    res = Object.assign(res, {locals: {}});
                });

                it('should send 403 if a token has not been defined', function () {

                    guard(req, res, next);
                    next.should.have.not.been.called;
                });
            });

            describe('Role Check', function () {
                before(function () {
                    res = mockResponseFactory.get(403, {
                        message: 'Invalid Permissions'
                    });
                    res = Object.assign(res, {
                        locals: {
                            decoded: {
                                data: {
                                    type: 'employee'
                                }
                            }
                        }
                    });
                });

                it('should set 403 if decoded role is not is roles', function () {

                    guard(req, res, next);
                    next.should.have.not.been.called;
                });

                it('should call next if role matches', function () {
                    res = Object.assign(res, {
                        locals: {
                            decoded: {
                                data: {
                                    type: 'superadmin'
                                }
                            }
                        }
                    });

                    guard(req, res, next);
                    next.should.have.been.called;
                });
            });
        });
    }

    function getOwnerGuard() {
        describe('method: getOwnerGuard', function () {
            let guard, res, req;
            let next;
            let roles = ['user', 'superadmin'];
            let paramKey = 'id';

            beforeEach(function () {
                guard = permissions.getOwnerGuard(paramKey, roles);
                next = sinon.spy();
            });

            describe('Token Extraction Check', function () {
                before(function () {
                    res = mockResponseFactory.get(403, {
                        message: 'Invalid Permissions'
                    });
                    res = Object.assign(res, {locals: {}});
                });

                it('should send 403 if a token has not been defined', function () {

                    guard(req, res, next);
                    next.should.have.not.been.called;
                });
            });

            describe('Role Check', function () {
                before(function () {
                    res = mockResponseFactory.get(403, {
                        message: 'Invalid Permissions'
                    });
                    res = Object.assign(res, {
                        locals: {
                            decoded: {
                                data: {
                                    type: 'employee'
                                }
                            }
                        }
                    });
                });

                it('should call next if ownership check not specified for the role', function () {

                    guard(req, res, next);
                    next.should.have.been.called;
                });

                it('should throw error if if role matches but param is undefined or does not match', function () {
                    res = Object.assign(res, {
                        locals: {
                            decoded: {
                                data: {
                                    type: 'superadmin'
                                }
                            }
                        }
                    });
                    req = {
                        params: {
                        }
                    };

                    guard(req, res, next);
                    next.should.have.not.been.called;

                    req.params[paramKey] = 1;
                    res.locals.decoded.data[paramKey] = 2;
                    guard(req, res, next);
                    next.should.have.not.been.called;

                    req.params[paramKey] = 3;
                    res.locals.decoded.data[paramKey] = 3;
                    guard(req, res, next);
                    next.should.have.been.called;
                });
            });
        });
    }

    function testThrowIfFalse() {
        describe('method: throwIfFalse', function () {
            const testMessage = 'testMessage';

            it('should throw error with the input message if false param is given', function () {

                assert.throws(utils.throwIfFalse.bind(undefined, false, testMessage), Error, testMessage)
            });

            it('should not throw error if true param is given', function () {

                utils.throwIfFalse(true, testMessage);
            });
        });
    }

    return {
        run: run
    };
})();