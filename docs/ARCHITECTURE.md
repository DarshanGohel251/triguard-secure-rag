# TriGuard Architecture Overview

## Current MVP State
TriGuard is a modular client-server application built with a React (Vite) frontend and a Spring Boot backend. 

### Frontend
- **Framework**: React 19 / Vite
- **Styling**: Tailwind CSS v4
- **State/Routing**: React Router DOM, simple component state.
- **Theme**: Secure Intelligence ("Dark graphite" with cyan AI accents and distinct RBAC colors).

### Backend
- **Framework**: Spring Boot 3.3.4
- **Language**: Java 17
- **Database**: H2 In-Memory (for MVP rapid iteration)
- **Security**: Stateless JWT via Spring Security filter chain.
- **RAG Services**: Native document extraction (`Apache PDFBox`), naive chunking, and HTTP client integration with OpenAI for embeddings and completions.

## Future '10/10' State Architecture Roadmap
In future phases, the architecture will scale into:
- **Database Replacement**: H2 will be replaced with PostgreSQL + `pgvector` for true enterprise-scale vector storage and fast similarity search.
- **Microservices**: A dedicated `Auth Service`, `Document Ingestion Pipeline` (async message queues via RabbitMQ/Kafka), and a `RAG Engine` service.
- **Observability**: Prometheus & Grafana for system metrics.
