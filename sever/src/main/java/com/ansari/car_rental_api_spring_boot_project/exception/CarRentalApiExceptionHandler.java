package com.ansari.car_rental_api_spring_boot_project.exception;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CarRentalApiExceptionHandler {

	private final static Logger LOGGER = LoggerFactory.getLogger(CarRentalApiExceptionHandler.class);

	@ExceptionHandler(value = EmailAllreadyExistException.class)
	public ResponseEntity<ErrorResponse> emailAllreadyExistException(EmailAllreadyExistException e) {

		ErrorResponse errorResponse = new ErrorResponse(HttpStatus.CONFLICT.value(), e.getMessage());

		LOGGER.warn("email already exists {}" + e.getMessage());

		return ResponseEntity.status(HttpStatus.CONFLICT.value()).body(errorResponse);
	}

	@ExceptionHandler(value = RoleNotFoundException.class)
	public ResponseEntity<ErrorResponse> roleNotFoundException(RoleNotFoundException e) {

		ErrorResponse errorResponse = new ErrorResponse(HttpStatus.NOT_FOUND.value(), e.getMessage());

		LOGGER.warn("given role is not found" + e.getMessage());

		return ResponseEntity.status(HttpStatus.NOT_FOUND.value()).body(errorResponse);
	}

	@ExceptionHandler(value = InvalidEmailException.class)
	public ResponseEntity<ErrorResponse> invalidEmailException(InvalidEmailException e) {

		ErrorResponse errorResponse = new ErrorResponse(HttpStatus.NOT_FOUND.value(), e.getMessage());

		LOGGER.warn("email is wrong" + e.getMessage());

		return ResponseEntity.status(HttpStatus.NOT_FOUND.value()).body(errorResponse);
	}
	
	@ExceptionHandler(value = InvalidPasswordException.class)
	public ResponseEntity<ErrorResponse> invalidPasswordException(InvalidPasswordException e) {

		ErrorResponse errorResponse = new ErrorResponse(HttpStatus.NOT_FOUND.value(), e.getMessage());

		LOGGER.warn("password is wrong" + e.getMessage());

		return ResponseEntity.status(HttpStatus.NOT_FOUND.value()).body(errorResponse);
	}

	@ExceptionHandler(value = MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, String>> methodArgumentNotValidException(MethodArgumentNotValidException e) {

		List<FieldError> fieldErrors = e.getFieldErrors();

		Map<String, String> error = new HashMap<String, String>();

		for (FieldError fieldError : fieldErrors) {

			String fieldName = fieldError.getField();

			String failedMessage = fieldError.getDefaultMessage();

			error.put(fieldName, failedMessage);

		}

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
	}
	
	@ExceptionHandler(value = RuntimeException.class)
	public ResponseEntity<ErrorResponse> runTimeExceptionHandler(RuntimeException exception){
		
		ErrorResponse errorResponse = new ErrorResponse(HttpStatus.NOT_ACCEPTABLE.value(), exception.getMessage());

		LOGGER.warn(exception.getMessage());

		return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE.value()).body(errorResponse);
	}

}
