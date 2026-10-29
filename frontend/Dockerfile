# Multi-stage build for CareerFlow Angular Frontend
# Stage 1: Build the Angular production bundle
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first for Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy source files and compile production build
COPY . ./
RUN npx ng build --configuration production

# Stage 2: Serve static files with high-performance Nginx
FROM nginx:alpine AS final
WORKDIR /usr/share/nginx/html

# Remove default nginx html files
RUN rm -rf ./*

# Copy compiled Angular SPA assets from build stage
COPY --from=build /app/dist/frontend/browser ./

# Copy custom Nginx configuration with reverse proxy for /api/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
