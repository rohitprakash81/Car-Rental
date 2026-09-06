package com.rohit.car_rental_api_spring_boot_project.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "car-owner")
public class CarOwner {

	@Id	
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "car_owner_seq")
	@SequenceGenerator(name = "car_owner_seq", sequenceName = "car_owner_seq", allocationSize = 1, initialValue = 2001)
	private Long id;
	private String name;
	@Column(unique = true)
	private String email;
	private String password;
	private String address;
	@Column(unique = true)
	private String phoneNumber;
	@Column(unique = true)
	private String licenseNumber;

	@jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
	@Column(nullable = false)
	private com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus verificationStatus = com.rohit.car_rental_api_spring_boot_project.enums.VerificationStatus.PENDING;

	private boolean isVerified = false;

	private String rejectionReason;

	private boolean isBlocked = false;

	private String idProofUrl;
	
	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(
		name = "car_owner_roles",
		joinColumns = @JoinColumn(name = "car_owner_id"),
		inverseJoinColumns = @JoinColumn(name = "role_id")
	)
	private List<Role> roles=new ArrayList<>();
	
	@OneToMany(mappedBy = "carOwner", fetch = FetchType.EAGER)
	@JsonManagedReference(value = "car-owner")
	private List<Car> cars;
	
	@OneToMany(mappedBy = "carOwner", fetch = FetchType.EAGER)
	private List<Notification> notifications;
}
