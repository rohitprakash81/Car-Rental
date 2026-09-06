package com.ansari.car_rental_api_spring_boot_project.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ansari.car_rental_api_spring_boot_project.dto.CarOwnerRequestDTO;
import com.ansari.car_rental_api_spring_boot_project.dto.CarOwnerResponseDTO;
import com.ansari.car_rental_api_spring_boot_project.dto.CustomerRequestDTO;
import com.ansari.car_rental_api_spring_boot_project.dto.CustomerResponseDTO;
import com.ansari.car_rental_api_spring_boot_project.dto.LoginRequestDTO;
import com.ansari.car_rental_api_spring_boot_project.entity.Role;
import com.ansari.car_rental_api_spring_boot_project.service.CarOwnerService;
import com.ansari.car_rental_api_spring_boot_project.service.CustomerService;
import com.ansari.car_rental_api_spring_boot_project.service.RoleService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
	
	private final static Logger LOGGER = LoggerFactory.getLogger(AuthController.class);
	
	private final CarOwnerService carOwnerService;
	
	private final RoleService roleService;
	
	private final CustomerService customerService;
	
	private final HttpSession httpSession;
	
	@PostMapping("/registerCarOwner")
	public ResponseEntity<CarOwnerResponseDTO> registerCarOwner(@RequestBody @Valid CarOwnerRequestDTO dto){
	
		 CarOwnerResponseDTO responseDTO=carOwnerService.registerCarOwner(dto);
		 
		 return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
	}

	@PostMapping("/registerCustomer")
	public ResponseEntity<CustomerResponseDTO> registerCustomer(@RequestBody @Valid CustomerRequestDTO requestDTO){
		
		return customerService.registerCustomer(requestDTO);
	}
	
	@PostMapping("/loginCarOwner")
	public ResponseEntity<?> loginCarOwner(@RequestBody @Valid LoginRequestDTO requestDTO ){
	
		return carOwnerService.loginCarOwnerService(requestDTO, httpSession);
	}
	
	
	@PostMapping("/loginCustomer")
	public ResponseEntity<String> loginCustomer(@RequestBody @Valid LoginRequestDTO requestDTO,HttpSession httpSession){
		return customerService.loginCustomer(requestDTO, httpSession);
	}
	
	@PostMapping("/saveRole")
	public Role saveRoleService(@RequestBody Role role) {
		return roleService.saveRoleService(role);
	}
}
