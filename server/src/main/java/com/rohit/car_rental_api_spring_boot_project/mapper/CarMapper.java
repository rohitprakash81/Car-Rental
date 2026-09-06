package com.rohit.car_rental_api_spring_boot_project.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.rohit.car_rental_api_spring_boot_project.dto.CarRequestDTO;
import com.rohit.car_rental_api_spring_boot_project.dto.CarResponseDTO;
import com.rohit.car_rental_api_spring_boot_project.entity.Car;

@Mapper(componentModel = "spring")
public interface CarMapper {

 public Car toCar(CarRequestDTO requestDTO);
 
 public CarResponseDTO toCarResponseDTO(Car car);
 
 public List<CarResponseDTO> toCarResponseDTOList(List<Car> cars);
 
}
