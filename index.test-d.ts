import { expectType } from 'tsd';
import { ForkOptions } from 'child_process';
import { fork, Coffee } from '.';

const coffee = fork('echo 1');
expectType<Coffee<ForkOptions>>(coffee.includes('stdout', 'hi'));
