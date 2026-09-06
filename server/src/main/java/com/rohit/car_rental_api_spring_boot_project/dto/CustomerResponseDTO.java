package com.rohit.car_rental_api_spring_boot_project.dto;

import lombok.Data;

@Data
public class CustomerResponseDTO {

	private Long id;

	private String name;

	private String email;

	private String phoneNumber;

	private String address;
}
