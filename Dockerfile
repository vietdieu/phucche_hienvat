FROM node:20-alpine

# Cài build tools cho native binding
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

# Cài dependencies
RUN npm install

COPY . .

# Build ứng dụng
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]