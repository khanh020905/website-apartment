FROM node:20-alpine AS builder

WORKDIR /app

# The VITE_API_URL environment variable is required to build the React application.
# It points to the backend server domain. During docker build, this variable is embedded.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve standard static content using nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*
RUN rm /etc/nginx/conf.d/default.conf

# Copy Vite's statically built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
