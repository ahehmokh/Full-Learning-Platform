FROM node:20-bookworm

# Install Python
RUN apt-get update \
    && apt-get install -y python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Copy backend
COPY . .

# Create uploads folder
RUN mkdir -p uploads

# Start server
CMD ["node", "server.js"]