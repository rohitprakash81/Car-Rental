package com.rohit.car_rental_api_spring_boot_project.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rohit.car_rental_api_spring_boot_project.entity.Car;
import com.rohit.car_rental_api_spring_boot_project.entity.CarOwner;
import com.rohit.car_rental_api_spring_boot_project.entity.Customer;
import com.rohit.car_rental_api_spring_boot_project.entity.Payment;
import com.rohit.car_rental_api_spring_boot_project.enums.PaymentStatus;
import com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus;
import com.rohit.car_rental_api_spring_boot_project.mail.CarRentalEmailService;
import com.rohit.car_rental_api_spring_boot_project.repository.BookingRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.CarOwnerRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.CarRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.CustomerRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SuperAdminService.class);

    private final CarOwnerRepository carOwnerRepository;
    private final CarRepository carRepository;
    private final CustomerRepository customerRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final RefreshTokenService refreshTokenService;
    private final CarRentalEmailService emailService;

    public List<CarOwner> getPendingCarOwners() {
        return carOwnerRepository.findByVerificationStatus(VerificationStatus.PENDING);
    }

    public com.rohit.car_rental_api_spring_boot_project.dto.PageResponse<CarOwner> getPendingCarOwners(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
        org.springframework.data.domain.Page<CarOwner> ownerPage = carOwnerRepository.findByVerificationStatus(VerificationStatus.PENDING, pageable);
        return com.rohit.car_rental_api_spring_boot_project.dto.PageResponse.of(ownerPage);
    }

    public List<CarOwner> getAllCarOwners() {
        return carOwnerRepository.findAll();
    }

    @Transactional
    public CarOwner verifyCarOwner(Long ownerId, boolean approve, String reason) {
        CarOwner owner = carOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Car owner not found with id: " + ownerId));

        if (approve) {
            owner.setVerificationStatus(VerificationStatus.APPROVED);
            owner.setVerified(true);
            owner.setRejectionReason(null);
        } else {
            owner.setVerificationStatus(VerificationStatus.REJECTED);
            owner.setVerified(false);
            owner.setRejectionReason(reason);
        }

        CarOwner saved = carOwnerRepository.save(owner);
        emailService.sendOwnerVerificationEmail(saved.getEmail(), saved.getName(), approve, reason);
        LOGGER.info("Car owner id {} verification updated. Approved: {}", ownerId, approve);
        return saved;
    }

    public List<Car> getPendingCars() {
        return carRepository.findByApprovalStatus(VerificationStatus.PENDING);
    }

    public com.rohit.car_rental_api_spring_boot_project.dto.PageResponse<Car> getPendingCars(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
        org.springframework.data.domain.Page<Car> carPage = carRepository.findByApprovalStatus(VerificationStatus.PENDING, pageable);
        return com.rohit.car_rental_api_spring_boot_project.dto.PageResponse.of(carPage);
    }

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    @Transactional
    public Car verifyCar(Long carId, boolean approve, String reason) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found with id: " + carId));

        if (approve) {
            car.setApprovalStatus(VerificationStatus.APPROVED);
            car.setApprovedByAdmin(true);
            car.setRejectionReason(null);
        } else {
            car.setApprovalStatus(VerificationStatus.REJECTED);
            car.setApprovedByAdmin(false);
            car.setRejectionReason(reason);
        }

        Car saved = carRepository.save(car);
        if (saved.getCarOwner() != null) {
            emailService.sendCarApprovalEmail(saved.getCarOwner().getEmail(), saved.getVehicleNumber(), approve, reason);
        }
        LOGGER.info("Car id {} approval updated. Approved: {}", carId, approve);
        return saved;
    }

    @Transactional
    public Map<String, Object> toggleUserBlock(String userType, Long userId, boolean block, String reason) {
        String email = "";
        Map<String, Object> result = new HashMap<>();

        if ("CUSTOMER".equalsIgnoreCase(userType)) {
            Customer customer = customerRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Customer not found with id: " + userId));
            customer.setBlocked(block);
            customerRepository.save(customer);
            email = customer.getEmail();
            result.put("user", customer);
        } else if ("CAR_OWNER".equalsIgnoreCase(userType) || "OWNER".equalsIgnoreCase(userType)) {
            CarOwner owner = carOwnerRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Car owner not found with id: " + userId));
            owner.setBlocked(block);
            carOwnerRepository.save(owner);
            email = owner.getEmail();
            result.put("user", owner);
        } else {
            throw new IllegalArgumentException("Invalid user type: " + userType);
        }

        if (block) {
            // Revoke all refresh tokens for this user
            refreshTokenService.deleteByUserEmail(email);
            emailService.sendUserBlockedEmail(email, reason);
            LOGGER.warn("User {} ({}) blocked by Super Admin.", email, userType);
        } else {
            LOGGER.info("User {} ({}) unblocked by Super Admin.", email, userType);
        }

        result.put("blocked", block);
        result.put("email", email);
        return result;
    }

    public List<Map<String, Object>> getAllUsersForGovernance() {
        List<Map<String, Object>> userList = new ArrayList<>();

        for (Customer c : customerRepository.findAll()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("email", c.getEmail());
            map.put("phoneNumber", c.getPhoneNumber());
            map.put("role", "CUSTOMER");
            map.put("isBlocked", c.isBlocked());
            userList.add(map);
        }

        for (CarOwner o : carOwnerRepository.findAll()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", o.getId());
            map.put("name", o.getName());
            map.put("email", o.getEmail());
            map.put("phoneNumber", o.getPhoneNumber());
            map.put("role", "CAR_OWNER");
            map.put("isBlocked", o.isBlocked());
            map.put("verificationStatus", o.getVerificationStatus());
            map.put("isVerified", o.isVerified());
            map.put("licenseNumber", o.getLicenseNumber());
            userList.add(map);
        }

        return userList;
    }

    public Map<String, Object> getDashboardStats() {
        long totalCustomers = customerRepository.count();
        long totalOwners = carOwnerRepository.count();
        long pendingOwners = carOwnerRepository.findByVerificationStatus(VerificationStatus.PENDING).size();
        long totalCars = carRepository.count();
        long pendingCars = carRepository.findByApprovalStatus(VerificationStatus.PENDING).size();
        long totalBookings = bookingRepository.count();

        List<Payment> successfulPayments = paymentRepository.findByPaymentStatus(PaymentStatus.SUCCESS);
        double totalRevenue = successfulPayments.stream()
                .mapToDouble(Payment::getAmount)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalOwners", totalOwners);
        stats.put("pendingOwners", pendingOwners);
        stats.put("totalCars", totalCars);
        stats.put("pendingCars", pendingCars);
        stats.put("totalBookings", totalBookings);
        stats.put("totalRevenue", totalRevenue);
        return stats;
    }
}
