#!/bin/sh

which -s brew
if [[ $? != 0 ]] ; then
    echo 'Installing Homebrew...'
    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
else
    echo "Updating Homebrew..."
    brew update
fi

# install node and node pkg manager
brew install volta

volta install node

volta install yarn

volta install pnpm

# install npm package registry manage, and set alias to taobao
volta install nrm
nrm add tb "https://registry.npmmirror.com/"
nrm use tb

volta install @kapta/weapon

echo "weapon installed!"

weapon
