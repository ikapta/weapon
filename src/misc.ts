import { question, chalk } from 'zx';
import ora from 'ora';
import shell from 'shelljs';
import { echo } from 'zx/experimental';
import { collect, logCollectInfo } from './collect.js';
import { promisifyExec } from './utils.js';

const oraInst = ora('process misc...');

async function upgradeGit() {
  oraInst.stopAndPersist();

  const configNow = await question(
    `\n${chalk.yellow(
      'Config your global git info now? The first install pls select: Y. (Y/n)?'
    )}`,
    {
      choices: ['Y', 'n'],
    }
  );

  if (['Y', 'y'].includes(configNow as string)) {
    const yourName = await question('Your name: ', { choices: [] });
    const yourEmail = await question('Your email: ', { choices: [] });

    // for MacOS m1
    await promisifyExec(`git config --global core.compression 0`);
    await promisifyExec(`git config --global http.postBuffer 1048576000`);

    await promisifyExec(`git config --global user.name "${yourName}"`);
    await promisifyExec(`git config --global user.email "${yourEmail}"`);
    await promisifyExec(`git config --global init.defaultBranch main`);
  }

  oraInst.start();

  try {
    // always upgrade git to latest version
    await promisifyExec(`brew upgrade git`);
    const v = await promisifyExec<string>(`git --version`);
    collect.setInstalled(`git(upgraded: ${v.replaceAll('\n', '')})`);
  } catch (error) {
    collect.setFailed('git');
  }
}

async function installOhMyZsh() {
  const installed = await whichInstalled('zsh');
  if (installed) {
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
  const std = await promisifyExec<string>(`test -d ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions && echo "yes, installed" || echo "no, not installed"`);
  if (std.includes('no, not installed')) {
    // install the plugin for zsh-autosuggestions
    echo`${chalk.blue('\nadd plugin zsh-autosuggestions...')}`;
    try {
      await promisifyExec(
        `git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions`
      );
      await promisifyExec(
        `echo "source ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh" >> ~/.zshrc`
      );
    } catch(e) {
      collect.setFailed('zsh-autosuggestions');
    }
  } else {
    collect.setSkipped('zsh-autosuggestions');
  }

  const std2 = await promisifyExec<string>(`test -d ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting && echo "yes, installed" || echo "no, not installed"`);
  if (std2.includes('no, not installed')) {
    // install the plugin for zsh-syntax-highlighting
    echo`${chalk.blue('\nadd plugin zsh-syntax-highlighting...')}`;
    try {
      await promisifyExec(
        `git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting`
      );
      await promisifyExec(
        `echo "source ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" >> ~/.zshrc`
      );
    } catch (error) {
      collect.setFailed('zsh-syntax-highlighting');
    }
  } else {
    collect.setSkipped('zsh-syntax-highlighting');
  }
}

async function installAutoJump() {
  const installed = await whichInstalled('autojump');
  if (installed) {
    collect.setSkipped('autojump');
    return;
  }

  try {
    await promisifyExec(`brew install autojump`);
    await promisifyExec(`echo "[ -f $(brew --prefix)/share/autojump/autojump.fish ]; and source $(brew --prefix)/share/autojump/autojump.fish" >> ~/.zshrc`);
    collect.setInstalled('autojump');
  } catch (error) {
    collect.setFailed('autojump');
  }
}

async function installVinciCli() {
  const installed = await whichInstalled(`vinci`);
  if (installed) {
    collect.setSkipped('vinci-cli');
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
  const installed = await whichInstalled('ag');
  if (installed) {
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
  const stdout = shell.which(shellName) || '';

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
  install: upgradeGit,
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
