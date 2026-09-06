package com.rohit.car_rental_api_spring_boot_project.mapper;

import org.mapstruct.Mapper;

import com.rohit.car_rental_api_spring_boot_project.dto.BookingResponseDTO;
import com.rohit.car_rental_api_spring_boot_project.entity.Booking;

@Mapper(componentModel = "spring")
public interface BookingMapper {

	default BookingResponseDTO toBookingResponseDTO(Booking booking) {
		return new BookingResponseDTO(null, booking);
	}
}
