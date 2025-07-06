package com.ddfinance.backend.controller.roles;

import com.ddfinance.backend.dto.roles.ClientDTO;
import com.ddfinance.backend.dto.roles.EmployeeDetailsDTO;
import com.ddfinance.backend.dto.investment.CreateInvestmentRequest;
import com.ddfinance.backend.dto.investment.InvestmentDTO;
import com.ddfinance.backend.dto.actions.MessageDTO;
import com.ddfinance.backend.service.roles.EmployeeService;
import com.ddfinance.core.domain.enums.InvestmentStatus;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.ValidationException;
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
 * Test class for EmployeeController.
 * Tests employee-specific endpoints for client and investment management.
 */
@WebMvcTest(EmployeeController.class)
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EmployeeService employeeService;

    private EmployeeDetailsDTO employeeDetails;
    private ClientDTO clientDTO;
    private InvestmentDTO investmentDTO;
    private CreateInvestmentRequest createInvestmentRequest;
    private MessageDTO messageDTO;

    @BeforeEach
    void setUp() {
        // Setup test data
        employeeDetails = EmployeeDetailsDTO.builder()
                .employeeId("EMP001")
                .email("employee@company.com")
                .firstName("Jane")
                .lastName("Smith")
                .title("Senior Investment Advisor")
                .department("Wealth Management")
                .location("New York")
                .totalClients(15)
                .totalAssetsUnderManagement(25000000.0)
                .performanceRating(4.8)
                .build();

        clientDTO = ClientDTO.builder()
                .id(100L)
                .email("client@example.com")
                .firstName("John")
                .lastName("Doe")
                .phoneNumber("+1-555-0123")
                .portfolioValue(500000.0)
                .totalInvestments(5)
                .riskTolerance("MODERATE")
                .isActive(true)
                .build();

        investmentDTO = InvestmentDTO.builder()
                .id(1000L)
                .clientId(100L)
                .stockSymbol("MSFT")
                .stockName("Microsoft Corporation")
                .quantity(200)
                .purchasePrice(300.0)
                .currentPrice(350.0)
                .totalValue(70000.0)
                .profitLoss(10000.0)
                .status(InvestmentStatus.ACTIVE)
                .build();

        createInvestmentRequest = CreateInvestmentRequest.builder()
                .clientId(100L)
                .stockSymbol("GOOGL")
                .quantity(50)
                .orderType("MARKET")
                .build();

        messageDTO = MessageDTO.builder()
                .subject("Portfolio Review")
                .content("Your quarterly portfolio review is ready.")
                .recipientId(100L)
                .priority("NORMAL")
                .build();
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testGetMyDetails() throws Exception {
        // Given
        when(employeeService.getEmployeeDetails("employee@company.com")).thenReturn(employeeDetails);

        // When & Then
        mockMvc.perform(get("/api/employees/me")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value("EMP001"))
                .andExpect(jsonPath("$.totalClients").value(15))
                .andExpect(jsonPath("$.totalAssetsUnderManagement").value(25000000.0));

        verify(employeeService, times(1)).getEmployeeDetails("employee@company.com");
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testGetMyClients() throws Exception {
        // Given
        List<ClientDTO> clients = Arrays.asList(clientDTO);
        when(employeeService.getAssignedClients("employee@company.com")).thenReturn(clients);

        // When & Then
        mockMvc.perform(get("/api/employees/me/clients")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("client@example.com"))
                .andExpect(jsonPath("$[0].portfolioValue").value(500000.0));

        verify(employeeService, times(1)).getAssignedClients("employee@company.com");
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testGetClientById() throws Exception {
        // Given
        when(employeeService.getClientForEmployee("employee@company.com", 100L)).thenReturn(clientDTO);

        // When & Then
        mockMvc.perform(get("/api/employees/clients/100")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.email").value("client@example.com"));

        verify(employeeService, times(1)).getClientForEmployee("employee@company.com", 100L);
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testGetClientNotAssigned() throws Exception {
        // Given
        when(employeeService.getClientForEmployee("employee@company.com", 999L))
                .thenThrow(new SecurityException.ForbiddenException("Client not assigned to you"));

        // When & Then
        mockMvc.perform(get("/api/employees/clients/999")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testGetClientInvestments() throws Exception {
        // Given
        List<InvestmentDTO> investments = Arrays.asList(investmentDTO);
        when(employeeService.getClientInvestments("employee@company.com", 100L)).thenReturn(investments);

        // When & Then
        mockMvc.perform(get("/api/employees/clients/100/investments")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stockSymbol").value("MSFT"))
                .andExpect(jsonPath("$[0].totalValue").value(70000.0));

        verify(employeeService, times(1)).getClientInvestments("employee@company.com", 100L);
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testCreateInvestment() throws Exception {
        // Given
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Investment created successfully");
        response.put("investmentId", 2000L);
        response.put("status", "PENDING");
        when(employeeService.createInvestment(eq("employee@company.com"), any(CreateInvestmentRequest.class)))
                .thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/employees/investments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createInvestmentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Investment created successfully"))
                .andExpect(jsonPath("$.investmentId").value(2000));

        verify(employeeService, times(1)).createInvestment(eq("employee@company.com"), any(CreateInvestmentRequest.class));
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testUpdateInvestmentStatus() throws Exception {
        // Given
        InvestmentDTO updatedInvestment = InvestmentDTO.builder()
                .id(1000L)
                .status(InvestmentStatus.COMPLETED)
                .build();
        when(employeeService.updateInvestmentStatus("employee@company.com", 1000L, "COMPLETED"))
                .thenReturn(updatedInvestment);

        // When & Then
        mockMvc.perform(put("/api/employees/investments/1000/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("\"COMPLETED\""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        verify(employeeService, times(1)).updateInvestmentStatus("employee@company.com", 1000L, "COMPLETED");
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testSendMessageToClient() throws Exception {
        // Given
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Message sent successfully");
        response.put("messageId", 500L);
        when(employeeService.sendMessageToClient(eq("employee@company.com"), eq(100L), any(MessageDTO.class)))
                .thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/employees/clients/100/messages")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(messageDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Message sent successfully"));

        verify(employeeService, times(1)).sendMessageToClient(eq("employee@company.com"), eq(100L), any(MessageDTO.class));
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testGetClientMessages() throws Exception {
        // Given
        List<Map<String, Object>> messages = new ArrayList<>();
        Map<String, Object> msg = new HashMap<>();
        msg.put("id", 1L);
        msg.put("subject", "Investment Query");
        msg.put("fromClient", "John Doe");
        msg.put("sentAt", LocalDateTime.now().toString());
        msg.put("read", false);
        messages.add(msg);

        when(employeeService.getMessagesFromClients("employee@company.com")).thenReturn(messages);

        // When & Then
        mockMvc.perform(get("/api/employees/messages")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subject").value("Investment Query"))
                .andExpect(jsonPath("$[0].read").value(false));

        verify(employeeService, times(1)).getMessagesFromClients("employee@company.com");
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testGetPerformanceMetrics() throws Exception {
        // Given
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalClientsManaged", 15);
        metrics.put("totalAssetsUnderManagement", 25000000.0);
        metrics.put("averagePortfolioGrowth", 12.5);
        metrics.put("clientSatisfactionScore", 4.8);
        metrics.put("monthlyTarget", 2000000.0);
        metrics.put("monthlyAchieved", 2500000.0);

        when(employeeService.getPerformanceMetrics("employee@company.com")).thenReturn(metrics);

        // When & Then
        mockMvc.perform(get("/api/employees/me/performance")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalClientsManaged").value(15))
                .andExpect(jsonPath("$.averagePortfolioGrowth").value(12.5));

        verify(employeeService, times(1)).getPerformanceMetrics("employee@company.com");
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testSearchClients() throws Exception {
        // Given
        List<ClientDTO> searchResults = Arrays.asList(clientDTO);
        when(employeeService.searchClients("employee@company.com", "john")).thenReturn(searchResults);

        // When & Then
        mockMvc.perform(get("/api/employees/clients/search")
                        .param("query", "john")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstName").value("John"));

        verify(employeeService, times(1)).searchClients("employee@company.com", "john");
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testGenerateClientReport() throws Exception {
        // Given
        byte[] reportData = "PDF Report Content".getBytes();
        when(employeeService.generateClientReport("employee@company.com", 100L, "PDF"))
                .thenReturn(reportData);

        // When & Then
        mockMvc.perform(get("/api/employees/clients/100/report")
                        .param("format", "PDF")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=client_report_100.pdf"));

        verify(employeeService, times(1)).generateClientReport("employee@company.com", 100L, "PDF");
    }

    @Test
    @WithMockUser(username = "employee@company.com", roles = {"EMPLOYEE"})
    void testGetPendingInvestments() throws Exception {
        // Given
        List<InvestmentDTO> pendingInvestments = Arrays.asList(
                InvestmentDTO.builder()
                        .id(3000L)
                        .status(InvestmentStatus.PENDING)
                        .stockSymbol("AMZN")
                        .build()
        );
        when(employeeService.getPendingInvestments("employee@company.com")).thenReturn(pendingInvestments);

        // When & Then
        mockMvc.perform(get("/api/employees/investments/pending")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].stockSymbol").value("AMZN"));

        verify(employeeService, times(1)).getPendingInvestments("employee@company.com");
    }

    @Test
    @WithMockUser(username = "client@example.com", roles = {"CLIENT"})
    void testClientCannotAccessEmployeeEndpoints() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/employees/me")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testAdminCannotAccessEmployeeEndpoints() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/employees/me/clients")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUnauthenticatedAccess() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/employees/me"))
                .andExpect(status().isUnauthorized());
    }
}
