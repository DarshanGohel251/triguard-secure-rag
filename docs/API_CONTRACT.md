# TriGuard API Contract

## Authentication
`POST /api/v1/auth/login`
- Body: `{ "email": "string", "password": "password" }`
- Returns: `{ "token": "jwt_string", "id": 1, "email": "string", "name": "string", "role": "string" }`

## Documents
`GET /api/v1/documents`
- Headers: `Authorization: Bearer <token>`
- Returns: `[ { "id": 1, "name": "string", "classification": "string", "department": "string", "status": "READY" } ]`

`POST /api/v1/documents` (Multipart FormData)
- Headers: `Authorization: Bearer <token>`
- Form Data: `file` (File), `classification` (String), `department` (String)
- Returns: `Document` object

## RAG Query
`POST /api/v1/query`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "query": "What is the policy?" }`
- Returns: 
```json
{
  "answer": "string",
  "citations": [
    { "documentName": "string", "page": 1, "snippet": "string" }
  ]
}
```

## Security & Audit
`GET /api/v1/audit/logs`
- Headers: `Authorization: Bearer <token>`
- Returns: `[ AuditLog ]`

`GET /api/v1/security/events`
- Headers: `Authorization: Bearer <token>`
- Returns: `[ SecurityEvent ]`
