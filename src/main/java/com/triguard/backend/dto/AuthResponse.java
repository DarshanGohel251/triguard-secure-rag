package com.triguard.backend.dto;

public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private String name;
    private String role;
    private String department;

    public AuthResponse(String token, Long id, String email, String name, String role, String department) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.department = department;
    }

    public String getToken() { return token; }
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getRole() { return role; }
    public String getDepartment() { return department; }
}
