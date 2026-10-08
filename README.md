# TriGuard Secure Intelligence Platform - Backend

This is the backend for the TriGuard MVP. It provides a secure API, a robust RAG pipeline, and strict authorization enforcement.

## Tech Stack
- Java 17
- Spring Boot 3.3.4
- Spring Security (JWT)
- H2 In-Memory Database (MVP Database)
- Apache PDFBox (Document text extraction)

## Running the Application
1. Paste your OpenAI API Key into `src/main/resources/application.properties`:
   `openai.api.key=YOUR_KEY_HERE`
2. Run the application:
   `./mvnw spring-boot:run`

## Mock Data
The backend uses an in-memory database and will automatically generate the following users on startup:
- employee@triguard.com (password: password)
- hr@triguard.com (password: password)
- manager@triguard.com (password: password)
- admin@triguard.com (password: password)
