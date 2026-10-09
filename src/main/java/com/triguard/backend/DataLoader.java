package com.triguard.backend;

import com.triguard.backend.entity.Role;
import com.triguard.backend.entity.User;
import com.triguard.backend.repository.UserRepository;
import com.triguard.backend.repository.DocumentRepository;
import com.triguard.backend.entity.DocumentClassification;
import com.triguard.backend.service.DocumentService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder, DocumentService documentService, DocumentRepository documentRepository) {
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
        };
    }
}
