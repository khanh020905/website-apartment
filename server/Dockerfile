FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
# Install ALL dependencies including dev dependencies to run 'tsc'
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

# Copy package and install ONLY production dependencies
COPY package*.json ./
RUN npm install --production

# Copy compiled TS from builder
COPY --from=builder /app/dist ./dist

# Provide default PORT if not provided by Railway
ENV PORT=5000
EXPOSE 5000

CMD ["node", "dist/index.js"]
