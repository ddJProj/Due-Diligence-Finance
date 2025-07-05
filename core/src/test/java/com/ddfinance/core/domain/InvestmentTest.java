package com.ddfinance.core.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.ddfinance.core.domain.enums.InvestmentStatus;
import com.ddfinance.core.domain.enums.Role;

/**
 * Test class for Investment entity
 * Tests all functionality for US stock market investment tracking
 */
public class InvestmentTest {

    private Investment investment;
    private Client testClient;
    private Employee testEmployee;
    private UserAccount clientUser;
    private UserAccount employeeUser;

    @BeforeEach
    void setUp() {
        // Create test UserAccounts
        clientUser = new UserAccount();
        clientUser.setId(1L);
        clientUser.setEmail("client@ddfinance.com");
        clientUser.setFirstName("John");
        clientUser.setLastName("Investor");
        clientUser.setRole(Role.CLIENT);

        employeeUser = new UserAccount();
        employeeUser.setId(2L);
        employeeUser.setEmail("advisor@ddfinance.com");
        employeeUser.setFirstName("Jane");
        employeeUser.setLastName("Advisor");
        employeeUser.setRole(Role.EMPLOYEE);

        // Create test Client
        testClient = new Client();
        testClient.setId(1L);
        testClient.setUserAccount(clientUser);
        testClient.setClientId("CLI-001");

        // Create test Employee
        testEmployee = new Employee();
        testEmployee.setId(1L);
        testEmployee.setUserAccount(employeeUser);
        testEmployee.setEmployeeId("EMP-001");

        // Create test Investment
        investment = new Investment();
    }

    @Test
    void testDefaultConstructor() {
        Investment testInvestment = new Investment();
        assertNotNull(testInvestment);
        assertNull(testInvestment.getId());
        assertNull(testInvestment.getName());
        assertNull(testInvestment.getTickerSymbol());
        assertEquals(InvestmentStatus.PENDING, testInvestment.getStatus());
        assertEquals("MEDIUM", testInvestment.getRiskLevel());
        assertEquals(BigDecimal.ZERO, testInvestment.getDividendsReceived());
    }

    @Test
    void testStockInvestmentConstructor() {
        String name = "Apple Inc. Stock";
        String ticker = "AAPL";
        BigDecimal shares = new BigDecimal("100");
        BigDecimal pricePerShare = new BigDecimal("150.50");

        Investment stockInvestment = new Investment(name, ticker, shares, pricePerShare, testClient);

        assertNotNull(stockInvestment);
        assertEquals(name, stockInvestment.getName());
        assertEquals(ticker, stockInvestment.getTickerSymbol());
        assertEquals(shares, stockInvestment.getShares());
        assertEquals(pricePerShare, stockInvestment.getPurchasePricePerShare());
        assertEquals(testClient, stockInvestment.getClient());
        assertEquals("STOCK", stockInvestment.getInvestmentType());
        assertEquals(InvestmentStatus.PENDING, stockInvestment.getStatus());

        // Test calculated amount
        BigDecimal expectedAmount = shares.multiply(pricePerShare);
        assertEquals(expectedAmount, stockInvestment.getAmount());
    }

    @Test
    void testMutualFundConstructor() {
        String name = "Vanguard S&P 500 Index Fund";
        String type = "MUTUAL_FUND";
        BigDecimal amount = new BigDecimal("10000.00");

        Investment fundInvestment = new Investment(name, type, amount, testClient);

        assertNotNull(fundInvestment);
        assertEquals(name, fundInvestment.getName());
        assertEquals(type, fundInvestment.getInvestmentType());
        assertEquals(amount, fundInvestment.getAmount());
        assertEquals(testClient, fundInvestment.getClient());
        assertEquals(InvestmentStatus.PENDING, fundInvestment.getStatus());
    }

    @Test
    void testStockInvestmentWithEmployee() {
        String name = "Microsoft Corporation";
        String ticker = "MSFT";
        BigDecimal shares = new BigDecimal("50");
        BigDecimal pricePerShare = new BigDecimal("300.75");

        Investment stockInvestment = new Investment(name, ticker, shares, pricePerShare, testClient, testEmployee);

        assertEquals(testEmployee, stockInvestment.getCreatedBy());
        assertEquals(testEmployee.getFullName(), stockInvestment.getCreatedByName());
    }

