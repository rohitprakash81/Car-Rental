package com.rohit.car_rental_api_spring_boot_project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rohit.car_rental_api_spring_boot_project.dto.CarRequestDTO;
import com.rohit.car_rental_api_spring_boot_project.enums.BookingStatus;
import com.rohit.car_rental_api_spring_boot_project.service.BookingService;
import com.rohit.car_rental_api_spring_boot_project.service.CarService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/v1/carOwner")
@RequiredArgsConstructor
public class CarOwnerController {

	private final CarService carService;
	private final BookingService bookingService;

	@GetMapping("/logoutCarOwner")
	public ResponseEntity<?> logoutCarOwner() {
		return ResponseEntity.ok("car-owner logout successfully. Please use /api/v1/auth/logout for cookie invalidation.");
	}

	@GetMapping("/carOwnerProfile")
	public ResponseEntity<?> carOwnerProfile(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body("you are not logged in");
		}
		return ResponseEntity.ok("CarOwner " + authentication.getName() + " profile active.");
	}

	@PostMapping("/registerCar")
	public ResponseEntity<?> registerCarService(@RequestBody @Valid CarRequestDTO carRequestDTO) {
		return carService.registerCarService(carRequestDTO);
	}
	
	@GetMapping("/getAllCars")
	public ResponseEntity<?> getAllCarsService(
			@org.springframework.web.bind.annotation.RequestParam(value = "page", defaultValue = "0") int page,
			@org.springframework.web.bind.annotation.RequestParam(value = "size", defaultValue = "6") int size,
			@org.springframework.web.bind.annotation.RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
			@org.springframework.web.bind.annotation.RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
		return carService.getOwnerCarsService(page, size, sortBy, sortDir);
	}
	
	@GetMapping("/getPendingBookingForCarOwner")
	public ResponseEntity<?> getPendingBookingForCarOwner() {
		return bookingService.getPendingBookingForCarOwner();
	}
	
	@PostMapping("/confirmedOrRejectBookingStatus/{bookingId}/{status}")
	public ResponseEntity<?> confirmedOrRejectBookingStatus(@PathVariable Long bookingId, @PathVariable BookingStatus status) {
		return bookingService.confirmedOrRejectBookingStatus(bookingId, status);
	}
}
