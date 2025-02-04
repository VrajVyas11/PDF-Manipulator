# Use an official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Install Docker inside the container
RUN apt-get update && apt-get install -y docker.io

# Build Next.js app
RUN npm run build

# Expose the port for the Next.js app
EXPOSE 3000

# Start the Next.js app using the built production files
CMD ["npm", "run", "start"]
