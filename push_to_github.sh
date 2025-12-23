#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║              PUSH ALL CHANGES TO GITHUB                     ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "This script will push all changes from jsn and kyl directories to GitHub."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "AUTHENTICATION REQUIRED:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You'll need:"
echo "  1. GitHub Username: irfandeveloper001"
echo "  2. Personal Access Token (NOT your password)"
echo ""
echo "How to get a Personal Access Token:"
echo "  1. Go to: https://github.com/settings/tokens"
echo "  2. Click 'Generate new token' → 'Generate new token (classic)'"
echo "  3. Give it a name: 'Tracksy Development'"
echo "  4. Select scopes: ✓ repo (all sub-options)"
echo "  5. Click 'Generate token'"
echo "  6. Copy the token (starts with 'ghp_')"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Press Enter to continue with pushing, or Ctrl+C to cancel..."
echo ""

echo "📦 Pushing kyl-updates branch..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd /root/.cursor/worktrees/tracksy__WSL__ubuntu_/kyl
git push -u origin kyl-updates

if [ $? -eq 0 ]; then
    echo "✅ kyl-updates branch pushed successfully!"
else
    echo "❌ Failed to push kyl-updates branch"
    echo "Note: If you get authentication errors, make sure you're using a Personal Access Token, not your password."
    exit 1
fi

echo ""
echo "📦 Pushing jsn-updates branch..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd /root/.cursor/worktrees/tracksy__WSL__ubuntu_/jsn
git push -u origin jsn-updates

if [ $? -eq 0 ]; then
    echo "✅ jsn-updates branch pushed successfully!"
else
    echo "❌ Failed to push jsn-updates branch"
    exit 1
fi

echo ""
echo "📦 Pushing backend-setup branch..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd /home/irfan/tracksy
git push origin backend-setup

if [ $? -eq 0 ]; then
    echo "✅ backend-setup branch pushed successfully!"
else
    echo "❌ Failed to push backend-setup branch"
    exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           ✅ ALL CHANGES PUSHED SUCCESSFULLY! ✅             ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Branches pushed:"
echo "  • kyl-updates    (130 files changed)"
echo "  • jsn-updates    (synced)"
echo "  • backend-setup  (main branch)"
echo ""
echo "View on GitHub:"
echo "  https://github.com/irfandeveloper001/tracksy"
echo ""
echo "Next steps:"
echo "  1. Go to GitHub and create Pull Requests to merge these branches"
echo "  2. Review the changes"
echo "  3. Merge into main branch"
echo ""

