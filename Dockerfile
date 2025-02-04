# Use an official Node.js image as the base
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install Docker inside the container
RUN apt-get update && apt-get install -y docker.io

# Expose the port Next.js runs on
EXPOSE 3000

# Start Next.js application
CMD ["npm", "run", "start"]
