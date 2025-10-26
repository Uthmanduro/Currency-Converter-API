#!/usr/bin/env bash
set -e

# Install system dependencies for canvas
apt-get update && apt-get install -y \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  libexpat1

# Now install your node modules
npm install
