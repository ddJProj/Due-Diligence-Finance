package com.ddfinance.backend.service.notification;

import com.ddfinance.backend.repository.NotificationTemplateRepository;
import com.ddfinance.core.domain.*;
import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Implementation of NotificationService.
 * Handles email and in-app notifications for various system events.
 *
 * TODO: Add spring-boot-starter-mail dependency to enable actual email sending
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final UserAccountRepository userAccountRepository;
    private final NotificationTemplateRepository templateRepository;

    @Value("${spring.mail.username:noreply@ddfinance.com}")
    private String fromEmail;

    @Value("${app.name:Due Diligence Finance}")
    private String appName;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");

    @Override
    public void notifyAdminsOfUpgradeRequest(GuestUpgradeRequest upgradeRequest) {
        log.debug("Notifying admins of upgrade request from: {}",
                upgradeRequest.getUserAccount().getEmail());

        List<UserAccount> admins = userAccountRepository.findByRole(Role.ADMIN);

        String subject = "New Upgrade Request - Action Required";
        String message = String.format(
                "A new upgrade request has been submitted:\n\n" +
                "User: %s %s\n" +
                "Email: %s\n" +
                "Request Date: %s\n\n" +
                "Please review this request in the admin panel.",
                upgradeRequest.getUserAccount().getFirstName(),
                upgradeRequest.getUserAccount().getLastName(),
                upgradeRequest.getUserAccount().getEmail(),
                upgradeRequest.getRequestDate().format(DATE_FORMATTER)
        );

        for (UserAccount admin : admins) {
            sendEmail(admin.getEmail(), subject, message);
            createInAppNotification(admin.getId(), "UPGRADE_REQUEST",
                    "New upgrade request from " + upgradeRequest.getUserAccount().getEmail());
        }
    }

    @Override
    public void notifySalesTeamOfContact(ContactRequest contactRequest) {
        log.debug("Notifying sales team of contact request from: {}", contactRequest.getEmail());

        List<UserAccount> salesTeam = userAccountRepository.findByRole(Role.EMPLOYEE);

        String subject = "New Contact Request - Sales Lead";
        String message = String.format(
                "A new contact request has been received:\n\n" +
                "Name: %s\n" +
                "Email: %s\n" +
                "Phone: %s\n" +
                "Message: %s\n\n" +
                "Please follow up with this lead promptly.",
                contactRequest.getName(),
                contactRequest.getEmail(),
                contactRequest.getPhone() != null ? contactRequest.getPhone() : "Not provided",
                contactRequest.getMessage()
        );

        for (UserAccount employee : salesTeam) {
            sendEmail(employee.getEmail(), subject, message);
        }
    }

    @Override
    public void sendNotification(String userEmail, String subject, String message) {
        log.debug("Sending notification to: {}", userEmail);
        sendEmail(userEmail, subject, message);
    }

    @Override
    public void sendEmail(String toEmail, String subject, String body) {
        // TODO: Implement actual email sending once spring-boot-starter-mail is added
        // For now, just log the email
        log.info("EMAIL NOTIFICATION:");
        log.info("  From: {}", fromEmail);
        log.info("  To: {}", toEmail);
        log.info("  Subject: {}", subject);
        log.info("  Body: {}", body);
        log.info("-------------------");

        // In production, this would use JavaMailSender:
        /*
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
        */
    }

    @Override
    public void createInAppNotification(Long userId, String type, String message) {
        log.debug("Creating in-app notification for user {}: {}", userId, type);
        // TODO: Implement in-app notification storage when notification entity is created
        log.info("IN-APP NOTIFICATION - User: {}, Type: {}, Message: {}",
                userId, type, message);
    }

    @Override
    public void notifyClientOfInvestment(Client client, Investment investment) {
        log.debug("Notifying client {} of new investment {}",
                client.getClientId(), investment.getInvestmentId());

        String subject = "New Investment Created - " + investment.getTickerSymbol();
        String message = String.format(
                "Dear %s %s,\n\n" +
                "A new investment has been created in your portfolio:\n\n" +
                "Stock: %s (%s)\n" +
                "Shares: %s\n" +
                "Purchase Price: $%.2f per share\n" +
                "Total Investment: $%.2f\n" +
                "Investment ID: %s\n\n" +
                "You can view the details in your portfolio dashboard.\n\n" +
                "Best regards,\n%s Team",
                client.getUserAccount().getFirstName(),
                client.getUserAccount().getLastName(),
                investment.getName(),
                investment.getTickerSymbol(),
                investment.getShares(),
                investment.getPurchasePricePerShare(),
                investment.getAmount(),
                investment.getInvestmentId(),
                appName
        );

        sendEmail(client.getUserAccount().getEmail(), subject, message);
        createInAppNotification(client.getUserAccount().getId(), "NEW_INVESTMENT",
                "New investment in " + investment.getTickerSymbol());
    }

    @Override
    public void sendPasswordResetNotification(UserAccount user, String temporaryPassword) {
        log.debug("Sending password reset notification to: {}", user.getEmail());

        String subject = appName + " - Password Reset";
        String message = String.format(
                "Dear %s %s,\n\n" +
                "Your password has been reset. Your temporary password is:\n\n" +
                "%s\n\n" +
                "Please log in and change your password immediately.\n\n" +
                "If you did not request this password reset, please contact support immediately.\n\n" +
                "Best regards,\n%s Security Team",
                user.getFirstName(),
                user.getLastName(),
                temporaryPassword,
                appName
        );

        sendEmail(user.getEmail(), subject, message);
    }

    @Override
    public void broadcastMaintenanceNotification(boolean maintenanceEnabled) {
        log.info("Broadcasting maintenance notification - Enabled: {}", maintenanceEnabled);

        List<UserAccount> activeUsers = userAccountRepository.findByActiveTrue();

        String subject = appName + " - System Maintenance " +
                (maintenanceEnabled ? "Starting" : "Completed");

        String message = maintenanceEnabled
                ? "Dear User,\n\nOur system will be undergoing scheduled maintenance shortly. " +
                  "The platform may be temporarily unavailable. We apologize for any inconvenience.\n\n" +
                  "Thank you for your patience."
                : "Dear User,\n\nSystem maintenance has been completed. " +
                  "All services are now fully operational.\n\n" +
                  "Thank you for your patience.";

        for (UserAccount user : activeUsers) {
            sendEmail(user.getEmail(), subject, message);
            createInAppNotification(user.getId(), "SYSTEM_MAINTENANCE",
                    maintenanceEnabled ? "System maintenance starting" : "System maintenance completed");
        }
    }

    @Override
    public void sendEmployeeWelcomeEmail(UserAccount employee, String temporaryPassword) {
        log.debug("Sending welcome email to new employee: {}", employee.getEmail());

        String subject = "Welcome to " + appName + " Team!";
        String message = String.format(
                "Dear %s %s,\n\n" +
                "Welcome to the %s team! We're excited to have you join us.\n\n" +
                "Your employee account has been created with the following credentials:\n" +
                "Email: %s\n" +
                "Temporary Password: %s\n\n" +
                "Please log in at your earliest convenience and change your password.\n\n" +
                "You will find the following resources helpful:\n" +
                "- Employee Handbook: Available in the employee portal\n" +
                "- Training Materials: Under the 'Resources' section\n" +
                "- Support: Contact IT at support@ddfinance.com\n\n" +
                "We look forward to working with you!\n\n" +
                "Best regards,\n%s HR Team",
                employee.getFirstName(),
                employee.getLastName(),
                appName,
                employee.getEmail(),
                temporaryPassword,
                appName
        );

        sendEmail(employee.getEmail(), subject, message);
    }

    @Override
    public void notifyUserOfUpgradeApproval(UserAccount user) {
        log.debug("Notifying user of upgrade approval: {}", user.getEmail());

        String subject = appName + " - Upgrade Request Approved";
        String message = String.format(
                "Dear %s %s,\n\n" +
                "Great news! Your request to upgrade to a Client account has been approved.\n\n" +
                "You now have access to:\n" +
                "- Full investment portfolio management\n" +
                "- Direct communication with your assigned financial advisor\n" +
                "- Real-time portfolio tracking and performance metrics\n" +
                "- Tax documentation and reporting\n\n" +
                "Your assigned financial advisor will contact you shortly to discuss your investment goals.\n\n" +
                "Welcome to %s!\n\n" +
                "Best regards,\n%s Team",
                user.getFirstName(),
                user.getLastName(),
                appName,
                appName
        );

        sendEmail(user.getEmail(), subject, message);
        createInAppNotification(user.getId(), "UPGRADE_APPROVED",
                "Your upgrade request has been approved!");
    }

    @Override
    public void notifyUserOfUpgradeRejection(UserAccount user, String reason) {
        log.debug("Notifying user of upgrade rejection: {}", user.getEmail());

        String subject = appName + " - Upgrade Request Update";
        String message = String.format(
                "Dear %s %s,\n\n" +
                "Thank you for your interest in upgrading to a Client account.\n\n" +
                "After reviewing your application, we are unable to approve your request at this time.\n\n" +
                "Reason: %s\n\n" +
                "You may submit a new request once you have addressed the above concerns. " +
                "If you have questions or need clarification, please contact our support team.\n\n" +
                "We appreciate your understanding and look forward to working with you in the future.\n\n" +
                "Best regards,\n%s Team",
                user.getFirstName(),
                user.getLastName(),
                reason,
                appName
        );

        sendEmail(user.getEmail(), subject, message);
        createInAppNotification(user.getId(), "UPGRADE_REJECTED",
                "Your upgrade request needs additional information");
    }
}