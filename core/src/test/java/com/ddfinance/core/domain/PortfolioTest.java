package com.ddfinance.core.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for Portfolio entity.
 * Tests portfolio creation, calculations, and business logic.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
class PortfolioTest {

    private Portfolio portfolio;
    private Client client;
    private List<StockHolding> holdings;

    @BeforeEach
    void setUp() {
        portfolio = new Portfolio();

        // Create test client
        client = new Client();
        client.setId(1L);
        client.setClientId("CLI-001");

        // Create test holdings
        holdings = new ArrayList<>();
    }

    @Nested
    @DisplayName("Constructor Tests")
    class ConstructorTests {

        @Test
        @DisplayName("Should create Portfolio with default constructor")
        void shouldCreateWithDefaultConstructor() {
            // When
            Portfolio p = new Portfolio();

            // Then
            assertThat(p).isNotNull();
            assertThat(p.getId()).isNull();
            assertThat(p.getPortfolioName()).isNull();
            assertThat(p.getTotalValue()).isNull();
        }

        @Test
        @DisplayName("Should create Portfolio with client constructor")
        void shouldCreateWithClientConstructor() {
            // When
            Portfolio p = new Portfolio(client);

            // Then
            assertThat(p.getClient()).isEqualTo(client);
            assertThat(p.getPortfolioName()).isEqualTo("Main Portfolio");
            assertThat(p.getIsActive()).isTrue();
            assertThat(p.getTotalValue()).isEqualTo(BigDecimal.ZERO);
            assertThat(p.getTotalCost()).isEqualTo(BigDecimal.ZERO);
            assertThat(p.getRealizedGainLoss()).isEqualTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should create Portfolio with name and client constructor")
        void shouldCreateWithNameAndClientConstructor() {
            // Given
            String name = "Retirement Portfolio";

            // When
            Portfolio p = new Portfolio(name, client);

            // Then
            assertThat(p.getClient()).isEqualTo(client);
            assertThat(p.getPortfolioName()).isEqualTo(name);
            assertThat(p.getIsActive()).isTrue();
        }
    }

    @Nested
    @DisplayName("Property Tests")
    class PropertyTests {

        @Test
        @DisplayName("Should set and get portfolio name")
        void shouldSetAndGetPortfolioName() {
            // Given
            String name = "Growth Portfolio";

            // When
            portfolio.setPortfolioName(name);

            // Then
            assertThat(portfolio.getPortfolioName()).isEqualTo(name);
        }

        @Test
        @DisplayName("Should set and get total value")
        void shouldSetAndGetTotalValue() {
            // Given
            BigDecimal value = new BigDecimal("150000.00");

            // When
            portfolio.setTotalValue(value);

            // Then
            assertThat(portfolio.getTotalValue()).isEqualTo(value);
        }

        @Test
        @DisplayName("Should set and get total cost")
        void shouldSetAndGetTotalCost() {
            // Given
            BigDecimal cost = new BigDecimal("120000.00");

            // When
            portfolio.setTotalCost(cost);

            // Then
            assertThat(portfolio.getTotalCost()).isEqualTo(cost);
        }

        @Test
        @DisplayName("Should set and get cash balance")
        void shouldSetAndGetCashBalance() {
            // Given
            BigDecimal cash = new BigDecimal("5000.00");

            // When
            portfolio.setCashBalance(cash);

            // Then
            assertThat(portfolio.getCashBalance()).isEqualTo(cash);
        }

        @Test
        @DisplayName("Should set and get risk profile")
        void shouldSetAndGetRiskProfile() {
            // Given
            String riskProfile = "MODERATE";

            // When
            portfolio.setRiskProfile(riskProfile);

            // Then
            assertThat(portfolio.getRiskProfile()).isEqualTo(riskProfile);
        }
    }

    @Nested
    @DisplayName("Calculation Tests")
    class CalculationTests {

        @Test
        @DisplayName("Should calculate unrealized gain/loss")
        void shouldCalculateUnrealizedGainLoss() {
            // Given
            portfolio.setTotalValue(new BigDecimal("150000.00"));
            portfolio.setTotalCost(new BigDecimal("120000.00"));

            // When
            BigDecimal gainLoss = portfolio.calculateUnrealizedGainLoss();

            // Then
            assertThat(gainLoss).isEqualTo(new BigDecimal("30000.00"));
        }

        @Test
        @DisplayName("Should calculate total gain/loss")
        void shouldCalculateTotalGainLoss() {
            // Given
            portfolio.setTotalValue(new BigDecimal("150000.00"));
            portfolio.setTotalCost(new BigDecimal("120000.00"));
            portfolio.setRealizedGainLoss(new BigDecimal("5000.00"));

            // When
            BigDecimal totalGainLoss = portfolio.calculateTotalGainLoss();

            // Then
            assertThat(totalGainLoss).isEqualTo(new BigDecimal("35000.00"));
        }

