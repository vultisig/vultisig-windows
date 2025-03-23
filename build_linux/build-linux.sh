#!/usr/bin/env bash
set -e

# Paste this into a new file 'vultisig.sh' and run it: ./vultisig.sh
# You will be prompted to confirm each step, including an option
# to exit before building VultiConnect.


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
# shellcheck disable=SC2016
echo 'export PATH="/usr/local/go/bin:$PATH"' >> ~/.profile
# Make sure we re-source .profile now
# shellcheck disable=SC1090
source ~/.profile
go version

# Ensure ~/go/bin is recognized (for wails)
# shellcheck disable=SC2016
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

echo
echo "*******************************************************************************"
echo "** IMPORTANT: If wails doctor warns 'Missing libwebkit' on Ubuntu >=24.04,   **"
echo "** you can safely ignore it. Wails 2.x doesn’t detect libwebkit2gtk-4.1-dev. **"
echo "** The library IS installed and your build will work as intended.            **"
echo "*******************************************************************************"

echo
echo "We'll run: $BUILD_CMD"

#####################################################################
# STEP 5: Install Yarn + Build Vultisig + .desktop                  #
#####################################################################
echo
echo "=== Step 5: Remove cmdtest, Install Yarn, Build Vultisig ==="
confirm_step

sudo apt remove -y cmdtest || true
corepack enable
# shellcheck disable=SC1090
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
# shellcheck disable=SC1090
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
