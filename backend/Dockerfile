FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
RUN mvn -f backend/pom.xml -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /workspace/backend/target/krishi-drishti-api-1.0.0.jar app.jar
COPY model/model.onnx /app/model/model.onnx

EXPOSE 8080

ENTRYPOINT ["java", "-Duser.timezone=UTC", "-jar", "app.jar"]
