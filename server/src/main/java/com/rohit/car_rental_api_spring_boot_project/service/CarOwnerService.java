package com.rohit.car_rental_api_spring_boot_project.service;

import java.util.List;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rohit.car_rental_api_spring_boot_project.dto.CarOwnerRequestDTO;
import com.rohit.car_rental_api_spring_boot_project.dto.CarOwnerResponseDTO;
import com.rohit.car_rental_api_spring_boot_project.dto.LoginRequestDTO;
import com.rohit.car_rental_api_spring_boot_project.entity.CarOwner;
import com.rohit.car_rental_api_spring_boot_project.entity.Role;
import com.rohit.car_rental_api_spring_boot_project.exception.EmailAllreadyExistException;
import com.rohit.car_rental_api_spring_boot_project.exception.InvalidEmailException;
import com.rohit.car_rental_api_spring_boot_project.exception.InvalidPasswordException;
import com.rohit.car_rental_api_spring_boot_project.exception.RoleNotFoundException;
import com.rohit.car_rental_api_spring_boot_project.mapper.CarOwnerMapper;
import com.rohit.car_rental_api_spring_boot_project.repository.CarOwnerRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.RoleRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarOwnerService {

	private static final Logger LOGGER = LoggerFactory.getLogger(CarOwnerService.class);

	private final CarOwnerRepository carOwnerRepository;

	private final PasswordEncoder passwordEncoder;

	private final CarOwnerMapper carOwnerMapper;

	private final RoleRepository roleRepository;

	@Transactional
	public CarOwnerResponseDTO registerCarOwner(CarOwnerRequestDTO carOwnerRequestDTO) {

		LOGGER.info("registerCarOwner execution started");

		String email = carOwnerRequestDTO.getEmail().trim().toLowerCase(Locale.ROOT);

		// Implement the logic to register a car owner
		if (carOwnerRepository.existsByEmail(email)) {
			throw new EmailAllreadyExistException("Car owner with email " + email + " already exists");
		}

		// check role
		Role role = roleRepository.findByName("Role_CarOwner")
				.orElseThrow(() -> new RoleNotFoundException("Role is not available"));

		// convert requestDto to entity
		CarOwner carOwner = carOwnerMapper.toCarOwner(carOwnerRequestDTO);

		// Encode the password before saving
		carOwner.setPassword(passwordEncoder.encode(carOwnerRequestDTO.getPassword()));
		carOwner.setEmail(email);
		carOwner.setRoles(List.of(role));
		carOwner.setVerificationStatus(com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus.PENDING);
		carOwner.setVerified(false);
		carOwner.setBlocked(false);

		// Save the car owner to the database
		CarOwner dbCarOwner = carOwnerRepository.save(carOwner);

		LOGGER.info("data saved in db and registerCarOwner execution ended");
		// convert dbsaved entity to responseDTO
		return carOwnerMapper.toCarOwnerResponseDTO(dbCarOwner);
	}

	public ResponseEntity<String> loginCarOwnerService(LoginRequestDTO requestDTO) {

		LOGGER.info("loginCarOwnerService() method execution started");

		String email = requestDTO.getEmail().trim().toLowerCase(Locale.ROOT);
		CarOwner carOwner = carOwnerRepository.findByEmail(email)
				.orElseThrow(() -> new InvalidEmailException("invalid email " + email));

		if (carOwner.isBlocked()) {
			throw new RuntimeException("Your account has been suspended by the administrator.");
		}

		if (!passwordEncoder.matches(requestDTO.getPassword(), carOwner.getPassword())) {
			throw new InvalidPasswordException("invalid password");
		}

		LOGGER.info("carOwner with email " + email + "logged in successfully!!!");

		return ResponseEntity.ok("login successfully");
	}
}
