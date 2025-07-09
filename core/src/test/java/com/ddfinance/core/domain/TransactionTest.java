package com.ddfinance.core.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for Transaction entity.
 * Tests transaction creation, validation, calculations, and business logic.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
class TransactionTest {

    private Transaction transaction;
    private Client client;
    private Investment investment;

    @BeforeEach
    void setUp() {
        transaction = new Transaction();

        // Create test client
        client = new Client();
        client.setId(1L);

        // Create test investment
        investment = new Investment();
        investment.setId(100L);
        investment.setTickerSymbol("AAPL");
    }

    @Nested
    @DisplayName("Constructor Tests")
    class ConstructorTests {

        @Test
        @DisplayName("Should create Transaction with default constructor")
        void shouldCreateWithDefaultConstructor() {
            // When
            Transaction tx = new Transaction();

            // Then
            assertThat(tx).isNotNull();
            assertThat(tx.getId()).isNull();
            assertThat(tx.getTransactionType()).isNull();
            assertThat(tx.getStatus()).isNull();
        }

        @Test
        @DisplayName("Should create Transaction with all-args constructor")
        void shouldCreateWithAllArgsConstructor() {
            // Given
            Long id = 1L;
            String type = "BUY";
            String tickerSymbol = "AAPL";
            BigDecimal shares = new BigDecimal("100.000000");
            BigDecimal pricePerShare = new BigDecimal("150.0000");
            BigDecimal totalAmount = new BigDecimal("15000.00");
            BigDecimal feeAmount = new BigDecimal("10.00");
            String status = "COMPLETED";
            LocalDateTime transactionDate = LocalDateTime.now();
            LocalDateTime settlementDate = transactionDate.plusDays(2);
            String referenceNumber = "TXN-2025-001";
            String description = "Market order";
            LocalDateTime createdAt = LocalDateTime.now();
            UserAccount createdBy = new UserAccount();

            // When
            Transaction tx = new Transaction(id, client, investment, type, tickerSymbol,
                    shares, pricePerShare, totalAmount, feeAmount, status,
                    transactionDate, settlementDate, referenceNumber, description,
                    createdAt, createdBy);

            // Then
            assertThat(tx.getId()).isEqualTo(id);
            assertThat(tx.getClient()).isEqualTo(client);
            assertThat(tx.getInvestment()).isEqualTo(investment);
            assertThat(tx.getTransactionType()).isEqualTo(type);
            assertThat(tx.getTickerSymbol()).isEqualTo(tickerSymbol);
            assertThat(tx.getShares()).isEqualTo(shares);
            assertThat(tx.getPricePerShare()).isEqualTo(pricePerShare);
            assertThat(tx.getTotalAmount()).isEqualTo(totalAmount);
            assertThat(tx.getFeeAmount()).isEqualTo(feeAmount);
            assertThat(tx.getStatus()).isEqualTo(status);
            assertThat(tx.getTransactionDate()).isEqualTo(transactionDate);
            assertThat(tx.getSettlementDate()).isEqualTo(settlementDate);
            assertThat(tx.getReferenceNumber()).isEqualTo(referenceNumber);
            assertThat(tx.getDescription()).isEqualTo(description);
        }
    }

    @Nested
    @DisplayName("Property Tests")
    class PropertyTests {

        @Test
        @DisplayName("Should set and get transaction type")
        void shouldSetAndGetTransactionType() {
            // Given
            String type = "BUY";

            // When
            transaction.setTransactionType(type);

            // Then
            assertThat(transaction.getTransactionType()).isEqualTo(type);
        }

        @Test
        @DisplayName("Should set and get ticker symbol")
        void shouldSetAndGetTickerSymbol() {
            // Given
            String symbol = "MSFT";

            // When
            transaction.setTickerSymbol(symbol);

            // Then
            assertThat(transaction.getTickerSymbol()).isEqualTo(symbol);
        }

        @Test
        @DisplayName("Should set and get shares")
        void shouldSetAndGetShares() {
            // Given
            BigDecimal shares = new BigDecimal("50.500000");

            // When
            transaction.setShares(shares);

            // Then
            assertThat(transaction.getShares()).isEqualTo(shares);
        }

        @Test
        @DisplayName("Should set and get price per share")
        void shouldSetAndGetPricePerShare() {
            // Given
            BigDecimal price = new BigDecimal("175.5000");

            // When
            transaction.setPricePerShare(price);

            // Then
            assertThat(transaction.getPricePerShare()).isEqualTo(price);
        }

        @Test
        @DisplayName("Should set and get total amount")
        void shouldSetAndGetTotalAmount() {
            // Given
            BigDecimal total = new BigDecimal("8775.00");

            // When
            transaction.setTotalAmount(total);

            // Then
            assertThat(transaction.getTotalAmount()).isEqualTo(total);
        }

