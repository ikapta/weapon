import { chalk } from 'zx';

class Collect {
  #installed = new Set<string>();
  #failed = new Set<string>();
  #skipped = new Set<string>();

  constructor() {}

  getInstalled() {
    return this.#installed;
  }

  setInstalled(name: string) {
    this.#installed.add(name);
  }

  getFailed() {
    return this.#failed;
  }

  setFailed(name: string) {
    this.#failed.add(name);
  }

  getSkipped() {
    return this.#skipped;
  }

  setSkipped(name: string) {
    return this.#skipped.add(name);
  }
}

export const collect = new Collect();

export const logCollectInfo = () => {
  const checkNone = (set: Set<string>) => {
    return set.size > 0 ? [...set].join(', ') : '<empty>';
  };

  console.log(chalk.yellow('\n✨ The result for adorable you.\n'));
  console.info(`${chalk.cyan(' 1. installed (congrats!):')} ${checkNone(collect.getInstalled())}`);
  console.error(`${chalk.red(' 2. failed (oops~):')} ${checkNone(collect.getFailed())}`);
  console.warn(`${chalk.dim(' 3. skipped (already.):')} ${checkNone(collect.getSkipped())}`);
  console.log('\n');
};
