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

echo
echo "*******************************************************************************"
echo "** IMPORTANT: If wails doctor warns 'Missing libwebkit' on Ubuntu >=24.04,   **"
echo "** you can safely ignore it. Wails 2.x doesn’t detect libwebkit2gtk-4.1-dev. **"
echo "** The library IS installed and your build will work as intended.            **"
echo "*******************************************************************************"

echo
echo "We'll run: $BUILD_CMD"
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
