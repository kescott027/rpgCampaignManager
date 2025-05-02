# Base image: Python + Node for full-stack dev
FROM mcr.microsoft.com/devcontainers/python:3.11

# Install Node.js 18 (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm

# Install global tools (optional)
RUN pip install --upgrade pip && \
    pip install black flake8 pylint pytest detect-secrets

# Set working directory
WORKDIR /workspaces/rpgCampaignManager

