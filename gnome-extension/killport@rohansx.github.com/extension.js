import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class KillPortExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._killportPath = null;
        this._portsCache = [];
    }

    _findKillportPath() {
        const possiblePaths = [
            '/usr/local/bin/killport',
            '/usr/bin/killport',
            '/home/linuxbrew/.linuxbrew/bin/killport',
            GLib.get_home_dir() + '/.cargo/bin/killport',
            GLib.get_home_dir() + '/.local/bin/killport'
        ];
        
        for (let path of possiblePaths) {
            if (GLib.file_test(path, GLib.FileTest.EXISTS)) {
                return path;
            }
        }
        
        // Try to find it using which command
        try {
            let [success, stdout] = GLib.spawn_command_line_sync('which killport');
            if (success && stdout) {
                let decoder = new TextDecoder('utf-8');
                let path = decoder.decode(stdout).trim();
                if (path) return path;
            }
        } catch (e) {}
        
        return null;
    }

    _scanPortsAsync(callback) {
        try {
            let proc = GLib.spawn_async_with_pipes(
                null,
                ['sh', '-c', "ss -tulpn 2>/dev/null | grep LISTEN | awk '{print $5}' | sed 's/.*://' | sort -u | head -20"],
                null,
                GLib.SpawnFlags.SEARCH_PATH,
                null
            );
            
            let stdout = new Gio.DataInputStream({
                base_stream: new Gio.UnixInputStream({ fd: proc[2] })
            });
            
            let ports = [];
            this._readOutput(stdout, ports, callback);
        } catch (e) {
            console.error('KillPort Extension: Error scanning ports - ' + e.message);
            callback([]);
        }
    }

    _readOutput(stream, ports, callback) {
        stream.read_line_async(GLib.PRIORITY_DEFAULT, null, (source, result) => {
            let [line] = source.read_line_finish(result);
            
            if (line === null) {
                callback(ports);
                return;
            }
            
            let decoder = new TextDecoder('utf-8');
            let port = decoder.decode(line).trim();
            
            if (port && !isNaN(port)) {
                ports.push(port);
            }
            
            this._readOutput(stream, ports, callback);
        });
    }

    _refreshMenu() {
        if (!this._indicator || !this._indicator.menu) return;
        
        this._indicator.menu.removeAll();
        
        // Add loading indicator
        let loadingItem = new PopupMenu.PopupMenuItem('Scanning ports...', { reactive: false });
        loadingItem.label.add_style_class_name('killport-loading');
        this._indicator.menu.addMenuItem(loadingItem);
        
        this._scanPortsAsync((ports) => {
            this._portsCache = ports;
            this._buildMenu();
        });
    }

    _buildMenu() {
        if (!this._indicator || !this._indicator.menu) return;
        
        this._indicator.menu.removeAll();
        
        let headerItem = new PopupMenu.PopupMenuItem('Active Ports', { reactive: false });
        headerItem.label.add_style_class_name('killport-header');
        this._indicator.menu.addMenuItem(headerItem);
        
        this._indicator.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        if (this._portsCache.length === 0) {
            let emptyItem = new PopupMenu.PopupMenuItem('No active ports found', { reactive: false });
            emptyItem.label.add_style_class_name('killport-empty');
            this._indicator.menu.addMenuItem(emptyItem);
        } else {
            this._portsCache.forEach(port => {
                let portItem = new PopupMenu.PopupMenuItem('');
                
                let portBox = new St.BoxLayout({
                    x_expand: true,
                    style_class: 'killport-item'
                });
                
                let portLabel = new St.Label({
                    text: `Port ${port}`,
                    x_expand: true,
                    y_align: Clutter.ActorAlign.CENTER
                });
                
                let processInfo = this._getProcessInfo(port);
                let processLabel = new St.Label({
                    text: processInfo,
                    style_class: 'killport-process',
                    y_align: Clutter.ActorAlign.CENTER
                });
                
                let killButton = new St.Button({
                    style_class: 'killport-button',
                    child: new St.Icon({
                        icon_name: 'process-stop-symbolic',
                        style_class: 'killport-icon'
                    })
                });
                
                killButton.connect('clicked', () => {
                    this._killPort(port);
                    return Clutter.EVENT_STOP;
                });
                
                portBox.add_child(portLabel);
                portBox.add_child(processLabel);
                portBox.add_child(killButton);
                
                portItem.actor.add_child(portBox);
                portItem.reactive = false;
                
                this._indicator.menu.addMenuItem(portItem);
            });
        }
        
        this._indicator.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Use icon for refresh button
        let refreshItem = new PopupMenu.PopupMenuItem('');
        let refreshBox = new St.BoxLayout({
            x_expand: true
        });
        
        let refreshIcon = new St.Icon({
            icon_name: 'view-refresh-symbolic',
            style_class: 'popup-menu-icon'
        });
        
        let refreshLabel = new St.Label({
            text: 'Refresh',
            x_expand: true
        });
        
        refreshBox.add_child(refreshIcon);
        refreshBox.add_child(refreshLabel);
        refreshItem.actor.add_child(refreshBox);
        
        refreshItem.connect('activate', () => {
            this._refreshMenu();
        });
        this._indicator.menu.addMenuItem(refreshItem);
    }

    _getProcessInfo(port) {
        try {
            let [success, stdout] = GLib.spawn_command_line_sync(`sh -c "lsof -i :${port} 2>/dev/null | grep LISTEN | awk '{print $1}' | head -1"`);
            if (success && stdout) {
                let decoder = new TextDecoder('utf-8');
                let process = decoder.decode(stdout).trim();
                return process || 'Unknown';
            }
        } catch (e) {
            console.error('KillPort Extension: Error getting process info - ' + e.message);
        }
        return 'Unknown';
    }

    _killPort(port) {
        if (!this._killportPath) {
            Main.notify('KillPort Error', 'killport command not found. Please install it first.');
            return;
        }
        
        try {
            let [success, stdout, stderr] = GLib.spawn_command_line_sync(`${this._killportPath} ${port}`);
            
            if (success) {
                Main.notify('KillPort', `Successfully killed process on port ${port}`);
                
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
                    this._refreshMenu();
                    return GLib.SOURCE_REMOVE;
                });
            } else {
                let decoder = new TextDecoder('utf-8');
                let error = stderr ? decoder.decode(stderr) : 'Unknown error';
                
                // If it's a permission error, try with pkexec
                if (error.includes('Permission denied') || error.includes('Operation not permitted')) {
                    this._killPortWithSudo(port);
                } else {
                    Main.notify('KillPort Error', `Failed to kill port ${port}: ${error}`);
                }
            }
        } catch (e) {
            Main.notify('KillPort Error', `Failed to kill port ${port}: ${e.message}`);
        }
    }

    _killPortWithSudo(port) {
        try {
            let [success, stdout, stderr] = GLib.spawn_command_line_sync(`pkexec ${this._killportPath} ${port}`);
            
            if (success) {
                Main.notify('KillPort', `Successfully killed process on port ${port} (with elevated privileges)`);
                
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
                    this._refreshMenu();
                    return GLib.SOURCE_REMOVE;
                });
            } else {
                let decoder = new TextDecoder('utf-8');
                let error = stderr ? decoder.decode(stderr) : 'Unknown error';
                Main.notify('KillPort Error', `Failed to kill port ${port}: ${error}`);
            }
        } catch (e) {
            Main.notify('KillPort Error', `Failed to kill port ${port}: ${e.message}`);
        }
    }

    enable() {
        this._indicator = new PanelMenu.Button(0.0, 'KillPort', false);
        this._portsCache = [];
        this._timeout = null;
        
        // Find killport path
        this._killportPath = this._findKillportPath();
        if (!this._killportPath) {
            console.warn('KillPort Extension: killport command not found in PATH');
        }
        
        // Use a cleaner port icon
        let icon = new St.Icon({
            icon_name: 'network-workgroup-symbolic',
            style_class: 'system-status-icon'
        });
        this._indicator.add_child(icon);
        
        Main.panel.addToStatusArea('killport-indicator', this._indicator);
        
        this._indicator.menu.connect('open-state-changed', (menu, open) => {
            if (open) {
                this._refreshMenu();
            }
        });
        
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 30, () => {
            if (this._indicator.menu.isOpen) {
                this._refreshMenu();
            }
            return GLib.SOURCE_CONTINUE;
        });
    }

    disable() {
        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }
        
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        
        this._portsCache = [];
        this._killportPath = null;
    }
}