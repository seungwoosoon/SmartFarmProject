### SmartFarmBackEnd/Dockerfile

# 1) Build Stage
FROM gradle:8.4-jdk21 AS builder

# Switch to root to set up ownership and permissions
USER root
WORKDIR /app

# Copy project files into /app
COPY . .

# Ensure /app and its contents are owned by gradle user so it can write build outputs
RUN chown -R gradle:gradle /app

# Make wrapper executable in case it's used
RUN chmod +x gradlew

# Switch to gradle user for building
USER gradle

# Build the project (skip tests) using the installed Gradle
RUN gradle build -x test --no-daemon

# 2) Runtime Stage
# Use Java 21 runtime to match compiled class version
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built application JAR from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]