package com.rohit.car_rental_api_spring_boot_project.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "blacklisted_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlacklistedToken {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "blacklisted_token_seq")
    @SequenceGenerator(name = "blacklisted_token_seq", sequenceName = "blacklisted_token_seq", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 1024)
    private String token;

    @Column(nullable = false)
    private Instant expiryDate;

    private String reason;

    @Column(nullable = false)
    @Builder.Default
    private Instant blacklistedAt = Instant.now();
}