        @Test
        @DisplayName("Should calculate return percentage")
        void shouldCalculateReturnPercentage() {
            // Given
            portfolio.setTotalValue(new BigDecimal("150000.00"));
            portfolio.setTotalCost(new BigDecimal("100000.00"));

            // When
            Double returnPercentage = portfolio.calculateReturnPercentage();

            // Then
            assertThat(returnPercentage).isEqualTo(50.0);
        }

        @Test
        @DisplayName("Should handle zero cost when calculating return percentage")
        void shouldHandleZeroCostWhenCalculatingReturnPercentage() {
            // Given
            portfolio.setTotalValue(new BigDecimal("150000.00"));
            portfolio.setTotalCost(BigDecimal.ZERO);

            // When
            Double returnPercentage = portfolio.calculateReturnPercentage();

            // Then
            assertThat(returnPercentage).isEqualTo(0.0);
        }

        @Test
        @DisplayName("Should calculate total assets")
        void shouldCalculateTotalAssets() {
            // Given
            portfolio.setTotalValue(new BigDecimal("150000.00"));
            portfolio.setCashBalance(new BigDecimal("10000.00"));

            // When
            BigDecimal totalAssets = portfolio.calculateTotalAssets();

            // Then
            assertThat(totalAssets).isEqualTo(new BigDecimal("160000.00"));
        }

        @Test
        @DisplayName("Should calculate investment percentage")
        void shouldCalculateInvestmentPercentage() {
            // Given
            portfolio.setTotalValue(new BigDecimal("150000.00"));
            portfolio.setCashBalance(new BigDecimal("50000.00"));

            // When
            Double investmentPercentage = portfolio.calculateInvestmentPercentage();

            // Then
            assertThat(investmentPercentage).isEqualTo(75.0);
        }

        @Test
        @DisplayName("Should calculate cash percentage")
        void shouldCalculateCashPercentage() {
            // Given
            portfolio.setTotalValue(new BigDecimal("150000.00"));
            portfolio.setCashBalance(new BigDecimal("50000.00"));

            // When
            Double cashPercentage = portfolio.calculateCashPercentage();

            // Then
            assertThat(cashPercentage).isEqualTo(25.0);
        }
    }

    @Nested
    @DisplayName("Holdings Management Tests")
    class HoldingsManagementTests {

        @Test
        @DisplayName("Should add stock holding to portfolio")
        void shouldAddStockHolding() {
            // Given
            StockHolding holding = new StockHolding();
            holding.setTickerSymbol("AAPL");
            holding.setShares(new BigDecimal("100"));

            // When
            portfolio.addHolding(holding);

            // Then
            assertThat(portfolio.getHoldings()).hasSize(1);
            assertThat(portfolio.getHoldings()).contains(holding);
            assertThat(holding.getPortfolio()).isEqualTo(portfolio);
        }

        @Test
        @DisplayName("Should remove stock holding from portfolio")
        void shouldRemoveStockHolding() {
            // Given
            StockHolding holding = new StockHolding();
            holding.setTickerSymbol("AAPL");
            portfolio.addHolding(holding);

            // When
            boolean removed = portfolio.removeHolding(holding);

            // Then
            assertThat(removed).isTrue();
            assertThat(portfolio.getHoldings()).isEmpty();
            assertThat(holding.getPortfolio()).isNull();
        }

        @Test
        @DisplayName("Should count holdings")
        void shouldCountHoldings() {
            // Given
            StockHolding holding1 = new StockHolding();
            holding1.setTickerSymbol("AAPL");
            StockHolding holding2 = new StockHolding();
            holding2.setTickerSymbol("MSFT");

            portfolio.addHolding(holding1);
            portfolio.addHolding(holding2);

            // When
            int count = portfolio.getHoldingsCount();

            // Then
            assertThat(count).isEqualTo(2);
        }

        @Test
        @DisplayName("Should find holding by ticker symbol")
        void shouldFindHoldingByTickerSymbol() {
            // Given
            StockHolding holding = new StockHolding();
            holding.setTickerSymbol("AAPL");
            portfolio.addHolding(holding);

            // When
            StockHolding found = portfolio.findHoldingByTicker("AAPL");

            // Then
            assertThat(found).isEqualTo(holding);
        }

        @Test
        @DisplayName("Should return null when holding not found")
        void shouldReturnNullWhenHoldingNotFound() {
            // When
            StockHolding found = portfolio.findHoldingByTicker("AAPL");

            // Then
            assertThat(found).isNull();
        }
    }

    @Nested
    @DisplayName("Business Logic Tests")
    class BusinessLogicTests {

        @Test
        @DisplayName("Should check if portfolio is active")
        void shouldCheckIfPortfolioIsActive() {
            // Given
            portfolio.setIsActive(true);

            // Then
            assertThat(portfolio.isActive()).isTrue();
        }

