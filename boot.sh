#!/bin/sh

brew install nvm
mkdir ~/.nvm
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh

nvm install node --lts

npm i -g @kapta/weapon

echo "install weapon successed!"
echo 'use weapon: <weapon use [type]>'

weapon
