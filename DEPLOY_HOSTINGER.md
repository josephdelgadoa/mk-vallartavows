# Hostinger VPS Deployment Guide

This guide details how to deploy and update the `mk-vallartavows` application on your Hostinger VPS.

## Quick Start (Routine Updates)

If you have already set up the VPS and just want to deploy new changes:

1.  **Open Terminal** in the project folder.
2.  **Run the script:**
    ```bash
    ./deploy.sh
    ```
3.  **Enter Credentials**:
    -   **User**: `root`
    -   **IP**: `31.220.75.101` (or your specific VPS IP)
    -   **Password**: (Enter when prompted)
4.  **Wait**: The script will sync files, rebuild the Docker container, and restart the app.

---

## Prerequisites (First Time Setup)

1.  **Hostinger VPS**: Ubuntu 20.04/22.04 recommended.
2.  **Access Details**: IP Address and Root Password.
3.  **Local Tools**: `ssh`, `rsync` (Standard on Mac).

## Step 1: Initial VPS Configuration

**You only need to do this ONCE.**

1.  **SSH into your VPS:**
    ```bash
    ssh root@<YOUR_VPS_IP>
    ```
2.  **Install Docker & Docker Compose:**
    ```bash
    apt update
    apt install -y docker.io docker-compose-plugin
    ```
3.  **Verify Installation:**
    ```bash
    docker compose version
    ```

## Step 2: The Deployment Script

The `deploy.sh` script automates the process:

1.  **Syncs Files**: Copies your local project code to the VPS using `rsync`.
2.  **Builds**: runs `docker compose build` on the VPS.
3.  **Restarts**: runs `docker compose up -d` to restart the app with new code.
4.  **Cleans**: Prunes unused images to save space.

## Troubleshooting

### "I don't see my changes!"
1.  **Browser Cache**: This is the most common reason.
    -   **Hard Refresh**: `Cmd + Shift + R` (Mac) or `Ctrl + F5` (Windows).
    -   **Incognito**: Open the URL in an Incognito window.
2.  **Build Fail**: Did the script show errors during the "Building" phase? Check the terminal output.
3.  **Server Logs**: SSH into the VPS and check logs:
    ```bash
    ssh root@<YOUR_VPS_IP>
    cd /var/www/vallartavows
    docker compose logs -f app
    ```

### "Connection Refused"
-   Ensure port **8002** is open in your Hostinger Firewall settings.

---

## VPS Terminal Cheat Sheet

If you want to manage the server directly (SSH in), here are the commands you'll use most often.

**1. Log in to your VPS**
```bash
ssh root@31.220.75.101
# Type your password when prompted (it won't show on screen)
```

**2. Navigate to your app**
```bash
cd /var/www/vallartavows
```

**3. Check Status**
```bash
# See running containers
docker compose ps

# See real-time logs (Press Ctrl+C to exit)
docker compose logs -f
```

**4. Manual Restart**
```bash
# Pull latest changes and restart
docker compose down
docker compose up -d --build
```
