package com.ddfinance.backend.service.investment;

import com.ddfinance.backend.dto.investment.*;
import com.ddfinance.backend.repository.*;
import com.ddfinance.backend.service.notification.NotificationService;
import com.ddfinance.core.domain.*;
import com.ddfinance.core.domain.enums.InvestmentStatus;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test class for InvestmentServiceImpl.
 * Tests investment management operations using TDD approach.
 */
@ExtendWith(MockitoExtension.class)
class InvestmentServiceImplTest {

    @Mock
    private InvestmentRepository investmentRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private StockDataService stockDataService;

    @Mock
    private NotificationService notificationService;

    private InvestmentServiceImpl investmentService;

    private Investment testInvestment;
    private Client testClient;
    private Map<String, Object> stockQuote;

    @BeforeEach
    void setUp() {
        investmentService = new InvestmentServiceImpl(
                investmentRepository,
                clientRepository,
                transactionRepository,
                stockDataService,
                notificationService
        );

        // Setup test client
        UserAccount clientUser = new UserAccount();
        clientUser.setId(1L);
        clientUser.setEmail("client@example.com");
        clientUser.setFirstName("John");
        clientUser.setLastName("Doe");

        testClient = new Client();
        testClient.setId(100L);
        testClient.setUserAccount(clientUser);
        testClient.setClientId("CL001");

        // Setup test investment
        testInvestment = new Investment();
        testInvestment.setId(1000L);
        testInvestment.setInvestmentId("INV-AAPL-001");
        testInvestment.setName("Apple Inc.");
        testInvestment.setTickerSymbol("AAPL");
        testInvestment.setShares(new BigDecimal("100"));
        testInvestment.setPurchasePricePerShare(new BigDecimal("150.00"));
        testInvestment.setCurrentPricePerShare(new BigDecimal("175.00"));
        testInvestment.setAmount(new BigDecimal("15000.00"));
        testInvestment.setCurrentValue(new BigDecimal("17500.00"));
        testInvestment.setStatus(InvestmentStatus.ACTIVE);
        testInvestment.setClient(testClient);
        testInvestment.setCreatedDate(LocalDateTime.now().minusMonths(6));
        testInvestment.setDividendsReceived(new BigDecimal("150.00"));

        // Setup stock quote
        stockQuote = new HashMap<>();
        stockQuote.put("symbol", "AAPL");
        stockQuote.put("name", "Apple Inc.");
        stockQuote.put("price", new BigDecimal("175.00"));
        stockQuote.put("dayChange", 2.50);
        stockQuote.put("dayChangePercentage", 1.45);
    }

    // Test getInvestmentById
    @Test
    void getInvestmentById_WhenExists_ReturnsInvestmentDTO() {
        // Given
        when(investmentRepository.findById(1000L)).thenReturn(Optional.of(testInvestment));

        // When
        InvestmentDTO result = investmentService.getInvestmentById(1000L);

        // Then
        assertNotNull(result);
        assertEquals(1000L, result.getId());
        assertEquals("INV-AAPL-001", result.getInvestmentId());
        assertEquals("AAPL", result.getTickerSymbol());
        assertEquals(new BigDecimal("100"), result.getShares());
        assertEquals(new BigDecimal("150.00"), result.getPurchasePricePerShare());
        assertEquals(new BigDecimal("175.00"), result.getCurrentPrice());
        assertEquals(new BigDecimal("17500.00"), result.getCurrentValue());
        assertEquals("ACTIVE", result.getStatus());

        verify(investmentRepository).findById(1000L);
    }

    @Test
    void getInvestmentById_WhenNotFound_ThrowsEntityNotFoundException() {
        // Given
        when(investmentRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> investmentService.getInvestmentById(999L)
        );

        assertEquals("Investment not found with id: 999", exception.getMessage());
        verify(investmentRepository).findById(999L);
    }

    // Test updateInvestment
    @Test
    void updateInvestment_WhenValidRequest_UpdatesAndReturns() {
        // Given
        UpdateInvestmentRequest request = UpdateInvestmentRequest.builder()
                .notes("Quarterly review completed")
                .autoReinvestDividends(true)
                .priceAlertHigh(200.0)
                .priceAlertLow(160.0)
                .enablePriceAlerts(true)
                .build();

        when(investmentRepository.findById(1000L)).thenReturn(Optional.of(testInvestment));
        when(investmentRepository.save(any(Investment.class))).thenReturn(testInvestment);

        // When
        InvestmentDTO result = investmentService.updateInvestment(1000L, request);

        // Then
        assertNotNull(result);
        assertEquals("Quarterly review completed", testInvestment.getDescription());
        verify(investmentRepository).findById(1000L);
        verify(investmentRepository).save(testInvestment);
    }

