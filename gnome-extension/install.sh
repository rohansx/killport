#!/bin/bash

set -e

EXTENSION_UUID="killport@rohansx.github.com"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"

echo "🚀 Installing KillPort GNOME Extension..."

# Check if killport is installed
if ! command -v killport &> /dev/null; then
    echo "⚠️  Warning: killport command not found!"
    echo "Please install killport first using one of these methods:"
    echo "  - Homebrew: brew install killport"
    echo "  - Cargo: cargo install killport" 
    echo "  - Install script: curl -sL https://bit.ly/killport | sh"
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create extension directory
echo "📁 Creating extension directory..."
mkdir -p "$EXTENSION_DIR"

# Copy extension files
echo "📦 Copying extension files..."
cp -r "$EXTENSION_UUID"/* "$EXTENSION_DIR/"

# Enable the extension
echo "✨ Enabling extension..."
gnome-extensions enable "$EXTENSION_UUID" || {
    echo "⚠️  Could not enable extension automatically."
    echo "Please enable it manually using GNOME Extensions app or:"
    echo "  gnome-extensions enable $EXTENSION_UUID"
}

echo "✅ Installation complete!"
echo ""
echo "🔄 Please restart GNOME Shell to activate the extension:"
echo "  - On X11: Press Alt+F2, type 'r', and press Enter"
echo "  - On Wayland: Log out and log back in"
echo ""
echo "📍 The KillPort icon will appear in your top panel after restart."