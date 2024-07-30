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