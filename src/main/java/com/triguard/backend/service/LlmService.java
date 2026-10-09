package com.triguard.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
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
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> getDiagnostics() {
        Map<String, Object> diag = new HashMap<>();
        diag.put("provider", "Gemini");
        boolean configured = apiKey != null && !apiKey.isEmpty() && !apiKey.equals("dummy_key");
        diag.put("configured", configured);
        diag.put("model", "gemini-2.5-flash");
        diag.put("keyLoaded", configured);
        return diag;
    }

    public List<Double> getEmbedding(String text) {
        if (apiKey == null || apiKey.equals("dummy_key") || apiKey.isEmpty()) {
            throw new RuntimeException("AI_PROVIDER_NOT_CONFIGURED");
        }
        
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
            response.getBody().get("embedding").get("values").forEach(node -> embedding.add(node.asDouble()));
            return embedding;
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("LLM ERROR HTTP " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
            e.printStackTrace();
            if (e.getStatusCode().value() == 429) {
                throw new RuntimeException("AI_PROVIDER_QUOTA_EXCEEDED");
            } else if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
                throw new RuntimeException("AI_PROVIDER_AUTH_FAILED");
            } else if (e.getStatusCode().value() == 404) {
                throw new RuntimeException("AI_MODEL_UNAVAILABLE");
            }
            throw new RuntimeException("AI_PROVIDER_REQUEST_FAILED");
        } catch (Exception e) {
            System.err.println("LLM ERROR OTHER: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("AI_PROVIDER_REQUEST_FAILED");
        }
    }

    public String generateCompletion(String prompt) {
        if (apiKey == null || apiKey.equals("dummy_key") || apiKey.isEmpty()) {
            throw new RuntimeException("AI_PROVIDER_NOT_CONFIGURED");
        }
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

            return response.getBody().get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("LLM ERROR HTTP " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
            e.printStackTrace();
            if (e.getStatusCode().value() == 429) {
                throw new RuntimeException("AI_PROVIDER_QUOTA_EXCEEDED");
            } else if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
                throw new RuntimeException("AI_PROVIDER_AUTH_FAILED");
            } else if (e.getStatusCode().value() == 404) {
                throw new RuntimeException("AI_MODEL_UNAVAILABLE");
            }
            throw new RuntimeException("AI_PROVIDER_REQUEST_FAILED");
        } catch (Exception e) {
            System.err.println("LLM ERROR OTHER: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("AI_PROVIDER_REQUEST_FAILED");
        }
    }

    private List<Double> createDummyEmbedding(String text) {
        List<Double> emb = new ArrayList<>();
        // Gemini text-embedding-004 uses 768 dimensions usually
        for (int i=0; i<768; i++) emb.add(0.01 * (Math.random()));
        return emb;
    }
}
