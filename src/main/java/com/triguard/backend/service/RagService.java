package com.triguard.backend.service;

import com.triguard.backend.dto.QueryResponse;
import com.triguard.backend.dto.CitationDto;
import com.triguard.backend.entity.*;
import com.triguard.backend.repository.AuditLogRepository;
import com.triguard.backend.repository.DocumentChunkRepository;
import com.triguard.backend.repository.SecurityEventRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final DocumentChunkRepository chunkRepository;
    private final OpenAiService openAiService;
    private final VectorService vectorService;
    private final AuditLogRepository auditLogRepository;
    private final SecurityEventRepository securityEventRepository;

    public RagService(DocumentChunkRepository chunkRepository, OpenAiService openAiService,
                      VectorService vectorService, AuditLogRepository auditLogRepository,
                      SecurityEventRepository securityEventRepository) {
        this.chunkRepository = chunkRepository;
        this.openAiService = openAiService;
        this.vectorService = vectorService;
        this.auditLogRepository = auditLogRepository;
        this.securityEventRepository = securityEventRepository;
    }

    public QueryResponse query(String query, User user) {
        String requestId = UUID.randomUUID().toString();
        List<Double> queryEmb = openAiService.getEmbedding(query);
        List<DocumentChunk> allChunks = chunkRepository.findAll();

        List<VectorService.ScoredChunk> scoredChunks = new ArrayList<>();
        for (DocumentChunk chunk : allChunks) {
            List<Double> chunkEmb = vectorService.parseEmbedding(chunk.getEmbeddingStr());
            if (chunkEmb != null) {
                double score = vectorService.cosineSimilarity(queryEmb, chunkEmb);
                scoredChunks.add(new VectorService.ScoredChunk(chunk, score));
            }
        }

        scoredChunks.sort(Comparator.comparingDouble((VectorService.ScoredChunk s) -> s.score).reversed());
        List<VectorService.ScoredChunk> topChunks = scoredChunks.stream().limit(5).collect(Collectors.toList());

        List<DocumentChunk> authorizedChunks = new ArrayList<>();
        boolean accessRestricted = false;

        for (VectorService.ScoredChunk sc : topChunks) {
            DocumentChunk chunk = sc.chunk;
            if (canAccess(user, chunk.getDocument())) {
                authorizedChunks.add(chunk);
                auditLogRepository.save(new AuditLog(user.getEmail(), user.getRole().name(), "RETRIEVAL", "ALLOW", requestId, "Accessed chunk from doc: " + chunk.getDocument().getName()));
            } else {
                accessRestricted = true;
                auditLogRepository.save(new AuditLog(user.getEmail(), user.getRole().name(), "RETRIEVAL", "DENY", requestId, "Blocked chunk from doc: " + chunk.getDocument().getName()));
                securityEventRepository.save(new SecurityEvent("UNAUTHORIZED_RETRIEVAL", user.getEmail(), "BLOCKED", "Attempted to access restricted document: " + chunk.getDocument().getName()));
            }
        }

        if (accessRestricted && authorizedChunks.isEmpty()) {
            return new QueryResponse("ACCESS RESTRICTED: No authorized information was found for this request.", new ArrayList<>());
        }
        
        if (authorizedChunks.isEmpty()) {
            return new QueryResponse("No relevant information found.", new ArrayList<>());
        }

        StringBuilder contextBuilder = new StringBuilder();
        List<CitationDto> citations = new ArrayList<>();

        for (DocumentChunk chunk : authorizedChunks) {
            contextBuilder.append("Source: ").append(chunk.getDocument().getName())
                          .append("\nText: ").append(chunk.getText()).append("\n\n");
            citations.add(new CitationDto(chunk.getDocument().getName(), chunk.getPageNumber(), chunk.getId(), chunk.getText()));
        }

        String prompt = "You are TriGuard AI. Answer the user query based ONLY on the provided context.\n\nContext:\n"
                + contextBuilder.toString() + "\n\nQuery: " + query + "\nAnswer:";

        String answer = openAiService.generateCompletion(prompt);

        return new QueryResponse(answer, citations);
    }

    private boolean canAccess(User user, Document doc) {
        if (user.getRole() == Role.ADMIN) return true;
        if (doc.getClassification() == DocumentClassification.PUBLIC) return true;
        if (doc.getClassification() == DocumentClassification.INTERNAL) return true; // All authenticated users
        if (doc.getClassification() == DocumentClassification.CONFIDENTIAL) {
            return user.getRole() == Role.DEPARTMENT_MANAGER || user.getRole() == Role.HR_MANAGER;
        }
        if (doc.getClassification() == DocumentClassification.RESTRICTED) {
            return user.getRole() == Role.HR_MANAGER;
        }
        return false;
    }
}
