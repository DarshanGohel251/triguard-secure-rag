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
public class OpenAiService {

    @Value("${openai.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Double> getEmbedding(String text) {
        if (apiKey.equals("dummy_key") || apiKey.isEmpty()) {
            // For MVP dummy fallback if no key provided
            return createDummyEmbedding(text);
        }
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("input", text);
            body.put("model", "text-embedding-ada-002");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/embeddings", request, JsonNode.class);

            List<Double> embedding = new ArrayList<>();
            response.getBody().get("data").get(0).get("embedding").forEach(node -> embedding.add(node.asDouble()));
            return embedding;
        } catch (Exception e) {
            e.printStackTrace();
            return createDummyEmbedding(text);
        }
    }

    public String generateCompletion(String prompt) {
        if (apiKey.equals("dummy_key") || apiKey.isEmpty()) {
            return "Dummy response for MVP. Please configure OPENAI_API_KEY.";
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-3.5-turbo");
            body.put("messages", List.of(message));
            body.put("temperature", 0.1);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions", request, JsonNode.class);

            return response.getBody().get("choices").get(0).get("message").get("content").asText();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling OpenAI API.";
        }
    }

    private List<Double> createDummyEmbedding(String text) {
        List<Double> emb = new ArrayList<>();
        for (int i=0; i<1536; i++) emb.add(0.01 * (Math.random()));
        return emb;
    }
}
