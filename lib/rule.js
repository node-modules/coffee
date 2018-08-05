'use strict';

const is = require('is-type-of');
const assert = require('assert');
const show = require('./show');

class Rule {
  constructor({ type, expected, isOpposite }) {
    this.type = type;
    this.expected = [].concat(expected);
    this.isOpposite = isOpposite === true;
  }

  assert(ctx, message) {
    for (const expected of this.expected) {
      this.validate(expected, ctx[this.type], message);
    }
  }

  validate(expected, actual, message) {
    const msg = this.formatMessage(expected, actual, message || `match ${this.type}`);
    const assertFn = assert[this.isOpposite ? 'notStrictEqual' : 'strictEqual'];

    if (is.regexp(expected)) {
      return assertFn(expected.test(actual), true, msg);
    }

    return assertFn(actual, expected, msg);
  }

  formatMessage(expected, actual, message) {
    return `should ${this.isOpposite ? 'not ' : ''}${message} expected \`${this.inspectObj(expected)}\` but actual \`${this.inspectObj(actual)}\``;
  }

  inspectObj(obj) {
    return show(obj);
  }
}

module.exports = Rule;
