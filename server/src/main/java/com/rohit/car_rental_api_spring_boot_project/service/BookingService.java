package com.rohit.car_rental_api_spring_boot_project.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.rohit.car_rental_api_spring_boot_project.dto.ApiResponse;
import com.rohit.car_rental_api_spring_boot_project.dto.BookingRequestDTO;
import com.rohit.car_rental_api_spring_boot_project.dto.BookingResponseDTO;
import com.rohit.car_rental_api_spring_boot_project.entity.Booking;
import com.rohit.car_rental_api_spring_boot_project.entity.Car;
import com.rohit.car_rental_api_spring_boot_project.entity.CarOwner;
import com.rohit.car_rental_api_spring_boot_project.entity.Customer;
import com.rohit.car_rental_api_spring_boot_project.enums.BookingStatus;
import com.rohit.car_rental_api_spring_boot_project.enums.CarStatus;
import com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus;
import com.rohit.car_rental_api_spring_boot_project.mail.CarRentalEmailService;
import com.rohit.car_rental_api_spring_boot_project.mapper.BookingMapper;
import com.rohit.car_rental_api_spring_boot_project.repository.BookingRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.CarOwnerRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.CarRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final Logger LOGGER = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final CarOwnerRepository carOwnerRepository;
    private final CarRepository carRepository;
    private final BookingMapper bookingMapper;
    private final CarRentalEmailService carRentalEmailService;

    private String resolveCustomerEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return null;
    }

    private String resolveCarOwnerEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return null;
    }

    /**
     * ACID Concurrency Protection: Uses Pessimistic Write Lock on Car
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ResponseEntity<?> bookCarService(Long carId, BookingRequestDTO bookingRequestDTO) {
        String email = resolveCustomerEmail();

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("You are not logged in. Please sign in to book a vehicle."));
        }

        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + email));

        if (customer.isBlocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Your customer account is currently suspended."));
        }

        // Lock the car row to prevent race conditions
        Car car = carRepository.findByIdWithLock(carId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + carId));

        if (car.getApprovalStatus() != VerificationStatus.APPROVED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("This vehicle has not been approved by the Super Admin yet."));
        }

        if (car.getCarStatus() == CarStatus.OCCUPIED) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("This vehicle is currently occupied and unavailable for booking."));
        }

        // Check for active overlapping bookings on this journey date
        List<Booking> overlapping = bookingRepository.findActiveOverlappingBookings(car.getId(), bookingRequestDTO.getJourneyDate());
        if (!overlapping.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Vehicle already has a confirmed booking for " + bookingRequestDTO.getJourneyDate() + ". Please choose another date."));
        }

        // Create booking with total price
        Booking booking = new Booking();
        booking.setJourneyDate(bookingRequestDTO.getJourneyDate());
        booking.setSource(bookingRequestDTO.getSource());
        booking.setDestination(bookingRequestDTO.getDestination());
        booking.setCar(car);
        booking.setCustomer(customer);
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(car.getPricePerDay());

        Booking savedBooking = bookingRepository.save(booking);

        // Async email notification to Car Owner
        if (car.getCarOwner() != null) {
            String route = bookingRequestDTO.getSource() + " → " + bookingRequestDTO.getDestination();
            carRentalEmailService.sendBookingRequestEmail(
                    car.getCarOwner().getEmail(),
                    customer.getName(),
                    car.getVehicleNumber(),
                    bookingRequestDTO.getJourneyDate().toString(),
                    route
            );
        }

        LOGGER.info("Booking request created: ID {} for car {} by customer {}", savedBooking.getId(), car.getVehicleNumber(), customer.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new BookingResponseDTO("Booking request submitted successfully. Waiting for car owner approval.", savedBooking));
    }

    public ResponseEntity<BookingResponseDTO> getBookingByIdService(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        return ResponseEntity.ok(new BookingResponseDTO("Booking fetched successfully", booking));
    }

    public ResponseEntity<?> getPendingBookingForCarOwner() {
        String email = resolveCarOwnerEmail();

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("You are not logged in as a car owner."));
        }

        CarOwner carOwner = carOwnerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Car owner not found with email: " + email));

        List<BookingResponseDTO> pendingBookings = new ArrayList<>();
        if (carOwner.getCars() != null) {
            carOwner.getCars().forEach(car -> {
                bookingRepository.findByCarAndStatus(car, BookingStatus.PENDING).ifPresent(booking -> {
                    pendingBookings.add(bookingMapper.toBookingResponseDTO(booking));
                });
            });
        }

        return ResponseEntity.ok(pendingBookings);
    }

    /**
     * ACID Concurrency Protection: Lock Booking & Auto-Reject Competing Requests
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ResponseEntity<?> confirmedOrRejectBookingStatus(Long bookingId, BookingStatus newStatus) {
        String email = resolveCarOwnerEmail();

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("You are not logged in as a car owner."));
        }

        // Pessimistic lock on booking
        Booking booking = bookingRepository.findByIdWithLock(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (!booking.getCar().getCarOwner().getEmail().equalsIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You are not authorized to update this booking."));
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("This booking has already been processed with status: " + booking.getStatus()));
        }

        Car car = carRepository.findByIdWithLock(booking.getCar().getId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        Customer customer = booking.getCustomer();

        if (newStatus == BookingStatus.ACCEPTED) {
            booking.setStatus(BookingStatus.ACCEPTED);
            // 30-minute payment deadline
            booking.setPaymentDeadline(LocalDateTime.now().plusMinutes(30));
            car.setCarStatus(CarStatus.PENDING); // Reserved pending payment

            // Auto-reject competing pending requests for the same car on the same journey date
            List<Booking> competingBookings = bookingRepository.findByCarAndJourneyDateAndStatus(
                    car, booking.getJourneyDate(), BookingStatus.PENDING
            );

            for (Booking competing : competingBookings) {
                if (!competing.getId().equals(booking.getId())) {
                    competing.setStatus(BookingStatus.REJECTED);
                    bookingRepository.save(competing);
                    carRentalEmailService.sendBookingDecisionEmail(
                            competing.getCustomer().getEmail(),
                            competing.getCustomer().getName(),
                            car.getVehicleNumber(),
                            false
                    );
                    LOGGER.info("Auto-rejected competing booking id {} for car {}", competing.getId(), car.getVehicleNumber());
                }
            }

            // Send acceptance email (prompting customer to pay)
            carRentalEmailService.sendBookingDecisionEmail(
                    customer.getEmail(), customer.getName(), car.getVehicleNumber(), true
            );
        } else {
            booking.setStatus(BookingStatus.REJECTED);
            car.setCarStatus(CarStatus.AVAILABLE);

            // Send decline notification email
            carRentalEmailService.sendBookingDecisionEmail(
                    customer.getEmail(), customer.getName(), car.getVehicleNumber(), false
            );
        }

        Booking updatedBooking = bookingRepository.save(booking);
        carRepository.save(car);

        LOGGER.info("Booking {} status updated to {} by owner {}", bookingId, newStatus, email);
        return ResponseEntity.ok(new BookingResponseDTO("Booking " + newStatus.toString().toLowerCase() + " successfully", updatedBooking));
    }

    public ResponseEntity<?> getConfirmedBookingStatusForCustomer(int page, int size) {
        String email = resolveCustomerEmail();

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("You are not logged in."));
        }

        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + email));

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by("id").descending()
        );

        org.springframework.data.domain.Page<Booking> bookingPage = bookingRepository.findByCustomer(customer, pageable);
        List<BookingResponseDTO> responseDTOs = bookingPage.getContent().stream()
                .map(bookingMapper::toBookingResponseDTO)
                .toList();

        return ResponseEntity.ok(com.rohit.car_rental_api_spring_boot_project.dto.PageResponse.of(bookingPage, responseDTOs));
    }

    public ResponseEntity<?> getConfirmedBookingStatusForCustomer() {
        return getConfirmedBookingStatusForCustomer(0, 10);
    }
}
