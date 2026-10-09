package com.triguard.backend.dto;

import java.util.List;

public class QueryResponse {
    private String answer;
    private List<CitationDto> citations;
    private DecisionTraceDto decisionTrace;
    private String requestId;
    private String status;

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
    }

    public String getAnswer() { return answer; }
    public List<CitationDto> getCitations() { return citations; }
    public DecisionTraceDto getDecisionTrace() { return decisionTrace; }
    public String getRequestId() { return requestId; }
    public String getStatus() { return status; }
}
