package com.rohit.car_rental_api_spring_boot_project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rohit.car_rental_api_spring_boot_project.entity.Booking;
import com.rohit.car_rental_api_spring_boot_project.entity.Customer;
import com.rohit.car_rental_api_spring_boot_project.entity.Payment;
import com.rohit.car_rental_api_spring_boot_project.enums.PaymentStatus;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findByBooking(Booking booking);

    List<Payment> findByCustomer(Customer customer);

    List<Payment> findByPaymentStatus(PaymentStatus paymentStatus);
}
