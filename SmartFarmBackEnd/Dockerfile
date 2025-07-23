# 1. Java 21을 지원하는 JDK 베이스 이미지 사용
FROM eclipse-temurin:21-jdk

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. Gradle 캐시 최적화를 위한 빌드 관련 파일 먼저 복사
COPY build.gradle* settings.gradle* gradle.properties* ./
COPY gradle ./gradle

# 4. Gradle 의존성 먼저 다운로드 (캐싱 효과)
RUN ./gradlew dependencies || true

# 5. 전체 소스 복사
COPY . .

RUN chmod +x ./gradlew

# 6. 빌드 실행
RUN ./gradlew build -x test

# 7. JAR 실행 (build/libs 경로에 생성된 jar 실행)
CMD ["java", "-jar", "build/libs/SmartFarmBackEnd-0.0.1-SNAPSHOT.jar"]