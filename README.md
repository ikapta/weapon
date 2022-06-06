# weapon

Tools for bootstrap your mac

## Usage

```sh
# use brew install nvm and node and weapon
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ikapta/weapon/main/boot.sh)"

# install apps chrome, lark...
weapon use app

# install terminal tools git oh-my-zsh zsh-plugins ag j...
weapon use misc

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
