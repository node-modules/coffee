'use strict';

var assert = require('assert');
var debug = require('debug')('coffee:assert');
var show = require('./show');

module.exports = function(expected, actual, message) {
  expected.forEach(function(rule) {
    if (Array.isArray(rule)) {
      return module.exports(rule, actual, message);
    }

    debug('actual: `%s`, expected: `%s`', show(actual), show(rule));

    if (rule instanceof RegExp) {
      return assert(rule.test(actual),
        message + ' expected `' + show(rule) + '` but actual `' + show(actual) + '`');
    }

    assert.strictEqual(actual, rule,
      message + ' expected `' + show(rule) + '` but actual `' + show(actual) + '`');
  });
};
