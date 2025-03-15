# Vultisig Desktop & VultiConnect

This monorepo contains two main components:
1. The Vultisig Desktop Application (Windows and Linux)
2. The VultiConnect Browser Extension - A Chrome extension for bridging your Vultisig vaults to dApps

## Desktop Application
### Technical Requirements

This project uses Wails. Please refer to https://wails.io/docs/gettingstarted/installation/ for installation instructions.


### Development

To run the desktop application in development mode:

```bash
yarn dev:desktop
```

**Important Note:** This will expose two dev servers: one on 34115 (the Wails development server) and a Vite development server on port 5173.
Always use the former, as the Vite development server won't have the required Wails-injected scripts.

### Building Linux
These instructions handle both:
- Ubuntu 24.04 (Noble) with libwebkit2gtk-4.1-dev
- Older Ubuntu/Debian releases (e.g. 22.04) with libwebkit2gtk-4.0-dev

#### STEP 1: Install Basic Deps + Go 1.24.1
```bash
sudo apt update && sudo apt upgrade -y
# We install build-essential so cgo can compile dependencies like go-sqlite3.
sudo apt install -y curl git build-essential
wget https://go.dev/dl/go1.24.1.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.24.1.linux-amd64.tar.gz
rm go1.24.1.linux-amd64.tar.gz

# Make /usr/local/go/bin part of PATH
echo 'export PATH="/usr/local/go/bin:$PATH"' >> ~/.profile

source ~/.profile   # re-source .profile
go version  # Check that Go installed

# Ensure ~/go/bin is recognized (for wails)
echo 'export PATH="$HOME/go/bin:$PATH"' >> ~/.bashrc
export PATH="$HOME/go/bin:$PATH"
```
#### STEP 2: Install NVM + Node 22
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash

export NVM_DIR="$HOME/.nvm" # Source NVM:
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"

nvm install 22
nvm use 22
```
#### STEP 3: Clone Vultisig
```bash
git clone https://github.com/vultisig/vultisig-windows.git vultisig
```

#### Step 4: Install WebKit + Wails Based on OS Version
```bash
if [[ -f /etc/os-release ]]; then
  . /etc/os-release
else
  echo "WARNING: /etc/os-release not found. Defaulting to 4.0-dev build..."
  VERSION_ID="0.0"
fi

# We'll parse the major.minor from VERSION_ID
UBUNTU_VER="$(echo "$VERSION_ID" | cut -d. -f1,2)"   # e.g. "24.04"
# Compare with 24.04 using bc
IS_HIGHER=$(echo "$UBUNTU_VER >= 24.04" | bc)

if [ "$IS_HIGHER" -eq 1 ]; then
  echo "Detected $VERSION_ID >= 24.04 => installing libwebkit2gtk-4.1-dev..."
  sudo apt install -y libwebkit2gtk-4.1-dev
  BUILD_CMD="wails build -tags webkit2_41"
else
  echo "Detected $VERSION_ID < 24.04 => installing libwebkit2gtk-4.0-dev..."
  sudo apt install -y libwebkit2gtk-4.0-dev
  BUILD_CMD="wails build"
fi

# Install Wails & GTK 3
go install github.com/wailsapp/wails/v2/cmd/wails@latest
sudo apt install -y libgtk-3-dev
wails doctor || true
```

#### STEP 5: Install Yarn + Build Vultisig + Create .desktop file
```bash
sudo apt remove -y cmdtest || true
corepack enable
source ~/.bashrc
corepack prepare yarn@4.6.0 --activate
yarn --version

cd vultisig
yarn install
yarn build:desktop
eval "$BUILD_CMD"

VULTISIG_DIR="$(pwd -P)"
cd ~

# Add the build/bin path to ~/.bashrc
echo "export PATH=\"$VULTISIG_DIR/build/bin:\$PATH\"" >> ~/.bashrc
source ~/.bashrc

