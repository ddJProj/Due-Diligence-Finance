package com.ddfinance.core.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for StockHolding entity.
 * Tests stock position tracking, calculations, and business logic.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
class StockHoldingTest {

    private StockHolding stockHolding;
    private Portfolio portfolio;
    private Client client;

    @BeforeEach
    void setUp() {
        stockHolding = new StockHolding();

        // Create test client
        client = new Client();
        client.setId(1L);

        // Create test portfolio
        portfolio = new Portfolio(client);
        portfolio.setId(100L);
    }

    @Nested
    @DisplayName("Constructor Tests")
    class ConstructorTests {

        @Test
        @DisplayName("Should create StockHolding with default constructor")
        void shouldCreateWithDefaultConstructor() {
            // When
            StockHolding holding = new StockHolding();

            // Then
            assertThat(holding).isNotNull();
            assertThat(holding.getId()).isNull();
            assertThat(holding.getTickerSymbol()).isNull();
            assertThat(holding.getShares()).isNull();
        }

        @Test
        @DisplayName("Should create StockHolding with ticker and shares constructor")
        void shouldCreateWithTickerAndSharesConstructor() {
            // Given
            String ticker = "AAPL";
            BigDecimal shares = new BigDecimal("100.500000");
            BigDecimal purchasePrice = new BigDecimal("150.0000");

            // When
            StockHolding holding = new StockHolding(ticker, shares, purchasePrice, portfolio);

            // Then
            assertThat(holding.getTickerSymbol()).isEqualTo(ticker);
            assertThat(holding.getShares()).isEqualTo(shares);
            assertThat(holding.getAveragePurchasePrice()).isEqualTo(purchasePrice);
            assertThat(holding.getPortfolio()).isEqualTo(portfolio);
            assertThat(holding.getTotalCost()).isEqualTo(shares.multiply(purchasePrice));
        }

        @Test
        @DisplayName("Should create StockHolding with full constructor")
        void shouldCreateWithFullConstructor() {
            // Given
            Long id = 1L;
            String ticker = "MSFT";
            String companyName = "Microsoft Corporation";
            BigDecimal shares = new BigDecimal("50.000000");
            BigDecimal avgPrice = new BigDecimal("300.0000");
            BigDecimal currentPrice = new BigDecimal("350.0000");
            BigDecimal totalCost = new BigDecimal("15000.00");
            BigDecimal currentValue = new BigDecimal("17500.00");
            String exchange = "NASDAQ";
            String sector = "Technology";
            LocalDateTime firstPurchase = LocalDateTime.now().minusDays(30);
            LocalDateTime lastUpdate = LocalDateTime.now();

            // When
            StockHolding holding = new StockHolding(id, portfolio, ticker, companyName,
                    shares, avgPrice, currentPrice, totalCost, currentValue,
                    exchange, sector, firstPurchase, lastUpdate);

            // Then
            assertThat(holding.getId()).isEqualTo(id);
            assertThat(holding.getPortfolio()).isEqualTo(portfolio);
            assertThat(holding.getTickerSymbol()).isEqualTo(ticker);
            assertThat(holding.getCompanyName()).isEqualTo(companyName);
            assertThat(holding.getShares()).isEqualTo(shares);
            assertThat(holding.getAveragePurchasePrice()).isEqualTo(avgPrice);
            assertThat(holding.getCurrentPrice()).isEqualTo(currentPrice);
            assertThat(holding.getTotalCost()).isEqualTo(totalCost);
            assertThat(holding.getCurrentValue()).isEqualTo(currentValue);
            assertThat(holding.getExchange()).isEqualTo(exchange);
            assertThat(holding.getSector()).isEqualTo(sector);
            assertThat(holding.getFirstPurchaseDate()).isEqualTo(firstPurchase);
            assertThat(holding.getLastPriceUpdate()).isEqualTo(lastUpdate);
        }
    }

    @Nested
    @DisplayName("Property Tests")
    class PropertyTests {

        @Test
        @DisplayName("Should set and get ticker symbol")
        void shouldSetAndGetTickerSymbol() {
            // Given
            String ticker = "GOOGL";

            // When
            stockHolding.setTickerSymbol(ticker);

            // Then
            assertThat(stockHolding.getTickerSymbol()).isEqualTo(ticker);
        }

