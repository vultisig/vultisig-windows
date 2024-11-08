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
cd frontend
npm buf generate commondata/proto
```

# DEVELOPMENT GUIDE

We are developing using VIEW, VIEW MODELS, FACTORIES, SEVICES, and Interfaces;

Correct:
```
VIEW -> VIEW MODELS -> FACTORIES -> SEVICES
```

Incorrect:
```
VIEW -> FACTORIES -> SEVICES (The view must call a view model, then follow the correct flow)
VIEW -> SEVICES (The view must call a view model, then follow the correct flow)
VIEW MODELS -> SEVICES (The view must call a factory passing the chain)
```

We have multiple chains, and we must avoid IF and else, so we use interfaces to implement the functionality per chain;

Once we create a new pageView, this page must have a pageViewModel; only the view model must have access to the Services.

The services must be initialized using the FACTORIES, and inside the Factory class, the SWITCHES cases must be exhaustive so we can cover all chains.

The view model should only know the chain from which it wants to get the data and pass it to the factory. E.g.:

```RpcServiceFactory.createService(chain).getBalance(coin);```

So, from the front-end perspective, we should use CHAIN for everything, and if there is a very specific implementation, we implement it using the services.

## FOR Linux user

Vultisig under linux require `libwebkit2gtk-4.0-dev` , usually you can run the following command to install it 

```
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev
```
If you are using ubuntu 24.4 and it can't find `libwebkit2gtk-4.0-dev` , then here is the workaround
1. add `deb http://gb.archive.ubuntu.com/ubuntu jammy main` to `/etc/apt/sources.list`  
2. and run  `sudo apt update` and `sudo apt install libwebkit2gtk-4.0-dev`
