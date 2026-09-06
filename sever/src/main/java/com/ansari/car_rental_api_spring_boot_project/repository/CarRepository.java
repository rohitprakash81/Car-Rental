package com.ansari.car_rental_api_spring_boot_project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ansari.car_rental_api_spring_boot_project.entity.Car;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {

	Optional<Car> findByVehicleNumber(String vehicleNumber);
}