    @Test
    void testInvestmentTypeChecks() {
        // Test stock investment
        Investment stockInvestment = new Investment("Apple", "AAPL", new BigDecimal("100"), new BigDecimal("150"), testClient);
        assertTrue(stockInvestment.isStockInvestment());
        assertFalse(stockInvestment.isETFInvestment());
        assertFalse(stockInvestment.isMutualFundInvestment());

        // Test ETF investment
        Investment etfInvestment = new Investment("SPDR S&P 500 ETF", "ETF", new BigDecimal("5000"), testClient);
        etfInvestment.setTickerSymbol("SPY");
        assertFalse(etfInvestment.isStockInvestment());
        assertTrue(etfInvestment.isETFInvestment());
        assertFalse(etfInvestment.isMutualFundInvestment());

        // Test mutual fund investment
        Investment fundInvestment = new Investment("Vanguard Fund", "MUTUAL_FUND", new BigDecimal("10000"), testClient);
        assertFalse(fundInvestment.isStockInvestment());
        assertFalse(fundInvestment.isETFInvestment());
        assertTrue(fundInvestment.isMutualFundInvestment());
    }

    @Test
    void testMarketPriceUpdate() {
        Investment stockInvestment = new Investment("Google", "GOOGL", new BigDecimal("10"), new BigDecimal("2500"), testClient);

        BigDecimal newPrice = new BigDecimal("2750.00");
        stockInvestment.updateMarketPrice(newPrice);

        assertEquals(newPrice, stockInvestment.getCurrentPricePerShare());
        assertNotNull(stockInvestment.getLastPriceUpdate());

        // Test calculated current value
        BigDecimal expectedValue = stockInvestment.getShares().multiply(newPrice);
        assertEquals(expectedValue, stockInvestment.getCurrentValue());
    }

    @Test
    void testDividendTracking() {
        Investment stockInvestment = new Investment("AT&T", "T", new BigDecimal("200"), new BigDecimal("20"), testClient);

        // Add first dividend
        BigDecimal dividend1 = new BigDecimal("50.00");
        stockInvestment.addDividend(dividend1);
        assertEquals(dividend1, stockInvestment.getDividendsReceived());

        // Add second dividend
        BigDecimal dividend2 = new BigDecimal("25.00");
        stockInvestment.addDividend(dividend2);
        assertEquals(dividend1.add(dividend2), stockInvestment.getDividendsReceived());
    }

    @Test
    void testFinancialCalculations() {
        Investment stockInvestment = new Investment("Tesla", "TSLA", new BigDecimal("20"), new BigDecimal("800"), testClient);

        // Set current price higher than purchase price
        stockInvestment.updateMarketPrice(new BigDecimal("900"));

        // Test gain/loss calculation
        BigDecimal expectedGain = new BigDecimal("2000.00"); // 20 shares * $100 gain per share
        assertEquals(expectedGain, stockInvestment.calculateGainLoss());

        // Test return percentage (12.5% gain)
        Double expectedReturnPercent = 12.5;
        assertEquals(expectedReturnPercent, stockInvestment.calculateReturnPercentage(), 0.01);

        // Add dividends and test total return
        stockInvestment.addDividend(new BigDecimal("100"));
        BigDecimal expectedTotalReturn = expectedGain.add(new BigDecimal("100"));
        assertEquals(expectedTotalReturn, stockInvestment.calculateTotalReturn());

        // Test total return percentage
        Double expectedTotalReturnPercent = 13.125; // (2000 + 100) / 16000 * 100
        assertEquals(expectedTotalReturnPercent, stockInvestment.calculateTotalReturnPercentage(), 0.01);
    }

    @Test
    void testTickerSymbolValidation() {
        // Valid ticker symbols
        investment.setTickerSymbol("AAPL");
        assertTrue(investment.isValidTickerSymbol());

        investment.setTickerSymbol("MSFT");
        assertTrue(investment.isValidTickerSymbol());

        investment.setTickerSymbol("BRK");
        assertTrue(investment.isValidTickerSymbol());

        // Invalid ticker symbols
        investment.setTickerSymbol("TOOLONG");
        assertFalse(investment.isValidTickerSymbol());

        investment.setTickerSymbol("123");
        assertFalse(investment.isValidTickerSymbol());

        investment.setTickerSymbol("a");
        assertFalse(investment.isValidTickerSymbol());
    }

