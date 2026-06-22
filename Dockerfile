FROM node:20-alpine

# Cài đặt các công cụ cần thiết để build native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build ứng dụng
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]