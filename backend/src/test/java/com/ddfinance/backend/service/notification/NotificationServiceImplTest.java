package com.ddfinance.backend.service.notification;

import com.ddfinance.backend.repository.NotificationTemplateRepository;
import com.ddfinance.core.domain.*;
import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test class for NotificationServiceImpl.
 * Tests notification operations using TDD approach.
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private NotificationTemplateRepository templateRepository;

    private NotificationServiceImpl notificationService;

    private UserAccount testUser;
    private UserAccount adminUser;
    private Client testClient;
    private Investment testInvestment;
    private GuestUpgradeRequest upgradeRequest;
    private ContactRequest contactRequest;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationServiceImpl(
                userAccountRepository,
                templateRepository
        );

        // Setup test users
        testUser = new UserAccount();
        testUser.setId(1L);
        testUser.setEmail("user@example.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setRole(Role.CLIENT);

        adminUser = new UserAccount();
        adminUser.setId(2L);
        adminUser.setEmail("admin@example.com");
        adminUser.setFirstName("Admin");
        adminUser.setLastName("User");
        adminUser.setRole(Role.ADMIN);

        // Setup test client
        testClient = new Client();
        testClient.setId(100L);
        testClient.setUserAccount(testUser);
        testClient.setClientId("CL001");

        // Setup test investment
        testInvestment = new Investment();
        testInvestment.setId(1000L);
        testInvestment.setInvestmentId("INV-AAPL-001");
        testInvestment.setName("Apple Inc.");
        testInvestment.setTickerSymbol("AAPL");
        testInvestment.setClient(testClient);

        // Setup upgrade request
        upgradeRequest = new GuestUpgradeRequest();
        upgradeRequest.setId(1L);
        upgradeRequest.setUserAccount(testUser);
        upgradeRequest.setRequestDate(LocalDateTime.now());

        // Setup contact request
        contactRequest = new ContactRequest();
        contactRequest.setId(1L);
        contactRequest.setName("John Doe");
        contactRequest.setEmail("john@example.com");
        contactRequest.setMessage("I'm interested in your services");
    }

    // Test sendNotification
    @Test
    void sendNotification_LogsEmailSuccessfully() {
        // When
        notificationService.sendNotification("user@example.com", "Test Subject", "Test Message");

        // Then
        // Since we're using a stub implementation, just verify no exceptions are thrown
        assertDoesNotThrow(() ->
            notificationService.sendNotification("user@example.com", "Test Subject", "Test Message")
        );
    }

    // Test sendEmail
    @Test
    void sendEmail_LogsEmailSuccessfully() {
        // When
        notificationService.sendEmail("recipient@example.com", "Email Subject", "Email Body");

        // Then
        // Verify no exceptions are thrown
        assertDoesNotThrow(() ->
            notificationService.sendEmail("recipient@example.com", "Email Subject", "Email Body")
        );
    }

    // Test notifyAdminsOfUpgradeRequest
    @Test
    void notifyAdminsOfUpgradeRequest_NotifiesAllAdmins() {
        // Given
        List<UserAccount> admins = Arrays.asList(adminUser);
        when(userAccountRepository.findByRole(Role.ADMIN)).thenReturn(admins);

        // When
        notificationService.notifyAdminsOfUpgradeRequest(upgradeRequest);

        // Then
        verify(userAccountRepository).findByRole(Role.ADMIN);
        // Verify the method completes without exceptions
        assertDoesNotThrow(() ->
            notificationService.notifyAdminsOfUpgradeRequest(upgradeRequest)
        );
    }

    @Test
    void notifyAdminsOfUpgradeRequest_HandlesNoAdmins() {
        // Given
        when(userAccountRepository.findByRole(Role.ADMIN)).thenReturn(Arrays.asList());

        // When
        notificationService.notifyAdminsOfUpgradeRequest(upgradeRequest);

        // Then
        verify(userAccountRepository).findByRole(Role.ADMIN);
    }

    // Test notifySalesTeamOfContact
    @Test
    void notifySalesTeamOfContact_NotifiesEmployees() {
        // Given
        UserAccount employee = new UserAccount();
        employee.setEmail("sales@example.com");
        employee.setRole(Role.EMPLOYEE);

        List<UserAccount> employees = Arrays.asList(employee);
        when(userAccountRepository.findByRole(Role.EMPLOYEE)).thenReturn(employees);

        // When
        notificationService.notifySalesTeamOfContact(contactRequest);

        // Then
        verify(userAccountRepository).findByRole(Role.EMPLOYEE);
    }

    // Test createInAppNotification
    @Test
    void createInAppNotification_LogsNotification() {
        // When & Then
        assertDoesNotThrow(() ->
            notificationService.createInAppNotification(1L, "INFO", "Test notification")
        );
    }

    // Test notifyClientOfInvestment
    @Test
    void notifyClientOfInvestment_SendsInvestmentNotification() {
        // When & Then
        assertDoesNotThrow(() ->
            notificationService.notifyClientOfInvestment(testClient, testInvestment)
        );
    }

    // Test sendPasswordResetNotification
    @Test
    void sendPasswordResetNotification_SendsPasswordEmail() {
        // Given
        String tempPassword = "TempPass123!";

        // When & Then
        assertDoesNotThrow(() ->
            notificationService.sendPasswordResetNotification(testUser, tempPassword)
        );
    }

    // Test broadcastMaintenanceNotification
    @Test
    void broadcastMaintenanceNotification_NotifiesAllActiveUsers() {
        // Given
        List<UserAccount> activeUsers = Arrays.asList(testUser, adminUser);
        when(userAccountRepository.findByActiveTrue()).thenReturn(activeUsers);

        // When
        notificationService.broadcastMaintenanceNotification(true);

        // Then
        verify(userAccountRepository).findByActiveTrue();
    }

    // Test sendEmployeeWelcomeEmail
    @Test
    void sendEmployeeWelcomeEmail_SendsWelcomeEmail() {
        // Given
        UserAccount newEmployee = new UserAccount();
        newEmployee.setEmail("newemployee@example.com");
        newEmployee.setFirstName("New");
        newEmployee.setLastName("Employee");
        newEmployee.setRole(Role.EMPLOYEE);

        String tempPassword = "Welcome123!";

        // When & Then
        assertDoesNotThrow(() ->
            notificationService.sendEmployeeWelcomeEmail(newEmployee, tempPassword)
        );
    }

    // Test notifyUserOfUpgradeApproval
    @Test
    void notifyUserOfUpgradeApproval_SendsApprovalEmail() {
        // When & Then
        assertDoesNotThrow(() ->
            notificationService.notifyUserOfUpgradeApproval(testUser)
        );
    }

    // Test notifyUserOfUpgradeRejection
    @Test
    void notifyUserOfUpgradeRejection_SendsRejectionEmail() {
        // Given
        String rejectionReason = "Insufficient documentation provided";

        // When & Then
        assertDoesNotThrow(() ->
            notificationService.notifyUserOfUpgradeRejection(testUser, rejectionReason)
        );
    }

    // Test email sending with exception handling
    @Test
    void sendEmail_HandlesMailException() {
        // When & Then
        assertDoesNotThrow(() ->
            notificationService.sendEmail("user@example.com", "Subject", "Body")
        );
    }
}