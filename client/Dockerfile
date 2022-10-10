FROM node:17 AS builder
ENV NODE_ENV development

# Add a work directory
WORKDIR /app
# Cache and Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm install
# Copy app files
COPY . .
# Expose port
RUN npm run build

# Bundle static assets with nginx
FROM nginx:1.21.0-alpine as production
ENV NODE_ENV production
# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html
# Add your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY certs/nginx-selfsigned.crt /etc/ssl/certs/nginx-selfsigned.crt

COPY certs/nginx-selfsigned.key /etc/ssl/private/nginx-selfsigned.key

# Expose port
EXPOSE 80 443
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
