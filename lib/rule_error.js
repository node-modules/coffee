'use strict';

const is = require('is-type-of');
const Rule = require('./rule');

class ErrorRule extends Rule {
  validate(message) {
    // only validate when got error
    if (!this.ctx.error) return;
    return super.validate(message);
  }

  assert(actual, expected, message) {
    if (is.error(expected)) expected = expected.message;
    if (is.error(actual)) actual = actual.message;
    return super.assert(actual, expected, message);
  }
}

module.exports = ErrorRule;