    @Test
    void testInvestmentValidation() {
        Investment validInvestment = new Investment("Apple", "AAPL", new BigDecimal("100"), new BigDecimal("150"), testClient);
        assertTrue(validInvestment.isValidInvestment());

        // Test invalid cases
        Investment invalidInvestment = new Investment();
        assertFalse(invalidInvestment.isValidInvestment());

        invalidInvestment.setName("");
        assertFalse(invalidInvestment.isValidInvestment());

        invalidInvestment.setName("Valid Name");
        invalidInvestment.setInvestmentType("");
        assertFalse(invalidInvestment.isValidInvestment());

        invalidInvestment.setInvestmentType("STOCK");
        invalidInvestment.setAmount(BigDecimal.ZERO);
        assertFalse(invalidInvestment.isValidInvestment());
    }

    @Test
    void testStatusManagement() {
        Investment stockInvestment = new Investment("Netflix", "NFLX", new BigDecimal("25"), new BigDecimal("400"), testClient);

        // Test initial status
        assertEquals(InvestmentStatus.PENDING, stockInvestment.getStatus());
        assertFalse(stockInvestment.isActive());

        // Test activation
        assertTrue(stockInvestment.activateInvestment());
        assertEquals(InvestmentStatus.ACTIVE, stockInvestment.getStatus());
        assertTrue(stockInvestment.isActive());

        // Test activation when already active (should return false)
        assertFalse(stockInvestment.activateInvestment());

        // Test suspension
        assertTrue(stockInvestment.suspendInvestment());
        assertEquals(InvestmentStatus.SUSPENDED, stockInvestment.getStatus());
        assertFalse(stockInvestment.isActive());

        // Test liquidation
        assertTrue(stockInvestment.liquidateInvestment());
        assertEquals(InvestmentStatus.LIQUIDATED, stockInvestment.getStatus());

        // Test completion
        stockInvestment.setStatus(InvestmentStatus.ACTIVE);
        assertTrue(stockInvestment.closeInvestment());
        assertEquals(InvestmentStatus.COMPLETED, stockInvestment.getStatus());
    }

    @Test
    void testInvestmentIdGeneration() {
        Investment stockInvestment = new Investment("Amazon", "AMZN", new BigDecimal("5"), new BigDecimal("3000"), testClient);
        stockInvestment.setId(123L);

        String expectedId = "INV-CLI-001-123";
        assertEquals(expectedId, stockInvestment.getInvestmentId());
        assertTrue(stockInvestment.isValidInvestmentId());

        // Test generic ID when no client ID
        Investment genericInvestment = new Investment();
        genericInvestment.setId(456L);
        genericInvestment.setClient(new Client()); // Client without ID

        String expectedGenericId = "INV-GEN-456";
        assertEquals(expectedGenericId, genericInvestment.getInvestmentId());
    }

    @Test
    void testRiskLevelDetermination() {
        // Test high-risk sectors
        Investment techStock = new Investment("NVIDIA", "NVDA", new BigDecimal("10"), new BigDecimal("500"), testClient);
        techStock.setSector("TECHNOLOGY");
        assertEquals("HIGH", techStock.determineRiskLevelBySector());

        Investment bioStock = new Investment("Biotech Co", "BIO", new BigDecimal("20"), new BigDecimal("100"), testClient);
        bioStock.setSector("BIOTECHNOLOGY");
        assertEquals("HIGH", bioStock.determineRiskLevelBySector());

        // Test low-risk sectors
        Investment utilityStock = new Investment("Utility Co", "UTIL", new BigDecimal("50"), new BigDecimal("50"), testClient);
        utilityStock.setSector("UTILITIES");
        assertEquals("LOW", utilityStock.determineRiskLevelBySector());

        // Test medium-risk (default)
        Investment financialStock = new Investment("Bank", "BANK", new BigDecimal("30"), new BigDecimal("75"), testClient);
        financialStock.setSector("FINANCIAL");
        assertEquals("MEDIUM", financialStock.determineRiskLevelBySector());
    }

    @Test
    void testTimeBasedCalculations() {
        Investment stockInvestment = new Investment("Disney", "DIS", new BigDecimal("40"), new BigDecimal("120"), testClient);

        // Set creation date to 30 days ago
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        stockInvestment.setCreatedDate(thirtyDaysAgo);

        // Test days invested calculation
        assertEquals(30L, stockInvestment.getDaysInvested());

        // Test maturity date calculations
        LocalDateTime futureDate = LocalDateTime.now().plusDays(365);
        stockInvestment.setMaturityDate(futureDate);
        assertEquals(365L, stockInvestment.getDaysUntilMaturity());
        assertFalse(stockInvestment.isMature());

        // Test past maturity
        LocalDateTime pastDate = LocalDateTime.now().minusDays(10);
        stockInvestment.setMaturityDate(pastDate);
        assertTrue(stockInvestment.isMature());
        assertTrue(stockInvestment.getDaysUntilMaturity() < 0);
    }

