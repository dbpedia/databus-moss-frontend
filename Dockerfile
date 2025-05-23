# Stage 1: Build the SvelteKit app
FROM node:20 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files and build the app
COPY . .
RUN npm run build

# Stage 3: Run the Node.js SvelteKit server
FROM node:20-alpine AS sveltekit_server

RUN apk add --no-cache bash

# Set the working directory
WORKDIR /app

# Copy the build files from the previous stage
COPY --from=builder /app ./

# Install production dependencies
RUN npm install --omit=dev

# Expose the SvelteKit app port (typically 3000)
EXPOSE 3000

# Start the SvelteKit app server
CMD ["node", "build"]
