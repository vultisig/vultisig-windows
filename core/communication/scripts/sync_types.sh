#!/bin/bash

# Exit on error
# set -e

COMMONDATA_REPO="https://github.com/vultisig/commondata.git"
TEMP_DIR="temp_commondata"

echo "Cloning commondata repository..."
git clone $COMMONDATA_REPO $TEMP_DIR

echo "Generating protobuf files..."
npx buf generate $TEMP_DIR/proto

echo "Formatting generated protobuf files..."
yarn format

echo "Cleaning up..."
rm -rf $TEMP_DIR

echo "Done! Protobuf files have been generated and formatted."
