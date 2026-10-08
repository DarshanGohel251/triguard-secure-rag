package com.triguard.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;
    private String username;
    private String role;
    private String action;
    private String decision;
    private String requestId;
    private String details;

    public AuditLog() {
        this.timestamp = LocalDateTime.now();
    }

    public AuditLog(String username, String role, String action, String decision, String requestId, String details) {
        this();
        this.username = username;
        this.role = role;
        this.action = action;
        this.decision = decision;
        this.requestId = requestId;
        this.details = details;
    }

    // getters and setters
    public Long getId() { return id; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public String getAction() { return action; }
    public String getDecision() { return decision; }
    public String getRequestId() { return requestId; }
    public String getDetails() { return details; }
    
    public void setId(Long id) { this.id = id; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public void setUsername(String username) { this.username = username; }
    public void setRole(String role) { this.role = role; }
    public void setAction(String action) { this.action = action; }
    public void setDecision(String decision) { this.decision = decision; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public void setDetails(String details) { this.details = details; }
}
