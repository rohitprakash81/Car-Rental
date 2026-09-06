package com.rohit.car_rental_api_spring_boot_project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rohit.car_rental_api_spring_boot_project.entity.Booking;
import com.rohit.car_rental_api_spring_boot_project.entity.Car;
import com.rohit.car_rental_api_spring_boot_project.entity.Customer;
import com.rohit.car_rental_api_spring_boot_project.enums.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

	
  	Optional<Booking> findByCarAndCustomer(Car car, Customer customer);
  	
  	Optional<Booking> findByCarAndStatus(Car car, BookingStatus status);

  	List<Booking> findByCustomer(Customer customer);

	org.springframework.data.domain.Page<Booking> findByCustomer(
		Customer customer,
		org.springframework.data.domain.Pageable pageable
	);

	@org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
	@org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.id = :bookingId")
	Optional<Booking> findByIdWithLock(@org.springframework.data.repository.query.Param("bookingId") Long bookingId);

	@org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.car.id = :carId AND b.journeyDate = :journeyDate AND b.status IN ('ACCEPTED', 'AWAITING_PAYMENT', 'PAID', 'CONFIRMED')")
	List<Booking> findActiveOverlappingBookings(
		@org.springframework.data.repository.query.Param("carId") Long carId,
		@org.springframework.data.repository.query.Param("journeyDate") java.time.LocalDate journeyDate
	);

	List<Booking> findByCarAndJourneyDateAndStatus(Car car, java.time.LocalDate journeyDate, BookingStatus status);
}
