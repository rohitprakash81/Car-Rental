package com.ansari.car_rental_api_spring_boot_project.exception;

@SuppressWarnings("serial")
public class InvalidEmailException extends RuntimeException {
	
	public InvalidEmailException(String msg) {
		super(msg);
	}
	
}
