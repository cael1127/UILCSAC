#!/bin/bash

# Exit on any error
set -e

echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run the build
echo "Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build completed successfully!"
    exit 0
else
    echo "Build failed!"
    exit 1
fi
