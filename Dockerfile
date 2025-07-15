# --------- Stage 1: Build React app ---------
FROM --platform=linux/amd64 node:18 AS client-build

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm install --legacy-peer-deps

COPY client/ ./
RUN npm run build

# --------- Stage 2: Build API app ---------
FROM --platform=linux/amd64 node:18 AS api-build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Only copy API source files, not client
COPY src ./src
COPY tsconfig.json ./tsconfig.json

RUN npm run build

# --------- Stage 3: Production image ---------
FROM --platform=linux/amd64 node:18-slim

WORKDIR /app

# Copy API app (including node_modules and src)
COPY --from=api-build /app ./

# Copy built React app into the expected location
COPY --from=client-build /app/client/build ./client/build


ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

# Expose your API port
EXPOSE 3001

RUN npm install -g ts-node


# Start the API using ts-node (for TypeScript)
CMD ["npx", "ts-node", "src/index.ts"] 