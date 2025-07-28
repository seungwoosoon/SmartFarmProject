# # frontend/Dockerfile
# FROM node:20 AS build

# WORKDIR /app
# COPY package.json ./
# COPY package-lock.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# # 빌드된 정적 파일을 nginx로 서비스 (옵션)
# FROM nginx:alpine
# COPY --from=build /app/build /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

# 1단계: React 앱 빌드
FROM node:20 AS build

# 작업 디렉토리 설정
WORKDIR /app

# package 파일만 먼저 복사하여 캐싱
COPY package*.json ./

# 의존성 설치 (npm ci가 더 안정적임, lock 파일 기준으로)
RUN npm ci

# 전체 코드 복사
COPY . .

# React 앱 빌드
RUN npm run build

# 2단계: Nginx로 정적 파일 서빙
FROM nginx:alpine

# 빌드된 결과물을 nginx html 경로로 복사
COPY --from=build /app/build /usr/share/nginx/html

# 커스텀 nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]
