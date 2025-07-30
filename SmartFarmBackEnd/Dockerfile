# ✅ Gradle 이미지 사용 (기본 Gradle 내장됨)
FROM gradle:8.4-jdk21

WORKDIR /app

# ✅ gradlew와 gradle-wrapper가 반드시 포함되어야 함
COPY gradlew gradlew.bat ./
COPY gradle ./gradle

# ✅ 전체 소스 복사
COPY . .

RUN chmod +x ./gradlew
RUN ./gradlew build -x test

CMD ["java", "-jar", "build/libs/SmartFarmBackEnd-0.0.1-SNAPSHOT.jar"]