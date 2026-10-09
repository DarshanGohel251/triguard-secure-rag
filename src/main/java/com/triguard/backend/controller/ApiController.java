package com.triguard.backend.controller;

import com.triguard.backend.dto.QueryRequest;
import com.triguard.backend.dto.QueryResponse;
import com.triguard.backend.entity.Document;
import com.triguard.backend.entity.DocumentClassification;
import com.triguard.backend.entity.User;
import com.triguard.backend.repository.AuditLogRepository;
import com.triguard.backend.repository.SecurityEventRepository;
import com.triguard.backend.repository.UserRepository;
import com.triguard.backend.service.DocumentService;
import com.triguard.backend.service.RagService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.io.IOException;

import com.triguard.backend.service.LlmService;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ApiController {

    private final DocumentService documentService;
    private final RagService ragService;
    private final LlmService llmService;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final SecurityEventRepository securityEventRepository;

    public ApiController(DocumentService documentService, RagService ragService, LlmService llmService,
                         UserRepository userRepository, AuditLogRepository auditLogRepository,
                         SecurityEventRepository securityEventRepository) {
        this.documentService = documentService;
        this.ragService = ragService;
        this.llmService = llmService;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.securityEventRepository = securityEventRepository;
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
        
        try {
            User user = userRepository.findByEmail(auth.getName()).orElseThrow();
            
            String content = "";
            if (file.getOriginalFilename() != null && file.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
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
                }
            } else {
                content = new String(file.getBytes());
            }

            Document doc = documentService.ingestDocument(
                    file.getOriginalFilename(),
                    content,
                    DocumentClassification.valueOf(classification.toUpperCase()),
                    department,
                    user
            );

            return ResponseEntity.ok(doc);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("File processing error");
        }
    }

    @PostMapping("/query")
    public ResponseEntity<?> query(@RequestBody QueryRequest req, Authentication auth) {
        try {
            User user = userRepository.findByEmail(auth.getName()).orElseThrow();
            QueryResponse res = ragService.query(req.getQuery(), user);
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            String msg = "AI answer generation is temporarily unavailable.";
            if ("AI_PROVIDER_NOT_CONFIGURED".equals(e.getMessage())) {
                msg = "The AI provider is not configured on the server.";
            } else if ("AI_PROVIDER_QUOTA_EXCEEDED".equals(e.getMessage())) {
                msg = "AI provider quota exceeded.";
            }
            java.util.Map<String, String> err = new java.util.HashMap<>();
            err.put("code", e.getMessage() != null ? e.getMessage() : "SERVER_ERROR");
            err.put("message", msg);
            err.put("requestId", java.util.UUID.randomUUID().toString());
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
        return ResponseEntity.ok(llmService.getDiagnostics());
    }
}
