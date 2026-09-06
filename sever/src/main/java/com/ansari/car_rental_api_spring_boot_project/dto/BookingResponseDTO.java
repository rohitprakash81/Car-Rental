package com.ansari.car_rental_api_spring_boot_project.dto;

import com.ansari.car_rental_api_spring_boot_project.entity.Booking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponseDTO {

	private String message;
	private Booking booking;
	
	
}