        @Test
        @DisplayName("Should set and get company name")
        void shouldSetAndGetCompanyName() {
            // Given
            String name = "Alphabet Inc.";

            // When
            stockHolding.setCompanyName(name);

            // Then
            assertThat(stockHolding.getCompanyName()).isEqualTo(name);
        }

        @Test
        @DisplayName("Should set and get shares")
        void shouldSetAndGetShares() {
            // Given
            BigDecimal shares = new BigDecimal("75.250000");

            // When
            stockHolding.setShares(shares);

            // Then
            assertThat(stockHolding.getShares()).isEqualTo(shares);
        }

        @Test
        @DisplayName("Should set and get average purchase price")
        void shouldSetAndGetAveragePurchasePrice() {
            // Given
            BigDecimal price = new BigDecimal("250.7500");

            // When
            stockHolding.setAveragePurchasePrice(price);

            // Then
            assertThat(stockHolding.getAveragePurchasePrice()).isEqualTo(price);
        }

        @Test
        @DisplayName("Should set and get current price")
        void shouldSetAndGetCurrentPrice() {
            // Given
            BigDecimal price = new BigDecimal("275.5000");

            // When
            stockHolding.setCurrentPrice(price);

            // Then
            assertThat(stockHolding.getCurrentPrice()).isEqualTo(price);
        }

        @Test
        @DisplayName("Should set and get portfolio")
        void shouldSetAndGetPortfolio() {
            // When
            stockHolding.setPortfolio(portfolio);

            // Then
            assertThat(stockHolding.getPortfolio()).isEqualTo(portfolio);
        }
    }

    @Nested
    @DisplayName("Calculation Tests")
    class CalculationTests {

        @Test
        @DisplayName("Should calculate gain/loss amount")
        void shouldCalculateGainLossAmount() {
            // Given
            stockHolding.setCurrentValue(new BigDecimal("15000.00"));
            stockHolding.setTotalCost(new BigDecimal("12000.00"));

            // When
            BigDecimal gainLoss = stockHolding.calculateGainLoss();

            // Then
            assertThat(gainLoss).isEqualTo(new BigDecimal("3000.00"));
        }

        @Test
        @DisplayName("Should calculate loss amount")
        void shouldCalculateLossAmount() {
            // Given
            stockHolding.setCurrentValue(new BigDecimal("8000.00"));
            stockHolding.setTotalCost(new BigDecimal("10000.00"));

            // When
            BigDecimal gainLoss = stockHolding.calculateGainLoss();

            // Then
            assertThat(gainLoss).isEqualTo(new BigDecimal("-2000.00"));
        }

        @Test
        @DisplayName("Should calculate gain/loss percentage")
        void shouldCalculateGainLossPercentage() {
            // Given
            stockHolding.setCurrentValue(new BigDecimal("15000.00"));
            stockHolding.setTotalCost(new BigDecimal("10000.00"));

            // When
            Double percentage = stockHolding.calculateGainLossPercentage();

            // Then
            assertThat(percentage).isEqualTo(50.0);
        }

        @Test
        @DisplayName("Should handle zero cost when calculating percentage")
        void shouldHandleZeroCostWhenCalculatingPercentage() {
            // Given
            stockHolding.setCurrentValue(new BigDecimal("15000.00"));
            stockHolding.setTotalCost(BigDecimal.ZERO);

            // When
            Double percentage = stockHolding.calculateGainLossPercentage();

            // Then
            assertThat(percentage).isEqualTo(0.0);
        }

        @Test
        @DisplayName("Should update current value based on price")
        void shouldUpdateCurrentValueBasedOnPrice() {
            // Given
            stockHolding.setShares(new BigDecimal("100"));
            BigDecimal newPrice = new BigDecimal("150.00");

            // When
            stockHolding.updateCurrentValue(newPrice);

            // Then
            assertThat(stockHolding.getCurrentPrice()).isEqualTo(newPrice);
            assertThat(stockHolding.getCurrentValue()).isEqualTo(new BigDecimal("15000.00"));
            assertThat(stockHolding.getLastPriceUpdate()).isNotNull();
        }

        @Test
        @DisplayName("Should calculate portfolio weight")
        void shouldCalculatePortfolioWeight() {
            // Given
            stockHolding.setCurrentValue(new BigDecimal("25000.00"));
            BigDecimal portfolioTotal = new BigDecimal("100000.00");

            // When
            Double weight = stockHolding.calculatePortfolioWeight(portfolioTotal);

            // Then
            assertThat(weight).isEqualTo(25.0);
        }

