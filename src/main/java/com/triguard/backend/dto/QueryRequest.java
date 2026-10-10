package com.triguard.backend.dto;

public class QueryRequest {
    private String query;
    private String prompt;
    private String message;
    private String text;
    private String question;
    
    public QueryRequest() {}

    public QueryRequest(String query) {
        this.query = query;
    }

    public String getQuery() {
        if (query != null && !query.trim().isEmpty()) return query;
        if (prompt != null && !prompt.trim().isEmpty()) return prompt;
        if (message != null && !message.trim().isEmpty()) return message;
        if (text != null && !text.trim().isEmpty()) return text;
        if (question != null && !question.trim().isEmpty()) return question;
        return query;
    }

    public void setQuery(String query) { this.query = query; }
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getEffectiveQuery() {
        String effective = getQuery();
        return effective != null ? effective.trim() : "";
    }
}
