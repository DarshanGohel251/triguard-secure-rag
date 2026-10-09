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
            if (chunkText.trim().isEmpty()) continue;
            List<Double> emb = llmService.getEmbedding(chunkText);
            String embStr = vectorService.serializeEmbedding(emb);
            DocumentChunk chunk = new DocumentChunk(doc, chunkText, page++, embStr);
            chunkRepository.save(chunk);
        }

        doc.setStatus(DocumentStatus.READY);
        return documentRepository.save(doc);
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }
}
