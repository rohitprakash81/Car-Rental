package com.ansari.car_rental_api_spring_boot_project.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import lombok.Data;

@Data
public class BookingRequestDTO {

	@FutureOrPresent(message = "journey date should be present or future")
	private LocalDate journeyDate;

	private String source;

	private String destination;

}
