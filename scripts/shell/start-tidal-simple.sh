#!/bin/bash
# Simple TidalCycles starter
# Make sure SuperDirt is running in SuperCollider FIRST!

echo "🚀 Starting TidalCycles..."
echo ""
echo "⚠️  IMPORTANT: Make sure SuperDirt is running in SuperCollider!"
echo "   (You should see 'SuperDirt is running on port 57120')"
echo ""
echo "Press Enter to continue..."
read

# Source Haskell environment
source ~/.ghcup/env 2>/dev/null || . "$HOME/.ghcup/env"

echo "Starting GHCi with Tidal..."
echo ""
echo "Once GHCi starts, type these commands:"
echo "  :set prompt \"tidal> \""
echo "  :m +Sound.Tidal.Context"
echo "  tidal <- startTidal (defaultConfig {cCtrlAddr = \"127.0.0.1\", cCtrlPort = 57120}) (defaultTarget {oName = \"SuperDirt\", oAddress = \"127.0.0.1\", oPort = 57120, oLatency = 0.02, oSchedule = Pre BundleStamp})"
echo ""
echo "Then try: d1 \$ sound \"bd sn\""
echo ""

ghci

