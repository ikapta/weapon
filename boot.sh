#!/bin/sh

which -s brew
if [[ $? != 0 ]] ; then
    echo 'Installing Homebrew...'
    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
else
    echo "Updating Homebrew..."
    brew update
fi

brew install volta

volta install node

volta install @kapta/weapon

echo "weapon installed!"

echo 'use weapon: <weapon use [type]>'

weapon
