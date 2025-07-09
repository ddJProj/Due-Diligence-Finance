package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a client's investment portfolio.
 * Aggregates all stock holdings and provides portfolio-level analytics.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "portfolios",
        indexes = {
                @Index(name = "idx_portfolio_client", columnList = "client_id"),
                @Index(name = "idx_portfolio_active", columnList = "is_active"),
                @Index(name = "idx_portfolio_name", columnList = "portfolio_name")
        })
@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"client", "holdings"})
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "portfolio_name", nullable = false, length = 100)
    private String portfolioName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockHolding> holdings = new ArrayList<>();

    @Column(name = "total_value", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalValue = BigDecimal.ZERO;

    @Column(name = "total_cost", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalCost = BigDecimal.ZERO;

    @Column(name = "cash_balance", precision = 19, scale = 2)
    private BigDecimal cashBalance = BigDecimal.ZERO;

    @Column(name = "realized_gain_loss", precision = 19, scale = 2)
    private BigDecimal realizedGainLoss = BigDecimal.ZERO;

    @Column(name = "total_dividends_received", precision = 19, scale = 2)
    private BigDecimal totalDividendsReceived = BigDecimal.ZERO;

    @Column(name = "risk_profile", length = 20)
    private String riskProfile = "MODERATE"; // CONSERVATIVE, MODERATE, AGGRESSIVE

    @Column(name = "target_allocation", length = 500)
    private String targetAllocation; // JSON string for sector allocations

    @Column(name = "rebalance_frequency", length = 20)
    private String rebalanceFrequency = "QUARTERLY"; // MONTHLY, QUARTERLY, ANNUALLY

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "last_calculated")
    private LocalDateTime lastCalculated;

    @Column(name = "last_rebalanced")
    private LocalDateTime lastRebalanced;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Constructors
    public Portfolio(Client client) {
        this.client = client;
        this.portfolioName = "Main Portfolio";
        this.isActive = true;
        this.totalValue = BigDecimal.ZERO;
        this.totalCost = BigDecimal.ZERO;
        this.cashBalance = BigDecimal.ZERO;
        this.realizedGainLoss = BigDecimal.ZERO;
        this.totalDividendsReceived = BigDecimal.ZERO;
        this.createdDate = LocalDateTime.now();
    }

    public Portfolio(String portfolioName, Client client) {
        this(client);
        this.portfolioName = portfolioName;
    }

    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
        if (totalValue == null) {
            totalValue = BigDecimal.ZERO;
        }
        if (totalCost == null) {
            totalCost = BigDecimal.ZERO;
        }
        if (cashBalance == null) {
            cashBalance = BigDecimal.ZERO;
        }
        if (realizedGainLoss == null) {
            realizedGainLoss = BigDecimal.ZERO;
        }
        if (totalDividendsReceived == null) {
            totalDividendsReceived = BigDecimal.ZERO;
        }
    }

    /**
     * Calculates unrealized gain/loss for the portfolio.
     *
     * @return unrealized gain/loss amount
     */
    public BigDecimal calculateUnrealizedGainLoss() {
        if (totalValue == null || totalCost == null) {
            return BigDecimal.ZERO;
        }
        return totalValue.subtract(totalCost);
    }

    /**
     * Calculates total gain/loss including realized gains.
     *
     * @return total gain/loss amount
     */
    public BigDecimal calculateTotalGainLoss() {
        BigDecimal unrealized = calculateUnrealizedGainLoss();
        BigDecimal realized = realizedGainLoss != null ? realizedGainLoss : BigDecimal.ZERO;
        return unrealized.add(realized);
    }

    /**
     * Calculates return percentage for the portfolio.
     *
     * @return return percentage
     */
    public Double calculateReturnPercentage() {
        if (totalCost == null || totalCost.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }

        BigDecimal gainLoss = calculateUnrealizedGainLoss();
        BigDecimal percentage = gainLoss
                .divide(totalCost, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        return percentage.doubleValue();
    }

    /**
     * Calculates total assets (investments + cash).
     *
     * @return total assets
     */
    public BigDecimal calculateTotalAssets() {
        BigDecimal value = totalValue != null ? totalValue : BigDecimal.ZERO;
        BigDecimal cash = cashBalance != null ? cashBalance : BigDecimal.ZERO;
        return value.add(cash);
    }

    /**
     * Calculates percentage of assets invested.
     *
     * @return investment percentage
     */
    public Double calculateInvestmentPercentage() {
        BigDecimal totalAssets = calculateTotalAssets();
        if (totalAssets.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }

        BigDecimal value = totalValue != null ? totalValue : BigDecimal.ZERO;
        BigDecimal percentage = value
                .divide(totalAssets, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        return percentage.doubleValue();
    }

    /**
     * Calculates percentage of assets held as cash.
     *
     * @return cash percentage
     */
    public Double calculateCashPercentage() {
        BigDecimal totalAssets = calculateTotalAssets();
        if (totalAssets.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }

        BigDecimal cash = cashBalance != null ? cashBalance : BigDecimal.ZERO;
        BigDecimal percentage = cash
                .divide(totalAssets, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        return percentage.doubleValue();
    }

    /**
     * Adds a stock holding to the portfolio.
     *
     * @param holding the holding to add
     */
    public void addHolding(StockHolding holding) {
        if (holdings == null) {
            holdings = new ArrayList<>();
        }
        holdings.add(holding);
        holding.setPortfolio(this);
    }

    /**
     * Removes a stock holding from the portfolio.
     *
     * @param holding the holding to remove
     * @return true if removed, false otherwise
     */
    public boolean removeHolding(StockHolding holding) {
        if (holdings != null && holdings.remove(holding)) {
            holding.setPortfolio(null);
            return true;
        }
        return false;
    }

    /**
     * Gets the count of holdings in the portfolio.
     *
     * @return number of holdings
     */
    public int getHoldingsCount() {
        return holdings != null ? holdings.size() : 0;
    }

    /**
     * Finds a holding by ticker symbol.
     *
     * @param tickerSymbol the ticker to search for
     * @return the holding if found, null otherwise
     */
    public StockHolding findHoldingByTicker(String tickerSymbol) {
        if (holdings == null || tickerSymbol == null) {
            return null;
        }

        return holdings.stream()
                .filter(h -> tickerSymbol.equalsIgnoreCase(h.getTickerSymbol()))
                .findFirst()
                .orElse(null);
    }

    /**
     * Checks if the portfolio is active.
     *
     * @return true if active
     */
    public boolean isActive() {
        return Boolean.TRUE.equals(isActive);
    }

    /**
     * Checks if the portfolio has any holdings.
     *
     * @return true if has holdings
     */
    public boolean hasHoldings() {
        return holdings != null && !holdings.isEmpty();
    }

    /**
     * Checks if the portfolio is profitable.
     *
     * @return true if profitable
     */
    public boolean isProfitable() {
        return calculateUnrealizedGainLoss().compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * Checks if the portfolio is high risk.
     *
     * @return true if high risk
     */
    public boolean isHighRisk() {
        return "AGGRESSIVE".equalsIgnoreCase(riskProfile);
    }

    /**
     * Checks if the portfolio is low risk.
     *
     * @return true if low risk
     */
    public boolean isLowRisk() {
        return "CONSERVATIVE".equalsIgnoreCase(riskProfile);
    }

    /**
     * Updates the last calculated timestamp.
     */
    public void updateCalculations() {
        this.lastCalculated = LocalDateTime.now();
    }

    /**
     * Validates if the portfolio has all required fields.
     *
     * @return true if valid
     */
    public boolean isValid() {
        if (client == null) {
            return false;
        }

        if (portfolioName == null || portfolioName.trim().isEmpty()) {
            return false;
        }

        if (totalValue != null && totalValue.compareTo(BigDecimal.ZERO) < 0) {
            return false;
        }

        if (totalCost != null && totalCost.compareTo(BigDecimal.ZERO) < 0) {
            return false;
        }

        if (cashBalance != null && cashBalance.compareTo(BigDecimal.ZERO) < 0) {
            return false;
        }

        return true;
    }

    @Override
    public String toString() {
        return String.format("Portfolio{id=%d, name='%s', value=%s, active=%s}",
                id, portfolioName, totalValue, isActive);
    }
}
