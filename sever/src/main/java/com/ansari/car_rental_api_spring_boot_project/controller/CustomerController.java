package com.ansari.car_rental_api_spring_boot_project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ansari.car_rental_api_spring_boot_project.dto.BookingRequestDTO;
import com.ansari.car_rental_api_spring_boot_project.service.BookingService;
import com.ansari.car_rental_api_spring_boot_project.service.CarService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
public class CustomerController {

	private final CarService carService;
	
	private final HttpSession httpSession;
	
	private final BookingService bookingService;
	
	@GetMapping("/getAllCars")
	public ResponseEntity<?> getAllCarsService() {
		
		String email = (String) httpSession.getAttribute("customerSession");
		
		if(email == null) {
			
			return ResponseEntity.ok().body("you are not logged in please login and then try");
			
		}
		
		return carService.getAllCarsService();
	}
	
	@PostMapping("/bookCar/{carId}")
	public ResponseEntity<?> bookCarService(@PathVariable Long carId,@RequestBody @Valid BookingRequestDTO bookingRequestDTO) {

		return bookingService.bookCarService(carId, httpSession, bookingRequestDTO);
	}
	
	@GetMapping("/getConfirmedBookingStatus")
	public ResponseEntity<?> getConfirmedBookingStatus(){
		return bookingService.getConfirmedBookingStatusForCustomer(httpSession);
	}
}
