package com.ansari.car_rental_api_spring_boot_project.entity;

import java.time.LocalDate;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.ansari.car_rental_api_spring_boot_project.enums.BookingStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Booking {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "booking_seq")
	@SequenceGenerator(name = "booking_seq", sequenceName = "booking_seq", allocationSize = 1, initialValue = 8521)
	private Long id;
	
	@CreationTimestamp
	private LocalDate bookingDate;
	
	private LocalDate journeyDate;
	
	private String source;
	
	private String destination;

	@ManyToOne
	@JoinColumn(name = "customer_id")
	@JsonBackReference(value = "customer-booking")
	private Customer customer;

	@ManyToOne
	@JoinColumn(name = "car_id")
	@JsonBackReference(value = "car-booking")
	private Car car;

	@Enumerated(EnumType.STRING)
	private BookingStatus status;
}