        @Test
        @DisplayName("Should calculate total dividends received")
        void shouldCalculateTotalDividendsReceived() {
            // Given
            stockHolding.setTotalDividendsReceived(new BigDecimal("500.00"));

            // When
            stockHolding.addDividend(new BigDecimal("100.00"));

            // Then
            assertThat(stockHolding.getTotalDividendsReceived()).isEqualTo(new BigDecimal("600.00"));
        }

        @Test
        @DisplayName("Should calculate total return including dividends")
        void shouldCalculateTotalReturnIncludingDividends() {
            // Given
            stockHolding.setCurrentValue(new BigDecimal("12000.00"));
            stockHolding.setTotalCost(new BigDecimal("10000.00"));
            stockHolding.setTotalDividendsReceived(new BigDecimal("300.00"));

            // When
            BigDecimal totalReturn = stockHolding.calculateTotalReturn();

            // Then
            assertThat(totalReturn).isEqualTo(new BigDecimal("2300.00"));
        }

        @Test
        @DisplayName("Should calculate total return percentage")
        void shouldCalculateTotalReturnPercentage() {
            // Given
            stockHolding.setCurrentValue(new BigDecimal("12000.00"));
            stockHolding.setTotalCost(new BigDecimal("10000.00"));
            stockHolding.setTotalDividendsReceived(new BigDecimal("300.00"));

            // When
            Double percentage = stockHolding.calculateTotalReturnPercentage();

            // Then
            assertThat(percentage).isEqualTo(23.0);
        }
    }

    @Nested
    @DisplayName("Business Logic Tests")
    class BusinessLogicTests {

        @Test
        @DisplayName("Should check if holding is profitable")
        void shouldCheckIfHoldingIsProfitable() {
            // Given
            stockHolding.setCurrentValue(new BigDecimal("15000.00"));
            stockHolding.setTotalCost(new BigDecimal("12000.00"));

            // Then
            assertThat(stockHolding.isProfitable()).isTrue();
        }

        @Test
        @DisplayName("Should check if holding is at loss")
        void shouldCheckIfHoldingIsAtLoss() {
            // Given
            stockHolding.setCurrentValue(new BigDecimal("8000.00"));
            stockHolding.setTotalCost(new BigDecimal("10000.00"));

            // Then
            assertThat(stockHolding.isProfitable()).isFalse();
        }

        @Test
        @DisplayName("Should check if price data is stale")
        void shouldCheckIfPriceDataIsStale() {
            // Given
            stockHolding.setLastPriceUpdate(LocalDateTime.now().minusHours(2));

            // Then
            assertThat(stockHolding.isPriceDataStale()).isTrue();
        }

        @Test
        @DisplayName("Should check if price data is fresh")
        void shouldCheckIfPriceDataIsFresh() {
            // Given
            stockHolding.setLastPriceUpdate(LocalDateTime.now().minusMinutes(30));

            // Then
            assertThat(stockHolding.isPriceDataStale()).isFalse();
        }

        @Test
        @DisplayName("Should determine if significant position")
        void shouldDetermineIfSignificantPosition() {
            // Given
            stockHolding.setCurrentValue(new BigDecimal("60000.00"));
            BigDecimal portfolioTotal = new BigDecimal("100000.00");

            // When
            boolean isSignificant = stockHolding.isSignificantPosition(portfolioTotal);

            // Then
            assertThat(isSignificant).isTrue();
        }

        @Test
        @DisplayName("Should add shares to holding")
        void shouldAddSharesToHolding() {
            // Given
            stockHolding.setShares(new BigDecimal("100"));
            stockHolding.setTotalCost(new BigDecimal("10000.00"));
            stockHolding.setAveragePurchasePrice(new BigDecimal("100.00"));

            BigDecimal newShares = new BigDecimal("50");
            BigDecimal purchasePrice = new BigDecimal("120.00");

            // When
            stockHolding.addShares(newShares, purchasePrice);

            // Then
            assertThat(stockHolding.getShares()).isEqualTo(new BigDecimal("150"));
            assertThat(stockHolding.getTotalCost()).isEqualTo(new BigDecimal("16000.00"));
            // Average price should be (10000 + 6000) / 150 = 106.67
            assertThat(stockHolding.getAveragePurchasePrice())
                    .isEqualByComparingTo(new BigDecimal("106.67"));
        }

