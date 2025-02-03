#!/bin/bash

# Exit on error
set -e

echo "Syncing and reinitializing submodules..."
git submodule init
git submodule update --init --recursive

# Go to clients/desktop
cd clients/desktop

echo "Generating protobuf files..."
npx buf generate commondata/proto

echo "Formatting generated protobuf files..."
yarn format:pb

echo "Cleaning up submodule..."
cd ../..
git submodule deinit -f clients/desktop/commondata

echo "Done! Protobuf files have been synced and formatted."

git add .
if ! git diff --cached --quiet; then
    git commit -m "Sync: update generated protobuf files"
    echo "Commit created."
else
    echo "No changes to commit."
fi
