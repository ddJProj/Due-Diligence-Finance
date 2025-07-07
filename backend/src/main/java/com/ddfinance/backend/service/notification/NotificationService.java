package com.ddfinance.backend.service.notification;

import com.ddfinance.core.domain.Client;
import com.ddfinance.core.domain.ContactRequest;
import com.ddfinance.core.domain.GuestUpgradeRequest;
import com.ddfinance.core.domain.Investment;
import com.ddfinance.core.domain.UserAccount;

/**
 * Service interface for handling system notifications.
 * Manages email and in-app notifications for various events.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface NotificationService {

    /**
     * Notifies administrators of a new guest upgrade request.
     *
     * @param upgradeRequest The upgrade request to notify about
     */
    void notifyAdminsOfUpgradeRequest(GuestUpgradeRequest upgradeRequest);

    /**
     * Notifies the sales team of a new contact request.
     *
     * @param contactRequest The contact request to notify about
     */
    void notifySalesTeamOfContact(ContactRequest contactRequest);

    /**
     * Sends a notification to a specific user.
     *
     * @param userEmail The recipient's email
     * @param subject The notification subject
     * @param message The notification message
     */
    void sendNotification(String userEmail, String subject, String message);

    /**
     * Sends an email notification.
     *
     * @param toEmail The recipient's email
     * @param subject The email subject
     * @param body The email body
     */
    void sendEmail(String toEmail, String subject, String body);

    /**
     * Creates an in-app notification.
     *
     * @param userId The recipient's user ID
     * @param type The notification type
     * @param message The notification message
     */
    void createInAppNotification(Long userId, String type, String message);

    /**
     * Notifies client of a new investment.
     *
     * @param client The client to notify
     * @param investment The new investment
     */
    void notifyClientOfInvestment(Client client, Investment investment);

    /**
     * Sends a password reset notification with temporary password.
     *
     * @param user The user to notify
     * @param temporaryPassword The temporary password
     */
    void sendPasswordResetNotification(UserAccount user, String temporaryPassword);

    /**
     * Broadcasts maintenance mode notification to all active users.
     *
     * @param maintenanceEnabled True if maintenance mode is being enabled
     */
    void broadcastMaintenanceNotification(boolean maintenanceEnabled);

    /**
     * Sends welcome email to new employee.
     *
     * @param employee The new employee
     * @param temporaryPassword The temporary password
     */
    void sendEmployeeWelcomeEmail(UserAccount employee, String temporaryPassword);

    /**
     * Notifies user of upgrade request approval.
     *
     * @param user The user whose request was approved
     */
    void notifyUserOfUpgradeApproval(UserAccount user);

    /**
     * Notifies user of upgrade request rejection.
     *
     * @param user The user whose request was rejected
     * @param reason The rejection reason
     */
    void notifyUserOfUpgradeRejection(UserAccount user, String reason);
}
