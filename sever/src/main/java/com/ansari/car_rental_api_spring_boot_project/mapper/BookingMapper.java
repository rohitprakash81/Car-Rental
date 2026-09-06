package com.ansari.car_rental_api_spring_boot_project.mapper;

import org.mapstruct.Mapper;

import com.ansari.car_rental_api_spring_boot_project.dto.BookingResponseDTO;
import com.ansari.car_rental_api_spring_boot_project.entity.Booking;

@Mapper(componentModel = "spring")
public interface BookingMapper {

	BookingResponseDTO toBookingResponseDTO(Booking booking);
}
