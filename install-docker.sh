#!/bin/bash

# ===================================================================
# Install Docker & Docker Compose di Ubuntu 24.04
# ===================================================================

set -e

echo "=========================================="
echo "🐳 Install Docker & Docker Compose"
echo "=========================================="

# Update package list
echo "📦 Updating package list..."
apt-get update

# Install prerequisites
echo "📦 Installing prerequisites..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
echo "🔑 Adding Docker GPG key..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo "📦 Setting up Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list again
apt-get update

# Install Docker Engine, CLI, and Compose
echo "🐳 Installing Docker..."
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Verify installation
echo ""
echo "✅ Docker installed successfully!"
docker --version
docker compose version

echo ""
echo "=========================================="
echo "✅ INSTALLATION COMPLETE!"
echo "=========================================="
