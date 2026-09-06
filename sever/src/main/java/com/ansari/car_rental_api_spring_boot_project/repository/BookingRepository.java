package com.ansari.car_rental_api_spring_boot_project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ansari.car_rental_api_spring_boot_project.entity.Booking;
import com.ansari.car_rental_api_spring_boot_project.entity.Car;
import com.ansari.car_rental_api_spring_boot_project.entity.Customer;
import com.ansari.car_rental_api_spring_boot_project.enums.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

	
  	Optional<Booking> findByCarAndCustomer(Car car, Customer customer);
  	
  	Optional<Booking> findByCarAndStatus(Car car, BookingStatus status);

  	List<Booking> findByCustomer(Customer customer);
}
