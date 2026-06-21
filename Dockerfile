FROM node:20-alpine
WORKDIR /app

COPY package*.json ./

# Xóa lock và node_modules cũ
RUN rm -rf node_modules package-lock.json

# Cài dependencies
RUN npm install

COPY . .

# Build
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]