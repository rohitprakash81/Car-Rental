package com.rohit.car_rental_api_spring_boot_project.dto;

import java.time.LocalDate;
import com.rohit.car_rental_api_spring_boot_project.enums.CarStatus;
import com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus;
import lombok.Data;

@Data
public class CarResponseDTO {

    private Long id;

    private String vehicleNumber;

    private String brand;

    private String model;

    private String fuelType;

    private Integer seatingCapacity;

    private Double pricePerDay;

    private Double pricePerKm;

    private String rcNumber;

    private LocalDate insuranceValidTill;

    private String imageUrl;

    private CarStatus carStatus;

    private VerificationStatus approvalStatus;

    private boolean isApprovedByAdmin;

    private String rejectionReason;
}
