package com.ddfinance.backend.service.notification;

import com.ddfinance.core.domain.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Stub implementation of NotificationService.
 * TODO: Implement actual email/SMS/in-app notification functionality
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Override
    public void notifyAdminsOfUpgradeRequest(GuestUpgradeRequest upgradeRequest) {
        // TODO: Implement email notification to admins
        logger.info("Notifying admins of upgrade request from: {}",
                upgradeRequest.getUserAccount().getEmail());
    }

    @Override
    public void notifySalesTeamOfContact(ContactRequest contactRequest) {
        // TODO: Implement notification to sales team
        logger.info("Notifying sales team of contact from: {}", contactRequest.getEmail());
    }

    @Override
    public void sendNotification(String userEmail, String subject, String message) {
        // TODO: Implement generic notification sending
        logger.info("Sending notification to {}: {} - {}", userEmail, subject, message);
    }

    @Override
    public void sendEmail(String toEmail, String subject, String body) {
        // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
        logger.info("Sending email to {}: {}", toEmail, subject);
    }

    @Override
    public void createInAppNotification(Long userId, String type, String message) {
        // TODO: Create in-app notification in database
        logger.info("Creating in-app notification for user {}: {} - {}", userId, type, message);
    }

    @Override
    public void notifyClientOfInvestment(Client client, Investment investment) {
        // TODO: Implement investment notification
        logger.info("Notifying client {} of investment: {}",
                client.getClientEmail(), investment.getTickerSymbol());
    }

    @Override
    public void sendPasswordResetNotification(UserAccount user, String temporaryPassword) {
        // TODO: Send password reset email
        logger.info("Sending password reset to {}", user.getEmail());
    }

    @Override
    public void broadcastMaintenanceNotification(boolean maintenanceEnabled) {
        // TODO: Broadcast to all active users
        logger.info("Broadcasting maintenance mode: {}", maintenanceEnabled);
    }

    @Override
    public void sendEmployeeWelcomeEmail(UserAccount employee, String temporaryPassword) {
        // TODO: Send welcome email with credentials
        logger.info("Sending welcome email to new employee: {}", employee.getEmail());
    }

    @Override
    public void notifyUserOfUpgradeApproval(UserAccount user) {
        // TODO: Send upgrade approval notification
        logger.info("Notifying {} of upgrade approval", user.getEmail());
    }

    @Override
    public void notifyUserOfUpgradeRejection(UserAccount user, String reason) {
        // TODO: Send upgrade rejection notification
        logger.info("Notifying {} of upgrade rejection: {}", user.getEmail(), reason);
    }
}
