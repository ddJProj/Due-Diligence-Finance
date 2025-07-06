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
        dto.setTitle(employee.getTitle());
        dto.setLocationId(employee.getLocationId());
        dto.setDateJoined(employee.getUserAccount().getCreatedDate());

        // Calculate metrics
        dto.setTotalClients(employee.getClientList().size());

        // Calculate active investments and AUM
        Set<Client> clients = employee.getClientList();
        long activeInvestments = investmentRepository.countByClientInAndStatus(clients, InvestmentStatus.ACTIVE);
        BigDecimal totalAUM = investmentRepository.calculateTotalValueForClients(clients);

        dto.setActiveInvestments((int) activeInvestments);
        dto.setTotalAssetsUnderManagement(totalAUM != null ? totalAUM : BigDecimal.ZERO);

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

        // Validate stock symbol
        BigDecimal currentPrice = stockDataService.getCurrentPrice(request.getStockSymbol());
        if (currentPrice == null) {
            throw new ValidationException("Invalid stock symbol: " + request.getStockSymbol());
        }

        // Get stock info
        Map<String, Object> stockInfo = stockDataService.getStockInfo(request.getStockSymbol());
        String stockName = (String) stockInfo.getOrDefault("name", request.getStockSymbol());

        // Create investment
        Investment investment = new Investment();
        investment.setClient(client);
        investment.setTickerSymbol(request.getStockSymbol());
        investment.setName(stockName);
        investment.setShares(request.getShares());
        investment.setPurchasePricePerShare(currentPrice);
        investment.setStatus(InvestmentStatus.PENDING);
        investment.setCreatedDate(LocalDateTime.now());
        investment.set(request.getNotes());

        // Set order type and additional details
        investment.setOrderType(request.getOrderType() != null ? request.getOrderType() : "MARKET");
        if ("LIMIT".equals(request.getOrderType()) && request.getLimitPrice() != null) {
            investment.setTargetPrice(request.getLimitPrice());
        }

        Investment saved = investmentRepository.save(investment);

        // Notify client
        notificationService.notifyClientOfInvestment(client, saved);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Investment created successfully");
        result.put("investmentId", saved.getId());
        result.put("stockSymbol", saved.getStockSymbol());
        result.put("shares", saved.getShares());
        result.put("purchasePrice", saved.getPurchasePricePerShare());
        result.put("status", saved.getStatus().name());

        return result;
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

        // Parse and validate new status
        InvestmentStatus newStatus;
        try {
            newStatus = InvestmentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid investment status: " + status);
        }

        // Check if transition is valid
        if (!investment.getStatus().canTransitionTo(newStatus)) {
            throw new ValidationException(String.format("Cannot transition from %s to %s",
                    investment.getStatus(), newStatus));
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

        // Basic metrics
        Set<Client> clients = employee.getClientList();
        metrics.put("totalClients", clients.size());

        // Investment metrics
        long activeInvestments = investmentRepository.countByClientInAndStatus(clients, InvestmentStatus.ACTIVE);
        metrics.put("activeInvestments", activeInvestments);

        BigDecimal totalAUM = investmentRepository.calculateTotalValueForClients(clients);
        metrics.put("totalAssetsUnderManagement", totalAUM != null ? totalAUM : BigDecimal.ZERO);

        // Meeting metrics for last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long recentMeetings = clientMeetingRepository.countByEmployeeAndDateBetween(
                employee, thirtyDaysAgo, LocalDateTime.now()
        );
        metrics.put("recentMeetings", recentMeetings);

        // Performance by investment status
        Map<String, Long> investmentsByStatus = new HashMap<>();
        for (InvestmentStatus status : InvestmentStatus.values()) {
            long count = investmentRepository.countByClientInAndStatus(clients, status);
            investmentsByStatus.put(status.name(), count);
        }
        metrics.put("investmentsByStatus", investmentsByStatus);

        // Monthly performance trend
        List<Map<String, Object>> monthlyTrend = calculateMonthlyPerformance(clients);
        metrics.put("monthlyTrend", monthlyTrend);

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
    public byte[] generateClientReport(String email, Long clientId, String format) {
        Employee employee = findEmployeeByEmail(email);

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client", clientId));

        // Verify employee is assigned to this client
        if (!client.getAssignedEmployee().getId().equals(employee.getId())) {
            throw new SecurityException.ForbiddenException("You are not assigned to this client");
        }

        // Validate format
        if (!Arrays.asList("PDF", "CSV", "EXCEL").contains(format.toUpperCase())) {
            throw new ValidationException("Invalid report format: " + format);
        }

        try {
            return reportGeneratorService.generateClientReport(client, format);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate report: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvestmentDTO> getPendingInvestments(String email) {
        Employee employee = findEmployeeByEmail(email);

        Set<Client> clients = employee.getClientList();
        Set<InvestmentStatus> pendingStatuses = Set.of(
                InvestmentStatus.PENDING,
                InvestmentStatus.UNDER_REVIEW,
                InvestmentStatus.APPROVED
        );

        return investmentRepository.findByClientInAndStatusIn(clients, pendingStatuses).stream()
                .map(this::convertToInvestmentDTO)
                .sorted((a, b) -> b.getPurchaseDate().compareTo(a.getPurchaseDate()))
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

        client.setNotes(notes);
        client.setNotesLastUpdated(LocalDateTime.now());
        client.setNotesUpdatedBy(employee.getUserAccount().getEmail());

        clientRepository.save(client);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEmployeeSchedule(String email) {
        Employee employee = findEmployeeByEmail(email);

        LocalDateTime startDate = LocalDateTime.now().withHour(0).withMinute(0);
        LocalDateTime endDate = startDate.plusDays(30);

        List<EmployeeSchedule> schedules = employeeScheduleRepository
                .findByEmployeeAndDateBetween(employee, startDate, endDate);

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

        // Add upcoming client meetings
        List<ClientMeeting> meetings = clientMeetingRepository
                .findByEmployeeAndMeetingDateBetween(employee, startDate, endDate);

        for (ClientMeeting meeting : meetings) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", "meeting-" + meeting.getId());
            item.put("date", meeting.getMeetingDate());
            item.put("type", "CLIENT_MEETING");
            item.put("title", meeting.getSubject());
            item.put("description", "Client meeting");
            item.put("clientId", meeting.getClient().getId());
            item.put("clientName", meeting.getClient().getUserAccount().getFullName());
            item.put("duration", meeting.getDurationMinutes());
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

    // Helper methods

    private Employee findEmployeeByEmail(String email) {
        UserAccount userAccount = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User account not found"));

        return employeeRepository.findByUserAccount(userAccount)
                .orElseThrow(() -> new EntityNotFoundException("Employee profile not found"));
    }

    private ClientDTO convertToClientDTO(Client client) {
        ClientDTO dto = new ClientDTO();
        dto.setId(client.getId());
        dto.setClientId(client.getClientId());
        dto.setFirstName(client.getUserAccount().getFirstName());
        dto.setLastName(client.getUserAccount().getLastName());
        dto.setEmail(client.getUserAccount().getEmail());
        dto.setPhoneNumber(client.getUserAccount().getPhoneNumber());

        // Calculate portfolio value
        BigDecimal portfolioValue = calculateClientPortfolioValue(client);
        dto.setPortfolioValue(portfolioValue);

        // Count active investments
        long activeCount = client.getInvestments().stream()
                .filter(inv -> inv.getStatus() == InvestmentStatus.ACTIVE)
                .count();
        dto.setActiveInvestments((int) activeCount);

        return dto;
    }

    private InvestmentDTO convertToInvestmentDTO(Investment investment) {
        InvestmentDTO dto = new InvestmentDTO();
        dto.setId(investment.getId());
        dto.setTickerSymbol(investment.getTickerSymbol());
        dto.setName(investment.getName());
        dto.setShares(investment.getShares());
        dto.setPurchasePricePerShare(investment.getPurchasePricePerShare());
        dto.setPurchaseDate(investment.getCreatedDate());
        dto.setStatus(investment.getStatus().name());
        dto.setNotes(investment.getNotes());

        // Get current price and calculate value
        BigDecimal currentPrice = stockDataService.getCurrentPrice(investment.getTickerSymbol());
        dto.setCurrentPrice(currentPrice);

        if (currentPrice != null) {
            dto.setCurrentValue(currentPrice.multiply(investment.getShares()));

            // Calculate gain/loss
            BigDecimal purchaseValue = investment.getPurchasePricePerShare().multiply(investment.getShares());
            BigDecimal gain = dto.getCurrentValue().subtract(purchaseValue);
            dto.setUnrealizedGain(gain);
            dto.setUnrealizedGainPercentage(
                    purchaseValue.signum() > 0 ?
                            gain.divide(purchaseValue, 4, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100)) :
                            BigDecimal.ZERO
            );
        }

        return dto;
    }

    private Map<String, Object> convertMessageToMap(Message message) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", message.getId());
        map.put("subject", message.getSubject());
        map.put("content", message.getContent());
        map.put("senderEmail", message.getSender().getEmail());
        map.put("senderName", message.getSender().getFullName());
        map.put("sentAt", message.getSentAt());
        map.put("read", message.isRead());

        // Find which client sent this
        Optional<Client> senderClient = clientRepository.findByUserAccount(message.getSender());
        if (senderClient.isPresent()) {
            map.put("clientId", senderClient.get().getId());
            map.put("clientName", senderClient.get().getClientId());
        }

        return map;
    }

    private BigDecimal calculateClientPortfolioValue(Client client) {
        BigDecimal totalValue = BigDecimal.ZERO;

        for (Investment investment : client.getInvestments()) {
            if (investment.getStatus() == InvestmentStatus.ACTIVE) {
                BigDecimal currentPrice = stockDataService.getCurrentPrice(investment.getTickerSymbol());
                if (currentPrice != null) {
                    BigDecimal value = currentPrice.multiply(investment.getShares());
                    totalValue = totalValue.add(value);
                }
            }
        }

        return totalValue;
    }

    private List<Map<String, Object>> calculateMonthlyPerformance(Set<Client> clients) {
        List<Map<String, Object>> monthlyData = new ArrayList<>();

        // Calculate for last 6 months
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = LocalDateTime.now().minusMonths(i).withDayOfMonth(1);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusDays(1);

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthStart.getMonth().toString());
            monthData.put("year", monthStart.getYear());

            // TODO: Calculate actual performance metrics
            monthData.put("newInvestments", 0);
            monthData.put("totalValue", BigDecimal.ZERO);

            monthlyData.add(monthData);
        }

        return monthlyData;
    }
}
