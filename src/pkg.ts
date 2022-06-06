// @ts-ignore
import { read } from 'fsxx';
import { createRequire } from 'node:module';

// const { name, version } = await read.json`./package.json`;

const { name, version } = createRequire(import.meta.url)('../package.json')

export { name, version };
