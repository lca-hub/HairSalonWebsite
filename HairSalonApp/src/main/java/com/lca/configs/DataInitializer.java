package com.lca.configs;

import com.lca.entity.User;
import com.lca.enums.Role;
import com.lca.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;

    @Bean
    CommandLineRunner createDefaultAdmin(
            PasswordEncoder passwordEncoder) {

        return args -> {

            createAdminIfNotExists(
                    "Salon",
                    "Admin",
                    "admin@hairsalon.local",
                    "0900000000",
                    "admin123",
                    passwordEncoder
            );

            createAdminIfNotExists(
                    "Salon",
                    "Admin",
                    "admin@salon.com",
                    "0900000001",
                    "lycaman@0512",
                    passwordEncoder
            );
        };
    }

    private void createAdminIfNotExists(
            String firstName,
            String lastName,
            String email,
            String phoneNumber,
            String password,
            PasswordEncoder passwordEncoder) {

        if (userRepository.existsByEmail(email)) {
            return;
        }

        User admin = new User();

        admin.setFirstName(firstName);
        admin.setLastName(lastName);

        admin.setEmail(email);

        admin.setPassword(
                passwordEncoder.encode(password)
        );

        admin.setPhoneNumber(phoneNumber);

        admin.setRole(Role.ADMIN);

        admin.setIsActive(true);

        userRepository.save(admin);

        System.out.println(
                "Created ADMIN: " + email
        );
    }
}