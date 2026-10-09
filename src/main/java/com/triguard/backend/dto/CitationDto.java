package com.triguard.backend.dto;

public class CitationDto {
    private String documentName;
    private int page;
    private Long chunkId;
    private String snippet;
    private String classification;
    private String department;

    public CitationDto() {}

    public CitationDto(String documentName, int page, Long chunkId, String snippet) {
        this(documentName, page, chunkId, snippet, "INTERNAL", "General");
    }

    public CitationDto(String documentName, int page, Long chunkId, String snippet, String classification, String department) {
        this.documentName = documentName;
        this.page = page;
        this.chunkId = chunkId;
        this.snippet = snippet;
        this.classification = classification;
        this.department = department;
    }

    public String getDocumentName() { return documentName; }
    public int getPage() { return page; }
    public Long getChunkId() { return chunkId; }
    public String getSnippet() { return snippet; }
    public String getClassification() { return classification; }
    public String getDepartment() { return department; }
}
