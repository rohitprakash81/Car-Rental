package com.rohit.car_rental_api_spring_boot_project.mapper;

import org.mapstruct.Mapper;

import com.rohit.car_rental_api_spring_boot_project.dto.CustomerRequestDTO;
import com.rohit.car_rental_api_spring_boot_project.dto.CustomerResponseDTO;
import com.rohit.car_rental_api_spring_boot_project.entity.Customer;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

	public Customer toCustomer(CustomerRequestDTO requestDTO);
	
	public CustomerResponseDTO toCustomerResponseDTO(Customer customer);
}
