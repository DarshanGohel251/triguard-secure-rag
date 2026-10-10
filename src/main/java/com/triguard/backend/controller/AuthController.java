package com.triguard.backend.controller;

import com.triguard.backend.dto.LoginRequest;
import com.triguard.backend.dto.AuthResponse;
import com.triguard.backend.entity.AuditLog;
import com.triguard.backend.entity.User;
import com.triguard.backend.repository.AuditLogRepository;
import com.triguard.backend.repository.UserRepository;
import com.triguard.backend.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:5174"}, allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}, allowCredentials = "true")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils, 
                          UserRepository userRepository, AuditLogRepository auditLogRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            String jwt = jwtUtils.generateToken(userDetails);

            auditLogRepository.save(new AuditLog(user.getEmail(), user.getRole().name(), "LOGIN", "ALLOW", UUID.randomUUID().toString(), "User logged in successfully"));

            return ResponseEntity.ok(new AuthResponse(jwt, user.getId(), user.getEmail(), user.getName(), user.getRole().name(), user.getDepartment()));
        } catch (Exception e) {
            auditLogRepository.save(new AuditLog(loginRequest.getEmail(), "UNKNOWN", "LOGIN", "DENY", UUID.randomUUID().toString(), "Failed login attempt"));
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
}
