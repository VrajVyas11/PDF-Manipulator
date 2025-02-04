# Use a base Debian image
FROM debian:latest

# Set working directory
WORKDIR /app

# Install required dependencies and pdf2htmlEX
RUN apt-get update && apt-get install -y \
    pdf2htmlex \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all application files
COPY . .

# Expose Next.js port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
