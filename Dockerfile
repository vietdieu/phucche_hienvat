# Dùng Node 20 (hoặc 22) thay vì 18
FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Xóa lock file nếu cần (tránh lỗi optional dependencies)
RUN rm -f package-lock.json

# Cài dependencies (npm install thay vì npm ci để build native binding)
RUN npm install

# Copy source code
COPY . .

# Build ứng dụng
RUN npm run build

# Mở cổng
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "start"]