# Create a .desktop file for Vultisig
mkdir -p ~/.local/share/applications
cat <<EOF > ~/.local/share/applications/vultisig.desktop
[Desktop Entry]
Type=Application
Name=Vultisig
Exec=$VULTISIG_DIR/build/bin/vultisig
Icon=$VULTISIG_DIR/appicon.png
Terminal=false
Categories=Utility;
EOF

chmod +x ~/.local/share/applications/vultisig.desktop
update-desktop-database ~/.local/share/applications 2>/dev/null || true
```
You may need to log out/in or restart your desktop session to see Vultisig in your application menu.

### What is VultiConnect?

VultiConnect is a Chrome extension similar to MetaMask but much safer. It does not store any critical information such as private keys or passwords. Instead, it acts as a bridge that allows you to connect your Vultisig app to DeFi applications, enabling you to interact with them and sign transactions securely on your devices.

### How Safe is VultiConnect?

You only need to import public keys and vault information into VultiConnect. Unlike MetaMask, if someone hacks your Chrome or the extension, they cannot execute transactions without your approval on your Vultisig devices, as they only have access to public information.

### Requirements

Before building VultiConnect, ensure you have the following installed:
- `Node.js` (version 18.10.0 or later)
- `yarn` (for managing packages)

### Development

To run the Vulticonnect extension in development mode:

```bash
yarn dev:extension
```

### Building VultiConnect
If you installed Vultisig with the above steps, you'll have all necessary dependencies.

```bash
git clone https://github.com/vultisig/vulticonnect.git vulticonnect
cd vulticonnect
pnpm install
pnpm build
```
### Installing in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (top-right corner)
3. Click "Load unpacked" and select the `dist` folder from the extension
4. The extension should now be installed and ready to use

## VultiConnect Integration Guide

For details on integrating VultiConnect with your project, see the [Integration Guide](clients/extension/docs/integration-guide.md).

## Script for Installing Vultisig and VultiConnect:
Create a file for your script:
```bash
touch vultisig.sh
chmod +x vultisig.sh
```
Paste the following in vultisig.sh and run it: `./vultisig.sh`
You will be prompted to confirm each step, including an option to exit before building Vultisig.
```
#!/usr/bin/env bash
set -e

#############################################################################
# Vultisig: Installation from Source                                        #
#                                                                           #
# This script checks /etc/os-release to see if VERSION_ID >= 24.04.         #
#   - If >= 24.04, install libwebkit2gtk-4.1-dev, use `-tags webkit2_41`.   #
#   - Else (< 24.04), install libwebkit2gtk-4.0-dev, use normal build.      #
#                                                                           #
# NOTE: Must have a desktop environment ($DISPLAY). We'll prompt for steps. #
#############################################################################

confirm_step() {
  echo
  read -rp "Press ENTER to proceed, or 'q' to quit: " answer
  if [[ "$answer" =~ ^[qQ]$ ]]; then
    echo "Aborting."
    exit 1
  fi
}

#####################################################################
# STEP 1: System Update + Basic Deps + Go 1.24.1                    #
#####################################################################
echo
echo "=== Step 1: System Update + Basic Deps + Go 1.24.1 ==="
confirm_step

sudo apt update && sudo apt upgrade -y
# We install build-essential so cgo can compile dependencies like go-sqlite3.
sudo apt install -y curl git build-essential

echo
echo "Downloading & installing Go 1.24.1..."
wget https://go.dev/dl/go1.24.1.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.24.1.linux-amd64.tar.gz
rm go1.24.1.linux-amd64.tar.gz

# Make /usr/local/go/bin part of PATH
echo 'export PATH="/usr/local/go/bin:$PATH"' >> ~/.profile
# Make sure we re-source .profile now
source ~/.profile
go version

# Ensure ~/go/bin is recognized (for wails)
echo 'export PATH="$HOME/go/bin:$PATH"' >> ~/.bashrc
export PATH="$HOME/go/bin:$PATH"

#####################################################################
# STEP 2: NVM & Node 22                                             #
#####################################################################
echo
echo "=== Step 2: Install NVM + Node 22 ==="
confirm_step

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash

# Source NVM:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"
echo "Installing Node Version Manager (NVM)..."
nvm install 22
nvm use 22

