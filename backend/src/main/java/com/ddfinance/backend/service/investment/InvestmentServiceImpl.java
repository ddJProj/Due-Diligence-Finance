package com.ddfinance.backend.service.investment;

import com.ddfinance.backend.dto.investment.*;
import com.ddfinance.backend.repository.InvestmentRepository;
import com.ddfinance.backend.repository.TransactionRepository;
import com.ddfinance.backend.service.notification.NotificationService;
import com.ddfinance.core.domain.Investment;
import com.ddfinance.core.domain.Transaction;
import com.ddfinance.core.domain.enums.InvestmentStatus;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.backend.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of InvestmentService.
 * Handles investment management operations and performance tracking.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InvestmentServiceImpl implements InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final ClientRepository clientRepository;
    private final TransactionRepository transactionRepository;
    private final StockDataService stockDataService;
    private final NotificationService notificationService;

    // Tax rates
    private static final BigDecimal SHORT_TERM_CAPITAL_GAINS_RATE = new BigDecimal("0.37"); // 37%
    private static final BigDecimal LONG_TERM_CAPITAL_GAINS_RATE = new BigDecimal("0.20"); // 20%

    @Override
    @Transactional(readOnly = true)
    public InvestmentDTO getInvestmentById(Long investmentId) {
        log.debug("Getting investment by ID: {}", investmentId);

        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new EntityNotFoundException("Investment", investmentId));

        return convertToDTO(investment);
    }

    @Override
    public InvestmentDTO updateInvestment(Long investmentId, UpdateInvestmentRequest request) {
        log.debug("Updating investment: {}", investmentId);

        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new EntityNotFoundException("Investment", investmentId));

        // Update fields from request
        if (request.getNotes() != null) {
            investment.setDescription(request.getNotes());
        }

        if (request.getAutoReinvestDividends() != null) {
            // TODO: Store auto-reinvest preference
        }

        if (request.getPriceAlertHigh() != null || request.getPriceAlertLow() != null) {
            // TODO: Store price alert settings
        }

        if (request.getTaxStrategy() != null) {
            // TODO: Store tax strategy preference
        }

        Investment updatedInvestment = investmentRepository.save(investment);
        log.info("Updated investment: {}", investmentId);

        return convertToDTO(updatedInvestment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvestmentDTO> getAllInvestments() {
        log.debug("Getting all investments");

        return investmentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvestmentDTO> getInvestmentsByStatus(InvestmentStatus status) {
        log.debug("Getting investments by status: {}", status);

        return investmentRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InvestmentPerformanceDTO getInvestmentPerformance(Long investmentId) {
        log.debug("Getting investment performance for: {}", investmentId);

        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new EntityNotFoundException("Investment", investmentId));

        // Get current stock data (returns Map)
        Map<String, Object> stockQuoteData = null;
        if (investment.getTickerSymbol() != null) {
            stockQuoteData = stockDataService.getStockQuote(investment.getTickerSymbol());
        }

        return calculatePerformance(investment, stockQuoteData);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getInvestmentHistory(Long investmentId) {
        log.debug("Getting investment history for: {}", investmentId);

        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new EntityNotFoundException("Investment", investmentId));

        // Get transactions for the client
        List<Transaction> transactions = new ArrayList<>();
        if (investment.getClient() != null) {
            // Get all transactions for the client and filter by investment
            transactions = transactionRepository
                    .findByClientOrderByTransactionDateDesc(investment.getClient(), null)
                    .stream()
                    .filter(t -> investment.equals(t.getInvestment()))
                    .collect(Collectors.toList());
        }

        return transactions.stream()
                .map(this::convertTransactionToMap)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getInvestmentAnalytics() {
        log.debug("Getting investment analytics");

        Map<String, Object> analytics = new HashMap<>();

        // Basic counts
        analytics.put("totalInvestments", investmentRepository.count());
        analytics.put("activeInvestments", investmentRepository.findByStatus(InvestmentStatus.ACTIVE).size());
        analytics.put("pendingInvestments", investmentRepository.findByStatus(InvestmentStatus.PENDING).size());

        // Portfolio value
        Double totalValue = investmentRepository.calculateTotalSystemValue();
        analytics.put("totalPortfolioValue", totalValue != null ? totalValue : 0.0);

        // Status breakdown
        Map<String, Long> statusBreakdown = new HashMap<>();
        for (InvestmentStatus status : InvestmentStatus.values()) {
            statusBreakdown.put(status.name(), (long) investmentRepository.findByStatus(status).size());
        }
        analytics.put("statusBreakdown", statusBreakdown);

        analytics.put("generatedAt", LocalDateTime.now());

        return analytics;
    }

    @Override
    public Map<String, String> refreshAllPrices() {
        log.info("Starting price refresh for all active investments");

        List<Investment> activeInvestments = investmentRepository.findByStatus(InvestmentStatus.ACTIVE);
        int updatedCount = 0;
        int errorCount = 0;

        for (Investment investment : activeInvestments) {
            try {
                if (investment.getTickerSymbol() != null) {
                    Map<String, Object> quote = stockDataService.getStockQuote(investment.getTickerSymbol());
                    if (quote != null && quote.get("price") != null) {
                        BigDecimal price = quote.get("price") instanceof BigDecimal
                                ? (BigDecimal) quote.get("price")
                                : new BigDecimal(quote.get("price").toString());
                        investment.setCurrentPricePerShare(price);
                        investment.setCurrentValue(
                                investment.getShares().multiply(investment.getCurrentPricePerShare())
                                        .setScale(2, RoundingMode.HALF_UP)
                        );
                        investment.setLastPriceUpdate(LocalDateTime.now());
                        updatedCount++;
                    }
                }
            } catch (Exception e) {
                log.error("Error updating price for investment {}: {}",
                        investment.getInvestmentId(), e.getMessage());
                errorCount++;
            }
        }

        if (!activeInvestments.isEmpty()) {
            investmentRepository.saveAll(activeInvestments);
        }

        Map<String, String> result = new HashMap<>();
        result.put("status", "success");
        result.put("investmentsUpdated", String.valueOf(updatedCount));
        result.put("errors", String.valueOf(errorCount));
        result.put("timestamp", LocalDateTime.now().toString());

        log.info("Price refresh completed. Updated: {}, Errors: {}", updatedCount, errorCount);

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> calculateTaxImplications(Long investmentId, Integer sellQuantity) {
        log.debug("Calculating tax implications for investment: {}, quantity: {}",
                investmentId, sellQuantity);

        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new EntityNotFoundException("Investment", investmentId));

        // Validate quantity
        if (sellQuantity > investment.getShares().intValue()) {
            throw new ValidationException(
                    "Cannot sell more shares than owned. Available: " + investment.getShares().intValue()
            );
        }

        BigDecimal sellQuantityBD = BigDecimal.valueOf(sellQuantity);

        // Calculate cost basis
        BigDecimal costBasis = investment.getPurchasePricePerShare()
                .multiply(sellQuantityBD)
                .setScale(2, RoundingMode.HALF_UP);

        // Calculate sale proceeds
        BigDecimal saleProceeds = investment.getCurrentPricePerShare()
                .multiply(sellQuantityBD)
                .setScale(2, RoundingMode.HALF_UP);

        // Calculate capital gains
        BigDecimal capitalGains = saleProceeds.subtract(costBasis);

        // Determine if long-term or short-term
        long monthsHeld = ChronoUnit.MONTHS.between(investment.getCreatedDate(), LocalDateTime.now());
        boolean isLongTerm = monthsHeld >= 12;

        // Calculate tax
        BigDecimal taxRate = isLongTerm ? LONG_TERM_CAPITAL_GAINS_RATE : SHORT_TERM_CAPITAL_GAINS_RATE;
        BigDecimal estimatedTax = capitalGains.multiply(taxRate)
                .setScale(2, RoundingMode.HALF_UP);

        Map<String, Object> taxInfo = new HashMap<>();
        taxInfo.put("sharesToSell", sellQuantity);
        taxInfo.put("costBasis", costBasis.doubleValue());
        taxInfo.put("saleProceeds", saleProceeds.doubleValue());
        taxInfo.put("capitalGains", capitalGains.doubleValue());
        taxInfo.put("taxType", isLongTerm ? "LONG_TERM" : "SHORT_TERM");
        taxInfo.put("taxRate", taxRate.multiply(new BigDecimal("100")).doubleValue());
        taxInfo.put("estimatedTax", estimatedTax.doubleValue());
        taxInfo.put("netProceeds", saleProceeds.subtract(estimatedTax).doubleValue());
        taxInfo.put("monthsHeld", monthsHeld);

        return taxInfo;
    }

    @Override
    public void processDividend(Long investmentId, Double amount) {
        log.debug("Processing dividend for investment: {}, amount: {}", investmentId, amount);

        Investment investment = investmentRepository.findById(investmentId)
                .orElseThrow(() -> new EntityNotFoundException("Investment", investmentId));

        BigDecimal dividendAmount = BigDecimal.valueOf(amount);

        // Update total dividends received
        BigDecimal currentDividends = investment.getDividendsReceived() != null
                ? investment.getDividendsReceived()
                : BigDecimal.ZERO;
        investment.setDividendsReceived(currentDividends.add(dividendAmount));

        // Create dividend transaction
        Transaction dividendTransaction = new Transaction();
        dividendTransaction.setClient(investment.getClient());
        dividendTransaction.setInvestment(investment);
        dividendTransaction.setTransactionType("DIVIDEND");
        dividendTransaction.setTickerSymbol(investment.getTickerSymbol());
        dividendTransaction.setTotalAmount(dividendAmount);
        dividendTransaction.setTransactionDate(LocalDateTime.now());
        dividendTransaction.setDescription("Dividend payment for " + investment.getTickerSymbol());
        dividendTransaction.setStatus("COMPLETED");

        investmentRepository.save(investment);
        transactionRepository.save(dividendTransaction);

        // Send notification to client
        String message = String.format(
                "Dividend of $%.2f received for your investment in %s (%s)",
                amount, investment.getName(), investment.getTickerSymbol()
        );

        notificationService.sendNotification(
                investment.getClient().getUserAccount().getEmail(),
                "Dividend Received",
                message
        );

        log.info("Processed dividend of {} for investment {}", amount, investmentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvestmentDTO> getInvestmentsRequiringAttention() {
        log.debug("Getting investments requiring attention");

        List<Investment> needingAttention = new ArrayList<>();

        // Get pending investments
        needingAttention.addAll(investmentRepository.findByStatus(InvestmentStatus.PENDING));

        // Get investments under review
        needingAttention.addAll(investmentRepository.findByStatus(InvestmentStatus.UNDER_REVIEW));

        // TODO: Add more criteria for attention
        // - Price alerts triggered
        // - Significant losses (e.g., > 20%)
        // - Rebalancing needed

        return needingAttention.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Converts Investment entity to DTO.
     *
     * @param investment The investment entity
     * @return Investment DTO
     */
    private InvestmentDTO convertToDTO(Investment investment) {
        InvestmentDTO dto = new InvestmentDTO();

        dto.setId(investment.getId());
        dto.setInvestmentId(investment.getInvestmentId());
        dto.setTickerSymbol(investment.getTickerSymbol());
        dto.setName(investment.getName());
        dto.setInvestmentType(investment.getInvestmentType());
        dto.setShares(investment.getShares());
        dto.setPurchasePricePerShare(investment.getPurchasePricePerShare());
        dto.setCurrentPrice(investment.getCurrentPricePerShare());
        dto.setCurrentValue(investment.getCurrentValue());
        dto.setTotalCost(investment.getAmount());
        dto.setStatus(investment.getStatus().name());
        dto.setRiskLevel(investment.getRiskLevel());
        dto.setPurchaseDate(investment.getCreatedDate());
        dto.setLastPriceUpdate(investment.getLastPriceUpdate());
        dto.setNotes(investment.getDescription());
        dto.setExchange(investment.getExchange());
        dto.setSector(investment.getSector());
        dto.setDividendsReceived(investment.getDividendsReceived());

        // Calculate unrealized gains
        if (investment.getCurrentValue() != null && investment.getAmount() != null) {
            BigDecimal unrealizedGain = investment.getCurrentValue().subtract(investment.getAmount());
            dto.setUnrealizedGain(unrealizedGain);

            if (investment.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal gainPercentage = unrealizedGain
                        .divide(investment.getAmount(), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
                dto.setUnrealizedGainPercentage(gainPercentage);
            }
        }

        return dto;
    }

    /**
     * Calculates investment performance metrics.
     *
     * @param investment The investment
     * @param stockQuoteData Current stock quote data as Map
     * @return Performance DTO
     */
    private InvestmentPerformanceDTO calculatePerformance(Investment investment, Map<String, Object> stockQuoteData) {
        InvestmentPerformanceDTO performance = new InvestmentPerformanceDTO();

        performance.setInvestmentId(investment.getId());

        // Calculate total return
        BigDecimal currentValue = investment.getCurrentValue() != null
                ? investment.getCurrentValue()
                : investment.getShares().multiply(investment.getCurrentPricePerShare());
        BigDecimal totalCost = investment.getAmount();
        BigDecimal totalReturn = currentValue.subtract(totalCost);

        performance.setTotalReturn(totalReturn.doubleValue());

        // Calculate return percentage
        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal returnPercentage = totalReturn
                    .divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            performance.setTotalReturnPercentage(returnPercentage.doubleValue());

            // Calculate annualized return
            long monthsHeld = ChronoUnit.MONTHS.between(investment.getCreatedDate(), LocalDateTime.now());
            if (monthsHeld > 0) {
                double annualizedReturn = (returnPercentage.doubleValue() / monthsHeld) * 12;
                performance.setAnnualizedReturn(annualizedReturn);
            }
        }

        // Add dividend information
        if (investment.getDividendsReceived() != null) {
            performance.setDividendsEarned(investment.getDividendsReceived().doubleValue());

            if (investment.getDividendYield() != null) {
                performance.setDividendYield(investment.getDividendYield().doubleValue());
            }
        }

        // Add day/week/month returns if stock quote available
        if (stockQuoteData != null && stockQuoteData.containsKey("dayChangePercentage")) {
            Object dayChange = stockQuoteData.get("dayChangePercentage");
            if (dayChange != null) {
                performance.setDayReturn(Double.parseDouble(dayChange.toString()));
            }
            // TODO: Calculate week/month/year returns from historical data
        }

        return performance;
    }

    /**
     * Converts Transaction to Map for API response.
     *
     * @param transaction The transaction
     * @return Map representation
     */
    private Map<String, Object> convertTransactionToMap(Transaction transaction) {
        Map<String, Object> map = new HashMap<>();

        map.put("id", transaction.getId());
        map.put("type", transaction.getTransactionType());
        map.put("date", transaction.getTransactionDate());
        map.put("quantity", transaction.getShares());
        map.put("pricePerUnit", transaction.getPricePerShare());
        map.put("totalAmount", transaction.getTotalAmount());
        map.put("description", transaction.getDescription());

        return map;
    }
}