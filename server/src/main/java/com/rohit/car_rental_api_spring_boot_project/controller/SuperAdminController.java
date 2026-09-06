package com.rohit.car_rental_api_spring_boot_project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rohit.car_rental_api_spring_boot_project.dto.ApiResponse;
import com.rohit.car_rental_api_spring_boot_project.entity.Car;
import com.rohit.car_rental_api_spring_boot_project.entity.CarOwner;
import com.rohit.car_rental_api_spring_boot_project.service.SuperAdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = superAdminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved successfully", stats));
    }

    @GetMapping("/owners/pending")
    public ResponseEntity<ApiResponse<?>> getPendingCarOwners(
            @org.springframework.web.bind.annotation.RequestParam(value = "page", required = false) Integer page,
            @org.springframework.web.bind.annotation.RequestParam(value = "size", defaultValue = "10") int size) {
        if (page != null) {
            com.rohit.car_rental_api_spring_boot_project.dto.PageResponse<CarOwner> paged = superAdminService.getPendingCarOwners(page, size);
            return ResponseEntity.ok(ApiResponse.success("Pending car owners retrieved", paged));
        }
        List<CarOwner> pending = superAdminService.getPendingCarOwners();
        return ResponseEntity.ok(ApiResponse.success("Pending car owners retrieved", pending));
    }

    @GetMapping("/owners/all")
    public ResponseEntity<ApiResponse<List<CarOwner>>> getAllCarOwners() {
        List<CarOwner> owners = superAdminService.getAllCarOwners();
        return ResponseEntity.ok(ApiResponse.success("All car owners retrieved", owners));
    }

    @PatchMapping("/owners/{ownerId}/verify")
    public ResponseEntity<ApiResponse<CarOwner>> verifyCarOwner(
            @PathVariable Long ownerId,
            @RequestBody Map<String, Object> body) {
        boolean approve = Boolean.TRUE.equals(body.get("approve"));
        String reason = (String) body.get("reason");
        CarOwner updated = superAdminService.verifyCarOwner(ownerId, approve, reason);
        String action = approve ? "approved" : "rejected";
        return ResponseEntity.ok(ApiResponse.success("Car owner successfully " + action, updated));
    }

    @GetMapping("/cars/pending")
    public ResponseEntity<ApiResponse<?>> getPendingCars(
            @org.springframework.web.bind.annotation.RequestParam(value = "page", required = false) Integer page,
            @org.springframework.web.bind.annotation.RequestParam(value = "size", defaultValue = "10") int size) {
        if (page != null) {
            com.rohit.car_rental_api_spring_boot_project.dto.PageResponse<Car> paged = superAdminService.getPendingCars(page, size);
            return ResponseEntity.ok(ApiResponse.success("Pending cars retrieved", paged));
        }
        List<Car> pending = superAdminService.getPendingCars();
        return ResponseEntity.ok(ApiResponse.success("Pending cars retrieved", pending));
    }

    @GetMapping("/cars/all")
    public ResponseEntity<ApiResponse<List<Car>>> getAllCars() {
        List<Car> cars = superAdminService.getAllCars();
        return ResponseEntity.ok(ApiResponse.success("All cars retrieved", cars));
    }

    @PatchMapping("/cars/{carId}/verify")
    public ResponseEntity<ApiResponse<Car>> verifyCar(
            @PathVariable Long carId,
            @RequestBody Map<String, Object> body) {
        boolean approve = Boolean.TRUE.equals(body.get("approve"));
        String reason = (String) body.get("reason");
        Car updated = superAdminService.verifyCar(carId, approve, reason);
        String action = approve ? "approved" : "rejected";
        return ResponseEntity.ok(ApiResponse.success("Vehicle successfully " + action, updated));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllUsers() {
        List<Map<String, Object>> users = superAdminService.getAllUsersForGovernance();
        return ResponseEntity.ok(ApiResponse.success("Platform users retrieved", users));
    }

    @PatchMapping("/users/{userType}/{userId}/toggle-block")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleUserBlock(
            @PathVariable String userType,
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body) {
        boolean block = Boolean.TRUE.equals(body.get("block"));
        String reason = (String) body.get("reason");
        Map<String, Object> result = superAdminService.toggleUserBlock(userType, userId, block, reason);
        String action = block ? "blocked" : "unblocked";
        return ResponseEntity.ok(ApiResponse.success("User " + action + " successfully", result));
    }
}
