'use strict';

const fs = require('fs');
const Rule = require('../../..').Rule;

class CustomRule extends Rule {
  // expect('custom', 'package.json')
  assert(actual, expected) {
    return super.assert(fs.existsSync(expected), true, `should exists file ${expected}`);
  }

  formatMessage(actual, expected, message) {
    return message;
  }
}

module.exports = CustomRule;
