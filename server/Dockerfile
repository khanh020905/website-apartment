FROM node:20-alpine AS builder

WORKDIR /app

# Copy the server's package.json
COPY server/package*.json ./server/

# Install dependencies (cd into server)
RUN cd server && npm install

# Copy ONLY what is needed (the shared folder AND the server folder)
COPY shared ./shared
COPY server ./server

# Build the server (which will now successfully find the shared folder)
RUN cd server && npm run build

# --- Stage 2: Production ---
FROM node:20-alpine
WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy compiled TS
COPY --from=builder /app/server/dist ./server/dist

WORKDIR /app/server
ENV PORT=5000
EXPOSE 5000

CMD ["node", "dist/index.js"]
