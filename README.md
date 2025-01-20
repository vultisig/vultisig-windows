# README

This is Vultisig windows application

## Install wails

This project is using a tool call wails, please refer to https://wails.io/docs/gettingstarted/installation/ to install wails

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.

## Generate protobuf files for type script

The keysign / keygen related messages are defined in https://github.com/vultisig/commondata , it is shared between IOS/Android/Windows , and also other projects
If you need to make an update to the proto file, make sure you raise a PR in https://github.com/vultisig/commondata

To generate the proto files for typescript, run the following command in the frontend directory

```bash
cd frontend && npx buf generate commondata/proto
```

## Update protobuf files for type script

To git pull for a submodule, you have a few options:

1. Pull for the specific submodule:

```bash
git submodule update --remote frontend/commondata
```

2. Pull for all submodules:

```bash
git submodule update --remote
```

3. If you want to pull and also initialize/update nested submodules:

```bash
git submodule update --init --recursive
```

4. If you want to pull the main repository and all its submodules in one command:

```bash
git pull --recurse-submodules
```

Each of these commands will fetch and update the submodule to its latest commit on the remote branch.

Tip: Make sure you're in the root directory of your main repository when running these commands.

## FOR Linux user

Vultisig under linux require `libwebkit2gtk-4.0-dev` , usually you can run the following command to install it

```
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev
```

If you are using ubuntu 24.4 and it can't find `libwebkit2gtk-4.0-dev` , then here is the workaround

1. add `deb http://gb.archive.ubuntu.com/ubuntu jammy main` to `/etc/apt/sources.list`
2. and run `sudo apt update` and `sudo apt install libwebkit2gtk-4.0-dev`
