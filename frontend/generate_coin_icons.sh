#!/bin/bash

# Define source and destination directories
SRC_DIR="./ios_crypto_icons"
DEST_DIR="./public/assets/icons/coins"

# Create the destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Loop through each folder in the source directory
for folder in "$SRC_DIR"/*.imageset; do
    # Extract the icon name from the folder name
    icon_name=$(basename "$folder" .imageset)

    # Find the image file inside the .imageset folder
    image_file=$(find "$folder" -type f ! -name 'Contents.json')

    # Get the file extension of the image
    extension="${image_file##*.}"

    # Copy the image file to the destination directory with the icon name and its original extension
    cp "$image_file" "$DEST_DIR/$icon_name.$extension"
done

echo "Icons have been copied successfully."
