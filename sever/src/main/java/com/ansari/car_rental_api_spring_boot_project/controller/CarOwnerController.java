package com.ansari.car_rental_api_spring_boot_project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ansari.car_rental_api_spring_boot_project.dto.CarRequestDTO;
import com.ansari.car_rental_api_spring_boot_project.dto.CarResponseDTO;
import com.ansari.car_rental_api_spring_boot_project.entity.Booking;
import com.ansari.car_rental_api_spring_boot_project.enums.BookingStatus;
import com.ansari.car_rental_api_spring_boot_project.service.BookingService;
import com.ansari.car_rental_api_spring_boot_project.service.CarService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/carOwner")
@RequiredArgsConstructor
public class CarOwnerController {

	private final HttpSession httpSession;

	private final CarService carService;
	
	private final BookingService bookingService;

	@GetMapping("/logoutCarOwner")
	public ResponseEntity<?> logoutCarOwner() {

		String email = (String) httpSession.getAttribute("carOwnerSession");

		if (email == null) {

			return ResponseEntity.ok("you are not logged in");
		}

		httpSession.invalidate();

		return ResponseEntity.ok("car-owner logout successfully");
	}

	@GetMapping("/carOwnerProfile")
	public ResponseEntity<?> carOwnerProfile() {

		String email = (String) httpSession.getAttribute("carOwnerSession");

		if (email == null) {

			return ResponseEntity.ok("you are not logged in");
		}

		return ResponseEntity.ok("CarOwner performing some operation successfully");
	}

	@PostMapping("/registerCar")
	public ResponseEntity<CarResponseDTO> registerCarService(@RequestBody @Valid CarRequestDTO carRequestDTO) {

		return carService.registerCarService(carRequestDTO,httpSession);
	}
	
	@GetMapping("/getAllCars")
	public ResponseEntity<?> getAllCarsService() {
		
		String email = (String) httpSession.getAttribute("carOwnerSession");
		
		if(email == null) {
			
			return ResponseEntity.ok().body("you are not logged in please login and then try");
			
	    }	
		return carService.getAllCarsService();
	}
	
	@GetMapping("/getPendingBookingForCarOwner")
	public ResponseEntity<?> getPendingBookingForCarOwner() {
		return bookingService.getPendingBookingForCarOwner(httpSession);
	}
	
	@PostMapping("/confirmedOrRejectBookingStatus/{bookingId}/{status}")
	public ResponseEntity<?> confirmedOrRejectBookingStatus(@PathVariable Long bookingId, @PathVariable BookingStatus status) {
		
		return bookingService.confirmedOrRejectBookingStatus(bookingId, status,httpSession);
	}
}
