package com.ansari.car_rental_api_spring_boot_project.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.ansari.car_rental_api_spring_boot_project.dto.BookingRequestDTO;
import com.ansari.car_rental_api_spring_boot_project.dto.BookingResponseDTO;
import com.ansari.car_rental_api_spring_boot_project.entity.Booking;
import com.ansari.car_rental_api_spring_boot_project.entity.Car;
import com.ansari.car_rental_api_spring_boot_project.entity.CarOwner;
import com.ansari.car_rental_api_spring_boot_project.entity.Customer;
import com.ansari.car_rental_api_spring_boot_project.enums.BookingStatus;
import com.ansari.car_rental_api_spring_boot_project.enums.CarStatus;
import com.ansari.car_rental_api_spring_boot_project.mail.CarRentalEmailService;
import com.ansari.car_rental_api_spring_boot_project.mapper.BookingMapper;
import com.ansari.car_rental_api_spring_boot_project.repository.BookingRepository;
import com.ansari.car_rental_api_spring_boot_project.repository.CarOwnerRepository;
import com.ansari.car_rental_api_spring_boot_project.repository.CarRepository;
import com.ansari.car_rental_api_spring_boot_project.repository.CustomerRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

	private final BookingRepository bookingRepository;

	private final CarService carService;

	private final CustomerRepository customerRepository;

	private final CarOwnerRepository carOwnerRepository;
	
	private final BookingMapper bookingMapper;
	
	private final CarRepository carRepository;
	
	private final CarRentalEmailService carRentalEmailService;

	public ResponseEntity<?> bookCarService(Long carId, HttpSession httpSession,BookingRequestDTO bookingRequestDTO) {

		String email = (String) httpSession.getAttribute("customerSession");

		if (email == null) {

			return ResponseEntity.ok()
					.body("you are not logged in please login and then try");

		}

		// fetch car by carId and check if it is available or not
		Car car = carService.getCarByIdService(carId);

		// fetch customer email from session and check if he has already booked the car
		// or not
		Customer customer = customerRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("customer not found"));

		bookingRepository.findByCarAndCustomer(car, customer).ifPresent(b -> {
			throw new RuntimeException("you have already booked this car");
		});

		Booking booking = new Booking();
		booking.setJourneyDate(bookingRequestDTO.getJourneyDate());
		booking.setSource(bookingRequestDTO.getSource());
		booking.setDestination(bookingRequestDTO.getDestination());
		booking.setCar(car);
		booking.setCustomer(customer);
		booking.setStatus(BookingStatus.PENDING);

		Booking booking2 = bookingRepository.save(booking);
		car.setCarStatus(CarStatus.PENDING);
		carRepository.save(car);
		
		//send email to carowner
		carRentalEmailService.sendBookingRequestEmail(car.getCarOwner().getEmail(), customer.getName(), car.getVehicleNumber());

		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new BookingResponseDTO("car booked successfully", booking2));
	}

	public ResponseEntity<BookingResponseDTO> getBookingByIdService(Long bookingId) {

		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new RuntimeException("booking not found"));

		return ResponseEntity.ok().body(new BookingResponseDTO("booking fetched successfully", booking));
	}

	/**
	 *  
	 * @param httpSession
	 * @return
	 */
	public ResponseEntity<?> getPendingBookingForCarOwner(HttpSession httpSession) {

		String email = (String) httpSession.getAttribute("carOwnerSession");

		if (email == null) {

			return ResponseEntity.ok()
					.body("you are not logged in please login and then try");

		}
		
		List<BookingResponseDTO> pendingBookings = new ArrayList<>();
		
		CarOwner carOwner=carOwnerRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("car owner not found"));

		carOwner.getCars().forEach(car -> {
			bookingRepository.findByCarAndStatus(car, BookingStatus.PENDING).ifPresent(booking -> {
				
				pendingBookings.add(bookingMapper.toBookingResponseDTO(booking));
			});
		});
		
		return ResponseEntity.ok().body(pendingBookings);
	}
	
	public ResponseEntity<?> confirmedOrRejectBookingStatus(Long bookingId, BookingStatus status,HttpSession httpSession) {
		
		String email =(String) httpSession.getAttribute("carOwnerSession");
		
		if(email == null) {
			
			return ResponseEntity.ok().body("you are not logged in please login and then try");
		}
		
		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new RuntimeException("booking not found"));
		
		if (!booking.getCar().getCarOwner().getEmail().equalsIgnoreCase(email)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("you are not authorized to update this booking");
		}

		booking.setStatus(status);
		
		Car car=booking.getCar();
		
		if(status.toString().equals("ACCEPTED")) {
			System.out.println("confirmed---booking------status"+status.toString());
			car.setCarStatus(CarStatus.OCCUPIED);
		}else {
			System.out.println("confirmed---booking------status"+status.toString());
			car.setCarStatus(CarStatus.AVAILABLE);
		}
		
		Booking updatedBooking = bookingRepository.save(booking);
		carRepository.save(car);
		
		Customer customer = booking.getCustomer();
		
		carRentalEmailService.sendBookingConfirmedEmail(customer.getEmail(), customer.getName(), car.getVehicleNumber());
		
		return ResponseEntity.ok().body(new BookingResponseDTO("booking status updated successfully", updatedBooking));
	}

	public ResponseEntity<?> getConfirmedBookingStatusForCustomer(HttpSession httpSession) {
		String email = (String) httpSession.getAttribute("customerSession");

		if (email == null) {
			return ResponseEntity.ok().body("you are not logged in please login and then try");
		}

		Customer customer = customerRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("customer not found"));

		List<Booking> bookings = bookingRepository.findByCustomer(customer);
		List<BookingResponseDTO> responseDTOs = bookings.stream()
				.map(bookingMapper::toBookingResponseDTO)
				.toList();

		return ResponseEntity.ok().body(responseDTOs);
	}
}
