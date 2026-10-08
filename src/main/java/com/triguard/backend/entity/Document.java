package com.triguard.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type;
    
    @Enumerated(EnumType.STRING)
    private DocumentClassification classification;
    
    private String department;
    
    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @Enumerated(EnumType.STRING)
    private DocumentStatus status;
    
    private LocalDateTime uploadedAt;

    // content in text format for MVP
    @Column(columnDefinition = "TEXT")
    private String content;

    public Document() {
        this.uploadedAt = LocalDateTime.now();
        this.status = DocumentStatus.UPLOADED;
    }

    public Document(String name, String type, DocumentClassification classification, String department, User owner, String content) {
        this();
        this.name = name;
        this.type = type;
        this.classification = classification;
        this.department = department;
        this.owner = owner;
        this.content = content;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getType() { return type; }
    public DocumentClassification getClassification() { return classification; }
    public String getDepartment() { return department; }
    public User getOwner() { return owner; }
    public DocumentStatus getStatus() { return status; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public String getContent() { return content; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setType(String type) { this.type = type; }
    public void setClassification(DocumentClassification classification) { this.classification = classification; }
    public void setDepartment(String department) { this.department = department; }
    public void setOwner(User owner) { this.owner = owner; }
    public void setStatus(DocumentStatus status) { this.status = status; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public void setContent(String content) { this.content = content; }
}
