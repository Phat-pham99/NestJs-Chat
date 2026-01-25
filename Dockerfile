# --- Stage 1: Build Stage ---
FROM node:22.17-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using npm
RUN yarn install

# Copy source files
COPY . .

# Build the application
RUN npm run build

# --- Stage 2: Production Stage ---
FROM oven/bun:1.3

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
# Copy the node_modules folder from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["bun", "run", "dist/main.js"]
