#!/usr/bin/env python3
"""
TidalCycles Command Monitor v6 - Uses clipboard paste (most reliable)
"""

import time
import subprocess
from pathlib import Path

PROJECT_DIR = Path(__file__).parent
COMMAND_FILE = PROJECT_DIR / ".ghci-commands"

def send_to_terminal(command):
    """Send command using clipboard paste - most reliable method"""
    
    # Step 1: Copy command to clipboard
    try:
        proc = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
        proc.communicate(command.encode('utf-8'))
        proc.wait()
    except Exception as e:
        print(f"   ❌ Clipboard error: {e}")
        return False
    
    # Step 2: Activate Terminal and paste
    script = '''
    tell application "Terminal"
        activate
    end tell
    delay 0.2
    tell application "System Events"
        tell process "Terminal"
            keystroke "v" using command down
            delay 0.1
            keystroke return
        end tell
    end tell
    '''
    
    try:
        result = subprocess.run(['osascript', '-e', script],
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            return True
        else:
            if "not allowed" in result.stderr:
                print("   ⚠️  Need accessibility permission for Terminal!")
            else:
                print(f"   ⚠️  {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def monitor_commands():
    """Monitor command file for new commands"""
    print("=" * 50)
    print("🎵 TidalCycles Command Monitor v6")
    print("=" * 50)
    print(f"📝 Watching: {COMMAND_FILE}")
    print("")
    print("📋 REQUIREMENTS:")
    print("   1. GHCi running in Terminal.app")
    print("   2. Terminal.app in FRONT when clicking UI")
    print("   3. Accessibility permission for Terminal")
    print("")
    print("✅ Ready!")
    print("")
    
    if not COMMAND_FILE.exists():
        COMMAND_FILE.touch()
    
    last_size = COMMAND_FILE.stat().st_size
    last_position = last_size
    
    try:
        while True:
            current_size = COMMAND_FILE.stat().st_size
            
            if current_size > last_size:
                with open(COMMAND_FILE, 'r') as f:
                    f.seek(last_position)
                    new_commands = f.read()
                    last_position = f.tell()
                
                for line in new_commands.strip().split('\n'):
                    line = line.strip()
                    if line and not line.startswith('#'):
                        print(f"▶️  {line}")
                        if send_to_terminal(line):
                            print("   ✅")
                        else:
                            print("   ❌")
                        time.sleep(0.5)  # More time between commands
                
                last_size = current_size
            
            time.sleep(0.2)
            
    except KeyboardInterrupt:
        print("\n👋 Stopped")

if __name__ == "__main__":
    monitor_commands()
