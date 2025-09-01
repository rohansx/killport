# Publishing KillPort Extension to GNOME Extensions Website

This guide explains how to publish the KillPort extension to the official GNOME Extensions website.

## Prerequisites

1. **Working Extension**: Your extension should be fully tested and working
2. **GNOME Extensions Account**: Create an account at https://extensions.gnome.org/
3. **Extension Package**: A properly packaged extension ZIP file

## Step 1: Prepare Extension Package

1. **Update metadata.json** with final version number:
```json
{
  "version": 2,
  "name": "KillPort",
  "description": "List and kill processes on ports with one click using the killport tool"
}
```

2. **Test thoroughly** on multiple GNOME Shell versions
3. **Create package**:
```bash
cd ~/.local/share/gnome-shell/extensions/killport@rohansx.github.com
zip -r killport-extension.zip *
```

## Step 2: Submit to GNOME Extensions

1. **Visit**: https://extensions.gnome.org/upload/
2. **Login** with your GNOME account
3. **Upload** the ZIP file
4. **Fill out details**:
   - Name: KillPort
   - Description: List and kill processes on ports with one click
   - URL: https://github.com/rohansx/killport
   - Screenshot: Upload a screenshot showing the extension in action

## Step 3: Review Process

1. **Automated Review**: The system checks for common issues
2. **Manual Review**: GNOME reviewers check the code
3. **Approval/Rejection**: You'll receive feedback
4. **Publication**: Once approved, it goes live

## Step 4: Managing Your Extension

### Updating Your Extension

1. **Make changes** to your local extension
2. **Update version** in metadata.json
3. **Create new ZIP** package
4. **Upload update** through extensions.gnome.org

### Version Management

- Use semantic versioning: 1.0, 1.1, 2.0, etc.
- Each GNOME Shell version may require a separate upload
- Test on all supported GNOME versions before releasing

## Alternative: Manual Installation

Users can also install manually:

1. **Download** from your GitHub repository
2. **Extract** to `~/.local/share/gnome-shell/extensions/`
3. **Enable** via Extensions app or command line

### Installation Script

You can provide this script for easy installation:

```bash
#!/bin/bash
# install-extension.sh

EXTENSION_UUID="killport@rohansx.github.com"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"
REPO_URL="https://github.com/rohansx/killport/archive/main.zip"

echo "🚀 Installing KillPort GNOME Extension..."

# Download and extract
curl -L $REPO_URL -o killport.zip
unzip -q killport.zip
mkdir -p "$EXTENSION_DIR"
cp -r killport-main/gnome-extension/killport@rohansx.github.com/* "$EXTENSION_DIR/"

# Cleanup
rm -rf killport.zip killport-main/

# Enable extension
gnome-extensions enable "$EXTENSION_UUID"

echo "✅ Installation complete!"
echo "Please restart GNOME Shell to activate the extension."
```

## Tips for Approval

1. **Follow Guidelines**: Read https://gjs.guide/extensions/
2. **Clean Code**: Use proper coding standards
3. **Error Handling**: Handle all edge cases gracefully
4. **Security**: Never execute untrusted code
5. **Performance**: Don't block the UI thread
6. **Documentation**: Include clear README and comments

## Common Rejection Reasons

- **Security Issues**: Executing arbitrary commands
- **Performance Problems**: Blocking main thread
- **Bad Code Quality**: No error handling, memory leaks
- **Missing Dependencies**: Not checking if required tools exist
- **Poor UX**: Confusing interface or workflows

## Promotion

Once published:
1. **Announce** on social media
2. **Blog post** about the extension
3. **Submit** to relevant subreddits/forums
4. **Update** your GitHub README with installation instructions

## Maintenance

- **Monitor** for bug reports and user feedback
- **Update** for new GNOME Shell versions
- **Respond** to user issues promptly
- **Maintain** compatibility with supported versions

The KillPort extension is now ready for publication! The code has been optimized for performance, includes proper error handling, and follows GNOME extension best practices.