# Use Fedora as the base image
FROM fedora:latest

# Set working directory
WORKDIR /app

# Install dependencies
RUN dnf install -y \
    cmake gcc gnu-getopt java-1.8.0-openjdk libpng-devel fontforge-devel \
    cairo-devel poppler-devel libspiro-devel freetype-devel poppler-data \
    libjpeg-turbo-devel git make gcc-c++ pkg-config gettext glib2-devel \
    && dnf clean all

# Clone and build pdf2htmlEX
RUN git clone --branch pdf2htmlEX --depth=1 https://github.com/coolwanglu/pdf2htmlEX.git /app/pdf2htmlEX \
    && cd /app/pdf2htmlEX \
    && cmake . \
    && make -j$(nproc) \
    && make install

# Verify installation
RUN pdf2htmlEX --version

# Install Node.js 18 (required for Next.js)
RUN dnf module enable -y nodejs:18 \
    && dnf install -y nodejs \
    && npm install -g npm@latest

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY . .

# Create upload directory
RUN mkdir -p /app/public/uploads && chmod -R 777 /app/public/uploads

# Build Next.js app
RUN npm run build

# Expose port for Next.js
EXPOSE 3000

# Start Next.js app
CMD ["npm", "run", "start"]