    @Test
    void updateInvestment_WhenNotFound_ThrowsEntityNotFoundException() {
        // Given
        UpdateInvestmentRequest request = UpdateInvestmentRequest.builder()
                .notes("Update notes")
                .build();

        when(investmentRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(
                EntityNotFoundException.class,
                () -> investmentService.updateInvestment(999L, request)
        );

        verify(investmentRepository).findById(999L);
        verify(investmentRepository, never()).save(any());
    }

    // Test getAllInvestments
    @Test
    void getAllInvestments_ReturnsListOfInvestmentDTOs() {
        // Given
        Investment investment2 = new Investment();
        investment2.setId(1001L);
        investment2.setInvestmentId("INV-MSFT-001");
        investment2.setName("Microsoft Corporation");
        investment2.setTickerSymbol("MSFT");
        investment2.setShares(new BigDecimal("50"));
        investment2.setPurchasePricePerShare(new BigDecimal("300.00"));
        investment2.setCurrentPricePerShare(new BigDecimal("350.00"));
        investment2.setStatus(InvestmentStatus.ACTIVE);
        investment2.setClient(testClient);

        List<Investment> investments = Arrays.asList(testInvestment, investment2);
        when(investmentRepository.findAll()).thenReturn(investments);

        // When
        List<InvestmentDTO> result = investmentService.getAllInvestments();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("INV-AAPL-001", result.get(0).getInvestmentId());
        assertEquals("INV-MSFT-001", result.get(1).getInvestmentId());
        verify(investmentRepository).findAll();
    }

    @Test
    void getAllInvestments_WhenEmpty_ReturnsEmptyList() {
        // Given
        when(investmentRepository.findAll()).thenReturn(Collections.emptyList());

        // When
        List<InvestmentDTO> result = investmentService.getAllInvestments();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(investmentRepository).findAll();
    }

    // Test getInvestmentsByStatus
    @Test
    void getInvestmentsByStatus_ReturnsFilteredInvestments() {
        // Given
        Investment pendingInvestment = new Investment();
        pendingInvestment.setId(1002L);
        pendingInvestment.setStatus(InvestmentStatus.PENDING);
        pendingInvestment.setInvestmentId("INV-GOOGL-001");
        pendingInvestment.setTickerSymbol("GOOGL");
        pendingInvestment.setShares(new BigDecimal("25"));
        pendingInvestment.setPurchasePricePerShare(new BigDecimal("2500.00"));
        pendingInvestment.setClient(testClient);

        List<Investment> activeInvestments = Arrays.asList(testInvestment);
        when(investmentRepository.findByStatus(InvestmentStatus.ACTIVE)).thenReturn(activeInvestments);

        // When
        List<InvestmentDTO> result = investmentService.getInvestmentsByStatus(InvestmentStatus.ACTIVE);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("ACTIVE", result.get(0).getStatus());
        verify(investmentRepository).findByStatus(InvestmentStatus.ACTIVE);
    }

    // Test getInvestmentPerformance
    @Test
    void getInvestmentPerformance_WhenValidInvestment_ReturnsPerformanceMetrics() {
        // Given
        when(investmentRepository.findById(1000L)).thenReturn(Optional.of(testInvestment));
        when(stockDataService.getStockQuote("AAPL")).thenReturn(stockQuote);

        // When
        InvestmentPerformanceDTO result = investmentService.getInvestmentPerformance(1000L);

        // Then
        assertNotNull(result);
        assertEquals(1000L, result.getInvestmentId());

        // Total return = (current value - purchase amount) = 17500 - 15000 = 2500
        assertEquals(2500.0, result.getTotalReturn(), 0.01);

        // Return percentage = (2500 / 15000) * 100 = 16.67%
        assertEquals(16.67, result.getTotalReturnPercentage(), 0.01);

        // Dividends earned
        assertEquals(150.0, result.getDividendsEarned(), 0.01);

        verify(investmentRepository).findById(1000L);
        verify(stockDataService).getStockQuote("AAPL");
    }

    @Test
    void getInvestmentPerformance_WhenNotFound_ThrowsEntityNotFoundException() {
        // Given
        when(investmentRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(
                EntityNotFoundException.class,
                () -> investmentService.getInvestmentPerformance(999L)
        );

        verify(investmentRepository).findById(999L);
        verify(stockDataService, never()).getStockQuote(any());
    }

    // Test getInvestmentHistory
    @Test
    void getInvestmentHistory_ReturnsTransactionHistory() {
        // Given
        Transaction transaction1 = new Transaction();
        transaction1.setId(1L);
        transaction1.setInvestment(testInvestment);
        transaction1.setClient(testClient);
        transaction1.setTransactionType("BUY");
        transaction1.setShares(new BigDecimal("100"));
        transaction1.setPricePerShare(new BigDecimal("150.00"));
        transaction1.setTotalAmount(new BigDecimal("15000.00"));
        transaction1.setTransactionDate(LocalDateTime.now().minusMonths(6));

        Transaction transaction2 = new Transaction();
        transaction2.setId(2L);
        transaction2.setInvestment(testInvestment);
        transaction2.setClient(testClient);
        transaction2.setTransactionType("DIVIDEND");
        transaction2.setTotalAmount(new BigDecimal("150.00"));
        transaction2.setTransactionDate(LocalDateTime.now().minusMonths(3));

        List<Transaction> transactions = Arrays.asList(transaction1, transaction2);

        when(investmentRepository.findById(1000L)).thenReturn(Optional.of(testInvestment));
        when(transactionRepository.findByClientOrderByTransactionDateDesc(testClient, null))
                .thenReturn(transactions);

        // When
        List<Map<String, Object>> result = investmentService.getInvestmentHistory(1000L);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());

        Map<String, Object> firstTransaction = result.get(0);
        assertEquals("BUY", firstTransaction.get("type"));
        assertEquals(new BigDecimal("100"), firstTransaction.get("quantity"));
        assertEquals(new BigDecimal("15000.00"), firstTransaction.get("totalAmount"));

        verify(investmentRepository).findById(1000L);
        verify(transactionRepository).findByClientOrderByTransactionDateDesc(testClient, null);
    }

    // Test getInvestmentAnalytics
    @Test
    void getInvestmentAnalytics_ReturnsSystemWideMetrics() {
        // Given
        when(investmentRepository.count()).thenReturn(100L);
        when(investmentRepository.findByStatus(InvestmentStatus.ACTIVE)).thenReturn(
            Arrays.asList(testInvestment) // 1 active investment for testing
        );
        when(investmentRepository.calculateTotalSystemValue()).thenReturn(5000000.0);

        // When
        Map<String, Object> result = investmentService.getInvestmentAnalytics();

        // Then
        assertNotNull(result);
        assertEquals(100L, result.get("totalInvestments"));
        assertEquals(1L, result.get("activeInvestments")); // Size of list
        assertEquals(5000000.0, result.get("totalPortfolioValue"));

        verify(investmentRepository).count();
        verify(investmentRepository).findByStatus(InvestmentStatus.ACTIVE);
        verify(investmentRepository).calculateTotalSystemValue();
    }

    // Test refreshAllPrices
    @Test
    void refreshAllPrices_UpdatesAllActiveInvestmentPrices() {
        // Given
        Investment investment2 = new Investment();
        investment2.setId(1001L);
        investment2.setTickerSymbol("MSFT");
        investment2.setCurrentPricePerShare(new BigDecimal("300.00"));
        investment2.setShares(new BigDecimal("50"));
        investment2.setStatus(InvestmentStatus.ACTIVE);
        investment2.setClient(testClient);

        List<Investment> activeInvestments = Arrays.asList(testInvestment, investment2);
        when(investmentRepository.findByStatus(InvestmentStatus.ACTIVE)).thenReturn(activeInvestments);

        Map<String, Object> msftQuote = new HashMap<>();
        msftQuote.put("symbol", "MSFT");
        msftQuote.put("price", new BigDecimal("350.00"));

        when(stockDataService.getStockQuote("AAPL")).thenReturn(stockQuote);
        when(stockDataService.getStockQuote("MSFT")).thenReturn(msftQuote);
        when(investmentRepository.saveAll(anyList())).thenReturn(activeInvestments);

        // When
        Map<String, String> result = investmentService.refreshAllPrices();

        // Then
        assertNotNull(result);
        assertEquals("success", result.get("status"));
        assertEquals("2", result.get("investmentsUpdated"));

        assertEquals(new BigDecimal("175.00"), testInvestment.getCurrentPricePerShare());
        assertEquals(new BigDecimal("17500.00"), testInvestment.getCurrentValue());
        assertEquals(new BigDecimal("350.00"), investment2.getCurrentPricePerShare());

        verify(investmentRepository).findByStatus(InvestmentStatus.ACTIVE);
        verify(stockDataService).getStockQuote("AAPL");
        verify(stockDataService).getStockQuote("MSFT");
        verify(investmentRepository).saveAll(anyList());
    }

    // Test calculateTaxImplications
    @Test
    void calculateTaxImplications_ReturnsCapitalGainsCalculation() {
        // Given
        when(investmentRepository.findById(1000L)).thenReturn(Optional.of(testInvestment));

        // When
        Map<String, Object> result = investmentService.calculateTaxImplications(1000L, 50);

        // Then
        assertNotNull(result);
        assertEquals(50, result.get("sharesToSell"));

        // Cost basis for 50 shares = 50 * 150 = 7500
        assertEquals(7500.0, result.get("costBasis"));

        // Sale proceeds = 50 * 175 = 8750
        assertEquals(8750.0, result.get("saleProceeds"));

        // Capital gains = 8750 - 7500 = 1250
        assertEquals(1250.0, result.get("capitalGains"));

        // Long term (held > 1 year) - 6 months in test data, so short term
        assertEquals("SHORT_TERM", result.get("taxType"));

        verify(investmentRepository).findById(1000L);
    }

    @Test
    void calculateTaxImplications_WhenTooManyShares_ThrowsValidationException() {
        // Given
        when(investmentRepository.findById(1000L)).thenReturn(Optional.of(testInvestment));

        // When & Then
        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> investmentService.calculateTaxImplications(1000L, 150)
        );

        assertEquals("Cannot sell more shares than owned. Available: 100", exception.getMessage());
    }

