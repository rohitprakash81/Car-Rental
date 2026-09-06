package com.ansari.car_rental_api_spring_boot_project.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.ansari.car_rental_api_spring_boot_project.dto.CarRequestDTO;
import com.ansari.car_rental_api_spring_boot_project.dto.CarResponseDTO;
import com.ansari.car_rental_api_spring_boot_project.entity.Car;
import com.ansari.car_rental_api_spring_boot_project.entity.CarOwner;
import com.ansari.car_rental_api_spring_boot_project.exception.InvalidEmailException;
import com.ansari.car_rental_api_spring_boot_project.mapper.CarMapper;
import com.ansari.car_rental_api_spring_boot_project.repository.CarOwnerRepository;
import com.ansari.car_rental_api_spring_boot_project.repository.CarRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarService {

	private final CarRepository carRepository;

	private final CarMapper carMapper;

	private final CarOwnerRepository ownerRepository;

	public ResponseEntity<CarResponseDTO> registerCarService(CarRequestDTO carRequestDTO, HttpSession httpSession) {

		String email = (String) httpSession.getAttribute("carOwnerSession");

		if (email == null) {

			throw new RuntimeException("not logged in please login and then try");
		}

		CarOwner carOwner = ownerRepository.findByEmail(email)
				.orElseThrow(() -> new InvalidEmailException("email is invalid"));

		// converting carRequest to Car
		Car car = carMapper.toCar(carRequestDTO);

		// this will save foriegn key in car table
		car.setCarOwner(carOwner);

		Car savedCar = carRepository.save(car);

		// converting car to carResponseDTO
		CarResponseDTO carResponseDTO = carMapper.toCarResponseDTO(savedCar);

		return ResponseEntity.status(HttpStatus.CREATED).body(carResponseDTO);

	}

	public ResponseEntity<List<CarResponseDTO>> getAllCarsService() {

		List<Car> cars = carRepository.findAll();

		return ResponseEntity.status(HttpStatus.OK).body(carMapper.toCarResponseDTOList(cars));
	}

	/**
	 * This method retrieves a car by its ID and returns a ResponseEntity containing
	 * the corresponding CarResponseDTO.
	 * 
	 * @param carId
	 * @return ResponseEntity<CarResponseDTO> with the car details if found, or
	 *         throws a RuntimeException if not found.
	 */
	public Car getCarByIdService(Long carId) {

		return carRepository.findById(carId)
				.orElseThrow(() -> new RuntimeException("Car with id " + carId + " not found"));

	}
}
