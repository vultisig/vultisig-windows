#!/bin/bash

# Exit on error
set -e

COMMONDATA_REPO="https://github.com/vultisig/commondata.git"
TEMP_DIR="temp_commondata"

echo "Cloning commondata repository..."
rm -rf $TEMP_DIR
git clone $COMMONDATA_REPO $TEMP_DIR

echo "Creating types directory if it doesn't exist..."
mkdir -p types

echo "Generating protobuf files..."
npx buf generate $TEMP_DIR/proto

echo "Formatting generated protobuf files..."
yarn format:pb

echo "Cleaning up..."
rm -rf $TEMP_DIR

echo "Done! Protobuf files have been generated and formatted."

# Add and commit changes if there are any
git add .
if ! git diff --cached --quiet; then
    git commit -m "Sync: update generated protobuf files"
    echo "Commit created."
else
    echo "No changes to commit."
fi 