package com.rohit.car_rental_api_spring_boot_project.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CarRequestDTO {

	@NotBlank(message = "Vehicle number is required")
	@Pattern(
		regexp = "^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$",
		message = "Invalid Indian vehicle number format (e.g. MH12AB1234, DL01A1234, or HR26AB1234)"
	)
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

	@NotBlank(message = "Registration Certificate (RC) number is required")
	@Pattern(
		regexp = "^[A-Z0-9-]{6,20}$",
		message = "Invalid Registration Certificate (RC) number format (6-20 alphanumeric characters or hyphens)"
	)
	private String rcNumber;

	@NotNull(message = "Insurance validity date is required")
	@Future(message = "Insurance validity date must be in the future")
	private LocalDate insuranceValidTill;

	@NotBlank(message = "Vehicle photo is required. Please upload an image.")
	private String imageUrl;
}
