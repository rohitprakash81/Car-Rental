package com.ansari.car_rental_api_spring_boot_project;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;

@SpringBootApplication
public class CarRentalApiSpringBootProjectApplication {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(CarRentalApiSpringBootProjectApplication.class);
			

	public static void main(String[] args) {
		
		ConfigurableApplicationContext applicationContext=SpringApplication.run(CarRentalApiSpringBootProjectApplication.class, args);
	
		ConfigurableEnvironment environment=applicationContext.getEnvironment();
		
		String port=environment.getProperty("server.port");
		
		LOGGER.info("Car-Rental-API-is Running-on-port = "+port);
		
		System.out.println("Car-Rental-API-is Running-on-port = "+port);
	}

}
