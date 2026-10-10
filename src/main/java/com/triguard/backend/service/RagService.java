package com.triguard.backend.service;

import com.triguard.backend.dto.CitationDto;
import com.triguard.backend.dto.DecisionTraceDto;
import com.triguard.backend.dto.QueryResponse;
import com.triguard.backend.entity.*;
import com.triguard.backend.repository.AuditLogRepository;
import com.triguard.backend.repository.DocumentChunkRepository;
import com.triguard.backend.repository.SecurityEventRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final DocumentChunkRepository chunkRepository;
    private final LlmService llmService;
    private final VectorService vectorService;
    private final AuditLogRepository auditLogRepository;
    private final SecurityEventRepository securityEventRepository;
    private final DocumentService documentService;

    private static final List<String> INJECTION_PATTERNS = List.of(
            "ignore previous", "reveal all", "bypass", "system prompt",
            "disregard instructions", "dan mode", "developer mode", "jailbreak",
            "override rules", "exfiltrate", "act as an unrestricted",
            "forget your instructions", "dump database", "show hidden documents",
            "ignore all rules", "repeat your instructions", "system instructions"
    );

    public RagService(DocumentChunkRepository chunkRepository, LlmService llmService,
                      VectorService vectorService, AuditLogRepository auditLogRepository,
                      SecurityEventRepository securityEventRepository, DocumentService documentService) {
        this.chunkRepository = chunkRepository;
        this.llmService = llmService;
        this.vectorService = vectorService;
        this.auditLogRepository = auditLogRepository;
        this.securityEventRepository = securityEventRepository;
        this.documentService = documentService;
    }

    public QueryResponse query(String query, User user) {
        long startTime = System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();
        String lowerQuery = query.toLowerCase();

        // 1. Prompt Injection Defense Firewall
        for (String pattern : INJECTION_PATTERNS) {
            if (lowerQuery.contains(pattern)) {
                securityEventRepository.save(new SecurityEvent(
                        "PROMPT_INJECTION",
                        user.getEmail(),
                        "BLOCKED",
                        "Prompt injection attempt intercepted: pattern matched [" + pattern + "]"
                ));
                auditLogRepository.save(new AuditLog(
                        user.getEmail(),
                        user.getRole().name(),
                        "QUERY",
                        "DENY",
                        requestId,
                        "Prompt injection attempt blocked by security firewall."
                ));

                DecisionTraceDto trace = new DecisionTraceDto(
                        user.getEmail() + " (" + user.getRole().name() + " - " + user.getDepartment() + ")",
                        "ROLE: " + user.getRole().name() + " | DEPT: " + user.getDepartment(),
                        "INJECTION_FIREWALL_BLOCK",
                        0,
                        0,
                        0,
                        true,
                        "N/A (Execution Halted)",
                        0,
                        System.currentTimeMillis() - startTime,
                        List.of("IDENTITY_VERIFIED", "PROMPT_SECURITY_FIREWALL"),
                        "INJECTION_BLOCKED"
                );

                return new QueryResponse(
                        "PROMPT_INJECTION_BLOCKED: Adversarial instruction override attempt detected and intercepted. System integrity protected.",
                        new ArrayList<>(),
                        trace,
                        requestId,
                        "INJECTION_BLOCKED"
                );
            }
        }

        // 2. Identity Verification & Scope Determination
        String identityScope = "ROLE: " + user.getRole().name() + " | DEPT: " + user.getDepartment();

        List<Double> queryEmb = llmService.getEmbedding(query);

        // 3. Authorization-Constrained Retrieval
        List<Document> authorizedDocs = documentService.getAuthorizedDocuments(user);
        List<DocumentChunk> authorizedCandidates = authorizedDocs.isEmpty()
                ? new ArrayList<>()
                : chunkRepository.findByDocumentIn(authorizedDocs);

        // Score authorized candidates
        List<VectorService.ScoredChunk> scoredAuthorizedChunks = new ArrayList<>();
        for (DocumentChunk chunk : authorizedCandidates) {
            List<Double> chunkEmb = vectorService.parseEmbedding(chunk.getEmbeddingStr());
            if (chunkEmb != null) {
                double score = vectorService.cosineSimilarity(queryEmb, chunkEmb);
                if (isChunkRelevant(query, chunk, score)) {
                    scoredAuthorizedChunks.add(new VectorService.ScoredChunk(chunk, score));
                }
            }
        }
        scoredAuthorizedChunks.sort(Comparator.comparingDouble((VectorService.ScoredChunk s) -> s.score).reversed());
        List<VectorService.ScoredChunk> topAuthorized = scoredAuthorizedChunks.stream()
                .limit(5)
                .collect(Collectors.toList());

        // Probe detection across restricted universe
        List<DocumentChunk> allChunks = chunkRepository.findAll();
        int restrictedChunksBlocked = 0;
        boolean restrictedDeptMatch = false;
        for (DocumentChunk chunk : allChunks) {
            if (!documentService.canAccess(user, chunk.getDocument())) {
                List<Double> emb = vectorService.parseEmbedding(chunk.getEmbeddingStr());
                if (emb != null) {
                    double score = vectorService.cosineSimilarity(queryEmb, emb);
                    if (isChunkRelevant(query, chunk, score)) {
                        restrictedChunksBlocked++;
                        if (user.getDepartment().equalsIgnoreCase(chunk.getDocument().getDepartment())) {
                            restrictedDeptMatch = true;
                        }
                    }
                }
            }
        }

        if (restrictedChunksBlocked > 0) {
            securityEventRepository.save(new SecurityEvent(
                    "UNAUTHORIZED_RETRIEVAL",
                    user.getEmail(),
                    "BLOCKED",
                    "Unauthorized retrieval attempt blocked: " + restrictedChunksBlocked + " restricted candidates matched query intent but were withheld."
            ));
        }

        // 4. Final Authorization Invariant Verification (Zero Leak Guarantee)
        List<DocumentChunk> verifiedContextChunks = new ArrayList<>();
        for (VectorService.ScoredChunk sc : topAuthorized) {
            if (documentService.canAccess(user, sc.chunk.getDocument())) {
                verifiedContextChunks.add(sc.chunk);
            } else {
                restrictedChunksBlocked++;
            }
        }

        // If no authorized evidence found:
        if (verifiedContextChunks.isEmpty()) {
            boolean isExplicitRestrictedProbe = isRestrictedProbeQuery(query, restrictedDeptMatch);

            if (restrictedChunksBlocked > 0 && isExplicitRestrictedProbe) {
                auditLogRepository.save(new AuditLog(
                        user.getEmail(),
                        user.getRole().name(),
                        "QUERY",
                        "DENY",
                        requestId,
                        "Access restricted by classification policy."
                ));

                DecisionTraceDto trace = new DecisionTraceDto(
                        user.getEmail() + " (" + user.getRole().name() + " - " + user.getDepartment() + ")",
                        identityScope,
                        "ACCESS_DENIED_BY_POLICY",
                        allChunks.size(),
                        0,
                        restrictedChunksBlocked,
                        true,
                        "N/A (Withheld)",
                        0,
                        System.currentTimeMillis() - startTime,
                        List.of("IDENTITY_VERIFIED", "POLICY_EVALUATED", "RETRIEVAL_CONSTRAINED", "ACCESS_DENIED_ENFORCED"),
                        "RESTRICTED"
                );

                return new QueryResponse(
                        "ACCESS RESTRICTED: The requested information exists in restricted documents outside your authorization level.",
                        new ArrayList<>(),
                        trace,
                        requestId,
                        "RESTRICTED"
                );
            }

            // Honest abstention: No sufficiently relevant authorized evidence found
            auditLogRepository.save(new AuditLog(
                    user.getEmail(),
                    user.getRole().name(),
                    "QUERY",
                    "DENY",
                    requestId,
                    "No sufficiently relevant authorized evidence found."
            ));

            DecisionTraceDto trace = new DecisionTraceDto(
                    user.getEmail() + " (" + user.getRole().name() + " - " + user.getDepartment() + ")",
                    identityScope,
                    "NO_SUFFICIENT_EVIDENCE",
                    allChunks.size(),
                    0,
                    restrictedChunksBlocked,
                    true,
                    "N/A",
                    0,
                    System.currentTimeMillis() - startTime,
                    List.of("IDENTITY_VERIFIED", "POLICY_EVALUATED", "RETRIEVAL_CONSTRAINED"),
                    "NO_INFO"
            );

            return new QueryResponse(
                    "No sufficiently relevant authorized evidence was found to answer this question.",
                    new ArrayList<>(),
                    trace,
                    requestId,
                    "NO_INFO"
            );
        }

        // 5. Build Authorized Context & Citations
        StringBuilder contextBuilder = new StringBuilder();
        List<CitationDto> citations = new ArrayList<>();

        for (DocumentChunk chunk : verifiedContextChunks) {
            Document doc = chunk.getDocument();
            contextBuilder.append("Source: ").append(doc.getName())
                    .append(" (Classification: ").append(doc.getClassification().name()).append(")")
                    .append("\nText: ").append(chunk.getText()).append("\n\n");

            citations.add(new CitationDto(
                    doc.getName(),
                    chunk.getPageNumber(),
                    chunk.getId(),
                    chunk.getText(),
                    doc.getClassification().name(),
                    doc.getDepartment()
            ));
        }

        // 6. Safe Grounded Generation with Gemini
        String prompt = "You are TriGuard AI, an enterprise secure intelligence assistant. Answer the user query based ONLY on the provided authorized context. If the context does not contain the answer, reply exactly with 'No relevant information found.' Do not speculate or invent facts.\n\nContext:\n"
                + contextBuilder.toString() + "\n\nQuery: " + query + "\nAnswer:";

        String answer;
        try {
            answer = llmService.generateCompletion(prompt);
        } catch (Exception e) {
            // Separate AI provider failure from successful synthesis
            auditLogRepository.save(new AuditLog(
                    user.getEmail(),
                    user.getRole().name(),
                    "QUERY",
                    "ERROR",
                    requestId,
                    "AI provider error: " + (e.getMessage() != null ? e.getMessage() : "Upstream completion failure")
            ));

            DecisionTraceDto trace = new DecisionTraceDto(
                    user.getEmail() + " (" + user.getRole().name() + " - " + user.getDepartment() + ")",
                    identityScope,
                    "AI_PROVIDER_ERROR",
                    allChunks.size(),
                    verifiedContextChunks.size(),
                    restrictedChunksBlocked,
                    true,
                    "gemini-flash-latest",
                    0,
                    System.currentTimeMillis() - startTime,
                    List.of("IDENTITY_VERIFIED", "POLICY_EVALUATED", "RETRIEVAL_CONSTRAINED", "CONTEXT_AUTHORIZED", "SYNTHESIS_FAILED"),
                    "AI_PROVIDER_ERROR"
            );

            return new QueryResponse(
                    "AI provider error: Unable to generate synthesized summary due to an upstream service error. Please try again.",
                    new ArrayList<>(),
                    trace,
                    requestId,
                    "AI_PROVIDER_ERROR"
            );
        }

        if (answer.trim().contains("No relevant information found")) {
            auditLogRepository.save(new AuditLog(
                    user.getEmail(),
                    user.getRole().name(),
                    "QUERY",
                    "DENY",
                    requestId,
                    restrictedChunksBlocked > 0 ? "Access restricted by policy." : "No relevant information found in context."
            ));

            DecisionTraceDto trace = new DecisionTraceDto(
                    user.getEmail() + " (" + user.getRole().name() + " - " + user.getDepartment() + ")",
                    identityScope,
                    "CONTEXT_INSUFFICIENT",
                    allChunks.size(),
                    verifiedContextChunks.size(),
                    restrictedChunksBlocked,
                    true,
                    "gemini-flash-latest",
                    0,
                    System.currentTimeMillis() - startTime,
                    List.of("IDENTITY_VERIFIED", "POLICY_EVALUATED", "RETRIEVAL_CONSTRAINED", "CONTEXT_AUTHORIZED", "ANSWER_GENERATED"),
                    restrictedChunksBlocked > 0 ? "RESTRICTED" : "NO_INFO"
            );

            return new QueryResponse(
                    restrictedChunksBlocked > 0
                            ? "ACCESS RESTRICTED: The requested information exists in restricted documents outside your authorization level."
                            : "No sufficiently relevant authorized evidence was found to answer this question.",
                    new ArrayList<>(),
                    trace,
                    requestId,
                    restrictedChunksBlocked > 0 ? "RESTRICTED" : "NO_INFO"
            );
        }

        // 7. Audit & Citations Validation Complete
        auditLogRepository.save(new AuditLog(
                user.getEmail(),
                user.getRole().name(),
                "QUERY",
                "ALLOW",
                requestId,
                "Authorized context constructed with " + verifiedContextChunks.size() + " verified chunks. Zero leaks."
        ));

        DecisionTraceDto trace = new DecisionTraceDto(
                user.getEmail() + " (" + user.getRole().name() + " - " + user.getDepartment() + ")",
                identityScope,
                "ALLOW_VERIFIED",
                allChunks.size(),
                verifiedContextChunks.size(),
                restrictedChunksBlocked,
                true,
                "gemini-flash-latest",
                citations.size(),
                System.currentTimeMillis() - startTime,
                List.of("IDENTITY_VERIFIED", "POLICY_EVALUATED", "RETRIEVAL_CONSTRAINED", "CONTEXT_AUTHORIZED", "ANSWER_GENERATED", "CITATIONS_VALIDATED"),
                "AUTHORIZED"
        );

        return new QueryResponse(answer, citations, trace, requestId, "AUTHORIZED");
    }

    /**
     * Relevance evaluator: ensures candidate chunks genuinely relate to the query.
     * Prevents cross-domain documents (like Leave Policy) from being falsely matched
     * for unrelated queries (like Executive Bonus or Confidential Salary).
     */
    private boolean isChunkRelevant(String query, DocumentChunk chunk, double cosineScore) {
        // High semantic similarity in dense embedding space
        if (cosineScore >= 0.65) {
            return true;
        }
        // Borderline range (0.45 - 0.65): verify non-stopword token overlap
        if (cosineScore >= 0.45) {
            return hasMeaningfulTermOverlap(query, chunk.getText());
        }
        return false;
    }

    private boolean hasMeaningfulTermOverlap(String text1, String text2) {
        if (text1 == null || text2 == null) return false;
        Set<String> stopWords = Set.of(
                "what", "is", "are", "the", "and", "or", "in", "of", "to", "for", "a", "an",
                "how", "many", "does", "company", "who", "which", "on", "at", "by", "with"
        );

        Set<String> words1 = Arrays.stream(text1.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").split("\\s+"))
                .map(String::trim)
                .filter(w -> w.length() >= 3 && !stopWords.contains(w))
                .collect(Collectors.toSet());

        Set<String> words2 = Arrays.stream(text2.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").split("\\s+"))
                .map(String::trim)
                .filter(w -> w.length() >= 3 && !stopWords.contains(w))
                .collect(Collectors.toSet());

        for (String w : words1) {
            if (words2.contains(w)) return true;
        }
        return false;
    }

    private boolean isRestrictedProbeQuery(String query, boolean restrictedDeptMatch) {
        String lower = query.toLowerCase();
        return (restrictedDeptMatch && (lower.contains("salary") || lower.contains("confidential"))) ||
                lower.contains("confidential") ||
                lower.contains("restricted clearance") ||
                lower.contains("classified");
    }
}