    @Test
    void testAnnualizedReturnCalculation() {
        Investment stockInvestment = new Investment("Facebook", "META", new BigDecimal("25"), new BigDecimal("200"), testClient);

        // Set investment to 365 days old
        stockInvestment.setCreatedDate(LocalDateTime.now().minusDays(365));

        // Set current value to show 20% gain
        stockInvestment.updateMarketPrice(new BigDecimal("240")); // 20% gain

        // For exactly 1 year, annualized return should equal total return
        Double annualizedReturn = stockInvestment.calculateAnnualizedReturn();
        Double totalReturn = stockInvestment.calculateTotalReturnPercentage();

        assertEquals(totalReturn, annualizedReturn, 0.1); // Small tolerance for rounding
    }

    @Test
    void testPriceDataStaleness() {
        Investment stockInvestment = new Investment("IBM", "IBM", new BigDecimal("15"), new BigDecimal("130"), testClient);

        // Test with no price update
        assertTrue(stockInvestment.isPriceDataStale());

        // Test with recent update
        stockInvestment.setLastPriceUpdate(LocalDateTime.now().minusMinutes(30));
        assertFalse(stockInvestment.isPriceDataStale());

        // Test with stale update (over 1 hour)
        stockInvestment.setLastPriceUpdate(LocalDateTime.now().minusHours(2));
        assertTrue(stockInvestment.isPriceDataStale());
    }

    @Test
    void testUSStockMarketExamples() {
        // Test various US stock investments
        Investment appleStock = new Investment("Apple Inc.", "AAPL", new BigDecimal("100"), new BigDecimal("175.50"), testClient);
        appleStock.setSector("TECHNOLOGY");
        appleStock.setExchange("NASDAQ");

        assertTrue(appleStock.isStockInvestment());
        assertEquals("TECHNOLOGY", appleStock.getSector());
        assertEquals("NASDAQ", appleStock.getExchange());
        assertTrue(appleStock.isValidTickerSymbol());

        Investment spyETF = new Investment("SPDR S&P 500 ETF", "ETF", new BigDecimal("10000"), testClient);
        spyETF.setTickerSymbol("SPY");
        spyETF.setExchange("NYSE");

        assertTrue(spyETF.isETFInvestment());
        assertEquals("SPY", spyETF.getTickerSymbol());

        Investment vanguardFund = new Investment("Vanguard Total Stock Market", "MUTUAL_FUND", new BigDecimal("15000"), testClient);
        assertTrue(vanguardFund.isMutualFundInvestment());
    }

    @Test
    void testDividendYieldTracking() {
        Investment dividendStock = new Investment("Coca-Cola", "KO", new BigDecimal("200"), new BigDecimal("55"), testClient);

        // Set dividend yield
        BigDecimal dividendYield = new BigDecimal("3.25");
        dividendStock.setDividendYield(dividendYield);
        assertEquals(dividendYield, dividendStock.getDividendYield());

        // Test quarterly dividend payment
        BigDecimal quarterlyDividend = new BigDecimal("71.50"); // $0.35 per share * 200 shares + rounding
        dividendStock.addDividend(quarterlyDividend);
        assertEquals(quarterlyDividend, dividendStock.getDividendsReceived());
    }

    @Test
    void testAPIIntegrationFields() {
        Investment stockInvestment = new Investment("Alphabet", "GOOGL", new BigDecimal("8"), new BigDecimal("2800"), testClient);

        // Test API source tracking
        stockInvestment.setPriceDataSource("Alpha Vantage");
        assertEquals("Alpha Vantage", stockInvestment.getPriceDataSource());

        // Test price update with API simulation
        stockInvestment.updateMarketPrice(new BigDecimal("2950.75"));
        assertEquals(new BigDecimal("2950.75"), stockInvestment.getCurrentPricePerShare());
        assertNotNull(stockInvestment.getLastPriceUpdate());

        // Test calculated current value
        BigDecimal expectedValue = new BigDecimal("8").multiply(new BigDecimal("2950.75"));
        assertEquals(expectedValue, stockInvestment.getCurrentValue());
    }

