FROM ubuntu:20.04 

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies with additional font and PDF processing libraries
RUN apt update && apt install -y \
    # Existing dependencies (keeping as-is since they work)
    libnss3 libatk1.0-0 libpangocairo-1.0-0 libx11-xcb1 \
    libxcb-dri3-0 libgbm1 libasound2 libxrandr2 libxcursor1 \
    libxcomposite1 libxdamage1 libxfixes3 libcups2 \
    libdrm2 libxrender1 libpango-1.0-0 libffi-dev \
    libnss3-dev fonts-liberation libappindicator3-1 \
    wget curl \
    # Additional dependencies for better PDF processing
    fontconfig \
    fonts-dejavu-core fonts-dejavu-extra \
    fonts-droid-fallback fonts-noto-core fonts-noto-cjk \
    fonts-noto-color-emoji fonts-opensymbol \
    fonts-symbola ttf-wqy-zenhei ttf-wqy-microhei \
    fonts-arphic-ukai fonts-arphic-uming \
    # Additional libraries for complex PDFs
    libpoppler-dev libpoppler-glib-dev \
    libfontconfig1-dev libfreetype6-dev \
    libcairo2-dev libpixman-1-dev \
    # For handling different character encodings
    locales \
    # For better memory management
    libjemalloc2 && \
    # Clean up to reduce image size
    rm -rf /var/lib/apt/lists/* && \
    apt autoremove -y && \
    apt autoclean

# Set up locales for better character handling
RUN locale-gen en_US.UTF-8 && \
    update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8

# Install Node.js (keeping version 18 as it works)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs

# Download and install pdf2htmlEX (keeping exact version since it works)
RUN wget -O pdf2htmlEX.deb https://github.com/pdf2htmlEX/pdf2htmlEX/releases/download/v0.18.8.rc1/pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.deb

# Install with better error handling
RUN dpkg -i ./pdf2htmlEX.deb || (apt install -f -y && dpkg -i ./pdf2htmlEX.deb)
RUN rm pdf2htmlEX.deb

# Verify installation and create font cache
RUN pdf2htmlEX -v && \
    fc-cache -fv

# Set memory allocation library for better performance
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2

# Create non-root user for security (optional but recommended)
RUN useradd -m -u 1001 -s /bin/bash appuser

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with better npm configuration
RUN npm ci --prefer-offline --no-audit --no-fund && \
    npm cache clean --force

RUN npx puppeteer browsers install chrome

# Copy application code
COPY . .

# Change ownership to non-root user (if using non-root user)
# RUN chown -R appuser:appuser /app

# Build the application
RUN npm run build

# Switch to non-root user (uncomment if you want to use non-root)
# USER appuser

EXPOSE 3000

# Add health check
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:3000/api/health || exit 1

# Use more robust startup command
CMD ["npm", "start"]