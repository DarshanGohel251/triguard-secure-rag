# TriGuard Security Model

## Core Principle: Pre-LLM Authorization
TriGuard ensures that **unauthorized context never enters the LLM context window**. 
The retrieval phase operates completely outside the LLM. Vector similarity search runs across all documents, but the result set is strictly filtered by the requesting user's identity and Role-Based Access Control (RBAC) claims *before* any text is packaged into the OpenAI prompt.

## Identity & RBAC
Authentication is stateless using JSON Web Tokens (JWT).
- `EMPLOYEE`: Access to `PUBLIC` and `INTERNAL` documents.
- `DEPARTMENT_MANAGER`: Access to above + `CONFIDENTIAL` documents.
- `HR_MANAGER`: Access to above + `RESTRICTED` documents.
- `ADMIN`: Global access.

## Audit Logging
Every query against the RAG system produces an `AuditLog` entry detailing:
- Action (RETRIEVAL)
- Decision (ALLOW / DENY)
- Request UUID
- Timestamp

If a user's similarity search matches a highly relevant chunk from a document they lack clearance for, the system generates a `SecurityEvent` and gracefully fails to answer using restricted data.