#####################################################################
# STEP 3: Clone Vultisig                                            #
#####################################################################
echo
echo "=== Step 3: Clone Vultisig ==="
confirm_step
git clone https://github.com/vultisig/vultisig-windows.git vultisig

#####################################################################
# STEP 4: Numeric Comparison: If >= 24.04 => 4.1-dev, else 4.0-dev  #
#####################################################################
echo
echo "=== Step 4: Install WebKit + Wails Based on OS Version ==="
confirm_step

# Source /etc/os-release to get VERSION_ID, e.g. "22.04", "24.04"
if [[ -f /etc/os-release ]]; then
  . /etc/os-release
else
  echo "WARNING: /etc/os-release not found. Defaulting to 4.0-dev build..."
  VERSION_ID="0.0"
fi

# We'll parse the major.minor from VERSION_ID
UBUNTU_VER="$(echo "$VERSION_ID" | cut -d. -f1,2)"   # e.g. "24.04"
# Compare with 24.04 using bc
IS_HIGHER=$(echo "$UBUNTU_VER >= 24.04" | bc)

if [ "$IS_HIGHER" -eq 1 ]; then
  echo "Detected $VERSION_ID >= 24.04 => installing libwebkit2gtk-4.1-dev..."
  sleep 3
  sudo apt install -y libwebkit2gtk-4.1-dev
  BUILD_CMD="wails build -tags webkit2_41"
else
  echo "Detected $VERSION_ID < 24.04 => installing libwebkit2gtk-4.0-dev..."
  sleep 3
  sudo apt install -y libwebkit2gtk-4.0-dev
  BUILD_CMD="wails build"
fi

# Install Wails & GTK 3
go install github.com/wailsapp/wails/v2/cmd/wails@latest
sudo apt install -y libgtk-3-dev
wails doctor || true

echo "We'll run: $BUILD_CMD"

#####################################################################
# STEP 5: Install Yarn + Build Vultisig + .desktop                  #
#####################################################################
echo
echo "=== Step 5: Remove cmdtest, Install Yarn, Build Vultisig ==="
confirm_step

sudo apt remove -y cmdtest || true
corepack enable
source ~/.bashrc
corepack prepare yarn@4.6.0 --activate
yarn --version

cd vultisig
yarn install
yarn build:desktop
eval "$BUILD_CMD"

VULTISIG_DIR="$(pwd -P)"
cd ~

# Add the build/bin path to ~/.bashrc
echo "export PATH=\"$VULTISIG_DIR/build/bin:\$PATH\"" >> ~/.bashrc
source ~/.bashrc

# Create a .desktop file for Vultisig
mkdir -p ~/.local/share/applications
cat <<EOF > ~/.local/share/applications/vultisig.desktop
[Desktop Entry]
Type=Application
Name=Vultisig
Exec=$VULTISIG_DIR/build/bin/vultisig
Icon=$VULTISIG_DIR/appicon.png
Terminal=false
Categories=Utility;
EOF

chmod +x ~/.local/share/applications/vultisig.desktop
update-desktop-database ~/.local/share/applications 2>/dev/null || true

echo
echo "You may need to log out/in or restart your desktop environment"
echo "to see 'Vultisig' in your application menu."

#####################################################################
# STEP 6: (Optional) Install VultiConnect                           #
#####################################################################
echo
echo "=== Step 6: Install VultiConnect (optional) ==="
echo "If you do not wish to also build VultiConnect, exit now."
confirm_step

git clone https://github.com/vultisig/vulticonnect.git vulticonnect
cd vulticonnect
pnpm install
pnpm build
cd

echo
echo "================================================================"
echo "Installation complete!"
echo "Vultisig is a desktop app, ensure you have a GUI with \$DISPLAY."
echo "================================================================"
echo
echo "To enable VultiConnect in Chrome/Chromium extensions:"
echo
echo "1. Open a Chrome browser and go to chrome://extensions."
echo "2. Toggle the switch in the top right corner to enable Developer mode."
echo "3. Click on \"Load unpacked\" and select the \"dist\" folder from the VultiConnect project directory."
```
