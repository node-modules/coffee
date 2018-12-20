#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const tmpDir = path.join(__dirname, '.tmp');

const pkg = {
  name: 'rule_file',
  version: '1.0.0',
};

fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(pkg, null, 2));
fs.writeFileSync(path.join(tmpDir, 'README.md'), 'hello world');
