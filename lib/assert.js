'use strict';

const assert = require('assert');
const debug = require('debug')('coffee:assert');
const show = require('./show');

module.exports = coffeeAssert;

function coffeeAssert(expected, actual, message) {
  for (let rule of expected) {
    const isOpposite = rule.isOpposite;
    rule = rule.value;

    if (Array.isArray(rule)) {
      coffeeAssert(rule, actual, message);
      continue;
    }

    if (rule instanceof Error) {
      debug('error object %j', rule);
      rule = rule.message;
    }

    debug('actual: `%s`, expected: `%s`, isOpposite: `%s`', show(actual), show(rule), isOpposite);

    const msg = 'should' + (isOpposite ? ' not ' : ' ') + message;

    if (rule instanceof RegExp) {
      assert.strictEqual(rule.test(actual), !isOpposite,
        msg + ' expected `' + show(rule) + '` but actual `' + show(actual) + '`');
      continue;
    }

    assert[isOpposite ? 'notStrictEqual' : 'strictEqual'](actual, rule,
      msg + ' expected `' + show(rule) + '` but actual `' + show(actual) + '`');
  }
}
