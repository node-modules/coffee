#!/usr/bin/env node

'use strict';

console.log('start event');

process.send('start');

setTimeout(() => {
  console.log('egg-ready event');
  process.send('egg-ready');

  setTimeout(() => {
    console.log('after message');
  }, 2000);
}, 1000);
