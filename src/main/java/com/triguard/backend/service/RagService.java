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
    private final LlmService llmService;
    private final VectorService vectorService;
    private final AuditLogRepository auditLogRepository;
    private final SecurityEventRepository securityEventRepository;

    public RagService(DocumentChunkRepository chunkRepository, LlmService llmService,
                      VectorService vectorService, AuditLogRepository auditLogRepository,
                      SecurityEventRepository securityEventRepository) {
        this.chunkRepository = chunkRepository;
        this.llmService = llmService;
        this.vectorService = vectorService;
        this.auditLogRepository = auditLogRepository;
        this.securityEventRepository = securityEventRepository;
    }

    public QueryResponse query(String query, User user) {
        String requestId = UUID.randomUUID().toString();
        List<Double> queryEmb = llmService.getEmbedding(query);
        if (query.toLowerCase().contains("ignore previous") || query.toLowerCase().contains("reveal all") || query.toLowerCase().contains("bypass")) {
            securityEventRepository.save(new SecurityEvent("PROMPT_INJECTION", user.getEmail(), "BLOCKED", "Prompt injection attempt blocked."));
            return new QueryResponse("PROMPT_INJECTION_BLOCKED: Prompt injection blocked.", new ArrayList<>());
        }

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
            } else {
                accessRestricted = true;
                securityEventRepository.save(new SecurityEvent("UNAUTHORIZED_RETRIEVAL", user.getEmail(), "BLOCKED", "Unauthorized retrieval attempt blocked."));
            }
        }

        if (accessRestricted && authorizedChunks.isEmpty()) {
            auditLogRepository.save(new AuditLog(user.getEmail(), user.getRole().name(), "QUERY", "DENY", requestId, "Access restricted by policy."));
            return new QueryResponse("ACCESS RESTRICTED: No authorized information was found for this request.", new ArrayList<>());
        }
        
        if (authorizedChunks.isEmpty()) {
            auditLogRepository.save(new AuditLog(user.getEmail(), user.getRole().name(), "QUERY", "DENY", requestId, "No relevant information found."));
            return new QueryResponse("No relevant information found.", new ArrayList<>());
        }

        StringBuilder contextBuilder = new StringBuilder();
        List<CitationDto> citations = new ArrayList<>();

        for (DocumentChunk chunk : authorizedChunks) {
            contextBuilder.append("Source: ").append(chunk.getDocument().getName())
                          .append("\nText: ").append(chunk.getText()).append("\n\n");
            citations.add(new CitationDto(chunk.getDocument().getName(), chunk.getPageNumber(), chunk.getId(), chunk.getText()));
        }

        String prompt = "You are TriGuard AI. Answer the user query based ONLY on the provided context. If the context does not contain the answer, reply exactly with 'No relevant information found.'\n\nContext:\n"
                + contextBuilder.toString() + "\n\nQuery: " + query + "\nAnswer:";

        String answer = llmService.generateCompletion(prompt);

        if (answer.trim().contains("No relevant information found")) {
            auditLogRepository.save(new AuditLog(user.getEmail(), user.getRole().name(), "QUERY", "DENY", requestId, accessRestricted ? "Access restricted by policy." : "No relevant information found."));
            return new QueryResponse(accessRestricted ? "ACCESS RESTRICTED: No authorized information was found for this request." : "No relevant information found.", new ArrayList<>());
        }

        auditLogRepository.save(new AuditLog(user.getEmail(), user.getRole().name(), "QUERY", "ALLOW", requestId, "Authorized context built with " + authorizedChunks.size() + " chunks."));
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
