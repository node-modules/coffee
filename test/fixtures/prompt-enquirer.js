#!/usr/bin/env node

'use strict';

const { prompt } = require('enquirer');

prompt.on('prompt', prompt => {
  // console.log(prompt);
  process.send && process.send({ type: 'prompt' });
});

async function run() {
  const answers = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is your name?',
    },
    {
      type: 'select',
      name: 'color',
      message: 'Pick a flavor',
      choices: [ 'apple', 'grape', 'watermelon', 'cherry', 'orange' ],
    },
  ]);
  console.log(answers);
}

run().catch(console.error);
