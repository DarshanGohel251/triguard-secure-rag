package com.triguard.backend.dto;

import java.util.List;

public class QueryResponse {
    private String answer;
    private List<CitationDto> citations;

    public QueryResponse(String answer, List<CitationDto> citations) {
        this.answer = answer;
        this.citations = citations;
    }

    public String getAnswer() { return answer; }
    public List<CitationDto> getCitations() { return citations; }
}
