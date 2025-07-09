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
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.SecurityException;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service implementation for client-specific operations.
 * Handles portfolio management, investments, and client-employee communication.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Service
@Transactional
public class ClientServiceImpl implements ClientService {

    private final UserAccountRepository userAccountRepository;
    private final ClientRepository clientRepository;
    private final InvestmentRepository investmentRepository;
    private final EmployeeRepository employeeRepository;
    private final MessageRepository messageRepository;
    private final InvestmentRequestRepository investmentRequestRepository;
    private final TransactionRepository transactionRepository;
    private final TaxDocumentRepository taxDocumentRepository;
    private final StockDataService stockDataService;

    @Autowired
    public ClientServiceImpl(UserAccountRepository userAccountRepository,
                             ClientRepository clientRepository,
                             InvestmentRepository investmentRepository,
                             EmployeeRepository employeeRepository,
                             MessageRepository messageRepository,
                             InvestmentRequestRepository investmentRequestRepository,
                             TransactionRepository transactionRepository,
                             TaxDocumentRepository taxDocumentRepository,
                             StockDataService stockDataService) {
        this.userAccountRepository = userAccountRepository;
        this.clientRepository = clientRepository;
        this.investmentRepository = investmentRepository;
        this.employeeRepository = employeeRepository;
        this.messageRepository = messageRepository;
        this.investmentRequestRepository = investmentRequestRepository;
        this.transactionRepository = transactionRepository;
        this.taxDocumentRepository = taxDocumentRepository;
        this.stockDataService = stockDataService;
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDetailsDTO getClientDetails(String email) {
        Client client = findClientByEmail(email);

        ClientDetailsDTO dto = new ClientDetailsDTO();
        dto.setId(client.getId());
        dto.setClientId(client.getClientId());
        dto.setEmail(client.getUserAccount().getEmail());
        dto.setFirstName(client.getUserAccount().getFirstName());
        dto.setLastName(client.getUserAccount().getLastName());
        dto.setPhoneNumber(client.getUserAccount().getPhoneNumber());
        dto.setDateJoined(client.getUserAccount().getCreatedDate());

        if (client.getAssignedEmployee() != null) {
            Employee employee = client.getAssignedEmployee();
            EmployeeDTO employeeDTO = new EmployeeDTO();
            employeeDTO.setId(employee.getId());
            employeeDTO.setEmployeeId(employee.getEmployeeId());
            employeeDTO.setEmail(employee.getUserAccount().getEmail());
            employeeDTO.setFirstName(employee.getUserAccount().getFirstName());
            employeeDTO.setLastName(employee.getUserAccount().getLastName());
            employeeDTO.setDepartment(employee.getDepartment());
            dto.setAssignedEmployee(employeeDTO);
        }

        // Set account status
        dto.setIsActive(client.getUserAccount().isActive());
        dto.setAccountStatus(client.getUserAccount().isActive() ? "ACTIVE" : "INACTIVE");

        // Set investment preferences
        dto.setRiskTolerance(client.getRiskProfile());

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioSummaryDTO getPortfolioSummary(String email) {
        Client client = findClientByEmail(email);

        PortfolioSummaryDTO summary = new PortfolioSummaryDTO();
        summary.setClientId(client.getClientId());

        List<Investment> investments = new ArrayList<>(client.getInvestments());
        summary.setTotalInvestments(investments.size());

        BigDecimal totalValue = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;

        List<InvestmentDTO> investmentDTOs = new ArrayList<>();

        for (Investment investment : investments) {
            BigDecimal currentPrice = stockDataService.getCurrentPrice(investment.getTickerSymbol());
            BigDecimal currentValue = currentPrice.multiply(investment.getShares());
            BigDecimal cost = investment.getPurchasePricePerShare().multiply(investment.getShares());

            totalValue = totalValue.add(currentValue);
            totalCost = totalCost.add(cost);

            InvestmentDTO investmentDTO = convertToInvestmentDTO(investment);
            investmentDTO.setCurrentPrice(currentPrice);
            investmentDTO.setCurrentValue(currentValue);
            investmentDTOs.add(investmentDTO);
        }

        summary.setTotalValue(totalValue);
        summary.setTotalCost(totalCost);
        summary.setTotalGain(totalValue.subtract(totalCost));

        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal gainPercentage = summary.getTotalGain()
                    .divide(totalCost, 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            summary.setTotalGainPercentage(gainPercentage);
        } else {
            summary.setTotalGainPercentage(BigDecimal.ZERO);
        }

        summary.setInvestments(investmentDTOs);
        summary.setLastUpdated(LocalDateTime.now());

        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvestmentDTO> getClientInvestments(String email) {
        Client client = findClientByEmail(email);

        return investmentRepository.findByClientOrderByCreatedDateDesc(client)
                .stream()
                .map(this::convertToInvestmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InvestmentDTO getInvestmentForClient(String email, Long investmentId) {
        Client client = findClientByEmail(email);

        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new EntityNotFoundException("Investment", investmentId));

        if (!investment.getClient().getId().equals(client.getId())) {
            throw new SecurityException.ForbiddenException("You do not have access to this investment");
        }

        return convertToInvestmentDTO(investment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getInvestmentHistory(String email, Long investmentId) {
        Client client = findClientByEmail(email);

        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new EntityNotFoundException("Investment", investmentId));

        if (!investment.getClient().getId().equals(client.getId())) {
            throw new SecurityException.ForbiddenException("You do not have access to this investment");
        }

        // TODO: Implement transaction history retrieval for specific investment
        List<Map<String, Object>> history = new ArrayList<>();

        // Add initial purchase transaction
        Map<String, Object> purchaseTransaction = new HashMap<>();
        purchaseTransaction.put("date", investment.getCreatedDate());
        purchaseTransaction.put("type", "PURCHASE");
        purchaseTransaction.put("shares", investment.getShares());
        purchaseTransaction.put("price", investment.getPurchasePricePerShare());
        purchaseTransaction.put("totalAmount", investment.getPurchasePricePerShare().multiply(investment.getShares()));
        history.add(purchaseTransaction);

        return history;
    }

    @Override
    public Map<String, Object> sendMessageToEmployee(String email, MessageDTO message) {
        Client client = findClientByEmail(email);

        if (client.getAssignedEmployee() == null) {
            throw new EntityNotFoundException("No employee assigned to this client");
        }

        Message newMessage = new Message();
        newMessage.setSender(client.getUserAccount());
        newMessage.setRecipient(client.getAssignedEmployee().getUserAccount());
        newMessage.setSubject(message.getSubject());
        newMessage.setContent(message.getContent());
        newMessage.setSentAt(LocalDateTime.now());
        newMessage.setRead(false);

        Message savedMessage = messageRepository.save(newMessage);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Message sent successfully");
        result.put("messageId", savedMessage.getId());
        result.put("recipientEmail", client.getAssignedEmployee().getUserAccount().getEmail());

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getClientMessages(String email) {
        Client client = findClientByEmail(email);

        List<Message> messages = messageRepository.findByRecipientOrSenderOrderBySentAtDesc(
                client.getUserAccount(), client.getUserAccount()
        );

        return messages.stream()
                .map(this::convertMessageToMap)
                .collect(Collectors.toList());
    }

    @Override
    public void markMessageAsRead(String email, Long messageId) {
        UserAccount user = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new EntityNotFoundException("Message", messageId));

        if (!message.getRecipient().getId().equals(user.getId())) {
            throw new SecurityException.ForbiddenException("You cannot mark this message as read");
        }

        message.setRead(true);
        message.setReadAt(LocalDateTime.now());
        messageRepository.save(message);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPerformanceReport(String email, String period) {
        Client client = findClientByEmail(email);

        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = calculateStartDate(period, endDate);

        Map<String, Object> report = new HashMap<>();
        report.put("period", period);
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        report.put("clientId", client.getClientId());

        // TODO: Implement detailed performance metrics using historical stock data
        List<Investment> investments = new ArrayList<>(client.getInvestments());

        BigDecimal totalReturn = BigDecimal.ZERO;
        BigDecimal totalPercentageGain = BigDecimal.ZERO;

        List<Map<String, Object>> investmentPerformance = new ArrayList<>();

        for (Investment investment : investments) {
            Map<String, Object> perf = calculateInvestmentPerformance(investment, startDate, endDate);
            investmentPerformance.add(perf);

            totalReturn = totalReturn.add((BigDecimal) perf.get("absoluteReturn"));
            totalPercentageGain = totalPercentageGain.add((BigDecimal) perf.get("percentageReturn"));
        }

        report.put("totalReturn", totalReturn);
        report.put("averagePercentageReturn", investments.isEmpty() ? BigDecimal.ZERO :
                totalPercentageGain.divide(BigDecimal.valueOf(investments.size()), 2, RoundingMode.HALF_UP));
        report.put("investments", investmentPerformance);

        return report;
    }

    @Override
    public Map<String, Object> updateInvestmentPreferences(String email, Map<String, Object> preferences) {
        Client client = findClientByEmail(email);

        // Validate preferences
        validateInvestmentPreferences(preferences);

        client.setInvestmentPreferences(preferences);

        // Update risk profile if provided
        if (preferences.containsKey("riskTolerance")) {
            client.setRiskProfile((String) preferences.get("riskTolerance"));
        }

        clientRepository.save(client);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Investment preferences updated successfully");
        result.put("preferences", preferences);

        return result;
    }

    @Override
    public Long createInvestmentRequest(String email, Map<String, Object> investmentRequest) {
        Client client = findClientByEmail(email);

        // Validate request
        validateInvestmentRequest(investmentRequest);

        InvestmentRequest request = new InvestmentRequest();
        request.setClient(client);
        request.setStockSymbol((String) investmentRequest.get("stockSymbol"));
        request.setShares(BigDecimal.valueOf(((Number) investmentRequest.get("shares")).doubleValue()));
        request.setRequestType((String) investmentRequest.get("requestType"));
        request.setStatus("PENDING");
        request.setSubmittedAt(LocalDateTime.now());

        InvestmentRequest savedRequest = investmentRequestRepository.save(request);

        return savedRequest.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTransactionHistory(String email, Integer limit) {
        Client client = findClientByEmail(email);

        PageRequest pageRequest = PageRequest.of(0, limit != null ? limit : 50);

        List<Transaction> transactions = transactionRepository
                .findByClientOrderByTransactionDateDesc(client, pageRequest);

        return transactions.stream()
                .map(this::convertTransactionToMap)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTaxDocuments(String email, Integer year) {
        Client client = findClientByEmail(email);

        List<TaxDocument> documents = taxDocumentRepository.findByClientAndYear(client, year);

        return documents.stream()
                .map(this::convertTaxDocumentToMap)
                .collect(Collectors.toList());
    }

    // Helper methods

    private Client findClientByEmail(String email) {
        UserAccount userAccount = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User account not found"));

        return clientRepository.findByUserAccount(userAccount)
                .orElseThrow(() -> new EntityNotFoundException("Client profile not found"));
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

        // Calculate current value using stock data service
        BigDecimal currentPrice = stockDataService.getCurrentPrice(investment.getTickerSymbol());
        dto.setCurrentPrice(currentPrice);
        dto.setCurrentValue(currentPrice.multiply(investment.getShares()));

        return dto;
    }

    private Map<String, Object> convertMessageToMap(Message message) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", message.getId());
        map.put("subject", message.getSubject());
        map.put("content", message.getContent());
        map.put("senderEmail", message.getSender().getEmail());
        map.put("senderName", message.getSender().getFullName());
        map.put("recipientEmail", message.getRecipient().getEmail());
        map.put("recipientName", message.getRecipient().getFullName());
        map.put("sentAt", message.getSentAt());
        map.put("read", message.isRead());
        map.put("readAt", message.getReadAt());
        return map;
    }

    private Map<String, Object> convertTransactionToMap(Transaction transaction) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", transaction.getId());
        map.put("type", transaction.getTransactionType());
        map.put("amount", transaction.getTotalAmount());
        map.put("description", transaction.getDescription());  // This is correct for your entity
        map.put("date", transaction.getTransactionDate());

        if (transaction.getInvestment() != null) {
            map.put("investmentId", transaction.getInvestment().getId());
            map.put("tickerSymbol", transaction.getInvestment().getTickerSymbol());
        }

        return map;
    }

    private Map<String, Object> convertTaxDocumentToMap(TaxDocument document) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", document.getId());
        map.put("documentType", document.getDocumentType());
        map.put("year", document.getYear());
        map.put("generatedDate", document.getGeneratedDate());
        map.put("fileName", document.getFileName());
        map.put("fileSize", document.getFileSize());
        map.put("isFinal", document.isFinalVersion());
        map.put("sentToClient", document.isSentToClient());
        return map;
    }

    private LocalDateTime calculateStartDate(String period, LocalDateTime endDate) {
        return switch (period.toUpperCase()) {
            case "DAILY" -> endDate.minusDays(1);
            case "WEEKLY" -> endDate.minusWeeks(1);
            case "MONTHLY" -> endDate.minusMonths(1);
            case "YEARLY" -> endDate.minusYears(1);
            default -> endDate.minusMonths(1); // Default to monthly
        };
    }

    private Map<String, Object> calculateInvestmentPerformance(Investment investment,
                                                               LocalDateTime startDate,
                                                               LocalDateTime endDate) {
        Map<String, Object> performance = new HashMap<>();
        performance.put("tickerSymbol", investment.getTickerSymbol());
        performance.put("shares", investment.getShares());

        // Get historical data from stock service
        List<Map<String, Object>> historicalData = stockDataService.getHistoricalData(
                investment.getTickerSymbol(), startDate, endDate
        );

        // TODO: Calculate actual performance based on historical data
        BigDecimal currentPrice = stockDataService.getCurrentPrice(investment.getTickerSymbol());
        BigDecimal currentValue = currentPrice.multiply(investment.getShares());
        BigDecimal purchaseValue = investment.getPurchasePricePerShare().multiply(investment.getShares());
        BigDecimal absoluteReturn = currentValue.subtract(purchaseValue);

        BigDecimal percentageReturn = BigDecimal.ZERO;
        if (purchaseValue.compareTo(BigDecimal.ZERO) > 0) {
            percentageReturn = absoluteReturn.divide(purchaseValue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        performance.put("absoluteReturn", absoluteReturn);
        performance.put("percentageReturn", percentageReturn);
        performance.put("currentValue", currentValue);

        return performance;
    }

    private void validateInvestmentPreferences(Map<String, Object> preferences) {
        if (preferences == null || preferences.isEmpty()) {
            throw new ValidationException("Investment preferences cannot be empty");
        }

        // Validate risk tolerance if present
        if (preferences.containsKey("riskTolerance")) {
            String riskTolerance = (String) preferences.get("riskTolerance");
            if (!Arrays.asList("LOW", "MODERATE", "HIGH", "AGGRESSIVE").contains(riskTolerance)) {
                throw new ValidationException("Invalid risk tolerance value");
            }
        }

        // Validate investment horizon if present
        if (preferences.containsKey("investmentHorizon")) {
            String horizon = (String) preferences.get("investmentHorizon");
            if (!Arrays.asList("SHORT_TERM", "MEDIUM_TERM", "LONG_TERM").contains(horizon)) {
                throw new ValidationException("Invalid investment horizon value");
            }
        }
    }

    private void validateInvestmentRequest(Map<String, Object> request) {
        if (request == null || request.isEmpty()) {
            throw new ValidationException("Investment request cannot be empty");
        }

        if (!request.containsKey("stockSymbol") || request.get("stockSymbol") == null) {
            throw new ValidationException("Stock symbol is required");
        }

        if (!request.containsKey("shares") || request.get("shares") == null) {
            throw new ValidationException("Number of shares is required");
        }

        if (!request.containsKey("requestType") || request.get("requestType") == null) {
            throw new ValidationException("Request type is required");
        }

        String requestType = (String) request.get("requestType");
        if (!Arrays.asList("BUY", "SELL").contains(requestType)) {
            throw new ValidationException("Invalid request type. Must be BUY or SELL");
        }

        Number shares = (Number) request.get("shares");
        if (shares.doubleValue() <= 0) {
            throw new ValidationException("Number of shares must be positive");
        }
    }
}