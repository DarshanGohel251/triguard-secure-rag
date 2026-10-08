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

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ApiController {

    private final DocumentService documentService;
    private final RagService ragService;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final SecurityEventRepository securityEventRepository;

    public ApiController(DocumentService documentService, RagService ragService, 
                         UserRepository userRepository, AuditLogRepository auditLogRepository,
                         SecurityEventRepository securityEventRepository) {
        this.documentService = documentService;
        this.ragService = ragService;
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
    public ResponseEntity<List<Document>> getDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
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
                    content = stripper.getText(document);
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
    public ResponseEntity<QueryResponse> query(@RequestBody QueryRequest req, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        QueryResponse res = ragService.query(req.getQuery(), user);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/audit/logs")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/security/events")
    public ResponseEntity<?> getSecurityEvents() {
        return ResponseEntity.ok(securityEventRepository.findAllByOrderByTimestampDesc());
    }
}