        @Test
        @DisplayName("Should check if portfolio has holdings")
        void shouldCheckIfPortfolioHasHoldings() {
            // Given
            StockHolding holding = new StockHolding();
            portfolio.addHolding(holding);

            // Then
            assertThat(portfolio.hasHoldings()).isTrue();
        }

        @Test
        @DisplayName("Should check if portfolio is empty")
        void shouldCheckIfPortfolioIsEmpty() {
            // Then
            assertThat(portfolio.hasHoldings()).isFalse();
        }

        @Test
        @DisplayName("Should check if portfolio is profitable")
        void shouldCheckIfPortfolioIsProfitable() {
            // Given
            portfolio.setTotalValue(new BigDecimal("150000.00"));
            portfolio.setTotalCost(new BigDecimal("120000.00"));

            // Then
            assertThat(portfolio.isProfitable()).isTrue();
        }

        @Test
        @DisplayName("Should check if portfolio is at loss")
        void shouldCheckIfPortfolioIsAtLoss() {
            // Given
            portfolio.setTotalValue(new BigDecimal("90000.00"));
            portfolio.setTotalCost(new BigDecimal("120000.00"));

            // Then
            assertThat(portfolio.isProfitable()).isFalse();
        }

        @Test
        @DisplayName("Should determine portfolio risk level")
        void shouldDeterminePortfolioRiskLevel() {
            // Given
            portfolio.setRiskProfile("AGGRESSIVE");

            // Then
            assertThat(portfolio.isHighRisk()).isTrue();
            assertThat(portfolio.isLowRisk()).isFalse();
        }

        @Test
        @DisplayName("Should update last calculated date")
        void shouldUpdateLastCalculatedDate() {
            // Given
            LocalDateTime before = LocalDateTime.now().minusMinutes(1);

            // When
            portfolio.updateCalculations();

            // Then
            assertThat(portfolio.getLastCalculated()).isAfter(before);
        }
    }

    @Nested
    @DisplayName("Validation Tests")
    class ValidationTests {

        @Test
        @DisplayName("Should validate portfolio with all required fields")
        void shouldValidatePortfolioWithAllRequiredFields() {
            // Given
            portfolio.setClient(client);
            portfolio.setPortfolioName("Test Portfolio");
            portfolio.setTotalValue(new BigDecimal("100000.00"));
            portfolio.setTotalCost(new BigDecimal("80000.00"));

            // When
            boolean isValid = portfolio.isValid();

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should fail validation without client")
        void shouldFailValidationWithoutClient() {
            // Given
            portfolio.setPortfolioName("Test Portfolio");
            portfolio.setTotalValue(new BigDecimal("100000.00"));

            // When
            boolean isValid = portfolio.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should fail validation without name")
        void shouldFailValidationWithoutName() {
            // Given
            portfolio.setClient(client);
            portfolio.setTotalValue(new BigDecimal("100000.00"));

            // When
            boolean isValid = portfolio.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should fail validation with negative values")
        void shouldFailValidationWithNegativeValues() {
            // Given
            portfolio.setClient(client);
            portfolio.setPortfolioName("Test Portfolio");
            portfolio.setTotalValue(new BigDecimal("-100000.00"));

            // When
            boolean isValid = portfolio.isValid();

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
            portfolio.setId(1L);

            // Then
            assertThat(portfolio).isEqualTo(portfolio);
        }

        @Test
        @DisplayName("Should be equal to another portfolio with same id")
        void shouldBeEqualToAnotherPortfolioWithSameId() {
            // Given
            portfolio.setId(1L);
            Portfolio other = new Portfolio();
            other.setId(1L);

            // Then
            assertThat(portfolio).isEqualTo(other);
            assertThat(portfolio.hashCode()).isEqualTo(other.hashCode());
        }

        @Test
        @DisplayName("Should not be equal to portfolio with different id")
        void shouldNotBeEqualToPortfolioWithDifferentId() {
            // Given
            portfolio.setId(1L);
            Portfolio other = new Portfolio();
            other.setId(2L);

            // Then
            assertThat(portfolio).isNotEqualTo(other);
        }
    }

    @Nested
    @DisplayName("toString Tests")
    class ToStringTests {

        @Test
        @DisplayName("Should generate meaningful toString")
        void shouldGenerateMeaningfulToString() {
            // Given
            portfolio.setId(1L);
            portfolio.setPortfolioName("Growth Portfolio");
            portfolio.setTotalValue(new BigDecimal("150000.00"));
            portfolio.setIsActive(true);

            // When
            String result = portfolio.toString();

            // Then
            assertThat(result).contains("Portfolio");
            assertThat(result).contains("id=1");
            assertThat(result).contains("name=Growth Portfolio");
            assertThat(result).contains("value=150000.00");
            assertThat(result).contains("active=true");
        }
    }
}
