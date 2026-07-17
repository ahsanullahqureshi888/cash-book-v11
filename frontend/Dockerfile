# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies (clean install)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the production assets
RUN npm run build

# Stage 2: Serve the built assets with Nginx
FROM nginx:alpine

# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 3000 as configured in nginx.conf
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
