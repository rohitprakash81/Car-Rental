package com.rohit.car_rental_api_spring_boot_project.mapper;

import org.mapstruct.Mapper;

import com.rohit.car_rental_api_spring_boot_project.dto.CarOwnerRequestDTO;
import com.rohit.car_rental_api_spring_boot_project.dto.CarOwnerResponseDTO;
import com.rohit.car_rental_api_spring_boot_project.entity.CarOwner;

@Mapper(componentModel = "spring")
public interface CarOwnerMapper {
	
 /**
  * convert OwnerRequestDTO to CarOwner entity
  * @param dto
  * @return
  */
 CarOwner toCarOwner(CarOwnerRequestDTO dto);
 

 CarOwnerResponseDTO toCarOwnerResponseDTO(CarOwner carOwner);
 
}