    @Test
    void testCompleteStockWorkflow() {
        // Test complete investment workflow from creation to completion
        Investment stockInvestment = new Investment("Microsoft", "MSFT", new BigDecimal("50"), new BigDecimal("300"), testClient, testEmployee);
        stockInvestment.setId(1L);
        stockInvestment.setSector("TECHNOLOGY");
        stockInvestment.setExchange("NASDAQ");
        stockInvestment.setPriceDataSource("Yahoo Finance");

        // Initial state
        assertEquals(InvestmentStatus.PENDING, stockInvestment.getStatus());
        assertTrue(stockInvestment.isValidInvestment());
        assertEquals("INV-CLI-001-1", stockInvestment.getInvestmentId());

        // Approve and activate
        stockInvestment.setStatus(InvestmentStatus.APPROVED);
        stockInvestment.activateInvestment();
        assertEquals(InvestmentStatus.ACTIVE, stockInvestment.getStatus());

        // Update market price
        stockInvestment.updateMarketPrice(new BigDecimal("350"));
        assertEquals(new BigDecimal("17500.00"), stockInvestment.getCurrentValue());

        // Add dividend
        stockInvestment.addDividend(new BigDecimal("137.50")); // $2.75 per share quarterly

        // Calculate returns
        assertEquals(new BigDecimal("2500.00"), stockInvestment.calculateGainLoss());
        assertEquals(new BigDecimal("2637.50"), stockInvestment.calculateTotalReturn());

        // Final liquidation
        stockInvestment.liquidateInvestment();
        assertEquals(InvestmentStatus.LIQUIDATED, stockInvestment.getStatus());
    }

    @Test
    void testInvestmentEqualsAndHashCode() {
        Investment investment1 = new Investment("Apple", "AAPL", new BigDecimal("100"), new BigDecimal("150"), testClient);
        investment1.setId(1L);

        Investment investment2 = new Investment("Apple", "AAPL", new BigDecimal("100"), new BigDecimal("150"), testClient);
        investment2.setId(1L);

        // Test equality based on ID
        assertEquals(investment1, investment2);
        assertEquals(investment1.hashCode(), investment2.hashCode());

        // Test inequality with different ID
        investment2.setId(2L);
        assertNotEquals(investment1, investment2);
    }

    @Test
    void testToStringMethod() {
        Investment stockInvestment = new Investment("Tesla", "TSLA", new BigDecimal("20"), new BigDecimal("800"), testClient);
        stockInvestment.setId(1L);
        stockInvestment.setSector("AUTOMOTIVE");

        String toString = stockInvestment.toString();

        assertNotNull(toString);
        assertTrue(toString.contains("Investment"));
        assertTrue(toString.contains("Tesla"));
        assertTrue(toString.contains("TSLA"));
        // Should not contain client or createdBy due to exclusion
        assertFalse(toString.contains("client="));
    }

    @Test
    void testJPALifecycleMethods() {
        Investment stockInvestment = new Investment();

        // Test @PrePersist
        stockInvestment.onCreate();
        assertNotNull(stockInvestment.getCreatedDate());
        assertEquals(InvestmentStatus.PENDING, stockInvestment.getStatus());
        assertEquals("MEDIUM", stockInvestment.getRiskLevel());
        assertEquals(BigDecimal.ZERO, stockInvestment.getDividendsReceived());

        // Test @PostPersist
        stockInvestment.setId(999L);
        stockInvestment.setClient(testClient);
        stockInvestment.postPersist();
        assertEquals("INV-CLI-001-999", stockInvestment.getInvestmentId());
    }

    @Test
    void testNullSafetyInMethods() {
        Investment emptyInvestment = new Investment();

        // Test methods handle null values gracefully
        assertDoesNotThrow(() -> emptyInvestment.calculateGainLoss());
        assertDoesNotThrow(() -> emptyInvestment.calculateReturnPercentage());
        assertDoesNotThrow(() -> emptyInvestment.calculateTotalReturn());
        assertDoesNotThrow(() -> emptyInvestment.calculateTotalReturnPercentage());
        assertDoesNotThrow(() -> emptyInvestment.getClientName());
        assertDoesNotThrow(() -> emptyInvestment.getCreatedByName());
        assertDoesNotThrow(() -> emptyInvestment.getDaysInvested());
        assertDoesNotThrow(() -> emptyInvestment.getDaysUntilMaturity());

        // Test calculations return sensible defaults
        assertEquals(BigDecimal.ZERO, emptyInvestment.calculateGainLoss());
        assertEquals(0.0, emptyInvestment.calculateReturnPercentage());
        assertEquals(BigDecimal.ZERO, emptyInvestment.calculateTotalReturn());
        assertEquals(0.0, emptyInvestment.calculateTotalReturnPercentage());
    }
}