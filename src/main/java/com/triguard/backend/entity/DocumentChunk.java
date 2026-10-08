package com.triguard.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "document_chunks")
public class DocumentChunk {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "document_id")
    private Document document;

    @Column(columnDefinition = "TEXT")
    private String text;

    private int pageNumber;

    // We will store the embedding as a JSON string or comma separated string
    @Column(columnDefinition = "TEXT")
    private String embeddingStr;

    public DocumentChunk() {}

    public DocumentChunk(Document document, String text, int pageNumber, String embeddingStr) {
        this.document = document;
        this.text = text;
        this.pageNumber = pageNumber;
        this.embeddingStr = embeddingStr;
    }

    public Long getId() { return id; }
    public Document getDocument() { return document; }
    public String getText() { return text; }
    public int getPageNumber() { return pageNumber; }
    public String getEmbeddingStr() { return embeddingStr; }

    public void setId(Long id) { this.id = id; }
    public void setDocument(Document document) { this.document = document; }
    public void setText(String text) { this.text = text; }
    public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }
    public void setEmbeddingStr(String embeddingStr) { this.embeddingStr = embeddingStr; }
}
