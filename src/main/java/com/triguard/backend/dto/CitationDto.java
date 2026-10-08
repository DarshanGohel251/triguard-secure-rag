package com.triguard.backend.dto;

public class CitationDto {
    private String documentName;
    private int page;
    private Long chunkId;
    private String snippet;

    public CitationDto(String documentName, int page, Long chunkId, String snippet) {
        this.documentName = documentName;
        this.page = page;
        this.chunkId = chunkId;
        this.snippet = snippet;
    }

    public String getDocumentName() { return documentName; }
    public int getPage() { return page; }
    public Long getChunkId() { return chunkId; }
    public String getSnippet() { return snippet; }
}
