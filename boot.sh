#!/bin/sh

brew install volta

volta install node

volta install @kapta/weapon

echo "weapon installed!"

echo 'use weapon: <weapon use [type]>'

weapon
