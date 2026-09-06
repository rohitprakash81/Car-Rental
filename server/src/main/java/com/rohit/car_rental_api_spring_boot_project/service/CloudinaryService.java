package com.rohit.car_rental_api_spring_boot_project.service;

import java.io.IOException;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import jakarta.annotation.PostConstruct;

@Service
public class CloudinaryService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CloudinaryService.class);

    @Value("${cloudinary.cloud-name:demo-cloud}")
    private String cloudName;

    @Value("${cloudinary.api-key:123456789012345}")
    private String apiKey;

    @Value("${cloudinary.api-secret:placeholderApiSecret}")
    private String apiSecret;

    private Cloudinary cloudinary;
    private boolean isConfigured = false;

    @PostConstruct
    public void init() {
        try {
            if (!"demo-cloud".equals(cloudName) && !"123456789012345".equals(apiKey)) {
                cloudinary = new Cloudinary(ObjectUtils.asMap(
                        "cloud_name", cloudName,
                        "api_key", apiKey,
                        "api_secret", apiSecret
                ));
                isConfigured = true;
                LOGGER.info("Cloudinary successfully configured for cloud: {}", cloudName);
            } else {
                LOGGER.info("Cloudinary using default demo settings. Production uploads will use fallback URL generation.");
            }
        } catch (Exception e) {
            LOGGER.error("Error initializing Cloudinary: {}", e.getMessage());
        }
    }

    public String uploadImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        if (isConfigured && cloudinary != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap("folder", "car-rental/" + folder)
                );
                return (String) uploadResult.get("secure_url");
            } catch (IOException e) {
                LOGGER.error("Failed to upload image to Cloudinary: {}", e.getMessage());
                throw new RuntimeException("Image upload failed: " + e.getMessage());
            }
        }

        // Fallback for dev/testing when Cloudinary keys are not yet provided
        String originalFilename = file.getOriginalFilename();
        String safeName = (originalFilename != null) ? originalFilename.replaceAll("\\s+", "_") : "vehicle.jpg";
        LOGGER.info("Using simulated Cloudinary URL for: {}", safeName);
        return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80";
    }
}
