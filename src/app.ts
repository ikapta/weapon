import { chalk } from 'zx';
import { collect, logCollectInfo } from './collect.js';
import ora from 'ora';
import { logIntoErrorFile, promisifyExec } from './utils.js';

const oraInst = ora('installing...');

type AppType = {
  brewName: string;
  appName: string;
};

const apps: AppType[] = [
  { brewName: 'google-chrome', appName: 'Google Chrome.app' },
  { brewName: 'lark', appName: 'Lark.app' },
  { brewName: 'visual-studio-code', appName: 'Visual Studio Code.app' },
  // { brewName: 'iterm2', appName: 'iTerm.app' },
  { brewName: 'warp', appName: 'Warp.app' },
  { brewName: 'figma', appName: 'Figma.app' },
  { brewName: 'postman', appName: 'Postman.app' },
  { brewName: 'docker', appName: 'Docker.app' },
  { brewName: 'sogouinput', appName: 'Sougou Input.app' },
  { brewName: 'github', appName: 'GitHub Desktop.app' },
  { brewName: 'wechat', appName: 'WeChat.app' },
];

async function checkAppInstalledByBrew(app: AppType) {
  let installedByBrew = false;
  let existedInApplicationDir = false;

  const bst = await promisifyExec<string>(`brew list --cask`);
  installedByBrew = (bst || '').includes(app.brewName);

  if (!installedByBrew) {
    const ast = await promisifyExec<string>(`ls /Applications`);
    existedInApplicationDir = (ast || '').includes(app.appName);
  }

  return installedByBrew || existedInApplicationDir;
}

async function abInstall(app: AppType) {
  const installed = await checkAppInstalledByBrew(app);
  if (installed) {
    collect.setSkipped(app.brewName);
    return;
  }

  try {
    console.log(chalk.blue(`\ninstall ${app.appName}...`));
    await promisifyExec(`brew install --cask ${app.brewName}`);
    collect.setInstalled(app.appName);
  } catch (error) {
    collect.setFailed(app.brewName);
    await logIntoErrorFile(error as string);
  }
}

export async function installApps() {
  while (apps.length) {
    const app = apps.shift() as AppType;
    oraInst.start(`install ${app.brewName}`);

    await abInstall(app);
    oraInst.succeed('processed ' + app.brewName);
  }
  oraInst.stop();
  logCollectInfo();
}

export const listAllApps = () => {
  console.log(`\n${chalk.blue('weapon command: `weapon use app` will install below apps:')}`);
  console.table(apps);
};
