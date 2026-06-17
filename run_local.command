#!/bin/bash

# Change directory to where the script is located
cd "$(dirname "$0")"

clear
echo "=========================================================="
echo "🚀  TITANICGRAM LAUNCHER"
echo "=========================================================="
echo "Checking environment details..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed on your system."
    echo "Please download and install Node.js (which includes npm) from:"
    echo "👉 https://nodejs.org/"
    echo ""
    echo "Press [ENTER] to exit..."
    read -r
    exit 1
fi

echo "✅ Node.js: $(node -v)"
echo "✅ npm: $(npm -v)"

# Install dependencies if node_modules folder does not exist
if [ ! -d "node_modules" ]; then
    echo "📦 Dependencies not found. Running 'npm install'..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error: npm install failed."
        echo "Press [ENTER] to exit..."
        read -r
        exit 1
    fi
    echo "✅ Dependencies installed successfully!"
fi

# Start the Vite dev server and open the browser
echo "⚡ Starting Vite development server..."
echo "🌐 Launching browser to http://localhost:5173/titanic-data-to-discovery/ ..."
echo "----------------------------------------------------------"

# Runs npm run dev and automatically tells Vite to open the browser
npm run dev -- --open
