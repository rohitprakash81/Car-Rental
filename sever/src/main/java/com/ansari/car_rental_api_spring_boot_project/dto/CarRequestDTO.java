package com.ansari.car_rental_api_spring_boot_project.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CarRequestDTO {

	@NotBlank(message = "Vehicle number is required")
	private String vehicleNumber;

	@NotBlank(message = "Brand is required")
	private String brand;

	@NotBlank(message = "Model is required")
	private String model;

	@NotBlank(message = "Fuel type is required")
	private String fuelType;

	@NotNull(message = "Seating capacity is required")
	@Min(value = 1, message = "Seating capacity must be at least 1")
	private Integer seatingCapacity;

	@NotNull(message = "Price per day is required")
	@Positive(message = "Price per day must be greater than 0")
	private Double pricePerDay;

	@NotNull(message = "Price per km is required")
	@Positive(message = "Price per km must be greater than 0")
	private Double pricePerKm;
}
