package com.ddfinance.backend.service.roles;

import com.ddfinance.backend.dto.actions.CreateUpgradeRequestDTO;
import com.ddfinance.backend.dto.actions.UpgradeRequestDTO;
import com.ddfinance.backend.dto.roles.GuestDetailsDTO;
import com.ddfinance.backend.repository.GuestRepository;
import com.ddfinance.backend.repository.GuestUpgradeRequestRepository;
import com.ddfinance.backend.repository.FAQRepository;
import com.ddfinance.backend.repository.ContactRequestRepository;
import com.ddfinance.backend.service.notification.NotificationService;
import com.ddfinance.core.domain.ContactRequest;
import com.ddfinance.core.domain.Guest;
import com.ddfinance.core.domain.GuestUpgradeRequest;
import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.domain.enums.UpgradeRequestStatus;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for GuestServiceImpl.
 * Tests all guest-specific operations including upgrade requests,
 * public information access, and educational resources.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@ExtendWith(MockitoExtension.class)
class GuestServiceImplTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private GuestRepository guestRepository;

    @Mock
    private GuestUpgradeRequestRepository upgradeRequestRepository;

    @Mock
    private FAQRepository faqRepository;

    @Mock
    private ContactRequestRepository contactRequestRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private GuestServiceImpl guestService;

    private UserAccount guestUserAccount;
    private Guest guest;
    private GuestUpgradeRequest upgradeRequest;

    @BeforeEach
    void setUp() {
        // Setup test user account
        guestUserAccount = new UserAccount();
        guestUserAccount.setId(1L);
        guestUserAccount.setEmail("john.guest@example.com");
        guestUserAccount.setFirstName("John");
        guestUserAccount.setLastName("Guest");
        guestUserAccount.setRole(Role.GUEST);
        guestUserAccount.setCreatedDate(LocalDateTime.now().minusDays(7));

        // Setup guest
        guest = new Guest();
        guest.setId(1L);
        guest.setUserAccount(guestUserAccount);
        guest.setGuestId("GUEST-001");

        // Setup upgrade request
        upgradeRequest = new GuestUpgradeRequest();
        upgradeRequest.setId(1L);
        upgradeRequest.setUserAccount(guestUserAccount);
        upgradeRequest.setStatus(UpgradeRequestStatus.PENDING);
        upgradeRequest.setRequestDate(LocalDateTime.now().minusDays(1));
        upgradeRequest.setDetails("I would like to become a client to start investing.");

        // Setup additionalInfo map for upgrade request
        Map<String, String> additionalInfo = new HashMap<>();
        additionalInfo.put("phoneNumber", "+1234567890");
        additionalInfo.put("address", "123 Test St");
        additionalInfo.put("occupation", "Software Engineer");
        additionalInfo.put("annualIncome", "100000");
        additionalInfo.put("investmentGoals", "Long-term growth");
        additionalInfo.put("riskTolerance", "MODERATE");
        additionalInfo.put("expectedInvestmentAmount", "50000");
        additionalInfo.put("sourceOfFunds", "Savings");
        upgradeRequest.setAdditionalInfo(additionalInfo);
    }

    @Test
    void getGuestDetails_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("john.guest@example.com")).thenReturn(Optional.of(guestUserAccount));
        when(guestRepository.findByUserAccount(guestUserAccount)).thenReturn(Optional.of(guest));
        when(upgradeRequestRepository.findByUserAccountOrderByRequestDateDesc(guestUserAccount))
                .thenReturn(Collections.emptyList());

        // Act
        GuestDetailsDTO result = guestService.getGuestDetails("john.guest@example.com");

        // Assert
        assertNotNull(result);
        assertEquals("john.guest@example.com", result.getEmail());
        assertEquals("John", result.getFirstName());
        assertEquals("Guest", result.getLastName());
        assertEquals(1L, result.getGuestId());
        assertNotNull(result.getRegistrationDate());

        verify(userAccountRepository).findByEmail("john.guest@example.com");
        verify(guestRepository).findByUserAccount(guestUserAccount);
    }

    @Test
    void getGuestDetails_GuestNotFound_ThrowsException() {
        // Arrange
        when(userAccountRepository.findByEmail("john.guest@example.com")).thenReturn(Optional.of(guestUserAccount));
        when(guestRepository.findByUserAccount(guestUserAccount)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> {
            guestService.getGuestDetails("john.guest@example.com");
        });
    }

    @Test
    void getPublicInformation_Success() {
        // Act
        Map<String, Object> result = guestService.getPublicInformation();

        // Assert
        assertNotNull(result);
        assertNotNull(result.get("companyName"));
        assertNotNull(result.get("companyDescription"));
        assertNotNull(result.get("services"));
        assertNotNull(result.get("investmentOptions"));
        assertNotNull(result.get("minimumInvestment"));
        assertNotNull(result.get("contactInfo"));
        assertEquals("Due Diligence Finance", result.get("companyName"));
    }

    @Test
    void requestUpgrade_Success() {
        // Arrange
        CreateUpgradeRequestDTO request = new CreateUpgradeRequestDTO();
        request.setPhoneNumber("+1234567890");
        request.setAddress("123 Test St");
        request.setOccupation("Software Engineer");
        request.setAnnualIncome(100000.0);
        request.setInvestmentGoals("Long-term growth");
        request.setRiskTolerance("MODERATE");
        request.setExpectedInvestmentAmount(50000.0);
        request.setSourceOfFunds("Savings");
        request.setAgreeToIdentityVerification(true);
        request.setAcceptTermsAndConditions(true);

        when(userAccountRepository.findByEmail("john.guest@example.com")).thenReturn(Optional.of(guestUserAccount));
        when(upgradeRequestRepository.existsByUserAccountAndStatus(guestUserAccount, UpgradeRequestStatus.PENDING))
                .thenReturn(false);
        when(upgradeRequestRepository.save(any(GuestUpgradeRequest.class))).thenAnswer(invocation -> {
            GuestUpgradeRequest saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        // Act
        Map<String, Object> result = guestService.requestUpgrade("john.guest@example.com", request);

        // Assert
        assertNotNull(result);
        assertEquals("Upgrade request submitted successfully", result.get("message"));
        assertNotNull(result.get("requestId"));
        assertEquals("PENDING", result.get("status"));

        verify(upgradeRequestRepository).save(any(GuestUpgradeRequest.class));
        verify(notificationService).notifyAdminsOfUpgradeRequest(any());
    }

    @Test
    void requestUpgrade_ExistingPendingRequest_ThrowsException() {
        // Arrange
        CreateUpgradeRequestDTO request = new CreateUpgradeRequestDTO();

        when(userAccountRepository.findByEmail("john.guest@example.com")).thenReturn(Optional.of(guestUserAccount));
        when(upgradeRequestRepository.existsByUserAccountAndStatus(guestUserAccount, UpgradeRequestStatus.PENDING))
                .thenReturn(true);

        // Act & Assert
        assertThrows(ValidationException.class, () -> {
            guestService.requestUpgrade("john.guest@example.com", request);
        });
    }

    @Test
    void getUpgradeRequest_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("john.guest@example.com")).thenReturn(Optional.of(guestUserAccount));
        when(upgradeRequestRepository.findByUserAccountOrderByRequestDateDesc(guestUserAccount))
                .thenReturn(Arrays.asList(upgradeRequest));

        // Act
        UpgradeRequestDTO result = guestService.getUpgradeRequest("john.guest@example.com");

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getRequestId());
        assertEquals(UpgradeRequestStatus.PENDING, result.getStatus());
        assertEquals("+1234567890", result.getPhoneNumber());
        assertEquals("123 Test St", result.getAddress());
        assertEquals("Software Engineer", result.getOccupation());
        assertEquals(100000.0, result.getAnnualIncome());

        verify(upgradeRequestRepository).findByUserAccountOrderByRequestDateDesc(guestUserAccount);
    }

    @Test
    void getUpgradeRequest_NoRequest_ThrowsException() {
        // Arrange
        when(userAccountRepository.findByEmail("john.guest@example.com")).thenReturn(Optional.of(guestUserAccount));
        when(upgradeRequestRepository.findByUserAccountOrderByRequestDateDesc(guestUserAccount))
                .thenReturn(Collections.emptyList());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> {
            guestService.getUpgradeRequest("john.guest@example.com");
        });
    }

    @Test
    void cancelUpgradeRequest_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("john.guest@example.com")).thenReturn(Optional.of(guestUserAccount));
        when(upgradeRequestRepository.findByUserAccountAndStatus(guestUserAccount, UpgradeRequestStatus.PENDING))
                .thenReturn(Optional.of(upgradeRequest));

        // Act
        assertDoesNotThrow(() -> {
            guestService.cancelUpgradeRequest("john.guest@example.com");
        });

        // Assert
        verify(upgradeRequestRepository).delete(upgradeRequest);
    }

    @Test
    void cancelUpgradeRequest_AlreadyProcessed_ThrowsException() {
        // Arrange
        upgradeRequest.setStatus(UpgradeRequestStatus.APPROVED);

        when(userAccountRepository.findByEmail("john.guest@example.com")).thenReturn(Optional.of(guestUserAccount));
        when(upgradeRequestRepository.findByUserAccountAndStatus(guestUserAccount, UpgradeRequestStatus.PENDING))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> {
            guestService.cancelUpgradeRequest("john.guest@example.com");
        });
    }

    @Test
    void updateProfile_Success() {
        // Arrange
        Map<String, String> profileData = new HashMap<>();
        profileData.put("phoneNumber", "+1234567890");
        profileData.put("address", "123 Main St");

        when(userAccountRepository.findByEmail("john.guest@example.com")).thenReturn(Optional.of(guestUserAccount));
        when(guestRepository.findByUserAccount(guestUserAccount)).thenReturn(Optional.of(guest));
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(guestUserAccount);
        when(upgradeRequestRepository.findByUserAccountOrderByRequestDateDesc(guestUserAccount))
                .thenReturn(Collections.emptyList());

        // Act
        GuestDetailsDTO result = guestService.updateProfile("john.guest@example.com", profileData);

        // Assert
        assertNotNull(result);
        verify(userAccountRepository).save(guestUserAccount);
    }

    @Test
    void getFAQ_Success() {
        // Arrange
        List<Map<String, String>> mockFAQs = Arrays.asList(
                Map.of("question", "What is the minimum investment?", "answer", "$10,000"),
                Map.of("question", "How do I upgrade my account?", "answer", "Submit an upgrade request")
        );

        when(faqRepository.findAllActiveOrderByDisplayOrder()).thenReturn(mockFAQs);

        // Act
        List<Map<String, String>> result = guestService.getFAQ();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("What is the minimum investment?", result.get(0).get("question"));
    }

    @Test
    void getInvestmentOptions_Success() {
        // Act
        List<Map<String, Object>> result = guestService.getInvestmentOptions();

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertTrue(result.stream().anyMatch(opt -> "Conservative Portfolio".equals(opt.get("name"))));
        assertTrue(result.stream().anyMatch(opt -> "Growth Portfolio".equals(opt.get("name"))));
    }

    @Test
    void calculateProjectedReturns_Success() {
        // Act
        Map<String, Object> result = guestService.calculateProjectedReturns(10000.0, 5);

        // Assert
        assertNotNull(result);
        assertEquals(10000.0, result.get("initialInvestment"));
        assertEquals(5, result.get("investmentPeriod"));
        assertNotNull(result.get("projections"));

        List<Map<String, Object>> projections = (List<Map<String, Object>>) result.get("projections");
        assertNotNull(projections);
        assertEquals(5, projections.size());
        assertTrue(projections.stream().anyMatch(p -> "Conservative (4%)".equals(p.get("scenario"))));
        assertTrue(projections.stream().anyMatch(p -> "Growth (10%)".equals(p.get("scenario"))));
    }

    @Test
    void calculateProjectedReturns_InvalidAmount_ThrowsException() {
        // Act & Assert
        assertThrows(ValidationException.class, () -> {
            guestService.calculateProjectedReturns(-1000.0, 5);
        });
    }

    @Test
    void getEducationalResources_Success() {
        // Act
        List<Map<String, Object>> result = guestService.getEducationalResources();

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertTrue(result.stream().anyMatch(res -> "BASICS".equals(res.get("category"))));
        assertTrue(result.stream().anyMatch(res -> res.get("title").toString().contains("Stock Market")));
    }

    @Test
    void submitContactRequest_Success() {
        // Arrange
        Map<String, String> contactRequest = new HashMap<>();
        contactRequest.put("name", "John Guest");
        contactRequest.put("email", "john.guest@example.com");
        contactRequest.put("phone", "+1234567890");
        contactRequest.put("message", "I'd like to learn more");

        when(contactRequestRepository.save(any(ContactRequest.class))).thenAnswer(invocation -> {
            ContactRequest saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        // Act
        assertDoesNotThrow(() -> {
            guestService.submitContactRequest(contactRequest);
        });

        // Assert
        verify(contactRequestRepository).save(any(ContactRequest.class));
        verify(notificationService).notifySalesTeamOfContact(any(ContactRequest.class));
    }

    @Test
    void submitContactRequest_MissingName_ThrowsException() {
        // Arrange
        Map<String, String> contactRequest = new HashMap<>();
        contactRequest.put("email", "john.guest@example.com");
        contactRequest.put("message", "I'd like to learn more");

        // Act & Assert
        assertThrows(ValidationException.class, () -> {
            guestService.submitContactRequest(contactRequest);
        });
    }

    @Test
    void checkUpgradeEligibility_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("john.guest@example.com")).thenReturn(Optional.of(guestUserAccount));
        when(upgradeRequestRepository.existsByUserAccountAndStatus(guestUserAccount, UpgradeRequestStatus.PENDING))
                .thenReturn(false);

        // Act
        Map<String, Object> result = guestService.checkUpgradeEligibility("john.guest@example.com");

        // Assert
        assertNotNull(result);
        assertTrue((Boolean) result.get("eligible"));
        assertNull(result.get("reason"));
    }

    @Test
    void checkUpgradeEligibility_PendingRequest_NotEligible() {
        // Arrange
        when(userAccountRepository.findByEmail("john.guest@example.com")).thenReturn(Optional.of(guestUserAccount));
        when(upgradeRequestRepository.existsByUserAccountAndStatus(guestUserAccount, UpgradeRequestStatus.PENDING))
                .thenReturn(true);

        // Act
        Map<String, Object> result = guestService.checkUpgradeEligibility("john.guest@example.com");

        // Assert
        assertNotNull(result);
        assertFalse((Boolean) result.get("eligible"));
        assertEquals("You already have a pending upgrade request", result.get("reason"));
    }

    @Test
    void getActivitySummary_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("john.guest@example.com")).thenReturn(Optional.of(guestUserAccount));
        when(guestRepository.findByUserAccount(guestUserAccount)).thenReturn(Optional.of(guest));
        when(upgradeRequestRepository.findByUserAccountOrderByRequestDateDesc(guestUserAccount))
                .thenReturn(Arrays.asList(upgradeRequest));
        when(contactRequestRepository.countByStatus("NEW")).thenReturn(2L);

        // Act
        Map<String, Object> result = guestService.getActivitySummary("john.guest@example.com");

        // Assert
        assertNotNull(result);
        assertNotNull(result.get("welcomeMessage"));
        assertEquals("Guest Account", result.get("accountType"));
        assertNotNull(result.get("registrationDate"));
        assertNotNull(result.get("daysSinceRegistration"));
        assertEquals("PENDING", result.get("upgradeRequestStatus"));
        assertNotNull(result.get("upgradeRequestDate"));
        assertNotNull(result.get("availableActions"));
        assertNotNull(result.get("clientBenefits"));
        assertNotNull(result.get("recentActivity"));
        assertNotNull(result.get("nextSteps"));
        assertNotNull(result.get("quickStats"));
        assertNotNull(result.get("upgradeRequestHistory"));
        assertNotNull(result.get("lastActivity"));

        List<Map<String, Object>> recentActivity = (List<Map<String, Object>>) result.get("recentActivity");
        assertFalse(recentActivity.isEmpty());

        Map<String, Object> quickStats = (Map<String, Object>) result.get("quickStats");
        assertNotNull(quickStats.get("profileComplete"));
        assertNotNull(quickStats.get("hasPhoneNumber"));
        assertNotNull(quickStats.get("hasSubmittedUpgradeRequest"));
        assertNotNull(quickStats.get("accountAge"));
    }

    @Test
    void getActivitySummary_NoUpgradeRequest() {
        // Arrange
        when(userAccountRepository.findByEmail("john.guest@example.com")).thenReturn(Optional.of(guestUserAccount));
        when(guestRepository.findByUserAccount(guestUserAccount)).thenReturn(Optional.of(guest));
        when(upgradeRequestRepository.findByUserAccountOrderByRequestDateDesc(guestUserAccount))
                .thenReturn(Collections.emptyList());
        when(contactRequestRepository.countByStatus("NEW")).thenReturn(0L);

        // Act
        Map<String, Object> result = guestService.getActivitySummary("john.guest@example.com");

        // Assert
        assertNotNull(result);
        assertEquals("NO_REQUEST", result.get("upgradeRequestStatus"));

        List<String> nextSteps = (List<String>) result.get("nextSteps");
        assertTrue(nextSteps.contains("Submit an upgrade request to become a client"));
    }
}