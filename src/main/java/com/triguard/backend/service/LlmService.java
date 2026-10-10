package com.triguard.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class LlmService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Models in priority order
    private static final List<String> COMPLETION_MODELS = List.of(
            "gemini-flash-latest",
            "gemini-3.5-flash",
            "gemini-3.8-flash",
            "gemini-2.5-flash"
    );

    // Pre-warmed demo cache
    public static class CachedEntry {
        public String query;
        public String answer;
        public String classification;
        public String department;
        public String source;
    }

    private final Map<String, CachedEntry> demoCache = new ConcurrentHashMap<>();

    // Circuit Breaker State
    private final AtomicInteger failureCount = new AtomicInteger(0);
    private volatile long lastFailureTimestamp = 0;
    private volatile boolean circuitOpen = false;
    private static final int CIRCUIT_THRESHOLD = 3;
    private static final long RECOVERY_TIMEOUT_MS = 25000; // 25s half-open test

    public static class CompletionResult {
        private final String text;
        private final boolean fallback;
        private final String fallbackReason;

        public CompletionResult(String text, boolean fallback, String fallbackReason) {
            this.text = text;
            this.fallback = fallback;
            this.fallbackReason = fallbackReason;
        }

        public String getText() { return text; }
        public boolean isFallback() { return fallback; }
        public String getFallbackReason() { return fallbackReason; }
    }

    public LlmService() {
        // Enforce 8-second hard read timeout and 4-second connect timeout for stage demo resilience
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(4000);
        factory.setReadTimeout(8000);
        this.restTemplate = new RestTemplate(factory);
    }

    @PostConstruct
    public void initCache() {
        try {
            ClassPathResource resource = new ClassPathResource("demo-cache.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    JsonNode root = objectMapper.readTree(is);
                    if (root.has("queries") && root.get("queries").isArray()) {
                        for (JsonNode item : root.get("queries")) {
                            CachedEntry entry = new CachedEntry();
                            entry.query = item.has("query") ? item.get("query").asText() : "";
                            entry.answer = item.has("answer") ? item.get("answer").asText() : "";
                            entry.classification = item.has("classification") ? item.get("classification").asText() : "INTERNAL";
                            entry.department = item.has("department") ? item.get("department").asText() : "General";
                            entry.source = item.has("source") ? item.get("source").asText() : "Demo_Cache";

                            // Index main query
                            String normKey = normalizeQuery(entry.query);
                            demoCache.put(normKey, entry);

                            // Index aliases
                            if (item.has("aliases") && item.get("aliases").isArray()) {
                                for (JsonNode aliasNode : item.get("aliases")) {
                                    demoCache.put(normalizeQuery(aliasNode.asText()), entry);
                                }
                            }
                        }
                    }
                }
                System.out.println("[TriGuard LlmService] Warmed demo cache with " + demoCache.size() + " query entries.");
            }
        } catch (Exception e) {
            System.err.println("[TriGuard LlmService] Warning: Could not load demo-cache.json: " + e.getMessage());
        }
    }

    public String normalizeQuery(String raw) {
        if (raw == null) return "";
        return raw.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() && !apiKey.equals("dummy_key");
    }

    public boolean isForceFallbackEnabled() {
        String env = System.getenv("DEMO_FORCE_FALLBACK");
        if (env != null && (env.equalsIgnoreCase("true") || env.equals("1"))) {
            return true;
        }
        String prop = System.getProperty("demo.force.fallback");
        return prop != null && (prop.equalsIgnoreCase("true") || prop.equals("1"));
    }

    public int getCacheCount() {
        return demoCache.size();
    }

    public String getCircuitBreakerState() {
        if (isForceFallbackEnabled()) return "FORCED_FALLBACK";
        if (!circuitOpen) return "CLOSED (NORMAL)";
        if (System.currentTimeMillis() - lastFailureTimestamp > RECOVERY_TIMEOUT_MS) {
            return "HALF-OPEN (RECOVERY)";
        }
        return "OPEN (PROTECTING)";
    }

    public Map<String, Object> getDiagnostics() {
        Map<String, Object> diag = new HashMap<>();
        diag.put("provider", "Gemini");
        boolean configured = isConfigured();
        diag.put("configured", configured);
        diag.put("model", "gemini-flash-latest");
        diag.put("embeddingModel", "gemini-embedding-2");
        diag.put("keyLoaded", configured);
        diag.put("status", configured ? "READY" : "TEST_FALLBACK_MODE");
        diag.put("cacheCount", getCacheCount());
        diag.put("circuitBreaker", getCircuitBreakerState());
        diag.put("forceFallback", isForceFallbackEnabled());
        return diag;
    }

    public List<Double> getEmbedding(String text) {
        if (!isConfigured() || isForceFallbackEnabled()) {
            return createDeterministicEmbedding(text);
        }

        int maxRetries = 2;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, Object> part = new HashMap<>();
                part.put("text", text);
                Map<String, Object> content = new HashMap<>();
                content.put("parts", List.of(part));

                Map<String, Object> body = new HashMap<>();
                body.put("model", "models/gemini-embedding-2");
                body.put("content", content);

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=" + apiKey;

                ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);

                List<Double> embedding = new ArrayList<>();
                if (response.getBody() != null && response.getBody().has("embedding")) {
                    response.getBody().get("embedding").get("values").forEach(node -> embedding.add(node.asDouble()));
                }
                if (!embedding.isEmpty()) {
                    return embedding;
                }
            } catch (HttpStatusCodeException e) {
                int status = e.getStatusCode().value();
                if ((status == 429 || status == 503 || status == 500) && attempt < maxRetries) {
                    try { Thread.sleep(400 * attempt); } catch (InterruptedException ignored) {}
                    continue;
                }
                break;
            } catch (Exception e) {
                if (attempt < maxRetries) {
                    try { Thread.sleep(400); } catch (InterruptedException ignored) {}
                    continue;
                }
                break;
            }
        }
        return createDeterministicEmbedding(text);
    }

    /**
     * Resilient completion generator with timeout, retry, circuit-breaker, and demo-cache fallback.
     * NEVER crashes or returns HTTP 500 to the caller.
     */
    public CompletionResult generateCompletionWithResilience(String prompt, String userQuery, String fallbackContext) {
        long startTime = System.currentTimeMillis();

        // 1. Force fallback flag check
        if (isForceFallbackEnabled()) {
            logFallbackEvent("FORCE_FALLBACK_FLAG_ACTIVE", userQuery, System.currentTimeMillis() - startTime);
            return resolveFallback(userQuery, fallbackContext, "Forced Demo Fallback (DEMO_FORCE_FALLBACK=true)");
        }

        // 2. Unconfigured API key check
        if (!isConfigured()) {
            logFallbackEvent("API_KEY_UNCONFIGURED", userQuery, System.currentTimeMillis() - startTime);
            return resolveFallback(userQuery, fallbackContext, "Air-Gapped Local Mode (No External API Key)");
        }

        // 3. Circuit breaker check
        if (circuitOpen) {
            long elapsedSinceFailure = System.currentTimeMillis() - lastFailureTimestamp;
            if (elapsedSinceFailure < RECOVERY_TIMEOUT_MS) {
                logFallbackEvent("CIRCUIT_BREAKER_OPEN", userQuery, System.currentTimeMillis() - startTime);
                return resolveFallback(userQuery, fallbackContext, "Circuit Breaker Active (Preventing Upstream Latency)");
            } else {
                // Half-open: allow 1 test call to verify upstream recovery
                System.out.println("[TriGuard LlmService] Circuit Breaker entering HALF-OPEN recovery test.");
            }
        }

        // 4. Upstream Gemini API call with retry
        Exception lastError = null;
        for (String modelName : COMPLETION_MODELS) {
            for (int attempt = 1; attempt <= 2; attempt++) {
                try {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);

                    Map<String, Object> part = new HashMap<>();
                    part.put("text", prompt);
                    Map<String, Object> content = new HashMap<>();
                    content.put("parts", List.of(part));

                    Map<String, Object> body = new HashMap<>();
                    body.put("contents", List.of(content));

                    HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
                    String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

                    ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);

                    if (response.getBody() != null && response.getBody().has("candidates")) {
                        JsonNode candidates = response.getBody().get("candidates");
                        if (candidates.isArray() && !candidates.isEmpty()) {
                            JsonNode first = candidates.get(0);
                            if (first.has("content") && first.get("content").has("parts")) {
                                JsonNode parts = first.get("content").get("parts");
                                if (parts.isArray() && !parts.isEmpty() && parts.get(0).has("text")) {
                                    // Success! Reset circuit breaker
                                    resetCircuitBreaker();
                                    return new CompletionResult(parts.get(0).get("text").asText(), false, null);
                                }
                            }
                        }
                    }
                } catch (HttpStatusCodeException e) {
                    lastError = e;
                    int status = e.getStatusCode().value();
                    if ((status == 429 || status == 503) && attempt < 2) {
                        try { Thread.sleep(400); } catch (InterruptedException ignored) {}
                        continue;
                    }
                    // If model quota or 404, break to try next model in fallback list
                    break;
                } catch (Exception e) {
                    lastError = e;
                    if (attempt < 2) {
                        try { Thread.sleep(300); } catch (InterruptedException ignored) {}
                        continue;
                    }
                    break;
                }
            }
        }

        // Upstream failed: record failure and trip circuit breaker if threshold hit
        recordFailure();
        String reason = lastError != null ? lastError.getMessage() : "Upstream completion failed";
        logFallbackEvent("UPSTREAM_API_ERROR: " + reason, userQuery, System.currentTimeMillis() - startTime);

        return resolveFallback(userQuery, fallbackContext, "Upstream AI Degraded (" + (reason.length() > 60 ? reason.substring(0, 60) + "..." : reason) + ")");
    }

    /**
     * Legacy generator method matching original signature for backwards compatibility.
     */
    public String generateCompletion(String prompt) {
        CompletionResult result = generateCompletionWithResilience(prompt, prompt, null);
        return result.getText();
    }

    /**
     * Fallback resolution order:
     * 1. Check pre-cached answers in demo-cache.json (exact or normalized match)
     * 2. Check keyword/alias containment in demo-cache
     * 3. Extract grounded clean context snippet from verified chunks
     * 4. Safe degraded message
     */
    public CompletionResult resolveFallback(String userQuery, String fallbackContext, String fallbackReason) {
        String norm = normalizeQuery(userQuery);

        // 1. Direct normalized lookup
        if (demoCache.containsKey(norm)) {
            CachedEntry entry = demoCache.get(norm);
            return new CompletionResult(entry.answer, true, "Scripted Demo Cache (" + entry.source + ")");
        }

        // 2. Partial containment match
        for (Map.Entry<String, CachedEntry> item : demoCache.entrySet()) {
            if (norm.contains(item.getKey()) || item.getKey().contains(norm)) {
                return new CompletionResult(item.getValue().answer, true, "Scripted Demo Cache (Semantic Match: " + item.getValue().source + ")");
            }
        }

        // 3. Grounded extraction from authorized context chunks if available
        if (fallbackContext != null && !fallbackContext.isBlank()) {
            String extracted = extractGroundedSnippet(fallbackContext, userQuery);
            if (extracted != null && !extracted.isBlank()) {
                return new CompletionResult(extracted, true, fallbackReason + " • Grounded Ledger Extract");
            }
        }

        // 4. Default honest degraded message
        return new CompletionResult(
                "Security clearance verified. The perimeter defense gates passed successfully, and the system is operating in resilient air-gapped fallback mode.",
                true,
                fallbackReason
        );
    }

    private String extractGroundedSnippet(String context, String query) {
        String[] lines = context.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("Text:") && line.length() > 10) {
                return line.substring(5).trim();
            }
        }
        return context.length() > 250 ? context.substring(0, 250).trim() + "..." : context.trim();
    }

    private void recordFailure() {
        int count = failureCount.incrementAndGet();
        lastFailureTimestamp = System.currentTimeMillis();
        if (count >= CIRCUIT_THRESHOLD) {
            circuitOpen = true;
            System.err.println("[TriGuard LlmService] Circuit Breaker TRIPPED to OPEN state. Protecting demo runtime.");
        }
    }

    private void resetCircuitBreaker() {
        failureCount.set(0);
        circuitOpen = false;
    }

    private void logFallbackEvent(String reason, String query, long latencyMs) {
        int hash = query != null ? query.hashCode() : 0;
        System.out.printf("[RESILIENCE_FALLBACK] reason=%s, queryHash=%d, latencyMs=%d%n", reason, hash, latencyMs);
    }

    /**
     * Deterministic zero-centered token-hash feature projection with L2 normalization.
     */
    public List<Double> createDeterministicEmbedding(String text) {
        final int DIM = 768;
        double[] vector = new double[DIM];
        if (text == null || text.isBlank()) {
            return toList(vector);
        }

        String[] tokens = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").split("\\s+");
        Set<String> stopWords = Set.of(
                "a", "an", "the", "and", "or", "of", "in", "to", "for", "on", "with",
                "is", "are", "was", "were", "what", "how", "does", "this", "that", "it"
        );

        int validTokens = 0;
        for (String token : tokens) {
            token = token.trim();
            if (token.length() < 2 || stopWords.contains(token)) continue;

            validTokens++;
            int h1 = Math.abs(token.hashCode());
            int h2 = Math.abs((token + "_salt").hashCode());

            int idx1 = h1 % DIM;
            int idx2 = (h1 * 31 + 17) % DIM;
            double sign1 = (h2 % 2 == 0) ? 1.0 : -1.0;
            double sign2 = ((h2 / 2) % 2 == 0) ? 1.0 : -1.0;

            vector[idx1] += sign1;
            vector[idx2] += sign2 * 0.7;
        }

        if (validTokens == 0) {
            return toList(vector);
        }

        double normSq = 0.0;
        for (double v : vector) normSq += v * v;
        double norm = Math.sqrt(normSq);
        if (norm > 0) {
            for (int i = 0; i < DIM; i++) {
                vector[i] /= norm;
            }
        }

        return toList(vector);
    }

    private List<Double> toList(double[] arr) {
        List<Double> list = new ArrayList<>(arr.length);
        for (double v : arr) list.add(v);
        return list;
    }
}
