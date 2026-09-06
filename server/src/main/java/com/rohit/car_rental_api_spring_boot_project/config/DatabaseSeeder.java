package com.rohit.car_rental_api_spring_boot_project.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.rohit.car_rental_api_spring_boot_project.entity.CarOwner;
import com.rohit.car_rental_api_spring_boot_project.entity.Role;
import com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus;
import com.rohit.car_rental_api_spring_boot_project.repository.CarOwnerRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final RoleRepository roleRepository;
    private final CarOwnerRepository carOwnerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Seed essential system roles if not present
        Role superAdminRole = roleRepository.findByName("Role_SuperAdmin").orElseGet(() -> {
            Role r = new Role();
            r.setName("Role_SuperAdmin");
            return roleRepository.save(r);
        });

        Role ownerRole = roleRepository.findByName("Role_CarOwner").orElseGet(() -> {
            Role r = new Role();
            r.setName("Role_CarOwner");
            return roleRepository.save(r);
        });

        Role customerRole = roleRepository.findByName("Role_Customer").orElseGet(() -> {
            Role r = new Role();
            r.setName("Role_Customer");
            return roleRepository.save(r);
        });

        LOGGER.info("System roles verified/seeded: Role_SuperAdmin, Role_CarOwner, Role_Customer");

        // 2. Seed default Super Admin account if not present (required for manual approvals)
        String adminEmail = "superadmin@carrental.com";
        if (!carOwnerRepository.existsByEmail(adminEmail)) {
            CarOwner admin = new CarOwner();
            admin.setName("Platform Super Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("SuperAdmin@2026"));
            admin.setPhoneNumber("9999999999");
            admin.setAddress("Headquarters, Cyber City, Gurugram");
            admin.setLicenseNumber("ADMIN-HQ-001");
            admin.setVerificationStatus(VerificationStatus.APPROVED);
            admin.setVerified(true);
            admin.setBlocked(false);
            admin.setRoles(List.of(superAdminRole));

            carOwnerRepository.save(admin);
            LOGGER.info("Default Super Admin seeded: {} / SuperAdmin@2026", adminEmail);
        } else {
            LOGGER.info("Super Admin already exists: {}", adminEmail);
        }

        LOGGER.info("Manual testing mode ready! Database has 0 Car Owners, 0 Customers, and 0 Cars so you can test everything from scratch.");
    }
}
