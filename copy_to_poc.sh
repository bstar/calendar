#!/bin/bash

# Script to copy files and directories to ../poc-lib-clacalendar-js
# filepath: copy_to_poc.sh

# Set source and destination directories
DEST_DIR="."
#DEST_DIR="../poc-lib-clacalendar-js"
SOURCE_DIR="../../repos/web-ofs/src/modules/cla-calendar"

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

echo "Copying files and directories to $DEST_DIR..."

# Copy individual files
files=(
    ".gitignore"
    "CLAUDE.md"
    "CLAUDE_STORYBOOK.md"
    "POPUP_POSITIONING_ANALYSIS.md"
    "README.md"
    "STORYBOOK_ISSUES.md"
    "coverage.json"
    "index.html"
    "package.json"
    "project_plan.yml"
    "rollup.config.js"
    "tsconfig.build.json"
    "tsconfig.eslint.json"
    "tsconfig.json"
    "vite.config.js"
    "vitest.config.ts"
)

for file in "${files[@]}"; do
    if [[ -f "$SOURCE_DIR/$file" ]]; then
        cp "$SOURCE_DIR/$file" "$DEST_DIR/"
        echo "Copied: $file"
    else
        echo "Warning: $file not found"
    fi
done

# Copy directories
directories=(
    ".storybook"
    "public"
    "src"
    "storybook-static"
    "test"
)

for dir in "${directories[@]}"; do
    if [[ -d "$SOURCE_DIR/$dir" ]]; then
        cp -r "$SOURCE_DIR/$dir" "$DEST_DIR/"
        echo "Copied directory: $dir"
    else
        echo "Warning: Directory $dir not found"
    fi
done

echo "Copy operation completed!"
echo "Files and directories have been copied to $DEST_DIR"