    // Test processDividend
    @Test
    void processDividend_CreatesTransactionAndUpdatesInvestment() {
        // Given
        when(investmentRepository.findById(1000L)).thenReturn(Optional.of(testInvestment));
        when(investmentRepository.save(any(Investment.class))).thenReturn(testInvestment);
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));

        // When
        investmentService.processDividend(1000L, 75.0);

        // Then
        assertEquals(new BigDecimal("225.00"), testInvestment.getDividendsReceived()); // 150 + 75

        verify(investmentRepository).findById(1000L);
        verify(investmentRepository).save(testInvestment);
        verify(transactionRepository).save(argThat(transaction ->
            "DIVIDEND".equals(transaction.getTransactionType()) &&
            new BigDecimal("75.00").equals(transaction.getTotalAmount()) &&
            testInvestment.equals(transaction.getInvestment())
        ));
        verify(notificationService).sendNotification(eq("client@example.com"),
                eq("Dividend Received"), anyString());
    }

    // Test getInvestmentsRequiringAttention
    @Test
    void getInvestmentsRequiringAttention_ReturnsInvestmentsNeedingReview() {
        // Given
        Investment pendingInvestment = new Investment();
        pendingInvestment.setId(1002L);
        pendingInvestment.setStatus(InvestmentStatus.PENDING);
        pendingInvestment.setInvestmentId("INV-PENDING-001");
        pendingInvestment.setTickerSymbol("TSLA");
        pendingInvestment.setShares(new BigDecimal("10"));
        pendingInvestment.setPurchasePricePerShare(new BigDecimal("800.00"));
        pendingInvestment.setClient(testClient);

        Investment reviewInvestment = new Investment();
        reviewInvestment.setId(1003L);
        reviewInvestment.setStatus(InvestmentStatus.UNDER_REVIEW);
        reviewInvestment.setInvestmentId("INV-REVIEW-001");
        reviewInvestment.setTickerSymbol("NFLX");
        reviewInvestment.setShares(new BigDecimal("20"));
        reviewInvestment.setPurchasePricePerShare(new BigDecimal("500.00"));
        reviewInvestment.setClient(testClient);

        List<Investment> pendingInvestments = Arrays.asList(pendingInvestment);
        List<Investment> reviewInvestments = Arrays.asList(reviewInvestment);

        when(investmentRepository.findByStatus(InvestmentStatus.PENDING)).thenReturn(pendingInvestments);
        when(investmentRepository.findByStatus(InvestmentStatus.UNDER_REVIEW)).thenReturn(reviewInvestments);

        // When
        List<InvestmentDTO> result = investmentService.getInvestmentsRequiringAttention();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(inv -> "PENDING".equals(inv.getStatus())));
        assertTrue(result.stream().anyMatch(inv -> "UNDER_REVIEW".equals(inv.getStatus())));

        verify(investmentRepository).findByStatus(InvestmentStatus.PENDING);
        verify(investmentRepository).findByStatus(InvestmentStatus.UNDER_REVIEW);
    }
}