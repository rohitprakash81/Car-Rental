package com.rohit.car_rental_api_spring_boot_project.controller;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.rohit.car_rental_api_spring_boot_project.config.CookieUtils;
import com.rohit.car_rental_api_spring_boot_project.config.JwtUtils;
import com.rohit.car_rental_api_spring_boot_project.dto.ApiResponse;
import com.rohit.car_rental_api_spring_boot_project.dto.CarOwnerRequestDTO;
import com.rohit.car_rental_api_spring_boot_project.dto.CarOwnerResponseDTO;
import com.rohit.car_rental_api_spring_boot_project.dto.CustomerRequestDTO;
import com.rohit.car_rental_api_spring_boot_project.dto.CustomerResponseDTO;
import com.rohit.car_rental_api_spring_boot_project.dto.LoginRequestDTO;
import com.rohit.car_rental_api_spring_boot_project.entity.CarOwner;
import com.rohit.car_rental_api_spring_boot_project.entity.Customer;
import com.rohit.car_rental_api_spring_boot_project.entity.RefreshToken;
import com.rohit.car_rental_api_spring_boot_project.entity.Role;
import com.rohit.car_rental_api_spring_boot_project.exception.InvalidEmailException;
import com.rohit.car_rental_api_spring_boot_project.exception.InvalidPasswordException;
import com.rohit.car_rental_api_spring_boot_project.mail.CarRentalEmailService;
import com.rohit.car_rental_api_spring_boot_project.repository.CarOwnerRepository;
import com.rohit.car_rental_api_spring_boot_project.repository.CustomerRepository;
import com.rohit.car_rental_api_spring_boot_project.service.CarOwnerService;
import com.rohit.car_rental_api_spring_boot_project.service.CloudinaryService;
import com.rohit.car_rental_api_spring_boot_project.service.CustomerService;
import com.rohit.car_rental_api_spring_boot_project.service.RefreshTokenService;
import com.rohit.car_rental_api_spring_boot_project.service.RoleService;
import com.rohit.car_rental_api_spring_boot_project.service.TokenBlacklistService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

    private final CarOwnerService carOwnerService;
    private final RoleService roleService;
    private final CustomerService customerService;
    private final CustomerRepository customerRepository;
    private final CarOwnerRepository carOwnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final CookieUtils cookieUtils;
    private final RefreshTokenService refreshTokenService;
    private final TokenBlacklistService tokenBlacklistService;
    private final CloudinaryService cloudinaryService;
    private final CarRentalEmailService carRentalEmailService;

    @PostMapping("/registerCarOwner")
    public ResponseEntity<ApiResponse<Map<String, Object>>> registerCarOwner(@RequestBody @Valid CarOwnerRequestDTO dto) {
        CarOwnerResponseDTO responseDTO = carOwnerService.registerCarOwner(dto);
        CarOwner owner = carOwnerRepository.findByEmail(dto.getEmail().trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new RuntimeException("Error loading registered owner"));

        String role = "CAR_OWNER";
        String accessToken = jwtUtils.generateAccessToken(owner.getEmail(), role, owner.getId(), owner.getName());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(owner.getEmail(), role);

        ResponseCookie accessCookie = cookieUtils.createAccessTokenCookie(accessToken);
        ResponseCookie refreshCookie = cookieUtils.createRefreshTokenCookie(refreshToken.getToken());

        Map<String, Object> userData = buildUserMap(owner.getId(), owner.getName(), owner.getEmail(), role, owner.isBlocked(), owner.getVerificationStatus().toString(), owner.isVerified());

        // Send registration confirmation email to Car Owner
        carRentalEmailService.sendOwnerRegistrationReceivedEmail(owner.getEmail(), owner.getName());

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success("Car owner registered successfully. Awaiting Super Admin verification.", userData));
    }

    @PostMapping("/registerCustomer")
    public ResponseEntity<ApiResponse<Map<String, Object>>> registerCustomer(@RequestBody @Valid CustomerRequestDTO requestDTO) {
        customerService.registerCustomer(requestDTO);
        Customer customer = customerRepository.findByEmail(requestDTO.getEmail().trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new RuntimeException("Error loading registered customer"));

        String role = "CUSTOMER";
        String accessToken = jwtUtils.generateAccessToken(customer.getEmail(), role, customer.getId(), customer.getName());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(customer.getEmail(), role);

        ResponseCookie accessCookie = cookieUtils.createAccessTokenCookie(accessToken);
        ResponseCookie refreshCookie = cookieUtils.createRefreshTokenCookie(refreshToken.getToken());

        Map<String, Object> userData = buildUserMap(customer.getId(), customer.getName(), customer.getEmail(), role, customer.isBlocked(), "APPROVED", true);

        // Send welcome email to Customer
        carRentalEmailService.sendCustomerWelcomeEmail(customer.getEmail(), customer.getName());

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success("Customer registered successfully.", userData));
    }

    @PostMapping("/loginCarOwner")
    public ResponseEntity<ApiResponse<Map<String, Object>>> loginCarOwner(@RequestBody @Valid LoginRequestDTO requestDTO) {
        String email = requestDTO.getEmail().trim().toLowerCase(Locale.ROOT);
        CarOwner carOwner = carOwnerRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidEmailException("Invalid email address: " + email));

        if (carOwner.isBlocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Your Car Owner account has been suspended by the administrator."));
        }

        if (!passwordEncoder.matches(requestDTO.getPassword(), carOwner.getPassword())) {
            throw new InvalidPasswordException("Invalid password");
        }

        String role = "CAR_OWNER";
        String accessToken = jwtUtils.generateAccessToken(carOwner.getEmail(), role, carOwner.getId(), carOwner.getName());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(carOwner.getEmail(), role);

        ResponseCookie accessCookie = cookieUtils.createAccessTokenCookie(accessToken);
        ResponseCookie refreshCookie = cookieUtils.createRefreshTokenCookie(refreshToken.getToken());

        Map<String, Object> userData = buildUserMap(
                carOwner.getId(), carOwner.getName(), carOwner.getEmail(), role,
                carOwner.isBlocked(), carOwner.getVerificationStatus().toString(), carOwner.isVerified()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success("Car Owner logged in successfully", userData));
    }

    @PostMapping("/loginCustomer")
    public ResponseEntity<ApiResponse<Map<String, Object>>> loginCustomer(@RequestBody @Valid LoginRequestDTO requestDTO) {
        String email = requestDTO.getEmail().trim().toLowerCase(Locale.ROOT);
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidEmailException("Customer not found with email: " + email));

        if (customer.isBlocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Your customer account has been suspended by the administrator."));
        }

        if (!passwordEncoder.matches(requestDTO.getPassword(), customer.getPassword())) {
            throw new InvalidPasswordException("Invalid password");
        }

        String role = "CUSTOMER";
        String accessToken = jwtUtils.generateAccessToken(customer.getEmail(), role, customer.getId(), customer.getName());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(customer.getEmail(), role);

        ResponseCookie accessCookie = cookieUtils.createAccessTokenCookie(accessToken);
        ResponseCookie refreshCookie = cookieUtils.createRefreshTokenCookie(refreshToken.getToken());

        Map<String, Object> userData = buildUserMap(
                customer.getId(), customer.getName(), customer.getEmail(), role,
                customer.isBlocked(), "APPROVED", true
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success("Customer logged in successfully", userData));
    }

    @PostMapping("/loginSuperAdmin")
    public ResponseEntity<ApiResponse<Map<String, Object>>> loginSuperAdmin(@RequestBody @Valid LoginRequestDTO requestDTO) {
        String email = requestDTO.getEmail().trim().toLowerCase(Locale.ROOT);
        CarOwner admin = carOwnerRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidEmailException("Admin account not found with email: " + email));

        boolean isSuperAdmin = admin.getRoles().stream()
                .anyMatch(r -> "Role_SuperAdmin".equalsIgnoreCase(r.getName()) || "ROLE_SUPER_ADMIN".equalsIgnoreCase(r.getName()));

        if (!isSuperAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: You do not have Super Admin privileges."));
        }

        if (!passwordEncoder.matches(requestDTO.getPassword(), admin.getPassword())) {
            throw new InvalidPasswordException("Invalid admin credentials");
        }

        String role = "SUPER_ADMIN";
        String accessToken = jwtUtils.generateAccessToken(admin.getEmail(), role, admin.getId(), admin.getName());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(admin.getEmail(), role);

        ResponseCookie accessCookie = cookieUtils.createAccessTokenCookie(accessToken);
        ResponseCookie refreshCookie = cookieUtils.createRefreshTokenCookie(refreshToken.getToken());

        Map<String, Object> userData = buildUserMap(admin.getId(), admin.getName(), admin.getEmail(), role, false, "APPROVED", true);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success("Super Admin authenticated successfully", userData));
    }

    /**
     * Refresh Token Rotation (RTR) Endpoint
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refreshToken(HttpServletRequest request) {
        String rawRefreshToken = cookieUtils.extractTokenFromCookie(request, CookieUtils.REFRESH_TOKEN_COOKIE);

        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Refresh token cookie missing."));
        }

        try {
            RefreshToken rotatedToken = refreshTokenService.rotateRefreshToken(rawRefreshToken);
            String email = rotatedToken.getUserEmail();
            String role = rotatedToken.getRole();

            // Resolve user details
            Long userId = 0L;
            String name = email.split("@")[0];
            boolean isBlocked = false;
            String verificationStatus = "APPROVED";
            boolean isVerified = true;

            if ("CUSTOMER".equalsIgnoreCase(role)) {
                Customer c = customerRepository.findByEmail(email).orElse(null);
                if (c != null) {
                    userId = c.getId();
                    name = c.getName();
                    isBlocked = c.isBlocked();
                }
            } else {
                CarOwner o = carOwnerRepository.findByEmail(email).orElse(null);
                if (o != null) {
                    userId = o.getId();
                    name = o.getName();
                    isBlocked = o.isBlocked();
                    boolean isSuperAdmin = "SUPER_ADMIN".equalsIgnoreCase(role)
                            || "ROLE_SUPER_ADMIN".equalsIgnoreCase(role)
                            || "superadmin@carrental.com".equalsIgnoreCase(email)
                            || (o.getRoles() != null && o.getRoles().stream().anyMatch(r -> r.getName() != null && r.getName().toUpperCase(Locale.ROOT).contains("ADMIN")));
                    if (isSuperAdmin) {
                        role = "SUPER_ADMIN";
                        verificationStatus = "APPROVED";
                        isVerified = true;
                    } else {
                        role = "CAR_OWNER";
                        verificationStatus = o.getVerificationStatus() != null ? o.getVerificationStatus().toString() : "PENDING";
                        isVerified = o.isVerified();
                    }
                }
            }

            if (isBlocked) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("User account suspended."));
            }

            String newAccessToken = jwtUtils.generateAccessToken(email, role, userId, name);
            ResponseCookie newAccessCookie = cookieUtils.createAccessTokenCookie(newAccessToken);
            ResponseCookie newRefreshCookie = cookieUtils.createRefreshTokenCookie(rotatedToken.getToken());

            Map<String, Object> userData = buildUserMap(userId, name, email, role, isBlocked, verificationStatus, isVerified);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, newAccessCookie.toString())
                    .header(HttpHeaders.SET_COOKIE, newRefreshCookie.toString())
                    .body(ApiResponse.success("Tokens rotated successfully", userData));

        } catch (SecurityException se) {
            LOGGER.warn("Security Alert on Token Refresh: {}", se.getMessage());
            ResponseCookie cleanAccess = cookieUtils.cleanAccessTokenCookie();
            ResponseCookie cleanRefresh = cookieUtils.cleanRefreshTokenCookie();
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .header(HttpHeaders.SET_COOKIE, cleanAccess.toString())
                    .header(HttpHeaders.SET_COOKIE, cleanRefresh.toString())
                    .body(ApiResponse.error(se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Failed to refresh token: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request) {
        String accessToken = cookieUtils.extractTokenFromCookie(request, CookieUtils.ACCESS_TOKEN_COOKIE);
        String refreshToken = cookieUtils.extractTokenFromCookie(request, CookieUtils.REFRESH_TOKEN_COOKIE);

        if (accessToken != null) {
            tokenBlacklistService.blacklistToken(accessToken, "User logged out");
        }

        if (refreshToken != null) {
            refreshTokenService.findByToken(refreshToken).ifPresent(t -> {
                refreshTokenService.deleteByUserEmail(t.getUserEmail());
            });
        }

        ResponseCookie cleanAccess = cookieUtils.cleanAccessTokenCookie();
        ResponseCookie cleanRefresh = cookieUtils.cleanRefreshTokenCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanAccess.toString())
                .header(HttpHeaders.SET_COOKIE, cleanRefresh.toString())
                .body(ApiResponse.success("Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(HttpServletRequest request) {
        String accessToken = cookieUtils.extractTokenFromCookie(request, CookieUtils.ACCESS_TOKEN_COOKIE);

        if (accessToken == null || !jwtUtils.validateToken(accessToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        String email = jwtUtils.extractUsername(accessToken);
        String role = jwtUtils.extractRole(accessToken);

        if ("CUSTOMER".equalsIgnoreCase(role) || "Role_Customer".equalsIgnoreCase(role)) {
            Customer customer = customerRepository.findByEmail(email).orElse(null);
            if (customer != null) {
                Map<String, Object> data = buildUserMap(customer.getId(), customer.getName(), customer.getEmail(), "CUSTOMER", customer.isBlocked(), "APPROVED", true);
                return ResponseEntity.ok(ApiResponse.success("Current user profile", data));
            }
        } else {
            CarOwner owner = carOwnerRepository.findByEmail(email).orElse(null);
            if (owner != null) {
                boolean isSuperAdmin = "SUPER_ADMIN".equalsIgnoreCase(role)
                        || "ROLE_SUPER_ADMIN".equalsIgnoreCase(role)
                        || "superadmin@carrental.com".equalsIgnoreCase(email)
                        || (owner.getRoles() != null && owner.getRoles().stream().anyMatch(r -> r.getName() != null && r.getName().toUpperCase(Locale.ROOT).contains("ADMIN")));
                String effectiveRole = isSuperAdmin ? "SUPER_ADMIN" : "CAR_OWNER";
                String verificationStatus = isSuperAdmin ? "APPROVED" : (owner.getVerificationStatus() != null ? owner.getVerificationStatus().toString() : "PENDING");
                boolean isVerified = isSuperAdmin || owner.isVerified();

                Map<String, Object> data = buildUserMap(owner.getId(), owner.getName(), owner.getEmail(), effectiveRole, owner.isBlocked(), verificationStatus, isVerified);
                return ResponseEntity.ok(ApiResponse.success("Current user profile", data));
            }
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found"));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = cloudinaryService.uploadImage(file, "images");
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", Map.of("url", imageUrl)));
    }

    @PostMapping("/saveRole")
    public Role saveRoleService(@RequestBody Role role) {
        return roleService.saveRoleService(role);
    }

    private Map<String, Object> buildUserMap(Long id, String name, String email, String role, boolean isBlocked, String verificationStatus, boolean isVerified) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("name", name);
        map.put("email", email);
        map.put("role", role);
        map.put("isBlocked", isBlocked);
        map.put("verificationStatus", verificationStatus);
        map.put("isVerified", isVerified);
        return map;
    }
}
