package com.rohit.car_rental_api_spring_boot_project.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import jakarta.annotation.PostConstruct;

@Service
public class RazorpayService {

    private static final Logger LOGGER = LoggerFactory.getLogger(RazorpayService.class);

    @Value("${razorpay.key-id:rzp_test_placeholderKey123}")
    private String keyId;

    @Value("${razorpay.key-secret:placeholderSecret456}")
    private String keySecret;

    private RazorpayClient client;
    private boolean isRealClient = false;

    @PostConstruct
    public void init() {
        try {
            if (!keyId.contains("placeholder") && !keySecret.contains("placeholder")) {
                client = new RazorpayClient(keyId, keySecret);
                isRealClient = true;
                LOGGER.info("Razorpay client initialized in test/live mode.");
            } else {
                LOGGER.info("Razorpay configured with test placeholder credentials. Mock order simulation active for local dev.");
            }
        } catch (Exception e) {
            LOGGER.error("Failed to initialize Razorpay client: {}", e.getMessage());
        }
    }

    public static final double MIN_TRANSACTION_AMOUNT = 1.0;
    public static final double MAX_TRANSACTION_AMOUNT = 500000.0;

    public String getKeyId() {
        return keyId;
    }

    public Map<String, Object> createOrder(Double amountInRupees, String receipt) {
        if (amountInRupees == null || amountInRupees < MIN_TRANSACTION_AMOUNT || amountInRupees > MAX_TRANSACTION_AMOUNT) {
            throw new IllegalArgumentException(String.format(
                "Invalid transaction amount: ₹%.2f. Razorpay transaction amount must be between ₹%.2f and ₹%.2f.",
                amountInRupees, MIN_TRANSACTION_AMOUNT, MAX_TRANSACTION_AMOUNT
            ));
        }

        long amountInPaise = Math.round(amountInRupees * 100);

        if (isRealClient && client != null) {
            try {
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", amountInPaise);
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", receipt);

                Order order = client.orders.create(orderRequest);

                Map<String, Object> response = new HashMap<>();
                response.put("orderId", order.get("id"));
                response.put("amount", order.get("amount"));
                response.put("currency", order.get("currency"));
                response.put("keyId", keyId);
                return response;
            } catch (Exception e) {
                LOGGER.error("Error creating Razorpay order: {}", e.getMessage());
                throw new RuntimeException("Could not create Razorpay order: " + e.getMessage());
            }
        }

        // Test/Mock mode fallback
        String mockOrderId = "order_mock_" + UUID.randomUUID().toString().substring(0, 10);
        LOGGER.info("Generated Mock Razorpay Order: {} for amount ₹{}", mockOrderId, amountInRupees);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", mockOrderId);
        response.put("amount", amountInPaise);
        response.put("currency", "INR");
        response.put("keyId", keyId);
        return response;
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        if (!isRealClient) {
            // In mock/test mode, accept signature if not null or blank
            LOGGER.info("Mock Razorpay signature verified successfully.");
            return signature != null && !signature.isBlank();
        }

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (Exception e) {
            LOGGER.error("Signature verification error: {}", e.getMessage());
            return false;
        }
    }
}
