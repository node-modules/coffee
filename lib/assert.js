'use strict';

var assert = require('assert');
var debug = require('debug')('coffee:assert');
var show = require('./show');

module.exports = function(expected, actual, message) {
  expected.forEach(function(rule) {
    const isOpposite = rule.isOpposite;
    rule = rule.value;

    if (Array.isArray(rule)) {
      return module.exports(rule, actual, message);
    }

    if (rule instanceof Error) {
      debug('error object %j', rule);
      rule = rule.message;
    }

    debug('actual: `%s`, expected: `%s`, isOpposite: `%s`', show(actual), show(rule), isOpposite);

    const msg = 'should' + (isOpposite ? ' not ' : ' ') + message;

    if (rule instanceof RegExp) {
      return assert.strictEqual(rule.test(actual), !isOpposite,
        msg + ' expected `' + show(rule) + '` but actual `' + show(actual) + '`');
    }

    assert[isOpposite ? 'notStrictEqual' : 'strictEqual'](actual, rule,
      msg + ' expected `' + show(rule) + '` but actual `' + show(actual) + '`');
  });
};
