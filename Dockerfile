# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Install necessary build tools and dependencies
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    && npm install -g npm@latest

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Use a smaller image for the final stage
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Install Docker CLI
RUN apk add --no-cache docker-cli

# Ensure the node user has access to Docker
RUN addgroup -S docker && adduser node docker

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]