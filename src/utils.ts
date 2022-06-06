import { default as shell } from 'shelljs';

export const promisifyExec = async <T>(cmd: string) => {
  let resolve = (value: any) => {};
  let reject = (reason?: any) => {};
  let promise = new Promise<T>((...args) => ([resolve, reject] = args));

  shell.exec(cmd, { silent: true }, (code, stdout, stderr) => {
    if (code === 0) {
      resolve(stdout);
    } else {
      reject(stderr);
    }
  });

  return promise;
};
