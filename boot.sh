#!/bin/sh

which -s brew
if [[ $? != 0 ]] ; then
    # Install Homebrew
    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
else
    brew update
fi

brew install volta

volta install node

volta install @kapta/weapon

echo "weapon installed!"

echo 'use weapon: <weapon use [type]>'

weapon
