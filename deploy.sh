#!/bin/bash

# Configuration
APP_NAME="vallartavows"
REMOTE_DIR="/var/www/$APP_NAME"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Hostinger VPS Deployment for $APP_NAME ===${NC}"

# 1. Get VPS Details
read -p "Enter VPS User (default: root): " VPS_USER
VPS_USER=${VPS_USER:-root}

read -p "Enter VPS IP Address: " VPS_IP

if [ -z "$VPS_IP" ]; then
    echo -e "${RED}Error: VPS IP is required.${NC}"
    exit 1
fi

DEST="$VPS_USER@$VPS_IP"

# 2. Check Connection
echo -e "\n${YELLOW}Checking connection to $DEST...${NC}"
ssh -q -o BatchMode=yes -o ConnectTimeout=5 $DEST exit
if [ $? -ne 0 ]; then
    echo -e "${RED}Connection failed. Please check your IP and SSH keys.${NC}"
    echo "You may need to run: ssh-copy-id $DEST"
    exit 1
fi
echo -e "${GREEN}Connection successful.${NC}"

# 3. Trigger Update from GitHub
echo -e "\n${YELLOW}Triggering pull from GitHub and rebuild on VPS...${NC}"
ssh $DEST "cd $REMOTE_DIR && \
    echo 'Pulling latest changes...' && \
    git config --global --add safe.directory $REMOTE_DIR && \
    git fetch origin && \
    git reset --hard origin/main && \
    echo 'Rebuilding containers...' && \
    docker compose down && \
    docker compose up -d --build && \
    docker system prune -f"

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
echo -e "Your app should be live at: http://$VPS_IP:8002"
