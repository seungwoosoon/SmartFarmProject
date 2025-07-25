# frontend/Dockerfile
FROM node:20 AS build

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# 빌드된 정적 파일을 nginx로 서비스 (옵션)
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# # React Dockerfile 최적화 예시
# FROM node:20-alpine as build 
#  # alpine 사용으로 더 작은 베이스 이미지
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --only=production --silent 
#  # 불필요한 로그 제거
# COPY . .
# RUN npm run build

# FROM nginx:alpine 
#  # 최종 이미지도 alpine 사용
# COPY --from=build /app/build /usr/share/nginx/html