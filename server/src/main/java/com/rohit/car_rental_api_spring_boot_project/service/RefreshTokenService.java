package com.rohit.car_rental_api_spring_boot_project.service;

import java.time.Instant;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rohit.car_rental_api_spring_boot_project.config.JwtUtils;
import com.rohit.car_rental_api_spring_boot_project.entity.RefreshToken;
import com.rohit.car_rental_api_spring_boot_project.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final Logger LOGGER = LoggerFactory.getLogger(RefreshTokenService.class);

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtils jwtUtils;

    @Value("${jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    @Transactional
    public RefreshToken createRefreshToken(String email, String role) {
        String tokenString = jwtUtils.generateRefreshToken(email);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenString)
                .userEmail(email)
                .role(role)
                .expiryDate(Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false)
                .createdAt(Instant.now())
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token has expired. Please sign in again.");
        }
        return token;
    }

    /**
     * Refresh Token Rotation (RTR) with Reuse Detection
     */
    @Transactional
    public RefreshToken rotateRefreshToken(String rawToken) {
        RefreshToken existingToken = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token."));

        // REUSE DETECTION: If token was already revoked, someone is replaying an old token!
        if (existingToken.isRevoked()) {
            LOGGER.warn("SECURITY ALERT: Compromised token reuse detected for user: {}", existingToken.getUserEmail());
            // Invalidate ALL sessions for this user
            refreshTokenRepository.deleteByUserEmail(existingToken.getUserEmail());
            throw new SecurityException("Security alert: Revoked refresh token reuse detected. All sessions invalidated.");
        }

        verifyExpiration(existingToken);

        // Generate new token string
        String newRawToken = jwtUtils.generateRefreshToken(existingToken.getUserEmail());

        // Revoke the old token and mark replacedBy
        existingToken.setRevoked(true);
        existingToken.setRevokedAt(Instant.now());
        existingToken.setReplacedByToken(newRawToken);
        refreshTokenRepository.save(existingToken);

        // Create and save new token
        RefreshToken newToken = RefreshToken.builder()
                .token(newRawToken)
                .userEmail(existingToken.getUserEmail())
                .role(existingToken.getRole())
                .expiryDate(Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false)
                .createdAt(Instant.now())
                .build();

        return refreshTokenRepository.save(newToken);
    }

    @Transactional
    public void deleteByUserEmail(String userEmail) {
        refreshTokenRepository.deleteByUserEmail(userEmail);
    }
}
