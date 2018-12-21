'use strict';

const Coffee = require('../../..').Coffee;
const FileRule = require('./rule_file');
const CustomRule = require('./rule_custom');

class MyCoffee extends Coffee {

  constructor(...args) {
    super(...args);
    this.setRule('custom', CustomRule);
    this.setRule('file', FileRule);
  }

  restore() {
    const ret = super.restore();
    this.file = {};
    return ret;
  }

  static fork(modulePath, args, opt) {
    return new MyCoffee({
      method: 'fork',
      cmd: modulePath,
      args,
      opt,
    });
  }
}


module.exports = MyCoffee;
