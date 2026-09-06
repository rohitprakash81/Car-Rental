package com.rohit.car_rental_api_spring_boot_project.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import lombok.Data;

@Data
@Entity
public class Notification {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "notification_seq")
	@SequenceGenerator(name = "notification_seq", sequenceName = "notification_seq", allocationSize = 1, initialValue = 4174)
	private Long id;

	private String message;

	private boolean seen;

	@ManyToOne
	private Customer customer;

	@ManyToOne
	private CarOwner carOwner;
}
