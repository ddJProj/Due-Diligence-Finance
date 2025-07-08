package com.ddfinance.backend.service.roles;

import com.ddfinance.backend.dto.actions.MessageDTO;
import com.ddfinance.backend.dto.investment.InvestmentDTO;
import com.ddfinance.backend.dto.investment.PortfolioSummaryDTO;
import com.ddfinance.backend.dto.roles.ClientDetailsDTO;
import com.ddfinance.backend.dto.roles.EmployeeDTO;
import com.ddfinance.backend.repository.*;
import com.ddfinance.backend.service.investment.StockDataService;
import com.ddfinance.core.domain.*;
import com.ddfinance.core.domain.enums.InvestmentStatus;
import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.SecurityException;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ClientServiceImpl.
 * Tests all client-specific operations including portfolio management,
 * investments, and client-employee communication.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@ExtendWith(MockitoExtension.class)
class ClientServiceImplTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private InvestmentRepository investmentRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private InvestmentRequestRepository investmentRequestRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private TaxDocumentRepository taxDocumentRepository;

    @Mock
    private StockDataService stockDataService;

    @InjectMocks
    private ClientServiceImpl clientService;

    private UserAccount clientUserAccount;
    private Client client;
    private Employee employee;
    private Investment investment1;
    private Investment investment2;

    @BeforeEach
    void setUp() {
        // Setup test user account
        clientUserAccount = new UserAccount();
        clientUserAccount.setId(1L);
        clientUserAccount.setEmail("john.doe@example.com");
        clientUserAccount.setFirstName("John");
        clientUserAccount.setLastName("Doe");
        clientUserAccount.setRole(Role.CLIENT);
        clientUserAccount.setCreatedDate(LocalDateTime.now().minusMonths(6));
        clientUserAccount.setActive(true);

        // Setup employee
        UserAccount employeeAccount = new UserAccount();
        employeeAccount.setId(2L);
        employeeAccount.setEmail("jane.smith@company.com");
        employeeAccount.setFirstName("Jane");
        employeeAccount.setLastName("Smith");
        employeeAccount.setRole(Role.EMPLOYEE);

        employee = new Employee();
        employee.setId(1L);
        employee.setUserAccount(employeeAccount);
        employee.setEmployeeId("EMP-001");
        employee.setDepartment("Financial Advisory");

        // Setup client
        client = new Client();
        client.setId(1L);
        client.setClientId("CLI-001");
        client.setUserAccount(clientUserAccount);
        client.setAssignedEmployee(employee);
        client.setRiskProfile("MODERATE");

        // Setup investments
        investment1 = new Investment();
        investment1.setId(1L);
        investment1.setClient(client);
        investment1.setTickerSymbol("AAPL");
        investment1.setName("Apple Inc.");
        investment1.setShares(BigDecimal.valueOf(100));
        investment1.setPurchasePricePerShare(BigDecimal.valueOf(150.00));
        investment1.setStatus(InvestmentStatus.ACTIVE);
        investment1.setCreatedDate(LocalDateTime.now().minusDays(30));

        investment2 = new Investment();
        investment2.setId(2L);
        investment2.setClient(client);
        investment2.setTickerSymbol("MSFT");
        investment2.setName("Microsoft Corporation");
        investment2.setShares(BigDecimal.valueOf(50));
        investment2.setPurchasePricePerShare(BigDecimal.valueOf(300.00));
        investment2.setStatus(InvestmentStatus.ACTIVE);
        investment2.setCreatedDate(LocalDateTime.now().minusDays(15));

        client.setInvestments(Set.of(investment1, investment2));
    }

    @Test
    void getClientDetails_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));

        // Act
        ClientDetailsDTO result = clientService.getClientDetails("john.doe@example.com");

        // Assert
        assertNotNull(result);
        assertEquals("john.doe@example.com", result.getEmail());
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());
        assertEquals("CLI-001", result.getClientId());
        assertNotNull(result.getDateJoined());
        assertEquals("MODERATE", result.getRiskTolerance());
        assertTrue(result.getIsActive());
        assertEquals("ACTIVE", result.getAccountStatus());

        // Check assigned employee
        assertNotNull(result.getAssignedEmployee());
        assertEquals("jane.smith@company.com", result.getAssignedEmployee().getEmail());
        assertEquals("Jane", result.getAssignedEmployee().getFirstName());
        assertEquals("Smith", result.getAssignedEmployee().getLastName());

        verify(userAccountRepository).findByEmail("john.doe@example.com");
        verify(clientRepository).findByUserAccount(clientUserAccount);
    }

    @Test
    void getClientDetails_ClientNotFound_ThrowsException() {
        // Arrange
        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> {
            clientService.getClientDetails("john.doe@example.com");
        });
    }

    @Test
    void getPortfolioSummary_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));

        // Mock current stock prices
        when(stockDataService.getCurrentPrice("AAPL")).thenReturn(BigDecimal.valueOf(160.00));
        when(stockDataService.getCurrentPrice("MSFT")).thenReturn(BigDecimal.valueOf(320.00));

        // Act
        PortfolioSummaryDTO result = clientService.getPortfolioSummary("john.doe@example.com");

        // Assert
        assertNotNull(result);
        assertEquals("CLI-001", result.getClientId());
        assertEquals(2, result.getTotalInvestments());
        assertEquals(BigDecimal.valueOf(32000.00), result.getTotalValue()); // (100*160) + (50*320)
        assertEquals(BigDecimal.valueOf(30000.00), result.getTotalCost()); // (100*150) + (50*300)
        assertEquals(BigDecimal.valueOf(2000.00), result.getTotalGain());
        assertEquals(BigDecimal.valueOf(6.67), result.getTotalGainPercentage());
        assertNotNull(result.getInvestments());
        assertEquals(2, result.getInvestments().size());
        assertNotNull(result.getLastUpdated());

        verify(stockDataService).getCurrentPrice("AAPL");
        verify(stockDataService).getCurrentPrice("MSFT");
    }

    @Test
    void getClientInvestments_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));
        when(investmentRepository.findByClientOrderByCreatedDateDesc(client))
                .thenReturn(Arrays.asList(investment2, investment1));
        when(stockDataService.getCurrentPrice("AAPL")).thenReturn(BigDecimal.valueOf(160.00));
        when(stockDataService.getCurrentPrice("MSFT")).thenReturn(BigDecimal.valueOf(320.00));

        // Act
        List<InvestmentDTO> result = clientService.getClientInvestments("john.doe@example.com");

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("MSFT", result.get(0).getTickerSymbol()); // Most recent first
        assertEquals("AAPL", result.get(1).getTickerSymbol());

        verify(investmentRepository).findByClientOrderByCreatedDateDesc(client);
    }

    @Test
    void getInvestmentForClient_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));
        when(investmentRepository.findById(1L)).thenReturn(Optional.of(investment1));
        when(stockDataService.getCurrentPrice("AAPL")).thenReturn(BigDecimal.valueOf(160.00));

        // Act
        InvestmentDTO result = clientService.getInvestmentForClient("john.doe@example.com", 1L);

        // Assert
        assertNotNull(result);
        assertEquals("AAPL", result.getTickerSymbol());
        assertEquals(BigDecimal.valueOf(100), result.getShares());
        assertEquals(BigDecimal.valueOf(150.00), result.getPurchasePricePerShare());

        verify(investmentRepository).findById(1L);
    }

    @Test
    void getInvestmentForClient_NotOwned_ThrowsException() {
        // Arrange
        Investment otherClientInvestment = new Investment();
        otherClientInvestment.setId(3L);
        Client otherClient = new Client();
        otherClient.setId(2L);
        otherClientInvestment.setClient(otherClient);

        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));
        when(investmentRepository.findById(3L)).thenReturn(Optional.of(otherClientInvestment));

        // Act & Assert
        assertThrows(SecurityException.ForbiddenException.class, () -> {
            clientService.getInvestmentForClient("john.doe@example.com", 3L);
        });
    }

    @Test
    void sendMessageToEmployee_Success() {
        // Arrange
        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setSubject("Investment Question");
        messageDTO.setContent("I have a question about my AAPL investment.");

        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> {
            Message message = invocation.getArgument(0);
            message.setId(1L);
            return message;
        });

        // Act
        Map<String, Object> result = clientService.sendMessageToEmployee("john.doe@example.com", messageDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Message sent successfully", result.get("message"));
        assertEquals(1L, result.get("messageId"));
        assertEquals("jane.smith@company.com", result.get("recipientEmail"));

        verify(messageRepository).save(any(Message.class));
    }

    @Test
    void sendMessageToEmployee_NoAssignedEmployee_ThrowsException() {
        // Arrange
        client.setAssignedEmployee(null);

        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setSubject("Investment Question");
        messageDTO.setContent("I have a question about my AAPL investment.");

        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> {
            clientService.sendMessageToEmployee("john.doe@example.com", messageDTO);
        });
    }

    @Test
    void updateInvestmentPreferences_Success() {
        // Arrange
        Map<String, Object> preferences = new HashMap<>();
        preferences.put("riskTolerance", "MODERATE");
        preferences.put("investmentHorizon", "LONG_TERM");
        preferences.put("sectors", Arrays.asList("TECHNOLOGY", "HEALTHCARE"));

        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));
        when(clientRepository.save(any(Client.class))).thenReturn(client);

        // Act
        Map<String, Object> result = clientService.updateInvestmentPreferences("john.doe@example.com", preferences);

        // Assert
        assertNotNull(result);
        assertEquals("Investment preferences updated successfully", result.get("message"));
        assertEquals(preferences, result.get("preferences"));

        verify(clientRepository).save(client);
    }

    @Test
    void createInvestmentRequest_Success() {
        // Arrange
        Map<String, Object> investmentRequest = new HashMap<>();
        investmentRequest.put("stockSymbol", "GOOGL");
        investmentRequest.put("shares", 25.0);
        investmentRequest.put("requestType", "BUY");

        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));
        when(investmentRequestRepository.save(any(InvestmentRequest.class))).thenAnswer(invocation -> {
            InvestmentRequest request = invocation.getArgument(0);
            request.setId(1L);
            return request;
        });

        // Act
        Long result = clientService.createInvestmentRequest("john.doe@example.com", investmentRequest);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result);
        verify(investmentRequestRepository).save(any(InvestmentRequest.class));
    }

    @Test
    void createInvestmentRequest_InvalidRequestType_ThrowsException() {
        // Arrange
        Map<String, Object> investmentRequest = new HashMap<>();
        investmentRequest.put("stockSymbol", "GOOGL");
        investmentRequest.put("shares", 25.0);
        investmentRequest.put("requestType", "INVALID");

        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));

        // Act & Assert
        assertThrows(ValidationException.class, () -> {
            clientService.createInvestmentRequest("john.doe@example.com", investmentRequest);
        });
    }

    @Test
    void getTransactionHistory_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));
        when(transactionRepository.findByClientOrderByTransactionDateDesc(eq(client), any()))
                .thenReturn(Arrays.asList());

        // Act
        List<Map<String, Object>> result = clientService.getTransactionHistory("john.doe@example.com", 10);

        // Assert
        assertNotNull(result);
        verify(transactionRepository).findByClientOrderByTransactionDateDesc(eq(client), any());
    }

    @Test
    void getTaxDocuments_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));
        when(taxDocumentRepository.findByClientAndYear(client, 2024)).thenReturn(Arrays.asList());

        // Act
        List<Map<String, Object>> result = clientService.getTaxDocuments("john.doe@example.com", 2024);

        // Assert
        assertNotNull(result);
        verify(taxDocumentRepository).findByClientAndYear(client, 2024);
    }

    @Test
    void markMessageAsRead_Success() {
        // Arrange
        Message message = new Message();
        message.setId(1L);
        message.setRecipient(clientUserAccount);
        message.setRead(false);

        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(messageRepository.findById(1L)).thenReturn(Optional.of(message));
        when(messageRepository.save(any(Message.class))).thenReturn(message);

        // Act
        assertDoesNotThrow(() -> {
            clientService.markMessageAsRead("john.doe@example.com", 1L);
        });

        // Assert
        verify(messageRepository).save(message);
        assertTrue(message.isRead());
        assertNotNull(message.getReadAt());
    }

    @Test
    void markMessageAsRead_NotRecipient_ThrowsException() {
        // Arrange
        UserAccount otherUser = new UserAccount();
        otherUser.setId(99L);

        Message message = new Message();
        message.setId(1L);
        message.setRecipient(otherUser);
        message.setRead(false);

        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(messageRepository.findById(1L)).thenReturn(Optional.of(message));

        // Act & Assert
        assertThrows(SecurityException.ForbiddenException.class, () -> {
            clientService.markMessageAsRead("john.doe@example.com", 1L);
        });
    }

    @Test
    void getPerformanceReport_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));
        when(stockDataService.getCurrentPrice("AAPL")).thenReturn(BigDecimal.valueOf(160.00));
        when(stockDataService.getCurrentPrice("MSFT")).thenReturn(BigDecimal.valueOf(320.00));
        when(stockDataService.getHistoricalData(anyString(), any(), any())).thenReturn(Arrays.asList());

        // Act
        Map<String, Object> result = clientService.getPerformanceReport("john.doe@example.com", "MONTHLY");

        // Assert
        assertNotNull(result);
        assertEquals("MONTHLY", result.get("period"));
        assertNotNull(result.get("startDate"));
        assertNotNull(result.get("endDate"));
        assertEquals("CLI-001", result.get("clientId"));
        assertNotNull(result.get("totalReturn"));
        assertNotNull(result.get("averagePercentageReturn"));
        assertNotNull(result.get("investments"));
    }

    @Test
    void getInvestmentHistory_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));
        when(investmentRepository.findById(1L)).thenReturn(Optional.of(investment1));

        // Act
        List<Map<String, Object>> result = clientService.getInvestmentHistory("john.doe@example.com", 1L);

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals("PURCHASE", result.get(0).get("type"));
        assertEquals(investment1.getShares(), result.get(0).get("shares"));
        assertEquals(investment1.getPurchasePricePerShare(), result.get(0).get("price"));
    }

    @Test
    void getClientMessages_Success() {
        // Arrange
        Message message1 = new Message();
        message1.setId(1L);
        message1.setSender(clientUserAccount);
        message1.setRecipient(employee.getUserAccount());
        message1.setSubject("Question about portfolio");
        message1.setContent("What's my current performance?");
        message1.setSentAt(LocalDateTime.now().minusHours(2));
        message1.setRead(true);

        when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(clientUserAccount));
        when(clientRepository.findByUserAccount(clientUserAccount)).thenReturn(Optional.of(client));
        when(messageRepository.findByRecipientOrSenderOrderBySentAtDesc(clientUserAccount, clientUserAccount))
                .thenReturn(Arrays.asList(message1));

        // Act
        List<Map<String, Object>> result = clientService.getClientMessages("john.doe@example.com");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Question about portfolio", result.get(0).get("subject"));
        assertEquals("john.doe@example.com", result.get(0).get("senderEmail"));
    }
}