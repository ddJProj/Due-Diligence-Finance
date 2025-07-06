package com.ddfinance.backend.controller.roles;

import com.ddfinance.backend.dto.investment.InvestmentDTO;
import com.ddfinance.backend.dto.investment.PortfolioSummaryDTO;
import com.ddfinance.backend.dto.roles.ClientDetailsDTO;
import com.ddfinance.backend.dto.roles.EmployeeDTO;
import com.ddfinance.backend.dto.actions.MessageDTO;
import com.ddfinance.backend.service.roles.ClientService;
import com.ddfinance.core.domain.enums.InvestmentStatus;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.SecurityException;
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
 * Test class for ClientController.
 * Tests client-specific endpoints for portfolio and investment management.
 */
@WebMvcTest(ClientController.class)
class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ClientService clientService;

    private ClientDetailsDTO clientDetails;
    private InvestmentDTO investment;
    private PortfolioSummaryDTO portfolioSummary;
    private MessageDTO message;
    private EmployeeDTO assignedEmployee;

    @BeforeEach
    void setUp() {
        // Setup test data
        assignedEmployee = EmployeeDTO.builder()
                .id(10L)
                .employeeId("EMP001")
                .firstName("Jane")
                .lastName("Smith")
                .email("jane.smith@company.com")
                .title("Senior Investment Advisor")
                .build();

        clientDetails = ClientDetailsDTO.builder()
                .clientId(1L)
                .email("client@example.com")
                .firstName("John")
                .lastName("Doe")
                .phoneNumber("+1-555-0123")
                .dateJoined(LocalDateTime.now().minusMonths(6))
                .assignedEmployee(assignedEmployee)
                .totalInvestments(3)
                .portfolioValue(150000.0)
                .build();

        investment = InvestmentDTO.builder()
                .id(100L)
                .clientId(1L)
                .stockSymbol("AAPL")
                .stockName("Apple Inc.")
                .quantity(100)
                .purchasePrice(150.0)
                .currentPrice(175.0)
                .totalValue(17500.0)
                .profitLoss(2500.0)
                .profitLossPercentage(16.67)
                .status(InvestmentStatus.ACTIVE)
                .purchaseDate(LocalDateTime.now().minusMonths(3))
                .build();

        portfolioSummary = PortfolioSummaryDTO.builder()
                .totalInvestments(3)
                .totalValue(150000.0)
                .totalCost(130000.0)
                .totalProfitLoss(20000.0)
                .totalProfitLossPercentage(15.38)
                .investments(Arrays.asList(investment))
                .build();

        message = MessageDTO.builder()
                .subject("Portfolio Update")
                .content("Your portfolio has been reviewed.")
                .recipientId(10L)
                .build();
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testGetMyDetails() throws Exception {
        // Given
        when(clientService.getClientDetails("client@example.com")).thenReturn(clientDetails);

        // When & Then
        mockMvc.perform(get("/api/clients/me")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("client@example.com"))
                .andExpect(jsonPath("$.portfolioValue").value(150000.0))
                .andExpect(jsonPath("$.assignedEmployee.email").value("jane.smith@company.com"));

        verify(clientService, times(1)).getClientDetails("client@example.com");
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testGetMyPortfolio() throws Exception {
        // Given
        when(clientService.getPortfolioSummary("client@example.com")).thenReturn(portfolioSummary);

        // When & Then
        mockMvc.perform(get("/api/clients/me/portfolio")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalValue").value(150000.0))
                .andExpect(jsonPath("$.totalProfitLoss").value(20000.0))
                .andExpect(jsonPath("$.investments[0].stockSymbol").value("AAPL"));

        verify(clientService, times(1)).getPortfolioSummary("client@example.com");
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testGetMyInvestments() throws Exception {
        // Given
        List<InvestmentDTO> investments = Arrays.asList(investment);
        when(clientService.getClientInvestments("client@example.com")).thenReturn(investments);

        // When & Then
        mockMvc.perform(get("/api/clients/me/investments")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stockSymbol").value("AAPL"))
                .andExpect(jsonPath("$[0].quantity").value(100))
                .andExpect(jsonPath("$[0].profitLoss").value(2500.0));

        verify(clientService, times(1)).getClientInvestments("client@example.com");
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testGetInvestmentById() throws Exception {
        // Given
        when(clientService.getInvestmentForClient("client@example.com", 100L)).thenReturn(investment);

        // When & Then
        mockMvc.perform(get("/api/clients/me/investments/100")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.stockSymbol").value("AAPL"));

        verify(clientService, times(1)).getInvestmentForClient("client@example.com", 100L);
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testGetInvestmentNotOwned() throws Exception {
        // Given
        when(clientService.getInvestmentForClient("client@example.com", 999L))
                .thenThrow(new SecurityException.ForbiddenException("You don't have access to this investment"));

        // When & Then
        mockMvc.perform(get("/api/clients/me/investments/999")
                .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testMessageEmployee() throws Exception {
        // Given
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Message sent successfully");
        response.put("messageId", 123L);
        when(clientService.sendMessageToEmployee(eq("client@example.com"), any(MessageDTO.class)))
                .thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/clients/me/messages")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(message)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Message sent successfully"));

        verify(clientService, times(1)).sendMessageToEmployee(eq("client@example.com"), any(MessageDTO.class));
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testGetMessages() throws Exception {
        // Given
        List<Map<String, Object>> messages = new ArrayList<>();
        Map<String, Object> msg = new HashMap<>();
        msg.put("id", 1L);
        msg.put("subject", "Welcome");
        msg.put("content", "Welcome to our service");
        msg.put("fromEmployee", "Jane Smith");
        msg.put("sentAt", LocalDateTime.now().toString());
        msg.put("read", false);
        messages.add(msg);

        when(clientService.getClientMessages("client@example.com")).thenReturn(messages);

        // When & Then
        mockMvc.perform(get("/api/clients/me/messages")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subject").value("Welcome"))
                .andExpect(jsonPath("$[0].read").value(false));

        verify(clientService, times(1)).getClientMessages("client@example.com");
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testMarkMessageAsRead() throws Exception {
        // Given
        doNothing().when(clientService).markMessageAsRead("client@example.com", 1L);

        // When & Then
        mockMvc.perform(put("/api/clients/me/messages/1/read")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Message marked as read"));

        verify(clientService, times(1)).markMessageAsRead("client@example.com", 1L);
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testGetInvestmentHistory() throws Exception {
        // Given
        List<Map<String, Object>> history = new ArrayList<>();
        Map<String, Object> transaction = new HashMap<>();
        transaction.put("date", LocalDateTime.now().minusDays(5).toString());
        transaction.put("type", "BUY");
        transaction.put("stockSymbol", "AAPL");
        transaction.put("quantity", 50);
        transaction.put("price", 150.0);
        transaction.put("totalAmount", 7500.0);
        history.add(transaction);

        when(clientService.getInvestmentHistory("client@example.com", 100L)).thenReturn(history);

        // When & Then
        mockMvc.perform(get("/api/clients/me/investments/100/history")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("BUY"))
                .andExpect(jsonPath("$[0].quantity").value(50));

        verify(clientService, times(1)).getInvestmentHistory("client@example.com", 100L);
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testGetPerformanceReport() throws Exception {
        // Given
        Map<String, Object> performance = new HashMap<>();
        performance.put("period", "MONTHLY");
        performance.put("startValue", 130000.0);
        performance.put("endValue", 150000.0);
        performance.put("totalReturn", 20000.0);
        performance.put("percentageReturn", 15.38);

        when(clientService.getPerformanceReport("client@example.com", "MONTHLY")).thenReturn(performance);

        // When & Then
        mockMvc.perform(get("/api/clients/me/performance")
                .param("period", "MONTHLY")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalReturn").value(20000.0))
                .andExpect(jsonPath("$.percentageReturn").value(15.38));

        verify(clientService, times(1)).getPerformanceReport("client@example.com", "MONTHLY");
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = {"EMPLOYEE"})
    void testEmployeeCannotAccessClientEndpoints() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/clients/me")
                .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testAdminCannotAccessClientEndpoints() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/clients/me/portfolio")
                .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUnauthenticatedAccess() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/clients/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testUpdateInvestmentPreferences() throws Exception {
        // Given
        Map<String, Object> preferences = new HashMap<>();
        preferences.put("riskTolerance", "MODERATE");
        preferences.put("investmentGoals", Arrays.asList("GROWTH", "INCOME"));
        preferences.put("preferredSectors", Arrays.asList("TECHNOLOGY", "HEALTHCARE"));

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Preferences updated successfully");
        when(clientService.updateInvestmentPreferences(eq("client@example.com"), any())).thenReturn(response);

        // When & Then
        mockMvc.perform(put("/api/clients/me/preferences")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(preferences)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Preferences updated successfully"));

        verify(clientService, times(1)).updateInvestmentPreferences(eq("client@example.com"), any());
    }
}