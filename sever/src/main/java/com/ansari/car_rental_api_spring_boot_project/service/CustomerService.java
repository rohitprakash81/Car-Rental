package com.ansari.car_rental_api_spring_boot_project.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ansari.car_rental_api_spring_boot_project.dto.CustomerRequestDTO;
import com.ansari.car_rental_api_spring_boot_project.dto.CustomerResponseDTO;
import com.ansari.car_rental_api_spring_boot_project.dto.LoginRequestDTO;
import com.ansari.car_rental_api_spring_boot_project.entity.Customer;
import com.ansari.car_rental_api_spring_boot_project.entity.Role;
import com.ansari.car_rental_api_spring_boot_project.exception.EmailAllreadyExistException;
import com.ansari.car_rental_api_spring_boot_project.exception.InvalidEmailException;
import com.ansari.car_rental_api_spring_boot_project.exception.InvalidPasswordException;
import com.ansari.car_rental_api_spring_boot_project.mapper.CustomerMapper;
import com.ansari.car_rental_api_spring_boot_project.repository.CustomerRepository;
import com.ansari.car_rental_api_spring_boot_project.repository.RoleRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {

	private final CustomerRepository customerRepository;
	
	private final RoleRepository roleRepository;
	
	private final CustomerMapper customerMapper;
	
	private final PasswordEncoder passwordEncoder;
	
	public ResponseEntity<CustomerResponseDTO> registerCustomer(CustomerRequestDTO requestDTO){
		
		String email = requestDTO.getEmail().trim().toLowerCase();
		
		if(customerRepository.existsByEmail(email)) {
			throw new EmailAllreadyExistException("this username is already exist change your email and then register");
		}
		
		Role role=roleRepository.findByName("Role_Customer").orElseThrow(()->new RuntimeException("role is not found"));
		
		Customer customer=customerMapper.toCustomer(requestDTO);
		
		customer.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
		
		customer.setRoles(List.of(role));
		
		Customer savedCustomer=customerRepository.save(customer);
		
		return ResponseEntity.status(HttpStatus.CREATED).body(customerMapper.toCustomerResponseDTO(savedCustomer));
	}
	
	public ResponseEntity<String> loginCustomer(LoginRequestDTO requestDTO,HttpSession httpSession){
		
		if(httpSession.getAttribute("customerSession")!=null) {
			
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Already-Login");
		}
		
		String email = requestDTO.getEmail().trim().toLowerCase();
		
		Customer customer=customerRepository.findByEmail(email).orElseThrow(()->new InvalidEmailException("customer email is incorrect"));
	
		if (!passwordEncoder.matches(requestDTO.getPassword(), customer.getPassword())) {
			throw new InvalidPasswordException("invalid password");
		}
		
		httpSession.setAttribute("customerSession", customer.getEmail());
		
		return ResponseEntity.status(HttpStatus.ACCEPTED).body("customer login successfully");
	}
}
