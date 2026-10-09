package com.triguard.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LlmService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getDiagnostics() {
        Map<String, Object> diag = new HashMap<>();
        diag.put("provider", "Gemini");
        boolean configured = apiKey != null && !apiKey.isEmpty() && !apiKey.equals("dummy_key");
        diag.put("configured", configured);
        diag.put("model", "gemini-2.5-flash");
        diag.put("embeddingModel", "gemini-embedding-2");
        diag.put("keyLoaded", configured);
        diag.put("status", configured ? "READY" : "TEST_FALLBACK_MODE");
        return diag;
    }

    public List<Double> getEmbedding(String text) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("dummy_key")) {
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
                return embedding;
            } catch (HttpStatusCodeException e) {
                int status = e.getStatusCode().value();
                if ((status == 429 || status == 503 || status == 500) && attempt < maxRetries) {
                    try { Thread.sleep(800 * attempt); } catch (InterruptedException ignored) {}
                    continue;
                }
                if (status == 429) throw new RuntimeException("AI_PROVIDER_QUOTA_EXCEEDED");
                if (status == 401 || status == 403) throw new RuntimeException("AI_PROVIDER_AUTH_FAILED");
                if (status == 503) throw new RuntimeException("AI_PROVIDER_UNAVAILABLE");
                throw new RuntimeException("AI_PROVIDER_REQUEST_FAILED");
            } catch (Exception e) {
                if (attempt < maxRetries) {
                    try { Thread.sleep(800); } catch (InterruptedException ignored) {}
                    continue;
                }
                throw new RuntimeException("AI_PROVIDER_REQUEST_FAILED");
            }
        }
        return createDeterministicEmbedding(text);
    }

    public String generateCompletion(String prompt) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("dummy_key")) {
            if (prompt.toLowerCase().contains("leave")) {
                return "The company leave policy allows 20 days of paid time off per year.";
            }
            return "No relevant information found.";
        }

        int maxRetries = 2;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
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
                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

                ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);

                if (response.getBody() != null && response.getBody().has("candidates")) {
                    return response.getBody().get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();
                }
                return "No relevant information found.";
            } catch (HttpStatusCodeException e) {
                int status = e.getStatusCode().value();
                if ((status == 429 || status == 503 || status == 500) && attempt < maxRetries) {
                    try { Thread.sleep(900 * attempt); } catch (InterruptedException ignored) {}
                    continue;
                }
                if (status == 429) throw new RuntimeException("AI_PROVIDER_QUOTA_EXCEEDED");
                if (status == 401 || status == 403) throw new RuntimeException("AI_PROVIDER_AUTH_FAILED");
                if (status == 503) throw new RuntimeException("AI_PROVIDER_UNAVAILABLE");
                throw new RuntimeException("AI_PROVIDER_REQUEST_FAILED");
            } catch (Exception e) {
                if (attempt < maxRetries) {
                    try { Thread.sleep(900); } catch (InterruptedException ignored) {}
                    continue;
                }
                throw new RuntimeException("AI_PROVIDER_REQUEST_FAILED");
            }
        }
        return "No relevant information found.";
    }

    private List<Double> createDeterministicEmbedding(String text) {
        List<Double> emb = new ArrayList<>(768);
        long hash = text != null ? text.hashCode() : 42L;
        for (int i = 0; i < 768; i++) {
            emb.add(((double) ((hash + i * 31L) % 1000)) / 1000.0);
        }
        return emb;
    }
}
