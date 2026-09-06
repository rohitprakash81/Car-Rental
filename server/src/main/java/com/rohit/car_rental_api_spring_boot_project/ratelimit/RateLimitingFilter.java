package com.rohit.car_rental_api_spring_boot_project.ratelimit;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Filter that enforces Sliding Window Rate Limiting on critical endpoints.
 * Protects Authentication, Payment, and Booking routes against brute force and DoS attacks.
 */
@Component
@Order(-100) // Execute early in filter chain
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(RateLimitingFilter.class);

    private final SlidingWindowRateLimiter rateLimiter;

    @Value("${ratelimit.auth.limit:5}")
    private int authLimit;

    @Value("${ratelimit.auth.window:60}")
    private int authWindow;

    @Value("${ratelimit.payments.limit:10}")
    private int paymentsLimit;

    @Value("${ratelimit.payments.window:60}")
    private int paymentsWindow;

    @Value("${ratelimit.booking.limit:15}")
    private int bookingLimit;

    @Value("${ratelimit.booking.window:60}")
    private int bookingWindow;

    @Value("${ratelimit.default.limit:100}")
    private int defaultLimit;

    @Value("${ratelimit.default.window:60}")
    private int defaultWindow;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip CORS pre-flight OPTIONS requests and documentation
        String method = request.getMethod();
        String path = request.getRequestURI();

        if ("OPTIONS".equalsIgnoreCase(method) ||
            path.startsWith("/swagger-ui") ||
            path.startsWith("/v3/api-docs") ||
            path.startsWith("/h2-console")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        String category = "GENERAL";
        int limit = defaultLimit;
        int window = defaultWindow;

        if (path.startsWith("/api/v1/auth/login") || path.startsWith("/api/v1/auth/register")) {
            category = "AUTH";
            limit = authLimit;
            window = authWindow;
        } else if (path.startsWith("/api/v1/payments")) {
            category = "PAYMENTS";
            limit = paymentsLimit;
            window = paymentsWindow;
        } else if (path.startsWith("/api/v1/customer/bookCar")) {
            category = "BOOKING";
            limit = bookingLimit;
            window = bookingWindow;
        }

        String rateLimitKey = category + ":" + clientIp;
        SlidingWindowRateLimiter.RateLimitResult result = rateLimiter.tryAcquire(rateLimitKey, limit, window);

        // Populate standard RateLimit response headers
        response.setHeader("X-RateLimit-Limit", String.valueOf(result.getLimit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(result.getRemaining()));

        if (!result.isAllowed()) {
            LOGGER.warn("Rate limit exceeded for {} on path {} from IP {}", category, path, clientIp);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(result.getRetryAfterSeconds()));
            response.setContentType("application/json;charset=UTF-8");

            String errorJson = String.format(
                "{\"success\":false,\"status\":429,\"message\":\"Too many requests. Rate limit exceeded for %s. Please try again in %d seconds.\",\"retryAfterSeconds\":%d}",
                category, result.getRetryAfterSeconds(), result.getRetryAfterSeconds()
            );

            response.getWriter().write(errorJson);
            response.getWriter().flush();
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }
}
