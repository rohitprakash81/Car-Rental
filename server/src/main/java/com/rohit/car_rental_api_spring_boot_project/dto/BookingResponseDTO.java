package com.rohit.car_rental_api_spring_boot_project.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.rohit.car_rental_api_spring_boot_project.entity.Booking;
import com.rohit.car_rental_api_spring_boot_project.enums.BookingStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponseDTO {

	private String message;
	private Booking booking;

	// Flattened fields for reliable JSON serialization and frontend consumption
	private Long id;
	private LocalDate bookingDate;
	private LocalDate journeyDate;
	private String source;
	private String destination;
	private BookingStatus status;
	private Double totalAmount;
	private LocalDateTime paymentDeadline;

	private Long carId;
	private String carName;
	private String vehicleNumber;

	private Long customerId;
	private String customerName;
	private String customerEmail;
	private String customerPhone;

	public BookingResponseDTO(String message, Booking booking) {
		this.message = message;
		this.booking = booking;
		if (booking != null) {
			this.id = booking.getId();
			this.bookingDate = booking.getBookingDate();
			this.journeyDate = booking.getJourneyDate();
			this.source = booking.getSource();
			this.destination = booking.getDestination();
			this.status = booking.getStatus();
			this.totalAmount = booking.getTotalAmount();
			this.paymentDeadline = booking.getPaymentDeadline();

			if (booking.getCar() != null) {
				this.carId = booking.getCar().getId();
				String brand = booking.getCar().getBrand() != null ? booking.getCar().getBrand() : "";
				String model = booking.getCar().getModel() != null ? booking.getCar().getModel() : "";
				this.carName = (brand + " " + model).trim();
				this.vehicleNumber = booking.getCar().getVehicleNumber();
			}

			if (booking.getCustomer() != null) {
				this.customerId = booking.getCustomer().getId();
				this.customerName = booking.getCustomer().getName();
				this.customerEmail = booking.getCustomer().getEmail();
				this.customerPhone = booking.getCustomer().getPhoneNumber();
			}
		}
	}
}
