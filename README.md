# weapon

Tools for bootstrap your mac

1、use brew to install some useful tools. <https://brew.sh/>

2、use volta to manage node versions. <https://volta.sh/>
```
# show all installed pkg
volta list 

# see global pkg path below command will all same
npm get config prefix
volta which <pkg name>
```

## Usage

```sh
# use brew install volta, then install node and weapon
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ikapta/weapon/main/boot.sh)"

# install apps chrome, lark...
weapon use app

# install terminal tools git oh-my-zsh zsh-plugins ag j...
weapon use misc

# if you want switch node versions, use volta install node
volta install node@16
volta install node@18
```

## Find install error info here

```bash
cat $HOME/Library/kapta_weapon/error.log
```

## Others

if you met `npm install --global` permission denied. Bcs this time is root user, if not use `sudo` will break down.Can fix that with command below:

```sh
 # `/usr/local/lib/node_modules` this always MacOS root path for npm install
chown -R $USER /usr/local/lib/node_modules
```

sometimes you met `npm install` permission denied. The reason same with above, mixed root and user.Just fix this with command below:

```sh
sudo chown -R $USER ~/.npm
 ```
