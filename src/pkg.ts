// @ts-ignore
import { read } from 'fsxx';

const { name, version } = await read.json`package.json`;

export { name, version };