        @Test
        @DisplayName("Should set and get fee amount")
        void shouldSetAndGetFeeAmount() {
            // Given
            BigDecimal fee = new BigDecimal("5.00");

            // When
            transaction.setFeeAmount(fee);

            // Then
            assertThat(transaction.getFeeAmount()).isEqualTo(fee);
        }

        @Test
        @DisplayName("Should set and get status")
        void shouldSetAndGetStatus() {
            // Given
            String status = "PENDING";

            // When
            transaction.setStatus(status);

            // Then
            assertThat(transaction.getStatus()).isEqualTo(status);
        }
    }

    @Nested
    @DisplayName("Business Logic Tests")
    class BusinessLogicTests {

        @Test
        @DisplayName("Should calculate total amount for buy transaction")
        void shouldCalculateTotalAmountForBuyTransaction() {
            // Given
            transaction.setTransactionType("BUY");
            transaction.setShares(new BigDecimal("100"));
            transaction.setPricePerShare(new BigDecimal("150.00"));
            transaction.setFeeAmount(new BigDecimal("10.00"));

            // When
            BigDecimal calculatedTotal = transaction.calculateTotalAmount();

            // Then
            assertThat(calculatedTotal).isEqualTo(new BigDecimal("15010.00"));
        }

        @Test
        @DisplayName("Should calculate total amount for sell transaction")
        void shouldCalculateTotalAmountForSellTransaction() {
            // Given
            transaction.setTransactionType("SELL");
            transaction.setShares(new BigDecimal("50"));
            transaction.setPricePerShare(new BigDecimal("200.00"));
            transaction.setFeeAmount(new BigDecimal("10.00"));

            // When
            BigDecimal calculatedTotal = transaction.calculateTotalAmount();

            // Then
            assertThat(calculatedTotal).isEqualTo(new BigDecimal("9990.00"));
        }

