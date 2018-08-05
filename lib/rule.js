'use strict';

const is = require('is-type-of');
const assert = require('assert');

module.exports = class Rule {
  constructor({ type, expected, isOpposite }) {
    this.type = type;
    this.expected = [].concat(expected);
    this.isOpposite = isOpposite === true;
  }

  assert(ctx, message) {
    let actual = ctx[this.type];
    if (is.error(actual)) actual = actual.message;

    for (let expected of this.expected) {
      if (is.error(expected)) expected = expected.message;

      const msg = this.formatMessage(expected, actual, message || `match ${this.type}`);
      const assertFn = assert[this.isOpposite ? 'notStrictEqual' : 'strictEqual'];

      if (is.regexp(expected)) {
        assertFn(expected.test(actual), true, msg);
        continue;
      }

      assertFn(actual, expected, msg);
    }
  }

  formatMessage(expected, actual, message) {
    return `should ${this.isOpposite ? 'not ' : ''}${message} expected \`${this.inspectObj(expected)}\` but actual \`${this.inspectObj(actual)}\``;
  }

  inspectObj(obj) {
    if (is.buffer(obj)) {
      obj = obj.toString();
    }
    // escape \n to \\n for good view in terminal
    return (typeof obj === 'string' ? obj.replace(/\n/g, '\\n') : obj) +
      '(' + {}.toString.call(obj).replace(/^\[object (.*)\]$/, '$1') + ')';
  }
}
