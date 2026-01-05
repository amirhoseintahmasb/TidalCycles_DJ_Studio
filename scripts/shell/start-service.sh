#!/bin/bash
# Start TidalCycles as a complete backend service
# This runs everything automatically - perfect for DJ/AI use!

cd "$(dirname "$0")"

echo "🎵 Starting TidalCycles Service Infrastructure"
echo ""
echo "This will:"
echo "  1. Start API server (port 9000)"
echo "  2. Provide REST API for control"
echo "  3. Manage all processes automatically"
echo ""
echo "Access:"
echo "  - Service Control UI: http://localhost:9000/control.html"
echo "  - API: http://localhost:9000"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Install with: brew install python3"
    exit 1
fi

# Start service
python3 tidal-service.py

