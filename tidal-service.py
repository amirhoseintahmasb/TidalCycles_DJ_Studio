#!/usr/bin/env python3
"""
TidalCycles Service Manager
Complete backend infrastructure - starts everything, manages processes, exposes API
Run as: python3 tidal-service.py
"""

import subprocess
import time
import os
import sys
import signal
import json
import threading
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import webbrowser

# Configuration
PROJECT_DIR = Path(__file__).parent
COMMAND_FILE = PROJECT_DIR / ".ghci-commands"
GHCi_SCRIPT = "/Users/amirhoseintahmasb/.cabal/share/aarch64-osx-ghc-9.14.1-bcbf/tidal-1.10.1/BootTidal.hs"
SUPERCOLLIDER_SCRIPT = PROJECT_DIR / "scripts" / "boot-superdirt-clean.scd"
SUPERCOLLIDER_AUTO_SCRIPT = PROJECT_DIR / "scripts" / "boot-superdirt-auto.scd"

# Process tracking
processes = {
    'supercollider': None,
    'ghci': None,
    'monitor': None,
    'bridge': None
}

class TidalServiceHandler(BaseHTTPRequestHandler):
    """HTTP API for controlling TidalCycles service"""
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Max-Age', '3600')
    
    def do_GET(self):
        """Handle GET requests"""
        parsed = urlparse(self.path)
        path = parsed.path
        
        if path == '/status':
            self.send_json_response(self.get_status())
        elif path == '/start':
            self.send_json_response(self.start_all())
        elif path == '/stop':
            self.send_json_response(self.stop_all())
        elif path == '/restart':
            self.send_json_response(self.restart_all())
        elif path == '/command':
            # Get command from query string
            params = parse_qs(parsed.query)
            cmd = params.get('cmd', [None])[0]
            if cmd:
                self.send_command(cmd)
                self.send_json_response({'status': 'sent', 'command': cmd})
            else:
                self.send_json_response({'error': 'No command provided'}, 400)
        elif path == '/control.html' or path == '/':
            # Serve control UI
            self.serve_file('ui/service-control.html')
        else:
            self.send_json_response({'error': 'Not found'}, 404)
    
    def serve_file(self, filepath):
        """Serve static file"""
        try:
            file_path = PROJECT_DIR / filepath
            if file_path.exists():
                with open(file_path, 'r') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
            else:
                self.send_json_response({'error': 'File not found'}, 404)
        except Exception as e:
            self.send_json_response({'error': str(e)}, 500)
    
    def do_POST(self):
        """Handle POST requests"""
        parsed = urlparse(self.path)
        path = parsed.path
        
        if path == '/command':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            cmd = data.get('command')
            if cmd:
                self.send_command(cmd)
                self.send_json_response({'status': 'sent', 'command': cmd})
            else:
                self.send_json_response({'error': 'No command provided'}, 400)
        else:
            self.send_json_response({'error': 'Not found'}, 404)
    
    def send_json_response(self, data, status=200):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def get_status(self):
        """Get status of all services"""
        return {
            'supercollider': self.is_running('sclang'),
            'ghci': self.is_running('ghci'),
            'monitor': self.is_running('monitor-commands.py'),
            'bridge': self.is_port_open(8080),
            'superdirt': self.is_port_open(57120),
            'tidal': self.is_port_open(6010)
        }
    
    def start_all(self):
        """Start all services"""
        return self.start_all_static()
    
    @staticmethod
    def start_all_static():
        """Start all services (static method)"""
        results = {}
        
        # Start SuperCollider
        if not TidalServiceHandler._is_running_static('sclang'):
            results['supercollider'] = TidalServiceHandler._start_supercollider_static()
        else:
            results['supercollider'] = 'already_running'
        
        # Start GHCi
        if not TidalServiceHandler._is_running_static('ghci'):
            print("   Starting GHCi/TidalCycles...")
            results['ghci'] = TidalServiceHandler._start_ghci_static()
            time.sleep(5)  # Wait longer for GHCi to fully start and load Tidal
        else:
            results['ghci'] = 'already_running'
            print("   ✅ GHCi already running")
        
        # Start Monitor
        if not TidalServiceHandler._is_running_static('monitor-commands.py'):
            results['monitor'] = TidalServiceHandler._start_monitor_static()
        else:
            results['monitor'] = 'already_running'
        
        # Start Bridge
        if not TidalServiceHandler._is_port_open_static(8080):
            results['bridge'] = TidalServiceHandler._start_bridge_static()
        else:
            results['bridge'] = 'already_running'
        
        return results
    
    def stop_all(self):
        """Stop all services"""
        return self.stop_all_static()
    
    @staticmethod
    def stop_all_static():
        """Stop all services (static method)"""
        results = {}
        results['monitor'] = TidalServiceHandler._stop_process_static('monitor-commands.py')
        results['bridge'] = TidalServiceHandler._stop_process_static('node.*osc-bridge')
        results['ghci'] = TidalServiceHandler._stop_process_static('ghci')
        results['supercollider'] = TidalServiceHandler._stop_process_static('sclang')
        return results
    
    @staticmethod
    def _is_running_static(process_name):
        try:
            if process_name == 'ghci':
                # GHCi runs inside Terminal, check multiple ways
                result1 = subprocess.run(['pgrep', '-f', 'ghci'], 
                                       capture_output=True, check=False)
                result2 = subprocess.run(['pgrep', '-f', 'ghc.*tidal'], 
                                       capture_output=True, check=False)
                # Check ps output for ghci/tidal
                result3 = subprocess.run(['ps', 'aux'], 
                                       capture_output=True, check=False)
                if result3.returncode == 0:
                    output = result3.stdout.decode('utf-8', errors='ignore')
                    if 'ghci' in output.lower() or ('ghc' in output.lower() and 'tidal' in output.lower()):
                        return True
                return result1.returncode == 0 or result2.returncode == 0
            else:
                result = subprocess.run(['pgrep', '-f', process_name], 
                                      capture_output=True, check=False)
                return result.returncode == 0
        except:
            return False
    
    @staticmethod
    def _is_port_open_static(port):
        try:
            result = subprocess.run(['lsof', '-i', f':{port}'], 
                                  capture_output=True, check=False)
            return result.returncode == 0
        except:
            return False
    
    @staticmethod
    def _start_supercollider_static():
        try:
            # First, try to boot SuperDirt via command line (more reliable)
            cli_script = PROJECT_DIR / "scripts" / "boot-superdirt-via-cli.scd"
            boot_script = SUPERCOLLIDER_AUTO_SCRIPT if SUPERCOLLIDER_AUTO_SCRIPT.exists() else SUPERCOLLIDER_SCRIPT
            
            # Check if SuperDirt is already running
            port_check = subprocess.run(['lsof', '-i', ':57120'], 
                                      capture_output=True, check=False)
            if port_check.returncode == 0:
                print("   ✅ SuperDirt already running on port 57120")
                return 'already_running'
            
            # Try command-line boot first (if sclang is available)
            if cli_script.exists():
                try:
                    result = subprocess.run(['which', 'sclang'], 
                                          capture_output=True, check=False)
                    if result.returncode == 0:
                        # Boot via command line
                        subprocess.Popen(['sclang', str(cli_script)],
                                       stdout=subprocess.PIPE,
                                       stderr=subprocess.PIPE)
                        print("   ✅ Starting SuperDirt via command line...")
                        time.sleep(4)  # Wait for boot
                        # Check if it started
                        port_check = subprocess.run(['lsof', '-i', ':57120'], 
                                                  capture_output=True, check=False)
                        if port_check.returncode == 0:
                            print("   ✅ SuperDirt booted successfully!")
                            return 'booted'
                except Exception as e:
                    print(f"   ⚠️  CLI boot failed: {e}, trying GUI method...")
            
            # Fallback: Open SuperCollider app and try to boot via GUI
            subprocess.Popen(['open', '-a', 'SuperCollider'])
            time.sleep(2)  # Wait for app to open
            
            if boot_script.exists():
                # Use osascript to open and boot the script
                boot_command = f'''tell application "SuperCollider"
    activate
    delay 2
end tell

tell application "System Events"
    tell process "SuperCollider"
        -- Open file
        keystroke "o" using command down
        delay 1
        keystroke "{boot_script}"
        keystroke return
        delay 2
        -- Boot server
        keystroke "b" using command down
    end tell
end tell'''
                
                try:
                    subprocess.Popen(['osascript', '-e', boot_command],
                                   stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE)
                    print("   ✅ SuperCollider opened, booting SuperDirt via GUI...")
                    time.sleep(5)  # Give it more time to boot
                    return 'opened_and_booting'
                except Exception as e:
                    print(f"   ⚠️  Auto-boot failed: {e}")
                    print(f"   💡 Please manually: Open {boot_script.name} in SuperCollider, then press Cmd+B")
                    return 'opened_app'
            else:
                print("   ⚠️  Boot script not found")
                return 'opened_app'
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return 'error'
    
    @staticmethod
    def _start_ghci_static():
        print("   🚀 Starting GHCi/TidalCycles...")
        # Use absolute path for GHCi script
        script = f'''tell application "Terminal"
    set newTab to do script "cd '{PROJECT_DIR}' && source ~/.ghcup/env && ghci"
    activate
    delay 3
    do script ":script {GHCi_SCRIPT}" in newTab
    delay 2
end tell'''
        try:
            result = subprocess.run(['osascript', '-e', script], 
                                  capture_output=True,
                                  text=True,
                                  timeout=10,
                                  check=False)
            if result.returncode == 0:
                print("   ✅ GHCi startup command sent to Terminal")
                print("   ⏳ Waiting for GHCi to load TidalCycles...")
                time.sleep(5)  # Give it time to start and load
                # Check if it's actually running
                check = subprocess.run(['lsof', '-i', ':6010'], 
                                     capture_output=True, 
                                     check=False)
                if check.returncode == 0:
                    print("   ✅ GHCi/TidalCycles is running and listening on port 6010")
                    return 'started'
                else:
                    print("   ⚠️  GHCi started but port 6010 not open yet (may need more time)")
                    return 'started'
            else:
                print(f"   ❌ Error starting GHCi: {result.stderr}")
                return 'error'
        except subprocess.TimeoutExpired:
            print("   ⚠️  GHCi startup timed out, but may have started")
            return 'started'
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return 'error'
    
    @staticmethod
    def _start_monitor_static():
        try:
            monitor_script = PROJECT_DIR / "monitor-commands.py"
            process = subprocess.Popen(['python3', str(monitor_script)],
                                      stdout=subprocess.PIPE,
                                      stderr=subprocess.PIPE)
            processes['monitor'] = process
            return 'started'
        except Exception as e:
            return f'error: {e}'
    
    @staticmethod
    def _start_bridge_static():
        try:
            bridge_dir = PROJECT_DIR / "ui"
            process = subprocess.Popen(['npm', 'start'],
                                      cwd=str(bridge_dir),
                                      stdout=subprocess.PIPE,
                                      stderr=subprocess.PIPE)
            processes['bridge'] = process
            return 'started'
        except Exception as e:
            return f'error: {e}'
    
    @staticmethod
    def _stop_process_static(pattern):
        try:
            subprocess.run(['pkill', '-f', pattern], check=False)
            return 'stopped'
        except:
            return 'error'
    
    def restart_all(self):
        """Restart all services"""
        self.stop_all()
        time.sleep(2)
        return self.start_all()
    
    def send_command(self, command):
        """Send command to TidalCycles"""
        COMMAND_FILE.parent.mkdir(exist_ok=True)
        try:
            with open(COMMAND_FILE, 'a') as f:
                f.write(command + '\n')
                f.flush()  # Ensure it's written immediately
            os.fsync(f.fileno())  # Force write to disk
            return True
        except Exception as e:
            print(f"Error writing command: {e}")
            return False
    
    def is_running(self, process_name):
        """Check if process is running"""
        try:
            if process_name == 'ghci':
                # GHCi runs inside Terminal, check for ghci or ghc processes
                result1 = subprocess.run(['pgrep', '-f', 'ghci'], 
                                       capture_output=True, check=False)
                result2 = subprocess.run(['pgrep', '-f', 'ghc.*tidal'], 
                                       capture_output=True, check=False)
                # Also check if Terminal has ghci running
                result3 = subprocess.run(['ps', 'aux'], 
                                       capture_output=True, check=False)
                if result3.returncode == 0:
                    output = result3.stdout.decode('utf-8', errors='ignore')
                    if 'ghci' in output.lower() or 'tidal' in output.lower():
                        return True
                return result1.returncode == 0 or result2.returncode == 0
            else:
                result = subprocess.run(['pgrep', '-f', process_name], 
                                      capture_output=True, check=False)
                return result.returncode == 0
        except:
            return False
    
    def is_port_open(self, port):
        """Check if port is open"""
        try:
            result = subprocess.run(['lsof', '-i', f':{port}'], 
                                  capture_output=True, check=False)
            return result.returncode == 0
        except:
            return False
    
    def get_status(self):
        """Get status of all services"""
        return {
            'supercollider': self.is_running('sclang'),
            'ghci': self.is_running('ghci'),
            'monitor': self.is_running('monitor-commands.py'),
            'bridge': self.is_port_open(8080),
            'superdirt': self.is_port_open(57120),
            'tidal': self.is_port_open(6010)
        }
    
    def start_supercollider(self):
        """Start SuperCollider (opens app, user runs script manually)"""
        # On macOS, we can open SuperCollider app
        try:
            subprocess.Popen(['open', '-a', 'SuperCollider'])
            return 'opened_app'
        except:
            return 'error'
    
    def start_ghci(self):
        """Start GHCi/TidalCycles"""
        script = f'''tell application "Terminal"
    set newTab to do script "cd '{PROJECT_DIR}' && source ~/.ghcup/env && ghci"
    activate
    delay 2
    do script ":script {GHCi_SCRIPT}" in newTab
end tell'''
        
        try:
            subprocess.run(['osascript', '-e', script], check=False)
            return 'started'
        except:
            return 'error'
    
    def start_monitor(self):
        """Start command monitor"""
        try:
            monitor_script = PROJECT_DIR / "monitor-commands.py"
            process = subprocess.Popen(['python3', str(monitor_script)],
                                      stdout=subprocess.PIPE,
                                      stderr=subprocess.PIPE)
            processes['monitor'] = process
            return 'started'
        except Exception as e:
            return f'error: {e}'
    
    def start_bridge(self):
        """Start bridge server"""
        try:
            bridge_dir = PROJECT_DIR / "ui"
            process = subprocess.Popen(['npm', 'start'],
                                      cwd=str(bridge_dir),
                                      stdout=subprocess.PIPE,
                                      stderr=subprocess.PIPE)
            processes['bridge'] = process
            return 'started'
        except Exception as e:
            return f'error: {e}'
    
    def stop_process(self, pattern):
        """Stop process by pattern"""
        try:
            subprocess.run(['pkill', '-f', pattern], check=False)
            return 'stopped'
        except:
            return 'error'
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

