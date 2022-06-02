#!/bin/sh

brew install nvm
mkdir ~/.nvm
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh

nvm use node --lts

npm i -g kta_weapon

echo "install weapon successed!"
echo 'use weapon: <weapon use [type]>'

weapon