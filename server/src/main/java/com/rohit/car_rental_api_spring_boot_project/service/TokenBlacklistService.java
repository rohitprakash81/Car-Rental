package com.rohit.car_rental_api_spring_boot_project.service;

import java.time.Instant;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rohit.car_rental_api_spring_boot_project.config.JwtUtils;
import com.rohit.car_rental_api_spring_boot_project.entity.BlacklistedToken;
import com.rohit.car_rental_api_spring_boot_project.repository.BlacklistedTokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TokenBlacklistService.class);

    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final JwtUtils jwtUtils;

    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        return blacklistedTokenRepository.existsByToken(token);
    }

    @Transactional
    public void blacklistToken(String token, String reason) {
        if (token == null || token.isBlank() || isBlacklisted(token)) {
            return;
        }
        try {
            Date expiration = jwtUtils.extractExpiration(token);
            Instant expiryInstant = (expiration != null) ? expiration.toInstant() : Instant.now().plusSeconds(900);

            BlacklistedToken blacklistedToken = BlacklistedToken.builder()
                    .token(token)
                    .expiryDate(expiryInstant)
                    .reason(reason)
                    .blacklistedAt(Instant.now())
                    .build();

            blacklistedTokenRepository.save(blacklistedToken);
            LOGGER.info("Token successfully blacklisted. Reason: {}", reason);
        } catch (Exception e) {
            LOGGER.warn("Could not parse token expiration while blacklisting: {}", e.getMessage());
        }
    }

    @Transactional
    public void cleanupExpiredTokens() {
        blacklistedTokenRepository.deleteByExpiryDateBefore(Instant.now());
    }
}
