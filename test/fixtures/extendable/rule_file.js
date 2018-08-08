'use strict';

const fs = require('fs');
const Rule = require('../../..').Rule;

class FileRule extends Rule {
  // expect('file', 'package.json')
  assert(actual, expected) {
    return super.assert(fs.existsSync(expected), true, `should exists file ${expected}`);
  }

  formatMessage(actual, expected, message) {
    return message;
  }
}

module.exports = FileRule;
