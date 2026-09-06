package com.rohit.car_rental_api_spring_boot_project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rohit.car_rental_api_spring_boot_project.dto.BookingRequestDTO;
import com.rohit.car_rental_api_spring_boot_project.service.BookingService;
import com.rohit.car_rental_api_spring_boot_project.service.CarService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
public class CustomerController {

	private final CarService carService;
	private final BookingService bookingService;
	
	@GetMapping("/getAllCars")
	public ResponseEntity<?> getAllCarsService(
			@org.springframework.web.bind.annotation.RequestParam(value = "page", defaultValue = "0") int page,
			@org.springframework.web.bind.annotation.RequestParam(value = "size", defaultValue = "6") int size,
			@org.springframework.web.bind.annotation.RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
			@org.springframework.web.bind.annotation.RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
		
		return carService.getAllCarsService(page, size, sortBy, sortDir);
	}
	
	@PostMapping("/bookCar/{carId}")
	public ResponseEntity<?> bookCarService(@PathVariable Long carId,@RequestBody @Valid BookingRequestDTO bookingRequestDTO) {

		return bookingService.bookCarService(carId, bookingRequestDTO);
	}
	
	@GetMapping("/getConfirmedBookingStatus")
	public ResponseEntity<?> getConfirmedBookingStatus(
			@org.springframework.web.bind.annotation.RequestParam(value = "page", defaultValue = "0") int page,
			@org.springframework.web.bind.annotation.RequestParam(value = "size", defaultValue = "10") int size) {
		return bookingService.getConfirmedBookingStatusForCustomer(page, size);
	}
}
