package com.rohit.car_rental_api_spring_boot_project.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rohit.car_rental_api_spring_boot_project.dto.ApiResponse;
import com.rohit.car_rental_api_spring_boot_project.dto.CarRequestDTO;
import com.rohit.car_rental_api_spring_boot_project.dto.CarResponseDTO;
import com.rohit.car_rental_api_spring_boot_project.entity.Car;
import com.rohit.car_rental_api_spring_boot_project.entity.CarOwner;
import com.rohit.car_rental_api_spring_boot_project.enums.CarStatus;
import com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus;
import com.rohit.car_rental_api_spring_boot_project.exception.InvalidEmailException;
import com.rohit.car_rental_api_spring_boot_project.mapper.CarMapper;
import com.rohit.car_rental_api_spring_boot_project.repository.CarOwnerRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.CarRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CarService.class);

    private final CarRepository carRepository;
    private final CarMapper carMapper;
    private final CarOwnerRepository ownerRepository;

    private String resolveCarOwnerEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return null;
    }

    @Transactional
    public ResponseEntity<?> registerCarService(CarRequestDTO carRequestDTO) {
        String email = resolveCarOwnerEmail();

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("You are not logged in as a car owner."));
        }

        CarOwner carOwner = ownerRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidEmailException("Car owner email is invalid"));

        if (carOwner.isBlocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Your owner account is suspended."));
        }

        // ENFORCE OWNER VERIFICATION: Owner must be APPROVED by Super Admin before listing cars!
        if (carOwner.getVerificationStatus() != VerificationStatus.APPROVED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Your account is currently " + carOwner.getVerificationStatus()
                            + ". Super Admin verification is required before listing vehicles."));
        }

        // Convert DTO to Entity
        Car car = carMapper.toCar(carRequestDTO);
        car.setCarOwner(carOwner);
        car.setCarStatus(CarStatus.AVAILABLE);
        // Vehicle requires Super Admin approval
        car.setApprovalStatus(VerificationStatus.PENDING);
        car.setApprovedByAdmin(false);

        Car savedCar = carRepository.save(car);
        LOGGER.info("Car {} registered by owner {}. Awaiting admin approval.", savedCar.getVehicleNumber(), email);

        CarResponseDTO carResponseDTO = carMapper.toCarResponseDTO(savedCar);
        return ResponseEntity.status(HttpStatus.CREATED).body(carResponseDTO);
    }

    /**
     * Public Fleet Catalog: Returns paginated APPROVED vehicles for customers
     */
    public ResponseEntity<com.rohit.car_rental_api_spring_boot_project.dto.PageResponse<CarResponseDTO>> getAllCarsService(int page, int size, String sortBy, String sortDir) {
        org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? org.springframework.data.domain.Sort.by(sortBy).ascending() 
                : org.springframework.data.domain.Sort.by(sortBy).descending();
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, sort);
        
        org.springframework.data.domain.Page<Car> carPage = carRepository.findByApprovalStatus(VerificationStatus.APPROVED, pageable);
        List<CarResponseDTO> dtos = carMapper.toCarResponseDTOList(carPage.getContent());
        
        return ResponseEntity.ok(com.rohit.car_rental_api_spring_boot_project.dto.PageResponse.of(carPage, dtos));
    }

    public ResponseEntity<List<CarResponseDTO>> getAllCarsService() {
        List<Car> approvedCars = carRepository.findByApprovalStatus(VerificationStatus.APPROVED);
        return ResponseEntity.ok(carMapper.toCarResponseDTOList(approvedCars));
    }

    /**
     * Owner Fleet Catalog: Returns paginated vehicles owned by this owner (including PENDING)
     */
    public ResponseEntity<?> getOwnerCarsService(int page, int size, String sortBy, String sortDir) {
        String email = resolveCarOwnerEmail();
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("You are not logged in as a car owner."));
        }

        CarOwner owner = ownerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? org.springframework.data.domain.Sort.by(sortBy).ascending() 
                : org.springframework.data.domain.Sort.by(sortBy).descending();
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, sort);

        org.springframework.data.domain.Page<Car> carPage = carRepository.findByCarOwner(owner, pageable);
        List<CarResponseDTO> dtos = carMapper.toCarResponseDTOList(carPage.getContent());

        return ResponseEntity.ok(com.rohit.car_rental_api_spring_boot_project.dto.PageResponse.of(carPage, dtos));
    }

    public ResponseEntity<?> getOwnerCarsService() {
        return getOwnerCarsService(0, 10, "id", "desc");
    }

    public Car getCarByIdService(Long carId) {
        return carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car with id " + carId + " not found"));
    }
}
