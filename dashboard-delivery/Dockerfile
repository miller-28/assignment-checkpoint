# Multi-stage build for Delivery Dashboard
FROM node:20-alpine AS build

WORKDIR /app

# Accept build arguments
ARG VITE_API_BASE_URL=http://localhost:3001/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production image with nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
