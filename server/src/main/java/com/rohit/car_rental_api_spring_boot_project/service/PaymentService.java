package com.rohit.car_rental_api_spring_boot_project.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rohit.car_rental_api_spring_boot_project.entity.Booking;
import com.rohit.car_rental_api_spring_boot_project.entity.Car;
import com.rohit.car_rental_api_spring_boot_project.entity.Customer;
import com.rohit.car_rental_api_spring_boot_project.entity.Payment;
import com.rohit.car_rental_api_spring_boot_project.enums.BookingStatus;
import com.rohit.car_rental_api_spring_boot_project.enums.CarStatus;
import com.rohit.car_rental_api_spring_boot_project.enums.PaymentStatus;
import com.rohit.car_rental_api_spring_boot_project.mail.CarRentalEmailService;
import com.rohit.car_rental_api_spring_boot_project.repository.BookingRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.CarRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.CustomerRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final CustomerRepository customerRepository;
    private final RazorpayService razorpayService;
    private final CarRentalEmailService emailService;

    @Transactional
    public Map<String, Object> createPaymentOrder(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findByIdWithLock(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (!booking.getCustomer().getEmail().equalsIgnoreCase(userEmail)) {
            throw new SecurityException("Unauthorized: This booking does not belong to the logged-in customer.");
        }

        if (booking.getStatus() != BookingStatus.ACCEPTED && booking.getStatus() != BookingStatus.AWAITING_PAYMENT) {
            throw new IllegalStateException("Payment can only be initiated for accepted bookings. Current status: " + booking.getStatus());
        }

        Double amount = (booking.getTotalAmount() != null && booking.getTotalAmount() > 0)
                ? booking.getTotalAmount()
                : booking.getCar().getPricePerDay();

        Map<String, Object> orderData = razorpayService.createOrder(amount, "booking_" + bookingId);
        String razorpayOrderId = (String) orderData.get("orderId");

        Payment payment = paymentRepository.findByBooking(booking).orElseGet(() -> {
            Payment p = new Payment();
            p.setBooking(booking);
            p.setCustomer(booking.getCustomer());
            return p;
        });

        payment.setAmount(amount);
        payment.setCurrency("INR");
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setPaymentStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        booking.setStatus(BookingStatus.AWAITING_PAYMENT);
        bookingRepository.save(booking);

        orderData.put("bookingId", bookingId);
        orderData.put("vehicleNumber", booking.getCar().getVehicleNumber());
        return orderData;
    }

    @Transactional
    public Payment verifyAndCompletePayment(Map<String, String> payload, String userEmail) {
        String orderId = payload.get("razorpayOrderId");
        String paymentId = payload.get("razorpayPaymentId");
        String signature = payload.get("razorpaySignature");

        if (orderId == null || paymentId == null) {
            throw new IllegalArgumentException("razorpayOrderId and razorpayPaymentId are required.");
        }

        Payment payment = paymentRepository.findByRazorpayOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment record not found for Order ID: " + orderId));

        Booking booking = payment.getBooking();

        // Verify HMAC SHA256 Signature
        boolean isSignatureValid = razorpayService.verifySignature(orderId, paymentId, signature);
        if (!isSignatureValid) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new SecurityException("Payment verification failed: Invalid Razorpay cryptographic signature.");
        }

        // Update Payment
        payment.setRazorpayPaymentId(paymentId);
        payment.setRazorpaySignature(signature);
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        Payment savedPayment = paymentRepository.save(payment);

        // Update Booking
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // Update Car status to OCCUPIED
        Car car = booking.getCar();
        car.setCarStatus(CarStatus.OCCUPIED);
        carRepository.save(car);

        // Send confirmation and receipt email
        emailService.sendPaymentSuccessEmail(
                booking.getCustomer().getEmail(),
                booking.getCustomer().getName(),
                car.getVehicleNumber(),
                payment.getAmount(),
                paymentId
        );

        LOGGER.info("Payment SUCCESS for booking {}. Car {} is now OCCUPIED.", booking.getId(), car.getVehicleNumber());
        return savedPayment;
    }

    public List<Payment> getCustomerPayments(String userEmail) {
        Customer customer = customerRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + userEmail));
        return paymentRepository.findByCustomer(customer);
    }
}
