'use strict';

const fs = require('fs');
const Rule = require('../../..').Rule;

class FileRule extends Rule {
  // expect('file', 'README', /x = y/)
  // expect('file', 'package.json')
  assert(actual, expected, message) {
    const { file, pattern } = expected;
    // check file exists
    if (pattern === undefined) {
      return super.assert(fs.existsSync(file), true, message);
    }

    const content = this.getFile(file);
    return super.assert(content, pattern, message);
  }

  formatMessage(actual, expected, message) {
    const { file, pattern } = expected;

    // check file exists
    if (pattern === undefined) {
      return `should ${this.isOpposite ? 'not ' : ''}exists file ${file}`;
    }

    const content = this.getFile(file);
    return `should ${this.isOpposite ? 'not ' : ''}${message || `match ${this.type}(${file})`} expected \`${this.inspectObj(pattern)}\` but actual \`${this.inspectObj(content)}\``;
  }

  getFile(file) {
    let content = this.ctx.fileCache[file];
    if (!content) {
      content = this.ctx.fileCache[file] = fs.readFileSync(file, 'utf-8');
    }
    return content;
  }
}

module.exports = FileRule;
