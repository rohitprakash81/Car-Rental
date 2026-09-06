package com.ansari.car_rental_api_spring_boot_project.exception;

@SuppressWarnings("serial")
public class RoleNotFoundException extends RuntimeException {

	public RoleNotFoundException(String msg) {
		super(msg);
	}
}
