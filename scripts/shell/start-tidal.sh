#!/bin/bash
# Start TidalCycles REPL
# Usage: ./scripts/start-tidal.sh

# Source Haskell environment
source ~/.ghcup/env 2>/dev/null || . "$HOME/.ghcup/env"

echo "Starting TidalCycles..."
echo "Make sure SuperDirt is running in SuperCollider first!"
echo ""

# Start GHCi with Tidal
ghci <<EOF
:set prompt "tidal> "
:m +Sound.Tidal.Context
let tidal = startTidal (defaultConfig {cCtrlAddr = "127.0.0.1", cCtrlPort = 57120}) (defaultTarget {oName = "SuperDirt", oAddress = "127.0.0.1", oPort = 57120, oLatency = 0.02, oSchedule = Pre BundleStamp})
putStrLn "TidalCycles ready! Try: d1 \$ sound \"bd sn\""
EOF

