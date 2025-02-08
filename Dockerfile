# Use Ubuntu 22.04 as the base image
FROM ubuntu:22.04

# Set working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    cmake gcc git pkg-config \
    libopenjp2-7-dev libfontconfig1-dev fontforge poppler-data poppler-utils \
    packaging-dev python3-dev libpango1.0-dev libglib2.0-dev libxml2-dev giflib-tools \
    libjpeg-dev libtiff-dev uthash-dev libspiro-dev wget \
    --fix-missing && apt-get clean

# Build and install Poppler
RUN wget http://poppler.freedesktop.org/poppler-0.33.0.tar.xz && \
    tar -xvf poppler-0.33.0.tar.xz && \
    cd poppler-0.33.0 && \
    ./configure --enable-xpdf-headers && \
    make -j$(nproc) && make install && \
    cd .. && rm -rf poppler-0.33.0 poppler-0.33.0.tar.xz

# Build and install FontForge
RUN git clone --depth 1 https://github.com/fontforge/fontforge.git && \
    cd fontforge && \
    ./bootstrap && \
    ./configure && \
    make -j$(nproc) && make install && \
    cd .. && rm -rf fontforge

# Build and install pdf2htmlEX
RUN git clone --depth 1 https://github.com/coolwanglu/pdf2htmlEX.git && \
    cd pdf2htmlEX && \
    cmake . && \
    make -j$(nproc) && make install && \
    cd .. && rm -rf pdf2htmlEX

# Set up environment variables
RUN echo 'export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH' >> ~/.bashrc && \
    source ~/.bashrc

# Install Node.js and dependencies
RUN apt-get install -y nodejs npm && \
    npm install -g npm@latest

# Copy package.json and install Node.js dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Create upload directory
RUN mkdir -p /app/public/uploads && chmod -R 777 /app/public/uploads

# Build Next.js app
RUN npm run build

# Expose the Next.js port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
