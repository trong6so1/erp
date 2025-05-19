FROM node:20-alpine

WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài dependencies (dev + prod)
RUN npm install

# Copy toàn bộ source code
COPY . .

# Expose port (mặc định NestJS dùng 3000)
EXPOSE 3000

# Chạy app với watch mode dev, để thay đổi code tự reload
CMD ["npm", "run", "start:dev"]
