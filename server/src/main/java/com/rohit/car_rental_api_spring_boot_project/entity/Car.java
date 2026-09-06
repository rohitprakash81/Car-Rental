package com.rohit.car_rental_api_spring_boot_project.entity;

import java.util.List;

import com.rohit.car_rental_api_spring_boot_project.enums.CarStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "cars")
public class Car {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "car_seq")
	@SequenceGenerator(name = "car_seq", sequenceName = "car_seq", allocationSize = 1, initialValue = 9001)
	private Long id;

	@Column(nullable = false, unique = true)
	private String vehicleNumber;

	@Column(nullable = false)
	private String brand;

	@Column(nullable = false)
	private String model;

	@Column(nullable = false)
	private String fuelType;

	@Column(nullable = false)
	private Integer seatingCapacity;

	@Column(nullable = false)
	private Double pricePerDay;

	@Column(nullable = false)
	private Double pricePerKm;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "car_owner_id")
	@JsonBackReference(value = "car-owner")
	private CarOwner carOwner;
	
	@OneToMany(mappedBy = "car", fetch = FetchType.LAZY)
	@JsonManagedReference(value = "car-booking")
	private List<Booking> bookings;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private CarStatus carStatus = CarStatus.AVAILABLE;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus approvalStatus = com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus.PENDING;

	private boolean isApprovedByAdmin = false;

	private String rejectionReason;

	private String rcNumber;

	private java.time.LocalDate insuranceValidTill;

	private String imageUrl;
}
