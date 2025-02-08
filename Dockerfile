# Use Fedora 41 as the base image
FROM fedora:41

# Set the working directory
WORKDIR /app

# Install dependencies
RUN dnf install -y \
    cmake gcc java-1.8.0-openjdk libpng-devel fontforge-devel \
    cairo-devel poppler-devel libspiro-devel freetype-devel poppler-data \
    libjpeg-turbo-devel git make gcc-c++ pkg-config gettext glib2-devel \
    util-linux \
    && dnf clean all

# Install pdf2htmlEX from source
RUN git clone --depth 1 --branch pdf2htmlEX https://github.com/coolwanglu/pdf2htmlEX.git /pdf2htmlEX && \
    cd /pdf2htmlEX && \
    cmake . && make && make install && \
    rm -rf /pdf2htmlEX

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
