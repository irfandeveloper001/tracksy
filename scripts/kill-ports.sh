#!/bin/bash

# Kill processes on TRACKSY development ports
echo "🔧 Killing processes on TRACKSY ports..."

PORTS=(4000 5173 19007 19008 8000)

for port in "${PORTS[@]}"; do
  PID=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$PID" ]; then
    echo "  ⚠️  Killing process on port $port (PID: $PID)"
    kill -9 $PID 2>/dev/null
    sleep 0.5
  else
    echo "  ✅ Port $port is free"
  fi
done

echo ""
echo "✅ All TRACKSY ports cleared!"
echo "   You can now run: npm run web"

