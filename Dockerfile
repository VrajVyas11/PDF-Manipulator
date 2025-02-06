# Use an official Node.js image as the base
FROM node:18

# Set the working directory
WORKDIR /app

# Install required dependencies (excluding pdf2htmlEX)
RUN apt-get update && \
    apt-get install -y \
    curl \
    ca-certificates \
    sudo \
    docker.io && \
    rm -rf /var/lib/apt/lists/*

# Grant permission to use Docker
RUN usermod -aG docker node

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Create upload directory and set permissions
RUN mkdir -p /app/public/uploads && chmod -R 777 /app/public/uploads

# Build the Next.js application
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "start"]
