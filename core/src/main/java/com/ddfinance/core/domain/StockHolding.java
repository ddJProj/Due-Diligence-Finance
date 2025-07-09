package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.regex.Pattern;

/**
 * Entity representing a stock holding within a portfolio.
 * Tracks individual stock positions, their cost basis, and performance.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "stock_holdings",
        indexes = {
                @Index(name = "idx_holding_portfolio", columnList = "portfolio_id"),
                @Index(name = "idx_holding_ticker", columnList = "ticker_symbol"),
                @Index(name = "idx_holding_portfolio_ticker", columnList = "portfolio_id,ticker_symbol", unique = true)
        })
@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "portfolio")
public class StockHolding {

    private static final Pattern TICKER_PATTERN = Pattern.compile("^[A-Z]{1,5}$");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "ticker_symbol", nullable = false, length = 10)
    private String tickerSymbol;

    @Column(name = "company_name", length = 200)
    private String companyName;

    @Column(name = "shares", nullable = false, precision = 15, scale = 6)
    private BigDecimal shares;

    @Column(name = "average_purchase_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal averagePurchasePrice;

    @Column(name = "current_price", precision = 19, scale = 4)
    private BigDecimal currentPrice;

    @Column(name = "total_cost", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "current_value", precision = 19, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "total_dividends_received", precision = 19, scale = 2)
    private BigDecimal totalDividendsReceived = BigDecimal.ZERO;

    @Column(name = "exchange", length = 20)
    private String exchange; // NYSE, NASDAQ, etc.

    @Column(name = "sector", length = 50)
    private String sector;

    @Column(name = "first_purchase_date", nullable = false)
    private LocalDateTime firstPurchaseDate;

    @Column(name = "last_price_update")
    private LocalDateTime lastPriceUpdate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Constructors
    public StockHolding(String tickerSymbol, BigDecimal shares,
                        BigDecimal purchasePrice, Portfolio portfolio) {
        this.tickerSymbol = tickerSymbol;
        this.shares = shares;
        this.averagePurchasePrice = purchasePrice;
        this.portfolio = portfolio;
        this.totalCost = shares.multiply(purchasePrice);
        this.firstPurchaseDate = LocalDateTime.now();
        this.totalDividendsReceived = BigDecimal.ZERO;
    }

    // Full constructor matching test expectations
    public StockHolding(Long id, Portfolio portfolio, String tickerSymbol, String companyName,
                        BigDecimal shares, BigDecimal averagePurchasePrice, BigDecimal currentPrice,
                        BigDecimal totalCost, BigDecimal currentValue, String exchange, String sector,
                        LocalDateTime firstPurchaseDate, LocalDateTime lastPriceUpdate) {
        this.id = id;
        this.portfolio = portfolio;
        this.tickerSymbol = tickerSymbol;
        this.companyName = companyName;
        this.shares = shares;
        this.averagePurchasePrice = averagePurchasePrice;
        this.currentPrice = currentPrice;
        this.totalCost = totalCost;
        this.currentValue = currentValue;
        this.exchange = exchange;
        this.sector = sector;
        this.firstPurchaseDate = firstPurchaseDate;
        this.lastPriceUpdate = lastPriceUpdate;
        this.totalDividendsReceived = BigDecimal.ZERO;
    }

    @PrePersist
    protected void onCreate() {
        if (firstPurchaseDate == null) {
            firstPurchaseDate = LocalDateTime.now();
        }
        if (totalDividendsReceived == null) {
            totalDividendsReceived = BigDecimal.ZERO;
        }
    }

    /**
     * Calculates the gain or loss for this holding.
     *
     * @return gain/loss amount (positive for gain, negative for loss)
     */
    public BigDecimal calculateGainLoss() {
        if (currentValue == null || totalCost == null) {
            return BigDecimal.ZERO;
        }
        return currentValue.subtract(totalCost);
    }

    /**
     * Calculates the gain or loss percentage.
     *
     * @return gain/loss percentage
     */
    public Double calculateGainLossPercentage() {
        if (totalCost == null || totalCost.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }

        BigDecimal gainLoss = calculateGainLoss();
        BigDecimal percentage = gainLoss
                .divide(totalCost, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        return percentage.doubleValue();
    }

    /**
     * Updates the current value based on new market price.
     *
     * @param newPrice the new market price per share
     */
    public void updateCurrentValue(BigDecimal newPrice) {
        this.currentPrice = newPrice;
        this.lastPriceUpdate = LocalDateTime.now();

        if (shares != null && newPrice != null) {
            this.currentValue = shares.multiply(newPrice)
                    .setScale(2, RoundingMode.HALF_UP);
        }
    }

    /**
     * Calculates the weight of this holding in the portfolio.
     *
     * @param portfolioTotalValue total value of the portfolio
     * @return percentage weight in portfolio
     */
    public Double calculatePortfolioWeight(BigDecimal portfolioTotalValue) {
        if (portfolioTotalValue == null || portfolioTotalValue.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }

        if (currentValue == null) {
            return 0.0;
        }

        BigDecimal weight = currentValue
                .divide(portfolioTotalValue, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        return weight.doubleValue();
    }

    /**
     * Adds dividend payment to this holding.
     *
     * @param dividendAmount the dividend amount to add
     */
    public void addDividend(BigDecimal dividendAmount) {
        if (totalDividendsReceived == null) {
            totalDividendsReceived = BigDecimal.ZERO;
        }
        this.totalDividendsReceived = totalDividendsReceived.add(dividendAmount);
    }

    /**
     * Calculates total return including dividends.
     *
     * @return total return amount
     */
    public BigDecimal calculateTotalReturn() {
        BigDecimal capitalGain = calculateGainLoss();
        BigDecimal dividends = totalDividendsReceived != null ? totalDividendsReceived : BigDecimal.ZERO;
        return capitalGain.add(dividends);
    }

    /**
     * Calculates total return percentage including dividends.
     *
     * @return total return percentage
     */
    public Double calculateTotalReturnPercentage() {
        if (totalCost == null || totalCost.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }

        BigDecimal totalReturn = calculateTotalReturn();
        BigDecimal percentage = totalReturn
                .divide(totalCost, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        return percentage.doubleValue();
    }

    /**
     * Checks if this holding is currently profitable.
     *
     * @return true if profitable, false otherwise
     */
    public boolean isProfitable() {
        return calculateGainLoss().compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * Checks if price data is stale (older than 1 hour).
     *
     * @return true if price data is stale
     */
    public boolean isPriceDataStale() {
        if (lastPriceUpdate == null) {
            return true;
        }
        return ChronoUnit.HOURS.between(lastPriceUpdate, LocalDateTime.now()) > 1;
    }

    /**
     * Determines if this is a significant position (>10% of portfolio).
     *
     * @param portfolioTotalValue total portfolio value
     * @return true if significant position
     */
    public boolean isSignificantPosition(BigDecimal portfolioTotalValue) {
        return calculatePortfolioWeight(portfolioTotalValue) > 10.0;
    }

    /**
     * Adds shares to this holding (buy transaction).
     *
     * @param newShares number of shares to add
     * @param purchasePrice price per share
     */
    public void addShares(BigDecimal newShares, BigDecimal purchasePrice) {
        if (shares == null) {
            shares = BigDecimal.ZERO;
        }
        if (totalCost == null) {
            totalCost = BigDecimal.ZERO;
        }

        BigDecimal newCost = newShares.multiply(purchasePrice);
        BigDecimal totalShares = shares.add(newShares);
        BigDecimal newTotalCost = totalCost.add(newCost);

        // Update average purchase price
        this.averagePurchasePrice = newTotalCost
                .divide(totalShares, 2, RoundingMode.HALF_UP);

        this.shares = totalShares;
        this.totalCost = newTotalCost;
    }

    /**
     * Removes shares from this holding (sell transaction).
     *
     * @param sharesToSell number of shares to remove
     * @return cost basis of sold shares
     */
    public BigDecimal removeShares(BigDecimal sharesToSell) {
        if (shares == null || sharesToSell.compareTo(shares) > 0) {
            throw new IllegalArgumentException("Cannot sell more shares than owned");
        }

        // Calculate cost basis for sold shares
        BigDecimal costBasis = averagePurchasePrice.multiply(sharesToSell);

        // Update remaining shares and cost
        shares = shares.subtract(sharesToSell);
        totalCost = totalCost.subtract(costBasis);

        return costBasis;
    }

    /**
     * Validates if this holding has all required fields and valid data.
     *
     * @return true if valid, false otherwise
     */
    public boolean isValid() {
        if (portfolio == null) {
            return false;
        }

        if (tickerSymbol == null || tickerSymbol.trim().isEmpty()) {
            return false;
        }

        if (!TICKER_PATTERN.matcher(tickerSymbol).matches()) {
            return false;
        }

        if (shares == null || shares.compareTo(BigDecimal.ZERO) < 0) {
            return false;
        }

        if (averagePurchasePrice != null && averagePurchasePrice.compareTo(BigDecimal.ZERO) < 0) {
            return false;
        }

        if (totalCost != null && totalCost.compareTo(BigDecimal.ZERO) < 0) {
            return false;
        }

        return true;
    }

    @Override
    public String toString() {
        return String.format("StockHolding{id=%d, ticker='%s', shares=%s, value=%s}",
                id, tickerSymbol, shares, currentValue);
    }
}