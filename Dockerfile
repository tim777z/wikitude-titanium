# Dockerfile for Wikitude Titanium Development Environment
# Provides a consistent Node.js environment for linting, testing, and security auditing
# Note: Titanium CLI and native SDKs (iOS/Android) require host machine - not included

# Use official Node.js image matching .nvmrc
FROM node:18.20.0-alpine AS base

# Install system dependencies for native modules and tooling
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    bash \
    curl \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN npm ci --prefer-offline --no-audit --no-fund

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

# Default command runs the full CI pipeline locally
CMD ["sh", "-c", "npm run lint && npm test && npm run security:audit"]

# =============================================================================
# Development stage - extends base with additional tooling
# =============================================================================
FROM base AS development

# Switch back to root for installing global tools
USER root

# Install additional development tools
RUN npm install -g \
    @appcelerator/titanium \
    @appcelerator/arrow \
    && npm cache clean --force

# Install TruffleHog for secret scanning (static binary)
RUN curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh -s -- -b /usr/local/bin

USER appuser

# Development command - starts interactive shell
CMD ["/bin/bash"]

# =============================================================================
# CI stage - optimized for CI/CD pipelines
# =============================================================================
FROM base AS ci

# CI-specific optimizations
ENV NODE_ENV=test
ENV CI=true

# Run CI pipeline
CMD ["sh", "-c", "npm run lint && npm test && npm run security:audit"]

# =============================================================================
# Security audit stage - focused on vulnerability scanning
# =============================================================================
FROM base AS security-audit

USER root

# Install security scanning tools
RUN npm install -g \
    npm-audit-ci \
    license-checker \
    && npm cache clean --force

# Install TruffleHog
RUN curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh -s -- -b /usr/local/bin

USER appuser

# Run comprehensive security audit
CMD ["sh", "-c", "npm run security:audit && npx license-checker --summary --production && trufflehog filesystem . --fail"]