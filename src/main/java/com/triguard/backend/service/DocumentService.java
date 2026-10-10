package com.triguard.backend.service;

import com.triguard.backend.entity.*;
import com.triguard.backend.repository.DocumentChunkRepository;
import com.triguard.backend.repository.DocumentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository chunkRepository;
    private final LlmService llmService;
    private final VectorService vectorService;

    public DocumentService(DocumentRepository documentRepository, DocumentChunkRepository chunkRepository,
                           LlmService llmService, VectorService vectorService) {
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
        this.llmService = llmService;
        this.vectorService = vectorService;
    }

    public Document ingestDocument(String name, String content, DocumentClassification classification, String department, User owner) {
        Document doc = new Document(name, "text/plain", classification, department, owner, content);
        doc = documentRepository.save(doc);

        // Simple chunking (split by double newline or chunk size 500 chars)
        String[] chunks = content.split("\n\n");
        int page = 1;
        for (String chunkText : chunks) {
            chunkText = chunkText.trim();
            if (chunkText.isEmpty()) continue;
            
            if (chunkText.startsWith("===PAGE ")) {
                try {
                    int endIdx = chunkText.indexOf("===", 8);
                    if (endIdx != -1) {
                        page = Integer.parseInt(chunkText.substring(8, endIdx).trim());
                        chunkText = chunkText.substring(endIdx + 3).trim();
                    }
                } catch (Exception e) {
                    // fallback
                }
            }
            if (chunkText.isEmpty()) continue;

            List<Double> emb = llmService.getEmbedding(chunkText);
            String embStr = vectorService.serializeEmbedding(emb);
            DocumentChunk chunk = new DocumentChunk(doc, chunkText, page, embStr);
            chunkRepository.save(chunk);
        }

        doc.setStatus(DocumentStatus.READY);
        return documentRepository.save(doc);
    }

    public List<Document> getAuthorizedDocuments(User user) {
        List<Document> allDocs = documentRepository.findAll();
        List<Document> authDocs = new ArrayList<>();
        for (Document doc : allDocs) {
            if (canAccess(user, doc) || (doc.getOwner() != null && doc.getOwner().getId().equals(user.getId()))) {
                authDocs.add(doc);
            }
        }
        return authDocs;
    }

    public boolean canAccess(User user, Document doc) {
        if (user.getRole() == Role.ADMIN) return true;
        
        boolean isSameDepartment = user.getDepartment().equals(doc.getDepartment()) || "General".equalsIgnoreCase(doc.getDepartment());
        
        if (doc.getClassification() == DocumentClassification.PUBLIC) return true;
        if (doc.getClassification() == DocumentClassification.INTERNAL) return isSameDepartment;
        if (doc.getClassification() == DocumentClassification.CONFIDENTIAL) {
            if (user.getRole() == Role.HR_MANAGER) return true;
            if (user.getRole() == Role.DEPARTMENT_MANAGER && isSameDepartment) return true;
            return false;
        }
        if (doc.getClassification() == DocumentClassification.RESTRICTED) {
            return user.getRole() == Role.HR_MANAGER;
        }
        return false;
    }

    @org.springframework.transaction.annotation.Transactional
    public boolean deleteDocument(Long id, User user) {
        Document doc = documentRepository.findById(id).orElse(null);
        if (doc == null) return false;

        boolean canDelete = user.getRole() == Role.ADMIN ||
                            user.getRole() == Role.HR_MANAGER ||
                            (doc.getOwner() != null && doc.getOwner().getId().equals(user.getId()));
        if (!canDelete) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to delete this document");
        }

        List<DocumentChunk> chunks = chunkRepository.findByDocumentId(id);
        if (chunks != null && !chunks.isEmpty()) {
            chunkRepository.deleteAll(chunks);
        }
        documentRepository.delete(doc);
        return true;
    }
}
