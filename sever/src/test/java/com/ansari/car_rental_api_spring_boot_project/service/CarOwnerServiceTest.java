package com.ansari.car_rental_api_spring_boot_project.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ansari.car_rental_api_spring_boot_project.dto.CarOwnerRequestDTO;
import com.ansari.car_rental_api_spring_boot_project.dto.CarOwnerResponseDTO;
import com.ansari.car_rental_api_spring_boot_project.entity.CarOwner;
import com.ansari.car_rental_api_spring_boot_project.exception.EmailAllreadyExistException;
import com.ansari.car_rental_api_spring_boot_project.mapper.CarOwnerMapper;
import com.ansari.car_rental_api_spring_boot_project.repository.CarOwnerRepository;

@ExtendWith(MockitoExtension.class)
class CarOwnerServiceTest {

	@Mock
	private CarOwnerRepository carOwnerRepository;

	@Mock
	private CarOwnerMapper carOwnerMapper;

	@Mock
	private PasswordEncoder passwordEncoder;

	@InjectMocks
	private CarOwnerService carOwnerService;

	private CarOwner carOwner;
	private CarOwner savedCarOwner;
	private CarOwnerRequestDTO requestDTO;
	private CarOwnerResponseDTO responseDTO;

	@BeforeEach
	public void createSetupForRegisterTest() {

		// Request DTO
		requestDTO = new CarOwnerRequestDTO();
		requestDTO.setEmail("MASOOD@GMAIL.COM".toLowerCase().trim());
		requestDTO.setPassword("password123");

		// Entity created by mapper
		carOwner = new CarOwner();
		carOwner.setEmail("MASOOD@GMAIL.COM".toLowerCase().trim());
		carOwner.setPassword("password123");

		// Entity returned by database
		savedCarOwner = new CarOwner();
		savedCarOwner.setId(1L);
		savedCarOwner.setEmail("masood@gmail.com");
		savedCarOwner.setPassword("encodedPassword");

		// Response DTO
		responseDTO = new CarOwnerResponseDTO();
		responseDTO.setId(1L);
		responseDTO.setEmail("masood@gmail.com");
		savedCarOwner.setPassword("encodedPassword");

	}

	@Test
	public void testRegisterCarOwner_Success() {

		when(carOwnerRepository.existsByEmail("masood@gmail.com")).thenReturn(false);

		when(carOwnerMapper.toCarOwner(requestDTO)).thenReturn(carOwner);

		when(passwordEncoder.encode(carOwner.getPassword())).thenReturn("encodedPassword");

		when(carOwnerRepository.save(carOwner)).thenReturn(savedCarOwner);

		when(carOwnerMapper.toCarOwnerResponseDTO(savedCarOwner)).thenReturn(responseDTO);

		CarOwnerResponseDTO result = carOwnerService.registerCarOwner(requestDTO);

		assertEquals(1L, result.getId());
		assertEquals("MASOOD@GMAIL.COM".toLowerCase().trim(), result.getEmail());

		verify(carOwnerRepository, times(1)).existsByEmail("masood@gmail.com");

		verify(carOwnerMapper, times(1)).toCarOwner(requestDTO);

		verify(passwordEncoder, times(1)).encode("password123");

		verify(carOwnerRepository, times(1)).save(carOwner);

		verify(carOwnerMapper, times(1)).toCarOwnerResponseDTO(savedCarOwner);
	}

	@Test
	public void testRegisterCarOwner_Failed() {

		// Arrange
		when(carOwnerRepository.existsByEmail("masood@gmail.com")).thenReturn(true);

		// Act + Assert
		EmailAllreadyExistException exception = assertThrows(EmailAllreadyExistException.class,
				() -> carOwnerService.registerCarOwner(requestDTO));

		assertEquals("Car owner with email masood@gmail.com already exists", exception.getMessage());

		// Verify repository email check
		verify(carOwnerRepository, times(1)).existsByEmail("masood@gmail.com");

		// Save should NEVER happen
		verify(carOwnerRepository, times(0)).save(any(CarOwner.class));
	}

}
