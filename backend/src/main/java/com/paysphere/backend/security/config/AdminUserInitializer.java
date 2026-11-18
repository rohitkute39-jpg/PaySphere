
package com.paysphere.backend.security.config;

import com.paysphere.backend.security.entity.AppUser;
import com.paysphere.backend.security.entity.UserRole;
import com.paysphere.backend.security.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_USERNAME:}")
    private String adminUsername;

    @Value("${ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Value("${ADMIN_RESET_PASSWORD:false}")
    private boolean resetAdminPassword;

    public AdminUserInitializer(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (adminUsername.isBlank()
                || adminEmail.isBlank()
                || adminPassword.isBlank()) {
            System.out.println("Admin account configuration missing.");
            return;
        }

        if (adminPassword.length() < 12) {
            throw new IllegalStateException(
                    "ADMIN_PASSWORD must contain at least 12 characters."
            );
        }

        var existingAdmin = appUserRepository.findByUsername(adminUsername);

        if (existingAdmin.isPresent()) {

            if (resetAdminPassword) {
                AppUser admin = existingAdmin.get();

                if (!admin.getEmail().equalsIgnoreCase(adminEmail)) {
                    throw new IllegalStateException(
                            "Admin email does not match the existing account."
                    );
                }

                admin.setPasswordHash(
                        passwordEncoder.encode(adminPassword)
                );

                appUserRepository.save(admin);

                System.out.println("Admin password reset successfully.");
            } else {
                System.out.println("Admin account already exists.");
            }

            return;
        }

        if (appUserRepository.existsByEmail(adminEmail)) {
            System.out.println("Admin email already belongs to another account.");
            return;
        }

        AppUser admin = new AppUser();
        admin.setUsername(adminUsername);
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(UserRole.ADMIN);
        admin.setActive(true);

        appUserRepository.save(admin);

        System.out.println("Initial Admin account created successfully.");
    }
}
