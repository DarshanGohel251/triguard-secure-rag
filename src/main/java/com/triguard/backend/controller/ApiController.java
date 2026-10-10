package com.triguard.backend.controller;

import com.triguard.backend.dto.QueryRequest;
import com.triguard.backend.dto.QueryResponse;
import com.triguard.backend.entity.AuditLog;
import com.triguard.backend.entity.Document;
import com.triguard.backend.entity.DocumentClassification;
import com.triguard.backend.entity.User;
import com.triguard.backend.repository.AuditLogRepository;
import com.triguard.backend.repository.DocumentChunkRepository;
import com.triguard.backend.repository.DocumentRepository;
import com.triguard.backend.repository.SecurityEventRepository;
import com.triguard.backend.repository.UserRepository;
import com.triguard.backend.service.DocumentService;
import com.triguard.backend.service.LlmService;
import com.triguard.backend.service.RagService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ApiController {

    private final DocumentService documentService;
    private final RagService ragService;
    private final LlmService llmService;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final SecurityEventRepository securityEventRepository;
    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository chunkRepository;

    public ApiController(DocumentService documentService, RagService ragService, LlmService llmService,
                         UserRepository userRepository, AuditLogRepository auditLogRepository,
                         SecurityEventRepository securityEventRepository,
                         DocumentRepository documentRepository, DocumentChunkRepository chunkRepository) {
        this.documentService = documentService;
        this.ragService = ragService;
        this.llmService = llmService;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.securityEventRepository = securityEventRepository;
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(user);
    }

    @GetMapping("/documents")
    public ResponseEntity<List<Document>> getDocuments(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(documentService.getAuthorizedDocuments(user));
    }

    @PostMapping("/documents")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("classification") String classification,
            @RequestParam("department") String department,
            Authentication auth) {

        if (auth == null) return ResponseEntity.status(401).build();

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Uploaded file is empty"));
        }

        // Limit to 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File exceeds maximum 10MB limit"));
        }

        DocumentClassification docClassification;
        try {
            docClassification = DocumentClassification.valueOf(classification.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid classification level: " + classification));
        }

        try {
            User user = userRepository.findByEmail(auth.getName()).orElseThrow();

            // Sanitize filename against path traversal
            String rawFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.txt";
            String safeFilename = rawFilename.replaceAll("[\\\\/:]", "_").replaceAll("\\.\\.", "_");

            String content = "";
            if (safeFilename.toLowerCase().endsWith(".pdf")) {
                try (PDDocument document = PDDocument.load(file.getInputStream())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    StringBuilder sb = new StringBuilder();
                    for (int page = 1; page <= document.getNumberOfPages(); page++) {
                        stripper.setStartPage(page);
                        stripper.setEndPage(page);
                        String pageText = stripper.getText(document).trim();
                        if (!pageText.isEmpty()) {
                            sb.append("===PAGE ").append(page).append("===").append("\n").append(pageText).append("\n\n");
                        }
                    }
                    content = sb.toString();
                } catch (Exception pdfEx) {
                    content = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
                }
            } else {
                content = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
            }

            // If file was empty or PDF had only binary/scanned images, provide structured fallback
            if (content.trim().isEmpty() || content.trim().length() < 5) {
                content = "===PAGE 1===\nDocument Asset: " + safeFilename + "\nDepartment: " + department +
                          "\nSecurity Classification: " + docClassification.name() + "\nOwner: " + user.getName() +
                          "\nVerified Scope: Scoped knowledge asset ingested and quarantined in vector clearance sandbox.\n";
            }

            Document doc = documentService.ingestDocument(
                    safeFilename,
                    content,
                    docClassification,
                    department != null && !department.isBlank() ? department : user.getDepartment(),
                    user
            );

            auditLogRepository.save(new AuditLog(
                    user.getEmail(),
                    user.getRole().name(),
                    "DOCUMENT_UPLOAD",
                    "ALLOW",
                    UUID.randomUUID().toString(),
                    "Uploaded document '" + safeFilename + "' with classification " + docClassification.name()
            ));

            return ResponseEntity.ok(doc);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Document ingestion error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();

        try {
            boolean deleted = documentService.deleteDocument(id, user);
            if (!deleted) {
                return ResponseEntity.notFound().build();
            }
            auditLogRepository.save(new AuditLog(
                    user.getEmail(),
                    user.getRole().name(),
                    "DOCUMENT_DELETE",
                    "ALLOW",
                    UUID.randomUUID().toString(),
                    "Deleted document ID " + id
            ));
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully", "id", id));
        } catch (org.springframework.security.access.AccessDeniedException e) {
            auditLogRepository.save(new AuditLog(
                    user.getEmail(),
                    user.getRole().name(),
                    "DOCUMENT_DELETE",
                    "DENY",
                    UUID.randomUUID().toString(),
                    "Unauthorized attempt to delete document ID " + id
            ));
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/query")
    public ResponseEntity<?> query(@RequestBody QueryRequest req, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();

        if (req == null || req.getQuery() == null || req.getQuery().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query cannot be empty"));
        }

        if (req.getQuery().length() > 2000) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query exceeds 2000 character maximum limit"));
        }

        try {
            User user = userRepository.findByEmail(auth.getName()).orElseThrow();
            QueryResponse res = ragService.query(req.getQuery().trim(), user);
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            String msg = "AI answer generation is temporarily unavailable.";
            if ("AI_PROVIDER_NOT_CONFIGURED".equals(e.getMessage())) {
                msg = "The AI provider is not configured on the server.";
            } else if ("AI_PROVIDER_QUOTA_EXCEEDED".equals(e.getMessage())) {
                msg = "AI provider quota exceeded.";
            } else if ("AI_PROVIDER_AUTH_FAILED".equals(e.getMessage())) {
                msg = "AI provider authentication failed.";
            }

            Map<String, String> err = new HashMap<>();
            err.put("code", e.getMessage() != null ? e.getMessage() : "SERVER_ERROR");
            err.put("message", msg);
            err.put("requestId", UUID.randomUUID().toString());
            return ResponseEntity.status(503).body(err);
        }
    }

    @GetMapping("/audit/logs")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/security/events")
    public ResponseEntity<?> getSecurityEvents() {
        return ResponseEntity.ok(securityEventRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/diagnostics")
    public ResponseEntity<?> getDiagnostics() {
        Map<String, Object> diag = new HashMap<>(llmService.getDiagnostics());
        diag.put("documentCount", documentRepository.count());
        diag.put("chunkCount", chunkRepository.count());
        diag.put("auditLogCount", auditLogRepository.count());
        diag.put("securityEventCount", securityEventRepository.count());
        diag.put("systemStatus", "OPERATIONAL");
        return ResponseEntity.ok(diag);
    }
}
