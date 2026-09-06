package com.rohit.car_rental_api_spring_boot_project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rohit.car_rental_api_spring_boot_project.dto.ApiResponse;
import com.rohit.car_rental_api_spring_boot_project.entity.Payment;
import com.rohit.car_rental_api_spring_boot_project.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order/{bookingId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(
            @PathVariable Long bookingId,
            Authentication authentication) {
        String email = authentication.getName();
        Map<String, Object> order = paymentService.createPaymentOrder(bookingId, email);
        return ResponseEntity.ok(ApiResponse.success("Razorpay order created successfully", order));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Payment>> verifyPayment(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String email = authentication.getName();
        Payment payment = paymentService.verifyAndCompletePayment(payload, email);
        return ResponseEntity.ok(ApiResponse.success("Payment verified and booking confirmed successfully!", payment));
    }

    @GetMapping("/my-payments")
    public ResponseEntity<ApiResponse<List<Payment>>> getMyPayments(Authentication authentication) {
        String email = authentication.getName();
        List<Payment> payments = paymentService.getCustomerPayments(email);
        return ResponseEntity.ok(ApiResponse.success("Customer payments retrieved", payments));
    }
}
