# Stage 1: Build the application
FROM node:20 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

EXPOSE 5173

# Start the server
CMD npm run dev -- --host
