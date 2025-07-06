package com.ddfinance.backend.controller.roles;

import com.ddfinance.backend.dto.roles.GuestDetailsDTO;
import com.ddfinance.backend.dto.actions.UpgradeRequestDTO;
import com.ddfinance.backend.dto.actions.CreateUpgradeRequestDTO;
import com.ddfinance.backend.service.roles.GuestService;
import com.ddfinance.core.domain.enums.UpgradeRequestStatus;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.ValidationException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for GuestController.
 * Tests guest-specific endpoints for limited access and upgrade requests.
 */
@WebMvcTest(GuestController.class)
class GuestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private GuestService guestService;

    private GuestDetailsDTO guestDetails;
    private UpgradeRequestDTO upgradeRequest;
    private CreateUpgradeRequestDTO createUpgradeRequest;

    @BeforeEach
    void setUp() {
        // Setup test data
        guestDetails = GuestDetailsDTO.builder()
                .guestId(1L)
                .email("guest@example.com")
                .firstName("Guest")
                .lastName("User")
                .registrationDate(LocalDateTime.now().minusDays(5))
                .hasUpgradeRequest(false)
                .profileComplete(false)
                .build();

        upgradeRequest = UpgradeRequestDTO.builder()
                .requestId(100L)
                .guestId(1L)
                .requestDate(LocalDateTime.now().minusDays(2))
                .status(UpgradeRequestStatus.PENDING)
                .phoneNumber("+1-555-0123")
                .address("123 Main St, City, State 12345")
                .occupation("Software Engineer")
                .annualIncome(120000.0)
                .investmentGoals("Long-term growth and retirement planning")
                .riskTolerance("MODERATE")
                .build();

        createUpgradeRequest = CreateUpgradeRequestDTO.builder()
                .phoneNumber("+1-555-0123")
                .address("123 Main St, City, State 12345")
                .occupation("Software Engineer")
                .annualIncome(120000.0)
                .investmentGoals("Long-term growth and retirement planning")
                .riskTolerance("MODERATE")
                .expectedInvestmentAmount(50000.0)
                .sourceOfFunds("Employment income and savings")
                .build();
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"GUEST"})
    void testGetMyDetails() throws Exception {
        // Given
        when(guestService.getGuestDetails("guest@example.com")).thenReturn(guestDetails);

        // When & Then
        mockMvc.perform(get("/api/guests/me")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("guest@example.com"))
                .andExpect(jsonPath("$.hasUpgradeRequest").value(false))
                .andExpect(jsonPath("$.profileComplete").value(false));

        verify(guestService, times(1)).getGuestDetails("guest@example.com");
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"GUEST"})
    void testGetPublicInformation() throws Exception {
        // Given
        Map<String, Object> publicInfo = new HashMap<>();
        publicInfo.put("companyName", "Due Diligence Finance");
        publicInfo.put("services", Arrays.asList("Investment Management", "Financial Planning", "Wealth Advisory"));
        publicInfo.put("minimumInvestment", 10000.0);
        publicInfo.put("contactEmail", "info@ddfinance.com");

        when(guestService.getPublicInformation()).thenReturn(publicInfo);

        // When & Then
        mockMvc.perform(get("/api/guests/info")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Due Diligence Finance"))
                .andExpect(jsonPath("$.minimumInvestment").value(10000.0));

        verify(guestService, times(1)).getPublicInformation();
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"GUEST"})
    void testRequestUpgrade() throws Exception {
        // Given
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Upgrade request submitted successfully");
        response.put("requestId", 101L);
        response.put("status", "PENDING");

        when(guestService.requestUpgrade(eq("guest@example.com"), any(CreateUpgradeRequestDTO.class)))
                .thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/guests/me/upgrade")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createUpgradeRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Upgrade request submitted successfully"))
                .andExpect(jsonPath("$.requestId").value(101));

        verify(guestService, times(1)).requestUpgrade(eq("guest@example.com"), any(CreateUpgradeRequestDTO.class));
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"GUEST"})
    void testRequestUpgradeAlreadyExists() throws Exception {
        // Given
        when(guestService.requestUpgrade(eq("guest@example.com"), any(CreateUpgradeRequestDTO.class)))
                .thenThrow(new ValidationException("An upgrade request already exists for this account"));

        // When & Then
        mockMvc.perform(post("/api/guests/me/upgrade")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createUpgradeRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("An upgrade request already exists for this account"));
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"GUEST"})
    void testGetMyUpgradeRequest() throws Exception {
        // Given
        when(guestService.getUpgradeRequest("guest@example.com")).thenReturn(upgradeRequest);

        // When & Then
        mockMvc.perform(get("/api/guests/me/upgrade")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value(100))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.annualIncome").value(120000.0));

        verify(guestService, times(1)).getUpgradeRequest("guest@example.com");
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"GUEST"})
    void testGetUpgradeRequestNotFound() throws Exception {
        // Given
        when(guestService.getUpgradeRequest("guest@example.com"))
                .thenThrow(new EntityNotFoundException("No upgrade request found"));

        // When & Then
        mockMvc.perform(get("/api/guests/me/upgrade")
                        .with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("No upgrade request found"));
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"GUEST"})
    void testCancelUpgradeRequest() throws Exception {
        // Given
        Map<String, String> response = new HashMap<>();
        response.put("message", "Upgrade request cancelled successfully");

        doNothing().when(guestService).cancelUpgradeRequest("guest@example.com");

        // When & Then
        mockMvc.perform(delete("/api/guests/me/upgrade")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Upgrade request cancelled successfully"));

        verify(guestService, times(1)).cancelUpgradeRequest("guest@example.com");
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"GUEST"})
    void testUpdateProfile() throws Exception {
        // Given
        Map<String, String> profileUpdate = new HashMap<>();
        profileUpdate.put("phoneNumber", "+1-555-9999");
        profileUpdate.put("address", "456 New St, City, State 54321");

        GuestDetailsDTO updatedGuest = GuestDetailsDTO.builder()
                .guestId(1L)
                .email("guest@example.com")
                .firstName("Guest")
                .lastName("User")
                .phoneNumber("+1-555-9999")
                .address("456 New St, City, State 54321")
                .profileComplete(true)
                .build();

        when(guestService.updateProfile(eq("guest@example.com"), any())).thenReturn(updatedGuest);

        // When & Then
        mockMvc.perform(put("/api/guests/me/profile")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileComplete").value(true))
                .andExpect(jsonPath("$.phoneNumber").value("+1-555-9999"));

        verify(guestService, times(1)).updateProfile(eq("guest@example.com"), any());
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"GUEST"})
    void testGetFAQ() throws Exception {
        // Given
        List<Map<String, String>> faqs = new ArrayList<>();
        Map<String, String> faq1 = new HashMap<>();
        faq1.put("question", "What is the minimum investment?");
        faq1.put("answer", "The minimum investment is $10,000");
        faqs.add(faq1);

        Map<String, String> faq2 = new HashMap<>();
        faq2.put("question", "How do I upgrade to a client account?");
        faq2.put("answer", "Submit an upgrade request with your financial information");
        faqs.add(faq2);

        when(guestService.getFAQ()).thenReturn(faqs);

        // When & Then
        mockMvc.perform(get("/api/guests/faq")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].question").value("What is the minimum investment?"))
                .andExpect(jsonPath("$[1].question").value("How do I upgrade to a client account?"));

        verify(guestService, times(1)).getFAQ();
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"GUEST"})
    void testGetInvestmentOptions() throws Exception {
        // Given
        List<Map<String, Object>> options = new ArrayList<>();
        Map<String, Object> option1 = new HashMap<>();
        option1.put("name", "Conservative Portfolio");
        option1.put("expectedReturn", "5-7%");
        option1.put("riskLevel", "LOW");
        option1.put("description", "Focus on bonds and stable investments");
        options.add(option1);

        when(guestService.getInvestmentOptions()).thenReturn(options);

        // When & Then
        mockMvc.perform(get("/api/guests/investment-options")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Conservative Portfolio"))
                .andExpect(jsonPath("$[0].riskLevel").value("LOW"));

        verify(guestService, times(1)).getInvestmentOptions();
    }

    @Test
    @WithMockUser(username = "guest@example.com", roles = {"GUEST"})
    void testCalculateProjectedReturns() throws Exception {
        // Given
        Map<String, Object> projection = new HashMap<>();
        projection.put("initialInvestment", 50000.0);
        projection.put("years", 10);
        projection.put("conservativeReturn", 85000.0);
        projection.put("moderateReturn", 110000.0);
        projection.put("aggressiveReturn", 150000.0);

        when(guestService.calculateProjectedReturns(50000.0, 10)).thenReturn(projection);

        // When & Then
        mockMvc.perform(get("/api/guests/calculate-returns")
                        .param("amount", "50000")
                        .param("years", "10")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.initialInvestment").value(50000.0))
                .andExpect(jsonPath("$.moderateReturn").value(110000.0));

        verify(guestService, times(1)).calculateProjectedReturns(50000.0, 10);
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testClientCannotAccessGuestEndpoints() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/guests/me")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = {"EMPLOYEE"})
    void testEmployeeCannotAccessGuestEndpoints() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/guests/me/upgrade")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createUpgradeRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUnauthenticatedAccess() throws Exception {
        // When & Then - Public endpoint should be accessible
        mockMvc.perform(get("/api/guests/info"))
                .andExpect(status().isOk());

        // Private endpoint should require authentication
        mockMvc.perform(get("/api/guests/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testPublicEndpointsAccessible() throws Exception {
        // Given
        Map<String, Object> publicInfo = new HashMap<>();
        publicInfo.put("companyName", "Due Diligence Finance");
        when(guestService.getPublicInformation()).thenReturn(publicInfo);

        // When & Then - These should be accessible without authentication
        mockMvc.perform(get("/api/guests/info"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/guests/faq"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/guests/investment-options"))
                .andExpect(status().isOk());
    }
}
