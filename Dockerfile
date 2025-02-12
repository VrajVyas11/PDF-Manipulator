# Use Ubuntu 20.04 as the base image
FROM ubuntu:20.04

# Set non-interactive mode for apt to avoid prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update package list and install dependencies
RUN apt update && apt install -y \
    libfontconfig1 \
    libcairo2 \
    libjpeg-turbo8 \
    wget \
    curl

# Install Node.js (required for Next.js)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs

# Download pdf2htmlEX .deb package
RUN wget -O pdf2htmlEX.deb https://github.com/pdf2htmlEX/pdf2htmlEX/releases/download/v0.18.8.rc1/pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.deb

# Install pdf2htmlEX using dpkg and fix dependencies
RUN dpkg -i ./pdf2htmlEX.deb || apt install -f -y

# Clean up
RUN rm pdf2htmlEX.deb

# Verify installation
RUN pdf2htmlEX -v

# Set working directory
WORKDIR /app

# Copy Next.js project files into the container
COPY . .

# Install dependencies
RUN npm install

# Build the Next.js app
RUN npm run build

# Expose the Next.js server port
EXPOSE 3000

# Default command to run the Next.js app
CMD ["npm", "start"]