def start_service(port=9000):
    """Start the TidalCycles service"""
    server = HTTPServer(('localhost', port), TidalServiceHandler)
    
    print("🎵 TidalCycles Service Manager")
    print(f"📡 API Server: http://localhost:{port}")
    print("")
    print("Available endpoints:")
    print("  GET  /status  - Check service status")
    print("  GET  /start    - Start all services")
    print("  GET  /stop     - Stop all services")
    print("  GET  /restart  - Restart all services")
    print("  POST /command - Send command to TidalCycles")
    print("")
    print("Web UI:")
    print(f"  http://localhost:{port}/control.html")
    print("")
    print("Example API calls:")
    print(f"  curl http://localhost:{port}/start")
    print(f"  curl -X POST http://localhost:{port}/command -d '{{\"command\":\"d1 $ sound \\\"bd\\\"\"}}'")
    print("")
    print("Press Ctrl+C to stop")
    print("")
    
    # Auto-start services on startup
    print("🚀 Auto-starting services...")
    time.sleep(1)
    # Create a temporary handler instance to call methods
    class TempHandler:
        def start_all(self):
            return TidalServiceHandler.start_all_static()
        def stop_all(self):
            return TidalServiceHandler.stop_all_static()
    
    # Start services using static methods
    TidalServiceHandler.start_all_static()
    print("✅ Services started!")
    print("")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Shutting down service...")
        TidalServiceHandler.stop_all_static()
        server.shutdown()

if __name__ == "__main__":
    start_service()

