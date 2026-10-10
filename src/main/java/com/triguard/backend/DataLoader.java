package com.triguard.backend;

import com.triguard.backend.entity.*;
import com.triguard.backend.repository.*;
import com.triguard.backend.service.DocumentService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.UUID;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            DocumentService documentService,
            DocumentRepository documentRepository,
            AuditLogRepository auditLogRepository,
            SecurityEventRepository securityEventRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User employee = userRepository.save(new User("employee@triguard.com", passwordEncoder.encode("password"), "Ravi Employee", Role.EMPLOYEE, "Finance"));
                User hr = userRepository.save(new User("hr@triguard.com", passwordEncoder.encode("password"), "Alice HR", Role.HR_MANAGER, "HR"));
                User manager = userRepository.save(new User("manager@triguard.com", passwordEncoder.encode("password"), "Bob Manager", Role.DEPARTMENT_MANAGER, "Finance"));
                User admin = userRepository.save(new User("admin@triguard.com", passwordEncoder.encode("password"), "Eve Admin", Role.ADMIN, "IT"));

                // Seed synthetic documents for demo
                if (documentRepository.count() == 0) {
                    try {
                        documentService.ingestDocument("Leave_Policy_2026.txt", "The company leave policy allows 20 days of paid time off per year. All employees are eligible.", DocumentClassification.INTERNAL, "General", hr);
                        documentService.ingestDocument("Finance_Salary_Report.txt", "The salary of a Finance employee starts at $70,000. Bob Manager earns $120,000.", DocumentClassification.CONFIDENTIAL, "Finance", manager);
                        documentService.ingestDocument("Executive_Bonus_Structure.txt", "Executive bonuses are capped at 50% of base salary. This is strictly restricted to HR.", DocumentClassification.RESTRICTED, "HR", hr);
                    } catch (Exception e) {
                        System.out.println("Warning: Could not ingest seed documents. Ensure Gemini API key is set if running locally. " + e.getMessage());
                    }
                }
            }

            // Seed realistic historical telemetry over past 7 days if audit log is empty
            if (auditLogRepository.count() == 0) {
                LocalDateTime now = LocalDateTime.now();
                int[][] historyCounts = {
                    {6, 5, 1}, // 6 days ago: 5 allow, 1 deny
                    {5, 7, 2}, // 5 days ago: 7 allow, 2 deny
                    {4, 6, 1}, // 4 days ago: 6 allow, 1 deny
                    {3, 9, 3}, // 3 days ago: 9 allow, 3 deny
                    {2, 8, 2}, // 2 days ago: 8 allow, 2 deny
                    {1, 11, 2} // 1 day ago:  11 allow, 2 deny
                };

                for (int[] day : historyCounts) {
                    int daysAgo = day[0];
                    int allows = day[1];
                    int denys = day[2];
                    LocalDateTime dayTime = now.minusDays(daysAgo);

                    for (int a = 0; a < allows; a++) {
                        AuditLog log = new AuditLog(
                            a % 2 == 0 ? "employee@triguard.com" : "manager@triguard.com",
                            a % 2 == 0 ? "EMPLOYEE" : "DEPARTMENT_MANAGER",
                            "QUERY",
                            "ALLOW",
                            UUID.randomUUID().toString(),
                            "Authorized corporate retrieval: Leave and operations policy inquiry."
                        );
                        log.setTimestamp(dayTime.plusHours(9 + (a * 2) % 9).plusMinutes(a * 7));
                        auditLogRepository.save(log);
                    }

                    for (int d = 0; d < denys; d++) {
                        AuditLog log = new AuditLog(
                            "employee@triguard.com",
                            "EMPLOYEE",
                            "QUERY",
                            "DENY",
                            UUID.randomUUID().toString(),
                            "Access restricted by classification policy: Confidential Finance partition."
                        );
                        log.setTimestamp(dayTime.plusHours(11 + (d * 3)).plusMinutes(d * 13));
                        auditLogRepository.save(log);
                    }
                }
            }

            if (securityEventRepository.count() == 0) {
                LocalDateTime now = LocalDateTime.now();
                SecurityEvent e1 = new SecurityEvent("PROMPT_INJECTION", "contractor@triguard.com", "BLOCKED", "Adversarial system prompt exfiltration attempt intercepted by firewall");
                e1.setTimestamp(now.minusDays(3).minusHours(2));
                securityEventRepository.save(e1);

                SecurityEvent e2 = new SecurityEvent("UNAUTHORIZED_RETRIEVAL", "employee@triguard.com", "BLOCKED", "Unauthorized cross-department probe on confidential salary table blocked");
                e2.setTimestamp(now.minusDays(2).minusHours(4));
                securityEventRepository.save(e2);

                SecurityEvent e3 = new SecurityEvent("PROMPT_INJECTION", "guest@triguard.com", "BLOCKED", "DAN / Developer mode jailbreak token pattern intercepted");
                e3.setTimestamp(now.minusDays(1).minusHours(1));
                securityEventRepository.save(e3);
            }
        };
    }
}
