# Stage 1: Build the React application
FROM node:20.19-alpine AS build

WORKDIR /app

# Copy package descriptors
COPY package.json package-lock.json ./

# Install dependencies (clean install)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the production assets (disable sourcemaps to keep image size small)
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# Stage 2: Serve the built assets with Nginx
FROM nginx:1.25-alpine

# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 3000 as configured in nginx.conf
EXPOSE 3000

# Docker healthcheck using wget (pre-installed in alpine)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
