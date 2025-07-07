package com.ddfinance.backend.service.roles;

import com.ddfinance.backend.dto.actions.MessageDTO;
import com.ddfinance.backend.dto.investment.CreateInvestmentRequest;
import com.ddfinance.backend.dto.investment.InvestmentDTO;
import com.ddfinance.backend.dto.roles.ClientDTO;
import com.ddfinance.backend.dto.roles.EmployeeDetailsDTO;
import com.ddfinance.backend.repository.*;
import com.ddfinance.backend.service.notification.NotificationService;
import com.ddfinance.backend.service.investment.StockDataService;
import com.ddfinance.core.domain.*;
import com.ddfinance.core.domain.enums.InvestmentStatus;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.SecurityException;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service implementation for employee-specific operations.
 * Handles client management, investment operations, and employee metrics.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final UserAccountRepository userAccountRepository;
    private final EmployeeRepository employeeRepository;
    private final ClientRepository clientRepository;
    private final InvestmentRepository investmentRepository;
    private final MessageRepository messageRepository;
    private final ClientMeetingRepository clientMeetingRepository;
    private final EmployeeScheduleRepository employeeScheduleRepository;
    private final ReportGeneratorService reportGeneratorService;
    private final StockDataService stockDataService;
    private final NotificationService notificationService;

    @Autowired
    public EmployeeServiceImpl(UserAccountRepository userAccountRepository,
                               EmployeeRepository employeeRepository,
                               ClientRepository clientRepository,
                               InvestmentRepository investmentRepository,
                               MessageRepository messageRepository,
                               ClientMeetingRepository clientMeetingRepository,
                               EmployeeScheduleRepository employeeScheduleRepository,
                               ReportGeneratorService reportGeneratorService,
                               StockDataService stockDataService,
                               NotificationService notificationService) {
        this.userAccountRepository = userAccountRepository;
        this.employeeRepository = employeeRepository;
        this.clientRepository = clientRepository;
        this.investmentRepository = investmentRepository;
        this.messageRepository = messageRepository;
        this.clientMeetingRepository = clientMeetingRepository;
        this.employeeScheduleRepository = employeeScheduleRepository;
        this.reportGeneratorService = reportGeneratorService;
        this.stockDataService = stockDataService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDetailsDTO getEmployeeDetails(String email) {
        Employee employee = findEmployeeByEmail(email);

        EmployeeDetailsDTO dto = new EmployeeDetailsDTO();
        dto.setId(employee.getId());
        dto.setEmployeeId(employee.getEmployeeId());
        dto.setEmail(employee.getUserAccount().getEmail());
        dto.setFirstName(employee.getUserAccount().getFirstName());
        dto.setLastName(employee.getUserAccount().getLastName());
        dto.setDepartment(employee.getDepartment());
        dto.setLocation(employee.getLocationId());
        dto.setHireDate(employee.getHireDate());
        dto.setManagerId(employee.getManagerId());
        dto.setSalary(employee.getSalary());
        dto.setEmploymentStatus(employee.getIsActive() ? "ACTIVE" : "INACTIVE");
        dto.setYearsOfExperience((int) employee.getYearsOfService());

        // Calculate metrics
        dto.setTotalClients(employee.getClientList().size());
        dto.setActiveClients(employee.getActiveClients().size());

        // Calculate active investments and AUM
        Set<Client> clients = employee.getClientList();
        BigDecimal totalAUM = investmentRepository.calculateTotalValueForClients(clients);
        dto.setTotalAssetsUnderManagement(totalAUM != null ? totalAUM.doubleValue() : 0.0);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientDTO> getAssignedClients(String email) {
        Employee employee = findEmployeeByEmail(email);

        return employee.getClientList().stream()
                .map(this::convertToClientDTO)
                .sorted((a, b) -> a.getLastName().compareToIgnoreCase(b.getLastName()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDTO getClientForEmployee(String email, Long clientId) {
        Employee employee = findEmployeeByEmail(email);

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client", clientId));

        // Verify employee is assigned to this client
        if (!client.getAssignedEmployee().getId().equals(employee.getId())) {
            throw new SecurityException.ForbiddenException("You are not assigned to this client");
        }

        return convertToClientDTO(client);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvestmentDTO> getClientInvestments(String email, Long clientId) {
        Employee employee = findEmployeeByEmail(email);

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client", clientId));

        // Verify employee is assigned to this client
        if (!client.getAssignedEmployee().getId().equals(employee.getId())) {
            throw new SecurityException.ForbiddenException("You are not assigned to this client");
        }

        return investmentRepository.findByClientOrderByCreatedDateDesc(client).stream()
                .map(this::convertToInvestmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> createInvestment(String email, CreateInvestmentRequest request) {
        Employee employee = findEmployeeByEmail(email);

        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new EntityNotFoundException("Client", request.getClientId()));

        // Verify employee is assigned to this client
        if (!client.getAssignedEmployee().getId().equals(employee.getId())) {
            throw new SecurityException.ForbiddenException("You are not assigned to this client");
        }

        // Validate stock symbol and get current price
        BigDecimal currentPrice = stockDataService.getCurrentPrice(request.getStockSymbol());
        if (currentPrice == null) {
            throw new ValidationException("Invalid stock symbol: " + request.getStockSymbol());
        }

        // Get stock info
        Map<String, Object> stockInfo = stockDataService.getStockInfo(request.getStockSymbol());
        String stockName = (String) stockInfo.getOrDefault("name", request.getStockSymbol());

        // Create investment using the constructor
        Investment investment = new Investment(
                stockName,
                request.getStockSymbol(),
                BigDecimal.valueOf(request.getQuantity()),
                currentPrice,
                client,
                employee
        );

        // Set additional fields
        investment.setCurrentPricePerShare(currentPrice);
        investment.setCurrentValue(investment.getShares().multiply(currentPrice));
        investment.setInvestmentType("STOCK");

        // Set order type and target price for limit orders
        if (request.getOrderType() != null) {
            investment.setOrderType(request.getOrderType());
            if ("LIMIT".equals(request.getOrderType()) && request.getTargetPrice() != null) {
                investment.setTargetPrice(BigDecimal.valueOf(request.getTargetPrice()));
            }
        }

        // Set description if provided
        if (request.getNotes() != null) {
            investment.setDescription(request.getNotes());
        }

        Investment saved = investmentRepository.save(investment);

        // Process the order based on type
        processInvestmentOrder(saved, request.getOrderType());

        // Send notification
        notifyClientOfNewInvestment(client, saved);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Investment created successfully");
        response.put("investmentId", saved.getId());
        response.put("tickerSymbol", saved.getTickerSymbol());
        response.put("shares", saved.getShares());
        response.put("purchasePrice", saved.getPurchasePricePerShare());
        response.put("status", saved.getStatus().toString());

        return response;
    }

    @Override
    public InvestmentDTO updateInvestmentStatus(String email, Long investmentId, String status) {
        Employee employee = findEmployeeByEmail(email);

        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new EntityNotFoundException("Investment", investmentId));

        // Verify employee is assigned to this client
        if (!investment.getClient().getAssignedEmployee().getId().equals(employee.getId())) {
            throw new SecurityException.ForbiddenException("You are not assigned to this client");
        }

        InvestmentStatus newStatus;
        try {
            newStatus = InvestmentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid investment status: " + status);
        }

        // Validate status transition
        if (!investment.getStatus().canTransitionTo(newStatus)) {
            throw new ValidationException(
                    String.format("Cannot transition from %s to %s",
                            investment.getStatus(), newStatus)
            );
        }

        investment.setStatus(newStatus);
        investment.setLastModifiedAt(LocalDateTime.now());

        Investment updated = investmentRepository.save(investment);

        return convertToInvestmentDTO(updated);
    }

    @Override
    public Map<String, Object> sendMessageToClient(String email, Long clientId, MessageDTO message) {
        Employee employee = findEmployeeByEmail(email);

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client", clientId));

        // Verify employee is assigned to this client
        if (!client.getAssignedEmployee().getId().equals(employee.getId())) {
            throw new SecurityException.ForbiddenException("You are not assigned to this client");
        }

        Message newMessage = new Message();
        newMessage.setSender(employee.getUserAccount());
        newMessage.setRecipient(client.getUserAccount());
        newMessage.setSubject(message.getSubject());
        newMessage.setContent(message.getContent());
        newMessage.setSentAt(LocalDateTime.now());
        newMessage.setRead(false);

        Message saved = messageRepository.save(newMessage);

        // Send notification
        notificationService.sendNotification(
                client.getUserAccount().getEmail(),
                message.getSubject(),
                message.getContent()
        );

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Message sent successfully");
        result.put("messageId", saved.getId());
        result.put("recipientEmail", client.getUserAccount().getEmail());

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMessagesFromClients(String email) {
        Employee employee = findEmployeeByEmail(email);

        // Get all client user accounts
        Set<UserAccount> clientAccounts = employee.getClientList().stream()
                .map(Client::getUserAccount)
                .collect(Collectors.toSet());

        List<Message> messages = messageRepository.findByRecipientAndSenderInOrderBySentAtDesc(
                employee.getUserAccount(), clientAccounts
        );

        return messages.stream()
                .map(this::convertMessageToMap)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPerformanceMetrics(String email) {
        Employee employee = findEmployeeByEmail(email);

        Map<String, Object> metrics = new HashMap<>();

        // Client metrics
        metrics.put("totalClients", employee.getClientCount());
        metrics.put("activeClients", employee.getActiveClients().size());

        // Investment metrics
        Set<Client> clients = employee.getClientList();
        long activeInvestments = investmentRepository.countByClientInAndStatus(clients, InvestmentStatus.ACTIVE);
        BigDecimal totalAUM = investmentRepository.calculateTotalValueForClients(clients);

        metrics.put("activeInvestments", activeInvestments);
        metrics.put("totalAssetsUnderManagement", totalAUM != null ? totalAUM : BigDecimal.ZERO);

        // Performance calculations
        BigDecimal totalReturns = calculateTotalReturns(clients);
        metrics.put("totalReturns", totalReturns);
        metrics.put("averageReturnPercentage", calculateAverageReturnPercentage(clients));

        // Activity metrics
        metrics.put("messagesThisMonth", getMonthlyMessageCount(employee));
        metrics.put("meetingsThisWeek", getWeeklyMeetingCount(employee));

        return metrics;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientDTO> searchClients(String email, String query) {
        Employee employee = findEmployeeByEmail(email);

        String searchTerm = query.toLowerCase();

        return employee.getClientList().stream()
                .filter(client -> {
                    UserAccount ua = client.getUserAccount();
                    return ua.getFirstName().toLowerCase().contains(searchTerm) ||
                            ua.getLastName().toLowerCase().contains(searchTerm) ||
                            ua.getEmail().toLowerCase().contains(searchTerm) ||
                            client.getClientId().toLowerCase().contains(searchTerm);
                })
                .map(this::convertToClientDTO)
                .collect(Collectors.toList());
    }

    @Override
    public byte[] generateClientReport(String email, Long clientId, String reportType) {
        Employee employee = findEmployeeByEmail(email);

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client", clientId));

        // Verify employee is assigned to this client
        if (!client.getAssignedEmployee().getId().equals(employee.getId())) {
            throw new SecurityException.ForbiddenException("You are not assigned to this client");
        }

        try {
            return reportGeneratorService.generateClientReport(client, reportType);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate report: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvestmentDTO> getPendingInvestments(String email) {
        Employee employee = findEmployeeByEmail(email);

        Set<Client> clients = employee.getClientList();

        // Use the enum's built-in method for getting pending statuses
        Set<InvestmentStatus> pendingStatuses = InvestmentStatus.getPendingStatuses();

        return investmentRepository.findByClientInAndStatusIn(clients, pendingStatuses).stream()
                .map(this::convertToInvestmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void updateClientNotes(String email, Long clientId, String notes) {
        Employee employee = findEmployeeByEmail(email);

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client", clientId));

        // Verify employee is assigned to this client
        if (!client.getAssignedEmployee().getId().equals(employee.getId())) {
            throw new SecurityException.ForbiddenException("You are not assigned to this client");
        }

        // Store notes in investment preferences map
        Map<String, Object> preferences = client.getInvestmentPreferences();
        preferences.put("employeeNotes", notes);
        preferences.put("notesLastUpdated", LocalDateTime.now().toString());
        preferences.put("notesUpdatedBy", employee.getUserAccount().getEmail());

        clientRepository.save(client);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEmployeeSchedule(String email) {
        Employee employee = findEmployeeByEmail(email);

        LocalDateTime startDate = LocalDateTime.now().withHour(0).withMinute(0);
        LocalDateTime endDate = startDate.plusDays(30);

        List<EmployeeSchedule> schedules = employeeScheduleRepository
                .findByEmployeeAndScheduleDateBetween(employee, startDate, endDate);

        List<Map<String, Object>> scheduleList = new ArrayList<>();

        // Add scheduled items
        for (EmployeeSchedule schedule : schedules) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", schedule.getId());
            item.put("date", schedule.getScheduleDate());
            item.put("type", schedule.getEventType());
            item.put("title", schedule.getTitle());
            item.put("description", schedule.getDescription());
            item.put("clientId", schedule.getClient() != null ? schedule.getClient().getId() : null);
            item.put("clientName", schedule.getClient() != null ?
                    schedule.getClient().getUserAccount().getFullName() : null);
            scheduleList.add(item);
        }

        // Add client meetings
        List<ClientMeeting> meetings = clientMeetingRepository
                .findByEmployeeAndMeetingDateBetween(employee, startDate, endDate);

        for (ClientMeeting meeting : meetings) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", "meeting-" + meeting.getId());
            item.put("date", meeting.getMeetingDate());
            item.put("type", "MEETING");
            item.put("title", meeting.getSubject());
            item.put("description", meeting.getNotes());
            item.put("clientId", meeting.getClient().getId());
            item.put("clientName", meeting.getClient().getUserAccount().getFullName());
            scheduleList.add(item);
        }

        // Sort by date
        scheduleList.sort((a, b) -> {
            LocalDateTime dateA = (LocalDateTime) a.get("date");
            LocalDateTime dateB = (LocalDateTime) b.get("date");
            return dateA.compareTo(dateB);
        });

        return scheduleList;
    }

    @Override
    public Long recordClientMeeting(String email, Long clientId, Map<String, Object> meetingDetails) {
        Employee employee = findEmployeeByEmail(email);

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client", clientId));

        // Verify employee is assigned to this client
        if (!client.getAssignedEmployee().getId().equals(employee.getId())) {
            throw new SecurityException.ForbiddenException("You are not assigned to this client");
        }

        ClientMeeting meeting = new ClientMeeting();
        meeting.setEmployee(employee);
        meeting.setClient(client);

        // Parse meeting date
        String dateStr = (String) meetingDetails.get("date");
        LocalDateTime meetingDate = LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        meeting.setMeetingDate(meetingDate);

        meeting.setDurationMinutes((Integer) meetingDetails.get("duration"));
        meeting.setSubject((String) meetingDetails.get("subject"));
        meeting.setNotes((String) meetingDetails.get("notes"));
        meeting.setMeetingType((String) meetingDetails.getOrDefault("type", "IN_PERSON"));
        meeting.setCreatedAt(LocalDateTime.now());

        ClientMeeting saved = clientMeetingRepository.save(meeting);

        return saved.getId();
    }

    // Helper Methods

    private Employee findEmployeeByEmail(String email) {
        UserAccount userAccount = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));

        return employeeRepository.findByUserAccount(userAccount)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found for user: " + email));
    }

    private ClientDTO convertToClientDTO(Client client) {
        ClientDTO dto = new ClientDTO();
        dto.setId(client.getId());
        dto.setEmail(client.getUserAccount().getEmail());
        dto.setFirstName(client.getUserAccount().getFirstName());
        dto.setLastName(client.getUserAccount().getLastName());

        // Set registration date from Client entity
        dto.setDateJoined(client.getRegistrationDate());

        // Set investment preferences from the map
        Map<String, Object> preferences = client.getInvestmentPreferences();
        if (preferences != null) {
            dto.setPhoneNumber((String) preferences.get("phoneNumber"));
            dto.setAddress((String) preferences.get("address"));
            dto.setRiskTolerance((String) preferences.get("riskTolerance"));
            dto.setInvestmentGoals((String) preferences.get("investmentGoals"));
            dto.setPreferredSectors((String) preferences.get("preferredSectors"));
        }

        dto.setIsActive("ACTIVE".equals(client.getClientStatus()));

        // Calculate portfolio value from investments
        List<Investment> investments = investmentRepository.findByClient(client);
        BigDecimal portfolioValue = investments.stream()
                .filter(inv -> inv.getCurrentValue() != null)
                .map(Investment::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setPortfolioValue(portfolioValue.doubleValue());
        dto.setTotalInvestments(investments.size());

        return dto;
    }

    private InvestmentDTO convertToInvestmentDTO(Investment investment) {
        InvestmentDTO dto = new InvestmentDTO();
        dto.setId(investment.getId());
        dto.setInvestmentId(investment.getInvestmentId());
        dto.setTickerSymbol(investment.getTickerSymbol());
        dto.setName(investment.getName());
        dto.setShares(investment.getShares());
        dto.setPurchasePricePerShare(investment.getPurchasePricePerShare());
        dto.setCurrentPrice(investment.getCurrentPricePerShare());
        dto.setStatus(investment.getStatus().toString());
        dto.setPurchaseDate(investment.getCreatedDate());

        // Calculate value and profit/loss
        BigDecimal currentValue = investment.getCurrentValue() != null ?
                investment.getCurrentValue() : investment.getShares().multiply(investment.getCurrentPricePerShare());
        BigDecimal totalCost = investment.getAmount() != null ?
                investment.getAmount() : investment.getShares().multiply(investment.getPurchasePricePerShare());
        BigDecimal unrealizedGain = currentValue.subtract(totalCost);

        dto.setCurrentValue(currentValue);
        dto.setTotalCost(totalCost);
        dto.setUnrealizedGain(unrealizedGain);

        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            dto.setUnrealizedGainPercentage(
                    unrealizedGain.divide(totalCost, 4, BigDecimal.ROUND_HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
            );
        }

        return dto;
    }

    private Map<String, Object> convertMessageToMap(Message message) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", message.getId());
        map.put("subject", message.getSubject());
        map.put("content", message.getContent());
        map.put("fromClient", message.getSender().getFullName());
        map.put("fromEmail", message.getSender().getEmail());
        map.put("sentAt", message.getSentAt());
        map.put("read", message.isRead());
        map.put("readAt", message.getReadAt());
        return map;
    }

    private void processInvestmentOrder(Investment investment, String orderType) {
        // TODO: Implement order processing logic based on order type
        // For now, just update status to ACTIVE for market orders
        if ("MARKET".equalsIgnoreCase(orderType)) {
            investment.setStatus(InvestmentStatus.ACTIVE);
            investmentRepository.save(investment);
        }
    }

    private void notifyClientOfNewInvestment(Client client, Investment investment) {
        notificationService.notifyClientOfInvestment(client, investment);
    }

    private BigDecimal calculateTotalReturns(Set<Client> clients) {
        BigDecimal totalReturns = BigDecimal.ZERO;

        for (Client client : clients) {
            List<Investment> investments = investmentRepository.findByClient(client);
            for (Investment investment : investments) {
                if (investment.getStatus() == InvestmentStatus.ACTIVE) {
                    totalReturns = totalReturns.add(investment.calculateGainLoss());
                }
            }
        }

        return totalReturns;
    }

    private Double calculateAverageReturnPercentage(Set<Client> clients) {
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalValue = BigDecimal.ZERO;

        for (Client client : clients) {
            List<Investment> investments = investmentRepository.findByClient(client);
            for (Investment investment : investments) {
                if (investment.getStatus() == InvestmentStatus.ACTIVE) {
                    totalCost = totalCost.add(investment.getAmount());
                    totalValue = totalValue.add(investment.getCurrentValue() != null ?
                            investment.getCurrentValue() : BigDecimal.ZERO);
                }
            }
        }

        if (totalCost.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }

        BigDecimal returnPercentage = totalValue.subtract(totalCost)
                .divide(totalCost, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return returnPercentage.doubleValue();
    }

    private Long getMonthlyMessageCount(Employee employee) {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        List<Message> messages = messageRepository.findBySenderOrderBySentAtDesc(employee.getUserAccount());

        return messages.stream()
                .filter(m -> m.getSentAt().isAfter(startOfMonth))
                .count();
    }

    private Long getWeeklyMeetingCount(Employee employee) {
        LocalDateTime startOfWeek = LocalDateTime.now().minusDays(7);
        LocalDateTime now = LocalDateTime.now();
        return clientMeetingRepository.countByEmployeeAndMeetingDateBetween(employee, startOfWeek, now);
    }
}
