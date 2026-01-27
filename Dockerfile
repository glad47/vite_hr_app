# Development Dockerfile for HR App
FROM node:18-alpine

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy the full source code
COPY . .

# Expose the dev server port (change if your dev server uses another port)
EXPOSE 9090

# Run the dev server
CMD ["npm", "run", "dev:h5"]
