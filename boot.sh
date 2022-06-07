#!/bin/sh

brew install volta

volta install node

npm i -g @kapta/weapon

echo "weapon installed!"

echo 'use weapon: <weapon use [type]>'

weapon
