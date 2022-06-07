#!/bin/sh

which -s brew
if [[ $? != 0 ]] ; then
    echo 'Install Homebrew...'
    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
else
    echo 'Update brew...'
    brew update
fi

brew install volta

volta install node

volta install @kapta/weapon

echo "weapon installed!"

echo 'use weapon: <weapon use [type]>'

weapon
