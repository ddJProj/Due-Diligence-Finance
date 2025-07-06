package com.ddfinance.backend.service.roles;

import com.ddfinance.backend.dto.actions.MessageDTO;
import com.ddfinance.backend.dto.investment.CreateInvestmentRequest;
import com.ddfinance.backend.dto.investment.InvestmentDTO;
import com.ddfinance.backend.dto.roles.ClientDTO;
import com.ddfinance.backend.dto.roles.EmployeeDetailsDTO;
import com.ddfinance.backend.repository.*;
import com.ddfinance.backend.service.notification.NotificationService;
import com.ddfinance.backend.service.stock.StockDataService;
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
 * Unit tests for EmployeeServiceImpl.
 * Tests all employee-specific operations including client management,
 * investment operations, and performance tracking.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private InvestmentRepository investmentRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ClientMeetingRepository clientMeetingRepository;

    @Mock
    private EmployeeScheduleRepository employeeScheduleRepository;

    @Mock
    private ReportGeneratorService reportGeneratorService;

    @Mock
    private StockDataService stockDataService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private UserAccount employeeUserAccount;
    private Employee employee;
    private UserAccount clientUserAccount1;
    private Client client1;
    private UserAccount clientUserAccount2;
    private Client client2;
    private Investment investment1;

    @BeforeEach
    void setUp() {
        // Setup employee user account
        employeeUserAccount = new UserAccount();
        employeeUserAccount.setId(1L);
        employeeUserAccount.setEmail("jane.smith@company.com");
        employeeUserAccount.setFirstName("Jane");
        employeeUserAccount.setLastName("Smith");
        employeeUserAccount.setRole(Role.EMPLOYEE);

        // Setup employee
        employee = new Employee();
        employee.setId(1L);
        employee.setUserAccount(employeeUserAccount);
        employee.setEmployeeId("EMP-001");
        employee.setTitle("Senior Financial Advisor");
        employee.setLocationId("NYC");

        // Setup client 1
        clientUserAccount1 = new UserAccount();
        clientUserAccount1.setId(2L);
        clientUserAccount1.setEmail("john.doe@example.com");
        clientUserAccount1.setFirstName("John");
        clientUserAccount1.setLastName("Doe");
        clientUserAccount1.setRole(Role.CLIENT);

        client1 = new Client();
        client1.setId(1L);
        client1.setClientId("CLI-001");
        client1.setUserAccount(clientUserAccount1);
        client1.setAssignedEmployee(employee);

        // Setup client 2
        clientUserAccount2 = new UserAccount();
        clientUserAccount2.setId(3L);
        clientUserAccount2.setEmail("alice.johnson@example.com");
        clientUserAccount2.setFirstName("Alice");
        clientUserAccount2.setLastName("Johnson");
        clientUserAccount2.setRole(Role.CLIENT);

        client2 = new Client();
        client2.setId(2L);
        client2.setClientId("CLI-002");
        client2.setUserAccount(clientUserAccount2);
        client2.setAssignedEmployee(employee);

        // Setup clients list for employee
        employee.setClientList(Set.of(client1, client2));

        // Setup investment
        investment1 = new Investment();
        investment1.setId(1L);
        investment1.setClient(client1);
        investment1.setStockSymbol("AAPL");
        investment1.setShares(BigDecimal.valueOf(100));
        investment1.setPurchasePrice(BigDecimal.valueOf(150.00));
        investment1.setStatus(InvestmentStatus.ACTIVE);
    }

    @Test
    void getEmployeeDetails_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));

        // Act
        EmployeeDetailsDTO result = employeeService.getEmployeeDetails("jane.smith@company.com");

        // Assert
        assertNotNull(result);
        assertEquals("jane.smith@company.com", result.getEmail());
        assertEquals("Jane", result.getFirstName());
        assertEquals("Smith", result.getLastName());
        assertEquals("EMP-001", result.getEmployeeId());
        assertEquals("Senior Financial Advisor", result.getTitle());
        assertEquals("NYC", result.getLocationId());
        assertEquals(2, result.getTotalClients());

        verify(employeeRepository).findByUserAccount(employeeUserAccount);
    }

    @Test
    void getEmployeeDetails_NotFound_ThrowsException() {
        // Arrange
        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> {
            employeeService.getEmployeeDetails("jane.smith@company.com");
        });
    }

    @Test
    void getAssignedClients_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));

        // Act
        List<ClientDTO> result = employeeService.getAssignedClients("jane.smith@company.com");

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(c -> c.getClientId().equals("CLI-001")));
        assertTrue(result.stream().anyMatch(c -> c.getClientId().equals("CLI-002")));

        verify(employeeRepository).findByUserAccount(employeeUserAccount);
    }

    @Test
    void getClientForEmployee_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client1));

        // Act
        ClientDTO result = employeeService.getClientForEmployee("jane.smith@company.com", 1L);

        // Assert
        assertNotNull(result);
        assertEquals("CLI-001", result.getClientId());
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());

        verify(clientRepository).findById(1L);
    }

    @Test
    void getClientForEmployee_NotAssigned_ThrowsException() {
        // Arrange
        Client unassignedClient = new Client();
        unassignedClient.setId(3L);
        unassignedClient.setAssignedEmployee(new Employee()); // Different employee

        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(clientRepository.findById(3L)).thenReturn(Optional.of(unassignedClient));

        // Act & Assert
        assertThrows(SecurityException.ForbiddenException.class, () -> {
            employeeService.getClientForEmployee("jane.smith@company.com", 3L);
        });
    }

    @Test
    void getClientInvestments_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client1));
        when(investmentRepository.findByClientOrderByCreatedDateDesc(client1)).thenReturn(Arrays.asList(investment1));

        // Act
        List<InvestmentDTO> result = employeeService.getClientInvestments("jane.smith@company.com", 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("AAPL", result.get(0).getTickerSymbol());

        verify(investmentRepository).findByClientOrderByCreatedDateDesc(client1);
    }

    @Test
    void createInvestment_Success() {
        // Arrange
        CreateInvestmentRequest request = new CreateInvestmentRequest();
        request.setClientId(1L);
        request.setStockSymbol("MSFT");
        request.setShares(BigDecimal.valueOf(50));
        request.setOrderType("MARKET");

        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client1));
        when(stockDataService.getCurrentPrice("MSFT")).thenReturn(BigDecimal.valueOf(300.00));
        when(stockDataService.getStockInfo("MSFT")).thenReturn(Map.of("name", "Microsoft Corporation"));
        when(investmentRepository.save(any(Investment.class))).thenAnswer(invocation -> {
            Investment inv = invocation.getArgument(0);
            inv.setId(2L);
            return inv;
        });

        // Act
        Map<String, Object> result = employeeService.createInvestment("jane.smith@company.com", request);

        // Assert
        assertNotNull(result);
        assertEquals("Investment created successfully", result.get("message"));
        assertNotNull(result.get("investmentId"));
        assertEquals("MSFT", result.get("stockSymbol"));

        verify(investmentRepository).save(any(Investment.class));
        verify(notificationService).notifyClientOfInvestment(eq(client1), any());
    }

    @Test
    void createInvestment_InvalidStock_ThrowsException() {
        // Arrange
        CreateInvestmentRequest request = new CreateInvestmentRequest();
        request.setClientId(1L);
        request.setStockSymbol("INVALID");
        request.setShares(BigDecimal.valueOf(50));

        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client1));
        when(stockDataService.getCurrentPrice("INVALID")).thenReturn(null);

        // Act & Assert
        assertThrows(ValidationException.class, () -> {
            employeeService.createInvestment("jane.smith@company.com", request);
        });
    }

    @Test
    void updateInvestmentStatus_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(investmentRepository.findById(1L)).thenReturn(Optional.of(investment1));
        when(investmentRepository.save(any(Investment.class))).thenReturn(investment1);

        // Act
        InvestmentDTO result = employeeService.updateInvestmentStatus("jane.smith@company.com", 1L, "COMPLETED");

        // Assert
        assertNotNull(result);
        assertEquals("COMPLETED", investment1.getStatus().name());

        verify(investmentRepository).save(investment1);
    }

    @Test
    void updateInvestmentStatus_InvalidTransition_ThrowsException() {
        // Arrange
        investment1.setStatus(InvestmentStatus.CANCELLED); // Terminal status

        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(investmentRepository.findById(1L)).thenReturn(Optional.of(investment1));

        // Act & Assert
        assertThrows(ValidationException.class, () -> {
            employeeService.updateInvestmentStatus("jane.smith@company.com", 1L, "ACTIVE");
        });
    }

    @Test
    void sendMessageToClient_Success() {
        // Arrange
        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setSubject("Portfolio Update");
        messageDTO.setContent("Your portfolio has been reviewed.");

        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client1));
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> {
            Message msg = invocation.getArgument(0);
            msg.setId(1L);
            return msg;
        });

        // Act
        Map<String, Object> result = employeeService.sendMessageToClient("jane.smith@company.com", 1L, messageDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Message sent successfully", result.get("message"));
        assertNotNull(result.get("messageId"));

        verify(messageRepository).save(any(Message.class));
    }

    @Test
    void getMessagesFromClients_Success() {
        // Arrange
        Message message1 = new Message();
        message1.setId(1L);
        message1.setSender(clientUserAccount1);
        message1.setRecipient(employeeUserAccount);
        message1.setSubject("Question");
        message1.setSentAt(LocalDateTime.now());

        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(messageRepository.findByRecipientAndSenderInOrderBySentAtDesc(
                eq(employeeUserAccount), anySet())).thenReturn(Arrays.asList(message1));

        // Act
        List<Map<String, Object>> result = employeeService.getMessagesFromClients("jane.smith@company.com");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Question", result.get(0).get("subject"));

        verify(messageRepository).findByRecipientAndSenderInOrderBySentAtDesc(eq(employeeUserAccount), anySet());
    }

    @Test
    void getPerformanceMetrics_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(investmentRepository.countByClientInAndStatus(anySet(), eq(InvestmentStatus.ACTIVE))).thenReturn(5L);
        when(investmentRepository.calculateTotalValueForClients(anySet())).thenReturn(BigDecimal.valueOf(500000));
        when(clientMeetingRepository.countByEmployeeAndDateBetween(any(), any(), any())).thenReturn(10L);

        // Act
        Map<String, Object> result = employeeService.getPerformanceMetrics("jane.smith@company.com");

        // Assert
        assertNotNull(result);
        assertEquals(2, result.get("totalClients"));
        assertEquals(5L, result.get("activeInvestments"));
        assertEquals(BigDecimal.valueOf(500000), result.get("totalAssetsUnderManagement"));
        assertNotNull(result.get("recentMeetings"));

        verify(investmentRepository).countByClientInAndStatus(anySet(), eq(InvestmentStatus.ACTIVE));
    }

    @Test
    void searchClients_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));

        // Act
        List<ClientDTO> result = employeeService.searchClients("jane.smith@company.com", "john");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John", result.get(0).getFirstName());
    }

    @Test
    void generateClientReport_Success() throws Exception {
        // Arrange
        byte[] mockReport = "PDF Report Content".getBytes();

        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client1));
        when(reportGeneratorService.generateClientReport(client1, "PDF")).thenReturn(mockReport);

        // Act
        byte[] result = employeeService.generateClientReport("jane.smith@company.com", 1L, "PDF");

        // Assert
        assertNotNull(result);
        assertArrayEquals(mockReport, result);

        verify(reportGeneratorService).generateClientReport(client1, "PDF");
    }

    @Test
    void getPendingInvestments_Success() {
        // Arrange
        Investment pendingInvestment = new Investment();
        pendingInvestment.setId(2L);
        pendingInvestment.setStatus(InvestmentStatus.PENDING);
        pendingInvestment.setClient(client1);

        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(investmentRepository.findByClientInAndStatusIn(anySet(), anySet()))
                .thenReturn(Arrays.asList(pendingInvestment));

        // Act
        List<InvestmentDTO> result = employeeService.getPendingInvestments("jane.smith@company.com");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("PENDING", result.get(0).getStatus());

        verify(investmentRepository).findByClientInAndStatusIn(anySet(), anySet());
    }

    @Test
    void updateClientNotes_Success() {
        // Arrange
        String notes = "Client is interested in tech stocks";

        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client1));
        when(clientRepository.save(any(Client.class))).thenReturn(client1);

        // Act
        assertDoesNotThrow(() -> {
            employeeService.updateClientNotes("jane.smith@company.com", 1L, notes);
        });

        // Assert
        verify(clientRepository).save(client1);
    }

    @Test
    void getEmployeeSchedule_Success() {
        // Arrange
        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(employeeScheduleRepository.findByEmployeeAndDateBetween(any(), any(), any()))
                .thenReturn(new ArrayList<>());

        // Act
        List<Map<String, Object>> result = employeeService.getEmployeeSchedule("jane.smith@company.com");

        // Assert
        assertNotNull(result);
        verify(employeeScheduleRepository).findByEmployeeAndDateBetween(any(), any(), any());
    }

    @Test
    void recordClientMeeting_Success() {
        // Arrange
        Map<String, Object> meetingDetails = new HashMap<>();
        meetingDetails.put("date", LocalDateTime.now().toString());
        meetingDetails.put("duration", 60);
        meetingDetails.put("subject", "Portfolio Review");
        meetingDetails.put("notes", "Discussed investment strategy");

        when(userAccountRepository.findByEmail("jane.smith@company.com")).thenReturn(Optional.of(employeeUserAccount));
        when(employeeRepository.findByUserAccount(employeeUserAccount)).thenReturn(Optional.of(employee));
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client1));
        when(clientMeetingRepository.save(any())).thenAnswer(invocation -> {
            ClientMeeting meeting = invocation.getArgument(0);
            meeting.setId(1L);
            return meeting;
        });

        // Act
        Long result = employeeService.recordClientMeeting("jane.smith@company.com", 1L, meetingDetails);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result);

        verify(clientMeetingRepository).save(any());
    }
}
