# 1단계: React 빌드
FROM node:20 AS build
WORKDIR /app

# ✅ 빌드 전에 키 주입
ARG REACT_APP_WEATHER_API_KEY
ENV REACT_APP_WEATHER_API_KEY=$REACT_APP_WEATHER_API_KEY

COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# 2단계: Nginx
FROM nginx:alpine
WORKDIR /app
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]