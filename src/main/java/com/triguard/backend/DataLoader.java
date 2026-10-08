package com.triguard.backend;

import com.triguard.backend.entity.Role;
import com.triguard.backend.entity.User;
import com.triguard.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                userRepository.save(new User("employee@triguard.com", passwordEncoder.encode("password"), "Ravi Employee", Role.EMPLOYEE, "Finance"));
                userRepository.save(new User("hr@triguard.com", passwordEncoder.encode("password"), "Alice HR", Role.HR_MANAGER, "HR"));
                userRepository.save(new User("manager@triguard.com", passwordEncoder.encode("password"), "Bob Manager", Role.DEPARTMENT_MANAGER, "Finance"));
                userRepository.save(new User("admin@triguard.com", passwordEncoder.encode("password"), "Eve Admin", Role.ADMIN, "IT"));
            }
        };
    }
}
