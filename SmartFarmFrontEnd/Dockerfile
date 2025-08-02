# 1단계: React 앱 빌드
FROM node:20 AS build

# 1-1) 작업 디렉토리
WORKDIR /app

# 1-2) 빌드 인자 정의 & env 설정
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# 1-3) package만 복사 → 의존성 설치 (캐시 활용)
COPY package*.json ./
RUN npm ci

# 1-4) 전체 소스 복사
COPY . .

# 1-5) React 앱 빌드
RUN npm run build

# 2단계: Nginx로 정적 파일 서빙
FROM nginx:alpine

# 2-1) build 결과물을 nginx html 경로로 복사
COPY --from=build /app/build /usr/share/nginx/html

# 2-2) Nginx 설정 (필요시)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]