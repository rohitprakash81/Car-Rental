package com.ansari.car_rental_api_spring_boot_project.mail;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class CarRentalEmailService {

	@Autowired
	private JavaMailSender javaMailSender;
	
    public void sendBookingRequestEmail(
            String ownerEmail,
            String customerName,
            String vehicleNumber) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(ownerEmail);
        message.setSubject("New Car Booking Request");

        message.setText(
                "Hello,\n\n"
                + "You have received a new booking request.\n\n"
                + "Customer: " + customerName + "\n"
                + "Vehicle Number: " + vehicleNumber + "\n\n"
                + "Please login to your car rental application "
                + "and accept or reject the booking.\n\n"
                + "Regards,\n"
                + "Car Rental Team"
        );

        javaMailSender.send(message);
    }

    public void sendBookingConfirmedEmail(
            String customerEmail,
            String customerName,
            String vehicleNumber) {
    	SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(customerEmail);
        message.setSubject("Car Booking Confirmed");

        message.setText(
                "Hello " + customerName + ",\n\n"
                + "Your car booking has been confirmed successfully.\n\n"
                + "Vehicle Number: " + vehicleNumber + "\n\n"
                + "Thank you for choosing our car rental service.\n\n"
                + "Regards,\n"
                + "Car Rental Team"
        );

        javaMailSender.send(message);
    }
}
