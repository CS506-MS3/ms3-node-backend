const utils = require('../../core/utils');
const assert = require('assert');
const supertest = require('supertest');
const should = require('should');

module.exports = (function () {
    'use strict';

    function run() {
        describe('Utils Specs:', function () {
            testThrowIfFalse();
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