        @Test
        @DisplayName("Should remove shares from holding")
        void shouldRemoveSharesFromHolding() {
            // Given
            stockHolding.setShares(new BigDecimal("100"));
            stockHolding.setTotalCost(new BigDecimal("10000.00"));
            stockHolding.setAveragePurchasePrice(new BigDecimal("100.00"));

            BigDecimal sharesToSell = new BigDecimal("30");

            // When
            BigDecimal costBasis = stockHolding.removeShares(sharesToSell);

            // Then
            assertThat(stockHolding.getShares()).isEqualTo(new BigDecimal("70"));
            assertThat(stockHolding.getTotalCost()).isEqualTo(new BigDecimal("7000.00"));
            assertThat(costBasis).isEqualTo(new BigDecimal("3000.00"));
        }
    }

    @Nested
    @DisplayName("Validation Tests")
    class ValidationTests {

        @Test
        @DisplayName("Should validate holding with all required fields")
        void shouldValidateHoldingWithAllRequiredFields() {
            // Given
            stockHolding.setPortfolio(portfolio);
            stockHolding.setTickerSymbol("AAPL");
            stockHolding.setShares(new BigDecimal("100"));
            stockHolding.setAveragePurchasePrice(new BigDecimal("150.00"));
            stockHolding.setTotalCost(new BigDecimal("15000.00"));

            // When
            boolean isValid = stockHolding.isValid();

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should fail validation without portfolio")
        void shouldFailValidationWithoutPortfolio() {
            // Given
            stockHolding.setTickerSymbol("AAPL");
            stockHolding.setShares(new BigDecimal("100"));

            // When
            boolean isValid = stockHolding.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should fail validation without ticker symbol")
        void shouldFailValidationWithoutTickerSymbol() {
            // Given
            stockHolding.setPortfolio(portfolio);
            stockHolding.setShares(new BigDecimal("100"));

            // When
            boolean isValid = stockHolding.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should fail validation with negative shares")
        void shouldFailValidationWithNegativeShares() {
            // Given
            stockHolding.setPortfolio(portfolio);
            stockHolding.setTickerSymbol("AAPL");
            stockHolding.setShares(new BigDecimal("-100"));

            // When
            boolean isValid = stockHolding.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should fail validation with invalid ticker format")
        void shouldFailValidationWithInvalidTickerFormat() {
            // Given
            stockHolding.setPortfolio(portfolio);
            stockHolding.setTickerSymbol("INVALID123");
            stockHolding.setShares(new BigDecimal("100"));

            // When
            boolean isValid = stockHolding.isValid();

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
            stockHolding.setId(1L);

            // Then
            assertThat(stockHolding).isEqualTo(stockHolding);
        }

        @Test
        @DisplayName("Should be equal to another holding with same id")
        void shouldBeEqualToAnotherHoldingWithSameId() {
            // Given
            stockHolding.setId(1L);
            StockHolding other = new StockHolding();
            other.setId(1L);

            // Then
            assertThat(stockHolding).isEqualTo(other);
            assertThat(stockHolding.hashCode()).isEqualTo(other.hashCode());
        }

        @Test
        @DisplayName("Should not be equal to holding with different id")
        void shouldNotBeEqualToHoldingWithDifferentId() {
            // Given
            stockHolding.setId(1L);
            StockHolding other = new StockHolding();
            other.setId(2L);

            // Then
            assertThat(stockHolding).isNotEqualTo(other);
        }
    }

    @Nested
    @DisplayName("toString Tests")
    class ToStringTests {

        @Test
        @DisplayName("Should generate meaningful toString")
        void shouldGenerateMeaningfulToString() {
            // Given
            stockHolding.setId(1L);
            stockHolding.setTickerSymbol("AAPL");
            stockHolding.setShares(new BigDecimal("100"));
            stockHolding.setCurrentValue(new BigDecimal("15000.00"));

            // When
            String result = stockHolding.toString();

            // Then
            assertThat(result).contains("StockHolding");
            assertThat(result).contains("id=1");
            assertThat(result).contains("ticker=AAPL");
            assertThat(result).contains("shares=100");
            assertThat(result).contains("value=15000.00");
        }
    }
}
