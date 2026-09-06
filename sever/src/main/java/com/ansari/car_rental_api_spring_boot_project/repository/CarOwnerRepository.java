package com.ansari.car_rental_api_spring_boot_project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ansari.car_rental_api_spring_boot_project.entity.CarOwner;

@Repository
public interface CarOwnerRepository extends JpaRepository<CarOwner, Long> {

	Optional<CarOwner> findByEmail(String email);
	
	// Check if a car owner exists by email
	boolean existsByEmail(String email);

}
