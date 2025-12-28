# Deploying to Hostinger VPS

This guide will walk you through deploying your `mk-vallartavows` application to a Hostinger VPS.

## Prerequisites

1.  **Hostinger VPS**: You should have a VPS running a Linux distribution (Ubuntu 20.04/22.04 recommended).
2.  **SSH Access**: You need the IP address of your VPS and the root password (or a configured SSH key).
3.  **Local Tools**: Ensure you have `ssh`, `scp`, and `rsync` installed on your Mac (these are usually pre-installed).

## Step 1: Initial VPS Setup (First Time Only)

If you haven't set up your VPS yet, you might need to install Docker.

1.  **SSH into your VPS:**
    ```bash
    ssh root@<YOUR_VPS_IP>
    ```
2.  **Install Docker & Docker Compose:**
    Run the following commands on your VPS to install Docker:
    ```bash
    apt update
    apt install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    ```
3.  **Verify Docker:**
    ```bash
    docker --version
    docker compose version
    ```

## Step 2: Deploy the Application

We have a script `deploy.sh` that automates the file transfer and deployment.

1.  **Run the deployment script:**
    From the root of your project (`mk-vallartavows`), run:
    ```bash
    ./deploy.sh
    ```
2.  **Follow the prompts:**
    - Enter your VPS User (usually `root`).
    - Enter your VPS IP Address.
    - If prompted, enter your VPS password.

## Step 3: Verify Deployment

Once the script finishes:

1.  Open your browser and navigate to:
    `http://<YOUR_VPS_IP>:8002`

You should see your application running!

## Troubleshooting

-   **Connection Refused?**
    -   Make sure port `8002` is open in your VPS firewall.
    -   On Hostinger, check the "Firewall" section in the control panel.
-   **Permission Denied (publickey)?**
    -   Ensure your SSH key is added to the VPS `~/.ssh/authorized_keys`.
    -   Or, simply use the root password when prompted.
