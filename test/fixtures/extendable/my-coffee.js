'use strict';

const Coffee = require('../../..').Coffee;
const FileRule = require('./rule_file');

class MyCoffee extends Coffee {

  constructor(...args) {
    super(...args);
    this.RuleMapping.file = FileRule;
  }

  expectFile(file, pattern) {
    this._addAssertion({
      type: 'file',
      expected: {
        file,
        pattern,
      },
    });
    return this;
  }

  notExpectFile(file, pattern) {
    this._addAssertion({
      type: 'file',
      expected: {
        file,
        pattern,
      },
      isOpposite: true,
    });
    return this;
  }


  restore() {
    super.restore();
    this.fileCache = {};
    return this;
  }
}


module.exports = MyCoffee;
