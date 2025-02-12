# Use the prebuilt pdf2htmlEX Alpine image as the base
FROM bwits/pdf2htmlex-alpine:latest AS pdf2html

# Use a Node.js image for Next.js app
FROM node:18-alpine AS nextjs

WORKDIR /app

# Copy package.json and package-lock.json first for efficient caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Build Next.js app
RUN npm run build

# Expose port for Next.js (default 3000)
EXPOSE 3000

# Start Next.js app
CMD ["npm", "run", "start"]
