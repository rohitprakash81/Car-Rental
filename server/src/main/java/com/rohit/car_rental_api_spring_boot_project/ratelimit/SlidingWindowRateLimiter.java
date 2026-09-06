package com.rohit.car_rental_api_spring_boot_project.ratelimit;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Enterprise-grade Sliding Window Log Rate Limiter.
 * Tracks moving request timestamps per client IP / key to eliminate burst boundary exploits.
 */
@Component
public class SlidingWindowRateLimiter {

    private static final Logger LOGGER = LoggerFactory.getLogger(SlidingWindowRateLimiter.class);

    // Key -> Queue of request epoch timestamps in milliseconds
    private final Map<String, Deque<Long>> requestWindows = new ConcurrentHashMap<>();

    public static class RateLimitResult {
        private final boolean allowed;
        private final int remaining;
        private final long retryAfterSeconds;
        private final int limit;

        public RateLimitResult(boolean allowed, int remaining, long retryAfterSeconds, int limit) {
            this.allowed = allowed;
            this.remaining = remaining;
            this.retryAfterSeconds = retryAfterSeconds;
            this.limit = limit;
        }

        public boolean isAllowed() {
            return allowed;
        }

        public int getRemaining() {
            return remaining;
        }

        public long getRetryAfterSeconds() {
            return retryAfterSeconds;
        }

        public int getLimit() {
            return limit;
        }
    }

    /**
     * Checks whether a request with the given key is allowed under the sliding window algorithm.
     *
     * @param key           Identifier (e.g. "AUTH_IP_192.168.1.1")
     * @param maxRequests   Maximum number of allowed requests in the window
     * @param windowSeconds Window length in seconds
     * @return RateLimitResult containing allow status and metadata
     */
    public RateLimitResult tryAcquire(String key, int maxRequests, int windowSeconds) {
        long now = System.currentTimeMillis();
        long windowStart = now - (windowSeconds * 1000L);

        Deque<Long> timestamps = requestWindows.computeIfAbsent(key, k -> new ArrayDeque<>());

        synchronized (timestamps) {
            // 1. Evict timestamps outside the current sliding window
            while (!timestamps.isEmpty() && timestamps.peekFirst() <= windowStart) {
                timestamps.pollFirst();
            }

            int currentCount = timestamps.size();

            if (currentCount < maxRequests) {
                // Request allowed, record timestamp
                timestamps.addLast(now);
                int remaining = maxRequests - (currentCount + 1);
                return new RateLimitResult(true, Math.max(0, remaining), 0, maxRequests);
            } else {
                // Request rejected, calculate retry-after based on oldest timestamp in window
                long oldest = timestamps.peekFirst() != null ? timestamps.peekFirst() : now;
                long retryAfterMillis = (oldest + (windowSeconds * 1000L)) - now;
                long retryAfterSeconds = Math.max(1, (retryAfterMillis + 999) / 1000);
                return new RateLimitResult(false, 0, retryAfterSeconds, maxRequests);
            }
        }
    }

    /**
     * Periodic cleanup to prevent memory bloat from inactive client keys.
     * Runs every 5 minutes.
     */
    @Scheduled(fixedRate = 300000)
    public void purgeExpiredEntries() {
        long now = System.currentTimeMillis();
        long maxRetention = 600000L; // 10 minutes

        requestWindows.entrySet().removeIf(entry -> {
            Deque<Long> queue = entry.getValue();
            synchronized (queue) {
                return queue.isEmpty() || (queue.peekLast() != null && (now - queue.peekLast() > maxRetention));
            }
        });
    }
}
