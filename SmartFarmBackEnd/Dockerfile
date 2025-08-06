# --- build stage ---
FROM gradle:8.4-jdk21 AS builder
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew build -x test

# --- runtime stage ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/build/libs/SmartFarmBackEnd-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]