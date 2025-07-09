package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a financial transaction in the system.
 * Tracks buy/sell orders, dividends, and other investment transactions.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "transactions",
        indexes = {
                @Index(name = "idx_transaction_client", columnList = "client_id"),
                @Index(name = "idx_transaction_investment", columnList = "investment_id"),
                @Index(name = "idx_transaction_date", columnList = "transaction_date"),
                @Index(name = "idx_transaction_type", columnList = "transaction_type"),
                @Index(name = "idx_transaction_status", columnList = "status"),
                @Index(name = "idx_transaction_reference", columnList = "reference_number", unique = true)
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "investment_id")
    private Investment investment;

    @Column(name = "transaction_type", nullable = false, length = 20)
    private String transactionType; // BUY, SELL, DIVIDEND, FEE, TRANSFER

    @Column(name = "ticker_symbol", length = 10)
    private String tickerSymbol;

    @Column(name = "shares", precision = 15, scale = 6)
    private BigDecimal shares;

    @Column(name = "price_per_share", precision = 19, scale = 4)
    private BigDecimal pricePerShare;

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "fee_amount", precision = 19, scale = 2)
    private BigDecimal feeAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, COMPLETED, CANCELLED, FAILED

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Column(name = "settlement_date")
    private LocalDateTime settlementDate;

    @Column(name = "reference_number", unique = true, length = 50)
    private String referenceNumber;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserAccount createdBy;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (transactionDate == null) {
            transactionDate = LocalDateTime.now();
        }
        if (feeAmount == null) {
            feeAmount = BigDecimal.ZERO;
        }
        if (status == null) {
            status = "PENDING";
        }
        if (referenceNumber == null) {
            referenceNumber = generateReferenceNumber();
        }
    }

    private String generateReferenceNumber() {
        return "TXN-" + System.currentTimeMillis();
    }

    /**
     * Calculates the total amount for the transaction including fees.
     * For BUY transactions: (shares * price) + fee
     * For SELL transactions: (shares * price) - fee
     *
     * @return the calculated total amount
     */
    public BigDecimal calculateTotalAmount() {
        if (shares == null || shares.compareTo(BigDecimal.ZERO) == 0 || pricePerShare == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal subtotal = shares.multiply(pricePerShare);
        BigDecimal fee = feeAmount != null ? feeAmount : BigDecimal.ZERO;

        if ("BUY".equalsIgnoreCase(transactionType)) {
            return subtotal.add(fee);
        } else if ("SELL".equalsIgnoreCase(transactionType)) {
            return subtotal.subtract(fee);
        } else {
            return subtotal;
        }
    }

    /**
     * Validates if the transaction has all required fields and valid values.
     *
     * @return true if the transaction is valid, false otherwise
     */
    public boolean isValid() {
        // Transaction type is required
        if (transactionType == null || transactionType.trim().isEmpty()) {
            return false;
        }

        // For BUY/SELL transactions, shares and price are required
        if (isBuyTransaction() || isSellTransaction()) {
            if (shares == null || shares.compareTo(BigDecimal.ZERO) <= 0) {
                return false;
            }
            if (pricePerShare == null || pricePerShare.compareTo(BigDecimal.ZERO) <= 0) {
                return false;
            }
        }

        // Fee cannot be negative
        if (feeAmount != null && feeAmount.compareTo(BigDecimal.ZERO) < 0) {
            return false;
        }

        // For dividend transactions, shares can be 0 but total amount must be positive
        if (isDividendTransaction()) {
            if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Checks if this is a buy transaction.
     *
     * @return true if transaction type is BUY
     */
    public boolean isBuyTransaction() {
        return "BUY".equalsIgnoreCase(transactionType);
    }

    /**
     * Checks if this is a sell transaction.
     *
     * @return true if transaction type is SELL
     */
    public boolean isSellTransaction() {
        return "SELL".equalsIgnoreCase(transactionType);
    }

    /**
     * Checks if this is a dividend transaction.
     *
     * @return true if transaction type is DIVIDEND
     */
    public boolean isDividendTransaction() {
        return "DIVIDEND".equalsIgnoreCase(transactionType);
    }

    /**
     * Checks if the transaction is completed.
     *
     * @return true if status is COMPLETED
     */
    public boolean isCompleted() {
        return "COMPLETED".equalsIgnoreCase(status);
    }

    /**
     * Checks if the transaction is pending.
     *
     * @return true if status is PENDING
     */
    public boolean isPending() {
        return "PENDING".equalsIgnoreCase(status);
    }

    /**
     * Checks if the transaction is cancelled.
     *
     * @return true if status is CANCELLED
     */
    public boolean isCancelled() {
        return "CANCELLED".equalsIgnoreCase(status);
    }

    /**
     * Gets the net amount after considering fees.
     * For BUY: total + fee
     * For SELL: total - fee
     *
     * @return the net amount
     */
    public BigDecimal getNetAmount() {
        if (totalAmount == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal fee = feeAmount != null ? feeAmount : BigDecimal.ZERO;

        if (isBuyTransaction()) {
            return totalAmount.add(fee);
        } else if (isSellTransaction()) {
            return totalAmount.subtract(fee);
        } else {
            return totalAmount;
        }
    }

    @Override
    public String toString() {
        return String.format("Transaction{id=%d, type=%s, symbol=%s, shares=%s, status=%s}",
                id, transactionType, tickerSymbol, shares, status);
    }
}