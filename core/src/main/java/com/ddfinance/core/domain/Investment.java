package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.InvestmentStatus;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.regex.Pattern;

/**
 * Investment entity representing a financial investment in US stock markets.
 * Supports individual stocks, ETFs, mutual funds, and other US securities.
 * An investment belongs to a client and can be managed by employees.
 *
 * @author DDFinance Team
 * @version 2.0 - Updated for US Stock Market Integration
 * @since 2025-01-15
 */
@Entity
@Table(name = "investments")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"client", "createdBy"}) // Prevent circular references
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "investment_id_pk")
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "investment_id", unique = true, length = 50)
    private String investmentId;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "investment_type", nullable = false, length = 50)
    private String investmentType;

    // ========== US Stock Market Specific Fields ==========

    /**
     * Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)
     * Required for stock investments, null for other types
     */
    @Column(name = "ticker_symbol", length = 10)
    private String tickerSymbol;

    /**
     * Number of shares owned
     * For stocks and ETFs - exact share count
     * For mutual funds - can be fractional
     */
    @Column(name = "shares", precision = 15, scale = 6)
    private BigDecimal shares;


    @Column(name = "last_modified_at")
    private LocalDateTime lastModifiedAt;

    @Column(name = "order_type", length = 20)
    private String orderType;

    @Column(name = "target_price", precision = 15, scale = 4)
    private BigDecimal targetPrice;

    /**
     * Price per share when purchased
     */
    @Column(name = "purchase_price_per_share", precision = 15, scale = 4)
    private BigDecimal purchasePricePerShare;

    /**
     * Current market price per share (updated via API)
     */
    @Column(name = "current_price_per_share", precision = 15, scale = 4)
    private BigDecimal currentPricePerShare;

    /**
     * Exchange where the security is traded (NYSE, NASDAQ, etc.)
     */
    @Column(name = "exchange", length = 20)
    private String exchange;

    /**
     * Sector classification (Technology, Healthcare, Finance, etc.)
     */
    @Column(name = "sector", length = 50)
    private String sector;

    // ========== Financial Fields ==========

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "current_value", precision = 15, scale = 2)
    private BigDecimal currentValue;

    /**
     * Total dividends received from this investment
     */
    @Column(name = "dividends_received", precision = 15, scale = 2)
    private BigDecimal dividendsReceived = BigDecimal.ZERO;

    /**
     * Annual dividend yield percentage
     */
    @Column(name = "dividend_yield", precision = 5, scale = 4)
    private BigDecimal dividendYield;

    // ========== Relationships ==========

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_employee_id")
    private Employee createdBy;

    // ========== Status and Risk ==========

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private InvestmentStatus status = InvestmentStatus.PENDING;

    @Column(name = "risk_level", nullable = false, length = 10)
    private String riskLevel = "MEDIUM";

    // ========== Dates ==========

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "maturity_date")
    private LocalDateTime maturityDate;

    @Column(name = "last_price_update")
    private LocalDateTime lastPriceUpdate;

    // ========== Additional Information ==========

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "expected_return", precision = 5, scale = 2)
    private BigDecimal expectedReturn;

    /**
     * API source for market data (Alpha Vantage, Yahoo Finance, etc.)
     */
    @Column(name = "price_data_source", length = 50)
    private String priceDataSource;

    // Investment ID validation pattern for US markets
    private static final Pattern INVESTMENT_ID_PATTERN = Pattern.compile("^INV-([A-Z]{3}-\\d{3}-\\d+|GEN-\\d+)$");

    // US stock ticker validation pattern
    private static final Pattern TICKER_PATTERN = Pattern.compile("^[A-Z]{1,5}$");

    // ========== Constructors ==========

    /**
     * Constructor for US stock investment
     * @param name investment name (e.g., "Apple Inc. Stock")
     * @param tickerSymbol stock ticker (e.g., "AAPL")
     * @param shares number of shares
     * @param purchasePricePerShare price per share when purchased
     * @param client the client who owns this investment
     */
    public Investment(String name, String tickerSymbol, BigDecimal shares,
                      BigDecimal purchasePricePerShare, Client client) {
        this.name = name;
        this.tickerSymbol = tickerSymbol;
        this.shares = shares;
        this.purchasePricePerShare = purchasePricePerShare;
        this.amount = shares.multiply(purchasePricePerShare);
        this.client = client;
        this.investmentType = "STOCK";
        this.createdDate = LocalDateTime.now();
        this.status = InvestmentStatus.PENDING;
        this.riskLevel = determineRiskLevelBySector();
    }

    /**
     * Constructor for mutual fund or ETF investment
     * @param name investment name
     * @param investmentType type (ETF, MUTUAL_FUND, etc.)
     * @param amount total investment amount
     * @param client the client who owns this investment
     */
    public Investment(String name, String investmentType, BigDecimal amount, Client client) {
        this.name = name;
        this.investmentType = investmentType;
        this.amount = amount;
        this.client = client;
        this.createdDate = LocalDateTime.now();
        this.status = InvestmentStatus.PENDING;
        this.riskLevel = "MEDIUM";
    }

    /**
     * Constructor with employee assignment
     */
    public Investment(String name, String tickerSymbol, BigDecimal shares,
                      BigDecimal purchasePricePerShare, Client client, Employee createdBy) {
        this(name, tickerSymbol, shares, purchasePricePerShare, client);
        this.createdBy = createdBy;
    }

    // ========== Investment ID Management ==========

    public String getInvestmentId() {
        if (investmentId == null || investmentId.trim().isEmpty()) {
            generateInvestmentId();
        }
        return investmentId;
    }

    protected void generateInvestmentId() {
        if (id != null) {
            if (client != null && client.getClientId() != null) {
                this.investmentId = "INV-" + client.getClientId() + "-" + id;
            } else {
                this.investmentId = "INV-GEN-" + id;
            }
        }
    }

    // ========== US Stock Market Specific Methods ==========

    /**
     * Check if this is a stock investment
     */
    public boolean isStockInvestment() {
        return "STOCK".equals(investmentType) && tickerSymbol != null;
    }

    /**
     * Check if this is an ETF investment
     */
    public boolean isETFInvestment() {
        return "ETF".equals(investmentType);
    }

    /**
     * Check if this is a mutual fund investment
     */
    public boolean isMutualFundInvestment() {
        return "MUTUAL_FUND".equals(investmentType);
    }

    /**
     * Update current market price and recalculate value
     * @param newPrice new market price per share
     */
    public void updateMarketPrice(BigDecimal newPrice) {
        this.currentPricePerShare = newPrice;
        this.lastPriceUpdate = LocalDateTime.now();

        if (shares != null) {
            this.currentValue = shares.multiply(newPrice);
        }
    }

    /**
     * Add dividend payment to this investment
     * @param dividendAmount dividend received
     */
    public void addDividend(BigDecimal dividendAmount) {
        if (dividendsReceived == null) {
            dividendsReceived = BigDecimal.ZERO;
        }
        this.dividendsReceived = this.dividendsReceived.add(dividendAmount);
    }

    /**
     * Calculate total return including dividends
     */
    public BigDecimal calculateTotalReturn() {
        BigDecimal capitalGain = calculateGainLoss();
        BigDecimal totalDividends = dividendsReceived != null ? dividendsReceived : BigDecimal.ZERO;
        return capitalGain.add(totalDividends);
    }

    /**
     * Calculate total return percentage including dividends
     */
    public Double calculateTotalReturnPercentage() {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }

        BigDecimal totalReturn = calculateTotalReturn();
        BigDecimal percentage = totalReturn
                .divide(amount, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        return percentage.doubleValue();
    }

    /**
     * Determine risk level based on sector
     */
    public String determineRiskLevelBySector() {
        if (sector == null) return "MEDIUM";

        switch (sector.toUpperCase()) {
            case "TECHNOLOGY":
            case "BIOTECHNOLOGY":
            case "CRYPTOCURRENCY":
                return "HIGH";
            case "UTILITIES":
            case "CONSUMER_STAPLES":
            case "HEALTHCARE":
                return "LOW";
            default:
                return "MEDIUM";
        }
    }

    // ========== Financial Calculation Methods ==========

    public BigDecimal calculateGainLoss() {
        if (currentValue == null || amount == null) {
            return BigDecimal.ZERO;
        }
        return currentValue.subtract(amount);
    }

    public Double calculateReturnPercentage() {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0 || currentValue == null) {
            return 0.0;
        }

        BigDecimal gainLoss = calculateGainLoss();
        BigDecimal percentage = gainLoss
                .divide(amount, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        return percentage.doubleValue();
    }

    public long getDaysUntilMaturity() {
        if (maturityDate == null) {
            return 0;
        }
        return ChronoUnit.DAYS.between(LocalDateTime.now().toLocalDate(), maturityDate.toLocalDate());
    }

    /**
     * Calculate days since investment was made
     */
    public long getDaysInvested() {
        if (createdDate == null) {
            return 0;
        }
        return ChronoUnit.DAYS.between(createdDate.toLocalDate(), LocalDateTime.now().toLocalDate());
    }

    /**
     * Calculate annualized return percentage
     */
    public Double calculateAnnualizedReturn() {
        long daysInvested = getDaysInvested();
        if (daysInvested == 0) return 0.0;

        Double totalReturn = calculateTotalReturnPercentage();
        if (totalReturn == 0.0) return 0.0;

        // Annualized return = (1 + total return)^(365/days) - 1
        double annualizedReturn = Math.pow(1 + (totalReturn / 100), 365.0 / daysInvested) - 1;
        return annualizedReturn * 100;
    }

    // ========== Business Logic Methods ==========

    public boolean isActive() {
        return status == InvestmentStatus.ACTIVE;
    }

    public boolean isMature() {
        return maturityDate != null && LocalDateTime.now().isAfter(maturityDate);
    }

    public boolean isHighRisk() {
        return "HIGH".equals(riskLevel);
    }

    public String getClientName() {
        return client != null ? client.getClientName() : null;
    }

    public String getCreatedByName() {
        return createdBy != null ? createdBy.getFullName() : null;
    }

    // ========== Validation Methods ==========

    public boolean isValidInvestment() {
        return name != null && !name.trim().isEmpty() &&
                investmentType != null && !investmentType.trim().isEmpty() &&
                amount != null && amount.compareTo(BigDecimal.ZERO) > 0 &&
                client != null &&
                createdDate != null &&
                (tickerSymbol == null || isValidTickerSymbol());
    }

    public boolean isValidInvestmentId() {
        return investmentId != null && INVESTMENT_ID_PATTERN.matcher(investmentId).matches();
    }

    public boolean isValidAmount() {
        return amount != null && amount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isValidTickerSymbol() {
        return tickerSymbol != null && TICKER_PATTERN.matcher(tickerSymbol).matches();
    }

    /**
     * Check if price data is stale (older than 1 hour for active markets)
     */
    public boolean isPriceDataStale() {
        if (lastPriceUpdate == null) return true;
        return ChronoUnit.HOURS.between(lastPriceUpdate, LocalDateTime.now()) > 1;
    }

    // ========== Status Management Methods ==========

    public boolean activateInvestment() {
        if (status != InvestmentStatus.ACTIVE) {
            this.status = InvestmentStatus.ACTIVE;
            return true;
        }
        return false;
    }

    public boolean closeInvestment() {
        if (status != InvestmentStatus.COMPLETED) {
            this.status = InvestmentStatus.COMPLETED;
            return true;
        }
        return false;
    }

    public boolean suspendInvestment() {
        if (status != InvestmentStatus.SUSPENDED) {
            this.status = InvestmentStatus.SUSPENDED;
            return true;
        }
        return false;
    }

    public boolean liquidateInvestment() {
        if (status != InvestmentStatus.LIQUIDATED) {
            this.status = InvestmentStatus.LIQUIDATED;
            return true;
        }
        return false;
    }

    // ========== JPA Lifecycle Methods ==========

    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
        if (status == null) {
            status = InvestmentStatus.PENDING;
        }
        if (riskLevel == null) {
            riskLevel = "MEDIUM";
        }
        if (dividendsReceived == null) {
            dividendsReceived = BigDecimal.ZERO;
        }
    }

    @PostPersist
    protected void postPersist() {
        if (investmentId == null || investmentId.trim().isEmpty()) {
            generateInvestmentId();
        }
    }


    @PreUpdate
    protected void onUpdate() {
        this.lastModifiedAt = LocalDateTime.now();
    }}