        @Test
        @DisplayName("Should validate buy transaction")
        void shouldValidateBuyTransaction() {
            // Given
            transaction.setTransactionType("BUY");
            transaction.setShares(new BigDecimal("100"));
            transaction.setPricePerShare(new BigDecimal("150.00"));
            transaction.setTotalAmount(new BigDecimal("15010.00"));
            transaction.setFeeAmount(new BigDecimal("10.00"));

            // When
            boolean isValid = transaction.isValid();

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should fail validation for negative shares")
        void shouldFailValidationForNegativeShares() {
            // Given
            transaction.setTransactionType("BUY");
            transaction.setShares(new BigDecimal("-10"));
            transaction.setPricePerShare(new BigDecimal("150.00"));

            // When
            boolean isValid = transaction.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should fail validation for zero price")
        void shouldFailValidationForZeroPrice() {
            // Given
            transaction.setTransactionType("BUY");
            transaction.setShares(new BigDecimal("100"));
            transaction.setPricePerShare(BigDecimal.ZERO);

            // When
            boolean isValid = transaction.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should identify buy transaction type")
        void shouldIdentifyBuyTransactionType() {
            // Given
            transaction.setTransactionType("BUY");

            // When & Then
            assertThat(transaction.isBuyTransaction()).isTrue();
            assertThat(transaction.isSellTransaction()).isFalse();
            assertThat(transaction.isDividendTransaction()).isFalse();
        }

        @Test
        @DisplayName("Should identify sell transaction type")
        void shouldIdentifySellTransactionType() {
            // Given
            transaction.setTransactionType("SELL");

            // When & Then
            assertThat(transaction.isBuyTransaction()).isFalse();
            assertThat(transaction.isSellTransaction()).isTrue();
            assertThat(transaction.isDividendTransaction()).isFalse();
        }

        @Test
        @DisplayName("Should identify dividend transaction type")
        void shouldIdentifyDividendTransactionType() {
            // Given
            transaction.setTransactionType("DIVIDEND");

            // When & Then
            assertThat(transaction.isBuyTransaction()).isFalse();
            assertThat(transaction.isSellTransaction()).isFalse();
            assertThat(transaction.isDividendTransaction()).isTrue();
        }

        @Test
        @DisplayName("Should check if transaction is completed")
        void shouldCheckIfTransactionIsCompleted() {
            // Given
            transaction.setStatus("COMPLETED");

            // When
            boolean isCompleted = transaction.isCompleted();

            // Then
            assertThat(isCompleted).isTrue();
        }

        @Test
        @DisplayName("Should check if transaction is pending")
        void shouldCheckIfTransactionIsPending() {
            // Given
            transaction.setStatus("PENDING");

            // When
            boolean isPending = transaction.isPending();

            // Then
            assertThat(isPending).isTrue();
        }

        @Test
        @DisplayName("Should check if transaction is cancelled")
        void shouldCheckIfTransactionIsCancelled() {
            // Given
            transaction.setStatus("CANCELLED");

            // When
            boolean isCancelled = transaction.isCancelled();

            // Then
            assertThat(isCancelled).isTrue();
        }

        @Test
        @DisplayName("Should get net amount for buy transaction")
        void shouldGetNetAmountForBuyTransaction() {
            // Given
            transaction.setTransactionType("BUY");
            transaction.setTotalAmount(new BigDecimal("10000.00"));
            transaction.setFeeAmount(new BigDecimal("10.00"));

            // When
            BigDecimal netAmount = transaction.getNetAmount();

            // Then
            assertThat(netAmount).isEqualTo(new BigDecimal("10010.00"));
        }

        @Test
        @DisplayName("Should get net amount for sell transaction")
        void shouldGetNetAmountForSellTransaction() {
            // Given
            transaction.setTransactionType("SELL");
            transaction.setTotalAmount(new BigDecimal("10000.00"));
            transaction.setFeeAmount(new BigDecimal("10.00"));

            // When
            BigDecimal netAmount = transaction.getNetAmount();

            // Then
            assertThat(netAmount).isEqualTo(new BigDecimal("9990.00"));
        }
    }

    @Nested
    @DisplayName("Validation Tests")
    class ValidationTests {

        @Test
        @DisplayName("Should require transaction type")
        void shouldRequireTransactionType() {
            // Given
            transaction.setShares(new BigDecimal("100"));
            transaction.setPricePerShare(new BigDecimal("150.00"));

            // When
            boolean isValid = transaction.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should require shares for buy/sell transactions")
        void shouldRequireSharesForBuySellTransactions() {
            // Given
            transaction.setTransactionType("BUY");
            transaction.setPricePerShare(new BigDecimal("150.00"));

            // When
            boolean isValid = transaction.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should allow zero shares for dividend transactions")
        void shouldAllowZeroSharesForDividendTransactions() {
            // Given
            transaction.setTransactionType("DIVIDEND");
            transaction.setShares(BigDecimal.ZERO);
            transaction.setTotalAmount(new BigDecimal("100.00"));

            // When
            boolean isValid = transaction.isValid();

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should validate fee is not negative")
        void shouldValidateFeeIsNotNegative() {
            // Given
            transaction.setTransactionType("BUY");
            transaction.setShares(new BigDecimal("100"));
            transaction.setPricePerShare(new BigDecimal("150.00"));
            transaction.setFeeAmount(new BigDecimal("-10.00"));

            // When
            boolean isValid = transaction.isValid();

            // Then
            assertThat(isValid).isFalse();
        }
    }

    @Nested
    @DisplayName("Equality Tests")
    class EqualityTests {

        @Test
        @DisplayName("Should be equal to self")
        void shouldBeEqualToSelf() {
            // Given
            transaction.setId(1L);

            // Then
            assertThat(transaction).isEqualTo(transaction);
        }

        @Test
        @DisplayName("Should be equal to another transaction with same id")
        void shouldBeEqualToAnotherTransactionWithSameId() {
            // Given
            transaction.setId(1L);
            Transaction other = new Transaction();
            other.setId(1L);

            // Then
            assertThat(transaction).isEqualTo(other);
            assertThat(transaction.hashCode()).isEqualTo(other.hashCode());
        }

        @Test
        @DisplayName("Should not be equal to transaction with different id")
        void shouldNotBeEqualToTransactionWithDifferentId() {
            // Given
            transaction.setId(1L);
            Transaction other = new Transaction();
            other.setId(2L);

            // Then
            assertThat(transaction).isNotEqualTo(other);
        }
    }

    @Nested
    @DisplayName("toString Tests")
    class ToStringTests {

        @Test
        @DisplayName("Should generate meaningful toString")
        void shouldGenerateMeaningfulToString() {
            // Given
            transaction.setId(1L);
            transaction.setTransactionType("BUY");
            transaction.setTickerSymbol("AAPL");
            transaction.setShares(new BigDecimal("100"));
            transaction.setStatus("COMPLETED");

            // When
            String result = transaction.toString();

            // Then
            assertThat(result).contains("Transaction");
            assertThat(result).contains("id=1");
            assertThat(result).contains("type=BUY");
            assertThat(result).contains("symbol=AAPL");
            assertThat(result).contains("shares=100");
            assertThat(result).contains("status=COMPLETED");
        }
    }
}
