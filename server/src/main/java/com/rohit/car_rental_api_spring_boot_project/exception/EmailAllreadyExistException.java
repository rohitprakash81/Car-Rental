package com.rohit.car_rental_api_spring_boot_project.exception;

@SuppressWarnings("serial")
public class EmailAllreadyExistException extends RuntimeException {
	
	public EmailAllreadyExistException(String msg) {
		super(msg);
	}

}
