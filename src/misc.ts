import { question, chalk, which } from 'zx';
import ora from 'ora';
// @ts-ignore
import { echo } from 'zx/experimental';
import { default as pkg } from 'compare-versions';
import { collect, logCollectInfo } from './collect.js';
import { promisifyExec } from './utils.js';

const oraInst = ora('process misc...');

async function reInstallGit() {
  const ver = await promisifyExec<string>(`git version`);

  oraInst.stopAndPersist();
  const configNow = await question(
    `\n${chalk.yellowBright(
      'Config your global git info now? The first install pls select: Y. (Y/n)?'
    )}`,
    {
      choices: ['Y', 'n'],
    }
  );
  if (configNow === 'Y') {
    const yourName = await question('Your name: ', { choices: [] });
    const yourEmail = await question('Your email: ', { choices: [] });

    // for MacOS m1
    await promisifyExec(`git config --global core.compression 0`);
    await promisifyExec(`git config --global http.postBuffer 1048576000`);

    await promisifyExec(`git config --global user.name "${yourName}"`);
    await promisifyExec(`git config --global user.email "${yourEmail}"`);
  }
  oraInst.start();

  if (pkg.compare(ver.slice(12, -1), '2.36.1', '>=')) {
    collect.setSkipped('git');
    return;
  }

  await promisifyExec(`brew reinstall git`);

  collect.setInstalled('git');
}

async function installOhMyZsh() {
  const stdout = await which('zsh');
  if (stdout.includes('/bin/zsh')) {
    collect.setSkipped('oh-my-zsh');
    return;
  }

  try {
    echo`${chalk.blue('\ninstall oh-my-zsh...')}`;
    await promisifyExec(
      `sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"`
    );

    // add oh-my-zsh plugins
    await addZshPlugins();

    // set homebrew path
    await promisifyExec(`echo "export PATH=/opt/homebrew/bin:$PATH" >> ~/.zshrc`);
    // set git language
    await promisifyExec(`echo "alias git='LANG=en_GB git'" >> ~/.zshrc`);

    await promisifyExec(`source ~/.zshrc`);

    collect.setInstalled('oh-my-zsh');
  } catch (error) {
    collect.setFailed('oh-my-zsh');
  }
}

async function addZshPlugins() {
  // install the plugin for zsh-autosuggestions
  echo`${chalk.blue('\nadd plugin zsh-autosuggestions...')}`;
  await promisifyExec(
    `git clone https://github.com/zsh-users/zsh-autosuggestions ~/.zsh/zsh-autosuggestions`
  );
  await promisifyExec(
    `echo "source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh" >> ~/.zshrc`
  );

  // install the plugin for zsh-syntax-highlighting
  echo`${chalk.blue('\nadd plugin zsh-syntax-highlighting...')}`;
  await promisifyExec(
    `git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting`
  );
  await promisifyExec(
    `echo "source ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" >> ~/.zshrc`
  );
}

async function installAutoJump() {
  const installed = await whichInstalled('autojump');
  if (installed) {
    collect.setSkipped('autojump');
    return;
  }

  try {
    await promisifyExec(`brew install autojump`);
    collect.setInstalled('autojump');
  } catch (error) {
    collect.setFailed('autojump');
  }
}

async function installVinciCli() {
  const stdout = await which(`vinci`);
  if (stdout.includes('/bin/vinci')) {
    collect.setSkipped('silversearcher-ag');
    return;
  }

  try {
    await promisifyExec(`npm install -g vinci-cli --registry=https://npm.cew.io/`);
    collect.setInstalled('vinci-cli');
  } catch (error) {
    collect.setFailed('vinci-cli');
  }
}

async function installAg() {
  const stdout = await which(`ag`);
  if (stdout.includes('/bin/ag')) {
    collect.setSkipped('silversearcher-ag');
    return;
  }

  try {
    await promisifyExec(`brew install silversearcher-ag`);
    collect.setInstalled('silversearcher-ag');
  } catch (error) {
    collect.setFailed('silversearcher-ag');
  }
}

async function installNrm() {
  const installed = await whichInstalled('nrm');
  if (installed) {
    return;
  }

  try {
    await promisifyExec(`npm install -g nrm`);
    await promisifyExec(`nrm add cew https://npm.cew.io/`);
    await promisifyExec(`nrm use cew`);

    collect.setInstalled('nrm');
  } catch (error) {
    collect.setFailed('nrm');
  }
}

async function installZx() {
  const installed = await whichInstalled('zx');
  if (installed) {
    return;
  }

  try {
    await promisifyExec(`npm install -g zx`);
    collect.setInstalled('zx');
  } catch (error) {
    collect.setFailed('zx');
  }
}

async function whichInstalled(shellName: string, appName?: string) {
  const stdout = await which(shellName).catch(() => '');

  if (stdout.includes('/bin/' + shellName)) {
    collect.setSkipped(appName || shellName);
    return true;
  }
  return false;
}

const misc = new Set<{
  name: string;
  desc: string;
  install: () => Promise<void>;
}>();
misc.add({
  name: 'git',
  desc: 'reinstall git and set some global config.',
  install: reInstallGit,
});

misc.add({
  name: 'oh-my-zsh',
  desc: 'install zsh and set some plugins: <autosuggestions|highlight...>.',
  install: installOhMyZsh,
});

misc.add({
  name: 'nrm',
  desc: 'install npm registry manage tool, default is https://npm.cew.io/.',
  install: installNrm,
});

misc.add({
  name: 'zx',
  desc: 'fancy bash.',
  install: installZx,
});

misc.add({
  name: 'zsh-plugins',
  desc: 'should be used while zsh installed. plugins: <autosuggestions|highlight...>.',
  install: addZshPlugins,
});

misc.add({
  name: 'autojump',
  desc: 'j <short path>',
  install: installAutoJump,
});

misc.add({
  name: 'silversearcher-ag',
  desc: 'search by ag like grep.',
  install: installAg,
});

misc.add({
  name: 'vinci-cli',
  desc: 'boot project with fe-template by `vinci list`.',
  install: installVinciCli,
});

async function installMisc() {
  const candidates = [...misc];
  oraInst.start();
  while (candidates.length) {
    const item = candidates.shift()!;
    oraInst.start(`install ${item.name}...`);
    await item.install();
    oraInst.succeed('processed ' + item.name);
  }
  oraInst.stop();
  logCollectInfo();
}

function listAllMisc() {
  echo`${chalk.blue('\nweapon command: `weapon use misc` will install all the following tools:')}`;
  console.table([...misc].map((m) => ({ tool: m.name })));
}

async function oneByOneByType(type: string) {
  const item = [...misc].find((m) => m.name === type);
  if (item) {
    oraInst.start(`install ${item.name}...`);
    await item.install();
    oraInst.succeed('processed ' + item.name);
    oraInst.stop();
    logCollectInfo();
  } else {
    console.log(chalk.red(`unknown type: ${type}`));
  }
}

export { misc, listAllMisc, installMisc, oneByOneByType };
