FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Hiển thị cấu trúc thư mục để debug
RUN ls -la

# Build frontend
RUN npx vite build || (echo "Vite build failed" && exit 1)

# Build server
RUN npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs || (echo "esbuild failed" && exit 1)

EXPOSE 3000
CMD ["npm", "start"]