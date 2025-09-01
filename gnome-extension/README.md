# KillPort GNOME Extension

A GNOME Shell extension that provides a graphical interface for the [killport](https://github.com/jkfran/killport) command-line tool. List and terminate processes running on specific ports with just one click from your GNOME panel.

## Features

- 🔍 **Real-time Port Scanning**: Automatically detects and lists all active listening ports
- 🎯 **One-Click Kill**: Terminate processes on any port with a single click
- 📊 **Process Information**: Shows which process is using each port
- 🔄 **Auto-Refresh**: Updates port list when you open the menu
- 🎨 **Clean UI**: Integrated seamlessly with GNOME Shell's design

## Prerequisites

1. **GNOME Shell** (version 40-45)
2. **killport** command-line tool installed

### Installing killport

Choose one of the following methods:

```bash
# Using Homebrew (macOS/Linux)
brew install killport

# Using Cargo
cargo install killport

# Using install script
curl -sL https://bit.ly/killport | sh

# From source (this repository)
cargo build --release
sudo cp target/release/killport /usr/local/bin/
```

## Installation

### Method 1: Quick Install Script

```bash
cd gnome-extension
./install.sh
```

### Method 2: Manual Installation

1. Copy the extension to your GNOME extensions directory:
```bash
cp -r killport@rohansx.github.com ~/.local/share/gnome-shell/extensions/
```

2. Enable the extension:
```bash
gnome-extensions enable killport@rohansx.github.com
```

3. Restart GNOME Shell:
   - **X11**: Press `Alt+F2`, type `r`, press Enter
   - **Wayland**: Log out and log back in

## Usage

1. After installation, you'll see a network icon in your top panel
2. Click the icon to see a list of all active ports
3. Each port shows:
   - Port number
   - Process name (if available)
   - Kill button (X icon)
4. Click the X button to terminate the process on that port
5. Use the Refresh button to manually update the list

## Screenshots

![KillPort Extension Menu](screenshots/menu.png)
*The extension dropdown showing active ports with kill buttons*

## Troubleshooting

### Extension not appearing
- Ensure GNOME Shell is restarted after installation
- Check if the extension is enabled: `gnome-extensions list --enabled`
- View logs: `journalctl -f -o cat /usr/bin/gnome-shell`

### "killport command not found"
- Ensure killport is installed and in your PATH
- Test with: `which killport`
- If installed locally, add to PATH: `export PATH=$PATH:/path/to/killport`

### Permission errors
- Some ports may require elevated privileges to kill
- The extension will show an error notification if it can't kill a process
- Consider running processes with appropriate permissions

## Development

### File Structure
```
killport@rohansx.github.com/
├── extension.js      # Main extension logic
├── metadata.json     # Extension metadata
└── stylesheet.css    # UI styling
```

### Testing Changes
1. Make your changes to the extension files
2. Restart GNOME Shell to reload
3. Check logs: `journalctl -f -o cat /usr/bin/gnome-shell | grep -i killport`

### Debugging
Enable debug output by modifying extension.js:
```javascript
const DEBUG = true;
function debug(msg) {
    if (DEBUG) log(`[KillPort] ${msg}`);
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This GNOME extension is part of the killport project and is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Credits

- Original killport tool by [jkfran](https://github.com/jkfran)
- GNOME extension by [rohansx](https://github.com/rohansx)

## Support

If you encounter any issues or have suggestions:
- Open an issue on [GitHub](https://github.com/rohansx/killport/issues)
- Check existing issues for solutions

## Roadmap

- [ ] Add port filtering options
- [ ] Support for custom kill signals
- [ ] Port process history tracking
- [ ] Keyboard shortcuts
- [ ] Settings panel for customization
- [ ] Support for more GNOME Shell versions
- [ ] Integration with system firewall rules