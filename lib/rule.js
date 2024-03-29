'use strict';

const is = require('is-type-of');
const assert = require('assert');
const show = require('./show');

class Rule {
  constructor({ ctx, type, expected, args, isOpposite, isIncludes }) {
    this.ctx = ctx;
    this.type = type;
    this.expected = [].concat(expected);
    this.args = args;
    this.isOpposite = isOpposite === true;
    // only work for stdout and stderr
    this.isIncludes = isIncludes === true;
  }

  validate(message) {
    const actual = this.ctx[this.type];
    for (const expected of this.expected) {
      message = this.formatMessage(actual, expected, message);
      this.assert(actual, expected, message);
    }
  }

  assert(actual, expected, message) {
    const assertFn = assert[this.isOpposite ? 'notStrictEqual' : 'strictEqual'];

    if (is.regexp(expected)) {
      return assertFn(expected.test(actual), true, message);
    }
    if (this.isIncludes) {
      return assertFn(actual.includes(expected), true, message);
    }

    return assertFn(actual, expected, message);
  }

  formatMessage(actual, expected, message) {
    message = message || `match ${this.type}`;
    const expectedAction = this.isIncludes ? 'expected includes' : 'expected';
    return `should ${this.isOpposite ? 'not ' : ''}${message} ${expectedAction} \`${this.inspectObj(expected)}\` but actual \`${this.inspectObj(actual)}\``;
  }

  inspectObj(obj) {
    return show(obj);
  }
}

module.exports = Rule;
