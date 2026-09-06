package com.rohit.car_rental_api_spring_boot_project.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class CarRentalEmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CarRentalEmailService.class);

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (javaMailSender == null) {
            LOGGER.warn("JavaMailSender not configured. Email to {} skipped: {}", to, subject);
            return;
        }

        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);
            LOGGER.info("Email sent successfully to {}: {}", to, subject);
        } catch (Exception e) {
            LOGGER.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildTemplate(String title, String badgeText, String badgeColor, String bodyHtml) {
        return "<!DOCTYPE html><html><body style=\"font-family:'Segoe UI',Arial,sans-serif; background-color:#0f172a; color:#f8fafc; padding:30px;\">"
                + "<div style=\"max-width:600px; margin:0 auto; background:#1e293b; border-radius:16px; border:1px solid #334155; padding:32px; box-shadow:0 10px 25px rgba(0,0,0,0.3);\">"
                + "<div style=\"display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:16px; margin-bottom:24px;\">"
                + "<h2 style=\"margin:0; color:#38bdf8; font-size:22px;\">Drive<span style=\"color:#818cf8;\">Prime</span></h2>"
                + "<span style=\"background:" + badgeColor + "; color:#ffffff; font-size:11px; font-weight:bold; padding:4px 12px; border-radius:20px;\">" + badgeText + "</span>"
                + "</div>"
                + "<h3 style=\"margin-top:0; color:#ffffff; font-size:18px;\">" + title + "</h3>"
                + bodyHtml
                + "<div style=\"margin-top:32px; border-top:1px solid #334155; padding-top:16px; font-size:12px; color:#94a3b8; text-align:center;\">"
                + "© 2026 DrivePrime Car Rentals. Automated notification, please do not reply directly."
                + "</div>"
                + "</div>"
                + "</body></html>";
    }

    @Async
    public void sendBookingRequestEmail(String ownerEmail, String customerName, String vehicleNumber, String date, String route) {
        String body = "<p style=\"color:#cbd5e1; font-size:14px; line-height:1.6;\">Hello Car Owner,<br><br>"
                + "You have received a new booking request from <strong>" + customerName + "</strong>.</p>"
                + "<div style=\"background:#0f172a; padding:16px; border-radius:10px; margin:20px 0; border:1px solid #334155;\">"
                + "<p style=\"margin:6px 0; color:#cbd5e1;\">🚗 <strong>Vehicle:</strong> " + vehicleNumber + "</p>"
                + "<p style=\"margin:6px 0; color:#cbd5e1;\">📅 <strong>Journey Date:</strong> " + date + "</p>"
                + "<p style=\"margin:6px 0; color:#cbd5e1;\">📍 <strong>Route:</strong> " + route + "</p>"
                + "</div>"
                + "<p style=\"color:#94a3b8; font-size:13px;\">Please log in to your Owner Portal to Accept or Reject this booking.</p>";

        sendHtmlEmail(ownerEmail, "New Booking Request - " + vehicleNumber, buildTemplate("New Booking Request", "PENDING ACTION", "#eab308", body));
    }

    @Async
    public void sendBookingDecisionEmail(String customerEmail, String customerName, String vehicleNumber, boolean accepted) {
        if (accepted) {
            String body = "<p style=\"color:#cbd5e1; font-size:14px; line-height:1.6;\">Hello " + customerName + ",<br><br>"
                    + "Great news! The car owner has <strong style=\"color:#4ade80;\">ACCEPTED</strong> your booking request for vehicle <strong>" + vehicleNumber + "</strong>.</p>"
                    + "<p style=\"color:#cbd5e1; font-size:14px;\">Please proceed to your dashboard and complete payment via Razorpay to confirm your reservation.</p>";

            sendHtmlEmail(customerEmail, "Booking Accepted! Complete Payment - " + vehicleNumber, buildTemplate("Booking Accepted", "PAYMENT DUE", "#10b981", body));
        } else {
            String body = "<p style=\"color:#cbd5e1; font-size:14px; line-height:1.6;\">Hello " + customerName + ",<br><br>"
                    + "We regret to inform you that the owner was unable to accept your booking for vehicle <strong>" + vehicleNumber + "</strong>.</p>"
                    + "<p style=\"color:#cbd5e1; font-size:14px;\">You may explore other available vehicles for your travel dates.</p>";

            sendHtmlEmail(customerEmail, "Booking Update - " + vehicleNumber, buildTemplate("Booking Declined", "DECLINED", "#ef4444", body));
        }
    }

    @Async
    public void sendPaymentSuccessEmail(String customerEmail, String customerName, String vehicleNumber, Double amount, String paymentId) {
        String body = "<p style=\"color:#cbd5e1; font-size:14px; line-height:1.6;\">Hello " + customerName + ",<br><br>"
                + "Your payment has been successfully processed! Your trip is now <strong style=\"color:#4ade80;\">CONFIRMED</strong>.</p>"
                + "<div style=\"background:#0f172a; padding:16px; border-radius:10px; margin:20px 0; border:1px solid #334155;\">"
                + "<p style=\"margin:6px 0; color:#cbd5e1;\">🚗 <strong>Vehicle:</strong> " + vehicleNumber + "</p>"
                + "<p style=\"margin:6px 0; color:#cbd5e1;\">💳 <strong>Amount Paid:</strong> ₹" + amount + "</p>"
                + "<p style=\"margin:6px 0; color:#cbd5e1;\">🧾 <strong>Transaction ID:</strong> " + paymentId + "</p>"
                + "</div>"
                + "<p style=\"color:#94a3b8; font-size:13px;\">Have a safe and pleasant journey with DrivePrime!</p>";

        sendHtmlEmail(customerEmail, "Booking Confirmed & Payment Receipt - " + vehicleNumber, buildTemplate("Payment Received", "CONFIRMED", "#10b981", body));
    }

    @Async
    public void sendOwnerVerificationEmail(String ownerEmail, String ownerName, boolean approved, String reason) {
        if (approved) {
            String body = "<p style=\"color:#cbd5e1; font-size:14px; line-height:1.6;\">Congratulations " + ownerName + ",<br><br>"
                    + "Your Car Owner account has been <strong style=\"color:#4ade80;\">VERIFIED & APPROVED</strong> by the Super Admin.</p>"
                    + "<p style=\"color:#cbd5e1; font-size:14px;\">You can now list vehicles, set pricing, and start accepting customer bookings!</p>";

            sendHtmlEmail(ownerEmail, "Account Approved - DrivePrime", buildTemplate("Account Verified", "APPROVED", "#10b981", body));
        } else {
            String body = "<p style=\"color:#cbd5e1; font-size:14px; line-height:1.6;\">Hello " + ownerName + ",<br><br>"
                    + "Your Car Owner verification was not approved.</p>"
                    + "<p style=\"color:#f87171;\"><strong>Reason:</strong> " + (reason != null ? reason : "Documentation criteria not met.") + "</p>";

            sendHtmlEmail(ownerEmail, "Account Verification Update - DrivePrime", buildTemplate("Verification Declined", "REJECTED", "#ef4444", body));
        }
    }

    @Async
    public void sendCarApprovalEmail(String ownerEmail, String vehicleNumber, boolean approved, String reason) {
        if (approved) {
            String body = "<p style=\"color:#cbd5e1; font-size:14px; line-height:1.6;\">Hello,<br><br>"
                    + "Your vehicle <strong>" + vehicleNumber + "</strong> has been <strong style=\"color:#4ade80;\">APPROVED</strong> by the Super Admin.</p>"
                    + "<p style=\"color:#cbd5e1; font-size:14px;\">It is now live in the fleet catalog for customer rentals.</p>";

            sendHtmlEmail(ownerEmail, "Vehicle Approved: " + vehicleNumber, buildTemplate("Vehicle Live", "APPROVED", "#10b981", body));
        } else {
            String body = "<p style=\"color:#cbd5e1; font-size:14px; line-height:1.6;\">Hello,<br><br>"
                    + "Your vehicle listing <strong>" + vehicleNumber + "</strong> was rejected by the Super Admin.</p>"
                    + "<p style=\"color:#f87171;\"><strong>Reason:</strong> " + (reason != null ? reason : "RC / Insurance validation failed.") + "</p>";

            sendHtmlEmail(ownerEmail, "Vehicle Listing Update: " + vehicleNumber, buildTemplate("Vehicle Rejected", "REJECTED", "#ef4444", body));
        }
    }

    @Async
    public void sendUserBlockedEmail(String userEmail, String reason) {
        String body = "<p style=\"color:#cbd5e1; font-size:14px; line-height:1.6;\">Hello,<br><br>"
                + "Your DrivePrime account has been suspended by the administrator.</p>"
                + "<p style=\"color:#f87171;\"><strong>Reason:</strong> " + (reason != null ? reason : "Policy violation.") + "</p>"
                + "<p style=\"color:#94a3b8; font-size:13px;\">Please contact support if you believe this is an error.</p>";

        sendHtmlEmail(userEmail, "Account Suspension Notice - DrivePrime", buildTemplate("Account Suspended", "SUSPENDED", "#ef4444", body));
    }

    @Async
    public void sendCustomerWelcomeEmail(String customerEmail, String customerName) {
        String body = "<p style=\"color:#cbd5e1; font-size:14px; line-height:1.6;\">Welcome to DrivePrime, <strong>" + customerName + "</strong>! 🎉<br><br>"
                + "Thank you for creating an account with us. Your registration is complete and your account is ready to use.</p>"
                + "<div style=\"background:#0f172a; padding:16px; border-radius:10px; margin:20px 0; border:1px solid #334155;\">"
                + "<p style=\"margin:6px 0; color:#38bdf8;\">✨ <strong>Browse Premium Fleet:</strong> Explore verified SUVs, sedans, and luxury cars.</p>"
                + "<p style=\"margin:6px 0; color:#38bdf8;\">⚡ <strong>Instant Booking:</strong> Seamless reservations with real-time status updates.</p>"
                + "<p style=\"margin:6px 0; color:#38bdf8;\">🔒 <strong>Secure Payments:</strong> Powered by Razorpay with instant digital receipts.</p>"
                + "</div>"
                + "<p style=\"color:#94a3b8; font-size:13px;\">Ready to hit the road? Log in to your account and book your first ride today!</p>";

        sendHtmlEmail(customerEmail, "Welcome to DrivePrime - Account Created Successfully! 🎉", buildTemplate("Welcome Aboard!", "ACCOUNT ACTIVE", "#10b981", body));
    }

    @Async
    public void sendOwnerRegistrationReceivedEmail(String ownerEmail, String ownerName) {
        String body = "<p style=\"color:#cbd5e1; font-size:14px; line-height:1.6;\">Welcome to DrivePrime Partner Community, <strong>" + ownerName + "</strong>! 🚗<br><br>"
                + "We have successfully received your Car Owner registration details.</p>"
                + "<div style=\"background:#0f172a; padding:16px; border-radius:10px; margin:20px 0; border:1px solid #334155;\">"
                + "<p style=\"margin:6px 0; color:#cbd5e1;\">📋 <strong>Status:</strong> <span style=\"color:#eab308; font-weight:bold;\">UNDER VERIFICATION</span></p>"
                + "<p style=\"margin:6px 0; color:#cbd5e1;\">🔍 <strong>Next Step:</strong> Our Super Admin team is reviewing your profile and credentials.</p>"
                + "<p style=\"margin:6px 0; color:#cbd5e1;\">⏱️ <strong>Estimated Time:</strong> Approvals are typically completed within 24 hours.</p>"
                + "</div>"
                + "<p style=\"color:#94a3b8; font-size:13px;\">As soon as your account is verified by the Super Admin, you will receive an approval confirmation and can begin listing your vehicles.</p>";

        sendHtmlEmail(ownerEmail, "Car Owner Registration Received - DrivePrime", buildTemplate("Registration Under Review", "PENDING VERIFICATION", "#eab308", body));
    }
}
