package com.rohit.car_rental_api_spring_boot_project.config;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.rohit.car_rental_api_spring_boot_project.repository.CarOwnerRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.CustomerRepository;
import com.rohit.car_rental_api_spring_boot_project.service.TokenBlacklistService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtils jwtUtils;
    private final CookieUtils cookieUtils;
    private final TokenBlacklistService tokenBlacklistService;
    private final CustomerRepository customerRepository;
    private final CarOwnerRepository carOwnerRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = null;

        // 1. Try to read Access Token from HttpOnly cookie
        jwt = cookieUtils.extractTokenFromCookie(request, CookieUtils.ACCESS_TOKEN_COOKIE);

        // 2. Fallback to Authorization Header (Bearer token)
        if (jwt == null || jwt.isBlank()) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
            }
        }

        if (jwt != null && !jwt.isBlank()) {
            // Check if token is in blacklist
            if (tokenBlacklistService.isBlacklisted(jwt)) {
                LOGGER.warn("Blocked request with blacklisted token");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Session has been revoked or expired. Please login again.\"}");
                return;
            }

            if (jwtUtils.validateToken(jwt)) {
                String email = jwtUtils.extractUsername(jwt);
                String role = jwtUtils.extractRole(jwt);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Check if user is blocked by Super Admin
                    boolean isBlocked = false;
                    if ("Role_Customer".equalsIgnoreCase(role) || "CUSTOMER".equalsIgnoreCase(role)) {
                        isBlocked = customerRepository.findByEmail(email)
                                .map(c -> c.isBlocked())
                                .orElse(false);
                    } else if ("Role_CarOwner".equalsIgnoreCase(role) || "CAR_OWNER".equalsIgnoreCase(role)) {
                        isBlocked = carOwnerRepository.findByEmail(email)
                                .map(o -> o.isBlocked())
                                .orElse(false);
                    }

                    if (isBlocked) {
                        LOGGER.warn("Blocked user {} attempted API access", email);
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"success\":false,\"message\":\"Your account has been suspended by the administrator.\"}");
                        return;
                    }

                    // Format role authority (e.g. ROLE_CUSTOMER, ROLE_CAR_OWNER, ROLE_SUPER_ADMIN)
                    String formattedRole = role.toUpperCase();
                    if (!formattedRole.startsWith("ROLE_")) {
                        formattedRole = "ROLE_" + formattedRole;
                    }

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(new SimpleGrantedAuthority(formattedRole))
                    );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
