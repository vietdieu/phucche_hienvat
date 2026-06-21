FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài tất cả dependencies (bao gồm devDependencies)
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build ứng dụng
RUN npm run build

# Xóa devDependencies để giảm kích thước image (chỉ giữ production)
RUN npm prune --production

# Mở cổng 3000
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "start"]