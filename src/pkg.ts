import { createRequire } from 'node:module';

const { name, version } = createRequire(import.meta.url)('../package.json')

export { name, version };
