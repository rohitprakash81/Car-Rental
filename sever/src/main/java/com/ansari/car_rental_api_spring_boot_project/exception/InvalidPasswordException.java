package com.ansari.car_rental_api_spring_boot_project.exception;

@SuppressWarnings("serial")
public class InvalidPasswordException extends RuntimeException{

	public InvalidPasswordException(String msg) {
		super(msg);
	}
}
