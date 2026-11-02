FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
RUN mvn -f backend/pom.xml -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /workspace/backend/target/krishi-drishti-api-1.0.0.jar app.jar
COPY --from=build /workspace/backend/target/tensorflow-lite/jni/x86_64/libtensorflowlite_jni.so /app/native/libtensorflowlite_jni.so
COPY model/model.tflite /app/model/model.tflite

EXPOSE 8080

ENTRYPOINT ["java", "-Duser.timezone=UTC", "-Djava.library.path=/app/native", "-jar", "app.jar"]
