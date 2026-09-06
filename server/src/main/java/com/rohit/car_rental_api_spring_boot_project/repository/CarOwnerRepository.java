package com.rohit.car_rental_api_spring_boot_project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rohit.car_rental_api_spring_boot_project.entity.CarOwner;

@Repository
public interface CarOwnerRepository extends JpaRepository<CarOwner, Long> {

	Optional<CarOwner> findByEmail(String email);
	
	// Check if a car owner exists by email
	boolean existsByEmail(String email);

	java.util.List<CarOwner> findByVerificationStatus(com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus verificationStatus);

	org.springframework.data.domain.Page<CarOwner> findByVerificationStatus(
		com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus verificationStatus,
		org.springframework.data.domain.Pageable pageable
	);

}
