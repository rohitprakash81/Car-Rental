package com.rohit.car_rental_api_spring_boot_project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rohit.car_rental_api_spring_boot_project.entity.Car;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {

	Optional<Car> findByVehicleNumber(String vehicleNumber);

	@org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
	@org.springframework.data.jpa.repository.Query("SELECT c FROM Car c WHERE c.id = :carId")
	Optional<Car> findByIdWithLock(@org.springframework.data.repository.query.Param("carId") Long carId);

	java.util.List<Car> findByApprovalStatus(com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus approvalStatus);

	org.springframework.data.domain.Page<Car> findByApprovalStatus(
		com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus approvalStatus,
		org.springframework.data.domain.Pageable pageable
	);

	org.springframework.data.domain.Page<Car> findByCarOwner(
		com.rohit.car_rental_api_spring_boot_project.entity.CarOwner carOwner,
		org.springframework.data.domain.Pageable pageable
	);

	java.util.List<Car> findByApprovalStatusAndCarStatus(
		com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus approvalStatus,
		com.rohit.car_rental_api_spring_boot_project.enums.CarStatus carStatus
	);
}
