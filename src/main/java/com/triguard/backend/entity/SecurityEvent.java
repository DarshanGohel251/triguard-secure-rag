package com.triguard.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "security_events")
public class SecurityEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private LocalDateTime timestamp;
    private String username;
    private String status;
    private String details;

    public SecurityEvent() {
        this.timestamp = LocalDateTime.now();
    }

    public SecurityEvent(String type, String username, String status, String details) {
        this();
        this.type = type;
        this.username = username;
        this.status = status;
        this.details = details;
    }

    public Long getId() { return id; }
    public String getType() { return type; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getUsername() { return username; }
    public String getStatus() { return status; }
    public String getDetails() { return details; }
    
    public void setId(Long id) { this.id = id; }
    public void setType(String type) { this.type = type; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public void setUsername(String username) { this.username = username; }
    public void setStatus(String status) { this.status = status; }
    public void setDetails(String details) { this.details = details; }
}
