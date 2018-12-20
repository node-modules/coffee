'use strict';

const Coffee = require('../../..').Coffee;
const CustomRule = require('./rule_custom');

class MyCoffee extends Coffee {

  constructor(...args) {
    super(...args);
    this.setRule('custom', CustomRule);
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
