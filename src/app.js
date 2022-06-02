import { $, quiet, chalk } from 'zx'
import { startSpinner } from 'zx/experimental'
import { collect, logCollectInfo } from './collect.js'

const apps = [
  { brewName: 'google-chrome', appName: 'Google Chrome.app' },
  { brewName: 'lark', appName: 'Lark.app' },
  { brewName: 'visual-studio-code', appName: 'Visual Studio Code.app' },
  { brewName: 'iterm2', appName: 'iTerm.app' },
  { brewName: 'warp', appName: 'warp.app' },
  { brewName: 'figma', appName: 'Figma.app' },
  { brewName: 'postman', appName: 'Postman.app' },
  { brewName: 'docker', appName: 'Docker.app' },
]

async function checkAppInstalledByBrew(app) {
  let installedByBrew = false
  let existedInApplicationDir = false

  const { stdout: bst } = await quiet($`brew list --cask`)
  installedByBrew = (bst || '').includes(app.brewName)

  if (!installedByBrew) {
    const { stdout: ast } = await quiet($`ls /Applications`)
    existedInApplicationDir = (ast || '').includes(app.appName)
  }

  return installedByBrew || existedInApplicationDir
}

async function abInstall(app) {
  const installed = await checkAppInstalledByBrew(app)
  if (installed) {
    collect.setSkipped(app.brewName)
    return
  }

  try {
    console.log(chalk.blue(`\ninstall ${app.appName}...`))
    await $`brew install --cask ${app.brewName}`
    collect.setInstalled(app)
  } catch (error) {
    collect.setFailed(app.brewName)
  }
}

export async function installApps() {
  let stop = startSpinner()
  while(apps.length) {
    const app = apps.shift()

    await abInstall(app)
  }
  stop()
  logCollectInfo()
}


export const listAllApps = () => {
  console.log(`\n${chalk.blue('weapon command: `weapon use app` will install below apps:')}`)
  console.table(apps);
}

