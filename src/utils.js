import { default as shell } from 'shelljs'

export const promisifyExec = async (cmd) => {
  let resolve, reject
  let promise = new Promise((...args) => ([resolve, reject] = args))

  shell.exec(cmd, { silent: true }, (code, stdout, stderr) => {
    if (code === 0) {
      resolve(stdout)
    } else {
      reject(stderr)
    }
  })

  return promise
}