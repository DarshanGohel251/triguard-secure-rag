package com.triguard.backend.dto;

import java.util.List;

public class QueryResponse {
    private String answer;
    private List<CitationDto> citations;
    private DecisionTraceDto decisionTrace;
    private String requestId;
    private String status;
    private String mode = "live"; // "live" or "fallback"
    private String fallbackReason;
    private boolean cached = false;

    public QueryResponse() {}

    public QueryResponse(String answer, List<CitationDto> citations) {
        this.answer = answer;
        this.citations = citations;
    }

    public QueryResponse(String answer, List<CitationDto> citations, DecisionTraceDto decisionTrace, String requestId, String status) {
        this.answer = answer;
        this.citations = citations;
        this.decisionTrace = decisionTrace;
        this.requestId = requestId;
        this.status = status;
        this.mode = "live";
        this.cached = false;
    }

    public QueryResponse(String answer, List<CitationDto> citations, DecisionTraceDto decisionTrace, String requestId, String status, String mode, String fallbackReason, boolean cached) {
        this.answer = answer;
        this.citations = citations;
        this.decisionTrace = decisionTrace;
        this.requestId = requestId;
        this.status = status;
        this.mode = mode != null ? mode : "live";
        this.fallbackReason = fallbackReason;
        this.cached = cached;
    }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public List<CitationDto> getCitations() { return citations; }
    public void setCitations(List<CitationDto> citations) { this.citations = citations; }

    public DecisionTraceDto getDecisionTrace() { return decisionTrace; }
    public void setDecisionTrace(DecisionTraceDto decisionTrace) { this.decisionTrace = decisionTrace; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getFallbackReason() { return fallbackReason; }
    public void setFallbackReason(String fallbackReason) { this.fallbackReason = fallbackReason; }

    public boolean isCached() { return cached; }
    public void setCached(boolean cached) { this.cached = cached; }
}
